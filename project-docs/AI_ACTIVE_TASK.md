# AI ACTIVE TASK — R12E-B4 NORMALIZED EXISTING-RECORD WORKFLOW CLOSURE — AUTHORIZED

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Target: App794 `MBO V2 Sandbox` ONLY
> Mode: PROJECT CLOSE MODE / FINAL CORE FUNCTIONAL UAT
> Starting control-plane HEAD: `c44e4d021f8fbaf2d8ffd66031a15052457968d9`
> Fresh user authorization: **GRANTED ONCE** by exact instruction `อนุมัติ controlled App794 R12E-B4 Normalize + Workflow Closure ด้วย Record #10 บัญชี hr`
> Authorization scope: this R12E-B4 manifest only.
> Authorization is SINGLE-USE and is consumed by this execution attempt. It does not authorize Process/config changes, production writes, UI/Dashboard work, or later tasks.

# REVIEWED CHECKPOINT

R12E-B3 read-only browser precheck is accepted as **PASS WITH START-STATE MISMATCH**.

Verified from live read-only browser evidence:
- browser authenticated Kintone user = `hr`;
- Record #10 exists and is synthetic/test-only;
- exact synthetic fixture key = `MBO_UAT_M1G1_001|2026`;
- current status = `03 Manager Objective Review`;
- `Routing_Topology = M1_G1`;
- `Requester_User = [hr]`;
- `Manager_User = [hr]`;
- `GM_User = [hr]`;
- `First_Manager_User = []`;
- R12E-B3 executed 0 Kintone writes, 0 record edits, 0 workflow clicks;
- `admin-form` remains TECHNICAL_ADMIN_ONLY / zero business authority.

This synthetic fixture key does not follow normal runtime `buildRecordKey(fiscalYear, employeeCode)` format. This UAT may certify workflow behavior only and must not be cited as evidence for normal annual Record_Key generation.

# NORTH STAR / CLOSE TARGET

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Guard PASS -> Notification Safety PASS -> R12E-B4 Functional Workflow UAT -> CORE V1 FREEZE`

Do not reopen broad discovery. Do not create another UAT record.

# CHANGE GOVERNANCE

## What
Use the existing controlled synthetic Record #10. First normalize its current workflow status from `03 Manager Objective Review` back to `01 Draft Objective` through the legitimate `Return Objective` action, then execute the compact functional workflow matrix and clean up the synthetic record after full PASS.

## Where
App794 Sandbox only, existing Record #10 / exact key `MBO_UAT_M1G1_001|2026`.

## How
Pull latest -> mandatory baseline gate -> pre-click live drift/identity/notification check -> one browser normalization action -> 22 successful browser transitions + 3 First-Manager fail-closed attempts -> evidence -> delete exact synthetic record only after full PASS -> push -> STOP.

## Why
R12E-B3 proved the fixture is valid and controlled but found it already at status03. Returning it through the normal approved workflow path is safer and faster than creating a new record or forcing status.

## Expected Impact
Only the synthetic App794 Sandbox Record #10 is expected to move through workflow states and then be deleted after full PASS. Real-user workflow/notification impact target remains 0.

## Risks
Unexpected Rev38 configuration drift, wrong browser identity/session, notification drift to real recipients, validation failure, workflow transition failure, or accidental action on a non-synthetic record.

## Test Plan
Exactly 1 normalization transition + 22 compact matrix successful transitions + 3 First-Manager fail-closed attempts, ending in `16 Completed`.

## Rollback / Failure Plan
Process status transitions are not force-rolled back. If any step fails, STOP immediately, preserve Record #10 and evidence, do not Change assignee, do not force status, do not delete the failed fixture, and wait for ChatGPT review.

# PRECLICK SAFETY GATE — BEFORE FIRST BUSINESS ACTION

1. Pull latest `ai/antigravity-wp002c`; local HEAD must equal origin authorized task commit.
2. Read canonical baseline in mandatory order.
3. Confirm no `src/**`, `dist/**`, `tests/**` drift. Do not run npm/build.
4. Confirm real browser user exactly `hr`.
5. Confirm Record #10 still has exact key `MBO_UAT_M1G1_001|2026`, is synthetic/test-only, and status remains exactly `03 Manager Objective Review`.
6. Confirm routing snapshot remains `M1_G1`, Requester/Manager/GM=`hr`, First Manager empty.
7. Re-read current App794 live/preview configuration because live evidence moved from Rev37 to Rev38 after the earlier checkpoint:
   - live/preview aligned at `38/38` or a later fully explained/reconciled revision;
   - Process exactly 16 states / 28 actions;
   - Status15 exactly `ONE + USER: hr`;
   - M1_G1 Process semantics match canonical baseline;
   - no unexpected notification config / real-recipient risk.
8. Verify no duplicate Record #10 / exact key fixture exists.
9. Confirm `admin-form` is not the active browser actor and will execute zero business actions.

Any mismatch, unexplained relevant drift, browser user != `hr`, duplicate fixture, or real-recipient risk => **STOP BEFORE CLICK/WRITE**.

# AUTHORIZED SCOPE — APP794 EXISTING RECORD #10 ONLY

## A. Normalization transition

Through the real App794 browser UI as `hr`:

`03 Manager Objective Review -> 01 Draft Objective` using `Return Objective`.

Expected `NORMALIZATION_SUCCESSFUL_TRANSITIONS = 1`.
Immediately verify resulting status = `01 Draft Objective`.
If not, STOP and preserve Record #10.

## B. Compact functional matrix from status01

### Objective
1. At `01`: attempt `Submit Objective to First Manager` -> DENIED / status unchanged.
2. `01 -> 03` Submit Objective to Manager.
3. `03 -> 01` Return Objective.
4. `01 -> 03` resubmit.
5. `03 -> 04` Approve Objective.
6. `04 -> 05` Approve Objective.

### Mid-Year
7. `05 -> 06` Start Mid-Year.
8. Max 1 bounded Mid-Year preparation edit if validation requires it.
9. At `06`: attempt `Submit Mid-Year to First Manager` -> DENIED / status unchanged.
10. `06 -> 08` Submit Mid-Year to Manager.
11. `08 -> 06` Return Mid-Year Manager.
12. `06 -> 08` resubmit.
13. `08 -> 09` Approve Mid-Year Manager.
14. `09 -> 10` Approve Mid-Year GM.

### Final
15. `10 -> 11` Start Self Evaluation.
16. Max 1 bounded Final/Self preparation edit if validation requires it.
17. At `11`: attempt `Submit Final to First Manager` -> DENIED / status unchanged.
18. `11 -> 13` Submit Final to Manager.
19. `13 -> 11` Return Final Manager.
20. `11 -> 13` resubmit.
21. `13 -> 14` Approve Final Manager.
22. `14 -> 15` Approve Final GM.

### HR Final
23. `15 -> 11` Return Final HR.
24. `11 -> 13` resubmit.
25. `13 -> 14` Approve Final Manager.
26. `14 -> 15` Approve Final GM.
27. `15 -> 16` Complete.

Expected matrix successful transitions = `22`.
Expected First-Manager denials = `3`.
Expected total successful transitions including normalization = `23`.

# CLEANUP

If and only if normalization + 22/22 matrix transitions + 3/3 denials + final `16 Completed` all PASS:
- capture browser/runtime evidence;
- confirm browser fatal MBO errors = 0;
- confirm real-user workflow/notification impact = 0;
- confirm `admin-form` business actions = 0;
- delete exactly Record #10 / key `MBO_UAT_M1G1_001|2026`;
- verify exact key count = 0;
- update evidence/living docs, push same branch, STOP.

If any step fails:
- STOP immediately;
- do not force status;
- do not Change assignee;
- do not delete failed synthetic record;
- preserve exact evidence for ChatGPT review.

# HARD BOUNDARIES

Forbidden:
- creating another UAT record;
- Process PUT/deploy/remap;
- App795/App53/App796/other-app writes;
- schema/ACL/customization/notification-setting changes;
- Change assignee;
- forced/direct REST status changes claimed as browser proof;
- `admin-form` business workflow action;
- real Manager/GM/HR workflow or notification testing;
- credential exposure;
- source/dist/tests changes or npm/build;
- extra workflow permutations.

# PASS GATE

`FUNCTIONAL_WORKFLOW_UAT = PASS` requires all of:
- pre-click drift gate PASS;
- browser user = `hr`;
- exact Record #10 synthetic identity PASS;
- normalization `03 -> 01` = 1/1 PASS;
- compact matrix successful transitions = 22/22;
- First-Manager denials = 3/3 with unchanged status;
- total successful transitions = 23;
- final status = `16 Completed`;
- browser fatal MBO errors = 0;
- real-user impact = 0;
- admin-form business actions = 0;
- exact synthetic record cleanup PASS.

Always report separately:
`SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED`
`NORMAL_RECORD_KEY_GENERATION_CLAIM = NOT_TESTED_BY_THIS_SYNTHETIC_FIXTURE`

# REQUIRED EVIDENCE

```text
M10L_D_R12E_B4_NORMALIZED_EXISTING_RECORD_WORKFLOW_UAT = COMPLETE / BLOCKED
AUTHORIZATION_SCOPE = APP794_R12E_B4_RECORD10_ONLY
AUTHORIZATION_CONSUMED = YES
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
NORMALIZATION_ACTION = Return Objective
NORMALIZATION_SUCCESSFUL_TRANSITIONS = actual
UAT_POST_NORMALIZATION_STATUS = actual
UAT_ROUTING_TOPOLOGY = actual
UAT_REQUESTER = actual
UAT_MANAGER = actual
UAT_GM = actual
UAT_FIRST_MANAGER = actual
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
NEXT_ACTION = CHATGPT REVIEW; IF PASS FREEZE CORE V1 AND MOVE TO UI/DASHBOARD
```

# STOP CONDITION

After evidence/living-doc update and push: STOP. Do not start UI/Dashboard or any other task in this execution.
