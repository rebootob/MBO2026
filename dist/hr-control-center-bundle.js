(() => {
  // src/ui/mbo-kintone-auth-adapter.js
  var PBKDF2_ITERATIONS = 1e5;
  var PBKDF2_HASH = "SHA-256";
  var PBKDF2_KEY_LEN_BITS = 256;
  var LOCK_DURATION_MS = 15 * 60 * 1e3;
  var MAX_FAILED_ATTEMPTS = 5;
  var enc = new TextEncoder();
  function hexEncode(buffer) {
    return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  function hexDecode(hexStr) {
    if (hexStr.length % 2 !== 0) return new Uint8Array(0);
    const bytes = new Uint8Array(hexStr.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hexStr.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }
  var MboKintoneAuthAdapter = class {
    /**
     * @param {object} options
     * @param {{ getRecords(appId, query): Promise, updateRecord(appId, id, record): Promise }} options.api
     * @param {number} [options.appId=801] - App801 ID
     * @param {Crypto} [options.cryptoImpl=globalThis.crypto] - injectable for tests
     * @param {() => Date} [options.now=() => new Date()] - injectable for tests
     */
    constructor({ api, appId = 801, cryptoImpl = globalThis.crypto, now = () => /* @__PURE__ */ new Date() } = {}) {
      this.api = api;
      this.appId = appId;
      this.crypto = cryptoImpl;
      this.now = now;
    }
    // ---------------------------------------------------------------------------
    // Internal: Employee_Code canonical validation
    // ---------------------------------------------------------------------------
    _normalizeEmployeeCode(code) {
      if (typeof code !== "string") throw new Error("INVALID_EMPLOYEE_CODE");
      if (code !== code.trim()) throw new Error("INVALID_EMPLOYEE_CODE");
      const trimmed = code.trim();
      if (!trimmed || !/^[A-Za-z0-9_.-]+$/.test(trimmed)) throw new Error("INVALID_EMPLOYEE_CODE");
      return trimmed;
    }
    // ---------------------------------------------------------------------------
    // Internal: PBKDF2 crypto
    // ---------------------------------------------------------------------------
    async _deriveHash(password, saltBytes) {
      const keyMaterial = await this.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
      );
      const bits = await this.crypto.subtle.deriveBits(
        { name: "PBKDF2", hash: PBKDF2_HASH, salt: saltBytes, iterations: PBKDF2_ITERATIONS },
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
        if (typeof storedHash !== "string") return false;
        const parts = storedHash.split("$");
        if (parts.length !== 4) return false;
        if (parts[0] !== "pbkdf2") return false;
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
      if (typeof password !== "string" || password.length === 0) {
        throw new Error("INVALID_PASSWORD");
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
      if (records.length === 0) throw new Error("CREDENTIAL_NOT_FOUND");
      if (records.length > 1) throw new Error("DUPLICATE_CREDENTIAL");
      const r = records[0];
      const get = (key) => r[key]?.value ?? null;
      const storedCode = get("Employee_Code");
      const hash = get("Password_Hash");
      const status = get("Account_Status");
      const force = get("Force_Password_Change");
      const failedRaw = get("Failed_Attempts");
      const lockedUntilRaw = get("Locked_Until");
      const credVerRaw = get("Credential_Version");
      const sessHash = get("Session_Token_Hash");
      const sessIssued = get("Session_Issued_At");
      const sessExpires = get("Session_Expires_At");
      const sessCredVerRaw = get("Session_Credential_Version");
      const sessKintoneUser = get("Session_Kintone_User");
      if (storedCode !== code) throw new Error("MALFORMED_CREDENTIAL");
      if (typeof hash !== "string" || !hash) throw new Error("MALFORMED_CREDENTIAL");
      if (!["ACTIVE", "LOCKED", "DISABLED"].includes(status)) throw new Error("MALFORMED_CREDENTIAL");
      if (!["YES", "NO"].includes(force)) throw new Error("MALFORMED_CREDENTIAL");
      let failedAttempts = 0;
      if (failedRaw !== null && failedRaw !== void 0 && failedRaw !== "") {
        const parsedFailed = Number(failedRaw);
        if (isNaN(parsedFailed) || parsedFailed < 0) throw new Error("MALFORMED_CREDENTIAL");
        failedAttempts = parsedFailed;
      }
      if (lockedUntilRaw !== null && lockedUntilRaw !== void 0 && lockedUntilRaw !== "") {
        if (isNaN(Date.parse(lockedUntilRaw))) throw new Error("MALFORMED_CREDENTIAL");
      }
      if (credVerRaw === null || credVerRaw === void 0 || credVerRaw === "") {
        throw new Error("MALFORMED_CREDENTIAL");
      }
      const credentialVersion = Number(credVerRaw);
      if (isNaN(credentialVersion) || !Number.isInteger(credentialVersion) || credentialVersion <= 0) {
        throw new Error("MALFORMED_CREDENTIAL");
      }
      let sessionCredentialVersion = null;
      if (sessCredVerRaw !== null && sessCredVerRaw !== void 0 && sessCredVerRaw !== "") {
        const parsedSessVer = Number(sessCredVerRaw);
        if (isNaN(parsedSessVer) || !Number.isInteger(parsedSessVer) || parsedSessVer <= 0) {
          throw new Error("MALFORMED_CREDENTIAL");
        }
        sessionCredentialVersion = parsedSessVer;
      }
      return {
        id: r.$id?.value,
        code,
        hash,
        status,
        forceChange: force === "YES",
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
        return { status: "CREDENTIAL_DENIED", reason: err.message };
      }
      if (cred.status === "DISABLED") {
        return { status: "CREDENTIAL_DENIED", reason: "Account is disabled." };
      }
      if (cred.status === "LOCKED") {
        return { status: "CREDENTIAL_DENIED", reason: "Account is locked." };
      }
      if (cred.lockedUntil && new Date(cred.lockedUntil) > this.now()) {
        return { status: "CREDENTIAL_DENIED", reason: "Account is temporarily locked. Please try again later." };
      }
      const valid = await this.verifyPassword(password, cred.hash);
      if (!valid) {
        const newFailed = cred.failedAttempts + 1;
        const lockedUntil = newFailed >= MAX_FAILED_ATTEMPTS ? new Date(this.now().getTime() + LOCK_DURATION_MS).toISOString() : null;
        await this.api.updateRecord(this.appId, cred.id, {
          Failed_Attempts: { value: newFailed },
          Locked_Until: { value: lockedUntil }
        });
        return { status: "INVALID_CREDENTIALS" };
      }
      await this.api.updateRecord(this.appId, cred.id, {
        Failed_Attempts: { value: 0 },
        Locked_Until: { value: null },
        Last_Login_At: { value: this.now().toISOString() }
      });
      return {
        status: cred.forceChange ? "PASSWORD_CHANGE_REQUIRED" : "AUTHENTICATED",
        employeeCode: cred.code
      };
    }
    // ---------------------------------------------------------------------------
    // Public: Session operations
    // ---------------------------------------------------------------------------
    /**
     * Stores server-side session metadata in App801 for employeeCode.
     * Corrective A: requires exact non-empty kintoneUserCode (no trim/lowercase mutation).
     */
    async storeSession({ employeeCode, tokenHash, issuedAt, expiresAt, kintoneUserCode }) {
      if (typeof tokenHash !== "string" || !/^[0-9a-f]{64}$/i.test(tokenHash)) {
        throw new Error("INVALID_TOKEN_HASH");
      }
      if (!kintoneUserCode || typeof kintoneUserCode !== "string" || kintoneUserCode !== kintoneUserCode.trim() || !kintoneUserCode.trim()) {
        throw new Error("MISSING_KINTONE_PRINCIPAL");
      }
      const cred = await this._getCredential(employeeCode);
      if (cred.status !== "ACTIVE") {
        throw new Error("CREDENTIAL_NOT_ACTIVE");
      }
      if (cred.forceChange) {
        throw new Error("FORCE_PASSWORD_CHANGE_REQUIRED");
      }
      await this.api.updateRecord(this.appId, cred.id, {
        Session_Token_Hash: { value: tokenHash.toLowerCase() },
        Session_Issued_At: { value: issuedAt },
        Session_Expires_At: { value: expiresAt },
        Session_Credential_Version: { value: cred.credentialVersion },
        Session_Kintone_User: { value: kintoneUserCode }
      });
      return { status: "SESSION_STORED", employeeCode: cred.code };
    }
    /**
     * Validates a session token hash against App801.
     * Returns { status: 'VALID_SESSION', employeeCode } or { status: 'INVALID_SESSION', reason }.
     * Never throws for invalid/missing/expired session.
     */
    async validateSession({ tokenHash, currentKintoneUserCode }) {
      try {
        if (typeof tokenHash !== "string" || !/^[0-9a-f]{64}$/i.test(tokenHash)) {
          return { status: "INVALID_SESSION", reason: "Invalid token hash format." };
        }
        if (!currentKintoneUserCode || typeof currentKintoneUserCode !== "string" || currentKintoneUserCode !== currentKintoneUserCode.trim() || !currentKintoneUserCode.trim()) {
          return { status: "INVALID_SESSION", reason: "Missing current Kintone user." };
        }
        const hashLower = tokenHash.toLowerCase();
        const result = await this.api.getRecords(this.appId, `Session_Token_Hash = "${hashLower}" limit 2`);
        const records = result?.records || [];
        if (records.length === 0) {
          return { status: "INVALID_SESSION", reason: "Session token not found." };
        }
        if (records.length > 1) {
          return { status: "INVALID_SESSION", reason: "Duplicate session token hash." };
        }
        const r = records[0];
        const get = (key) => r[key]?.value ?? null;
        const code = get("Employee_Code");
        const status = get("Account_Status");
        const force = get("Force_Password_Change");
        const expiresAtRaw = get("Session_Expires_At");
        const credVerRaw = get("Credential_Version");
        const sessCredVerRaw = get("Session_Credential_Version");
        const sessKintoneUser = get("Session_Kintone_User");
        const normalizedCode = this._normalizeEmployeeCode(code);
        if (status !== "ACTIVE") {
          return { status: "INVALID_SESSION", reason: "Account is not active." };
        }
        if (force !== "NO") {
          return { status: "INVALID_SESSION", reason: "Password change is required." };
        }
        if (!expiresAtRaw || isNaN(Date.parse(expiresAtRaw))) {
          return { status: "INVALID_SESSION", reason: "Invalid or missing expiry date." };
        }
        if (new Date(expiresAtRaw) <= this.now()) {
          return { status: "INVALID_SESSION", reason: "Session has expired." };
        }
        if (credVerRaw === null || credVerRaw === void 0 || credVerRaw === "") {
          return { status: "INVALID_SESSION", reason: "Missing credential version." };
        }
        const credVer = Number(credVerRaw);
        if (isNaN(credVer) || !Number.isInteger(credVer) || credVer <= 0) {
          return { status: "INVALID_SESSION", reason: "Malformed credential version." };
        }
        if (sessCredVerRaw === null || sessCredVerRaw === void 0 || sessCredVerRaw === "") {
          return { status: "INVALID_SESSION", reason: "Missing session credential version." };
        }
        const sessCredVer = Number(sessCredVerRaw);
        if (isNaN(sessCredVer) || !Number.isInteger(sessCredVer) || sessCredVer <= 0 || sessCredVer !== credVer) {
          return { status: "INVALID_SESSION", reason: "Credential version mismatch." };
        }
        if (!sessKintoneUser || typeof sessKintoneUser !== "string" || sessKintoneUser !== sessKintoneUser.trim() || !sessKintoneUser.trim()) {
          return { status: "INVALID_SESSION", reason: "Missing session Kintone user." };
        }
        if (sessKintoneUser !== currentKintoneUserCode) {
          return { status: "INVALID_SESSION", reason: "Kintone user mismatch." };
        }
        return {
          status: "VALID_SESSION",
          employeeCode: normalizedCode
        };
      } catch (err) {
        return { status: "INVALID_SESSION", reason: err.message };
      }
    }
    /**
     * Revokes session fields in App801 for tokenHash.
     * Corrective B: Revoke failure throws stable error string (SESSION_NOT_FOUND, DUPLICATE_SESSION_TOKEN_HASH, SERVER_REVOKE_FAILED).
     */
    async revokeSession({ tokenHash }) {
      if (typeof tokenHash !== "string" || !/^[0-9a-f]{64}$/i.test(tokenHash)) {
        throw new Error("INVALID_TOKEN_HASH");
      }
      const hashLower = tokenHash.toLowerCase();
      const result = await this.api.getRecords(this.appId, `Session_Token_Hash = "${hashLower}" limit 2`);
      const records = result?.records || [];
      if (records.length === 0) {
        throw new Error("SESSION_NOT_FOUND");
      }
      if (records.length > 1) {
        throw new Error("DUPLICATE_SESSION_TOKEN_HASH");
      }
      const recId = records[0].$id?.value;
      try {
        await this.api.updateRecord(this.appId, recId, {
          Session_Token_Hash: { value: null },
          Session_Issued_At: { value: null },
          Session_Expires_At: { value: null },
          Session_Credential_Version: { value: null },
          Session_Kintone_User: { value: null }
        });
      } catch {
        throw new Error("SERVER_REVOKE_FAILED");
      }
      return { status: "SESSION_REVOKED" };
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
        return { status: "CREDENTIAL_DENIED", reason: err.message };
      }
      const valid = await this.verifyPassword(currentPassword, cred.hash);
      if (!valid) {
        return { status: "INVALID_CREDENTIALS", reason: "Current password is incorrect." };
      }
      if (newPassword === cred.code) {
        return { status: "INVALID_PASSWORD", reason: "New password cannot be the same as your Employee Code." };
      }
      const newHash = await this.createPasswordHash(newPassword);
      const newCredVersion = cred.credentialVersion + 1;
      await this.api.updateRecord(this.appId, cred.id, {
        Password_Hash: { value: newHash },
        Password_Changed_At: { value: this.now().toISOString() },
        Force_Password_Change: { value: "NO" },
        Failed_Attempts: { value: 0 },
        Locked_Until: { value: null },
        Credential_Version: { value: newCredVersion },
        Session_Token_Hash: { value: null },
        Session_Issued_At: { value: null },
        Session_Expires_At: { value: null },
        Session_Credential_Version: { value: null },
        Session_Kintone_User: { value: null }
      });
      return { status: "PASSWORD_CHANGED", employeeCode: cred.code, newCredentialVersion: newCredVersion };
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
        return { status: "CREDENTIAL_DENIED", reason: err.message };
      }
      if (cred.forceChange !== true) {
        return { status: "CREDENTIAL_DENIED", reason: "Force password change is not required for this account." };
      }
      if (newPassword === cred.code) {
        return { status: "INVALID_PASSWORD", reason: "New password cannot be the same as your Employee Code." };
      }
      const newHash = await this.createPasswordHash(newPassword);
      const newCredVersion = cred.credentialVersion + 1;
      await this.api.updateRecord(this.appId, cred.id, {
        Password_Hash: { value: newHash },
        Password_Changed_At: { value: this.now().toISOString() },
        Force_Password_Change: { value: "NO" },
        Failed_Attempts: { value: 0 },
        Locked_Until: { value: null },
        Credential_Version: { value: newCredVersion },
        Session_Token_Hash: { value: null },
        Session_Issued_At: { value: null },
        Session_Expires_At: { value: null },
        Session_Credential_Version: { value: null },
        Session_Kintone_User: { value: null }
      });
      return { status: "PASSWORD_CHANGED", employeeCode: cred.code, newCredentialVersion: newCredVersion };
    }
    // ---------------------------------------------------------------------------
    // Public: resetMboPassword (administrative password reset)
    // ---------------------------------------------------------------------------
    /**
     * Resets MBO password for employeeCode to a temporary password equal to Employee_Code.
     * Sets Force_Password_Change=YES, Failed_Attempts=0, clears Locked_Until and session fields,
     * increments Credential_Version by 1, and preserves Account_Status.
     * Does NOT return or expose password, hash, salt, token, or session secret.
     */
    async resetMboPassword({ employeeCode } = {}) {
      let cred;
      try {
        cred = await this._getCredential(employeeCode);
      } catch (err) {
        return { status: "CREDENTIAL_DENIED", reason: err.message };
      }
      const tempPassword = cred.code;
      const newHash = await this.createPasswordHash(tempPassword);
      const newCredVersion = cred.credentialVersion + 1;
      await this.api.updateRecord(this.appId, cred.id, {
        Password_Hash: { value: newHash },
        Password_Changed_At: { value: this.now().toISOString() },
        Force_Password_Change: { value: "YES" },
        Failed_Attempts: { value: 0 },
        Locked_Until: { value: null },
        Credential_Version: { value: newCredVersion },
        Session_Token_Hash: { value: null },
        Session_Issued_At: { value: null },
        Session_Expires_At: { value: null },
        Session_Credential_Version: { value: null },
        Session_Kintone_User: { value: null }
      });
      return { status: "PASSWORD_RESET", employeeCode: cred.code };
    }
  };

  // src/config/d3-route-contract.js
  var D3RouteContractError = class extends Error {
    constructor(code, message, details = null) {
      super(`${code}: ${message}`);
      this.name = "D3RouteContractError";
      this.code = code;
      this.details = details;
    }
  };
  var D3_ROUTE_PATTERNS = Object.freeze({
    PATTERN_1_M1: Object.freeze({
      topology: "M1_ONLY",
      sourceSlots: Object.freeze(["M1"])
    }),
    PATTERN_2_M1_G1: Object.freeze({
      topology: "M1_G1",
      sourceSlots: Object.freeze(["M1", "G1"])
    }),
    PATTERN_3A_M2_M1_G1: Object.freeze({
      topology: "M1_M2_G1",
      sourceSlots: Object.freeze(["M2", "M1", "G1"])
    }),
    PATTERN_3B_M1_G1_G2: Object.freeze({
      topology: "M1_G1_G2",
      sourceSlots: Object.freeze(["M1", "G1", "G2"])
    }),
    PATTERN_4_M2_M1_G1_G2: Object.freeze({
      topology: "M1_M2_G1_G2",
      sourceSlots: Object.freeze(["M2", "M1", "G1", "G2"])
    })
  });
  var D3_SLOT_DEFINITIONS = Object.freeze({
    M1: Object.freeze({
      approverField: "Manager_Level1_Approvers",
      legacyApproverField: "Manager_User",
      approvalRuleField: "Manager_Level1_Approval_Rule"
    }),
    M2: Object.freeze({
      approverField: "Manager_Level2_Approvers",
      legacyApproverField: "First_Manager_User",
      approvalRuleField: "Manager_Level2_Approval_Rule"
    }),
    G1: Object.freeze({
      approverField: "GM_Level1_Approvers",
      legacyApproverField: "GM_User",
      approvalRuleField: "GM_Level1_Approval_Rule"
    }),
    G2: Object.freeze({
      approverField: "GM_Level2_Approvers",
      legacyApproverField: null,
      approvalRuleField: "GM_Level2_Approval_Rule"
    })
  });
  function unwrapD3Field(value) {
    if (value && typeof value === "object" && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, "value")) {
      return value.value;
    }
    return value;
  }
  function readD3String(value) {
    const raw = unwrapD3Field(value);
    if (raw === null || raw === void 0) return "";
    return String(raw).trim();
  }
  function normalizeUserIdentity(rawUser, fieldCode) {
    if (typeof rawUser === "string") {
      const code = rawUser.trim();
      if (!code || rawUser !== code) {
        throw new D3RouteContractError(
          "INVALID_APPRAISER_IDENTITY",
          `Blank user identity in ${fieldCode}.`
        );
      }
      return { code };
    }
    if (rawUser && typeof rawUser === "object") {
      const rawCode = String(rawUser.code ?? rawUser.value ?? "");
      const code = rawCode.trim();
      if (!code || rawCode !== code) {
        throw new D3RouteContractError(
          "INVALID_APPRAISER_IDENTITY",
          `Missing Kintone user code in ${fieldCode}.`
        );
      }
      return { ...rawUser, code };
    }
    throw new D3RouteContractError(
      "INVALID_APPRAISER_IDENTITY",
      `Unsupported user identity in ${fieldCode}.`
    );
  }
  function readD3UserList(value, fieldCode = "USER_SELECT") {
    const raw = unwrapD3Field(value);
    if (raw === null || raw === void 0 || raw === "") return [];
    if (!Array.isArray(raw)) {
      throw new D3RouteContractError(
        "INVALID_SLOT_USER_SHAPE",
        `${fieldCode} must be a USER_SELECT array.`
      );
    }
    return raw.map((user) => normalizeUserIdentity(user, fieldCode));
  }
  function readSlotUsers(routeVersion, slotId) {
    const def = D3_SLOT_DEFINITIONS[slotId];
    const primary = routeVersion?.[def.approverField];
    if (primary !== void 0) {
      return readD3UserList(primary, def.approverField);
    }
    if (def.legacyApproverField && routeVersion?.[def.legacyApproverField] !== void 0) {
      return readD3UserList(
        routeVersion[def.legacyApproverField],
        def.legacyApproverField
      );
    }
    return [];
  }
  function readSlotRule(routeVersion, slotId) {
    const def = D3_SLOT_DEFINITIONS[slotId];
    return readD3String(routeVersion?.[def.approvalRuleField]);
  }
  function parseD3ScorerPrioritySlots(value) {
    let raw = unwrapD3Field(value);
    if (raw === null || raw === void 0 || raw === "") {
      throw new D3RouteContractError(
        "SCORER_PLAN_NOT_CONFIGURED",
        "Scorer_Priority_Slots is missing or blank."
      );
    }
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) {
        throw new D3RouteContractError(
          "SCORER_PLAN_NOT_CONFIGURED",
          "Scorer_Priority_Slots is blank."
        );
      }
      if (trimmed.startsWith("[")) {
        try {
          raw = JSON.parse(trimmed);
        } catch {
          throw new D3RouteContractError(
            "INVALID_SCORER_PLAN",
            "Scorer_Priority_Slots contains malformed JSON."
          );
        }
      } else {
        raw = trimmed.split(",").map((item) => item.trim());
      }
    }
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new D3RouteContractError(
        "INVALID_SCORER_PLAN",
        "Scorer_Priority_Slots must be a non-empty ordered list."
      );
    }
    const slots = raw.map((item) => {
      const candidate = unwrapD3Field(item);
      const parsed = Number(candidate);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 4) {
        throw new D3RouteContractError(
          "INVALID_SCORER_PLAN",
          `Invalid scorer priority slot: ${String(candidate)}.`
        );
      }
      return parsed;
    });
    if (new Set(slots).size !== slots.length) {
      throw new D3RouteContractError(
        "INVALID_SCORER_PLAN",
        "Scorer priority slots must be distinct."
      );
    }
    return slots;
  }
  function getD3RoutePattern(routePattern) {
    const pattern = readD3String(routePattern);
    const contract = D3_ROUTE_PATTERNS[pattern];
    if (!contract) {
      throw new D3RouteContractError(
        "UNKNOWN_ROUTE_PATTERN",
        `Unsupported D3 route pattern: ${pattern || "BLANK"}.`
      );
    }
    return { pattern, ...contract };
  }
  function normalizeD3RouteVersion(routeVersion) {
    if (!routeVersion || typeof routeVersion !== "object") {
      throw new D3RouteContractError(
        "ROUTE_VERSION_NOT_PROVIDED",
        "Route version object is required."
      );
    }
    const { pattern, topology, sourceSlots } = getD3RoutePattern(
      routeVersion.Route_Pattern
    );
    const declaredTopology = readD3String(routeVersion.Routing_Topology);
    if (declaredTopology && declaredTopology !== topology) {
      throw new D3RouteContractError(
        "ROUTE_PATTERN_TOPOLOGY_MISMATCH",
        `Route pattern ${pattern} requires ${topology}, received ${declaredTopology}.`
      );
    }
    const activeSlotIds = new Set(sourceSlots);
    const slotState = {};
    const allConfiguredCodes = [];
    for (const slotId of Object.keys(D3_SLOT_DEFINITIONS)) {
      const users = readSlotUsers(routeVersion, slotId);
      const rule = readSlotRule(routeVersion, slotId);
      if (rule && rule !== "ALL") {
        throw new D3RouteContractError(
          "D3_V1_APPROVAL_RULE_NOT_ALL",
          `${slotId} approval rule must be ALL in D3 V1.`
        );
      }
      if (activeSlotIds.has(slotId)) {
        if (users.length !== 1) {
          throw new D3RouteContractError(
            "D3_V1_SLOT_USER_COUNT_INVALID",
            `${slotId} must contain exactly one Kintone user in D3 V1.`,
            { slotId, count: users.length }
          );
        }
        if (rule !== "ALL") {
          throw new D3RouteContractError(
            "D3_V1_APPROVAL_RULE_NOT_ALL",
            `${slotId} approval rule must be explicitly ALL in D3 V1.`
          );
        }
        allConfiguredCodes.push(users[0].code);
      } else if (users.length !== 0) {
        throw new D3RouteContractError(
          "INACTIVE_ROUTE_SLOT_POPULATED",
          `${slotId} must be empty for route pattern ${pattern}.`
        );
      }
      slotState[slotId] = { users, rule };
    }
    if (new Set(allConfiguredCodes).size !== allConfiguredCodes.length) {
      throw new D3RouteContractError(
        "DUPLICATE_APPRAISER_IDENTITY",
        "The same Kintone user cannot occupy more than one D3 V1 sequential slot."
      );
    }
    const routingKey = readD3String(routeVersion.Routing_Key);
    const versionKey = readD3String(routeVersion.Version_Key);
    const versionNumberRaw = readD3String(routeVersion.Version_Number);
    const versionNumber = Number(versionNumberRaw);
    if (!routingKey) {
      throw new D3RouteContractError(
        "ROUTING_KEY_REQUIRED",
        "Routing_Key is required for a D3 route version."
      );
    }
    if (!versionKey) {
      throw new D3RouteContractError(
        "INVALID_ROUTE_VERSION_IDENTITY",
        "Version_Key is required for a D3 route version."
      );
    }
    if (!Number.isInteger(versionNumber) || versionNumber < 1) {
      throw new D3RouteContractError(
        "INVALID_ROUTE_VERSION_NUMBER",
        `Version_Number must be a positive integer, received ${versionNumberRaw || "BLANK"}.`
      );
    }
    const businessSlots = sourceSlots.map((slotId, index) => {
      const def = D3_SLOT_DEFINITIONS[slotId];
      return {
        ordinal: index + 1,
        sourceOrdinal: index + 1,
        sourceSlot: slotId,
        targetSlot: slotId,
        fieldCode: def.approverField,
        approvalRule: "ALL",
        user: slotState[slotId].users[0]
      };
    });
    return {
      routingKey,
      versionKey,
      versionNumber,
      routePattern: pattern,
      topology,
      businessSlots
    };
  }
  function compactedPatternFor(routeContract, removedOrdinal) {
    const remainingCount = routeContract.businessSlots.length - 1;
    if (remainingCount === 0) {
      throw new D3RouteContractError(
        "SELF_APPROVAL_ROUTE_CONFLICT",
        "Self-elision leaves zero surviving appraisers."
      );
    }
    if (remainingCount === 1) return "PATTERN_1_M1";
    if (remainingCount === 2) return "PATTERN_2_M1_G1";
    if (remainingCount === 3 && routeContract.routePattern === "PATTERN_4_M2_M1_G1_G2") {
      return removedOrdinal <= 2 ? "PATTERN_3B_M1_G1_G2" : "PATTERN_3A_M2_M1_G1";
    }
    throw new D3RouteContractError(
      "SELF_ELISION_PATTERN_UNRESOLVED",
      "Unable to derive a valid compacted D3 route pattern."
    );
  }
  function applyD3SelfElision(routeContract, employeeUserCode, isOwnMbo = false) {
    if (!routeContract || !Array.isArray(routeContract.businessSlots)) {
      throw new D3RouteContractError(
        "INVALID_ROUTE_CONTRACT",
        "Normalized route contract is required."
      );
    }
    if (!isOwnMbo) {
      return {
        ...routeContract,
        businessSlots: routeContract.businessSlots.map((slot) => ({ ...slot })),
        selfAppraiserElided: false,
        removedSourceOrdinal: null
      };
    }
    const employeeCode = String(employeeUserCode ?? "");
    if (!employeeCode || employeeCode !== employeeCode.trim()) {
      throw new D3RouteContractError(
        "MISSING_DEDICATED_USER_CODE",
        "Exact nonblank Kintone user code is required for own-MBO self-elision."
      );
    }
    const removed = routeContract.businessSlots.find(
      (slot) => slot.user.code === employeeCode
    );
    if (!removed) {
      return {
        ...routeContract,
        businessSlots: routeContract.businessSlots.map((slot) => ({ ...slot })),
        selfAppraiserElided: false,
        removedSourceOrdinal: null
      };
    }
    const survivors = routeContract.businessSlots.filter(
      (slot) => slot.user.code !== employeeCode
    );
    if (survivors.length === 0) {
      throw new D3RouteContractError(
        "SELF_APPROVAL_ROUTE_CONFLICT",
        "Self-elision leaves zero surviving appraisers."
      );
    }
    const effectivePattern = routeContract.businessSlots.length === survivors.length ? routeContract.routePattern : compactedPatternFor(routeContract, removed.sourceOrdinal);
    const effectiveDefinition = D3_ROUTE_PATTERNS[effectivePattern];
    const compactedSlots = survivors.map((slot, index) => ({
      ...slot,
      ordinal: index + 1,
      targetSlot: effectiveDefinition.sourceSlots[index],
      targetFieldCode: D3_SLOT_DEFINITIONS[effectiveDefinition.sourceSlots[index]].approverField
    }));
    return {
      ...routeContract,
      routePattern: effectivePattern,
      topology: effectiveDefinition.topology,
      businessSlots: compactedSlots,
      selfAppraiserElided: true,
      removedSourceOrdinal: removed.sourceOrdinal
    };
  }

  // src/services/d3-route-viability-service.js
  var D3RouteViabilityError = class extends Error {
    constructor(code, message, details = null) {
      super(`${code}: ${message}`);
      this.name = "D3RouteViabilityError";
      this.code = code;
      this.details = details;
    }
  };
  function failFromContract(error) {
    if (error instanceof D3RouteContractError) {
      throw new D3RouteViabilityError(error.code, error.message.replace(/^[^:]+:\s*/, ""), error.details);
    }
    throw error;
  }
  function normalizeKExpected(value) {
    const raw = unwrapD3Field(value);
    const parsed = Number(raw);
    if (parsed !== 1 && parsed !== 2) {
      throw new D3RouteViabilityError(
        "INVALID_K_EXPECTED",
        `K_expected must be exactly 1 or 2, received ${String(raw)}.`
      );
    }
    return parsed;
  }
  function exactEmployeeCode(value, required) {
    const code = String(value ?? "");
    if (!required && !code) return "";
    if (!code || code !== code.trim()) {
      throw new D3RouteViabilityError(
        "MISSING_DEDICATED_USER_CODE",
        "Exact nonblank Kintone user code is required for own-MBO evaluation."
      );
    }
    return code;
  }
  function evaluateD3RouteViability({
    routeVersion,
    kExpected,
    employeeUserCode = "",
    isOwnMbo = false,
    scorerPrioritySlots
  }) {
    const requiredK = normalizeKExpected(kExpected);
    let configuredRoute;
    try {
      configuredRoute = normalizeD3RouteVersion(routeVersion);
    } catch (error) {
      failFromContract(error);
    }
    const employeeCode = exactEmployeeCode(employeeUserCode, isOwnMbo);
    let effectiveRoute;
    try {
      effectiveRoute = applyD3SelfElision(
        configuredRoute,
        employeeCode,
        isOwnMbo
      );
    } catch (error) {
      failFromContract(error);
    }
    if (effectiveRoute.businessSlots.length < requiredK) {
      throw new D3RouteViabilityError(
        "INSUFFICIENT_EFFECTIVE_APPRAISERS",
        `Surviving workflow appraisers (${effectiveRoute.businessSlots.length}) are fewer than K_expected (${requiredK}).`
      );
    }
    let prioritySlots;
    try {
      prioritySlots = parseD3ScorerPrioritySlots(
        scorerPrioritySlots !== void 0 ? scorerPrioritySlots : routeVersion?.Scorer_Priority_Slots
      );
    } catch (error) {
      failFromContract(error);
    }
    for (const priority of prioritySlots) {
      if (priority > configuredRoute.businessSlots.length) {
        throw new D3RouteViabilityError(
          "INVALID_SCORER_PLAN",
          `Scorer priority slot ${priority} does not exist in the configured route.`
        );
      }
    }
    const survivingCodes = new Set(
      effectiveRoute.businessSlots.map((slot) => slot.user.code)
    );
    const authorizedCandidates = [];
    for (const sourceOrdinal of prioritySlots) {
      const configuredSlot = configuredRoute.businessSlots.find(
        (slot) => slot.sourceOrdinal === sourceOrdinal
      );
      if (!configuredSlot || !survivingCodes.has(configuredSlot.user.code)) {
        continue;
      }
      if (!authorizedCandidates.some((item) => item.user.code === configuredSlot.user.code)) {
        authorizedCandidates.push(configuredSlot);
      }
    }
    if (authorizedCandidates.length < requiredK) {
      throw new D3RouteViabilityError(
        "SCORING_ROUTE_INCOMPLETE_AFTER_SELF_ELISION",
        `Surviving HR-authorized scorers (${authorizedCandidates.length}) are fewer than K_expected (${requiredK}).`,
        {
          prioritySlots,
          survivingCandidateCodes: authorizedCandidates.map((item) => item.user.code)
        }
      );
    }
    const selected = authorizedCandidates.slice(0, requiredK);
    if (requiredK === 2 && selected[0].user.code === selected[1].user.code) {
      throw new D3RouteViabilityError(
        "DUPLICATE_SCORER_IDENTITY",
        "K=2 requires two distinct scorer identities."
      );
    }
    if (isOwnMbo && selected.some((slot) => slot.user.code === employeeCode)) {
      throw new D3RouteViabilityError(
        "SELF_SCORING_CONFLICT",
        "Target employee cannot score their own MBO."
      );
    }
    const weights = requiredK === 1 ? [100] : [50, 50];
    const activeScorers = selected.map((configuredSlot, index) => {
      const effectiveSlot = effectiveRoute.businessSlots.find(
        (slot) => slot.user.code === configuredSlot.user.code
      );
      return {
        scorerRank: index + 1,
        sourceOrdinal: configuredSlot.sourceOrdinal,
        effectiveOrdinal: effectiveSlot?.ordinal ?? null,
        user: configuredSlot.user,
        weight: weights[index]
      };
    });
    return {
      status: "PASS",
      code: "VIABLE",
      configuredRoute,
      effectiveRoute,
      kExpected: requiredK,
      scorerPrioritySlots: prioritySlots,
      activeScorers,
      scorerWeights: weights,
      routeVersionKey: configuredRoute.versionKey,
      routingKey: configuredRoute.routingKey
    };
  }

  // src/config/constants.js
  var BUSINESS_STAGES = {
    NEW_RECORD: "NEW_RECORD",
    OBJECTIVE_INPUT: "OBJECTIVE_INPUT",
    MIDYEAR_INPUT: "MIDYEAR_INPUT",
    SELF_EVALUATION: "SELF_EVALUATION",
    READ_ONLY: "READ_ONLY",
    CONFIGURATION_ERROR: "CONFIGURATION_ERROR"
  };
  var STATUS_TO_STAGE_MAP = {
    "01 Draft Objective": BUSINESS_STAGES.OBJECTIVE_INPUT,
    "02 First Manager Objective Review": BUSINESS_STAGES.READ_ONLY,
    "03 Manager Objective Review": BUSINESS_STAGES.READ_ONLY,
    "04 GM Objective Review": BUSINESS_STAGES.READ_ONLY,
    "05 Objective Approved": BUSINESS_STAGES.READ_ONLY,
    "06 Employee Mid-Year": BUSINESS_STAGES.MIDYEAR_INPUT,
    "07 First Manager Mid-Year Review": BUSINESS_STAGES.READ_ONLY,
    "08 Manager Mid-Year Review": BUSINESS_STAGES.READ_ONLY,
    "09 GM Mid-Year Review": BUSINESS_STAGES.READ_ONLY,
    "10 Mid-Year Completed": BUSINESS_STAGES.READ_ONLY,
    "11 Employee Self Evaluation": BUSINESS_STAGES.SELF_EVALUATION,
    "12 First Manager Final Evaluation": BUSINESS_STAGES.READ_ONLY,
    "13 Manager Final Evaluation": BUSINESS_STAGES.READ_ONLY,
    "14 GM Final Evaluation": BUSINESS_STAGES.READ_ONLY,
    "15 HR Final Check": BUSINESS_STAGES.READ_ONLY,
    "16 Completed": BUSINESS_STAGES.READ_ONLY
  };

  // src/validation/validation-engine.js
  var D3_PROCESS_CAPABILITY_ID = "D3_V1_19_STATE_40_ACTION";
  var D3_ACTIVE_ROUTE_SLOTS = {
    M1_ONLY: ["M1"],
    M1_G1: ["M1", "G1"],
    M1_M2_G1: ["M2", "M1", "G1"],
    M1_G1_G2: ["M1", "G1", "G2"],
    M1_M2_G1_G2: ["M2", "M1", "G1", "G2"]
  };
  var D3_SLOT_FIELD_MAP = {
    M2: { approverField: "Manager_Level2_Approvers", ruleField: "Manager_Level2_Approval_Rule" },
    M1: { approverField: "Manager_Level1_Approvers", ruleField: "Manager_Level1_Approval_Rule" },
    G1: { approverField: "GM_Level1_Approvers", ruleField: "GM_Level1_Approval_Rule" },
    G2: { approverField: "GM_Level2_Approvers", ruleField: "GM_Level2_Approval_Rule" }
  };

  // src/services/hr-routing-management-service-d3imp06-base.js
  var HrRoutingManagementServiceError = class extends Error {
    constructor(code, message, details = null) {
      super(`${code}: ${message}`);
      this.name = "HrRoutingManagementServiceError";
      this.code = code;
      this.details = details;
    }
  };
  var ROUTING_ROLES = Object.freeze({
    HR: "hr",
    ADMIN_FORM: "admin-form"
  });
  var ROUTING_PERMISSIONS = Object.freeze({
    VIEW: "VIEW",
    PREVIEW: "PREVIEW",
    VALIDATE: "VALIDATE",
    CREATE_DRAFT: "CREATE_DRAFT",
    EDIT_DRAFT: "EDIT_DRAFT",
    PUBLISH: "PUBLISH",
    SUPERSEDE: "SUPERSEDE"
  });
  var ROUTING_STATUSES = Object.freeze({
    DRAFT: "DRAFT",
    ACTIVE: "ACTIVE",
    SUPERSEDED: "SUPERSEDED",
    CANCELLED: "CANCELLED"
  });
  var TOPOLOGIES = Object.freeze({
    M1_ONLY: "M1_ONLY",
    M1_G1: "M1_G1",
    M1_M2_G1: "M1_M2_G1",
    M1_G1_G2: "M1_G1_G2",
    M1_M2_G1_G2: "M1_M2_G1_G2"
  });
  var TOPOLOGY_TO_PATTERN_MAP = Object.freeze({
    [TOPOLOGIES.M1_ONLY]: "PATTERN_1_M1",
    [TOPOLOGIES.M1_G1]: "PATTERN_2_M1_G1",
    [TOPOLOGIES.M1_M2_G1]: "PATTERN_3A_M2_M1_G1",
    [TOPOLOGIES.M1_G1_G2]: "PATTERN_3B_M1_G1_G2",
    [TOPOLOGIES.M1_M2_G1_G2]: "PATTERN_4_M2_M1_G1_G2"
  });
  var TOPOLOGY_CONFIGS = Object.freeze({
    [TOPOLOGIES.M1_ONLY]: Object.freeze({
      slots: Object.freeze(["M1"]),
      label: "M1 Only (1 Appraiser)"
    }),
    [TOPOLOGIES.M1_G1]: Object.freeze({
      slots: Object.freeze(["M1", "G1"]),
      label: "M1 + G1 (2 Appraisers)"
    }),
    [TOPOLOGIES.M1_M2_G1]: Object.freeze({
      slots: Object.freeze(["M1", "M2", "G1"]),
      label: "M1 + M2 + G1 (3 Appraisers)"
    }),
    [TOPOLOGIES.M1_G1_G2]: Object.freeze({
      slots: Object.freeze(["M1", "G1", "G2"]),
      label: "M1 + G1 + G2 (3 Appraisers)"
    }),
    [TOPOLOGIES.M1_M2_G1_G2]: Object.freeze({
      slots: Object.freeze(["M1", "M2", "G1", "G2"]),
      label: "M1 + M2 + G1 + G2 (4 Appraisers)"
    })
  });
  function hasHrCapability(principal) {
    try {
      const norm = validatePrincipal(principal);
      return norm.groups.some((g) => g.toLowerCase() === ROUTING_ROLES.HR.toLowerCase());
    } catch (_) {
      return false;
    }
  }
  function hasAdminFormCapability(principal) {
    try {
      const norm = validatePrincipal(principal);
      return norm.groups.some((g) => g.toLowerCase() === ROUTING_ROLES.ADMIN_FORM.toLowerCase());
    } catch (_) {
      return false;
    }
  }
  function convertSlotNamesToOrdinals(slotNamesOrOrdinals, pattern) {
    const unwrapped = unwrapD3Field(slotNamesOrOrdinals);
    if (unwrapped === null || unwrapped === void 0 || unwrapped === "") return "";
    const patternInfo = D3_ROUTE_PATTERNS[pattern];
    const sourceSlots = patternInfo ? patternInfo.sourceSlots : ["M1"];
    const items = Array.isArray(unwrapped) ? unwrapped : String(unwrapped).split(",").map((s) => s.trim());
    const ordinals = [];
    for (const item of items) {
      if (!item) continue;
      const num = Number(item);
      if (Number.isInteger(num)) {
        if (!ordinals.includes(num)) ordinals.push(num);
      } else {
        const idx = sourceSlots.indexOf(item);
        if (idx !== -1) {
          const ord = idx + 1;
          if (!ordinals.includes(ord)) ordinals.push(ord);
        } else {
          ordinals.push(item);
        }
      }
    }
    return ordinals.join(",");
  }
  function buildCandidateRecordFromDraft(draft = {}) {
    const topology = draft.topology || TOPOLOGIES.M1_ONLY;
    const pattern = draft.routePattern || TOPOLOGY_TO_PATTERN_MAP[topology] || "PATTERN_1_M1";
    const rawScorer = draft.scorerPrioritySlots || (draft.scorerSlots ? [draft.scorerSlots.midYear, draft.scorerSlots.final1, draft.scorerSlots.final2].filter(Boolean) : "1");
    const resolvedScorerOrdinals = convertSlotNamesToOrdinals(rawScorer, pattern);
    const record = {
      Routing_Key: { value: draft.routingKey || "" },
      Route_Pattern: { value: pattern },
      Routing_Topology: { value: topology },
      Effective_From: { value: draft.effectiveFrom || "" },
      Effective_To: { value: draft.effectiveTo || "" },
      Remark: { value: draft.businessReason || draft.remark || "" },
      Scorer_Priority_Slots: { value: resolvedScorerOrdinals }
    };
    const slots = draft.slots || {};
    const slotMapping = {
      M1: { approver: "Manager_Level1_Approvers", rule: "Manager_Level1_Approval_Rule" },
      M2: { approver: "Manager_Level2_Approvers", rule: "Manager_Level2_Approval_Rule" },
      G1: { approver: "GM_Level1_Approvers", rule: "GM_Level1_Approval_Rule" },
      G2: { approver: "GM_Level2_Approvers", rule: "GM_Level2_Approval_Rule" }
    };
    for (const [slot, { approver, rule }] of Object.entries(slotMapping)) {
      const code = slots[slot];
      if (code) {
        record[approver] = { value: [{ code }] };
        record[rule] = { value: "ALL" };
      } else {
        record[approver] = { value: [] };
        record[rule] = { value: "ALL" };
      }
    }
    return record;
  }
  function validatePrincipal(principal) {
    if (!principal || typeof principal !== "object") {
      throw new HrRoutingManagementServiceError(
        "ROUTING_PRINCIPAL_REQUIRED",
        "Security principal is required for routing management."
      );
    }
    const { userCode, groups } = principal;
    if (typeof userCode !== "string" || !userCode.trim() || userCode !== userCode.trim()) {
      throw new HrRoutingManagementServiceError(
        "ROUTING_PRINCIPAL_INVALID",
        "Principal userCode must be a non-empty string without leading or trailing whitespace."
      );
    }
    if (!Array.isArray(groups) || groups.length === 0 || !groups.every((g) => typeof g === "string" && g.trim().length > 0)) {
      throw new HrRoutingManagementServiceError(
        "ROUTING_PRINCIPAL_INVALID",
        "Principal groups must be a non-empty array of non-empty strings."
      );
    }
    return {
      userCode: userCode.trim(),
      groups: groups.map((g) => g.trim())
    };
  }
  function checkRoutingAuthorization(principal, action) {
    const norm = validatePrincipal(principal);
    const isHr = norm.groups.includes(ROUTING_ROLES.HR);
    const isAdminForm = norm.groups.includes(ROUTING_ROLES.ADMIN_FORM);
    switch (action) {
      case ROUTING_PERMISSIONS.VIEW:
      case ROUTING_PERMISSIONS.PREVIEW:
      case ROUTING_PERMISSIONS.VALIDATE:
        if (!isHr && !isAdminForm) {
          throw new HrRoutingManagementServiceError(
            "ROUTING_AUTHORIZATION_DENIED",
            `Principal ${norm.userCode} lacks view/preview authorization (requires hr or admin-form).`
          );
        }
        return true;
      case ROUTING_PERMISSIONS.CREATE_DRAFT:
      case ROUTING_PERMISSIONS.EDIT_DRAFT:
      case ROUTING_PERMISSIONS.PUBLISH:
      case ROUTING_PERMISSIONS.SUPERSEDE:
        if (!isHr) {
          throw new HrRoutingManagementServiceError(
            "ROUTING_HR_AUTHORIZATION_REQUIRED",
            `Principal ${norm.userCode} lacks HR business authorization for action: ${action}. admin-form alone is not authorized.`
          );
        }
        return true;
      default:
        throw new HrRoutingManagementServiceError(
          "ROUTING_UNKNOWN_ACTION",
          `Unknown routing authorization action: ${action}.`
        );
    }
  }
  function validateDateString(dateStr, fieldName = "Date") {
    const unwrapped = readD3String(dateStr);
    const clean = String(unwrapped ?? "").trim();
    if (!clean) return "";
    if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
      throw new HrRoutingManagementServiceError(
        "ROUTING_INVALID_DATE_FORMAT",
        `${fieldName} must be formatted as YYYY-MM-DD (received: "${clean}").`
      );
    }
    const d = /* @__PURE__ */ new Date(`${clean}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== clean) {
      throw new HrRoutingManagementServiceError(
        "ROUTING_INVALID_DATE_CALENDAR",
        `${fieldName} is not a valid calendar date: "${clean}".`
      );
    }
    return clean;
  }
  function validateEffectiveInterval(effectiveFrom, effectiveTo) {
    const from = validateDateString(effectiveFrom, "Effective_From");
    if (!from) {
      throw new HrRoutingManagementServiceError(
        "ROUTING_EFFECTIVE_FROM_REQUIRED",
        "Effective_From is required for routing versions."
      );
    }
    const to = effectiveTo ? validateDateString(effectiveTo, "Effective_To") : "";
    if (to && to < from) {
      throw new HrRoutingManagementServiceError(
        "ROUTING_INVALID_EFFECTIVE_INTERVAL",
        `Effective_To ("${to}") cannot precede Effective_From ("${from}").`
      );
    }
    return { effectiveFrom: from, effectiveTo: to };
  }
  function validateBusinessReason(reason) {
    const unwrapped = readD3String(reason);
    if (unwrapped === null || unwrapped === void 0 || typeof unwrapped !== "string" || !unwrapped.trim()) {
      throw new HrRoutingManagementServiceError(
        "ROUTING_BUSINESS_REASON_REQUIRED",
        "Non-empty business reason (Remark) is required for routing mutations."
      );
    }
    return unwrapped.trim();
  }
  function deriveNextVersionNumber(existingVersions, routingKey) {
    const matching = (existingVersions || []).filter((v) => {
      const rk = readD3String(v?.Routing_Key);
      return rk === routingKey;
    });
    if (matching.length === 0) {
      return 1;
    }
    const numbers = [];
    for (const v of matching) {
      const rawNum = readD3String(v?.Version_Number);
      const num = Number(rawNum);
      if (!Number.isInteger(num) || num < 1) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_VERSION_HISTORY_INCOMPLETE",
          `Version history for Routing_Key "${routingKey}" contains invalid Version_Number "${rawNum}".`
        );
      }
      numbers.push(num);
    }
    const max = Math.max(...numbers);
    return max + 1;
  }
  function generateCanonicalVersionKey(routingKey, versionNumber) {
    if (!routingKey || typeof routingKey !== "string" || !routingKey.trim()) {
      throw new HrRoutingManagementServiceError(
        "ROUTING_KEY_REQUIRED",
        "Routing_Key is required to generate Version_Key."
      );
    }
    if (!Number.isInteger(versionNumber) || versionNumber < 1) {
      throw new HrRoutingManagementServiceError(
        "ROUTING_INVALID_VERSION_NUMBER",
        `Version_Number must be a positive integer, received: ${versionNumber}.`
      );
    }
    return `${routingKey.trim()}#v${versionNumber}`;
  }
  function checkIntervalOverlap(candidateFrom, candidateTo, existingActiveVersions, currentVersionKey = "") {
    const fromA = candidateFrom;
    const toA = candidateTo || "9999-12-31";
    for (const v of existingActiveVersions || []) {
      const vKey = readD3String(v?.Version_Key);
      if (currentVersionKey && vKey === currentVersionKey) {
        continue;
      }
      const status = readD3String(v?.Version_Status);
      if (status !== "ACTIVE") {
        continue;
      }
      const fromB = readD3String(v?.Effective_From);
      const toB = readD3String(v?.Effective_To) || "9999-12-31";
      if (!fromB) continue;
      if (fromA <= toB && fromB <= toA) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_EFFECTIVE_INTERVAL_OVERLAP",
          `Proposed effective interval [${fromA}..${candidateTo || "open"}] overlaps with active version "${vKey}" [${fromB}..${v?.Effective_To ? readD3String(v.Effective_To) : "open"}].`
        );
      }
    }
  }
  var HrRoutingManagementService = class _HrRoutingManagementService {
    /**
     * Filter and view version history for a Routing_Key.
     * Authorized for both 'hr' and 'admin-form'.
     */
    static getRoutingVersionHistory({ principal, records = [], routingKey }) {
      checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.VIEW);
      const cleanRoutingKey = String(routingKey ?? "").trim();
      if (!cleanRoutingKey) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_KEY_REQUIRED",
          "Routing_Key is required to view version history."
        );
      }
      const versions = records.filter((r) => readD3String(r?.Routing_Key) === cleanRoutingKey).map((r) => ({
        routingKey: readD3String(r.Routing_Key),
        versionKey: readD3String(r.Version_Key),
        versionNumber: Number(readD3String(r.Version_Number)),
        versionStatus: readD3String(r.Version_Status),
        routePattern: readD3String(r.Route_Pattern),
        routingTopology: readD3String(r.Routing_Topology),
        effectiveFrom: readD3String(r.Effective_From),
        effectiveTo: readD3String(r.Effective_To),
        scorerPrioritySlots: readD3String(r.Scorer_Priority_Slots),
        remark: readD3String(r.Remark),
        recordRevision: r?.$revision?.value !== void 0 ? String(r.$revision.value) : r?.$revision ? String(r.$revision) : null,
        rawRecord: r
      })).sort((a, b) => (b.versionNumber || 0) - (a.versionNumber || 0));
      return {
        routingKey: cleanRoutingKey,
        totalVersions: versions.length,
        versions
      };
    }
    /**
     * Validate a route version candidate against all D3 V1 invariants.
     * Authorized for both 'hr' and 'admin-form'.
     */
    static validateRouteCandidate({
      principal,
      routeCandidate,
      kExpected = 1,
      existingRecords = [],
      processCapabilityId = D3_PROCESS_CAPABILITY_ID
    }) {
      checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.VALIDATE);
      if (processCapabilityId !== D3_PROCESS_CAPABILITY_ID) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_PROCESS_CAPABILITY_REQUIRED",
          `Exact process capability "${D3_PROCESS_CAPABILITY_ID}" is required (received: "${processCapabilityId || "BLANK"}").`
        );
      }
      if (!routeCandidate || typeof routeCandidate !== "object") {
        throw new HrRoutingManagementServiceError(
          "ROUTING_CANDIDATE_REQUIRED",
          "Route candidate object is required for validation."
        );
      }
      const rawPattern = readD3String(routeCandidate.Route_Pattern);
      const patternInfo = getD3RoutePattern(rawPattern);
      const topology = patternInfo.topology;
      const declaredTopology = readD3String(routeCandidate.Routing_Topology);
      if (declaredTopology && declaredTopology !== topology) {
        throw new HrRoutingManagementServiceError(
          "ROUTE_PATTERN_TOPOLOGY_MISMATCH",
          `Pattern ${rawPattern} requires topology ${topology}, found "${declaredTopology}".`
        );
      }
      const activeSlotKeys = D3_ACTIVE_ROUTE_SLOTS[topology] || [];
      const seenCodes = /* @__PURE__ */ new Map();
      for (const slotKey of activeSlotKeys) {
        const { approverField, ruleField } = D3_SLOT_FIELD_MAP[slotKey];
        const rawUsers = unwrapD3Field(routeCandidate[approverField]);
        const users = Array.isArray(rawUsers) ? rawUsers : [];
        if (users.length === 0) {
          throw new HrRoutingManagementServiceError(
            "D3_V1_SLOT_USER_COUNT_INVALID",
            `Active slot ${slotKey} (${approverField}) is empty. Exactly 1 user is required.`
          );
        }
        if (users.length > 1) {
          throw new HrRoutingManagementServiceError(
            "D3_V1_SLOT_USER_COUNT_INVALID",
            `Active slot ${slotKey} (${approverField}) must have exactly 1 user (found ${users.length}).`
          );
        }
        const u = users[0];
        const isObj = typeof u === "object" && u !== null && !Array.isArray(u);
        const code = isObj ? u.code : void 0;
        const isStr = typeof code === "string";
        const isNonEmpty = isStr && code.length > 0;
        const isNotWs = isStr && code.trim().length > 0;
        if (!isObj || !isStr || !isNonEmpty || !isNotWs) {
          throw new HrRoutingManagementServiceError(
            "INVALID_APPRAISER_IDENTITY",
            `Slot ${slotKey} must contain a valid Kintone user object with exact non-empty code.`
          );
        }
        const rawRule = unwrapD3Field(routeCandidate[ruleField]);
        const rule = String(rawRule ?? "");
        if (rule !== "ALL") {
          throw new HrRoutingManagementServiceError(
            "D3_V1_APPROVAL_RULE_NOT_ALL",
            `Active slot ${slotKey} rule (${ruleField}) must be strictly ALL (found "${rule}").`
          );
        }
        if (seenCodes.has(code)) {
          const prior = seenCodes.get(code);
          throw new HrRoutingManagementServiceError(
            "DUPLICATE_APPRAISER_IDENTITY",
            `Duplicate appraiser user "${code}" in active slots (${prior} and ${slotKey}).`
          );
        }
        seenCodes.set(code, slotKey);
      }
      const { effectiveFrom, effectiveTo } = validateEffectiveInterval(
        routeCandidate.Effective_From,
        routeCandidate.Effective_To
      );
      let viability;
      const rawScorer = routeCandidate.Scorer_Priority_Slots;
      const resolvedScorer = convertSlotNamesToOrdinals(rawScorer, rawPattern);
      const candidateWithResolvedScorer = {
        ...routeCandidate,
        Scorer_Priority_Slots: { value: resolvedScorer }
      };
      try {
        viability = evaluateD3RouteViability({
          routeVersion: candidateWithResolvedScorer,
          kExpected,
          scorerPrioritySlots: resolvedScorer
        });
      } catch (err) {
        if (err instanceof D3RouteViabilityError || err instanceof D3RouteContractError) {
          throw new HrRoutingManagementServiceError(err.code, err.message.replace(/^[^:]+:\s*/, ""));
        }
        throw err;
      }
      return {
        isValid: true,
        topology,
        routePattern: rawPattern,
        effectiveFrom,
        effectiveTo,
        activeSlotKeys,
        viability
      };
    }
    /**
     * Create a DRAFT route plan.
     * Strictly HR-only. Local mutation plan only.
     */
    static createDraftRoutePlan({
      principal,
      records = [],
      draftInput = {},
      processCapabilityId = D3_PROCESS_CAPABILITY_ID,
      kExpected = 1
    }) {
      checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.CREATE_DRAFT);
      const reason = validateBusinessReason(draftInput.Remark);
      const routingKey = String(draftInput.Routing_Key ?? "").trim();
      if (!routingKey) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_KEY_REQUIRED",
          "Routing_Key is required to create a DRAFT route."
        );
      }
      const versionNumber = deriveNextVersionNumber(records, routingKey);
      const versionKey = generateCanonicalVersionKey(routingKey, versionNumber);
      const patternInfo = getD3RoutePattern(draftInput.Route_Pattern);
      const candidate = {
        ...draftInput,
        Routing_Key: routingKey,
        Version_Key: versionKey,
        Version_Number: versionNumber,
        Version_Status: "DRAFT",
        Route_Pattern: patternInfo.pattern,
        Routing_Topology: patternInfo.topology,
        Remark: reason
      };
      _HrRoutingManagementService.validateRouteCandidate({
        principal,
        routeCandidate: candidate,
        kExpected,
        existingRecords: records,
        processCapabilityId
      });
      return {
        status: "PLAN_CREATED",
        operation: "CREATE_DRAFT",
        current: null,
        proposed: candidate,
        mutationsPlanned: [
          {
            app: 795,
            action: "INSERT_DRAFT",
            record: candidate
          }
        ],
        noMutationExecuted: true
      };
    }
    /**
     * Edit an existing DRAFT route plan.
     * Strictly HR-only. Local mutation plan only.
     */
    static editDraftRoutePlan({
      principal,
      records = [],
      versionKey,
      expectedRevision: expectedRevision2,
      draftInput = {},
      processCapabilityId = D3_PROCESS_CAPABILITY_ID,
      kExpected = 1
    }) {
      checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.EDIT_DRAFT);
      if (expectedRevision2 === void 0 || expectedRevision2 === null || String(expectedRevision2).trim() === "") {
        throw new HrRoutingManagementServiceError(
          "ROUTING_REVISION_REQUIRED",
          "Explicit expected revision is required to edit a DRAFT route."
        );
      }
      const cleanVk = String(versionKey ?? "").trim();
      const existing = (records || []).find((r) => readD3String(r?.Version_Key) === cleanVk);
      if (!existing) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_VERSION_NOT_FOUND",
          `Route version with Version_Key "${cleanVk}" was not found.`
        );
      }
      const actualRev = existing.$revision?.value !== void 0 ? String(existing.$revision.value) : existing.$revision ? String(existing.$revision) : "";
      if (actualRev && actualRev !== String(expectedRevision2).trim()) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_REVISION_CONFLICT",
          `Revision conflict: expected revision ${expectedRevision2}, actual revision ${actualRev}.`
        );
      }
      const status = readD3String(existing.Version_Status);
      if (status !== "DRAFT") {
        throw new HrRoutingManagementServiceError(
          "ROUTING_LIFECYCLE_IMMUTABLE",
          `Only DRAFT versions can be edited. Version "${cleanVk}" is in status "${status}".`
        );
      }
      const reason = validateBusinessReason(draftInput.Remark);
      const patternInfo = getD3RoutePattern(draftInput.Route_Pattern || existing.Route_Pattern);
      const updated = {
        ...existing,
        ...draftInput,
        Routing_Key: readD3String(existing.Routing_Key),
        Version_Key: cleanVk,
        Version_Number: Number(readD3String(existing.Version_Number)),
        Version_Status: "DRAFT",
        Route_Pattern: patternInfo.pattern,
        Routing_Topology: patternInfo.topology,
        Remark: reason
      };
      _HrRoutingManagementService.validateRouteCandidate({
        principal,
        routeCandidate: updated,
        kExpected,
        existingRecords: records,
        processCapabilityId
      });
      return {
        status: "PLAN_CREATED",
        operation: "EDIT_DRAFT",
        current: existing,
        proposed: updated,
        mutationsPlanned: [
          {
            app: 795,
            action: "UPDATE_DRAFT",
            versionKey: cleanVk,
            expectedRevision: String(expectedRevision2).trim(),
            record: updated
          }
        ],
        noMutationExecuted: true
      };
    }
    /**
     * Delete a route version.
     * HISTORICAL_ROUTE_DELETE is NEVER permitted.
     */
    static deleteRoutePlan() {
      throw new HrRoutingManagementServiceError(
        "ROUTING_DELETE_FORBIDDEN",
        "Historical route versions can NEVER be deleted. Version immutability is strictly enforced."
      );
    }
    /**
     * Create a Publish route plan.
     * Strictly HR-only. Local mutation plan only.
     */
    static createPublishRoutePlan({
      principal,
      records = [],
      versionKey,
      expectedRevision: expectedRevision2,
      businessReason,
      processCapabilityId = D3_PROCESS_CAPABILITY_ID,
      kExpected = 1
    }) {
      checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.PUBLISH);
      const reason = validateBusinessReason(businessReason);
      if (expectedRevision2 === void 0 || expectedRevision2 === null || String(expectedRevision2).trim() === "") {
        throw new HrRoutingManagementServiceError(
          "ROUTING_REVISION_REQUIRED",
          "Explicit expected revision is required to publish a route version."
        );
      }
      const cleanVk = String(versionKey ?? "").trim();
      const existing = (records || []).find((r) => readD3String(r?.Version_Key) === cleanVk);
      if (!existing) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_VERSION_NOT_FOUND",
          `Route version with Version_Key "${cleanVk}" was not found.`
        );
      }
      const actualRev = existing.$revision?.value !== void 0 ? String(existing.$revision.value) : existing.$revision ? String(existing.$revision) : "";
      if (actualRev && actualRev !== String(expectedRevision2).trim()) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_REVISION_CONFLICT",
          `Revision conflict: expected revision ${expectedRevision2}, actual revision ${actualRev}.`
        );
      }
      const status = readD3String(existing.Version_Status);
      if (status !== "DRAFT") {
        throw new HrRoutingManagementServiceError(
          "ROUTING_LIFECYCLE_IMMUTABLE",
          `Only DRAFT versions can be published. Version "${cleanVk}" is in status "${status}".`
        );
      }
      const candidate = {
        ...existing,
        Version_Status: "ACTIVE",
        Remark: reason
      };
      const validInfo = _HrRoutingManagementService.validateRouteCandidate({
        principal,
        routeCandidate: candidate,
        kExpected,
        existingRecords: records,
        processCapabilityId
      });
      const routingKey = readD3String(candidate.Routing_Key);
      const activeForRk = (records || []).filter((r) => readD3String(r?.Routing_Key) === routingKey && readD3String(r?.Version_Status) === "ACTIVE");
      checkIntervalOverlap(validInfo.effectiveFrom, validInfo.effectiveTo, activeForRk, cleanVk);
      return {
        status: "PLAN_CREATED",
        operation: "PUBLISH_VERSION",
        current: existing,
        proposed: candidate,
        mutationsPlanned: [
          {
            app: 795,
            action: "PUBLISH_RECORD",
            versionKey: cleanVk,
            expectedRevision: String(expectedRevision2).trim(),
            record: candidate
          }
        ],
        noMutationExecuted: true
      };
    }
    /**
     * Create a Supersession route plan.
     * Strictly HR-only. Closes active interval and promotes new version.
     */
    static createSupersedeRoutePlan({
      principal,
      records = [],
      activeVersionKey,
      expectedActiveRevision,
      newVersionKey,
      expectedNewRevision,
      effectiveToDate,
      businessReason,
      processCapabilityId = D3_PROCESS_CAPABILITY_ID,
      kExpected = 1
    }) {
      checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.SUPERSEDE);
      const reason = validateBusinessReason(businessReason);
      if (!expectedActiveRevision || !expectedNewRevision) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_REVISION_REQUIRED",
          "Both expectedActiveRevision and expectedNewRevision are required for supersession."
        );
      }
      const cleanActiveVk = String(activeVersionKey ?? "").trim();
      const cleanNewVk = String(newVersionKey ?? "").trim();
      const activeRec = (records || []).find((r) => readD3String(r?.Version_Key) === cleanActiveVk);
      if (!activeRec) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_VERSION_NOT_FOUND",
          `Active version "${cleanActiveVk}" was not found.`
        );
      }
      const newRec = (records || []).find((r) => readD3String(r?.Version_Key) === cleanNewVk);
      if (!newRec) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_VERSION_NOT_FOUND",
          `New version "${cleanNewVk}" was not found.`
        );
      }
      if (readD3String(activeRec.Version_Status) !== "ACTIVE") {
        throw new HrRoutingManagementServiceError(
          "ROUTING_LIFECYCLE_IMMUTABLE",
          `Target to supersede "${cleanActiveVk}" must be ACTIVE (status is "${readD3String(activeRec.Version_Status)}").`
        );
      }
      if (readD3String(newRec.Version_Status) !== "DRAFT") {
        throw new HrRoutingManagementServiceError(
          "ROUTING_LIFECYCLE_IMMUTABLE",
          `New version "${cleanNewVk}" must be DRAFT to activate via supersession (status is "${readD3String(newRec.Version_Status)}").`
        );
      }
      const closeDate = validateDateString(effectiveToDate, "Effective_To");
      if (!closeDate) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_EFFECTIVE_TO_REQUIRED",
          "Explicit Effective_To date is required to close the superseded version."
        );
      }
      const activeFrom = readD3String(activeRec.Effective_From);
      if (closeDate < activeFrom) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_INVALID_EFFECTIVE_INTERVAL",
          `Superseded Effective_To (${closeDate}) cannot precede Effective_From (${activeFrom}).`
        );
      }
      const supersededRec = {
        ...activeRec,
        Version_Status: "SUPERSEDED",
        Effective_To: closeDate,
        Remark: `${readD3String(activeRec.Remark) || ""}
[SUPERSEDED]: ${reason}`.trim()
      };
      const activatedRec = {
        ...newRec,
        Version_Status: "ACTIVE",
        Remark: reason
      };
      const validInfo = _HrRoutingManagementService.validateRouteCandidate({
        principal,
        routeCandidate: activatedRec,
        kExpected,
        existingRecords: records,
        processCapabilityId
      });
      const routingKey = readD3String(activeRec.Routing_Key);
      const activeVersions = (records || []).filter((r) => readD3String(r?.Routing_Key) === routingKey && readD3String(r?.Version_Status) === "ACTIVE").map((r) => readD3String(r?.Version_Key) === cleanActiveVk ? supersededRec : r);
      checkIntervalOverlap(validInfo.effectiveFrom, validInfo.effectiveTo, activeVersions, cleanNewVk);
      return {
        status: "PLAN_CREATED",
        operation: "SUPERSEDE_VERSION",
        current: {
          activeVersion: activeRec,
          newVersion: newRec
        },
        proposed: {
          supersededVersion: supersededRec,
          activatedVersion: activatedRec
        },
        mutationsPlanned: [
          {
            app: 795,
            action: "SUPERSEDE_RECORD",
            versionKey: cleanActiveVk,
            expectedRevision: String(expectedActiveRevision).trim(),
            updates: {
              Version_Status: "SUPERSEDED",
              Effective_To: closeDate,
              Remark: supersededRec.Remark
            }
          },
          {
            app: 795,
            action: "ACTIVATE_RECORD",
            versionKey: cleanNewVk,
            expectedRevision: String(expectedNewRevision).trim(),
            updates: {
              Version_Status: "ACTIVE",
              Remark: activatedRec.Remark
            }
          }
        ],
        noMutationExecuted: true
      };
    }
    /**
     * Before / After Preview Generator.
     * Authorized for both 'hr' and 'admin-form'.
     */
    static generateRoutePreview({
      principal,
      currentVersion = null,
      proposedVersion = null,
      routingKey = "",
      hypotheticalRecords = [],
      employeeUserCode = "",
      isOwnMbo = false
    }) {
      checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.PREVIEW);
      const formatVersionSummary = (v) => {
        if (!v) return null;
        const pattern = readD3String(v.Route_Pattern);
        const topology = readD3String(v.Routing_Topology) || (pattern ? D3_ROUTE_PATTERNS[pattern]?.topology : "");
        const activeSlots = D3_ACTIVE_ROUTE_SLOTS[topology] || [];
        const orderedAppraisers = activeSlots.map((slotKey) => {
          const { approverField } = D3_SLOT_FIELD_MAP[slotKey];
          const users = unwrapD3Field(v[approverField]) || [];
          const code = Array.isArray(users) && users[0] ? users[0].code : "";
          return { slot: slotKey, userCode: code };
        });
        return {
          versionKey: readD3String(v.Version_Key),
          versionNumber: Number(readD3String(v.Version_Number)),
          status: readD3String(v.Version_Status),
          routePattern: pattern,
          topology,
          orderedAppraisers,
          scorerPriorities: readD3String(v.Scorer_Priority_Slots),
          effectiveFrom: readD3String(v.Effective_From),
          effectiveTo: readD3String(v.Effective_To)
        };
      };
      const cur = formatVersionSummary(currentVersion);
      const prop = formatVersionSummary(proposedVersion);
      const differences = {
        topologyChanged: cur && prop ? cur.topology !== prop.topology : false,
        appraiserChanges: [],
        scorerChanges: cur && prop ? cur.scorerPriorities !== prop.scorerPriorities : false,
        dateChanges: {
          fromChanged: cur && prop ? cur.effectiveFrom !== prop.effectiveFrom : false,
          toChanged: cur && prop ? cur.effectiveTo !== prop.effectiveTo : false
        },
        statusChanged: cur && prop ? cur.status !== prop.status : false
      };
      if (cur && prop) {
        const allSlots = Array.from(/* @__PURE__ */ new Set([
          ...cur.orderedAppraisers.map((a) => a.slot),
          ...prop.orderedAppraisers.map((a) => a.slot)
        ]));
        for (const slot of allSlots) {
          const cCode = cur.orderedAppraisers.find((a) => a.slot === slot)?.userCode || "(none)";
          const pCode = prop.orderedAppraisers.find((a) => a.slot === slot)?.userCode || "(none)";
          if (cCode !== pCode) {
            differences.appraiserChanges.push({ slot, from: cCode, to: pCode });
          }
        }
      }
      const futureImpact = {
        routingKeyAffected: routingKey || (prop ? prop.versionKey?.split("#")[0] : ""),
        effectiveIntervalAffected: prop ? `[${prop.effectiveFrom}..${prop.effectiveTo || "open"}]` : "N/A",
        resolutionTiming: "Future explicit resolution points only (Effective_From <= T <= Effective_To)",
        inFlightApp794Impact: "NONE",
        hypotheticalEvaluationsPreview: Array.isArray(hypotheticalRecords) && hypotheticalRecords.length > 0 ? hypotheticalRecords.map((r) => ({
          id: r.$id?.value || r.id || "N/A",
          employeeCode: r.Employee_Code?.value || r.employeeCode || "N/A",
          source: "Supplied preview data only"
        })) : "Zero live reads performed; no exact live record counts claimed."
      };
      let selfElisionPreview = null;
      if (prop && employeeUserCode) {
        selfElisionPreview = _HrRoutingManagementService.generateSelfElisionPreview({
          principal,
          routeCandidate: proposedVersion,
          employeeUserCode,
          isOwnMbo
        });
      }
      return {
        currentVersion: cur,
        proposedVersion: prop,
        differences,
        futureImpact,
        selfElisionPreview
      };
    }
    /**
     * Self-Elision Preview Generator.
     * Authorized for both 'hr' and 'admin-form'.
     */
    static generateSelfElisionPreview({
      principal,
      routeCandidate,
      employeeUserCode = "",
      isOwnMbo = false,
      kExpected = 1
    }) {
      checkRoutingAuthorization(principal, ROUTING_PERMISSIONS.PREVIEW);
      if (!routeCandidate) {
        throw new HrRoutingManagementServiceError(
          "ROUTING_CANDIDATE_REQUIRED",
          "Route candidate is required for self-elision preview."
        );
      }
      try {
        const rawPattern = readD3String(routeCandidate.Route_Pattern);
        const rawScorer = routeCandidate.Scorer_Priority_Slots;
        const resolvedScorer = rawPattern ? convertSlotNamesToOrdinals(rawScorer, rawPattern) : rawScorer;
        const candidateToEvaluate = {
          ...routeCandidate,
          Scorer_Priority_Slots: { value: resolvedScorer }
        };
        const viability = evaluateD3RouteViability({
          routeVersion: candidateToEvaluate,
          kExpected,
          employeeUserCode,
          isOwnMbo,
          scorerPrioritySlots: resolvedScorer
        });
        return {
          isSelfElisionApplied: isOwnMbo,
          targetEmployeeUserCode: employeeUserCode,
          configuredTopology: viability.configuredRoute.topology,
          effectiveTopology: viability.effectiveRoute.topology,
          survivingAppraisers: viability.effectiveRoute.businessSlots.map((s) => ({
            ordinal: s.ordinal,
            slot: s.targetSlot,
            userCode: s.user.code
          })),
          activeScorers: viability.activeScorers.map((s) => ({
            rank: s.scorerRank,
            userCode: s.user.code,
            weight: s.weight
          }))
        };
      } catch (err) {
        if (err instanceof D3RouteViabilityError || err instanceof D3RouteContractError) {
          return {
            isSelfElisionApplied: isOwnMbo,
            targetEmployeeUserCode: employeeUserCode,
            conflict: true,
            errorCode: err.code,
            errorMessage: err.message.replace(/^[^:]+:\s*/, "")
          };
        }
        throw err;
      }
    }
  };

  // src/services/hr-routing-management-service-r1-d3imp06-base.js
  var E = HrRoutingManagementServiceError;
  var P = ROUTING_PERMISSIONS;
  function unwrap(value) {
    if (value && typeof value === "object" && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, "value")) {
      return value.value;
    }
    return value;
  }
  function readString(value) {
    const raw = unwrap(value);
    if (raw === null || raw === void 0) return "";
    return String(raw);
  }
  function exactNonBlank(value) {
    const raw = readString(value);
    return raw && raw === raw.trim() ? raw : "";
  }
  function requireKExpected(kExpected) {
    if (kExpected === void 0 || kExpected === null || String(unwrap(kExpected)).trim() === "") {
      throw new E(
        "ROUTING_K_EXPECTED_REQUIRED",
        "Explicit frozen/published K_expected authority is required; no default is permitted."
      );
    }
    const parsed = Number(unwrap(kExpected));
    if (parsed !== 1 && parsed !== 2) {
      throw new E(
        "INVALID_K_EXPECTED",
        `K_expected must be exactly 1 or 2, received ${String(unwrap(kExpected))}.`
      );
    }
    return parsed;
  }
  function requireProcessCapability(processCapabilityId) {
    const supplied = exactNonBlank(processCapabilityId);
    if (!supplied) {
      throw new E(
        "ROUTING_PROCESS_CAPABILITY_REQUIRED",
        `Explicit process capability "${D3_PROCESS_CAPABILITY_ID}" is required; no default is permitted.`
      );
    }
    if (supplied !== D3_PROCESS_CAPABILITY_ID) {
      throw new E(
        "ROUTING_PROCESS_CAPABILITY_REQUIRED",
        `Exact process capability "${D3_PROCESS_CAPABILITY_ID}" is required (received: "${supplied}").`
      );
    }
    return supplied;
  }
  function hasConfiguredScorerValue(value) {
    const raw = unwrap(value);
    if (Array.isArray(raw)) {
      return raw.some((item) => exactNonBlank(item));
    }
    return exactNonBlank(raw) !== "";
  }
  function scorerSourceFromDraft(draft = {}) {
    if (Object.prototype.hasOwnProperty.call(draft, "scorerPrioritySlots")) {
      return draft.scorerPrioritySlots;
    }
    if (Object.prototype.hasOwnProperty.call(draft, "Scorer_Priority_Slots")) {
      return draft.Scorer_Priority_Slots;
    }
    if (draft.scorerSlots && typeof draft.scorerSlots === "object") {
      return [draft.scorerSlots.midYear, draft.scorerSlots.final1, draft.scorerSlots.final2].filter((item) => exactNonBlank(item));
    }
    return void 0;
  }
  function requireScorerPlan(routeOrDraft) {
    const source = scorerSourceFromDraft(routeOrDraft || {});
    if (!hasConfiguredScorerValue(source)) {
      throw new E(
        "SCORER_PLAN_NOT_CONFIGURED",
        "Explicit HR-authorized scorer plan is required; no slot-1/M1 fallback is permitted."
      );
    }
    return source;
  }
  function normalizeRoutingKey(value) {
    const key = exactNonBlank(value);
    if (!key) {
      throw new E("ROUTING_KEY_REQUIRED", "Routing_Key must be an exact non-empty string.");
    }
    return key;
  }
  function requireHistoryCompleteness(historyCompleteness, routingKey) {
    const key = normalizeRoutingKey(routingKey);
    if (!historyCompleteness || typeof historyCompleteness !== "object") {
      throw new E(
        "ROUTING_VERSION_HISTORY_COMPLETENESS_REQUIRED",
        `Explicit completeness proof is required before deriving the next Version_Number for Routing_Key "${key}".`
      );
    }
    if (historyCompleteness.complete !== true || exactNonBlank(historyCompleteness.routingKey) !== key) {
      throw new E(
        "ROUTING_VERSION_HISTORY_COMPLETENESS_REQUIRED",
        `Version history completeness must be explicitly confirmed for the exact Routing_Key "${key}".`
      );
    }
    return Object.freeze({ routingKey: key, complete: true });
  }
  function routeRevision(record) {
    const raw = unwrap(record?.$revision);
    const revision = exactNonBlank(raw);
    if (!revision) {
      throw new E(
        "ROUTING_RECORD_REVISION_REQUIRED",
        "Actual $revision is required for revision-guarded routing mutation planning."
      );
    }
    return revision;
  }
  function expectedRevision(value, label) {
    const revision = exactNonBlank(value);
    if (!revision) {
      throw new E("ROUTING_REVISION_REQUIRED", `${label} is required.`);
    }
    return revision;
  }
  function findByVersionKey(records, versionKey) {
    const key = exactNonBlank(versionKey);
    if (!key) return null;
    return (Array.isArray(records) ? records : []).find((record) => readString(record?.Version_Key) === key) || null;
  }
  function assertRevisionMatches(record, expected, label) {
    const expectedValue = expectedRevision(expected, label);
    const actualValue = routeRevision(record);
    if (actualValue !== expectedValue) {
      throw new E(
        "ROUTING_REVISION_CONFLICT",
        `${label} is stale: expected revision ${expectedValue}, actual revision ${actualValue}.`
      );
    }
    return actualValue;
  }
  var TOPOLOGY_CONFIGS2 = Object.freeze({
    [TOPOLOGIES.M1_ONLY]: Object.freeze({
      slots: Object.freeze(["M1"]),
      label: "M1 Only (1 Appraiser)"
    }),
    [TOPOLOGIES.M1_G1]: Object.freeze({
      slots: Object.freeze(["M1", "G1"]),
      label: "M1 + G1 (2 Appraisers)"
    }),
    [TOPOLOGIES.M1_M2_G1]: Object.freeze({
      slots: Object.freeze(["M2", "M1", "G1"]),
      label: "M2 + M1 + G1 (3 Appraisers)"
    }),
    [TOPOLOGIES.M1_G1_G2]: Object.freeze({
      slots: Object.freeze(["M1", "G1", "G2"]),
      label: "M1 + G1 + G2 (3 Appraisers)"
    }),
    [TOPOLOGIES.M1_M2_G1_G2]: Object.freeze({
      slots: Object.freeze(["M2", "M1", "G1", "G2"]),
      label: "M2 + M1 + G1 + G2 (4 Appraisers)"
    })
  });
  function buildCandidateRecordFromDraft2(draft = {}) {
    requireScorerPlan(draft);
    return buildCandidateRecordFromDraft(draft);
  }
  function deriveNextVersionNumber2(existingVersions, routingKey, historyCompleteness) {
    if (!Array.isArray(existingVersions)) {
      throw new E(
        "ROUTING_VERSION_HISTORY_INCOMPLETE",
        "Supplied routing version history must be an explicit array."
      );
    }
    const key = normalizeRoutingKey(routingKey);
    requireHistoryCompleteness(historyCompleteness, key);
    return deriveNextVersionNumber(existingVersions, key);
  }
  function validateRoutingDraft(draft, {
    existingVersions = [],
    principal,
    kExpected,
    processCapabilityId
  } = {}) {
    const errors = [];
    try {
      const candidate = buildCandidateRecordFromDraft2(draft);
      HrRoutingManagementService2.validateRouteCandidate({
        principal,
        routeCandidate: candidate,
        existingRecords: existingVersions,
        kExpected,
        processCapabilityId
      });
      return { isValid: true, errors: [], candidate };
    } catch (error) {
      errors.push(error.message);
      return { isValid: false, errors, candidate: null };
    }
  }
  function previewRoutingPlan({
    principal,
    draft,
    existingVersions = [],
    kExpected,
    processCapabilityId
  }) {
    const normalizedK = requireKExpected(kExpected);
    const capability = requireProcessCapability(processCapabilityId);
    requireScorerPlan(draft);
    const config = TOPOLOGY_CONFIGS2[draft?.topology];
    if (!config) {
      throw new E(
        "ROUTING_TOPOLOGY_REQUIRED",
        `A supported routing topology is required for preview (received: "${String(draft?.topology ?? "")}").`
      );
    }
    const candidate = buildCandidateRecordFromDraft2(draft);
    const validation = validateRoutingDraft(draft, {
      existingVersions,
      principal,
      kExpected: normalizedK,
      processCapabilityId: capability
    });
    return {
      isValid: validation.isValid,
      topology: draft.topology,
      activeSlots: config.slots.map((slot) => ({
        role: slot,
        userCode: draft?.slots?.[slot] || ""
      })),
      scorerSlots: draft.scorerSlots || null,
      scorerPrioritySlots: scorerSourceFromDraft(draft),
      kExpected: normalizedK,
      processCapabilityId: capability,
      inFlightImpact: "NONE (ZERO)",
      warnings: validation.isValid ? [] : validation.errors,
      planPayload: validation.isValid ? candidate : null
    };
  }
  var HrRoutingManagementService2 = class extends HrRoutingManagementService {
    static validateRouteCandidate({
      principal,
      routeCandidate,
      kExpected,
      existingRecords = [],
      processCapabilityId
    } = {}) {
      checkRoutingAuthorization(principal, P.VALIDATE);
      const normalizedK = requireKExpected(kExpected);
      const capability = requireProcessCapability(processCapabilityId);
      requireScorerPlan(routeCandidate);
      return super.validateRouteCandidate({
        principal,
        routeCandidate,
        kExpected: normalizedK,
        existingRecords,
        processCapabilityId: capability
      });
    }
    static validateRoutingDraft({
      principal,
      draft,
      records = [],
      kExpected,
      processCapabilityId
    } = {}) {
      return validateRoutingDraft(draft, {
        existingVersions: records,
        principal,
        kExpected,
        processCapabilityId
      });
    }
    static previewRoutingPlan({
      principal,
      draft,
      records = [],
      kExpected,
      processCapabilityId
    } = {}) {
      return previewRoutingPlan({
        principal,
        draft,
        existingVersions: records,
        kExpected,
        processCapabilityId
      });
    }
    static buildCandidateRecordFromDraft({ draft } = {}) {
      return buildCandidateRecordFromDraft2(draft);
    }
    static createDraftRoutePlan({
      principal,
      records = [],
      draftInput = {},
      processCapabilityId,
      kExpected,
      historyCompleteness
    } = {}) {
      checkRoutingAuthorization(principal, P.CREATE_DRAFT);
      const normalizedK = requireKExpected(kExpected);
      const capability = requireProcessCapability(processCapabilityId);
      requireScorerPlan(draftInput);
      const routingKey = normalizeRoutingKey(draftInput.Routing_Key);
      requireHistoryCompleteness(historyCompleteness, routingKey);
      return super.createDraftRoutePlan({
        principal,
        records,
        draftInput,
        processCapabilityId: capability,
        kExpected: normalizedK
      });
    }
    static editDraftRoutePlan({
      principal,
      records = [],
      versionKey,
      expectedRevision: expected,
      draftInput = {},
      processCapabilityId,
      kExpected
    } = {}) {
      checkRoutingAuthorization(principal, P.EDIT_DRAFT);
      const normalizedK = requireKExpected(kExpected);
      const capability = requireProcessCapability(processCapabilityId);
      const existing = findByVersionKey(records, versionKey);
      if (existing) {
        assertRevisionMatches(existing, expected, "expectedRevision");
        requireScorerPlan(
          Object.prototype.hasOwnProperty.call(draftInput, "Scorer_Priority_Slots") ? draftInput : existing
        );
      }
      return super.editDraftRoutePlan({
        principal,
        records,
        versionKey,
        expectedRevision: expected,
        draftInput,
        processCapabilityId: capability,
        kExpected: normalizedK
      });
    }
    static createPublishRoutePlan({
      principal,
      records = [],
      versionKey,
      expectedRevision: expected,
      businessReason,
      processCapabilityId,
      kExpected
    } = {}) {
      checkRoutingAuthorization(principal, P.PUBLISH);
      const normalizedK = requireKExpected(kExpected);
      const capability = requireProcessCapability(processCapabilityId);
      const existing = findByVersionKey(records, versionKey);
      if (existing) {
        assertRevisionMatches(existing, expected, "expectedRevision");
        requireScorerPlan(existing);
      }
      return super.createPublishRoutePlan({
        principal,
        records,
        versionKey,
        expectedRevision: expected,
        businessReason,
        processCapabilityId: capability,
        kExpected: normalizedK
      });
    }
    static createSupersedeRoutePlan({
      principal,
      records = [],
      activeVersionKey,
      expectedActiveRevision,
      newVersionKey,
      expectedNewRevision,
      effectiveToDate,
      businessReason,
      processCapabilityId,
      kExpected
    } = {}) {
      checkRoutingAuthorization(principal, P.SUPERSEDE);
      const normalizedK = requireKExpected(kExpected);
      const capability = requireProcessCapability(processCapabilityId);
      const activeRec = findByVersionKey(records, activeVersionKey);
      const newRec = findByVersionKey(records, newVersionKey);
      if (activeRec) {
        assertRevisionMatches(activeRec, expectedActiveRevision, "expectedActiveRevision");
      }
      if (newRec) {
        assertRevisionMatches(newRec, expectedNewRevision, "expectedNewRevision");
        requireScorerPlan(newRec);
      }
      if (activeRec && newRec) {
        const activeRoutingKey = normalizeRoutingKey(readString(activeRec.Routing_Key));
        const newRoutingKey = normalizeRoutingKey(readString(newRec.Routing_Key));
        if (activeRoutingKey !== newRoutingKey) {
          throw new E(
            "ROUTING_SUPERSESSION_ROUTING_KEY_MISMATCH",
            `Supersession requires identical Routing_Key values; active="${activeRoutingKey}", new="${newRoutingKey}".`
          );
        }
      }
      return super.createSupersedeRoutePlan({
        principal,
        records,
        activeVersionKey,
        expectedActiveRevision,
        newVersionKey,
        expectedNewRevision,
        effectiveToDate,
        businessReason,
        processCapabilityId: capability,
        kExpected: normalizedK
      });
    }
    static generateSelfElisionPreview({
      principal,
      routeCandidate,
      employeeUserCode = "",
      isOwnMbo = false,
      kExpected
    } = {}) {
      checkRoutingAuthorization(principal, P.PREVIEW);
      const normalizedK = requireKExpected(kExpected);
      requireScorerPlan(routeCandidate);
      return super.generateSelfElisionPreview({
        principal,
        routeCandidate,
        employeeUserCode,
        isOwnMbo,
        kExpected: normalizedK
      });
    }
    static generateRoutePreview({
      principal,
      currentVersion = null,
      proposedVersion = null,
      routingKey = "",
      hypotheticalRecords = [],
      employeeUserCode = "",
      isOwnMbo = false,
      kExpected,
      processCapabilityId
    } = {}) {
      checkRoutingAuthorization(principal, P.PREVIEW);
      const normalizedK = requireKExpected(kExpected);
      requireProcessCapability(processCapabilityId);
      if (proposedVersion) requireScorerPlan(proposedVersion);
      const result = super.generateRoutePreview({
        principal,
        currentVersion,
        proposedVersion,
        routingKey,
        hypotheticalRecords,
        employeeUserCode: "",
        isOwnMbo: false
      });
      if (proposedVersion && employeeUserCode) {
        result.selfElisionPreview = this.generateSelfElisionPreview({
          principal,
          routeCandidate: proposedVersion,
          employeeUserCode,
          isOwnMbo,
          kExpected: normalizedK
        });
      }
      return result;
    }
  };

  // src/services/hr-routing-management-service.js
  var E2 = HrRoutingManagementServiceError;
  var VALIDATE = ROUTING_PERMISSIONS.VALIDATE;
  function unwrap2(value) {
    if (value && typeof value === "object" && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, "value")) {
      return value.value;
    }
    return value;
  }
  function exactNonBlank2(value) {
    const raw = unwrap2(value);
    if (raw === null || raw === void 0) return "";
    const text = String(raw);
    return text && text === text.trim() ? text : "";
  }
  function routingKeyFromDraft(draft = {}) {
    const key = exactNonBlank2(
      Object.prototype.hasOwnProperty.call(draft, "routingKey") ? draft.routingKey : draft.Routing_Key
    );
    if (!key) {
      throw new E2(
        "ROUTING_KEY_REQUIRED",
        "Exact Routing_Key is required before resolving preview/validation version context."
      );
    }
    return key;
  }
  function recordRoutingKey(record) {
    return exactNonBlank2(record?.Routing_Key);
  }
  function recordVersionKey(record) {
    return exactNonBlank2(record?.Version_Key);
  }
  function findVersion(records, versionKey) {
    return (Array.isArray(records) ? records : []).find(
      (record) => recordVersionKey(record) === versionKey
    ) || null;
  }
  function requireExistingVersionContext(versionContext, records, routingKey) {
    if (!versionContext || typeof versionContext !== "object") return null;
    const versionKey = exactNonBlank2(versionContext.versionKey);
    if (!versionKey) {
      throw new E2(
        "ROUTING_VERSION_CONTEXT_REQUIRED",
        "Existing preview/validation context must contain an exact non-empty Version_Key."
      );
    }
    const record = findVersion(records, versionKey);
    if (!record) {
      throw new E2(
        "ROUTING_VERSION_CONTEXT_NOT_FOUND",
        `Version context "${versionKey}" was not found in the supplied routing records.`
      );
    }
    const recordKey = recordRoutingKey(record);
    if (recordKey !== routingKey) {
      throw new E2(
        "ROUTING_VERSION_CONTEXT_ROUTING_KEY_MISMATCH",
        `Version context "${versionKey}" belongs to Routing_Key "${recordKey}", not "${routingKey}".`
      );
    }
    if (Object.prototype.hasOwnProperty.call(versionContext, "routingKey") && exactNonBlank2(versionContext.routingKey) !== routingKey) {
      throw new E2(
        "ROUTING_VERSION_CONTEXT_ROUTING_KEY_MISMATCH",
        `Explicit version context Routing_Key must exactly match "${routingKey}".`
      );
    }
    return {
      kind: "EXISTING",
      routingKey,
      versionKey,
      record
    };
  }
  function resolveDraftVersionContext({
    draft,
    existingVersions = [],
    historyCompleteness,
    versionContext
  }) {
    if (!Array.isArray(existingVersions)) {
      throw new E2(
        "ROUTING_VERSION_HISTORY_INCOMPLETE",
        "Supplied routing records must be an explicit array."
      );
    }
    const routingKey = routingKeyFromDraft(draft);
    const hasHistoryProof = historyCompleteness !== void 0 && historyCompleteness !== null;
    const hasVersionContext = versionContext !== void 0 && versionContext !== null;
    if (hasHistoryProof && hasVersionContext) {
      throw new E2(
        "ROUTING_VERSION_CONTEXT_AMBIGUOUS",
        "Preview/validation must use either complete NEW-version history proof or exact EXISTING Version_Key context, never both."
      );
    }
    if (hasVersionContext) {
      return requireExistingVersionContext(versionContext, existingVersions, routingKey);
    }
    if (!hasHistoryProof) {
      throw new E2(
        "ROUTING_VERSION_CONTEXT_REQUIRED",
        `Routing_Key "${routingKey}" requires either exact existing Version_Key context or explicit complete history proof.`
      );
    }
    const versionNumber = deriveNextVersionNumber2(
      existingVersions,
      routingKey,
      historyCompleteness
    );
    const versionKey = generateCanonicalVersionKey(routingKey, versionNumber);
    return {
      kind: "NEW",
      routingKey,
      versionKey,
      versionNumber,
      record: null
    };
  }
  function applyVersionIdentity(candidate, resolved) {
    if (resolved.kind === "EXISTING") {
      const record = resolved.record;
      return {
        ...candidate,
        Routing_Key: record.Routing_Key,
        Version_Key: record.Version_Key,
        Version_Number: record.Version_Number,
        Version_Status: record.Version_Status,
        ...record.$revision !== void 0 ? { $revision: record.$revision } : {}
      };
    }
    return {
      ...candidate,
      Routing_Key: { value: resolved.routingKey },
      Version_Key: { value: resolved.versionKey },
      Version_Number: { value: String(resolved.versionNumber) },
      Version_Status: { value: ROUTING_STATUSES.DRAFT }
    };
  }
  function publicVersionContext(resolved) {
    return Object.freeze({
      kind: resolved.kind,
      routingKey: resolved.routingKey,
      versionKey: resolved.versionKey,
      ...resolved.kind === "NEW" ? { versionNumber: resolved.versionNumber } : {}
    });
  }
  function validateRoutingDraft2(draft, {
    existingVersions = [],
    principal,
    kExpected,
    processCapabilityId,
    historyCompleteness,
    versionContext
  } = {}) {
    const errors = [];
    try {
      checkRoutingAuthorization(principal, VALIDATE);
      const baseCandidate = buildCandidateRecordFromDraft2(draft);
      const resolved = resolveDraftVersionContext({
        draft,
        existingVersions,
        historyCompleteness,
        versionContext
      });
      const candidate = applyVersionIdentity(baseCandidate, resolved);
      HrRoutingManagementService2.validateRouteCandidate({
        principal,
        routeCandidate: candidate,
        existingRecords: existingVersions,
        kExpected,
        processCapabilityId
      });
      return {
        isValid: true,
        errors: [],
        candidate,
        versionContext: publicVersionContext(resolved)
      };
    } catch (error) {
      errors.push(error?.message || String(error));
      return {
        isValid: false,
        errors,
        candidate: null,
        versionContext: null
      };
    }
  }
  function previewRoutingPlan2({
    principal,
    draft,
    existingVersions = [],
    kExpected,
    processCapabilityId,
    historyCompleteness,
    versionContext
  } = {}) {
    const validation = validateRoutingDraft2(draft, {
      existingVersions,
      principal,
      kExpected,
      processCapabilityId,
      historyCompleteness,
      versionContext
    });
    const topology = draft?.topology || "";
    const config = TOPOLOGY_CONFIGS2[topology];
    const activeSlots = config ? config.slots.map((slot) => ({
      role: slot,
      userCode: draft?.slots?.[slot] || ""
    })) : [];
    return {
      isValid: validation.isValid,
      topology,
      activeSlots,
      scorerSlots: draft?.scorerSlots || null,
      scorerPrioritySlots: draft?.scorerPrioritySlots ?? null,
      kExpected,
      processCapabilityId,
      versionContext: validation.versionContext,
      inFlightImpact: "NONE (ZERO)",
      warnings: validation.isValid ? [] : validation.errors,
      planPayload: validation.isValid ? validation.candidate : null
    };
  }
  var HrRoutingManagementService3 = class extends HrRoutingManagementService2 {
    static validateRoutingDraft({
      principal,
      draft,
      records = [],
      kExpected,
      processCapabilityId,
      historyCompleteness,
      versionContext
    } = {}) {
      return validateRoutingDraft2(draft, {
        existingVersions: records,
        principal,
        kExpected,
        processCapabilityId,
        historyCompleteness,
        versionContext
      });
    }
    static previewRoutingPlan({
      principal,
      draft,
      records = [],
      kExpected,
      processCapabilityId,
      historyCompleteness,
      versionContext
    } = {}) {
      return previewRoutingPlan2({
        principal,
        draft,
        existingVersions: records,
        kExpected,
        processCapabilityId,
        historyCompleteness,
        versionContext
      });
    }
  };

  // src/ui/hr-routing-manager-d3imp06-base.js
  function escapeHtml(str) {
    if (str === null || str === void 0) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  var TOPOLOGY_OPTIONS = [
    { value: TOPOLOGIES.M1_ONLY, label: "M1 Only (1 Appraiser: M1)", slots: ["M1"] },
    { value: TOPOLOGIES.M1_G1, label: "M1 + G1 (2 Appraisers: M1, G1)", slots: ["M1", "G1"] },
    { value: TOPOLOGIES.M1_M2_G1, label: "M1 + M2 + G1 (3 Appraisers: M1, M2, G1)", slots: ["M1", "M2", "G1"] },
    { value: TOPOLOGIES.M1_G1_G2, label: "M1 + G1 + G2 (3 Appraisers: M1, G1, G2)", slots: ["M1", "G1", "G2"] },
    { value: TOPOLOGIES.M1_M2_G1_G2, label: "M1 + M2 + G1 + G2 (4 Appraisers: M1, M2, G1, G2)", slots: ["M1", "M2", "G1", "G2"] }
  ];
  function getRequiredSlotsForTopology(topology) {
    const config = TOPOLOGY_CONFIGS2[topology];
    return config ? [...config.slots] : ["M1"];
  }
  function renderHrRoutingManagerHtml({
    principal = null,
    routes = [],
    selectedRouteKey = "",
    selectedTopology = TOPOLOGIES.M1_ONLY,
    slotValues = {},
    scorerValues = {},
    effectiveFrom = "",
    effectiveTo = "",
    remark = "",
    validationErrors = [],
    previewResult = null,
    activeTab = "routes"
  } = {}) {
    const isHr = hasHrCapability(principal);
    const isAdminForm = hasAdminFormCapability(principal);
    const hasAccess = isHr || isAdminForm;
    if (!hasAccess) {
      return `
      <div class="hr-routing-panel hr-access-denied" style="padding: 1.5rem; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; color: #9f1239;">
        <h3 style="margin-top: 0;">Access Denied / \u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A\u0E2D\u0E19\u0E38\u0E0D\u0E32\u0E15</h3>
        <p>\u0E04\u0E38\u0E13\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07\u0E2A\u0E48\u0E27\u0E19\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23 Approval Routing (\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E2A\u0E21\u0E32\u0E0A\u0E34\u0E01\u0E02\u0E2D\u0E07\u0E01\u0E25\u0E38\u0E48\u0E21 <strong>hr</strong> \u0E2B\u0E23\u0E37\u0E2D <strong>admin-form</strong>)</p>
      </div>
    `;
    }
    const requiredSlots = getRequiredSlotsForTopology(selectedTopology);
    const badgeStyle = (status) => {
      switch (status) {
        case ROUTING_STATUSES.ACTIVE:
          return "background: #dcfce7; color: #15803d; border: 1px solid #86efac;";
        case ROUTING_STATUSES.DRAFT:
          return "background: #fef9c3; color: #854d0e; border: 1px solid #fde047;";
        case ROUTING_STATUSES.SUPERSEDED:
          return "background: #f3f4f6; color: #4b5563; border: 1px solid #d1d5db;";
        case ROUTING_STATUSES.CANCELLED:
          return "background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;";
        default:
          return "background: #f3f4f6; color: #374151;";
      }
    };
    const roleBanner = `
    <div class="hr-routing-role-bar" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.75rem 1rem; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong>User:</strong> ${escapeHtml(principal?.userCode || "unknown")} |
        <strong>Groups:</strong> ${escapeHtml((principal?.groups || []).join(", "))} |
        <strong>Role Capability:</strong>
        ${isHr ? '<span style="color: #047857; font-weight: 600;">[HR: Full Business Self-Service]</span>' : ""}
        ${isAdminForm && !isHr ? '<span style="color: #b45309; font-weight: 600;">[Admin-Form: Read-Only / Diagnostics / Zero Business Mutations]</span>' : ""}
        ${isHr && isAdminForm ? '<span style="color: #6d28d9; font-weight: 600;">[Dual-Role: Union of HR + Technical Administration]</span>' : ""}
      </div>
      <div>
        <span class="badge" style="font-size: 0.75rem; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 4px;">D3-IMP-06 LOCAL-ONLY</span>
      </div>
    </div>
  `;
    const errorHtml = validationErrors.length > 0 ? `<div class="hr-routing-errors" style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 0.75rem 1rem; margin-bottom: 1rem; border-radius: 4px;">
        <strong style="color: #991b1b;">Validation Errors / \u0E1E\u0E1A\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14:</strong>
        <ul style="margin: 0.5rem 0 0 1.25rem; color: #b91c1c; font-size: 0.875rem;">
          ${validationErrors.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}
        </ul>
      </div>` : "";
    const routesRows = routes.map((r) => {
      const routeKey = escapeHtml(r.Routing_Key || r.routingKey || "");
      const verNum = escapeHtml(r.Version_Number || r.versionNumber || "");
      const verKey = escapeHtml(r.Version_Key || r.versionKey || "");
      const topo = escapeHtml(r.Topology || r.topology || "");
      const st = escapeHtml(r.Status || r.status || "");
      const effFrom = escapeHtml(r.Effective_From || r.effectiveFrom || "");
      const effTo = escapeHtml(r.Effective_To || r.effectiveTo || "-");
      const rmk = escapeHtml(r.Remark || r.remark || "-");
      const isSelected = selectedRouteKey === (r.Routing_Key || r.routingKey);
      return `
      <tr class="${isSelected ? "selected-route-row" : ""}" style="${isSelected ? "background: #f0fdf4;" : ""}">
        <td><strong>${routeKey}</strong></td>
        <td>v${verNum}</td>
        <td><small>${verKey}</small></td>
        <td><code>${topo}</code></td>
        <td><span style="padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; ${badgeStyle(st)}">${st}</span></td>
        <td>${effFrom}</td>
        <td>${effTo}</td>
        <td title="${rmk}">${rmk.length > 30 ? rmk.substring(0, 27) + "..." : rmk}</td>
        <td>
          <button type="button" class="btn-select-route" data-route-key="${routeKey}" style="padding: 2px 8px; font-size: 0.8rem; cursor: pointer;">Select</button>
        </td>
      </tr>
    `;
    }).join("");
    const mutationControls = isHr ? `
      <div class="hr-action-group" style="display: flex; gap: 0.5rem; margin-top: 1rem;">
        <button type="button" id="hr-btn-create-draft" class="btn-primary" style="padding: 0.5rem 1rem; background: #0284c7; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
          \u{1F4BE} Create New Draft
        </button>
        <button type="button" id="hr-btn-save-draft" class="btn-secondary" style="padding: 0.5rem 1rem; background: #475569; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
          \u270F\uFE0F Update Draft
        </button>
        <button type="button" id="hr-btn-publish" class="btn-success" style="padding: 0.5rem 1rem; background: #16a34a; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
          \u{1F680} Publish Plan
        </button>
        <button type="button" id="hr-btn-supersede" class="btn-warning" style="padding: 0.5rem 1rem; background: #d97706; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
          \u{1F504} Supersede Plan
        </button>
      </div>
    ` : `
      <div class="hr-action-group admin-disabled" style="margin-top: 1rem; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 4px; padding: 0.75rem;">
        <p style="margin: 0 0 0.5rem 0; font-size: 0.875rem; color: #92400e;">
          \u{1F512} <strong>Business Mutation Notice:</strong> You are logged in as <strong>admin-form</strong> without HR membership. Business mutation requires HR role (ROUTING_HR_AUTHORIZATION_REQUIRED). Business routing mutations (Create Draft, Edit Draft, Publish, Supersede) are strictly reserved for HR. Admin-Form may only preview, validate, and view diagnostics.
        </p>
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" disabled class="btn-disabled" title="HR role required (ROUTING_HR_AUTHORIZATION_REQUIRED)" style="padding: 0.5rem 1rem; background: #cbd5e1; color: #64748b; border: none; border-radius: 4px; cursor: not-allowed;">
            Create New Draft (HR Only)
          </button>
          <button type="button" disabled class="btn-disabled" title="HR role required (ROUTING_HR_AUTHORIZATION_REQUIRED)" style="padding: 0.5rem 1rem; background: #cbd5e1; color: #64748b; border: none; border-radius: 4px; cursor: not-allowed;">
            Publish Plan (HR Only)
          </button>
          <button type="button" disabled class="btn-disabled" title="HR role required (ROUTING_HR_AUTHORIZATION_REQUIRED)" style="padding: 0.5rem 1rem; background: #cbd5e1; color: #64748b; border: none; border-radius: 4px; cursor: not-allowed;">
            Supersede Plan (HR Only)
          </button>
        </div>
      </div>
    `;
    const previewHtml = previewResult ? `
      <div class="hr-routing-preview-box" style="margin-top: 1.5rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 1rem;">
        <h4 style="margin-top: 0; color: #166534;">\u{1F4CB} Routing Validation & Preview Result</h4>
        <div style="font-size: 0.875rem; line-height: 1.6; color: #14532d;">
          <div><strong>Status:</strong> ${previewResult.isValid ? "\u2705 VALID / PASS" : "\u274C INVALID"}</div>
          <div><strong>Topology:</strong> <code>${escapeHtml(previewResult.topology)}</code></div>
          <div><strong>Active Slots:</strong> ${previewResult.activeSlots?.map((s) => escapeHtml(s.role + ": " + s.userCode)).join(" \u2794 ") || "-"}</div>
          <div><strong>Scorer Slots:</strong> Mid-Year: [${escapeHtml(previewResult.scorerSlots?.midYear || "")}], Final 1: [${escapeHtml(previewResult.scorerSlots?.final1 || "")}], Final 2: [${escapeHtml(previewResult.scorerSlots?.final2 || "")}]</div>
          <div><strong>Process Capability:</strong> <code>${escapeHtml(previewResult.processCapabilityId || "")}</code></div>
          <div><strong>In-Flight App 794 Impact:</strong> <span style="font-weight: 600; color: #047857;">${escapeHtml(previewResult.inFlightImpact || "NONE (ZERO)")}</span></div>
          ${previewResult.warnings?.length > 0 ? `<div style="color: #b45309;">\u26A0\uFE0F Warnings: ${previewResult.warnings.map((w) => escapeHtml(w)).join(", ")}</div>` : ""}
        </div>
        ${previewResult.planPayload ? `
          <details style="margin-top: 0.5rem;">
            <summary style="cursor: pointer; font-size: 0.8rem; color: #15803d; font-weight: 600;">View Generated Mutation Plan Payload (Local JSON)</summary>
            <pre style="background: #ffffff; padding: 0.75rem; border: 1px solid #dcfce7; border-radius: 4px; font-size: 0.75rem; overflow-x: auto; max-height: 200px;">${escapeHtml(JSON.stringify(previewResult.planPayload, null, 2))}</pre>
          </details>
        ` : ""}
      </div>
    ` : "";
    return `
    <div class="hr-routing-manager" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 1.5rem; margin-top: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="margin: 0; font-size: 1.25rem; color: #111827; display: flex; align-items: center; gap: 0.5rem;">
          \u{1F9ED} App 800 HR Approval Routing Self-Service
        </h2>
        <span style="font-size: 0.8rem; color: #6b7280;">App 795 Routing Master Management</span>
      </div>

      ${roleBanner}
      ${errorHtml}

      <!-- Versioned Route Table -->
      <div style="margin-bottom: 1.5rem;">
        <h3 style="font-size: 1rem; color: #374151; margin: 0 0 0.5rem 0;">Existing Versioned Routes / \u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E2A\u0E32\u0E22\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34</h3>
        <div style="max-height: 250px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 4px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
            <thead>
              <tr style="background: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left;">
                <th style="padding: 6px 10px;">Routing Key</th>
                <th style="padding: 6px 10px;">Ver</th>
                <th style="padding: 6px 10px;">Version Key</th>
                <th style="padding: 6px 10px;">Topology</th>
                <th style="padding: 6px 10px;">Status</th>
                <th style="padding: 6px 10px;">Effective From</th>
                <th style="padding: 6px 10px;">Effective To</th>
                <th style="padding: 6px 10px;">Business Reason</th>
                <th style="padding: 6px 10px;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${routesRows || '<tr><td colspan="9" style="padding: 1rem; text-align: center; color: #9ca3af;">No route versions registered.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Editor / Configuration Panel -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 1.25rem;">
        <h3 style="font-size: 1rem; color: #1e293b; margin: 0 0 1rem 0;">
          Route Configuration & Plan Generator / \u0E01\u0E33\u0E2B\u0E19\u0E14\u0E04\u0E48\u0E32\u0E2A\u0E32\u0E22\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34
        </h3>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
          <!-- Routing Key -->
          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Routing Key (e.g. DEPT_ENG_SEC1):</label>
            <input type="text" id="hr-route-key" class="hr-input" value="${escapeHtml(selectedRouteKey)}" placeholder="e.g. DEPT_ENG_SEC1" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
          </div>

          <!-- Topology Selector -->
          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Approval Topology (\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E0A\u0E31\u0E49\u0E19\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34):</label>
            <select id="hr-topology-select" class="hr-select" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
              ${TOPOLOGY_OPTIONS.map((opt) => `
                <option value="${escapeHtml(opt.value)}" ${selectedTopology === opt.value ? "selected" : ""}>
                  ${escapeHtml(opt.label)}
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Effective Dates -->
          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Effective From (YYYY-MM-DD):</label>
            <input type="date" id="hr-effective-from" class="hr-input" value="${escapeHtml(effectiveFrom)}" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div>
            <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Effective To (YYYY-MM-DD, Optional):</label>
            <input type="date" id="hr-effective-to" class="hr-input" value="${escapeHtml(effectiveTo)}" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
          </div>
        </div>

        <!-- Dynamic Appraiser Slots -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 1rem; margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.75rem 0; font-size: 0.875rem; color: #334155;">Dynamic Appraiser Slots / \u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E40\u0E21\u0E34\u0E19\u0E15\u0E32\u0E21\u0E25\u0E33\u0E14\u0E31\u0E1A\u0E0A\u0E31\u0E49\u0E19</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
            <!-- M1 -->
            <div id="slot-container-m1">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Appraiser M1 User Code (Required):</label>
              <input type="text" id="hr-slot-m1" class="hr-input slot-input" data-slot="M1" value="${escapeHtml(slotValues.M1 || "")}" placeholder="e.g. M1_USER" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
            </div>

            <!-- M2 -->
            <div id="slot-container-m2" style="${requiredSlots.includes("M2") ? "" : "display: none;"}">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Appraiser M2 User Code:</label>
              <input type="text" id="hr-slot-m2" class="hr-input slot-input" data-slot="M2" value="${escapeHtml(slotValues.M2 || "")}" placeholder="e.g. M2_USER" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
            </div>

            <!-- G1 -->
            <div id="slot-container-g1" style="${requiredSlots.includes("G1") ? "" : "display: none;"}">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Appraiser G1 User Code:</label>
              <input type="text" id="hr-slot-g1" class="hr-input slot-input" data-slot="G1" value="${escapeHtml(slotValues.G1 || "")}" placeholder="e.g. G1_USER" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
            </div>

            <!-- G2 -->
            <div id="slot-container-g2" style="${requiredSlots.includes("G2") ? "" : "display: none;"}">
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Appraiser G2 User Code:</label>
              <input type="text" id="hr-slot-g2" class="hr-input slot-input" data-slot="G2" value="${escapeHtml(slotValues.G2 || "")}" placeholder="e.g. G2_USER" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
            </div>
          </div>
        </div>

        <!-- Scorer Slots Configuration -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 4px; padding: 1rem; margin-bottom: 1rem;">
          <h4 style="margin: 0 0 0.75rem 0; font-size: 0.875rem; color: #334155;">Scorer Slots / \u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C\u0E01\u0E32\u0E23\u0E43\u0E2B\u0E49\u0E04\u0E30\u0E41\u0E19\u0E19</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Mid-Year Scorer Slot:</label>
              <select id="hr-scorer-midyear" class="hr-select" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
                ${requiredSlots.map((s) => `<option value="${escapeHtml(s)}" ${scorerValues.midYear === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Final Scorer 1 Slot:</label>
              <select id="hr-scorer-final1" class="hr-select" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
                ${requiredSlots.map((s) => `<option value="${escapeHtml(s)}" ${scorerValues.final1 === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
              </select>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 600; margin-bottom: 0.2rem;">Final Scorer 2 Slot:</label>
              <select id="hr-scorer-final2" class="hr-select" style="width: 100%; padding: 0.4rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
                <option value="">(None / No Final Scorer 2)</option>
                ${requiredSlots.map((s) => `<option value="${escapeHtml(s)}" ${scorerValues.final2 === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>

        <!-- Business Reason (Remark) -->
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">
            Business Reason / \u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E01\u0E32\u0E23\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E41\u0E1B\u0E25\u0E07 (Mandatory Remark):
          </label>
          <textarea id="hr-route-remark" class="hr-textarea" rows="2" placeholder="\u0E23\u0E30\u0E1A\u0E38\u0E40\u0E2B\u0E15\u0E38\u0E1C\u0E25\u0E17\u0E32\u0E07\u0E18\u0E38\u0E23\u0E01\u0E34\u0E08\u0E43\u0E19\u0E01\u0E32\u0E23\u0E2A\u0E23\u0E49\u0E32\u0E07/\u0E1B\u0E23\u0E31\u0E1A\u0E1B\u0E23\u0E38\u0E07\u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E0A\u0E31\u0E19\u0E2A\u0E32\u0E22\u0E01\u0E32\u0E23\u0E2D\u0E19\u0E38\u0E21\u0E31\u0E15\u0E34 \u0E40\u0E0A\u0E48\u0E19 \u0E1B\u0E23\u0E31\u0E1A\u0E1C\u0E31\u0E07\u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23 Q1/2026" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">${escapeHtml(remark)}</textarea>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
          <button type="button" id="hr-btn-preview" class="btn-info" style="padding: 0.5rem 1.25rem; background: #0369a1; color: #fff; border: none; border-radius: 4px; font-weight: 600; cursor: pointer;">
            \u{1F50D} Preview & Validate Plan
          </button>
          ${mutationControls}
        </div>

        <!-- Historical Route Note -->
        <div style="margin-top: 1rem; font-size: 0.75rem; color: #64748b;">
          \u{1F6E1}\uFE0F <strong>Safety Invariant:</strong> Historical route versions cannot be deleted. Deprecated routes must be superseded or cancelled to preserve audit trail integrity.
        </div>
      </div>

      ${previewHtml}
    </div>
  `;
  }

  // src/ui/hr-routing-manager-r1-base.js
  var escapeHtml2 = escapeHtml;
  var TOPOLOGY_OPTIONS2 = Object.freeze([
    Object.freeze({ value: TOPOLOGIES.M1_ONLY, label: "M1 Only (1 Appraiser: M1)", slots: Object.freeze(["M1"]) }),
    Object.freeze({ value: TOPOLOGIES.M1_G1, label: "M1 + G1 (2 Appraisers: M1, G1)", slots: Object.freeze(["M1", "G1"]) }),
    Object.freeze({ value: TOPOLOGIES.M1_M2_G1, label: "M2 + M1 + G1 (3 Appraisers: M2, M1, G1)", slots: Object.freeze(["M2", "M1", "G1"]) }),
    Object.freeze({ value: TOPOLOGIES.M1_G1_G2, label: "M1 + G1 + G2 (3 Appraisers: M1, G1, G2)", slots: Object.freeze(["M1", "G1", "G2"]) }),
    Object.freeze({ value: TOPOLOGIES.M1_M2_G1_G2, label: "M2 + M1 + G1 + G2 (4 Appraisers: M2, M1, G1, G2)", slots: Object.freeze(["M2", "M1", "G1", "G2"]) })
  ]);
  function getRequiredSlotsForTopology2(topology) {
    const config = TOPOLOGY_CONFIGS2[topology];
    return config ? [...config.slots] : [];
  }
  function unwrap3(value) {
    if (value && typeof value === "object" && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, "value")) {
      return value.value;
    }
    return value;
  }
  function readString2(value) {
    const raw = unwrap3(value);
    return raw === null || raw === void 0 ? "" : String(raw);
  }
  function routeRaw(route) {
    return route?.rawRecord || route || null;
  }
  function routeField(route, rawName, ...aliases) {
    const raw = routeRaw(route);
    if (!raw) return "";
    if (Object.prototype.hasOwnProperty.call(raw, rawName)) return unwrap3(raw[rawName]);
    for (const alias of aliases) {
      if (Object.prototype.hasOwnProperty.call(route || {}, alias)) return unwrap3(route[alias]);
    }
    return "";
  }
  function versionKeyOf(route) {
    return readString2(routeField(route, "Version_Key", "versionKey"));
  }
  function reorderCanonicalM2SlotBlocks(html, topology) {
    if (topology !== TOPOLOGIES.M1_M2_G1 && topology !== TOPOLOGIES.M1_M2_G1_G2) return html;
    const sectionStart = html.indexOf("<!-- Dynamic Appraiser Slots -->");
    const sectionEnd = html.indexOf("<!-- Scorer Slots Configuration -->");
    if (sectionStart < 0 || sectionEnd <= sectionStart) return html;
    const section = html.slice(sectionStart, sectionEnd);
    const blockRegex = /\s*<!-- (M1|M2|G1|G2) -->\s*<div id="slot-container-[^"]+"[^>]*>[\s\S]*?<\/div>/g;
    const matches = [...section.matchAll(blockRegex)];
    if (matches.length !== 4) return html;
    const bySlot = new Map(matches.map((match) => [match[1], match[0]]));
    if (!["M1", "M2", "G1", "G2"].every((slot) => bySlot.has(slot))) return html;
    const first = matches[0].index;
    const lastMatch = matches[matches.length - 1];
    const last = lastMatch.index + lastMatch[0].length;
    const ordered = ["M2", "M1", "G1", "G2"].map((slot) => bySlot.get(slot)).join("");
    const correctedSection = section.slice(0, first) + ordered + section.slice(last);
    return html.slice(0, sectionStart) + correctedSection + html.slice(sectionEnd);
  }
  function injectExplicitScorerBlankOptions(html) {
    const explicitBlank = '<option value="">(Select explicit scorer slot / \u0E15\u0E49\u0E2D\u0E07\u0E23\u0E30\u0E1A\u0E38)</option>';
    return html.replace(/(<select id="hr-scorer-midyear"[^>]*>)/, `$1
                ${explicitBlank}`).replace(/(<select id="hr-scorer-final1"[^>]*>)/, `$1
                ${explicitBlank}`);
  }
  function injectVersionKeys(html, routes) {
    let index = 0;
    return html.replace(/class="btn-select-route" data-route-key="([^"]*)"/g, (match) => {
      const versionKey = versionKeyOf(routes[index++]);
      return `${match} data-version-key="${escapeHtml2(versionKey)}"`;
    });
  }
  function injectSupersedeDateInput(html, value) {
    const marker = "<!-- Business Reason (Remark) -->";
    if (!html.includes(marker)) return html;
    const block = `
        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">
            Supersede Active Effective To (Explicit, required for Supersede):
          </label>
          <input type="date" id="hr-supersede-effective-to" class="hr-input" value="${escapeHtml2(value || "")}" style="width: 100%; padding: 0.5rem; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box;">
        </div>

        `;
    return html.replace(marker, block + marker);
  }
  function renderHrRoutingManagerHtml2(args = {}) {
    const routes = Array.isArray(args.routes) ? args.routes : [];
    let html = renderHrRoutingManagerHtml({
      ...args,
      scorerValues: args.scorerValues || {}
    });
    html = html.replace("M1 + M2 + G1 (3 Appraisers: M1, M2, G1)", "M2 + M1 + G1 (3 Appraisers: M2, M1, G1)").replace("M1 + M2 + G1 + G2 (4 Appraisers: M1, M2, G1, G2)", "M2 + M1 + G1 + G2 (4 Appraisers: M2, M1, G1, G2)");
    html = reorderCanonicalM2SlotBlocks(html, args.selectedTopology);
    html = injectExplicitScorerBlankOptions(html);
    html = injectVersionKeys(html, routes);
    html = injectSupersedeDateInput(html, args.supersedeEffectiveToDate || "");
    return html;
  }

  // src/ui/hr-routing-manager.js
  var getRequiredSlotsForTopology3 = getRequiredSlotsForTopology2;
  var renderHrRoutingManagerHtml3 = renderHrRoutingManagerHtml2;
  function unwrap4(value) {
    if (value && typeof value === "object" && !Array.isArray(value) && Object.prototype.hasOwnProperty.call(value, "value")) {
      return value.value;
    }
    return value;
  }
  function readString3(value) {
    const raw = unwrap4(value);
    return raw === null || raw === void 0 ? "" : String(raw);
  }
  function routeRaw2(route) {
    return route?.rawRecord || route || null;
  }
  function routeField2(route, rawName, ...aliases) {
    const raw = routeRaw2(route);
    if (!raw) return "";
    if (Object.prototype.hasOwnProperty.call(raw, rawName)) return unwrap4(raw[rawName]);
    for (const alias of aliases) {
      if (Object.prototype.hasOwnProperty.call(route || {}, alias)) return unwrap4(route[alias]);
    }
    return "";
  }
  function routeKeyOf(route) {
    return readString3(routeField2(route, "Routing_Key", "routingKey"));
  }
  function versionKeyOf2(route) {
    return readString3(routeField2(route, "Version_Key", "versionKey"));
  }
  function statusOf(route) {
    return readString3(routeField2(route, "Version_Status", "Status", "status", "versionStatus"));
  }
  function revisionOf(route) {
    const raw = routeRaw2(route);
    return readString3(raw?.$revision);
  }
  function rawRoutes(routes) {
    return (Array.isArray(routes) ? routes : []).map(routeRaw2).filter(Boolean);
  }
  function buildDraftState(state) {
    return {
      routingKey: state.selectedRouteKey,
      topology: state.selectedTopology,
      slots: state.slotValues,
      scorerSlots: state.scorerValues,
      effectiveFrom: state.effectiveFrom,
      effectiveTo: state.effectiveTo,
      businessReason: state.remark
    };
  }
  function toServiceDraftInput(service, state) {
    const draft = buildDraftState(state);
    const candidate = service.buildCandidateRecordFromDraft({ draft });
    return {
      ...candidate,
      Routing_Key: state.selectedRouteKey,
      Route_Pattern: readString3(candidate.Route_Pattern),
      Routing_Topology: readString3(candidate.Routing_Topology),
      Effective_From: state.effectiveFrom,
      Effective_To: state.effectiveTo,
      Remark: state.remark
    };
  }
  function historyProofFor(state, routingKey) {
    if (state.historyCompleteness && state.historyCompleteness.complete === true && state.historyCompleteness.routingKey === routingKey) {
      return state.historyCompleteness;
    }
    if (state.versionHistoryCompletenessByRoutingKey?.[routingKey] === true) {
      return { routingKey, complete: true };
    }
    return void 0;
  }
  function versionContextFor(state) {
    if (!state.selectedVersionKey) return void 0;
    return {
      routingKey: state.selectedRouteKey,
      versionKey: state.selectedVersionKey
    };
  }
  function findSelectedVersion(state) {
    if (state.selectedVersionKey) {
      return state.routes.find((route) => versionKeyOf2(route) === state.selectedVersionKey) || null;
    }
    const sameKey = state.routes.filter((route) => routeKeyOf(route) === state.selectedRouteKey);
    return sameKey.length === 1 ? sameKey[0] : null;
  }
  function planPreviewFromMutation(plan, state) {
    return {
      isValid: true,
      topology: state.selectedTopology,
      activeSlots: getRequiredSlotsForTopology3(state.selectedTopology).map((slot) => ({
        role: slot,
        userCode: state.slotValues?.[slot] || ""
      })),
      scorerSlots: state.scorerValues,
      kExpected: state.kExpected,
      processCapabilityId: state.processCapabilityId,
      inFlightImpact: "NONE (ZERO)",
      planPayload: plan,
      warnings: []
    };
  }
  function bindHrRoutingManagerEvents({
    containerElement,
    principal,
    service = HrRoutingManagementService3,
    onPlanGenerated = () => {
    },
    initialData = {}
  }) {
    if (!containerElement) return null;
    let state = {
      selectedRouteKey: initialData.selectedRouteKey || "",
      selectedVersionKey: initialData.selectedVersionKey || "",
      selectedTopology: initialData.selectedTopology || TOPOLOGIES.M1_ONLY,
      slotValues: initialData.slotValues || {},
      scorerValues: initialData.scorerValues || { midYear: "", final1: "", final2: "" },
      effectiveFrom: initialData.effectiveFrom || "",
      effectiveTo: initialData.effectiveTo || "",
      supersedeEffectiveToDate: initialData.supersedeEffectiveToDate || "",
      remark: initialData.remark || "",
      validationErrors: [],
      previewResult: null,
      routes: Array.isArray(initialData.routes) ? initialData.routes : [],
      kExpected: initialData.kExpected,
      processCapabilityId: initialData.processCapabilityId,
      historyCompleteness: initialData.historyCompleteness,
      versionHistoryCompletenessByRoutingKey: initialData.versionHistoryCompletenessByRoutingKey || {}
    };
    const render = () => {
      containerElement.innerHTML = renderHrRoutingManagerHtml3({
        principal,
        routes: state.routes,
        selectedRouteKey: state.selectedRouteKey,
        selectedTopology: state.selectedTopology,
        slotValues: state.slotValues,
        scorerValues: state.scorerValues,
        effectiveFrom: state.effectiveFrom,
        effectiveTo: state.effectiveTo,
        supersedeEffectiveToDate: state.supersedeEffectiveToDate,
        remark: state.remark,
        validationErrors: state.validationErrors,
        previewResult: state.previewResult
      });
      attachListeners();
    };
    const readFormState = () => {
      const readValue = (selector, fallback) => {
        const element = containerElement.querySelector(selector);
        return element && typeof element.value !== "undefined" ? element.value : fallback;
      };
      const priorRoutingKey = state.selectedRouteKey;
      state.selectedRouteKey = readValue("#hr-route-key", state.selectedRouteKey);
      if (state.selectedRouteKey !== priorRoutingKey) {
        state.selectedVersionKey = "";
      }
      state.selectedTopology = readValue("#hr-topology-select", state.selectedTopology);
      state.effectiveFrom = readValue("#hr-effective-from", state.effectiveFrom);
      state.effectiveTo = readValue("#hr-effective-to", state.effectiveTo);
      state.supersedeEffectiveToDate = readValue(
        "#hr-supersede-effective-to",
        state.supersedeEffectiveToDate
      );
      state.remark = readValue("#hr-route-remark", state.remark);
      const nextSlots = { ...state.slotValues };
      const slotInputs = containerElement.querySelectorAll(".slot-input") || [];
      slotInputs.forEach((input) => {
        const slot = input.getAttribute?.("data-slot");
        if (slot) nextSlots[slot] = input.value;
      });
      state.slotValues = nextSlots;
      state.scorerValues = {
        midYear: readValue("#hr-scorer-midyear", state.scorerValues.midYear || ""),
        final1: readValue("#hr-scorer-final1", state.scorerValues.final1 || ""),
        final2: readValue("#hr-scorer-final2", state.scorerValues.final2 || "")
      };
    };
    const setPlan = (plan) => {
      state.validationErrors = [];
      state.previewResult = planPreviewFromMutation(plan, state);
      onPlanGenerated(plan);
      render();
    };
    const setError = (error) => {
      state.validationErrors = [error?.message || String(error)];
      state.previewResult = null;
      render();
    };
    const previewContextArgs = () => {
      const versionContext = versionContextFor(state);
      return versionContext ? { versionContext, historyCompleteness: void 0 } : {
        versionContext: void 0,
        historyCompleteness: historyProofFor(state, state.selectedRouteKey)
      };
    };
    const attachListeners = () => {
      const topo = containerElement.querySelector("#hr-topology-select");
      topo?.addEventListener("change", (event) => {
        state.selectedTopology = event.target.value;
        readFormState();
        render();
      });
      const selectButtons = containerElement.querySelectorAll(".btn-select-route") || [];
      selectButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          state.selectedRouteKey = event.target.getAttribute("data-route-key") || "";
          state.selectedVersionKey = event.target.getAttribute("data-version-key") || "";
          const selected = findSelectedVersion(state);
          if (selected) {
            state.selectedTopology = readString3(routeField2(selected, "Routing_Topology", "Topology", "topology")) || state.selectedTopology;
            state.effectiveFrom = readString3(routeField2(selected, "Effective_From", "effectiveFrom"));
            state.effectiveTo = readString3(routeField2(selected, "Effective_To", "effectiveTo"));
            state.remark = readString3(routeField2(selected, "Remark", "remark"));
          }
          render();
        });
      });
      const preview = containerElement.querySelector("#hr-btn-preview");
      preview?.addEventListener("click", () => {
        readFormState();
        try {
          const draft = buildDraftState(state);
          const context = previewContextArgs();
          const validation = service.validateRoutingDraft({
            principal,
            draft,
            records: rawRoutes(state.routes),
            kExpected: state.kExpected,
            processCapabilityId: state.processCapabilityId,
            ...context
          });
          if (!validation.isValid) {
            state.validationErrors = validation.errors;
            state.previewResult = null;
          } else {
            state.validationErrors = [];
            state.previewResult = service.previewRoutingPlan({
              principal,
              draft,
              records: rawRoutes(state.routes),
              kExpected: state.kExpected,
              processCapabilityId: state.processCapabilityId,
              ...context
            });
          }
          render();
        } catch (error) {
          setError(error);
        }
      });
      const create = containerElement.querySelector("#hr-btn-create-draft");
      create?.addEventListener("click", () => {
        readFormState();
        try {
          const draftInput = toServiceDraftInput(service, state);
          const plan = service.createDraftRoutePlan({
            principal,
            records: rawRoutes(state.routes),
            draftInput,
            processCapabilityId: state.processCapabilityId,
            kExpected: state.kExpected,
            historyCompleteness: historyProofFor(state, state.selectedRouteKey)
          });
          setPlan(plan);
        } catch (error) {
          setError(error);
        }
      });
      const save = containerElement.querySelector("#hr-btn-save-draft");
      save?.addEventListener("click", () => {
        readFormState();
        try {
          const selected = findSelectedVersion(state);
          const plan = service.editDraftRoutePlan({
            principal,
            records: rawRoutes(state.routes),
            versionKey: versionKeyOf2(selected),
            expectedRevision: revisionOf(selected),
            draftInput: toServiceDraftInput(service, state),
            processCapabilityId: state.processCapabilityId,
            kExpected: state.kExpected
          });
          setPlan(plan);
        } catch (error) {
          setError(error);
        }
      });
      const publish = containerElement.querySelector("#hr-btn-publish");
      publish?.addEventListener("click", () => {
        readFormState();
        try {
          const selected = findSelectedVersion(state);
          const plan = service.createPublishRoutePlan({
            principal,
            records: rawRoutes(state.routes),
            versionKey: versionKeyOf2(selected),
            expectedRevision: revisionOf(selected),
            businessReason: state.remark,
            processCapabilityId: state.processCapabilityId,
            kExpected: state.kExpected
          });
          setPlan(plan);
        } catch (error) {
          setError(error);
        }
      });
      const supersede = containerElement.querySelector("#hr-btn-supersede");
      supersede?.addEventListener("click", () => {
        readFormState();
        try {
          const selected = findSelectedVersion(state);
          const routingKey = state.selectedRouteKey || routeKeyOf(selected);
          const candidates = state.routes.filter((route) => routeKeyOf(route) === routingKey);
          const active = statusOf(selected) === ROUTING_STATUSES.ACTIVE ? selected : candidates.find((route) => statusOf(route) === ROUTING_STATUSES.ACTIVE);
          const draft = statusOf(selected) === ROUTING_STATUSES.DRAFT ? selected : candidates.find((route) => statusOf(route) === ROUTING_STATUSES.DRAFT);
          const plan = service.createSupersedeRoutePlan({
            principal,
            records: rawRoutes(state.routes),
            activeVersionKey: versionKeyOf2(active),
            expectedActiveRevision: revisionOf(active),
            newVersionKey: versionKeyOf2(draft),
            expectedNewRevision: revisionOf(draft),
            effectiveToDate: state.supersedeEffectiveToDate,
            businessReason: state.remark,
            processCapabilityId: state.processCapabilityId,
            kExpected: state.kExpected
          });
          setPlan(plan);
        } catch (error) {
          setError(error);
        }
      });
    };
    render();
    return {
      getState: () => ({
        ...state,
        slotValues: { ...state.slotValues },
        scorerValues: { ...state.scorerValues }
      }),
      setState: (next) => {
        state = { ...state, ...next };
        render();
      }
    };
  }

  // src/ui/hr-control-center.js
  var DEFAULT_APP_IDS = Object.freeze({
    mboV2AppId: 794,
    routingMasterAppId: 795,
    scoringConfigMasterAppId: 796,
    hoshinMasterAppId: 797,
    revisionArchiveAppId: 798,
    hrControlCenterAppId: 800,
    credentialAppId: 801
  });
  var ALLOWED_MONITORING_FIELDS_794 = Object.freeze([
    "$id",
    "Fiscal_Year",
    "Employee_Code",
    "Employee_Name",
    "Employee_Name_TH",
    "Employee_Department",
    "Employee_Section",
    "Employee_Position",
    "Status"
  ]);
  var CONFIDENTIAL_FIELDS_PROHIBITED = Object.freeze([
    "PartA_Weighted_Score",
    "PartB_Weighted_Score",
    "Final_Confidential_Score",
    "Manager_Comment",
    "GM_Comment",
    "Self_Comment",
    "MidYear_Attachment_1",
    "Final_Attachment_1"
  ]);
  function escapeHtml3(str) {
    if (str === null || str === void 0) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function buildHrccMonitoringQuery(fields = ALLOWED_MONITORING_FIELDS_794) {
    if (!Array.isArray(fields)) {
      throw new Error("SECURITY VIOLATION: Fields parameter must be an array.");
    }
    for (const f of fields) {
      if (!ALLOWED_MONITORING_FIELDS_794.includes(f)) {
        throw new Error(`SECURITY VIOLATION: Non-whitelisted field "${f}" is prohibited in HRCC monitoring query.`);
      }
    }
    return fields.join(",");
  }
  async function fetchAllApp794Records(kintoneApi, appId = 794, maxPages = 20) {
    const queryFields = buildHrccMonitoringQuery();
    const fields = queryFields.split(",");
    let allRecords = [];
    let offset = 0;
    const limit = 500;
    let truncated = false;
    for (let page = 0; page < maxPages; page++) {
      const query = `limit ${limit} offset ${offset}`;
      const res = await kintoneApi("/k/v1/records.json", "GET", { app: appId, fields, query });
      const records = res.records || [];
      allRecords = allRecords.concat(records);
      if (records.length < limit) {
        break;
      }
      offset += limit;
      if (page === maxPages - 1 && records.length === limit) {
        truncated = true;
      }
    }
    return { records: allRecords, truncated };
  }
  async function fetchHealthCount(kintoneApi, appId, queryFilter = "") {
    try {
      const query = queryFilter ? `${queryFilter} limit 1` : "limit 1";
      const res = await kintoneApi("/k/v1/records.json", "GET", { app: appId, query, totalCount: true });
      const count = res.totalCount !== void 0 && res.totalCount !== null ? Number(res.totalCount) : res.records?.length || 0;
      return { available: true, count, error: null };
    } catch (err) {
      return { available: false, count: null, error: err.message || "Access denied / unavailable" };
    }
  }
  function aggregatePipelineByStatus(evaluations = []) {
    const pipeline = {
      DRAFT: 0,
      SUBMITTED: 0,
      IN_REVIEW: 0,
      COMPLETED: 0,
      REJECTED: 0,
      OTHER: 0
    };
    for (const e of evaluations) {
      const st = e.Status?.value || "UNKNOWN";
      if (st === "DRAFT") pipeline.DRAFT++;
      else if (st === "SUBMITTED") pipeline.SUBMITTED++;
      else if (st.includes("APPROV") || st.includes("REVIEW")) pipeline.IN_REVIEW++;
      else if (st === "COMPLETED" || st === "APPROVED") pipeline.COMPLETED++;
      else if (st === "REJECTED") pipeline.REJECTED++;
      else pipeline.OTHER++;
    }
    return pipeline;
  }
  function applyHrccFilters(evaluations = [], { fy = "", dept = "", sec = "", status = "" } = {}) {
    return evaluations.filter((e) => {
      if (fy && e.Fiscal_Year?.value !== fy) return false;
      if (dept && e.Employee_Department?.value !== dept) return false;
      if (sec && e.Employee_Section?.value !== sec) return false;
      if (status && e.Status?.value !== status) return false;
      return true;
    });
  }
  function renderHrControlCenterHtml({
    evaluations = [],
    allEvaluations = [],
    health = {},
    warnings = [],
    filters = { fy: "", dept: "", sec: "", status: "" },
    appIds = DEFAULT_APP_IDS
  } = {}) {
    const normHealth = {
      app794Count: health.app794Count || 0,
      routing: health.routing || { available: true, count: health.routingCoverage || 0 },
      scoring: health.scoring || { available: true, count: health.configCount || 0 },
      hoshin: health.hoshin || { available: true, count: health.hoshinCount || 0 },
      archive: health.archive || { available: true, count: health.archiveCount || 0 }
    };
    const filtered = applyHrccFilters(evaluations, filters);
    const total = filtered.length;
    const completed = filtered.filter((e) => e.Status?.value === "COMPLETED" || e.Status?.value === "APPROVED").length;
    const inProgress = filtered.filter((e) => e.Status?.value && e.Status.value !== "COMPLETED" && e.Status.value !== "APPROVED" && e.Status.value !== "REJECTED").length;
    const needAttention = filtered.filter((e) => e.Status?.value === "REJECTED" || e.Status?.value === "SUBMITTED").length;
    const pipeline = aggregatePipelineByStatus(filtered);
    const fys = Array.from(new Set(allEvaluations.map((e) => e.Fiscal_Year?.value).filter(Boolean))).sort();
    const depts = Array.from(new Set(allEvaluations.map((e) => e.Employee_Department?.value).filter(Boolean))).sort();
    const secs = Array.from(new Set(allEvaluations.map((e) => e.Employee_Section?.value).filter(Boolean))).sort();
    const statuses = Array.from(new Set(allEvaluations.map((e) => e.Status?.value).filter(Boolean))).sort();
    const warningHtml = warnings.length > 0 ? warnings.map((w) => `<div class="hrcc-warning-box">\u26A0\uFE0F <strong>Warning:</strong> ${escapeHtml3(w)}</div>`).join("") : "";
    const formatHealthText = (h, suffix = "") => {
      if (!h.available) return '<span style="color:red;">Unavailable / Access denied</span>';
      return `${escapeHtml3(h.count)}${suffix}`;
    };
    const routingText = normHealth.routing.available ? `${escapeHtml3(normHealth.routing.count)}/12` : '<span style="color:red;">Unavailable / Access denied</span>';
    const rowsHtml = filtered.map((e) => {
      const id = escapeHtml3(e.$id?.value || "");
      const code = escapeHtml3(e.Employee_Code?.value || "-");
      const name = escapeHtml3(e.Employee_Name?.value || e.Employee_Name_TH?.value || "-");
      const deptVal = escapeHtml3(e.Employee_Department?.value || "-");
      const secVal = escapeHtml3(e.Employee_Section?.value || "-");
      const posVal = escapeHtml3(e.Employee_Position?.value || "-");
      const statusVal = escapeHtml3(e.Status?.value || "-");
      return `<tr>
      <td>${code}</td>
      <td>${name}</td>
      <td>${deptVal}</td>
      <td>${secVal}</td>
      <td>${posVal}</td>
      <td><span class="hrcc-badge">${statusVal}</span></td>
      <td><a class="hrcc-link" href="/k/${appIds.mboV2AppId}/show#record=${id}" target="_blank">Open Record #${id}</a></td>
    </tr>`;
    }).join("");
    return `
<div class="hrcc-container">
  <div class="hrcc-header">
    <h1 class="hrcc-title">MBO 2026 \u2014 HR Control Center</h1>
    <span class="hrcc-badge">SECURE HR CONTROL CENTER</span>
  </div>

  ${warningHtml}

  <div class="hrcc-health-panel">
    <strong>System Health & Inventory:</strong>
    App ${appIds.mboV2AppId} Count: ${escapeHtml3(normHealth.app794Count)} |
    App ${appIds.routingMasterAppId} Active Routings: ${routingText} |
    App ${appIds.scoringConfigMasterAppId} Published Configs: ${formatHealthText(normHealth.scoring)} |
    App ${appIds.hoshinMasterAppId} Ready Hoshins: ${formatHealthText(normHealth.hoshin)} |
    App ${appIds.revisionArchiveAppId} Archive Snapshots: ${formatHealthText(normHealth.archive)}
  </div>

  <div class="hrcc-quick-links" style="margin-bottom: 1rem;">
    <strong>Quick Links:</strong>
    <a class="hrcc-link" href="/k/${appIds.mboV2AppId}/" target="_blank" style="margin-right: 1rem;">App ${appIds.mboV2AppId} (Transaction Core)</a>
    <a class="hrcc-link" href="/k/${appIds.routingMasterAppId}/" target="_blank" style="margin-right: 1rem;">App ${appIds.routingMasterAppId} (Routing Master)</a>
    <a class="hrcc-link" href="/k/${appIds.scoringConfigMasterAppId}/" target="_blank" style="margin-right: 1rem;">App ${appIds.scoringConfigMasterAppId} (Scoring Master)</a>
    <a class="hrcc-link" href="/k/${appIds.hoshinMasterAppId}/" target="_blank" style="margin-right: 1rem;">App ${appIds.hoshinMasterAppId} (Hoshin Master)</a>
    <a class="hrcc-link" href="/k/${appIds.revisionArchiveAppId}/" target="_blank">App ${appIds.revisionArchiveAppId} (Revision Archive)</a>
  </div>

  <!-- Filters -->
  <div class="hrcc-filter-bar" style="background:#f4f6f8; padding:0.75rem; border-radius:6px; margin-bottom:1rem; display:flex; gap:1rem; flex-wrap:wrap; align-items:center;">
    <strong>Filters:</strong>
    <label>FY:
      <select id="hrcc-filter-fy" class="hrcc-select">
        <option value="">All FYs</option>
        ${fys.map((f) => `<option value="${escapeHtml3(f)}" ${filters.fy === f ? "selected" : ""}>${escapeHtml3(f)}</option>`).join("")}
      </select>
    </label>

    <label>Department:
      <select id="hrcc-filter-dept" class="hrcc-select">
        <option value="">All Departments</option>
        ${depts.map((d) => `<option value="${escapeHtml3(d)}" ${filters.dept === d ? "selected" : ""}>${escapeHtml3(d)}</option>`).join("")}
      </select>
    </label>

    <label>Section:
      <select id="hrcc-filter-sec" class="hrcc-select">
        <option value="">All Sections</option>
        ${secs.map((s) => `<option value="${escapeHtml3(s)}" ${filters.sec === s ? "selected" : ""}>${escapeHtml3(s)}</option>`).join("")}
      </select>
    </label>

    <label>Status:
      <select id="hrcc-filter-status" class="hrcc-select">
        <option value="">All Statuses</option>
        ${statuses.map((st) => `<option value="${escapeHtml3(st)}" ${filters.status === st ? "selected" : ""}>${escapeHtml3(st)}</option>`).join("")}
      </select>
    </label>
  </div>

  <div class="hrcc-kpi-grid">
    <div class="hrcc-kpi-card">
      <div class="hrcc-kpi-title">Total Evaluations</div>
      <div class="hrcc-kpi-value">${total}</div>
    </div>
    <div class="hrcc-kpi-card">
      <div class="hrcc-kpi-title">Completed / Approved</div>
      <div class="hrcc-kpi-value">${completed}</div>
    </div>
    <div class="hrcc-kpi-card">
      <div class="hrcc-kpi-title">In Progress</div>
      <div class="hrcc-kpi-value">${inProgress}</div>
    </div>
    <div class="hrcc-kpi-card">
      <div class="hrcc-kpi-title">Need Attention</div>
      <div class="hrcc-kpi-value">${needAttention}</div>
    </div>
  </div>

  <!-- Pipeline Breakdown -->
  <div class="hrcc-pipeline-bar" style="background:#eef2f5; padding:0.75rem; border-radius:6px; margin-bottom:1rem;">
    <strong>Pipeline Breakdown:</strong>
    Draft: <strong>${pipeline.DRAFT}</strong> |
    Submitted: <strong>${pipeline.SUBMITTED}</strong> |
    In Review: <strong>${pipeline.IN_REVIEW}</strong> |
    Completed: <strong>${pipeline.COMPLETED}</strong> |
    Rejected: <strong>${pipeline.REJECTED}</strong>
  </div>

  <!-- Reset MBO Password Panel -->
  <div class="hrcc-reset-panel" style="background:#ffffff; border:1px solid #e5e7eb; border-radius:0.375rem; padding:1.25rem; margin-bottom:1.5rem;">
    <h2 class="hrcc-reset-title" style="font-size:1.125rem; font-weight:700; margin-top:0; margin-bottom:0.75rem; color:#111827;">
      \u{1F511} \u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 MBO / Reset MBO Password
    </h2>
    <p class="hrcc-reset-help" style="font-size:0.875rem; color:#4b5563; margin-bottom:1rem; line-height:1.5;">
      \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E17\u0E35\u0E48\u0E21\u0E35\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E4C HR Admin \u0E2B\u0E23\u0E37\u0E2D Technical Recovery: \u0E1B\u0E49\u0E2D\u0E19 Employee Code \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 <strong>MBO Credentials (App 801)</strong> \u0E40\u0E1B\u0E47\u0E19\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19 (\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A Employee Code)<br>
      <span style="color:#b91c1c; font-weight:600;">\u26A0\uFE0F \u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38: \u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E19\u0E35\u0E49\u0E08\u0E30\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 MBO \u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A MBO \u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19 \u0E44\u0E21\u0E48\u0E01\u0E23\u0E30\u0E17\u0E1A\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E1A\u0E31\u0E0D\u0E0A\u0E35 Kintone/cybozu \u0E2B\u0E25\u0E31\u0E01\u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49</span>
    </p>
    <div class="hrcc-reset-form" style="display:flex; gap:1rem; flex-wrap:wrap; align-items:flex-end;">
      <label style="display:flex; flex-direction:column; gap:0.25rem; font-size:0.875rem; font-weight:600;">
        Employee Code:
        <input type="text" id="hrcc-reset-emp-code" class="hrcc-input" placeholder="e.g. EMP001" style="padding:0.5rem; border:1px solid #d1d5db; border-radius:0.25rem; width:180px;">
      </label>
      <label style="display:flex; flex-direction:column; gap:0.25rem; font-size:0.875rem; font-weight:600;">
        Confirm Employee Code:
        <input type="text" id="hrcc-reset-emp-confirm" class="hrcc-input" placeholder="Re-enter Employee Code" style="padding:0.5rem; border:1px solid #d1d5db; border-radius:0.25rem; width:180px;">
      </label>
      <button type="button" id="hrcc-reset-btn" class="hrcc-btn-danger" style="padding:0.5rem 1.25rem; background-color:#dc2626; color:#ffffff; font-weight:600; border:none; border-radius:0.25rem; cursor:pointer;">
        Reset MBO Password
      </button>
    </div>
    <div id="hrcc-reset-feedback" style="margin-top:1rem; font-size:0.875rem; display:none;"></div>
  </div>

  <table class="hrcc-table">
    <thead>
      <tr>
        <th>Code</th>
        <th>Employee Name</th>
        <th>Department</th>
        <th>Section</th>
        <th>Position</th>
        <th>Status</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody id="hrcc-table-body">
      ${rowsHtml || '<tr><td colspan="7">No matching transactional records found.</td></tr>'}
    </tbody>
  </table>
</div>
`;
  }
  function createHrccRuntime({
    kintoneApi,
    onResetMboPassword,
    appIds = DEFAULT_APP_IDS,
    getAppId = () => typeof kintone !== "undefined" ? kintone.app.getId() : null,
    getHeaderSpaceElement = () => typeof kintone !== "undefined" ? kintone.app.getHeaderSpaceElement() : null
  } = {}) {
    return async function hrccEventHandler(event) {
      const currentAppId = getAppId();
      if (currentAppId !== appIds.hrControlCenterAppId) return event;
      const headerSpace = getHeaderSpaceElement();
      if (!headerSpace) return event;
      try {
        const { records: evaluations, truncated } = await fetchAllApp794Records(kintoneApi, appIds.mboV2AppId);
        const health795 = await fetchHealthCount(kintoneApi, appIds.routingMasterAppId, 'Active = "Active"');
        const health796 = await fetchHealthCount(kintoneApi, appIds.scoringConfigMasterAppId, 'Config_Status = "PUBLISHED"');
        const health797 = await fetchHealthCount(kintoneApi, appIds.hoshinMasterAppId, 'Ready_For_MBO = "YES"');
        const health798 = await fetchHealthCount(kintoneApi, appIds.revisionArchiveAppId, "");
        const warnings = [];
        if (truncated) {
          warnings.push(`App ${appIds.mboV2AppId} record count exceeded maximum pagination limit (10,000 records). Some records may not be displayed.`);
        }
        if (!health795.available) warnings.push(`App ${appIds.routingMasterAppId} (Routing Master) is unavailable or access denied.`);
        else if (health795.count < 12) warnings.push(`Routing Master App ${appIds.routingMasterAppId} requester coverage is incomplete (current: ${health795.count}/12).`);
        if (!health796.available) warnings.push(`App ${appIds.scoringConfigMasterAppId} (Scoring Master) is unavailable or access denied.`);
        else if (health796.count === 0) warnings.push(`Scoring Master App ${appIds.scoringConfigMasterAppId} has 0 active baseline records.`);
        if (!health797.available) warnings.push(`App ${appIds.hoshinMasterAppId} (Hoshin Master) is unavailable or access denied.`);
        else if (health797.count === 0) warnings.push(`Hoshin Master App ${appIds.hoshinMasterAppId} has 0 active Hoshin records.`);
        if (!health798.available) warnings.push(`App ${appIds.revisionArchiveAppId} (Revision Archive) is unavailable or access denied.`);
        const health = {
          app794Count: evaluations.length,
          routing: health795,
          scoring: health796,
          hoshin: health797,
          archive: health798
        };
        let activeFilters = { fy: "", dept: "", sec: "", status: "" };
        const defaultResetHandler = async ({ employeeCode }) => {
          const apiWrapper = {
            getRecords: async (appId, query) => kintoneApi("/k/v1/records.json", "GET", { app: appId, query }),
            updateRecord: async (appId, id, record) => kintoneApi("/k/v1/record.json", "PUT", { app: appId, id, record })
          };
          const adapter = new MboKintoneAuthAdapter({ api: apiWrapper, appId: appIds.credentialAppId || 801 });
          return await adapter.resetMboPassword({ employeeCode });
        };
        const resetFn = onResetMboPassword || defaultResetHandler;
        const renderUI = () => {
          headerSpace.innerHTML = renderHrControlCenterHtml({
            evaluations,
            allEvaluations: evaluations,
            health,
            warnings,
            filters: activeFilters,
            appIds
          });
          const fySelect = headerSpace.querySelector("#hrcc-filter-fy");
          const deptSelect = headerSpace.querySelector("#hrcc-filter-dept");
          const secSelect = headerSpace.querySelector("#hrcc-filter-sec");
          const statusSelect = headerSpace.querySelector("#hrcc-filter-status");
          if (fySelect) fySelect.addEventListener("change", (e) => {
            activeFilters.fy = e.target.value;
            renderUI();
          });
          if (deptSelect) deptSelect.addEventListener("change", (e) => {
            activeFilters.dept = e.target.value;
            renderUI();
          });
          if (secSelect) secSelect.addEventListener("change", (e) => {
            activeFilters.sec = e.target.value;
            renderUI();
          });
          if (statusSelect) statusSelect.addEventListener("change", (e) => {
            activeFilters.status = e.target.value;
            renderUI();
          });
          const resetBtn = headerSpace.querySelector("#hrcc-reset-btn");
          const empCodeInput = headerSpace.querySelector("#hrcc-reset-emp-code");
          const empConfirmInput = headerSpace.querySelector("#hrcc-reset-emp-confirm");
          const feedbackDiv = headerSpace.querySelector("#hrcc-reset-feedback");
          if (resetBtn) {
            let isExecuting = false;
            resetBtn.addEventListener("click", async () => {
              if (isExecuting) return;
              const rawEmpCode = empCodeInput ? empCodeInput.value : "";
              const rawEmpConfirm = empConfirmInput ? empConfirmInput.value : "";
              if (feedbackDiv) {
                feedbackDiv.style.display = "block";
                feedbackDiv.innerHTML = "";
              }
              if (!rawEmpCode || !rawEmpConfirm) {
                if (feedbackDiv) {
                  feedbackDiv.innerHTML = `<div class="hrcc-warning-box">\u26A0\uFE0F \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38 Employee Code \u0E41\u0E25\u0E30\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19 Employee Code \u0E43\u0E2B\u0E49\u0E04\u0E23\u0E1A\u0E16\u0E49\u0E27\u0E19 / Please enter both Employee Code and confirmation.</div>`;
                }
                return;
              }
              if (rawEmpCode !== rawEmpCode.trim() || rawEmpConfirm !== rawEmpConfirm.trim()) {
                if (feedbackDiv) {
                  feedbackDiv.innerHTML = `<div class="hrcc-warning-box">\u26A0\uFE0F Employee Code \u0E2B\u0E49\u0E32\u0E21\u0E21\u0E35\u0E0A\u0E48\u0E2D\u0E07\u0E27\u0E48\u0E32\u0E07\u0E19\u0E33\u0E2B\u0E19\u0E49\u0E32\u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E48\u0E2D\u0E17\u0E49\u0E32\u0E22 / Employee Code must not contain leading or trailing whitespace.</div>`;
                }
                return;
              }
              if (!/^[A-Za-z0-9_.-]+$/.test(rawEmpCode)) {
                if (feedbackDiv) {
                  feedbackDiv.innerHTML = `<div class="hrcc-warning-box">\u26A0\uFE0F \u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A Employee Code \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (\u0E2D\u0E19\u0E38\u0E0D\u0E32\u0E15\u0E40\u0E09\u0E1E\u0E32\u0E30 A-Z, a-z, 0-9, _, ., -) / Invalid Employee Code format (allowed characters: A-Z, a-z, 0-9, _, ., -).</div>`;
                }
                return;
              }
              if (rawEmpCode !== rawEmpConfirm) {
                if (feedbackDiv) {
                  feedbackDiv.innerHTML = `<div class="hrcc-warning-box">\u26A0\uFE0F Employee Code \u0E41\u0E25\u0E30\u0E04\u0E48\u0E32\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E19 / Employee Code and confirmation code do not match.</div>`;
                }
                return;
              }
              isExecuting = true;
              resetBtn.disabled = true;
              resetBtn.textContent = "Resetting...";
              try {
                const res = await resetFn({ employeeCode: rawEmpCode });
                if (res && res.status === "PASSWORD_RESET") {
                  const safeCode = escapeHtml3(res.employeeCode || rawEmpCode);
                  if (feedbackDiv) {
                    feedbackDiv.innerHTML = `<div style="background:#ecfdf5; border-left:4px solid #10b981; padding:0.75rem 1rem; border-radius:0.25rem; color:#065f46;">
                    \u2705 <strong>\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 MBO \u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08 / Reset MBO Password Successful:</strong><br>
                    \u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 MBO \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A Employee Code <strong>[${safeCode}]</strong> \u0E16\u0E39\u0E01\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E40\u0E1B\u0E47\u0E19\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E40\u0E23\u0E34\u0E48\u0E21\u0E15\u0E49\u0E19 (\u0E40\u0E17\u0E48\u0E32\u0E01\u0E31\u0E1A Employee Code) \u0E41\u0E25\u0E49\u0E27<br>
                    \u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E43\u0E19\u0E01\u0E32\u0E23\u0E40\u0E02\u0E49\u0E32\u0E2A\u0E39\u0E48\u0E23\u0E30\u0E1A\u0E1A MBO \u0E04\u0E23\u0E31\u0E49\u0E07\u0E16\u0E31\u0E14\u0E44\u0E1B\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E40\u0E02\u0E49\u0E32\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E41\u0E1A\u0E1A Shared Account<br>
                    <small style="color:#047857; display:block; margin-top:0.25rem;">\u2139\uFE0F \u0E2B\u0E21\u0E32\u0E22\u0E40\u0E2B\u0E15\u0E38: \u0E01\u0E32\u0E23\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E19\u0E35\u0E49\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19\u0E1A\u0E31\u0E0D\u0E0A\u0E35 Kintone/cybozu \u0E2B\u0E25\u0E31\u0E01\u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49 / Note: This action does not reset native Kintone/cybozu account password.</small>
                  </div>`;
                  }
                  if (empCodeInput) empCodeInput.value = "";
                  if (empConfirmInput) empConfirmInput.value = "";
                } else {
                  const reason = escapeHtml3(res?.reason || res?.status || "Unknown credential failure");
                  if (feedbackDiv) {
                    feedbackDiv.innerHTML = `<div class="hrcc-warning-box">\u274C \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 MBO \u0E44\u0E14\u0E49: ${reason}</div>`;
                  }
                }
              } catch (err) {
                const errMsg = escapeHtml3(err.message || "Technical error occurred");
                if (feedbackDiv) {
                  feedbackDiv.innerHTML = `<div class="hrcc-warning-box">\u274C \u0E40\u0E01\u0E34\u0E14\u0E02\u0E49\u0E2D\u0E1C\u0E34\u0E14\u0E1E\u0E25\u0E32\u0E14\u0E17\u0E32\u0E07\u0E40\u0E17\u0E04\u0E19\u0E34\u0E04: ${errMsg}</div>`;
                }
              } finally {
                isExecuting = false;
                resetBtn.disabled = false;
                resetBtn.textContent = "Reset MBO Password";
              }
            });
          }
        };
        renderUI();
      } catch (err) {
        headerSpace.innerHTML = `<div class="hrcc-container" style="color:red;">\u274C Error loading HR Control Center: ${escapeHtml3(err.message)}</div>`;
      }
      return event;
    };
  }
  if (typeof kintone !== "undefined" && kintone.events) {
    const browserKintoneApi = (path, method, params) => kintone.api(kintone.api.url(path, true), method, params);
    const handler = createHrccRuntime({ kintoneApi: browserKintoneApi });
    kintone.events.on("app.record.index.show", handler);
  }
})();
