# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / PRIVACY CLOSED / R1-R2-R1 SEMANTIC EVIDENCE CORRECTIVE ACTIVE**. Updated 2026-09-02 ICT.

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

## R1-R2 evidence review
```text
AUTHORIZATION = D2-WP004-R1-R2-EVIDENCE-20260902-01
EVIDENCE_COMMIT = 6e7cb1f5633dfc2a85dc181ae37f425dab3ea067
SCOPE = PASS / EXACT ONE MARKDOWN FILE
PART_A_SHA = PASS
PART_B_SHA = PASS
HOSHIN_SEMANTICS = PASS / FREEZE
PART_B_HEADER_SEMANTICS = PASS / FREEZE
OVERALL_SEMANTIC_EVIDENCE = CORRECTIVE REQUIRED
TOKEN = CONSUMED / DO NOT REUSE
RUNTIME_SIGNAL = UNAVAILABLE / NO GITHUB STATUS OR WORKFLOW RUN
```

Accepted/frozen evidence:
- Department Hoshin -> `G16:AF19` -> `partA.hoshin.departmentHoshinTitle`.
- Section Hoshin -> `AM16:BI19` -> `partA.hoshin.sectionHoshinTitle`.
- `G8:S8` is appraisal-period/static content, not Hoshin.
- Part B header workbook regions and nested `partA.header.*` projection paths are supported by static labels/merges.

## Active D2-WP004-R1-R2-R1 — EVIDENCE-ONLY CORRECTIVE
```text
AUTHORIZATION = D2-WP004-R1-R2-R1-EVIDENCE-20260902-01
OWNER_APPROVAL_BASELINE_HEAD = 3c9f0dc3f0528ba1cddf2122090eaf0f094f7ada
WRITABLE_FILE_ONLY = project-docs/phase-3/evidence/XLSX_TEMPLATE_SEMANTIC_MAPPING_EVIDENCE.md
SOURCE_CHANGE = FORBIDDEN
TEST_CHANGE = FORBIDDEN
PROFILE_CHANGE = FORBIDDEN
TEMPLATE_BINARY_CHANGE = FORBIDDEN
PRODUCTION_RENDERER = NOT AUTHORIZED
```

Corrective requirements:
- re-inspect exact Part A row-6 labels/merges vs `N6:Q7`, `Z7:AF7`, `AG7:AL7`, `AM7:AP7`, `AQ7:AS7`, `AT7:BC7`, `BD7:BI7`; no duplicate exclusive target may remain `SAFE_TO_MAP`;
- distinguish one workbook Name-Surname target from `employeeName` vs `employeeNameTH` source-selection/fallback; do not claim two independent write owners without accepted authority;
- projection fields that exist but lack proven workbook target are `UNRESOLVED / NO_PROVEN_WORKBOOK_TARGET`, not `NO_SECURED_PROJECTION_SOURCE`;
- cover every current secured Part A objective field and leave combined/ambiguous merged semantics unresolved instead of inferring from nearby labels;
- do not equate Appraisee/Appraiser1/Appraiser2/Chief/Manager/GM/Final/average without accepted role-translation evidence;
- re-inspect summary/result labels/merges; address + projection existence alone does not make a mapping `PROVEN`;
- preserve Part B K:Q self and R:X chief authority, and separate visually proven chief target from secured chief field/path availability;
- do not reconstruct filtered chief values for Employee-Self;
- recalculate `PROVEN`, `UNRESOLVED`, `NO_SECURED_PROJECTION_SOURCE` counts mechanically from final matrices/decision table.

```text
ACTIVE_WORK_PACKAGE = D2-WP004-R1-R2-R1
ANTIGRAVITY = AUTHORIZED ONLY FOR R1-R2-R1 EVIDENCE
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```
