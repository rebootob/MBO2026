# AI ACTIVE TASK — M10G-R3 APP794 FIXED BUNDLE CONTROLLED REDEPLOY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `91b41a1aca60b5ef648bb7c4cee7ce087914d82c`
> Mode: CONTROLLED APP794 CUSTOMIZATION REDEPLOY — EXPLICIT USER AUTHORIZATION RECEIVED

# NORTH STAR

```text
App794 live UI is visible but current baseline is NOT business-usable.
Confirmed live browser defects before this task:
1) isValidEmployeeCode is not defined
2) Kintone USER_SELECT fields receive invalid values

M10G-R2 repaired both defects in repository and rebuilt the classic bundle.
Tests = 511/511 PASS.
Fixed bundle has NOT yet been deployed.

USER AUTHORIZATION RECEIVED:
"อนุมัติ M10G-R3 deploy App794 fixed bundle"

THIS TASK:
Deploy ONLY the M10G-R2 fixed App794 desktop customization bundle,
then prove runtime health with live read-back plus browser/runtime smoke gates.
```

# AUTHORIZATION BOUNDARY — STRICT

Authorized target:

```text
APP_ID = 794
WRITE_TYPE = customization upload/update + deploy only
```

Allowed:
- verify/rebuild the already-reviewed R2 fixed bundle
- capture a fresh durable pre-write App794 backup
- upload/register exact fixed JS/CSS files
- update App794 desktop customization only
- deploy App794 customization
- poll deployment status
- live read-back revision/customization
- non-destructive runtime/browser smoke checks
- rollback App794 customization if deployment/runtime smoke fails

NOT authorized:

```text
APP794_SCHEMA_WRITE = NO
APP794_PROCESS_WRITE = NO
APP794_RECORD_WRITE = NO
APP794_ACL_WRITE = NO
APP53_WRITE = NO
APP795_WRITE = NO
APP796_WRITE = NO
APP797_WRITE = NO
APP798_WRITE = NO
APP800_WRITE = NO
APP801_WRITE = NO
OTHER_APP_WRITE = NO
```

Do not create/update an MBO record for smoke testing.
Do not broaden authorization.

# STEP 1 — PREDEPLOY SOURCE GATES

Before any Kintone write:

1. Confirm branch HEAD contains M10G-R2 commit `91b41a1aca60b5ef648bb7c4cee7ce087914d82c` or a direct descendant with no unreviewed runtime drift.
2. Rebuild using the existing repaired build pipeline only.
3. Deployment files must be exactly the current approved App794 desktop bundle/CSS produced by the existing pipeline.
4. Run all gates before write:

```text
npm test = PASS (>= 511)
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_COUNT = 0
ES_MODULE_EXPORT_COUNT = 0
BROKEN_FROM_RESIDUE_COUNT = 0
IS_VALID_EMPLOYEE_CODE_RUNTIME_TEST = PASS
USER_SELECTION_RESET_TYPE_TEST = PASS
ROUTING_USER_ARRAY_ASSIGNMENT_TEST = PASS
GIT_DIFF_CHECK = PASS
NO_ORPHAN_ARTIFACT_GATE = PASS
```

If any gate fails: STOP BEFORE KINTONE WRITE.

# STEP 2 — FRESH PRE-WRITE BACKUP

Immediately before the first write, capture fresh durable evidence under:

```text
backups/m10g-r3-app794-fixed-redeploy/<timestamp>/
```

Capture at minimum:
- App794 app/settings
- form/schema
- process-management
- ACL/permissions
- customization settings
- desktop JS/CSS references
- mobile references
- live revision
- record count
- checksums/manifest where practical

Expected current live state from prior recovery is Revision 25 working-baseline customization, but DO NOT assume it. Read live state first.

If live state has unexpected concurrent drift, STOP and report BLOCKED.

# STEP 3 — DEPLOY EXACT R2 FIXED BUNDLE

Deploy App794 desktop customization only.

Required fixed behavior contained in bundle:

```text
isValidEmployeeCode exists in classic runtime scope
USER_SELECT blank/reset values use []
Requester_User / Manager / GM user values remain arrays of Kintone user objects
M10F App53 -> App795 -> App796 runtime logic retained
TMG exact Section|Team routing retained
classic script has zero active import/export residue
```

Preserve mobile customization unchanged.

# STEP 4 — DEPLOY STATUS + LIVE READ-BACK

After update/deploy:

```text
APP794_DEPLOY_STATUS = SUCCESS
LIVE_CUSTOMIZATION_READBACK = MATCH
MOBILE_CUSTOMIZATION_UNCHANGED = YES
APP794_SCHEMA_DRIFT = 0
APP794_PROCESS_DRIFT = 0
APP794_ACL_DRIFT = 0
APP794_RECORD_WRITES = 0
NON_TARGET_APP_WRITES = 0
```

Record exact post-deploy revision and file keys/checksums.

# STEP 5 — MANDATORY RUNTIME SMOKE

This deployment MUST NOT be marked healthy based only on API read-back.

Required runtime/browser evidence as far as Antigravity can execute non-destructively:

A. Page initialization:
```text
NO classic syntax error
NO unresolved runtime dependency error
NO Kintone event.record invalid-value error on page load/change
```

B. Employee Search path:
- Use a known valid sandbox employee code only if this can be done without record creation/update.
- Search must progress past `isValidEmployeeCode`.
- Employee lookup path must remain App53 GET-only.
- If a real browser interaction cannot be executed by Antigravity, mark `USER_BROWSER_CONFIRMATION_REQUIRED` and do NOT claim END_TO_END_BROWSER_PASS.

C. USER_SELECT type gate:
- Prove record-state assignments for Requester_User / Manager / GM fields are arrays.
- Empty optional approvers = `[]`.
- Non-empty approvers = array of user objects.
- No `''` assignment to USER_SELECT fields.

D. Routing/scoring non-destructive smoke:
- App795 GET only.
- App796 GET only.
- TMG exact route behavior preserved.
- No App794 record POST/PUT.

# STEP 6 — ROLLBACK RULE

Rollback immediately to the exact fresh pre-write customization from STEP 2 if any of these occurs:

```text
deployment failure
customization read-back mismatch
classic syntax error
isValidEmployeeCode runtime error
USER_SELECT invalid-value error
other page initialization failure attributable to redeploy
critical routing/scoring regression
schema/process/ACL drift
unexpected record write
non-target app write
```

Rollback scope = App794 customization only.
After rollback, poll to SUCCESS and verify original customization restored.
Report `ROLLED_BACK`, never PASS.

# STEP 7 — VERIFY / EVIDENCE

Run after execution:

```bash
npm test
git diff --check
git status --short
```

Update living docs with factual result only.
The user authorization is consumed by this one M10G-R3 redeploy task.
Commit and push same branch, then STOP.

# REQUIRED FINAL SUMMARY

```text
M10G_R3_APP794_FIXED_REDEPLOY = COMPLETE / BLOCKED / ROLLED_BACK

USER_AUTHORIZATION_CONSUMED = YES
AUTHORIZED_TARGET = App794 customization only

PREWRITE_BACKUP = PASS/FAIL
BACKUP_PATH = exact
PREWRITE_REVISION = actual
POST_DEPLOY_REVISION = actual
DEPLOYED_JS = exact
DEPLOYED_CSS = exact
APP794_DEPLOY_STATUS = actual
LIVE_CUSTOMIZATION_READBACK = PASS/FAIL
MOBILE_CUSTOMIZATION_UNCHANGED = YES/NO

CLASSIC_BUNDLE_PARSE = PASS/FAIL
ES_MODULE_IMPORT_COUNT = actual
ES_MODULE_EXPORT_COUNT = actual
IS_VALID_EMPLOYEE_CODE_RUNTIME_GATE = PASS/FAIL
USER_SELECTION_RESET_TYPE_GATE = PASS/FAIL
ROUTING_USER_ARRAY_ASSIGNMENT_GATE = PASS/FAIL

PAGE_INITIALIZATION_SMOKE = PASS/FAIL/USER_BROWSER_CONFIRMATION_REQUIRED
EMPLOYEE_SEARCH_SMOKE = PASS/FAIL/USER_BROWSER_CONFIRMATION_REQUIRED
KINTONE_INVALID_USER_SELECT_ERROR = 0/actual/USER_BROWSER_CONFIRMATION_REQUIRED
CONSOLE_RUNTIME_ERROR = 0/actual/USER_BROWSER_CONFIRMATION_REQUIRED

APP794_SCHEMA_WRITES = 0
APP794_PROCESS_WRITES = 0
APP794_RECORD_WRITES = 0
APP794_ACL_WRITES = 0
NON_TARGET_APP_WRITES = 0

ROLLBACK_REQUIRED = YES/NO
ROLLBACK_STATUS = NOT_REQUIRED/PASS/FAIL

npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW + USER BROWSER CONFIRMATION IF REQUIRED
```

Do NOT perform schema/process/record writes.
Do NOT touch any other Kintone app.
Do NOT claim browser runtime PASS without browser/runtime evidence.
