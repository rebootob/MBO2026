# Domain Docs

How engineering skills must consume domain documentation in MBO2026.

## Startup & Exploration Routing

Before Matt Skills explore MBO2026, they must follow the authoritative MBO project-docs routing order:

1. `project-docs/AI_START_HERE.md`
2. The startup and control-document order routed from there (e.g. `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`)
3. `project-docs/AI_DOCUMENT_INDEX.md`
4. Relevant `project-docs/CONFIRMED_BASELINE/` documents only as routed by control documents

## Governance Invariants

- **`project-docs/*` is strictly authoritative**: All domain definitions, architecture decisions, task statuses, and baseline specifications reside in `project-docs/*`.
- **Repository/live evidence beats Matt compatibility docs**: Codebase truth, test suites, and `project-docs/` take precedence over any generic or supplemental markdown files.
- **Supplemental docs status**: `CONTEXT.md`, `CONTEXT-MAP.md`, and `docs/adr/*` are optional, supplemental Matt-compatibility documents only if explicitly introduced later.
- **Absence is normal**: If `CONTEXT.md` or `docs/adr/` do not exist, proceed silently. Their absence is standard and normal for MBO2026.
- **No autonomous creation**: Matt Skills MUST NOT autonomously create `CONTEXT.md`, `CONTEXT-MAP.md`, or `docs/adr/*` without explicit Owner or work-package authorization.
- **No competing sources of truth**: No Matt domain document may become a competing source of project status or specification truth.
