# AI ACTIVE TASK — M10L-R2 SAVE GATE FAIL-CLOSED EXACTNESS CORRECTION

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed baseline HEAD: `7b853e69483f2abd59a6c974539b4521031d16e1`
> Mode: REPOSITORY CORRECTION + TESTS ONLY — NO KINTONE WRITE / NO DEPLOY

# NORTH STAR

Close Set-up Objectives Save safely before any further App794 deployment.

Critical path remains:

Verify Employee
-> Objectives
-> Save
-> Submit
-> Workflow

Do not add unrelated features.

# REVIEW DECISION

M10L-R1 is NOT deploy-ready yet.

Independent source review confirmed:

PASS:
- source/dist validation behavior is aligned at reviewed HEAD
- Profile_Code missing fails closed
- Routing_Topology missing fails closed
- Requester_User [] fails closed
- duplicate found blocks
- duplicate GET/read error blocks
- malformed duplicate response blocks

MUST FIX:
1. `Requester_User` USER_SELECT validation still accepts malformed non-array truthy values.
2. Save verification gate can fail open when `activeUiInstance` is unavailable; Create verification state can also be inferred from pre-filled Employee_Name/Employee_Section instead of a successful lookup.

These violate the required fail-closed Save contract.

# CONFIRMED BASELINE — READ FIRST

Read completely before implementation:

- `project-docs/CONFIRMED_BASELINE/README.md`
- `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
- `project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md`
- `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`

Preserve all confirmed routing/profile facts.

# CHANGE GOVERNANCE

## What

Make the existing Objective Save gate strictly fail closed for USER_SELECT requester shape and employee-verification UI state.

## Where

Primary files expected:
- `src/validation/validation-engine.js`
- `src/main-mbo-app.js`
- `src/ui/employee-part-a-ui.js` only if required to correct Create verification initialization
- existing relevant test files
- `dist/mbo-employee-app.js` via the existing classic bundle build pipeline

Do NOT create a parallel validation module or duplicate implementation.

## How

### MUST FIX 1 — STRICT REQUESTER_USER ARRAY CONTRACT

For Stage `NEW_RECORD` / `OBJECTIVE_INPUT`:

`Requester_User` is a Kintone USER_SELECT field and must be treated as an array.

Required fail-closed behavior:

- missing field/value -> BLOCK
- `[]` -> BLOCK
- string value -> BLOCK
- scalar value -> BLOCK
- plain object value -> BLOCK
- non-array truthy malformed value -> BLOCK
- populated array -> eligible to continue

At minimum require `Array.isArray(record.Requester_User?.value) && record.Requester_User.value.length > 0`.

Do not use stringification/truthiness fallback for malformed USER_SELECT values.

### MUST FIX 2 — VERIFIED EMPLOYEE SAVE GATE MUST NOT FAIL OPEN

Current submit logic only blocks when `activeUiInstance` exists and is unverified.

Required behavior:

- if custom UI instance required for this Save flow is unavailable -> BLOCK SAVE
- if `isEmployeeVerified !== true` -> BLOCK SAVE
- successful employee lookup may set verified state true
- Employee Code edit/change or lookup failure must reset verified state false
- Create mode must NOT become verified merely because `Employee_Name` / `Employee_Section` are pre-filled

Preserve legitimate Edit behavior for already-saved records; do not introduce a new requirement that makes existing draft edits impossible unless necessary for fail-closed correctness. The key correction is: no Save bypass when required UI/verification evidence is absent.

Use existing functions/classes first. No new module unless separation is demonstrably necessary.

# Why

The reviewed HEAD can accept malformed `Requester_User` shapes because validation falls back to string/truthy conversion for non-array values.

The submit gate can also proceed when `activeUiInstance` is null because the condition is currently shaped as `activeUiInstance && !activeUiInstance.isEmployeeVerified`.

Both are fail-open paths on the Save critical path.

# Impact

Expected impact is limited to Set-up Objectives Save validation.

Do not change:
- App795 routing model
- profile mappings
- App53 data
- workflow configuration
- Kintone schema
- Kintone records
- live App794 customization

# Risk

Primary regression risks:
- blocking legitimate Edit Save
- breaking successful Create lookup flow
- changing USER_SELECT array serialization
- source/dist drift after rebuild

Mitigate with focused tests plus full regression.

# Test Plan — REQUIRED

Add/adjust tests proving at minimum:

1. `Requester_User` missing -> BLOCK
2. `Requester_User: { value: [] }` -> BLOCK
3. `Requester_User: { value: "s1" }` -> BLOCK
4. `Requester_User: { value: { code: "s1" } }` -> BLOCK
5. populated USER_SELECT array -> PASS when other fields valid
6. submit with unavailable/null active UI evidence -> BLOCK, not Save
7. Create with pre-filled Employee_Name/Employee_Section but no successful lookup -> remains unverified / BLOCK
8. successful lookup -> verified
9. Employee Code change -> verified state resets false
10. lookup failure -> verified state false
11. existing valid Edit Save behavior remains functional
12. duplicate found -> BLOCK regression
13. duplicate GET/read failure -> BLOCK regression
14. malformed duplicate response -> BLOCK regression
15. Objective validation regressions remain PASS
16. 0111 -> `PROF_ASST_MGR`
17. 0118 -> `PROF_STAFF_CHIEF`
18. Factory Manager -> `PROF_GM`
19. stale-state regression remains PASS
20. source/dist Save-gate behavior is equivalent after rebuild

Run full suite:

- `npm test`
- `git diff --check`
- `git status --short`

# BUILD / NO-ORPHAN

Use existing classic bundle pipeline only.

Required:

- `CLASSIC_BUNDLE_PARSE = PASS`
- `ES_MODULE_IMPORT_COUNT = 0`
- `ES_MODULE_EXPORT_COUNT = 0`
- `BROKEN_FROM_RESIDUE_COUNT = 0`
- `SOURCE_DIST_VALIDATION_DRIFT = 0`
- `NO_ORPHAN_ARTIFACT_GATE = PASS`
- `CONFIRMED_BASELINE_CONFLICT_COUNT = 0`

Do not create:
- `_old`
- `_v1`
- `_v2`
- duplicate validators
- temporary committed debug files
- stale active references

# Rollback Plan

Repository-only task.

If regression is introduced, revert only the M10L-R2 repository correction commit(s) on this branch using normal forward Git history. Do not force-push, rebase, reset, or rewrite history.

No live Kintone rollback is applicable because this task is forbidden from writing/deploying Kintone.

# HARD SAFETY

`KINTONE_WRITES_THIS_TASK = 0`
`APP794_DEPLOY = 0`
`APP794_SCHEMA_WRITE = 0`
`APP794_PROCESS_WRITE = 0`
`APP794_RECORD_WRITE = 0`
`APP794_ACL_WRITE = 0`
`APP53_WRITE = 0`
`APP795_WRITE = 0`
`APP796_WRITE = 0`
`OTHER_KINTONE_WRITE = 0`

Do not call write/deploy APIs.

# REQUIRED FINAL SUMMARY

Report:

`M10L_R2_SAVE_GATE_CORRECTION = COMPLETE / PARTIAL / BLOCKED`

`REQUESTER_USER_STRICT_ARRAY_GATE = PASS/FAIL`
`REQUESTER_USER_MALFORMED_STRING_BLOCK = PASS/FAIL`
`REQUESTER_USER_MALFORMED_OBJECT_BLOCK = PASS/FAIL`
`ACTIVE_UI_MISSING_SAVE_BLOCK = PASS/FAIL`
`CREATE_PREFILLED_NOT_VERIFIED_GATE = PASS/FAIL`
`SUCCESSFUL_LOOKUP_VERIFICATION = PASS/FAIL`
`EMPLOYEE_CODE_CHANGE_RESET = PASS/FAIL`
`LOOKUP_FAILURE_RESET = PASS/FAIL`
`EDIT_SAVE_REGRESSION = PASS/FAIL`
`DUPLICATE_FOUND_GATE = PASS/FAIL`
`DUPLICATE_CHECK_ERROR_FAIL_CLOSED = PASS/FAIL`
`OBJECTIVE_VALIDATION_REGRESSION = PASS/FAIL`
`SOURCE_DIST_VALIDATION_DRIFT = 0/NOT_0`
`CLASSIC_BUNDLE_PARSE = PASS/FAIL`
`npm test = actual / PASS|FAIL`
`GIT_DIFF_CHECK = PASS/FAIL`
`NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED`
`CONFIRMED_BASELINE_CONFLICT_COUNT = actual`
`KINTONE_WRITES_THIS_TASK = 0`
`APP794_DEPLOY = 0`
`GIT_PUSH_SYNC = PASS/FAIL`

`NEXT_ACTION = CHATGPT REVIEW; IF PASS, PREPARE CONTROLLED APP794 CUSTOMIZATION DEPLOY AND REQUEST NEW EXPLICIT USER AUTHORIZATION`

Update factual living docs only if needed.
Commit and push same branch, then STOP.

Do not deploy App794.
Do not write any Kintone app.