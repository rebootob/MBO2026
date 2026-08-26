# AI ACTIVE TASK — R12E-B CORE WORKFLOW CLOSURE SPRINT — AUTHORIZED

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting control-plane HEAD: `06a873155ae505f561946668f46d88a0852638e4`
> Target: App794 `MBO V2 Sandbox` ONLY
> Mode: PROJECT CLOSE MODE / CONTROLLED FUNCTIONAL WORKFLOW UAT
> Fresh user authorization: **GRANTED ONCE** by exact instruction `อนุมัติ controlled App794 R12E-B Core Workflow Closure Sprint ด้วยบัญชี hr`
> Authorization scope: this R12E-B manifest only; rollback only where explicitly defined below.
> Authorization is SINGLE-USE and is consumed by this execution attempt. It does not authorize UI/Dashboard or later production writes.

# NORTH STAR / CLOSE TARGET

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Guard PASS -> Notification Safety PASS -> R12E-B Functional Workflow Closure -> CORE V1 FREEZE`

Project Close Mode: do not expand discovery or test all 28 permutations.

User-confirmed Sandbox UAT mapping:
- `UAT_REQUESTER = hr`
- `UAT_MANAGER = hr`
- `UAT_GM = hr`
- `UAT_HR = hr`
- `admin-form = TECHNICAL_ADMIN_ONLY`; **0 business workflow actions**.

This single-account UAT proves functional state flow only.
`SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED`
`REAL_USER_IMPACT = 0`

# AUTHORIZED CHANGES — APP794 ONLY

Authorized normal-path writes/actions:
1. Process remap: status `15 HR Final Check` assignee `USER admin-form -> USER hr`.
   - retain `assignee.type = ONE`;
   - exactly 16 states / 28 actions;
   - exactly 1 semantic Process diff;
   - Process PUT max 1 + Deploy POST max 1.
2. Create exactly 1 synthetic UAT record:
   - key `MBO_UAT_M1G1_001`;
   - `Routing_Topology = M1_G1`;
   - `First_Manager_User = []`;
   - `Requester_User = [hr]`;
   - `Manager_User = [hr]`;
   - `GM_User = [hr]`;
   - minimal valid synthetic Objective/Mid-Year/Final data only;
   - never edit/impersonate a business employee record.
3. Synthetic record preparation edits: max 2 (Mid-Year + Final/Self Evaluation).
4. Execute only the compact browser workflow matrix below while logged in as `hr`.
5. After full PASS only, delete exactly the synthetic UAT record (max 1) and verify key no longer exists.

Forbidden: App795/App53/App796/other-app writes, schema/ACL/customization/notification-setting changes, Change assignee, source/dist/tests changes, npm test/build, extra UAT records/actions, real-user workflow/notification tests, any `admin-form` business action.

# PREWRITE SAFETY GATE

Before first write:
1. Pull latest; local HEAD must equal origin authorized task commit.
2. Read canonical baseline in mandatory order.
3. Confirm no `src/**`, `dist/**`, `tests/**` drift.
4. GET App794 live/preview Process:
   - expected `36 / 36` unless exact reviewed evidence explains otherwise;
   - 16 states / 28 actions;
   - status15 exactly `ONE + USER: admin-form`;
   - all non-target Process semantics match baseline.
5. Exact current record count at `15 HR Final Check` must be `0`.
6. `MBO_UAT_M1G1_001` collision count must be `0`.
7. Reuse R12E-A notification audit (`SAFE_WITH_CONTROLLED_IDENTITIES`). Re-read only if drift exists.

Any mismatch/drift/real-recipient risk => **STOP BEFORE WRITE**.

# FRESH PROCESS BACKUP

Immediately before Process PUT create readable local-only backup under:
`backups/m10l-d-r12e-b-core-workflow-closure/<timestamp>/`

Must include raw live/preview Process config, revisions, 16/28 count, status15 block, status15 zero-record evidence, restorable prior payload, and integrity hash/manifest.
Do not push backup contents.

# STATUS15 REMAP

Only permitted Process semantic mutation:
`15 HR Final Check.assignee.entities: USER admin-form -> USER hr`

Require semantic diff = 1.
Deploy and read back:
- live/preview aligned;
- 16/28 unchanged;
- status15 `ONE + USER: hr`;
- all non-target semantics unchanged;
- status15 record count still 0.

If failure after Process write: rollback only from fresh R12E-B prewrite backup, deploy/read-back, then STOP.

# COMPACT FUNCTIONAL UAT MATRIX — BROWSER UI AS `hr`

Process actions intended to prove deployed runtime guards MUST use App794 browser UI so `app.record.detail.process.proceed` executes. If session is not `hr`, pause for user-assisted login; never substitute `admin-form`.

## Objective
1. At `01`: attempt `Submit Objective to First Manager` -> expected DENIED / status unchanged.
2. `01 -> 03` Submit Objective to Manager.
3. `03 -> 01` Return Objective.
4. `01 -> 03` resubmit.
5. `03 -> 04` Approve Objective.
6. `04 -> 05` Approve Objective.

## Mid-Year
7. `05 -> 06` Start Mid-Year.
8. Prepare valid Mid-Year data if required (bounded edit 1).
9. At `06`: attempt `Submit Mid-Year to First Manager` -> expected DENIED / status unchanged.
10. `06 -> 08` Submit Mid-Year to Manager.
11. `08 -> 06` Return Mid-Year Manager.
12. `06 -> 08` resubmit.
13. `08 -> 09` Approve Mid-Year Manager.
14. `09 -> 10` Approve Mid-Year GM.

## Final
15. `10 -> 11` Start Self Evaluation.
16. Prepare valid Final/Self data if required (bounded edit 2).
17. At `11`: attempt `Submit Final to First Manager` -> expected DENIED / status unchanged.
18. `11 -> 13` Submit Final to Manager.
19. `13 -> 11` Return Final Manager.
20. `11 -> 13` resubmit.
21. `13 -> 14` Approve Final Manager.
22. `14 -> 15` Approve Final GM.

## HR Final representative return + finish
23. `15 -> 11` Return Final HR.
24. `11 -> 13` resubmit.
25. `13 -> 14` Approve Final Manager.
26. `14 -> 15` Approve Final GM.
27. `15 -> 16` Complete.

Expected **successful transitions = 22**.
Expected **First-Manager denied attempts = 3**.
Do not add GM-return or other redundant permutations.
No status15 non-assignee denial test is claimed because only controlled business-workflow account is `hr`.

# FAILURE / CLEANUP RULE

If any workflow step unexpectedly fails:
- STOP;
- do not force status;
- do not Change assignee;
- preserve exact synthetic record and evidence for ChatGPT review;
- do not delete failed record during this execution.

If and only if all matrix checks PASS:
- capture record ID/key, full status/action trace, 3 denied attempts, final `16 Completed`, status15 assignee `hr`, browser fatal MBO error count, `REAL_USER_IMPACT=0`, `ADMIN_FORM_BUSINESS_ACTION_COUNT=0`;
- delete exactly the UAT record identified by both ID and key;
- verify key count returns 0.

Successful closure leaves Sandbox status15 assigned to `hr` for future controlled regression; do not restore `admin-form` or empty `[]`.

# PASS GATE

`FUNCTIONAL_WORKFLOW_UAT = PASS` only when:
- Process remap/read-back PASS;
- 22/22 successful transitions;
- 3/3 First-Manager attempts denied with unchanged status;
- final status = `16 Completed`;
- browser fatal MBO errors = 0;
- real-user workflow/notification impact = 0;
- admin-form business actions = 0;
- synthetic record cleanup verified.

Always report separately:
`SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED`

# REQUIRED EVIDENCE

```text
M10L_D_R12E_B_CORE_WORKFLOW_CLOSURE = COMPLETE / BLOCKED / ROLLED_BACK
AUTHORIZATION_SCOPE = APP794_R12E_B_CLOSURE_ONLY
AUTHORIZATION_CONSUMED = YES
UAT_ACCOUNT = hr
ADMIN_FORM_BUSINESS_ACTION_COUNT = 0
PREWRITE_LIVE_REVISION = actual
PREWRITE_PREVIEW_REVISION = actual
PREWRITE_PROCESS_STATE_COUNT = actual
PREWRITE_PROCESS_ACTION_COUNT = actual
PREWRITE_STATUS15_ASSIGNEE = actual
PREWRITE_STATUS15_RECORD_COUNT = actual
PREWRITE_BACKUP_PATH = actual
PREWRITE_BACKUP_READABLE = PASS/FAIL
PROCESS_SEMANTIC_DIFF_COUNT = actual
PROCESS_PUT_COUNT = actual
DEPLOY_POST_COUNT = actual
POSTDEPLOY_LIVE_REVISION = actual
POSTDEPLOY_PREVIEW_REVISION = actual
POSTDEPLOY_STATUS15_ASSIGNEE = actual
POSTDEPLOY_NON_TARGET_PROCESS_SEMANTICS = PASS/FAIL
UAT_RECORD_KEY = MBO_UAT_M1G1_001
UAT_RECORD_ID = actual / NOT_CREATED
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
FUNCTIONAL_WORKFLOW_UAT = PASS/FAIL/NOT_COMPLETED
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

After evidence/living-doc update, push same branch and STOP. Do not begin UI/Dashboard in this execution.