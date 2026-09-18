/**
 * D3 OAuth Token Store Interface and Test-Only In-Memory Implementation.
 *
 * Enforces strict custody contracts:
 * - TOKEN_STORE_PRODUCTION_IN_MEMORY_ONLY = FORBIDDEN
 * - TOKEN_STORE_FAILS_CLOSED_IF_UNAVAILABLE = YES
 * - TOKEN_LOGGING = FORBIDDEN
 * - TOKEN_IN_ERROR_PAYLOAD = FORBIDDEN
 * - TOKEN_IN_GIT = FORBIDDEN
 * - IN_MEMORY_TOKEN_STORE = TEST_ONLY
 */

export class D3TokenStoreError extends Error {
  constructor(code, message) {
    // Sanitized: Never interpolate tokens or secrets into error message
    super(`[D3_TOKEN_STORE_ERROR] ${code}: ${message}`);
    this.name = 'D3TokenStoreError';
    this.code = code;
  }
}

/**
 * Abstract Base Class defining Token Store Contract.
 */
export class D3TokenStore {
  async storeGrant(userCode, grant) {
    throw new D3TokenStoreError('NOT_IMPLEMENTED', 'storeGrant must be implemented by subclass');
  }

  async loadGrant(userCode) {
    throw new D3TokenStoreError('NOT_IMPLEMENTED', 'loadGrant must be implemented by subclass');
  }

  async rotateGrant(userCode, newGrant) {
    throw new D3TokenStoreError('NOT_IMPLEMENTED', 'rotateGrant must be implemented by subclass');
  }

  async invalidateGrant(userCode) {
    throw new D3TokenStoreError('NOT_IMPLEMENTED', 'invalidateGrant must be implemented by subclass');
  }
}

/**
 * Test-Only In-Memory Token Store.
 *
 * Strictly forbidden in production environments.
 */
export class InMemoryTokenStore extends D3TokenStore {
  constructor(options = {}) {
    super();
    const isProduction = options.isProduction ?? (process.env.NODE_ENV === 'production');
    if (isProduction) {
      throw new D3TokenStoreError(
        'PRODUCTION_IN_MEMORY_FORBIDDEN',
        'In-memory token store is strictly forbidden in production environments'
      );
    }
    this.store = new Map();
    this.simulateUnavailable = false;
  }

  setUnavailable(unavailable = true) {
    this.simulateUnavailable = Boolean(unavailable);
  }

  _checkAvailability() {
    if (this.simulateUnavailable) {
      throw new D3TokenStoreError('STORE_UNAVAILABLE', 'Token storage backend is unavailable');
    }
  }

  _validateUserCode(userCode) {
    const code = String(userCode || '').trim();
    if (!code) {
      throw new D3TokenStoreError('INVALID_USER_CODE', 'User code is required');
    }
    return code;
  }

  _validateGrant(grant) {
    if (!grant || typeof grant !== 'object') {
      throw new D3TokenStoreError('INVALID_GRANT', 'Grant object is required');
    }
    if (!grant.accessToken || typeof grant.accessToken !== 'string') {
      throw new D3TokenStoreError('INVALID_GRANT', 'Grant must contain valid accessToken');
    }
  }

  async storeGrant(userCode, grant) {
    this._checkAvailability();
    const code = this._validateUserCode(userCode);
    this._validateGrant(grant);

    // Deep clone grant to prevent external mutation; never log or inspect sensitive fields
    this.store.set(code, {
      accessToken: grant.accessToken,
      refreshToken: grant.refreshToken || null,
      tokenType: grant.tokenType || 'Bearer',
      scope: grant.scope || null,
      expiresAt: grant.expiresAt ? Number(grant.expiresAt) : null,
      issuedAt: grant.issuedAt ? Number(grant.issuedAt) : Date.now()
    });
    return { success: true };
  }

  async loadGrant(userCode) {
    this._checkAvailability();
    const code = this._validateUserCode(userCode);
    const grant = this.store.get(code);
    if (!grant) {
      return null;
    }
    return { ...grant };
  }

  async rotateGrant(userCode, newGrant) {
    this._checkAvailability();
    const code = this._validateUserCode(userCode);
    this._validateGrant(newGrant);
    if (!this.store.has(code)) {
      throw new D3TokenStoreError('GRANT_NOT_FOUND', 'Cannot rotate grant for non-existent user');
    }
    return this.storeGrant(code, newGrant);
  }

  async invalidateGrant(userCode) {
    this._checkAvailability();
    const code = this._validateUserCode(userCode);
    const deleted = this.store.delete(code);
    return { success: deleted };
  }

  clear() {
    this.store.clear();
  }
}
