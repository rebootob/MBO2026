# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / D2-WP003-R3-R1 AUTHORIZED**  
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
CONFIRMED BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
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

## 4. Frozen geometry

Part A:
```text
MAIN_SHEET = MBO Staff & Chief
PRINT_AREA = A1:BJ52
PAPER_SIZE = A3
ORIENTATION = LANDSCAPE
SCALE = 58%
MERGED_RANGES = 193
LEGACY_OBJECTIVE_ROWS = 25:28
LOWER_SECTION_START = ROW 29
HEADER_LABEL_ROW = 6
HEADER_VALUE_ROW = 7
```

Part B:
```text
MAIN_SHEET = (Part B) Competency
PRINT_AREA = A1:X35
PAPER_SIZE = A4
ORIENTATION = PORTRAIT
SCALE = 75%
HORIZONTAL_CENTERED = YES
SHEET_PROTECTION = YES
MERGED_RANGES = 79
LEGACY_COMPETENCY_BLOCKS = 6
TOTALS_SIGNATURE_START = ROW 31
HEADER_LABEL_ROW = 2
HEADER_VALUE_ROW = 3
```

Current weighting remains as confirmed, including Assistant Manager = 60/40.

Owner decision:
```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

## 5. R3 result and R3-R1 purpose

R3 correctly avoided binary publication, so no new Privacy Purge is required.

R3 feasibility acceptance failed because its proof was materially incomplete and false-positive prone: it checked only sheet names for parity, still mutated label rows, used shared-string heuristics for privacy, did not actually remove the reference image, copied values instead of performing structural insertion, omitted the Part A +1 path, and trusted helper booleans/unconditional assertions.

R3-R1 is authorized only to correct that feasibility proof.

## 6. R3-R1 write scope

Only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

`xlsx-populate@1.21.0` is already pinned. `package.json` and `package-lock.json` are read-only.

No workbook/image/binary publication is allowed.

## 7. Objective acceptance evidence

### 7.1 No-op parity

Tests must independently measure after load/output/reparse:
- sheet names/order;
- Part A `A1:BJ52`, A3 landscape, scale 58%;
- Part B `A1:X35`, A4 portrait, scale 75%, horizontal centering;
- merge counts 193 / 79;
- representative row heights and column widths;
- Part B protection;
- drawing/image relationship inventory needed by approved branding;
- valid reparse.

### 7.2 Header/value separation

- Part A row-6 labels must remain unchanged; only structurally proven row-7 value ranges may mutate.
- Part B row-2 labels must remain unchanged; only structurally proven row-3 value ranges may mutate.
- compare labels using safe addresses/fingerprints without publishing source values.

Unresolved mapping => `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

### 7.3 Privacy range map

Do not use `sharedStrings.xml` keyword heuristics as the source of truth.

Use an explicit bounded range map covering identity/org/date/Hoshin/objective/action/target/result/self/appraiser/signature/score/grade/Difficulty sample ranges.

Collect text/numeric/date values only in memory, clear designated ranges, reparse and directly assert the ranges are empty. Scan OOXML for collected sensitive text without emitting those values in logs/errors. Preserve labels/styles/merges and introduce zero scoring formulas.

Unresolved map => `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

### 7.4 Reference image

Using non-sensitive drawing metadata, distinguish the historical/reference screenshot from approved branding. On a disposable package actually remove its drawing object/relationship/media target when orphaned, preserve branding, update package metadata as required and reparse.

Unresolved target => `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED`.

### 7.5 True Part A insertion

Each test starts from a fresh disposable source:
- 4 objectives: row29 remains row29; print area remains row52.
- 5 objectives: structurally insert +1 after row28; old row29 => row30; print area => `A1:BJ53`.
- 10 objectives: structurally insert +6; objective slot 10 => row34; old row29 => row35; print area => `A1:BJ58`.

Update real OOXML row/cell/merge/dimension/print and any actually affected range refs. Inserted rows preserve representative row28 height/style/merge/border/alignment structure. Preserve A3/landscape/58%.

Value copying into occupied rows is not acceptance.

### 7.6 True Part B insertion

Each test starts fresh:
- 6 competencies: totals remain row31; print area row35.
- 8 competencies: insert two complete four-row blocks; shift rows31+ by +8; old row31 => row39; print area => `A1:X43`.

Inserted blocks preserve representative legacy block height/style/merge/border/alignment structure. Preserve A4/portrait/75%/centering/protection.

Value copying is not acceptance.

### 7.7 Difficulty

Difficulty remains blank temporarily. Tests must directly assert the designated disposable Part A Difficulty cells/ranges are blank after sanitization. No unconditional pass assertion.

## 8. Test design rule

The test suite must inspect the output workbook/OOXML directly. It must not accept helper-returned success booleans as proof of the property under test.

Any unresolved evidence must fail closed.

Mandatory commands:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

## 9. Explicit exclusions

No:
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
D2-WP003-R3 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R1 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-R1-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3-R1 ONLY / LOW-CREDIT
```

## 11. D2 closure condition

D2 remains open until production Part A/Part B/combined/PDF parity and export security are independently accepted.

```text
D2 = NOT PASS / IN PROGRESS
PROJECT MBO2026 = NOT COMPLETE
```