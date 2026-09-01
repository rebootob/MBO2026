# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / D2-WP003-R1 AUTHORIZED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. D2 objective

Deliver Excel/PDF outputs that preserve the approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

Required final deliverables remain:
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

Never copy stale sample employee values, dates, titles, weights or old objective limits merely because they exist in the legacy workbook.

## 3. Closed foundations

```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
```

WP001 closed strict export authorization/privacy projection.
WP002 closed owner-provided Part A/Part B template evidence and froze the renderer contract.

Accepted source-template fingerprints:
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
FIT_TO_PAGE = YES
GRIDLINES = HIDDEN
SHEET_PROTECTION = NO
MERGED_RANGES = 193
CELL_XF_STYLE_RECORDS = 429
WORKSHEET_FORMULAS = 0
LEGACY_OBJECTIVE_ROWS = 25:28
LEGACY_OBJECTIVE_ROW_HEIGHT ≈ 140.1 pt
```

Stable lower sections begin at row 29. Therefore objectives 5–10 must **insert rows after row 28** and shift review/summary/signature/overall sections downward. Writing objective data directly into rows 29+ without insertion is invalid.

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

Header labels and values occupy separate rows. R1 must preserve label text and write dynamic values into the actual value row/ranges, not overwrite label anchors.

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
CELL_XF_STYLE_RECORDS = 142
WORKSHEET_FORMULAS = 0
LEGACY_COMPETENCY_BLOCKS = 6
TOTALS_SIGNATURE_START = ROW 31
```

For an 8-item management set, two complete competency blocks must be inserted before totals/signatures. Writing item 7/8 into rows 31+ without insertion is invalid.

Header labels are in row 2 while dynamic employee/org values are in the corresponding row-3 value ranges. R1 must preserve labels.

## 6. Business-rule conflicts from legacy samples

Legacy workbook content is not current business truth.

Confirmed current weighting remains:
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

Excel and future PDF must consume the secured projection from WP001.

Renderer must not:
- make Kintone calls;
- read unrestricted raw App794 for Employee-Self output;
- resolve roles/authority itself;
- reintroduce manager/GM/appraiser confidential data into Employee-Self output;
- treat UI visibility as authorization.

Sanitized templates must contain no reusable employee/sample confidential content.

## 8. WP003 review result and privacy purge

The first WP003 implementation did not pass independent source review. Failures included:
- unsafe/incomplete sanitization;
- no true Part A row insertion/clone/shift for 5–10 objectives;
- no true Part B block insertion/clone/shift for 8 competencies;
- header value data written into label rows;
- tests that checked text presence instead of structural parity/privacy guarantees.

Owner approved `D2-WP003-R1` with Privacy Purge.

ChatGPT force-reset the canonical branch to safe pre-implementation baseline:
```text
SAFE_BASELINE = 731ba80a976847e579d80fc30012df54fd36badf
CANONICAL_BRANCH_PURGE = COMPLETE
```

Do not create new refs/tags/backups to the purged lineage. Do not record purged commit/blob identifiers in public repository docs.

## 9. R1 privacy-first sanitizer contract

Sanitization must be evidence-driven, not guessed from isolated anchors.

Required:
1. verify exact owner-template SHA-256 inputs;
2. preserve labels/branding/merges/styles/geometry/print settings;
3. clear actual sample value ranges for identity, org, dates, Hoshin, objectives, results, evaluator data, signatures and scores;
4. remove non-user-facing historical/reference screenshot/drawing while retaining approved user-facing branding;
5. extract source-sensitive non-empty text at runtime without committing it;
6. inspect **all XML/text parts** of the sanitized OOXML package and prove extracted sensitive values are absent;
7. commit sanitized binaries only after privacy proof passes.

No real sample values may be hardcoded in tests or docs.

## 10. R1 Part A structural renderer

For `<=4` objectives, preserve legacy rows 25–28.

For `5–10` objectives:
- insert rows immediately after row 28;
- clone full objective row structure from the legacy objective block including merges/styles/borders/alignment/height;
- shift all lower sections by inserted-row count;
- move summary/score/signature anchors with those sections;
- extend print-area bottom;
- retain A3 landscape and horizontal geometry;
- render all objectives; no truncation.

Tests must prove the lower section moves exactly by +1 for 5 and +6 for 10.

## 11. R1 Part B structural renderer

For 6 competencies, preserve legacy six blocks.

For 8 competencies:
- insert two complete repeated blocks before totals/signatures;
- clone block merges/styles/borders/row heights;
- shift totals/signatures downward;
- extend print-area bottom;
- retain A4 portrait, horizontal centering and protection behavior;
- render current dynamic profile/weighting.

Test must supply exactly eight competency items.

## 12. Score/formula strategy

The approved source main sheets contain zero worksheet formulas.

Current application/scoring services remain calculation authority. Initial renderer writes authorized calculated values and must not introduce workbook-only scoring formulas.

## 13. Difficulty Level data-source gap

Part A layout includes Difficulty Level (`AA:AB`), but current repository evidence/FIELD_DICTIONARY does not prove a canonical current App794 Difficulty field.

R1 rules:
- never invent a field code;
- never bypass secured projection;
- if a canonical current field is proven from bounded directly relevant evidence, extend normalizer/export projection narrowly and test security regression;
- if no canonical field is proven, stop with `BLOCKER_DIFFICULTY_SOURCE_UNRESOLVED`.

## 14. XLSX library gate

Only `xlsx-populate@1.21.0` is authorized, conditional on a no-op round-trip proof preserving material structure:
- sheet names/order;
- Part A/Part B print geometry;
- merge counts;
- key dimensions;
- Part B protection;
- required branding/image relationships;
- reparsable XLSX.

If material drift occurs, stop with `BLOCKER_XLSX_LIBRARY_PARITY`; no second spreadsheet library is authorized.

`npm audit --omit=dev` HIGH/CRITICAL attributable to the new dependency is also a blocker.

## 15. Current gate

```text
D2 = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003 = CORRECTIVE REQUIRED / NOT CLOSED
D2-WP003-R1 = AUTHORIZED / EXECUTION ACTIVE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R1-SOURCE-20260901-01
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = EXECUTE R1 ONLY / LOW-CREDIT
```

PDF generation, export UI, Live Kintone access, deployment and D2-WP004 remain outside R1.

## 16. D2 closure condition

D2 may close only when:
- Part A XLSX parity is independently accepted;
- Part B XLSX parity is independently accepted;
- combined workbook behavior is accepted where required;
- PDF output/parity is independently accepted;
- 5–10 objective binary handling is proven;
- 6/8 competency handling is proven;
- authorization/confidentiality remains enforced in all export paths;
- no material legacy-format gap remains undocumented.

Until then:
```text
D2 = NOT PASS / IN PROGRESS
PROJECT MBO2026 = NOT COMPLETE
```
