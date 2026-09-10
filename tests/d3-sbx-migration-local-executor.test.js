import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../project-docs/evidence/D3_SBX_MIGRATION_01_PRE1_MANIFEST.json' with { type: 'json' };

import {
  D3_EXE1_WORK_PACKAGE,
  D3_EXE1_MODE,
  D3_EXE1_LIVE_IO_LOCKED,
  D3_EXE1_ROUTE_MANIFEST_SHA256,
  APP794_PROVENANCE_FIELD_CODES,
  assertExe1LocalAuthorization,
  assertRouteManifestIntegrity,
  assertScorerMappingApproval,
  buildApp795SchemaStages,
  buildApp795SeedOperations,
  applyApp795SeedOperationsLocal,
  assertApp795SeedReadBack,
  buildApp794ProvenancePlan,
  applyApp794BackfillLocal,
  executeD3SandboxMigrationLocalOnly,
  executeLiveD3SandboxMigration
} from '../scripts/kintone/d3-sbx-migration-local-executor.js';

const localAuth = Object.freeze({
  workPackageId: D3_EXE1_WORK_PACKAGE,
  explicitOwnerAuthorization: true,
  mode: D3_EXE1_MODE,
  localOnly: true,
  testOnly: true,
  kintoneReadAllowed: false,
  kintoneWriteAllowed: false,
  schemaWriteAllowed: false,
  processWriteAllowed: false,
  deploymentAllowed: false
});

const scorerApprovalTestOnly = Object.freeze({
  approved: true,
  explicitOwnerHrApproval: true,
  decisionRef: 'TEST_ONLY_DO_NOT_TREAT_AS_BUSINESS_APPROVAL',
  mapping: Object.freeze({
    M1_G1: Object.freeze([1, 2]),
    M1_ONLY: Object.freeze([1])
  })
});

const backup = appId => ({
  appId,
  captured: true,
  verified: true,
  sha256: 'a'.repeat(64),
  artifactPath: `TEST_ONLY/app${appId}-backup.json`
});

function rowObject(rawRow) {
  return Object.fromEntries(manifest.columns.map((column, index) => [column, rawRow[index]]));
}

function userList(codes) {
  return { value: codes.map(code => ({ code })) };
}

function buildApp795Records() {
  return manifest.rows.map(rawRow => {
    const row = rowObject(rawRow);
    return {
      $id: { value: String(row.sourceRecordId) },
      $revision: { value: String(row.expectedSourceRevision) },
      Routing_Key: { value: row.routingKey },
      Section_Code: { value: row.sectionCode },
      Section_Name: { value: row.sectionName },
      Team: { value: row.team },
      Requester_User: userList(row.requesterUsers),
      Manager_Level2_Approvers: userList(row.M2),
      Manager_Level1_Approvers: userList(row.M1),
      GM_Level1_Approvers: userList(row.G1),
      GM_Level2_Approvers: userList(row.G2),
      Manager_Level2_Approval_Rule: { value: row.M2Rule || 'ANY' },
      Manager_Level1_Approval_Rule: { value: row.M1Rule },
      GM_Level1_Approval_Rule: { value: row.G1Rule || 'ANY' },
      GM_Level2_Approval_Rule: { value: row.G2Rule || 'ANY' },
      Effective_From: { value: row.effectiveFrom },
      Effective_To: { value: row.effectiveTo },
      Remark: { value: row.remarkPreserve }
    };
  });
}

const app795LegacySchema = {
  fields: {
    Routing_Key: { type: 'SINGLE_LINE_TEXT', required: true, unique: true },
    Effective_From: { type: 'DATE', required: false },
    Effective_To: { type: 'DATE', required: false }
  }
};

const app794LegacySchema = { fields: {} };
const app794Records = [{
  $id: { value: '1' },
  $revision: { value: '7' },
  Record_Key: { value: 'FY2026-E001' }
}];

const explicitApp794PolicyTestOnly = {
  explicitlyResolved: true,
  decisionRef: 'TEST_ONLY_DO_NOT_TREAT_AS_BUSINESS_POLICY',
  mode: 'EXPLICIT_BACKFILL',
  records: [{
    recordId: '1',
    expectedRevision: '7',
    values: {
      Frozen_Profile_Code: 'TEST_PROFILE',
      K_expected_Snapshot: 2,
      Effective_Routing_Key: 'TMT1',
      Effective_Route_Version_Key: 'TMT1#v1',
      Effective_Scorer_Slots_Snapshot: '[1,2]'
    }
  }]
};

test('EXE1 authorization is strictly LOCAL_TEST_ONLY and live I/O remains locked', () => {
  assert.equal(D3_EXE1_LIVE_IO_LOCKED, true);
  assert.equal(assertExe1LocalAuthorization(localAuth), true);
  assert.throws(
    () => assertExe1LocalAuthorization({ ...localAuth, kintoneReadAllowed: true }),
    /EXE1_LIVE_IO_FORBIDDEN/
  );
  assert.throws(() => executeLiveD3SandboxMigration(), /D3_EXE1_LIVE_IO_LOCKED/);
});

test('real PRE1 manifest has exact authoritative 20-route integrity contract', () => {
  const result = assertRouteManifestIntegrity(manifest);
  assert.equal(result.sha256, D3_EXE1_ROUTE_MANIFEST_SHA256);
  assert.equal(result.routeCount, 20);
  assert.deepEqual(result.distribution, { M1_G1: 17, M1_ONLY: 3 });
});

test('manifest drift fails closed before any simulated migration step', () => {
  const changed = structuredClone(manifest);
  changed.rows[0][changed.columns.indexOf('routingKey')] = 'XME1';
  assert.throws(() => assertRouteManifestIntegrity(changed), /ROUTE_MANIFEST_HASH_MISMATCH/);
});

test('App795 schema is staged optional before exact row seed and finalized afterwards', () => {
  const plan = buildApp795SchemaStages({
    currentSchema: app795LegacySchema,
    manifest,
    backupEvidence: backup(795)
  });
  assert.deepEqual(plan.stages.map(stage => stage.id), [
    'STAGE_OPTIONAL_FIELD_ADDITIONS',
    'STAGE_EXACT_20_ROW_SEED',
    'STAGE_FINAL_FIELD_PROPERTIES'
  ]);
  const versionKeyAdd = plan.stages[0].operations.find(op => op.fieldCode === 'Version_Key');
  assert.ok(versionKeyAdd);
  assert.equal(versionKeyAdd.spec.required, false);
  assert.equal(versionKeyAdd.spec.unique, false);
  const versionKeyFinal = plan.stages[2].operations.find(op => op.fieldCode === 'Version_Key');
  assert.equal(versionKeyFinal.target.required, true);
  assert.equal(versionKeyFinal.target.unique, true);
  assert.equal(plan.invariants.noKintoneIo, true);
});

test('App795 incompatible field type fails closed locally', () => {
  const incompatible = structuredClone(app795LegacySchema);
  incompatible.fields.Routing_Key.type = 'NUMBER';
  assert.throws(
    () => buildApp795SchemaStages({
      currentSchema: incompatible,
      manifest,
      backupEvidence: backup(795)
    }),
    /INCOMPATIBLE_FIELD_TYPE/
  );
});

test('scorer mapping is never inferred: explicit Owner/HR approval object is required', () => {
  assert.throws(() => assertScorerMappingApproval(null), /SCORER_MAPPING_NOT_OWNER_HR_APPROVED/);
  assert.throws(
    () => buildApp795SeedOperations({ manifest, scorerApproval: null }),
    /SCORER_MAPPING_NOT_OWNER_HR_APPROVED/
  );
  assert.equal(assertScorerMappingApproval(scorerApprovalTestOnly), true);
});

test('exact 20 App795 seed operations are revision guarded and read back deterministically', () => {
  const operations = buildApp795SeedOperations({
    manifest,
    scorerApproval: scorerApprovalTestOnly
  });
  assert.equal(operations.length, 20);
  assert.equal(new Set(operations.map(op => op.recordId)).size, 20);
  assert.ok(operations.every(op => /^[1-9]\d*$/.test(op.expectedRevision)));
  assert.ok(operations.every(op => op.operation === 'UPDATE_EXISTING_RECORD_LOCAL_CONTRACT'));

  const records = applyApp795SeedOperationsLocal({
    records: buildApp795Records(),
    operations
  });
  assert.equal(assertApp795SeedReadBack({
    manifest,
    records,
    scorerApproval: scorerApprovalTestOnly
  }), true);
});

test('App795 source record revision drift stops the local seed contract', () => {
  const operations = buildApp795SeedOperations({
    manifest,
    scorerApproval: scorerApprovalTestOnly
  });
  const records = buildApp795Records();
  records[0].$revision.value = String(Number(records[0].$revision.value) + 1);
  assert.throws(
    () => applyApp795SeedOperationsLocal({ records, operations }),
    /APP795_RECORD_REVISION_DRIFT/
  );
});

test('App794 historical provenance remains machine-blocking while policy is unresolved', () => {
  assert.throws(
    () => buildApp794ProvenancePlan({
      currentSchema: app794LegacySchema,
      existingRecords: app794Records,
      policy: null,
      backupEvidence: backup(794)
    }),
    /APP794_EXISTING_RECORD_PROVENANCE_BACKFILL_POLICY_NOT_DEFINED/
  );
});

test('App794 defer policy adds optional fields only and invents zero historical values', () => {
  const plan = buildApp794ProvenancePlan({
    currentSchema: app794LegacySchema,
    existingRecords: app794Records,
    policy: {
      explicitlyResolved: true,
      decisionRef: 'TEST_ONLY_DEFER_POLICY',
      mode: 'DEFER_REQUIREDNESS_NO_BACKFILL'
    },
    backupEvidence: backup(794)
  });
  assert.equal(plan.additions.length, 5);
  assert.ok(plan.additions.every(op => op.spec.required === false));
  assert.equal(plan.backfillOperations.length, 0);
  assert.equal(plan.finalRequirednessOperations.length, 0);
  assert.equal(plan.requirednessDeferred, true);
  assert.equal(plan.noBusinessValueInvented, true);
});

test('App794 explicit test-only policy creates exact revision-guarded backfill and can be applied in memory', () => {
  const plan = buildApp794ProvenancePlan({
    currentSchema: app794LegacySchema,
    existingRecords: app794Records,
    policy: explicitApp794PolicyTestOnly,
    backupEvidence: backup(794)
  });
  assert.equal(plan.backfillOperations.length, 1);
  assert.equal(plan.backfillOperations[0].expectedRevision, '7');
  assert.equal(plan.finalRequirednessOperations.length, APP794_PROVENANCE_FIELD_CODES.length);

  const result = applyApp794BackfillLocal({ records: app794Records, plan });
  assert.equal(result[0].Frozen_Profile_Code, 'TEST_PROFILE');
  assert.equal(result[0].K_expected_Snapshot, 2);
});

test('full EXE1 execution is in-memory only, calls no fetch, and reports zero live operations', () => {
  const originalFetch = globalThis.fetch;
  let fetchCalls = 0;
  globalThis.fetch = async () => {
    fetchCalls += 1;
    throw new Error('NETWORK_CALL_FORBIDDEN_IN_EXE1_TEST');
  };

  try {
    const result = executeD3SandboxMigrationLocalOnly({
      authorization: localAuth,
      manifest,
      scorerApproval: scorerApprovalTestOnly,
      app795: {
        currentSchema: app795LegacySchema,
        records: buildApp795Records(),
        backupEvidence: backup(795)
      },
      app794: {
        currentSchema: app794LegacySchema,
        records: app794Records,
        backupEvidence: backup(794),
        policy: explicitApp794PolicyTestOnly
      }
    });

    assert.equal(result.status, 'LOCAL_SIMULATION_PASS');
    assert.equal(fetchCalls, 0);
    assert.deepEqual(
      {
        kintoneReads: result.evidence.kintoneReads,
        kintoneWrites: result.evidence.kintoneWrites,
        schemaWrites: result.evidence.schemaWrites,
        processWrites: result.evidence.processWrites,
        deployments: result.evidence.deployments
      },
      {
        kintoneReads: 0,
        kintoneWrites: 0,
        schemaWrites: 0,
        processWrites: 0,
        deployments: 0
      }
    );
    assert.equal(result.evidence.app795SeedOperationCount, 20);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
