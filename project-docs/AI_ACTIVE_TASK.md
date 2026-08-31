# AI ACTIVE TASK — D2 READ-ONLY DISCOVERY

Mode: **CHATGPT CONTROL PLANE / READ-ONLY DISCOVERY / NO SOURCE CHANGE / NO UNAUTHORIZED KINTONE WRITE**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = ACTIVE
D1_OVERALL = PASS / CLOSED
FINAL_D1_SECURITY_REVIEW = PASS
EMPLOYEE_LIFECYCLE_POLICY = CONFIRMED
PRE_D2_DOCUMENTATION_SYNC = COMPLETE
CURRENT_OWNER = USER + CHATGPT
ACTIVE_WORK_PACKAGE = D2-DISCOVERY-001
D2_STATUS = STARTED / READ-ONLY DISCOVERY
ANTIGRAVITY_ACTION = NONE DURING DISCOVERY
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
```

## 1. Owner authorization received

Owner explicitly instructed ChatGPT to start D2 on 2026-09-01 ICT.

This starts **D2 discovery only**. It does not authorize source/test changes, build/deploy, Live Kintone writes, or an Antigravity implementation task.

## 2. D2 discovery scope

Canonical contract: `project-docs/EXCEL_EXPORT.md`.

Control Plane must perform only the bounded read-only discovery below:

```text
A. inventory current export implementation/source/tests
B. locate approved legacy Excel/PDF sample files available to the project
C. map App794 fields to legacy Part A / Part B output
D. identify current PDF generation mechanism
E. identify export authorization/confidentiality guards
F. produce gap list + smallest safe D2 implementation Work Package
```

Directly relevant repository material may include:
- `src/services/mbo-export-service.js`;
- `tests/mbo-export-service.test.js`;
- exact export callers/integration points only as needed;
- `skills/mbo-excel-export/SKILL.md`;
- approved legacy sample files if available;
- directly relevant legacy mapping/formula documents when needed to interpret those samples.

Do not broad-scan historical project trees.

## 3. D2 acceptance target

D2 must ultimately prove:

```text
Excel Part A original/legacy parity
Excel Part B original/legacy parity
Combined workbook where applicable
PDF original/legacy visual/print parity
5–10 objective capacity without silent truncation
Export authorization/confidentiality parity for Excel and PDF
```

Legacy-format parity includes workbook/sheet/page structure, labels, merged cells, formulas/totals, formatting, print setup, objective ordering and PDF pagination/layout where present in the approved sample.

## 4. Security boundary

D1 remains frozen and D2 inherits its authorization/privacy rules.

```text
Employee-Self export = bound Employee_Code only
Dedicated Approver export = current authorized business scope only
SHARED Approver authority = DENIED
HR/Admin export = approved role/business scope only
UI/button visibility != authorization
Excel security rules = PDF security rules
```

Employee/Shared Employee-Self export must omit unauthorized manager/GM/final confidential data entirely, including hidden sheets/columns.

## 5. Execution-plane rule

```text
ANTIGRAVITY = IMPORTANT_AND_NECESSARY_IMPLEMENTATION_ONLY
```

During `D2-DISCOVERY-001`, ChatGPT performs repository/sample analysis directly. Do not spend Antigravity credit on discovery that ChatGPT can safely perform.

If discovery proves source implementation is required, ChatGPT must first propose the smallest safe D2 Work Package. Antigravity may execute that implementation only after explicit Owner approval of that Work Package.

## 6. Forbidden during this task

Do not:
- modify `src/`;
- modify `tests/`;
- modify build/runtime assets;
- run deployment;
- write App53/App794/App795/App801;
- change ACL/Process Management;
- create Live UAT records;
- export confidential Live data;
- start D3/D4/D5/D6 implementation;
- assign Antigravity implementation before Owner approves the proposed D2 Work Package.

## 7. Current safety / authorization

```text
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
APP794_RECORD_WRITE = NO
APP794_STATUS_TRANSITION = NO
APP53_WRITE = NO
APP795_WRITE = NO
APP801_WRITE = NO
GROUP_MEMBERSHIP_WRITE = NO
ACTIVE_LIFECYCLE_WRITE_AUTH = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
KINTONE_CUSTOMIZATION_DEPLOY = NO
ROLLBACK = NO
```

D1 remains `PASS / CLOSED` unless a proven D1 identity/security regression exists.
