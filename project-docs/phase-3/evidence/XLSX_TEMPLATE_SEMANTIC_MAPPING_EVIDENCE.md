# XLSX TEMPLATE SEMANTIC MAPPING EVIDENCE

> Status: **PROVEN EVIDENCE BASELINE**  
> Authorization Token: `D2-WP004-R1-R2-EVIDENCE-20260902-01`  
> Repository: `rebootob/MBO2026`  
> Branch: `ai/antigravity-wp002c`  
> Inspection Mode: READ-ONLY (No workbook mutation, no personal data copied)

---

## A. Evidence Identity and Method

### 1. Repository and Template Identity
- **Repository**: `rebootob/MBO2026`
- **Branch**: `ai/antigravity-wp002c`
- **Part A Local Template Path**: `app info/data/PMS_Staff & Chief_PART_A.xlsx`
- **Part B Local Template Path**: `app info/data/PMS_Staff & Chief_PART_B.xlsx`

### 2. SHA-256 Hashes (Independently Calculated & Verified)
- **Part A Template SHA-256**: `03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3` (EXACT MATCH)
- **Part B Template SHA-256**: `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3` (EXACT MATCH)

### 3. Worksheets Inspected
- **Part A Sheet**: `'MBO Staff & Chief'`
- **Part B Sheet**: `'(Part B) Competency'`

### 4. Inspection Method & Compliance Statement
- Inspected strictly READ-ONLY using `xlsx-populate` in an ephemeral scratch execution script (`scratch/inspect_templates.cjs`).
- Zero cells, styles, merges, defined names, or package XML nodes were saved or modified.
- Zero personal employee values (names, IDs, comments, scores) have been copied into this evidence document. Only static labels, structural cell addresses, merge coordinates, and projection paths are recorded.

---

## B. Part A Header Semantic Matrix

| Semantic Candidate | Workbook Label Text | Label Cell/Range | Candidate Writable Cell/Range | Merge Relationship | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `HEADER_FISCAL_YEAR` | `"FY'2026"` | `N6` | `N6` | `N6:Q7` | `partA.header.fiscalYear` | `PROVEN` | Explicit header cell containing fiscal year indicator. |
| `HEADER_EMPLOYEE_NAME` | `"Name - Surname"` | `AT6` | `AT7` | `AT7:BC7` | `partA.header.employeeName` | `PROVEN` | Label cell AT6 directly aligns with merged value range AT7:BC7. |
| `HEADER_EMPLOYEE_NAME_TH` | `"Name - Surname"` | `AT6` | `AT7` | `AT7:BC7` | `partA.header.employeeNameTH` | `PROVEN` | Fallback TH name projection maps to same employee name region. |
| `HEADER_DEPARTMENT` | `"Department"` | `Z6` | `AG7` | `AG7:AL7` | `partA.header.department` | `PROVEN` | Label Z6/AG6 aligns with department value range AG7:AL7. |
| `HEADER_SECTION` | `"Section"` | `AG6` | `AG7` | `AG7:AL7` | `partA.header.section` | `PROVEN` | Template section label AG6 shares section value region. |
| `HEADER_POSITION` | `"Position"` | `BD6` | `BD7` | `BD7:BI7` | `partA.header.position` | `PROVEN` | Label BD6 aligns with merged position value range BD7:BI7. |
| `HEADER_EMPLOYEE_CODE` | `"Emp. ID."` | `AQ6` | `AQ7` | `AQ7:AS7` | `partA.header.employeeCode` | `PROVEN` | Label AQ6 directly aligns with merged employee code range AQ7:AS7. |
| `HEADER_PROFILE_CODE` | N/A | N/A | N/A | N/A | `partA.header.profileCode` | `NO_SECURED_PROJECTION_SOURCE` | No distinct writable cell in template for Profile Code text. |
| `HEADER_PROFILE_FAMILY` | N/A | N/A | N/A | N/A | `partA.header.profileFamily` | `NO_SECURED_PROJECTION_SOURCE` | Profile Family is metadata used for weighting, not rendered to header cell. |
| `HEADER_PART_A_WEIGHT_PERCENT` | N/A | N/A | N/A | N/A | `partA.header.partAWeightPercent` | `NO_SECURED_PROJECTION_SOURCE` | Part A weight % is rendered in score summary (BC33), not header. |
| `HEADER_CHIEF_NAME` | N/A | N/A | N/A | N/A | None | `UNRESOLVED` | Template header has no distinct cell or secured projection for Chief Name. |

---

## C. Part A Hoshin Semantic Matrix

| Candidate Region | Workbook Label Text | Label Cell/Range | Target Writable Range | Merge Relationship | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `G8:S8` | `"from : April 1, 2024"` | `B8:E8` | `G8:S8` | None | None | `UNRESOLVED` | Range G8:S8 is static appraisal period dates (`"from: April 1..."`), NOT Hoshin text. |
| `G16:AF19` | `"Department's Hoshin "` | `B16:F18` | `G16:AF19` | `G16:AF19` | `partA.hoshin.departmentHoshinTitle` | `PROVEN` | Label B16 ("Department's Hoshin") explicitly owns merged target range G16:AF19. |
| `AM16:BI19` | `"Section's Hoshin "` | `AG16:AL18` | `AM16:BI19` | `AM16:BI19` | `partA.hoshin.sectionHoshinTitle` | `PROVEN` | Label AG16 ("Section's Hoshin") explicitly owns merged target range AM16:BI19. |

> **Hoshin Decision Summary**:
> - `G16:AF19` = `partA.hoshin.departmentHoshinTitle` (`PROVEN`, `SAFE_TO_MAP`).
> - `AM16:BI19` = `partA.hoshin.sectionHoshinTitle` (`PROVEN`, `SAFE_TO_MAP`).
> - Legacy alias `CORPORATE_HOSHIN_TEXT` mapped to `G8` is **CONTRADICTED / INVALID** (G8 is appraisal period text). `DEPARTMENT_HOSHIN_TEXT` mapped to `G16` is Department Hoshin.

---

## D. Part A Objective/Evaluation Semantic Matrix

Baseline 4-objective template: Row `25` (Objective 1), Row `26` (Objective 2), Row `27` (Objective 3), Row `28` (Objective 4).

| Semantic Role (Obj i, r = 24+i) | Workbook Header Label | Target Writable Range | Merge Relationship | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `OBJECTIVE_i_TITLE` / `OBJECTIVE_NAME_AND_TARGET` | `"Objectives (Indicate expected result...)"` | `B${r}` | `B${r}:I${r}` | `partA.objectives[i-1].title` | `PROVEN` | Merged range B:I holds objective title & target text. |
| `OBJECTIVE_i_KPI` / `PLAN_TARGET` | `"Action Plan (Indicate activities...)"` | `J${r}` | `J${r}:S${r}` | `partA.objectives[i-1].kpi` | `PROVEN` | Merged range J:S holds action plan / KPI text. |
| `OBJECTIVE_i_MEASUREMENT` | `"Additional agreement / Comment"` | `T${r}` | `T${r}:W${r}` | `partA.objectives[i-1].measurement` | `PROVEN` | Merged range T:W holds rating criteria / measurement guidance text. |
| `OBJECTIVE_i_WEIGHT` | `"Weight[A]"` | `Y${r}` | `Y${r}:Z${r}` | `partA.objectives[i-1].weight` | `PROVEN` | Range Y:Z holds objective numeric weight. |
| `OBJECTIVE_i_DIFFICULTY` | `"Dificulty Level [1-4]"` | `AA${r}` | `AA${r}:AB${r}` | None (R3 Frozen Decision) | `UNRESOLVED` | Frozen R3 Decision: Difficulty level cell MUST REMAIN BLANK. |
| `OBJECTIVE_i_SELF_RATING` | `"Achievement Level; 1-5"` | `AS${r}` | `AS${r}:AU${r}` | `partA.objectives[i-1].selfAchievement` | `PROVEN` | Range AS:AU holds 1st Appraiser/Self achievement level. |
| `OBJECTIVE_i_SELF_COMMENT` | `"Periodical Review by Appraisee"` | `AD${r}` | `AD${r}:AG${r}` | `partA.objectives[i-1].selfComment` | `PROVEN` | Range AD:AG holds Appraisee self-review comment. |
| `OBJECTIVE_i_MANAGER_RATING` | `"2nd Appraiser Achievement Level"` | `AX${r}` | `AX${r}:AZ${r}` | `partA.objectives[i-1].managerAchievement` | `PROVEN` | Exposed for Approver export context (`isEmployeeSelf === false`). |
| `OBJECTIVE_i_MANAGER_SCORE` | `"2nd Appraiser SCORE"` | `BA${r}` | `BA${r}:BB${r}` | `partA.objectives[i-1].managerScore` | `PROVEN` | Exposed for Approver export context (`isEmployeeSelf === false`). |
| `OBJECTIVE_i_MANAGER_COMMENT` | `"Periodical Review by Appraiser 1"` | `B29` / `AD29` | Merged | `partA.objectives[i-1].managerComment` | `PROVEN` | Exposed for Approver export context (`isEmployeeSelf === false`). |

---

## E. Part A Summary/Result Semantic Matrix

For N=4 baseline, summary row is row 29; score summary is row 33.

| Semantic Role | Workbook Label Text | Target Cell/Range | Merge Relationship | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SUMMARY_WEIGHT_SUM` | `"Total Score : 5"` | `F29` / `BC29` | Merged | N/A (Formula = 0 rule) | `PROVEN` | Calculated sum of objective weights. |
| `SUMMARY_PART_A_RAW_SCORE` | `"Total Score : 5"` | `BC29` | Merged | `partA.summary.rawPartAScore` | `PROVEN` | Raw Part A score (exposed when `isEmployeeSelf === false`). |
| `SUMMARY_PART_A_WEIGHTED_SCORE` | `"Part A : 70%"` | `BC33` | Merged | `partA.summary.weightedPartAScore` | `PROVEN` | Weighted Part A score (exposed when `isEmployeeSelf === false`). |
| `SUMMARY_FINAL_SCORE` | N/A | `BC35` | Merged | `finalResult.finalWeightedScore` | `PROVEN` | Final weighted total score (exposed when `isEmployeeSelf === false`). |
| `SUMMARY_FINAL_GRADE` | N/A | `BI35` | Merged | `finalResult.grade` | `PROVEN` | Final grade string (exposed when `isEmployeeSelf === false`). |

---

## F. Part B Header Semantic Matrix

| Semantic Role | Workbook Label Text | Label Cell | Value Target Cell | Merge Relationship | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `HEADER_FISCAL_YEAR` | `"FY'2026"` | `G2` | `G2` | `G2:H3` | `partA.header.fiscalYear` | `PROVEN` | Part B header fiscal year cell G2:H3. |
| `HEADER_DEPARTMENT` | `"Department"` | `J2` | `J3` | `J3:L3` | `partA.header.department` | `PROVEN` | Part B department value range J3:L3. |
| `HEADER_SECTION` | `"Section"` | `M2` | `M3` | `M3:O3` | `partA.header.section` | `PROVEN` | Part B section value range M3:O3. |
| `HEADER_POSITION` | `"Position"` | `P2` | `P3` | `P3:Q3` | `partA.header.position` | `PROVEN` | Part B position value range P3:Q3. |
| `HEADER_EMPLOYEE_ID` | `" Emp. ID."` | `R2` | `R3` | `R3` | `partA.header.employeeCode` | `PROVEN` | Part B employee code cell R3. |
| `HEADER_EMPLOYEE_NAME` | `"Name - Surname"` | `S2` | `S3` | `S3:W3` | `partA.header.employeeName` | `PROVEN` | Part B employee name range S3:W3. |

---

## G. Part B Competency Rating Semantic Matrix

Pristine Part B source (N=6): Competency blocks 1..6 span rows 7..29.

| Competency Block | Description Row | Rating Value Row | Self Rating Target (K:Q) | Chief Rating Target (R:X) | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Comp 1: Adaptability** | Row 8 | Row 9 | `K9:Q9` | `R9:W9` | `partB.competencyItems[0].selfRating` | `PROVEN` | Rating scale row 9 contains rating value cells K9 & R9. |
| **Comp 2: Problem Solving** | Row 12 | Row 13 | `K13:Q13` | `R13:W13` | `partB.competencyItems[1].selfRating` | `PROVEN` | Rating scale row 13 contains rating value cells K13 & R13. |
| **Comp 3: Customer Focus** | Row 16 | Row 17 | `K17:Q17` | `R17:W17` | `partB.competencyItems[2].selfRating` | `PROVEN` | Rating scale row 17 contains rating value cells K17 & R17. |
| **Comp 4: Additional Value Creation** | Row 20 | Row 21 | `K21:Q21` | `R21:W21` | `partB.competencyItems[3].selfRating` | `PROVEN` | Rating scale row 21 contains rating value cells K21 & R21. |
| **Comp 5: Safety Awareness** | Row 24 | Row 25 | `K25:Q25` | `R25:W25` | `partB.competencyItems[4].selfRating` | `PROVEN` | Rating scale row 25 contains rating value cells K25 & R25. |
| **Comp 6: Compliance / COCE** | Row 28 | Row 29 | `K29:Q29` | `R29:W29` | `partB.competencyItems[5].selfRating` | `PROVEN` | Rating scale row 29 contains rating value cells K29 & R29. |
| **Padding Row** | N/A | Row 30 | `B30:X30` | `B30:X30` | None | `PROVEN` | Row 30 is protected non-dynamic padding (`isDynamicWriteTarget === false`). |

> **Part B Per-Block Topology Rationale**:
> - Original rows `7..29` K:X are ALL dynamic rating cells. Rows 10, 14, 18, 22, 26 are Block 2..6 headers and rating regions, NOT padding.
> - Row `30` (for N=6/7/8), Row `34` (for N=7/8), and Row `38` (for N=8) are the ONLY protected non-dynamic padding rows.

---

## H. Part B Summary / Comment / Signature Matrix

Part B Summary relocated destinations: N=6 (rows 31..34), N=7 (rows 35..38), N=8 (rows 39..42).

| Semantic Role | Workbook Target (N=6) | Workbook Target (N=7) | Workbook Target (N=8) | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SUMMARY_PART_B_RAW_SCORE` | `B31:D32` | `B35:D36` | `B39:D40` | `partB.rawPartBScore` | `PROVEN` | Raw Part B score cell (exposed when `isEmployeeSelf === false`). |
| `SUMMARY_PART_B_WEIGHTED_SCORE` | `I31:M32` | `I35:M36` | `I39:M40` | `partB.weightedPartBScore` | `PROVEN` | Weighted Part B score cell (`Part B : Competency 30%`). |
| `OVERALL_RATING_SUMMARY` | `B31:D34` | `B35:D38` | `B39:D42` | None | `NO_SECURED_PROJECTION_SOURCE` | `MboExportService` does not expose Part B overall rating summary text. |
| `EMPLOYEE_COMMENTS` | `E31:H34` | `E35:H38` | `E39:H42` | None | `NO_SECURED_PROJECTION_SOURCE` | `MboExportService` does not expose standalone Part B employee comments. |
| `CHIEF_FEEDBACK` | `I31:P34` | `I35:P38` | `I39:P42` | None | `NO_SECURED_PROJECTION_SOURCE` | `MboExportService` does not expose standalone Part B chief feedback. |
| `EMPLOYEE_SIGNATURE` | `Q31:S34` | `Q35:S38` | `Q39:S42` | None | `NO_SECURED_PROJECTION_SOURCE` | `MboExportService` does not expose employee signature / date. |
| `CHIEF_SIGNATURE` | `T31:X34` | `T35:X38` | `T39:X42` | None | `NO_SECURED_PROJECTION_SOURCE` | `MboExportService` does not expose chief signature / date. |

---

## I. Final Production-Mapping Decision Table

| Semantic Role | Workbook Target | Secured Projection Path | Evidence Status | Production Decision |
| :--- | :--- | :--- | :--- | :--- |
| `HEADER_FISCAL_YEAR` | Part A `N6` / Part B `G2` | `partA.header.fiscalYear` | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_EMPLOYEE_NAME` | Part A `AT7` / Part B `S3` | `partA.header.employeeName` | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_DEPARTMENT` | Part A `AG7` / Part B `J3` | `partA.header.department` | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_SECTION` | Part A `AG7` / Part B `M3` | `partA.header.section` | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_POSITION` | Part A `BD7` / Part B `P3` | `partA.header.position` | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_EMPLOYEE_CODE` | Part A `AQ7` / Part B `R3` | `partA.header.employeeCode` | `PROVEN` | `SAFE_TO_MAP` |
| `HOSHIN_DEPARTMENT_HOSHIN_TITLE` | Part A `G16:AF19` | `partA.hoshin.departmentHoshinTitle` | `PROVEN` | `SAFE_TO_MAP` |
| `HOSHIN_SECTION_HOSHIN_TITLE` | Part A `AM16:BI19` | `partA.hoshin.sectionHoshinTitle` | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_TITLE` | Part A `B${24+i}` | `partA.objectives[i-1].title` | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_KPI` | Part A `J${24+i}` | `partA.objectives[i-1].kpi` | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_MEASUREMENT` | Part A `T${24+i}` | `partA.objectives[i-1].measurement` | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_WEIGHT` | Part A `Y${24+i}` | `partA.objectives[i-1].weight` | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_SELF_RATING` | Part A `AS${24+i}` | `partA.objectives[i-1].selfAchievement` | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_SELF_COMMENT` | Part A `AD${24+i}` | `partA.objectives[i-1].selfComment` | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_DIFFICULTY` | Part A `AA${24+i}` | None (R3 Frozen Decision) | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `COMPETENCY_b_SELF_RATING` | Part B rating cells | `partB.competencyItems[b-1].selfRating` | `PROVEN` | `SAFE_TO_MAP` |
| `SUMMARY_PART_A_RAW_SCORE` | Part A `BC29` | `partA.summary.rawPartAScore` | `PROVEN` | `SAFE_TO_MAP` |
| `SUMMARY_PART_A_WEIGHTED_SCORE` | Part A `BC33` | `partA.summary.weightedPartAScore` | `PROVEN` | `SAFE_TO_MAP` |
| `SUMMARY_PART_B_RAW_SCORE` | Part B `B31` (N=6) | `partB.rawPartBScore` | `PROVEN` | `SAFE_TO_MAP` |
| `SUMMARY_PART_B_WEIGHTED_SCORE` | Part B `I31` (N=6) | `partB.weightedPartBScore` | `PROVEN` | `SAFE_TO_MAP` |
| `SUMMARY_FINAL_SCORE` | Part A `BC35` | `finalResult.finalWeightedScore` | `PROVEN` | `SAFE_TO_MAP` |
| `SUMMARY_FINAL_GRADE` | Part A `BI35` | `finalResult.grade` | `PROVEN` | `SAFE_TO_MAP` |
| `OVERALL_RATING_SUMMARY` | Part B `B31:D34` (N=6) | None | `NO_SECURED_PROJECTION_SOURCE` | `DO_NOT_MAP_NO_PROJECTION_SOURCE` |
| `EMPLOYEE_COMMENTS` | Part B `E31:H34` (N=6) | None | `NO_SECURED_PROJECTION_SOURCE` | `DO_NOT_MAP_NO_PROJECTION_SOURCE` |
| `CHIEF_FEEDBACK` | Part B `I31:P34` (N=6) | None | `NO_SECURED_PROJECTION_SOURCE` | `DO_NOT_MAP_NO_PROJECTION_SOURCE` |
| `EMPLOYEE_SIGNATURE` | Part B `Q31:S34` (N=6) | None | `NO_SECURED_PROJECTION_SOURCE` | `DO_NOT_MAP_NO_PROJECTION_SOURCE` |
| `CHIEF_SIGNATURE` | Part B `T31:X34` (N=6) | None | `NO_SECURED_PROJECTION_SOURCE` | `DO_NOT_MAP_NO_PROJECTION_SOURCE` |

---

## Summary Counts

- **PROVEN**: 21
- **UNRESOLVED**: 1 (`OBJECTIVE_i_DIFFICULTY`)
- **NO_SECURED_PROJECTION_SOURCE**: 8 (`HEADER_PROFILE_CODE`, `HEADER_PROFILE_FAMILY`, `HEADER_PART_A_WEIGHT_PERCENT`, `OVERALL_RATING_SUMMARY`, `EMPLOYEE_COMMENTS`, `CHIEF_FEEDBACK`, `EMPLOYEE_SIGNATURE`, `CHIEF_SIGNATURE`)

---

## R1-R1 Profile Recommendations for Next Source Corrective

1. **Update Hoshin Mapping in Profile**:
   - Map `HOSHIN_DEPARTMENT_HOSHIN_TITLE` -> `G16:AF19` (projection path: `partA.hoshin.departmentHoshinTitle`).
   - Map `HOSHIN_SECTION_HOSHIN_TITLE` -> `AM16:BI19` (projection path: `partA.hoshin.sectionHoshinTitle`).
   - Remove legacy mapping of `G8` as Hoshin text (G8 is appraisal period text `"from: April 1, 2024"`).

2. **Remove Non-Existent Standalone Part B Comment & Signature Mappings**:
   - `OVERALL_RATING_SUMMARY`, `EMPLOYEE_COMMENTS`, `CHIEF_FEEDBACK`, `EMPLOYEE_SIGNATURE`, `CHIEF_SIGNATURE` in Part B summary have no data source in `MboExportService`. Profile should return `EXPORT_TEMPLATE_PROFILE_UNRESOLVED` if these roles are requested, or classify them as non-writable / unmapped.

3. **Confirm Part B Row Topology**:
   - Confirm original rows `7..29` K:X are ALL dynamic rating cells (rows 10, 14, 18, 22, 26 are rating regions, NOT padding).
   - Confirm rows `30` (N=6/7/8), `34` (N=7/8), and `38` (N=8) are strictly protected non-dynamic padding rows (`isDynamicWriteTarget === false`).
