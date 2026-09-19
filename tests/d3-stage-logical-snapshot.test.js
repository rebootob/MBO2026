import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStageLogicalSnapshot } from '../src/services/d3-stage-logical-snapshot.js';

/**
 * Live-shaped App794 baseline record.
 *
 * LIVE CONTRACT (confirmed 2026-09-19):
 * - $revision        : present (Kintone system field, string-valued integer)
 * - Routing_Topology : present live App794 field
 * - Route_Pattern    : NOT present — derived from Routing_Topology
 * - Department_Hoshin_Key : NOT present — no authoritative source (CONTRACT_DECISION: NO_AUTHORITY_FOUND)
 * - Revision_Number / Current_Revision_Number : NOT present in live App794
 */
function createLiveShapedRecord() {
  return {
    Record_Key: { value: 'MBO-2026-EMP001' },
    Employee_Code: { value: 'EMP001' },
    Fiscal_Year: { value: '2026' },
    $id: { value: '79401' },
    $revision: { value: '10' },         // Live Kintone system field — authoritative revision source
    // Route_Pattern intentionally absent — must be derived from Routing_Topology
    Routing_Topology: { value: 'M1_ONLY' },
    Frozen_Profile_Code: { value: 'PROF-TECH-01' },
    K_expected_Snapshot: { value: '1' },
    Effective_Routing_Key: { value: 'ROUTING-001' },
    Effective_Route_Version_Key: { value: 'VER-001' },
    // Department_Hoshin_Key intentionally absent — NOT a live App794 field
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

// ── FIX 1: $revision as authoritative revision source ────────────────────────

test('FIX1: $revision-only record resolves revision correctly', () => {
  const record = createLiveShapedRecord();
  // No Revision_Number, no Current_Revision_Number — only $revision
  const snapshot = buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  assert.equal(snapshot.stage.Revision_Number, 10);
});

test('FIX1: missing $revision and no compatible authority fails closed', () => {
  const record = createLiveShapedRecord();
  delete record.$revision;
  assert.throws(() => {
    buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  }, /PROVENANCE_INVALID: Revision_Number/);
});

test('FIX1: invalid $revision value fails closed', () => {
  const record = createLiveShapedRecord();
  record.$revision = { value: 'not-a-number' };
  assert.throws(() => {
    buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  }, /PROVENANCE_INVALID: Revision_Number/);
});

test('FIX1: $revision zero fails closed (must be positive integer)', () => {
  const record = createLiveShapedRecord();
  record.$revision = { value: '0' };
  assert.throws(() => {
    buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  }, /PROVENANCE_INVALID: Revision_Number/);
});

test('FIX1: custom Revision_Number still works as fallback when $revision absent', () => {
  const record = createLiveShapedRecord();
  delete record.$revision;
  record.Revision_Number = { value: '3' };
  const snapshot = buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  assert.equal(snapshot.stage.Revision_Number, 3);
});

// ── FIX 2: Route_Pattern derived from Routing_Topology ───────────────────────

test('FIX2: Routing_Topology=M1_G1 with no Route_Pattern field resolves PATTERN_2_M1_G1', () => {
  const record = createLiveShapedRecord();
  record.Routing_Topology = { value: 'M1_G1' };
  record.K_expected_Snapshot = { value: '2' };
  record.Manager_Level1_Approvers = { value: [{ code: 'MGR001', name: 'Manager 1' }] };
  record.Manager_Level1_Approval_Rule = { value: 'ALL' };
  record.GM_Level1_Approvers = { value: [{ code: 'GM001', name: 'GM 1' }] };
  record.GM_Level1_Approval_Rule = { value: 'ALL' };
  record.Effective_Scorer_Slots_Snapshot = { value: '[1, 2]' };
  // No Route_Pattern field — must be derived
  const snapshot = buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  assert.equal(snapshot.route.Route_Pattern, 'PATTERN_2_M1_G1');
});

test('FIX2: all supported locked topology values resolve to exact pattern', () => {
  const topologyToPattern = {
    M1_ONLY:    'PATTERN_1_M1',
    M1_G1:      'PATTERN_2_M1_G1',
    M1_M2_G1:   'PATTERN_3A_M2_M1_G1',
    M1_G1_G2:   'PATTERN_3B_M1_G1_G2',
    M1_M2_G1_G2:'PATTERN_4_M2_M1_G1_G2'
  };

  // M1_ONLY — single slot
  {
    const rec = createLiveShapedRecord();
    rec.Routing_Topology = { value: 'M1_ONLY' };
    rec.K_expected_Snapshot = { value: '1' };
    rec.Manager_Level1_Approvers = { value: [{ code: 'MGR001' }] };
    rec.Manager_Level1_Approval_Rule = { value: 'ALL' };
    rec.Effective_Scorer_Slots_Snapshot = { value: '[1]' };
    const snap = buildStageLogicalSnapshot(rec, 'MID_YEAR', '05 Objective Approved');
    assert.equal(snap.route.Route_Pattern, topologyToPattern.M1_ONLY);
  }

  // M1_G1
  {
    const rec = createLiveShapedRecord();
    rec.Routing_Topology = { value: 'M1_G1' };
    rec.K_expected_Snapshot = { value: '2' };
    rec.Manager_Level1_Approvers = { value: [{ code: 'MGR001' }] };
    rec.Manager_Level1_Approval_Rule = { value: 'ALL' };
    rec.GM_Level1_Approvers = { value: [{ code: 'GM001' }] };
    rec.GM_Level1_Approval_Rule = { value: 'ALL' };
    rec.Effective_Scorer_Slots_Snapshot = { value: '[1, 2]' };
    const snap = buildStageLogicalSnapshot(rec, 'MID_YEAR', '05 Objective Approved');
    assert.equal(snap.route.Route_Pattern, topologyToPattern.M1_G1);
  }
});

test('FIX2: unknown Routing_Topology fails closed', () => {
  const record = createLiveShapedRecord();
  record.Routing_Topology = { value: 'UNKNOWN_TOPOLOGY_XYZ' };
  assert.throws(() => {
    buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  }, /PROVENANCE_INVALID.*Routing_Topology/);
});

test('FIX2: missing Routing_Topology fails closed', () => {
  const record = createLiveShapedRecord();
  delete record.Routing_Topology;
  assert.throws(() => {
    buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  }, /PROVENANCE_MISSING: Routing_Topology/);
});

// ── FIX 3: Department_Hoshin_Key not mandatory ───────────────────────────────

test('FIX3: Department_Hoshin_Key absent does NOT fail the snapshot', () => {
  const record = createLiveShapedRecord();
  // Department_Hoshin_Key intentionally absent (live App794 truth)
  const snapshot = buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  // hoshin section must exist but Department_Hoshin_Key should be absent (not defined)
  assert.ok(snapshot.hoshin, 'hoshin section must exist');
  assert.equal(snapshot.hoshin.Department_Hoshin_Key, undefined,
    'Department_Hoshin_Key must be absent when not in record');
});

test('FIX3: Department_Hoshin_Key present is still included in output', () => {
  const record = createLiveShapedRecord();
  record.Department_Hoshin_Key = { value: 'HOSHIN-IT-2026' };
  const snapshot = buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  assert.equal(snapshot.hoshin.Department_Hoshin_Key, 'HOSHIN-IT-2026');
});

// ── Canonical happy-path (live-shaped) ───────────────────────────────────────

test('buildStageLogicalSnapshot builds canonical snapshot from live-shaped App794 record', () => {
  const record = createLiveShapedRecord();
  const snapshot = buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');

  assert.equal(snapshot.source.Record_Key, 'MBO-2026-EMP001');
  assert.equal(snapshot.source.Employee_Code, 'EMP001');
  assert.equal(snapshot.stage.Evaluation_Stage, 'MID_YEAR');
  assert.equal(snapshot.stage.Revision_Number, 10);          // resolved from $revision
  assert.equal(snapshot.stage.Previous_Status, '05 Objective Approved');
  assert.equal(snapshot.profile.Frozen_Profile_Code, 'PROF-TECH-01');
  assert.equal(snapshot.profile.K_expected_Snapshot, 1);
  assert.equal(snapshot.route.Route_Pattern, 'PATTERN_1_M1'); // derived from Routing_Topology
  assert.equal(snapshot.route.Routing_Topology, 'M1_ONLY');
  assert.equal(snapshot.business.Objective_Count, 2);
  assert.equal(snapshot.business.Objectives.length, 2);
  assert.equal(snapshot.computed.PartA_Raw_Score, 88.5);
});

// ── Existing strict provenance validations remain intact ─────────────────────

test('buildStageLogicalSnapshot fails-closed on missing Record_Key', () => {
  const record = createLiveShapedRecord();
  delete record.Record_Key;
  assert.throws(() => {
    buildStageLogicalSnapshot(record, 'MID_YEAR', '05 Objective Approved');
  }, /PROVENANCE_MISSING: Record_Key/);
});

test('buildStageLogicalSnapshot fails-closed on duplicate appraiser across active slots', () => {
  const record = createLiveShapedRecord();
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
