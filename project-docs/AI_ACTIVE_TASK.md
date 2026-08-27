# AI ACTIVE TASK — D1-C3A FIRST-LOGIN ACTIVATION + APP801 SESSION RUNTIME ADAPTER

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Base HEAD before this control: `fce7088894a3a16f592e1ebe818a16edadcaa1e1`
> Mode: MINIMUM SERVER-SIDE IMPLEMENTATION / NO LIVE KINTONE WRITE / NO DEPLOY / NO UI POLISH

## 0. USER DECISION — FROZEN FOR D1

User accepted the requirement for a secure first-login identity proof under the shared Kintone account model.

Use this approved design:

```text
MBO Username = Employee_Code
Initial MBO Password = Employee_Code
First/default bootstrap login ALSO requires one-time HR Activation Code
Activation Code is random and not derived from Employee_Code
Activation Code is one-time and expires
After successful activation + forced password change, normal login uses the new password and does not require activation again
```

This is first-login identity proof only, not recurring MFA.

Do NOT weaken/remove this requirement later merely to simplify implementation.

## 1. VERIFIED CONTEXT — DO NOT REDISCOVER

Accepted evidence already proves:

```text
APP801_PASSWORD_EXPIRES_FIELD = ABSENT
APP801_KINTONE_USER_CODE_FIELD = ABSENT
APP801_ACL = CREATOR full access; GROUP everyone deny all
APP801_SINGLE_SESSION_MODEL = FEASIBLE
APP794_APP_ACL = CREATOR full access; GROUP everyone view/add/edit/delete
APP794_RECORD_ACL = NONE
NATIVE_ACL_CAN_DISTINGUISH_0118_0119 = NO
IDENTITY_BINDING_SOURCE = NOT_AVAILABLE
TRUSTED_BACKEND_RUNTIME = NOT_AVAILABLE
```

D1-A auth/session core source boundary is accepted.
D1-C1 App801 credential repository source is accepted.
D1-C2A hard LOCKED behavior is accepted.
D1-C2B evidence package is accepted.

Do NOT spend time re-reading Kintone ACL/schema in this package unless a source implementation detail truly cannot be resolved from the frozen facts above.

## 2. GOAL

Prepare the trusted server-side auth runtime contract so the remaining D1 work can move to one controlled Kintone schema/write/deployment package.

Implement ONLY:

1. one-time Activation Code domain logic;
2. bootstrap-login integration with the accepted `MboAuthSessionService`;
3. App801 single-active-session adapter compatible with the accepted `sessionStore` contract;
4. App801 activation-field mapping needed by the server-side repository/runtime;
5. focused tests proving the above without any live Kintone mutation.

No App794 data gateway yet in this commit.
No hosting/deployment framework in this commit.

Target:

`D1C3A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

D1 overall remains `IN_PROGRESS`.

## 3. ALLOWED FILES — KEEP SMALL

Preferred maximum source scope:

- NEW `src/services/mbo-activation-service.js`
- `src/services/mbo-auth-session-service.js` — minimal bootstrap integration only
- `src/services/mbo-auth-kintone-repository.js` — add activation mapping + single-session store class/adapter only
- NEW `tests/mbo-activation-service.test.js`
- `tests/mbo-auth-session-service.test.js`
- `tests/mbo-auth-kintone-repository.test.js`

Do not create a generic framework.
Do not touch UI files.
Do not touch D2-D7 source.

## 4. ACTIVATION DOMAIN — REQUIRED

### 4.1 Secret handling

Activation Code requirements:
- generated with cryptographically secure randomness;
- plaintext code is returned ONLY at issuance time to the trusted HR operation caller;
- persistent storage uses `Activation_Code_Hash` only;
- never log plaintext activation code;
- never return hash to employee browser;
- use constant-time comparison where applicable;
- one-time use;
- expiry required and fail closed if missing/invalid/expired;
- already-used activation fails closed.

Preferred domain API shape (names may vary minimally):

```text
generateActivation({ employeeCode, now, ttlHours })
verifyActivation({ activationRecord, inputCode, now })
```

Generated persisted metadata should conceptually contain:

```text
Activation_Code_Hash
Activation_Expires_At
Activation_Used_At = null
```

Do not add MFA/TOTP.

## 5. AUTH SESSION INTEGRATION — MINIMAL

Modify bootstrap/default-password login only.

Required order:

```text
1. trusted credential lookup
2. verify Employee_Code bootstrap password server-side
3. if bootstrap/default/force-change state -> require Activation Code proof
4. invalid/missing/expired/used Activation Code -> NO session issued
5. valid Activation Code -> mark activation used through trusted store
6. only then issue restricted password-change session
7. after successful password change -> normal authorized session
8. later normal login with changed password -> no Activation Code required
```

The server must not accept Activation Code as a substitute for password verification.

Accepted normal login/change-password/logout/session-revocation behavior must remain unchanged.

Technical admin `admin-form` still cannot become employee-self.

### Required store contract

Use a narrow trusted dependency such as:

```text
activationStore.getActivation(employeeCode)
activationStore.consumeActivation(employeeCode, usedAt)
```

or equivalent methods on the App801 repository. Missing store capability must fail closed whenever activation is required.

## 6. APP801 PLANNED FIELD CONTRACT — CODE READY, NO LIVE WRITE

Existing field still missing live:
- `Password_Expires_At` — DATETIME

Activation fields approved for the planned schema package:
- `Activation_Code_Hash` — SINGLE_LINE_TEXT
- `Activation_Expires_At` — DATETIME
- `Activation_Used_At` — DATETIME

Session fields already frozen for single-active-session-per-employee:
- `Session_Token_Hash` — SINGLE_LINE_TEXT
- `Session_Expires_At` — DATETIME
- `Session_Requires_Password_Change` — DROP_DOWN `YES|NO`
- `Session_Data_Authorized` — DROP_DOWN `YES|NO`
- `Session_Kintone_User_Code` — SINGLE_LINE_TEXT

Do NOT add a credential-level `Kintone_User_Code` identity field. The current shared-account model cannot use it as unique employee proof.

### 6.1 App801 sessionStore adapter

Implement server-only methods compatible with accepted auth core:

```text
getSession(tokenHash)
setSession(tokenHash, sessionObj)
deleteSession(tokenHash)
```

Rules:
- token hash only; raw token never persisted;
- single active session per Employee_Code;
- `setSession` locates exactly one employee credential record and overwrites only the approved session fields;
- `getSession` requires exact token-hash match and reconstructs the accepted session domain object;
- `deleteSession` clears session fields only after exact token-hash match;
- zero match for lookup => null where appropriate;
- duplicates => fail closed;
- malformed flags/expiry => fail closed;
- no arbitrary Kintone field passthrough;
- dependency-injected transport for tests;
- unit tests MUST NOT call live Kintone.

## 7. MINIMUM TESTS

Activation tests:
1. secure issuance returns plaintext once + stored hash metadata
2. valid activation verifies
3. wrong activation denied
4. expired activation denied
5. already-used activation denied
6. malformed activation state denied

Auth integration tests:
7. bootstrap password with no activation -> denied/no session
8. bootstrap password + wrong activation -> denied/no session
9. bootstrap password + valid activation -> restricted `PASSWORD_CHANGE_REQUIRED` session
10. activation is consumed once
11. replay of same activation denied
12. after forced password change, normal login with new password does not require activation

App801 session adapter tests:
13. set/get stores token hash only and reconstructs exact session state
14. delete invalidates old token hash
15. duplicate/malformed session record fails closed
16. no raw session token in Kintone payload

Keep existing auth/password/identity/repository tests passing.

Run:

```bash
npm test -- tests/mbo-activation-service.test.js
npm test -- tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js tests/mbo-activation-service.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js tests/mbo-activation-service.test.js
npm test
git diff --check
git status --short
```

## 8. ABSOLUTE OUT OF SCOPE

- NO live App801/App794 write
- NO App801 schema change
- NO App794 ACL change
- NO Kintone deploy
- NO gateway hosting/deployment framework
- NO UI changes
- NO MFA/TOTP
- NO HR App800 activation screen yet
- NO App794 employee-data gateway yet
- NO D2-D7 implementation
- NO unrelated refactor/docs cleanup

Mandatory counters:

```text
KINTONE_READS_EXECUTED = 0 unless truly required
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
```

## 9. DELIVERY REPORT

Report:
- exact implementation commit SHA
- files changed
- activation API/contract implemented
- bootstrap login activation behavior
- App801 sessionStore adapter implemented YES/NO
- targeted/full test results
- `KINTONE_READS_EXECUTED = N`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D1C3A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`
- `D1_OVERALL_STATUS = IN_PROGRESS`

After independent review passes, the next package will be D1-C3B: employee-self App794 trusted data gateway + exact one-time Kintone schema/write/deployment authorization package.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT ACCESS CHECK RESIDUAL / D1-C1 SOURCE ACCEPTED / D1-C2 EVIDENCE ACCEPTED / D1-C3A THIS TASK
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
