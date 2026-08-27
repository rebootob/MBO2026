# AI ACTIVE TASK — D1-A MINIMAL SECURITY CORRECTIVE ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `a66b94a997ee4883c717fb8f39bb293330521bde`
> Mode: TWO SECURITY BLOCKERS ONLY / MINIMUM FIX
> Kintone write/deploy/schema/process/ACL authorization: NONE

## 0. REVIEW RESULT

D1-A architecture is substantially accepted. Do NOT rewrite it.

Accepted:
- Node/server-only auth core using `node:crypto`
- reuse of `MboPasswordDomainService` and `MboIdentityService`
- random opaque session token + server-side token hash
- force-change session is not authorized for MBO data
- sanitized client result does not expose `Password_Hash`
- session principal is used for Employee A/B authorization
- logout/revoke exists

Independent review found ONLY TWO remaining security blockers. Fix only these blockers and their focused tests.

Target implementer result remains:

`D1A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do NOT self-certify D1 or D1-A PASS.

---

## B1 — CREDENTIAL LOCKOUT PERSISTENCE MUST FAIL CLOSED

Files allowed:
- `src/services/mbo-auth-session-service.js`
- `tests/mbo-auth-session-service.test.js`

Current issue:
`login()` treats `credentialStore.updateCredential` as optional. If the adapter exposes `getCredential` but not `updateCredential`, invalid-password attempts can continue without persisting `Failed_Login_Count` / `Locked_Until`.

Required minimum fix:
- The trusted credential adapter used by login must provide BOTH `getCredential()` and `updateCredential()`.
- If required write capability is absent, fail closed with a configuration error; do not authenticate normally and do not silently skip failed-attempt persistence.
- Wrong-password threshold must persist both final failed count and `Locked_Until`.
- Do not add a database or App801 adapter in this task.

Minimum tests:
1. missing `updateCredential` => fail closed / configuration error.
2. credential at failed-count 4 + wrong password => count 5 and non-null `Locked_Until` are actually persisted.

---

## B2 — PASSWORD CHANGE MUST REJECT EXPIRED OR MALFORMED SESSION STATE

Current issue:
`changePassword()` reads a session from the store but does not validate session expiry before changing the credential. It also treats any session that is not exactly a normal authorized session as effectively force-change, which can allow malformed session state to bypass current-password proof.

Required minimum fix:
- Before any password change, require a valid unexpired server session.
- `expiresAt` must be present, parseable, and strictly in the future; missing/invalid/expired => reject.
- Accept only one of these exact trusted states:
  - force-change: `requiresPasswordChange === true` AND `isDataAuthorized === false`
  - normal self-change: `requiresPasswordChange === false` AND `isDataAuthorized === true`
- Any other flag combination => fail closed.
- Normal self-change still requires valid current password.
- Force-change may set the new password without re-entering current password because the bootstrap password was already verified when that restricted session was issued.
- New password must still not equal Employee_Code.
- Keep old-session revoke/new-session rotation behavior.
- Also make `getAuthenticatedPrincipal()` fail closed if session `expiresAt` is missing or invalid; an indefinite/malformed session must never become an authenticated principal.

Minimum tests:
3. expired force-change session cannot change password.
4. expired normal session cannot change password.
5. malformed session flags cannot change password without current-password proof.
6. missing/invalid `expiresAt` cannot produce authenticated principal.
7. valid force-change and valid normal password-change paths still pass.

---

## DO NOT EXPAND SCOPE

Do NOT:
- build Login UI
- build HTTP endpoints/server
- implement App801 GET/WRITE
- change Kintone ACL/schema/process
- deploy anything
- work on direct URL/API integration yet
- change password hashing algorithm
- invent password complexity policy
- touch D2-D7
- refactor unrelated auth code

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

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A TWO SECURITY BLOCKERS THIS TASK
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
