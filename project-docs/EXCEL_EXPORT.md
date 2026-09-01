# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R13 PASS-CLOSED / R3-R14 REVIEWED-NOT-PASS / R3-R15 AUTHORIZED**  
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

The R3-R10..R3-R13 classification/evidence-parity corrective chain remains accepted and closed. Do not reopen without proven regression.

## 4. R3-R14 review result

Implementation `c67e810bdc43c6a626f73da206cfaf5606ca250c` changed only the two authorized feasibility files.

```text
R3-R14_SCOPE_REVIEW = PASS
R3-R14_SOURCE_REVIEW = FAIL / CORRECTIVE REQUIRED
R3-R14_STATUS = NOT PASS / NOT CLOSED
PRIVACY_PURGE_REQUIRED = NO
```

Accepted typed-metadata proof:
- exact expected Part A/B address sets;
- duplicate rejection;
- exact type enum per record;
- `nonblank` consistency;
- safe hash shape/absence contract;
- source-backed derived/reported count comparison;
- exact source-zero date/boolean assertions without fabricated values;
- malformed normalized type fail-closed test.

Remaining blocker is only validator top-level/count-shape exactness. Extra `typeCounts` keys can currently be ignored, and missing/malformed count objects do not deterministically map to the documented blocker.

## 5. D2-WP003-R3-R15 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R15
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R15-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = VALIDATOR_SHAPE_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R15 is intentionally narrow and may modify only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

## 6. Mandatory R3-R15 proof

Preserve accepted R3-R14 per-record proof and solve only validator count-shape fail-closed completeness:
- `typeCounts` must exist as a non-null non-array object;
- exact keys only: `string|number|date|boolean|blank`;
- no extra or missing keys;
- every count is a non-negative integer;
- derived and reported count objects must exactly equal including key set;
- missing/malformed input must throw `BLOCKER_TYPED_PRIVACY_METADATA_UNRESOLVED` deterministically;
- negative tests must cover extra unexpected key, missing/malformed object and invalid count value;
- preserve exact source-zero type assertions and do not fabricate source values.

No Part B classification redesign and no header/workbook/image/insertion/formula closure in R3-R15.

## 7. Explicit exclusions

No XLSX/image/media/output commit; no package/dependency change; no production sanitizer/renderer; no normalizer/export-service change; no PDF/UI/Live Kintone/deploy; no next Work Package.

Mandatory commands:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R13 = PASS / CLOSED
D2-WP003-R3-R14 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R15 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R15-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R15 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until deferred feasibility blockers and then production Excel/combined/PDF parity and export security are independently accepted.
