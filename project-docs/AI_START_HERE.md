# AI Start Here — Master Entry Point for Multi-AI Development

> **Mandatory Rule for All AI Assistants (Antigravity, Codex, Claude, etc.):**  
> You MUST read the documents below in exact order before analyzing, planning, or executing any task in this codebase.

---

## 1. Mandatory Reading Order

1. **[`project-docs/AI_START_HERE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/AI_START_HERE.md)** (This orientation document)
2. **[`project-docs/AI_HANDOFF_PROTOCOL.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/AI_HANDOFF_PROTOCOL.md)** (Multi-AI handoff & continuity rules)
3. **[`project-docs/IMPLEMENTATION_STATUS.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/IMPLEMENTATION_STATUS.md)** (Authoritative current phase, active AI, and approved scope)
4. **[`project-docs/CURRENT_STATE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/CURRENT_STATE.md)** (Live system state & active apps)
5. **[`project-docs/HANDOFF.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/HANDOFF.md)** (Operational handoff notes & exact next action)
6. **[`project-docs/implementation/FINAL_IMPLEMENTATION_BLUEPRINT.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/implementation/FINAL_IMPLEMENTATION_BLUEPRINT.md)** (Consolidated target architecture)
7. **Relevant Frozen Architecture Blueprints** in `project-docs/architecture-redesign/`
8. **[`project-docs/BUSINESS_RULES.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/BUSINESS_RULES.md)** (Authoritative business rules & weights)
9. **[`project-docs/DECISIONS.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/DECISIONS.md)** (Immutable architectural decision log)
10. **[`project-docs/OPEN_ISSUES.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/OPEN_ISSUES.md)** (Open questions & observations)
11. **[`project-docs/DEFECT_REGISTER.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/DEFECT_REGISTER.md)** (Active bug tracking register)
12. **Relevant Test Matrix** (`ROUTING_TEST_MATRIX.md`, `SCORING_TEST_MATRIX.md`, `GUIDED_UX_TEST_MATRIX.md`)

---

## 2. Core Governance Invariants
* **Hard Write Lock:** Strictly zero POST/PUT/DELETE calls to Kintone during discovery and planning phases (`DISCOVERY_MODE = true`).
* **No Orphan Policy:** Any replaced field, script, or configuration must follow the 7-step retirement lifecycle (`Orphan Count = 0`).
* **Frozen Architecture Protection:** Do not modify frozen designs (`DEC-013` to `DEC-028`) without a formal `ARCHITECTURE_CHANGE_REQUEST` (ACR) and user approval.
* **Stop and Report:** Complete one phase/work package at a time, verify tests, update registers, commit to Git, report in Thai, and STOP.
