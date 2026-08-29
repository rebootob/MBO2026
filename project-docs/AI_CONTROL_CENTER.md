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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO PASS / DEPLOY GUARD PASS / APP794 ACL PASS / CORRECTIVE DEPLOY ROUND 2 PASS / EMPLOYEE-SELF UI LIVE PASS / CREATE-HANDLER ERROR FIX LIVE PASS / APP795 PRIVATE APP GROUP ROOT CAUSE CONFIRMED / ACCESS CORRECTION AUTH REQUIRED / HR+ADMIN RESET UI STILL OPEN |
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
D1_BUNDLE_DEPENDENCY_CORRECTIVE         = PASS
D1_CREATE_HANDLER_CORRECTIVE            = PASS / SOURCE ACCEPTED / DEPLOYED / USER LIVE EVIDENCE CONFIRMS OLD handler error absent
D1_EMPLOYEE_SELF_INDEX_SOURCE_TEST      = PASS
D1_EMPLOYEE_SELF_INDEX_VISUAL           = PASS / LIVE CONFIRMED
D1_MY_MBO_HISTORY_LIST                  = PASS
D1_MY_MBO_COMPLETED_STATUS_DISPLAY      = PASS
D1_EMPLOYEE_SELF_DELETE_GUARD           = PASS
APP801_SHARED_PRINCIPAL_s1_LIVE_ACCESS  = PASS
D1_HR_ADMIN_PASSWORD_RESET_REQUIREMENT  = PASS / BASELINED / PRODUCTION ADMIN UI STILL TO IMPLEMENT
D1_RESET_PASSWORD_0113                  = PASS / AUTHORIZATION CONSUMED
D1_FORCE_PASSWORD_CHANGE_0113           = PASS / USER LIVE OBSERVATION
D1_LOGIN_0113_TO_MY_MBO                 = PASS / USER LIVE OBSERVATION
D1_LIST_TO_CREATE_SESSION_CONTINUITY    = PASS / USER LIVE OBSERVATION
APP794_DEPLOY_GUARD_INTEGRATION         = PASS / ACCEPTED AT 8fa69bec7683bd64dbbd65fd3adf38bd1535e29b
APP794_DELETE_PERMISSION_READONLY_CHECK = PASS / RESOLVED BY APP-ACL CORRECTION
APP794_ACL_CORRECTION                   = PASS / USER LIVE WRITE + READ-BACK / ACL REVISION 43 -> 44
APP794_ACL_WRITE_AUTHORIZATION          = CONSUMED / CLOSED
APP794_DEPLOY_PROVENANCE_RECOVERY       = PASS / ACCEPTED AT a7badd223568bc26dfc37171be779cf2df5846f7
APP794_PRIOR_DEPLOY_AUTHORIZATION_ID    = APP794-CORRECTIVE-DEPLOY-20260829-01
APP794_PRIOR_DEPLOY_AUTH_STATE          = CONSUMED / FAILED AFTER FILE UPLOAD / BEFORE PREVIEW PUT
APP794_DEPLOY_TOOLING_SOURCE_FIX        = PASS / ACCEPTED AT c7e82d1e4b9f3a95a545605f8b4408d707b5366e
APP794_DEPLOY_TOOLING_TEST_CLOSURE      = PASS / ACCEPTED AT 93d12a4abd143176da082c386b49e9dfeeed7629
APP794_DEPLOY_TOOLING_CORRECTIVE        = PASS
APP794_DEPLOY_AUTHORIZATION_ID          = APP794-CORRECTIVE-DEPLOY-20260829-02
APP794_DEPLOY_AUTHORIZATION_STATE       = CONSUMED / CLOSED AFTER SUCCESSFUL ONE-SHOT EXECUTION
APP794_CORRECTIVE_DEPLOY_ROUND_2        = PASS / INDEPENDENT REVIEW ACCEPTED AT EXECUTION EVIDENCE 0a5b65d7bd20de6189b18eb59aa6e20359117a0c
APP794_DEPLOY_EFFECTIVE_LIVE            = YES / API READ-BACK REVISION 45 / USER UI EVIDENCE CONFIRMED
APP795_RUNTIME_READ_FOR_CREATE          = BLOCKED / 403 FORBIDDEN UNDER EMPLOYEE-FACING KINTONE PRINCIPAL
APP795_APP_ACL_READONLY_CHECK           = PASS / REVISION 8 / EVERYONE VIEW=true
APP795_APP_GROUP                         = PRIVATE / USER SCREENSHOT CONFIRMED / CURRENT ROOT CAUSE
APP795_ACCESS_CORRECTION                 = REQUIRED / NOT AUTHORIZED YET
D1_LIVE_CUTOVER                         = BLOCKED UNTIL APP795 ACCESS CORRECTION + CREATE UAT + REMAINING D1 UAT + HR/ADMIN RESET UI
D2-D7 LIVE WRITES                       = NOT AUTHORIZED unless separately recorded
```

## 3. Non-Negotiable Constraint

D1 must finish entirely inside Kintone. No external server, auth service, database, reverse proxy, session service, or Auth Bridge.

## 4. Accepted Existing Live Evidence

### App801 / Login
- `s1` is in `MBO_EMPLOYEE_ACCESS`.
- App801 App Group corrected to Public; `MBO_EMPLOYEE_ACCESS` has View/Edit only; Everyone denied.
- `s1` can open App801 and see 128 credential records.
- Reset `0113` = PASS.
- Force Password Change = PASS.
- Login `0113` -> My MBO = PASS.
- List -> Create session continuity = PASS.

### App794 App ACL
- ACL revision `43 -> 44`.
- CREATOR full rights preserved.
- `MBO_EMPLOYEE_ACCESS`: View/Add/Edit=true; Delete/Manage/Import/Export=false.
- `everyone`: all permissions false.
- `APP794_ACL_CORRECTION_OVERALL_PASS = true`.

## 5. Independent Review — App794 Corrective Deploy Round 2

Authorized one-shot ID:
`APP794-CORRECTIVE-DEPLOY-20260829-02`

Execution evidence commit:
`0a5b65d7bd20de6189b18eb59aa6e20359117a0c`

Accepted result:
```text
APP794_CORRECTIVE_DEPLOY_ROUND_2 = PASS
APP794_DEPLOY_EFFECTIVE_LIVE     = YES / API READ-BACK REVISION 45
AUTHORIZATION ...-02             = CONSUMED / CLOSED
```

## 6. User Live UAT — 2026-08-29

User screenshots confirm:
- coherent bilingual Employee-Self shell;
- Employee Code `0113`;
- `Change Password` + `Logout` visible;
- Create keeps session and reaches `/k/794/edit`;
- old `kintone.app.record.get() in handler` defect is resolved;
- old `AdminDiagnosticModel is not defined` is absent.

Create then fails at authoritative routing read:
```text
GET /k/v1/records.json?app=795&query=Routing_Key... -> 403 Forbidden
```

`RoutingService` is correctly fail-closed and must not be bypassed.

## 7. App795 Permission Discovery — Root Cause Confirmed

Console evidence under `admin-form`:
```text
APP795_APP_ACL_REVISION = 8
CREATOR                 = all permissions true
GROUP everyone          = View/Add/Edit/Delete true; Manage/Import/Export false
MBO_EMPLOYEE_ACCESS     = no explicit row in current stored ACL
```

Latest user screenshot of **App795 Permissions for app** confirms:
```text
APP795_APP_GROUP = Private
```

Kintone UI explicitly warns that application permission settings are not applied to apps in the `Private` group. This fully explains why employee-facing principal `s1` receives 403 even though stored app-level ACL reports View=true for everyone.

Do not simply switch Private -> Public with the current stored ACL, because current `everyone` rights include Add/Edit/Delete and would become overly broad once app permissions become effective.

### Proposed exact minimal secure correction — requires explicit user authorization

Target App795 only:
- App group: `Private -> Public`;
- preserve CREATOR/Admin-Form full rights;
- add `MBO_EMPLOYEE_ACCESS` with **View only**;
- `MBO_EMPLOYEE_ACCESS`: Add/Edit/Delete/Manage/Import/Export = NO;
- set `Everyone`: all permissions NO;
- no record data change;
- no routing-data change;
- no App794/App801/source/deploy change.

After correction, verify under `s1` that App795 route GET succeeds, then rerun `0113 -> Create New MBO` create-show UAT without saving a business record.

Record-level ACL discovery is deferred unless 403 remains after the confirmed Private-group defect is corrected.

## 8. HR / admin-form Password Reset Requirement

Permanent D1 requirement remains: HR-authorized users and `admin-form` need an in-Kintone Reset MBO Password function; employee/shared users must not receive it. Production administrative UI/function remains mandatory before final D1 closure.

## 9. Exact Next Action — USER AUTHORIZATION FOR APP795 ACCESS CORRECTION

No App795 write is currently authorized.

If user approves, execute only the exact App795 access correction defined above, with read-back. Do not widen scope.

```text
NEXT_ACTION_OWNER              = USER / CONTROL PLANE
ANTIGRAVITY_REQUIRED           = NO / HOLD UNTIL AUTHORIZED
APP794 DEPLOY                  = NO
APP794 ACL WRITE               = NO
APP795 APP GROUP WRITE         = NO / AWAITING AUTHORIZATION
APP795 ACL WRITE               = NO / AWAITING AUTHORIZATION
APP795 RECORD WRITE            = NO
APP801 WRITE                   = NO
SOURCE_CHANGE                  = NO
EXTERNAL_SERVICE_WORK          = NO
D2_D7_WRITE                    = NO
```

## 10. Handoff Checkpoint

Start from `AI_DOCUMENT_INDEX.md`, this Control Center, `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`, `AI_ACTIVE_TASK.md`, current HEAD, exact deploy evidence, and latest user Live/permission screenshots. Never revive Auth Bridge; D1 remains KINTONE-ONLY. Both App794 deploy authorization IDs `...-01` and `...-02` are consumed and cannot be reused.