# AI ACTIVE TASK — R12B WORKFLOW RUNTIME ALIGNMENT FIX

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `80c4b4cf89909cdf702cdffd74fa2dc81e62c5ef`
> Mode: REPOSITORY FIX + TESTS ONLY
> Kintone write/deploy authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

R12A live discovery confirmed App794 Revision 33 has 16 states / 27 actions and all 17 active App795 routes are currently `M1_G1`. Review found two runtime correctness defects before Workflow UAT:

1. `STATUS_TO_STAGE_MAP` does not exactly match five live status names (`10`, `12`-`15`), causing `CONFIGURATION_ERROR` and fail-closed workflow blockage.
2. Current Process Management exposes First-Manager submit paths even though all live active routes are `M1_G1` and `First_Manager_User` is empty. Runtime must fail closed if an action does not match the record topology.

Canonical baseline was reconciled by Control Plane in commit `80c4b4cf...`; read it first.

# CHANGE GOVERNANCE

## What
Align runtime status resolution and workflow-action validation with the confirmed live App794/App795 baseline.

## Where
Prefer only:
- `src/config/constants.js`
- `src/main-mbo-app.js`
- `tests/objective-save-validation.test.js`
- deterministic `dist/mbo-employee-app.js`
- minimal living evidence docs after implementation

Do not create a new module unless technically unavoidable.

## How

### A. Exact live status alignment
Replace stale status keys so `STATUS_TO_STAGE_MAP` exactly recognizes all 16 confirmed live statuses:

- `01 Draft Objective` -> `OBJECTIVE_INPUT`
- `02 First Manager Objective Review` -> `READ_ONLY`
- `03 Manager Objective Review` -> `READ_ONLY`
- `04 GM Objective Review` -> `READ_ONLY`
- `05 Objective Approved` -> `READ_ONLY`
- `06 Employee Mid-Year` -> `MIDYEAR_INPUT`
- `07 First Manager Mid-Year Review` -> `READ_ONLY`
- `08 Manager Mid-Year Review` -> `READ_ONLY`
- `09 GM Mid-Year Review` -> `READ_ONLY`
- `10 Mid-Year Completed` -> `READ_ONLY`
- `11 Employee Self Evaluation` -> `SELF_EVALUATION`
- `12 First Manager Final Evaluation` -> `READ_ONLY`
- `13 Manager Final Evaluation` -> `READ_ONLY`
- `14 GM Final Evaluation` -> `READ_ONLY`
- `15 HR Final Check` -> `READ_ONLY`
- `16 Completed` -> `READ_ONLY`

Remove/replace stale aliases (`10 Mid-Year Approved`, `12 First Manager Evaluation`, `13 Manager Evaluation`, `14 GM Evaluation`, `15 Evaluation Completed`) from the runtime map. Unknown status must remain `CONFIGURATION_ERROR` / fail closed.

### B. Topology/action fail-closed guard
Add one small pure workflow-action validator in existing source and invoke it from `app.record.detail.process.proceed` before allowing transition.

Use the actual `event.action.value`, current process status, `Routing_Topology`, and relevant user fields. Required behavior:

1. Current `M1_G1` / `M1_G1_G2` entry actions may use only direct Manager submit actions:
   - `Submit Objective to Manager`
   - `Submit Mid-Year to Manager`
   - `Submit Final to Manager`
2. Topologies containing M2 (`M1_M2_G1`, `M1_M2_G1_G2`) must use the corresponding First-Manager submit action and require non-empty `First_Manager_User`; direct-Manager submit must fail closed.
3. First-Manager source states (`02`, `07`, `12`) require an M2 topology; if a non-M2 record somehow reaches one, block any proceed action fail-closed.
4. Any G2 topology is NOT supported by the current 16-state live Process Management. Fail closed at workflow entry with a clear configuration error until separately reviewed G2 process states/actions exist.
5. Required `Manager_User` / `GM_User` / `Requester_User` must not be empty for an action that hands work to that field.
6. Do not alter normal Approve/Return semantics for valid current `M1_G1` records.
7. Do not hide native buttons as an authorization control. This task is correctness/fail-closed logic; UI hiding can be later polish.

Return `false` and surface a clear inline/system validation message on invalid topology/action. Valid action must still return the original `event`.

## Why
Without exact status mapping, Mid-Year and Final transitions can be blocked by source/live drift. Without topology/action validation, users can choose an inapplicable First-Manager path and route to an empty assignee.

## Impact
Repository/runtime candidate becomes safe for isolated Workflow UAT after later controlled deploy. No live state changes in this task.

## Risks
- accidentally blocking valid Manager/GM approve/return actions;
- accepting an unsupported G2 path;
- weakening unknown-status fail-closed behavior;
- test-only logic diverging from runtime.

## Test Plan
Add focused regressions in existing test file:

1. All 16 exact live statuses resolve to expected business stages.
2. Each five stale status aliases no longer resolves as valid live status.
3. Unknown status -> `CONFIGURATION_ERROR`; process proceed returns `false`.
4. `M1_G1` + direct Manager submit -> PASS.
5. `M1_G1` + First Manager submit -> FAIL CLOSED.
6. `M1_M2_G1` + First Manager submit with populated `First_Manager_User` -> PASS.
7. `M1_M2_G1` + direct Manager submit -> FAIL CLOSED.
8. M2 path with empty `First_Manager_User` -> FAIL CLOSED.
9. G2 topology entry -> FAIL CLOSED.
10. Current valid `M1_G1` Manager/GM approve + return actions remain PASS.
11. Existing workflow hook success returns original event; invalid returns false.
12. Existing 0118/Profile/Hoshin/Save regressions remain green.
13. Build dist once; source/dist exactness + classic parse PASS.
14. Run targeted tests first, then one full `npm test` only.

## Rollback Plan
Repository-only revert to Starting HEAD if regressions fail. No Kintone rollback because Kintone calls/writes are forbidden.

# HARD SAFETY BOUNDARY

- No Kintone GET/POST/PUT/DELETE.
- No App794 record/process/schema/customization/ACL write.
- No browser workflow action.
- No notification test.
- No App795/App53/App796 calls.
- No deployment.
- No UAT records/accounts.
- Do not change confirmed routing data or live Process Management.

# CREDIT-SAVING RULE

Read only the baseline plus the files named in scope. Do not do broad discovery. Do not inspect unrelated history. Make the minimum code/test change, targeted test, one full suite, one build, evidence, push and STOP.

# REQUIRED EVIDENCE

```text
R12B_WORKFLOW_RUNTIME_ALIGNMENT = COMPLETE / PARTIAL / BLOCKED
STARTING_HEAD = 80c4b4cf89909cdf702cdffd74fa2dc81e62c5ef
LIVE_STATUS_COUNT_COVERED = actual / 16
STALE_STATUS_ALIAS_COUNT_ACTIVE = actual
UNKNOWN_STATUS_FAIL_CLOSED = PASS/FAIL
M1_G1_DIRECT_MANAGER_ACTION = PASS/FAIL
M1_G1_FIRST_MANAGER_BLOCKED = PASS/FAIL
M1_M2_G1_FIRST_MANAGER_ACTION = PASS/FAIL
M1_M2_G1_DIRECT_MANAGER_BLOCKED = PASS/FAIL
M2_EMPTY_FIRST_MANAGER_FAIL_CLOSED = PASS/FAIL
G2_UNSUPPORTED_FAIL_CLOSED = PASS/FAIL
VALID_M1_G1_APPROVE_RETURN_REGRESSION = PASS/FAIL
WORKFLOW_HANDLER_SUCCESS_RETURNS_EVENT = PASS/FAIL
WORKFLOW_HANDLER_INVALID_RETURNS_FALSE = PASS/FAIL
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

Push same branch and STOP.