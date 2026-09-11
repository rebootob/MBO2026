import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertApp795SeedReadBack,
  buildApp795SeedOperations,
  isOptionalDropDownField,
  isReadBackValueEqual,
  applyApp795SeedOperationsLocal
} from '../scripts/kintone/d3-sbx-migration-local-executor.js';

import manifest from '../project-docs/evidence/D3_SBX_MIGRATION_01_PRE1_MANIFEST.json' with { type: 'json' };

const scorerApprovalTestOnly = Object.freeze({
  approved: true,
  explicitOwnerHrApproval: true,
  decisionRef: 'TEST_ONLY_DO_NOT_TREAT_AS_BUSINESS_APPROVAL',
  mapping: Object.freeze({
    M1_G1: Object.freeze([1, 2]),
    M1_ONLY: Object.freeze([1])
  })
});

function rowObject(rawRow) {
  return Object.fromEntries(manifest.columns.map((column, index) => [column, rawRow[index]]));
}

function userList(codes) {
  return { value: codes.map(code => ({ code })) };
}

function buildApp795Records() {
  return manifest.rows.map(rawRow => {
    const row = rowObject(rawRow);
    return {
      $id: { value: String(row.sourceRecordId) },
      $revision: { value: String(row.expectedSourceRevision) },
      Routing_Key: { value: row.routingKey },
      Section_Code: { value: row.sectionCode },
      Section_Name: { value: row.sectionName },
      Team: { value: row.team },
      Requester_User: userList(row.requesterUsers),
      Manager_Level2_Approvers: userList(row.M2),
      Manager_Level1_Approvers: userList(row.M1),
      GM_Level1_Approvers: userList(row.G1),
      GM_Level2_Approvers: userList(row.G2),
      Manager_Level2_Approval_Rule: { value: row.M2Rule || 'ANY' },
      Manager_Level1_Approval_Rule: { value: row.M1Rule },
      GM_Level1_Approval_Rule: { value: row.G1Rule || 'ANY' },
      GM_Level2_Approval_Rule: { value: row.G2Rule || 'ANY' },
      Effective_From: { value: row.effectiveFrom },
      Effective_To: { value: row.effectiveTo },
      Remark: { value: row.remarkPreserve }
    };
  });
}

test('isOptionalDropDownField identifies optional approval rules and rejects required fields', () => {
  assert.equal(isOptionalDropDownField('Manager_Level2_Approval_Rule'), true);
  assert.equal(isOptionalDropDownField('Manager_Level1_Approval_Rule'), true);
  assert.equal(isOptionalDropDownField('GM_Level1_Approval_Rule'), true);
  assert.equal(isOptionalDropDownField('GM_Level2_Approval_Rule'), true);

  // Required dropdowns must NOT be considered optional
  assert.equal(isOptionalDropDownField('Version_Status'), false);
  assert.equal(isOptionalDropDownField('Route_Pattern'), false);

  // Non-dropdown fields must NOT be considered optional dropdowns
  assert.equal(isOptionalDropDownField('Version_Key'), false);
  assert.equal(isOptionalDropDownField('Version_Number'), false);
  assert.equal(isOptionalDropDownField('Scorer_Priority_Slots'), false);
  assert.equal(isOptionalDropDownField('Routing_Key'), false);
});

test('comparator unit: OPTIONAL DROP_DOWN allows expected "" / actual null', () => {
  assert.equal(isReadBackValueEqual('Manager_Level2_Approval_Rule', null, ''), true);
  assert.equal(isReadBackValueEqual('Manager_Level1_Approval_Rule', null, ''), true);
});

test('comparator unit: OPTIONAL DROP_DOWN allows expected "" / actual ""', () => {
  assert.equal(isReadBackValueEqual('Manager_Level2_Approval_Rule', '', ''), true);
  assert.equal(isReadBackValueEqual('Manager_Level2_Approval_Rule', 'ALL', 'ALL'), true);
});

test('comparator unit: OPTIONAL DROP_DOWN fails expected "ALL" / actual null', () => {
  assert.equal(isReadBackValueEqual('Manager_Level2_Approval_Rule', null, 'ALL'), false);
});

test('comparator unit: OPTIONAL DROP_DOWN fails expected "" / actual "ALL"', () => {
  assert.equal(isReadBackValueEqual('Manager_Level2_Approval_Rule', 'ALL', ''), false);
});

test('comparator unit: required dropdown does NOT allow blank normalization', () => {
  assert.equal(isReadBackValueEqual('Route_Pattern', null, 'PATTERN_2_M1_G1'), false);
  assert.equal(isReadBackValueEqual('Route_Pattern', null, ''), false);
  assert.equal(isReadBackValueEqual('Version_Status', null, 'DRAFT'), false);
  assert.equal(isReadBackValueEqual('Version_Status', null, ''), false);
});

test('comparator unit: non-dropdown business fields fail on value mismatch', () => {
  assert.equal(isReadBackValueEqual('Version_Key', 'VK_WRONG', 'VK_EXPECTED'), false);
  assert.equal(isReadBackValueEqual('Scorer_Priority_Slots', '[1]', '[1,2]'), false);
  assert.equal(isReadBackValueEqual('Version_Number', '2', '1'), false);
});

test('App795 seed readback passes with realistic live Kintone null blank dropdown values', () => {
  const operations = buildApp795SeedOperations({
    manifest,
    scorerApproval: scorerApprovalTestOnly
  });
  const records = applyApp795SeedOperationsLocal({
    records: buildApp795Records(),
    operations
  });

  // Emulate Kintone canonical readback where empty dropdown fields return { value: null }
  for (const record of records) {
    if (record.Manager_Level2_Approval_Rule?.value === '') {
      record.Manager_Level2_Approval_Rule = { type: 'DROP_DOWN', value: null };
    }
  }

  assert.equal(assertApp795SeedReadBack({
    manifest,
    records,
    scorerApproval: scorerApprovalTestOnly
  }), true);
});

test('App795 seed readback fails closed on wrong Route_Pattern', () => {
  const operations = buildApp795SeedOperations({
    manifest,
    scorerApproval: scorerApprovalTestOnly
  });
  const records = applyApp795SeedOperationsLocal({
    records: buildApp795Records(),
    operations
  });

  records[0].Route_Pattern = { type: 'DROP_DOWN', value: 'PATTERN_1_M1_ONLY' };
  assert.throws(
    () => assertApp795SeedReadBack({ manifest, records, scorerApproval: scorerApprovalTestOnly }),
    /APP795_READBACK_VALUE_MISMATCH.*Route_Pattern/
  );
});

test('App795 seed readback fails closed on wrong Version_Key', () => {
  const operations = buildApp795SeedOperations({
    manifest,
    scorerApproval: scorerApprovalTestOnly
  });
  const records = applyApp795SeedOperationsLocal({
    records: buildApp795Records(),
    operations
  });

  records[0].Version_Key = { type: 'SINGLE_LINE_TEXT', value: 'TAMPERED_KEY' };
  assert.throws(
    () => assertApp795SeedReadBack({ manifest, records, scorerApproval: scorerApprovalTestOnly }),
    /APP795_READBACK_VALUE_MISMATCH.*Version_Key/
  );
});

test('App795 seed readback fails closed on wrong scorer slots', () => {
  const operations = buildApp795SeedOperations({
    manifest,
    scorerApproval: scorerApprovalTestOnly
  });
  const records = applyApp795SeedOperationsLocal({
    records: buildApp795Records(),
    operations
  });

  records[0].Scorer_Priority_Slots = { type: 'SINGLE_LINE_TEXT', value: '[1]' };
  assert.throws(
    () => assertApp795SeedReadBack({ manifest, records, scorerApproval: scorerApprovalTestOnly }),
    /APP795_READBACK_VALUE_MISMATCH.*Scorer_Priority_Slots/
  );
});

test('App795 seed readback fails closed on wrong routing identity', () => {
  const operations = buildApp795SeedOperations({
    manifest,
    scorerApproval: scorerApprovalTestOnly
  });
  const records = applyApp795SeedOperationsLocal({
    records: buildApp795Records(),
    operations
  });

  records[0].Routing_Key = { type: 'SINGLE_LINE_TEXT', value: 'WRONG_ROUTING_KEY' };
  assert.throws(
    () => assertApp795SeedReadBack({ manifest, records, scorerApproval: scorerApprovalTestOnly }),
    /APP795_ROUTING_KEY_DRIFT/
  );
});

test('App795 seed readback fails closed on missing field in record', () => {
  const operations = buildApp795SeedOperations({
    manifest,
    scorerApproval: scorerApprovalTestOnly
  });
  const records = applyApp795SeedOperationsLocal({
    records: buildApp795Records(),
    operations
  });

  delete records[0].Manager_Level2_Approval_Rule;
  assert.throws(
    () => assertApp795SeedReadBack({ manifest, records, scorerApproval: scorerApprovalTestOnly }),
    /APP795_READBACK_VALUE_MISMATCH.*Manager_Level2_Approval_Rule/
  );
});
