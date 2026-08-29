# MBO2026 — AI DOCUMENT INDEX

> Purpose: open the right document immediately without searching/browsing the repository.
> Rule: **Use this index before any document search.** Search only when this index cannot route the task.

---

## 1. CORE STARTUP — ALL CHATGPT SESSIONS

Open only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/CONFIRMED_BASELINE/README.md`
3. `project-docs/AI_ACTIVE_TASK.md`
4. the relevant Baseline file from the routing table below
5. current Git HEAD + exact latest diff/evidence

Read `00_MASTER_JOBLIST.md` only when detailed D1–D7 acceptance/no-drop criteria are needed.

---

## 2. NON-NEGOTIABLE D1 ROUTING RULE

```text
D1 authentication = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / SUPERSEDED
```

Do not revive Auth Bridge from historical chat, commits, or `services/mbo-auth-bridge/`. Current truth is in `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`.

---

## 3. ANTIGRAVITY STARTUP

Antigravity opens only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. exact source/config files named by `AI_ACTIVE_TASK.md`

Do not broad-scan the repo.

---

## 4. TASK → DOCUMENT ROUTING

| Task / Question | Open First | Open Only If Needed |
|---|---|---|
| Current project status / what next | `AI_CONTROL_CENTER.md` | `00_MASTER_JOBLIST.md` |
| Current executor instruction | `AI_ACTIVE_TASK.md` | none |
| AI workflow / review governance | `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` | `CONFIRMED_BASELINE/DOCUMENT_CONTROL.md` |
| Source architecture / modular JS | `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` | exact affected source files |
| D1 login / password / App801 / shared Kintone account / App801 ACL | `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` | `CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`, exact live ACL evidence |
| D1 session token / reload / logout / password-session rotation | `CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md` | `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` |
| D1 My MBO history / Completed / no-delete | `CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md` | exact UI/security source/test |
| Routing / App795 / GM precedence / Team | `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` | `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` |
| App53 routing fields / Position / Team | `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` | `FIELD_DICTIONARY.md` |
| Evaluation/scoring class | `CONFIRMED_BASELINE/EVALUATION_CLASSES.md` | relevant source/test |
| App794 UI/UX | `CONFIRMED_BASELINE/UI_UX.md` | exact UI source/screenshots |
| D2 Excel/PDF export | `AI_CONTROL_CENTER.md` | `EXCEL_EXPORT.md`, exact export source, legacy sample evidence |
| D3 legacy migration | `CONFIRMED_BASELINE/LEGACY_PMS_APPS.md` | exact legacy source evidence only |
| D4 HR Control Center | `AI_CONTROL_CENTER.md` | exact App800/source files |
| D5 Copy Previous MBO | `AI_CONTROL_CENTER.md` | exact copy service/source |
| D6 E2E/security/regression | relevant Baselines for impacted D1–D5 | exact test evidence |
| D7 Admin Support Center | `AI_CONTROL_CENTER.md` | reopen only for new defect |
| Reusable Kintone technique | `skills/kintone/README.md` | exact skill file |

---

## 5. CONFIRMED BASELINE INDEX

Always start with `project-docs/CONFIRMED_BASELINE/README.md`, then only the domain needed:

- `AI_OPERATING_GOVERNANCE.md`
- `SOURCE_CODE_ARCHITECTURE.md`
- `DOCUMENT_CONTROL.md`
- `D1_AUTH_SECURITY.md` — current **KINTONE-ONLY** auth + App801 ACL/security model
- `D1_SESSION_CONTINUITY.md` — Kintone-only 8-hour same-tab session continuity
- `D1_EMPLOYEE_SELF_MY_MBO.md`
- `ROUTING_WORKFLOW.md`
- `EMPLOYEE_MASTER_ROUTING.md`
- `EVALUATION_CLASSES.md`
- `LEGACY_PMS_APPS.md`
- `UI_UX.md`

Do not open all files on every task.

---

## 6. CURRENT OPERATIONAL DOCUMENTS

- `AI_START_HERE.md` — short entry point
- `AI_DOCUMENT_INDEX.md` — routing map
- `AI_CONTROL_CENTER.md` — current D1–D7 status, blockers, authorizations, next action and handoff checkpoint
- `AI_ACTIVE_TASK.md` — current executor/control task only
- `NEW_CHAT_BOOTSTRAP_PROMPT.md` — canonical new-chat prompt

---

## 7. DEFAULT-IGNORE / HISTORICAL

Do not read by default:
- `AI_REVIEW_PACKAGE.md`
- `CHANGELOG_AI.md`
- `AI_HANDOFF_PROTOCOL.md`
- `CURRENT_STATE.md`
- `HANDOFF.md`
- `IMPLEMENTATION_STATUS.md`
- old root `docs/`
- `architecture-redesign/`
- `implementation/`
- `legacy-analysis/`
- `phase-3/`
- `services/mbo-auth-bridge/` — **abandoned experiment; not approved runtime architecture**

Historical files remain available only for audit/dispute.

---

## 8. REVIEW MINIMUM READ SET

When user says `review`:

```text
current HEAD
+ AI_CONTROL_CENTER
+ authorizing AI_ACTIVE_TASK
+ relevant Baseline(s)
+ exact changed files/diff/evidence
```

Do not use historical Auth Bridge artifacts as current D1 authority.

---

## 9. INDEX MAINTENANCE

Update this index only when canonical routing changes, a new Baseline/Skill is created, or a document becomes superseded/default-ignore. Routine status changes belong in `AI_CONTROL_CENTER.md`.
