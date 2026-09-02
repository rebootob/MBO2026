# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / PRESERVATION CLOSED / REFERENCE-IMAGE CLOSED / PART A STRUCTURAL CLOSED / PART B R5 PROPOSED**  
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
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
PART_B_PRIVACY_CLASSIFICATION_EVIDENCE_PARITY = PASS / CLOSED FOR 6-BLOCK SOURCE TEMPLATE
TYPED_PRIVACY_METADATA_COMPLETENESS = PASS / CLOSED
TYPED_METADATA_VALIDATOR_SHAPE = PASS / CLOSED
HEADER_FINGERPRINT_SANITIZED_EXPORT_PARITY = PASS / CLOSED
DIFFICULTY_LEVEL_EXPORT = BLANK TEMPORARILY
D2-PRESERVATION-PARTB-SHEETPR-DECISION-01 = OPTION B APPROVED
```

## 4. Part A structural closure

```text
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054 / PASS / FROZEN
R4-R2_IMPLEMENTATION_COMMIT = 98da94a07259effd95dcf539de3454b1f94745a8
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
```

Durable authority:
`CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`

## 5. Part B current source truth

At planning baseline `c67c93a7bec6d2a753855073360eb469d33859b9`:
- main sheet = `(Part B) Competency`;
- auxiliary sheet = `Sheet1`;
- owner-template baseline = 6 competency blocks;
- complete source block for competency 6 = rows `27:30`;
- summary/downstream begins at row `31`;
- baseline used/print extent = `A1:X35`;
- baseline merges = `79`;
- main page authority = A4 / portrait / 75% / horizontal centered / protected;
- workbook has zero formulas;
- `getStructuralPartBBuffers()` currently produces only `bufB6` and `bufB8`;
- the 8-block path hard-codes `extraRows=8`, clone blocks `31:34` and `35:38`, shifts downstream rows/cells/merges by 8, dimension to `A1:X43`, print area to `X43`;
- existing test only checks merge counts and print-area suffixes for 6/8.

This does not prove the required middle 7-block structure and does not provide complete structural parity proof.

## 6. Proposed R5 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R5
PROPOSED_WORK_PACKAGE_NAME = PART B COMPETENCY INSERTION STRUCTURAL MATRIX CLOSURE
PROPOSED_SCOPE = SOURCE+TEST / EXACT TWO FEASIBILITY FILES ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
PLANNING_BASELINE_HEAD = c67c93a7bec6d2a753855073360eb469d33859b9
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
```

Proposed writable files only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

R5 should generalize the existing helper to `bufB6`, `bufB7`, `bufB8` plus a `buffers` map while preserving 6/8 semantics and using the same raw OOXML insertion algorithm.

For competency count `N in {6,7,8}`:

```text
extraBlocks = N - 6
extraRows = 4 * extraBlocks
expectedLastRow = 35 + extraRows
expectedMergeCount = 79 + (6 * extraBlocks)
```

Expected exact main dimensions:
- 6 => `A1:X35`
- 7 => `A1:X39`
- 8 => `A1:X43`

Expected exact print areas:
- 6 => `'(Part B) Competency'!$A$1:$X$35`
- 7 => `'(Part B) Competency'!$A$1:$X$39`
- 8 => `'(Part B) Competency'!$A$1:$X$43`

Expected exact merge counts:
- 6 => 79
- 7 => 85
- 8 => 91

Required proof must go beyond counts and include full computed merge-set equality, rowRefs sequence/uniqueness, exact cloned 4-row block normalization against rows 27:30, exact downstream shift, sentinel relocation, sheet names/states, main-sheet non-target layout/setup invariants, exact auxiliary `Sheet1` fingerprint stability, controlled defined names, relationship/media equality and workbook-wide formula inventory exactly empty.

## 7. Privacy boundary before renderer

The accepted Part B privacy/source mapping is tied to the original 6-block source addresses. In 7/8-block output, inserted competency blocks occupy row numbers used by source summary/signature fields and the summary shifts downward. R5 must NOT change privacy/sanitization logic. Production renderer/security work must explicitly map expanded competency and shifted summary roles before D2 closure.

## 8. Remaining D2 path

1. Part B competency insertion structural matrix;
2. formula/no-formula authority;
3. production sanitizer/XLSX renderer, including expanded Part B privacy/address remapping;
4. combined Excel parity;
5. PDF parity;
6. export authorization/security/privacy regression;
7. final independent D2 closure.
