# AI ACTIVE TASK — D1 APP794 BUNDLE + EMPLOYEE-CODE CORRECTIVE

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **SOURCE / BUILD / TEST ONLY — NO LIVE KINTONE WRITE**

## 0. Review Verdict / Why This Task Exists

The App794 deploy at executor evidence commit:

```text
94b55b43944bdf95a0fd598aabcb8db5bf91e190
```

is **NOT ACCEPTED**.

Independent live evidence shows:

```text
FAIL_CLOSED_GATE_NULL
```

and Git inspection proves the deployed classic bundle references `MboKintoneAuthAdapter` and `MboKintoneLoginGate` without including their class definitions.

This task fixes source/build/test only. It does **not** authorize redeploy.

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
4. `scripts/kintone/deploy-custom-ui.js`
5. `src/ui/mbo-kintone-auth-adapter.js`
6. `src/ui/mbo-kintone-login-gate.js`
7. `src/core/fiscal-year-engine.js`
8. `src/main-mbo-app.js`
9. `tests/classic-bundle.test.js`
10. `tests/mbo-kintone-auth-adapter.test.js`
11. `tests/record-key.test.js` only if needed for the Employee-Code/Record-Key correction
12. `dist/mbo-employee-app.js`
13. `dist/mbo-employee.css`

Do not scan repository/history.
Do not create a planning package.

## 2. Corrective A — Bundle Dependency Completeness

Update the existing build path in `scripts/kintone/deploy-custom-ui.js` so the classic bundle includes, before `main-mbo-app.js`:

```text
src/ui/mbo-kintone-auth-adapter.js
src/ui/mbo-kintone-login-gate.js
```

Use the existing file/function structure; do not introduce a new bundler or broad refactor.

Required built artifact facts:

```text
MboKintoneAuthAdapter definition = exactly 1
MboKintoneLoginGate definition   = exactly 1
main-mbo-app initialization occurs only after both definitions
```

## 3. Corrective B — Tests Must Catch Missing Runtime Dependencies

Update existing tests, primarily `tests/classic-bundle.test.js`.

Do not merely duplicate the build script's source list and assert syntax parses.

Required tests must prove at minimum:

1. committed/rebuilt classic bundle contains exactly one definition of `MboKintoneAuthAdapter`;
2. committed/rebuilt classic bundle contains exactly one definition of `MboKintoneLoginGate`;
3. bundle still has zero ES-module `import` / `export` residue;
4. bundle can execute a minimal initialization path with a safe fake/stub Kintone environment far enough to prove the two auth classes are runtime-resolvable; no real Kintone network call;
5. source -> build -> committed `dist/mbo-employee-app.js` exactness remains proven.

Do not weaken the existing fail-closed behavior.

## 4. Corrective C — Employee Code Must Match Confirmed Baseline

The Baseline confirms Employee Code is a string identifier and real accepted examples include:

```text
50.03
50.02
0050_2
```

Current `[A-Za-z0-9_-]+` validation incorrectly rejects the dot-containing codes.

Correct the existing validation consistently in:

- `src/ui/mbo-kintone-auth-adapter.js`
- `src/core/fiscal-year-engine.js`
- corresponding Record Key validation/generation
- focused tests

A safe intended character set for the current confirmed data is:

```text
[A-Za-z0-9_.-]+
```

Preserve exact string identity and leading zeros.

Required PASS examples:

```text
0118
50.03
50.02
0050_2
```

Required FAIL examples must include at least:

```text
blank
numeric non-string input
employee code containing a space
0118" or "1"="1
```

The injection-string test must prove zero Kintone calls are made.

Do not broaden the character set beyond what is required by confirmed data.

## 5. Corrective D — Future JS-Only Deploy Must Preserve Non-Target FILE Entries

Fix the existing deployment implementation so that a future single-target JS replacement does **not** automatically re-upload unchanged CSS.

Required design within the existing script/function structure:

1. read current live customization at execution time when not in build-only mode;
2. identify exactly one target desktop FILE `mbo-employee-app.js`;
3. upload only the replacement JS target;
4. construct the new customization payload from current live state;
5. preserve current scope, ordering, URL entries, mobile entries and all non-target FILE entries using their existing fileKeys;
6. do not upload `mbo-employee.css` merely to preserve it;
7. fail closed if target JS is missing/ambiguous or live state cannot be read safely.

This task changes the deployment script source only. **DO NOT execute its live deployment mode.**

## 6. Build / Test Gates

Execute locally only:

```text
npm run ui:build
npm test
```

Also run the focused tests needed to make failures easy to diagnose if useful.

Required post-build evidence:

```text
CLASSIC_BUNDLE_PARSE = PASS
AUTH_ADAPTER_DEFINITION_COUNT = 1
LOGIN_GATE_DEFINITION_COUNT = 1
AUTH_RUNTIME_RESOLUTION_TEST = PASS
EMPLOYEE_CODE_50.03 = PASS
EMPLOYEE_CODE_50.02 = PASS
EMPLOYEE_CODE_0050_2 = PASS
INJECTION_STRING_REJECTED_ZERO_KINTONE_CALLS = PASS
SOURCE_DIST_EXACTNESS = PASS
DIST_CSS_GIT_BLOB_BEFORE = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
DIST_CSS_GIT_BLOB_AFTER  = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
DIST_CSS_UNCHANGED = YES
```

If CSS changes, STOP and do not hide/revert unrelated changes without reporting them.

## 7. Explicitly Forbidden

- NO Kintone POST/PUT/DELETE;
- NO App794 customization upload/update/deploy;
- NO rollback;
- NO App794 record write;
- NO App801 write/reset/delete;
- NO App53/795/796 write;
- NO group/ACL change;
- NO D2-D7 implementation;
- NO UAT;
- NO new feature/UI polish;
- NO broad refactor;
- NO new planning/docs package.

## 8. Delivery

Commit only the necessary source/build/test changes and regenerated `dist/mbo-employee-app.js`.

Do not modify Baseline, Control Center, or Active Task.
Do not commit secrets or live file downloads.

Push one concise corrective commit and STOP.

Final executor report <= 15 lines and include:

```text
COMMIT_SHA
FILES_CHANGED
UI_BUILD_RESULT
NPM_TEST_RESULT
AUTH_ADAPTER_DEFINITION_COUNT
LOGIN_GATE_DEFINITION_COUNT
AUTH_RUNTIME_RESOLUTION_TEST
EMPLOYEE_CODE_SPECIAL_FORMAT_TESTS
DIST_CSS_UNCHANGED
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
SOURCE_CORRECTIVE_STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Maximum status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP after push. ChatGPT performs the next independent review before any corrective deploy is considered.
