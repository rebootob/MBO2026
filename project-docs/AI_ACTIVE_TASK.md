# AI ACTIVE TASK — M10J-D CONTROLLED APP794 CUSTOMIZATION DEPLOY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Authorization: USER EXPLICITLY APPROVED `อนุมัติ M10J deploy App794 customization`
> Mode: ONE CONTROLLED APP794 CUSTOMIZATION DEPLOY ONLY

# NORTH STAR

Deploy exactly the already-reviewed App794 desktop customization candidate containing:

1. M10H stale verified-state / stale snapshot fix.
2. M10I final Position -> Scoring Profile mappings.
3. M10I-R2 historical reconciliation, including `Factory Manager -> PROF_GM`.

Do not add new business features or alter any other app/schema/process/record/ACL.

# CONFIRMED BASELINE — READ FIRST

Read completely before execution:

```text
project-docs/CONFIRMED_BASELINE/README.md
project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md
project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md
project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md
```

# AUTHORIZED TARGET AND LIMITS

```text
AUTHORIZED_TARGET = APP794 CUSTOMIZATION ONLY
AUTHORIZED_DEPLOY_COUNT = 1
AUTHORIZED_DESKTOP_JS = dist/mbo-employee-app.js
AUTHORIZED_DESKTOP_CSS = dist/mbo-employee.css

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
```

Only customization file upload/update + App794 customization deployment required for this task are authorized.

# LOCKED PRE-FLIGHT BASELINE

Expected live starting state from M10J pre-flight:

```text
LIVE_APP794_REVISION = 26
LIVE_DESKTOP_JS_FILE_KEY = 2026082515285180E89A4E24124E9887C69F1C6446D2C6195
LIVE_DESKTOP_CSS_FILE_KEY = 20260825152851A67EA6B4672B49FCABE99BAD10A1AADB227
LIVE_MOBILE_CUSTOMIZATION = []
LIVE_CUSTOMIZATION_DRIFT = NO
```

Locked deployment candidate:

```text
CANDIDATE_JS = dist/mbo-employee-app.js
CANDIDATE_JS_SIZE = 124766
CANDIDATE_JS_SHA256 = ba89a4d2bd9833237fa5fa166ef48a2cf408461098782cfb94b9e308ef65fb62

CANDIDATE_CSS = dist/mbo-employee.css
CANDIDATE_CSS_SIZE = 13098
CANDIDATE_CSS_SHA256 = 3604d2b247593def3e370fe72938a4876e6da93eb7c81f9f2e030d52c660d1d0

EXPECTED_TESTS = 518/518 PASS
```

If branch contents/hash/live customization differ from this approved baseline before write, STOP and report BLOCKED. Do not deploy a changed candidate under this authorization.

# STEP 1 — PULL / RE-VERIFY BEFORE WRITE

Pull latest same branch and verify:

```text
local HEAD = origin/ai/antigravity-wp002c
candidate JS/CSS hash exactly matches locked hashes
npm test = 518/518 PASS
classic bundle parse = PASS
ES module imports = 0
ES module exports = 0
broken `from` residue = 0
CONFIRMED_BASELINE conflicts = 0
```

Read live App794 customization again immediately before write.

Required:

```text
Revision = 26
existing JS/CSS fileKeys match locked pre-flight baseline
mobile customization = []
```

Any drift => STOP, no write.

# STEP 2 — CAPTURE FRESH PRE-WRITE BACKUP

Before any upload/PUT/deploy, capture fresh live App794 customization evidence and store durably under a new path such as:

`backups/m10j-d-app794-controlled-deploy/<timestamp>/`

Backup must contain enough information to restore the exact prior customization, including at least:

```text
live revision
live desktop customization config
current JS fileKey/reference
current CSS fileKey/reference
mobile customization
retrievable prior JS/CSS files or exact existing restoration artifacts supported by the existing deployment tooling
manifest / hashes where supported
```

Verify backup is readable and complete BEFORE write.

If fresh backup cannot be proven restorable => STOP, no deploy.

# STEP 3 — EXECUTE ONE APP794 CUSTOMIZATION DEPLOY

Use the existing proven App794 deployment process from M10G-R3. Do not invent a new deployment framework.

Allowed sequence only:

1. Upload locked reviewed desktop JS.
2. Upload locked reviewed desktop CSS.
3. Update App794 desktop customization preview/config only.
4. Keep mobile customization exactly unchanged (`[]`).
5. Deploy App794 customization.
6. Poll deployment status until SUCCESS or failure/timeout.

Do NOT touch schema/process/records/ACL.

# STEP 4 — IMMEDIATE LIVE READBACK

After deployment SUCCESS, read back and record:

```text
NEW_LIVE_REVISION = actual
NEW_DESKTOP_JS_FILE_KEY = actual
NEW_DESKTOP_CSS_FILE_KEY = actual
NEW_MOBILE_CUSTOMIZATION = actual
DEPLOY_STATUS = actual
```

Required:

```text
NEW_LIVE_REVISION > 26
mobile remains []
desktop customization references new uploaded reviewed JS/CSS
```

If deployment fails or readback is inconsistent, execute rollback from the fresh pre-write backup and verify restored live state.

# STEP 5 — BROWSER RUNTIME SMOKE (MANDATORY BEFORE CALLING RUNTIME PASS)

API/readback alone is NOT runtime PASS.

Perform browser verification if Antigravity can interact with the browser. Otherwise STOP at `DEPLOYED_AWAITING_USER_BROWSER_SMOKE` and provide exact user test steps; do not claim full runtime PASS.

Required browser checks:

## A — 0118 successful lookup

```text
Employee Code = 0118
employee data loads correctly
profile path = PROF_STAFF_CHIEF
Employee verified appears only after full validation
objective grid unlocks correctly
no console/runtime error
```

## B — 0111 successful lookup

```text
Employee Code = 0111
current Position = Assistant Section Manager
profile = PROF_ASST_MGR
no PROFILE_RESOLUTION_AMBIGUOUS
objective grid unlocks correctly
```

## C — Factory Manager

Use confirmed Factory Manager employee from evidence (9048 if still current/eligible for lookup).

```text
profile resolution = PROF_GM
must NOT resolve PROF_SECTION_MGR
```

If current routing/access prevents normal successful lookup for that employee, distinguish routing failure from profile resolver evidence; do not falsify a runtime profile PASS.

## D — stale-state failure regression

After one successful employee lookup, enter a code/path that fails lookup or required validation.

Required:

```text
isEmployeeVerified = false
previous employee snapshot/header cleared
no stale green Employee verified
objective grid locked
error refers to requested lookup
```

## E — console

Must have none of:

```text
parser/syntax error
isValidEmployeeCode is not defined
USER_SELECT `.value is invalid`
unhandled runtime exception from new bundle
```

# STEP 6 — ROLLBACK TRIGGERS

Immediately rollback using the fresh pre-write backup if browser verification finds a deployment-caused critical regression such as:

```text
page initialization/parser failure
Employee Search broken
USER_SELECT invalid runtime error
stale prior employee remains verified after failed lookup
0111 still ambiguous due to deployed candidate defect
Factory Manager incorrectly resolves Section Manager due to deployed candidate defect
objective grid verification state broken
```

After rollback:

```text
poll rollback deployment SUCCESS
read back restored customization
verify restored JS/CSS/mobile references match fresh pre-write backup
report ROLLED_BACK and STOP
```

Do not attempt an unreviewed hotfix under this authorization.

# STEP 7 — NO ORPHAN / CONFIRMED BASELINE

No new `_old`, `_v1`, duplicate resolver, duplicate deploy script, or duplicate source-of-truth doc.

If deployment/readback establishes a new confirmed live fact, update the appropriate canonical living docs and, where appropriate, `CONFIRMED_BASELINE` only for stable confirmed business/system facts.

# REQUIRED FINAL SUMMARY

```text
M10J_D_APP794_CONTROLLED_DEPLOY = SUCCESS / DEPLOYED_AWAITING_USER_BROWSER_SMOKE / ROLLED_BACK / BLOCKED

USER_AUTHORIZATION = CONFIRMED
AUTHORIZED_TARGET = APP794 CUSTOMIZATION ONLY

PREWRITE_LIVE_REVISION = actual
PREWRITE_JS_FILE_KEY = actual
PREWRITE_CSS_FILE_KEY = actual
PREWRITE_MOBILE = actual
FRESH_BACKUP_PATH = actual
FRESH_BACKUP_VERIFIED_RESTORABLE = PASS/FAIL

CANDIDATE_JS_SHA256 = actual
CANDIDATE_CSS_SHA256 = actual
CANDIDATE_HASH_MATCH_LOCKED = PASS/FAIL
npm test = actual / PASS
CLASSIC_BUNDLE_PARSE = PASS/FAIL

DEPLOY_STATUS = actual
POSTDEPLOY_LIVE_REVISION = actual
POSTDEPLOY_JS_FILE_KEY = actual
POSTDEPLOY_CSS_FILE_KEY = actual
POSTDEPLOY_MOBILE = actual

BROWSER_0118 = PASS/FAIL/NOT_EXECUTED
BROWSER_0111 = PASS/FAIL/NOT_EXECUTED
BROWSER_FACTORY_MANAGER = PASS/FAIL/NOT_EXECUTED
BROWSER_STALE_STATE_FAILURE = PASS/FAIL/NOT_EXECUTED
BROWSER_CONSOLE = PASS/FAIL/NOT_EXECUTED

ROLLBACK_REQUIRED = YES/NO
ROLLBACK_RESULT = PASS/FAIL/NOT_REQUIRED

APP794_CUSTOMIZATION_DEPLOY_COUNT = actual
APP794_SCHEMA_WRITE = 0
APP794_PROCESS_WRITE = 0
APP794_RECORD_WRITE = 0
APP794_ACL_WRITE = 0
NON_TARGET_KINTONE_WRITES = 0

NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW
```

Update factual living docs, commit and push the same branch, then STOP.

Do not perform any additional deployment after the one authorized deployment. Do not modify any Kintone business records.