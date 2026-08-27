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
- PASS / FAIL / BLOCKED decisions;
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

---

## 2. Low-Credit Rules

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

Execution Plane cannot self-promote its work to PASS.

---

## 3. Canonical Control Layers

```text
Durable confirmed project truth -> project-docs/CONFIRMED_BASELINE/
Current operational truth       -> project-docs/AI_CONTROL_CENTER.md
Current executor instruction    -> project-docs/AI_ACTIVE_TASK.md
Document routing                -> project-docs/AI_DOCUMENT_INDEX.md
Actual implementation evidence  -> Git / Kintone
Reusable cross-project Kintone knowledge -> skills/kintone/
New-chat entry prompt           -> project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md
```

Do not create parallel status, handoff, baseline, skill, or master-prompt sources unless there is a clear separation-of-concerns reason.

---

## 4. Confirmed Baseline Promotion — Mandatory

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

## 5. Lean Document Control — Mandatory

Before searching/browsing project documents, AI must use:

`project-docs/AI_DOCUMENT_INDEX.md`

Detailed read-minimization/default-ignore rules live in:

`project-docs/CONFIRMED_BASELINE/DOCUMENT_CONTROL.md`

Rules:
- do not read all project docs on startup;
- do not read all Baseline files every time;
- use task-triggered routing;
- historical/superseded docs remain in Git for audit but are default-ignore;
- repository search is escalation after the Index cannot route the task.

---

## 6. Reusable Kintone Skill Extraction — Mandatory

After every independent review, ChatGPT must evaluate:

```text
Did this work produce a reusable Kintone technique, failure mode,
safety rule, API behavior, implementation pattern, migration method,
security lesson, UI pattern, or test method that can help another project?
```

If YES:
1. generalize the lesson so it is not MBO2026-specific;
2. update an existing skill under `skills/kintone/` if possible;
3. create a new skill only when no existing skill fits;
4. update `skills/kintone/README.md` index;
5. update `AI_DOCUMENT_INDEX.md` only when routing changes;
6. never store secrets/project credentials in skills;
7. do not spend Antigravity credit on this unless exact execution is required.

Skills are reusable engineering knowledge, not project truth. Project-specific confirmed facts still belong in Confirmed Baseline.

---

## 7. Review Contract

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

## 8. New-Chat Contract

`project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md` is the single canonical reusable prompt for starting a fresh ChatGPT session.

Every fresh session reconstructs truth from:
1. current Git HEAD;
2. `AI_START_HERE.md`;
3. `AI_CONTROL_CENTER.md`;
4. `AI_DOCUMENT_INDEX.md`;
5. relevant Confirmed Baseline only;
6. `AI_ACTIVE_TASK.md`;
7. exact latest Git/Kintone evidence.

Do not ask the user to repeat established history available in the repository.

---

## 9. Operating Principle

```text
Baseline = durable project truth
Control Center = current state
Active Task = one executor job
Document Index = find without searching
Skills = reusable Kintone knowledge
ChatGPT = think/control/review/document
Antigravity = execute only when necessary
```

This governance remains mandatory unless explicitly changed by the user and promoted into Confirmed Baseline.
