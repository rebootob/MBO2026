# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R13 PASS-CLOSED / R3-R14 AUTHORIZED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

## 2. Authority split

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
```

Closed foundations:
```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted source fingerprints:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Frozen Part B privacy authority — classification proof CLOSED

The R3-R10..R3-R13 classification/evidence-parity chain is accepted and CLOSED. Do not reopen without proven regression.

Accepted behavior includes SHA-verified source evidence, independent role resolution, authoritative-vs-observed style/merge/type/blankness parity, protected-static safe hash identity where applicable, no sample-hash equality for dynamic values, fail-closed behavior, post-resolution sanitizer compatibility and dynamic/static disjointness.

## 4. D2-WP003-R3-R14 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R14
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R14-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = TYPED_METADATA_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R14 is intentionally narrow: **typed privacy metadata completeness only**.

Authorized writes maximum only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

## 5. Mandatory R3-R14 proof

For Part A and Part B typed privacy metadata:
- exact metadata address set equals the expected unique sensitive address set, with no missing/extra;
- no duplicate addresses;
- every `normalizedType` is exactly `string|number|date|boolean|blank`;
- every `nonblank` is boolean and consistent with normalized type;
- nonblank string hash, when emitted, is safe lowercase SHA-256 identity;
- blank/number/date/boolean records do not manufacture hashes;
- no raw source values are logged or committed;
- per-type occurrence counts derived from records exactly match reported `typeCounts`;
- `totalReconciled === uniqueCount` remains a secondary invariant;
- types absent from the exact source remain zero and are not fabricated for branch coverage.

Critical rule:
```text
AGGREGATE COUNTS ARE NOT SUFFICIENT.
EVERY TYPED METADATA RECORD MUST BE EXACT, UNIQUE, ENUM-VALID, AND INTERNALLY CONSISTENT.
```

Prefer tests-only proof if the existing helper is sufficient. Feasibility source may change only for a minimal proof/validation helper if strictly necessary.

## 6. Explicit exclusions

No Part B classification redesign; no header fingerprint/export parity; no workbook roundtrip parity; no reference-image full inventory proof; no insertion structural matrix; no formula matrix; no production sanitizer/renderer; no normalizer/export-service application change; no PDF/UI/Live Kintone/deploy; no next Work Package.

Mandatory commands:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

## 7. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
D2-WP003-R3-R14 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R14-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R14 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until deferred feasibility blockers and then production Excel/combined/PDF parity and export security are independently accepted.
