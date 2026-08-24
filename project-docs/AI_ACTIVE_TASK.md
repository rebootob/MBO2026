# AI ACTIVE TASK — ANTIGRAVITY STAGE 3C FINAL BINDING CORRECTION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Required starting HEAD:** `e7bc9f5866e26f37d961efe9071b7e2a29bb574a`
> **Target App:** 796
> **Mode:** CODE + TEST + MINIMAL DOC CORRECTION ONLY
> **Kintone calls:** FORBIDDEN
> **Kintone writes:** ZERO

## REVIEW RESULT

The prior correction substantially passed:

```text
Two commits in required order = PASS
Dropdown domain values corrected = PASS
Numeric ordering only in option index = PASS
Preflight rejects pre-existing preview planned fields = PASS
Transport uncertainty path remains post-attempt reconciliation = PASS
Living docs correction-required state = PASS
Historical write counts = PASS
Reported regression = 196/196 PASS
Correction-task Kintone calls = 0
```

One MUST FIX remains before live schema repair can be authorized.

## MUST FIX 1 — REQUEST CONTRACT ID IS NOT STRICTLY REQUIRED

Current guard logic accepts the schema contract when either `requestConfig` OR `authConfig` contains the correct ID:

```text
request wrong/missing + auth correct -> can pass
```

Current exact-purpose client also injects the contract ID internally before calling the guard, so a caller that omits the required contract ID can still pass.

Required contract:

```text
requestConfig.schemaContractId MUST equal WP002C_SCHEMA_CONTRACT_ID
```

`authConfig.schemaContractId` may also be checked if present, but it must never substitute for a missing/wrong request contract ID.

The exact-purpose client must not silently manufacture the caller's authorization contract. It must pass `requestConfig` as supplied to the guard and fail before any fetch when the request contract ID is missing or wrong.

## MUST FIX 2 — EXACT SCHEMA VERIFIER MUST CHECK FIELD LABELS

Stage-3C contract froze:

```text
field label = exact field code
```

`assertExact23FieldSchema()` currently validates type / required / unique / dropdown options but does not prove `actual.label === spec.code` for every one of the 23 fields.

Add that verification so future read-back cannot claim exact-contract PASS when a field label has drifted.

## MUST FIX 3 — HISTORICAL COMMIT MESSAGE ACCURACY

`AI_REVIEW_PACKAGE.md` currently describes commit `41ad63d...` with a message different from the actual Git commit.

Actual commit message is:

```text
feat: add guarded wp-002c schema configuration
```

Correct the review package metadata only. Do not rewrite Git history.

## STEP 0 — GIT SAFETY

Run:

```bash
git status --short
git branch --show-current
git fetch origin
git rev-parse HEAD
git rev-parse origin/ai/antigravity-wp002c
```

Required:

```text
branch = ai/antigravity-wp002c
HEAD = e7bc9f5866e26f37d961efe9071b7e2a29bb574a
local HEAD = remote HEAD
```

Do not reset/rebase/stash/force-push automatically.
Do not touch unrelated local files.

## STEP 1 — CODE / TEST FIX

Allowed files:

- `src/core/sandbox-write-guard.js`
- `src/core/kintone-client.js`
- `tests/safety-guard.test.js`

Required changes:

1. `assertScoringMasterSchemaAuthorization()` must require `requestConfig.schemaContractId === WP002C_SCHEMA_CONTRACT_ID` unconditionally.
2. `authConfig.schemaContractId` must not be accepted as a substitute for request contract ID.
3. `configureAndDeployScoringMasterSchema()` must not inject/manufacture `schemaContractId`; pass request config to the guard as supplied.
4. Missing/wrong request contract ID must fail before `getAppCreationConnection()` and before any fetch.
5. Add `actual.label === spec.code` verification for all 23 fields in `assertExact23FieldSchema()`.
6. Preserve all prior domain-value, fail-closed, single-attempt, App-796-only and protected-app safety fixes.
7. Do not add any live repair PUT/POST code in this task.

Required tests:

- direct guard rejects missing request schema contract ID
- direct guard rejects wrong request schema contract ID even if authConfig contains the correct ID
- exact-purpose client rejects missing request schema contract ID with fetch call count = 0
- exact-purpose client rejects wrong request schema contract ID with fetch call count = 0
- all 23 generated labels equal field codes
- readback with one altered field label is rejected
- raw dropdown values/index tests remain passing
- full 23 pre-existing preview fail-closed tests remain passing
- protected Apps and write defaults remain unchanged

Run:

```bash
git diff --check
npm test
```

All tests must pass.

Commit only the three code/test files:

```text
fix: enforce wp-002c schema contract binding
```

Push to `origin/ai/antigravity-wp002c` and verify local HEAD = remote HEAD.

## STEP 2 — MINIMAL REVIEW METADATA FIX

Allowed doc file only:

- `project-docs/AI_REVIEW_PACKAGE.md`

Correct the historical `41ad63d...` commit message to exactly:

```text
feat: add guarded wp-002c schema configuration
```

Preserve:

```text
WP002C_STAGE3C_GATE = BLOCKED / CORRECTION_REQUIRED
SCHEMA_PHYSICAL_STATE = 23_FIELDS_LIVE
SCHEMA_SEMANTIC_STATE = CORRECTION_REQUIRED
CORRECTION_REQUIRED_FIELDS = Part_A_Scoring_Mode, Config_Status
RECORD_COUNT = 0
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
```

Update test total in this document if the full suite count changes.
Do not claim repair completed.

Commit:

```text
docs: correct wp-002c stage3c review metadata
```

Push and verify local HEAD = remote HEAD, then STOP.

## KINTONE BOUNDARY

```text
Kintone GET = 0
Kintone POST = 0
Kintone PUT = 0
Kintone DELETE = 0
Kintone DEPLOY = 0
```

Do not use `.env.local`.
Do not access App 796.
Do not repair dropdowns yet.
Do not seed records.
Do not start publish pipeline or WP-002D.

# REVIEW EXPECTATION

ChatGPT will verify:

1. Exactly two new commits: code/tests then one review-metadata doc.
2. Request schema contract ID is mandatory and cannot be substituted by authConfig.
3. Exact-purpose client does not inject authorization contract ID.
4. Missing/wrong contract fails before fetch.
5. Exact schema verifier enforces labels equal field codes for all 23 fields.
6. Existing raw dropdown domain values remain correct.
7. Existing preflight fail-closed and one-attempt safety remain correct.
8. Global safety defaults remain unchanged.
9. Full tests pass.
10. AI_REVIEW_PACKAGE records the real 41ad63d commit message.
11. This task performs zero Kintone calls.
12. Stage 3C remains BLOCKED / CORRECTION_REQUIRED until a separate live repair authorization.

Expected gates:

- `SCHEMA_AUTHORIZATION_GATE = PASS / FAIL`
- `EXACT_SCHEMA_LABEL_GATE = PASS / FAIL`
- `PREFLIGHT_FAIL_CLOSED_GATE = PASS / FAIL`
- `DOMAIN_VALUE_COMPATIBILITY_GATE = PASS / FAIL`
- `DOC_METADATA_GATE = PASS / FAIL`
- `ZERO_KINTONE_CORRECTION_CALL_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `WP002C_STAGE3C_GATE = BLOCKED / READY_FOR_SCHEMA_REPAIR_AUTHORIZATION`
