# AI ACTIVE TASK — D1 GATE 3 EXACT RECORD-ID BOUNDARY CORRECTIVE R1

Mode: **ANTIGRAVITY MINIMUM CORRECTIVE ONLY — 2 FILES / ONE SOURCE-LINE SECURITY FIX + FOCUSED TEST EVIDENCE / NO BUILD / NO FULL TEST / NO LIVE KINTONE**
Branch: `ai/antigravity-wp002c`
Review target: `282dcaf35764ea1960a064cf48f3c8add34506b8`
Updated: 2026-08-30

```text
TASK_STATE = CORRECTIVE / READY_FOR_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
```

Fresh-fetch the branch before execution. If another executor correction already exists after this task was written, STOP and hand it to ChatGPT for review instead of repeating work.

## 0. Goal

Close only the Gate 3 exact record-id security-boundary defect found by independent review.

The Gate 3 implementation candidate is otherwise not reopened by default.

Approved record-id sources for Process Proceed revalidation are exactly:

```text
event.recordId
record.$id.value
```

A custom/static record field is not an approved authority identifier.

## 1. Exact allowed files

MODIFY ONLY:

```text
src/main-mbo-app.js
tests/employee-main-mbo-app-integration.test.js
```

No new file. No other file may change.

## 2. Required source correction

In the Gate 3 `app.record.detail.process.proceed` handler, change only the record-id resolution needed to remove this fallback:

```text
record?.Record_ID?.value
```

Final authority id resolution must use only:

```js
const recordId = event.recordId || record?.$id?.value;
```

If neither native identifier exists, return `false` with zero approval revalidation GETs.

Do not modify `MboApprovalTaskService`.
Do not change Gate 1/2 behavior.
Do not change requester/HR/admin semantics.
Do not reorder/refactor unrelated Process logic.

## 3. Required focused test correction

Keep all existing Gate 1/2/3 assertions.

### A. Spoof/static Record_ID must not be trusted

Strengthen the existing Gate 3 missing-record-id test so the cross-employee Process event has:
- no `event.recordId`;
- no `record.$id`;
- a populated static/custom field such as:

```js
Record_ID: { value: '901' }
```

Expected:

```text
handler result = false
fresh approval revalidation GET count = 0
```

This directly proves `Record_ID` is not accepted as an authority identifier.

### B. Preserve exact Employee-Self identity evidence

After the existing authorized Dedicated cross-employee Process action, assert both:

```text
current context employeeCode = 0044
current context kintoneUserCode = vassana
```

Do not mutate or rebind Employee-Self identity.

## 4. Preserve accepted Gate 3 behavior

Do not weaken/remove existing evidence for:
- DEDICATED own requester action -> 0 revalidation GETs;
- SHARED own requester action -> 0 revalidation GETs;
- DEDICATED cross-employee authorized -> exactly 1 fresh GET + event returned;
- Assignee mismatch -> false;
- API failure -> false;
- missing record -> false;
- SHARED cross-employee -> false + 0 GETs;
- null Employee-Self context -> existing behavior + 0 GETs;
- 0 App795 authority queries;
- 0 MBO login-gate calls.

## 5. Run only

```text
node --test tests/employee-main-mbo-app-integration.test.js
git diff --check
```

Do NOT run any other test.

## 6. Explicitly forbidden

```text
MODIFY src/services/mbo-approval-task-service.js = NO
MODIFY src/ui/**                                  = NO
MODIFY routing/identity/auth/session services    = NO
MODIFY project-docs/** BY EXECUTOR               = NO
MODIFY dist/**                                   = NO
HOME_INDEX_CHANGE                                = NO
DETAIL_AUTHORITY_CHANGE                          = NO
CROSS_EMPLOYEE_EDIT_AUTHORITY                    = NO
STATIC APP795/ROUTE AUTHORITY FALLBACK           = NO
GLOBAL HR/ADMIN AUTHORITY ENGINE                 = NO
PROCESS REFACTOR                                 = NO
npm test                                         = NO
npm run ui:build                                 = NO
LIVE KINTONE GET                                 = NO
LIVE KINTONE WRITE                               = NO
APP53 ACCESS                                     = NO
ACL/GROUP/DEPLOY                                 = NO
```

No Live Kintone authorization exists.

## 7. Stop conditions

STOP without expanding scope if:
- correcting the record-id boundary requires anything beyond the two allowed files;
- accepted approval service would need modification;
- existing Gate 3 focused tests reveal another source defect;
- another source/test file is required.

## 8. Finish

If focused test + `git diff --check` pass:
- commit + push one focused corrective commit;
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
