# AI ACTIVE TASK — R12E-B2 CORE WORKFLOW UAT CONTINUATION — AUTHORIZATION PENDING

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Target: App794 `MBO V2 Sandbox` ONLY
> Mode: PROJECT CLOSE MODE / FUNCTIONAL WORKFLOW UAT CONTINUATION
> Kintone write/workflow authorization: **NONE YET — DO NOT EXECUTE**

# CURRENT REVIEWED CHECKPOINT

R12E-B Process remap is complete and MUST NOT be repeated.

- App794 live/preview = `37 / 37`
- Process = `16 states / 28 actions`
- Status15 = `ONE + USER: hr`
- non-target Process semantics = PASS
- synthetic record `MBO_UAT_M1G1_001` = NOT CREATED
- workflow transitions = 0
- First-Manager denials = 0
- `admin-form` business workflow actions = 0
- previous R12E-B authorization = CONSUMED / NOT REUSABLE

User-approved Sandbox model:
- `UAT_REQUESTER = hr`
- `UAT_MANAGER = hr`
- `UAT_GM = hr`
- `UAT_HR = hr`
- `admin-form = TECHNICAL_ADMIN_ONLY`
- `SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED`
- `REAL_USER_IMPACT = 0`

# NEW LOCAL BROWSER LOGIN METHOD

The user has updated local `.env.local` with the controlled `hr` test credentials.

`.gitignore` already ignores `.env.*`; `.env.local` must remain local-only.

Antigravity may use `.env.local` only to authenticate the Kintone browser session as `hr`.

Credential safety rules:
1. Never print, echo, log, screenshot, commit, push, summarize, or place any credential value in evidence/docs.
2. Do not copy `.env.local` to another tracked file.
3. Use the existing local environment variable names/loader. Do not rename or duplicate credential variables merely for this task.
4. It is permitted to inspect variable NAMES locally if required, but never output VALUES.
5. If username/password mapping is ambiguous or required credential is missing, STOP with `ENV_CREDENTIAL_MAPPING_UNRESOLVED`.
6. Login must occur through the real Kintone browser page, not REST-only authentication.
7. After browser login and before any record write/action, verify browser identity from Kintone runtime, e.g. `kintone.getLoginUser().code` (or equivalent trusted browser identity check) must equal exactly `hr`.
8. If browser identity != `hr`, STOP. Never fall back to `admin-form`.

# NORTH STAR / CLOSE TARGET

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Guard PASS -> Notification Safety PASS -> R12E-B2 Functional Workflow UAT -> CORE V1 FREEZE`

Do not reopen discovery. Do not run npm/build. Do not test all 28 permutations.

# CHANGE GOVERNANCE

## What
After fresh user authorization only: authenticate browser as `hr`, create one synthetic App794 UAT record, execute the compact functional workflow matrix, capture evidence, and delete the synthetic record after full PASS.

## Where
App794 Sandbox only. Local `.env.local` is used only for browser authentication and remains untracked.

## How
Pull/latest gate -> local credential safety check -> browser login -> verify current Kintone user `hr` -> minimal read-only drift/collision check -> create one UAT record -> bounded browser workflow matrix -> evidence -> cleanup -> STOP.

## Why
This is the only remaining Core functional workflow closure gate. Process remap and notification safety are already complete.

## Expected Impact
If PASS, Functional Workflow Core V1 can be frozen and the project can move immediately to UI/Dashboard closure.

## Risks
Wrong browser identity, credential leakage, live Process drift, UAT key collision, unexpected workflow failure, or real-recipient notification drift.

## Test Plan
Exactly the matrix below: 22 successful transitions + 3 First-Manager fail-closed attempts.

## Rollback / Failure Plan
No Process/config rollback is permitted or needed in R12E-B2. If any UAT step fails, STOP, preserve the exact synthetic record/evidence, do not force status, do not Change assignee, and do not delete the failed record until ChatGPT review.

# PRECONDITION BEFORE EXECUTION

Fresh explicit user authorization must be recorded in this file by ChatGPT before any Kintone write or workflow click.

Suggested exact phrase:
`อนุมัติ controlled App794 R12E-B2 Workflow UAT Continuation ด้วยบัญชี hr จาก .env.local`

After authorization:
1. Pull latest branch; local HEAD = origin authorized task commit.
2. Read canonical baseline in mandatory order.
3. Confirm no `src/**`, `dist/**`, `tests/**` drift.
4. Confirm `.env.local` is ignored/untracked; never display contents.
5. Login browser to Kintone using local controlled `hr` credentials.
6. Verify browser current user code exactly `hr`.
7. Minimal read-only preflight only:
   - live/preview Process aligned;
   - 16 states / 28 actions;
   - status15 `ONE + USER: hr`;
   - `MBO_UAT_M1G1_001` collision count = 0;
   - no unexpected real-recipient notification drift.
8. Any mismatch => STOP before write.

# ABSOLUTELY FORBIDDEN

- Process Management PUT/deploy/remap.
- restoring `admin-form` or empty `[]` to status15.
- App795/App53/App796/other-app writes.
- schema/ACL/customization/notification-setting changes.
- Change assignee.
- `admin-form` business workflow action.
- real Manager/GM/HR workflow test.
- REST-only status transitions claimed as browser/runtime proof.
- credential output/logging/commit.
- source/dist/tests changes or npm/build.
- extra synthetic records/actions.

# AUTHORIZED UAT SCOPE — ONLY AFTER FRESH AUTHORIZATION

App794 only:
1. Create exactly one synthetic record: `MBO_UAT_M1G1_001`.
2. Snapshot routing:
   - `Routing_Topology = M1_G1`
   - `First_Manager_User = []`
   - `Requester_User = [hr]`
   - `Manager_User = [hr]`
   - `GM_User = [hr]`
3. Minimal valid Objective data at create.
4. Max 2 preparation edits: Mid-Year + Final/Self.
5. Execute all Process actions through App794 browser UI authenticated as `hr`.
6. After full PASS only, delete exactly this UAT record and verify key count = 0.

# COMPACT BROWSER MATRIX

## Objective
- At `01`: attempt `Submit Objective to First Manager` -> DENIED / status unchanged.
- `01 -> 03` Submit Objective to Manager.
- `03 -> 01` Return Objective.
- `01 -> 03` resubmit.
- `03 -> 04` Approve Objective.
- `04 -> 05` Approve Objective.

## Mid-Year
- `05 -> 06` Start Mid-Year.
- bounded Mid-Year data edit if required.
- At `06`: attempt `Submit Mid-Year to First Manager` -> DENIED / status unchanged.
- `06 -> 08` Submit Mid-Year to Manager.
- `08 -> 06` Return Mid-Year Manager.
- `06 -> 08` resubmit.
- `08 -> 09` Approve Mid-Year Manager.
- `09 -> 10` Approve Mid-Year GM.

## Final
- `10 -> 11` Start Self Evaluation.
- bounded Final/Self data edit if required.
- At `11`: attempt `Submit Final to First Manager` -> DENIED / status unchanged.
- `11 -> 13` Submit Final to Manager.
- `13 -> 11` Return Final Manager.
- `11 -> 13` resubmit.
- `13 -> 14` Approve Final Manager.
- `14 -> 15` Approve Final GM.

## HR Final
- `15 -> 11` Return Final HR.
- `11 -> 13` resubmit.
- `13 -> 14` Approve Final Manager.
- `14 -> 15` Approve Final GM.
- `15 -> 16` Complete.

Expected successful transitions = `22`.
Expected First-Manager denials = `3`.

# PASS GATE

`FUNCTIONAL_WORKFLOW_UAT = PASS` requires:
- browser authenticated identity = `hr`;
- Process PUT = 0 / deploy = 0;
- 22/22 successful transitions;
- 3/3 First-Manager attempts denied with status unchanged;
- final status = `16 Completed`;
- browser fatal MBO errors = 0;
- real-user impact = 0;
- admin-form business actions = 0;
- synthetic record cleanup PASS.

Always report:
`SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED`

# REQUIRED EVIDENCE

```text
M10L_D_R12E_B2_WORKFLOW_UAT_CONTINUATION = COMPLETE / BLOCKED
AUTHORIZATION_SCOPE = APP794_R12E_B2_UAT_ONLY
AUTHORIZATION_CONSUMED = YES
ENV_LOCAL_USED_FOR_BROWSER_LOGIN = YES/NO
ENV_LOCAL_TRACKED_BY_GIT = NO
CREDENTIAL_VALUE_EXPOSED = NO
BROWSER_AUTHENTICATED_USER = hr / actual
UAT_ACCOUNT = hr
PRECHECK_LIVE_REVISION = actual
PRECHECK_PREVIEW_REVISION = actual
PRECHECK_PROCESS_STATE_COUNT = 16
PRECHECK_PROCESS_ACTION_COUNT = 28
PRECHECK_STATUS15_ASSIGNEE = USER: hr
PROCESS_PUT_COUNT = 0
DEPLOY_POST_COUNT = 0
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
ADMIN_FORM_BUSINESS_ACTION_COUNT = 0
SANDBOX_FUNCTIONAL_UAT_ROLE_ISOLATION_CLAIM = NOT_TESTED
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
NEXT_ACTION = CHATGPT REVIEW; IF PASS FREEZE CORE V1 AND MOVE TO UI/DASHBOARD CLOSURE
```

# STOP CONDITION

Until fresh explicit user authorization is recorded by ChatGPT: **DO NOT LOGIN AND EXECUTE THE UAT, DO NOT CREATE A RECORD, DO NOT CLICK ANY BUSINESS PROCESS ACTION, AND DO NOT WRITE KINTONE.**