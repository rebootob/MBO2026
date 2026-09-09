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

  // 4. Current schema is REQUIRED
  if (!currentSchema || typeof currentSchema !== 'object' || Array.isArray(currentSchema)) {
    throw new Error('MIGRATION_CURRENT_SCHEMA_REQUIRED: currentSchema is required to compute schema diff.');
  }

  const currentFields = currentSchema.fields && typeof currentSchema.fields === 'object' && !Array.isArray(currentSchema.fields)
    ? currentSchema.fields
    : currentSchema;

  if (!currentFields || typeof currentFields !== 'object' || Array.isArray(currentFields)) {
    throw new Error('MIGRATION_CURRENT_SCHEMA_REQUIRED: currentSchema must provide a valid fields definition object.');
  }

  // Validate critical fields existence
  const currentRk = currentFields.Routing_Key;
  if (!currentRk || typeof currentRk !== 'object') {
    throw new Error('MIGRATION_PLAN_ERROR: currentSchema must contain a definition for "Routing_Key".');
  }

  // Validate critical type compatibility for Routing_Key
  if (currentRk.type !== 'SINGLE_LINE_TEXT') {
    throw new Error(`INCOMPATIBLE_FIELD_TYPE: Routing_Key must have type SINGLE_LINE_TEXT (received "${currentRk.type}").`);
  }

  const isDryRun = options.dryRun !== false;

  // 5. Live execution check (disabled in D3-IMP-02)
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

  // 6. Build TRUE field additions and modifications diff across all D3 App795 target fields
  const modifications = [];
  const additions = [];

  // 1) Routing_Key (target: unique = false, required = true)
  const currentRkUnique = currentRk.unique === true;
  const currentRkRequired = currentRk.required === true;
  if (currentRkUnique !== false || currentRkRequired !== true) {
    modifications.push({
      fieldCode: 'Routing_Key',
      operation: 'MODIFY_FIELD_PROPERTIES',
      current: { unique: currentRkUnique, required: currentRkRequired },
      target: { unique: false, required: true },
      rationale: 'Model A requires non-unique business Routing_Key for versioned rows'
    });
  }

  // 2) Version_Key (target: SINGLE_LINE_TEXT, required = true, unique = true)
  const currentVk = currentFields.Version_Key;
  if (!currentVk) {
    additions.push({
      fieldCode: 'Version_Key',
      operation: 'ADD_FIELD',
      spec: { ...routingFields.Version_Key }
    });
  } else {
    if (currentVk.type !== 'SINGLE_LINE_TEXT') {
      throw new Error(`INCOMPATIBLE_FIELD_TYPE: Version_Key must have type SINGLE_LINE_TEXT (received "${currentVk.type}").`);
    }
    if (currentVk.required !== true || currentVk.unique !== true) {
      modifications.push({
        fieldCode: 'Version_Key',
        operation: 'MODIFY_FIELD_PROPERTIES',
        current: { unique: currentVk.unique === true, required: currentVk.required === true },
        target: { unique: true, required: true },
        rationale: 'Model A requires required and unique Version_Key'
      });
    }
  }

  // 3) Version_Number (target: NUMBER, required = true, minValue = '1')
  const currentVn = currentFields.Version_Number;
  if (!currentVn) {
    additions.push({
      fieldCode: 'Version_Number',
      operation: 'ADD_FIELD',
      spec: { ...routingFields.Version_Number }
    });
  } else {
    if (currentVn.type !== 'NUMBER') {
      throw new Error(`INCOMPATIBLE_FIELD_TYPE: Version_Number must have type NUMBER (received "${currentVn.type}").`);
    }
    if (currentVn.required !== true || (String(currentVn.minValue) !== '1')) {
      modifications.push({
        fieldCode: 'Version_Number',
        operation: 'MODIFY_FIELD_PROPERTIES',
        current: { required: currentVn.required === true, minValue: currentVn.minValue !== undefined ? String(currentVn.minValue) : '' },
        target: { required: true, minValue: '1' },
        rationale: 'Model A requires required positive integer Version_Number >= 1'
      });
    }
  }

  // 4) Version_Status (target: DROP_DOWN, required = true, options: [DRAFT, ACTIVE, CANCELLED, SUPERSEDED])
  const currentVs = currentFields.Version_Status;
  if (!currentVs) {
    additions.push({
      fieldCode: 'Version_Status',
      operation: 'ADD_FIELD',
      spec: { ...routingFields.Version_Status }
    });
  } else {
    if (currentVs.type !== 'DROP_DOWN') {
      throw new Error(`INCOMPATIBLE_FIELD_TYPE: Version_Status must have type DROP_DOWN (received "${currentVs.type}").`);
    }
    const expectedStatusOptions = ['DRAFT', 'ACTIVE', 'CANCELLED', 'SUPERSEDED'];
    const curStatusOpts = currentVs.options || {};
    const hasAllStatusOpts = expectedStatusOptions.every(opt => Boolean(curStatusOpts[opt]));
    if (currentVs.required !== true || !hasAllStatusOpts) {
      modifications.push({
        fieldCode: 'Version_Status',
        operation: 'MODIFY_FIELD_PROPERTIES',
        current: { required: currentVs.required === true, options: curStatusOpts },
        target: { required: true, options: routingFields.Version_Status.options },
        rationale: 'Model A requires all lifecycle options for Version_Status'
      });
    }
  }

  // 5) Route_Pattern (target: DROP_DOWN, required = true, options: 5 canonical D3 V1 patterns)
  const currentRp = currentFields.Route_Pattern;
  if (!currentRp) {
    additions.push({
      fieldCode: 'Route_Pattern',
      operation: 'ADD_FIELD',
      spec: { ...routingFields.Route_Pattern }
    });
  } else {
    if (currentRp.type !== 'DROP_DOWN') {
      throw new Error(`INCOMPATIBLE_FIELD_TYPE: Route_Pattern must have type DROP_DOWN (received "${currentRp.type}").`);
    }
    const expectedPatternOptions = [
      'PATTERN_1_M1',
      'PATTERN_2_M1_G1',
      'PATTERN_3A_M2_M1_G1',
      'PATTERN_3B_M1_G1_G2',
      'PATTERN_4_M2_M1_G1_G2'
    ];
    const curPatOpts = currentRp.options || {};
    const hasAllPatOpts = expectedPatternOptions.every(opt => Boolean(curPatOpts[opt]));
    if (currentRp.required !== true || !hasAllPatOpts) {
      modifications.push({
        fieldCode: 'Route_Pattern',
        operation: 'MODIFY_FIELD_PROPERTIES',
        current: { required: currentRp.required === true, options: curPatOpts },
        target: { required: true, options: routingFields.Route_Pattern.options },
        rationale: 'Model A requires all supported route pattern options for Route_Pattern'
      });
    }
  }

  // 6) Scorer_Priority_Slots (target: SINGLE_LINE_TEXT, required = true)
  const currentSps = currentFields.Scorer_Priority_Slots;
  if (!currentSps) {
    additions.push({
      fieldCode: 'Scorer_Priority_Slots',
      operation: 'ADD_FIELD',
      spec: { ...routingFields.Scorer_Priority_Slots }
    });
  } else {
    if (currentSps.type !== 'SINGLE_LINE_TEXT') {
      throw new Error(`INCOMPATIBLE_FIELD_TYPE: Scorer_Priority_Slots must have type SINGLE_LINE_TEXT (received "${currentSps.type}").`);
    }
    if (currentSps.required !== true) {
      modifications.push({
        fieldCode: 'Scorer_Priority_Slots',
        operation: 'MODIFY_FIELD_PROPERTIES',
        current: { required: currentSps.required === true },
        target: { required: true },
        rationale: 'Model A requires Scorer_Priority_Slots to be required'
      });
    }
  }

  // 7) Effective_From (target: DATE, required = true)
  const currentEf = currentFields.Effective_From;
  if (!currentEf) {
    additions.push({
      fieldCode: 'Effective_From',
      operation: 'ADD_FIELD',
      spec: { ...routingFields.Effective_From }
    });
  } else {
    if (currentEf.type !== 'DATE') {
      throw new Error(`INCOMPATIBLE_FIELD_TYPE: Effective_From must have type DATE (received "${currentEf.type}").`);
    }
    if (currentEf.required !== true) {
      modifications.push({
        fieldCode: 'Effective_From',
        operation: 'MODIFY_FIELD_PROPERTIES',
        current: { required: false },
        target: { required: true },
        rationale: 'Model A requires Effective_From date for all route versions'
      });
    }
  }

  // 8) Effective_To (target: DATE, required = false)
  const currentEt = currentFields.Effective_To;
  if (!currentEt) {
    additions.push({
      fieldCode: 'Effective_To',
      operation: 'ADD_FIELD',
      spec: { ...routingFields.Effective_To }
    });
  } else {
    if (currentEt.type !== 'DATE') {
      throw new Error(`INCOMPATIBLE_FIELD_TYPE: Effective_To must have type DATE (received "${currentEt.type}").`);
    }
    if (currentEt.required === true) {
      modifications.push({
        fieldCode: 'Effective_To',
        operation: 'MODIFY_FIELD_PROPERTIES',
        current: { required: true },
        target: { required: false },
        rationale: 'Effective_To must be optional for open-ended active route versions'
      });
    }
  }

  // 8. Post-write read-back verification contract
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

  // 9. Deterministic Plan ID includes actual currentSchemaEvidence across all target fields
  const TARGET_APP795_ALL_TARGET_FIELDS = [
    'Routing_Key',
    'Version_Key',
    'Version_Number',
    'Version_Status',
    'Route_Pattern',
    'Scorer_Priority_Slots',
    'Effective_From',
    'Effective_To'
  ];

  const targetFieldEvidence = {};
  for (const fieldCode of TARGET_APP795_ALL_TARGET_FIELDS) {
    const f = currentFields[fieldCode];
    if (!f || typeof f !== 'object') {
      targetFieldEvidence[fieldCode] = { exists: false };
    } else {
      targetFieldEvidence[fieldCode] = {
        exists: true,
        type: f.type || '',
        required: f.required === true,
        unique: f.unique === true,
        minValue: f.minValue !== undefined ? String(f.minValue) : '',
        options: f.options && typeof f.options === 'object' ? Object.keys(f.options).sort() : []
      };
    }
  }

  const currentSchemaEvidence = {
    routingKeyUnique: currentRk.unique === true,
    routingKeyRequired: currentRk.required === true,
    routingKeyType: currentRk.type,
    effectiveFromRequired: currentEf ? currentEf.required === true : false,
    effectiveFromType: currentEf ? currentEf.type : '',
    targetFieldEvidence,
    existingFieldCodes: Object.keys(currentFields).sort()
  };

  const planPayload = JSON.stringify({
    targetAppId,
    expectedRevision,
    backupSha256: backupEvidence.sha256,
    currentSchemaEvidence,
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
    currentSchemaEvidence,
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

// CLI dry-run preview if executed directly
if (process.argv[1] && process.argv[1].endsWith('d3-migrate-routing-schema.js')) {
  const dummyBackup = {
    appId: 795,
    sha256: 'a'.repeat(64),
    captured: true,
    verified: true,
    artifactPath: 'scratch/app795-prewrite-backup.json',
    recordCount: 17
  };
  const dummyCurrentSchema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', label: 'Routing Key', required: true, unique: true },
      Effective_From: { type: 'DATE', label: 'Effective From', required: false }
    }
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: dummyBackup,
    currentSchema: dummyCurrentSchema,
    options: { dryRun: true }
  });
  console.log(JSON.stringify(plan, null, 2));
}
