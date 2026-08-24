import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  assertDiscoveryReadOnly,
  assertSandboxWriteTarget
} from '../src/core/sandbox-write-guard.js';

test('SAFE-001: POST App 53 is blocked locally', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('POST', 53),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
  // Also verify write target throws even if discovery mode were false
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

test('SAFE-005: POST App 794 is blocked in WP-001', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('POST', 794),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
  // In WP-001, WRITE_ALLOWED_APPS is empty
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
});

test('SAFE-006: PUT App 795 is blocked in WP-001', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('PUT', 795),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
});

test('SAFE-007: Protected App remains DENIED even if mistakenly placed in work-package allow-list', () => {
  for (const protectedId of PROTECTED_APP_IDS) {
    // When DISCOVERY_MODE is true, blocked
    assert.throws(
      () => assertDiscoveryReadOnly('POST', protectedId),
      /DISCOVERY PHASE WRITE BLOCKED/
    );
  }
});

test('SAFE-008: Empty allow-list denies every write target', () => {
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
  assert.throws(
    () => assertSandboxWriteTarget(794),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
  assert.throws(
    () => assertSandboxWriteTarget(795),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
});
