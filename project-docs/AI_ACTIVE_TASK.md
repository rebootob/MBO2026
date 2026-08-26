# AI ACTIVE TASK — R12A READ-ONLY WORKFLOW COVERAGE DISCOVERY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `c5b75e14f6bf161fd63724fce56b3aa2738a94fb`
> Last verified live App794: Revision `33`
> Mode: READ-ONLY KINTONE DISCOVERY + UAT COVERAGE MATRIX ONLY
> Kintone write/deploy authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

User has explicitly decided that Workflow UAT must NOT send a real workflow to real managers/GM as a final production-like test. The UAT design must achieve high confidence with zero real-user workflow/notification impact by using read-only certification plus isolated UAT accounts/records in later phases.

This R12A task is discovery only. It must not execute any workflow action.

# CHANGE GOVERNANCE

## What
Read the live App794 Process Management definition and all 17 active App795 routing rows, then produce the minimum complete Workflow UAT coverage matrix.

## Where
Read-only only:
- App794 live Process Management configuration.
- App794 live form field metadata only as needed to identify workflow assignee/routing snapshot field codes and field types.
- App795 active routing records (expected 17).
- Existing confirmed baseline only for comparison.

Repository output only:
- append one concise R12A evidence/matrix section to `project-docs/AI_REVIEW_PACKAGE.md`;
- update CURRENT_STATE/HANDOFF only minimally if needed.

Do not create new evidence files.

## How
1. Pull branch and require local HEAD == origin HEAD.
2. Confirm the only new commit after R11 execution is this Control Plane task commit.
3. Perform the minimum Kintone GET calls necessary.
4. Read App794 live Process Management and extract exact live states, actions, source status, destination status, assignee type/configuration and any filter/condition relevant to routing.
5. Read App795 exactly once using an active-row query sufficient to return all active rows; expected count = 17.
6. For each route derive topology strictly from actual populated approver fields:
   - `M1_G1`
   - `M1_M2_G1`
   - `M1_G1_G2`
   - `M1_M2_G1_G2`
   If another live topology exists, report it; do not force it into one of these labels.
7. Capture Manager L1/L2 and GM L1/L2 approver counts and approval rules (`ANY`/`ALL` or actual live values).
8. Cross-check TMG1/TMG2 exact team routing against confirmed baseline. Missing Team, missing exact route, duplicate route, or section fallback must remain fail-closed.
9. Map each live workflow action/status to the App794 snapshot/user field(s) Kintone actually uses. Do not infer only from JavaScript aliases.
10. Produce a minimum UAT coverage design that covers every unique live topology, every approval rule pattern, every workflow stage type, and every reject/resubmit path without sending workflow to real approvers.

## Why
We need strong workflow confidence while preventing notifications/tasks from reaching real managers and GM during UAT.

## Expected Impact
Zero live data/config changes. R12A should tell ChatGPT exactly how many isolated UAT records and controlled test accounts are required before any workflow write is authorized.

## Risks
- confusing source-level intended routing with actual live Process Management;
- under-testing multi-approver ANY/ALL behavior;
- assuming four topologies when live data contains fewer/more;
- accidentally triggering workflow or notification.

## Test / Verification Plan
This is a read-only evidence task. Verify:
- App795 active row count = 17 or report exact mismatch;
- no duplicate active Routing_Key;
- topology count/distribution sums to active route count;
- all TMG rows match baseline exactly;
- every populated Manager/GM approval level is represented in the UAT matrix;
- every approval rule pattern used live is represented;
- every App794 Process action is accounted for in the matrix or explicitly classified as out-of-scope with reason;
- no Kintone write endpoints/actions occur.

## Rollback Plan
None required because Kintone writes are forbidden. Repository docs-only result can be reverted if evidence is wrong.

# HARD SAFETY BOUNDARY

FORBIDDEN in R12A:
- no App794 record create/update/delete;
- no Process Action / status transition;
- no App794 process-management write;
- no App794 schema/customization/ACL write;
- no App795/App53/App796 write;
- no browser clicking workflow buttons;
- no notification test;
- no source/dist/test change;
- no deploy;
- no creation of UAT accounts or records.

If any required information cannot be obtained read-only, report `UNVERIFIABLE` and STOP. Do not substitute a write.

# CREDIT-SAVING RULE

Do NOT perform broad repository discovery.
Do NOT rerun npm tests.
Do NOT rebuild.
Do NOT inspect unrelated apps/history.
Do NOT perform browser smoke.
Do NOT fetch all App53 employees.
Do NOT evaluate all employees individually.

Use live App794 Process Management + App795 17 active rows as the primary evidence. One read of App795 should be enough.

# REQUIRED MATRIX OUTPUT

## A. App794 Process Matrix
For every live action provide:
- Action name
- From status
- To status
- Assignee/actor configuration
- Relevant snapshot/user field(s)
- Approval semantics if visible
- Reject/resubmit relationship

## B. App795 Route Coverage Matrix
For all 17 active routes provide at minimum:
- Routing_Key
- Section_Code
- Team
- M1 count + rule
- M2 count + rule
- G1 count + rule
- G2 count + rule
- Derived topology
- TMG exact-route baseline check PASS/FAIL/NA

Do not expose unnecessary personal data beyond user codes required for technical routing evidence.

## C. Coverage Summary
Provide:
- `ACTIVE_ROUTE_COUNT`
- `UNIQUE_TOPOLOGY_COUNT`
- topology distribution
- approval-rule patterns actually present
- `MAX_CONCURRENT_APPROVERS_AT_ONE_STAGE`
- stages where ALL semantics require >1 independent approver
- stages where ANY semantics with >1 approver require independent coverage
- minimum controlled UAT account count needed to prove semantics correctly
- minimum isolated UAT record count
- which records can be reused for Reject/Resubmit to reduce record count
- whether one controlled account is insufficient and why

## D. Proposed UAT Cases
Create IDs `UAT-WF-01...N` with:
- topology/rule pattern covered
- required number of controlled accounts
- happy path stages covered
- reject stage(s) covered
- resubmit stage(s) covered
- expected notification/assignment recipient = TEST ACCOUNT(S) ONLY
- real-user impact = 0

Coverage rule: every unique topology + every live ANY/ALL pattern + every Manager/GM level + reject/resubmit must be covered at least once.

# REQUIRED FINAL EVIDENCE BLOCK

```text
R12A_WORKFLOW_COVERAGE_DISCOVERY = COMPLETE / PARTIAL / BLOCKED
LIVE_APP794_REVISION = actual
APP794_PROCESS_GET = PASS/FAIL
APP795_ACTIVE_ROUTE_COUNT = actual
APP795_EXPECTED_17 = PASS/FAIL
DUPLICATE_ACTIVE_ROUTING_KEY_COUNT = actual
TMG_BASELINE_MATCH = PASS/FAIL
UNIQUE_TOPOLOGY_COUNT = actual
TOPOLOGY_DISTRIBUTION = actual
APPROVAL_RULE_PATTERNS = actual
MAX_CONCURRENT_APPROVERS_AT_ONE_STAGE = actual
MINIMUM_CONTROLLED_UAT_ACCOUNT_COUNT = actual
MINIMUM_ISOLATED_UAT_RECORD_COUNT = actual
ALL_LIVE_PROCESS_ACTIONS_COVERED_BY_MATRIX = PASS/FAIL
REJECT_RESUBMIT_COVERAGE_PLANNED = PASS/FAIL
REAL_USER_WORKFLOW_EXECUTED = NO
REAL_USER_NOTIFICATION_TRIGGERED = NO
KINTONE_GET_CALLS = actual
KINTONE_WRITE_CALLS = 0
APP794_RECORD_WRITE = 0
APP794_PROCESS_WRITE = 0
APP794_SCHEMA_WRITE = 0
APP794_CUSTOMIZE_WRITE = 0
APP795_WRITE = 0
APP53_WRITE = 0
APP796_WRITE = 0
SRC_CHANGE_COUNT = 0
DIST_CHANGE_COUNT = 0
TEST_CHANGE_COUNT = 0
GIT_DIFF_CHECK = PASS/FAIL
CONFIRMED_BASELINE_CONFLICT_COUNT = actual
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW AND FINAL UAT MATRIX APPROVAL BEFORE ANY WRITE
```

Push same branch and STOP.