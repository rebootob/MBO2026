# MBO2026 — D2 EXCEL + PDF ORIGINAL / LEGACY FORMAT

> Status: **READY / NOT STARTED**  
> Updated: 2026-08-31 ICT  
> Repository: `rebootob/MBO2026`  
> Canonical branch: `ai/antigravity-wp002c`

D1 is closed. This document defines the pre-start boundary for D2 only. It does **not** authorize implementation, Live Kintone writes, deployment, export of confidential data, or Antigravity execution.

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

Legacy templates may have been designed for fewer objectives. D2 must support the current App794 capacity of up to 10 objectives without losing formulas, formatting, attachments references, or evaluation fields.

Allowed design options may include controlled row expansion or overflow pages/sheets, but the exact design remains **TO BE REVIEWED** before implementation.

```text
DYNAMIC_OBJECTIVE_EXPORT_DESIGN = PENDING REVIEW
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
- approver output cannot use stale/static App795 membership as authority;
- export buttons/UI visibility are not treated as authorization;
- direct export service calls must enforce the same scope as UI entry;
- PDF and Excel apply identical authorization/confidentiality rules.

Accepted D1 Kintone-only ceilings remain documented and must not be hidden by D2.

## 6. Data/source boundary

Before implementation, D2 must identify the authoritative App794 field mapping for every cell/section in the legacy template.

Do not infer fields from display labels when a canonical field code exists. Do not use legacy source apps as a write target.

Legacy samples/source apps may be inspected read-only when needed for parity evidence.

## 7. Pre-start discovery required

Before coding, Control Plane must inventory:

```text
A. existing export source/services/tests in repository
B. approved legacy Excel/PDF sample files available to the project
C. exact Part A / Part B field mapping
D. current PDF generation mechanism, if any
E. existing security/export guards
F. gaps between current output and legacy target
```

This discovery is read-only/source-review work. It does not authorize a source change.

## 8. Implementation governance

```text
D2_STATUS = READY / NOT STARTED
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE
ANTIGRAVITY_ACTION = NONE
```

When the Owner starts D2, ChatGPT must first create a narrow D2 Active Task after repository truth review. Antigravity is used only for implementation that is genuinely necessary.

## 9. D2 closure condition

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
