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

## 2. Non-negotiable D1 routing

```text
D1 = KINTONE-ONLY / CLOSED PASS
Auth Bridge = CANCELLED / SUPERSEDED
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
FINAL_D1_SECURITY_REVIEW = PASS
```

Durable D1 truth:
- `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` — identity modes, App801 shared credentials, reset/security, security ceilings;
- `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` — App53 dedicated mapping design, own-MBO self-appraiser elision, dedicated native access;
- `CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md` — dedicated native continuity vs shared App801 bearer session;
- `CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md` — My MBO/history/no-delete;
- `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` — App53 source semantics;
- `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` — App795/effective requester/workflow topology;
- `CONFIRMED_BASELINE/UI_UX.md` — Hybrid Home / My MBO + My Approval Tasks;
- `CONFIRMED_BASELINE/D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md` — comments/history/attachment truthfulness.

Current operational D1 closure evidence belongs in `AI_CONTROL_CENTER.md`, `TEST_STATUS.md` and `CHAT_HANDOFF.md`.

## 3. Antigravity startup

Antigravity opens only:
1. `AI_CONTROL_CENTER.md`;
2. `AI_ACTIVE_TASK.md`;
3. exact files/Baselines named by Active Task.

No broad scan. Use Antigravity only when User + ChatGPT cannot reasonably perform the necessary work safely.

## 4. Task -> document routing

| Task / Question | Open First | Then If Needed |
|---|---|---|
| New chat / handoff / resume | `CHAT_HANDOFF.md` | `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, `NEW_CHAT_BOOTSTRAP_PROMPT.md` |
| Current status / what next | `AI_CONTROL_CENTER.md` | `CHAT_HANDOFF.md`, `00_MASTER_JOBLIST.md` |
| Whole D1–D7 completeness | `00_MASTER_JOBLIST.md` | Control Center + relevant Baseline/evidence |
| Current executor/task instruction | `AI_ACTIVE_TASK.md` | exact named files only |
| D1 closure/audit/reopen | `TEST_STATUS.md` | `D1_AUTH_SECURITY.md`, `D1_SESSION_CONTINUITY.md`, `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` |
| AI workflow/review governance | `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` | `AI_HANDOFF_PROTOCOL.md`, `DOCUMENT_CONTROL.md` |
| Deploy/rollback/recovery | `CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md` | Control Center + exact deployment evidence |
| Source architecture/build ownership | `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` | exact source/tests/build scripts |
| App794 UI runtime/CSS/comment debugging | `skills/mbo-kintone-ui-runtime-debugging/SKILL.md` | `UI_UX.md`, exact source/deploy evidence |
| D1 dedicated/shared identity/App801/reset | `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` | `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`, `D1_SESSION_CONTINUITY.md` |
| App53 mapping / dedicated identity / own route | `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` | `EMPLOYEE_MASTER_ROUTING.md`, exact App53 evidence |
| My Approval Tasks / dual-role | `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` | `ROUTING_WORKFLOW.md`, `UI_UX.md`, exact App794 Assignee evidence |
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
- `AI_ACTIVE_TASK.md` — exact current task packet / wait state;
- `00_MASTER_JOBLIST.md` — D1–D7 completeness;
- `PROJECT_LATEST_SUMMARY.md` — human-readable checkpoint;
- `NEW_CHAT_BOOTSTRAP_PROMPT.md` — canonical new-chat copy/paste prompt;
- `OPEN_ISSUES.md` — open gates/dependencies;
- `TEST_STATUS.md` — accepted test/UAT checkpoint.

Compatibility snapshots are not independent authorities.

## 6. Current operational checkpoint

```text
D1 = PASS / CLOSED
FINAL_D1_SECURITY_REVIEW = PASS
APP794 Rev67
Runtime source commit = c6864d09f59cfaf6e7c86da422452a816a5cf430
Dedicated core + ACL/privacy = PASS
Shared App801/session runtime = PASS
Comments/history/attachments runtime truthfulness = PASS
Dedicated live dual-role = PASS
Synthetic Record #13 = deleted
Synthetic Record #14 = deleted
Current active work package = NONE
Recommended next = D2 Excel + PDF Original/Legacy Format
Owner decision required before starting next package
Antigravity = NONE
Kintone write authorization = NONE
```

D1 closure retains two explicit Kintone-only ceilings:

```text
SHARED_DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED
DEDICATED_DIRECT_REST_CREATE_FIELD_INTEGRITY = LIMITED BY NATIVE APP794 ADD PERMISSION
```

## 7. Default-ignore / historical

Do not read by default:
- `AI_REVIEW_PACKAGE.md`;
- `CHANGELOG_AI.md`;
- old evidence documents unless directly relevant;
- old `architecture-redesign/`, `implementation/`, `legacy-analysis/`, `phase-3/` trees;
- `services/mbo-auth-bridge/` — abandoned experiment.

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

For deploy/recovery add `ROLLBACK_RECOVERY_SAFETY.md`. For D1 reopen/security audit use the D1 identity/access/session/routing/UI Baselines above.

## 9. Index maintenance

Update this index only when canonical routing/document ownership/current gate routing changes materially. Routine micro-status belongs in Control Center/Handoff.
