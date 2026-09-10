import test from 'node:test';
import assert from 'node:assert/strict';

import {
  D3_BINDING_ENDPOINTS,
  createD3KintoneIoAdapter
} from '../scripts/kintone/d3-sbx-migration-live-binding.js';

function addOp(fieldCode) {
  return {
    fieldCode,
    operation: 'ADD_FIELD_STAGED_OPTIONAL',
    spec: { type: 'SINGLE_LINE_TEXT', label: fieldCode, required: false }
  };
}

async function stagedAdapter({ statuses, postThrows = false, getThrows = false, maxChecks = 5 }) {
  const calls = [];
  let statusIndex = 0;
  const transport = {
    async request(spec) {
      calls.push(spec);
      if (spec.path === D3_BINDING_ENDPOINTS.previewFields) return { revision: '12' };
      if (spec.method === 'POST' && spec.path === D3_BINDING_ENDPOINTS.previewDeploy) {
        if (postThrows) throw new Error('transport uncertain');
        return { ok: true };
      }
      if (spec.method === 'GET' && spec.path.startsWith(`${D3_BINDING_ENDPOINTS.previewDeploy}?`)) {
        if (getThrows) throw new Error('status transport failed');
        const status = statuses[Math.min(statusIndex, statuses.length - 1)];
        statusIndex += 1;
        return { apps: [{ app: '795', status }] };
      }
      throw new Error(`unexpected transport call ${spec.method} ${spec.path}`);
    }
  };
  const io = createD3KintoneIoAdapter({
    transport,
    readAppSnapshot: async () => ({}),
    deployStatusMaxChecks: maxChecks,
    deployPollDelayMs: 0,
    sleep: async () => {}
  });
  await io.stageFormSchema({
    appId: 795,
    expectedLiveRevision: '11',
    phase: 'APP795_STAGE_OPTIONAL_FIELDS',
    operations: [addOp('Version_Key')]
  });
  return { io, calls };
}

test('deploy polling waits through PROCESSING and returns only after SUCCESS', async () => {
  const { io, calls } = await stagedAdapter({ statuses: ['PROCESSING', 'SUCCESS'] });
  const result = await io.activateFormSchema({ appId: 795, phase: 'APP795_ACTIVATE_STAGED_SCHEMA' });
  assert.equal(result.deployStatus, 'SUCCESS');
  assert.equal(result.postTransportUncertain, false);
  const deployCalls = calls.slice(1);
  assert.deepEqual(deployCalls.map(call => call.method), ['POST', 'GET', 'GET']);
  assert.equal(deployCalls[1].path, '/k/v1/preview/app/deploy.json?apps[0]=795');
});

test('deploy FAIL is terminal and fails closed', async () => {
  const { io } = await stagedAdapter({ statuses: ['FAIL'] });
  await assert.rejects(
    () => io.activateFormSchema({ appId: 795, phase: 'APP795_ACTIVATE_STAGED_SCHEMA' }),
    /D3_BINDING_DEPLOY_EXECUTION_FAILED/
  );
});

test('deploy CANCEL is terminal and fails closed', async () => {
  const { io } = await stagedAdapter({ statuses: ['CANCEL'] });
  await assert.rejects(
    () => io.activateFormSchema({ appId: 795, phase: 'APP795_ACTIVATE_STAGED_SCHEMA' }),
    /D3_BINDING_DEPLOY_EXECUTION_FAILED/
  );
});

test('deploy PROCESSING timeout is result-uncertain and does not auto retry POST', async () => {
  const { io, calls } = await stagedAdapter({ statuses: ['PROCESSING'], maxChecks: 2 });
  await assert.rejects(
    () => io.activateFormSchema({ appId: 795, phase: 'APP795_ACTIVATE_STAGED_SCHEMA' }),
    /D3_BINDING_DEPLOY_RESULT_UNCERTAIN/
  );
  assert.equal(calls.filter(call => call.method === 'POST' && call.path === D3_BINDING_ENDPOINTS.previewDeploy).length, 1);
  await assert.rejects(
    () => io.activateFormSchema({ appId: 795, phase: 'APP795_ACTIVATE_STAGED_SCHEMA' }),
    /D3_BINDING_PREVIEW_REVISION_REQUIRED/
  );
});

test('uncertain deploy POST can be resolved only by bounded SUCCESS status readback', async () => {
  const { io } = await stagedAdapter({ statuses: ['PROCESSING', 'SUCCESS'], postThrows: true });
  const result = await io.activateFormSchema({ appId: 795, phase: 'APP795_ACTIVATE_STAGED_SCHEMA' });
  assert.equal(result.deployStatus, 'SUCCESS');
  assert.equal(result.postTransportUncertain, true);
});

test('deploy status transport uncertainty fails closed without write retry', async () => {
  const { io, calls } = await stagedAdapter({ statuses: ['SUCCESS'], getThrows: true });
  await assert.rejects(
    () => io.activateFormSchema({ appId: 795, phase: 'APP795_ACTIVATE_STAGED_SCHEMA' }),
    /D3_BINDING_DEPLOY_RESULT_UNCERTAIN/
  );
  assert.equal(calls.filter(call => call.method === 'POST' && call.path === D3_BINDING_ENDPOINTS.previewDeploy).length, 1);
});
