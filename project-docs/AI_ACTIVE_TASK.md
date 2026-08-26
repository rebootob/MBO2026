# AI ACTIVE TASK — R12E-A READ-ONLY ISOLATED WORKFLOW UAT LOCKDOWN

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting reviewed/control-plane HEAD: `2767d6a800bc50dd212762591df416b137d5a178`
> Target App: App794 `MBO V2 Sandbox`
> Mode: READ-ONLY UAT LOCKDOWN / ZERO KINTONE WRITES
> Kintone write authorization: **NONE**

# NORTH STAR

Employee -> Verify Employee -> Resolve Routing -> Resolve Evaluation Profile -> Enter Objectives -> Validate Objectives -> Save -> Submit -> Workflow Approval -> Follow-up/Mid-Year -> Year-End -> Final Result -> Dashboard/Archive.

Current critical path:

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Guard PASS -> Deploy PASS -> Native HR Authorization PASS -> Isolated Workflow UAT Lockdown -> Isolated Workflow UAT -> Functional UAT`

R12D-D is independently reviewed PASS. Canonical current App794 Sandbox state:

- live/preview revision `36 / 36`;
- Process Management `16 states / 28 actions`;
- all 17 active App795 routes are currently `M1_G1`;
- `15 HR Final Check.assignee.type = ONE`;
- `15 HR Final Check.assignee.entities = USER: admin-form`;
- no record was at status 15 during R12D-D;
- production HR group is NOT configured in Sandbox.

Hard user constraint:

`REAL_USER_WORKFLOW_TEST = FORBIDDEN`
`REAL_USER_NOTIFICATION_TEST = FORBIDDEN`
`REAL_USER_IMPACT = 0`

No real employee, Manager, GM, or HR user may be used merely to prove the workflow. No prior write authorization may be reused.

# CONTROL-PLANE SOURCE FINDING — REUSE, DO NOT REDISCOVER

ChatGPT independently inspected the deployed source before opening this task:

1. Employee lookup/UI initialization resolves App795 and snapshots these fields into the App794 record:
   - `Requester_User`
   - `Manager_User`
   - `GM_User`
   - `First_Manager_User`
   - `Routing_Topology`
   - detailed Manager/GM approver arrays.
2. `app.record.detail.process.proceed` does **not** re-query App795. Runtime workflow validation uses the App794 record snapshot fields plus current Process status/action.
3. For current `M1_G1`, direct Manager actions require `Manager_User`; Manager handover requires `GM_User`; requester/self handovers require `Requester_User`; First-Manager actions fail closed for non-M2 topology.

Therefore a future isolated UAT may use a purpose-built App794 Sandbox UAT record whose routing snapshot fields point only to controlled UAT identities, without modifying App795 and without routing workflow to real approvers.

Do not spend Antigravity credit rediscovering this source behavior.

# OBJECTIVE OF R12E-A

Produce an exact, reviewable, zero-real-user-impact execution plan for R12E. Do **not** create/edit/delete any record and do **not** execute any Process action in this task.

R12E-A must answer conclusively:

1. Is the current App794 Process still safe and unchanged after R12D-D?
2. Can a second existing **controlled** non-HR Kintone identity be proven available for UAT?
3. Can two controlled identities safely model the active M1_G1 workflow without real recipients?
4. Could App794 General / Per-record / Reminder notifications send messages to any real users when the proposed UAT record is created, edited, or transitioned?
5. What exact UAT record shape, actor mapping, transition matrix, negative tests, cleanup, and rollback/stop behavior should R12E use?
6. Is R12E ready for fresh user authorization, or what exact blocker/user input remains?

# A. GIT / BASELINE STARTUP GATE

1. Pull latest `ai/antigravity-wp002c`.
2. Local HEAD must equal origin HEAD and must start at this task commit.
3. Read canonical baseline in required order.
4. Confirm:
   - App794 Sandbox native HR boundary is canonical as `USER: admin-form`;
   - App794 Process = 16/28;
   - App795 = 17 active routes, all current `M1_G1`;
   - production HR mapping remains a future go-live gate;
   - no prior authorization covers R12E writes.
5. Verify no `src/**`, `dist/**`, or `tests/**` change after reviewed/deployed runtime candidate. Do not run tests/build.

# B. FRESH APP794 READ-ONLY SAFETY SNAPSHOT

Use the minimum GETs necessary.

1. GET current live App794 Process Management.
2. Confirm live revision remains `36` unless there is independently explainable read-only evidence. Any unexplained revision/process drift => `R12E_READY = NO`.
3. Confirm:
   - 16 states;
   - 28 actions;
   - current active M1_G1 path unchanged;
   - status 15 type `ONE`;
   - status 15 entity exactly `USER: admin-form`;
   - production HR group absent.
4. Confirm there is no pending preview Process drift. Do not change anything.

Do not repeat ACL/source audits from R12D-A/B unless an unexpected conflict appears.

# C. NOTIFICATION SAFETY AUDIT — READ ONLY / MANDATORY

The hard requirement is not merely “no workflow to real users”; no UAT create/edit/status operation may generate a notification to a real person.

Read the current App794 notification configurations supported by the tenant/API, at minimum where available:

- General Notifications;
- Per Record Notifications;
- Reminder Notifications;
- any additional native App794 notification setting that can be triggered by record create/edit/status transition.

For every enabled rule record:

- exact event/condition;
- exact recipient expression/entity/field;
- whether the proposed isolated UAT record could satisfy the condition;
- whether recipients would resolve exclusively to controlled UAT identities or could include real users/groups/organizations/everyone.

Classify:

`UAT_NOTIFICATION_SAFETY = SAFE_WITH_CONTROLLED_SNAPSHOTS / BLOCKED_REAL_RECIPIENT_RISK / UNRESOLVED`

If a notification rule may reach a real user during proposed R12E operations, do NOT propose disabling it in this task and do not write. Report the exact rule as a blocker and design the smallest later isolation change, which would require separate authorization.

Native Process assignee/task routing to controlled UAT identities is acceptable. Routing to any real Manager/GM/HR is not.

# D. CONTROLLED UAT IDENTITY LOCKDOWN — NARROW DISCOVERY ONLY

Known controlled positive identity from R12D-B/D:

`UAT_A = admin-form`

Proposed two-account actor model if technically provable:

- `UAT_A = admin-form` => Requester + HR Final Check
- `UAT_B = one different controlled non-HR identity` => Manager + GM

This two-account design allows alternating native assignee ownership and a genuine status-15 negative test: UAT_B must be denied while UAT_A is the native HR assignee.

Rules:

1. Re-confirm current authenticated executor user code = `admin-form`.
2. Identify **one** second existing account only through the narrowest evidence available.
3. Account existence is NOT sufficient. `UAT_B` must be classified controlled only if there is evidence that it is a test/admin/shared account available for controlled login during UAT without involving a real Manager/GM/HR recipient.
4. Do not enumerate the whole user directory.
5. Do not query the 17 real approver identities just to find a convenient account.
6. Do not use `Manager HR_x52y75` or any real HR member as UAT_B.
7. Do not expose or retrieve passwords/secrets.
8. If control of a second identity cannot be proven read-only, report:
   `SECOND_CONTROLLED_IDENTITY = USER_DESIGNATION_REQUIRED`
   and specify what the user must provide/confirm before R12E.

Required classification:

`MINIMUM_CONTROLLED_IDENTITIES = 2`

Do not silently reduce to one identity because that would not provide a real negative native-assignee test.

# E. AUTHENTICATION / SESSION FEASIBILITY

R12E will need actual actor switching. Determine without performing workflow:

- whether Antigravity has an authenticated usable session only for `admin-form` or more than one controlled account;
- whether the future UAT_B login would require a user-assisted login/session setup;
- whether an approved REST authentication method can validly represent a specific non-assignee user for Update Status negative testing without exposing secrets.

Do not assume API token behavior. Do not perform a status API call.

Classify:

`ACTOR_SWITCH_METHOD = EXISTING_CONTROLLED_BROWSER_SESSIONS / USER_ASSISTED_LOGIN_REQUIRED / CONTROLLED_REST_AUTH_AVAILABLE / UNRESOLVED`

If user-assisted login is required, say so explicitly. That is not a defect.

# F. EXACT UAT RECORD DESIGN — PLAN ONLY, NO WRITE

Prefer exactly **one** isolated UAT record if one record can cover all current M1_G1 active-path and return-path checks without ambiguity.

The record must be clearly non-business test data and must not impersonate or alter a real employee record.

Design a deterministic future UAT marker/key, e.g. an unmistakable R12E UAT prefix, while respecting live App794 field types/required constraints and uniqueness rules. Read only the minimum App794 field schema needed to prove the record can be constructed.

The future record must snapshot only controlled identities:

- `Routing_Topology = M1_G1`
- `First_Manager_User = []`
- `Requester_User = [UAT_A]`
- `Manager_User = [UAT_B]`
- `GM_User = [UAT_B]`
- status 15 remains fixed by Process Management to `admin-form` / UAT_A.

Do not modify App795.

Plan all objective/mid-year/final fields necessary for current ValidationEngine to allow the browser Process actions. Use minimal valid synthetic test values. Do not create artificial schema fields.

DEC-029 guard:
- this future record is permitted only as a reviewed functional UAT artifact, not a dummy canary for testing a write pipeline;
- R12E must have an explicit functional test matrix and cleanup disposition;
- no unrelated artificial records are allowed.

# G. UAT TRANSITION / NEGATIVE TEST MATRIX — PLAN ONLY

Design the exact current `M1_G1` functional matrix for the future R12E record.

At minimum the final R12E plan must cover:

### Direct path
- `01 -> 03` Submit Objective to Manager
- `03 -> 04` Approve Objective
- `04 -> 05` Approve Objective
- `05 -> 06` Start Mid-Year
- `06 -> 08` Submit Mid-Year to Manager
- `08 -> 09` Approve Mid-Year Manager
- `09 -> 10` Approve Mid-Year GM
- `10 -> 11` Start Self Evaluation
- `11 -> 13` Submit Final to Manager
- `13 -> 14` Approve Final Manager
- `14 -> 15` Approve Final GM
- `15 -> 16` Complete

### Active return paths
- `03 -> 01` Return Objective
- `04 -> 01` Return Objective
- `08 -> 06` Return Mid-Year Manager
- `09 -> 06` Return Mid-Year GM
- `13 -> 11` Return Final Manager
- `14 -> 11` Return Final GM
- `15 -> 11` Return Final HR

### Required negative checks
- M1_G1 First-Manager submit action must not proceed at objective/mid-year/final stages;
- at status 15, UAT_B / non-assignee must be unable to execute `Complete` or `Return Final HR`;
- after each denied attempt, status/assignee must be unchanged and no notification must be triggered.

Optimize the sequence to cover the matrix with the fewest status transitions and ideally one UAT record. It is acceptable to revisit stages via Return actions.

For each planned action state:
- acting identity;
- expected source status;
- expected action;
- expected destination or expected denial;
- expected assignee after success;
- required data-preparation fields before the action;
- notification safety expectation.

# H. RECORD CREATION / DATA PREPARATION EXECUTION METHOD — DESIGN ONLY

Design future R12E so business-function validation is actually exercised.

Important distinction:
- REST record creation/edit may be used to prepare synthetic UAT field values under exact authorization;
- workflow Process actions intended to prove client runtime guards should be executed through the App794 browser UI so `app.record.detail.process.proceed` runs;
- do not claim a REST-only status update proves the JavaScript workflow guard.

Prefer browser Process actions for current path/negative guard proof. Record data preparation may use narrowly scoped controlled record writes if authorized later.

# I. CLEANUP / NO-ORPHAN DESIGN

The future UAT record must have an explicit post-test disposition.

Evaluate the smallest safe option:

1. delete the exact synthetic UAT record after all evidence is captured; or
2. retain it only if a durable Sandbox UAT evidence record is intentionally required by governance.

Prefer no orphan test data. If deletion is proposed, it must be explicitly included in the future R12E authorization scope because record deletion is a Kintone write. Never delete business/historical records.

Define what evidence must be captured before cleanup so deleting the test record does not destroy the review trail.

# J. R12E AUTHORIZATION MANIFEST — OUTPUT ONLY

Produce an exact proposed future authorization scope, but do not execute it.

It must enumerate:

- App794 only;
- exact UAT identity A and B;
- exact synthetic UAT record key/marker strategy;
- maximum record create count;
- maximum record edit/data-preparation count or bounded preparation steps;
- exact allowed Process actions/attempts;
- exact expected denied attempts;
- whether cleanup delete is included;
- zero Process Management config changes;
- zero schema/ACL/customization changes;
- zero App795/App53/App796/other app writes;
- zero real-user recipients;
- stop conditions.

Do NOT ask for authorization inside the evidence. R12E-A ends with ChatGPT review.

# HARD SAFETY BOUNDARY

Forbidden in R12E-A:

- all Kintone POST/PUT/DELETE;
- App794 record create/edit/delete;
- all workflow/status actions or attempts;
- Change assignee;
- notification-triggering action;
- Process Management change;
- notification settings change;
- schema/ACL/customization change;
- App795/App53/App796/other app write;
- user/group/org/membership change;
- password/secret retrieval;
- broad user/group enumeration;
- real user login solely for testing;
- npm tests/build;
- source/dist/test changes;
- browser workflow clicking.

Allowed:

- minimum App794 GETs for Process/schema/record-count/notification settings;
- narrow current-user and controlled-candidate identity reads;
- local/Git evidence inspection;
- evidence/living-doc updates only.

# CREDIT-SAVING RULE

- Reuse R12D-A/B/D evidence.
- Reuse ChatGPT source finding in this task; do not re-audit code.
- Do not query App795 unless a direct unresolved fact makes it unavoidable.
- Do not enumerate approvers.
- No browser workflow test.
- No npm test/build.
- Do not create a new evidence file; append one concise R12E-A block to `project-docs/AI_REVIEW_PACKAGE.md` and minimally update living docs.
- Push same branch and STOP.

# REQUIRED EVIDENCE

```text
M10L_D_R12E_A_ISOLATED_UAT_LOCKDOWN = COMPLETE / PARTIAL / BLOCKED
STARTING_HEAD = 2767d6a800bc50dd212762591df416b137d5a178
KINTONE_WRITE_AUTHORIZATION = NONE
LIVE_APP794_REVISION = actual
PREVIEW_APP794_REVISION = actual
LIVE_PREVIEW_DRIFT = NO/YES
PROCESS_STATE_COUNT = actual
PROCESS_ACTION_COUNT = actual
STATUS15_ASSIGNEE = exact
PROCESS_BASELINE_MATCH = PASS/FAIL
GENERAL_NOTIFICATION_AUDIT = PASS/FAIL/UNRESOLVED
PER_RECORD_NOTIFICATION_AUDIT = PASS/FAIL/UNRESOLVED
REMINDER_NOTIFICATION_AUDIT = PASS/FAIL/UNRESOLVED
OTHER_RELEVANT_NOTIFICATION_AUDIT = PASS/FAIL/NOT_APPLICABLE/UNRESOLVED
UAT_NOTIFICATION_SAFETY = SAFE_WITH_CONTROLLED_SNAPSHOTS / BLOCKED_REAL_RECIPIENT_RISK / UNRESOLVED
UAT_A = admin-form
SECOND_CONTROLLED_IDENTITY = exact code / USER_DESIGNATION_REQUIRED / UNRESOLVED
SECOND_CONTROLLED_IDENTITY_PROOF = concise evidence / NONE
UAT_B = exact code / PENDING_USER_DESIGNATION
MINIMUM_CONTROLLED_IDENTITIES = 2
ACTOR_SWITCH_METHOD = EXISTING_CONTROLLED_BROWSER_SESSIONS / USER_ASSISTED_LOGIN_REQUIRED / CONTROLLED_REST_AUTH_AVAILABLE / UNRESOLVED
APP795_CHANGE_REQUIRED_FOR_UAT = NO
PROCESS_CONFIG_CHANGE_REQUIRED_FOR_UAT = NO
SCHEMA_CHANGE_REQUIRED_FOR_UAT = NO
ACL_CHANGE_REQUIRED_FOR_UAT = NO
CUSTOMIZATION_CHANGE_REQUIRED_FOR_UAT = NO
UAT_RECORD_COUNT_PROPOSED = 1 / other exact number
UAT_RECORD_KEY_STRATEGY = exact
UAT_RECORD_COLLISION_CHECK = PASS/FAIL/UNRESOLVED
UAT_RECORD_SCHEMA_FEASIBILITY = PASS/FAIL/UNRESOLVED
UAT_ACTOR_MAPPING = exact concise A/B mapping
DIRECT_PATH_MATRIX_READY = PASS/FAIL
RETURN_PATH_MATRIX_READY = PASS/FAIL
FIRST_MANAGER_NEGATIVE_MATRIX_READY = PASS/FAIL
STATUS15_NON_ASSIGNEE_NEGATIVE_MATRIX_READY = PASS/FAIL
CLEANUP_STRATEGY = DELETE_EXACT_UAT_RECORD_AFTER_EVIDENCE / RETAIN_WITH_JUSTIFICATION / UNRESOLVED
REAL_USER_WORKFLOW_TEST_REQUIRED = NO
REAL_USER_NOTIFICATION_TEST_REQUIRED = NO
REAL_USER_IMPACT_TARGET = 0
R12E_EXECUTION_READY = YES/NO
R12E_EXECUTION_BLOCKER = NONE / exact blocker
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
NEXT_ACTION = CHATGPT REVIEW BEFORE ANY R12E WRITE AUTHORIZATION
```

# STOP CONDITION

Push the read-only evidence/living-doc commit on `ai/antigravity-wp002c` and STOP.

Do not perform R12E. Do not create a UAT record. Do not execute or attempt any Process action. Do not send any notification. A fresh explicit user authorization will be required only after ChatGPT reviews this lockdown result and the exact R12E manifest.