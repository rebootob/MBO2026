# AI ACTIVE TASK — D2 WP001 APPROVAL GATE

Mode: **CHATGPT CONTROL PLANE / DISCOVERY COMPLETE / NO SOURCE CHANGE / NO UNAUTHORIZED KINTONE WRITE**  
Branch: `ai/antigravity-wp002c`  
Updated: 2026-09-01 ICT

```text
TASK_STATE = WAITING_OWNER
D1_OVERALL = PASS / CLOSED
FINAL_D1_SECURITY_REVIEW = PASS
EMPLOYEE_LIFECYCLE_POLICY = CONFIRMED
PRE_D2_DOCUMENTATION_SYNC = COMPLETE
CURRENT_OWNER = USER + CHATGPT
D2_STATUS = IN PROGRESS / DISCOVERY COMPLETE
D2-DISCOVERY-001 = COMPLETE
ACTIVE_WORK_PACKAGE = NONE
PROPOSED_WORK_PACKAGE = D2-WP001
PROPOSED_WORK_PACKAGE_NAME = EXPORT AUTHORIZATION + PROJECTION FOUNDATION
ANTIGRAVITY_ACTION = WAITING OWNER APPROVAL
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
```

## 1. D2 discovery disposition

Owner started D2 on 2026-09-01 ICT. ChatGPT completed the bounded read-only discovery required by `project-docs/EXCEL_EXPORT.md`.

Accepted discovery findings:
- current export implementation exists at `src/services/mbo-export-service.js`;
- current export tests exist at `tests/mbo-export-service.test.js`;
- current export service is projection/data-model only, not an `.xlsx` or PDF binary generator;
- current package dependencies contain no workbook/PDF generation library;
- App794 normalizer already supports objective slots 1..10;
- current export test asserts only a 4-objective case and does not prove 5/10 behavior;
- current export projection has no explicit export-authorization/security context and can project confidential scoring/final fields;
- D1 Employee-Self security foundation exists in `MboEmployeeSelfGateway`;
- D1 current-Assignee authority foundation exists in `MboApprovalTaskService`;
- static route/appraiser snapshots must not be used as current approver-export authority;
- current profile weighting matches `CONFIRMED_BASELINE/EVALUATION_CLASSES.md`, including `PROF_ASST_MGR = 60/40`;
- legacy binary Excel templates are intentionally ignored by Git and were not located in current ChatGPT Library or connected Google Drive searches.

Canonical full findings and D2 acceptance boundary: `project-docs/EXCEL_EXPORT.md`.

## 2. Proposed D2-WP001 — not authorized yet

```text
D2-WP001 = EXPORT AUTHORIZATION + PROJECTION FOUNDATION
STATUS = PROPOSED / OWNER APPROVAL REQUIRED
EXECUTOR = ANTIGRAVITY AFTER APPROVAL
```

Exact proposed source scope:
- `src/services/mbo-export-service.js`;
- `tests/mbo-export-service.test.js`;
- existing D1 security services/constants may be imported/reused only as required;
- no new runtime file unless separation is demonstrably necessary.

Required implementation outcomes:
1. fail closed without trusted export context;
2. Employee-Self requires exact bound Employee_Code and excludes confidential manager/GM/final data;
3. Dedicated Approver requires authoritative current native Assignee; SHARED Approver denied;
4. stale/static route snapshot does not authorize export;
5. preserve Confirmed Baseline profile weights;
6. exact 4, 5 and 10 objective projection tests;
7. negative tests for cross-employee, SHARED approver, stale assignee and confidential leakage;
8. no binary Excel/PDF renderer, UI integration, dependency addition, Kintone write or deployment in WP001.

## 3. Antigravity low-credit execution rule

Antigravity must **not** start before Owner approval.

After exact approval of `D2-WP001`, Antigravity must read only:
1. `project-docs/AI_CONTROL_CENTER.md`;
2. `project-docs/AI_ACTIVE_TASK.md`;
3. `project-docs/EXCEL_EXPORT.md`;
4. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`;
5. `project-docs/SECURITY_MODEL.md`;
6. `src/services/mbo-export-service.js`;
7. `tests/mbo-export-service.test.js`;
8. only exact existing D1 security source imported by the implementation.

Execution rules:
- no whole-repo scan;
- no planning expansion;
- smallest patch only;
- focused tests only;
- one implementation commit preferred;
- no deploy;
- no Live Kintone access/write;
- final executor status may be only `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`;
- ChatGPT must independently review before PASS.

## 4. Legacy template evidence gate

The approved legacy binary templates are deliberately not committed because `.gitignore` excludes them as potentially employee-data-bearing local references.

Before template renderer/parity work begins, ChatGPT must receive or otherwise obtain approved sanitized/local evidence for at least:
- `PMS_Staff & Chief_PART_A.xlsx`;
- `PMS_Staff & Chief_PART_B.xlsx`;
- approved PDF example if PDF visual parity is required against a specific output.

This evidence gate does not block WP001 because WP001 deliberately excludes binary rendering.

## 5. Forbidden until Owner approves WP001

Do not:
- modify `src/`;
- modify `tests/`;
- add package dependencies;
- change build/runtime assets;
- deploy;
- write App53/App794/App795/App801;
- change ACL/Process Management;
- create Live UAT records;
- export confidential Live data;
- start D3/D4/D5/D6 implementation;
- ask Antigravity to implement D2-WP001.

## 6. Current safety / authorization

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

Exact next gate: Owner approval or rejection/correction of `D2-WP001`.
