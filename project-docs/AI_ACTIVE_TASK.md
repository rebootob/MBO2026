# AI ACTIVE TASK — R12E-B4 NORMALIZED EXISTING-RECORD WORKFLOW CLOSURE — AUTHORIZATION PENDING

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Target: App794 `MBO V2 Sandbox` ONLY
> Mode: PROJECT CLOSE MODE / FINAL CORE FUNCTIONAL UAT
> Kintone write/workflow authorization: **NONE — DO NOT EXECUTE BUSINESS ACTIONS YET**

# REVIEW RESULT / CURRENT CHECKPOINT

R12E-B3 read-only browser precheck is accepted as **PASS WITH START-STATE MISMATCH**.

Verified from live read-only browser evidence:
- browser authenticated Kintone user = `hr`;
- Record #10 exists and is synthetic/test-only;
- actual synthetic fixture key = `MBO_UAT_M1G1_001|2026`;
- current status = `03 Manager Objective Review`;
- `Routing_Topology = M1_G1`;
- `Requester_User = [hr]`;
- `Manager_User = [hr]`;
- `GM_User = [hr]`;
- `First_Manager_User = []`;
- R12E-B3 executed 0 Kintone writes, 0 record edits, 0 workflow clicks;
- `admin-form` remains TECHNICAL_ADMIN_ONLY / zero business authority.

The prior task assumption `Record_Key = MBO_UAT_M1G1_001` is superseded for this synthetic fixture by the live exact value `MBO_UAT_M1G1_001|2026`.

Important scope statement: this synthetic fixture key does not follow the normal runtime `buildRecordKey(fiscalYear, employeeCode)` format. Therefore this Workflow UAT may certify workflow behavior only and must not be cited as evidence for normal annual Record_Key generation.

# NORTH STAR / CLOSE TARGET

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Guard PASS -> Notification Safety PASS -> R12E-B4 Functional Workflow UAT -> CORE V1 FREEZE`

Do not reopen broad discovery. Do not create another UAT record.

# WHY START STATUS 03 IS SAFE TO NORMALIZE

The existing synthetic record is already at `03 Manager Objective Review`. The confirmed M1_G1 baseline contains the legitimate return path:

`03 Manager Objective Review -> 01 Draft Objective` via `Return Objective` to `Requester_User`.

Because this is the controlled synthetic record and Requester/Manager/GM all map to the approved UAT account `hr`, the next authorized execution may use exactly one initial controlled return action to normalize the fixture back to `01 Draft Objective`, then execute the previously reviewed compact matrix from its intended start.

No forced status, Change assignee, direct REST status mutation, or Process configuration change is allowed.

# FRESH AUTHORIZATION REQUIRED

Before any edit/delete/workflow click, obtain fresh explicit user authorization.

Suggested exact phrase:
`อนุมัติ controlled App794 R12E-B4 Normalize + Workflow Closure ด้วย Record #10 บัญชี hr`

Authorization is single-use and scoped only to this manifest.

# PREWRITE / PRECLICK SAFETY GATE

After authorization and immediately before the first workflow click:

1. Pull latest; local HEAD = origin authorized-task commit.
2. Read canonical baseline in mandatory order.
3. Confirm no `src/**`, `dist/**`, `tests/**` drift. No npm/build.
4. Confirm real browser user exactly `hr`.
5. Confirm Record #10 still has exact key `MBO_UAT_M1G1_001|2026`, is synthetic, and current status remains exactly `03 Manager Objective Review`.
6. Confirm routing snapshot remains `M1_G1`, Requester/Manager/GM=`hr`, First Manager empty.
7. Re-read live/preview App794 configuration because current app revision is reported as `38` after the prior reviewed Rev37 checkpoint:
   - live/preview aligned at `38/38` or a later fully explained/reconciled revision;
   - Process exactly 16 states / 28 actions;
   - Status15 exactly `ONE + USER: hr`;
   - no Process semantic drift affecting the approved M1_G1 matrix;
   - no unexpected notification configuration / real-recipient risk.
8. Verify there is no second synthetic record with the same exact key.

Any mismatch, unexplained relevant config drift, browser user != hr, duplicate fixture, or real-recipient risk => STOP BEFORE CLICK/WRITE.

# AUTHORIZED SCOPE — APP794 EXISTING RECORD #10 ONLY

After all gates PASS:

## A. One normalization transition

Execute through the real App794 browser UI as `hr`:

`03 Manager Objective Review -> 01 Draft Objective` using `Return Objective`.

Expected `NORMALIZATION_SUCCESSFUL_TRANSITIONS = 1`.

Immediately verify resulting status = `01 Draft Objective`.
If not, STOP and preserve record.

## B. Compact functional matrix from status 01

### Objective
1. At `01`: `Submit Objective to First Manager` attempt -> DENIED / status unchanged.
2. `01 -> 03` Submit Objective to Manager.
3. `03 -> 01` Return Objective.
4. `01 -> 03` resubmit.
5. `03 -> 04` Approve Objective.
6. `04 -> 05` Approve Objective.

### Mid-Year
7. `05 -> 06` Start Mid-Year.
8. Max 1 bounded Mid-Year preparation edit if required.
9. At `06`: `Submit Mid-Year to First Manager` attempt -> DENIED / status unchanged.
10. `06 -> 08` Submit Mid-Year to Manager.
11. `08 -> 06` Return Mid-Year Manager.
12. `06 -> 08` resubmit.
13. `08 -> 09` Approve Mid-Year Manager.
14. `09 -> 10` Approve Mid-Year GM.

### Final
15. `10 -> 11` Start Self Evaluation.
16. Max 1 bounded Final/Self preparation edit if required.
17. At `11`: `Submit Final to First Manager` attempt -> DENIED / status unchanged.
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
- verify the exact key count returns 0;
- update evidence/living docs, push same branch, STOP.

If any step fails:
- STOP immediately;
- do not force status;
- do not Change assignee;
- do not delete the failed synthetic record;
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

Until fresh explicit user authorization is recorded by ChatGPT: **NO EDIT / NO DELETE / NO BUSINESS WORKFLOW CLICK / NO KINTONE WRITE.**