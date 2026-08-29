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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO LIVE PASS / LIST→CREATE SESSION PASS / DEPLOY GUARD PASS / APP794 ACL PASS / DEPLOY PROVENANCE RECOVERED / DEPLOY TOOLING CORRECTIVE NEXT / FINAL UAT BLOCKED |
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
D1_CREATE_HANDLER_CORRECTIVE            = PASS / SOURCE ACCEPTED / NOT LIVE YET
D1_EMPLOYEE_SELF_INDEX_SOURCE_TEST      = PASS
D1_EMPLOYEE_SELF_INDEX_VISUAL           = PASS
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
APP794_DEPLOY_AUTHORIZATION_ID          = APP794-CORRECTIVE-DEPLOY-20260829-01
APP794_DEPLOY_PROVENANCE_RECOVERY       = PASS / ACCEPTED AT a7badd223568bc26dfc37171be779cf2df5846f7
APP794_DEPLOY_AUTHORIZATION_STATE       = CONSUMED / FAILED AFTER FILE UPLOAD / BEFORE PREVIEW PUT
APP794_DEPLOY_EFFECTIVE_LIVE            = NO
APP794_DEPLOY_TOOLING_CORRECTIVE        = NEXT / SOURCE+TEST ONLY
D1_LIVE_CUTOVER                         = BLOCKED UNTIL TOOLING CORRECTIVE PASS + NEW DEPLOY AUTHORIZATION + LIVE UAT + ADMIN RESET UI UAT
D2-D7 LIVE WRITES                       = NOT AUTHORIZED unless separately recorded
```

## 3. Non-Negotiable Constraint

D1 must finish entirely inside Kintone. No external server, auth service, database, reverse proxy, session service, or Auth Bridge.

## 4. Accepted Live Evidence

### App801 / login
- `s1` is in `MBO_EMPLOYEE_ACCESS`.
- App801 App Group corrected to Public; `MBO_EMPLOYEE_ACCESS` has View/Edit only; Everyone denied.
- `s1` can open App801 and see 128 credential records.
- Reset `0113` = PASS; Force Password Change = PASS; Login -> My MBO = PASS; List -> Create keeps session = PASS.

### App794 App ACL
- ACL revision `43 -> 44`.
- CREATOR full rights preserved.
- `MBO_EMPLOYEE_ACCESS`: View/Add/Edit=true, Delete/Manage/Import/Export=false.
- `everyone`: all permissions false.
- `APP794_ACL_CORRECTION_OVERALL_PASS = true`.

### App794 live corrective behavior check — USER EVIDENCE 2026-08-29
Under employee-facing Kintone principal `s1`, authenticated MBO Employee_Code `0113`:
- My MBO loads and session continuity still works;
- expected coherent Employee-Self shell has NOT appeared on Live;
- Logout control is still absent;
- clicking `+ Create New MBO` reaches `/k/794/edit` but still raises `Employee Profile Resolution Failed` with `You cannot call kintone.app.record.get() in handler or during processing a handler.`;
- Console still shows `AdminDiagnosticModel is not defined` from the old deployed bundle.

Conclusion:
```text
APP794_DEPLOY_EFFECTIVE_LIVE = NO
```

## 5. HR / admin-form Password Reset Requirement

Permanent D1 requirement remains: HR-authorized users and `admin-form` need an in-Kintone Reset MBO Password function; employee/shared users must not receive it. Manual reset of `0113` proved reset semantics only. Production administrative UI/function remains mandatory before final D1 closure.

## 6. Independent Review — App794 Deploy Guard

`APP794_DEPLOY_GUARD_INTEGRATION = PASS / ACCEPTED`.

Accepted invariants:
- exact target 794 across authorization/request/options/registry/actual deploy target;
- registry drift/missing/malformed fails closed;
- literal ephemeral `[794]` only;
- `DISCOVERY_MODE = true`, global `WRITE_ALLOWED_APPS = []`;
- protected Apps 53, 283, 305, 307, 310, 640, 643, 715, 716 remain hard-blocked;
- build-only exits before Kintone/network path.

## 7. Independent Review — App794 Deploy Provenance Recovery

Review result: **PASS / provenance resolved**.

Accepted evidence commit:
`a7badd223568bc26dfc37171be779cf2df5846f7`

Recovered execution facts for prior authorization `APP794-CORRECTIVE-DEPLOY-20260829-01`:
```text
SOURCE_HEAD_USED           = 00ed894fc098d96ec8d0e3c411b3c91a9ff9432b
NPM_TEST                   = PASS
BUILD_ONLY                 = PASS
AUTH_GUARD_ENTERED         = YES
UPLOAD_OCCURRED            = YES
PREVIEW_PUT_OCCURRED       = NO
DEPLOY_POST_OCCURRED       = NO
DEPLOY_FINAL_STATUS        = BLOCKED_PRE_PREVIEW_PUT
LIVE_REVISION              = 44
PREVIEW_REVISION           = 44
LIVE_PREVIEW_MATCH         = NO
LIVE_WRITE_DURING_RECOVERY = 0
```

The prior attempt uploaded one replacement `mbo-employee-app.js` file and then stopped before Preview customization mutation. The uploaded fileKey was never attached to Preview or Live customization. No Preview PUT and no deploy POST occurred. Live remains the old customization.

The prior authorization is therefore **CONSUMED** and must not be reused. The unattached uploaded file does not authorize cleanup and no cleanup is required for D1 correctness.

### Root cause
`executeDeployCustomUi()` correctly passed the narrow App794 authorization and `assertSandboxWriteTarget()` checks. It then called generic `kintoneRequest()` for the authorized Preview PUT without setting `bypassDiscovery: true`.

`kintoneRequest(path, { method, body, bypassDiscovery = false })` calls `assertDiscoveryReadOnly()` unless that exact option is true. Therefore the authorized App794 Preview PUT was blocked by the global Discovery guard before network execution.

This is a deploy-tooling integration defect only. Do not reopen accepted Login/Create/Employee-Self business source.

## 8. Exact Next Action — APP794 DEPLOY TOOLING CORRECTIVE / SOURCE+TEST ONLY

Antigravity may perform a narrow source/test corrective only. No live Kintone write or deploy is authorized.

Required design:
1. keep the existing narrow App794 authorization and exact target-binding checks unchanged;
2. only after those checks pass, allow the two exact intended customization write calls to bypass the generic Discovery read-only guard:
   - `PUT /k/v1/preview/app/customize.json`;
   - `POST /k/v1/preview/app/deploy.json`;
3. do not globally disable Discovery mode;
4. do not change `DISCOVERY_MODE = true`;
5. do not change global `WRITE_ALLOWED_APPS = []`;
6. do not widen `kintoneRequest()` default behavior;
7. protected apps remain hard-blocked;
8. GET/read-back calls remain ordinary read-only calls;
9. add focused deterministic tests proving missing/wrong/replayed authorization still blocks before network and only the exact authorized App794 Preview PUT/Deploy POST receive the narrow bypass;
10. build-only remains zero-network and requires no live authorization.

No App794 deploy is authorized in this task. After source/test review PASS, Control Plane must request a **new explicit one-shot App794 deploy authorization** from the user.

```text
NEXT_ACTION_OWNER              = ANTIGRAVITY / SOURCE+TEST ONLY
ANTIGRAVITY_REQUIRED           = YES
APP794_DEPLOY                  = NO
APP794_UPLOAD                  = NO
APP794_PREVIEW_WRITE           = NO
APP794_ACL_WRITE               = NO
APP794_RECORD_WRITE            = NO
APP801_WRITE                   = NO
SOURCE_CHANGE                  = YES / DEPLOY TOOLING ONLY
BUSINESS_SOURCE_CHANGE         = NO
EXTERNAL_SERVICE_WORK          = NO
D2_D7_WRITE                    = NO
MAX_EXECUTOR_STATUS            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 9. Handoff Checkpoint

Start from `AI_DOCUMENT_INDEX.md`, this Control Center, relevant Confirmed Baselines, `AI_ACTIVE_TASK.md`, current HEAD, and exact evidence. Never revive Auth Bridge; D1 remains KINTONE-ONLY. The prior App794 deploy authorization is consumed and cannot be reused.
