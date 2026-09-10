import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { routingFields } from '../config/schema-spec.js';
import { D3_EXE1_LIVE_IO_LOCKED } from '../scripts/kintone/d3-sbx-migration-local-executor.js';
import {
  D3_ALLOWED_WRITE_APP_IDS,
  D3_APP795_ACL_BASELINE,
  D3_APP795_CONTRACT_AWARE_SHA256,
  D3_APP794_PROCESS_CANONICAL_SHA256,
  D3_EXE1_ROUTE_MANIFEST_SHA256,
  D3_GUARD_READ_APP_IDS,
  D3_LIVE_MIGRATION_MODE,
  D3_LIVE_MIGRATION_WORK_PACKAGE,
  D3_PREWRITE_BACKUP_SHA256,
  assertD3LiveMigrationAuthorization,
  executeD3GuardedLiveMigration
} from '../scripts/kintone/d3-sbx-migration-live-runner.js';

const manifest = JSON.parse(await readFile(
  new URL('../project-docs/evidence/D3_SBX_MIGRATION_01_PRE1_MANIFEST.json', import.meta.url),
  'utf8'
));

const REVIEWED_HEAD = '1111111111111111111111111111111111111111';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function rowObject(rawRow) {
  return Object.fromEntries(manifest.columns.map((column, index) => [column, rawRow[index]]));
}

function userValues(codes) {
  return codes.map(code => ({ code }));
}

function makeRouteRecords() {
  return manifest.rows.map(rawRow => {
    const row = rowObject(rawRow);
    return {
      $id: String(row.sourceRecordId),
      $revision: String(row.expectedSourceRevision),
      Routing_Key: row.routingKey,
      Requester_User: userValues(row.requesterUsers),
      Manager_Level2_Approvers: userValues(row.M2),
      Manager_Level1_Approvers: userValues(row.M1),
      GM_Level1_Approvers: userValues(row.G1),
      GM_Level2_Approvers: userValues(row.G2),
      Manager_Level2_Approval_Rule: row.M2.length ? 'ALL' : 'ANY',
      Manager_Level1_Approval_Rule: 'ALL',
      GM_Level1_Approval_Rule: row.G1.length ? 'ALL' : 'ANY',
      GM_Level2_Approval_Rule: row.G2.length ? 'ALL' : 'ANY',
      Effective_From: row.effectiveFrom,
      Effective_To: row.effectiveTo
    };
  });
}

function fillers(count, prefix) {
  return Object.fromEntries(Array.from({ length: count }, (_, index) => [
    `${prefix}_${String(index + 1).padStart(3, '0')}`,
    { type: 'SINGLE_LINE_TEXT', required: false }
  ]));
}

function makeApp795Schema() {
  return {
    fields: {
      Routing_Key: clone(routingFields.Routing_Key),
      Effective_From: clone(routingFields.Effective_From),
      Effective_To: clone(routingFields.Effective_To),
      ...fillers(25, 'LEGACY795')
    }
  };
}

function makeState() {
  return {
    794: {
      appId: 794,
      revision: '70',
      schema: { fields: fillers(344, 'LEGACY794') },
      records: [{ $id: '1', $revision: '1' }],
      process: {
        enabled: true,
        stateCount: 16,
        actionCount: 31,
        canonicalSha256: D3_APP794_PROCESS_CANONICAL_SHA256
      }
    },
    795: {
      appId: 795,
      revision: '11',
      schema: makeApp795Schema(),
      records: makeRouteRecords(),
      aclBaseline: clone(D3_APP795_ACL_BASELINE),
      contractAwareComparisonSha256: D3_APP795_CONTRACT_AWARE_SHA256
    },
    798: {
      appId: 798,
      revision: '5',
      schema: { fields: fillers(23, 'LEGACY798') },
      records: [],
      stableHash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    }
  };
}

function snapshot(state, appId) {
  const value = clone(state[appId]);
  value.fieldCount = Object.keys(value.schema.fields).length;
  value.recordCount = value.records.length;
  return value;
}

function applySchemaOps(state, appId, operations) {
  const fields = state[appId].schema.fields;
  for (const operation of operations) {
    if (operation.operation === 'ADD_FIELD_STAGED_OPTIONAL') {
      fields[operation.fieldCode] = clone(operation.spec);
      for (const record of state[appId].records) record[operation.fieldCode] = '';
    } else if (operation.operation === 'FINALIZE_FIELD_PROPERTIES') {
      fields[operation.fieldCode] = {
        ...fields[operation.fieldCode],
        ...clone(operation.target)
      };
    } else {
      throw new Error(`FAKE_UNSUPPORTED_SCHEMA_OPERATION:${operation.operation}`);
    }
  }
}

function makeFakeIo({ mutateApp798AtFinalRead = false, failStagePhase = null } = {}) {
  const state = makeState();
  const calls = [];
  let app798Reads = 0;
  const io = {
    async readAppSnapshot(appId) {
      calls.push({ kind: 'read', appId });
      if (appId === 798) {
        app798Reads += 1;
        if (mutateApp798AtFinalRead && app798Reads > 1) {
          state[798].stableHash = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
        }
      }
      return snapshot(state, appId);
    },
    async stageFormSchema({ appId, operations, phase }) {
      calls.push({ kind: 'stage-schema', appId, phase, operationCount: operations.length });
      if (failStagePhase === phase) throw new Error(`FAKE_STAGE_FAILURE:${phase}`);
      applySchemaOps(state, appId, operations);
      return { previewRevision: String(Number(state[appId].revision) + 1) };
    },
    async activateFormSchema({ appId, phase }) {
      calls.push({ kind: 'activate-schema', appId, phase });
      state[appId].revision = String(Number(state[appId].revision) + 1);
      return { revision: state[appId].revision };
    },
    async updateExistingRecords({ appId, operations, atomic, phase }) {
      calls.push({ kind: 'update-records', appId, atomic, phase, operationCount: operations.length });
      assert.equal(appId, 795);
      assert.equal(atomic, true);
      const byId = new Map(state[795].records.map(record => [String(record.$id), record]));
      for (const operation of operations) {
        const record = byId.get(String(operation.recordId));
        assert.ok(record);
        assert.equal(String(record.$revision), String(operation.expectedRevision));
        Object.assign(record, clone(operation.values));
        record.$revision = String(Number(record.$revision) + 1);
      }
      return { updated: operations.length };
    }
  };
  return { io, state, calls };
}

function makeLedger() {
  const consumed = new Set();
  return {
    consumed,
    async consumeAuthorizationId(id) {
      if (consumed.has(id)) return false;
      consumed.add(id);
      return true;
    }
  };
}

function authorization(overrides = {}) {
  return {
    workPackageId: D3_LIVE_MIGRATION_WORK_PACKAGE,
    mode: D3_LIVE_MIGRATION_MODE,
    explicitOwnerAuthorization: true,
    authorizationId: 'AUTH-PREEXEC-TEST-001',
    reviewedPreexecHead: REVIEWED_HEAD,
    expectedCanonicalHead: REVIEWED_HEAD,
    prewriteBackupSha256: D3_PREWRITE_BACKUP_SHA256,
    routeManifestSha256: D3_EXE1_ROUTE_MANIFEST_SHA256,
    app794Policy: 'DEFER_REQUIREDNESS_NO_BACKFILL',
    allowedWriteAppIds: [...D3_ALLOWED_WRITE_APP_IDS],
    allowedReadAppIds: [...D3_GUARD_READ_APP_IDS],
    kintoneReadAllowed: true,
    schemaWriteAllowed: true,
    recordWriteAllowed: true,
    schemaActivationDeployAllowed: true,
    app795AtomicRecordUpdateRequired: true,
    retainBackupUntilIndependentReview: true,
    stopOnDrift: true,
    processWriteAllowed: false,
    aclWriteAllowed: false,
    customizationWriteAllowed: false,
    recordCreateAllowed: false,
    recordDeleteAllowed: false,
    historicalBackfillAllowed: false,
    automaticRetryAllowed: false,
    automaticRollbackAllowed: false,
    ...overrides
  };
}

const scorerApproval = {
  approved: true,
  explicitOwnerHrApproval: true,
  decisionRef: 'D3-SBX-MIGRATION-01-BD1-HR1',
  mapping: { M1_G1: [1, 2], M1_ONLY: [1] }
};

const app794Policy = {
  explicitlyResolved: true,
  decisionRef: 'D3-SBX-MIGRATION-01-BD1',
  mode: 'DEFER_REQUIREDNESS_NO_BACKFILL'
};

function executionArgs(io, ledger, auth = authorization()) {
  return {
    authorization: auth,
    currentCanonicalHead: REVIEWED_HEAD,
    manifest,
    scorerApproval,
    app794Policy,
    io,
    authorizationLedger: ledger
  };
}

test('reviewed LOCAL_TEST_ONLY executor remains live-I/O locked', () => {
  assert.equal(D3_EXE1_LIVE_IO_LOCKED, true);
});

test('future live authorization rejects scope widening and missing narrow schema activation authority', () => {
  const invalidCases = [
    authorization({ allowedWriteAppIds: [794, 795, 798] }),
    authorization({ processWriteAllowed: true }),
    authorization({ aclWriteAllowed: true }),
    authorization({ customizationWriteAllowed: true }),
    authorization({ recordCreateAllowed: true }),
    authorization({ recordDeleteAllowed: true }),
    authorization({ historicalBackfillAllowed: true }),
    authorization({ automaticRetryAllowed: true }),
    authorization({ automaticRollbackAllowed: true }),
    authorization({ schemaActivationDeployAllowed: false })
  ];
  for (const auth of invalidCases) {
    assert.throws(
      () => assertD3LiveMigrationAuthorization({ authorization: auth, currentCanonicalHead: REVIEWED_HEAD })
    );
  }
});

test('Git HEAD mismatch fails before any I/O or write', async () => {
  const { io, calls } = makeFakeIo();
  const ledger = makeLedger();
  await assert.rejects(
    executeD3GuardedLiveMigration({
      ...executionArgs(io, ledger),
      currentCanonicalHead: '2222222222222222222222222222222222222222'
    }),
    /HEAD_OR_LIVE_DRIFT/
  );
  assert.equal(calls.length, 0);
  assert.equal(ledger.consumed.size, 0);
});

test('App795 record revision drift fails before authorization consumption and before writes', async () => {
  const fake = makeFakeIo();
  fake.state[795].records[0].$revision = '999';
  const ledger = makeLedger();
  await assert.rejects(executeD3GuardedLiveMigration(executionArgs(fake.io, ledger)), /APP795_RECORD_REVISION_DRIFT/);
  assert.equal(ledger.consumed.size, 0);
  assert.equal(fake.calls.filter(call => call.kind !== 'read').length, 0);
});

test('App795 ACL drift fails before authorization consumption and before writes', async () => {
  const fake = makeFakeIo();
  fake.state[795].aclBaseline.hrAdminGroup = 'FULL';
  const ledger = makeLedger();
  await assert.rejects(executeD3GuardedLiveMigration(executionArgs(fake.io, ledger)), /APP795_ACL_DRIFT/);
  assert.equal(ledger.consumed.size, 0);
  assert.equal(fake.calls.filter(call => call.kind !== 'read').length, 0);
});

test('happy path follows bounded sequence and writes only Apps 794 and 795', async () => {
  const fake = makeFakeIo();
  const result = await executeD3GuardedLiveMigration(executionArgs(fake.io, makeLedger()));
  assert.equal(result.status, 'MIGRATION_EXECUTION_COMPLETE_REVIEW_PENDING');
  const writeCalls = fake.calls.filter(call => call.kind !== 'read');
  assert.deepEqual([...new Set(writeCalls.map(call => call.appId))].sort(), [794, 795]);
  assert.equal(writeCalls.some(call => call.appId === 798), false);
  assert.equal(writeCalls.some(call => call.appId === 796 || call.appId === 797 || call.appId === 800), false);
  const recordWrites = writeCalls.filter(call => call.kind === 'update-records');
  assert.equal(recordWrites.length, 1);
  assert.equal(recordWrites[0].appId, 795);
  assert.equal(recordWrites[0].operationCount, 20);
  assert.equal(recordWrites[0].atomic, true);
  assert.equal(result.noHistoricalBackfill, true);
  assert.equal(result.independentReviewRequired, true);
});

test('App794 receives schema-only provenance additions and zero historical record writes', async () => {
  const fake = makeFakeIo();
  await executeD3GuardedLiveMigration(executionArgs(fake.io, makeLedger()));
  assert.equal(
    fake.calls.some(call => call.kind === 'update-records' && call.appId === 794),
    false
  );
  const app794Schema = fake.calls.find(call => call.kind === 'stage-schema' && call.appId === 794);
  assert.equal(app794Schema.operationCount, 5);
  for (const field of [
    'Frozen_Profile_Code',
    'K_expected_Snapshot',
    'Effective_Routing_Key',
    'Effective_Route_Version_Key',
    'Effective_Scorer_Slots_Snapshot'
  ]) {
    assert.equal(fake.state[794].records[0][field], '');
    assert.notEqual(fake.state[794].schema.fields[field]?.required, true);
  }
});

test('App798 drift after first write produces partial-write STOP and never writes App798', async () => {
  const fake = makeFakeIo({ mutateApp798AtFinalRead: true });
  await assert.rejects(
    executeD3GuardedLiveMigration(executionArgs(fake.io, makeLedger())),
    error => {
      assert.equal(error.code, 'D3_LIVE_PARTIAL_WRITE_STOP');
      assert.equal(error.noAutomaticRetry, true);
      assert.equal(error.noAutomaticRollback, true);
      assert.equal(error.requiresIndependentRecoveryAuthorization, true);
      return true;
    }
  );
  assert.equal(fake.calls.some(call => call.kind !== 'read' && call.appId === 798), false);
});

test('post-first-write failure does not retry or rollback automatically', async () => {
  const fake = makeFakeIo({ failStagePhase: 'APP795_STAGE_OPTIONAL_FIELDS' });
  await assert.rejects(
    executeD3GuardedLiveMigration(executionArgs(fake.io, makeLedger())),
    error => {
      assert.equal(error.code, 'D3_LIVE_PARTIAL_WRITE_STOP');
      assert.equal(error.noAutomaticRetry, true);
      assert.equal(error.noAutomaticRollback, true);
      return true;
    }
  );
  const nonReads = fake.calls.filter(call => call.kind !== 'read');
  assert.equal(nonReads.length, 1);
  assert.equal(nonReads[0].phase, 'APP795_STAGE_OPTIONAL_FIELDS');
});

test('authorization replay is rejected before a second write attempt', async () => {
  const ledger = makeLedger();
  const first = makeFakeIo();
  await executeD3GuardedLiveMigration(executionArgs(first.io, ledger));

  const second = makeFakeIo();
  await assert.rejects(
    executeD3GuardedLiveMigration(executionArgs(second.io, ledger)),
    /D3_AUTHORIZATION_REPLAY_OR_LEDGER_REJECTED/
  );
  assert.equal(second.calls.filter(call => call.kind !== 'read').length, 0);
});
