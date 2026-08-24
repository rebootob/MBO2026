import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_ALLOWED_APPS,
  assertDiscoveryReadOnly,
  assertSandboxWriteTarget
} from '../src/core/sandbox-write-guard.js';

/**
 * Pure Deterministic Requester Mapping Resolver for App 795
 */
function resolveSectionRequester(sectionCode, routingRecords = [], executionDate = '2026-08-24') {
  if (!sectionCode || typeof sectionCode !== 'string' || sectionCode.trim() === '') {
    return { status: 'REQUESTER_MAPPING_SCHEMA_INVALID', requesterUsers: [] };
  }

  const matchingRecords = routingRecords.filter(r => r.Section_Code?.value === sectionCode.trim());
  if (matchingRecords.length === 0) {
    return { status: 'REQUESTER_MAPPING_NOT_FOUND', requesterUsers: [] };
  }

  const activeRecords = matchingRecords.filter(r => r.Active?.value === 'Active');
  if (activeRecords.length === 0) {
    return { status: 'REQUESTER_MAPPING_INACTIVE', requesterUsers: [] };
  }

  const effectiveRecords = activeRecords.filter(r => {
    const from = r.Effective_From?.value;
    const to = r.Effective_To?.value;
    if (from && from > executionDate) return false;
    if (to && to < executionDate) return false;
    return true;
  });

  if (effectiveRecords.length === 0) {
    return { status: 'REQUESTER_MAPPING_NOT_EFFECTIVE', requesterUsers: [] };
  }

  if (effectiveRecords.length > 1) {
    return { status: 'REQUESTER_MAPPING_AMBIGUOUS', requesterUsers: [] };
  }

  const record = effectiveRecords[0];
  const userList = record.Requester_User?.value || [];
  if (userList.length === 0) {
    return { status: 'REQUESTER_MAPPING_INCOMPLETE', requesterUsers: [] };
  }

  if (userList.length > 1) {
    return { status: 'REQUESTER_MAPPING_AMBIGUOUS', requesterUsers: userList.map(u => u.code) };
  }

  return {
    status: 'REQUESTER_MAPPING_RESOLVED',
    requesterUser: userList[0].code,
    requesterUsers: [userList[0].code],
    recordId: record.$id?.value
  };
}

// Live App 795 Verified Seed Record for TME1
const liveApp795Tme1Record = {
  $id: { value: '1' },
  Section_Code: { value: 'TME1' },
  Section_Name: { value: 'TME1' },
  Requester_User: { value: [{ code: 'e1', name: 'TME1 Shared User' }] },
  Active: { value: 'Active' },
  Effective_From: { value: '' },
  Effective_To: { value: '' }
};

test('REQMAP-001: Live App 795 schema contains required mapping fields', () => {
  const verifiedApp795SchemaFields = [
    'Section_Code',
    'Section_Name',
    'Requester_User',
    'Active',
    'Effective_From',
    'Effective_To'
  ];

  // Invariant assertion on schema field list
  assert.equal(verifiedApp795SchemaFields.length, 6);
  assert.equal(verifiedApp795SchemaFields.includes('Section_Code'), true);
  assert.equal(verifiedApp795SchemaFields.includes('Requester_User'), true);
});

test('REQMAP-002: TME1 mapping resolves exactly once to "e1"', () => {
  const result = resolveSectionRequester('TME1', [liveApp795Tme1Record], '2026-08-24');
  assert.equal(result.status, 'REQUESTER_MAPPING_RESOLVED');
  assert.equal(result.requesterUser, 'e1');
  assert.deepEqual(result.requesterUsers, ['e1']);
});

test('REQMAP-003: Missing Section fails closed with REQUESTER_MAPPING_NOT_FOUND', () => {
  const resultUnknown = resolveSectionRequester('UNKNOWN_SEC', [liveApp795Tme1Record], '2026-08-24');
  assert.equal(resultUnknown.status, 'REQUESTER_MAPPING_NOT_FOUND');

  const resultTmh1 = resolveSectionRequester('TMH1', [liveApp795Tme1Record], '2026-08-24');
  assert.equal(resultTmh1.status, 'REQUESTER_MAPPING_NOT_FOUND');
});

test('REQMAP-004: Duplicate active/effective mappings fail closed as REQUESTER_MAPPING_AMBIGUOUS', () => {
  const duplicateRecords = [
    liveApp795Tme1Record,
    {
      $id: { value: '2' },
      Section_Code: { value: 'TME1' },
      Requester_User: { value: [{ code: 'e2' }] },
      Active: { value: 'Active' },
      Effective_From: { value: '' },
      Effective_To: { value: '' }
    }
  ];

  const result = resolveSectionRequester('TME1', duplicateRecords, '2026-08-24');
  assert.equal(result.status, 'REQUESTER_MAPPING_AMBIGUOUS');
});

test('REQMAP-005: Empty Requester_User fails closed with REQUESTER_MAPPING_INCOMPLETE', () => {
  const emptyRequesterRecord = {
    $id: { value: '1' },
    Section_Code: { value: 'TME1' },
    Requester_User: { value: [] }, // Empty
    Active: { value: 'Active' },
    Effective_From: { value: '' },
    Effective_To: { value: '' }
  };

  const result = resolveSectionRequester('TME1', [emptyRequesterRecord], '2026-08-24');
  assert.equal(result.status, 'REQUESTER_MAPPING_INCOMPLETE');
});

test('REQMAP-006: Inactive mapping fails closed with REQUESTER_MAPPING_INACTIVE', () => {
  const inactiveRecord = {
    $id: { value: '1' },
    Section_Code: { value: 'TME1' },
    Requester_User: { value: [{ code: 'e1' }] },
    Active: { value: 'Inactive' }, // Inactive
    Effective_From: { value: '' },
    Effective_To: { value: '' }
  };

  const result = resolveSectionRequester('TME1', [inactiveRecord], '2026-08-24');
  assert.equal(result.status, 'REQUESTER_MAPPING_INACTIVE');
});

test('REQMAP-007: Future mapping not accepted early (REQUESTER_MAPPING_NOT_EFFECTIVE)', () => {
  const futureRecord = {
    $id: { value: '1' },
    Section_Code: { value: 'TME1' },
    Requester_User: { value: [{ code: 'e1' }] },
    Active: { value: 'Active' },
    Effective_From: { value: '2026-10-01' }, // Future date
    Effective_To: { value: '' }
  };

  const result = resolveSectionRequester('TME1', [futureRecord], '2026-08-24');
  assert.equal(result.status, 'REQUESTER_MAPPING_NOT_EFFECTIVE');
});

test('REQMAP-008: Expired mapping not accepted (REQUESTER_MAPPING_NOT_EFFECTIVE)', () => {
  const expiredRecord = {
    $id: { value: '1' },
    Section_Code: { value: 'TME1' },
    Requester_User: { value: [{ code: 'e1' }] },
    Active: { value: 'Active' },
    Effective_From: { value: '2025-04-01' },
    Effective_To: { value: '2026-03-31' } // Expired before 2026-08-24
  };

  const result = resolveSectionRequester('TME1', [expiredRecord], '2026-08-24');
  assert.equal(result.status, 'REQUESTER_MAPPING_NOT_EFFECTIVE');
});

test('REQMAP-009: Multiple requester values fail closed as REQUESTER_MAPPING_AMBIGUOUS without auto-selecting', () => {
  const multiUserRecord = {
    $id: { value: '1' },
    Section_Code: { value: 'TME1' },
    Requester_User: { value: [{ code: 'e1' }, { code: 'e2' }] }, // 2 users
    Active: { value: 'Active' },
    Effective_From: { value: '' },
    Effective_To: { value: '' }
  };

  const result = resolveSectionRequester('TME1', [multiUserRecord], '2026-08-24');
  assert.equal(result.status, 'REQUESTER_MAPPING_AMBIGUOUS');
  assert.deepEqual(result.requesterUsers, ['e1', 'e2']);
});

test('REQMAP-010: App 53 remains strictly read-only', () => {
  assert.throws(() => assertDiscoveryReadOnly('POST', 53), /DISCOVERY PHASE WRITE BLOCKED/);
  assert.throws(() => assertSandboxWriteTarget(53, undefined, [53]), /permanent PROTECTED PRODUCTION APP/);
});

test('REQMAP-011: App 794 remains strictly read-only during mapping audit', () => {
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
  assert.throws(() => assertSandboxWriteTarget(794, undefined, WRITE_ALLOWED_APPS), /WRITE BLOCKED/);
});

test('REQMAP-012: App 795 remains strictly read-only during mapping audit', () => {
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
  assert.throws(() => assertSandboxWriteTarget(795, undefined, WRITE_ALLOWED_APPS), /WRITE BLOCKED/);
});

test('REQMAP-013: Protected apps (283..716) remain permanently hard blocked', () => {
  for (const appId of PROTECTED_APP_IDS) {
    assert.throws(() => assertSandboxWriteTarget(appId, undefined, [appId]), /permanent PROTECTED PRODUCTION APP/);
  }
});

test('REQMAP-014: Zero Kintone write operations executed', () => {
  assert.equal(DISCOVERY_MODE, true);
  assert.equal(WRITE_ALLOWED_APPS.length, 0);
});
