# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-30 — REV58 UAT FOUND FATAL-CREATE EXIT UX DEFECT / SOURCE CORRECTIVE OPEN / NO LIVE WRITE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev58 technical deployment PASS. Duplicate same-year fatal-state Back visibility UAT PASS, but Back currently triggers Kintone/browser unsaved-change leave confirmation. User explicitly requires no leave-confirm popup on this terminal duplicate/fatal state. Source corrective opened; Live deploy not authorized. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🟠 Copy own previous MBO ready only on a future explicit task |
| D6 | 🔴 Integrated E2E / Security / Regression pending |
| D7 | ✅ Admin Support Center source functionality CLOSED |

## 2. Actual Live App794

```text
LIVE_ACTUAL_REVISION        = 58
DEPLOYED_SOURCE_COMMIT      = 98108e9e387d01b6d3c3a35cce5baf13324be50e
LIVE_SCOPE                  = ALL
LIVE_TOPOLOGY               = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY            = f097f67404fb75418cf85fee635e5d630ef5474d
LIVE_CSS_IDENTITY           = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
TECHNICAL_READBACK          = PASS
USER_RUNTIME_UAT            = FAIL/PARTIAL — FATAL CREATE BACK TRIGGERS LEAVE-CONFIRM DIALOG
ACCEPTED_KNOWN_GOOD_REVISION = 57 UNTIL CORRECTIVE + NEW UAT PASS
```

Rev58 remains actual Live but is not accepted known-good.

## 3. Confirmed UAT Evidence / Requirement

User-confirmed behavior on actual Live Rev58:

- Authenticated duplicate same-year Create correctly reaches terminal `Employee Profile Resolution Failed` state.
- Duplicate creation is blocked fail-closed.
- Exactly one `← กลับหน้า My MBO / Back to My MBO` is visible.
- Clicking Back begins navigation but Kintone/browser shows `ออกจากเว็บไซต์ไหม / changes may not be saved` confirmation.
- User explicitly requires that this popup **must not appear** on the terminal duplicate/fatal state because there is nothing valid to save.
- User also wants native Kintone `Save` and `Cancel` hidden on the terminal fatal state to avoid confusion.

Target UX for this state:

```text
Fatal duplicate Create terminal state
  -> Error message remains
  -> Exactly one Back to My MBO action
  -> Native Save hidden
  -> Native Cancel hidden
  -> Click Back returns /k/794/ in same tab
  -> No leave-confirm / unsaved-change popup
  -> No record save/create
  -> No workflow mutation
  -> No auth/session mutation
```

This requirement is narrowly scoped to authenticated terminal Create fatal/duplicate recovery. Normal Create/Edit unsaved-change protection must remain intact.

## 4. Root-Cause Direction

Existing canonical Back component is `src/ui/employee-record-navigation.js` and currently renders a normal same-tab anchor to `/k/{appId}/`.

The corrective must not globally suppress browser/Kintone unload protection. The preferred root-cause direction is:
- determine what mutates/dirty-flags the Create form before duplicate detection (for example Fiscal Year defaulting, lookup/autoload, or `kintone.app.record.set` synchronization);
- perform duplicate preflight before any native form mutation where feasible;
- only after duplicate preflight passes may normal Create autoload/default/form synchronization proceed;
- terminal duplicate/fatal state must be rendered from an unmodified/clean native Create form state;
- hide native Save/Cancel only while that terminal fatal state is active.

Forbidden workaround:
- no global `window.onbeforeunload = null`;
- no global unload/beforeunload monkey patch;
- no disabling unsaved-change warning for normal Create/Edit;
- no broad CSS that hides Save/Cancel outside fatal state.

## 5. Current Active Task

```text
ACTIVE_TASK                   = APP794 FATAL CREATE CLEAN-EXIT CORRECTIVE R1 / SOURCE ONLY
OWNER                         = ANTIGRAVITY
FEATURE                       = Fatal duplicate Create recovery without unsaved-change dialog
CANONICAL_SOURCE_OWNER        = src/main-mbo-app.js (fatal Create orchestration)
SUPPORTING_MODULE             = src/ui/employee-record-navigation.js only if needed
FOCUSED_TESTS                 = tests/employee-main-mbo-app-integration.test.js + tests/employee-record-navigation.test.js
GENERATED_DIST_OUTPUT         = dist/mbo-employee-app.js through normal build only
LIVE_RESOURCE                 = NONE — NO DEPLOY AUTHORIZATION
```

Exact packet is in `project-docs/AI_ACTIVE_TASK.md`.

## 6. Safety / Authorization Ledger

```text
LATEST_DEPLOY_AUTH_ID         = APP794-CUMULATIVE-DEPLOY-20260830-01
LATEST_DEPLOY_AUTH_STATUS     = CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH              = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ACTIVE_DEPLOY_AUTH            = NONE
APP801_LIVE_WRITE             = NO
ROLLBACK_AUTH                 = NONE
```

No Live Kintone write, customization upload, deploy, retry, rollback, App801 write, schema/layout/ACL/process change is authorized.

## 7. Current Gate

```text
CURRENT_GATE                  = FATAL CREATE CLEAN-EXIT SOURCE CORRECTIVE / PENDING ANTIGRAVITY THEN CHATGPT REVIEW
CURRENT_MODE                  = SOURCE + TEST + LOCAL BUILD ONLY / NO KINTONE NETWORK
REV58_ACTUAL_LIVE             = YES
REV58_ACCEPTED_KNOWN_GOOD     = NO
NEXT_OWNER                    = ANTIGRAVITY FOR EXACT ACTIVE TASK
```
