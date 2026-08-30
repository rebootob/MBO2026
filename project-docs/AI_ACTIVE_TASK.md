# AI ACTIVE TASK — D1 MY APPROVAL TASKS — GATE 1 TEST EVIDENCE CORRECTIVE R1

Mode: **ANTIGRAVITY MINIMUM TEST CORRECTION ONLY — 1 FILE / NO SOURCE IMPLEMENTATION CHANGE / ONE FOCUSED TEST / NO BUILD / NO FULL TEST / NO LIVE KINTONE**
Branch: `ai/antigravity-wp002c`
Review target: `cb2fae671e610924e7143806944b3dcdf527f2f0`
Updated: 2026-08-30

```text
TASK_STATE = CORRECTIVE / READY_FOR_EXECUTION
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
```

Fresh-fetch the branch before execution. If another executor correction already exists after this task was written, STOP and hand it to ChatGPT for review instead of repeating work.

## 0. Goal

Close only the independent-review test-evidence gap for D1 Home/Index Gate 1.

The implementation candidate in commit `cb2fae671e610924e7143806944b3dcdf527f2f0` is not being reopened by default. The corrective is required because the existing focused integration test does not directly assert that `My MBO` remains rendered in three required scenarios.

Do not rediscover architecture. Do not refactor implementation. Do not proceed to Gate 2 or Gate 3.

## 1. Exact allowed file

MODIFY ONLY:

```text
tests/employee-main-mbo-app-integration.test.js
```

No other file may change.

## 2. Required corrective assertions

Keep all existing Gate 1 assertions. Add the minimum direct DOM assertions needed to prove:

### A. DEDICATED normal Index

After the existing `vassana` Dedicated Index render:
- `[data-mbo-custom-index]` exists;
- `[data-mbo-title]` exists and truthfully represents `MBO ของฉัน / My MBO`;
- existing approval-task assertions remain unchanged.

### B. SHARED Index

After the existing Shared Index render:
- `[data-mbo-custom-index]` exists;
- `[data-mbo-title]` exists and truthfully represents `MBO ของฉัน / My MBO`;
- approval query count remains `0`;
- `.mbo-approval-tasks-section` remains absent.

### C. DEDICATED approval-fetch error

After forcing the existing approval fetch error:
- `[data-mbo-custom-index]` still exists;
- `[data-mbo-title]` still exists and truthfully represents `MBO ของฉัน / My MBO`;
- `.mbo-approval-tasks-error-state` exists;
- no actionable approval task link/table from the failed fetch is exposed.

Use the existing mock DOM capabilities if sufficient. Do not redesign the test harness unless a tiny change is strictly necessary for these assertions.

## 3. Preserve the accepted Gate 1 implementation candidate

Do NOT modify:

```text
src/main-mbo-app.js
src/ui/approver-task-index-ui.js
src/services/mbo-approval-task-service.js
src/ui/employee-self-index-ui.js
```

Do not weaken/remove existing assertions. If the new direct My MBO assertions expose an actual implementation defect, STOP and report it to ChatGPT instead of widening this corrective.

## 4. Run only

```text
node --test tests/employee-main-mbo-app-integration.test.js
git diff --check
```

Do NOT run any other test.

## 5. Explicitly forbidden

```text
SOURCE IMPLEMENTATION CHANGE                     = NO
PROJECT-DOC CHANGE BY EXECUTOR                   = NO
DIST CHANGE                                      = NO
CROSS_EMPLOYEE_DETAIL_AUTHORITY                  = NO
PROCESS_PROCEED_REVALIDATION                     = NO
npm test                                         = NO
npm run ui:build                                 = NO
LIVE KINTONE GET                                 = NO
LIVE KINTONE WRITE                               = NO
APP53 ACCESS                                     = NO
ACL/GROUP/DEPLOY                                 = NO
```

No Live Kintone authorization exists.

## 6. Finish

If the focused test and `git diff --check` pass:
- commit + push one focused correction;
- STOP immediately.

Final executor response only:

```text
COMMIT_SHA = ...
CHANGED_FILES = tests/employee-main-mbo-app-integration.test.js ONLY
FOCUSED_TEST = PASS/FAIL + count
GIT_DIFF_CHECK = PASS/FAIL
SOURCE_IMPLEMENTATION_CHANGED = NO
FULL_TEST_RUN = NO
BUILD_RUN = NO
LIVE_KINTONE_OPERATIONS = 0
APP53_PRODUCTION_TOUCHED = NO
```

Next owner = ChatGPT independent review.
