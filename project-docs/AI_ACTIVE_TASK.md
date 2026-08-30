# AI ACTIVE TASK — D1 LOCAL UI BUILD VERIFICATION R2

Mode: **ANTIGRAVITY GENERATED BUILD ONLY — NO SOURCE/TEST EDITS / NO LIVE KINTONE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Opened after accepted async test-contract corrective: `a206e8be47ac2e7a5ffe2e7eac5dddc25ea9d6fb`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
```

Fresh-fetch the branch first. If another executor commit already exists after this task was written, STOP and return control to ChatGPT instead of repeating work.

## 0. Goal

Build the local App794 employee UI bundle from the accepted D1 source and verify that only canonical generated dist outputs change.

This is not a source implementation task.
This is not a test corrective task.
This is not a deploy task.

## 1. Absolute source/test freeze

Do NOT modify:

```text
src/**
tests/**
services/**
scripts/**
project-docs/**
package.json
package-lock.json
```

No source or test corrective is authorized.

## 2. Run exactly

### Step A — local UI build

```text
npm run ui:build
```

Canonical build script may generate/change only:

```text
dist/mbo-employee-app.js
dist/mbo-employee.css
```

If build fails, STOP and report. Do not fix source, tests, scripts or dependencies.

### Step B — generated scope check

Run:

```text
git status --short
git diff --check
```

Required:
- no changed file outside the two canonical dist outputs;
- `git diff --check` PASS.

If another file differs, STOP and report the exact scope leak. Do not clean it up by editing source/tests.

If one of the dist files is byte-identical and not listed, that is acceptable.

## 3. Commit rule

If build PASS + diff check PASS + changed-file scope valid:
- if generated dist changed, commit + push exactly one generated-build commit;
- if generated dist is unchanged, do not create an empty commit;
- STOP immediately.

Do not continue into deploy, Live Kintone configuration or UAT.

## 4. Explicitly forbidden

```text
SOURCE CHANGE                     = NO
TEST CHANGE                       = NO
SERVICE CHANGE                    = NO
SCRIPT CHANGE                     = NO
PROJECT-DOC CHANGE BY EXECUTOR    = NO
npm test                          = NO
npm install / npm ci              = NO
LIVE KINTONE GET/WRITE            = NO
APP53 ACCESS/WRITE                = NO
ACL/GROUP CHANGE                  = NO
DEPLOY                            = NO
UAT                               = NO
CONNECTION TEST                   = NO
SANDBOX WRITE                     = NO
```

No Live authorization exists.

## 5. Required response only

```text
UI_BUILD = PASS/FAIL
GIT_DIFF_CHECK = PASS/FAIL/NOT_RUN
CHANGED_FILES = exact list
GENERATED_BUILD_COMMIT = <sha> / NONE
SOURCE_FILES_CHANGED = 0
TEST_FILES_CHANGED = 0
LIVE_KINTONE_OPERATIONS = 0
APP53_PRODUCTION_TOUCHED = NO
DEPLOY_RUN = NO
```

Next owner = ChatGPT independent review.
