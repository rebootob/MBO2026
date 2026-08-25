import {
  IMMUTABLE_PAYLOAD_FIELDS,
  EXCLUDED_AUDIT_FIELDS,
  CONFIG_LIFECYCLE_STATUS
} from '../profiles/scoring-config-master.js';

export const WP002C_SCORING_MASTER_APP_ID = '796';

const ALL_STORAGE_FIELDS = [...IMMUTABLE_PAYLOAD_FIELDS, ...EXCLUDED_AUDIT_FIELDS];

export function escapeKintoneQueryLiteral(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function normalizeRawRecord(rawRecord) {
  if (!rawRecord || typeof rawRecord !== 'object' || Array.isArray(rawRecord)) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Raw record must be a plain object');
  }

  if (!rawRecord.$id || typeof rawRecord.$id !== 'object' || rawRecord.$id.value === undefined || rawRecord.$id.value === null) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Raw record missing $id wrapper');
  }
  const strId = String(rawRecord.$id.value).trim();
  if (!/^[1-9]\d*$/.test(strId)) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Raw record $id must be positive integer string');
  }

  if (!rawRecord.$revision || typeof rawRecord.$revision !== 'object' || rawRecord.$revision.value === undefined || rawRecord.$revision.value === null) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Raw record missing $revision wrapper');
  }
  const strRev = String(rawRecord.$revision.value).trim();
  if (!/^[1-9]\d*$/.test(strRev)) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Raw record $revision must be positive integer string');
  }

  const normalized = {
    __recordId: strId,
    __storageRevision: strRev
  };

  for (const field of ALL_STORAGE_FIELDS) {
    const wrapper = rawRecord[field];
    if (!wrapper || typeof wrapper !== 'object' || wrapper.value === undefined) {
      throw new Error(`REPOSITORY_RESPONSE_INVALID: Field '${field}' wrapper missing or malformed`);
    }

    if (field === 'Published_By') {
      const val = wrapper.value;
      if (!Array.isArray(val)) {
        throw new Error('REPOSITORY_RESPONSE_INVALID: Published_By value must be an array');
      }
      if (val.length === 0) {
        normalized[field] = '';
      } else if (val.length === 1) {
        const u = val[0];
        if (!u || typeof u !== 'object' || typeof u.code !== 'string' || u.code.trim() === '') {
          throw new Error('REPOSITORY_RESPONSE_INVALID: Published_By user object invalid');
        }
        normalized[field] = u.code.trim();
      } else {
        throw new Error('REPOSITORY_RESPONSE_INVALID: Published_By contains multiple users');
      }
    } else {
      const val = wrapper.value;
      normalized[field] = val === null || val === undefined ? '' : String(val).trim();
    }
  }

  return normalized;
}

export class ScoringConfigKintoneRepository {
  constructor({ request, authorizeWrite }) {
    if (!request || typeof request !== 'function') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Request function is required');
    }
    if (!authorizeWrite || typeof authorizeWrite !== 'function') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Write authorizer function is required');
    }
    this.request = request;
    this.authorizeWrite = authorizeWrite;
    this.appId = WP002C_SCORING_MASTER_APP_ID;
  }

  async findByMasterKey(masterRecordKey) {
    if (!masterRecordKey || typeof masterRecordKey !== 'string' || masterRecordKey.trim() === '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Master_Record_Key is required');
    }
    const safeKey = escapeKintoneQueryLiteral(masterRecordKey.trim());
    const path = '/k/v1/records.json';
    const query = `Master_Record_Key = "${safeKey}" limit 2`;

    let res;
    try {
      res = await this.request({ method: 'GET', path, params: { app: this.appId, query } });
    } catch (err) {
      throw new Error(`KINTONE_REPOSITORY_REQUEST_FAILED: ${err.message}`);
    }

    if (!res || typeof res !== 'object' || !Array.isArray(res.records)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Response records missing or invalid');
    }

    if (res.records.length === 0) return null;
    if (res.records.length > 1) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Duplicate records returned for master record key');
    }

    const normalized = normalizeRawRecord(res.records[0]);
    if (normalized.Master_Record_Key !== masterRecordKey.trim()) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Returned record Master_Record_Key mismatch');
    }

    return normalized;
  }

  async getByRecordId(recordId) {
    if (recordId === undefined || recordId === null) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: recordId is required');
    }
    const strId = String(recordId).trim();
    if (!/^[1-9]\d*$/.test(strId)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: recordId must be positive integer');
    }

    const path = '/k/v1/record.json';
    let res;
    try {
      res = await this.request({ method: 'GET', path, params: { app: this.appId, id: strId } });
    } catch (err) {
      throw new Error(`KINTONE_REPOSITORY_REQUEST_FAILED: ${err.message}`);
    }

    if (!res || typeof res !== 'object' || !res.record || typeof res.record !== 'object' || Array.isArray(res.record)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Response record missing or invalid');
    }

    const normalized = normalizeRawRecord(res.record);
    if (normalized.__recordId !== strId) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Returned record ID mismatch');
    }

    return normalized;
  }

  async findPublishedByProfileFiscalYear(profileCode, fiscalYear) {
    if (!profileCode || typeof profileCode !== 'string' || profileCode.trim() === '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Profile_Code is required');
    }
    if (!fiscalYear || typeof fiscalYear !== 'string' || fiscalYear.trim() === '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Fiscal_Year is required');
    }

    const safeProfile = escapeKintoneQueryLiteral(profileCode.trim());
    const safeFY = escapeKintoneQueryLiteral(fiscalYear.trim());
    const path = '/k/v1/records.json';
    const query = `Profile_Code = "${safeProfile}" and Fiscal_Year = "${safeFY}" and Config_Status = "PUBLISHED" limit 500`;

    let res;
    try {
      res = await this.request({ method: 'GET', path, params: { app: this.appId, query } });
    } catch (err) {
      throw new Error(`KINTONE_REPOSITORY_REQUEST_FAILED: ${err.message}`);
    }

    if (!res || typeof res !== 'object' || !Array.isArray(res.records)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Response records array required');
    }

    const result = [];
    for (const raw of res.records) {
      const norm = normalizeRawRecord(raw);
      if (norm.Profile_Code !== profileCode.trim() || norm.Fiscal_Year !== fiscalYear.trim() || norm.Config_Status !== CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
        throw new Error('REPOSITORY_RESPONSE_INVALID: Unexpected record returned in published query');
      }
      result.push(norm);
    }

    return result;
  }

  async createValidatedRecord(validatedRecord) {
    if (!validatedRecord || typeof validatedRecord !== 'object') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Validated record payload is required');
    }

    if (validatedRecord.Config_Status !== CONFIG_LIFECYCLE_STATUS.VALIDATED) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Config_Status must be VALIDATED for creation');
    }

    if (!validatedRecord.Configuration_Hash || !/^[0-9a-f]{64}$/.test(validatedRecord.Configuration_Hash)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Configuration_Hash must be exact 64-char lowercase hex');
    }

    if (validatedRecord.Published_By !== '' && validatedRecord.Published_By !== undefined && validatedRecord.Published_By !== null) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Published_By must be empty for validated record creation');
    }

    if (validatedRecord.Published_At !== '' && validatedRecord.Published_At !== undefined && validatedRecord.Published_At !== null) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Published_At must be empty for validated record creation');
    }

    let authResult;
    try {
      authResult = this.authorizeWrite({
        operation: 'SCORING_CONFIG_CREATE_VALIDATED',
        appId: this.appId,
        masterRecordKey: validatedRecord.Master_Record_Key
      });
    } catch (err) {
      throw new Error(`WRITE_AUTHORIZATION_FAILED: ${err.message}`);
    }

    if (authResult !== true) {
      throw new Error('WRITE_AUTHORIZATION_FAILED: Authorizer returned non-true value');
    }

    const kintoneRecord = {};
    for (const field of ALL_STORAGE_FIELDS) {
      if (field === 'Published_By') {
        kintoneRecord[field] = { value: [] };
      } else {
        const val = validatedRecord[field];
        kintoneRecord[field] = { value: val === undefined || val === null ? '' : String(val) };
      }
    }

    const path = '/k/v1/record.json';
    let res;
    try {
      res = await this.request({
        method: 'POST',
        path,
        body: { app: this.appId, record: kintoneRecord }
      });
    } catch (err) {
      throw new Error(`KINTONE_REPOSITORY_REQUEST_FAILED: ${err.message}`);
    }

    if (!res || typeof res !== 'object' || !res.id || !res.revision) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Create response missing id/revision');
    }
    const strId = String(res.id).trim();
    const strRev = String(res.revision).trim();

    if (!/^[1-9]\d*$/.test(strId) || !/^[1-9]\d*$/.test(strRev)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Create response id/revision must be positive integers');
    }

    return strId;
  }

  async publishRecord(recordId, lifecyclePatch, expectedRevision) {
    if (recordId === undefined || recordId === null) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: recordId is required');
    }
    const strId = String(recordId).trim();
    if (!/^[1-9]\d*$/.test(strId)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: recordId must be positive integer');
    }

    if (expectedRevision === undefined || expectedRevision === null) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: expectedRevision is required');
    }
    const strExpRev = String(expectedRevision).trim();
    if (!/^[1-9]\d*$/.test(strExpRev)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: expectedRevision must be positive integer');
    }

    if (!lifecyclePatch || typeof lifecyclePatch !== 'object') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: lifecyclePatch is required');
    }

    const patchKeys = Object.keys(lifecyclePatch);
    const expectedKeys = ['Config_Status', 'Published_By', 'Published_At'];
    if (patchKeys.length !== 3 || !expectedKeys.every(k => patchKeys.includes(k))) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: lifecyclePatch must contain exact 3 lifecycle keys only');
    }

    if (lifecyclePatch.Config_Status !== CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: lifecyclePatch status must be PUBLISHED');
    }

    if (!lifecyclePatch.Published_By || typeof lifecyclePatch.Published_By !== 'string' || lifecyclePatch.Published_By.trim() === '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Published_By is required');
    }

    if (!lifecyclePatch.Published_At || typeof lifecyclePatch.Published_At !== 'string' || lifecyclePatch.Published_At.trim() === '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Published_At is required');
    }

    let authResult;
    try {
      authResult = this.authorizeWrite({
        operation: 'SCORING_CONFIG_PUBLISH',
        appId: this.appId,
        recordId: strId,
        expectedRevision: strExpRev
      });
    } catch (err) {
      throw new Error(`WRITE_AUTHORIZATION_FAILED: ${err.message}`);
    }

    if (authResult !== true) {
      throw new Error('WRITE_AUTHORIZATION_FAILED: Authorizer returned non-true value');
    }

    const kintonePatch = {
      Config_Status: { value: CONFIG_LIFECYCLE_STATUS.PUBLISHED },
      Published_By: { value: [{ code: lifecyclePatch.Published_By.trim() }] },
      Published_At: { value: lifecyclePatch.Published_At.trim() }
    };

    const path = '/k/v1/record.json';
    let res;
    try {
      res = await this.request({
        method: 'PUT',
        path,
        body: {
          app: this.appId,
          id: strId,
          revision: strExpRev,
          record: kintonePatch
        }
      });
    } catch (err) {
      throw new Error(`KINTONE_REPOSITORY_REQUEST_FAILED: ${err.message}`);
    }

    if (!res || typeof res !== 'object' || !res.revision) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Publish response missing revision');
    }

    const newRevStr = String(res.revision).trim();
    if (!/^[1-9]\d*$/.test(newRevStr)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Publish response revision must be positive integer');
    }

    if (Number(newRevStr) <= Number(strExpRev)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Publish response revision not advanced');
    }

    return true;
  }
}
