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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO LIVE PASS / LIST→CREATE SESSION PASS / DEPLOY GUARD PASS / APP794 ACL PASS / DEPLOY PROVENANCE RECOVERED / DEPLOY TOOLING SOURCE FIX PRESENT / TEST CLOSURE REQUIRED / FINAL UAT BLOCKED |
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
APP794_DEPLOY_PROVENANCE_RECOVERY       = PASS / ACCEPTED AT a7badd223568bc26dfc37171be779cf2df5846f7
APP794_DEPLOY_AUTHORIZATION_ID          = APP794-CORRECTIVE-DEPLOY-20260829-01
APP794_DEPLOY_AUTHORIZATION_STATE       = CONSUMED / FAILED AFTER FILE UPLOAD / BEFORE PREVIEW PUT
APP794_DEPLOY_EFFECTIVE_LIVE            = NO
APP794_DEPLOY_TOOLING_SOURCE_FIX        = PRESENT AT c7e82d1e4b9f3a95a545605f8b4408d707b5366e
APP794_DEPLOY_TOOLING_CORRECTIVE        = CORRECTIVE REQUIRED / TEST CLOSURE ONLY
D1_LIVE_CUTOVER                         = BLOCKED UNTIL TOOLING TEST CLOSURE PASS + NEW DEPLOY AUTHORIZATION + LIVE UAT + ADMIN RESET UI UAT
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

### App794 live corrective behavior check — user evidence
Under employee-facing Kintone principal `s1`, authenticated MBO Employee_Code `0113`:
- My MBO loads and session continuity works;
- expected coherent Employee-Self shell is not on Live;
- Logout is absent;
- `+ Create New MBO` reaches `/k/794/edit` but still raises `Employee Profile Resolution Failed` / `kintone.app.record.get() in handler`;
- Console still shows `AdminDiagnosticModel is not defined` from the old bundle.

Therefore:
```text
APP794_DEPLOY_EFFECTIVE_LIVE = NO
```

## 5. HR / admin-form Password Reset Requirement

Permanent D1 requirement remains: HR-authorized users and `admin-form` need an in-Kintone Reset MBO Password function; employee/shared users must not receive it. Manual reset of `0113` proved reset semantics only. Production administrative UI/function remains mandatory before final D1 closure.

## 6. Accepted Deploy Provenance

Evidence commit:
`a7badd223568bc26dfc37171be779cf2df5846f7`

Recovered prior attempt:
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
LIVE_WRITE_DURING_RECOVERY = 0
```

Root cause: the narrow App794 authorization/target guards passed, but `deploy-custom-ui.js` called generic `kintoneRequest()` for Preview PUT without `bypassDiscovery: true`, so global Discovery read-only protection blocked before Preview mutation. The prior authorization is consumed and must never be reused.

## 7. Independent Review — Deploy Tooling Source Fix

Reviewed commit:
`c7e82d1e4b9f3a95a545605f8b4408d707b5366e`

Changed files only:
- `scripts/kintone/deploy-custom-ui.js`
- `tests/deploy-customization-preservation.test.js`

Source change is directionally correct:
- `PUT /k/v1/preview/app/customize.json` now passes `bypassDiscovery: true`;
- `POST /k/v1/preview/app/deploy.json` now passes `bypassDiscovery: true`;
- `kintoneRequest()` itself was not widened; default bypass remains false;
- existing target binding and authorization checks still occur before upload/network path;
- `DISCOVERY_MODE` / global write allow-list were not changed by this commit.

Review result:
```text
APP794_DEPLOY_TOOLING_CORRECTIVE = CORRECTIVE_REQUIRED / TEST CLOSURE ONLY
```

Reason: Active Task required deterministic proof that the authorized App794 execution path supplies bypass to exactly those two write operations after guard success, and that no unrelated endpoint/method receives bypass. The new tests only prove that writes without bypass are blocked and that protected Apps 53/283 remain blocked. They do not exercise/observe the authorized integration point itself.

GitHub has no status checks for commit `c7e82d1e...`; do not claim hosted CI PASS.

## 8. Exact Next Action — TOOLING TEST CLOSURE ONLY

Antigravity may make the smallest source/testability adjustment required to prove the real write-call boundary without any live network.

Preferred pattern: a tiny pure allowlist/request-options helper used by the two real write call sites, with deterministic tests for:
- exact PUT customization => bypass true;
- exact POST deploy => bypass true;
- wrong endpoint/method => rejected/no bypass;
- missing auth / wrong App ID / registry drift => block before network/upload;
- malformed/replayed auth remains blocked by accepted authorization tests;
- protected 53/283 remain blocked;
- `DISCOVERY_MODE === true`;
- `WRITE_ALLOWED_APPS = []`;
- build-only zero-network/no live authorization.

No live Kintone write or deploy is authorized. After independent review PASS, Control Plane must request a NEW explicit one-shot App794 deploy authorization from the user.

```text
NEXT_ACTION_OWNER              = ANTIGRAVITY / SOURCE+TEST ONLY
ANTIGRAVITY_REQUIRED           = YES
APP794_DEPLOY                  = NO
APP794_UPLOAD                  = NO
APP794_PREVIEW_WRITE           = NO
APP794_ACL_WRITE               = NO
APP794_RECORD_WRITE            = NO
APP801_WRITE                   = NO
SOURCE_CHANGE                  = YES / DEPLOY TOOLING TESTABILITY ONLY
BUSINESS_SOURCE_CHANGE         = NO
EXTERNAL_SERVICE_WORK          = NO
D2_D7_WRITE                    = NO
MAX_EXECUTOR_STATUS            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 9. Handoff Checkpoint

Start from `AI_DOCUMENT_INDEX.md`, this Control Center, relevant Confirmed Baselines, `AI_ACTIVE_TASK.md`, current HEAD, and exact evidence. Never revive Auth Bridge; D1 remains KINTONE-ONLY. The prior App794 deploy authorization is consumed and cannot be reused.
