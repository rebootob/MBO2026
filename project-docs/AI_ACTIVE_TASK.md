# AI ACTIVE TASK — R2-B1-R3 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / BOUNDED EXECUTOR AUTHORIZED / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> directly relevant Part A baseline/profile/B1 source+test only.

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
D2_XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R1 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R2 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_B1_R3 = AUTHORIZED / ACTIVE

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B1-R3
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-B1-R3-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-B1-R3-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-B1-R3-SOURCE-TEST-CORRECTIVE-20260903-01 / PART-A PREPARER CORRECTIVE ONLY
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED CORRECTIVE / ONE-SHOT / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = B1 CORRECTIVE ONLY / B2+C NOT AUTHORIZED
D3 = HOLD
```

## 2. Authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-B1-R3
NAME = PART A COVERAGE-COMPLETE REFERENCE + DEEP PARITY CORRECTIVE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R3-SOURCE-TEST-CORRECTIVE-20260903-01
AUTHORIZATION_BASIS_HEAD = c5fdfd6a48772660d28c388c3f2288bfe80327ba
MAX_EXECUTOR_COMMITS = 1
EXECUTOR = ANTIGRAVITY
FINAL_EXECUTOR_STATE = CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Owner authorization received exactly:
`อนุมัติ D2-WP004-R2-B1-R3 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

The token is single-use. Antigravity must not self-declare PASS/CLOSED and must STOP immediately after one corrective implementation commit is pushed.

## 3. Prior R2 identity / accepted improvements

```text
R2_AUTHORIZATION_COMMIT = 5b2f81d1c3353e7333d7d9d59e767c75e307ec41
R2_IMPLEMENTATION_COMMIT = ffb76e9d92a66eeeb268e648f3433db0781e893e
R2_REVIEW_STATE_COMMIT = c5fdfd6a48772660d28c388c3f2288bfe80327ba
R2_SCOPE_REVIEW = PASS
R2_TOKEN = CONSUMED / DO NOT REUSE
```

Preserve these accepted R2 improvements:
- production remains browser-safe; no Node fs/path/crypto import and no feasibility import;
- exact owner-template SHA validation remains before workbook/package mutation;
- caller bytes are copied before mutation;
- Part A only, N4..N10, sentinel-free;
- exact reference Target is `../media/image3.png` only;
- any TargetMode attribute is rejected;
- exact embed count checks exist;
- production reference-image logic is shared through `validateAndRemoveReferenceImage()`;
- real preparer calls that same helper after SHA validation;
- adversarial tests call the same production helper directly, so SHA does not mask the intended validator path;
- workbook-wide formula scan remains in focused integration test;
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

No redesign and no broad generic framework.

## 5. R3 SOURCE CORRECTIVE — coverage-complete relationship validation

Do NOT weaken or bypass the exact owner-template SHA gate.

Production exact accepted reference tuple remains ONLY:

```text
Id = rId3
Type = http://schemas.openxmlformats.org/officeDocument/2006/relationships/image
Target = ../media/image3.png
TargetMode = ABSENT
MEDIA = xl/media/image3.png
EXACT_EMBED = r:embed="rId3" exactly once globally in accepted drawing anchor evidence
```

Required source correction:
1. relationship parsing/validation must account for every Relationship element/evidence in `drawing1.xml.rels`, not only self-closing `<Relationship .../>` forms;
2. reject malformed/non-self-closing/namespace-prefixed/duplicate rId3 relationship evidence rather than silently ignoring it;
3. require exactly one canonical rId3 relationship tuple before mutation;
4. after removing the accepted target relationship, explicitly prove UPDATED `drawing1.xml.rels` contains ZERO `rId3` and ZERO `image3.png` references;
5. then scan all other `.rels` files and prove ZERO `image3.png` references before removing media;
6. retain exact Type/Target/TargetMode-absent/embed-cardinality/media-existence validation;
7. preserve unrelated relationship/media/drawing inventory after normalizing only accepted target removal;
8. preserve browser safety, exact SHA gate, zero formulas, zero semantic writes and Part A-only boundary.

The existing shared production helper may be strengthened; do not create a parallel validator or broad XML framework unless strictly necessary.

## 6. R3 TEST CORRECTIVE — parser/post-removal fail-closed proof

Focused tests must call the SAME production helper used by the preparer and add adversarial cases for at minimum:
- valid canonical self-closing rId3 relationship = PASS;
- valid rId3 + non-self-closing duplicate rId3 = REJECT;
- malformed/open-only rId3 evidence = REJECT;
- namespace-prefixed rId3 relationship evidence = REJECT unless explicitly canonicalized and still exact/fail-closed;
- duplicate rId3 in mixed syntactic forms = REJECT;
- surviving rId3/image3 reference in updated `drawing1.xml.rels` = REJECT;
- surviving image3 reference in another `.rels` file = REJECT through the real preparer/package path where practical;
- existing wrong Type/Target/TargetMode/missing media/embed-cardinality cases remain passing.

Assertions must identify the intended reference-validation failure, not generic SHA rejection.

## 7. R3 TEST CORRECTIVE — deep frozen Part A structural parity

Use the REAL `preparePartATemplate()` as the mutation path and test-side inspection/oracle logic only.

For every N=4..10 prove against the exact source baseline:
1. exact numeric rowRefs sequence and uniqueness;
2. rows 1:28 exact normalized structural identity, including cell references, cell style indices/pattern, row height and custom-height behavior;
3. every inserted objective row exact normalized structural clone of source row 28 for those same dimensions;
4. every original downstream row >=29 exact normalized structural identity relocated by N-4, with no stale/lost/duplicate row identity;
5. complete expected merge SET deep equality derived from source baseline plus accepted row-28 clone/shift rules — count-only arithmetic is insufficient;
6. declared merge count equals exact merge inventory length;
7. exact dimensions A1:BL52..A1:BL58;
8. exact Print_Area BJ52..BJ58;
9. page setup paperSize=8 / orientation=landscape / scale=58;
10. sheet names, sheet state and directly relevant frozen metadata required by `D2_PART_A_STRUCTURAL_CLOSURE.md` remain preserved.

Do not duplicate production mutation logic as the implementation under test; deriving expected normalized identities in test-side oracle code is allowed.

## 8. R3 TEST CORRECTIVE — privacy/package parity

For N4..N10 prove:
1. every Profile `effectiveSanitizationRanges` address is cleared;
2. collect stale sensitive string tokens from the exact source template before sanitization and prove those tokens are absent from final sensitive cells, final `xl/sharedStrings.xml`, and relevant final XML/package text where frozen privacy proof requires purge;
3. same-count sanitization topology substitution rejects through production `validateMappingIntegrity()`/Profile validation, not a test-only throw;
4. protected/static topology mutation rejects through production Profile validation;
5. capture complete source drawing relationship inventory + media inventory + relevant drawing inventory, normalize by removing ONLY accepted rId3/image3 target, and deep-equal against final output inventory;
6. rId1/rId2 branding and every other non-target relationship/media entry remain exact after normalization;
7. workbook-wide formula inventory remains exactly zero;
8. caller bytes remain identical on success and failure;
9. zero semantic/user writes, scoring/recalculation or Part B mutation.

## 9. Real-template runtime evidence

Antigravity must run:

`node --test tests/mbo-xlsx-template-preparer.test.js`

with the exact owner Part A template present and SHA matching.

Final executor report must state explicitly:
- exact command;
- pass count;
- fail count;
- skip count;
- real owner-template integration = EXECUTED / NOT SKIPPED;
- N4..N10 matrix = PASS/FAIL.

If the owner template is unavailable or integration skips, report that limitation and do not claim closure.

## 10. Executor protocol

```text
fresh-fetch canonical branch
-> verify HEAD equals Control Plane authorization HEAD
-> read D2_REVIEW_FAST_START.md
-> read this AI_ACTIVE_TASK.md
-> read R2 renderer/sanitizer design
-> inspect only relevant Part A baseline/profile/B1 source+test/reference proof
-> correct only two authorized files
-> run focused real-template tests
-> verify git diff contains only two authorized files
-> exactly one corrective implementation commit
-> push canonical branch
-> report SHA + exact files + pass/fail/skip + real-template execution status
-> STOP
```

Do not modify control docs. Do not begin R2-B2/R2-C. Do not deploy. Do not perform Kintone writes.

Expected executor final status:
`R2-B1-R3 CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`

## 11. Remaining work — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = later D2 gate
D2_FINAL_CLOSURE = after production preparer + semantic renderer + parity closure
D3 = HOLD UNTIL D2 PASS / CLOSED
```
