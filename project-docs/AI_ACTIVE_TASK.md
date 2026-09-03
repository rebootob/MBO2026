# AI ACTIVE TASK — R2-B1-R8 TEST-ONLY AUTHORIZED / ACTIVE

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
D2_WP004_R2_B1 = FINAL TEST PROOF CORRECTIVE ACTIVE / NOT CLOSED
D2_WP004_R2_B1_R4 = SOURCE REVIEW PASS / SOURCE FROZEN
D2_WP004_R2_B1_R5 = REVIEWED / NOT CLOSED
D2_WP004_R2_B1_R6 = REVIEWED / NOT CLOSED
D2_WP004_R2_B1_R7 = REVIEWED / NEAR-CLOSE / NOT CLOSED
D2_WP004_R2_B1_R8 = AUTHORIZED / ACTIVE / TEST-ONLY

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B1-R8
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-B1-R8-TEST-ONLY-CORRECTIVE-20260903-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / TEST-ONLY / BOUNDED / ONE-SHOT / ONE COMMIT -> PUSH -> STOP
R2_B1_PRODUCTION_SOURCE = ACCEPTED / FROZEN
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```

## 2. Authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-B1-R8
NAME = PART A FINAL EXACT CELL + RELATIONSHIP PROOF CLOSURE
STATE = AUTHORIZED / ACTIVE
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R8-TEST-ONLY-CORRECTIVE-20260903-01
AUTHORIZATION_BASIS_HEAD = 8f52394fbadb362af790924cabf5cb1473164687
MAX_EXECUTOR_COMMITS = 1
EXECUTOR = ANTIGRAVITY
FINAL_EXECUTOR_STATE = TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Owner authorization received exactly:
`อนุมัติ D2-WP004-R2-B1-R8 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`

Single-use token. Antigravity must STOP after one pushed TEST-ONLY commit and must not self-declare PASS/CLOSED.

## 3. Accepted source freeze

Production source/profile remain frozen for R8.

```text
src/services/mbo-xlsx-template-preparer.js = FROZEN / FORBIDDEN
src/profiles/mbo-xlsx-template-profile.js = FROZEN / FORBIDDEN
```

R7 accepted and retained:
- exact SOURCE-derived row oracle;
- complete SOURCE-derived frozen package authority object;
- package-wide `.xml` / `.rels` privacy scan;
- drawing/media/formula/merge/dimension/Print_Area proof;
- owner-template execution fail-closed with no `t.skip()`.

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

## 5. Exact R8 final proof corrective

Correct ONLY the two remaining R7 blockers. Do not redesign tests or widen scope.

### A. Exact cell structural inventory — no weakening

Current R7 test drops cell attribute `t` and filters out cells with `s="1"`. R8 must remove both weakenings.

Required:
- retain `t` in normalized cell structural attributes;
- retain every parsed cell regardless of style, including `s="1"`;
- retain exact ordered cell inventory from SOURCE and OUTPUT;
- normalize only the row-number component of cell `r` while preserving column/reference topology;
- preserve all other structurally relevant cell attributes;
- deep-equal complete cell inventories for rows 1:28, inserted rows, and relocated downstream rows;
- prove no extra/missing cells of any style/type.

Do not add broad exclusions merely to make the test pass.

### B. Exact rId3 relationship tuple normalization — fail closed

SOURCE normalization may remove ONLY the exact accepted tuple:

```text
relsFilePath = xl/drawings/_rels/drawing1.xml.rels
Id = rId3
Type = http://schemas.openxmlformats.org/officeDocument/2006/relationships/image
Target = ../media/image3.png
TargetMode = null
```

Required:
- collect SOURCE relationship tuples first;
- find rId3 evidence in `xl/drawings/_rels/drawing1.xml.rels`;
- assert exactly one rId3 tuple exists;
- assert exact Type, Target and TargetMode=null;
- only after those assertions remove that exact tuple from normalized SOURCE authority;
- wrong/missing/duplicate rId3 tuple must fail proof, not be normalized away;
- OUTPUT complete relationship tuple inventory must deep-equal normalized SOURCE inventory.

Retain all R7 accepted package/media/drawing/privacy/frozen-baseline proof unchanged unless a minimal test-only adjustment is required by the two corrections above.

## 6. Required focused run

Run exactly:

`node --test tests/mbo-xlsx-template-preparer.test.js`

Required closure evidence:

```text
FAIL = 0
SKIP = 0
real owner-template integration = EXECUTED / NOT SKIPPED
N4..N10 matrix = PASS
```

Final executor report must state exact command, PASS/FAIL/SKIP counts, owner-template integration status, N4..N10 result, pushed SHA and exact changed file.

## 7. Executor protocol

```text
fresh-fetch canonical branch
-> verify HEAD equals authorization HEAD
-> read fast-start + this task + R2 design + Part A structural baseline
-> inspect source/profile READ-ONLY as needed
-> modify ONLY tests/mbo-xlsx-template-preparer.test.js
-> correct ONLY Blockers A-B
-> run focused owner-template test
-> git diff --name-only must show exactly the authorized test file
-> create exactly one TEST-ONLY commit
-> push ai/antigravity-wp002c
-> report evidence
-> STOP
```

Expected executor final status:
`R2-B1-R8 TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`

## 8. Remaining work — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = later D2 gate
D3 = HOLD UNTIL D2 PASS / CLOSED
```
