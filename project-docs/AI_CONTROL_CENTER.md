# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary source/runtime execution
> Updated: 2026-08-30 — APPROVAL AUTHORITY SERVICE R1 PASS / HOME INDEX INTEGRATION R1 OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core Source R1 PASS. Hybrid Employee-Self Runtime Entry source ACCEPTED after build + 1024/1024 regression. Native current-assignee proof PASS. Approval Authority Service R1 PASS. Next gate is one small Home Index integration only; cross-employee Detail and Process revalidation remain separate later gates. |
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
SOURCE_ACCEPTED            = YES
LIVE_DEPLOY_READY          = NO
```

Accepted milestone evidence:
```text
npm run ui:build          = PASS
npm test                  = PASS (1024/1024)
git diff --check          = PASS
FINAL_WORKTREE_CLEAN      = YES
LIVE_KINTONE_OPERATIONS   = 0
APP53_PRODUCTION_TOUCHED  = NO
```

## 4. My Approval Tasks — Native Current-Assignee Contract

Runtime READ-ONLY proof on App794 established:
```text
CURRENT_ASSIGNEE_FIELD = Assignee
CURRENT_ASSIGNEE_TYPE  = STATUS_ASSIGNEE
STATUS_FIELD           = Status
STATUS_TYPE            = STATUS
```

Canonical authority:
```text
LIST
= DEDICATED native principal
AND Assignee in (LOGINUSER())
AND returned Assignee.value contains exact current Kintone user code

OPEN / ACTION
= fresh App794 GET
AND Assignee.type == STATUS_ASSIGNEE
AND Assignee.value contains exact current dedicated Kintone user code
```

Never use as authority:
```text
App795 static membership
Manager_User / GM_User / First_Manager_User snapshots alone
caller role strings
UI visibility
Employee-Self ownership
```

```text
SHARED_APPROVER_AUTHORITY = DENIED
```

## 5. Approval Authority Service R1 — PASS

Accepted executor corrective commit:
```text
5ac5ede6e40a1462f0398ba8740330742041e3bf
```

Independent review:
```text
SCOPE                         = PASS (exactly service + focused test)
GET_RECORD_CANONICAL_SEAM     = PASS (record object directly)
GET_RECORD_CALL_COUNT         = exactly once per revalidation
GET_RECORDS_REVALIDATE_FALLBACK = REMOVED
PUBLIC_DEDICATED_GATE         = PASS
ASSIGNEE_EXACT_CASE_SENSITIVE = PASS
SHARED_APPROVER_AUTHORITY     = DENIED
STATIC_SNAPSHOT_FALLBACK      = NONE
```

Files:
```text
src/services/mbo-approval-task-service.js
tests/mbo-approval-task-service.test.js
```

The test source was independently inspected and covers the corrective contract. Local executor console output is not persisted in Git, so no unobserved test count is claimed here.

## 6. My Approval Tasks Integration Inventory — COMPLETE

Current source seams:

### Home / Index
`src/main-mbo-app.js` resolves Hybrid context, then calls `EmployeeSelfIndexUI`.
`src/ui/employee-self-index-ui.js` is the canonical `My MBO` owner and must stay My-MBO-only.

Smallest Home seam:
```text
resolved context
-> render existing My MBO unchanged
-> if mode == DEDICATED:
     MboApprovalTaskService.fetchApprovalTasks(...)
     ApproverTaskIndexUI.render(...)
-> if mode == SHARED:
     no approval query
     no approval section
```

### Cross-employee Detail
Current `setupRecordUiWithAuth()` blocks every existing record whose `Employee_Code` differs from the bound Employee-Self code. Therefore assigned Approver detail requires a separate later authority path. It must not be silently bypassed in the Home WP.

### Process Action
Current `app.record.detail.process.proceed` validates topology/business rules only. It does not fresh-revalidate native `Assignee`. This is a separate later gate and must become fail-closed before an Approver action is considered complete.

### Visibility
`employee-visibility.js` uses requester/static appraiser snapshot fields for UI visibility. This may help presentation but is NOT approval authority. Native `Assignee` remains the authority source.

## 7. Implementation Split — MANDATORY

To minimize Antigravity usage:

```text
GATE 1 = HOME INDEX INTEGRATION ONLY
GATE 2 = DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY
GATE 3 = PROCESS.PROCEED FRESH ASSIGNEE REVALIDATION
```

Do not combine these gates unless a later independent review proves it is smaller/safer.
No source from Gate 1 is deploy-ready by itself.

## 8. App53 Production Protection

```text
APP53_ENVIRONMENT       = PRODUCTION
APP53_DEFAULT_MODE      = READ_ONLY
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH   = NONE
```

Do not create `MBO_Kintone_User`. Do not modify Natta `emp_text`.
Current Home integration uses mocks/fixtures only and requires no App53 live access.

## 9. Current Active Task

```text
ACTIVE_TASK = D1 MY APPROVAL TASKS — LEAN HOME INDEX INTEGRATION R1
OWNER       = ANTIGRAVITY
ALLOWED     = 3 exact files
FOCUSED_TEST= employee-main-mbo-app-integration.test.js only
BUILD       = NO
FULL_TEST   = NO
LIVE_KINTONE= NO
DEPLOY      = NO
```

Exact contract is in `AI_ACTIVE_TASK.md`.

## 10. Authorization Ledger

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

## 11. Next Gate

Antigravity implements only Home Index integration, runs one focused integration test + `git diff --check`, commits/pushes once, then STOP. ChatGPT independently reviews before any Detail/Process integration is opened.