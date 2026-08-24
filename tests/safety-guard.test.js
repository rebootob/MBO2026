import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  assertDiscoveryReadOnly,
  assertAppCreationAuthorization,
  assertSandboxWriteTarget,
  assertWorkPackageAuthorization
} from '../src/core/sandbox-write-guard.js';
import {
  assertAppCreationRequestPreflight,
  getAppCreationConnection,
  kintoneRequest
} from '../src/core/kintone-client.js';

const approvedAppName = 'MBO Profile & Scoring Configuration Master [Sandbox]';

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
