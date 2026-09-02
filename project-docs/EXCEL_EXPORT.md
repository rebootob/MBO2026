# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / PRIVACY CLOSED / TEMPLATE PROFILE R1-R1 CORRECTIVE ACTIVE**. Updated 2026-09-02 ICT.

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

Mandatory architecture: centralized Template Profile/Mapping, no scattered important cell/range addresses, unknown template/mapping fail closed.

## Active D2-WP004-R1-R1
```text
AUTHORIZATION = D2-WP004-R1-R1-SOURCE-TEST-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = 57b77fde38c0ef95f0ac40eb396ec386643adf03
WRITABLE_FILES_ONLY =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
WORKBOOK_I_O = FORBIDDEN
PRODUCTION_RENDERER = NOT AUTHORIZED
```

Corrective contract:
- restore exact Part B frozen dynamic/protected topology: original rows7:29 K:X dynamic; row30/34/38 protected; N7 rows31:33 dynamic; N8 rows31:33+35:37 dynamic; summary rows31:34/35:38/39:42;
- align semantic identifiers/projection paths with current secured `MboExportService`, including both department and section Hoshin; do not reconstruct omitted confidential fields;
- add pure integrity validator that fails closed with `EXPORT_TEMPLATE_PROFILE_UNRESOLVED` for missing mapping, conflicting exclusive targets, invalid mapping shape, protected padding exposed writable, unsupported identity/count/profile;
- do not guess unsupported semantic/address meaning; block instead.

```text
ANTIGRAVITY = AUTHORIZED ONLY FOR R1-R1
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
