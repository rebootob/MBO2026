/**
 * MBO Trusted Employee-Self Data Gateway (D1-C3B)
 *
 * Security Boundary Notice:
 * - Server-only execution. NEVER expose to client/browser.
 * - Employee_Code is derived EXCLUSIVELY from trusted authenticated session (session.employeeCode).
 * - Caller-supplied employeeCode parameter is strictly prohibited for authorization.
 * - Enforces recordId + Employee_Code compound scoping on all record queries.
 * - Fails closed on missing/invalid/force-change sessions and identity ambiguities.
 * - Sanitizes output: never returns Password_Hash, Activation_Code_Hash, Session_Token_Hash.
 */

export class MboEmployeeSelfGateway {
  constructor(options = {}) {
    this.authService = options.authService || null;
    this.transport = options.transport || null;
    this.app53Id = options.app53Id || 53;
    this.app794Id = options.app794Id || 794;
    this.baseUrl = options.baseUrl || '';
    this.headers = options.headers || {};
  }

  /**
   * Internal helper to execute Kintone HTTP GET requests through transport or fetch.
   */
  async _get(path) {
    if (this.transport && typeof this.transport.get === 'function') {
      return await this.transport.get(path);
    }

    if (!this.baseUrl) {
      throw new Error('KINTONE_TRANSPORT_ERROR: Transport or baseUrl is required.');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: { ...this.headers }
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      throw new Error('KINTONE_TRANSPORT_ERROR: Unparseable Kintone JSON response.');
    }

    if (!response.ok) {
      throw new Error(`KINTONE_TRANSPORT_ERROR: HTTP ${response.status} ${payload?.code || ''}`.trim());
    }

    return payload;
  }

  /**
   * Resolves and verifies trusted session principal. Fails closed if session is invalid or expired.
   */
  async _resolvePrincipal(sessionToken, now) {
    if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.trim() === '') {
      return { status: 'UNAUTHORIZED', reason: 'Session token is required.' };
    }

    if (!this.authService || typeof this.authService.getAuthenticatedPrincipal !== 'function') {
      throw new Error('GATEWAY_INCOMPLETE: authService must provide getAuthenticatedPrincipal().');
    }

    const principal = await this.authService.getAuthenticatedPrincipal(sessionToken, now);
    if (!principal || typeof principal !== 'object' || !principal.employeeCode) {
      return { status: 'UNAUTHORIZED', reason: 'Session is invalid, expired, or unauthorized.' };
    }

    if (principal.isTechnicalAdmin === true) {
      return { status: 'UNAUTHORIZED_PRINCIPAL', reason: 'Technical admin cannot perform employee-self operations.' };
    }

    return { status: 'AUTHORIZED', principal, employeeCode: String(principal.employeeCode).trim() };
  }

  /**
   * Sanitizes record objects to strip sensitive hashes and server fields.
   */
  _sanitizeRecord(rec) {
    if (!rec || typeof rec !== 'object') return null;
    const clean = { ...rec };
    delete clean.Password_Hash;
    delete clean.Activation_Code_Hash;
    delete clean.Session_Token_Hash;
    delete clean.TOTP_Secret_Encrypted;
    delete clean.Recovery_Codes_Hashed;
    return clean;
  }

  /**
   * Bootstraps employee-self workspace: reads App 53 identity facts and App 794 current MBO record.
   * Scoped strictly to session.employeeCode.
   */
  async getEmployeeSelfBootstrap({ sessionToken, fiscalYear, now = new Date() }) {
    const authRes = await this._resolvePrincipal(sessionToken, now);
    if (authRes.status !== 'AUTHORIZED') {
      return authRes;
    }

    const employeeCode = authRes.employeeCode;

    // 1. Query App 53 Employee Master by exact Employee_Code scope
    const app53Query = encodeURIComponent(`emp_text = "${employeeCode}" or Employee_Code = "${employeeCode}" order by $id asc limit 2`);
    const app53Path = `/k/v1/records.json?app=${this.app53Id}&query=${app53Query}`;
    const app53Data = await this._get(app53Path);
    const app53Records = app53Data?.records || [];

    if (app53Records.length === 0) {
      return {
        status: 'EMPLOYEE_IDENTITY_NOT_FOUND',
        reason: `No active Employee Master record found for '${employeeCode}'.`
      };
    }

    if (app53Records.length > 1) {
      return {
        status: 'DUPLICATE_EMPLOYEE_IDENTITY',
        reason: `Ambiguous Employee Master records found for '${employeeCode}'.`
      };
    }

    const employeeInfo = this._sanitizeRecord(app53Records[0]);

    // 2. Query App 794 MBO Main Evaluation by exact Employee_Code scope
    let app794QueryStr = `Employee_Code = "${employeeCode}"`;
    if (fiscalYear && typeof fiscalYear === 'string' && fiscalYear.trim() !== '') {
      app794QueryStr += ` and Fiscal_Year = "${fiscalYear.trim()}"`;
    }
    app794QueryStr += ' order by $id desc limit 1';

    const app794Query = encodeURIComponent(app794QueryStr);
    const app794Path = `/k/v1/records.json?app=${this.app794Id}&query=${app794Query}`;
    const app794Data = await this._get(app794Path);
    const app794Records = app794Data?.records || [];

    const currentMboRecord = app794Records.length > 0 ? this._sanitizeRecord(app794Records[0]) : null;

    return {
      status: 'SUCCESS',
      employeeCode,
      employeeInfo,
      currentMboRecord
    };
  }

  /**
   * Lists all past MBO evaluation records for the logged-in employee.
   * Scoped strictly to session.employeeCode.
   */
  async listOwnMboHistory({ sessionToken, now = new Date() }) {
    const authRes = await this._resolvePrincipal(sessionToken, now);
    if (authRes.status !== 'AUTHORIZED') {
      return authRes;
    }

    const employeeCode = authRes.employeeCode;
    const query = encodeURIComponent(`Employee_Code = "${employeeCode}" order by Fiscal_Year desc limit 100`);
    const path = `/k/v1/records.json?app=${this.app794Id}&query=${query}`;

    const data = await this._get(path);
    const records = data?.records || [];

    return {
      status: 'SUCCESS',
      employeeCode,
      records: records.map(r => this._sanitizeRecord(r))
    };
  }

  /**
   * Fetches a single MBO evaluation record by recordId.
   * Enforces compound filter ($id = recordId AND Employee_Code = session.employeeCode).
   */
  async getOwnMboRecord({ sessionToken, recordId, now = new Date() }) {
    const authRes = await this._resolvePrincipal(sessionToken, now);
    if (authRes.status !== 'AUTHORIZED') {
      return authRes;
    }

    if (!recordId || (typeof recordId !== 'string' && typeof recordId !== 'number')) {
      return { status: 'INVALID_ARGUMENT', reason: 'recordId is required.' };
    }

    const cleanRecordId = String(recordId).trim();
    const employeeCode = authRes.employeeCode;

    // Enforce compound filter: $id = recordId AND Employee_Code = session.employeeCode
    const query = encodeURIComponent(`$id = "${cleanRecordId}" and Employee_Code = "${employeeCode}" limit 2`);
    const path = `/k/v1/records.json?app=${this.app794Id}&query=${query}`;

    const data = await this._get(path);
    const records = data?.records || [];

    if (records.length === 0) {
      return {
        status: 'RECORD_NOT_FOUND',
        reason: `MBO record '${cleanRecordId}' not found for employee '${employeeCode}' or access denied.`
      };
    }

    return {
      status: 'SUCCESS',
      employeeCode,
      record: this._sanitizeRecord(records[0])
    };
  }
}
