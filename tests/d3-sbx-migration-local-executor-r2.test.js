import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildApp794ProvenancePlan,
  applyApp794BackfillLocal
} from '../scripts/kintone/d3-sbx-migration-local-executor.js';

const backup = appId => ({
  appId,
  captured: true,
  verified: true,
  sha256: 'c'.repeat(64),
  artifactPath: `TEST_ONLY/app${appId}-backup.json`
});

function app794Record(id = '1', revision = '7') {
  return {
    $id: { value: String(id) },
    $revision: { value: String(revision) },
    Record_Key: { value: `FY2026-E${id}` }
  };
}

function values(snapshot = '[1,2]') {
  return {
    Frozen_Profile_Code: 'TEST_PROFILE',
    K_expected_Snapshot: 2,
    Effective_Routing_Key: 'TMT1',
    Effective_Route_Version_Key: 'TMT1#v1',
    Effective_Scorer_Slots_Snapshot: snapshot
  };
}

function policy(snapshot = '[1,2]') {
  return {
    explicitlyResolved: true,
    decisionRef: 'TEST_ONLY_DO_NOT_TREAT_AS_BUSINESS_POLICY',
    mode: 'EXPLICIT_BACKFILL',
    records: [{
      recordId: '1',
      expectedRevision: '7',
      values: values(snapshot)
    }]
  };
}

function build(snapshot) {
  return buildApp794ProvenancePlan({
    currentSchema: { fields: {} },
    existingRecords: [app794Record()],
    policy: policy(snapshot),
    backupEvidence: backup(794)
  });
}

test('R2 rejects numeric-string scorer slots instead of coercing them', () => {
  assert.throws(() => build('["1","2"]'), /APP794_PROVENANCE_SCORER_SLOT_TYPE_INVALID/);
});

test('R2 rejects boolean scorer slot instead of coercing true to 1', () => {
  assert.throws(() => build('[true,2]'), /APP794_PROVENANCE_SCORER_SLOT_TYPE_INVALID/);
});

test('R2 rejects null scorer slot instead of numeric coercion', () => {
  assert.throws(() => build('[null,2]'), /APP794_PROVENANCE_SCORER_SLOT_TYPE_INVALID/);
});

test('R2 rejects decimal scorer slot', () => {
  assert.throws(() => build('[1,1.5]'), /APP794_PROVENANCE_SCORER_SLOT_TYPE_INVALID/);
});

test('R2 keeps exact JSON integer numbers valid', () => {
  const plan = build('[1,2]');
  assert.equal(plan.backfillOperations.length, 1);
  assert.equal(plan.backfillOperations[0].values.Effective_Scorer_Slots_Snapshot, '[1,2]');
});

test('R2 apply guard rejects a tampered plan that replaces numeric slots with strings', () => {
  const plan = build('[1,2]');
  const tampered = structuredClone(plan);
  tampered.backfillOperations[0].values.Effective_Scorer_Slots_Snapshot = '["1","2"]';
  assert.throws(
    () => applyApp794BackfillLocal({ records: [app794Record()], plan: tampered }),
    /APP794_PROVENANCE_SCORER_SLOT_TYPE_INVALID/
  );
});
