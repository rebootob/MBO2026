/**
 * Server-Side Opaque Session Service (Auth Bridge)
 * Resolves Employee_Code server-side from Session_Token_Hash.
 * 8-hour absolute TTL, single active session per Employee_Code, Credential_Version binding.
 */

import { CryptoUtil } from './crypto-util.js';

const SESSION_TTL_MS = 8 * 3600 * 1000; // 8 hours absolute TTL

export class SessionService {
  constructor(options = {}) {
    this.repository = options.repository;
  }

  /**
   * Issues a new 256-bit opaque session token for an employee.
   * Overwrites any prior Session_Token_Hash to enforce single active session per Employee_Code.
   */
  async createSession(employeeCode, kintoneUser = '', credentialVersion = 1, now = new Date()) {
    if (!employeeCode) {
      throw new Error('INVALID_ARGUMENT: employeeCode is required to create session.');
    }

    const credential = await this.repository.getCredential(employeeCode);
    if (!credential) {
      throw new Error(`CREDENTIAL_NOT_FOUND: Cannot create session for non-existent Employee_Code '${employeeCode}'.`);
    }

    const rawToken = CryptoUtil.generateSessionToken();
    const tokenHash = CryptoUtil.hashToken(rawToken);
    const issuedAtIso = now.toISOString();
    const expiresAtIso = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
    const currentVersion = Number(credentialVersion || credential.Credential_Version || 1);

    await this.repository.updateCredential(credential.Employee_Code, {
      Session_Token_Hash: tokenHash,
      Session_Issued_At: issuedAtIso,
      Session_Expires_At: expiresAtIso,
      Session_Credential_Version: currentVersion,
      Session_Kintone_User: kintoneUser || null
    });

    return {
      sessionToken: rawToken,
      expiresAt: expiresAtIso,
      employeeCode: credential.Employee_Code
    };
  }

  /**
   * Validates an opaque session token by resolving identity server-side from token hash.
   * DO NOT trust client-supplied Employee_Code!
   */
  async validateSession(rawToken, kintoneUser = '', now = new Date()) {
    if (!rawToken || typeof rawToken !== 'string' || rawToken.trim() === '') {
      return { valid: false, status: 'INVALID_SESSION', reason: 'MISSING_SESSION_TOKEN' };
    }

    const tokenHash = CryptoUtil.hashToken(rawToken.trim());
    let credential;
    try {
      credential = await this.repository.getCredentialBySessionTokenHash(tokenHash);
    } catch (err) {
      return { valid: false, status: 'INVALID_SESSION', reason: 'DATABASE_LOOKUP_FAILED' };
    }

    if (!credential) {
      return { valid: false, status: 'INVALID_SESSION', reason: 'SESSION_NOT_FOUND' };
    }

    // Account status check
    if (credential.Account_Status === 'DISABLED') {
      return { valid: false, status: 'INVALID_SESSION', reason: 'ACCOUNT_DISABLED' };
    }
    if (credential.Account_Status === 'LOCKED') {
      return { valid: false, status: 'INVALID_SESSION', reason: 'ACCOUNT_LOCKED' };
    }
    if (credential.Locked_Until) {
      const lockedTime = new Date(credential.Locked_Until).getTime();
      if (!isNaN(lockedTime) && now.getTime() < lockedTime) {
        return { valid: false, status: 'INVALID_SESSION', reason: 'ACCOUNT_LOCKED' };
      }
    }

    // Must change password check
    if (credential.Must_Change_Password) {
      return { valid: false, status: 'INVALID_SESSION', reason: 'PASSWORD_CHANGE_REQUIRED' };
    }

    // Expiration check
    if (!credential.Session_Expires_At) {
      return { valid: false, status: 'INVALID_SESSION', reason: 'SESSION_EXPIRED' };
    }
    const expiresAtTime = new Date(credential.Session_Expires_At).getTime();
    if (isNaN(expiresAtTime) || now.getTime() > expiresAtTime) {
      return { valid: false, status: 'INVALID_SESSION', reason: 'SESSION_EXPIRED' };
    }

    // Session Credential Version match check
    if (credential.Session_Credential_Version !== credential.Credential_Version) {
      return { valid: false, status: 'INVALID_SESSION', reason: 'CREDENTIAL_VERSION_MISMATCH' };
    }

    // Kintone context check
    if (kintoneUser && credential.Session_Kintone_User) {
      if (credential.Session_Kintone_User !== kintoneUser) {
        return { valid: false, status: 'INVALID_SESSION', reason: 'KINTONE_CONTEXT_MISMATCH' };
      }
    }

    return {
      valid: true,
      status: 'AUTHENTICATED',
      employeeCode: credential.Employee_Code,
      credentialVersion: credential.Credential_Version,
      expiresAt: credential.Session_Expires_At
    };
  }

  /**
   * Revokes an active session by token hash.
   */
  async revokeSession(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') {
      return { success: true };
    }

    const tokenHash = CryptoUtil.hashToken(rawToken.trim());
    let credential;
    try {
      credential = await this.repository.getCredentialBySessionTokenHash(tokenHash);
    } catch {
      return { success: true };
    }

    if (!credential) {
      return { success: true };
    }

    await this.repository.updateCredential(credential.Employee_Code, {
      Session_Token_Hash: null,
      Session_Issued_At: null,
      Session_Expires_At: null,
      Session_Credential_Version: null,
      Session_Kintone_User: null
    });

    return { success: true, employeeCode: credential.Employee_Code };
  }
}
