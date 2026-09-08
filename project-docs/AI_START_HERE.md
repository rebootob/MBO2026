# AI START HERE — MBO2026

> Mandatory lean entry point. This file is routing guidance, **not current project-status authority**.
> Updated: 2026-09-09 ICT.

## 1. Canonical startup order

Before planning, reviewing, coding, changing Kintone or reporting status:

1. Fresh-fetch current HEAD of `ai/antigravity-wp002c`.
2. Read `project-docs/AI_CONTROL_CENTER.md` — primary current control truth.
3. Read `project-docs/control/02_ACTIVE_WORK_PACKAGE.md` — exact active authorization/scope, if any.
4. Read `project-docs/control/00_MASTER_DELIVERY_CONTROL.md` — D1-D7 stage scoreboard.
5. Read `project-docs/AI_ACTIVE_TASK.md` only when execution/review details are needed.
6. Read `project-docs/AI_DOCUMENT_INDEX.md` to route to exact locked decisions/baselines/evidence.
7. Read `project-docs/CHAT_HANDOFF.md` only as a convenience handoff pointer; it is not status authority.
8. Inspect exact source/tests/diff/live evidence only when the current gate requires it.

Do not broad-scan historical documents by default.

## 2. Authority model

Read and obey:

`project-docs/MBO_CONTROL_GOVERNANCE_CONSOLIDATION.md`

Current-state precedence:

```text
Owner latest explicit decision
-> accepted concrete Git/Kintone/runtime evidence
-> AI_CONTROL_CENTER.md
-> control/02_ACTIVE_WORK_PACKAGE.md
-> control/00_MASTER_DELIVERY_CONTROL.md
-> locked subject-specific decisions/baselines/evidence
-> routing/reference/historical summaries
```

This Start Here file intentionally contains **no mutable HEAD, app revision, active defect list, active work package or current next gate**.

## 3. Permanent roles

```text
Owner = final human authority
ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
Antigravity = LOW-CREDIT / BOUNDED Execution Plane only when genuinely necessary
Claude / other agents = specialist / second opinion / STOP by default
```

## 4. Permanent safety

- Fresh-fetch before status/review/execution decisions.
- No false PASS.
- No source/schema/test/build/deployment/Kintone write without exact bounded authorization.
- Never widen or reuse a consumed authorization.
- Closed functions reopen only for proven regression or explicit Owner change request.
- App53 and protected legacy apps are read-only by default.
- Docs-only approval never implies implementation or deployment authorization.

## 5. Review behavior

Substantive architecture/source/schema/security/test/migration/deployment/live changes require independent review.

Metadata-only control transcription and routing-document maintenance use same-run verification and do **not** create recursive review packages merely to update review-gate labels.

See `MBO_CONTROL_GOVERNANCE_CONSOLIDATION.md` for the exact rule.

## 6. User shorthand

`review` -> fresh-fetch; inspect the exact substantive authorization/diff/evidence; decide PASS/CORRECTIVE/BLOCKED.

`ต่อ` / `ต่อไป` -> fresh-fetch current gate and propose only the smallest safe next action.

`อนุมัติ ...` -> exact bounded one-shot authorization only.

## 7. New chat

Use `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md`.

That bootstrap intentionally contains no embedded mutable project checkpoint; the new chat must fresh-fetch and read the authoritative control documents instead.
