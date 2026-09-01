# MBO2026 — AI DOCUMENT INDEX

> Purpose: open the right document immediately without repository archaeology.  
> Updated: 2026-09-01 ICT

## 1. Core startup — ChatGPT

Open in this order:
1. fresh current HEAD of `ai/antigravity-wp002c`;
2. `project-docs/CHAT_HANDOFF.md`;
3. `project-docs/AI_CONTROL_CENTER.md`;
4. `project-docs/AI_ACTIVE_TASK.md`;
5. `project-docs/AI_DOCUMENT_INDEX.md`;
6. `project-docs/00_MASTER_JOBLIST.md` when whole-project completeness matters;
7. `project-docs/EXCEL_EXPORT.md` for current D2 work;
8. `project-docs/CONFIRMED_BASELINE/README.md`;
9. only directly relevant Baseline/source/evidence routed below.

For a new chat, copy `NEW_CHAT_BOOTSTRAP_PROMPT.md` into the first message. Repository truth still wins over its embedded checkpoint.

## 2. Current project checkpoint

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2-WP003-R3-R22 = PASS / CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R23
AUTHORIZED_SCOPE = EXISTING FEASIBILITY SOURCE + TEST ONLY
AUTHORIZATION_DECISION_BASELINE_COMMIT = aca452faf4d3fc3ef82e957bd45f4e0874d9377e
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R23-SOURCE-20260901-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
PRIVACY_PURGE_REQUIRED = NO
D3 = HOLD UNTIL D2 PASS / CLOSED
ANTIGRAVITY = AUTHORIZED / EXECUTE ONCE / STOP AFTER COMMIT
```

Owner priority: `COMPLETE D2 FULLY BEFORE D3.`

## 3. D1 durable routing

For D1 status/reopen questions, read `CONFIRMED_BASELINE/D1_CLOSURE.md` first. Then only as relevant:
- `D1_AUTH_SECURITY.md`;
- `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`;
- `D1_SESSION_CONTINUITY.md`;
- `D1_EMPLOYEE_SELF_MY_MBO.md`;
- `EMPLOYEE_MASTER_ROUTING.md`;
- `ROUTING_WORKFLOW.md`;
- `UI_UX.md`;
- `D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md`.

D1 is frozen PASS/CLOSED unless a proven regression or explicit architecture change exists.

## 4. Employee lifecycle routing

For resignation, inactive status, transfer, Department/Section/Team change, promotion/Position change, Kintone-principal change or manager/appraiser lifecycle work, read first:

`CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md`

Then only as needed:
- `EMPLOYEE_MASTER_ROUTING.md`;
- `ROUTING_WORKFLOW.md`;
- `D1_CLOSURE.md`;
- `D1_AUTH_SECURITY.md` / `D1_SESSION_CONTINUITY.md`;
- exact D4 source/evidence.

Canonical split:

```text
Employee_Code = stable person identity
App53 = current employee/org/position truth
App795 = current route for fresh resolution
App794 = historical annual snapshot + current workflow truth
mid-cycle change = explicit HR-controlled amendment + audit
```

## 5. D2 routing — CURRENT ACTIVE PRIORITY

Read in this order:
1. `CHAT_HANDOFF.md`;
2. `AI_CONTROL_CENTER.md`;
3. `AI_ACTIVE_TASK.md`;
4. `EXCEL_EXPORT.md`;
5. exact current D2 feasibility source/tests named by the active/proposed WP;
6. exact SHA-verified owner templates only when required for evidence;
7. `SECURITY_MODEL.md` and D1 security Baselines only for export authorization/confidentiality review.

Current D2 checkpoint:
- R3-R22 proof isolation is PASS/CLOSED;
- exact-source validators pass but raw `outputAsync()` loses dimension evidence for Part A and all Part B worksheets;
- raw Part A/Part B fail closed with the workbook parity blocker;
- R3-R23 separate minimal exact-dimension preservation path is owner-authorized for the existing feasibility source/test only;
- do not start image/insertion/formula/renderer/PDF work until the separate preservation path is accepted;
- D3 remains HOLD.

## 6. Task -> document routing

| Task / Question | Open First | Then If Needed |
|---|---|---|
| New chat / handoff / resume | `CHAT_HANDOFF.md` | `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, `NEW_CHAT_BOOTSTRAP_PROMPT.md` |
| Current status / what next | `AI_CONTROL_CENTER.md` | `CHAT_HANDOFF.md`, `00_MASTER_JOBLIST.md` |
| Whole D1–D7 completeness | `00_MASTER_JOBLIST.md` | Control Center + relevant Baseline/evidence |
| Current executor/task instruction | `AI_ACTIVE_TASK.md` | exact named files only |
| D1 closure/audit/reopen | `CONFIRMED_BASELINE/D1_CLOSURE.md` | `TEST_STATUS.md`, exact D1 Baseline/runtime evidence |
| Employee lifecycle | `CONFIRMED_BASELINE/EMPLOYEE_LIFECYCLE_CHANGE_POLICY.md` | `EMPLOYEE_MASTER_ROUTING.md`, `ROUTING_WORKFLOW.md`, exact D4 evidence |
| AI workflow/review governance | `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` | `AI_HANDOFF_PROTOCOL.md`, `DOCUMENT_CONTROL.md` |
| Deploy/rollback/recovery | `CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md` | Control Center + exact deployment evidence |
| Source architecture/build ownership | `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` | exact source/tests/build scripts |
| D2 Excel/PDF | `EXCEL_EXPORT.md` | current feasibility source/tests, exact legacy samples, `SECURITY_MODEL.md` |
| D3 migration | `CONFIRMED_BASELINE/LEGACY_PMS_APPS.md` | exact legacy evidence; only after D2 closes per Owner priority |
| D4 HR Control Center | `AI_CONTROL_CENTER.md` | lifecycle Baseline + exact App800 source/evidence |
| D5 Copy Previous | `AI_CONTROL_CENTER.md` | exact copy service/test; fresh target-year route/identity required |
| D6 E2E/security | relevant Baselines | include lifecycle regression |
| D7 Admin Support Center | `AI_CONTROL_CENTER.md` | reopen only proven defect |

## 7. Current operational documents

Canonical/current-use:
- `AI_START_HERE.md`
- `CHAT_HANDOFF.md`
- `AI_CONTROL_CENTER.md`
- `AI_ACTIVE_TASK.md`
- `AI_DOCUMENT_INDEX.md`
- `00_MASTER_JOBLIST.md`
- `PROJECT_LATEST_SUMMARY.md`
- `NEW_CHAT_BOOTSTRAP_PROMPT.md`
- `OPEN_ISSUES.md`
- `TEST_STATUS.md`
- `EXCEL_EXPORT.md`

Compatibility snapshots:
- `CURRENT_STATE.md`
- `IMPLEMENTATION_STATUS.md`
- `HANDOFF.md`
- `PROJECT_CONTEXT.md`

Compatibility snapshots are not independent authorities. Always prefer canonical current-use docs above.

## 8. Default-ignore / historical

Do not read by default:
- `AI_REVIEW_PACKAGE.md`;
- `CHANGELOG_AI.md`;
- `TODAY_MBO_CLOSEOUT_MISSION.md`;
- `TOMORROW_HALF_DAY_MISSION.md`;
- older evidence docs unless directly relevant;
- old `architecture-redesign/`, `implementation/`, `legacy-analysis/`, `phase-3/` trees;
- abandoned `services/mbo-auth-bridge/`.

Git history/evidence is preserved for audit; do not rewrite historical evidence merely to make old wording current.

## 9. Review minimum read set

When user says `review`:

```text
fresh current HEAD
+ CHAT_HANDOFF
+ AI_CONTROL_CENTER
+ authorizing AI_ACTIVE_TASK
+ relevant Baseline(s)
+ exact authorization baseline -> implementation diff/evidence
```

For D2 add `EXCEL_EXPORT.md` and exact current feasibility source/tests. Do not trust executor self-report as independent PASS evidence.

## 10. Index maintenance

Update this index whenever canonical routing/current gate changes materially. Routine micro-status belongs in Control Center/Handoff/Active Task.
