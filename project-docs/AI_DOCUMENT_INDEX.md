# MBO2026 — AI DOCUMENT INDEX

> Purpose: open the right document immediately without repository archaeology.  
> Updated: 2026-08-31 ICT

## 1. Core startup — ChatGPT

Open in this order:
1. current HEAD of `ai/antigravity-wp002c`;
2. `project-docs/CHAT_HANDOFF.md`;
3. `project-docs/AI_CONTROL_CENTER.md`;
4. `project-docs/AI_ACTIVE_TASK.md`;
5. `project-docs/AI_DOCUMENT_INDEX.md`;
6. `project-docs/00_MASTER_JOBLIST.md` when whole-project completeness is relevant;
7. `project-docs/CONFIRMED_BASELINE/README.md`;
8. only relevant Baseline/source/evidence routed below.

For a new chat, copy `NEW_CHAT_BOOTSTRAP_PROMPT.md` into the first message; it still requires fresh HEAD/repository reads.

## 2. Current project checkpoint

```text
D1 = KINTONE-ONLY / CLOSED PASS
FINAL_D1_SECURITY_REVIEW = PASS
D2 = READY / NOT STARTED
PRE_D2_DOCUMENTATION_SYNC = COMPLETE
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
```

D1 remains frozen unless a proven regression or explicit architecture change reopens it.

## 3. D1 durable routing

For D1 status/reopen questions, read `CONFIRMED_BASELINE/D1_CLOSURE.md` first. It is the durable final-status/supersession authority.

Then only as directly relevant:
- `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` — identity modes, App801 shared credentials, reset/security and security ceilings;
- `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` — App53 mapping contract, own-MBO self-appraiser elision and Dedicated native access;
- `CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md` — dedicated native continuity vs shared App801 bearer session;
- `CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md` — My MBO/history/no-delete;
- `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` — App53 source semantics;
- `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` — App795/effective requester/workflow topology;
- `CONFIRMED_BASELINE/UI_UX.md` — Hybrid Home / My MBO + My Approval Tasks;
- `CONFIRMED_BASELINE/D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md` — comments/history/attachment truthfulness.

Operational D1 closure evidence belongs in `AI_CONTROL_CENTER.md`, `TEST_STATUS.md` and `CHAT_HANDOFF.md`. Historical evidence files are not rewritten merely to remove older checkpoints. Pre-live/pre-closure status sentences in older D1 Baselines are superseded by `D1_CLOSURE.md`, while their detailed behavior/security contracts remain in force.

## 4. D2 routing

When Owner starts D2, read in this order:

1. `AI_CONTROL_CENTER.md`
2. `AI_ACTIVE_TASK.md`
3. `EXCEL_EXPORT.md`
4. existing export source/tests identified by read-only repository discovery
5. approved legacy Excel/PDF sample files available to the project
6. `SECURITY_MODEL.md` plus D1 security baselines only when export authorization/confidentiality is being reviewed

Do not broad-scan legacy trees. Use legacy source/sample material only as needed to prove original-format parity.

D2 pre-start requirements are defined in `EXCEL_EXPORT.md`; D2 is not active until Owner starts it.

## 5. Task -> document routing

| Task / Question | Open First | Then If Needed |
|---|---|---|
| New chat / handoff / resume | `CHAT_HANDOFF.md` | `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, `NEW_CHAT_BOOTSTRAP_PROMPT.md` |
| Current status / what next | `AI_CONTROL_CENTER.md` | `CHAT_HANDOFF.md`, `00_MASTER_JOBLIST.md` |
| Whole D1–D7 completeness | `00_MASTER_JOBLIST.md` | Control Center + relevant Baseline/evidence |
| Current executor/task instruction | `AI_ACTIVE_TASK.md` | exact named files only |
| D1 closure/audit/reopen | `CONFIRMED_BASELINE/D1_CLOSURE.md` | `TEST_STATUS.md`, exact detailed D1 Baseline/runtime evidence |
| AI workflow/review governance | `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` | `AI_HANDOFF_PROTOCOL.md`, `DOCUMENT_CONTROL.md` |
| Deploy/rollback/recovery | `CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md` | Control Center + exact deployment evidence |
| Source architecture/build ownership | `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` | exact source/tests/build scripts |
| D1 dedicated/shared identity/App801 | `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` | `D1_CLOSURE.md`, `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`, `D1_SESSION_CONTINUITY.md` |
| My Approval Tasks / dual-role | `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` | `D1_CLOSURE.md`, `ROUTING_WORKFLOW.md`, `UI_UX.md` |
| D2 Excel/PDF | `EXCEL_EXPORT.md` | existing export source/tests, approved legacy samples, `SECURITY_MODEL.md` |
| D3 migration | `CONFIRMED_BASELINE/LEGACY_PMS_APPS.md` | exact legacy evidence |
| D4 HR Control Center | `AI_CONTROL_CENTER.md` | exact App800 source/evidence |
| D5 Copy Previous | `AI_CONTROL_CENTER.md` | exact copy service/test |
| D6 E2E/security | relevant Baselines | exact tests/live evidence |
| D7 Admin Support Center | `AI_CONTROL_CENTER.md` | reopen only proven defect |

## 6. Current operational documents

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
- `EXCEL_EXPORT.md` for D2 pre-start/active scope.

Compatibility snapshots:
- `CURRENT_STATE.md`
- `IMPLEMENTATION_STATUS.md`
- `HANDOFF.md`
- `PROJECT_CONTEXT.md`

They are not independent authorities and must point back to the canonical current docs.

## 7. Default-ignore / historical

Do not read by default:
- `AI_REVIEW_PACKAGE.md`;
- `CHANGELOG_AI.md`;
- `TODAY_MBO_CLOSEOUT_MISSION.md`;
- `TOMORROW_HALF_DAY_MISSION.md`;
- older D1 evidence documents unless directly relevant;
- old `architecture-redesign/`, `implementation/`, `legacy-analysis/`, `phase-3/` trees;
- abandoned `services/mbo-auth-bridge/`.

Git history/evidence is preserved for audit; do not rewrite historical evidence merely to make old wording look current.

## 8. Review minimum read set

When user says `review`:

```text
current HEAD
+ CHAT_HANDOFF
+ AI_CONTROL_CENTER
+ authorizing AI_ACTIVE_TASK
+ relevant Baseline(s)
+ exact changed files/diff/evidence
```

For D2 review, add `EXCEL_EXPORT.md` and exact legacy samples/output evidence. For deploy/recovery add `ROLLBACK_RECOVERY_SAFETY.md`.

## 9. Index maintenance

Update this index only when canonical routing/document ownership/current gate routing changes materially. Routine micro-status belongs in Control Center/Handoff.
