import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildD3SnapshotManifest,
  serializeD3Snapshot,
  hashD3Snapshot,
  D3SnapshotSerializationError
} from '../src/services/d3-snapshot-serializer.js';

function logicalSnapshotA() {
  return {
    source: {
      Record_Key: 'FY2026-EMP100',
      Employee_Code: 'EMP100',
      Fiscal_Year: 'FY2026',
      Record_ID: 123
    },
    stage: {
      Evaluation_Stage: 'OBJECTIVE',
      Revision_Number: 1,
      Previous_Status: '05 Objective Approved'
    },
    profile: {
      Frozen_Profile_Code: 'PROF_STAFF_CHIEF',
      K_expected_Snapshot: 2
    },
    route: {
      Effective_Routing_Key: 'TME1',
      Effective_Route_Version_Key: 'TME1#v2',
      Route_Pattern: 'PATTERN_3A_M2_M1_G1',
      Routing_Topology: 'M1_M2_G1',
      Workflow_Appraisers: [
        { code: 'm2' },
        { code: 'm1' },
        { code: 'g1' }
      ]
    },
    scoring: {
      Scorers: [
        { code: 'm2', weight: 50 },
        { code: 'g1', weight: 50 }
      ]
    },
    hoshin: {
      Department_Hoshin_Key: 'H1'
    },
    config: {
      Configuration_Hash: 'cfg-hash'
    },
    business: {
      Objective_Count: 2,
      Objectives: [
        { title: 'A', weight: 50 },
        { title: 'B', weight: 50 }
      ],
      OptionalUndefined: undefined,
      ExplicitNull: null
    },
    computed: {
      PartA_Raw_Score: 42.5
    },
    transientKintoneMetadata: {
      Updated_datetime: 'SHOULD_NOT_BE_HASHED'
    }
  };
}

test('Snapshot manifest whitelists business sections and excludes transient top-level metadata', () => {
  const manifest = buildD3SnapshotManifest(logicalSnapshotA());

  assert.equal(manifest.snapshotSchemaVersion, 'D3_V1');
  assert.equal('transientKintoneMetadata' in manifest, false);
  assert.equal(manifest.source.Record_Key, 'FY2026-EMP100');
});

test('Snapshot manifest fails closed when a required reproduction section is missing', () => {
  const input = logicalSnapshotA();
  delete input.hoshin;

  assert.throws(
    () => buildD3SnapshotManifest(input),
    error =>
      error instanceof D3SnapshotSerializationError &&
      error.code === 'SNAPSHOT_SECTION_MISSING'
  );
});

test('Canonical JSON and SHA-256 are deterministic across object insertion order', () => {
  const a = logicalSnapshotA();

  const b = {
    computed: { PartA_Raw_Score: 42.5 },
    business: {
      ExplicitNull: null,
      OptionalUndefined: undefined,
      Objectives: [
        { weight: 50, title: 'A' },
        { weight: 50, title: 'B' }
      ],
      Objective_Count: 2
    },
    config: { Configuration_Hash: 'cfg-hash' },
    hoshin: { Department_Hoshin_Key: 'H1' },
    scoring: {
      Scorers: [
        { weight: 50, code: 'm2' },
        { weight: 50, code: 'g1' }
      ]
    },
    route: {
      Workflow_Appraisers: [
        { code: 'm2' },
        { code: 'm1' },
        { code: 'g1' }
      ],
      Routing_Topology: 'M1_M2_G1',
      Route_Pattern: 'PATTERN_3A_M2_M1_G1',
      Effective_Route_Version_Key: 'TME1#v2',
      Effective_Routing_Key: 'TME1'
    },
    profile: {
      K_expected_Snapshot: 2,
      Frozen_Profile_Code: 'PROF_STAFF_CHIEF'
    },
    stage: {
      Previous_Status: '05 Objective Approved',
      Revision_Number: 1,
      Evaluation_Stage: 'OBJECTIVE'
    },
    source: {
      Record_ID: 123,
      Fiscal_Year: 'FY2026',
      Employee_Code: 'EMP100',
      Record_Key: 'FY2026-EMP100'
    }
  };

  const hashedA = hashD3Snapshot(a);
  const hashedB = hashD3Snapshot(b);

  assert.equal(hashedA.canonicalJson, hashedB.canonicalJson);
  assert.equal(hashedA.sha256, hashedB.sha256);
});

test('Canonical serializer omits undefined object values and preserves explicit null', () => {
  const serialized = serializeD3Snapshot(logicalSnapshotA());
  const parsed = JSON.parse(serialized.canonicalJson);

  assert.equal('OptionalUndefined' in parsed.business, false);
  assert.equal(parsed.business.ExplicitNull, null);
});

test('Semantic array order is preserved and changing it changes the hash', () => {
  const a = logicalSnapshotA();
  const b = logicalSnapshotA();
  b.route.Workflow_Appraisers = [
    { code: 'm1' },
    { code: 'm2' },
    { code: 'g1' }
  ];

  const hashedA = hashD3Snapshot(a);
  const hashedB = hashD3Snapshot(b);

  assert.notEqual(hashedA.canonicalJson, hashedB.canonicalJson);
  assert.notEqual(hashedA.sha256, hashedB.sha256);
});

test('Canonical fixture has stable known JSON and SHA-256', () => {
  const fixture = {
    source: { Record_Key: 'FY2026-0001' },
    stage: { Evaluation_Stage: 'FINAL', Revision_Number: 2 },
    profile: { Frozen_Profile_Code: 'PROF_DGM', K_expected_Snapshot: 1 },
    route: {
      Effective_Routing_Key: 'POSITION_DGM',
      Effective_Route_Version_Key: 'POSITION_DGM#v1',
      Workflow_Appraisers: [{ code: 'president' }]
    },
    scoring: {
      Scorers: [{ code: 'president', weight: 100 }]
    },
    hoshin: {},
    config: {},
    business: {},
    computed: {}
  };

  const hashed = hashD3Snapshot(fixture);

  assert.equal(
    hashed.canonicalJson,
    '{"business":{},"computed":{},"config":{},"hoshin":{},"profile":{"Frozen_Profile_Code":"PROF_DGM","K_expected_Snapshot":1},"route":{"Effective_Route_Version_Key":"POSITION_DGM#v1","Effective_Routing_Key":"POSITION_DGM","Workflow_Appraisers":[{"code":"president"}]},"scoring":{"Scorers":[{"code":"president","weight":100}]},"snapshotSchemaVersion":"D3_V1","source":{"Record_Key":"FY2026-0001"},"stage":{"Evaluation_Stage":"FINAL","Revision_Number":2}}'
  );
  assert.equal(
    hashed.sha256,
    'c78d4552a697075f6e94963ffaca9baeb20af8db198cf2602219973372fb3b6a'
  );
});

test('Undefined array entries fail closed rather than shifting semantic order', () => {
  const input = logicalSnapshotA();
  input.business.Objectives = [
    { title: 'A', weight: 50 },
    undefined,
    { title: 'B', weight: 50 }
  ];

  assert.throws(
    () => serializeD3Snapshot(input),
    error =>
      error instanceof D3SnapshotSerializationError &&
      error.code === 'UNDEFINED_ARRAY_VALUE'
  );
});
