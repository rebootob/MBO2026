/**
 * App801 Credential Repository Adapter for Auth Bridge
 * Strict READ and UPDATE existing records ONLY.
 * Enforces fail-closed record parsing, canonical Employee_Code validation, and exact App801 session fields.
 * NO record creation or deletion capabilities exist in this module.
 */

export function validateEmployeeCode(code) {
  if (typeof code !== 'string') {
    throw new Error('INVALID_EMPLOYEE_CODE: Employee_Code must be a string.');
  }
  if (code !== code.trim()) {
    throw new Error('INVALID_EMPLOYEE_CODE: Employee_Code cannot contain leading or trailing whitespace.');
  }
  if (!code || !/^[A-Za-z0-9_.-]+$/.test(code)) {
    throw new Error('INVALID_EMPLOYEE_CODE: Employee_Code contains invalid characters.');
  }
  return code;
}

export class App801Repository {
  constructor(options = {}) {
    this.appId = options.appId || 801;
    this.transport = options.transport || null;
  }

  _parseCredentialRecord(rec) {
    if (!rec || typeof rec !== 'object') {
      throw new Error('MALFORMED_CREDENTIAL_RECORD: Invalid record format.');
    }

    const recordId = Number(rec.$id?.value);
    if (!Number.isInteger(recordId) || recordId <= 0) {
      throw new Error('MALFORMED_CREDENTIAL_RECORD: Missing or invalid record $id.');
    }

    const recEmpCode = rec.Employee_Code?.value;
    if (!recEmpCode || typeof recEmpCode !== 'string' || recEmpCode !== recEmpCode.trim() || !/^[A-Za-z0-9_.-]+$/.test(recEmpCode)) {
      throw new Error('MALFORMED_CREDENTIAL_RECORD: Missing or invalid Employee_Code field.');
    }

    if (!rec.Password_Hash?.value || typeof rec.Password_Hash.value !== 'string' || rec.Password_Hash.value.trim() === '') {
      throw new Error('MALFORMED_CREDENTIAL_RECORD: Missing Password_Hash.');
    }

    // Account_Status: Must be explicit known value ('ACTIVE', 'DISABLED', 'LOCKED')
    const accountStatus = rec.Account_Status?.value;
    if (!accountStatus || typeof accountStatus !== 'string' || !['ACTIVE', 'DISABLED', 'LOCKED'].includes(accountStatus.trim())) {
      throw new Error(`MALFORMED_CREDENTIAL_RECORD: Account_Status '${accountStatus}' is missing or invalid.`);
    }

    // Force_Password_Change / Must_Change_Password
    const forceVal = rec.Force_Password_Change?.value ?? rec.Must_Change_Password?.value;
    let mustChangePassword;
    if (forceVal === 'YES' || forceVal === 'TRUE') {
      mustChangePassword = true;
    } else if (forceVal === 'NO' || forceVal === 'FALSE') {
      mustChangePassword = false;
    } else {
      throw new Error(`MALFORMED_CREDENTIAL_RECORD: Force_Password_Change '${forceVal}' is missing or invalid.`);
    }

    // Failed_Attempts
    const rawFailed = rec.Failed_Attempts?.value ?? rec.Failed_Login_Count?.value;
    if (rawFailed === undefined || rawFailed === null || rawFailed === '') {
      throw new Error('MALFORMED_CREDENTIAL_RECORD: Failed_Attempts is missing.');
    }
    const failedAttempts = Number(rawFailed);
    if (!Number.isInteger(failedAttempts) || failedAttempts < 0) {
      throw new Error(`MALFORMED_CREDENTIAL_RECORD: Failed_Attempts '${rawFailed}' is not a valid non-negative integer.`);
    }

    // Credential_Version
    const rawCredVer = rec.Credential_Version?.value;
    if (rawCredVer === undefined || rawCredVer === null || rawCredVer === '') {
      throw new Error('MALFORMED_CREDENTIAL_RECORD: Credential_Version is missing.');
    }
    const credentialVersion = Number(rawCredVer);
    if (!Number.isInteger(credentialVersion) || credentialVersion < 1) {
      throw new Error(`MALFORMED_CREDENTIAL_RECORD: Credential_Version '${rawCredVer}' is not a valid positive integer.`);
    }

    // Session_Credential_Version (optional, but if present must be integer >= 1)
    const rawSessCredVer = rec.Session_Credential_Version?.value;
    let sessionCredentialVersion = null;
    if (rawSessCredVer !== undefined && rawSessCredVer !== null && rawSessCredVer !== '') {
      sessionCredentialVersion = Number(rawSessCredVer);
      if (!Number.isInteger(sessionCredentialVersion) || sessionCredentialVersion < 1) {
        throw new Error(`MALFORMED_CREDENTIAL_RECORD: Session_Credential_Version '${rawSessCredVer}' is invalid.`);
      }
    }

    return {
      recordId,
      Employee_Code: recEmpCode,
      Password_Hash: String(rec.Password_Hash.value),
      Must_Change_Password: mustChangePassword,
      Failed_Login_Count: failedAttempts,
      Locked_Until: rec.Locked_Until?.value || null,
      Account_Status: accountStatus.trim(),
      Last_Login_At: rec.Last_Login_At?.value || null,
      Credential_Version: credentialVersion,
      Session_Token_Hash: rec.Session_Token_Hash?.value || null,
      Session_Issued_At: rec.Session_Issued_At?.value || null,
      Session_Expires_At: rec.Session_Expires_At?.value || null,
      Session_Credential_Version: sessionCredentialVersion,
      Session_Kintone_User: rec.Session_Kintone_User?.value || null
    };
  }

  /**
   * Reads a single credential record by Employee_Code.
   */
  async getCredential(employeeCode) {
    const cleanCode = validateEmployeeCode(employeeCode);

    if (!this.transport || typeof this.transport.getRecords !== 'function') {
      throw new Error('REPOSITORY_TRANSPORT_ERROR: Transport must provide getRecords.');
    }

    const query = `Employee_Code = "${cleanCode}" order by $id asc limit 2`;
    const res = await this.transport.getRecords(this.appId, query);
    const records = res?.records || [];

    if (records.length === 0) {
      return null;
    }
    if (records.length > 1) {
      throw new Error(`DUPLICATE_IDENTITY_RECORD: Found ${records.length} credential records for Employee_Code '${cleanCode}'.`);
    }

    return this._parseCredentialRecord(records[0]);
  }

  /**
   * Resolves a single credential record by exact Session_Token_Hash server-side.
   */
  async getCredentialBySessionTokenHash(tokenHash) {
    if (!tokenHash || typeof tokenHash !== 'string' || !/^[0-9a-fA-F]{64}$/.test(tokenHash)) {
      throw new Error('INVALID_TOKEN_HASH: tokenHash must be a 64-character hex string.');
    }

    if (!this.transport || typeof this.transport.getRecords !== 'function') {
      throw new Error('REPOSITORY_TRANSPORT_ERROR: Transport must provide getRecords.');
    }

    const query = `Session_Token_Hash = "${tokenHash}" order by $id asc limit 2`;
    const res = await this.transport.getRecords(this.appId, query);
    const records = res?.records || [];

    if (records.length === 0) {
      return null;
    }
    if (records.length > 1) {
      throw new Error(`DUPLICATE_SESSION_TOKEN_RECORD: Found ${records.length} records matching Session_Token_Hash.`);
    }

    return this._parseCredentialRecord(records[0]);
  }

  /**
   * Updates an existing App801 credential record for an Employee_Code.
   */
  async updateCredential(employeeCode, patch) {
    const cleanCode = validateEmployeeCode(employeeCode);
    if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
      throw new Error('INVALID_ARGUMENT: patch must be a non-empty object.');
    }

    const existing = await this.getCredential(cleanCode);
    if (!existing) {
      throw new Error(`CREDENTIAL_NOT_FOUND: Record for Employee_Code '${cleanCode}' does not exist.`);
    }

    if (!this.transport || typeof this.transport.updateRecord !== 'function') {
      throw new Error('REPOSITORY_TRANSPORT_ERROR: Transport must provide updateRecord.');
    }

    const updateFields = {};
    if ('Password_Hash' in patch) {
      updateFields.Password_Hash = { value: String(patch.Password_Hash) };
    }
    if ('Must_Change_Password' in patch) {
      updateFields.Force_Password_Change = { value: patch.Must_Change_Password ? 'YES' : 'NO' };
    }
    if ('Failed_Login_Count' in patch) {
      updateFields.Failed_Attempts = { value: Number(patch.Failed_Login_Count) };
    }
    if ('Locked_Until' in patch) {
      updateFields.Locked_Until = { value: patch.Locked_Until || null };
    }
    if ('Account_Status' in patch) {
      updateFields.Account_Status = { value: String(patch.Account_Status) };
    }
    if ('Last_Login_At' in patch) {
      updateFields.Last_Login_At = { value: patch.Last_Login_At || null };
    }
    if ('Credential_Version' in patch) {
      updateFields.Credential_Version = { value: Number(patch.Credential_Version) };
    }
    if ('Session_Token_Hash' in patch) {
      updateFields.Session_Token_Hash = { value: patch.Session_Token_Hash || null };
    }
    if ('Session_Issued_At' in patch) {
      updateFields.Session_Issued_At = { value: patch.Session_Issued_At || null };
    }
    if ('Session_Expires_At' in patch) {
      updateFields.Session_Expires_At = { value: patch.Session_Expires_At || null };
    }
    if ('Session_Credential_Version' in patch) {
      updateFields.Session_Credential_Version = { value: patch.Session_Credential_Version ? Number(patch.Session_Credential_Version) : null };
    }
    if ('Session_Kintone_User' in patch) {
      updateFields.Session_Kintone_User = { value: patch.Session_Kintone_User || null };
    }

    await this.transport.updateRecord(this.appId, existing.recordId, updateFields);
    return { success: true, employeeCode: cleanCode, recordId: existing.recordId };
  }

  // Explicitly block record creation capability
  createRecord() {
    throw new Error('UNAUTHORIZED_OPERATION: App801Repository has NO record creation capability.');
  }

  // Explicitly block record deletion capability
  deleteRecord() {
    throw new Error('UNAUTHORIZED_OPERATION: App801Repository has NO record deletion capability.');
  }
}
