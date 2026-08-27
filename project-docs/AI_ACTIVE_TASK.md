# AI ACTIVE TASK — MAINTAINABILITY R1 CIRCULAR-DEPENDENCY MICRO-FIX

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `475f64f3fad37c1ce2ecd39eac3646e75ce853d8`
> Mode: **R1 MICRO-FIX / BEHAVIOR-PRESERVING / NO KINTONE / NO BROAD REFACTOR**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## REVIEW FINDINGS TO CLOSE

Independent review of R1 found two issues:

1. `src/evaluation/appraiser-normalizer.js` imports `parseObjectiveCount` and `getApplicableCompetencies` from `src/ui/employee-part-a-ui.js`, while `employee-part-a-ui.js` imports `normalizeAppraiserData` from the normalizer. This creates a circular dependency and defeats pure-module isolation.
2. `preview/index.html` was unintentionally changed so Status 13 and Employee viewer became the selected defaults. R1 is behavior-preserving and must not change Preview defaults merely because those values were used during UAT.

The Employee Step 4/5 privacy gate remains PASS and must not be reopened or changed.

---

# OBJECTIVE

Close only the two R1 review findings above so `SOURCE_MAINTAINABILITY_R1` can pass independent review.

Do NOT perform R2.
Do NOT extract Route UI or Timeline UI.
Do NOT redesign UI.
Do NOT change scoring, routing, field semantics, Process status semantics, permissions, or Kintone behavior.

---

# FIX 1 — BREAK THE CIRCULAR DEPENDENCY

Required end-state:

```text
src/main-mbo-app.js
        ↓
src/ui/employee-part-a-ui.js
        ↓
 ├─ src/ui/employee-visibility.js
 └─ src/evaluation/appraiser-normalizer.js
```

Forbidden end-state:

```text
employee-part-a-ui.js -> appraiser-normalizer.js -> employee-part-a-ui.js
```

`src/evaluation/appraiser-normalizer.js` MUST NOT import from `src/ui/employee-part-a-ui.js`.

Preferred solution order:

1. Reuse an already-existing pure module if `parseObjectiveCount` and competency lookup logic already have an appropriate non-UI home.
2. Otherwise, for this micro-fix, move only the minimal shared pure dependency into an appropriate existing non-UI module if one clearly exists.
3. If no appropriate existing module exists, duplicate neither behavior nor sources of truth. You MAY create at most ONE small shared pure module only if necessary, for example under `src/evaluation/` or `src/config/`, containing only the shared pure helpers required by both UI and normalizer.

Do NOT create multiple utility micro-files.
Do NOT inject browser/UI dependencies into the normalizer.

Behavior must remain exactly unchanged:

```text
parseObjectiveCount valid range = 1..10
invalid/missing Objective_Count = fail closed
competency set lookup semantics = unchanged
invalid competency set = fail closed
no phantom objective rows
completion semantics unchanged
```

Expected:

```text
CIRCULAR_DEPENDENCY_COUNT = 0
APPRAISER_NORMALIZER_IMPORTS_UI = 0
PURE_NORMALIZER_ISOLATION = PASS
```

---

# FIX 2 — REVERT PREVIEW DEFAULT-SELECTION DRIFT

Revert only the accidental default selections introduced in R1.

`preview/index.html` must return to its pre-R1 default behavior.

Specifically, do not leave Status 13 and Employee viewer selected merely because they were used for Visual UAT.

Do not redesign Preview controls.
Do not remove the Employee/Status 13 options.
Do not change labels.
Do not change Preview scenario capabilities.

Expected:

```text
PREVIEW_DEFAULT_BEHAVIOR_CHANGED_BY_R1 = NO
PREVIEW_UAT_OPTIONS_PRESERVED = PASS
```

---

# RETAIN ALL PASSED R1 BEHAVIOR

Do not regress:

```text
VIEWER_ROLE_DECISION_SOURCE_COUNT = 1
STATUS_BASED_VIEWER_ROLE_INFERENCE = 0
EMPLOYEE_CODE_VIEWER_AUTHORITY_PATHS = 0
AMBIGUOUS_ROLE_FAIL_CLOSED = PASS
APPRAISER_NORMALIZATION_SOURCE_COUNT = 1
INVALID_OBJECTIVE_COUNT_FAIL_CLOSED = PASS
PHANTOM_OBJECTIVE_ROWS = 0
EMPLOYEE_STEP4_VISUAL_PRIVACY = PASS
EMPLOYEE_STEP5_VISUAL_PRIVACY = PASS
```

No role precedence changes.
No HR authority expansion.
No production Preview override path.

---

# SOURCE / FILE-COUNT RULE

This is a micro-fix.

Expected changed runtime files are only those strictly required to:
- remove the circular dependency;
- adjust imports/exports;
- revert Preview defaults;
- update tests/docs.

New source files:

```text
0 preferred
1 maximum only if no appropriate existing pure module can host the shared helper safely
```

Do NOT create Route/Timeline/screen modules in this round.

---

# TEST REQUIREMENTS

Use the existing test framework only.

Add/retain focused proof that:

```text
A. appraiser-normalizer can be imported directly without importing employee-part-a-ui as a dependency
B. invalid Objective_Count ['', null, '0', '-1', '11', 'invalid'] remains fail closed
C. valid Objective_Count=1 remains valid
D. valid competency set behavior remains unchanged
E. invalid/blank competency set remains fail closed
F. identity/privacy regression tests remain passing
G. Employee Status13/15 confidential DOM absence tests remain passing
```

Do not weaken existing tests.

---

# BUILD / PARITY / DOCS

1. Read `project-docs/CONFIRMED_BASELINE/` first.
2. Apply only this micro-fix.
3. Run targeted tests as needed.
4. Run full `npm test` exactly ONCE near completion.
5. Run `npm run ui:build` exactly ONCE near completion.
6. Verify `dist/mbo-employee-app.js` has no stale duplicate normalizer implementation and matches source behavior.
7. Update concisely:
   - `project-docs/AI_REVIEW_PACKAGE.md`
   - `project-docs/CURRENT_STATE.md`
   - `project-docs/HANDOFF.md`
8. Do not modify Confirmed Baseline unless a direct contradiction is discovered.
9. Commit once, push, STOP.

---

# HARD BOUNDARY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
BROWSER_SMOKE = 0
SCHEMA_CHANGE = 0
PROCESS_CHANGE = 0
ACL_CHANGE = 0
ROUTE_UI_REFACTOR = 0
TIMELINE_UI_REFACTOR = 0
```

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

NEW_SOURCE_FILES = <exact list or NONE>
CIRCULAR_DEPENDENCY_COUNT = <count>
APPRAISER_NORMALIZER_IMPORTS_UI = <count>
PURE_NORMALIZER_ISOLATION = PASS|FAIL

PREVIEW_DEFAULT_BEHAVIOR_CHANGED_BY_R1 = NO|YES
PREVIEW_UAT_OPTIONS_PRESERVED = PASS|FAIL

VIEWER_ROLE_DECISION_SOURCE_COUNT = <count>
STATUS_BASED_VIEWER_ROLE_INFERENCE = <count>
EMPLOYEE_CODE_VIEWER_AUTHORITY_PATHS = <count>
AMBIGUOUS_ROLE_FAIL_CLOSED = PASS|FAIL
APPRAISER_NORMALIZATION_SOURCE_COUNT = <count>
INVALID_OBJECTIVE_COUNT_FAIL_CLOSED = PASS|FAIL
PHANTOM_OBJECTIVE_ROWS = <count>

UI_TEXT_CHANGED = NO|YES
UI_LAYOUT_CHANGED = NO|YES
ROLE_SEMANTICS_CHANGED = NO|YES
SCORING_SEMANTICS_CHANGED = NO|YES
ROUTING_SEMANTICS_CHANGED = NO|YES
KINTONE_FIELD_MAPPING_CHANGED = NO|YES
PROCESS_STATUS_MAPPING_CHANGED = NO|YES

TARGETED_R1_MICROFIX_TESTS = PASS|FAIL
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|FAIL
DIST_SOURCE_PARITY = PASS|FAIL
SOURCE_MAINTAINABILITY_R1 = PASS|BLOCKED
VISUAL_UAT_PRIVACY_GATE = PASS
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push once, then STOP.
