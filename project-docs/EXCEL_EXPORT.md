# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / XLSX PREPARER + SECURED RENDERER + COMBINED COMPOSER CLOSED / EXPORT SERVICE INTEGRATION NOT AUTHORIZED**. Updated 2026-09-07 ICT.

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

Production flow authority is now closed through R2-D1:

```text
OWNER TEMPLATE BYTES
  -> sentinel-free structural preparation / sanitization
  -> exact Profile topology validation
  -> secured MboExportService projection only
  -> secured semantic renderer
  -> post-render OOXML combined composition (Part A + Part B)
  -> formula inventory remains 0
  -> package/static/privacy preservation guards
  -> NEW output bytes / caller input immutable
```

Part A owner counts N4..N10 and Part B N6/N7/N8 are covered by exact truth/preservation tests. b7/b8 expanded presentation is canonical-only; b1..b6 presentation remains owner-template static. Chief R:X remains non-writable privacy authority. Combined output contains Sheet 1 (`MBO Staff & Chief`) and Sheet 2 (`(Part B) Competency`), excluding Part B auxiliary `Sheet1`.

R2-D1 final accepted runtime evidence on owner workstation (HEAD `ebd3e7d2770817768c61707fbbd81a8ad9e85b01`):

```text
Focused composer = 18/18 PASS / FAIL 0 / SKIP 0
Frozen regression = 37/37 PASS / FAIL 0 / SKIP 0
node --check composer = PASS
git diff --check = PASS
```

`D2-WP004-R2-D1 = PASS / CLOSED`.

## Current next D2 gate

```text
EXPORT_SERVICE_INTEGRATION = NEXT D2 GATE / NOT AUTHORIZED
CONTROL-PLANE PLANNING REQUIRED BEFORE IMPLEMENTATION
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```

Before export service integration is proposed, Control Plane must inspect current repository truth and define the smallest integration contract against the closed preparer + renderer + composer authority. Do not reopen R2-D1 or start implementation without a proven regression and explicit owner authorization.
