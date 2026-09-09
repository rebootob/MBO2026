import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RevisionArchiveService,
  RevisionArchiveError,
  ARCHIVE_EVENT_TYPES
} from '../src/services/revision-archive-service.js';

function makeValidLogicalSnapshot(overrides = {}) {
  return {
    source: {
      Record_Key: 'FY2026-EMP100',
      Employee_Code: 'EMP100',
      Fiscal_Year: 'FY2026',
      Record_ID: 101,
      ...overrides.source
    },
    stage: {
      Evaluation_Stage: 'OBJECTIVE',
      Revision_Number: 1,
      Previous_Status: '05 Objective Approved',
      ...overrides.stage
    },
    profile: {
      Frozen_Profile_Code: 'PROF_STAFF_CHIEF',
      K_expected_Snapshot: 2,
      ...overrides.profile
    },
    route: {
      Effective_Routing_Key: 'TME1',
      Effective_Route_Version_Key: 'TME1#v1',
      Route_Pattern: 'PATTERN_2_M1_G1',
      Routing_Topology: 'M1_G1',
      Workflow_Appraisers: [{ code: 'mgr_somchai' }, { code: 'gm_somrudee' }],
      ...overrides.route
    },
    scoring: {
      Scorers: [
        { code: 'mgr_somchai', weight: 50 },
        { code: 'gm_somrudee', weight: 50 }
      ],
      ...overrides.scoring
    },
    hoshin: {
      Department_Hoshin_Key: 'H1',
      ...overrides.hoshin
    },
    config: {
      Configuration_Hash: 'cfg-hash-1',
      ...overrides.config
    },
    business: {
      Objective_Count: 1,
      Objectives: [{ title: 'Obj 1', weight: 100 }],
      ...overrides.business
    },
    computed: {
      PartA_Raw_Score: 85.0,
      ...overrides.computed
    }
  };
}

function createInMemoryKintoneAdapter() {
  const store = new Map();
  let nextId = 1;
  let addRecordCallCount = 0;

  return {
    store,
    get addRecordCallCount() {
      return addRecordCallCount;
    },
    getRecords: async (appId, query) => {
      const match = query.match(/Archive_Key = "([^"]+)"/);
      if (!match) return { records: [] };
      const unescapedKey = match[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      const records = [];
      for (const rec of store.values()) {
        if (rec.Archive_Key?.value === unescapedKey) {
          records.push(rec);
        }
      }
      return { records };
    },
    addRecord: async (appId, recordPayload) => {
      addRecordCallCount++;
      const id = nextId++;
      const savedRecord = {
        $id: { value: String(id) },
        ...recordPayload
      };
      store.set(id, savedRecord);
      return { id, revision: 1 };
    }
  };
}

test('Idempotency: no existing key -> creates exactly one row', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);
  const snap = makeValidLogicalSnapshot();

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: 'somchai_mgr',
    logicalSnapshot: snap
  });

  assert.equal(res.verified, true);
  assert.equal(res.idempotentReplay, false);
  assert.equal(adapter.addRecordCallCount, 1);
  assert.equal(adapter.store.size, 1);
});

test('Idempotency: exact logical replay returns idempotent success and creates ZERO new rows', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);
  const snap = makeValidLogicalSnapshot();

  const params = {
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: 'somchai_mgr',
    logicalSnapshot: snap,
    archivedAt: '2026-04-01T10:00:00.000Z'
  };

  // First call
  const res1 = await service.archiveStageCompletion(params);
  assert.equal(res1.verified, true);
  assert.equal(res1.idempotentReplay, false);
  assert.equal(adapter.addRecordCallCount, 1);
  assert.equal(adapter.store.size, 1);

  // Second call (replay, even with later attempt timestamp)
  const res2 = await service.archiveStageCompletion({
    ...params,
    archivedAt: '2026-04-01T10:05:00.000Z' // Later retry timestamp
  });

  assert.equal(res2.verified, true);
  assert.equal(res2.idempotentReplay, true);
  assert.equal(res2.archiveKey, res1.archiveKey);
  assert.equal(res2.snapshotHash, res1.snapshotHash);
  // Preserves originally stored timestamp
  assert.equal(res2.archivedAt, '2026-04-01T10:00:00.000Z');

  // Proves ZERO new rows created
  assert.equal(adapter.addRecordCallCount, 1);
  assert.equal(adapter.store.size, 1);
});

test('Idempotency: same key + different Snapshot_Hash -> fails closed with ARCHIVE_IDEMPOTENCY_CONFLICT', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);

  const snap1 = makeValidLogicalSnapshot({
    business: { Objectives: [{ title: 'Obj A', weight: 100 }] }
  });
  const snap2 = makeValidLogicalSnapshot({
    business: { Objectives: [{ title: 'Obj B', weight: 100 }] } // Different content -> different hash
  });

  const params = {
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: 'somchai_mgr'
  };

  // First call succeeds
  await service.archiveStageCompletion({ ...params, logicalSnapshot: snap1 });

  // Second call with altered snapshot fails closed
  await assert.rejects(
    async () => service.archiveStageCompletion({ ...params, logicalSnapshot: snap2 }),
    (err) => {
      assert.equal(err instanceof RevisionArchiveError, true);
      assert.equal(err.code, 'ARCHIVE_IDEMPOTENCY_CONFLICT');
      return true;
    }
  );

  // Still exactly 1 row
  assert.equal(adapter.store.size, 1);
});

test('Idempotency: same key + different actor -> fails closed with ARCHIVE_IDEMPOTENCY_CONFLICT', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);
  const snap = makeValidLogicalSnapshot();

  const params = {
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    logicalSnapshot: snap
  };

  await service.archiveStageCompletion({ ...params, actor: 'user_one' });

  await assert.rejects(
    async () => service.archiveStageCompletion({ ...params, actor: 'user_two' }),
    /ARCHIVE_IDEMPOTENCY_CONFLICT/
  );
});

test('Idempotency: same key + different reason -> fails closed with ARCHIVE_IDEMPOTENCY_CONFLICT', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);
  const snap = makeValidLogicalSnapshot();

  const params = {
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    oldRevisionNumber: 1,
    newRevisionNumber: 2,
    actor: 'hr_admin',
    logicalSnapshot: snap
  };

  await service.archiveEvaluationRevisionCreated({ ...params, reason: 'First business reason approved' });

  await assert.rejects(
    async () => service.archiveEvaluationRevisionCreated({ ...params, reason: 'Second completely different reason' }),
    /ARCHIVE_IDEMPOTENCY_CONFLICT/
  );
});

test('Idempotency: multiple existing rows for exact key -> fails closed with ARCHIVE_DUPLICATE_KEY_CORRUPTION', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const snap = makeValidLogicalSnapshot();

  // Manually seed duplicate rows
  const dupPayload = {
    Archive_Key: { value: 'FY2026-EMP100|OBJECTIVE|R1|STAGE_COMPLETION' },
    Source_Record_Key: { value: 'FY2026-EMP100' },
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: 'EMP100' },
    Evaluation_Stage: { value: 'OBJECTIVE' },
    Revision_Number: { value: '1' },
    Event_Type: { value: 'STAGE_COMPLETION_SNAPSHOT' },
    Reason: { value: 'reason' },
    Snapshot_JSON: { value: '{}' },
    Snapshot_Hash: { value: 'hash' },
    Archived_By: { value: [{ code: 'mgr' }] },
    Archived_At: { value: '2026-04-01T00:00:00Z' }
  };
  await adapter.addRecord(798, dupPayload);
  await adapter.addRecord(798, dupPayload); // Duplicate row in storage

  const service = new RevisionArchiveService(adapter);

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: 'mgr',
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_DUPLICATE_KEY_CORRUPTION');
      return true;
    }
  );
});

test('Immutability: retry never mutates existing App 798 row', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);
  const snap = makeValidLogicalSnapshot();

  const originalTimestamp = '2026-04-01T08:00:00.000Z';
  await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: 'somchai_mgr',
    logicalSnapshot: snap,
    archivedAt: originalTimestamp
  });

  // Replay attempt with a different attempted timestamp
  await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: 'somchai_mgr',
    logicalSnapshot: snap,
    archivedAt: '2026-04-01T12:00:00.000Z'
  });

  // Check stored record directly: original archivedAt remains untouched
  const stored = [...adapter.store.values()][0];
  assert.equal(stored.Archived_At.value, originalTimestamp);
});
