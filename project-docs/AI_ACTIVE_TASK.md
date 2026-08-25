# AI ACTIVE TASK — M10H PROFILE MAPPING COVERAGE AUDIT + LOOKUP FAILURE STATE FIX

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `324e93348205533f109668597f38ab6a9436969a`
> Mode: APP53 READ-ONLY AUDIT + REPOSITORY FIX/TESTS ONLY — NO KINTONE WRITE / NO APP794 DEPLOY

# NORTH STAR

```text
Apps foundation              = READY
App795 routing               = LIVE / READY
App796 scoring               = LIVE / READY
App800 dashboard             = LIVE
App794 fixed runtime bundle  = LIVE revision 26

Browser evidence after M10G-R3:
- employee 0118 resolves successfully and unlocks objective UI
- employee 0111 is found in App53 but fails at profile resolution with PROFILE_RESOLUTION_AMBIGUOUS
- when the new lookup fails, the UI can retain stale verified state / stale employee snapshot from the previous successful employee

THIS TASK:
1) Audit profile-mapping coverage for ALL distinct active employee positions in App53.
2) Produce exact Mapped / Ambiguous / Unknown coverage and impacted employee counts.
3) Fix stale verified-state behavior so a failed lookup can never leave a previous employee shown as verified.
4) Do NOT invent new profile mappings or write Kintone data in this task.
```

# HARD SAFETY

```text
APP53 = READ ONLY
APP794_CUSTOMIZATION_DEPLOY = 0
APP794_SCHEMA_WRITE = 0
APP794_PROCESS_WRITE = 0
APP794_RECORD_WRITE = 0
APP794_ACL_WRITE = 0
APP795_WRITE = 0
APP796_WRITE = 0
OTHER_APP_WRITE = 0
KINTONE_WRITES_THIS_TASK = 0
```

# STEP 1 — READ-ONLY APP53 POSITION COVERAGE AUDIT

Read App53 only and obtain the distinct active employee Position values using the actual field code used by EmployeeService.

For every distinct normalized position, classify using the CURRENT resolver source of truth in `src/profiles/profile-scoring-resolver.js`:

```text
MAPPED     = exact POSITION_TO_PROFILE match
AMBIGUOUS  = exact AMBIGUOUS_TITLES match
UNKNOWN    = neither mapped nor ambiguous
```

Do not silently assign a profile to Ambiguous or Unknown positions.

Required audit output:

```text
TOTAL_ACTIVE_EMPLOYEES = actual
DISTINCT_POSITION_COUNT = actual
MAPPED_POSITION_COUNT = actual
AMBIGUOUS_POSITION_COUNT = actual
UNKNOWN_POSITION_COUNT = actual
MAPPED_EMPLOYEE_COUNT = actual
AMBIGUOUS_EMPLOYEE_COUNT = actual
UNKNOWN_EMPLOYEE_COUNT = actual
```

For every Ambiguous/Unknown position provide at minimum:

```text
raw App53 position label
normalized label
classification
employee count
sample employee codes (small representative sample only)
current resolver result/error
```

Explicitly locate employee code `0111` and record its exact App53 Position plus why it resolves to `PROFILE_RESOLUTION_AMBIGUOUS`.

Also verify a known successful example such as `0118` and record its position/profile resolution for contrast.

# STEP 2 — PROFILE COVERAGE DECISION PACKAGE

Prepare a concise decision matrix for Control Plane/User review.

Do NOT choose mappings yourself where business meaning is not already frozen.

Group unresolved positions by the most likely candidate profile only as `CANDIDATE_FOR_REVIEW`, never as final mapping.

Valid frozen profiles are:

```text
PROF_STAFF_CHIEF
PROF_JAPANESE_STAFF
PROF_ASST_MGR
PROF_SECTION_MGR
PROF_SENIOR_MGR
PROF_DGM
PROF_GM
PROF_VP
```

For each unresolved position, include:

```text
POSITION
EMPLOYEE_COUNT
CURRENT_CLASSIFICATION = AMBIGUOUS/UNKNOWN
CANDIDATE_FOR_REVIEW = one or more plausible frozen profiles, only if inferable from title
BUSINESS_DECISION_REQUIRED = YES
```

If title alone is insufficient, candidate must be `UNDETERMINED`.

# STEP 3 — FIX STALE VERIFIED STATE ON LOOKUP FAILURE

Current browser evidence shows a failed lookup may leave the previous successful employee visible/verified.

Inspect existing `EmployeePartAUI` lookup flow and `src/main-mbo-app.js` callbacks.

Required behavior:

```text
WHEN Employee Code changes:
- immediately set isEmployeeVerified = false
- clear previous employee snapshot fields safely by Kintone field type
- lock objective grid until new lookup fully succeeds

WHEN lookup starts:
- verified state remains false
- stale employee data must not be presented as the newly requested employee

WHEN ANY lookup stage fails (App53 / App795 / profile resolution / App796 / duplicate check):
- isEmployeeVerified = false
- clear or keep cleared stale employee snapshot
- show the new error for the requested Employee Code
- objective grid remains locked
- do not show “Employee verified”

ONLY AFTER all required read-only validation stages succeed:
- sync new employee/routing/scoring snapshot into record state
- set isEmployeeVerified = true
- refresh UI from the new snapshot
- unlock objective grid as allowed
```

Important: do not partially commit a newly looked-up employee into the record before all required validation stages pass.

# STEP 4 — TESTS FOR LOOKUP ATOMICITY / STALE STATE

Add regression tests around existing modules/functions. At minimum cover:

```text
successful lookup A -> employee verified
change code A to B -> verified becomes false and stale snapshot clears
lookup B profile ambiguous -> verified remains false
lookup B missing scoring -> verified remains false
lookup B routing failure -> verified remains false
no previous employee name/section/position remains displayed after failed B lookup
successful lookup B after previous failure -> verified becomes true only after full success
USER_SELECT reset values remain arrays []
```

Prefer modifying existing UI/main runtime tests rather than creating duplicate test infrastructure.

# STEP 5 — DO NOT MODIFY PROFILE MAPPINGS YET

This task is an AUDIT + stale-state FIX only.

Do NOT edit:

```text
POSITION_TO_PROFILE mappings
AMBIGUOUS_TITLES classifications
App796 records
App53 records
```

unless a purely technical normalization bug is proven. Any business mapping changes require ChatGPT/User review of the coverage matrix first.

# STEP 6 — BUILD / VERIFY

Rebuild the classic bundle after the stale-state fix using the existing pipeline, but DO NOT deploy it.

Required gates:

```text
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_COUNT = 0
ES_MODULE_EXPORT_COUNT = 0
BROKEN_FROM_RESIDUE_COUNT = 0
IS_VALID_EMPLOYEE_CODE_RUNTIME = PASS
USER_SELECTION_RESET_TYPE = ARRAY
LOOKUP_FAILURE_STALE_STATE_TEST = PASS
```

Run:

```bash
npm test
git diff --check
git status --short
```

# NO-ORPHAN

Modify existing resolver/UI/runtime/test files only as necessary.
Do not create `_old`, `_v1`, duplicate resolver, duplicate UI, duplicate profile map, or throwaway active files.
If a durable coverage artifact is needed, update an existing living project-doc review package rather than adding redundant documentation.

# REQUIRED FINAL SUMMARY

```text
M10H_PROFILE_MAPPING_COVERAGE_AUDIT = COMPLETE / BLOCKED
M10H_LOOKUP_FAILURE_STATE_FIX = COMPLETE / BLOCKED

APP53_READ_ONLY = YES
TOTAL_ACTIVE_EMPLOYEES = actual
DISTINCT_POSITION_COUNT = actual
MAPPED_POSITION_COUNT = actual
AMBIGUOUS_POSITION_COUNT = actual
UNKNOWN_POSITION_COUNT = actual
MAPPED_EMPLOYEE_COUNT = actual
AMBIGUOUS_EMPLOYEE_COUNT = actual
UNKNOWN_EMPLOYEE_COUNT = actual

EMPLOYEE_0111_POSITION = exact
EMPLOYEE_0111_CURRENT_RESULT = exact
EMPLOYEE_0118_POSITION = exact
EMPLOYEE_0118_CURRENT_RESULT = exact

UNRESOLVED_POSITION_MATRIX = included in review package
PROFILE_MAPPING_CHANGES_THIS_TASK = 0

STALE_VERIFIED_STATE_FIX = PASS/FAIL
FAILED_LOOKUP_CLEARS_PREVIOUS_EMPLOYEE = PASS/FAIL
FAILED_LOOKUP_OBJECTIVE_GRID_LOCKED = PASS/FAIL
VERIFIED_ONLY_AFTER_FULL_SUCCESS = PASS/FAIL

CLASSIC_BUNDLE_PARSE = PASS/FAIL
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED

KINTONE_WRITES_THIS_TASK = 0
APP794_CUSTOMIZATION_DEPLOY = 0
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW OF COVERAGE MATRIX + BUSINESS PROFILE MAPPING DECISIONS
```

Update living docs with factual results.
Commit and push same branch, then STOP.

Do NOT deploy App794.
Do NOT change profile mapping business rules.
Do NOT write any Kintone records/settings.
