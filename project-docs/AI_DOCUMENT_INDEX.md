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
8. `project-docs/CONFIRMED_BASELINE/README.md`;
9. only directly relevant Baseline/source/evidence.

## 2. Current checkpoint

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = CORRECTIVE REQUIRED / NOT CLOSED
R3-R31_IMPLEMENTATION_COMMIT = 37325d8279c6e0a19072ca9593a9feda2f9c6174
R3-R31_SCOPE_REVIEW = PASS
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
R3-R31_PROOF_REVIEW = FAIL / FAIL-CLOSED INVENTORY COVERAGE INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 10 OF 20
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R32
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```

## 3. Current D2 routing

For the next gate read:
1. `CHAT_HANDOFF.md`;
2. `AI_CONTROL_CENTER.md`;
3. `AI_ACTIVE_TASK.md`;
4. `EXCEL_EXPORT.md`;
5. exact R3-R31 authorization and implementation diff in `tests/mbo-xlsx-ooxml-feasibility.test.js`.

R3-R32 is proposed TEST-ONLY to close only inventory extractor fail-closed coverage and exact tuple normalization. Reference-image production source remains frozen.
