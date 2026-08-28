/**
 * MboSessionManager — Short-Lived Session Continuity Orchestrator (D1)
 *
 * Architecture & Security Invariants:
 * - Opaque 256-bit cryptographically random bearer token.
 * - Raw token stored ONLY in browser sessionStorage under key 'ttmet.mbo794.session.v1'.
 * - Browser storage contains NO Employee_Code or trusted authentication flag.
 * - Server stores SHA-256 hash of token + session metadata in App801.
 * - Absolute TTL = 8 hours. NO sliding refresh.
 * - Bound to Kintone Principal and Credential Version.
 * - Fails closed on any expired, missing, tampered, or mismatched token.
 * - Public API methods return ONLY non-secret metadata (no raw token or hash leakage).
 */

const SESSION_STORAGE_KEY = 'ttmet.mbo794.session.v1';
const ABSOLUTE_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function hexEncode(buffer) {
  return [...new Uint8Array(buffer)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export class MboSessionManager {
  /**
   * @param {object} options
   * @param {import('./mbo-kintone-auth-adapter.js').MboKintoneAuthAdapter} options.adapter
   * @param {() => { code: string }|null} [options.getKintoneUser]
   * @param {Storage} [options.sessionStorageImpl=globalThis.sessionStorage]
   * @param {Crypto} [options.cryptoImpl=globalThis.crypto]
   * @param {() => Date} [options.now=() => new Date()]
   */
  constructor({
    adapter,
    getKintoneUser = () => (typeof kintone !== 'undefined' && kintone.getLoginUser ? kintone.getLoginUser() : null),
    sessionStorageImpl = globalThis.sessionStorage,
    cryptoImpl = globalThis.crypto,
    now = () => new Date()
  } = {}) {
    if (!adapter) throw new Error('MISSING_AUTH_ADAPTER');
    this.adapter = adapter;
    this.getKintoneUser = getKintoneUser;
    this.sessionStorage = sessionStorageImpl;
    this.crypto = cryptoImpl;
    this.now = now;
  }

  /**
   * Generates a cryptographically random 256-bit (32-byte) hex token string.
   * @returns {string} 64-character hex string
   */
  generateToken() {
    const bytes = new Uint8Array(32);
    this.crypto.getRandomValues(bytes);
    return hexEncode(bytes);
  }

  /**
   * Computes SHA-256 hash of the token string.
   * @param {string} token
   * @returns {Promise<string>} 64-character hex hash string
   */
  async hashToken(token) {
    if (typeof token !== 'string' || !/^[0-9a-f]{64}$/i.test(token)) {
      throw new Error('INVALID_TOKEN_FORMAT');
    }
    const enc = new TextEncoder();
    const data = enc.encode(token.toLowerCase());
    const buffer = await this.crypto.subtle.digest('SHA-256', data);
    return hexEncode(buffer);
  }

  /**
   * Reads raw token from browser sessionStorage.
   * Validates hex format — returns null if missing or malformed.
   * @returns {string|null}
   */
  getLocalToken() {
    try {
      if (!this.sessionStorage) return null;
      const val = this.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (typeof val !== 'string' || !/^[0-9a-f]{64}$/i.test(val)) return null;
      return val.toLowerCase();
    } catch {
      return null;
    }
  }

  /**
   * Writes raw token to browser sessionStorage.
   * @param {string} token
   */
  setLocalToken(token) {
    if (typeof token !== 'string' || !/^[0-9a-f]{64}$/i.test(token)) {
      throw new Error('INVALID_TOKEN_FORMAT');
    }
    if (this.sessionStorage) {
      this.sessionStorage.setItem(SESSION_STORAGE_KEY, token.toLowerCase());
    }
  }

  /**
   * Removes session token from browser sessionStorage.
   */
  clearLocalToken() {
    try {
      if (this.sessionStorage) {
        this.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors on clear
    }
  }

  /**
   * Issues a new session for an authenticated Employee_Code:
   * 1. Validates current Kintone user code (must be exact non-empty string, no whitespace mutation)
   * 2. Generates 256-bit token
   * 3. Computes SHA-256 token hash
   * 4. Calculates 8-hour expiry
   * 5. Stores session metadata in App801 via adapter
   * 6. Writes raw token to sessionStorage
   *
   * Public outcome returns ONLY non-secret metadata (no raw token or hash).
   *
   * @param {string} employeeCode
   * @returns {Promise<{ status: 'SESSION_ISSUED', expiresAt: string }>}
   */
  async issueSession(employeeCode) {
    const kintoneUser = this.getKintoneUser();
    const kintoneUserCode = kintoneUser?.code;

    if (!kintoneUserCode || typeof kintoneUserCode !== 'string' || kintoneUserCode !== kintoneUserCode.trim() || !kintoneUserCode.trim()) {
      throw new Error('MISSING_KINTONE_PRINCIPAL');
    }

    const token = this.generateToken();
    const tokenHash = await this.hashToken(token);

    const currentTime = this.now();
    const issuedAt = currentTime.toISOString();
    const expiresAt = new Date(currentTime.getTime() + ABSOLUTE_TTL_MS).toISOString();

    await this.adapter.storeSession({
      employeeCode,
      tokenHash,
      issuedAt,
      expiresAt,
      kintoneUserCode
    });

    this.setLocalToken(token);

    return { status: 'SESSION_ISSUED', expiresAt };
  }

  /**
   * Restores and validates session from local sessionStorage token against App801.
   * Clears local token and returns null if missing, invalid, or expired.
   *
   * Public outcome returns ONLY authenticated Employee_Code (no raw token).
   *
   * @returns {Promise<{ employeeCode: string }|null>}
   */
  async restoreSession() {
    const token = this.getLocalToken();
    if (!token) return null;

    let tokenHash;
    try {
      tokenHash = await this.hashToken(token);
    } catch {
      this.clearLocalToken();
      return null;
    }

    const kintoneUser = this.getKintoneUser();
    const currentKintoneUserCode = kintoneUser?.code;

    if (!currentKintoneUserCode || typeof currentKintoneUserCode !== 'string' || currentKintoneUserCode !== currentKintoneUserCode.trim() || !currentKintoneUserCode.trim()) {
      this.clearLocalToken();
      return null;
    }

    let res;
    try {
      res = await this.adapter.validateSession({
        tokenHash,
        currentKintoneUserCode
      });
    } catch {
      this.clearLocalToken();
      return null;
    }

    if (res?.status === 'VALID_SESSION' && res.employeeCode) {
      return {
        employeeCode: res.employeeCode
      };
    }

    this.clearLocalToken();
    return null;
  }

  /**
   * Revokes the current local session.
   * Clears local token unconditionally, but reports sanitized server revocation failure status.
   *
   * @returns {Promise<{ status: 'SESSION_REVOKED'|'REVOKE_FAILED', serverRevoked?: boolean, reason?: string }>}
   */
  async revokeSession() {
    const token = this.getLocalToken();
    let serverRevoked = false;
    let serverReason = null;

    if (token) {
      try {
        const tokenHash = await this.hashToken(token);
        const res = await this.adapter.revokeSession({ tokenHash });
        if (res?.status === 'SESSION_REVOKED') {
          serverRevoked = true;
        }
      } catch (err) {
        const msg = err.message || '';
        if (['INVALID_TOKEN_HASH', 'SESSION_NOT_FOUND', 'DUPLICATE_SESSION_TOKEN_HASH'].includes(msg)) {
          serverReason = msg;
        } else {
          serverReason = 'SERVER_REVOKE_FAILED';
        }
      }
    }

    this.clearLocalToken();

    if (serverReason) {
      return { status: 'REVOKE_FAILED', reason: serverReason };
    }

    return { status: 'SESSION_REVOKED', serverRevoked };
  }
}
