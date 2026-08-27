/**
 * MBO One-Time HR Activation Code Service (D1-C3A)
 *
 * Handles first-login identity activation codes for bootstrap logins.
 * Security Boundary Notice:
 * - Plaintext activation codes are returned ONLY at issuance time to trusted callers.
 * - Persistent storage uses SHA-256 Activation_Code_Hash only.
 * - Uses constant-time comparison to prevent timing attacks.
 * - One-time use and strict expiration check.
 */

import crypto from 'node:crypto';

export class MboActivationService {
  /**
   * Hashes a raw activation code to SHA-256.
   */
  static hashActivationCode(code) {
    if (!code || typeof code !== 'string') return '';
    return crypto.createHash('sha256').update(code.trim()).digest('hex');
  }

  /**
   * Generates a cryptographically secure random activation code and stored metadata.
   */
  static generateActivation({ employeeCode, now = new Date(), ttlHours = 24 }) {
    if (!employeeCode || typeof employeeCode !== 'string' || employeeCode.trim() === '') {
      throw new Error('INVALID_ARGUMENT: employeeCode is required.');
    }

    const cleanEmpCode = employeeCode.trim();
    // Generate 8 random bytes => 16 uppercase hex characters (64 bits entropy)
    const rawBytes = crypto.randomBytes(8);
    const plaintextCode = rawBytes.toString('hex').toUpperCase();
    const activationCodeHash = this.hashActivationCode(plaintextCode);
    const expiresAt = new Date(now.getTime() + ttlHours * 3600 * 1000).toISOString();

    return {
      employeeCode: cleanEmpCode,
      activationCode: plaintextCode, // Plaintext returned ONLY at issuance
      record: {
        Employee_Code: cleanEmpCode,
        Activation_Code_Hash: activationCodeHash,
        Activation_Expires_At: expiresAt,
        Activation_Used_At: null
      }
    };
  }

  /**
   * Verifies an input activation code against a stored activation record.
   */
  static verifyActivation({ activationRecord, inputCode, now = new Date() }) {
    if (!activationRecord || typeof activationRecord !== 'object') {
      return {
        status: 'ACTIVATION_RECORD_MISSING',
        reason: 'Activation record missing or malformed.'
      };
    }

    if (!inputCode || typeof inputCode !== 'string' || inputCode.trim() === '') {
      return {
        status: 'ACTIVATION_CODE_REQUIRED',
        reason: 'Activation code is required.'
      };
    }

    const cleanInputCode = inputCode.trim();

    if (activationRecord.activationUsedAt || activationRecord.Activation_Used_At) {
      return {
        status: 'ACTIVATION_ALREADY_USED',
        reason: 'Activation code has already been used.'
      };
    }

    const expiresAtStr = activationRecord.activationExpiresAt || activationRecord.Activation_Expires_At;
    if (!expiresAtStr || typeof expiresAtStr !== 'string') {
      return {
        status: 'ACTIVATION_EXPIRED',
        reason: 'Activation expiration date is missing or invalid.'
      };
    }

    const expTime = new Date(expiresAtStr);
    if (isNaN(expTime.getTime()) || expTime <= now) {
      return {
        status: 'ACTIVATION_EXPIRED',
        reason: 'Activation code has expired.'
      };
    }

    const storedHash = activationRecord.activationCodeHash || activationRecord.Activation_Code_Hash;
    if (!storedHash || typeof storedHash !== 'string') {
      return {
        status: 'ACTIVATION_RECORD_MISSING',
        reason: 'Stored activation code hash is missing.'
      };
    }

    const computedHash = this.hashActivationCode(cleanInputCode);

    const storedBuffer = Buffer.from(storedHash, 'hex');
    const computedBuffer = Buffer.from(computedHash, 'hex');

    if (storedBuffer.length !== computedBuffer.length || !crypto.timingSafeEqual(storedBuffer, computedBuffer)) {
      return {
        status: 'INVALID_ACTIVATION_CODE',
        reason: 'Invalid activation code.'
      };
    }

    return {
      status: 'ACTIVATION_VALIDATED',
      employeeCode: activationRecord.employeeCode || activationRecord.Employee_Code
    };
  }
}
