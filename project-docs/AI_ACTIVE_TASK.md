# AI ACTIVE TASK — ANTIGRAVITY STAGE 3C REVIEW CORRECTION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Required starting HEAD:** `6d27b9cdc04d7ea72ef9d6d38b34b1dab27cc9b3`
> **Target App:** 796
> **Mode:** CODE + TEST + LIVING-DOC CORRECTION ONLY
> **Kintone calls:** FORBIDDEN in this task
> **Kintone writes:** ZERO

## REVIEW RESULT

Stage 3C execution sequencing and evidence were strong:

```text
implementation commit before Kintone write = PASS
implementation commit = 41ad63d293a9de3e61a2fc6851af0df3d2a5fa9f
evidence commit = 6d27b9cdc04d7ea72ef9d6d38b34b1dab27cc9b3
Form Fields POST attempts = 1
Deploy POST attempts = 1
Deploy status = SUCCESS
Live App 796 = verified
Live ACL = CREATOR_ONLY / DEFAULT_DENY
Live field readback = 23/23
Record count = 0
Reported tests = 193/193 PASS
```

However independent review found blocking semantic/safety defects.

## BLOCKER 1 — DROP-DOWN STORED VALUES DO NOT MATCH FROZEN DOMAIN VALUES

Current Stage-3C manifest incorrectly uses display-order prefixes inside option labels/values:

```text
Part_A_Scoring_Mode:
  "0 DIFFICULTY_ACHIEVEMENT_MATRIX"
  "1 ACHIEVEMENT_DIRECT"

Config_Status:
  "0 DRAFT"
  "1 VALIDATED"
  "2 PUBLISHED"
  "3 SUPERSEDED"
  "4 RETIRED"
```

This is incompatible with frozen domain/runtime values in `src/profiles/scoring-config-master.js` and `src/profiles/profile-scoring-resolver.js`, which require:

```text
Part_A_Scoring_Mode values:
  DIFFICULTY_ACHIEVEMENT_MATRIX
  ACHIEVEMENT_DIRECT

Config_Status values:
  DRAFT
  VALIDATED
  PUBLISHED
  SUPERSEDED
  RETIRED
```

The numeric order belongs only in Kintone option `index`; it must not be part of the option value/label.

**Control Plane acknowledges the previous Stage-3C task specified the prefixed labels incorrectly. Antigravity followed that instruction; this is a Control Plane contract correction.**

## BLOCKER 2 — PREFLIGHT CAN DEPLOY PRE-EXISTING 23-FIELD PREVIEW STATE

Current `configureAndDeployScoringMasterSchema()` contains a path equivalent to:

```text
if preview has all 23 fields:
  treat fieldPostAttempts as 1
  continue to deploy
```

This violates the Stage-3C safety contract. Before the authorized field POST, **any planned field already present in live OR preview must fail closed and STOP**. Only a transport-uncertainty reconciliation that occurs *after this process actually attempted the one authorized field POST* may inspect 23/23 fields and continue.

Also do not report `fieldPostAttempts = 1` when no POST was actually sent.

## MUST FIX 1 — SCHEMA AUTHORIZATION MUST BIND THE EXACT CONTRACT

The Stage-3C authorization guard currently checks WP/stage/App/name/sequence but not an explicit schema contract identifier.

Do not duplicate all 23 field definitions into the guard. Add a frozen contract identifier such as:

```text
WP002C_SCHEMA_CONTRACT_ID = WP002C_23_FIELDS_V1
```

Require the request to contain that exact contract ID. The client remains hard-bound to the internal exact 23-field manifest, so caller-supplied field bodies/endpoints remain impossible.

## MUST FIX 2 — LIVING DOC CONSISTENCY

`CURRENT_STATE.md` still reports `171/171` although the Stage-3C evidence reports `193/193`.

`HANDOFF.md` top summary currently says `SCHEMA/RECORD/DELETE WRITES = 0` even though Stage 3C performed one Form Fields POST. Correct the write summary without changing historical Stage-3A/3B logs.

Until the live two-drop-down correction is separately authorized and verified, living docs must not imply Stage 3C passed review. Record:

```text
WP002C_STAGE3C_GATE = BLOCKED
SCHEMA_PHYSICAL_STATE = 23_FIELDS_LIVE
SCHEMA_SEMANTIC_STATE = CORRECTION_REQUIRED
CORRECTION_REQUIRED_FIELDS = Part_A_Scoring_Mode, Config_Status
RECORD_COUNT = 0
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
```

## OFFICIAL KINTONE SEMANTICS TO PRESERVE

Kintone form option `index` controls display order. The option name/label is the business value used for selection/query semantics. Therefore use raw frozen domain values as option names/labels and keep order only in `index`.

Future correction write (NOT authorized in this task) will update only the two existing DROP_DOWN option labels and deploy App 796 after separate Control Plane authorization.

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
HEAD = 6d27b9cdc04d7ea72ef9d6d38b34b1dab27cc9b3
local HEAD = remote HEAD
```

Pre-existing unrelated IDE files must not be modified, staged, deleted, stashed, reset, or committed.

## STEP 1 — CODE / TEST CORRECTION

Allowed implementation files only:

- `src/core/kintone-client.js`
- `src/core/sandbox-write-guard.js`
- `tests/safety-guard.test.js`

Required changes:

1. Change Stage-3C manifest options to raw domain values with index only for ordering.
2. Update exact-schema readback assertion/tests accordingly.
3. Remove/deny the preflight path that accepts 23 pre-existing preview fields.
4. Preflight must fail if any planned field exists in live OR preview.
5. Transport uncertainty reconciliation remains allowed only after this function has actually attempted its authorized Form Fields POST.
6. Return/report actual write-attempt counters; never synthesize `1` when no POST occurred.
7. Add exact `WP002C_SCHEMA_CONTRACT_ID` binding to Stage-3C authorization.
8. Preserve hard-bound App 796, exact endpoint paths, one-attempt behavior, protected-app blocks, `DISCOVERY_MODE = true`, and `WRITE_ALLOWED_APPS = []`.
9. Do not add a Kintone correction PUT function yet. That write belongs to a separately authorized task.

Required tests include:

- raw Part A option keys/labels exactly match `PART_A_SCORING_MODES` values and indexes 0/1
- raw Config Status option keys/labels exactly match `CONFIG_LIFECYCLE_STATUS` values and indexes 0..4
- prefixed labels are rejected by exact schema assertion
- missing/wrong schema contract ID rejected
- preview containing 1 planned field stops with zero POST/deploy
- preview containing all 23 planned fields before authorized POST also stops with zero POST/deploy
- actual field POST attempt counter equals actual POST count
- uncertain transport reconciliation still never retries POST
- no safety regression for Apps 794/795/protected Apps

Run:

```bash
git diff --check
npm test
```

All tests must pass.

Commit only the three authorized implementation/test files:

```text
fix: align wp-002c schema values and preflight safety
```

Push to `origin/ai/antigravity-wp002c` and verify local HEAD = remote HEAD.

## STEP 2 — LIVING-DOC CORRECTION

After implementation commit is pushed, update only:

- `project-docs/CURRENT_STATE.md`
- `project-docs/HANDOFF.md`
- `project-docs/AI_REVIEW_PACKAGE.md`
- `project-docs/IMPLEMENTATION_STATUS.md`
- `project-docs/CHANGELOG_AI.md`

Required state:

```text
Active AI = Antigravity
Branch = ai/antigravity-wp002c
Stage 3B = PASS
Stage 3C physical write execution = COMPLETE
WP002C_STAGE3C_GATE = BLOCKED / CORRECTION_REQUIRED
App 796 = LIVE_DEPLOYED
SCHEMA_PHYSICAL_STATE = 23_FIELDS_LIVE
SCHEMA_SEMANTIC_STATE = CORRECTION_REQUIRED
CORRECTION_REQUIRED_FIELDS = Part_A_Scoring_Mode, Config_Status
RECORD_COUNT = 0
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = NOT_DEPLOYED
NEXT_ACTION = AWAIT CHATGPT REVIEW OF STAGE3C CODE CORRECTION BEFORE ANY KINTONE REPAIR WRITE
```

Use the actual new full test count in all living docs; do not leave stale `171/171` or `193/193` if the new count changes.

Correct Stage-3C write summary to:

```text
FORM FIELDS POST = 1 historical Stage-3C write
DEPLOY POST = 1 historical Stage-3C write
APP_CREATE = 0
ACL PUT = 0
RECORD/DELETE/LAYOUT/VIEW/PROCESS/CUSTOMIZATION writes = 0
THIS CORRECTION TASK KINTONE CALLS = 0
```

Commit:

```text
docs: record wp-002c stage3c correction required
```

Push to `origin/ai/antigravity-wp002c`, verify local HEAD = remote HEAD and clean tracked working state, then STOP.

## KINTONE BOUNDARY FOR THIS TASK

```text
Kintone GET = 0
Kintone POST = 0
Kintone PUT = 0
Kintone DELETE = 0
Kintone DEPLOY = 0
```

Do not use `.env.local`.
Do not access App 796 API in this task.
Do not update the live dropdowns yet.
Do not seed records.
Do not start WP-002D.

# REVIEW EXPECTATION

ChatGPT will verify:

1. Exactly two new commits after this Control Plane task: code/tests then docs.
2. No unrelated IDE files are committed.
3. Drop-down business values exactly match frozen domain enums; numeric order exists only in `index`.
4. Resolver requirement `Config_Status === PUBLISHED` is compatible with the corrected schema manifest.
5. Stage-3C preflight fails on any pre-existing planned field, including full 23/23 preview state.
6. Transport uncertainty reconciliation is reachable only after an actual Form Fields POST attempt.
7. Attempt counters reflect actual requests.
8. Schema authorization binds exact contract ID.
9. Global/default safety remains unchanged.
10. Tests all pass.
11. Living docs explicitly mark Stage 3C BLOCKED / correction required and use the actual test total.
12. Historical Form Fields POST=1 and Deploy POST=1 remain recorded accurately.
13. This correction task made zero Kintone calls/writes.
14. No seed/publish/WP-002D work started.

Expected gates:

- `STAGE3C_CODE_CORRECTION_GATE = PASS / FAIL`
- `DOMAIN_VALUE_COMPATIBILITY_GATE = PASS / FAIL`
- `PREFLIGHT_FAIL_CLOSED_GATE = PASS / FAIL`
- `SCHEMA_AUTHORIZATION_GATE = PASS / FAIL`
- `DOC_CONSISTENCY_GATE = PASS / FAIL`
- `ZERO_KINTONE_CORRECTION_CALL_GATE = PASS / FAIL`
- `REGRESSION_GATE = PASS / FAIL`
- `GIT_PUSH_SYNC_GATE = PASS / FAIL`
- `WP002C_STAGE3C_GATE = BLOCKED / READY_FOR_SCHEMA_REPAIR_AUTHORIZATION`
