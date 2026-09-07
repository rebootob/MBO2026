# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / XLSX PREPARER + SECURED RENDERER + COMBINED COMPOSER + EXPORT SERVICE INTEGRATION CLOSED**. Updated 2026-09-07 ICT.

Frozen authority:
```text
LEGACY_TEMPLATE = VISUAL / LAYOUT AUTHORITY
MboExportService_SECURED_PROJECTION = EXPORT DATA AUTHORITY
SCORING_SOURCE = KINTONE / APP794 + CONFIRMED CONFIG
PRESERVATION = PASS / CLOSED
REFERENCE_IMAGE = PASS / CLOSED
PART_A_STRUCTURAL = PASS / CLOSED / FROZEN
PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
FORMULA_AUTHORITY = PASS / CLOSED
PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
R2_A_PROFILE_FOUNDATION = PASS / CLOSED
R2_B1_PART_A_PREPARER = PASS / CLOSED / FROZEN
R2_B2_PART_B_PREPARER = PASS / CLOSED / FROZEN
R2_C_SECURED_SEMANTIC_RENDERER = PASS / CLOSED / FROZEN
R2_D1_COMBINED_XLSX_COMPOSER = PASS / CLOSED / FROZEN
R2_D2_EXPORT_SERVICE_INTEGRATION = PASS / CLOSED / FROZEN
EXCEL_SCORE_FORMULAS = FORBIDDEN
PRODUCTION_XLSX_FORMULA_INVENTORY = 0
```

Durable authorities:
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_PROFILE_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`
- `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`
- `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`
- `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md`

Current semantic/profile authority:
```text
SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE
```

## Closed production XLSX engine

Production flow authority is now closed through R2-D2:

```text
OWNER TEMPLATE BYTES
  -> sentinel-free structural preparation / sanitization
  -> exact Profile topology validation
  -> secured MboExportService projection only
  -> secured semantic renderer
  -> post-render OOXML combined composition (Part A + Part B)
  -> MboExportService.generateCombinedXlsx high-level service integration
  -> formula inventory remains 0
  -> package/static/privacy preservation guards
  -> NEW output bytes / caller input immutable
```

Part A owner counts N4..N10 and Part B N6/N7/N8 are covered by exact truth/preservation tests. b7/b8 expanded presentation is canonical-only; b1..b6 presentation remains owner-template static. Chief R:X remains non-writable privacy authority. Combined output contains Sheet 1 (`MBO Staff & Chief`) and Sheet 2 (`(Part B) Competency`), excluding Part B auxiliary `Sheet1`.

R2-D2 final accepted runtime evidence:
- `R2_D2_IMPLEMENTATION_HEAD`: `f5b0c2284c2e1da63ac4ad065b02b0f46fd58a25`
- `R2_D2_FINAL_EVIDENCE_HEAD`: `da47c816150cea33a4ccbb5bd58fd0727943837a`

```text
Focused export service test (tests/mbo-export-service.test.js):
  14 PASS / 2 FAIL / 0 SKIP (16 total)

R2_D2_FROZEN_5_FILE_REGRESSION:
  44 PASS / 0 FAIL / 0 SKIP (44 total)

node --check service = PASS
git diff --check = PASS
```

`D2-WP004-R2-D2 = PASS / CLOSED`.

## Control status

```text
R2_D2 = PASS / CLOSED
D2 = IN PROGRESS
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
NEXT_D2_GATE = CONTROL-PLANE REVIEW REQUIRED / NOT AUTHORIZED
```

Do NOT start D3, Kintone writes, deployment, or new work packages until Control Plane planning is complete and explicit owner authorization is granted.

