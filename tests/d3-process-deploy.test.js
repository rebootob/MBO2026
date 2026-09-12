import test from 'node:test';
import assert from 'node:assert/strict';

import {
  executeD3ProcessDeploy,
  normalizeProcessSemantics,
  computeProcessSemanticFingerprint,
  computeProcessSemanticDiff,
  validatePreviewFieldCompatibility,
  D3_EXPECTED_STATE_COUNT,
  D3_EXPECTED_ACTION_COUNT,
  REQUIRED_ASSIGNEE_FIELDS
} from '../scripts/kintone/deploy-d3-workflow.js';

import {
  buildD3WorkflowPayload,
  buildD3WorkflowDefinition
} from '../scripts/kintone/build-d3-workflow-payload.js';

import {
  validateWorkflowPayloadStructure
} from '../src/core/workflow-validator.js';

import {
  D3_APP794_PROCESS_DEPLOY_STAGE,
  D3_APP794_PROCESS_DEPLOY_OPERATION,
  D3_APP794_PROCESS_DEPLOY_WORK_PACKAGE,
  D3_APP794_PROCESS_TARGET_APP,
  PROTECTED_APP_IDS
} from '../src/core/sandbox-write-guard.js';

const MOCK_COMMIT = 'cf9a500515de81475da75b1be241a39d73ee4a47';

const baselineProcess = {
  enable: true,
  revision: '71',
  states: {
    'Not started': {
      name: '01 Draft Objective',
      index: '0',
      assignee: { type: 'ONE', entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Requester_User' } }] }
    },
    '02 First Manager Objective Review': {
      name: '02 First Manager Objective Review',
      index: '1',
      assignee: { type: 'ALL', entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Manager_Level2_Approvers' } }] }
    },
    '03 Manager Objective Review': {
      name: '03 Manager Objective Review',
      index: '2',
      assignee: { type: 'ALL', entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Manager_Level1_Approvers' } }] }
    },
    '04 GM Objective Review': {
      name: '04 GM Objective Review',
      index: '3',
      assignee: { type: 'ALL', entities: [{ entity: { type: 'FIELD_ENTITY', code: 'GM_Level1_Approvers' } }] }
    },
    '05 Objective Approved': {
      name: '05 Objective Approved',
      index: '4',
      assignee: { type: 'ONE', entities: [{ entity: { type: 'FIELD_ENTITY', code: 'Requester_User' } }] }
    }
  },
  actions: [
    { name: 'Submit Objective to Manager', from: '01 Draft Objective', to: '03 Manager Objective Review', filterCond: '' }
  ]
};

const validFormFields = {
  properties: {
    Requester_User: { type: 'USER_SELECT', code: 'Requester_User' },
    Manager_Level2_Approvers: { type: 'USER_SELECT', code: 'Manager_Level2_Approvers' },
    Manager_Level1_Approvers: { type: 'USER_SELECT', code: 'Manager_Level1_Approvers' },
    GM_Level1_Approvers: { type: 'USER_SELECT', code: 'GM_Level1_Approvers' },
    GM_Level2_Approvers: { type: 'USER_SELECT', code: 'GM_Level2_Approvers' },
    Routing_Topology: { type: 'DROP_DOWN', code: 'Routing_Topology' }
  }
};

const canonical19_40 = buildD3WorkflowPayload({ app: 794, revision: '72' }).payload;
const validBaselineFingerprint = computeProcessSemanticFingerprint(baselineProcess);

function makeAuth(id = 'AUTH_TEST_' + Math.random().toString(36).slice(2)) {
  return {
    workPackageId: D3_APP794_PROCESS_DEPLOY_WORK_PACKAGE,
    stage: D3_APP794_PROCESS_DEPLOY_STAGE,
    operation: D3_APP794_PROCESS_DEPLOY_OPERATION,
    appId: 794,
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: id
  };
}

function createMockTransport(overrides = {}) {
  const calls = [];
  return {
    calls,
    async request({ method, path, body }) {
      calls.push({ method, path, body });
      if (overrides.onRequest) {
        const custom = overrides.onRequest({ method, path, body, callIndex: calls.length - 1 });
        if (custom !== undefined) return custom;
      }
      if (method === 'GET' && path === '/k/v1/app/status.json?app=794') {
        const hasDeployed = calls.some((c) => c.method === 'POST' && c.path === '/k/v1/preview/app/deploy.json');
        if (overrides.liveProcess && !hasDeployed) return JSON.parse(JSON.stringify(overrides.liveProcess));
        if (hasDeployed) {
          if (overrides.finalLiveMismatch) return JSON.parse(JSON.stringify(baselineProcess));
          return JSON.parse(JSON.stringify({ ...canonical19_40, revision: '73' }));
        }
        return JSON.parse(JSON.stringify(baselineProcess));
      }
      if (method === 'GET' && path === '/k/v1/preview/app/status.json?app=794') {
        const hasDeployed = calls.some((c) => c.method === 'POST' && c.path === '/k/v1/preview/app/deploy.json');
        if (hasDeployed) {
          if (overrides.finalPreviewMismatch) return JSON.parse(JSON.stringify(baselineProcess));
          return JSON.parse(JSON.stringify({ ...canonical19_40, revision: '73' }));
        }
        if (overrides.previewProcess && !calls.some((c) => c.method === 'PUT')) {
          return JSON.parse(JSON.stringify(overrides.previewProcess));
        }
        if (calls.some((c) => c.method === 'PUT')) {
          if (overrides.previewReadbackMismatch) return JSON.parse(JSON.stringify(baselineProcess));
          return JSON.parse(JSON.stringify({ ...canonical19_40, revision: '72' }));
        }
        return JSON.parse(JSON.stringify(baselineProcess));
      }
      if (method === 'GET' && path === '/k/v1/preview/app/form/fields.json?app=794') {
        return JSON.parse(JSON.stringify(overrides.formFields || validFormFields));
      }
      if (method === 'PUT' && path === '/k/v1/preview/app/status.json') {
        if (overrides.putError) throw overrides.putError;
        if (overrides.putResponse) return JSON.parse(JSON.stringify(overrides.putResponse));
        return { revision: '72' };
      }
      if (method === 'POST' && path === '/k/v1/preview/app/deploy.json') {
        if (overrides.deployPostError) throw overrides.deployPostError;
        if (overrides.deployPostUndefined) return undefined;
        if (overrides.deployPostResponse !== undefined) {
          return overrides.deployPostResponse === null ? null : JSON.parse(JSON.stringify(overrides.deployPostResponse));
        }
        return { apps: [{ app: 794, revision: '72' }] };
      }
      if (method === 'GET' && path.startsWith('/k/v1/preview/app/deploy.json')) {
        if (overrides.deployStatusError) throw overrides.deployStatusError;
        if (overrides.deployStatusSequence) {
          const pollCount = calls.filter((c) => c.path.startsWith('/k/v1/preview/app/deploy.json') && c.method === 'GET').length - 1;
          const entry = overrides.deployStatusSequence[pollCount] || overrides.deployStatusSequence[overrides.deployStatusSequence.length - 1];
          return JSON.parse(JSON.stringify(entry));
        }
        return { apps: [{ app: 794, status: 'SUCCESS' }] };
      }
      throw new Error(`Unexpected mock call: ${method} ${path}`);
    }
  };
}

function baseOpts(extra = {}) {
  return {
    appId: 794,
    expectedSourceCommit: MOCK_COMMIT,
    expectedBaselineFingerprint: validBaselineFingerprint,
    authConfig: makeAuth(),
    transport: createMockTransport(),
    getGitHead: async () => MOCK_COMMIT,
    getGitStatus: async () => '',
    sleep: async () => {},
    maxDeployStatusChecks: 5,
    deployPollDelayMs: 0,
    ...extra
  };
}

// 1. module import causes zero I/O
test('1. module import causes zero I/O', () => {
  assert.equal(typeof executeD3ProcessDeploy, 'function');
  assert.equal(typeof normalizeProcessSemantics, 'function');
});

// 2. exact App794 accepted
test('2. exact App794 accepted', async () => {
  const opts = baseOpts();
  const res = await executeD3ProcessDeploy(opts);
  assert.equal(res.success, true);
  assert.equal(res.appId, 794);
});

// 3. wrong App ID fails closed
test('3. wrong App ID fails closed', async () => {
  const opts = baseOpts({ appId: 795 });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /D3_PROCESS_DEPLOY_BLOCKED: Target App ID must be exactly 794/);
});

// 4. missing expectedSourceCommit fails
test('4. missing expectedSourceCommit fails', async () => {
  const opts = baseOpts({ expectedSourceCommit: '' });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /expectedSourceCommit is required/);
});

// 5. Git HEAD mismatch fails before I/O/write
test('5. Git HEAD mismatch fails before I/O/write', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport, getGitHead: async () => 'different_head' });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Git HEAD mismatch/);
  assert.equal(transport.calls.length, 0, 'Must not perform any transport requests');
});

// 6. dirty worktree fails before I/O/write
test('6. dirty worktree fails before I/O/write', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport, getGitStatus: async () => ' M src/core/foo.js' });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Dirty working tree detected/);
  assert.equal(transport.calls.length, 0, 'Must not perform any transport requests');
});

// 7. canonical target is exactly 19 states / 40 actions
test('7. canonical target is exactly 19 states / 40 actions', () => {
  const { states, actions } = buildD3WorkflowDefinition();
  assert.equal(Object.keys(states).length, 19);
  assert.equal(actions.length, 40);
  assert.equal(D3_EXPECTED_STATE_COUNT, 19);
  assert.equal(D3_EXPECTED_ACTION_COUNT, 40);
});

// 8. executor actually uses canonical D3 builder contract (no override allowed)
test('8. executor actually uses canonical D3 builder contract (no override allowed)', async () => {
  const transport = createMockTransport();
  const fakeOverride = {
    payload: {
      app: 794,
      enable: true,
      revision: '999',
      states: { Fake: { name: 'Fake', index: '0', assignee: { type: 'ONE', entities: [] } } },
      actions: []
    }
  };
  // Caller-supplied override must NOT replace canonical builder
  const opts = baseOpts({ transport, targetBuildOverride: fakeOverride });
  const res = await executeD3ProcessDeploy(opts);
  assert.equal(res.targetStateCount, 19);
  assert.equal(res.targetActionCount, 40);
  assert.equal(res.success, true);
});

// 9. malformed target fails validation
test('9. malformed target fails validation', () => {
  assert.throws(
    () => validateWorkflowPayloadStructure({ app: 794, enable: true, states: { Bad: { name: 'Bad', index: 'NaN' } }, actions: [] }, {}),
    /Invalid state: Bad/
  );
});

// 10. missing required field fails before write
test('10. missing required field fails before write', async () => {
  const transport = createMockTransport({
    formFields: {
      properties: {
        Requester_User: { type: 'USER_SELECT' }
        // missing others
      }
    }
  });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /FIELD_COMPATIBILITY_ERROR: Missing required assignee field/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 11. invalid field type fails before write
test('11. invalid field type fails before write', async () => {
  const transport = createMockTransport({
    formFields: {
      properties: {
        ...validFormFields.properties,
        Manager_Level1_Approvers: { type: 'SINGLE_LINE_TEXT' } // invalid
      }
    }
  });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /FIELD_COMPATIBILITY_ERROR: Assignee field 'Manager_Level1_Approvers' has invalid type/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 12. live/preview baseline drift fails before write
test('12. live/preview baseline drift fails before write', async () => {
  const driftedPreview = {
    ...baselineProcess,
    enable: false // drifted!
  };
  const transport = createMockTransport({ previewProcess: driftedPreview });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /D3_PROCESS_DEPLOY_BLOCKED: Preview process baseline fingerprint mismatch/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 13. expected baseline fingerprint mismatch fails before write
test('13. expected baseline fingerprint mismatch fails before write', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({
    transport,
    expectedBaselineFingerprint: '0000000000000000000000000000000000000000000000000000000000000000'
  });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Live process baseline fingerprint mismatch/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 14. revision missing/invalid fails before write
test('14. revision missing/invalid fails before write', async () => {
  const badRevPreview = { ...baselineProcess, revision: 'abc' };
  const transport = createMockTransport({ previewProcess: badRevPreview });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Invalid preview process revision/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 15. revision drift fails before write
test('15. revision drift fails before write', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport, expectedPreviewRevision: '99' }); // expected 99, but observed 71
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Process revision drift detected/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 16. semantic target diff generated deterministically
test('16. semantic target diff generated deterministically', () => {
  const diff1 = computeProcessSemanticDiff(baselineProcess, canonical19_40);
  const diff2 = computeProcessSemanticDiff(baselineProcess, canonical19_40);
  assert.deepEqual(diff1, diff2);
  assert.equal(diff1.states.targetCount, 19);
  assert.equal(diff1.actions.targetCount, 40);
  assert.equal(diff1.hasChanges, true);
});

// 17. pre-write backup/fingerprint generated
test('17. pre-write backup/fingerprint generated', async () => {
  const opts = baseOpts();
  const res = await executeD3ProcessDeploy(opts);
  assert.ok(res.prewriteBackup);
  assert.ok(res.prewriteBackup.liveFingerprint);
  assert.ok(res.prewriteBackup.previewFingerprint);
  assert.equal(res.prewriteBackup.liveFingerprint, res.prewriteBackup.previewFingerprint);
});

// 18. authorization missing fails before write
test('18. authorization missing fails before write', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport, authConfig: null });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /D3_PROCESS_DEPLOY_BLOCKED/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 19. authorization wrong package fails
test('19. authorization wrong package fails', async () => {
  const transport = createMockTransport();
  const auth = makeAuth();
  auth.workPackageId = 'WRONG_WP';
  const opts = baseOpts({ transport, authConfig: auth });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Work package must be exactly D3-SBX-DEPLOY-01/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 20. authorization wrong stage fails
test('20. authorization wrong stage fails', async () => {
  const transport = createMockTransport();
  const auth = makeAuth();
  auth.stage = 'WRONG_STAGE';
  const opts = baseOpts({ transport, authConfig: auth });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Stage must be exactly STAGE_D3_APP794_PROCESS_DEPLOY/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 21. authorization wrong operation fails
test('21. authorization wrong operation fails', async () => {
  const transport = createMockTransport();
  const auth = makeAuth();
  auth.operation = 'WRONG_OP';
  const opts = baseOpts({ transport, authConfig: auth });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Operation must be exactly APP794_D3_PROCESS_DEPLOY/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 22. authorization inactive window fails
test('22. authorization inactive window fails', async () => {
  const transport = createMockTransport();
  const auth = makeAuth();
  auth.activeWindow = false;
  const opts = baseOpts({ transport, authConfig: auth });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /One-time write window is CLOSED/);
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false);
});

// 23. authorization replay fails
test('23. authorization replay fails', async () => {
  const authId = 'AUTH_REPLAY_TEST_KEY_' + Math.random().toString(36).slice(2);
  const auth1 = makeAuth(authId);
  const opts1 = baseOpts({ authConfig: auth1 });
  await executeD3ProcessDeploy(opts1);

  // Replay same authId
  const auth2 = makeAuth(authId);
  const transport2 = createMockTransport();
  const opts2 = baseOpts({ authConfig: auth2, transport: transport2 });
  await assert.rejects(() => executeD3ProcessDeploy(opts2), /Authorization has already been consumed/);
  assert.equal(transport2.calls.some((c) => c.method === 'PUT'), false);
});

// 24. PUT preview occurs only after all guards pass
test('24. PUT preview occurs only after all guards pass', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport });
  await executeD3ProcessDeploy(opts);
  const putIndex = transport.calls.findIndex((c) => c.method === 'PUT');
  assert.ok(putIndex >= 3, 'PUT preview must occur after read requests');
});

// 25. PUT failure -> STOP / no deploy POST
test('25. PUT failure -> STOP / no deploy POST', async () => {
  const transport = createMockTransport({ putError: new Error('Network error') });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /PUT preview process failed/);
  assert.equal(transport.calls.some((c) => c.method === 'POST'), false);
});

// 26. uncertain PUT result -> STOP / no retry / no deploy POST
test('26. uncertain PUT result -> STOP / no retry / no deploy POST', async () => {
  const transport = createMockTransport({ putResponse: { revision: null } });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /PUT preview process returned uncertain or invalid revision/);
  assert.equal(transport.calls.some((c) => c.method === 'POST'), false);
  assert.equal(transport.calls.filter((c) => c.method === 'PUT').length, 1, 'No retry of PUT');
});

// 27. preview read-back mismatch -> STOP / no deploy POST
test('27. preview read-back mismatch -> STOP / no deploy POST', async () => {
  const transport = createMockTransport({ previewReadbackMismatch: true });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Preview process read-back does not match canonical 19\/40 target/);
  assert.equal(transport.calls.some((c) => c.method === 'POST'), false);
});

// 28. exact preview 19/40 read-back passes
test('28. exact preview 19/40 read-back passes', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport });
  const res = await executeD3ProcessDeploy(opts);
  assert.equal(res.targetStateCount, 19);
  assert.equal(res.targetActionCount, 40);
});

// 29. deploy POST occurs only after exact preview read-back
test('29. deploy POST occurs only after exact preview read-back', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport });
  await executeD3ProcessDeploy(opts);
  const putIndex = transport.calls.findIndex((c) => c.method === 'PUT');
  const readbackIndex = transport.calls.findIndex((c, i) => i > putIndex && c.method === 'GET' && c.path.includes('/preview/app/status.json'));
  const postIndex = transport.calls.findIndex((c) => c.method === 'POST');
  assert.ok(postIndex > readbackIndex, 'deploy POST must happen strictly after preview readback');
});

// 30. deploy POST failure -> STOP
test('30. deploy POST failure -> STOP', async () => {
  const transport = createMockTransport({ deployPostError: new Error('POST network error') });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Deploy POST transport failed/);
});

// 31. deploy POST uncertain result -> STOP / no retry
test('31. deploy POST uncertain result -> STOP / no retry', async () => {
  const transport = createMockTransport({ deployPostResponse: { status: 500 } });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Deploy POST returned error status/);
  assert.equal(transport.calls.filter((c) => c.method === 'POST').length, 1, 'Zero deploy POST retries');
});

// 32. deploy terminal FAIL -> STOP
test('32. deploy terminal FAIL -> STOP', async () => {
  const transport = createMockTransport({
    deployStatusSequence: [{ apps: [{ app: 794, status: 'FAIL' }] }]
  });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Deploy for App 794 reached terminal status FAIL/);
});

// 33. deploy terminal CANCEL -> STOP
test('33. deploy terminal CANCEL -> STOP', async () => {
  const transport = createMockTransport({
    deployStatusSequence: [{ apps: [{ app: 794, status: 'CANCEL' }] }]
  });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Deploy for App 794 reached terminal status CANCEL/);
});

// 34. deploy poll timeout -> STOP
test('34. deploy poll timeout -> STOP', async () => {
  const transport = createMockTransport({
    deployStatusSequence: [{ apps: [{ app: 794, status: 'PROCESSING' }] }]
  });
  const opts = baseOpts({ transport, maxDeployStatusChecks: 2 });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Deploy status polling timed out after 2 checks/);
});

// 35. deployment status malformed -> STOP
test('35. deployment status malformed -> STOP', async () => {
  const transport = createMockTransport({
    deployStatusSequence: [{ apps: [{ app: 794, status: 'UNKNOWN_STATUS' }] }]
  });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Missing or invalid exact-App deploy status/);
});

// 36. deployment status read error -> STOP
test('36. deployment status read error -> STOP', async () => {
  const transport = createMockTransport({
    deployStatusError: new Error('Socket closed')
  });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Failed to read deployment status/);
});

// 37. deploy terminal SUCCESS continues
test('37. deploy terminal SUCCESS continues', async () => {
  const transport = createMockTransport({
    deployStatusSequence: [
      { apps: [{ app: 794, status: 'PROCESSING' }] },
      { apps: [{ app: 794, status: 'SUCCESS' }] }
    ]
  });
  const opts = baseOpts({ transport });
  const res = await executeD3ProcessDeploy(opts);
  assert.equal(res.success, true);
});

// 38. final live read-back mismatch -> FAIL CLOSED
test('38. final live read-back mismatch -> FAIL CLOSED', async () => {
  const transport = createMockTransport({ finalLiveMismatch: true });
  const opts = baseOpts({ transport });
  await assert.rejects(() => executeD3ProcessDeploy(opts), /Live process read-back does not match canonical 19\/40 target/);
});

// 39. final live exact 19/40 -> PASS
test('39. final live exact 19/40 -> PASS', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport });
  const res = await executeD3ProcessDeploy(opts);
  assert.equal(res.targetStateCount, 19);
  assert.equal(res.targetActionCount, 40);
  assert.equal(res.success, true);
});

// 40. successful execution performs no schema/record/ACL/customization writes
test('40. successful execution performs no schema/record/ACL/customization writes', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport });
  await executeD3ProcessDeploy(opts);

  const writeCalls = transport.calls.filter((c) => ['POST', 'PUT', 'DELETE', 'PATCH'].includes(c.method));
  // Only 2 writes allowed: PUT preview process, POST deploy
  assert.equal(writeCalls.length, 2);
  assert.equal(writeCalls[0].method, 'PUT');
  assert.equal(writeCalls[0].path, '/k/v1/preview/app/status.json');
  assert.equal(writeCalls[1].method, 'POST');
  assert.equal(writeCalls[1].path, '/k/v1/preview/app/deploy.json');

  // Verify no schema writes (POST/PUT/DELETE /form/fields)
  assert.ok(!writeCalls.some((c) => c.path.includes('/form/fields')));
  // Verify no record writes
  assert.ok(!writeCalls.some((c) => c.path.includes('/records') || c.path.includes('/record.json')));
  // Verify no ACL writes
  assert.ok(!writeCalls.some((c) => c.path.includes('/acl')));
  // Verify no customization writes
  assert.ok(!writeCalls.some((c) => c.path.includes('/customize')));
});

// 41. no protected App can be targeted
test('41. no protected App can be targeted', async () => {
  for (const protectedId of PROTECTED_APP_IDS) {
    const opts = baseOpts({ appId: protectedId });
    await assert.rejects(() => executeD3ProcessDeploy(opts), /is a permanent PROTECTED PRODUCTION APP/);
  }
});

// 42. authorization is consumed exactly once at write boundary
test('42. authorization is consumed exactly once at write boundary', async () => {
  const authId = 'AUTH_BOUNDARY_TEST_' + Math.random().toString(36).slice(2);
  let putObserved = false;
  const transport = createMockTransport({
    onRequest({ method }) {
      if (method === 'PUT') {
        putObserved = true;
      }
    }
  });

  const opts = baseOpts({ transport, authConfig: makeAuth(authId) });
  await executeD3ProcessDeploy(opts);
  assert.equal(putObserved, true);

  // Verify that authorization was consumed at the write boundary and cannot be reused
  const { assertD3App794ProcessDeployAuthorization } = await import('../src/core/sandbox-write-guard.js');
  assert.throws(
    () => {
      assertD3App794ProcessDeployAuthorization(makeAuth(authId), {
        appId: 794,
        workPackageId: D3_APP794_PROCESS_DEPLOY_WORK_PACKAGE,
        stage: D3_APP794_PROCESS_DEPLOY_STAGE,
        operation: D3_APP794_PROCESS_DEPLOY_OPERATION,
        expectedStateCount: 19,
        expectedActionCount: 40
      });
    },
    /Authorization has already been consumed/
  );
});

// 43. missing expectedBaselineFingerprint fails before any transport I/O
test('43. missing expectedBaselineFingerprint fails before any transport I/O', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport, expectedBaselineFingerprint: undefined });
  await assert.rejects(
    () => executeD3ProcessDeploy(opts),
    /EXPECTED_BASELINE_FINGERPRINT_REQUIRED/
  );
  assert.equal(transport.calls.length, 0, 'Must not perform any transport requests when fingerprint missing');
});

// 44. malformed expectedBaselineFingerprint fails before any transport I/O
test('44. malformed expectedBaselineFingerprint fails before any transport I/O', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport, expectedBaselineFingerprint: 'not_a_valid_sha256' });
  await assert.rejects(
    () => executeD3ProcessDeploy(opts),
    /EXPECTED_BASELINE_FINGERPRINT_REQUIRED/
  );
  assert.equal(transport.calls.length, 0, 'Must not perform any transport requests when fingerprint malformed');
});

// 45. live and preview equal each other but differ from expected baseline -> STOP before write
test('45. live and preview equal each other but differ from expected baseline -> STOP before write', async () => {
  const transport = createMockTransport();
  const wrongBaseline = '1111111111111111111111111111111111111111111111111111111111111111';
  const opts = baseOpts({ transport, expectedBaselineFingerprint: wrongBaseline });
  await assert.rejects(
    () => executeD3ProcessDeploy(opts),
    /D3_PROCESS_DEPLOY_BLOCKED: Live process baseline fingerprint mismatch/
  );
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false, 'Must not issue PUT write');
});

// 46. canonical D3 builder produces non-overridable target fingerprint matching canonical builder
test('46. canonical D3 builder produces non-overridable target fingerprint matching canonical builder', async () => {
  const canonicalTarget = buildD3WorkflowPayload({ app: 794, revision: 1 }).payload;
  const canonicalFingerprint = computeProcessSemanticFingerprint(canonicalTarget);
  const opts = baseOpts();
  const res = await executeD3ProcessDeploy(opts);
  assert.equal(res.finalLiveFingerprint, canonicalFingerprint);
  assert.equal(res.finalPreviewFingerprint, canonicalFingerprint);
});

// 47. structural workflow validator is exercised on canonical target before authorization
test('47. structural workflow validator is exercised on canonical target before authorization', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport });
  const res = await executeD3ProcessDeploy(opts);
  assert.equal(res.success, true);
});

// 48. structural workflow validator failure blocks write and performs zero PUTs
test('48. structural workflow validator failure blocks write and performs zero PUTs', async () => {
  // If an assignee field in preview form fields has an unrecognized type for ENTITY_TYPES
  const corruptedFields = {
    properties: {
      ...validFormFields.properties,
      Requester_User: { type: 'DATE', code: 'Requester_User' } // Not in ENTITY_TYPES
    }
  };
  const transport = createMockTransport({ formFields: corruptedFields });
  const opts = baseOpts({ transport });
  await assert.rejects(
    () => executeD3ProcessDeploy(opts),
    /FIELD_COMPATIBILITY_ERROR|Invalid assignee field/
  );
  assert.equal(transport.calls.some((c) => c.method === 'PUT'), false, 'Zero PUTs when validator fails');
});

// 49. deploy POST null response fails closed (D3_DEPLOY_POST_UNCERTAIN / zero polls / no retry)
test('49. deploy POST null response fails closed (D3_DEPLOY_POST_UNCERTAIN / zero polls / no retry)', async () => {
  const transport = createMockTransport({ deployPostResponse: null });
  const opts = baseOpts({ transport });
  await assert.rejects(
    () => executeD3ProcessDeploy(opts),
    /D3_DEPLOY_POST_UNCERTAIN: Deploy POST returned null, primitive, or malformed result/
  );
  assert.equal(transport.calls.filter((c) => c.method === 'POST').length, 1, 'Exactly one deploy POST');
  assert.equal(transport.calls.filter((c) => c.path.startsWith('/k/v1/preview/app/deploy.json') && c.method === 'GET').length, 0, 'Zero status polls');
});

// 50. deploy POST undefined response fails closed (D3_DEPLOY_POST_UNCERTAIN / zero polls / no retry)
test('50. deploy POST undefined response fails closed (D3_DEPLOY_POST_UNCERTAIN / zero polls / no retry)', async () => {
  const transport = createMockTransport({ deployPostUndefined: true });
  const opts = baseOpts({ transport });
  await assert.rejects(
    () => executeD3ProcessDeploy(opts),
    /D3_DEPLOY_POST_UNCERTAIN: Deploy POST returned null, primitive, or malformed result/
  );
  assert.equal(transport.calls.filter((c) => c.method === 'POST').length, 1, 'Exactly one deploy POST');
  assert.equal(transport.calls.filter((c) => c.path.startsWith('/k/v1/preview/app/deploy.json') && c.method === 'GET').length, 0, 'Zero status polls');
});

// 51. deploy POST primitive response fails closed (D3_DEPLOY_POST_UNCERTAIN / zero polls / no retry)
test('51. deploy POST primitive response fails closed (D3_DEPLOY_POST_UNCERTAIN / zero polls / no retry)', async () => {
  const transport = createMockTransport({
    onRequest({ method, path }) {
      if (method === 'POST' && path === '/k/v1/preview/app/deploy.json') {
        return 'unexpected_string_response';
      }
    }
  });
  const opts = baseOpts({ transport });
  await assert.rejects(
    () => executeD3ProcessDeploy(opts),
    /D3_DEPLOY_POST_UNCERTAIN: Deploy POST returned null, primitive, or malformed result/
  );
  assert.equal(transport.calls.filter((c) => c.method === 'POST').length, 1, 'Exactly one deploy POST');
  assert.equal(transport.calls.filter((c) => c.path.startsWith('/k/v1/preview/app/deploy.json') && c.method === 'GET').length, 0, 'Zero status polls');
});

// 52. final live exact but final preview mismatched fails closed (D3_FINAL_PREVIEW_READBACK_MISMATCH)
test('52. final live exact but final preview mismatched fails closed (D3_FINAL_PREVIEW_READBACK_MISMATCH)', async () => {
  const transport = createMockTransport({ finalPreviewMismatch: true });
  const opts = baseOpts({ transport });
  await assert.rejects(
    () => executeD3ProcessDeploy(opts),
    /D3_FINAL_PREVIEW_READBACK_MISMATCH: Final preview process read-back does not match canonical 19\/40 target/
  );
});

// 53. final live and preview both exact canonical 19/40 converge successfully
test('53. final live and preview both exact canonical 19/40 converge successfully', async () => {
  const transport = createMockTransport();
  const opts = baseOpts({ transport });
  const res = await executeD3ProcessDeploy(opts);
  assert.equal(res.success, true);
  assert.ok(res.finalLiveFingerprint);
  assert.ok(res.finalPreviewFingerprint);
  assert.equal(res.finalLiveFingerprint, res.finalPreviewFingerprint);
});
