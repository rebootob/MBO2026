# AI ACTIVE TASK — D1 SESSION CONTINUITY SECURITY CORRECTIVE

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **ONE NARROW SOURCE / TEST CORRECTIVE ONLY — NO LIVE KINTONE WRITE / NO DEPLOY**

## 0. Review Basis

Reviewed executor commit:

```text
eed5b7c253788d47e58a6e9a08fa47c3de73391f
```

Architecture remains accepted and unchanged:

```text
project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md
project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md
project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md
```

This task corrects implementation to match the Baseline. It does NOT authorize schema creation, live App801 session writes, App794 deploy, UAT, Create-handler fix, or D2-D7 work.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
4. `src/ui/mbo-session-manager.js`
5. `src/ui/mbo-kintone-auth-adapter.js`
6. `src/ui/mbo-kintone-login-gate.js`
7. `tests/mbo-session-manager.test.js`
8. `tests/mbo-kintone-login-gate.test.js`
9. `tests/mbo-kintone-auth-adapter.test.js` only if present/needed
10. `tests/classic-bundle.test.js` only for regression/build proof

Do not scan repository/history broadly.
Do not read or modify `employee-part-a-ui.js`.
Do not modify `src/main-mbo-app.js` unless a focused test proves wiring is broken; no new session logic belongs there.

## 2. Exact Correctives

### A. Credential_Version must fail closed

In Auth Adapter:

```text
Credential_Version missing/blank      -> INVALID / fail closed
Credential_Version non-numeric        -> INVALID / fail closed
Credential_Version non-integer        -> INVALID / fail closed
Credential_Version <= 0               -> INVALID / fail closed
```

Do NOT default blank/missing to `1` in `_getCredential()` or session validation.

Existing provisioned credentials already use `Credential_Version = 1`; no backward-compatible default is authorized.

### B. Kintone principal binding must fail closed

Session issue:
- require a non-empty current Kintone user code;
- do not store blank `Session_Kintone_User`;
- if principal cannot be resolved, issue must fail before local token is stored.

Session restore:

```text
current Kintone user missing/blank -> INVALID_SESSION
Session_Kintone_User missing/blank -> INVALID_SESSION
Session_Kintone_User !== current user -> INVALID_SESSION
```

Use exact identity comparison; do not weaken binding by conditional truthiness.

### C. Force_Password_Change must equal NO

Restore is valid only when:

```text
Force_Password_Change === 'NO'
```

`YES`, blank, null, malformed or any other value must fail closed.

### D. Revoke failure must remain observable

Required behavior:
- local raw token MUST be cleared even if server-side revoke fails;
- adapter/session manager must NOT falsely return `SESSION_REVOKED` after a server error or ambiguous duplicate match;
- duplicate token-hash match must not be silently treated as success;
- return/throw a narrow sanitized failure state without raw token/hash disclosure;
- Login Gate logout may still clear principal/reload to fail closed, but must not depend on a false server-success result.

### E. Normal password-change rotation must fail closed on replacement-session failure

Current password change correctly increments `Credential_Version` and clears old server session fields.

After that:
- attempt replacement session issue;
- if replacement issue succeeds -> continue and show success;
- if replacement issue fails -> clear any local token, clear in-page principal / require re-authentication, and do NOT silently continue as authenticated;
- UI may state password changed but session renewal failed and re-login is required; do not claim uninterrupted session success.

Do not revert the successful password change.

### F. Keep bearer token inside Session Manager API boundary

External callers do not need raw token/hash.

Change public outcomes so:
- `issueSession()` does not return raw `token` or `tokenHash`;
- `restoreSession()` does not return raw `sessionToken`;
- normal callers receive only non-secret status / Employee_Code / expiry if needed.

Raw token remains only inside `mbo-session-manager.js` + browser `sessionStorage`.
Never log/render raw token or token hash.

## 3. Required Focused Tests

Add/adjust tests to prove ALL:

```text
CREDENTIAL_VERSION_MISSING_BLOCKED = PASS
CREDENTIAL_VERSION_BLANK_BLOCKED = PASS
CREDENTIAL_VERSION_ZERO_NEGATIVE_NONINTEGER_BLOCKED = PASS
ISSUE_WITHOUT_KINTONE_PRINCIPAL_BLOCKED = PASS
RESTORE_WITHOUT_CURRENT_KINTONE_PRINCIPAL_BLOCKED = PASS
RESTORE_WITH_BLANK_STORED_PRINCIPAL_BLOCKED = PASS
KINTONE_PRINCIPAL_EXACT_MISMATCH_BLOCKED = PASS
FORCE_PASSWORD_CHANGE_MUST_EQUAL_NO = PASS
REVOKE_SERVER_FAILURE_OBSERVABLE = PASS
REVOKE_DUPLICATE_HASH_NOT_SUCCESS = PASS
REVOKE_FAILURE_STILL_CLEARS_LOCAL_TOKEN = PASS
LOGIN_ISSUES_SESSION_AFTER_AUTH = PASS
FORCE_CHANGE_ISSUES_SESSION_ONLY_AFTER_PASSWORD_CHANGE = PASS
PASSWORD_CHANGE_REPLACEMENT_SESSION_SUCCESS = PASS
PASSWORD_CHANGE_REPLACEMENT_SESSION_FAILURE_FAILS_CLOSED = PASS
NEW_LOGIN_INVALIDATES_PRIOR_SESSION = PASS
ISSUE_RESULT_EXPOSES_NO_RAW_TOKEN_OR_HASH = PASS
RESTORE_RESULT_EXPOSES_NO_RAW_TOKEN = PASS
SESSION_TOKEN_NOT_LOGGED_OR_RENDERED = PASS
```

Keep existing required tests green:

```text
TOKEN_256_BIT_RANDOM
TOKEN_HASH_SHA256
TTL_EXACT_8_HOURS
NO_SLIDING_REFRESH
VALID_SESSION_RESTORE
EXPIRED_SESSION_BLOCKED
TAMPERED_TOKEN_BLOCKED
DISABLED_ACCOUNT_BLOCKED
LOCKED_ACCOUNT_BLOCKED
CREDENTIAL_VERSION_MISMATCH_BLOCKED
LOGOUT_REVOKES_AND_CLEARS_LOCAL_SESSION
EMPLOYEE_CODE_50.03 / 50.02 / 0050_2
PBKDF2 / lockout regression
SESSION_MANAGER_DEFINITION_COUNT = 1
AUTH_ADAPTER_DEFINITION_COUNT = 1
LOGIN_GATE_DEFINITION_COUNT = 1
SOURCE_DIST_EXACTNESS
```

Use mocks only. No real Kintone calls.

## 4. Allowed Files

Expected changes are limited to:

```text
src/ui/mbo-session-manager.js
src/ui/mbo-kintone-auth-adapter.js
src/ui/mbo-kintone-login-gate.js
tests/mbo-session-manager.test.js
tests/mbo-kintone-login-gate.test.js
tests/mbo-kintone-auth-adapter.test.js   only if required
classic bundle test                       only if required
dist/mbo-employee-app.js                 GENERATED by ui:build only
```

Do NOT modify:

```text
src/main-mbo-app.js unless a focused wiring regression forces a minimal correction
src/ui/employee-part-a-ui.js
D1_SESSION_CONTINUITY baseline
other Baselines
Control Center
Active Task
skills/
CSS
Create-handler flow
D2-D7 source
```

## 5. Mandatory Local Gates

Run:

```text
npm run ui:build
npm test
```

Require:

```text
UI_BUILD_RESULT = PASS
NPM_TEST_RESULT = PASS
DIST_CSS_UNCHANGED = YES
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
APP801_SCHEMA_WRITES_EXECUTED = 0
APP801_LIVE_RECORD_WRITES_EXECUTED = 0
```

If a test reveals another issue outside this exact session corrective, STOP and report it. Do not expand scope.

## 6. Explicitly Forbidden

- NO Kintone POST/PUT/DELETE;
- NO file upload/deploy;
- NO App801 field/schema creation;
- NO live App801 record/session update;
- NO Create-handler fix;
- NO `employee-part-a-ui.js` change;
- NO broad refactor;
- NO D2-D7 work;
- NO self-PASS;
- NO follow-on task creation.

## 7. Delivery

Commit one concise source/test corrective commit and push, then STOP.

Return only:

```text
COMMIT_SHA
FILES_CHANGED
UI_BUILD_RESULT
NPM_TEST_RESULT
CREDENTIAL_VERSION_FAIL_CLOSED_RESULT
PRINCIPAL_BIND_FAIL_CLOSED_RESULT
FORCE_CHANGE_RESTORE_RESULT
REVOKE_FAILURE_RESULT
PASSWORD_ROTATION_FAILURE_RESULT
TOKEN_API_BOUNDARY_RESULT
SESSION_INTEGRATION_TEST_RESULT
BUNDLE_RUNTIME_RESULT
DIST_CSS_UNCHANGED
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
APP801_SCHEMA_WRITES_EXECUTED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP. ChatGPT performs the next independent review.