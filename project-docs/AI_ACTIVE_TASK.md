# AI ACTIVE TASK — D1-A TRUSTED AUTH / SESSION BOUNDARY ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Current branch HEAD before this control update: `6d3d279c398d3db9a9c24b6e8c92b33938e5c7af`
> Mode: MINIMUM SECURITY BOUNDARY ONLY / REUSE EXISTING DOMAIN LOGIC
> Kintone write/deploy/schema/process/ACL authorization: NONE

## 0. CONTROL RESULT / WHY THIS IS NEXT

D7 Admin Support Center is CLOSED by independent source review + user manual UI smoke evidence:
- Admin Support Center renders.
- Tabs System Health / Employee Check / Workflow & Route Trace / Repair Candidate render.
- Controlled Repair remains intentionally disabled.
- Normal input preview still renders.
- Previous `node:crypto` browser crash and Admin helper runtime error are resolved.

Do NOT work on D7 further unless a new defect is evidenced.

Next mandatory job = D1 Login + Password Change + Strict Employee Data Isolation.

Existing code already provides important D1 domain pieces:
- `src/services/mbo-password-service.js`
  - PBKDF2 server-side hashing using `node:crypto`
  - initial password = Employee_Code
  - Must_Change_Password
  - failed-attempt / lockout evaluation
  - password change
  - HR reset
- `src/services/mbo-identity-service.js`
  - Kintone user -> Employee_Code binding logic
  - MBO username must equal bound Employee_Code
  - Employee A cannot access Employee B
  - technical admin cannot perform employee-self business operations

DO NOT rewrite those subsystems.

The current D1 blocker is the missing TRUSTED SERVER AUTH/SESSION BOUNDARY. Today the domain services can be called with caller-supplied credential/user objects; that is not a production security boundary.

This task is ONLY D1-A. Do not attempt to close all of D1 in one package.

Target implementer result:

`D1A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

D1 overall remains blocked until runtime/backend integration and direct-access isolation are independently proven.

---

## 1. ONLY REQUIRED IMPLEMENTATION — SERVER-SIDE AUTH + SESSION CORE

Primary goal:

```text
Kintone authenticated principal
  -> trusted server auth service
  -> verified Employee_Code binding
  -> server-side password verification
  -> opaque authenticated MBO session
  -> session-bound Employee_Code used for authorization
```

### Reuse
Reuse without duplicating business rules:
- `MboPasswordDomainService`
- `MboIdentityService`

### Minimum new code allowed
Prefer ONE new server-only service module, for example:
- `src/services/mbo-auth-session-service.js`

and ONE focused test file if needed:
- `tests/mbo-auth-session-service.test.js`

Do not add frameworks, databases, HTTP servers, UI screens, or extra architectural files in this package.

### Required service contract
Implement the smallest server-side/Node-only authentication/session service that:

1. Accepts trusted dependencies/adapters rather than browser-provided credential records:
   - `credentialStore`
   - `sessionStore`
   - existing identity mapping source/provider as an injected trusted dependency
2. Login accepts only necessary input such as:
   - trusted `kintoneUserCode`
   - MBO username
   - MBO password
3. Resolves/binds identity using existing `MboIdentityService` rules.
4. Loads the credential record server-side from the credential store.
5. Verifies password server-side using `MboPasswordDomainService`.
6. Persists failed-login count / lock state through the credential store when login fails.
7. On valid default/first login:
   - create only a restricted password-change session/state
   - MUST NOT authorize MBO data access yet.
8. On valid normal login:
   - create an opaque random session token using Node crypto.
   - session principal is bound to one `Employee_Code`.
   - session store should not need plaintext password or `Password_Hash`.
   - avoid storing raw session token if a token hash can be stored with minimal code.
9. Client-facing results MUST be sanitized:
   - never include `Password_Hash`
   - never include credential record
   - never include password/salt/hash internals
10. Provide a minimal `getAuthenticatedPrincipal(sessionToken)` / equivalent that returns the trusted server-side principal used by authorization code.
11. Provide minimal own-password change through the trusted session boundary:
   - force-change session may set a new password after the initial/default password was already verified.
   - normal self-change must require proof of current password server-side before changing.
   - new password must not be identical to Employee_Code/default password.
   - after password change, revoke/rotate the old session and require/use a clean authenticated session according to the smallest safe design.
12. Provide logout/revoke for the session token.

Do not invent password complexity requirements that the user has not approved. Only enforce the existing domain requirements plus `new password != Employee_Code` so forced change cannot keep the bootstrap default.

---

## 2. SECURITY BOUNDARIES — MUST NOT BE WEAKENED

- Browser JavaScript must never receive/read App801 `Password_Hash`.
- Do not import this Node-only auth service into browser UI bundles.
- Do not move `node:crypto` password verification into browser code.
- Employee_Code alone is never authentication proof.
- A browser-supplied `employeeCode`, `role`, or `authenticatedUser` object is not trusted identity.
- The trusted Employee_Code for employee-self operations must come from the authenticated server session principal.
- `admin-form` remains Technical Admin with 0 employee-self business authority.
- App801 is credential/auth metadata storage; direct employee browser access remains prohibited.
- No actual App801 schema/read/write adapter is authorized in this package.
- No Kintone ACL/schema/process/deploy change.

---

## 3. MINIMUM REQUIRED TESTS

Do not create a new test framework. Use Node test and simple in-memory fake stores inside the test file.

At minimum prove:

1. valid trusted Kintone binding + initial username/password -> `PASSWORD_CHANGE_REQUIRED` session/state.
2. password-change-required session cannot obtain an authorized MBO data principal.
3. username not equal to bound Employee_Code -> DENY.
4. wrong password -> DENY and failed count is persisted.
5. lockout result is persisted/fails closed.
6. successful normal login returns an opaque session and sanitized client result with NO `Password_Hash`.
7. session principal is bound to Employee A; using that principal to authorize Employee B is denied by existing identity service.
8. force-change sets a non-default new password; default Employee_Code password is rejected as the new password.
9. after successful password change, old password no longer authenticates; new password does.
10. normal own-password change requires current password proof.
11. logout/revoke invalidates session.
12. technical admin cannot become an employee-self principal through this service.

Keep existing password-domain and identity-service tests passing.

---

## 4. EXPLICITLY OUT OF SCOPE FOR D1-A

Do NOT do any of the following in this package:
- no Login UI yet
- no Kintone App801 GET/WRITE implementation
- no production HTTP endpoint/server deployment
- no reverse proxy
- no App794 ACL changes
- no direct URL/API isolation integration yet
- no D2 export work
- no D3 migration work
- no D4 HR account UI
- no D5 copy-MBO work
- no D6 final E2E
- no D7 changes

These are later steps after this trusted core is independently reviewed.

---

## 5. VERIFICATION

Run only necessary verification:

```bash
npm test -- tests/mbo-auth-session-service.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js
npm test
git diff --check
git status --short
```

No `ui:build` is required unless you accidentally touch browser code (you should not).

---

## 6. DELIVERY

Commit only D1-A minimal implementation.

Report:
- exact commit SHA
- exact files changed
- whether existing password/identity files were changed and why
- targeted tests
- full npm test
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D1A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`
- `D1_OVERALL_STATUS = BLOCKED_RUNTIME_INTEGRATION`

Do NOT self-certify D1 PASS.
Do NOT modify Confirmed Baseline.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A TRUSTED SESSION BOUNDARY THIS TASK
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED — independent source + user manual UI smoke evidence
