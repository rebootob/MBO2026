# MBO2026 — AI DOCUMENT INDEX

Updated: 2026-09-02 ICT.

Fast startup: fresh-fetch `ai/antigravity-wp002c` -> `D2_REVIEW_FAST_START.md` -> `AI_ACTIVE_TASK.md` -> directly relevant R2 design/Baseline/evidence -> exact diff.

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
PRESERVATION = PASS / CLOSED
REFERENCE_IMAGE = PASS / CLOSED
PART_A_STRUCTURAL = PASS / CLOSED
PART_B_STRUCTURAL = PASS / CLOSED
FORMULA_AUTHORITY = PASS / CLOSED
PART_B_EXPANDED_PRIVACY = PASS / CLOSED
XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
XLSX_TEMPLATE_PROFILE = PASS / CLOSED
PRE1 = PASS / CLOSED
PRE1_R1 = PASS / CLOSED
PRE2 = READ-ONLY DESIGN COMPLETE
PRE2_R1 = PASS / CLOSED AFTER CORRECTIVE
PRE2_R1_R1 = PASS / CLOSED
PRE2_R2 = PASS / CLOSED
PRE2_R3 = PASS / CLOSED AFTER R1-R4 CORRECTIVE CHAIN
R2_A = PASS / CLOSED AFTER R1
R2_A_R1 = PASS / CLOSED
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```

Durable D2 Baselines:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_PROFILE_CLOSURE.md`
- `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`

R2 design/evidence chain:
- `phase-3/D2_WP004_R2_RENDERER_SANITIZER_DESIGN.md`
- `phase-3/evidence/XLSX_PART_B_COMPETENCY_PRESENTATION_EVIDENCE.md`
- `phase-3/D2_WP004_R2_PRE2_PRESENTATION_AUTHORITY_DESIGN.md`

Accepted PRE2 implementation chain:
```text
PRE2_R1_INITIAL = 9154ab33f2fd6262fa5d3e7717f7eed4f4052e0a / CORRECTED
PRE2_R1_R1_CORRECTIVE = fb3765f81b635b2bdc1f4fb8a1cf50fdbe6ea222 / PASS
PRE2_R2_PROFILE_AUTHORITY = e02af3b1796d0efa8ca6860a54bc64b3c14231f2 / PASS
PRE2_R3_INITIAL = 431b0a298e994002e590f0eef5b3169eddb5d540 / CORRECTED
PRE2_R3_R1 = 4e66cca1d2a41b4d40cf8b1b41587b47abbb590f / CORRECTED
PRE2_R3_R2 = 298f480ad3f2257327dbea82c3bc3bcd41054b60 / CORRECTED
PRE2_R3_R3 = 1542ac8ebef1f22505ba0d240c9e064d2b2cd8f8 / CORRECTED
PRE2_R3_R4 = 22477d74008ea7438ea86f0592ce8ae78685ecaa / PASS / CLOSES PRE2_R3 CHAIN
```

Accepted R2-A profile foundation chain:
```text
R2_A_AUTHORIZATION = 3a629e00466b82bee65dcfb146d81577e7c319d5
R2_A_INITIAL_IMPLEMENTATION = 6dcfba1277462f230a5cd9379aacb96193253ac1 / CORRECTED
R2_A_R1_AUTHORIZATION = e70c90049af0aed4a33851b98c226d5c86bb9c39
R2_A_R1_IMPLEMENTATION = 9a93adf69a0d029fc810b6121f3f8dfe228f0c42 / PASS / CLOSES R2_A
R2_A_R1_SCOPE = EXACTLY ONE COMMIT / EXACTLY TWO PROFILE+TEST FILES
RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

Current semantic/profile authority:
```text
SAFE_TO_MAP = 20 EXACT
UNRESOLVED = 22 EXACT
NO_SECURED_PROJECTION_SOURCE = 5 EXACT
CHIEF_FROZEN_AUTHORITY = R:X / NOT SECURED WRITABLE
```

Closed expanded presentation authority:
```text
b7 TITLE B31 / DESCRIPTION B32
b7 TITLE_MERGE B31:J31 / DESCRIPTION_MERGE B32:J32
b7 RATING_SCALE B33:J33 STATIC / PADDING 34 PROTECTED
b8 TITLE B35 / DESCRIPTION B36
b8 TITLE_MERGE B35:J35 / DESCRIPTION_MERGE B36:J36
b8 RATING_SCALE B37:J37 STATIC / PADDING 38 PROTECTED
b1..6 TITLE/DESCRIPTION reject
b8 under N7 reject
```

Closed PRE2-R3 OOXML/privacy proof:
```text
FROZEN_INTERMEDIATE_MERGES = 79 / 85 / 91
FINAL_OVERLAY_MERGES = 79 / 86 / 93
BASE_PRIVACY_DYNAMIC = 432 / 474 / 516
FINAL_EFFECTIVE_DYNAMIC = 432 / 492 / 552
SUMMARY_START_OBSERVED = 31 / 35 / 39
DIMENSIONS = A1:X35 / A1:X39 / A1:X43
FORMULA_INVENTORY = 0
```

Closed R2-A layout/sanitization profile authority:
- Part A count-aware layout/sanitization topology is centralized and production-validator protected.
- Part B rating sanitization is segmented into base rows 7:29, N7 clone rows 31:33, and N8 extra clone rows 35:37.
- protected padding rows 30/34/38 have zero sanitization overlap.
- Rating Scale static ranges have zero sanitization overlap.
- exact dimensions, Print_Area, merge counts, summary rows, privacy counts, presentation ranges and base/effective sanitization topology are fail-closed by `validateMappingIntegrity()`.
- mutation tests call the production validator for representative Part A/Part B topology corruption.
- profile remains browser-safe/pure; semantic authority remains 20/22/5 with Chief R:X not writable.

Exact next gate:
```text
CONTROL-PLANE PLANNING REQUIRED
R2_B = sentinel-free production template preparation/sanitizer engine / PROPOSED / NOT AUTHORIZED
R2_C = secured semantic value renderer / NOT AUTHORIZED
COMBINED_EXCEL_PARITY = later D2 gate
```

R2-B exact writable file/test split must be planned and separately Owner-authorized. Read `AI_ACTIVE_TASK.md` for exact current authority. Do not auto-start Production Renderer, Kintone work, deployment or D3.
