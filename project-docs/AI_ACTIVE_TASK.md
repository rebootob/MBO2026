# AI ACTIVE TASK — D1-A FINAL LOGIN REVOCATION-CAPABILITY GATE ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `a5c565d0eebae4f531b5676607f8a28c347b3686`
> Mode: ONE SECURITY GATE ONLY / MINIMUM FIX
> Kintone write/deploy/schema/process/ACL authorization: NONE

## 0. REVIEW RESULT

The previous session-revocation corrective is substantially accepted:
- `changePassword()` now requires `getSession()` + `setSession()` + `deleteSession()`
- old token is revoked before credential mutation/new token issuance
- successful password change proves old token unusable and new token valid
- `logout()` fails closed when `deleteSession()` is missing
- successful logout invalidates the token

Do NOT change those areas again unless required by the single blocker below.

One final D1-A security gate remains:

`login()` still issues a force-change or normal authenticated session when the injected `sessionStore` has `setSession()` but does NOT have `deleteSession()`.

That creates a session that cannot later be reliably revoked/logout-terminated. A trusted session boundary must not mint non-revocable sessions.

Target implementer result:

`D1A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do NOT self-certify D1 or D1-A PASS.

---

## ONLY REQUIRED FIX — LOGIN MUST REQUIRE A REVOCABLE SESSION STORE BEFORE ISSUING ANY SESSION

Allowed files only:
- `src/services/mbo-auth-session-service.js`
- `tests/mbo-auth-session-service.test.js`

### Current issue

Before issuing either:
- `PASSWORD_CHANGE_REQUIRED` restricted session, or
- `AUTHENTICATED_SUCCESS` normal session,

`login()` currently validates only that `sessionStore.setSession()` exists.

### Required minimum fix

Before creating/storing/returning any session token, `login()` must fail closed unless the session store provides the full lifecycle capability needed for a trusted session:

```text
getSession()
setSession()
deleteSession()
```

Do not issue a raw session token if revocation capability is absent.

Do not change token generation, token hashing, password logic, identity logic, lockout logic, expiry logic, or session state semantics.

### Minimum focused tests

Add only what is necessary to prove:

1. sessionStore with `setSession()` but without `deleteSession()` => initial/default-password login does NOT issue `PASSWORD_CHANGE_REQUIRED` token and fails closed with clear session-store configuration error.
2. sessionStore with `setSession()` but without `deleteSession()` => normal authenticated login does NOT issue an authenticated token and fails closed.
3. valid full sessionStore => existing force-change and normal login paths still work.

No new frameworks or architecture.

---

## DO NOT EXPAND SCOPE

Do NOT:
- build Login UI in this commit
- build HTTP endpoints/server
- implement App801 GET/WRITE
- change Kintone ACL/schema/process
- deploy anything
- work on direct URL/API integration
- change password hashing algorithm
- invent password complexity policy
- touch D2-D7
- refactor unrelated auth code

Once this gate passes independent review, D1-A is CLOSED and the NEXT package is **D1-B Minimal Login UI Preview for user manual UAT**.

## VERIFICATION

Run only:

```bash
npm test -- tests/mbo-auth-session-service.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js
npm test
git diff --check
git status --short
```

Report:
- exact implementation commit SHA
- exact files changed
- targeted/full test results
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D1A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`
- `D1_OVERALL_STATUS = BLOCKED_RUNTIME_INTEGRATION`

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A FINAL LOGIN REVOCATION-CAPABILITY GATE
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
