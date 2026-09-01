# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R4 REVIEWED-NOT-PASS / R3-R5 AUTHORIZED**  
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

## 6. R3-R4 review result

Scope review = PASS. No Privacy Purge required.

Accepted progress:
- Part A sensitive ranges expand into exact cells;
- raw sensitive values were removed from assertion text;
- type counters cover string/number/date/boolean/null;
- package-wide `.rels` search precedes image3 deletion;
- Part B no-op checks `Sheet1` and horizontal centering.

Feasibility acceptance remained FAIL because:
1. Part B broad privacy ranges were not structurally classified as dynamic/sample versus protected static text.
2. typed privacy evidence was aggregate count-only, not exact per-address accounting.
3. header proof still fingerprinted selected anchors instead of every frozen cell and unrelated header XML.
4. no-op parity still lacked complete source-vs-output merge-set/dimension/row-height/Part-B-cols/protection/drawing/media equality.
5. image proof lacked complete non-target before/after inventory equality.
6. structural tests still relied too much on sentinel/count/Print_Area instead of exact row/cell/style/height/merge/dimension/page/protection geometry.
7. formula proof used literal `<f>` scanning instead of source-vs-output formula-node comparison.

## 7. D2-WP003-R3-R5 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R5
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R5-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R5 preserves all accepted raw OOXML implementation and may modify only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

## 8. Mandatory R3-R5 acceptance measurements

### 8.1 Part B privacy classification

Every sensitive address in rows2:34 must have an inspectable safe classification derived from owner-template structure. Tests must prove protected title/header labels, competency names/descriptions and rating guidance are excluded. Any ambiguous cell must fail closed with `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED` rather than widening a broad range.

### 8.2 Per-address typed privacy metadata

Every mapped Part A/Part B address must have exactly one metadata entry with address, normalized type (`string|number|date|boolean|blank`), blank state and safe hash where useful. Metadata count, unique mapped-address count and aggregate type counts must reconcile exactly. Every mapped address must be empty after sanitization/reparse; typed nonblank source cells must be directly proved cleared.

### 8.3 Complete header/value fingerprints

Fingerprint every cell in every frozen title/static-label/runtime-value region and bounded unrelated header rows. Tests must prove static/unrelated fingerprints unchanged, intended runtime values changed/cleared, merged geometry unchanged and no raw source value logged.

### 8.4 Full no-op source-vs-roundtrip equality

Compare source against round-trip directly for exact sheet order/name, merge-ref SET/count, worksheet dimension, `<cols>`, row-height map, Print_Area/page setup, Part B centering/protection fingerprint, drawing relationship inventory and media filename/hash inventory. Hard-coded expected values may supplement but not replace source-vs-output equality.

### 8.5 Exact reference-image inventory equality

Snapshot all drawing anchors, relationships and media before removal. Remove only rId3 target and orphaned image3. Normalize target items out of the source inventory, then require exact equality of every remaining anchor/relationship/media item after reparse.

### 8.6 Exact structural insertion measurements

Part A 4/5/10 and Part B 6/8 must directly assert:
- unique/sorted row refs;
- unique/sorted valid cell refs;
- source-vs-inserted style-id patterns;
- row heights;
- exact translated merge patterns;
- `<mergeCells count>` attribute equals actual set;
- exact dimension;
- exact Print_Area;
- correct paper size/orientation/scale;
- Part B centerHorizontal and protection.

Sentinel movement and total merge count alone are insufficient.

### 8.7 Exact formula-node comparison

Inspect worksheet XML only using `<f(?:\s|>)`-equivalent detection. Compare source formula-node/address sets to sanitized and structural outputs. Accepted source formula set is zero; outputs must introduce zero formula nodes.

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
D2-WP003-R3-R4 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R5 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R5-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R5 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
