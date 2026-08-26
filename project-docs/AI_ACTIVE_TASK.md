# AI ACTIVE TASK — R12D-B HR AUTHORIZATION REPAIR DESIGN + ISOLATED UAT IDENTITY DISCOVERY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting reviewed/control-plane HEAD: `485af5192ea9d9023f6245999aff5da1e696a79d`
> Target App: App794 `MBO V2 Sandbox`
> Mode: READ-ONLY REPAIR DESIGN + NARROW IDENTITY DISCOVERY
> Kintone write authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

Current critical path:

`Verify Employee PASS -> Objectives PASS -> Save PASS -> Workflow Runtime Guard PASS -> Deploy PASS -> Runtime Evidence PASS -> HR Final Authorization BLOCKED -> Isolated Workflow UAT BLOCKED`

R12D-A confirmed a security/workflow defect at `15 HR Final Check`:

- Process assignee type is `ONE` but assignee entities are empty `[]`;
- `Complete -> 16 Completed` has no restrictive action filter;
- `Return Final HR -> 11 Employee Self Evaluation` has no restrictive action filter;
- App ACL grants `everyone` view/add/edit/delete;
- Record ACL has no HR-only boundary;
- Field ACL has no material HR-only authorization boundary;
- deployed runtime JavaScript has no HR/current-actor authorization guard.

Canonical classification is now:

`DEFECT_CONFIRMED_NO_HR_AUTHORIZATION_LAYER`

This task does NOT repair the defect. It must produce the smallest production-correct native Kintone repair design and the exact isolated-UAT identity requirements, while preserving:

`REAL_USER_IMPACT = 0`

# CHANGE GOVERNANCE

## What

Design, but do not execute, the HR Final Check authorization repair.

The design must:

1. use a **native Kintone authorization boundary as the primary security control** for status `15 HR Final Check`;
2. keep JavaScript only as optional defense-in-depth, never as the primary boundary;
3. support isolated App794 Sandbox UAT using only existing controlled identities/accounts;
4. avoid sending workflow/tasks/notifications to real HR, Manager, or GM during UAT;
5. preserve a clear production mapping so Sandbox UAT can be certified by production-parity review without a real-user workflow test;
6. minimize new schema/config/code and avoid unnecessary files/artifacts.

## Where

Read only:

- current canonical baseline and R12D-A evidence;
- current App794 Process Management configuration only if an exact assignee-expression detail is still needed;
- existing repository source/security docs;
- the narrowest supported Kintone identity/group lookup needed to identify an existing HR native entity or existing controlled UAT identity.

Do not modify App794, any other Kintone app, any user/group/directory object, or source code.

# A. GIT / BASELINE GATE

1. Pull latest `ai/antigravity-wp002c`; local HEAD must equal origin HEAD.
2. Read the confirmed baseline in required order.
3. Confirm:
   - App794 Process baseline = 16 states / 28 actions;
   - current 17 App795 routes = `M1_G1`;
   - HR Final Check authorization blocker is canonical and unresolved;
   - App794 remains `SANDBOX` / non-production.
4. Confirm no `src/**`, `dist/**`, or `tests/**` drift after deployed candidate `a980f064817cb3243fa57fce0c7c84619019311e`.
5. Do not run npm tests/build.

# B. REUSE EXISTING R12D-A EVIDENCE FIRST

Do not repeat the full R12D-A audit.

Reuse the already-confirmed facts:

- `15 HR Final Check`
- `assignee.type = ONE`
- `assignee.entities = []`
- `Complete -> 16 Completed`, no action filter
- `Return Final HR -> 11 Employee Self Evaluation`, no action filter
- Return destination = `Requester_User`
- App/Record/Field ACL provide no HR-only boundary
- runtime HR actor guard absent

Only issue a Process GET if needed to answer one specific repair-design question about the exact assignee expression shape. No broad Process rediscovery.

# C. NATIVE KINTONE REPAIR MODEL — DESIGN ONLY

Evaluate only native Kintone mechanisms that can actually form the primary authorization boundary at status 15.

At minimum compare these models if supported by the current tenant/API shape:

### Option 1 — Direct native HR entity on status 15

Examples of native entity types may include USER / GROUP / ORGANIZATION as actually supported by the Process response/API. Do not assume unsupported entity shapes.

Determine:
- whether status 15 can directly reference an existing HR native entity;
- whether `assignee.type = ONE` with that entity produces an unambiguous actionable HR-only boundary;
- whether the prior actor must select an individual assignee and whether that would be operationally acceptable;
- notification/task behavior expected from the native assignment;
- UAT implications.

### Option 2 — Record field driven native assignee

If the Process API supports a user-selection/field entity expression, evaluate a dedicated record field such as a future `HR_Final_Check_User` only as a design option.

Do NOT create the field.

Assess:
- extra App794 schema required;
- how the field would be populated from a trusted source;
- how it would be protected from employee/shared-account tampering;
- whether it creates unnecessary complexity compared with a direct native entity.

### Option 3 — Record/App ACL as primary boundary

Evaluate only if the live ACL model can cleanly enforce status-15-only HR authorization without breaking earlier employee/manager/GM workflow access.

Do not propose a broad ACL rewrite unless unavoidable.

### Mandatory design decision

Select exactly one recommended **PRIMARY_NATIVE_BOUNDARY** and explain why it is the smallest production-correct option.

The recommended repair must not depend on UI hiding or JavaScript for authorization.

# D. OPTIONAL DEFENSE-IN-DEPTH JAVASCRIPT DESIGN

Do not modify source in this task.

Determine whether an environment-neutral JavaScript guard can safely add defense-in-depth, for example by requiring the current authenticated Kintone user to be one of the current native assignees at status 15.

Requirements:
- no hard-coded production HR username in source;
- no shared-account identity claim;
- must fail closed if current assignee information is unavailable;
- must not become the primary security boundary;
- if Kintone event data cannot reliably provide the native assignee set, report `JS_DEFENSE_IN_DEPTH = NOT_RECOMMENDED / UNPROVEN` instead of inventing behavior.

# E. NARROW EXISTING IDENTITY / GROUP DISCOVERY

Purpose: find enough existing identities to support a zero-real-user-impact Sandbox UAT and, if possible, identify the production HR native entity.

Hard constraints:
- DO NOT create users, groups, organizations, or licenses;
- DO NOT enumerate the entire user directory;
- DO NOT enumerate the entire group directory if the API/tool cannot server-side narrow the search;
- DO NOT alter memberships;
- no broad employee scan.

Allowed discovery sequence:

1. Capture the current authenticated executor/admin Kintone user code as a possible controlled Sandbox UAT identity.
2. Search only narrowly for an existing HR group/organization/entity using server-side search/filter if available (name/code containing an exact HR-related term is acceptable).
3. If no narrow search is supported, report:
   `PRODUCTION_HR_NATIVE_ENTITY = UNRESOLVED_WITHOUT_BROAD_DIRECTORY_ENUMERATION`
   and STOP that discovery path.
4. Identify whether at least one existing controlled Sandbox identity can serve as `UAT_HR` without involving a real HR recipient. Do not assume this if account control is not provable.
5. For negative HR authorization testing, identify the required **role**, not necessarily a new account: a different existing controlled non-HR identity must attempt status-15 action and be denied by native Kintone.

Do not use a real HR person merely to prove notification delivery.

# F. SANDBOX UAT VS PRODUCTION PARITY DESIGN

App794 is a Sandbox. Design the repair/UAT boundary accordingly.

The preferred strategy should, if technically valid, separate:

### Sandbox

- status 15 native assignee = controlled UAT identity/entity only;
- notifications/tasks target controlled UAT accounts only;
- full `Complete` and `Return Final HR` behavior can be exercised;
- non-HR controlled identity must be unable to execute status-15 actions;
- `REAL_USER_IMPACT = 0`.

### Production parity

- production target entity = real HR native entity (group/user/organization as selected by the design);
- Process topology/status/action structure remains identical to the Sandbox-certified shape, with only the authorized entity mapping differing where necessary;
- production parity is verified read-only/static before go-live;
- do NOT require a real HR workflow/notification test.

If this split cannot provide sufficient security confidence, state why and propose the smallest alternative that still preserves zero real-user impact.

# G. MINIMUM REPAIR CHANGE SET

Produce an exact proposed change set, but execute none.

Classify each as:

- `REQUIRED_NATIVE_PROCESS_CHANGE`
- `REQUIRED_SCHEMA_CHANGE`
- `REQUIRED_ACL_CHANGE`
- `OPTIONAL_JS_DEFENSE_IN_DEPTH`
- `NOT_REQUIRED`

For every proposed change specify:

- What
- Where
- How
- Why
- Expected impact
- Risk
- Test plan
- Rollback plan

Do not bundle unrelated App794 permission cleanup into this repair.

# H. NEXT CONTROLLED EXECUTION SPLIT

Recommend the smallest execution sequence after ChatGPT review.

Preferred separation:

1. `R12D-C` — repository-only defense-in-depth code/tests, only if actually recommended; 0 Kintone writes.
2. `R12D-D` — controlled App794 native Process repair under fresh explicit user authorization; no workflow record transitions.
3. `R12E` — isolated Workflow Functional UAT using exact controlled identities and exact allowed records/transitions.

If JS defense-in-depth is not needed before the native Process repair, say so and omit R12D-C to save credits.

No write authorization is implied by this design task.

# TEST / REVIEW PLAN FOR THIS TASK

No runtime write test.

Required outputs:

1. Git/no-code-drift PASS.
2. Primary native boundary selected.
3. Direct entity vs field-driven vs ACL design compared sufficiently to justify selection.
4. Sandbox UAT assignee strategy defined.
5. Production HR native entity identified or explicitly unresolved without broad enumeration.
6. Minimum controlled UAT identity count for HR-stage positive + negative testing stated.
7. Exact minimum Process/schema/ACL/code change set proposed.
8. `REAL_USER_IMPACT = 0` maintained.
9. Kintone writes = 0; workflow actions = 0; notifications = 0.

# HARD SAFETY BOUNDARY

Forbidden:

- all Kintone POST/PUT/DELETE;
- Process Management change;
- App/Record/Field ACL change;
- schema/customization change;
- record create/edit/save/delete;
- workflow/process action;
- Change assignee;
- notification-triggering action;
- user/group/org creation or membership change;
- App795/App53/App796 writes;
- source/dist/test changes;
- npm test/build;
- broad user/group enumeration.

Allowed:

- local repository/source/evidence inspection;
- minimal App794 Process GET only if one exact design semantic remains unresolved;
- narrow current-user identity read;
- narrow HR entity lookup using server-side filtering/search only;
- evidence/living-doc Git updates after design.

# CREDIT-SAVING RULE

- Reuse R12D-A Process + ACL evidence.
- Kintone GET target: 0–3 total; do not repeat known reads.
- No browser workflow test.
- No npm tests/build.
- No App795 re-query.
- No broad directory scan.
- Do not create a new design/evidence file; append one concise block to `AI_REVIEW_PACKAGE.md` and minimally update living docs.
- Push and STOP.

# REQUIRED EVIDENCE

```text
M10L_D_R12D_B_HR_REPAIR_DESIGN = COMPLETE / PARTIAL / BLOCKED
STARTING_HEAD = 485af5192ea9d9023f6245999aff5da1e696a79d
CONFIRMED_DEFECT = DEFECT_CONFIRMED_NO_HR_AUTHORIZATION_LAYER
PRIMARY_NATIVE_BOUNDARY = DIRECT_USER / DIRECT_GROUP / DIRECT_ORGANIZATION / FIELD_ENTITY / RECORD_ACL / OTHER / UNRESOLVED
PRIMARY_NATIVE_BOUNDARY_REASON = concise exact reason
DIRECT_NATIVE_ENTITY_MODEL = RECOMMENDED / NOT_RECOMMENDED / UNSUPPORTED / UNRESOLVED
FIELD_DRIVEN_ASSIGNEE_MODEL = RECOMMENDED / NOT_RECOMMENDED / UNSUPPORTED / UNRESOLVED
ACL_PRIMARY_MODEL = RECOMMENDED / NOT_RECOMMENDED / UNSUPPORTED / UNRESOLVED
REQUIRED_NATIVE_PROCESS_CHANGE = exact concise proposal / NONE
REQUIRED_SCHEMA_CHANGE = exact concise proposal / NONE
REQUIRED_ACL_CHANGE = exact concise proposal / NONE
JS_DEFENSE_IN_DEPTH = RECOMMENDED / NOT_RECOMMENDED / UNPROVEN
JS_DEFENSE_IN_DEPTH_DESIGN = concise proposal / NONE
CURRENT_CONTROLLED_UAT_IDENTITY = actual code or UNRESOLVED
PRODUCTION_HR_NATIVE_ENTITY = exact type+identifier / UNRESOLVED_WITHOUT_BROAD_DIRECTORY_ENUMERATION
SANDBOX_HR_ASSIGNEE_STRATEGY = exact concise strategy
PRODUCTION_HR_ASSIGNEE_STRATEGY = exact concise strategy / PENDING_ENTITY_CONFIRMATION
MINIMUM_CONTROLLED_IDENTITIES_FOR_HR_STAGE_UAT = actual integer / UNRESOLVED
NEGATIVE_NON_HR_TEST_IDENTITY_REQUIREMENT = exact role requirement
REAL_USER_IMPACT = 0
REAL_HR_WORKFLOW_TEST_REQUIRED = NO
REAL_HR_NOTIFICATION_TEST_REQUIRED = NO
PRODUCTION_PARITY_METHOD = concise method
PROPOSED_EXECUTION_SEQUENCE = exact minimal rounds
KINTONE_GET_CALLS_THIS_TASK = actual
KINTONE_WRITES_THIS_TASK = 0
WORKFLOW_ACTION_EXECUTED = 0
WORKFLOW_NOTIFICATION_TRIGGERED = 0
SRC_CHANGE_COUNT = 0
DIST_CHANGE_COUNT = 0
TEST_CHANGE_COUNT = 0
CONFIRMED_BASELINE_CONFLICT_COUNT = actual
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW BEFORE ANY REPAIR WRITE
```

Push same branch and STOP.
