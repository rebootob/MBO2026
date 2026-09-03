# AI ACTIVE TASK — R2-B2 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / R2-B2 SOURCE+TEST AUTHORIZED / BOUNDED / ONE-SHOT / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`, `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`, `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`, `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md`, and only exact source/profile/test evidence required for R2-B2.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_PART_B_STRUCTURAL = PASS / CLOSED
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = PASS / CLOSED AFTER R10

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B2
ACTIVE_D2_SOURCE_CHANGE_AUTH = R2-B2 ONLY / PREPARER FILE ONLY
ACTIVE_D2_TEST_CHANGE_AUTH = R2-B2 ONLY / NEW PART-B TEST FILE ONLY
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED / ONE-SHOT / MAX 1 COMMIT
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2-B2 = AUTHORIZED / ACTIVE
R2-C = NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-B1 durable closure

```text
R10_AUTHORIZATION_COMMIT = 9a5919f20e53676508862ffce96eaa754556e109
R10_IMPLEMENTATION_COMMIT = 673137c2f28587e058844e93af66dad9fc722d24
R10_FOCUSED_RUNTIME = PASS 4 / FAIL 0 / SKIP 0
OWNER_TEMPLATE_N4_TO_N10 = EXECUTED / PASS
R2_B1 = PASS / CLOSED / FROZEN
```

Do not reopen R2-B1 unless a proven regression is found. Part A behavior inside `mbo-xlsx-template-preparer.js` remains frozen while B2 is implemented.

## 3. R2-B2 authorization

```text
WORK_PACKAGE = D2-WP004-R2-B2
NAME = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_BASIS_HEAD = 11c7e88eb8a516448e682f32e5a1ce755e7a79a3
AUTHORIZATION_TOKEN = D2-WP004-R2-B2-SOURCE-TEST-20260903-01
MAX_EXECUTOR_COMMITS = 1

WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer-part-b.test.js

PROFILE_CHANGE_AUTH = NONE
EXPORT_SERVICE_CHANGE_AUTH = NONE
SEMANTIC_RENDERER_AUTH = NONE
```

Rationale for this smallest scope:
- production browser-safe XLSX preparation already lives in `src/services/mbo-xlsx-template-preparer.js`;
- B2 extends that production module rather than creating a second competing preparer;
- a new focused Part B test file keeps the already-closed Part A proof suite stable and independently reviewable;
- Template Profile authority is already closed and remains frozen;
- `scripts/export/mbo-xlsx-ooxml-feasibility.js` remains READ-ONLY oracle/evidence only and must never be imported by production.

## 4. Frozen Part B source authority

```text
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
MAIN_SHEET = (Part B) Competency
AUXILIARY_SHEET = Sheet1
COMPETENCY_COUNTS = 6 / 7 / 8
BASE_COMPETENCY_COUNT = 6
SOURCE_CLONE_BLOCK = ROWS 27:30
SOURCE_BLOCK_HEIGHT = 4
DOWNSTREAM_THRESHOLD = ROW 31
BASE_DIMENSION = A1:X35
BASE_INTERMEDIATE_MERGES = 79
FORMULA_INVENTORY = 0
```

Count matrix:

```text
N6: extraRows=0 / dimension=A1:X35 / intermediateMerges=79 / finalMerges=79 / summaryStart=31
N7: extraRows=4 / dimension=A1:X39 / intermediateMerges=85 / finalMerges=86 / summaryStart=35
N8: extraRows=8 / dimension=A1:X43 / intermediateMerges=91 / finalMerges=93 / summaryStart=39
```

Exact Print_Area authority:

```text
N6 '(Part B) Competency'!$A$1:$X$35
N7 '(Part B) Competency'!$A$1:$X$39
N8 '(Part B) Competency'!$A$1:$X$43
```

Main-sheet page authority remains paperSize 9 / portrait / scale 75 / horizontal centered / sheet protection present. `Sheet1`, sheet names/states, non-target defined names, columns, gridlines, page margins, fit-to-page, vertical centering, sheet relationships, relationship tuples and media inventory remain source-baseline equal except only an independently proven authorized normalization may differ. B2 must not assume Part A `rId3/image3` removal applies to Part B.

## 5. Required B2 production API

Add one production entry point to the existing preparer module:

```text
preparePartBTemplate(templateBytes, { competencyCount = 6, profile } = {})
```

Contract:
- browser-safe buffer/Uint8Array in -> NEW Uint8Array out;
- zero Node `fs`, `path`, Node `crypto` in production;
- validate `validateMappingIntegrity(profile)` before template mutation;
- validate competencyCount exactly 6/7/8;
- validate exact Part B SHA before mutation;
- never mutate caller/source bytes in place;
- zero Kintone access;
- zero secured projection input;
- zero semantic/user value writes;
- zero scoring/recalculation;
- zero formula creation;
- zero Part A behavior change.

## 6. Required B2 transform order

Production order must be fail-closed and sentinel-free:

```text
EXACT OWNER PART B BYTES
-> SHA + raw-source guards
-> frozen structural transform
-> verify frozen intermediate structural authority
-> validate source-backed privacy/protected-static topology
-> apply exact presentation title-merge overlay
-> verify final presentation topology
-> raw-OOXML sanitization of exact Profile effective ranges
-> stale sensitive-token/sharedStrings/package purge
-> final preservation/privacy/formula validation
-> NEW output bytes
```

No proof sentinels such as `SENTINEL_ROW_31` may enter production output.

## 7. Raw-source guards before mutation

B2 must fail closed unless exact owner SOURCE proves:
- main worksheet XML exists;
- workbook XML exists;
- main dimension exactly `A1:X35`;
- actual merge inventory exactly 79;
- declared merge count exactly 79;
- source rows 27, 28, 29, 30 and downstream row31 each exist exactly once;
- source rows27:30 contain exactly the frozen six source-block merge ranges;
- exactly one `_xlnm.Print_Area` exists;
- Print_Area binds localSheetId=0 and equals exact base Part B Print_Area;
- no auxiliary `Sheet1` Print_Area exists;
- workbook-wide formula inventory is exactly zero.

Any mismatch -> `EXPORT_TEMPLATE_PREPARER_UNRESOLVED` or equally deterministic fail-closed production error.

## 8. Sentinel-free frozen structural transform

For N7/N8 only:
- shift complete rows/cell row references at rows >=31 by `extraRows`;
- clone exact SOURCE rows27:30 once for N7 and twice for N8;
- clone exactly the SOURCE block merge topology for each inserted block;
- shift downstream merge references exactly;
- preserve rows1:30 structurally;
- relocate original rows31:35 exactly by `extraRows`;
- update dimension and Print_Area exactly;
- declared merge count must equal actual merge inventory.

Before presentation overlay, exact intermediate authority must be verified:

```text
N6 = 79 merges
N7 = 85 merges
N8 = 91 merges
```

Do not weaken the frozen Part B structural baseline in order to reach final overlay topology.

## 9. Expanded presentation overlay

Only after frozen intermediate verification:

```text
N6: no title merge added
N7: add exactly B31:J31
N8: add exactly B31:J31 and B35:J35
```

Existing description merges must remain:

```text
B32:J32
B36:J36 (N8)
```

Final exact merge counts:

```text
N6 = 79
N7 = 86
N8 = 93
```

Protected static authority:

```text
Rating Scale = B29:J29 / B33:J33 / B37:J37 as applicable
Padding rows = 30 / 34 / 38 as applicable
```

These protected cells/rows must not be cleared or rewritten.

## 10. Source-backed privacy validation boundary

B2 production must validate the exact post-structural topology against closed source authority before sanitization. It must not import/call the Node feasibility harness.

At minimum, fail closed on divergence in the authority needed to distinguish dynamic vs protected cells:
- exact row/source-row relocation;
- style identity;
- normalized merge identity;
- protected padding/rating-scale topology;
- exact Profile effective sanitization set;
- zero overlap between effective sanitization and protected padding/rating static authority.

Frozen base source-backed dynamic counts remain:

```text
N6 = 432
N7 = 474
N8 = 516
```

After presentation overlay authority, exact effective dynamic/sanitization counts are:

```text
N6 = 432
N7 = 492
N8 = 552
```

No stale source-summary classification is allowed inside inserted competency blocks.

## 11. Structural-preserving raw OOXML sanitization

Reuse the accepted R10 principle; do not use XlsxPopulate worksheet write/re-serialization as the sanitizer.

For exact Profile `effectiveSanitizationRanges`:
- clear only payload of existing target cell nodes;
- preserve structural cell attributes (`r`, `s`, `t`, other attrs);
- do not create absent cell nodes;
- fail closed if unexpected formula payload is found;
- preserve protected static cells exactly;
- clear stale cloned competency-6 presentation in B31:J32 / B35:J36 before later R2-C writes;
- clear relocated summary/signature dynamic values;
- preserve caller bytes.

Sensitive tokens derived only from authorized SOURCE-sensitive cells must be absent from relevant final UTF-8 XML/text package entries and stale shared-string remnants must be purged without broad exemptions.

## 12. B2 is preparer/sanitizer only — semantic writes forbidden

B2 MUST NOT write:
- header values;
- self ratings;
- title/description secured values;
- Part B score values;
- any Kintone values;
- any reconstructed scoring value.

In particular, B31/B32/B35/B36 must be structurally ready and sanitized/blank for R2-C; B2 must not populate `presentationTitle` or `presentationDescription`.

## 13. Exact test contract

New focused file:

```text
tests/mbo-xlsx-template-preparer-part-b.test.js
```

The test oracle must derive expected authority DIRECTLY from the exact SHA-matching owner Part B SOURCE OOXML. It must not use feasibility output or production output as expected truth.

Required proof matrix N6/N7/N8:
- missing owner template = FAIL, never skip;
- wrong SHA = FAIL;
- exact caller-byte immutability success/failure;
- no Node-only production dependency / no sentinel text;
- exact rowRefs and uniqueness;
- rows1:30 exact SOURCE-derived structural parity;
- inserted rows exact normalized SOURCE rows27:30 clones;
- downstream SOURCE rows31:35 exact relocated structural parity;
- complete cell structural inventory, no style/type/cell filtering;
- exact intermediate merge inventory 79/85/91 before overlay authority proof;
- final merge inventory 79/86/93 with only exact authorized title merge additions;
- declared merge count = actual;
- exact dimensions and Print_Area;
- exact sheet names/order/states;
- exact auxiliary `Sheet1` fingerprint;
- source-derived columns/gridlines/page margins/page setup/centering/protection/sheetRels authority;
- complete relationship tuple inventory and media inventory baseline equality unless an exact separately proven authorized difference is present;
- workbook formula inventory exactly zero;
- protected Rating Scale and padding rows exact SOURCE-derived preservation;
- exact effective sanitization address sets/counts 432/492/552;
- every effective dynamic target cleared;
- B31:J32/B35:J36 presentation targets cleared as applicable;
- package-wide relevant UTF-8 privacy scan clean;
- no semantic values written;
- output is new Uint8Array.

No test-side filtering/exclusion may hide production structural mutations.

## 14. Focused runtime gate

Exact command:

`node --test tests/mbo-xlsx-template-preparer-part-b.test.js`

Closure requires:

```text
FAIL = 0
SKIP = 0
real owner Part B template = EXECUTED / NOT SKIPPED
N6/N7/N8 matrix = PASS
intermediate structural authority = PASS
final presentation overlay authority = PASS
protected static parity = PASS
privacy/sanitization = PASS
package/formula preservation = PASS
```

## 15. Forbidden scope

```text
src/profiles/mbo-xlsx-template-profile.js = FROZEN / FORBIDDEN
src/services/mbo-export-service.js = FORBIDDEN
scripts/export/mbo-xlsx-ooxml-feasibility.js = FORBIDDEN
existing feasibility tests = FORBIDDEN
existing Part A preparer test = FROZEN / FORBIDDEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
R2-C semantic renderer = NOT AUTHORIZED
Combined Excel = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 16. Execution protocol

Before commit:

`git diff --name-only`

It MUST show only:

```text
src/services/mbo-xlsx-template-preparer.js
tests/mbo-xlsx-template-preparer-part-b.test.js
```

Then:
1. run the exact focused test;
2. require FAIL=0 and SKIP=0;
3. verify real owner Part B N6/N7/N8 matrix executed;
4. create EXACTLY ONE SOURCE+TEST commit;
5. push to `ai/antigravity-wp002c`;
6. report pushed SHA, exact changed files and focused runtime result;
7. STOP;
8. do not self-declare B2 PASS/CLOSED;
9. do not start R2-C or any later gate.
