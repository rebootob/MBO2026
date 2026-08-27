/**
 * MBO App801 Credential & Single-Active-Session Repository Adapter (D1-C1 / D1-C3A)
 *
 * Server-only adapter implementing:
 * - credentialStore contract for MboAuthSessionService:
 *   - getCredential(employeeCode)
 *   - updateCredential(employeeCode, patch)
 * - activationStore contract for MboAuthSessionService:
 *   - getActivation(employeeCode)
 *   - consumeActivation(employeeCode, usedAt)
 * - sessionStore contract for MboAuthSessionService:
 *   - getSession(tokenHash)
 *   - setSession(tokenHash, sessionObj)
 *   - deleteSession(tokenHash)
 *
 * Security Boundary:
 * - Server-only execution. NEVER expose to client/browser.
 * - Password_Hash and session hashes are kept strictly within server boundary.
 * - Enforces strict field mutation allowlist.
 * - Token hash only; raw tokens are never persisted.
 */

export const ALLOWED_CREDENTIAL_UPDATE_FIELDS = Object.freeze([
  'Password_Hash',
  'Must_Change_Password',
  'Password_Changed_At',
  'Password_Expires_At',
  'Failed_Login_Count',
  'Locked_Until',
  'Account_Status',
  'Last_Login_At',
  'Activation_Code_Hash',
  'Activation_Expires_At',
  'Activation_Used_At',
  'Session_Token_Hash',
  'Session_Expires_At',
  'Session_Requires_Password_Change',
  'Session_Data_Authorized',
  'Session_Kintone_User_Code'
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
      Account_Status: accountStatus.trim(),
      Activation_Code_Hash: record.Activation_Code_Hash?.value || null,
      Activation_Expires_At: record.Activation_Expires_At?.value || null,
      Activation_Used_At: record.Activation_Used_At?.value || null,
      Session_Token_Hash: record.Session_Token_Hash?.value || null,
      Session_Expires_At: record.Session_Expires_At?.value || null,
      Session_Requires_Password_Change: record.Session_Requires_Password_Change?.value || null,
      Session_Data_Authorized: record.Session_Data_Authorized?.value || null,
      Session_Kintone_User_Code: record.Session_Kintone_User_Code?.value || null
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
    if ('Activation_Code_Hash' in patch) {
      updateRecordPayload.Activation_Code_Hash = { value: patch.Activation_Code_Hash || null };
    }
    if ('Activation_Expires_At' in patch) {
      updateRecordPayload.Activation_Expires_At = { value: patch.Activation_Expires_At || null };
    }
    if ('Activation_Used_At' in patch) {
      updateRecordPayload.Activation_Used_At = { value: patch.Activation_Used_At || null };
    }
    if ('Session_Token_Hash' in patch) {
      updateRecordPayload.Session_Token_Hash = { value: patch.Session_Token_Hash || null };
    }
    if ('Session_Expires_At' in patch) {
      updateRecordPayload.Session_Expires_At = { value: patch.Session_Expires_At || null };
    }
    if ('Session_Requires_Password_Change' in patch) {
      updateRecordPayload.Session_Requires_Password_Change = { value: patch.Session_Requires_Password_Change ? 'YES' : 'NO' };
    }
    if ('Session_Data_Authorized' in patch) {
      updateRecordPayload.Session_Data_Authorized = { value: patch.Session_Data_Authorized ? 'YES' : 'NO' };
    }
    if ('Session_Kintone_User_Code' in patch) {
      updateRecordPayload.Session_Kintone_User_Code = { value: patch.Session_Kintone_User_Code || null };
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

  // --- activationStore Contract Interface ---

  async getActivation(employeeCode) {
    const cred = await this.getCredential(employeeCode);
    if (!cred) return null;
    return {
      employeeCode: cred.Employee_Code,
      activationCodeHash: cred.Activation_Code_Hash || null,
      activationExpiresAt: cred.Activation_Expires_At || null,
      activationUsedAt: cred.Activation_Used_At || null
    };
  }

  async consumeActivation(employeeCode, usedAt = new Date().toISOString()) {
    return await this.updateCredential(employeeCode, {
      Activation_Used_At: usedAt
    });
  }

  // --- sessionStore Contract Interface (Single Active Session per Employee) ---

  async getSession(tokenHash) {
    if (!tokenHash || typeof tokenHash !== 'string' || tokenHash.trim() === '') {
      return null;
    }

    const cleanHash = tokenHash.trim();
    const query = encodeURIComponent(`Session_Token_Hash = "${cleanHash}" order by $id asc limit 2`);
    const path = `/k/v1/records.json?app=${this.appId}&query=${query}`;

    const data = await this._get(path);
    const records = data?.records || [];

    if (records.length === 0) {
      return null;
    }

    if (records.length > 1) {
      throw new Error(`DUPLICATE_SESSION_RECORD: Found ${records.length} session records for token hash.`);
    }

    const record = records[0];
    const expiresAt = record.Session_Expires_At?.value;
    if (!expiresAt || typeof expiresAt !== 'string') {
      return null;
    }

    const empCode = record.Employee_Code?.value;
    if (!empCode) {
      return null;
    }

    const reqChange = record.Session_Requires_Password_Change?.value;
    const dataAuth = record.Session_Data_Authorized?.value;

    return {
      tokenHash: cleanHash,
      employeeCode: String(empCode).trim(),
      kintoneUserCode: record.Session_Kintone_User_Code?.value || '',
      createdAt: record.Updated_datetime?.value || new Date().toISOString(),
      expiresAt: String(expiresAt),
      requiresPasswordChange: reqChange === 'YES' || reqChange === 'TRUE',
      isDataAuthorized: dataAuth === 'YES' || dataAuth === 'TRUE'
    };
  }

  async setSession(tokenHash, sessionObj) {
    if (!tokenHash || !sessionObj || !sessionObj.employeeCode) {
      throw new Error('INVALID_ARGUMENT: tokenHash and sessionObj with employeeCode are required.');
    }

    return await this.updateCredential(sessionObj.employeeCode, {
      Session_Token_Hash: tokenHash,
      Session_Expires_At: sessionObj.expiresAt,
      Session_Requires_Password_Change: sessionObj.requiresPasswordChange === true,
      Session_Data_Authorized: sessionObj.isDataAuthorized === true,
      Session_Kintone_User_Code: sessionObj.kintoneUserCode || ''
    });
  }

  async deleteSession(tokenHash) {
    if (!tokenHash || typeof tokenHash !== 'string' || tokenHash.trim() === '') {
      return false;
    }

    const sessionObj = await this.getSession(tokenHash);
    if (!sessionObj || !sessionObj.employeeCode) {
      return false;
    }

    await this.updateCredential(sessionObj.employeeCode, {
      Session_Token_Hash: null,
      Session_Expires_At: null,
      Session_Requires_Password_Change: null,
      Session_Data_Authorized: null,
      Session_Kintone_User_Code: null
    });

    return true;
  }
}
