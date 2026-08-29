/**
 * Authentication Domain Service (Auth Bridge)
 * Handles Password Verification, Lockout Enforcement (5 attempts -> 15 mins via Locked_Until), Session Issuance & Rotation.
 */

import { CryptoUtil } from './crypto-util.js';
import { validateEmployeeCode } from './app801-repository.js';

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
  async login({ employeeCode, password, kintoneUser = '', now = new Date() }) {
    if (!employeeCode || !password || typeof password !== 'string') {
      return { status: 'INVALID_CREDENTIALS', reason: 'Missing credentials.' };
    }

    let cleanCode;
    try {
      cleanCode = validateEmployeeCode(employeeCode);
    } catch {
      return { status: 'INVALID_CREDENTIALS', reason: 'Invalid employee code format.' };
    }

    let credential;
    try {
      credential = await this.repository.getCredential(cleanCode);
    } catch (err) {
      return { status: 'AUTH_SERVICE_UNAVAILABLE', reason: 'Authentication database lookup failed.' };
    }

    if (!credential) {
      return { status: 'INVALID_CREDENTIALS', reason: 'Invalid credentials.' };
    }

    // Check permanent account status: DISABLED
    if (credential.Account_Status === 'DISABLED') {
      return { status: 'ACCOUNT_DISABLED', reason: 'Account is disabled.' };
    }

    // Check permanent account status: LOCKED
    if (credential.Account_Status === 'LOCKED') {
      return { status: 'ACCOUNT_LOCKED', reason: 'Account is permanently locked.' };
    }

    // Check temporary lockout via Locked_Until
    if (credential.Locked_Until) {
      const lockedTime = new Date(credential.Locked_Until).getTime();
      if (!isNaN(lockedTime) && now.getTime() < lockedTime) {
        return { status: 'ACCOUNT_LOCKED', reason: 'Account is temporarily locked due to multiple failed attempts.' };
      }
    }

    // Verify password
    const isPasswordValid = await CryptoUtil.verifyPassword(password, credential.Password_Hash);

    if (!isPasswordValid) {
      const newFailedCount = (credential.Failed_Login_Count || 0) + 1;
      const patch = { Failed_Login_Count: newFailedCount };

      if (newFailedCount >= MAX_FAILED_ATTEMPTS) {
        // Set temporary Locked_Until without overwriting permanent Account_Status!
        patch.Locked_Until = new Date(now.getTime() + LOCKOUT_DURATION_MS).toISOString();
        await this.repository.updateCredential(cleanCode, patch);
        return { status: 'ACCOUNT_LOCKED', reason: 'Account locked due to 5 consecutive failed login attempts.' };
      }

      await this.repository.updateCredential(cleanCode, patch);
      return { status: 'INVALID_CREDENTIALS', reason: 'Invalid credentials.' };
    }

    // Password valid -> reset lockout counter & update Last_Login_At (keep Account_Status unchanged)
    const patch = {
      Failed_Login_Count: 0,
      Locked_Until: null,
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
    const sessionRes = await this.sessionService.createSession(
      cleanCode,
      kintoneUser,
      credential.Credential_Version,
      now
    );
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
  async forcePasswordChange({ forceTicket, newPassword, kintoneUser = '', now = new Date() }) {
    if (!forceTicket || !newPassword || typeof newPassword !== 'string') {
      return { status: 'INVALID_PARAMETERS', reason: 'forceTicket and newPassword are required.' };
    }

    // 1. Verify force ticket -> resolves employeeCode and credentialVersion
    const ticketCheck = this.ticketService.verifyForceTicket(forceTicket, null, null, now);
    if (!ticketCheck.valid) {
      return { status: 'INVALID_TICKET', reason: ticketCheck.reason };
    }

    const cleanCode = ticketCheck.employeeCode;
    let credential;
    try {
      credential = await this.repository.getCredential(cleanCode);
    } catch {
      return { status: 'AUTH_SERVICE_UNAVAILABLE', reason: 'Database error.' };
    }

    if (!credential) {
      return { status: 'INVALID_CREDENTIALS', reason: 'Account not found.' };
    }

    // Must NOT re-enable DISABLED or LOCKED accounts!
    if (credential.Account_Status === 'DISABLED') {
      return { status: 'ACCOUNT_DISABLED', reason: 'Cannot change password for disabled account.' };
    }
    if (credential.Account_Status === 'LOCKED') {
      return { status: 'ACCOUNT_LOCKED', reason: 'Cannot change password for locked account.' };
    }
    if (credential.Locked_Until) {
      const lockedTime = new Date(credential.Locked_Until).getTime();
      if (!isNaN(lockedTime) && now.getTime() < lockedTime) {
        return { status: 'ACCOUNT_LOCKED', reason: 'Cannot change password while account is locked.' };
      }
    }

    // Verify Credential_Version match
    if (credential.Credential_Version !== ticketCheck.credentialVersion) {
      return { status: 'INVALID_TICKET', reason: 'CREDENTIAL_VERSION_MISMATCH' };
    }

    if (!credential.Must_Change_Password) {
      return { status: 'INVALID_TICKET', reason: 'PASSWORD_CHANGE_NOT_REQUIRED' };
    }

    // Hash new password & increment Credential_Version
    const newHash = await CryptoUtil.hashPassword(newPassword);
    const newVersion = credential.Credential_Version + 1;

    await this.repository.updateCredential(cleanCode, {
      Password_Hash: newHash,
      Must_Change_Password: false,
      Credential_Version: newVersion,
      Failed_Login_Count: 0,
      Locked_Until: null
    });

    // Revoke old session & issue replacement session
    const sessionRes = await this.sessionService.createSession(cleanCode, kintoneUser, newVersion, now);
    return {
      status: 'AUTHENTICATED',
      employeeCode: cleanCode,
      sessionToken: sessionRes.sessionToken,
      expiresAt: sessionRes.expiresAt
    };
  }

  /**
   * Performs a normal password change for an authenticated session.
   * Derives employee identity from sessionToken server-side.
   */
  async changePassword({ sessionToken, currentPassword, newPassword, kintoneUser = '', now = new Date() }) {
    if (!sessionToken || !currentPassword || !newPassword) {
      return { status: 'INVALID_PARAMETERS', reason: 'sessionToken, currentPassword, and newPassword are required.' };
    }

    // Derive identity from session token server-side
    const sessionCheck = await this.sessionService.validateSession(sessionToken, kintoneUser, now);
    if (!sessionCheck.valid) {
      return { status: 'INVALID_SESSION', reason: sessionCheck.reason };
    }

    const cleanCode = sessionCheck.employeeCode;
    let credential;
    try {
      credential = await this.repository.getCredential(cleanCode);
    } catch {
      return { status: 'AUTH_SERVICE_UNAVAILABLE', reason: 'Database error.' };
    }

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
    const newVersion = credential.Credential_Version + 1;

    // Revoke current session
    await this.sessionService.revokeSession(sessionToken);

    await this.repository.updateCredential(cleanCode, {
      Password_Hash: newHash,
      Must_Change_Password: false,
      Credential_Version: newVersion
    });

    // Issue replacement session token
    const newSessionRes = await this.sessionService.createSession(cleanCode, kintoneUser, newVersion, now);
    return {
      status: 'AUTHENTICATED',
      employeeCode: cleanCode,
      sessionToken: newSessionRes.sessionToken,
      expiresAt: newSessionRes.expiresAt
    };
  }

  /**
   * Logs out an employee session matching the presented raw session token.
   */
  async logout({ sessionToken }) {
    if (!sessionToken) {
      return { status: 'LOGGED_OUT' };
    }
    await this.sessionService.revokeSession(sessionToken);
    return { status: 'LOGGED_OUT' };
  }
}
