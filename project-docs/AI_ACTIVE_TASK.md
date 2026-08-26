# AI ACTIVE TASK — M10L-R3 SAVE GATE REVIEW EVIDENCE CLOSURE

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation HEAD: `dff8c5e34b5e7622e1f16e5eea8e8642823a0f6f`
> Mode: TEST / EVIDENCE CLOSURE ONLY — NO KINTONE WRITE / NO DEPLOY

# NORTH STAR

Close Set-up Objectives Save safely before controlled App794 deployment.

Critical path:
Verify Employee -> Objectives -> Save -> Submit -> Workflow

Do not add unrelated features.

# INDEPENDENT REVIEW DECISION

M10L-R2 runtime implementation is functionally aligned with the requested corrections:

PASS BY SOURCE REVIEW:
- `Requester_User` now requires a populated array; malformed non-array values fail closed.
- Create UI starts unverified regardless of pre-filled Employee_Name/Employee_Section.
- Submit blocks when `activeUiInstance` is absent or `isEmployeeVerified !== true`.
- committed `dist/mbo-employee-app.js` contains the same reviewed correction snippets.
- prior duplicate fail-closed behavior remains present.

However M10L-R2 is NOT deploy-ready yet because the mandatory Test Plan in the previous AI_ACTIVE_TASK was not fully evidenced in committed tests.

MUST FIX / EVIDENCE GAPS:
1. No direct runtime submit-hook test proving `activeUiInstance = null/unavailable -> return false / block Save`.
2. No direct runtime submit-hook test proving an existing valid Edit Save still proceeds when UI is present and verified.
3. No explicit test for completely missing `Requester_User` field/value -> BLOCK.
4. No committed automated source/dist Save-gate exactness test that checks the relevant behavior/guards in committed `dist/mbo-employee-app.js` against source. Existing classic-bundle parse test proves parse/no-ES-module residue, not committed source/dist Save-gate exactness.

Existing tests already provide useful coverage for successful lookup, code-change reset, lookup failure reset, malformed Requester_User string/object/number, empty array, and Edit-mode initial verification. Reuse them; do not duplicate them unnecessarily.

# CHANGE GOVERNANCE

## What
Close only the missing M10L-R2 test/evidence gates.

## Where
Use existing test files first, especially:
- `tests/objective-save-validation.test.js`
- `tests/classic-bundle.test.js`
- another existing runtime/main-hook test file if one already exists

Production source files should NOT change unless a new test exposes a real correctness defect.
If source must change, STOP and report the defect before broadening scope.

## How
Add focused tests with minimal duplication:

A. REQUESTER USER MISSING FIELD
- valid objective record with `Requester_User` property absent -> ValidationEngine BLOCK.
- valid objective record with `Requester_User: { value: undefined/null }` -> BLOCK if useful for exactness.

B. ACTIVE UI MISSING SUBMIT GATE
Test the actual submit-hook behavior or extract/reuse the smallest existing testable seam without creating a parallel validator.
Prove:
- `activeUiInstance` missing/null -> Save callback returns false / does not continue into duplicate/API/save path.

C. VALID EDIT SAVE REGRESSION
Prove actual edit submit path remains eligible to continue when:
- existing record
- UI instance present
- `isEmployeeVerified === true`
- valid Record_Key inputs
- duplicate read returns zero records
- ValidationEngine passes
Expected: handler returns event / not false.

D. COMMITTED SOURCE/DIST EXACTNESS
Add a focused automated gate that reads committed source and committed `dist/mbo-employee-app.js` and proves the M10L-R2 Save-gate correction is present/equivalent at minimum for:
- strict `Requester_User` populated-array condition
- Create initialization `isEmployeeVerified = !this.isCreate`
- submit condition `!activeUiInstance || activeUiInstance.isEmployeeVerified !== true`

Do not replace semantic tests with fragile full-file string equality. Keep the check focused on the reviewed guards or use an existing deterministic bundle pipeline comparison if already available.

# Why
The previous task explicitly required tests proving these fail-closed gates. Runtime code appears correct, but deployment review requires evidence strong enough to prevent regression and source/dist drift.

# Impact
Expected impact: tests/evidence only.
No business logic, routing, profile mapping, Kintone schema, records, process management, or live customization changes.

# Risk
- brittle string-based bundle assertions
- duplicate test logic instead of testing actual hook behavior
- accidental production-source edit

Mitigation:
- test behavior where practical
- keep source/dist assertion focused
- reuse existing helpers/tests
- production source change requires explicit reviewer attention

# REQUIRED TEST PLAN

At minimum prove all of the following are PASS:

1. Requester_User missing -> BLOCK
2. Requester_User [] -> BLOCK regression
3. Requester_User malformed string/object -> BLOCK regression
4. Requester_User populated array -> PASS regression
5. activeUiInstance null/unavailable on submit -> BLOCK
6. Create prefilled employee fields -> remains unverified regression
7. successful lookup -> verified regression
8. Employee Code change -> verified false regression
9. lookup failure -> verified false regression
10. valid Edit submit -> continues / does not fail verification gate
11. duplicate found -> BLOCK regression
12. duplicate GET/read failure -> BLOCK regression
13. malformed duplicate response -> BLOCK regression
14. objective validation -> PASS regressions
15. 0111 -> PROF_ASST_MGR
16. 0118 -> PROF_STAFF_CHIEF
17. Factory Manager -> PROF_GM
18. stale-state regression -> PASS
19. committed source/dist M10L-R2 guard exactness -> PASS
20. classic bundle parse / no ES module residue -> PASS

Run full suite:
- `npm test`
- `git diff --check`
- `git status --short`

# BUILD / NO-ORPHAN

Do not create parallel validators or duplicate source-of-truth implementations.
Do not create `_old`, `_v1`, `_v2`, temporary committed debug files, or stale active references.

Required:
- `CLASSIC_BUNDLE_PARSE = PASS`
- `ES_MODULE_IMPORT_COUNT = 0`
- `ES_MODULE_EXPORT_COUNT = 0`
- `BROKEN_FROM_RESIDUE_COUNT = 0`
- `SOURCE_DIST_SAVE_GATE_EXACTNESS = PASS`
- `NO_ORPHAN_ARTIFACT_GATE = PASS`
- `CONFIRMED_BASELINE_CONFLICT_COUNT = 0`

# HARD SAFETY

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

Do not call Kintone write/deploy APIs.

# ROLLBACK PLAN

Repository-only test/evidence task.
If a test-only regression is introduced, correct/revert using normal forward Git history on the same branch. No force push, rebase, reset, or history rewrite.
No live Kintone rollback applies.

# REQUIRED FINAL SUMMARY

M10L_R3_REVIEW_EVIDENCE_CLOSURE = COMPLETE / PARTIAL / BLOCKED

REQUESTER_USER_MISSING_GATE = PASS/FAIL
REQUESTER_USER_STRICT_ARRAY_GATE = PASS/FAIL
ACTIVE_UI_MISSING_SUBMIT_GATE = PASS/FAIL
VALID_EDIT_SUBMIT_REGRESSION = PASS/FAIL
CREATE_PREFILLED_NOT_VERIFIED_GATE = PASS/FAIL
SUCCESSFUL_LOOKUP_VERIFICATION = PASS/FAIL
EMPLOYEE_CODE_CHANGE_RESET = PASS/FAIL
LOOKUP_FAILURE_RESET = PASS/FAIL
DUPLICATE_FOUND_GATE = PASS/FAIL
DUPLICATE_CHECK_ERROR_FAIL_CLOSED = PASS/FAIL
OBJECTIVE_VALIDATION_REGRESSION = PASS/FAIL
PROFILE_REGRESSIONS = PASS/FAIL
STALE_STATE_REGRESSION = PASS/FAIL
SOURCE_DIST_SAVE_GATE_EXACTNESS = PASS/FAIL
CLASSIC_BUNDLE_PARSE = PASS/FAIL
npm test = actual / PASS|FAIL
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
CONFIRMED_BASELINE_CONFLICT_COUNT = actual
KINTONE_WRITES_THIS_TASK = 0
APP794_DEPLOY = 0
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW; IF PASS, CONTROL PLANE MAY PREPARE CONTROLLED APP794 CUSTOMIZATION DEPLOY AND REQUEST A NEW EXPLICIT USER AUTHORIZATION

Update factual living docs only if needed.
Commit and push same branch, then STOP.

Do not deploy App794.
Do not write any Kintone app.