# AI ACTIVE TASK — D2-WP004-R1-R1 TEMPLATE PROFILE CORRECTIVE AUTHORIZED

Mode: **LOW-CREDIT / BOUNDED / ONE-SHOT / EXACT TWO FILES / PURE MAPPING CORRECTIVE / NO WORKBOOK I/O / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> directly relevant Baseline -> exact implementation diff.

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
CONTROL_PLANE_REVIEW_CORRECTIVE_STANDING_AUTH = EXHAUSTED / DO NOT REUSE
ANTIGRAVITY_AUTO_AUTH = NO
CLAUDE_AUTO_REVIEW = NO
ACTIVE_WORK_PACKAGE = D2-WP004-R1-R1
ACTIVE_WORK_PACKAGE_NAME = TEMPLATE PROFILE AUTHORITY + SEMANTIC + FAIL-CLOSED CORRECTIVE
TASK_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
OWNER_APPROVAL_BASELINE_HEAD = 57b77fde38c0ef95f0ac40eb396ec386643adf03
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R1-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R1-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R1-R1 / ONE-SHOT / LOW-CREDIT
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

This authorization is execution-only for exactly one SOURCE+TEST implementation or blocker commit. Independent review starts only when Owner says `review`.

## 2. Authorization identity
```text
WORK_PACKAGE = D2-WP004-R1-R1
AUTHORIZATION_TOKEN = D2-WP004-R1-R1-SOURCE-TEST-20260902-01
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / PURE TEMPLATE-MAPPING CORRECTIVE
OWNER_APPROVAL_BASELINE_HEAD = 57b77fde38c0ef95f0ac40eb396ec386643adf03
EXPECTED_COMMITS = EXACTLY ONE IMPLEMENTATION OR BLOCKER COMMIT AFTER THIS AUTHORIZATION COMMIT
```

Authorized writable files ONLY:
1. `src/profiles/mbo-xlsx-template-profile.js`
2. `tests/mbo-xlsx-template-profile.test.js`

Any third file or modification outside these two files is out of scope and must block completion.

## 3. R1 review truth / freeze accepted work
R1 authorization: `D2-WP004-R1-SOURCE-TEST-20260902-01`  
R1 implementation: `ca6bc323117d4e2c5550774e9027d801551a792d`

Freeze/retain:
- pure module: no `fs`, Kintone API/adapter, `xlsx-populate`, workbook I/O, renderer orchestration or binary generation;
- exact accepted template SHA constants:
  - Part A `03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3`
  - Part B `c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3`
- Part A count domain = numeric integers 4..10 only;
- Part B count domain = numeric integers 6,7,8 only;
- caller-input immutability and immutable returned mapping structures;
- stable production error family `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`.

R1 token is consumed/corrective/do not reuse.

## 4. Frozen authority to consume
Read only as needed:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`
- `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`
- `src/services/mbo-export-service.js` READ-ONLY secured projection authority

Do not reinterpret or weaken these authorities.

## 5. Exact R1-R1 corrective contract

### A. Correct Part B row-role topology
Remove the false assumption that original competencies form uniform 3-rating-row + 1-padding-row blocks beginning at row7.

Exact frozen authority:
```text
N6:
  rows 7..29 K:X = DYNAMIC COMPETENCY RATING AREA
  row 30 = PROTECTED NON-DYNAMIC PADDING
  summary = rows 31..34

N7:
  original rows 7..29 K:X = DYNAMIC
  row 30 = PROTECTED
  inserted rows 31..33 K:X = DYNAMIC
  row 34 = PROTECTED CLONE OF SOURCE ROW30
  summary = rows 35..38

N8:
  original rows 7..29 K:X = DYNAMIC
  row 30 = PROTECTED
  inserted rows 31..33 K:X = DYNAMIC
  row 34 = PROTECTED
  inserted rows 35..37 K:X = DYNAMIC
  row 38 = PROTECTED
  summary = rows 39..42
```

Required consequences:
- rows10/14/18/22/26 K:X are dynamic, not padding;
- row30/34/38 must never resolve writable/dynamic;
- do not invent original per-competency four-row boundaries from the source27:30 clone block;
- source27:30 is authority only for EXTRA inserted blocks.

If a requested per-item semantic row cannot be resolved from accepted evidence, fail closed rather than guess.

### B. Align semantic contract to secured `MboExportService`
Use `src/services/mbo-export-service.js` READ-ONLY as secured projection authority.

Production Template Profile must expose explicit canonical semantic identifiers AND deterministic projection-path/field translation for every writable semantic role it claims.

Current secured projection semantics include:
- `partA.header.employeeCode`
- `partA.header.employeeName`
- `partA.header.employeeNameTH`
- `partA.header.department`
- `partA.header.section`
- `partA.header.position`
- `partA.header.fiscalYear`
- `partA.header.profileCode`
- `partA.header.profileFamily`
- `partA.header.partAWeightPercent`
- `partA.hoshin.departmentHoshinTitle`
- `partA.hoshin.sectionHoshinTitle`
- objective fields: `title`, `description`, `kpi`, `target`, `measurement`, `weight`, `progressPercent`, `actualResult`, `selfAchievement`, `selfComment`, plus manager/GM/average fields only where the secured projection exposes them;
- authorized Part A summary fields projected by the service;
- `partB.partBWeightPercent` and `partB.competencyItems` after Employee-Self filtering;
- authorized Part B/final result fields only where the projection exposes them.

Requirements:
- both department and section Hoshin semantics must be represented if a writable mapping is claimed;
- semantic names must match projection meaning or carry an explicit deterministic translation to the exact projection path;
- do not reconstruct or create writable roles for confidential fields omitted by Employee-Self projection;
- profile does not decide authorization and does not calculate scores;
- address existence alone is NOT evidence of semantic meaning.

If exact semantic meaning/address is not supported by current accepted repository/template evidence, leave it unresolved and fail closed when requested. Do not invent a production mapping.

### C. Add production mapping-integrity validator
Add a pure production validator/API that validates a mapping/profile definition and throws exactly:
`EXPORT_TEMPLATE_PROFILE_UNRESOLVED`

for at least:
- missing required semantic role or required projection-path mapping;
- duplicate/conflicting exclusive write-target ownership;
- malformed/invalid cell or range shape where applicable;
- protected Part B padding exposed as writable;
- unsupported profile/template identity;
- unsupported objective/competency count;
- unknown semantic role.

Default accepted MBO2026 profile must validate successfully.

Validator must be usable by future renderer before workbook mutation; it must not perform workbook I/O itself.

### D. No scattered/duplicate production mapping ownership
Important production addresses/ranges must remain centralized in the profile module. Do not move them into renderer/service/business logic. Do not duplicate feasibility structural/privacy mutation implementation inside this profile.

## 6. Exact test contract
Retain all valid R1 SHA/count/purity/immutability proof and correct inaccurate Part B assertions.

Direct tests must prove:
1. N6 rows10/14/18/22/26 K:X are dynamic;
2. N6/7/8 row30 K:X is non-dynamic;
3. N7 rows31:33 K:X dynamic and row34 K:X non-dynamic;
4. N8 rows31:33 + 35:37 K:X dynamic and rows34/38 K:X non-dynamic;
5. summary destinations are exactly 31:34 / 35:38 / 39:42;
6. no original padding list `[10,14,18,22,26,30]` or equivalent false four-row model survives;
7. semantic/projection-path contract explicitly contains both `partA.hoshin.departmentHoshinTitle` and `partA.hoshin.sectionHoshinTitle` where mapped;
8. objective/evaluation semantic roles that are claimed have explicit projection-path translation rather than invented field meaning;
9. in-memory removal of a required semantic/projection mapping => exact blocker;
10. in-memory duplicate/conflicting exclusive target => exact blocker;
11. in-memory protected Part B row30/34/38 exposed writable => exact blocker;
12. invalid address/range shape => exact blocker;
13. accepted default profile passes production integrity validator;
14. caller mutation does not occur;
15. profile source still imports no forbidden module and performs no workbook I/O;
16. no owner-template binary is required for R1-R1 tests.

Tests may clone/mutate in-memory mapping definitions for negative proof.

## 7. Explicitly forbidden / out of scope
Do NOT modify:
- `src/services/mbo-export-service.js`;
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`;
- `tests/mbo-xlsx-ooxml-feasibility.test.js`;
- any Baseline/document during executor implementation;
- `package.json` / `package-lock.json`;
- `dist/` or deployed JS/CSS;
- any file other than the two authorized profile/test files.

Do NOT:
- create Production XLSX Renderer;
- read/write/mutate workbook binaries;
- create XLSX/PDF/image/evidence binaries;
- recalculate scores;
- alter authorization logic;
- touch Kintone/ACL/process/customization/deploy/Live UAT;
- start Combined Excel parity, PDF parity, export security regression or D3;
- invoke Claude.

## 8. Required commands
Run exactly:
```bash
node --check src/profiles/mbo-xlsx-template-profile.js
node --check tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-export-service.test.js
npm audit --omit=dev
git status --porcelain
```

No template-dependent skip is expected. Any skip must be reported exactly and cannot be called PASS.

## 9. Commit / push contract
After tests:
- create exactly ONE bounded R1-R1 implementation OR blocker commit;
- commit must contain ONLY the two authorized files;
- push to `ai/antigravity-wp002c`;
- STOP immediately;
- do not self-declare PASS/CLOSED;
- do not start Renderer or next gate.

Report only:
- commit SHA;
- exact changed files;
- both `node --check` results;
- both `node --test` results including skips;
- `npm audit --omit=dev` result;
- `git status --porcelain`;
- blocker, if any.

## 10. Authorization ledger / exact next action
```text
D2-WP004-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTIVE / DO NOT REUSE
D2-WP004-R1-R1-SOURCE-TEST-20260902-01 = ACTIVE / ONE-SHOT / SOURCE+TEST / EXACT TWO FILES
CONTROL-PLANE-D2-REVIEW-CORRECTIVE-20-ROUND-20260901 = EXHAUSTED / DO NOT REUSE
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R1-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R1-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE ONLY D2-WP004-R1-R1-SOURCE-TEST-20260902-01; ONE TWO-FILE IMPLEMENTATION/BLOCKER COMMIT; PUSH; REPORT; STOP
ANTIGRAVITY = AUTHORIZED ONLY FOR R1-R1
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
