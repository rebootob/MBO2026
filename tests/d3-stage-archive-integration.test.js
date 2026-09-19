import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildStageLogicalSnapshot,
  executeProcessTransitionArchive
} from '../src/main-mbo-app.js';
import {
  RevisionArchiveService,
  ARCHIVE_EVENT_TYPES,
  RevisionArchiveError
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
  // Live-shaped App794 record (confirmed 2026-09-19 provenance reconciliation):
  // - $revision       : Kintone system field — authoritative revision source
  // - Routing_Topology: live App794 field — Route_Pattern derived from it, NOT stored
  // - Route_Pattern   : NOT present in App794 — must not be injected into mocks
  // - Department_Hoshin_Key: NOT present in App794 — NOT a mandatory field
  // - Revision_Number / Current_Revision_Number: NOT present in App794 live schema
  return {
    $id: { value: '18' },
    $revision: { value: '1' },        // Kintone system field — authoritative revision source
    Record_Key: { value: 'FY2026-TEST-EMP001' },
    Employee_Code: { value: 'EMP001' },
    Fiscal_Year: { value: 'FY2026' },
    // Route_Pattern intentionally absent: derived from Routing_Topology via D3_ROUTE_PATTERNS
    Routing_Topology: { value: 'M1_G1' },
    Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    Frozen_Profile_Code: { value: 'PROF_STAFF_CHIEF' },
    K_expected_Snapshot: { value: '2' },
    Effective_Routing_Key: { value: 'TME1' },
    Effective_Route_Version_Key: { value: 'TME1#v1' },
    // Canonical physical USER_SELECT and approval rule fields (App 794)
    Manager_Level1_Approvers: { value: [{ code: 'mgr_somchai', name: 'Somchai Mgr' }] },
    Manager_Level1_Approval_Rule: { value: 'ALL' },
    GM_Level1_Approvers: { value: [{ code: 'gm_somrudee', name: 'Somrudee GM' }] },
    GM_Level1_Approval_Rule: { value: 'ALL' },
    Effective_Scorer_Slots_Snapshot: { value: '[1, 2]' },
    // Department_Hoshin_Key intentionally absent: NOT an App794 live field
    Configuration_Hash: { value: 'cfg_hash_verified_99' },
    // Canonical physical objective matrix fields (App 794)
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Deliver Stage Archives' },
    Action_Plan_1: { value: 'Implement deterministic archive creation' },
    Weight_1: { value: '50' },
    Difficulty_1: { value: '2' },
    Objective_2: { value: 'Ensure Zero-IO Compliance' },
    Action_Plan_2: { value: 'Verify mock and test isolation' },
    Weight_2: { value: '50' },
    Difficulty_2: { value: '3' },
    PartA_Raw_Score: { value: '88.5' },
    ...overrides
  };
}

// 1. exact 05/action/06 creates OBJECTIVE archive
  const defaultTestIdentityContext = {
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: 'EMP_TEST_OPERATOR',
    kintoneLoginUserCode: 'hr_operator'
  };

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
      actor: 'hr_operator',
      ...defaultTestIdentityContext
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
    actor: 'hr_operator',
    ...defaultTestIdentityContext
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
    actor: 'hr_operator',
    ...defaultTestIdentityContext
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
    actor: 'hr_operator',
    ...defaultTestIdentityContext
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
    actor: 'hr_operator',
    ...defaultTestIdentityContext
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
    actor: 'hr_operator',
    ...defaultTestIdentityContext
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
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcome05.skipped, true);

  const event10 = {
    status: { value: '10 Mid-Year Completed' },
    action: { value: 'Start Self Evaluation' },
    nextStatus: { value: '10 Mid-Year Completed' }
  };
  const outcome10 = await executeProcessTransitionArchive(record, event10, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcome10.skipped, true);

  const event15 = {
    status: { value: '15 HR Final Check' },
    action: { value: 'Complete' },
    nextStatus: { value: '15 HR Final Check' }
  };
  const outcome15 = await executeProcessTransitionArchive(record, event15, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcome15.skipped, true);
  assert.equal(adapter.addRecordCallCount, 0);
});

// 8. missing mandatory provenance ทุก field ต้อง block
test('8. missing mandatory provenance fields fail-closed and block transition', async () => {
  // Fields that are mandatory and live in App794 schema.
  // Route_Pattern is NOT mandatory (derived from Routing_Topology).
  // Revision_Number / Current_Revision_Number are NOT mandatory ($revision is authoritative).
  // Department_Hoshin_Key is NOT mandatory (no authoritative App794 source — CONTRACT_DECISION).
  const mandatoryFields = [
    'Record_Key',
    'Employee_Code',
    'Fiscal_Year',
    '$revision',
    'Frozen_Profile_Code',
    'K_expected_Snapshot',
    'Routing_Topology',
    'Effective_Routing_Key',
    'Effective_Route_Version_Key',
    'Configuration_Hash',
    'Objective_Count',
    'PartA_Raw_Score'
  ];

  for (const field of mandatoryFields) {
    const adapter = createMockKintoneAdapter();
    const badRecord = makeMockApp794Record({
      [field]: { value: '' }
    });
    if (field === 'Frozen_Profile_Code') {
      badRecord.Profile_Code = { value: '' };
    }

    const event = {
      status: { value: '05 Objective Approved' },
      action: { value: 'Start Mid-Year' },
      nextStatus: { value: '06 Employee Mid-Year' }
    };

    const outcome = await executeProcessTransitionArchive(badRecord, event, {
      apiAdapter: adapter,
      actor: 'hr_operator',
      ...defaultTestIdentityContext
    });

    assert.equal(outcome.success, false, `Expected failure when ${field} is missing`);
    assert.equal(adapter.addRecordCallCount, 0, `addRecord must not be called when ${field} is missing`);
  }
});

// 9. malformed scorer snapshot ต้อง block
test('9. malformed scorer snapshot fails closed and blocks transition', async () => {
  const adapter = createMockKintoneAdapter();
  const badRecord = makeMockApp794Record({
    Effective_Scorer_Slots_Snapshot: { value: 'MALFORMED_JSON_STRING{{{' }
  });

  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(badRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });

  assert.equal(outcome.success, false);
  assert.ok(outcome.error.includes('PROVENANCE_MALFORMED'));
  assert.equal(adapter.addRecordCallCount, 0);
});

// 10. scorer and K_expected mismatch ต้อง block
test('10. scorer and K_expected mismatch fails closed and blocks transition', async () => {
  const adapter = createMockKintoneAdapter();
  const badRecord = makeMockApp794Record({
    K_expected_Snapshot: { value: '2' },
    Effective_Scorer_Slots_Snapshot: { value: '[1]' } // Only 1 scorer while K=2
  });

  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(badRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });

  assert.equal(outcome.success, false);
  assert.ok(outcome.error.includes('PROVENANCE_MISMATCH'));
  assert.equal(adapter.addRecordCallCount, 0);
});

// 11. duplicate scorer/appraiser ต้อง block
test('11. duplicate scorer/appraiser fails closed and blocks transition', async () => {
  // Case A: Duplicate appraiser in workflow (M1 and G1 have same user)
  const adapter1 = createMockKintoneAdapter();
  const badRecord1 = makeMockApp794Record({
    Manager_Level1_Approvers: { value: [{ code: 'mgr_somchai' }] },
    GM_Level1_Approvers: { value: [{ code: 'mgr_somchai' }] }
  });

  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome1 = await executeProcessTransitionArchive(badRecord1, event, {
    apiAdapter: adapter1,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcome1.success, false);
  assert.ok(outcome1.error.includes('PROVENANCE_DUPLICATE'));
  assert.equal(adapter1.addRecordCallCount, 0);

  // Case B: Duplicate scorer ordinal
  const adapter2 = createMockKintoneAdapter();
  const badRecord2 = makeMockApp794Record({
    Effective_Scorer_Slots_Snapshot: { value: '[1, 1]' }
  });

  const outcome2 = await executeProcessTransitionArchive(badRecord2, event, {
    apiAdapter: adapter2,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcome2.success, false);
  assert.ok(outcome2.error.includes('PROVENANCE_DUPLICATE'));
  assert.equal(adapter2.addRecordCallCount, 0);
});

// 12. validation failure causes zero addRecord calls
test('12. validation failure causes zero addRecord calls', async () => {
  const adapter = createMockKintoneAdapter();
  // Route_Pattern does not exist in App794 — invalid topology triggers fail-closed
  const invalidRecord = makeMockApp794Record({
    Routing_Topology: { value: 'INVALID_TOPOLOGY_KEY' }
  });

  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(invalidRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
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
    actor: 'hr_operator',
    ...defaultTestIdentityContext
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
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcome1.success, true);
  assert.equal(outcome1.archiveResult.idempotentReplay, false);
  assert.equal(adapter.addRecordCallCount, 1);

  const outcome2 = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
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

// 19. revision archive service rejects invalid scorer weights according to DEC-036 (fail closed)
test('19. revision archive service rejects invalid scorer weights according to DEC-036', async () => {
  const mockAdapter = createMockKintoneAdapter();
  const repo = new RevisionArchiveKintoneRepository(mockAdapter);
  const service = new RevisionArchiveService(repo, { clock: () => '2026-03-31T00:00:00.000Z' });

  // Test Case A: K=2 but weights are non-DEC-036 (e.g. [60, 40] instead of [50, 50])
  const baseRecord = makeMockApp794Record();
  const badSnapshot6040 = buildStageLogicalSnapshot(baseRecord, 'OBJECTIVE', '05 Objective Approved');
  badSnapshot6040.scoring.Scorers = [
    { code: 'mgr_somchai', weight: 60 },
    { code: 'gm_somrudee', weight: 40 }
  ];

  await assert.rejects(
    async () => {
      await service.archiveStageCompletion({
        sourceRecordKey: 'FY2026-TEST-EMP001',
        sourceRecordId: 18,
        employeeCode: 'EMP001',
        fiscalYear: 'FY2026',
        revisionNumber: 1,
        evaluationStage: 'OBJECTIVE',
        sourceStatus: '05 Objective Approved',
        logicalSnapshot: badSnapshot6040,
        actor: { userCode: 'hr_operator' }
      });
    },
    (err) => {
      assert.ok(err instanceof RevisionArchiveError);
      assert.ok(err.message.includes('DEC-036 violation: K=2 requires scorer weight to be exactly 50'));
      return true;
    }
  );

  // Test Case B: Scorer with negative weight
  const badSnapshotNegative = buildStageLogicalSnapshot(baseRecord, 'OBJECTIVE', '05 Objective Approved');
  badSnapshotNegative.scoring.Scorers = [
    { code: 'mgr_somchai', weight: -50 },
    { code: 'gm_somrudee', weight: 150 }
  ];

  await assert.rejects(
    async () => {
      await service.archiveStageCompletion({
        sourceRecordKey: 'FY2026-TEST-EMP001',
        sourceRecordId: 18,
        employeeCode: 'EMP001',
        fiscalYear: 'FY2026',
        revisionNumber: 1,
        evaluationStage: 'OBJECTIVE',
        sourceStatus: '05 Objective Approved',
        logicalSnapshot: badSnapshotNegative,
        actor: { userCode: 'hr_operator' }
      });
    },
    (err) => {
      assert.ok(err instanceof RevisionArchiveError);
      assert.ok(err.message.includes('must have an exact finite positive number weight'));
      return true;
    }
  );
});

// 20. physical objective matrix validation enforces required fields and rejects missing/invalid values
test('20. physical objective matrix validation enforces required fields and rejects missing/invalid values', async () => {
  const adapter = createMockKintoneAdapter();

  // Test Case A: Missing Objective_1 text
  const missingObjTextRecord = makeMockApp794Record({
    Objective_1: { value: '' }
  });
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcomeA = await executeProcessTransitionArchive(missingObjTextRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcomeA.success, false);
  assert.ok(outcomeA.error.includes('Objective_1 is required'));
  assert.equal(adapter.addRecordCallCount, 0);

  // Test Case B: Missing PartA_Raw_Score
  const missingScoreRecord = makeMockApp794Record({
    PartA_Raw_Score: { value: '' }
  });
  const outcomeB = await executeProcessTransitionArchive(missingScoreRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcomeB.success, false);
  assert.ok(outcomeB.error.includes('PartA_Raw_Score is required'));
  assert.equal(adapter.addRecordCallCount, 0);

  // Test Case C: Invalid Objective_Count (out of range [2..10])
  const badCountRecord = makeMockApp794Record({
    Objective_Count: { value: '1' }
  });
  const outcomeC = await executeProcessTransitionArchive(badCountRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcomeC.success, false);
  assert.ok(outcomeC.error.includes('Objective_Count must be an integer between 2 and 10'));
  assert.equal(adapter.addRecordCallCount, 0);
});

// 21. K1 route pattern produces exact 100% scorer weight
test('21. K1 route pattern produces exact 100% scorer weight', async () => {
  const adapter = createMockKintoneAdapter();
  const k1Record = makeMockApp794Record({
    K_expected_Snapshot: { value: '1' },
    Route_Pattern: { value: 'PATTERN_1_M1' },
    Routing_Topology: { value: 'M1_ONLY' },
    Effective_Scorer_Slots_Snapshot: { value: '[1]' },
    GM_Level1_Approvers: { value: [] },
    GM_Level1_Approval_Rule: { value: '' }
  });

  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(k1Record, event, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });

  assert.equal(outcome.success, true);
  const created = Array.from(adapter.store.values())[0];
  const snapshot = JSON.parse(created.Snapshot_JSON.value);
  assert.equal(snapshot.profile.K_expected_Snapshot, 1);
  assert.equal(snapshot.scoring.Scorers.length, 1);
  assert.equal(snapshot.scoring.Scorers[0].code, 'mgr_somchai');
  assert.equal(snapshot.scoring.Scorers[0].weight, 100);
});

// 22. active slot with multiple users or non-ALL rule fails closed
test('22. active slot with multiple users or non-ALL rule fails closed', async () => {
  const adapter = createMockKintoneAdapter();

  // Case A: Multiple users in active slot
  const multiUserRecord = makeMockApp794Record({
    Manager_Level1_Approvers: {
      value: [
        { code: 'mgr_somchai' },
        { code: 'mgr_anand' }
      ]
    }
  });

  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcomeA = await executeProcessTransitionArchive(multiUserRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcomeA.success, false);
  assert.ok(outcomeA.error.includes('must have exactly one user, found 2'));

  // Case B: Approval rule is not ALL
  const badRuleRecord = makeMockApp794Record({
    Manager_Level1_Approval_Rule: { value: 'ANY' }
  });
  const outcomeB = await executeProcessTransitionArchive(badRuleRecord, event, {
    apiAdapter: adapter,
    actor: 'hr_operator',
    ...defaultTestIdentityContext
  });
  assert.equal(outcomeB.success, false);
  assert.ok(outcomeB.error.includes('must be "ALL", received: "ANY"'));
});

test('23. SHARED identity mode successfully creates archive record with 5 mixed-identity fields', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'shared_pc_01',
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: 'EMP0099',
    kintoneLoginUserCode: 'shared_pc_01'
  });

  assert.equal(outcome.success, true);
  assert.equal(adapter.addRecordCallCount, 1);
  const archived = Array.from(adapter.store.values())[0];

  assert.equal(archived.Identity_Mode.value, 'SHARED');
  assert.equal(archived.Actual_Operator_Employee_Code.value, 'EMP0099');
  assert.equal(archived.Kintone_Login_User_Code.value, 'shared_pc_01');
  assert.equal(archived.Action_Name.value, 'Start Mid-Year');
  assert.equal(archived.To_Status.value, '06 Employee Mid-Year');
  // Confirm distinct identities are preserved
  assert.notEqual(archived.Actual_Operator_Employee_Code.value, archived.Kintone_Login_User_Code.value);
  assert.notEqual(archived.Employee_Code.value, archived.Actual_Operator_Employee_Code.value);
});

test('24. DEDICATED identity mode successfully creates archive record with 5 mixed-identity fields', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '10 Mid-Year Completed' },
    action: { value: 'Start Self Evaluation' },
    nextStatus: { value: '11 Employee Self Evaluation' }
  };

  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'somchai_mgr',
    identityMode: 'DEDICATED',
    actualOperatorEmployeeCode: 'EMP0012',
    kintoneLoginUserCode: 'somchai_mgr'
  });

  assert.equal(outcome.success, true);
  assert.equal(adapter.addRecordCallCount, 1);
  const archived = Array.from(adapter.store.values())[0];

  assert.equal(archived.Identity_Mode.value, 'DEDICATED');
  assert.equal(archived.Actual_Operator_Employee_Code.value, 'EMP0012');
  assert.equal(archived.Kintone_Login_User_Code.value, 'somchai_mgr');
  assert.equal(archived.Action_Name.value, 'Start Self Evaluation');
  assert.equal(archived.To_Status.value, '11 Employee Self Evaluation');
});

test('25. Fail-closed: invalid or missing identityMode fails closed', async () => {
  const adapter = {
    getRecords: async () => ({ records: [] }),
    addRecord: async () => ({ id: '1' })
  };
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  // Case A: unsupported identity mode
  const outcomeA = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'user_01',
    identityMode: 'INVALID_MODE',
    actualOperatorEmployeeCode: 'EMP001',
    kintoneLoginUserCode: 'user_01'
  });
  assert.equal(outcomeA.success, false);
  assert.equal(outcomeA.error, 'UNSUPPORTED_IDENTITY_MODE');

  // Case B: empty identityMode string
  const outcomeB = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'user_01',
    identityMode: '',
    actualOperatorEmployeeCode: 'EMP001',
    kintoneLoginUserCode: 'user_01'
  });
  assert.equal(outcomeB.success, false);
  assert.equal(outcomeB.error, 'UNSUPPORTED_IDENTITY_MODE');
});

test('26. Fail-closed: missing actual operator or login user fails closed', async () => {
  const adapter = {
    getRecords: async () => ({ records: [] }),
    addRecord: async () => ({ id: '1' })
  };
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  // Missing actualOperatorEmployeeCode
  const outcomeA = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'user_01',
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: '',
    kintoneLoginUserCode: 'user_01'
  });
  assert.equal(outcomeA.success, false);
  assert.equal(outcomeA.error, 'ACTUAL_OPERATOR_UNRESOLVED');

  // Missing kintoneLoginUserCode
  const outcomeB = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'user_01',
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: 'EMP001',
    kintoneLoginUserCode: ''
  });
  assert.equal(outcomeB.success, false);
  assert.equal(outcomeB.error, 'KINTONE_LOGIN_USER_UNRESOLVED');
});

test('27. Fail-closed: case-sensitive mismatch between kintoneLoginUserCode and actorCode fails closed', async () => {
  const adapter = {
    getRecords: async () => ({ records: [] }),
    addRecord: async () => ({ id: '1' })
  };
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  // Case mismatch: 'User_01' !== 'user_01'
  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'user_01',
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: 'EMP001',
    kintoneLoginUserCode: 'User_01' // uppercase U
  });
  assert.equal(outcome.success, false);
  assert.equal(outcome.error, 'IDENTITY_CONTEXT_MISMATCH');
});

test('28. Historical row policy: historical App798 row without the 5 new fields can be normalized and read without fabricating identity', async () => {
  const adapter = createMockKintoneAdapter();
  const repo = new RevisionArchiveKintoneRepository(adapter);

  // Simulate existing historical App798 record in store without the 5 Decision-010 fields
  const historicalRecordKey = 'APP794-REC-999:MIDYEAR:REV-01';
  const historicalRawRecord = {
    $id: { type: '__ID__', value: '79801' },
    $revision: { type: '__REVISION__', value: '1' },
    Archive_Key: { type: 'SINGLE_LINE_TEXT', value: historicalRecordKey },
    Event_Type: { type: 'SINGLE_LINE_TEXT', value: 'STAGE_COMPLETION_SNAPSHOT' },
    Evaluation_Stage: { type: 'SINGLE_LINE_TEXT', value: 'MIDYEAR' },
    Target_App_Id: { type: 'NUMBER', value: '794' },
    Target_Record_Id: { type: 'NUMBER', value: '999' },
    Target_Record_Key: { type: 'SINGLE_LINE_TEXT', value: 'APP794-REC-999' },
    Target_Revision_Number: { type: 'NUMBER', value: '1' },
    Source_State_Hash: { type: 'SINGLE_LINE_TEXT', value: 'hash_abc123' },
    Snapshot_JSON: { type: 'MULTI_LINE_TEXT', value: '{"test":true}' },
    Snapshot_Hash: { type: 'SINGLE_LINE_TEXT', value: 'hash_xyz789' },
    Archived_By: { type: 'SINGLE_LINE_TEXT', value: 'legacy_user' },
    Archived_At: { type: 'SINGLE_LINE_TEXT', value: '2025-01-01T00:00:00.000Z' },
    Is_Historical_Replay: { type: 'SINGLE_LINE_TEXT', value: 'false' },
    Status: { type: 'SINGLE_LINE_TEXT', value: 'RECORDED' }
    // Intentionally omit: Identity_Mode, Actual_Operator_Employee_Code, Kintone_Login_User_Code, Action_Name, To_Status
  };

  adapter.store.set('79801', historicalRawRecord);

  // Read back historical record
  const normalized = await repo.readBackExactArchiveRecord(historicalRecordKey);

  assert.ok(normalized);
  assert.equal(normalized.archiveKey, historicalRecordKey);
  assert.equal(normalized.archivedAt, '2025-01-01T00:00:00.000Z');
  // Prove that 5 fields normalize to null without fabricating identity or throwing
  assert.equal(normalized.identityMode, null);
  assert.equal(normalized.actualOperatorEmployeeCode, null);
  assert.equal(normalized.kintoneLoginUserCode, null);
  assert.equal(normalized.actionName, null);
  assert.equal(normalized.toStatus, null);
  // Prove no new record was created in the process
  assert.equal(adapter.addRecordCallCount, 0);
});

test('29. Idempotent replay preserves identical Archive_Key and verifies exact 5 fields', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  const opts = {
    apiAdapter: adapter,
    actor: 'operator_kintone',
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: 'EMP5555',
    kintoneLoginUserCode: 'operator_kintone'
  };

  // First call -> creates row
  const outcome1 = await executeProcessTransitionArchive(record, event, opts);
  assert.equal(outcome1.success, true);
  assert.equal(adapter.addRecordCallCount, 1);
  assert.equal(outcome1.archiveResult.idempotentReplay, false);

  // Second call (replay) -> finds existing row, validates exact fields, does not add new record
  const outcome2 = await executeProcessTransitionArchive(record, event, opts);
  assert.equal(outcome2.success, true);
  assert.equal(adapter.addRecordCallCount, 1); // no extra addRecord
  assert.equal(outcome2.archiveResult.idempotentReplay, true);
});

test('30. Fail-closed: D3 target transition without identity context fails with MISSING_IDENTITY_CONTEXT and 0 writes', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  // Explicitly invoke without employeeSelfContext, identityMode, actualOperatorEmployeeCode, or kintoneLoginUserCode
  const outcome = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'valid_login_user'
  });

  assert.equal(outcome.success, false);
  assert.equal(outcome.error, 'MISSING_IDENTITY_CONTEXT');
  assert.equal(adapter.addRecordCallCount, 0);
});

test('31. Mixed Identity Max Length: Actual_Operator_Employee_Code length 64 = PASS, length 65 = FAIL CLOSED', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  // 1. Boundary 64 characters -> PASS
  const op64 = 'E'.repeat(64);
  const outcomePass = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: 'operator_kintone',
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: op64,
    kintoneLoginUserCode: 'operator_kintone'
  });
  assert.equal(outcomePass.success, true);
  assert.equal(adapter.addRecordCallCount, 1);

  // Reset adapter store and count
  const adapterFail = createMockKintoneAdapter();

  // 2. Boundary 65 characters -> FAIL CLOSED with zero writes
  const op65 = 'E'.repeat(65);
  const outcomeFail = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapterFail,
    actor: 'operator_kintone',
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: op65,
    kintoneLoginUserCode: 'operator_kintone'
  });
  assert.equal(outcomeFail.success, false);
  assert.ok(outcomeFail.error.includes('ACTUAL_OPERATOR_EMPLOYEE_CODE_EXCEEDS_MAX_LENGTH'));
  assert.equal(adapterFail.addRecordCallCount, 0);
});

test('32. Mixed Identity Max Length: Kintone_Login_User_Code length 64 = PASS, length 65 = FAIL CLOSED', async () => {
  const adapter = createMockKintoneAdapter();
  const record = makeMockApp794Record();
  const event = {
    status: { value: '05 Objective Approved' },
    action: { value: 'Start Mid-Year' },
    nextStatus: { value: '06 Employee Mid-Year' }
  };

  // 3. Boundary 64 characters -> PASS
  const login64 = 'k'.repeat(64);
  const outcomePass = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapter,
    actor: login64,
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: 'EMP_VALID',
    kintoneLoginUserCode: login64
  });
  assert.equal(outcomePass.success, true);
  assert.equal(adapter.addRecordCallCount, 1);

  // Reset adapter
  const adapterFail = createMockKintoneAdapter();

  // 4. Boundary 65 characters -> FAIL CLOSED with zero writes
  const login65 = 'k'.repeat(65);
  const outcomeFail = await executeProcessTransitionArchive(record, event, {
    apiAdapter: adapterFail,
    actor: login65,
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: 'EMP_VALID',
    kintoneLoginUserCode: login65
  });
  assert.equal(outcomeFail.success, false);
  assert.ok(outcomeFail.error.includes('KINTONE_LOGIN_USER_CODE_EXCEEDS_MAX_LENGTH'));
  assert.equal(adapterFail.addRecordCallCount, 0);
});

test('33. Mixed Identity Max Length: Action_Name length 128 = PASS, length 129 = FAIL CLOSED', async () => {
  const action128 = 'A'.repeat(128);
  const record = makeMockApp794Record();
  const snapshot = buildStageLogicalSnapshot(record, 'OBJECTIVE', '05 Objective Approved');
  const adapterPass = createMockKintoneAdapter();
  const servicePass = new RevisionArchiveService(adapterPass, { clock: () => '2026-03-31T00:00:00.000Z' });
  // Valid call with actionName length 128
  const resPass = await servicePass.archiveStageCompletion({
    sourceRecordKey: 'FY2026-TEST-EMP001',
    employeeCode: 'EMP001',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    actor: { userCode: 'operator_kintone' },
    logicalSnapshot: snapshot,
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: 'EMP001',
    kintoneLoginUserCode: 'operator_kintone',
    actionName: action128,
    toStatus: '06 Employee Mid-Year'
  });
  assert.equal(resPass.verified, true);
  assert.equal(adapterPass.addRecordCallCount, 1);

  // Boundary 129 characters -> FAIL CLOSED
  const adapterFail = createMockKintoneAdapter();
  const serviceFail = new RevisionArchiveService(adapterFail, { clock: () => '2026-03-31T00:00:00.000Z' });
  const action129 = 'A'.repeat(129);
  await assert.rejects(
    async () => serviceFail.archiveStageCompletion({
      sourceRecordKey: 'FY2026-TEST-EMP001',
      employeeCode: 'EMP001',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'operator_kintone' },
      logicalSnapshot: snapshot,
      identityMode: 'SHARED',
      actualOperatorEmployeeCode: 'EMP001',
      kintoneLoginUserCode: 'operator_kintone',
      actionName: action129,
      toStatus: '06 Employee Mid-Year'
    }),
    /ACTION_NAME_EXCEEDS_MAX_LENGTH/
  );
  assert.equal(adapterFail.addRecordCallCount, 0);
});

test('34. Mixed Identity Max Length: To_Status length 128 = PASS, length 129 = FAIL CLOSED', async () => {
  const toStatus128 = 'S'.repeat(128);
  const record = makeMockApp794Record();
  const snapshot = buildStageLogicalSnapshot(record, 'OBJECTIVE', '05 Objective Approved');
  const adapterPass = createMockKintoneAdapter();
  const servicePass = new RevisionArchiveService(adapterPass, { clock: () => '2026-03-31T00:00:00.000Z' });
  const resPass = await servicePass.archiveStageCompletion({
    sourceRecordKey: 'FY2026-TEST-EMP001',
    employeeCode: 'EMP001',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    actor: { userCode: 'operator_kintone' },
    logicalSnapshot: snapshot,
    identityMode: 'SHARED',
    actualOperatorEmployeeCode: 'EMP001',
    kintoneLoginUserCode: 'operator_kintone',
    actionName: 'Start Mid-Year',
    toStatus: toStatus128
  });
  assert.equal(resPass.verified, true);
  assert.equal(adapterPass.addRecordCallCount, 1);

  // Boundary 129 characters -> FAIL CLOSED
  const adapterFail = createMockKintoneAdapter();
  const serviceFail = new RevisionArchiveService(adapterFail, { clock: () => '2026-03-31T00:00:00.000Z' });
  const toStatus129 = 'S'.repeat(129);
  await assert.rejects(
    async () => serviceFail.archiveStageCompletion({
      sourceRecordKey: 'FY2026-TEST-EMP001',
      employeeCode: 'EMP001',
      fiscalYear: 'FY2026',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      actor: { userCode: 'operator_kintone' },
      logicalSnapshot: snapshot,
      identityMode: 'SHARED',
      actualOperatorEmployeeCode: 'EMP001',
      kintoneLoginUserCode: 'operator_kintone',
      actionName: 'Start Mid-Year',
      toStatus: toStatus129
    }),
    /TO_STATUS_EXCEEDS_MAX_LENGTH/
  );
  assert.equal(adapterFail.addRecordCallCount, 0);
});


