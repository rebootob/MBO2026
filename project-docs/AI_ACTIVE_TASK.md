# AI ACTIVE TASK — R12E-B7 FINAL CORE WORKFLOW CLOSURE — AUTHORIZATION PENDING

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Target: App794 `MBO V2 Sandbox` ONLY
> Mode: PROJECT CLOSE MODE / FINAL CORE FUNCTIONAL UAT
> Kintone write/workflow authorization: **NONE — DO NOT EXECUTE BUSINESS ACTIONS YET**

## Reviewed checkpoint

R12E-B6 Remote-Debug Edge Control Gate = **PASS**.

Verified live/browser facts:
- dedicated non-default Microsoft Edge UAT profile;
- DevTools/CDP endpoint `127.0.0.1:9222` reachable;
- Antigravity can attach/control the Edge session;
- trusted page runtime user = `hr` exactly;
- App794 visible/readable;
- Record #10 exists and is synthetic/test-only;
- exact synthetic key = `MBO_UAT_M1G1_001|2026`;
- current status = `03 Manager Objective Review`;
- topology = `M1_G1`;
- Requester/Manager/GM = `hr`;
- First Manager = empty;
- prior pre-click gate verified App794 Rev38/38, Process 16 states / 28 actions, Status15 `ONE + USER: hr`, notification real-recipient risk PASS;
- Kintone writes in R12E-B6 = 0;
- workflow actions in R12E-B6 = 0;
- credential exposure = 0;
- `admin-form` remains TECHNICAL_ADMIN_ONLY / zero business workflow authority.

R12E-B4 authorization is consumed and MUST NOT be reused.

## North Star / close target

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Guard PASS -> Status15 UAT Boundary PASS -> Edge Browser Control PASS -> R12E-B7 Functional Workflow UAT -> CORE V1 FREEZE -> UI/UX -> Dashboard -> Final UAT -> Go-Live`

This is the final Core functional execution gate. Do not reopen discovery.

# CHANGE GOVERNANCE

## What
Reuse only existing synthetic App794 Record #10. Normalize it from status03 to status01 through the legitimate browser `Return Objective` action, execute the reviewed compact M1_G1 workflow matrix, verify fail-closed First-Manager actions, finish at status16, then delete the exact synthetic record only after full PASS.

## Where
App794 Sandbox only, existing Record #10 / exact key `MBO_UAT_M1G1_001|2026`, through the dedicated Antigravity-controlled Edge UAT profile.

## How
Fresh authorization -> pull exact authorized task -> reconnect CDP -> reverify browser identity/live drift -> 1 normalization transition -> 22 matrix transitions -> 3 First-Manager denial attempts -> evidence -> delete exact synthetic record after full PASS -> push -> STOP.

## Why
All remaining design, routing, status15 boundary, notification safety, and browser-control prerequisites have passed. This closes the Core functional workflow without using real workflow actors or real notifications.

## Expected Impact
Only synthetic Record #10 will transition and be deleted after full PASS. Real-user workflow/notification impact target = 0.

## Risks
Wrong browser/session, live configuration drift since Rev38, validation failure, unexpected notification recipient, failed workflow transition, or accidental action on non-synthetic data.

## Test Plan
Exactly 1 normalization successful transition + 22 reviewed successful workflow transitions + 3 First-Manager fail-closed attempts. Final status = `16 Completed` before cleanup.

## Rollback / Failure Plan
Do not force/reset workflow status. If any step fails, STOP immediately, preserve Record #10 and exact evidence, do not Change assignee, do not delete the failed fixture, and wait for ChatGPT review.

# FRESH AUTHORIZATION REQUIRED

Suggested exact authorization phrase:

`อนุมัติ controlled App794 R12E-B7 Final Core Workflow Closure ด้วย Record #10 บัญชี hr`

Authorization is single-use and scoped only to this manifest.

# PRECLICK SAFETY GATE — IMMEDIATELY BEFORE FIRST ACTION

After authorization:
1. Pull latest and require local HEAD = origin authorized-task commit.
2. Read mandatory canonical baseline in required order.
3. Confirm no `src/**`, `dist/**`, `tests/**` drift. No npm/build.
4. Confirm CDP endpoint `127.0.0.1:9222` is reachable and attached Edge profile is the dedicated UAT profile.
5. Confirm trusted page runtime `kintone.getLoginUser().code === "hr"`.
6. Confirm Record #10 exact key `MBO_UAT_M1G1_001|2026`, synthetic identity, current status exactly `03 Manager Objective Review`.
7. Confirm routing snapshot remains M1_G1; Requester/Manager/GM=`hr`; First Manager empty.
8. Re-read App794 live/preview configuration and require explained aligned revision, Process exactly 16/28, Status15 exactly `ONE + USER: hr`, canonical M1_G1 semantics unchanged, no real-recipient notification risk.
9. Verify no duplicate exact synthetic key.
10. Confirm `admin-form` is not the browser actor and will execute zero business actions.

Any mismatch or unexplained relevant drift => STOP BEFORE CLICK/WRITE.

# AUTHORIZED MATRIX — EXISTING RECORD #10 ONLY

## A. Normalize
- `03 Manager Objective Review -> 01 Draft Objective` via `Return Objective`.
- Expected normalization successful transitions = 1.
- Verify status01 immediately.

## B. Objective
1. At 01 attempt `Submit Objective to First Manager` -> DENIED / status unchanged.
2. `01 -> 03` Submit Objective to Manager.
3. `03 -> 01` Return Objective.
4. `01 -> 03` resubmit.
5. `03 -> 04` Approve Objective.
6. `04 -> 05` Approve Objective.

## C. Mid-Year
7. `05 -> 06` Start Mid-Year.
8. Max 1 bounded Mid-Year preparation edit only if validation requires it.
9. At 06 attempt `Submit Mid-Year to First Manager` -> DENIED / unchanged.
10. `06 -> 08` Submit Mid-Year to Manager.
11. `08 -> 06` Return Mid-Year Manager.
12. `06 -> 08` resubmit.
13. `08 -> 09` Approve Mid-Year Manager.
14. `09 -> 10` Approve Mid-Year GM.

## D. Final
15. `10 -> 11` Start Self Evaluation.
16. Max 1 bounded Final/Self preparation edit only if validation requires it.
17. At 11 attempt `Submit Final to First Manager` -> DENIED / unchanged.
18. `11 -> 13` Submit Final to Manager.
19. `13 -> 11` Return Final Manager.
20. `11 -> 13` resubmit.
21. `13 -> 14` Approve Final Manager.
22. `14 -> 15` Approve Final GM.

## E. HR Final
23. `15 -> 11` Return Final HR.
24. `11 -> 13` resubmit.
25. `13 -> 14` Approve Final Manager.
26. `14 -> 15` Approve Final GM.
27. `15 -> 16` Complete.

Expected matrix successful transitions = 22.
Expected First-Manager denials = 3.
Expected total successful transitions including normalization = 23.

# CLEANUP

Only if all PASS:
- normalization 1/1;
- matrix successful transitions 22/22;
- First-Manager denials 3/3;
- final status `16 Completed`;
- browser fatal MBO errors = 0;
- real-user workflow/notification impact = 0;
- admin-form business actions = 0;

Then delete exactly Record #10 / key `MBO_UAT_M1G1_001|2026`, verify exact key count = 0, capture evidence, push same branch, STOP.

If anything fails: preserve Record #10; do not delete.

# HARD BOUNDARIES

Forbidden:
- creating another UAT record;
- Process PUT/deploy/remap;
- schema/ACL/customization/notification-setting changes;
- App795/App53/App796/other-app writes;
- Change assignee;
- REST-only status transition claimed as browser proof;
- `admin-form` business workflow action;
- real Manager/GM/HR workflow or notification testing;
- credential exposure;
- source/dist/tests changes or npm/build;
- extra workflow permutations.

# PASS GATE

`FUNCTIONAL_WORKFLOW_UAT = PASS` only when:
- pre-click gate PASS;
- browser user exact `hr`;
- Record #10 synthetic identity PASS;
- normalization = 1/1;
- matrix = 22/22;
- First-Manager denials = 3/3;
- total successful transitions = 23;
- final status = 16 Completed;
- browser fatal MBO errors = 0;
- real-user impact = 0;
- admin-form business action count = 0;
- cleanup exact key = PASS.

Always preserve:
`SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED`
`NORMAL_RECORD_KEY_GENERATION_CLAIM = NOT_TESTED_BY_THIS_SYNTHETIC_FIXTURE`

# REQUIRED EVIDENCE

```text
M10L_D_R12E_B7_FINAL_CORE_WORKFLOW_CLOSURE = COMPLETE / BLOCKED
AUTHORIZATION_SCOPE = APP794_R12E_B7_RECORD10_ONLY
AUTHORIZATION_CONSUMED = YES
EDGE_CONTROL_GATE = PASS
BROWSER_AUTHENTICATED_USER = hr
PRECHECK_LIVE_REVISION = actual
PRECHECK_PREVIEW_REVISION = actual
PRECHECK_PROCESS_STATE_COUNT = actual
PRECHECK_PROCESS_ACTION_COUNT = actual
PRECHECK_STATUS15_ASSIGNEE = actual
PRECHECK_NOTIFICATION_REAL_RECIPIENT_RISK = PASS/FAIL
UAT_RECORD_NUMBER = 10
UAT_RECORD_KEY = MBO_UAT_M1G1_001|2026
UAT_RECORD_SYNTHETIC_IDENTITY = PASS/FAIL
UAT_PRE_NORMALIZATION_STATUS = actual
NORMALIZATION_SUCCESSFUL_TRANSITIONS = actual
UAT_POST_NORMALIZATION_STATUS = actual
UAT_RECORD_CREATE_COUNT = 0
UAT_RECORD_EDIT_COUNT = actual
PROCESS_PUT_COUNT = 0
DEPLOY_POST_COUNT = 0
EXPECTED_MATRIX_SUCCESSFUL_TRANSITIONS = 22
ACTUAL_MATRIX_SUCCESSFUL_TRANSITIONS = actual
EXPECTED_TOTAL_SUCCESSFUL_TRANSITIONS = 23
ACTUAL_TOTAL_SUCCESSFUL_TRANSITIONS = actual
EXPECTED_FIRST_MANAGER_DENIALS = 3
ACTUAL_FIRST_MANAGER_DENIALS = actual
FINAL_STATUS = actual
BROWSER_FATAL_MBO_ERROR_COUNT = actual
REAL_USER_NOTIFICATION_TRIGGERED = 0
REAL_USER_WORKFLOW_IMPACT = 0
ADMIN_FORM_BUSINESS_ACTION_COUNT = 0
SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED
NORMAL_RECORD_KEY_GENERATION_CLAIM = NOT_TESTED_BY_THIS_SYNTHETIC_FIXTURE
FUNCTIONAL_WORKFLOW_UAT = PASS/FAIL/NOT_COMPLETED
UAT_RECORD_DELETE_COUNT = actual
UAT_RECORD_CLEANUP_VERIFIED = PASS/FAIL/NOT_EXECUTED
APP795_WRITE = 0
APP53_WRITE = 0
APP796_WRITE = 0
OTHER_APP_WRITE = 0
SRC_CHANGE_COUNT = 0
DIST_CHANGE_COUNT = 0
TEST_CHANGE_COUNT = 0
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW; IF PASS FREEZE CORE V1 AND MOVE TO UI/UX + DASHBOARD
```

# STOP CONDITION

Current state: **FINAL EXECUTION READY / FRESH AUTHORIZATION REQUIRED**. Until authorization is recorded: NO KINTONE BUSINESS ACTION.