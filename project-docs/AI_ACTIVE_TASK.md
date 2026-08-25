# AI ACTIVE TASK — M10C-AUTH-B CONTROLLED APP801 CREDENTIAL STORE CREATION

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Head:** `8d0896776777a50b374946343de9d0d5fbe9f2b2`
> **Mode:** CONTROLLED KINTONE WRITE — CREATE ONE AUTH CREDENTIAL APP ONLY

# NORTH STAR

```text
Apps foundation                 = READY
App795 routing                  = 17/17 READY
App796 scoring                  = 8/8 READY
App800 HR Control Center        = LIVE
App799                          = DELETED / VERIFIED
M10B-SEC architecture           = PASS
M10C-AUTH-A App801 preflight    = PASS

USER AUTHORIZATION:
Create the dedicated MBO employee authentication credential store = EXPLICITLY APPROVED

THIS TASK:
Create exactly ONE credential-store app, configure the approved minimum schema and restrictive ACL,
deploy/read-back verify it, record the ACTUAL Kintone App ID, and STOP.
```

# USER AUTHORIZATION BOUNDARY

The user explicitly authorized:

```text
"อนุมัติสร้าง App801"
```

Interpret this authorization narrowly as:

```text
CREATE exactly ONE new Kintone app for:
MBO Employee Authentication & MFA Credential Store [Sandbox]

Configure that new app only:
- approved 14-field credential schema
- restrictive Creator/Service-only ACL / default deny
- deploy / read-back verification
- registry/config/docs reconciliation using ACTUAL Kintone App ID
```

This authorization does NOT authorize:

```text
credential record creation / seeding
plaintext or temporary password records
employee account provisioning
App53 mutation
App794/795/796/797/798/800 mutation
login UI implementation
Node.js auth-service deployment
session/token implementation
TOTP enrollment
external infrastructure deployment
creating a second app if the allocated App ID is not 801
manual deletion of any app
```

Consume and close this authorization after one successful controlled app creation + read-back.

# FROZEN BUSINESS IDENTITY

```text
Business Name = MBO Employee Authentication & MFA Credential Store [Sandbox]
Role = AUTHENTICATION_CREDENTIAL_STORE_ONLY
Environment = Sandbox
App53 remains Employee Master = YES / READ ONLY
General employee browser direct access = PROHIBITED
Server-side auth service access only = REQUIRED for runtime use
```

Important:
- `801` is a planned/reference ID only until Kintone returns the actual created app ID.
- Never fabricate or force an ID by creating throwaway apps.
- Never create a second app just to obtain ID 801.
- Business name + role are authoritative; actual Kintone ID is authoritative after creation.

# APPROVED SCHEMA — 14 FIELDS ONLY

Create exactly this minimum schema unless a Kintone field-type limitation makes one field impossible. If so, STOP before deploy and report BLOCKED rather than silently substituting a weaker design.

```text
1. Employee_Code
2. Password_Hash
3. Password_Algorithm
4. Credential_Version
5. Account_Status
6. Force_Password_Change
7. Failed_Attempts
8. Locked_Until
9. Password_Changed_At
10. Last_Login_At
11. MFA_Enabled
12. TOTP_Secret_Encrypted
13. MFA_Enrolled_At
14. Recovery_Codes_Hashed
```

Required semantic rules:

```text
Employee_Code = SINGLE_LINE_TEXT, required, unique
Password_Hash = SINGLE_LINE_TEXT, required only when a credential is provisioned later; no record creation in this task
Password_Algorithm = SINGLE_LINE_TEXT or controlled dropdown if preflight design already froze it; no plaintext secret
Credential_Version = numeric or appropriate scalar version field
Account_Status = controlled status value suitable for ACTIVE/DISABLED/LOCKED or preflight-frozen equivalent
Force_Password_Change = boolean/check/dropdown equivalent
Failed_Attempts = NUMBER
Locked_Until = DATETIME
Password_Changed_At = DATETIME
Last_Login_At = DATETIME
MFA_Enabled = boolean/check/dropdown equivalent
TOTP_Secret_Encrypted = MULTI_LINE_TEXT or suitable encrypted-blob field; plaintext forbidden
MFA_Enrolled_At = DATETIME
Recovery_Codes_Hashed = MULTI_LINE_TEXT or suitable hashed-data field; plaintext recovery codes forbidden
```

Preserve the exact preflight design where it is more specific than the generic type guidance above.

Hard prohibitions:

```text
NO Password_Plaintext field
NO Temporary_Password_Plaintext field
NO PIN field used as password substitute
NO TOTP_Secret plaintext field
NO Recovery_Codes plaintext field
NO duplicate employee profile fields from App53
NO decorative or unused fields
NO extra legacy auth fields
```

# STEP 1 — FINAL PRE-CREATE SAFETY CHECK

Before any write, perform read-only checks:

```text
APP799_STILL_DELETED = YES
APP800_ACTIVE = YES
EXISTING_AUTH_CREDENTIAL_APP = NONE
EXACT_NAME_DUPLICATE = 0
ACTIVE_RUNTIME_AUTH_STORE_BINDING = NONE
```

Search current repository/config/docs for any existing live credential-store app binding.

If any duplicate or conflicting live auth app exists:

```text
STOP
DO NOT CREATE
REPORT BLOCKED
```

# STEP 2 — RECORD PRE-WRITE EVIDENCE

Capture a pre-create evidence package sufficient to prove environment state before creation:

```text
app list / relevant neighboring app state where available
App799 deletion evidence
App800 identity/read-back
no exact-name duplicate evidence
planned schema manifest
planned ACL manifest
```

Store under a dedicated path such as:

```text
backups/m10c-auth-b-app-creation/<timestamp>/
```

Create manifest hashes and SHA-256 of the manifest.

Required:

```text
PREWRITE_EVIDENCE_CREATED = YES
PREWRITE_MANIFEST_SHA256 = actual
```

Do not put secrets into evidence.

# STEP 3 — CREATE EXACTLY ONE APP

Create exactly one Kintone app with name:

```text
MBO Employee Authentication & MFA Credential Store [Sandbox]
```

Immediately capture the actual app ID returned by Kintone.

Required behavior:

```text
ACTUAL_CREATED_APP_ID = Kintone-returned value
```

Decision rule:

```text
If ACTUAL_CREATED_APP_ID = 801:
    continue normally

If ACTUAL_CREATED_APP_ID != 801:
    DO NOT create another app
    DO NOT delete the newly created valid credential app merely to chase ID 801
    continue using the actual ID as authoritative
    reconcile registry/config/docs to actual ID
```

If app creation response is ambiguous:

```text
STOP
DO NOT RETRY CREATE until exact-name duplicate/live app check proves whether creation occurred
```

# STEP 4 — APPLY THE 14-FIELD SCHEMA TO THE CREATED APP ONLY

Apply schema changes only to `ACTUAL_CREATED_APP_ID`.

Verify after schema write/deploy:

```text
APP_SCHEMA_FIELD_COUNT = 14 custom approved fields
EMPLOYEE_CODE_REQUIRED = YES
EMPLOYEE_CODE_UNIQUE = YES
PLAINTEXT_PASSWORD_FIELD = NO
PLAINTEXT_TOTP_SECRET_FIELD = NO
PLAINTEXT_RECOVERY_CODES_FIELD = NO
UNAPPROVED_EXTRA_FIELDS = 0
```

Kintone system fields do not count as unapproved custom fields.

If schema cannot match the approved security semantics exactly enough:

```text
STOP
DO NOT SEED RECORDS
REPORT BLOCKED / PARTIAL
```

# STEP 5 — APPLY RESTRICTIVE ACL TO CREATED APP ONLY

Target posture:

```text
General/shared Kintone users = NO READ / NO WRITE
Employee browser JS = NO DIRECT ACCESS
Creator/Admin/approved service identity = minimum required access only
Default deny
```

Apply the preflight-frozen ACL model only to `ACTUAL_CREATED_APP_ID`.

Read-back verify ACL after deploy.

Required:

```text
GENERAL_EMPLOYEE_DIRECT_ACCESS = PROHIBITED
DEFAULT_DENY = YES
CREATOR_OR_APPROVED_SERVICE_ACCESS = YES
```

Do not weaken ACL to make browser-based password verification easier.

# STEP 6 — NO RECORDS / NO CREDENTIALS

This task must leave the credential store empty.

Required:

```text
RECORD_COUNT_AFTER_CREATION = 0
PASSWORD_RECORDS_CREATED = 0
TEMP_PASSWORDS_CREATED = 0
TOTP_SECRETS_CREATED = 0
RECOVERY_CODES_CREATED = 0
```

No employee provisioning yet.

# STEP 7 — POST-CREATE READ-BACK / SAFETY

Verify:

```text
CREATED_APP_EXISTS = YES
CREATED_APP_NAME = MBO Employee Authentication & MFA Credential Store [Sandbox]
ACTUAL_CREATED_APP_ID = actual
SCHEMA_MATCH = PASS
ACL_MATCH = PASS
RECORD_COUNT = 0

APP53_MODIFIED = NO
APP794_MODIFIED = NO
APP795_MODIFIED = NO
APP796_MODIFIED = NO
APP797_MODIFIED = NO
APP798_MODIFIED = NO
APP800_MODIFIED = NO
APP799_RECREATED = NO
NON_TARGET_KINTONE_WRITES = 0
```

Read-only verification of protected apps is allowed where needed.

# STEP 8 — REGISTRY / CONFIG RECONCILIATION

Update current living docs/config so the actual app ID becomes authoritative.

If actual ID is 801:

```text
App801 = LIVE / CREATED / CREDENTIAL STORE
```

If actual ID differs:

```text
Do not keep a false live App801 binding.
Record historical planned reference 801 only where useful.
Register the ACTUAL_CREATED_APP_ID as the live credential store.
Update config/constants that are intended to point to the live credential store.
```

Do not leave duplicate active IDs or stale planned-ID assumptions.

Required:

```text
STALE_ACTIVE_PLANNED_ID_REFERENCES = 0
DUPLICATE_AUTH_STORE_BINDINGS = 0
NO_ORPHAN_ARTIFACT_GATE = PASS
```

# STEP 9 — TEST / GIT

Run:

```bash
npm test
git diff --check
git status --short
```

Required:

```text
npm test = PASS
git diff --check = PASS
NO_ORPHAN_ARTIFACT_GATE = PASS
tracked tree clean after commit
local HEAD = origin/ai/antigravity-wp002c after push
```

No reset.
No rebase.
No force push.
No history rewrite.

# AUTHORIZATION WRITE SCOPE

Allowed Kintone writes in this task are strictly limited to the one newly created credential app:

```text
APP_CREATE = 1 credential-store app only
SCHEMA_WRITE = created credential-store app only
ACL_WRITE = created credential-store app only
DEPLOY = created credential-store app only
RECORD_WRITE = 0
CUSTOMIZATION_WRITE = 0
PROCESS_MANAGEMENT_WRITE = 0 unless strictly required by the approved preflight (default = 0)
NON_TARGET_APP_WRITES = 0
EXTERNAL_DEPLOY = 0
```

# REQUIRED FINAL SUMMARY

```text
M10C_AUTH_B_APP_CREATION = COMPLETE / BLOCKED / PARTIAL

USER_AUTHORIZATION = EXPLICIT
AUTHORIZED_SCOPE = CREATE_ONE_CREDENTIAL_STORE_APP + SCHEMA + ACL + DEPLOY/READBACK
AUTHORIZATION_STATUS = EXECUTED_AND_CLOSED / NOT_CONSUMED_DUE_TO_BLOCKER

PRECREATE_DUPLICATE_CHECK = PASS/FAIL
PREWRITE_EVIDENCE_CREATED = YES/NO
PREWRITE_MANIFEST_SHA256 = actual

PLANNED_REFERENCE_ID = 801
ACTUAL_CREATED_APP_ID = actual / NONE
ACTUAL_CREATED_APP_NAME = actual / NONE
ACTUAL_ID_EQUALS_801 = YES/NO/N/A
SECOND_APP_CREATED_TO_CHASE_ID_801 = NO

SCHEMA_FIELD_COUNT = actual
SCHEMA_MATCH = PASS/FAIL
EMPLOYEE_CODE_UNIQUE = YES/NO
PLAINTEXT_PASSWORD_FIELD = NO
PLAINTEXT_TOTP_SECRET_FIELD = NO
PLAINTEXT_RECOVERY_CODES_FIELD = NO

ACL_MATCH = PASS/FAIL
GENERAL_EMPLOYEE_DIRECT_ACCESS = PROHIBITED
DEFAULT_DENY = YES/NO

RECORD_COUNT = actual
PASSWORD_RECORDS_CREATED = 0
TEMP_PASSWORDS_CREATED = 0
TOTP_SECRETS_CREATED = 0
RECOVERY_CODES_CREATED = 0

APP53_MODIFIED = NO
APP794_MODIFIED = NO
APP795_MODIFIED = NO
APP796_MODIFIED = NO
APP797_MODIFIED = NO
APP798_MODIFIED = NO
APP800_MODIFIED = NO
APP799_RECREATED = NO
NON_TARGET_KINTONE_WRITES = 0

STALE_ACTIVE_PLANNED_ID_REFERENCES = actual
DUPLICATE_AUTH_STORE_BINDINGS = actual
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED

npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL

NEW_KINTONE_WRITE_AUTHORIZATION = NO
NEXT_ACTION = CHATGPT REVIEW ONLY
```

Commit and push same branch, then STOP.

Do NOT implement login.
Do NOT deploy Node.js auth service.
Do NOT create employee credential records.
Do NOT start password provisioning.
Do NOT start TOTP enrollment.
