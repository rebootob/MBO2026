# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Control Plane: ChatGPT  
> Execution Plane: Antigravity only for minimum necessary execution  
> Updated: 2026-08-30 20:45 ICT — OPERATIONAL DOC SYNC / HOME INDEX INTEGRATION R1 OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core R1 PASS. Hybrid Employee-Self Runtime Entry PASS after build + 1024/1024 regression. Native current-assignee contract PASS. Approval Authority Service R1 PASS. Current gate = Home Index integration only. |
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

No broad scans, broad reports, full tests, build, live reads/writes or deploy unless the exact current gate requires them.

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

## 5. App53 dedicated mapping state

```text
APP53_ENVIRONMENT = PRODUCTION
APP53_DEFAULT_MODE = READ_ONLY
APP53_MAPPING_AUDIT = COMPLETED
MBO_Kintone_User_FIELD_DESIGN = CONFIRMED USER_SELECT
MBO_Kintone_User_LIVE_FIELD_CREATED = NO
VASSANA = vassana -> App53 #456 -> emp_text 0044 -> ACTIVE
NATTA = natta -> App53 #578 -> emp_text BLANK -> canonical Employee_Code unresolved -> FAIL CLOSED
```

Do not create/populate the mapping field or correct Natta without separate exact production authorization.

## 6. Own-MBO self-appraiser rule

```text
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

For own MBO only, remove the self appraiser before workflow snapshot, preserve remaining order/rules, recalculate topology, never autoapprove or fabricate history, never rewrite App795. If no non-self appraiser remains, fail closed.

Confirmed Natta example: `TMG1|Marketing natta -> uchida` becomes `uchida / M1_ONLY` for Natta's own MBO only.

## 7. My Approval Tasks authority — PASS foundation

Runtime READ-ONLY proof established:

```text
CURRENT_ASSIGNEE_FIELD = Assignee
CURRENT_ASSIGNEE_TYPE  = STATUS_ASSIGNEE
STATUS_FIELD           = Status
```

Canonical authority:

```text
LIST = DEDICATED + Assignee in (LOGINUSER()) + exact returned Assignee.value[].code
OPEN/ACTION = fresh App794 GET + STATUS_ASSIGNEE + exact current dedicated user code
SHARED_APPROVER_AUTHORITY = DENIED
```

Never authorize from App795 static membership, `Manager_User`, `GM_User`, `First_Manager_User`, caller role strings, UI visibility or Employee-Self ownership.

Accepted service corrective commit:
`5ac5ede6e40a1462f0398ba8740330742041e3bf`.

Service contract PASS:
- direct `getRecord(appId,id) -> record` seam;
- exactly one fresh GET per revalidation;
- no `getRecords` fallback for revalidation;
- every public authority path enforces Dedicated context;
- exact/case-sensitive Assignee code.

## 8. Integration split — mandatory

Inventory proved current detail and process seams must remain separate:

```text
GATE 1 = HOME INDEX INTEGRATION ONLY — OPEN
GATE 2 = DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY — PENDING
GATE 3 = PROCESS.PROCEED FRESH ASSIGNEE REVALIDATION — PENDING
```

Gate 1 alone is NOT deploy-ready.

## 9. Current Active Task

```text
ACTIVE_TASK = D1 MY APPROVAL TASKS — LEAN HOME INDEX INTEGRATION R1
TASK_STATE  = OPEN / READY FOR ANTIGRAVITY EXECUTION
EXECUTOR_COMMIT = NONE AT DOCUMENT-SYNC CHECKPOINT
OWNER       = ANTIGRAVITY
ALLOWED     = 3 exact files
FOCUSED_TEST= tests/employee-main-mbo-app-integration.test.js only
BUILD       = NO
FULL_TEST   = NO
LIVE_KINTONE= NO
DEPLOY      = NO
```

Exact contract is in `AI_ACTIVE_TASK.md`. Always re-fetch HEAD before deciding whether it is still unexecuted.

## 10. App800 Reset MBO Password

- Core reset semantics accepted.
- HR/admin native authority readiness accepted.
- App800 Reset UI source/tooling accepted.
- Live App800 remains prior read-only/MVP customization.
- Reset MBO Password = App801-backed MBO credential only, never native Kintone password.
- No active deploy or reset-execution authorization.

## 11. Authorization ledger

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

## 12. Handoff state

Operational documents are synchronized for new-chat continuation. New chats must use:
- `CHAT_HANDOFF.md`
- `NEW_CHAT_BOOTSTRAP_PROMPT.md`
- current HEAD + this Control Center + Active Task.

Exact next action if Active Task is still open/unexecuted: Antigravity performs Gate 1 only, focused test + `git diff --check`, one commit/push, STOP; ChatGPT then independently reviews.