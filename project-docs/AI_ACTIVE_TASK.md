# AI ACTIVE TASK — R2-B1-R7 TEST-ONLY AUTHORIZED / ACTIVE

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
D2_WP004_R2_B1_R6 = REVIEWED / TEST PROOF INCOMPLETE / NOT CLOSED
D2_WP004_R2_B1_R7 = AUTHORIZED / ACTIVE / TEST-ONLY

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B1-R7
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-B1-R7-TEST-ONLY-CORRECTIVE-20260903-01
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
WORK_PACKAGE = D2-WP004-R2-B1-R7
NAME = PART A SOURCE-DERIVED EXACT PROOF CLOSURE
STATE = AUTHORIZED / ACTIVE
MODE = TEST-ONLY CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R7-TEST-ONLY-CORRECTIVE-20260903-01
AUTHORIZATION_BASIS_HEAD = d9e63bc2d8666e988ef7c68aca22c127437972a5
MAX_EXECUTOR_COMMITS = 1
EXECUTOR = ANTIGRAVITY
FINAL_EXECUTOR_STATE = TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Owner authorization received exactly:
`อนุมัติ D2-WP004-R2-B1-R7 TEST-ONLY CORRECTIVE ตามขอบเขตที่เสนอ`

Single-use token. Antigravity must STOP after one pushed TEST-ONLY commit and must not self-declare PASS/CLOSED.

## 3. Accepted source freeze

Production source/profile remain frozen for R7.

```text
src/services/mbo-xlsx-template-preparer.js = FROZEN / FORBIDDEN
src/profiles/mbo-xlsx-template-profile.js = FROZEN / FORBIDDEN
```

Do not modify production source/profile unless a new independently proven defect exists and a new owner authorization is issued.

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

## 5. Exact R7 proof corrective

Use real production `preparePartATemplate()` ONLY for the MUTATION UNDER TEST.

**CRITICAL ORACLE RULE:** expected structural/package authority MUST come directly from the exact SHA-matching OWNER SOURCE template. Do not use any `preparePartATemplate()` output as the oracle/baseline for expected structure.

### A. SOURCE-derived exact row structural equality — N4..N10

Parse exact SOURCE `sheet1.xml` into deterministic normalized structural row objects.

For each source row object retain complete structurally relevant authority:
- all row attributes as a deterministic attribute map, excluding only row-number authority when normalizing;
- exact ordered cell inventory;
- exact cell reference/column topology;
- all structurally relevant cell attributes, including style/type and any other structural attributes present in SOURCE;
- do not use cell values/text as structural equality authority where sanitization may lawfully change them.

For every N=4..10:
- rows 1:28 expected directly from SOURCE rows 1:28;
- inserted rows expected directly from SOURCE row 28 normalized to each target row;
- downstream rows expected directly from SOURCE rows 29..52 normalized to `sourceRow + extraRows`;
- deep-equal complete normalized expected vs actual row objects;
- exact cell counts must match;
- no extra/missing cells;
- no lost/duplicate downstream rows;
- no stale unrelocated downstream structural identity.

Do not derive row oracle from N=4 prepared output.

### B. One complete SOURCE-derived frozen metadata/package object

Build one deterministic authority object from exact SOURCE and one normalized object from each N4..N10 output. Deep-equal them after only explicitly authorized normalizations.

The object MUST include:

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

Rules:
- source absence must be represented explicitly as null/false/empty and compared, never skipped conditionally;
- derive `colsHash` deterministically from exact cols XML/bytes using a stable local test-side hash;
- parse `sheetStates` directly from workbook XML, including absent/default state semantics deterministically;
- `sheetRels` absence/presence must compare explicitly;
- collect relationship tuples from ALL relevant package `.rels` entries as deterministic tuples:
  `relsFilePath, Id, Type, Target, TargetMode-or-null`;
- normalize SOURCE relationship tuples by removing ONLY the accepted drawing1 rId3 image tuple;
- normalize SOURCE media inventory by removing ONLY `xl/media/image3.png`;
- normalize SOURCE drawing inventory by removing ONLY the accepted rId3 target anchor;
- all other relationship/media/drawing inventory must remain exact;
- formula inventory must remain empty workbook-wide;
- keep exact merge set/count, dimensions and Print_Area checks;
- retain absolute page authority `paperSize=8`, `orientation=landscape`, `scale=58`.

### C. Package-wide privacy proof

Collect sensitive tokens ONLY from exact SOURCE addresses covered by authorized Part A sensitive/effective sanitization authority.

For every N4..N10 final package:
- prove every effective sanitization address cleared;
- enumerate relevant UTF-8 XML/text package entries deterministically;
- scan all relevant `.xml`, `.rels`, and other UTF-8 text entries;
- do not decode binary media as text;
- prove sensitive tokens absent from every scanned final package text entry;
- if a token also exists as authorized static/non-sensitive SOURCE text outside sensitive authority, exclude it only with exact deterministic SOURCE evidence; no broad token exemptions.

Retain:
- stale token sharedStrings proof;
- same-count sanitization substitution rejection through real `validateMappingIntegrity()`;
- protected/static topology mutation rejection through real `validateMappingIntegrity()`;
- caller bytes immutable on success/failure;
- zero semantic/user writes, scoring/recalculation and Part B mutation.

### D. Owner-template execution remains fail-closed

No `t.skip()` path. Missing exact owner template or SHA mismatch MUST fail the focused test.

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
-> run focused owner-template test
-> git diff --name-only must show exactly the authorized test file
-> create exactly one TEST-ONLY commit
-> push ai/antigravity-wp002c
-> report evidence
-> STOP
```

Expected executor final status:
`R2-B1-R7 TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`

## 8. Remaining work — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = later D2 gate
D3 = HOLD UNTIL D2 PASS / CLOSED
```
