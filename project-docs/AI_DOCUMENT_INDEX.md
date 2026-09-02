# MBO2026 — AI DOCUMENT INDEX

> Purpose: open the right document immediately without repository archaeology.  
> Updated: 2026-09-02 ICT

## 1. Fast startup — D2 continuation/review

Fresh-fetch current HEAD of `ai/antigravity-wp002c` first.

Read only:
1. `project-docs/D2_REVIEW_FAST_START.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. directly relevant `project-docs/CONFIRMED_BASELINE/` file
4. exact authorization→implementation diff
5. exact changed source/test files as needed

## 2. Current checkpoint

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
D2_PART_B_STRUCTURAL_GATE = PASS / CLOSED
D2_FORMULA_AUTHORITY_GATE = PASS / CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R7
R7_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
R7_AUTHORIZATION = D2-WP003-R7-SOURCE-TEST-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = a76bc4fe6619ba9c1f369b5ed18a70e7837ba816
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R7-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-SOURCE-TEST-20260902-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R7 / ONE-SHOT
CLAUDE = STOP
D3 = HOLD
```

## 3. Relevant durable D2 Baselines

Read only when directly relevant:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`

## 4. Active R7 file scope

Writable only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Full contract is in `AI_ACTIVE_TASK.md`. Production renderer, `MboExportService`, dependency changes, generated artifacts, Kintone/deploy/D3 are not authorized.

## 5. Remaining D2 after R7

1. production XLSX renderer/sanitizer;
2. combined Excel parity;
3. PDF parity;
4. export authorization/security/privacy regression;
5. final independent D2 closure.

The previous 20-round standing Control Plane authorization remains exhausted / DO NOT REUSE. R7 execution is one-shot only.