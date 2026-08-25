# AI ACTIVE TASK — M10L-R1 OBJECTIVE SAVE VALIDATION EXACTNESS CORRECTION

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Mode: REPOSITORY CORRECTION + TESTS ONLY — NO KINTONE WRITE / NO DEPLOY

# NORTH STAR

Close Set-up Objectives Save validation safely before any further App794 deployment.

M10L implementation is NOT approved yet because independent review found two MUST FIX defects:

1. SOURCE/DIST VALIDATION DRIFT.
2. DUPLICATE CHECK FAIL-OPEN ON READ ERROR.

Do not add new features. Fix only these correctness defects and preserve all reviewed M10H/M10I/M10J behavior.

# USER PRIORITY / COST CONTROL

Legacy/retired App53 data audit remains owned by USER.
Do NOT reopen M10K or spend effort auditing old section data.

# CONFIRMED BASELINE — READ FIRST

Read:

project-docs/CONFIRMED_BASELINE/README.md
project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md
project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md

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

# MUST FIX 1 — SOURCE / DIST EXACTNESS

Current reviewed evidence shows:

Source `src/validation/validation-engine.js` Stage 1 validation does not exactly match built `dist/mbo-employee-app.js`.

The built bundle currently enforces all of:

- Profile_Code present
- Routing_Topology present
- Requester_User non-empty

The source currently conditionally checks Profile_Code/Routing_Topology and does not equivalently enforce Requester_User.

This is prohibited source-of-truth drift.

Required correction:

- Make the EXISTING source validation authoritative and explicit.
- Stage NEW_RECORD / OBJECTIVE_INPUT must fail closed if:
  - Profile_Code blank/missing
  - Routing_Topology blank/missing
  - Requester_User missing/empty
- USER_SELECT Requester_User must be treated as an array.
- Do not create another validation module or fallback implementation.
- Rebuild dist from corrected source.
- Prove source and dist behavior are equivalent with focused tests.

# MUST FIX 2 — DUPLICATE CHECK MUST FAIL CLOSED

Current `src/main-mbo-app.js` duplicate guard catches GET/check errors and only logs them, then continues toward Save.

This can allow Save when uniqueness could not be verified.

Required behavior:

Duplicate query success + duplicate found
-> BLOCK SAVE

Duplicate query success + zero duplicates
-> continue validation

Duplicate query/access/network/malformed response failure
-> BLOCK SAVE
-> clear bilingual user-facing error
-> do NOT continue to save

Do not silently fail open.

Preserve edit behavior excluding the current record ID from duplicate query.

# REGRESSION REQUIREMENTS

Keep all M10L validation behavior:

- verified employee gate
- Objective required
- Action Plan required
- Difficulty 1-4
- Weight numeric >0 and <=100
- active total weight = 100
- inactive rows cleared
- blank profile/routing fail closed
- Requester_User required for setup save
- USER_SELECT arrays preserved

Keep prior runtime behavior:

- 0111 -> PROF_ASST_MGR
- 0118 -> PROF_STAFF_CHIEF
- Factory Manager -> PROF_GM
- stale-state regression PASS
- no PROFILE_RESOLUTION_AMBIGUOUS for mapped titles

# TESTS — REQUIRED

Add/adjust tests proving at minimum:

1. missing Profile_Code -> BLOCK
2. missing Routing_Topology -> BLOCK
3. Requester_User [] -> BLOCK
4. Requester_User populated array -> allowed when other fields valid
5. duplicate found -> BLOCK
6. duplicate-check GET failure -> BLOCK (fail closed)
7. duplicate-check malformed response -> BLOCK if applicable to wrapper contract
8. valid duplicate-check zero records + valid objective data -> PASS
9. source rebuild produces same validation behavior in dist
10. all existing M10L tests remain PASS

Run full regression suite.

# BUILD / NO-ORPHAN

Use existing repaired classic bundle pipeline only.

Required:

CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_COUNT = 0
ES_MODULE_EXPORT_COUNT = 0
BROKEN_FROM_RESIDUE_COUNT = 0
SOURCE_DIST_VALIDATION_DRIFT = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
CONFIRMED_BASELINE_CONFLICT_COUNT = 0

Run:

npm test
git diff --check
git status --short

# REQUIRED FINAL SUMMARY

M10L_R1_SAVE_VALIDATION_CORRECTION = COMPLETE / PARTIAL / BLOCKED

SOURCE_DIST_VALIDATION_DRIFT_BEFORE = YES
SOURCE_DIST_VALIDATION_DRIFT_AFTER = YES/NO
PROFILE_CODE_FAIL_CLOSED = PASS/FAIL
ROUTING_TOPOLOGY_FAIL_CLOSED = PASS/FAIL
REQUESTER_USER_ARRAY_GATE = PASS/FAIL
DUPLICATE_FOUND_GATE = PASS/FAIL
DUPLICATE_CHECK_ERROR_FAIL_CLOSED = PASS/FAIL
OBJECTIVE_VALIDATION_REGRESSION = PASS/FAIL
HIDDEN_ROW_STALE_DATA_GATE = PASS/FAIL
VERIFIED_EMPLOYEE_GATE = PASS/FAIL

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

NEXT_ACTION = CHATGPT REVIEW; IF PASS, PREPARE CONTROLLED APP794 CUSTOMIZATION DEPLOY FOR M10L SAVE VALIDATION

Update factual living docs only.
Commit and push same branch, then STOP.

Do not deploy App794.
Do not write any Kintone app.