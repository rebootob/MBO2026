# AI ACTIVE TASK — D1 MY APPROVAL TASKS — LEAN HOME INDEX INTEGRATION R1

Mode: **ANTIGRAVITY MINIMUM SOURCE INTEGRATION ONLY — HOME/INDEX ONLY / 3 FILES / ONE FOCUSED TEST / NO BUILD / NO FULL TEST / NO LIVE KINTONE**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-08-30 20:45 ICT

```text
TASK_STATE = OPEN / READY_FOR_EXECUTION
EXECUTOR_COMMIT = NONE AT DOCUMENT-SYNC CHECKPOINT
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
```

**Fresh-fetch the branch before execution.** If an executor commit already exists after this document-sync checkpoint, STOP and hand it to ChatGPT for review instead of repeating the task.

## 0. Goal

Integrate the accepted current-assignee authority service into the App794 Home/Index only, while keeping `My MBO` and `My Approval Tasks` visibly and logically separate.

Accepted authority service:

```text
src/services/mbo-approval-task-service.js
commit 5ac5ede6e40a1462f0398ba8740330742041e3bf
```

Do NOT rediscover architecture. Do NOT scan broadly. Do NOT implement cross-employee Detail or Process action authority in this WP.

## 1. Exact allowed files

CREATE:

```text
src/ui/approver-task-index-ui.js
```

MODIFY:

```text
src/main-mbo-app.js
tests/employee-main-mbo-app-integration.test.js
```

No other file may change.

## 2. Required behavior

### A. Preserve My MBO unchanged

`EmployeeSelfIndexUI` remains the canonical My MBO owner.
Do NOT modify `src/ui/employee-self-index-ui.js`.
Do NOT change its Employee_Code ownership query, Create button, own-record list or shared-login behavior.

### B. Dedicated-only approval section

After `resolveRuntimeEmployeeSelfContext()` succeeds on `app.record.index.show`:

```text
SHARED
-> render existing My MBO only
-> DO NOT call MboApprovalTaskService.fetchApprovalTasks()
-> DO NOT render My Approval Tasks

DEDICATED
-> render existing My MBO
-> call MboApprovalTaskService.fetchApprovalTasks(
     resolvedContext,
     appId,
     kintoneApiWrapper
   )
-> render a separate My Approval Tasks section
```

Never infer Approver mode from Employee_Code, App795, `Manager_User`, `GM_User`, `First_Manager_User`, role strings or UI state.

### C. New ApproverTaskIndexUI is presentation only

Create a small `ApproverTaskIndexUI` renderer. It must:
- receive already-authorized task records from the service;
- perform NO Kintone API calls itself;
- perform NO App795 lookup;
- perform NO authority calculation;
- render separate bilingual heading `งานรอฉันอนุมัติ / My Approval Tasks`;
- show truthful pending count;
- render a simple deterministic list/table using safe DOM APIs / `textContent` for record-derived text;
- support empty state;
- support a safe load-error state supplied by main orchestration.

Useful display fields may be limited to Fiscal Year, Employee_Code/Employee_Name, Status, Record_Key and record id.
Do not add a role selector or employee selector.

A record link may point to normal App794 detail URL, but this WP does **not** authorize cross-employee Detail access. Gate 2 must be accepted before this source can be considered deploy-ready.

### D. Approval-query failure must not break My MBO

If Dedicated approval-task fetch throws/fails:
- fail closed for approval section;
- show no actionable task from the failed fetch;
- render bilingual error/empty-safe state;
- preserve already-rendered My MBO.

No App795/static fallback.

### E. No duplicate authority logic

Use accepted `MboApprovalTaskService.fetchApprovalTasks()` directly.
Do not reimplement `Assignee in (LOGINUSER())` or `STATUS_ASSIGNEE` validation in main/UI.

## 3. Focused integration test only

Modify only `tests/employee-main-mbo-app-integration.test.js` and prove:
1. DEDICATED `vassana` Index still resolves bound Employee_Code and renders My MBO;
2. DEDICATED Index triggers App794 query with `Assignee in (LOGINUSER())` through accepted service;
3. exact `Assignee.value[].code === 'vassana'` task appears with truthful count;
4. mismatching Assignee is not rendered/actionable;
5. SHARED renders existing My MBO, performs zero approval query and has no approval section;
6. Dedicated approval fetch error preserves My MBO and exposes no actionable task;
7. approval Home path introduces no App795 query;
8. valid DEDICATED Index introduces no MBO login gate call.

Run only:

```text
node --test tests/employee-main-mbo-app-integration.test.js
git diff --check
```

Do NOT run any other test.

## 4. Explicitly forbidden

```text
MODIFY src/services/mbo-approval-task-service.js = NO
MODIFY tests/mbo-approval-task-service.test.js   = NO
MODIFY src/ui/employee-self-index-ui.js          = NO
MODIFY src/ui/employee-part-a-ui.js              = NO
MODIFY src/ui/employee-visibility.js             = NO
MODIFY routing/identity/auth/session services    = NO
MODIFY project-docs/**                           = NO
MODIFY dist/**                                   = NO
CROSS_EMPLOYEE_DETAIL_AUTHORITY                  = NO
PROCESS_PROCEED_REVALIDATION                     = NO
npm test                                         = NO
npm run ui:build                                 = NO
EVIDENCE DOC                                     = NO
LIVE KINTONE GET                                 = NO
LIVE KINTONE WRITE                               = NO
APP53 ACCESS                                     = NO
ACL/GROUP/DEPLOY                                 = NO
```

Do not refactor adjacent code or change workflow/routing semantics. Do not claim deploy readiness after this WP.

## 5. Stop conditions

STOP without expanding scope if:
- Home integration cannot fit the 3 allowed files;
- My MBO would need redesign;
- cross-employee Detail changes are required;
- Process handler changes appear necessary;
- an unrelated test/file needs modification.

## 6. Finish

If focused test + `git diff --check` pass:
- commit + push one focused commit;
- STOP immediately.

Final executor response only:

```text
COMMIT_SHA = ...
CHANGED_FILES = 3 exact files
FOCUSED_TEST = PASS/FAIL + count
GIT_DIFF_CHECK = PASS/FAIL
FULL_TEST_RUN = NO
BUILD_RUN = NO
LIVE_KINTONE_OPERATIONS = 0
APP53_PRODUCTION_TOUCHED = NO
```

Next owner = ChatGPT independent review.