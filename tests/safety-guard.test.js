import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  assertDiscoveryReadOnly,
  assertSandboxWriteTarget,
  assertWorkPackageAuthorization
} from '../src/core/sandbox-write-guard.js';

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
