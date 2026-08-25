# AI ACTIVE TASK — M10G APP794 CONTROLLED DEPLOYMENT PREFLIGHT

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `d4c0b50af763e134e31a70b2a6f675c3408edc76`
> Mode: READ-ONLY DEPLOYMENT PREFLIGHT / AUTHORIZATION PACKAGE — NO KINTONE WRITE / NO DEPLOY

# NORTH STAR

```text
Apps foundation              = READY
App795 routing               = READY 17/17
App796 scoring               = READY 8/8
App800 dashboard             = LIVE
M10F runtime implementation  = PASS
M10F-R1 TMG routing fix      = PASS

NEXT DELIVERY GOAL:
Prepare the exact controlled deployment package for App794 runtime customization,
including backup target, current live customization read-back, exact payload/files,
rollback and smoke test plan, without writing to Kintone yet.
```

# HARD SAFETY

```text
KINTONE_WRITES_THIS_TASK = 0
APP794_CUSTOMIZATION_DEPLOY = 0
APP794_SCHEMA_WRITES = 0
APP794_RECORD_WRITES = 0
APP794_PROCESS_WRITES = 0
APP795_WRITES = 0
APP796_WRITES = 0
APP53_WRITES = 0
APP801_WRITES = 0
```

# STEP 1 — LIVE APP794 READ-BACK

Read-only verify App794 current state:

```text
APP794_EXISTS = YES/NO
APP794_NAME = exact
APP794_REVISION = exact
APP794_RECORD_COUNT = exact if available safely
CURRENT_DESKTOP_CUSTOMIZATION = exact JS/CSS URLs/files
CURRENT_MOBILE_CUSTOMIZATION = exact JS/CSS URLs/files
```

Do not modify anything.

# STEP 2 — EXACT DEPLOYMENT PAYLOAD

Determine the exact repository build/output that would be deployed to App794.

Required:

```text
SOURCE_ENTRY = exact
BUILD_COMMAND = exact
OUTPUT_FILES = exact
CURRENT_LIVE_FILES_REPLACED = exact
FILES_PRESERVED = exact
MOBILE_SCOPE = exact
```

Do not invent a second bundle or duplicate runtime path.

# STEP 3 — PRE-DEPLOY BACKUP PLAN

Define exact backup evidence to capture immediately before the future write:

```text
App794 app/settings read-back
form/schema read-back
process-management read-back
permissions/ACL read-back
customization read-back
live customization file references
revision
record count
manifest/checksums where practical
```

Backup must be durable before any future PUT/POST.

# STEP 4 — CONTROLLED WRITE PLAN

Prepare exact future write sequence only; do not execute it now.

Must be minimal and App794-only:

```text
1. verify branch/source hash and tests
2. capture durable pre-write backup
3. upload/register exact customization files
4. update App794 desktop customization only as required
5. deploy preview/live as required by Kintone API sequence
6. poll deployment status
7. live read-back exact customization + revision
8. run smoke tests
```

If schema/process writes are unexpectedly required, STOP and mark separate authorization required.

# STEP 5 — ROLLBACK PLAN

Define exact rollback using captured pre-write customization state.

Required:

```text
ROLLBACK_TRIGGER = any deploy/read-back/smoke failure
ROLLBACK_TARGET = exact pre-write customization payload/revision evidence
ROLLBACK_SCOPE = App794 customization only
POST_ROLLBACK_VERIFY = exact
```

# STEP 6 — SMOKE TEST PLAN

Prepare controlled read/interaction smoke tests for at least:

```text
non-TMG employee resolution
TMG1 exact team route
TMG2 exact team route
TMG missing team fail-closed
missing route fail-closed
valid App796 published scoring load
missing scoring fail-closed
Requester_User restriction
existing App794 page loads without JS error
no App53/App795/App796 writes
no App794 unintended record creation/update
```

Use test/sandbox data only; do not create records in this preflight.

# STEP 7 — AUTHORIZATION BOUNDARY

Final package must state exactly:

```text
REQUESTED_FUTURE_WRITE_TARGET = App794 customization only
REQUESTED_FUTURE_WRITE_TYPE = customization upload/update + deploy only
APP794_SCHEMA_WRITE = NO
APP794_PROCESS_WRITE = NO
APP794_RECORD_WRITE = NO
OTHER_APP_WRITE = NO
USER_EXPLICIT_AUTHORIZATION_REQUIRED = YES
```

No broad authorization language.

# VERIFY

Run:

```bash
npm test
git diff --check
git status --short
```

# FINAL REQUIRED SUMMARY

```text
M10G_APP794_DEPLOYMENT_PREFLIGHT = COMPLETE / BLOCKED

APP794_LIVE_REVISION = actual
CURRENT_LIVE_CUSTOMIZATION = exact
DEPLOY_SOURCE_FILES = exact
BUILD_COMMAND = exact
PREWRITE_BACKUP_PLAN = READY/BLOCKED
ROLLBACK_PLAN = READY/BLOCKED
SMOKE_PLAN = READY/BLOCKED
SCHEMA_OR_PROCESS_WRITE_REQUIRED = YES/NO

FUTURE_WRITE_TARGET = App794 customization only
FUTURE_KINTONE_WRITE_REQUIRED = YES
USER_EXPLICIT_AUTHORIZATION_REQUIRED = YES

KINTONE_WRITES_THIS_TASK = 0
APP794_CUSTOMIZATION_DEPLOY_THIS_TASK = 0
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW / USER AUTHORIZATION ONLY
```

Update only living docs required to record factual deployment readiness.
Commit and push same branch, then STOP.

Do NOT deploy App794.
Do NOT change schema/process/records.
Do NOT write to App53/App795/App796/App801.
