# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-08-31 — D1 REV66 ACL PASS / HR UI ACCESS-MODE BLOCKER

## 1. Whole-project scoreboard

| ID | Status | Current checkpoint |
|---|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | 🟠 IN PROGRESS | App53 mapping + own-route/native workflow PASS; App794 Rev66 ACL CONFIG PASS; requester runtime PASS; HR native ACL PASS; HR App794 UI access-mode defect OPEN |
| D2 Excel + PDF Original/Legacy Format | 🟠 IN PROGRESS | Legacy format parity/security not closed |
| D3 8 Legacy PMS Apps → App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED | Read-only mapping/reconciliation path only |
| D4 App800 HR Control Center E2E | 🟠 IN PROGRESS | Reset semantics/source accepted; full live E2E not closed |
| D5 Copy Own Previous MBO | 🟠 IN PROGRESS | Narrow carry-forward whitelist remains current design |
| D6 Integrated E2E / Security / Regression | 🔴 PENDING | Starts after D1–D5 sufficiently ready |
| D7 Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED | Reopen only proven defect |

## 2. D1 architecture — do not revert

```text
D1 = KINTONE-ONLY
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
AUTH_BRIDGE = CANCELLED
```

Dedicated employee self: native Kintone user -> exact active App53 `MBO_Kintone_User` mapping -> canonical `emp_text` Employee_Code.

Shared employee self: approved shared principal -> App801 MBO login/session -> Employee_Code.

Dedicated approver authority = authoritative current App794 native `Assignee`; static App795 membership is insufficient. SHARED approver authority remains denied.

`admin-form` = technical administrator only; no business workflow authority.

## 3. Accepted App53 / Process truth

```text
APP53_TOTAL_RECORDS = 281
DEDICATED_MAPPINGS_VERIFIED = 24
UNEXPECTED_NONEMPTY_MBO_KINTONE_USER = 0
papatchaya -> Employee 0113

APP794_PROCESS_STATES = 16
APP794_PROCESS_ACTIONS = 31
```

31 actions is current accepted truth after the user-approved two-button correction at statuses 01 / 06 / 11. Older 28-action wording is stale.

`GM_User` remains optional. First-Manager statuses/actions remain for future M2 routes.

## 4. Clean Dedicated route/workflow UAT — PASS

Canonical Record #12:

```text
EMPLOYEE_CODE = 0113
REQUESTER_USER = papatchaya
FIRST_MANAGER_USER = BLANK
MANAGER_USER = pattama
GM_USER = BLANK
ROUTING_TOPOLOGY = M1_ONLY
OWN_MBO_SELF_APPRAISER_ELISION = PASS
```

Accepted native transition:

```text
FROM = 01 Draft Objective
ACTION = Submit Objective to Manager
TO = 03 Manager Objective Review
ASSIGNEE = pattama
RECORD_REVISION = 11
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

Pattama interactive login remains unavailable; do not reset Pattama password solely for UAT.

## 5. App794 Rev66 ACL — CONFIG PASS

```text
APP794_REVISION = 66
HR_ADMIN_GROUP_APP_ACCESS = View/Edit; no Add/Delete/Import/Export/App Admin
RECORD_ACL_RULE_COUNT = 6
LIVE_PREVIEW_MATCH = true
PROCESS_CHANGED_BY_ACL = false
```

Six-rule lifecycle model:

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

## 6. Rev66 runtime evidence — PASS where tested

Requester `papatchaya` at status01:

```text
viewable = true
editable = true
deletable = false
REV66_REQUESTER_OWN_DRAFT_ACL = PASS
```

Requester `papatchaya` after 01 -> 03:

```text
STATUS = 03 Manager Objective Review
ASSIGNEE = pattama
viewable = true
editable = false
deletable = false
REV66_REQUESTER_APPROVER_STAGE_DOWNGRADE = PASS
```

Controlled `hr` at status03:

```text
Native ACL evaluate:
viewable = true
editable = false
deletable = false
REV66_HR_STATUS03_NATIVE_ACL = PASS
```

## 7. Current D1 blocker — HR App794 UI access mode

While logged in as `hr`, App794 customization renders:

```text
Employee Identity Mapping Failed
NO_ACTIVE_EMPLOYEE_MAPPING_FOUND
```

Source review establishes:

- `src/services/mbo-identity-service.js` principal mode resolver supports `SHARED`, `DEDICATED`, `TECHNICAL_ADMIN` only.
- `hr` is therefore classified as `DEDICATED`.
- `src/main-mbo-app.js` applies `resolveRuntimeEmployeeSelfContext()` to App794 index/detail and requires every Dedicated principal to have exact App53 Employee-Self mapping.
- Native App/Record ACL already allows HR correctly, so this is not an ACL defect.

Canonical decision:

```text
HR_NATIVE_RECORD_ACL = PASS
HR_APP794_UI_RUNTIME_ACCESS = BLOCKED
CAUSE = HR HAS NO SEPARATE AUTHORITATIVE RUNTIME MODE; FALLS INTO DEDICATED EMPLOYEE-SELF MAPPING GATE
DO_NOT_ADD_FAKE_APP53_MAPPING_FOR_HR = TRUE
DO_NOT_BROADEN_ACL = TRUE
```

Required architecture:

```text
EMPLOYEE DEDICATED -> App53 mapping required
SHARED EMPLOYEE    -> App801 login/session required
TECHNICAL_ADMIN    -> technical inspection only
HR_ADMIN           -> verified HR lifecycle path; no Employee-Self mapping requirement
```

HR_ADMIN must be verified from an authoritative role/group source; caller-provided role strings must not grant access.

## 8. Exact current gate

```text
ACTIVE_TASK = APP794 HR RUNTIME ACCESS-MODE CORRECTIVE + REV66 ACL UAT
CURRENT_OWNER = CHATGPT
ANTIGRAVITY = JUSTIFIED ONLY FOR MINIMUM NECESSARY SOURCE IMPLEMENTATION AFTER DESIGN IS FROZEN
ACTIVE_KINTONE_WRITE_AUTH = NONE
KINTONE_CUSTOMIZATION_DEPLOY_AUTH = NONE
```

Exact next action: freeze a narrow source corrective plan for `src/services/mbo-identity-service.js` + `src/main-mbo-app.js`, tests, required build/dist artifacts, and deploy/UAT/rollback plan. No Live deploy yet.

## 9. Remaining D1 runtime evidence

```text
FOREIGN_RECORD_NEGATIVE_RUNTIME = PENDING
CURRENT_MANAGER_INTERACTIVE_RUNTIME = PENDING / CREDENTIAL-LIMITED
HR_STATUS15_RUNTIME = PENDING
STALE_PRIOR_APPROVER_RUNTIME = PENDING
```

Any synthetic record create/delete/transition requires a new exact one-shot authorization.

## 10. Other project tracks

D2 Excel/PDF legacy-format parity/security remains open.

D3 source Apps `283,310,305,643,307,640,715,716` remain read-only by default; App794 migration write not authorized.

D4 App800 HR Control Center full Live E2E remains open/not authorized.

D5 Copy Own Previous MBO remains limited to Objective, Action Plan, Additional Agreement and Weight; no scores/results/workflow/profile snapshots.

D6 Integrated E2E/security/regression remains pending.

D7 Admin Support Center source functionality remains closed.

## 11. Cancelled App802 path

```text
APP802_RESUME_WRITE_AUTH = REVOKED
APP802_FORWARD/ROLLBACK = CANCELLED
SECOND_SANDBOX_CREATE_AUTH = NONE
```

## 12. Authorization ledger

```text
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
ACTIVE_RECORD_ACL_WRITE_AUTH = NONE
ACTIVE_PROCESS_UAT_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH = NONE
PRODUCTION_ROLLBACK_AUTH = NONE
```

Consumed authorizations must never be reused.
