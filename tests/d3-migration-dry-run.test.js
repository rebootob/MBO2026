import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRoutingSchemaMigrationPlan,
  validateBackupPrerequisite
} from '../scripts/kintone/d3-migrate-routing-schema.js';
import {
  generateV1RouteSeedPlan,
  isValidIsoDateString,
  deriveRoutePatternFromSlots,
  resolveAndValidateScorerPlan
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

const validCurrentSchema = {
  fields: {
    Routing_Key: { type: 'SINGLE_LINE_TEXT', label: 'Routing Key', required: true, unique: true },
    Effective_From: { type: 'DATE', label: 'Effective From', required: false },
    Active: { type: 'RADIO_BUTTON', label: 'Active', required: true }
  }
};

// ============================================================================
// SCORER CORRECTIVE TESTS (1 - 13)
// ============================================================================

test('Corrective 1: Missing Scorer_Priority_Slots throws SCORER_PLAN_NOT_CONFIGURED', () => {
  const m1Record = { ...mockLegacyRecords[1] }; // TME1 (M1_ONLY), no Scorer_Priority_Slots
  assert.throws(
    () => generateV1RouteSeedPlan({
      records: [m1Record],
      effectiveFrom: '2026-04-01'
    }),
    /SCORER_PLAN_NOT_CONFIGURED/
  );
});

test('Corrective 2: No automatic [1] for M1_ONLY', () => {
  const m1Record = { ...mockLegacyRecords[1] }; // TME1
  assert.equal(deriveRoutePatternFromSlots(m1Record), 'PATTERN_1_M1');
  assert.throws(
    () => resolveAndValidateScorerPlan({
      record: m1Record,
      routingKey: 'TME1',
      routePattern: 'PATTERN_1_M1'
    }),
    /SCORER_PLAN_NOT_CONFIGURED/
  );
});

test('Corrective 3: No automatic [1,2] for M1_G1', () => {
  const m1g1Record = { ...mockLegacyRecords[0] }; // TMT1
  assert.equal(deriveRoutePatternFromSlots(m1g1Record), 'PATTERN_2_M1_G1');
  assert.throws(
    () => resolveAndValidateScorerPlan({
      record: m1g1Record,
      routingKey: 'TMT1',
      routePattern: 'PATTERN_2_M1_G1'
    }),
    /SCORER_PLAN_NOT_CONFIGURED/
  );
});

test('Corrective 4: Explicit [1] accepted for one-slot route', () => {
  const m1Record = { ...mockLegacyRecords[1] };
  const plan = resolveAndValidateScorerPlan({
    record: m1Record,
    routingKey: 'TME1',
    routePattern: 'PATTERN_1_M1',
    scorerPlanByRoutingKey: { TME1: [1] }
  });
  assert.equal(plan, '[1]');

  const seed = generateV1RouteSeedPlan({
    records: [m1Record],
    effectiveFrom: '2026-04-01',
    scorerPlanByRoutingKey: { TME1: [1] }
  });
  assert.equal(seed.seededRecords[0].Scorer_Priority_Slots, '[1]');
});

test('Corrective 5: Explicit valid [1,2] accepted where structurally valid', () => {
  const m1g1Record = { ...mockLegacyRecords[0] };
  const plan = resolveAndValidateScorerPlan({
    record: m1g1Record,
    routingKey: 'TMT1',
    routePattern: 'PATTERN_2_M1_G1',
    scorerPlanByRoutingKey: { TMT1: [1, 2] }
  });
  assert.equal(plan, '[1,2]');
});

test('Corrective 6: Explicit [2,1] preserves HR order where valid', () => {
  const m1g1Record = { ...mockLegacyRecords[0] };
  const plan = resolveAndValidateScorerPlan({
    record: m1g1Record,
    routingKey: 'TMT1',
    routePattern: 'PATTERN_2_M1_G1',
    scorerPlanByRoutingKey: { TMT1: [2, 1] }
  });
  assert.equal(plan, '[2,1]');
});

test('Corrective 7: duplicate [1,1] fails closed with INVALID_SCORER_PLAN', () => {
  const m1g1Record = { ...mockLegacyRecords[0] };
  assert.throws(
    () => resolveAndValidateScorerPlan({
      record: m1g1Record,
      routingKey: 'TMT1',
      routePattern: 'PATTERN_2_M1_G1',
      scorerPlanByRoutingKey: { TMT1: [1, 1] }
    }),
    /INVALID_SCORER_PLAN.*distinct/
  );
});

test('Corrective 8: out-of-range scorer slot fails closed', () => {
  const m1g1Record = { ...mockLegacyRecords[0] }; // active count = 2
  assert.throws(
    () => resolveAndValidateScorerPlan({
      record: m1g1Record,
      routingKey: 'TMT1',
      routePattern: 'PATTERN_2_M1_G1',
      scorerPlanByRoutingKey: { TMT1: [1, 3] }
    }),
    /INVALID_SCORER_PLAN.*exceeds active route slot count/
  );
});

test('Corrective 9: zero/negative/non-integer slot fails closed', () => {
  const m1g1Record = { ...mockLegacyRecords[0] };
  // Zero
  assert.throws(
    () => resolveAndValidateScorerPlan({
      record: m1g1Record,
      routingKey: 'TMT1',
      routePattern: 'PATTERN_2_M1_G1',
      scorerPlanByRoutingKey: { TMT1: [0, 1] }
    }),
    /INVALID_SCORER_PLAN.*positive integer/
  );
  // Negative
  assert.throws(
    () => resolveAndValidateScorerPlan({
      record: m1g1Record,
      routingKey: 'TMT1',
      routePattern: 'PATTERN_2_M1_G1',
      scorerPlanByRoutingKey: { TMT1: [-1, 2] }
    }),
    /INVALID_SCORER_PLAN.*positive integer/
  );
  // Non-integer
  assert.throws(
    () => resolveAndValidateScorerPlan({
      record: m1g1Record,
      routingKey: 'TMT1',
      routePattern: 'PATTERN_2_M1_G1',
      scorerPlanByRoutingKey: { TMT1: [1.5, 2] }
    }),
    /INVALID_SCORER_PLAN.*positive integer/
  );
});

test('Corrective 10: inactive-slot reference fails closed', () => {
  const m1Record = { ...mockLegacyRecords[1] }; // PATTERN_1_M1 (only slot 1 is active)
  assert.throws(
    () => resolveAndValidateScorerPlan({
      record: m1Record,
      routingKey: 'TME1',
      routePattern: 'PATTERN_1_M1',
      scorerPlanByRoutingKey: { TME1: [2] }
    }),
    /INVALID_SCORER_PLAN.*exceeds active route slot count/
  );
});

test('Corrective 11: readiness inspector returns ready=false when scorer plan missing', () => {
  const recordWithoutScorer = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Effective_From: '2026-04-01',
    Route_Pattern: 'PATTERN_2_M1_G1',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL',
    GM_Level1_Approvers: [{ code: 'g1' }],
    GM_Level1_Approval_Rule: 'ALL'
    // Scorer_Priority_Slots is omitted
  };

  const result = inspectD3Readiness({ app795Records: [recordWithoutScorer] });
  assert.equal(result.ready, false);
  assert.equal(result.app795.status, 'FAIL');
  assert.ok(result.errors.some(e => e.includes('SCORER_PLAN_NOT_CONFIGURED')));
});

test('Corrective 12: readiness inspector returns ready=false for malformed plan', () => {
  const recordWithBadScorer = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Effective_From: '2026-04-01',
    Route_Pattern: 'PATTERN_2_M1_G1',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL',
    GM_Level1_Approvers: [{ code: 'g1' }],
    GM_Level1_Approval_Rule: 'ALL',
    Scorer_Priority_Slots: '[1, 1]' // duplicate slot
  };

  const result = inspectD3Readiness({ app795Records: [recordWithBadScorer] });
  assert.equal(result.ready, false);
  assert.equal(result.app795.status, 'FAIL');
  assert.ok(result.errors.some(e => e.includes('INVALID_SCORER_PLAN')));
});

test('Corrective 13: readiness inspector passes structurally valid explicit plan', () => {
  const recordWithValidScorer = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Effective_From: '2026-04-01',
    Route_Pattern: 'PATTERN_2_M1_G1',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL',
    GM_Level1_Approvers: [{ code: 'g1' }],
    GM_Level1_Approval_Rule: 'ALL',
    Scorer_Priority_Slots: '[1, 2]'
  };

  const result = inspectD3Readiness({ app795Records: [recordWithValidScorer] });
  assert.equal(result.ready, true);
  assert.equal(result.app795.status, 'PASS');
  assert.equal(result.errors.length, 0);
});

// ============================================================================
// TRUE SCHEMA DIFF TESTS (14 - 22)
// ============================================================================

test('Corrective 14: missing currentSchema fails closed with MIGRATION_CURRENT_SCHEMA_REQUIRED', () => {
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 5,
      backupEvidence: validMockBackup,
      currentSchema: null
    }),
    /MIGRATION_CURRENT_SCHEMA_REQUIRED/
  );

  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 5,
      backupEvidence: validMockBackup
    }),
    /MIGRATION_CURRENT_SCHEMA_REQUIRED/
  );
});

test('Corrective 15: current Routing_Key unique=true -> target false modification generated', () => {
  const schemaWithUniqueRk = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
      Effective_From: { type: 'DATE', required: true }
    }
  };

  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schemaWithUniqueRk
  });

  const rkMod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Routing_Key');
  assert.ok(rkMod, 'Modification for Routing_Key must be generated when current unique=true');
  assert.equal(rkMod.operation, 'MODIFY_FIELD_PROPERTIES');
  assert.equal(rkMod.current.unique, true);
  assert.equal(rkMod.target.unique, false);
});

test('Corrective 16: current Routing_Key already unique=false -> no false modification claimed', () => {
  const schemaWithNonUniqueRk = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Effective_From: { type: 'DATE', required: true }
    }
  };

  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schemaWithNonUniqueRk
  });

  const rkMod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Routing_Key');
  assert.equal(rkMod, undefined, 'No modification should be generated when Routing_Key is already unique=false');
});

test('Corrective 17: Effective_From required=false -> required=true modification generated', () => {
  const schemaWithOptionalEf = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Effective_From: { type: 'DATE', required: false }
    }
  };

  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schemaWithOptionalEf
  });

  const efMod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Effective_From');
  assert.ok(efMod, 'Modification for Effective_From must be generated when current required=false');
  assert.equal(efMod.current.required, false);
  assert.equal(efMod.target.required, true);
});

test('Corrective 18: Effective_From already required=true -> no unnecessary modification', () => {
  const schemaWithRequiredEf = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Effective_From: { type: 'DATE', required: true }
    }
  };

  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schemaWithRequiredEf
  });

  const efMod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Effective_From');
  assert.equal(efMod, undefined, 'No modification should be generated when Effective_From is already required=true');
});

test('Corrective 19: incompatible Routing_Key type fails closed', () => {
  const incompatibleRk = {
    fields: {
      Routing_Key: { type: 'NUMBER', required: true, unique: true },
      Effective_From: { type: 'DATE', required: false }
    }
  };

  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 10,
      backupEvidence: validMockBackup,
      currentSchema: incompatibleRk
    }),
    /INCOMPATIBLE_FIELD_TYPE.*Routing_Key/
  );
});

test('Corrective 20: incompatible Effective_From type fails closed', () => {
  const incompatibleEf = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
      Effective_From: { type: 'SINGLE_LINE_TEXT', required: false }
    }
  };

  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 10,
      backupEvidence: validMockBackup,
      currentSchema: incompatibleEf
    }),
    /INCOMPATIBLE_FIELD_TYPE.*Effective_From/
  );
});

test('Corrective 21: deterministic identical currentSchema/input => identical plan', () => {
  const plan1 = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: validCurrentSchema
  });

  const plan2 = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: validCurrentSchema
  });

  assert.equal(plan1.planId, plan2.planId);
  assert.deepEqual(plan1, plan2);
});

test('Corrective 22: changed currentSchema => plan identity/diff changes appropriately', () => {
  const schemaA = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
      Effective_From: { type: 'DATE', required: false }
    }
  };

  const schemaB = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Effective_From: { type: 'DATE', required: true }
    }
  };

  const planA = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schemaA
  });

  const planB = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schemaB
  });

  assert.notEqual(planA.planId, planB.planId);
  assert.equal(planA.diffPreview.modifications.length, 2);
  assert.equal(planB.diffPreview.modifications.length, 0);
});

// ============================================================================
// GUARDS & SAFETY TESTS (23 - 26)
// ============================================================================

test('Corrective 23: dry-run remains zero-network / zero-Kintone', () => {
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 5,
    backupEvidence: validMockBackup,
    currentSchema: validCurrentSchema
  });

  assert.equal(plan.dryRun, true);
  assert.equal(plan.executionMode, 'DRY_RUN_ONLY');
  assert.equal(process.env.KINTONE_API_TOKEN, undefined);
});

test('Corrective 24: live/write mode still blocked', () => {
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 5,
      backupEvidence: validMockBackup,
      currentSchema: validCurrentSchema,
      options: { dryRun: false }
    }),
    /D3_SCHEMA_MIGRATION_BLOCKED/
  );

  assert.equal(D3_SCHEMA_WRITE_LOCKED, true);
  const mockValidAuth = {
    appId: 795,
    workPackageId: 'D3-IMP-02',
    stage: D3_ROUTING_SCHEMA_MIGRATION_STAGE,
    operation: D3_ROUTING_SCHEMA_MIGRATION_OPERATION,
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: 'AUTH-NONCE-R1-001',
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

test('Corrective 25: missing backup still blocked', () => {
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 5,
      backupEvidence: null,
      currentSchema: validCurrentSchema
    }),
    /MIGRATION_PLAN_ERROR: Backup prerequisite evidence is missing or corrupted/
  );
});

test('Corrective 26: missing expectedRevision still blocked', () => {
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: null,
      backupEvidence: validMockBackup,
      currentSchema: validCurrentSchema
    }),
    /MIGRATION_PLAN_ERROR: Expected schema revision is required/
  );

  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 'invalid-rev',
      backupEvidence: validMockBackup,
      currentSchema: validCurrentSchema
    }),
    /MIGRATION_PLAN_ERROR: Expected schema revision is required/
  );
});

// ============================================================================
// ROLLBACK & INTERVAL SAFETY TESTS
// ============================================================================

test('Rollback planner cannot execute mutation', () => {
  assert.throws(() => executeRollback(), /ROLLBACK_EXECUTION_BLOCKED/);

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
});

test('Deterministic v1 Version_Key generation when explicit scorer plan is provided', () => {
  const plan = generateV1RouteSeedPlan({
    records: mockLegacyRecords,
    effectiveFrom: '2026-04-01',
    scorerPlanByRoutingKey: {
      TMT1: [1, 2],
      TME1: [1]
    }
  });

  assert.equal(plan.totalRecords, 2);
  assert.equal(plan.seededRecords[0].Version_Key, 'TMT1#v1');
  assert.equal(plan.seededRecords[0].Version_Number, 1);
  assert.equal(plan.seededRecords[0].Scorer_Priority_Slots, '[1,2]');
  assert.equal(plan.seededRecords[1].Version_Key, 'TME1#v1');
  assert.equal(plan.seededRecords[1].Version_Number, 1);
  assert.equal(plan.seededRecords[1].Scorer_Priority_Slots, '[1]');
});

// ============================================================================
// D3-IMP-02-R2 CORRECTIVE TESTS (1 - 30)
// ============================================================================

// 1. Routing_Key required=false / unique=false => required=true modification generated.
test('R2 Corrective 1: Routing_Key required=false / unique=false => required=true modification generated', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: false, unique: false }
    }
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schema
  });
  const mod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Routing_Key');
  assert.ok(mod);
  assert.equal(mod.target.required, true);
  assert.equal(mod.target.unique, false);
});

// 2. Routing_Key required=true / unique=false => no unnecessary change.
test('R2 Corrective 2: Routing_Key required=true / unique=false => no unnecessary change', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false }
    }
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schema
  });
  const mod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Routing_Key');
  assert.equal(mod, undefined);
});

// 3. Existing Version_Key correct => no ADD_FIELD.
test('R2 Corrective 3: Existing Version_Key correct => no ADD_FIELD', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Version_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true }
    }
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schema
  });
  const addition = plan.diffPreview.additions.find(a => a.fieldCode === 'Version_Key');
  const mod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Version_Key');
  assert.equal(addition, undefined);
  assert.equal(mod, undefined);
});

// 4. Existing Version_Key unique=false => corrective modification generated if safely supported.
test('R2 Corrective 4: Existing Version_Key unique=false => corrective modification generated', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Version_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false }
    }
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schema
  });
  const mod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Version_Key');
  assert.ok(mod);
  assert.equal(mod.current.unique, false);
  assert.equal(mod.target.unique, true);
});

// 5. Existing Version_Key wrong type => fail closed.
test('R2 Corrective 5: Existing Version_Key wrong type => fail closed', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Version_Key: { type: 'NUMBER', required: true, unique: true }
    }
  };
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 10,
      backupEvidence: validMockBackup,
      currentSchema: schema
    }),
    /INCOMPATIBLE_FIELD_TYPE.*Version_Key/
  );
});

// 6. Existing Version_Number correct => no change.
test('R2 Corrective 6: Existing Version_Number correct => no change', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Version_Number: { type: 'NUMBER', required: true, minValue: '1' }
    }
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schema
  });
  const addition = plan.diffPreview.additions.find(a => a.fieldCode === 'Version_Number');
  const mod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Version_Number');
  assert.equal(addition, undefined);
  assert.equal(mod, undefined);
});

// 7. Existing Version_Number invalid type => fail closed.
test('R2 Corrective 7: Existing Version_Number invalid type => fail closed', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Version_Number: { type: 'SINGLE_LINE_TEXT', required: true }
    }
  };
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 10,
      backupEvidence: validMockBackup,
      currentSchema: schema
    }),
    /INCOMPATIBLE_FIELD_TYPE.*Version_Number/
  );
});

// 8. Existing Version_Status missing option => migration diff corrects options.
test('R2 Corrective 8: Existing Version_Status missing option => migration diff corrects options', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Version_Status: {
        type: 'DROP_DOWN',
        required: true,
        options: {
          DRAFT: { label: 'DRAFT', index: '0' },
          ACTIVE: { label: 'ACTIVE', index: '1' }
          // CANCELLED and SUPERSEDED missing
        }
      }
    }
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schema
  });
  const mod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Version_Status');
  assert.ok(mod);
  assert.ok(mod.target.options.CANCELLED);
  assert.ok(mod.target.options.SUPERSEDED);
});

// 9. Existing Route_Pattern missing required option => deterministic corrective behavior.
test('R2 Corrective 9: Existing Route_Pattern missing required option => deterministic corrective behavior', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Route_Pattern: {
        type: 'DROP_DOWN',
        required: true,
        options: {
          PATTERN_1_M1: { label: 'PATTERN_1_M1', index: '0' },
          PATTERN_2_M1_G1: { label: 'PATTERN_2_M1_G1', index: '1' }
          // 3A, 3B, 4 missing
        }
      }
    }
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schema
  });
  const mod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Route_Pattern');
  assert.ok(mod);
  assert.ok(mod.target.options.PATTERN_3A_M2_M1_G1);
  assert.ok(mod.target.options.PATTERN_3B_M1_G1_G2);
  assert.ok(mod.target.options.PATTERN_4_M2_M1_G1_G2);
});

// 10. Existing Scorer_Priority_Slots required=false => modification generated.
test('R2 Corrective 10: Existing Scorer_Priority_Slots required=false => modification generated', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Scorer_Priority_Slots: { type: 'SINGLE_LINE_TEXT', required: false }
    }
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schema
  });
  const mod = plan.diffPreview.modifications.find(m => m.fieldCode === 'Scorer_Priority_Slots');
  assert.ok(mod);
  assert.equal(mod.current.required, false);
  assert.equal(mod.target.required, true);
});

// 11. Existing Effective_To wrong type => fail closed.
test('R2 Corrective 11: Existing Effective_To wrong type => fail closed', () => {
  const schema = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Effective_To: { type: 'SINGLE_LINE_TEXT', required: false }
    }
  };
  assert.throws(
    () => generateRoutingSchemaMigrationPlan({
      targetAppId: 795,
      expectedRevision: 10,
      backupEvidence: validMockBackup,
      currentSchema: schema
    }),
    /INCOMPATIBLE_FIELD_TYPE.*Effective_To/
  );
});

// 12. partially migrated schema => exact additions/modifications represent actual remaining work.
test('R2 Corrective 12: partially migrated schema => exact additions/modifications represent actual remaining work', () => {
  const partiallyMigrated = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Version_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
      Effective_From: { type: 'DATE', required: true },
      Effective_To: { type: 'DATE', required: false },
      Scorer_Priority_Slots: { type: 'SINGLE_LINE_TEXT', required: false }
      // Version_Number, Version_Status, Route_Pattern missing
    }
  };
  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 12,
    backupEvidence: validMockBackup,
    currentSchema: partiallyMigrated
  });

  const addedCodes = plan.diffPreview.additions.map(a => a.fieldCode).sort();
  assert.deepEqual(addedCodes, ['Route_Pattern', 'Version_Number', 'Version_Status']);

  const modCodes = plan.diffPreview.modifications.map(m => m.fieldCode).sort();
  assert.deepEqual(modCodes, ['Scorer_Priority_Slots']);
});

// 13. fully target-compatible schema => zero additions / zero modifications.
test('R2 Corrective 13: fully target-compatible schema => zero additions / zero modifications', () => {
  const fullyCompatible = {
    fields: {
      Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
      Version_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
      Version_Number: { type: 'NUMBER', required: true, minValue: '1' },
      Version_Status: {
        type: 'DROP_DOWN',
        required: true,
        options: {
          DRAFT: { label: 'DRAFT', index: '0' },
          ACTIVE: { label: 'ACTIVE', index: '1' },
          CANCELLED: { label: 'CANCELLED', index: '2' },
          SUPERSEDED: { label: 'SUPERSEDED', index: '3' }
        }
      },
      Route_Pattern: {
        type: 'DROP_DOWN',
        required: true,
        options: {
          PATTERN_1_M1: { label: 'PATTERN_1_M1', index: '0' },
          PATTERN_2_M1_G1: { label: 'PATTERN_2_M1_G1', index: '1' },
          PATTERN_3A_M2_M1_G1: { label: 'PATTERN_3A_M2_M1_G1', index: '2' },
          PATTERN_3B_M1_G1_G2: { label: 'PATTERN_3B_M1_G1_G2', index: '3' },
          PATTERN_4_M2_M1_G1_G2: { label: 'PATTERN_4_M2_M1_G1_G2', index: '4' }
        }
      },
      Scorer_Priority_Slots: { type: 'SINGLE_LINE_TEXT', required: true },
      Effective_From: { type: 'DATE', required: true },
      Effective_To: { type: 'DATE', required: false }
    }
  };

  const plan = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 15,
    backupEvidence: validMockBackup,
    currentSchema: fullyCompatible
  });

  assert.equal(plan.diffPreview.addedFieldsCount, 0);
  assert.equal(plan.diffPreview.modifiedFieldsCount, 0);
  assert.equal(plan.diffPreview.additions.length, 0);
  assert.equal(plan.diffPreview.modifications.length, 0);
});

// 14. different existing target-field properties => different plan identity/evidence where appropriate.
test('R2 Corrective 14: different existing target-field properties => different plan identity/evidence', () => {
  const baseFields = {
    Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: false },
    Version_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
    Version_Number: { type: 'NUMBER', required: true, minValue: '1' },
    Effective_From: { type: 'DATE', required: true }
  };

  const schema1 = {
    fields: {
      ...baseFields,
      Scorer_Priority_Slots: { type: 'SINGLE_LINE_TEXT', required: false }
    }
  };

  const schema2 = {
    fields: {
      ...baseFields,
      Scorer_Priority_Slots: { type: 'SINGLE_LINE_TEXT', required: true }
    }
  };

  const plan1 = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schema1
  });

  const plan2 = generateRoutingSchemaMigrationPlan({
    targetAppId: 795,
    expectedRevision: 10,
    backupEvidence: validMockBackup,
    currentSchema: schema2
  });

  assert.notEqual(plan1.planId, plan2.planId);
  assert.notDeepEqual(plan1.currentSchemaEvidence, plan2.currentSchemaEvidence);
});

// 15. missing Version_Key => ready=false.
test('R2 Corrective 15: missing Version_Key => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Effective_From: '2026-04-01',
    Route_Pattern: 'PATTERN_1_M1',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('Missing Version_Key')));
});

// 16. Version_Key Routing_Key mismatch => ready=false.
test('R2 Corrective 16: Version_Key Routing_Key mismatch => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'OTHER#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Effective_From: '2026-04-01',
    Route_Pattern: 'PATTERN_1_M1',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('does not match Routing_Key')));
});

// 17. missing Version_Number => ready=false.
test('R2 Corrective 17: missing Version_Number => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Status: 'ACTIVE',
    Effective_From: '2026-04-01',
    Route_Pattern: 'PATTERN_1_M1',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('Missing Version_Number')));
});

// 18. Version_Number 0 / negative / non-integer => ready=false.
test('R2 Corrective 18: Version_Number 0 / negative / non-integer => ready=false', () => {
  for (const badVn of [0, -1, 1.5, 'abc']) {
    const rec = {
      Routing_Key: 'TMT1',
      Version_Key: 'TMT1#v1',
      Version_Number: badVn,
      Version_Status: 'ACTIVE',
      Effective_From: '2026-04-01',
      Route_Pattern: 'PATTERN_1_M1',
      Scorer_Priority_Slots: '[1]',
      Manager_Level1_Approvers: [{ code: 'm1' }],
      Manager_Level1_Approval_Rule: 'ALL'
    };
    const result = inspectD3Readiness({ app795Records: [rec] });
    assert.equal(result.ready, false);
    assert.ok(result.errors.some(e => e.includes('positive integer >= 1')));
  }
});

// 19. Version_Number inconsistent with Version_Key suffix => ready=false.
test('R2 Corrective 19: Version_Number inconsistent with Version_Key suffix => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v2',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Effective_From: '2026-04-01',
    Route_Pattern: 'PATTERN_1_M1',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('does not agree with Version_Key suffix')));
});

// 20. missing Version_Status => ready=false.
test('R2 Corrective 20: missing Version_Status => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Effective_From: '2026-04-01',
    Route_Pattern: 'PATTERN_1_M1',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('Missing Version_Status')));
});

// 21. invalid Version_Status => ready=false.
test('R2 Corrective 21: invalid Version_Status => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'PENDING_APPROVAL',
    Effective_From: '2026-04-01',
    Route_Pattern: 'PATTERN_1_M1',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('Invalid Version_Status')));
});

// 22. missing Route_Pattern => ready=false.
test('R2 Corrective 22: missing Route_Pattern => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Effective_From: '2026-04-01',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('Missing Route_Pattern')));
});

// 23. unknown Route_Pattern => ready=false.
test('R2 Corrective 23: unknown Route_Pattern => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Route_Pattern: 'PATTERN_CUSTOM_UNSUPPORTED',
    Effective_From: '2026-04-01',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('Unknown Route_Pattern')));
});

// 24. missing Effective_From => ready=false.
test('R2 Corrective 24: missing Effective_From => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Route_Pattern: 'PATTERN_1_M1',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('Missing Effective_From')));
});

// 25. malformed Effective_From => ready=false.
test('R2 Corrective 25: malformed Effective_From => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Route_Pattern: 'PATTERN_1_M1',
    Effective_From: '2026/04/01',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('not a valid calendar date')));
});

// 26. invalid calendar Effective_From => ready=false.
test('R2 Corrective 26: invalid calendar Effective_From => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Route_Pattern: 'PATTERN_1_M1',
    Effective_From: '2026-02-30', // Feb 30 does not exist
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('not a valid calendar date')));
});

// 27. malformed Effective_To => ready=false.
test('R2 Corrective 27: malformed Effective_To => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Route_Pattern: 'PATTERN_1_M1',
    Effective_From: '2026-04-01',
    Effective_To: 'not-a-date',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('Effective_To') && e.includes('not a valid calendar date')));
});

// 28. Effective_To < Effective_From => ready=false.
test('R2 Corrective 28: Effective_To < Effective_From => ready=false', () => {
  const rec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Route_Pattern: 'PATTERN_1_M1',
    Effective_From: '2026-04-01',
    Effective_To: '2026-03-31',
    Scorer_Priority_Slots: '[1]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [rec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('earlier than Effective_From')));
});

// 29. complete valid target record => ready=true.
test('R2 Corrective 29: complete valid target record => ready=true', () => {
  const validRec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Route_Pattern: 'PATTERN_2_M1_G1',
    Effective_From: '2026-04-01',
    Effective_To: '2027-03-31',
    Scorer_Priority_Slots: '[1, 2]',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL',
    GM_Level1_Approvers: [{ code: 'g1' }],
    GM_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [validRec] });
  assert.equal(result.ready, true);
  assert.equal(result.app795.status, 'PASS');
  assert.equal(result.errors.length, 0);
});

// 30. scorer R1 fail-closed regression remains PASS.
test('R2 Corrective 30: scorer R1 fail-closed regression remains PASS', () => {
  const missingScorerRec = {
    Routing_Key: 'TMT1',
    Version_Key: 'TMT1#v1',
    Version_Number: 1,
    Version_Status: 'ACTIVE',
    Route_Pattern: 'PATTERN_2_M1_G1',
    Effective_From: '2026-04-01',
    Manager_Level1_Approvers: [{ code: 'm1' }],
    Manager_Level1_Approval_Rule: 'ALL',
    GM_Level1_Approvers: [{ code: 'g1' }],
    GM_Level1_Approval_Rule: 'ALL'
  };
  const result = inspectD3Readiness({ app795Records: [missingScorerRec] });
  assert.equal(result.ready, false);
  assert.ok(result.errors.some(e => e.includes('SCORER_PLAN_NOT_CONFIGURED')));
});
