# AI ACTIVE TASK — PROJECT CLOSE ROUND 1: LOCAL SECURITY + APP796 HARDENING

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `a707aa88a05bf3a5276a67020b06d9908321779f`
> Mode: **CREDIT-SAVER / PROJECT CLOSE / ONE BUNDLED ROUND**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY: **0 / 0 / 0**

## OBJECTIVE

Close the remaining local App796 authorization defect and implement the safest possible local foundation for **Gate 1 — MBO Login + Employee Data Isolation** in one source/test round.

Do not contact Kintone. Do not deploy. Do not browser-smoke. Do not perform broad discovery outside the repository. Do not reopen frozen UI V2.

## CONFIRMED BUSINESS DESIGN — MBO LOGIN

Employees already have Kintone user accounts. The requested additional login is an **MBO application login after Kintone login**, not a replacement for Kintone authentication.

Target user flow:

```text
Kintone authenticated user
  -> resolve/bind Kintone_User_Code to App53 Employee_Code
  -> MBO Login screen
  -> Username = Employee_Code
  -> default MBO password = Employee_Code
  -> first successful MBO login forces password change
  -> new password is never stored in plaintext
  -> password expiration supported
  -> forgotten password = HR reset to Employee_Code + force change
  -> MBO access continues only after successful identity and account checks
```

Required App801 logical fields/contract:

```text
Employee_Code
Kintone_User_Code
Password_Hash
Must_Change_Password
Password_Changed_At
Password_Expires_At
Failed_Login_Count
Locked_Until
Account_Status
```

Account status minimum values:

```text
ACTIVE
DISABLED
```

No security questions.
No plaintext password field.
No password in App794, JS constants, Git, logs, URLs, sessionStorage, localStorage, or test snapshots.

## CRITICAL SECURITY RULE — DO NOT FAKE A SECURITY BOUNDARY

Kintone authenticated identity remains the primary platform security boundary.

The additional MBO password **must not be implemented as client-side-only authorization** if doing so exposes `Password_Hash` or permits JavaScript bypass to become the only access-control boundary.

Before implementing MBO password verification, inspect the existing repository architecture LOCALLY and determine whether there is an existing trusted server-side/service execution boundary that can:

1. read App801 credential material without exposing hashes to the employee browser;
2. verify a password with a modern one-way password KDF;
3. bind the verified MBO identity to the already-authenticated Kintone user;
4. return only a limited authentication/session result to the browser.

### If a trusted server-side boundary already exists

Implement against the existing architecture. Do not invent a second parallel platform.

Password hashing requirements:
- prefer existing approved password-hashing dependency/pattern if present;
- otherwise use a modern password KDF appropriate to the runtime (Argon2id preferred; bcrypt/scrypt acceptable when runtime/dependency constraints justify it);
- unique salt per password;
- constant-time verification through the selected library/runtime;
- never reversible encryption for password storage.

### If NO trusted server-side boundary exists

**FAIL CLOSED.**

Do NOT implement insecure browser-only password verification.
Do NOT expose App801 hashes to employees.
Do NOT claim Gate 1 password authentication is complete.

In that case implement only the reusable domain contracts/tests that are safe locally and report exactly:

```text
MBO_SECONDARY_PASSWORD_SECURE_BACKEND = BLOCKED_NO_TRUSTED_SERVER_BOUNDARY
```

This is a valid blocker report and is preferred over an insecure implementation.

## GATE 1 — IDENTITY BINDING + DATA ISOLATION

Because every employee has a Kintone account, production identity isolation must bind:

```text
Authenticated Kintone User Code
  -> authoritative employee mapping
  -> Employee_Code
  -> authorized App794 MBO record(s)
```

Security invariant:

```text
EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B
```

Implement/finalize local source contracts and tests so that:

1. logged-in Kintone user is mandatory;
2. identity mapping must resolve exactly one active Employee_Code;
3. missing mapping fails closed;
4. duplicate/ambiguous mapping fails closed;
5. MBO username must equal the bound Employee_Code;
6. requested App794 employee scope must equal the bound Employee_Code for employee role;
7. direct URL / alternate view / API helper code must reuse the same authorization predicate where represented in this codebase;
8. technical admin identity must never be silently treated as employee business identity;
9. HR/approver access remains role-authorized and must not be confused with employee-self access.

Do not rely on UI hiding alone.

## PASSWORD LIFECYCLE DOMAIN RULES

Implement locally where architecturally appropriate:

### Initial provisioning

```text
Username = Employee_Code
Initial password = Employee_Code
Must_Change_Password = true
Account_Status = ACTIVE
```

The initial password must immediately be converted to `Password_Hash`; plaintext must not persist.

### First login

Correct initial password + correct identity binding:

```text
AUTHENTICATED_BUT_PASSWORD_CHANGE_REQUIRED
```

No normal MBO access until password is changed.

### Password change

On success:

```text
Password_Hash = newly generated hash
Must_Change_Password = false
Password_Changed_At = now
Password_Expires_At = configured expiry
Failed_Login_Count = 0
Locked_Until = cleared
```

### Password expiry

Expired password may authenticate only into password-change-required state. It must not grant normal MBO access.

Keep max-age configuration reusable; do not hardcode a business value unless an existing confirmed project setting already defines it.

### Failed login / lock

Provide deterministic domain behavior for failed count and temporary lock. Do not invent an aggressive production threshold if not already configured; keep threshold/duration injectable/configurable.

### HR reset

HR reset semantics:

```text
new temporary/default password = Employee_Code
Must_Change_Password = true
Failed_Login_Count = 0
Locked_Until = cleared
```

Reset must not reveal the old password because the old password must be unrecoverable.

## APP796 — R2D-R2 MINOR CLOSURE

Current R2D-R2 fixed the major defects, but `backupEvidence.capturedAt` currently accepts any JavaScript-parsable date.

The reviewed contract requires **timezone-aware ISO-8601**.

Fix `assertScoringMasterSupersessionAuthorization()` so `capturedAt` must:

1. be a non-empty string;
2. be valid ISO-8601 datetime;
3. explicitly include `Z` or a numeric UTC offset such as `+07:00` / `-05:00`;
4. reject timezone-less strings such as `2026-08-26T22:00:00`.

Add focused positive/negative tests.

Do not change supersession service business logic, bulk request shape, DGM candidate fields, hashes, or repository atomicity in this round.
Do not execute DGM repair.

## SOURCE SCOPE

Use existing files/modules first. Avoid unnecessary new files.

Allowed source changes only where needed for:
- App796 timezone-aware authorization correction;
- MBO auth/account domain contracts;
- identity binding/data isolation authorization;
- password lifecycle services/adapters if a trusted server-side boundary already exists;
- directly affected build entrypoints only if required.

Do not refactor unrelated code.
Do not modify legacy app code/data.
Do not modify frozen UI V2 except a minimal integration hook only if absolutely necessary for compile/test; no visual redesign.

## REQUIRED TEST COVERAGE

At minimum cover:

```text
APP796_TIMEZONE_AWARE_CAPTURED_AT
  valid Z timestamp -> PASS
  valid +07:00 timestamp -> PASS
  missing timezone -> DENY
  malformed timestamp -> DENY

IDENTITY_BINDING
  valid Kintone user -> exactly one Employee_Code -> PASS
  no mapping -> DENY
  ambiguous mapping -> DENY
  MBO username != bound Employee_Code -> DENY

EMPLOYEE_DATA_ISOLATION
  employee own record -> PASS
  Employee A requests Employee B -> DENY

PASSWORD_DOMAIN
  initial credential -> force-change state
  plaintext is never returned/persisted by domain API
  correct password -> PASS state
  wrong password -> failed count behavior
  disabled account -> DENY
  locked account -> DENY
  expired password -> password-change-required only
  successful password change -> new hash + expiry metadata
  HR reset -> default Employee_Code-derived hash + force change
```

If secure backend is absent, password-verification integration tests must not pretend a client-side implementation is secure. Test only safe domain contracts and report the blocker.

## HARD BOUNDARIES

```text
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0
APP53_WRITE = 0
LEGACY_APP_WRITE = 0
APP794_LIVE_WRITE = 0
APP795_LIVE_WRITE = 0
APP796_LIVE_WRITE = 0
APP801_LIVE_WRITE = 0
REAL_USER_ACTION = 0
REAL_NOTIFICATION = 0
UI_V2_REDESIGN = 0
```

Do not edit `CURRENT_STATE.md`, `HANDOFF.md`, `AI_REVIEW_PACKAGE.md`, or baseline docs in this execution round unless implementation literally cannot be understood without a one-line status correction. Prefer no docs churn.

## EXECUTION PLAN — ONE ROUND ONLY

1. Confirm branch is `ai/antigravity-wp002c` and pull latest.
2. Read this `AI_ACTIVE_TASK.md`.
3. Inspect only directly relevant local auth/security/App801/App794 authorization code and App796 guard/tests.
4. Determine whether a trusted server-side boundary already exists.
5. Implement all safe local changes in this package.
6. Run targeted tests once.
7. Run `npm test` once because source changed.
8. Build only if the changed source requires it under existing project convention.
9. Confirm zero Kintone/browser/network execution.
10. Commit and push same branch.
11. STOP for ChatGPT review.

## REQUIRED RETURN

Return only:

```text
STATUS: READY FOR CHATGPT REVIEW
START_HEAD:
END_HEAD:
FILES_CHANGED:
TRUSTED_SERVER_BOUNDARY: YES | NO
MBO_SECONDARY_PASSWORD_SECURE_BACKEND: IMPLEMENTED_LOCAL | BLOCKED_NO_TRUSTED_SERVER_BOUNDARY
IDENTITY_BINDING: PASS | BLOCKED
EMPLOYEE_A_CANNOT_ACCESS_EMPLOYEE_B_LOCAL_GATE: PASS | BLOCKED
APP796_TIMEZONE_GUARD: PASS
TARGETED_TESTS:
NPM_TEST:
BUILD:
KINTONE_CALLS: 0
KINTONE_WRITES: 0
KINTONE_DEPLOYS: 0
BROWSER_SMOKE: 0
BLOCKERS:
```

Then STOP.
