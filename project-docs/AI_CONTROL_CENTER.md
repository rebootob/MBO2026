# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-30 — REV59 USER UAT FAIL / LEAVE-CONFIRM STILL APPEARS / SOURCE CORRECTIVE OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev59 technical deployment readback PASS with audit caveat, but User Runtime UAT FAILED because clicking the canonical Back control on authenticated fatal duplicate Create still triggers Kintone/browser leave-confirmation. New source-only corrective is open. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🟠 Copy own previous MBO ready only on a future explicit task |
| D6 | 🔴 Integrated E2E / Security / Regression pending |
| D7 | ✅ Admin Support Center source functionality CLOSED |

## 2. Actual Live App794

```text
LIVE_ACTUAL_REVISION          = 59
LIVE_SCOPE                    = ALL
LIVE_TOPOLOGY                 = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY              = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
LIVE_CSS_IDENTITY             = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
PREVIEW_REVISION              = 59
PREVIEW_SCOPE                 = ALL
PREVIEW_TOPOLOGY              = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
TECHNICAL_DEPLOYMENT_REVIEW   = PASS WITH AUDIT CAVEAT
USER_RUNTIME_UAT              = FAIL — BACK STILL TRIGGERS LEAVE-CONFIRM DIALOG
ACCEPTED_KNOWN_GOOD_REVISION  = 57
```

Rev59 remains actual Live but is **not** accepted known-good. Do not deploy again and do not rollback without a new explicit user authorization.

## 3. Rev59 User UAT Evidence

User-provided Live screenshot on 2026-08-30 shows authenticated duplicate same-year Create terminal state for Employee 0113 / FY2026:
- URL remains `/k/794/edit`;
- `Employee Profile Resolution Failed` is visible;
- duplicate creation remains blocked;
- exactly one canonical `← กลับหน้า My MBO / Back to My MBO` control is visible;
- native Save/Cancel are not visibly exposed on the terminal screen;
- after clicking Back, the browser/Kintone dialog appears: equivalent to `ออกจากเว็บไซต์ไหม / ระบบอาจไม่ได้บันทึกการเปลี่ยนแปลงของคุณ`.

Decision:

`REV59 USER UAT = FAIL`

The no-popup requirement is not satisfied. Rev59 must not be promoted to accepted known-good.

## 4. Independent Source Finding After UAT Failure

Deployed source candidate remains:

`4472aa2f1c63bf08788b39b4ad54b7ea55808df1`

Two relevant source facts are confirmed:

1. `EmployeeRecordNavigation` still renders a plain anchor `href=/k/<appId>/`. The fatal Create call site does **not** provide `onNavigateHome`, so Back performs ordinary browser navigation and is still subject to Kintone's Create-page leave protection.
2. In `setupRecordUiWithAuth(...)`, `EmployeePartAUI` is instantiated and `ui.render()` executes before the authenticated Create duplicate preflight. Therefore the prior assumption that duplicate rejection occurs before all custom Create-page state/setup is too strong even though the Fiscal Year default and `kintone.app.record.set()` were moved after duplicate preflight.

The current corrective should solve the observed UAT defect without disabling normal Kintone unsaved-change protection.

## 5. New Corrective Design Direction

For **authenticated terminal fatal duplicate Create only**:
- preserve the visible fatal error;
- preserve exactly one canonical Back control;
- native Save/Cancel remain hidden from the user;
- Back must invoke **native Kintone Cancel semantics** for the current Create page, not a plain browser navigation;
- native Cancel should discard the invalid unsaved Create and return to App794 index in the same tab without the browser leave-confirm popup;
- do not use `window.onbeforeunload`, `removeEventListener('beforeunload', ...)`, global unload monkey-patching, history hacks, or direct global suppression;
- do not save/create/update a record;
- do not mutate workflow/auth/session;
- do not change normal Create/Edit unsaved-change protection.

This narrow terminal-fatal use of native Cancel semantics supersedes the earlier internal implementation restriction against programmatic cancel. It is permitted only because the invalid duplicate Create must be discarded and User UAT proves plain navigation cannot satisfy the required UX.

If the native Cancel control cannot be resolved safely at runtime, fail closed and do not fall back to global unload suppression or a second navigation trick.

## 6. Current Active Task

```text
ACTIVE_TASK                  = APP794 FATAL CREATE NATIVE-CANCEL CLEAN-EXIT CORRECTIVE R4 / SOURCE ONLY
OWNER                        = ANTIGRAVITY
FEATURE                      = Fatal duplicate Create Back exits through native Kintone Cancel semantics
CANONICAL_SOURCE_OWNER       = src/main-mbo-app.js
SUPPORTING_MODULE            = src/ui/employee-record-navigation.js only if needed for injected navigation handler
FOCUSED_TESTS                = tests/employee-main-mbo-app-integration.test.js + tests/employee-record-navigation.test.js
GENERATED_DIST_OUTPUT         = dist/mbo-employee-app.js through normal build only
LIVE_RESOURCE                 = NONE — NO DEPLOY AUTHORIZATION
```

Exact packet is in `project-docs/AI_ACTIVE_TASK.md`.

## 7. Authorization Ledger

```text
LATEST_DEPLOY_AUTH_ID         = APP794-FATAL-CREATE-CLEAN-EXIT-DEPLOY-20260830-01
LATEST_DEPLOY_AUTH_STATUS     = CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH              = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ACTIVE_DEPLOY_AUTH            = NONE
ROLLBACK_AUTH                 = NONE
```

## 8. Known-Good Rollback Baseline

```text
ROLLBACK_KNOWN_GOOD_REVISION = 57
ROLLBACK_SOURCE_COMMIT       = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
ROLLBACK_JS_IDENTITY         = ac22a56cb9d78001384241fe12745f7a2da3da84
ROLLBACK_CSS_IDENTITY        = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
ROLLBACK_SCOPE               = ALL
ROLLBACK_TOPOLOGY            = 1/1/0/0
ROLLBACK_AUTHORIZED          = NO
```

Rollback requires separate explicit authorization and is never automatic.

## 9. Current Gate

```text
CURRENT_GATE                  = REV59 UAT FAIL / FATAL CREATE NATIVE-CANCEL SOURCE CORRECTIVE
CURRENT_MODE                  = SOURCE + TEST + LOCAL BUILD ONLY / NO KINTONE NETWORK / NO DEPLOY
LIVE_ACTUAL_REVISION          = 59
REV59_TECHNICAL_REVIEW        = PASS WITH AUDIT CAVEAT
REV59_USER_UAT                = FAIL
REV59_ACCEPTED_KNOWN_GOOD     = NO
NEXT_OWNER                    = ANTIGRAVITY FOR EXACT ACTIVE TASK
```
