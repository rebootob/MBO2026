import test from 'node:test';
import assert from 'node:assert/strict';
import {
  routingFields,
  mboFields,
  revisionArchiveFields,
  versionStatusOptions,
  routePatternOptions
} from '../config/schema-spec.js';
import {
  inspectD3Readiness,
  APP794_FIVE_PROVENANCE_FIELDS,
  APP798_ELEVEN_ARCHIVE_PRIMITIVES
} from '../scripts/kintone/d3-inspect-readiness.js';

test('D3-IMP-02 Schema Contract 1: App795 Routing_Key is target unique=false', () => {
  const field = routingFields.Routing_Key;
  assert.ok(field, 'Routing_Key field must exist in routingFields');
  assert.equal(field.type, 'SINGLE_LINE_TEXT');
  assert.equal(field.required, true, 'Routing_Key must be required');
  assert.equal(field.unique, false, 'Routing_Key unique must be false for Model A versioned rows');
});

test('D3-IMP-02 Schema Contract 2: Version_Key is required + unique=true', () => {
  const field = routingFields.Version_Key;
  assert.ok(field, 'Version_Key field must exist in routingFields');
  assert.equal(field.type, 'SINGLE_LINE_TEXT');
  assert.equal(field.required, true, 'Version_Key must be required');
  assert.equal(field.unique, true, 'Version_Key must be unique=true');
});

test('D3-IMP-02 Schema Contract 3: Version_Number target rules', () => {
  const field = routingFields.Version_Number;
  assert.ok(field, 'Version_Number field must exist in routingFields');
  assert.equal(field.type, 'NUMBER');
  assert.equal(field.required, true, 'Version_Number must be required');
  assert.equal(field.unique, false);
  assert.equal(field.minValue, '1', 'Version_Number minValue must be 1');
});

test('D3-IMP-02 Schema Contract 4: Version_Status accepted lifecycle values', () => {
  const field = routingFields.Version_Status;
  assert.ok(field, 'Version_Status field must exist in routingFields');
  assert.equal(field.type, 'DROP_DOWN');
  assert.equal(field.required, true, 'Version_Status must be required');
  assert.equal(field.defaultValue, 'DRAFT');

  const expectedLifecycle = ['DRAFT', 'ACTIVE', 'CANCELLED', 'SUPERSEDED'];
  const optionKeys = Object.keys(field.options || {});
  assert.deepEqual(optionKeys.sort(), expectedLifecycle.sort());

  for (const status of expectedLifecycle) {
    assert.equal(field.options[status].label, status);
  }
});

test('D3-IMP-02 Schema Contract 5: Effective_From required', () => {
  const field = routingFields.Effective_From;
  assert.ok(field, 'Effective_From field must exist in routingFields');
  assert.equal(field.type, 'DATE');
  assert.equal(field.required, true, 'Effective_From must be required for Model A');
});

test('D3-IMP-02 Schema Contract 6: Effective_To optional', () => {
  const field = routingFields.Effective_To;
  assert.ok(field, 'Effective_To field must exist in routingFields');
  assert.equal(field.type, 'DATE');
  assert.equal(field.required, false, 'Effective_To must be optional');
});

test('D3-IMP-02 Schema Contract: Route_Pattern and Scorer_Priority_Slots target specifications', () => {
  const patternField = routingFields.Route_Pattern;
  assert.ok(patternField, 'Route_Pattern must exist');
  assert.equal(patternField.type, 'DROP_DOWN');
  assert.equal(patternField.required, true);
  const expectedPatterns = [
    'PATTERN_1_M1',
    'PATTERN_2_M1_G1',
    'PATTERN_3A_M2_M1_G1',
    'PATTERN_3B_M1_G1_G2',
    'PATTERN_4_M2_M1_G1_G2'
  ];
  assert.deepEqual(Object.keys(patternField.options).sort(), expectedPatterns.sort());

  const scorerField = routingFields.Scorer_Priority_Slots;
  assert.ok(scorerField, 'Scorer_Priority_Slots must exist');
  assert.equal(scorerField.type, 'SINGLE_LINE_TEXT');
  assert.equal(scorerField.required, true);
});

test('D3-IMP-02 Schema Contract 7: App794 contains exactly required five new provenance logical fields', () => {
  for (const fieldCode of APP794_FIVE_PROVENANCE_FIELDS) {
    assert.ok(mboFields[fieldCode], `App794 mboFields must contain provenance field "${fieldCode}"`);
  }

  // Exact 5 provenance fields
  assert.equal(APP794_FIVE_PROVENANCE_FIELDS.length, 5);

  // Field details
  assert.equal(mboFields.Frozen_Profile_Code.type, 'SINGLE_LINE_TEXT');
  assert.equal(mboFields.Frozen_Profile_Code.required, true);

  assert.equal(mboFields.K_expected_Snapshot.type, 'NUMBER');
  assert.equal(mboFields.K_expected_Snapshot.required, true);
  assert.equal(mboFields.K_expected_Snapshot.minValue, '1');
  assert.equal(mboFields.K_expected_Snapshot.maxValue, '2');

  assert.equal(mboFields.Effective_Routing_Key.type, 'SINGLE_LINE_TEXT');
  assert.equal(mboFields.Effective_Routing_Key.required, true);

  assert.equal(mboFields.Effective_Route_Version_Key.type, 'SINGLE_LINE_TEXT');
  assert.equal(mboFields.Effective_Route_Version_Key.required, true);

  assert.equal(mboFields.Effective_Scorer_Slots_Snapshot.type, 'SINGLE_LINE_TEXT');
  assert.equal(mboFields.Effective_Scorer_Slots_Snapshot.required, true);

  // No obsolete six-slot-per-stage matrices
  assert.equal(mboFields.Objective_Approver_1, undefined);
  assert.equal(mboFields.MidYear_Approver_1, undefined);
  assert.equal(mboFields.Final_Approver_1, undefined);
});

test('D3-IMP-02 Schema Contract 8: App798 receives zero new D3 physical fields and contains all archive primitives', () => {
  const fieldKeys = Object.keys(revisionArchiveFields);
  assert.equal(fieldKeys.length, 15, 'App798 revisionArchiveFields must have exactly 15 fields (0 new physical fields)');

  for (const primitive of APP798_ELEVEN_ARCHIVE_PRIMITIVES) {
    assert.ok(
      revisionArchiveFields[primitive],
      `App798 must contain required archive primitive "${primitive}"`
    );
  }

  // Verify archive primitives specifications
  assert.equal(revisionArchiveFields.Archive_Key.type, 'SINGLE_LINE_TEXT');
  assert.equal(revisionArchiveFields.Archive_Key.required, true);
  assert.equal(revisionArchiveFields.Archive_Key.unique, true);

  assert.equal(revisionArchiveFields.Source_Record_Key.type, 'SINGLE_LINE_TEXT');
  assert.equal(revisionArchiveFields.Source_Record_Key.required, true);

  assert.equal(revisionArchiveFields.Evaluation_Stage.type, 'DROP_DOWN');
  assert.equal(revisionArchiveFields.Revision_Number.type, 'NUMBER');
  assert.equal(revisionArchiveFields.Superseded_By_Revision.type, 'NUMBER');

  assert.equal(revisionArchiveFields.Event_Type.type, 'SINGLE_LINE_TEXT');
  assert.equal(revisionArchiveFields.Event_Type.required, true);

  assert.equal(revisionArchiveFields.Reason.type, 'MULTI_LINE_TEXT');
  assert.equal(revisionArchiveFields.Snapshot_JSON.type, 'MULTI_LINE_TEXT');
  assert.equal(revisionArchiveFields.Snapshot_Hash.type, 'SINGLE_LINE_TEXT');
  assert.equal(revisionArchiveFields.Archived_By.type, 'USER_SELECT');
  assert.equal(revisionArchiveFields.Archived_At.type, 'DATETIME');
});

test('D3-IMP-02 Schema Contract: inspectD3Readiness confirms all schemas meet D3 target', () => {
  const result = inspectD3Readiness();
  assert.equal(result.ready, true);
  assert.equal(result.app795.status, 'PASS');
  assert.equal(result.app794.status, 'PASS');
  assert.equal(result.app798.status, 'PASS');
  assert.equal(result.errors.length, 0);
});
