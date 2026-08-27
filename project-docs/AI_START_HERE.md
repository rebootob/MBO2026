# AI Start Here — Master Entry Point for Multi-AI Development

> **Mandatory Rule for All AI Assistants (Antigravity, Codex, Claude, ChatGPT, etc.):**  
> Before analyzing, planning, reviewing, or executing any task in this repository, you MUST read `project-docs/00_MASTER_JOBLIST.md` first. The seven D1–D7 closeout jobs in that file must never be dropped across chats or handoffs.

---

## 0. Absolute First Read

1. **[`project-docs/00_MASTER_JOBLIST.md`](./00_MASTER_JOBLIST.md)** — master job completeness, continuity, no-drop control, D1–D7 scoreboard, and new-chat continuation contract.

If this file conflicts with `project-docs/CONFIRMED_BASELINE/` on a confirmed business/technical fact, the Confirmed Baseline wins for semantics and the conflict must be reported. `00_MASTER_JOBLIST.md` remains authoritative for the fact that all seven closeout jobs must stay in scope.

---

## 1. Mandatory Reading Order

After `00_MASTER_JOBLIST.md`, read in this exact order:

1. **[`project-docs/CONFIRMED_BASELINE/README.md`](./CONFIRMED_BASELINE/README.md)** and **ALL files under `project-docs/CONFIRMED_BASELINE/`** — confirmed source of truth.
2. **[`project-docs/AI_START_HERE.md`](./AI_START_HERE.md)** — this orientation document.
3. **[`project-docs/AI_ACTIVE_TASK.md`](./AI_ACTIVE_TASK.md)** — current tactical execution package.
4. **[`project-docs/TODAY_MBO_CLOSEOUT_MISSION.md`](./TODAY_MBO_CLOSEOUT_MISSION.md)** — current seven-deliverable closeout mission when present.
5. **[`project-docs/AI_REVIEW_PACKAGE.md`](./AI_REVIEW_PACKAGE.md)** — latest standardized Work Package review package.
6. **[`project-docs/AI_HANDOFF_PROTOCOL.md`](./AI_HANDOFF_PROTOCOL.md)** — Multi-AI handoff & continuity rules.
7. **[`project-docs/IMPLEMENTATION_STATUS.md`](./IMPLEMENTATION_STATUS.md)** — authoritative current phase, active AI, and review status.
8. **[`project-docs/CURRENT_STATE.md`](./CURRENT_STATE.md)** — live system state & active apps.
9. **[`project-docs/HANDOFF.md`](./HANDOFF.md)** — operational handoff notes & exact next action.
10. **[`project-docs/implementation/FINAL_IMPLEMENTATION_BLUEPRINT.md`](./implementation/FINAL_IMPLEMENTATION_BLUEPRINT.md)** — consolidated target architecture.
11. Relevant frozen architecture blueprints in `project-docs/architecture-redesign/`.
12. **[`project-docs/BUSINESS_RULES.md`](./BUSINESS_RULES.md)** — authoritative business rules & weights where not superseded by Confirmed Baseline.
13. **[`project-docs/DECISIONS.md`](./DECISIONS.md)** — architectural decision log.
14. **[`project-docs/OPEN_ISSUES.md`](./OPEN_ISSUES.md)** — open questions & observations.
15. **[`project-docs/DEFECT_REGISTER.md`](./DEFECT_REGISTER.md)** — active bug tracking register.
16. Relevant test matrices (`ROUTING_TEST_MATRIX.md`, `SCORING_TEST_MATRIX.md`, `GUIDED_UX_TEST_MATRIX.md`).

---

## 2. Seven Mandatory Closeout Jobs — No-Drop Index

Every AI handoff/review must retain these IDs:

```text
D1 = Login + Password Change + Strict Employee Data Isolation
D2 = Excel + PDF Export in Original/Legacy Format
D3 = 8 Legacy PMS Apps -> App794 Migration
D4 = HR Control Center / App800 End-to-End Management
D5 = Copy Own Previous MBO / Carry Forward
D6 = Integrated E2E / Security / Regression Closure
D7 = Admin Support Center Completion
```

Details and acceptance criteria live in `project-docs/00_MASTER_JOBLIST.md`.

---

## 3. Core Governance Invariants

* **Hard Write Lock by Default:** No POST/PUT/DELETE or deploy to Kintone unless the exact operation has an approved Work Package and explicit authorization.
* **Protected Sources:** App53 and legacy PMS Apps 283, 310, 305, 643, 307, 640, 715, 716 remain READ ONLY.
* **No Orphan Policy:** Any replaced field, script, or configuration must follow the retirement lifecycle (`Orphan Count = 0`).
* **Frozen Architecture Protection:** Do not modify frozen/confirmed design without the required architecture-change/user-decision process.
* **Security Release Blocker:** Employee A must never see/export/copy/query Employee B data unless explicitly authorized by a legitimate role.
* **Admin Boundary:** `admin-form` is Technical Admin only and has zero business workflow authority.
* **No False PASS:** Implementation success is not independent review success. Preserve `IMPLEMENTED_PENDING_REVIEW` until reviewed.
* **Stop and Report:** Complete the authorized work package, test it, update living docs/job status, commit/push, report in Thai, then STOP for independent review when required.

---

## 4. New-Chat Continuity

When ChatGPT context becomes too long, do not copy the entire old conversation manually. Start a new chat using the **New Chat Continuation Prompt** stored in Section 6 of `project-docs/00_MASTER_JOBLIST.md`.

The new chat must reconstruct truth from GitHub repository evidence first, then continue the highest-priority unfinished D1–D7 item without asking the user to repeat project history unless a genuinely unresolved business decision exists.
