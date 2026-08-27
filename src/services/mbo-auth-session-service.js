/**
 * MBO Server-Side Trusted Authentication & Opaque Session Core (D1-A)
 *
 * Security Boundary Notice:
 * - Server-side / Node-only module (uses node:crypto for token generation & hashing).
 * - NEVER import into browser bundles.
 * - Credentials and Password_Hash are NEVER exposed to client/browser results.
 * - Session principal is bound to authoritative Employee_Code from trusted server auth.
 */

import crypto from 'node:crypto';
import { MboPasswordDomainService } from './mbo-password-service.js';
import { MboIdentityService } from './mbo-identity-service.js';

export class MboAuthSessionService {
  constructor(options = {}) {
    this.credentialStore = options.credentialStore || null;
    this.sessionStore = options.sessionStore || null;
    this.userMappings = options.userMappings || [];
    this.passwordMaxAgeDays = options.passwordMaxAgeDays || 90;
    this.sessionDurationHours = options.sessionDurationHours || 8;
  }

  /**
   * Hashes a raw session token to SHA-256 for secure server storage.
   */
  static hashToken(token) {
    if (!token || typeof token !== 'string') return '';
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generates a random 256-bit (32-byte) hex session token.
   */
  static generateSessionToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Authenticates a user server-side and issues a session token.
   */
  async login({ kintoneUserCode, mboUsername, password, now = new Date() }) {
    // 1. Technical admin identity check — admin-form CANNOT become an employee-self principal
    if (
      kintoneUserCode === 'admin-form' ||
      kintoneUserCode === 'Administrator' ||
      mboUsername === 'ADMIN'
    ) {
      return {
        status: 'TECHNICAL_ADMIN_CANNOT_BECOME_EMPLOYEE_SELF',
        reason: 'Technical admin identity cannot be used for employee business operations.'
      };
    }

    // 2. Identity Resolution via MboIdentityService
    const identityResult = MboIdentityService.resolveEmployeeIdentity({
      kintoneUserCode,
      userMappings: this.userMappings
    });

    if (identityResult.status !== 'IDENTITY_BOUND') {
      return {
        status: 'IDENTITY_MAPPING_FAILED',
        reason: identityResult.reason || 'Kintone user is not bound to a valid Employee_Code.'
      };
    }

    const boundEmployeeCode = identityResult.employeeCode;

    // 3. Username Validation
    const usernameResult = MboIdentityService.validateMboUsername({
      mboUsername,
      boundEmployeeCode
    });

    if (usernameResult.status !== 'USERNAME_VALIDATED') {
      return {
        status: 'USERNAME_MISMATCH',
        reason: 'MBO username must match the bound Employee_Code.'
      };
    }

    // 4. Load Credential Record from Credential Store
    if (!this.credentialStore || typeof this.credentialStore.getCredential !== 'function') {
      throw new Error('CREDENTIAL_STORE_NOT_CONFIGURED: credentialStore is required.');
    }

    const credentialRecord = await this.credentialStore.getCredential(boundEmployeeCode);
    if (!credentialRecord) {
      return {
        status: 'INVALID_CREDENTIALS',
        reason: 'Invalid credentials.'
      };
    }

    // 5. Evaluate Credential State via MboPasswordDomainService
    const evalResult = MboPasswordDomainService.evaluateCredentialState({
      credentialRecord,
      inputPassword: password,
      now
    });

    // 6. Handle Invalid Credentials / Failed Attempt / Lockout
    if (evalResult.status === 'INVALID_CREDENTIALS') {
      if (typeof this.credentialStore.updateCredential === 'function') {
        await this.credentialStore.updateCredential(boundEmployeeCode, {
          Failed_Login_Count: evalResult.failedLoginCount,
          Locked_Until: evalResult.lockedUntil
        });
      }
      return {
        status: 'INVALID_CREDENTIALS',
        reason: evalResult.isLocked ? 'Account is locked.' : 'Invalid credentials.'
      };
    }

    if (evalResult.status === 'ACCOUNT_LOCKED' || evalResult.status === 'ACCOUNT_DISABLED') {
      return {
        status: evalResult.status,
        reason: evalResult.reason
      };
    }

    // Reset failed count on successful authentication
    if (credentialRecord.Failed_Login_Count > 0 || credentialRecord.Locked_Until) {
      if (typeof this.credentialStore.updateCredential === 'function') {
        await this.credentialStore.updateCredential(boundEmployeeCode, {
          Failed_Login_Count: 0,
          Locked_Until: null
        });
      }
    }

    if (!this.sessionStore || typeof this.sessionStore.setSession !== 'function') {
      throw new Error('SESSION_STORE_NOT_CONFIGURED: sessionStore is required.');
    }

    // 7. Handle Force Password Change State (First/Default Login)
    if (evalResult.status === 'AUTHENTICATED_BUT_PASSWORD_CHANGE_REQUIRED' || evalResult.status === 'PASSWORD_EXPIRED') {
      const rawToken = MboAuthSessionService.generateSessionToken();
      const tokenHash = MboAuthSessionService.hashToken(rawToken);

      const sessionObj = {
        tokenHash,
        employeeCode: boundEmployeeCode,
        kintoneUserCode,
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 1 * 3600 * 1000).toISOString(), // 1 hr for force change
        requiresPasswordChange: true,
        isDataAuthorized: false // MUST NOT authorize MBO data access
      };

      await this.sessionStore.setSession(tokenHash, sessionObj);

      return {
        status: 'PASSWORD_CHANGE_REQUIRED',
        sessionToken: rawToken,
        employeeCode: boundEmployeeCode,
        requiresPasswordChange: true
      };
    }

    // 8. Normal Authenticated Login
    const rawToken = MboAuthSessionService.generateSessionToken();
    const tokenHash = MboAuthSessionService.hashToken(rawToken);

    const sessionObj = {
      tokenHash,
      employeeCode: boundEmployeeCode,
      kintoneUserCode,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + this.sessionDurationHours * 3600 * 1000).toISOString(),
      requiresPasswordChange: false,
      isDataAuthorized: true
    };

    await this.sessionStore.setSession(tokenHash, sessionObj);

    // Sanitized Return — NO Password_Hash, salt, or raw credential record
    return {
      status: 'AUTHENTICATED_SUCCESS',
      sessionToken: rawToken,
      employeeCode: boundEmployeeCode
    };
  }

  /**
   * Retrieves trusted server-side principal for an active session token.
   * Returns null if session is invalid, expired, or not authorized for data access.
   */
  async getAuthenticatedPrincipal(sessionToken, now = new Date()) {
    if (!sessionToken || typeof sessionToken !== 'string') return null;
    if (!this.sessionStore || typeof this.sessionStore.getSession !== 'function') return null;

    const tokenHash = MboAuthSessionService.hashToken(sessionToken);
    const session = await this.sessionStore.getSession(tokenHash);

    if (!session || typeof session !== 'object') return null;

    // Must be data authorized (force-change sessions are NOT data authorized)
    if (session.isDataAuthorized !== true || session.requiresPasswordChange === true) {
      return null;
    }

    if (session.expiresAt) {
      const expTime = new Date(session.expiresAt);
      if (expTime <= now) return null;
    }

    return {
      employeeCode: session.employeeCode,
      kintoneUserCode: session.kintoneUserCode,
      isTechnicalAdmin: false
    };
  }

  /**
   * Changes password through trusted session boundary.
   */
  async changePassword({ sessionToken, currentPassword, newPassword, now = new Date() }) {
    if (!sessionToken || typeof sessionToken !== 'string') {
      throw new Error('SESSION_TOKEN_REQUIRED: sessionToken is required.');
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim() === '') {
      throw new Error('NEW_PASSWORD_REQUIRED: newPassword is required.');
    }

    if (!this.sessionStore || typeof this.sessionStore.getSession !== 'function') {
      throw new Error('SESSION_STORE_NOT_CONFIGURED');
    }

    const oldTokenHash = MboAuthSessionService.hashToken(sessionToken);
    const session = await this.sessionStore.getSession(oldTokenHash);

    if (!session || typeof session !== 'object') {
      throw new Error('INVALID_SESSION: Session is invalid or expired.');
    }

    const empCode = session.employeeCode;
    const cleanNewPass = newPassword.trim();

    // Rule: New password MUST NOT equal Employee_Code (default bootstrap password)
    if (cleanNewPass === empCode) {
      throw new Error('CANNOT_REUSE_DEFAULT_PASSWORD: New password cannot be equal to Employee Code default password.');
    }

    const credentialRecord = await this.credentialStore.getCredential(empCode);
    if (!credentialRecord) {
      throw new Error('CREDENTIAL_RECORD_NOT_FOUND');
    }

    // Normal session requires current password proof
    if (session.isDataAuthorized === true && !session.requiresPasswordChange) {
      if (!currentPassword) {
        throw new Error('CURRENT_PASSWORD_REQUIRED: Current password is required for password change.');
      }
      const isCurrentValid = MboPasswordDomainService.verifyPassword(currentPassword, credentialRecord.Password_Hash);
      if (!isCurrentValid) {
        throw new Error('INVALID_CURRENT_PASSWORD: Current password verification failed.');
      }
    }

    // Execute password change
    const updatedCredential = MboPasswordDomainService.changePassword({
      credentialRecord,
      newPassword: cleanNewPass,
      passwordMaxAgeDays: this.passwordMaxAgeDays,
      now
    });

    await this.credentialStore.updateCredential(empCode, updatedCredential);

    // Revoke old session
    if (typeof this.sessionStore.deleteSession === 'function') {
      await this.sessionStore.deleteSession(oldTokenHash);
    }

    // Create a new clean authorized session
    const newRawToken = MboAuthSessionService.generateSessionToken();
    const newTokenHash = MboAuthSessionService.hashToken(newRawToken);

    const newSessionObj = {
      tokenHash: newTokenHash,
      employeeCode: empCode,
      kintoneUserCode: session.kintoneUserCode,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + this.sessionDurationHours * 3600 * 1000).toISOString(),
      requiresPasswordChange: false,
      isDataAuthorized: true
    };

    await this.sessionStore.setSession(newTokenHash, newSessionObj);

    return {
      status: 'PASSWORD_CHANGED_SUCCESS',
      sessionToken: newRawToken,
      employeeCode: empCode
    };
  }

  /**
   * Revokes/deletes active session on logout.
   */
  async logout(sessionToken) {
    if (!sessionToken || typeof sessionToken !== 'string') {
      return { status: 'LOGGED_OUT' };
    }
    if (this.sessionStore && typeof this.sessionStore.deleteSession === 'function') {
      const tokenHash = MboAuthSessionService.hashToken(sessionToken);
      await this.sessionStore.deleteSession(tokenHash);
    }
    return { status: 'LOGGED_OUT' };
  }
}
