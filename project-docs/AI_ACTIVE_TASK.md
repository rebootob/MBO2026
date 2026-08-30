# AI ACTIVE TASK — D1 MY APPROVAL TASKS — LEAN AUTHORITY SERVICE R1 CORRECTIVE R1

Mode: **ANTIGRAVITY MINIMUM CORRECTIVE ONLY — SAME 2 FILES / ONE FOCUSED TEST / NO BUILD / NO FULL TEST / NO LIVE KINTONE**  
Branch: `ai/antigravity-wp002c`

## 0. Goal

Correct only two independently proven contract defects in the current approval-authority service candidate.

Do NOT rediscover architecture. Do NOT scan repository broadly. Do NOT add UI/main integration.

Candidate under correction:
```text
1c44f155fb35a6082b75d56c34d3218b22484ffb
```

## 1. Exact allowed files

MODIFY only:
```text
src/services/mbo-approval-task-service.js
tests/mbo-approval-task-service.test.js
```

No other file may change.

## 2. Corrective findings

### R1-A — Fix canonical getRecord response shape
Canonical existing runtime seam in `src/main-mbo-app.js` is:
```text
kintoneApiWrapper.getRecord(appId, id)
-> returns record object directly
```

Current candidate incorrectly expects:
```text
{ record: ... }
```

Required correction for `revalidateApprovalTask()`:
1. require `kintoneApiWrapper.getRecord` to exist;
2. after Dedicated context/parameter validation, call `getRecord(mboAppId, recordId)` exactly once;
3. treat the returned value directly as the record object;
4. if null/invalid -> `{ authorized:false, reason:'RECORD_NOT_FOUND' }` or equivalent safe result;
5. run exact `Assignee.type === 'STATUS_ASSIGNEE'` + exact `value[].code === kintoneUserCode` validation;
6. REMOVE the `getRecords` fallback from revalidation entirely.

Do not change the canonical main wrapper.

### R1-B — No public authority helper may bypass Dedicated gate
Current candidate publicly exposes:
```text
isAuthorizedAssignee(record, kintoneUserCode)
```
without validating `mode === 'DEDICATED'`.

Required correction:
- exact Assignee field checking should be an unexported/internal helper used by public service methods; OR
- every public callable authority method must accept Dedicated context and call `validateDedicatedContext()` before evaluating authority.

Preferred lean design: keep only the use-case authority entry points public and make the raw record/code comparison helper internal/non-exported.

No authority may be granted from Employee_Code, shared session, App795, Manager_User, GM_User, First_Manager_User, Requester_User, role strings, or UI state.

## 3. Focused tests only

Update only `tests/mbo-approval-task-service.test.js`.

Required focused proof:
1. existing Dedicated list query behavior remains `Assignee in (LOGINUSER())`;
2. exact/case-sensitive Assignee validation behavior remains covered through the public Dedicated path;
3. SHARED remains denied before API call;
4. revalidation mock now matches the real canonical seam:
   ```text
   getRecord(...) -> record object directly
   ```
5. matching direct record authorizes;
6. mismatching direct record denies;
7. `getRecord()` called exactly once;
8. when `getRecord` is missing, revalidation fails safely even if `getRecords` exists — it must NOT use `getRecords` fallback;
9. record remains unmutated;
10. pagination/list behavior remains covered.

Run only:
```text
node --test tests/mbo-approval-task-service.test.js
git diff --check
```

Do NOT run any other test.

## 4. Forbidden

```text
MODIFY src/main-mbo-app.js = NO
CREATE/MODIFY UI            = NO
MODIFY employee-self UI     = NO
MODIFY routing/identity     = NO
MODIFY existing other tests = NO
MODIFY dist/**              = NO
MODIFY project-docs/**      = NO
npm test                    = NO
npm run ui:build            = NO
EVIDENCE DOC                = NO
LIVE KINTONE GET            = NO
LIVE KINTONE WRITE          = NO
APP53 ACCESS                = NO
ACL/GROUP/DEPLOY            = NO
```

Do not refactor adjacent code.

## 5. Finish

If focused test + `git diff --check` pass:
- commit + push one focused corrective commit;
- STOP immediately.

Final response only:
```text
COMMIT_SHA = ...
CHANGED_FILES = 2 exact files
FOCUSED_TEST = PASS/FAIL + count
GIT_DIFF_CHECK = PASS/FAIL
LIVE_KINTONE_OPERATIONS = 0
APP53_PRODUCTION_TOUCHED = NO
```

Next owner = ChatGPT independent review.