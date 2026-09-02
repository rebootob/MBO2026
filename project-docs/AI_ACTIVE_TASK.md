# AI ACTIVE TASK — PRE2-R3 CLOSED / R2-A PROFILE FOUNDATION PROPOSED

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
D2_WP004_R2_PRE2_R3_R1 = PASS / CLOSED AS CORRECTIVE CHAIN
D2_WP004_R2_PRE2_R3_R2 = PASS / CLOSED AS CORRECTIVE CHAIN
D2_WP004_R2_PRE2_R3_R3 = PASS / CLOSED AS CORRECTIVE CHAIN
D2_WP004_R2_PRE2_R3_R4 = PASS / CLOSED

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

## 2. Durable PRE2-R3 closure authority

```text
FROZEN_INTERMEDIATE_MERGES = N6 79 / N7 85 / N8 91
FINAL_OVERLAY_MERGES = N6 79 / N7 86 / N8 93
PART_B_DIMENSIONS = A1:X35 / A1:X39 / A1:X43
SUMMARY_START_OBSERVED = N6 31 / N7 35 / N8 39
BASE_PRIVACY_DYNAMIC = N6 432 / N7 474 / N8 516
FINAL_EFFECTIVE_DYNAMIC = N6 432 / N7 492 / N8 552

N7_TITLE_MERGE = B31:J31
N8_TITLE_MERGES = B31:J31 + B35:J35
N7_PRESENTATION_DYNAMIC = B31:J32
N8_PRESENTATION_DYNAMIC = B31:J32 + B35:J36
RATING_SCALE = B33:J33 / B37:J37 / PROTECTED STATIC
PADDING = rows 30 / 34 / 38 / PROTECTED STATIC
FORMULA_INVENTORY = 0
```

Preserved authority:
- exact owner-template identity;
- caller/source bytes immutable;
- exact dimensions and Print_Area;
- summary relocation;
- relationship tuples/media/reference-image/auxiliary Sheet1 preservation;
- Chief R:X not widened;
- no Excel scoring or recalculation.

## 3. Control-plane repository finding after PRE2-R3

There is currently **no production XLSX renderer/template-preparer source file** in `src/`.

Existing production-side authorities are:
- `src/services/mbo-export-service.js` — secured data projection authority;
- `src/profiles/mbo-xlsx-template-profile.js` — semantic mapping/profile authority;
- `scripts/export/mbo-xlsx-ooxml-feasibility.js` — proof/feasibility harness only, NOT production code.

The feasibility harness imports Node `fs`, `path`, `crypto`, performs local template discovery, and contains proof-only behavior. The R2 design explicitly forbids importing/copying it wholesale into browser production code.

Current Template Profile already centralizes semantic mapping and expanded b7/b8 presentation overlay metadata, but it does **not yet centralize the complete structural/layout + broad sanitization topology** required by the production preparer/sanitizer.

Therefore starting R2-B now would force important workbook row/range/geometry literals into the production engine, conflicting with:

```text
CENTRALIZED_TEMPLATE_PROFILE_MAPPING = MANDATORY
NO_SCATTERED_IMPORTANT_CELL_ADDRESS = MANDATORY
```

R2-A must therefore close first.

## 4. Exact next proposed gate — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-A
NAME = PRODUCTION XLSX LAYOUT + SANITIZATION PROFILE FOUNDATION
STATE = PROPOSED / NOT AUTHORIZED
MODE = PROFILE+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT

WRITABLE_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js

MBO_EXPORT_SERVICE_CHANGE = FORBIDDEN
FEASIBILITY_SOURCE_CHANGE = FORBIDDEN
FEASIBILITY_TEST_CHANGE = FORBIDDEN
PRODUCTION_RENDERER_CHANGE = FORBIDDEN
NEW_RENDERER_FILE = FORBIDDEN
PACKAGE_CHANGE = FORBIDDEN
DIST_CHANGE = FORBIDDEN
BASELINE_CHANGE_BY_EXECUTOR = FORBIDDEN
CONTROL_DOC_CHANGE_BY_EXECUTOR = FORBIDDEN
KINTONE_WRITE = FORBIDDEN
DEPLOY = FORBIDDEN
D3 = HOLD
```

This gate is **pure declarative profile authority only**. It must not open, mutate, generate or render an XLSX file.

## 5. Proposed R2-A contract

### A. Browser-safe purity
`src/profiles/mbo-xlsx-template-profile.js` must remain pure/browser-safe:
- no `fs`;
- no `path`;
- no Node `crypto`;
- no local template discovery;
- no Kintone/network access;
- no XlsxPopulate binary mutation;
- no proof sentinel behavior.

### B. Part A structural/layout topology
Centralize already-frozen production-relevant Part A geometry for N=4..10, including at minimum:

```text
BASE_OBJECTIVE_COUNT = 4
SOURCE_CLONE_ROW = 28
DOWNSTREAM_THRESHOLD_ROW = 29
EXTRA_ROWS = N - 4
MAIN_SHEET = MBO Staff & Chief
DIMENSION = A1:BL52 .. A1:BL58
PRINT_AREA = 'MBO Staff & Chief'!$A$1:$BJ$52 .. $BJ$58
PAPER_SIZE = 8
ORIENTATION = landscape
SCALE = 58
FORMULA_AUTHORITY = 0
```

Exact base sensitive/sanitization range authority to centralize:

```text
N6:Q7
Z7:AF7
AG7:AL7
AM7:AP7
AQ7:AS7
AT7:BC7
BD7:BI7
G8:S8
G16:AF19
AM16:BI19
B25:BI28
BC29:BI35
B37:S42
AI37:AY42
B47:N50
```

Profile must expose enough declarative relocation metadata for a later generic production preparer to derive inserted-row and shifted downstream sanitization topology without hardcoding row 28/29 or those ranges in the engine.

Do not invent new semantic write authority from these broad sensitive ranges.

### C. Part B structural/layout topology
Centralize frozen Part B geometry for N=6/7/8:

```text
BASE_COMPETENCY_COUNT = 6
SOURCE_CLONE_BLOCK = rows 27:30
SOURCE_BLOCK_HEIGHT = 4
DOWNSTREAM_THRESHOLD_ROW = 31
EXTRA_BLOCKS = N - 6
EXTRA_ROWS = 4 * EXTRA_BLOCKS
MAIN_SHEET = (Part B) Competency
AUXILIARY_SHEET = Sheet1
DIMENSION = A1:X35 / A1:X39 / A1:X43
PRINT_AREA = '(Part B) Competency'!$A$1:$X$35 / $X$39 / $X$43
INTERMEDIATE_MERGES = 79 / 85 / 91
FINAL_OVERLAY_MERGES = 79 / 86 / 93
SUMMARY_START = 31 / 35 / 39
PAPER_SIZE = 9
ORIENTATION = portrait
SCALE = 75
FORMULA_AUTHORITY = 0
```

Exact base sensitive/sanitization range authority to centralize:

```text
G2:H3
J3:L3
M3:O3
P3:Q3
R3
S3:W3
K7:Q29
R7:X29
B31:D34
E31:H34
I31:P34
Q31:S34
T31:X34
```

Profile must expose declarative count-aware relocation rules for cloned competency blocks and shifted summary/signature blocks.

### D. Expanded presentation privacy overlay
Preserve the already-accepted b7/b8 metadata and centralize its sanitizer topology coherently:

```text
N6 PRESENTATION_DYNAMIC = none
N7 PRESENTATION_DYNAMIC = B31:J32
N8 PRESENTATION_DYNAMIC = B31:J32 + B35:J36
BASE_DYNAMIC_COUNT = 432 / 474 / 516
EFFECTIVE_DYNAMIC_COUNT = 432 / 492 / 552
TITLE_MERGES = B31:J31 / B35:J35
RATING_SCALE_STATIC = B33:J33 / B37:J37
PADDING_STATIC = rows 30 / 34 / 38
CHIEF_AUTHORITY = R:X / unchanged
```

The profile must not reinterpret broad sanitization authority as semantic writable authority.

### E. API shape
Use the smallest maintainable extension to the existing Profile. Prefer pure immutable/frozen topology returned by count-aware methods such as:
- Part A layout/sanitization topology for N;
- Part B layout/sanitization topology for N;
without creating an unrelated parallel profile system.

Important workbook addresses/ranges/rows should have one authoritative profile location, not be duplicated across future renderer modules.

### F. No semantic regression
R2-A must preserve exactly:

```text
SAFE_TO_MAP = 20
UNRESOLVED = 22
NO_SECURED_SOURCE = 5
b1..6 TITLE/DESCRIPTION = REJECT
b8 under N7 = REJECT
COMPETENCY_CHIEF_RATING = REJECT
FORMULA/SCORING CREATION = FORBIDDEN
```

## 6. Proposed focused test contract

Modify only `tests/mbo-xlsx-template-profile.test.js` and prove at minimum:
1. all existing semantic/profile tests remain passing;
2. profile source remains import-pure/browser-safe and contains no Node filesystem/path/local-template behavior;
3. Part A N4..N10 returns exact objective structural geometry, dimension and Print_Area progression;
4. Part A page setup authority remains paperSize 8 / landscape / scale 58;
5. Part A base sensitive-range topology is exact, immutable and duplicate-free after deterministic expansion;
6. Part A relocation metadata identifies source row 28 and downstream threshold 29 without engine-side literals;
7. Part B N6/N7/N8 returns exact clone-block/downstream/dimension/Print_Area topology;
8. Part B intermediate merge counts are 79/85/91;
9. Part B final overlay merge counts are 79/86/93;
10. Part B summary starts are 31/35/39;
11. Part B base/effective privacy counts are 432/474/516 and 432/492/552;
12. presentation dynamic ranges are exact +0/+18/+36 topology;
13. Rating Scale and padding remain protected/static;
14. Chief R:X is not widened;
15. Part B base sensitive-range topology is exact and immutable;
16. unsupported objective/competency counts fail closed;
17. no new SAFE/UNRESOLVED/NO_SOURCE role-count changes;
18. `validateMappingIntegrity()` continues to pass and rejects topology mutations through focused mutation-style tests where practical.

No template binary/local owner files are required for this profile-only gate.

## 7. What comes after R2-A — NOT AUTHORIZED

Only after independent R2-A closure:

```text
R2-B = SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER ENGINE
  bytes-in -> new bytes-out
  consumes Template Profile topology
  validates exact template identity
  performs accepted structural transforms
  preserves package/reference-image/Print_Area invariants
  sanitizes broad sensitive topology
  no semantic writes

R2-C = SECURED SEMANTIC VALUE RENDERER
  prepared sanitized bytes + secured MboExportService projection + Template Profile
  writes only SAFE roles whose secured paths are present
  no raw Kintone / aliases / scoring

COMBINED_EXCEL_PARITY = LATER D2 GATE
D3 = HOLD UNTIL D2 PASS / CLOSED
```

## 8. Owner decision

Recommended Owner authorization phrase:

`อนุมัติ D2-WP004-R2-A PROFILE+TEST ตามขอบเขตที่เสนอ`

Until exact Owner authorization:

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
PRODUCTION_RENDERER = NOT AUTHORIZED
KINTONE_WRITE = NONE
DEPLOY = NONE
D3 = HOLD
```
