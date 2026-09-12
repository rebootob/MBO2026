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

test('assertApp794CustomizationDeployAuthorization enforces narrow single-use D3 authorization and hard blocks protected apps', async () => {
  const {
    WRITE_ALLOWED_APPS,
    APP794_CUSTOMIZATION_DEPLOY_STAGE,
    APP794_CUSTOMIZATION_DEPLOY_WORK_PACKAGE,
    APP794_CUSTOMIZATION_DEPLOY_OPERATION,
    APP794_MBO_V2_APP_ID,
    assertApp794CustomizationDeployAuthorization,
    validateApp794CustomizationDeployAuthorization
  } = await import('../src/core/sandbox-write-guard.js');

  // 1. Constants match D3 contract
  assert.equal(APP794_CUSTOMIZATION_DEPLOY_STAGE, 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY');
  assert.equal(APP794_CUSTOMIZATION_DEPLOY_WORK_PACKAGE, 'D3-SBX-DEPLOY-01');
  assert.equal(APP794_CUSTOMIZATION_DEPLOY_OPERATION, 'APP794_CUSTOMIZATION_DEPLOY');
  assert.equal(APP794_MBO_V2_APP_ID, 794);

  // 2. Default WRITE_ALLOWED_APPS remains empty
  assert.equal(WRITE_ALLOWED_APPS.length, 0, 'WRITE_ALLOWED_APPS must default to empty array');

  const validAuth = {
    workPackageId: 'D3-SBX-DEPLOY-01',
    stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: 'D3_APP794_DEPLOY_AUTH_001',
    appId: 794
  };

  const validReq = {
    workPackageId: 'D3-SBX-DEPLOY-01',
    stage: 'STAGE_D3_APP794_CUSTOMIZATION_DEPLOY',
    operation: 'APP794_CUSTOMIZATION_DEPLOY',
    appId: 794
  };

  // 3. Validation without consuming does not consume the authorization ID
  assert.equal(validateApp794CustomizationDeployAuthorization({ ...validAuth }, { ...validReq }), true);
  assert.equal(assertApp794CustomizationDeployAuthorization({ ...validAuth }, { ...validReq }, { consume: false }), true);

  // 4. Valid authorization passes and consumes authorization ID
  assert.equal(assertApp794CustomizationDeployAuthorization({ ...validAuth }, { ...validReq }), true);

  // 5. Replay attempt fails closed
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization({ ...validAuth }, { ...validReq }),
    /APP794 DEPLOY BLOCKED: Authorization has already been consumed/
  );
  assert.throws(
    () => validateApp794CustomizationDeployAuthorization({ ...validAuth }, { ...validReq }),
    /APP794 DEPLOY BLOCKED: Authorization has already been consumed/
  );

  // 5b. Replay remains rejected; no authorization reset bypass is exported
  const guardModule = await import('../src/core/sandbox-write-guard.js');
  assert.equal(
    guardModule._resetConsumedApp794DeployAuthorizationIdsForTest,
    undefined,
    'Authorization reset bypass must NOT be exported in production code'
  );

  // 6. Historical MBO-P03-WP-002C ID rejected
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_HIST_WP', workPackageId: 'MBO-P03-WP-002C' },
      { ...validReq, workPackageId: 'MBO-P03-WP-002C' }
    ),
    /APP794 DEPLOY BLOCKED: Work package must be exactly D3-SBX-DEPLOY-01/
  );

  // 7. Historical STAGE_D1_APP794_CUSTOMIZATION_DEPLOY rejected
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_HIST_STAGE', stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY' },
      { ...validReq, stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY' }
    ),
    /APP794 DEPLOY BLOCKED: Stage must be exactly STAGE_D3_APP794_CUSTOMIZATION_DEPLOY/
  );

  // 8. Wrong App ID (e.g. 795) fails
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_WRONG_APP' },
      { ...validReq, appId: 795 }
    ),
    /APP794 DEPLOY BLOCKED: Target App ID must be exactly 794/
  );

  // 9. Protected production app (53) hard blocks even with valid authorization structure
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_PROTECTED_53', appId: 53 },
      { ...validReq, appId: 53 }
    ),
    /WRITE BLOCKED: App 53 is a permanent PROTECTED PRODUCTION APP/
  );

  // 10. Legacy Protected production app (283) hard blocks even with valid authorization structure
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_PROTECTED_283', appId: 283 },
      { ...validReq, appId: 283 }
    ),
    /WRITE BLOCKED: App 283 is a permanent PROTECTED PRODUCTION APP/
  );

  // 11. Missing explicitUserAuthorization fails
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_NO_EXPLICIT', explicitUserAuthorization: false },
      { ...validReq }
    ),
    /APP794 DEPLOY BLOCKED: Explicit user authorization is required/
  );

  // 12. Closed window fails
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_CLOSED_WINDOW', activeWindow: false },
      { ...validReq }
    ),
    /APP794 DEPLOY BLOCKED: One-time write window is CLOSED/
  );

  // 13. Missing or empty authorizationId fails
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(
      { ...validAuth, authorizationId: '' },
      { ...validReq }
    ),
    /APP794 DEPLOY BLOCKED: A non-empty authorization ID is required/
  );

  // 14. Missing or malformed authConfig/requestConfig fail closed
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(null, validReq),
    /APP794 DEPLOY BLOCKED \(FAIL-CLOSED\)/
  );
  assert.throws(
    () => assertApp794CustomizationDeployAuthorization(validAuth, null),
    /APP794 DEPLOY BLOCKED \(FAIL-CLOSED\)/
  );

  // 15. Exact authorized App794 context passes both authorization and sandbox write target layer
  const { assertSandboxWriteTarget } = await import('../src/core/sandbox-write-guard.js');
  const authCtx = { ...validAuth, authorizationId: 'AUTH_EXACT_CONTEXT_794' };
  const reqCtx = { ...validReq };
  assert.equal(assertApp794CustomizationDeployAuthorization(authCtx, reqCtx), true);
  assert.equal(assertSandboxWriteTarget(794, undefined, [794], { dryRunBypassDiscovery: true }), 794);
});

test('assertD3App794ProcessDeployAuthorization enforces narrow single-use process authorization and hard blocks protected apps', async () => {
  const {
    D3_APP794_PROCESS_DEPLOY_STAGE,
    D3_APP794_PROCESS_DEPLOY_OPERATION,
    D3_APP794_PROCESS_DEPLOY_WORK_PACKAGE,
    D3_APP794_PROCESS_TARGET_APP,
    assertD3App794ProcessDeployAuthorization
  } = await import('../src/core/sandbox-write-guard.js');

  const validAuth = {
    workPackageId: D3_APP794_PROCESS_DEPLOY_WORK_PACKAGE,
    stage: D3_APP794_PROCESS_DEPLOY_STAGE,
    operation: D3_APP794_PROCESS_DEPLOY_OPERATION,
    appId: D3_APP794_PROCESS_TARGET_APP,
    activeWindow: true,
    explicitUserAuthorization: true,
    authorizationId: 'D3_PROCESS_AUTH_001'
  };

  const validReq = {
    workPackageId: D3_APP794_PROCESS_DEPLOY_WORK_PACKAGE,
    stage: D3_APP794_PROCESS_DEPLOY_STAGE,
    operation: D3_APP794_PROCESS_DEPLOY_OPERATION,
    appId: D3_APP794_PROCESS_TARGET_APP,
    expectedStateCount: 19,
    expectedActionCount: 40
  };

  // 1. Exact good contract passes
  assert.equal(assertD3App794ProcessDeployAuthorization({ ...validAuth }, { ...validReq }), true);

  // 2. Replay attempt fails
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization({ ...validAuth }, { ...validReq }),
    /D3_PROCESS_DEPLOY_BLOCKED: Authorization has already been consumed/
  );

  // 3. Wrong app blocked (App 795)
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_WRONG_795', appId: 795 },
      { ...validReq, appId: 795 }
    ),
    /D3_PROCESS_DEPLOY_BLOCKED: Target App ID must be exactly 794/
  );

  // 4. Other wrong apps blocked (App 796, 798)
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_WRONG_796', appId: 796 },
      { ...validReq, appId: 796 }
    ),
    /D3_PROCESS_DEPLOY_BLOCKED: Target App ID must be exactly 794/
  );

  // 5. Permanent protected production apps hard-blocked (53, 283)
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_PROTECTED_53', appId: 53 },
      { ...validReq, appId: 53 }
    ),
    /WRITE BLOCKED: App 53 is a permanent PROTECTED PRODUCTION APP/
  );
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_PROTECTED_283', appId: 283 },
      { ...validReq, appId: 283 }
    ),
    /WRITE BLOCKED: App 283 is a permanent PROTECTED PRODUCTION APP/
  );

  // 6. Wrong work package blocked
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_WRONG_WP', workPackageId: 'WRONG_WP' },
      { ...validReq, workPackageId: 'WRONG_WP' }
    ),
    /D3_PROCESS_DEPLOY_BLOCKED: Work package must be exactly D3-SBX-DEPLOY-01/
  );

  // 7. Wrong stage blocked
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_WRONG_STAGE', stage: 'STAGE_WRONG' },
      { ...validReq, stage: 'STAGE_WRONG' }
    ),
    /D3_PROCESS_DEPLOY_BLOCKED: Stage must be exactly STAGE_D3_APP794_PROCESS_DEPLOY/
  );

  // 8. Wrong operation blocked
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_WRONG_OP', operation: 'WRONG_OPERATION' },
      { ...validReq, operation: 'WRONG_OPERATION' }
    ),
    /D3_PROCESS_DEPLOY_BLOCKED: Operation must be exactly APP794_D3_PROCESS_DEPLOY/
  );

  // 9. Missing or empty authorization ID blocked
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: '' },
      { ...validReq }
    ),
    /D3_PROCESS_DEPLOY_BLOCKED: A non-empty authorization ID is required/
  );
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: null },
      { ...validReq }
    ),
    /D3_PROCESS_DEPLOY_BLOCKED: A non-empty authorization ID is required/
  );

  // 10. Inactive window blocked
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_INACTIVE', activeWindow: false },
      { ...validReq }
    ),
    /D3_PROCESS_DEPLOY_BLOCKED: One-time write window is CLOSED/
  );

  // 11. Missing explicitUserAuthorization blocked
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_NO_EXPLICIT', explicitUserAuthorization: false },
      { ...validReq }
    ),
    /D3_PROCESS_DEPLOY_BLOCKED: Explicit user authorization is required/
  );

  // 12. State/Action count mismatch blocked (not 19/40)
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(
      { ...validAuth, authorizationId: 'AUTH_WRONG_COUNTS' },
      { ...validReq, expectedStateCount: 16, expectedActionCount: 31 }
    ),
    /D3_PROCESS_DEPLOY_BLOCKED: Exact target must be 19 states and 40 actions/
  );

  // 13. Missing or malformed configs fail closed
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(null, validReq),
    /D3_PROCESS_DEPLOY_BLOCKED \(FAIL-CLOSED\)/
  );
  assert.throws(
    () => assertD3App794ProcessDeployAuthorization(validAuth, null),
    /D3_PROCESS_DEPLOY_BLOCKED \(FAIL-CLOSED\)/
  );
});
