# AI ACTIVE TASK — ONE MICRO-FIX BEFORE VISUAL UAT

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `22d0b8e32ddf5474bd04c23faaefb06cb8fb68d6`
> Mode: **CREDIT-SAVER / ONE MICRO-FIX ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close the single remaining independently verified source-level blocker before user Visual UAT.

Do NOT redesign the Web Demo. Do NOT reopen migration, routing, scoring master, Hoshin, export, authentication, Kintone schema, Process Management, or other unrelated work.

Locked references:

```text
UI_BASELINE = project-docs/CONFIRMED_BASELINE/UI_UX.md
EVALUATION_BASELINE = project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
PRIMARY_SOURCE = src/ui/employee-part-a-ui.js
DIST_OUTPUT = dist/mbo-employee-app.js
```

Confirmed Baseline overrides convenience behavior.

---

# ONLY BLOCKER — normalizeAppraiserData MUST FAIL CLOSED ON INVALID Objective_Count

Independent review of `22d0b8e...` found:

```js
const activeObjCount = parseObjectiveCount(getVal('Objective_Count'));
...
let totalRequiredPartARatings = count * activeObjCount;
```

When `Objective_Count` is invalid:

```text
activeObjCount = null
count * null = 0
```

Later equality checks can produce misleading zero-complete semantics such as:

```text
completed = 0
total = 0
isComplete = true
```

This violates the confirmed fail-closed completeness rule.

## Required correction

Immediately after resolving:

```js
const activeObjCount = parseObjectiveCount(...)
```

if `activeObjCount === null`, return an explicit fail-closed result BEFORE any arithmetic, objective loop, completion percentage, or scoring completeness calculation.

Use the smallest coherent change in the existing function.

Required invalid result properties:

```text
isInvalidConfig = true
isFullyComplete = false
completedCount = 0
completionPercent = 0
```

If `partA` / `partB` objects are returned by the normal shape, their invalid result must be truthful:

```text
partA.isComplete = false
partB.isComplete = false OR remain truthful to its own invalid/config state
```

Do not represent an invalid Objective_Count as a successfully complete zero-item Part A.

Do not fabricate `activeObjCount = 0`, `1`, `4`, or another business value.
Do not mutate the record.
Do not change valid `Objective_Count=1..10` behavior.

---

# REQUIRED REGRESSION TEST

Use the existing test framework only.

Add focused assertions directly against `normalizeAppraiserData()`:

```text
invalid Objective_Count ('', null, '0', '-1', '11', 'invalid')
-> no throw
-> isInvalidConfig = true
-> isFullyComplete = false
-> completionPercent = 0
-> must NOT report Part A complete
```

Also retain one valid control case:

```text
valid Objective_Count = 1 (with otherwise suitable fixture)
-> helper follows existing valid semantics
```

Do not loosen existing render tests.

Expected:

```text
NORMALIZE_APPRAISER_INVALID_COUNT_FAIL_CLOSED = PASS
NULL_ARITHMETIC_SEMANTIC_LEAKS = 0
INVALID_COUNT_FALSE_COMPLETE_RESULTS = 0
```

---

# VERIFY ONLY — DO NOT REWRITE

Reconfirm without redesign:

```text
CREATE_STATE_DEFAULT_ISOLATION = PASS
PERSISTED_OBJECTIVE_INVALID_FAIL_CLOSED = PASS
OBJECTIVES_INVALID_RENDER = PASS
MIDYEAR_INVALID_RENDER = PASS
SELF_EVAL_INVALID_RENDER = PASS
APPRAISER_INVALID_RENDER = PASS
HR_FINAL_INVALID_RENDER = PASS
PHANTOM_OBJECTIVE_ROWS = 0
CANONICAL_PROFILE_KEYS = PASS
UNKNOWN_PROFILE_FAIL_CLOSED = PASS
PROFILE_ROUTE_SEPARATION = PASS
PROFILE_TO_PRODUCTION_ROUTE_INFERENCE = 0
```

Do not touch `preview/index.html`.
Do not edit `project-docs/CONFIRMED_BASELINE/*`.

---

# TEST / BUILD — SPEED RULE

1. Make this one source fix.
2. Add the focused helper regression tests.
3. Run targeted tests as needed.
4. Run full `npm test` exactly ONCE near completion.
5. Run `npm run ui:build` exactly ONCE near completion because source changed.
6. Verify only the expected dist bundle change.
7. Update `project-docs/AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, and `HANDOFF.md` concisely.
8. Commit once, push, STOP.

No Kintone calls of any kind.
No broad cleanup or formatting sweep.

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

NORMALIZE_APPRAISER_INVALID_COUNT_FAIL_CLOSED = PASS|FAIL
NULL_ARITHMETIC_SEMANTIC_LEAKS = <count>
INVALID_COUNT_FALSE_COMPLETE_RESULTS = <count>

CREATE_STATE_DEFAULT_ISOLATION = PASS|FAIL
PERSISTED_OBJECTIVE_INVALID_FAIL_CLOSED = PASS|FAIL
PHANTOM_OBJECTIVE_ROWS = <count>
CANONICAL_PROFILE_KEYS = PASS|BLOCKED
UNKNOWN_PROFILE_FAIL_CLOSED = PASS|BLOCKED
PROFILE_ROUTE_SEPARATION = PASS|BLOCKED
PROFILE_TO_PRODUCTION_ROUTE_INFERENCE = <count>

TARGETED_TEST = PASS|FAIL
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|FAIL
SOURCE_UI_PARITY_READINESS = READY|BLOCKED
VISUAL_UAT = NOT_RUN
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED_PENDING_VISUAL_UAT|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

If this micro-fix passes, STOP. The next step is user Visual UAT, not more source work.