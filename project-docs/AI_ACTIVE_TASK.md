# AI ACTIVE TASK — D1 FULL REGRESSION FAILURE TRIAGE R1

Mode: **ANTIGRAVITY DIAGNOSTIC ONLY — EXTRACT 4 FAILURES / NO SOURCE OR TEST EDITS / NO BUILD / NO LIVE KINTONE**
Branch: `ai/antigravity-wp002c`
Opened after pre-deploy verification result: `FULL_TEST = FAIL (1034 passed / 4 failed / 1038 total)`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / DIAGNOSTIC_ONLY
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT ROOT-CAUSE REVIEW
```

Fresh-fetch the branch first.

## 0. Goal

Identify exactly which four tests failed in the immediately prior full regression and capture enough failure evidence for ChatGPT to decide the smallest corrective.

This task does NOT authorize any fix.

## 1. Preferred path — reuse existing output

If the immediately prior `npm test` terminal/chat output is still available, DO NOT rerun the suite.

Extract exactly the four failure blocks and return for each:
- exact test/subtest name;
- test file path;
- line/column if shown;
- assertion/error type;
- expected vs actual if shown;
- first useful stack/error lines sufficient to locate the failure.

Do not provide a broad repository report.

## 2. Fallback only if prior output is unavailable

If the prior failure output can no longer be recovered, run exactly once:

```text
npm test
```

Purpose is only to recover the four failure blocks.

Do NOT run any other test command.
Do NOT run build.

## 3. Absolute freeze

Do NOT modify:

```text
src/**
tests/**
services/**
scripts/**
project-docs/**
dist/**
package.json
package-lock.json
```

Do NOT:
- fix a failing test;
- change an assertion;
- change source behavior;
- run `npm run ui:build`;
- access Live Kintone;
- access App53;
- run connection tests;
- deploy;
- change ACL/groups;
- perform UAT;
- create a commit.

## 4. Stop rule

After the exact four failure blocks are identified, STOP immediately and return control to ChatGPT.

If the rerun produces a different failure count, report both the prior known result and the new exact result; do not investigate further.

## 5. Required response only

```text
PRIOR_FULL_TEST = FAIL (1034 passed / 4 failed / 1038 total)
RERUN = NO / YES
RERUN_RESULT = NOT_RUN / exact result

FAILURE_1
TEST = ...
FILE = ...
LOCATION = ...
ERROR = ...
EXPECTED = ... / N/A
ACTUAL = ... / N/A
USEFUL_STACK = ...

FAILURE_2
...

FAILURE_3
...

FAILURE_4
...

FILES_CHANGED = NONE
BUILD_RUN = NO
LIVE_KINTONE_OPERATIONS = 0
APP53_PRODUCTION_TOUCHED = NO
DEPLOY_RUN = NO
```

Next owner = ChatGPT root-cause review.
