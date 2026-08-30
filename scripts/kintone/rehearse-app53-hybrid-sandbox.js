import fs from 'node:fs';
import path from 'node:path';
import { getKintoneConnection } from '../../src/core/kintone-client.js';

const EXECUTION_FLAG = '--execute-sandbox-lifecycle';
const SANDBOX_APP_NAME = 'MBO2026 App53 Hybrid Identity Sandbox';

const FORBIDDEN_APP_IDS = [
  53, 283, 305, 307, 310, 640, 643, 715, 716, 794, 795, 796, 797, 798, 800, 801
];

// Safety Guard 1: Require explicit execution flag before any network connection or CLI parsing
if (!process.argv.includes(EXECUTION_FLAG)) {
  console.log(`\n========================================================================`);
  console.log(`[DRY-RUN / SAFETY EXIT] Script 'rehearse-app53-hybrid-sandbox.js'`);
  console.log(`========================================================================`);
  console.log(`Execution flag '${EXECUTION_FLAG}' was NOT provided.`);
  console.log(`No Kintone network connection created. Zero network requests executed.`);
  console.log(`To execute this sandbox rehearsal in Gate S-B, run:`);
  console.log(`  node --env-file-if-exists=.env.local scripts/kintone/rehearse-app53-hybrid-sandbox.js ${EXECUTION_FLAG}`);
  console.log(`========================================================================\n`);
  process.exit(0);
}

// Safety Guard 2: Hard-deny external target app ID inputs from CLI args or ENV overrides
for (const arg of process.argv.slice(2)) {
  if (arg !== EXECUTION_FLAG && /^\d+$/.test(arg)) {
    console.error(`[FAIL CLOSED] CLI input of target app ID (${arg}) is strictly forbidden.`);
    console.error(`Target sandbox app ID must be created and bound dynamically by this script.`);
    process.exit(1);
  }
}

// Safety Guard 3: Validate local-only backup evidence for Number_0 and emp_text
const backupPath = path.resolve('backups/d1-gateb-app53-preflight-r1/53/fields.json');
if (!fs.existsSync(backupPath)) {
  console.error(`[FAIL CLOSED] Local preflight backup file missing at: ${backupPath}`);
  console.error(`Cannot proceed without verified local Production field definitions.`);
  process.exit(1);
}

let localBackupFields = null;
try {
  localBackupFields = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
} catch (err) {
  console.error(`[FAIL CLOSED] Failed to parse local backup file: ${err.message}`);
  process.exit(1);
}

const number0Spec = localBackupFields.properties?.Number_0;
const empTextSpec = localBackupFields.properties?.emp_text;

if (!number0Spec || number0Spec.type !== 'NUMBER') {
  console.error(`[FAIL CLOSED] Local backup field 'Number_0' invalid or not type NUMBER.`);
  process.exit(1);
}

if (!empTextSpec || empTextSpec.type !== 'SINGLE_LINE_TEXT') {
  console.error(`[FAIL CLOSED] Local backup field 'emp_text' invalid or not type SINGLE_LINE_TEXT.`);
  process.exit(1);
}

// Network Transport Helpers
async function kintoneFetch(baseUrl, headers, endpoint, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : undefined;
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

// Main Execution Lifecycle
async function runSandboxLifecycle() {
  const { baseUrl, headers } = getKintoneConnection();

  let sandboxAppId = null;

  function assertSandboxAppId(targetId) {
    const numId = Number(targetId);
    if (!Number.isSafeInteger(numId) || numId <= 0) {
      throw new Error(`[FAIL CLOSED] Invalid target app ID: ${targetId}`);
    }
    if (FORBIDDEN_APP_IDS.includes(numId)) {
      throw new Error(`[SECURITY FAIL CLOSED] Attempted operation on forbidden protected app ID ${numId}`);
    }
    if (sandboxAppId !== null && numId !== sandboxAppId) {
      throw new Error(`[SECURITY FAIL CLOSED] Target app ID ${numId} does not match active sandboxAppId ${sandboxAppId}`);
    }
  }

  console.log(`[S1] Creating sandbox app '${SANDBOX_APP_NAME}'...`);
  const createRes = await kintoneFetch(baseUrl, headers, '/k/v1/preview/app.json', {
    method: 'POST',
    body: { name: SANDBOX_APP_NAME }
  });

  sandboxAppId = Number(createRes.app);
  assertSandboxAppId(sandboxAppId);
  console.log(`[S1] Created sandbox app ID: ${sandboxAppId}`);

  // S2 — Base Schema & Synthetic Records
  console.log(`[S2] Adding minimal base schema (Number_0, emp_text) to sandbox ${sandboxAppId}...`);
  assertSandboxAppId(sandboxAppId);
  await kintoneFetch(baseUrl, headers, '/k/v1/preview/app/form/fields.json', {
    method: 'POST',
    body: {
      app: sandboxAppId,
      properties: {
        Number_0: {
          type: 'NUMBER',
          code: 'Number_0',
          label: number0Spec.label || 'Status'
        },
        emp_text: {
          type: 'SINGLE_LINE_TEXT',
          code: 'emp_text',
          label: empTextSpec.label || 'Employee ID'
        }
      }
    }
  });

  console.log(`[S2] Deploying base schema to sandbox ${sandboxAppId}...`);
  assertSandboxAppId(sandboxAppId);
  await kintoneFetch(baseUrl, headers, '/k/v1/preview/app/deploy.json', {
    method: 'POST',
    body: { apps: [{ app: sandboxAppId }] }
  });
  await waitForDeploySuccess(baseUrl, headers, sandboxAppId);
  console.log(`[S2] Base schema deployed successfully.`);

  console.log(`[S2] Creating 2 synthetic records...`);
  assertSandboxAppId(sandboxAppId);
  await kintoneFetch(baseUrl, headers, '/k/v1/records.json', {
    method: 'POST',
    body: {
      app: sandboxAppId,
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
  console.log(`[S2] Synthetic records created.`);

  // S3 — Forward Field Rehearsal
  console.log(`[S3] Adding MBO_Kintone_User field to Preview on sandbox ${sandboxAppId}...`);
  assertSandboxAppId(sandboxAppId);
  await kintoneFetch(baseUrl, headers, '/k/v1/preview/app/form/fields.json', {
    method: 'POST',
    body: {
      app: sandboxAppId,
      properties: {
        MBO_Kintone_User: {
          type: 'USER_SELECT',
          code: 'MBO_Kintone_User',
          label: 'MBO Kintone User',
          required: false,
          entities: []
        }
      }
    }
  });

  console.log(`[S3] Verifying Preview field addition...`);
  assertSandboxAppId(sandboxAppId);
  const previewFieldsS3 = await kintoneFetch(baseUrl, headers, `/k/v1/preview/app/form/fields.json?app=${sandboxAppId}`, { method: 'GET' });
  const mboUserPrevS3 = previewFieldsS3.properties?.MBO_Kintone_User;
  verifyMboKintoneUserField(mboUserPrevS3, 'S3 Preview');

  console.log(`[S3] Deploying forward field change to sandbox ${sandboxAppId}...`);
  assertSandboxAppId(sandboxAppId);
  await kintoneFetch(baseUrl, headers, '/k/v1/preview/app/deploy.json', {
    method: 'POST',
    body: { apps: [{ app: sandboxAppId }] }
  });
  await waitForDeploySuccess(baseUrl, headers, sandboxAppId);
  console.log(`[S3] Forward field deployed successfully.`);

  console.log(`[S3] Verifying Live fields & synthetic records...`);
  assertSandboxAppId(sandboxAppId);
  const liveFieldsS3 = await kintoneFetch(baseUrl, headers, `/k/v1/app/form/fields.json?app=${sandboxAppId}`, { method: 'GET' });
  const mboUserLiveS3 = liveFieldsS3.properties?.MBO_Kintone_User;
  verifyMboKintoneUserField(mboUserLiveS3, 'S3 Live');

  const queryAsc = encodeURIComponent('order by $id asc');
  const liveRecsS3 = await kintoneFetch(baseUrl, headers, `/k/v1/records.json?app=${sandboxAppId}&query=${queryAsc}`, { method: 'GET' });
  verifySyntheticRecords(liveRecsS3.records, 'S3 Live');
  console.log(`[S3] Forward rehearsal PASS.`);

  // S4 — Rollback Rehearsal
  console.log(`[S4] Deleting MBO_Kintone_User field from Preview on sandbox ${sandboxAppId}...`);
  assertSandboxAppId(sandboxAppId);
  await kintoneFetch(baseUrl, headers, '/k/v1/preview/app/form/fields.json', {
    method: 'DELETE',
    body: {
      app: sandboxAppId,
      fields: ['MBO_Kintone_User']
    }
  });

  console.log(`[S4] Verifying Preview field removal before rollback deploy...`);
  assertSandboxAppId(sandboxAppId);
  const previewFieldsS4 = await kintoneFetch(baseUrl, headers, `/k/v1/preview/app/form/fields.json?app=${sandboxAppId}`, { method: 'GET' });
  if (previewFieldsS4.properties?.MBO_Kintone_User) {
    throw new Error(`[FAIL CLOSED] MBO_Kintone_User still present in Preview before rollback deploy.`);
  }

  console.log(`[S4] Deploying rollback to sandbox ${sandboxAppId}...`);
  assertSandboxAppId(sandboxAppId);
  await kintoneFetch(baseUrl, headers, '/k/v1/preview/app/deploy.json', {
    method: 'POST',
    body: { apps: [{ app: sandboxAppId }] }
  });
  await waitForDeploySuccess(baseUrl, headers, sandboxAppId);
  console.log(`[S4] Rollback deployed successfully.`);

  console.log(`[S4] Verifying Live fields & synthetic records after rollback...`);
  assertSandboxAppId(sandboxAppId);
  const liveFieldsS4 = await kintoneFetch(baseUrl, headers, `/k/v1/app/form/fields.json?app=${sandboxAppId}`, { method: 'GET' });
  if (liveFieldsS4.properties?.MBO_Kintone_User) {
    throw new Error(`[FAIL CLOSED] MBO_Kintone_User field still present in Live after rollback deploy.`);
  }

  const liveRecsS4 = await kintoneFetch(baseUrl, headers, `/k/v1/records.json?app=${sandboxAppId}&query=${queryAsc}`, { method: 'GET' });
  verifySyntheticRecords(liveRecsS4.records, 'S4 Live Rollback');

  console.log(`\n========================================================================`);
  console.log(`[REHEARSAL SUCCESS] Sandbox app ID ${sandboxAppId} rehearsal complete.`);
  console.log(`- Forward field addition: PASS`);
  console.log(`- Rollback field deletion: PASS`);
  console.log(`- Synthetic records intact: 2/2 PASS`);
  console.log(`- Sandbox app left in rolled-back baseline state for inspection.`);
  console.log(`========================================================================\n`);
}

runSandboxLifecycle().catch(err => {
  console.error(`\n[FATAL REHEARSAL ERROR] ${err.stack || err.message || err}`);
  process.exit(1);
});
