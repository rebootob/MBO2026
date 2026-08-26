import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_BLOCKED_APP_IDS,
  assertDiscoveryReadOnly,
  assertSandboxWriteTarget,
  assertScoringMasterSupersessionAuthorization
} from '../src/core/sandbox-write-guard.js';

test('Discovery Mode Hard Write Lock is Active', () => {
  assert.equal(DISCOVERY_MODE, true);
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(53));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(283));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(305));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(307));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(310));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(640));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(643));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(715));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(716));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(794));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(795));
});

test('assertDiscoveryReadOnly allows GET operations', () => {
  assert.doesNotThrow(() => assertDiscoveryReadOnly('GET', 794));
  assert.doesNotThrow(() => assertDiscoveryReadOnly('get', 53));
});

test('assertDiscoveryReadOnly blocks POST, PUT, and DELETE operations', () => {
  assert.throws(() => assertDiscoveryReadOnly('POST', 794), /DISCOVERY PHASE WRITE BLOCKED/);
  assert.throws(() => assertDiscoveryReadOnly('PUT', 795), /DISCOVERY PHASE WRITE BLOCKED/);
  assert.throws(() => assertDiscoveryReadOnly('DELETE', 794), /DISCOVERY PHASE WRITE BLOCKED/);
});

test('assertSandboxWriteTarget blocks all writes when DISCOVERY_MODE is true', () => {
  assert.throws(() => assertSandboxWriteTarget(794), /DISCOVERY PHASE WRITE BLOCKED/);
  assert.throws(() => assertSandboxWriteTarget(795), /DISCOVERY PHASE WRITE BLOCKED/);
  assert.throws(() => assertSandboxWriteTarget(53), /PROTECTED PRODUCTION APP/);
  assert.throws(() => assertSandboxWriteTarget(283), /PROTECTED PRODUCTION APP/);
});

test('assertScoringMasterSupersessionAuthorization enforces strict security gates', () => {
  const validAuth = {
    workPackageId: 'MBO-P03-WP-002C',
    activeWindow: true,
    explicitUserAuthorization: true,
    prewriteBackupVerified: true,
    authorizationId: 'AUTH_SUPERSEDE_001'
  };

  const validReq = {
    workPackageId: 'MBO-P03-WP-002C',
    operation: 'SCORING_CONFIG_SUPERSEDE_AND_PUBLISH',
    appId: 796,
    predecessorRecordId: '6',
    predecessorVersion: 'v1.0.0',
    newRecordId: '10',
    newVersion: 'v1.1.0'
  };

  // Valid authorization passes and registers consumed ID
  assert.equal(assertScoringMasterSupersessionAuthorization({ ...validAuth }, { ...validReq }), true);

  // Replay attempt fails
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth }, { ...validReq }),
    /SCORING SUPERSESSION BLOCKED: Authorization has already been consumed/
  );

  // Missing explicitUserAuthorization fails
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization(
      { ...validAuth, authorizationId: 'AUTH_002', explicitUserAuthorization: false },
      { ...validReq }
    ),
    /SCORING SUPERSESSION BLOCKED: Explicit user authorization is required/
  );

  // Inactive window fails
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization(
      { ...validAuth, authorizationId: 'AUTH_003', activeWindow: false },
      { ...validReq }
    ),
    /SCORING SUPERSESSION BLOCKED: One-time write window is CLOSED/
  );

  // Missing backup verification fails
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization(
      { ...validAuth, authorizationId: 'AUTH_004', prewriteBackupVerified: false },
      { ...validReq }
    ),
    /SCORING SUPERSESSION BLOCKED: Pre-write backup evidence must be verified/
  );

  // Same record ID fails
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization(
      { ...validAuth, authorizationId: 'AUTH_005' },
      { ...validReq, predecessorRecordId: '10', newRecordId: '10' }
    ),
    /SCORING SUPERSESSION BLOCKED: Predecessor record ID and new record ID must be different/
  );
});
