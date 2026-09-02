# AI ACTIVE TASK — D2-WP004-R1-R3 TEMPLATE PROFILE SEMANTIC ALIGNMENT AUTHORIZED

Mode: **LOW-CREDIT / BOUNDED / ONE-SHOT / SOURCE+TEST / EXACT TWO EXISTING FILES / PURE MAPPING / NO RENDERER / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md` -> exact two authorized files only.

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
ACTIVE_WORK_PACKAGE = D2-WP004-R1-R3
ACTIVE_WORK_PACKAGE_NAME = TEMPLATE PROFILE SEMANTIC ALIGNMENT
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
OWNER_APPROVAL_BASELINE_HEAD = 5e15e5491a5b3ff53d7f5dc18531cc6d418a0c0d
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R1-R3-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R1-R3-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R1-R3 SOURCE+TEST / ONE-SHOT / LOW-CREDIT
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

This Owner authorization is execution-only for exactly one implementation or blocker commit after this authorization commit. Independent review begins only after Owner says `review`.

## 2. Authorization identity
```text
WORK_PACKAGE = D2-WP004-R1-R3
AUTHORIZATION_TOKEN = D2-WP004-R1-R3-SOURCE-TEST-20260902-01
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / EXACT TWO EXISTING FILES
OWNER_APPROVAL_BASELINE_HEAD = 5e15e5491a5b3ff53d7f5dc18531cc6d418a0c0d
EXPECTED_COMMITS = EXACTLY ONE IMPLEMENTATION OR BLOCKER COMMIT AFTER THIS AUTHORIZATION COMMIT
```

Authorized writable files ONLY:
1. `src/profiles/mbo-xlsx-template-profile.js`
2. `tests/mbo-xlsx-template-profile.test.js`

No third file.

## 3. Durable semantic authority
Canonical authority:
`project-docs/CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`

Exact classification:
```text
PROVEN_SAFE_TO_MAP = 18
UNRESOLVED_KEEP_UNRESOLVED = 22
NO_SECURED_PROJECTION_SOURCE_DO_NOT_MAP = 5
DUPLICATE_EXCLUSIVE_SAFE_TO_MAP_TARGETS = 0
SAFE_TO_MAP_WITH_NULL_OR_UNKNOWN_SECURED_PATH = 0
CHIEF_FROZEN_AUTHORITY = R:X
```

### 3.1 Exact 18 SAFE_TO_MAP roles
Only these semantic roles may resolve as production writable mappings:
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

### 3.2 Exact 22 UNRESOLVED roles
Every request for these roles must remain non-writable and throw exactly `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`:
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

### 3.3 Exact 5 NO_SECURED_PROJECTION_SOURCE roles
Never synthesize, reconstruct or map these. Any production-resolution request must throw `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`:
- `OVERALL_RATING_SUMMARY`
- `EMPLOYEE_COMMENTS`
- `CHIEF_FEEDBACK`
- `EMPLOYEE_SIGNATURE`
- `CHIEF_SIGNATURE`

## 4. Frozen mapping facts
Template identity:
```text
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Part A headers/Hoshin:
```text
HEADER_FISCAL_YEAR -> N6 / N6:Q7 -> partA.header.fiscalYear
HEADER_DEPARTMENT -> Z7:AF7 -> partA.header.department
HEADER_SECTION -> AG7:AL7 -> partA.header.section
HEADER_EMPLOYEE_CODE -> AQ7:AS7 -> partA.header.employeeCode
HEADER_EMPLOYEE_NAME -> AT7:BC7 -> partA.header.employeeName
HEADER_POSITION -> BD7:BI7 -> partA.header.position
HOSHIN_DEPARTMENT_HOSHIN_TITLE -> G16:AF19 -> partA.hoshin.departmentHoshinTitle
HOSHIN_SECTION_HOSHIN_TITLE -> AM16:BI19 -> partA.hoshin.sectionHoshinTitle
G8:S8 = NOT HOSHIN / NON-WRITABLE AS HOSHIN
```

For Part A objective index `i` with template row `r = 24 + i`:
```text
OBJECTIVE_i_MEASUREMENT -> T{r}:W{r} -> partA.objectives[i-1].measurement
OBJECTIVE_i_WEIGHT -> Y{r}:Z{r} -> partA.objectives[i-1].weight
OBJECTIVE_i_ACTUAL_RESULT -> AK{r}:AR{r} -> partA.objectives[i-1].actualResult
OBJECTIVE_i_SELF_COMMENT -> AD{r}:AG{r} -> partA.objectives[i-1].selfComment
OBJECTIVE_i_AVERAGE_SCORE -> BC{r}:BE{r} -> partA.objectives[i-1].averageScore
```

Part A safe summaries:
```text
SUMMARY_PART_A_RAW_SCORE -> BC29 -> partA.summary.rawPartAScore
SUMMARY_PART_A_WEIGHTED_SCORE -> BC33 -> partA.summary.weightedPartAScore
```

Part B safe headers:
```text
HEADER_FISCAL_YEAR -> G2:H3 -> partA.header.fiscalYear
HEADER_DEPARTMENT -> J3:L3 -> partA.header.department
HEADER_SECTION -> M3:O3 -> partA.header.section
HEADER_POSITION -> P3:Q3 -> partA.header.position
HEADER_EMPLOYEE_CODE -> R3 -> partA.header.employeeCode
HEADER_EMPLOYEE_NAME -> S3:W3 -> partA.header.employeeName
```

Part B authority:
```text
SELF_DYNAMIC_AUTHORITY = K:Q
CHIEF_DYNAMIC_AUTHORITY = R:X
PROVEN_SECURED_COMPETENCY_WRITE = partB.competencyItems[b-1].selfRating ONLY
CHIEF_SECURED_WRITABLE_ROLE = 0
N6_SUMMARY_ROWS = 31:34
N7_SUMMARY_ROWS = 35:38
N8_SUMMARY_ROWS = 39:42
SAFE_SUMMARY_PROJECTIONS = partB.rawPartBScore + partB.weightedPartBScore
```

## 5. Preserve accepted R1-R1 behavior
Do not regress:
- pure mapping module architecture;
- exact Part A/B SHA constants;
- Part A objective count accepts integer 4..10 only;
- Part B competency count accepts integer 6/7/8 only;
- corrected Part B rows7:29 dynamic authority and inserted N7/N8 topology;
- row30/34/38 protected non-dynamic behavior;
- caller input and returned structures remain immutable;
- stable blocker family `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`;
- integrity validation for malformed address, missing mapping, duplicate exclusive target and protected-target violations;
- no `fs`, Kintone API, `xlsx-populate`, workbook read/write, generated XLSX/PDF or scoring logic.

## 6. Required R1-R3 source behavior
1. The profile must expose a canonical allowlist/classification whose writable set is exactly the 18 SAFE roles above.
2. `resolve`/equivalent production writable APIs must return deterministic address/range + exact secured projection path only for the accepted safe role/count/index combination.
3. Requests for every unresolved role, no-source role, unknown role, unsupported count/index or unknown template identity must fail closed with `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`.
4. Remove or disable legacy writable mappings that conflict with the semantic Baseline, including:
   - Department at AG7;
   - legacy G8 Hoshin;
   - employeeNameTH as separate writer;
   - standalone objective title/description/KPI/target/progress/selfAchievement;
   - Manager/GM/Appraiser ordinal mappings;
   - `SUMMARY_WEIGHT_SUM`, final score, final grade;
   - Part B Chief writable rating mapping;
   - comment/signature/no-source mappings.
5. Chief `R:X` must remain available only as frozen structural/privacy metadata; it must NOT become a secured writable semantic role.
6. Formula/scoring mappings = zero. Do not calculate scores or create formula authority.
7. Integrity validator must validate the actual production safe mapping set, not merely hard-coded metadata counts.

## 7. Required tests
Tests must directly prove:
- exact SAFE role set = 18;
- exact UNRESOLVED role set = 22;
- exact NO_SECURED_SOURCE role set = 5;
- all 18 safe mappings resolve deterministically for relevant supported counts/indices;
- all 22 unresolved roles throw exact blocker;
- all 5 no-source roles throw exact blocker;
- Department is `Z7:AF7`, Section `AG7:AL7`;
- Department Hoshin is `G16:AF19`, Section Hoshin `AM16:BI19`, G8 is not a Hoshin write target;
- employeeName resolves; employeeNameTH rejects;
- objective title/description/KPI/target/progress/selfAchievement/Manager/GM writes reject;
- five proven objective semantics resolve for all Part A count domain 4..10 and valid objective indices;
- summary weight/final score/final grade reject;
- Part B self competency resolves for N6/N7/N8 valid items; Chief competency rejects;
- Chief frozen authority metadata remains exactly `R:X` without a writable secured Chief role;
- N6/N7/N8 summary relocation remains exact;
- row30/34/38 remain protected/non-writable;
- duplicate exclusive writable target count = 0;
- writable role with null/unknown secured path count = 0;
- integrity validator rejects missing safe mapping, duplicate target, malformed address, protected-target violation and null projection path;
- caller input/returned structures remain immutable;
- module has no forbidden import/I/O and tests require no template binaries.

## 8. Commands
Run exactly:
```bash
node --check src/profiles/mbo-xlsx-template-profile.js
node --check tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-export-service.test.js
npm audit --omit=dev
git status --porcelain
```

## 9. Explicitly forbidden / out of scope
Do NOT modify:
- `src/services/mbo-export-service.js`;
- feasibility source/tests;
- any Baseline/control document during executor work;
- package/dependency files;
- owner XLSX binaries;
- `dist/`;
- any repository file other than the two authorized files.

Do NOT:
- create/edit Production XLSX Renderer;
- read/write/mutate XLSX workbooks from production profile code;
- generate XLSX/PDF/image evidence;
- recalculate scoring;
- widen semantic authority beyond the 18 safe roles;
- reconstruct Employee-Self confidential fields;
- touch Kintone/ACL/process/customization;
- deploy;
- run Live UAT;
- invoke Claude;
- start Combined Excel parity, PDF parity, security regression or D3.

## 10. Verification / commit contract
Before commit:
```bash
git diff --name-only
git status --porcelain
```

Exactly these two repository paths may differ:
```text
src/profiles/mbo-xlsx-template-profile.js
tests/mbo-xlsx-template-profile.test.js
```

Then:
- create exactly ONE implementation OR blocker commit;
- push to `ai/antigravity-wp002c`;
- STOP immediately;
- do not self-declare PASS/CLOSED;
- do not start Production Renderer or next gate.

Report:
- implementation/blocker commit SHA;
- exact changed files;
- both `node --check` results;
- both `node --test` results with pass/fail/skip counts;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker if any.

## 11. Authorization ledger
```text
D2-WP004-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-EVIDENCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-R1-EVIDENCE-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R2-R2-EVIDENCE-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R1-R3-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R1-R3-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R1-R3-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE EXACT R1-R3 CONTRACT, PUSH ONE COMMIT, STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
