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

Do NOT browse `project-docs/` to discover documents unless this index has no route.

---

## 2. ANTIGRAVITY STARTUP

Antigravity opens only:

1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. exact source/config files named by `AI_ACTIVE_TASK.md`

Antigravity does **not** need this whole index unless the Active Task explicitly says document routing is required.

---

## 3. TASK → DOCUMENT ROUTING

| Task / Question | Open First | Open Only If Needed |
|---|---|---|
| Current project status / what next | `AI_CONTROL_CENTER.md` | `00_MASTER_JOBLIST.md` |
| Current executor instruction | `AI_ACTIVE_TASK.md` | none |
| AI workflow / low-credit / review governance | `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` | `CONFIRMED_BASELINE/DOCUMENT_CONTROL.md` |
| Which document should I read? | `AI_DOCUMENT_INDEX.md` | search only if no route exists |
| D1 login / password / App801 / shared Kintone account | `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` | exact latest D1 evidence/diff |
| D1 live group / App801 ACL audit | `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` | `D1_ACCESS_GROUP_SETUP_EVIDENCE.md` only for exact audit |
| Routing / App795 / GM precedence / Team | `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` | `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` |
| App53 routing fields / Position / Team semantics | `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` | `FIELD_DICTIONARY.md` only for field-code detail |
| Evaluation class / scoring weight | `CONFIRMED_BASELINE/EVALUATION_CLASSES.md` | relevant source/test only |
| App794 UI / UX / stage layout | `CONFIRMED_BASELINE/UI_UX.md` | exact UI source/screenshots |
| D2 Excel/PDF export | `AI_CONTROL_CENTER.md` | `EXCEL_EXPORT.md`, exact export source, legacy sample evidence |
| D3 legacy migration | `CONFIRMED_BASELINE/LEGACY_PMS_APPS.md` | `legacy-analysis/` only for exact source app being migrated |
| D4 HR Control Center | `AI_CONTROL_CENTER.md` | exact App800/source files; search only if index/task does not name them |
| D5 copy previous MBO | `AI_CONTROL_CENTER.md` | exact copy service/source + relevant current employee metadata rules |
| D6 E2E/security/regression | relevant Baselines for impacted D1–D5 | exact test matrices/results only |
| D7 Admin Support Center | `AI_CONTROL_CENTER.md` | only reopen evidence if a new defect is reported |
| App ID / app purpose lookup | relevant Baseline first | `APP_REGISTRY.md` if absent from Baseline |
| Field code/type lookup | relevant Baseline first | `FIELD_DICTIONARY.md` |
| Security outside D1 | relevant Baseline first | `SECURITY_MODEL.md` only if Baseline lacks the rule |
| Old architecture investigation | relevant current Baseline first | `architecture-redesign/` only for exact conflict/history |
| Historical decision investigation | current Baseline + Git commit | `DECISIONS.md` only if commit/Baseline insufficient |
| Historical project sequence | Git commits first | `CHANGELOG_AI.md` only if Git cannot answer |
| Old handoff investigation | `AI_CONTROL_CENTER.md` | `HANDOFF.md` / `AI_HANDOFF_PROTOCOL.md` only for dispute/audit |
| Defect-specific investigation | `AI_CONTROL_CENTER.md` | `DEFECT_REGISTER.md` only for named defect |
| Reusable Kintone technique | `skills/kintone/README.md` | exact skill file |

---

## 4. CONFIRMED BASELINE INDEX

### Always read README first
- `project-docs/CONFIRMED_BASELINE/README.md`

### Open by domain only
- `AI_OPERATING_GOVERNANCE.md`
  - AI roles, Control Plane/Execution Plane, review rules, low-credit rules, Baseline promotion, Skill extraction

- `DOCUMENT_CONTROL.md`
  - Core Read Set, default-ignore files, no-rediscovery rules

- `D1_AUTH_SECURITY.md`
  - Kintone-only authentication, App801, PBKDF2, page-memory auth, lockout, Employee Self gate, MBO access group, App801 ACL target

- `ROUTING_WORKFLOW.md`
  - App795 route scenarios / workflow behavior

- `EMPLOYEE_MASTER_ROUTING.md`
  - App53 routing inputs / Position normalization / GM precedence / Team semantics

- `EVALUATION_CLASSES.md`
  - evaluation/scoring class definitions and weights

- `LEGACY_PMS_APPS.md`
  - legacy PMS app IDs / historical source authority

- `UI_UX.md`
  - frozen/mandatory App794 UI/UX rules

Do not open all files above in every session.

---

## 5. CURRENT OPERATIONAL DOCUMENTS

These are active, not historical:

- `AI_START_HERE.md`
  - short entry point only

- `AI_DOCUMENT_INDEX.md`
  - this routing map

- `AI_CONTROL_CENTER.md`
  - current D1–D7 status, authorizations, blockers, next action owner

- `AI_ACTIVE_TASK.md`
  - current short executor job only

- `NEW_CHAT_BOOTSTRAP_PROMPT.md`
  - canonical prompt used by user to start a fresh ChatGPT session

---

## 6. DEFAULT-IGNORE / DO NOT READ ON STARTUP

Do not open these by default:

- `AI_REVIEW_PACKAGE.md`
- `CHANGELOG_AI.md`
- `AI_HANDOFF_PROTOCOL.md`
- `CURRENT_STATE.md`
- `HANDOFF.md`
- `IMPLEMENTATION_STATUS.md`
- `TODAY_MBO_CLOSEOUT_MISSION.md`
- `TOMORROW_HALF_DAY_MISSION.md`
- `TEST_STATUS.md`
- `PROJECT_CONTEXT.md`
- `D1-C4A_GATEWAY_RUNTIME_DEPLOYMENT.md`
- `D1_KINTONE_ONLY_RECONCILIATION_PLAN.md`
- `STAGE_A_LIVE_PRECHECK_EVIDENCE.md`
- `D1_ACCESS_GROUP_SETUP_EVIDENCE.md` unless reviewing that exact cutover
- old root `docs/` folder
- `architecture-redesign/`
- `implementation/`
- `legacy-analysis/`
- `phase-3/`

All remain available for audit/on-demand use.

---

## 7. SEARCH ESCALATION RULE

Before using repository search:

```text
1. Check AI_DOCUMENT_INDEX
2. Check AI_CONTROL_CENTER
3. Check relevant CONFIRMED_BASELINE index
4. Check AI_ACTIVE_TASK exact file list
5. Only then search
```

When search is required:
- search for an exact filename/function/field/app ID;
- do not perform broad semantic archaeology;
- stop once the exact needed file is found.

---

## 8. REVIEW MINIMUM READ SET

When user says `review`, ChatGPT needs only:

```text
current HEAD
+ AI_CONTROL_CENTER
+ AI_ACTIVE_TASK that authorized the work
+ relevant Baseline file(s)
+ exact changed files/diff/evidence
```

Historical docs are opened only if the current evidence conflicts or is incomplete.

---

## 9. SKILL ROUTING

For reusable Kintone knowledge, use:

`skills/kintone/README.md`

Skills are for cross-project reusable techniques, not MBO2026-specific current status.

Examples:
- safe Kintone live-change/read-back/rollback pattern
- Kintone shared-account application auth limitations
- Kintone app/group ACL patterns
- fail-closed routing patterns
- customization deploy/backup/read-back techniques
- Kintone REST/browser API patterns

---

## 10. INDEX MAINTENANCE

ChatGPT Control Plane updates this index only when:
- a new canonical Baseline file is added;
- a new reusable Skill is added;
- a document becomes superseded/default-ignore;
- D1–D7 routing requires a new canonical document.

Do not update this file for routine status changes; those belong in `AI_CONTROL_CENTER.md`.
