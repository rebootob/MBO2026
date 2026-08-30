import fs from 'node:fs';
import path from 'node:path';
import { getKintoneConnection } from '../../src/core/kintone-client.js';

const EXECUTION_FLAG = '--execute-app802-resume';
const APP_ID = 802;
const EXPECTED_APP_NAME = 'MBO2026 App53 Hybrid Identity Sandbox';
const EXPECTED_BASELINE_REVISION = 3;

// Safety Guard 1: Require exact execution flag before any network connection or CLI parsing
if (!process.argv.includes(EXECUTION_FLAG)) {
  console.log(`\n========================================================================`);
  console.log(`[DRY-RUN / SAFETY EXIT] Script 'resume-app802-hybrid-sandbox.js'`);
  console.log(`========================================================================`);
  console.log(`Execution flag '${EXECUTION_FLAG}' was NOT provided.`);
  console.log(`No Kintone network connection created. Zero network requests executed.`);
  console.log(`To execute this sandbox resume lifecycle in Gate S-D2, run:`);
  console.log(`  node --env-file-if-exists=.env.local scripts/kintone/resume-app802-hybrid-sandbox.js ${EXECUTION_FLAG}`);
  console.log(`========================================================================\n`);
  process.exit(0);
}

// Safety Guard 2: Reject any CLI input attempting to override target App ID
for (const arg of process.argv.slice(2)) {
  if (arg !== EXECUTION_FLAG && /^\d+$/.test(arg)) {
    console.error(`[FAIL CLOSED] External CLI input of target app ID (${arg}) is strictly forbidden.`);
    console.error(`Target app ID is hardcoded strictly to numeric ${APP_ID}.`);
    process.exit(1);
  }
}

// Safety Guard 3: Target App ID Assertion
function assertTargetAppId(targetId) {
  const numId = Number(targetId);
  if (numId !== APP_ID) {
    throw new Error(`[SECURITY FAIL CLOSED] Target App ID ${targetId} rejected. Only numeric ${APP_ID} is authorized.`);
  }
}

// Network Transport Helpers
async function kintoneFetch(baseUrl, headers, endpoint, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : undefined;
  
  // GET requests: auth headers only, NO Content-Type: application/json
  // POST / DELETE with JSON body: set Content-Type: application/json
  const reqHeaders = { ...headers };
  if (options.body) {
    reqHeaders['Content-Type'] = 'application/json';
  }

  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, { method, headers: reqHeaders, body });

  let payload = null;
  try {
    payload = await response.json();
  } catch (err) {
    // Non-JSON payload
  }

  if (!response.ok) {
    const errCode = payload?.code || response.status;
    const errMsg = payload?.message || response.statusText;
    throw new Error(`Kintone API error [${method} ${endpoint}]: HTTP ${response.status} (${errCode}) - ${errMsg}`);
  }

  return payload;
}

// Polling Helper for Preview App Deployment
async function waitForDeploySuccess(baseUrl, headers, sandboxAppId, timeoutMs = 60000) {
  assertTargetAppId(sandboxAppId);
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const res = await kintoneFetch(baseUrl, headers, `/k/v1/preview/app/deploy.json?apps[0]=${sandboxAppId}`, { method: 'GET' });
    const appDeploy = res.apps?.find(a => Number(a.app) === sandboxAppId);
    if (appDeploy) {
      if (appDeploy.status === 'SUCCESS') return true;
      if (appDeploy.status === 'FAIL' || appDeploy.status === 'CANCEL') {
        throw new Error(`Sandbox deployment failed with status '${appDeploy.status}'.`);
      }
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error(`Sandbox deployment timed out after ${timeoutMs}ms.`);
}

// Helper: Exact Schema Field Verification (Preview & Live)
function verifyMboKintoneUserField(fieldObj, contextLabel) {
  if (
    !fieldObj ||
    fieldObj.code !== 'MBO_Kintone_User' ||
    fieldObj.type !== 'USER_SELECT' ||
    fieldObj.label !== 'MBO Kintone User' ||
    fieldObj.required !== false ||
    !Array.isArray(fieldObj.entities) ||
    fieldObj.entities.length !== 0
  ) {
    throw new Error(`[FAIL CLOSED] ${contextLabel} verification mismatch for MBO_Kintone_User field.`);
  }
}

// Helper: Deterministic Synthetic Record Verification (Forward & Rollback)
function verifySyntheticRecords(records, contextLabel) {
  if (!Array.isArray(records) || records.length !== 2) {
    throw new Error(`[FAIL CLOSED] ${contextLabel} synthetic record count mismatch (expected 2, got ${records?.length}).`);
  }

  const sorted = [...records].sort((a, b) => Number(a.$id?.value || 0) - Number(b.$id?.value || 0));
  const recA = sorted[0];
  const recB = sorted[1];

  if (
    !recA ||
    !recB ||
    recA.Number_0?.value !== '1' ||
    recA.emp_text?.value !== 'SYNTH-001' ||
    recB.Number_0?.value !== '1' ||
    recB.emp_text?.value !== ''
  ) {
    throw new Error(`[FAIL CLOSED] ${contextLabel} synthetic record baseline value mismatch.`);
  }
}

// Main App 802 Resume Lifecycle
async function runResumeLifecycle() {
  assertTargetAppId(APP_ID);
  const { baseUrl, headers } = getKintoneConnection();

  console.log(`[S-D2.0] Pre-write baseline check on App ${APP_ID}...`);
  
  // 1. GET Live Settings
  const liveSettings = await kintoneFetch(baseUrl, headers, `/k/v1/app/settings.json?app=${APP_ID}`, { method: 'GET' });
  if (liveSettings.name !== EXPECTED_APP_NAME) {
    throw new Error(`[FAIL CLOSED] Live app name mismatch: expected '${EXPECTED_APP_NAME}', got '${liveSettings.name}'.`);
  }
  if (Number(liveSettings.revision) !== EXPECTED_BASELINE_REVISION) {
    throw new Error(`[FAIL CLOSED] Live app revision mismatch: expected ${EXPECTED_BASELINE_REVISION}, got ${liveSettings.revision}.`);
  }

  // 2. GET Preview Settings
  const previewSettings = await kintoneFetch(baseUrl, headers, `/k/v1/preview/app/settings.json?app=${APP_ID}`, { method: 'GET' });
  if (previewSettings.name !== EXPECTED_APP_NAME) {
    throw new Error(`[FAIL CLOSED] Preview app name mismatch: expected '${EXPECTED_APP_NAME}', got '${previewSettings.name}'.`);
  }
  if (Number(previewSettings.revision) !== EXPECTED_BASELINE_REVISION) {
    throw new Error(`[FAIL CLOSED] Preview app revision mismatch: expected ${EXPECTED_BASELINE_REVISION}, got ${previewSettings.revision}.`);
  }

  // 3. GET Deploy Status
  const deployStatusRes = await kintoneFetch(baseUrl, headers, `/k/v1/preview/app/deploy.json?apps[0]=${APP_ID}`, { method: 'GET' });
  const appDeployInfo = deployStatusRes.apps?.find(a => Number(a.app) === APP_ID);
  if (!appDeployInfo || appDeployInfo.status !== 'SUCCESS') {
    throw new Error(`[FAIL CLOSED] Deploy status mismatch: expected 'SUCCESS', got '${appDeployInfo?.status}'.`);
  }

  // 4. GET Live Fields
  const liveFields = await kintoneFetch(baseUrl, headers, `/k/v1/app/form/fields.json?app=${APP_ID}`, { method: 'GET' });
  if (liveFields.properties?.Number_0?.type !== 'NUMBER') {
    throw new Error(`[FAIL CLOSED] Live field 'Number_0' type mismatch.`);
  }
  if (liveFields.properties?.emp_text?.type !== 'SINGLE_LINE_TEXT') {
    throw new Error(`[FAIL CLOSED] Live field 'emp_text' type mismatch.`);
  }
  if (liveFields.properties?.MBO_Kintone_User) {
    throw new Error(`[FAIL CLOSED] Live field 'MBO_Kintone_User' already present at preflight.`);
  }

  // 5. GET Preview Fields
  const previewFields = await kintoneFetch(baseUrl, headers, `/k/v1/preview/app/form/fields.json?app=${APP_ID}`, { method: 'GET' });
  if (previewFields.properties?.Number_0?.type !== 'NUMBER') {
    throw new Error(`[FAIL CLOSED] Preview field 'Number_0' type mismatch.`);
  }
  if (previewFields.properties?.emp_text?.type !== 'SINGLE_LINE_TEXT') {
    throw new Error(`[FAIL CLOSED] Preview field 'emp_text' type mismatch.`);
  }
  if (previewFields.properties?.MBO_Kintone_User) {
    throw new Error(`[FAIL CLOSED] Preview field 'MBO_Kintone_User' already present at preflight.`);
  }

  // 6. GET Live Record Count
  const queryAsc = encodeURIComponent('order by $id asc');
  const liveRecordsRes = await kintoneFetch(baseUrl, headers, `/k/v1/records.json?app=${APP_ID}&query=${queryAsc}`, { method: 'GET' });
  if (!Array.isArray(liveRecordsRes.records) || liveRecordsRes.records.length !== 0) {
    throw new Error(`[FAIL CLOSED] Live record count mismatch at preflight: expected 0, got ${liveRecordsRes.records?.length}.`);
  }

  console.log(`[S-D2.0] Pre-write baseline verification PASS (App ${APP_ID}, revision 3, 0 records, baseline fields intact).`);

  // S-D2.1 — Synthetic Records
  console.log(`[S-D2.1] Creating 2 synthetic records on App ${APP_ID}...`);
  assertTargetAppId(APP_ID);
  const createRecsRes = await kintoneFetch(baseUrl, headers, '/k/v1/records.json', {
    method: 'POST',
    body: {
      app: APP_ID,
      records: [
        {
          Number_0: { value: '1' },
          emp_text: { value: 'SYNTH-001' }
        },
        {
          Number_0: { value: '1' },
          emp_text: { value: '' }
        }
      ]
    }
  });
  console.log(`[S-D2.1] Created synthetic records IDs: ${createRecsRes.ids?.join(', ')}.`);

  // S-D2.2 — Forward Field Rehearsal
  console.log(`[S-D2.2] Adding MBO_Kintone_User field to Preview on App ${APP_ID}...`);
  assertTargetAppId(APP_ID);
  const currentPreviewRev = Number(previewFields.revision || EXPECTED_BASELINE_REVISION);
  const addFieldPayload = {
    app: APP_ID,
    properties: {
      MBO_Kintone_User: {
        type: 'USER_SELECT',
        code: 'MBO_Kintone_User',
        label: 'MBO Kintone User',
        required: false,
        entities: []
      }
    }
  };
  if (Number.isSafeInteger(currentPreviewRev)) {
    addFieldPayload.revision = currentPreviewRev;
  }

  await kintoneFetch(baseUrl, headers, '/k/v1/preview/app/form/fields.json', {
    method: 'POST',
    body: addFieldPayload
  });

  console.log(`[S-D2.2] Verifying Preview field addition...`);
  assertTargetAppId(APP_ID);
  const previewFieldsS3 = await kintoneFetch(baseUrl, headers, `/k/v1/preview/app/form/fields.json?app=${APP_ID}`, { method: 'GET' });
  const mboUserPrevS3 = previewFieldsS3.properties?.MBO_Kintone_User;
  verifyMboKintoneUserField(mboUserPrevS3, 'S-D2.2 Preview');

  // S-D2.3 — Forward Deploy & Verification
  console.log(`[S-D2.3] Deploying forward field change to App ${APP_ID}...`);
  assertTargetAppId(APP_ID);
  const deployPayload = { apps: [{ app: APP_ID }] };
  if (previewFieldsS3.revision) {
    deployPayload.apps[0].revision = previewFieldsS3.revision;
  }

  await kintoneFetch(baseUrl, headers, '/k/v1/preview/app/deploy.json', {
    method: 'POST',
    body: deployPayload
  });
  await waitForDeploySuccess(baseUrl, headers, APP_ID);
  console.log(`[S-D2.3] Forward field deployed successfully.`);

  console.log(`[S-D2.3] Verifying Live fields & synthetic records...`);
  assertTargetAppId(APP_ID);
  const liveFieldsS3 = await kintoneFetch(baseUrl, headers, `/k/v1/app/form/fields.json?app=${APP_ID}`, { method: 'GET' });
  const mboUserLiveS3 = liveFieldsS3.properties?.MBO_Kintone_User;
  verifyMboKintoneUserField(mboUserLiveS3, 'S-D2.3 Live');

  const liveRecsS3 = await kintoneFetch(baseUrl, headers, `/k/v1/records.json?app=${APP_ID}&query=${queryAsc}`, { method: 'GET' });
  verifySyntheticRecords(liveRecsS3.records, 'S-D2.3 Live');
  console.log(`[S-D2.3] Forward rehearsal PASS.`);

  // S-D2.4 — Rollback Rehearsal
  console.log(`[S-D2.4] Deleting MBO_Kintone_User field from Preview on App ${APP_ID}...`);
  assertTargetAppId(APP_ID);
  const deletePayload = {
    app: APP_ID,
    fields: ['MBO_Kintone_User']
  };
  if (previewFieldsS3.revision) {
    deletePayload.revision = previewFieldsS3.revision;
  }

  await kintoneFetch(baseUrl, headers, '/k/v1/preview/app/form/fields.json', {
    method: 'DELETE',
    body: deletePayload
  });

  console.log(`[S-D2.4] Verifying Preview field removal before rollback deploy...`);
  assertTargetAppId(APP_ID);
  const previewFieldsS4 = await kintoneFetch(baseUrl, headers, `/k/v1/preview/app/form/fields.json?app=${APP_ID}`, { method: 'GET' });
  if (previewFieldsS4.properties?.MBO_Kintone_User) {
    throw new Error(`[FAIL CLOSED] MBO_Kintone_User still present in Preview before rollback deploy.`);
  }

  console.log(`[S-D2.4] Deploying rollback to App ${APP_ID}...`);
  assertTargetAppId(APP_ID);
  const rollbackDeployPayload = { apps: [{ app: APP_ID }] };
  if (previewFieldsS4.revision) {
    rollbackDeployPayload.apps[0].revision = previewFieldsS4.revision;
  }

  await kintoneFetch(baseUrl, headers, '/k/v1/preview/app/deploy.json', {
    method: 'POST',
    body: rollbackDeployPayload
  });
  await waitForDeploySuccess(baseUrl, headers, APP_ID);
  console.log(`[S-D2.4] Rollback deployed successfully.`);

  console.log(`[S-D2.4] Verifying Live fields & synthetic records after rollback...`);
  assertTargetAppId(APP_ID);
  const liveFieldsS4 = await kintoneFetch(baseUrl, headers, `/k/v1/app/form/fields.json?app=${APP_ID}`, { method: 'GET' });
  if (liveFieldsS4.properties?.MBO_Kintone_User) {
    throw new Error(`[FAIL CLOSED] MBO_Kintone_User field still present in Live after rollback deploy.`);
  }

  const liveRecsS4 = await kintoneFetch(baseUrl, headers, `/k/v1/records.json?app=${APP_ID}&query=${queryAsc}`, { method: 'GET' });
  verifySyntheticRecords(liveRecsS4.records, 'S-D2.4 Live Rollback');

  console.log(`\n========================================================================`);
  console.log(`[REHEARSAL SUCCESS] App ${APP_ID} resume rehearsal complete.`);
  console.log(`- Preflight baseline verification: PASS (rev 3, 0 records)`);
  console.log(`- Synthetic records creation: PASS (2 records)`);
  console.log(`- Forward field addition: PASS`);
  console.log(`- Rollback field deletion: PASS`);
  console.log(`- Synthetic records intact: 2/2 PASS`);
  console.log(`- App ${APP_ID} left present in rolled-back baseline state with 2 synthetic records.`);
  console.log(`========================================================================\n`);
}

runResumeLifecycle().catch(err => {
  console.error(`\n[FATAL REHEARSAL ERROR] ${err.stack || err.message || err}`);
  process.exit(1);
});
