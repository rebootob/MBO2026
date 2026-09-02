# AI ACTIVE TASK — R2-B1-R4 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / BOUNDED EXECUTOR AUTHORIZED / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> exact Part A baseline/profile/B1 source+test only.

## 1. Current truth

```text
OWNER_OBJECTIVE = COMPLETE D2 TO PASS / CLOSED BEFORE D3
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R1 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R2 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R3 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R4 = AUTHORIZED / ACTIVE

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B1-R4
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-B1-R4-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-B1-R4-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-B1-R4-SOURCE-TEST-CORRECTIVE-20260903-01 / PART-A PREPARER MINIMAL CORRECTIVE ONLY
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED CORRECTIVE / ONE-SHOT / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = B1 CORRECTIVE ONLY / B2+C NOT AUTHORIZED
D3 = HOLD
```

## 2. Authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-B1-R4
NAME = PART A CANONICAL RELATIONSHIP + FROZEN BASELINE PARITY COMPLETION
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R4-SOURCE-TEST-CORRECTIVE-20260903-01
AUTHORIZATION_BASIS_HEAD = f0dd62f707ce8aaef9570f528c40e95423c04177
MAX_EXECUTOR_COMMITS = 1
EXECUTOR = ANTIGRAVITY
FINAL_EXECUTOR_STATE = CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Owner authorization received exactly:
`อนุมัติ D2-WP004-R2-B1-R4 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

The token is single-use. Antigravity must not self-declare PASS/CLOSED and must STOP immediately after one corrective implementation commit is pushed.

## 3. Prior R3 identity / accepted improvements

```text
R3_AUTHORIZATION_COMMIT = ee2cd8edcac49efd900435feed5d78381e0ee01c
R3_IMPLEMENTATION_COMMIT = 4f7ea4a4f4e84c1f8e88f2aee1ac17f4f067f0df
R3_REVIEW_STATE_COMMIT = f0dd62f707ce8aaef9570f528c40e95423c04177
R3_SCOPE_REVIEW = PASS
R3_TOKEN = CONSUMED / DO NOT REUSE
```

Preserve all accepted R3 behavior:
- exact owner SHA gate remains before workbook/package mutation;
- production remains browser-safe and Part-A-only;
- shared production helper remains used by real preparer and adversarial tests;
- exact Target `../media/image3.png`, TargetMode absent, exact embed cardinality and media existence remain enforced;
- mixed relationship evidence is accounted for;
- namespace-prefixed / duplicate / open-only malformed cases reject;
- updated drawing rels are checked for zero surviving `rId3` / `image3.png`;
- all other `.rels` are scanned for `image3.png` before media removal;
- complete merge set is source-derived and deep-compared;
- stale source tokens are checked against final sharedStrings;
- same-count sanitization substitution is tested through production profile validation;
- no semantic writer, scoring, Part B, Kintone or deploy scope expansion.

## 4. Exact writable scope

Antigravity may modify ONLY:

```text
src/services/mbo-xlsx-template-preparer.js
tests/mbo-xlsx-template-preparer.test.js
```

Forbidden:

```text
src/services/mbo-export-service.js
src/profiles/mbo-xlsx-template-profile.js
scripts/export/mbo-xlsx-ooxml-feasibility.js
tests/mbo-xlsx-ooxml-feasibility.test.js
project-docs/*
package.json
package-lock.json
dist/*
UI / integration
Part B production implementation
R2-C semantic renderer
Combined Excel
Kintone write/deploy/Live UAT
D3
```

Do not redesign the preparer. Production source change should be minimal.

## 5. R4 SOURCE CORRECTIVE — canonical self-closing rId3 only

The accepted rId3 relationship syntax is EXACTLY one canonical self-closing element:

```text
<Relationship ... Id="rId3" ... />
```

with exact authority:

```text
Id = rId3
Type = http://schemas.openxmlformats.org/officeDocument/2006/relationships/image
Target = ../media/image3.png
TargetMode = ABSENT
MEDIA = xl/media/image3.png
EXACT_EMBED = r:embed="rId3" exactly once
```

Required production change:
1. accept ONLY exactly one self-closing canonical `Relationship` element for rId3;
2. a single paired/non-self-closing `<Relationship ...></Relationship>` MUST reject even when tuple values are otherwise correct;
3. open-only, paired, namespace-prefixed, mixed-form duplicate and malformed rId3 evidence MUST reject;
4. preserve exact Type / Target / TargetMode-absent / embed-cardinality / media-existence gates;
5. preserve updated drawing rels zero-rId3/zero-image3 proof;
6. preserve all-other-rels zero-image3 proof before media removal;
7. preserve exact owner SHA and browser safety.

No broad XML framework or architecture redesign.

## 6. R4 TEST CORRECTIVE — canonical relationship proof

Using the SAME production helper used by `preparePartATemplate()`, prove at minimum:
- exact canonical self-closing rId3 = PASS;
- single paired/non-self-closing canonical-looking rId3 = REJECT;
- open-only rId3 = REJECT;
- namespace-prefixed rId3 = REJECT;
- valid self-closing + paired duplicate = REJECT;
- mixed-form duplicate = REJECT;
- wrong Type = REJECT;
- wrong Target = REJECT;
- any TargetMode = REJECT;
- missing media = REJECT;
- zero/duplicate/incidental embed cases = REJECT;
- surviving updated drawing rel reference = REJECT;
- surviving image3 reference in another `.rels` file rejects through the real preparer/package path where practical.

Assertions must identify the intended production reference-validation failure, not generic SHA rejection.

## 7. R4 TEST CORRECTIVE — complete frozen Part A row identity

Use REAL `preparePartATemplate()` for mutation. Test-side source-derived oracle/normalization is allowed.

For EVERY N=4..10, prove exact source-derived row identity:

### Rows 1:28
Deep-normalize and compare source vs output for each row, including:
- row attributes relevant to structural identity;
- exact cell reference inventory;
- cell style index / style pattern;
- row height;
- customHeight;
- customFormat where present;
- no lost/extra structural cell nodes.

Sanitized cell values/text may differ only where authorized. Structural identity must remain exact.

### Inserted rows
For each inserted row 29..(28+extraRows):
- derive expected normalized identity from exact SOURCE row 28;
- rewrite only row/cell row references to target row;
- deep-equal structural identity including cell refs, styles, row attributes, height/customHeight/customFormat.

### Downstream rows >=29
For every original source row 29..52:
- derive expected normalized relocated identity at `sourceRow + extraRows`;
- rewrite only row/cell references according to accepted relocation;
- deep-equal output row structural identity;
- prove no stale original-row structural identity remains at old location;
- prove no lost or duplicate downstream rows.

## 8. R4 TEST CORRECTIVE — complete frozen sheet/package baseline parity

Derive exact source authorities from the SHA-matching owner Part A template and deep-equal output N4..N10 after only authorized normalization.

Required matrix from `D2_PART_A_STRUCTURAL_CLOSURE.md`:

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
relationship tuples
media inventory
formula inventory = EMPTY
```

Rules:
- preserve exact absolute page authority: paperSize=8 / orientation=landscape / scale=58;
- relationship tuples must deep-equal source after removing ONLY accepted rId3 target tuple;
- media inventory must deep-equal source after removing ONLY `xl/media/image3.png`;
- drawing inventory must deep-equal source after removing ONLY accepted target anchor;
- do not replace full inventory equality with rId1/rId2/rId4 presence spot-checks.

Keep existing exact merge-set, dimensions and Print_Area proof.

## 9. R4 TEST CORRECTIVE — privacy/profile completion

For EVERY N4..N10 retain/prove:
1. every `effectiveSanitizationRanges` address is cleared;
2. stale sensitive source tokens absent from final sensitive cells;
3. stale sensitive source tokens absent from final `xl/sharedStrings.xml`;
4. stale sensitive source tokens absent from relevant final XML/package text required by frozen privacy proof, excluding source-authorized static text where explicitly not sensitive;
5. same-count sanitization substitution rejects via production `validateMappingIntegrity()`;
6. protected/static topology mutation rejects via production `validateMappingIntegrity()`;
7. caller input bytes remain identical on success and failure;
8. workbook-wide formula inventory = zero;
9. zero semantic/user writes;
10. zero scoring/recalculation;
11. zero Part B mutation.

Do not create a test-only fake validator.

## 10. Real-template runtime evidence

Run exactly:

`node --test tests/mbo-xlsx-template-preparer.test.js`

The exact owner Part A template MUST be present and SHA matching.

Final executor report MUST state:
- exact command;
- PASS count;
- FAIL count;
- SKIP count;
- real owner-template integration = EXECUTED / NOT SKIPPED;
- N4..N10 matrix = PASS / FAIL.

If real-template integration skips, report the limitation and do NOT claim closure.

## 11. Executor protocol

```text
fresh-fetch canonical branch
-> verify HEAD equals Control Plane authorization HEAD
-> read D2_REVIEW_FAST_START.md
-> read this AI_ACTIVE_TASK.md
-> read R2 renderer/sanitizer design
-> read D2_PART_A_STRUCTURAL_CLOSURE.md
-> inspect only exact Part A profile/B1 source+test/reference proof needed
-> correct only the two authorized files
-> run focused real-template tests
-> verify git diff contains only two authorized files
-> exactly one corrective implementation commit
-> push canonical branch
-> report SHA + exact files + PASS/FAIL/SKIP + real-template execution status
-> STOP
```

Do not modify control docs. Do not begin R2-B2/R2-C. Do not deploy. Do not perform Kintone writes.

Expected executor final status:
`R2-B1-R4 CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`

## 12. Remaining work — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = later D2 gate
D2_FINAL_CLOSURE = after production preparer + semantic renderer + parity closure
D3 = HOLD UNTIL D2 PASS / CLOSED
```
