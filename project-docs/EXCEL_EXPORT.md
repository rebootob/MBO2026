# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R5 REVIEWED-NOT-PASS / R3-R6 AUTHORIZED**  
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

## 6. R3-R5 review result

Scope review = PASS. No Privacy Purge required.

Accepted progress:
- de-duplicated sensitive address sets;
- per-address typed metadata helper;
- improved `<f(?:\s|>)` formula detection;
- explicit Part B classification object.

Feasibility acceptance remained FAIL because the test harness still did not objectively measure the complete contract: Part B classification was self-declared, typed metadata was not reconciled address-by-address, header fingerprints remained partial, full source-vs-roundtrip structural fingerprints were absent, target-normalized non-target image inventory equality was absent, structural tests remained sentinel/count heavy, and formula-node sets were not compared source vs every output.

## 7. D2-WP003-R3-R6 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R6
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R6-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R6 preserves all accepted raw OOXML mutation logic and may modify only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

## 8. Mandatory R3-R6 test-harness completion

### 8.1 Source-backed Part B privacy classification

Inspect exact SHA-verified owner-template structure in rows2:34. Every sensitive address must have source-backed structural evidence and every protected title/header-label/competency-description/rating-guidance address must be excluded. Tests must iterate the complete sensitive and protected sets. Any ambiguous cell must STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED` rather than be assumed dynamic.

### 8.2 Exact typed reconciliation

Every mapped Part A/Part B address must have exactly one safe metadata record (`address`, normalized `string|number|date|boolean|blank`, blank state, optional text hash). Tests must prove metadata set equality with mapped addresses and reconcile every metadata address to a blank sanitized-output address after reparse. Numeric/date/boolean source addresses present must be directly checked by address.

### 8.3 Complete header fingerprints

Fingerprint every cell in all frozen title/static-label/runtime-value regions and unrelated bounded header rows using safe value/type/style/merge metadata. After header mutation prove static/unrelated fingerprints unchanged, every runtime-value address changed/cleared as intended, and header merge set unchanged exactly.

### 8.4 Reusable full source-vs-roundtrip fingerprint

Compare SOURCE vs ROUND-TRIP directly for:
- exact sheet order/names;
- exact merge-ref set and declared merge count;
- worksheet dimension;
- `<cols>` structure/hash;
- row-height map;
- Print_Area and page setup;
- Part B centerHorizontal and protection fingerprint;
- drawing relationship inventory;
- media filename/hash inventory;
- successful reparse.

Hard-coded constants may supplement only; they may not replace source-vs-output equality.

### 8.5 Exact reference-image inventory equality

Snapshot complete anchors, relationships and media before removal. Remove only rId3 anchor/relation and orphaned image3. Normalize only those target items out of BEFORE, then require exact equality with AFTER for every remaining anchor/relation/media item.

### 8.6 Exact structural insertion measurements

Part A 4/5/10 and Part B 6/8 must directly inspect raw OOXML and prove:
- unique/strictly sorted row refs;
- valid unique/sorted cell refs;
- source-vs-inserted style-id patterns;
- row heights/customHeight;
- exact translated merge patterns;
- declared merge count equals actual merge set;
- exact dimensions;
- exact Print_Area;
- required paper/orientation/scale;
- Part B centerHorizontal and protection.

Part A 5: old row29 ->30, clone row28 to29, Print `A1:BJ53`.  
Part A 10: rows29:34 inserted, old row29 ->35, row34 objective10, Print `A1:BJ58`.  
Part B 8: clone rows27:30 twice to31:38, old row31 ->39, Print `A1:X43`.

Sentinel movement and total-count-only proof are insufficient.

### 8.7 Worksheet formula-node comparison

Inspect only `xl/worksheets/*.xml`, detect `<f(?:\s|>)`, associate formula nodes to cell addresses where possible, and compare sorted source formula sets against sanitized outputs and every Part A/Part B structural output. Accepted source set is zero; prove zero output additions.

### 8.8 Difficulty

Difficulty remains blank temporarily. No application `Difficulty_*` field may be added/read. Sanitized Part A must directly prove mapped legacy Difficulty sample cells blank.

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
D2-WP003-R3-R5 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R6 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R6-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R6 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
