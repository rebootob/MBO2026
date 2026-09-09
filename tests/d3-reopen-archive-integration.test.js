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
// 1. CONTROLLED REOPEN ARCHIVE INTEGRATION
// ----------------------------------------------------

test('Controlled Reopen: archives complete old revision snapshot before mutation', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const oldSnapshot = makeValidLogicalSnapshot({
    stage: {
      Evaluation_Stage: 'OBJECTIVE',
      Revision_Number: 1,
      Previous_Status: '05 Objective Approved'
    }
  });

  const res = await service.archiveEvaluationRevisionCreated({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    oldRevisionNumber: 1,
    newRevisionNumber: 2,
    sourceRecordId: 101,
    previousStatus: '05 Objective Approved',
    actor: { userCode: 'hr_superadmin' },
    reason: 'Employee department transferred from TME1 to TMG2',
    logicalSnapshot: oldSnapshot
  });

  assert.equal(res.verified, true);
  assert.equal(res.archiveKey, 'FY2026-EMP100|OBJECTIVE|R1|EVALUATION_REVISION_CREATED|TO_R2');
  assert.equal(res.revisionNumber, 1);
  assert.equal(res.supersededByRevision, 2);
  assert.equal(res.eventType, 'EVALUATION_REVISION_CREATED');

  // Verify stored record in repository
  const stored = [...adapter.store.values()][0];
  assert.equal(stored.Archive_Key.value, 'FY2026-EMP100|OBJECTIVE|R1|EVALUATION_REVISION_CREATED|TO_R2');
  assert.equal(stored.Revision_Number.value, '1');
  assert.equal(stored.Superseded_By_Revision.value, '2');
  assert.equal(stored.Event_Type.value, 'EVALUATION_REVISION_CREATED');
  assert.equal(stored.Reason.value, 'Employee department transferred from TME1 to TMG2');

  // Verify snapshot stored is indeed the OLD revision
  const storedSnapshot = JSON.parse(stored.Snapshot_JSON.value);
  assert.equal(storedSnapshot.stage.Revision_Number, 1);
  assert.equal(storedSnapshot.stage.Evaluation_Stage, 'OBJECTIVE');
});

test('Controlled Reopen Gate: mutation blocked if archive evidence is missing, fake, or unverified', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const realEvidence = await service.archiveEvaluationRevisionCreated({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    oldRevisionNumber: 1,
    newRevisionNumber: 2,
    sourceRecordId: 101,
    previousStatus: '05 Objective Approved',
    actor: { userCode: 'hr_superadmin' },
    reason: 'Department transfer',
    logicalSnapshot: makeValidLogicalSnapshot()
  });

  const requiredContext = {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    eventType: 'EVALUATION_REVISION_CREATED',
    supersededByRevision: 2,
    archiveKey: 'FY2026-EMP100|OBJECTIVE|R1|EVALUATION_REVISION_CREATED|TO_R2',
    snapshotHash: realEvidence.snapshotHash
  };

  // Missing evidence
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(null, requiredContext),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );

  // Incomplete broad context only fails closed
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(realEvidence, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      eventType: 'EVALUATION_REVISION_CREATED'
    }),
    /ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED/
  );

  // Fake plain object evidence
  const fakeEvidence = {
    verified: true,
    serviceVersion: 'D3_V1',
    archiveKey: 'FY2026-EMP100|OBJECTIVE|R1|EVALUATION_REVISION_CREATED|TO_R2',
    snapshotHash: realEvidence.snapshotHash,
    eventType: 'EVALUATION_REVISION_CREATED',
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    supersededByRevision: 2
  };
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(fakeEvidence, requiredContext),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );

  // Spread clone of real evidence fails
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate({ ...realEvidence }, requiredContext),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );

  // Real service-issued evidence passes
  assert.equal(RevisionArchiveService.assertArchiveBeforeChangeGate(realEvidence, requiredContext), true);

  // Evidence for wrong stage fails closed
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(realEvidence, {
      ...requiredContext,
      evaluationStage: 'FINAL'
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
});

// ----------------------------------------------------
// 2. ROUTE REASSIGNMENT PRE-CHANGE INTEGRATION
// ----------------------------------------------------

test('Route Reassignment: archives pre-change current route and preserves stable event ID', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const prechangeSnapshot = makeValidLogicalSnapshot({
    stage: {
      Evaluation_Stage: 'OBJECTIVE',
      Revision_Number: 1
    },
    route: {
      Workflow_Appraisers: [{ code: 'old_mgr' }, { code: 'gm_1' }]
    },
    scoring: {
      Scorers: [
        { code: 'old_mgr', weight: 50 },
        { code: 'gm_1', weight: 50 }
      ]
    }
  });

  const stableId = 'reassign-20260401-uuid-999';

  const res = await service.archiveRouteReassignmentPrechange({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: stableId,
    sourceRecordId: 101,
    actor: { userCode: 'hr_manager' },
    reason: 'Line manager changed from old_mgr to new_mgr per HR order 2026-08',
    logicalSnapshot: prechangeSnapshot
  });

  assert.equal(res.verified, true);
  assert.equal(res.archiveKey, `FY2026-EMP100|OBJECTIVE|R1|ROUTE_REASSIGNMENT_PRECHANGE|${stableId}`);
  assert.equal(res.eventType, 'ROUTE_REASSIGNMENT_PRECHANGE');
  assert.equal(res.supersededByRevision, null);

  const stored = [...adapter.store.values()][0];
  assert.equal(stored.Archive_Key.value, `FY2026-EMP100|OBJECTIVE|R1|ROUTE_REASSIGNMENT_PRECHANGE|${stableId}`);
  assert.equal(stored.Reason.value, 'Line manager changed from old_mgr to new_mgr per HR order 2026-08');

  // Verify retry using the same stable ID returns idempotent success
  const retryRes = await service.archiveRouteReassignmentPrechange({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: stableId,
    sourceRecordId: 101,
    actor: { userCode: 'hr_manager' },
    reason: 'Line manager changed from old_mgr to new_mgr per HR order 2026-08',
    logicalSnapshot: prechangeSnapshot
  });

  assert.equal(retryRes.verified, true);
  assert.equal(retryRes.idempotentReplay, true);
  assert.equal(adapter.store.size, 1);
});

test('Route Reassignment Gate: route change blocked before verified service-issued archive evidence', async () => {
  const adapter = createInMemoryKintoneAdapter();
  const service = new RevisionArchiveService(adapter, { clock: TEST_DEFAULT_CLOCK });

  const prechangeSnapshot = makeValidLogicalSnapshot({
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

  const realEvidence = await service.archiveRouteReassignmentPrechange({
    sourceRecordKey: 'FY2026-EMP100',
    employeeCode: 'EMP100',
    fiscalYear: 'FY2026',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    stableEventId: 'evt-1',
    sourceRecordId: 101,
    actor: { userCode: 'hr_manager' },
    reason: 'Manager reassignment approved',
    logicalSnapshot: prechangeSnapshot
  });

  const gateContext = {
    sourceRecordKey: 'FY2026-EMP100',
    evaluationStage: 'OBJECTIVE',
    revisionNumber: 1,
    eventType: 'ROUTE_REASSIGNMENT_PRECHANGE',
    stableEventId: 'evt-1',
    archiveKey: 'FY2026-EMP100|OBJECTIVE|R1|ROUTE_REASSIGNMENT_PRECHANGE|evt-1',
    snapshotHash: realEvidence.snapshotHash
  };

  // Incomplete broad context fails closed
  assert.throws(
    () => RevisionArchiveService.assertArchiveBeforeChangeGate(realEvidence, {
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1,
      eventType: 'ROUTE_REASSIGNMENT_PRECHANGE'
    }),
    /ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED/
  );

  // Simulating in-flight route modification attempt without archive evidence
  let routeModified = false;
  function attemptRouteChange(archiveEvidence) {
    RevisionArchiveService.assertArchiveBeforeChangeGate(archiveEvidence, gateContext);
    routeModified = true;
  }

  // Attempt without evidence
  assert.throws(
    () => attemptRouteChange(null),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
  assert.equal(routeModified, false);

  // Attempt with fake plain evidence
  assert.throws(
    () => attemptRouteChange({
      verified: true,
      serviceVersion: 'D3_V1',
      archiveKey: 'FY2026-EMP100|OBJECTIVE|R1|ROUTE_REASSIGNMENT_PRECHANGE|evt-1',
      snapshotHash: realEvidence.snapshotHash,
      eventType: 'ROUTE_REASSIGNMENT_PRECHANGE',
      sourceRecordKey: 'FY2026-EMP100',
      evaluationStage: 'OBJECTIVE',
      revisionNumber: 1
    }),
    /ARCHIVE_GATE_EVIDENCE_INVALID/
  );
  assert.equal(routeModified, false);

  // Attempt with verified service-issued evidence
  attemptRouteChange(realEvidence);
  assert.equal(routeModified, true);
});
