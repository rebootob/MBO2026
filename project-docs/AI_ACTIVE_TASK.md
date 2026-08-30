# AI ACTIVE TASK — D1 HYBRID EMPLOYEE-SELF RUNTIME R1 — LEAN TREE CLEANUP R3

Mode: **ANTIGRAVITY EXACT GIT RESTORE ONLY — NO SOURCE LOGIC CHANGE / NO TEST RUN / NO BUILD / NO LIVE KINTONE**  
Branch: `ai/antigravity-wp002c`

## 0. Goal

Source logic at:
```text
4a35988a3fc2206849456fbfbef90086d4efd002
```
passes ChatGPT independent logic review.

This task is **cleanup only**. Do not edit source logic. Do not add tests. Do not run tests. Do not build.

## 1. Exact restore only

Restore these five files exactly from Control Plane base:
```text
248174b67735a26318bbeadf8e341f8a3db31708
```

Paths:
```text
dist/mbo-employee-app.js
tests/classic-bundle.test.js
tests/create-handler-form-state.test.js
tests/objective-save-validation.test.js
tests/timeline-truthfulness-and-attachment.test.js
```

Use git restore/content restoration only. Do not manually redesign them.

Equivalent command:
```text
git restore --source=248174b67735a26318bbeadf8e341f8a3db31708 -- \
  dist/mbo-employee-app.js \
  tests/classic-bundle.test.js \
  tests/create-handler-form-state.test.js \
  tests/objective-save-validation.test.js \
  tests/timeline-truthfulness-and-attachment.test.js
```

## 2. Do NOT touch anything else

Read-only / no change:
```text
src/main-mbo-app.js
src/services/mbo-identity-service.js
src/services/employee-service.js
src/security/delete-guard-policy.js
tests/d1-hybrid-identity-core-source.test.js
tests/employee-main-mbo-app-integration.test.js
tests/hr-control-center-reset-ui.test.js
project-docs/AI_CONTROL_CENTER.md
project-docs/AI_ACTIVE_TASK.md
all Baselines / Joblist / skills
```

The prior over-scope evidence file is already deleted. Do not recreate it.

Keep HR reset test at exact blob:
```text
eb2a3cdfb6bee6a6d67f15cc3210f139a1635756
```

## 3. Verification — no tests

Run only:
```text
git diff --check
```

Then verify the five restored paths have zero diff against base:
```text
git diff --exit-code 248174b67735a26318bbeadf8e341f8a3db31708 -- \
  dist/mbo-employee-app.js \
  tests/classic-bundle.test.js \
  tests/create-handler-form-state.test.js \
  tests/objective-save-validation.test.js \
  tests/timeline-truthfulness-and-attachment.test.js
```

Expected exit code = 0.

Do NOT run:
```text
node --test ...
npm test
npm run ui:build
```

## 4. App53 Production hard stop

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

No Kintone access of any kind.

## 5. Finish

1. exact restore five files;
2. `git diff --check`;
3. verify five paths equal base;
4. commit one cleanup commit;
5. push;
6. STOP.

Final response only:
- commit SHA;
- restored 5 files;
- `git diff --check = PASS`;
- `RESTORED_PATHS_EQUAL_BASE = YES`;
- `TESTS_RUN = 0`;
- `BUILD_RUN = 0`;
- `LIVE_KINTONE_OPERATIONS = 0`;
- `APP53_PRODUCTION_TOUCHED = NO`.

Next owner = ChatGPT independent review.
