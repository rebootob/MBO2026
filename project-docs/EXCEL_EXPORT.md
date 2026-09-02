# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / PRESERVATION + REFERENCE IMAGE + PART A + PART B STRUCTURAL + FORMULA AUTHORITY CLOSED**  
> Updated: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 0. Fast review entry

Read `D2_REVIEW_FAST_START.md` -> `AI_ACTIVE_TASK.md` -> relevant Baseline -> exact diff. Do not repeat full closed-gate scans unless current changes touch those dependencies or regression evidence exists.

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
D2_FORMULA_AUTHORITY_GATE = PASS / CLOSED
EXCEL_SCORE_FORMULAS = FORBIDDEN
EXPORT_RENDERER_SCORE_RECALCULATION = FORBIDDEN
PRODUCTION_XLSX_FORMULA_INVENTORY = EXACTLY ZERO
```

Formula authority:
`CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`.

## 3. Structural Baselines

Part A:
`CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`

Part B:
`CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`

Frozen Part B matrix:
- N=6 => `A1:X35`, 79 merges, summary privacy rows 31:34 in source layout;
- N=7 => `A1:X39`, 85 merges, inserted block rows 31:34, original summary shifts to 35:38;
- N=8 => `A1:X43`, 91 merges, inserted blocks rows 31:38, original summary shifts to 39:42.

## 4. Current open gate — expanded Part B privacy remap

```text
PROPOSED_WORK_PACKAGE = D2-WP003-R7
STATE = PROPOSED / NOT AUTHORIZED
PART_B_EXPANDED_PRIVACY_ADDRESS_REMAP = REQUIRED
```

Current `PART_B_SENSITIVE_RANGES` / source privacy classification is valid only for the original 6-block layout. R7 must make privacy/sanitization count-aware for 6/7/8 while preserving the accepted structural matrix.

Required R7 behavior:
- exact N=6 behavior preserved;
- cloned blocks derive privacy roles from source rows 27:30;
- cloned static competency text remains protected;
- dynamic competency rating cells in inserted blocks are sanitized;
- summary/signature roles relocate exactly to 35:38 or 39:42 for expanded layouts;
- no stale summary classification remains at rows 31:34 in N=7/8;
- sanitizer clears only exact count-aware dynamic addresses;
- typed privacy metadata/evidence is exact and fail-closed;
- unsupported count or structural-role mismatch fails closed.

Full contract: `AI_ACTIVE_TASK.md`.

## 5. Remaining D2 path

1. R7 expanded Part B privacy remap 6/7/8;
2. production XLSX renderer/sanitizer consuming secured projection + frozen formula/structural/privacy contracts;
3. combined Excel parity;
4. PDF parity;
5. export authorization/security/privacy regression;
6. final independent D2 closure.

No source/test/renderer/Kintone/deploy work is currently authorized. Antigravity remains one-shot only after exact Owner authorization. D3 remains HOLD.
