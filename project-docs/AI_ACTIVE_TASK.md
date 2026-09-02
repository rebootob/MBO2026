# AI ACTIVE TASK — D2-WP004-R2-PRE2-R3 OOXML-FEASIBILITY+TEST AUTHORIZED

Mode: **CONTROL PLANE / ANTIGRAVITY BOUNDED ONE-SHOT / OOXML-FEASIBILITY+TEST ONLY / LOW-CREDIT / NO EXPORT-SERVICE AUTH / NO PROFILE AUTH / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact feasibility source/test only.

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

ACTIVE_WORK_PACKAGE = D2-WP004-R2-PRE2-R3
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED OOXML-FEASIBILITY+TEST / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

Owner authorization phrase:
`อนุมัติ D2-WP004-R2-PRE2-R3 OOXML-FEASIBILITY+TEST ตามขอบเขตที่เสนอ`

Authorization token:
`D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01`

Authorization basis HEAD:
`1c5de89c42f7457beadaf96a9e033b22b9bb6661`

## 2. Frozen dependencies

Accepted Template Profile authority:

```text
SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

b7 TITLE = B31
b7 DESCRIPTION = B32
b7 TITLE_MERGE = B31:J31
b7 DESCRIPTION_MERGE = B32:J32
b7 RATING_SCALE = B33:J33 / STATIC
b7 PADDING_ROW = 34 / PROTECTED

b8 TITLE = B35
b8 DESCRIPTION = B36
b8 TITLE_MERGE = B35:J35
b8 DESCRIPTION_MERGE = B36:J36
b8 RATING_SCALE = B37:J37 / STATIC
b8 PADDING_ROW = 38 / PROTECTED
```

Accepted secured projection authority:

```text
b7 exact COMP_LEAD
  presentationTitle = 7. Leadership & People Management
  presentationDescription = exact nonblank item.description
b8 exact COMP_STRAT
  presentationTitle = 8. Strategy & Coaching
  presentationDescription = exact nonblank item.description
```

Do not change Export Service or Template Profile in this WP.

## 3. AUTHORIZED WORK PACKAGE — D2-WP004-R2-PRE2-R3

```text
WORK_PACKAGE = D2-WP004-R2-PRE2-R3
NAME = PART B EXPANDED PRESENTATION OOXML + PRIVACY OVERLAY PROOF
AUTHORIZATION = D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01
STATE = AUTHORIZED / ACTIVE
MODE = OOXML-FEASIBILITY+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT

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

## 4. Exact proof contract

This is proof/reference feasibility only. Do not turn the feasibility harness into Production Renderer code.

### A. Preserve frozen structural transform as intermediate invariant
For Part B competency counts N=6/7/8, preserve and mechanically prove the already-closed structural state BEFORE presentation overlay:

```text
INTERMEDIATE_MERGE_COUNT:
N6 = 79
N7 = 85
N8 = 91

DIMENSION:
N6 = A1:X35
N7 = A1:X39
N8 = A1:X43

SUMMARY_START_ROW:
N6 = 31
N7 = 35
N8 = 39
```

Preserve existing Print_Area relocation, row relocation, reference-image behavior, source immutability, and zero-formula authority.

Do not change the frozen source merge-clone rule. In particular, the original `B26:J27` title merge remains outside the fully-contained rows 27:30 merge clone set.

### B. Apply presentation title merge overlay only AFTER intermediate validation
After the frozen structural transform has been validated, prove exact overlay:

```text
N6 = no new title merge
N7 = add B31:J31
N8 = add B31:J31 + B35:J35
```

Required final effective merge counts:

```text
N6 = 79
N7 = 86
N8 = 93
```

Do not add any other presentation merge.

The existing description merge geometry must remain:

```text
N7 B32:J32
N8 B32:J32 + B36:J36
```

Rating Scale remains:

```text
B33:J33
B37:J37
```

and must remain static/protected.

### C. Privacy topology: validate base first, then overlay
The already-closed base privacy topology remains mandatory FIRST:

```text
BASE_DYNAMIC_COUNT:
N6 = 432
N7 = 474
N8 = 516
```

Only after base privacy validation succeeds, add expanded presentation overlay authority:

```text
N6 = none
N7 = B31:J32
N8 = B31:J32 + B35:J36
```

Those ranges add exactly:

```text
N7 +18 cells
N8 +36 cells
```

Required effective final dynamic counts:

```text
N6 = 432
N7 = 492
N8 = 552
```

Do not broaden unrelated B:J cells into dynamic authority.

### D. Static/protected truth
Mechanically prove all of the following remain non-dynamic after overlay:
- Rating Scale `B33:J33` and `B37:J37`;
- padding rows 30/34/38;
- existing protected static competency presentation text for N6;
- Chief `R:X` remains structural/privacy-only and is not newly secured writable.

### E. Stale clone sanitization proof
For inserted competencies 7/8, structural cloning may copy competency-6 presentation text into the new block before secured rewrite.

The feasibility proof must:
1. mechanically identify the expected cloned stale presentation text/ranges from the frozen transform;
2. validate that it is exactly the expected clone state rather than arbitrary content;
3. sanitize/blank the expanded dynamic presentation targets before the future secured semantic writes;
4. prove no stale competency-6 title/description remains in b7/b8 presentation write targets after sanitization;
5. leave `Rating Scale` static text intact;
6. leave source/caller bytes immutable.

Do not fabricate or infer a title merge before the explicit presentation overlay step.

### F. Preservation / package / formulas
Preserve existing closed feasibility guarantees:
- source bytes immutable;
- output is independent bytes in memory;
- exact owner template identity guard remains;
- final formula inventory remains zero;
- dimensions and Print_Area remain exactly the already-closed N6/N7/N8 values;
- no package or relationship corruption;
- no unrelated reference-image regression;
- no scoring formula/recalculation is introduced.

## 5. Required focused tests

Modify only `tests/mbo-xlsx-ooxml-feasibility.test.js` and prove at minimum:

1. existing frozen Part B structural tests still pass;
2. intermediate merge counts remain exactly 79/85/91;
3. N7 final title overlay is exactly `B31:J31` and final merge count 86;
4. N8 final title overlay is exactly `B31:J31` + `B35:J35` and final merge count 93;
5. N6 remains merge count 79 with no presentation title overlay;
6. description merges remain exact `B32:J32` and `B36:J36` where applicable;
7. dimensions remain `A1:X35`, `A1:X39`, `A1:X43`;
8. Print_Area remains unchanged from closed structural authority;
9. summary start rows remain 31/35/39;
10. base privacy counts are validated first as 432/474/516;
11. effective privacy counts are exactly 432/492/552 after presentation overlay;
12. only `B31:J32` / `B35:J36` are added as presentation dynamic overlays;
13. Rating Scale `B33:J33` / `B37:J37` remains non-dynamic/static;
14. padding rows 30/34/38 remain protected/non-dynamic;
15. stale cloned presentation values are proven expected then sanitized from expanded title/description targets;
16. Rating Scale static text survives sanitization;
17. source input bytes remain unchanged;
18. final formula inventory remains zero;
19. malformed/wrong overlay range, wrong merge count, wrong dynamic count, wrong stale-clone expectation, or unexpected protected-cell mutation fails closed;
20. existing relevant reference-image/package preservation checks do not regress.

Run only the focused OOXML feasibility test file unless the exact existing command already includes its directly relevant suite. Do not broaden into unrelated repository work.

## 6. Executor protocol

```text
fresh-fetch authorization HEAD
-> verify branch ai/antigravity-wp002c
-> read this control file + PRE2 design + exact feasibility source/test
-> implement minimal proof-only changes
-> run focused tests
-> verify git diff contains exactly the two authorized files (or fewer if legitimately unchanged)
-> commit exactly once
-> push ai/antigravity-wp002c
-> report commit SHA + exact changed files + test command/result
-> STOP
```

Antigravity must NOT:
- edit Export Service;
- edit Template Profile;
- implement Production Renderer/Sanitizer;
- edit Baselines/control docs;
- change package/package-lock/dist;
- perform Kintone writes/deploys;
- start D3;
- self-declare PRE2-R3 PASS/CLOSED.

Final executor status must remain:
`FEASIBILITY PROOF IMPLEMENTATION COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`.

## 7. Authorization ledger

```text
D2-WP004-R2-PRE2-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTED / CLOSED / DO NOT REUSE
D2-WP004-R2-PRE2-R1-R1-SOURCE-TEST-CORRECTIVE-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R2-PRE2-R2-PROFILE-TEST-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R2-PRE2-R3-OOXML-FEASIBILITY-TEST-20260902-01 = ACTIVE / ONE-SHOT / CONSUME ON ONE IMPLEMENTATION COMMIT
NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE PRE2-R3 OOXML-FEASIBILITY+TEST EXACTLY, PUSH, REPORT, STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
