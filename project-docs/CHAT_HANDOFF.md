# MBO2026 — CHAT HANDOFF

> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

Repository/Kintone accepted evidence wins over embedded checkpoints. Fresh-fetch before acting.

## 1. Operating model

```text
ChatGPT = Control Plane / Architect / Independent Reviewer
Antigravity = execution plane only when genuinely necessary
```

No Live Kintone write/deploy/ACL/group/schema/record/session/password operation without exact explicit authorization. Never reuse consumed authorization.

Owner priority:

```text
COMPLETE D2 FULLY BEFORE D3.
```

## 2. Accepted foundations

```text
D1 = PASS / CLOSED
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
HEADER_FINGERPRINT_SANITIZED_EXPORT_PARITY = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted template SHA-256:

```text
PART_A = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Exact current gate — R3-R18 AUTHORIZED

```text
D2 = IN PROGRESS
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R17 = PASS / CLOSED
D2-WP003-R3-R18 = WORKBOOK-WIDE SOURCE-vs-ROUNDTRIP PARITY COMPLETENESS
STATUS = AUTHORIZED FOR ANTIGRAVITY EXECUTION
CONTROL_PLANE_PRE_AUTH_CHECKPOINT = 4666db780a32179061c5f15f96bc0bda10ad4010
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R18
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R18-SOURCE-20260901-01
ANTIGRAVITY = EXECUTE R3-R18 ONLY / LOW-CREDIT / BOUNDED
MAX_EXECUTOR_STATUS = WORKBOOK_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
PRIVACY_PURGE_REQUIRED = NO
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
D3 = HOLD UNTIL D2 PASS / CLOSED
```

Read `project-docs/AI_ACTIVE_TASK.md` for the exact execution contract.

Antigravity must fresh-fetch current authorized canonical HEAD and record it as `EXECUTION_BASELINE`; do not reset to the pre-authorization checkpoint.

## 4. Exact authorized writes

ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- package files;
- governance docs;
- exact owner templates after SHA verification.

No XLSX/image/media/output commit.

## 5. R3-R18 critical contract

```text
PARITY = EXACT-SOURCE SEMANTIC WORKBOOK STRUCTURE.
ZIP BYTE-FOR-BYTE EQUALITY IS NOT REQUIRED.
EVERY WORKSHEET MUST BE COVERED.
```

Required proof:
- authoritative expected fingerprints from exact SHA source before observed mutation/override;
- exact workbook sheet names/order/state;
- every worksheet included, including Part B second visible `Sheet1`;
- per-sheet dimension, merge refs/count, columns, explicit row heights, material sheet views/gridlines, margins, page setup/fit/centering, protection, print-area binding and relevant relationship evidence where present;
- preserve current no-op relationship/media checks without expanding into image semantics;
- no raw sample-value comparison/logging;
- real validator fails closed with `BLOCKER_WORKBOOK_PARITY_UNRESOLVED`.

Mandatory negative proof through the real validator includes:
- worksheet identity/order/state mutation;
- one real merge/dimension/column-or-row structural mutation;
- one real margin/page setup/print-area/view mutation;
- one Part B protection or second-sheet structural mutation.

Preserve all accepted privacy/typed-metadata/header tests.

## 6. Out of scope

Do not touch:
- reference-image full inventory/removal/preservation closure beyond preserving current test behavior;
- Part A/B insertion matrix closure;
- formula/no-formula authority closure;
- production sanitizer/renderer;
- export service/normalizer/application code;
- combined production Excel;
- PDF/UI;
- Live Kintone;
- deploy;
- D3 or another Work Package.

## 7. Required commands

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

After push STOP at one of:

```text
WORKBOOK_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_WORKBOOK_PARITY_UNRESOLVED
```

## 8. Authorization ledger

```text
D2-WP003-R3-R17-SOURCE-20260901-01 = CONSUMED / REVIEWED / PASS-CLOSED / DO NOT REUSE
D2-WP003-R3-R18-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R18-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 9. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
ACTION = FRESH-FETCH CURRENT CANONICAL, RECORD EXECUTION_BASELINE, EXECUTE ONLY R3-R18, TEST/AUDIT, PUSH, STOP
NEXT_CONTROL_STEP = ChatGPT independent review
D3 = HOLD
```
