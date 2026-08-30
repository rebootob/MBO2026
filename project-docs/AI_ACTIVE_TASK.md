# AI ACTIVE TASK — D1 MY APPROVAL TASKS — GATE 2 UI-PIPELINE TEST EVIDENCE CORRECTIVE R1

Mode: **ANTIGRAVITY MINIMUM TEST CORRECTION ONLY — 1 FILE / NO SOURCE IMPLEMENTATION CHANGE / ONE FOCUSED TEST / NO BUILD / NO FULL TEST / NO LIVE KINTONE**
Branch: `ai/antigravity-wp002c`
Review target: `19b81fa01b337835fbff8af2dc21622aba4eb9e6`
Updated: 2026-08-30

```text
TASK_STATE = CORRECTIVE / READY_FOR_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
```

Fresh-fetch the branch before execution. If another executor correction already exists after this task was written, STOP and hand it to ChatGPT for review instead of repeating work.

## 0. Goal

Close only the independent-review test-evidence gap for D1 Gate 2 Dedicated cross-employee Detail authority.

The source implementation candidate in commit `19b81fa01b337835fbff8af2dc21622aba4eb9e6` is not being reopened by default. The corrective is required because the current focused integration test proves fresh GET counts and handler returns, but does not directly prove entry/non-entry into the target Detail UI pipeline.

Do not rediscover architecture. Do not refactor implementation. Do not proceed to Gate 3.

## 1. Exact allowed file

MODIFY ONLY:

```text
tests/employee-main-mbo-app-integration.test.js
```

No other file may change.

## 2. Required corrective evidence

Keep all existing Gate 2 assertions. Add the minimum direct evidence needed to prove UI-pipeline entry boundaries.

Use the existing exported `getActiveUiInstance()` seam from `src/main-mbo-app.js` if practical; do not modify source merely to expose another seam.

### A. Authorized Dedicated cross-employee Detail

Before invoking the authorized cross-employee Detail handler:
- capture the current active UI instance.

After the handler:
- prove a new target `EmployeePartAUI` instance was created/activated for the target Detail;
- prove that instance is bound to the exact `authorizedCrossEvent.record` (or equivalent exact target record object);
- preserve existing assertion: fresh single-record GET count = exactly 1;
- preserve existing assertion: bound Employee-Self context remains `employeeCode = 0044`, `kintoneUserCode = vassana`.

Do not treat `handlerResult === event` alone as proof of UI entry.

### B. Denied/error cross-employee Detail paths

For each of these existing paths:
- fresh Assignee mismatch (including static Manager/GM fields matching `vassana`);
- revalidation API error;
- record not found;
- SHARED cross-employee Detail;
- DEDICATED cross-employee Edit;

capture the active UI instance immediately before the handler and prove the handler does **not** replace it with a UI instance bound to the denied target record.

Keep existing GET-count/App795/login-gate assertions.

A blocked notice assertion may remain, but `host.children.length > 0` alone is not sufficient evidence that target Detail UI was denied.

### C. Own Detail regression

Keep the existing proof that DEDICATED own Detail performs 0 approval revalidation GETs. Do not change own-record behavior.

## 3. Preserve Gate 2 source candidate

Do NOT modify:

```text
src/main-mbo-app.js
src/services/mbo-approval-task-service.js
src/ui/employee-part-a-ui.js
src/ui/employee-visibility.js
```

Do not weaken/remove existing assertions.

If the new direct pipeline assertions expose an actual source defect, STOP and report it to ChatGPT instead of widening this corrective.

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
CROSS_EMPLOYEE_EDIT_AUTHORITY                    = NO
PROCESS_PROCEED_REVALIDATION                     = NO
PROCESS ACTION AUTHORITY                         = NO
STATIC APP795/ROUTE AUTHORITY FALLBACK           = NO
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
