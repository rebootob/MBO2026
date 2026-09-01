# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-09-01 — D1 CLOSED / D2-WP001+WP002 CLOSED / R3-R6 AUTHORIZED

## 1. Whole-project scoreboard

| ID | Status | Current checkpoint |
|---|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | ✅ PASS / CLOSED | Current approval authority = native current Assignee |
| D2 Excel + PDF Original/Legacy Format | 🟠 IN PROGRESS / R3-R6 AUTHORIZED | Exact source-vs-output test harness completion only |
| D3 8 Legacy PMS Apps → App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED | Read-only/mapping/reconciliation only |
| D4 App800 HR Control Center E2E | 🟠 IN PROGRESS | Lifecycle operations mandatory scope |
| D5 Copy Own Previous MBO | 🟠 IN PROGRESS | Fresh target-year routing/identity required |
| D6 Integrated E2E / Security / Regression | 🔴 PENDING | Lifecycle/security regression required |
| D7 Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED | Reopen only proven defect |

## 2. Closed foundations

```text
D1 = PASS / CLOSED
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted owner-template SHA-256:
```text
PART_A = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. R3-R5 review truth

R3-R5 scope = PASS. Only the two authorized feasibility files changed. No package/binary/application/Kintone/deploy path changed; no Privacy Purge is required.

Accepted R3-R5 progress:
- de-duplicated sensitive address sets;
- per-address typed metadata helper;
- improved `<f(?:\s|>)` formula detection;
- explicit Part B classification object.

R3-R5 source acceptance = FAIL because the harness still did not objectively measure all required properties: Part B classification remained self-declared, typed metadata was not reconciled address-by-address to output, header fingerprints remained partial, source-vs-roundtrip structural fingerprints were incomplete, image inventory equality was incomplete, structural tests remained sentinel/count heavy, and formula proof did not compare worksheet-only source/output formula sets.

## 4. D2-WP003-R3-R6 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R6
WORK_PACKAGE_NAME = EXACT SOURCE-VS-OUTPUT TEST HARNESS COMPLETION
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R6-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

Canonical contract: `project-docs/AI_ACTIVE_TASK.md`.

Authorized writes ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Package files, governance docs and exact ignored owner templates are read-only for Antigravity.

## 5. R3-R6 acceptance direction

Preserve existing raw OOXML mutation logic. Complete only the proof harness:
- Part B privacy classification must be backed by exact owner-template structural evidence or fail closed;
- reconcile every typed metadata address exactly to sanitized output;
- fingerprint every frozen title/static-label/runtime-value/unrelated bounded-header cell;
- create reusable source-vs-output workbook fingerprints for merge sets, dimension, columns, row heights, Print_Area/page setup, centering, protection, drawing relationships and media hashes;
- compare complete non-target reference-image inventories before/after after normalizing only rId3/image3 target items;
- Part A 4/5/10 and Part B 6/8 tests must measure exact row/cell/style/height/merge/dimension/page/protection properties;
- compare worksheet-only source/output formula-node/address sets and prove zero additions;
- Difficulty remains blank and no application Difficulty field is added/read.

Do not substitute new hard-coded counts, sentinels or helper booleans for source-vs-output measurements.

## 6. Current gate

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R5 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R6 = AUTHORIZED / EXECUTION ACTIVE
CURRENT_EXECUTOR = ANTIGRAVITY
ANTIGRAVITY = EXECUTE R3-R6 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R6-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

No other Work Package may auto-start.

## 7. Authorization ledger

```text
D2-WP003-R3-R5-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R6-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R6-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
ACTIVE_RECORD_ACL_WRITE_AUTH = NONE
ACTIVE_PROCESS_UAT_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
APP53_WRITE_AUTH = NONE
APP794_WRITE_AUTH = NONE
APP795_WRITE_AUTH = NONE
APP801_WRITE_AUTH = NONE
ACTIVE_LIFECYCLE_WRITE_AUTH = NONE
PRODUCTION_ROLLBACK_AUTH = NONE
```
