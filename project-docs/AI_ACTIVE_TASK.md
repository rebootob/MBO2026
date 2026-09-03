# AI ACTIVE TASK — R2-B1-R10 SOURCE+TEST AUTHORIZED / ACTIVE

Mode: **CONTROL PLANE / SOURCE+TEST / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
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
D2_WP004_R2_B1 = CONFIRMED PRODUCTION STRUCTURAL DEFECT / SOURCE+TEST CORRECTIVE ACTIVE / NOT CLOSED
D2_WP004_R2_B1_R8 = RELATIONSHIP PROOF PASS / FROZEN
D2_WP004_R2_B1_R9 = EXECUTED / NO-FILTER PROOF EXPOSED PRODUCTION DEFECT / STOPPED
D2_WP004_R2_B1_R10 = AUTHORIZED / ACTIVE / SOURCE+TEST

ACTIVE_WORK_PACKAGE = D2-WP004-R2-B1-R10
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP004-R2-B1-R10-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP004-R2-B1-R10-SOURCE-TEST-CORRECTIVE-20260903-01
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = AUTHORIZED / SOURCE+TEST / BOUNDED / ONE-SHOT / ONE COMMIT -> PUSH -> STOP
R2_B1_RELATIONSHIP_PROOF = PASS / FROZEN
R2_B1_CELL_STRUCTURAL_PROOF = FAIL UNTIL R10 CORRECTIVE
R2-B2 = NOT AUTHORIZED
R2-C = NOT AUTHORIZED
D3 = HOLD
```

## 2. Authorization identity

```text
WORK_PACKAGE = D2-WP004-R2-B1-R10
NAME = PART A RAW-OOXML SANITIZER STRUCTURAL-PRESERVATION CORRECTIVE
STATE = AUTHORIZED / ACTIVE
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / LOW-CREDIT
AUTHORIZATION_TOKEN = D2-WP004-R2-B1-R10-SOURCE-TEST-CORRECTIVE-20260903-01
AUTHORIZATION_BASIS_HEAD = df6a519ba3931a3af8131fbc039da484c67c9c37
MAX_EXECUTOR_COMMITS = 1
EXECUTOR = ANTIGRAVITY
FINAL_EXECUTOR_STATE = SOURCE+TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW
```

Owner authorization received exactly:
`อนุมัติ D2-WP004-R2-B1-R10 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Single-use token. Antigravity must STOP after one pushed SOURCE+TEST commit and must not self-declare PASS/CLOSED.

## 3. Confirmed defect basis

R9 strict no-filter proof exposed production structural mutation caused by the current XlsxPopulate worksheet write/re-serialize sanitizer path:

```text
sheetSanitize.range(rangeStr).value(null)
sheetSanitize.cell(rangeStr).value(null)
const sanitizedBytes = await wbSanitize.outputAsync()
```

Confirmed effects:
- existing SOURCE cells can lose structural attribute `t="s"` when value is cleared;
- empty/merged cells within sanitization ranges can be materialized as new `<c ... s="1"/>` nodes that were absent from exact owner SOURCE XML.

This authorization reopens production source ONLY for this narrow sanitizer structural-preservation defect. All unrelated preparer behavior remains frozen.

## 4. Writable scope

Writable files ONLY:

```text
src/services/mbo-xlsx-template-preparer.js
tests/mbo-xlsx-template-preparer.test.js
```

Forbidden:

```text
src/profiles/mbo-xlsx-template-profile.js
src/services/mbo-export-service.js
scripts/export/mbo-xlsx-ooxml-feasibility.js
tests/mbo-xlsx-ooxml-feasibility.test.js
project-docs/*
package.json
package-lock.json
dist/*
UI / integration
R2-B2
R2-C
Combined Excel
Kintone write/deploy/Live UAT
D3
```

## 5. Required R10 source corrective

### A. Remove worksheet write/re-serialization as the Part A sanitizer

For Part A sensitive-cell clearing, production must no longer mutate worksheet cells/ranges through XlsxPopulate APIs such as:

```text
range(...).value(null)
cell(...).value(null)
```

followed by `outputAsync()` as the sanitization transformation.

XlsxPopulate may remain for read-only parsing where necessary, but must not be the mechanism that writes/clears Part A worksheet cell values.

### B. Sanitize exact existing cell nodes in raw `sheet1.xml`

Operate on exact `xl/worksheets/sheet1.xml` from the SHA-validated owner-template package.

For each authorized effective sanitization address:
- locate the exact existing SOURCE `<c r="...">...</c>` node if present;
- preserve opening-tag structural attributes exactly, including `r`, `s`, `t`, and any other attributes;
- clear only value-bearing payload;
- do not create a `<c>` node where SOURCE has none;
- do not materialize blank/merged cells merely because an address lies inside an authorized range;
- if an existing cell is self-closing/blank, leave its structural node unchanged;
- unexpected formula payload must fail closed; do not silently rewrite formulas.

Permitted payload clearing must be minimal and deterministic, e.g. remove/empty only payload elements appropriate to the existing cell representation such as `<v>...</v>` and inline-string payload while retaining the exact cell structural opening tag.

### C. Preserve sensitive-token collection and stale shared-string purge

Privacy remains mandatory:
- sensitive tokens must continue to be derived from authorized SOURCE sensitive cells only;
- `xl/sharedStrings.xml` stale sensitive token purge must remain effective;
- package-wide privacy test remains fail-closed;
- no broad token exemptions.

If read-only XlsxPopulate access is needed to resolve SOURCE values/tokens, it must not serialize the worksheet before raw-OOXML sanitization.

### D. Preserve all unrelated production behavior

Do not redesign or change unless directly required by the defect:
- objectiveCount domain validation;
- Profile integrity validation;
- owner template SHA validation;
- caller-input immutability;
- raw row shift >=29;
- cell row-number relocation;
- row28 cloning;
- merge shifting/cloning;
- dimension update;
- Print_Area update;
- exact rId3 relationship/anchor/media removal;
- browser-safe contract;
- zero semantic/user writes;
- zero scoring/recalculation;
- zero formulas;
- zero Part B mutation.

R8 exact relationship proof is accepted/frozen and must remain unchanged in behavior.

## 6. Required R10 test corrective / acceptance

R9 no-filter proof is the mandatory acceptance gate. Do NOT weaken it.

Required:
- no style filtering;
- no sanitization-range cell filtering;
- no `s="1"` filtering;
- no type filtering;
- exact SOURCE-derived ordered cell inventory;
- deep-equal complete normalized cell structural objects;
- SOURCE `t` present / OUTPUT missing = FAIL;
- SOURCE `t` absent / OUTPUT added = FAIL;
- no extra/missing cells;
- rows 1:28, inserted rows, and relocated downstream rows remain exact SOURCE-derived structural equality;
- complete frozen package authority remains deep-equal after only already-authorized rId3/image3 normalization;
- package-wide privacy remains clean;
- relationship proof remains PASS.

Add/retain targeted regression proof for the confirmed defect, including at minimum:
- an existing shared-string sensitive cell preserves its original structural attributes, including `t="s"`, after sanitization while its sensitive payload is cleared;
- authorized empty/merged-range addresses that had no SOURCE cell node do not gain new cell nodes in output.

Do not introduce test-only normalization to hide source mutations.

## 7. Required focused run

Run exactly:

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
confirmed R9 regression cases = PASS
```

If a new unrelated production defect appears, STOP and report exact evidence. Do not widen source changes without new owner authority.

## 8. Executor protocol

```text
fresh-fetch canonical branch
-> verify HEAD equals authorization HEAD
-> read fast-start + this task + R2 design + Part A structural baseline
-> inspect exact source/test/profile evidence only
-> modify ONLY the two authorized files
-> implement raw-OOXML sanitizer corrective
-> retain strict no-filter proof and add/retain targeted R9 regressions
-> run focused owner-template test
-> git diff --name-only must show exactly the authorized source/test files (or a strict subset if one file genuinely needs no change)
-> require FAIL=0 / SKIP=0 and all required proof PASS
-> create exactly one SOURCE+TEST commit
-> push ai/antigravity-wp002c
-> report exact evidence
-> STOP
```

Expected executor final status:
`R2-B1-R10 SOURCE+TEST CORRECTIVE COMPLETE / AWAITING CHATGPT INDEPENDENT REVIEW`

## 9. Remaining work — NOT AUTHORIZED

```text
R2-B2 = PART B SENTINEL-FREE PRODUCTION TEMPLATE PREPARER / SANITIZER EXPANSION
R2-C = SECURED SEMANTIC VALUE RENDERER
COMBINED_EXCEL_PARITY = later D2 gate
D3 = HOLD UNTIL D2 PASS / CLOSED
```
