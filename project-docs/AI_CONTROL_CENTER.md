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
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO LIVE PASS / LIST→CREATE SESSION PASS / LIVE CREATE STILL ON OLD CUSTOMIZATION / DEPLOY GUARD CORRECTIVE REQUIRED / FINAL UAT BLOCKED |
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
APP801_PRIVATE_APP_GROUP_BLOCKER        = CONFIRMED ROOT CAUSE
APP801_APP_GROUP_PUBLIC_CORRECTION      = USER APPLIED 2026-08-29
APP801_SHARED_PRINCIPAL_s1_LIVE_ACCESS = PASS / 128 RECORDS VISIBLE
D1_HR_ADMIN_PASSWORD_RESET_REQUIREMENT  = PASS / BASELINED
D1_RESET_PASSWORD_0113                  = PASS / AUTHORIZATION CONSUMED / CREDENTIAL VERSION 2
D1_FORCE_PASSWORD_CHANGE_0113           = PASS / USER LIVE OBSERVATION
D1_LOGIN_0113_TO_MY_MBO                 = PASS / USER LIVE OBSERVATION
D1_LIST_TO_CREATE_SESSION_CONTINUITY    = PASS / USER LIVE OBSERVATION
D1_CREATE_LIVE_RUNTIME                  = FAIL / OLD LIVE CUSTOMIZATION CALLS kintone.app.record.get() DURING HANDLER
APP794_DELETE_PERMISSION_READONLY_CHECK = PENDING
APP794_DEPLOY_GUARD_INTEGRATION         = CORRECTIVE REQUIRED AT 8d8e88e13ff0ef6798329266c69f721ab15b3f79
APP794_CORRECTIVE_DEPLOY                = NOT AUTHORIZED YET
D1_LIVE_CUTOVER                         = BLOCKED UNTIL DEPLOY-GUARD PASS + CORRECTIVE DEPLOY + REMAINING UAT
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
- `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`

## 4. Accepted Live Evidence — 2026-08-29

- App801 access for `s1` = PASS after App Group correction.
- Reset Password 0113 = PASS; authorization consumed.
- Force Password Change = PASS.
- Login -> My MBO (0113) = PASS.
- List -> Create preserves session = PASS.
- Live Create still fails only because the deployed App794 customization is older than the already-accepted source Create-handler corrective.

Do not reopen the accepted Create source fix unless the future corrective deploy still reproduces the error.

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

The administrative UI/function is still implementation work; the manual 0113 reset proved semantics only.

## 6. Independent Review — Deploy Guard commit 8d8e88e1

Review result: **CORRECTIVE REQUIRED**.

Accepted parts:
- narrow App794 authorization validator exists;
- explicit authorization/window/single-use checks exist;
- `DISCOVERY_MODE` remains true;
- default `WRITE_ALLOWED_APPS` remains empty;
- build-only returns before Kintone client/network path;
- no App794 business/auth/UI source or dist was changed.

Blocking findings:
1. Authorization target is validated before the live target is resolved from `sandbox-apps.json`. After validation, `deploy-custom-ui.js` replaces `app` from registry and then calls the generic guard with ephemeral `[app]`. Therefore the authorization target is not cryptographically/logically bound to the final network target. A registry drift away from 794 could authorize 794 but guard a different registered sandbox app. The resolved live target must fail closed unless it is exactly 794, and the ephemeral allow-list must be exactly `[794]`, never `[resolvedApp]`.
2. Mandatory tests are incomplete. Current added test covers the validator itself but does not prove the live entrypoint missing-auth pre-network block, resolved-target drift block, a second protected legacy app (for example 283), or the exact authorized deployment context through the actual guard integration without network I/O.
3. No GitHub CI/status checks exist for the commit; do not claim independent `npm test` PASS from repository evidence.

## 7. Exact Next Action — DEPLOY GUARD CORRECTIVE SOURCE/TEST ONLY

Antigravity must make one narrow corrective package:
1. bind authorization target, requested target, registry-resolved target, and actual deploy target to exact App794;
2. if `options.appId` is supplied and is not 794, fail closed;
3. if `sandbox-apps.json.mboV2AppId` is missing/malformed/not 794, fail closed before Kintone/network work; do not silently fall back to another target;
4. generic sandbox guard must receive ephemeral exact `[794]`, not `[app]` derived from mutable runtime state;
5. preserve protected-app hard blocks, `DISCOVERY_MODE=true`, and empty global `WRITE_ALLOWED_APPS`;
6. add focused tests for missing auth pre-network, wrong supplied target, registry/resolved-target drift, replay, malformed auth, App53 + legacy App283 protected spoof, exact authorized App794 guard context without network, and build-only zero-network/no auth;
7. no live Kintone, no deploy, no business/auth/Create/UI source, no main, no dist, no D2-D7.

```text
NEXT_ACTION_OWNER              = Antigravity
ANTIGRAVITY_REQUIRED           = YES / ONE CORRECTIVE PACKAGE
KINTONE_LIVE_READ_WRITE        = NO
APP801_WRITE                   = NO
APP794_DEPLOY                  = NO
APP794_SOURCE_BEHAVIOR_CHANGE  = NO
DEPLOY_TOOLING_SOURCE_TEST     = YES
EXTERNAL_SERVICE_WORK          = NO
D2_D7_WRITE                    = NO
MAX_EXECUTOR_STATUS            = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

After Deploy Guard PASS:
1. perform pending App794 Delete-permission read-only check;
2. request a new exact App794 corrective deploy authorization;
3. deploy once with accepted module-aware bundle + Create-handler fix + Employee-Self shell/history/Completed/no-delete changes;
4. rerun Create live UAT and remaining D1 security/session UAT.

## 8. Handoff Checkpoint

A new ChatGPT/AI session must start from:

```text
1. AI_DOCUMENT_INDEX.md
2. AI_CONTROL_CENTER.md
3. CONFIRMED_BASELINE/README.md
4. CONFIRMED_BASELINE/D1_AUTH_SECURITY.md
5. CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md
6. CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md
7. CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md
8. AI_ACTIVE_TASK.md
9. current branch HEAD + exact diff/evidence
```

Do NOT revive Auth Bridge from chat history or abandoned service files. Current architecture is KINTONE-ONLY.
