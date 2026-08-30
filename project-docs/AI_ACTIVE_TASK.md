# AI ACTIVE TASK — D1 HYBRID RUNTIME — LEGACY SHARED TEST FIXTURE COMPATIBILITY R1

Mode: **ANTIGRAVITY TEST-FIXTURE ONLY — NO SOURCE EDIT / NO FULL TEST / NO BUILD / NO LIVE KINTONE**  
Branch: `ai/antigravity-wp002c`

## 0. Goal

The Hybrid runtime source logic is already PASS.

The source-acceptance milestone stopped because legacy tests still model numeric/prefix native Kintone principals as if they were SHARED. Correct only those test fixtures so they match the confirmed exact SHARED-principal contract.

Do not inspect broadly. Do not change source. Do not run full `npm test`. Do not build.

## 1. Exact allowed test files — only 3

### A. `tests/timeline-truthfulness-and-attachment.test.js`

This test is a Shared MBO-login fixture.

Change only the mocked native Kintone principal:
```text
getLoginUser code: 0118 -> f1
```

Keep:
```text
MBO Employee_Code = 0118
mboLoginGate.requireLogin() -> 0118
```

Do not alter attachment/timeline assertions or business behavior.

### B. `tests/objective-save-validation.test.js`

This is also a Shared MBO-login fixture. `req1` must not rely on the removed `req*` heuristic.

Change the Shared principal fixture consistently:
```text
native getLoginUser: req1 -> s1
App795 Requester_User fixture: req1 -> s1
corresponding Requester_User assertion: req1 -> s1
```

Keep Employee_Code `0118` unchanged.

No other assertion/business change.

### C. `tests/create-handler-form-state.test.js`

This file tests compiled-bundle Shared login behavior. Separate native Kintone principal from MBO Employee_Code.

Success-path fixture:
```text
native getLoginUser: 0113 -> s1
App801 Employee_Code: keep 0113
App801 Session_Kintone_User: 0113 -> s1
App795 Requester_User: 0113 -> s1
final Requester_User assertion: 0113 -> s1
```

Failure-path fixture:
```text
native getLoginUser: 9999 -> s1
App801 Employee_Code: keep 9999
App801 Session_Kintone_User: 9999 -> s1
```

Keep the intended failure reason: Employee_Code `9999` lookup in App53 returns no employee. Do not turn this into a dedicated-mapping failure test.

Keep all other logic/assertions unchanged.

## 2. Everything else read-only

Do not modify:
```text
src/**
dist/**
config/**
project-docs/**
all other tests
```

No evidence markdown.

## 3. Verification — focused only

Run only:
```text
node --test tests/timeline-truthfulness-and-attachment.test.js
node --test tests/objective-save-validation.test.js
git diff --check
```

Do NOT run `tests/create-handler-form-state.test.js` in this corrective because it reads the checked-in dist bundle; the final milestone will build first and then test that generated bundle.

Do NOT run:
```text
npm test
npm run ui:build
```

If either focused source-import test fails for a reason beyond the exact fixture substitutions above, STOP and report. Do not expand scope.

## 4. App53 / Live hard stop

```text
LIVE_GET = 0
LIVE_POST = 0
LIVE_PUT = 0
LIVE_DELETE = 0
APP53_SCHEMA_WRITE = 0
APP53_RECORD_WRITE = 0
APP53_BULK_WRITE = 0
ACL_WRITE = 0
GROUP_WRITE = 0
DEPLOY = 0
```

Mocks/fixtures only. No Kintone access.

## 5. Finish

After the two focused tests and diff check pass:
1. verify diff contains exactly the three allowed test files;
2. commit one fixture-only commit;
3. push;
4. STOP.

Final response only:
- commit SHA;
- changed files;
- timeline focused result;
- objective focused result;
- `git diff --check = PASS/FAIL`;
- `SOURCE_CHANGES = 0`;
- `LIVE_KINTONE_OPERATIONS = 0`;
- `APP53_PRODUCTION_TOUCHED = NO`.

Next owner = ChatGPT independent review.