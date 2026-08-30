# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-08-30 — D1 HOME INDEX GATE 1 INDEPENDENT REVIEW = PASS

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core R1 PASS. Hybrid Employee-Self Runtime Entry PASS. Native current-assignee contract PASS. Approval Authority Service R1 PASS. Home Index Gate 1 implementation `cb2fae671e610924e7143806944b3dcdf527f2f0` + test-evidence corrective `f276de19a5771d7ac0bd73f51509cb912aca24d5` independently reviewed PASS. Gate 2 remains pending. |
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

## 7. My Approval Tasks authority — accepted foundation

```text
CURRENT_ASSIGNEE_FIELD = Assignee
CURRENT_ASSIGNEE_TYPE  = STATUS_ASSIGNEE
STATUS_FIELD           = Status

LIST = DEDICATED + Assignee in (LOGINUSER()) + exact returned Assignee.value[].code
OPEN/ACTION = fresh App794 GET + STATUS_ASSIGNEE + exact current dedicated user code
SHARED_APPROVER_AUTHORITY = DENIED
```

Never authorize from App795 static membership, `Manager_User`, `GM_User`, `First_Manager_User`, caller role strings, UI visibility or Employee-Self ownership.

Accepted service corrective commit: `5ac5ede6e40a1462f0398ba8740330742041e3bf`.

## 8. Integration split — mandatory

```text
GATE 1 = HOME INDEX INTEGRATION ONLY — ✅ PASS
GATE 2 = DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY — PENDING
GATE 3 = PROCESS.PROCEED FRESH ASSIGNEE REVALIDATION — PENDING
```

Gate 1 accepted source chain:

```text
IMPLEMENTATION_COMMIT = cb2fae671e610924e7143806944b3dcdf527f2f0
TEST_CORRECTIVE_COMMIT = f276de19a5771d7ac0bd73f51509cb912aca24d5
INDEPENDENT_DECISION  = PASS
```

Accepted Gate 1 behavior:
- DEDICATED Home preserves canonical `My MBO` and separately renders `งานรอฉันอนุมัติ / My Approval Tasks` from accepted current-assignee service;
- SHARED Home preserves canonical `My MBO`, performs zero approval-task query, and renders no approval section;
- exact returned Assignee code filtering remains authoritative for task list;
- approval fetch failure fails closed for approval tasks while preserving already-rendered `My MBO`;
- no App795/static authority fallback was introduced;
- Gate 1 did not implement cross-employee Detail authority or Process action revalidation.

Independent review of corrective commit confirmed exactly one changed file (`tests/employee-main-mbo-app-integration.test.js`) with 18 additions / 0 deletions and direct DOM assertions for My MBO preservation in Dedicated, Shared, and approval-fetch-error scenarios. ChatGPT could not independently replay the Node test in its current runtime because external Git clone/network resolution was unavailable; therefore no false claim of an independent test rerun is made. The code/test diff itself is accepted as conformant, and no additional Antigravity rerun is required solely for duplicate evidence.

Gate 1 alone is NOT deploy-ready. Gate 2 and Gate 3 remain separate pending gates.

## 9. Current Active Task

```text
ACTIVE_TASK = NONE — GATE 1 ACCEPTED
TASK_STATE  = CLOSED / WAITING_FOR_CONTROL_PLANE_NEXT_GATE
OWNER       = CHATGPT
ANTIGRAVITY_ACTION = NONE
BUILD       = NO
FULL_TEST   = NO
LIVE_KINTONE= NO
DEPLOY      = NO
```

Do not let Antigravity continue automatically into Gate 2. The Control Plane must first open a new exact Gate 2 packet when continuation is requested.

## 10. App800 Reset MBO Password

- Core reset semantics accepted.
- HR/admin native authority readiness accepted.
- App800 Reset UI/tooling accepted.
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

## 12. Exact next action

Wait for Control Plane continuation. On `ต่อ` / `ต่อไป`, ChatGPT fresh-fetches repository truth and opens only the smallest necessary Gate 2 work package if still required. Do not spend Antigravity credit before that packet exists.
