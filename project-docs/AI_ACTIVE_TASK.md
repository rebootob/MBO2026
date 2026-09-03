# AI ACTIVE TASK — R2-B1-R9 STOPPED ON CONFIRMED SOURCE DEFECT / R10 PROPOSED

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-03 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`, `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`, and only exact Part A source/test/profile evidence needed.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = CONFIRMED PRODUCTION STRUCTURAL DEFECT / NOT CLOSED
D2_WP004_R2_B1_R4 = PRIOR SOURCE REVIEW PASS / SUPERSEDED BY NEW R9 DEFECT EVIDENCE
D2_WP004_R2_B1_R8 = RELATIONSHIP PROOF PASS / FROZEN
D2_WP004_R2_B1_R9 = EXECUTED / NO-FILTER PROOF EXPOSED PRODUCTION DEFECT / STOPPED / NO PUSHED IMPLEMENTATION COMMIT

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
R2_B1_RELATIONSHIP_PROOF = PASS / FROZEN
R2_B1_CELL_STRUCTURAL_PROOF = FAIL DUE CONFIRMED PRODUCTION BEHAVIOR
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```

## 2. R9 execution outcome

```text
R9_AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R9-TEST-ONLY-CORRECTIVE-20260903-01
R9_AUTHORIZATION_COMMIT = b6db31e40cfcca56ba26bdc18249c146f6e55c01
R9_PUSHED_IMPLEMENTATION_COMMIT = NONE
R9_TOKEN_STATE = CONSUMED BY EXECUTION / DO NOT REUSE
RESULT = POTENTIAL PRODUCTION SOURCE STRUCTURAL DEFECT -> CONFIRMED BY CONTROL-PLANE SOURCE REVIEW
```

Owner-provided live executor evidence reported the strict no-filter proof exposed two production effects:

1. **Cell type mutation** — exact owner SOURCE cell such as `N6` contains structural attributes including `t="s"`; after Part A sanitization the output keeps the cell/style but loses `t="s"` when the value is cleared.
2. **Cell-node materialization** — sanitization of ranges containing empty/merged cells can create new empty `<c ... s="1"/>` nodes that were absent from exact owner SOURCE XML (example evidence around `AL42:AY42` after relocation).

Executor correctly STOPPED and did not change frozen production source/profile under R9 authority.

## 3. Independent causal review of production source

Current production sanitizer performs a write/re-serialize pass before the raw OOXML structural pass:

```text
sheetSanitize.range(rangeStr).value(null)
sheetSanitize.cell(rangeStr).value(null)
const sanitizedBytes = await wbSanitize.outputAsync()
```

This XlsxPopulate mutation/output path is consistent with both observed structural defects:
- clearing a shared-string cell can re-serialize the `<c>` node without its original `t="s"` attribute;
- range writes can materialize empty cell nodes that did not exist in raw owner template XML.

Therefore the exact Part A structural-preservation contract cannot be closed while sanitization depends on write/re-serialization of worksheet cells through XlsxPopulate.

This is now a proven new production-source defect. The prior R4 source freeze is reopened only for the narrow sanitizer-preservation defect described here. All unrelated source behavior remains frozen.

## 4. Exact next proposed corrective — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-B1-R10
NAME = PART A RAW-OOXML SANITIZER STRUCTURAL-PRESERVATION CORRECTIVE
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT

PROPOSED_WRITABLE_FILES =
  src/services/mbo-xlsx-template-preparer.js
  tests/mbo-xlsx-template-preparer.test.js

PROFILE_CHANGE_AUTH = NONE
MAX_EXECUTOR_COMMITS = 1
```

R10 must correct only the newly proven sanitizer structural-preservation defect and retain all accepted R7/R8 proof.

## 5. Required R10 source design

### A. Remove worksheet write/re-serialization sanitization

For Part A sensitive-cell clearing, production must no longer use XlsxPopulate worksheet/range write APIs such as:

```text
range(...).value(null)
cell(...).value(null)
```

followed by `wb.outputAsync()` as the sanitization transformation.

XlsxPopulate may be used read-only where necessary to resolve existing SOURCE values/tokens, but worksheet cell writes must not be the sanitizer mechanism.

### B. Sanitize exact existing SOURCE cell nodes in raw OOXML

Operate on exact `xl/worksheets/sheet1.xml` from the SHA-validated owner template package.

For every authorized effective sanitization address:
- if an exact `<c r="...">...</c>` node exists, clear only its value payload;
- preserve the original cell opening-tag structural attributes exactly, including `s`, `t`, and any other attributes;
- preserve the original cell reference/column topology;
- do not create a cell node where SOURCE had no cell node;
- do not materialize blank/merged cells merely because they fall inside a sanitization range;
- if a cell is already self-closing/blank, leave its structural node unchanged;
- zero formulas remain mandatory; unexpected formula payload in an authorized sanitization cell must fail closed rather than be silently rewritten.

Authorized payload clearing may remove value-bearing content such as `<v>...</v>` and inline-string payload as appropriate while retaining the exact structural `<c ...>` authority.

### C. Retain privacy purge

Retain deterministic sensitive-token collection and package privacy proof.

`xl/sharedStrings.xml` stale sensitive-token removal must remain effective even when worksheet cell structure is preserved.

Do not broaden exemptions and do not reintroduce sensitive tokens elsewhere in the package.

### D. Preserve all unrelated production behavior

Do not redesign:
- objective-count validation;
- profile validation;
- SHA validation;
- raw row/cell row-number shifting;
- row28 cloning;
- merge shifting/cloning;
- dimension update;
- Print_Area update;
- exact rId3 relationship/anchor/media removal;
- browser-safe/no-fs/no-path/no-node-crypto contract;
- caller input immutability;
- zero semantic writes/scoring/formulas/Part B mutation.

## 6. Required R10 test acceptance

The R9 no-filter proof becomes mandatory acceptance evidence and must remain strict:
- no style filtering;
- no sanitization-range cell filtering;
- no `s="1"` filtering;
- no type filtering;
- deep-equal complete ordered structural cell inventories from exact SOURCE;
- SOURCE `t` present / OUTPUT missing must fail;
- no extra/missing cells;
- inserted/downstream row structural equality remains SOURCE-derived;
- complete frozen package authority remains deep-equal after only authorized rId3/image3 normalization;
- package-wide privacy remains clean.

Focused run:

`node --test tests/mbo-xlsx-template-preparer.test.js`

Required closure evidence:

```text
FAIL = 0
SKIP = 0
real owner-template integration = EXECUTED / NOT SKIPPED
N4..N10 matrix = PASS
no-filter exact cell structural parity = PASS
relationship proof = PASS
package-wide privacy = PASS
```

If a new unrelated production defect appears, STOP and report it; do not widen source changes without new owner authority.

## 7. R10 forbidden scope

```text
src/profiles/mbo-xlsx-template-profile.js = FROZEN / FORBIDDEN
src/services/mbo-export-service.js = FORBIDDEN
scripts/export/mbo-xlsx-ooxml-feasibility.js = FORBIDDEN
tests/mbo-xlsx-ooxml-feasibility.test.js = FORBIDDEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
Combined Excel = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 8. Owner decision

No source execution is authorized now.

Recommended approval phrase:
`อนุมัติ D2-WP004-R2-B1-R10 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP / WAIT OWNER
R2_B1 = CONFIRMED SOURCE DEFECT / NOT CLOSED
R2_B1_RELATIONSHIP_PROOF = PASS / FROZEN
R2_B1_CELL_PROOF = FAIL UNTIL RAW-OOXML SANITIZER CORRECTIVE
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```
