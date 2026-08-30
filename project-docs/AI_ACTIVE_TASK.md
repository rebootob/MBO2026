# AI ACTIVE TASK — D1 PRE-DEPLOY FULL REGRESSION + LOCAL UI BUILD VERIFICATION R1

Mode: **ANTIGRAVITY VERIFICATION / GENERATED BUILD ONLY — NO SOURCE OR TEST EDITS / FULL TEST FIRST / LOCAL BUILD ONLY / NO LIVE KINTONE**
Branch: `ai/antigravity-wp002c`
Opened after accepted D1 Gate 3 control HEAD: `ed2078169ffdfb8105af1c522a2ef1a88e60ea56`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
```

Fresh-fetch the branch before execution. If another executor commit already exists after this task was written, STOP and return control to ChatGPT instead of repeating work.

## 0. Goal

Verify the accepted D1 source integration (Gates 1–3) across the full repository regression suite, then build the local App794 UI bundle from accepted source.

This is NOT a source implementation task.
This is NOT a deploy task.
This is NOT permission for Live Kintone, App53, ACL/group, or UAT operations.

## 1. Source/test freeze

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

No source corrective is authorized in this task.

If any test fails, STOP and report the failure to ChatGPT. Do not fix it.

## 2. Execution order — fail fast

### Step A — Full regression first

Run exactly:

```text
npm test
```

Required:
- exit code 0;
- report exact pass/fail/test count from command output.

If `npm test` FAILS:
- STOP immediately;
- do NOT run build;
- do NOT modify source/tests;
- do NOT commit anything.

### Step B — Local UI build only after Step A PASS

Run exactly:

```text
npm run ui:build
```

Canonical build script produces:

```text
dist/mbo-employee-app.js
dist/mbo-employee.css
```

Only these generated outputs may change.

### Step C — Generated-scope verification

Run:

```text
git status --short
git diff --check
```

Required scope after build:
- no changed file outside:
  - `dist/mbo-employee-app.js`
  - `dist/mbo-employee.css`

If any other file differs:
- STOP;
- do not clean up by editing source/tests;
- report scope leak to ChatGPT.

If one of the two dist files is byte-identical and therefore not listed as changed, that is acceptable.

## 3. Commit rule

If:
- `npm test` PASS;
- `npm run ui:build` PASS;
- `git diff --check` PASS;
- changed-file scope is only the canonical dist outputs;

then:
- if generated dist changed, commit + push exactly one focused generated-build commit;
- if generated dist is unchanged, do not create an empty commit;
- STOP immediately and return control to ChatGPT.

Do not continue to deploy or another work package.

## 4. Explicitly forbidden

```text
SOURCE CHANGE                          = NO
TEST CHANGE                            = NO
SERVICE CHANGE                         = NO
SCRIPT CHANGE                          = NO
PROJECT-DOC CHANGE BY EXECUTOR         = NO
npm install / npm ci                   = NO unless already-required dependency absence prevents execution; if so STOP and report instead
LIVE KINTONE GET                       = NO
LIVE KINTONE WRITE                     = NO
APP53 ACCESS                           = NO
APP53 WRITE                            = NO
ACL/GROUP CHANGE                       = NO
DEPLOY                                 = NO
UAT                                    = NO
SANDBOX WRITE                          = NO
CONNECTION TEST                        = NO
```

No Live authorization exists.

## 5. Finish response

Return only:

```text
FULL_TEST = PASS/FAIL + exact count
UI_BUILD = PASS/FAIL/NOT_RUN
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
