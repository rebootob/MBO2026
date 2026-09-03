# AI ACTIVE TASK — R2-B1-R6 TEST-ONLY AUTHORIZED / ACTIVE

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
D2_WP004_R2_B1 = TEST PROOF CORRECTIVE ACTIVE / NOT CLOSED
D2_WP004_R2_B1_R4 = SOURCE REVIEW PASS / SOURCE FROZEN
D2_WP004_R2_B1_R5 = REVIEWED / TEST PROOF INCOMPLETE / NOT CLOSED
D2_WP004_R2_B1_R6 = AUTHORIZED / ACTIVE / TEST-ONLY

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B1-R6
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-B1-R6-TEST-ONLY-CORRECTIVE-20260903-01
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
WORK_PACKAGE = D2-WP004-R2-B1-R6
NAME = PART A EXACT PROOF MATRIX COMPLETION
STATE = AUTHORIZED / ACTIVE
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R6-TEST-ONLY-CORRECTIVE-20260903-01
AUTHORIZATION_BASIS_HEAD = 1b1be5495508ad0b80eec5166bca67d28f2ba196
MAX_EXECUTOR_COMMITS = 1
EXECUTOR = ANTIGRAVITY
FINAL_EXECUTOR_STATE = TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Owner authorization received exactly:
`อนุมัติ D2-WP004-R2-B1-R6 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`

Single-use token. Antigravity must STOP after one pushed TEST-ONLY commit and must not self-declare PASS/CLOSED.

## 3. Accepted source freeze

Production source/profile are frozen for R6. Do not modify unless a new independently proven source defect appears.

```text
src/services/mbo-xlsx-template-preparer.js = FROZEN / FORBIDDEN
src/profiles/mbo-xlsx-template-profile.js = FROZEN / FORBIDDEN
```

Accepted production behavior includes exact owner SHA validation, browser-safe Part A N4..N10 preparation, Profile-driven sanitization, canonical self-closing rId3 validation/removal, post-removal no-reference checks, zero semantic writer/scoring/Part B/Kintone/deploy scope.

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

## 5. Exact R6 proof corrective

Use REAL production `preparePartATemplate()` for mutation. Test-side oracle/inspection only.

### A. Exact row structural equality — N4..N10

Replace one-way source-subset proof with deterministic deep equality.

For rows 1:28, inserted rows, and relocated downstream rows prove:
- normalized complete row-attribute object equality after removing/rewriting only row-number authority;
- exact ordered cell structural inventory deep equality;
- exact cell column/reference topology and style index/pattern;
- output cell count equals expected cell count;
- no extra cells and no missing cells;
- inserted row = exact normalized source row 28 at target row;
- downstream row = exact normalized source row at relocated row;
- no stale/lost/duplicate downstream structural identity.

Authorized sanitized values may differ only where permitted; structural identity must remain exact.

### B. Complete frozen metadata/package object — N4..N10

Build one deterministic source-derived authority object and deep-equal normalized output for:

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
complete relevant relationship tuple inventory
complete media inventory
formula inventory = EMPTY
```

Rules:
- source absence must equal output absence; no conditional skip of equality;
- keep exact merge set/count, dimensions, Print_Area;
- retain absolute paperSize=8 / orientation=landscape / scale=58;
- normalize package parity by removing ONLY accepted rId3 relationship, accepted rId3 anchor, and `xl/media/image3.png`;
- every other relevant relationship/media entry must remain exact.

### C. Privacy/profile closure

For N4..N10 prove:
- every effective sanitization address cleared;
- privacy strings from authorized source sensitive ranges absent from final sensitive cells;
- same strings absent from `xl/sharedStrings.xml`;
- same strings absent from all relevant final UTF-8 XML/text package entries; do not inspect binary media as text;
- same-count sanitization substitution rejection via real `validateMappingIntegrity()` remains;
- ADD protected/static topology mutation rejection via real `validateMappingIntegrity()`;
- caller bytes unchanged on success/failure;
- zero semantic/user writes, scoring/recalculation, Part B mutation.

### D. Owner-template execution remains fail-closed

No `t.skip()` path for missing template or SHA mismatch. Missing/wrong owner template must fail.

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

Final executor report must state exact command, PASS/FAIL/SKIP counts, real owner-template integration status, N4..N10 result, pushed SHA, and exact changed file.

## 7. Executor protocol

```text
fresh-fetch canonical branch
-> verify HEAD equals authorization HEAD
-> read fast-start + this active task + R2 design + Part A structural baseline
-> inspect source/profile READ-ONLY as needed
-> modify ONLY tests/mbo-xlsx-template-preparer.test.js
-> run focused owner-template test
-> git diff --name-only must show exactly the authorized test file
-> create exactly one TEST-ONLY commit
-> push ai/antigravity-wp002c
-> report evidence
-> STOP
```

Expected executor final status:
`R2-B1-R6 TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`

## 8. Remaining work — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = later D2 gate
D3 = HOLD UNTIL D2 PASS / CLOSED
```
