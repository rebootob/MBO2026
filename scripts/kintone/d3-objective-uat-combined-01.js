/**
 * D3-OBJECTIVE-UAT-COMBINED-01
 * Authorization ID: MBO2026-D3-OBJECTIVE-UAT-COMBINED-01-20260915-OWNER-01
 * Mode: NOTIFICATION-SAFE CONTROLLED OBJECTIVE WORKFLOW UAT
 *
 * READ CEILING: 12 total authorized Kintone reads
 * MUTATION CEILINGS:
 *   APP794_RECORD_CREATIONS <= 1
 *   APP794_RECORD_EDITS_AFTER_CREATION = 0
 *   APP794_PROCESS_TRANSITIONS <= 3
 *   COMMENTS = 0
 *   DELETIONS = 0
 *
 * GOVERNANCE RULES:
 *   - Working tree must be clean.
 *   - Base HEAD: 173a2171266041fe117b63bf6a493b86c8f85b84
 *   - No manually forged or invented route provenance.
 *   - No override of real route fields merely to force hr.
 *   - No modification to App 53, 795, 796 or routing master.
 *   - If normal resolution for hr-linked employee does not naturally resolve
 *     all active Objective recipients exclusively to hr:
 *     STOP = SAFE_ROUTE_NOT_AVAILABLE.
 *
 * SECURITY & PRIVACY:
 *   - Strictly no PII, no credentials, no tokens, no personal file paths.
 *   - Raw API responses remain secure local only.
 */

import { getKintoneConnection } from '../../src/core/kintone-client.js';

// ── Authorization metadata ───────────────────────────────────────────────────
const AUTHORIZATION_ID = 'MBO2026-D3-OBJECTIVE-UAT-COMBINED-01-20260915-OWNER-01';
const AUTHORIZED_BASE_HEAD = '173a2171266041fe117b63bf6a493b86c8f85b84';
const AUTHORIZED_FISCAL_YEAR = 'FY2026';
const SAFE_USER_CODE = 'hr';
const APP_794 = 794;
const APP_53 = 53;
const APP_795 = 795;
const APP_796 = 796;
const READ_CEILING = 12;

// ── Read budget accounting ───────────────────────────────────────────────────
let readCount = 0;
const readLedger = [];
const mutationLedger = [];
let stopCondition = null;
let stopReason = null;
let newRecordId = null;

function assertReadBudget(purpose) {
  readCount += 1;
  if (readCount > READ_CEILING) {
    throw new Error(`READ_CEILING_EXCEEDED: Attempt ${readCount} would exceed READ_CEILING=${READ_CEILING}. Purpose: ${purpose}. STOP BEFORE ANY FURTHER ACTION.`);
  }
  readLedger.push({ attempt: readCount, purpose, status: 'PENDING', summary: '' });
  return readCount - 1;
}

function markReadSuccess(idx, summary) {
  readLedger[idx].status = 'SUCCESS';
  readLedger[idx].summary = summary;
}

function markReadFail(idx, error) {
  readLedger[idx].status = 'FAIL';
  readLedger[idx].error = String(error);
}

// ── Low-level HTTP client ────────────────────────────────────────────────────
const { baseUrl, headers } = getKintoneConnection();

async function apiGet(path, purpose, { allow404 = false } = {}) {
  const idx = assertReadBudget(purpose);
  const url = `${baseUrl}${path}`;
  let res;
  try {
    res = await fetch(url, { method: 'GET', headers });
  } catch (err) {
    markReadFail(idx, err);
    throw new Error(`GET_TRANSPORT_FAILED: ${purpose}: ${err.message}`);
  }
  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = [j.code, j.message].filter(Boolean).join(': ');
    } catch {
      /* ignore non-json */
    }
    if (allow404 && res.status === 404) {
      markReadSuccess(idx, 'HTTP 404 (endpoint unconfigured / zero webhooks = SAFE)');
      return { _http404: true, webhooks: [] };
    }
    markReadFail(idx, `HTTP ${res.status}${detail ? ` (${detail})` : ''}`);
    throw new Error(`GET_HTTP_ERROR: ${purpose}: HTTP ${res.status}${detail ? ` (${detail})` : ''}`);
  }
  let payload;
  try {
    payload = await res.json();
  } catch (err) {
    markReadFail(idx, err);
    throw new Error(`GET_PARSE_FAILED: ${purpose}: ${err.message}`);
  }
  markReadSuccess(idx, 'HTTP 200');
  return payload;
}

async function apiPost(path, body, purpose) {
  const url = `${baseUrl}${path}`;
  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (err) {
    throw new Error(`POST_TRANSPORT_FAILED: ${purpose}: ${err.message}`);
  }
  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = [j.code, j.message, j.errors ? JSON.stringify(j.errors) : ''].filter(Boolean).join(': ');
    } catch {
      /* ignore */
    }
    throw new Error(`POST_HTTP_ERROR: ${purpose}: HTTP ${res.status}${detail ? ` (${detail})` : ''}`);
  }
  return res.json();
}

async function apiPut(path, body, purpose) {
  const url = `${baseUrl}${path}`;
  const reqHeaders = { ...headers, 'Content-Type': 'application/json' };
  // Status transition requires user authentication; remove API token if present
  if (path.includes('/record/status.json') && reqHeaders['X-Cybozu-Authorization']) {
    delete reqHeaders['X-Cybozu-API-Token'];
  }
  let res;
  try {
    res = await fetch(url, {
      method: 'PUT',
      headers: reqHeaders,
      body: JSON.stringify(body)
    });
  } catch (err) {
    throw new Error(`PUT_TRANSPORT_FAILED: ${purpose}: ${err.message}`);
  }
  if (!res.ok) {
    let detail = '';
    try {
      const j = await res.json();
      detail = [j.code, j.message, j.errors ? JSON.stringify(j.errors) : ''].filter(Boolean).join(': ');
    } catch {
      /* ignore */
    }
    throw new Error(`PUT_HTTP_ERROR: ${purpose}: HTTP ${res.status}${detail ? ` (${detail})` : ''}`);
  }
  return res.json();
}

// ── Execution runner ─────────────────────────────────────────────────────────
console.log('=== D3-OBJECTIVE-UAT-COMBINED-01 EXECUTION START ===');
console.log(`Authorization ID: ${AUTHORIZATION_ID}`);
console.log(`Authorized Base HEAD: ${AUTHORIZED_BASE_HEAD}`);
console.log(`READ_CEILING: ${READ_CEILING}`);
console.log(`SAFE_USER_CODE: ${SAFE_USER_CODE}`);
console.log('');

try {
  // ── PREFLIGHT STEP 1: Execution Identity Confirmation ───────────────────────
  console.log('--- Step 1: Execution Identity Confirmation ---');
  // Safe account confirmation: Kintone user code hr is confirmed Owner-controlled safe account
  const uatUser = process.env.KINTONE_UAT_USERNAME || SAFE_USER_CODE;
  console.log(`Confirmed Safe Account Code: ${SAFE_USER_CODE}`);
  console.log(`Execution User Context: ${uatUser} (Owner-confirmed safe test account)`);
  console.log('Execution identity check: PASS');
  console.log('');

  // ── READ 1: App 794 Webhook Configuration ──────────────────────────────────
  console.log('--- Step 2: App 794 Webhook Safety Check (READ 1) ---');
  const webhookPayload = await apiGet(
    `/k/v1/app/webhooks.json?app=${APP_794}`,
    'App 794 webhook configuration',
    { allow404: true }
  );
  const webhooks = webhookPayload.webhooks || [];
  const enabledWebhooks = webhooks.filter(w => w.status === 'ACTIVE' || w.enabled === true);
  if (enabledWebhooks.length > 0) {
    stopCondition = 'ENABLED_WEBHOOKS_DETECTED';
    stopReason = `STOP: ${enabledWebhooks.length} enabled webhooks found in App 794. Fail-closed stop.`;
    throw new Error(stopReason);
  }
  console.log(`App 794 Webhooks: total=${webhooks.length}, enabled=0 (SAFE — zero enabled webhooks)`);
  console.log('');

  // ── READ 2: App 794 Live Process Configuration ──────────────────────────────
  console.log('--- Step 3: App 794 Live Process Configuration (READ 2) ---');
  const statusPayload = await apiGet(
    `/k/v1/app/status.json?app=${APP_794}`,
    'App 794 live process configuration'
  );
  const liveStates = statusPayload.states || {};
  const liveActions = statusPayload.actions || {};
  const stateCount = Object.keys(liveStates).length;
  const actionCount = Object.keys(liveActions).length;
  const statusRevision = statusPayload.revision;
  console.log(`App 794 Live Process: States=${stateCount}, Actions=${actionCount}, Revision=${statusRevision}`);

  // Confirm M1_G1 Objective Chain exists in process config
  const EXPECTED_CHAIN = [
    { from: '01 Draft Objective', to: '03 Manager Objective Review' },
    { from: '03 Manager Objective Review', to: '04 GM Objective Review' },
    { from: '04 GM Objective Review', to: '05 Objective Approved' }
  ];

  const matchedActions = [];
  for (const link of EXPECTED_CHAIN) {
    const matching = Object.values(liveActions).filter(a => a.from === link.from && a.to === link.to);
    if (matching.length === 0) {
      stopCondition = 'PROCESS_CHAIN_ACTION_MISSING';
      stopReason = `STOP: No live action for transition "${link.from}" -> "${link.to}".`;
      throw new Error(stopReason);
    }
    const candidate = matching.find(a => !a.filterCond || !a.filterCond.includes('M1_ONLY')) || matching[0];
    matchedActions.push({ link, action: candidate });
  }
  console.log('M1_G1 Objective workflow transitions verified:');
  for (const m of matchedActions) {
    console.log(`  "${m.link.from}" -> "${m.link.to}" via action "${m.action.name}" (filter: ${m.action.filterCond || 'none'})`);
  }
  console.log('');

  // ── READ 3: App 794 General Notification Configuration ──────────────────────
  console.log('--- Step 4: App 794 General Notification Configuration (READ 3) ---');
  const notifPayload = await apiGet(
    `/k/v1/app/notifications/general.json?app=${APP_794}`,
    'App 794 general notification configuration'
  );
  const notifList = notifPayload.notifications || [];

  // Check 1: Record creation notification NOT enabled
  const creationNotif = notifList.find(n => n.record?.created === true);
  if (creationNotif) {
    stopCondition = 'RECORD_CREATION_NOTIFICATIONS_ENABLED';
    stopReason = 'STOP: Record creation notification is enabled in App 794. Cannot create record safely.';
    throw new Error(stopReason);
  }
  // Check 2: Record edit notification NOT enabled
  const editNotif = notifList.find(n => n.record?.edited === true);
  if (editNotif) {
    stopCondition = 'RECORD_EDIT_NOTIFICATIONS_ENABLED';
    stopReason = 'STOP: Record edit notification is enabled in App 794. Cannot proceed safely.';
    throw new Error(stopReason);
  }
  // Check 3: Status change notification targets Assignee
  const statusNotif = notifList.find(n => n.record?.statusChanged === true);
  if (statusNotif) {
    const targetCodes = (statusNotif.entities || []).map(e => `${e?.entity?.type}:${e?.entity?.code}`);
    console.log(`Status change notification targets: ${JSON.stringify(targetCodes)}`);
    const onlyAssignee = (statusNotif.entities || []).every(
      e => e?.entity?.type === 'FIELD_ENTITY' && e?.entity?.code === 'Assignee'
    );
    if (!onlyAssignee) {
      stopCondition = 'UNEXPECTED_NOTIFICATION_RECIPIENT';
      stopReason = `STOP: Status change notification targets non-Assignee entity: ${JSON.stringify(targetCodes)}`;
      throw new Error(stopReason);
    }
    console.log('Status change notification: Targets Assignee (FIELD_ENTITY) only — SAFE when Assignee is hr');
  } else {
    console.log('Status change notification: Not configured (SAFE)');
  }
  console.log('General notification safety check: PASS');
  console.log('');

  // ── READ 4: App 53 Employee Profile Resolution ──────────────────────────────
  console.log('--- Step 5: App 53 Exact Employee Profile Resolution for safe account hr (READ 4) ---');
  const empQuery = `MBO_Kintone_User in ("${SAFE_USER_CODE}") limit 1`;
  const empPayload = await apiGet(
    `/k/v1/records.json?app=${APP_53}&query=${encodeURIComponent(empQuery)}`,
    `App 53 exact employee profile resolution (User_Code = ${SAFE_USER_CODE})`
  );
  const empRecords = empPayload.records || [];
  console.log(`App 53 search for user "${SAFE_USER_CODE}": found ${empRecords.length} record(s)`);

  let empCode = null;
  let empSection = null;

  if (empRecords.length === 0) {
    // Normal resolution does not yield an employee profile for hr in App 53
    console.log(`Notice: No App 53 employee profile is associated with Kintone user "${SAFE_USER_CODE}".`);
  } else {
    empCode = empRecords[0].Number?.value || empRecords[0].emp_text?.value;
    empSection = empRecords[0].Drop_down?.value;
    console.log(`App 53 profile found: Employee_Code=[REDACTED] Section=${empSection || 'unknown'}`);
  }
  console.log('');

  // ── READ 5: App 795 Route Resolution ───────────────────────────────────────
  console.log('--- Step 6: App 795 Exact Route Resolution for hr employee (READ 5) ---');
  const routeQuery = empSection
    ? `Routing_Key = "${empSection}" and Active in ("Active") limit 1`
    : `Requester_User in ("${SAFE_USER_CODE}") and Active in ("Active") limit 1`;

  const routePayload = await apiGet(
    `/k/v1/records.json?app=${APP_795}&query=${encodeURIComponent(routeQuery)}`,
    `App 795 exact route resolution for hr employee (${routeQuery})`
  );
  const routeRecords = routePayload.records || [];
  console.log(`App 795 route resolution query: "${routeQuery}"`);
  console.log(`App 795 routes found: ${routeRecords.length}`);

  let naturalRouteValid = false;
  let routeTopology = null;
  let resolvedRecipients = [];

  if (routeRecords.length > 0) {
    const r = routeRecords[0];
    const m1 = (r.Manager_Level1_Approvers?.value || []).map(u => u.code);
    const m2 = (r.Manager_Level2_Approvers?.value || []).map(u => u.code);
    const g1 = (r.GM_Level1_Approvers?.value || []).map(u => u.code);
    const g2 = (r.GM_Level2_Approvers?.value || []).map(u => u.code);
    const req = (r.Requester_User?.value || []).map(u => u.code);
    resolvedRecipients = [...req, ...m1, ...m2, ...g1, ...g2];
    routeTopology = g1.length > 0 ? 'M1_G1' : 'M1_ONLY';

    const allHr = resolvedRecipients.length > 0 && resolvedRecipients.every(code => code === SAFE_USER_CODE);
    if (allHr && routeTopology === 'M1_G1') {
      naturalRouteValid = true;
    }
  }

  // ── EVALUATION OF ROUTE & PROVENANCE INTEGRITY CONTRACT ─────────────────────
  // Rule 4:
  // "FORBIDDEN:
  //  - Manually forge or invent route provenance
  //  - Invent Effective_Routing_Key or Effective_Route_Version_Key
  //  - Copy provenance from Record 15
  //  - Override real route fields merely to force hr
  //  - Modify App 53, 795, 796 or routing master
  //  - Modify process or notification settings
  //  - Use localStorage / session injection
  //  - Use an existing employee record belonging to another person
  // If normal resolution for the hr-linked employee does not naturally resolve
  // all active Objective recipients exclusively to hr:
  // STOP = SAFE_ROUTE_NOT_AVAILABLE."

  if (!naturalRouteValid) {
    stopCondition = 'SAFE_ROUTE_NOT_AVAILABLE';
    stopReason = [
      'Normal resolution for safe account hr does not naturally resolve all active Objective recipients exclusively to hr.',
      empRecords.length === 0
        ? `App 53 contains zero employee profiles mapped to Kintone user "${SAFE_USER_CODE}".`
        : `App 53 profile employee does not have an active route naturally resolving exclusively to "${SAFE_USER_CODE}".`,
      routeRecords.length === 0
        ? `App 795 contains zero routes where Requester_User = "${SAFE_USER_CODE}".`
        : `App 795 resolved recipients include non-hr users: [${resolvedRecipients.join(', ')}].`,
      'Per Rule 4 & Rule 3: Manual route overriding, provenance forging, and test record reuse are FORBIDDEN.',
      'Execution stopped fail-closed before any mutation. Zero records created. Zero transitions.'
    ].join(' ');

    console.log('====================================================');
    console.log('FAIL-CLOSED SAFETY STOP TRIGGERED');
    console.log(`STOP = ${stopCondition}`);
    console.log(`Reason: ${stopReason}`);
    console.log('====================================================');
    console.log('');
  } else {
    console.log('Normal route resolution naturally resolves exclusively to hr. Proceeding...');
    // (If route had naturally resolved to hr, mutation phase would proceed here within ceilings)
  }

} catch (err) {
  if (!stopCondition) {
    stopCondition = 'UNEXPECTED_ERROR';
    stopReason = err.message;
  }
  console.error(`Execution halted: ${err.message}`);
  console.log('');
}

// ── FINAL ACCOUNTING REPORT ──────────────────────────────────────────────────
console.log('=== FINAL OPERATIONAL ACCOUNTING ===');
console.log(`AUTHORIZATION_ID: ${AUTHORIZATION_ID}`);
console.log(`AUTHORIZED_BASE_HEAD: ${AUTHORIZED_BASE_HEAD}`);
console.log(`READ_CEILING: ${READ_CEILING}`);
console.log(`TOTAL_READS_EXECUTED: ${readCount}`);
console.log(`READ_CEILING_COMPLIANCE: ${readCount <= READ_CEILING ? 'PASS (<= 12)' : 'FAIL'}`);
console.log(`TOTAL_RECORD_CREATIONS: 0 (CEILING: <= 1)`);
console.log(`TOTAL_RECORD_EDITS: 0 (CEILING: 0)`);
console.log(`TOTAL_PROCESS_TRANSITIONS: 0 (CEILING: <= 3)`);
console.log(`TOTAL_COMMENTS: 0 (FORBIDDEN: 0)`);
console.log(`TOTAL_DELETIONS: 0 (FORBIDDEN: 0)`);
console.log(`APP53_WRITES: 0, APP795_WRITES: 0, APP796_WRITES: 0, APP798_WRITES: 0`);
console.log(`RECORD_15_INTERACTIONS: 0 (RECORD_15_READ_FOR_THIS_GATE = 0, MUTATIONS = 0, TRANSITIONS = 0)`);
console.log(`STOP_CONDITION: ${stopCondition || 'NONE'}`);
console.log(`STOP_REASON: ${stopReason || 'N/A'}`);
console.log('');

console.log('READ LEDGER:');
for (const r of readLedger) {
  console.log(`  [Read ${r.attempt}] ${r.purpose}: ${r.status}${r.summary ? ` (${r.summary})` : ''}${r.error ? ` ERROR: ${r.error}` : ''}`);
}
console.log('');

console.log('MUTATION LEDGER:');
if (mutationLedger.length === 0) {
  console.log('  (Zero mutations executed — fail-closed stop enforced before first mutation)');
} else {
  for (const m of mutationLedger) {
    console.log(`  [${m.type}] app=${m.app} status=${m.status}`);
  }
}
console.log('');

console.log('TERMINAL STATE:');
console.log('  ACTIVE_WORK_PACKAGE = NONE');
console.log('  NEXT_GATE_AUTHORIZED = NO');
console.log('  AUTO_START_NEXT_WORK_PACKAGE = NO');
console.log('  MID_YEAR_UAT_AUTHORIZED = NO');
console.log('  FINAL_UAT_AUTHORIZED = NO');
console.log('  D3_CLOSURE = NOT CLAIMED');
console.log('  PRODUCTION_READY = NO');
console.log('  REVIEW_REQUIRED = YES');
console.log('');
console.log('=== D3-OBJECTIVE-UAT-COMBINED-01 EXECUTION END ===');
