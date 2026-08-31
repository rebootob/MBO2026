# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only for minimum necessary execution
> Updated: 2026-08-31 — D1 SHARED SESSION RUNTIME PASS / FINAL EVIDENCE ONLY

## 1. Whole-project scoreboard

| ID | Status | Current checkpoint |
|---|---|---|
| D1 Hybrid Identity + Password + Employee-Self + Approver Access | 🟠 IN PROGRESS / FINAL EVIDENCE ONLY | Dedicated identity/workflow/ACL/foreign isolation PASS; HR Rev67 PASS; Shared App801/session runtime PASS; residual comments/history/attachments Live review + dual-role Live disposition + final security review remain |
| D2 Excel + PDF Original/Legacy Format | 🟠 IN PROGRESS | Legacy-format parity/security not closed |
| D3 8 Legacy PMS Apps → App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED | Read-only/mapping/reconciliation path only |
| D4 App800 HR Control Center E2E | 🟠 IN PROGRESS | Full live E2E not closed |
| D5 Copy Own Previous MBO | 🟠 IN PROGRESS | Narrow carry-forward whitelist remains current design |
| D6 Integrated E2E / Security / Regression | 🔴 PENDING | Starts after D1–D5 sufficiently ready |
| D7 Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED | Reopen only proven defect |

## 2. D1 architecture — do not revert

```text
D1 = KINTONE-ONLY
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
AUTH_BRIDGE = CANCELLED
```

Dedicated employee: native Kintone user -> exact active App53 `MBO_Kintone_User` -> `emp_text` Employee_Code.
Shared employee: approved shared Kintone principal -> App801 MBO login/session -> Employee_Code.
Dedicated approval authority = authoritative current native App794 `Assignee`; static App795/snapshot membership is insufficient.
SHARED approver authority = denied.

```text
admin-form = TECHNICAL_ADMIN / NO EMPLOYEE ID
hr         = HR_ADMIN / NO EMPLOYEE ID
```

Never create fake Employee IDs/App53 mappings for non-employee principals.

## 3. Accepted D1 core truth

```text
APP53_TOTAL_RECORDS = 281
DEDICATED_MAPPINGS_VERIFIED = 24
papatchaya -> Employee 0113
APP794_PROCESS_STATES = 16
APP794_PROCESS_ACTIONS = 31
APP794_LIVE_REVISION = 67
```

Record #12:

```text
STATUS = 03 Manager Objective Review
REQUESTER = papatchaya
MANAGER = pattama
ASSIGNEE = pattama
ROUTING_TOPOLOGY = M1_ONLY
OWN_MBO_SELF_APPRAISER_ELISION = PASS
PAPATCHAYA_TO_PATTAMA_NATIVE_WORKFLOW = PASS
```

Pattama interactive credential is unavailable; do not reset the password solely for UAT.

## 4. Dedicated ACL/privacy — PASS

```text
Requester status01: View/Edit, no Delete = PASS
Requester status03: View-only, no Edit/Delete = PASS
HR status03: View-only, no Edit/Delete = PASS
Foreign Record #13 as papatchaya:
  Direct GET = DENIED / CB_NO02
  Query = 0
  ACL = view=false edit=false delete=false
  Direct URL = DENIED / CB_NO02
  Cleanup = PASS / no synthetic record remains
```

## 5. HR + approver structural review — PASS

```text
HR source corrective = cda4ed5e79736eaddcd96dd661d7a7294ae313f0
Deploy CSS-target fix = c6864d09f59cfaf6e7c86da422452a816a5cf430
Live revision = 67
Deploy = SUCCESS
HR_NON_EMPLOYEE_RUNTIME_MODE = PASS
```

Live structural evidence:

```text
15 HR Final Check = USER:hr / ONE
15 -> 16 Complete exists
15 -> 11 Return Final HR exists
03/08/13 Manager_User View/Edit; Requester View only
04/09/14 GM_User View/Edit; Requester View only; stale Manager no grant
15 hr View/Edit; Requester View only
STALE_PRIOR_APPROVER_STRUCTURAL = PASS
HR_STATUS15_STRUCTURAL = PASS
CURRENT_MANAGER_INTERACTIVE = CREDENTIAL-LIMITED / NON-BLOCKING
```

## 6. Shared Employee-Self / App801 Session Runtime — PASS

Controlled UAT candidate:

```text
Kintone principal = tmh
Employee_Code = 0130
App53 #414 = Active / no dedicated mapping
App801 #107
```

One-shot MBO password reset completed under exact authorization:

```text
Credential_Version 4 -> 5
Force_Password_Change = YES
Failed_Attempts = 0
Session_* cleared
```

One-shot Shared First-Login UAT completed under exact authorization:

```text
Login = PASS
Force Password Change = PASS
Credential_Version 5 -> 6
Force_Password_Change = NO
Session issued = PASS
Session_Credential_Version = 6
Session_Kintone_User = tmh
Local sessionStorage token = present
Employee-Self = 0130
Same-tab reload restore = PASS
Independent new tab = MBO Login / PASS
Logout = PASS
```

Final logout readback:

```text
Session_Token_Hash = blank
Session_Issued_At = blank
Session_Expires_At = blank
Session_Credential_Version = blank
Session_Kintone_User = blank
LOCAL_SESSION_TOKEN_PRESENT = false
LOGIN_OVERLAY_VISIBLE = true
Credential_Version = 6
Force_Password_Change = NO
Failed_Attempts = 0
D1_SHARED_SESSION_RUNTIME = PASS
```

All password-reset / Shared First-Login UAT authorizations are consumed.

Accepted shared-account ceiling remains:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT GUARANTEED UNDER SHARED KINTONE ACCOUNT
```

## 7. Remaining D1 final evidence

Targeted repository review confirms existing source/integration coverage:

```text
DUAL_ROLE_SOURCE_INTEGRATION = PASS
- Dedicated My MBO remains separate from My Approval Tasks
- current Assignee query is authoritative
- mismatched Assignee task is filtered
- App795 is not queried for approval authority
- SHARED mode exposes no approval-task section/query

COMMENTS_HISTORY_ATTACHMENTS_SOURCE = PASS
- no fake Live timeline events
- authoritative events only
- native comment GET path on detail/edit; none on create
- Live attachments use real saved filenames, not preview fixtures
- attachment desired-state preservation/removal tests exist
```

Still open:

```text
COMMENTS_HISTORY_ATTACHMENTS_RUNTIME = PENDING / GET-ONLY preferred
DEDICATED_SHARED_DUAL_ROLE_INTEGRATED_UAT = PARTIAL / SOURCE PASS, LIVE DISPOSITION PENDING
FINAL_D1_SECURITY_REVIEW = PENDING
```

## 8. Exact current gate

```text
ACTIVE_TASK = D1 FINAL CLOSURE EVIDENCE
NEXT_GATE = COMMENTS / HISTORY / ATTACHMENTS GET-ONLY RUNTIME REVIEW
TARGET = existing App794 Record #12 where possible
CURRENT_OWNER = ChatGPT + User
ANTIGRAVITY = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
APP801_WRITE_AUTH = NONE
```

Do not add comments, upload files, change App794 records, transition workflow, or create synthetic evidence without a new exact authorization.

## 9. Other project tracks

D2–D5 remain open as previously recorded. D6 remains pending. D7 remains source-closed.

## 10. Authorization ledger

```text
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_APP794_DEPLOY_AUTH = NONE
ACTIVE_RECORD_ACL_WRITE_AUTH = NONE
ACTIVE_PROCESS_UAT_WRITE_AUTH = NONE
ACTIVE_GROUP_WRITE_AUTH = NONE
APP53_SCHEMA_WRITE_AUTH = NONE
APP53_RECORD_WRITE_AUTH = NONE
APP53_BULK_WRITE_AUTH = NONE
APP801_WRITE_AUTH = NONE
PRODUCTION_ROLLBACK_AUTH = NONE
```

All prior HR deploy, foreign-record synthetic, 0130 reset, and Shared First-Login UAT authorizations are consumed and must never be reused.
