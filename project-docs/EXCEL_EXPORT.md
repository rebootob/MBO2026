# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / D2-WP003-R3 REVIEWED-NOT-PASS / R3-R1 PROPOSED**  
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

Current weighting remains as already confirmed, including Assistant Manager = 60/40.

Owner decision remains:
```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

## 5. R3 strategy and result

R3 was a feasibility-only package after the third privacy purge. It correctly avoided committing XLSX/image/binary output and changed only feasibility source/test plus `xlsx-populate@1.21.0` dependency metadata.

Therefore:
```text
R3_SCOPE = PASS
R3_PRIVACY_PURGE_REQUIRED = NO
R3_FEASIBILITY_ACCEPTANCE = FAIL / CORRECTIVE REQUIRED
```

## 6. R3 blockers

### 6.1 No-op parity not materially proved

The proof only validates first-sheet names after round-trip. It does not validate the required print geometry, merge counts, representative dimensions, protection, sheet order or drawing/branding relationships.

### 6.2 Header/value separation not proved

The proof still clears Part A row-6 cells and does not establish real row-7 value ranges. It also does not prove Part B row-2 labels remain unchanged while row-3 values are modified.

### 6.3 Privacy remains heuristic, not range-driven

Sensitive tokens are still derived from `sharedStrings.xml` using keyword filtering. This does not prove clearing of designated text/numeric/date cells, and sensitive token text may be interpolated into error messages.

Required privacy proof remains:
- exact bounded sensitive cell/range map;
- in-memory collection across text/numeric/date types without logging values;
- clear designated ranges;
- reparse and assert ranges empty;
- OOXML-wide verification without emitting source values;
- label/style/merge geometry preserved.

### 6.4 Reference image removal not proved

Counting `xl/drawings/` / `xl/media/` files is not identification or removal. The proof must distinguish the reference screenshot from approved branding using non-sensitive metadata, remove its relationship/media target on a disposable package, retain branding, and reparse.

### 6.5 Part A structural insertion not proved

The R3 helper copies non-empty cell values and row height from rows 29..52 to rows +6. It does not perform bounded OOXML row insertion/reference surgery and does not prove:
- the five-objective +1 path;
- style/merge/border/alignment cloning;
- row/cell/merge/dimension reference updates;
- post-reparse print geometry/A3 scale.

Sentinel movement alone is not sufficient.

### 6.6 Part B block insertion not proved

The helper copies row values from 31..35 to rows +8. It does not insert two four-row competency blocks or prove style/merge/border/height, print area `A1:X43`, A4 geometry, centering and protection after reparse.

### 6.7 Tests are false-positive prone

Several tests assert booleans returned by the helper instead of independently measuring workbook structure. The Difficulty test is unconditional `assert.ok(true)`.

A green local test exit code therefore cannot establish contract acceptance until the tests themselves objectively validate the workbook package.

## 7. Proposed D2-WP003-R3-R1

R3-R1 should remain feasibility-only and no-binary. No history rewrite is needed.

Expected correction scope:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`;
- dependency metadata only if genuinely necessary.

R3-R1 must:
- prove complete no-op material parity;
- prove real label/value row separation for Part A and Part B;
- use exact sensitive-range mapping across text/numeric/date cells without logging source values;
- perform real disposable reference-image relationship/media removal while preserving branding;
- perform bounded OOXML structural insertion/reference rewrites for Part A +1/+6 and Part B +8;
- independently assert resulting row/merge/style/dimension/print/protection geometry after reparse;
- fail closed on any unresolved structure.

Still forbidden:
- any workbook/image/media/output commit;
- production sanitizer/renderer;
- application normalizer/export projection changes;
- Difficulty field implementation;
- PDF/UI/Live Kintone/deploy;
- next D2 package.

## 8. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3 = REVIEWED / NOT PASS / NOT CLOSED
D2-WP003-R3-R1 = PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
```

## 9. D2 closure condition

D2 remains open until production Part A/Part B/combined/PDF parity and export security are independently accepted.

```text
D2 = NOT PASS / IN PROGRESS
PROJECT MBO2026 = NOT COMPLETE
```
