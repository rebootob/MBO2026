import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRoutingSchemaMigrationPlan,
  validateBackupPrerequisite
} from '../scripts/kintone/d3-migrate-routing-schema.js';
import {
  generateV1RouteSeedPlan,
  isValidIsoDateString,
  deriveRoutePatternFromSlots
} from '../scripts/kintone/d3-seed-route-version-v1.js';
import {
  generateRollbackRoutingSchemaPlan,
  executeRollback,
  validateRollbackPrerequisites
} from '../scripts/kintone/d3-rollback-routing-schema-plan.js';
import {
  assertD3RoutingSchemaMigrationAuthorization,
  D3_ROUTING_MASTER_APP_ID,
  D3_ROUTING_SCHEMA_MIGRATION_STAGE,
  D3_ROUTING_SCHEMA_MIGRATION_OPERATION,
  D3_SCHEMA_WRITE_LOCKED
} from '../src/core/sandbox-write-guard.js';
import { inspectD3Readiness } from '../scripts/kintone/d3-inspect-readiness.js';

const mockLegacyRecords = [
  {
    Routing_Key: 'TMT1',
    Section_Code: 'TMT1',
    Section_Name: 'Technology Section 1',
    Requester_User: [{ code: 't1' }],
    Manager_Level1_Approvers: [{ code: 'mgr1' }],
    Manager_Level1_Approval_Rule: 'ALL',
    GM_Level1_Approvers: [{ code: 'gm1' }],
    GM_Level1_Approval_Rule: 'ALL',
    Active: 'Active'
  },
  {
    Routing_Key: 'TME1',
    Section_Code: 'TME1',
    Section_Name: 'Managing Director Section 1',
    Requester_User: [{ code: 'e1' }],
    Manager_Level1_Approvers: [{ code: 'president' }],
    Manager_Level1_Approval_Rule: 'ALL',
    Active: 'Active'
  }
];

const validMockBackup = {
  appId: 795,
  sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  captured: true,
  verified: true,
  artifactPath: 'scratch/app795-prewrite-backup.json',
  capturedAt: '2026-09-09T08:00:00.000Z',
  recordCount: 17
};

test('D3-IMP-02 Migration 9: Deterministic v1 Version_Key generation', () => {
  const plan = generateV1RouteSeedPlan({
    records: mockLegacyRecords,
    effectiveFrom: '2026-04-01'
  });

  assert.equal(plan.totalRecords, 2);
  assert.equal(plan.effectiveFrom, '2026-04-01');

  const rec1 = plan.seededRecords[0];
  assert.equal(rec1.Routing_Key, 'TMT1');
  assert.equal(rec1.Version_Key, 'TMT1#v1');
  assert.equal(rec1.Version_Number, 1);
  assert.equal(rec1.Version_Status, 'ACTIVE');
  assert.equal(rec1.Route_Pattern, 'PATTERN_2_M1_G1');
  assert.equal(rec1.Scorer_Priority_Slots, '[1, 2]');

  const rec2 = plan.seededRecords[1];
  assert.equal(rec2.Routing_Key, 'TME1');
  assert.equal(rec2.Version_Key, 'TME1#v1');
  assert.equal(rec2.Version_Number, 1);
  assert.equal(rec2.Version_Status, 'ACTIVE');
  assert.equal(rec2.Route_Pattern, 'PATTERN_1_M1');
  assert.equal(rec2.Scorer_Priority_Slots, '[1]');
});

test('D3-IMP-02 Migration 10: Missing migration effective date fails closed', () => {
  // Missing / undefined
  assert.throws(
    () => generateV1RouteSeedPlan({ records: mockLegacyRecords }),
    /MISSING_MIGRATION_EFFECTIVE_DATE/
  );

  // Blank string
  assert.throws(
    () => generateV1RouteSeedPlan({ records: mockLegacyRecords, effectiveFrom: '' }),
    /MISSING_MIGRATION_EFFECTIVE_DATE/
  );

  assert.throws(
    () => generateV1RouteSeedPlan({ records: mockLegacyRecords, effectiveFrom: '   ' }),
    /MISSING_MIGRATION_EFFECTIVE_DATE/
  );

  // Invalid date format
  assert.throws(
    () => generateV1RouteSeedPlan({ records: mockLegacyRecords, effectiveFrom: '2026/04/01' }),
    /INVALID_MIGRATION_EFFECTIVE_DATE/
  );

  // Invalid calendar date
  assert.throws(
    () => generateV1RouteSeedPlan({ records: mockLegacyRecords, effectiveFrom: '2026-02-30' }),
    /INVALID_MIGRATION_EFFECTIVE_DATE/
  );
});

test('D3-IMP-02 Migration 11: Invalid/overlapping intervals fail closed in seed/dry-run planner', () => {
  // Effective_To earlier than Effective_From
  assert.throws(
    () => generateV1RouteSeedPlan({
      records: mockLegacyRecords,
      effectiveFrom: '2026-04-01',
      effectiveTo: '2026-03-31'
    }),
    /INVALID_DATE_INTERVAL/
  );

  // Overlapping intervals for same Routing_Key
  const duplicateRecords = [
    { ...mockLegacyRecords[0], Effective_From: '2026-04-01', Effective_To: '2026-09-30' },
    { ...mockLegacyRecords[0], Effective_From: '2026-08-01', Effective_To: '2026-12-31' }
  ];

  assert.throws(
    () => generateV1RouteSeedPlan({
      records: duplicateRecords,
      effectiveFrom: '2026-04-01'
    }),
    /INTERVAL_OVERLAP_DETECTED/
  );

  // Readiness inspector also detects interval overlap
  const readiness = inspectD3Readiness({
    app795Records: [
      { Routing_Key: 'TMT1', Version_Key: 'TMT1#v1', Effective_From: '2026-04-01', Effective_To: '2026-09-30', Version_Status: 'ACTIVE' },
      { Routing_Key: 'TMT1', Version_Key: 'TMT1#v2', Effective_From: '2026-09-15', Effective_To: '2026-12-31', Version_Status: 'ACTIVE' }
    ]
  });
  assert.equal(readiness.ready, false);
  assert.ok(readiness.errors.some(e => e.includes('Overlapping active date interval')));
});

test('D3-IMP-02 Migration 12: Dry-run performs zero Kintone/network operations', () => {
  // Verifies default dry-run mode
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 5,
    backupEvidence: validMockBackup
  });

  assert.equal(plan.dryRun, true);
  assert.equal(plan.executionMode, 'DRY_RUN_ONLY');
  assert.equal(plan.targetAppId, 795);
  assert.ok(plan.planId.startsWith('D3-MIG-795-R5-'));
  assert.equal(process.env.KINTONE_API_TOKEN, undefined);
});

test('D3-IMP-02 Migration 13: Write mode without exact authorization fails closed', () => {
  // Calling with dryRun: false and no authorization
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 5,
      backupEvidence: validMockBackup,
      options: { dryRun: false }
    }),
    /D3_SCHEMA_MIGRATION_BLOCKED/
  );

  // Calling assertD3RoutingSchemaMigrationAuthorization directly with missing auth
  assert.throws(
    () => assertD3RoutingSchemaMigrationAuthorization(null, { appId: 795 }),
    /D3_SCHEMA_MIGRATION_BLOCKED/
  );

  // Calling with wrong target App ID
  assert.throws(
    () => assertD3RoutingSchemaMigrationAuthorization(
      { appId: 794, workPackageId: 'D3-IMP-02' },
      { appId: 794 }
    ),
    /Target App ID must be exactly 795/
  );

  // Calling with permanent protected app (e.g. App 53)
  assert.throws(
    () => assertD3RoutingSchemaMigrationAuthorization(
      { appId: 53, workPackageId: 'D3-IMP-02' },
      { appId: 53 }
    ),
    /WRITE BLOCKED: App 53 is a permanent PROTECTED PRODUCTION APP/
  );

  // Even with fully valid authorization payload, D3_SCHEMA_WRITE_LOCKED enforces write lock in D3-IMP-02
  assert.equal(D3_SCHEMA_WRITE_LOCKED, true);
  const mockValidAuth = {
    appId: 795,
    workPackageId: 'D3-IMP-02',
    stage: D3_ROUTING_SCHEMA_MIGRATION_STAGE,
    operation: D3_ROUTING_SCHEMA_MIGRATION_OPERATION,
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: 'AUTH-TEST-NONCE-001',
    backupEvidence: validMockBackup
  };
  const mockValidReq = {
    appId: 795,
    stage: D3_ROUTING_SCHEMA_MIGRATION_STAGE,
    operation: D3_ROUTING_SCHEMA_MIGRATION_OPERATION,
    expectedRevision: 5
  };

  assert.throws(
    () => assertD3RoutingSchemaMigrationAuthorization(mockValidAuth, mockValidReq),
    /D3_SCHEMA_WRITE_LOCKED/
  );
});

test('D3-IMP-02 Migration 14: Missing backup/revision guard fails closed', () => {
  // Missing backupEvidence
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 5,
      backupEvidence: null
    }),
    /MIGRATION_PLAN_ERROR: Backup prerequisite evidence is missing or corrupted/
  );

  // Invalid backup sha256
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 5,
      backupEvidence: { ...validMockBackup, sha256: 'short-hash' }
    }),
    /MIGRATION_PLAN_ERROR: Backup sha256 must be a 64-character lowercase hex string/
  );

  // Missing expectedRevision
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: null,
      backupEvidence: validMockBackup
    }),
    /MIGRATION_PLAN_ERROR: Expected schema revision is required/
  );

  // Non-integer expectedRevision
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 'abc',
      backupEvidence: validMockBackup
    }),
    /MIGRATION_PLAN_ERROR: Expected schema revision is required/
  );
});

test('D3-IMP-02 Migration 15: Rollback planner cannot execute mutation', () => {
  // executeRollback must unconditionally fail closed
  assert.throws(
    () => executeRollback(),
    /ROLLBACK_EXECUTION_BLOCKED/
  );

  // Rollback plan generation validates prerequisites
  const dummySchema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', unique: true, required: true }
    }
  };
  const plan = generateRollbackRoutingSchemaPlan({
    targetAppId: 795,
    originalSchemaSnapshot: dummySchema,
    originalRecordBackup: validMockBackup,
    currentRevision: 11,
    expectedBackupRevision: 10
  });

  assert.equal(plan.planType, 'ROLLBACK_SPECIFICATION_ONLY');
  assert.equal(plan.executionProhibition.canExecute, false);
  assert.equal(plan.targetAppId, 795);

  // Missing original schema snapshot fails closed
  assert.throws(
    () => generateRollbackRoutingSchemaPlan({
      targetAppId: 795,
      originalSchemaSnapshot: null,
      originalRecordBackup: validMockBackup,
      currentRevision: 11,
      expectedBackupRevision: 10
    }),
    /ROLLBACK_PREREQUISITE_FAILED: Original schema snapshot is required/
  );
});

test('D3-IMP-02 Migration 16: Migration preview is deterministic for identical input', () => {
  const plan1 = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 7,
    backupEvidence: validMockBackup
  });

  const plan2 = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 7,
    backupEvidence: validMockBackup
  });

  assert.equal(plan1.planId, plan2.planId);
  assert.deepEqual(plan1, plan2);

  const seed1 = generateV1RouteSeedPlan({
    records: mockLegacyRecords,
    effectiveFrom: '2026-04-01'
  });

  const seed2 = generateV1RouteSeedPlan({
    records: mockLegacyRecords,
    effectiveFrom: '2026-04-01'
  });

  assert.equal(seed1.seedPlanId, seed2.seedPlanId);
  assert.deepEqual(seed1, seed2);
});
