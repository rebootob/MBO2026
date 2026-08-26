# AI ACTIVE TASK — R12D-D CONTROLLED APP794 HR FINAL CHECK NATIVE PROCESS REPAIR

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting reviewed result: `cb0b5a2001e69b842c51aa8aed8515955bb94f97`
> Target App: App794 `MBO V2 Sandbox`
> Mode: CONTROLLED NATIVE KINTONE PROCESS REPAIR
> Fresh user authorization: **GRANTED ONCE** by exact user instruction `อนุมัติ controlled App794 R12D-D HR Final Check native Process repair`
> Authorization scope: App794 Process Management repair defined below only; rollback writes only if required by this same controlled repair
> Authorization is SINGLE-USE and is consumed by this execution attempt. It does not authorize R12E UAT or any later write.

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

Current critical path:

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Runtime Guard PASS -> Deploy PASS -> Runtime Evidence PASS -> HR Repair Design PASS -> Native HR Process Repair AUTHORIZED -> Isolated Workflow UAT BLOCKED UNTIL REVIEW`

R12D-A confirmed:

`DEFECT_CONFIRMED_NO_HR_AUTHORIZATION_LAYER`

R12D-B selected the smallest production-correct architecture:

- primary authorization boundary = native Kintone Process assignee;
- App794 Sandbox controlled HR-stage identity = `USER: admin-form`;
- production HR group evidence = `GROUP: Manager HR_x52y75`, but **DO NOT place this production HR group into App794 Sandbox in this task**;
- no schema change required;
- no App/Record/Field ACL change required;
- no JavaScript defense-in-depth change in this round;
- future UAT must keep `REAL_USER_IMPACT = 0`.

Control Plane review further decided to skip R12D-C JavaScript hardening for now. Native Kintone is the security boundary. Do not modify source/customization.

# AUTHORIZED REPAIR — EXACT TARGET

Current expected live status-15 configuration before repair:

- status: `15 HR Final Check`
- assignee type: `ONE`
- assignee entities: empty `[]`
- `Complete -> 16 Completed`
- `Return Final HR -> 11 Employee Self Evaluation`
- action filters unchanged / none

Authorized target configuration in **App794 Sandbox only**:

- status: `15 HR Final Check`
- retain assignee type exactly `ONE`
- set assignee candidate entity to exactly the existing controlled Kintone user `admin-form` using the exact native USER entity shape required by the current Kintone Process API
- no production HR group in Sandbox payload
- no change to any status name, action name, target status, action filter, other assignee configuration, or other Process semantics

The target means the previous actor may be required by Kintone to select the one eligible controlled user `admin-form` as status-15 assignee. This is acceptable for Sandbox UAT. Do not change `ONE` to another assignment rule.

# CHANGE GOVERNANCE

## What
Repair only the missing native authorization boundary at `15 HR Final Check` by configuring controlled Sandbox assignee `admin-form`.

## Where
App794 Process Management only.

Do not modify:
- App794 records;
- schema/form fields;
- App/Record/Field ACL;
- JavaScript/CSS customization;
- App795 / App53 / App796 / any other app;
- users/groups/organizations/membership;
- source/dist/tests.

## How
Perform exact pre-write gates, fresh backup, one Process Management update, one app deploy, and post-deploy read-back. Roll back only from the fresh pre-write backup if a post-write gate fails.

## Why
Status `15 HR Final Check` currently has no HR-only/native assignee boundary, which is a confirmed security/workflow blocker for Functional UAT.

## Expected Impact
Future records entering status 15 in App794 Sandbox will be assigned through native Kintone to controlled identity `admin-form`, enabling positive/negative isolated UAT without involving real HR users.

No existing record state may be changed by this task.

## Risks
- Process configuration drift before write;
- changing any of the other 15 states / 28 actions accidentally;
- existing record already at status 15 retaining old/unassigned semantics;
- accidentally assigning real HR group/person in Sandbox;
- accidental workflow action or notification;
- incomplete rollback evidence.

# A. GIT / BASELINE STARTUP GATE

1. Pull latest `ai/antigravity-wp002c`.
2. Local HEAD must equal origin HEAD and must be this task commit.
3. Read canonical baseline in required order.
4. Confirm:
   - App795 active routes = 17 and current topology = `M1_G1` for all;
   - App794 Process baseline = 16 states / 28 actions;
   - canonical HR Final Check blocker remains unresolved before this repair;
   - App794 is SANDBOX / non-production.
5. Confirm there is no `src/**`, `dist/**`, `tests/**` drift after deployed candidate `a980f064817cb3243fa57fce0c7c84619019311e`.
6. Do not run npm test/build.

# B. FRESH PRE-WRITE LIVE DRIFT GATE — READ ONLY

Immediately before any write:

1. GET current App794 live Process Management.
2. GET current App794 preview Process Management/config revision as required to establish no pending config drift.
3. Confirm live/preview revision state is stable and no unexpected pending configuration exists.
4. Expected prior known live revision from R12C-R1 is `35`. If current live or preview revision differs from the expected safe baseline, or live/preview are not aligned, classify `LIVE_DRIFT = YES` and **STOP BEFORE WRITE**. Do not normalize or guess.
5. Confirm exact Process semantics:
   - states = 16;
   - actions = 28;
   - status `15 HR Final Check` exists exactly once;
   - status 15 `assignee.type = ONE`;
   - status 15 assignee entities are still empty `[]`;
   - `Complete -> 16 Completed` unchanged and filter unchanged;
   - `Return Final HR -> 11 Employee Self Evaluation` unchanged and filter unchanged;
   - all other states/actions/assignees semantically match the current canonical/live snapshot.
6. Re-confirm authenticated executor/current Kintone user code is exactly `admin-form` and is usable as the controlled Sandbox target. If not exact, STOP.
7. Do not re-query the production HR group unless an unexpected target ambiguity appears. It is not used in this Sandbox repair.

Any mismatch before write = STOP. Do not repair a moving target.

# C. EXISTING STATUS-15 RECORD SAFETY GATE — MANDATORY

Before any Process write, run the narrowest exact read-only App794 record count/query for current Process status:

`15 HR Final Check`

Required result:

`EXISTING_RECORD_COUNT_AT_STATUS_15 = 0`

If count is greater than zero, cannot be determined conclusively, or the query fails:

**STOP BEFORE WRITE.**

Reason: changing Process settings does not retroactively repair assignee state of records already residing at status 15. Do not transition, reassign, edit, or delete those records in this task.

# D. FRESH PRE-WRITE BACKUP — MANDATORY

Only after all read-only gates PASS and immediately before the authorized Process PUT:

Create a durable local-only backup under a path similar to:

`backups/m10l-d-r12d-d-app794-hr-process-repair/<timestamp>/`

Backup must include enough exact data to restore the previous App794 Process configuration, at minimum:

- live Process Management raw response;
- preview Process Management/config raw response as applicable;
- live/preview revision values;
- exact status/action counts;
- exact pre-write status-15 assignee block;
- status-15 record count result;
- SHA-256 / manifest proving backup readability and integrity;
- a restorable prior Process payload or deterministic derivation from the raw backup.

Backup must be readable before first write.

Do not push backup contents to GitHub.

# E. TARGET PAYLOAD CONSTRUCTION — MUTATE ONE SEMANTIC ONLY

Construct the candidate from the fresh pre-write Process payload.

Permitted semantic mutation:

`15 HR Final Check.assignee.entities: [] -> [exact native USER entity for code admin-form]`

Retain:
- `assignee.type = ONE`;
- all 16 statuses;
- all 28 actions;
- every status name/index;
- every action name/from/to/filter condition;
- all Manager/GM/Requester/First-Manager behavior;
- every other assignee entity/expression;
- enable/disable state and any unrelated Process setting.

Explicit negative assertions on candidate:
- production HR group `Manager HR_x52y75` must NOT appear in the App794 Sandbox target payload;
- no new status/action;
- no removed status/action;
- no filter change;
- no ACL/schema/customization payload.

Produce a semantic diff before write and require:

`PROCESS_SEMANTIC_DIFF_COUNT = 1`

where the one semantic difference is the status-15 assignee entity change above.

If candidate differs anywhere else: STOP BEFORE WRITE.

# F. AUTHORIZED KINTONE WRITES

If and only if all gates A-E PASS:

1. Submit exactly one App794 Process Management preview/update PUT using the official Kintone Process Management update API.
2. Verify the update response/revision.
3. Submit exactly one App794 deploy/apply POST to publish the pending Process change.
4. Wait/check until deployment status is SUCCESS using GET only.

Normal-path authorized writes:

- `APP794_PROCESS_PUT = 1`
- `APP794_DEPLOY_POST = 1`
- all other writes = 0

No record status update API is authorized.

# G. POST-DEPLOY READ-BACK — MANDATORY

After deploy succeeds, GET live Process Management and verify:

1. states = 16;
2. actions = 28;
3. `15 HR Final Check.assignee.type = ONE`;
4. status-15 assignee entities contain exactly the controlled Sandbox USER `admin-form` in the expected native response shape;
5. `Manager HR_x52y75` is absent from Sandbox status-15 assignee entities;
6. `Complete -> 16 Completed` unchanged;
7. `Return Final HR -> 11 Employee Self Evaluation` unchanged;
8. every non-target Process semantic equals the fresh pre-write backup;
9. no pending preview drift remains after deployment;
10. existing status-15 record count remains 0;
11. no App794 record was created/edited/deleted or transitioned;
12. no workflow notification/action was triggered.

Post-deploy semantic comparison must report exactly the intended single pre-vs-post difference.

Do not perform browser workflow action testing in this round. R12E owns positive/negative action behavior testing.

# H. ROLLBACK PLAN — AUTHORIZED ONLY IF FAILURE AFTER FIRST WRITE

The user's authorization includes rollback writes strictly to restore the fresh pre-write Process configuration if this repair write/deploy does not verify correctly.

Trigger rollback if, after first Process write:
- deploy fails;
- post-deploy read-back does not exactly match target;
- any non-target Process semantic changed;
- status/action count changed;
- wrong assignee entity appears;
- unexpected pending preview drift cannot be safely cleared by restoring backup.

Rollback procedure:
1. use only the fresh R12D-D pre-write backup;
2. PUT the exact prior Process configuration back to preview;
3. deploy App794;
4. GET/read-back and prove prior Process semantics restored;
5. STOP and report `ROLLBACK_EXECUTED = YES`.

Do not use older R12C/R11 backups as rollback source for this Process repair.

If failure occurs before first write, no rollback is necessary; simply STOP.

# I. HARD SAFETY BOUNDARY

Forbidden:
- App794 record create/edit/delete;
- any Process status transition (`Submit`, `Approve`, `Return`, `Start`, `Complete`);
- Change assignee on any record;
- notification-generating workflow action;
- App794 schema/form write;
- App/Record/Field ACL write;
- JavaScript/CSS upload or customization PUT;
- user/group/org creation or membership change;
- use of production HR group/person as Sandbox assignee;
- App795/App53/App796/other app write;
- source/dist/test change;
- npm test/build;
- broad user/group discovery;
- unrelated cleanup.

Allowed:
- narrow GETs required by safety/read-back;
- exact App794 Process PUT and deploy POST described above;
- rollback Process PUT/deploy only if triggered;
- local backup creation;
- evidence/living-doc Git updates after execution.

# J. CREDIT-SAVING RULE

- Reuse R12D-A/B evidence; do not redo broad ACL or identity discovery.
- No App795 re-query unless an unexpected direct dependency appears.
- No npm tests/build/browser smoke.
- No source inspection beyond drift verification.
- Minimize Kintone GETs while still satisfying safety gates.
- No new evidence file; append concise result to `project-docs/AI_REVIEW_PACKAGE.md` and minimally update living docs.
- Push same branch and STOP.

# REQUIRED EVIDENCE

```text
M10L_D_R12D_D_NATIVE_HR_PROCESS_REPAIR = COMPLETE / BLOCKED / ROLLED_BACK
STARTING_HEAD = cb0b5a2001e69b842c51aa8aed8515955bb94f97
AUTHORIZATION_SCOPE = APP794_PROCESS_REPAIR_ONLY
AUTHORIZATION_CONSUMED = YES
PREWRITE_LIVE_REVISION = actual
PREWRITE_PREVIEW_REVISION = actual
PREWRITE_LIVE_PREVIEW_DRIFT = NO/YES
PREWRITE_PROCESS_STATE_COUNT = actual
PREWRITE_PROCESS_ACTION_COUNT = actual
PREWRITE_HR_STATUS_ASSIGNEE_TYPE = actual
PREWRITE_HR_STATUS_ASSIGNEE_ENTITIES = actual
CONTROLLED_SANDBOX_HR_USER = actual
PRODUCTION_HR_GROUP_PRESENT_IN_TARGET = NO/YES
EXISTING_RECORD_COUNT_AT_STATUS_15 = actual
PREWRITE_BACKUP_PATH = actual
PREWRITE_BACKUP_READABLE = PASS/FAIL
PREWRITE_BACKUP_SHA256 = actual
PROCESS_SEMANTIC_DIFF_COUNT_BEFORE_WRITE = actual
PROCESS_TARGET_ONLY_HR_ASSIGNEE_DIFF = PASS/FAIL
APP794_PROCESS_PUT_COUNT = actual
APP794_DEPLOY_POST_COUNT = actual
POSTDEPLOY_LIVE_REVISION = actual / NOT_APPLICABLE
POSTDEPLOY_PREVIEW_REVISION = actual / NOT_APPLICABLE
POSTDEPLOY_PROCESS_STATE_COUNT = actual / NOT_APPLICABLE
POSTDEPLOY_PROCESS_ACTION_COUNT = actual / NOT_APPLICABLE
POSTDEPLOY_HR_STATUS_ASSIGNEE_TYPE = actual / NOT_APPLICABLE
POSTDEPLOY_HR_STATUS_ASSIGNEE_ENTITIES = actual / NOT_APPLICABLE
POSTDEPLOY_NON_TARGET_PROCESS_SEMANTICS = PASS/FAIL/NOT_APPLICABLE
POSTDEPLOY_EXISTING_STATUS15_RECORD_COUNT = actual / NOT_APPLICABLE
WORKFLOW_ACTION_EXECUTED = 0
WORKFLOW_NOTIFICATION_TRIGGERED = 0
APP794_RECORD_WRITE = 0
APP794_SCHEMA_WRITE = 0
APP794_ACL_WRITE = 0
APP794_CUSTOMIZE_WRITE = 0
APP795_WRITE = 0
APP53_WRITE = 0
APP796_WRITE = 0
OTHER_APP_WRITE = 0
ROLLBACK_EXECUTED = NO/YES
ROLLBACK_VERIFIED = NOT_REQUIRED/PASS/FAIL
SRC_CHANGE_COUNT = 0
DIST_CHANGE_COUNT = 0
TEST_CHANGE_COUNT = 0
CONFIRMED_BASELINE_CONFLICT_COUNT = 0
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW BEFORE ANY R12E WORKFLOW UAT WRITE
```

# STOP CONDITION

After pushing evidence on the same branch, STOP.

Do not start R12E. Do not perform any record workflow action. A new explicit user authorization will be required for R12E record/process-status writes after ChatGPT independently reviews R12D-D.
