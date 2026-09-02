# AI ACTIVE TASK — D2-WP004-R2-PRE2-R2 PROFILE+TEST AUTHORIZED

Mode: **CONTROL PLANE / ANTIGRAVITY BOUNDED ONE-SHOT / PROFILE+TEST ONLY / LOW-CREDIT / NO EXPORT-SERVICE AUTH / NO OOXML AUTH / NO RENDERER AUTH / NO KINTONE / NO DEPLOY / D3 HOLD**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md` -> exact current Template Profile source/test only.

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

ACTIVE_WORK_PACKAGE = D2-WP004-R2-PRE2-R2
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-PRE2-R2-PROFILE-TEST-20260902-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = D2-WP004-R2-PRE2-R2-PROFILE-TEST-20260902-01
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED PROFILE+TEST / ONE COMMIT -> PUSH -> STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

Owner authorization phrase:
`อนุมัติ D2-WP004-R2-PRE2-R2 PROFILE+TEST ตามขอบเขตที่เสนอ`

Authorization token:
`D2-WP004-R2-PRE2-R2-PROFILE-TEST-20260902-01`

Authorization basis HEAD:
`41e6f7fdb604a734b7109942a52487d0a12c8af9`

## 2. Frozen dependencies

PRE2-R1/R1-R1 secured projection authority is closed:

```text
b=7 exact code = COMP_LEAD
presentationTitle = 7. Leadership & People Management
presentationDescription = exact nonblank item.description

b=8 exact code = COMP_STRAT
presentationTitle = 8. Strategy & Coaching
presentationDescription = exact nonblank item.description
```

Current Template Profile authority before this WP remains:

```text
SAFE_TO_MAP = 18 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE
```

Do not change export-service behavior in this WP.

## 3. AUTHORIZED WORK PACKAGE — D2-WP004-R2-PRE2-R2

```text
WORK_PACKAGE = D2-WP004-R2-PRE2-R2
NAME = EXPANDED COMPETENCY TEMPLATE PROFILE PRESENTATION AUTHORITY
AUTHORIZATION = D2-WP004-R2-PRE2-R2-PROFILE-TEST-20260902-01
STATE = AUTHORIZED / ACTIVE
MODE = PROFILE+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT

WRITABLE_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js

EXPORT_SERVICE_CHANGE = FORBIDDEN
OOXML_FEASIBILITY_CHANGE = FORBIDDEN
RENDERER_CHANGE = FORBIDDEN
BASELINE_CHANGE = FORBIDDEN
CONTROL_DOC_CHANGE_BY_EXECUTOR = FORBIDDEN
PACKAGE_CHANGE = FORBIDDEN
DIST_CHANGE = FORBIDDEN
KINTONE_WRITE = FORBIDDEN
DEPLOY = FORBIDDEN
D3 = HOLD
```

No other file may be edited.

## 4. Exact implementation contract

Extend Template Profile only enough to centralize expanded competency 7/8 presentation semantics and topology.

### A. Preserve all current closed mappings
- preserve all existing 18 SAFE roles and their exact addresses/projection paths;
- preserve the existing 22 unresolved roles and 5 no-secured-source roles unchanged;
- preserve Part A behavior unchanged;
- preserve `COMPETENCY_b_SELF_RATING` identity/path/address behavior unchanged;
- preserve Chief `R:X` structural/privacy authority as NOT secured writable;
- preserve supported Part B competency counts exactly 6/7/8;
- preserve protected padding rows 30/34/38.

### B. Add exactly two expanded presentation role families
Add canonical role families:

```text
COMPETENCY_b_TITLE
COMPETENCY_b_DESCRIPTION
```

They may resolve ONLY for expanded competency ordinals b=7 or b=8 and only when the requested competencyCount actually contains that ordinal.

Exact secured paths:

```text
COMPETENCY_b_TITLE
  -> partB.competencyItems[b-1].presentationTitle

COMPETENCY_b_DESCRIPTION
  -> partB.competencyItems[b-1].presentationDescription
```

Exact writable anchor targets:

```text
b=7 TITLE = B31
b=7 DESCRIPTION = B32
b=8 TITLE = B35
b=8 DESCRIPTION = B36
```

Required rejection:
- b1..6 TITLE/DESCRIPTION => `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`;
- b8 when competencyCount=7 => reject;
- any ordinal outside supported current count => reject;
- wrong/missing projection path or target => fail closed through mapping integrity.

### C. Centralize presentation overlay metadata, but do NOT mutate OOXML
Template Profile must expose deterministic metadata sufficient for the later OOXML proof/renderer without scattering important addresses.

Exact proposed title merge metadata:

```text
b=7 TITLE_MERGE = B31:J31
b=8 TITLE_MERGE = B35:J35
```

Existing description merge authority consumed by later overlay:

```text
b=7 DESCRIPTION_MERGE = B32:J32
b=8 DESCRIPTION_MERGE = B36:J36
```

Existing protected static rating scale / padding topology must remain explicit and non-writable:

```text
b=7 RATING_SCALE = B33:J33
b=7 PADDING_ROW = 34
b=8 RATING_SCALE = B37:J37
b=8 PADDING_ROW = 38
```

This WP MUST NOT edit workbook XML, feasibility code, or renderer code.

### D. Dynamic-target semantics
The new title/description anchor cells/ranges must be classified as presentation write authority only for valid b7/b8.

They must NOT:
- overlap K:X rating authority;
- make rating-scale rows writable presentation targets;
- make padding rows 30/34/38 writable;
- widen Chief authority;
- create duplicate existing SAFE target collisions.

If `isDynamicWriteTarget()` is extended, it must do so narrowly and consistently with the centralized profile metadata; do not broadly mark unrelated B:J cells dynamic.

### E. Mapping integrity
Extend `validateMappingIntegrity()` so it mechanically proves, for supported N=6/7/8:
- all existing 18 SAFE mappings still validate;
- b7 presentation mappings exist exactly for N7/N8;
- b8 presentation mappings exist exactly for N8 only;
- exact title/description anchor addresses;
- exact title/description projection paths;
- exact merge metadata;
- b1..6 presentation roles remain rejected;
- b8 under N7 rejected;
- no duplicate exclusive writable target;
- no overlap with self-rating K:X authority;
- protected padding remains non-dynamic;
- malformed/wrong index/address/path/merge/count/topology fails closed.

### F. Safe-role count
After this implementation, code may represent the two new canonical safe role families in the profile, but executor MUST NOT self-promote project Baseline or D2 closure.

Expected independent-review candidate:

```text
SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
```

This becomes durable authority only after ChatGPT independent review.

## 5. Required focused tests

Modify only `tests/mbo-xlsx-template-profile.test.js` and prove at minimum:

1. all existing profile integrity tests still pass;
2. b7 TITLE resolves at N7 and N8 to `B31` + exact presentationTitle path;
3. b7 DESCRIPTION resolves at N7 and N8 to `B32` + exact presentationDescription path;
4. b8 TITLE resolves at N8 to `B35` + exact path;
5. b8 DESCRIPTION resolves at N8 to `B36` + exact path;
6. b1..6 TITLE/DESCRIPTION reject;
7. b8 TITLE/DESCRIPTION under N7 reject;
8. exact merge metadata: `B31:J31`, `B32:J32`, `B35:J35`, `B36:J36`;
9. rating-scale metadata remains static/protected (`B33:J33`, `B37:J37`);
10. padding rows 30/34/38 remain non-dynamic;
11. presentation targets do not overlap K:X rating/Chief authority;
12. no duplicate writable target collisions;
13. wrong/malformed presentation address/path/merge/index/count fails mapping integrity;
14. unknown role/template/count behavior remains fail closed;
15. Part A and existing `COMPETENCY_b_SELF_RATING` mappings do not regress.

Run focused Template Profile tests only. Do not broaden into unrelated suites unless already part of the exact test command.

## 6. Executor protocol

```text
fresh-fetch authorization HEAD
-> verify branch ai/antigravity-wp002c
-> read this file + PRE2 design + current Template Profile source/test
-> implement minimal profile change
-> add focused tests
-> run focused tests
-> verify git diff contains exactly the two authorized files (or fewer if legitimately unchanged)
-> commit exactly once
-> push ai/antigravity-wp002c
-> report commit SHA + exact changed files + test command/result
-> STOP
```

Antigravity must NOT:
- edit `MboExportService`;
- edit OOXML feasibility source/tests;
- implement title merges in workbook XML;
- implement Production Renderer/Sanitizer;
- alter Baselines/control docs;
- change package/package-lock/dist;
- perform Kintone writes/deploys;
- start D3;
- self-declare PRE2-R2 PASS/CLOSED.

Final executor status:
`IMPLEMENTATION COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`.

## 7. Authorization ledger

```text
D2-WP004-R2-PRE2-R1-SOURCE-TEST-20260902-01 = CONSUMED / CORRECTED / CLOSED / DO NOT REUSE
D2-WP004-R2-PRE2-R1-R1-SOURCE-TEST-CORRECTIVE-20260902-01 = CONSUMED / PASS / CLOSED / DO NOT REUSE
D2-WP004-R2-PRE2-R2-PROFILE-TEST-20260902-01 = ACTIVE / ONE-SHOT / CONSUME ON ONE IMPLEMENTATION COMMIT

NEXT_EXECUTOR = ANTIGRAVITY
NEXT_ACTION = EXECUTE PRE2-R2 PROFILE+TEST EXACTLY, PUSH, REPORT, STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
