/**
 * MBO Trusted Employee-Self Data Gateway (D1-C3B Final Corrective)
 *
 * Security Boundary Notice:
 * - Server-only execution. NEVER expose to client/browser.
 * - Employee_Code is derived EXCLUSIVELY from trusted authenticated session (session.employeeCode).
 * - Caller-supplied employeeCode parameter is strictly prohibited for authorization.
 * - Enforces recordId + Employee_Code compound scoping on all record queries.
 * - Fails closed on missing/invalid/force-change sessions and identity ambiguities.
 * - B1: fiscalYear validated against ^FY\d{4}$ before any Kintone call.
 * - B1: recordId validated against ^\d+$ (positive integer) before any Kintone call.
 * - B2: App53 identity resolved via EmployeeService.lookupEmployee canonical contract.
 * - B3: App794 records are filtered through CONFIDENTIAL_FIELDS before return.
 * - B3: App794 records are verified that Employee_Code.value matches session employee.
 */

import { EmployeeService } from './employee-service.js';
import { CONFIDENTIAL_FIELDS } from '../config/constants.js';

/** Canonical fiscal year pattern: FY followed by exactly 4 digits. */
const FISCAL_YEAR_RE = /^FY\d{4}$/i;
/** Canonical record ID: only digits (positive integer string). */
const RECORD_ID_RE = /^\d+$/;

/** All sensitive auth/session field codes to strip from any returned record. */
const AUTH_SECRET_FIELDS = [
  'Password_Hash',
  'Activation_Code_Hash',
  'Session_Token_Hash',
  'TOTP_Secret_Encrypted',
  'Recovery_Codes_Hashed'
];

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
   * Resolves and verifies trusted session principal.
   * Fails closed if session is invalid, expired, or belongs to technical admin.
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
   * B1: Validates and normalizes fiscalYear — must match ^FY\d{4}$ (case-insensitive).
   * Returns validated uppercase fiscal year or null/error.
   */
  _validateFiscalYear(fiscalYear) {
    if (fiscalYear === undefined || fiscalYear === null || fiscalYear === '') {
      return { valid: true, value: null }; // Optional — no filter applied
    }
    if (typeof fiscalYear !== 'string') {
      return { valid: false, error: 'INVALID_ARGUMENT', reason: 'fiscalYear must be a string.' };
    }
    const trimmed = fiscalYear.trim().toUpperCase();
    if (!FISCAL_YEAR_RE.test(trimmed)) {
      return { valid: false, error: 'INVALID_ARGUMENT', reason: `fiscalYear '${fiscalYear}' is invalid. Expected format: FY followed by 4 digits (e.g. FY2026).` };
    }
    return { valid: true, value: trimmed };
  }

  /**
   * B1: Validates and normalizes recordId — must be a positive integer string (^\d+$).
   * Returns validated string or error.
   */
  _validateRecordId(recordId) {
    if (!recordId && recordId !== 0) {
      return { valid: false, error: 'INVALID_ARGUMENT', reason: 'recordId is required.' };
    }
    const str = String(recordId).trim();
    if (!RECORD_ID_RE.test(str) || str === '0') {
      return { valid: false, error: 'INVALID_ARGUMENT', reason: `recordId '${recordId}' is invalid. Expected a positive integer.` };
    }
    return { valid: true, value: str };
  }

  /**
   * B3: Sanitizes an App794 record:
   *   - Strips all CONFIDENTIAL_FIELDS and auth secret fields.
   *   - Verifies Employee_Code.value matches trusted session employeeCode.
   *   - Returns null if mismatch detected (fail closed).
   */
  _sanitizeApp794Record(rec, trustedEmployeeCode) {
    if (!rec || typeof rec !== 'object') return null;

    // B3: Verify Employee_Code.value matches trusted session employee
    const recEmpCode = rec.Employee_Code?.value;
    if (typeof recEmpCode === 'string' && recEmpCode.trim() !== trustedEmployeeCode) {
      return null; // Fail closed — mismatched Employee_Code in returned record
    }

    const clean = { ...rec };

    // Strip auth/session secrets
    for (const field of AUTH_SECRET_FIELDS) {
      delete clean[field];
    }

    // B3: Strip all CONFIDENTIAL_FIELDS (Manager/GM scores, comments, weighted/final scores)
    for (const field of CONFIDENTIAL_FIELDS) {
      delete clean[field];
    }

    return clean;
  }

  /**
   * Bootstraps employee-self workspace: reads App 53 identity facts and App 794 current MBO record.
   * Scoped strictly to session.employeeCode.
   * B1: fiscalYear validated before any Kintone call.
   * B2: App53 resolved via EmployeeService canonical contract.
   * B3: App794 records filtered through CONFIDENTIAL_FIELDS.
   */
  async getEmployeeSelfBootstrap({ sessionToken, fiscalYear, now = new Date() }) {
    const authRes = await this._resolvePrincipal(sessionToken, now);
    if (authRes.status !== 'AUTHORIZED') {
      return authRes;
    }

    const employeeCode = authRes.employeeCode;

    // B1: Validate fiscalYear before any Kintone call
    const fyValidation = this._validateFiscalYear(fiscalYear);
    if (!fyValidation.valid) {
      return { status: fyValidation.error, reason: fyValidation.reason };
    }
    const validatedFiscalYear = fyValidation.value;

    // B2: Query App 53 Employee Master using canonical EmployeeService.lookupEmployee
    // Build Kintone API adapter from internal transport
    const kintoneApiAdapter = {
      getRecords: async (appId, query) => {
        const path = `/k/v1/records.json?app=${appId}&query=${encodeURIComponent(query)}`;
        return await this._get(path);
      }
    };

    let employeeInfo;
    try {
      const lookupResult = await EmployeeService.lookupEmployee(employeeCode, kintoneApiAdapter);
      employeeInfo = lookupResult.employee;
    } catch (err) {
      const code = err.code || 'EMPLOYEE_LOOKUP_FAILED';
      if (code === 'EMPLOYEE_NOT_FOUND') {
        return { status: 'EMPLOYEE_IDENTITY_NOT_FOUND', reason: err.userMessageEN || err.message };
      }
      if (code === 'EMPLOYEE_SOURCE_AMBIGUOUS') {
        return { status: 'DUPLICATE_EMPLOYEE_IDENTITY', reason: err.userMessageEN || err.message };
      }
      return { status: 'EMPLOYEE_LOOKUP_FAILED', reason: err.userMessageEN || err.message };
    }

    // Query App 794 MBO Main Evaluation by exact Employee_Code scope + validated fiscalYear
    let app794QueryStr = `Employee_Code = "${employeeCode}"`;
    if (validatedFiscalYear) {
      app794QueryStr += ` and Fiscal_Year = "${validatedFiscalYear}"`;
    }
    app794QueryStr += ' order by $id desc limit 1';

    const app794Path = `/k/v1/records.json?app=${this.app794Id}&query=${encodeURIComponent(app794QueryStr)}`;
    const app794Data = await this._get(app794Path);
    const app794Records = app794Data?.records || [];

    let currentMboRecord = null;
    if (app794Records.length > 0) {
      currentMboRecord = this._sanitizeApp794Record(app794Records[0], employeeCode);
      if (currentMboRecord === null) {
        return {
          status: 'EMPLOYEE_CODE_MISMATCH_IN_RECORD',
          reason: 'App794 returned a record with mismatched Employee_Code for this session.'
        };
      }
    }

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
   * B3: CONFIDENTIAL_FIELDS stripped; Employee_Code mismatch fails closed.
   */
  async listOwnMboHistory({ sessionToken, now = new Date() }) {
    const authRes = await this._resolvePrincipal(sessionToken, now);
    if (authRes.status !== 'AUTHORIZED') {
      return authRes;
    }

    const employeeCode = authRes.employeeCode;
    const query = `Employee_Code = "${employeeCode}" order by Fiscal_Year desc limit 100`;
    const path = `/k/v1/records.json?app=${this.app794Id}&query=${encodeURIComponent(query)}`;

    const data = await this._get(path);
    const records = data?.records || [];

    const sanitized = [];
    for (const r of records) {
      const cleaned = this._sanitizeApp794Record(r, employeeCode);
      if (cleaned === null) {
        return {
          status: 'EMPLOYEE_CODE_MISMATCH_IN_RECORD',
          reason: 'App794 returned a record with mismatched Employee_Code for this session.'
        };
      }
      sanitized.push(cleaned);
    }

    return {
      status: 'SUCCESS',
      employeeCode,
      records: sanitized
    };
  }

  /**
   * Fetches a single MBO evaluation record by recordId.
   * Enforces compound filter ($id = recordId AND Employee_Code = session.employeeCode).
   * B1: recordId validated before any Kintone call.
   * B3: CONFIDENTIAL_FIELDS stripped; Employee_Code mismatch fails closed.
   */
  async getOwnMboRecord({ sessionToken, recordId, now = new Date() }) {
    const authRes = await this._resolvePrincipal(sessionToken, now);
    if (authRes.status !== 'AUTHORIZED') {
      return authRes;
    }

    // B1: Validate recordId before any Kintone call
    const idValidation = this._validateRecordId(recordId);
    if (!idValidation.valid) {
      return { status: idValidation.error, reason: idValidation.reason };
    }
    const cleanRecordId = idValidation.value;
    const employeeCode = authRes.employeeCode;

    // Enforce compound filter: $id = recordId AND Employee_Code = session.employeeCode
    const query = `$id = "${cleanRecordId}" and Employee_Code = "${employeeCode}" limit 2`;
    const path = `/k/v1/records.json?app=${this.app794Id}&query=${encodeURIComponent(query)}`;

    const data = await this._get(path);
    const records = data?.records || [];

    if (records.length === 0) {
      return {
        status: 'RECORD_NOT_FOUND',
        reason: `MBO record '${cleanRecordId}' not found for employee '${employeeCode}' or access denied.`
      };
    }

    const sanitizedRecord = this._sanitizeApp794Record(records[0], employeeCode);
    if (sanitizedRecord === null) {
      return {
        status: 'EMPLOYEE_CODE_MISMATCH_IN_RECORD',
        reason: 'App794 returned a record with mismatched Employee_Code for this session.'
      };
    }

    return {
      status: 'SUCCESS',
      employeeCode,
      record: sanitizedRecord
    };
  }
}
