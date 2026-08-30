# MBO2026 — AI DOCUMENT INDEX

> Purpose: open the right document immediately without repository archaeology.  
> Updated: 2026-08-30 20:45 ICT

## 1. Core startup — ChatGPT

Open in this order:
1. current HEAD of `ai/antigravity-wp002c`;
2. `project-docs/CHAT_HANDOFF.md`;
3. `project-docs/AI_CONTROL_CENTER.md`;
4. `project-docs/AI_DOCUMENT_INDEX.md`;
5. `project-docs/AI_ACTIVE_TASK.md` when execution/review is involved;
6. `project-docs/CONFIRMED_BASELINE/README.md`;
7. only the relevant Baseline/source/evidence routed below.

For detailed D1–D7 closure criteria read `00_MASTER_JOBLIST.md` only when needed.
For a new chat, copy `NEW_CHAT_BOOTSTRAP_PROMPT.md` into the first message; it still requires fresh HEAD/repository reads.

## 2. Non-negotiable D1 routing

```text
D1 = KINTONE-ONLY
Auth Bridge = CANCELLED / SUPERSEDED
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

Current D1 durable truth is intentionally distributed:
- `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` — identity modes, App801 shared credentials, reset/security;
- `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` — App53 dedicated mapping design, own-MBO self-appraiser elision, dedicated native access target;
- `CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md` — dedicated native continuity vs shared App801 bearer session;
- `CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md` — My MBO/history/no-delete;
- `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` — App53 source semantics;
- `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` — App795/effective requester/workflow topology;
- `CONFIRMED_BASELINE/UI_UX.md` — Hybrid Home / My MBO + My Approval Tasks;
- `CONFIRMED_BASELINE/D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md` — comments/history/attachment truthfulness.

Current operational facts such as completed App53 audit, accepted source commits and current gate belong in `AI_CONTROL_CENTER.md` / `CHAT_HANDOFF.md`, not duplicated into Baselines.

## 3. Antigravity startup

Antigravity opens only:
1. `AI_CONTROL_CENTER.md`;
2. `AI_ACTIVE_TASK.md`;
3. exact files/Baselines named by Active Task.

No broad scan.

## 4. Task -> document routing

| Task / Question | Open First | Then If Needed |
|---|---|---|
| New chat / handoff / resume | `CHAT_HANDOFF.md` | `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, `NEW_CHAT_BOOTSTRAP_PROMPT.md` |
| Current status / what next | `AI_CONTROL_CENTER.md` | `CHAT_HANDOFF.md`, `00_MASTER_JOBLIST.md` |
| Whole D1–D7 completeness | `00_MASTER_JOBLIST.md` | Control Center + relevant Baseline/evidence |
| Current executor instruction | `AI_ACTIVE_TASK.md` | exact named files only |
| AI workflow/review governance | `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` | `AI_HANDOFF_PROTOCOL.md`, `DOCUMENT_CONTROL.md` |
| Deploy/rollback/recovery | `CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md` | Control Center + exact deployment evidence |
| Source architecture/build ownership | `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` | exact source/tests/build scripts |
| App794 UI runtime/CSS/comment debugging | `skills/mbo-kintone-ui-runtime-debugging/SKILL.md` | `UI_UX.md`, exact source/deploy evidence |
| D1 dedicated/shared identity/App801/reset | `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` | `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`, `D1_SESSION_CONTINUITY.md` |
| App53 mapping / Natta-Vassana / own route | `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` | `EMPLOYEE_MASTER_ROUTING.md`, exact App53 evidence |
| My Approval Tasks / dual-role | `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` | `ROUTING_WORKFLOW.md`, `UI_UX.md`, exact App794 assignment source |
| Shared session continuity | `CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md` | `D1_AUTH_SECURITY.md` |
| My MBO/history/no-delete | `CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md` | exact UI/security source/test |
| Routing/App795/Team/executive | `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` | `EMPLOYEE_MASTER_ROUTING.md` |
| Evaluation/scoring/App796 | `CONFIRMED_BASELINE/EVALUATION_CLASSES.md` | exact source/test |
| D2 Excel/PDF | `AI_CONTROL_CENTER.md` | `EXCEL_EXPORT.md`, legacy samples/source |
| D3 migration | `CONFIRMED_BASELINE/LEGACY_PMS_APPS.md` | exact legacy evidence |
| D4 HR Control Center | `AI_CONTROL_CENTER.md` | exact App800 source/evidence |
| D5 Copy Previous | `AI_CONTROL_CENTER.md` | exact copy service/test |
| D6 E2E/security | relevant Baselines | exact tests/live evidence |
| D7 Admin Support Center | `AI_CONTROL_CENTER.md` | reopen only proven defect |

## 5. Current operational documents

Canonical/current-use:
- `AI_START_HERE.md` — lean startup;
- `CHAT_HANDOFF.md` — concise current cross-chat handoff;
- `AI_CONTROL_CENTER.md` — accepted current status/gate/authorization;
- `AI_ACTIVE_TASK.md` — exact current execution packet;
- `00_MASTER_JOBLIST.md` — D1–D7 completeness;
- `PROJECT_LATEST_SUMMARY.md` — human-readable current checkpoint;
- `NEW_CHAT_BOOTSTRAP_PROMPT.md` — canonical new-chat copy/paste prompt;
- `OPEN_ISSUES.md` — open gates/dependencies;
- `TEST_STATUS.md` — latest accepted test/UAT checkpoint.

Compatibility snapshots:
- `CURRENT_STATE.md`;
- `IMPLEMENTATION_STATUS.md`;
- `HANDOFF.md`.
These now point back to the canonical Control/Handoff documents and are not independent authorities.

## 6. Default-ignore / historical

Do not read by default:
- `AI_REVIEW_PACKAGE.md`;
- `CHANGELOG_AI.md`;
- old evidence documents unless directly relevant;
- old `architecture-redesign/`, `implementation/`, `legacy-analysis/`, `phase-3/` trees;
- `services/mbo-auth-bridge/` — abandoned experiment.

Git history/evidence is preserved for audit; do not rewrite it merely to make old wording look current.

## 7. Review minimum read set

When user says `review`:

```text
current HEAD
+ CHAT_HANDOFF
+ AI_CONTROL_CENTER
+ authorizing AI_ACTIVE_TASK
+ relevant Baseline(s)
+ exact changed files/diff/evidence
```

For deploy/recovery add `ROLLBACK_RECOVERY_SAFETY.md`. For Hybrid Identity/dual-role use the D1 identity/access/session/routing/UI Baselines above.

## 8. Index maintenance

Update this index only when canonical routing/document ownership changes. Routine status changes belong in Control Center/Handoff.