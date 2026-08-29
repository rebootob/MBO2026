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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO PASS / DEPLOY GUARD PASS / APP794 ACL PASS / CORRECTIVE DEPLOY ROUND 2 PASS / EMPLOYEE-SELF UI LIVE PASS / CREATE-HANDLER ERROR FIX LIVE PASS / APP795 ACCESS PASS / TMH2 REQUESTER BOUNDARY PASS UNDER `tmh` / APP796 PRIVATE APP GROUP ROOT CAUSE CONFIRMED / ACCESS CORRECTION AUTH REQUIRED / HR+ADMIN RESET UI STILL OPEN |
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
AUTH_BRIDGE                             = CANCELLED / DO NOT IMPLEMENT
SERVICES_MBO_AUTH_BRIDGE                = ABANDONED EXPERIMENT / NOT PRODUCTION PATH
D1_SESSION_CONTINUITY_ARCHITECTURE      = PASS
APP801_SESSION_SCHEMA_WRITE             = PASS / ACCEPTED
D1_CREATE_HANDLER_CORRECTIVE            = PASS / SOURCE ACCEPTED / DEPLOYED / LIVE old handler error absent
D1_EMPLOYEE_SELF_INDEX_VISUAL           = PASS / LIVE CONFIRMED
D1_HR_ADMIN_PASSWORD_RESET_REQUIREMENT  = PASS / BASELINED / PRODUCTION ADMIN UI STILL TO IMPLEMENT
D1_RESET_PASSWORD_0113                  = PASS / AUTHORIZATION CONSUMED
D1_FORCE_PASSWORD_CHANGE_0113           = PASS / USER LIVE OBSERVATION
D1_LOGIN_0113_TO_MY_MBO                 = PASS / USER LIVE OBSERVATION
D1_LIST_TO_CREATE_SESSION_CONTINUITY    = PASS / USER LIVE OBSERVATION
APP794_ACL_CORRECTION                   = PASS / REVISION 43 -> 44
APP794_CORRECTIVE_DEPLOY_ROUND_2        = PASS / LIVE CUSTOMIZATION REVISION 45
APP795_ACCESS_CORRECTION                = PASS / ACL REVISION 8 -> 9 / APP GROUP PUBLIC
APP795_ACCESS_CORRECTION_AUTH_STATE     = CONSUMED / CLOSED
TMH2_REQUESTER_AUTH_UNDER_s1            = DENIED / EXPECTED BUSINESS BOUNDARY
TMH2_REQUESTER_AUTH_UNDER_tmh           = PASS / LIVE FLOW ADVANCED PAST ROUTING VALIDATION
APP796_RUNTIME_READ_FOR_CREATE          = BLOCKED / 403 FORBIDDEN UNDER `tmh`
APP796_APP_ACL_READONLY_CHECK           = PASS / REVISION 5 / CREATOR FULL / EVERYONE ALL-NO
APP796_APP_GROUP                         = PRIVATE / USER SCREENSHOT CONFIRMED / CURRENT ROOT CAUSE
APP796_ACCESS_CORRECTION                 = REQUIRED / NOT AUTHORIZED YET
D1_LIVE_CUTOVER                         = BLOCKED UNTIL APP796 ACCESS CORRECTION + CREATE-SHOW UAT + REMAINING D1 UAT + HR/ADMIN RESET UI
D2-D7 LIVE WRITES                       = NOT AUTHORIZED unless separately recorded
```

## 3. Non-Negotiable Constraint

D1 must finish entirely inside Kintone. No external server, auth service, database, reverse proxy, session service, or Auth Bridge.

## 4. Accepted Existing Live Evidence

### App794 Employee-Self
- Employee Code `0113` login/session continuity works.
- My MBO shell, Change Password, Logout are live.
- Create reaches `/k/794/edit` without MBO re-login.
- old `kintone.app.record.get() in handler` defect is resolved.

### App795 / requester boundary
- App795 ACL revision `8 -> 9`, App Group Public, `MBO_EMPLOYEE_ACCESS` View-only, Everyone all-NO.
- `s1` is not an authorized requester for Employee 0113 / Section TMH2.
- `tmh` is an authorized requester; Live flow advances past App795 routing validation.
- Do not weaken `RoutingService.assertRequesterAuthorized()`.

## 5. App796 Permission Discovery — Root Cause Confirmed

Live Create UAT under Kintone principal `tmh` + authenticated MBO Employee Code `0113` advances to Step 3 and fails on App796 scoring lookup:
```text
GET /k/v1/records.json?app=796&query=Profile_Code... -> 403 Forbidden
[MBO V2] Scoring resolution info: No privilege to proceed.
```

Read-only discovery under `admin-form` now confirms:
```text
APP796_APP_ACL_REVISION = 5
CREATOR                 = View/Add/Edit/Delete/Manage/Import/Export true
GROUP everyone          = all permissions false
MBO_EMPLOYEE_ACCESS     = no explicit row
APP796_APP_GROUP        = Private
```

Kintone UI warns that configured app permissions are not applied to apps in the `Private` group. This explains why `tmh` cannot read App796 even though the intended runtime operation is read-only.

App796 remains the authoritative published scoring/profile configuration source. `src/main-mbo-app.js` performs a read-only query for exactly one `PUBLISHED` Profile_Code + Fiscal Year configuration and fails closed on missing/duplicate/error. Do not bypass or hard-code App796.

### Proposed exact minimal correction — requires explicit user authorization

Target App796 settings only:
1. while App796 remains Private, preserve CREATOR full rights;
2. add `MBO_EMPLOYEE_ACCESS` with View=YES only; Add/Edit/Delete/Manage/Import/Export=NO;
3. keep `Everyone` all permissions NO;
4. read back ACL and verify exact target;
5. only after ACL read-back PASS, change App Group `Private -> Public`;
6. verify App Group = Public;
7. user UAT under `tmh` + Employee `0113` retries Create-show without Save.

No App796 record/scoring-data write is required or authorized by this proposal.

## 6. HR / admin-form Password Reset Requirement

Permanent D1 requirement remains: HR-authorized users and `admin-form` need an in-Kintone Reset MBO Password function; employee/shared users must not receive it. Production administrative UI/function remains mandatory before final D1 closure.

## 7. Exact Next Action — USER AUTHORIZATION REQUIRED

No App796 write is currently authorized.

If user approves, execute only the exact App796 access correction above, with ACL read-back before App Group change.

```text
NEXT_ACTION_OWNER              = USER / CONTROL PLANE
ANTIGRAVITY_REQUIRED           = NO / HOLD UNTIL AUTHORIZED
APP796 ACL WRITE               = NO / AWAITING AUTHORIZATION
APP796 APP GROUP WRITE         = NO / AWAITING AUTHORIZATION
APP796 RECORD/SCORING WRITE    = NO
APP795 ACL/GROUP/RECORD WRITE  = NO / CLOSED
APP794 DEPLOY                  = NO
APP794 ACL/RECORD WRITE        = NO
APP801 WRITE                   = NO
SOURCE CHANGE                  = NO
EXTERNAL SERVICE               = NO
D2-D7 WRITE                    = NO
```

## 8. Handoff Checkpoint

Start from `AI_DOCUMENT_INDEX.md`, this Control Center, `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`, `CONFIRMED_BASELINE/EVALUATION_CLASSES.md`, `AI_ACTIVE_TASK.md`, current HEAD, and latest user Live screenshots. Never revive Auth Bridge; D1 remains KINTONE-ONLY.