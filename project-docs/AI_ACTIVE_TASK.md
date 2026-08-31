# AI ACTIVE TASK — APP794 HR RUNTIME ACCESS-MODE CORRECTIVE + REV66 ACL UAT

Mode: **CHATGPT CONTROL PLANE / ANTIGRAVITY ONLY FOR NECESSARY SOURCE CORRECTIVE / NO UNAUTHORIZED KINTONE WRITE**
Branch: `ai/antigravity-wp002c`
Updated: 2026-08-31 ICT

```text
TASK_STATE = OPEN / ACL CONFIG PASS / REQUESTER ACL PASS / HR NATIVE ACL PASS / HR UI BLOCKER FOUND
CURRENT_OWNER = CHATGPT
ANTIGRAVITY_ACTION = PREPARE ONLY WHEN SOURCE FIX IS AUTHORIZED/REQUIRED
ACTIVE_KINTONE_WRITE_AUTH = NONE
APP794_RECORD_ACL_WRITE_AUTH = CONSUMED / NONE
PROCESS_UAT_WRITE_AUTH = CONSUMED / NONE
GROUP_WRITE_AUTH = NONE
```

## 0. Accepted D1 prerequisites

```text
APP53_DEDICATED_MAPPINGS = 24 / PASS
PAPATCHAYA_EMPLOYEE_CODE = 0113
OWN_MBO_SELF_APPRAISER_ELISION = PASS
RECORD_12_TOPOLOGY = M1_ONLY
PROCESS_STATES = 16
PROCESS_ACTIONS = 31
```

Record #12 accepted native transition:

```text
FROM = 01 Draft Objective
ACTION = Submit Objective to Manager
TO = 03 Manager Objective Review
ASSIGNEE = pattama
RECORD_REVISION = 11
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

## 1. App794 Rev66 ACL configuration — PASS

```text
APP794_REVISION = 66
APP_ACL_HR_ADMIN_GROUP = View/Edit; no Add/Delete/Import/Export/App Admin
RECORD_ACL_RULE_COUNT = 6
LIVE_PREVIEW_MATCH = true
PROCESS = unchanged 16 states / 31 actions
```

Six-rule lifecycle model:

```text
A  01 / 06 / 11  Requester_User View/Edit
B  02 / 07 / 12  First_Manager_User View/Edit + Requester View
C  03 / 08 / 13  Manager_User View/Edit + Requester View
D  04 / 09 / 14  GM_User View/Edit + Requester View
E  05 / 10 / 16  Requester View only
F  15            USER:hr View/Edit + Requester View

Every rule:
- HR_ADMIN_GROUP View
- USER:admin-form technical-admin access preserved
- everyone denied
```

## 2. Runtime ACL evidence accepted

### Requester own Draft — PASS

```text
LOGIN = papatchaya
STATUS = 01 Draft Objective
viewable = true
editable = true
deletable = false
PAGE editRecord = true
PAGE deleteRecord = false
REV66_REQUESTER_OWN_DRAFT_ACL = PASS
```

### Requester at Manager stage — PASS

```text
LOGIN = papatchaya
STATUS = 03 Manager Objective Review
ASSIGNEE = pattama
viewable = true
editable = false
deletable = false
REV66_REQUESTER_APPROVER_STAGE_DOWNGRADE = PASS
```

### HR native ACL at Manager stage — PASS

Controlled user `hr`, Record #12 at status03:

```text
LOGIN = hr
STATUS = 03 Manager Objective Review
REQUESTER = papatchaya
MANAGER = pattama
ASSIGNEE = pattama
ACL viewable = true
ACL editable = false
ACL deletable = false
REV66_HR_STATUS03_NATIVE_ACL = PASS
```

`kintone.app.record.getPermissions()` could not execute because the App794 customization blocked the page before normal record-detail UI initialization. This is not an ACL failure.

## 3. New blocker — HR UI runtime identity classification

Observed while logged in as `hr`:

```text
Employee Identity Mapping Failed
NO_ACTIVE_EMPLOYEE_MAPPING_FOUND
```

Repository source review proves the cause:

- `MboIdentityService.resolveKintonePrincipalMode()` recognizes only `SHARED`, `DEDICATED`, `TECHNICAL_ADMIN`.
- only `admin-form` / Administrator aliases are classified as `TECHNICAL_ADMIN`.
- `hr` is therefore classified as `DEDICATED`.
- `resolveRuntimeEmployeeSelfContext()` then requires an exact App53 `MBO_Kintone_User` employee mapping for every `DEDICATED` principal.
- `hr` intentionally has no Employee-Self mapping, so App794 index/detail customization renders `Employee Identity Mapping Failed` and replaces/hides the normal UI.
- Native App/Record ACL already authorizes HR correctly, so changing ACL or adding fake App53 employee mapping for `hr` would be the wrong fix.

Canonical classification:

```text
HR_NATIVE_RECORD_ACL = PASS
HR_APP794_UI_RUNTIME_ACCESS = BLOCKED
BLOCKER = PRINCIPAL_MODE / EMPLOYEE_SELF_GATE DOES NOT HAVE HR ADMIN MODE
DO_NOT_ADD_FAKE_APP53_EMPLOYEE_MAPPING_FOR_HR = TRUE
DO_NOT_BROADEN_RECORD_ACL = TRUE
```

## 4. Required corrective design

Add a separately verified HR/Admin runtime mode for App794 non-Employee-Self access. The correction must preserve fail-closed Employee-Self behavior.

Required behavior:

```text
EMPLOYEE dedicated user -> exact App53 mapping -> Employee-Self context
SHARED employee user    -> App801 MBO login/session -> Employee-Self context
TECHNICAL_ADMIN         -> technical inspection path only
HR_ADMIN                -> HR lifecycle/access path; MUST NOT require Employee-Self App53 mapping
```

HR authorization must come from an authoritative source (approved HR group/role), not from caller-supplied role strings and not from static guessed usernames except the existing controlled Sandbox `hr` mapping where explicitly bounded.

Source areas already identified as relevant:

```text
src/services/mbo-identity-service.js
src/main-mbo-app.js
```

Do not modify unrelated modules.

## 5. Exact next step — SOURCE CORRECTIVE PLAN, NO LIVE DEPLOY

This is now an important source/security change, so Antigravity is justified only for the minimum implementation work after ChatGPT freezes the corrective design.

Before implementation/deploy, produce a narrow plan covering:

1. exact authoritative HR-mode resolver;
2. App794 index/detail behavior for HR_ADMIN;
3. proof that Employee-Self mapping remains mandatory for Dedicated employees;
4. proof that `admin-form` remains technical-only and gains no business workflow authority;
5. tests for HR status03 View-only and status15 View/Edit semantics;
6. tests proving ordinary unmapped Dedicated users still fail closed;
7. build/dist files actually required for App794 customization;
8. deploy/UAT/rollback plan.

No Kintone customization deploy is authorized yet.

## 6. Remaining privacy evidence after HR UI corrective

```text
FOREIGN_RECORD_NEGATIVE_RUNTIME = PENDING
CURRENT_MANAGER_INTERACTIVE_RUNTIME = PENDING / PATTAMA PASSWORD UNAVAILABLE
HR_STATUS15_RUNTIME = PENDING
STALE_PRIOR_APPROVER_RUNTIME = PENDING
```

A single disposable foreign-record test may be used later only under a new exact one-shot record create/delete authorization.

## 7. Safety rules

```text
APP794_ACL_WRITE = NO
APP794_PROCESS_CONFIG_WRITE = NO
APP794_SCHEMA_WRITE = NO
APP794_RECORD_CREATE/EDIT/DELETE = NO
APP53_WRITE = NO
APP795_WRITE = NO
APP801_WRITE = NO
GROUP_MEMBERSHIP_WRITE = NO
KINTONE_CUSTOMIZATION_DEPLOY = NO
ROLLBACK = NO
```

Never reuse consumed authorizations.

## 8. Current decision

```text
APP794_RECORD_ACL_CONFIG = PASS
REQUESTER_RUNTIME_ACL = PASS
HR_STATUS03_NATIVE_ACL = PASS
D1_RECORD_PRIVACY_GATE = OPEN
CURRENT_BLOCKER = HR APP794 UI ACCESS-MODE DEFECT
NEXT_OWNER = ChatGPT -> freeze corrective design; Antigravity only for minimal necessary source implementation
```
