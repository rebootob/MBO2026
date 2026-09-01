# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R3 REVIEWED-NOT-PASS / R3-R4 AUTHORIZED**  
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
- Part A row-28 merge patterns clone into inserted objective rows and merge count is updated;
- Part B rows27:30 merge patterns clone into both inserted blocks and merge count is updated;
- shared-string keyword classification is no longer the declared privacy authority.

Feasibility acceptance remained FAIL because privacy mapping did not fully cover accepted sensitive ranges, non-string typed values were not proved, sensitive values could appear in failure text, header/image/no-op parity was incomplete, structural tests were not exact enough, and zero-formula introduction was not explicitly measured.

## 7. D2-WP003-R3-R4 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R4
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R4-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R4 preserves the current raw OOXML architecture and may modify only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

## 8. Mandatory R3-R4 completion proof

### 8.1 Complete privacy map

Part A must expand the accepted sensitive ranges to every actual cell inside:
- runtime header value regions in section 4;
- `G16:AF19`;
- `AM16:BI19`;
- `B25:BI28`;
- `BC29:BI35`;
- `B37:S42`;
- `AI37:AY42` where source cells exist;
- `B47:N50`;
- legacy Difficulty sample values.

Merged/static cells may be excluded only when structurally proven static. The test must be able to inspect the exact resolved address set.

Part B must use an exact dynamic/sample address set within rows2:34 while excluding frozen title/labels and static competency/rating text. If exact distinction cannot be proven, STOP `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

Collect mapped source values by actual type: string/shared/inline string, numeric, Date/date-serial representation and boolean where present. Do not log source values. Clear mapped cells only, preserve styles/merges/static text, reparse and assert every mapped cell empty.

For collected mapped text, scan XML/text parts for survival without ever placing the raw value in an assertion/error message. Shared-string cleanup may be driven only by mapped source values/references. Prove zero worksheet scoring formulas introduced.

### 8.2 Complete header/value proof

Fingerprint every frozen title/static-label region and every runtime value region using safe structural/content hashes. Mutate/clear every runtime value region only, reparse, prove all static fingerprints unchanged, all intended values changed/cleared, and unrelated header cell XML unchanged.

### 8.3 Orphan-safe reference-image proof

Snapshot complete drawing-anchor, drawing-relationship and media-member inventories. Remove only the anchor and relationship for rId3. Search all remaining package `.rels` parts for a target resolving to `image3.png`; delete the media member only when no remaining relationship references it. Reparse and compare all non-target inventory exactly before vs after.

### 8.4 Full no-op parity

Compare original vs xlsx-populate round-trip directly for:
- exact sheet count/order/name including Part B `Sheet1`;
- exact merge-ref sets/counts;
- worksheet dimensions;
- `<cols>` structural fingerprint;
- row-height maps;
- Print_Area and page setup;
- Part B centerHorizontal and protection fingerprint;
- drawing relationship/media inventories;
- successful reparse.

### 8.5 Exact structural insertion proof

Part A 4/5/10 must verify raw unique/sorted row refs and cell refs, representative row28-vs-inserted style ids and heights, exact cloned merge-ref patterns, `<mergeCells count>` consistency, dimension, Print_Area, paperSize8/landscape/scale58.

Part B 6/8 must verify equivalent source-block-vs-inserted row/cell/style/height/merge structure, count attribute, dimension, Print_Area, paperSize9/portrait/scale75/centerHorizontal/protection.

Sentinel movement and total merge counts alone are insufficient.

## 9. Explicit exclusions

No XLSX/image/media/output commit; no package/dependency change; no production sanitizer/renderer; no normalizer/export-service change; no application Difficulty field; no PDF/UI/Live Kintone/deploy; no next Work Package.

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
D2-WP003-R3-R3 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R4 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R4-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R4 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
