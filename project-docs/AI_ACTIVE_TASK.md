# AI ACTIVE TASK — R2D-R2 FINAL SUPERSESSION AUTHORIZATION CLOSURE

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation HEAD: `a046419bd5e11653fb1d6c84fe97fda0b97460a4`
> Mode: CREDIT-SAVER / PROJECT CLOSE
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY: **0**

## REVIEW RESULT

```text
R2D_R1 = MUST_FIX
SERVICE_REAL_REPOSITORY_INTEGRATION = PASS
CROSS_LAYER_SUPERSESSION_PATH = PASS
ATOMIC_BULK_REPOSITORY = PASS
DGM_V110_CANDIDATE_HASH = PASS
SUPERSESSION_AUTHORIZATION_GUARD = MUST_FIX
```

This is ONE local correction round only. Do not perform discovery, UI work, docs cleanup, Kintone contact, browser smoke, or unrelated refactor.

## DEFECT 1 — STRUCTURED BACKUP MUST BE MANDATORY

Current `assertScoringMasterSupersessionAuthorization()` still accepts legacy fallback:

```js
prewriteBackupVerified === true
```

when `backupEvidence` is absent.

Remove this fallback for supersession authorization.

Supersession MUST require `authConfig.backupEvidence` as a plain structured object containing all of:

```text
appId = 796
appName = exact WP002C_APPROVED_APP_NAME
snapshotScope = non-empty string
captured = true
verified = true
retainedUntilIndependentReview = true
artifactPath = non-empty string
sha256 = 64-char lowercase hex
capturedAt = valid timezone-aware ISO-8601 datetime
recordCount = non-negative safe integer
```

Missing `backupEvidence` must FAIL CLOSED.

Do not retain boolean-only compatibility for this supersession operation.

## DEFECT 2 — AUTH CONTRACT ID MUST BE REQUIRED ON BOTH SIDES

Current code allows `authConfig.contractId === undefined`.

Require BOTH:

```text
authConfig.contractId = WP002C_SUPERSEDE_V1
requestConfig.contractId = WP002C_SUPERSEDE_V1
```

Missing or wrong value on either side must FAIL CLOSED.

## DEFECT 3 — EXPECTED STATUS SWITCH MUST BE REQUIRED

Current guard validates expected statuses only when values are provided.

Require all four fields and exact values:

```text
expectedPredecessorCurrentStatus = PUBLISHED
expectedPredecessorNextStatus = SUPERSEDED
expectedNewCurrentStatus = VALIDATED
expectedNewNextStatus = PUBLISHED
```

Missing OR wrong value must FAIL CLOSED.

## DEFECT 4 — FIX INTEGRATION TEST TO USE REAL REQUIRED BACKUP CONTRACT

`tests/scoring-config-supersession-integration.test.js` currently authorizes supersession with:

```js
prewriteBackupVerified: true
```

Replace it with deterministic structured `backupEvidence` matching the production guard contract.

Use synthetic local evidence only. No filesystem/network/Kintone dependency is required for this test.

## REQUIRED NEGATIVE COVERAGE

Add/adjust focused tests proving rejection for:

```text
missing backupEvidence
legacy prewriteBackupVerified=true without backupEvidence
missing authConfig.contractId
wrong authConfig.contractId
missing request contractId
missing each expected status field
wrong each expected status field
```

Retain existing replay/identity/app/stage/operation/revision/record-id negative tests.

## HARD BOUNDARIES

```text
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
APP794_CHANGE = 0
APP795_CHANGE = 0
APP796_RUNTIME_CHANGE = 0
UI_CHANGE = 0
SERVICE_BUSINESS_LOGIC_CHANGE = 0 unless required solely to satisfy this guard correction
REPOSITORY_BULK_SHAPE_CHANGE = 0
```

Do NOT perform DGM restoration or v1.1.0 creation in this task.
Do NOT rerun browser smoke.
Do NOT clean stale project documentation broadly.

## TEST PLAN

1. Change only guard + directly affected tests.
2. Run targeted supersession guard tests.
3. Run cross-layer supersession integration test once.
4. Run `npm test` once because source changes.
5. Confirm zero Kintone contact.
6. Commit and push same branch.
7. STOP.

Expected final evidence:

```text
R2D_R2 = READY_FOR_CHATGPT_REVIEW
STRUCTURED_BACKUP_REQUIRED = PASS
AUTH_CONTRACT_BOTH_SIDES_REQUIRED = PASS
EXPECTED_STATUS_SWITCH_REQUIRED = PASS
CROSS_LAYER_SUPERSESSION_TEST = PASS
KINTONE_CALL_COUNT = 0
KINTONE_WRITE_COUNT = 0
NPM_TEST = PASS
```

Return only:

```text
STATUS: READY FOR CHATGPT REVIEW
FILES_CHANGED:
TEST:
KINTONE_CALLS: 0
KINTONE_WRITES: 0
GIT_BRANCH:
GIT_COMMIT:
BLOCKERS:
```

Then STOP.
