/**
 * App801 Credential Repository Adapter for Auth Bridge
 * Strict READ and UPDATE existing records ONLY.
 * NO record creation or deletion capabilities exist in this module.
 */

export class App801Repository {
  constructor(options = {}) {
    this.appId = options.appId || 801;
    this.transport = options.transport || null;
  }

  /**
   * Reads a single credential record by Employee_Code.
   */
  async getCredential(employeeCode) {
    if (!employeeCode || typeof employeeCode !== 'string' || employeeCode.trim() === '') {
      throw new Error('INVALID_ARGUMENT: employeeCode must be a non-empty string.');
    }
    const cleanCode = employeeCode.trim();

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
      throw new Error(`DUPLICATE_IDENTITY_RECORD: Found duplicate records for Employee_Code '${cleanCode}'.`);
    }

    const rec = records[0];
    const recEmpCode = String(rec.Employee_Code?.value || '').trim();
    if (recEmpCode !== cleanCode) {
      throw new Error('CREDENTIAL_MISMATCH: Returned record does not match requested Employee_Code.');
    }

    if (!rec.Password_Hash?.value) {
      throw new Error('MALFORMED_CREDENTIAL_RECORD: Missing Password_Hash.');
    }

    const accountStatus = String(rec.Account_Status?.value || 'ACTIVE').trim();
    const forceVal = String(rec.Force_Password_Change?.value || rec.Must_Change_Password?.value || 'NO').trim();
    const mustChangePassword = forceVal === 'YES' || forceVal === 'TRUE';

    const rawFailed = rec.Failed_Attempts?.value ?? rec.Failed_Login_Count?.value ?? 0;
    const failedAttempts = Number(rawFailed);

    const credentialVersion = Number(rec.Credential_Version?.value || 1);

    return {
      recordId: Number(rec.$id?.value),
      Employee_Code: recEmpCode,
      Password_Hash: String(rec.Password_Hash.value),
      Must_Change_Password: mustChangePassword,
      Failed_Login_Count: failedAttempts,
      Locked_Until: rec.Locked_Until?.value || null,
      Account_Status: accountStatus,
      Last_Login_At: rec.Last_Login_At?.value || null,
      Session_Token_Hash: rec.Session_Token_Hash?.value || null,
      Session_Expires_At: rec.Session_Expires_At?.value || null,
      Session_Kintone_User_Code: rec.Session_Kintone_User_Code?.value || null,
      Credential_Version: Number.isInteger(credentialVersion) && credentialVersion > 0 ? credentialVersion : 1
    };
  }

  /**
   * Updates an existing App801 credential record by recordId or Employee_Code.
   */
  async updateCredential(employeeCode, patch) {
    if (!employeeCode || typeof employeeCode !== 'string' || !patch) {
      throw new Error('INVALID_ARGUMENT: employeeCode and patch are required.');
    }
    const cleanCode = employeeCode.trim();

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
    if ('Session_Token_Hash' in patch) {
      updateFields.Session_Token_Hash = { value: patch.Session_Token_Hash || null };
    }
    if ('Session_Expires_At' in patch) {
      updateFields.Session_Expires_At = { value: patch.Session_Expires_At || null };
    }
    if ('Session_Kintone_User_Code' in patch) {
      updateFields.Session_Kintone_User_Code = { value: patch.Session_Kintone_User_Code || null };
    }
    if ('Credential_Version' in patch) {
      updateFields.Credential_Version = { value: Number(patch.Credential_Version) };
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
