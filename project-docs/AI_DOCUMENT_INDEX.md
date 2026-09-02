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
9. only directly relevant source/tests/Baseline.

## 2. Current checkpoint

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = CORRECTIVE REQUIRED / NOT CLOSED
R4_SOURCE_REVIEW = PASS / FROZEN
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054
R4-R1_IMPLEMENTATION_COMMIT = 8a49a9af11f03ec3c2d2e2e3b5cafebe5befd8c6
R4-R1_SCOPE_REVIEW = PASS
R4-R1_PROOF_REVIEW = FAIL / ACCEPTED ABSOLUTE PAGE-SETUP ASSERTIONS REGRESSED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 17 OF 20
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R4-R2
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
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

For R4-R2 continuation read:
1. `CHAT_HANDOFF.md`;
2. `AI_CONTROL_CENTER.md`;
3. `AI_ACTIVE_TASK.md`;
4. `EXCEL_EXPORT.md`;
5. `tests/mbo-xlsx-ooxml-feasibility.test.js` — proposed only writable file;
6. `scripts/export/mbo-xlsx-ooxml-feasibility.js` — READ-ONLY accepted R4 source.

R4-R2 is proposed only to restore the accepted absolute assertions `paperSize=8`, `orientation=landscape`, `scale=58` while retaining all R4-R1 proof. Do not reopen preservation/reference-image or modify Part B/renderer.
