# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R1 REVIEWED-NOT-PASS / R3-R2 PROPOSED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

Required final deliverables remain:
1. Excel Part A — MBO / Objectives
2. Excel Part B — Competency / Evaluation
3. Combined workbook where applicable
4. PDF output matching approved legacy presentation
5. 5–10 objective handling without silent truncation
6. 6/8 competency handling without layout collision
7. authorization/privacy-safe export behavior

## 2. Authority split

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
```

## 3. Closed foundations

```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
```

Accepted source fingerprints:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Original owner binaries remain outside Git.

Owner decision remains:
```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

## 4. Frozen geometry

Part A:
```text
MAIN_SHEET = MBO Staff & Chief
PRINT_AREA = A1:BJ52
PAPER_SIZE = A3 / Excel paperSize 8
ORIENTATION = LANDSCAPE
SCALE = 58%
MERGED_RANGES = 193
LEGACY_OBJECTIVE_ROWS = 25:28
LOWER_SECTION_START = ROW 29
```

Part B:
```text
MAIN_SHEET = (Part B) Competency
PRINT_AREA = A1:X35
PAPER_SIZE = A4 / Excel paperSize 9
ORIENTATION = PORTRAIT
SCALE = 75%
HORIZONTAL_CENTERED = YES
SHEET_PROTECTION = YES
MERGED_RANGES = 79
LEGACY_COMPETENCY_BLOCKS = 6
FINAL_LEGACY_BLOCK = ROWS 27:30
TOTALS_SIGNATURE_START = ROW 31
```

## 5. Exact header geometry — corrected from raw owner OOXML

The generic “label row / value row” rule has Fiscal-Year merged-value exceptions.

Part A:
```text
TITLE = B6:M7
FISCAL_YEAR_VALUE = N6:Q7
DEPARTMENT_LABEL = Z6:AF6
DEPARTMENT_VALUE = Z7:AF7
SECTION_LABEL = AG6:AL6
SECTION_VALUE = AG7:AL7
START_DATE_LABEL = AM6:AP6
START_DATE_VALUE = AM7:AP7
EMP_ID_LABEL = AQ6:AS6
EMP_ID_VALUE = AQ7:AS7
EMP_NAME_LABEL = AT6:BC6
EMP_NAME_VALUE = AT7:BC7
POSITION_LABEL = BD6:BI6
POSITION_VALUE = BD7:BI7
```

Part B:
```text
TITLE = B2:F3
FISCAL_YEAR_VALUE = G2:H3
DEPARTMENT_LABEL = J2:L2
DEPARTMENT_VALUE = J3:L3
SECTION_LABEL = M2:O2
SECTION_VALUE = M3:O3
POSITION_LABEL = P2:Q2
POSITION_VALUE = P3:Q3
EMP_ID_LABEL = R2
EMP_ID_VALUE = R3
EMP_NAME_LABEL = S2:W2
EMP_NAME_VALUE = S3:W3
```

Do not treat `N6` / `G2` as static label cells; they are the anchors of merged Fiscal-Year value regions.

## 6. Reference-image structural evidence

For the Part A owner workbook:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
REFERENCE_SCREENSHOT_REL = rId3
REFERENCE_SCREENSHOT_MEDIA = xl/media/image3.png
```

Approved branding that must remain in the R3-R2 proof:
```text
rId1 -> ../media/image1.jpeg
rId2 -> ../media/image2.jpeg
```

The R3/R3-R1 proof target is the historical screenshot represented by `rId3 -> image3.png`. Production handling of other historical/reference graphics remains subject to the later production sanitizer package.

## 7. R3-R1 review result

R3-R1 scope discipline passed and no binary output was published; no Privacy Purge is required.

R3-R1 source acceptance failed:
- no-op parity is still incomplete and includes merge-count fallback behavior that can mask missing metadata;
- header proof is partially corrected but does not independently verify every intended value range after reparse;
- privacy still derives sensitive text primarily from `sharedStrings.xml` keyword heuristics and does not establish explicit text/numeric/date range collection;
- failing privacy assertions can expose the sensitive token in the assertion message;
- reference-image helper performs no removal;
- Part A/Part B still use high-level value/row-height copying instead of raw OOXML insertion;
- structural tests prove only sentinel movement, not row/cell/merge/style/dimension/print/protection correctness.

GitHub has no CI/status evidence for the R3-R1 proof commit.

## 8. Proposed R3-R2 — raw OOXML feasibility only

R3-R2 is not a production renderer/sanitizer package and must not publish XLSX/image/binary outputs.

Expected write scope only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No dependency changes.

### 8.1 Mandatory OOXML architecture

`xlsx-populate@1.21.0` may be used for loading/reparsing and access to the workbook ZIP package. It must NOT be used to simulate structural insertion through high-level row/cell copy loops.

Part A structural proof must mutate raw package structures:
- `xl/worksheets/sheet1.xml` rows/cells/merge refs/dimension;
- workbook Print_Area defined name where required;
- clone raw objective-row structure from row 28;
- shift rows 29+ by +1 or +6.

Part B structural proof must:
- mutate raw `xl/worksheets/sheet1.xml`;
- shift rows 31+ by +8;
- clone the proven final legacy competency block rows 27:30 twice into rows 31:34 and 35:38;
- update merge refs/dimension/Print_Area and preserve page/protection geometry.

### 8.2 Part A acceptance

4 objectives:
- no insertion;
- row29 remains row29;
- print area `A1:BJ52`.

5 objectives:
- raw structural +1 insertion after row28;
- old row29 -> row30;
- new objective row29 structurally matches row28 where applicable;
- print area `A1:BJ53`.

10 objectives:
- raw structural +6 insertion;
- old row29 -> row35;
- objective slot10 = row34;
- print area `A1:BJ58`.

Tests must inspect raw row `r`, cell `r`, style ids, merge refs, row height, dimension, page setup and defined Print_Area after reparse.

### 8.3 Part B acceptance

6 competencies:
- no insertion;
- totals row31;
- print area `A1:X35`.

8 competencies:
- raw rows31+ shift +8;
- clone raw rows27:30 twice;
- totals row31 -> row39;
- print area `A1:X43`;
- preserve A4/paperSize9, portrait, scale75, horizontal centering and sheet protection.

Tests must inspect raw OOXML structure, not sentinel-only movement.

### 8.4 Privacy acceptance

Sensitive source of truth must be an explicit bounded address/range map covering identity/org/date/Hoshin/objective/action/target/result/self/appraiser/signature/score/grade/Difficulty sample areas.

Collect designated values by cell type in memory, clear designated ranges, reparse, directly assert ranges empty, scan OOXML for collected text without printing source values, and introduce zero scoring formulas.

`sharedStrings.xml` keyword filtering may not be the authority for deciding what is sensitive.

### 8.5 Reference-image acceptance

On disposable Part A package:
- find anchor/object whose `a:blip` embeds `rId3`;
- remove that drawing anchor/object;
- remove `rId3` relationship;
- remove `xl/media/image3.png` if orphaned;
- preserve rId1/rId2 and their media;
- reparse successfully;
- test raw drawing XML/rels/package members directly.

## 9. Explicit exclusions

Still no:
- XLSX/image/media/output commit;
- package/dependency changes;
- production sanitizer/renderer;
- normalizer/export-service changes;
- Difficulty field implementation;
- PDF/UI/Live Kintone/deploy;
- next Work Package.

## 10. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R1 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R2 = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRIVACY_PURGE_REQUIRED = NO
```

## 11. D2 closure condition

D2 remains open until production Part A/Part B/combined/PDF parity and export security are independently accepted.

```text
D2 = NOT PASS / IN PROGRESS
PROJECT MBO2026 = NOT COMPLETE
```
