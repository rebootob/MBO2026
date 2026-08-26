import sandboxRegistry from '../../config/sandbox-apps.json' with { type: 'json' };
import { CONFIG_LIFECYCLE_STATUS } from '../profiles/scoring-config-master.js';

export const DISCOVERY_MODE = true;

/**
 * Permanent Corporate Protected / Reference App IDs (MUST NEVER BE WRITTEN TO UNDER ANY CIRCUMSTANCES)
 */
export const PROTECTED_APP_IDS = Object.freeze([
  53, 283, 305, 307, 310, 640, 643, 715, 716
]);

/**
 * Default Work Package Write Allow-List.
 * Under standard / quiescent state, WRITE_ALLOWED_APPS is strictly EMPTY (default-deny).
 */
export const WRITE_ALLOWED_APPS = Object.freeze([]);

export const WP002C_APP_CREATE_WORK_PACKAGE = 'MBO-P03-WP-002C';
export const WP002C_APPROVED_APP_NAME = 'MBO Profile & Scoring Configuration Master [Sandbox]';

// Stage-1 process-local replay protection. Deliberately module-private:
// normal callers cannot clear or pre-mark this registry.
const consumedAppCreationAuthorizationIds = new Set();
const consumedLiveActivationAuthorizationIds = new Set();
const consumedSchemaAuthorizationIds = new Set();
const consumedDropdownRepairAuthorizationIds = new Set();
const consumedSupersessionAuthorizationIds = new Set();

export const WP002C_LIVE_ACTIVATION_STAGE = 'STAGE_3A_LIVE_ACTIVATION';
export const WP002C_SCHEMA_CONFIGURATION_STAGE = 'STAGE_3C_SCHEMA_CONFIGURATION';
export const WP002C_SCHEMA_CONTRACT_ID = 'WP002C_23_FIELDS_V1';
export const WP002C_SCHEMA_REPAIR_STAGE = 'STAGE_3C_DROPDOWN_REPAIR';
export const WP002C_SCHEMA_REPAIR_CONTRACT_ID = 'WP002C_2_DROPDOWN_REPAIR_V1';
export const WP002C_SUPERSEDE_STAGE = 'STAGE_4D_SUPERSEDE_AND_PUBLISH';
export const WP002C_SUPERSEDE_CONTRACT_ID = 'WP002C_SUPERSEDE_V1';
export const WP002C_SCORING_MASTER_APP_ID = 796;

/**
 * Backwards compatibility: WRITE_BLOCKED_APP_IDS includes all protected apps + any app not in allow-list
 */
export const WRITE_BLOCKED_APP_IDS = Object.freeze([
  ...PROTECTED_APP_IDS, 794, 795
]);

export function assertDiscoveryReadOnly(method = 'GET', appId) {
  if (DISCOVERY_MODE && method.toUpperCase() !== 'GET') {
    throw new Error(`DISCOVERY PHASE WRITE BLOCKED: Method ${method} is blocked during Discovery & Architecture Design Phase for App ${appId || 'ALL'}.`);
  }
}

export function getSandboxAppIds(registry = sandboxRegistry) {
  return [
    registry.mboV2AppId,
    registry.routingMasterAppId,
    registry.scoringConfigMasterAppId,
    registry.hoshinMasterAppId,
    registry.revisionArchiveAppId,
    registry.hrControlCenterAppId
  ].filter((appId) => Number.isInteger(appId) && appId > 0);
}

/**
 * Assert whether a write operation (POST, PUT, DELETE) is authorized for a given target app.
 * Protected legacy apps (53, 283, 305, 307, 310, 640, 643, 715, 716) can NEVER be written to under any circumstances.
 */
export function assertSandboxWriteTarget(appId, registry = sandboxRegistry, allowList = WRITE_ALLOWED_APPS, options = {}) {
  if (!Number.isInteger(appId) || appId <= 0) {
    throw new Error('WRITE BLOCKED: Target application ID must be a positive integer.');
  }

  // Absolute invariant: Protected apps are NEVER writable under any circumstances (Hard Block overrides allow-list)
  if (PROTECTED_APP_IDS.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is a permanent PROTECTED PRODUCTION APP and cannot be modified.`);
  }

  if (DISCOVERY_MODE && !options.dryRunBypassDiscovery) {
    throw new Error('DISCOVERY PHASE WRITE BLOCKED: All Kintone write operations are locked during Architecture Discovery Phase.');
  }

  // Fail-closed: allowList must be a valid array
  if (!Array.isArray(allowList) || allowList.length === 0) {
    throw new Error(`WRITE BLOCKED: Empty or missing write allow-list denies write operation for App ${appId}.`);
  }

  // Work Package Allow-List enforcement
  if (!allowList.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is not in the active Work Package write allow-list (allow-list: [${allowList.join(', ')}]).`);
  }

  if (!getSandboxAppIds(registry).includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is not registered as an MBO2026 Sandbox App.`);
  }

  return appId;
}

/**
 * Narrow pre-ID authorization for exactly one future WP-002C app creation.
 * This is validation only: it neither changes Discovery Mode nor performs I/O.
 */
export function assertAppCreationAuthorization(authConfig, requestConfig) {
  if (!authConfig || typeof authConfig !== 'object' || !requestConfig || typeof requestConfig !== 'object') {
    throw new Error('APP CREATE BLOCKED (FAIL-CLOSED): Missing or corrupted authorization/request configuration.');
  }

  const authorizationId = authConfig.authorizationId;
  if (authConfig.workPackageId !== WP002C_APP_CREATE_WORK_PACKAGE || requestConfig.workPackageId !== WP002C_APP_CREATE_WORK_PACKAGE) {
    throw new Error('APP CREATE BLOCKED: Work package must be exactly MBO-P03-WP-002C.');
  }
  if (requestConfig.operation !== 'APP_CREATE') {
    throw new Error('APP CREATE BLOCKED: Operation must be exactly APP_CREATE.');
  }
  if (authConfig.activeWindow !== true) {
    throw new Error('APP CREATE BLOCKED: One-time write window is CLOSED.');
  }
  if (authConfig.explicitUserAuthorization !== true) {
    throw new Error('APP CREATE BLOCKED: Explicit user authorization is required.');
  }
  if (typeof authorizationId !== 'string' || authorizationId.trim() === '') {
    throw new Error('APP CREATE BLOCKED: A non-empty single-use authorization identifier is required.');
  }
  if (authConfig.authorizationConsumed === true || authConfig.authorizationUsed === true) {
    throw new Error('APP CREATE BLOCKED: Single-use authorization has already been consumed.');
  }
  if (consumedAppCreationAuthorizationIds.has(authorizationId)) {
    throw new Error('APP CREATE BLOCKED: Authorization has already been consumed.');
  }
  if (authConfig.authorizedAppName !== WP002C_APPROVED_APP_NAME || requestConfig.requestedAppName !== WP002C_APPROVED_APP_NAME) {
    throw new Error('APP CREATE BLOCKED: App name must exactly match the approved WP-002C target.');
  }

  const changes = requestConfig.manifest?.expectedChanges;
  if (!Array.isArray(changes) || changes.length !== 1) {
    throw new Error('APP CREATE BLOCKED: Manifest must authorize exactly one app creation.');
  }
  const [change] = changes;
  if (!change || typeof change !== 'object' || change.operation !== 'APP_CREATE' || change.appName !== WP002C_APPROVED_APP_NAME) {
    throw new Error('APP CREATE BLOCKED: Manifest target must be exactly one approved APP_CREATE.');
  }

  consumedAppCreationAuthorizationIds.add(authorizationId);
  return true;
}

/**
 * Narrow authorization for the creator-only ACL -> deploy sequence on App 796.
 * This guard is process-local, single-use, and cannot authorize APP_CREATE,
 * schema, record, delete, or arbitrary-App operations.
 */
export function assertScoringMasterLiveActivationAuthorization(authConfig, requestConfig) {
  if (!authConfig || typeof authConfig !== 'object' || !requestConfig || typeof requestConfig !== 'object') {
    throw new Error('LIVE ACTIVATION BLOCKED (FAIL-CLOSED): Missing authorization/request configuration.');
  }
  if (authConfig.workPackageId !== WP002C_APP_CREATE_WORK_PACKAGE || requestConfig.workPackageId !== WP002C_APP_CREATE_WORK_PACKAGE) {
    throw new Error('LIVE ACTIVATION BLOCKED: Work package must be exactly MBO-P03-WP-002C.');
  }
  if (authConfig.stage !== WP002C_LIVE_ACTIVATION_STAGE || requestConfig.stage !== WP002C_LIVE_ACTIVATION_STAGE) {
    throw new Error('LIVE ACTIVATION BLOCKED: Stage must be exactly STAGE_3A_LIVE_ACTIVATION.');
  }
  if (requestConfig.appId !== WP002C_SCORING_MASTER_APP_ID) {
    throw new Error('LIVE ACTIVATION BLOCKED: Target App ID must be exactly 796.');
  }
  if (requestConfig.appName !== WP002C_APPROVED_APP_NAME) {
    throw new Error('LIVE ACTIVATION BLOCKED: Target App name mismatch.');
  }
  if (authConfig.explicitUserAuthorization !== true || authConfig.activeWindow !== true) {
    throw new Error('LIVE ACTIVATION BLOCKED: Explicit authorization and active window are required.');
  }
  if (typeof authConfig.authorizationId !== 'string' || authConfig.authorizationId.trim() === '') {
    throw new Error('LIVE ACTIVATION BLOCKED: A non-empty authorization ID is required.');
  }
  if (consumedLiveActivationAuthorizationIds.has(authConfig.authorizationId)) {
    throw new Error('LIVE ACTIVATION BLOCKED: Authorization has already been consumed.');
  }
  const expectedSequence = ['APP_ACL_PREVIEW_UPDATE', 'APP_DEPLOY'];
  if (!Array.isArray(requestConfig.operationSequence) || requestConfig.operationSequence.length !== expectedSequence.length || requestConfig.operationSequence.some((operation, index) => operation !== expectedSequence[index])) {
    throw new Error('LIVE ACTIVATION BLOCKED: Operation sequence must be APP_ACL_PREVIEW_UPDATE -> APP_DEPLOY.');
  }

  consumedLiveActivationAuthorizationIds.add(authConfig.authorizationId);
  return true;
}

/**
 * Narrow authorization for the 23-field schema configuration -> deploy sequence on App 796.
 * This guard is process-local, single-use, and cannot authorize APP_CREATE,
 * ACL, record, delete, or arbitrary-App operations.
 */

/**
 * Narrow authorization for the two-dropdown schema repair -> deploy sequence on App 796 (Stage 3C-R1).
 * This guard is process-local, single-use, and allows ONLY updating Part_A_Scoring_Mode and Config_Status options on App 796.
 */
export function assertScoringMasterDropdownRepairAuthorization(authConfig, requestConfig) {
  if (!authConfig || typeof authConfig !== 'object' || !requestConfig || typeof requestConfig !== 'object') {
    throw new Error('DROPDOWN REPAIR BLOCKED (FAIL-CLOSED): Missing authorization/request configuration.');
  }
  if (authConfig.workPackageId !== WP002C_APP_CREATE_WORK_PACKAGE || requestConfig.workPackageId !== WP002C_APP_CREATE_WORK_PACKAGE) {
    throw new Error('DROPDOWN REPAIR BLOCKED: Work package must be exactly MBO-P03-WP-002C.');
  }
  if (authConfig.stage !== WP002C_SCHEMA_REPAIR_STAGE || requestConfig.stage !== WP002C_SCHEMA_REPAIR_STAGE) {
    throw new Error('DROPDOWN REPAIR BLOCKED: Stage must be exactly STAGE_3C_DROPDOWN_REPAIR.');
  }
  if (requestConfig.appId !== WP002C_SCORING_MASTER_APP_ID) {
    throw new Error('DROPDOWN REPAIR BLOCKED: Target App ID must be exactly 796.');
  }
  if (requestConfig.appName !== WP002C_APPROVED_APP_NAME) {
    throw new Error('DROPDOWN REPAIR BLOCKED: Target App name mismatch.');
  }
  if (requestConfig.repairContractId !== WP002C_SCHEMA_REPAIR_CONTRACT_ID) {
    throw new Error('DROPDOWN REPAIR BLOCKED: Repair contract ID must be exactly WP002C_2_DROPDOWN_REPAIR_V1.');
  }
  if (authConfig.explicitUserAuthorization !== true || authConfig.activeWindow !== true) {
    throw new Error('DROPDOWN REPAIR BLOCKED: Explicit authorization and active window are required.');
  }
  if (typeof authConfig.authorizationId !== 'string' || authConfig.authorizationId.trim() === '') {
    throw new Error('DROPDOWN REPAIR BLOCKED: A non-empty authorization ID is required.');
  }
  if (consumedDropdownRepairAuthorizationIds.has(authConfig.authorizationId)) {
    throw new Error('DROPDOWN REPAIR BLOCKED: Authorization has already been consumed.');
  }
  const expectedSequence = ['FORM_FIELDS_UPDATE', 'APP_DEPLOY'];
  if (!Array.isArray(requestConfig.operationSequence) || requestConfig.operationSequence.length !== expectedSequence.length || requestConfig.operationSequence.some((operation, index) => operation !== expectedSequence[index])) {
    throw new Error('DROPDOWN REPAIR BLOCKED: Operation sequence must be FORM_FIELDS_UPDATE -> APP_DEPLOY.');
  }
  const expectedFieldCodes = ['Part_A_Scoring_Mode', 'Config_Status'];
  if (!Array.isArray(requestConfig.repairFieldCodes) || requestConfig.repairFieldCodes.length !== expectedFieldCodes.length || requestConfig.repairFieldCodes.some((code, index) => code !== expectedFieldCodes[index])) {
    throw new Error('DROPDOWN REPAIR BLOCKED: Repair field codes must be exactly [Part_A_Scoring_Mode, Config_Status].');
  }

  consumedDropdownRepairAuthorizationIds.add(authConfig.authorizationId);
  return true;
}

export function assertScoringMasterSchemaAuthorization(authConfig, requestConfig) {
  if (!authConfig || typeof authConfig !== 'object' || !requestConfig || typeof requestConfig !== 'object') {
    throw new Error('SCHEMA CONFIGURATION BLOCKED (FAIL-CLOSED): Missing authorization/request configuration.');
  }
  if (authConfig.workPackageId !== WP002C_APP_CREATE_WORK_PACKAGE || requestConfig.workPackageId !== WP002C_APP_CREATE_WORK_PACKAGE) {
    throw new Error('SCHEMA CONFIGURATION BLOCKED: Work package must be exactly MBO-P03-WP-002C.');
  }
  if (authConfig.stage !== WP002C_SCHEMA_CONFIGURATION_STAGE || requestConfig.stage !== WP002C_SCHEMA_CONFIGURATION_STAGE) {
    throw new Error('SCHEMA CONFIGURATION BLOCKED: Stage must be exactly STAGE_3C_SCHEMA_CONFIGURATION.');
  }
  if (requestConfig.appId !== WP002C_SCORING_MASTER_APP_ID) {
    throw new Error('SCHEMA CONFIGURATION BLOCKED: Target App ID must be exactly 796.');
  }
  if (requestConfig.appName !== WP002C_APPROVED_APP_NAME) {
    throw new Error('SCHEMA CONFIGURATION BLOCKED: Target App name mismatch.');
  }
  if (requestConfig.schemaContractId !== WP002C_SCHEMA_CONTRACT_ID) {
    throw new Error('SCHEMA CONFIGURATION BLOCKED: Schema contract ID must be exactly WP002C_23_FIELDS_V1.');
  }
  if (authConfig.explicitUserAuthorization !== true || authConfig.activeWindow !== true) {
    throw new Error('SCHEMA CONFIGURATION BLOCKED: Explicit authorization and active window are required.');
  }
  if (typeof authConfig.authorizationId !== 'string' || authConfig.authorizationId.trim() === '') {
    throw new Error('SCHEMA CONFIGURATION BLOCKED: A non-empty authorization ID is required.');
  }
  if (consumedSchemaAuthorizationIds.has(authConfig.authorizationId)) {
    throw new Error('SCHEMA CONFIGURATION BLOCKED: Authorization has already been consumed.');
  }
  const expectedSequence = ['FORM_FIELDS_ADD', 'APP_DEPLOY'];
  if (!Array.isArray(requestConfig.operationSequence) || requestConfig.operationSequence.length !== expectedSequence.length || requestConfig.operationSequence.some((operation, index) => operation !== expectedSequence[index])) {
    throw new Error('SCHEMA CONFIGURATION BLOCKED: Operation sequence must be FORM_FIELDS_ADD -> APP_DEPLOY.');
  }

  consumedSchemaAuthorizationIds.add(authConfig.authorizationId);
  return true;
}

export function assertScoringMasterSupersessionAuthorization(authConfig, requestConfig) {
  if (!authConfig || typeof authConfig !== 'object' || !requestConfig || typeof requestConfig !== 'object') {
    throw new Error('SCORING SUPERSESSION BLOCKED (FAIL-CLOSED): Missing authorization/request configuration.');
  }

  if (authConfig.workPackageId !== 'MBO-P03-WP-002C' || requestConfig.workPackageId !== 'MBO-P03-WP-002C') {
    throw new Error('SCORING SUPERSESSION BLOCKED: Work package must be exactly MBO-P03-WP-002C.');
  }

  if (authConfig.stage !== WP002C_SUPERSEDE_STAGE || requestConfig.stage !== WP002C_SUPERSEDE_STAGE) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Stage must be exactly STAGE_4D_SUPERSEDE_AND_PUBLISH.');
  }

  if (requestConfig.contractId !== WP002C_SUPERSEDE_CONTRACT_ID) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Contract ID must be exactly WP002C_SUPERSEDE_V1.');
  }
  if (authConfig.contractId !== undefined && authConfig.contractId !== WP002C_SUPERSEDE_CONTRACT_ID) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Contract ID must be exactly WP002C_SUPERSEDE_V1.');
  }

  if (requestConfig.appId !== WP002C_SCORING_MASTER_APP_ID) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Target App ID must be exactly 796.');
  }

  if (requestConfig.appName !== WP002C_APPROVED_APP_NAME) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Target App name mismatch.');
  }

  if (authConfig.operation !== 'SCORING_CONFIG_SUPERSEDE_AND_PUBLISH' || requestConfig.operation !== 'SCORING_CONFIG_SUPERSEDE_AND_PUBLISH') {
    throw new Error('SCORING SUPERSESSION BLOCKED: Operation must be exactly SCORING_CONFIG_SUPERSEDE_AND_PUBLISH.');
  }

  if (authConfig.activeWindow !== true) {
    throw new Error('SCORING SUPERSESSION BLOCKED: One-time write window is CLOSED.');
  }

  if (authConfig.explicitUserAuthorization !== true) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Explicit user authorization is required.');
  }

  // Backup evidence check
  if (authConfig.backupEvidence !== undefined) {
    const backup = authConfig.backupEvidence;
    if (!backup || typeof backup !== 'object' || Array.isArray(backup)) {
      throw new Error('SCORING SUPERSESSION BLOCKED: Backup evidence must be a plain object.');
    }
    if (backup.appId !== WP002C_SCORING_MASTER_APP_ID) {
      throw new Error('SCORING SUPERSESSION BLOCKED: Backup App ID mismatch.');
    }
    if (backup.appName !== WP002C_APPROVED_APP_NAME) {
      throw new Error('SCORING SUPERSESSION BLOCKED: Backup App name mismatch.');
    }
    if (typeof backup.snapshotScope !== 'string' || backup.snapshotScope.trim() === '') {
      throw new Error('SCORING SUPERSESSION BLOCKED: Backup snapshotScope must be non-empty string.');
    }
    if (backup.captured !== true || backup.verified !== true || backup.retainedUntilIndependentReview !== true) {
      throw new Error('SCORING SUPERSESSION BLOCKED: Backup must be captured, verified, and retained.');
    }
    if (typeof backup.artifactPath !== 'string' || backup.artifactPath.trim() === '') {
      throw new Error('SCORING SUPERSESSION BLOCKED: Backup artifactPath must be non-empty string.');
    }
    if (typeof backup.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(backup.sha256)) {
      throw new Error('SCORING SUPERSESSION BLOCKED: Backup sha256 must be 64-char lowercase hex string.');
    }
    if (typeof backup.capturedAt !== 'string' || backup.capturedAt.trim() === '') {
      throw new Error('SCORING SUPERSESSION BLOCKED: Backup capturedAt must be valid ISO-8601 string.');
    }
    if (typeof backup.recordCount !== 'number' || !Number.isSafeInteger(backup.recordCount) || backup.recordCount < 0) {
      throw new Error('SCORING SUPERSESSION BLOCKED: Backup recordCount must be a non-negative integer.');
    }
  } else if (authConfig.prewriteBackupVerified !== true) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Pre-write backup evidence must be verified.');
  }

  const authorizationId = authConfig.authorizationId;
  if (typeof authorizationId !== 'string' || authorizationId.trim() === '') {
    throw new Error('SCORING SUPERSESSION BLOCKED: A non-empty authorization ID is required.');
  }

  if (consumedSupersessionAuthorizationIds.has(authorizationId)) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Authorization has already been consumed.');
  }

  const {
    predecessorRecordId,
    predecessorRevision,
    predecessorMasterRecordKey,
    predecessorVersion,
    newRecordId,
    newRevision,
    newMasterRecordKey,
    newVersion,
    expectedPredecessorCurrentStatus,
    expectedPredecessorNextStatus,
    expectedNewCurrentStatus,
    expectedNewNextStatus
  } = requestConfig;

  if (!isExactPositiveSafeIntegerString(predecessorRecordId) || !isExactPositiveSafeIntegerString(newRecordId)) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Predecessor and new record IDs must be positive safe integer strings.');
  }

  if (predecessorRecordId === newRecordId) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Predecessor record ID and new record ID must be different.');
  }

  if (!isExactPositiveSafeIntegerString(predecessorRevision) || !isExactPositiveSafeIntegerString(newRevision)) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Predecessor and new revisions must be positive safe integer strings.');
  }

  if (typeof predecessorMasterRecordKey !== 'string' || predecessorMasterRecordKey.trim() === '' ||
      typeof newMasterRecordKey !== 'string' || newMasterRecordKey.trim() === '') {
    throw new Error('SCORING SUPERSESSION BLOCKED: Predecessor and new master record keys must be non-empty strings.');
  }

  if (predecessorMasterRecordKey === newMasterRecordKey) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Predecessor and new master record keys must be different.');
  }

  if (typeof predecessorVersion !== 'string' || predecessorVersion.trim() === '' ||
      typeof newVersion !== 'string' || newVersion.trim() === '') {
    throw new Error('SCORING SUPERSESSION BLOCKED: Predecessor version and new version must be non-empty strings.');
  }

  if (predecessorVersion.trim() === newVersion.trim()) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Predecessor version and new version must be different.');
  }

  if (expectedPredecessorCurrentStatus !== undefined && expectedPredecessorCurrentStatus !== CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Expected predecessor current status must be PUBLISHED.');
  }
  if (expectedPredecessorNextStatus !== undefined && expectedPredecessorNextStatus !== CONFIG_LIFECYCLE_STATUS.SUPERSEDED) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Expected predecessor next status must be SUPERSEDED.');
  }
  if (expectedNewCurrentStatus !== undefined && expectedNewCurrentStatus !== CONFIG_LIFECYCLE_STATUS.VALIDATED) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Expected new current status must be VALIDATED.');
  }
  if (expectedNewNextStatus !== undefined && expectedNewNextStatus !== CONFIG_LIFECYCLE_STATUS.PUBLISHED) {
    throw new Error('SCORING SUPERSESSION BLOCKED: Expected new next status must be PUBLISHED.');
  }

  consumedSupersessionAuthorizationIds.add(authorizationId);
  return true;
}

/**
 * Comprehensive Work Package Authorization & Safety Gate Engine (WP-002).
 * Validates:
 * 1. Fail-Closed on missing/corrupted configs
 * 2. Permanent Protected App Hard Block
 * 3. Work Package ID & Scope matching
 * 4. Operation-Level permission matching (e.g. FIELD_CREATE, LAYOUT_UPDATE)
 * 5. Pre-Write Backup Gate verification
 * 6. Expected Change Manifest presence
 * 7. Active Temporary Write Window
 */
export function assertWorkPackageAuthorization(authConfig, requestConfig) {
  // 1. Fail-closed: missing or invalid configuration
  if (!authConfig || typeof authConfig !== 'object' || !requestConfig || typeof requestConfig !== 'object') {
    throw new Error('WRITE BLOCKED (FAIL-CLOSED): Missing or corrupted authorization/request configuration.');
  }

  const {
    workPackageId: activeWpId,
    allowedAppIds = [],
    allowedOperations = [],
    backupVerified = false,
    activeWindow = false,
    dryRunBypassDiscovery = false
  } = authConfig;

  const {
    appId,
    operation,
    manifest,
    workPackageId: reqWpId
  } = requestConfig;

  // Validate App ID integer
  if (!Number.isInteger(appId) || appId <= 0) {
    throw new Error('WRITE BLOCKED: Target application ID must be a positive integer.');
  }

  // 2. Absolute invariant: Permanent Protected Apps are NEVER writable under any circumstances
  if (PROTECTED_APP_IDS.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is a permanent PROTECTED PRODUCTION APP and cannot be modified.`);
  }

  // Discovery Mode check
  if (DISCOVERY_MODE && !dryRunBypassDiscovery) {
    throw new Error('DISCOVERY PHASE WRITE BLOCKED: All Kintone write operations are locked during Architecture Discovery Phase.');
  }

  // 3. Work Package ID matching
  if (!activeWpId || !reqWpId || activeWpId !== reqWpId) {
    throw new Error(`WRITE BLOCKED: Work package mismatch (Active: ${activeWpId || 'NONE'}, Request: ${reqWpId || 'NONE'}).`);
  }

  // 4. Temporary Write Window check
  if (activeWindow !== true) {
    throw new Error(`WRITE BLOCKED: Write window is CLOSED for Work Package ${activeWpId}.`);
  }

  // 5. App Allow-list check
  if (!Array.isArray(allowedAppIds) || !allowedAppIds.includes(appId)) {
    throw new Error(`WRITE BLOCKED: App ${appId} is not in the authorized allow-list for Work Package ${activeWpId}.`);
  }

  // 6. Operation-level permission check
  if (!Array.isArray(allowedOperations) || !allowedOperations.includes(operation)) {
    throw new Error(`WRITE BLOCKED: Operation '${operation || 'UNKNOWN'}' is not authorized for App ${appId} under Work Package ${activeWpId}.`);
  }

  // 7. Pre-Write Backup Gate check
  if (backupVerified !== true) {
    throw new Error(`WRITE BLOCKED (BACKUP GATE): Pre-write backup has not been verified for App ${appId} under Work Package ${activeWpId}.`);
  }

  // 8. Expected Change Manifest check
  if (!manifest || typeof manifest !== 'object' || !manifest.expectedChanges || !Array.isArray(manifest.expectedChanges) || manifest.expectedChanges.length === 0) {
    throw new Error(`WRITE BLOCKED: Missing or empty Expected Change Manifest for Work Package ${activeWpId}.`);
  }

  return true;
}



/**
 * Exact-Record Rollback Authorization Guard (DEF-011)
 * Enforces that a rollback DELETE operation can ONLY target the exact record ID created by the active Work Package.
 */
export function assertRollbackAuthorization(authConfig, rollbackRequest) {
  if (!authConfig || typeof authConfig !== 'object' || !rollbackRequest || typeof rollbackRequest !== 'object') {
    throw new Error('ROLLBACK BLOCKED: Missing authorization or request configuration.');
  }

  // 1. Strict Operation Contract: rollback operation MUST be RECORD_DELETE
  if (rollbackRequest.operation !== 'RECORD_DELETE') {
    throw new Error(`ROLLBACK BLOCKED: Invalid rollback operation '${rollbackRequest.operation || 'UNKNOWN'}'. Rollback requires 'RECORD_DELETE'.`);
  }

  // 2. Exact Record ID Contract
  const { allowedRecordId } = authConfig;
  const { targetRecordId, targetRecordIds } = rollbackRequest;

  if (allowedRecordId === undefined || allowedRecordId === null || String(allowedRecordId).trim() === '') {
    throw new Error('ROLLBACK BLOCKED: Missing or invalid allowedRecordId in rollback authorization.');
  }

  // Reject if both targetRecordId and targetRecordIds are provided
  if (targetRecordId !== undefined && targetRecordIds !== undefined) {
    throw new Error('ROLLBACK BLOCKED: Prohibited ambiguous request containing both targetRecordId and targetRecordIds.');
  }

  // Reject if neither targetRecordId nor targetRecordIds is provided
  if (targetRecordId === undefined && targetRecordIds === undefined) {
    throw new Error('ROLLBACK BLOCKED: Missing target record ID in rollback request.');
  }

  let requestedId = null;

  if (targetRecordId !== undefined) {
    if (targetRecordId === null || (typeof targetRecordId !== 'string' && typeof targetRecordId !== 'number') || String(targetRecordId).trim() === '') {
      throw new Error('ROLLBACK BLOCKED: Invalid targetRecordId format.');
    }
    requestedId = String(targetRecordId).trim();
  } else if (targetRecordIds !== undefined) {
    if (!Array.isArray(targetRecordIds)) {
      throw new Error('ROLLBACK BLOCKED: targetRecordIds must be a valid array.');
    }
    if (targetRecordIds.length !== 1) {
      throw new Error(`ROLLBACK BLOCKED: Target record IDs array must contain exactly 1 ID (requested: [${targetRecordIds.join(', ')}]).`);
    }
    const singleId = targetRecordIds[0];
    if (singleId === null || singleId === undefined || (typeof singleId !== 'string' && typeof singleId !== 'number') || String(singleId).trim() === '') {
      throw new Error('ROLLBACK BLOCKED: Invalid record ID format inside targetRecordIds array.');
    }
    requestedId = String(singleId).trim();
  }

  if (requestedId !== String(allowedRecordId).trim()) {
    throw new Error(`ROLLBACK BLOCKED: Target record ID mismatch (allowed: ${allowedRecordId}, requested: ${requestedId}).`);
  }

  // 3. Work Package Authorization asserting active window, backup gate, app allow-list, manifest
  assertWorkPackageAuthorization(authConfig, rollbackRequest);

  return true;
}
export const WP002C_RECORD_WRITE_STAGE = 'STAGE_4C_RECORD_WRITE_BRIDGE';
export const WP002C_RECORD_WRITE_CONTRACT_ID = 'WP002C_SCORING_RECORD_WRITE_V1';

const consumedAuthorizationIds = new Set();

function isPlainObject(obj) {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj) && Object.getPrototypeOf(obj) === Object.prototype;
}

function isExactPositiveSafeIntegerString(val) {
  if (typeof val !== 'string') return false;
  if (val !== val.trim() || !/^[1-9]\d*$/.test(val)) return false;
  return Number.isSafeInteger(Number(val));
}

export function assertScoringConfigRecordWriteAuthorization(authConfig, requestContext) {
  if (!isPlainObject(authConfig) || !isPlainObject(requestContext)) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }

  if (
    authConfig.workPackageId !== 'MBO-P03-WP-002C' ||
    authConfig.stage !== WP002C_RECORD_WRITE_STAGE ||
    authConfig.recordWriteContractId !== WP002C_RECORD_WRITE_CONTRACT_ID ||
    authConfig.appId !== WP002C_SCORING_MASTER_APP_ID ||
    authConfig.appName !== WP002C_APPROVED_APP_NAME
  ) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }

  if (
    requestContext.appId !== WP002C_SCORING_MASTER_APP_ID ||
    requestContext.appId !== authConfig.appId
  ) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }

  const op = authConfig.operation;
  if (op !== 'SCORING_CONFIG_CREATE_VALIDATED' && op !== 'SCORING_CONFIG_PUBLISH') {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }
  if (requestContext.operation !== op) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }

  if (
    authConfig.explicitUserAuthorization !== true ||
    authConfig.activeWindow !== true ||
    typeof authConfig.authorizationId !== 'string' ||
    authConfig.authorizationId === '' ||
    authConfig.authorizationId !== authConfig.authorizationId.trim()
  ) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }

  if (consumedAuthorizationIds.has(authConfig.authorizationId)) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }

  const backup = authConfig.prewriteBackupEvidence;
  if (!isPlainObject(backup)) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }
  if (
    backup.appId !== WP002C_SCORING_MASTER_APP_ID ||
    backup.appName !== WP002C_APPROVED_APP_NAME ||
    backup.snapshotScope !== 'APP796_RECORDS_PREWRITE_V1' ||
    backup.captured !== true ||
    backup.verified !== true ||
    backup.retainedUntilIndependentReview !== true ||
    typeof backup.artifactPath !== 'string' ||
    backup.artifactPath === '' ||
    backup.artifactPath !== backup.artifactPath.trim() ||
    typeof backup.sha256 !== 'string' ||
    !/^[0-9a-f]{64}$/.test(backup.sha256) ||
    typeof backup.capturedAt !== 'string' ||
    backup.capturedAt === '' ||
    backup.capturedAt !== backup.capturedAt.trim() ||
    typeof backup.recordCount !== 'number' ||
    !Number.isSafeInteger(backup.recordCount) ||
    backup.recordCount < 0
  ) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }

  const manifest = requestContext.manifest;
  if (!isPlainObject(manifest)) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }
  const manifestKeys = Object.keys(manifest);
  if (manifestKeys.length !== 1 || manifestKeys[0] !== 'expectedChanges') {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }
  if (!Array.isArray(manifest.expectedChanges) || manifest.expectedChanges.length !== 1) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }
  const change = manifest.expectedChanges[0];
  if (!isPlainObject(change)) {
    throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
  }

  const changeKeys = Object.keys(change);

  if (op === 'SCORING_CONFIG_CREATE_VALIDATED') {
    const expectedCreateKeys = ['operation', 'appId', 'masterRecordKey'];
    if (changeKeys.length !== 3 || !expectedCreateKeys.every(k => changeKeys.includes(k))) {
      throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
    }
    if (
      change.operation !== 'SCORING_CONFIG_CREATE_VALIDATED' ||
      change.appId !== WP002C_SCORING_MASTER_APP_ID ||
      change.appId !== requestContext.appId ||
      change.masterRecordKey !== requestContext.masterRecordKey ||
      typeof requestContext.masterRecordKey !== 'string' ||
      requestContext.masterRecordKey === '' ||
      requestContext.masterRecordKey !== requestContext.masterRecordKey.trim()
    ) {
      throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
    }
  } else if (op === 'SCORING_CONFIG_PUBLISH') {
    const expectedPublishKeys = ['operation', 'appId', 'recordId', 'expectedRevision'];
    if (changeKeys.length !== 4 || !expectedPublishKeys.every(k => changeKeys.includes(k))) {
      throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
    }
    if (
      change.operation !== 'SCORING_CONFIG_PUBLISH' ||
      change.appId !== WP002C_SCORING_MASTER_APP_ID ||
      change.appId !== requestContext.appId ||
      change.recordId !== requestContext.recordId ||
      change.expectedRevision !== requestContext.expectedRevision ||
      !isExactPositiveSafeIntegerString(requestContext.recordId) ||
      !isExactPositiveSafeIntegerString(requestContext.expectedRevision)
    ) {
      throw new Error('RECORD_WRITE_AUTHORIZATION_FAILED');
    }
  }

  consumedAuthorizationIds.add(authConfig.authorizationId);
  return true;
}
