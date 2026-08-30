# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary source/runtime execution
> Updated: 2026-08-30 — HYBRID EMPLOYEE-SELF SOURCE ACCEPTED / MY APPROVAL TASKS BLOCKED PENDING READ-ONLY NATIVE-ASSIGNEE PROOF

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core Source R1 PASS. Hybrid Employee-Self Runtime Entry source ACCEPTED after build + 1024/1024 regression. My Approval Tasks source implementation is NOT opened yet because repository source does not prove the exact native current-assignee field/query contract. Next gate = user-assisted App794 READ-ONLY runtime proof only. |
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

Do not use Antigravity for read-only discovery that ChatGPT/user can perform directly.

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

Final local milestone evidence supplied by user:
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

## 4. My Approval Tasks Source Inventory R1 — BLOCKED

Inventory result:
```text
CURRENT_ASSIGNEE_SOURCE_OWNER = NOT_PROVEN_IN_REPOSITORY
SOURCE_IMPLEMENTATION_READY   = NO
BLOCKER                       = BLOCKED_NEEDS_READ_ONLY_RUNTIME_PROOF
```

Repository facts independently confirmed:

1. `src/main-mbo-app.js` already owns the top-level Kintone read adapter:
```text
kintoneApiWrapper.getRecords(appId, query)
kintoneApiWrapper.getRecord(appId, id)
```
These are suitable transport seams, but the repository does not prove the exact native Process-assignee field code/query syntax.

2. Repository/code search found no canonical `$assignee`/assignee system-field usage. Therefore Control Plane must not invent `$assignee`, `Assignee`, or another field name.

3. `app.record.index.show` currently resolves Employee-Self context and renders `EmployeeSelfIndexUI` / My MBO only. The current My MBO query is exact Employee_Code ownership.

4. `app.record.detail.show` / Edit/Create currently enters Employee-Self orchestration and blocks an existing record when `record.Employee_Code != authenticatedEmployeeCode`. This is correct for My MBO but means Approver record access requires a distinct authorization context/path rather than reusing Employee-Self ownership.

5. `app.record.detail.process.proceed` currently runs topology/action/business validation only. It does NOT independently revalidate that current dedicated Kintone user is the native current Workflow assignee.

6. App795 static route membership and App794 snapshot user fields remain routing/snapshot evidence only. They are not actionable approval authorization.

7. Shared principals remain Employee-Self only:
```text
SHARED_APPROVER_AUTHORITY = DENIED
```

### Safe architecture after proof

Do not merge My Approval Tasks implementation into `EmployeeSelfIndexUI`.

Target responsibility map after native-assignee proof:
```text
src/services/mbo-approval-task-service.js   = canonical current-assignment query + record-open/action revalidation
src/ui/approver-task-index-ui.js            = My Approval Tasks renderer only
src/main-mbo-app.js                          = context selection/event orchestration only
src/ui/employee-self-index-ui.js             = remains My MBO owner UI
```

Tentative later implementation whitelist, contingent on proof:
```text
NEW    src/services/mbo-approval-task-service.js
NEW    src/ui/approver-task-index-ui.js
MODIFY src/main-mbo-app.js
```

Tentative focused-test whitelist, contingent on proof:
```text
NEW    tests/mbo-approval-task-service.test.js
NEW    tests/approver-task-index-ui.test.js
MODIFY tests/employee-main-mbo-app-integration.test.js
```

Do not open this implementation WP until exact native field/query behavior is proven.

## 5. App53 Production Protection

```text
APP53_ENVIRONMENT       = PRODUCTION
APP53_DEFAULT_MODE      = READ_ONLY
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH   = NONE
```

No App53 change is part of the My Approval Tasks proof. Do not create `MBO_Kintone_User`. Do not modify Natta `emp_text`.

## 6. Current Active Task

```text
ACTIVE_TASK = D1 MY APPROVAL TASKS — NATIVE CURRENT-ASSIGNEE READ-ONLY RUNTIME PROOF R1
OWNER       = USER + CHATGPT CONTROL PLANE
ANTIGRAVITY = DO NOT USE
SOURCE_EDIT = NO
TEST_RUN    = NO
APP794_GET  = ONE USER-INITIATED READ-ONLY DIAGNOSTIC
LIVE_WRITE  = NO
DEPLOY      = NO
```

Exact safe console command and output requirements are in `AI_ACTIVE_TASK.md`.

## 7. Authorization Ledger

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

No POST/PUT/DELETE/Process action is authorized by the read-only proof gate.

## 8. Next Gate

User supplies one App794 read-only diagnostic result from a record with Process Management enabled. ChatGPT identifies the exact native assignee field shape and, only if safely proven, opens one small Antigravity source WP. If the field/query contract is still ambiguous, remain BLOCKED and do not implement.
