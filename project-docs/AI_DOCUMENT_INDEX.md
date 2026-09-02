# MBO2026 — AI DOCUMENT INDEX

> Purpose: open the right document immediately without repository archaeology.  
> Updated: 2026-09-02 ICT

## 1. Core startup — ChatGPT

1. fresh current HEAD of `ai/antigravity-wp002c`;
2. `project-docs/CHAT_HANDOFF.md`;
3. `project-docs/AI_CONTROL_CENTER.md`;
4. `project-docs/AI_ACTIVE_TASK.md`;
5. this file;
6. `project-docs/00_MASTER_JOBLIST.md` when whole-project completeness matters;
7. `project-docs/EXCEL_EXPORT.md` for D2;
8. directly relevant `CONFIRMED_BASELINE/` files;
9. exact source/tests only as needed.

## 2. Current checkpoint

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 18 OF 20
ACTIVE_WORK_PACKAGE = D2-WP003-R5
AUTHORIZED_SCOPE = SOURCE+TEST / EXACT TWO FEASIBILITY FILES ONLY
OWNER_APPROVAL_BASELINE_HEAD = 519312ca84b99091a3e863815a398688111dcb39
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R5-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R5-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R5 / ONE-SHOT
CLAUDE = STOP
D3 = HOLD
```

## 3. R5 routing

Read:
1. `CHAT_HANDOFF.md`;
2. `AI_CONTROL_CENTER.md`;
3. `AI_ACTIVE_TASK.md`;
4. `EXCEL_EXPORT.md`;
5. `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
6. `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Writable under R5 only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Goal: generalize and prove exact Part B 6/7/8 competency structural matrix. Do not touch privacy/sanitization, Part A, preservation/reference-image, renderer, Kintone, deploy or D3.

Expanded 7/8 privacy/address remapping remains a required future production-renderer/security checkpoint.