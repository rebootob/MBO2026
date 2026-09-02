# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / PRESERVATION CLOSED / REFERENCE-IMAGE CLOSED / PART A R4-R1 TEST-ONLY AUTHORIZED**  
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

## 4. Part A R4 review

```text
R4_AUTHORIZATION_COMMIT = 8df05db6535a8ce871e987853e5a356ad67f4232
R4_IMPLEMENTATION_COMMIT = bf9ef7e82c78efc2e725614046745a3ccf394054
R4_SCOPE_REVIEW = PASS
R4_SOURCE_REVIEW = PASS / FROZEN
R4_PROOF_REVIEW = FAIL / STRUCTURAL INVARIANT MATRIX INCOMPLETE
R4_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO CI STATUS OR WORKFLOW
D2_PART_A_STRUCTURAL_GATE = CORRECTIVE REQUIRED / NOT CLOSED
```

Accepted R4 source/proof progress remains frozen. Existing fingerprint helpers already expose the missing invariant fields.

## 5. R4-R1 TEST-ONLY authorization

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R4-R1
ACTIVE_WORK_PACKAGE_NAME = PART A STRUCTURAL INVARIANT PROOF CLOSURE
AUTHORIZED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
OWNER_APPROVAL_BASELINE_HEAD = 5f22caf6ffc9d539ce0df0c23663dd934385d923
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R4-R1-TEST-20260902-01
R4_SOURCE_BASELINE = bf9ef7e82c78efc2e725614046745a3ccf394054 / FROZEN
```

R4-R1 must retain the full accepted 4–10 matrix and add only:
- exact `rowRefs` expected sequence;
- `rowRefs` uniqueness/no unexpected rows;
- exact `sheetStates` equality;
- exact equality of main-sheet `colsHash`, `showGridLines`, `pageMargins`, `paperSize`, `orientation`, `scale`, `fitToPage`, `horizontalCentered`, `verticalCentered`, `sheetProtection`, `sheetRels` against the 4-objective baseline.

No source, Part B, preservation/reference-image, renderer, Kintone, deploy, evidence or D3 work is authorized.

## 6. Remaining D2 path after Part A closure

1. Part B competency insertion structural matrix;
2. formula/no-formula authority;
3. production sanitizer/XLSX renderer;
4. combined Excel parity;
5. PDF parity;
6. export authorization/security/privacy regression;
7. final independent D2 closure.
