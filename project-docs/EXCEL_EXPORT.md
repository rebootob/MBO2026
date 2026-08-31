# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / D2-WP001 PASS-CLOSED / D2-WP002 PASS-CLOSED / D2-WP003 PROPOSED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

D1 is closed. D2 was explicitly started on 2026-09-01 ICT. This document is the canonical D2 export contract.

## 1. D2 objective

Deliver Excel/PDF outputs that preserve the approved legacy PMS presentation while using App794/current configuration as business-data truth and preserving D1 security/privacy boundaries.

Required final deliverables remain:

```text
1. Excel Part A — MBO / Objectives
2. Excel Part B — Competency / Evaluation
3. Combined workbook where applicable
4. PDF output matching approved legacy presentation
5. 5–10 objective handling without silent truncation
6. authorization/privacy-safe export behavior
```

## 2. Authority split

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
```

Never copy stale sample employee values, dates, titles, weights or old objective limits merely because they are present in the legacy workbook.

## 3. D2-WP001 — PASS / CLOSED

Accepted security/projection foundation:
- explicit supported trusted export context required;
- Employee-Self exact Employee_Code match;
- cross-employee denied;
- SHARED Approver denied;
- DEDICATED Approver requires current native App794 Assignee;
- stale/static route authority denied;
- HR/Technical caller labels do not self-authorize;
- Employee-Self confidential Part A/Part B evaluator data omitted;
- exact 4/5/10 objective projection covered;
- confirmed profile weighting preserved.

Corrective implementation commit:
`1d48dc218fe7e2c542773bcf441332f8b06f88f9`.

Accepted offline tests: 10/10 export tests PASS and 1/1 integration test PASS.

## 4. D2-WP002 evidence — owner supplied / PASS-CLOSED

Owner directly supplied both approved legacy Excel binaries to ChatGPT. They were inspected read-only. Original employee-bearing binaries were not committed to Git.

Evidence fingerprints:

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

No Antigravity execution was needed for WP002.

# PART A — LEGACY STRUCTURAL CONTRACT

## 5. Part A workbook geometry

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
```

Page margins from evidence:

```text
LEFT = 0.1968503937 in
RIGHT = 0.1968503937 in
TOP = 0
BOTTOM = 0.1968503937 in
HEADER = 0
FOOTER = 0
```

The workbook contains approved branding plus legacy/reference images. Runtime sanitized templates should retain user-facing branding only and remove non-user-facing historical/reference screenshots.

## 6. Part A section layout

```text
Rows 6–8   = title / fiscal year / employee header
Rows 8–14  = difficulty + achievement rating-scale tables
Rows 10–19 = company / department / section Hoshin areas
Rows 20–24 = Part A objective/evaluation headings
Rows 25–28 = four legacy objective blocks
Rows 29–35 = periodical review / appraiser comments / Part A score summary
Rows 37–42 = objective approval + evaluation signatures/dates
Rows 45–50 = overall Part A / Part B / Total block
```

Legacy objective rows 25–28 are each approximately `140.1 pt` high.

Representative legacy styling is extensive and must be preserved from template assets rather than manually reconstructed. Examples include:
- Arial-based title/header styles;
- green objective setup header;
- yellow/orange weight/difficulty/self-evaluation groups;
- pink superior-evaluation groups;
- multiple thin/medium/double border styles;
- wrapped objective/action text;
- numeric score formats and centered score cells.

## 7. Part A source-to-layout mapping

Header/business mapping:

```text
B6:M7   = form title
N6:Q7   = Fiscal Year
Z6:AF7  = Department
AG6:AL7 = Section
AM6:AP7 = Start Date
AQ6:AS7 = Employee ID
AT6:BC7 = Employee Name
BD6:BI7 = Position
G16:AF19 = Department Hoshin content
AM16:BI19 = Section Hoshin content
```

Objective block mapping for each objective row:

```text
B:I   = Objective / expected result / target
J:S   = Action Plan
T:W   = Additional agreement / Comment
Y:Z   = Weight[A]
AA:AB = Difficulty Level
AD:AG = Periodical Review by Appraisee
AI:AJ = Self Achievement Level
AK:AR = Actual Result & Achievement
AS:AU = 1st Appraiser Achievement Level
AV:AW = 1st Appraiser Score
AX:AZ = 2nd Appraiser Achievement Level
BA:BB = 2nd Appraiser Score
BC:BE = Average Score[B]
BF:BI = MBO Point [A] x [B]
```

Score/approval blocks:

```text
BC29:BI35 = Part A total / weighted result block
B37:S42   = objective approval names/dates
AI37:AY41 = evaluation names/dates
B47:F50   = Part A overall score
G47:K50   = Part B overall score
L47:N50   = total score
```

# PART B — LEGACY STRUCTURAL CONTRACT

## 8. Part B workbook geometry

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
```

Page margins from evidence:

```text
LEFT = 0.2362204724 in
RIGHT = 0.2362204724 in
TOP = 0.1968503937 in
BOTTOM = 0.0787401575 in
HEADER = 0.1968503937 in
FOOTER = 0.1968503937 in
```

A static branding image is embedded in the main sheet.

The workbook also contains a second visible `Sheet1` with only two rating-scale labels and no print area. It is classified as an orphan/helper artifact and is excluded from the user-facing renderer contract unless later evidence proves otherwise.

## 9. Part B section layout and mapping

```text
Rows 2–3   = title / fiscal year / employee header
Rows 5–6   = rating-scale / result heading
Rows 7–29  = six repeated competency blocks in supplied evidence
Rows 31–34 = total / weighted Part B / appraiser signatures
```

Header mapping:

```text
B2:F3   = competency/profile title
G2:H3   = Fiscal Year
J2:L3   = Department
M2:O3   = Section
P2:Q3   = Position
R2:Q?   = Employee ID label/value area; actual value anchor is R3
S2:W3   = Employee Name
```

Main competency result layout:

```text
B:J   = competency heading/criteria/description/rating-scale label
K:Q   = 1st Appraiser result area
R:W   = 2nd Appraiser result area
```

Supplied evidence contains six competencies:
1. Adaptability
2. Problem Solving
3. Customer Focus
4. Additional Value Creation
5. Safety Awareness
6. Compliance / COCE

Current renderer must derive applicable competency items from the active competency set. The current application can require 6-item operational or 8-item management sets.

Totals/signatures:

```text
B31:D34 = [A] Total
E31:H34 = Total Score (5)
I31:M34 = Part B weighted result
Q31:S34 = 1st Appraiser signature/date
T31:W34 = 2nd Appraiser signature/date
```

## 10. Confirmed legacy-content conflicts

The supplied samples contain stale/inconsistent business content. These are evidence findings, not renderer requirements.

### Conflict A — Part A objective cap
Legacy text says approximately `At least 2 till 4 objectives`.

Current D2 requirement supports through 10 objectives. The stale cap must not be presented as current truth.

### Conflict B — sample fiscal dates
Part A displays sample appraisal/start dates that do not align with the displayed FY. Runtime dates must come from current fiscal/configuration truth.

### Conflict C — Part B profile/weight mismatch
The supplied Part B history/filename is Staff/Chief-oriented, while the visible title says `Competency for Asst. Manager`, and the result block displays static `Part B : Competency 30%`.

This cannot be used as current business truth.

Confirmed baseline remains authoritative:

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

Therefore profile title and Part A/Part B percentage text/value must be rendered dynamically from current Profile_Code/configuration.

# FROZEN RENDERER DESIGN

## 11. Template-preserving implementation rule

The renderer must use **sanitized template assets** and preserve the accepted legacy OOXML structure. Do not rebuild these workbooks from scratch unless a later independent parity review proves that approach equivalent.

Reason:
- Part A has 193 merged ranges and 429 cell-style records;
- Part B has 79 merged ranges and 142 cell-style records;
- print settings, widths, row heights, borders and branding are part of the acceptance target.

Sanitized runtime templates must:
- remove employee names and IDs;
- remove sample dates;
- remove sample Hoshin/objective/action/evaluation content;
- remove evaluator comments/scores/signature data;
- remove confidential/sample data;
- remove non-user-facing historical/reference screenshots;
- preserve approved branding images;
- preserve sheet names, styles, merges, dimensions and print geometry.

Original owner binaries must not be committed.

## 12. Dynamic Part A objective strategy — frozen

For objective count `<= 4`:
- use the four legacy objective rows exactly.

For objective count `5–10`:
1. insert/clone additional objective row blocks immediately after legacy row 28;
2. clone the row-28 horizontal merged structure, styles, borders, alignments and row height for each added objective;
3. shift review/comment/signature/overall sections downward by the inserted row count;
4. extend print area bottom to the new final row;
5. keep existing column widths and A3 landscape horizontal geometry;
6. retain legacy scale behavior and allow vertical pagination rather than horizontal compression;
7. never truncate objectives silently.

This strategy preserves the original horizontal form while extending vertically only where the new business requirement exceeds legacy capacity.

## 13. Dynamic Part B competency strategy — frozen

- derive competency list from active `Competency_Set_Code` / current profile configuration;
- preserve the repeated legacy competency visual block;
- for 6-item sets, use the current six blocks;
- for 8-item management sets, insert two additional repeated blocks before totals/signatures;
- shift totals/signature blocks downward;
- extend print area bottom;
- retain A4 portrait horizontal geometry;
- render profile title and weighting dynamically from current configuration.

## 14. Score/formula strategy — frozen

Both supplied legacy main sheets contain **zero worksheet formulas**.

Therefore current scoring/projection services remain the calculation authority. The renderer writes already-authorized calculated values into the legacy presentation cells.

Do not introduce workbook-only scoring formulas in the initial renderer foundation. Any later formula requirement requires explicit review because it would create a second business-logic engine.

## 15. Security/privacy strategy — frozen

Excel and future PDF must consume the secured projection contract from WP001.

Renderer must not:
- bypass `MboExportService` authorization;
- read unrestricted App794 raw records directly for Employee-Self output;
- reintroduce manager/GM/appraiser confidential data into Employee-Self output;
- authorize from static route snapshots;
- treat a download button as authority.

Sanitized templates must contain no reusable employee/sample confidential content.

## 16. PDF strategy and evidence gap

Frozen print geometry:

```text
Part A PDF geometry = A3 landscape
Part B PDF geometry = A4 portrait
```

PDF output must reuse the same logical section/data contract and confidentiality rules as Excel.

An approved legacy PDF sample was **not supplied** during WP002. Therefore:

```text
PDF_REFERENCE_SAMPLE = NOT PROVIDED
EXACT_PDF_VISUAL_PARITY = NOT YET ACCEPTED
```

This does not block the XLSX renderer foundation, but D2 cannot close until PDF output itself is implemented and independently accepted.

## 17. D2-WP002 closure

```text
D2-WP002 = PASS / CLOSED
TEMPLATE_EVIDENCE = ACCEPTED
RENDERER_DESIGN_CONTRACT = FROZEN
ANTIGRAVITY_USED = NO
SOURCE_CHANGE = NO
LIVE_KINTONE = NO
DEPLOY = NO
```

## 18. Proposed D2-WP003 — SANITIZED TEMPLATE ASSETS + XLSX RENDERER FOUNDATION

### Status: **PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED**

Proposed minimum outcome:
1. produce sanitized Part A / Part B runtime template assets preserving accepted structure;
2. implement template-preserving XLSX rendering from secured `MboExportService` projection;
3. generate valid Part A output for exact 4, 5 and 10 objectives;
4. generate valid Part B output for 6 and 8 competencies;
5. validate sheet names, print area/paper/orientation, merged ranges and key mapped cells;
6. prove sanitized templates/output contain no legacy employee/sample confidential data;
7. keep PDF renderer, UI and deploy outside this package unless separately approved.

No source authorization exists yet.

## 19. Current authorization state

```text
D2_STATUS = IN PROGRESS
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
ACTIVE_D2_WORK_PACKAGE = NONE
PROPOSED_D2_WORK_PACKAGE = D2-WP003
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY_ACTION = STOP / WAIT OWNER
```

## 20. D2 closure condition

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
