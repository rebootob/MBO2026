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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO LIVE PASS / LIST→CREATE SESSION PASS / CREATE SOURCE FIX ACCEPTED BUT OLD LIVE CUSTOMIZATION / DEPLOY GUARD PASS / APP794 DELETE PERMISSION READ-ONLY CHECK NEXT / FINAL UAT BLOCKED |
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
D1_CREATE_HANDLER_CORRECTIVE            = PASS / SOURCE ACCEPTED / NOT YET LIVE
D1_EMPLOYEE_SELF_INDEX_SOURCE_TEST      = PASS
D1_EMPLOYEE_SELF_INDEX_VISUAL           = PASS
D1_MY_MBO_HISTORY_LIST                  = PASS
D1_MY_MBO_COMPLETED_STATUS_DISPLAY      = PASS
D1_EMPLOYEE_SELF_DELETE_GUARD           = PASS
APP801_SHARED_PRINCIPAL_s1_LIVE_ACCESS  = PASS
D1_HR_ADMIN_PASSWORD_RESET_REQUIREMENT  = PASS / BASELINED / ADMIN UI STILL TO IMPLEMENT
D1_RESET_PASSWORD_0113                  = PASS / AUTHORIZATION CONSUMED
D1_FORCE_PASSWORD_CHANGE_0113           = PASS / USER LIVE OBSERVATION
D1_LOGIN_0113_TO_MY_MBO                 = PASS / USER LIVE OBSERVATION
D1_LIST_TO_CREATE_SESSION_CONTINUITY    = PASS / USER LIVE OBSERVATION
D1_CREATE_LIVE_RUNTIME                  = FAIL / OLD LIVE CUSTOMIZATION
APP794_DEPLOY_GUARD_INTEGRATION         = PASS / ACCEPTED AT 8fa69bec7683bd64dbbd65fd3adf38bd1535e29b
APP794_DELETE_PERMISSION_READONLY_CHECK = NEXT / CONTROL PLANE + USER READ-ONLY VERIFICATION
APP794_CORRECTIVE_DEPLOY                = NOT AUTHORIZED YET
D1_LIVE_CUTOVER                         = BLOCKED UNTIL DELETE-PERMISSION CHECK + CORRECTIVE DEPLOY + REMAINING UAT
D2-D7 LIVE WRITES                       = NOT AUTHORIZED unless separately recorded
```

## 3. Non-Negotiable Constraint

D1 must finish entirely inside Kintone. No external server, auth service, database, reverse proxy, session service, or Auth Bridge.

## 4. Accepted Live Evidence

- `s1` is in `MBO_EMPLOYEE_ACCESS`.
- App801 App Group corrected to Public; `MBO_EMPLOYEE_ACCESS` has View/Edit only; Everyone denied.
- `s1` can open App801 and see 128 records.
- Reset `0113` = PASS; Force Password Change = PASS; Login -> My MBO = PASS; List -> Create keeps session = PASS.
- Live `/k/794/edit` still fails only because deployed App794 customization is older than the already-accepted Create-handler source corrective.

Do not reopen the accepted Create source fix unless the future corrective deploy still reproduces the error.

## 5. HR / admin-form Password Reset Requirement

Permanent D1 requirement remains: HR-authorized users and `admin-form` need an in-Kintone Reset MBO Password function; employee/shared users must not receive it. Reset semantics remain Employee_Code temporary password, Force Change YES, failed attempts 0, clear temporary lock/session, increment Credential_Version once, never change Account_Status, exact one-record fail-closed targeting.

## 6. Independent Review — App794 Deploy Guard

Review result: **PASS / ACCEPTED**.

Accepted implementation chain:
- `8d8e88e13ff0ef6798329266c69f721ab15b3f79` introduced the narrow App794 customization deploy authorization gate;
- `04e1563f824d4e801f46411b9282ce292f2a478f` bound supplied target, registry target and actual deploy target to exact App794 and removed silent target fallback;
- `8fa69bec7683bd64dbbd65fd3adf38bd1535e29b` closed the deterministic registry-drift test gap using `validateApp794DeployTargetBinding()` and the real deploy entrypoint uses the same helper.

Accepted invariants:
- `options.appId`, registry `mboV2AppId`, authorization/request and actual live target must resolve to exact integer `794`;
- registry missing/malformed/drifted target fails closed;
- generic sandbox guard uses literal ephemeral `[794]`, never a mutable global allow-list;
- `DISCOVERY_MODE` remains true and global `WRITE_ALLOWED_APPS` remains empty;
- protected Apps 53, 283, 305, 307, 310, 640, 643, 715, 716 remain hard-blocked;
- build-only requires no live authorization and exits before Kintone/network path;
- no App794 business/auth/Create/UI source or generated dist was changed in the guard packages.

GitHub has no CI/status checks for the accepted commit. Therefore this review accepts the source/test design and repository diff; it does not claim an independent hosted CI `npm test` PASS.

## 7. Exact Next Action — APP794 DELETE PERMISSION READ-ONLY CHECK

Before requesting a new App794 corrective deploy authorization, verify the effective Delete permission for the employee-facing/shared Kintone principal(s) in READ-ONLY mode.

Preferred evidence:
- log in using an employee-facing/shared Kintone principal such as `s1`;
- open an existing App794 **record detail** page;
- run `kintone.app.record.getPermissions()` and capture only current user/app/record plus `deleteRecord`/`editRecord` booleans;
- do not modify ACL, records, customization, or credentials.

If effective `deleteRecord = false`, mark this gate PASS.
If effective `deleteRecord = true`, do not change ACL yet; record `ACL CORRECTION REQUIRED` and obtain separate explicit user authorization before any permission write.

```text
NEXT_ACTION_OWNER              = CONTROL PLANE + USER
ANTIGRAVITY_REQUIRED           = NO / HOLD
KINTONE_LIVE_WRITE             = NO
APP801_WRITE                   = NO
APP794_DEPLOY                  = NO
APP794_ACL_WRITE               = NO
EXTERNAL_SERVICE_WORK          = NO
D2_D7_WRITE                    = NO
```

After Delete Permission PASS:
1. request a new exact App794 corrective deploy authorization;
2. deploy once with accepted module-aware bundle + Create-handler fix + Employee-Self shell/history/Completed/no-delete changes;
3. rerun Create live UAT and remaining D1 security/session UAT.

## 8. Handoff Checkpoint

Start from `AI_DOCUMENT_INDEX.md`, this Control Center, relevant Confirmed Baselines, `AI_ACTIVE_TASK.md`, current HEAD, and exact diff/evidence. Never revive Auth Bridge; D1 remains KINTONE-ONLY.
