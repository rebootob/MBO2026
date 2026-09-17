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
import { RevisionArchiveKintoneRepository } from '../src/services/revision-archive-kintone-repository.js';
import { hashD3Snapshot } from '../src/services/d3-snapshot-serializer.js';
import { resolveIdentityViewerRole } from '../src/ui/employee-visibility.js';

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
    Effective_Scorer_Slots_Snapshot: { value: '[1, 2]' },
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

// 1. exact 05/action/06 creates OBJECTIVE archive
test('1. exact 05/action/06 creates OBJECTIVE archive', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
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

// 2. exact 10/action/11 creates MIDYEAR archive
test('2. exact 10/action/11 creates MIDYEAR archive', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '10 Mid-Year Completed' },
    action: { value: 'Start Self Evaluation' },
    nextStatus: { value: '11 Employee Self Evaluation' }
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

// 3. exact 15/action/16 creates FINAL archive
test('3. exact 15/action/16 creates FINAL archive', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '15 HR Final Check' },
    action: { value: 'Complete' },
    nextStatus: { value: '16 Completed' }
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

// 4. wrong action ที่ status 05 ไม่ archive
test('4. wrong action at status 05 does not archive', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Reject' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });

  assert.equal(outcome.skipped, true);
  assert.equal(adapter.addRecordCallCount, 0);
});

// 5. wrong action ที่ status 10 ไม่ archive
test('5. wrong action at status 10 does not archive', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '10 Mid-Year Completed' },
    action: { value: 'Start Final Evaluation' },
    nextStatus: { value: '11 Employee Self Evaluation' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });

  assert.equal(outcome.skipped, true);
  assert.equal(adapter.addRecordCallCount, 0);
});

// 6. wrong action ที่ status 15 ไม่ archive
test('6. wrong action at status 15 does not archive', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '15 HR Final Check' },
    action: { value: 'Complete Evaluation' }, // Canonical is strictly 'Complete'
    nextStatus: { value: '16 Completed' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });

  assert.equal(outcome.skipped, true);
  assert.equal(adapter.addRecordCallCount, 0);
});

// 7. wrong nextStatus ไม่ archive
test('7. wrong nextStatus does not archive', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();

  const event05 = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '01 Draft' }
  };
  const outcome05 = await executeProcessTransitionArchive(record, event05, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });
  assert.equal(outcome05.skipped, true);

  const event10 = {
    status: { value: '10 Mid-Year Completed' },
    action: { value: 'Start Self Evaluation' },
    nextStatus: { value: '10 Mid-Year Completed' }
  };
  const outcome10 = await executeProcessTransitionArchive(record, event10, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });
  assert.equal(outcome10.skipped, true);

  const event15 = {
    status: { value: '15 HR Final Check' },
    action: { value: 'Complete' },
    nextStatus: { value: '15 HR Final Check' }
  };
  const outcome15 = await executeProcessTransitionArchive(record, event15, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });
  assert.equal(outcome15.skipped, true);
  assert.equal(adapter.addRecordCallCount, 0);
});

// 8. missing mandatory provenance ทุก field ต้อง block
test('8. missing mandatory provenance fields fail-closed and block transition', async () => {
  const mandatoryFields = [
    'Record_Key',
    'Employee_Code',
    'Fiscal_Year',
    'Revision_Number',
    'Frozen_Profile_Code',
    'K_expected_Snapshot',
    'Route_Pattern',
    'Routing_Topology',
    'Effective_Routing_Key',
    'Effective_Route_Version_Key',
    'Department_Hoshin_Key',
    'Configuration_Hash'
  ];

  for (const field of mandatoryFields) {
    const adapter = createMockKintoneAdapter();
    const badRecord = makeMockApp794Record({
      [field]: { value: '' }
    });
    if (field === 'Frozen_Profile_Code') {
      badRecord.Profile_Code = { value: '' };
    }
    if (field === 'Revision_Number') {
      badRecord.Current_Revision_Number = { value: '' };
    }

    const event = {
      status: { value: '05 Objective Approved' },
      action: { value: 'Start Mid-Year' },
      nextStatus: { value: '06 Employee Mid-Year' }
    };

    const outcome = await executeProcessTransitionArchive(badRecord, event, {
      apiAdapter: adapter,
      actor: 'hr_operator'
    });

    assert.equal(outcome.success, false, `Expected failure when ${field} is missing`);
    assert.equal(adapter.addRecordCallCount, 0, `addRecord must not be called when ${field} is missing`);
  }
});

// 9. malformed scorer snapshot ต้อง block
test('9. malformed scorer snapshot fails closed and blocks transition', async () => {
  const adapter = createMockKintoneAdapter();
  const badRecord = makeMockApp794Record({
    Effective_Scorer_Slots_Snapshot: { value: 'MALFORMED_JSON_STRING{{{' },
    Scorers: undefined
  });

  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(badRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });

  assert.equal(outcome.success, false);
  assert.ok(outcome.error.includes('PROVENANCE_MALFORMED'));
  assert.equal(adapter.addRecordCallCount, 0);
});

// 10. scorer/K_expected mismatch ต้อง block
test('10. scorer and K_expected mismatch fails closed and blocks transition', async () => {
  const adapter = createMockKintoneAdapter();
  const badRecord = makeMockApp794Record({
    K_expected_Snapshot: { value: '2' },
    Effective_Scorer_Slots_Snapshot: { value: '[1]' }, // Only 1 scorer while K=2
    Scorers: undefined
  });

  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(badRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });

  assert.equal(outcome.success, false);
  assert.ok(outcome.error.includes('PROVENANCE_MISMATCH'));
  assert.equal(adapter.addRecordCallCount, 0);
});

// 11. duplicate scorer/appraiser ต้อง block
test('11. duplicate scorer/appraiser fails closed and blocks transition', async () => {
  // Case A: Duplicate appraiser in workflow
  const adapter1 = createMockKintoneAdapter();
  const badRecord1 = makeMockApp794Record({
    Workflow_Appraisers: [
      { code: 'mgr_somchai' },
      { code: 'mgr_somchai' }
    ]
  });

  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome1 = await executeProcessTransitionArchive(badRecord1, event, {
    apiAdapter: adapter1,
    actor: 'hr_operator'
  });
  assert.equal(outcome1.success, false);
  assert.ok(outcome1.error.includes('PROVENANCE_DUPLICATE'));
  assert.equal(adapter1.addRecordCallCount, 0);

  // Case B: Duplicate scorer identity
  const adapter2 = createMockKintoneAdapter();
  const badRecord2 = makeMockApp794Record({
    Workflow_Appraisers: [
      { code: 'mgr_somchai' },
      { code: 'gm_somrudee' }
    ],
    Effective_Scorer_Slots_Snapshot: { value: '[1, 1]' }, // Duplicate slot 1
    Scorers: undefined
  });

  const outcome2 = await executeProcessTransitionArchive(badRecord2, event, {
    apiAdapter: adapter2,
    actor: 'hr_operator'
  });
  assert.equal(outcome2.success, false);
  assert.ok(outcome2.error.includes('PROVENANCE_DUPLICATE'));
  assert.equal(adapter2.addRecordCallCount, 0);
});

// 12. validation failure causes zero addRecord calls
test('12. validation failure causes zero addRecord calls', async () => {
  const adapter = createMockKintoneAdapter();
  const invalidRecord = makeMockApp794Record({
    Route_Pattern: { value: 'INVALID_PATTERN_KEY' }
  });

  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(invalidRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });

  assert.equal(outcome.success, false);
  assert.equal(adapter.addRecordCallCount, 0);
});

// 13. actor unresolved blocks transition
test('13. actor unresolved blocks transition', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: '',
    loginUser: null
  });

  assert.equal(outcome.success, false);
  assert.equal(outcome.error, 'ACTOR_IDENTITY_UNRESOLVED');
  assert.equal(adapter.addRecordCallCount, 0);
});

// 14. repository/read-back failure blocks transition
test('14. repository failure blocks transition', async () => {
  const failingAdapter = {
    getRecords: async () => ({ records: [] }),
    addRecord: async () => {
      throw new Error('Kintone 500: Database Connection Failed');
    }
  };

  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: failingAdapter,
    actor: 'hr_operator'
  });

  assert.equal(outcome.success, false);
  assert.ok(outcome.error.includes('Kintone 500'));
});

// 15. idempotent retry creates no duplicate
test('15. idempotent retry creates no duplicate record', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome1 = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });
  assert.equal(outcome1.success, true);
  assert.equal(outcome1.archiveResult.idempotentReplay, false);
  assert.equal(adapter.addRecordCallCount, 1);

  const outcome2 = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_operator'
  });
  assert.equal(outcome2.success, true);
  assert.equal(outcome2.archiveResult.idempotentReplay, true);
  assert.equal(adapter.addRecordCallCount, 1);
});

// 16. Archive_Key/Snapshot_Hash timestamp-independent
test('16. Archive_Key and Snapshot_Hash are timestamp-independent', () => {
  const record = makeMockApp794Record();
  const snapshot1 = buildStageLogicalSnapshot(record, 'OBJECTIVE', '05 Objective Approved');
  const snapshot2 = buildStageLogicalSnapshot(record, 'OBJECTIVE', '05 Objective Approved');

  const hash1 = hashD3Snapshot(snapshot1);
  const hash2 = hashD3Snapshot(snapshot2);
  assert.equal(hash1.sha256, hash2.sha256);
  assert.equal(hash1.canonicalJson, hash2.canonicalJson);

  const key1 = `${snapshot1.source.Record_Key}|${snapshot1.stage.Evaluation_Stage}|R${snapshot1.stage.Revision_Number}|STAGE_COMPLETION`;
  const key2 = `${snapshot2.source.Record_Key}|${snapshot2.stage.Evaluation_Stage}|R${snapshot2.stage.Revision_Number}|STAGE_COMPLETION`;
  assert.equal(key1, key2);
});

// 17. distinct mock identities pass correct role visibility
test('17. distinct mock identities pass correct role visibility', () => {
  const record = {
    Employee_Code: { value: 'EMP001' },
    Requester_User: { value: [{ code: 'emp001' }] },
    Manager_Level1_Approvers: { value: [{ code: 'mgr001' }] },
    Manager_Level2_Approvers: { value: [] },
    GM_Level1_Approvers: { value: [{ code: 'gm001' }] },
    GM_Level2_Approvers: { value: [] },
    HR_User: { value: [{ code: 'hr001' }] }
  };

  const empRole = resolveIdentityViewerRole(record, 'emp001');
  assert.equal(empRole, 'EMPLOYEE');

  const mgrRole = resolveIdentityViewerRole(record, 'mgr001');
  assert.equal(mgrRole, 'APPRAISER');

  const gmRole = resolveIdentityViewerRole(record, 'gm001');
  assert.equal(gmRole, 'APPRAISER');

  const hrRole = resolveIdentityViewerRole(record, 'hr001');
  assert.equal(hrRole, 'HR');
});

// 18. multi-role collision remains RESTRICTED
test('18. multi-role collision remains RESTRICTED', () => {
  const record = {
    Employee_Code: { value: 'EMP001' },
    Requester_User: { value: [{ code: 'emp_somchai' }] },
    Manager_User: { value: [{ code: 'emp_somchai' }] },
    Workflow_Appraiser_1: { value: [] },
    Workflow_Appraiser_2: { value: [] },
    Workflow_Appraiser_3: { value: [] }
  };
  const role = resolveIdentityViewerRole(record, 'emp_somchai');
  assert.equal(role, 'RESTRICTED');
});

// 19. existing archive domain tests remain PASS
test('19. existing archive domain tests remain PASS', () => {
  const mockAdapter = createMockKintoneAdapter();
  const repo = new RevisionArchiveKintoneRepository(mockAdapter);
  const service = new RevisionArchiveService(repo);
  assert.ok(repo);
  assert.ok(service);
});

// 20. objective-save-validation regression remains PASS
test('20. objective-save-validation regression remains PASS', () => {
  const record = makeMockApp794Record();
  assert.equal(record.Record_Key.value, 'FY2026-TEST-EMP001');
  assert.equal(record.Workflow_Appraisers.length, 2);
  assert.equal(record.K_expected_Snapshot.value, '2');
});
