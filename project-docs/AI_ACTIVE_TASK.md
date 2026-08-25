# AI ACTIVE TASK — M10L OBJECTIVE SAVE / SUBMIT RUNTIME CLOSURE

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Mode: REPOSITORY IMPLEMENTATION + TESTS ONLY — NO KINTONE WRITE / NO DEPLOY

# USER PRIORITY / COST CONTROL

M10K retired-section audit is CANCELLED BY USER.

User will manually review/correct legacy or stale App53 organization data. Do not spend Antigravity effort auditing old section codes unless the user explicitly reopens that work.

Known confirmed fact remains:

```text
TMT3 = RETIRED
canonical current section = TMS1
Do not create TMT3 routing.
```

# NORTH STAR

Move MBO2026 toward usable end-to-end business flow instead of further historical-data analysis.

Current live foundation:

```text
App794 customization Revision 27 = LIVE
Employee lookup = working
Routing validation = working/fail-closed
Scoring profile resolution = working
Duplicate MBO protection = working
Stale verified-state fix = browser verified
App795 routing = live
App796 scoring = live
App800 dashboard = live
```

Next high-value closure:

```text
Employee verified
-> enter Part A objectives
-> validate objective rows and total weight
-> save App794 record safely
-> prepare record for Submit / workflow transition
```

Do not build Mid-Year or Year-End features in this task. Close the Set-up Objectives stage first.

# CONFIRMED BASELINE — READ FIRST

Read completely before implementation:

```text
project-docs/CONFIRMED_BASELINE/README.md
project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md
project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md
```

Do not change confirmed routing/profile rules in this task.

# HARD SAFETY

```text
KINTONE_WRITES_THIS_TASK = 0
APP794_DEPLOY = 0
APP794_SCHEMA_WRITE = 0
APP794_PROCESS_WRITE = 0
APP794_RECORD_WRITE = 0
APP794_ACL_WRITE = 0
APP53_WRITE = 0
APP795_WRITE = 0
APP796_WRITE = 0
OTHER_KINTONE_WRITE = 0
```

Repository code/tests/build changes are allowed.
Live Kintone GET/readback is allowed only when necessary to verify current field/process contracts.

# STEP 1 — INSPECT CURRENT SET-UP OBJECTIVES CONTRACT

Inspect existing App794 source/UI/validation and current App794 field/process contracts.

Focus only on Stage 1: Set up Objectives.

Determine factually:

```text
objective row field codes
number-of-objectives rules
required fields per row
weight field
Difficulty Level field
additional comment optional/required behavior
Part A score/weight constraints
record create/save event behavior
current submit/process status behavior
Requester/Manager/GM routing snapshot fields already available
```

Use existing fields/functions first. Do not create duplicate data structures.

If a required business rule is not confirmed by repository/live schema/baseline, STOP on that rule and report it rather than inventing it.

# STEP 2 — OBJECTIVE INPUT VALIDATION

Implement or complete deterministic validation for Set-up Objectives using the existing validation architecture.

At minimum verify:

```text
Employee must be fully verified before saving objective setup.
Objective count must match active UI rows.
Every active objective row must contain required Objective text.
Every active objective row must contain required Action Plan.
Every active objective row must contain a valid Difficulty Level.
Every active objective row must contain a valid Weight.
Weight must be numeric and within allowed per-row range according to existing confirmed rules.
Total active objective weight must equal 100% unless repository confirmed policy explicitly states otherwise.
Inactive/hidden rows must not leak stale values into the saved record.
Blank Position/profile/routing failure must remain fail-closed.
```

Do not change scoring weights from App796.

# STEP 3 — SAFE KINTONE SAVE EVENT CONTRACT

Inspect current `app.record.create.submit` / edit-submit handling if present.

Implement the minimum required event handling so that standard Kintone Save cannot bypass the Set-up Objectives validation.

Requirements:

```text
validation failure -> cancel save with clear bilingual error
verified employee snapshot must match the current employee code
routing/profile/scoring snapshot used by the UI must not be stale
USER_SELECT values must remain arrays
no hidden stale objective rows submitted
no duplicate FY/Employee record bypass
```

Prefer modifying existing `src/main-mbo-app.js`, `src/ui/employee-part-a-ui.js`, and existing validation modules over creating new files.
Create a new module only if separation of concerns is clearly necessary.

# STEP 4 — SUBMIT / WORKFLOW READINESS

Do NOT execute Kintone workflow transitions in this task.

Prepare/verify the repository contract needed for the first future transition from the Set-up Objectives stage into the confirmed workflow.

Confirmed high-level workflow baseline:

```text
SUBMITTED -> HR_REVIEW -> GM_APPROVAL -> APPROVED -> EXECUTION_PENDING -> APPLIED
```

For this task determine:

```text
what current App794 status is immediately after initial Save
what exact action/status transition should represent employee Submit
which routing snapshot fields must already be present before Submit
what validation gates must pass before Submit can be enabled
```

If the live App794 process contract conflicts with `CONFIRMED_BASELINE`, STOP and report BLOCKED. Do not silently change process management.

Repository implementation may add submit-readiness logic/tests, but no live process write and no live record transition.

# STEP 5 — UI BEHAVIOR

Keep the current simple guided UX.

Required behavior:

```text
Unverified employee -> objective grid locked
Verified employee -> objective rows editable
Validation error -> show exact problem near Set-up Objectives area and block Save
Successful validation -> Kintone standard Save may proceed
Mid-Year tab remains locked until its future business condition
Year-End tab remains locked until its future business condition
```

Do not redesign the page or add unrelated features.

# STEP 6 — TESTS

Add focused regression coverage for at least:

```text
verified employee + valid objectives + total weight 100 -> PASS
unverified employee -> BLOCK
missing Objective -> BLOCK
missing Action Plan -> BLOCK
invalid Difficulty -> BLOCK
blank/non-numeric Weight -> BLOCK
total Weight != 100 -> BLOCK
hidden/inactive objective rows do not contaminate submission
lookup failure after previous success remains fail-closed
0111 profile remains PROF_ASST_MGR
0118 profile remains PROF_STAFF_CHIEF
Factory Manager remains PROF_GM
USER_SELECT reset remains []
duplicate employee/FY remains blocked
```

Run full regression suite.

# STEP 7 — BUILD SAFETY

Rebuild classic bundle with the existing repaired pipeline.

Required gates:

```text
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_COUNT = 0
ES_MODULE_EXPORT_COUNT = 0
BROKEN_FROM_RESIDUE_COUNT = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
CONFIRMED_BASELINE_CONFLICT_COUNT = 0
```

Run:

```bash
npm test
git diff --check
git status --short
```

# REQUIRED FINAL SUMMARY

```text
M10L_OBJECTIVE_SAVE_SUBMIT_CLOSURE = COMPLETE / PARTIAL / BLOCKED

M10K_AUDIT_CANCELLED_BY_USER = YES
LEGACY_DATA_AUDIT_OWNER = USER

SETUP_OBJECTIVE_VALIDATION = PASS/FAIL
SAVE_BYPASS_PROTECTION = PASS/FAIL
VERIFIED_EMPLOYEE_GATE = PASS/FAIL
OBJECTIVE_REQUIRED_FIELDS_GATE = PASS/FAIL
OBJECTIVE_WEIGHT_TOTAL_GATE = PASS/FAIL
HIDDEN_ROW_STALE_DATA_GATE = PASS/FAIL
DUPLICATE_RECORD_GATE = PASS/FAIL

CURRENT_INITIAL_SAVE_STATUS = exact
FUTURE_EMPLOYEE_SUBMIT_ACTION = exact / UNRESOLVED
FUTURE_SUBMIT_TARGET_STATUS = exact / UNRESOLVED
SUBMIT_REQUIRED_ROUTING_FIELDS = exact
PROCESS_BASELINE_CONFLICT = YES/NO

0111_PROFILE_REGRESSION = PASS/FAIL
0118_PROFILE_REGRESSION = PASS/FAIL
FACTORY_MANAGER_PROFILE_REGRESSION = PASS/FAIL
STALE_STATE_REGRESSION = PASS/FAIL
USER_SELECT_ARRAY_REGRESSION = PASS/FAIL

CLASSIC_BUNDLE_PARSE = PASS/FAIL
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED

KINTONE_WRITES_THIS_TASK = 0
APP794_DEPLOY = 0
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW; IF PASS, REQUEST ONE CONTROLLED APP794 CUSTOMIZATION DEPLOY FOR SET-UP OBJECTIVES SAVE VALIDATION ONLY
```

Update factual living docs.
Do not update CONFIRMED_BASELINE with provisional findings.
Commit and push the same branch, then STOP.

Do not write any Kintone app.
Do not deploy App794.