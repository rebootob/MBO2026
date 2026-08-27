# AI ACTIVE TASK — D1-C3A FINAL CORRECTIVE: SHARED-ACCOUNT IDENTITY + MANDATORY ACTIVATION

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation: `ce60e3232965249b22099aba2ae72b17dde162da`
> Mode: MINIMUM SECURITY CORRECTIVE ONLY / NO KINTONE WRITE / NO DEPLOY / NO UI

## 0. INDEPENDENT REVIEW RESULT

Accepted from `ce60e323...`:
- scope is limited to auth/session/activation source + focused tests;
- no live Kintone read/write/deploy was executed;
- activation hashing/expiry/used-state verification exists;
- App801 single-active-session adapter structure exists and persists token hash only.

D1-C3A is NOT accepted yet because three security/runtime blockers remain.

## 1. B1 — CURRENT LOGIN STILL REQUIRES IMPOSSIBLE 1:1 KINTONE BINDING

Verified project facts already accepted:

```text
CURRENT_EMPLOYEE_KINTONE_MODEL = SHARED/GENERAL ACCOUNT
IDENTITY_BINDING_SOURCE = NOT_AVAILABLE
NATIVE_KINTONE_ACL_CAN_DISTINGUISH_EMPLOYEE_0118_0119 = NO
```

But current `MboAuthSessionService.login()` still calls:

```text
MboIdentityService.resolveEmployeeIdentity(kintoneUserCode, userMappings)
```

before credential/activation verification. Therefore the real shared-account runtime fails with `IDENTITY_MAPPING_FAILED` before Activation Code can prove the employee.

### Required correction

Add one explicit, fail-closed employee-self identity mode for the approved shared-account architecture, e.g.:

```text
identityMode = SHARED_KINTONE_SECONDARY_AUTH
```

Rules in this mode:
1. `kintoneUserCode` must still exist as the authenticated outer Kintone admission/audit context.
2. `admin-form` / Administrator remains blocked from becoming Employee Self.
3. `mboUsername` is only an Employee_Code locator, NOT proof by itself.
4. Look up exactly one trusted credential by `mboUsername`.
5. Returned credential Employee_Code must exactly equal the requested `mboUsername`.
6. Verify the MBO password server-side.
7. If `Must_Change_Password = true`, require mandatory one-time Activation Code proof.
8. Only successful password + required activation proof establishes the trusted session `employeeCode`.
9. Later login after password change uses Employee_Code + private MBO password; Activation Code is not required.

Do NOT remove `MboIdentityService` or weaken its record-access authorization methods. The later App794 gateway must authorize records from the trusted session principal, not a browser-supplied Employee_Code.

For backward compatibility, existing `KINTONE_BOUND` behavior may remain as a separate explicit mode. Unknown/missing unsafe mode must not silently bypass security. The D1 trusted gateway will explicitly use `SHARED_KINTONE_SECONDARY_AUTH`.

## 2. B2 — ACTIVATION IS CURRENTLY OPTIONAL / FAIL-OPEN

Current bootstrap code proceeds to issue a password-change session when any of these are absent:
- activationStore itself;
- `getActivation()` capability;
- activation record / hash;
- `consumeActivation()` capability.

This violates the frozen user decision.

### Required correction

Whenever `credentialRecord.Must_Change_Password === true`:

```text
activationStore.getActivation = REQUIRED
activationStore.consumeActivation = REQUIRED
activation record/hash = REQUIRED
valid, unexpired, unused activation = REQUIRED
consume success = REQUIRED BEFORE session issue
```

Fail closed with stable statuses/errors such as:
- `ACTIVATION_STORE_INCOMPLETE`
- `ACTIVATION_NOT_PROVISIONED`
- existing `ACTIVATION_CODE_REQUIRED`
- existing invalid/expired/used statuses
- `ACTIVATION_CONSUME_FAILED`

No restricted session token may be issued on any failure above.

Also verify the validated activation record belongs to the same Employee_Code being authenticated.

Activation Code is not a password substitute: wrong MBO password must still fail even when Activation Code is valid.

## 3. B3 — ACTIVATION ENTROPY TOO LOW

Current issuance truncates to 8 hex characters (~32-bit entropy) and there is no dedicated activation-attempt lockout.

For this first-login identity proof, generate at least 64 bits of cryptographic entropy. Keep implementation simple, for example 8 random bytes encoded as 16 uppercase hex characters.

Do not add a generic OTP/MFA framework.

## 4. FROZEN POST-LOGIN UX/SECURITY INVARIANT

After authentication succeeds, the trusted session already owns exactly one `employeeCode`.

Therefore later Employee Self-Service must NOT ask the employee to type/select Employee ID again.

Future App794 gateway behavior:

```text
session.employeeCode
  -> load App53 facts for that employee
  -> load/open/create only that employee's App794 MBO
```

Copy Previous / Export / History must also derive Employee_Code from the trusted session, never from a browser-selectable employee field.

No UI work is authorized in this corrective package.

## 5. ALLOWED FILES ONLY

Prefer only:
- `src/services/mbo-auth-session-service.js`
- `src/services/mbo-activation-service.js`
- `tests/mbo-auth-session-service.test.js`
- `tests/mbo-activation-service.test.js`

Touch `mbo-auth-kintone-repository.js` only if a proven interface incompatibility makes it unavoidable; do not refactor it.

## 6. MINIMUM TESTS

Add only enough regression tests to prove:

1. shared outer Kintone principal + no 1:1 userMappings can authenticate Employee 0118 using correct MBO password + valid activation in explicit shared mode;
2. same shared outer principal cannot authenticate 0118 with wrong password even with valid activation;
3. missing activationStore capability => no session / fail closed;
4. missing activation record/hash => no session / fail closed;
5. missing consumeActivation capability or consume failure => no session / fail closed;
6. valid activation belongs to another Employee_Code => fail closed;
7. valid bootstrap proof -> restricted password-change session, then forced password change -> authorized session;
8. later login with new password does not require activation;
9. generated activation has >=64-bit entropy representation;
10. technical admin remains blocked.

Keep existing password/session/repository tests passing. Do not add broad duplicate tests.

Run:

```bash
npm test -- tests/mbo-activation-service.test.js tests/mbo-auth-session-service.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js tests/mbo-activation-service.test.js
npm test
git diff --check
git status --short
```

No CI claim without GitHub CI evidence.

## 7. OUT OF SCOPE

- no Kintone schema/record/ACL write
- no Kintone deploy
- no Login/UI work
- no App794 data gateway yet
- no hosting framework yet
- no App800 HR activation screen yet
- no MFA/TOTP
- no D2-D7 source work
- no unrelated refactor

Mandatory counters:

```text
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
```

## 8. TARGET STATUS

Antigravity maximum:

```text
D1C3A_CORRECTIVE = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
D1_OVERALL_STATUS = IN_PROGRESS
```

If this corrective passes independent review, next is D1-C3B only: trusted employee-self App794 gateway + exact App801 schema/write/runtime deployment authorization package.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT ACCESS CHECK RESIDUAL / D1-C1 SOURCE ACCEPTED / D1-C2 EVIDENCE ACCEPTED / D1-C3A CORRECTIVE
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
