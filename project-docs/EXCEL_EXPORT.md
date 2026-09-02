# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / PRESERVATION CLOSED / REFERENCE-IMAGE CLOSED / PART A R4-R1 CORRECTIVE REQUIRED**  
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

## 4. Part A source baseline

```text
R4_IMPLEMENTATION_COMMIT = bf9ef7e82c78efc2e725614046745a3ccf394054
R4_SOURCE_REVIEW = PASS / FROZEN
```

Accepted source behavior remains frozen: real feasibility path for objective counts 4–10, row/cell shifting, row-28 cloning, merge shifting/cloning, exact dimensions A1:BL52..58, exact print areas BJ52..58, sentinel setup and backwards-compatible buffer outputs.

## 5. R4-R1 review

```text
R4-R1_AUTHORIZATION_COMMIT = 8b0eb2ca2058c458c40286b6b2d5f55bdb34d703
R4-R1_IMPLEMENTATION_COMMIT = 8a49a9af11f03ec3c2d2e2e3b5cafebe5befd8c6
R4-R1_SCOPE_REVIEW = PASS
R4-R1_PROOF_REVIEW = FAIL / ACCEPTED ABSOLUTE PAGE-SETUP ASSERTIONS REGRESSED
R4-R1_INDEPENDENT_RUNTIME_SIGNAL = UNAVAILABLE / NO CI STATUS OR WORKFLOW
D2_PART_A_STRUCTURAL_GATE = CORRECTIVE REQUIRED / NOT CLOSED
```

Accepted R4-R1 proof additions:
- exact `rowRefs` sequence and uniqueness;
- exact `sheetNames` and `sheetStates` equality;
- exact baseline equality for `colsHash`, `showGridLines`, `pageMargins`, `paperSize`, `orientation`, `scale`, `fitToPage`, `horizontalCentered`, `verticalCentered`, `sheetProtection`, `sheetRels`;
- previously accepted R4 merge/row/sentinel/dimension/print-area/relationship/media/formula proof remains.

Proof regression:
- the previous R4 absolute per-count assertions `paperSize = 8`, `orientation = landscape`, `scale = 58` were removed and replaced only with baseline-relative equality. Those accepted assertions must be restored; baseline-relative equality must also remain.

## 6. Proposed R4-R2 — NOT AUTHORIZED

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R4-R2
PROPOSED_WORK_PACKAGE_NAME = PART A ABSOLUTE PAGE-SETUP ASSERTION RETENTION CLOSURE
PROPOSED_SCOPE = TEST-ONLY / tests/mbo-xlsx-ooxml-feasibility.test.js ONLY
PROPOSED_STATUS = WAIT OWNER AUTHORIZATION
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
```

If authorized, R4-R2 must retain every current R4/R4-R1 assertion and add back exact per-count assertions:
- `paperSize === '8'`;
- `orientation === 'landscape'`;
- `scale === '58'`.

No source, Part B, preservation/reference-image, renderer, Kintone, deploy, evidence or D3 work is authorized by this proposal.

## 7. Remaining D2 path after Part A closure

1. Part B competency insertion structural matrix;
2. formula/no-formula authority;
3. production sanitizer/XLSX renderer;
4. combined Excel parity;
5. PDF parity;
6. export authorization/security/privacy regression;
7. final independent D2 closure.
