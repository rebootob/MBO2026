# AI ACTIVE TASK — ANTIGRAVITY STAGE 3C-R1 REVIEW HARDENING

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Required starting HEAD:** `d38a96520152f9a72af7d19ac0a852fe8f4afe68`
> **Target App:** 796
> **Mode:** CODE/TEST HARDENING + GET-ONLY RECONCILIATION + EVIDENCE CORRECTION
> **Kintone writes:** ZERO

## REVIEW RESULT

Stage 3C-R1 execution evidence is positive but independent review found safety/evidence gaps that must be closed before the gate can pass.

Accepted evidence so far:

```text
implementation commit before write = 4bef27e4660322adba811ebe058dadffae9681ee
repair evidence commit = d38a96520152f9a72af7d19ac0a852fe8f4afe68
Form Fields PUT attempts = 1
Deploy POST attempts = 1
claimed live 23/23 corrected readback = PASS
claimed ACL = CREATOR_ONLY / DEFAULT_DENY
claimed record count = 0
reported tests = 227/227 PASS
```

## MUST FIX A — KNOWN-DEFECT PREFLIGHT IS NOT EXACT ENOUGH

`assertKnownStage3cDefectSchema()` currently checks option keys and only some indexes, but does not prove all known-defect option labels, every Config_Status index, or absence of unexpected default values.

Require exact known-defect verification:

```text
Part_A_Scoring_Mode
  key/label "0 DIFFICULTY_ACHIEVEMENT_MATRIX" index 0
  key/label "1 ACHIEVEMENT_DIRECT" index 1

Config_Status
  key/label "0 DRAFT" index 0
  key/label "1 VALIDATED" index 1
  key/label "2 PUBLISHED" index 2
  key/label "3 SUPERSEDED" index 3
  key/label "4 RETIRED" index 4
```

For all 23 fields, reject any unexpected default business value.

## MUST FIX B — REPAIR PAYLOAD MUST BE DEEPLY IMMUTABLE

The exported repair payload is shallow-frozen but option leaf objects remain mutable. A caller/importer must not be able to mutate any option label/index before execution.

Deep-freeze all nested repair payload objects, or replace with an internal exact-payload factory that returns a fresh deeply controlled object while exposing only a safe read-only representation for tests. Do not add caller-supplied repair properties.

## MUST FIX C — SUCCESS PATH MUST ENFORCE ALL FINAL READ-BACK GATES

`repairScoringMasterDropdownSchema()` currently verifies final live settings/fields/ACL but does not itself require:

```text
GET /k/v1/app.json?id=796
GET /k/v1/apps.json?ids[0]=796
final GET records -> zero records
```

It also does not recheck zero records after PUT and before deploy.

Add fail-closed checks:

1. preflight record set empty before PUT
2. preview corrected readback
3. record set still empty after PUT and before deploy
4. deploy success
5. live App Detail exact
6. Get Apps contains exact App 796/name
7. live settings exact
8. live ACL exact
9. live 23/23 exact corrected schema
10. final record set empty

The function may return `semanticState = DOMAIN_ALIGNED` only after all ten gates pass.

## MUST FIX D — PRE-WRITE BACKUP EVIDENCE WAS NOT RECORDED

The Stage 3C-R1 task required a secure local pre-write backup and safe hash/ID, but the Git evidence does not record it.

Do NOT recreate a "pre-write" backup now and call it historical evidence.

Inspect existing local secure-backup artifacts/logs from the Stage 3C-R1 execution only.

If a genuine pre-write backup exists:

```text
PREWRITE_BACKUP_GATE = PASS
BACKUP_VERIFIED = YES
BACKUP_EVIDENCE_ID_OR_HASH = <safe hash/id>
```

Use the saved pre-write live/preview form-field payloads to run the corrected exact-known-defect verifier locally. Record only:

```text
HISTORICAL_PREWRITE_DEFECT_EXACT_GATE = PASS/FAIL
```

Do not commit backup payloads or sensitive environment/account metadata.

If no genuine pre-write artifact can be proven:

```text
PREWRITE_BACKUP_GATE = UNVERIFIABLE
```

Do not invent evidence; Stage 3C-R1 remains BLOCKED.

# STEP 0 — GIT SAFETY

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
HEAD = d38a96520152f9a72af7d19ac0a852fe8f4afe68
local HEAD = remote HEAD
```

Do not reset/rebase/stash/force-push automatically.

# STEP 1 — CODE / TEST HARDENING

Allowed implementation files only:

- `src/core/kintone-client.js`
- `tests/safety-guard.test.js`
- `src/core/sandbox-write-guard.js` only if necessary for preserving repair authorization safety

Required tests include:

- known defect rejects wrong Part A option label
- known defect rejects wrong Config_Status option label
- known defect rejects every wrong Config_Status index, including middle options
- known defect rejects unexpected defaultValue on any field
- repair payload nested option objects cannot be mutated, or exact factory always returns pristine payload
- post-PUT nonzero record result prevents deploy
- final App Detail mismatch fails success
- Get Apps missing App 796 fails success
- final nonzero record result fails success
- final successful result requires catalog + final zero-record gates
- all existing Stage 3C-R1 single-attempt / no-retry / protected-app tests remain passing

Run:

```bash
git diff --check
npm test
```

Commit implementation/tests before any Kintone call:

```text
fix: harden wp-002c dropdown repair verification
```

Push to `origin/ai/antigravity-wp002c` and verify local HEAD = remote HEAD.

# STEP 2 — HISTORICAL BACKUP PROOF, LOCAL ONLY

After the code commit is pushed, inspect only genuine local Stage 3C-R1 pre-write backup artifacts/logs.

Do not call Kintone in this step.
Do not edit or regenerate the historical backup.
Do not reveal secrets or raw backup contents.

Use the corrected known-defect verifier against saved live/preview field payloads if available.

Record safe results only.

# STEP 3 — CURRENT STATE GET-ONLY RECONCILIATION

Kintone GET only is authorized. No POST/PUT/DELETE/DEPLOY.

Verify current App 796:

```text
GET /k/v1/app.json?id=796
GET /k/v1/apps.json?ids[0]=796
GET /k/v1/app/settings.json?app=796
GET /k/v1/app/acl.json?app=796
GET /k/v1/app/form/fields.json?app=796
GET /k/v1/preview/app/form/fields.json?app=796
GET /k/v1/records.json?app=796&query=limit%201
```

Require:

```text
App ID/name exact
catalog contains App 796
ACL = CREATOR_ONLY / DEFAULT_DENY
live schema = corrected exact 23/23
preview schema = corrected exact 23/23
raw dropdown values/indexes exact
record set empty
```

Run `npm test` again after reconciliation; all tests must pass.

# STEP 4 — EVIDENCE / LIVING DOC CORRECTION

Update only:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`

Do not change `APP_REGISTRY.md` unless current GET reconciliation contradicts its existing domain-aligned entry.

Record:

```text
Stage 3C-R1 historical PUT = 1
Stage 3C-R1 historical Deploy POST = 1
THIS HARDENING TASK KINTONE WRITES = 0
CURRENT RECONCILIATION = GET_ONLY
PREWRITE_BACKUP_GATE = PASS / UNVERIFIABLE / FAIL
HISTORICAL_PREWRITE_DEFECT_EXACT_GATE = PASS / UNVERIFIABLE / FAIL
CURRENT_LIVE_SCHEMA_GATE = PASS / FAIL
CURRENT_ZERO_RECORD_GATE = PASS / FAIL
```

If backup gate and historical exact-defect gate both PASS and current reconciliation fully PASS:

```text
STAGE 3C-R1 = COMPLETE / PENDING CHATGPT RE-REVIEW
SCHEMA_SEMANTIC_STATE = DOMAIN_ALIGNED
```

Otherwise keep:

```text
WP002C_STAGE3C_GATE = BLOCKED
```

Use actual current full test count in current operational sections.

Commit:

```text
docs: complete wp-002c dropdown repair evidence
```

Push, verify local HEAD = remote HEAD and tracked working tree clean, then STOP.

# KINTONE BOUNDARY

```text
GET = allowed only in Step 3
POST = 0
PUT = 0
DELETE = 0
DEPLOY = 0
RECORD WRITE = 0
```

Do not repair again.
Do not seed records.
Do not start publish pipeline.
Do not start WP-002D.

# REVIEW EXPECTATION

ChatGPT will verify:

1. Code/test hardening commit precedes GET reconciliation/evidence commit.
2. No new Kintone writes occurred.
3. Known-defect verifier checks exact keys, exact labels, all indexes, and defaults.
4. Repair payload is deeply immutable / non-injectable.
5. Success path requires post-PUT zero-record, final App Detail, catalog, final live exact schema, ACL, and final zero-record gates.
6. Genuine historical pre-write backup evidence is recorded without fabricating a new backup.
7. Saved pre-write schema, if available, passes the corrected exact-known-defect verifier.
8. Current GET-only reconciliation proves App 796/catalog/ACL/live+preview corrected 23/23/zero record.
9. Full tests pass.
10. Git evidence accurately distinguishes historical writes from this zero-write hardening task.
11. Apps 794/795 and protected Apps receive zero writes.
12. No seed/publish/WP-002D work starts.

Expected gates:

- `STAGE3C_R1_CODE_HARDENING_GATE = PASS / FAIL`
- `KNOWN_DEFECT_EXACT_GATE = PASS / FAIL`
- `REPAIR_PAYLOAD_IMMUTABILITY_GATE = PASS / FAIL`
- `PREWRITE_BACKUP_GATE = PASS / UNVERIFIABLE / FAIL`
- `HISTORICAL_PREWRITE_DEFECT_EXACT_GATE = PASS / UNVERIFIABLE / FAIL`
- `CURRENT_LIVE_RECONCILIATION_GATE = PASS / FAIL`
- `CURRENT_ZERO_RECORD_GATE = PASS / FAIL`
- `ZERO_NEW_WRITE_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `WP002C_STAGE3C_GATE = PASS / BLOCKED`
