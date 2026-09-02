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
R3-R34_IMPLEMENTATION_COMMIT = f2bace7e97080dd89e44ceb045ba7e5b7e4aaeec
R3-R34_SCOPE_REVIEW = PASS
REFERENCE_IMAGE_SOURCE_REVIEW = PASS / FROZEN
R3-R34_PROOF_REVIEW = FAIL / XML NCNAME-QNAME + REGRESSION RETENTION INCOMPLETE
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 13 OF 20
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP003-R3-R35
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
5. exact R3-R33 and R3-R34 diffs in `tests/mbo-xlsx-ooxml-feasibility.test.js`.

R3-R35 is proposed TEST-ONLY to restore accepted R3-R33 adversarial proof and close XML Name/NCName/QName syntax validation. Reference-image production source remains frozen.
