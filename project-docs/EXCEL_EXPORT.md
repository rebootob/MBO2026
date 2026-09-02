# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / PRESERVATION CLOSED / REFERENCE-IMAGE CLOSED / PART A STRUCTURAL CLOSED / PART B R5 AUTHORIZED**  
> Updated: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

## 1. Objective

Deliver Excel/PDF outputs preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries.

`COMPLETE D2 FULLY BEFORE D3.`

## 2. Frozen authority

```text
LEGACY TEMPLATE = VISUAL / LAYOUT AUTHORITY
CONFIRMED_BASELINE + CURRENT APP CONFIG = BUSINESS RULE AUTHORITY
SECURED MboExportService PROJECTION = EXPORT DATA AUTHORITY
PART_A_SHA256 = 03d1e8c32bacea9277a8725010237eb46b46dd5f3b7799db7b8b89c3f6e28ef3
PART_B_SHA256 = c210c049ccc1daa83449f08c41276d4a668d1518864c7780a72e611ae15ed5b3
D2_PRESERVATION_GATE = PASS / CLOSED
D2_REFERENCE_IMAGE_GATE = PASS / CLOSED
D2_PART_A_STRUCTURAL_GATE = PASS / CLOSED
```

Original employee-bearing binaries remain ignored/not publishable.

## 3. R5 authorization

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R5
ACTIVE_WORK_PACKAGE_NAME = PART B COMPETENCY INSERTION STRUCTURAL MATRIX CLOSURE
OWNER_APPROVAL_BASELINE_HEAD = 519312ca84b99091a3e863815a398688111dcb39
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R5-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R5-SOURCE-TEST-20260902-01
AUTHORIZED_SCOPE = SOURCE+TEST / EXACT TWO FEASIBILITY FILES ONLY
```

Writable only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

R5 must use the existing raw-OOXML 4-row competency-block algorithm and support real variants 6, 7 and 8.

For `N in {6,7,8}`:
```text
extraBlocks = N - 6
extraRows = 4 * extraBlocks
expectedLastRow = 35 + extraRows
expectedMergeCount = 79 + 6 * extraBlocks
```

Exact matrix:
- 6 => dimension `A1:X35`, print area `'(Part B) Competency'!$A$1:$X$35`, merges 79
- 7 => dimension `A1:X39`, print area `'(Part B) Competency'!$A$1:$X$39`, merges 85
- 8 => dimension `A1:X43`, print area `'(Part B) Competency'!$A$1:$X$43`, merges 91

Proof must include exact rowRefs/uniqueness, block clones from rows 27:30, downstream shift from row 31, sentinel relocation, full merge inventory, main non-target setup invariants, exact `Sheet1` stability, defined-name control, relationships/media and workbook-wide zero formulas.

Absolute Part B main page authority remains A4 (`paperSize=9`) / portrait / scale 75 / horizontal centered / protected.

## 4. Privacy boundary

Current accepted privacy mapping remains authority for the source 6-block layout. R5 must not modify privacy/sanitization code or evidence. Expanded 7/8 competency rows and shifted summary/signature rows require explicit address-role remapping before production renderer/security closure.

## 5. Out of scope

No Part A, preservation/Option B, reference-image, privacy/sanitization, dependency, renderer, combined Excel, PDF, evidence, Kintone, deploy, D3 or next-WP work is authorized.

## 6. Remaining D2 path after R5

1. formula/no-formula authority;
2. production sanitizer/XLSX renderer + expanded Part B privacy remap;
3. combined Excel parity;
4. PDF parity;
5. export authorization/security/privacy regression;
6. final independent D2 closure.