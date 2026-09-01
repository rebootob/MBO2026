# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / D2-WP003-R2 AUTHORIZED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

Required final deliverables:
```text
1. Excel Part A — MBO / Objectives
2. Excel Part B — Competency / Evaluation
3. Combined workbook where applicable
4. PDF output matching approved legacy presentation
5. 5–10 objective handling without silent truncation
6. 6/8 competency handling without layout collision
7. authorization/privacy-safe export behavior
```

## 2. Authority split

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
```

Never copy stale employee/sample values, dates, titles, weights or objective limits simply because they exist in the legacy workbook.

## 3. Closed foundations

```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
```

WP001 closed strict export authorization/privacy projection.
WP002 closed owner-provided Part A/Part B template evidence and froze the renderer contract.

Accepted source fingerprints:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Original owner binaries remain outside Git.

## 4. Part A frozen geometry

```text
MAIN_SHEET = MBO Staff & Chief
USED_RANGE = A1:BL52
PRINT_AREA = A1:BJ52
PAPER_SIZE = A3
ORIENTATION = LANDSCAPE
SCALE = 58%
GRIDLINES = HIDDEN
SHEET_PROTECTION = NO
MERGED_RANGES = 193
WORKSHEET_FORMULAS = 0
LEGACY_OBJECTIVE_ROWS = 25:28
LOWER_SECTION_START = ROW 29
LEGACY_OBJECTIVE_ROW_HEIGHT ≈ 140.1 pt
```

Core objective columns:
```text
B:I   Objective / result / target
J:S   Action Plan
T:W   Additional agreement / Comment
Y:Z   Weight
AA:AB Difficulty Level
AD:AG Periodical Review
AI:AJ Self Achievement
AK:AR Actual Result & Achievement
AS:AU 1st Appraiser Achievement
AV:AW 1st Appraiser Score
AX:AZ 2nd Appraiser Achievement
BA:BB 2nd Appraiser Score
BC:BE Average Score
BF:BI MBO Point
```

Header labels and values use separate rows. Part A labels remain on row 6; runtime values belong in the corresponding row-7 value areas.

## 5. Part B frozen geometry

```text
MAIN_SHEET = (Part B) Competency
USED_RANGE = A1:X35
PRINT_AREA = A1:X35
PAPER_SIZE = A4
ORIENTATION = PORTRAIT
SCALE = 75%
HORIZONTAL_CENTERED = YES
GRIDLINES = HIDDEN
SHEET_PROTECTION = YES
MERGED_RANGES = 79
WORKSHEET_FORMULAS = 0
LEGACY_COMPETENCY_BLOCKS = 6
TOTALS_SIGNATURE_START = ROW 31
```

Part B labels remain on row 2; runtime employee/org/position/name values belong in row-3 value areas.

## 6. Business-rule conflicts from legacy samples

Confirmed current weighting:
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

Do not reproduce stale `2 till 4 objectives` or static `Part B 30%` as current rules.

## 7. Security/privacy contract

Excel and future PDF consume the secured projection from WP001.

Renderer must not:
- make Kintone calls;
- read unrestricted raw App794;
- resolve roles/authority itself;
- reintroduce manager/GM/appraiser confidential data into Employee-Self output;
- treat UI visibility as authorization.

Sanitized templates must contain no reusable employee/sample confidential content.

## 8. Corrective history and second privacy purge

Two prior XLSX implementation attempts did not pass independent acceptance. Blocking classes included incomplete sanitization, label/value anchor errors, no true structural insertion, insufficient tests and an unproven Difficulty field guess.

Owner approved `D2-WP003-R2` with a second Privacy Purge and decided:
```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
```

ChatGPT force-reset canonical branch to clean pre-R1-implementation baseline:
```text
R2_SAFE_BASELINE = a3953ff701a01c8af9dcf6bf2525a58e4888973e
SECOND_CANONICAL_BRANCH_PURGE = COMPLETE
```

Do not create refs/tags/backups to purged lineages and do not reuse prior generated sanitized binaries.

## 9. R2 privacy sanitizer contract

Privacy acceptance is **range-driven + OOXML-wide**, not shared-string heuristic only.

Required:
1. verify exact source SHA-256;
2. derive actual sensitive value ranges while preserving label cells;
3. collect runtime sensitive values from those ranges, including text/numeric/date types, without logging them;
4. clear all identity/org/date/Hoshin/objective/action/result/self/appraiser/signature/score/sample business value ranges;
5. clear any legacy sample Difficulty values;
6. remove the non-user-facing historical/reference drawing/image and related relationship/media entry while retaining approved branding;
7. reopen sanitized workbook and assert all designated sensitive ranges empty;
8. inspect all XML/text OOXML parts and prove extracted sensitive text absent;
9. verify drawing/image relationships prove reference image absent and approved branding retained;
10. introduce no scoring formulas;
11. commit sanitized binaries only after all checks pass.

No real sample values may be hardcoded in tests/docs/logs.

## 10. Difficulty decision — blank by Owner approval

R2 must not invent or read any `Difficulty_*` field.

```text
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
NORMALIZER_CHANGE = FORBIDDEN
EXPORT_PROJECTION_CHANGE = FORBIDDEN
```

Sanitized template clears sample Difficulty data and renderer leaves `AA:AB` blank.

## 11. True Part A structural insertion

For 4 objectives:
- preserve rows 25–28 and lower sections at legacy positions.

For 5–10 objectives:
- shift the existing rows 29+ downward by `objectiveCount - 4` **before** writing extra objectives;
- insert new objective rows after row 28;
- clone full row-28 style/merge/border/alignment/height structure;
- update affected OOXML row/cell/merge/dimension/print references;
- lower sections move exactly +1 for 5 and +6 for 10;
- print area becomes `A1:BJ53` for 5 and `A1:BJ58` for 10;
- retain A3 landscape and horizontal geometry;
- never overwrite original lower-section structures.

Copying style/data into already occupied rows is not structural insertion.

If `xlsx-populate` high-level API lacks a true insert primitive, bounded OOXML-level row/reference surgery inside the existing XLSX package is allowed. No second dependency is authorized.

## 12. True Part B structural insertion

For 6 competencies:
- preserve six legacy blocks and totals/signatures beginning row 31.

For 8 competencies:
- shift existing totals/signatures beginning row 31 downward by 8 rows;
- insert two complete four-row competency blocks before totals;
- clone style/merge/border/height structure;
- update affected OOXML row/cell/merge/dimension/print references;
- totals/signatures begin row 39;
- print area becomes `A1:X43`;
- retain A4 portrait, centering and protection;
- use current projection weight; stale 30% must not survive.

## 13. Structural acceptance proof

Tests must use structural sentinels/metadata, not only data text.

At minimum:
- Part A 4: old lower-section row 29 remains row 29;
- Part A 5: old row-29 structure/content sentinel moves to row 30; new objective is row 29; print bottom 53;
- Part A 10: old row-29 moves to row 35; objective 10 at row 34; print bottom 58;
- inserted Part A rows preserve representative row-28 style/merge/height;
- Part B 6: totals begin row 31;
- Part B 8 test input contains exactly 8 items; old totals row 31 moves to row 39; items 7/8 occupy inserted blocks; print bottom 43;
- inserted Part B blocks preserve representative style/merge/height;
- header labels remain unchanged while values appear only in row 7 / row 3;
- Difficulty cells remain blank;
- A3/A4 geometry and Part B protection remain valid;
- zero scoring formulas;
- Employee-Self confidentiality remains intact.

If true structural insertion cannot be proven without material drift:
`BLOCKER_TRUE_STRUCTURAL_INSERTION_UNSAFE`.

## 14. XLSX library gate

Only `xlsx-populate@1.21.0` is authorized, conditional on no-op parity preserving material sheet/print/merge/dimension/protection/branding structure.

`npm audit --omit=dev` HIGH/CRITICAL attributable to the dependency is a blocker. No second spreadsheet/XML library is authorized.

## 15. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R2 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R2-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R2 ONLY / LOW-CREDIT
```

PDF generation, export UI, Live Kintone access, deployment and D2-WP004 remain outside R2.

## 16. D2 closure condition

D2 may close only when:
- Part A XLSX parity independently accepted;
- Part B XLSX parity independently accepted;
- combined workbook behavior accepted where required;
- PDF output/parity independently accepted;
- 5–10 objective binary handling proven;
- 6/8 competency handling proven;
- authorization/confidentiality enforced in all export paths;
- no material legacy-format gap remains undocumented.

Until then:
```text
D2 = NOT PASS / IN PROGRESS
PROJECT MBO2026 = NOT COMPLETE
```