# MBO2026 — AI DOCUMENT INDEX

> Purpose: open the right document immediately without repository archaeology. Updated 2026-09-02 ICT.

## Fast startup — D2 continuation/review

Fresh-fetch current HEAD of `ai/antigravity-wp002c`, then read:
1. `project-docs/D2_REVIEW_FAST_START.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. directly relevant `project-docs/CONFIRMED_BASELINE/` file
4. exact authorization→implementation diff
5. changed source/test files only as needed

## Current checkpoint

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
D2_PART_B_STRUCTURAL_GATE = PASS / CLOSED
D2_FORMULA_AUTHORITY_GATE = PASS / CLOSED
D2_PART_B_EXPANDED_PRIVACY_GATE = CORRECTIVE REQUIRED / NOT CLOSED
R7_IMPLEMENTATION_COMMIT = 993f3bfcc04bd02b0026a677fa5cb10a12c5d5b6
D2-WP003-R7-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
ACTIVE_WORK_PACKAGE = D2-WP003-R7-R1
R7-R1_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
R7-R1_AUTHORIZATION = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = ff4b830cef3301e15f4571b3abe0c7d1ef7fdfe3
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R7-R1 / ONE-SHOT
CLAUDE = STOP
D3 = HOLD
```

## Relevant durable D2 Baselines

Read only when directly relevant:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`

No R7 privacy Baseline exists yet because the gate is not closed.

## R7-R1 scope shortcut

Writable only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Correct only:
- row30/row30-clone non-dynamic role semantics;
- exact dynamic counts 432/474/516;
- source-backed expanded fail-closed structural-role validation;
- expanded N6/N7/N8 package/sharedStrings privacy-safe synthetic token purge proof.

Production renderer remains a later gate. Previous 20-round standing Control Plane authorization remains exhausted / DO NOT REUSE.
