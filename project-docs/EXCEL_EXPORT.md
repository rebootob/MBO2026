# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / R3-R7 REVIEWED-NOT-PASS / R3-R8 AUTHORIZED**  
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
- header fingerprints include merge membership and value/type hashes;
- reusable raw worksheet inspector exists;
- formula helper returns worksheet/cell set entries;
- structural tests call the inspector.

Feasibility acceptance = FAIL because mandatory proof coverage is still incomplete:
1. Part B classification remains hard-coded/self-declared rather than source-backed.
2. typed metadata lacks exact address/type reconciliation to sanitized outputs.
3. header fingerprints lack style id/normalized type and complete runtime/merge assertions.
4. workbook parity lacks direct equality for several invariants including dimension, merge-count consistency, row height/customHeight map, full page/protection and complete relationships.
5. reference-image proof lacks complete target-normalized before/after anchor/relationship/media equality.
6. structural tests call the inspector but still assert only merge count and Print_Area rather than all row/cell/style/height/merge/dimension/page/protection properties.
7. formula set proof omits sources and structural outputs and lacks node fingerprints.
8. GitHub has no CI/status evidence.

## 7. D2-WP003-R3-R8 — AUTHORIZED

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R3-R8
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R8-SOURCE-20260901-01
PRIVACY_PURGE_REQUIRED = NO
MAX_EXECUTOR_STATUS = FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
```

R3-R8 preserves all accepted raw OOXML mutation logic and useful R3-R7 helpers. It may modify only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`.

No package/dependency changes and no binary publication.

## 8. Mandatory R3-R8 proof coverage

### 8.1 Source-backed Part B classification
Use exact SHA-verified Part B owner template. Build source evidence per address with merge membership, style id, normalized type, blank state and safe hash as needed. Build complete protected-static set from actual template roles. Test every sensitive/protected address and exact disjointness. Ambiguity => fail closed.

### 8.2 Exact typed reconciliation
Prove metadata length/address-set equality/no duplicates/allowed types/count reconciliation. Reconcile every metadata address directly to sanitized output blankness; separately iterate numeric/date/boolean metadata addresses.

### 8.3 Complete header fingerprints
Include address, normalized type, safe hash, style id and merge membership. Assert all static/unrelated cells unchanged, every runtime value changed/cleared as intended and exact header merge set preserved.

### 8.4 Complete workbook source-vs-roundtrip equality
Directly compare sheet order, exact merge set + declared count consistency, dimension, cols, explicit row-height/customHeight map, Print_Area, full page setup, Part B centering/protection structural fingerprint, complete relationship inventory and media hashes.

### 8.5 Reference-image inventory equality
Snapshot complete anchors/relationships/media before removal. Remove only rId3/rId3/image3-if-orphaned. Normalize target-only items from BEFORE and require exact equality with AFTER for all non-target inventories.

### 8.6 Raw structural inspector assertions
Tests must directly assert all required inspector properties for:
- Part A 4: unchanged legacy geometry, `A1:BJ52`;
- Part A 5: row29 cloned from source28, old29->30, exact style/height/merges/dimension/page, `A1:BJ53`;
- Part A 10: rows29:34 cloned from source28, old29->35, exact style/height/merges/dimension/page, `A1:BJ58`;
- Part B 6: unchanged geometry/totals row31, `A1:X35`, centering/protection preserved;
- Part B 8: source27:30 cloned to31:34 and35:38, old31->39, exact style/height/merges/dimension/page, `A1:X43`, centering/protection preserved.

Counts/sentinels/Print_Area-only are supplemental, not acceptance proof.

### 8.7 Formula cell/node sets
Inspect worksheet XML only, detect `<f(?:\s|>)`, return worksheet/cell/safe-node-hash fingerprints. Test original A/B, sanitized A/B, Part A 4/5/10 and Part B 6/8. Accepted source and every output set must be exactly empty.

### 8.8 Difficulty
Difficulty remains blank temporarily. No application `Difficulty_*` field may be added/read. Sanitized Part A must directly prove mapped legacy Difficulty sample cells blank.

Critical rule: do not add another helper unless its required returned properties are directly asserted in the same corrective commit.

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
D2-WP003-R3-R7 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R8 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R8-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R8 ONLY / LOW-CREDIT
PRIVACY_PURGE_REQUIRED = NO
```

D2 remains open until production Excel/combined/PDF parity and export security are independently accepted.
