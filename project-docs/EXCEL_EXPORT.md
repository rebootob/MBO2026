# MBO2026 — D2 EXCEL + PDF LEGACY FORMAT

Status: **IN PROGRESS / PRIVACY CLOSED / TEMPLATE SEMANTIC EVIDENCE CORRECTIVE REQUIRED**. Updated 2026-09-02 ICT.

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

Corrective evidence required before profile source may change:
- re-inspect Part A row-6 labels against all sensitive header value ranges and eliminate duplicate semantic target ownership;
- do not claim both employeeName and employeeNameTH as independent writes to one target without an accepted fallback/source-selection contract;
- a projection field that exists but lacks a proven workbook target is `UNRESOLVED`, not `NO_SECURED_PROJECTION_SOURCE`;
- cover every relevant Part A objective secured field (`title`, `description`, `kpi`, `target`, `measurement`, `weight`, `progressPercent`, `actualResult`, `selfAchievement`, `selfComment`, manager/GM/average fields) and mark ambiguous merged semantics unresolved rather than inferring translations from nearby labels;
- do not map all per-objective manager comments to one shared row unless exact template semantics prove that relationship;
- preserve Part B K:Q self and R:X chief privacy authority; do not truncate chief region to R:W;
- a chief/evaluator Part B mapping is not `PROVEN` unless an exact secured `competencyItems` field key/path is proven for the relevant caller;
- summary/result `PROVEN` claims require actual workbook label/merge evidence plus compatible secured projection; address + projection existence alone is insufficient;
- status counts must match every matrix row and use status definitions exactly.

## Proposed next — NOT AUTHORIZED
```text
D2-WP004-R1-R2-R1 = EVIDENCE-ONLY CORRECTIVE
WRITABLE_FILE = project-docs/phase-3/evidence/XLSX_TEMPLATE_SEMANTIC_MAPPING_EVIDENCE.md ONLY
SOURCE_CHANGE = FORBIDDEN
TEST_CHANGE = FORBIDDEN
PROFILE_CHANGE = FORBIDDEN
PRODUCTION_RENDERER = NOT AUTHORIZED
```

```text
ACTIVE_WORK_PACKAGE = NONE
ANTIGRAVITY = STOP
CLAUDE = STOP
KINTONE = NONE
DEPLOY = NONE
D3 = HOLD
```