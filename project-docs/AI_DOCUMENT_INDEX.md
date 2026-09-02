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
REFERENCE_IMAGE_SOURCE_REVIEW = PASS
REFERENCE_IMAGE_PROOF_REVIEW = FAIL / FULL TARGET-NORMALIZED INVENTORY EQUALITY ABSENT
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 9 OF 20
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R31
AUTHORIZED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R3-R31-TEST-20260902-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R3-R31 / ONE BOUNDED COMMIT
CLAUDE = STOP / NOT NEEDED
D3 = HOLD
```

## 3. D2 routing — current priority

Read:
1. `CHAT_HANDOFF.md`;
2. `AI_CONTROL_CENTER.md`;
3. `AI_ACTIVE_TASK.md`;
4. `EXCEL_EXPORT.md`;
5. `tests/mbo-xlsx-ooxml-feasibility.test.js` as the only authorized write target;
6. current `scripts/export/mbo-xlsx-ooxml-feasibility.js` READ-ONLY as needed;
7. historical R3-R5 through R3-R9 review truth only when checking the recovered inventory-equality contract.

Current source is accepted and frozen for R3-R31. Missing closure proof is target-normalized exact equality for complete drawing-anchor, drawing-relationship and media path/hash inventories. Owner explicitly authorized R3-R31 TEST-ONLY on 2026-09-02.

## 4. Task -> document routing

| Task | Open First | Then If Needed |
|---|---|---|
| New chat / resume | `CHAT_HANDOFF.md` | Control Center + Active Task |
| Current status / next | `AI_CONTROL_CENTER.md` | Active Task |
| Whole D1–D7 | `00_MASTER_JOBLIST.md` | relevant Baselines |
| Current executor instruction | `AI_ACTIVE_TASK.md` | exact named files only |
| D2 Excel/PDF | `EXCEL_EXPORT.md` | current feasibility source/tests |
| D1 reopen/security | `CONFIRMED_BASELINE/D1_CLOSURE.md` | directly relevant D1 Baselines |
| Employee lifecycle | `CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md` | routing Baselines |
| AI governance | `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` | `DOCUMENT_CONTROL.md` |
| D3 migration | `CONFIRMED_BASELINE/LEGACY_PMS_APPS.md` | only after D2 closes |

## 5. Review minimum read set

`review` = fresh HEAD + Handoff + Control Center + current/authorizing Active Task + EXCEL_EXPORT for D2 + exact authorization-to-implementation diff/tests. Do not trust executor/second-reviewer self-report as final PASS evidence.
