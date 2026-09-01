# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R2 REVIEWED-NOT-PASS / R3-R3 AUTHORIZED**  
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

## 6. R3-R2 review result

Scope = PASS; no binary/package/application/Kintone/deploy changes and no Privacy Purge required.

Accepted progress:
- structural row/cell shifts now edit raw worksheet OOXML;
- dimension and Print_Area are rewritten;
- rId3/image3.png is actually removed on disposable Part A;
- raw merge-count fallback was removed.

R3-R2 did not pass because inserted merge patterns were not cloned, structural tests were incomplete, privacy remained shared-string heuristic based and cleared static labels, header proof was incomplete, media orphaning/non-target inventory was not proved, and original-vs-roundtrip parity remained incomplete.

## 7. R3-R3 authorization

```text
D2-WP003-R3-R3 = AUTHORIZED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R3-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R3 is feasibility-only and must not publish workbook/image/binary outputs.

Authorized writes only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes.

## 8. Mandatory R3-R3 completion proof

### 8.1 Material no-op parity

Compare original vs round-trip directly:
- exact sheet order/name including Part B `Sheet1`;
- print areas;
- paper size/orientation/scale;
- Part B `centerHorizontal` and protection;
- exact raw merge-ref sets/counts;
- worksheet dimension;
- `<cols>` structural fingerprint;
- explicit row-height map/fingerprint;
- drawing relationship/media-member inventory;
- successful reparse.

No fallback assertions.

### 8.2 Header/value separation

Fingerprint every frozen title/static-label region in section 4. Mutate/clear every runtime value region only, reparse, prove static fingerprints unchanged, all value regions changed/cleared and no unrelated header cell XML changed.

Fiscal Year anchors N6/G2 are value regions, not labels.

### 8.3 Explicit privacy map

The privacy source of truth must be an inspectable exact address/range map, never keyword classification of `sharedStrings.xml`.

Part A minimum mapped areas:
- all runtime header values;
- `G16:AF19` Department Hoshin;
- `AM16:BI19` Section Hoshin;
- `B25:BI28` objective/evaluation sample rows;
- `BC29:BI35` score/summary;
- `B37:S42` approval/signature;
- `AI37:AY42` evaluator/name/date cells where present;
- `B47:N50` overall scores;
- legacy Difficulty sample cells inside objective rows.

Part B must explicitly enumerate dynamic/sample cells/ranges inside rows2:34 while excluding frozen title/labels and static competency/rating description text. If exact dynamic cells cannot be distinguished, fail closed.

Collect mapped values by actual type in memory, never log them, clear mapped cells only, reparse and directly assert empty. Shared-string cleanup may use only mapped collected values/references. Error/assertion text may contain only safe addresses/counts/hashes.

### 8.4 Reference image

Snapshot full drawing-anchor/relationship/media inventory, remove only rId3 anchor and relationship, search all remaining relationships for image3 target, delete image3 only if orphaned, preserve all non-target inventory exactly and reparse.

### 8.5 Part A merge-complete insertion

4 objectives: no insertion; row29 and `A1:BJ52` unchanged.

5 objectives:
- clone raw row28 as row29;
- clone row28 merge pattern to row29;
- shift original rows29+ and affected existing merge refs +1;
- maintain `<mergeCells count>`;
- update dimension and `A1:BJ53`;
- old row29 -> row30.

10 objectives:
- clone row28 to rows29:34;
- clone row28 merge pattern to every inserted row;
- shift original rows29+ and affected existing merge refs +6;
- maintain merge count;
- update dimension and `A1:BJ58`;
- old row29 -> row35; objective slot10 = row34.

Tests must inspect raw row/cell refs, style ids, heights, merge patterns/count, dimension, print area, paperSize8/landscape/scale58.

### 8.6 Part B merge-complete insertion

6 competencies: totals row31 and `A1:X35` unchanged.

8 competencies:
- shift original rows31+ +8;
- clone rows27:30 into rows31:34 and 35:38;
- clone source-block merge pattern into both blocks;
- shift affected existing merge refs;
- maintain `<mergeCells count>`;
- update dimension and `A1:X43`;
- old row31 -> row39.

Tests must inspect raw row/cell refs, source-vs-inserted style ids/heights, exact merge patterns/count, dimension, print area, paperSize9/portrait/scale75/centerHorizontal/protection.

## 9. Explicit exclusions

No:
- XLSX/image/media/output commit;
- package/dependency changes;
- production sanitizer/renderer;
- normalizer/export-service changes;
- Difficulty field implementation;
- PDF/UI/Live Kintone/deploy;
- next Work Package.

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
D2-WP003-R3-R2 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R3 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R3-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R3 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.