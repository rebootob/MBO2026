# AI ACTIVE TASK — R2-B1-R9 TEST-ONLY AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / TEST-ONLY / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
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
D2_WP004_R2_B1 = FINAL CELL-PROOF CORRECTIVE ACTIVE / NOT CLOSED
D2_WP004_R2_B1_R4 = SOURCE REVIEW PASS / SOURCE FROZEN
D2_WP004_R2_B1_R8 = REVIEWED / RELATIONSHIP PROOF PASS / CELL PROOF INCOMPLETE / NOT CLOSED
D2_WP004_R2_B1_R9 = AUTHORIZED / ACTIVE / TEST-ONLY

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B1-R9
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-B1-R9-TEST-ONLY-CORRECTIVE-20260903-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / TEST-ONLY / BOUNDED / ONE-SHOT / ONE COMMIT -> PUSH -> STOP
R2_B1_PRODUCTION_SOURCE = ACCEPTED / FROZEN
R2_B1_RELATIONSHIP_PROOF = PASS / FROZEN
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```

## 2. Authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-B1-R9
NAME = PART A FINAL NO-FILTER CELL STRUCTURAL PROOF
STATE = AUTHORIZED / ACTIVE
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R9-TEST-ONLY-CORRECTIVE-20260903-01
AUTHORIZATION_BASIS_HEAD = 4e49457edbbade5441c5ace450fb6a0418ac492e
MAX_EXECUTOR_COMMITS = 1
EXECUTOR = ANTIGRAVITY
FINAL_EXECUTOR_STATE = TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Owner authorization received exactly:
`อนุมัติ D2-WP004-R2-B1-R9 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`

Single-use token. Antigravity must STOP after one pushed TEST-ONLY commit and must not self-declare PASS/CLOSED.

## 3. Frozen source/profile

```text
src/services/mbo-xlsx-template-preparer.js = FROZEN / FORBIDDEN
src/profiles/mbo-xlsx-template-profile.js = FROZEN / FORBIDDEN
```

Do not change production source/profile in R9. If the exact no-filter proof exposes a real production structural defect, report it and STOP; a new owner authorization is required before any source change.

## 4. Writable scope

Writable file ONLY:

```text
tests/mbo-xlsx-template-preparer.test.js
```

Forbidden:

```text
src/services/mbo-xlsx-template-preparer.js
src/profiles/mbo-xlsx-template-profile.js
src/services/mbo-export-service.js
scripts/export/mbo-xlsx-ooxml-feasibility.js
tests/mbo-xlsx-ooxml-feasibility.test.js
project-docs/*
package.json
package-lock.json
dist/*
UI / integration
R2-B2
R2-C
Combined Excel
Kintone write/deploy/Live UAT
D3
```

## 5. Exact R9 corrective

Correct ONLY the remaining cell-proof blocker.

### A. Remove all structural cell filtering

The R8 helper `filterSanitizerMaterializedCells()` or any equivalent exclusion is NOT allowed as closure proof.

Required:
- compare every parsed SOURCE cell against every parsed OUTPUT cell;
- no style-based filtering;
- no sanitization-range-based filtering;
- no `s="1"` filtering;
- no type-based filtering;
- no broad exception added merely to make the test green.

### B. Deep-equal complete normalized cell objects

For rows 1:28, inserted rows, and relocated downstream rows:
- retain exact ordered cell inventory;
- retain column/reference topology;
- retain `s` when present;
- retain `t` when present;
- retain every other parsed structural cell attribute;
- normalize ONLY the row-number component of cell reference authority;
- deep-equal complete normalized cell objects, not selected fields;
- exact cell counts must match;
- SOURCE `t` present / OUTPUT `t` absent must FAIL;
- SOURCE `t` absent / OUTPUT `t` added must FAIL unless exact structural authority explicitly proves otherwise;
- no extra cells;
- no missing cells.

### C. Potential source-defect guard

If the focused no-filter test fails because `preparePartATemplate()` materializes extra structural cells or mutates structural cell attributes during sanitization:
- DO NOT weaken the test;
- DO NOT add exclusions;
- DO NOT edit production source;
- capture the exact N, row, cell, SOURCE structural object, OUTPUT structural object, and assertion failure;
- report `POTENTIAL PRODUCTION SOURCE STRUCTURAL DEFECT / SOURCE CHANGE NOT AUTHORIZED`;
- commit only a valid TEST-ONLY correction if appropriate; otherwise do not create a misleading green commit.

## 6. Preserve accepted R7/R8 proof

Do not weaken or remove:
- exact SOURCE-derived row oracle;
- complete frozen package authority object;
- `sheetNames`, `sheetStates`, `colsHash` and page/print authority;
- exact relationship tuple inventory and R8 exact rId3 fail-closed normalization;
- media/drawing/formula inventory;
- merge set/count;
- dimension and Print_Area proof;
- package-wide privacy scan;
- Profile substitution/protected-topology fail-closed tests;
- caller-byte immutability;
- no semantic writes/scoring/recalc/Part B mutation;
- fail-closed exact owner-template execution;
- NO `t.skip()`.

## 7. Required focused run

Run exactly:

`node --test tests/mbo-xlsx-template-preparer.test.js`

Closure requires:

```text
FAIL = 0
SKIP = 0
real owner-template integration = EXECUTED / NOT SKIPPED
N4..N10 matrix = PASS
```

If no-filter proof fails due production behavior, report the defect instead of claiming closure.

## 8. Executor protocol

```text
fresh-fetch canonical branch
-> verify HEAD equals authorization HEAD
-> read fast-start + this task + R2 design + Part A structural baseline
-> inspect source/profile READ-ONLY as needed
-> modify ONLY tests/mbo-xlsx-template-preparer.test.js
-> remove all cell filtering and deep-equal complete cell objects
-> run focused owner-template test
-> git diff --name-only must show exactly the authorized test file
-> if FAIL=0 / SKIP=0 and N4..N10 PASS: create exactly one TEST-ONLY commit -> push -> report -> STOP
-> if exact no-filter proof exposes production structural defect: do not edit source; report exact evidence -> STOP
```

Expected executor final status on green proof:
`R2-B1-R9 TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`

## 9. Remaining work — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = later D2 gate
D3 = HOLD UNTIL D2 PASS / CLOSED
```
