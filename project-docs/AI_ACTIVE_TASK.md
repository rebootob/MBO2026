# AI ACTIVE TASK — D1-C2A EXACT RUNTIME CLOSURE MANIFEST + ONE LOCKED-STATE FIX ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Independently reviewed implementation: `1ff2ca63e515d65405b2d766855f3c2639b5e2b3`
> Mode: FASTEST SAFE PATH / MINIMUM SOURCE FIX + READ-ONLY RUNTIME MANIFEST / NO KINTONE WRITE OR DEPLOY

## 0. D1-C1 INDEPENDENT REVIEW RESULT

Accepted source corrections from `1ff2ca63...`:
- B1 PASS: `changePassword()` now passes only mutable lifecycle fields to `credentialStore.updateCredential()`.
- B2 PASS: repository now fails closed on Employee_Code mismatch, missing/unknown Account_Status, missing/unknown Force_Password_Change, and malformed Failed_Attempts.
- Scope PASS: only the three allowed auth/test files changed.

D1-C1 is NOT runtime PASS. Classify:

`D1C1_SOURCE_CORRECTIVE = ACCEPTED`
`D1C1_RUNTIME = BLOCKED_WITH_EXACT_EVIDENCE`

The implementation commit reported these live preflight facts:

```text
APP801_RECORD_COUNT = 0
APP801_DIRECT_EMPLOYEE_BROWSER_ACCESS = DENIED
DIRECT_URL_CROSS_EMPLOYEE_ISOLATION = UNSAFE
DIRECT_REST_CROSS_EMPLOYEE_ISOLATION = UNSAFE
SESSION_STORE_PERSISTENCE = BACKEND_REQUIRED
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
```

Important independent review findings:

### R1 — App801 schema is missing Password_Expires_At
The reported exact App801 field list contains `Password_Changed_At` but does NOT contain `Password_Expires_At`.
The accepted `MboPasswordDomainService.changePassword()` always calculates and persists `Password_Expires_At`, and login checks it for expiry.
Therefore the current App801 adapter cannot be called live-ready: a real Kintone PUT containing a non-existent `Password_Expires_At` field would fail.

Do NOT remove password expiry behavior merely to fit the current schema.
Do NOT add the field in this task because Kintone schema writes are not yet authorized.

### R2 — Account_Status = LOCKED is not explicitly denied by password domain
Live schema reports `Account_Status` choices `ACTIVE | DISABLED | LOCKED`.
Current password domain explicitly denies `DISABLED`, but `LOCKED` is only denied when `Locked_Until` is a future timestamp.
A hard/manual `Account_Status = LOCKED` must fail closed even when `Locked_Until` is null/expired.
This is the ONLY source logic fix authorized in this package.

### R3 — Direct App794 URL/REST isolation is UNSAFE
This is a D1 release blocker. Client-side hiding is not a security boundary.
No ACL change is authorized in this package.

### R4 — Persistent session store is absent
Accepted auth core requires `getSession / setSession / deleteSession` with hashed tokens and reliable revocation.
Existing App801 schema does not currently provide the accepted session lifecycle.
Do not invent/execute schema changes yet.

### R5 — Kintone-user binding uniqueness is NOT independently proven
The implementation commit reports `KINTONE_USER_BINDING_UNIQUE = YES`, but the same evidence reports App801 record count = 0 and the reported App801 schema list contains no `Kintone_User_Code` field.
Treat this as `NOT_PROVEN` until the exact authoritative binding source and ambiguity result are shown.
If one Kintone principal maps to more than one employee under the accepted one-principal-to-one-Employee_Code contract, report `IDENTITY_BINDING_BLOCKER`; do not bypass by trusting typed Employee_Code.

## 1. SOURCE FIX — ONLY ONE SMALL FIX

Allowed source files:
- `src/services/mbo-password-service.js`
- `tests/mbo-password-service.test.js`

Required:
- `Account_Status === 'LOCKED'` => deny with `ACCOUNT_LOCKED` before password verification, regardless of `Locked_Until`.
- preserve existing timed `Locked_Until` behavior for ACTIVE accounts.
- add one focused regression test for hard `Account_Status = LOCKED` with null/expired `Locked_Until`.

Do not refactor password code.

## 2. READ-ONLY D1 RUNTIME CLOSURE MANIFEST

Use only minimum Kintone GETs needed. No source implementation beyond Section 1.
No Kintone mutation.

Produce in commit body / completion report the exact facts needed for ONE later user authorization.

### 2.1 App801 exact closure manifest
Confirm READ ONLY:
- exact current fields/types/options relevant to credential lifecycle
- confirm `Password_Expires_At` absent/present
- exact current App801 app/record ACL principals relevant to employee browser denial
- exact authoritative source of `Kintone_User_Code -> Employee_Code` binding, if any
- exact ambiguity result; do not claim uniqueness from zero records alone

Propose, but DO NOT execute, the minimum required App801 changes for the accepted auth contract.
At minimum assess:
- `Password_Expires_At` DATETIME
- smallest persistent session-store model supporting hashed token lookup, expiry, force-change/data-authorized flags, Kintone principal binding, set/get/delete/revoke

Prefer the smallest design; do not create a new app/framework unless existing App801 genuinely cannot support it safely.
Never store raw session tokens.

### 2.2 App794 exact direct-access blocker manifest
Read current App794 app/record ACL configuration and report:
- exact principals/groups/accounts that currently allow unsafe general/shared employee direct record URL access
- exact principals/groups/accounts that currently allow unsafe direct REST query access
- HR/appraiser/admin access that must not be accidentally removed

Propose the smallest ACL change needed so employee-self access is NOT dependent on browser-side hiding.
Do NOT execute it.

### 2.3 Trusted runtime boundary
State exactly where the accepted server-only auth/session/repository code can run for sandbox UAT.
If no real trusted backend runtime exists, report:

`TRUSTED_BACKEND_RUNTIME = NOT_AVAILABLE`

Do not pretend the Local Preview server is production/sandbox-deployed infrastructure.
Do not add a hosting framework in this task.

## 3. REQUIRED OUTPUT — EXACT ONE-APPROVAL MANIFEST

End report must contain:

```text
D1C1_SOURCE_CORRECTIVE = ACCEPTED
D1C1_RUNTIME = BLOCKED_WITH_EXACT_EVIDENCE
LOCKED_ACCOUNT_DOMAIN_FIX = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW

APP801_PASSWORD_EXPIRES_FIELD = PRESENT | ABSENT
APP801_SESSION_STORE_READY = YES | NO
IDENTITY_BINDING_SOURCE = <exact source> | NOT_AVAILABLE
KINTONE_USER_BINDING_UNIQUE = YES | NO | NOT_PROVEN
DIRECT_URL_CROSS_EMPLOYEE_ISOLATION = PROVEN | UNSAFE | NOT_PROVEN
DIRECT_REST_CROSS_EMPLOYEE_ISOLATION = PROVEN | UNSAFE | NOT_PROVEN
TRUSTED_BACKEND_RUNTIME = <exact runtime> | NOT_AVAILABLE

PROPOSED_KINTONE_WRITE_MANIFEST =
- exact App801 schema fields to add/change, if required
- exact App794 ACL changes, if required
- any exact App801 ACL adjustment, if required

KINTONE_READS_EXECUTED = N
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0

D1C2A_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW | BLOCKED_WITH_EXACT_EVIDENCE
D1_OVERALL_STATUS = IN_PROGRESS
```

The proposed write manifest is a PLAN ONLY. It is NOT authorization.
After independent review, ChatGPT will request the user's explicit authorization once for the exact required Kintone operations.

## 4. VERIFICATION

Run only:

```bash
npm test -- tests/mbo-password-service.test.js
npm test -- tests/mbo-password-service.test.js tests/mbo-identity-service.test.js tests/mbo-auth-session-service.test.js tests/mbo-auth-kintone-repository.test.js
npm test
git diff --check
git status --short
```

No CI claim without evidence.

## 5. OUT OF SCOPE

- no Login/UI changes
- no App801 schema write
- no App801 credential provisioning/write
- no App794/App801 ACL write
- no Kintone deploy
- no session-store implementation yet
- no new backend/hosting framework
- no MFA/TOTP
- no D2-D7 implementation
- no unrelated refactor/docs cleanup

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = IN_PROGRESS / D1-A CLOSED / D1-B SOURCE ACCEPTED + UAT ACCESS CHECK RESIDUAL / D1-C1 SOURCE ACCEPTED + RUNTIME BLOCKED / D1-C2A THIS TASK
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
