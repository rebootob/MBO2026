import { WP002C_SCORING_MASTER_APP_ID, WP002C_APPROVED_APP_NAME } from '../core/sandbox-write-guard.js';
import {
  IMMUTABLE_PAYLOAD_FIELDS,
  EXCLUDED_AUDIT_FIELDS,
  CONFIG_LIFECYCLE_STATUS
} from '../profiles/scoring-config-master.js';

export { WP002C_SCORING_MASTER_APP_ID };

const ALL_STORAGE_FIELDS = [...IMMUTABLE_PAYLOAD_FIELDS, ...EXCLUDED_AUDIT_FIELDS];

function isPlainObject(obj) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj) && Object.getPrototypeOf(obj) === Object.prototype;
}

function parseCallerSafeIntegerToken(val, label) {
  if (typeof val === 'number') {
    if (Number.isSafeInteger(val) && val > 0) {
      return String(val);
    }
    throw new Error(`REPOSITORY_RESPONSE_INVALID: ${label} must be positive safe integer number`);
  }
  if (typeof val === 'string') {
    if (val !== val.trim() || !/^[1-9]\d*$/.test(val)) {
      throw new Error(`REPOSITORY_RESPONSE_INVALID: ${label} must be positive safe integer string`);
    }
    const num = Number(val);
    if (!Number.isSafeInteger(num)) {
      throw new Error(`REPOSITORY_RESPONSE_INVALID: ${label} exceeds safe integer limit`);
    }
    return val;
  }
  throw new Error(`REPOSITORY_RESPONSE_INVALID: ${label} must be positive safe integer string or number`);
}

function parseStorageSafeIntegerToken(val, label) {
  if (typeof val !== 'string') {
    throw new Error(`REPOSITORY_RESPONSE_INVALID: ${label} must be a string`);
  }
  if (val !== val.trim() || !/^[1-9]\d*$/.test(val)) {
    throw new Error(`REPOSITORY_RESPONSE_INVALID: ${label} must be positive safe integer string`);
  }
  const num = Number(val);
  if (!Number.isSafeInteger(num)) {
    throw new Error(`REPOSITORY_RESPONSE_INVALID: ${label} exceeds safe integer limit`);
  }
  return val;
}

export function escapeKintoneQueryLiteral(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function normalizeRawRecord(rawRecord) {
  if (!isPlainObject(rawRecord)) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Raw record must be a plain object');
  }

  if (!isPlainObject(rawRecord.$id)) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Raw record missing $id wrapper');
  }
  const strId = parseStorageSafeIntegerToken(rawRecord.$id.value, '$id.value');

  if (!isPlainObject(rawRecord.$revision)) {
    throw new Error('REPOSITORY_RESPONSE_INVALID: Raw record missing $revision wrapper');
  }
  const strRev = parseStorageSafeIntegerToken(rawRecord.$revision.value, '$revision.value');

  const normalized = {
    __recordId: strId,
    __storageRevision: strRev
  };

  for (const field of ALL_STORAGE_FIELDS) {
    const wrapper = rawRecord[field];
    if (!isPlainObject(wrapper) || wrapper.value === undefined) {
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
        if (!isPlainObject(u) || typeof u.code !== 'string' || u.code === '' || u.code !== u.code.trim()) {
          throw new Error('REPOSITORY_RESPONSE_INVALID: Published_By user object code invalid');
        }
        normalized[field] = u.code;
      } else {
        throw new Error('REPOSITORY_RESPONSE_INVALID: Published_By contains multiple users');
      }
    } else {
      const val = wrapper.value;
      if (typeof val !== 'string') {
        throw new Error(`REPOSITORY_RESPONSE_INVALID: Scalar field '${field}' value must be string`);
      }
      normalized[field] = val;
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
    if (!masterRecordKey || typeof masterRecordKey !== 'string' || masterRecordKey !== masterRecordKey.trim() || masterRecordKey === '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Master_Record_Key must be exact non-empty string');
    }
    const safeKey = escapeKintoneQueryLiteral(masterRecordKey);
    const path = '/k/v1/records.json';
    const query = `Master_Record_Key = "${safeKey}" limit 2`;

    let res;
    try {
      res = await this.request({ method: 'GET', path, params: { app: this.appId, query } });
    } catch {
      throw new Error('KINTONE_REPOSITORY_REQUEST_FAILED');
    }

    if (!isPlainObject(res) || !Array.isArray(res.records)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Response records missing or invalid');
    }

    if (res.records.length === 0) return null;
    if (res.records.length > 1) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Duplicate records returned for master record key');
    }

    const normalized = normalizeRawRecord(res.records[0]);
    if (normalized.Master_Record_Key !== masterRecordKey) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Returned record Master_Record_Key mismatch');
    }

    return normalized;
  }

  async getByRecordId(recordId) {
    const strId = parseCallerSafeIntegerToken(recordId, 'recordId');
    const path = '/k/v1/record.json';

    let res;
    try {
      res = await this.request({ method: 'GET', path, params: { app: this.appId, id: strId } });
    } catch {
      throw new Error('KINTONE_REPOSITORY_REQUEST_FAILED');
    }

    if (!isPlainObject(res) || !isPlainObject(res.record)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Response record missing or invalid');
    }

    const normalized = normalizeRawRecord(res.record);
    if (normalized.__recordId !== strId) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Returned record ID mismatch');
    }

    return normalized;
  }

  async findPublishedByProfileFiscalYear(profileCode, fiscalYear) {
    if (!profileCode || typeof profileCode !== 'string' || profileCode !== profileCode.trim() || profileCode === '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Profile_Code must be exact non-empty string');
    }
    if (!fiscalYear || typeof fiscalYear !== 'string' || fiscalYear !== fiscalYear.trim() || fiscalYear === '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Fiscal_Year must be exact non-empty string');
    }

    const safeProfile = escapeKintoneQueryLiteral(profileCode);
    const safeFY = escapeKintoneQueryLiteral(fiscalYear);
    const path = '/k/v1/records.json';
    const query = `Profile_Code = "${safeProfile}" and Fiscal_Year = "${safeFY}" and Config_Status in ("PUBLISHED") limit 500`;

    let res;
    try {
      res = await this.request({ method: 'GET', path, params: { app: this.appId, query } });
    } catch {
      throw new Error('KINTONE_REPOSITORY_REQUEST_FAILED');
    }

    if (!isPlainObject(res) || !Array.isArray(res.records)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Response records array required');
    }

    const result = [];
    for (const raw of res.records) {
      const norm = normalizeRawRecord(raw);
      if (norm.Profile_Code !== profileCode || norm.Fiscal_Year !== fiscalYear || norm.Config_Status !== CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
        throw new Error('REPOSITORY_RESPONSE_INVALID: Unexpected record returned in published query');
      }
      result.push(norm);
    }

    return result;
  }

  async createValidatedRecord(validatedRecord) {
    if (!isPlainObject(validatedRecord)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Validated record payload must be a plain object');
    }

    if (validatedRecord.Config_Status !== CONFIG_LIFECYCLE_STATUS.VALIDATED) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Config_Status must be VALIDATED for creation');
    }

    if (!validatedRecord.Configuration_Hash || typeof validatedRecord.Configuration_Hash !== 'string' || !/^[0-9a-f]{64}$/.test(validatedRecord.Configuration_Hash)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Configuration_Hash must be exact 64-char lowercase hex');
    }

    if (validatedRecord.Published_By !== '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Published_By must be empty string exactly for validated record creation');
    }

    if (validatedRecord.Published_At !== '') {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Published_At must be empty string exactly for validated record creation');
    }

    const kintoneRecord = {};
    for (const field of ALL_STORAGE_FIELDS) {
      if (!Object.prototype.hasOwnProperty.call(validatedRecord, field)) {
        throw new Error(`REPOSITORY_RESPONSE_INVALID: Missing required field '${field}' in create payload`);
      }
      if (field === 'Published_By') {
        kintoneRecord[field] = { value: [] };
      } else {
        const val = validatedRecord[field];
        if (typeof val !== 'string' && typeof val !== 'number') {
          throw new Error(`REPOSITORY_RESPONSE_INVALID: Field '${field}' in create payload must be string or number`);
        }
        kintoneRecord[field] = { value: String(val) };
      }
    }

    const requestBody = { app: this.appId, record: kintoneRecord };

    let authResult;
    try {
      authResult = this.authorizeWrite({
        operation: 'SCORING_CONFIG_CREATE_VALIDATED',
        appId: this.appId,
        masterRecordKey: validatedRecord.Master_Record_Key
      });
    } catch {
      throw new Error('WRITE_AUTHORIZATION_FAILED');
    }

    if (authResult !== true) {
      throw new Error('WRITE_AUTHORIZATION_FAILED');
    }

    const path = '/k/v1/record.json';
    let res;
    try {
      res = await this.request({
        method: 'POST',
        path,
        body: requestBody
      });
    } catch {
      throw new Error('KINTONE_REPOSITORY_REQUEST_FAILED');
    }

    if (!isPlainObject(res)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Create response must be a plain object');
    }

    const strId = parseStorageSafeIntegerToken(res.id, 'create response id');
    const strRev = parseStorageSafeIntegerToken(res.revision, 'create response revision');

    return strId;
  }

  async publishRecord(recordId, lifecyclePatch, expectedRevision) {
    const strId = parseCallerSafeIntegerToken(recordId, 'recordId');
    const strExpRev = parseCallerSafeIntegerToken(expectedRevision, 'expectedRevision');

    if (!isPlainObject(lifecyclePatch)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: lifecyclePatch must be a plain object');
    }

    const patchKeys = Object.keys(lifecyclePatch);
    const expectedKeys = ['Config_Status', 'Published_By', 'Published_At'];
    if (patchKeys.length !== 3 || !expectedKeys.every(k => patchKeys.includes(k))) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: lifecyclePatch must contain exact 3 lifecycle keys only');
    }

    if (lifecyclePatch.Config_Status !== CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: lifecyclePatch status must be PUBLISHED');
    }

    if (typeof lifecyclePatch.Published_By !== 'string' || lifecyclePatch.Published_By === '' || lifecyclePatch.Published_By !== lifecyclePatch.Published_By.trim()) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Published_By must be non-empty exact string without whitespace');
    }

    if (typeof lifecyclePatch.Published_At !== 'string' || lifecyclePatch.Published_At === '' || lifecyclePatch.Published_At !== lifecyclePatch.Published_At.trim()) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Published_At must be non-empty exact string without whitespace');
    }

    const kintonePatch = {
      Config_Status: { value: CONFIG_LIFECYCLE_STATUS.PUBLISHED },
      Published_By: { value: [{ code: lifecyclePatch.Published_By }] },
      Published_At: { value: lifecyclePatch.Published_At }
    };

    const requestBody = {
      app: this.appId,
      id: strId,
      revision: strExpRev,
      record: kintonePatch
    };

    let authResult;
    try {
      authResult = this.authorizeWrite({
        operation: 'SCORING_CONFIG_PUBLISH',
        appId: this.appId,
        recordId: strId,
        expectedRevision: strExpRev
      });
    } catch {
      throw new Error('WRITE_AUTHORIZATION_FAILED');
    }

    if (authResult !== true) {
      throw new Error('WRITE_AUTHORIZATION_FAILED');
    }

    const path = '/k/v1/record.json';
    let res;
    try {
      res = await this.request({
        method: 'PUT',
        path,
        body: requestBody
      });
    } catch {
      throw new Error('KINTONE_REPOSITORY_REQUEST_FAILED');
    }

    if (!isPlainObject(res)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Publish response must be a plain object');
    }

    const newRevStr = parseStorageSafeIntegerToken(res.revision, 'publish response revision');

    if (Number(newRevStr) <= Number(strExpRev)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Publish response revision not advanced');
    }

    return true;
  }

  async activateSupersessionAtomically({
    predecessorRecordId,
    predecessorRevision,
    predecessorMasterRecordKey,
    predecessorVersion,
    newRecordId,
    newRevision,
    newMasterRecordKey,
    newVersion,
    publishedBy,
    publishedAt
  } = {}) {
    const strPredId = parseCallerSafeIntegerToken(predecessorRecordId, 'predecessorRecordId');
    const strPredRev = parseCallerSafeIntegerToken(predecessorRevision, 'predecessorRevision');
    const strNewId = parseCallerSafeIntegerToken(newRecordId, 'newRecordId');
    const strNewRev = parseCallerSafeIntegerToken(newRevision, 'newRevision');

    if (strPredId === strNewId) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: predecessorRecordId and newRecordId must be different');
    }

    if (typeof predecessorMasterRecordKey !== 'string' || predecessorMasterRecordKey.trim() === '' || predecessorMasterRecordKey !== predecessorMasterRecordKey.trim()) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: predecessorMasterRecordKey must be exact non-empty string');
    }

    if (typeof predecessorVersion !== 'string' || predecessorVersion.trim() === '' || predecessorVersion !== predecessorVersion.trim()) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: predecessorVersion must be exact non-empty string');
    }

    if (typeof newMasterRecordKey !== 'string' || newMasterRecordKey.trim() === '' || newMasterRecordKey !== newMasterRecordKey.trim()) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: newMasterRecordKey must be exact non-empty string');
    }

    if (typeof newVersion !== 'string' || newVersion.trim() === '' || newVersion !== newVersion.trim()) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: newVersion must be exact non-empty string');
    }

    if (predecessorMasterRecordKey === newMasterRecordKey || predecessorVersion === newVersion) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: predecessor and new master key and version must be different');
    }

    if (typeof publishedBy !== 'string' || publishedBy === '' || publishedBy !== publishedBy.trim()) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Published_By must be non-empty exact string without whitespace');
    }

    if (typeof publishedAt !== 'string' || publishedAt === '' || publishedAt !== publishedAt.trim()) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Published_At must be non-empty exact string without whitespace');
    }

    let authResult;
    try {
      authResult = this.authorizeWrite({
        workPackageId: 'MBO-P03-WP-002C',
        stage: 'STAGE_4D_SUPERSEDE_AND_PUBLISH',
        contractId: 'WP002C_SUPERSEDE_V1',
        operation: 'SCORING_CONFIG_SUPERSEDE_AND_PUBLISH',
        appId: this.appId,
        appName: WP002C_APPROVED_APP_NAME,
        predecessorRecordId: strPredId,
        predecessorRevision: strPredRev,
        predecessorMasterRecordKey,
        predecessorVersion,
        newRecordId: strNewId,
        newRevision: strNewRev,
        newMasterRecordKey,
        newVersion,
        expectedPredecessorCurrentStatus: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
        expectedPredecessorNextStatus: CONFIG_LIFECYCLE_STATUS.SUPERSEDED,
        expectedNewCurrentStatus: CONFIG_LIFECYCLE_STATUS.VALIDATED,
        expectedNewNextStatus: CONFIG_LIFECYCLE_STATUS.PUBLISHED,
        publishedBy: publishedBy.trim(),
        publishedAt: publishedAt.trim()
      });
    } catch {
      throw new Error('WRITE_AUTHORIZATION_FAILED');
    }

    if (authResult !== true) {
      throw new Error('WRITE_AUTHORIZATION_FAILED');
    }

    const bulkBody = {
      requests: [
        {
          method: 'PUT',
          api: '/k/v1/record.json',
          payload: {
            app: this.appId,
            id: strPredId,
            revision: strPredRev,
            record: {
              Config_Status: { value: CONFIG_LIFECYCLE_STATUS.SUPERSEDED }
            }
          }
        },
        {
          method: 'PUT',
          api: '/k/v1/record.json',
          payload: {
            app: this.appId,
            id: strNewId,
            revision: strNewRev,
            record: {
              Config_Status: { value: CONFIG_LIFECYCLE_STATUS.PUBLISHED },
              Published_By: { value: [{ code: publishedBy.trim() }] },
              Published_At: { value: publishedAt.trim() }
            }
          }
        }
      ]
    };

    let res;
    try {
      res = await this.request({
        method: 'POST',
        path: '/k/v1/bulkRequest.json',
        body: bulkBody
      });
    } catch {
      throw new Error('KINTONE_REPOSITORY_REQUEST_FAILED');
    }

    if (!isPlainObject(res) || !Array.isArray(res.results) || res.results.length !== 2) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Bulk request response must contain results array of length 2');
    }

    const res0RevStr = parseStorageSafeIntegerToken(res.results[0]?.revision, 'bulk response item 0 revision');
    const res1RevStr = parseStorageSafeIntegerToken(res.results[1]?.revision, 'bulk response item 1 revision');

    if (Number(res0RevStr) <= Number(strPredRev)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: Predecessor revision not advanced');
    }
    if (Number(res1RevStr) <= Number(strNewRev)) {
      throw new Error('REPOSITORY_RESPONSE_INVALID: New record revision not advanced');
    }

    return true;
  }
}
