import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, rm } from 'node:fs/promises';

import {
  D3_BINDING_ALLOWED_READ_APP_IDS,
  D3_BINDING_ALLOWED_WRITE_APP_IDS,
  D3_BINDING_ENDPOINTS,
  D3_BINDING_FORBIDDEN_WRITE_APP_IDS,
  assertD3BindingMatchesRunnerContract,
  createD3FileAuthorizationLedger,
  createD3KintoneIoAdapter
} from '../scripts/kintone/d3-sbx-migration-live-binding.js';

function makeTransport() {
  const calls = [];
  return {
    calls,
    transport: {
      async request(spec) {
        calls.push(spec);
        if (spec.path === D3_BINDING_ENDPOINTS.previewFields) return { revision: '12' };
        return { ok: true };
      }
    }
  };
}

function addOp(fieldCode, spec = { type: 'SINGLE_LINE_TEXT', label: fieldCode, required: false }) {
  return { fieldCode, operation: 'ADD_FIELD_STAGED_OPTIONAL', spec };
}

function finalOp(fieldCode, target = { type: 'SINGLE_LINE_TEXT', label: fieldCode, required: true }) {
  return { fieldCode, operation: 'FINALIZE_FIELD_PROPERTIES', target };
}

function seedOperations() {
  return Array.from({ length: 20 }, (_, index) => ({
    operation: 'UPDATE_EXISTING_RECORD_LOCAL_CONTRACT',
    appId: 795,
    recordId: String(index + 1),
    expectedRevision: '1',
    values: {
      Version_Key: `R${index + 1}#v1`,
      Version_Number: 1,
      Version_Status: 'ACTIVE',
      Route_Pattern: 'PATTERN_2_M1_G1',
      Scorer_Priority_Slots: '[1,2]'
    }
  }));
}

test('binding scope exactly matches frozen runner contract', () => {
  assert.equal(assertD3BindingMatchesRunnerContract({
    allowedReadAppIds: [...D3_BINDING_ALLOWED_READ_APP_IDS],
    allowedWriteAppIds: [...D3_BINDING_ALLOWED_WRITE_APP_IDS],
    forbiddenWriteAppIds: [...D3_BINDING_FORBIDDEN_WRITE_APP_IDS]
  }), true);
  assert.throws(() => assertD3BindingMatchesRunnerContract({
    allowedReadAppIds: [794, 795, 798],
    allowedWriteAppIds: [794, 795, 798],
    forbiddenWriteAppIds: [796, 797, 798, 800]
  }), /WRITE_SCOPE_MISMATCH/);
});

test('transport contract rejects generic extra callables', () => {
  assert.throws(() => createD3KintoneIoAdapter({
    transport: { request() {}, deployAnything() {} },
    readAppSnapshot() {}
  }), /TRANSPORT_TOO_BROAD/);
});

test('read scope blocks non-guard apps before snapshot access', async () => {
  let reads = 0;
  const { transport } = makeTransport();
  const io = createD3KintoneIoAdapter({
    transport,
    async readAppSnapshot(appId) { reads += 1; return { appId }; }
  });
  await assert.rejects(() => io.readAppSnapshot(796), /READ_APP_FORBIDDEN/);
  assert.equal(reads, 0);
});

test('App795 optional-field stage uses only POST preview fields endpoint', async () => {
  const fake = makeTransport();
  const io = createD3KintoneIoAdapter({ transport: fake.transport, readAppSnapshot: async () => ({}) });
  await io.stageFormSchema({
    appId: 795,
    expectedLiveRevision: '11',
    phase: 'APP795_STAGE_OPTIONAL_FIELDS',
    operations: [addOp('Version_Key')]
  });
  assert.equal(fake.calls.length, 1);
  assert.equal(fake.calls[0].method, 'POST');
  assert.equal(fake.calls[0].path, '/k/v1/preview/app/form/fields.json');
  assert.deepEqual(Object.keys(fake.calls[0].body.properties), ['Version_Key']);
});

test('schema scope rejects fields outside the frozen App795 contract', async () => {
  const fake = makeTransport();
  const io = createD3KintoneIoAdapter({ transport: fake.transport, readAppSnapshot: async () => ({}) });
  await assert.rejects(() => io.stageFormSchema({
    appId: 795,
    expectedLiveRevision: '11',
    phase: 'APP795_STAGE_OPTIONAL_FIELDS',
    operations: [addOp('Unexpected_Field')]
  }), /SCHEMA_OPERATION_FORBIDDEN/);
  assert.equal(fake.calls.length, 0);
});

test('App795 finalization uses only PUT preview fields endpoint', async () => {
  const fake = makeTransport();
  const io = createD3KintoneIoAdapter({ transport: fake.transport, readAppSnapshot: async () => ({}) });
  await io.stageFormSchema({
    appId: 795,
    expectedLiveRevision: '12',
    phase: 'APP795_FINALIZE_FIELD_PROPERTIES',
    operations: [finalOp('Version_Key')]
  });
  assert.equal(fake.calls[0].method, 'PUT');
  assert.equal(fake.calls[0].path, '/k/v1/preview/app/form/fields.json');
});

test('schema activation requires a staged revision and can deploy only the exact app', async () => {
  const fake = makeTransport();
  const io = createD3KintoneIoAdapter({ transport: fake.transport, readAppSnapshot: async () => ({}) });
  await assert.rejects(() => io.activateFormSchema({
    appId: 795,
    phase: 'APP795_ACTIVATE_STAGED_SCHEMA'
  }), /PREVIEW_REVISION_REQUIRED/);
  await io.stageFormSchema({
    appId: 795,
    expectedLiveRevision: '11',
    phase: 'APP795_STAGE_OPTIONAL_FIELDS',
    operations: [addOp('Version_Key')]
  });
  await io.activateFormSchema({ appId: 795, phase: 'APP795_ACTIVATE_STAGED_SCHEMA' });
  assert.equal(fake.calls[1].method, 'POST');
  assert.equal(fake.calls[1].path, '/k/v1/preview/app/deploy.json');
  assert.deepEqual(fake.calls[1].body.apps, [{ app: 795, revision: '12' }]);
});

test('record update is exact-20 App795 PUT only', async () => {
  const fake = makeTransport();
  const io = createD3KintoneIoAdapter({ transport: fake.transport, readAppSnapshot: async () => ({}) });
  const result = await io.updateExistingRecords({
    appId: 795,
    operations: seedOperations(),
    atomic: true,
    phase: 'APP795_SEED_EXACT_20'
  });
  assert.equal(result.updated, 20);
  assert.equal(fake.calls[0].method, 'PUT');
  assert.equal(fake.calls[0].path, '/k/v1/records.json');
  assert.equal(fake.calls[0].body.records.length, 20);
  await assert.rejects(() => io.updateExistingRecords({
    appId: 795,
    operations: seedOperations().slice(0, 19),
    atomic: true,
    phase: 'APP795_SEED_EXACT_20'
  }), /RECORD_UPDATE_SCOPE_INVALID/);
});

test('App794 schema stage requires exactly the five provenance fields', async () => {
  const fake = makeTransport();
  const io = createD3KintoneIoAdapter({ transport: fake.transport, readAppSnapshot: async () => ({}) });
  const exactFields = [
    'Frozen_Profile_Code',
    'K_expected_Snapshot',
    'Effective_Routing_Key',
    'Effective_Route_Version_Key',
    'Effective_Scorer_Slots_Snapshot'
  ];
  await io.stageFormSchema({
    appId: 794,
    expectedLiveRevision: '70',
    phase: 'APP794_STAGE_PROVENANCE_FIELDS',
    operations: exactFields.map(fieldCode => addOp(fieldCode))
  });
  assert.equal(fake.calls[0].method, 'POST');
  assert.deepEqual(Object.keys(fake.calls[0].body.properties), exactFields);
  await assert.rejects(() => io.stageFormSchema({
    appId: 794,
    expectedLiveRevision: '70',
    phase: 'APP794_STAGE_PROVENANCE_FIELDS',
    operations: exactFields.slice(0, 4).map(fieldCode => addOp(fieldCode))
  }), /APP794_FIELD_SCOPE_MISMATCH/);
});

test('durable file ledger rejects authorization replay across instances', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mbo-d3-ledger-'));
  try {
    const first = createD3FileAuthorizationLedger({ directory: root });
    const second = createD3FileAuthorizationLedger({ directory: root });
    assert.equal(await first.consumeAuthorizationId('AUTH-R1-001'), true);
    assert.equal(await second.consumeAuthorizationId('AUTH-R1-001'), false);
    assert.equal(await second.consumeAuthorizationId('AUTH-R1-002'), true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
