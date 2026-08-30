# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary source/runtime execution
> Updated: 2026-08-30 — HYBRID EMPLOYEE-SELF RUNTIME SOURCE = PASS / SOURCE-ACCEPTANCE MILESTONE VERIFICATION OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core Source R1 PASS. Hybrid Employee-Self Runtime Entry source logic + focused tests + cleanup are now PASS. Next gate = one source-acceptance milestone verification only. Protected App53/group/ACL/deploy remain unauthorized. My Approval Tasks remains deferred pending separate current-native-assignee proof. |
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

Ordinary corrective:
```text
exact edit -> smallest focused tests -> git diff --check -> commit/push -> STOP
```

Full repository test/build is reserved for milestone gates only, not every corrective.

## 3. Accepted Hybrid Runtime Source

```text
HYBRID_IDENTITY             = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
HYBRID_CORE_SOURCE          = PASS
HYBRID_RUNTIME_ENTRY_LOGIC  = PASS
TREE_CLEANUP_R3             = PASS
SOURCE_ACCEPTANCE_MILESTONE = OPEN
LIVE_DEPLOY_READY           = NO
```

Accepted runtime behavior:
- SHARED only for exact native principals: `t1,t2,s1,f1,f2,f3,e1,tmh,g_request`;
- any ordinary non-shared principal is DEDICATED candidate;
- DEDICATED mapping uses exact `MBO_Kintone_User`, `Number_0=1`, canonical `emp_text`;
- missing/ambiguous/invalid dedicated mapping fails closed and never falls back to SHARED login;
- valid DEDICATED works without App801/MBO Login gate;
- Create uses resolved local `context.mode` + `context.kintoneUserCode` only;
- dedicated Create snapshots dedicated requester identity;
- Employee-Self delete guard works through registered runtime handler for both modes;
- no My Approval Tasks implementation in this source gate.

## 4. Lean Tree Cleanup R3 — PASS

Executor cleanup commit:
```text
ce1e3111c7927cc45f8efee0477f03c2c181f608
```

Independent review:
- exactly 1 commit after Control Plane cleanup base;
- commit changes only the five requested restore paths;
- those five paths are now identical to Control Plane base `248174b67735a26318bbeadf8e341f8a3db31708` and disappear from the cumulative implementation diff;
- no source logic/test logic was changed in R3;
- unauthorized corrective evidence remains deleted;
- `tests/hr-control-center-reset-ui.test.js` intentionally remains restored to accepted pre-WP blob `eb2a3cdfb6bee6a6d67f15cc3210f139a1635756`.

Current cumulative implementation diff from Lean base contains only intended Control Plane docs + Hybrid source/tests + the exact HR-test restoration; no generated dist/unrelated test residue remains.

## 5. App53 Production Protection — MANDATORY

```text
APP53_ENVIRONMENT       = PRODUCTION
APP53_DEFAULT_MODE      = READ_ONLY
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH   = NONE
```

Current audited facts:
```text
Vassana: vassana -> App53 #456 -> emp_text 0044 -> Active 1
Natta:   natta   -> App53 #578 -> emp_text BLANK -> Active 1
MBO_Kintone_User live field = NOT YET CREATED
```

No App53 change is authorized. Natta Employee_Code must never be guessed.

## 6. Current Active Task

```text
ACTIVE_TASK = D1 HYBRID EMPLOYEE-SELF RUNTIME R1 — SOURCE-ACCEPTANCE MILESTONE VERIFICATION
OWNER       = ANTIGRAVITY
SOURCE_EDIT = NONE
TEST_EDIT   = NONE
FULL_TEST   = ONE RUN ONLY
UI_BUILD    = ONE RUN ONLY
EVIDENCE_DOC= NO
APP53_LIVE  = NO
DEPLOY      = NO
```

Exact minimal commands and stop rules are in `AI_ACTIVE_TASK.md`.

## 7. Authorization Ledger

```text
ACTIVE_LIVE_AUTH          = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH        = NONE
ACTIVE_ACL_WRITE_AUTH     = NONE
ACTIVE_GROUP_WRITE_AUTH   = NONE
APP53_SCHEMA_WRITE_AUTH   = NONE
APP53_RECORD_WRITE_AUTH   = NONE
APP53_BULK_WRITE_AUTH     = NONE
ROLLBACK_AUTH             = NONE
```

No App53/App794/App795/App801 live write, ACL/group change, customization upload/deploy, password reset, Process update, or rollback is authorized.

## 8. Next Gate

If the one-time source-acceptance milestone verification passes, ChatGPT may mark Hybrid Employee-Self Runtime Entry source accepted. Protected Kintone configuration and My Approval Tasks remain separate later gates.