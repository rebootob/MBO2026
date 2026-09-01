# AI ACTIVE TASK — D2-WP003-R3-R14 EXECUTION AUTHORIZED

Mode: **ANTIGRAVITY / TYPED PRIVACY METADATA COMPLETENESS ONLY / NO BINARY PUBLISH / NO KINTONE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = AUTHORIZED_FOR_EXECUTION
D1_OVERALL = PASS / CLOSED
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R14
ACTIVE_WORK_PACKAGE_NAME = TYPED PRIVACY METADATA COMPLETENESS
OWNER_APPROVAL = GRANTED 2026-09-01 ICT
PRIVACY_PURGE_REQUIRED = NO
OWNER_DIFFICULTY_DECISION = LEAVE BLANK TEMPORARILY
EXECUTOR = ANTIGRAVITY
ANTIGRAVITY_MODE = LOW-CREDIT / BOUNDED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R14-SOURCE-20260901-01
MAX_EXECUTOR_STATUS = TYPED_METADATA_PROOF_PENDING_INDEPENDENT_REVIEW
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
```

## 1. Purpose — ONE DEFERRED FEASIBILITY BLOCKER ONLY

Complete **typed privacy metadata completeness proof** for existing Part A/B sensitive-address metadata.

Do NOT reopen the accepted Part B privacy classification/evidence-parity chain. Do NOT attempt header parity, workbook parity, image inventory, insertion matrix, formula matrix, production renderer/sanitizer, PDF/UI, Kintone or deploy.

## 2. Exact write scope

Authorized modifications ONLY:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Read-only:
- `package.json`
- `package-lock.json`
- governance docs
- exact ignored owner templates after SHA verification

No dependency/package change. No XLSX/image/media/output publication.

## 3. Source identity

Use only exact owner templates:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Bounded lookup only in repository root, `app info/data/`, and `exp/`.
If unavailable: STOP `BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE`.
Never print/log/commit raw employee/sample values.

## 4. Accepted R3-R13 work — PRESERVE

Preserve without redesign:
- Part B source evidence inventory / exact SHA verification;
- independent role resolution;
- authoritative-vs-observed style/merge/type/blankness parity;
- protected-static safe hash parity where applicable;
- no source-sample hash equality for dynamic values;
- real fail-closed classification path;
- post-resolution `SENSITIVE_RANGES_B` compatibility check;
- dynamic/protected disjointness.

Do not spend credit reopening these accepted areas.

## 5. Current typed metadata truth

`getTypedPrivacyMetadata(partKey)` currently emits per-record metadata:

```text
{ address, normalizedType, nonblank, hash }
```

and aggregate `typeCounts`, `uniqueCount`, `totalReconciled`.

Current tests prove aggregate count/reconciliation but do not independently prove every record is exact, unique, enum-valid and internally consistent.

Critical rule:

```text
AGGREGATE COUNTS ARE NOT SUFFICIENT.
EVERY TYPED METADATA RECORD MUST BE EXACT, UNIQUE, ENUM-VALID, AND INTERNALLY CONSISTENT.
```

## 6. Mandatory R3-R14 proof

For BOTH Part A and Part B:

1. Prove exact metadata address-set equality to the expected sensitive address set:
   - no missing addresses;
   - no extra addresses.
2. Prove no duplicate metadata addresses.
3. For EVERY metadata record, prove `normalizedType` is exactly one of:
   - `string`
   - `number`
   - `date`
   - `boolean`
   - `blank`
4. Prove `nonblank` is a boolean and internally consistent:
   - `blank` => `nonblank === false`
   - non-blank type => `nonblank === true`
5. Prove safe hash contract:
   - nonblank `string` records may carry a lowercase SHA-256 hex identity;
   - if a nonblank string hash is emitted, it must be exactly 64 lowercase hex chars;
   - `blank`, `number`, `date`, and `boolean` records must not manufacture a value hash;
   - no raw source value may be logged or committed.
6. Preserve aggregate type-count reconciliation as a secondary invariant.
7. For each normalized type actually present in the exact owner source, prove its records satisfy the per-record contract.
8. If a normalized type has zero source occurrences, record/assert zero occurrence; DO NOT fabricate synthetic source values merely to force branch coverage.
9. If malformed metadata can reach the proof/validator path, fail closed using the smallest bounded validation mechanism. Do not broaden into another blocker.

## 7. Source/helper change policy

Prefer tests-only proof if the existing helper already provides enough information.

Modify feasibility source only if a small helper/validator is strictly necessary to make the proof deterministic and fail-closed.

Do NOT refactor unrelated classification/renderer code.

## 8. Mandatory tests

Tests must independently verify at minimum:

- Part A exact sorted metadata address set equals sorted `SENSITIVE_RANGES_A`;
- Part B exact sorted metadata address set equals sorted `SENSITIVE_RANGES_B`;
- metadata array length equals unique address count for A and B;
- every record address is unique;
- every `normalizedType` is in exact allowed enum;
- every `nonblank` is boolean and consistent with type;
- every nonblank string hash, when present, matches `/^[0-9a-f]{64}$/`;
- every blank/non-string record has no manufactured hash (`null`/documented absence only);
- per-type occurrence counts derived from metadata exactly equal reported `typeCounts`;
- `totalReconciled === uniqueCount` remains true;
- absent source types remain zero and are not fabricated.

Do not use raw source values in assertions/messages.

## 9. Out of scope — DO NOT TOUCH

Do NOT work on:
- Part B privacy role classification/evidence parity already closed;
- header fingerprint/export parity;
- workbook source-vs-roundtrip parity;
- reference-image full inventory proof;
- Part A/B insertion structural matrix;
- formula matrix;
- production sanitizer/renderer;
- export service/normalizer/application code;
- PDF/UI;
- Live Kintone;
- deploy;
- next Work Package.

## 10. Mandatory commands

Run exactly:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

Before commit only the two authorized feasibility files may differ. After commit/push working tree must be clean.

## 11. Completion contract

Push only the authorized feasibility file(s), maximum these two:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Final executor status must be exactly one of:
```text
TYPED_METADATA_PROOF_PENDING_INDEPENDENT_REVIEW
BLOCKER_TEMPLATE_SOURCE_NOT_AVAILABLE
BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED
```

Antigravity must not declare D2-WP003 PASS/CLOSED and must not start another blocker or Work Package.

## 12. Authorization ledger

```text
D2-WP003-R3-R12-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R13-SOURCE-20260901-01 = CONSUMED / REVIEWED / DO NOT REUSE
D2-WP003-R3-R14-SOURCE-20260901-01 = ACTIVE / ONE WORK PACKAGE ONLY
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R14-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
APP53_WRITE = NO
APP794_WRITE = NO
APP795_WRITE = NO
APP801_WRITE = NO
ACL_PROCESS_WRITE = NO
KINTONE_CUSTOMIZATION_DEPLOY = NO
LIVE_UAT = NO
ROLLBACK = NO
```

Authorization is consumed when the R3-R14 implementation/blocker commit is pushed for independent review or invalidated by any scope/dependency change.
