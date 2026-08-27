# AI ACTIVE TASK — MAINTAINABILITY / BUG-ISOLATION REFACTOR R1

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting implementation HEAD: `0f1aaf042211b4cd62d0c8cc6d70b0385d9518b7`
> Mode: **BEHAVIOR-PRESERVING PURE-LOGIC EXTRACTION / ONE ROUND / NO KINTONE**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## CONFIRMED STATUS BEFORE THIS TASK

User Visual UAT has confirmed:

```text
EMPLOYEE_STEP4_VISUAL_PRIVACY = PASS
EMPLOYEE_STEP5_VISUAL_PRIVACY = PASS
VISUAL_UAT_PRIVACY_GATE = PASS
```

The Production code standard is already frozen in `project-docs/CONFIRMED_BASELINE/UI_UX.md`:

```text
PRODUCTION_SOURCE_STRUCTURE = MODULAR
PRODUCTION_KINTONE_DELIVERY = BUILT_BUNDLE
PREVIEW_AND_PRODUCTION_BUSINESS_RENDERING = SAME_SOURCE_MODULES_WHERE_PRACTICAL
```

This task begins the controlled maintainability refactor required by that Production standard.

---

# OBJECTIVE

Reduce the size/responsibility concentration of `src/ui/employee-part-a-ui.js` without changing behavior.

R1 is intentionally limited to **pure logic extraction only**.

Extract only responsibilities that:
- do not create DOM nodes;
- do not depend on browser layout;
- can be unit-tested deterministically;
- materially improve privacy/scoring bug isolation.

Do NOT move Route UI rendering or Workflow Timeline DOM rendering in this round.

---

# TARGET MODULE 1 — VIEWER VISIBILITY / IDENTITY

Create exactly one coherent module unless an existing appropriate module already exists:

```text
src/ui/employee-visibility.js
```

Move the current pure identity/visibility helpers from `employee-part-a-ui.js` into it, including where applicable:

```text
extractUserCodes(...)
resolveIdentityViewerRole(...)
```

Also move any small pure helper that directly defines Employee Step 4/5 visibility only when doing so removes duplicate role/visibility decisions from the UI class.

Required behavior must remain EXACTLY unchanged:

```text
Requester_User match only -> EMPLOYEE
Appraiser identity match only -> APPRAISER
Certified HR identity match only -> HR
0 role matches -> RESTRICTED
2+ role matches -> RESTRICTED
Employee_Code alone -> NEVER grants EMPLOYEE
Status -> NEVER determines viewer role
Preview viewerRole override -> allowed only when isPreviewMode=true
```

Do not introduce a new role precedence rule.
Do not expand HR authority.
Do not query App53/App794/App795/App800/App801.

`EmployeePartAUI` must consume the imported helper rather than retain a second copy.

Expected:

```text
VIEWER_ROLE_DECISION_SOURCE_COUNT = 1
STATUS_BASED_VIEWER_ROLE_INFERENCE = 0
EMPLOYEE_CODE_VIEWER_AUTHORITY_PATHS = 0
AMBIGUOUS_ROLE_FAIL_CLOSED = PASS
```

---

# TARGET MODULE 2 — APPRAISER NORMALIZATION

Create exactly one coherent module unless an existing appropriate module already exists:

```text
src/evaluation/appraiser-normalizer.js
```

Move only pure Appraiser normalization/completion logic currently embedded in `employee-part-a-ui.js`, especially the logic represented by:

```text
normalizeAppraiserData(...)
```

and directly dependent pure helpers if they are specific to normalization and not generic UI rendering.

Preserve all current semantics exactly:

```text
invalid/missing Objective_Count -> fail closed
valid Objective_Count = 1..10 only
invalid competency/profile configuration -> fail closed
no phantom objective rows
completion cannot become true from invalid config
Part A / Part B completion remains semantically unchanged
1..4 Appraiser support remains unchanged
```

Do not change scoring formulas.
Do not change profile weights.
Do not change route topology.
Do not rename physical Kintone fields.

Expected:

```text
APPRAISER_NORMALIZATION_SOURCE_COUNT = 1
INVALID_OBJECTIVE_COUNT_FAIL_CLOSED = PASS
PHANTOM_OBJECTIVE_ROWS = 0
SCORING_BEHAVIOR_CHANGED = NO
```

---

# EXPLICITLY OUT OF SCOPE FOR R1

Do NOT extract yet:

```text
_renderRouteContext()
Workflow Action Timeline DOM/table rendering
5-stage navigator DOM rendering
Objective/Mid-Year/Self/Appraiser/HR screen DOM rendering
attachment controls
Kintone event wiring
Kintone service calls
validation engine architecture
CSS
```

Do NOT create:

```text
route-context-ui.js
workflow-timeline-ui.js
screen-specific UI modules
```

Those may be considered in R2 only after R1 independent review.

Do not split utilities into micro-files.

---

# IMPORT / EXPORT RULES

Use normal ES module imports from source.

Preferred dependency direction:

```text
src/main-mbo-app.js
        ↓
src/ui/employee-part-a-ui.js
        ↓
 employee-visibility.js
 appraiser-normalizer.js
```

Pure modules must not import `EmployeePartAUI`.
Avoid circular dependencies.
Avoid global mutable state.

Production still ships as:

```text
src/* modules
   ↓ npm run ui:build
 dist/mbo-employee-app.js
   ↓
Kintone customization
```

Preview and Production must continue to consume the same business logic source modules through the existing build/source path.

---

# REGRESSION TEST REQUIREMENTS

Reuse the existing test framework; do not create a second test framework.

Move/update imports so tests directly exercise the extracted pure modules where practical.

At minimum retain/add focused tests for:

```text
A. Requester_User match -> EMPLOYEE
B. Employee_Code-only match -> RESTRICTED
C. Appraiser identity -> APPRAISER
D. overlapping requester+appraiser -> RESTRICTED
E. overlapping requester+HR -> RESTRICTED
F. unknown login -> RESTRICTED
G. Status 13 does not elevate employee to appraiser
H. Status 15 does not elevate employee to HR
I. non-preview viewerRole override cannot elevate
J. explicit Preview override still works
K. invalid Objective_Count cases remain fail closed
L. valid Objective_Count 1 control remains valid
M. appraiser normalization completion semantics unchanged
```

Do not weaken DOM privacy tests already proving Employee Step 4/5 confidential content absence.

---

# BEHAVIOR-PARITY GATE

This is a refactor, not a feature change.

Before closure compare pre/post behavior and report:

```text
UI_TEXT_CHANGED = NO
UI_LAYOUT_CHANGED = NO
ROLE_SEMANTICS_CHANGED = NO
SCORING_SEMANTICS_CHANGED = NO
ROUTING_SEMANTICS_CHANGED = NO
KINTONE_FIELD_MAPPING_CHANGED = NO
PROCESS_STATUS_MAPPING_CHANGED = NO
```

If any one must change to make the refactor work, STOP and report rather than silently changing behavior.

---

# FILE-COUNT / COMPLEXITY RULE

Expected new source files in R1:

```text
2 maximum
```

Expected:

```text
src/ui/employee-visibility.js
src/evaluation/appraiser-normalizer.js
```

If equivalent modules already exist, reuse them instead of creating duplicates.

Do not create wrapper files that only re-export one function without a clear responsibility reason.

Report approximate before/after line count for `employee-part-a-ui.js` so maintainability gain is measurable, but do not chase line-count reduction at the expense of clarity.

---

# TEST / BUILD / DOCS

1. Read `project-docs/CONFIRMED_BASELINE/` first.
2. Make the R1 pure-logic extraction only.
3. Run targeted tests during implementation as needed.
4. Run full `npm test` exactly ONCE near completion.
5. Run `npm run ui:build` exactly ONCE near completion.
6. Verify `dist/mbo-employee-app.js` contains the expected bundled behavior and no duplicate stale implementation.
7. Update:
   - `project-docs/AI_REVIEW_PACKAGE.md`
   - `project-docs/CURRENT_STATE.md`
   - `project-docs/HANDOFF.md`
8. Do not modify Confirmed Baseline unless a direct contradiction is discovered.
9. Commit and push once, then STOP.

---

# HARD BOUNDARY

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
BROWSER_SMOKE = 0
APP53_WRITE = 0
APP794_LIVE_WRITE = 0
APP795_LIVE_GET = 0
APP796_LIVE_GET = 0
APP797_LIVE_GET = 0
APP800_LIVE_GET = 0
APP801_LIVE_GET = 0
```

No schema changes.
No Process changes.
No ACL changes.
No production deploy.
No secondary-auth work.
No audit persistence work.

---

# REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

NEW_SOURCE_FILES = <exact list>
EMPLOYEE_PART_A_UI_LINES_BEFORE = <count>
EMPLOYEE_PART_A_UI_LINES_AFTER = <count>

VIEWER_VISIBILITY_MODULE = PASS|FAIL
VIEWER_ROLE_DECISION_SOURCE_COUNT = <count>
STATUS_BASED_VIEWER_ROLE_INFERENCE = <count>
EMPLOYEE_CODE_VIEWER_AUTHORITY_PATHS = <count>
AMBIGUOUS_ROLE_FAIL_CLOSED = PASS|FAIL

APPRAISER_NORMALIZER_MODULE = PASS|FAIL
APPRAISER_NORMALIZATION_SOURCE_COUNT = <count>
INVALID_OBJECTIVE_COUNT_FAIL_CLOSED = PASS|FAIL
PHANTOM_OBJECTIVE_ROWS = <count>
SCORING_BEHAVIOR_CHANGED = NO|YES

UI_TEXT_CHANGED = NO|YES
UI_LAYOUT_CHANGED = NO|YES
ROLE_SEMANTICS_CHANGED = NO|YES
SCORING_SEMANTICS_CHANGED = NO|YES
ROUTING_SEMANTICS_CHANGED = NO|YES
KINTONE_FIELD_MAPPING_CHANGED = NO|YES
PROCESS_STATUS_MAPPING_CHANGED = NO|YES

TARGETED_REFACTOR_TESTS = PASS|FAIL
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|FAIL
DIST_SOURCE_PARITY = PASS|FAIL
SOURCE_MAINTAINABILITY_R1 = PASS|BLOCKED
VISUAL_UAT_PRIVACY_GATE = PASS
FINAL_KINTONE_EXECUTION_READINESS = BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push authorized local changes, then STOP.