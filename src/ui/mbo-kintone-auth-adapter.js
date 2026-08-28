/**
 * MboKintoneAuthAdapter — Browser-Only App801 Auth & Session Adapter (D1 Kintone-Only)
 *
 * Security Boundary Notice:
 * - Browser-only: NO Node.js crypto imports. Uses Web Crypto API (crypto.subtle).
 * - Password_Hash & raw session tokens NEVER returned outside adapter internals.
 * - App801 fields used: Employee_Code, Password_Hash, Password_Algorithm,
 *   Force_Password_Change, Account_Status, Failed_Attempts, Locked_Until,
 *   Last_Login_At, Password_Changed_At, Credential_Version,
 *   Session_Token_Hash, Session_Issued_At, Session_Expires_At,
 *   Session_Credential_Version, Session_Kintone_User.
 * - Canonical Employee_Code format: /^[A-Za-z0-9_.-]+$/ only.
 * - Exactly one App801 record per Employee_Code; duplicate/missing/malformed → fail closed.
 * - 5 failed attempts → 15-minute lockout (Locked_Until).
 * - PBKDF2 format: pbkdf2$100000$<saltHex>$<hashHex> (SHA-256, 256-bit output).
 */

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_HASH = 'SHA-256';
const PBKDF2_KEY_LEN_BITS = 256;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const MAX_FAILED_ATTEMPTS = 5;
const enc = new TextEncoder();

function hexEncode(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexDecode(hexStr) {
  if (hexStr.length % 2 !== 0) return new Uint8Array(0);
  const bytes = new Uint8Array(hexStr.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hexStr.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export class MboKintoneAuthAdapter {
  /**
   * @param {object} options
   * @param {{ getRecords(appId, query): Promise, updateRecord(appId, id, record): Promise }} options.api
   * @param {number} [options.appId=801] - App801 ID
   * @param {Crypto} [options.cryptoImpl=globalThis.crypto] - injectable for tests
   * @param {() => Date} [options.now=() => new Date()] - injectable for tests
   */
  constructor({ api, appId = 801, cryptoImpl = globalThis.crypto, now = () => new Date() } = {}) {
    this.api = api;
    this.appId = appId;
    this.crypto = cryptoImpl;
    this.now = now;
  }

  // ---------------------------------------------------------------------------
  // Internal: Employee_Code canonical validation
  // ---------------------------------------------------------------------------

  _normalizeEmployeeCode(code) {
    if (typeof code !== 'string') throw new Error('INVALID_EMPLOYEE_CODE');
    if (code !== code.trim()) throw new Error('INVALID_EMPLOYEE_CODE');
    const trimmed = code.trim();
    if (!trimmed || !/^[A-Za-z0-9_.-]+$/.test(trimmed)) throw new Error('INVALID_EMPLOYEE_CODE');
    return trimmed;
  }

  // ---------------------------------------------------------------------------
  // Internal: PBKDF2 crypto
  // ---------------------------------------------------------------------------

  async _deriveHash(password, saltBytes) {
    const keyMaterial = await this.crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    const bits = await this.crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: PBKDF2_HASH, salt: saltBytes, iterations: PBKDF2_ITERATIONS },
      keyMaterial,
      PBKDF2_KEY_LEN_BITS
    );
    return hexEncode(bits);
  }

  /**
   * Verifies a plaintext password against a stored pbkdf2$... hash string.
   * Returns false for any malformed or mismatched hash — never throws.
   */
  async verifyPassword(password, storedHash) {
    try {
      if (typeof storedHash !== 'string') return false;
      const parts = storedHash.split('$');
      if (parts.length !== 4) return false;
      if (parts[0] !== 'pbkdf2') return false;
      if (parts[1] !== String(PBKDF2_ITERATIONS)) return false;
      if (!/^[0-9a-f]+$/i.test(parts[2]) || parts[2].length === 0) return false;
      if (!/^[0-9a-f]{64}$/i.test(parts[3])) return false;
      const saltBytes = hexDecode(parts[2]);
      const computed = await this._deriveHash(password, saltBytes);
      return computed === parts[3].toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Creates a new pbkdf2$100000$<saltHex>$<hashHex> hash string using a
   * cryptographically random 16-byte salt.
   */
  async createPasswordHash(password) {
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('INVALID_PASSWORD');
    }
    const saltBytes = new Uint8Array(16);
    this.crypto.getRandomValues(saltBytes);
    const hashHex = await this._deriveHash(password, saltBytes);
    return `pbkdf2$${PBKDF2_ITERATIONS}$${hexEncode(saltBytes)}$${hashHex}`;
  }

  // ---------------------------------------------------------------------------
  // Internal: App801 credential fetch
  // ---------------------------------------------------------------------------

  async _getCredential(employeeCode) {
    const code = this._normalizeEmployeeCode(employeeCode);
    const result = await this.api.getRecords(this.appId, `Employee_Code = "${code}" limit 2`);
    const records = result?.records || [];

    if (records.length === 0) throw new Error('CREDENTIAL_NOT_FOUND');
    if (records.length > 1) throw new Error('DUPLICATE_CREDENTIAL');

    const r = records[0];
    const get = key => r[key]?.value ?? null;

    const storedCode = get('Employee_Code');
    const hash = get('Password_Hash');
    const status = get('Account_Status');
    const force = get('Force_Password_Change');
    const failedRaw = get('Failed_Attempts');
    const lockedUntilRaw = get('Locked_Until');
    const credVerRaw = get('Credential_Version');

    const sessHash = get('Session_Token_Hash');
    const sessIssued = get('Session_Issued_At');
    const sessExpires = get('Session_Expires_At');
    const sessCredVerRaw = get('Session_Credential_Version');
    const sessKintoneUser = get('Session_Kintone_User');

    if (storedCode !== code) throw new Error('MALFORMED_CREDENTIAL');
    if (typeof hash !== 'string' || !hash) throw new Error('MALFORMED_CREDENTIAL');
    if (!['ACTIVE', 'LOCKED', 'DISABLED'].includes(status)) throw new Error('MALFORMED_CREDENTIAL');
    if (!['YES', 'NO'].includes(force)) throw new Error('MALFORMED_CREDENTIAL');

    // B5: Malformed Failed_Attempts / Locked_Until fail closed
    let failedAttempts = 0;
    if (failedRaw !== null && failedRaw !== undefined && failedRaw !== '') {
      const parsedFailed = Number(failedRaw);
      if (isNaN(parsedFailed) || parsedFailed < 0) throw new Error('MALFORMED_CREDENTIAL');
      failedAttempts = parsedFailed;
    }

    if (lockedUntilRaw !== null && lockedUntilRaw !== undefined && lockedUntilRaw !== '') {
      if (isNaN(Date.parse(lockedUntilRaw))) throw new Error('MALFORMED_CREDENTIAL');
    }

    // Corrective A: Credential_Version must be a positive integer and fail closed if missing/blank/non-integer/<=0
    if (credVerRaw === null || credVerRaw === undefined || credVerRaw === '') {
      throw new Error('MALFORMED_CREDENTIAL');
    }
    const credentialVersion = Number(credVerRaw);
    if (isNaN(credentialVersion) || !Number.isInteger(credentialVersion) || credentialVersion <= 0) {
      throw new Error('MALFORMED_CREDENTIAL');
    }

    let sessionCredentialVersion = null;
    if (sessCredVerRaw !== null && sessCredVerRaw !== undefined && sessCredVerRaw !== '') {
      const parsedSessVer = Number(sessCredVerRaw);
      if (isNaN(parsedSessVer) || !Number.isInteger(parsedSessVer) || parsedSessVer <= 0) {
        throw new Error('MALFORMED_CREDENTIAL');
      }
      sessionCredentialVersion = parsedSessVer;
    }

    return {
      id: r.$id?.value,
      code,
      hash,
      status,
      forceChange: force === 'YES',
      lockedUntil: lockedUntilRaw || null,
      failedAttempts,
      credentialVersion,
      sessionTokenHash: sessHash || null,
      sessionIssuedAt: sessIssued || null,
      sessionExpiresAt: sessExpires || null,
      sessionCredentialVersion,
      sessionKintoneUser: sessKintoneUser || null
    };
  }

  // ---------------------------------------------------------------------------
  // Public: login
  // ---------------------------------------------------------------------------

  /**
   * Authenticates an employee against App801.
   * Returns one of:
   *   { status: 'AUTHENTICATED', employeeCode }
   *   { status: 'PASSWORD_CHANGE_REQUIRED', employeeCode }
   *   { status: 'INVALID_CREDENTIALS' }
   *   { status: 'CREDENTIAL_DENIED', reason }
   *
   * Never returns Password_Hash.
   */
  async login({ username, password }) {
    let cred;
    try {
      cred = await this._getCredential(username);
    } catch (err) {
      return { status: 'CREDENTIAL_DENIED', reason: err.message };
    }

    // B5: Account_Status = LOCKED or DISABLED: always deny
    if (cred.status === 'DISABLED') {
      return { status: 'CREDENTIAL_DENIED', reason: 'Account is disabled.' };
    }
    if (cred.status === 'LOCKED') {
      return { status: 'CREDENTIAL_DENIED', reason: 'Account is locked.' };
    }

    // ACTIVE status with temporary lockout period in effect
    if (cred.lockedUntil && new Date(cred.lockedUntil) > this.now()) {
      return { status: 'CREDENTIAL_DENIED', reason: 'Account is temporarily locked. Please try again later.' };
    }

    // Verify password
    const valid = await this.verifyPassword(password, cred.hash);
    if (!valid) {
      const newFailed = cred.failedAttempts + 1;
      const lockedUntil = newFailed >= MAX_FAILED_ATTEMPTS
        ? new Date(this.now().getTime() + LOCK_DURATION_MS).toISOString()
        : null;
      await this.api.updateRecord(this.appId, cred.id, {
        Failed_Attempts: { value: newFailed },
        Locked_Until: { value: lockedUntil }
      });
      return { status: 'INVALID_CREDENTIALS' };
    }

    // Successful authentication — reset failed state, update last login
    await this.api.updateRecord(this.appId, cred.id, {
      Failed_Attempts: { value: 0 },
      Locked_Until: { value: null },
      Last_Login_At: { value: this.now().toISOString() }
    });

    return {
      status: cred.forceChange ? 'PASSWORD_CHANGE_REQUIRED' : 'AUTHENTICATED',
      employeeCode: cred.code
    };
  }

  // ---------------------------------------------------------------------------
  // Public: Session operations
  // ---------------------------------------------------------------------------

  /**
   * Stores server-side session metadata in App801 for employeeCode.
   * Corrective B: requires non-empty kintoneUserCode.
   */
  async storeSession({ employeeCode, tokenHash, issuedAt, expiresAt, kintoneUserCode }) {
    if (typeof tokenHash !== 'string' || !/^[0-9a-f]{64}$/i.test(tokenHash)) {
      throw new Error('INVALID_TOKEN_HASH');
    }

    if (!kintoneUserCode || typeof kintoneUserCode !== 'string' || kintoneUserCode.trim() === '') {
      throw new Error('MISSING_KINTONE_PRINCIPAL');
    }

    const cred = await this._getCredential(employeeCode);
    if (cred.status !== 'ACTIVE') {
      throw new Error('CREDENTIAL_NOT_ACTIVE');
    }
    if (cred.forceChange) {
      throw new Error('FORCE_PASSWORD_CHANGE_REQUIRED');
    }

    await this.api.updateRecord(this.appId, cred.id, {
      Session_Token_Hash: { value: tokenHash.toLowerCase() },
      Session_Issued_At: { value: issuedAt },
      Session_Expires_At: { value: expiresAt },
      Session_Credential_Version: { value: cred.credentialVersion },
      Session_Kintone_User: { value: kintoneUserCode.trim() }
    });

    return { status: 'SESSION_STORED', employeeCode: cred.code };
  }

  /**
   * Validates a session token hash against App801.
   * Returns { status: 'VALID_SESSION', employeeCode } or { status: 'INVALID_SESSION', reason }.
   * Never throws for invalid/missing/expired session.
   */
  async validateSession({ tokenHash, currentKintoneUserCode }) {
    try {
      if (typeof tokenHash !== 'string' || !/^[0-9a-f]{64}$/i.test(tokenHash)) {
        return { status: 'INVALID_SESSION', reason: 'Invalid token hash format.' };
      }

      // Corrective B: require non-empty currentKintoneUserCode
      if (!currentKintoneUserCode || typeof currentKintoneUserCode !== 'string' || currentKintoneUserCode.trim() === '') {
        return { status: 'INVALID_SESSION', reason: 'Missing current Kintone user.' };
      }

      const hashLower = tokenHash.toLowerCase();
      const result = await this.api.getRecords(this.appId, `Session_Token_Hash = "${hashLower}" limit 2`);
      const records = result?.records || [];

      if (records.length === 0) {
        return { status: 'INVALID_SESSION', reason: 'Session token not found.' };
      }
      if (records.length > 1) {
        return { status: 'INVALID_SESSION', reason: 'Duplicate session token hash.' };
      }

      const r = records[0];
      const get = key => r[key]?.value ?? null;

      const code = get('Employee_Code');
      const status = get('Account_Status');
      const force = get('Force_Password_Change');
      const expiresAtRaw = get('Session_Expires_At');
      const credVerRaw = get('Credential_Version');
      const sessCredVerRaw = get('Session_Credential_Version');
      const sessKintoneUser = get('Session_Kintone_User');

      // Canonical employee code validation
      const normalizedCode = this._normalizeEmployeeCode(code);
      if (status !== 'ACTIVE') {
        return { status: 'INVALID_SESSION', reason: 'Account is not active.' };
      }

      // Corrective C: Force_Password_Change must equal exactly 'NO'
      if (force !== 'NO') {
        return { status: 'INVALID_SESSION', reason: 'Password change is required.' };
      }

      // Check Expiration
      if (!expiresAtRaw || isNaN(Date.parse(expiresAtRaw))) {
        return { status: 'INVALID_SESSION', reason: 'Invalid or missing expiry date.' };
      }
      if (new Date(expiresAtRaw) <= this.now()) {
        return { status: 'INVALID_SESSION', reason: 'Session has expired.' };
      }

      // Corrective A: Credential_Version must be a positive integer
      if (credVerRaw === null || credVerRaw === undefined || credVerRaw === '') {
        return { status: 'INVALID_SESSION', reason: 'Missing credential version.' };
      }
      const credVer = Number(credVerRaw);
      if (isNaN(credVer) || !Number.isInteger(credVer) || credVer <= 0) {
        return { status: 'INVALID_SESSION', reason: 'Malformed credential version.' };
      }

      if (sessCredVerRaw === null || sessCredVerRaw === undefined || sessCredVerRaw === '') {
        return { status: 'INVALID_SESSION', reason: 'Missing session credential version.' };
      }
      const sessCredVer = Number(sessCredVerRaw);
      if (isNaN(sessCredVer) || !Number.isInteger(sessCredVer) || sessCredVer <= 0 || sessCredVer !== credVer) {
        return { status: 'INVALID_SESSION', reason: 'Credential version mismatch.' };
      }

      // Corrective B: Kintone Principal binding must be exact
      if (!sessKintoneUser || typeof sessKintoneUser !== 'string' || sessKintoneUser.trim() === '') {
        return { status: 'INVALID_SESSION', reason: 'Missing session Kintone user.' };
      }

      if (sessKintoneUser.trim().toLowerCase() !== currentKintoneUserCode.trim().toLowerCase()) {
        return { status: 'INVALID_SESSION', reason: 'Kintone user mismatch.' };
      }

      return {
        status: 'VALID_SESSION',
        employeeCode: normalizedCode
      };
    } catch (err) {
      return { status: 'INVALID_SESSION', reason: err.message };
    }
  }

  /**
   * Revokes session fields in App801 for tokenHash.
   * Corrective D: Revoke failure must remain observable (throws error on missing/duplicate/server fail).
   */
  async revokeSession({ tokenHash }) {
    if (typeof tokenHash !== 'string' || !/^[0-9a-f]{64}$/i.test(tokenHash)) {
      throw new Error('INVALID_TOKEN_HASH');
    }
    const hashLower = tokenHash.toLowerCase();
    const result = await this.api.getRecords(this.appId, `Session_Token_Hash = "${hashLower}" limit 2`);
    const records = result?.records || [];

    if (records.length === 0) {
      throw new Error('SESSION_NOT_FOUND');
    }
    if (records.length > 1) {
      throw new Error('DUPLICATE_SESSION_TOKEN_HASH');
    }

    const recId = records[0].$id?.value;
    await this.api.updateRecord(this.appId, recId, {
      Session_Token_Hash: { value: null },
      Session_Issued_At: { value: null },
      Session_Expires_At: { value: null },
      Session_Credential_Version: { value: null },
      Session_Kintone_User: { value: null }
    });

    return { status: 'SESSION_REVOKED' };
  }

  // ---------------------------------------------------------------------------
  // Public: changePassword (normal authenticated change — requires current password)
  // ---------------------------------------------------------------------------

  /**
   * Changes password for an authenticated employee.
   * Requires currentPassword verification before update.
   * Increments Credential_Version and clears prior session fields.
   */
  async changePassword({ employeeCode, currentPassword, newPassword }) {
    let cred;
    try {
      cred = await this._getCredential(employeeCode);
    } catch (err) {
      return { status: 'CREDENTIAL_DENIED', reason: err.message };
    }

    const valid = await this.verifyPassword(currentPassword, cred.hash);
    if (!valid) {
      return { status: 'INVALID_CREDENTIALS', reason: 'Current password is incorrect.' };
    }

    if (newPassword === cred.code) {
      return { status: 'INVALID_PASSWORD', reason: 'New password cannot be the same as your Employee Code.' };
    }

    const newHash = await this.createPasswordHash(newPassword);
    const newCredVersion = cred.credentialVersion + 1;

    await this.api.updateRecord(this.appId, cred.id, {
      Password_Hash: { value: newHash },
      Password_Changed_At: { value: this.now().toISOString() },
      Force_Password_Change: { value: 'NO' },
      Failed_Attempts: { value: 0 },
      Locked_Until: { value: null },
      Credential_Version: { value: newCredVersion },
      Session_Token_Hash: { value: null },
      Session_Issued_At: { value: null },
      Session_Expires_At: { value: null },
      Session_Credential_Version: { value: null },
      Session_Kintone_User: { value: null }
    });

    return { status: 'PASSWORD_CHANGED', employeeCode: cred.code, newCredentialVersion: newCredVersion };
  }

  // ---------------------------------------------------------------------------
  // Public: forceChangePassword (initial/forced change — no current password required)
  // ---------------------------------------------------------------------------

  /**
   * Applies a forced password change without requiring current password verification.
   * Increments Credential_Version and clears prior session fields.
   */
  async forceChangePassword({ employeeCode, newPassword }) {
    let cred;
    try {
      cred = await this._getCredential(employeeCode);
    } catch (err) {
      return { status: 'CREDENTIAL_DENIED', reason: err.message };
    }

    if (cred.forceChange !== true) {
      return { status: 'CREDENTIAL_DENIED', reason: 'Force password change is not required for this account.' };
    }

    if (newPassword === cred.code) {
      return { status: 'INVALID_PASSWORD', reason: 'New password cannot be the same as your Employee Code.' };
    }

    const newHash = await this.createPasswordHash(newPassword);
    const newCredVersion = cred.credentialVersion + 1;

    await this.api.updateRecord(this.appId, cred.id, {
      Password_Hash: { value: newHash },
      Password_Changed_At: { value: this.now().toISOString() },
      Force_Password_Change: { value: 'NO' },
      Failed_Attempts: { value: 0 },
      Locked_Until: { value: null },
      Credential_Version: { value: newCredVersion },
      Session_Token_Hash: { value: null },
      Session_Issued_At: { value: null },
      Session_Expires_At: { value: null },
      Session_Credential_Version: { value: null },
      Session_Kintone_User: { value: null }
    });

    return { status: 'PASSWORD_CHANGED', employeeCode: cred.code, newCredentialVersion: newCredVersion };
  }
}
