/**
 * Server-Side Opaque Session Service (Auth Bridge)
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
  async createSession(employeeCode, kintoneUserCode = '', now = new Date()) {
    if (!employeeCode) {
      throw new Error('INVALID_ARGUMENT: employeeCode is required to create session.');
    }
    const cleanCode = employeeCode.trim();

    const credential = await this.repository.getCredential(cleanCode);
    if (!credential) {
      throw new Error(`CREDENTIAL_NOT_FOUND: Cannot create session for non-existent Employee_Code '${cleanCode}'.`);
    }

    const rawToken = CryptoUtil.generateSessionToken();
    const tokenHash = CryptoUtil.hashToken(rawToken);
    const expiresAtIso = new Date(now.getTime() + SESSION_TTL_MS).toISOString();

    await this.repository.updateCredential(cleanCode, {
      Session_Token_Hash: tokenHash,
      Session_Expires_At: expiresAtIso,
      Session_Kintone_User_Code: kintoneUserCode || null
    });

    return {
      sessionToken: rawToken,
      expiresAt: expiresAtIso,
      employeeCode: cleanCode
    };
  }

  /**
   * Validates an opaque session token.
   * Checks Account_Status, Must_Change_Password, Expiration, Token Hash, and Credential_Version.
   */
  async validateSession(rawToken, employeeCode, kintoneUserCode = '', now = new Date()) {
    if (!rawToken || typeof rawToken !== 'string' || !employeeCode || typeof employeeCode !== 'string') {
      return { valid: false, reason: 'INVALID_SESSION_PARAMETERS' };
    }

    const cleanCode = employeeCode.trim();
    const credential = await this.repository.getCredential(cleanCode);
    if (!credential) {
      return { valid: false, reason: 'ACCOUNT_NOT_FOUND' };
    }

    if (credential.Account_Status !== 'ACTIVE') {
      return { valid: false, reason: 'ACCOUNT_NOT_ACTIVE', status: credential.Account_Status };
    }

    if (credential.Must_Change_Password) {
      return { valid: false, reason: 'PASSWORD_CHANGE_REQUIRED' };
    }

    const tokenHash = CryptoUtil.hashToken(rawToken);
    if (!credential.Session_Token_Hash || credential.Session_Token_Hash !== tokenHash) {
      return { valid: false, reason: 'SESSION_TOKEN_MISMATCH' };
    }

    if (!credential.Session_Expires_At) {
      return { valid: false, reason: 'SESSION_EXPIRED' };
    }

    const expiresAtTime = new Date(credential.Session_Expires_At).getTime();
    if (isNaN(expiresAtTime) || now.getTime() > expiresAtTime) {
      return { valid: false, reason: 'SESSION_EXPIRED' };
    }

    if (kintoneUserCode && credential.Session_Kintone_User_Code) {
      if (credential.Session_Kintone_User_Code !== kintoneUserCode) {
        return { valid: false, reason: 'KINTONE_CONTEXT_MISMATCH' };
      }
    }

    return {
      valid: true,
      employeeCode: cleanCode,
      credentialVersion: credential.Credential_Version,
      expiresAt: credential.Session_Expires_At
    };
  }

  /**
   * Revokes an active session.
   */
  async revokeSession(employeeCode) {
    if (!employeeCode || typeof employeeCode !== 'string') {
      return { success: false, reason: 'INVALID_ARGUMENT' };
    }
    const cleanCode = employeeCode.trim();

    await this.repository.updateCredential(cleanCode, {
      Session_Token_Hash: null,
      Session_Expires_At: null,
      Session_Kintone_User_Code: null
    });

    return { success: true, employeeCode: cleanCode };
  }
}
