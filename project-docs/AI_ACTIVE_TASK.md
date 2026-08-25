# AI ACTIVE TASK — M10B-SEC-B CONTROLLED APP799 CLEANUP BEFORE APP801

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Head:** `02bb102fe0b70e4a90450688978f42fc10b9c09a`
> **Mode:** CONTROLLED DESTRUCTIVE CLEANUP — APP799 ONLY

# NORTH STAR

```text
M10B-SEC Authentication Architecture = PASS
M10B-SEC-A App799 Purpose Audit       = PASS
App799                                = SUPERSEDED / 0 RECORDS / 0 CUSTOM FIELDS / NO ACTIVE RUNTIME REFERENCE
App801                                = PLANNED / NOT CREATED

USER AUTHORIZATION:
Controlled deletion of App799 = EXPLICITLY APPROVED
Authorized destructive target = APP799 ONLY
New App801 creation            = NOT AUTHORIZED IN THIS TASK
```

# USER AUTHORIZATION BOUNDARY

User explicitly approved the recommended App799 cleanup after review.

This authorization permits ONLY:

```text
DELETE KINTONE APP 799
```

It does NOT authorize:

```text
creating App801
modifying App794/795/796/797/798/800
modifying App53
record writes in any other app
schema/customization/process/ACL writes in any other app
external auth-service deployment
login implementation
TOTP implementation
```

Treat this authorization as consumed and closed immediately after successful App799 deletion + read-back verification.

# AUTHORITATIVE APP799 PRE-DELETE FACTS

From M10B-SEC-A live audit:

```text
APP799_EXISTS = YES
APP799_NAME = MBO HR Control Center [Sandbox]
APP799_REVISION = 3
APP799_RECORD_COUNT = 0
APP799_CUSTOM_FIELDS = 0
APP799_ACL = CREATOR ONLY / DEFAULT DENY
APP799_PURPOSE_CLASS = KNOWN_SUPERSEDED_PURPOSE
APP799_PURPOSE = early uncustomized HR Control Center shell superseded by App800
APP799_REFERENCED_BY_ACTIVE_RUNTIME = NO
APP799_SAFE_TO_REUSE_FOR_AUTH = NO
APP799_SAFE_TO_DELETE = YES
WOULD_CREATING_APP801_DUPLICATE_APP799 = NO
```

App800 is the active HR Control Center and MUST remain untouched.

# STEP 1 — FRESH PRE-DELETE READ-BACK

Before any destructive call, GET/read-only verify App799 again.

Required exact checks:

```text
APP799_EXISTS_BEFORE_DELETE = YES
APP799_NAME_BEFORE_DELETE = MBO HR Control Center [Sandbox]
APP799_RECORD_COUNT_BEFORE_DELETE = 0
APP799_CUSTOM_FIELDS_BEFORE_DELETE = 0
APP799_ACTIVE_RUNTIME_REFERENCES = 0
```

Re-check repository/runtime references to App799 (`799`, `App799`, `app=799`, config/quick links/runtime constants).

If any new active reference, record, customization, or conflicting business use is found:

```text
STOP
DO NOT DELETE
REPORT BLOCKED
```

# STEP 2 — DURABLE PRE-DELETE BACKUP / EVIDENCE

Before deletion, create a durable local backup/evidence package for App799 sufficient to reconstruct/audit what was removed.

Capture at minimum:

```text
app identity/name/revision
schema/form fields
layout/views where available
process management state
ACL summary
customization state
record count + records export (expected 0)
M10B-SEC-A purpose evidence/reference summary
```

Store under a dedicated path such as:

```text
backups/m10b-sec-b-app799/<timestamp>/
```

Create a manifest containing file hashes and calculate a SHA-256 for the manifest.

Required before delete:

```text
BACKUP_CREATED = YES
BACKUP_MANIFEST_SHA256 = actual
BACKUP_VERIFIED_BY_EXECUTION_PLANE = YES
```

Do not claim independent reviewer byte verification.
Do not delete this backup during this task.

# STEP 3 — DELETE APP799 ONLY

Execute the minimum Kintone destructive operation required to delete App799.

Hard boundary:

```text
AUTHORIZED_DELETE_APP = 799 ONLY
AUTHORIZED_APP_CREATE = NONE
AUTHORIZED_RECORD_WRITE = NONE
AUTHORIZED_SCHEMA_WRITE = NONE except unavoidable delete-app operation itself
AUTHORIZED_CUSTOMIZATION_WRITE = NONE
AUTHORIZED_PROCESS_WRITE = NONE
AUTHORIZED_ACL_WRITE = NONE
```

Do NOT reuse App799 ID/purpose for authentication.
Do NOT create App801 in the same task.

# STEP 4 — POST-DELETE READ-BACK

Immediately verify using GET/read-back that App799 no longer exists / is inaccessible as an app.

Required:

```text
APP799_EXISTS_AFTER_DELETE = NO
APP800_EXISTS_AFTER_DELETE = YES
APP800_NAME_UNCHANGED = YES
APP800_DASHBOARD_UNTOUCHED = YES
NON_APP799_KINTONE_WRITES = 0
APP801_CREATED = NO
```

If App799 still exists or delete outcome is ambiguous:

```text
STOP
DO NOT RETRY DESTRUCTIVELY WITHOUT EVIDENCE
REPORT BLOCKED / PARTIAL
```

# STEP 5 — NO-ORPHAN / REGISTRY RECONCILIATION

After successful deletion, update current repository docs so App799 is not presented as a live app.

`project-docs/APP_REGISTRY.md` should preserve historical chronology but clearly classify:

```text
App799 = DELETED / HISTORICAL SUPERSEDED HRCC SHELL
```

Do not remove historical evidence that explains why it existed.

App801 remains:

```text
App801 = PLANNED / NOT CREATED
Name = MBO Employee Authentication & MFA Credential Store [Sandbox]
```

Search active/current sources for stale assumptions that App799 is live or available.

Required:

```text
STALE_ACTIVE_APP799_LIVE_REFERENCES = 0
STALE_ACTIVE_APP799_RUNTIME_REFERENCES = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
```

# STEP 6 — TEST / GIT SAFETY

Run:

```bash
npm test
git diff --check
git status --short
```

Require:

```text
npm test = PASS
git diff --check = PASS
tracked tree clean after commit
local HEAD = origin/ai/antigravity-wp002c after push
```

No reset.
No rebase.
No force push.
No history rewrite.

# REQUIRED FINAL SUMMARY

```text
M10B_SEC_B_APP799_CONTROLLED_CLEANUP = COMPLETE / BLOCKED

USER_AUTHORIZATION = EXPLICIT
AUTHORIZED_DESTRUCTIVE_TARGET = APP799 ONLY
AUTHORIZATION_STATUS = EXECUTED / CLOSED after success
NEW_KINTONE_WRITE_AUTHORIZATION = NO

APP799_EXISTS_BEFORE_DELETE = actual
APP799_RECORD_COUNT_BEFORE_DELETE = actual
APP799_CUSTOM_FIELDS_BEFORE_DELETE = actual
APP799_ACTIVE_RUNTIME_REFERENCES = actual

BACKUP_PATH = actual
BACKUP_MANIFEST_SHA256 = actual
BACKUP_VERIFIED_BY_EXECUTION_PLANE = YES/NO
INDEPENDENT_REVIEWER_BYTE_VERIFICATION = NOT_PERFORMED

APP799_DELETE = EXECUTED / NOT_EXECUTED
APP799_EXISTS_AFTER_DELETE = NO/YES/UNVERIFIABLE
APP800_UNTOUCHED = YES/NO
NON_APP799_KINTONE_WRITES = 0/actual
APP801_CREATED = NO

STALE_ACTIVE_APP799_LIVE_REFERENCES = 0/actual
STALE_ACTIVE_APP799_RUNTIME_REFERENCES = 0/actual
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED

npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW ONLY
```

Commit and push same branch, then STOP.

Do NOT create App801.
Do NOT implement authentication.
Do NOT deploy external service.
Do NOT touch any app other than deleting App799.