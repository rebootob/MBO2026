# AI ACTIVE TASK — R2-B1-R7 REVIEWED / NEAR-CLOSE / R8 PROPOSED

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
D2_WP004_R2_B1_R5 = REVIEWED / NOT CLOSED
D2_WP004_R2_B1_R6 = REVIEWED / NOT CLOSED
D2_WP004_R2_B1_R7 = REVIEWED / NEAR-CLOSE / NOT CLOSED

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

## 2. R7 identity / scope review

```text
R7_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R7-TEST-ONLY-CORRECTIVE-20260903-01
R7_AUTHORIZATION_COMMIT = 1e23629cb3e4940201d7487a5b8944600b96f9ab
R7_IMPLEMENTATION_COMMIT = e30f33695ae37a8128dcb9a37505044c58d5d173
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY ONE AUTHORIZED FILE
  tests/mbo-xlsx-template-preparer.test.js
SCOPE_REVIEW = PASS
TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
```

Accepted R7 improvements:
- circular N=4 production-output oracle removed;
- expected row structural authority now derives directly from exact owner SOURCE template;
- deterministic package authority object now includes `sheetNames`, `sheetStates`, `colsHash`, page/print authority, `sheetRels`, relationship tuples, media inventory and formula inventory;
- package authority deep-equality replaces many prior spot/conditional checks;
- drawing XML is normalized from SOURCE by removing the accepted rId3 anchor only;
- package-wide privacy scan now covers final `.xml` and `.rels` entries;
- protected/static profile mutation and same-count substitution rejection remain;
- owner-template integration remains fail-closed with no `t.skip()` path.

These are accepted. R7 is near closure but exact proof is still not fail-closed in two material places.

## 3. MATERIAL TEST BLOCKER A — cell structural authority is still weakened

Current `parseRowObjectsFromXml()` intentionally drops cell attribute `t` and then filters out every parsed cell whose style attribute is `s="1"`.

This violates the R7 authorization contract, which requires exact ordered cell structural inventory including cell type and all structurally relevant cell attributes.

Consequences:
- a wrong/missing/extra `t` cell type can pass undetected;
- any extra/missing/changed cell with style `s="1"` can be hidden from both expected and actual inventories;
- exact no-extra/no-missing cell proof is therefore incomplete.

Required next correction TEST-ONLY:
- retain `t` in normalized cell structural attributes;
- do not filter out `s="1"` cells or any style class;
- retain every structural cell from SOURCE and OUTPUT;
- normalize only the cell row-number component of `r` while preserving column/reference topology and all other structural attributes;
- deep-equal complete ordered cell inventories for rows 1:28, inserted rows and relocated downstream rows.

## 4. MATERIAL TEST BLOCKER B — rId3 package normalization is not exact-tuple fail-closed

Current `buildPackageAuthority(wbZip, true)` removes a SOURCE relationship whenever:

```text
relsFilePath = xl/drawings/_rels/drawing1.xml.rels
Id = rId3
```

It does not require the complete accepted tuple before removal.

R7 contract requires removing ONLY the exact accepted tuple:

```text
relsFilePath = xl/drawings/_rels/drawing1.xml.rels
Id = rId3
Type = http://schemas.openxmlformats.org/officeDocument/2006/relationships/image
Target = ../media/image3.png
TargetMode = null
```

Required next correction TEST-ONLY:
- locate exact SOURCE rId3 tuple;
- assert exactly one tuple exists;
- assert full Type / Target / TargetMode authority before normalization;
- remove only that exact tuple;
- any wrong/missing/duplicate tuple must fail the proof rather than be normalized away.

## 5. Runtime evidence

Repository truth exposes no combined CI status and no workflow run for R7.

Focused test remains fail-closed and must be run by executor exactly:

`node --test tests/mbo-xlsx-template-preparer.test.js`

Closure evidence must be:

```text
FAIL = 0
SKIP = 0
real owner-template integration = EXECUTED / NOT SKIPPED
N4..N10 matrix = PASS
```

## 6. Exact next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1-R8
NAME = PART A FINAL EXACT CELL + RELATIONSHIP PROOF CLOSURE
STATE = PROPOSED / NOT AUTHORIZED
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  tests/mbo-xlsx-template-preparer.test.js

SOURCE_CHANGE_AUTH = NONE
PROFILE_CHANGE_AUTH = NONE
MAX_EXECUTOR_COMMITS = 1
```

R8 must correct ONLY Blockers A-B and run the focused owner-template test. Do not redesign or widen scope.

## 7. R8 forbidden scope

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

## 8. Owner decision

No execution is authorized now.

Recommended approval phrase:
`อนุมัติ D2-WP004-R2-B1-R8 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_SOURCE = ACCEPTED / FROZEN
R2_B1_TEST_PROOF = NEAR-CLOSE / NOT CLOSED
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```
