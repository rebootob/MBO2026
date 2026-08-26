# AI ACTIVE TASK — R12E-B CORE WORKFLOW CLOSURE SPRINT — AUTHORIZATION READY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting reviewed result: `51826bb8fc240e43183f44ef4893cc0c9fa25fc9`
> Control-plane baseline commit: `40e311a5fd8d3d7efbc481bb680f7c613fcb05ce`
> Target App: App794 `MBO V2 Sandbox`
> Mode: PROJECT CLOSE MODE / CONTROLLED FUNCTIONAL WORKFLOW UAT
> Kintone write authorization: **NONE YET — DO NOT EXECUTE**

# USER-CONFIRMED UAT DECISION

The user explicitly confirmed that Kintone account `hr` may be used as the controlled Workflow test account in **App794 Sandbox**.

For this closure sprint only:

- `UAT_REQUESTER = hr`
- `UAT_MANAGER = hr`
- `UAT_GM = hr`
- `UAT_HR = hr`
- `admin-form = TECHNICAL_ADMIN_ONLY`
- `admin-form` must not submit, approve, return, complete, or perform negative business workflow attempts.

This single-account model is accepted to close **functional workflow behavior only**. It does not prove production role isolation.

`SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED`

`REAL_USER_IMPACT = 0`

# NORTH STAR / PROJECT CLOSE MODE

Current closure path:

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Guard PASS -> Notification Safety PASS -> R12E-B Functional Workflow Closure -> CORE V1 FREEZE`

R12E-B is intentionally compact. Do not expand into exhaustive testing of all 28 action permutations.

Required certification target:

1. Current active `M1_G1` happy path reaches `16 Completed`.
2. Representative return/resubmit works once for Objective, Mid-Year, Final, and HR Final.
3. M1_G1 First-Manager submit attempts fail closed at Objective, Mid-Year, and Final employee stages.
4. No real user receives workflow or notification.
5. Synthetic UAT record is removed after successful evidence capture.
6. Production role-isolation remains a separate structural go-live gate; no real-user workflow test is required.

# AUTHORIZATION STATUS

The user's confirmation that `hr` may be used for testing is **not** authorization for Kintone writes.

Do not execute this task until ChatGPT updates this file after a fresh explicit user authorization for the exact R12E-B scope.

Suggested exact authorization phrase:

`อนุมัติ controlled App794 R12E-B Core Workflow Closure Sprint ด้วยบัญชี hr`

# CHANGE GOVERNANCE

## What
One controlled closure sprint that:

1. remaps App794 Sandbox status15 from temporary technical lock `admin-form` to controlled test account `hr`;
2. creates exactly one synthetic App794 UAT record;
3. prepares minimal Objective / Mid-Year / Final test data;
4. executes the bounded functional workflow matrix below using account `hr`;
5. captures evidence;
6. deletes exactly the synthetic UAT record after successful completion.

## Where
App794 Sandbox only.

No App795/App53/App796/other-app writes.

## How
Preflight -> fresh Process backup -> one-semantic Process remap -> deploy/read-back -> create one synthetic record -> bounded browser workflow matrix -> evidence -> delete exact synthetic record -> STOP.

## Why
R12E-A already completed discovery, notification audit, schema feasibility, collision check, and workflow matrix design. Further discovery would not materially improve closure confidence.

## Expected Impact
Functional workflow Core V1 can be closed without involving real employee/Manager/GM/HR users and without using `admin-form` as a business actor.

## Risks
- live/preview drift since R12E-A;
- status15 record already present before remap;
- wrong Process assignee payload;
- synthetic record accidentally matching business data;
- unexpected notification recipient;
- browser/runtime action failure;
- cleanup deleting a non-UAT record.

## Test Plan
Bounded matrix in section E only.

## Rollback Plan
- If failure occurs before first write: STOP, no rollback.
- If Process remap writes but read-back is wrong: restore only the fresh R12E-B pre-write Process backup and deploy; verify restoration; STOP.
- If workflow UAT fails after synthetic record creation: do not force status or use Change assignee. Preserve exact record/evidence and STOP for ChatGPT review. Do not delete the failed record until review unless cleanup is independently proven safe and explicitly authorized.
- Successful closure leaves Sandbox status15 assigned to `hr` for controlled regression use; do not restore `admin-form` and never restore empty `[]`.

# A. STARTUP / PREWRITE GATES

After authorization only:

1. Pull latest `ai/antigravity-wp002c`; local HEAD must equal origin HEAD and the authorized task commit.
2. Read canonical baseline in mandatory order.
3. Confirm no `src/**`, `dist/**`, or `tests/**` drift. Do not run npm test/build.
4. GET App794 live/preview Process Management and confirm:
   - live/preview aligned;
   - expected prewrite revision `36 / 36` unless ChatGPT has explicitly reconciled a later revision;
   - exactly 16 states / 28 actions;
   - status15 exactly `ONE + USER: admin-form` before remap;
   - all other Process semantics match R12E-A/R12D-D baseline.
5. Query exact current count at `15 HR Final Check`; required `0`. If not zero or unresolved, STOP.
6. Re-confirm synthetic key `MBO_UAT_M1G1_001` has no collision. If collision exists, STOP; do not invent another key during execution.
7. Reuse R12E-A notification audit. Only re-read notification settings if live config drift is detected. Any real-recipient risk => STOP.

# B. FRESH PROCESS BACKUP

Immediately before Process write:

Create readable local-only backup under:

`backups/m10l-d-r12e-b-core-workflow-closure/<timestamp>/`

Include raw live/preview Process configuration, revisions, 16/28 count, status15 block, zero-status15-record evidence, restorable prior payload, and integrity manifest/hash.

Do not push backup files to GitHub.

# C. CONTROLLED STATUS15 REMAP

Permitted Process semantic mutation only:

`15 HR Final Check.assignee.entities: USER admin-form -> USER hr`

Retain:
- `assignee.type = ONE`;
- 16 states / 28 actions;
- all action names/from/to/filter conditions;
- all other assignee semantics.

Required semantic diff count: exactly `1`.

Normal path writes:
- App794 Process PUT = max 1
- App794 deploy POST = max 1

After deploy:
- live/preview aligned;
- status15 exactly `ONE + USER: hr`;
- all non-target semantics unchanged;
- status15 record count remains 0.

If any mismatch, execute Process rollback from the fresh backup and STOP.

# D. SYNTHETIC UAT RECORD

Use exactly one unmistakable non-business record:

`UAT_RECORD_KEY = MBO_UAT_M1G1_001`

Role snapshots:
- `Routing_Topology = M1_G1`
- `First_Manager_User = []`
- `Requester_User = [hr]`
- `Manager_User = [hr]`
- `GM_User = [hr]`
- status15 native assignee = `hr`

Use minimal valid synthetic values already proven feasible by R12E-A. Never impersonate or modify a real employee. A single narrow schema GET is allowed only if needed to reconstruct the already-proven field manifest; do not reopen broad discovery.

Authorized record preparation limits for the future authorized execution:
- synthetic record create = max 1
- bounded data-preparation edits = max 2 (Mid-Year data, Final/Self-Evaluation data)
- no business record edits

# E. COMPACT FUNCTIONAL WORKFLOW MATRIX

All business Process actions are executed through App794 browser UI while authenticated as `hr`, so deployed client workflow guards execute. If browser session is not `hr`, pause for user-assisted login; never substitute `admin-form`.

## Objective

At `01 Draft Objective`:
- negative attempt: `Submit Objective to First Manager` => must be blocked; status unchanged.
- `Submit Objective to Manager` => `03`.
- representative return: `03 -> 01 Return Objective`.
- resubmit `01 -> 03`.
- `03 -> 04 Approve Objective`.
- `04 -> 05 Approve Objective`.

## Mid-Year

- `05 -> 06 Start Mid-Year`.
- prepare valid Mid-Year data if needed.
- at `06`: negative attempt `Submit Mid-Year to First Manager` => blocked; status unchanged.
- `06 -> 08 Submit Mid-Year to Manager`.
- representative return: `08 -> 06 Return Mid-Year Manager`.
- resubmit `06 -> 08`.
- `08 -> 09 Approve Mid-Year Manager`.
- `09 -> 10 Approve Mid-Year GM`.

## Final

- `10 -> 11 Start Self Evaluation`.
- prepare valid Final/Self-Evaluation data if needed.
- at `11`: negative attempt `Submit Final to First Manager` => blocked; status unchanged.
- `11 -> 13 Submit Final to Manager`.
- representative return: `13 -> 11 Return Final Manager`.
- resubmit `11 -> 13`.
- `13 -> 14 Approve Final Manager`.
- `14 -> 15 Approve Final GM`.

## HR Final representative return + completion

- `15 -> 11 Return Final HR`.
- resubmit `11 -> 13`.
- `13 -> 14 Approve Final Manager`.
- `14 -> 15 Approve Final GM`.
- `15 -> 16 Complete`.

Expected successful transitions: **22**.
Expected negative First-Manager attempts: **3**.

Do not add GM-return permutations or other redundant branches in Project Close Mode.

No status15 non-assignee denial test is authorized or claimed because `hr` is the only controlled business-workflow test identity. Production role isolation remains `NOT_TESTED_BY_SANDBOX_LOGIN` and must be structurally verified before go-live.

# F. EVIDENCE / CLEANUP

Before cleanup capture:
- exact synthetic record ID/key;
- starting/final status;
- successful transition trace;
- 3 denied First-Manager attempts with unchanged status;
- status15 assignee `hr`;
- browser fatal MBO error count;
- confirmation no real-user notification was generated;
- confirmation `admin-form` executed zero business workflow actions.

If and only if the full closure matrix passes, delete exactly the synthetic UAT record identified by both ID and key.

Authorized successful-path cleanup delete = max 1.

After delete verify the key no longer exists.

# G. PASS / BLOCK RULE

`FUNCTIONAL_WORKFLOW_UAT = PASS` only if:
- Process remap verified;
- all 22 expected successful transitions pass;
- all 3 First-Manager negative attempts are blocked with unchanged status;
- final status reaches `16 Completed`;
- 0 real-user impact;
- 0 admin-form business actions;
- synthetic record cleanup verified.

Always report separately:

`SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED`

Do not convert that limitation into PASS.

Any unexpected runtime failure, notification risk, live drift, wrong assignee, or non-UAT record ambiguity => STOP.

# H. HARD BOUNDARIES

Forbidden:
- any write before fresh explicit authorization is recorded in this task;
- `admin-form` business workflow actions;
- real Manager/GM/HR workflow testing;
- App795/App53/App796/other-app writes;
- schema/ACL/customization changes;
- notification settings changes;
- Change assignee;
- source/dist/test changes;
- npm tests/build;
- extra synthetic records;
- extra workflow permutations beyond section E;
- deleting any record other than the exact synthetic UAT record after full PASS.

# REQUIRED EVIDENCE AFTER AUTHORIZED EXECUTION

```text
M10L_D_R12E_B_CORE_WORKFLOW_CLOSURE = COMPLETE / BLOCKED / ROLLED_BACK
AUTHORIZATION_SCOPE = APP794_R12E_B_CLOSURE_ONLY
AUTHORIZATION_CONSUMED = YES
UAT_ACCOUNT = hr
ADMIN_FORM_BUSINESS_ACTION_COUNT = 0
PREWRITE_LIVE_REVISION = actual
PREWRITE_PREVIEW_REVISION = actual
PREWRITE_PROCESS_STATE_COUNT = 16
PREWRITE_PROCESS_ACTION_COUNT = 28
PREWRITE_STATUS15_ASSIGNEE = USER: admin-form
PREWRITE_STATUS15_RECORD_COUNT = 0
PREWRITE_BACKUP_PATH = actual
PREWRITE_BACKUP_READABLE = PASS/FAIL
PROCESS_SEMANTIC_DIFF_COUNT = 1
PROCESS_PUT_COUNT = actual
DEPLOY_POST_COUNT = actual
POSTDEPLOY_LIVE_REVISION = actual
POSTDEPLOY_PREVIEW_REVISION = actual
POSTDEPLOY_STATUS15_ASSIGNEE = USER: hr
POSTDEPLOY_NON_TARGET_PROCESS_SEMANTICS = PASS/FAIL
UAT_RECORD_KEY = MBO_UAT_M1G1_001
UAT_RECORD_ID = actual
UAT_RECORD_CREATE_COUNT = actual
UAT_RECORD_EDIT_COUNT = actual
EXPECTED_SUCCESSFUL_TRANSITIONS = 22
ACTUAL_SUCCESSFUL_TRANSITIONS = actual
EXPECTED_FIRST_MANAGER_DENIALS = 3
ACTUAL_FIRST_MANAGER_DENIALS = actual
FINAL_STATUS = actual
BROWSER_FATAL_MBO_ERROR_COUNT = actual
REAL_USER_NOTIFICATION_TRIGGERED = 0
REAL_USER_WORKFLOW_IMPACT = 0
SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED
FUNCTIONAL_WORKFLOW_UAT = PASS/FAIL
UAT_RECORD_DELETE_COUNT = actual
UAT_RECORD_CLEANUP_VERIFIED = PASS/FAIL/NOT_EXECUTED
ROLLBACK_EXECUTED = NO/YES
APP795_WRITE = 0
APP53_WRITE = 0
APP796_WRITE = 0
OTHER_APP_WRITE = 0
SRC_CHANGE_COUNT = 0
DIST_CHANGE_COUNT = 0
TEST_CHANGE_COUNT = 0
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW; IF PASS FREEZE CORE V1 AND MOVE TO UI/DASHBOARD CLOSURE
```

# STOP CONDITION

Until fresh user authorization is recorded: **DO NOT RUN ANTIGRAVITY EXECUTION**.

After an authorized execution and evidence push: STOP. Do not begin UI/Dashboard work in the same round.