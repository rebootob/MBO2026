import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getJapaneseFiscalYear,
  normalizeEmployeeCode,
  generateRecordKey,
  isValidRecordKeyFormat
} from '../src/core/fiscal-year-engine.js';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  assertDiscoveryReadOnly,
  assertSandboxWriteTarget
} from '../src/core/sandbox-write-guard.js';

test('ANNUAL-001: Japanese FY before Apr 1 resolves to previous calendar year (2027-03-31 -> FY2026)', () => {
  assert.equal(getJapaneseFiscalYear('2027-03-31'), 'FY2026');
  assert.equal(getJapaneseFiscalYear('2027-01-01'), 'FY2026');
  assert.equal(getJapaneseFiscalYear('2027-03-31T23:59:59Z'), 'FY2026');
});

test('ANNUAL-002: Japanese FY on and after Apr 1 resolves to current calendar year (2027-04-01, 2027-12-31, 2028-03-31 -> FY2027; 2028-04-01 -> FY2028)', () => {
  assert.equal(getJapaneseFiscalYear('2027-04-01'), 'FY2027');
  assert.equal(getJapaneseFiscalYear('2027-12-31'), 'FY2027');
  assert.equal(getJapaneseFiscalYear('2028-03-31'), 'FY2027');
  assert.equal(getJapaneseFiscalYear('2028-04-01'), 'FY2028');
});

test('ANNUAL-003: Employee Code strictly preserves leading zeros as string (0149 -> "0149")', () => {
  const code = '0149';
  const normalized = normalizeEmployeeCode(code);
  assert.equal(normalized, '0149');
  assert.equal(typeof normalized, 'string');
  assert.notEqual(normalized, '149');
});

test('ANNUAL-004: Record Key generation produces exact {Fiscal_Year}-{Employee_Code} (FY2027-0149)', () => {
  const recordKey = generateRecordKey('FY2027', '0149');
  assert.equal(recordKey, 'FY2027-0149');
  assert.equal(isValidRecordKeyFormat(recordKey), true);
  assert.equal(isValidRecordKeyFormat('FY2027-149'), true);
  assert.equal(isValidRecordKeyFormat('INVALID_KEY'), false);
});

test('ANNUAL-005: Record Key duplicate protection design validation', () => {
  // Verifies error thrown on missing or invalid inputs
  assert.throws(() => generateRecordKey('', '0149'), /Fiscal Year is required/);
  assert.throws(() => generateRecordKey('FY2027', ''), /Employee Code cannot be empty/);
  assert.throws(() => normalizeEmployeeCode(null), /cannot be null/);
});

test('ANNUAL-006: App 53 remains strictly read-only', () => {
  assert.throws(
    () => assertDiscoveryReadOnly('POST', 53),
    /DISCOVERY PHASE WRITE BLOCKED/
  );
  assert.throws(
    () => assertSandboxWriteTarget(53, undefined, [53]),
    /permanent PROTECTED PRODUCTION APP/
  );
});

test('ANNUAL-007: App 794 expected schema diff is strictly zero (WRITE_ALLOWED_APPS is empty)', () => {
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
  assert.throws(
    () => assertSandboxWriteTarget(794, undefined, WRITE_ALLOWED_APPS),
    /WRITE BLOCKED/
  );
});

test('ANNUAL-008: App 795 remains unchanged (Deny)', () => {
  assert.throws(
    () => assertSandboxWriteTarget(795, undefined, WRITE_ALLOWED_APPS),
    /WRITE BLOCKED/
  );
});

test('ANNUAL-009: Protected legacy apps remain unchanged (Hard Deny)', () => {
  for (const id of PROTECTED_APP_IDS) {
    assert.throws(
      () => assertSandboxWriteTarget(id, undefined, [id]),
      /permanent PROTECTED PRODUCTION APP/
    );
  }
});
