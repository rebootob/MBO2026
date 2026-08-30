# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary source/runtime execution
> Updated: 2026-08-30 — HYBRID RUNTIME LOGIC PASS / MILESTONE BLOCKED BY LEGACY TEST FIXTURES

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 IN PROGRESS. App794 Rev60 accepted. Hybrid Identity Core Source R1 PASS. Hybrid Employee-Self Runtime Entry source logic and tree cleanup PASS. Source-acceptance milestone reached `npm test = FAIL` because legacy tests still model numeric/prefix native principals as SHARED. This is classified as TEST FIXTURE COMPATIBILITY, not a proven source defect. |
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
exact edit -> smallest focused check -> commit/push -> STOP
```

Do not use Antigravity for broad scans, repeated full suites, repeated builds, evidence docs, or Control Plane writing.

## 3. Accepted Hybrid Runtime Logic

```text
HYBRID_IDENTITY            = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
HYBRID_CORE_SOURCE         = PASS
HYBRID_RUNTIME_ENTRY_LOGIC = PASS
TREE_CLEANUP_R3            = PASS
SOURCE_ACCEPTED            = NOT YET — MILESTONE TEST FIXTURE CORRECTIVE OPEN
LIVE_DEPLOY_READY          = NO
```

Approved SHARED native principals are exactly:
```text
t1, t2, s1, f1, f2, f3, e1, tmh, g_request
```

Numeric Employee_Code, `req*`, `test*`, `user*`, or session presence does NOT make a native Kintone principal SHARED.

## 4. Source-Acceptance Milestone Result

User supplied the local verification result:
```text
npm test                  = FAIL
first reported failure    = tests/timeline-truthfulness-and-attachment.test.js
npm run ui:build          = PASS
git diff --check          = PASS
FINAL_WORKTREE_CLEAN      = YES
SOURCE_CHANGES            = 0
TEST_CHANGES              = 0
LIVE_KINTONE_OPERATIONS   = 0
APP53_PRODUCTION_TOUCHED  = NO
```

Independent source inspection classifies the failure as a legacy Shared-mode fixture incompatibility:
- `tests/timeline-truthfulness-and-attachment.test.js` uses native Kintone principal `0118` while the mocked MBO Employee_Code is also `0118`; under the confirmed exact-principal contract, numeric `0118` is DEDICATED candidate, so fail-closed is correct. For this Shared-path test, native principal must be an approved shared code such as `f1`, while MBO Employee_Code remains `0118`.
- `tests/objective-save-validation.test.js` uses native principal `req1` and App795 requester `req1`; `req*` is intentionally no longer a SHARED heuristic. For this Shared-path fixture, use approved shared `s1`, keeping Employee_Code `0118`.
- `tests/create-handler-form-state.test.js` contains Shared-path fixtures using native/session/requester numeric codes (`0113`, and failure-path `9999`). These must separate native shared principal (`s1`) from MBO Employee_Code (`0113` / `9999`).

These fixture changes were seen in the earlier candidate and were previously restored as over-scope; the milestone failure now proves the compatibility correction is necessary.

No Hybrid source logic is reopened by this failure.

## 5. App53 Production Protection — MANDATORY

```text
APP53_ENVIRONMENT       = PRODUCTION
APP53_DEFAULT_MODE      = READ_ONLY
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH   = NONE
LIVE_KINTONE_OPERATIONS = 0
```

No App53 access/change is authorized. Do not create `MBO_Kintone_User`. Do not modify Natta `emp_text`.

## 6. Current Active Task

```text
ACTIVE_TASK = D1 HYBRID RUNTIME — LEGACY SHARED TEST FIXTURE COMPATIBILITY R1
OWNER       = ANTIGRAVITY
SOURCE_EDIT = NONE
TEST_EDIT   = EXACT 3 FILES ONLY
FULL_TEST   = NO
UI_BUILD    = NO
LIVE_KINTONE= NO
DEPLOY      = NO
```

Exact minimal fixture substitutions and focused checks are in `AI_ACTIVE_TASK.md`.

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

## 8. Next Gate

After the exact three test-fixture corrections pass focused review, run one final milestone verification with **build first, then full test**, restore generated dist, and stop. No repeated full suite during the fixture corrective.