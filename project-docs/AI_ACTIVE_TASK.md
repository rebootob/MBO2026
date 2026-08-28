# AI ACTIVE TASK — D1 SESSION FINAL TEST-ONLY PROOF

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **TEST-ONLY — NO SOURCE CHANGE / NO LIVE KINTONE WRITE / NO DEPLOY**

## 0. Review Basis

Reviewed executor commit:

```text
7133e2934b0e8f7ea710e03d195157354e0d95b8
```

Control Plane result:

```text
SESSION_SECURITY_SOURCE = PASS
EXACT_PRINCIPAL_BINDING = PASS
REGRESSION_TEST_RESTORATION = PASS
FINAL_TEST_PROOF = 3 NARROW CASES REMAIN
```

This task closes test evidence only. It does NOT authorize App801 schema creation, live App801 writes, App794 deploy, UAT, Create-handler correction, source refactor, or D2-D7 work.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `tests/mbo-session-manager.test.js`
4. `src/ui/mbo-session-manager.js` READ-ONLY
5. `src/ui/mbo-kintone-auth-adapter.js` READ-ONLY
6. `src/ui/mbo-kintone-login-gate.js` READ-ONLY

Do not scan repository/history broadly.
Do not read or modify `employee-part-a-ui.js` or `main-mbo-app.js`.

## 2. Allowed Change

Modify only:

```text
tests/mbo-session-manager.test.js
```

Do NOT modify source or dist in this task.
If one of the new tests reveals a real source defect, STOP and report the exact defect. Do not fix it in this task.

## 3. Proof A — Force-Change Session Issue Failure

Current test title claims:

```text
FORCE_CHANGE_SESSION_ISSUE_FAILURE_DOES_NOT_AUTHORIZE
```

but the failure scenario is not executed.

Add a direct production-handler proof using actual:

```text
MboKintoneLoginGate._handleForceChangeAction()
```

Required sequence:
1. establish `PASSWORD_CHANGE_REQUIRED` state through `_handleLoginAction()` or equivalent real gate state;
2. make password change succeed;
3. make `sessionManager.issueSession()` fail;
4. call actual `_handleForceChangeAction()`;
5. require returned status = `SESSION_ISSUE_FAILED`;
6. require `gate.getEmployeeCode() === null`;
7. require no usable local session token exists/was newly established.

Do not manually reproduce production branch logic in the test.

## 4. Proof B — New Login Invalidates Prior Server Session

Current test proves only:

```text
token1 !== token2
```

That is insufficient.

Required direct proof:
1. login successfully -> capture token1;
2. login same Employee_Code again -> capture token2;
3. require token1 != token2;
4. put token1 back into the test sessionStorage and call actual `restoreSession()`;
5. require token1 restore = null because App801 server-side session hash was overwritten by login2;
6. put token2 back and require token2 restores the correct Employee_Code.

This proves one-active-session-per-Employee_Code rather than merely random-token generation.

## 5. Proof C — Token Not Logged or Rendered

Make `SESSION_TOKEN_NOT_LOGGED_OR_RENDERED` meaningful.

Add focused proof that:
- Session Manager public outcomes contain no raw token/hash;
- Auth Adapter and Login Gate public/runtime outcomes used by normal flow contain no token/hash;
- relevant source paths do not send raw token/hash to `console.log`, `console.error`, DOM `textContent`, `innerHTML`, URL/query/hash, localStorage, or cookies;
- browser auth storage remains the dedicated `sessionStorage` key owned by `MboSessionManager`.

A narrow source-text assertion is acceptable when paired with the existing runtime outcome assertions. Avoid brittle checks against comments; strip comments before static checks if necessary.

## 6. Preserve Existing Tests

Do not delete or weaken any current regression/corrective/lifecycle test.
The final test file must continue to cover the already accepted cases, including:

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
FORCE_PASSWORD_CHANGE_SESSION_BLOCKED
CREDENTIAL_VERSION_MISMATCH_BLOCKED
PASSWORD_CHANGE_INCREMENTS_CREDENTIAL_VERSION
PASSWORD_CHANGE_ROTATES_OLD_SERVER_SESSION
LOGOUT_REVOKES_AND_CLEARS_LOCAL_SESSION
EXACT PRINCIPAL MATRIX
FORCE CHANGE MATRIX
REVOKE FAILURE/DUPLICATE
LOGIN GATE LIFECYCLE
BUNDLE RUNTIME
```

## 7. Mandatory Local Gate

Run:

```text
npm test
```

Do not run deployment.
`npm run ui:build` is not necessary because source/dist are forbidden to change.

Require executor report:

```text
NPM_TEST_RESULT = PASS
SOURCE_FILES_CHANGED = 0
DIST_FILES_CHANGED = 0
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
APP801_SCHEMA_WRITES_EXECUTED = 0
APP801_LIVE_RECORD_WRITES_EXECUTED = 0
```

GitHub has no CI proof; executor may report local result but cannot self-PASS.

## 8. Explicitly Forbidden

- NO source change;
- NO dist change;
- NO CSS change;
- NO Kintone POST/PUT/DELETE;
- NO Kintone file upload/deploy;
- NO App801 schema creation;
- NO live App801 record/session write;
- NO Create-handler fix;
- NO broad refactor;
- NO D2-D7 work;
- NO self-PASS;
- NO follow-on task creation.

## 9. Delivery

Commit one test-only commit and push, then STOP.

Return only:

```text
COMMIT_SHA
FILES_CHANGED
NPM_TEST_RESULT
FORCE_CHANGE_FAILURE_PROOF
OLD_SESSION_INVALIDATION_PROOF
TOKEN_EXPOSURE_PROOF
REGRESSION_TESTS_PRESERVED
SOURCE_FILES_CHANGED = 0
DIST_FILES_CHANGED = 0
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
APP801_SCHEMA_WRITES_EXECUTED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP. ChatGPT performs independent review before any App801 Session Schema authorization.