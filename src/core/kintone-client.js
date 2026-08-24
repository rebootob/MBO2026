import {
  assertAppCreationAuthorization,
  assertScoringMasterLiveActivationAuthorization,
  assertDiscoveryReadOnly,
  WP002C_APPROVED_APP_NAME,
  WP002C_SCORING_MASTER_APP_ID
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
  if (!payload || !Array.isArray(payload.rights) || payload.rights.length !== 1 || !isNumericRevision(payload.revision)) {
    throw new Error(`${failureCode}: ACL must contain exactly one CREATOR entry and a numeric revision.`);
  }
  const right = payload.rights[0];
  const expected = CREATOR_ONLY_SCORING_MASTER_ACL;
  const rightsMatch = right?.entity?.type === 'CREATOR'
    && right.appEditable === expected.appEditable
    && right.recordViewable === expected.recordViewable
    && right.recordAddable === expected.recordAddable
    && right.recordEditable === expected.recordEditable
    && right.recordDeletable === expected.recordDeletable
    && right.recordImportable === expected.recordImportable
    && right.recordExportable === expected.recordExportable;
  if (!rightsMatch) {
    throw new Error(`${failureCode}: Creator-only ACL read-back mismatch.`);
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
