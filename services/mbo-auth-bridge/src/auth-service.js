/**
 * Authentication Domain Service (Auth Bridge)
 * Handles Password Verification, Lockout Enforcement (5 attempts -> 15 mins), Session Issuance, Password Changes.
 */

import { CryptoUtil } from './crypto-util.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export class AuthService {
  constructor(options = {}) {
    this.repository = options.repository;
    this.sessionService = options.sessionService;
    this.ticketService = options.ticketService;
  }

  /**
   * Authenticates an employee by code & password.
   */
  async login({ employeeCode, password, kintoneUserCode = '', now = new Date() }) {
    if (!employeeCode || typeof employeeCode !== 'string' || !password || typeof password !== 'string') {
      return { status: 'INVALID_CREDENTIALS', reason: 'Missing credentials.' };
    }

    const cleanCode = employeeCode.trim();
    let credential;
    try {
      credential = await this.repository.getCredential(cleanCode);
    } catch (err) {
      if (err.message?.includes('DUPLICATE_IDENTITY_RECORD') || err.message?.includes('MALFORMED_CREDENTIAL_RECORD')) {
        return { status: 'AUTH_SERVICE_UNAVAILABLE', reason: err.message };
      }
      return { status: 'INVALID_CREDENTIALS', reason: 'Invalid credentials.' };
    }

    if (!credential) {
      return { status: 'INVALID_CREDENTIALS', reason: 'Invalid credentials.' };
    }

    // Check account status: DISABLED
    if (credential.Account_Status === 'DISABLED') {
      return { status: 'ACCOUNT_DISABLED', reason: 'Account is disabled.' };
    }

    // Check account status: LOCKED or Locked_Until active
    if (credential.Account_Status === 'LOCKED' || credential.Locked_Until) {
      if (credential.Locked_Until) {
        const lockedTime = new Date(credential.Locked_Until).getTime();
        if (!isNaN(lockedTime) && now.getTime() < lockedTime) {
          return { status: 'ACCOUNT_LOCKED', reason: 'Account is locked due to multiple failed login attempts.' };
        }
      } else if (credential.Account_Status === 'LOCKED') {
        return { status: 'ACCOUNT_LOCKED', reason: 'Account is locked.' };
      }
    }

    // Verify password
    const isPasswordValid = await CryptoUtil.verifyPassword(password, credential.Password_Hash);

    if (!isPasswordValid) {
      const newFailedCount = (credential.Failed_Login_Count || 0) + 1;
      const patch = { Failed_Login_Count: newFailedCount };

      if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
        patch.Account_Status = 'LOCKED';
        patch.Locked_Until = new Date(now.getTime() + LOCKOUT_DURATION_MS).toISOString();
        await this.repository.updateCredential(cleanCode, patch);
        return { status: 'ACCOUNT_LOCKED', reason: 'Account locked due to 5 consecutive failed login attempts.' };
      }

      await this.repository.updateCredential(cleanCode, patch);
      return { status: 'INVALID_CREDENTIALS', reason: 'Invalid credentials.' };
    }

    // Password valid -> reset lockout counter & update Last_Login_At
    const patch = {
      Failed_Login_Count: 0,
      Locked_Until: null,
      Account_Status: 'ACTIVE',
      Last_Login_At: now.toISOString()
    };
    await this.repository.updateCredential(cleanCode, patch);

    // Check Force Password Change requirement
    if (credential.Must_Change_Password) {
      const forceTicket = this.ticketService.issueForceTicket(
        cleanCode,
        credential.Credential_Version,
        now
      );
      return {
        status: 'PASSWORD_CHANGE_REQUIRED',
        employeeCode: cleanCode,
        forceTicket
      };
    }

    // Normal successful login -> issue session token
    const sessionRes = await this.sessionService.createSession(cleanCode, kintoneUserCode, now);
    return {
      status: 'AUTHENTICATED',
      employeeCode: cleanCode,
      sessionToken: sessionRes.sessionToken,
      expiresAt: sessionRes.expiresAt
    };
  }

  /**
   * Resolves a Force Password Change requirement using a valid force ticket.
   */
  async forcePasswordChange({ forceTicket, employeeCode, newPassword, kintoneUserCode = '', now = new Date() }) {
    if (!forceTicket || !employeeCode || !newPassword) {
      return { status: 'INVALID_PARAMETERS', reason: 'forceTicket, employeeCode, and newPassword are required.' };
    }

    const cleanCode = employeeCode.trim();
    const credential = await this.repository.getCredential(cleanCode);
    if (!credential) {
      return { status: 'INVALID_CREDENTIALS', reason: 'Account not found.' };
    }

    // Verify force ticket
    const ticketCheck = this.ticketService.verifyForceTicket(
      forceTicket,
      cleanCode,
      credential.Credential_Version,
      now
    );

    if (!ticketCheck.valid) {
      return { status: 'INVALID_SESSION', reason: ticketCheck.reason };
    }

    // Hash new password and increment Credential_Version
    const newHash = await CryptoUtil.hashPassword(newPassword);
    const newVersion = (credential.Credential_Version || 1) + 1;

    await this.repository.updateCredential(cleanCode, {
      Password_Hash: newHash,
      Must_Change_Password: false,
      Credential_Version: newVersion,
      Failed_Login_Count: 0,
      Locked_Until: null,
      Account_Status: 'ACTIVE'
    });

    // Issue new session
    const sessionRes = await this.sessionService.createSession(cleanCode, kintoneUserCode, now);
    return {
      status: 'AUTHENTICATED',
      employeeCode: cleanCode,
      sessionToken: sessionRes.sessionToken,
      expiresAt: sessionRes.expiresAt
    };
  }

  /**
   * Performs a normal password change for an authenticated session.
   */
  async changePassword({ sessionToken, employeeCode, currentPassword, newPassword, kintoneUserCode = '', now = new Date() }) {
    if (!sessionToken || !employeeCode || !currentPassword || !newPassword) {
      return { status: 'INVALID_PARAMETERS', reason: 'Missing parameters for password change.' };
    }

    const cleanCode = employeeCode.trim();

    // Validate active session
    const sessionCheck = await this.sessionService.validateSession(sessionToken, cleanCode, kintoneUserCode, now);
    if (!sessionCheck.valid) {
      return { status: 'INVALID_SESSION', reason: sessionCheck.reason };
    }

    const credential = await this.repository.getCredential(cleanCode);
    if (!credential) {
      return { status: 'INVALID_CREDENTIALS', reason: 'Account not found.' };
    }

    // Verify current password
    const isCurrentValid = await CryptoUtil.verifyPassword(currentPassword, credential.Password_Hash);
    if (!isCurrentValid) {
      return { status: 'INVALID_CREDENTIALS', reason: 'Current password verification failed.' };
    }

    // Hash new password & increment Credential_Version
    const newHash = await CryptoUtil.hashPassword(newPassword);
    const newVersion = (credential.Credential_Version || 1) + 1;

    await this.repository.updateCredential(cleanCode, {
      Password_Hash: newHash,
      Must_Change_Password: false,
      Credential_Version: newVersion
    });

    // Rotate session: issue new session token
    const newSessionRes = await this.sessionService.createSession(cleanCode, kintoneUserCode, now);
    return {
      status: 'AUTHENTICATED',
      employeeCode: cleanCode,
      sessionToken: newSessionRes.sessionToken,
      expiresAt: newSessionRes.expiresAt
    };
  }

  /**
   * Logs out an employee session.
   */
  async logout({ employeeCode }) {
    if (!employeeCode) {
      return { status: 'INVALID_PARAMETERS', reason: 'employeeCode is required.' };
    }
    await this.sessionService.revokeSession(employeeCode);
    return { status: 'LOGGED_OUT' };
  }
}
