# AI ACTIVE TASK — D1 MY APPROVAL TASKS — LEAN CURRENT-ASSIGNEE AUTHORITY SERVICE R1

Mode: **ANTIGRAVITY MINIMUM SOURCE IMPLEMENTATION ONLY — NO UI / NO MAIN INTEGRATION / NO BUILD / NO FULL TEST / NO LIVE KINTONE**  
Branch: `ai/antigravity-wp002c`

## 0. Goal

Implement one canonical service foundation for My Approval Tasks current-native-assignee authority.

Runtime proof is already complete:
```text
Field Code = Assignee
Field Type = STATUS_ASSIGNEE
Status Code = Status
Status Type = STATUS
```

Kintone contract confirms:
```text
Assignee in (LOGINUSER())
```
is the native server-side assigned-to-current-user query, and assigned values are user objects containing exact Kintone login `code` + display `name`.

Do NOT rediscover this. Do NOT scan the repository broadly.

## 1. Exact allowed files

CREATE only:
```text
src/services/mbo-approval-task-service.js
tests/mbo-approval-task-service.test.js
```

No other file may change.

## 2. Required service contract

Create a cohesive `MboApprovalTaskService` (class or equivalent named export) owning only current-assignment authority primitives.

Required behaviors:

### A. Dedicated-only gate
Every public authority method must require:
```text
mode === 'DEDICATED'
```
and a nonblank exact `kintoneUserCode` with no leading/trailing whitespace.

If mode is SHARED or anything else, fail before any API call with a stable error/classification such as:
```text
APPROVER_AUTHORITY_DENIED
```

Do not infer Dedicated mode from Employee_Code, App795, snapshot fields, role strings, or session state.

### B. Canonical list query
Expose a method that lists current approval records through injected read API only.

Server-side query must be based on:
```text
Assignee in (LOGINUSER())
```

Pagination must not silently truncate results. Use normal Get Records query paging through the injected `getRecords(appId, query)` seam. A reasonable deterministic order such as `$id asc` or `$id desc` is acceptable.

Do not query App795.

### C. Exact returned-record validation
For every record treated as actionable authority:
```text
record.Assignee.type === 'STATUS_ASSIGNEE'
record.Assignee.value is an array
one value.code exactly equals kintoneUserCode (case-sensitive)
```

Empty/missing/malformed/mismatched Assignee means NOT authorized.

Do not fall back to:
```text
Manager_User
GM_User
First_Manager_User
Requester_User
App795 membership
Status name alone
```

For a server-query result that contradicts the exact `Assignee.value` check, fail closed; do not silently grant authority.

### D. Fresh single-record revalidation
Expose a method for record-open/action use that calls injected:
```text
getRecord(appId, recordId)
```
exactly once per revalidation request, then applies the same exact Assignee validation.

Return a simple safe result such as:
```text
{ authorized: true, record }
```
or
```text
{ authorized: false, reason }
```
without mutating the record.

Do not perform PUT/POST/DELETE/Process actions.

### E. Shared authority remains denied
A SHARED principal must never receive approval authority merely because its native account is listed somewhere or because an App801 session exists.

```text
SHARED_APPROVER_AUTHORITY = DENIED
```

## 3. Focused tests only

Create `tests/mbo-approval-task-service.test.js` and cover at minimum:

1. Dedicated list builds/uses query containing exact semantic `Assignee in (LOGINUSER())`.
2. Exact assignee `{ code: 'natta', name: ... }` authorizes `natta`.
3. Case mismatch does not authorize.
4. Empty `Assignee.value` does not authorize.
5. Wrong field type/malformed Assignee does not authorize.
6. SHARED mode is denied before any API call.
7. List query result with mismatched Assignee fails closed / is never returned as actionable.
8. Fresh revalidation calls `getRecord()` exactly once and authorizes matching current user.
9. Fresh revalidation denies a different current assignee.
10. Record objects are not mutated.
11. Pagination does not silently truncate a mocked multi-page result.
12. No App795/static snapshot fallback is used.

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
MODIFY routing service      = NO
MODIFY identity service     = NO
MODIFY existing tests       = NO
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

Do not improve/refactor adjacent code.
Do not implement Home/Menu, cross-employee Detail, Approver UI, or Process event integration in this WP.

## 5. Finish

If focused test + `git diff --check` pass:
- commit + push one focused commit;
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