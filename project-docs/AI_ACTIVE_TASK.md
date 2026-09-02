# AI ACTIVE TASK — XLSX SEMANTIC EVIDENCE CLOSED / TEMPLATE PROFILE ALIGNMENT PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / NO SOURCE AUTH / NO TEST AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md` -> exact relevant source/test diff only.

## 1. Current truth
```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PRESERVATION = PASS / CLOSED
D2_REFERENCE_IMAGE = PASS / CLOSED
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_PART_B_STRUCTURAL = PASS / CLOSED
D2_FORMULA_AUTHORITY = PASS / CLOSED
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED
D2_XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = EXHAUSTED / DO NOT REUSE
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

## 2. D2-WP004-R1-R2-R2 independent review closure
```text
AUTHORIZATION = D2-WP004-R1-R2-R2-EVIDENCE-20260902-01
AUTHORIZATION_COMMIT = ef9f9ca1fbfef224372150226a5db8ba7a5ba12c
EVIDENCE_COMMIT = bc141f355d7714302801d5adca3d5652b83c4de1
AUTH_TO_EVIDENCE = EXACTLY ONE COMMIT
CHANGED_FILE = project-docs/phase-3/evidence/XLSX_TEMPLATE_SEMANTIC_MAPPING_EVIDENCE.md ONLY
SCOPE_REVIEW = PASS
PART_A_SHA = PASS / EXACT MATCH
PART_B_SHA = PASS / EXACT MATCH
PRIVACY_SAFE_SCOPE = PASS
SEMANTIC_EVIDENCE = PASS / CLOSED
PROVEN_SAFE_TO_MAP = 18
UNRESOLVED_KEEP_UNRESOLVED = 22
NO_SECURED_PROJECTION_SOURCE_DO_NOT_MAP = 5
DUPLICATE_EXCLUSIVE_SAFE_TO_MAP_TARGETS = 0
SAFE_TO_MAP_WITH_NULL_OR_UNKNOWN_SECURED_PATH = 0
PROVEN_FROM_PROXIMITY_OR_ALIAS_INTUITION = 0
CHIEF_FROZEN_AUTHORITY = R:X
EVIDENCE_SELF_PROMOTION = 0
INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
TOKEN = CONSUMED / PASS / CLOSED / DO NOT REUSE
```

Durable closure authority:
`project-docs/CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`

The historical evidence file is supporting evidence. The Baseline above is the current durable authority.

## 3. Exact current semantic production authority

### 3.1 SAFE_TO_MAP = exactly 18 roles
Only these roles may become production writable in the current Template Profile:

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

### 3.2 UNRESOLVED = exactly 22 roles
These remain fail-closed/non-writable unless a later independently accepted Baseline expands authority:

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

### 3.3 NO_SECURED_PROJECTION_SOURCE = exactly 5 roles
Never synthesize/reconstruct/map:
- `OVERALL_RATING_SUMMARY`
- `EMPLOYEE_COMMENTS`
- `CHIEF_FEEDBACK`
- `EMPLOYEE_SIGNATURE`
- `CHIEF_SIGNATURE`

## 4. Frozen mapping facts needed by next source corrective

```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Part A header/Hoshin:
```text
Fiscal Year = N6 / N6:Q7 -> partA.header.fiscalYear
Department = Z7:AF7 -> partA.header.department
Section = AG7:AL7 -> partA.header.section
Employee Code = AQ7:AS7 -> partA.header.employeeCode
Employee Name primary = AT7:BC7 -> partA.header.employeeName
Position = BD7:BI7 -> partA.header.position
Department Hoshin = G16:AF19 -> partA.hoshin.departmentHoshinTitle
Section Hoshin = AM16:BI19 -> partA.hoshin.sectionHoshinTitle
G8:S8 = NOT Hoshin
```

Part A objective row `r = 24 + i` safe fields:
```text
T{r}:W{r} -> measurement
Y{r}:Z{r} -> weight
AK{r}:AR{r} -> actualResult
AD{r}:AG{r} -> selfComment
BC{r}:BE{r} -> averageScore
```

Part A safe summary fields:
```text
BC29 -> partA.summary.rawPartAScore
BC33 -> partA.summary.weightedPartAScore
```

Part B headers:
```text
G2:H3 -> partA.header.fiscalYear
J3:L3 -> partA.header.department
M3:O3 -> partA.header.section
P3:Q3 -> partA.header.position
R3 -> partA.header.employeeCode
S3:W3 -> partA.header.employeeName
```

Part B:
```text
SELF_DYNAMIC_AUTHORITY = K:Q
CHIEF_DYNAMIC_AUTHORITY = R:X
PROVEN_SECURED_COMPETENCY_WRITE = partB.competencyItems[b-1].selfRating ONLY
N6 summary rows = 31:34
N7 summary rows = 35:38
N8 summary rows = 39:42
SAFE summary projection = partB.rawPartBScore + partB.weightedPartBScore
```

## 5. Proposed next — D2-WP004-R1-R3 / NOT AUTHORIZED
```text
PROPOSED_WORK_PACKAGE = D2-WP004-R1-R3
NAME = TEMPLATE PROFILE SEMANTIC ALIGNMENT
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT IF AUTHORIZED
EXPECTED_WRITABLE_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
SOURCE_CHANGE = NOT AUTHORIZED YET
TEST_CHANGE = NOT AUTHORIZED YET
PRODUCTION_RENDERER = NOT AUTHORIZED
```

Recommended Owner phrase:
`อนุมัติ D2-WP004-R1-R3 SOURCE+TEST ตามขอบเขตที่เสนอ`

## 6. Exact proposed R1-R3 contract
If later authorized, modify ONLY the two existing Template Profile files above.

### A. Preserve accepted R1-R1 behavior
Do not regress:
- pure mapping module architecture;
- exact Part A/B SHA constants;
- Part A count integer 4..10 only;
- Part B count integer 6/7/8 only;
- corrected Part B dynamic/protected topology;
- protected row30/34/38 behavior;
- caller input/returned-data immutability;
- stable fail-closed blocker family `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`;
- no `fs`, no Kintone API, no `xlsx-populate`, no workbook read/write, no generated XLSX/PDF, no scoring logic.

### B. Align production mappings to semantic closure Baseline
The production profile must expose deterministic writable mappings for exactly the 18 accepted `SAFE_TO_MAP` semantic roles and no others.

Required corrections include:
- Department -> Z7:AF7, not AG7;
- Section -> AG7:AL7;
- Department Hoshin -> G16:AF19;
- Section Hoshin -> AM16:BI19;
- remove/disable G8 as Hoshin;
- employeeName primary only; employeeNameTH remains unresolved;
- use only the five proven Part A objective fields per row;
- no standalone write mapping for combined B:I title/description/target or Action Plan/KPI without later authority;
- no Manager/GM/Appraiser ordinal translation mapping;
- no `SUMMARY_WEIGHT_SUM`, final score or final grade production mapping;
- Part B self rating only as secured competency write; Chief remains unresolved despite frozen R:X structural authority;
- Part B raw/weighted score summary only from secured projection.

### C. Fail-closed behavior
All 22 unresolved semantic-role requests must throw exactly:
`EXPORT_TEMPLATE_PROFILE_UNRESOLVED`

All 5 no-secured-source semantic-role requests must also remain non-writable/fail closed with the same stable profile blocker family; profile code must not invent/reconstruct a source.

Unknown template identity, unsupported count, malformed mapping, missing required safe mapping, conflicting exclusive target, protected dynamic target violation, unknown semantic role or null projection path for a claimed writable role must fail closed.

### D. Integrity invariants
Default accepted profile must prove:
```text
SAFE_TO_MAP_ROLE_COUNT = 18
UNRESOLVED_ROLE_COUNT = 22
NO_SECURED_SOURCE_ROLE_COUNT = 5
DUPLICATE_EXCLUSIVE_WRITABLE_TARGETS = 0
WRITABLE_ROLE_WITH_NULL_PROJECTION_PATH = 0
CHIEF_FROZEN_AUTHORITY = R:X
CHIEF_SECURED_WRITABLE_ROLE = 0
FORMULA_OR_SCORING_MAPPING = 0
```

### E. Focused tests
Tests must directly prove:
- exact 18 safe role set and deterministic mappings;
- exact 22 unresolved set rejects;
- exact 5 no-source set rejects;
- Department/Section and Hoshin corrected ownership;
- B:I standalone title/description/target reject;
- Manager/GM/Chief semantic writes reject;
- summary weight/final score/final grade reject;
- self competency mapping accepted; chief competency mapping rejected;
- R:X authority metadata preserved without making Chief writable;
- N6/N7/N8 summary relocation preserved;
- protected row30/34/38 never writable;
- integrity validator rejects missing safe mapping, duplicate target, malformed address and null projection path;
- caller immutability;
- no forbidden imports/workbook I/O/template binary requirement.

### F. Explicit out of scope
Do NOT modify:
- `src/services/mbo-export-service.js`;
- feasibility source/tests;
- Baselines/control docs during executor work;
- package/dependency files;
- owner XLSX binaries;
- `dist/`;
- any third file.

Do NOT create Production XLSX Renderer, generate XLSX/PDF, touch Kintone, deploy, run Live UAT, invoke Claude, start Combined Excel/PDF/security regression or D3.

## 7. Current authorization ledger / exact next action
```text
D2-WP004-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-EVIDENCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-R1-EVIDENCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-R2-EVIDENCE-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R1-R3 = PROPOSED / NOT AUTHORIZED
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = OWNER / CHATGPT CONTROL PLANE
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP004-R1-R3 SOURCE+TEST
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
