# AI ACTIVE TASK — M10C-AUTH-C SERVER-SIDE AUTH IMPLEMENTATION PREFLIGHT

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Head:** `bb8041314bc35823f36e7a2c81e8350a3a3699ea`
> **Mode:** REPOSITORY IMPLEMENTATION PREFLIGHT / NO LIVE DEPLOY / NO KINTONE WRITES

# NORTH STAR

```text
Apps foundation                 = READY
App795 routing                  = 17/17 READY
App796 scoring                  = 8/8 READY
App800 HR Control Center        = LIVE
App801 credential store         = LIVE / 14 fields / 0 records / Creator-only
M10B-SEC architecture           = PASS

TARGET PHASE 1:
Employee_Code + Personal Password
        ↓
Server-side verification
        ↓
Secure employee-bound session
        ↓
App53 trusted employee snapshot
        ↓
Trusted identity bridge to App794

THIS TASK:
Design the exact repository implementation package and hosting/session contract before any auth-service deployment or credential provisioning.
```

# HARD SAFETY

```text
KINTONE_WRITES_THIS_TASK = 0
APP801_RECORD_WRITES = 0
APP801_SCHEMA_WRITES = 0
APP794_WRITES = 0
APP53_WRITES = 0
CUSTOMIZATION_DEPLOY = 0
EXTERNAL_SERVICE_DEPLOY = 0
PASSWORD_PROVISIONING = 0
LOGIN_GO_LIVE = 0
TOTP_IMPLEMENTATION = 0
```

All protected/legacy apps remain READ ONLY.

# STEP 1 — INSPECT ACTUAL SERVER/HOSTING OPTIONS

Inspect repository/package/runtime evidence and report the exact trusted-server options currently available.

Required:

```text
TRUSTED_SERVER_COMPONENT_EXISTS = YES/NO/PARTIAL
CURRENT_HOSTING_MODEL = exact evidence
RECOMMENDED_AUTH_SERVICE_HOST = exact option
NEW_EXTERNAL_DEPENDENCY_REQUIRED = YES/NO
```

Do not invent hosting. If Node.js Auth Proxy requires a new hosting platform, state that explicitly and identify the smallest realistic option.

# STEP 2 — DEFINE PHASE 1 SERVER API CONTRACT

Design the minimum server-side endpoints/contracts for:

```text
POST /auth/login
POST /auth/change-password
POST /auth/logout
GET  /auth/session
POST /auth/admin/reset-password   (or safest equivalent)
POST /auth/admin/disable-account  (or safest equivalent)
```

For every endpoint define:

```text
request fields
response fields
required authentication
rate-limit rule
server-side App53/App801 interaction
session changes
sensitive data that MUST NOT be logged
failure behavior
```

Do not implement TOTP endpoints yet.

# STEP 3 — PASSWORD HASHING CONTRACT

Freeze exact Argon2id parameters supported by the chosen Node runtime/library.

Required:

```text
PASSWORD_HASH_ALGORITHM = Argon2id
LIBRARY = exact package
MEMORY_COST = exact
TIME_COST = exact
PARALLELISM = exact
SALT_GENERATION = exact
HASH_ENCODING = exact
REHASH_POLICY = exact
```

No SHA-256/MD5 standalone hashing.
No client-side hashing as password verification.

# STEP 4 — SESSION DESIGN AGAINST KINTONE ORIGIN

Prove the safest feasible session model with actual Kintone ↔ auth-service browser constraints.

Prefer:

```text
HttpOnly
Secure
SameSite appropriate to actual origin model
short-lived
server-verifiable
bound to Employee_Code + Credential_Version/Session_Version equivalent
```

Analyze:

```text
same-origin vs cross-origin deployment
CORS
credentials/include requirements
CSRF protection
cookie Domain/Path
SameSite choice
session expiry
idle timeout
logout
password-reset revocation
shared workstation behavior
XSS implications
```

Hard rule:
- Do NOT use localStorage/sessionStorage bearer tokens as default auth state.
- If HttpOnly cookie is impossible, STOP and present the safest alternative for Control Plane decision.

# STEP 5 — APP801 REPOSITORY CONTRACT

Define exact server-side read/write operations against App801.

At minimum:

```text
lookup unique Employee_Code
verify Account_Status
verify lockout
read Password_Hash + Password_Algorithm + Credential_Version
increment/reset Failed_Attempts
set Locked_Until
update Password_Hash on password change/reset
set Force_Password_Change
update Password_Changed_At / Last_Login_At
```

Clarify whether a service user or API token is the approved access mechanism and why.

Browser JS must never receive Password_Hash, TOTP_Secret_Encrypted or Recovery_Codes_Hashed.

# STEP 6 — APP53 TRUST CONTRACT

App53 remains READ ONLY and authoritative employee master.

After successful password verification, server must validate exact Employee_Code in App53 before issuing/confirming session.

Define exact trusted snapshot fields needed by App794, including:

```text
Employee_Code
Department
Section
Team
Position/Profile context required for App796
active/inactive status if available
```

Do not duplicate these fields into App801 unless justified.

Fail closed for missing/inactive employee.

# STEP 7 — APP794 TRUSTED IDENTITY BRIDGE

Design how App794 customization later obtains employee identity from the server session.

Required:

```text
editable Employee_Code field is NOT authentication
URL/query/localStorage Employee_Code is NOT trusted
shared Kintone user is NOT individual identity
GET /auth/session returns trusted Employee_Code + minimum safe profile
App794 derives routing/scoring only from trusted session/App53 snapshot
```

Define how App794 should behave on:

```text
no session
expired session
disabled account
missing App53 employee
routing missing/duplicate
scoring missing/duplicate
```

No App794 deploy in this task.

# STEP 8 — INITIAL PASSWORD / HR RESET FLOW

Freeze exact operational flow without provisioning real accounts yet.

Required answers:

```text
Who creates initial credential?
How temporary password is generated?
How delivered without employee email?
How long temporary password is valid?
Force change on first login?
How HR resets forgotten password without old password?
How HR avoids knowing permanent password?
How reset revokes existing sessions?
How disable/termination is enforced?
```

Prefer one-time/random temporary password + forced change.
Do not store plaintext temp password after handoff.

# STEP 9 — REPOSITORY IMPLEMENTATION PLAN

Produce the smallest implementation package for the NEXT task only.

Separate clearly:

```text
A. Repository code implementation (no external deploy)
B. External auth-service deployment
C. Credential provisioning / App801 record writes
D. App794 customization deployment
```

For each include:

```text
WHAT
WHERE exact files/modules
HOW
WHY
EXPECTED IMPACT
RISK
TEST PLAN
ROLLBACK PLAN
KINTONE WRITE REQUIRED
EXTERNAL DEPLOY REQUIRED
USER AUTHORIZATION REQUIRED
```

Repository governance:
- modify existing files/modules first where appropriate
- new files only for clear separation of concerns
- no duplicate auth clients/services
- no `_old` / `_v1`
- no committed secrets
- no plaintext password fixtures

# STEP 10 — TEST PLAN / SECURITY TESTS

Define tests for at least:

```text
valid login
wrong password
unknown Employee_Code
inactive employee
5 failed attempts lockout
lockout expiry
forced password change
password reset revokes session
Employee_Code switching attempt
query/localStorage tampering
session expiry
CSRF
CORS origin rejection
shared workstation logout
App801 secret fields never exposed
```

Run existing tests only in this task:

```bash
npm test
git diff --check
git status --short
```

# FINAL REQUIRED SUMMARY

```text
M10C_AUTH_C_SERVER_PREFLIGHT = COMPLETE / BLOCKED

TRUSTED_SERVER_COMPONENT_EXISTS = actual
RECOMMENDED_AUTH_SERVICE_HOST = actual
NEW_EXTERNAL_DEPENDENCY_REQUIRED = YES/NO

PASSWORD_HASH_ALGORITHM = Argon2id
PASSWORD_HASH_LIBRARY = actual
SESSION_MODEL = exact
HTTPONLY_COOKIE_FEASIBLE = YES/NO
CROSS_ORIGIN_RISK = exact

APP801_SERVER_ACCESS_MODEL = exact
APP53_VALIDATION = REQUIRED / READ ONLY
APP794_TRUSTED_SESSION_BRIDGE = exact

INITIAL_PASSWORD_FLOW = exact
HR_RESET_FLOW = exact
LOCKOUT_POLICY = exact

NEXT_REPOSITORY_IMPLEMENTATION_SCOPE = exact
NEXT_TASK_KINTONE_WRITES = NONE / exact
NEXT_TASK_EXTERNAL_DEPLOY = YES/NO
NEXT_TASK_USER_AUTHORIZATION_REQUIRED = YES/NO

KINTONE_WRITES_THIS_TASK = 0
APP801_RECORD_COUNT_EXPECTED = 0
EXTERNAL_DEPLOY_THIS_TASK = 0
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

NEXT_ACTION = CHATGPT REVIEW ONLY
```

Update only living architecture/security/current-state/review docs needed to record factual preflight conclusions.
Commit and push same branch, then STOP.

Do NOT deploy auth service.
Do NOT create credential records.
Do NOT seed passwords.
Do NOT deploy App794 customization.
Do NOT implement TOTP yet.
