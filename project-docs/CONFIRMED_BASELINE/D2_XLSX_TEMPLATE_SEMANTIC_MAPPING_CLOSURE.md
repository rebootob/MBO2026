# D2 XLSX TEMPLATE SEMANTIC MAPPING — CLOSURE BASELINE

Status: **PASS / CLOSED**  
Promoted by: **ChatGPT Control Plane independent review**  
Date: 2026-09-02 ICT

## 1. Closure identity

```text
D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_GATE = PASS / CLOSED
R1_R2_R2_AUTHORIZATION = D2-WP004-R1-R2-R2-EVIDENCE-20260902-01
R1_R2_R2_AUTHORIZATION_COMMIT = ef9f9ca1fbfef224372150226a5db8ba7a5ba12c
R1_R2_R2_EVIDENCE_COMMIT = bc141f355d7714302801d5adca3d5652b83c4de1
AUTH_TO_EVIDENCE = EXACTLY ONE COMMIT
CHANGED_FILE = project-docs/phase-3/evidence/XLSX_TEMPLATE_SEMANTIC_MAPPING_EVIDENCE.md ONLY
INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

The evidence commit was independently reviewed against the authorization contract, exact owner-template identities, secured `MboExportService` projection authority, and already-frozen D2 structural/privacy/formula authorities.

## 2. Exact owner-template identity

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Unknown/mismatched template identity remains fail-closed.

## 3. Production semantic classification

The accepted final decision contains exactly:

```text
PROVEN_SAFE_TO_MAP = 18
UNRESOLVED_KEEP_UNRESOLVED = 22
NO_SECURED_PROJECTION_SOURCE_DO_NOT_MAP = 5
DUPLICATE_EXCLUSIVE_SAFE_TO_MAP_TARGETS = 0
SAFE_TO_MAP_WITH_NULL_OR_UNKNOWN_SECURED_PATH = 0
PROVEN_FROM_PROXIMITY_OR_ALIAS_INTUITION = 0
CHIEF_FROZEN_AUTHORITY = R:X
EVIDENCE_SELF_PROMOTION = 0
```

### 3.1 SAFE_TO_MAP — exact accepted production semantics

Only the following semantic roles are currently proven safe production mappings:

1. `HEADER_FISCAL_YEAR`
2. `HEADER_EMPLOYEE_NAME`
3. `HEADER_DEPARTMENT`
4. `HEADER_SECTION`
5. `HEADER_POSITION`
6. `HEADER_EMPLOYEE_CODE`
7. `HOSHIN_DEPARTMENT_HOSHIN_TITLE`
8. `HOSHIN_SECTION_HOSHIN_TITLE`
9. `OBJECTIVE_i_MEASUREMENT`
10. `OBJECTIVE_i_WEIGHT`
11. `OBJECTIVE_i_ACTUAL_RESULT`
12. `OBJECTIVE_i_SELF_COMMENT`
13. `OBJECTIVE_i_AVERAGE_SCORE`
14. `SUMMARY_PART_A_RAW_SCORE`
15. `SUMMARY_PART_A_WEIGHTED_SCORE`
16. `COMPETENCY_b_SELF_RATING`
17. `SUMMARY_PART_B_RAW_SCORE`
18. `SUMMARY_PART_B_WEIGHTED_SCORE`

Every production Template Profile/Renderer write outside this accepted set must fail closed unless a later independently accepted Baseline expands authority.

## 4. Frozen workbook ownership for proven roles

### Part A headers

```text
Fiscal Year = N6 / N6:Q7 -> partA.header.fiscalYear
Department = Z7:AF7 -> partA.header.department
Section = AG7:AL7 -> partA.header.section
Employee Code = AQ7:AS7 -> partA.header.employeeCode
Employee Name primary = AT7:BC7 -> partA.header.employeeName
Position = BD7:BI7 -> partA.header.position
```

`employeeNameTH` is an alternate secured source but has no independently accepted source-selection/fallback rule for the one Name-Surname target; it remains unresolved.

### Part A Hoshin

```text
G16:AF19 = partA.hoshin.departmentHoshinTitle
AM16:BI19 = partA.hoshin.sectionHoshinTitle
G8:S8 = appraisal-period/static content / NOT Hoshin
```

### Part A objective/evaluation proven roles

For objective row `r = 24 + i`:

```text
T{r}:W{r} = partA.objectives[i-1].measurement
Y{r}:Z{r} = partA.objectives[i-1].weight
AK{r}:AR{r} = partA.objectives[i-1].actualResult
AD{r}:AG{r} = partA.objectives[i-1].selfComment
BC{r}:BE{r} = partA.objectives[i-1].averageScore
```

The combined B:I objective/target region does NOT prove standalone title/description/target ownership. `Action Plan` does not independently prove `kpi`. Appraiser ordinal labels do not prove Manager/GM identity without separately accepted workflow authority.

### Part A summary/result proven roles

```text
BC29 = partA.summary.rawPartAScore
BC33 = partA.summary.weightedPartAScore
```

`SUMMARY_WEIGHT_SUM` has no renderable secured projection path and must not become an Excel calculation/formula mapping. Final score/grade cells without static semantic ownership remain unresolved.

### Part B headers

```text
G2:H3 = partA.header.fiscalYear
J3:L3 = partA.header.department
M3:O3 = partA.header.section
P3:Q3 = partA.header.position
R3 = partA.header.employeeCode
S3:W3 = partA.header.employeeName
```

### Part B competency rating

Frozen privacy authority remains:

```text
SELF_DYNAMIC_AUTHORITY = K:Q
CHIEF_DYNAMIC_AUTHORITY = R:X
```

Accepted secured production mapping currently exists only for:

```text
partB.competencyItems[b-1].selfRating
```

The visually identifiable Chief area may contain narrower visual merges, but complete frozen privacy authority remains R:X and no stable secured chief/evaluator item key is currently proven. Chief production writes remain unresolved.

### Part B summaries

Count-aware structural relocation remains:

```text
N6 summary = rows31:34
N7 summary = rows35:38
N8 summary = rows39:42
```

Accepted secured production score mappings:

```text
partB.rawPartBScore
partB.weightedPartBScore
```

## 5. UNRESOLVED — must fail closed / remain non-writable

The following current semantic roles are explicitly unresolved and MUST NOT be guessed, silently composed, or exposed as production writable mappings:

- `HEADER_EMPLOYEE_NAME_TH`
- `HEADER_PROFILE_CODE`
- `HEADER_PROFILE_FAMILY`
- `HEADER_PART_A_WEIGHT_PERCENT`
- `HEADER_CHIEF_NAME`
- `OBJECTIVE_i_TITLE`
- `OBJECTIVE_i_DESCRIPTION`
- `OBJECTIVE_i_KPI`
- `OBJECTIVE_i_TARGET`
- `OBJECTIVE_i_PROGRESS_PERCENT`
- `OBJECTIVE_i_SELF_ACHIEVEMENT`
- `OBJECTIVE_i_MANAGER_ACHIEVEMENT`
- `OBJECTIVE_i_MANAGER_SCORE`
- `OBJECTIVE_i_MANAGER_COMMENT`
- `OBJECTIVE_i_GM_ACHIEVEMENT`
- `OBJECTIVE_i_GM_SCORE`
- `OBJECTIVE_i_GM_COMMENT`
- `OBJECTIVE_i_DIFFICULTY`
- `SUMMARY_WEIGHT_SUM`
- `SUMMARY_FINAL_SCORE`
- `SUMMARY_FINAL_GRADE`
- `COMPETENCY_b_CHIEF_RATING`

Unknown/unresolved production mapping request must fail closed with the Template Profile blocker family; it must never be inferred from proximity, legacy aliases, or current profile code.

## 6. NO_SECURED_PROJECTION_SOURCE — do not map

Workbook regions may be visually identifiable, but current secured `MboExportService` exposes no production data source for:

- `OVERALL_RATING_SUMMARY`
- `EMPLOYEE_COMMENTS`
- `CHIEF_FEEDBACK`
- `EMPLOYEE_SIGNATURE`
- `CHIEF_SIGNATURE`

Production code must not reconstruct, synthesize, or bypass the secured projection to populate these roles.

## 7. Mandatory downstream rules

Any Template Profile corrective and Production XLSX Renderer must preserve all of the following:

```text
CENTRALIZED_TEMPLATE_PROFILE_MAPPING = MANDATORY
NO_SCATTERED_IMPORTANT_CELL_ADDRESS = MANDATORY
SECURED_PROJECTION_AUTHORITY = MboExportService
SCORING_AUTHORITY = KINTONE / APP794 + CONFIRMED CONFIG
EXCEL_SCORE_RECALCULATION = FORBIDDEN
PRODUCTION_XLSX_FORMULA_INVENTORY = EXACTLY ZERO
EMPLOYEE_SELF_OMITTED_CONFIDENTIAL_DATA = MUST REMAIN OMITTED
UNKNOWN_TEMPLATE_OR_MAPPING = FAIL_CLOSED
UNRESOLVED_SEMANTIC_WRITE = FAIL_CLOSED
NO_SECURED_PROJECTION_SOURCE_WRITE = FORBIDDEN
PART_B_CHIEF_FROZEN_AUTHORITY = R:X
```

This Baseline closes semantic evidence only. It does NOT authorize Template Profile source changes or Production XLSX Renderer implementation.
