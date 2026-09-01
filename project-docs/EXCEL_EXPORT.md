# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R2 REVIEWED-NOT-PASS / R3-R3 PROPOSED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

## 2. Authority split

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
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

## 4. Header/value geometry

Part A:
```text
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
FISCAL_YEAR_VALUE = G2:H3
DEPARTMENT_LABEL/VALUE = J2:L2 / J3:L3
SECTION_LABEL/VALUE = M2:O2 / M3:O3
POSITION_LABEL/VALUE = P2:Q2 / P3:Q3
EMP_ID_LABEL/VALUE = R2 / R3
EMP_NAME_LABEL/VALUE = S2:W2 / S3:W3
```

## 5. Reference-image target

Part A target only:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

Preserve rId1/image1.jpeg, rId2/image2.jpeg and every other non-target drawing/media relationship.

## 6. R3-R2 review result

Scope review = PASS. No binary/package/application/Kintone/deploy change occurred, so no Privacy Purge is required.

Accepted progress:
- Part A/Part B structural shift now edits raw worksheet OOXML;
- dimension and Print_Area are rewritten;
- rId3/image3.png is actually removed on disposable Part A;
- raw merge counts use no fallback.

Feasibility acceptance = FAIL / corrective required because:
1. Part A cloned rows do not clone row-28 merge refs into inserted rows.
2. Part B cloned rows27:30 do not clone their merge refs into new rows31:38.
3. structural tests still check mainly sentinel movement and Print_Area rather than inserted style/merge/height/dimension/page/protection structure.
4. privacy still derives sensitive strings from `sharedStrings.xml` keyword heuristics, lacks an explicit authoritative range map and mapped numeric/date collection, and clears static header label anchors.
5. privacy assertion messages can expose source-sensitive token text on failure.
6. header proof does not cover every frozen label/value region.
7. image3 is removed without first proving it is orphaned; complete non-target drawing/media inventory is not compared before vs after.
8. no-op parity remains incomplete: no full original-vs-roundtrip row/column/drawing comparison, no Part B `Sheet1` identity assertion, no horizontal-centering assertion.
9. GitHub has no CI/status evidence for the proof commit.

## 7. Proposed R3-R3 corrective

R3-R3 should preserve the current raw OOXML architecture and fix only the remaining proof gaps.

Expected writes only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Mandatory corrections:
- clone Part A source-row merge refs for all inserted objective rows;
- clone Part B source-block merge refs into both inserted competency blocks;
- independently assert representative raw row/cell/style/merge/height/dimension/page/protection geometry;
- replace privacy heuristic authority with an explicit bounded address/range map;
- collect mapped values by actual type without logging source values;
- clear only mapped runtime/sample sensitive cells and preserve static labels;
- shared-string cleanup only from collected mapped values/references;
- assertion/error messages use only safe addresses/counts/hashes;
- prove image3 orphaning before deleting media and compare complete non-target drawing inventory;
- complete original-vs-roundtrip no-op parity including `Sheet1`, centerHorizontal, row heights, column widths and drawing/media relationships.

Still forbidden:
- XLSX/image/media/output commit;
- package/dependency changes;
- production sanitizer/renderer;
- normalizer/export-service changes;
- Difficulty field implementation;
- PDF/UI/Live Kintone/deploy;
- next Work Package.

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R2 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R3 = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
