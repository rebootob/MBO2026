# AI ACTIVE TASK — R12E-A READ-ONLY ISOLATED WORKFLOW UAT LOCKDOWN — ROLE-CORRECTED

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting control-plane HEAD before this correction: `704d59f8f5d906b0c4db297cd2a1ccc50546e50e`
> Target App: App794 `MBO V2 Sandbox`
> Mode: READ-ONLY / ZERO KINTONE WRITES / ZERO WORKFLOW ACTIONS
> Kintone write authorization: NONE

# NEW USER-CONFIRMED BUSINESS RULE — HIGHEST PRIORITY

The user explicitly clarified:

`admin-form` is NOT part of the normal MBO workflow.

`admin-form` exists only as a technical administrator identity for inspection, debugging, controlled repair, troubleshooting, and verification. It has **no business authority to approve, return, complete, or otherwise act on behalf of Requester / Manager / GM / HR in workflow UAT or production workflow**.

Therefore, effective immediately:

- `ADMIN_FORM_ROLE = TECHNICAL_ADMIN_ONLY`
- `ADMIN_FORM_WORKFLOW_AUTHORITY = NONE`
- `ADMIN_FORM_MAY_APPROVE_FOR_OTHERS = NO`
- `ADMIN_FORM_ALLOWED_AS_UAT_REQUESTER = NO`
- `ADMIN_FORM_ALLOWED_AS_UAT_MANAGER = NO`
- `ADMIN_FORM_ALLOWED_AS_UAT_GM = NO`
- `ADMIN_FORM_ALLOWED_AS_UAT_HR_APPROVER = NO`

This user decision overrides the earlier R12E-A draft assumption that `admin-form` could be used as UAT_A / Requester / HR actor.

# R12D-D INTERPRETATION AFTER USER CORRECTION

R12D-D technically changed App794 Sandbox status `15 HR Final Check` from an empty native assignee list to `USER: admin-form` while preserving 16 states / 28 actions.

After the new business clarification, this configuration is classified only as:

`TEMPORARY_SANDBOX_TECHNICAL_LOCK = USER: admin-form`

It is NOT a valid business HR approval mapping and must NOT be used to execute `Complete` or `Return Final HR` during UAT.

Do not roll it back in R12E-A because an empty assignee would recreate the prior open authorization defect. Leave it untouched and treat Workflow UAT as blocked until a separately authorized controlled UAT-HR remap is designed and approved.

# NORTH STAR

Employee -> Verify Employee -> Resolve Routing -> Resolve Evaluation Profile -> Enter Objectives -> Validate Objectives -> Save -> Submit -> Workflow Approval -> Follow-up/Mid-Year -> Year-End -> Final Result -> Dashboard/Archive.

Current critical path:

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Guard PASS -> Deploy PASS -> Status15 Technical Lock PASS -> Role-Correct UAT Identity Lockdown -> Controlled UAT-HR Remap -> Isolated Workflow UAT -> Functional UAT`

Hard user constraint:

- no real-user workflow test;
- no real-user notification test;
- no real Manager/GM/HR approval merely for certification;
- `REAL_USER_IMPACT = 0`.

# CONTROL-PLANE SOURCE FINDING — REUSE

ChatGPT already verified from source:

1. Employee lookup snapshots routing fields into App794 (`Requester_User`, `Manager_User`, `GM_User`, `First_Manager_User`, `Routing_Topology`).
2. Process action runtime validates the App794 snapshot fields and does not re-query App795 during `app.record.detail.process.proceed`.
3. Current active topology is `M1_G1`; First-Manager actions must fail closed.

Therefore isolated UAT can use a purpose-built synthetic App794 Sandbox record with controlled test identities in its snapshot fields, without modifying App795.

Do not repeat source discovery.

# OBJECTIVE

Produce a zero-write, exact role-correct UAT lockdown plan. Determine whether the project has enough **controlled non-business test identities** to simulate all required workflow roles without using `admin-form` as a business actor.

R12E-A must answer:

1. Is App794 live/preview still stable after R12D-D?
2. What App794 notification rules could reach real users during a synthetic UAT?
3. Are there existing controlled test identities that the user can legitimately designate as:
   - `UAT_REQUESTER`
   - `UAT_MANAGER`
   - `UAT_GM`
   - `UAT_HR`
4. Can actor/session switching be performed for those identities?
5. What exact Process change is required to replace the temporary status15 `admin-form` technical lock with `UAT_HR` before UAT?
6. What exact synthetic UAT record and transition matrix will exercise current `M1_G1` workflow with zero real-user impact?
7. What exact fresh authorization would be required later?

# A. STARTUP / DRIFT GATE

1. Pull latest same branch.
2. Local HEAD must equal origin HEAD and include this task correction.
3. Read canonical baseline in mandatory order.
4. Confirm no source/dist/test drift.
5. Do not run npm test/build.
6. No previous Kintone authorization may be reused.

# B. APP794 READ-ONLY PROCESS SNAPSHOT

Use minimum GETs.

Confirm:

- live/preview revisions aligned;
- expected current revision remains `36` unless read-only evidence explains otherwise;
- Process = 16 states / 28 actions;
- active M1_G1 path unchanged;
- status15 remains `ONE + USER: admin-form`;
- production HR group is absent from Sandbox;
- no pending preview drift.

Classify current status15 as `TEMPORARY_SANDBOX_TECHNICAL_LOCK`, never as UAT HR business authority.

Unexpected drift => `R12E_EXECUTION_READY = NO`.

# C. NOTIFICATION SAFETY AUDIT — READ ONLY

Read the narrow current App794 notification configurations supported by the tenant/API, including where available:

- General Notifications;
- Per Record Notifications;
- Reminder Notifications;
- other native notification rules capable of firing on create/edit/status transition.

For each enabled rule capture:

- trigger/condition;
- recipient source/entity/field;
- whether a proposed synthetic UAT record could match;
- whether any recipient could be a real person/group/organization/everyone.

Classify:

`UAT_NOTIFICATION_SAFETY = SAFE_WITH_CONTROLLED_IDENTITIES / BLOCKED_REAL_RECIPIENT_RISK / UNRESOLVED`

Do not disable or modify notifications in this task.

# D. CONTROLLED TEST IDENTITY LOCKDOWN — ADMIN-FORM EXCLUDED

`admin-form` may be used by Antigravity only for technical inspection/debugging. It is not one of the workflow actors.

Required role model for current M1_G1 UAT:

- `UAT_REQUESTER` — controlled non-business test identity
- `UAT_MANAGER` — controlled non-business test identity
- `UAT_GM` — controlled non-business test identity
- `UAT_HR` — controlled non-business test identity

Prefer four distinct identities so role/assignee boundaries are actually exercised. A different workflow role may be reused only if there is an explicit pre-existing business/UAT reason and ChatGPT later accepts it; do not silently collapse roles.

Identity discovery rules:

1. Do not enumerate the full directory.
2. Do not scan real App795 approvers looking for convenient accounts.
3. Do not use a real Manager/GM/HR simply because the account exists.
4. Do not retrieve passwords/secrets.
5. Only classify an identity as controlled if evidence shows it is a non-business test/shared technical account suitable for UAT and the user can control the login/session.
6. If exact controlled identities cannot be proven read-only, report for each missing role:
   `USER_DESIGNATION_REQUIRED`.
7. `admin-form` must appear only as `TECHNICAL_ADMIN`, never in role mapping.

Required output:

`MINIMUM_ROLE_CORRECT_CONTROLLED_IDENTITIES = 4` unless evidence supports a reviewed smaller role-separated design.

# E. ACTOR SWITCH / AUTHENTICATION FEASIBILITY

Without executing workflow, determine whether each future controlled test role can be represented through:

- existing controlled browser sessions;
- user-assisted login/session switching;
- approved REST authentication that truly executes as the intended user.

Do not assume an API token equals a target user. Do not perform a status update.

Output per role and overall:

`ACTOR_SWITCH_METHOD = EXISTING_CONTROLLED_BROWSER_SESSIONS / USER_ASSISTED_LOGIN_REQUIRED / CONTROLLED_REST_AUTH_AVAILABLE / UNRESOLVED`

# F. REQUIRED PRE-UAT PROCESS REMAP — DESIGN ONLY

Because `admin-form` has no HR workflow authority, R12E cannot execute status15 while it remains the assignee.

Design a separate controlled pre-UAT Process repair:

`15 HR Final Check.assignee.entities: USER admin-form -> USER UAT_HR`

Requirements for the later repair:

- App794 Sandbox only;
- retain assignee type `ONE`;
- 16 states / 28 actions unchanged;
- only one semantic Process diff;
- no production HR group;
- fresh backup;
- existing status15 record count must be 0 before remap;
- one Process PUT + one deploy only;
- post-deploy readback;
- zero record workflow actions during the remap.

This future remap requires a fresh explicit user authorization. Do not execute it now.

After UAT, design whether Sandbox should:

- remain assigned to a dedicated `UAT_HR` for future regression testing; or
- be moved to another approved safe non-production configuration.

Never restore empty `[]` and never restore `admin-form` as a business HR actor.

# G. SYNTHETIC UAT RECORD DESIGN — PLAN ONLY

Prefer exactly one synthetic App794 UAT record if feasible.

The record must be unmistakably test-only and must not impersonate/modify a real employee business record.

Proposed snapshot model:

- `Routing_Topology = M1_G1`
- `First_Manager_User = []`
- `Requester_User = [UAT_REQUESTER]`
- `Manager_User = [UAT_MANAGER]`
- `GM_User = [UAT_GM]`
- status15 native assignee = `UAT_HR` after the separate controlled Process remap.

Do not modify App795.

Read only the minimum App794 schema needed to prove a synthetic record can satisfy required fields and ValidationEngine using minimal valid objective/mid-year/final values.

DEC-029: this is a functional UAT artifact with a defined test matrix and cleanup plan, not a canary write-pipeline dummy.

# H. ROLE-CORRECT TRANSITION MATRIX — PLAN ONLY

Plan the current M1_G1 direct path:

- `01 -> 03` Submit Objective to Manager — UAT_REQUESTER
- `03 -> 04` Approve Objective — UAT_MANAGER
- `04 -> 05` Approve Objective — UAT_GM
- `05 -> 06` Start Mid-Year — UAT_REQUESTER
- `06 -> 08` Submit Mid-Year to Manager — UAT_REQUESTER
- `08 -> 09` Approve Mid-Year Manager — UAT_MANAGER
- `09 -> 10` Approve Mid-Year GM — UAT_GM
- `10 -> 11` Start Self Evaluation — UAT_REQUESTER
- `11 -> 13` Submit Final to Manager — UAT_REQUESTER
- `13 -> 14` Approve Final Manager — UAT_MANAGER
- `14 -> 15` Approve Final GM — UAT_GM
- `15 -> 16` Complete — UAT_HR

Plan return paths:

- `03 -> 01` Return Objective — UAT_MANAGER
- `04 -> 01` Return Objective — UAT_GM
- `08 -> 06` Return Mid-Year Manager — UAT_MANAGER
- `09 -> 06` Return Mid-Year GM — UAT_GM
- `13 -> 11` Return Final Manager — UAT_MANAGER
- `14 -> 11` Return Final GM — UAT_GM
- `15 -> 11` Return Final HR — UAT_HR

Required negative checks:

- M1_G1 First-Manager submit action must not proceed at Objective/Mid-Year/Final employee stages;
- at status15, one controlled non-HR workflow identity (prefer UAT_GM or UAT_MANAGER) must be denied `Complete` and `Return Final HR`;
- after every denial: status and assignee unchanged, no notification to real users;
- `admin-form` must NOT be used to attempt any positive or negative business workflow action.

Optimize to the fewest transitions while preserving role correctness and evidence clarity.

# I. EXECUTION METHOD — DESIGN ONLY

For future R12E:

- synthetic record create/edit may use narrowly authorized controlled record writes;
- Process actions that prove the deployed client workflow guard should run through the App794 browser UI under the actual controlled role identity;
- REST-only status updates must not be claimed as proof of JavaScript workflow guard behavior;
- admin-form may observe/debug but must not execute business Process actions.

# J. CLEANUP / NO-ORPHAN

Prefer deleting exactly the synthetic UAT record after evidence capture unless governance requires a retained Sandbox test record.

If delete is proposed, the later authorization must explicitly include that exact record deletion.

Capture before cleanup:

- record key/id;
- actor/action/status trace;
- denied-action evidence;
- notification safety evidence;
- final status/assignee trace;
- no-real-user-impact confirmation.

Never delete business/historical records.

# K. PROPOSED FUTURE AUTHORIZATION MANIFEST — OUTPUT ONLY

R12E-A must produce a precise later write manifest including:

1. Pre-UAT Process remap `admin-form -> UAT_HR` at status15, exact one semantic diff.
2. Exact controlled identities for Requester/Manager/GM/HR.
3. Exact synthetic UAT record marker/key strategy.
4. Max record create count.
5. Bounded data-preparation edits.
6. Exact allowed Process actions and exact expected denied attempts.
7. Cleanup delete yes/no.
8. App794 only.
9. Zero App795/App53/App796/other-app writes.
10. Zero schema/ACL/customization changes.
11. Zero real-user recipients.
12. Stop conditions.

Do not request authorization inside the evidence. ChatGPT reviews first.

# HARD SAFETY BOUNDARY

Forbidden in R12E-A:

- any Kintone POST/PUT/DELETE;
- record create/edit/delete;
- workflow/status action or attempted action;
- Change assignee;
- Process Management change;
- notification setting change;
- schema/ACL/customization change;
- App795/App53/App796/other-app write;
- user/group/org/membership change;
- password/secret retrieval;
- broad identity discovery;
- real-user workflow login/test;
- admin-form business workflow action;
- npm tests/build;
- source/dist/test changes;
- browser workflow clicks.

Allowed:

- minimum GETs for App794 Process/schema/notification settings;
- narrow reads for controlled test identity feasibility;
- local/Git evidence inspection;
- evidence/living-doc Git updates only.

# CREDIT-SAVING RULE

Reuse R12D-A/B/D evidence and ChatGPT source findings. Do not repeat broad audits, App795 reads, source audits, npm tests, or browser workflow tests.

# REQUIRED EVIDENCE

```text
M10L_D_R12E_A_ISOLATED_UAT_LOCKDOWN = COMPLETE / PARTIAL / BLOCKED
ADMIN_FORM_ROLE = TECHNICAL_ADMIN_ONLY
ADMIN_FORM_WORKFLOW_AUTHORITY = NONE
ADMIN_FORM_USED_AS_UAT_ACTOR = NO
KINTONE_WRITE_AUTHORIZATION = NONE
LIVE_APP794_REVISION = actual
PREVIEW_APP794_REVISION = actual
LIVE_PREVIEW_DRIFT = NO/YES
PROCESS_STATE_COUNT = actual
PROCESS_ACTION_COUNT = actual
STATUS15_CURRENT_ASSIGNEE = actual
STATUS15_CURRENT_CLASSIFICATION = TEMPORARY_SANDBOX_TECHNICAL_LOCK
GENERAL_NOTIFICATION_AUDIT = PASS/FAIL/UNRESOLVED
PER_RECORD_NOTIFICATION_AUDIT = PASS/FAIL/UNRESOLVED
REMINDER_NOTIFICATION_AUDIT = PASS/FAIL/UNRESOLVED
OTHER_RELEVANT_NOTIFICATION_AUDIT = PASS/FAIL/NOT_APPLICABLE/UNRESOLVED
UAT_NOTIFICATION_SAFETY = SAFE_WITH_CONTROLLED_IDENTITIES / BLOCKED_REAL_RECIPIENT_RISK / UNRESOLVED
UAT_REQUESTER = exact / USER_DESIGNATION_REQUIRED
UAT_MANAGER = exact / USER_DESIGNATION_REQUIRED
UAT_GM = exact / USER_DESIGNATION_REQUIRED
UAT_HR = exact / USER_DESIGNATION_REQUIRED
MINIMUM_ROLE_CORRECT_CONTROLLED_IDENTITIES = actual proposed
CONTROLLED_IDENTITY_PROOF = concise / INSUFFICIENT
ACTOR_SWITCH_METHOD = exact / USER_ASSISTED_LOGIN_REQUIRED / UNRESOLVED
APP795_CHANGE_REQUIRED_FOR_UAT = NO
PROCESS_CONFIG_CHANGE_REQUIRED_BEFORE_UAT = YES
REQUIRED_PROCESS_CHANGE = status15 USER admin-form -> USER UAT_HR
SCHEMA_CHANGE_REQUIRED_FOR_UAT = NO
ACL_CHANGE_REQUIRED_FOR_UAT = NO
CUSTOMIZATION_CHANGE_REQUIRED_FOR_UAT = NO
UAT_RECORD_COUNT_PROPOSED = exact
UAT_RECORD_KEY_STRATEGY = exact
UAT_RECORD_COLLISION_CHECK = PASS/FAIL/UNRESOLVED
UAT_RECORD_SCHEMA_FEASIBILITY = PASS/FAIL/UNRESOLVED
DIRECT_PATH_MATRIX_READY = PASS/FAIL
RETURN_PATH_MATRIX_READY = PASS/FAIL
FIRST_MANAGER_NEGATIVE_MATRIX_READY = PASS/FAIL
STATUS15_NON_ASSIGNEE_NEGATIVE_MATRIX_READY = PASS/FAIL
CLEANUP_STRATEGY = exact
REAL_USER_WORKFLOW_TEST_REQUIRED = NO
REAL_USER_NOTIFICATION_TEST_REQUIRED = NO
REAL_USER_IMPACT_TARGET = 0
R12E_EXECUTION_READY = YES/NO
R12E_EXECUTION_BLOCKER = NONE / exact
PROPOSED_R12E_AUTHORIZATION_SCOPE = concise exact manifest
KINTONE_GET_CALLS_THIS_TASK = actual
KINTONE_WRITES_THIS_TASK = 0
WORKFLOW_ACTION_EXECUTED = 0
WORKFLOW_ACTION_ATTEMPTED = 0
WORKFLOW_NOTIFICATION_TRIGGERED = 0
SRC_CHANGE_COUNT = 0
DIST_CHANGE_COUNT = 0
TEST_CHANGE_COUNT = 0
CONFIRMED_BASELINE_CONFLICT_COUNT = actual
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW BEFORE ANY PROCESS OR WORKFLOW WRITE AUTHORIZATION
```

# STOP CONDITION

Push read-only evidence on the same branch and STOP. Do not remap status15, create a UAT record, or execute any Process action. A new explicit user authorization will be required only after ChatGPT reviews this role-correct lockdown.