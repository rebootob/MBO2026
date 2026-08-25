# AI ACTIVE TASK — DELIVERY DAY SPRINT 03A-R2: FINAL DOCUMENTATION TRUTH CORRECTION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed head:** `962925b1ab3ead250f2367c06c0161f0a85cda67`
> **Mode:** DOCUMENTATION-ONLY FINAL CORRECTION — KINTONE WRITES = 0 / CODE CHANGES = 0

# TODAY NORTH STAR

```text
M4 App 797 Hoshin Master           = PASS
M5 App 798 Revision Archive        = PASS
M6 App 796 Scoring Baseline        = PASS BUSINESS STATE / 8 OF 8 PUBLISHED
M7 App 795 Routing Baseline        = 1/12 / PREFLIGHT READY / ACR-002 PROPOSED
M8 App 800 HR Dashboard MVP        = PASS
M9 End-to-end Smoke Test           = AFTER M7

TODAY_DONE = NO
NEXT_CRITICAL_PATH = FINAL DOC TRUTH -> USER DECISION ACR-002 -> M7 WRITE -> M9
```

# INDEPENDENT REVIEW — SPRINT 03A-R1

Passed:

```text
ACCIDENTAL_ARTIFACT_CLEANUP_GATE = PASS
ACCIDENTAL_ARTIFACTS_REMOVED = 18/18
SEEDER_FAIL_CLOSED_POST_SEED_GATE = PASS
POST_IMPLEMENTATION_CODE_DRIFT_GATE = PASS_WITH_JUSTIFICATION
KINTONE_ZERO_WRITE_CLEANUP_GATE = PASS
REGRESSION_GATE = PASS (490/490 reported)
GIT_SCOPE_GATE = PASS
```

Sprint 03A-R1 remains blocked only because documentation claims do not match the actual active files.

## MUST FIX 1 — DEC-023 WAS NOT ACTUALLY CORRECTED

The active `project-docs/DECISIONS.md` still contains:

```text
Evaluation Weights: Staff/Japan (70/30), All Management & Exec (50/50 - Confirmed).
```

This is stale and conflicts with frozen `DEC-042`.

Replace that ONE active DEC-023 weight statement with exactly:

```text
Evaluation Weights: Staff / Japanese Staff = 70/30; Assistant Manager = 60/40; Section Manager and Above = 50/50. See DEC-042 for the user-reconfirmed authoritative position-ratio rule.
```

Do not alter DEC-042.
Do not remove DEC-035 historical supersession explanation.

Required:

```text
SCORING_RATIO_SINGLE_SOURCE_GATE = PASS
DEC023_STALE_WEIGHT_RULE = 0
```

## MUST FIX 2 — CURRENT APP796 STATUS STILL CONTAINS STALE ZERO/NOT_STARTED VALUES

Current living docs still contain combinations such as:

```text
M6 = 8/8 PUBLISHED
...
RECORD_COUNT = 0
BASELINE_SEED_STATUS = NOT_STARTED
PUBLISH_PIPELINE_STATUS = FOUNDATION_IMPLEMENTED_NOT_DEPLOYED
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
```

These cannot coexist as current state.

In CURRENT/LIVING state sections only, reconcile App796 to:

```text
RECORD_COUNT = 8
PUBLISHED_COUNT = 8
VALIDATED_COUNT = 0
BASELINE_SEED_STATUS = PUBLISHED_8_OF_8
PUBLISH_PIPELINE_STATUS = LIVE_BASELINE_PUBLISH_VERIFIED
LIVE_RECORD_PUBLISH_STATUS = BASELINE_8_OF_8_PUBLISHED
RUNTIME_RESOLVER_LIVE_WIRING = NOT_STARTED
SUPERSESSION_ACTIVATION = NOT_IMPLEMENTED / FAIL_CLOSED
```

Do not rewrite historical stage descriptions that accurately describe earlier state at that time.

## MUST FIX 3 — CURRENT REVIEW PACKAGE MUST HAVE ONE CANONICAL CURRENT BLOCK

`AI_REVIEW_PACKAGE.md` currently still carries stale generic current rows from older stages such as:

```text
THIS_TASK_KINTONE_CALLS = 0
THIS_TASK_KINTONE_WRITES = 0
AUTOMATED_TEST_SUITE = 471/471
NEXT_ACTION = older Sprint02R3 wording
LIVE_RECORD_PUBLISH_STATUS = NOT_STARTED
```

For the CURRENT Sprint03A review block:

```text
DELIVERY_SPRINT_03A_R2 = COMPLETE / PENDING CHATGPT REVIEW
M6_BUSINESS_STATE = 8/8 PUBLISHED
M6_POST_COUNT = 8
M6_PUT_COUNT = 8
M6_DELETE_COUNT = 0
SPRINT03A_R1_KINTONE_WRITES = 0
SPRINT03A_R2_KINTONE_WRITES = 0
GET_TOTAL_FOR_ORIGINAL_03A = NOT_DURABLY_COUNTED
npm test = 490/490 PASS (or actual if rerun)
NO_ORPHAN_ARTIFACT_GATE = PASS
ACCIDENTAL_ARTIFACTS_REMOVED = 18/18
STALE_ACTIVE_REFERENCES = 0
NEXT_ACTION = USER DECISION ON ACR-002
```

Do not delete valid historical forensic tables. Clearly separate `HISTORICAL STAGE METRICS` from `CURRENT DELIVERY STATE` if necessary rather than mixing them.

# NO-ORPHAN RULE

Current source of truth must not retain contradictory active values.

Required repo search proof:

```text
DEC-023 exact stale phrase "All Management & Exec (50/50 - Confirmed)" = 0
current App796 RECORD_COUNT=0 references = 0
current App796 BASELINE_SEED_STATUS=NOT_STARTED references = 0
current LIVE_RECORD_PUBLISH_STATUS=NOT_STARTED references = 0
current NEXT_ACTION referencing Sprint02R3 before M6 = 0
```

Historical evidence may retain its historically correct old values only when explicitly labeled historical and not presented as current state.

# STEP 0 — SAFETY

Require:

```text
branch = ai/antigravity-wp002c
962925b1... in ancestry
local HEAD = remote HEAD
tracked tree clean
```

No reset/rebase/force push.
No Kintone network writes.
Do not run seeder.
Do not modify source/tests unless a documentation link itself is broken; source changes are not authorized.

# STEP 1 — DOCS ONLY

Expected files only:

```text
project-docs/DECISIONS.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
project-docs/AI_REVIEW_PACKAGE.md
project-docs/IMPLEMENTATION_STATUS.md
project-docs/CHANGELOG_AI.md
```

Touch fewer if sufficient.

Do not create new docs.
Do not duplicate status blocks.
Do not create walkthrough files.

# STEP 2 — VERIFY

Run:

```bash
npm test
git diff --check
git status --short
```

Zero failures.

Search the active/current documentation for all stale values listed above.

Required:

```text
SCORING_RATIO_SINGLE_SOURCE_GATE = PASS
DOC_EVIDENCE_CONSISTENCY_GATE = PASS
NO_ORPHAN_ARTIFACT_GATE = PASS
STALE_ACTIVE_REFERENCES = 0
KINTONE_WRITES_THIS_TASK = 0
```

# STEP 3 — COMMIT

One commit only:

```text
docs: finalize sprint03a source of truth
```

Push, verify local HEAD = remote HEAD and clean tracked tree, then STOP.

# STRICT OUT OF SCOPE

Do NOT:

- write Kintone
- seed App795
- rerun App796 seeder
- modify the 8 App796 records
- modify runtime/source code
- add/remove fields
- add files
- change ACR-002 status

# REVIEW EXPECTATION

```text
M6_LIVE_BUSINESS_STATE_GATE = PASS expected
SCORING_RATIO_SINGLE_SOURCE_GATE = PASS/FAIL
DOC_EVIDENCE_CONSISTENCY_GATE = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/FAIL
KINTONE_ZERO_WRITE_GATE = PASS/FAIL
REGRESSION_GATE = PASS/FAIL
GIT_PUSH_SYNC_GATE = PASS/FAIL
DELIVERY_SPRINT_03A_GATE = PASS/BLOCKED
```
