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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / 0113 PASSWORD RESET PASS / FORCE-CHANGE LOGIN UAT NEXT / HR+ADMIN RESET REQUIREMENT BASELINED / DEPLOY GUARD OPEN / FINAL UAT BLOCKED |
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
MBO_EMPLOYEE_ACCESS_s1_MEMBERSHIP       = PASS / USER LIVE SCREENSHOT
APP801_PERMISSION_ROW_TARGET            = PASS / VIEW+EDIT ONLY FOR MBO_EMPLOYEE_ACCESS
APP801_PRIVATE_APP_GROUP_BLOCKER         = CONFIRMED ROOT CAUSE
APP801_APP_GROUP_PUBLIC_CORRECTION       = USER APPLIED 2026-08-29
APP801_SHARED_PRINCIPAL_s1_LIVE_ACCESS  = PASS / USER LIVE SCREENSHOT / 128 RECORDS VISIBLE
D1_HR_ADMIN_PASSWORD_RESET_REQUIREMENT  = PASS / USER CONFIRMED + BASELINED
D1_RESET_PASSWORD_0113_AUTHORIZATION    = CONSUMED / EXACT EMPLOYEE 0113 ONLY
D1_RESET_PASSWORD_0113_EXECUTION        = PASS / USER CONSOLE READ-BACK
D1_LOGIN_0113_FORCE_CHANGE_UAT          = NEXT
APP794_DELETE_PERMISSION_READONLY_CHECK = PENDING
APP794_DEPLOY_GUARD_INTEGRATION         = OPEN / BEFORE NEXT LIVE DEPLOY
D1_LIVE_CUTOVER                         = BLOCKED UNTIL REMAINING D1 UAT
D2-D7 LIVE WRITES                       = NOT AUTHORIZED unless separately recorded
```

No App794 deploy is currently authorized.
No external server/service/hosting/secret work is authorized.
No further App801 credential write is authorized by the consumed 0113 reset approval.

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

The prior Auth Bridge proposal and WP1 implementation attempt are cancelled. Do not continue, deploy, host or integrate `services/mbo-auth-bridge/`.

Canonical Baselines:
- `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`

## 4. Accepted Live Evidence — App801 Access Blocker Resolved

User live verification established:
- Kintone principal `s1` is a member of `MBO_EMPLOYEE_ACCESS`;
- App801 permission row for `MBO_EMPLOYEE_ACCESS` is View=YES, Edit=YES, Add/Delete/Manage/Import/Export=NO;
- `Everyone` is denied;
- App801 was in `Private`, which caused Kintone to ignore the permission rows and return `CB_NO02`;
- user changed App801 App Group to `Public` while preserving the permission rows;
- after apply, `s1` can open App801 and sees 128 records; therefore the previous `CB_NO02` blocker is resolved.

## 5. Accepted Live Evidence — Reset Password 0113

User explicitly authorized exactly one App801 reset for Employee_Code `0113` and executed the Control Plane script under Kintone `admin-form`.

Read-back evidence:

```text
Employee_Code                     = 0113
Account_Status                    = ACTIVE (unchanged)
Force_Password_Change             = YES
Failed_Attempts                   = 0
Locked_Until                      = blank
Credential_Version                = 2
Session_Token_Hash_Cleared        = true
Session_Issued_At_Cleared         = true
Session_Expires_At_Cleared        = true
Session_Credential_Version_Cleared= true
Session_Kintone_User_Cleared      = true
RESET_0113_OVERALL_PASS           = true
```

Therefore:
- reset authorization is consumed;
- temporary password is `0113`;
- next valid login must enter mandatory password-change flow before Employee-Self content;
- do not repeat the reset unless separately authorized.

## 6. Permanent HR/Admin Password Reset Requirement

HR-authorized users and `admin-form` must have an in-Kintone administrative MBO Password Reset function.

Required semantics:
- temporary password = exact Employee_Code;
- canonical PBKDF2-SHA256 / 100000 storage;
- `Force_Password_Change=YES`;
- `Failed_Attempts=0` and clear temporary `Locked_Until`;
- increment valid positive `Credential_Version` exactly once;
- clear all session fields;
- never change `Account_Status` and never re-enable DISABLED/LOCKED accounts;
- exact one-record target and fail closed on missing/duplicate/malformed identity;
- employee/shared users must not receive this administrative reset capability.

## 7. Kintone-Only Permission Target

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
`admin-form` remains Technical Admin/recovery authority.

Known security ceiling remains accepted/documented: under a shared Kintone principal, native REST hard isolation by Employee_Code is not guaranteed. Do not claim otherwise and do not embed privileged API tokens in browser JavaScript.

## 8. Exact Next Action — FORCE PASSWORD CHANGE UAT

Using Kintone principal `s1`:
1. open App794;
2. login once with Employee Code `0113`, temporary password `0113`;
3. expected result = mandatory password-change UI, not My MBO directly;
4. do not intentionally enter a wrong password;
5. capture the result and STOP before any source/deploy work.

```text
NEXT_ACTION_OWNER              = USER + CONTROL PLANE
ANTIGRAVITY_REQUIRED           = NO / HOLD
APP801_RESET_0113_WRITE        = CONSUMED / NO FURTHER WRITE
APP794_DEPLOY                  = NO
EXTERNAL_SERVICE_WORK          = NO
D2_D7_WRITE                    = NO
```

## 9. Handoff Checkpoint

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
