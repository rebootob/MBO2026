import test from 'node:test';
import assert from 'node:assert/strict';
import { D3TrustedArchiveTransitionService } from '../src/server/services/d3-trusted-archive-transition-service.js';
import { D3AttestationVerifier } from '../src/server/services/d3-attestation-verifier.js';

function createMockKintoneClient(overrides = {}) {
  return {
    getRecord: async (appId, id) => {
      if (overrides.recordError) throw new Error(overrides.recordError);
      if (overrides.record) return overrides.record;
      return {
        $id: { value: String(id || 100) },
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
        Status: { value: '05 Objective Approved' },
        CREATOR: { value: { code: 'EMP001' } }
      };
    },
    addRecord: async () => ({ id: '1001', revision: '1' }),
    updateRecordStatus: async ({ app, id, action }) => {
      if (overrides.transitionError) throw new Error(overrides.transitionError);
      return { revision: '2' };
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
    Actor_User_Code: { value: 'EMP001' },
    CREATOR: { value: { code: 'EMP001' } }
  };
}

function createMockPrivilegedAdapter(verifier) {
  return {
    getRecord: async (appId, recordId) => {
      // Return matching attestation record for the latest nonce
      const keys = Array.from(verifier.nonceStore?.keys() || []);
      const latestNonce = keys[keys.length - 1];
      const latestEntry = verifier.nonceStore.get(latestNonce);
      return createMockAttestationRecord({
        nonce: latestNonce,
        archiveKey: latestEntry?.binding?.archiveKey,
        snapshotHash: latestEntry?.binding?.snapshotHash
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

test('D3TrustedArchiveTransitionService: executeTrustedTransition successfully completes archive then transition', async () => {
  const tokenStore = {
    loadGrant: async () => ({ accessToken: 'mock_token' })
  };
  const verifier = new D3AttestationVerifier({ ttlMs: 60000 });
  const service = new D3TrustedArchiveTransitionService({
    userOAuthKintoneAdapterFactory: () => createMockKintoneClient(),
    privilegedKintoneAdapter: createMockPrivilegedAdapter(verifier),
    attestationVerifier: verifier,
    archiveService: createMockArchiveService(),
    tokenStore
  });

  const result = await service.executeTrustedTransition({
    recordId: 100,
    intendedAction: 'Start Mid-Year',
    userCode: 'EMP001'
  });

  assert.equal(result.status, 'TRANSITION_COMMITTED');
  assert.equal(result.recordId, 100);
  assert.equal(result.targetStage, 'OBJECTIVE');
  assert.equal(result.previousStatus, '05 Objective Approved');
  assert.equal(result.newStatus, '06 Employee Mid-Year');
  assert.equal(result.archiveResult.success, true);
});

test('D3TrustedArchiveTransitionService: fails closed if record status does not match intended action', async () => {
  const tokenStore = {
    loadGrant: async () => ({ accessToken: 'mock_token' })
  };
  const service = new D3TrustedArchiveTransitionService({
    userOAuthKintoneAdapterFactory: () => createMockKintoneClient(),
    archiveService: createMockArchiveService(),
    tokenStore
  });

  await assert.rejects(async () => {
    await service.executeTrustedTransition({
      recordId: 100,
      intendedAction: 'Complete', // Incompatible with '05 Objective Approved'
      userCode: 'EMP001'
    });
  }, /INVALID_STATUS_PRECONDITION/);
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
      userCode: 'EMP001'
    });
  }, /App 798 archive failed/);

  assert.equal(transitionCalled, false);
});
