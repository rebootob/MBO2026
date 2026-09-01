# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R4 REVIEWED-NOT-PASS / R3-R5 PROPOSED**  
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

Scope review = PASS. Implementation `0dd40fb5999dc8793136029daf8d62acdd9c90a2` changed only the two authorized feasibility files. No binary/package/application/Kintone/deploy changes; no Privacy Purge required.

Accepted progress:
- Part A privacy ranges now expand into exact cells;
- privacy assertion messages no longer include raw source tokens;
- typed counters include string/number/date/boolean/null;
- package-wide `.rels` search is performed before deleting `image3.png`;
- Part B no-op test now checks `Sheet1` and horizontal centering.

Feasibility acceptance = FAIL / corrective required because:
1. Part B broad privacy ranges are not proved to exclude static competency/rating content as required by the exact-map contract.
2. typed privacy evidence is aggregate count-only rather than per-address exact accounting.
3. header proof still hashes selected anchors rather than every frozen title/static-label/runtime-value cell and does not prove unrelated header XML unchanged.
4. no-op parity does not compare complete original-vs-output merge sets, dimensions, row heights, Part B columns, protection fingerprint, drawing relationships and media inventory.
5. image proof does not compare complete non-target before/after drawing-anchor/relationship/media inventories.
6. structural tests still rely mainly on sentinels, total merge counts and Print_Area rather than exact row/cell/style/height/merge/dimension/page/protection geometry.
7. formula proof uses literal `<f>` scanning rather than source-vs-output formula-node comparison.
8. GitHub has no CI/status evidence.

## 7. Proposed D2-WP003-R3-R5

R3-R5 should preserve all accepted raw OOXML implementation and complete only exact acceptance measurements.

Expected writes only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Mandatory corrective direction:
- prove exact Part B dynamic/sample classification from source structure or fail closed;
- return per-address typed source metadata and reconcile every mapped address exactly;
- fingerprint every header title/static-label/runtime-value cell and unrelated header XML;
- create exact source-vs-roundtrip fingerprints for sheet order, merge sets, dimension, columns, row heights, page setup, centering, protection, drawing relationships and media inventory;
- compare complete non-target image inventory before/after target removal;
- Part A 4/5/10 tests must assert exact row/cell refs, source-vs-inserted style ids/heights, cloned merge patterns/count attribute, dimension, Print_Area and A3/landscape/58 geometry;
- Part B 6/8 tests must assert equivalent exact block geometry plus A4/portrait/75/centerHorizontal/protection;
- compare raw worksheet formula-node sets source vs output and prove zero additions;
- Difficulty remains blank and no application Difficulty field is added/read.

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R4 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R5 = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
