# AI ACTIVE TASK — D1-A FINAL SESSION REVOCATION BLOCKER ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `0bd2c1111aa6ce2375ca2170661d67138d9772c5`
> Mode: ONE SECURITY BLOCKER ONLY / MINIMUM FIX
> Kintone write/deploy/schema/process/ACL authorization: NONE

## 0. REVIEW RESULT

D1-A B1 and B2 are accepted from source review:
- credentialStore now requires `getCredential()` + `updateCredential()` and fails closed otherwise
- failed-login threshold persists count + `Locked_Until`
- expired/missing/invalid `expiresAt` fails closed
- malformed session flags fail closed
- force-change and normal self-change state separation is correct

Do NOT change those areas again unless required by the blocker below.

One FINAL D1-A blocker remains from the ORIGINAL D1-A acceptance requirement: session revocation must be real, not optional.

Target implementer result:

`D1A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do NOT self-certify D1 or D1-A PASS.

---

## ONLY BLOCKER — SESSION REVOCATION MUST FAIL CLOSED

Allowed files only:
- `src/services/mbo-auth-session-service.js`
- `tests/mbo-auth-session-service.test.js`

Current unsafe behavior:

1. `changePassword()` currently does:

```js
if (typeof this.sessionStore.deleteSession === 'function') {
  await this.sessionStore.deleteSession(oldTokenHash);
}
```

So password change can succeed and a new token can be issued even when the old token cannot actually be revoked.

2. `logout()` currently returns:

```text
LOGGED_OUT
```

even when `sessionStore.deleteSession()` does not exist, meaning the old token may remain active.

This violates the original D1-A requirement that password change rotates/revokes the old session and logout invalidates the session token.

### Required minimum fix

- A session store used for authenticated session lifecycle must provide the capabilities needed by each operation; do not silently skip revocation.
- `changePassword()` must fail closed if the old session cannot be revoked.
- Do not mutate the password credential and then falsely report success if session revocation is unavailable.
- Prefer a safe order where inability to revoke the old session is detected before credential mutation/new-session issuance.
- After successful password change:
  - old token MUST resolve to no authenticated principal
  - new token MUST resolve to the same trusted employee principal
- `logout()` must not report successful logout when revocation capability is unavailable/fails. Return/throw a clear fail-closed result/error.
- Successful logout MUST make the old token unusable.
- Keep raw session tokens out of the session store; keep existing token-hash behavior.
- Do not add a database, HTTP server, framework, App801 adapter, UI, or Kintone integration.

### Minimum tests only

Add only focused tests proving:

1. sessionStore without `deleteSession()` => `changePassword()` fails closed BEFORE successful credential/session rotation.
2. successful password change => old token no longer produces a principal; new token does.
3. sessionStore without `deleteSession()` => logout does NOT falsely return successful `LOGGED_OUT`.
4. successful logout => old token no longer produces a principal.

Keep all existing D1-A, password-domain, identity tests passing.

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

Once this blocker passes independent review, the NEXT package will be **D1-B Minimal Login UI Preview for user manual UAT**.

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

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A FINAL SESSION REVOCATION BLOCKER
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
