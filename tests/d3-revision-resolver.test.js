import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveRevisionNumber } from '../src/services/d3-revision-resolver.js';

// ── $revision authority ──────────────────────────────────────────────

test('R1: $revision only resolves revision correctly', () => {
  const record = { $revision: { value: '10' } };
  assert.equal(resolveRevisionNumber(record), 10);
});

test('R1: $revision preferred over legacy custom revision fields', () => {
  const record = {
    $revision: { value: '10' },
    Revision_Number: { value: '99' },
    Current_Revision_Number: { value: '77' }
  };
  assert.equal(resolveRevisionNumber(record), 10);
});

// ── legacy fallbacks ──────────────────────────────────────────────────

test('R1: legacy Revision_Number fallback works when $revision absent', () => {
  const record = { Revision_Number: { value: '3' } };
  assert.equal(resolveRevisionNumber(record), 3);
});

test('R1: legacy Current_Revision_Number fallback works when $revision and Revision_Number absent', () => {
  const record = { Current_Revision_Number: { value: '5' } };
  assert.equal(resolveRevisionNumber(record), 5);
});

// ── fail-closed ──────────────────────────────────────────────────────

test('R1: invalid revision value fails closed', () => {
  const record = { $revision: { value: 'not-a-number' } };
  assert.throws(() => resolveRevisionNumber(record), /PROVENANCE_INVALID/);
});

test('R1: zero revision fails closed', () => {
  const record = { $revision: { value: '0' } };
  assert.throws(() => resolveRevisionNumber(record), /PROVENANCE_INVALID/);
});

test('R1: negative revision fails closed', () => {
  const record = { $revision: { value: '-1' } };
  assert.throws(() => resolveRevisionNumber(record), /PROVENANCE_INVALID/);
});

test('R1: missing all revision authorities fails closed', () => {
  const record = { Record_Key: { value: 'X' } };
  assert.throws(() => resolveRevisionNumber(record), /PROVENANCE_INVALID/);
});

test('R1: raw (unwrapped) $revision primitive also resolves', () => {
  const record = { $revision: '7' };
  assert.equal(resolveRevisionNumber(record), 7);
});
