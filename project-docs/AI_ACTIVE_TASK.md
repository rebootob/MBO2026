# AI ACTIVE TASK — D1-C1 APP801 TRUSTED RUNTIME PREFLIGHT + CREDENTIAL REPOSITORY ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Base HEAD before this control: `44ad6aa41517d2523d8a6f58c01d8179898c0acc`
> D1-A status: CLOSED / SOURCE + SECURITY BOUNDARY ACCEPTED
> D1-B source status: ACCEPTED
> D1-B user UAT evidence already observed: bootstrap force-change PASS, default-password reuse BLOCK PASS, wrong-password/lockout PASS, changed-password login PASS, logout PASS
> D1-B residual evidence: Access Check `0118 -> 0118 ALLOW` and `0118 -> 0119 BLOCK` still pending, but MUST NOT block D1-C1 implementation work
> Mode: FASTEST SAFE PATH / NO UI POLISH / NO KINTONE WRITE OR DEPLOY

## 0. GOAL

Move D1 from local fixture authentication toward the real Kintone sandbox runtime without reopening accepted password/session logic.

This package has only two purposes:

1. Perform a tightly scoped READ-ONLY preflight of App801/App794 security/runtime facts.
2. If the existing App801 schema already supports the accepted credential domain contract, implement ONE server-only App801 credential repository adapter with focused tests.

Do NOT attempt production deployment in this package.
Do NOT invent missing App801 fields.
Do NOT weaken security to make the package pass.

Target result:

`D1C1_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

or, if live evidence proves a blocker:

`D1C1_STATUS = BLOCKED_WITH_EXACT_EVIDENCE`

D1 overall MUST remain `IN_PROGRESS`.

---

## 1. READ-ONLY KINTONE PREFLIGHT — ALLOWED

Kintone GETs are authorized ONLY for this preflight. Kintone writes/deploy/schema/process/ACL changes remain ZERO.

### 1.1 App801 — Credential Store

Inspect READ ONLY:
- form field schema for App801
- app/record ACL needed to confirm employee browser direct access is denied
- record count
- only the minimum NON-SECRET identity/status fields necessary to assess uniqueness/readiness, e.g. `Employee_Code`, `Kintone_User_Code`, `Account_Status`, `Must_Change_Password`

Do NOT print/log/export:
- `Password_Hash`
- MFA secret/TOTP seed
- session token/hash
- full credential records

Required truth checks:

```text
APP801_SCHEMA_FIELDS = exact field codes/types actually present
APP801_DIRECT_EMPLOYEE_BROWSER_ACCESS = DENIED | NOT_PROVEN | UNSAFE
APP801_RECORD_COUNT = actual count
EMPLOYEE_CODE_UNIQUE = YES | NO | NOT_PROVEN
KINTONE_USER_BINDING_UNIQUE = YES | NO | NOT_PROVEN
```

If one Kintone principal maps ambiguously to multiple Employee Codes, fail closed and report `IDENTITY_BINDING_BLOCKER`. Do NOT bypass this by trusting typed Employee_Code.

### 1.2 App794 — Direct Access Security Reality

Inspect READ ONLY:
- App794 app ACL / record ACL / security configuration relevant to direct record access

Determine only:

```text
DIRECT_URL_CROSS_EMPLOYEE_ISOLATION = PROVEN | NOT_PROVEN | UNSAFE
DIRECT_REST_CROSS_EMPLOYEE_ISOLATION = PROVEN | NOT_PROVEN | UNSAFE
```

Do NOT modify ACL in this package.
If current Kintone permissions would allow a shared/general account to directly open/query another employee record, report the exact blocker. Do NOT call client-side hiding a security boundary.

### 1.3 App53 — only if necessary

App53 remains permanently READ ONLY.
A minimal GET of non-secret identity binding fields is allowed only if required to verify App801/Kintone principal mapping. No broad employee dump.

### Mandatory counters

```text
KINTONE_READS_EXECUTED = exact number
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
```

---

## 2. IMPLEMENT ONLY IF APP801 EXISTING SCHEMA SUPPORTS IT

Preferred new file:
- `src/services/mbo-auth-kintone-repository.js`

Focused test file:
- `tests/mbo-auth-kintone-repository.test.js`

Do not add a framework.
Do not modify `mbo-password-service.js`, `mbo-identity-service.js`, or `mbo-auth-session-service.js` unless an actual interface incompatibility is proven first; report before expanding scope.

### 2.1 Credential repository contract

Implement a SERVER-ONLY adapter compatible with the already accepted `MboAuthSessionService` credentialStore contract:

```text
getCredential(employeeCode)
updateCredential(employeeCode, patch)
```

Required behavior:
- exact `Employee_Code` lookup
- zero records => fail closed / credential not found
- >1 record => fail closed duplicate identity
- returned credential object contains only fields needed by the auth domain
- browser must never receive this repository or `Password_Hash`
- `updateCredential` uses a strict allowlist only; no arbitrary field passthrough
- immutable identity fields such as `Employee_Code` must not be silently rewritten
- no secrets in logs/errors
- dependency-injected Kintone transport/client so unit tests do not call live Kintone

Minimum mutable allowlist should be derived from the EXISTING verified App801 schema and the accepted password lifecycle, expected examples:

```text
Password_Hash
Must_Change_Password
Password_Changed_At
Password_Expires_At
Failed_Login_Count
Locked_Until
Account_Status
```

Do not invent names if live schema differs. Map exact existing field codes.

### 2.2 No live mutation in this package

The adapter may contain code paths for future server-side UPDATE because the auth service requires persistence, but Antigravity MUST NOT execute any live App801 update/POST/PUT/DELETE in this task.

Actual App801 credential provisioning/password-change/failed-count writes require a later exact write package + explicit authorization.

### 2.3 Session persistence

Do NOT invent a session store schema.

During App801 schema preflight determine whether exact existing fields already support the accepted sessionStore lifecycle:

```text
getSession(tokenHash)
setSession(tokenHash, session)
deleteSession(tokenHash)
```

If yes, report exact supporting fields and propose the smallest next adapter package; do not expand this commit unless trivially inseparable.

If no, report:

`SESSION_STORE_PERSISTENCE = BACKEND_REQUIRED`

Do not store raw session token in Kintone.

---

## 3. SECURITY INVARIANTS — RELEASE BLOCKERS

Must remain true:
- Employee_Code alone is not proof of identity
- technical admin `admin-form` cannot become Employee Self
- Password_Hash never enters employee browser JS/HTML/JSON
- raw session token never stored in browser localStorage/sessionStorage or Kintone
- browser code must not hold App801 privileged credentials/API token
- client-side field hiding is not an authorization boundary
- direct URL/API access must eventually be blocked at native ACL or trusted server boundary
- shared/ambiguous Kintone principal mapping fails closed

Do not claim D1 production-secure from repository unit tests alone.

---

## 4. MINIMUM TESTS

For the new repository adapter only, prove at minimum:

1. exact Employee_Code returns one sanitized server credential domain object
2. zero records => not found/fail closed
3. duplicate Employee_Code => fail closed
4. update uses strict field allowlist
5. unknown/identity-field mutation rejected
6. malformed/missing required App801 field => fail closed
7. transport errors fail closed and do not expose secrets
8. no live Kintone call in unit tests

Run:

```bash
npm test -- tests/mbo-auth-kintone-repository.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js
npm test
git diff --check
git status --short
```

Do not spend time on unrelated failures unless caused by this package.

---

## 5. OUT OF SCOPE — DO NOT EXPAND

- no Login UI changes
- no further bilingual/cosmetic work
- no App801 schema change
- no App801 live credential writes
- no App794 ACL change yet
- no Kintone deploy
- no migration/export/HR dashboard/copy work
- no D2-D7 implementation in this commit
- no TOTP/MFA implementation
- no generic backend framework/refactor

---

## 6. DELIVERY REPORT

Report exactly:
- implementation commit SHA
- files changed
- App801 exact field codes/types relevant to credential/session auth
- App801 record count
- App801 employee browser ACL result
- identity uniqueness result
- App794 direct URL/REST isolation reality
- whether credential repository adapter was implemented YES/NO
- whether persistent sessionStore is supported by existing App801 schema YES/NO
- targeted/full test results
- `KINTONE_READS_EXECUTED = N`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D1A_STATUS = CLOSED`
- `D1B_STATUS = SOURCE_ACCEPTED / USER_UAT_ACCESS_CHECK_EVIDENCE_PENDING`
- `D1C1_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW | BLOCKED_WITH_EXACT_EVIDENCE`
- `D1_OVERALL_STATUS = IN_PROGRESS`

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT RESIDUAL / D1-C1 THIS TASK
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
