# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / D2-WP003-R3 AUTHORIZED**  
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

## 5. Business rules retained

Current weighting remains:
```text
PROF_STAFF_CHIEF = 70 / 30
PROF_JAPANESE_STAFF = 70 / 30
PROF_ASST_MGR = 60 / 40
PROF_SECTION_MGR = 50 / 50
PROF_SENIOR_MGR = 50 / 50
PROF_DGM = 50 / 50
PROF_GM = 50 / 50
PROF_VP = 50 / 50
```

Owner decision:
```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

No `Difficulty_*` field may be invented or read until separately approved against canonical schema evidence.

## 6. Corrective history / privacy purge

R2 did not pass independent source acceptance because it still lacked true structural insertion, correct header/value mapping, and contract-complete privacy proof.

Owner approved `D2-WP003-R3` with Privacy Purge. ChatGPT force-reset the canonical branch to the clean pre-R2 implementation baseline:
```text
R3_SAFE_BASELINE = 22d8215287f0280fbbea668a275fee77b3801776
THIRD_CANONICAL_BRANCH_PURGE = COMPLETE
```

Do not create refs/tags/backups to purged lineages or reuse prior generated sanitized binaries.

## 7. R3 strategy — feasibility first, no binary publication

R3 is intentionally **not** a production sanitizer/renderer package.

R3 may commit only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`
- `package.json` / `package-lock.json` for `xlsx-populate@1.21.0`

R3 must not commit:
- any `.xlsx`/`.xls`/`.xlsm` file;
- extracted images/media;
- `assets/export-templates/**`;
- production sanitizer/renderer source;
- application export/normalizer changes.

Local proof outputs must be disposable and outside tracked repository paths.

## 8. R3 no-op parity proof

Before mutation, exact owner workbooks must round-trip through `xlsx-populate@1.21.0` without material drift in:
- sheet names/order;
- print areas;
- page size/orientation/scale;
- merge counts;
- representative dimensions;
- Part B protection;
- drawing/image relationship counts needed by the user-facing form;
- reparse validity.

Failure => `BLOCKER_XLSX_LIBRARY_PARITY`.

## 9. R3 header/value-map proof

R3 must prove addresses without logging source values.

- Part A labels stay on row 6; only corresponding row-7 value ranges may be cleared/replaced.
- Part B labels stay on row 2; only corresponding row-3 value ranges may be cleared/replaced.

If exact value ranges cannot be proven structurally => `BLOCKER_HEADER_VALUE_MAP_UNRESOLVED`.

## 10. R3 privacy-map proof

On disposable copies only, prove a bounded sensitive-range map for identity, org, dates, Hoshin, objective/action/target/result, self/appraiser data, signatures/evaluator names, scores/grades and legacy Difficulty sample values.

Required proof:
- collect designated source values in memory for text/numeric/date cell types without logging them;
- clear complete sensitive ranges while preserving labels/styles/merges;
- reparse and assert designated ranges empty;
- inspect all OOXML XML/text parts and prove collected sensitive text absent;
- introduce zero worksheet scoring formulas.

Failure/ambiguity => `BLOCKER_PRIVACY_RANGE_MAP_UNRESOLVED`.

## 11. R3 reference-image proof

Using only non-sensitive drawing metadata, identify the historical/reference screenshot and prove on a disposable copy that its drawing relationship/media target can be removed while approved branding remains and workbook reparses.

If target cannot be safely distinguished from branding => `BLOCKER_REFERENCE_IMAGE_ID_UNRESOLVED`.

No image bytes may be committed.

## 12. R3 TRUE Part A structural proof

Using bounded OOXML mutation, not style-copying into occupied rows, prove:
- 4 objectives: lower-section row 29 stays row 29;
- 5 objectives: rows 29+ shift +1, new objective row 29, old row29 sentinel => row30, print area => `A1:BJ53`;
- 10 objectives: rows 29+ shift +6, objective 10 row34, old row29 sentinel => row35, print area => `A1:BJ58`;
- inserted rows preserve representative row28 style/merge/border/alignment/height metadata;
- affected row/cell/merge/dimension/print references remain valid;
- A3 layout survives reparse.

Failure => `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 13. R3 TRUE Part B structural proof

Using disposable copies prove:
- 6 competencies: totals/signatures remain row31;
- 8 competencies: rows31+ shift exactly +8;
- two complete four-row competency blocks inserted before totals;
- old row31 sentinel => row39;
- print area => `A1:X43`;
- inserted blocks preserve representative style/merge/border/height metadata;
- A4 portrait, centering and protection survive reparse.

Failure => `BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 14. R3 verification

At minimum:
```text
node --test tests/mbo-xlsx-ooxml-feasibility.test.js
npm audit --omit=dev
git status --porcelain
```

No generated workbook/image/output may appear in Git diff.

R3 maximum executor state:
```text
FEASIBILITY_PROOF_PENDING_INDEPENDENT_REVIEW
```

Only after independent R3 acceptance may a later package authorize production sanitizer/renderer implementation and sanitized binary publication.

## 15. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R3 = AUTHORIZED / FEASIBILITY EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R3-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R3 PROOF ONLY / LOW-CREDIT
```

PDF generation, export UI, Live Kintone, deployment and production XLSX binary publication remain outside R3.

## 16. D2 closure condition

D2 remains open until production Part A/Part B/combined/PDF parity and export security are independently accepted.

```text
D2 = NOT PASS / IN PROGRESS
PROJECT MBO2026 = NOT COMPLETE
```