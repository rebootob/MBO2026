# AI ACTIVE TASK — D1 SESSION EXACT-PRINCIPAL + REGRESSION TEST RESTORATION CORRECTIVE

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **ONE FINAL NARROW SOURCE / TEST CORRECTIVE — NO LIVE KINTONE WRITE / NO DEPLOY**

## 0. Review Basis

Reviewed executor commit:

```text
d9d4f42eae3efc902a658ffba0d811b588bbfb7e
```

Architecture remains accepted and unchanged:

```text
project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md
project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md
project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md
```

This task fixes only remaining principal-binding/test-coverage issues. It does NOT authorize App801 schema creation, live App801 writes, App794 deploy, UAT, Create-handler correction, or D2-D7 work.

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
8. same test file from parent commit `eed5b7c253788d47e58a6e9a08fa47c3de73391f` ONLY to restore regression cases that were removed
9. `tests/mbo-kintone-login-gate.test.js`
10. `tests/mbo-kintone-auth-adapter.test.js`
11. `tests/classic-bundle.test.js` only as needed for regression proof

Do not scan repository/history broadly.
Do not read/modify `employee-part-a-ui.js`.
Do not modify `src/main-mbo-app.js`.

## 2. Exact Corrective A — Exact Kintone Principal Binding

Current comparison normalizes with trim/lowercase. Replace with fail-closed exact identity semantics.

Requirements:

```text
current Kintone code missing/null/blank = BLOCK
stored Session_Kintone_User missing/null/blank = BLOCK
code with leading/trailing whitespace = malformed / BLOCK
stored principal === current principal = required exactly
case-different value = mismatch / BLOCK
```

Do not lower-case or silently normalize identity for equality.
Do not store a modified identity string different from the exact Kintone principal code.

## 3. Exact Corrective B — Revoke Failure Sanitization

Local token must always clear.
Do not return arbitrary backend/API `err.message` text.

Allowed stable failure outcomes may include:

```text
SESSION_NOT_FOUND
DUPLICATE_SESSION_TOKEN_HASH
INVALID_TOKEN_HASH
SERVER_REVOKE_FAILED
```

No raw token/hash/backend payload in returned reason.

## 4. Exact Corrective C — Restore Regression Coverage

Restore the accepted focused regression tests that existed before the prior corrective deleted/replaced them.

Must directly test at minimum:

```text
TOKEN_256_BIT_RANDOM
TOKEN_HASH_SHA256
RAW_TOKEN_ONLY_IN_SESSION_STORAGE
NO_EMPLOYEE_CODE_AS_BROWSER_AUTH_PROOF
LOCAL_STORAGE_UNUSED_FOR_AUTH
TTL_EXACT_8_HOURS
NO_SLIDING_REFRESH
VALID_SESSION_RESTORE
EXPIRED_SESSION_BLOCKED
TAMPERED_TOKEN_BLOCKED
DISABLED_ACCOUNT_BLOCKED
LOCKED_ACCOUNT_BLOCKED
FORCE_PASSWORD_CHANGE_SESSION_BLOCKED
KINTONE_PRINCIPAL_MISMATCH_BLOCKED
CREDENTIAL_VERSION_MISMATCH_BLOCKED
PASSWORD_CHANGE_INCREMENTS_CREDENTIAL_VERSION
PASSWORD_CHANGE_ROTATES_OLD_SERVER_SESSION
LOGOUT_REVOKES_AND_CLEARS_LOCAL_SESSION
SESSION_MANAGER_DEFINITION_COUNT = 1
AUTH_ADAPTER_DEFINITION_COUNT = 1
LOGIN_GATE_DEFINITION_COUNT = 1
BUNDLE_RUNTIME_RESULT
```

Corrective tests are additive. Do not remove baseline regression coverage to reduce test count.

## 5. Exact Corrective D — Make Named Corrective Tests Real

The following scenarios must actually execute, not only appear in a test title:

```text
CREDENTIAL_VERSION_MISSING_BLOCKED
CREDENTIAL_VERSION_BLANK_BLOCKED
CREDENTIAL_VERSION_ZERO_NEGATIVE_NONINTEGER_BLOCKED
ISSUE_WITHOUT_KINTONE_PRINCIPAL_BLOCKED
RESTORE_WITHOUT_CURRENT_KINTONE_PRINCIPAL_BLOCKED
RESTORE_WITH_BLANK_STORED_PRINCIPAL_BLOCKED
KINTONE_PRINCIPAL_EXACT_MISMATCH_BLOCKED
KINTONE_PRINCIPAL_CASE_DIFFERENCE_BLOCKED
FORCE_PASSWORD_CHANGE_YES_BLOCKED
FORCE_PASSWORD_CHANGE_BLANK_BLOCKED
FORCE_PASSWORD_CHANGE_NULL_BLOCKED
FORCE_PASSWORD_CHANGE_MALFORMED_BLOCKED
REVOKE_SERVER_FAILURE_OBSERVABLE
REVOKE_DUPLICATE_HASH_NOT_SUCCESS
REVOKE_FAILURE_STILL_CLEARS_LOCAL_TOKEN
ISSUE_RESULT_EXPOSES_NO_RAW_TOKEN_OR_HASH
RESTORE_RESULT_EXPOSES_NO_RAW_TOKEN
```

## 6. Exact Corrective E — Real Login Gate Lifecycle Tests

Tests must exercise actual `MboKintoneLoginGate` production handlers/lifecycle with mocks/DOM shim. Do NOT manually duplicate the intended production logic in the test body.

Required direct proofs:

```text
LOGIN_ISSUES_SESSION_AFTER_AUTH
LOGIN_SESSION_ISSUE_FAILURE_DOES_NOT_AUTHORIZE
FORCE_CHANGE_ISSUES_SESSION_ONLY_AFTER_PASSWORD_CHANGE
FORCE_CHANGE_SESSION_ISSUE_FAILURE_DOES_NOT_AUTHORIZE
PASSWORD_CHANGE_REPLACEMENT_SESSION_SUCCESS
PASSWORD_CHANGE_REPLACEMENT_SESSION_FAILURE_FAILS_CLOSED
NEW_LOGIN_INVALIDATES_PRIOR_SESSION
LOGOUT_REVOKES_AND_CLEARS_PRINCIPAL
```

For `PASSWORD_CHANGE_REPLACEMENT_SESSION_FAILURE_FAILS_CLOSED`, trigger the actual Change Password form/listener or a narrowly extracted Login-Gate-owned lifecycle helper. Do not reproduce its branch manually in test code.

Do not move Login Gate responsibility into another module merely for testing.

## 7. Token Logging/Rendering Proof

`SESSION_TOKEN_NOT_LOGGED_OR_RENDERED` must be meaningful:
- inspect relevant source/runtime test path for console/log/DOM exposure of raw token/hash;
- public Session Manager outcomes must remain secret-free;
- do not rely only on checking that `issueRes.token` is undefined.

## 8. Allowed Files

Expected changes limited to:

```text
src/ui/mbo-session-manager.js                 only if sanitization needed
src/ui/mbo-kintone-auth-adapter.js            exact principal comparison / stable revoke error behavior
src/ui/mbo-kintone-login-gate.js              only if narrow lifecycle testability/fail-closed correction needed
tests/mbo-session-manager.test.js
tests/mbo-kintone-login-gate.test.js
tests/mbo-kintone-auth-adapter.test.js        only if needed
tests/classic-bundle.test.js                  only if needed
dist/mbo-employee-app.js                      GENERATED by ui:build only
```

Do NOT modify:

```text
src/main-mbo-app.js
src/ui/employee-part-a-ui.js
scripts/kintone/deploy-custom-ui.js unless build fails solely because source list drift is proven
Baselines
Control Center
Active Task
skills/
CSS
Create-handler flow
D2-D7 source
```

## 9. Mandatory Local Gates

Run:

```text
npm run ui:build
npm test
```

Require:

```text
UI_BUILD_RESULT = PASS
NPM_TEST_RESULT = PASS
REGRESSION_TESTS_RESTORED = YES
REAL_LOGIN_GATE_LIFECYCLE_TESTS = PASS
EXACT_PRINCIPAL_BIND = PASS
DIST_CSS_UNCHANGED = YES
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
APP801_SCHEMA_WRITES_EXECUTED = 0
APP801_LIVE_RECORD_WRITES_EXECUTED = 0
```

GitHub has no CI proof; executor may report local results but cannot self-PASS.

## 10. Explicitly Forbidden

- NO Kintone POST/PUT/DELETE;
- NO Kintone file upload/deploy;
- NO App801 schema creation;
- NO live App801 record/session write;
- NO Create-handler fix;
- NO `employee-part-a-ui.js` change;
- NO `main-mbo-app.js` change;
- NO broad refactor;
- NO D2-D7 work;
- NO self-PASS;
- NO follow-on task creation.

## 11. Delivery

Commit one concise corrective commit and push, then STOP.

Return only:

```text
COMMIT_SHA
FILES_CHANGED
UI_BUILD_RESULT
NPM_TEST_RESULT
EXACT_PRINCIPAL_BIND_RESULT
REVOKE_SANITIZATION_RESULT
REGRESSION_TEST_RESTORATION_RESULT
REAL_LOGIN_GATE_LIFECYCLE_RESULT
FORCE_CHANGE_MATRIX_RESULT
DUPLICATE_REVOKE_TEST_RESULT
TOKEN_EXPOSURE_TEST_RESULT
BUNDLE_RUNTIME_RESULT
DIST_CSS_UNCHANGED
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
APP801_SCHEMA_WRITES_EXECUTED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP. ChatGPT performs independent review before any App801 Session Schema authorization.