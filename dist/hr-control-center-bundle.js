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
  function escapeHtml(str) {
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
    const warningHtml = warnings.length > 0 ? warnings.map((w) => `<div class="hrcc-warning-box">\u26A0\uFE0F <strong>Warning:</strong> ${escapeHtml(w)}</div>`).join("") : "";
    const formatHealthText = (h, suffix = "") => {
      if (!h.available) return '<span style="color:red;">Unavailable / Access denied</span>';
      return `${escapeHtml(h.count)}${suffix}`;
    };
    const routingText = normHealth.routing.available ? `${escapeHtml(normHealth.routing.count)}/12` : '<span style="color:red;">Unavailable / Access denied</span>';
    const rowsHtml = filtered.map((e) => {
      const id = escapeHtml(e.$id?.value || "");
      const code = escapeHtml(e.Employee_Code?.value || "-");
      const name = escapeHtml(e.Employee_Name?.value || e.Employee_Name_TH?.value || "-");
      const deptVal = escapeHtml(e.Employee_Department?.value || "-");
      const secVal = escapeHtml(e.Employee_Section?.value || "-");
      const posVal = escapeHtml(e.Employee_Position?.value || "-");
      const statusVal = escapeHtml(e.Status?.value || "-");
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
    App ${appIds.mboV2AppId} Count: ${escapeHtml(normHealth.app794Count)} |
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
        ${fys.map((f) => `<option value="${escapeHtml(f)}" ${filters.fy === f ? "selected" : ""}>${escapeHtml(f)}</option>`).join("")}
      </select>
    </label>

    <label>Department:
      <select id="hrcc-filter-dept" class="hrcc-select">
        <option value="">All Departments</option>
        ${depts.map((d) => `<option value="${escapeHtml(d)}" ${filters.dept === d ? "selected" : ""}>${escapeHtml(d)}</option>`).join("")}
      </select>
    </label>

    <label>Section:
      <select id="hrcc-filter-sec" class="hrcc-select">
        <option value="">All Sections</option>
        ${secs.map((s) => `<option value="${escapeHtml(s)}" ${filters.sec === s ? "selected" : ""}>${escapeHtml(s)}</option>`).join("")}
      </select>
    </label>

    <label>Status:
      <select id="hrcc-filter-status" class="hrcc-select">
        <option value="">All Statuses</option>
        ${statuses.map((st) => `<option value="${escapeHtml(st)}" ${filters.status === st ? "selected" : ""}>${escapeHtml(st)}</option>`).join("")}
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
              const empCode = empCodeInput ? empCodeInput.value.trim() : "";
              const empConfirm = empConfirmInput ? empConfirmInput.value.trim() : "";
              if (feedbackDiv) {
                feedbackDiv.style.display = "block";
                feedbackDiv.innerHTML = "";
              }
              if (!empCode || !empConfirm) {
                if (feedbackDiv) {
                  feedbackDiv.innerHTML = `<div class="hrcc-warning-box">\u26A0\uFE0F \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38 Employee Code \u0E41\u0E25\u0E30\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19 Employee Code \u0E43\u0E2B\u0E49\u0E04\u0E23\u0E1A\u0E16\u0E49\u0E27\u0E19 / Please enter both Employee Code and confirmation.</div>`;
                }
                return;
              }
              if (!/^[A-Za-z0-9_.-]+$/.test(empCode)) {
                if (feedbackDiv) {
                  feedbackDiv.innerHTML = `<div class="hrcc-warning-box">\u26A0\uFE0F \u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A Employee Code \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (\u0E2D\u0E19\u0E38\u0E0D\u0E32\u0E15\u0E40\u0E09\u0E1E\u0E32\u0E30 A-Z, a-z, 0-9, _, ., -) / Invalid Employee Code format (allowed characters: A-Z, a-z, 0-9, _, ., -).</div>`;
                }
                return;
              }
              if (empCode !== empConfirm) {
                if (feedbackDiv) {
                  feedbackDiv.innerHTML = `<div class="hrcc-warning-box">\u26A0\uFE0F Employee Code \u0E41\u0E25\u0E30\u0E04\u0E48\u0E32\u0E22\u0E37\u0E19\u0E22\u0E31\u0E19\u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E19 / Employee Code and confirmation code do not match.</div>`;
                }
                return;
              }
              isExecuting = true;
              resetBtn.disabled = true;
              resetBtn.textContent = "Resetting...";
              try {
                const res = await resetFn({ employeeCode: empCode });
                if (res && res.status === "PASSWORD_RESET") {
                  const safeCode = escapeHtml(res.employeeCode || empCode);
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
                  const reason = escapeHtml(res?.reason || res?.status || "Unknown credential failure");
                  if (feedbackDiv) {
                    feedbackDiv.innerHTML = `<div class="hrcc-warning-box">\u274C \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E23\u0E35\u0E40\u0E0B\u0E47\u0E15\u0E23\u0E2B\u0E31\u0E2A\u0E1C\u0E48\u0E32\u0E19 MBO \u0E44\u0E14\u0E49: ${reason}</div>`;
                  }
                }
              } catch (err) {
                const errMsg = escapeHtml(err.message || "Technical error occurred");
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
        headerSpace.innerHTML = `<div class="hrcc-container" style="color:red;">\u274C Error loading HR Control Center: ${escapeHtml(err.message)}</div>`;
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
