# AI ACTIVE TASK — M10B-SEC EMPLOYEE PASSWORD AUTHENTICATION ARCHITECTURE + GOOGLE AUTHENTICATOR READY DESIGN

> **Control Plane:** ChatGPT / Independent Reviewer
> **Execution Plane:** Antigravity standalone only
> **Repository:** `rebootob/MBO2026`
> **Branch:** `ai/antigravity-wp002c`
> **Reviewed Head:** `7ab3e3bb5d681a37e5655bee87f20f9bdfbdca3a`
> **Mode:** SECURITY ARCHITECTURE / PRE-FLIGHT / PLAN ONLY — KINTONE WRITES = 0

# NORTH STAR

```text
M9 Applications + Dashboard Acceptance = PASS_WITH_OPEN_DEPENDENCIES
M10A Runtime Discovery                  = PASS
SEC-DEP-001                             = OPEN

USER SECURITY DECISION:
Phase 1 = Employee Code + Personal Password
Phase 2 = Employee Code + Personal Password + Google Authenticator TOTP

M10B-SEC = DESIGN THE SAFE AUTHENTICATION LAYER BEFORE IMPLEMENTATION
NO LIVE KINTONE MUTATION YET
```

# USER DECISION — FREEZE THIS DIRECTION

The user has rejected manager-only proxy as the target employee identity model and wants employee self-service identity based on:

```text
PHASE 1
Employee_Code + Personal Password

PHASE 2
Employee_Code + Personal Password + Google Authenticator-compatible TOTP
```

Important terminology:
- “Google Authenticator” means standards-based TOTP compatible with Google Authenticator.
- Do NOT design dependence on a Google account/email login.
- Not every employee has email.
- Do NOT use email OTP or Telegram OTP as the primary identity layer.

# SECURITY OBJECTIVE

Solve SEC-DEP-001 without trusting the shared Kintone account as an individual employee identity.

Required security binding:

```text
Employee enters Employee_Code + personal secret
        ↓
Server-side authentication service verifies credentials
        ↓
Authenticated short-lived session/token is created
        ↓
Session is cryptographically bound to exact Employee_Code
        ↓
App794 accepts employee context ONLY from authenticated session
        ↓
Employee cannot switch Employee_Code client-side
```

Future Phase 2:

```text
Employee_Code + Password
        ↓
Password verified
        ↓
If MFA_Enabled = true
require standards-based TOTP
        ↓
TOTP verified server-side
        ↓
Authenticated session
```

# HARD SAFETY

```text
KINTONE_WRITES_THIS_TASK = 0
SCHEMA_WRITES = 0
RECORD_WRITES = 0
PROCESS_WRITES = 0
CUSTOMIZATION_DEPLOY = 0
ACL_WRITES = 0
EXTERNAL_SERVICE_DEPLOY = 0
```

Protected apps remain READ ONLY:

```text
53, 139, 283, 305, 307, 310, 640, 643, 715, 716
```

Delivered apps 794, 795, 796, 797, 798, 800 are READ ONLY in M10B-SEC.

Do NOT implement login UI yet.
Do NOT create password records yet.
Do NOT deploy a backend yet.
Do NOT add MFA fields yet.

# NON-NEGOTIABLE SECURITY RULES

Reject any design that does any of the following:

```text
stores plaintext passwords
stores reversible passwords
stores password hashes in browser/localStorage/sessionStorage
validates password only in Kintone JavaScript
uses hidden fields as authorization
accepts Employee_Code from URL/query string as trusted identity
trusts shared Kintone user as individual employee identity
keeps auth token readable by ordinary JS if an HttpOnly cookie design is feasible
uses a static PIN as equivalent to a proper password
stores TOTP secret in plaintext without server-side protection
logs passwords, raw TOTP secrets, recovery codes, or session tokens
```

Use server-side verification and fail closed.

# STEP 1 — INSPECT CURRENT REPOSITORY / HOSTING CONSTRAINTS

Determine what runtime/hosting options actually exist in this project for a server-side authentication component.

Inspect:

```text
package.json
existing backend/serverless/API modules
existing hosting assumptions
existing secrets/config patterns
App794 customization deployment model
whether current app is Kintone-only browser JavaScript or already has a trusted server component
```

Required output:

```text
TRUSTED_SERVER_COMPONENT_EXISTS = YES / NO / PARTIAL
CURRENT_HOSTING_MODEL = exact evidence
AUTH_SERVICE_DEPLOYMENT_OPTIONS = evidence-supported options
```

Do not invent a backend platform that the repo does not support without labeling it as a new external dependency.

# STEP 2 — AUTHENTICATION DATA MODEL

Design a dedicated authentication credential store separate from App53.

App53 remains authoritative employee master and READ ONLY.

Do NOT put password fields into App53.

Define the minimum credential/account model, including at least:

```text
Employee_Code (foreign identity reference to App53)
Password_Hash
Password_Algorithm / Hash_Version if needed
Account_Status
Failed_Attempts
Locked_Until
Password_Changed_At
Credential_Version
MFA_Enabled
TOTP_Secret_Encrypted or equivalent protected server-side representation
MFA_Enrolled_At
Last_Login_At
```

Only include fields that are justified. Avoid unnecessary sensitive data.

For every field state:

```text
purpose
sensitivity
where stored
who can read
who can write
retention
whether Phase 1 or Phase 2
```

Required recommendation for password hashing:
- Prefer Argon2id when supported by the selected runtime.
- If Argon2id is not realistically supported, evaluate bcrypt/scrypt and explain tradeoff.
- Never use SHA-256/MD5 as standalone password hashing.

# STEP 3 — PASSWORD POLICY / LOCKOUT / RECOVERY

Design Phase 1 operational rules.

Cover:

```text
initial password provisioning
first-login password change requirement
minimum password policy
rate limiting
failed-attempt lockout
credential reset by HR/IT
password change flow
session revocation after reset
employee termination / disabled account handling
App53 employee inactive/missing behavior
```

Prefer a practical internal-company policy rather than arbitrary complexity rules.

Explicitly answer:

```text
How is the initial password delivered if not every employee has email?
How can HR reset a forgotten password without knowing the old password?
How do we avoid HR ever seeing the employee's permanent password?
```

If an HR-issued temporary password is recommended, require forced change on first login.

# STEP 4 — SESSION / TOKEN DESIGN

Design the authenticated session boundary.

Required properties:

```text
session bound to exact Employee_Code
short-lived
server-verifiable / tamper-resistant
expiry
logout/revocation strategy
password reset revokes old sessions
MFA enrollment/change revokes old sessions where appropriate
CSRF consideration
XSS/token theft consideration
shared workstation consideration
```

Prefer an HttpOnly + Secure + SameSite cookie if compatible with the actual deployment/host model.

If cross-origin Kintone ↔ auth-service constraints prevent this, document the exact issue and recommend the safest feasible alternative.

Do NOT silently choose localStorage bearer tokens.

# STEP 5 — GOOGLE AUTHENTICATOR / TOTP READY DESIGN

Design Phase 2 without implementing it yet.

Use standards-based TOTP compatible with Google Authenticator.

Define:

```text
enrollment flow
QR provisioning URI generation
secret generation entropy
secret storage protection
enrollment confirmation using first TOTP
clock skew window
replay prevention strategy where practical
recovery codes strategy
MFA reset process
lost phone process
admin/HR authority boundary
MFA disable audit
```

Important:
- User wants this as Phase 2, not Phase 1 go-live requirement.
- Phase 1 schema/design should avoid future destructive migration where practical.
- Do not require employee email for TOTP.

# STEP 6 — APP794 INTEGRATION TRUST CONTRACT

Define exactly how App794 will consume authenticated identity later.

Required contract:

```text
App794 MUST NOT trust editable Employee_Code field as authentication.
Authenticated session returns exact Employee_Code.
App794 fetches App53 read-only employee snapshot using that exact Employee_Code.
Department / Section / Team derive from App53 snapshot.
Routing_Key derives from trusted snapshot.
App795 routing selection uses trusted Section/Team.
App796 scoring selection uses trusted employee/position profile context.
```

Define behavior when:

```text
Employee_Code not found in App53
employee inactive/terminated
credential account disabled
session expired
routing missing/duplicate
scoring config missing/duplicate
MFA required in future but not satisfied
```

All security-sensitive failures must fail closed.

# STEP 7 — WHERE SHOULD CREDENTIALS LIVE?

Compare at least 2 feasible credential storage approaches supported by the environment, for example:

```text
A. Dedicated Kintone credential/config app with strict creator/service-account ACL + server-side auth service
B. External auth database / managed server-side store
```

Do NOT assume Kintone alone can safely verify passwords from browser JavaScript.

For each option compare:

```text
security
operational complexity
cost
backup/recovery
secret exposure risk
integration complexity
MFA readiness
vendor lock-in
```

Recommend one architecture for this project.

If a new Kintone App is recommended for credential metadata, specify that creating it is a future separately-authorized write and explain whether password hashes/TOTP secrets should or should not be stored there.

# STEP 8 — THREAT MODEL

At minimum evaluate:

```text
Employee tries another Employee_Code
Employee knows another person's temporary password
brute force / credential stuffing
shared workstation left logged in
session token theft
XSS in Kintone customization
malicious query string/localStorage tampering
HR credential reset misuse
credential database compromise
TOTP seed compromise
replay of TOTP
shared Kintone account privileges
```

For each threat:

```text
attack path
impact
mitigation
residual risk
```

# STEP 9 — IMPLEMENTATION PACKAGE PLAN

Produce the smallest safe future implementation package after architecture approval.

Split into:

```text
M10C-AUTH Phase 1 Implementation
- server-side auth service
- credential store
- Employee Code + password login
- session
- App53 validation
- App794 trusted identity bridge
- audit/rate limit/lockout
- tests

M10D-MFA Phase 2 Future
- TOTP enrollment
- Google Authenticator-compatible MFA challenge
- recovery/reset flow
- MFA audit
```

For M10C-AUTH every proposed change must include:

```text
WHAT
WHERE exact existing/new component
HOW
WHY
EXPECTED IMPACT
RISK
TEST PLAN
ROLLBACK PLAN
KINTONE WRITE REQUIRED? YES/NO
EXTERNAL DEPLOY REQUIRED? YES/NO
USER AUTHORIZATION REQUIRED? YES/NO
```

Do not implement M10C in this task.

# STEP 10 — NO-ORPHAN / CODE GOVERNANCE

Respect project rule:

```text
modify existing implementation first
new file only for clear separation of concerns
no duplicate auth clients
no _old/_v1 copies
no dead password/PIN/OTP approach retained as active implementation
no plaintext secret fixtures
no committed secrets
```

Search repository for any prior insecure PIN/OTP/password prototypes and classify historical/current.
Do not delete anything unless clearly unused and safe; this task is plan-only.

# STEP 11 — TEST / GIT

Run:

```bash
npm test
git diff --check
git status --short
```

Required:

```text
KINTONE_WRITES_THIS_TASK = 0
EXTERNAL_DEPLOY_THIS_TASK = 0
npm test = PASS
git diff --check = PASS
NO_ORPHAN_ARTIFACT_GATE = PASS
local HEAD = origin/ai/antigravity-wp002c after push
```

Only update factual architecture/evidence/living docs.

# REQUIRED CONTROL-PLANE DECISION OUTPUT

At the end provide a concise decision block:

```text
M10B_SEC_ARCHITECTURE = COMPLETE / BLOCKED

PHASE1_AUTH = EMPLOYEE_CODE + PERSONAL_PASSWORD
PHASE2_MFA = GOOGLE_AUTHENTICATOR_COMPATIBLE_TOTP
APP53_PASSWORD_STORAGE = PROHIBITED
CLIENT_SIDE_PASSWORD_VERIFICATION = PROHIBITED
SERVER_SIDE_AUTH_REQUIRED = YES

TRUSTED_SERVER_COMPONENT_EXISTS = actual
RECOMMENDED_AUTH_SERVICE_HOST = exact option
RECOMMENDED_CREDENTIAL_STORE = exact option
RECOMMENDED_PASSWORD_HASH = exact algorithm
RECOMMENDED_SESSION_MODEL = exact model

INITIAL_PASSWORD_PROVISIONING = exact approach
PASSWORD_RESET = exact approach
ACCOUNT_LOCKOUT = exact approach

TOTP_SECRET_STORAGE = exact approach
MFA_RECOVERY = exact approach

SEC_DEP_001_STATUS_AFTER_DESIGN = OPEN_PENDING_IMPLEMENTATION / BLOCKED / OTHER
M10C_IMPLEMENTATION_SCOPE = exact smallest package
KINTONE_WRITES_REQUIRED_FOR_M10C = exact apps/actions or NONE
EXTERNAL_DEPLOY_REQUIRED_FOR_M10C = YES/NO
USER_AUTHORIZATION_REQUIRED_BEFORE_M10C = YES/NO

KINTONE_WRITES_THIS_TASK = 0
npm test = actual / PASS
GIT_DIFF_CHECK = PASS / FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS / BLOCKED
GIT_PUSH_SYNC = PASS / FAIL

NEXT_ACTION = CHATGPT REVIEW / USER ARCHITECTURE DECISION / M10C AUTHORIZATION
```

Update `CURRENT_STATE.md`, `HANDOFF.md`, `AI_REVIEW_PACKAGE.md`, `OPEN_ISSUES.md`, and security/architecture docs only when required to record this user decision and the resulting evidence.

Commit and push same branch, then STOP.

Do NOT implement login.
Do NOT deploy auth service.
Do NOT write Kintone.
Do NOT start TOTP enrollment.
