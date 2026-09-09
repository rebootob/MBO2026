/**
 * D3-IMP-02 — Local Schema Migration Tooling for App 795 (Model A)
 *
 * Defaults to DRY_RUN = true.
 * Performs ZERO Kintone reads/writes and ZERO network operations in D3-IMP-02.
 */

import crypto from 'node:crypto';
import { routingFields } from '../../config/schema-spec.js';
import {
  assertD3RoutingSchemaMigrationAuthorization,
  D3_ROUTING_MASTER_APP_ID,
  D3_ROUTING_SCHEMA_MIGRATION_STAGE,
  D3_ROUTING_SCHEMA_MIGRATION_OPERATION
} from '../../src/core/sandbox-write-guard.js';

delete process.env.KINTONE_API_TOKEN;

export const D3_MIGRATION_APP_ID = D3_ROUTING_MASTER_APP_ID; // 795

export const TARGET_APP795_NEW_FIELD_CODES = Object.freeze([
  'Version_Key',
  'Version_Number',
  'Version_Status',
  'Route_Pattern',
  'Scorer_Priority_Slots'
]);

export const TARGET_APP795_MODIFIED_FIELD_CODES = Object.freeze([
  'Routing_Key',
  'Effective_From'
]);

export const TARGET_APP795_PRESERVED_FIELD_CODES = Object.freeze([
  'Team',
  'Section_Code',
  'Section_Name',
  'Requester_User',
  'Manager_Level1_Approvers',
  'Manager_Level1_Approval_Rule',
  'Manager_Level2_Approvers',
  'Manager_Level2_Approval_Rule',
  'GM_Level1_Approvers',
  'GM_Level1_Approval_Rule',
  'GM_Level2_Approvers',
  'GM_Level2_Approval_Rule',
  'Active',
  'Effective_To',
  'Remark',
  'First_Manager_User',
  'Manager_User',
  'GM_User'
]);

/**
 * Validates the backup evidence object required as a prerequisite for migration planning.
 */
export function validateBackupPrerequisite(backupEvidence) {
  if (!backupEvidence || typeof backupEvidence !== 'object' || Array.isArray(backupEvidence)) {
    throw new Error('MIGRATION_PLAN_ERROR: Backup prerequisite evidence is missing or corrupted.');
  }

  if (backupEvidence.appId !== D3_MIGRATION_APP_ID) {
    throw new Error(`MIGRATION_PLAN_ERROR: Backup App ID mismatch (expected ${D3_MIGRATION_APP_ID}, got ${backupEvidence.appId}).`);
  }

  if (backupEvidence.captured !== true || backupEvidence.verified !== true) {
    throw new Error('MIGRATION_PLAN_ERROR: Backup prerequisite must be marked as captured and verified.');
  }

  if (typeof backupEvidence.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(backupEvidence.sha256)) {
    throw new Error('MIGRATION_PLAN_ERROR: Backup sha256 must be a 64-character lowercase hex string.');
  }

  if (typeof backupEvidence.artifactPath !== 'string' || !backupEvidence.artifactPath.trim()) {
    throw new Error('MIGRATION_PLAN_ERROR: Backup artifact path is required.');
  }

  return true;
}

/**
 * Generates a deterministic App 795 Schema Migration Plan.
 * Default mode: DRY_RUN = true.
 *
 * @param {Object} params
 * @param {number} params.targetAppId - Target Kintone App ID (must be exactly 795)
 * @param {number} params.expectedRevision - Expected live schema revision before migration
 * @param {Object} params.backupEvidence - Structured backup verification evidence
 * @param {Object} [params.currentSchema] - Optional current schema state for diff calculation
 * @param {Object} [params.options] - Migration options (dryRun defaults to true)
 * @param {Object} [params.authConfig] - Authorization configuration (if live mode attempted)
 * @returns {Object} Deterministic migration plan
 */
export function generateRoutingSchemaMigrationPlan({
  targetAppId,
  expectedRevision,
  backupEvidence,
  currentSchema = null,
  options = {},
  authConfig = null
}) {
  // 1. Target App ID validation
  if (!Number.isInteger(targetAppId) || targetAppId !== D3_MIGRATION_APP_ID) {
    throw new Error(`MIGRATION_PLAN_ERROR: Target App ID must be exactly ${D3_MIGRATION_APP_ID}.`);
  }

  // 2. Expected revision validation
  if (expectedRevision === undefined || expectedRevision === null || !Number.isInteger(Number(expectedRevision)) || Number(expectedRevision) < 1) {
    throw new Error('MIGRATION_PLAN_ERROR: Expected schema revision is required and must be a positive integer.');
  }

  // 3. Backup prerequisite validation
  validateBackupPrerequisite(backupEvidence);

  const isDryRun = options.dryRun !== false;

  // 4. Live execution check (disabled in D3-IMP-02)
  if (!isDryRun) {
    const requestConfig = {
      appId: targetAppId,
      operation: D3_ROUTING_SCHEMA_MIGRATION_OPERATION,
      stage: D3_ROUTING_SCHEMA_MIGRATION_STAGE,
      expectedRevision
    };
    // Will assert authorization and fail closed (D3_SCHEMA_WRITE_LOCKED is true)
    assertD3RoutingSchemaMigrationAuthorization(authConfig, requestConfig);
    throw new Error('D3_SCHEMA_WRITE_BLOCKED: Live Kintone write execution is strictly disabled in D3-IMP-02.');
  }

  // 5. Build field modifications diff
  const modifications = [
    {
      fieldCode: 'Routing_Key',
      operation: 'MODIFY_FIELD_PROPERTIES',
      current: { unique: true, required: true },
      target: { unique: false, required: true },
      rationale: 'Model A requires non-unique business Routing_Key for versioned rows'
    },
    {
      fieldCode: 'Effective_From',
      operation: 'MODIFY_FIELD_PROPERTIES',
      current: { required: false },
      target: { required: true },
      rationale: 'Model A requires Effective_From date for all route versions'
    }
  ];

  // 6. Build field additions diff
  const additions = TARGET_APP795_NEW_FIELD_CODES.map(fieldCode => {
    const spec = routingFields[fieldCode];
    if (!spec) {
      throw new Error(`MIGRATION_PLAN_ERROR: Target schema specification missing for field ${fieldCode}.`);
    }
    return {
      fieldCode,
      operation: 'ADD_FIELD',
      spec: { ...spec }
    };
  });

  // 7. Post-write read-back verification contract
  const postWriteReadBackContract = {
    targetAppId: D3_MIGRATION_APP_ID,
    expectedPostMigrationRevision: Number(expectedRevision) + 1,
    requiredFieldAssertions: [
      { fieldCode: 'Routing_Key', property: 'unique', expected: false },
      { fieldCode: 'Routing_Key', property: 'required', expected: true },
      { fieldCode: 'Version_Key', property: 'unique', expected: true },
      { fieldCode: 'Version_Key', property: 'required', expected: true },
      { fieldCode: 'Version_Number', property: 'type', expected: 'NUMBER' },
      { fieldCode: 'Version_Number', property: 'required', expected: true },
      { fieldCode: 'Version_Status', property: 'type', expected: 'DROP_DOWN' },
      { fieldCode: 'Version_Status', property: 'required', expected: true },
      { fieldCode: 'Route_Pattern', property: 'type', expected: 'DROP_DOWN' },
      { fieldCode: 'Route_Pattern', property: 'required', expected: true },
      { fieldCode: 'Scorer_Priority_Slots', property: 'type', expected: 'SINGLE_LINE_TEXT' },
      { fieldCode: 'Scorer_Priority_Slots', property: 'required', expected: true },
      { fieldCode: 'Effective_From', property: 'type', expected: 'DATE' },
      { fieldCode: 'Effective_From', property: 'required', expected: true },
      { fieldCode: 'Effective_To', property: 'type', expected: 'DATE' },
      { fieldCode: 'Active', property: 'type', expected: 'RADIO_BUTTON' }
    ]
  };

  // 8. Deterministic Plan ID
  const planPayload = JSON.stringify({
    targetAppId,
    expectedRevision,
    backupSha256: backupEvidence.sha256,
    modifications,
    additions
  });
  const planHash = crypto.createHash('sha256').update(planPayload).digest('hex').substring(0, 16);
  const planId = `D3-MIG-795-R${expectedRevision}-${planHash}`;

  return {
    planId,
    targetAppId,
    expectedRevision,
    dryRun: true,
    executionMode: 'DRY_RUN_ONLY',
    backupEvidence: { ...backupEvidence },
    diffPreview: {
      modifiedFieldsCount: modifications.length,
      addedFieldsCount: additions.length,
      preservedFieldsCount: TARGET_APP795_PRESERVED_FIELD_CODES.length,
      modifications,
      additions,
      preservedFieldCodes: TARGET_APP795_PRESERVED_FIELD_CODES
    },
    postWriteReadBackContract
  };
}

if (process.argv[1] && process.argv[1].endsWith('d3-migrate-routing-schema.js')) {
  const dummyBackup = {
    appId: 795,
    sha256: 'a'.repeat(64),
    captured: true,
    verified: true,
    artifactPath: 'scratch/app795-prewrite-backup.json',
    recordCount: 17
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: dummyBackup,
    options: { dryRun: true }
  });
  console.log(JSON.stringify(plan, null, 2));
}
