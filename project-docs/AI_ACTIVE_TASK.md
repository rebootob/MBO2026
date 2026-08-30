# AI ACTIVE TASK — D1 MY APPROVAL TASKS — GATE 2 DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY R1

Mode: **ANTIGRAVITY MINIMUM SOURCE INTEGRATION ONLY — DETAIL AUTHORITY ONLY / 2 FILES / ONE FOCUSED TEST / NO BUILD / NO FULL TEST / NO LIVE KINTONE**
Branch: `ai/antigravity-wp002c`
Opened from accepted HEAD: `02aa2676807a93b9c15564ee19be75c662aed92f`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
```

Fresh-fetch the branch before execution. If another executor commit already exists after this task was written, STOP and hand it to ChatGPT for review instead of repeating work.

## 0. Goal

Implement only Gate 2: allow a **DEDICATED** current native Kintone assignee to open another employee's App794 **Detail** page after fresh current-assignee revalidation, while preserving the user's own Employee-Self identity.

Accepted authority service — reuse directly, do not modify:

```text
src/services/mbo-approval-task-service.js
MboApprovalTaskService.revalidateApprovalTask(context, appId, recordId, kintoneApiWrapper)
accepted service commit = 5ac5ede6e40a1462f0398ba8740330742041e3bf
```

This Gate does NOT authorize cross-employee Edit and does NOT implement Process Proceed/action authority. Gate 3 remains separate.

## 1. Exact allowed files

MODIFY ONLY:

```text
src/main-mbo-app.js
tests/employee-main-mbo-app-integration.test.js
```

No new file. No other file may change.

## 2. Required runtime behavior

### A. Own MBO path remains unchanged

If `record.Employee_Code === resolvedContext.employeeCode`:
- use the existing own-record Detail/Edit behavior;
- do NOT call `revalidateApprovalTask()` merely because the user is Dedicated;
- do not change `My MBO` ownership semantics.

### B. Dedicated cross-employee Detail — fresh revalidation required

Only when ALL are true:

```text
Event = app.record.detail.show
Context.mode = DEDICATED
record.Employee_Code != context.employeeCode
```

then:
1. determine the exact current record id from `event.recordId` or `record.$id.value`;
2. call `MboApprovalTaskService.revalidateApprovalTask(context, appId, recordId, kintoneApiWrapper)` exactly once;
3. allow the Detail UI pipeline only when result is exactly `authorized === true`;
4. if denied, malformed, record missing, id missing, or API/revalidation throws -> FAIL CLOSED and render the existing blocked-notice pattern;
5. do not use App795, Manager_User, GM_User, First_Manager_User, role strings, Employee_Code ownership, or UI visibility as approval authority.

The fresh service result is authority evidence. Do not implement a second Assignee validator in `main-mbo-app.js`.

### C. Preserve bound Employee-Self identity

Opening an authorized approval task for another employee must NOT replace the current user's bound Employee-Self context.

Example:

```text
Dedicated user = vassana
Bound own Employee_Code = 0044
Target approval record Employee_Code = 0118

During target Detail:
currentEmployeeSelfContext must remain:
{ mode: DEDICATED, employeeCode: 0044, kintoneUserCode: vassana }
```

Do not bind Employee-Self to target record Employee_Code. Returning Home must still mean Vassana's own `My MBO`.

### D. Minimal ownership-guard bypass only

Current `setupRecordUiWithAuth()` blocks every non-owner record. Modify the smallest seam needed so this ownership block may be bypassed ONLY when an explicit internal flag proves:

```text
isDetail === true
context.mode === DEDICATED
fresh approval-task revalidation already returned authorized === true
```

The flag must never be derived from static record user fields or UI role calculation.

### E. Shared stays denied

For `SHARED` context with a different `Employee_Code`:
- existing cross-employee ownership denial remains;
- zero approval revalidation GET;
- zero approval authority.

### F. Cross-employee Edit stays denied

`app.record.edit.show` for another employee remains blocked even for a Dedicated current assignee.

Gate 2 is Detail-only. Do not widen it to Edit.

### G. No static fallback

A record may contain `Manager_User`, `GM_User`, `First_Manager_User`, or other snapshot fields matching the current user and still MUST be denied if fresh `Assignee` revalidation does not authorize.

## 3. Focused integration test only

Modify only `tests/employee-main-mbo-app-integration.test.js` and keep all existing assertions.

Add the minimum test harness support for fresh single-record GET and prove:

1. DEDICATED own Detail still opens through existing path and performs **0** approval revalidation GETs;
2. DEDICATED cross-employee Detail with fresh `STATUS_ASSIGNEE` containing exact `vassana` performs exactly **1** fresh GET and is allowed into the UI pipeline;
3. after that authorized cross-employee Detail, bound Employee-Self context remains `employeeCode = 0044`, `kintoneUserCode = vassana`;
4. DEDICATED cross-employee Detail with fresh Assignee mismatch is blocked;
5. a static snapshot field matching `vassana` does NOT override fresh Assignee mismatch;
6. fresh revalidation API failure/record-not-found fails closed and does not open target Detail UI;
7. SHARED cross-employee Detail remains blocked and performs **0** approval revalidation GETs;
8. DEDICATED cross-employee Edit remains blocked and performs **0** approval revalidation GETs;
9. Gate 2 path introduces **0 App795 queries** and valid Dedicated path introduces **0 MBO login-gate calls**.

Use the existing integration harness. Do not create a new test file.

Run only:

```text
node --test tests/employee-main-mbo-app-integration.test.js
git diff --check
```

Do NOT run any other test.

## 4. Explicitly forbidden

```text
MODIFY src/services/mbo-approval-task-service.js = NO
MODIFY src/ui/approver-task-index-ui.js          = NO
MODIFY src/ui/employee-self-index-ui.js          = NO
MODIFY src/ui/employee-part-a-ui.js              = NO
MODIFY src/ui/employee-visibility.js             = NO
MODIFY routing/identity/auth/session services    = NO
MODIFY project-docs/**                           = NO
MODIFY dist/**                                   = NO
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

Do not refactor adjacent code or change workflow/routing/scoring semantics. Do not claim deploy readiness after Gate 2.

## 5. Stop conditions

STOP without expanding scope if:
- Gate 2 cannot fit the 2 allowed files;
- accepted `MboApprovalTaskService.revalidateApprovalTask()` would need modification;
- cross-employee Edit is required to make the test pass;
- Process handler changes appear necessary;
- an unrelated file/test needs modification;
- the corrected test exposes a broader UI/authority design defect.

## 6. Finish

If focused test + `git diff --check` pass:
- commit + push one focused commit;
- STOP immediately.

Final executor response only:

```text
COMMIT_SHA = ...
CHANGED_FILES = src/main-mbo-app.js + tests/employee-main-mbo-app-integration.test.js ONLY
FOCUSED_TEST = PASS/FAIL + count
GIT_DIFF_CHECK = PASS/FAIL
FULL_TEST_RUN = NO
BUILD_RUN = NO
LIVE_KINTONE_OPERATIONS = 0
APP53_PRODUCTION_TOUCHED = NO
```

Next owner = ChatGPT independent review.
