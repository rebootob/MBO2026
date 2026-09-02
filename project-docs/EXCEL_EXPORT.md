# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / PRIVACY CLOSED / TEMPLATE PROFILE FOUNDATION ACTIVE**. Updated 2026-09-02 ICT.

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

Durable authorities:
- `CONFIRMED_BASELINE/D2_PART_A_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_STRUCTURAL_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_FORMULA_AUTHORITY_CLOSURE.md`
- `CONFIRMED_BASELINE/D2_PART_B_EXPANDED_PRIVACY_CLOSURE.md`
- `CONFIRMED_BASELINE/EXPORT_TEMPLATE_MAPPING_ARCHITECTURE.md`

## Mandatory Template Mapping Architecture
```text
NO_SCATTERED_CELL_ADDRESS_IN_PRODUCTION_RENDERER = YES
CENTRALIZED_TEMPLATE_PROFILE_MAPPING = YES
UNKNOWN_TEMPLATE_OR_MAPPING = FAIL_CLOSED
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

## Active D2-WP004-R1
```text
AUTHORIZATION = D2-WP004-R1-SOURCE-TEST-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = 77908178f9d91d8fe7cce4db553f66324770a50b
MODE = SOURCE+TEST / PURE MAPPING FOUNDATION / ONE-SHOT
EXPECTED_NEW_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
WORKBOOK_I_O = FORBIDDEN
GENERATED_XLSX = FORBIDDEN
PRODUCTION_RENDERER = NOT YET
```

R1 centralizes exact accepted template SHA identity, Part A objective cardinality 4..10, Part B competency cardinality 6/7/8, semantic workbook roles and fail-closed mapping behavior. It must not modify `MboExportService`, feasibility proof, dependencies, dist, Kintone or deployed resources.

After R1 independent PASS, Production XLSX Renderer/Sanitizer may be proposed to consume this profile rather than scattering workbook addresses.

## Remaining D2
1. D2-WP004-R1 Template Profile / Mapping Foundation — ACTIVE
2. Production XLSX Renderer/Sanitizer implementation
3. Combined Excel parity
4. PDF parity
5. Export authorization/security/privacy regression
6. Final independent D2 closure

```text
ACTIVE_WORK_PACKAGE = D2-WP004-R1
ANTIGRAVITY = AUTHORIZED ONLY FOR R1
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
