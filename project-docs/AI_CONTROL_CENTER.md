# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-08-30 — D1 GATE 2 INDEPENDENT REVIEW = CORRECTIVE / TEST EVIDENCE ONLY

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core R1 PASS. Hybrid Employee-Self Runtime Entry PASS. Native current-assignee contract PASS. Approval Authority Service R1 PASS. Home Index Gate 1 PASS. Gate 2 implementation candidate `19b81fa01b337835fbff8af2dc21622aba4eb9e6` reviewed CORRECTIVE for incomplete UI-pipeline test evidence only; source implementation not rejected. |
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
TECHNICAL_READBACK     = PASS WITH AUDIT CAVEAT
USER_RUNTIME_UAT       = PASS
```

Rev60 fatal-Create clean exit is accepted and must not be reopened without regression evidence.

## 4. Hybrid Identity / App53 protected state

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
APP53_ENVIRONMENT = PRODUCTION
APP53_DEFAULT_MODE = READ_ONLY
VASSANA = vassana -> App53 #456 -> emp_text 0044 -> ACTIVE
NATTA = natta -> App53 #578 -> emp_text BLANK -> FAIL CLOSED
```

No App53 write is authorized.

## 5. My Approval Tasks authority — accepted foundation

```text
LIST = DEDICATED + Assignee in (LOGINUSER()) + exact returned Assignee.value[].code
OPEN/ACTION = fresh App794 GET + STATUS_ASSIGNEE + exact current dedicated user code
SHARED_APPROVER_AUTHORITY = DENIED
```

Never authorize from App795 static membership, `Manager_User`, `GM_User`, `First_Manager_User`, caller role strings, UI visibility or Employee-Self ownership.

Accepted authority service commit: `5ac5ede6e40a1462f0398ba8740330742041e3bf`.

## 6. Gate status

```text
GATE 1 = HOME INDEX INTEGRATION — ✅ PASS
GATE 2 = DEDICATED CROSS-EMPLOYEE DETAIL AUTHORITY — 🟠 CORRECTIVE / TEST EVIDENCE ONLY
GATE 3 = PROCESS.PROCEED FRESH ASSIGNEE REVALIDATION — PENDING
```

Gate 2 executor candidate:

```text
COMMIT = 19b81fa01b337835fbff8af2dc21622aba4eb9e6
PARENT = fa3c5ee3a8b0c9c8ae45cdf9d0caedcbaa8f1ab8
CHANGED_FILES = src/main-mbo-app.js + tests/employee-main-mbo-app-integration.test.js ONLY
SOURCE_REVIEW = broadly conformant to Gate 2 authority contract
INDEPENDENT_DECISION = CORRECTIVE
```

Accepted source-review observations:
- own-record Detail/Edit path does not invoke approval revalidation;
- only Dedicated cross-employee Detail attempts `MboApprovalTaskService.revalidateApprovalTask()`;
- fresh revalidation is exactly the accepted service seam; no second Assignee validator was added;
- authorized bypass is an internal explicit flag consumed by the existing ownership guard;
- bound Employee-Self context is not reassigned to the target employee;
- Shared cross-employee and Dedicated cross-employee Edit remain outside the bypass path;
- Gate 3 Process Proceed logic was not changed;
- exactly the two allowed files changed.

Independent review finding:
- the focused test does not directly prove that an authorized cross-employee Detail actually enters the target `EmployeePartAUI` pipeline;
- `assert.equal(handlerResult, event)` is not sufficient because blocked/config-error paths can also return the event;
- denied/API-error/missing/shared/edit checks using only `host.children.length > 0` do not directly prove the target Detail UI was not entered;
- the authorized test fixture is intentionally sparse and can trigger existing fail-closed UI configuration behavior, so handler-return evidence alone is ambiguous.

Therefore Gate 2 is not independently accepted yet. This is a **test-evidence corrective only**. Do not reopen/refactor `src/main-mbo-app.js` unless the corrected direct pipeline assertions expose a real source defect.

Gate 2 alone is NOT deploy-ready. Gate 3 and protected native ACL/group configuration remain pending separately.

## 7. Current Active Task

```text
ACTIVE_TASK = D1 MY APPROVAL TASKS — GATE 2 UI-PIPELINE TEST EVIDENCE CORRECTIVE R1
TASK_STATE  = CORRECTIVE / READY FOR MINIMUM ANTIGRAVITY EXECUTION
REVIEW_TARGET = 19b81fa01b337835fbff8af2dc21622aba4eb9e6
OWNER       = ANTIGRAVITY
ALLOWED     = tests/employee-main-mbo-app-integration.test.js ONLY
SOURCE_IMPLEMENTATION_CHANGE = NO
FOCUSED_TEST= tests/employee-main-mbo-app-integration.test.js only
BUILD       = NO
FULL_TEST   = NO
LIVE_KINTONE= NO
DEPLOY      = NO
```

Exact corrective contract is in `AI_ACTIVE_TASK.md`.

## 8. App800 Reset MBO Password

- Core reset semantics accepted.
- HR/admin native authority readiness accepted.
- App800 Reset UI source/tooling accepted.
- Live App800 remains prior read-only/MVP customization.
- No active deploy or reset-execution authorization.

## 9. Authorization ledger

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

## 10. Exact next action

Antigravity performs only the one-file Gate 2 test-evidence corrective in `AI_ACTIVE_TASK.md`, runs only the focused integration test plus `git diff --check`, commits/pushes one focused correction, and stops. ChatGPT then independently reviews that correction before any Gate 3 work.
