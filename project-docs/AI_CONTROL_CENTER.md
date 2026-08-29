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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO LIVE PASS / LIST→CREATE SESSION PASS / DEPLOY GUARD PASS / APP794 ACL PASS / APP794 CORRECTIVE DEPLOY AUTHORIZED / FINAL UAT BLOCKED |
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
D1_HR_ADMIN_PASSWORD_RESET_REQUIREMENT  = PASS / BASELINED / PRODUCTION ADMIN UI STILL TO IMPLEMENT
D1_RESET_PASSWORD_0113                  = PASS / AUTHORIZATION CONSUMED
D1_FORCE_PASSWORD_CHANGE_0113           = PASS / USER LIVE OBSERVATION
D1_LOGIN_0113_TO_MY_MBO                 = PASS / USER LIVE OBSERVATION
D1_LIST_TO_CREATE_SESSION_CONTINUITY    = PASS / USER LIVE OBSERVATION
D1_CREATE_LIVE_RUNTIME                  = FAIL / OLD LIVE CUSTOMIZATION
APP794_DEPLOY_GUARD_INTEGRATION         = PASS / ACCEPTED AT 8fa69bec7683bd64dbbd65fd3adf38bd1535e29b
APP794_DELETE_PERMISSION_READONLY_CHECK = PASS / RESOLVED BY APP-ACL CORRECTION
APP794_ACL_CORRECTION                   = PASS / USER LIVE WRITE + READ-BACK / ACL REVISION 43 -> 44
APP794_ACL_WRITE_AUTHORIZATION          = CONSUMED / CLOSED
APP794_CORRECTIVE_DEPLOY                = AUTHORIZED BY USER 2026-08-29 / EXACT ONE-SHOT
APP794_DEPLOY_AUTHORIZATION_ID          = APP794-CORRECTIVE-DEPLOY-20260829-01
D1_LIVE_CUTOVER                         = BLOCKED UNTIL DEPLOY REVIEW + REMAINING UAT + ADMIN RESET UI UAT
D2-D7 LIVE WRITES                       = NOT AUTHORIZED unless separately recorded
```

## 3. Non-Negotiable Constraint

D1 must finish entirely inside Kintone. No external server, auth service, database, reverse proxy, session service, or Auth Bridge.

## 4. Accepted Live Evidence

### App801 / login
- `s1` is in `MBO_EMPLOYEE_ACCESS`.
- App801 App Group corrected to Public; `MBO_EMPLOYEE_ACCESS` has View/Edit only; Everyone denied.
- `s1` can open App801 and see 128 records.
- Reset `0113` = PASS; Force Password Change = PASS; Login -> My MBO = PASS; List -> Create keeps session = PASS.

### App794 Create
- Live `/k/794/edit` currently fails because deployed App794 customization is older than the accepted Create-handler source corrective.
- Do not reopen the accepted Create source fix unless the corrective deploy still reproduces the error.

### App794 App ACL
User-authorized App794-only ACL correction passed live read-back:
- ACL revision `43 -> 44`;
- CREATOR full rights preserved;
- `MBO_EMPLOYEE_ACCESS`: View=true, Add=true, Edit=true, Delete=false, Manage=false, Import=false, Export=false;
- `everyone`: all permissions false;
- evidence: `APP794_ACL_CORRECTION_OVERALL_PASS = true`.

## 5. HR / admin-form Password Reset Requirement

Permanent D1 requirement remains: HR-authorized users and `admin-form` need an in-Kintone Reset MBO Password function; employee/shared users must not receive it. Reset semantics remain Employee_Code temporary password, Force Change YES, failed attempts 0, clear temporary lock/session, increment Credential_Version once, never change Account_Status, exact one-record fail-closed targeting.

Manual reset of `0113` proved reset semantics only. Production administrative UI/function remains mandatory before final D1 closure. It is explicitly OUTSIDE this App794 corrective deploy authorization.

## 6. Independent Review — App794 Deploy Guard

Review result: **PASS / ACCEPTED**.

Accepted implementation chain:
- `8d8e88e13ff0ef6798329266c69f721ab15b3f79` introduced the narrow App794 customization deploy authorization gate;
- `04e1563f824d4e801f46411b9282ce292f2a478f` bound supplied target, registry target and actual deploy target to exact App794 and removed silent target fallback;
- `8fa69bec7683bd64dbbd65fd3adf38bd1535e29b` closed the deterministic registry-drift test gap using `validateApp794DeployTargetBinding()` and the real deploy entrypoint uses the same helper.

Accepted invariants:
- authorization/request/options/registry/actual live target must all resolve to exact integer `794`;
- registry missing/malformed/drifted target fails closed;
- generic sandbox guard uses literal ephemeral `[794]`;
- `DISCOVERY_MODE = true`, global `WRITE_ALLOWED_APPS = []`;
- Apps 53, 283, 305, 307, 310, 640, 643, 715, 716 remain hard-blocked;
- build-only exits before Kintone/network path.

## 7. Exact Authorized Action — APP794 CORRECTIVE DEPLOY

User explicitly authorized **App794 Corrective Deploy** on 2026-08-29.

Authorization ID:
`APP794-CORRECTIVE-DEPLOY-20260829-01`

Exact one-deploy scope only:
1. accepted module-aware App794 bundle;
2. accepted Create-handler corrective;
3. accepted Employee-Self coherent index shell / Logout / My MBO;
4. accepted My MBO history + Completed display;
5. accepted Employee-Self no-delete source guard;
6. current App794 customization artifact produced through accepted deploy-guard tooling.

Required preconditions before live write:
- sync exact branch HEAD and clean working tree;
- confirm App794 registry target is exact integer 794;
- run `npm test` and stop on failure;
- run build-only deploy path and stop on failure;
- no new source/business change in this execution package.

Live execution must use the accepted narrow guard with exact values:
```text
appId        = 794
workPackage  = MBO-P03-WP-002C
stage        = STAGE_D1_APP794_CUSTOMIZATION_DEPLOY
operation    = APP794_CUSTOMIZATION_DEPLOY
authorizationId = APP794-CORRECTIVE-DEPLOY-20260829-01
explicitUserAuthorization = true
activeWindow = true
```

After deploy, capture evidence without business contents:
- source HEAD used;
- build/test result;
- App794 target identity;
- customization preflight/revision evidence;
- upload target filename `mbo-employee-app.js`;
- deploy request + final `SUCCESS`;
- live customization read-back/revision if available;
- zero App801/ACL/record/other-app writes.

Authorization is consumed after the one successful guarded live deploy attempt. Do not retry a failed post-write deploy automatically; STOP and return evidence for Control Plane review.

Forbidden in this authorization:
- App801 schema/ACL/data/credential changes;
- further App794 App ACL change;
- App794 record writes/deletes;
- routing/scoring/workflow changes;
- HR/admin Password Reset UI implementation;
- Auth Bridge / external service;
- D2-D7 writes.

```text
NEXT_ACTION_OWNER              = ANTIGRAVITY
ANTIGRAVITY_REQUIRED           = YES / EXECUTION ONLY
APP794_DEPLOY                  = YES / EXACT ONE-SHOT
APP794_ACL_WRITE               = NO / PRIOR AUTHORIZATION CONSUMED
APP794_RECORD_WRITE            = NO
APP801_WRITE                   = NO
SOURCE_CHANGE                  = NO
EXTERNAL_SERVICE_WORK          = NO
D2_D7_WRITE                    = NO
MAX_EXECUTOR_STATUS            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

After Antigravity deploy evidence arrives, ChatGPT must independently review before any further live action.

## 8. Handoff Checkpoint

Start from `AI_DOCUMENT_INDEX.md`, this Control Center, relevant Confirmed Baselines, `AI_ACTIVE_TASK.md`, current HEAD, and exact diff/evidence. Never revive Auth Bridge; D1 remains KINTONE-ONLY.
