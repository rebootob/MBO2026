# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / PRESERVATION CLOSED / REFERENCE-IMAGE CLOSED / PART A STRUCTURAL MATRIX PROPOSED**  
> Updated: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. Objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

```text
COMPLETE D2 FULLY BEFORE D3.
```

## 2. Authority / identity

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
```

Original employee-bearing binaries remain ignored/not publishable.

## 3. Frozen accepted foundations

```text
D2-WP001 = PASS / CLOSED
D2-WP002 = PASS / CLOSED
D2-WP003-R3-R30 = PASS / CLOSED
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2-WP003-R3-R36 = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
HEADER_FINGERPRINT_SANITIZED_EXPORT_PARITY = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
```

## 4. Part A source truth before R4

Part A base template facts remain:
- main sheet `MBO Staff & Chief`;
- used range A1:BL52;
- print area A1:BJ52;
- 193 merge ranges;
- four base objective rows;
- zero formulas;
- A3 landscape, scale 58%, fit-to-page, hidden gridlines.

Current feasibility source can produce only 4, 5 and 10 objective variants. Current feasibility proof checks only merge count/declaration and print-area ending for those three variants. This is insufficient for a 5–10 structural matrix closure.

## 5. Proposed D2-WP003-R4 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R4
PROPOSED_WORK_PACKAGE_NAME = PART A OBJECTIVE INSERTION STRUCTURAL MATRIX CLOSURE
PROPOSED_SCOPE = FEASIBILITY SOURCE + TEST / EXACT TWO FILES ONLY
PROPOSED_FILES = scripts/export/mbo-xlsx-ooxml-feasibility.js + tests/mbo-xlsx-ooxml-feasibility.test.js
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
```

If authorized, R4 must generalize the existing feasibility Part A helper to expose every objective count 4–10 and prove exact structural transformation for each count. The production renderer is not part of R4.

Required matrix characteristics:
- exact owner-template SHA gate before template-dependent proof;
- counts 4,5,6,7,8,9,10 from the real feasibility source path;
- `extraRows = objectiveCount - 4`;
- exact dimension progression from `A1:BL52` to `A1:BL58`;
- exact print-area progression from `$A$1:$BJ$52` to `$A$1:$BJ$58`;
- exact merge-set transformation, not count-only proof;
- base 193 merges plus exactly 14 cloned row-28 merges for every inserted objective row;
- rows/cells/styles/row-height mapping: rows before insertion unchanged, inserted rows structural clones of row 28, every downstream row shifted by exactly `extraRows` without loss/duplication;
- sentinel downstream row relocation proof;
- sheet names/order/state unchanged;
- columns/page setup/margins/gridlines/fit-to-page properties unchanged except intentional row/dimension/print-area growth;
- relationship/media inventory unchanged;
- formula set remains exactly empty;
- no generated workbook/evidence committed.

If the matrix exposes a defect in the existing insertion algorithm beyond bounded count generalization, executor must stop with a blocker rather than redesigning the algorithm under the same authorization.

## 6. Current gate

```text
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
D3 = HOLD
```

## 7. Remaining D2 path

1. Part A objective insertion structural matrix;
2. Part B competency insertion structural matrix;
3. formula/no-formula authority;
4. production sanitizer/XLSX renderer;
5. combined Excel parity;
6. PDF parity;
7. export authorization/security/privacy regression;
8. final independent D2 closure.
