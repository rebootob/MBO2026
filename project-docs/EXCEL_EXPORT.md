# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / PRESERVATION CLOSED / REFERENCE-IMAGE CLOSED / PART A CLOSED / PART B STRUCTURAL CLOSED**  
> Updated: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 0. Fast review entry

Before reviewing D2 export work, read:

`project-docs/D2_REVIEW_FAST_START.md`

Then `AI_ACTIVE_TASK.md`, the directly relevant Baseline, and exact authorization→implementation diff. Do not repeat full closed-gate scans unless current changes touch those dependencies or regression evidence exists.

## 1. Objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

`COMPLETE D2 FULLY BEFORE D3.`

## 2. Frozen authority

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
SCORING_SOURCE_OF_TRUTH = KINTONE / APP794 + CONFIRMED SCORING CONFIG
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
D2_PART_B_STRUCTURAL_GATE = PASS / CLOSED
```

Do not use Excel as a second scoring engine.

Target Formula Authority contract:

```text
EXCEL_SCORE_FORMULAS = FORBIDDEN
EXPORT_RENDERER_SCORE_RECALCULATION = FORBIDDEN
AUTHORIZED_APPROVER_EXPORT = SCALAR VALUES FROM SECURED PROJECTION ONLY
EMPLOYEE_SELF_CONFIDENTIAL_SCORE_FIELDS = OMIT / BLANK; NEVER RECALCULATE
PRODUCTION_XLSX_FORMULA_INVENTORY = EXACTLY ZERO
```

## 3. Part A + Part B durable structural closure

Part A authority:
`CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`

Part B authority:
`CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`

Key Part B commits:

```text
R5_IMPLEMENTATION_COMMIT = 068e719a7b6c0fee66613619a7aa7ed359960cb5
R5-R1_IMPLEMENTATION_COMMIT = 223f293057219efe0e6410029523bd904c92c6ae
R5-R1_STATUS = PASS / CLOSED
```

Frozen Part B matrix:
- 6 competencies => `A1:X35`, 79 merges, print area X35;
- 7 competencies => `A1:X39`, 85 merges, print area X39;
- 8 competencies => `A1:X43`, 91 merges, print area X43;
- exact rowRefs/uniqueness, block clone/downstream/sentinel relocation and full merge-set equality;
- exact raw-source fail-closed dimension/merge/defined-name guards before mutation;
- exactly one main Print_Area/localSheetId0, empty `Sheet1` print area and non-print defined-name stability;
- Part B A4 (`paperSize=9`) / portrait / scale 75 / horizontally centered / protected;
- exact `Sheet1` stability, relationship/media equality and workbook-wide zero formulas.

## 4. Privacy boundary

Current accepted privacy mapping remains authority for the source 6-block layout only.

```text
PART_B_EXPANDED_PRIVACY_ADDRESS_REMAP = REQUIRED BEFORE PRODUCTION RENDERER / SECURITY CLOSURE
```

Expanded 7/8 competency rows and shifted summary/signature rows require explicit address-role remapping in the production renderer/security gate. Structural closure does not perform that remap.

## 5. Remaining D2 path

1. formula/no-formula authority;
2. production sanitizer/XLSX renderer + expanded Part B privacy remap;
3. combined Excel parity;
4. PDF parity;
5. export authorization/security/privacy regression;
6. final independent D2 closure.

No source/test/renderer/Kintone/deploy work is currently authorized. Previous 20-round standing review/corrective authority is exhausted and must not be silently reused. Antigravity remains one-shot only after exact Owner authorization.
