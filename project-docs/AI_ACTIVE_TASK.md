# AI ACTIVE TASK — D2-WP004-R1 REVIEW CORRECTIVE / R1-R1 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / PURE TEMPLATE-MAPPING CORRECTIVE PROPOSED / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> directly relevant Baseline -> exact diff.

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
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```

## 2. D2-WP004-R1 independent review
```text
R1_AUTHORIZATION = D2-WP004-R1-SOURCE-TEST-20260902-01
R1_AUTHORIZATION_COMMIT = dcf1fca73fbca4a6156e924f4472c6b089836997
R1_IMPLEMENTATION = ca6bc323117d4e2c5550774e9027d801551a792d
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
R1_SCOPE_REVIEW = PASS
R1_PURE_NO_WORKBOOK_IO = PASS
R1_TEMPLATE_SHA_CONSTANTS = PASS
R1_COUNT_VALIDATION = PASS
R1_CALLER_IMMUTABILITY = PASS
R1_SOURCE_ROLE_REVIEW = CORRECTIVE REQUIRED
R1_SEMANTIC_BOUNDARY_REVIEW = CORRECTIVE REQUIRED
R1_FAIL_CLOSED_INTEGRITY_PROOF = CORRECTIVE REQUIRED
R1_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
R1_STATUS = CORRECTIVE REQUIRED
R1_TOKEN = CONSUMED / CORRECTIVE / DO NOT REUSE
```

No Baseline promotion for the R1 profile yet.

## 3. Proven defects

### DEFECT A — Part B uniform four-row model contradicts frozen privacy authority
R1 models every competency as 3 rating rows + 1 padding row beginning at row7, making rows 10/14/18/22/26 protected padding.

Frozen authority says:
```text
ORIGINAL N6 DYNAMIC COMPETENCY RATING ROWS = 7..29 / K:X
ORIGINAL PROTECTED PADDING = ROW 30 ONLY
N7 INSERTED DYNAMIC ROWS = 31..33 / K:X
N7 INSERTED PADDING = 34
N7 SUMMARY = 35..38
N8 INSERTED DYNAMIC ROWS = 31..33 AND 35..37 / K:X
N8 INSERTED PADDING = 34 AND 38
N8 SUMMARY = 39..42
```

Do not infer original per-competency four-row boundaries from the inserted source clone block. The only frozen 4-row clone authority is source rows27:30 for each EXTRA competency block.

### DEFECT B — semantic mapping does not faithfully consume secured projection
`src/services/mbo-export-service.js` is read-only secured projection authority.

Current projection semantics include, among others:
- `partA.header.employeeCode/employeeName/employeeNameTH/department/section/position/fiscalYear/profileCode/profileFamily/partAWeightPercent`;
- `partA.hoshin.departmentHoshinTitle/sectionHoshinTitle`;
- objective semantic fields `title`, `description`, `kpi`, `target`, `measurement`, `weight`, `progressPercent`, `actualResult`, `selfAchievement`, `selfComment`, and authorized manager/GM/average fields;
- authorized summary/result fields already projected by the service;
- `partB.competencyItems` with Employee-Self filtering already applied by the service.

R1 currently invents/uses incompatible or incomplete roles such as `CORPORATE_HOSHIN_TEXT`, `PLAN_TARGET`, `CHIEF_RATING`, `FINAL_RATING` without an explicit proven translation to the secured projection and omits the section-Hoshin projection role.

The Template Profile must express a clear semantic/projection-path contract. Do not reconstruct omitted confidential fields and do not invent a field meaning merely because an address exists.

### DEFECT C — missing/conflicting mapping is not runtime fail-closed
R1 tests show the current hard-coded addresses are unique, but there is no production mapping-integrity validator proving that a missing required semantic mapping or conflicting exclusive write ownership throws `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`.

## 4. Proposed corrective — D2-WP004-R1-R1 / NOT AUTHORIZED
```text
PROPOSED_WORK_PACKAGE = D2-WP004-R1-R1
NAME = TEMPLATE PROFILE AUTHORITY + SEMANTIC + FAIL-CLOSED CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT IF AUTHORIZED
EXPECTED_WRITABLE_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
```

No authorization token exists yet.

Recommended Owner phrase:
`อนุมัติ D2-WP004-R1-R1 SOURCE+TEST ตามขอบเขตที่เสนอ`

## 5. Exact R1-R1 corrective contract

### A. Freeze R1 accepted behavior
Retain:
- pure module: no `fs`, Kintone, `xlsx-populate`, workbook I/O or renderer;
- exact Part A/Part B SHA constants;
- numeric-only Part A count 4..10;
- numeric-only Part B count 6/7/8;
- immutable caller inputs/returned mapping structures;
- stable error family `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`.

### B. Correct Part B row-role authority
Remove the false original uniform four-row competency model.

Production profile must expose the exact frozen dynamic/protected role topology above. At minimum:
- `isDynamicWriteTarget('B', ...)` must return TRUE for every K:X cell in original rows7:29;
- rows10/14/18/22/26 must therefore be dynamic, not padding;
- row30/34/38 remain non-dynamic;
- N7 rows31:33 K:X dynamic, row34 non-dynamic, summary35:38;
- N8 rows31:33 +35:37 K:X dynamic, rows34/38 non-dynamic, summary39:42.

Do not fabricate original per-competency block boundaries if they are not proven by accepted evidence. If a requested per-item semantic role cannot be resolved from authoritative evidence, fail closed rather than guess.

### C. Align semantic roles to `MboExportService`
Read `src/services/mbo-export-service.js` READ-ONLY and define explicit canonical semantic identifiers/projection paths for mappings that Production Renderer may consume.

Required:
- Hoshin roles must distinguish the actual `departmentHoshinTitle` and `sectionHoshinTitle` projection semantics;
- objective/evaluation/summary semantic names must either match projection field semantics or carry an explicit deterministic translation to them;
- do not create writable semantic roles for data the secured projection does not expose to that caller;
- profile itself still does not authorize callers or calculate scores.

For any address whose exact semantic meaning is not proven by current accepted repository/template evidence, do not invent a production semantic meaning; fail closed or leave it outside the writable mapping until separately proven.

### D. Add production mapping-integrity validator
Add a pure validator/API that validates a profile/mapping definition and throws exactly `EXPORT_TEMPLATE_PROFILE_UNRESOLVED` for at least:
- missing required semantic role/mapping;
- duplicate/conflicting exclusive write target ownership;
- invalid address/range shape where applicable;
- protected Part B padding exposed as writable;
- unsupported count/template/profile identity.

The default MBO2026 profile must validate successfully.

### E. Exact negative/positive tests
Tests must directly prove:
1. rows10/14/18/22/26 K:X dynamic for N6;
2. row30 K:X non-dynamic N6/7/8;
3. N7 rows31:33 dynamic and row34 non-dynamic;
4. N8 rows31:33 +35:37 dynamic and rows34/38 non-dynamic;
5. summary destinations exactly 31:34 / 35:38 / 39:42;
6. no guessed original four-row padding list remains;
7. secured-projection semantic keys/paths are explicit, including both department and section Hoshin;
8. missing required mapping mutation => exact blocker;
9. duplicate/conflicting exclusive write target mutation => exact blocker;
10. protected padding made writable => exact blocker;
11. accepted default profile passes integrity validator;
12. existing SHA/count/purity/immutability tests remain.

Tests may clone/mutate in-memory profile definitions for negative proof. No owner-template binary is required.

## 6. Explicitly out of scope
Do NOT modify any file except the two proposed profile/test files if later authorized.
Do NOT modify `MboExportService`, feasibility source/tests, dependencies, package-lock, dist or Baselines.
Do NOT create Production XLSX Renderer, render/mutate XLSX, recalculate scores, touch Kintone/deploy/Live UAT, start Combined Excel/PDF/security regression/D3, or invoke Claude.

## 7. Expected commands if authorized
```bash
node --check src/profiles/mbo-xlsx-template-profile.js
node --check tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-xlsx-template-profile.test.js
node --test tests/mbo-export-service.test.js
npm audit --omit=dev
git status --porcelain
```

Exactly one bounded implementation/blocker commit, exactly the two profile/test files, push canonical branch, report, STOP, no self-PASS/CLOSED.

## 8. Exact next action
```text
NEXT_EXECUTOR = OWNER
NEXT_ACTION = DECIDE WHETHER TO AUTHORIZE D2-WP004-R1-R1 SOURCE+TEST
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
