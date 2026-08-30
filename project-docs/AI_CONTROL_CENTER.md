# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary source/runtime execution
> Updated: 2026-08-30 — NATIVE CURRENT-ASSIGNEE PROOF PASS / LEAN APPROVAL AUTHORITY SERVICE R1 OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core Source R1 PASS. Hybrid Employee-Self Runtime Entry source ACCEPTED after build + 1024/1024 regression. My Approval Tasks native current-assignee field/query contract is now proven. Next gate is one small source-only approval-authority service foundation WP; Home/detail/process integration remains later. |
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

Therefore the actual native current-assignee field code is:
```text
CURRENT_ASSIGNEE_FIELD = Assignee
CURRENT_ASSIGNEE_TYPE  = STATUS_ASSIGNEE
STATUS_FIELD           = Status
STATUS_TYPE            = STATUS
```

The empty Assignee array on Draft is valid and does not weaken the field-contract proof.

Official Kintone contract independently confirms:
- Assignee field type `STATUS_ASSIGNEE` returns an array of users shaped `{ code, name }` when assigned;
- Assignee supports query operators `in` / `not in`;
- Kintone's built-in `(Assigned to me)` view uses `Assignee in (LOGINUSER())`;
- `app.record.detail.process.proceed` may return a Promise, so an immediate GET revalidation can run before allowing a Process action.

Canonical authority rule is now implementable without guessing:
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

## 5. Architecture / Integration Inventory

Repository facts remain:
- `src/main-mbo-app.js` owns top-level `getRecords()` and `getRecord()` transport seams.
- current Index orchestration is Employee-Self/My MBO only.
- current cross-employee Detail is blocked by Employee-Self ownership and must later receive a distinct Approver path.
- current `app.record.detail.process.proceed` validates topology/business rules but has no native-current-assignee revalidation yet.
- `src/ui/employee-self-index-ui.js` remains canonical My MBO owner and must not absorb My Approval Tasks implementation.

Target responsibility map:
```text
src/services/mbo-approval-task-service.js = canonical assignment list/query + exact assignee validation + fresh record revalidation
src/ui/approver-task-index-ui.js          = later My Approval Tasks renderer only
src/main-mbo-app.js                        = later context/event orchestration only
src/ui/employee-self-index-ui.js           = My MBO only
```

To minimize Antigravity usage, UI/event integration is NOT in the current WP.

## 6. App53 Production Protection

```text
APP53_ENVIRONMENT       = PRODUCTION
APP53_DEFAULT_MODE      = READ_ONLY
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH   = NONE
```

Do not create `MBO_Kintone_User`. Do not modify Natta `emp_text`. No App53 access is required by the current approval-service foundation WP.

## 7. Current Active Task

```text
ACTIVE_TASK = D1 MY APPROVAL TASKS — LEAN CURRENT-ASSIGNEE AUTHORITY SERVICE R1
OWNER       = ANTIGRAVITY
SOURCE_EDIT = ONE NEW SERVICE FILE ONLY
TEST_EDIT   = ONE NEW TEST FILE ONLY
FOCUSED_TEST= ONE FILE ONLY
BUILD       = NO
FULL_TEST   = NO
LIVE_KINTONE= NO
DEPLOY      = NO
```

Exact contract, whitelist, tests, and stop rules are in `AI_ACTIVE_TASK.md`.

## 8. Authorization Ledger

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

## 9. Next Gate

Antigravity implements only the approval-authority service foundation. ChatGPT independently reviews it. Only after PASS may a later small WP connect Dedicated Home -> My Approval Tasks -> cross-employee Detail -> pre-action revalidation. No live deployment/configuration is implied.