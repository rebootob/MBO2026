# AI ACTIVE TASK — R12B-R1 WORKFLOW FAIL-CLOSED CLOSURE

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed R12B candidate: `4d52cce0d54eb25d9c96c020bfe0be870dde826c`
> Mode: REPOSITORY FIX + TESTS ONLY
> Kintone write/deploy authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

R12B correctly aligned the 16 live App794 status names and added a topology/action guard, but independent review found two fail-closed gaps that must be closed before deployment or isolated Workflow UAT:

1. `validateWorkflowAction()` does not require `Routing_Topology` to be a recognized exact topology. Blank or unknown topology can be treated as a direct-manager route and can pass some Mid-Year/Final workflow actions because `ValidationEngine.validate()` returns early for READ_ONLY stages and routing presence is not globally revalidated there.
2. `Requester_User` is checked for Return actions only. R12A live Process Management shows additional successful transitions whose destination assignee is `Requester_User`; these must also fail closed when `Requester_User` is empty.

The canonical workflow baseline already reflects the live R12A process and must not be changed unless new evidence requires it.

# CHANGE GOVERNANCE

## What
Harden the existing R12B workflow-action validator so every supported topology is exact/fail-closed and every live transition that hands work to `Requester_User` validates that field before proceeding.

## Where
Prefer only:
- `src/validation/validation-engine.js`
- `tests/objective-save-validation.test.js`
- deterministic `dist/mbo-employee-app.js`
- minimal living evidence docs after implementation

Do not create a new module. Do not alter App794 Process Management or App795 routing data.

## How

### A. Exact topology whitelist / fail-closed
At the start of `ValidationEngine.validateWorkflowAction()` after extracting `Routing_Topology`:

Recognized architecture values are exactly:
- `M1_G1`
- `M1_M2_G1`
- `M1_G1_G2`
- `M1_M2_G1_G2`

Required behavior:
1. blank/missing topology -> FAIL CLOSED;
2. any unknown/non-exact topology -> FAIL CLOSED;
3. `M1_G1` -> supported current live topology;
4. `M1_M2_G1` -> generic M2 path may pass validator when its required First Manager/Manager/GM fields are populated, preserving current source architecture;
5. both G2 variants remain recognized but MUST FAIL CLOSED because the current 16-state App794 Process Management has no G2 states/actions.

Do not infer topology using arbitrary substring matching before the exact whitelist gate.

### B. Complete Requester_User hand-off guard
R12A live Process Management assigns the destination state to `Requester_User` for the following successful/self transitions in addition to Return actions. Require non-empty `Requester_User` for each exact status/action pair:

- status `04 GM Objective Review` + action `Approve Objective` -> `05 Objective Approved`;
- status `05 Objective Approved` + action `Start Mid-Year` -> `06 Employee Mid-Year`;
- status `09 GM Mid-Year Review` + action `Approve Mid-Year GM` -> `10 Mid-Year Completed`;
- status `10 Mid-Year Completed` + action `Start Self Evaluation` -> `11 Employee Self Evaluation`;
- all existing Return actions that route back to employee/requester states.

Keep existing Manager_User, GM_User and First_Manager_User hand-off checks.

Do not invent an HR user field. `14 GM Final Evaluation -> 15 HR Final Check` uses live HR-group configuration and will be handled separately in isolated-UAT planning; this repository task must not change it.

### C. Preserve valid current M1_G1 behavior
For valid `M1_G1` records with populated Requester/Manager/GM fields, ensure normal live actions continue to pass:
- Objective: direct submit, Manager approve/return, GM approve/return, Start Mid-Year;
- Mid-Year: direct submit, Manager approve/return, GM approve/return, Start Self Evaluation;
- Final: direct submit, Manager approve/return, GM return; `Approve Final GM` must not be altered by this task beyond existing validation because HR-group isolation is a later UAT concern.

# Why
The project baseline requires missing routing and workflow/action inconsistencies to fail closed. A blank/unknown topology must never silently behave like `M1_G1`, and a transition must not proceed when the user field that owns the destination status is empty.

# Expected Impact
Repository candidate becomes sufficiently fail-closed for controlled deployment review. No live Kintone state changes occur in this task.

# Risks
- over-blocking valid M1_G1 actions;
- accidentally removing generic M2 architecture support;
- confusing HR-group assignment with Requester_User assignment;
- source/dist divergence.

# Test Plan
Add focused regression assertions in the existing test file:

1. blank `Routing_Topology` + Mid-Year direct Manager submit -> FAIL CLOSED;
2. unknown topology + Final direct Manager submit -> FAIL CLOSED;
3. exact `M1_G1` direct actions remain PASS;
4. exact `M1_M2_G1` First Manager path remains PASS with populated First_Manager_User;
5. both G2 exact variants -> FAIL CLOSED;
6. status 04 `Approve Objective` with empty Requester_User -> FAIL CLOSED; populated -> PASS;
7. status 05 `Start Mid-Year` with empty Requester_User -> FAIL CLOSED; populated -> PASS;
8. status 09 `Approve Mid-Year GM` with empty Requester_User -> FAIL CLOSED; populated -> PASS;
9. status 10 `Start Self Evaluation` with empty Requester_User -> FAIL CLOSED; populated -> PASS;
10. representative Return action with empty Requester_User -> FAIL CLOSED;
11. valid M1_G1 Manager/GM approve and return regressions across Objective, Mid-Year and Final remain PASS;
12. existing 16-status exactness, stale-alias, 0118/Profile/Hoshin/Save regressions remain green;
13. targeted tests first, then exactly one full `npm test`;
14. build dist once; source/dist exactness + classic bundle parse PASS.

## Rollback Plan
Repository-only revert to reviewed R12B candidate `4d52cce0d54eb25d9c96c020bfe0be870dde826c` if regressions fail. No Kintone rollback because all Kintone calls/writes are forbidden.

# HARD SAFETY BOUNDARY

- No Kintone GET/POST/PUT/DELETE.
- No App794 record/process/schema/customization/ACL write.
- No browser workflow action.
- No notification test.
- No App795/App53/App796 calls.
- No deployment.
- No UAT records/accounts.
- No baseline change unless a genuine new conflict is discovered; if so STOP and report.

# CREDIT-SAVING RULE

Read only canonical baseline plus the R12B candidate files named above. Do not do broad discovery or unrelated history. Make the minimum source/test/dist correction, run targeted test, one full suite, one build, append evidence, push and STOP.

# REQUIRED EVIDENCE

```text
R12B_R1_WORKFLOW_FAIL_CLOSED_CLOSURE = COMPLETE / PARTIAL / BLOCKED
REVIEWED_R12B_CANDIDATE = 4d52cce0d54eb25d9c96c020bfe0be870dde826c
EXACT_TOPOLOGY_WHITELIST = PASS/FAIL
BLANK_TOPOLOGY_FAIL_CLOSED = PASS/FAIL
UNKNOWN_TOPOLOGY_FAIL_CLOSED = PASS/FAIL
M1_G1_VALID_PATH_REGRESSION = PASS/FAIL
M1_M2_G1_VALID_PATH_REGRESSION = PASS/FAIL
G2_EXACT_VARIANTS_FAIL_CLOSED = PASS/FAIL
REQUESTER_HANDOFF_STATUS04_APPROVE = PASS/FAIL
REQUESTER_HANDOFF_STATUS05_START_MIDYEAR = PASS/FAIL
REQUESTER_HANDOFF_STATUS09_APPROVE_MIDYEAR_GM = PASS/FAIL
REQUESTER_HANDOFF_STATUS10_START_SELF_EVAL = PASS/FAIL
RETURN_REQUESTER_EMPTY_FAIL_CLOSED = PASS/FAIL
VALID_M1_G1_APPROVE_RETURN_STAGE_COVERAGE = PASS/FAIL
LIVE_STATUS_COUNT_COVERED = 16 / 16
STALE_STATUS_ALIAS_COUNT_ACTIVE = 0
SOURCE_DIST_EXACTNESS = PASS/FAIL
CLASSIC_BUNDLE_PARSE = PASS/FAIL
npm test = actual / PASS|FAIL
KINTONE_CALLS_THIS_TASK = 0
KINTONE_WRITES_THIS_TASK = 0
SRC_CHANGE_COUNT = actual
DIST_CHANGE_COUNT = actual
TEST_CHANGE_COUNT = actual
GIT_DIFF_CHECK = PASS/FAIL
CONFIRMED_BASELINE_CONFLICT_COUNT = 0
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW BEFORE ANY DEPLOY OR UAT WRITE
```

Append one concise R12B-R1 evidence block to `project-docs/AI_REVIEW_PACKAGE.md`; update CURRENT_STATE/HANDOFF minimally. Do not create new evidence files.

Push same branch and STOP.