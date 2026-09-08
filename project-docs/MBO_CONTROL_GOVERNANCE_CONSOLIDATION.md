# MBO2026 Control Governance Consolidation

Status: OWNER APPROVED / EFFECTIVE
Date: 2026-09-09 ICT
Work Package: `MBO-CONTROL-GOVERNANCE-CONSOLIDATION`
Type: `DOCS-ONLY / GOVERNANCE CONSOLIDATION`
Canonical branch: `ai/antigravity-wp002c`
Starting HEAD: `5ccede8921ab363106679e374da72479bc5f660d`

## 1. Purpose

This governance contract eliminates duplicated current-state authority and recursive metadata-review loops while preserving MBO2026 safety gates.

The problem being corrected is structural:

- too many startup, handoff, index and job-list documents were carrying mutable project status;
- a small control-state change required synchronizing many copies of the same truth;
- missed mirrors produced corrective packages whose only purpose was to update the name of the review gate;
- that pattern could recurse indefinitely without improving business, architecture, implementation or safety quality.

This work package changes governance/document roles only. It does not change D1-D7 business requirements, D3 routing architecture, source code, tests, schema, Kintone configuration or deployment state.

## 2. Authority hierarchy

When sources disagree, use the following precedence from highest to lowest:

1. **Latest explicit Human Owner decision/authorization.**
2. **Accepted concrete Git/Kintone/runtime evidence for factual implementation or live-state claims.**
3. **`project-docs/AI_CONTROL_CENTER.md`** for current cross-project control state, current gate and authorization summary.
4. **`project-docs/control/02_ACTIVE_WORK_PACKAGE.md`** for the exact scope and authorization of the currently active execution package, when one exists.
5. **`project-docs/control/00_MASTER_DELIVERY_CONTROL.md`** for D1-D7 stage-level scoreboard and delivery state.
6. **Locked decision/baseline/evidence documents** for their subject-specific durable contracts.
7. **Routing/reference documents** such as Start Here, Handoff, Document Index, Master Joblist, New Chat Bootstrap and historical review packages.

A lower-level document must never override a higher-level authority merely because it contains a newer-looking embedded checkpoint.

## 3. Single-source current-truth model

### 3.1 `AI_CONTROL_CENTER.md`

Role: **PRIMARY CURRENT CONTROL TRUTH**.

It owns:

- current D1-D7 summary;
- current active gate;
- current implementation/deployment/Kintone authorization state;
- current locked architecture summary;
- exact next permitted action.

Mutable current project state should not be duplicated in startup/reference documents.

### 3.2 `control/02_ACTIVE_WORK_PACKAGE.md`

Role: **EXACT ACTIVE AUTHORIZATION CONTRACT**.

It owns:

- active work-package ID and title;
- exact Owner authorization;
- exact allowed files/operations;
- forbidden operations;
- execution/review status for substantive work.

If there is no active execution package, it must say `ACTIVE_WORK_PACKAGE = NONE` and route back to the Control Center.

### 3.3 `control/00_MASTER_DELIVERY_CONTROL.md`

Role: **D1-D7 STAGE SCOREBOARD**.

It owns stage-level progress only. It must not reproduce full work-package narratives or detailed review provenance.

### 3.4 `AI_ACTIVE_TASK.md`

Role: **EXECUTION-PACKET CONVENIENCE VIEW**.

It may summarize the active package but is not an independent status authority. If it conflicts with `02_ACTIVE_WORK_PACKAGE.md`, the latter wins.

### 3.5 Non-authoritative routing/reference documents

The following must not be treated as live-status authority:

- `project-docs/AI_START_HERE.md`
- `project-docs/CHAT_HANDOFF.md`
- `project-docs/AI_DOCUMENT_INDEX.md`
- `project-docs/00_MASTER_JOBLIST.md`
- `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md`
- `project-docs/AI_HANDOFF_PROTOCOL.md`
- `project-docs/AI_REVIEW_PACKAGE.md`

These documents may route readers to authoritative sources and durable evidence, but should not carry mutable HEADs, app revisions, active defect lists, current work-package status or next-review-gate mirrors unless explicitly marked historical.

## 4. Review-loop elimination policy

### 4.1 Independent review is required for substantive change

A distinct independent Control Plane review remains required when a package changes or proposes to change any of the following:

- business rules or architecture;
- production/source code;
- security or privacy controls;
- schema/configuration;
- migration/backfill behavior;
- Kintone process or record writes;
- deployment/cutover;
- test meaning or acceptance criteria;
- runtime/live evidence used to claim PASS.

### 4.2 Same-run verification is sufficient for control transcription

A separate recursive review package is **not required** when the only operation is:

- recording an already accepted Owner decision;
- recording an already issued independent PASS/FAIL verdict;
- synchronizing metadata or document links without changing the underlying contract;
- correcting a stale next-action label;
- updating routing/startup/index documents to point at existing authority;
- closing a docs-only control package after its exact diff is verified in the same Control Plane run.

These operations use:

`EXECUTE -> SAME-RUN CONSISTENCY VERIFY -> CLOSE`

They must not create `R1 -> R2 -> R3` solely because each corrective needs its own review-gate wording copied everywhere.

### 4.3 Correctives require material findings

Open a corrective only for a material defect such as:

- wrong business/architecture contract;
- missing safety gate;
- unauthorized substantive operation;
- incorrect source/schema/test behavior;
- insufficient or contradictory evidence that affects a decision;
- current-state contradiction inside one of the three authoritative control layers.

Do **not** open a corrective solely because a non-authoritative routing/reference document contains an older embedded snapshot. Fix or simplify that reference document in the same docs-only maintenance run.

## 5. Control-document update rule

For future work:

1. Update `AI_CONTROL_CENTER.md` if cross-project current state changes.
2. Update `02_ACTIVE_WORK_PACKAGE.md` when active authorization/scope changes.
3. Update `00_MASTER_DELIVERY_CONTROL.md` only when D1-D7 stage status changes.
4. Update `AI_ACTIVE_TASK.md` only when a human-readable active packet is useful.
5. Update `CHAT_HANDOFF.md` only as a pointer/brief handoff, not as a parallel truth database.
6. Update `AI_DOCUMENT_INDEX.md` only when document routing/index membership changes.
7. Do not update Start Here, Bootstrap or Master Joblist for every work package.

## 6. D3 provenance reconciliation accepted by Owner

The current Owner session explicitly authorized the D3-008 control-sync corrective chain and then ordered this consolidation.

Accordingly, contrary repository wording that classified `D3-DECISION-008-SYNC-R1` as unauthorized is superseded by the actual Owner authorization record.

Authoritative treatment after this consolidation:

```text
D3-DECISION-008-SYNC = PASS / CLOSED
D3-DECISION-008-SYNC-R1 = PASS / CLOSED AS CORRECTED BY R2
D3-DECISION-008-SYNC-R2 = PASS / CLOSED
OWNER_DEC_D3_008 = LOCKED / OWNER APPROVED
```

This reconciliation is provenance/control metadata only. It does not change the D3-008 architecture contract.

## 7. Current durable D3 boundary retained

```text
D3_ROUTING_ARCHITECTURE = LOCKED THROUGH OWNER_DEC_D3_008
OWNER_DEC_D3_008 = HYBRID_APP794_MINIMAL_NATIVE_PLUS_APP798_EVENT_SCOPED_FULL_IMMUTABLE_ROUTE_SNAPSHOT
D3_IMPLEMENTATION_AUTHORIZED = NO
APP794_FIELD_CREATION_AUTHORIZED = NO
APP795_SCHEMA_MIGRATION_AUTHORIZED = NO
APP798_BEHAVIOR_IMPLEMENTATION_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
KINTONE_WRITES_AUTHORIZED = NONE
PRODUCTION_READY = NO
```

No implementation-readiness or implementation package is started by this governance consolidation.

## 8. Safety rules retained

- Fresh-fetch canonical HEAD before status/review/execution decisions.
- Owner remains final human authority.
- Antigravity remains bounded/low-credit execution only.
- No source/schema/test/build/deployment/Kintone write without explicit bounded authorization.
- Closed functions reopen only for proven regression or explicit Owner change request.
- No merge/rebase/reset/force is implied by a control-document task.
- No docs-only approval implies production readiness.

## 9. Expected operating pattern after consolidation

Normal substantive work should follow:

`OWNER AUTHORIZATION -> ONE BOUNDED EXECUTION -> ONE INDEPENDENT REVIEW -> CLOSE`

If a material finding exists:

`-> ONE BOUNDED CORRECTIVE -> ONE REVIEW -> CLOSE`

Metadata-only closure/transcription after that review is part of the same Control Plane run and must not generate another review loop.
