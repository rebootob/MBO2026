import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  getSandboxAppIds,
  assertDiscoveryReadOnly,
  assertAppCreationAuthorization,
  assertScoringMasterLiveActivationAuthorization,
  assertScoringMasterSchemaAuthorization,
  assertSandboxWriteTarget,
  assertWorkPackageAuthorization,
  WP002C_SCHEMA_CONFIGURATION_STAGE
} from '../src/core/sandbox-write-guard.js';
import {
  assertAppCreationRequestPreflight,
  activateScoringConfigMasterLive,
  CREATOR_ONLY_SCORING_MASTER_ACL,
  createAndVerifyScoringConfigMasterPreview,
  getAppCreationConnection,
  kintoneRequest,
  WP002C_23_FIELD_MANIFEST,
  generateExact23FieldsPayload,
  assertExact23FieldSchema,
  configureAndDeployScoringMasterSchema
} from '../src/core/kintone-client.js';

const approvedAppName = 'MBO Profile & Scoring Configuration Master [Sandbox]';

async function withAppCreateTestEnvironment(callback) {
  const keys = [
    'KINTONE_BASE_URL',
    'KINTONE_USERNAME',
    'KINTONE_PASSWORD',
    'KINTONE_API_TOKEN',
    'KINTONE_BASIC_AUTH_USERNAME',
    'KINTONE_BASIC_AUTH_PASSWORD'
  ];
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    process.env.KINTONE_BASE_URL = 'https://example.kintone.com';
    process.env.KINTONE_USERNAME = 'publisher';
    process.env.KINTONE_PASSWORD = 'secret';
    process.env.KINTONE_API_TOKEN = 'must-not-be-sent';
    delete process.env.KINTONE_BASIC_AUTH_USERNAME;
    delete process.env.KINTONE_BASIC_AUTH_PASSWORD;
    return await callback();
  } finally {
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
    }
  }
}

function validStage2Request() {
  return {
    ...validAppCreateRequest(),
    method: 'POST',
    path: '/k/v1/preview/app.json',
    body: { name: approvedAppName }
  };
}

function mockResponse(payload, { ok = true, status = 200, parseError = false } = {}) {
  return {
    ok,
    status,
    json: async () => {
      if (parseError) throw new Error('mock parse error');
      return payload;
    }
  };
}

function validLiveActivationAuthorization(authorizationId) {
  return {
    workPackageId: 'MBO-P03-WP-002C',
    stage: 'STAGE_3A_LIVE_ACTIVATION',
    explicitUserAuthorization: true,
    activeWindow: true,
    authorizationId
  };
}

function validLiveActivationRequest(overrides = {}) {
  return {
    workPackageId: 'MBO-P03-WP-002C',
    stage: 'STAGE_3A_LIVE_ACTIVATION',
    appId: 796,
    appName: approvedAppName,
    operationSequence: ['APP_ACL_PREVIEW_UPDATE', 'APP_DEPLOY'],
    ...overrides
  };
}

function creatorOnlyAclPayload(revision = '3') {
  return { rights: [{ ...CREATOR_ONLY_SCORING_MASTER_ACL, entity: { type: 'CREATOR' } }], revision };
}

function buildActivationFetch({ deployStatuses = ['SUCCESS'], liveName = approvedAppName, liveAcl = creatorOnlyAclPayload('3'), aclPutOk = true, deployThrows = false, deployOk = true } = {}) {
  const calls = [];
  let liveSettingsChecks = 0;
  let statusIndex = 0;
  const fetchMock = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith('/k/v1/preview/app/settings.json?app=796')) return mockResponse({ name: approvedAppName, revision: '2' });
    if (url.endsWith('/k/v1/app/settings.json?app=796')) {
      liveSettingsChecks += 1;
      return liveSettingsChecks === 1 ? mockResponse({}, { ok: false, status: 404 }) : mockResponse({ name: liveName, revision: '3' });
    }
    if (url.endsWith('/k/v1/preview/app/form/fields.json?app=796')) return mockResponse({ properties: {} });
    if (url.endsWith('/k/v1/preview/app/acl.json') && options.method === 'PUT') return aclPutOk ? mockResponse({ revision: '3' }) : mockResponse({}, { ok: false, status: 400 });
    if (url.endsWith('/k/v1/preview/app/acl.json?app=796')) return mockResponse(creatorOnlyAclPayload('3'));
    if (url.endsWith('/k/v1/preview/app/deploy.json') && options.method === 'POST') {
      if (deployThrows) throw new Error('mock deploy transport');
      return mockResponse(undefined, { ok: deployOk, status: deployOk ? 200 : 400, parseError: true });
    }
    if (url.endsWith('/k/v1/preview/app/deploy.json?apps[0]=796')) {
      const status = deployStatuses[Math.min(statusIndex, deployStatuses.length - 1)];
      statusIndex += 1;
      return mockResponse({ apps: [{ app: '796', status }] });
    }
    if (url.endsWith('/k/v1/app/acl.json?app=796')) return mockResponse(liveAcl);
    throw new Error(`Unexpected mock URL: ${url}`);
  };
  return { calls, fetchMock };
}

function validAppCreateAuthorization(authorizationId) {
  return {
    workPackageId: 'MBO-P03-WP-002C',
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId,
    authorizationConsumed: false,
    authorizedAppName: approvedAppName
  };
}

function validAppCreateRequest(overrides = {}) {
  return {
    workPackageId: 'MBO-P03-WP-002C',
    operation: 'APP_CREATE',
    requestedAppName: approvedAppName,
    manifest: { expectedChanges: [{ operation: 'APP_CREATE', appName: approvedAppName }] },
    ...overrides
  };
}

// ==========================================
// WP-001 SAFETY BASELINE TESTS (SAFE-001..008)
// ==========================================

test('SAFE-001: POST App 53 is blocked locally', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('POST', 53),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
  assert.throws(
    () => assertSandboxWriteTarget(53, undefined, [53]),
    /PROTECTED PRODUCTION APP/
  );
});

test('SAFE-002: PUT App 53 is blocked locally', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('PUT', 53),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
});

test('SAFE-003: DELETE App 53 is blocked locally', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('DELETE', 53),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
});

test('SAFE-004: POST App 283 is blocked locally', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('POST', 283),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
  assert.throws(
    () => assertSandboxWriteTarget(283, undefined, [283]),
    /PROTECTED PRODUCTION APP/
  );
});

test('SAFE-005: POST App 794 is blocked in WP-001 default state', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('POST', 794),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
});

test('SAFE-006: PUT App 795 is blocked in WP-001 default state', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('PUT', 795),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
});

test('SAFE-007: Protected App remains DENIED even if mistakenly placed in work-package allow-list', () => {
  for (const protectedId of PROTECTED_APP_IDS) {
    assert.throws(
      () => assertSandboxWriteTarget(protectedId, undefined, [protectedId], { dryRunBypassDiscovery: true }),
      /PROTECTED PRODUCTION APP/
    );
  }
});

test('SAFE-008: Empty allow-list denies every write target', () => {
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
  assert.throws(
    () => assertSandboxWriteTarget(794, undefined, []),
    /WRITE BLOCKED/
  );
  assert.throws(
    () => assertSandboxWriteTarget(795, undefined, []),
    /WRITE BLOCKED/
  );
});

// ==========================================
// WP-002 CONTROLLED WRITE & SCOPE TESTS (SAFE-009..020)
// ==========================================

test('SAFE-009: Allow-list = [794] -> 794 is ALLOWED at Safety Layer', () => {
  const result = assertSandboxWriteTarget(794, undefined, [794], { dryRunBypassDiscovery: true });
  assert.equal(result, 794);
});

test('SAFE-010: Allow-list = [794] -> 795 is DENIED', () => {
  assert.throws(
    () => assertSandboxWriteTarget(795, undefined, [794], { dryRunBypassDiscovery: true }),
    /not in the active Work Package write allow-list/
  );
});

test('SAFE-011: Allow-list = [795] -> 795 is ALLOWED at Safety Layer', () => {
  const result = assertSandboxWriteTarget(795, undefined, [795], { dryRunBypassDiscovery: true });
  assert.equal(result, 795);
});

test('SAFE-012: Allow-list = [795] -> 794 is DENIED', () => {
  assert.throws(
    () => assertSandboxWriteTarget(794, undefined, [795], { dryRunBypassDiscovery: true }),
    /not in the active Work Package write allow-list/
  );
});

test('SAFE-013: Allow-list = [53] -> 53 is HARD DENIED', () => {
  assert.throws(
    () => assertSandboxWriteTarget(53, undefined, [53], { dryRunBypassDiscovery: true }),
    /permanent PROTECTED PRODUCTION APP/
  );
});

test('SAFE-014: Allow-list = [794, 53] -> 794 is ALLOWED, 53 is HARD DENIED', () => {
  const result794 = assertSandboxWriteTarget(794, undefined, [794, 53], { dryRunBypassDiscovery: true });
  assert.equal(result794, 794);

  assert.throws(
    () => assertSandboxWriteTarget(53, undefined, [794, 53], { dryRunBypassDiscovery: true }),
    /permanent PROTECTED PRODUCTION APP/
  );
});

test('SAFE-015: Unknown App -> DENIED', () => {
  assert.throws(
    () => assertSandboxWriteTarget(9999, undefined, [9999], { dryRunBypassDiscovery: true }),
    /not registered as an MBO2026 Sandbox App/
  );
});

test('SAFE-016: Missing Work Package authorization (Fail-Closed) -> DENIED', () => {
  assert.throws(
    () => assertWorkPackageAuthorization(null, null),
    /FAIL-CLOSED/
  );
});

test('SAFE-017: Operation-level scope mismatch -> DENIED', () => {
  const authConfig = {
    workPackageId: 'MBO-P02-WP-001',
    allowedAppIds: [794],
    allowedOperations: ['FIELD_CREATE', 'LAYOUT_UPDATE'],
    backupVerified: true,
    activeWindow: true,
    dryRunBypassDiscovery: true
  };

  const reqAuthorized = {
    workPackageId: 'MBO-P02-WP-001',
    appId: 794,
    operation: 'FIELD_CREATE',
    manifest: { expectedChanges: [{ field: 'Fiscal_Year', action: 'CREATE' }] }
  };

  const reqUnauthorizedOp = {
    workPackageId: 'MBO-P02-WP-001',
    appId: 794,
    operation: 'RECORD_DELETE',
    manifest: { expectedChanges: [{ recordId: 1, action: 'DELETE' }] }
  };

  assert.equal(assertWorkPackageAuthorization(authConfig, reqAuthorized), true);
  assert.throws(
    () => assertWorkPackageAuthorization(authConfig, reqUnauthorizedOp),
    /Operation 'RECORD_DELETE' is not authorized/
  );
});

test('SAFE-018: Pre-write backup gate failure (backupVerified: false) -> DENIED', () => {
  const authNoBackup = {
    workPackageId: 'MBO-P02-WP-001',
    allowedAppIds: [794],
    allowedOperations: ['FIELD_CREATE'],
    backupVerified: false,
    activeWindow: true,
    dryRunBypassDiscovery: true
  };

  const req = {
    workPackageId: 'MBO-P02-WP-001',
    appId: 794,
    operation: 'FIELD_CREATE',
    manifest: { expectedChanges: [{ field: 'Fiscal_Year' }] }
  };

  assert.throws(
    () => assertWorkPackageAuthorization(authNoBackup, req),
    /BACKUP GATE/
  );
});

test('SAFE-019: Missing Expected Change Manifest -> DENIED', () => {
  const auth = {
    workPackageId: 'MBO-P02-WP-001',
    allowedAppIds: [794],
    allowedOperations: ['FIELD_CREATE'],
    backupVerified: true,
    activeWindow: true,
    dryRunBypassDiscovery: true
  };

  const reqNoManifest = {
    workPackageId: 'MBO-P02-WP-001',
    appId: 794,
    operation: 'FIELD_CREATE',
    manifest: null
  };

  assert.throws(
    () => assertWorkPackageAuthorization(auth, reqNoManifest),
    /Missing or empty Expected Change Manifest/
  );
});

test('SAFE-020: Closed temporary write window (activeWindow: false) -> DENIED', () => {
  const authClosedWindow = {
    workPackageId: 'MBO-P02-WP-001',
    allowedAppIds: [794],
    allowedOperations: ['FIELD_CREATE'],
    backupVerified: true,
    activeWindow: false,
    dryRunBypassDiscovery: true
  };

  const req = {
    workPackageId: 'MBO-P02-WP-001',
    appId: 794,
    operation: 'FIELD_CREATE',
    manifest: { expectedChanges: [{ field: 'Fiscal_Year' }] }
  };

  assert.throws(
    () => assertWorkPackageAuthorization(authClosedWindow, req),
    /Write window is CLOSED/
  );
});

// ==========================================
// WP-002C STAGE-1 APP-CREATION SAFETY TESTS
// ==========================================

test('WP002C-S1-001: exact one-target APP_CREATE authorization passes', () => {
  assert.equal(assertAppCreationAuthorization(validAppCreateAuthorization('s1-001'), validAppCreateRequest()), true);
});

test('WP002C-S1-002: wrong WP, operation, authorization, window, name, manifest, and consumed authorization fail closed', () => {
  assert.throws(() => assertAppCreationAuthorization(validAppCreateAuthorization('s1-002-wp'), validAppCreateRequest({ workPackageId: 'MBO-P03-WP-002B' })), /Work package/);
  assert.throws(() => assertAppCreationAuthorization(validAppCreateAuthorization('s1-002-op'), validAppCreateRequest({ operation: 'POST' })), /Operation/);
  assert.throws(() => assertAppCreationAuthorization({ ...validAppCreateAuthorization('s1-002-auth'), explicitUserAuthorization: false }, validAppCreateRequest()), /Explicit user authorization/);
  assert.throws(() => assertAppCreationAuthorization({ ...validAppCreateAuthorization('s1-002-window'), activeWindow: false }, validAppCreateRequest()), /window is CLOSED/);
  assert.throws(() => assertAppCreationAuthorization(validAppCreateAuthorization('s1-002-name'), validAppCreateRequest({ requestedAppName: 'Other App' })), /App name/);
  assert.throws(() => assertAppCreationAuthorization(validAppCreateAuthorization('s1-002-empty'), validAppCreateRequest({ manifest: { expectedChanges: [] } })), /exactly one/);
  assert.throws(() => assertAppCreationAuthorization(validAppCreateAuthorization('s1-002-many'), validAppCreateRequest({ manifest: { expectedChanges: [{ operation: 'APP_CREATE', appName: approvedAppName }, { operation: 'APP_CREATE', appName: approvedAppName }] } })), /exactly one/);
  assert.throws(() => assertAppCreationAuthorization({ ...validAppCreateAuthorization('s1-002-consumed'), authorizationConsumed: true }, validAppCreateRequest()), /already been consumed/);
});

test('WP002C-S1-003: APP_CREATE preflight permits only the exact preview POST path', () => {
  const request = {
    ...validAppCreateRequest(),
    method: 'POST',
    path: '/k/v1/preview/app.json',
    body: { name: approvedAppName }
  };
  assert.equal(assertAppCreationRequestPreflight(validAppCreateAuthorization('s1-003'), request), true);
  assert.throws(() => assertAppCreationRequestPreflight(validAppCreateAuthorization('s1-003-method'), { ...request, method: 'PUT' }), /Only POST/);
  assert.throws(() => assertAppCreationRequestPreflight(validAppCreateAuthorization('s1-003-path'), { ...request, path: '/k/v1/app.json' }), /Only POST/);
});

test('WP002C-S1-006: authorization IDs are module-private single-use and cannot be replayed', () => {
  const authorizationA = validAppCreateAuthorization('s1-006-a');
  assert.equal(assertAppCreationAuthorization(authorizationA, validAppCreateRequest()), true);
  assert.throws(() => assertAppCreationAuthorization(authorizationA, validAppCreateRequest()), /Authorization has already been consumed/);
  assert.throws(() => assertAppCreationAuthorization({ ...validAppCreateAuthorization('s1-006-a'), authorizationConsumed: false }, validAppCreateRequest()), /Authorization has already been consumed/);
  assert.equal(assertAppCreationAuthorization(validAppCreateAuthorization('s1-006-b'), validAppCreateRequest()), true);
});

test('WP002C-S1-004: APP_CREATE authentication requires password credentials and omits API token header', () => {
  const saved = {
    baseUrl: process.env.KINTONE_BASE_URL,
    username: process.env.KINTONE_USERNAME,
    password: process.env.KINTONE_PASSWORD,
    token: process.env.KINTONE_API_TOKEN
  };
  try {
    process.env.KINTONE_BASE_URL = 'https://example.kintone.com';
    delete process.env.KINTONE_USERNAME;
    delete process.env.KINTONE_PASSWORD;
    process.env.KINTONE_API_TOKEN = 'token-only';
    assert.throws(() => getAppCreationConnection(), /username and password/);

    process.env.KINTONE_USERNAME = 'publisher';
    process.env.KINTONE_PASSWORD = 'secret';
    const connection = getAppCreationConnection();
    assert.equal(connection.baseUrl, 'https://example.kintone.com');
    assert.ok(connection.headers['X-Cybozu-Authorization']);
    assert.equal(connection.headers['X-Cybozu-API-Token'], undefined);
  } finally {
    for (const [key, value] of Object.entries({
      KINTONE_BASE_URL: saved.baseUrl,
      KINTONE_USERNAME: saved.username,
      KINTONE_PASSWORD: saved.password,
      KINTONE_API_TOKEN: saved.token
    })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('WP002C-S1-005: generic network client still blocks POST during Discovery Mode', async () => {
  await assert.rejects(() => kintoneRequest('/k/v1/preview/app.json', { method: 'POST', body: { name: approvedAppName } }), /DISCOVERY PHASE WRITE BLOCKED/);
});

// ==========================================
// WP-002C STAGE-2 CONTROLLED CREATION TESTS
// ==========================================

test('WP002C-S2-001: exact POST/body/auth and exact-ID read-back succeed', async () => {
  await withAppCreateTestEnvironment(async () => {
    const calls = [];
    const fetchMock = async (url, options) => {
      calls.push({ url, options });
      return calls.length === 1
        ? mockResponse({ app: '900', revision: '1' })
        : mockResponse({ name: approvedAppName, revision: '1' });
    };
    const result = await createAndVerifyScoringConfigMasterPreview(validAppCreateAuthorization('s2-001'), validStage2Request(), fetchMock);
    assert.equal(result.appId, 900);
    assert.equal(result.name, approvedAppName);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, 'https://example.kintone.com/k/v1/preview/app.json');
    assert.equal(calls[0].options.method, 'POST');
    assert.deepEqual(JSON.parse(calls[0].options.body), { name: approvedAppName });
    assert.ok(calls[0].options.headers['X-Cybozu-Authorization']);
    assert.equal(calls[0].options.headers['X-Cybozu-API-Token'], undefined);
    assert.equal(calls[1].url, 'https://example.kintone.com/k/v1/preview/app/settings.json?app=900');
    assert.equal(calls[1].options.method, 'GET');
  });
});

test('WP002C-S2-002: preflight failure prevents fetch', async () => {
  await withAppCreateTestEnvironment(async () => {
    let calls = 0;
    const fetchMock = async () => { calls += 1; return mockResponse({}); };
    await assert.rejects(
      () => createAndVerifyScoringConfigMasterPreview({ ...validAppCreateAuthorization('s2-002'), explicitUserAuthorization: false }, validStage2Request(), fetchMock),
      /Explicit user authorization/
    );
    assert.equal(calls, 0);
  });
});

test('WP002C-S2-003: malformed create response is uncertain and never retried', async () => {
  await withAppCreateTestEnvironment(async () => {
    let calls = 0;
    const fetchMock = async () => { calls += 1; return mockResponse(null, { parseError: true }); };
    await assert.rejects(
      () => createAndVerifyScoringConfigMasterPreview(validAppCreateAuthorization('s2-003'), validStage2Request(), fetchMock),
      /APP_CREATE_RESULT_UNCERTAIN/
    );
    assert.equal(calls, 1);
  });
});

test('WP002C-S2-004: invalid or non-positive returned App IDs fail uncertain without read-back', async () => {
  await withAppCreateTestEnvironment(async () => {
    for (const [index, app] of ['0', '-1', 'abc', '', 900].entries()) {
      let calls = 0;
      const fetchMock = async () => { calls += 1; return mockResponse({ app, revision: '1' }); };
      await assert.rejects(
        () => createAndVerifyScoringConfigMasterPreview(validAppCreateAuthorization(`s2-004-${index}`), validStage2Request(), fetchMock),
        /APP_CREATE_RESULT_UNCERTAIN/
      );
      assert.equal(calls, 1);
    }
  });
});

test('WP002C-S2-005: create transport failure is uncertain and attempted once', async () => {
  await withAppCreateTestEnvironment(async () => {
    let calls = 0;
    const fetchMock = async () => { calls += 1; throw new Error('mock network failure'); };
    await assert.rejects(
      () => createAndVerifyScoringConfigMasterPreview(validAppCreateAuthorization('s2-005'), validStage2Request(), fetchMock),
      /APP_CREATE_RESULT_UNCERTAIN.*do not retry/
    );
    assert.equal(calls, 1);
  });
});

test('WP002C-S2-006: identity name mismatch fails closed after exact-ID read-back', async () => {
  await withAppCreateTestEnvironment(async () => {
    const calls = [];
    const fetchMock = async (url, options) => {
      calls.push({ url, options });
      return calls.length === 1
        ? mockResponse({ app: '901', revision: '1' })
        : mockResponse({ name: 'Wrong App', revision: '1' });
    };
    await assert.rejects(
      () => createAndVerifyScoringConfigMasterPreview(validAppCreateAuthorization('s2-006'), validStage2Request(), fetchMock),
      /APP_IDENTITY_VERIFICATION_FAILED/
    );
    assert.equal(calls.length, 2);
    assert.match(calls[1].url, /app=901$/);
  });
});

test('WP002C-S2-007: sandbox registry accepts only a positive scoring master ID and preserves 794/795', () => {
  assert.deepEqual(getSandboxAppIds({ mboV2AppId: 794, routingMasterAppId: 795 }), [794, 795]);
  assert.deepEqual(getSandboxAppIds({ mboV2AppId: 794, routingMasterAppId: 795, scoringConfigMasterAppId: 900 }), [794, 795, 900]);
  assert.deepEqual(getSandboxAppIds({ mboV2AppId: 794, routingMasterAppId: 795, scoringConfigMasterAppId: 0 }), [794, 795]);
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
});

// ==========================================
// WP-002C STAGE-3A LIVE ACTIVATION TESTS
// ==========================================

test('WP002C-S3A-001: activation guard is exact-WP/stage/App/name/sequence and single-use', () => {
  assert.equal(assertScoringMasterLiveActivationAuthorization(validLiveActivationAuthorization('s3a-001-pass'), validLiveActivationRequest()), true);
  assert.throws(() => assertScoringMasterLiveActivationAuthorization(validLiveActivationAuthorization('s3a-001-id'), validLiveActivationRequest({ appId: 794 })), /exactly 796/);
  assert.throws(() => assertScoringMasterLiveActivationAuthorization(validLiveActivationAuthorization('s3a-001-name'), validLiveActivationRequest({ appName: 'Wrong' })), /name mismatch/);
  assert.throws(() => assertScoringMasterLiveActivationAuthorization(validLiveActivationAuthorization('s3a-001-wp'), validLiveActivationRequest({ workPackageId: 'MBO-P03-WP-002B' })), /Work package/);
  assert.throws(() => assertScoringMasterLiveActivationAuthorization(validLiveActivationAuthorization('s3a-001-stage'), validLiveActivationRequest({ stage: 'OTHER' })), /Stage/);
  assert.throws(() => assertScoringMasterLiveActivationAuthorization({ ...validLiveActivationAuthorization('s3a-001-auth'), explicitUserAuthorization: false }, validLiveActivationRequest()), /Explicit authorization/);
  assert.throws(() => assertScoringMasterLiveActivationAuthorization(validLiveActivationAuthorization('s3a-001-seq'), validLiveActivationRequest({ operationSequence: ['APP_CREATE'] })), /Operation sequence/);
});

test('WP002C-S3A-002: successful activation uses exact creator ACL, one deploy, polling, and live verification', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildActivationFetch({ deployStatuses: ['PROCESSING', 'SUCCESS'] });
    const result = await activateScoringConfigMasterLive(validLiveActivationAuthorization('s3a-002'), validLiveActivationRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    assert.deepEqual(result, { appId: 796, name: approvedAppName, revision: '3', deployStatus: 'SUCCESS', accessStatus: 'CREATOR_ONLY' });
    const aclPuts = calls.filter((call) => call.options.method === 'PUT');
    const deployPosts = calls.filter((call) => call.options.method === 'POST');
    assert.equal(aclPuts.length, 1);
    assert.equal(deployPosts.length, 1);
    assert.equal(aclPuts[0].url, 'https://example.kintone.com/k/v1/preview/app/acl.json');
    assert.deepEqual(JSON.parse(aclPuts[0].options.body), { app: 796, rights: [{ ...CREATOR_ONLY_SCORING_MASTER_ACL, entity: { type: 'CREATOR' } }], revision: '2' });
    assert.equal(JSON.parse(aclPuts[0].options.body).rights.some((right) => right.entity.type === 'EVERYONE'), false);
    assert.deepEqual(JSON.parse(deployPosts[0].options.body), { apps: [{ app: 796, revision: '3' }] });
    assert.equal(calls.some((call) => call.url.endsWith('/k/v1/preview/app.json')), false);
    assert.equal(calls.filter((call) => call.url.includes('deploy.json?')).every((call) => call.options.method === undefined || call.options.method === 'GET'), true);
  });
});

test('WP002C-S3A-002B: empty deploy success body is not parsed and status polling continues', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildActivationFetch({ deployStatuses: ['PROCESSING', 'SUCCESS'] });
    const result = await activateScoringConfigMasterLive(validLiveActivationAuthorization('s3a-002b'), validLiveActivationRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    assert.equal(result.deployStatus, 'SUCCESS');
    assert.equal(calls.filter((call) => call.options.method === 'POST').length, 1);
    assert.equal(calls.filter((call) => call.url.includes('deploy.json?')).length, 2);
  });
});

test('WP002C-S3A-003: preview identity mismatch prevents ACL and deploy writes', async () => {
  await withAppCreateTestEnvironment(async () => {
    const calls = [];
    const fetchMock = async (url, options = {}) => { calls.push({ url, options }); return mockResponse({ name: 'Wrong', revision: '2' }); };
    await assert.rejects(() => activateScoringConfigMasterLive(validLiveActivationAuthorization('s3a-003'), validLiveActivationRequest(), fetchMock), /STAGE3A_PREFLIGHT_FAILED/);
    assert.equal(calls.some((call) => ['PUT', 'POST'].includes(call.options.method)), false);
  });
});

test('WP002C-S3A-004: ACL update failure prevents deploy', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildActivationFetch({ aclPutOk: false });
    await assert.rejects(() => activateScoringConfigMasterLive(validLiveActivationAuthorization('s3a-004'), validLiveActivationRequest(), fetchMock), /ACL_UPDATE_FAILED/);
    assert.equal(calls.filter((call) => call.options.method === 'POST').length, 0);
  });
});

test('WP002C-S3A-005: uncertain deploy transport never retries POST and reconciles by GET', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildActivationFetch({ deployThrows: true, deployStatuses: ['PROCESSING', 'SUCCESS'] });
    const result = await activateScoringConfigMasterLive(validLiveActivationAuthorization('s3a-005'), validLiveActivationRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    assert.equal(result.deployStatus, 'SUCCESS');
    assert.equal(calls.filter((call) => call.options.method === 'POST').length, 1);
    assert.equal(calls.filter((call) => call.url.includes('deploy.json?')).length, 2);
  });
});

test('WP002C-S3A-005B: non-success deploy response fails without automatic retry', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildActivationFetch({ deployOk: false });
    await assert.rejects(
      () => activateScoringConfigMasterLive(validLiveActivationAuthorization('s3a-005b'), validLiveActivationRequest(), fetchMock),
      /DEPLOY_EXECUTION_FAILED: HTTP 400/
    );
    assert.equal(calls.filter((call) => call.options.method === 'POST').length, 1);
    assert.equal(calls.filter((call) => call.url.includes('deploy.json?')).length, 0);
  });
});

test('WP002C-S3A-006: FAIL and CANCEL deploy statuses fail closed', async () => {
  await withAppCreateTestEnvironment(async () => {
    for (const status of ['FAIL', 'CANCEL']) {
      const { fetchMock } = buildActivationFetch({ deployStatuses: [status] });
      await assert.rejects(() => activateScoringConfigMasterLive(validLiveActivationAuthorization(`s3a-006-${status}`), validLiveActivationRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} }), new RegExp(`Final status ${status}`));
    }
  });
});

test('WP002C-S3A-007: live identity mismatch fails closed after SUCCESS', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { fetchMock } = buildActivationFetch({ liveName: 'Wrong Live App' });
    await assert.rejects(() => activateScoringConfigMasterLive(validLiveActivationAuthorization('s3a-007'), validLiveActivationRequest(), fetchMock), /LIVE_APP_VERIFICATION_FAILED/);
  });
});

test('WP002C-S3A-008: live ACL mismatch fails closed and safety defaults remain locked', async () => {
  await withAppCreateTestEnvironment(async () => {
    const mismatchedAcl = { rights: [{ entity: { type: 'EVERYONE' }, appEditable: true }], revision: '3' };
    const { fetchMock } = buildActivationFetch({ liveAcl: mismatchedAcl });
    await assert.rejects(() => activateScoringConfigMasterLive(validLiveActivationAuthorization('s3a-008'), validLiveActivationRequest(), fetchMock), /LIVE_APP_VERIFICATION_FAILED/);
    assert.equal(DISCOVERY_MODE, true);
    assert.equal(WRITE_ALLOWED_APPS.length, 0);
  });
});

// ==========================================
// WP-002C STAGE-3C SCHEMA CONFIGURATION TESTS
// ==========================================

function validSchemaAuthorization(authorizationId) {
  return {
    workPackageId: 'MBO-P03-WP-002C',
    stage: 'STAGE_3C_SCHEMA_CONFIGURATION',
    explicitUserAuthorization: true,
    activeWindow: true,
    authorizationId
  };
}

function validSchemaRequest(overrides = {}) {
  return {
    workPackageId: 'MBO-P03-WP-002C',
    stage: 'STAGE_3C_SCHEMA_CONFIGURATION',
    appId: 796,
    appName: approvedAppName,
    operationSequence: ['FORM_FIELDS_ADD', 'APP_DEPLOY'],
    ...overrides
  };
}

function buildSchemaFetch({
  previewRevision = '3',
  liveRevision = '3',
  preflightPlannedFieldsExist = false,
  fieldPostOk = true,
  fieldPostThrows = false,
  fieldPostRevision = '4',
  previewReadbackFields = generateExact23FieldsPayload(),
  deployStatuses = ['SUCCESS'],
  deployThrows = false,
  deployOk = true,
  liveFields = generateExact23FieldsPayload(),
  liveAcl = creatorOnlyAclPayload('4')
} = {}) {
  const calls = [];
  let statusIndex = 0;
  const fetchMock = async (url, options = {}) => {
    calls.push({ url, options });
    if (url.endsWith('/k/v1/preview/app/settings.json?app=796')) {
      return mockResponse({ name: approvedAppName, revision: previewRevision });
    }
    if (url.endsWith('/k/v1/app/settings.json?app=796')) {
      return mockResponse({ name: approvedAppName, revision: liveRevision });
    }
    if (url.endsWith('/k/v1/app/acl.json?app=796')) {
      return mockResponse(creatorOnlyAclPayload(liveRevision));
    }
    if (url.endsWith('/k/v1/preview/app/acl.json?app=796') && options.method !== 'PUT') {
      return mockResponse(creatorOnlyAclPayload(previewRevision));
    }
    if (url.endsWith('/k/v1/app/form/fields.json?app=796')) {
      const getCalls = calls.filter(c => c.url.endsWith('/k/v1/app/form/fields.json?app=796'));
      if (getCalls.length === 1) {
        return preflightPlannedFieldsExist
          ? mockResponse({ properties: { Master_Record_Key: {} } })
          : mockResponse({ properties: {} });
      }
      return mockResponse({ properties: liveFields, revision: fieldPostRevision });
    }
    if (url.endsWith('/k/v1/preview/app/form/fields.json?app=796') && (options.method === undefined || options.method === 'GET')) {
      const getCalls = calls.filter(c => c.url.endsWith('/k/v1/preview/app/form/fields.json?app=796') && (c.options.method === undefined || c.options.method === 'GET'));
      if (getCalls.length === 1) {
        return preflightPlannedFieldsExist
          ? mockResponse({ properties: { Master_Record_Key: {} } })
          : mockResponse({ properties: {} });
      }
      return mockResponse({ properties: previewReadbackFields, revision: fieldPostRevision });
    }
    if (url.endsWith('/k/v1/preview/app/form/fields.json') && options.method === 'POST') {
      if (fieldPostThrows) throw new Error('mock field post transport error');
      return fieldPostOk
        ? mockResponse({ revision: fieldPostRevision })
        : mockResponse({}, { ok: false, status: 400 });
    }
    if (url.endsWith('/k/v1/preview/app/deploy.json') && options.method === 'POST') {
      if (deployThrows) throw new Error('mock deploy transport error');
      return mockResponse(undefined, { ok: deployOk, status: deployOk ? 200 : 400, parseError: true });
    }
    if (url.endsWith('/k/v1/preview/app/deploy.json?apps[0]=796')) {
      const status = deployStatuses[Math.min(statusIndex, deployStatuses.length - 1)];
      statusIndex += 1;
      return mockResponse({ apps: [{ app: '796', status }] });
    }
    throw new Error(`Unexpected mock URL: ${url}`);
  };
  return { calls, fetchMock };
}

test('WP002C-S3C-001: wrong WP rejected', () => {
  assert.throws(
    () => assertScoringMasterSchemaAuthorization(validSchemaAuthorization('s3c-001'), validSchemaRequest({ workPackageId: 'MBO-P03-WP-002B' })),
    /Work package must be exactly MBO-P03-WP-002C/
  );
});

test('WP002C-S3C-002: wrong App rejected', () => {
  assert.throws(
    () => assertScoringMasterSchemaAuthorization(validSchemaAuthorization('s3c-002'), validSchemaRequest({ appId: 794 })),
    /Target App ID must be exactly 796/
  );
});

test('WP002C-S3C-003: wrong stage rejected', () => {
  assert.throws(
    () => assertScoringMasterSchemaAuthorization(validSchemaAuthorization('s3c-003'), validSchemaRequest({ stage: 'STAGE_3A_LIVE_ACTIVATION' })),
    /Stage must be exactly STAGE_3C_SCHEMA_CONFIGURATION/
  );
});

test('WP002C-S3C-004: missing explicit authorization rejected', () => {
  assert.throws(
    () => assertScoringMasterSchemaAuthorization({ ...validSchemaAuthorization('s3c-004'), explicitUserAuthorization: false }, validSchemaRequest()),
    /Explicit authorization and active window are required/
  );
});

test('WP002C-S3C-005: repeated authorization ID rejected', () => {
  const auth = validSchemaAuthorization('s3c-005-replay');
  assert.equal(assertScoringMasterSchemaAuthorization(auth, validSchemaRequest()), true);
  assert.throws(
    () => assertScoringMasterSchemaAuthorization(auth, validSchemaRequest()),
    /Authorization has already been consumed/
  );
});

test('WP002C-S3C-006: operation sequence mismatch rejected', () => {
  assert.throws(
    () => assertScoringMasterSchemaAuthorization(validSchemaAuthorization('s3c-006'), validSchemaRequest({ operationSequence: ['APP_DEPLOY'] })),
    /Operation sequence must be FORM_FIELDS_ADD -> APP_DEPLOY/
  );
});

test('WP002C-S3C-007: manifest has exactly 23 unique field codes', () => {
  assert.equal(WP002C_23_FIELD_MANIFEST.length, 23);
  const codes = WP002C_23_FIELD_MANIFEST.map((f) => f.code);
  const uniqueCodes = new Set(codes);
  assert.equal(uniqueCodes.size, 23);
});

test('WP002C-S3C-008: every field type / required / unique flag matches authoritative contract', () => {
  const payload = generateExact23FieldsPayload();
  assert.equal(assertExact23FieldSchema(payload), true);
});

test('WP002C-S3C-009: Master_Record_Key.unique === true; all others not unique', () => {
  const payload = generateExact23FieldsPayload();
  assert.equal(payload.Master_Record_Key.unique, true);
  for (const [code, field] of Object.entries(payload)) {
    if (code !== 'Master_Record_Key' && field.unique !== undefined) {
      assert.equal(field.unique, false);
    }
  }
});

test('WP002C-S3C-010: Part A mode options exactly two and ordered correctly', () => {
  const payload = generateExact23FieldsPayload();
  const options = payload.Part_A_Scoring_Mode.options;
  const keys = Object.keys(options);
  assert.deepEqual(keys, ['0 DIFFICULTY_ACHIEVEMENT_MATRIX', '1 ACHIEVEMENT_DIRECT']);
  assert.equal(options['0 DIFFICULTY_ACHIEVEMENT_MATRIX'].index, '0');
  assert.equal(options['1 ACHIEVEMENT_DIRECT'].index, '1');
});

test('WP002C-S3C-011: Config status options exactly five and ordered correctly', () => {
  const payload = generateExact23FieldsPayload();
  const options = payload.Config_Status.options;
  const keys = Object.keys(options);
  assert.deepEqual(keys, ['0 DRAFT', '1 VALIDATED', '2 PUBLISHED', '3 SUPERSEDED', '4 RETIRED']);
  assert.equal(options['0 DRAFT'].index, '0');
  assert.equal(options['4 RETIRED'].index, '4');
});

test('WP002C-S3C-012: no unexpected/default business values in schema', () => {
  const payload = generateExact23FieldsPayload();
  for (const field of Object.values(payload)) {
    assert.equal(field.defaultValue, undefined);
  }
});

test('WP002C-S3C-013: preflight stops if any planned field already exists', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { fetchMock } = buildSchemaFetch({ preflightPlannedFieldsExist: true });
    await assert.rejects(
      () => configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-013'), validSchemaRequest(), fetchMock),
      /STAGE3C_PREFLIGHT_FAILED: Planned WP-002C schema fields already exist/
    );
  });
});

test('WP002C-S3C-014: field POST targets only App 796 and occurs at most once', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildSchemaFetch();
    const result = await configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-014'), validSchemaRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    assert.equal(result.appId, 796);
    assert.equal(result.fieldPostAttempts, 1);
    const fieldPosts = calls.filter((c) => c.url.endsWith('/k/v1/preview/app/form/fields.json') && c.options.method === 'POST');
    assert.equal(fieldPosts.length, 1);
    assert.equal(JSON.parse(fieldPosts[0].options.body).app, 796);
  });
});

test('WP002C-S3C-015: field POST uses exact numeric revision read from preflight', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildSchemaFetch({ previewRevision: '12' });
    await configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-015'), validSchemaRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    const fieldPosts = calls.filter((c) => c.url.endsWith('/k/v1/preview/app/form/fields.json') && c.options.method === 'POST');
    assert.equal(JSON.parse(fieldPosts[0].options.body).revision, '12');
  });
});

test('WP002C-S3C-016: field POST transport uncertainty causes GET-only reconciliation, never a POST retry', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildSchemaFetch({ fieldPostThrows: true });
    const result = await configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-016'), validSchemaRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    assert.equal(result.deployStatus, 'SUCCESS');
    const fieldPosts = calls.filter((c) => c.url.endsWith('/k/v1/preview/app/form/fields.json') && c.options.method === 'POST');
    assert.equal(fieldPosts.length, 1);
  });
});

test('WP002C-S3C-017: partial/mismatched preview readback stops before deploy', async () => {
  await withAppCreateTestEnvironment(async () => {
    const partialFields = { ...generateExact23FieldsPayload() };
    delete partialFields.Configuration_Hash;
    const { calls, fetchMock } = buildSchemaFetch({ previewReadbackFields: partialFields });
    await assert.rejects(
      () => configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-017'), validSchemaRequest(), fetchMock),
      /PREVIEW_SCHEMA_READBACK_FAILED/
    );
    const deployPosts = calls.filter((c) => c.url.endsWith('/k/v1/preview/app/deploy.json') && c.options.method === 'POST');
    assert.equal(deployPosts.length, 0);
  });
});

test('WP002C-S3C-018: deploy uses exact post-schema revision and occurs at most once', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildSchemaFetch({ fieldPostRevision: '15' });
    await configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-018'), validSchemaRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    const deployPosts = calls.filter((c) => c.url.endsWith('/k/v1/preview/app/deploy.json') && c.options.method === 'POST');
    assert.equal(deployPosts.length, 1);
    assert.equal(JSON.parse(deployPosts[0].options.body).apps[0].revision, '15');
  });
});

test('WP002C-S3C-019: deploy success does not require parsing a JSON body', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { fetchMock } = buildSchemaFetch({ deployOk: true });
    const result = await configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-019'), validSchemaRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    assert.equal(result.deployStatus, 'SUCCESS');
  });
});

test('WP002C-S3C-020: post-deploy success requires exact live field readback', async () => {
  await withAppCreateTestEnvironment(async () => {
    const incompleteLiveFields = { ...generateExact23FieldsPayload() };
    delete incompleteLiveFields.Master_Record_Key;
    const { fetchMock } = buildSchemaFetch({ liveFields: incompleteLiveFields });
    await assert.rejects(
      () => configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-020'), validSchemaRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} }),
      /LIVE_SCHEMA_VERIFICATION_FAILED/
    );
  });
});

test('WP002C-S3C-021: no write path to Apps 794/795 or protected Apps', () => {
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
  assert.throws(
    () => assertSandboxWriteTarget(794, undefined, []),
    /WRITE BLOCKED/
  );
  assert.throws(
    () => assertSandboxWriteTarget(795, undefined, []),
    /WRITE BLOCKED/
  );
  for (const protectedId of PROTECTED_APP_IDS) {
    assert.throws(
      () => assertSandboxWriteTarget(protectedId, undefined, [protectedId], { dryRunBypassDiscovery: true }),
      /PROTECTED PRODUCTION APP/
    );
  }
});

test('WP002C-S3C-022: no record/layout/view/process/customization/ACL/delete write path', () => {
  assert.throws(
    () => assertScoringMasterSchemaAuthorization(validSchemaAuthorization('s3c-022'), validSchemaRequest({ operationSequence: ['RECORD_CREATE'] })),
    /Operation sequence/
  );
  assert.throws(
    () => assertScoringMasterSchemaAuthorization(validSchemaAuthorization('s3c-022-b'), validSchemaRequest({ operationSequence: ['LAYOUT_UPDATE'] })),
    /Operation sequence/
  );
});
