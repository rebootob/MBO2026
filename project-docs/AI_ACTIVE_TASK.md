# AI ACTIVE TASK — M10G APP794 CONTROLLED CUSTOMIZATION DEPLOYMENT

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `00477b8bbb2025ad36432013af97fd9dcb88fffc`
> Mode: CONTROLLED APP794 CUSTOMIZATION DEPLOYMENT — EXPLICIT USER AUTHORIZATION RECEIVED

# NORTH STAR

```text
Apps foundation              = READY
App795 routing               = READY 17/17
App796 scoring               = READY 8/8
App800 dashboard             = LIVE
M10F runtime implementation  = PASS
M10F-R1 TMG routing fix      = PASS
M10G deployment preflight    = PASS

USER AUTHORIZATION RECEIVED:
"อนุมัติ M10G deploy App794 customization"

THIS TASK:
Deploy only the approved App794 desktop customization payload, verify live state, and rollback immediately on any deployment/read-back/smoke failure.
```

# AUTHORIZATION BOUNDARY — STRICT

Authorized target:

```text
APP_ID = 794
WRITE_TYPE = customization upload/update + deploy only
```

Allowed:
- build the already-reviewed runtime bundle
- capture durable pre-write App794 backup
- upload/register the exact approved JS/CSS files
- update App794 desktop customization
- deploy App794 customization
- poll deployment state
- live read-back App794 customization/revision
- perform non-destructive smoke/read checks
- rollback App794 customization if required

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

If any non-customization write becomes necessary, STOP and report BLOCKED. Do not broaden the user's authorization.

# STEP 1 — SOURCE / TEST GATE

Before any Kintone write:

1. Confirm branch `ai/antigravity-wp002c` is current and contains reviewed M10F/M10F-R1 code.
2. Confirm App794 deployment source is exactly:
   - `dist/mbo-employee-app.js`
   - `src/styles/mbo-employee.css`
3. Build using the repository's existing approved build command only.
4. Run:

```bash
npm test
git diff --check
git status --short
```

Required before write:

```text
npm test = PASS
TEST_COUNT >= 508
GIT_DIFF_CHECK = PASS
NO_UNEXPECTED_SOURCE_DRIFT = YES
NO_ORPHAN_ARTIFACT_GATE = PASS
```

If any gate fails, STOP before Kintone write.

# STEP 2 — DURABLE PRE-WRITE BACKUP

Immediately before the first App794 customization write, capture durable evidence under:

```text
backups/m10g-app794-deployment/<timestamp>/
```

Capture at minimum:

```text
App794 app/settings
App794 form/schema
App794 process-management
App794 permissions/ACL
App794 customization settings
current desktop JS/CSS file references
current mobile customization references
current live revision
record count
manifest/checksums where practical
```

The backup must exist successfully before deployment continues.

Record the exact pre-write live values, including the previously observed baseline for drift detection:

```text
Expected preflight app name = MBO V2 Sandbox
Expected preflight revision = 23
Expected preflight JS fileKey = 20260823151600BE37B29017DD44E39F7C786786BFD22A152
Expected preflight CSS fileKey = 2026082315160013991FEE5BA34255AE22F4B460EF6052141
```

If live state has changed materially since preflight, STOP and report drift. Do not overwrite unknown concurrent changes.

# STEP 3 — BUILD / DEPLOY EXACT PAYLOAD

Deploy only the reviewed App794 desktop customization payload:

```text
JS  = dist/mbo-employee-app.js
CSS = src/styles/mbo-employee.css
```

Do not deploy duplicate bundles, `_old`, `_v1`, temporary files, alternate adapters, or unrelated CSS/JS.

Preserve mobile customization exactly as currently live unless the preflight explicitly proved it is intentionally empty and unchanged.

Execute the repository's existing controlled Kintone customization deployment mechanism. Do not invent a second deployment script if an existing one already performs this safely.

# STEP 4 — DEPLOYMENT STATUS / LIVE READ-BACK

After customization update:

1. Trigger the required Kintone deploy sequence for App794 only.
2. Poll until deployment reaches success or definite failure.
3. Read back live App794 customization and revision.
4. Verify the new desktop customization references correspond only to the approved JS/CSS payload.
5. Verify mobile customization is unchanged.
6. Verify no schema/process/ACL/record changes occurred.

Required:

```text
APP794_DEPLOY_STATUS = SUCCESS
APP794_CUSTOMIZATION_READBACK = MATCH
APP794_SCHEMA_DRIFT = 0
APP794_PROCESS_DRIFT = 0
APP794_ACL_DRIFT = 0
UNINTENDED_RECORD_WRITES = 0
NON_TARGET_APP_WRITES = 0
```

# STEP 5 — NON-DESTRUCTIVE SMOKE CHECKS

Perform smoke/read checks without creating/updating business records.

Verify as far as safely possible:

```text
App794 page/customization loads without JS initialization error
App53 employee lookup path remains read-only
Non-TMG routing uses exact section Routing_Key
TMG1 uses exact Section|Team route
TMG2 uses exact Section|Team route
TMG missing team remains fail-closed
missing route remains fail-closed
App796 lookup uses PUBLISHED scoring configuration only
missing/duplicate scoring remains fail-closed
Requester_User restriction remains active
no App53/App795/App796 writes
no App794 record creation/update
```

If a smoke case requires a business record write to prove it, do NOT perform that case in this authorization. Mark it `DEFERRED_TO_SEPARATE_SMOKE_AUTHORIZATION` instead.

# STEP 6 — ROLLBACK RULE

Rollback immediately if any of these occurs:

```text
deployment failure
live customization read-back mismatch
unexpected JS/CSS payload
page initialization failure attributable to deployment
schema/process/ACL drift
unexpected record write
non-target app write
critical routing/scoring runtime regression
```

Rollback target = exact pre-write App794 customization captured in Step 2.

After rollback:
- deploy rollback customization
- poll to success
- read back customization/revision
- verify original JS/CSS references restored
- verify schema/process/ACL unchanged
- report task as BLOCKED / ROLLED_BACK

# STEP 7 — EVIDENCE / DOCS / GIT

Record factual results only in living project docs and durable backup/evidence locations already used by the repository.

Do not create redundant evidence files when an existing package/file should be updated.

After execution run:

```bash
npm test
git diff --check
git status --short
```

Commit and push same branch.
Local HEAD must equal `origin/ai/antigravity-wp002c`.

# REQUIRED FINAL SUMMARY

```text
M10G_APP794_CONTROLLED_DEPLOYMENT = COMPLETE / BLOCKED / ROLLED_BACK

USER_AUTHORIZATION_CONSUMED = YES
AUTHORIZED_TARGET = App794 customization only

PREWRITE_BACKUP = PASS / FAIL
BACKUP_PATH = exact
PREWRITE_REVISION = actual
POST_DEPLOY_REVISION = actual
DEPLOYED_JS = exact
DEPLOYED_CSS = exact
APP794_DEPLOY_STATUS = actual
LIVE_CUSTOMIZATION_READBACK = PASS/FAIL
MOBILE_CUSTOMIZATION_UNCHANGED = YES/NO

APP53_LOOKUP_SMOKE = PASS/DEFERRED/BLOCKED
NON_TMG_ROUTING_SMOKE = PASS/DEFERRED/BLOCKED
TMG1_ROUTING_SMOKE = PASS/DEFERRED/BLOCKED
TMG2_ROUTING_SMOKE = PASS/DEFERRED/BLOCKED
TMG_MISSING_TEAM_FAIL_CLOSED = PASS/DEFERRED/BLOCKED
APP796_PUBLISHED_SCORING_SMOKE = PASS/DEFERRED/BLOCKED
REQUESTER_USER_RESTRICTION = PASS/DEFERRED/BLOCKED

APP794_SCHEMA_WRITES = 0
APP794_PROCESS_WRITES = 0
APP794_RECORD_WRITES = 0
APP794_ACL_WRITES = 0
NON_TARGET_APP_WRITES = 0

ROLLBACK_REQUIRED = YES/NO
ROLLBACK_STATUS = NOT_REQUIRED / PASS / FAIL

npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW ONLY
```

The user's authorization is consumed by this one controlled deployment task. Do not reuse it for future Kintone writes.

After commit/push, STOP.