# MBO2026 — AI DOCUMENT INDEX

> Purpose: open the right document immediately without repository archaeology.  
> Updated: 2026-09-02 ICT

## 1. Core startup — ChatGPT

Open in this order:
1. fresh current HEAD of `ai/antigravity-wp002c`;
2. `project-docs/CHAT_HANDOFF.md`;
3. `project-docs/AI_CONTROL_CENTER.md`;
4. `project-docs/AI_ACTIVE_TASK.md`;
5. `project-docs/AI_DOCUMENT_INDEX.md`;
6. `project-docs/00_MASTER_JOBLIST.md` when whole-project completeness matters;
7. `project-docs/EXCEL_EXPORT.md` for D2;
8. `project-docs/CONFIRMED_BASELINE/README.md`;
9. only directly relevant Baseline/source/evidence routed below.

## 2. Current project checkpoint

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS / BLOCKED
D2-WP003-R3-R22 = PASS / CLOSED
D2-WP003-R3-R23 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R24 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R25 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R26 = REVIEWED / BLOCKED / NOT CLOSED
R3-R26_IMPLEMENTATION_COMMIT = b8cd007483e6e3ffbdc5767571e4f90d34973d2b
CONTROL_PLANE_REVIEW_CORRECTIVE_ROUND = 4 OF 20
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = NONE
OWNER_DECISION_REQUIRED = D2-PRESERVATION-PARTB-SHEETPR-DECISION-01
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = STOP
CLAUDE = STOP
```

Owner priority: `COMPLETE D2 FULLY BEFORE D3.`

## 3. D2 routing — CURRENT PRIORITY

Read in this order:
1. `CHAT_HANDOFF.md`;
2. `AI_CONTROL_CENTER.md`;
3. `AI_ACTIVE_TASK.md`;
4. `EXCEL_EXPORT.md`;
5. exact current feasibility source/tests only when needed for the owner decision;
6. exact SHA-verified owner templates only when explicitly required;
7. D1/security Baselines only for export authorization/confidentiality review.

Current D2 checkpoint:
- R3-R22 accepted proof remains frozen;
- R3-R26 scope is valid but source/proof cannot close preservation;
- direct Part B raw round-trip `outBufB` is incompatible with the strict source-minus-dimension invariant because xlsx-populate injects an observed-only `sheetPr` in `Sheet1`;
- R3-R26 positive Part B proof pre-cleans a derivative buffer before preservation and therefore does not prove the direct raw path;
- regex-only XML element inventory remains incomplete/fail-open for valid names/prefixes outside its restricted patterns;
- Owner must choose strict redesign (Option A) or a narrow deterministic allowed-drift policy (Option B) before any further Antigravity work;
- no new Claude review is needed at this gate;
- D3 remains HOLD.

## 4. Task -> document routing

| Task / Question | Open First | Then If Needed |
|---|---|---|
| New chat / handoff / resume | `CHAT_HANDOFF.md` | `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md` |
| Current status / what next | `AI_CONTROL_CENTER.md` | `CHAT_HANDOFF.md`, `00_MASTER_JOBLIST.md` |
| Whole D1–D7 completeness | `00_MASTER_JOBLIST.md` | Control Center + relevant Baseline/evidence |
| Current executor/task instruction | `AI_ACTIVE_TASK.md` | exact named files only |
| D1 closure/audit/reopen | `CONFIRMED_BASELINE/D1_CLOSURE.md` | exact D1 Baseline/runtime evidence |
| Employee lifecycle | `CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md` | `EMPLOYEE_MASTER_ROUTING.md`, `ROUTING_WORKFLOW.md` |
| AI workflow/review governance | `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` | `DOCUMENT_CONTROL.md` |
| Source architecture/build ownership | `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` | exact source/tests/build scripts |
| D2 Excel/PDF | `EXCEL_EXPORT.md` | current feasibility source/tests, exact legacy samples |
| D3 migration | `CONFIRMED_BASELINE/LEGACY_PMS_APPS.md` | only after D2 closes |
| D4 HR Control Center | `AI_CONTROL_CENTER.md` | lifecycle Baseline + exact App800 source/evidence |
| D5 Copy Previous | `AI_CONTROL_CENTER.md` | exact copy service/test; fresh target-year route/identity |
| D6 E2E/security | relevant Baselines | include lifecycle regression |
| D7 Admin Support Center | `AI_CONTROL_CENTER.md` | reopen only proven defect |

## 5. Review minimum read set

When user says `review`:

```text
fresh current HEAD
+ CHAT_HANDOFF
+ AI_CONTROL_CENTER
+ authorizing/current AI_ACTIVE_TASK
+ EXCEL_EXPORT for D2
+ exact authorization baseline -> implementation diff/tests/evidence
```

Do not trust executor or second-reviewer self-report as final PASS evidence.

## 6. Index maintenance

Update this index whenever canonical routing/current gate changes materially.
