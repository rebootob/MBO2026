# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R2 AUTHORIZED**  
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

Owner decision:
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
SECOND_SHEET = Sheet1
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

## 5. Exact header/value geometry

The generic label-row/value-row rule has Fiscal-Year merged-value exceptions.

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

Do not treat `N6` / `G2` as ordinary static label cells.

## 6. Reference-image structural evidence

For Part A:
```text
DRAWING_XML = xl/drawings/drawing1.xml
DRAWING_RELS = xl/drawings/_rels/drawing1.xml.rels
REFERENCE_SCREENSHOT_REL = rId3
REFERENCE_SCREENSHOT_MEDIA = xl/media/image3.png
```

Must preserve:
```text
rId1 -> ../media/image1.jpeg
rId2 -> ../media/image2.jpeg
ALL OTHER NON-TARGET DRAWING/MEDIA RELATIONSHIPS = PRESERVE
```

The R3-R2 target is only the historical/reference screenshot represented by `rId3 -> image3.png`.

## 7. R3-R1 review result

R3-R1 scope passed and no binary output was published, so no Privacy Purge is required.

R3-R1 did not pass source acceptance because:
- no-op parity remained incomplete;
- header proof was only partial;
- privacy still used shared-string keyword heuristics;
- reference-image helper removed nothing;
- Part A/Part B still used high-level value/row-height copying instead of raw OOXML insertion;
- tests still proved mostly sentinel/value movement instead of raw structure.

## 8. R3-R2 authorization

```text
D2-WP003-R3-R2 = AUTHORIZED
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R2-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R2 is feasibility-only and must not publish workbook/image/binary outputs.

Authorized writes only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes.

## 9. Mandatory raw OOXML architecture

`xlsx-populate@1.21.0` may be used for load/reparse and ZIP package access. Structural insertion must directly mutate raw OOXML; high-level row/cell copy loops are not acceptance.

### 9.1 Material no-op parity

Must compare original vs round-trip structural metadata and prove:
- Part A: one sheet, correct name, `A1:BJ52`, paperSize8/A3, landscape, scale58, 193 raw merge refs, representative row/column geometry, drawing inventory;
- Part B: two sheets in same order including `Sheet1`, `A1:X35`, paperSize9/A4, portrait, scale75, horizontal centering, sheet protection, 79 raw merge refs, representative row/column geometry, drawing inventory;
- successful reparse.

No fallback assertion may substitute an expected value when metadata is unavailable.

### 9.2 Header/value proof

Use the exact ranges in section 5. Fingerprint all title/label regions without exposing source values, mutate/clear every runtime value region only, reparse, prove all static fingerprints unchanged, all intended value regions changed/cleared, and no unrelated header cell changed.

### 9.3 Privacy proof

Sensitive source of truth = explicit bounded address/range map, not shared-string keyword heuristics.

The map must cover identity/org/date/Fiscal-Year/Hoshin/objective/action/target/result/self/appraiser/signature/score/grade/Difficulty sample areas.

Collect designated values by type in memory without logging values; clear only mapped sensitive ranges; reparse and assert ranges empty; scan OOXML for collected sensitive text without printing values; any shared-string cleanup must be driven by the explicit map; introduce zero scoring formulas.

### 9.4 Reference image proof

On disposable Part A package:
- remove the drawing anchor/object embedding `rId3`;
- remove `rId3` from `drawing1.xml.rels`;
- remove `xl/media/image3.png` if orphaned;
- preserve rId1/rId2 and all other non-target graphics;
- update package metadata only as required;
- reparse and inspect raw XML/rels/ZIP membership.

### 9.5 Part A raw insertion

4 objectives:
- row29 unchanged;
- print area `A1:BJ52`.

5 objectives:
- structurally clone raw row28 as new row29;
- shift raw rows29+ by +1;
- rewrite row/cell/merge/range refs and worksheet dimension;
- old row29 -> row30;
- print area `A1:BJ53`.

10 objectives:
- clone row28 into rows29:34;
- shift raw rows29+ by +6;
- rewrite refs/dimension;
- old row29 -> row35;
- objective slot10 = row34;
- print area `A1:BJ58`.

Inserted rows must preserve representative row28 height/style/merge/border/alignment structure. Preserve paperSize8/A3, landscape, scale58.

### 9.6 Part B raw insertion

6 competencies:
- totals remain row31;
- print area `A1:X35`.

8 competencies:
- shift raw rows31+ by +8;
- clone raw source block rows27:30 twice into rows31:34 and 35:38;
- rewrite row/cell/merge/range refs and dimension;
- old row31 -> row39;
- print area `A1:X43`.

Inserted blocks must preserve representative source-block height/style/merge/border/alignment structure. Preserve paperSize9/A4, portrait, scale75, horizontal centering and protection.

## 10. Test design

Tests must inspect raw OOXML after mutation. Helper success flags and sentinel-only proof are insufficient.

If bounded raw surgery cannot be made safe, stop with the relevant blocker rather than emulate insertion through value copying.

Mandatory commands:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

## 11. Explicit exclusions

No:
- XLSX/image/media/output commit;
- package/dependency changes;
- production sanitizer/renderer;
- normalizer/export-service changes;
- Difficulty field implementation;
- PDF/UI/Live Kintone/deploy;
- next Work Package.

## 12. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3-R1 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R2 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R2-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R2 ONLY / LOW-CREDIT
```

## 13. D2 closure condition

D2 remains open until production Part A/Part B/combined/PDF parity and export security are independently accepted.

```text
D2 = NOT PASS / IN PROGRESS
PROJECT MBO2026 = NOT COMPLETE
```
