# D3-SBX-DEPLOY-01-EXE2-R2 Evidence Record

Updated: 2026-09-13 ICT

## 1. Package & Execution Metadata
```text
PACKAGE = D3-SBX-DEPLOY-01-EXE2-R2
TITLE = LOCAL SAFETY BYPASS CORRECTIVE
AUTHORIZED_BASE_HEAD = f7d8ecdedab15ca784944d3178725c3e26963015
AUTHORIZED_BASE_PARENT = cfb3c0abf0ae7088180669488f375a0f09cbaa19
AUTHORIZED_BASE_TREE = eeaa8631666aa7b39aa169eb27a8528a75515b27
AUTHORIZED_BASE_MESSAGE = fix(d3): harden app794 ui customization deployment safety contract (exe2-r1)
EXECUTION_PLANE = ANTIGRAVITY
ORCHESTRATION_CHANNEL = HERMES / TELEGRAM
TARGET_APP = 794
COMPONENT = UI CUSTOMIZATION DEPLOYMENT SAFETY CONTRACT (FINDINGS 1-3)
MODE = LOCAL SOURCE + TARGETED TESTS + CONTROL/EVIDENCE ONLY
STATUS = PASS / LOCAL SAFETY BYPASS CORRECTIVE COMPLETE / TARGETED TESTS PASS / ARTIFACT IDENTITY UNCHANGED / ZERO KINTONE I/O / ZERO DEPLOYMENT / REVIEW REQUIRED
```

## 2. Hard Operational Accounting & Zero-I/O Verification
```text
KINTONE_READS = 0
KINTONE_WRITES = 0
FILE_UPLOADS = 0
CUSTOMIZATION_PUTS = 0
DEPLOY_POSTS = 0
LIVE_POLLS = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
RECORD_WRITES = 0
ACL_WRITES = 0
UAT = 0
PRODUCTION_CUTOVER = 0
WRITE_RETRY_COUNT = 0
AUTOMATIC_ROLLBACK_WRITES = 0
PARTIAL_WRITE = FALSE
ZERO_WRITE_FAIL_CLOSED = ENFORCED
```

## 3. Dist Artifact Identity Invariant (Zero Drift)
```text
JS_FILE = dist/mbo-employee-app.js
JS_GIT_BLOB_SHA = 6a29a0e652ab8bb210589583b2a2ebfa2754aafa (MATCHES INVARIANT EXACTLY)

CSS_FILE = dist/mbo-employee.css
CSS_GIT_BLOB_SHA = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61 (MATCHES INVARIANT EXACTLY)

DIST_DRIFT = 0 BYTES / BIT-FOR-BIT IDENTICAL
```

## 4. Implementation Changes & Changed Files
- `src/core/sandbox-write-guard.js`:
  - Removed `_resetConsumedApp794DeployAuthorizationIdsForTest()` completely.
  - Ensured no alternative reset bypass exists in production code; one-shot authorization consumption remains strictly process-local, single-use, and replay-protected.
- `scripts/kintone/deploy-custom-ui.js`:
  - Closed `options.artifacts` bypass in `executeDeployCustomUi`: caller cannot supply artifact overrides (`CALLER_ARTIFACT_OVERRIDE_BLOCKED`). Artifact identity is strictly verified from actual disk files via `prepareDeploymentArtifacts`.
  - Closed `options.worktreeClean` bypass in `executeDeployCustomUi`: caller cannot declare clean status (`CALLER_WORKTREE_CLEAN_OVERRIDE_BLOCKED`). Working tree cleanliness is strictly inspected from actual Git status via `isWorktreeClean()`.
- `tests/sandbox-write-guard.test.js`:
  - Added assertion verifying `_resetConsumedApp794DeployAuthorizationIdsForTest` is undefined and not exported in production code.
  - Maintained regression verification that consumed authorization replay fails closed.
- `tests/deploy-customization-preservation.test.js`:
  - Removed unused import of `_resetConsumedApp794DeployAuthorizationIdsForTest`.
  - Removed `worktreeClean: true` caller overrides across all 9 `executeDeployCustomUi` test calls, ensuring tests verify the production contract without bypasses.
  - Added regression test `REGRESSION_FINDING_2: CALLER_ARTIFACT_OVERRIDE_CANNOT_BYPASS_IDENTITY_GUARD` verifying caller artifact override is rejected and disk identity is enforced.
  - Added regression test `REGRESSION_FINDING_3: CALLER_CLEAN_OVERRIDE_CANNOT_BYPASS_DIRTY_WORKTREE_GUARD` verifying caller clean override is rejected and actual Git status is inspected.

## 5. Finding Resolution & Blocker Mapping
```text
FINDING_1 (Remove production-exported authorization reset) ->
  - Removed `_resetConsumedApp794DeployAuthorizationIdsForTest` from src/core/sandbox-write-guard.js.
  - tests/sandbox-write-guard.test.js: verified reset function is undefined and replay fails closed.

FINDING_2 (Close options.artifacts bypass in live entrypoint) ->
  - Disallowed `options.artifacts` in `executeDeployCustomUi` with `CALLER_ARTIFACT_OVERRIDE_BLOCKED`.
  - Enforced disk-based artifact preparation via `prepareDeploymentArtifacts`.
  - tests/deploy-customization-preservation.test.js: REGRESSION_FINDING_2 passes.

FINDING_3 (Close options.worktreeClean override) ->
  - Disallowed `options.worktreeClean` in `executeDeployCustomUi` with `CALLER_WORKTREE_CLEAN_OVERRIDE_BLOCKED`.
  - Enforced actual Git worktree status inspection via `isWorktreeClean()`.
  - Removed `worktreeClean: true` from mock test calls in tests/deploy-customization-preservation.test.js.
  - tests/deploy-customization-preservation.test.js: REGRESSION_FINDING_3 passes.
```

### Test Accounting
- Command: `node --test tests/deploy-customization-preservation.test.js tests/sandbox-write-guard.test.js`
- `tests/deploy-customization-preservation.test.js`: 40 / 40 PASS
- `tests/sandbox-write-guard.test.js`: 7 / 7 PASS
- **Total Targeted Tests:** 47 / 47 PASS (0 FAIL, 0 CANCELLED, 0 SKIPPED)
- **Full Repository Integration Test:** NOT CLAIMED

## 6. Project & Readiness State
```text
ACTIVE_WORK_PACKAGE = NONE
NEXT_GATE_AUTHORIZED = NO
AUTO_START_NEXT_WORK_PACKAGE = NO
KINTONE_READ_AUTHORIZED = NO
KINTONE_WRITE_AUTHORIZED = NO
PROCESS_WRITE_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
UAT_AUTHORIZED = NO
PRODUCTION_READY = NO
```
