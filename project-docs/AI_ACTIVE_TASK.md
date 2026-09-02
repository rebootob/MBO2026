# AI ACTIVE TASK — R2-B1-R2 AUTHORIZED / ACTIVE

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
D2_WP004_R2_B1_R2 = AUTHORIZED / ACTIVE

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B1-R2
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-B1-R2-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-B1-R2-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = D2-WP004-R2-B1-R2-SOURCE-TEST-CORRECTIVE-20260903-01 / PART-A PREPARER CORRECTIVE ONLY
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED CORRECTIVE / ONE-SHOT / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = B1 CORRECTIVE ONLY / B2+C NOT AUTHORIZED
D3 = HOLD
```

## 2. Authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-B1-R2
NAME = PART A EXACT REFERENCE VALIDATOR + REACHABLE PROOF CORRECTIVE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R2-SOURCE-TEST-CORRECTIVE-20260903-01
AUTHORIZATION_BASIS_HEAD = 89370c25630c53b2da963ea0aab15c8801e6c276
MAX_EXECUTOR_COMMITS = 1
EXECUTOR = ANTIGRAVITY
FINAL_EXECUTOR_STATE = CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Owner authorization received exactly:
`อนุมัติ D2-WP004-R2-B1-R2 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

The token is single-use. Antigravity must not self-declare PASS/CLOSED and must STOP immediately after one corrective implementation commit is pushed.

## 3. Prior R1 identity / accepted improvements

```text
R1_AUTHORIZATION_COMMIT = fba306d1ce2dc3b318495a0e72bb4e4728353f28
R1_IMPLEMENTATION_COMMIT = 972c2a8b5f71bd661593a6856c1d1c25928af279
R1_REVIEW_STATE_COMMIT = 89370c25630c53b2da963ea0aab15c8801e6c276
R1_SCOPE_REVIEW = PASS
R1_TOKEN = CONSUMED / DO NOT REUSE
```

Preserve these accepted R1 improvements:
- production remains browser-safe with no Node fs/path/crypto import and no feasibility import;
- exact owner-template SHA remains validated before workbook/package mutation;
- caller bytes remain copied before mutation;
- Part A only, N4..N10, sentinel-free;
- reference-image handling now parses relationship evidence instead of substring-only deletion;
- media existence is checked before removal;
- workbook-wide zero-formula test coverage exists;
- rowRefs / merge count / dimension / Print_Area / page-setup coverage improved;
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

## 5. R2 SOURCE CORRECTIVE — exact reachable reference validator

Do NOT weaken or bypass the exact owner-template SHA gate.

Production exact accepted reference tuple is ONLY:

```text
Id = rId3
Type = http://schemas.openxmlformats.org/officeDocument/2006/relationships/image
Target = ../media/image3.png
TargetMode = ABSENT
MEDIA = xl/media/image3.png
EXACT_EMBED = r:embed="rId3" exactly once globally in accepted drawing anchor evidence
```

Required source correction:
1. accept ONLY exact Target `../media/image3.png`; `media/image3.png` must reject;
2. TargetMode attribute must be absent entirely; `Internal`, `External`, or any value must reject;
3. require exactly one parsed Relationship element whose Id is exactly `rId3`;
4. require exact canonical image Type and exact Target tuple;
5. require exactly one exact `r:embed="rId3"` occurrence and exactly one enclosing accepted drawing anchor;
6. reject duplicate/missing/malformed/non-self-closing rId3 relationship evidence rather than silently ignoring it;
7. require exact media path to exist before removal;
8. preserve no-remaining-image3-reference proof after relationship removal;
9. preserve unrelated relationship/media/drawing inventory after normalizing only the accepted target removal;
10. preserve exact owner SHA, browser safety, zero formulas, zero semantic writes and Part A-only boundary.

### Required reachable production helper

Extract the smallest browser-safe pure production helper used by the REAL preparer to validate reference-image evidence after SHA validation.

The helper may accept only the minimum evidence needed, for example:
- drawing XML;
- drawing relationships XML;
- media path existence / relationship inventory evidence.

Rules:
- `preparePartATemplate()` MUST call this SAME production helper;
- synthetic adversarial tests MUST call this SAME helper directly;
- no duplicate test-side validator;
- no bypass of SHA inside `preparePartATemplate()`;
- helper must fail with specific/reference-validation errors so tests can prove the intended path rather than generic SHA mismatch.

## 6. R2 TEST CORRECTIVE — reachable adversarial proof

Focused command:
`node --test tests/mbo-xlsx-template-preparer.test.js`

Adversarial tests must exercise the shared production reference validator directly for at least:
- missing rId3 relationship;
- duplicate rId3 relationship;
- wrong relationship Type;
- wrong Target `media/image3.png`;
- another wrong Target;
- TargetMode=`Internal`;
- TargetMode=`External`;
- missing media evidence;
- zero exact embeds;
- duplicate exact embeds in one anchor;
- duplicate exact embeds across anchors;
- incidental rId3 text without exact embed;
- remaining image3.png reference/orphan condition.

Assertions must distinguish the intended reference-validator failure from SHA mismatch.

## 7. R2 TEST CORRECTIVE — complete Part A structural/package proof

Using the real production preparer for mutation and test-side oracle/inspection only, prove N4..N10:
1. exact numeric rowRefs sequence derived from source baseline;
2. rowRefs uniqueness and no unexpected row nodes;
3. rows 1:28 structural identity preserved against source baseline, including cell refs/style pattern/row height/custom-height behavior;
4. every inserted objective row exact normalized clone of source row 28 for those dimensions;
5. every original downstream row >=29 exact relocated structural identity by N-4 with no stale/lost/duplicate identity;
6. complete expected merge inventory deep equality, not only count arithmetic;
7. declared merge count equals actual inventory length;
8. exact dimensions A1:BL52..A1:BL58;
9. exact Print_Area BJ52..BJ58;
10. page setup paperSize=8 / orientation=landscape / scale=58;
11. sheet names/states and directly relevant frozen metadata required by `D2_PART_A_STRUCTURAL_CLOSURE.md`;
12. every Profile `effectiveSanitizationRanges` address sanitized;
13. stale sensitive tokens collected pre-sanitize absent from final cells/sharedStrings/package evidence where frozen proof requires;
14. same-count sanitization topology substitution and protected/static mutation reject through production Profile validation;
15. exact normalized target reference removal;
16. COMPLETE unrelated drawing relationship/media inventory equality after removing only rId3/image3;
17. workbook-wide formula inventory exactly zero;
18. caller bytes identical on success and failure;
19. no semantic/user writes, scoring/recalculation or Part B mutation.

Tests may reuse existing feasibility helpers ONLY as TEST-SIDE inspection/oracle support if useful. They must not import feasibility code into production and must not duplicate production mutation logic as the implementation path.

## 8. Real-template runtime evidence

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

## 9. Executor protocol

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
`R2-B1-R2 CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`

## 10. Remaining work — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = later D2 gate
D2_FINAL_CLOSURE = after production preparer + semantic renderer + parity closure
D3 = HOLD UNTIL D2 PASS / CLOSED
```
