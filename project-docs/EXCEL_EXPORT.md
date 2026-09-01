# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R6 REVIEWED-NOT-PASS / R3-R7 AUTHORIZED**  
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
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

Accepted source fingerprints:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

## 3. Frozen geometry

Part A:
```text
MAIN_SHEET = MBO Staff & Chief
PRINT_AREA = A1:BJ52
PAPER_SIZE = A3 / paperSize 8
ORIENTATION = LANDSCAPE
SCALE = 58
MERGED_RANGES = 193
OBJECTIVE_ROWS = 25:28
LOWER_SECTION_START = 29
```

Part B:
```text
MAIN_SHEET = (Part B) Competency
SECOND_SHEET = Sheet1
PRINT_AREA = A1:X35
PAPER_SIZE = A4 / paperSize 9
ORIENTATION = PORTRAIT
SCALE = 75
HORIZONTAL_CENTERED = YES
SHEET_PROTECTION = YES
MERGED_RANGES = 79
FINAL_LEGACY_BLOCK = 27:30
TOTALS_SIGNATURE_START = 31
```

## 4. Frozen header/value geometry

Part A:
```text
TITLE = B6:M7
FISCAL_YEAR_VALUE = N6:Q7
DEPARTMENT_LABEL/VALUE = Z6:AF6 / Z7:AF7
SECTION_LABEL/VALUE = AG6:AL6 / AG7:AL7
START_DATE_LABEL/VALUE = AM6:AP6 / AM7:AP7
EMP_ID_LABEL/VALUE = AQ6:AS6 / AQ7:AS7
EMP_NAME_LABEL/VALUE = AT6:BC6 / AT7:BC7
POSITION_LABEL/VALUE = BD6:BI6 / BD7:BI7
```

Part B:
```text
TITLE = B2:F3
FISCAL_YEAR_VALUE = G2:H3
DEPARTMENT_LABEL/VALUE = J2:L2 / J3:L3
SECTION_LABEL/VALUE = M2:O2 / M3:O3
POSITION_LABEL/VALUE = P2:Q2 / P3:Q3
EMP_ID_LABEL/VALUE = R2 / R3
EMP_NAME_LABEL/VALUE = S2:W2 / S3:W3
```

## 5. Reference-image target

```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

Preserve every non-target drawing/media relationship.

## 6. R3-R6 review result

Scope review = PASS. Implementation `3f5ec2db5209db97702c8f4780d00b191b97989a` changed only the two authorized feasibility files. No binary/package/application/Kintone/deploy changes; no Privacy Purge required.

Accepted progress:
- reusable header address/value-hash helper;
- reusable workbook fingerprint helper;
- several direct no-op source-vs-roundtrip comparisons;
- worksheet-only formula-node regex count helper;
- iteration across all currently mapped Part B sensitive addresses.

Feasibility acceptance = FAIL / corrective required because:
1. Part B classification remains hard-coded/self-declared instead of source-structure-backed.
2. typed metadata is not reconciled address-by-address/type-by-type against sanitized output.
3. header fingerprints omit normalized type/style/merge membership and complete runtime/merge assertions.
4. workbook equality is still partial for dimension, declared merge count, full page/protection structure and complete relationship inventory.
5. reference-image proof lacks target-normalized complete before/after anchor/relationship/media equality.
6. Part A 4/5/10 and Part B 6/8 structural tests remain sentinel/count/Print_Area heavy rather than exact row/cell/style/height/merge/dimension/page/protection measurements.
7. formula proof is count-only and does not compare source, sanitized and every structural output address/node sets.
8. GitHub has no CI/status evidence.

## 7. D2-WP003-R3-R7 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R7
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R7-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R7 preserves all accepted raw OOXML mutation logic and accepted R3-R6 helper progress and may modify only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

## 8. Mandatory R3-R7 assertion completion

### 8.1 Source-backed Part B classification

Use the exact SHA-verified Part B owner template. Build safe per-address structural evidence from actual source facts: address, merge membership, style id, normalized source type, blank/nonblank state and safe hash where needed. Explicitly identify the complete protected static set for title/header-label/competency-description/rating-guidance content. Tests must iterate complete sensitive and protected sets and prove exact disjointness. Any ambiguity must fail closed with `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

### 8.2 Exact typed reconciliation

Every mapped Part A/Part B address must have exactly one metadata record. Tests must prove exact metadata address-set equality with the mapped set, no duplicates, accepted type enum, aggregate reconciliation and direct sanitized-output blankness for every metadata address, including numeric/date/boolean addresses selected from metadata.

### 8.3 Complete header fingerprints

Every frozen title/static-label/runtime-value and unrelated bounded-header cell must be fingerprinted with value hash, normalized type, style id and merge membership. Tests must prove static/unrelated equality, intended runtime clearing/change and exact header merge-set preservation.

### 8.4 Complete workbook source-vs-roundtrip equality

Compare every fingerprint invariant directly SOURCE vs ROUND-TRIP:
- sheet order/name;
- exact merge set;
- declared merge count and actual-set consistency;
- dimension;
- columns;
- row-height/customHeight map;
- Print_Area;
- full page setup;
- Part B centering;
- Part B protection fingerprint;
- complete relationship inventory `(part,id,target)`;
- media filename/hash inventory;
- successful reparse.

Hard-coded constants are supplemental only.

### 8.5 Reference-image inventory equality

Snapshot all drawing anchors, relationships and media before mutation. Remove only rId3 anchor/relation and orphaned image3. Normalize those target items out of BEFORE and require exact equality with AFTER for every remaining anchor/relationship/media member.

### 8.6 Raw structural inspector

Implement one raw worksheet inspector and use it for Part A 4/5/10 and Part B 6/8. Directly prove ordered unique rows/cells, style patterns, row heights/customHeight, exact merge translations/shifts, declared merge count consistency, dimensions, Print_Area and page/protection geometry.

Required cases remain:
- Part A 4: unchanged legacy geometry, `A1:BJ52`;
- Part A 5: row29 inserted from source row28, old row29 ->30, `A1:BJ53`;
- Part A 10: rows29:34 inserted from source row28, old row29 ->35, objective10 row34, `A1:BJ58`;
- Part B 6: unchanged totals/signatures start row31, `A1:X35`;
- Part B 8: source rows27:30 cloned to31:34 and35:38, old row31 ->39, `A1:X43`.

Sentinel/count/Print_Area-only evidence is insufficient.

### 8.7 Formula address/node sets

Inspect only worksheet XML. Detect `<f(?:\s|>)`, associate formula nodes with containing cell addresses where possible, and return sorted safe formula fingerprints. Compare originals, sanitized outputs and every Part A/Part B structural output. Accepted sources are formula-free and every output must remain formula-free with zero additions.

### 8.8 Difficulty

Difficulty remains blank temporarily. Do not add/read/invent application `Difficulty_*` fields. Sanitized Part A must directly prove mapped legacy Difficulty sample cells blank.

## 9. Explicit exclusions

No XLSX/image/media/output commit; no package/dependency change; no production sanitizer/renderer; no normalizer/export-service change; no PDF/UI/Live Kintone/deploy; no next Work Package.

Mandatory commands:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

## 10. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R6 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R7 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R7-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R7 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
