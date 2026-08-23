import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecordKey } from '../src/config/constants.js';

test('RecordKey: Preserves leading zeroes for standard employee code', () => {
  const key = buildRecordKey('FY2026', '0149');
  assert.equal(key, 'FY2026-0149');
});

test('RecordKey: Preserves multiple leading zeroes', () => {
  const key = buildRecordKey('FY2026', '0001');
  assert.equal(key, 'FY2026-0001');
});

test('RecordKey: Returns empty string if Employee Code is missing', () => {
  assert.equal(buildRecordKey('FY2026', ''), '');
  assert.equal(buildRecordKey('FY2026', null), '');
  assert.equal(buildRecordKey('FY2026', undefined), '');
});

test('RecordKey: Returns empty string if Fiscal Year is missing', () => {
  assert.equal(buildRecordKey('', '0149'), '');
  assert.equal(buildRecordKey(null, '0149'), '');
  assert.equal(buildRecordKey(undefined, '0149'), '');
});

test('RecordKey: Trims whitespace properly', () => {
  assert.equal(buildRecordKey(' FY2026 ', '  0149  '), 'FY2026-0149');
});
