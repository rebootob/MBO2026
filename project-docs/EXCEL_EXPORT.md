# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / PRIVACY CLOSED / TEMPLATE PROFILE SEMANTIC AUTHORITY NOT CLOSED**. Updated 2026-09-02 ICT.

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

## D2-WP004-R1-R1 review
```text
IMPLEMENTATION = 570a388a3f05be564c38e55431b739d3b28bf406
SCOPE = PASS / EXACT TWO FILES
PART_B_ROW_ROLE_TOPOLOGY = PASS / FREEZE
BASIC_INTEGRITY_VALIDATOR = PASS / FREEZE
SEMANTIC_PROJECTION_AUTHORITY = CORRECTIVE REQUIRED
TOKEN = CONSUMED / DO NOT REUSE
RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

Accepted/frozen from R1-R1:
- Part B original rows7:29 K:X dynamic;
- row30 and clones34/38 protected non-dynamic;
- N7 inserted rows31:33 dynamic; N8 inserted rows31:33 +35:37 dynamic;
- summary relocation 31:34 / 35:38 / 39:42;
- pure no-workbook-I/O profile;
- exact template SHA/count domains;
- basic fail-closed checks for missing address mapping, duplicate target, malformed address and protected row exposed writable.

Still not accepted:
- Department vs Section Hoshin exact workbook ownership;
- writable roles whose resolver returns no secured projection path;
- Part B summary/comment/signature mappings not backed by current `MboExportService` projection;
- Part A evaluator/Chief aliases whose exact manager/GM projection meaning is unresolved;
- validator does not yet require every claimed writable semantic to have a valid secured projection translation.

## Proposed next — NOT AUTHORIZED
`D2-WP004-R1-R2` should be EVIDENCE-ONLY. Inspect exact SHA-approved owner-template static labels/merged ranges and current read-only projection, writing only `project-docs/phase-3/evidence/XLSX_TEMPLATE_SEMANTIC_MAPPING_EVIDENCE.md`. Do not change profile source until evidence review closes the semantic questions.

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
PRODUCTION_RENDERER = NOT AUTHORIZED
D3 = HOLD
```
