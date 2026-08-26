# AI ACTIVE TASK — R12E-B6 REMOTE-DEBUG EDGE CONTROL GATE — AUTHORIZATION PENDING

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Target: App794 `MBO V2 Sandbox` ONLY
> Mode: PROJECT CLOSE MODE / BROWSER CONTROL ONLY
> Kintone write/workflow authorization: **NONE — DO NOT EXECUTE BUSINESS ACTIONS**

## Reviewed checkpoint

R12E-B5 Browser-Control Gate = **BLOCKED**, safely.

Verified:
- App794 remains live and readable.
- Record #10 = synthetic key `MBO_UAT_M1G1_001|2026`.
- Current status = `03 Manager Objective Review`.
- topology = `M1_G1`.
- Requester/Manager/GM = `hr`; First Manager empty.
- browser identity evidence = `hr`.
- Kintone writes = 0.
- workflow actions = 0.
- credential exposure = 0.
- Antigravity-controllable Edge session = NO.
- exact browser-control blocker: Microsoft Edge was running without `--remote-debugging-port=9222`; local Edge DevTools port 9222 was closed.

R12E-B4 authorization is consumed and MUST NOT be reused. No business action is authorized by this task.

## North Star

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Guard PASS -> Status15 UAT Boundary PASS -> Edge Browser Control -> Functional Workflow UAT -> CORE V1 FREEZE -> UI/UX -> Dashboard -> Final UAT -> Go-Live`

## Purpose

Establish one isolated Microsoft Edge process/profile that Antigravity can attach to through localhost DevTools remote debugging, while authenticated to Kintone as `hr`. This task is browser-control/read-only only.

Do not attach to or modify the user's Chrome/ChatGPT session.

## Required user-side Edge launch

Use a dedicated non-default Edge profile directory and localhost remote debugging port 9222. Example Windows PowerShell launch pattern:

```powershell
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (!(Test-Path $edge)) { $edge = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }
& $edge --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1 --user-data-dir="$env:TEMP\MBO-UAT-Edge" "https://ttmet.cybozu.com/k/794/"
```

Security boundary:
- dedicated UAT profile only;
- bind debugging to localhost `127.0.0.1` only;
- do not reuse the user's normal/default Edge profile;
- close this Edge process after UAT closure;
- credential values must never be logged or committed.

If Kintone login is required in that dedicated Edge window, authenticate as the user-approved Sandbox UAT account `hr`. `.env.local` may only be used to fill the real browser login form if Antigravity can do that without exposing values.

## R12E-B6 Browser-Control PASS gate — READ ONLY

Antigravity may perform only the following after the dedicated Edge process is launched:

1. Verify `127.0.0.1:9222` DevTools endpoint is reachable locally.
2. Attach to the dedicated Edge page through DevTools/CDP.
3. Navigate/read App794 only.
4. Verify trusted page runtime exact identity: `kintone.getLoginUser().code === "hr"`.
5. Open/read Record #10.
6. Verify exact synthetic key `MBO_UAT_M1G1_001|2026`.
7. Verify current status remains `03 Manager Objective Review`.
8. Verify no edit/create/delete/workflow action occurred.

Required evidence:

```text
R12E_B6_EDGE_CONTROL_GATE = PASS / BLOCKED
DEVTOOLS_ENDPOINT_127_0_0_1_9222 = REACHABLE / CLOSED
BROWSER_ENGINE = Microsoft Edge
BROWSER_PROFILE = DEDICATED_UAT_NONDEFAULT
BROWSER_SESSION_CONTROLLABLE_BY_ANTIGRAVITY = YES / NO
BROWSER_AUTHENTICATED_USER = hr / actual
APP794_VISIBLE = YES / NO
UAT_RECORD_NUMBER = 10 / actual
UAT_RECORD_KEY = MBO_UAT_M1G1_001|2026 / actual
UAT_CURRENT_STATUS = actual
KINTONE_WRITE_COUNT = 0
WORKFLOW_ACTION_COUNT = 0
CREDENTIAL_VALUE_EXPOSED = NO
SRC_CHANGE_COUNT = 0
DIST_CHANGE_COUNT = 0
TEST_CHANGE_COUNT = 0
GIT_PUSH_SYNC = PASS / FAIL
```

If any required item fails: STOP with zero Kintone business action.

## Hard boundaries

Until a future fresh explicit authorization:
- NO Submit / Approve / Return / Start / Complete;
- NO record edit/delete/create;
- NO Process PUT/deploy/remap;
- NO App795/App53/App796/other-app write;
- NO Change assignee;
- NO REST-only status transition;
- NO `admin-form` business action;
- NO source/dist/tests change or npm/build;
- NO credential value in logs/docs/Git.

## Future final closure — NOT AUTHORIZED HERE

Only after `R12E_B6_EDGE_CONTROL_GATE = PASS` and a fresh user authorization:
1. Record #10 `03 -> 01` via `Return Objective` normalization;
2. 22 reviewed successful workflow transitions;
3. 3 First-Manager fail-closed attempts;
4. final `16 Completed`;
5. delete exact synthetic Record #10 after full PASS;
6. evidence -> push -> STOP;
7. ChatGPT review -> if PASS, CORE V1 FREEZE.

Always preserve:
`SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED`
`NORMAL_RECORD_KEY_GENERATION_CLAIM = NOT_TESTED_BY_THIS_SYNTHETIC_FIXTURE`

# STOP CONDITION

Current state: **BROWSER CONTROL NOT YET PROVEN / NO KINTONE WRITE AUTHORIZATION**.