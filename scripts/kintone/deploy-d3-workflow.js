/**
 * D3 Process Management Deployment Guard & Executor
 *
 * Target App: 794
 * Target Process: Exactly 19 States / 40 Actions
 *
 * Uses canonical buildD3WorkflowPayload from build-d3-workflow-payload.js.
 * Requires fail-closed sandbox write guard authorization at the write boundary.
 *
 * Safe on import: zero network calls, zero file I/O, zero side effects.
 */

import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildD3WorkflowPayload,
  buildD3WorkflowDefinition
} from './build-d3-workflow-payload.js';

import { validateWorkflowPayloadStructure } from '../../src/core/workflow-validator.js';

import {
  assertD3App794ProcessDeployAuthorization,
  D3_APP794_PROCESS_DEPLOY_STAGE,
  D3_APP794_PROCESS_DEPLOY_OPERATION,
  D3_APP794_PROCESS_DEPLOY_WORK_PACKAGE,
  D3_APP794_PROCESS_TARGET_APP,
  PROTECTED_APP_IDS
} from '../../src/core/sandbox-write-guard.js';

export const D3_EXPECTED_STATE_COUNT = 19;
export const D3_EXPECTED_ACTION_COUNT = 40;

export const REQUIRED_ASSIGNEE_FIELDS = Object.freeze([
  'Requester_User',
  'Manager_Level2_Approvers',
  'Manager_Level1_Approvers',
  'GM_Level1_Approvers',
  'GM_Level2_Approvers'
]);

export const VALID_ASSIGNEE_FIELD_TYPES = Object.freeze(
  new Set(['USER_SELECT', 'GROUP_SELECT', 'ORGANIZATION_SELECT', 'CREATOR', 'MODIFIER'])
);

export const VALID_TOPOLOGY_FIELD_TYPES = Object.freeze(
  new Set(['DROP_DOWN', 'RADIO_BUTTON', 'SINGLE_LINE_TEXT'])
);

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

/**
 * Normalizes process semantics deterministically for comparison and fingerprinting.
 * Ignores transport metadata and revisions; extracts enable, states, and actions.
 */
export function normalizeProcessSemantics(processDef) {
  if (!processDef || typeof processDef !== 'object') {
    throw new Error('normalizeProcessSemantics: Invalid process definition object.');
  }

  const enable = Boolean(processDef.enable);

  const rawStates = processDef.states || {};
  const normalizedStates = {};

  // Sort state keys
  const sortedStateKeys = Object.keys(rawStates).sort();
  for (const key of sortedStateKeys) {
    const s = rawStates[key] || {};
    const entities = Array.isArray(s.assignee?.entities)
      ? s.assignee.entities.map((e) => ({
          type: e.entity?.type || e.type || '',
          code: e.entity?.code || e.code || ''
        })).sort((a, b) => `${a.type}:${a.code}`.localeCompare(`${b.type}:${b.code}`))
      : [];

    normalizedStates[key] = {
      name: String(s.name ?? key),
      index: String(s.index ?? ''),
      assignee: {
        type: String(s.assignee?.type ?? 'ONE'),
        entities
      }
    };
  }

  const rawActions = Array.isArray(processDef.actions) ? processDef.actions : [];
  const normalizedActions = rawActions.map((a) => ({
    name: String(a.name ?? ''),
    from: String(a.from ?? ''),
    to: String(a.to ?? ''),
    filterCond: String(a.filterCond ?? '')
  })).sort((a, b) => {
    const keyA = `${a.from} -> ${a.to} : ${a.name} : ${a.filterCond}`;
    const keyB = `${b.from} -> ${b.to} : ${b.name} : ${b.filterCond}`;
    return keyA.localeCompare(keyB);
  });

  return {
    enable,
    states: normalizedStates,
    actions: normalizedActions
  };
}

/**
 * Computes deterministic SHA-256 fingerprint of normalized process definition.
 */
export function computeProcessSemanticFingerprint(processDef) {
  const normalized = normalizeProcessSemantics(processDef);
  return crypto.createHash('sha256').update(JSON.stringify(normalized), 'utf8').digest('hex');
}

/**
 * Produces semantic diff between current and target process definitions.
 */
export function computeProcessSemanticDiff(currentDef, targetDef) {
  const currentNorm = normalizeProcessSemantics(currentDef);
  const targetNorm = normalizeProcessSemantics(targetDef);

  const currentStates = currentNorm.states;
  const targetStates = targetNorm.states;

  const currentKeys = new Set(Object.keys(currentStates));
  const targetKeys = new Set(Object.keys(targetStates));

  const statesAdded = Object.keys(targetStates).filter((k) => !currentKeys.has(k));
  const statesRemoved = Object.keys(currentStates).filter((k) => !targetKeys.has(k));
  const statesModified = Object.keys(targetStates).filter((k) => {
    if (!currentKeys.has(k)) return false;
    return JSON.stringify(targetStates[k]) !== JSON.stringify(currentStates[k]);
  });

  const currentActions = currentNorm.actions;
  const targetActions = targetNorm.actions;

  const currentActionSignatures = new Set(
    currentActions.map((a) => `${a.from} -> ${a.to} : ${a.name} : ${a.filterCond}`)
  );
  const targetActionSignatures = new Set(
    targetActions.map((a) => `${a.from} -> ${a.to} : ${a.name} : ${a.filterCond}`)
  );

  const actionsAdded = targetActions.filter(
    (a) => !currentActionSignatures.has(`${a.from} -> ${a.to} : ${a.name} : ${a.filterCond}`)
  );
  const actionsRemoved = currentActions.filter(
    (a) => !targetActionSignatures.has(`${a.from} -> ${a.to} : ${a.name} : ${a.filterCond}`)
  );

  const enableChanged = currentNorm.enable !== targetNorm.enable;

  return {
    enable: {
      current: currentNorm.enable,
      target: targetNorm.enable,
      changed: enableChanged
    },
    states: {
      currentCount: Object.keys(currentStates).length,
      targetCount: Object.keys(targetStates).length,
      added: statesAdded,
      removed: statesRemoved,
      modified: statesModified
    },
    actions: {
      currentCount: currentActions.length,
      targetCount: targetActions.length,
      added: actionsAdded,
      removed: actionsRemoved
    },
    hasChanges:
      enableChanged ||
      statesAdded.length > 0 ||
      statesRemoved.length > 0 ||
      statesModified.length > 0 ||
      actionsAdded.length > 0 ||
      actionsRemoved.length > 0
  };
}

/**
 * Validates preview App 794 field compatibility before process deployment.
 */
export function validatePreviewFieldCompatibility(fieldProperties) {
  if (!fieldProperties || typeof fieldProperties !== 'object') {
    throw new Error('FIELD_COMPATIBILITY_ERROR: Missing form fields property dictionary.');
  }

  const props = fieldProperties.properties || fieldProperties;

  for (const fieldCode of REQUIRED_ASSIGNEE_FIELDS) {
    const field = props[fieldCode];
    if (!field) {
      throw new Error(`FIELD_COMPATIBILITY_ERROR: Missing required assignee field '${fieldCode}'.`);
    }
    const type = field.type;
    if (!VALID_ASSIGNEE_FIELD_TYPES.has(type)) {
      throw new Error(
        `FIELD_COMPATIBILITY_ERROR: Assignee field '${fieldCode}' has invalid type '${type}'.`
      );
    }
  }

  const topologyField = props.Routing_Topology;
  if (!topologyField) {
    throw new Error("FIELD_COMPATIBILITY_ERROR: Missing required topology filter field 'Routing_Topology'.");
  }
  if (!VALID_TOPOLOGY_FIELD_TYPES.has(topologyField.type)) {
    throw new Error(
      `FIELD_COMPATIBILITY_ERROR: Routing_Topology field has invalid type '${topologyField.type}'.`
    );
  }

  return true;
}

const NON_SERVER_ERROR_CODES = new Set([
  'ECONNRESET',
  'ENOTFOUND',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EAI_AGAIN',
  'ERR_HTTP2_STREAM_ERROR',
  'ERR_INVALID_URL',
  'UND_ERR_CONNECT_TIMEOUT'
]);

/**
 * Sanitizes and formats safe diagnostic server metadata from a PUT preview error.
 * Preserves HTTP status, safe Kintone error code, and sanitized server message.
 * Strictly redacts credentials, headers, tokens, cookies, and secrets.
 * Returns generic failure when no safe server detail exists.
 */
export function formatSanitizedPutError(error) {
  const GENERIC_FAILURE = 'D3_PROCESS_PUT_FAILED: PUT preview process failed.';

  if (!error || (typeof error !== 'object' && typeof error !== 'string')) {
    return GENERIC_FAILURE;
  }

  // 1. Extract HTTP status if available
  let httpStatus = null;
  const rawStatus = error?.status ?? error?.statusCode ?? error?.response?.status;
  if (typeof rawStatus === 'number' && Number.isInteger(rawStatus) && rawStatus >= 100 && rawStatus <= 599) {
    httpStatus = rawStatus;
  } else if (typeof rawStatus === 'string' && /^[1-5]\d\d$/.test(rawStatus.trim())) {
    httpStatus = parseInt(rawStatus.trim(), 10);
  }

  // 2. Extract safe error code if available
  let safeCode = null;
  const rawCode =
    error?.code ??
    error?.response?.data?.code ??
    error?.data?.code ??
    error?.error?.code ??
    error?.kintoneCode;

  if (typeof rawCode === 'string') {
    const trimmedCode = rawCode.trim();
    if (
      !NON_SERVER_ERROR_CODES.has(trimmedCode) &&
      /^[A-Za-z0-9_.-]{2,64}$/.test(trimmedCode)
    ) {
      safeCode = trimmedCode;
    }
  }

  // 3. Extract and sanitize server message
  let safeMessage = null;
  const explicitServerMessage =
    error?.response?.data?.message ??
    error?.data?.message ??
    error?.error?.message ??
    error?.serverMessage;

  const rawMessage =
    explicitServerMessage ??
    (typeof error?.message === 'string' ? error.message : typeof error === 'string' ? error : null);

  if (typeof rawMessage === 'string' && rawMessage.trim()) {
    let msg = rawMessage.trim();

    // If HTTP status was not on an object property, check if message contains "HTTP <status>"
    if (!httpStatus) {
      const statusMatch = msg.match(/\bHTTP\s+([1-5]\d\d)\b/i);
      if (statusMatch) {
        httpStatus = parseInt(statusMatch[1], 10);
      }
    }

    // If error code was not on an object property, check if message contains typical Kintone code
    if (!safeCode) {
      const codeMatches = [...msg.matchAll(/\b([A-Z0-9_]{2,30})\b/g)];
      for (const m of codeMatches) {
        const candidate = m[1];
        if (
          candidate !== 'HTTP' &&
          candidate !== 'CODE' &&
          candidate !== 'MESSAGE' &&
          !NON_SERVER_ERROR_CODES.has(candidate) &&
          /^[A-Z][A-Z0-9_]+$/.test(candidate) &&
          /[0-9_]/.test(candidate)
        ) {
          safeCode = candidate;
          break;
        }
      }
    }

    // Sanitize: strip tokens, passwords, authorization, cookies, URLs, headers
    msg = msg
      .replace(/bearer\s+[a-zA-Z0-9_\-.]+/gi, 'Bearer [REDACTED]')
      .replace(/basic\s+[a-zA-Z0-9+/=]+/gi, 'Basic [REDACTED]')
      .replace(/(?:authorization|x-cybozu-[a-z0-9-]+)\s*[:=]\s*[^\s,;]+/gi, '$1: [REDACTED]')
      .replace(/(?:api[-_]?token|password|secret|cookie|session)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
      .replace(/https?:\/\/[^\s]+/gi, (url) => {
        try {
          const parsed = new URL(url);
          return `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
        } catch {
          return '[URL]';
        }
      })
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Cap length to 256 characters
    if (msg.length > 256) {
      msg = msg.slice(0, 253) + '...';
    }

    if (msg) {
      safeMessage = msg;
    }
  }

  // Determine whether any safe server detail exists
  const hasSafeDetail = Boolean(
    httpStatus ||
    safeCode ||
    explicitServerMessage
  );

  if (!hasSafeDetail) {
    return GENERIC_FAILURE;
  }

  const parts = [];
  if (httpStatus) {
    parts.push(`HTTP ${httpStatus}`);
  }
  if (safeCode) {
    parts.push(`CODE ${safeCode}`);
  }
  if (safeMessage) {
    parts.push(`MESSAGE ${safeMessage}`);
  }

  if (parts.length === 0) {
    return GENERIC_FAILURE;
  }

  return `D3_PROCESS_PUT_FAILED: ${parts.join(' / ')}`;
}

/**
 * Executes guarded D3 process management deployment.
 */
export async function executeD3ProcessDeploy({
  appId = 794,
  expectedSourceCommit,
  expectedPreviewRevision,
  expectedBaselineFingerprint,
  authConfig,
  transport,
  getGitHead,
  getGitStatus,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  maxDeployStatusChecks = 30,
  deployPollDelayMs = 2000
} = {}) {
  // 1. Mandatory expectedBaselineFingerprint validation BEFORE any transport I/O
  if (
    !expectedBaselineFingerprint ||
    typeof expectedBaselineFingerprint !== 'string' ||
    !/^[0-9a-f]{64}$/.test(expectedBaselineFingerprint.trim())
  ) {
    throw new Error(
      'EXPECTED_BASELINE_FINGERPRINT_REQUIRED: expectedBaselineFingerprint must be a 64-character lowercase hex SHA-256 string.'
    );
  }
  const normalizedExpectedBaselineFingerprint = expectedBaselineFingerprint.trim();

  // A. Local / App Guard
  if (PROTECTED_APP_IDS.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is a permanent PROTECTED PRODUCTION APP and cannot be modified.`);
  }

  if (Number(appId) !== D3_APP794_PROCESS_TARGET_APP) {
    throw new Error(`D3_PROCESS_DEPLOY_BLOCKED: Target App ID must be exactly ${D3_APP794_PROCESS_TARGET_APP} (got ${appId}).`);
  }

  if (!expectedSourceCommit || typeof expectedSourceCommit !== 'string' || !expectedSourceCommit.trim()) {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: expectedSourceCommit is required.');
  }

  if (typeof getGitStatus !== 'function') {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: getGitStatus resolver is required.');
  }
  const gitStatus = await getGitStatus();
  if (gitStatus && gitStatus.trim() !== '') {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: Dirty working tree detected before deploy.');
  }

  if (typeof getGitHead !== 'function') {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: getGitHead resolver is required.');
  }
  const currentHead = await getGitHead();
  if (!currentHead || currentHead.trim() !== expectedSourceCommit.trim()) {
    throw new Error(`D3_PROCESS_DEPLOY_BLOCKED: Git HEAD mismatch (expected ${expectedSourceCommit}, got ${currentHead}).`);
  }

  // Canonical Target Verification (Derived strictly from buildD3WorkflowPayload; no caller override permitted)
  const canonicalBuild = buildD3WorkflowPayload({ app: D3_APP794_PROCESS_TARGET_APP, revision: 1 });
  const canonicalDef = canonicalBuild.payload;
  const canonicalTargetFingerprint = computeProcessSemanticFingerprint(canonicalDef);
  const stateCount = Object.keys(canonicalDef?.states || {}).length;
  const actionCount = canonicalDef?.actions?.length || 0;

  if (stateCount !== D3_EXPECTED_STATE_COUNT || actionCount !== D3_EXPECTED_ACTION_COUNT) {
    throw new Error(
      `D3_PROCESS_DEPLOY_BLOCKED: Canonical D3 target must have ${D3_EXPECTED_STATE_COUNT} states and ${D3_EXPECTED_ACTION_COUNT} actions (got ${stateCount} states, ${actionCount} actions).`
    );
  }
  if (canonicalDef.enable !== true) {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: Canonical target must have enable=true.');
  }

  // B. Pre-Write Read Phase
  if (!transport || typeof transport.request !== 'function') {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: A valid transport with request() is required.');
  }

  const liveProcess = await transport.request({ method: 'GET', path: '/k/v1/app/status.json?app=794' });
  const previewProcess = await transport.request({ method: 'GET', path: '/k/v1/preview/app/status.json?app=794' });
  const formFields = await transport.request({ method: 'GET', path: '/k/v1/preview/app/form/fields.json?app=794' });

  const previewRevision = previewProcess?.revision;
  if (previewRevision === undefined || previewRevision === null || !/^[1-9]\d*$/.test(String(previewRevision).trim())) {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: Invalid preview process revision.');
  }

  if (expectedPreviewRevision !== undefined && String(expectedPreviewRevision).trim() !== String(previewRevision).trim()) {
    throw new Error(`D3_PROCESS_DEPLOY_BLOCKED: Process revision drift detected (expected ${expectedPreviewRevision}, observed ${previewRevision}).`);
  }

  // 1. D3 required-field compatibility validation
  validatePreviewFieldCompatibility(formFields);

  // 2. Build target payload strictly using observed preview revision
  const targetBuildWithRev = buildD3WorkflowPayload({
    app: D3_APP794_PROCESS_TARGET_APP,
    revision: String(previewRevision).trim()
  });
  const targetPayload = targetBuildWithRev.payload;

  // Semantic enforcement: target fingerprint must equal canonicalTargetFingerprint
  const actualTargetFingerprint = computeProcessSemanticFingerprint(targetPayload);
  if (actualTargetFingerprint !== canonicalTargetFingerprint) {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: Derived target process fingerprint does not match canonical D3 target.');
  }

  // 3. Structural workflow validation using pure validateWorkflowPayloadStructure
  const props = formFields?.properties || formFields || {};
  const fieldTypes = {};
  for (const [code, def] of Object.entries(props)) {
    fieldTypes[code] = def?.type;
  }
  validateWorkflowPayloadStructure(targetPayload, fieldTypes);

  // 4. Baseline fingerprint verification against mandatory expectedBaselineFingerprint
  const liveFingerprint = computeProcessSemanticFingerprint(liveProcess);
  const previewFingerprint = computeProcessSemanticFingerprint(previewProcess);

  if (liveFingerprint !== normalizedExpectedBaselineFingerprint) {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: Live process baseline fingerprint mismatch.');
  }

  if (previewFingerprint !== normalizedExpectedBaselineFingerprint) {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: Preview process baseline fingerprint mismatch.');
  }

  if (liveFingerprint !== previewFingerprint) {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: Live and preview baseline process definitions are drifted.');
  }

  // C. Backup & Semantic Diff
  const prewriteBackup = {
    timestamp: new Date().toISOString(),
    liveFingerprint,
    previewFingerprint,
    liveProcess: clone(liveProcess),
    previewProcess: clone(previewProcess)
  };

  const semanticDiff = computeProcessSemanticDiff(previewProcess, targetPayload);
  if (
    semanticDiff.states.targetCount !== D3_EXPECTED_STATE_COUNT ||
    semanticDiff.actions.targetCount !== D3_EXPECTED_ACTION_COUNT
  ) {
    throw new Error('D3_PROCESS_DEPLOY_BLOCKED: Target process in diff must be 19 states and 40 actions.');
  }

  // D. Authorization Write Boundary (Consumed strictly here, immediately before the first write)
  assertD3App794ProcessDeployAuthorization(authConfig, {
    appId: D3_APP794_PROCESS_TARGET_APP,
    workPackageId: D3_APP794_PROCESS_DEPLOY_WORK_PACKAGE,
    stage: D3_APP794_PROCESS_DEPLOY_STAGE,
    operation: D3_APP794_PROCESS_DEPLOY_OPERATION,
    expectedStateCount: D3_EXPECTED_STATE_COUNT,
    expectedActionCount: D3_EXPECTED_ACTION_COUNT
  });

  // E. Future Write Sequence
  // 1. PUT preview process target
  let putResponse;
  try {
    putResponse = await transport.request({
      method: 'PUT',
      path: '/k/v1/preview/app/status.json',
      body: targetPayload
    });
  } catch (putError) {
    const sanitizedError = formatSanitizedPutError(putError);
    throw new Error(sanitizedError);
  }

  if (!putResponse || typeof putResponse !== 'object' || !putResponse.revision || !/^[1-9]\d*$/.test(String(putResponse.revision).trim())) {
    throw new Error('D3_PROCESS_PUT_UNCERTAIN: PUT preview process returned uncertain or invalid revision.');
  }

  const stagedRevision = String(putResponse.revision).trim();

  // 2. GET preview process read-back
  const previewReadback = await transport.request({
    method: 'GET',
    path: '/k/v1/preview/app/status.json?app=794'
  });

  const targetFingerprint = canonicalTargetFingerprint;
  const readbackFingerprint = computeProcessSemanticFingerprint(previewReadback);

  if (targetFingerprint !== readbackFingerprint) {
    throw new Error('D3_PREVIEW_READBACK_MISMATCH: Preview process read-back does not match canonical 19/40 target.');
  }

  // 3. POST App794 deployment
  let deployResponse;
  try {
    deployResponse = await transport.request({
      method: 'POST',
      path: '/k/v1/preview/app/deploy.json',
      body: {
        apps: [{ app: D3_APP794_PROCESS_TARGET_APP, revision: stagedRevision }]
      }
    });
  } catch {
    throw new Error('D3_DEPLOY_POST_FAILED: Deploy POST transport failed.');
  }

  if (
    !deployResponse ||
    typeof deployResponse !== 'object' ||
    Array.isArray(deployResponse)
  ) {
    throw new Error('D3_DEPLOY_POST_UNCERTAIN: Deploy POST returned null, primitive, or malformed result.');
  }

  if (deployResponse.status && deployResponse.status >= 400) {
    throw new Error('D3_DEPLOY_POST_FAILED: Deploy POST returned error status.');
  }

  // 4. Poll deployment status
  let finalDeployStatus = null;
  for (let check = 0; check < maxDeployStatusChecks; check += 1) {
    let statusResponse;
    try {
      statusResponse = await transport.request({
        method: 'GET',
        path: '/k/v1/preview/app/deploy.json?apps[0]=794'
      });
    } catch {
      throw new Error('D3_DEPLOY_STATUS_READ_ERROR: Failed to read deployment status.');
    }

    const exactApp = statusResponse?.apps?.find((entry) => Number(entry.app) === D3_APP794_PROCESS_TARGET_APP);
    if (!exactApp || !['PROCESSING', 'SUCCESS', 'FAIL', 'CANCEL'].includes(exactApp.status)) {
      throw new Error('D3_DEPLOY_STATUS_MALFORMED: Missing or invalid exact-App deploy status.');
    }

    finalDeployStatus = exactApp.status;
    if (finalDeployStatus === 'SUCCESS') break;

    if (finalDeployStatus === 'FAIL' || finalDeployStatus === 'CANCEL') {
      throw new Error(`D3_DEPLOY_TERMINAL_FAIL: Deploy for App ${D3_APP794_PROCESS_TARGET_APP} reached terminal status ${finalDeployStatus}.`);
    }

    if (check < maxDeployStatusChecks - 1) {
      await sleep(deployPollDelayMs);
    }
  }

  if (finalDeployStatus !== 'SUCCESS') {
    throw new Error(
      `D3_DEPLOY_POLL_TIMEOUT: Deploy status polling timed out after ${maxDeployStatusChecks} checks (last status: ${finalDeployStatus ?? 'UNKNOWN'}).`
    );
  }

  // 5. GET final live process and enforce convergence
  const finalLiveProcess = await transport.request({
    method: 'GET',
    path: '/k/v1/app/status.json?app=794'
  });
  const finalLiveFingerprint = computeProcessSemanticFingerprint(finalLiveProcess);

  if (finalLiveFingerprint !== targetFingerprint) {
    throw new Error('D3_FINAL_LIVE_READBACK_MISMATCH: Live process read-back does not match canonical 19/40 target.');
  }

  // 6. GET final preview process and enforce convergence
  const finalPreviewProcess = await transport.request({
    method: 'GET',
    path: '/k/v1/preview/app/status.json?app=794'
  });
  const finalPreviewFingerprint = computeProcessSemanticFingerprint(finalPreviewProcess);

  if (finalPreviewFingerprint !== targetFingerprint) {
    throw new Error('D3_FINAL_PREVIEW_READBACK_MISMATCH: Final preview process read-back does not match canonical 19/40 target.');
  }

  return {
    success: true,
    appId: D3_APP794_PROCESS_TARGET_APP,
    targetStateCount: D3_EXPECTED_STATE_COUNT,
    targetActionCount: D3_EXPECTED_ACTION_COUNT,
    prewriteBackup,
    semanticDiff,
    stagedRevision,
    finalLiveRevision: finalLiveProcess?.revision,
    finalLiveFingerprint,
    finalPreviewRevision: finalPreviewProcess?.revision,
    finalPreviewFingerprint
  };
}
