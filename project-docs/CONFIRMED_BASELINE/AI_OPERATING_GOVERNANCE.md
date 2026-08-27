# CONFIRMED BASELINE — AI OPERATING GOVERNANCE

> Status: **CONFIRMED / MANDATORY**  
> Applies to: ChatGPT, Antigravity, Codex, Claude, and any future AI working on MBO2026.

---

## 1. Permanent Multi-AI Role Model

### ChatGPT — Control Plane

ChatGPT is the permanent:
- Project Lead;
- Architect;
- scope controller;
- planning owner;
- GitHub/repository reviewer;
- independent reviewer;
- PASS / FAIL / BLOCKED decision owner;
- authorization-boundary recorder;
- D1–D7 continuity owner;
- owner of `AI_CONTROL_CENTER.md` and `AI_ACTIVE_TASK.md`.

ChatGPT should perform broad reasoning, repository reading, planning, review, status reconstruction, and documentation control itself whenever its available tools can do so.

### Antigravity — Low-Credit Execution Plane

Antigravity is used only when actual execution capability is required, primarily:
- source-code implementation in the local project environment;
- live Kintone read/write/configuration/deployment that ChatGPT cannot directly execute;
- local build/runtime actions required for implementation evidence;
- exact environment-specific operations assigned by the current Active Task.

Antigravity is **not** the default planner, project historian, independent reviewer, or long-form documentation agent.

The project must minimize Antigravity credit consumption without reducing correctness or safety.

---

## 2. Mandatory Low-Credit Rules

Unless an exact task requires otherwise, Antigravity must NOT spend execution credit on:
- whole-repository scans;
- rereading all historical project documents;
- redesigning architecture already decided by Control Plane;
- planning before execution when an approved Active Task already exists;
- independent/self review;
- Git compare/review work that ChatGPT can perform;
- long narrative reports;
- duplicate evidence documents;
- unrelated refactoring;
- unrelated UI polish;
- broad future investigation;
- repeated full UAT;
- broad test suites when focused tests are sufficient.

Default Antigravity read set:
1. `project-docs/AI_CONTROL_CENTER.md`
2. `project-docs/AI_ACTIVE_TASK.md`
3. only exact implementation/configuration files explicitly named by the Active Task.

Default Antigravity delivery:
- one narrow work package;
- focused verification;
- preferably one commit + push;
- concise final report;
- STOP for ChatGPT independent review.

Execution Plane cannot independently promote its own work to PASS.

---

## 3. Mandatory Control Documents

The project uses four control layers:

### A. `CONFIRMED_BASELINE/`
Durable confirmed business/technical/governance truth.

### B. `AI_CONTROL_CENTER.md`
Current operational state:
- D1–D7 status;
- current stage;
- latest accepted/pending evidence;
- authorization ledger;
- blockers;
- next action owner;
- whether Antigravity is needed.

### C. `AI_ACTIVE_TASK.md`
One short current execution packet only.
It must not become a project-history archive.

### D. Git/Kintone evidence
Actual implementation/configuration evidence used for independent review.

---

## 4. CONFIRMED BASELINE PROMOTION RULE — MANDATORY

**Every important durable fact that becomes confirmed MUST be promoted into `project-docs/CONFIRMED_BASELINE/`.**

Do not leave confirmed important facts only in:
- chat history;
- `AI_CONTROL_CENTER.md`;
- `AI_ACTIVE_TASK.md`;
- CHANGELOG/HANDOFF;
- an execution evidence file;
- a screenshot;
- an Antigravity report.

### Baseline-worthy confirmed facts include

- user-approved architecture decisions;
- application roles and authority boundaries;
- app IDs / source-of-truth definitions;
- field semantics and canonical mappings;
- authentication/security architecture;
- permission/access model;
- routing/workflow rules;
- evaluation/scoring rules;
- UI/UX rules declared mandatory/frozen;
- migration rules and authoritative source rules;
- durable Multi-AI governance rules;
- other facts that future AI must rely on without rediscovery.

### Not baseline-worthy by themselves

Keep these in Control Center/evidence unless they create a durable confirmed rule:
- temporary task status;
- current blocker;
- pending-review claim;
- one-time command;
- transient commit SHA;
- test run log;
- temporary dry-run count that has not been accepted as a canonical business fact;
- speculative discovery;
- unreviewed Execution Plane report.

### Promotion timing

When ChatGPT independently accepts a new durable fact, the same control cycle must:
1. update the appropriate existing Confirmed Baseline file, or create one canonical file if no suitable file exists;
2. update `CONFIRMED_BASELINE/README.md` index when a new canonical file is added;
3. update `AI_CONTROL_CENTER.md` if the fact changes current operations;
4. ensure `AI_ACTIVE_TASK.md` is consistent with the new baseline;
5. commit the baseline change to the canonical working branch.

**Do not defer baseline promotion to a later cleanup task.**

---

## 5. Baseline Change Discipline

Only confirmed facts belong in this folder.

When a confirmed fact changes:
- modify the existing canonical baseline in place;
- include the user decision / independent-review context that caused the change;
- do not create `_old`, `_v2`, duplicate baseline files, or competing sources of truth;
- reconcile source, Kintone config, tests, Control Center, and Active Task against the updated baseline.

If an operational document conflicts with Confirmed Baseline, execution must STOP until the conflict is reconciled.

---

## 6. Permanent Review Contract

When the user says `review`, ChatGPT must:
1. re-fetch current canonical branch HEAD;
2. read `AI_CONTROL_CENTER.md`;
3. inspect the actual latest diff/evidence;
4. compare relevant implementation against Confirmed Baseline;
5. independently decide PASS / CORRECTIVE / BLOCKED;
6. promote any newly accepted durable important fact into Confirmed Baseline in the same control cycle;
7. update Control Center and the next Active Task;
8. avoid sending review work back to Antigravity unless execution is actually required.

---

## 7. Permanent New-Chat Contract

Every fresh AI session must first enter through:
1. `AI_START_HERE.md`;
2. `AI_CONTROL_CENTER.md`;
3. relevant `CONFIRMED_BASELINE/` files;
4. current `AI_ACTIVE_TASK.md`;
5. actual latest Git evidence.

The AI must reconstruct truth from repository evidence instead of asking the user to repeat established project history.

---

## 8. Confirmed Operating Principle

```text
CONFIRMED durable truth  -> CONFIRMED_BASELINE
Current operational truth -> AI_CONTROL_CENTER
Current executor command  -> AI_ACTIVE_TASK
Implementation evidence   -> Git / Kintone
Planning + review          -> ChatGPT
Execution only             -> Antigravity when necessary
```

This model is mandatory for the remainder of MBO2026 unless explicitly changed by the user and then promoted into Confirmed Baseline.
