# MBO2026 — LEAN MULTI-AI HANDOFF PROTOCOL

> Provider-neutral continuity standard.
> Updated: 2026-09-09 ICT.
> Core principle: **AI can change; project truth must not change.**

## 1. Authority and roles

```text
Owner = final human authority
ChatGPT = Control Plane / Project Lead / Architect / Independent Reviewer
Antigravity = LOW-CREDIT / BOUNDED Execution Plane only
Canonical branch = ai/antigravity-wp002c
```

The governing control-truth model is:

`project-docs/MBO_CONTROL_GOVERNANCE_CONSOLIDATION.md`

Current-state authority is intentionally narrow:

1. `AI_CONTROL_CENTER.md` = primary current control truth and next gate.
2. `control/02_ACTIVE_WORK_PACKAGE.md` = exact active authorization/scope.
3. `control/00_MASTER_DELIVERY_CONTROL.md` = D1-D7 stage scoreboard.

`AI_ACTIVE_TASK.md` is a convenience execution packet. `CHAT_HANDOFF.md`, `AI_START_HERE.md`, `AI_DOCUMENT_INDEX.md`, `00_MASTER_JOBLIST.md`, `NEW_CHAT_BOOTSTRAP_PROMPT.md` and `AI_REVIEW_PACKAGE.md` are routing/reference/historical surfaces, not parallel status authorities.

## 2. Receiving-AI startup

1. Fresh-fetch current canonical HEAD.
2. Read `AI_CONTROL_CENTER.md`.
3. Read `control/02_ACTIVE_WORK_PACKAGE.md`.
4. Read `control/00_MASTER_DELIVERY_CONTROL.md`.
5. Read `AI_ACTIVE_TASK.md` only if execution/review details are needed.
6. Read `AI_DOCUMENT_INDEX.md` to locate exact locked decisions/baselines/evidence.
7. Inspect exact source/tests/diff/live evidence only when required by the current gate.

Do not broad-read historical docs by default and do not treat embedded old checkpoints as current authority.

## 3. Conflict resolution

Use this precedence:

```text
Latest explicit Owner decision
> accepted concrete Git/Kintone/runtime evidence
> AI_CONTROL_CENTER.md
> control/02_ACTIVE_WORK_PACKAGE.md
> control/00_MASTER_DELIVERY_CONTROL.md
> locked subject-specific decision/baseline/evidence
> routing/reference/historical summary
```

If two control documents conflict, stop substantive execution and reconcile against the higher-precedence source. Do not guess.

## 4. Executor handoff checkpoint

A bounded execution agent must:

1. fresh-fetch HEAD;
2. read the exact active authorization contract;
3. modify only allowed files/operations;
4. run only required tests/build/runtime operations;
5. preserve safety gates;
6. report exact changed files/commits/tests/operations;
7. stop after the authorized scope.

Execution agents cannot self-authorize or self-certify substantive PASS/CLOSED.

## 5. Review policy

### 5.1 Substantive changes

Architecture, source, schema/config, security/privacy, tests, migration/backfill, Kintone writes/process changes, deployment/cutover and live-runtime PASS claims require independent Control Plane review.

Normal pattern:

`OWNER AUTH -> BOUNDED EXECUTION -> ONE INDEPENDENT REVIEW -> CLOSE`

If a material defect is found:

`-> ONE BOUNDED CORRECTIVE -> ONE REVIEW -> CLOSE`

### 5.2 Metadata/control transcription

A new recursive review package is **not required** when the operation only records an already accepted decision/verdict, updates links, corrects stale next-action wording, or synchronizes routing/reference documents without changing the underlying contract.

Use:

`EXECUTE -> SAME-RUN CONSISTENCY VERIFY -> CLOSE`

Do not create R1/R2/R3 merely so every file can mention the latest review-gate label.

## 6. Control Plane handoff checkpoint

Before leaving a substantive package, ensure the authoritative layers are sufficient:

- Control Center has current cross-project state and next gate;
- Active Work Package has exact authorization/scope or says `NONE`;
- Master Delivery reflects any changed D1-D7 stage status;
- exact decision/evidence docs retain durable subject-specific truth.

Do not copy the same current-state block into every startup/reference document.

## 7. Live Kintone safety

No POST/PUT/DELETE/deploy/ACL/group/schema/record/process mutation without fresh exact Owner authorization naming target and scope.

```text
NO_AUTH = NO_WRITE
ONE_SHOT = ONE_EXACT_OPERATION
NO_WIDENING
NO_REUSE
NO_AUTOMATIC_ROLLBACK
```

App53 and protected legacy PMS apps remain read-only by default.

## 8. New-chat procedure

Use `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md`.

The bootstrap carries no mutable checkpoint. The receiving chat must derive current state from fresh repository truth and the authoritative control layers.
