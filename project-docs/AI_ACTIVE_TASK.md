# AI ACTIVE TASK — ACCELERATED FINAL UI SOURCE CLOSURE BEFORE VISUAL UAT

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `bf126b156075c332c191f94eb94512f5a218eb8c`
> Mode: **CREDIT-SAVER / TARGETED CLOSURE SWEEP / ONE ROUND ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close the remaining **source-level UI fail-closed runtime defect** and perform one focused regression sweep across the same affected render paths so we do not discover the same class of bug one function at a time.

This is NOT a redesign and NOT a broad refactor.

Do not reopen migration, routing master, scoring master, Hoshin business logic, export architecture, authentication, Kintone schema, or Process Management.

Locked references:

```text
WEB_DEMO_VISUAL_REFERENCE = preview/index.html
UI_BASELINE = project-docs/CONFIRMED_BASELINE/UI_UX.md
EVALUATION_PROFILE_BASELINE = project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
ROUTING_BASELINE = project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md
PRIMARY_RUNTIME_SOURCE = src/ui/employee-part-a-ui.js
DIST_OUTPUT = dist/mbo-employee-app.js
```

Confirmed Baseline overrides convenience defaults.

---

# BLOCKER A — INVALID OBJECTIVE_COUNT ERROR UI MUST NEVER THROW

Independent review of `bf126b...` found a Temporal Dead Zone / declaration-order defect in invalid-count branches.

Current problematic pattern exists at least in Mid-Year and Self Evaluation:

```js
const count = parseObjectiveCount(...);
if (count === null) {
  const errCard = ...;
  container.appendChild(errCard); // container referenced here
  return container;
}
const container = document.createElement('div'); // declared too late
```

This causes:

```text
ReferenceError: Cannot access 'container' before initialization
```

when persisted `Objective_Count` is invalid.

## Required fix

Use the smallest safe correction.

Preferred pattern:

```text
create the screen container/wrapper first
-> parse Objective_Count
-> if invalid, append bilingual error card
-> return safely
-> otherwise continue normal rendering
```

Do NOT reintroduce an invalid-record fallback such as 4.

Existing explicit draft/create-state UI initialization may remain only where it is clearly create-state behavior and does not reinterpret invalid persisted record data.

---

# BLOCKER B — ONE-PASS FAIL-CLOSED RENDER PATH SWEEP

Before editing, inspect every `parseObjectiveCount(...)` use in `src/ui/employee-part-a-ui.js`.

For each use classify:

```text
CREATE_OBJECTIVES
MIDYEAR
SELF_EVALUATION
APPRAISER_EVALUATION
HR_FINAL_OR_SUMMARY
TOTAL_WEIGHT_OR_COMPLETION_HELPER
OTHER
```

For every path verify BOTH valid and invalid behavior.

## Valid behavior

```text
1  -> exactly 1 objective slot/row
2  -> exactly 2
10 -> exactly 10
```

No phantom rows beyond `Objective_Count`.

## Invalid persisted-record behavior

For:

```text
blank
null
0
-1
11
non-numeric text
malformed numeric string
```

required behavior is:

```text
NO THROW
NO fabricated objective rows
NO silent write/change of Objective_Count
NO fallback to 4 for persisted invalid data
truthful bilingual data-quality/configuration message where screen rendering needs user feedback
fail-closed calculation/completion behavior for non-visual helpers
```

Do not allow `null` to flow into loops, arithmetic, completion percentages, or scoring contexts in a way that accidentally behaves like zero/NaN without an explicit fail-closed decision.

### Required source-sweep evidence

Report every `parseObjectiveCount` call site and its final disposition:

```text
<function/path> = SAFE_VALID_AND_INVALID
```

Expected:

```text
OBJECTIVE_COUNT_RENDER_PATHS_SCANNED = <count>
OBJECTIVE_COUNT_UNSAFE_RENDER_PATHS = 0
OBJECTIVE_COUNT_INVALID_RUNTIME_THROWS = 0
PHANTOM_OBJECTIVE_ROWS = 0
```

---

# BLOCKER C — REGRESSION TESTS MUST EXERCISE RENDER PATHS, NOT ONLY HELPERS

The previous tests prove:

```text
parseObjectiveCount('invalid') -> null
normalizeProfileCode('UNKNOWN_PROFILE') -> null
```

but did not render invalid-record screens and therefore missed the TDZ crash.

Add focused regression tests using the existing mock UI/test foundation. Do not create a new test framework.

At minimum test:

```text
Objectives persisted/read-only invalid Objective_Count -> no throw, no invented rows, error state
Mid-Year invalid Objective_Count -> no throw, no invented rows, error state
Self Evaluation invalid Objective_Count -> no throw, no invented rows, error state
Appraiser Evaluation invalid Objective_Count -> no throw, no invented rows, error state
HR Final / summary invalid Objective_Count -> no throw, no invented rows, error state where applicable
```

Also retain valid range assertions:

```text
1 -> 1
2 -> 2
10 -> 10
```

If create/new-record intentionally initializes 4 as a UI drafting convenience, add a test proving that this behavior applies **only to explicit create/new-record state**, not to an invalid persisted/read-only record.

Expected:

```text
INVALID_COUNT_RENDER_TESTS = PASS
VALID_COUNT_RENDER_TESTS = PASS
CREATE_STATE_DEFAULT_ISOLATION = PASS|NOT_APPLICABLE
```

---

# PROFILE FAIL-CLOSED REGRESSION CHECK — VERIFY ONLY, DO NOT REDESIGN

The profile correction from `bf126b...` is accepted in principle. Verify no regression while touching UI code:

```text
CANONICAL_PROFILE_KEYS = exactly 8
PROF_STAFF_OPERATIONAL -> PROF_STAFF_CHIEF
PROF_STAFF_JAPANESE -> PROF_JAPANESE_STAFF
PROF_SECT_MGR -> PROF_SECTION_MGR
PROF_SR_MGR -> PROF_SENIOR_MGR
blank/null/unknown -> unresolved/null
getEvaluationProfile(unresolved) -> null
PROFILE_DEFAULT_FABRICATION = 0
PROFILE_TO_PRODUCTION_ROUTE_INFERENCE = 0
```

Do not add `suggestedRoute` back to production profile definitions.

---

# ACCEPTED UI FOUNDATION — PRESERVE

Do not rewrite these areas unless the targeted correction directly breaks them:

```text
FIVE_STAGE_UI = PASS_SOURCE
BILINGUAL_UI = PASS_SOURCE
ORDINAL_APPRAISER_LABELS = PASS_SOURCE
PROFILE_ROUTE_SEPARATION = PASS
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

Do not redesign `preview/index.html` in this round.

---

# SPEED + QUALITY EXECUTION RULES

To reduce another review loop:

1. Inspect all relevant `parseObjectiveCount` call sites BEFORE making changes.
2. Make the smallest coherent fix, preferably reusing one existing error-card/helper pattern rather than copy/paste if that can be done without broad refactor.
3. Run targeted UI tests while implementing.
4. Before final test/build, re-scan the affected source for:
   - `parseObjectiveCount(`
   - `count === null`
   - `container.appendChild`
   - `wrap.appendChild`
   - Objective loops using `count`
   - arithmetic/completion logic using objective count
5. Confirm no local variable is referenced before declaration in any new invalid-count path.
6. Run full `npm test` exactly ONCE near completion.
7. Run `npm run ui:build` exactly ONCE near completion.
8. Verify expected dist update.
9. Update docs once, commit once, push, STOP.

No broad cleanup. No unrelated formatting sweep.

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
APP800_LIVE_GET = 0
APP797_LIVE_GET = 0
```

Do not edit `project-docs/CONFIRMED_BASELINE/*`.
Do not create `_final`, `_v3`, replacement UI, parallel architecture, or duplicate modules without clear necessity.

---

# GOVERNANCE DOCS

Update concisely after implementation:

```text
project-docs/AI_REVIEW_PACKAGE.md
project-docs/CURRENT_STATE.md
project-docs/HANDOFF.md
```

Do NOT claim Visual UAT PASS.
Do NOT claim Final Kintone Execution READY beyond `BLOCKED_PENDING_VISUAL_UAT`.

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

OBJECTIVE_COUNT_VALID_1_TO_10 = PASS|BLOCKED
OBJECTIVE_COUNT_INVALID_FAIL_CLOSED = PASS|BLOCKED
OBJECTIVE_COUNT_RENDER_PATHS_SCANNED = <count>
OBJECTIVE_COUNT_UNSAFE_RENDER_PATHS = <count>
OBJECTIVE_COUNT_INVALID_RUNTIME_THROWS = <count>
PHANTOM_OBJECTIVE_ROWS = <count>
INVALID_COUNT_RENDER_TESTS = PASS|FAIL
VALID_COUNT_RENDER_TESTS = PASS|FAIL
CREATE_STATE_DEFAULT_ISOLATION = PASS|NOT_APPLICABLE|FAIL

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
