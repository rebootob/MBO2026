import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStageLogicalSnapshot } from '../src/services/d3-stage-logical-snapshot.js';

function createValidRecord() {
  return {
    Record_Key: { value: 'MBO-2026-EMP001' },
    Employee_Code: { value: 'EMP001' },
    Fiscal_Year: { value: '2026' },
    $id: { value: '79401' },
    Revision_Number: { value: '1' },
    Frozen_Profile_Code: { value: 'PROF-TECH-01' },
    K_expected_Snapshot: { value: '1' },
    Route_Pattern: { value: 'PATTERN_1_M1' },
    Routing_Topology: { value: 'M1_ONLY' },
    Effective_Routing_Key: { value: 'ROUTING-001' },
    Effective_Route_Version_Key: { value: 'VER-001' },
    Department_Hoshin_Key: { value: 'HOSHIN-IT-2026' },
    Configuration_Hash: { value: 'HASH-CONFIG-001' },
    PartA_Raw_Score: { value: '88.5' },
    Objective_Count: { value: '2' },
    Objective_1: { value: 'Objective 1 Title' },
    Weight_1: { value: '50' },
    Score_1: { value: '90' },
    Action_Plan_1: { value: 'Plan 1 details' },
    Difficulty_1: { value: '2' },
    Objective_2: { value: 'Objective 2 Title' },
    Weight_2: { value: '50' },
    Score_2: { value: '87' },
    Action_Plan_2: { value: 'Plan 2 details' },
    Difficulty_2: { value: '3' },
    Manager_Level1_Approvers: { value: [{ code: 'MGR001', name: 'Manager 1' }] },
    Manager_Level1_Approval_Rule: { value: 'ALL' },
    Effective_Scorer_Slots_Snapshot: { value: '[1]' }
  };
}

test('buildStageLogicalSnapshot builds canonical deterministic snapshot', () => {
  const record = createValidRecord();
  const snapshot = buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');

  assert.equal(snapshot.source.Record_Key, 'MBO-2026-EMP001');
  assert.equal(snapshot.source.Employee_Code, 'EMP001');
  assert.equal(snapshot.stage.Evaluation_Stage, 'MID_YEAR');
  assert.equal(snapshot.stage.Revision_Number, 1);
  assert.equal(snapshot.stage.Previous_Status, '05 Objective Approved');
  assert.equal(snapshot.profile.Frozen_Profile_Code, 'PROF-TECH-01');
  assert.equal(snapshot.profile.K_expected_Snapshot, 1);
  assert.equal(snapshot.business.Objective_Count, 2);
  assert.equal(snapshot.business.Objectives.length, 2);
  assert.equal(snapshot.computed.PartA_Raw_Score, 88.5);
});

test('buildStageLogicalSnapshot fails-closed on missing provenance', () => {
  const record = createValidRecord();
  delete record.Record_Key;
  assert.throws(() => {
    buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  }, /PROVENANCE_MISSING: Record_Key/);
});

test('buildStageLogicalSnapshot fails-closed on invalid revision', () => {
  const record = createValidRecord();
  record.Revision_Number = { value: 'invalid-rev' };
  assert.throws(() => {
    buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  }, /PROVENANCE_INVALID: Revision_Number/);
});

test('buildStageLogicalSnapshot fails-closed on duplicate appraiser across active slots', () => {
  const record = createValidRecord();
  record.Route_Pattern = { value: 'PATTERN_2_M1_G1' };
  record.Routing_Topology = { value: 'M1_G1' };
  record.K_expected_Snapshot = { value: '2' };
  record.Manager_Level1_Approvers = { value: [{ code: 'USER_DUP' }] };
  record.Manager_Level1_Approval_Rule = { value: 'ALL' };
  record.GM_Level1_Approvers = { value: [{ code: 'USER_DUP' }] };
  record.GM_Level1_Approval_Rule = { value: 'ALL' };
  record.Effective_Scorer_Slots_Snapshot = { value: '[1, 2]' };

  assert.throws(() => {
    buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  }, /PROVENANCE_DUPLICATE/);
});
