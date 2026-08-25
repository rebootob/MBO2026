# AI ACTIVE TASK — M10J APP794 CONTROLLED DEPLOY PRE-FLIGHT

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `0049d2faab59f858c7139be40fb7ca5d0c6a46e3`
> Mode: PRE-DEPLOY VERIFICATION ONLY — KINTONE READ ONLY — NO DEPLOY / NO WRITE

# NORTH STAR

Prepare exactly one deployment candidate for App794 that contains the already-reviewed fixes only:

1. M10H stale verified-state / stale snapshot fix.
2. M10I final Position -> Scoring Profile mappings.
3. M10I-R2 historical reconciliation, including `Factory Manager -> PROF_GM`.

Do not add new business features in this task.
Do not deploy in this task.

# CONFIRMED BASELINE — READ FIRST

Read completely before any verification:

```text
project-docs/CONFIRMED_BASELINE/README.md
project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md
project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md
```

If implementation conflicts with CONFIRMED_BASELINE, STOP and report BLOCKED.

# HARD SAFETY

```text
APP794_CUSTOMIZATION_DEPLOY = 0
APP794_SCHEMA_WRITE = 0
APP794_PROCESS_WRITE = 0
APP794_RECORD_WRITE = 0
APP794_ACL_WRITE = 0
APP53_WRITE = 0
LEGACY_PMS_WRITE = 0
APP795_WRITE = 0
APP796_WRITE = 0
APP797_WRITE = 0
APP798_WRITE = 0
APP800_WRITE = 0
APP801_WRITE = 0
OTHER_KINTONE_WRITE = 0
KINTONE_WRITES_THIS_TASK = 0
```

Kintone reads are allowed only for verification/readback.

# STEP 1 — VERIFY CURRENT LIVE APP794 BASELINE

Read App794 customization live state and record:

```text
LIVE_REVISION = actual
LIVE_DESKTOP_JS_FILE_KEY = actual
LIVE_DESKTOP_CSS_FILE_KEY = actual
LIVE_MOBILE_CUSTOMIZATION = actual
```

Expected starting point from prior verified deployment:

```text
Revision 26
Desktop customization present
Mobile customization unchanged/empty
```

If live state has drifted from the expected controlled baseline, STOP and report BLOCKED. Do not overwrite unknown drift.

# STEP 2 — VERIFY DEPLOYMENT CANDIDATE CONTENT

Inspect current source and built bundle.

The deployment candidate must include:

```text
STALE_STATE_FIX = present
USER_SELECT_RESET_TO_ARRAY = present
IS_VALID_EMPLOYEE_CODE_RUNTIME = present
0111 Assistant Section Manager -> PROF_ASST_MGR
0118 Technical Service Chief -> PROF_STAFF_CHIEF
Factory Manager -> PROF_GM
Advisor -> PROF_JAPANESE_STAFF
President -> PROF_VP
Manager -> PROF_SECTION_MGR
Co Project Manager -> PROF_SECTION_MGR
Executive Management Coordinator -> PROF_STAFF_CHIEF
```

No unresolved non-empty current positions may remain.
Blank App53 Position records remain fail-closed.

# STEP 3 — VERIFY BUNDLE SAFETY

Rebuild using the existing repaired classic-script pipeline only.

Required gates:

```text
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_COUNT = 0
ES_MODULE_EXPORT_COUNT = 0
BROKEN_FROM_RESIDUE_COUNT = 0
IS_VALID_EMPLOYEE_CODE_RUNTIME = PASS
USER_SELECTION_RESET_TYPE = ARRAY
LOOKUP_FAILURE_STALE_STATE_TEST = PASS
FACTORY_MANAGER_PROFILE_TEST = PROF_GM
PROFILE_MAPPING_COVERAGE_TEST = PASS
CONFIRMED_BASELINE_CONFLICT_COUNT = 0
```

Record candidate JS/CSS sizes and a stable hash if the existing tooling already supports it. Do not invent a new deployment framework.

# STEP 4 — VERIFY TEST SUITE

Run:

```bash
npm test
git diff --check
git status --short
```

Expected current regression baseline is 518 tests; actual count must be reported.

# STEP 5 — PREPARE FRESH BACKUP PLAN, BUT DO NOT EXECUTE WRITE

Determine the exact existing script/command that will be used after explicit user authorization to:

1. Capture fresh pre-write App794 customization/readback backup.
2. Store backup under a durable `backups/` path.
3. Verify backup contents before any PUT/deploy.
4. Upload only the reviewed desktop JS/CSS candidate.
5. Deploy App794 customization only.
6. Poll deployment status to SUCCESS.
7. Read back live revision/fileKeys.
8. Verify mobile customization unchanged.

Do not perform the write/deploy in this task.

# STEP 6 — DEFINE ROLLBACK CONTRACT

Before requesting authorization, identify exactly how rollback will work if browser runtime fails.

Rollback source must be the fresh pre-write backup captured immediately before deployment.

Browser-failure rollback triggers include at minimum:

```text
page initialization parser/runtime failure
Employee Search runtime failure
USER_SELECT invalid value runtime failure
verified state stale after failed lookup
profile resolver mismatch for reviewed examples
objective grid unlocks incorrectly
```

Do not reuse an old unrelated backup as the planned primary rollback source.

# STEP 7 — DEFINE POST-DEPLOY BROWSER SMOKE

Prepare exact browser tests for the user after deployment:

```text
A. 0118 successful lookup
   - employee data loads
   - PROF_STAFF_CHIEF path
   - no console/runtime error
   - objective grid unlocks correctly

B. 0111 successful lookup
   - Assistant Section Manager
   - PROF_ASST_MGR
   - no PROFILE_RESOLUTION_AMBIGUOUS

C. Factory Manager employee
   - resolves PROF_GM
   - no Section Manager misclassification

D. Failed lookup / invalid or fail-closed case
   - verified=false
   - previous employee snapshot cleared
   - objective grid locked
   - no stale Employee verified state

E. Console
   - no parser error
   - no isValidEmployeeCode error
   - no USER_SELECT `.value is invalid` errors
```

Do not create test business records unless separately authorized.

# STEP 8 — NO ORPHAN / CHANGE SCOPE

This task must not introduce:

```text
new resolver copies
_old / _v1 files
new deployment scripts without necessity
duplicate source-of-truth docs
provisional facts inside CONFIRMED_BASELINE
```

If a new confirmed factual correction is discovered, update the appropriate canonical baseline file only.

# REQUIRED FINAL SUMMARY

```text
M10J_APP794_PREDEPLOY = READY_FOR_AUTHORIZATION / BLOCKED

CONFIRMED_BASELINE_READ_FIRST = YES/NO
LIVE_APP794_REVISION = actual
LIVE_CUSTOMIZATION_DRIFT = YES/NO

STALE_STATE_FIX_PRESENT = PASS/FAIL
USER_SELECT_ARRAY_FIX_PRESENT = PASS/FAIL
0111_PROFILE = actual
0118_PROFILE = actual
FACTORY_MANAGER_PROFILE = actual
CONFIRMED_BASELINE_CONFLICT_COUNT = actual

CLASSIC_BUNDLE_PARSE = PASS/FAIL
ES_MODULE_IMPORT_COUNT = actual
ES_MODULE_EXPORT_COUNT = actual
BROKEN_FROM_RESIDUE_COUNT = actual
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED

CANDIDATE_JS_SIZE = actual
CANDIDATE_CSS_SIZE = actual
CANDIDATE_HASH = actual / NOT_AVAILABLE

FRESH_PREWRITE_BACKUP_PLAN = READY/BLOCKED
ROLLBACK_PLAN = READY/BLOCKED
POST_DEPLOY_BROWSER_SMOKE_PLAN = READY/BLOCKED

KINTONE_WRITES_THIS_TASK = 0
APP794_DEPLOY = 0
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = IF ALL PASS, STOP AND REQUEST EXPLICIT USER AUTHORIZATION FOR ONE APP794 CUSTOMIZATION DEPLOY ONLY
```

Update living docs with factual results if needed.
Commit and push same branch, then STOP.

Do not deploy App794.
Do not write any Kintone app.
