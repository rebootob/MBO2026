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

Clean App794 Record #12 pre-transition snapshot:

```text
EMPLOYEE_CODE = 0113
REQUESTER_USER = papatchaya
MANAGER_LEVEL1_APPROVERS = pattama
MANAGER_LEVEL2_APPROVERS = BLANK
GM_LEVEL1_APPROVERS = BLANK
GM_LEVEL2_APPROVERS = BLANK
FIRST_MANAGER_USER = BLANK
MANAGER_USER = pattama
GM_USER = BLANK
HAS_MANAGER_LEVEL2 = No
HAS_GM_LEVEL2 = No
ROUTING_TOPOLOGY = M1_ONLY
D1_CLEAN_DEDICATED_ROUTING_SNAPSHOT = PASS
```

Native workflow transition evidence after Papatchaya executed `Submit Objective to Manager`:

```text
RECORD_ID = 12
STATUS = 03 Manager Objective Review
ASSIGNEE = pattama
REQUESTER = papatchaya
MANAGER = pattama
GM = BLANK
TOPOLOGY = M1_ONLY
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

The App794 employee-stage two-button defect was corrected for 01 / 06 / 11 using mutually-exclusive `Routing_Topology` conditions. `GM_User` is optional. `MBO_DEDICATED_ACCESS` has App794 View/Add/Edit and no Delete/Import/Export/App Admin.

## 1. Goal

Design the complete App794 record-level privacy and current-approver ACL model before applying any ACL write.

The design must protect all 24 Dedicated users, not only Employee 0113.

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

Therefore record-level ACL must ensure that a Dedicated employee cannot access another employee's MBO unless the user is the authoritative current native approver for that record or another explicitly authorized administrative role applies.

## 3. Canonical field entities

Use only App794 record/runtime fields that correspond to the record's current routing snapshot:

```text
Requester_User
First_Manager_User
Manager_User
GM_User
```

Static App795 routing membership must not by itself grant record access.

Native workflow `Assignee` remains the authoritative current approval identity for action authorization; ACL design must not create a contradictory stale-access path.

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
- Must not retain record access after workflow moves beyond their current role unless another valid current role independently grants access.

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
2. Exact HR/Admin entities that must retain lifecycle access.
3. For each of the 16 statuses, which field entity is allowed View and which is allowed Edit.
4. Whether requester retains View during all approver stages while Edit is removed.
5. Exact requester behavior in waiting/completed statuses 05 / 10 / 16.
6. Exact HR-only/admin behavior in status 15 HR Final Check.
7. How Return actions restore requester or prior current-role editing without preserving stale approver access.
8. Whether any rule order/priority interaction in Kintone could broaden access unexpectedly.

## 7. Exact next step — GET/SCREEN ONLY

User opens:

```text
App794 -> App Settings -> Permissions for records
```

Then either:
- send a full screenshot of the existing Record Permission page; or
- run a GET-only Browser Console ACL read if needed.

Do not change any rule yet.

ChatGPT then builds a complete 16-status ACL matrix and reviews rule ordering/HR/Admin preservation before requesting any authorization.

## 8. Safety rules

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

All Kintone checks during this task are GET-only / screen inspection until the user separately authorizes an exact complete ACL change.

## 9. Decision output

End design with exactly one of:

```text
A. ACL DESIGN READY — request exact user authorization for complete App794 record ACL write
B. MORE GET-ONLY EVIDENCE REQUIRED — specify exact Browser Console/screen inspection
C. BLOCKED — state exact unresolved access requirement
```

Prefer User + ChatGPT execution. Antigravity is not needed for this gate.

## 10. Handoff pointer

For a new conversation, use `project-docs/NEW_CHAT_BOOTSTRAP_PROMPT.md`. The new chat must fresh-fetch HEAD, read `CHAT_HANDOFF.md` first, then this Active Task, and continue from Section 7 without repeating accepted D1 UAT.
