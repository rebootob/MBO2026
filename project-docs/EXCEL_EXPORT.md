# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / PRIVACY CLOSED / PRODUCTION XLSX RENDERER NEXT PROPOSED**. Updated 2026-09-02 ICT.

Frozen authority:
```text
LEGACY_TEMPLATE = VISUAL / LAYOUT AUTHORITY
MboExportService_SECURED_PROJECTION = EXPORT DATA AUTHORITY
SCORING_SOURCE = KINTONE / APP794 + CONFIRMED CONFIG
PRESERVATION = PASS / CLOSED
REFERENCE_IMAGE = PASS / CLOSED
PART_A_STRUCTURAL = PASS / CLOSED
PART_B_STRUCTURAL = PASS / CLOSED
FORMULA_AUTHORITY = PASS / CLOSED
PART_B_EXPANDED_PRIVACY = PASS / CLOSED
EXCEL_SCORE_FORMULAS = FORBIDDEN
PRODUCTION_XLSX_FORMULA_INVENTORY = 0
```

Privacy closure:
```text
R7-R2_SOURCE = 6975b1f076b9b3f4baa3b6cb4ca844767f513f0a / PASS FROZEN
R7-R3_TEST_ONLY = 69891d82996f83a0442ee6dc268dd20b7ef8ee99 / PASS CLOSED
COUNTS = N6 432 / N7 474 / N8 516
ROW30_AND_CLONES = PROTECTED NON-DYNAMIC / FROZEN
STRICT_SOURCE_EVIDENCE = STYLE + MERGE + TYPE + NONBLANK + STATIC HASH WHEN APPLICABLE
EXPANDED_PACKAGE_TOKEN_PURGE = PASS / FROZEN
CALLER_BUFFER_IMMUTABILITY = PASS / FROZEN
ZERO_FORMULA = PASS / FROZEN
```

Durable privacy authority: `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`.

## Production Renderer Template Mapping Architecture

Owner-confirmed mandatory rule:
```text
NO_SCATTERED_CELL_ADDRESS_IN_PRODUCTION_RENDERER = YES
CENTRALIZED_TEMPLATE_PROFILE_MAPPING = YES
```

Required boundary:
```text
Kintone/App794 truth
  -> MboExportService secured projection
  -> Canonical Export Model / semantic roles
  -> centralized Template Profile / Mapping
  -> Production Renderer
  -> owner template
```

Important cell/range addresses must be centralized in the Template Profile/Mapping layer. Future template versions should normally be handled by profile/mapping change + focused structural/privacy regression, not by scattering address edits across business logic.

Durable authority: `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`.

## Remaining D2
1. Production XLSX Renderer/Sanitizer — PROPOSED / NOT AUTHORIZED
2. Combined Excel parity
3. PDF parity
4. Export authorization/security/privacy regression
5. Final independent D2 closure

```text
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
