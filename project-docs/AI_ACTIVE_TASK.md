# AI ACTIVE TASK — ANTIGRAVITY STAGE 3C-R1 FINAL VERIFIER CORRECTION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Required starting HEAD:** `44e746dd9eb10012671b10747efb15edd0a998a3`
> **Target App:** 796
> **Mode:** FINAL CODE/TEST EXACTNESS CORRECTION + EVIDENCE METADATA ONLY
> **Kintone calls:** ZERO
> **Kintone writes:** ZERO

## REVIEW RESULT

Stage 3C-R1 is operationally repaired and current state reconciliation is positive:

```text
Historical repair PUT = 1
Historical repair Deploy POST = 1
Current App 796 = LIVE_DEPLOYED
Current schema = 23/23 DOMAIN_ALIGNED
Current ACL = CREATOR_ONLY / DEFAULT_DENY
Current record count = 0
Historical pre-write backup = FOUND / PASS
Current reconciliation = GET_ONLY / PASS
Latest tests = 237/237 PASS
Hardening task writes = 0
```

Independent review found two final exactness defects in the shared schema verifier logic. They do not imply that the live schema is wrong, but they prevent the safety gate from being considered fully fail-closed.

## MUST FIX 1 — OPTION LABEL MUST NOT FALL BACK TO `option.key`

Current code accepts an option when:

```text
actualOption.label === expectedKey OR actualOption.key === expectedKey
```

The contract requires the Kintone option **label itself** to equal the frozen value. A correct `key` property must never compensate for a wrong/missing label.

Apply this strict rule in both:

- `assertKnownStage3cDefectSchema()`
- `assertExact23FieldSchema()`

Required:

```text
actualOption.label === expectedKey
```

No fallback to `actualOption.key`.

## MUST FIX 2 — OPTION INDEX MUST BE PRESENT AND EXACT

Current corrected-schema verifier checks index only when `actualOption.index !== undefined`.

The schema contract requires every DROP_DOWN option index to be present and exact.

Required in `assertExact23FieldSchema()`:

```text
String(actualOption.index) === String(expectedIndex)
```

A missing index must fail.

`assertKnownStage3cDefectSchema()` must continue requiring every known-defect index exactly.

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
HEAD = 44e746dd9eb10012671b10747efb15edd0a998a3
local HEAD = remote HEAD
```

Do not reset/rebase/stash/force-push automatically.
Do not touch unrelated local files.

## STEP 1 — CODE / TEST CORRECTION

Allowed files only:

- `src/core/kintone-client.js`
- `tests/safety-guard.test.js`

Required changes:

1. In known-defect verification, require each option `label` exactly; remove `key` fallback.
2. In corrected exact-schema verification, require each option `label` exactly; remove `key` fallback.
3. In corrected exact-schema verification, require `index` to exist and exactly match the frozen order.
4. Preserve deep immutability of the repair payload.
5. Preserve all post-PUT/final App Detail/catalog/ACL/zero-record gates.
6. Preserve single-attempt/no-retry behavior and all protected-app/default-deny safety.
7. No Kintone access or `.env.local` use in this task.

Required tests:

- known-defect option with wrong label + matching `key` is rejected
- corrected-schema option with wrong label + matching `key` is rejected
- corrected-schema option with missing index is rejected
- corrected-schema option with wrong index is rejected
- valid known-defect exact schema still passes
- valid corrected 23/23 schema still passes
- existing Stage 3C-R1 tests remain passing
- `DISCOVERY_MODE = true` and `WRITE_ALLOWED_APPS = []`

Run:

```bash
git diff --check
npm test
```

All tests must pass.

Commit exactly:

```text
fix: enforce exact dropdown labels and indexes
```

Push only to `origin/ai/antigravity-wp002c` and verify local HEAD = remote HEAD.

## STEP 2 — EXISTING BACKUP METADATA STRENGTHENING, LOCAL ONLY

Do not call Kintone.
Do not recreate or modify any backup.

If the genuine existing artifact `app796_stage3c_pre_write_backup.json` is still present, compute a local SHA-256 of the existing file and record only the safe hash in review metadata.

Also run the newly strict known-defect verifier against every saved pre-write form-field payload actually present in that artifact:

```text
HISTORICAL_PREVIEW_DEFECT_EXACT_STRICT = PASS/FAIL/NOT_PRESENT
HISTORICAL_LIVE_DEFECT_EXACT_STRICT = PASS/FAIL/NOT_PRESENT
```

Do not invent a missing payload.
Do not commit the backup file or raw payloads.

If the artifact is no longer available, retain the previously recorded backup evidence and state that strict re-verification is unavailable; do not fabricate a hash.

## STEP 3 — MINIMAL LIVING-DOC UPDATE

No Kintone reconciliation is required again because this task changes verifier code only and the immediately preceding GET-only reconciliation already passed.

Update only current operational metadata in:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`

Record:

```text
Stage 3C-R1 live repair state = DOMAIN_ALIGNED / unchanged
Historical repair PUT = 1
Historical repair Deploy POST = 1
This final verifier task Kintone calls = 0
This final verifier task Kintone writes = 0
Latest current reconciliation = GET_ONLY PASS at prior evidence checkpoint
PREWRITE_BACKUP_GATE = PASS
strict saved-payload results = exact actual results
latest npm test count = actual result
NEXT_ACTION = AWAIT CHATGPT FINAL STAGE 3C REVIEW
```

Do not claim WP002C_STAGE3C_GATE = PASS yourself. Final Gate ownership remains ChatGPT.

Commit exactly:

```text
docs: record final wp-002c verifier correction
```

Push, verify local HEAD = remote HEAD and tracked working tree clean, then STOP.

## KINTONE BOUNDARY

```text
GET = 0
POST = 0
PUT = 0
DELETE = 0
DEPLOY = 0
RECORD WRITE = 0
```

Do not use `.env.local`.
Do not access App 796.
Do not repeat repair.
Do not seed records.
Do not start publish pipeline.
Do not start WP-002D.

# REVIEW EXPECTATION

ChatGPT will verify:

1. Exactly two new commits: code/tests then living-doc metadata.
2. No Kintone calls/writes occurred.
3. No option-label verification uses `option.key` as a substitute for label.
4. Corrected schema requires every dropdown index to be present and exact.
5. Known-defect verifier continues to require all exact labels/indexes/default rules.
6. Repair payload remains deeply immutable.
7. Final repair success path remains App-detail/catalog/ACL/live-schema/zero-record fail-closed.
8. Existing backup metadata is strengthened without recreating historical evidence.
9. Full test suite passes.
10. Global/default safety is unchanged.
11. Live state remains recorded as DOMAIN_ALIGNED / zero records / no seed.
12. No publish pipeline or WP-002D work starts.

Expected gates:

- `OPTION_LABEL_EXACTNESS_GATE = PASS / FAIL`
- `OPTION_INDEX_EXACTNESS_GATE = PASS / FAIL`
- `KNOWN_DEFECT_EXACT_GATE = PASS / FAIL`
- `REPAIR_PAYLOAD_IMMUTABILITY_GATE = PASS / FAIL`
- `PREWRITE_BACKUP_GATE = PASS / UNVERIFIABLE / FAIL`
- `ZERO_KINTONE_FINAL_CORRECTION_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `WP002C_STAGE3C_GATE = PASS / BLOCKED`
