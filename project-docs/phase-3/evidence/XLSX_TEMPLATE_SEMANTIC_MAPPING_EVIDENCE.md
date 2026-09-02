# XLSX TEMPLATE SEMANTIC MAPPING EVIDENCE

> Status: **PROVEN EVIDENCE BASELINE — CORRECTED**  
> Authorization Token: `D2-WP004-R1-R2-R1-EVIDENCE-20260902-01`  
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
- Inspected strictly READ-ONLY using `xlsx-populate` in an ephemeral scratch script (`scratch/inspect_templates.cjs`).
- Zero cells, styles, merges, defined names, or package XML nodes were saved or modified.
- Zero personal employee values (names, IDs, comments, scores) have been copied into this evidence document. Only static labels, structural cell addresses, merge coordinates, and projection paths are recorded.

---

## B. Part A Header Semantic Matrix

| Semantic Candidate | Workbook Label Text | Label Cell/Range | Candidate Writable Cell/Range | Merge Relationship | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `HEADER_FISCAL_YEAR` | `"FY'2026"` | `N6` | `N6` | `N6:Q7` | `partA.header.fiscalYear` | `PROVEN` | Explicit header cell containing fiscal year indicator. |
| `HEADER_EMPLOYEE_NAME` | `"Name - Surname"` | `AT6` | `AT7` | `AT7:BC7` | `partA.header.employeeName` | `PROVEN` | Label AT6 directly aligns with merged value range AT7:BC7. |
| `HEADER_EMPLOYEE_NAME_TH` | `"Name - Surname"` | `AT6` | `AT7` | `AT7:BC7` | `partA.header.employeeNameTH` | `UNRESOLVED` | Alternate source field; AT7 is exclusively owned by `HEADER_EMPLOYEE_NAME` to prevent duplicate targets. |
| `HEADER_DEPARTMENT` | `"Department"` | `Z6` | `Z7` | `Z7:AF7` | `partA.header.department` | `PROVEN` | Label Z6 ("Department") explicitly owns merged value range Z7:AF7. |
| `HEADER_SECTION` | `"Section"` | `AG6` | `AG7` | `AG7:AL7` | `partA.header.section` | `PROVEN` | Label AG6 ("Section") explicitly owns merged value range AG7:AL7. |
| `HEADER_POSITION` | `"Position"` | `BD6` | `BD7` | `BD7:BI7` | `partA.header.position` | `PROVEN` | Label BD6 aligns with merged position value range BD7:BI7. |
| `HEADER_EMPLOYEE_CODE` | `"Emp. ID."` | `AQ6` | `AQ7` | `AQ7:AS7` | `partA.header.employeeCode` | `PROVEN` | Label AQ6 directly aligns with merged employee code range AQ7:AS7. |
| `HEADER_PROFILE_CODE` | N/A | N/A | N/A | N/A | `partA.header.profileCode` | `UNRESOLVED` | Path exists in secured projection, but no proven target cell exists in workbook header (`NO_PROVEN_WORKBOOK_TARGET`). |
| `HEADER_PROFILE_FAMILY` | N/A | N/A | N/A | N/A | `partA.header.profileFamily` | `UNRESOLVED` | Path exists in secured projection, but no proven target cell exists in workbook header (`NO_PROVEN_WORKBOOK_TARGET`). |
| `HEADER_PART_A_WEIGHT_PERCENT` | N/A | N/A | N/A | N/A | `partA.header.partAWeightPercent` | `UNRESOLVED` | Path exists in secured projection, rendered in score summary (BC33), not in header (`NO_PROVEN_WORKBOOK_TARGET`). |
| `HEADER_CHIEF_NAME` | N/A | N/A | N/A | N/A | None | `UNRESOLVED` | Template header has no distinct label or cell for Chief Name (`NO_PROVEN_WORKBOOK_TARGET`). |

---

## C. Part A Hoshin Semantic Matrix

| Candidate Region | Workbook Label Text | Label Cell/Range | Target Writable Range | Merge Relationship | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `G8:S8` | `"from : April 1, 2024"` | `B8:E8` | `G8:S8` | None | None | `UNRESOLVED` | Range G8:S8 contains static appraisal period dates (`"from: April 1..."`), NOT Hoshin text. |
| `G16:AF19` | `"Department's Hoshin "` | `B16:F18` | `G16:AF19` | `G16:AF19` | `partA.hoshin.departmentHoshinTitle` | `PROVEN` | Label B16 ("Department's Hoshin") explicitly owns merged target range G16:AF19. |
| `AM16:BI19` | `"Section's Hoshin "` | `AG16:AL18` | `AM16:BI19` | `AM16:BI19` | `partA.hoshin.sectionHoshinTitle` | `PROVEN` | Label AG16 ("Section's Hoshin") explicitly owns merged target range AM16:BI19. |

---

## D. Part A Objective/Evaluation Semantic Matrix

Baseline 4-objective template: Row `25` (Objective 1), Row `26` (Objective 2), Row `27` (Objective 3), Row `28` (Objective 4).

| Semantic Role (Obj i, r = 24+i) | Workbook Header Label | Target Writable Range | Merge Relationship | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `OBJECTIVE_i_TITLE` | `"Objectives (Indicate expected result...)"` | `B${r}` | `B${r}:I${r}` | `partA.objectives[i-1].title` | `PROVEN` | Merged range B:I holds objective title & target text. |
| `OBJECTIVE_i_DESCRIPTION` | `"Objectives (Indicate expected result...)"` | `B${r}` | `B${r}:I${r}` | `partA.objectives[i-1].description` | `UNRESOLVED` | Combined in B:I region; independent description subcell unproven. |
| `OBJECTIVE_i_KPI` | `"Action Plan (Indicate activities...)"` | `J${r}` | `J${r}:S${r}` | `partA.objectives[i-1].kpi` | `UNRESOLVED` | Action Plan label J:S does not prove independent `kpi` field separation. |
| `OBJECTIVE_i_TARGET` | `"Objectives (Indicate expected result...)"` | `B${r}` | `B${r}:I${r}` | `partA.objectives[i-1].target` | `UNRESOLVED` | Combined in B:I region; independent target subcell unproven. |
| `OBJECTIVE_i_MEASUREMENT` | `"Additional agreement / Comment"` | `T${r}` | `T${r}:W${r}` | `partA.objectives[i-1].measurement` | `PROVEN` | Merged range T:W holds rating criteria / measurement guidance text. |
| `OBJECTIVE_i_WEIGHT` | `"Weight[A]"` | `Y${r}` | `Y${r}:Z${r}` | `partA.objectives[i-1].weight` | `PROVEN` | Range Y:Z holds objective numeric weight. |
| `OBJECTIVE_i_PROGRESS_PERCENT` | `"Periodical Review by Appraisee"` | `AD${r}` | `AD${r}:AG${r}` | `partA.objectives[i-1].progressPercent` | `UNRESOLVED` | Range AD:AG holds review text, not numeric progressPercent. |
| `OBJECTIVE_i_ACTUAL_RESULT` | `"Actual result & Achievement"` | `AK${r}` | `AK${r}:AR${r}` | `partA.objectives[i-1].actualResult` | `PROVEN` | Range AK:AR holds actual result text. |
| `OBJECTIVE_i_SELF_ACHIEVEMENT` | `"1st Appraiser Achievement Level [1-5]"` | `AS${r}` | `AS${r}:AU${r}` | `partA.objectives[i-1].selfAchievement` | `UNRESOLVED` | Header label says 1st Appraiser; Self evaluator translation unproven. |
| `OBJECTIVE_i_SELF_COMMENT` | `"Periodical Review by Appraisee"` | `AD${r}` | `AD${r}:AG${r}` | `partA.objectives[i-1].selfComment` | `PROVEN` | Range AD:AG holds Appraisee self-review comment text. |
| `OBJECTIVE_i_MANAGER_ACHIEVEMENT` | `"1st Appraiser Achievement Level [1-5]"` | `AS${r}` | `AS${r}:AU${r}` | `partA.objectives[i-1].managerAchievement` | `PROVEN` | 1st Appraiser maps to manager achievement (for Approver export). |
| `OBJECTIVE_i_MANAGER_SCORE` | `"1st Appraiser SCORE"` | `AV${r}` | `AV${r}:AW${r}` | `partA.objectives[i-1].managerScore` | `PROVEN` | 1st Appraiser SCORE maps to manager score (for Approver export). |
| `OBJECTIVE_i_MANAGER_COMMENT` | `"Periodical Review by Appraiser 1"` | `B29` / `AD29` | Merged | `partA.objectives[i-1].managerComment` | `UNRESOLVED` | Shared bottom review row 29 is not an independent per-objective target. |
| `OBJECTIVE_i_GM_ACHIEVEMENT` | `"2nd Appraiser Achievement Level [1-5]"` | `AX${r}` | `AX${r}:AZ${r}` | `partA.objectives[i-1].gmAchievement` | `PROVEN` | 2nd Appraiser maps to GM achievement (for Approver export). |
| `OBJECTIVE_i_GM_SCORE` | `"2nd Appraiser SCORE"` | `BA${r}` | `BA${r}:BB${r}` | `partA.objectives[i-1].gmScore` | `PROVEN` | 2nd Appraiser SCORE maps to GM score (for Approver export). |
| `OBJECTIVE_i_GM_COMMENT` | `"Periodical Review by Appraiser 2"` | `N29` / `AO29` | Merged | `partA.objectives[i-1].gmComment` | `UNRESOLVED` | Shared bottom review row 29 is not an independent per-objective target. |
| `OBJECTIVE_i_AVERAGE_SCORE` | `"Average SCORE[B]"` | `BC${r}` | `BC${r}:BE${r}` | `partA.objectives[i-1].averageScore` | `PROVEN` | Merged range BC:BE holds average score. |

---

## E. Part A Summary/Result Semantic Matrix

For N=4 baseline, summary row is row 29; score summary is row 33.

| Semantic Role | Workbook Label Text | Target Cell/Range | Merge Relationship | Secured Projection Path | Status | Rationale |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SUMMARY_WEIGHT_SUM` | `"Total Score : 5"` | `F29` / `BC29` | Merged | N/A (Formula = 0 rule) | `PROVEN` | Calculated sum of objective weights. |
| `SUMMARY_PART_A_RAW_SCORE` | `"Total Score : 5"` | `BC29` | Merged | `partA.summary.rawPartAScore` | `PROVEN` | Raw Part A score (exposed when `isEmployeeSelf === false`). |
| `SUMMARY_PART_A_WEIGHTED_SCORE` | `"Part A : 70%"` | `BC33` | Merged | `partA.summary.weightedPartAScore` | `PROVEN` | Weighted Part A score (exposed when `isEmployeeSelf === false`). |
| `SUMMARY_FINAL_SCORE` | N/A | `BC35` | Merged | `finalResult.finalWeightedScore` | `UNRESOLVED` | Target BC35 has no static header label text in template. |
| `SUMMARY_FINAL_GRADE` | N/A | `BI35` | Merged | `finalResult.grade` | `UNRESOLVED` | Target BI35 has no static header label text in template. |

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
| **Comp 1: Adaptability** | Row 8 | Row 9 | `K9:Q9` | `R9:W9` | Self: `partB.competencyItems[0].selfRating` / Chief: Unproven key | Self: `PROVEN` / Chief: `UNRESOLVED` | Self rating target K9 is proven. Chief rating target R9 is visually identifiable, but stable chief write key path is unproven for Employee-Self context. |
| **Comp 2: Problem Solving** | Row 12 | Row 13 | `K13:Q13` | `R13:W13` | Self: `partB.competencyItems[1].selfRating` / Chief: Unproven key | Self: `PROVEN` / Chief: `UNRESOLVED` | Self rating target K13 is proven. |
| **Comp 3: Customer Focus** | Row 16 | Row 17 | `K17:Q17` | `R17:W17` | Self: `partB.competencyItems[2].selfRating` / Chief: Unproven key | Self: `PROVEN` / Chief: `UNRESOLVED` | Self rating target K17 is proven. |
| **Comp 4: Additional Value Creation** | Row 20 | Row 21 | `K21:Q21` | `R21:W21` | Self: `partB.competencyItems[3].selfRating` / Chief: Unproven key | Self: `PROVEN` / Chief: `UNRESOLVED` | Self rating target K21 is proven. |
| **Comp 5: Safety Awareness** | Row 24 | Row 25 | `K25:Q25` | `R25:W25` | Self: `partB.competencyItems[4].selfRating` / Chief: Unproven key | Self: `PROVEN` / Chief: `UNRESOLVED` | Self rating target K25 is proven. |
| **Comp 6: Compliance / COCE** | Row 28 | Row 29 | `K29:Q29` | `R29:W29` | Self: `partB.competencyItems[5].selfRating` / Chief: Unproven key | Self: `PROVEN` / Chief: `UNRESOLVED` | Self rating target K29 is proven. |
| **Padding Row** | N/A | Row 30 | `B30:X30` | `B30:X30` | None | `PROVEN` | Row 30 is protected non-dynamic padding (`isDynamicWriteTarget === false`). |

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

| Semantic Role | Workbook Target | Secured Projection Path | Evidence Source | Status | Production Decision |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `HEADER_FISCAL_YEAR` | Part A `N6` / Part B `G2` | `partA.header.fiscalYear` | Static label N6 / G2 | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_EMPLOYEE_NAME` | Part A `AT7` / Part B `S3` | `partA.header.employeeName` | Static label AT6 / S2 | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_EMPLOYEE_NAME_TH` | Part A `AT7` | `partA.header.employeeNameTH` | Shared target with AT7 | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `HEADER_DEPARTMENT` | Part A `Z7` / Part B `J3` | `partA.header.department` | Static label Z6 / J2 | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_SECTION` | Part A `AG7` / Part B `M3` | `partA.header.section` | Static label AG6 / M2 | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_POSITION` | Part A `BD7` / Part B `P3` | `partA.header.position` | Static label BD6 / P2 | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_EMPLOYEE_CODE` | Part A `AQ7` / Part B `R3` | `partA.header.employeeCode` | Static label AQ6 / R2 | `PROVEN` | `SAFE_TO_MAP` |
| `HEADER_PROFILE_CODE` | None | `partA.header.profileCode` | No workbook target | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `HEADER_PROFILE_FAMILY` | None | `partA.header.profileFamily` | No workbook target | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `HEADER_PART_A_WEIGHT_PERCENT` | None | `partA.header.partAWeightPercent` | Rendered in summary | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `HEADER_CHIEF_NAME` | None | None | No workbook target | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `HOSHIN_DEPARTMENT_HOSHIN_TITLE` | Part A `G16:AF19` | `partA.hoshin.departmentHoshinTitle` | Static label B16 | `PROVEN` | `SAFE_TO_MAP` |
| `HOSHIN_SECTION_HOSHIN_TITLE` | Part A `AM16:BI19` | `partA.hoshin.sectionHoshinTitle` | Static label AG16 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_TITLE` | Part A `B${24+i}` | `partA.objectives[i-1].title` | Static label B22 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_DESCRIPTION` | Part A `B${24+i}` | `partA.objectives[i-1].description` | Combined in B:I | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `OBJECTIVE_i_KPI` | Part A `J${24+i}` | `partA.objectives[i-1].kpi` | Label Action Plan | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `OBJECTIVE_i_TARGET` | Part A `B${24+i}` | `partA.objectives[i-1].target` | Combined in B:I | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `OBJECTIVE_i_MEASUREMENT` | Part A `T${24+i}` | `partA.objectives[i-1].measurement` | Static label T22 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_WEIGHT` | Part A `Y${24+i}` | `partA.objectives[i-1].weight` | Static label Y22 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_PROGRESS_PERCENT` | Part A `AD${24+i}` | `partA.objectives[i-1].progressPercent` | Text review cell | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `OBJECTIVE_i_ACTUAL_RESULT` | Part A `AK${24+i}` | `partA.objectives[i-1].actualResult` | Static label AK22 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_SELF_ACHIEVEMENT` | Part A `AS${24+i}` | `partA.objectives[i-1].selfAchievement` | Label 1st Appraiser | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `OBJECTIVE_i_SELF_COMMENT` | Part A `AD${24+i}` | `partA.objectives[i-1].selfComment` | Static label AD22 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_MANAGER_ACHIEVEMENT` | Part A `AS${24+i}` | `partA.objectives[i-1].managerAchievement` | Static label AS22 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_MANAGER_SCORE` | Part A `AV${24+i}` | `partA.objectives[i-1].managerScore` | Static label AV23 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_MANAGER_COMMENT` | Part A `B29` | `partA.objectives[i-1].managerComment` | Shared row 29 | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `OBJECTIVE_i_GM_ACHIEVEMENT` | Part A `AX${24+i}` | `partA.objectives[i-1].gmAchievement` | Static label AX22 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_GM_SCORE` | Part A `BA${24+i}` | `partA.objectives[i-1].gmScore` | Static label BA23 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_GM_COMMENT` | Part A `N29` | `partA.objectives[i-1].gmComment` | Shared row 29 | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `OBJECTIVE_i_AVERAGE_SCORE` | Part A `BC${24+i}` | `partA.objectives[i-1].averageScore` | Static label BC22 | `PROVEN` | `SAFE_TO_MAP` |
| `OBJECTIVE_i_DIFFICULTY` | Part A `AA${24+i}` | None | Frozen R3 Decision | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `SUMMARY_WEIGHT_SUM` | Part A `F29` | N/A (Formula = 0) | Formula = 0 rule | `PROVEN` | `SAFE_TO_MAP` |
| `SUMMARY_PART_A_RAW_SCORE` | Part A `BC29` | `partA.summary.rawPartAScore` | Static label BC29 | `PROVEN` | `SAFE_TO_MAP` |
| `SUMMARY_PART_A_WEIGHTED_SCORE` | Part A `BC33` | `partA.summary.weightedPartAScore` | Static label BC33 | `PROVEN` | `SAFE_TO_MAP` |
| `SUMMARY_FINAL_SCORE` | Part A `BC35` | `finalResult.finalWeightedScore` | No static label | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `SUMMARY_FINAL_GRADE` | Part A `BI35` | `finalResult.grade` | No static label | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `COMPETENCY_b_SELF_RATING` | Part B `K${row}` | `partB.competencyItems[b-1].selfRating` | Static label K5/K7 | `PROVEN` | `SAFE_TO_MAP` |
| `COMPETENCY_b_CHIEF_RATING` | Part B `R${row}` | Unproven key path | Unproven chief path | `UNRESOLVED` | `KEEP_UNRESOLVED` |
| `SUMMARY_PART_B_RAW_SCORE` | Part B `B31` (N=6) | `partB.rawPartBScore` | Static label B31 | `PROVEN` | `SAFE_TO_MAP` |
| `SUMMARY_PART_B_WEIGHTED_SCORE` | Part B `I31` (N=6) | `partB.weightedPartBScore` | Static label I31 | `PROVEN` | `SAFE_TO_MAP` |
| `OVERALL_RATING_SUMMARY` | Part B `B31:D34` (N=6) | None | No service source | `NO_SECURED_PROJECTION_SOURCE` | `DO_NOT_MAP_NO_PROJECTION_SOURCE` |
| `EMPLOYEE_COMMENTS` | Part B `E31:H34` (N=6) | None | No service source | `NO_SECURED_PROJECTION_SOURCE` | `DO_NOT_MAP_NO_PROJECTION_SOURCE` |
| `CHIEF_FEEDBACK` | Part B `I31:P34` (N=6) | None | No service source | `NO_SECURED_PROJECTION_SOURCE` | `DO_NOT_MAP_NO_PROJECTION_SOURCE` |
| `EMPLOYEE_SIGNATURE` | Part B `Q31:S34` (N=6) | None | No service source | `NO_SECURED_PROJECTION_SOURCE` | `DO_NOT_MAP_NO_PROJECTION_SOURCE` |
| `CHIEF_SIGNATURE` | Part B `T31:X34` (N=6) | None | No service source | `NO_SECURED_PROJECTION_SOURCE` | `DO_NOT_MAP_NO_PROJECTION_SOURCE` |

---

## Mechanical Status Counts

- **PROVEN (`SAFE_TO_MAP`)**: `24`
- **UNRESOLVED (`KEEP_UNRESOLVED`)**: `16`
- **NO_SECURED_PROJECTION_SOURCE (`DO_NOT_MAP_NO_PROJECTION_SOURCE`)**: `5`
- **Duplicate Exclusive `SAFE_TO_MAP` Target Count**: `0` (EXACT ZERO)

---

## R1-R1 Profile Recommendations for Next Source Corrective

1. **Update Part A Header Mapping**:
   - Map `HEADER_DEPARTMENT` -> `Z7` (`partA.header.department`).
   - Map `HEADER_SECTION` -> `AG7` (`partA.header.section`).
   - Keep `HEADER_EMPLOYEE_NAME_TH` as `UNRESOLVED` to prevent duplicate target ownership of `AT7`.

2. **Update Part A Hoshin Mapping**:
   - Map `HOSHIN_DEPARTMENT_HOSHIN_TITLE` -> `G16` (`partA.hoshin.departmentHoshinTitle`).
   - Map `HOSHIN_SECTION_HOSHIN_TITLE` -> `AM16` (`partA.hoshin.sectionHoshinTitle`).
   - Remove legacy mapping of `G8` as Hoshin text (G8 is appraisal period text `"from: April 1, 2024"`).

3. **Align Objective Roles**:
   - Keep `OBJECTIVE_i_DESCRIPTION`, `OBJECTIVE_i_KPI`, `OBJECTIVE_i_TARGET`, `OBJECTIVE_i_PROGRESS_PERCENT`, `OBJECTIVE_i_DIFFICULTY` as `UNRESOLVED` in mapping profile or handle as non-writable.
