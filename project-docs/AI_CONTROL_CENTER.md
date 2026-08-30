# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-08-30 — D1 GATE 2 DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core R1 PASS. Hybrid Employee-Self Runtime Entry PASS. Native current-assignee contract PASS. Approval Authority Service R1 PASS. Home Index Gate 1 PASS. Gate 2 Dedicated cross-employee Detail authority OPEN. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; Reset UI/tooling source accepted; live remains prior MVP; deploy NOT authorized. |
| D5 | 🟠 Copy Own Previous MBO IN PROGRESS |
| D6 | 🔴 Integrated E2E / Security / Regression PENDING |
| D7 | ✅ Admin Support Center source functionality CLOSED |

## 2. Lean execution rule

```text
CHATGPT = PLAN / ARCHITECT / REVIEW / CONTROL DOCS
ANTIGRAVITY = MINIMUM NECESSARY SOURCE/RUNTIME/KINTONE EXECUTION ONLY
```

Do not spend Antigravity credit on review, repository archaeology, broad reports, document maintenance, or work ChatGPT can do directly. No broad tests/build/live operations unless the exact current gate requires them.

## 3. Accepted App794 Live baseline

```text
LIVE_REVISION          = 60
PREVIEW_REVISION       = 60
DEPLOYED_SOURCE_COMMIT = 1ed342ad137a4a364496a28d29bdffd24a99b511
LIVE_SCOPE             = ALL
DESKTOP_JS/CSS         = 1 / 1
MOBILE_JS/CSS          = 0 / 0
LIVE_JS_BLOB           = 115a08ace32bdf850cb5eebf25b953d1803114d0
LIVE_CSS_BLOB          = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
TECHNICAL_READBACK     = PASS WITH AUDIT CAVEAT
USER_RUNTIME_UAT       = PASS
```

Rev60 fatal-Create clean exit is accepted and must not be reopened without regression evidence.

## 4. Hybrid Identity — accepted source state

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
HYBRID_CORE_SOURCE_R1 = PASS
HYBRID_RUNTIME_ENTRY_LOGIC = PASS
LATEST_ACCEPTED_BUILD = PASS
LATEST_ACCEPTED_FULL_REGRESSION = 1024/1024 PASS
LIVE_DEPLOY_READY = NO
```

Dedicated = native Kintone principal -> exact active App53 mapping -> canonical Employee_Code -> Employee-Self, no second MBO login.
Shared = Employee_Code + App801 MBO password/session.

## 5. App53 protected state

```text
APP53_ENVIRONMENT = PRODUCTION
APP53_DEFAULT_MODE = READ_ONLY
APP53_MAPPING_AUDIT = COMPLETED
MBO_Kintone_User_FIELD_DESIGN = CONFIRMED USER_SELECT
MBO_Kintone_User_LIVE_FIELD_CREATED = NO
VASSANA = vassana -> App53 #456 -> emp_text 0044 -> ACTIVE
NATTA = natta -> App53 #578 -> emp_text BLANK -> canonical Employee_Code unresolved -> FAIL CLOSED
```

No App53 write is authorized.

## 6. My Approval Tasks authority — accepted foundation

```text
CURRENT_ASSIGNEE_FIELD = Assignee
CURRENT_ASSIGNEE_TYPE  = STATUS_ASSIGNEE
STATUS_FIELD           = Status

LIST = DEDICATED + Assignee in (LOGINUSER()) + exact returned Assignee.value[].code
OPEN/ACTION = fresh App794 GET + STATUS_ASSIGNEE + exact current dedicated user code
SHARED_APPROVER_AUTHORITY = DENIED
```

Never authorize from App795 static membership, `Manager_User`, `GM_User`, `First_Manager_User`, caller role strings, UI visibility or Employee-Self ownership.

Accepted service commit: `5ac5ede6e40a1462f0398ba8740330742041e3bf`.

## 7. Gate status

```text
GATE 1 = HOME INDEX INTEGRATION — ✅ PASS
GATE 2 = DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY — OPEN
GATE 3 = PROCESS.PROCEED FRESH ASSIGNEE REVALIDATION — PENDING
```

Gate 1 accepted source chain:

```text
IMPLEMENTATION_COMMIT = cb2fae671e610924e7143806944b3dcdf527f2f0
TEST_CORRECTIVE_COMMIT = f276de19a5771d7ac0bd73f51509cb912aca24d5
INDEPENDENT_DECISION  = PASS
```

### Gate 2 Control Plane inventory

Current `setupRecordUiWithAuth()` blocks any existing record whose `Employee_Code` differs from the bound Employee-Self code. That correctly protects My MBO, but it also prevents an authorized Dedicated current assignee from opening a task selected from Gate 1.

Gate 2 must reuse the accepted `MboApprovalTaskService.revalidateApprovalTask()` seam and add only a narrow cross-employee Detail exception after fresh current-assignee revalidation.

Mandatory boundaries:
- own MBO Detail/Edit path unchanged and no unnecessary approval revalidation;
- only `app.record.detail.show` may receive the new cross-employee path;
- Dedicated + different Employee_Code -> exactly one fresh revalidation GET before Detail is allowed;
- bound Employee-Self identity remains the user's own Employee_Code and must never switch to the target record employee;
- Shared cross-employee remains denied;
- cross-employee Edit remains denied;
- static App795/snapshot/role/UI fields are never authority fallback;
- Gate 3 Process Proceed/action revalidation remains untouched.

Gate 2 alone will still NOT be deploy-ready. Native App794 dedicated ACL/group configuration remains a separately protected future gate requiring exact user authorization.

## 8. Current Active Task

```text
ACTIVE_TASK = D1 MY APPROVAL TASKS — GATE 2 DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY R1
TASK_STATE  = OPEN / READY FOR MINIMUM ANTIGRAVITY EXECUTION
OWNER       = ANTIGRAVITY
ALLOWED     = src/main-mbo-app.js + tests/employee-main-mbo-app-integration.test.js ONLY
FOCUSED_TEST= tests/employee-main-mbo-app-integration.test.js only
BUILD       = NO
FULL_TEST   = NO
LIVE_KINTONE= NO
DEPLOY      = NO
```

Exact execution contract is in `AI_ACTIVE_TASK.md`.

## 9. App800 Reset MBO Password

- Core reset semantics accepted.
- HR/admin native authority readiness accepted.
- App800 Reset UI source/tooling accepted.
- Live App800 remains prior read-only/MVP customization.
- Reset MBO Password = App801-backed MBO credential only, never native Kintone password.
- No active deploy or reset-execution authorization.

## 10. Authorization ledger

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

## 11. Exact next action

Antigravity performs only Gate 2 from `AI_ACTIVE_TASK.md`, modifies exactly the 2 allowed files, runs only the focused integration test plus `git diff --check`, commits/pushes one focused commit, and STOPs. ChatGPT then independently reviews before any Gate 3 work.
