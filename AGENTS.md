# MBO2026 Agent Governance & Guidance Policy

Updated: 2026-09-09 ICT

## 1. Authority and roles

1. **Human Owner** = final human authority for decisions, work-package authorization and scope changes.
2. **ChatGPT** = Control Plane / Project Lead / Architect / Independent Reviewer.
3. **Antigravity** = LOW-CREDIT / BOUNDED execution plane only when explicitly authorized.
4. **Claude / other agents** = specialist or second opinion; STOP by default unless routed by the Control Plane or Owner.

Canonical branch: `ai/antigravity-wp002c`.

Fresh-fetch the canonical branch before any status, review or execution decision.

## 2. MBO Control Truth V3

The governing contract is:

`project-docs/MBO_CONTROL_GOVERNANCE_CONSOLIDATION.md`

Current-state authority is intentionally narrow:

1. `project-docs/AI_CONTROL_CENTER.md` — primary current cross-project control truth and next gate.
2. `project-docs/control/02_ACTIVE_WORK_PACKAGE.md` — exact active authorization/scope when a package is active.
3. `project-docs/control/00_MASTER_DELIVERY_CONTROL.md` — D1-D7 stage scoreboard.

`project-docs/AI_ACTIVE_TASK.md` is an execution-packet convenience view; if it conflicts with `02_ACTIVE_WORK_PACKAGE.md`, the latter wins.

The following are routing/reference documents and are **NOT independent live-status authority**:

- `project-docs/AI_START_HERE.md`
- `project-docs/CHAT_HANDOFF.md`
- `project-docs/AI_DOCUMENT_INDEX.md`
- `project-docs/00_MASTER_JOBLIST.md`
- `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md`
- `project-docs/AI_HANDOFF_PROTOCOL.md`
- `project-docs/AI_REVIEW_PACKAGE.md`

Locked decision, baseline and evidence documents remain authoritative for their own subject matter.

## 3. Conflict precedence

Highest to lowest:

1. latest explicit Owner decision/authorization;
2. accepted concrete Git/Kintone/runtime evidence for factual implementation/live-state claims;
3. `AI_CONTROL_CENTER.md` current control truth;
4. `control/02_ACTIVE_WORK_PACKAGE.md` exact active scope;
5. `control/00_MASTER_DELIVERY_CONTROL.md` stage scoreboard;
6. locked decision/baseline/evidence documents for subject-specific contracts;
7. routing/reference summaries and historical review documents.

Lower-precedence embedded checkpoints must never override a higher-precedence source.

## 4. Review policy

Substantive architecture, source, schema, security, test, migration, Kintone or deployment changes require independent review before closure.

Metadata-only control transcription does **not** create a recursive review package. Recording an already accepted decision/verdict, correcting a stale next-action label, updating document links or synchronizing routing/reference documents may use:

`EXECUTE -> SAME-RUN CONSISTENCY VERIFY -> CLOSE`

A corrective is opened only for a material defect, not merely because a non-authoritative summary contains an older embedded checkpoint.

## 5. Safety invariants

No agent may autonomously:

- create or widen a work package without Owner authority;
- modify production source, schema/config, tests, Kintone data/process/ACL or live deployment outside exact authorized scope;
- merge/rebase/reset/force unless explicitly authorized;
- delete or weaken tests to obtain PASS;
- treat a docs-only approval as implementation, deployment or Kintone-write authorization;
- self-certify substantive execution that requires independent review.

Live Kintone rule:

```text
NO_AUTH = NO_WRITE
ONE_SHOT = ONE_EXACT_OPERATION
NO_WIDENING
NO_REUSE
NO_AUTOMATIC_ROLLBACK
```

App53 and protected legacy PMS apps remain read-only by default unless an exact authorization says otherwise.

## 6. Matt Pocock / generic skills

Skills under `.agents/skills/` are **SUPPLEMENTAL AND ADVISORY ONLY**.

Precedence:

1. Owner approval
2. MBO project governance and locked contracts
3. MBO-specific skills/profiles/tools
4. generic skills

Generic skills must not create competing status documents, override MBO governance, auto-commit, auto-expand scope or alter live systems without authority.

## 7. GitHub Issues and supplemental docs

GitHub Issues are optional tracking/request surfaces, not authoritative MBO status or approval records. Issue writes require explicit Owner or active-work-package authorization.

`CONTEXT.md`, `CONTEXT-MAP.md`, `docs/adr/*` and similar supplemental artifacts must not compete with the MBO control-truth hierarchy.
