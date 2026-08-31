# AI ACTIVE TASK — APP794 REV66 RECORD ACL RUNTIME / NEGATIVE ISOLATION UAT

Mode: **CHATGPT + USER / NO ANTIGRAVITY UNLESS NEEDED / NO UNAUTHORIZED KINTONE WRITE**
Branch: `ai/antigravity-wp002c`
Updated: 2026-08-31 ICT

```text
TASK_STATE = OPEN / CONFIG PASS / RUNTIME UAT IN PROGRESS
CURRENT_OWNER = CHATGPT + USER
ANTIGRAVITY_ACTION = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
APP794_RECORD_ACL_WRITE_AUTH = CONSUMED / NONE
PROCESS_UAT_WRITE_AUTH = CONSUMED / NONE
GROUP_WRITE_AUTH = NONE
```

## 0. Accepted prerequisite — Dedicated identity / route / native workflow

Dedicated Kintone Employee-Self UAT is accepted for `papatchaya` / Employee Code `0113`.

Canonical Record #12 route snapshot:

```text
EMPLOYEE_CODE = 0113
REQUESTER_USER = papatchaya
FIRST_MANAGER_USER = BLANK
MANAGER_USER = pattama
GM_USER = BLANK
ROUTING_TOPOLOGY = M1_ONLY
OWN_MBO_SELF_APPRAISER_ELISION = PASS
```

Current accepted App794 Process truth after the user-approved two-button fix:

```text
PROCESS_STATES = 16
PROCESS_ACTIONS = 31
01 / 06 / 11 each have mutually-exclusive First-Manager vs Manager submit actions.
28-action documentation is stale pre-two-button-fix count.
```

Record #12 native Process UAT:

```text
FROM = 01 Draft Objective
ACTION = Submit Objective to Manager
TO = 03 Manager Objective Review
NEXT_ASSIGNEE = pattama
RECORD_REVISION_AFTER = 11
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

## 1. App794 ACL Live configuration — CONFIG PASS

User-authorized Browser Console changes and readback established:

```text
APP794_REVISION = 66

APP ACL:
- MBO_DEDICATED_ACCESS = View/Add/Edit; no Delete/Import/Export/App Admin
- MBO_EMPLOYEE_ACCESS = preserved
- HR_ADMIN_GROUP = View/Edit; no Add/Delete/Import/Export/App Admin
- everyone = denied

RECORD ACL:
- COMPLETE RULE COUNT = 6
- LIVE/PREVIEW MATCH = true
- EXACT REVIEWED DESIGN = true

PROCESS:
- 16 states
- 31 actions
- unchanged by ACL write
```

Complete six-rule lifecycle model:

```text
A  01 / 06 / 11  Requester_User View/Edit
B  02 / 07 / 12  First_Manager_User View/Edit + Requester View
C  03 / 08 / 13  Manager_User View/Edit + Requester View
D  04 / 09 / 14  GM_User View/Edit + Requester View
E  05 / 10 / 16  Requester View only
F  15            USER:hr View/Edit + Requester View

All rules:
- HR_ADMIN_GROUP View
- USER:admin-form technical-admin access preserved
- everyone denied
```

Static App795 membership alone grants no record access.

## 2. Runtime evidence accepted

### 2.1 Requester own Draft — PASS

Logged in as `papatchaya`, Record #12 at `01 Draft Objective`:

```text
ACL_EVALUATION:
viewable = true
editable = true
deletable = false

PAGE_PERMISSION:
editRecord = true
deleteRecord = false

REV66_REQUESTER_OWN_DRAFT_ACL = PASS
```

### 2.2 Requester downgrade at Manager stage — PASS

After the authorized native Process transition to status 03:

```text
LOGIN = papatchaya
RECORD = 12
STATUS = 03 Manager Objective Review
REQUESTER = papatchaya
MANAGER = pattama
ASSIGNEE = pattama
ROUTING_TOPOLOGY = M1_ONLY

ACL_EVALUATION:
viewable = true
editable = false
deletable = false

REV66_REQUESTER_APPROVER_STAGE_DOWNGRADE = PASS
```

This proves requester edit rights are removed when authority passes to the Manager stage while requester view is retained.

## 3. Remaining privacy / runtime evidence

Still not independently runtime-proven:

1. **Foreign-record denial** — a Dedicated user must not View another employee's record when they are not a current approver/admin.
2. **Current Manager runtime View/Edit** — structurally configured for `Manager_User`, but Pattama interactive login is unavailable; do not reset Pattama password merely for UAT.
3. **HR lifecycle behavior** — HR group View outside status 15 and `USER:hr` View/Edit at status 15 are structurally configured; runtime coverage may be added using the controlled `hr` account where safe.
4. **Stale-prior-approver denial after transition/return** — structurally status-aware; runtime proof requires a controlled route/account scenario.

App794 currently had only Record #12 when admin-form enumerated visible records, so no existing foreign record was available for a negative isolation test.

## 4. Exact next step — ZERO WRITE FIRST

Use the existing Record #12 at `03 Manager Objective Review` for additional zero-write ACL checks before creating any synthetic data.

Preferred next evidence:

```text
A. login as controlled hr account
B. GET/evaluate Record #12 permissions only
C. Expected at status 03:
   viewable = true
   editable = false
   deletable = false
```

This validates HR lifecycle read-only behavior without moving workflow or changing data.

After that, Control Plane decides whether a **single disposable foreign-record negative UAT** is necessary. Any create/delete/transition needed for that test requires a new exact one-shot user authorization. Do not create synthetic records automatically.

## 5. Safety rules

```text
ANTIGRAVITY = NOT NEEDED FOR CURRENT GET-ONLY CHECK
APP794_ACL_WRITE = NO
APP794_PROCESS_WRITE = NO
APP794_SCHEMA_WRITE = NO
APP794_RECORD_CREATE/EDIT/DELETE = NO
APP53_WRITE = NO
APP795_WRITE = NO
APP801_WRITE = NO
GROUP_MEMBERSHIP_WRITE = NO
ROLLBACK = NO
```

Consumed authorizations must never be reused.

## 6. D1 decision gate

Do not close the Dedicated record-privacy gate solely from configuration readback.

Current classification:

```text
APP794_RECORD_ACL_CONFIG = PASS
REQUESTER_OWN_DRAFT_RUNTIME = PASS
REQUESTER_MANAGER_STAGE_DOWNGRADE = PASS
FOREIGN_RECORD_NEGATIVE_RUNTIME = PENDING
CURRENT_MANAGER_INTERACTIVE_RUNTIME = PENDING / CREDENTIAL-LIMITED
D1_RECORD_PRIVACY_GATE = OPEN
```

## 7. Handoff pointer

For a new conversation, fresh-fetch HEAD and read `project-docs/CHAT_HANDOFF.md` first, then `AI_CONTROL_CENTER.md`, this file, and relevant Confirmed Baselines. Do not repeat the accepted Rev66 configuration writes or Record #12 01->03 transition.
