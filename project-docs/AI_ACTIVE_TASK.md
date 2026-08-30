# AI ACTIVE TASK — D1 MY APPROVAL TASKS — LEAN HOME INDEX INTEGRATION R1

Mode: **ANTIGRAVITY MINIMUM SOURCE INTEGRATION ONLY — HOME/INDEX ONLY / 3 FILES / ONE FOCUSED TEST / NO BUILD / NO FULL TEST / NO LIVE KINTONE**  
Branch: `ai/antigravity-wp002c`

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
Do NOT change its Employee_Code ownership query, Create button, own-record list, or shared-login behavior.

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

Never infer Approver mode from Employee_Code, App795, Manager_User, GM_User, First_Manager_User, role strings, or UI state.

### C. New ApproverTaskIndexUI is presentation only
Create a small renderer such as `ApproverTaskIndexUI`.
It must:
- receive already-authorized task records from the service;
- perform NO Kintone API calls itself;
- perform NO App795 lookup;
- perform NO authority calculation;
- render a separate bilingual heading:
  `งานรอฉันอนุมัติ / My Approval Tasks`;
- show a truthful pending count;
- render a simple deterministic list/table using safe DOM APIs / `textContent` for record-derived text;
- support empty state;
- support a safe load-error state supplied by main orchestration.

Useful display fields may be limited to existing record values such as Fiscal Year, Employee_Code/Employee_Name, Status, Record_Key, and record id.
Do not add a role selector or employee selector.

A record link may target the normal App794 detail URL, but this WP does NOT authorize cross-employee Detail access. Gate 2 must be accepted before this source can be considered deploy-ready.

### D. Approval-query failure must not break My MBO
If the Dedicated approval-task fetch throws/fails:
- fail closed for the approval section;
- show no actionable approval task as authorized from the failed fetch;
- render a small bilingual approval-load error/empty-safe state;
- preserve the already-rendered My MBO section.

Do not fall back to App795/static snapshots.

### E. No duplicate authority logic
Use the accepted `MboApprovalTaskService.fetchApprovalTasks()` directly.
Do not reimplement `Assignee in (LOGINUSER())` or `STATUS_ASSIGNEE` checks in main/UI.

## 3. Focused integration test only

Modify only `tests/employee-main-mbo-app-integration.test.js`.

Add the smallest deterministic proofs:
1. DEDICATED `vassana` Index still resolves exact bound Employee_Code and renders My MBO.
2. DEDICATED Index triggers an App794 query whose semantics contain `Assignee in (LOGINUSER())` through the accepted service.
3. Returned record with exact `Assignee.value[].code === 'vassana'` appears in `My Approval Tasks` with truthful pending count.
4. A returned/mocked record whose Assignee does not match `vassana` is not actionable/rendered by the integrated service result.
5. SHARED principal renders existing My MBO behavior but performs zero approval-task query and has no My Approval Tasks section.
6. Approval fetch error for DEDICATED does not remove/break My MBO and does not expose an actionable task.
7. No App795 query is introduced by the approval Home path.
8. No MBO login gate call is introduced for a valid DEDICATED Index context.

Run only:
```text
node --test tests/employee-main-mbo-app-integration.test.js
git diff --check
```

Do NOT run any other test.

## 4. Explicitly forbidden in this WP

```text
MODIFY src/services/mbo-approval-task-service.js = NO
MODIFY tests/mbo-approval-task-service.test.js   = NO
MODIFY src/ui/employee-self-index-ui.js          = NO
MODIFY src/ui/employee-part-a-ui.js              = NO
MODIFY src/ui/employee-visibility.js              = NO
MODIFY routing/identity/auth/session services     = NO
MODIFY objective/workflow validation tests        = NO
MODIFY dist/**                                    = NO
MODIFY project-docs/**                            = NO
CROSS_EMPLOYEE_DETAIL_AUTHORITY                   = NO
PROCESS_PROCEED_REVALIDATION                      = NO
npm test                                          = NO
npm run ui:build                                  = NO
EVIDENCE DOC                                      = NO
LIVE KINTONE GET                                  = NO
LIVE KINTONE WRITE                                = NO
APP53 ACCESS                                      = NO
ACL/GROUP/DEPLOY                                  = NO
```

Do not refactor adjacent code.
Do not change workflow/routing semantics.
Do not claim deploy readiness after this WP.

## 5. Stop conditions

STOP and report without expanding scope if:
- Home integration cannot be completed within the 3 allowed files;
- existing My MBO behavior would need redesign;
- cross-employee Detail changes are required to make a focused test pass;
- Process handler changes appear necessary;
- an existing unrelated test requires modification.

## 6. Finish

If the one focused integration test and `git diff --check` pass:
- commit + push one focused commit;
- STOP immediately.

Final response only:
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