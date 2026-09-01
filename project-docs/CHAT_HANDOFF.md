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

## 2. Accepted foundations

```text
D1 = PASS / CLOSED
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted template SHA-256:

```text
PART_A = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Exact current gate — R3-R17 AUTHORIZED

```text
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R16 = PASS / CLOSED
D2-WP003-R3-R17 = HEADER FINGERPRINT / SANITIZED EXPORT PARITY
STATUS = AUTHORIZED FOR ANTIGRAVITY EXECUTION
AUTHORIZATION_BASELINE = 528e1ed31985296c99ab8c40ce5f05f4146d549d
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R17
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R17-SOURCE-20260901-01
ANTIGRAVITY = EXECUTE R3-R17 ONLY / LOW-CREDIT / BOUNDED
MAX_EXECUTOR_STATUS = HEADER_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
PRIVACY_PURGE_REQUIRED = NO
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

Read `project-docs/AI_ACTIVE_TASK.md` for the exact execution contract.

## 4. Exact authorized writes

ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- package files;
- governance docs;
- exact owner templates after SHA verification.

No XLSX/image/media/output commit.

## 5. R3-R17 critical contract

```text
HEADER PARITY = STRUCTURE + ROLE-SAFE FINGERPRINT PARITY.
DYNAMIC SAMPLE VALUES MUST BE SANITIZED, NOT PRESERVED.
```

Required proof:
- derive authoritative Part A/B header fingerprints from exact SHA source before any mutation/override;
- preserve exact static title/label address, style and merge geometry;
- preserve safe static-label hash/type identity without logging raw values;
- preserve dynamic header address/style/merge geometry but require dynamic output value to be blank after sanitization;
- never compare dynamic sample-value identity to source;
- preserve unrelated bounded header structure;
- exact address/role sets, no missing/extra/duplicates/ambiguity;
- real validator/resolver path must fail closed with `BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED`.

Mandatory negative cases:
- dynamic style/merge mismatch;
- sanitized dynamic value becomes nonblank;
- protected-static safe fingerprint mismatch;
- missing required or unexpected role address.

Preserve all accepted privacy/typed-metadata tests and existing header geometry proof.

## 6. Out of scope

Do not touch:
- workbook-wide source-vs-roundtrip parity closure;
- reference-image full inventory closure;
- Part A/B insertion matrix;
- formula matrix;
- production sanitizer/renderer;
- export service/normalizer/application code;
- PDF/UI;
- Live Kintone;
- deploy;
- another Work Package.

## 7. Required commands

```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

After push STOP at one of:

```text
HEADER_PARITY_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_HEADER_FINGERPRINT_PARITY_UNRESOLVED
```

## 8. Authorization ledger

```text
D2-WP003-R3-R16-TEST-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R17-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R17-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 9. Exact next action

```text
NEXT_EXECUTOR = ANTIGRAVITY
ACTION = FRESH-FETCH CANONICAL, EXECUTE ONLY R3-R17 HEADER PARITY, TEST/AUDIT, PUSH, STOP
NEXT_CONTROL_STEP = ChatGPT independent review
```
