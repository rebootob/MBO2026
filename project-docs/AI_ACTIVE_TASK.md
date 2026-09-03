# AI ACTIVE TASK — R2-B2-R1 AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / R2-B2-R1 SOURCE+TEST CORRECTIVE AUTHORIZED / BOUNDED / ONE-SHOT / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`, `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`, `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`, `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md`, and only exact source/profile/test evidence required for this corrective.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = PASS / CLOSED AFTER R10
D2_WP004_R2_B2 = REVIEWED / SOURCE+TEST DEFECTS / NOT CLOSED
D2_WP004_R2_B2_R1 = AUTHORIZED / ACTIVE

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B2-R1
ACTIVE_D2_SOURCE_CHANGE_AUTH = R2-B2-R1 ONLY / PREPARER FILE ONLY
ACTIVE_D2_TEST_CHANGE_AUTH = R2-B2-R1 ONLY / PART-B TEST FILE ONLY
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / BOUNDED / ONE-SHOT / MAX 1 COMMIT
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2-B2-R1 = AUTHORIZED / ACTIVE
R2-C = NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-B2 implementation identity and review basis

```text
R2_B2_AUTHORIZATION_COMMIT = 0037436d0c90ab84fdcb744cb2d1b8e5e8a0b685
R2_B2_IMPLEMENTATION_COMMIT = 0b4bac862aa2906d1ac11071431dbb268c7b7b5e
R2_B2_SCOPE_REVIEW = PASS
R2_B2_STATE = REVIEWED / NOT CLOSED
R2_B2_R1_AUTHORIZATION_BASIS_HEAD = 25f62aa86585621085d7a16b1992bef79148e504
R2_B2_R1_AUTHORIZATION_TOKEN = D2-WP004-R2-B2-R1-SOURCE-TEST-CORRECTIVE-20260903-01
MAX_EXECUTOR_COMMITS = 1
```

Writable files ONLY:

```text
src/services/mbo-xlsx-template-preparer.js
tests/mbo-xlsx-template-preparer-part-b.test.js
```

Forbidden/frozen:

```text
src/profiles/mbo-xlsx-template-profile.js = FROZEN
existing Part A behavior/test = FROZEN
src/services/mbo-export-service.js = FORBIDDEN
feasibility source/tests = FORBIDDEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
R2-C = NOT AUTHORIZED
Combined Excel = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 3. Accepted portions of R2-B2 to preserve

Preserve these accepted directions:
- `preparePartBTemplate(templateBytes, { competencyCount, profile })` production entry point;
- competency domain fail-closed to 6/7/8;
- exact Part B SHA gate;
- caller-byte copy/immutability;
- browser-safe production boundary with no Node fs/path/crypto imports;
- raw OOXML value-payload sanitization from R10, not XlsxPopulate worksheet write/re-serialization;
- downstream row/cell relocation and SOURCE rows27:30 cloning concept;
- count-dependent dimension and Print_Area;
- presentation title merges only B31:J31 / B35:J35;
- Profile effective sanitization ranges;
- zero semantic projection/Kintone/scoring/recalculation writes;
- fail-closed owner Part B template test loading/SHA;
- direct owner SOURCE OOXML as test authority.

Do not reopen accepted R2-B1 behavior unless a proven regression is independently found.

## 4. BLOCKER A — correct production merge relocation

Current defect:

```text
if (r1 >= 31) r1 += extraRows;
if (r2 >= 29) r2 += extraRows;
```

This incorrectly stretches SOURCE Rating Scale merges such as B29:J29 across inserted blocks.

Required deterministic transform:
1. Parse complete SOURCE merge inventory before mutation.
2. Any SOURCE merge with both endpoints < row31 remains EXACTLY unchanged.
3. Any SOURCE merge with both endpoints >= row31 relocates BOTH endpoints by `extraRows`.
4. Any SOURCE merge crossing row31 must fail closed unless an exact separately frozen rule exists. Do not invent repair.
5. Clone EXACTLY these six SOURCE block merges for each inserted block using +4 / +8 on BOTH endpoints:

```text
B28:J28
K28:Q28
R28:W28
B29:J29
K29:Q29
R29:W29
```

6. Deduplicate/sort and verify exact intermediate authority:

```text
N6 = 79
N7 = 85
N8 = 91
```

7. Add ONLY presentation title overlays:

```text
N7: B31:J31
N8: B31:J31 + B35:J35
```

8. Verify exact final counts:

```text
N6 = 79
N7 = 86
N8 = 93
```

9. Preserve existing description merges B32:J32 and B36:J36 exactly according to SOURCE-derived overlay authority.

## 5. BLOCKER B — exact SOURCE-derived merge inventory proof

The test must no longer use count/presence as a substitute for merge topology.

Required test proof for N6/N7/N8:
1. parse/sort complete exact SOURCE merge inventory;
2. derive expected intermediate inventory DIRECTLY from SOURCE using only the authorized relocation/cloning rules above;
3. deepEqual actual intermediate inventory to expected;
4. derive expected final inventory = expected intermediate + exact authorized title overlays only;
5. deepEqual actual final inventory to expected;
6. declared merge count = actual inventory length;
7. no duplicate merge refs;
8. prove original rows1:30 SOURCE merge identity preserved;
9. prove cloned Rating Scale merges are exact and not stretched.

No count-only proof and no test-side filtering/exclusion.

## 6. BLOCKER C — complete raw SOURCE guards

Before any structural mutation, production must fail closed unless exact owner SOURCE proves:
- main worksheet/workbook XML exist;
- main dimension exactly A1:X35;
- merge inventory exactly 79 and declared count 79;
- rows27,28,29,30,31 each exist exactly once;
- the six exact SOURCE block merge refs above exist as the exact block authority;
- no unexpected block merge is silently accepted;
- any merge crossing row31 is rejected unless exact frozen transformation authority is explicitly present;
- exactly one `_xlnm.Print_Area`, localSheetId=0, exact base value;
- no auxiliary Sheet1 Print_Area;
- workbook-wide formula inventory exactly zero.

Failure must be deterministic `EXPORT_TEMPLATE_PREPARER_UNRESOLVED` or equivalent fail-closed production error.

## 7. BLOCKER D — source-backed post-structural protected/static validation

Before presentation overlay and sanitization, production must independently validate transformed worksheet topology using browser-safe SOURCE-derived authority.

At minimum prove/fail closed on:
- exact row/source-row relocation for inserted/downstream regions;
- exact normalized merge inventory;
- Rating Scale topology:

```text
N6: B29:J29
N7: B29:J29 + B33:J33
N8: B29:J29 + B33:J33 + B37:J37
```

- padding rows 30 / 34 / 38 as applicable;
- style identity needed to distinguish dynamic from protected/static cells;
- exact Profile effective sanitization address set/count:

```text
N6 = 432
N7 = 492
N8 = 552
```

- zero overlap between effective sanitization addresses and protected Rating Scale/padding authority.

Do NOT import/call the Node feasibility harness.

## 8. BLOCKER E — complete Part B proof matrix

### Auxiliary Sheet1 fingerprint
Capture a deterministic full SOURCE-derived auxiliary `Sheet1` fingerprint, not only dimension. Acceptable: exact raw XML hash or equivalent complete normalized authority. DeepEqual SOURCE vs every N6/N7/N8 output.

### Non-target defined names
Capture all non-Print_Area defined names deterministically and deepEqual SOURCE vs output. Print_Area is the only authorized defined-name change.

### Protected static exact preservation
Prove SOURCE-derived structural/style/merge/value preservation for:

```text
N6: B29:J29 + padding row30
N7: B29:J29 + B33:J33 + padding rows30/34
N8: B29:J29 + B33:J33 + B37:J37 + padding rows30/34/38
```

For cloned protected rows/ranges, expected authority must derive from exact SOURCE rows27:30 with row-number normalization only.

### No semantic writes
Retain zero semantic-write proof using actual frozen Part B mapping targets:
- header dynamic targets;
- competency self-rating targets;
- b7/b8 title/description targets;
- Part B summary targets.

Do not use unrelated cells as proxies.

### Existing proof that must remain
Retain:
- rows1:30 direct SOURCE structural parity;
- inserted rows direct SOURCE rows27:30 structural clones;
- downstream rows31:35 exact relocated parity;
- no cell/style/type filtering;
- exact dimensions and Print_Area;
- sheet names/order/states;
- main-sheet columns/gridlines/page margins/page setup/centering/protection/sheetRels authority;
- complete relationship tuple/media inventory parity;
- formula inventory zero;
- every effective sanitization target cleared;
- B31:J32 / B35:J36 presentation targets cleared as applicable;
- package-wide relevant UTF-8 privacy scan;
- output NEW Uint8Array;
- caller bytes unchanged success/failure;
- no sentinels;
- no semantic writes.

## 9. Focused runtime gate

Run exactly:

```text
node --test tests/mbo-xlsx-template-preparer-part-b.test.js
```

Closure candidate requires:

```text
FAIL = 0
SKIP = 0
real owner Part B template = EXECUTED / NOT SKIPPED
N6/N7/N8 matrix = PASS
SOURCE-derived intermediate merge inventory deep equality = PASS
SOURCE-derived final merge inventory deep equality = PASS
protected Rating Scale/padding exact parity = PASS
auxiliary Sheet1 full fingerprint parity = PASS
non-target defined-name parity = PASS
privacy/sanitization = PASS
package/formula preservation = PASS
```

If stricter proof exposes another production defect:
- do NOT weaken tests;
- do NOT broaden source changes;
- report exact evidence and STOP.

## 10. Execution protocol

Before commit:

```text
git diff --name-only
```

It MUST show only:

```text
src/services/mbo-xlsx-template-preparer.js
tests/mbo-xlsx-template-preparer-part-b.test.js
```

Then:
1. run the exact focused test;
2. require FAIL=0 and SKIP=0;
3. verify real owner Part B N6/N7/N8 matrix executed;
4. verify exact intermediate/final merge deep-equality proof passed;
5. verify protected/static, auxiliary Sheet1, non-target defined-name, privacy/package/formula gates passed;
6. create EXACTLY ONE SOURCE+TEST corrective commit;
7. push to `ai/antigravity-wp002c`;
8. report pushed SHA, exact changed files, exact test command/results;
9. STOP;
10. do not modify project-docs;
11. do not self-declare B2 PASS/CLOSED;
12. do not start R2-C or any later gate.

Final executor status:

```text
R2-B2-R1 SOURCE+TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```
