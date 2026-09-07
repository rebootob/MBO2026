# MBO2026 Agent Governance & Guidance Policy

## Authoritative Project Governance
1. **Human Owner Approval**: Final human authority for all repository decisions, work package authorizations, and changes.
2. **Project Documentation Authority**: Existing `project-docs/` documentation is authoritative.
   - Primary startup and control documents:
     - `project-docs/AI_START_HERE.md`
     - `project-docs/AI_CONTROL_CENTER.md`
     - `project-docs/AI_ACTIVE_TASK.md`
     - `project-docs/AI_DOCUMENT_INDEX.md`
3. **Control Plane / Project Lead / Architect**: ChatGPT serves as Control Plane, Architect, and Independent Reviewer.
4. **Execution Plane**: AI coding agents operate as bounded, low-credit execution agents.

## Matt Pocock Skills Status & Precedence
Matt Pocock Skills (installed under `.agents/skills/`) are **SUPPLEMENTAL AND ADVISORY ONLY**.

### Conflict Precedence Hierarchy (Highest to Lowest)
1. **Owner Approval**
2. **MBO `project-docs/` Governance**
3. **MBO-Specific Skills / Profiles / Tools**
4. **Matt Pocock Generic Skills**

### Safety Invariants & Execution Restrictions
Generic Matt Pocock guidance must **NEVER** override MBO-specific safety rules. Matt Skills MUST NOT autonomously:
- Create git commits, pushes, merges, or pull requests unless explicitly authorized by Owner / active work package.
- Modify production source code (`src/`), Kintone app schemas, or live environments without explicit work package scope.
- Delete, alter, or ignore unit, integration, or regression tests.
- Re-architect, refactor, or expand scope beyond authorized work package boundaries.
- Move, replace, or supersede existing `project-docs/` files or create competing sources of project status truth.

## Agent skills

### Issue tracker

GitHub Issues are an OPTIONAL, supplemental tracking/request surface only. GitHub Issues are NOT the authoritative source for MBO specifications, work packages, approvals, project status, or closure state; `project-docs/*` remains strictly authoritative. Any GitHub issue WRITE operation (create, comment, edit, label, assign, close, or reopen) requires explicit Owner or active work-package authorization. See `docs/agents/issue-tracker.md`.

### Domain docs

Existing MBO `project-docs/*` is the authoritative project, domain, and control documentation system. `CONTEXT.md`, `CONTEXT-MAP.md`, and `docs/adr/*` are optional supplemental Matt-compatible documents only and MUST NOT supersede, replace, duplicate, or redefine project status truth. Matt Skills MUST NOT create these documents automatically without explicit authorization. See `docs/agents/domain.md`.
