# AI ACTIVE TASK — D1 MY APPROVAL TASKS — GATE 3 PROCESS.PROCEED FRESH ASSIGNEE REVALIDATION R1

Mode: **ANTIGRAVITY MINIMUM SOURCE INTEGRATION ONLY — PROCESS ACTION AUTHORITY ONLY / 2 FILES / ONE FOCUSED TEST / NO BUILD / NO FULL TEST / NO LIVE KINTONE**
Branch: `ai/antigravity-wp002c`
Opened after accepted Gate 2 HEAD: `216bb7ebdf13fac7dfa91e7f3d31b72ea5617ca0`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
```

Fresh-fetch the branch before execution. If another executor commit already exists after this task was written, STOP and hand it to ChatGPT for review instead of repeating work.

## 0. Goal

Implement only Gate 3: fresh current-native-Assignee revalidation immediately before a **DEDICATED cross-employee** App794 Process action may proceed.

Reuse directly — do not modify:

```text
src/services/mbo-approval-task-service.js
MboApprovalTaskService.revalidateApprovalTask(context, appId, recordId, kintoneApiWrapper)
accepted service commit = 5ac5ede6e40a1462f0398ba8740330742041e3bf
```

Gate 3 is Process Proceed/action authority only. Do not reopen Home/Index or Detail authorization and do not perform Kintone configuration/deploy work.

## 1. Exact allowed files

MODIFY ONLY:

```text
src/main-mbo-app.js
tests/employee-main-mbo-app-integration.test.js
```

No new file. No other file may change.

## 2. Runtime contract

Target handler:

```text
app.record.detail.process.proceed
```

### A. Preserve existing business validation

Keep existing:
- `ValidationEngine.validateWorkflowAction(record, actionName, stage)`;
- `ValidationEngine.validate(record, stage)`;
- existing validation errors and `false` behavior.

Do not change workflow topology, scoring, routing or action semantics.

### B. Identify Employee-Self action context from existing page memory

Use the already-resolved `currentEmployeeSelfContext` only.

Do NOT call App53 / identity resolver again from Process Proceed.

Define cross-employee only when all are true:

```text
currentEmployeeSelfContext exists
record.Employee_Code is nonblank
currentEmployeeSelfContext.employeeCode is nonblank
record.Employee_Code.value !== currentEmployeeSelfContext.employeeCode
```

### C. Dedicated cross-employee Process action — fresh revalidation required

When:

```text
context.mode === 'DEDICATED'
isCrossEmployee === true
```

then before the transition is allowed to return `event`:
1. resolve exact App794 id from `event.recordId` or `record.$id.value`;
2. missing id -> fail closed (`false`);
3. call `MboApprovalTaskService.revalidateApprovalTask(context, appId, recordId, kintoneApiWrapper)` exactly once;
4. continue only when the result exists and `authorized === true`;
5. denied/malformed/record-not-found/API throw -> fail closed (`false`);
6. show a safe bilingual/system validation message through the existing validation UI if practical, but do not expose static-route authority claims;
7. do not mutate Employee-Self identity or bind it to target `Employee_Code`.

Do not implement another Assignee validator in `main-mbo-app.js`.

### D. Shared cross-employee Process action — denied

When:

```text
context.mode === 'SHARED'
isCrossEmployee === true
```

return `false` with zero approval revalidation GETs.

Shared principals never gain Approver authority.

### E. Own-MBO requester actions remain unchanged

When record Employee_Code equals bound Employee-Self Employee_Code:
- DEDICATED own-MBO Process action -> existing validation/return behavior;
- SHARED own-MBO Process action -> existing validation/return behavior;
- approval revalidation GET count = 0.

Examples such as requester-owned `Start Mid-Year` / `Start Self Evaluation` must not be forced through Approver authority service.

### F. No Employee-Self context remains outside this Gate

When `currentEmployeeSelfContext` is null/absent:
- do not call approval revalidation;
- preserve the pre-Gate-3 Process validation behavior;
- do not turn Gate 3 into a new global HR/admin authorization engine.

Native Kintone Process/permission rules and separately governed HR/admin controls remain authoritative for those contexts.

### G. No static fallback

Never authorize from:
- App795 membership;
- `Manager_User`;
- `GM_User`;
- `First_Manager_User`;
- `Requester_User` for cross-employee Approver authority;
- action names;
- role strings;
- UI visibility;
- current Detail having been authorized earlier.

Gate 2 Detail authorization is not reusable as Gate 3 action authorization. The Process action must fresh-check again.

## 3. Focused integration test only

Modify only the existing:

```text
tests/employee-main-mbo-app-integration.test.js
```

Keep all existing Gate 1/2 assertions. Reuse the existing single-record GET harness where possible.

Add minimum direct tests for the registered `app.record.detail.process.proceed` handler:

1. **DEDICATED own requester action**
   - context: `vassana / employeeCode 0044`;
   - own record Employee_Code `0044`;
   - use a valid requester-owned action/fixture (for example canonical `05 Objective Approved` + `Start Mid-Year` with required routing/requester fields);
   - existing validation path succeeds;
   - result = event;
   - approval revalidation GETs = 0.

2. **SHARED own requester action**
   - valid SHARED context + same Employee_Code;
   - existing requester action succeeds;
   - approval revalidation GETs = 0.

3. **DEDICATED cross-employee valid current Assignee**
   - context remains `vassana / 0044`;
   - target record belongs to another employee;
   - use a valid approver-stage/action fixture, e.g. canonical `03 Manager Objective Review` + `Approve Objective`, `M1_G1`, with sufficient record fields for existing validations;
   - fresh GET returns `Assignee.type = STATUS_ASSIGNEE` with exact `vassana`;
   - exactly 1 fresh GET;
   - handler returns event;
   - bound Employee-Self context remains `0044 / vassana`.

4. **Fresh Assignee mismatch**
   - same valid cross-employee process fixture;
   - fresh GET Assignee is another user;
   - static `Manager_User` / `First_Manager_User` / `GM_User` may still contain `vassana`;
   - exactly 1 fresh GET;
   - handler returns `false`.

5. **Fresh revalidation API failure**
   - exactly 1 attempted fresh GET;
   - handler returns `false`.

6. **Record missing / malformed revalidation result**
   - exactly 1 fresh GET where applicable;
   - handler returns `false`.

7. **Missing record id**
   - DEDICATED cross-employee valid process fixture without `event.recordId` and `$id`;
   - 0 fresh GETs;
   - handler returns `false`.

8. **SHARED cross-employee action**
   - handler returns `false`;
   - 0 approval revalidation GETs.

9. **No Employee-Self context regression**
   - preserve pre-Gate-3 behavior on a valid existing/native-governed Process fixture;
   - 0 approval revalidation GETs.

10. Gate 3 introduces:
   - 0 App795 authority queries;
   - 0 MBO login-gate calls;
   - 0 Employee-Self identity mutation.

Do not weaken/remove existing tests.

## 4. Run only

```text
node --test tests/employee-main-mbo-app-integration.test.js
git diff --check
```

Do NOT run any other test.

## 5. Explicitly forbidden

```text
MODIFY src/services/mbo-approval-task-service.js = NO
MODIFY src/ui/**                                  = NO
MODIFY routing/identity/auth/session services    = NO
MODIFY project-docs/**                           = NO
MODIFY dist/**                                   = NO
HOME_INDEX_CHANGE                                = NO
DETAIL_AUTHORITY_CHANGE                          = NO
CROSS_EMPLOYEE_EDIT_AUTHORITY                    = NO
STATIC APP795/ROUTE AUTHORITY FALLBACK           = NO
GLOBAL HR/ADMIN AUTHORITY ENGINE                 = NO
npm test                                         = NO
npm run ui:build                                 = NO
LIVE KINTONE GET                                 = NO
LIVE KINTONE WRITE                               = NO
APP53 ACCESS                                     = NO
ACL/GROUP/DEPLOY                                 = NO
```

No Live Kintone authorization exists.

## 6. Stop conditions

STOP without expanding scope if:
- Gate 3 cannot fit the two allowed files;
- accepted `revalidateApprovalTask()` would need modification;
- a new service/UI file appears necessary;
- requester actions would have to be routed through Approver authority;
- HR/admin behavior would need redesign;
- another test/source file is required;
- focused test exposes a broader authority/workflow defect.

## 7. Finish

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
