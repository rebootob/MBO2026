# AI ACTIVE TASK — R2-B1-R6 REVIEWED / TEST PROOF STILL INCOMPLETE / R7 PROPOSED

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
D2_WP004_R2_B1 = NEEDS TEST-ONLY CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R4 = SOURCE REVIEW PASS / SOURCE FROZEN
D2_WP004_R2_B1_R5 = REVIEWED / TEST PROOF INCOMPLETE / NOT CLOSED
D2_WP004_R2_B1_R6 = REVIEWED / TEST PROOF INCOMPLETE / NOT CLOSED

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

## 2. R6 identity / scope review

```text
R6_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R6-TEST-ONLY-CORRECTIVE-20260903-01
R6_AUTHORIZATION_COMMIT = 3f3bb0de929a1f2d07b1522f9b4fcc9fb4520f7b
R6_IMPLEMENTATION_COMMIT = 1c9addb804faaf0b241859b2358dcb33993b09a4
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY ONE AUTHORIZED FILE
  tests/mbo-xlsx-template-preparer.test.js
SCOPE_REVIEW = PASS
TOKEN_STATE = CONSUMED / DO NOT REUSE
GITHUB_COMBINED_STATUS = NONE
GITHUB_WORKFLOW_RUNS = NONE
```

Accepted R6 improvements:
- protected/static topology mutation now rejects through real `validateMappingIntegrity()`;
- row comparisons now use `deepEqual()` for selected row attributes and selected cell inventory instead of source-subset `.find()` checks;
- `fitToPage` presence/absence comparison was added;
- sheetProtection presence/absence comparison is unconditional;
- owner-template integration remains fail-closed with no `t.skip()` path.

These improvements are accepted but do not satisfy the full R6 authorization contract.

## 3. MATERIAL TEST BLOCKER A — row oracle is circular, not exact SOURCE-derived

R6 builds `baseRowObjectsMap` by first calling real production `preparePartATemplate(templateBytes, { objectiveCount: 4 })` and then using that production output as the structural oracle for N4..N10.

This is not an independent exact SOURCE-derived oracle. A structural defect in the preparer that is already present in N=4 can be reproduced in all later outputs and therefore pass the test.

Required next proof:
- derive row structural authority directly from the exact SHA-matching SOURCE template OOXML;
- normalize only authorized sanitization/value differences and row/cell row-number relocation;
- do not derive expected structural topology from any `preparePartATemplate()` output.

## 4. MATERIAL TEST BLOCKER B — normalized row identity is still partial

Current `parseRowObjects()` stores only selected row fields (`height`, `customHeight`, `customFormat`, row style index) and cells as `{col, style}`.

R6 contract requires deterministic complete structural identity, including all structurally relevant row attributes and exact ordered cell structural inventory. Current proof can miss an unexpected row attribute or unexpected cell structural attribute/type while still passing.

Required next proof:
- parse and normalize the complete row attribute map, excluding/rewriting only row-number authority;
- parse the exact ordered cell structural inventory with cell reference topology and all structurally relevant cell attributes required by the frozen baseline;
- deep-equal expected vs actual complete normalized objects;
- prove no extra/missing cells and no stale/lost/duplicate downstream structure.

## 5. MATERIAL TEST BLOCKER C — frozen metadata/package object still incomplete

R6 still does not build and deep-equal one complete deterministic frozen authority object.

Remaining gaps include:
- `sheetStates` still not asserted;
- `colsHash` still not explicitly derived/proven as the frozen authority field;
- `pageMargins` and `printOptions` remain guarded by `if (sourceTag)` and do not prove source-absence equals output-absence;
- `sheetRels` remains conditionally checked;
- complete relationship tuple inventory across all relevant package `.rels` files is not collected/deep-compared;
- drawing relationship equality remains focused on `drawing1.xml.rels` rather than the complete normalized package relationship authority.

R7 must construct one source-derived object and deep-equal normalized output for every N4..N10:

```text
sheetNames
sheetStates
colsHash
showGridLines
pageMargins
paperSize
orientation
scale
fitToPage
horizontalCentered
verticalCentered
sheetProtection
sheetRels
relationshipTuples
mediaInventory
formulaInventory
```

Source absence must be represented and compared explicitly.

## 6. MATERIAL TEST BLOCKER D — package-wide privacy proof still incomplete

R6 still checks stale sensitive tokens only in sensitive cells, `xl/sharedStrings.xml`, and `xl/worksheets/sheet1.xml`.

Authorization required scanning all relevant final UTF-8 XML/text package entries while excluding binary media.

Required next proof:
- enumerate relevant final package XML/text entries deterministically;
- scan each for sensitive tokens collected only from authorized SOURCE sensitive ranges;
- exclude a token only when exact SOURCE evidence proves it is also authorized static/non-sensitive text outside the sensitive authority;
- no broad exemptions.

## 7. Runtime evidence

Owner-template integration cannot silently skip, which is accepted. Repository truth exposes no combined CI status and no workflow run for R6.

For closure executor must run exactly:

`node --test tests/mbo-xlsx-template-preparer.test.js`

and report:

```text
FAIL = 0
SKIP = 0
real owner-template integration = EXECUTED / NOT SKIPPED
N4..N10 matrix = PASS
```

## 8. Exact next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1-R7
NAME = PART A SOURCE-DERIVED EXACT PROOF CLOSURE
STATE = PROPOSED / NOT AUTHORIZED
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  tests/mbo-xlsx-template-preparer.test.js

SOURCE_CHANGE_AUTH = NONE
PROFILE_CHANGE_AUTH = NONE
MAX_EXECUTOR_COMMITS = 1
```

R7 must correct ONLY Blockers A-D. Production source/profile remain frozen.

## 9. R7 forbidden scope

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

## 10. Owner decision

No execution is authorized now.

Recommended approval phrase:
`อนุมัติ D2-WP004-R2-B1-R7 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_SOURCE = ACCEPTED / FROZEN
R2_B1_TEST_PROOF = NOT CLOSED
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```
