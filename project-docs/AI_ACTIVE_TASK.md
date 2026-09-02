# AI ACTIVE TASK — R2-B1-R5 TEST-ONLY AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / TEST-ONLY / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then the R2 renderer/sanitizer design, `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`, and only exact Part A source/profile/test evidence needed.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = TEST PROOF CORRECTIVE ACTIVE / NOT CLOSED
D2_WP004_R2_B1_R4 = SOURCE REVIEW PASS / SOURCE FROZEN / TEST PROOF INCOMPLETE
D2_WP004_R2_B1_R5 = AUTHORIZED / ACTIVE / TEST-ONLY

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B1-R5
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-B1-R5-TEST-ONLY-CORRECTIVE-20260903-01
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
WORK_PACKAGE = D2-WP004-R2-B1-R5
NAME = PART A FROZEN PROOF CLOSURE
STATE = AUTHORIZED / ACTIVE
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R5-TEST-ONLY-CORRECTIVE-20260903-01
AUTHORIZATION_BASIS_HEAD = 99de59c6e3d4cb2f64f78879b2eade4b89dd1d62
MAX_EXECUTOR_COMMITS = 1
EXECUTOR = ANTIGRAVITY
FINAL_EXECUTOR_STATE = TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Owner authorization received exactly:
`อนุมัติ D2-WP004-R2-B1-R5 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`

This authorization is single-use. Antigravity must STOP after one pushed TEST-ONLY commit and must not self-declare PASS/CLOSED.

## 3. R4 accepted source freeze

```text
R4_AUTHORIZATION_COMMIT = 83928aff4bae8d8e1160897fbe78524f856e996f
R4_IMPLEMENTATION_COMMIT = fc9b1a87f3883c49eb30f918189c679f5a1aa411
R4_REVIEW_STATE_COMMIT = 99de59c6e3d4cb2f64f78879b2eade4b89dd1d62
R4_SCOPE_REVIEW = PASS
R4_SOURCE_REVIEW = PASS / ACCEPTED / FROZEN
```

Do not modify `src/services/mbo-xlsx-template-preparer.js` in R5. Accepted production behavior includes exact owner SHA validation, browser-safe Part A N4..N10 preparation, Profile-driven sanitization, canonical self-closing rId3 relationship validation/removal, post-removal no-reference checks, zero semantic writer/scoring/Part B/Kintone/deploy scope.

## 4. Writable scope

Writable file ONLY:

```text
tests/mbo-xlsx-template-preparer.test.js
```

Forbidden in R5:

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

## 5. Exact R5 proof corrective

Use the REAL production `preparePartATemplate()` for mutation. Test-side oracle/inspection only.

For every N=4..10, complete all remaining proof:

1. **Exact row structural equality**
   - rows 1:28: deep-equal normalized row attribute map and exact ordered cell structural inventory;
   - prove exact cell reference/column topology and style pattern;
   - prove no extra cells and no missing cells;
   - inserted rows: exact normalized source-row-28 clone at each target row;
   - downstream rows: exact source identity relocated by `extraRows`, with no stale/lost/duplicate structure.

2. **Complete frozen metadata/package matrix**
   Derive a deterministic source authority object and deep-equal output for:
   `sheetNames`, `sheetStates`, `colsHash`, `showGridLines`, `pageMargins`, `paperSize`, `orientation`, `scale`, `fitToPage`, `horizontalCentered`, `verticalCentered`, `sheetProtection`, `sheetRels`, relationship tuple inventory, media inventory, and empty formula inventory.
   Source absence must equal output absence; do not skip equality when tags are absent.
   Keep exact merge set, dimensions, Print_Area, and paperSize=8 / landscape / scale=58.
   Normalize package parity by removing only accepted rId3/image3 target artifacts.

3. **Privacy/profile proof**
   - every effective sanitization address cleared;
   - source privacy strings collected from authorized sensitive ranges absent from final sensitive cells, sharedStrings, and relevant final UTF-8 XML/text entries;
   - same-count sanitization substitution rejects via production `validateMappingIntegrity()`;
   - protected/static topology mutation rejects via production `validateMappingIntegrity()`;
   - caller bytes unchanged on success/failure;
   - zero semantic/user writes, scoring/recalculation, and Part B mutation.

4. **Owner-template execution must fail closed, never skip**
   Focused owner-template integration must NOT use `t.skip()` for missing template or SHA mismatch. Missing/wrong owner template must fail the focused test explicitly.

## 6. Required focused run

Run exactly:

`node --test tests/mbo-xlsx-template-preparer.test.js`

Expected closure evidence:

```text
FAIL = 0
SKIP = 0
real owner-template integration = EXECUTED / NOT SKIPPED
N4..N10 matrix = PASS
```

Final executor report must state exact command, PASS/FAIL/SKIP counts, real owner-template integration status, N4..N10 result, pushed SHA, and exact changed file.

## 7. Executor protocol

```text
fresh-fetch canonical branch
-> verify HEAD equals authorization HEAD
-> read fast-start + this active task + R2 design + Part A structural baseline
-> inspect source/profile read-only as needed
-> modify ONLY tests/mbo-xlsx-template-preparer.test.js
-> run focused owner-template test
-> git diff --name-only must show exactly the authorized test file
-> create exactly one TEST-ONLY commit
-> push ai/antigravity-wp002c
-> report evidence
-> STOP
```

Expected executor final status:
`R2-B1-R5 TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`

## 8. Remaining work — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = later D2 gate
D3 = HOLD UNTIL D2 PASS / CLOSED
```
