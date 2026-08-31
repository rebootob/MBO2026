# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **STARTED / READ-ONLY DISCOVERY COMPLETE / IMPLEMENTATION NOT AUTHORIZED**  
> Updated: 2026-09-01 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

D1 is closed. Owner explicitly started D2 on 2026-09-01 ICT. This document defines the D2 acceptance boundary and current discovery truth. D2 start does **not** authorize source/test changes, Live Kintone writes, deployment, export of confidential Live data, or Antigravity implementation until the proposed Work Package is explicitly approved.

## 1. D2 objective

Deliver Excel/PDF outputs that preserve the approved original/legacy PMS presentation while using App794 as the current MBO record source and respecting D1 identity/privacy boundaries.

## 2. Required deliverables

At minimum D2 must prove:

```text
1. Excel Part A — MBO / Objectives form
2. Excel Part B — Competency / Evaluation form
3. Combined multi-sheet workbook where applicable
4. PDF output matching the approved legacy presentation
5. 5–10 objective capacity without silent truncation
6. Authorization/privacy-safe export behavior
```

Legacy workbook names currently referenced by the project:
- `PMS_Staff & Chief_PART_A.xlsx`
- `PMS_Staff & Chief_PART_B.xlsx`

These names/templates are references, not proof that current output parity is complete.

## 3. Format-parity acceptance

D2 must compare generated output against approved legacy samples for at least:
- sheet/page structure;
- labels and bilingual wording where applicable;
- merged cells and section grouping;
- fonts/alignment/borders/number formats;
- row heights/column widths;
- print area/page orientation/page breaks;
- formulas and totals;
- objective numbering/order;
- Part A/Part B score presentation;
- signatures/approval areas if present in the approved legacy sample;
- PDF pagination and visual layout.

Do not claim parity from data presence alone.

## 4. Dynamic 5–10 objectives

Legacy templates were designed around 4 objectives. Current App794 normalization supports objective slots 1..10 and D2 must support the current target capacity without loss or silent truncation.

Allowed design options may include controlled row expansion or overflow pages/sheets, but the exact rendering design remains dependent on the approved binary template evidence.

```text
DYNAMIC_OBJECTIVE_EXPORT_DESIGN = PENDING TEMPLATE REVIEW
NO_SILENT_TRUNCATION = MANDATORY
```

## 5. Security boundary

D2 inherits D1 security truth:

```text
My MBO export = bound Employee_Code only
Approver export = only records authorized by current native business authority
HR/Admin export = only under approved role/business scope
SHARED approver authority = DENIED
```

Confidential fields must never be included for an Employee/shared Employee-Self export merely because those fields exist in App794.

At minimum security tests must cover:
- Employee cannot export another employee's MBO;
- Employee output excludes confidential manager/GM/final fields not authorized for Employee-Self;
- approver output cannot use stale/static App795 or route-snapshot membership as authority;
- export buttons/UI visibility are not treated as authorization;
- direct export service calls must enforce the same scope as UI entry;
- PDF and Excel apply identical authorization/confidentiality rules.

Accepted D1 Kintone-only ceilings remain documented and must not be hidden by D2.

## 6. Current D2 read-only discovery — 2026-09-01

### A. Existing export source/tests

Current implementation exists at:
- `src/services/mbo-export-service.js`;
- `tests/mbo-export-service.test.js`.

Current `MboExportService` is a **projection/data-model service only**. It resolves profile weighting and projects Part A / combined Part A+B data, but it does not write an `.xlsx` binary and does not generate a PDF binary.

Current test coverage proves profile fail-closed behavior and one 4-objective projection case only. The test title references 4 and 10 objectives, but no 10-objective case is currently asserted.

### B. Existing 1–10 objective support

`src/core/kintone-normalizer.js` already projects flattened App794 objective slots 1..10 and honors `Objective_Count`. Therefore the data-normalization foundation for 10 objectives exists; export rendering and export-specific test coverage do not yet prove 5–10 output parity.

### C. Current Part A mapping foundation

Current projection reads at least:

```text
Employee_Code
Employee_Name
Employee_Name_TH
Employee_Department
Employee_Section
Employee_Position
Fiscal_Year
Profile_Code
Department_Hoshin_Title / Department_Hoshin
Section_Hoshin_Title / Section_Hoshin
Objective_1..10
Objective_<n>_Description
KPI_<n>
Target_<n>
Measurement_<n>
Weight_<n>
Progress_Percent_<n>
Actual_Result_<n>
Self_Achievement_<n>
Self_Comment_<n>
Manager_Achievement_<n>
Manager_Objective_Score_<n>
Manager_Comment_<n>
GM_Achievement_<n>
GM_Objective_Score_<n>
GM_Comment_<n>
Average_Objective_Score_<n>
PartA_Raw_Score
PartA_Weighted_Score
```

Exact cell mapping cannot be frozen until the approved binary template is available for inspection.

### D. Current Part B mapping foundation

Current combined projection includes profile-derived Part B weighting, caller-supplied `competencyItems`, `PartB_Raw_Score`, `PartB_Weighted_Score`, final score and final grade.

Current application normalization defines competency sets and physical fields such as `Manager_Competency_Rating_<n>`, `GM_Competency_Rating_<n>` and corresponding comments. Exact legacy-cell mapping and final field inclusion remain to be derived from the approved template and security scope.

### E. Current PDF / workbook mechanism

```text
CURRENT_XLSX_BINARY_WRITER = NONE FOUND
CURRENT_PDF_BINARY_GENERATOR = NONE FOUND
CURRENT_EXPORT_UI_INTEGRATION = NONE FOUND IN MAIN RECORD UI REVIEW
```

`package.json` currently declares only `esbuild` as a development dependency and no workbook/PDF generation package.

### F. Legacy binary template evidence

The two legacy Excel filenames are intentionally ignored by `.gitignore` because local legacy/original forms may contain employee data. They are therefore not expected to be committed to Git.

Current discovery did not locate the two binary templates in:
- the canonical Git branch/tree;
- ChatGPT conversation/library spreadsheet search;
- connected Google Drive exact/broader PMS filename search.

```text
LEGACY_BINARY_TEMPLATE_EVIDENCE = NOT AVAILABLE TO CHATGPT IN CURRENT CONNECTED SOURCES
```

This does not prove the files do not exist in the Owner/Antigravity local workspace. It means visual/cell/print parity cannot yet be independently accepted from connected evidence.

### G. Security gap

Current `MboExportService` does not enforce an export authorization context. Its projections may include Part A/Part B scores and final grade without an Employee/Appraiser/HR security filter.

Existing D1 services provide security foundations that D2 should reuse rather than invent:
- `MboEmployeeSelfGateway` enforces trusted Employee_Code scoping and strips `CONFIDENTIAL_FIELDS` for Employee-Self;
- `MboApprovalTaskService` enforces Dedicated-only authoritative current native `Assignee` authority and denies SHARED approver authority.

Do **not** use static route/appraiser snapshot membership as current approver-export authority.

### H. Profile-weight conflict resolution

Historical discovery files contain older Excel/Kintone conflicts. Current durable authority is `CONFIRMED_BASELINE/EVALUATION_CLASSES.md`.

Current approved weighting is:

```text
PROF_STAFF_CHIEF      = 70 / 30
PROF_JAPANESE_STAFF   = 70 / 30
PROF_ASST_MGR         = 60 / 40
PROF_SECTION_MGR      = 50 / 50
PROF_SENIOR_MGR       = 50 / 50
PROF_DGM              = 50 / 50
PROF_GM               = 50 / 50
PROF_VP               = 50 / 50
```

The current export source already matches this Baseline. Do not regress Assistant Manager to the superseded historical 50/50 value.

## 7. Smallest safe proposed implementation Work Package

### `D2-WP001 — EXPORT AUTHORIZATION + PROJECTION FOUNDATION`

**Status: PROPOSED / OWNER APPROVAL REQUIRED / NOT STARTED**

Purpose: close the source-level security and 1–10 projection gaps before introducing binary template rendering.

Proposed source scope only:
- `src/services/mbo-export-service.js`;
- `tests/mbo-export-service.test.js`;
- reuse existing D1 security services/constants as imports where required;
- no new runtime file unless separation is demonstrably necessary.

Required behavior:
1. make export projection fail closed without an explicit trusted export context;
2. Employee-Self export must require exact bound Employee_Code match and must omit confidential manager/GM/final fields;
3. Dedicated Approver export must require authoritative current native Assignee authority; SHARED approver mode denied;
4. stale/static route snapshot membership must not authorize export;
5. preserve current confirmed Profile_Code weight mapping;
6. prove exact 4, 5 and 10 objective projection with no silent truncation;
7. add negative tests for cross-employee export, SHARED approver, stale assignee and confidential-field leakage;
8. do not add `.xlsx`/PDF generation, UI buttons, package dependencies, Live Kintone calls or deployment in this Work Package.

Executor after Owner approval:

```text
ANTIGRAVITY = YES — IMPORTANT/NECESSARY IMPLEMENTATION ONLY
```

Antigravity must read only `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, this D2 contract and the exact source/test files named above; no whole-repo scan and no scope expansion.

## 8. Work intentionally deferred until template evidence is available

Not part of `D2-WP001`:
- Excel binary/template renderer;
- dynamic template row insertion/overflow-sheet design;
- exact cell coordinates;
- merged-cell/font/border/print-area parity;
- combined workbook binary;
- PDF renderer/pagination;
- UI download buttons;
- Live export UAT/deployment.

Those must be designed against approved legacy binary samples after `D2-WP001` is independently reviewed and accepted.

## 9. Current authorization state

```text
D2_STATUS = IN PROGRESS / DISCOVERY COMPLETE / WP001 APPROVAL PENDING
ACTIVE_D2_WORK_PACKAGE = D2-DISCOVERY-001 COMPLETE
PROPOSED_D2_WORK_PACKAGE = D2-WP001
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY_ACTION = WAITING OWNER APPROVAL FOR D2-WP001
```

## 10. D2 closure condition

D2 may close only when:
- Part A Excel parity is independently accepted;
- Part B Excel parity is independently accepted;
- combined workbook behavior is accepted where required;
- PDF visual/print parity is accepted;
- 5–10 objective handling is proven;
- authorization/confidentiality tests pass;
- no material legacy-format gap remains undocumented.

Until then:

```text
D2 = NOT PASS
PROJECT MBO2026 = NOT COMPLETE
```
