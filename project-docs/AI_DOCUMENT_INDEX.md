# MBO2026 — AI DOCUMENT INDEX

> Purpose: open the right document immediately without repository archaeology.  
> Updated: 2026-09-02 ICT

## 1. Core startup — ChatGPT

Open in this order:
1. fresh current HEAD of `ai/antigravity-wp002c`;
2. `project-docs/CHAT_HANDOFF.md`;
3. `project-docs/AI_CONTROL_CENTER.md`;
4. `project-docs/AI_ACTIVE_TASK.md`;
5. this `AI_DOCUMENT_INDEX.md`;
6. `project-docs/00_MASTER_JOBLIST.md` when whole-project completeness matters;
7. `project-docs/EXCEL_EXPORT.md` for D2;
8. `project-docs/CONFIRMED_BASELINE/README.md` and directly relevant closure Baselines;
9. only directly relevant source/tests.

## 2. Current checkpoint

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054 / FROZEN
R4-R2_IMPLEMENTATION_COMMIT = 98da94a07259effd95dcf539de3454b1f94745a8
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 18 OF 20
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R5
PROPOSED_SCOPE = SOURCE+TEST / EXACT TWO FEASIBILITY FILES ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```

## 3. Current D2 routing

For R5 planning/authorization/review read:
1. `CHAT_HANDOFF.md`;
2. `AI_CONTROL_CENTER.md`;
3. `AI_ACTIVE_TASK.md`;
4. `EXCEL_EXPORT.md`;
5. `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md` only if Part A comparison is needed;
6. `scripts/export/mbo-xlsx-ooxml-feasibility.js` — proposed Part B helper source scope only;
7. `tests/mbo-xlsx-ooxml-feasibility.test.js` — proposed Part B structural proof scope only.

R5 is proposed to generalize the existing hard-coded Part B 6/8 path into a real 6/7/8 competency matrix and prove exact structural/workbook invariants. It is NOT authorized. Do not call Antigravity or Claude until Owner approval.

## 4. Future D2 privacy routing note

The accepted Part B privacy mapping remains source-template authority for the original 6-block layout. Expanded 7/8-block address roles must be explicitly remapped during production renderer/security work; R5 must not change privacy/sanitization logic.
