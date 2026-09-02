# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R7 PRIVACY REMAP AUTHORIZED**  
> Updated: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 0. Fast review entry

Read `D2_REVIEW_FAST_START.md` -> `AI_ACTIVE_TASK.md` -> relevant Baseline -> exact diff.

## 1. Objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

`COMPLETE D2 FULLY BEFORE D3.`

## 2. Frozen authority

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
SCORING_SOURCE_OF_TRUTH = KINTONE / APP794 + CONFIRMED SCORING CONFIG
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
D2_PART_B_STRUCTURAL_GATE = PASS / CLOSED
D2_FORMULA_AUTHORITY_GATE = PASS / CLOSED
EXCEL_SCORE_FORMULAS = FORBIDDEN
EXPORT_RENDERER_SCORE_RECALCULATION = FORBIDDEN
PRODUCTION_XLSX_FORMULA_INVENTORY = EXACTLY ZERO
```

Durable Baselines:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`

## 3. Active R7 — expanded Part B privacy remap

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R7
R7_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
R7_AUTHORIZATION = D2-WP003-R7-SOURCE-TEST-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = a76bc4fe6619ba9c1f369b5ed18a70e7837ba816
PART_B_EXPANDED_PRIVACY_ADDRESS_REMAP = ACTIVE R7 CLOSURE TARGET
```

Writable only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

Frozen structural layout facts:
- N=6 => summary/signature rows 31:34;
- N=7 => inserted block rows 31:34; summary/signature rows 35:38;
- N=8 => inserted blocks rows 31:38; summary/signature rows 39:42.

R7 must preserve source-6 privacy behavior; derive inserted block role semantics from source rows 27:30; protect cloned static competency text; sanitize exact count-aware dynamic cells only; eliminate stale source-6 summary classification from expanded variants; use real structural buffers; and fail closed on unsupported count or structural-role mismatch.

R7 must also prove sensitive-token purge and typed privacy metadata against the exact count-aware inventory.

## 4. Explicit R7 exclusions

No Production XLSX renderer yet. No `MboExportService` change. No dependency/package-lock change. No generated XLSX/PDF/image/evidence binary. No Kintone/deploy/ACL/process/Live UAT/D3.

## 5. Remaining D2 after R7

1. production XLSX renderer/sanitizer using secured projection + frozen structural/privacy/formula contracts;
2. combined Excel parity;
3. PDF parity;
4. export authorization/security/privacy regression;
5. final independent D2 closure.

Antigravity is authorized for R7 one-shot only and must stop after one bounded implementation/blocker push+report.