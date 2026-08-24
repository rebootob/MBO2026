import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getJapaneseFiscalYear,
  normalizeEmployeeCode,
  generateRecordKey,
  isValidRecordKeyFormat,
  isValidEmployeeCode
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

test('ANNUAL-003: Employee Code strictly preserves string leading zeros and enforces canonical character set (DEF-001, DEF-005)', () => {
  // Allowed canonical formats
  assert.equal(normalizeEmployeeCode('0149'), '0149');
  assert.equal(normalizeEmployeeCode('A0149'), 'A0149');
  assert.equal(normalizeEmployeeCode('01-49'), '01-49');
  assert.equal(normalizeEmployeeCode('EMP_999'), 'EMP_999');

  assert.equal(isValidEmployeeCode('0149'), true);
  assert.equal(isValidEmployeeCode('A0149'), true);
  assert.equal(isValidEmployeeCode('01-49'), true);

  // Rejected non-string inputs (DEF-001)
  assert.throws(() => normalizeEmployeeCode(149), /Employee Code must be a string/);
  assert.throws(() => normalizeEmployeeCode(null), /cannot be null or undefined/);
  assert.throws(() => normalizeEmployeeCode(''), /Employee Code cannot be empty/);
  assert.throws(() => normalizeEmployeeCode('   '), /Employee Code cannot be empty/);

  // Rejected illegal character formats (DEF-005)
  assert.throws(() => normalizeEmployeeCode('01 49'), /Invalid Employee Code format/);
  assert.throws(() => normalizeEmployeeCode('01/49'), /Invalid Employee Code format/);
  assert.throws(() => normalizeEmployeeCode('01#49'), /Invalid Employee Code format/);

  assert.equal(isValidEmployeeCode('01 49'), false);
  assert.equal(isValidEmployeeCode('01/49'), false);
  assert.equal(isValidEmployeeCode(149), false);
});

test('ANNUAL-004: Record Key generation produces exact {Fiscal_Year}-{Employee_Code} and validates format contract (DEF-002, DEF-005)', () => {
  const recordKey = generateRecordKey('FY2027', '0149');
  assert.equal(recordKey, 'FY2027-0149');
  assert.equal(isValidRecordKeyFormat(recordKey), true);

  // Case normalization for valid format
  assert.equal(generateRecordKey('fy2027', '0149'), 'FY2027-0149');

  // Generator guarantees returned key matches isValidRecordKeyFormat
  assert.equal(isValidRecordKeyFormat(generateRecordKey('FY2027', 'A0149')), true);
  assert.equal(isValidRecordKeyFormat(generateRecordKey('FY2027', '01-49')), true);

  // Rejects invalid Fiscal Year format
  assert.throws(() => generateRecordKey('HELLO', '0149'), /Invalid Fiscal Year format/);
  assert.throws(() => generateRecordKey('FY27', '0149'), /Invalid Fiscal Year format/);
  assert.throws(() => generateRecordKey('', '0149'), /Fiscal Year is required/);

  // Rejects incompatible employee code (DEF-005)
  assert.throws(() => generateRecordKey('FY2027', '01 49'), /Invalid Employee Code format/);
  assert.throws(() => generateRecordKey('FY2027', '01/49'), /Invalid Employee Code format/);
  assert.throws(() => generateRecordKey('FY2027', 149), /Employee Code must be a string/);
});

test('ANNUAL-005: Input validation tests for Fiscal Year and Employee Code (DEF-003)', () => {
  assert.throws(() => generateRecordKey(null, '0149'), /Fiscal Year is required/);
  assert.throws(() => generateRecordKey('FY2027', '   '), /Employee Code cannot be empty/);
  assert.equal(isValidRecordKeyFormat(''), false);
  assert.equal(isValidRecordKeyFormat(null), false);
  assert.equal(isValidRecordKeyFormat('INVALID_FORMAT'), false);
  assert.equal(isValidRecordKeyFormat('FY2027-01 49'), false);
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

test('ANNUAL-007: App 794 default-deny write guard prevents writes during WP-001 (WRITE_ALLOWED_APPS is empty) (DEF-003)', () => {
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

test('ANNUAL-010: Strict calendar date & timestamp validation rejects invalid dates and invalid time components (DEF-002, DEF-006)', () => {
  // Invalid Month
  assert.throws(() => getJapaneseFiscalYear('2027-13-01'), /Invalid month: 13/);
  assert.throws(() => getJapaneseFiscalYear('2027-00-01'), /Invalid month: 0/);

  // Invalid Day
  assert.throws(() => getJapaneseFiscalYear('2027-02-31'), /Invalid day: 31/);
  assert.throws(() => getJapaneseFiscalYear('2027-04-00'), /Invalid day: 0/);
  assert.throws(() => getJapaneseFiscalYear('2027-04-31'), /Invalid day: 31/); // April has 30 days

  // Invalid Timestamps (DEF-006)
  assert.throws(() => getJapaneseFiscalYear('2027-04-01T99:99:99'), /Invalid hour: 99/);
  assert.throws(() => getJapaneseFiscalYear('2027-04-01T25:70:80+07:00'), /Invalid hour: 25/);
  assert.throws(() => getJapaneseFiscalYear('2027-04-01T12:99:00'), /Invalid minute: 99/);
  assert.throws(() => getJapaneseFiscalYear('2027-04-01T12:00:99'), /Invalid second: 99/);

  // Trailing garbage / Invalid format
  assert.throws(() => getJapaneseFiscalYear('2027-04-01abc'), /Invalid date format/);
  assert.throws(() => getJapaneseFiscalYear('invalid-date'), /Invalid date format/);
  assert.throws(() => getJapaneseFiscalYear(null), /Date input cannot be null/);
});
