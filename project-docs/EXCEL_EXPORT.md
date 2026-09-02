# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / PRIVACY CLOSED / TEMPLATE PROFILE FOUNDATION NEXT PROPOSED**. Updated 2026-09-02 ICT.

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

## Proposed foundation — D2-WP004-R1
```text
WORK_PACKAGE = D2-WP004-R1
NAME = MBO2026 PRODUCTION XLSX TEMPLATE PROFILE / MAPPING FOUNDATION
STATE = PROPOSED / NOT AUTHORIZED
MODE = SOURCE+TEST / PURE MAPPING / NO WORKBOOK MUTATION
EXPECTED_WRITABLE_FILES =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
```

R1 must define one immutable/fail-closed template profile for the accepted MBO2026 template family and centralize semantic workbook role mapping needed by later rendering. It must bind exact accepted Part A/Part B template SHA identity, support Part A objective counts 4..10 and Part B competency counts 6..8, and fail closed for unknown template/profile/count/semantic role.

R1 must NOT:
- render or write workbook values;
- create generated XLSX/PDF/evidence binaries;
- modify `src/services/mbo-export-service.js`;
- copy scoring/business logic into the profile;
- change feasibility/structural/privacy source;
- modify dependencies/package-lock;
- touch Kintone/deploy/Live UAT/D3.

After R1 passes, the Production XLSX Renderer/Sanitizer can consume the profile rather than scattering addresses.

## Remaining D2
1. D2-WP004-R1 Template Profile / Mapping Foundation — PROPOSED / NOT AUTHORIZED
2. Production XLSX Renderer/Sanitizer implementation
3. Combined Excel parity
4. PDF parity
5. Export authorization/security/privacy regression
6. Final independent D2 closure

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
