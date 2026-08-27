# AI START HERE — MBO2026

> **Mandatory for every AI: ChatGPT, Antigravity, Codex, Claude, or any future assistant.**
>
> Before planning, reviewing, coding, changing Kintone, or reporting project status, read:
>
> **`project-docs/AI_CONTROL_CENTER.md` FIRST.**

---

## 0. Absolute First Read

1. **[`project-docs/AI_CONTROL_CENTER.md`](./AI_CONTROL_CENTER.md)** — current operational truth, D1–D7 status, authorization ledger, latest accepted/pending evidence, next action owner, and Antigravity low-credit policy.
2. **[`project-docs/CONFIRMED_BASELINE/README.md`](./CONFIRMED_BASELINE/README.md)** — durable source-of-truth rules and mandatory baseline-promotion policy.

Do not start by reading the whole repository.
Do not ask the user to repeat project history before reading the Control Center and relevant Confirmed Baseline.

---

## 1. Authority Order

When facts conflict:

1. `project-docs/CONFIRMED_BASELINE/` = confirmed durable business / technical / security / governance semantics.
2. `project-docs/00_MASTER_JOBLIST.md` = D1–D7 completeness / no-drop authority.
3. `project-docs/AI_CONTROL_CENTER.md` = current operational state / authorization / next action / credit policy.
4. `project-docs/AI_ACTIVE_TASK.md` = current short executor package only.
5. Git/Kintone evidence = implementation facts; repository evidence beats chat memory.

Report conflicts. Never silently overwrite Confirmed Baseline semantics.

---

## 2. Mandatory Baseline Promotion Rule

Every important durable fact that becomes confirmed MUST be promoted into `project-docs/CONFIRMED_BASELINE/` in the same control cycle.

Do not leave confirmed important facts only in:
- chat history;
- AI_CONTROL_CENTER;
- AI_ACTIVE_TASK;
- screenshots;
- execution evidence;
- CHANGELOG/HANDOFF.

Baseline-worthy facts include confirmed architecture, source-of-truth definitions, app IDs, field semantics, authentication/security design, role/permission model, routing/workflow/scoring rules, mandatory UI/UX rules, migration authority, and durable AI governance.

Temporary status/blockers/pending-review claims remain in Control Center/evidence until independently accepted as a durable rule.

**Baseline promotion is primarily ChatGPT Control Plane responsibility. Do not spend Antigravity credit on it unless an exact narrow task explicitly requires Antigravity.**

---

## 3. Role-Based Reading — Do Not Over-Read

### ChatGPT / Control Plane / Independent Reviewer

Read in this order:

1. `AI_CONTROL_CENTER.md`
2. current Git branch HEAD
3. `CONFIRMED_BASELINE/README.md` + only relevant canonical baseline files
4. `AI_ACTIVE_TASK.md`
5. `00_MASTER_JOBLIST.md` when D1–D7 completeness/context is needed
6. latest relevant commit/diff/source/test/evidence

Read broader historical docs only when a real conflict or missing fact requires them.

### Antigravity / Execution Plane

Read only:

1. `AI_CONTROL_CENTER.md`
2. `AI_ACTIVE_TASK.md`
3. exact files explicitly listed in the active task

Antigravity must NOT read the entire repo or all project documents by default.
It must NOT enter planning mode when the Active Task already contains an approved execution plan.

### Codex or Other Execution AI

If explicitly selected by the user, follow the same low-credit / execution-only rules as Antigravity unless Control Plane states otherwise.
Do not silently switch execution planes.

---

## 4. Permanent Role Contract

**ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer**

ChatGPT owns planning, design, broad repository analysis, Git review, PASS/FAIL decisions, status tracking, Confirmed Baseline promotion, writing the Control Center, and creating the short Active Task.

**Antigravity = Low-Credit Execution Plane**

Use Antigravity only for actual source implementation, live Kintone operations, environment-specific build/runtime work, or other exact execution that ChatGPT cannot directly perform.

Do not spend Antigravity credit on planning, repository archaeology, self-review, long reports, repeated UAT, broad tests, or documentation maintenance unless specifically required.

Full policy is in `AI_CONTROL_CENTER.md` and `CONFIRMED_BASELINE/AI_OPERATING_GOVERNANCE.md`.

---

## 5. Seven Mandatory Closeout Jobs — No Drop

```text
D1 = Login + Password Change + Employee-Self MBO Gate
D2 = Excel + PDF Export in Original/Legacy Format
D3 = 8 Legacy PMS Apps -> App794 Migration
D4 = HR Control Center / App800 End-to-End Management
D5 = Copy Own Previous MBO / Carry Forward
D6 = Integrated E2E / Security / Regression Closure
D7 = Admin Support Center Completion
```

Current status is tracked in `AI_CONTROL_CENTER.md`.
Acceptance detail remains in `00_MASTER_JOBLIST.md` and Confirmed Baseline.

---

## 6. Core Governance

- App53 and legacy PMS Apps 283, 310, 305, 643, 307, 640, 715, 716 remain protected/read-only unless a separately approved operation says otherwise.
- `admin-form` = Technical Admin only; zero business workflow authority.
- No Kintone POST/PUT/DELETE/deploy outside the current approved authorization boundary.
- No false PASS; implementer cannot self-certify independent review.
- Execution Plane maximum state is `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW` or an equivalent pending-review state.
- Manual live UI UAT remains mandatory where the Control Center/Baseline says it is a closure gate.
- Do not repeat approvals already granted unless scope/risk materially changes.
- Newly confirmed important durable information must be promoted to Confirmed Baseline before the control cycle is considered complete.

---

## 7. Standard Working Loop

```text
ChatGPT reads Control Center + relevant Baseline + Git
        ↓
ChatGPT decides smallest next step
        ↓
If execution needed -> short AI_ACTIVE_TASK
        ↓
Antigravity executes only that task
        ↓
commit + push + STOP
        ↓
User says review
        ↓
ChatGPT independently re-fetches GitHub
        ↓
PASS / corrective / blocker
        ↓
Promote any newly confirmed durable fact to CONFIRMED_BASELINE
        ↓
Update AI_CONTROL_CENTER / AI_ACTIVE_TASK
```

---

## 8. New Chat

For a fresh ChatGPT conversation, use:

**`project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md`**

The new chat must reconstruct project truth from GitHub, beginning with `AI_CONTROL_CENTER.md` and relevant Confirmed Baseline, instead of relying on copied chat history.
