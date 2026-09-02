# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / PRIVACY CLOSED / XLSX TEMPLATE SEMANTIC MAPPING CLOSED / TEMPLATE PROFILE ALIGNMENT ACTIVE**. Updated 2026-09-02 ICT.

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
XLSX_TEMPLATE_SEMANTIC_MAPPING = PASS / CLOSED
EXCEL_SCORE_FORMULAS = FORBIDDEN
PRODUCTION_XLSX_FORMULA_INVENTORY = 0
```

Mandatory architecture: centralized Template Profile/Mapping, no scattered important cell/range addresses, unknown template/mapping fail closed.

## Closed semantic mapping evidence
```text
AUTHORIZATION = D2-WP004-R1-R2-R2-EVIDENCE-20260902-01
EVIDENCE_COMMIT = bc141f355d7714302801d5adca3d5652b83c4de1
SCOPE = PASS / EXACT ONE MARKDOWN FILE
PART_A_SHA = PASS
PART_B_SHA = PASS
SEMANTIC_EVIDENCE = PASS / CLOSED
PROVEN_SAFE_TO_MAP = 18
UNRESOLVED = 22
NO_SECURED_PROJECTION_SOURCE = 5
DUPLICATE_SAFE_TARGETS = 0
SAFE_TO_MAP_WITHOUT_SECURED_PATH = 0
CHIEF_FROZEN_AUTHORITY = R:X
TOKEN = CONSUMED / PASS / CLOSED / DO NOT REUSE
RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

Durable authority:
`CONFIRMED_BASELINE/D2_XLSX_TEMPLATE_SEMANTIC_MAPPING_CLOSURE.md`

Production semantic rules frozen:
- only the exact 18 roles in the semantic closure Baseline may be production writable today;
- 22 unresolved roles remain fail-closed/non-writable;
- 5 visually identifiable roles with no secured projection source must not be synthesized or mapped;
- Part B Chief frozen dynamic authority remains `R:X`, but no stable secured chief item key is proven;
- combined objective/target regions, evaluator alias translations, final score/grade without static proof and formula-derived weight sum remain unresolved;
- Employee-Self confidential omissions must never be reconstructed;
- Excel scoring/recalculation remains forbidden and generated workbook formula inventory remains exactly zero.

## Active D2-WP004-R1-R3 — TEMPLATE PROFILE SEMANTIC ALIGNMENT
```text
AUTHORIZATION = D2-WP004-R1-R3-SOURCE-TEST-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = 5e15e5491a5b3ff53d7f5dc18531cc6d418a0c0d
MODE = SOURCE+TEST / BOUNDED / ONE-SHOT
WRITABLE_FILES_ONLY =
  src/profiles/mbo-xlsx-template-profile.js
  tests/mbo-xlsx-template-profile.test.js
SOURCE_CHANGE = AUTHORIZED ONLY FOR PROFILE FILE
TEST_CHANGE = AUTHORIZED ONLY FOR PROFILE TEST FILE
PRODUCTION_RENDERER = NOT AUTHORIZED
```

R1-R3 must update the existing pure Template Profile to consume the closed semantic authority only. It must expose deterministic writable mappings for exactly the 18 safe roles, reject all 22 unresolved and 5 no-source roles with `EXPORT_TEMPLATE_PROFILE_UNRESOLVED`, preserve exact SHA/count/topology/immutability/basic-integrity behavior, and introduce no workbook I/O, scoring logic, Kintone write, deployment or renderer implementation.

```text
ACTIVE_WORK_PACKAGE = D2-WP004-R1-R3
ANTIGRAVITY = AUTHORIZED ONLY FOR R1-R3 SOURCE+TEST
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
