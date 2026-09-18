import test from 'node:test';
import assert from 'node:assert/strict';
import { D3AttestationVerifier, D3AttestationError } from '../src/server/services/d3-attestation-verifier.js';

test('D3AttestationVerifier: generates nonce and consumes once', () => {
  const verifier = new D3AttestationVerifier();
  const binding = {
    recordId: 101,
    archiveKey: 'KEY_01',
    expectedFromStatus: '05 Objective Approved',
    intendedAction: 'Start Mid-Year',
    expectedTargetStatus: '06 Employee Mid-Year',
    snapshotHash: 'HASH_01'
  };

  const { nonce, issuedAt, expiresAt } = verifier.generateNonce(binding);
  assert.ok(nonce);
  assert.ok(issuedAt);
  assert.ok(expiresAt);

  // Consume once succeeds
  verifier.consumeNonce(nonce);

  // Replay consumption fails closed
  assert.throws(() => {
    verifier.consumeNonce(nonce);
  }, (err) => {
    return err instanceof D3AttestationError && err.code === 'ATTESTATION_REPLAY_DETECTED';
  });
});

test('D3AttestationVerifier: rejects expired nonce on consumption', () => {
  let currentTime = 1000000;
  const verifier = new D3AttestationVerifier({
    maxTtlSeconds: 10,
    clock: () => currentTime
  });

  const { nonce } = verifier.generateNonce({});
  currentTime += 15000; // Fast forward 15s (> 10s TTL)

  assert.throws(() => {
    verifier.consumeNonce(nonce);
  }, (err) => {
    return err instanceof D3AttestationError && err.code === 'ATTESTATION_EXPIRED';
  });
});

test('D3AttestationVerifier: verifyAttestationReadback validates full 9-field binding and extracts CREATOR', () => {
  const verifier = new D3AttestationVerifier();
  const binding = {
    recordId: '101',
    archiveKey: 'KEY_01',
    expectedFromStatus: '05 Objective Approved',
    intendedAction: 'Start Mid-Year',
    expectedTargetStatus: '06 Employee Mid-Year',
    snapshotHash: 'HASH_01'
  };

  const { nonce, issuedAt, expiresAt } = verifier.generateNonce(binding);
  const expected = { ...binding, nonce };

  const mockAttestationRecord = {
    Transaction_Nonce: { value: nonce },
    App794_Record_ID: { value: '101' },
    Archive_Key: { value: 'KEY_01' },
    Expected_From_Status: { value: '05 Objective Approved' },
    Intended_Action: { value: 'Start Mid-Year' },
    Expected_Target_Status: { value: '06 Employee Mid-Year' },
    Snapshot_Hash: { value: 'HASH_01' },
    Issued_At: { value: new Date(issuedAt).toISOString() },
    Expires_At: { value: new Date(expiresAt).toISOString() },
    CREATOR: { value: { code: 'EMP_ATTEST_01' } }
  };

  const verification = verifier.verifyAttestationReadback(mockAttestationRecord, expected);
  assert.equal(verification.actorCode, 'EMP_ATTEST_01');
  assert.equal(verification.verified, true);

  // Second verify immediately fails as replay
  assert.throws(() => {
    verifier.verifyAttestationReadback(mockAttestationRecord, expected);
  }, /ATTESTATION_REPLAY_DETECTED/);
});

test('D3AttestationVerifier: detects tampering for all 9 fields individual fail-closed', () => {
  const fields = [
    'Transaction_Nonce',
    'App794_Record_ID',
    'Archive_Key',
    'Expected_From_Status',
    'Intended_Action',
    'Expected_Target_Status',
    'Snapshot_Hash',
    'Issued_At',
    'Expires_At'
  ];

  for (const tamperedField of fields) {
    const verifier = new D3AttestationVerifier();
    const binding = {
      recordId: '101',
      archiveKey: 'KEY_01',
      expectedFromStatus: '05 Objective Approved',
      intendedAction: 'Start Mid-Year',
      expectedTargetStatus: '06 Employee Mid-Year',
      snapshotHash: 'HASH_01'
    };

    const { nonce, issuedAt, expiresAt } = verifier.generateNonce(binding);
    const expected = { ...binding, nonce };

    const record = {
      Transaction_Nonce: { value: nonce },
      App794_Record_ID: { value: '101' },
      Archive_Key: { value: 'KEY_01' },
      Expected_From_Status: { value: '05 Objective Approved' },
      Intended_Action: { value: 'Start Mid-Year' },
      Expected_Target_Status: { value: '06 Employee Mid-Year' },
      Snapshot_Hash: { value: 'HASH_01' },
      Issued_At: { value: new Date(issuedAt).toISOString() },
      Expires_At: { value: new Date(expiresAt).toISOString() },
      CREATOR: { value: { code: 'EMP_ATTEST_01' } }
    };

    // Tamper field
    record[tamperedField] = { value: 'TAMPERED_VALUE' };

    assert.throws(() => {
      verifier.verifyAttestationReadback(record, expected);
    }, (err) => {
      return err instanceof D3AttestationError;
    }, `Failed to reject tampered field: ${tamperedField}`);
  }
});

test('D3AttestationVerifier: strict CREATOR validation and rejects fallbacks or SYSTEM', () => {
  const verifier = new D3AttestationVerifier();
  const binding = {
    recordId: '101',
    archiveKey: 'KEY_01',
    expectedFromStatus: '05 Objective Approved',
    intendedAction: 'Start Mid-Year',
    expectedTargetStatus: '06 Employee Mid-Year',
    snapshotHash: 'HASH_01'
  };
  const { nonce, issuedAt, expiresAt } = verifier.generateNonce(binding);
  const expected = { ...binding, nonce };

  const validRecordBase = {
    Transaction_Nonce: { value: nonce },
    App794_Record_ID: { value: '101' },
    Archive_Key: { value: 'KEY_01' },
    Expected_From_Status: { value: '05 Objective Approved' },
    Intended_Action: { value: 'Start Mid-Year' },
    Expected_Target_Status: { value: '06 Employee Mid-Year' },
    Snapshot_Hash: { value: 'HASH_01' },
    Issued_At: { value: new Date(issuedAt).toISOString() },
    Expires_At: { value: new Date(expiresAt).toISOString() }
  };

  // Missing CREATOR
  assert.throws(() => {
    verifier.verifyAttestationReadback({ ...validRecordBase }, expected);
  }, /ATTESTATION_ACTOR_NOT_RESOLVED/);

  // Fallback to Creator only
  assert.throws(() => {
    verifier.verifyAttestationReadback({
      ...validRecordBase,
      Creator: { value: { code: 'FALLBACK_CREATOR' } }
    }, expected);
  }, /ATTESTATION_ACTOR_NOT_RESOLVED/);

  // SYSTEM actor
  assert.throws(() => {
    verifier.verifyAttestationReadback({
      ...validRecordBase,
      CREATOR: { value: { code: 'SYSTEM' } }
    }, expected);
  }, /ATTESTATION_ACTOR_NOT_RESOLVED/);

  // Blank code
  assert.throws(() => {
    verifier.verifyAttestationReadback({
      ...validRecordBase,
      CREATOR: { value: { code: '   ' } }
    }, expected);
  }, /ATTESTATION_ACTOR_NOT_RESOLVED/);
});

test('D3AttestationVerifier: stores ownerSessionBinding outside 9-field binding', () => {
  const verifier = new D3AttestationVerifier();
  const binding = {
    recordId: '101',
    archiveKey: 'KEY_01',
    expectedFromStatus: '05 Objective Approved',
    intendedAction: 'Start Mid-Year',
    expectedTargetStatus: '06 Employee Mid-Year',
    snapshotHash: 'HASH_01'
  };

  const { nonce } = verifier.generateNonce(binding, {
    ownerSessionBinding: 'SESSION_HASH_123'
  });

  const entry = verifier.nonceStore.get(nonce);
  assert.ok(entry);
  assert.equal(entry.ownerSessionBinding, 'SESSION_HASH_123');
  // Confirm ownerSessionBinding is not mixed into binding
  assert.equal(entry.binding.ownerSessionBinding, undefined);
  assert.equal(Object.keys(entry.binding).length, 6);
});
