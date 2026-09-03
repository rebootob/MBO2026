# AI ACTIVE TASK — R2-B1-R8 REVIEWED / CELL PROOF NOT CLOSED / R9 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`, `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`, and only exact Part A profile/source/test evidence needed.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = NEEDS FINAL TEST-ONLY CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R4 = SOURCE REVIEW PASS / SOURCE FROZEN
D2_WP004_R2_B1_R7 = REVIEWED / NEAR-CLOSE / NOT CLOSED
D2_WP004_R2_B1_R8 = REVIEWED / RELATIONSHIP PROOF PASS / CELL PROOF INCOMPLETE / NOT CLOSED

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_PRODUCTION_SOURCE = ACCEPTED / FROZEN
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```

## 2. R8 identity / scope review

```text
R8_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R8-TEST-ONLY-CORRECTIVE-20260903-01
R8_AUTHORIZATION_COMMIT = 543ccc97541fe0e66110f6afe0b376187753f495
R8_IMPLEMENTATION_COMMIT = b7ac6b8744536de459f535ec05a5cde37adeec63
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY ONE AUTHORIZED FILE
  tests/mbo-xlsx-template-preparer.test.js
SCOPE_REVIEW = PASS
TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
```

Accepted R8 improvement:
- SOURCE rId3 normalization now collects tuples first, asserts exactly one drawing1 rId3 tuple, checks exact canonical Type, exact Target and TargetMode=null, then removes only that tuple. Relationship blocker is accepted as PASS.

## 3. MATERIAL TEST BLOCKER — exact cell inventory is still weakened

R8 parser now retains `t` and no longer globally drops `s="1"` cells. However the comparison layer reintroduces a structural exclusion:

```text
filterSanitizerMaterializedCells(...)
  removes cells where address is in effectiveSanitizationRanges and s="1"
```

This violates the R8 authority that required every cell of every style/type to remain in the exact ordered SOURCE/OUTPUT inventory with no broad exclusions.

Current `compareCellInventories()` also compares only `col`, `s`, and conditionally `t` rather than deep-equaling the complete parsed structural cell objects. The conditional type check is output-driven:

```text
if (oCell.t !== undefined) assert.equal(oCell.t, sCell.t)
```

Therefore a SOURCE cell with `t` present but OUTPUT `t` missing can pass undetected. Other parsed structural attributes can also differ without failing because they are not compared.

Required next proof:
- no style-based or sanitization-range-based cell filtering;
- preserve every parsed SOURCE and OUTPUT cell in ordered inventory;
- preserve `t` and all other structural attributes;
- normalize only cell row-number authority;
- deep-equal complete normalized cell objects, not selected fields;
- SOURCE `t` present / OUTPUT `t` absent must fail;
- exact no-extra/no-missing cells must hold for rows 1:28, inserted rows and downstream relocated rows.

If the exact no-filter test fails because the production sanitizer materializes extra structural cells, report that as evidence of a potential production-source structural defect. Do not hide it in test normalization and do not change production source without a new owner authorization.

## 4. Runtime evidence

Repository truth exposes no combined CI status and no workflow run for R8.

Focused owner-template test remains the required executor evidence:

`node --test tests/mbo-xlsx-template-preparer.test.js`

Closure requires:

```text
FAIL = 0
SKIP = 0
real owner-template integration = EXECUTED / NOT SKIPPED
N4..N10 matrix = PASS
```

## 5. Exact next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1-R9
NAME = PART A FINAL NO-FILTER CELL STRUCTURAL PROOF
STATE = PROPOSED / NOT AUTHORIZED
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  tests/mbo-xlsx-template-preparer.test.js

SOURCE_CHANGE_AUTH = NONE
PROFILE_CHANGE_AUTH = NONE
MAX_EXECUTOR_COMMITS = 1
```

R9 must correct ONLY the cell-proof blocker above. Production source/profile remain frozen unless the no-filter test independently proves a real production structural defect.

## 6. R9 forbidden scope

```text
src/services/mbo-xlsx-template-preparer.js = FROZEN / FORBIDDEN
src/profiles/mbo-xlsx-template-profile.js = FROZEN / FORBIDDEN
src/services/mbo-export-service.js = FORBIDDEN
scripts/export/mbo-xlsx-ooxml-feasibility.js = FORBIDDEN
tests/mbo-xlsx-ooxml-feasibility.test.js = FORBIDDEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
Combined Excel = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 7. Owner decision

No execution is authorized now.

Recommended approval phrase:
`อนุมัติ D2-WP004-R2-B1-R9 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_SOURCE = ACCEPTED / FROZEN
R2_B1_RELATIONSHIP_PROOF = PASS
R2_B1_CELL_PROOF = NOT CLOSED
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```
