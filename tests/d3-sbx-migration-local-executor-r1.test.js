import test from 'node:test';
import assert from 'node:assert/strict';
import manifest from '../project-docs/evidence/D3_SBX_MIGRATION_01_PRE1_MANIFEST.json' with { type: 'json' };

import {
  buildApp795SeedOperations,
  applyApp795SeedOperationsLocal,
  buildApp794ProvenancePlan,
  applyApp794BackfillLocal
} from '../scripts/kintone/d3-sbx-migration-local-executor.js';

const scorerApprovalTestOnly = Object.freeze({
  approved: true,
  explicitOwnerHrApproval: true,
  decisionRef: 'TEST_ONLY_DO_NOT_TREAT_AS_BUSINESS_APPROVAL',
  mapping: Object.freeze({ M1_G1: Object.freeze([1, 2]), M1_ONLY: Object.freeze([1]) })
});
const backup = appId => ({ appId, captured: true, verified: true, sha256: 'b'.repeat(64), artifactPath: `TEST_ONLY/app${appId}-backup.json` });
function rowObject(rawRow) { return Object.fromEntries(manifest.columns.map((column, index) => [column, rawRow[index]])); }
function userList(codes) { return { value: codes.map(code => ({ code })) }; }
function buildApp795Records() {
  return manifest.rows.map(rawRow => {
    const row = rowObject(rawRow);
    return {
      $id: { value: String(row.sourceRecordId) }, $revision: { value: String(row.expectedSourceRevision) },
      Routing_Key: { value: row.routingKey }, Requester_User: userList(row.requesterUsers),
      Manager_Level2_Approvers: userList(row.M2), Manager_Level1_Approvers: userList(row.M1),
      GM_Level1_Approvers: userList(row.G1), GM_Level2_Approvers: userList(row.G2),
      Effective_From: { value: row.effectiveFrom }, Effective_To: { value: row.effectiveTo }
    };
  });
}
function app794Record(id, revision = '1') { return { $id: { value: String(id) }, $revision: { value: String(revision) }, Record_Key: { value: `FY2026-E${id}` } }; }
function provenanceValues(overrides = {}) {
  return { Frozen_Profile_Code: 'TEST_PROFILE', K_expected_Snapshot: 2, Effective_Routing_Key: 'TMT1', Effective_Route_Version_Key: 'TMT1#v1', Effective_Scorer_Slots_Snapshot: '[1,2]', ...overrides };
}
function explicitPolicy(entries) { return { explicitlyResolved: true, decisionRef: 'TEST_ONLY_DO_NOT_TREAT_AS_BUSINESS_POLICY', mode: 'EXPLICIT_BACKFILL', records: entries }; }

test('R1 App795 rejects 21 source records even when only 20 record IDs are unique', () => {
  const operations = buildApp795SeedOperations({ manifest, scorerApproval: scorerApprovalTestOnly });
  const records = buildApp795Records(); records.push(structuredClone(records[0]));
  assert.throws(() => applyApp795SeedOperationsLocal({ records, operations }), /APP795_LOCAL_SEED_INPUT_INVALID/);
});

test('R1 App795 exact 20-record set still passes local seed contract', () => {
  const operations = buildApp795SeedOperations({ manifest, scorerApproval: scorerApprovalTestOnly });
  const records = applyApp795SeedOperationsLocal({ records: buildApp795Records(), operations });
  assert.equal(records.length, 20);
});

test('R1 App794 rejects duplicate policy IDs that omit another historical record', () => {
  const existingRecords = [app794Record(1, '7'), app794Record(2, '3')];
  const policy = explicitPolicy([
    { recordId: '1', expectedRevision: '7', values: provenanceValues() },
    { recordId: '1', expectedRevision: '7', values: provenanceValues() }
  ]);
  assert.throws(() => buildApp794ProvenancePlan({ currentSchema: { fields: {} }, existingRecords, policy, backupEvidence: backup(794) }), /APP794_PROVENANCE_BACKFILL_SET_MISMATCH/);
});

test('R1 App794 rejects duplicate scorer slots', () => {
  assert.throws(() => buildApp794ProvenancePlan({ currentSchema: { fields: {} }, existingRecords: [app794Record(1, '7')], policy: explicitPolicy([{ recordId: '1', expectedRevision: '7', values: provenanceValues({ Effective_Scorer_Slots_Snapshot: '[1,1]' }) }]), backupEvidence: backup(794) }), /APP794_PROVENANCE_SCORER_SNAPSHOT_INVALID/);
});

test('R1 App794 rejects zero scorer slot', () => {
  assert.throws(() => buildApp794ProvenancePlan({ currentSchema: { fields: {} }, existingRecords: [app794Record(1, '7')], policy: explicitPolicy([{ recordId: '1', expectedRevision: '7', values: provenanceValues({ Effective_Scorer_Slots_Snapshot: '[0,1]' }) }]), backupEvidence: backup(794) }), /APP794_PROVENANCE_SCORER_SLOT_TYPE_INVALID/);
});

test('R1 App794 rejects scorer slot beyond active route slot count', () => {
  assert.throws(() => buildApp794ProvenancePlan({ currentSchema: { fields: {} }, existingRecords: [app794Record(1, '7')], policy: explicitPolicy([{ recordId: '1', expectedRevision: '7', values: provenanceValues({ Effective_Scorer_Slots_Snapshot: '[1,3]' }) }]), backupEvidence: backup(794) }), /APP794_PROVENANCE_SCORER_SNAPSHOT_INVALID/);
});

test('R1 App794 binds route version key to accepted manifest route identity', () => {
  assert.throws(() => buildApp794ProvenancePlan({ currentSchema: { fields: {} }, existingRecords: [app794Record(1, '7')], policy: explicitPolicy([{ recordId: '1', expectedRevision: '7', values: provenanceValues({ Effective_Route_Version_Key: 'TMT1#v2' }) }]), backupEvidence: backup(794) }), /APP794_PROVENANCE_ROUTE_VERSION_MISMATCH/);
});

test('R1 App794 rejects routing key outside accepted PRE1 manifest', () => {
  assert.throws(() => buildApp794ProvenancePlan({ currentSchema: { fields: {} }, existingRecords: [app794Record(1, '7')], policy: explicitPolicy([{ recordId: '1', expectedRevision: '7', values: provenanceValues({ Effective_Routing_Key: 'UNKNOWN_ROUTE', Effective_Route_Version_Key: 'UNKNOWN_ROUTE#v1' }) }]), backupEvidence: backup(794) }), /APP794_PROVENANCE_ROUTE_KEY_NOT_IN_MANIFEST/);
});

test('R1 App794 valid manifest-bound K2 scorer snapshot passes', () => {
  const plan = buildApp794ProvenancePlan({ currentSchema: { fields: {} }, existingRecords: [app794Record(1, '7')], policy: explicitPolicy([{ recordId: '1', expectedRevision: '7', values: provenanceValues() }]), backupEvidence: backup(794) });
  assert.equal(plan.backfillOperations.length, 1); assert.equal(plan.backfillOperations[0].recordId, '1');
});

test('R1 App794 apply rejects tampered incomplete backfill plan', () => {
  const records = [app794Record(1, '7')];
  const plan = buildApp794ProvenancePlan({ currentSchema: { fields: {} }, existingRecords: records, policy: explicitPolicy([{ recordId: '1', expectedRevision: '7', values: provenanceValues() }]), backupEvidence: backup(794) });
  const tampered = structuredClone(plan); tampered.backfillOperations = [];
  assert.throws(() => applyApp794BackfillLocal({ records, plan: tampered }), /APP794_PROVENANCE_BACKFILL_SET_MISMATCH/);
});
