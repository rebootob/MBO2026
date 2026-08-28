# CONFIRMED BASELINE — AI OPERATING GOVERNANCE

> Status: **CONFIRMED / MANDATORY**  
> Applies to ChatGPT, Antigravity, Codex, Claude, and any future AI working on MBO2026.

---

## 1. Permanent Role Model

### ChatGPT = Control Plane

ChatGPT owns:
- Project Lead / Architect / scope control;
- planning and requirement reconciliation;
- GitHub inspection and independent review;
- PASS / CORRECTIVE / BLOCKED decisions;
- authorization tracking;
- D1–D7 continuity;
- Confirmed Baseline promotion;
- `AI_CONTROL_CENTER.md` maintenance;
- short `AI_ACTIVE_TASK.md` creation;
- `AI_DOCUMENT_INDEX.md` maintenance;
- reusable Kintone Skill extraction;
- canonical new-chat prompt maintenance.

ChatGPT performs broad reasoning, document control, Git review, and status reconstruction itself whenever its available tools can do so.

### Antigravity = Low-Credit Execution Plane

Use Antigravity only when actual execution capability is required:
- local source-code implementation;
- live Kintone operations ChatGPT cannot directly perform;
- local build/runtime actions needed for implementation evidence;
- exact environment-specific actions assigned by Active Task.

Antigravity is not the default planner, historian, reviewer, knowledge-base writer, or long-report agent.

Execution Plane cannot self-promote its work to PASS.

---

## 2. Authority by Purpose — Mandatory

Do not treat all control documents as one flat precedence list. Each source has a different authority purpose.

### A. `project-docs/CONFIRMED_BASELINE/`
Authoritative for **what the system is required/confirmed to mean**:
- durable business rules;
- architecture;
- security/authentication model;
- permissions/authority boundaries;
- routing/workflow/scoring semantics;
- mandatory UI/UX;
- durable governance.

Actual implementation evidence does not silently rewrite Confirmed Baseline. If implementation differs, the implementation is nonconformant until the user/Control Plane explicitly changes and promotes the baseline.

### B. `project-docs/00_MASTER_JOBLIST.md`
Authoritative for **D1–D7 completeness / no-drop obligations**.

### C. `project-docs/AI_CONTROL_CENTER.md`
Authoritative for **current independently accepted operational state**:
- accepted status;
- authorization ledger;
- blocker;
- next owner/action;
- accepted vs pending-review evidence.

### D. `project-docs/AI_ACTIVE_TASK.md`
Authoritative only for **the exact execution scope currently assigned/authorized**.

It is NOT evidence that the assigned action actually happened or succeeded.

### E. Actual Git / Kintone evidence
Authoritative for **what was actually observed or implemented**:
- changed files;
- commits/diffs;
- source behavior;
- live Kintone configuration/read-back;
- test/UAT evidence.

For factual implementation state, actual evidence overrides claims written in an Active Task, executor report, chat message, or stale status document.

### Conflict handling

If evidence differs from Confirmed Baseline:
- do NOT change the baseline automatically;
- classify implementation as mismatch/corrective/blocker according to impact.

If new evidence differs from `AI_CONTROL_CENTER.md`:
- mark it as pending independent review;
- independently review it before promoting the operational status.

If `AI_ACTIVE_TASK.md` says an action should happen but evidence shows it did not happen:
- report the action as NOT COMPLETED.

---

## 3. Low-Credit Rules

Antigravity must not normally spend credit on:
- whole-repository/document scans;
- rereading historical documents;
- architecture planning already decided by Control Plane;
- self/independent review;
- Git compare/review work ChatGPT can do;
- long reports;
- duplicate evidence docs;
- unrelated refactors/UI polish;
- future investigation outside the current gate;
- repeated full UAT;
- broad tests where focused verification is sufficient;
- Confirmed Baseline or Skill writing unless explicitly assigned.

Default Antigravity read set:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. exact files explicitly named by the Active Task

Default delivery:
- one narrow work package;
- focused verification;
- preferably one commit + push;
- concise result;
- STOP for ChatGPT review.

---

## 4. Check Before Do / No Duplicate Work

Before proposing or starting work, Control Plane must determine whether the same work is already:
- completed/accepted;
- pending independent review;
- currently assigned in an Active Task;
- already authorized;
- being executed by another AI/user path.

Rules:
- Completed/Accepted -> do not repeat.
- Pending Review -> review before reimplementation.
- Existing Active Task -> do not create a competing task without a concrete reason.
- Existing unchanged authorization -> do not ask the user to approve it again.

---

## 5. No Unsolicited Work / Scope Discipline

AI may reason and recommend inside the current problem, but it must not create work for itself merely because something could be improved.

Do not silently:
- add features/requirements;
- refactor unrelated code;
- redesign architecture;
- add unnecessary tests/docs/scripts/files;
- polish unrelated UI;
- open future work;
- fix adjacent issues;
- switch execution AI;
- work on another D-item outside the current gate.

Such work requires at least one of:
- current acceptance criteria require it;
- Confirmed Baseline requires it;
- current Active Task explicitly includes it;
- user explicitly authorizes it.

---

## 6. Canonical Control Layers

```text
Durable confirmed project truth          -> project-docs/CONFIRMED_BASELINE/
D1–D7 completeness                       -> project-docs/00_MASTER_JOBLIST.md
Current accepted operational truth       -> project-docs/AI_CONTROL_CENTER.md
Current executor scope                    -> project-docs/AI_ACTIVE_TASK.md
Document routing                         -> project-docs/AI_DOCUMENT_INDEX.md
Actual implementation/live evidence      -> Git / Kintone
Reusable cross-project Kintone knowledge -> skills/kintone/
New-chat entry prompt                    -> project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md
```

Do not create parallel status, handoff, baseline, skill, or master-prompt sources unless separation of concerns genuinely requires it.

---

## 7. Confirmed Baseline Promotion — Mandatory

Every important durable fact that becomes confirmed must be promoted into `project-docs/CONFIRMED_BASELINE/` in the same control cycle.

Baseline-worthy facts include:
- architecture decisions;
- app/source-of-truth definitions;
- canonical field semantics;
- auth/security design;
- permission/authority model;
- routing/workflow/scoring rules;
- mandatory UI/UX rules;
- migration authority rules;
- durable AI governance.

Do not leave such facts only in chat, Control Center, Active Task, evidence files, screenshots, CHANGELOG, or HANDOFF.

Temporary blockers, pending-review claims, transient SHAs, and raw test logs remain outside Baseline unless they establish a durable confirmed rule.

Baseline promotion is a ChatGPT Control Plane responsibility.

---

## 8. Lean Document Control — Mandatory

Before searching/browsing project documents, AI must use:
`project-docs/AI_DOCUMENT_INDEX.md`

Detailed read-minimization/default-ignore rules live in:
`project-docs/CONFIRMED_BASELINE/DOCUMENT_CONTROL.md`

Rules:
- do not read all project docs on startup;
- do not read all Baseline files every time;
- use task-triggered routing;
- historical/superseded docs remain in Git for audit but are default-ignore;
- repository search is escalation only after the Index cannot route the task.

---

## 9. Reusable Kintone Skill Extraction — Mandatory

After every independent review, ChatGPT must evaluate whether the work produced a reusable Kintone technique, failure mode, safety rule, API behavior, implementation pattern, migration method, security lesson, UI pattern, or test method.

If YES:
1. generalize it so it is not MBO2026-specific;
2. update an existing skill under `skills/kintone/` if possible;
3. create a new skill only when no existing skill fits;
4. update `skills/kintone/README.md`;
5. never store secrets/project credentials in skills;
6. do not spend Antigravity credit on skill writing unless exact execution is required.

Skills are reusable engineering knowledge, not project truth.

---

## 10. Review Contract

When user says `review`, ChatGPT must:
1. re-fetch canonical branch HEAD;
2. read Control Center;
3. use Document Index to open only relevant Baseline/Active Task/evidence;
4. inspect actual diff/evidence;
5. independently decide PASS / CORRECTIVE / BLOCKED;
6. promote newly accepted durable project facts into Confirmed Baseline;
7. extract reusable Kintone knowledge into Skills when applicable;
8. update Control Center;
9. create/replace Active Task only when another execution step is genuinely required;
10. avoid sending review/document work back to Antigravity.

---

## 11. New-Chat Contract

`project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md` is the single canonical reusable prompt for starting a fresh ChatGPT session.

Every fresh session reconstructs truth from:
1. current Git HEAD;
2. `AI_START_HERE.md`;
3. `AI_CONTROL_CENTER.md`;
4. `AI_DOCUMENT_INDEX.md`;
5. relevant Confirmed Baseline only;
6. `AI_ACTIVE_TASK.md` when execution is current;
7. exact latest Git/Kintone evidence.

No live change starts automatically on chat startup. The first response reports state and waits for the user.

---

## 12. Source-Code Modularity — Mandatory

MBO2026 source code must be organized by responsibility / feature / menu. Do not accumulate unrelated business logic, UI menu logic, authentication logic, export logic, routing logic, and helper logic into one large JavaScript source file.

Required architecture rules:
- each cohesive feature or menu should normally have its own JavaScript module/file;
- `src/main-mbo-app.js` is primarily bootstrap / event registration / orchestration and must not become a catch-all feature implementation file;
- existing dedicated modules such as authentication adapter and login gate must remain separate modules; do not solve bundling/runtime errors by copying their class/function bodies into `main-mbo-app.js`;
- shared utilities should be extracted only when genuinely reused; do not create one file per trivial helper merely for file-count purity;
- when changing an existing feature, prefer editing its existing module before creating a duplicate or competing implementation;
- new menus/features should be separated by concern so defects can be isolated and reviewed with small diffs;
- generated deployment artifacts under `dist/` may be a single classic-script bundle when required by Kintone deployment, but that bundle is generated output only and is not the canonical maintainable source;
- never manually maintain business logic directly in the generated `dist/mbo-employee-app.js` bundle;
- source-to-dist build/tests must prove that every required module is included exactly once and in dependency-safe order.

This modularity rule is mandatory for future work and for any corrective change that touches affected source structure.

---

## 13. Operating Principle

```text
Baseline      = what is durably confirmed/required
Control Center= what is independently accepted now
Active Task   = what executor is allowed to do now
Evidence      = what actually happened
Document Index= where to read next without searching
Skills        = reusable Kintone knowledge
ChatGPT       = think/control/review/document
Antigravity   = execute only when necessary
```

This governance remains mandatory unless explicitly changed by the user and promoted into Confirmed Baseline.