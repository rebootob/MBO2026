import test from 'node:test';
import assert from 'node:assert/strict';
import { D3TrustedArchiveTransitionService } from '../src/server/services/d3-trusted-archive-transition-service.js';
import { D3AttestationVerifier } from '../src/server/services/d3-attestation-verifier.js';

function createMockKintoneClient(overrides = {}) {
  let statusState = overrides.initialStatus || '05 Objective Approved';
  let revisionState = overrides.initialRevision !== undefined ? overrides.initialRevision : '1';

  return {
    getRecord: async (appId, id) => {
      if (overrides.recordError) throw new Error(overrides.recordError);
      if (overrides.record) return overrides.record;
      return {
        $id: { value: String(id || 100) },
        $revision: { value: String(revisionState) },
        Record_Key: { value: 'REC_KEY_01' },
        Employee_Code: { value: 'EMP001' },
        Fiscal_Year: { value: '2026' },
        Revision_Number: { value: '1' },
        Frozen_Profile_Code: { value: 'PROF01' },
        K_expected_Snapshot: { value: '1' },
        Route_Pattern: { value: 'PATTERN_1_M1' },
        Routing_Topology: { value: 'M1_ONLY' },
        Effective_Routing_Key: { value: 'ROUTING_KEY' },
        Effective_Route_Version_Key: { value: 'VER_KEY' },
        Department_Hoshin_Key: { value: 'HOSHIN_KEY' },
        Configuration_Hash: { value: 'CONFIG_HASH' },
        PartA_Raw_Score: { value: '95' },
        Objective_Count: { value: '2' },
        Objective_1: { value: 'Obj 1' },
        Weight_1: { value: '50' },
        Score_1: { value: '95' },
        Action_Plan_1: { value: 'Plan 1' },
        Difficulty_1: { value: '2' },
        Objective_2: { value: 'Obj 2' },
        Weight_2: { value: '50' },
        Score_2: { value: '95' },
        Action_Plan_2: { value: 'Plan 2' },
        Difficulty_2: { value: '2' },
        Manager_Level1_Approvers: { value: [{ code: 'MGR_01' }] },
        Manager_Level1_Approval_Rule: { value: 'ALL' },
        Effective_Scorer_Slots_Snapshot: { value: '[1]' },
        Status: { value: statusState },
        CREATOR: { value: { code: 'EMP001' } }
      };
    },
    addRecord: async () => ({ id: '1001', revision: '1' }),
    updateRecordStatus: async ({ app, id, action, revision }) => {
      if (overrides.transitionError) throw new Error(overrides.transitionError);
      if (overrides.onUpdateRecordStatus) overrides.onUpdateRecordStatus({ app, id, action, revision });
      revisionState = String(Number(revisionState) + 1);
      statusState = '06 Employee Mid-Year';
      return { revision: revisionState };
    }
  };
}

function createMockAttestationRecord(options = {}) {
  return {
    $id: { value: '1001' },
    Transaction_Nonce: { value: options.nonce || '' },
    App794_Record_ID: { value: '100' },
    Archive_Key: { value: options.archiveKey || '' },
    Expected_From_Status: { value: '05 Objective Approved' },
    Intended_Action: { value: 'Start Mid-Year' },
    Expected_Target_Status: { value: '06 Employee Mid-Year' },
    Snapshot_Hash: { value: options.snapshotHash || '' },
    Issued_At: { value: options.issuedAt || new Date().toISOString() },
    Expires_At: { value: options.expiresAt || new Date(Date.now() + 60000).toISOString() },
    CREATOR: { value: { code: 'EMP001' } }
  };
}

function createMockPrivilegedAdapter(verifier) {
  return {
    getRecord: async (appId, recordId) => {
      const keys = Array.from(verifier.nonceStore?.keys() || []);
      const latestNonce = keys[keys.length - 1];
      const latestEntry = verifier.nonceStore.get(latestNonce);
      return createMockAttestationRecord({
        nonce: latestNonce,
        archiveKey: latestEntry?.binding?.archiveKey,
        snapshotHash: latestEntry?.binding?.snapshotHash,
        issuedAt: new Date(latestEntry?.issuedAt).toISOString(),
        expiresAt: new Date(latestEntry?.expiresAt).toISOString()
      });
    }
  };
}

function createMockArchiveService(overrides = {}) {
  return {
    archiveStageCompletion: async ({ stage, snapshot, actor }) => {
      if (overrides.archiveError) throw new Error(overrides.archiveError);
      return {
        success: true,
        archiveId: 'ARC_798_1001',
        snapshotHash: 'HASH_SNAP_123',
        archiveKey: 'ARC_KEY_456'
      };
    }
  };
}

test('D3TrustedArchiveTransitionService: executeTrustedTransition completes archive and transition with expected revision', async () => {
  let passedRevision = null;
  const mockClient = createMockKintoneClient({
    initialRevision: '5',
    onUpdateRecordStatus: ({ revision }) => {
      passedRevision = revision;
    }
  });

  const tokenStore = {
    loadGrant: async () => ({ accessToken: 'mock_token' })
  };
  const verifier = new D3AttestationVerifier({ ttlMs: 60000 });
  const service = new D3TrustedArchiveTransitionService({
    userOAuthKintoneAdapterFactory: () => mockClient,
    privilegedKintoneAdapter: createMockPrivilegedAdapter(verifier),
    attestationVerifier: verifier,
    archiveService: createMockArchiveService(),
    tokenStore
  });

  const result = await service.executeTrustedTransition({
    recordId: 100,
    intendedAction: 'Start Mid-Year',
    sessionBinding: 'sess_123'
  });

  assert.equal(result.status, 'TRANSITION_COMMITTED');
  assert.equal(result.recordId, 100);
  assert.equal(result.targetStage, 'OBJECTIVE');
  assert.equal(result.previousStatus, '05 Objective Approved');
  assert.equal(result.newStatus, '06 Employee Mid-Year');
  assert.equal(result.archiveResult.success, true);
  assert.equal(passedRevision, 5, 'Must pass authoritative preRevision to transition');
});

test('D3TrustedArchiveTransitionService: fails closed if App794 system $revision is missing or invalid', async () => {
  const invalidRevisions = [undefined, null, '', '0', '-1', 'abc'];

  for (const rev of invalidRevisions) {
    const record = {
      $id: { value: '100' },
      Status: { value: '05 Objective Approved' },
      CREATOR: { value: { code: 'EMP001' } }
    };
    if (rev !== undefined) {
      record.$revision = { value: rev };
    }

    const mockClient = {
      getRecord: async () => record
    };

    const tokenStore = { loadGrant: async () => ({ accessToken: 'mock_token' }) };
    const service = new D3TrustedArchiveTransitionService({
      userOAuthKintoneAdapterFactory: () => mockClient,
      tokenStore
    });

    await assert.rejects(async () => {
      await service.executeTrustedTransition({
        recordId: 100,
        intendedAction: 'Start Mid-Year',
        sessionBinding: 'sess_123'
      });
    }, (err) => {
      return err.code === 'APP794_REVISION_NOT_RESOLVED';
    }, `Failed to reject invalid $revision: ${rev}`);
  }
});

test('D3TrustedArchiveTransitionService: fails closed if archive fails, preventing transition', async () => {
  let transitionCalled = false;
  const mockClient = createMockKintoneClient();
  mockClient.updateRecordStatus = async () => {
    transitionCalled = true;
    return { revision: '2' };
  };

  const tokenStore = {
    loadGrant: async () => ({ accessToken: 'mock_token' })
  };
  const verifier = new D3AttestationVerifier({ ttlMs: 60000 });
  const service = new D3TrustedArchiveTransitionService({
    userOAuthKintoneAdapterFactory: () => mockClient,
    privilegedKintoneAdapter: createMockPrivilegedAdapter(verifier),
    attestationVerifier: verifier,
    archiveService: createMockArchiveService({ archiveError: 'Kintone 798 Network Failure' }),
    tokenStore
  });

  await assert.rejects(async () => {
    await service.executeTrustedTransition({
      recordId: 100,
      intendedAction: 'Start Mid-Year',
      sessionBinding: 'sess_123'
    });
  }, /App 798 archive failed/);

  assert.equal(transitionCalled, false, 'Transition must never be called if archive fails');
});

test('D3TrustedArchiveTransitionService: handles transition ambiguity without blind retry', async () => {
  // Case A: Readback shows target status reached -> TRANSITION_COMMITTED_STATE_OBSERVED
  let transitionAttempts = 0;
  const mockClientCommitted = createMockKintoneClient();
  const defaultGetRecord = mockClientCommitted.getRecord;
  mockClientCommitted.getRecord = async (appId, id) => {
    const base = await defaultGetRecord(appId, id);
    if (transitionAttempts === 0) {
      return base;
    }
    return {
      ...base,
      $revision: { value: '2' },
      Status: { value: '06 Employee Mid-Year' }
    };
  };
  mockClientCommitted.updateRecordStatus = async () => {
    transitionAttempts++;
    throw new Error('NETWORK_TIMEOUT_POST_COMMIT');
  };

  const tokenStore = { loadGrant: async () => ({ accessToken: 'mock_token' }) };
  const verifier = new D3AttestationVerifier({ ttlMs: 60000 });
  const serviceCommitted = new D3TrustedArchiveTransitionService({
    userOAuthKintoneAdapterFactory: () => mockClientCommitted,
    privilegedKintoneAdapter: createMockPrivilegedAdapter(verifier),
    attestationVerifier: verifier,
    archiveService: createMockArchiveService(),
    tokenStore
  });

  const resCommitted = await serviceCommitted.executeTrustedTransition({
    recordId: 100,
    intendedAction: 'Start Mid-Year',
    sessionBinding: 'sess_123'
  });

  assert.equal(resCommitted.status, 'TRANSITION_COMMITTED_STATE_OBSERVED');
  assert.equal(transitionAttempts, 1, 'Never blinds retry transition');

  // Case B: Readback shows pre-state + same revision -> TRANSITION_NOT_COMMITTED_RETRYABLE
  transitionAttempts = 0;
  const mockClientNotCommitted = createMockKintoneClient();
  mockClientNotCommitted.updateRecordStatus = async () => {
    transitionAttempts++;
    throw new Error('NETWORK_DROPPED_EARLY');
  };

  const verifier2 = new D3AttestationVerifier({ ttlMs: 60000 });
  const serviceNotCommitted = new D3TrustedArchiveTransitionService({
    userOAuthKintoneAdapterFactory: () => mockClientNotCommitted,
    privilegedKintoneAdapter: createMockPrivilegedAdapter(verifier2),
    attestationVerifier: verifier2,
    archiveService: createMockArchiveService(),
    tokenStore
  });

  await assert.rejects(async () => {
    await serviceNotCommitted.executeTrustedTransition({
      recordId: 100,
      intendedAction: 'Start Mid-Year',
      sessionBinding: 'sess_123'
    });
  }, (err) => {
    return err.code === 'TRANSITION_NOT_COMMITTED_RETRYABLE';
  });
  assert.equal(transitionAttempts, 1, 'Zero automatic second transition');
});
