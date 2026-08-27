# AI ACTIVE TASK — FINAL SOURCE CLOSURE BEFORE VISUAL UAT

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `03f4841ccd41a2e95e06ac5c1a3d42fc371f7815`
> Mode: **CREDIT-SAVER / LAST SOURCE CORRECTION / ONE ROUND ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close the last independently verified source-level UI parity defect before user Visual UAT.

Do NOT redesign the Web Demo and do NOT reopen migration, routing master, scoring master, Hoshin, export, authentication, Kintone schema, Process Management, security architecture, or other unrelated work.

Locked references:

```text
WEB_DEMO_VISUAL_REFERENCE = preview/index.html
UI_BASELINE = project-docs/CONFIRMED_BASELINE/UI_UX.md
EVALUATION_PROFILE_BASELINE = project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
PRIMARY_RUNTIME_SOURCE = src/ui/employee-part-a-ui.js
DIST_OUTPUT = dist/mbo-employee-app.js
```

Confirmed Baseline overrides convenience defaults.

---

# BLOCKER — CREATE-STATE DEFAULT MUST NOT MASK INVALID PERSISTED OBJECTIVE_COUNT

Independent review of `03f4841...` found this remaining unsafe semantic path in the Objectives screen:

```js
const isObjectiveStage =
  this.isCreate ||
  this.stage === BUSINESS_STAGES.OBJECTIVE_INPUT ||
  this.stage === BUSINESS_STAGES.NEW_RECORD;

let count = parseObjectiveCount(this._getVal('Objective_Count'));

if (count === null && isObjectiveStage) {
  count = 4;
}
```

This allows an existing/persisted record in `OBJECTIVE_INPUT` with blank/invalid `Objective_Count` to be silently reinterpreted as 4 objectives.

That is not allowed.

## Required behavior

### True create/new-record state

A drafting convenience default of 4 is allowed only when the UI is unquestionably creating a new record and no persisted invalid record is being reinterpreted.

Use an explicit create predicate. Preferred minimum:

```text
this.isCreate === true
```

If `BUSINESS_STAGES.NEW_RECORD` is also used, first prove from existing runtime construction that it represents only a true unsaved/new record. Do not assume this from the name alone.

Expected create behavior:

```text
true create + blank Objective_Count -> initialize/render 4 as UI draft default
```

This must not silently write to Kintone in this task.

### Existing/persisted record

For any existing record, including stage `OBJECTIVE_INPUT`:

```text
blank/null/0/-1/11/non-numeric/malformed Objective_Count
```

must produce:

```text
NO THROW
NO fallback to 4
NO invented Objective_1..4 rows
NO write/change of Objective_Count
truthful bilingual invalid-data/configuration state
```

Valid `1..10` remains unchanged.

Expected:

```text
CREATE_STATE_DEFAULT_ISOLATION = PASS
PERSISTED_OBJECTIVE_INVALID_FAIL_CLOSED = PASS
PHANTOM_OBJECTIVE_ROWS = 0
```

---

# REQUIRED REGRESSION TEST COMPLETION

Use the existing test file/foundation. Do not create a new framework.

Add/verify these render-path tests:

```text
1. true create/new record + blank Objective_Count
   -> no throw
   -> explicit draft default behavior allowed
   -> renders 4 only in true create context

2. existing Objectives record + invalid Objective_Count
   -> no throw
   -> bilingual invalid-count state
   -> zero invented objective rows
   -> MUST NOT render as 4 objectives

3. HR Final + invalid Objective_Count
   -> no throw
   -> invalid-count state in read-only breakdown
   -> zero invented objective rows
```

Retain the already added invalid render tests for:

```text
Mid-Year
Self Evaluation
Appraiser Evaluation
```

Retain parser tests:

```text
1 -> 1
2 -> 2
10 -> 10
blank/null/0/-1/11/text -> null
```

Expected:

```text
OBJECTIVES_EXISTING_INVALID_RENDER_TEST = PASS
HR_FINAL_INVALID_RENDER_TEST = PASS
MIDYEAR_INVALID_RENDER_TEST = PASS
SELF_EVAL_INVALID_RENDER_TEST = PASS
APPRAISER_INVALID_RENDER_TEST = PASS
VALID_COUNT_RENDER_TESTS = PASS
```

---

# FINAL TARGETED SOURCE SWEEP

Before the final test/build, inspect every current `parseObjectiveCount(` call site in `src/ui/employee-part-a-ui.js` and report exact function/path classification.

For each call site prove:

```text
valid 1..10 = correct
invalid persisted data = fail closed
no null arithmetic accident
no loop silently treating null as zero
no variable reference before declaration
no create default leaking into persisted record paths
```

Specially inspect:

```text
_renderScreenObjectives
_renderScreenMidYear
_renderScreenSelfEval
_renderScreenAppraiserEval
_renderScreenHrFinal / _renderReadOnlyAppraiserBreakdown
normalizeAppraiserData
_updateTotalWeightDisplay
any other current caller
```

`normalizeAppraiserData` currently receives `activeObjCount = parseObjectiveCount(...)`. If invalid Objective_Count can reach arithmetic such as `count * activeObjCount`, make the smallest explicit fail-closed correction so invalid config does not obtain misleading zero-complete semantics. Do not broaden architecture.

Expected:

```text
OBJECTIVE_COUNT_CALL_SITES_REVIEWED = <actual count>
OBJECTIVE_COUNT_UNSAFE_CALL_SITES = 0
OBJECTIVE_COUNT_INVALID_RUNTIME_THROWS = 0
NULL_ARITHMETIC_SEMANTIC_LEAKS = 0
```

---

# PROFILE / ROUTE REGRESSION CHECK — VERIFY ONLY

Do not redesign. Preserve and verify:

```text
CANONICAL_PROFILE_KEYS = 8
LEGACY_PROFILE_ALIAS_NORMALIZATION = PASS
UNKNOWN_PROFILE_FAIL_CLOSED = PASS
PROFILE_DEFAULT_FABRICATION = 0
PROFILE_ROUTE_SEPARATION = PASS
PROFILE_TO_PRODUCTION_ROUTE_INFERENCE = 0
```

Do not reintroduce `suggestedRoute` into production profile definitions.

---

# ACCEPTED UI FOUNDATION — DO NOT REWRITE

Preserve:

```text
FIVE_STAGE_UI = PASS_SOURCE
BILINGUAL_UI = PASS_SOURCE
ORDINAL_APPRAISER_LABELS = PASS_SOURCE
DIFFICULTY_BLANK_STATE = PASS_SOURCE
OPTIONAL_EVIDENCE_UX = PASS_WITH_SCHEMA_PENDING
MIDYEAR_PROGRESS_SEMANTICS = PASS_SOURCE
PHASE_CALENDAR_LOCAL_CONTRACT = PASS_SOURCE
BOUNDARY_START_ACTION_GUIDANCE = PASS_SOURCE
COPY_PREVIOUS_LOCAL_UI_WIRING = PASS_SOURCE
HOSHIN_LOCAL_SNAPSHOT_UI = PASS_SOURCE
EXPORT_LOCAL_FOUNDATION = MISSING_LOCAL_TEMPLATE
NATIVE_COMMENT_THREAD_PRESERVED = PASS_SOURCE_REVIEW_PENDING_VISUAL
MULTI_APPRAISER_CONTAINMENT = PASS_SOURCE_REVIEW_PENDING_VISUAL
READ_ONLY_PERMISSION_TRUTHFULNESS = PASS_SOURCE
```

No `preview/index.html` redesign in this round.

---

# SPEED + QUALITY RULES

1. Inspect all relevant call sites first.
2. Make one coherent minimal patch.
3. Add all missing regression tests in the same round.
4. Run targeted tests during implementation as needed.
5. Re-scan affected source before final run.
6. Run full `npm test` exactly ONCE near completion.
7. Run `npm run ui:build` exactly ONCE near completion.
8. Verify expected dist output only.
9. Update governance docs once.
10. Commit once, push, STOP.

No broad cleanup and no unrelated refactor.

---

# LOCAL-ONLY HARD BOUNDARY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
BROWSER_SMOKE = 0
APP53_WRITE = 0
LEGACY_APP_WRITE = 0
APP794_LIVE_WRITE = 0
APP795_LIVE_GET = 0
APP796_LIVE_GET = 0
APP797_LIVE_GET = 0
APP800_LIVE_GET = 0
```

Do not edit `project-docs/CONFIRMED_BASELINE/*`.
Do not create parallel `_final`, `_v3`, replacement UI, or duplicate architecture.

---

# GOVERNANCE DOCS

Update concisely after implementation:

```text
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Do NOT claim Visual UAT PASS.
If this source gate passes, next step is user Visual UAT.

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

CREATE_STATE_DEFAULT_ISOLATION = PASS|FAIL
PERSISTED_OBJECTIVE_INVALID_FAIL_CLOSED = PASS|FAIL
PHANTOM_OBJECTIVE_ROWS = <count>

OBJECTIVES_EXISTING_INVALID_RENDER_TEST = PASS|FAIL
MIDYEAR_INVALID_RENDER_TEST = PASS|FAIL
SELF_EVAL_INVALID_RENDER_TEST = PASS|FAIL
APPRAISER_INVALID_RENDER_TEST = PASS|FAIL
HR_FINAL_INVALID_RENDER_TEST = PASS|FAIL
VALID_COUNT_RENDER_TESTS = PASS|FAIL

OBJECTIVE_COUNT_CALL_SITES_REVIEWED = <actual count>
OBJECTIVE_COUNT_UNSAFE_CALL_SITES = <count>
OBJECTIVE_COUNT_INVALID_RUNTIME_THROWS = <count>
NULL_ARITHMETIC_SEMANTIC_LEAKS = <count>

CANONICAL_PROFILE_KEYS = PASS|BLOCKED
LEGACY_PROFILE_ALIAS_NORMALIZATION = PASS|BLOCKED
UNKNOWN_PROFILE_FAIL_CLOSED = PASS|BLOCKED
PROFILE_DEFAULT_FABRICATION = <count>
PROFILE_ROUTE_SEPARATION = PASS|BLOCKED
PROFILE_TO_PRODUCTION_ROUTE_INFERENCE = <count>

PARSE_OBJECTIVE_COUNT_CALL_SITES =
- <function/path> = SAFE_VALID_AND_INVALID|BLOCKED

FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|FAIL
SOURCE_UI_PARITY_READINESS = READY|BLOCKED
VISUAL_UAT = NOT_RUN
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED_PENDING_VISUAL_UAT|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push authorized local changes, then STOP.
Do not begin Visual UAT automation or Final Kintone Execution.
