# MBO2026 — AI DOCUMENT INDEX

Updated: 2026-09-10 ICT

> **Role:** document router/index only. This file is NOT current project-status authority and intentionally does not mirror active work-package state, app revision, current next gate or mutable D1-D7 status.

## 1. Start here

For current state:

1. `project-docs/AI_CONTROL_CENTER.md` — primary current control truth.
2. `project-docs/control/02_ACTIVE_WORK_PACKAGE.md` — exact active authorization/scope or NONE.
3. `project-docs/control/00_MASTER_DELIVERY_CONTROL.md` — D1-D7 stage scoreboard.
4. `project-docs/AI_ACTIVE_TASK.md` — convenience execution packet only.
5. This index — route to exact durable decisions/baselines/evidence.

Governance:

- `project-docs/MBO_CONTROL_GOVERNANCE_CONSOLIDATION.md`
- `project-docs/AI_HANDOFF_PROTOCOL.md`
- `AGENTS.md`

## 2. Startup / routing references

These are routing/reference surfaces, not independent live-status authority:

- `project-docs/AI_START_HERE.md`
- `project-docs/CHAT_HANDOFF.md`
- `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md`
- `project-docs/00_MASTER_JOBLIST.md`

## 3. Delivery-control documents

- `project-docs/control/00_MASTER_DELIVERY_CONTROL.md` — stage scoreboard.
- `project-docs/control/01_FUNCTION_COMPLETION_MATRIX.md` — evidence-grounded function inventory/completion matrix.
- `project-docs/control/02_ACTIVE_WORK_PACKAGE.md` — exact active authorization contract.
- `project-docs/control/03_RELEASE_EXIT_CHECKLIST.md` — release/cutover exit criteria.

## 4. D3 routing/scoring decision chain

Primary durable decision/evidence documents:

- `project-docs/D3_DECISION_SYNC_OWNER_ARCHITECTURE_ROUTING_DECISIONS.md` — D3-001/D3-002 decision sync foundation.
- `project-docs/D3_WP001_VARIABLE_1_4_APPRAISER_PROCESS_COMPATIBILITY_DESIGN.md`
- `project-docs/D3_WP001_R1_NATIVE_PROCESS_ROUTE_PATTERN_EFFECTIVE_DATED_ROUTING_CORRECTIVE.md`
- `project-docs/D3_WP001_R2_EFFECTIVE_DATED_ROUTING_HR_SCORING_ROLE_DESIGN.md`
- `project-docs/D3_WP001_R3_K_EXPECTED_ROUTE_VIABILITY_SELF_ELISION_SCORING_COMPATIBILITY_DESIGN.md`
- `project-docs/D3_WP001_R3_R1_DGM_AUTHORITY_SCORER_FAIL_CLOSED_CORRECTIVE.md`
- `project-docs/D3_DECISION_005_SINGLE_USER_ALL_ONLY_SYNC.md`
- `project-docs/D3_DECISION_006_EFFECTIVE_DATED_ROUTING_MODEL_A_SYNC.md`
- `project-docs/D3_WP001_R4_APP794_APP798_ROUTE_SNAPSHOT_METADATA_PERSISTENCE_DESIGN.md`
- `project-docs/D3_WP001_R4_R1_ROUTE_SNAPSHOT_AUTHORITY_ARCHIVE_EVENT_MODEL_CORRECTIVE.md`
- `project-docs/D3_DECISION_008_ROUTE_SNAPSHOT_PERSISTENCE_SYNC.md`
- `project-docs/D3_IMPLEMENTATION_READINESS_PLAN.md` — evidence-grounded implementation sequence, exact planned boundaries and live-preflight/deployment gates; does not itself authorize implementation.

D3 sandbox-migration planning/evidence/implementation/decision:

- `project-docs/D3_SBX_MIGRATION_01_PRE1.md` — exact 20-route migration/scorer/ACL plan derived from accepted preflight evidence.
- `project-docs/D3_SBX_MIGRATION_01_PRE1_R1.md` — manifest-integrity and complete migration-tooling blocker corrective.
- `project-docs/evidence/D3_SBX_MIGRATION_01_PRE1_MANIFEST.json` — machine-readable 20-route manifest and deterministic route-array integrity contract.
- `project-docs/D3_SBX_MIGRATION_01_EXE1.md` — local/test-only guarded App795/App794 migration executor implementation evidence and first independent-review findings.
- `project-docs/D3_SBX_MIGRATION_01_EXE1_R1.md` — exact record-set coverage and App794 provenance semantic-validation corrective evidence.
- `project-docs/D3_SBX_MIGRATION_01_EXE1_R2.md` — strict App794 scorer-slot JSON number/integer type corrective and targeted-regression evidence.
- `project-docs/D3_SBX_MIGRATION_01_BD1.md` — Owner scorer-mapping decision plus App794 `DEFER_REQUIREDNESS_NO_BACKFILL` policy; records that HR scorer concurrence remains required before live migration.
- `scripts/kintone/d3-sbx-migration-local-executor-r1.js` — preserved R1 public implementation substrate for the R2 canonical entrypoint.

For current acceptance/closure state, use `AI_CONTROL_CENTER.md`; do not infer current status from old headers embedded in historical work-package documents.

## 5. D3 architecture-redesign references

Use selectively according to the current question:

- `project-docs/architecture-redesign/CONTROLLED_REOPEN_REVISION_DESIGN.md`
- `project-docs/architecture-redesign/REVISION_DATA_MODEL_DESIGN.md`
- `project-docs/architecture-redesign/ROUTING_SNAPSHOT_DESIGN.md`
- `project-docs/architecture-redesign/GENERIC_ROUTING_ARCHITECTURE.md`
- `project-docs/architecture-redesign/EVALUATION_PROFILE_ARCHITECTURE.md`
- `project-docs/architecture-redesign/ANNUAL_EVALUATION_CYCLE_DESIGN.md`
- `project-docs/architecture-redesign/ANNUAL_PLAN_CARRY_FORWARD_DESIGN.md`
- `project-docs/architecture-redesign/BUSINESS_RULE_TRUTH_TABLE.md`

Do not broad-read the full architecture-redesign directory unless the current gate requires it.

## 6. Confirmed baselines

`project-docs/CONFIRMED_BASELINE/` contains durable accepted baselines. Read only the baseline relevant to the current decision. A baseline defines durable subject truth; it does not by itself authorize a new execution.

## 7. D1 / D2 evidence

D1 deployment/UAT evidence and D2 XLSX engineering evidence remain in `project-docs/` and `CONFIRMED_BASELINE/` under their package-specific names. Use the Control Center/Master Delivery to know whether the stage is currently closed, paused or active.

## 8. Historical review archive

- `project-docs/AI_REVIEW_PACKAGE.md` is a historical/standardized review archive and is not current state authority.

## 9. Document-role rule

```text
CURRENT STATE -> AI_CONTROL_CENTER.md
EXACT ACTIVE AUTHORIZATION -> control/02_ACTIVE_WORK_PACKAGE.md
D1-D7 SCOREBOARD -> control/00_MASTER_DELIVERY_CONTROL.md
SUBJECT CONTRACT -> locked decision/baseline/evidence document
IMPLEMENTATION SEQUENCE -> D3_IMPLEMENTATION_READINESS_PLAN.md
DOCUMENT LOCATION -> AI_DOCUMENT_INDEX.md
```
