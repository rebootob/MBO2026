# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / XLSX PREPARER + SECURED RENDERER CLOSED / COMBINED EXCEL PARITY NOT AUTHORIZED**. Updated 2026-09-04 ICT.

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

Production flow authority is now closed through R2-C:

```text
OWNER TEMPLATE BYTES
  -> sentinel-free structural preparation / sanitization
  -> exact Profile topology validation
  -> secured MboExportService projection only
  -> secured semantic renderer
  -> formula inventory remains 0
  -> package/static/privacy preservation guards
  -> NEW output bytes / caller input immutable
```

Part A owner counts N4..N10 and Part B N6/N7/N8 are covered by exact truth/preservation tests. b7/b8 expanded presentation is canonical-only; b1..b6 presentation remains owner-template static. Chief R:X remains non-writable privacy authority.

R2-C final accepted runtime evidence on owner workstation:

```text
Focused renderer = 7/7 PASS / FAIL 0 / SKIP 0
Frozen regression = 30/30 PASS / FAIL 0 / SKIP 0
node --check renderer = PASS
git diff --check = PASS
```

`D2-WP004-R2-C = PASS / CLOSED`.

## Current next D2 gate

```text
COMBINED_EXCEL_PARITY = NEXT LATER D2 GATE / NOT AUTHORIZED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```

Before Combined Excel parity is proposed, Control Plane must inspect current repository truth and define the smallest parity contract against the closed preparer + renderer authority. Do not reopen R2-C or start implementation without a proven regression and explicit owner authorization.
