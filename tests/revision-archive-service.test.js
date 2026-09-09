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
  const service = new RevisionArchiveService(repo);

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
  const service = new RevisionArchiveService(adapter);

  const res = await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: 'hr_admin',
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
  const service = new RevisionArchiveService(adapter);

  await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: 'hr_admin',
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
  const service = new RevisionArchiveService(adapter);

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
  const service = new RevisionArchiveService(adapter);

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
  const service = new RevisionArchiveService(adapter);

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
    (err) => {
      assert.equal(err.code, 'ARCHIVE_SNAPSHOT_IDENTITY_MISMATCH');
      return true;
    }
  );
});

// ----------------------------------------------------
// 4. ACTOR AND REASON CONTRACT
// ----------------------------------------------------

test('TC18: Actor: exact actor user code mapped to USER_SELECT format [{ code }]', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);

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

test('TC19: Actor: missing actor fails closed with ARCHIVE_ACTOR_NOT_RESOLVED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: '',
      logicalSnapshot: snap
    }),
    /ARCHIVE_ACTOR_NOT_RESOLVED/
  );
});

test('TC20: Actor: display-name-only or generic SYSTEM actor rejected', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);

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

  // Generic SYSTEM free text
  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: 'SYSTEM',
      logicalSnapshot: snap
    }),
    /ARCHIVE_ACTOR_NOT_RESOLVED/
  );
});

test('TC21: Reason: blank reopen reason fails closed with ARCHIVE_REASON_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);

  await assert.rejects(
    async () => service.archiveEvaluationRevisionCreated({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      oldRevisionNumber: 1,
      newRevisionNumber: 2,
      actor: 'hr_admin',
      reason: '   ', // Blank
      logicalSnapshot: snap
    }),
    /ARCHIVE_REASON_REQUIRED/
  );
});

test('TC22: Reason: blank reassignment reason fails closed with ARCHIVE_REASON_REQUIRED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);

  await assert.rejects(
    async () => service.archiveRouteReassignmentPrechange({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      stableEventId: 'reassign-001',
      actor: 'hr_admin',
      reason: '', // Blank
      logicalSnapshot: snap
    }),
    /ARCHIVE_REASON_REQUIRED/
  );
});

test('TC23: Reason: stage completion defaults to canonical deterministic reason when omitted', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter);

  await service.archiveStageCompletion({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    sourceRecordId: 101,
    actor: 'somchai_mgr',
    logicalSnapshot: snap
  });

  const stored = [...adapter.store.values()][0];
  assert.equal(stored.Reason.value, 'STAGE_COMPLETION_SNAPSHOT:OBJECTIVE');
});

// ----------------------------------------------------
// 5. STAGE COMPLETION EVIDENCE & ARCHIVE-BEFORE-CHANGE GATE
// ----------------------------------------------------

test('TC24: Stage completion: verified completion returns structured archive evidence', async () => {
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
    actor: 'somchai_mgr',
    logicalSnapshot: snap
  });

  assert.equal(res.verified, true);
  assert.equal(res.archiveKey, 'FY2026-EMP100|OBJECTIVE|R1|STAGE_COMPLETION');
  assert.equal(res.eventType, 'STAGE_COMPLETION_SNAPSHOT');
  assert.equal(res.idempotentReplay, false);
  assert.equal(res.recovered, false);
  assert.equal(res.archivedBy, 'somchai_mgr');
  assert.equal(RevisionArchiveService.validateArchiveEvidence(res), true);
});

test('TC25: Stage completion: unverified archive cannot pass Archive-Before-Change gate', () => {
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(null),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );

  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate({ archiveVerified: true }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );

  const validEvidence = {
    verified: true,
    serviceVersion: 'D3_V1',
    archiveKey: 'FY2026-EMP100|OBJECTIVE|R1|STAGE_COMPLETION',
    snapshotHash: 'sha256...',
    eventType: 'STAGE_COMPLETION_SNAPSHOT',
    evaluationStage: 'OBJECTIVE',
    sourceRecordKey: 'FY2026-EMP100',
    revisionNumber: 1
  };

  assert.equal(RevisionArchiveService.assertArchiveBeforeChangeGate(validEvidence, {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1
  }), true);

  // Mismatched context fails closed
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(validEvidence, {
      sourceRecordKey: 'FY2026-OTHER'
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
});

// ----------------------------------------------------
// 6. READ-BACK & UNCERTAIN WRITE SAFETY
// ----------------------------------------------------

test('TC26: Read-back: read-back hash mismatch fails closed with ARCHIVE_READBACK_VERIFICATION_FAILED', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();

  // Sabotage read-back to return tampered hash
  const originalGetRecords = adapter.getRecords;
  adapter.getRecords = async (appId, query) => {
    const res = await originalGetRecords(appId, query);
    if (res.records.length > 0) {
      return {
        records: [{
          ...res.records[0],
          Snapshot_Hash: { value: 'TAMPERED_HASH' }
        }]
      };
    }
    return res;
  };

  const service = new RevisionArchiveService(adapter);

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      sourceRecordId: 101,
      actor: 'somchai_mgr',
      logicalSnapshot: snap
    }),
    /ARCHIVE_READBACK_VERIFICATION_FAILED/
  );
});

test('TC27: Uncertain write safety: create transport uncertainty + exact row found on recovery -> recovered success', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = createInMemoryKintoneAdapter();

  // Simulate network uncertainty: addRecord succeeds on server, but throws on response
  let callCount = 0;
  const realAddRecord = adapter.addRecord;
  adapter.addRecord = async (appId, payload) => {
    await realAddRecord(appId, payload);
    callCount++;
    throw new Error('ETIMEDOUT: Connection reset after write acknowledged by Kintone');
  };

  const service = new RevisionArchiveService(adapter);

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
  assert.equal(res.recovered, true);
  assert.equal(res.idempotentReplay, false);
  assert.equal(callCount, 1);
});

test('TC28: Uncertain write safety: create transport uncertainty + no provable row -> fails closed with ARCHIVE_TRANSPORT_UNCERTAIN', async () => {
  const snap = makeValidLogicalSnapshot();
  const adapter = {
    getRecords: async () => ({ records: [] }), // Row never reached database
    addRecord: async () => {
      throw new Error('ECONNREFUSED: Network unreachable');
    }
  };

  const service = new RevisionArchiveService(adapter);

  await assert.rejects(
    async () => service.archiveStageCompletion({
      sourceRecordKey: 'FY2026-EMP100',
      employeeCode: 'EMP100',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      sourceRecordId: 101,
      actor: 'somchai_mgr',
      logicalSnapshot: snap
    }),
    (err) => {
      assert.equal(err instanceof RevisionArchiveError, true);
      assert.equal(err.code, 'ARCHIVE_TRANSPORT_UNCERTAIN');
      return true;
    }
  );
});
