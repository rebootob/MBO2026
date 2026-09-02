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
D2-WP003-R3-R30 = PASS / CLOSED
R3-R30_IMPLEMENTATION_COMMIT = d15261eadbc726ea87f11085253c026fedada381
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 8 OF 20
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_NEXT_D2_ACTION = REFERENCE-IMAGE CLOSURE
PREFERRED_EXECUTION = CHATGPT READ-ONLY REVIEW FIRST
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
D3 = HOLD
```

## 3. D2 routing — current priority

Read:
1. `CHAT_HANDOFF.md`;
2. `AI_CONTROL_CENTER.md`;
3. `AI_ACTIVE_TASK.md`;
4. `EXCEL_EXPORT.md`;
5. exact current reference-image source/tests for the next READ-ONLY closure review.

R3-R29 production preservation source is accepted. R3-R30 completed the missing TEST-ONLY proof and is PASS/CLOSED. The OOXML preservation gate is now PASS/CLOSED. GitHub has no independent CI/status/workflow signal for R3-R30, so no independent runtime claim is made.

Next use ChatGPT READ-ONLY review on existing reference-image handling before spending Antigravity or Claude credits.

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
