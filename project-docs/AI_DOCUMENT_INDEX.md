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

Optional human-readable checkpoint:
- `project-docs/PROJECT_LATEST_SUMMARY.md`

Read `00_MASTER_JOBLIST.md` when detailed D1–D7 acceptance/no-drop criteria are needed.

For a brand-new chat, `NEW_CHAT_BOOTSTRAP_PROMPT.md` is the canonical copy/paste handoff prompt. It still requires the new chat to re-fetch repository truth; the prompt itself is not execution evidence.

---

## 2. NON-NEGOTIABLE D1 ROUTING RULE

```text
D1 authentication = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / SUPERSEDED
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

Do not revive Auth Bridge from historical chat, commits, or `services/mbo-auth-bridge/`.

Current D1 truth is distributed intentionally:
- `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` = identity modes, Employee-Self/Approver authorization, App801 shared credential model, HR/admin reset;
- `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` = approved physical mapping design, own-MBO self-appraiser exception, dedicated native App794 access/Record ACL design and implementation gates;
- `CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md` = dedicated native-Kintone continuity vs shared App801 bearer session;
- `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` = App53 employee/routing source semantics;
- `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` = effective requester identity, App795 approvers and workflow topology;
- `CONFIRMED_BASELINE/UI_UX.md` = My MBO + My Approval Tasks target UX.

Important: a completed D1 sub-scope such as WP2 UI or Password Reset does **not** automatically mean the whole D1 deliverable is closed. Use `00_MASTER_JOBLIST.md` for full D1 closure criteria and `AI_CONTROL_CENTER.md` for current accepted status.

---

## 3. ANTIGRAVITY STARTUP

Antigravity opens only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. exact Baseline/source/config files named by `AI_ACTIVE_TASK.md`

Do not broad-scan the repo.

---

## 4. TASK → DOCUMENT ROUTING

| Task / Question | Open First | Open Only If Needed |
|---|---|---|
| New chat / handoff / resume project | `NEW_CHAT_BOOTSTRAP_PROMPT.md` | `PROJECT_LATEST_SUMMARY.md`, `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md` |
| Current project status / what next | `AI_CONTROL_CENTER.md` | `PROJECT_LATEST_SUMMARY.md`, `00_MASTER_JOBLIST.md` |
| D1-D7 completeness / whether a whole deliverable is actually closed | `00_MASTER_JOBLIST.md` | `AI_CONTROL_CENTER.md`, relevant Baseline/evidence |
| Current executor instruction | `AI_ACTIVE_TASK.md` | none |
| AI workflow / review governance | `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md` | `CONFIRMED_BASELINE/DOCUMENT_CONTROL.md` |
| Live deploy / rollback / recovery / emergency recovery | `CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md` | `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, exact deployment/recovery evidence |
| Source architecture / modular JS / feature ownership | `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` | exact affected source files/tests/build manifest |
| App794 UI runtime styling missing / DOM exists but unstyled / Comment API / custom UI deploy lesson | `skills/mbo-kintone-ui-runtime-debugging/SKILL.md` | `CONFIRMED_BASELINE/UI_UX.md`, exact source/CSS/deploy evidence |
| D1 hybrid login / dedicated vs shared identity / App801 / HR reset / shared Kintone account | `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` | `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`, `D1_SESSION_CONTINUITY.md`, exact live ACL/mapping evidence |
| D1 dedicated mapping / Natta-Vassana dual role / self-route exception / dedicated native ACL | `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` | `EMPLOYEE_MASTER_ROUTING.md`, `D1_AUTH_SECURITY.md`, `ROUTING_WORKFLOW.md`, exact App53/App794 evidence |
| D1 App53 Position/Department/Section/Team/Employee_Code source semantics | `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md` | `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`, `FIELD_DICTIONARY.md` |
| D1 dual-role Employee + Approver / My Approval Tasks / effective requester | `CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` | `ROUTING_WORKFLOW.md`, `D1_AUTH_SECURITY.md`, `UI_UX.md`, exact App794 Process evidence |
| D1 shared session token / reload / logout / password-session rotation | `CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md` | `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md` |
| D1 My MBO history / Completed / no-delete | `CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md` | `D1_AUTH_SECURITY.md`, exact UI/security source/test |
| D1 Live timeline/comments truthfulness / attachment state/upload lifecycle | `CONFIRMED_BASELINE/D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md` | `CONFIRMED_BASELINE/UI_UX.md`, exact UI source |
| Routing / App795 / executive precedence / Team | `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` | `CONFIRMED_BASELINE/EMPLOYEE_MASTER_ROUTING.md`, `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` |
| Evaluation/scoring class / App796 | `CONFIRMED_BASELINE/EVALUATION_CLASSES.md` | relevant source/test |
| App794 general UI/UX / My MBO + My Approval Tasks | `CONFIRMED_BASELINE/UI_UX.md` | `D1_AUTH_SECURITY.md`, `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`, `ROUTING_WORKFLOW.md`, exact UI source/screenshots |
| D2 Excel/PDF export | `AI_CONTROL_CENTER.md` | `EXCEL_EXPORT.md`, exact export source, legacy sample evidence |
| D3 legacy migration | `CONFIRMED_BASELINE/LEGACY_PMS_APPS.md` | exact legacy source evidence only |
| D4 HR Control Center | `AI_CONTROL_CENTER.md` | exact App800/source files |
| D5 Copy Previous MBO | `AI_CONTROL_CENTER.md` | exact copy service/source |
| D6 E2E/security/regression | relevant Baselines for impacted D1–D5 | exact test evidence |
| D7 Admin Support Center | `AI_CONTROL_CENTER.md` | reopen only for new defect |
| General reusable Kintone technique | `skills/kintone/README.md` | exact skill file |

---

## 5. CONFIRMED BASELINE INDEX

Always start with `project-docs/CONFIRMED_BASELINE/README.md`, then only the domain needed:

- `AI_OPERATING_GOVERNANCE.md`
- `ROLLBACK_RECOVERY_SAFETY.md`
- `SOURCE_CODE_ARCHITECTURE.md`
- `DOCUMENT_CONTROL.md`
- `D1_AUTH_SECURITY.md` — current KINTONE-ONLY HYBRID IDENTITY + App801 shared credential/ACL + dual-role security model
- `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` — approved App53 dedicated-user mapping field design + own self-appraiser elision + dedicated App794 native access/Record ACL target
- `D1_SESSION_CONTINUITY.md` — dedicated native-Kintone continuity + shared App801 MBO session continuity
- `D1_EMPLOYEE_SELF_MY_MBO.md`
- `D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md`
- `ROUTING_WORKFLOW.md` — App795 + effective requester + workflow topology
- `EMPLOYEE_MASTER_ROUTING.md` — App53 employee/routing-source semantics
- `EVALUATION_CLASSES.md`
- `LEGACY_PMS_APPS.md`
- `UI_UX.md` — includes Hybrid Identity Home / My MBO + My Approval Tasks

Do not open all files on every task.

---

## 6. CURRENT OPERATIONAL DOCUMENTS

- `AI_START_HERE.md` — short mandatory entry point
- `AI_DOCUMENT_INDEX.md` — lean routing map
- `AI_CONTROL_CENTER.md` — current accepted D1–D7 status, blockers, authorizations and gate
- `AI_ACTIVE_TASK.md` — current executor/control task only
- `PROJECT_LATEST_SUMMARY.md` — human-readable latest handoff/checkpoint summary
- `NEW_CHAT_BOOTSTRAP_PROMPT.md` — canonical new-chat copy/paste prompt

---

## 7. CURRENT REUSABLE SKILL ROUTING

- `skills/mbo-kintone-ui-runtime-debugging/SKILL.md` — mandatory before future App794 UI runtime corrective/custom UI deployment involving DOM present but CSS absent, CSS parser/scope issues, Back UI, Kintone Comment GET/pagination, exact JS+CSS manifest, technical readback and User UAT gates.
- `skills/kintone/README.md` — general Kintone reusable-skill index.

---

## 8. DEFAULT-IGNORE / HISTORICAL

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

## 9. REVIEW MINIMUM READ SET

When user says `review`:

```text
current HEAD
+ AI_CONTROL_CENTER
+ authorizing AI_ACTIVE_TASK
+ relevant Baseline(s)
+ exact changed files/diff/evidence
```

For deploy/rollback/recovery review, `ROLLBACK_RECOVERY_SAFETY.md` is mandatory.
For source/module refactor review, `SOURCE_CODE_ARCHITECTURE.md` is mandatory when feature ownership or dependency boundaries are involved.
For App794 custom UI runtime/CSS/Comment problems, also read `skills/mbo-kintone-ui-runtime-debugging/SKILL.md`.
For Hybrid Identity/Dual-role work, read `D1_AUTH_SECURITY.md` + `D1_HYBRID_IDENTITY_ACCESS_DESIGN.md` + `D1_SESSION_CONTINUITY.md` + `EMPLOYEE_MASTER_ROUTING.md` + `ROUTING_WORKFLOW.md` and `UI_UX.md` when Home/record UX is involved.

Do not use historical Auth Bridge artifacts as current D1 authority.

---

## 10. INDEX MAINTENANCE

Update this index only when canonical routing changes, a new Baseline/Skill/operational handoff document is created, or a document becomes superseded/default-ignore. Routine status changes belong in `AI_CONTROL_CENTER.md`.
