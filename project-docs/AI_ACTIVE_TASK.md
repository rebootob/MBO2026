# AI ACTIVE TASK — R2-A NEEDS CORRECTIVE / R2-A-R1 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> only directly relevant frozen Baselines/profile/tests for the exact next gate.

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
D2_WP004_R2_PRE2_R3 = PASS / CLOSED AFTER CORRECTIVES
D2_WP004_R2_PRE2_R3_R4 = PASS / CLOSED
D2_WP004_R2_A = NEEDS CORRECTIVE / NOT CLOSED

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

## 2. R2-A authorization + implementation review identity

```text
WORK_PACKAGE = D2-WP004-R2-A
AUTHORIZATION_TOKEN = D2-WP004-R2-A-PROFILE-TEST-20260902-01
AUTHORIZATION_COMMIT = 3a629e00466b82bee65dcfb146d81577e7c319d5
IMPLEMENTATION_COMMIT = 6dcfba1277462f230a5cd9379aacb96193253ac1
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
CHANGED_FILES = EXACTLY TWO AUTHORIZED FILES
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
TOKEN_STATE = CONSUMED / DO NOT REUSE
SCOPE_REVIEW = PASS
CONTENT_REVIEW = NEEDS CORRECTIVE
INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

Accepted parts that must not regress:
- profile remains browser-safe/pure and does not import fs/path/crypto/XlsxPopulate/Kintone behavior;
- Part A topology API exists for N=4..10;
- Part B topology API exists for N=6/7/8;
- Part A dimensions/Print_Area/page setup values are correctly emitted;
- Part B dimensions/Print_Area/intermediate merges/final overlay merges/summary starts are correctly emitted;
- Part B base/effective privacy counts remain 432/474/516 and 432/492/552;
- presentation dynamic metadata remains N6 none, N7 B31:J32, N8 B31:J32 + B35:J36;
- Rating Scale and padding metadata remains static/protected;
- SAFE/UNRESOLVED/NO_SOURCE semantic authority is not widened.

## 3. Material blocker A — Part B effective sanitization topology crosses protected padding rows

Current implementation constructs count-aware rating sanitization as contiguous ranges:

```text
K7:Q(29 + extraRows)
R7:X(29 + extraRows)
```

That produces:

```text
N7: K7:Q33 + R7:X33
     -> includes protected padding row 30

N8: K7:Q37 + R7:X37
     -> includes protected padding rows 30 and 34
```

Frozen authority requires padding rows 30/34/38 to remain protected static. The production profile must not expose an `effectiveSanitizationRanges` contract that silently includes protected padding unless an explicit machine-enforced exclusion topology is part of the same authority. R2-B must be able to consume the profile without inventing exclusion logic or hardcoded padding literals.

Corrective requirement:
- preserve base rating ranges K7:Q29 and R7:X29;
- add cloned dynamic rating ranges per inserted competency block without crossing cloned padding rows;
- N7 cloned rating authority must cover rows 31:33 only;
- N8 additional cloned rating authority must cover rows 35:37 only;
- protected rows 30/34/38 must expand to zero sanitization addresses in the effective sanitization set;
- presentation ranges B31:J32 and B35:J36 remain separately authorized dynamic overlay ranges;
- shifted summary/signature sanitization ranges remain exact.

The final expanded effective sanitization address set must be deterministic, duplicate-free and must not intersect protected padding/static authority.

## 4. Material blocker B — `validateMappingIntegrity()` does not validate the new topology authority deeply enough

Current validator checks only a subset of new layout fields (for example sheet names, clone/downstream anchors, page setup and formulaCount). It does not mechanically fail closed on mutations to critical R2-A authority such as:
- Part A dimension;
- Part A Print_Area;
- Part A effective/base sensitive range sets;
- Part B dimension;
- Part B Print_Area;
- Part B intermediate merge count;
- Part B final overlay merge count;
- Part B summary start/end;
- Part B base/effective dynamic counts;
- Part B presentation dynamic ranges;
- Part B protected/rating-static topology as a complete set;
- Part B base/effective sanitization range sets.

Focused tests currently assert many positive scalar values, but base sensitive topology is checked mainly by array length and there is no credible mutation-style proof that `validateMappingIntegrity()` rejects a changed critical topology field.

Corrective requirement:
- strengthen production `validateMappingIntegrity()` so the new layout/sanitization topology is validated against deterministic frozen/count-derived authority;
- exact set equality where sets/ranges are authority;
- uniqueness/duplicate rejection after deterministic range expansion;
- protected padding/static ranges must have zero overlap with effective sanitization address set;
- no test-only validator/backdoor;
- mutation-style tests must call the real production validator with a bounded profile override/subclass/helper path and prove at least representative mutations fail for both Part A and Part B.

Representative required negative proof:
1. wrong Part A dimension or Print_Area -> reject;
2. Part A sensitive range substituted while length stays the same -> reject;
3. wrong Part B final overlay merge count -> reject;
4. wrong Part B summary start -> reject;
5. wrong Part B effective dynamic count -> reject;
6. Part B sensitive/sanitization same-count substitution -> reject;
7. protected padding address introduced into effective sanitization set -> reject.

Do not simply compare test-created fake constants and throw from test code. Production validation must reject.

## 5. Exact next proposed gate — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-A-R1
NAME = LAYOUT/SANITIZATION PROFILE EXACT-TOPOLOGY CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = PROFILE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

WRITABLE_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js

MBO_EXPORT_SERVICE_CHANGE = FORBIDDEN
FEASIBILITY_SOURCE_CHANGE = FORBIDDEN
FEASIBILITY_TEST_CHANGE = FORBIDDEN
PRODUCTION_RENDERER/PREPARER_CHANGE = FORBIDDEN
NEW_RENDERER_FILE = FORBIDDEN
PACKAGE/PACKAGE-LOCK_CHANGE = FORBIDDEN
DIST_CHANGE = FORBIDDEN
BASELINE_CHANGE_BY_EXECUTOR = FORBIDDEN
CONTROL_DOC_CHANGE_BY_EXECUTOR = FORBIDDEN
KINTONE_WRITE/DEPLOY/LIVE_UAT = FORBIDDEN
D3 = HOLD
```

R2-A-R1 must correct only blocker A and blocker B above. Do not redesign semantic mapping and do not start R2-B.

## 6. Focused corrective test contract

At minimum:
1. all existing template-profile tests remain passing;
2. Part A N4..N10 exact geometry/dimension/Print_Area/page setup remains unchanged;
3. Part A base sensitive ranges exact set equality, frozen and duplicate-free after expansion;
4. Part A effective sanitization sets deterministic and duplicate-free;
5. Part B N6/N7/N8 exact geometry/merge/summary/privacy metrics remain unchanged;
6. Part B effective rating sanitization does not include rows 30/34/38;
7. presentation dynamic topology remains exact +0/+18/+36;
8. Part B effective sanitization address set is duplicate-free;
9. effective sanitization has zero overlap with protected padding/static authority;
10. exact base sensitive range authority is mechanically validated, not length-only;
11. `validateMappingIntegrity()` rejects representative Part A topology mutation;
12. `validateMappingIntegrity()` rejects representative Part B merge/summary/privacy mutation;
13. `validateMappingIntegrity()` rejects same-count sensitive-range substitution;
14. `validateMappingIntegrity()` rejects protected-padding sanitization contamination;
15. SAFE_TO_MAP=20 / UNRESOLVED=22 / NO_SOURCE=5 unchanged;
16. profile remains browser-safe/pure.

Focused command remains:
`node --test tests/mbo-xlsx-template-profile.test.js`

## 7. What comes after R2-A closure — NOT AUTHORIZED

Only after independent R2-A/R2-A-R1 closure:

```text
R2-B = SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER ENGINE
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = LATER D2 GATE
D3 = HOLD UNTIL D2 PASS / CLOSED
```

## 8. Owner decision

Recommended Owner authorization phrase:

`อนุมัติ D2-WP004-R2-A-R1 PROFILE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Until exact Owner authorization:

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRODUCTION_RENDERER = NOT AUTHORIZED
KINTONE_WRITE = NONE
DEPLOY = NONE
D3 = HOLD
```
