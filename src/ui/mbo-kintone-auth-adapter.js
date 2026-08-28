/**
 * MboKintoneAuthAdapter — Browser-Only App801 Auth Adapter (D1 Kintone-Only)
 *
 * Security Boundary Notice:
 * - Browser-only: NO Node.js crypto imports. Uses Web Crypto API (crypto.subtle).
 * - Password_Hash NEVER returned outside adapter internals.
 * - App801 fields used: Employee_Code, Password_Hash, Password_Algorithm,
 *   Force_Password_Change, Account_Status, Failed_Attempts, Locked_Until,
 *   Last_Login_At, Password_Changed_At, Credential_Version.
 * - Canonical Employee_Code format: /^[A-Za-z0-9_.-]+$/ only.
 * - Exactly one App801 record per Employee_Code; duplicate/missing/malformed → fail closed.
 * - 5 failed attempts → 15-minute lockout (Locked_Until).
 * - PBKDF2 format: pbkdf2$100000$<saltHex>$<hashHex> (SHA-256, 256-bit output).
 *
 * Architecture note: Current App801 ACL (GROUP:everyone=false) blocks live browser
 * reads. This adapter is source-complete pending the separately authorized ACL change.
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

    return {
      id: r.$id?.value,
      code,
      hash,
      status,
      forceChange: force === 'YES',
      lockedUntil: lockedUntilRaw || null,
      failedAttempts
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
  // Public: changePassword (normal authenticated change — requires current password)
  // ---------------------------------------------------------------------------

  /**
   * Changes password for an authenticated employee.
   * Requires currentPassword verification before update.
   * newPassword must not equal employeeCode.
   * Returns:
   *   { status: 'PASSWORD_CHANGED', employeeCode }
   *   { status: 'INVALID_CREDENTIALS', reason }
   *   { status: 'INVALID_PASSWORD', reason }
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
    await this.api.updateRecord(this.appId, cred.id, {
      Password_Hash: { value: newHash },
      Password_Changed_At: { value: this.now().toISOString() },
      Force_Password_Change: { value: 'NO' },
      Failed_Attempts: { value: 0 },
      Locked_Until: { value: null }
    });

    return { status: 'PASSWORD_CHANGED', employeeCode: cred.code };
  }

  // ---------------------------------------------------------------------------
  // Public: forceChangePassword (initial/forced change — no current password required)
  // ---------------------------------------------------------------------------

  /**
   * Applies a forced password change without requiring current password verification.
   * Only invoked from a PASSWORD_CHANGE_REQUIRED gate state.
   * B6: Requires cred.forceChange === true (Force_Password_Change = YES).
   * newPassword must not equal employeeCode.
   */
  async forceChangePassword({ employeeCode, newPassword }) {
    let cred;
    try {
      cred = await this._getCredential(employeeCode);
    } catch (err) {
      return { status: 'CREDENTIAL_DENIED', reason: err.message };
    }

    // B6: Deny forced change if Force_Password_Change is not YES
    if (cred.forceChange !== true) {
      return { status: 'CREDENTIAL_DENIED', reason: 'Force password change is not required for this account.' };
    }

    if (newPassword === cred.code) {
      return { status: 'INVALID_PASSWORD', reason: 'New password cannot be the same as your Employee Code.' };
    }

    const newHash = await this.createPasswordHash(newPassword);
    await this.api.updateRecord(this.appId, cred.id, {
      Password_Hash: { value: newHash },
      Password_Changed_At: { value: this.now().toISOString() },
      Force_Password_Change: { value: 'NO' },
      Failed_Attempts: { value: 0 },
      Locked_Until: { value: null }
    });

    return { status: 'PASSWORD_CHANGED', employeeCode: cred.code };
  }
}
