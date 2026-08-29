# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO LIVE PASS / LIST→CREATE SESSION PASS / LIVE CREATE STILL ON OLD CUSTOMIZATION AND FAILS / DEPLOY GUARD INTEGRATION NEXT / FINAL UAT BLOCKED |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / MODULE-AWARE BUNDLE DEPENDENCY CLOSURE ACCEPTED |

No AI may silently drop D1–D7.

## 2. Architecture / Gate Ledger

```text
D1_ARCHITECTURE                         = KINTONE-ONLY / USER RECONFIRMED 2026-08-29
EXTERNAL_SERVER_SERVICE                 = FORBIDDEN
AUTH_BRIDGE                             = CANCELLED / SUPERSEDED / DO NOT IMPLEMENT
SERVICES_MBO_AUTH_BRIDGE                = ABANDONED EXPERIMENT / NOT PRODUCTION PATH
D1_SESSION_CONTINUITY_ARCHITECTURE      = PASS / KINTONE-ONLY 8H SAME-TAB SESSION
APP801_SESSION_SCHEMA_WRITE             = PASS / ACCEPTED
D1_BUNDLE_DEPENDENCY_CORRECTIVE         = PASS
D1_CREATE_HANDLER_CORRECTIVE            = PASS / SOURCE ACCEPTED PREVIOUSLY / NOT YET LIVE
D1_EMPLOYEE_SELF_INDEX_SOURCE_TEST      = PASS
D1_EMPLOYEE_SELF_INDEX_VISUAL           = PASS
D1_MY_MBO_HISTORY_LIST                  = PASS
D1_MY_MBO_COMPLETED_STATUS_DISPLAY      = PASS
D1_EMPLOYEE_SELF_DELETE_GUARD           = PASS
MBO_EMPLOYEE_ACCESS_s1_MEMBERSHIP       = PASS / USER LIVE SCREENSHOT
APP801_PERMISSION_ROW_TARGET            = PASS / VIEW+EDIT ONLY FOR MBO_EMPLOYEE_ACCESS
APP801_PRIVATE_APP_GROUP_BLOCKER         = CONFIRMED ROOT CAUSE
APP801_APP_GROUP_PUBLIC_CORRECTION       = USER APPLIED 2026-08-29
APP801_SHARED_PRINCIPAL_s1_LIVE_ACCESS  = PASS / 128 RECORDS VISIBLE
D1_HR_ADMIN_PASSWORD_RESET_REQUIREMENT  = PASS / BASELINED
D1_RESET_PASSWORD_0113                  = PASS / AUTHORIZATION CONSUMED / CREDENTIAL VERSION 2
D1_FORCE_PASSWORD_CHANGE_0113           = PASS / USER LIVE OBSERVATION
D1_LOGIN_0113_TO_MY_MBO                 = PASS / USER LIVE OBSERVATION
D1_LIST_TO_CREATE_SESSION_CONTINUITY    = PASS / USER LIVE OBSERVATION
D1_CREATE_LIVE_RUNTIME                  = FAIL / OLD LIVE CUSTOMIZATION CALLS kintone.app.record.get() DURING HANDLER
APP794_DELETE_PERMISSION_READONLY_CHECK = PENDING
APP794_DEPLOY_GUARD_INTEGRATION         = NEXT / SOURCE+TEST ONLY
APP794_CORRECTIVE_DEPLOY                = NOT AUTHORIZED YET
D1_LIVE_CUTOVER                         = BLOCKED UNTIL CORRECTIVE DEPLOY + REMAINING UAT
D2-D7 LIVE WRITES                       = NOT AUTHORIZED unless separately recorded
```

## 3. Non-Negotiable Constraint

D1 authentication must finish entirely inside Kintone.

```text
NO external Node server
NO cloud auth service
NO external database
NO reverse proxy
NO external session service
NO Auth Bridge
```

Do not continue, deploy, host or integrate `services/mbo-auth-bridge/`.

Canonical Baselines:
- `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md`

## 4. Accepted Live Evidence — 2026-08-29

### App801 / login boundary
- `s1` is in `MBO_EMPLOYEE_ACCESS`.
- App801 permission row grants `MBO_EMPLOYEE_ACCESS` View=YES, Edit=YES, Add/Delete/Manage/Import/Export=NO.
- `Everyone` remains denied.
- App801 was moved from `Private` to `Public`; after apply, `s1` can open App801 and see 128 records.

### Reset + forced password change
Exact reset for Employee_Code `0113` succeeded with read-back:
- Account_Status ACTIVE unchanged;
- Force_Password_Change YES;
- Failed_Attempts 0;
- Locked_Until blank;
- Credential_Version 2;
- all session fields cleared;
- `RESET_0113_OVERALL_PASS = true`.

The one-time reset authorization is CONSUMED.

Live App794 then proved:
1. login with `0113 / 0113` reaches **Password Change Required**;
2. Employee-Self content is blocked until password change completes;
3. after setting a new password, App794 opens **My MBO Records (0113)**;
4. clicking `+ Create New MBO` stays authenticated and reaches `/k/794/edit` without returning to Login.

Therefore Reset / Force Change / Login / My MBO / List→Create session continuity are accepted as live PASS.

### Remaining live defect
On `/k/794/edit`, the live customization still shows:

```text
Employee Profile Resolution Failed
Could not resolve Employee profile for 0113: You cannot call kintone.app.record.get() in handler or during processing a handler.
```

This is consistent with the already-known older App794 deployed customization. The source-side Create-handler corrective was previously accepted, but that corrective bundle has not yet been deployed to live App794.

Do not reopen the already-accepted Create source fix unless the future corrective deploy still reproduces the error.

## 5. HR / admin-form Password Reset Requirement

Permanent D1 requirement remains:
- HR-authorized users and `admin-form` need an in-Kintone Reset MBO Password function;
- employee/shared users must not receive that administrative reset function;
- temporary password = exact Employee_Code;
- Force_Password_Change=YES;
- Failed_Attempts=0;
- clear temporary Locked_Until and all session fields;
- increment Credential_Version once;
- do not change Account_Status or re-enable DISABLED/LOCKED accounts;
- exact one-record target, fail closed on missing/duplicate/malformed identity.

This administrative UI/function is still implementation work; the manual 0113 console reset only proved the reset semantics.

## 6. Exact Next Action — DEPLOY GUARD INTEGRATION SOURCE/TEST ONLY

Before any new App794 live deployment, repair the deployment safety gate.

Current blocker:
- `src/core/sandbox-write-guard.js` keeps `DISCOVERY_MODE = true` and `WRITE_ALLOWED_APPS = []`;
- `scripts/kintone/deploy-custom-ui.js` calls the generic write guard on live deployment;
- therefore a legitimate, explicitly authorized App794 corrective deploy cannot currently pass the guard without weakening fail-closed defaults.

Next package must be SOURCE/TEST ONLY:
1. add a narrow explicit authorization context for exactly App794 customization deployment;
2. default state remains deny-all;
3. `DISCOVERY_MODE` remains fail-closed by default;
4. `WRITE_ALLOWED_APPS` must not become permanently `[794]`;
5. protected Apps 53, 283, 305, 307, 310, 640, 643, 715, 716 remain absolute hard-blocks;
6. wrong target app / missing auth / replayed auth must fail before any network write;
7. build-only path remains zero-network and needs no live authorization;
8. no App794 source behavior change, no auth/login change, no dist change, no live Kintone call, no deploy.

```text
NEXT_ACTION_OWNER              = Antigravity
ANTIGRAVITY_REQUIRED           = YES / ONE DEPLOY-GUARD SOURCE PACKAGE
KINTONE_LIVE_READ_WRITE        = NO
APP801_WRITE                   = NO
APP794_DEPLOY                  = NO
APP794_SOURCE_BEHAVIOR_CHANGE  = NO
DEPLOY_TOOLING_SOURCE_TEST     = YES
EXTERNAL_SERVICE_WORK          = NO
D2_D7_WRITE                    = NO
MAX_EXECUTOR_STATUS            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

After Deploy Guard Integration PASS:
1. perform pending App794 Delete-permission read-only check;
2. request a new exact App794 corrective deploy authorization;
3. deploy once with accepted module-aware bundle + Create handler fix + Employee-Self shell/history/Completed/no-delete changes;
4. rerun Create live UAT and remaining D1 security/session UAT.

## 7. Handoff Checkpoint

A new ChatGPT/AI session must start from:

```text
1. AI_DOCUMENT_INDEX.md
2. AI_CONTROL_CENTER.md
3. CONFIRMED_BASELINE/README.md
4. CONFIRMED_BASELINE/D1_AUTH_SECURITY.md
5. CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md
6. CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md
7. AI_ACTIVE_TASK.md
8. current branch HEAD + exact diff/evidence
```

Do NOT revive Auth Bridge from chat history or abandoned service files. Current architecture is KINTONE-ONLY.
