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
  WP002C_SCHEMA_CONFIGURATION_STAGE,
  WP002C_SCHEMA_CONTRACT_ID,
  WP002C_SCHEMA_REPAIR_STAGE,
  WP002C_SCHEMA_REPAIR_CONTRACT_ID,
  assertScoringMasterDropdownRepairAuthorization
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
  configureAndDeployScoringMasterSchema,
  WP002C_DROPDOWN_REPAIR_PAYLOAD,
  assertKnownStage3cDefectSchema,
  repairScoringMasterDropdownSchema
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
    schemaContractId: WP002C_SCHEMA_CONTRACT_ID,
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
  assert.deepEqual(keys, ['DIFFICULTY_ACHIEVEMENT_MATRIX', 'ACHIEVEMENT_DIRECT']);
  assert.equal(options.DIFFICULTY_ACHIEVEMENT_MATRIX.index, '0');
  assert.equal(options.ACHIEVEMENT_DIRECT.index, '1');
});

test('WP002C-S3C-011: Config status options exactly five and ordered correctly', () => {
  const payload = generateExact23FieldsPayload();
  const options = payload.Config_Status.options;
  const keys = Object.keys(options);
  assert.deepEqual(keys, ['DRAFT', 'VALIDATED', 'PUBLISHED', 'SUPERSEDED', 'RETIRED']);
  assert.equal(options.DRAFT.index, '0');
  assert.equal(options.RETIRED.index, '4');
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
test('WP002C-S3C-023: prefixed drop-down labels are rejected by exact schema assertion', () => {
  const payload = generateExact23FieldsPayload();
  payload.Part_A_Scoring_Mode.options = {
    '0 DIFFICULTY_ACHIEVEMENT_MATRIX': { label: '0 DIFFICULTY_ACHIEVEMENT_MATRIX', index: '0' }
  };
  assert.throws(
    () => assertExact23FieldSchema(payload),
    /SCHEMA_VERIFICATION_FAILED: Field Part_A_Scoring_Mode/
  );
});

test('WP002C-S3C-024: missing or wrong schema contract ID is rejected', () => {
  const reqMissing = { ...validSchemaRequest() };
  delete reqMissing.schemaContractId;
  assert.throws(
    () => assertScoringMasterSchemaAuthorization(validSchemaAuthorization('s3c-024a'), reqMissing),
    /Schema contract ID must be exactly WP002C_23_FIELDS_V1/
  );
  assert.throws(
    () => assertScoringMasterSchemaAuthorization({ ...validSchemaAuthorization('s3c-024b'), schemaContractId: WP002C_SCHEMA_CONTRACT_ID }, { ...validSchemaRequest(), schemaContractId: 'WRONG_CONTRACT' }),
    /Schema contract ID must be exactly WP002C_23_FIELDS_V1/
  );
});

test('WP002C-S3C-025: preflight stops if 1 or 23 planned fields already exist in preview', async () => {
  await withAppCreateTestEnvironment(async () => {
    const fullFields = generateExact23FieldsPayload();
    const { fetchMock } = buildSchemaFetch({ previewReadbackFields: fullFields, preflightPlannedFieldsExist: true });
    await assert.rejects(
      () => configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-025'), validSchemaRequest(), fetchMock),
      /STAGE3C_PREFLIGHT_FAILED: Planned WP-002C schema fields already exist/
    );
  });
});
test('WP002C-S3C-026: exact-purpose client rejects missing/wrong request schema contract ID before fetch', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildSchemaFetch();
    const reqMissing = { ...validSchemaRequest() };
    delete reqMissing.schemaContractId;
    await assert.rejects(
      () => configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-026a'), reqMissing, fetchMock),
      /Schema contract ID must be exactly WP002C_23_FIELDS_V1/
    );
    assert.equal(calls.length, 0);

    const reqWrong = validSchemaRequest({ schemaContractId: 'WRONG' });
    await assert.rejects(
      () => configureAndDeployScoringMasterSchema(validSchemaAuthorization('s3c-026b'), reqWrong, fetchMock),
      /Schema contract ID must be exactly WP002C_23_FIELDS_V1/
    );
    assert.equal(calls.length, 0);
  });
});

test('WP002C-S3C-027: all 23 generated labels equal field codes', () => {
  const payload = generateExact23FieldsPayload();
  for (const [code, field] of Object.entries(payload)) {
    assert.equal(field.label, code);
  }
  assert.equal(assertExact23FieldSchema(payload), true);
});

test('WP002C-S3C-028: readback with one altered field label is rejected', () => {
  const payload = generateExact23FieldsPayload();
  payload.Master_Record_Key.label = 'Altered_Label';
  assert.throws(
    () => assertExact23FieldSchema(payload),
    /SCHEMA_VERIFICATION_FAILED: Field Master_Record_Key label mismatch/
  );
});
// ==========================================
// WP-002C STAGE 3C-R1 DROPDOWN REPAIR TESTS
// ==========================================

function validRepairAuthorization(authorizationId) {
  return {
    workPackageId: 'MBO-P03-WP-002C',
    stage: 'STAGE_3C_DROPDOWN_REPAIR',
    explicitUserAuthorization: true,
    activeWindow: true,
    authorizationId
  };
}

function validRepairRequest(overrides = {}) {
  return {
    workPackageId: 'MBO-P03-WP-002C',
    stage: 'STAGE_3C_DROPDOWN_REPAIR',
    appId: 796,
    appName: approvedAppName,
    repairContractId: WP002C_SCHEMA_REPAIR_CONTRACT_ID,
    operationSequence: ['FORM_FIELDS_UPDATE', 'APP_DEPLOY'],
    repairFieldCodes: ['Part_A_Scoring_Mode', 'Config_Status'],
    ...overrides
  };
}

function defectFieldsPayload() {
  const payload = generateExact23FieldsPayload();
  payload.Part_A_Scoring_Mode.options = {
    '0 DIFFICULTY_ACHIEVEMENT_MATRIX': { label: '0 DIFFICULTY_ACHIEVEMENT_MATRIX', index: '0' },
    '1 ACHIEVEMENT_DIRECT': { label: '1 ACHIEVEMENT_DIRECT', index: '1' }
  };
  payload.Config_Status.options = {
    '0 DRAFT': { label: '0 DRAFT', index: '0' },
    '1 VALIDATED': { label: '1 VALIDATED', index: '1' },
    '2 PUBLISHED': { label: '2 PUBLISHED', index: '2' },
    '3 SUPERSEDED': { label: '3 SUPERSEDED', index: '3' },
    '4 RETIRED': { label: '4 RETIRED', index: '4' }
  };
  return payload;
}

function buildRepairFetch({
  previewRevision = '3',
  liveRevision = '3',
  recordCount = 0,
  postPutRecordCount = 0,
  finalRecordCount = 0,
  liveFields = defectFieldsPayload(),
  previewFields = defectFieldsPayload(),
  putOk = true,
  putThrows = false,
  putRevision = '4',
  previewReadbackFields = generateExact23FieldsPayload(),
  deployStatuses = ['SUCCESS'],
  deployOk = true,
  finalLiveFields = generateExact23FieldsPayload(),
  appDetailOk = true,
  catalogOk = true
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
    if (url.endsWith('/k/v1/app.json?id=796')) {
      if (!appDetailOk) return mockResponse({ name: 'Wrong Name', appId: '796' });
      return mockResponse({ name: approvedAppName, appId: '796' });
    }
    if (url.includes('/k/v1/records.json?app=796')) {
      const getCalls = calls.filter(c => c.url.includes('/k/v1/records.json?app=796'));
      let count = recordCount;
      if (getCalls.length === 2) count = postPutRecordCount;
      if (getCalls.length >= 3) count = finalRecordCount;
      const records = count > 0 ? [{ $id: { value: '1' } }] : [];
      return mockResponse({ records });
    }
    if (url.endsWith('/k/v1/app/form/fields.json?app=796')) {
      const getCalls = calls.filter(c => c.url.endsWith('/k/v1/app/form/fields.json?app=796'));
      if (getCalls.length === 1) {
        return mockResponse({ properties: liveFields, revision: liveRevision });
      }
      return mockResponse({ properties: finalLiveFields, revision: putRevision });
    }
    if (url.endsWith('/k/v1/preview/app/form/fields.json?app=796') && (options.method === undefined || options.method === 'GET')) {
      const getCalls = calls.filter(c => c.url.endsWith('/k/v1/preview/app/form/fields.json?app=796') && (c.options.method === undefined || c.options.method === 'GET'));
      if (getCalls.length === 1) {
        return mockResponse({ properties: previewFields, revision: previewRevision });
      }
      return mockResponse({ properties: previewReadbackFields, revision: putRevision });
    }
    if (url.endsWith('/k/v1/preview/app/form/fields.json') && options.method === 'PUT') {
      if (putThrows) throw new Error('mock put transport error');
      return putOk
        ? mockResponse({ revision: putRevision })
        : mockResponse({}, { ok: false, status: 400 });
    }
    if (url.endsWith('/k/v1/preview/app/deploy.json') && options.method === 'POST') {
      return mockResponse(undefined, { ok: deployOk, status: deployOk ? 200 : 400, parseError: true });
    }
    if (url.endsWith('/k/v1/preview/app/deploy.json?apps[0]=796')) {
      const status = deployStatuses[Math.min(statusIndex, deployStatuses.length - 1)];
      statusIndex += 1;
      return mockResponse({ apps: [{ app: '796', status }] });
    }
    if (url.endsWith('/k/v1/apps.json?ids[0]=796')) {
      if (!catalogOk) return mockResponse({ apps: [] });
      return mockResponse({ apps: [{ appId: '796', app: '796', name: approvedAppName }] });
    }
    throw new Error(`Unexpected mock URL: ${url}`);
  };
  return { calls, fetchMock };
}

test('WP002C-S3CR1-001: wrong WP rejected', () => {
  assert.throws(
    () => assertScoringMasterDropdownRepairAuthorization(validRepairAuthorization('r1-001'), validRepairRequest({ workPackageId: 'MBO-P03-WP-002B' })),
    /Work package must be exactly MBO-P03-WP-002C/
  );
});

test('WP002C-S3CR1-002: wrong stage rejected', () => {
  assert.throws(
    () => assertScoringMasterDropdownRepairAuthorization(validRepairAuthorization('r1-002'), validRepairRequest({ stage: 'STAGE_3C_SCHEMA_CONFIGURATION' })),
    /Stage must be exactly STAGE_3C_DROPDOWN_REPAIR/
  );
});

test('WP002C-S3CR1-003: wrong App rejected', () => {
  assert.throws(
    () => assertScoringMasterDropdownRepairAuthorization(validRepairAuthorization('r1-003'), validRepairRequest({ appId: 794 })),
    /Target App ID must be exactly 796/
  );
});

test('WP002C-S3CR1-004: wrong name rejected', () => {
  assert.throws(
    () => assertScoringMasterDropdownRepairAuthorization(validRepairAuthorization('r1-004'), validRepairRequest({ appName: 'Wrong Name' })),
    /Target App name mismatch/
  );
});

test('WP002C-S3CR1-005: missing/wrong repair contract ID rejected before fetch', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildRepairFetch();
    const reqMissing = { ...validRepairRequest() };
    delete reqMissing.repairContractId;
    await assert.rejects(
      () => repairScoringMasterDropdownSchema(validRepairAuthorization('r1-005a'), reqMissing, fetchMock),
      /Repair contract ID must be exactly WP002C_2_DROPDOWN_REPAIR_V1/
    );
    assert.equal(calls.length, 0);

    const reqWrong = validRepairRequest({ repairContractId: 'WRONG' });
    await assert.rejects(
      () => repairScoringMasterDropdownSchema(validRepairAuthorization('r1-005b'), reqWrong, fetchMock),
      /Repair contract ID must be exactly WP002C_2_DROPDOWN_REPAIR_V1/
    );
    assert.equal(calls.length, 0);
  });
});

test('WP002C-S3CR1-006: missing explicit authorization rejected', () => {
  assert.throws(
    () => assertScoringMasterDropdownRepairAuthorization({ ...validRepairAuthorization('r1-006'), explicitUserAuthorization: false }, validRepairRequest()),
    /Explicit authorization and active window are required/
  );
});

test('WP002C-S3CR1-007: reused authorization ID rejected', () => {
  const auth = validRepairAuthorization('r1-007-replay');
  assert.equal(assertScoringMasterDropdownRepairAuthorization(auth, validRepairRequest()), true);
  assert.throws(
    () => assertScoringMasterDropdownRepairAuthorization(auth, validRepairRequest()),
    /Authorization has already been consumed/
  );
});

test('WP002C-S3CR1-008: operation sequence mismatch rejected', () => {
  assert.throws(
    () => assertScoringMasterDropdownRepairAuthorization(validRepairAuthorization('r1-008'), validRepairRequest({ operationSequence: ['APP_DEPLOY'] })),
    /Operation sequence must be FORM_FIELDS_UPDATE -> APP_DEPLOY/
  );
});

test('WP002C-S3CR1-009: repair field list must be exactly the two approved fields', () => {
  assert.throws(
    () => assertScoringMasterDropdownRepairAuthorization(validRepairAuthorization('r1-009'), validRepairRequest({ repairFieldCodes: ['Part_A_Scoring_Mode'] })),
    /Repair field codes must be exactly/
  );
});

test('WP002C-S3CR1-010: generated repair payload contains exactly two properties', () => {
  const keys = Object.keys(WP002C_DROPDOWN_REPAIR_PAYLOAD);
  assert.deepEqual(keys, ['Part_A_Scoring_Mode', 'Config_Status']);
});

test('WP002C-S3CR1-011: repair payload has no record/ACL/layout/view/process/customization/delete operation', () => {
  assert.throws(
    () => assertScoringMasterDropdownRepairAuthorization(validRepairAuthorization('r1-011'), validRepairRequest({ operationSequence: ['RECORD_CREATE'] })),
    /Operation sequence/
  );
});

test('WP002C-S3CR1-012: repair payload uses raw domain values and exact indexes', () => {
  const partA = WP002C_DROPDOWN_REPAIR_PAYLOAD.Part_A_Scoring_Mode.options;
  assert.deepEqual(Object.keys(partA), ['DIFFICULTY_ACHIEVEMENT_MATRIX', 'ACHIEVEMENT_DIRECT']);
  assert.equal(partA.DIFFICULTY_ACHIEVEMENT_MATRIX.index, '0');
  assert.equal(partA.ACHIEVEMENT_DIRECT.index, '1');

  const cfg = WP002C_DROPDOWN_REPAIR_PAYLOAD.Config_Status.options;
  assert.deepEqual(Object.keys(cfg), ['DRAFT', 'VALIDATED', 'PUBLISHED', 'SUPERSEDED', 'RETIRED']);
  assert.equal(cfg.DRAFT.index, '0');
  assert.equal(cfg.RETIRED.index, '4');
});

test('WP002C-S3CR1-013: known-defect verifier accepts only exact prefixed defect', () => {
  const defect = defectFieldsPayload();
  assert.equal(assertKnownStage3cDefectSchema(defect), true);
});

test('WP002C-S3CR1-014: arbitrary third option / missing option / wrong index rejected', () => {
  const badOption = defectFieldsPayload();
  badOption.Part_A_Scoring_Mode.options['2 OTHER'] = { label: '2 OTHER', index: '2' };
  assert.throws(() => assertKnownStage3cDefectSchema(badOption), /UNEXPECTED_SCHEMA_DRIFT/);
});

test('WP002C-S3CR1-015: drift in any unaffected field rejected', () => {
  const badField = defectFieldsPayload();
  delete badField.Master_Record_Key;
  assert.throws(() => assertKnownStage3cDefectSchema(badField), /UNEXPECTED_SCHEMA_DRIFT/);
});

test('WP002C-S3CR1-016: already-corrected schema produces no PUT/deploy', async () => {
  await withAppCreateTestEnvironment(async () => {
    const corrected = generateExact23FieldsPayload();
    const { calls, fetchMock } = buildRepairFetch({ liveFields: corrected, previewFields: corrected });
    await assert.rejects(
      () => repairScoringMasterDropdownSchema(validRepairAuthorization('r1-016'), validRepairRequest(), fetchMock),
      /REPAIR_ALREADY_APPLIED_REQUIRES_RECONCILIATION/
    );
    const puts = calls.filter(c => c.options.method === 'PUT');
    assert.equal(puts.length, 0);
  });
});

test('WP002C-S3CR1-017: record count nonzero prevents PUT', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildRepairFetch({ recordCount: 1 });
    await assert.rejects(
      () => repairScoringMasterDropdownSchema(validRepairAuthorization('r1-017'), validRepairRequest(), fetchMock),
      /Record count is non-zero/
    );
    const puts = calls.filter(c => c.options.method === 'PUT');
    assert.equal(puts.length, 0);
  });
});

test('WP002C-S3CR1-018: PUT uses exact current numeric preview revision', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildRepairFetch({ previewRevision: '14' });
    await repairScoringMasterDropdownSchema(validRepairAuthorization('r1-018'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    const puts = calls.filter(c => c.url.endsWith('/k/v1/preview/app/form/fields.json') && c.options.method === 'PUT');
    assert.equal(JSON.parse(puts[0].options.body).revision, '14');
  });
});

test('WP002C-S3CR1-019: PUT occurs maximum once', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildRepairFetch();
    const result = await repairScoringMasterDropdownSchema(validRepairAuthorization('r1-019'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    assert.equal(result.putAttempts, 1);
    const puts = calls.filter(c => c.url.endsWith('/k/v1/preview/app/form/fields.json') && c.options.method === 'PUT');
    assert.equal(puts.length, 1);
  });
});

test('WP002C-S3CR1-020: PUT transport uncertainty never retries and uses GET-only reconciliation', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildRepairFetch({ putThrows: true });
    const result = await repairScoringMasterDropdownSchema(validRepairAuthorization('r1-020'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    assert.equal(result.deployStatus, 'SUCCESS');
    const puts = calls.filter(c => c.url.endsWith('/k/v1/preview/app/form/fields.json') && c.options.method === 'PUT');
    assert.equal(puts.length, 1);
  });
});

test('WP002C-S3CR1-021: PUT explicit HTTP failure prevents deploy', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildRepairFetch({ putOk: false });
    await assert.rejects(
      () => repairScoringMasterDropdownSchema(validRepairAuthorization('r1-021'), validRepairRequest(), fetchMock),
      /REPAIR_PUT_EXECUTION_FAILED/
    );
    const deploys = calls.filter(c => c.url.endsWith('/k/v1/preview/app/deploy.json') && c.options.method === 'POST');
    assert.equal(deploys.length, 0);
  });
});

test('WP002C-S3CR1-022: preview corrected 23/23 exact read-back required before deploy', async () => {
  await withAppCreateTestEnvironment(async () => {
    const brokenReadback = generateExact23FieldsPayload();
    brokenReadback.Master_Record_Key.label = 'Wrong';
    const { calls, fetchMock } = buildRepairFetch({ previewReadbackFields: brokenReadback });
    await assert.rejects(
      () => repairScoringMasterDropdownSchema(validRepairAuthorization('r1-022'), validRepairRequest(), fetchMock),
      /PREVIEW_REPAIR_READBACK_FAILED/
    );
    const deploys = calls.filter(c => c.url.endsWith('/k/v1/preview/app/deploy.json') && c.options.method === 'POST');
    assert.equal(deploys.length, 0);
  });
});

test('WP002C-S3CR1-023: deploy uses exact post-PUT revision and occurs maximum once', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildRepairFetch({ putRevision: '18' });
    await repairScoringMasterDropdownSchema(validRepairAuthorization('r1-023'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    const deploys = calls.filter(c => c.url.endsWith('/k/v1/preview/app/deploy.json') && c.options.method === 'POST');
    assert.equal(deploys.length, 1);
    assert.equal(JSON.parse(deploys[0].options.body).apps[0].revision, '18');
  });
});

test('WP002C-S3CR1-024: deploy empty success body is not parsed', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { fetchMock } = buildRepairFetch({ deployOk: true });
    const result = await repairScoringMasterDropdownSchema(validRepairAuthorization('r1-024'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    assert.equal(result.deployStatus, 'SUCCESS');
  });
});

test('WP002C-S3CR1-025: final success requires exact live 23/23 corrected read-back', async () => {
  await withAppCreateTestEnvironment(async () => {
    const brokenLive = generateExact23FieldsPayload();
    brokenLive.Config_Status.label = 'Bad';
    const { fetchMock } = buildRepairFetch({ finalLiveFields: brokenLive });
    await assert.rejects(
      () => repairScoringMasterDropdownSchema(validRepairAuthorization('r1-025'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} }),
      /LIVE_SCHEMA_VERIFICATION_FAILED/
    );
  });
});

test('WP002C-S3CR1-026: ACL must remain creator-only/default-deny', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { result } = await (async () => {
      const { fetchMock } = buildRepairFetch();
      const res = await repairScoringMasterDropdownSchema(validRepairAuthorization('r1-026'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
      return { result: res };
    })();
    assert.equal(result.liveAclStatus, 'CREATOR_ONLY');
  });
});

test('WP002C-S3CR1-027: protected Apps and 794/795 remain unwritable', () => {
  assert.throws(() => assertSandboxWriteTarget(794, undefined, []), /WRITE BLOCKED/);
  assert.throws(() => assertSandboxWriteTarget(795, undefined, []), /WRITE BLOCKED/);
  for (const protectedId of PROTECTED_APP_IDS) {
    assert.throws(
      () => assertSandboxWriteTarget(protectedId, undefined, [protectedId], { dryRunBypassDiscovery: true }),
      /PROTECTED PRODUCTION APP/
    );
  }
});

test('WP002C-S3CR1-028: DISCOVERY_MODE and WRITE_ALLOWED_APPS remain unchanged', () => {
  assert.equal(DISCOVERY_MODE, true);
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
});
test('WP002C-S3CR1-029: known defect rejects wrong Part A option label', () => {
  const badDefect = defectFieldsPayload();
  badDefect.Part_A_Scoring_Mode.options['0 DIFFICULTY_ACHIEVEMENT_MATRIX'].label = 'Wrong Label';
  assert.throws(() => assertKnownStage3cDefectSchema(badDefect), /UNEXPECTED_SCHEMA_DRIFT/);
});

test('WP002C-S3CR1-030: known defect rejects wrong Config_Status option label', () => {
  const badDefect = defectFieldsPayload();
  badDefect.Config_Status.options['2 PUBLISHED'].label = 'Wrong Label';
  assert.throws(() => assertKnownStage3cDefectSchema(badDefect), /UNEXPECTED_SCHEMA_DRIFT/);
});

test('WP002C-S3CR1-031: known defect rejects every wrong Config_Status index, including middle options', () => {
  const badDefect = defectFieldsPayload();
  badDefect.Config_Status.options['2 PUBLISHED'].index = '3';
  assert.throws(() => assertKnownStage3cDefectSchema(badDefect), /UNEXPECTED_SCHEMA_DRIFT/);
});

test('WP002C-S3CR1-032: known defect rejects unexpected defaultValue on any field', () => {
  const badDefect = defectFieldsPayload();
  badDefect.PartA_Weight.defaultValue = '100';
  assert.throws(() => assertKnownStage3cDefectSchema(badDefect), /UNEXPECTED_SCHEMA_DRIFT/);
});

test('WP002C-S3CR1-033: repair payload nested option objects cannot be mutated', () => {
  assert.equal(Object.isFrozen(WP002C_DROPDOWN_REPAIR_PAYLOAD), true);
  assert.equal(Object.isFrozen(WP002C_DROPDOWN_REPAIR_PAYLOAD.Part_A_Scoring_Mode), true);
  assert.equal(Object.isFrozen(WP002C_DROPDOWN_REPAIR_PAYLOAD.Part_A_Scoring_Mode.options), true);
  assert.equal(Object.isFrozen(WP002C_DROPDOWN_REPAIR_PAYLOAD.Part_A_Scoring_Mode.options.DIFFICULTY_ACHIEVEMENT_MATRIX), true);
  assert.equal(Object.isFrozen(WP002C_DROPDOWN_REPAIR_PAYLOAD.Config_Status.options.PUBLISHED), true);
});

test('WP002C-S3CR1-034: post-PUT nonzero record result prevents deploy', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { calls, fetchMock } = buildRepairFetch({ postPutRecordCount: 1 });
    await assert.rejects(
      () => repairScoringMasterDropdownSchema(validRepairAuthorization('r1-034'), validRepairRequest(), fetchMock),
      /PREVIEW_REPAIR_READBACK_FAILED: Post-PUT record count is non-zero/
    );
    const deploys = calls.filter(c => c.url.endsWith('/k/v1/preview/app/deploy.json') && c.options.method === 'POST');
    assert.equal(deploys.length, 0);
  });
});

test('WP002C-S3CR1-035: final App Detail mismatch fails success', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { fetchMock } = buildRepairFetch({ appDetailOk: false });
    await assert.rejects(
      repairScoringMasterDropdownSchema(validRepairAuthorization('r1-035'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} }),
      /LIVE_SCHEMA_VERIFICATION_FAILED: Live App Detail identity mismatch/
    );
  });
});

test('WP002C-S3CR1-036: Get Apps missing App 796 fails success', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { fetchMock } = buildRepairFetch({ catalogOk: false });
    await assert.rejects(
      repairScoringMasterDropdownSchema(validRepairAuthorization('r1-036'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} }),
      /LIVE_SCHEMA_VERIFICATION_FAILED: Catalog missing App 796/
    );
  });
});

test('WP002C-S3CR1-037: final nonzero record result fails success', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { fetchMock } = buildRepairFetch({ finalRecordCount: 1 });
    await assert.rejects(
      repairScoringMasterDropdownSchema(validRepairAuthorization('r1-037'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} }),
      /LIVE_SCHEMA_VERIFICATION_FAILED: Final live record count is non-zero/
    );
  });
});

test('WP002C-S3CR1-038: final successful result requires catalog + final zero-record gates', async () => {
  await withAppCreateTestEnvironment(async () => {
    const { fetchMock } = buildRepairFetch();
    const result = await repairScoringMasterDropdownSchema(validRepairAuthorization('r1-038'), validRepairRequest(), fetchMock, { pollDelayMs: 0, sleep: async () => {} });
    assert.equal(result.semanticState, 'DOMAIN_ALIGNED');
    assert.equal(result.liveFieldCount, 23);
  });
});
