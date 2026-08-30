# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary source/runtime execution
> Updated: 2026-08-30 — APPROVAL AUTHORITY SERVICE R1 CORRECTIVE OPEN / HYBRID EMPLOYEE-SELF SOURCE ACCEPTED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core Source R1 PASS. Hybrid Employee-Self Runtime Entry source ACCEPTED after build + 1024/1024 regression. My Approval Tasks native current-assignee field/query contract is proven. Approval-authority service candidate R1 is under one small corrective before acceptance; Home/detail/process integration remains later. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; Reset UI/tooling accepted; live remains prior MVP. |
| D5 | 🟠 Copy own previous MBO IN PROGRESS |
| D6 | 🔴 Integrated E2E / Security / Regression pending |
| D7 | ✅ Admin Support Center source functionality CLOSED |

## 2. Lean Antigravity Rule — MANDATORY

```text
ANTIGRAVITY = MINIMUM NECESSARY SOURCE/RUNTIME EXECUTION ONLY
CHATGPT     = PLAN / REVIEW / CONTROL DOCS / EVIDENCE INTERPRETATION
```

Ordinary corrective/foundation work = exact files -> smallest focused test -> diff check -> one commit/push -> STOP.
No broad scan, full suite, build, evidence document, live Kintone, or deploy unless a later milestone explicitly requires it.

## 3. Hybrid Employee-Self Runtime Source — ACCEPTED

```text
HYBRID_IDENTITY            = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
HYBRID_CORE_SOURCE         = PASS
HYBRID_RUNTIME_ENTRY_LOGIC = PASS
TREE_CLEANUP_R3            = PASS
LEGACY_SHARED_FIXTURE_R1   = PASS
SOURCE_ACCEPTED            = YES
LIVE_DEPLOY_READY          = NO
```

Final accepted local milestone:
```text
npm run ui:build          = PASS
npm test                  = PASS (1024/1024)
git diff --check          = PASS
FINAL_WORKTREE_CLEAN      = YES
SOURCE_CHANGES            = 0
TEST_CHANGES              = 0
LIVE_KINTONE_OPERATIONS   = 0
APP53_PRODUCTION_TOUCHED  = NO
```

## 4. My Approval Tasks — Native Current-Assignee Proof PASS

User-assisted App794 READ-ONLY runtime diagnostic proved on Record #11:
```text
Status.type   = STATUS
Status.value  = 01 Draft Objective
Assignee.type = STATUS_ASSIGNEE
Assignee.value= []
```

Therefore:
```text
CURRENT_ASSIGNEE_FIELD = Assignee
CURRENT_ASSIGNEE_TYPE  = STATUS_ASSIGNEE
STATUS_FIELD           = Status
STATUS_TYPE            = STATUS
```

Canonical authority rule:
```text
APPROVAL_LIST_AUTHORITY
= DEDICATED native principal
AND server query Assignee in (LOGINUSER())
AND returned Assignee.value contains exact current Kintone user code

APPROVAL_OPEN_ACTION_AUTHORITY
= fresh App794 GET
AND Assignee.type == STATUS_ASSIGNEE
AND Assignee.value contains exact current dedicated Kintone user code
```

Still forbidden as authority:
```text
App795 static membership
Manager_User / GM_User / First_Manager_User snapshot alone
caller-supplied role
UI visibility
Employee-Self ownership
```

```text
SHARED_APPROVER_AUTHORITY = DENIED
```

## 5. Approval Authority Service R1 — REVIEW = CORRECTIVE

Executor candidate:
```text
COMMIT = 1c44f155fb35a6082b75d56c34d3218b22484ffb
SCOPE  = PASS (exactly 2 new files)
```

Exact changed files:
```text
src/services/mbo-approval-task-service.js
tests/mbo-approval-task-service.test.js
```

Independent source review found two blockers:

### R1-A — Canonical getRecord response-shape mismatch
`src/main-mbo-app.js` canonical wrapper is:
```text
getRecord(appId, id) -> record object directly
```

The candidate service instead interprets:
```text
getRecord(...) -> { record: ... }
```
which would make later real integration return `RECORD_NOT_FOUND` for a valid record.

Corrective rule:
```text
revalidateApprovalTask()
-> require injected getRecord(appId, recordId)
-> call it exactly once
-> treat the returned value as the record object directly
-> no getRecords fallback
```

### R1-B — Public authority helper can bypass Dedicated-mode gate
Candidate exposes:
```text
isAuthorizedAssignee(record, kintoneUserCode)
```
without requiring `mode === DEDICATED`.

This conflicts with the required contract that every public authority method must enforce Dedicated mode.

Corrective rule: make exact Assignee field validation an unexported/internal helper, or otherwise ensure every public authority entry point requires and validates Dedicated context before authorization is evaluated.

No UI/main integration should be added in this corrective.

## 6. Architecture / Integration Inventory

Target responsibility map remains:
```text
src/services/mbo-approval-task-service.js = canonical assignment list/query + exact assignee validation + fresh record revalidation
src/ui/approver-task-index-ui.js          = later My Approval Tasks renderer only
src/main-mbo-app.js                        = later context/event orchestration only
src/ui/employee-self-index-ui.js           = My MBO only
```

## 7. App53 Production Protection

```text
APP53_ENVIRONMENT       = PRODUCTION
APP53_DEFAULT_MODE      = READ_ONLY
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH   = NONE
```

No App53 access is required. Do not create `MBO_Kintone_User`. Do not modify Natta `emp_text`.

## 8. Current Active Task

```text
ACTIVE_TASK = D1 MY APPROVAL TASKS — LEAN AUTHORITY SERVICE R1 CORRECTIVE R1
OWNER       = ANTIGRAVITY
SOURCE_EDIT = ONE EXISTING SERVICE FILE ONLY
TEST_EDIT   = ONE EXISTING TEST FILE ONLY
FOCUSED_TEST= ONE FILE ONLY
BUILD       = NO
FULL_TEST   = NO
LIVE_KINTONE= NO
DEPLOY      = NO
```

Exact corrective contract is in `AI_ACTIVE_TASK.md`.

## 9. Authorization Ledger

```text
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH        = NONE
ACTIVE_ACL_WRITE_AUTH     = NONE
ACTIVE_GROUP_WRITE_AUTH   = NONE
APP53_SCHEMA_WRITE_AUTH   = NONE
APP53_RECORD_WRITE_AUTH   = NONE
APP53_BULK_WRITE_AUTH     = NONE
ROLLBACK_AUTH             = NONE
```

## 10. Next Gate

Antigravity performs only Corrective R1 in the same 2 files, runs the single focused test + diff check, commits/pushes once, then STOP. ChatGPT independently reviews. Home/Menu, cross-employee Detail, Process event integration, build/full regression, and live configuration remain later gates.