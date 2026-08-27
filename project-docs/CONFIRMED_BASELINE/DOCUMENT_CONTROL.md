# CONFIRMED BASELINE — LEAN DOCUMENT CONTROL

> Status: **CONFIRMED / MANDATORY**
> Purpose: minimize repeated AI reading, context consumption, and Antigravity credit without losing audit/history.

---

## 1. Principle

MBO2026 keeps historical documents for audit/recovery, but **AI must not reread historical or superseded documents by default**.

The repository is controlled through a small Core Read Set plus task-triggered documents.

Do not delete historical evidence merely to save tokens. Instead:
- keep it in Git;
- remove it from default reading;
- open it only when the current task requires that exact evidence/domain.

---

## 2. CORE READ SET — DEFAULT FOR CHATGPT

For a normal new chat / review / continuation, ChatGPT reads only:

1. `project-docs/AI_START_HERE.md`
2. `project-docs/AI_CONTROL_CENTER.md`
3. `project-docs/CONFIRMED_BASELINE/README.md` + only baseline files relevant to the current gate
4. `project-docs/AI_ACTIVE_TASK.md`
5. current Git HEAD / exact latest diff/evidence relevant to the current gate

`project-docs/00_MASTER_JOBLIST.md` is read only when D1–D7 completeness/acceptance detail is needed, not automatically every small execution cycle.

---

## 3. CORE READ SET — DEFAULT FOR ANTIGRAVITY

Antigravity reads only:

1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. exact source/config files explicitly listed by the Active Task

Antigravity MUST NOT browse `project-docs/` broadly.
Antigravity MUST NOT read historical documents merely to "understand the project".

If Active Task does not name a historical document, do not open it.

---

## 4. DEFAULT-IGNORE DOCUMENTS

The following documents are **NOT part of normal AI startup/review reading**.
They may be opened only when the listed trigger exists.

### Historical / superseded operational documents

- `project-docs/AI_HANDOFF_PROTOCOL.md`
  - superseded operationally by `AI_CONTROL_CENTER.md` + `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md`
  - trigger: investigating old handoff behavior only

- `project-docs/AI_REVIEW_PACKAGE.md`
  - large historical review archive
  - trigger: exact older review evidence is missing from Git diff/current evidence

- `project-docs/CHANGELOG_AI.md`
  - large historical log
  - trigger: reconstructing historical sequence not available from Git commits

- `project-docs/CURRENT_STATE.md`
  - superseded operationally by `AI_CONTROL_CENTER.md`
  - trigger: investigating historical state conflict

- `project-docs/HANDOFF.md`
  - superseded operationally by `AI_CONTROL_CENTER.md`
  - trigger: historical handoff dispute only

- `project-docs/IMPLEMENTATION_STATUS.md`
  - superseded for current status by `AI_CONTROL_CENTER.md`
  - trigger: historical phase investigation only

- `project-docs/TODAY_MBO_CLOSEOUT_MISSION.md`
  - historical mission document
  - trigger: audit of original closeout scope only

- `project-docs/TOMORROW_HALF_DAY_MISSION.md`
  - historical mission document
  - trigger: audit of old half-day plan only

- `project-docs/TEST_STATUS.md`
  - historical summary
  - trigger: specific old test-state audit only

- `project-docs/PROJECT_CONTEXT.md`
  - historical orientation
  - trigger: only if Control Center/Baseline lacks required context

### Superseded D1 architecture/evidence documents

- `project-docs/D1-C4A_GATEWAY_RUNTIME_DEPLOYMENT.md`
  - obsolete external-gateway direction
  - trigger: historical rollback/audit of the abandoned gateway architecture only

- `project-docs/D1_KINTONE_ONLY_RECONCILIATION_PLAN.md`
  - superseded durable architecture by `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
  - trigger: investigating reconciliation history only

- `project-docs/STAGE_A_LIVE_PRECHECK_EVIDENCE.md`
  - historical evidence
  - trigger: exact Stage A review/audit only

- `project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md`
  - execution evidence; not default truth
  - trigger: independent review of the exact live group/ACL cutover or later audit

### Broad duplicate/supplemental specs

- `project-docs/ARCHITECTURE.md`
  - trigger: architecture detail not represented by relevant Confirmed Baseline

- `project-docs/BUSINESS_RULES.md`
  - trigger: current business rule is absent from Confirmed Baseline

- `project-docs/SECURITY_MODEL.md`
  - trigger: non-D1 security topic not covered by current baseline

- `project-docs/UI_SPEC.md`
  - trigger: UI detail not represented in `CONFIRMED_BASELINE/UI_UX.md`

- `project-docs/WORKFLOW.md`
  - trigger: workflow detail not represented in `CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`

### Old root `docs/` foundation files

Default-ignore all files under repository root `docs/` unless a task explicitly references them:
- `docs/ARCHITECTURE.md`
- `docs/CHANGE_PLAN_01_PROJECT_FOUNDATION.md`
- `docs/CHANGE_PLAN_02_SANDBOX_APP_CREATION.md`
- `docs/KINTONE_SCHEMA.md`
- `docs/SANDBOX_APPS.md`
- `docs/SECURITY.md`

These are historical foundation artifacts, not normal current-control documents.

---

## 5. CONDITIONAL DOCUMENTS — OPEN BY TASK TRIGGER ONLY

These are useful, but never default reads:

- `APP_REGISTRY.md` — when exact app IDs/roles are needed and not already in relevant baseline
- `FIELD_DICTIONARY.md` — when field code/type/semantic mapping is needed
- `EXCEL_EXPORT.md` — D2 export work only
- `DEFECT_REGISTER.md` — exact defect investigation only
- `OPEN_ISSUES.md` — unresolved-decision sweep only
- `SECTION_USER_MAPPING_AUDIT.md` — routing/user-mapping investigation only
- `architecture-redesign/` — architecture conflict/redesign only
- `implementation/` — exact implementation blueprint/file needed by task only
- `legacy-analysis/` — D3/legacy migration investigation only
- `phase-3/` — exact Phase 3 historical/implementation issue only

---

## 6. CONFIRMED BASELINE READING

Do NOT read all Confirmed Baseline files every time.

Read `CONFIRMED_BASELINE/README.md`, then only files relevant to the current gate.

Examples:
- D1 auth/security -> `D1_AUTH_SECURITY.md`
- routing -> `ROUTING_WORKFLOW.md` + `EMPLOYEE_MASTER_ROUTING.md`
- scoring -> `EVALUATION_CLASSES.md`
- D3 legacy source -> `LEGACY_PMS_APPS.md`
- UI -> `UI_UX.md`
- AI governance -> `AI_OPERATING_GOVERNANCE.md` + this file

---

## 7. NO REDISCOVERY RULE

If a fact is already confirmed in Baseline:
- do not search old docs to reconfirm it;
- do not ask Antigravity to rediscover it;
- use the Baseline fact directly unless current evidence creates a genuine conflict.

If current evidence conflicts with Baseline:
- STOP;
- investigate only the smallest evidence set needed;
- resolve conflict through Control Plane;
- update Baseline if the durable truth genuinely changes.

---

## 8. DOCUMENT CREATION RULE

Before creating a new project document, ask:

1. Can this information update an existing Confirmed Baseline file?
2. Is it current operational state that belongs in `AI_CONTROL_CENTER.md`?
3. Is it only the current executor instruction that belongs in `AI_ACTIVE_TASK.md`?
4. Is it reusable Kintone knowledge that belongs under `skills/kintone/`?
5. Is it raw historical evidence that Git diff/read-back already preserves?

Create a new document only when none of the existing canonical locations fit.

Avoid `_v2`, `_final`, `_new`, duplicate status files, duplicate handoffs, and duplicate master prompts.

---

## 9. REVIEW RULE

For every `review`:
- do not read historical default-ignore documents automatically;
- review the exact latest change against the relevant Baseline and Active Task;
- open historical evidence only if the latest evidence is insufficient or conflicts with Baseline;
- promote newly confirmed durable facts into Baseline;
- extract reusable Kintone knowledge into `skills/kintone/` when applicable.

---

## 10. Target Outcome

Normal session context should be driven by:

```text
AI_START_HERE
+ AI_CONTROL_CENTER
+ relevant CONFIRMED_BASELINE file(s)
+ AI_ACTIVE_TASK
+ exact Git diff/evidence
```

Everything else is **on-demand only**.
