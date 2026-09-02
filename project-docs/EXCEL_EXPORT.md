# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **IN PROGRESS / R7-R1 PRIVACY CORRECTIVE AUTHORIZED**  
> Updated: 2026-09-02 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

Fast review: `D2_REVIEW_FAST_START.md` -> `AI_ACTIVE_TASK.md` -> relevant Baseline -> exact diff.

## Objective

Deliver Excel/PDF preserving approved legacy PMS presentation while using current App794/configuration truth and D1 security/privacy boundaries. `COMPLETE D2 FULLY BEFORE D3.`

## Frozen authority

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

## Part B expanded privacy status

```text
R7_IMPLEMENTATION_COMMIT = 993f3bfcc04bd02b0026a677fa5cb10a12c5d5b6
R7_STATUS = CORRECTIVE REQUIRED
D2-WP003-R7-SOURCE-TEST-20260902-01 = CONSUMED / DO NOT REUSE
ACTIVE_WORK_PACKAGE = D2-WP003-R7-R1
R7-R1_STATE = AUTHORIZED / WAIT ANTIGRAVITY IMPLEMENTATION
R7-R1_AUTHORIZATION = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = ff4b830cef3301e15f4571b3abe0c7d1ef7fdfe3
```

Frozen structural layout:
- N=6 => summary/signature 31:34;
- N=7 => inserted block 31:34, summary/signature 35:38;
- N=8 => inserted blocks 31:38, summary/signature 39:42;
- clone authority = source rows 27:30.

Correct privacy semantics:
- source dynamic competency rating rows are 7:29; source row30 is non-dynamic;
- each inserted block maps rows 27:29 as dynamic K:X rating rows and source row30 as non-dynamic padding/static;
- dynamic inventory cardinality = 432 / 474 / 516 for N=6/7/8.

R7-R1 must close only:
1. row30/clone padding role regression;
2. source-backed fail-closed structural-role validation for N7/N8, including relocated summary roles;
3. negative structural-role mismatch proof;
4. N6/N7/N8 privacy-safe synthetic token purge across worksheet/sharedStrings/package evidence;
5. caller/source buffer immutability and zero-formula proof.

Production renderer, `MboExportService`, dependency changes, generated binaries, Kintone/deploy/Live UAT/D3 remain out of scope.

## Remaining D2

1. close R7-R1 expanded privacy remap;
2. Production XLSX renderer/sanitizer;
3. Combined Excel parity;
4. PDF parity;
5. Export authorization/security/privacy regression;
6. Final independent D2 closure.

```text
ACTIVE_D2_SOURCE_CHANGE_AUTH = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_TEST_CHANGE_AUTH = D2-WP003-R7-R1-SOURCE-TEST-20260902-01
ACTIVE_D2_EVIDENCE_WRITE_AUTH = NONE
ANTIGRAVITY = AUTHORIZED ONLY FOR R7-R1 / ONE-SHOT
CLAUDE = STOP
D3 = HOLD
```
