import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DISCOVERY_MODE,
  PROTECTED_APP_IDS,
  WRITE_BLOCKED_APP_IDS,
  assertDiscoveryReadOnly,
  assertSandboxWriteTarget,
  assertScoringMasterSupersessionAuthorization
} from '../src/core/sandbox-write-guard.js';

test('Discovery Mode Hard Write Lock is Active', () => {
  assert.equal(DISCOVERY_MODE, true);
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(53));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(283));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(305));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(307));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(310));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(640));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(643));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(715));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(716));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(794));
  assert.ok(WRITE_BLOCKED_APP_IDS.includes(795));
});

test('assertDiscoveryReadOnly allows GET operations', () => {
  assert.doesNotThrow(() => assertDiscoveryReadOnly('GET', 794));
  assert.doesNotThrow(() => assertDiscoveryReadOnly('get', 53));
});

test('assertDiscoveryReadOnly blocks POST, PUT, and DELETE operations', () => {
  assert.throws(() => assertDiscoveryReadOnly('POST', 794), /DISCOVERY PHASE WRITE BLOCKED/);
  assert.throws(() => assertDiscoveryReadOnly('PUT', 795), /DISCOVERY PHASE WRITE BLOCKED/);
  assert.throws(() => assertDiscoveryReadOnly('DELETE', 794), /DISCOVERY PHASE WRITE BLOCKED/);
});

test('assertSandboxWriteTarget blocks all writes when DISCOVERY_MODE is true', () => {
  assert.throws(() => assertSandboxWriteTarget(794), /DISCOVERY PHASE WRITE BLOCKED/);
  assert.throws(() => assertSandboxWriteTarget(795), /DISCOVERY PHASE WRITE BLOCKED/);
  assert.throws(() => assertSandboxWriteTarget(53), /PROTECTED PRODUCTION APP/);
  assert.throws(() => assertSandboxWriteTarget(283), /PROTECTED PRODUCTION APP/);
});

test('assertScoringMasterSupersessionAuthorization enforces strict security gates', () => {
  const validAuth = {
    workPackageId: 'MBO-P03-WP-002C',
    stage: 'STAGE_4D_SUPERSEDE_AND_PUBLISH',
    contractId: 'WP002C_SUPERSEDE_V1',
    operation: 'SCORING_CONFIG_SUPERSEDE_AND_PUBLISH',
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: 'AUTH_SUPERSEDE_001',
    backupEvidence: {
      appId: 796,
      appName: 'MBO Profile & Scoring Configuration Master [Sandbox]',
      snapshotScope: 'APP_796_PRE_SUPERSEDE_SNAPSHOT',
      captured: true,
      verified: true,
      retainedUntilIndependentReview: true,
      artifactPath: 'backups/delivery-sprint-03a/app796/2026-08-25T05-16-21-178Z',
      sha256: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
      capturedAt: '2026-08-26T22:00:00Z',
      recordCount: 8
    }
  };

  const validReq = {
    workPackageId: 'MBO-P03-WP-002C',
    stage: 'STAGE_4D_SUPERSEDE_AND_PUBLISH',
    contractId: 'WP002C_SUPERSEDE_V1',
    appId: 796,
    appName: 'MBO Profile & Scoring Configuration Master [Sandbox]',
    operation: 'SCORING_CONFIG_SUPERSEDE_AND_PUBLISH',
    predecessorRecordId: '6',
    predecessorRevision: '3',
    predecessorMasterRecordKey: 'PROF_DGM::v1.0.0',
    predecessorVersion: 'v1.0.0',
    newRecordId: '10',
    newRevision: '1',
    newMasterRecordKey: 'PROF_DGM::v1.1.0',
    newVersion: 'v1.1.0',
    expectedPredecessorCurrentStatus: 'PUBLISHED',
    expectedPredecessorNextStatus: 'SUPERSEDED',
    expectedNewCurrentStatus: 'VALIDATED',
    expectedNewNextStatus: 'PUBLISHED'
  };

  // Valid authorization passes and registers consumed ID
  assert.equal(assertScoringMasterSupersessionAuthorization({ ...validAuth }, { ...validReq }), true);

  // Replay attempt fails
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth }, { ...validReq }),
    /SCORING SUPERSESSION BLOCKED: Authorization has already been consumed/
  );

  // 1. wrong/missing Work Package
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A02', workPackageId: 'WRONG_WP' }, { ...validReq }),
    /SCORING SUPERSESSION BLOCKED: Work package must be exactly MBO-P03-WP-002C/
  );

  // 2. wrong Stage
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A03', stage: 'WRONG_STAGE' }, { ...validReq }),
    /SCORING SUPERSESSION BLOCKED: Stage must be exactly STAGE_4D_SUPERSEDE_AND_PUBLISH/
  );

  // 3. wrong Contract ID
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A04' }, { ...validReq, contractId: 'WRONG_CONTRACT' }),
    /SCORING SUPERSESSION BLOCKED: Contract ID must be exactly WP002C_SUPERSEDE_V1/
  );

  // 4. wrong App ID
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A05' }, { ...validReq, appId: 794 }),
    /SCORING SUPERSESSION BLOCKED: Target App ID must be exactly 796/
  );

  // 5. wrong App Name
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A06' }, { ...validReq, appName: 'WRONG_APP_NAME' }),
    /SCORING SUPERSESSION BLOCKED: Target App name mismatch/
  );

  // 6. wrong operation
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A07', operation: 'WRONG_OP' }, { ...validReq }),
    /SCORING SUPERSESSION BLOCKED: Operation must be exactly SCORING_CONFIG_SUPERSEDE_AND_PUBLISH/
  );

  // 7. explicitUserAuthorization != true
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A08', explicitUserAuthorization: false }, { ...validReq }),
    /SCORING SUPERSESSION BLOCKED: Explicit user authorization is required/
  );

  // 8. activeWindow != true
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A09', activeWindow: false }, { ...validReq }),
    /SCORING SUPERSESSION BLOCKED: One-time write window is CLOSED/
  );

  // 9a. missing backupEvidence entirely (even with legacy prewriteBackupVerified=true)
  assert.throws(
    () => {
      const authWithoutBackup = { ...validAuth, authorizationId: 'A10a', prewriteBackupVerified: true };
      delete authWithoutBackup.backupEvidence;
      assertScoringMasterSupersessionAuthorization(authWithoutBackup, { ...validReq });
    },
    /SCORING SUPERSESSION BLOCKED: Structured backup evidence object is required/
  );

  // 9b. malformed backup evidence
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A10b', backupEvidence: null }, { ...validReq }),
    /SCORING SUPERSESSION BLOCKED: Structured backup evidence object is required/
  );

  // 10. backup app mismatch
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A11', backupEvidence: { ...validAuth.backupEvidence, appId: 795 } }, { ...validReq }),
    /SCORING SUPERSESSION BLOCKED: Backup App ID mismatch/
  );

  // 11a. APP796_TIMEZONE_AWARE_CAPTURED_AT tests
  // valid Z timestamp -> PASS
  assert.equal(
    assertScoringMasterSupersessionAuthorization(
      { ...validAuth, authorizationId: 'A11_tz_z', backupEvidence: { ...validAuth.backupEvidence, capturedAt: '2026-08-26T22:00:00Z' } },
      { ...validReq }
    ),
    true
  );
  // valid +07:00 timestamp -> PASS
  assert.equal(
    assertScoringMasterSupersessionAuthorization(
      { ...validAuth, authorizationId: 'A11_tz_plus7', backupEvidence: { ...validAuth.backupEvidence, capturedAt: '2026-08-26T22:00:00+07:00' } },
      { ...validReq }
    ),
    true
  );
  // valid -05:00 timestamp -> PASS
  assert.equal(
    assertScoringMasterSupersessionAuthorization(
      { ...validAuth, authorizationId: 'A11_tz_minus5', backupEvidence: { ...validAuth.backupEvidence, capturedAt: '2026-08-26T22:00:00-05:00' } },
      { ...validReq }
    ),
    true
  );
  // missing timezone -> DENY
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization(
      { ...validAuth, authorizationId: 'A11_tz_none', backupEvidence: { ...validAuth.backupEvidence, capturedAt: '2026-08-26T22:00:00' } },
      { ...validReq }
    ),
    /SCORING SUPERSESSION BLOCKED: Backup capturedAt must be valid timezone-aware ISO-8601 string/
  );
  // malformed timestamp -> DENY
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization(
      { ...validAuth, authorizationId: 'A11_tz_bad', backupEvidence: { ...validAuth.backupEvidence, capturedAt: 'not-a-date' } },
      { ...validReq }
    ),
    /SCORING SUPERSESSION BLOCKED: Backup capturedAt must be valid timezone-aware ISO-8601 string/
  );

  // 12a. missing authConfig.contractId
  assert.throws(
    () => {
      const authNoContract = { ...validAuth, authorizationId: 'A12a' };
      delete authNoContract.contractId;
      assertScoringMasterSupersessionAuthorization(authNoContract, { ...validReq });
    },
    /SCORING SUPERSESSION BLOCKED: Contract ID must be exactly WP002C_SUPERSEDE_V1/
  );

  // 12b. wrong authConfig.contractId
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A12b', contractId: 'WRONG_AUTH_CONTRACT' }, { ...validReq }),
    /SCORING SUPERSESSION BLOCKED: Contract ID must be exactly WP002C_SUPERSEDE_V1/
  );

  // 12c. missing request contractId
  assert.throws(
    () => {
      const reqNoContract = { ...validReq };
      delete reqNoContract.contractId;
      assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A12c' }, reqNoContract);
    },
    /SCORING SUPERSESSION BLOCKED: Contract ID must be exactly WP002C_SUPERSEDE_V1/
  );

  // 13. wrong predecessor ID / revision / master key / version
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A13' }, { ...validReq, predecessorRecordId: 'abc' }),
    /SCORING SUPERSESSION BLOCKED: Predecessor and new record IDs must be positive safe integer strings/
  );

  // 14. wrong new ID / revision / master key / version
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A14' }, { ...validReq, newMasterRecordKey: 'PROF_DGM::v1.0.0' }),
    /SCORING SUPERSESSION BLOCKED: Predecessor and new master record keys must be different/
  );

  // 15. same record ID
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A15' }, { ...validReq, predecessorRecordId: '10', newRecordId: '10' }),
    /SCORING SUPERSESSION BLOCKED: Predecessor record ID and new record ID must be different/
  );

  // 16. missing each expected status field
  for (const field of ['expectedPredecessorCurrentStatus', 'expectedPredecessorNextStatus', 'expectedNewCurrentStatus', 'expectedNewNextStatus']) {
    assert.throws(
      () => {
        const reqMissingStatus = { ...validReq };
        delete reqMissingStatus[field];
        assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: `A16_${field}` }, reqMissingStatus);
      },
      /SCORING SUPERSESSION BLOCKED: Expected/
    );
  }

  // 17. wrong each expected status field
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A17a' }, { ...validReq, expectedPredecessorCurrentStatus: 'DRAFT' }),
    /SCORING SUPERSESSION BLOCKED: Expected predecessor current status must be PUBLISHED/
  );
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A17b' }, { ...validReq, expectedPredecessorNextStatus: 'PUBLISHED' }),
    /SCORING SUPERSESSION BLOCKED: Expected predecessor next status must be SUPERSEDED/
  );
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A17c' }, { ...validReq, expectedNewCurrentStatus: 'PUBLISHED' }),
    /SCORING SUPERSESSION BLOCKED: Expected new current status must be VALIDATED/
  );
  assert.throws(
    () => assertScoringMasterSupersessionAuthorization({ ...validAuth, authorizationId: 'A17d' }, { ...validReq, expectedNewNextStatus: 'SUPERSEDED' }),
    /SCORING SUPERSESSION BLOCKED: Expected new next status must be PUBLISHED/
  );
});
