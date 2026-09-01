# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R7 REVIEWED-NOT-PASS / R3-R8 PROPOSED**  
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

## 6. R3-R7 review result

Scope review = PASS. Implementation `a5779e6540e3f677b400620acc0e98807b381780` changed only the two authorized feasibility files. No binary/package/application/Kintone/deploy changes; no Privacy Purge required.

Accepted progress:
- header fingerprints now include merge membership and value/type hashes;
- reusable raw worksheet inspector exists;
- formula helper now returns worksheet/cell set entries;
- structural tests now call the inspector.

Feasibility acceptance = FAIL / corrective required because:
1. Part B classification is still hard-coded/self-declared instead of source-structure-backed.
2. typed metadata still lacks exact metadata-address-set and type-by-type reconciliation to sanitized output.
3. header fingerprints still omit style id and normalized type, and tests omit runtime-value and exact header merge assertions.
4. workbook equality is still partial for dimension, merge-count consistency, explicit row-height/customHeight map, complete page/protection structure and complete relationship inventory.
5. reference-image proof still lacks complete target-normalized before/after anchor/relationship/media equality.
6. Part A 4/5/10 and Part B 6/8 tests call the raw inspector but assert only merge count and Print_Area rather than row/cell/style/height/merge/dimension/page/protection properties.
7. formula helper is set-based but tests cover only sanitized outputs; source and structural outputs are not compared and no node fingerprint is stored.
8. GitHub has no CI/status evidence.

## 7. Proposed D2-WP003-R3-R8

R3-R8 must preserve all accepted raw OOXML mutation logic and useful R3-R7 helpers, and finish only the mandatory proof coverage.

Expected writes only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

Mandatory corrective direction:
- source-backed Part B sensitive/static classification from exact SHA-verified owner-template structure or fail closed;
- exact typed metadata address-set equality and direct sanitized-output reconciliation including numeric/date/boolean addresses;
- header fingerprint style id + normalized type + runtime-value assertions + exact merge-set preservation;
- direct source-vs-roundtrip equality for every workbook fingerprint invariant including dimension, merge-count consistency, explicit row-height/customHeight map, full page/protection and complete relationship inventory;
- complete target-normalized reference-image anchor/relationship/media inventory equality;
- direct assertions over every required raw inspector property for Part A 4/5/10 and Part B 6/8;
- worksheet formula source/sanitized/structural cell/node-set comparison proving zero additions;
- Difficulty remains blank and no application Difficulty field is added/read.

Do not add another helper unless its required returned properties are directly asserted in the same corrective commit.

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R7 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R8 = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
