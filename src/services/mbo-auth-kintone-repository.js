/**
 * MBO App801 Credential Repository Adapter (D1-C1)
 *
 * Server-only adapter implementing credentialStore contract for MboAuthSessionService:
 * - getCredential(employeeCode)
 * - updateCredential(employeeCode, patch)
 *
 * Security Boundary:
 * - Server-only execution. NEVER expose to client/browser.
 * - Password_Hash is kept strictly within server boundary.
 * - Enforces strict field mutation allowlist.
 */

export const ALLOWED_CREDENTIAL_UPDATE_FIELDS = Object.freeze([
  'Password_Hash',
  'Must_Change_Password',
  'Password_Changed_At',
  'Password_Expires_At',
  'Failed_Login_Count',
  'Locked_Until',
  'Account_Status',
  'Last_Login_At'
]);

export class MboKintoneAuthRepository {
  constructor(options = {}) {
    this.appId = options.appId || 801;
    this.transport = options.transport || null;
    this.baseUrl = options.baseUrl || '';
    this.headers = options.headers || {};
  }

  /**
   * Internal helper to execute Kintone HTTP GET requests.
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
   * Internal helper to execute Kintone HTTP PUT requests.
   */
  async _put(path, body) {
    if (this.transport && typeof this.transport.put === 'function') {
      return await this.transport.put(path, body);
    }

    if (!this.baseUrl) {
      throw new Error('KINTONE_TRANSPORT_ERROR: Transport or baseUrl is required.');
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
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
   * Loads a sanitized credential domain object by Employee_Code.
   */
  async getCredential(employeeCode) {
    if (!employeeCode || typeof employeeCode !== 'string' || employeeCode.trim() === '') {
      throw new Error('INVALID_ARGUMENT: employeeCode must be a non-empty string.');
    }

    const cleanCode = employeeCode.trim();
    const query = encodeURIComponent(`Employee_Code = "${cleanCode}" order by $id asc limit 2`);
    const path = `/k/v1/records.json?app=${this.appId}&query=${query}`;

    const data = await this._get(path);
    const records = data?.records || [];

    if (records.length === 0) {
      return null;
    }

    if (records.length > 1) {
      throw new Error(`DUPLICATE_IDENTITY_RECORD: Found ${records.length} credential records for Employee_Code '${cleanCode}'.`);
    }

    const record = records[0];
    const recEmpCode = String(record.Employee_Code?.value || '').trim();

    if (!recEmpCode || recEmpCode !== cleanCode) {
      throw new Error(`CREDENTIAL_MISMATCH: Returned Employee_Code '${recEmpCode}' does not match requested '${cleanCode}'.`);
    }

    if (!record.Password_Hash?.value || typeof record.Password_Hash.value !== 'string' || record.Password_Hash.value.trim() === '') {
      throw new Error(`MALFORMED_CREDENTIAL_RECORD: Record ID ${record.$id?.value || 'unknown'} is missing Password_Hash.`);
    }

    // Account_Status: Must be explicit known value ('ACTIVE', 'DISABLED', 'LOCKED')
    const accountStatus = record.Account_Status?.value;
    if (!accountStatus || typeof accountStatus !== 'string' || !['ACTIVE', 'DISABLED', 'LOCKED'].includes(accountStatus.trim())) {
      throw new Error(`MALFORMED_CREDENTIAL_RECORD: Account_Status '${accountStatus}' is missing or invalid.`);
    }

    // Force_Password_Change: Must be explicit known value ('YES', 'NO', 'TRUE', 'FALSE')
    const forceChangeValue = record.Force_Password_Change?.value;
    let mustChangePassword;
    if (forceChangeValue === 'YES' || forceChangeValue === 'TRUE') {
      mustChangePassword = true;
    } else if (forceChangeValue === 'NO' || forceChangeValue === 'FALSE') {
      mustChangePassword = false;
    } else {
      throw new Error(`MALFORMED_CREDENTIAL_RECORD: Force_Password_Change '${forceChangeValue}' is missing or invalid.`);
    }

    // Failed_Attempts: Must be present and parse to non-negative integer
    const rawFailed = record.Failed_Attempts?.value ?? record.Failed_Login_Count?.value;
    if (rawFailed === undefined || rawFailed === null || rawFailed === '') {
      throw new Error('MALFORMED_CREDENTIAL_RECORD: Failed_Attempts is missing.');
    }
    const failedAttempts = Number(rawFailed);
    if (!Number.isInteger(failedAttempts) || failedAttempts < 0) {
      throw new Error(`MALFORMED_CREDENTIAL_RECORD: Failed_Attempts '${rawFailed}' is not a valid non-negative integer.`);
    }

    return {
      Employee_Code: recEmpCode,
      Password_Hash: String(record.Password_Hash.value),
      Password_Algorithm: record.Password_Algorithm?.value ? String(record.Password_Algorithm.value) : 'PBKDF2-SHA256',
      Must_Change_Password: mustChangePassword,
      Password_Changed_At: record.Password_Changed_At?.value || null,
      Password_Expires_At: record.Password_Expires_At?.value || null,
      Failed_Login_Count: failedAttempts,
      Locked_Until: record.Locked_Until?.value || null,
      Account_Status: accountStatus.trim()
    };
  }

  /**
   * Updates an existing App801 credential record for an Employee_Code.
   * Enforces strict allowlist of mutable fields.
   */
  async updateCredential(employeeCode, patch) {
    if (!employeeCode || typeof employeeCode !== 'string' || employeeCode.trim() === '') {
      throw new Error('INVALID_ARGUMENT: employeeCode must be a non-empty string.');
    }
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
      throw new Error('INVALID_ARGUMENT: patch must be a non-empty object.');
    }

    const patchKeys = Object.keys(patch);
    if (patchKeys.length === 0) {
      throw new Error('INVALID_ARGUMENT: patch object must contain at least one field to update.');
    }

    for (const key of patchKeys) {
      if (!ALLOWED_CREDENTIAL_UPDATE_FIELDS.includes(key)) {
        throw new Error(`UNAUTHORIZED_CREDENTIAL_MUTATION: Field '${key}' is not in the allowed update list.`);
      }
    }

    // Lookup record first to obtain $id or verify single record
    const cleanCode = employeeCode.trim();
    const query = encodeURIComponent(`Employee_Code = "${cleanCode}" order by $id asc limit 2`);
    const searchPath = `/k/v1/records.json?app=${this.appId}&query=${query}`;
    const searchData = await this._get(searchPath);
    const records = searchData?.records || [];

    if (records.length === 0) {
      throw new Error(`CREDENTIAL_NOT_FOUND: Cannot update non-existent credential record for Employee_Code '${cleanCode}'.`);
    }
    if (records.length > 1) {
      throw new Error(`DUPLICATE_IDENTITY_RECORD: Found ${records.length} credential records for Employee_Code '${cleanCode}'.`);
    }

    const recordId = records[0].$id?.value;
    if (!recordId) {
      throw new Error(`MALFORMED_CREDENTIAL_RECORD: Record for Employee_Code '${cleanCode}' is missing $id.`);
    }

    // Transform patch into Kintone field update format
    const updateRecordPayload = {};

    if ('Password_Hash' in patch) {
      updateRecordPayload.Password_Hash = { value: String(patch.Password_Hash || '') };
    }
    if ('Must_Change_Password' in patch) {
      updateRecordPayload.Force_Password_Change = { value: patch.Must_Change_Password ? 'YES' : 'NO' };
    }
    if ('Password_Changed_At' in patch) {
      updateRecordPayload.Password_Changed_At = { value: patch.Password_Changed_At || null };
    }
    if ('Password_Expires_At' in patch) {
      updateRecordPayload.Password_Expires_At = { value: patch.Password_Expires_At || null };
    }
    if ('Failed_Login_Count' in patch) {
      updateRecordPayload.Failed_Attempts = { value: Number(patch.Failed_Login_Count || 0) };
    }
    if ('Locked_Until' in patch) {
      updateRecordPayload.Locked_Until = { value: patch.Locked_Until || null };
    }
    if ('Account_Status' in patch) {
      updateRecordPayload.Account_Status = { value: String(patch.Account_Status || 'ACTIVE') };
    }
    if ('Last_Login_At' in patch) {
      updateRecordPayload.Last_Login_At = { value: patch.Last_Login_At || null };
    }

    const updatePath = '/k/v1/record.json';
    const body = {
      app: this.appId,
      id: Number(recordId),
      record: updateRecordPayload
    };

    const result = await this._put(updatePath, body);
    return {
      success: true,
      employeeCode: cleanCode,
      recordId: Number(recordId),
      revision: result?.revision ? String(result.revision) : null
    };
  }
}
