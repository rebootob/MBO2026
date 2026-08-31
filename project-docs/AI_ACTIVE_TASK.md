# AI ACTIVE TASK — APP794 DEDICATED RECORD ACL DESIGN + READ-ONLY VALIDATION

Mode: **CHATGPT + USER CONTROL-PLANE DESIGN / NO ANTIGRAVITY / ZERO KINTONE WRITE**
Branch: `ai/antigravity-wp002c`
Updated: 2026-08-31

```text
TASK_STATE = OPEN / DESIGN + READ-ONLY VALIDATION
CURRENT_OWNER = CHATGPT + USER
ANTIGRAVITY_ACTION = NONE
KINTONE_WRITE_AUTH = NONE
APP53_WRITE_AUTH = NONE
APP794_RECORD_ACL_WRITE_AUTH = NONE
GROUP_WRITE_AUTH = NONE
```

## 0. Accepted prerequisite

Dedicated Kintone Employee-Self UAT is accepted for `papatchaya` / Employee Code `0113`.

Fresh user-operated Browser Console evidence on App794 Record #12:

```text
STATUS = 03 Manager Objective Review
ASSIGNEE = pattama
REQUESTER = papatchaya
MANAGER = pattama
GM = BLANK
TOPOLOGY = M1_ONLY
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

The two-button workflow defect was corrected in App794 for employee stages 01 / 06 / 11 using mutually-exclusive `Routing_Topology` conditions.

## 1. Goal

Design the complete App794 record-level privacy and current-approver ACL model before applying any ACL write.

The design must protect all dedicated users, not only Employee 0113.

## 2. Security requirement

App-level group access is not sufficient isolation.

`MBO_DEDICATED_ACCESS` currently has App794:

```text
VIEW = true
ADD = true
EDIT = true
DELETE = false
IMPORT = false
EXPORT = false
APP_ADMIN = false
```

Therefore record-level ACL must ensure that a dedicated employee cannot access another employee's MBO unless the user is the authoritative current native approver for that record.

## 3. Canonical field entities

Use only authoritative App794 snapshot/runtime fields:

```text
Requester_User
First_Manager_User
Manager_User
GM_User
```

Static App795 routing membership must not by itself grant access.

## 4. Required lifecycle behavior

```text
REQUESTER / EMPLOYEE
- View own record throughout lifecycle.
- Edit only employee-owned stages.

CURRENT FIRST MANAGER
- View/Edit only First Manager review stages when authoritative for that record.

CURRENT MANAGER
- View/Edit only Manager review stages when authoritative for that record.

CURRENT GM
- View/Edit only GM review stages when authoritative for that record.

PRIOR APPROVER
- Must not retain record access after workflow moves beyond their current role unless another valid role independently grants access.

HR / ADMIN
- Preserve required administrative access.
```

## 5. Statuses to cover

Complete design must explicitly cover all current App794 process statuses:

```text
01 Draft Objective
02 First Manager Objective Review
03 Manager Objective Review
04 GM Objective Review
05 Objective Approved
06 Employee Mid-Year
07 First Manager Mid-Year Review
08 Manager Mid-Year Review
09 GM Mid-Year Review
10 Mid-Year Completed
11 Employee Self Evaluation
12 First Manager Final Evaluation
13 Manager Final Evaluation
14 GM Final Evaluation
15 HR Final Check
16 Completed
```

Do not apply a partial rule set that leaves later statuses undefined or accidentally locks records.

## 6. Current read-only review questions

ChatGPT + User must determine:

1. Exact current App794 Record Permission configuration.
2. Exact HR/Admin entities that must retain full lifecycle access.
3. For each of the 16 statuses, which field entity is allowed View and which is allowed Edit.
4. Whether requester should retain View during approver stages while Edit is removed.
5. Whether waiting/completed statuses 05 / 10 / 16 should be requester View-only.
6. How status 15 HR Final Check is restricted to HR/Admin.
7. How Return actions restore requester or prior current-role editing without preserving stale approver access.

## 7. Safety rules

```text
ANTIGRAVITY_EXECUTION = NO
APP794_RECORD_ACL_WRITE = NO
APP794_PROCESS_WRITE = NO
APP794_SCHEMA_WRITE = NO
APP53_WRITE = NO
APP795_WRITE = NO
GROUP_MEMBERSHIP_WRITE = NO
SOURCE_MODIFICATION = NO
DIST_MODIFICATION = NO
```

All Kintone checks during this task are GET-only until the user separately authorizes an exact complete ACL change.

## 8. Decision output

End design with exactly one of:

```text
A. ACL DESIGN READY — request exact user authorization for complete App794 record ACL write
B. MORE GET-ONLY EVIDENCE REQUIRED — specify exact browser-console inspection
C. BLOCKED — state exact unresolved access requirement
```

Prefer User + ChatGPT execution. Antigravity is not needed for this gate.
