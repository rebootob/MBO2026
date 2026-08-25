import {
  assertAppCreationAuthorization,
  assertScoringMasterLiveActivationAuthorization,
  assertScoringMasterSchemaAuthorization,
  assertDiscoveryReadOnly,
  WP002C_APPROVED_APP_NAME,
  WP002C_SCORING_MASTER_APP_ID,
  WP002C_SCHEMA_CONTRACT_ID,
  WP002C_SCHEMA_CONFIGURATION_STAGE,
  WP002C_SCHEMA_REPAIR_STAGE,
  WP002C_SCHEMA_REPAIR_CONTRACT_ID,
  assertScoringMasterDropdownRepairAuthorization
} from './sandbox-write-guard.js';

const APP_CREATE_PREVIEW_PATH = '/k/v1/preview/app.json';

export function getKintoneConnection() {
  const baseUrl = process.env.KINTONE_BASE_URL?.replace(/\/$/, '');
  const username = process.env.KINTONE_USERNAME;
  const password = process.env.KINTONE_PASSWORD;
  const token = process.env.KINTONE_API_TOKEN;
  const basicUsername = process.env.KINTONE_BASIC_AUTH_USERNAME;
  const basicPassword = process.env.KINTONE_BASIC_AUTH_PASSWORD;

  if (!baseUrl || (!token && !(username && password))) {
    throw new Error('Missing required Kintone connection variables.');
  }

  const headers = {};
  if (token) headers['X-Cybozu-API-Token'] = token;
  if (username && password) {
    headers['X-Cybozu-Authorization'] = Buffer.from(`${username}:${password}`).toString('base64');
  }
  if (basicUsername && basicPassword) {
    headers.Authorization = `Basic ${Buffer.from(`${basicUsername}:${basicPassword}`).toString('base64')}`;
  }
  return { baseUrl, headers };
}

/**
 * Prepares the future APP_CREATE connection without sending a request.
 * Kintone preview-app creation requires username/password authentication;
 * API tokens are intentionally excluded from this operation's headers.
 */
export function getAppCreationConnection() {
  const baseUrl = process.env.KINTONE_BASE_URL?.replace(/\/$/, '');
  const username = process.env.KINTONE_USERNAME;
  const password = process.env.KINTONE_PASSWORD;
  const basicUsername = process.env.KINTONE_BASIC_AUTH_USERNAME;
  const basicPassword = process.env.KINTONE_BASIC_AUTH_PASSWORD;

  if (!baseUrl || !username || !password) {
    throw new Error('APP CREATE AUTH BLOCKED: Kintone username and password authentication is required.');
  }

  const headers = {
    'X-Cybozu-Authorization': Buffer.from(`${username}:${password}`).toString('base64')
  };
  if (basicUsername && basicPassword) {
    headers.Authorization = `Basic ${Buffer.from(`${basicUsername}:${basicPassword}`).toString('base64')}`;
  }
  return { baseUrl, headers };
}

/**
 * Pure Stage-1 preflight only. It never calls fetch and cannot bypass kintoneRequest.
 */
export function assertAppCreationRequestPreflight(authConfig, requestConfig) {
  if (!requestConfig || typeof requestConfig !== 'object') {
    throw new Error('APP CREATE PREFLIGHT BLOCKED: Missing request configuration.');
  }
  if (requestConfig.method !== 'POST' || requestConfig.path !== APP_CREATE_PREVIEW_PATH) {
    throw new Error('APP CREATE PREFLIGHT BLOCKED: Only POST /k/v1/preview/app.json is allowed.');
  }
  if (requestConfig.body?.name !== WP002C_APPROVED_APP_NAME) {
    throw new Error('APP CREATE PREFLIGHT BLOCKED: Request body App name must exactly match the approved target.');
  }
  return assertAppCreationAuthorization(authConfig, {
    workPackageId: requestConfig.workPackageId,
    operation: requestConfig.operation,
    requestedAppName: requestConfig.body.name,
    manifest: requestConfig.manifest
  });
}

function assertValidCreateResponse(payload) {
  if (!payload || typeof payload !== 'object' || typeof payload.app !== 'string' || !/^[1-9]\d*$/.test(payload.app) || typeof payload.revision !== 'string' || !/^\d+$/.test(payload.revision)) {
    throw new Error('APP_CREATE_RESULT_UNCERTAIN: Create response did not contain a valid positive app ID and numeric revision.');
  }
  return {
    appId: Number(payload.app),
    app: payload.app,
    revision: payload.revision
  };
}

async function readSafeError(response) {
  try {
    const payload = await response.json();
    return [payload?.code, payload?.message].filter(Boolean).join(': ');
  } catch {
    return '';
  }
}

/**
 * Exact-purpose Stage-2 path. The endpoint, method, and body are constants;
 * authorization preflight is mandatory and runs once before the sole POST.
 */
export async function createAndVerifyScoringConfigMasterPreview(authConfig, requestConfig, fetchImpl = globalThis.fetch) {
  assertAppCreationRequestPreflight(authConfig, requestConfig);
  const { baseUrl, headers } = getAppCreationConnection();
  const createUrl = `${baseUrl}${APP_CREATE_PREVIEW_PATH}`;
  const createBody = { name: WP002C_APPROVED_APP_NAME };

  let createResponse;
  try {
    createResponse = await fetchImpl(createUrl, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(createBody)
    });
  } catch {
    throw new Error('APP_CREATE_RESULT_UNCERTAIN: Preview App create transport failed; do not retry.');
  }

  if (!createResponse?.ok) {
    const detail = await readSafeError(createResponse);
    throw new Error(`APP_CREATE_HTTP_ERROR: HTTP ${createResponse?.status ?? 'UNKNOWN'}${detail ? ` (${detail})` : ''}.`);
  }

  let createPayload;
  try {
    createPayload = await createResponse.json();
  } catch {
    throw new Error('APP_CREATE_RESULT_UNCERTAIN: Preview App create response was not parseable; do not retry.');
  }
  const created = assertValidCreateResponse(createPayload);

  const identityPath = `/k/v1/preview/app/settings.json?app=${created.app}`;
  let identityResponse;
  try {
    identityResponse = await fetchImpl(`${baseUrl}${identityPath}`, { method: 'GET', headers: { ...headers } });
  } catch {
    throw new Error(`APP_IDENTITY_VERIFICATION_FAILED: Read-back transport failed for returned App ID ${created.app}.`);
  }
  if (!identityResponse?.ok) {
    const detail = await readSafeError(identityResponse);
    throw new Error(`APP_IDENTITY_VERIFICATION_FAILED: HTTP ${identityResponse?.status ?? 'UNKNOWN'} for returned App ID ${created.app}${detail ? ` (${detail})` : ''}.`);
  }

  let identity;
  try {
    identity = await identityResponse.json();
  } catch {
    throw new Error(`APP_IDENTITY_VERIFICATION_FAILED: Unparseable read-back for returned App ID ${created.app}.`);
  }
  if (!identity || identity.name !== WP002C_APPROVED_APP_NAME || typeof identity.revision !== 'string' || !/^\d+$/.test(identity.revision)) {
    throw new Error(`APP_IDENTITY_VERIFICATION_FAILED: Exact identity mismatch for returned App ID ${created.app}.`);
  }

  return {
    appId: created.appId,
    app: created.app,
    createRevision: created.revision,
    identityRevision: identity.revision,
    name: identity.name
  };
}

export const CREATOR_ONLY_SCORING_MASTER_ACL = Object.freeze({
  entity: Object.freeze({ type: 'CREATOR' }),
  appEditable: true,
  recordViewable: true,
  recordAddable: true,
  recordEditable: true,
  recordDeletable: true,
  recordImportable: true,
  recordExportable: true
});

const WP002C_PLANNED_SCHEMA_FIELDS = Object.freeze([
  'Master_Record_Key', 'Profile_Code', 'Profile_Family', 'Scoring_Config_Code',
  'Scoring_Config_Version', 'Effective_From', 'Effective_To', 'Fiscal_Year',
  'PartA_Weight', 'PartB_Weight', 'Expected_Appraiser_Count',
  'Appraiser_Weight_Rule_Code', 'Part_A_Scoring_Mode', 'Competency_Set_Code',
  'PartA_Rounding_Rule', 'PartB_Raw_Rounding_Rule',
  'PartB_Weighted_Rounding_Rule', 'Final_Rounding_Rule',
  'Supersedes_Config_Version', 'Config_Status', 'Published_At', 'Published_By',
  'Configuration_Hash'
]);

function isNumericRevision(value) {
  return typeof value === 'string' && /^\d+$/.test(value);
}

function assertCreatorOnlyAcl(payload, failureCode) {
  if (!payload || !Array.isArray(payload.rights) || payload.rights.length === 0 || !isNumericRevision(payload.revision)) {
    throw new Error(`${failureCode}: ACL must contain CREATOR entry and a numeric revision.`);
  }
  const creatorRight = payload.rights.find((r) => r?.entity?.type === 'CREATOR');
  if (!creatorRight) {
    throw new Error(`${failureCode}: Missing CREATOR entry in ACL.`);
  }
  const expected = CREATOR_ONLY_SCORING_MASTER_ACL;
  const creatorMatch = creatorRight.appEditable === expected.appEditable
    && creatorRight.recordViewable === expected.recordViewable
    && creatorRight.recordAddable === expected.recordAddable
    && creatorRight.recordEditable === expected.recordEditable
    && creatorRight.recordDeletable === expected.recordDeletable
    && creatorRight.recordImportable === expected.recordImportable
    && creatorRight.recordExportable === expected.recordExportable;
  if (!creatorMatch) {
    throw new Error(`${failureCode}: Creator-only ACL read-back mismatch.`);
  }

  const nonCreatorRights = payload.rights.filter((r) => r?.entity?.type !== 'CREATOR');
  for (const right of nonCreatorRights) {
    const hasAnyPermission = Boolean(right.appEditable || right.recordViewable || right.recordAddable || right.recordEditable || right.recordDeletable || right.recordImportable || right.recordExportable);
    if (hasAnyPermission) {
      throw new Error(`${failureCode}: Non-creator entity has non-denied access permissions.`);
    }
  }

  return payload.revision;
}

async function parseJsonOrThrow(response, errorCode, context) {
  try {
    return await response.json();
  } catch {
    throw new Error(`${errorCode}: Unparseable ${context} response.`);
  }
}

async function exactGet(fetchImpl, url, headers, errorCode, context) {
  let response;
  try {
    response = await fetchImpl(url, { method: 'GET', headers: { ...headers } });
  } catch {
    throw new Error(`${errorCode}: ${context} transport failed.`);
  }
  return response;
}

/**
 * Exact App-796 Stage-3A activation. No endpoint, App ID, ACL, or deploy body
 * is caller-selectable; the only writes are one ACL PUT and one deploy POST.
 */
export async function activateScoringConfigMasterLive(authConfig, requestConfig, fetchImpl = globalThis.fetch, options = {}) {
  assertScoringMasterLiveActivationAuthorization(authConfig, requestConfig);
  const { baseUrl, headers } = getAppCreationConnection();
  const appId = WP002C_SCORING_MASTER_APP_ID;
  const maxStatusChecks = options.maxStatusChecks ?? 30;
  const pollDelayMs = options.pollDelayMs ?? 2000;
  const sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));

  const previewSettingsUrl = `${baseUrl}/k/v1/preview/app/settings.json?app=${appId}`;
  const previewResponse = await exactGet(fetchImpl, previewSettingsUrl, headers, 'STAGE3A_PREFLIGHT_FAILED', 'Preview identity');
  if (!previewResponse.ok) throw new Error(`STAGE3A_PREFLIGHT_FAILED: Preview settings HTTP ${previewResponse.status}.`);
  const preview = await parseJsonOrThrow(previewResponse, 'STAGE3A_PREFLIGHT_FAILED', 'Preview settings');
  if (preview.name !== WP002C_APPROVED_APP_NAME || !isNumericRevision(preview.revision)) {
    throw new Error('STAGE3A_PREFLIGHT_FAILED: Preview identity or revision mismatch.');
  }

  const liveSettingsUrl = `${baseUrl}/k/v1/app/settings.json?app=${appId}`;
  const livePrecheck = await exactGet(fetchImpl, liveSettingsUrl, headers, 'STAGE3A_PREFLIGHT_FAILED', 'Live identity precheck');
  if (livePrecheck.ok) {
    const live = await parseJsonOrThrow(livePrecheck, 'STAGE3A_PREFLIGHT_FAILED', 'Live identity precheck');
    if (live.name === WP002C_APPROVED_APP_NAME) throw new Error('LIVE_ALREADY_DEPLOYED');
    throw new Error('STAGE3A_PREFLIGHT_FAILED: Different live identity returned for App 796.');
  }
  if (livePrecheck.status !== 404) throw new Error(`STAGE3A_PREFLIGHT_FAILED: Live settings HTTP ${livePrecheck.status}.`);

  const fieldsUrl = `${baseUrl}/k/v1/preview/app/form/fields.json?app=${appId}`;
  const fieldsResponse = await exactGet(fetchImpl, fieldsUrl, headers, 'STAGE3A_PREFLIGHT_FAILED', 'Preview fields');
  if (!fieldsResponse.ok) throw new Error(`STAGE3A_PREFLIGHT_FAILED: Preview fields HTTP ${fieldsResponse.status}.`);
  const fields = await parseJsonOrThrow(fieldsResponse, 'STAGE3A_PREFLIGHT_FAILED', 'Preview fields');
  const existingCodes = new Set(Object.keys(fields.properties ?? {}));
  if (WP002C_PLANNED_SCHEMA_FIELDS.some((code) => existingCodes.has(code))) {
    throw new Error('STAGE3A_PREFLIGHT_FAILED: Planned WP-002C schema fields already exist.');
  }

  const aclUrl = `${baseUrl}/k/v1/preview/app/acl.json`;
  const aclBody = {
    app: appId,
    rights: [{
      entity: { type: 'CREATOR' },
      appEditable: true,
      recordViewable: true,
      recordAddable: true,
      recordEditable: true,
      recordDeletable: true,
      recordImportable: true,
      recordExportable: true
    }],
    revision: preview.revision
  };
  let aclUpdateResponse;
  try {
    aclUpdateResponse = await fetchImpl(aclUrl, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(aclBody)
    });
  } catch {
    throw new Error('ACL_UPDATE_FAILED: Preview ACL transport failed.');
  }
  if (!aclUpdateResponse?.ok) throw new Error(`ACL_UPDATE_FAILED: HTTP ${aclUpdateResponse?.status ?? 'UNKNOWN'}.`);
  const aclUpdate = await parseJsonOrThrow(aclUpdateResponse, 'ACL_UPDATE_FAILED', 'ACL update');
  if (!isNumericRevision(aclUpdate.revision)) throw new Error('ACL_UPDATE_FAILED: Invalid revision.');

  const previewAclResponse = await exactGet(fetchImpl, `${aclUrl}?app=${appId}`, headers, 'ACL_READBACK_FAILED', 'Preview ACL');
  if (!previewAclResponse.ok) throw new Error(`ACL_READBACK_FAILED: HTTP ${previewAclResponse.status}.`);
  const previewAcl = await parseJsonOrThrow(previewAclResponse, 'ACL_READBACK_FAILED', 'Preview ACL');
  const latestRevision = assertCreatorOnlyAcl(previewAcl, 'ACL_READBACK_FAILED');

  const deployUrl = `${baseUrl}/k/v1/preview/app/deploy.json`;
  const deployBody = { apps: [{ app: appId, revision: latestRevision }] };
  let deployTransportUncertain = false;
  let deployResponse;
  try {
    deployResponse = await fetchImpl(deployUrl, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(deployBody)
    });
  } catch {
    deployTransportUncertain = true;
  }
  if (deployResponse && !deployResponse.ok) {
    throw new Error(`DEPLOY_EXECUTION_FAILED: HTTP ${deployResponse.status ?? 'UNKNOWN'}.`);
  }

  const deployStatusUrl = `${baseUrl}/k/v1/preview/app/deploy.json?apps[0]=${appId}`;
  let finalDeployStatus = null;
  for (let check = 0; check < maxStatusChecks; check += 1) {
    const statusResponse = await exactGet(fetchImpl, deployStatusUrl, headers, 'DEPLOY_RESULT_UNCERTAIN', 'Deploy status');
    if (!statusResponse.ok) throw new Error(`DEPLOY_RESULT_UNCERTAIN: Deploy status HTTP ${statusResponse.status}.`);
    const statusPayload = await parseJsonOrThrow(statusResponse, 'DEPLOY_RESULT_UNCERTAIN', 'deploy status');
    const exactApp = statusPayload.apps?.find((entry) => String(entry.app) === String(appId));
    if (!exactApp || !['PROCESSING', 'SUCCESS', 'FAIL', 'CANCEL'].includes(exactApp.status)) {
      throw new Error('DEPLOY_RESULT_UNCERTAIN: Missing or invalid exact-App deploy status.');
    }
    finalDeployStatus = exactApp.status;
    if (finalDeployStatus === 'SUCCESS') break;
    if (finalDeployStatus === 'FAIL' || finalDeployStatus === 'CANCEL') {
      throw new Error(`DEPLOY_EXECUTION_FAILED: Final status ${finalDeployStatus}.`);
    }
    if (check < maxStatusChecks - 1) await sleep(pollDelayMs);
  }
  if (finalDeployStatus !== 'SUCCESS') {
    throw new Error(`DEPLOY_RESULT_UNCERTAIN: ${deployTransportUncertain ? 'POST transport uncertain; ' : ''}bounded polling did not reach SUCCESS.`);
  }

  const finalLiveResponse = await exactGet(fetchImpl, liveSettingsUrl, headers, 'LIVE_APP_VERIFICATION_FAILED', 'Live identity');
  if (!finalLiveResponse.ok) throw new Error(`LIVE_APP_VERIFICATION_FAILED: Live settings HTTP ${finalLiveResponse.status}.`);
  const finalLive = await parseJsonOrThrow(finalLiveResponse, 'LIVE_APP_VERIFICATION_FAILED', 'live settings');
  if (finalLive.name !== WP002C_APPROVED_APP_NAME || !isNumericRevision(finalLive.revision)) {
    throw new Error('LIVE_APP_VERIFICATION_FAILED: Exact live identity mismatch.');
  }

  const liveAclResponse = await exactGet(fetchImpl, `${baseUrl}/k/v1/app/acl.json?app=${appId}`, headers, 'LIVE_APP_VERIFICATION_FAILED', 'Live ACL');
  if (!liveAclResponse.ok) throw new Error(`LIVE_APP_VERIFICATION_FAILED: Live ACL HTTP ${liveAclResponse.status}.`);
  const liveAcl = await parseJsonOrThrow(liveAclResponse, 'LIVE_APP_VERIFICATION_FAILED', 'live ACL');
  assertCreatorOnlyAcl(liveAcl, 'LIVE_APP_VERIFICATION_FAILED');

  return {
    appId,
    name: finalLive.name,
    revision: finalLive.revision,
    deployStatus: finalDeployStatus,
    accessStatus: 'CREATOR_ONLY'
  };
}

export const WP002C_23_FIELD_MANIFEST = Object.freeze([
  { code: 'Master_Record_Key', type: 'SINGLE_LINE_TEXT', required: true, unique: true },
  { code: 'Profile_Code', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  { code: 'Profile_Family', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  { code: 'Scoring_Config_Code', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  { code: 'Scoring_Config_Version', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  { code: 'Effective_From', type: 'DATE', required: true, unique: false },
  { code: 'Effective_To', type: 'DATE', required: true, unique: false },
  { code: 'Fiscal_Year', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  { code: 'PartA_Weight', type: 'NUMBER', required: true, unique: false },
  { code: 'PartB_Weight', type: 'NUMBER', required: true, unique: false },
  { code: 'Expected_Appraiser_Count', type: 'NUMBER', required: true, unique: false },
  { code: 'Appraiser_Weight_Rule_Code', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  {
    code: 'Part_A_Scoring_Mode',
    type: 'DROP_DOWN',
    required: true,
    unique: false,
    options: Object.freeze({
      DIFFICULTY_ACHIEVEMENT_MATRIX: { label: 'DIFFICULTY_ACHIEVEMENT_MATRIX', index: '0' },
      ACHIEVEMENT_DIRECT: { label: 'ACHIEVEMENT_DIRECT', index: '1' }
    })
  },
  { code: 'Competency_Set_Code', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  { code: 'PartA_Rounding_Rule', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  { code: 'PartB_Raw_Rounding_Rule', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  { code: 'PartB_Weighted_Rounding_Rule', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  { code: 'Final_Rounding_Rule', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  { code: 'Supersedes_Config_Version', type: 'SINGLE_LINE_TEXT', required: true, unique: false },
  {
    code: 'Config_Status',
    type: 'DROP_DOWN',
    required: true,
    unique: false,
    options: Object.freeze({
      DRAFT: { label: 'DRAFT', index: '0' },
      VALIDATED: { label: 'VALIDATED', index: '1' },
      PUBLISHED: { label: 'PUBLISHED', index: '2' },
      SUPERSEDED: { label: 'SUPERSEDED', index: '3' },
      RETIRED: { label: 'RETIRED', index: '4' }
    })
  },
  { code: 'Published_At', type: 'DATETIME', required: false, unique: false },
  { code: 'Published_By', type: 'USER_SELECT', required: false, unique: false },
  { code: 'Configuration_Hash', type: 'SINGLE_LINE_TEXT', required: false, unique: false }
]);


export const WP002C_DROPDOWN_REPAIR_PAYLOAD = Object.freeze({
  Part_A_Scoring_Mode: Object.freeze({
    type: 'DROP_DOWN',
    options: Object.freeze({
      DIFFICULTY_ACHIEVEMENT_MATRIX: Object.freeze({ label: 'DIFFICULTY_ACHIEVEMENT_MATRIX', index: '0' }),
      ACHIEVEMENT_DIRECT: Object.freeze({ label: 'ACHIEVEMENT_DIRECT', index: '1' })
    })
  }),
  Config_Status: Object.freeze({
    type: 'DROP_DOWN',
    options: Object.freeze({
      DRAFT: Object.freeze({ label: 'DRAFT', index: '0' }),
      VALIDATED: Object.freeze({ label: 'VALIDATED', index: '1' }),
      PUBLISHED: Object.freeze({ label: 'PUBLISHED', index: '2' }),
      SUPERSEDED: Object.freeze({ label: 'SUPERSEDED', index: '3' }),
      RETIRED: Object.freeze({ label: 'RETIRED', index: '4' })
    })
  })
});

export function assertKnownStage3cDefectSchema(propertiesPayload, failureCode = 'KNOWN_DEFECT_VERIFICATION_FAILED') {
  if (!propertiesPayload || typeof propertiesPayload !== 'object') {
    throw new Error(`${failureCode}: Missing or invalid properties payload.`);
  }

  let isAlreadyCorrected = false;
  try {
    isAlreadyCorrected = assertExact23FieldSchema(propertiesPayload, failureCode);
  } catch {
    isAlreadyCorrected = false;
  }
  if (isAlreadyCorrected) {
    throw new Error('REPAIR_ALREADY_APPLIED_REQUIRES_RECONCILIATION: Schema already matches corrected contract.');
  }

  const expectedCodes = WP002C_PLANNED_SCHEMA_FIELDS;
  const presentPlannedCodes = expectedCodes.filter((code) => Object.prototype.hasOwnProperty.call(propertiesPayload, code));
  if (presentPlannedCodes.length !== expectedCodes.length) {
    throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Found ${presentPlannedCodes.length}/23 planned fields.`);
  }

  for (const spec of WP002C_23_FIELD_MANIFEST) {
    const actual = propertiesPayload[spec.code];
    if (!actual || typeof actual !== 'object') {
      throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Field ${spec.code} missing.`);
    }
    if (actual.label !== spec.code) {
      throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Field ${spec.code} label mismatch (expected '${spec.code}', got '${actual.label}').`);
    }
    if (actual.type !== spec.type) {
      throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Field ${spec.code} type mismatch.`);
    }
    if (Boolean(actual.required) !== spec.required) {
      throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Field ${spec.code} required mismatch.`);
    }
    if (spec.code === 'Master_Record_Key') {
      if (actual.unique !== true) throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Master_Record_Key unique mismatch.`);
    } else if (actual.unique === true) {
      throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Field ${spec.code} unique mismatch.`);
    }
    if (!isNoDefaultValue(actual.defaultValue)) {
      throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Field ${spec.code} contains unexpected default business value.`);
    }

    if (spec.code === 'Part_A_Scoring_Mode') {
      const actualOpts = actual.options ?? {};
      const expectedDefectOpts = ['0 DIFFICULTY_ACHIEVEMENT_MATRIX', '1 ACHIEVEMENT_DIRECT'];
      const actualKeys = Object.keys(actualOpts);
      if (actualKeys.length !== expectedDefectOpts.length || !expectedDefectOpts.every((k) => Object.prototype.hasOwnProperty.call(actualOpts, k))) {
        throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Part_A_Scoring_Mode option keys mismatch.`);
      }
      for (let i = 0; i < expectedDefectOpts.length; i += 1) {
        const key = expectedDefectOpts[i];
        const opt = actualOpts[key];
        if (!opt || (opt.label !== key && opt.key !== key)) {
          throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Part_A_Scoring_Mode label mismatch for '${key}'.`);
        }
        if (String(opt.index) !== String(i)) {
          throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Part_A_Scoring_Mode index mismatch for '${key}'.`);
        }
      }
    } else if (spec.code === 'Config_Status') {
      const actualOpts = actual.options ?? {};
      const expectedDefectOpts = ['0 DRAFT', '1 VALIDATED', '2 PUBLISHED', '3 SUPERSEDED', '4 RETIRED'];
      const actualKeys = Object.keys(actualOpts);
      if (actualKeys.length !== expectedDefectOpts.length || !expectedDefectOpts.every((k) => Object.prototype.hasOwnProperty.call(actualOpts, k))) {
        throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Config_Status option keys mismatch.`);
      }
      for (let i = 0; i < expectedDefectOpts.length; i += 1) {
        const key = expectedDefectOpts[i];
        const opt = actualOpts[key];
        if (!opt || (opt.label !== key && opt.key !== key)) {
          throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Config_Status label mismatch for '${key}'.`);
        }
        if (String(opt.index) !== String(i)) {
          throw new Error(`${failureCode}: UNEXPECTED_SCHEMA_DRIFT: Config_Status index mismatch for '${key}'.`);
        }
      }
    }
  }

  return true;
}

export async function repairScoringMasterDropdownSchema(authConfig, requestConfig, fetchImpl = globalThis.fetch, options = {}) {
  assertScoringMasterDropdownRepairAuthorization(authConfig, requestConfig);
  const { baseUrl, headers } = getAppCreationConnection();
  const appId = WP002C_SCORING_MASTER_APP_ID;
  const maxStatusChecks = options.maxStatusChecks ?? 30;
  const pollDelayMs = options.pollDelayMs ?? 2000;
  const sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));

  const previewSettingsUrl = `${baseUrl}/k/v1/preview/app/settings.json?app=${appId}`;
  const previewResponse = await exactGet(fetchImpl, previewSettingsUrl, headers, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Preview settings');
  if (!previewResponse.ok) throw new Error(`STAGE3C_R1_PREFLIGHT_FAILED: Preview settings HTTP ${previewResponse.status}.`);
  const preview = await parseJsonOrThrow(previewResponse, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Preview settings');
  if (preview.name !== WP002C_APPROVED_APP_NAME || !isNumericRevision(preview.revision)) {
    throw new Error('STAGE3C_R1_PREFLIGHT_FAILED: Preview identity or revision mismatch.');
  }

  const liveSettingsUrl = `${baseUrl}/k/v1/app/settings.json?app=${appId}`;
  const livePrecheck = await exactGet(fetchImpl, liveSettingsUrl, headers, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Live settings precheck');
  if (!livePrecheck.ok) throw new Error(`STAGE3C_R1_PREFLIGHT_FAILED: Live settings HTTP ${livePrecheck.status}.`);
  const live = await parseJsonOrThrow(livePrecheck, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Live identity');
  if (live.name !== WP002C_APPROVED_APP_NAME) throw new Error('STAGE3C_R1_PREFLIGHT_FAILED: Live App 796 identity mismatch.');

  const liveAclUrl = `${baseUrl}/k/v1/app/acl.json?app=${appId}`;
  const liveAclResponse = await exactGet(fetchImpl, liveAclUrl, headers, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Live ACL');
  if (!liveAclResponse.ok) throw new Error(`STAGE3C_R1_PREFLIGHT_FAILED: Live ACL HTTP ${liveAclResponse.status}.`);
  const liveAcl = await parseJsonOrThrow(liveAclResponse, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Live ACL');
  assertCreatorOnlyAcl(liveAcl, 'STAGE3C_R1_PREFLIGHT_FAILED');

  const previewAclUrl = `${baseUrl}/k/v1/preview/app/acl.json?app=${appId}`;
  const previewAclResponse = await exactGet(fetchImpl, previewAclUrl, headers, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Preview ACL');
  if (!previewAclResponse.ok) throw new Error(`STAGE3C_R1_PREFLIGHT_FAILED: Preview ACL HTTP ${previewAclResponse.status}.`);
  const previewAcl = await parseJsonOrThrow(previewAclResponse, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Preview ACL');
  assertCreatorOnlyAcl(previewAcl, 'STAGE3C_R1_PREFLIGHT_FAILED');

  const recordsUrl = `${baseUrl}/k/v1/records.json?app=${appId}&query=limit%201`;
  const recordsResponse = await exactGet(fetchImpl, recordsUrl, headers, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Records count check');
  if (!recordsResponse.ok) throw new Error(`STAGE3C_R1_PREFLIGHT_FAILED: Records count HTTP ${recordsResponse.status}.`);
  const recordsPayload = await parseJsonOrThrow(recordsResponse, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Records count check');
  if (Array.isArray(recordsPayload.records) && recordsPayload.records.length > 0) {
    throw new Error('STAGE3C_R1_PREFLIGHT_FAILED: Record count is non-zero (found records); repair blocked.');
  }

  const liveFieldsUrl = `${baseUrl}/k/v1/app/form/fields.json?app=${appId}`;
  const liveFieldsResponse = await exactGet(fetchImpl, liveFieldsUrl, headers, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Live fields');
  if (!liveFieldsResponse.ok) throw new Error(`STAGE3C_R1_PREFLIGHT_FAILED: Live fields HTTP ${liveFieldsResponse.status}.`);
  const liveFields = await parseJsonOrThrow(liveFieldsResponse, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Live fields');
  assertKnownStage3cDefectSchema(liveFields.properties, 'STAGE3C_R1_PREFLIGHT_FAILED');

  const previewFieldsUrl = `${baseUrl}/k/v1/preview/app/form/fields.json?app=${appId}`;
  const previewFieldsResponse = await exactGet(fetchImpl, previewFieldsUrl, headers, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Preview fields');
  if (!previewFieldsResponse.ok) throw new Error(`STAGE3C_R1_PREFLIGHT_FAILED: Preview fields HTTP ${previewFieldsResponse.status}.`);
  const previewFields = await parseJsonOrThrow(previewFieldsResponse, 'STAGE3C_R1_PREFLIGHT_FAILED', 'Preview fields');
  assertKnownStage3cDefectSchema(previewFields.properties, 'STAGE3C_R1_PREFLIGHT_FAILED');

  const fieldsPutUrl = `${baseUrl}/k/v1/preview/app/form/fields.json`;
  const fieldsPutBody = {
    app: appId,
    properties: WP002C_DROPDOWN_REPAIR_PAYLOAD,
    revision: preview.revision
  };

  let putTransportUncertain = false;
  let putResponse;
  try {
    putResponse = await fetchImpl(fieldsPutUrl, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(fieldsPutBody)
    });
  } catch {
    putTransportUncertain = true;
  }

  let postPutRevision = preview.revision;
  if (putTransportUncertain) {
    const reconcileResponse = await exactGet(fetchImpl, previewFieldsUrl, headers, 'REPAIR_PUT_RESULT_UNCERTAIN', 'Preview fields reconciliation');
    if (!reconcileResponse.ok) throw new Error('REPAIR_PUT_RESULT_UNCERTAIN: Preview fields GET failed after uncertain PUT; do not retry.');
    const reconciledFields = await parseJsonOrThrow(reconcileResponse, 'REPAIR_PUT_RESULT_UNCERTAIN', 'Preview fields reconciliation');
    const isCorrect = (() => {
      try {
        return assertExact23FieldSchema(reconciledFields.properties, 'REPAIR_PUT_RESULT_UNCERTAIN');
      } catch {
        return false;
      }
    })();
    if (isCorrect && isNumericRevision(reconciledFields.revision)) {
      postPutRevision = reconciledFields.revision;
    } else {
      throw new Error('REPAIR_PUT_RESULT_UNCERTAIN: PUT transport uncertain and schema not corrected; do not retry.');
    }
  } else {
    if (!putResponse?.ok) {
      const detail = await readSafeError(putResponse);
      throw new Error(`REPAIR_PUT_EXECUTION_FAILED: HTTP ${putResponse?.status ?? 'UNKNOWN'}${detail ? ` (${detail})` : ''}; no retry.`);
    }
    const putPayload = await parseJsonOrThrow(putResponse, 'REPAIR_PUT_EXECUTION_FAILED', 'Form fields PUT response');
    if (!isNumericRevision(putPayload.revision)) {
      throw new Error('REPAIR_PUT_EXECUTION_FAILED: PUT did not return a valid numeric revision.');
    }
    postPutRevision = putPayload.revision;
  }

  const previewReadbackResponse = await exactGet(fetchImpl, previewFieldsUrl, headers, 'PREVIEW_REPAIR_READBACK_FAILED', 'Preview fields readback');
  if (!previewReadbackResponse.ok) throw new Error(`PREVIEW_REPAIR_READBACK_FAILED: HTTP ${previewReadbackResponse.status}.`);
  const previewReadbackFields = await parseJsonOrThrow(previewReadbackResponse, 'PREVIEW_REPAIR_READBACK_FAILED', 'Preview fields readback');
  assertExact23FieldSchema(previewReadbackFields.properties, 'PREVIEW_REPAIR_READBACK_FAILED');

  const previewAclReadbackResponse = await exactGet(fetchImpl, previewAclUrl, headers, 'PREVIEW_REPAIR_READBACK_FAILED', 'Preview ACL readback');
  if (!previewAclReadbackResponse.ok) throw new Error(`PREVIEW_REPAIR_READBACK_FAILED: Preview ACL HTTP ${previewAclReadbackResponse.status}.`);
  const previewReadbackAcl = await parseJsonOrThrow(previewAclReadbackResponse, 'PREVIEW_REPAIR_READBACK_FAILED', 'Preview ACL readback');
  assertCreatorOnlyAcl(previewReadbackAcl, 'PREVIEW_REPAIR_READBACK_FAILED');

  const postPutRecordsRes = await exactGet(fetchImpl, recordsUrl, headers, 'PREVIEW_REPAIR_READBACK_FAILED', 'Post-PUT records check');
  if (!postPutRecordsRes.ok) throw new Error(`PREVIEW_REPAIR_READBACK_FAILED: Post-PUT records HTTP ${postPutRecordsRes.status}.`);
  const postPutRecords = await parseJsonOrThrow(postPutRecordsRes, 'PREVIEW_REPAIR_READBACK_FAILED', 'Post-PUT records check');
  if (Array.isArray(postPutRecords.records) && postPutRecords.records.length > 0) {
    throw new Error('PREVIEW_REPAIR_READBACK_FAILED: Post-PUT record count is non-zero.');
  }

  const latestPreviewRevision = isNumericRevision(previewReadbackFields.revision) ? previewReadbackFields.revision : postPutRevision;

  const deployUrl = `${baseUrl}/k/v1/preview/app/deploy.json`;
  const deployBody = { apps: [{ app: appId, revision: latestPreviewRevision }] };
  let deployTransportUncertain = false;
  let deployResponse;
  try {
    deployResponse = await fetchImpl(deployUrl, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(deployBody)
    });
  } catch {
    deployTransportUncertain = true;
  }

  if (deployResponse && !deployResponse.ok) {
    throw new Error(`DEPLOY_EXECUTION_FAILED: HTTP ${deployResponse.status ?? 'UNKNOWN'}; no retry.`);
  }

  const deployStatusUrl = `${baseUrl}/k/v1/preview/app/deploy.json?apps[0]=${appId}`;
  let finalDeployStatus = null;
  for (let check = 0; check < maxStatusChecks; check += 1) {
    const statusResponse = await exactGet(fetchImpl, deployStatusUrl, headers, 'DEPLOY_RESULT_UNCERTAIN', 'Deploy status');
    if (!statusResponse.ok) throw new Error(`DEPLOY_RESULT_UNCERTAIN: Deploy status HTTP ${statusResponse.status}.`);
    const statusPayload = await parseJsonOrThrow(statusResponse, 'DEPLOY_RESULT_UNCERTAIN', 'Deploy status');
    const exactApp = statusPayload.apps?.find((entry) => String(entry.app) === String(appId));
    if (!exactApp || !['PROCESSING', 'SUCCESS', 'FAIL', 'CANCEL'].includes(exactApp.status)) {
      throw new Error('DEPLOY_RESULT_UNCERTAIN: Missing or invalid exact-App deploy status.');
    }
    finalDeployStatus = exactApp.status;
    if (finalDeployStatus === 'SUCCESS') break;
    if (finalDeployStatus === 'FAIL' || finalDeployStatus === 'CANCEL') {
      throw new Error(`DEPLOY_EXECUTION_FAILED: Final status ${finalDeployStatus}.`);
    }
    if (check < maxStatusChecks - 1) await sleep(pollDelayMs);
  }

  if (finalDeployStatus !== 'SUCCESS') {
    throw new Error(`DEPLOY_RESULT_UNCERTAIN: ${deployTransportUncertain ? 'POST transport uncertain; ' : ''}polling did not reach SUCCESS.`);
  }

  const liveAppDetailUrl = `${baseUrl}/k/v1/app.json?id=${appId}`;
  const liveAppDetailRes = await exactGet(fetchImpl, liveAppDetailUrl, headers, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live App Detail verification');
  if (!liveAppDetailRes.ok) throw new Error(`LIVE_SCHEMA_VERIFICATION_FAILED: Live App Detail HTTP ${liveAppDetailRes.status}.`);
  const liveAppDetail = await parseJsonOrThrow(liveAppDetailRes, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live App Detail');
  if (liveAppDetail.name !== WP002C_APPROVED_APP_NAME || String(liveAppDetail.appId) !== String(appId)) {
    throw new Error('LIVE_SCHEMA_VERIFICATION_FAILED: Live App Detail identity mismatch.');
  }

  const catalogUrl = `${baseUrl}/k/v1/apps.json?ids[0]=${appId}`;
  const catalogRes = await exactGet(fetchImpl, catalogUrl, headers, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Get Apps Catalog verification');
  if (!catalogRes.ok) throw new Error(`LIVE_SCHEMA_VERIFICATION_FAILED: Catalog HTTP ${catalogRes.status}.`);
  const catalog = await parseJsonOrThrow(catalogRes, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Get Apps Catalog');
  const exactCatalogApp = catalog.apps?.find((entry) => String(entry.appId || entry.app) === String(appId));
  if (!exactCatalogApp || exactCatalogApp.name !== WP002C_APPROVED_APP_NAME) {
    throw new Error('LIVE_SCHEMA_VERIFICATION_FAILED: Catalog missing App 796.');
  }

  const finalLiveResponse = await exactGet(fetchImpl, liveSettingsUrl, headers, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live settings verification');
  if (!finalLiveResponse.ok) throw new Error(`LIVE_SCHEMA_VERIFICATION_FAILED: Live settings HTTP ${finalLiveResponse.status}.`);
  const finalLive = await parseJsonOrThrow(finalLiveResponse, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live settings');
  if (finalLive.name !== WP002C_APPROVED_APP_NAME) throw new Error('LIVE_SCHEMA_VERIFICATION_FAILED: Exact live identity mismatch.');

  const finalLiveFieldsResponse = await exactGet(fetchImpl, liveFieldsUrl, headers, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live fields verification');
  if (!finalLiveFieldsResponse.ok) throw new Error(`LIVE_SCHEMA_VERIFICATION_FAILED: Live fields HTTP ${finalLiveFieldsResponse.status}.`);
  const finalLiveFields = await parseJsonOrThrow(finalLiveFieldsResponse, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live fields');
  assertExact23FieldSchema(finalLiveFields.properties, 'LIVE_SCHEMA_VERIFICATION_FAILED');

  const finalLiveAclResponse = await exactGet(fetchImpl, liveAclUrl, headers, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live ACL verification');
  if (!finalLiveAclResponse.ok) throw new Error(`LIVE_SCHEMA_VERIFICATION_FAILED: Live ACL HTTP ${finalLiveAclResponse.status}.`);
  const finalLiveAcl = await parseJsonOrThrow(finalLiveAclResponse, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live ACL');
  assertCreatorOnlyAcl(finalLiveAcl, 'LIVE_SCHEMA_VERIFICATION_FAILED');

  const finalRecordsRes = await exactGet(fetchImpl, recordsUrl, headers, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Final live records check');
  if (!finalRecordsRes.ok) throw new Error(`LIVE_SCHEMA_VERIFICATION_FAILED: Final records HTTP ${finalRecordsRes.status}.`);
  const finalRecords = await parseJsonOrThrow(finalRecordsRes, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Final live records check');
  if (Array.isArray(finalRecords.records) && finalRecords.records.length > 0) {
    throw new Error('LIVE_SCHEMA_VERIFICATION_FAILED: Final live record count is non-zero.');
  }

  return {
    appId,
    appName: finalLive.name,
    putAttempts: 1,
    postPutRevision,
    deployAttempts: 1,
    deployStatus: finalDeployStatus,
    liveFieldCount: 23,
    liveAclStatus: 'CREATOR_ONLY',
    semanticState: 'DOMAIN_ALIGNED'
  };
}

export function generateExact23FieldsPayload() {
  const properties = {};
  for (const field of WP002C_23_FIELD_MANIFEST) {
    const entry = {
      code: field.code,
      label: field.code,
      type: field.type,
      required: field.required
    };
    if (['SINGLE_LINE_TEXT', 'NUMBER'].includes(field.type)) {
      entry.unique = field.unique;
    }
    if (field.type === 'DROP_DOWN' && field.options) {
      entry.options = field.options;
    }
    properties[field.code] = entry;
  }
  return properties;
}

export function assertExact23FieldSchema(propertiesPayload, failureCode = 'SCHEMA_VERIFICATION_FAILED') {
  if (!propertiesPayload || typeof propertiesPayload !== 'object') {
    throw new Error(`${failureCode}: Missing or invalid properties payload.`);
  }

  const expectedCodes = WP002C_23_FIELD_MANIFEST.map((f) => f.code);
  const presentPlannedCodes = expectedCodes.filter((code) => Object.prototype.hasOwnProperty.call(propertiesPayload, code));

  if (presentPlannedCodes.length !== expectedCodes.length) {
    throw new Error(`${failureCode}: Schema must contain all 23 WP-002C fields (found ${presentPlannedCodes.length}/23).`);
  }

  for (const spec of WP002C_23_FIELD_MANIFEST) {
    const actual = propertiesPayload[spec.code];
    if (!actual || typeof actual !== 'object') {
      throw new Error(`${failureCode}: Field ${spec.code} is missing from read-back.`);
    }
    if (actual.label !== spec.code) {
      throw new Error(`${failureCode}: Field ${spec.code} label mismatch (expected '${spec.code}', got '${actual.label}').`);
    }
    if (actual.type !== spec.type) {
      throw new Error(`${failureCode}: Field ${spec.code} type mismatch (expected ${spec.type}, got ${actual.type}).`);
    }

    const actualRequired = Boolean(actual.required);
    if (actualRequired !== spec.required) {
      throw new Error(`${failureCode}: Field ${spec.code} required flag mismatch (expected ${spec.required}, got ${actualRequired}).`);
    }

    if (spec.code === 'Master_Record_Key') {
      if (actual.unique !== true) {
        throw new Error(`${failureCode}: Master_Record_Key must have unique === true.`);
      }
    } else if (actual.unique === true) {
      throw new Error(`${failureCode}: Field ${spec.code} must NOT be unique.`);
    }

    if (spec.type === 'DROP_DOWN') {
      const expectedOptionsKeys = Object.keys(spec.options);
      const actualOptions = actual.options ?? {};
      const actualKeys = Object.keys(actualOptions);

      if (actualKeys.length !== expectedOptionsKeys.length) {
        throw new Error(`${failureCode}: Field ${spec.code} options count mismatch.`);
      }

      for (let i = 0; i < expectedOptionsKeys.length; i += 1) {
        const expectedKey = expectedOptionsKeys[i];
        const actualOption = actualOptions[expectedKey];
        if (!actualOption || (actualOption.label !== expectedKey && actualOption.key !== expectedKey)) {
          throw new Error(`${failureCode}: Field ${spec.code} missing option '${expectedKey}'.`);
        }
        if (actualOption.index !== undefined && String(actualOption.index) !== String(i)) {
          throw new Error(`${failureCode}: Field ${spec.code} option '${expectedKey}' index mismatch.`);
        }
      }
    }

    if (!isNoDefaultValue(actual.defaultValue)) {
      throw new Error(`${failureCode}: Field ${spec.code} contains unexpected default business value '${JSON.stringify(actual.defaultValue)}'.`);
    }
  }

  return true;
}

function isNoDefaultValue(val) {
  if (val === undefined || val === null) return true;
  if (typeof val === 'string' && val.trim() === '') return true;
  if (Array.isArray(val) && val.length === 0) return true;
  if (typeof val === 'object' && Object.keys(val).length === 0) return true;
  return false;
}

export async function configureAndDeployScoringMasterSchema(authConfig, requestConfig, fetchImpl = globalThis.fetch, options = {}) {
  assertScoringMasterSchemaAuthorization(authConfig, requestConfig);
  const { baseUrl, headers } = getAppCreationConnection();
  const appId = WP002C_SCORING_MASTER_APP_ID;
  const maxStatusChecks = options.maxStatusChecks ?? 30;
  const pollDelayMs = options.pollDelayMs ?? 2000;
  const sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));

  const previewSettingsUrl = `${baseUrl}/k/v1/preview/app/settings.json?app=${appId}`;
  const previewResponse = await exactGet(fetchImpl, previewSettingsUrl, headers, 'STAGE3C_PREFLIGHT_FAILED', 'Preview identity');
  if (!previewResponse.ok) throw new Error(`STAGE3C_PREFLIGHT_FAILED: Preview settings HTTP ${previewResponse.status}.`);
  const preview = await parseJsonOrThrow(previewResponse, 'STAGE3C_PREFLIGHT_FAILED', 'Preview settings');
  if (preview.name !== WP002C_APPROVED_APP_NAME || !isNumericRevision(preview.revision)) {
    throw new Error('STAGE3C_PREFLIGHT_FAILED: Preview identity or revision mismatch.');
  }

  const liveSettingsUrl = `${baseUrl}/k/v1/app/settings.json?app=${appId}`;
  const livePrecheck = await exactGet(fetchImpl, liveSettingsUrl, headers, 'STAGE3C_PREFLIGHT_FAILED', 'Live identity precheck');
  if (!livePrecheck.ok) throw new Error(`STAGE3C_PREFLIGHT_FAILED: Live settings HTTP ${livePrecheck.status}.`);
  const live = await parseJsonOrThrow(livePrecheck, 'STAGE3C_PREFLIGHT_FAILED', 'Live identity');
  if (live.name !== WP002C_APPROVED_APP_NAME) throw new Error('STAGE3C_PREFLIGHT_FAILED: Live App 796 identity mismatch.');

  const liveAclUrl = `${baseUrl}/k/v1/app/acl.json?app=${appId}`;
  const liveAclResponse = await exactGet(fetchImpl, liveAclUrl, headers, 'STAGE3C_PREFLIGHT_FAILED', 'Live ACL');
  if (!liveAclResponse.ok) throw new Error(`STAGE3C_PREFLIGHT_FAILED: Live ACL HTTP ${liveAclResponse.status}.`);
  const liveAcl = await parseJsonOrThrow(liveAclResponse, 'STAGE3C_PREFLIGHT_FAILED', 'Live ACL');
  assertCreatorOnlyAcl(liveAcl, 'STAGE3C_PREFLIGHT_FAILED');

  const previewAclUrl = `${baseUrl}/k/v1/preview/app/acl.json?app=${appId}`;
  const previewAclResponse = await exactGet(fetchImpl, previewAclUrl, headers, 'STAGE3C_PREFLIGHT_FAILED', 'Preview ACL');
  if (!previewAclResponse.ok) throw new Error(`STAGE3C_PREFLIGHT_FAILED: Preview ACL HTTP ${previewAclResponse.status}.`);
  const previewAcl = await parseJsonOrThrow(previewAclResponse, 'STAGE3C_PREFLIGHT_FAILED', 'Preview ACL');
  assertCreatorOnlyAcl(previewAcl, 'STAGE3C_PREFLIGHT_FAILED');

  const liveFieldsUrl = `${baseUrl}/k/v1/app/form/fields.json?app=${appId}`;
  const liveFieldsResponse = await exactGet(fetchImpl, liveFieldsUrl, headers, 'STAGE3C_PREFLIGHT_FAILED', 'Live fields');
  if (!liveFieldsResponse.ok) throw new Error(`STAGE3C_PREFLIGHT_FAILED: Live fields HTTP ${liveFieldsResponse.status}.`);
  const liveFields = await parseJsonOrThrow(liveFieldsResponse, 'STAGE3C_PREFLIGHT_FAILED', 'Live fields');
  const liveExistingCodes = new Set(Object.keys(liveFields.properties ?? {}));
  if (WP002C_PLANNED_SCHEMA_FIELDS.some((code) => liveExistingCodes.has(code))) {
    throw new Error('STAGE3C_PREFLIGHT_FAILED: Planned WP-002C schema fields already exist in live.');
  }

  const previewFieldsUrl = `${baseUrl}/k/v1/preview/app/form/fields.json?app=${appId}`;
  const previewFieldsResponse = await exactGet(fetchImpl, previewFieldsUrl, headers, 'STAGE3C_PREFLIGHT_FAILED', 'Preview fields');
  if (!previewFieldsResponse.ok) throw new Error(`STAGE3C_PREFLIGHT_FAILED: Preview fields HTTP ${previewFieldsResponse.status}.`);
  const previewFields = await parseJsonOrThrow(previewFieldsResponse, 'STAGE3C_PREFLIGHT_FAILED', 'Preview fields');
  const previewExistingCodes = new Set(Object.keys(previewFields.properties ?? {}));
  const previewMatchCount = WP002C_PLANNED_SCHEMA_FIELDS.filter((code) => previewExistingCodes.has(code)).length;

  if (previewMatchCount > 0) {
    throw new Error(`STAGE3C_PREFLIGHT_FAILED: Planned WP-002C schema fields already exist in preview (${previewMatchCount}/23 fields found); no deploy.`);
  }

  let fieldPostAttempts = 1;
  let postSchemaRevision = preview.revision;

  const fieldsPostUrl = `${baseUrl}/k/v1/preview/app/form/fields.json`;
  const fieldsPostBody = {
    app: appId,
    properties: generateExact23FieldsPayload(),
    revision: preview.revision
  };

  let fieldPostTransportUncertain = false;
  let fieldPostResponse;
  try {
    fieldPostResponse = await fetchImpl(fieldsPostUrl, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(fieldsPostBody)
    });
  } catch {
    fieldPostTransportUncertain = true;
  }

  if (fieldPostTransportUncertain) {
    const reconcileResponse = await exactGet(fetchImpl, previewFieldsUrl, headers, 'FIELD_POST_RESULT_UNCERTAIN', 'Preview fields reconciliation');
    if (!reconcileResponse.ok) throw new Error('FIELD_POST_RESULT_UNCERTAIN: Preview fields GET failed after uncertain POST; do not retry.');
    const reconciledFields = await parseJsonOrThrow(reconcileResponse, 'FIELD_POST_RESULT_UNCERTAIN', 'Preview fields reconciliation');
    const recCodes = new Set(Object.keys(reconciledFields.properties ?? {}));
    const allExist = WP002C_PLANNED_SCHEMA_FIELDS.every((code) => recCodes.has(code));
    if (allExist && isNumericRevision(reconciledFields.revision)) {
      postSchemaRevision = reconciledFields.revision;
    } else {
      throw new Error('FIELD_POST_RESULT_UNCERTAIN: Field POST transport uncertain and fields incomplete; do not retry.');
    }
  } else {
    if (!fieldPostResponse?.ok) {
      const detail = await readSafeError(fieldPostResponse);
      throw new Error(`FIELD_POST_EXECUTION_FAILED: HTTP ${fieldPostResponse?.status ?? 'UNKNOWN'}${detail ? ` (${detail})` : ''}; no retry.`);
    }
    const fieldPostPayload = await parseJsonOrThrow(fieldPostResponse, 'FIELD_POST_EXECUTION_FAILED', 'Field POST response');
    if (!isNumericRevision(fieldPostPayload.revision)) {
      throw new Error('FIELD_POST_EXECUTION_FAILED: Field POST did not return a valid numeric revision.');
    }
    postSchemaRevision = fieldPostPayload.revision;
  }

  const previewReadbackResponse = await exactGet(fetchImpl, previewFieldsUrl, headers, 'PREVIEW_SCHEMA_READBACK_FAILED', 'Preview fields readback');
  if (!previewReadbackResponse.ok) throw new Error(`PREVIEW_SCHEMA_READBACK_FAILED: HTTP ${previewReadbackResponse.status}.`);
  const previewReadbackFields = await parseJsonOrThrow(previewReadbackResponse, 'PREVIEW_SCHEMA_READBACK_FAILED', 'Preview fields readback');
  assertExact23FieldSchema(previewReadbackFields.properties, 'PREVIEW_SCHEMA_READBACK_FAILED');

  const previewAclReadbackResponse = await exactGet(fetchImpl, previewAclUrl, headers, 'PREVIEW_SCHEMA_READBACK_FAILED', 'Preview ACL readback');
  if (!previewAclReadbackResponse.ok) throw new Error(`PREVIEW_SCHEMA_READBACK_FAILED: Preview ACL HTTP ${previewAclReadbackResponse.status}.`);
  const previewReadbackAcl = await parseJsonOrThrow(previewAclReadbackResponse, 'PREVIEW_SCHEMA_READBACK_FAILED', 'Preview ACL readback');
  assertCreatorOnlyAcl(previewReadbackAcl, 'PREVIEW_SCHEMA_READBACK_FAILED');

  const latestPreviewRevision = isNumericRevision(previewReadbackFields.revision) ? previewReadbackFields.revision : postSchemaRevision;

  const deployUrl = `${baseUrl}/k/v1/preview/app/deploy.json`;
  const deployBody = { apps: [{ app: appId, revision: latestPreviewRevision }] };
  let deployTransportUncertain = false;
  let deployResponse;
  try {
    deployResponse = await fetchImpl(deployUrl, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(deployBody)
    });
  } catch {
    deployTransportUncertain = true;
  }

  if (deployResponse && !deployResponse.ok) {
    throw new Error(`DEPLOY_EXECUTION_FAILED: HTTP ${deployResponse.status ?? 'UNKNOWN'}; no retry.`);
  }

  const deployStatusUrl = `${baseUrl}/k/v1/preview/app/deploy.json?apps[0]=${appId}`;
  let finalDeployStatus = null;
  for (let check = 0; check < maxStatusChecks; check += 1) {
    const statusResponse = await exactGet(fetchImpl, deployStatusUrl, headers, 'DEPLOY_RESULT_UNCERTAIN', 'Deploy status');
    if (!statusResponse.ok) throw new Error(`DEPLOY_RESULT_UNCERTAIN: Deploy status HTTP ${statusResponse.status}.`);
    const statusPayload = await parseJsonOrThrow(statusResponse, 'DEPLOY_RESULT_UNCERTAIN', 'Deploy status');
    const exactApp = statusPayload.apps?.find((entry) => String(entry.app) === String(appId));
    if (!exactApp || !['PROCESSING', 'SUCCESS', 'FAIL', 'CANCEL'].includes(exactApp.status)) {
      throw new Error('DEPLOY_RESULT_UNCERTAIN: Missing or invalid exact-App deploy status.');
    }
    finalDeployStatus = exactApp.status;
    if (finalDeployStatus === 'SUCCESS') break;
    if (finalDeployStatus === 'FAIL' || finalDeployStatus === 'CANCEL') {
      throw new Error(`DEPLOY_EXECUTION_FAILED: Final status ${finalDeployStatus}.`);
    }
    if (check < maxStatusChecks - 1) await sleep(pollDelayMs);
  }

  if (finalDeployStatus !== 'SUCCESS') {
    throw new Error(`DEPLOY_RESULT_UNCERTAIN: ${deployTransportUncertain ? 'POST transport uncertain; ' : ''}polling did not reach SUCCESS.`);
  }

  const finalLiveResponse = await exactGet(fetchImpl, liveSettingsUrl, headers, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live settings verification');
  if (!finalLiveResponse.ok) throw new Error(`LIVE_SCHEMA_VERIFICATION_FAILED: Live settings HTTP ${finalLiveResponse.status}.`);
  const finalLive = await parseJsonOrThrow(finalLiveResponse, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live settings');
  if (finalLive.name !== WP002C_APPROVED_APP_NAME) throw new Error('LIVE_SCHEMA_VERIFICATION_FAILED: Exact live identity mismatch.');

  const finalLiveFieldsResponse = await exactGet(fetchImpl, liveFieldsUrl, headers, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live fields verification');
  if (!finalLiveFieldsResponse.ok) throw new Error(`LIVE_SCHEMA_VERIFICATION_FAILED: Live fields HTTP ${finalLiveFieldsResponse.status}.`);
  const finalLiveFields = await parseJsonOrThrow(finalLiveFieldsResponse, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live fields');
  assertExact23FieldSchema(finalLiveFields.properties, 'LIVE_SCHEMA_VERIFICATION_FAILED');

  const finalLiveAclResponse = await exactGet(fetchImpl, liveAclUrl, headers, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live ACL verification');
  if (!finalLiveAclResponse.ok) throw new Error(`LIVE_SCHEMA_VERIFICATION_FAILED: Live ACL HTTP ${finalLiveAclResponse.status}.`);
  const finalLiveAcl = await parseJsonOrThrow(finalLiveAclResponse, 'LIVE_SCHEMA_VERIFICATION_FAILED', 'Live ACL');
  assertCreatorOnlyAcl(finalLiveAcl, 'LIVE_SCHEMA_VERIFICATION_FAILED');

  return {
    appId,
    appName: finalLive.name,
    fieldPostAttempts: 1,
    postSchemaRevision,
    deployAttempts: 1,
    deployStatus: finalDeployStatus,
    liveFieldCount: 23,
    liveAclStatus: 'CREATOR_ONLY'
  };
}

export async function kintoneRequest(path, { method = 'GET', body } = {}) {
  assertDiscoveryReadOnly(method, path);
  const { baseUrl, headers } = getKintoneConnection();
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: body === undefined ? headers : { ...headers, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const detail = [error.code, error.message, error.errors ? JSON.stringify(error.errors) : ''].filter(Boolean).join(': ');
    throw new Error(`Kintone returned HTTP ${response.status}${detail ? ` (${detail})` : ''}.`);
  }
  return response.json();
}
