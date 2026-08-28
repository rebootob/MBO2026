# AI ACTIVE TASK — D1 SHORT-LIVED SESSION CONTINUITY SOURCE / TEST

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **SOURCE / TEST ONLY — NO LIVE KINTONE WRITE / NO DEPLOY**

## 0. Authorization / Architecture

User explicitly approved:

```text
อนุมัติ D1 Short-lived Session Continuity Architecture
```

Canonical architecture:

```text
project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md
project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md
project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md
```

This task implements source/tests only. It does NOT authorize App801 schema creation, live App801 session writes, App794 deploy, or UAT.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
4. `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
5. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
6. `src/ui/mbo-kintone-auth-adapter.js`
7. `src/ui/mbo-kintone-login-gate.js`
8. `src/main-mbo-app.js`
9. `scripts/kintone/deploy-custom-ui.js`
10. existing focused auth/login/bundle tests only as needed

Do not scan repository/history broadly.
Do not open `employee-part-a-ui.js` unless a test import requires reading its public surface; do not modify it.
Do not reopen D2-D7.

## 2. Exact Module Design

### A. New dedicated module

Create exactly:

```text
src/ui/mbo-session-manager.js
```

Responsibility only:
- generate cryptographically random 256-bit opaque token;
- encode/decode token safely;
- SHA-256 token hashing using Web Crypto;
- `sessionStorage` read/write/clear for key `ttmet.mbo794.session.v1`;
- issue / restore / revoke orchestration against adapter session methods;
- absolute 8-hour TTL; no sliding refresh.

It must NOT own:
- password verification;
- Employee/Routing/Scoring business rules;
- Kintone UI rendering;
- App794 record handling.

Browser storage must contain only the raw opaque token. Do not persist Employee_Code/authenticated=true as trusted browser identity.

### B. Auth adapter

Modify only the existing `src/ui/mbo-kintone-auth-adapter.js` to support App801 session-record operations.

Required App801 field codes in source contract:

```text
Session_Token_Hash
Session_Issued_At
Session_Expires_At
Session_Credential_Version
Session_Kintone_User
Credential_Version
```

Required behavior:
1. `_getCredential()` must read and validate positive-integer `Credential_Version`.
2. Add a narrow server-session issue/store method that:
   - receives Employee_Code + token hash + issued/expiry + Kintone principal;
   - verifies exactly one credential row;
   - requires `Account_Status=ACTIVE`;
   - requires `Force_Password_Change=NO`;
   - stores token hash and session metadata;
   - stores `Session_Credential_Version = Credential_Version`.
3. Add a narrow restore/validate method that resolves by exact `Session_Token_Hash` and fails closed unless:
   - exactly one record matches;
   - Account_Status ACTIVE;
   - Force_Password_Change NO;
   - expiry is valid/future;
   - Credential_Version positive integer;
   - Session_Credential_Version equals Credential_Version;
   - Session_Kintone_User equals current Kintone principal;
   - Employee_Code is valid.
4. Add a narrow revoke method clearing the session fields for the matching token when resolvable.
5. Password-change paths must increment Credential_Version and clear prior session fields atomically in the same credential update where practical.
6. Login/password methods must never return Password_Hash or raw token.

Do not add raw token storage to App801.

### C. Login gate

Modify only existing `src/ui/mbo-kintone-login-gate.js` for session lifecycle integration.

Required behavior:
- constructor accepts an injected session manager;
- `requireLogin(host)` first uses existing in-page principal if valid;
- otherwise attempts session restore before rendering Login;
- valid restore sets in-page principal and continues without password prompt;
- normal successful login issues session before resolving authenticated content;
- Force Password Change issues no session until password change succeeds;
- after forced change succeeds, issue session before resolving content;
- normal Change Password invalidates/rotates prior session and issues replacement session for current tab;
- Logout revokes/clears session, clears principal, then reloads/re-blocks;
- any restore/issue/revoke error must fail closed; never silently self-authorize.

Do not put token crypto/storage code inside Login Gate.

### D. Main entry point

Modify `src/main-mbo-app.js` only for dependency construction/wiring:
- import `MboSessionManager`;
- construct it with the Auth Adapter and current Kintone principal provider;
- inject into `MboKintoneLoginGate`;
- no token generation/hash/sessionStorage/TTL logic in main;
- do not change Create/List/Detail/Edit business rules in this task.

### E. Build manifest

Update `scripts/kintone/deploy-custom-ui.js` source order so `mbo-session-manager.js` is included exactly once and before code that depends on it.

Do not change live deploy safety logic except the minimal build-source manifest/order needed for the new module.

## 3. Confirmed Session Semantics

Implement exactly:

```text
TOKEN_ENTROPY                = 256 bits
TOKEN_STORAGE_BROWSER        = sessionStorage only
SESSION_STORAGE_KEY          = ttmet.mbo794.session.v1
SERVER_TOKEN_STORAGE         = SHA-256(token) only
ABSOLUTE_TTL                 = 8 hours
SLIDING_REFRESH              = NO
ACTIVE_SESSION_PER_EMPLOYEE  = 1
KINTONE_PRINCIPAL_BIND       = YES
CREDENTIAL_VERSION_BIND      = YES
```

Login again overwrites the server-side session metadata for that Employee_Code, invalidating the older token.

Same-tab navigation/reload may restore session.
Independent new tab without token requires Login.
Expired/tampered/malformed token fails closed.

## 4. Required Focused Tests

Create a focused test file, preferably:

```text
tests/mbo-session-manager.test.js
```

Update existing auth/login/bundle tests only where needed.

Tests must prove at minimum:

```text
TOKEN_256_BIT_RANDOM = PASS
RAW_TOKEN_ONLY_IN_SESSION_STORAGE = PASS
NO_EMPLOYEE_CODE_AS_BROWSER_AUTH_PROOF = PASS
TOKEN_HASH_SHA256 = PASS
TTL_EXACT_8_HOURS = PASS
NO_SLIDING_REFRESH = PASS
VALID_SESSION_RESTORE = PASS
EXPIRED_SESSION_BLOCKED = PASS
TAMPERED_TOKEN_BLOCKED = PASS
DUPLICATE_TOKEN_HASH_BLOCKED = PASS
DISABLED_ACCOUNT_BLOCKED = PASS
LOCKED_ACCOUNT_BLOCKED = PASS
FORCE_PASSWORD_CHANGE_SESSION_BLOCKED = PASS
KINTONE_PRINCIPAL_MISMATCH_BLOCKED = PASS
CREDENTIAL_VERSION_MISMATCH_BLOCKED = PASS
LOGIN_ISSUES_SESSION_AFTER_AUTH = PASS
FORCE_CHANGE_ISSUES_SESSION_ONLY_AFTER_PASSWORD_CHANGE = PASS
PASSWORD_CHANGE_INCREMENTS_CREDENTIAL_VERSION = PASS
PASSWORD_CHANGE_ROTATES_SESSION = PASS
LOGOUT_REVOKES_AND_CLEARS_LOCAL_SESSION = PASS
NEW_LOGIN_INVALIDATES_PRIOR_SESSION = PASS
LOCAL_STORAGE_UNUSED_FOR_AUTH = PASS
SESSION_TOKEN_NOT_LOGGED_OR_RENDERED = PASS
```

Bundle/runtime tests must also prove:

```text
SESSION_MANAGER_DEFINITION_COUNT = 1
AUTH_ADAPTER_DEFINITION_COUNT = 1
LOGIN_GATE_DEFINITION_COUNT = 1
RUNTIME_DEPENDENCY_RESOLUTION = PASS
SOURCE_DIST_EXACTNESS = PASS
```

Do not call real Kintone in tests.
Use mocked App801 records/API/sessionStorage/Kintone principal.

## 5. Regression Gates

Run locally:

```text
npm run ui:build
npm test
```

Existing accepted behavior must remain green, including:

```text
EMPLOYEE_CODE_50.03 = PASS
EMPLOYEE_CODE_50.02 = PASS
EMPLOYEE_CODE_0050_2 = PASS
PBKDF2_PASSWORD_TESTS = PASS
LOCKOUT_TESTS = PASS
CSS_UNCHANGED = YES
```

## 6. Explicitly Forbidden

- NO Kintone POST/PUT/DELETE;
- NO Kintone file upload;
- NO App794 deploy/redeploy;
- NO App801 schema/field creation;
- NO live App801 session/credential updates;
- NO App53/795/796 write;
- NO group/ACL change;
- NO UAT;
- NO D2-D7 implementation;
- NO fix for the separate `kintone.app.record.get()` Create-handler defect;
- NO modification of `employee-part-a-ui.js`;
- NO broad refactor/directory move;
- NO putting session implementation into `main-mbo-app.js`;
- NO manual edit of generated `dist/mbo-employee-app.js`.

## 7. Allowed Files

Expected source/test changes are limited to:

```text
src/ui/mbo-session-manager.js                 NEW
src/ui/mbo-kintone-auth-adapter.js            MODIFY
src/ui/mbo-kintone-login-gate.js              MODIFY
src/main-mbo-app.js                            MODIFY MINIMAL WIRING ONLY
scripts/kintone/deploy-custom-ui.js            MODIFY BUILD MANIFEST/ORDER ONLY
tests/mbo-session-manager.test.js              NEW
existing auth/login/classic-bundle tests       MODIFY ONLY AS REQUIRED
dist/mbo-employee-app.js                       GENERATED BY ui:build ONLY
```

`dist/mbo-employee.css` must remain unchanged.

Do not modify Baseline, Control Center, Active Task, Skills, or evidence docs in the executor source commit.

## 8. Delivery

Commit one concise source/test implementation commit and push, then STOP.

Final report <= 16 lines:

```text
COMMIT_SHA
FILES_CHANGED
UI_BUILD_RESULT
NPM_TEST_RESULT
SESSION_MANAGER_MODULE_RESULT
SESSION_STORAGE_SECURITY_RESULT
TOKEN_HASH_RESULT
TTL_RESULT
SESSION_RESTORE_RESULT
PRINCIPAL_BIND_RESULT
CREDENTIAL_VERSION_RESULT
PASSWORD_ROTATION_RESULT
LOGOUT_RESULT
BUNDLE_RUNTIME_RESULT
DIST_CSS_UNCHANGED
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP after push. ChatGPT performs the independent review before App801 schema authorization is considered.