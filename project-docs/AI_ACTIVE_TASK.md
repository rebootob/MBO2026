# AI ACTIVE TASK — M10C-AUTH-A APP801 CREATION PREFLIGHT

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Head:** `8d0b538e8729e6d4a0193f399a4bafa247cec26d`
> **Mode:** READ-ONLY / CHANGE PLAN / SCHEMA + ACL PREFLIGHT ONLY — KINTONE WRITES = 0

# NORTH STAR

```text
Apps foundation                 = READY
App795 routing                  = 17/17 READY
App796 scoring                  = 8/8 READY
App800 HR Control Center        = LIVE
App799                          = DELETED / VERIFIED
M10B-SEC architecture           = PASS

NEXT DELIVERY GOAL:
Create a dedicated secure credential store for employee self-service authentication,
then implement Phase 1 Employee_Code + Personal Password and later Phase 2 TOTP.

THIS TASK = APP801 CREATION PREFLIGHT ONLY
NO KINTONE WRITE YET
```

# FROZEN APP801 IDENTITY

```text
Planned App ID reference = 801 (actual ID must be captured from Kintone only after future creation)
Planned Name = MBO Employee Authentication & MFA Credential Store [Sandbox]
Role = AUTHENTICATION_CREDENTIAL_STORE_ONLY
Environment = Sandbox
App53 remains Employee Master = YES / READ ONLY
Employee browser direct access = PROHIBITED
Server-side access only = REQUIRED
```

Do not call App801 an Employee Master.
Do not store passwords in App53.
Do not create App801 in this task.

# SECURITY MODEL TO PRESERVE

```text
Phase 1 = Employee_Code + Personal Password
Phase 2 = Employee_Code + Personal Password + Google Authenticator-compatible TOTP
Password verification = SERVER SIDE ONLY
Password hash = Argon2id preferred
TOTP secret = encrypted/protected server-side representation only
Plaintext password/TOTP secret = PROHIBITED
Browser/localStorage credential storage = PROHIBITED
```

# STEP 1 — CONFIRM NO DUPLICATE / STALE APP

Using GET/read-only evidence only:

```text
App799 must remain deleted
App800 must remain active HR Control Center
No existing live app currently serves App801 credential-store purpose
No repo config/runtime already binds auth storage to another app
```

Required output:

```text
APP799_STILL_DELETED = YES/NO
APP800_ACTIVE = YES/NO
EXISTING_AUTH_CREDENTIAL_APP = NONE / exact app
APP801_DUPLICATE_RISK = NONE / exact risk
```

If another live credential/auth app is found, STOP and report BLOCKED.

# STEP 2 — DEFINE MINIMUM APP801 SCHEMA

Design the smallest schema needed for Phase 1 while being migration-safe for Phase 2.

At minimum evaluate these fields and include only those justified:

```text
Employee_Code
Password_Hash
Password_Algorithm
Credential_Version
Account_Status
Force_Password_Change
Failed_Attempts
Locked_Until
Password_Changed_At
Last_Login_At
Session_Version or equivalent revocation version if required
MFA_Enabled
TOTP_Secret_Encrypted
MFA_Enrolled_At
```

For each proposed field specify:

```text
Field Code
Label
Kintone field type
Required YES/NO
Unique YES/NO
Default
Phase 1 / Phase 2
Sensitivity
Who reads
Who writes
Why required
```

Rules:
- `Employee_Code` must be unique.
- Do not duplicate employee profile fields that belong to App53 unless required for immutable audit and explicitly justified.
- Do not add decorative/unused fields.
- No plaintext password field.
- No plaintext TOTP secret field.

# STEP 3 — ACL / ACCESS DESIGN

Produce exact intended security posture for App801.

Required target posture:

```text
General/shared Kintone users = NO READ / NO WRITE
Employee browser JS = NO DIRECT APP801 ACCESS
Creator/Admin/approved service identity = minimum required access only
Default deny
```

Define:

```text
App-level ACL
Record-level ACL if needed
Who is allowed to administer/reset credentials
How Node.js Auth Proxy/service identity accesses App801
Whether API token is acceptable or dedicated service user is required
Secret handling rules for API credentials
```

If Kintone ACL cannot meet the intended boundary with the selected service access model, report BLOCKED rather than weakening security.

# STEP 4 — INITIAL PASSWORD / RESET OPERATING MODEL

Freeze practical Phase 1 operations:

```text
Initial credential creation
Temporary password generation
Forced password change on first login
Forgotten password reset by HR/IT without knowing permanent password
Account disable/termination
Session revocation after reset
Lockout / unlock
Audit requirements
```

Do not require email because not every employee has email.

# STEP 5 — CREATION CHANGE PLAN

Produce the exact future controlled-write plan for App801 creation.

Must include:

```text
WHAT
WHERE
HOW
WHY
EXPECTED IMPACT
RISKS
PRE-WRITE BACKUP / EVIDENCE
WRITE SCOPE
READ-BACK VERIFICATION
TEST PLAN
ROLLBACK PLAN
NO-ORPHAN CHECK
```

Future write scope must be narrow:

```text
APP_CREATE = exact App801 only
SCHEMA_WRITE = App801 only
ACL_WRITE = App801 only
RECORD_WRITE = 0 during creation task unless separately authorized
APP794/795/796/797/798/800 = NO WRITES
APP53 = READ ONLY
EXTERNAL AUTH SERVICE DEPLOY = NO in App801 creation task
```

Explicitly list every Kintone API/write operation that will require user authorization.

# STEP 6 — DETERMINE WHETHER APP ID 801 IS GUARANTEED

Do not assume Kintone will allocate ID 801 merely because that number is planned.

Determine from actual environment/API behavior whether exact app ID selection is possible.

Required:

```text
CAN_FORCE_APP_ID_801 = YES/NO/UNKNOWN
EXPECTED_CREATION_ID_BEHAVIOR = exact
REGISTRY_UPDATE_RULE = use actual created ID, never fabricate
```

If exact ID 801 cannot be guaranteed and a different ID may be allocated, preserve the business name and role; the actual live ID becomes authoritative after creation.

# STEP 7 — TEST / GIT

Run:

```bash
npm test
git diff --check
git status --short
```

Required:

```text
KINTONE_WRITES_THIS_TASK = 0
APP801_CREATED = NO
EXTERNAL_DEPLOY_THIS_TASK = 0
npm test = PASS
git diff --check = PASS
NO_ORPHAN_ARTIFACT_GATE = PASS
local HEAD = origin/ai/antigravity-wp002c after push
```

Update only living docs/evidence required for this preflight. Avoid redundant files.

# FINAL REQUIRED SUMMARY

```text
M10C_AUTH_A_APP801_PREFLIGHT = COMPLETE / BLOCKED

APP799_STILL_DELETED = actual
APP800_ACTIVE = actual
EXISTING_AUTH_CREDENTIAL_APP = actual
APP801_DUPLICATE_RISK = actual

APP801_PLANNED_NAME = MBO Employee Authentication & MFA Credential Store [Sandbox]
APP801_ROLE = AUTHENTICATION_CREDENTIAL_STORE_ONLY
APP801_SCHEMA_FIELD_COUNT = actual
APP801_EMPLOYEE_CODE_UNIQUE = YES/NO
PLAINTEXT_PASSWORD_FIELD = NO
PLAINTEXT_TOTP_SECRET_FIELD = NO

APP801_ACL_MODEL = exact
GENERAL_EMPLOYEE_DIRECT_ACCESS = PROHIBITED
SERVER_SIDE_ACCESS_ONLY = YES

CAN_FORCE_APP_ID_801 = actual
EXPECTED_CREATION_ID_BEHAVIOR = actual

KINTONE_WRITE_REQUIRED_FOR_NEXT_TASK = YES/NO
AUTHORIZED_WRITE_SCOPE_REQUIRED = exact
USER_AUTHORIZATION_REQUIRED = YES/NO
APP801_CREATED = NO
KINTONE_WRITES_THIS_TASK = 0

npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW / USER APP801 CREATION AUTHORIZATION
```

Commit and push same branch, then STOP.

Do NOT create App801.
Do NOT implement login.
Do NOT deploy Node.js auth service.
Do NOT write credentials.
Do NOT touch App53 or Apps794-800.