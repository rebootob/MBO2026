# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / PRESERVATION CLOSED / REFERENCE-IMAGE CLOSED / PART A CLOSED / PART B R5-R1 AUTHORIZED**  
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

## 3. R5 frozen matrix + remaining corrective

```text
R5_IMPLEMENTATION_COMMIT = 068e719a7b6c0fee66613619a7aa7ed359960cb5
R5_SCOPE_REVIEW = PASS
R5_MATRIX_SOURCE_BEHAVIOR = PASS / FROZEN EXCEPT FAIL-CLOSED BASELINE GUARD
R5_MATRIX_PROOF = PASS EXCEPT DEFINED-NAME CONTROL
R5_STATUS = CORRECTIVE REQUIRED
D2_PART_B_STRUCTURAL_GATE = CORRECTIVE REQUIRED / NOT CLOSED
```

Accepted/frozen matrix behavior/proof:
- real 6/7/8 variants from the same helper;
- 6 => A1:X35 / 79 merges / main print X35;
- 7 => A1:X39 / 85 merges / main print X39;
- 8 => A1:X43 / 91 merges / main print X43;
- exact rowRefs/uniqueness, block clone/downstream/sentinel relocation and full merge-set equality;
- Part B A4 (`paperSize=9`) / portrait / scale 75 / horizontal centered / protected;
- exact `Sheet1` stability, relationship/media equality and workbook-wide zero formulas.

## 4. R5-R1 authorization

```text
ACTIVE_WORK_PACKAGE = D2-WP003-R5-R1
OWNER_APPROVAL_BASELINE_HEAD = 24d7841af7156f0de2e2aa3c37464b9cb7e81bd2
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R5-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R5-R1-SOURCE-TEST-20260902-01
AUTHORIZED_SCOPE = SOURCE+TEST / EXACT SAME TWO FEASIBILITY FILES ONLY
```

Writable only:
- `scripts/export/mbo-xlsx-ooxml-feasibility.js`
- `tests/mbo-xlsx-ooxml-feasibility.test.js`

R5-R1 may only close:
1. raw owner-template fail-closed prerequisite authority before mutation: exact source dimension A1:X35, actual+declared merge inventory 79, six source-block merges, required rows/package parts, and exactly one source `_xlnm.Print_Area` at localSheetId 0 with exact X35 value and no Sheet1 binding;
2. explicit defined-name proof for source and 6/7/8 outputs: exactly one expected main Print_Area/localSheetId0, `Sheet1` printArea empty, and all non-print-area defined names unchanged.

Every accepted R5 matrix assertion must remain. After raw-source authority passes, deterministic count-dependent dimension/Print_Area emission on the working copy remains allowed bounded construction, not generic repair.

## 5. Privacy boundary

Current accepted privacy mapping remains authority for the source 6-block layout. R5-R1 must not modify privacy/sanitization. Expanded 7/8 competency rows and shifted summary/signature rows require explicit address-role remapping before production renderer/security closure.

## 6. Remaining D2 path after Part B closure

1. formula/no-formula authority;
2. production sanitizer/XLSX renderer + expanded Part B privacy remap;
3. combined Excel parity;
4. PDF parity;
5. export authorization/security/privacy regression;
6. final independent D2 closure.