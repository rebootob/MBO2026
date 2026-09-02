# AI ACTIVE TASK — R2-A-R1 EXACT-TOPOLOGY CORRECTIVE AUTHORIZED

Mode: **EXECUTION PLANE AUTHORIZED / PROFILE+TEST CORRECTIVE ONLY / BOUNDED / ONE-SHOT / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-02 ICT

Fresh-fetch current HEAD first. Fast path: `D2_REVIEW_FAST_START.md` -> this file -> `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md` -> only directly relevant frozen Baselines/profile/tests for this exact corrective gate.

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
D2_WP004_R2_A_R1 = AUTHORIZED / ACTIVE

SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-A-R1
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-A-R1-PROFILE-TEST-CORRECTIVE-20260902-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = D2-WP004-R2-A-R1-PROFILE-TEST-CORRECTIVE-20260902-01
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED PROFILE+TEST CORRECTIVE / ONE COMMIT -> PUSH -> STOP
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

Current R2-A implementation constructs count-aware rating sanitization as contiguous ranges:

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

Frozen authority requires padding rows 30/34/38 to remain protected static. The production profile must not expose an `effectiveSanitizationRanges` contract that silently includes protected padding. R2-B must be able to consume the profile without inventing exclusion logic or hardcoded padding literals.

Corrective requirement:
- preserve base rating ranges `K7:Q29` and `R7:X29`;
- add cloned dynamic rating ranges per inserted competency block without crossing cloned padding rows;
- N7 cloned rating authority covers rows 31:33 only;
- N8 additional cloned rating authority covers rows 35:37 only;
- protected rows 30/34/38 expand to zero addresses in the effective sanitization address set;
- presentation ranges `B31:J32` and `B35:J36` remain separately authorized dynamic overlay ranges;
- shifted summary/signature sanitization ranges remain exact;
- final effective sanitization address set is deterministic and duplicate-free;
- final effective sanitization address set has zero intersection with protected padding/static authority.

Do not broaden or reinterpret semantic write authority.

## 4. Material blocker B — `validateMappingIntegrity()` must deeply validate R2-A topology authority

Current R2-A validator checks only a subset of layout fields. R2-A-R1 must make production validation fail closed on critical topology mutations, including:
- Part A dimension;
- Part A Print_Area;
- Part A base/effective sensitive/sanitization exact sets;
- Part B dimension;
- Part B Print_Area;
- Part B intermediate merge count;
- Part B final overlay merge count;
- Part B summary start/end;
- Part B base/effective dynamic counts;
- Part B presentation dynamic exact ranges;
- Part B protected-padding and rating-static exact topology;
- Part B base/effective sanitization exact sets;
- duplicates in expanded address authority;
- any effective sanitization overlap with protected padding/static authority.

Corrective requirements:
- production `validateMappingIntegrity()` must validate deterministic frozen/count-derived authority, not merely positive object shape;
- exact set equality where range/address sets are authority;
- deterministic range expansion + uniqueness enforcement;
- no test-only validator/backdoor;
- mutation-style tests must call the real production validator through a bounded profile override/subclass/helper path;
- production validation itself must reject malformed topology.

Representative required negative proof:
1. wrong Part A dimension or Print_Area -> reject;
2. Part A sensitive range substituted while list length stays the same -> reject;
3. wrong Part B final overlay merge count -> reject;
4. wrong Part B summary start -> reject;
5. wrong Part B effective dynamic count -> reject;
6. Part B sensitive/sanitization same-count substitution -> reject;
7. protected padding address introduced into effective sanitization authority -> reject.

Forbidden proof pattern: test-created fake constants followed by a throw from test code. The production validator must be the component that rejects.

## 5. R2-A-R1 authorization authority

```text
WORK_PACKAGE = D2-WP004-R2-A-R1
NAME = LAYOUT/SANITIZATION PROFILE EXACT-TOPOLOGY CORRECTIVE
STATE = AUTHORIZED / ACTIVE
MODE = PROFILE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-A-R1-PROFILE-TEST-CORRECTIVE-20260902-01
AUTHORIZATION_BASIS_HEAD = fcbcf1e472752477d309c08c932629ffe2ac5b6a

WRITABLE_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js

MAX_EXECUTOR_COMMITS = 1
PUSH_TARGET = ai/antigravity-wp002c
```

Forbidden:

```text
src/services/mbo-export-service.js = FORBIDDEN
scripts/export/mbo-xlsx-ooxml-feasibility.js = FORBIDDEN
tests/mbo-xlsx-ooxml-feasibility.test.js = FORBIDDEN
production renderer/preparer source = FORBIDDEN
new renderer/preparer file = FORBIDDEN
package.json / package-lock.json = FORBIDDEN
dist = FORBIDDEN
Baselines/control docs by executor = FORBIDDEN
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

R2-A-R1 corrects ONLY blocker A and blocker B. Do not redesign semantic mapping and do not start R2-B.

## 6. Focused corrective test contract

At minimum prove:
1. all existing template-profile tests remain passing;
2. Part A N4..N10 exact geometry/dimension/Print_Area/page setup remains unchanged;
3. Part A base sensitive ranges equal the exact frozen set, are immutable, and expand duplicate-free;
4. Part A effective sanitization address sets are deterministic and duplicate-free;
5. Part B N6/N7/N8 geometry/merge/summary/privacy metrics remain exact;
6. Part B rating sanitization covers base rows 7:29 plus inserted competency dynamic rows 31:33 / 35:37 only as applicable;
7. Part B effective rating sanitization excludes protected rows 30/34/38;
8. presentation dynamic topology remains exact +0/+18/+36;
9. Part B effective sanitization address set is duplicate-free;
10. effective sanitization has zero overlap with protected padding/static authority;
11. Part A and Part B base sensitive range authority is mechanically exact, not length-only;
12. `validateMappingIntegrity()` rejects wrong Part A dimension/Print_Area;
13. `validateMappingIntegrity()` rejects Part A same-count sensitive-range substitution;
14. `validateMappingIntegrity()` rejects wrong Part B final overlay merge count;
15. `validateMappingIntegrity()` rejects wrong Part B summary start/end;
16. `validateMappingIntegrity()` rejects wrong Part B effective dynamic count;
17. `validateMappingIntegrity()` rejects Part B same-count sensitive/sanitization substitution;
18. `validateMappingIntegrity()` rejects protected-padding contamination;
19. SAFE_TO_MAP=20 / UNRESOLVED=22 / NO_SOURCE=5 unchanged;
20. b1..6 TITLE/DESCRIPTION reject, b8 under N7 rejects, Chief rating rejects;
21. profile remains browser-safe/pure with no workbook I/O or Node-only dependency.

Focused command:
`node --test tests/mbo-xlsx-template-profile.test.js`

No owner-template binary/local files are required for this corrective profile-only gate.

## 7. Executor protocol

Antigravity must:
1. fresh-fetch canonical branch;
2. verify current HEAD contains this authorization;
3. read `D2_REVIEW_FAST_START.md`, this file, the R2 renderer/sanitizer design, and only the exact profile/test + directly relevant frozen Baselines needed;
4. implement only the two corrective blockers in the two writable files;
5. run `node --test tests/mbo-xlsx-template-profile.test.js`;
6. verify `git diff --name-only` contains only the two authorized files;
7. commit exactly once;
8. push to `ai/antigravity-wp002c`;
9. report commit SHA, exact changed files, exact focused test command/result;
10. STOP.

Do not self-declare R2-A or R2-A-R1 PASS/CLOSED.

Final executor status must be:

```text
R2-A-R1 EXACT-TOPOLOGY CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

## 8. What comes after R2-A closure — NOT AUTHORIZED

Only after independent R2-A/R2-A-R1 closure:

```text
R2-B = SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER ENGINE
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = LATER D2 GATE
D3 = HOLD UNTIL D2 PASS / CLOSED
```
