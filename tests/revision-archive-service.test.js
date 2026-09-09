import test from 'node:test';
import assert from 'node:assert/strict';

import {
  RevisionArchiveService,
  RevisionArchiveError,
  ARCHIVE_EVENT_TYPES,
  ARCHIVE_EVALUATION_STAGES,
  buildArchiveKey
} from '../src/services/revision-archive-service.js';
import { RevisionArchiveKintoneRepository } from '../src/services/revision-archive-kintone-repository.js';
import { hashD3Snapshot } from '../src/services/d3-snapshot-serializer.js';

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
    },
    ...overrides.topLevel
  };
}

function createInMemoryKintoneAdapter() {
  const store = new Map();
  let nextId = 1;

  return {
    store,
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

const TEST_DEFAULT_CLOCK = () => '2026-04-01T12:00:00.000Z';

// ----------------------------------------------------
// 1. EVENT TAXONOMY
// ----------------------------------------------------

test('TC01: Event taxonomy: stage completion event accepted', () => {
  const key = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1
  });
  assert.equal(key, 'FY2026-EMP100|OBJECTIVE|R1|STAGE_COMPLETION');
});

test('TC02: Event taxonomy: evaluation revision-created event accepted', () => {
  const key = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    supersededByRevision: 2
  });
  assert.equal(key, 'FY2026-EMP100|OBJECTIVE|R1|EVALUATION_REVISION_CREATED|TO_R2');
});

test('TC03: Event taxonomy: route reassignment prechange event accepted', () => {
  const key = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'MIDYEAR',
    revisionNumber: 1,
    stableEventId: 'evt-reassign-777'
  });
  assert.equal(key, 'FY2026-EMP100|MIDYEAR|R1|ROUTE_REASSIGNMENT_PRECHANGE|evt-reassign-777');
});

test('TC04: Event taxonomy: unsupported event type rejected', () => {
  assert.throws(
    () => buildArchiveKey({
      eventType: 'UNKNOWN_EVENT_TYPE',
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1
    }),
    (err) => {
      assert.equal(err instanceof RevisionArchiveError, true);
      assert.equal(err.code, 'ARCHIVE_UNSUPPORTED_EVENT_TYPE');
      return true;
    }
  );
});

test('TC05: Event taxonomy: no date-boundary archive event exists', () => {
  const repo = new RevisionArchiveKintoneRepository(createInMemoryKintoneAdapter());
  const service = new RevisionArchiveService(repo, { clock: TEST_DEFAULT_CLOCK });

  assert.equal(typeof service.archiveOnEffectiveDate, 'undefined');
  assert.equal(typeof service.archiveOnDateChange, 'undefined');
  assert.equal(typeof service.archiveOnRouteVersionActivation, 'undefined');

  // Verify only three locked event types in taxonomy
  const eventTypes = Object.values(ARCHIVE_EVENT_TYPES);
  assert.deepEqual(eventTypes, [
    'STAGE_COMPLETION_SNAPSHOT',
    'EVALUATION_REVISION_CREATED',
    'ROUTE_REASSIGNMENT_PRECHANGE'
  ]);
});

// ----------------------------------------------------
// 2. ARCHIVE KEYS
// ----------------------------------------------------

test('TC06: Archive key: deterministic stage completion key matches exact pattern', () => {
  const key = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
    sourceRecordKey: 'FY2026-001',
    evaluationStage: 'FINAL',
    revisionNumber: 3
  });
  assert.equal(key, 'FY2026-001|FINAL|R3|STAGE_COMPLETION');
});

test('TC07: Archive key: deterministic revision-created key matches exact pattern', () => {
  const key = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED,
    sourceRecordKey: 'FY2026-001',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 2,
    supersededByRevision: 3
  });
  assert.equal(key, 'FY2026-001|OBJECTIVE|R2|EVALUATION_REVISION_CREATED|TO_R3');
});

test('TC08: Archive key: deterministic reassignment key matches exact pattern', () => {
  const key = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE,
    sourceRecordKey: 'FY2026-001',
    evaluationStage: 'MIDYEAR',
    revisionNumber: 1,
    stableEventId: 'stable-abc'
  });
  assert.equal(key, 'FY2026-001|MIDYEAR|R1|ROUTE_REASSIGNMENT_PRECHANGE|stable-abc');
});

test('TC09: Archive key: retry generates same key', () => {
  const params = {
    eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
    sourceRecordKey: 'FY2026-001',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1
  };
  const key1 = buildArchiveKey(params);
  const key2 = buildArchiveKey(params);
  assert.equal(key1, key2);
});

test('TC10: Archive key: reassignment without Stable_Event_ID fails', () => {
  assert.throws(
    () => buildArchiveKey({
      eventType: ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE,
      sourceRecordKey: 'FY2026-001',
      evaluationStage: 'MIDYEAR',
      revisionNumber: 1,
      stableEventId: ''
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_STABLE_EVENT_ID_REQUIRED');
      return true;
    }
  );
});

test('TC11: Archive key: invalid key component fails closed', () => {
  // Blank component
  assert.throws(
    () => buildArchiveKey({
      eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
      sourceRecordKey: '   ',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1
    }),
    /ARCHIVE_INVALID_KEY_COMPONENT/
  );

  // Embedded delimiter '|'
  assert.throws(
    () => buildArchiveKey({
      eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
      sourceRecordKey: 'FY2026|INJECTION',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1
    }),
    /ARCHIVE_INVALID_KEY_COMPONENT/
  );

  // Embedded newline
  assert.throws(
    () => buildArchiveKey({
      eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
      sourceRecordKey: 'FY2026\n001',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1
    }),
    /ARCHIVE_INVALID_KEY_COMPONENT/
  );
});

test('TC12: Archive key: timestamp is not used to generate event identity', () => {
  const key = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
    sourceRecordKey: 'FY2026-001',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1
  });
  assert.equal(/2026|2025|T\d\d:\d\d|Z/.test(key.split('|')[3]), false);
  assert.equal(key.includes(new Date().toISOString().slice(0, 10)), false);
});

// ----------------------------------------------------
// 3. SNAPSHOT SERIALIZER & COHERENCE
// ----------------------------------------------------

test('TC13: Snapshot: canonical D3 serializer used and produces deterministic JSON and Hash', async () => {
  const snap = makeValidLogicalSnapshot();
  const directHash = hashD3Snapshot(snap);

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    logicalSnapshot: snap
  });

  assert.equal(res.snapshotHash, directHash.sha256);
});

test('TC14: Snapshot: transient top-level metadata excluded from stored Snapshot_JSON', async () => {
  const snap = makeValidLogicalSnapshot({
    topLevel: {
      transientIgnoredMetadata: { shouldNotBeSerialized: true }
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    logicalSnapshot: snap
  });

  const stored = [...adapter.store.values()][0];
  const parsed = JSON.parse(stored.Snapshot_JSON.value);
  assert.equal('transientIgnoredMetadata' in parsed, false);
});

test('TC15: Snapshot: source identity mismatch fails closed', async () => {
  const snap = makeValidLogicalSnapshot({
    source: { Record_Key: 'FY2026-EMP999' } // Mismatched key
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH');
      return true;
    }
  );
});

test('TC16: Snapshot: stage mismatch fails closed', async () => {
  const snap = makeValidLogicalSnapshot({
    stage: { Evaluation_Stage: 'FINAL' } // Mismatched stage
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH');
      return true;
    }
  );
});

test('TC17: Snapshot: revision number mismatch fails closed', async () => {
  const snap = makeValidLogicalSnapshot({
    stage: { Revision_Number: 2 } // Mismatched revision
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH');
      return true;
    }
  );
});

test('TC_COH_01: Snapshot Coherence: K_expected=1 accepted with 1 scorer', async () => {
  const snap = makeValidLogicalSnapshot({
    profile: {
      Frozen_Profile_Code: 'PROF_STAFF',
      K_expected_Snapshot: 1
    },
    route: {
      Workflow_Appraisers: [{ code: 'mgr_somchai' }]
    },
    scoring: {
      Scorers: [{ code: 'mgr_somchai', weight: 100 }]
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    logicalSnapshot: snap
  });

  assert.equal(res.verified, true);
});

test('TC_COH_02: Snapshot Coherence: K_expected=2 accepted with 2 scorers', async () => {
  const snap = makeValidLogicalSnapshot({
    profile: {
      Frozen_Profile_Code: 'PROF_STAFF',
      K_expected_Snapshot: 2
    },
    route: {
      Workflow_Appraisers: [{ code: 'mgr_somchai' }, { code: 'gm_somrudee' }]
    },
    scoring: {
      Scorers: [
        { code: 'mgr_somchai', weight: 50 },
        { code: 'gm_somrudee', weight: 50 }
      ]
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    logicalSnapshot: snap
  });

  assert.equal(res.verified, true);
});

test('TC_COH_03: Snapshot Coherence: K_expected=0, 3, or non-integer rejected', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  for (const invalidK of [0, 3, 1.5, '2', null, undefined]) {
    const snap = makeValidLogicalSnapshot({
      profile: {
        Frozen_Profile_Code: 'PROF_STAFF',
        K_expected_Snapshot: invalidK
      }
    });

    await assert.rejects(
      async () => service.archiveStageCompletion({
        sourceRecordKey: 'FY2026-EMP100',
        employeeCode: 'EMP100',
        fiscalYear: 'FY2026',
        evaluationStage: 'OBJECTIVE',
        revisionNumber: 1,
        actor: { userCode: 'hr_admin' },
        logicalSnapshot: snap
      }),
      (err) => {
        assert.equal(err.code, 'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH');
        return true;
      }
    );
  }
});

test('TC_COH_04: Snapshot Coherence: empty Workflow_Appraisers rejected', async () => {
  const snap = makeValidLogicalSnapshot({
    route: {
      Workflow_Appraisers: []
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_COH_05: Snapshot Coherence: missing appraiser code rejected', async () => {
  const snap = makeValidLogicalSnapshot({
    route: {
      Workflow_Appraisers: [{ code: '' }, { code: 'gm_somrudee' }]
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_COH_06: Snapshot Coherence: duplicate appraiser rejected', async () => {
  const snap = makeValidLogicalSnapshot({
    route: {
      Workflow_Appraisers: [{ code: 'mgr_somchai' }, { code: 'mgr_somchai' }]
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_COH_07: Snapshot Coherence: empty Scorers rejected', async () => {
  const snap = makeValidLogicalSnapshot({
    scoring: {
      Scorers: []
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_COH_08: Snapshot Coherence: scorer count != K rejected', async () => {
  const snap = makeValidLogicalSnapshot({
    profile: {
      Frozen_Profile_Code: 'PROF_STAFF',
      K_expected_Snapshot: 2
    },
    scoring: {
      Scorers: [{ code: 'mgr_somchai', weight: 100 }] // Only 1 scorer for K=2
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_COH_09: Snapshot Coherence: duplicate scorer rejected', async () => {
  const snap = makeValidLogicalSnapshot({
    scoring: {
      Scorers: [
        { code: 'mgr_somchai', weight: 50 },
        { code: 'mgr_somchai', weight: 50 }
      ]
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_COH_10: Snapshot Coherence: scorer not in workflow route rejected', async () => {
  const snap = makeValidLogicalSnapshot({
    scoring: {
      Scorers: [
        { code: 'mgr_somchai', weight: 50 },
        { code: 'unknown_appraiser_999', weight: 50 }
      ]
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_COH_11: Snapshot Coherence: previousStatus vs snapshot Previous_Status mismatch rejected', async () => {
  const snap = makeValidLogicalSnapshot({
    stage: {
      Previous_Status: '05 Objective Approved'
    }
  });

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      previousStatus: '01 Goal Draft', // Mismatch with snapshot '05 Objective Approved'
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

// ----------------------------------------------------
// 4. ACTOR, TIMESTAMP & REASON CONTRACT
// ----------------------------------------------------

test('TC18: Actor: { userCode: "hr_admin" } accepted and mapped to USER_SELECT format [{ code }]', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  const stored = [...adapter.store.values()][0];
  assert.deepEqual(stored.Archived_By.value, [{ code: 'somchai_mgr' }]);
});

test('TC19: Actor: plain string, { code }, display-name-only, blank, and SYSTEM rejected', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  // Plain string
  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: 'hr_admin',
      logicalSnapshot: snap
    }),
    /ARCHIVE_ACTOR_NOT_RESOLVED/
  );

  // { code: 'hr_admin' }
  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { code: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_ACTOR_NOT_RESOLVED/
  );

  // Display name only
  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { name: 'Somchai Prapat' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_ACTOR_NOT_RESOLVED/
  );

  // Blank / whitespace userCode
  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: '   ' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_ACTOR_NOT_RESOLVED/
  );

  // Generic SYSTEM userCode
  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'SYSTEM' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_ACTOR_NOT_RESOLVED/
  );
});

test('TC_TIME_01: Timestamp: explicit valid ISO timestamp accepted', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    archivedAt: '2026-05-01T10:30:00.000Z',
    logicalSnapshot: snap
  });

  assert.equal(res.archivedAt, '2026-05-01T10:30:00.000Z');
  const stored = [...adapter.store.values()][0];
  assert.equal(stored.Archived_At.value, '2026-05-01T10:30:00.000Z');
});

test('TC_TIME_02: Timestamp: injected clock accepted', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, {
    clock: () => '2026-06-01T08:00:00.000Z'
  });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    logicalSnapshot: snap
  });

  assert.equal(res.archivedAt, '2026-06-01T08:00:00.000Z');
});

test('TC_TIME_03: Timestamp: missing explicit time + missing clock fails closed with ARCHIVE_TIMESTAMP_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter); // No clock injected

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_TIMESTAMP_REQUIRED');
      return true;
    }
  );
});

test('TC_TIME_04: Timestamp: date-only, timezone-less datetime, and invalid string fail closed with ARCHIVE_INVALID_TIMESTAMP', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);

  // Date-only
  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      archivedAt: '2026-04-01',
      logicalSnapshot: snap
    }),
    /ARCHIVE_INVALID_TIMESTAMP/
  );

  // Timezone-less datetime
  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      archivedAt: '2026-04-01T12:00:00',
      logicalSnapshot: snap
    }),
    /ARCHIVE_INVALID_TIMESTAMP/
  );

  // Invalid timestamp
  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      archivedAt: 'NOT_A_DATE',
      logicalSnapshot: snap
    }),
    /ARCHIVE_INVALID_TIMESTAMP/
  );
});

test('TC_TIME_05: Timestamp: offset datetime canonicalizes deterministically to UTC ISO', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);

  // 19:00:00 +07:00 is 12:00:00.000Z
  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    archivedAt: '2026-04-01T19:00:00+07:00',
    logicalSnapshot: snap
  });

  assert.equal(res.archivedAt, '2026-04-01T12:00:00.000Z');
});

test('TC21: Reason: blank reopen reason fails closed with ARCHIVE_REASON_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveEvaluationRevisionCreated({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      oldRevisionNumber: 1,
      newRevisionNumber: 2,
      actor: { userCode: 'hr_admin' },
      reason: '   ', // Blank
      logicalSnapshot: snap
    }),
    /ARCHIVE_REASON_REQUIRED/
  );
});

test('TC22: Reason: blank reassignment reason fails closed with ARCHIVE_REASON_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveRouteReassignmentPrechange({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      stableEventId: 'reassign-001',
      actor: { userCode: 'hr_admin' },
      reason: '', // Blank
      logicalSnapshot: snap
    }),
    /ARCHIVE_REASON_REQUIRED/
  );
});

test('TC23: Reason: stage completion defaults to canonical deterministic reason when omitted', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  const stored = [...adapter.store.values()][0];
  assert.equal(stored.Reason.value, 'STAGE_COMPLETION_SNAPSHOT:OBJECTIVE');
});

// ----------------------------------------------------
// 5. SERVICE-ISSUED EVIDENCE & ARCHIVE-BEFORE-CHANGE GATE
// ----------------------------------------------------

test('TC24: Evidence: real service evidence validates and unforgeable brand rejects fake or cloned objects', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  // 1. Real service-issued evidence validates
  assert.equal(RevisionArchiveService.validateArchiveEvidence(res), true);

  // 2. Fake plain object fails
  const fakeEvidence = {
    verified: true,
    serviceVersion: 'D3_V1',
    archiveKey: 'FY2026-EMP100|OBJECTIVE|R1|STAGE_COMPLETION',
    snapshotHash: res.snapshotHash,
    eventType: 'STAGE_COMPLETION_SNAPSHOT',
    evaluationStage: 'OBJECTIVE'
  };
  assert.equal(RevisionArchiveService.validateArchiveEvidence(fakeEvidence), false);

  // 3. Spread clone fails
  const spreadClone = { ...res };
  assert.equal(RevisionArchiveService.validateArchiveEvidence(spreadClone), false);

  // 4. Manually copied fields fail
  const copied = Object.assign({}, res);
  assert.equal(RevisionArchiveService.validateArchiveEvidence(copied), false);

  // 5. ABC gate rejects fake evidence
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(fakeEvidence),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(spreadClone),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );

  // 6. Real evidence passes matching ABC gate with complete expected context
  const expectedKey = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1
  });
  const expectedHash = hashD3Snapshot(snap).sha256;

  const completeValidContext = {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    eventType: 'STAGE_COMPLETION_SNAPSHOT',
    archiveKey: expectedKey,
    snapshotHash: expectedHash
  };

  assert.equal(RevisionArchiveService.assertArchiveBeforeChangeGate(res, completeValidContext), true);

  // 7. Broad context only fails closed
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(res, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      eventType: 'STAGE_COMPLETION_SNAPSHOT'
    }),
    /ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED/
  );

  // 8. Real evidence with wrong expected context fails
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(res, {
      ...completeValidContext,
      sourceRecordKey: 'FY2026-WRONG_KEY',
      archiveKey: 'FY2026-WRONG_KEY|OBJECTIVE|R1|STAGE_COMPLETION'
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
});

// ----------------------------------------------------
// 6. POST-CREATE READ-BACK & UNCERTAIN WRITE SAFETY
// ----------------------------------------------------

test('TC_READBACK_01: Post-Create Read-back: complete exact read-back passes', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  assert.equal(res.verified, true);
  assert.equal(res.idempotentReplay, false);
});

test('TC_READBACK_02: Post-Create Read-back: field mismatches fail closed with ARCHIVE_READBACK_VERIFICATION_FAILED', async () => {
  const fieldsToTest = [
    { field: 'Snapshot_Hash', tampered: { value: 'TAMPERED_HASH' } },
    { field: 'Fiscal_Year', tampered: { value: 'FY9999' } },
    { field: 'Employee_Code', tampered: { value: 'EMP_TAMPERED' } },
    { field: 'Event_Type', tampered: { value: 'TAMPERED_EVENT' } },
    { field: 'Reason', tampered: { value: 'TAMPERED_REASON' } },
    { field: 'Previous_Status', tampered: { value: 'TAMPERED_STATUS' } },
    { field: 'Source_Record_ID', tampered: { value: '9999' } },
    { field: 'Archived_At', tampered: { value: '2099-01-01T00:00:00.000Z' } },
    { field: 'Archived_By', tampered: { value: [{ code: 'tampered_actor' }] } }
  ];

  for (const { field, tampered } of fieldsToTest) {
    const snap = makeValidLogicalSnapshot();
    const adapter = createInMemoryKintoneAdapter();

    const originalGetRecords = adapter.getRecords;
    adapter.getRecords = async (appId, query) => {
      const res = await originalGetRecords(appId, query);
      if (res.records.length > 0) {
        return {
          records: [{
            ...res.records[0],
            [field]: tampered
          }]
        };
      }
      return res;
    };

    const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

    await assert.rejects(
      async () => service.archiveStageCompletion({
        sourceRecordKey: 'FY2026-EMP100',
        employeeCode: 'EMP100',
        fiscalYear: 'FY2026',
        evaluationStage: 'OBJECTIVE',
        revisionNumber: 1,
        sourceRecordId: 101,
        actor: { userCode: 'somchai_mgr' },
        logicalSnapshot: snap
      }),
      (err) => {
        assert.equal(err.code, 'ARCHIVE_READBACK_VERIFICATION_FAILED');
        return true;
      }
    );
  }
});

test('TC_UNCERTAIN_01: Uncertain write safety: create transport uncertainty + exact row found on recovery -> recovered success', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();

  let callCount = 0;
  const realAddRecord = adapter.addRecord;
  adapter.addRecord = async (appId, payload) => {
    await realAddRecord(appId, payload);
    callCount++;
    throw new Error('ETIMEDOUT: Connection reset after write acknowledged by Kintone');
  };

  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  assert.equal(res.verified, true);
  assert.equal(res.recovered, true);
  assert.equal(res.idempotentReplay, false);
  assert.equal(callCount, 1); // Exact 1 create attempt, never blind second create
});

test('TC_UNCERTAIN_02: Uncertain write safety: recovery row with conflicting reason or event type -> ARCHIVE_IDEMPOTENCY_CONFLICT', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();

  // Populate conflicting existing row in store
  adapter.store.set(1, {
    $id: { value: '1' },
    Archive_Key: { value: 'FY2026-EMP100|OBJECTIVE|R1|STAGE_COMPLETION' },
    Source_Record_Key: { value: 'FY2026-EMP100' },
    Fiscal_Year: { value: 'FY2026' },
    Employee_Code: { value: 'EMP100' },
    Evaluation_Stage: { value: 'OBJECTIVE' },
    Revision_Number: { value: '1' },
    Event_Type: { value: 'STAGE_COMPLETION_SNAPSHOT' },
    Reason: { value: 'CONFLICTING_REASON' },
    Snapshot_JSON: { value: '{}' },
    Snapshot_Hash: { value: 'wrong_hash' },
    Archived_By: { value: [{ code: 'somchai_mgr' }] },
    Archived_At: { value: '2026-04-01T12:00:00.000Z' }
  });

  adapter.addRecord = async () => {
    throw new Error('ETIMEDOUT');
  };

  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      sourceRecordId: 101,
      actor: { userCode: 'somchai_mgr' },
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_IDEMPOTENCY_CONFLICT');
      return true;
    }
  );
});

test('TC_UNCERTAIN_03: Uncertain write safety: create transport uncertainty + no provable row -> fails closed with ARCHIVE_TRANSPORT_UNCERTAIN', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = {
    getRecords: async () => ({ records: [] }), // Row never reached database
    addRecord: async () => {
      throw new Error('ECONNREFUSED: Network unreachable');
    }
  };

  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      sourceRecordId: 101,
      actor: { userCode: 'somchai_mgr' },
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err instanceof RevisionArchiveError, true);
      assert.equal(err.code, 'ARCHIVE_TRANSPORT_UNCERTAIN');
      return true;
    }
  );
});

// ----------------------------------------------------
// 7. EXACT EVENT EVIDENCE BINDING (R2 FINDING 1)
// ----------------------------------------------------

test('TC_GATE_01: service-issued stage completion evidence + exact complete expected context => PASS', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  const expectedKey = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1
  });
  const expectedHash = hashD3Snapshot(snap).sha256;

  const validContext = {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    eventType: 'STAGE_COMPLETION_SNAPSHOT',
    archiveKey: expectedKey,
    snapshotHash: expectedHash,
    sourceRecordId: 101,
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026'
  };

  assert.equal(RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, validContext), true);
});

test('TC_GATE_02: expected context missing archiveKey => fails closed with ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  const incompleteContext = {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    eventType: 'STAGE_COMPLETION_SNAPSHOT',
    snapshotHash: hashD3Snapshot(snap).sha256
  };

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, incompleteContext),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED');
      return true;
    }
  );
});

test('TC_GATE_03: expected context missing snapshotHash => fails closed with ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  const incompleteContext = {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    eventType: 'STAGE_COMPLETION_SNAPSHOT',
    archiveKey: buildArchiveKey({
      eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1
    })
  };

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, incompleteContext),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED');
      return true;
    }
  );
});

test('TC_GATE_04: expected archiveKey != evidence archiveKey => fails closed with ARCHIVE_GATE_EVIDENCE_INVALID', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  const mismatchContext = {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    eventType: 'STAGE_COMPLETION_SNAPSHOT',
    archiveKey: 'FY2026-EMP100|OBJECTIVE|R1|STAGE_COMPLETION_MISMATCH',
    snapshotHash: hashD3Snapshot(snap).sha256
  };

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, mismatchContext),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_GATE_EVIDENCE_INVALID');
      return true;
    }
  );
});

test('TC_GATE_05: expected snapshotHash != evidence snapshotHash => fails closed with ARCHIVE_GATE_EVIDENCE_INVALID', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  const mismatchContext = {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    eventType: 'STAGE_COMPLETION_SNAPSHOT',
    archiveKey: buildArchiveKey({
      eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1
    }),
    snapshotHash: '0000000000000000000000000000000000000000000000000000000000000000'
  };

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, mismatchContext),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_GATE_EVIDENCE_INVALID');
      return true;
    }
  );
});

test('TC_GATE_06: broad context only (record/stage/revision/eventType) => fails closed with ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      eventType: 'STAGE_COMPLETION_SNAPSHOT'
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED');
      return true;
    }
  );
});

test('TC_GATE_07: canonical derived completion key matches evidence => PASS', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  const canonicalKey = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1
  });

  assert.equal(evidence.archiveKey, canonicalKey);
  assert.equal(RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    eventType: 'STAGE_COMPLETION_SNAPSHOT',
    archiveKey: canonicalKey,
    snapshotHash: hashD3Snapshot(snap).sha256
  }), true);
});

test('TC_GATE_08: completion evidence for another revision => fails closed with ARCHIVE_GATE_EVIDENCE_INVALID', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'somchai_mgr' },
    logicalSnapshot: snap
  });

  const rev2Key = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 2
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 2,
      eventType: 'STAGE_COMPLETION_SNAPSHOT',
      archiveKey: rev2Key,
      snapshotHash: hashD3Snapshot(snap).sha256
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
});

test('TC_GATE_09: R1->R2 reopen evidence + expected R1->R2 => PASS', async () => {
  const snap = makeValidLogicalSnapshot({ stage: { Revision_Number: 1 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveEvaluationRevisionCreated({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    oldRevisionNumber: 1,
    newRevisionNumber: 2,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Approved reopen R1->R2',
    logicalSnapshot: snap
  });

  const expectedKey = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    supersededByRevision: 2
  });

  assert.equal(RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    supersededByRevision: 2,
    eventType: 'EVALUATION_REVISION_CREATED',
    archiveKey: expectedKey,
    snapshotHash: hashD3Snapshot(snap).sha256
  }), true);
});

test('TC_GATE_10: same evidence presented for R1->R3 => fails closed with ARCHIVE_GATE_EVIDENCE_INVALID', async () => {
  const snap = makeValidLogicalSnapshot({ stage: { Revision_Number: 1 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidenceR1toR2 = await service.archiveEvaluationRevisionCreated({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    oldRevisionNumber: 1,
    newRevisionNumber: 2,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Approved reopen R1->R2',
    logicalSnapshot: snap
  });

  const expectedKeyR1toR3 = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.EVALUATION_REVISION_CREATED,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    supersededByRevision: 3
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidenceR1toR2, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      supersededByRevision: 3,
      eventType: 'EVALUATION_REVISION_CREATED',
      archiveKey: expectedKeyR1toR3,
      snapshotHash: hashD3Snapshot(snap).sha256
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
});

test('TC_GATE_11: wrong supersededByRevision => fails closed with ARCHIVE_GATE_EVIDENCE_INVALID', async () => {
  const snap = makeValidLogicalSnapshot({ stage: { Revision_Number: 1 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveEvaluationRevisionCreated({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    oldRevisionNumber: 1,
    newRevisionNumber: 2,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Approved reopen R1->R2',
    logicalSnapshot: snap
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      supersededByRevision: 99,
      eventType: 'EVALUATION_REVISION_CREATED',
      archiveKey: evidence.archiveKey,
      snapshotHash: hashD3Snapshot(snap).sha256
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
});

test('TC_GATE_12: missing supersededByRevision => fails closed with ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot({ stage: { Revision_Number: 1 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveEvaluationRevisionCreated({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    oldRevisionNumber: 1,
    newRevisionNumber: 2,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Approved reopen R1->R2',
    logicalSnapshot: snap
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      eventType: 'EVALUATION_REVISION_CREATED',
      archiveKey: evidence.archiveKey,
      snapshotHash: hashD3Snapshot(snap).sha256
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED');
      return true;
    }
  );
});

test('TC_GATE_13: wrong reopen Archive_Key => fails closed with ARCHIVE_GATE_EVIDENCE_INVALID', async () => {
  const snap = makeValidLogicalSnapshot({ stage: { Revision_Number: 1 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidence = await service.archiveEvaluationRevisionCreated({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    oldRevisionNumber: 1,
    newRevisionNumber: 2,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Approved reopen R1->R2',
    logicalSnapshot: snap
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidence, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      supersededByRevision: 2,
      eventType: 'EVALUATION_REVISION_CREATED',
      archiveKey: 'CORRUPTED_REOPEN_KEY',
      snapshotHash: hashD3Snapshot(snap).sha256
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
});

test('TC_GATE_14: EVENT-A evidence + expected EVENT-A => PASS', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidenceA = await service.archiveRouteReassignmentPrechange({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: 'EVENT-A',
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Reassignment Event A',
    logicalSnapshot: snap
  });

  const expectedKeyA = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: 'EVENT-A'
  });

  assert.equal(RevisionArchiveService.assertArchiveBeforeChangeGate(evidenceA, {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    eventType: 'ROUTE_REASSIGNMENT_PRECHANGE',
    stableEventId: 'EVENT-A',
    archiveKey: expectedKeyA,
    snapshotHash: hashD3Snapshot(snap).sha256
  }), true);
});

test('TC_GATE_15: EVENT-A evidence + expected EVENT-B => fails closed with ARCHIVE_GATE_EVIDENCE_INVALID', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidenceA = await service.archiveRouteReassignmentPrechange({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: 'EVENT-A',
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Reassignment Event A',
    logicalSnapshot: snap
  });

  const expectedKeyB = buildArchiveKey({
    eventType: ARCHIVE_EVENT_TYPES.ROUTE_REASSIGNMENT_PRECHANGE,
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: 'EVENT-B'
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidenceA, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      eventType: 'ROUTE_REASSIGNMENT_PRECHANGE',
      stableEventId: 'EVENT-B',
      archiveKey: expectedKeyB,
      snapshotHash: hashD3Snapshot(snap).sha256
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
});

test('TC_GATE_16: missing stableEventId => fails closed with ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidenceA = await service.archiveRouteReassignmentPrechange({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: 'EVENT-A',
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Reassignment Event A',
    logicalSnapshot: snap
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidenceA, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      eventType: 'ROUTE_REASSIGNMENT_PRECHANGE',
      archiveKey: evidenceA.archiveKey,
      snapshotHash: hashD3Snapshot(snap).sha256
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED');
      return true;
    }
  );
});

test('TC_GATE_17: wrong stableEventId => fails closed with ARCHIVE_GATE_EVIDENCE_INVALID', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidenceA = await service.archiveRouteReassignmentPrechange({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: 'EVENT-A',
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Reassignment Event A',
    logicalSnapshot: snap
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidenceA, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      eventType: 'ROUTE_REASSIGNMENT_PRECHANGE',
      stableEventId: 'EVENT-WRONG',
      archiveKey: evidenceA.archiveKey,
      snapshotHash: hashD3Snapshot(snap).sha256
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
});

test('TC_GATE_18: wrong reassignment Archive_Key => fails closed with ARCHIVE_GATE_EVIDENCE_INVALID', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidenceA = await service.archiveRouteReassignmentPrechange({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: 'EVENT-A',
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Reassignment Event A',
    logicalSnapshot: snap
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidenceA, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      eventType: 'ROUTE_REASSIGNMENT_PRECHANGE',
      stableEventId: 'EVENT-A',
      archiveKey: 'CORRUPTED_KEY_REASSIGN',
      snapshotHash: hashD3Snapshot(snap).sha256
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
});

test('TC_GATE_19: same stage/revision/eventType alone is insufficient => fails closed with ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const evidenceA = await service.archiveRouteReassignmentPrechange({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: 'EVENT-A',
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    reason: 'Reassignment Event A',
    logicalSnapshot: snap
  });

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(evidenceA, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      eventType: 'ROUTE_REASSIGNMENT_PRECHANGE'
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED');
      return true;
    }
  );
});

// ----------------------------------------------------
// 8. SOURCE IDENTITY HARDENING (R2 FINDING 2)
// ----------------------------------------------------

test('TC_SRC_ID_01: blank Employee_Code request/snapshot rejected', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Employee_Code: '' } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: '',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH');
      return true;
    }
  );
});

test('TC_SRC_ID_02: whitespace Employee_Code rejected', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Employee_Code: '   ' } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: '   ',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH');
      return true;
    }
  );
});

test('TC_SRC_ID_03: blank Fiscal_Year rejected', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Fiscal_Year: '' } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: '',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH');
      return true;
    }
  );
});

test('TC_SRC_ID_04: whitespace Fiscal_Year rejected', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Fiscal_Year: '   ' } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: '   ',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err.code, 'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH');
      return true;
    }
  );
});

test('TC_SRC_ID_05: valid Employee_Code/Fiscal_Year accepted', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    logicalSnapshot: snap
  });

  assert.equal(res.verified, true);
  assert.equal(res.employeeCode, 'EMP100');
  assert.equal(res.fiscalYear, 'FY2026');
});

// ----------------------------------------------------
// 9. SOURCE RECORD ID HARDENING (R2 FINDING 2)
// ----------------------------------------------------

test('TC_REC_ID_01: explicit positive integer request + matching snapshot => PASS', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Record_ID: 101 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: { userCode: 'hr_admin' },
    logicalSnapshot: snap
  });

  assert.equal(res.sourceRecordId, 101);
});

test('TC_REC_ID_02: explicit request ID mismatch => fails closed with ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Record_ID: 101 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      sourceRecordId: 999,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_REC_ID_03: request ID 0/-1/noninteger/non-numeric => fails closed with ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Record_ID: 101 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  for (const badId of [0, -1, 1.5, 'abc', '']) {
    await assert.rejects(
      async () => service.archiveStageCompletion({
        sourceRecordKey: 'FY2026-EMP100',
        employeeCode: 'EMP100',
        fiscalYear: 'FY2026',
        evaluationStage: 'OBJECTIVE',
        revisionNumber: 1,
        sourceRecordId: badId,
        actor: { userCode: 'hr_admin' },
        logicalSnapshot: snap
      }),
      /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
    );
  }
});

test('TC_REC_ID_04: request omitted + valid snapshot Record_ID => PASS', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Record_ID: 202 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    actor: { userCode: 'hr_admin' },
    logicalSnapshot: snap
  });

  assert.equal(res.sourceRecordId, 202);
});

test('TC_REC_ID_05: request omitted + snapshot Record_ID 0 => fails closed with ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Record_ID: 0 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_REC_ID_06: request omitted + snapshot Record_ID negative => fails closed with ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Record_ID: -5 } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_REC_ID_07: request omitted + snapshot Record_ID nonnumeric => fails closed with ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH', async () => {
  const snap = makeValidLogicalSnapshot({ source: { Record_ID: 'invalid_id' } });
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'hr_admin' },
      logicalSnapshot: snap
    }),
    /ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH/
  );
});

test('TC_REC_ID_08: both omitted => deterministic allowed behavior', async () => {
  const snap = makeValidLogicalSnapshot();
  delete snap.source.Record_ID;

  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    actor: { userCode: 'hr_admin' },
    logicalSnapshot: snap
  });

  assert.equal(res.sourceRecordId, null);
});

