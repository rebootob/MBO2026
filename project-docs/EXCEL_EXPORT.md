# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R3 REVIEWED-NOT-PASS / R3-R4 PROPOSED**  
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

Part A target only:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
TARGET_REL = rId3
TARGET_MEDIA = xl/media/image3.png
```

Preserve rId1/image1.jpeg, rId2/image2.jpeg and every other non-target drawing/media relationship.

## 6. R3-R3 review result

Scope = PASS. No binary/package/application/Kintone/deploy changes; no Privacy Purge required.

Accepted progress:
- Part A row-28 merge pattern is now cloned into inserted objective rows and merge count is updated;
- Part B rows27:30 merge pattern is now cloned into both inserted blocks and merge count is updated;
- shared-string keyword classification was removed as the privacy authority.

Feasibility acceptance = FAIL / corrective required because:
1. Part A privacy map lists selected anchor cells rather than fully covering required ranges such as `G16:AF19`, `AM16:BI19`, `B25:BI28`, `BC29:BI35`, `B37:S42`, `AI37:AY42`, and `B47:N50`.
2. Part B privacy map similarly samples selected cells instead of proving every dynamic/sample cell while excluding static descriptions.
3. mapped collection accepts only string values and therefore does not prove numeric/date/boolean privacy.
4. privacy assertion messages still interpolate source-sensitive token values.
5. header proof still fingerprints only selected anchors and verifies only a subset of runtime value regions.
6. image3 deletion is not preceded by package-wide orphan proof and complete non-target drawing/media inventory is not compared before/after.
7. no-op parity still lacks full original-vs-roundtrip `Sheet1`, centerHorizontal, merge-set, dimension, row-height, column, protection and drawing/media comparison.
8. structural tests check sentinel movement, total merge count and Print_Area but not exact merge patterns, style ids, row heights, dimension, mergeCells count attribute and post-insertion page/protection geometry.
9. zero worksheet scoring-formula introduction is not explicitly proved.
10. GitHub has no CI/status evidence for the proof commit.

## 7. Proposed R3-R4 corrective

R3-R4 must preserve the current raw OOXML architecture and only complete missing proof coverage.

Expected writes only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

Mandatory corrections:
- expand explicit Part A privacy mapping to all required sensitive cells/ranges;
- build an exact Part B dynamic/sample map or fail closed if static/dynamic content cannot be safely distinguished;
- collect mapped values by actual type including numeric/date/boolean without logging source values;
- remove sensitive-value interpolation from all errors/assertions;
- fingerprint every frozen title/static-label region and every runtime value region;
- prove no unrelated header XML changed;
- perform package-wide orphan proof before deleting image3 and compare complete non-target drawing/media inventory;
- compare original vs round-trip exact sheet order/name, merge sets/counts, dimensions, `<cols>`, row-height map, page setup, centerHorizontal, protection and drawing/media inventory;
- Part A 4/5/10 tests must inspect unique raw row/cell refs, source-vs-inserted styles/heights, exact cloned merge refs/count attribute, dimension, Print_Area and A3/landscape/58 setup;
- Part B 6/8 tests must inspect equivalent exact structure plus A4/portrait/75/centerHorizontal/protection;
- prove zero worksheet scoring formulas introduced;
- Difficulty remains blank and no application Difficulty field is added/read.

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R3 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R4 = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
