# AI ACTIVE TASK — D2-WP004-R2-PRE2-R3-R3 CORRECTIVE AUTHORIZED

Mode: **CONTROL PLANE / ANTIGRAVITY BOUNDED ONE-SHOT / OOXML-FEASIBILITY+TEST CORRECTIVE ONLY / LOW-CREDIT / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact PRE2-R3/R3-R1/R3-R2 diffs -> only the two authorized files.

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
R2_READ_ONLY_DESIGN = COMPLETE
D2_WP004_R2_PRE1 = PASS / CLOSED
D2_WP004_R2_PRE1_R1 = PASS / CLOSED
D2_WP004_R2_PRE2 = READ-ONLY DESIGN COMPLETE
D2_WP004_R2_PRE2_R1 = PASS / CLOSED AFTER CORRECTIVE
D2_WP004_R2_PRE2_R1_R1 = PASS / CLOSED
D2_WP004_R2_PRE2_R2 = PASS / CLOSED
D2_WP004_R2_PRE2_R3 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_PRE2_R3_R1 = NEEDS CORRECTIVE / NOT CLOSED
D2_WP004_R2_PRE2_R3_R2 = NEEDS CORRECTIVE / NOT CLOSED

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R3
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-PRE2-R3-R3-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-PRE2-R3-R3-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED CORRECTIVE / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

Owner authorization phrase:
`อนุมัติ D2-WP004-R2-PRE2-R3-R3 OOXML-FEASIBILITY+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Authorization token:
`D2-WP004-R2-PRE2-R3-R3-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01`

Authorization basis HEAD:
`6fde029df846ee9526be7ce08816511f4572efea`

## 2. Accepted R3/R3-R1/R3-R2 truth — MUST NOT REGRESS

```text
INTERMEDIATE_MERGES = N6 79 / N7 85 / N8 91
FINAL_MERGES = N6 79 / N7 86 / N8 93
BASE_PRIVACY = N6 432 / N7 474 / N8 516
EFFECTIVE_PRIVACY = N6 432 / N7 492 / N8 552
DIMENSIONS = A1:X35 / A1:X39 / A1:X43
SUMMARY_START = N6 31 / N7 35 / N8 39 / OBSERVED FROM FINAL OUTPUT
TITLE_MERGES = B31:J31 / B35:J35
DESCRIPTION_MERGES = B32:J32 / B36:J36
RATING_SCALE = B33:J33 / B37:J37 / STATIC
PADDING = rows 30 / 34 / 38 / PROTECTED
FORMULA_INVENTORY = 0
```

Accepted improvements that must remain:
- `validateExpandedPresentationOverlayPartB()` is a bounded production feasibility validator and is called by the positive pipeline;
- final summary row is mechanically observed from final workbook evidence;
- relationship tuples/media inventory/auxiliary Sheet1 preservation are checked against structural input;
- source bytes remain immutable;
- dimensions and Print_Area remain exact accepted values;
- no Production Renderer, semantic writer, scoring or recalculation logic exists here.

## 3. AUTHORIZED WORK PACKAGE — D2-WP004-R2-PRE2-R3-R3

```text
WORK_PACKAGE = D2-WP004-R2-PRE2-R3-R3
NAME = PART B PRESENTATION PRE-SANITIZE + DYNAMIC-OVERLAY PROOF CORRECTIVE
AUTHORIZATION = D2-WP004-R2-PRE2-R3-R3-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01
STATE = AUTHORIZED / ACTIVE
MODE = OOXML-FEASIBILITY+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

WRITABLE_FILES =
  scripts/export/mbo-xlsx-ooxml-feasibility.js
  tests/mbo-xlsx-ooxml-feasibility.test.js

EXPORT_SERVICE_CHANGE = FORBIDDEN
PROFILE_CHANGE = FORBIDDEN
PRODUCTION_RENDERER_CHANGE = FORBIDDEN
BASELINE_CHANGE_BY_EXECUTOR = FORBIDDEN
CONTROL_DOC_CHANGE_BY_EXECUTOR = FORBIDDEN
PACKAGE_CHANGE = FORBIDDEN
DIST_CHANGE = FORBIDDEN
KINTONE_WRITE = FORBIDDEN
DEPLOY = FORBIDDEN
D3 = HOLD
```

No other file may be edited.

## 4. Exact corrective contract

Correct ONLY the two remaining proof blockers. Do not redesign or broaden scope.

### A. Production pre-sanitize presentation-state validator
Create/reuse one bounded production helper used by the real positive pipeline BEFORE any blanking/sanitization.

It must validate real structural buffer/workbook state for:

```text
N7:
  B31 = exact expected blank/no-value title target
  B32 = exact expected competency-6 stale description
  B33 = exact Rating Scale static text

N8:
  B31 = exact expected blank/no-value title target
  B32 = exact expected competency-6 stale description
  B35 = exact expected blank/no-value title target
  B36 = exact expected competency-6 stale description
  B33 = exact Rating Scale static text
  B37 = exact Rating Scale static text
```

Requirements:
- positive `getExpandedPresentationPartBBuffers()` must call this helper before sanitization;
- unexpected title/stale description/Rating Scale state must fail closed before mutation;
- negative tests must mutate real structural evidence and invoke the same production helper;
- tests must prove the intended blocker reason/path, not merely any later final-overlay failure;
- no test-only backdoor.

### B. Dynamic-overlay production validation seam
The current final validator derives dynamic addresses internally from workbook/privacy topology. Add the smallest bounded production validation seam/helper needed to validate the resulting real dynamic-address evidence.

It must prove for each N:
- exact effective dynamic count;
- exact authorized expanded presentation dynamic set only;
- no unauthorized presentation dynamic address;
- Rating Scale and padding remain non-dynamic;
- Chief R:X authority is not broadened.

Authorized presentation additions are exactly:

```text
N6: none
N7: B31:J32
N8: B31:J32 + B35:J36
```

Required effective counts remain:

```text
N6 = 432
N7 = 492
N8 = 552
```

Negative tests must use malformed real/in-memory dynamic evidence passed into the same production validator/helper:
1. add one unauthorized dynamic presentation address -> reject;
2. remove/add address so count is wrong -> reject;
3. mark Rating Scale or padding dynamic -> reject;
4. no fake local count plus direct test throw.

The positive final-overlay validator must use this same validation logic.

### C. Preserve final-overlay validator behavior
Do not regress existing production-validator checks for:
- final merge set/count;
- observed final summary topology;
- Rating Scale/padding static state;
- relationship/media/reference-image/Sheet1 preservation;
- sanitized final presentation targets.

## 5. Required focused tests

Modify only `tests/mbo-xlsx-ooxml-feasibility.test.js` and prove at minimum:

1. existing relevant positive tests still pass;
2. positive pipeline calls pre-sanitize validator before blanking;
3. real structural N7 title mutation B31 fails pre-sanitize validator for title-state reason;
4. real structural N8 title mutation B35 fails pre-sanitize validator;
5. real structural N7 stale description mutation B32 fails pre-sanitize validator;
6. real structural N8 stale description mutation B36 fails pre-sanitize validator;
7. Rating Scale mutation B33/B37 fails pre-sanitize validator;
8. positive dynamic evidence validates exact counts 432/492/552;
9. unauthorized dynamic presentation address fails production dynamic validator;
10. wrong dynamic count from malformed real/in-memory dynamic evidence fails;
11. Rating Scale dynamic mutation fails;
12. padding dynamic mutation fails;
13. existing merge-range/count negatives still call production validator;
14. existing summary/package/media/Sheet1 negatives still call production validator;
15. final merges remain 79/86/93;
16. dimensions and Print_Area remain exact;
17. source bytes immutable;
18. formula inventory zero.

Forbidden proof pattern:
```text
const fakeX = ...
if (fakeX !== expected) throw new Error(expectedBlocker)
```
when the throw is not emitted by the production feasibility validator/helper under test.

Run focused:
`tests/mbo-xlsx-ooxml-feasibility.test.js`

## 6. Executor protocol

```text
fresh-fetch authorization HEAD
-> verify branch ai/antigravity-wp002c
-> read fast-start + this file + PRE2 design + exact R3/R3-R1/R3-R2 diffs
-> modify only the two authorized files
-> implement minimum corrective
-> run focused OOXML feasibility tests
-> verify git diff contains only the two authorized files
-> commit exactly once
-> push ai/antigravity-wp002c
-> report commit SHA + exact changed files + test command/result
-> STOP
```

Antigravity must NOT self-declare PASS/CLOSED.
Final executor status:
`CORRECTIVE PRE-SANITIZE + DYNAMIC PROOF COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`.

## 7. Authorization ledger

```text
D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R1-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R2-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = CONSUMED / NEEDS CORRECTIVE / DO NOT REUSE
D2-WP004-R2-PRE2-R3-R3-OOXML-FEASIBILITY-TEST-CORRECTIVE-20260902-01 = ACTIVE / ONE-SHOT / CONSUME ON ONE CORRECTIVE COMMIT
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE PRE2-R3-R3 EXACTLY, PUSH, REPORT, STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
