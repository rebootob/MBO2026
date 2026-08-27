# AI ACTIVE TASK — D1-C1 FINAL CONTRACT + FAIL-CLOSED CORRECTIVE ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation: `94e57d7e772d447eb5615bd0b08de11592f67627`
> Parent control: `21c579a524150a832a10651d30dfc22026481c6e`
> Mode: MINIMUM CORRECTIVE ONLY / NO UI / NO KINTONE WRITE OR DEPLOY

## 0. INDEPENDENT REVIEW RESULT

The D1-C1 implementation is NOT yet accepted. Scope was clean (only repository adapter + focused test), but two proven blockers remain and live preflight evidence is not present in Git evidence.

### B1 — Credential-store interface mismatch on real password change

`MboAuthSessionService.changePassword()` currently creates `updatedCredential` via `MboPasswordDomainService.changePassword()` and passes the WHOLE object into `credentialStore.updateCredential(empCode, updatedCredential)`.

The new App801 repository correctly rejects non-mutable/identity fields such as `Employee_Code` and other fields outside its allowlist.

Therefore the real App801-backed password-change flow would fail even though the local MemoryCredentialStore flow passes.

Required fix: preserve the accepted auth behavior, but pass ONLY the mutable credential lifecycle fields to `updateCredential()` after password change. Do not weaken the repository allowlist and do not make `Employee_Code` mutable.

### B2 — Security-state fields currently fail open

`getCredential()` currently defaults missing `Account_Status` to `ACTIVE` and treats missing/unknown force-change state as `false`.

That violates D1 fail-closed requirements.

Required fix: based on the EXACT live App801 schema/choice values already discovered (or re-read READ ONLY if needed):
- missing/unknown `Account_Status` => fail closed
- missing/unknown force-password-change value => fail closed
- failed-attempt counter field must be present and parse to a valid non-negative integer; malformed => fail closed
- returned `Employee_Code` must exactly equal the requested bound Employee_Code
- do not invent choice values; use exact live schema values

Do not broaden into a generic validation framework.

## 1. ALLOWED FILES ONLY

- `src/services/mbo-auth-session-service.js` — minimal B1 patch only
- `src/services/mbo-auth-kintone-repository.js` — minimal B2 patch only
- `tests/mbo-auth-kintone-repository.test.js` — focused regression/integration cases

No other source/UI files.

## 2. MINIMUM REQUIRED TESTS

Add only enough tests to prove:

1. App801-backed `changePassword()` succeeds with the accepted auth service contract and does not attempt to mutate `Employee_Code`/immutable fields.
2. missing/unknown Account Status fails closed.
3. missing/unknown force-change state fails closed.
4. malformed failed-attempt counter fails closed.
5. returned Employee_Code mismatch fails closed.
6. existing wrong-password persistence still works.

Run:

```bash
npm test -- tests/mbo-auth-kintone-repository.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js
npm test
git diff --check
git status --short
```

## 3. LIVE PREFLIGHT EVIDENCE — REQUIRED IN COMMIT MESSAGE BODY / REPORT

The current implementation commit does not contain verifiable Git evidence of the required READ-ONLY preflight. Do NOT create a new evidence framework/file.

In the corrective commit message body (and Antigravity completion report), include the exact previously observed values. If they were not retained, re-run ONLY the same authorized Kintone GETs.

Required:

```text
APP801_SCHEMA_FIELDS = exact relevant field codes + types/choice values
APP801_DIRECT_EMPLOYEE_BROWSER_ACCESS = DENIED | NOT_PROVEN | UNSAFE
APP801_RECORD_COUNT = N
EMPLOYEE_CODE_UNIQUE = YES | NO | NOT_PROVEN
KINTONE_USER_BINDING_UNIQUE = YES | NO | NOT_PROVEN
DIRECT_URL_CROSS_EMPLOYEE_ISOLATION = PROVEN | NOT_PROVEN | UNSAFE
DIRECT_REST_CROSS_EMPLOYEE_ISOLATION = PROVEN | NOT_PROVEN | UNSAFE
SESSION_STORE_PERSISTENCE = SUPPORTED_BY_EXISTING_SCHEMA | BACKEND_REQUIRED
KINTONE_READS_EXECUTED = N
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
```

Never include Password_Hash, MFA secret, raw/full credential records, API tokens, or session tokens in commit/report.

## 4. OUT OF SCOPE

- no App801 live write/provisioning
- no App801/App794 ACL change
- no schema/process/deploy
- no session persistence implementation yet
- no Login UI changes
- no MFA/TOTP
- no D2-D7 implementation
- no unrelated refactor

## 5. TARGET STATUS

Antigravity maximum status:

`D1C1_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

D1 overall remains `IN_PROGRESS`.

If live preflight proves unsafe direct App794 access or ambiguous identity binding, report it exactly; do not bypass it.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT ACCESS CHECK RESIDUAL / D1-C1 CORRECTIVE
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
