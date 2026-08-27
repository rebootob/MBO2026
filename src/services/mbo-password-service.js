/**
 * MBO Password Domain Service — Reusable password lifecycle domain rules
 * Handles provisioning, password hashing specification, force-change state,
 * password change, password expiry, failed attempt tracking, and HR reset.
 */

import crypto from 'node:crypto';

export class MboPasswordDomainService {
  /**
   * Generates a secure salt and PBKDF2 password hash.
   * Plaintext passwords are NEVER returned or stored in credential records.
   */
  static hashPassword(password, saltHex = null) {
    if (typeof password !== 'string' || password === '') {
      throw new Error('Password must be a non-empty string.');
    }
    const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    return `pbkdf2$100000$${salt.toString('hex')}$${hash.toString('hex')}`;
  }

  /**
   * Verifies password against stored hash using constant-time comparison.
   */
  static verifyPassword(password, storedHash) {
    if (typeof password !== 'string' || typeof storedHash !== 'string') return false;
    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
    const iterations = parseInt(parts[1], 10);
    const salt = Buffer.from(parts[2], 'hex');
    const expectedHash = Buffer.from(parts[3], 'hex');
    const computedHash = crypto.pbkdf2Sync(password, salt, iterations, expectedHash.length, 'sha256');
    return crypto.timingSafeEqual(expectedHash, computedHash);
  }

  /**
   * Provision initial credential record for an employee.
   * Initial password = Employee_Code.
   * Immediately converted to Password_Hash; plaintext is NEVER persisted or returned.
   */
  static provisionInitialCredential({ employeeCode, kintoneUserCode }) {
    if (!employeeCode || typeof employeeCode !== 'string' || employeeCode.trim() === '') {
      throw new Error('employeeCode is required.');
    }
    const cleanEmpCode = employeeCode.trim();
    const hash = this.hashPassword(cleanEmpCode);

    return {
      Employee_Code: cleanEmpCode,
      Kintone_User_Code: kintoneUserCode ? kintoneUserCode.trim() : '',
      Password_Hash: hash,
      Must_Change_Password: true,
      Password_Changed_At: null,
      Password_Expires_At: null,
      Failed_Login_Count: 0,
      Locked_Until: null,
      Account_Status: 'ACTIVE'
    };
  }

  /**
   * Evaluates credential state on login attempt.
   */
  static evaluateCredentialState({ credentialRecord, inputPassword, now = new Date(), maxFailedAttempts = 5, lockDurationMinutes = 15 }) {
    if (!credentialRecord || typeof credentialRecord !== 'object') {
      return { status: 'INVALID_CREDENTIALS' };
    }

    if (credentialRecord.Account_Status === 'DISABLED') {
      return { status: 'ACCOUNT_DISABLED', reason: 'Account is disabled.' };
    }

    if (credentialRecord.Locked_Until) {
      const lockTime = new Date(credentialRecord.Locked_Until);
      if (lockTime > now) {
        return { status: 'ACCOUNT_LOCKED', lockedUntil: credentialRecord.Locked_Until, reason: 'Account is locked.' };
      }
    }

    const isValid = this.verifyPassword(inputPassword, credentialRecord.Password_Hash);
    if (!isValid) {
      const currentFailed = (credentialRecord.Failed_Login_Count || 0) + 1;
      const shouldLock = currentFailed >= maxFailedAttempts;
      const lockedUntil = shouldLock ? new Date(now.getTime() + lockDurationMinutes * 60000).toISOString() : null;

      return {
        status: 'INVALID_CREDENTIALS',
        failedLoginCount: currentFailed,
        isLocked: shouldLock,
        lockedUntil
      };
    }

    if (credentialRecord.Must_Change_Password === true) {
      return {
        status: 'AUTHENTICATED_BUT_PASSWORD_CHANGE_REQUIRED',
        employeeCode: credentialRecord.Employee_Code,
        requiresPasswordChange: true
      };
    }

    if (credentialRecord.Password_Expires_At) {
      const expiryTime = new Date(credentialRecord.Password_Expires_At);
      if (expiryTime <= now) {
        return {
          status: 'PASSWORD_EXPIRED',
          employeeCode: credentialRecord.Employee_Code,
          requiresPasswordChange: true,
          reason: 'Password has expired.'
        };
      }
    }

    return {
      status: 'AUTHENTICATED_SUCCESS',
      employeeCode: credentialRecord.Employee_Code
    };
  }

  /**
   * Executes password change.
   * Updates Password_Hash, clears Must_Change_Password, resets failed count & lock, sets expiry.
   */
  static changePassword({ credentialRecord, newPassword, expiryDays = 90, now = new Date() }) {
    if (!credentialRecord || typeof credentialRecord !== 'object') {
      throw new Error('credentialRecord is required.');
    }
    const newHash = this.hashPassword(newPassword);
    const expiresAt = new Date(now.getTime() + expiryDays * 86400000).toISOString();

    return {
      ...credentialRecord,
      Password_Hash: newHash,
      Must_Change_Password: false,
      Password_Changed_At: now.toISOString(),
      Password_Expires_At: expiresAt,
      Failed_Login_Count: 0,
      Locked_Until: null
    };
  }

  /**
   * Executes HR password reset.
   * Temporary password = Employee_Code.
   * Must_Change_Password = true, clears failed count & lock.
   * Does NOT reveal old password.
   */
  static hrResetPassword({ credentialRecord }) {
    if (!credentialRecord || !credentialRecord.Employee_Code) {
      throw new Error('credentialRecord with Employee_Code is required.');
    }
    const empCode = credentialRecord.Employee_Code.trim();
    const newHash = this.hashPassword(empCode);

    return {
      ...credentialRecord,
      Password_Hash: newHash,
      Must_Change_Password: true,
      Password_Changed_At: null,
      Password_Expires_At: null,
      Failed_Login_Count: 0,
      Locked_Until: null
    };
  }
}
