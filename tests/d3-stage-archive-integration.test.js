import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

import {
  buildStageLogicalSnapshot,
  executeProcessTransitionArchive
} from '../src/main-mbo-app.js';
import {
  RevisionArchiveService,
  ARCHIVE_EVENT_TYPES
} from '../src/services/revision-archive-service.js';
import { hashD3Snapshot } from '../src/services/d3-snapshot-serializer.js';

function createMockKintoneAdapter(initialRecords = []) {
  const store = new Map();
  let nextId = 1;
  let addRecordCallCount = 0;

  for (const r of initialRecords) {
    store.set(r.$id?.value || nextId++, r);
  }

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
      store.set(String(id), savedRecord);
      return { id: String(id), revision: '1' };
    }
  };
}

function makeMockApp794Record(overrides = {}) {
  return {
    $id: { value: '18' },
    Record_Key: { value: 'FY2026-TEST-EMP001' },
    Employee_Code: { value: 'EMP001' },
    Fiscal_Year: { value: 'FY2026' },
    Revision_Number: { value: '1' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Frozen_Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    K_expected_Snapshot: { value: '2' },
    Effective_Routing_Key: { value: 'TME1' },
    Effective_Route_Version_Key: { value: 'TME1#v1' },
    Route_Pattern: { value: 'PATTERN_2_M1_G1' },
    Routing_Topology: { value: 'M1_G1' },
    Workflow_Appraisers: [
      { code: 'mgr_somchai' },
      { code: 'gm_somrudee' }
    ],
    Scorers: [
      { code: 'mgr_somchai', weight: 50 },
      { code: 'gm_somrudee', weight: 50 }
    ],
    Department_Hoshin_Key: { value: 'DHK_2026_01' },
    Configuration_Hash: { value: 'cfg_hash_verified_99' },
    Objective_Table: {
      value: [
        { title: 'Deliver Stage Archives', weight: 100 }
      ]
    },
    PartA_Raw_Score: { value: '88.5' },
    ...overrides
  };
}

test('1. 05 -> 06 triggers OBJECTIVE / STAGE_COMPLETION_SNAPSHOT', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    nextStatus: { value: '06 Employee Mid-Year' },
    action: { value: 'Start Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });

  assert.equal(outcome.success, true);
  assert.equal(outcome.targetStage, 'OBJECTIVE');
  assert.equal(outcome.archiveResult.eventType, ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT);
  assert.equal(outcome.archiveResult.evaluationStage, 'OBJECTIVE');
  assert.equal(adapter.addRecordCallCount, 1);
});

test('2. 10 -> 11 triggers MIDYEAR / STAGE_COMPLETION_SNAPSHOT', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '10 Mid-Year Completed' },
    nextStatus: { value: '11 Employee Self Evaluation' },
    action: { value: 'Start Final Evaluation' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });

  assert.equal(outcome.success, true);
  assert.equal(outcome.targetStage, 'MIDYEAR');
  assert.equal(outcome.archiveResult.eventType, ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT);
  assert.equal(outcome.archiveResult.evaluationStage, 'MIDYEAR');
  assert.equal(adapter.addRecordCallCount, 1);
});

test('3. 15 -> 16 triggers FINAL / STAGE_COMPLETION_SNAPSHOT', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '15 HR Final Check' },
    nextStatus: { value: '16 Completed' },
    action: { value: 'Complete Evaluation' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });

  assert.equal(outcome.success, true);
  assert.equal(outcome.targetStage, 'FINAL');
  assert.equal(outcome.archiveResult.eventType, ARCHIVE_EVENT_TYPES.STAGE_COMPLETION_SNAPSHOT);
  assert.equal(outcome.archiveResult.evaluationStage, 'FINAL');
  assert.equal(adapter.addRecordCallCount, 1);
});

test('4. Untargeted transitions (e.g. 01 -> 02, 02 -> 03) do NOT create archive', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();

  const event1 = {
    status: { value: '01 Draft' },
    nextStatus: { value: '02 Waiting First Manager' },
    action: { value: 'Submit Objective' }
  };
  const outcome1 = await executeProcessTransitionArchive(record, event1, {
    apiAdapter: adapter,
    actor: 'emp001'
  });
  assert.equal(outcome1.skipped, true);
  assert.equal(adapter.addRecordCallCount, 0);

  const event2 = {
    status: { value: '02 Waiting First Manager' },
    nextStatus: { value: '03 Waiting Manager' },
    action: { value: 'Approve' }
  };
  const outcome2 = await executeProcessTransitionArchive(record, event2, {
    apiAdapter: adapter,
    actor: 'mgr_somchai'
  });
  assert.equal(outcome2.skipped, true);
  assert.equal(adapter.addRecordCallCount, 0);
});

test('5. Deterministic Archive_Key format (<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|STAGE_COMPLETION)', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record({
    Record_Key: { value: 'FY2026-TEST-KEY-789' },
    Revision_Number: { value: '3' }
  });
  const event = {
    status: { value: '05 Objective Approved' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_admin'
  });

  assert.equal(outcome.success, true);
  const expectedKey = 'FY2026-TEST-KEY-789|OBJECTIVE|R3|STAGE_COMPLETION';
  assert.equal(outcome.archiveResult.archiveKey, expectedKey);

  // Check saved record in repository
  const savedRecord = Array.from(adapter.store.values())[0];
  assert.equal(savedRecord.Archive_Key.value, expectedKey);
});

test('6. Snapshot_JSON contains valid 9-section structure and passes coherence validation during archive', async () => {
  const record = makeMockApp794Record();
  const snapshot = buildStageLogicalSnapshot(record, 'OBJECTIVE', '05 Objective Approved');

  // Must contain all 9 canonical sections
  const expectedSections = ['source', 'stage', 'profile', 'route', 'scoring', 'hoshin', 'config', 'business', 'computed'];
  for (const section of expectedSections) {
    assert.ok(snapshot[section], `Snapshot missing section: ${section}`);
  }

  // Coherence validation exercised during archive execution
  const adapter = createMockKintoneAdapter();
  const outcome = await executeProcessTransitionArchive(record, {
    status: { value: '05 Objective Approved' },
    nextStatus: { value: '06 Employee Mid-Year' }
  }, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });
  assert.equal(outcome.success, true);
  assert.equal(typeof outcome.archiveResult.snapshotHash, 'string');
  assert.equal(outcome.archiveResult.snapshotHash.length, 64);
});

test('7. Snapshot_Hash matches SHA-256 of canonical snapshot', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_somkiat'
  });

  const savedRecord = Array.from(adapter.store.values())[0];
  const storedJson = savedRecord.Snapshot_JSON.value;
  const storedHash = savedRecord.Snapshot_Hash.value;

  const computedHash = crypto.createHash('sha256').update(storedJson, 'utf8').digest('hex');
  assert.equal(storedHash, computedHash);
  assert.equal(outcome.archiveResult.snapshotHash, computedHash);
});

test('8. Fail-closed: archive repository error or mismatch prevents process transition (returns failure)', async () => {
  const failingAdapter = {
    getRecords: async () => ({ records: [] }),
    addRecord: async () => {
      throw new Error('Kintone 500 Internal Server Error: Database Connection Failed');
    }
  };

  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: failingAdapter,
    actor: 'hr_somkiat'
  });

  assert.equal(outcome.success, false);
  assert.ok(outcome.error.includes('Kintone 500'));
});

test('9. Actor unresolved fails closed (stops transition)', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  // Explicitly blank actor with no kintone login user
  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: '',
    loginUser: null
  });

  assert.equal(outcome.success, false);
  assert.equal(outcome.error, 'ACTOR_IDENTITY_UNRESOLVED');
  assert.equal(adapter.addRecordCallCount, 0);
});

test('10. Idempotent retry: second attempt returns verified existing evidence without duplicate creation', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  // First call creates the archive record
  const outcome1 = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_somkiat'
  });
  assert.equal(outcome1.success, true);
  assert.equal(outcome1.archiveResult.idempotentReplay, false);
  assert.equal(adapter.addRecordCallCount, 1);

  // Second call with identical transition & snapshot must detect existing record and return verified evidence
  const outcome2 = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_somkiat'
  });
  assert.equal(outcome2.success, true);
  assert.equal(outcome2.archiveResult.idempotentReplay, true);
  assert.equal(outcome2.archiveResult.archiveKey, outcome1.archiveResult.archiveKey);
  assert.equal(outcome2.archiveResult.snapshotHash, outcome1.archiveResult.snapshotHash);

  // Crucial check: addRecord must NOT have been called a second time
  assert.equal(adapter.addRecordCallCount, 1);
});
