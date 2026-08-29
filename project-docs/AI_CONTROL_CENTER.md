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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / PRIOR SOURCE+UI GATES PASS / LOGIN ROOT CAUSE CONFIRMED: APP801 PRIVATE APP GROUP MAKES APP PERMISSIONS INEFFECTIVE / CONFIG CORRECTION NOT YET AUTHORIZED / FINAL UAT BLOCKED |
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
D1_CREATE_HANDLER_CORRECTIVE            = PASS
D1_EMPLOYEE_SELF_INDEX_SOURCE_TEST      = PASS
D1_EMPLOYEE_SELF_INDEX_VISUAL           = PASS
D1_MY_MBO_HISTORY_LIST                  = PASS
D1_MY_MBO_COMPLETED_STATUS_DISPLAY      = PASS
D1_EMPLOYEE_SELF_DELETE_GUARD           = PASS
APP801_SHARED_PRINCIPAL_s1_LIVE_ACCESS  = FAIL / 403 CB_NO02
MBO_EMPLOYEE_ACCESS_s1_MEMBERSHIP       = PASS / USER LIVE SCREENSHOT 2026-08-29
APP801_PERMISSION_ROW_TARGET            = PASS / VIEW+EDIT ONLY FOR MBO_EMPLOYEE_ACCESS
APP801_PRIVATE_APP_GROUP_BLOCKER         = CONFIRMED / KINTONE UI WARNS APP PERMISSIONS NOT APPLIED TO PRIVATE GROUP
APP801_KINTONE_CONFIG_CORRECTION         = PENDING / EXACT APP-GROUP TARGET MUST BE CHOSEN BEFORE WRITE
APP794_DELETE_PERMISSION_READONLY_CHECK = PENDING
APP794_DEPLOY_GUARD_INTEGRATION         = OPEN / BEFORE NEXT LIVE DEPLOY
D1_LIVE_CUTOVER                         = BLOCKED
D2-D7 LIVE WRITES                       = NOT AUTHORIZED unless separately recorded
```

No App794 deploy is currently authorized.
No App801 App Group / ACL write is currently authorized.
No external server/service/hosting/secret work is authorized.

## 3. User-Confirmed Non-Negotiable Constraint

D1 authentication must finish entirely inside Kintone.

```text
NO external Node server
NO cloud auth service
NO external database
NO reverse proxy
NO external session service
NO Auth Bridge
```

The prior Auth Bridge proposal and WP1 implementation attempt are cancelled. Do not continue, deploy, host or integrate `services/mbo-auth-bridge/`. It may remain temporarily in Git only as abandoned evidence until a separate cleanup task removes it.

Canonical Baselines:
- `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`

## 4. Accepted Live Evidence — Login Root Cause

User live verification established:
- Employee_Code `0113` credential is healthy: `Account_Status=ACTIVE`, `Failed_Attempts=0`, `Locked_Until` blank, `Force_Password_Change=NO`, `Credential_Version=1`;
- current Kintone shared principal is `s1`;
- `s1` receives HTTP 403 / `CB_NO02` when reading/opening App801;
- `s1` is a member of `MBO_EMPLOYEE_ACCESS`;
- App801 `Permissions for app` row for `MBO_EMPLOYEE_ACCESS` already matches the intended target: View Records=YES, Edit Records=YES, Add/Delete/Manage/Import/Export=NO;
- `Everyone` is denied;
- App801 `App group` is currently `Private`;
- Kintone UI displays the warning: `Permission settings are not applied to the apps in the "Private" group.`

Conclusion:

```text
LOGIN ROOT CAUSE = APP801 PRIVATE APP GROUP
```

The configured `MBO_EMPLOYEE_ACCESS` permission row is not taking effect while App801 remains in `Private`. This explains why `s1` receives `CB_NO02` despite correct group membership and correct View/Edit checkboxes.

Current Login UI generic denial text is also misleading and must later map permission/technical failure separately.

## 5. Approved Kintone-Only Permission Target

The record-permission target remains:

```text
GROUP: MBO_EMPLOYEE_ACCESS
View records   = YES
Edit records   = YES
Add records    = NO
Delete records = NO
Import         = NO
Export         = NO
App Admin      = NO
```

Initial group principals include:
`f1, f2, f3, tmh, e1, s1, g_request, t1, t2`.

`GROUP:everyone` remains denied.
`admin-form` remains Technical Admin only.

Security ceiling remains explicitly accepted/documented: under a shared Kintone principal, native REST hard isolation by Employee_Code is not guaranteed. Do not claim otherwise and do not embed privileged API tokens in browser JavaScript.

## 6. Exact Next Action — READ-ONLY ONLY

Before changing App801:
1. inspect the available App Group choices for App801;
2. identify an existing non-Private App Group whose access model is compatible with MBO employee access, OR design one dedicated Kintone App Group if no existing choice is appropriate;
3. preserve the existing App801 record-permission row exactly as above;
4. determine impact/rollback of changing App801 App Group away from `Private`;
5. STOP and request explicit user authorization before changing App Group or permissions.

Do **not** choose `Public` automatically without inspecting the available App Group configuration.

```text
NEXT_ACTION_OWNER              = CONTROL PLANE + USER
ANTIGRAVITY_REQUIRED           = NO / HOLD
KINTONE_READ                   = YES / APP-GROUP METADATA/UI ONLY
KINTONE_WRITE                  = NO
APP801_APP_GROUP_WRITE         = NO UNTIL EXPLICIT APPROVAL
APP801_ACL_WRITE               = NO UNTIL EXPLICIT APPROVAL
APP801_RECORD_WRITE            = NO
APP794_DEPLOY                  = NO
EXTERNAL_SERVICE_WORK          = NO
D2_D7_WRITE                    = NO
```

After exact App801 App Group correction is separately authorized and verified:
1. live direct App801 access test as `s1` should no longer return `CB_NO02` for the required View/Edit path;
2. live MBO Login retest with `s1` / Employee 0113;
3. finish pending App794 Delete-permission readback;
4. close Deploy Guard Integration;
5. request one exact combined App794 corrective deploy;
6. run final D1 UAT.

## 7. Handoff Checkpoint

A new ChatGPT/AI session must start from:

```text
1. AI_DOCUMENT_INDEX.md
2. AI_CONTROL_CENTER.md
3. CONFIRMED_BASELINE/README.md
4. CONFIRMED_BASELINE/D1_AUTH_SECURITY.md
5. CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md
6. AI_ACTIVE_TASK.md
7. current branch HEAD + exact diff/evidence
```

Do NOT revive Auth Bridge from chat history or abandoned service files. Current user constraint and Baseline are KINTONE-ONLY.
