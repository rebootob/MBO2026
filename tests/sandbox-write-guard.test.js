import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_BLOCKED_APP_IDS,
  assertDiscoveryReadOnly,
  assertSandboxWriteTarget
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
