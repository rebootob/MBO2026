# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual local/runtime execution is required
> Updated: 2026-08-30 — HYBRID IDENTITY CONFIRMED / DUAL-ROLE ARCHITECTURE PROMOTED / APP800 RESET UI SOURCE WP REMAINS ACTIVE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 remains accepted known-good. Password Reset core exists. HR/admin native reset authority is READY. User has now confirmed Hybrid Identity: dedicated Kintone users auto-bind to Employee_Code without secondary MBO login; shared principals retain Employee_Code + App801 MBO login. Dual-role Employee + Approver is canonical. Physical dedicated-user mapping source and Natta/Vassana exact mappings remain PENDING READ-ONLY AUDIT before implementation. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; current deployed UI remains read-only MVP. HR native authority for Reset MBO Password is READY; Reset UI source WP is active. |
| D5 | 🟠 Copy own previous MBO IN PROGRESS / future focused task |
| D6 | 🔴 Integrated E2E / Security / Regression pending; must include both identity modes + dual-role approval separation |
| D7 | ✅ Admin Support Center source functionality CLOSED; reopen only on a new proven defect. |

## 2. Accepted App794 Baseline — Do Not Reopen Without Regression

```text
LIVE_REVISION                 = 60
PREVIEW_REVISION              = 60
ACCEPTED_SOURCE_COMMIT        = 1ed342ad137a4a364496a28d29bdffd24a99b511
ACCEPTED_JS_IDENTITY          = 115a08ace32bdf850cb5eebf25b953d1803114d0
ACCEPTED_CSS_IDENTITY         = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
SCOPE                         = ALL
TOPOLOGY                      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
TECHNICAL_DEPLOY_REVIEW       = PASS WITH AUDIT CAVEAT
REV60_USER_UAT                = PASS
```

Rev60 closed the Fatal Create clean-exit defect. Rev57 remains historical prior known-good evidence only.

## 3. Confirmed D1 Hybrid Identity — NEW DURABLE ARCHITECTURE

User-confirmed on 2026-08-30:

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
```

### Dedicated Kintone User

```text
native Kintone login
-> exact authoritative Kintone User Code <-> active Employee_Code mapping
-> Employee-Self auto-bind
-> NO secondary MBO Employee_Code/password login
```

Rules:
- exact 1:1 mapping required;
- missing/ambiguous mapping fails closed;
- do not infer from display name/email/App795 route membership;
- `admin-form` is excluded from Employee-Self auto-bind;
- dedicated path must not be forced through the App801 bearer-token session merely to mimic shared users.

### Shared Kintone User

```text
approved shared principal
-> App794 MBO Login
-> Employee_Code + App801 MBO password
-> short-lived App801-backed same-tab session
-> Employee-Self scope
```

Shared-principal security ceiling remains:

```text
DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

## 4. Dual-Role Employee + Approver — CONFIRMED

User confirmed Natta and Vassana are examples of people who both:
- create/use their own MBO as employees; and
- approve other employees' MBO records.

Do not create duplicate employee identities or duplicate own-MBO records.

Canonical context separation:

```text
My MBO ownership        = bound Employee_Code
Approver identity       = current dedicated Kintone User
My Approval Tasks       = records whose authoritative current native Workflow assignee is that Kintone User
```

Static App795 membership alone is not actionable authorization. Current Workflow assignment must be revalidated on record open/action.

If the user's own MBO is routed back to the same Kintone user as Approver:

```text
SELF_APPROVAL_ROUTE_CONFLICT -> FAIL CLOSED
```

Do not silently skip the user or auto-approve.

### TMG2/Natta interpretation

Confirmed App795 route remains:

```text
TMG2|Marketing -> natta -> uchida
```

If 20 TMG2 Marketing employees are actually at Natta's current approval step:
- App795 still has one route row;
- App794 has 20 employee MBO records;
- Natta's pending approval list may show 20 tasks;
- items before/after Natta's step are not counted as current pending Natta tasks.

Natta's own MBO route must be resolved from Natta's own employee routing context, not from the fact that `natta` approves TMG routes.

## 5. Dedicated Requester Actor Rule — CONFIRMED DESIGN

For requester-owned native Process states/actions:

```text
Dedicated employee with exact mapping
  -> Effective_Requester_User = own dedicated Kintone User

Shared-account employee
  -> Effective_Requester_User = App795.Requester_User
```

This avoids requiring a dedicated user such as Natta/Vassana to switch to a shared requester account to operate their own MBO.

Implementation is NOT yet authorized. Exact mapping source must be proven first.

## 6. Dedicated Mapping Source — CURRENT BLOCKER / EVIDENCE GAP

Business rule is confirmed, but physical source is not yet proven:

```text
DEDICATED_MAPPING_BUSINESS_RULE  = CONFIRMED
DEDICATED_MAPPING_PHYSICAL_SOURCE = PENDING READ-ONLY APP53 AUDIT
```

Before Hybrid Identity source implementation, perform READ-ONLY audit for at least Natta and Vassana:
- active App53 employee row;
- Employee_Code;
- Position / Department / Section / Team;
- any existing Kintone user/login/user-select field in App53;
- exact Kintone User Code if source supports it;
- App795 routes where the user is an Approver;
- own route resolution from the employee's own context.

App53 is protected. No schema/record write is authorized by this decision.

## 7. Accepted Password Reset Authority Evidence

Accepted App800 discovery evidence commit:
`00e6afd329e0dc71bd2ca0ecb406d83791541e1a`

Accepted App801 readiness evidence commit:
`63c4b45cb3654c1a320dbde611a5c7e560e57055`

Accepted facts:

```text
APP800_CREATOR_CODE                = admin-form
APP801_CREATOR_CODE                = admin-form
ADMIN_FORM_RESET_NATIVE_AUTHORITY  = READY
APP801_RECORD_ACL                  = NONE_CONFIGURED (Live + Preview rights=[])
APP801_FIELD_ACL                   = NONE_CONFIGURED (Live + Preview rights=[])
GROUP_everyone_APP800              = DENIED
GROUP_everyone_APP801              = DENIED
```

## 8. User-Provisioned HR Native Authority — Runtime Readback Accepted

Dedicated static Kintone group:

```text
DISPLAY_NAME                   = MBO HR Administrators
GROUP_CODE                     = HR_ADMIN_GROUP
```

User READ-ONLY console readback proved:

```text
HR_GROUP_CODE_FOUND_APP800     = true
HR_GROUP_CODE_FOUND_APP801     = true

APP800 / HR_ADMIN_GROUP:
  View records                 = true
  Add records                  = false
  Edit records                 = false
  Delete records               = false
  Manage app                   = false
  Import                       = false
  Export                       = false

APP801 / HR_ADMIN_GROUP:
  View records                 = true
  Add records                  = false
  Edit records                 = true
  Delete records               = false
  Manage app                   = false
  Import                       = false
  Export                       = false

PASSWORD_RESET_AUTHORITY_READY = true
```

Decision:

```text
ADMIN_FORM_RESET_NATIVE_AUTHORITY = READY
HR_RESET_NATIVE_AUTHORITY         = READY
PASSWORD_RESET_NATIVE_AUTHORITY_READINESS = READY
```

Do not broaden these ACLs. Do not add HR to `MBO_EMPLOYEE_ACCESS` as a shortcut.

`Reset MBO Password` is an App801 MBO credential function and must never be described as resetting the user's native Kintone/cybozu password.

## 9. Existing Reset Core — Reuse, Do Not Duplicate

Canonical implementation already exists in:
`src/ui/mbo-kintone-auth-adapter.js`

Public method:
`MboKintoneAuthAdapter.resetMboPassword({ employeeCode })`

Accepted reset semantics remain:
- temporary MBO password = exact Employee_Code via PBKDF2-SHA256 / 100000;
- `Force_Password_Change = YES`;
- `Failed_Attempts = 0`;
- clear `Locked_Until` temporary lock;
- increment positive `Credential_Version` exactly once;
- clear active Session fields;
- may update `Password_Changed_At`;
- preserve `Account_Status`;
- exactly one existing App801 row only; missing/duplicate/malformed fail closed;
- no credential create/delete;
- no password/hash/token/session secret returned to UI.

## 10. Current Active Task — KEEP NARROW

```text
ACTIVE_TASK                   = D1 APP800 PASSWORD RESET ADMIN UI SOURCE R1
OWNER                         = ANTIGRAVITY
MODE                          = SOURCE / FOCUSED TEST / LOCAL BUILD ONLY
LIVE_KINTONE_WRITE            = NO
ACL_WRITE                     = NO
CUSTOMIZATION_UPLOAD          = NO
DEPLOY                        = NO
PASSWORD_RESET_EXECUTION      = NO
HYBRID_IDENTITY_IMPLEMENTATION = NO (OUT OF SCOPE FOR THIS WP)
```

Objective remains: add the narrow Reset MBO Password administrative surface to App800, reuse accepted reset core, and establish reproducible App800 browser bundle.

The newly confirmed Hybrid Identity architecture must **not** widen this executor task. Antigravity must finish only the existing reset UI packet and STOP.

## 11. Planned Next Hybrid Identity Gate

After the current App800 Reset UI source task is independently reviewed/closed, next Control Plane action should be:

```text
D1 HYBRID IDENTITY MAPPING & DUAL-ROLE READ-ONLY AUDIT R1
OWNER = CONTROL PLANE -> ANTIGRAVITY only for exact Kintone/App53 read execution if required
WRITE = NONE
TARGET EXAMPLES = Natta + Vassana
```

Only after that audit passes should source implementation be opened for:
- identity mode resolver;
- dedicated Kintone auto-bind;
- effective requester actor;
- My MBO + My Approval Tasks;
- authoritative approver context;
- self-approval guard;
- related focused tests/UAT.

## 12. Authorization Ledger / Safety

```text
LATEST_DEPLOY_AUTH            = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01 — CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH              = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_ACL_WRITE_AUTH         = NONE
ROLLBACK_AUTH                 = NONE
```

The user's manual App800/App801 ACL provisioning is accepted completed runtime state; it is not an active reusable authorization.

No App800/App801/App794/App53 record write, App53 schema change, App795 route write, customization upload, deploy, new ACL change, Process update, password reset execution, or rollback is authorized for Antigravity.

## 13. Current Gate

```text
CURRENT_GATE                  = D1 APP800 PASSWORD RESET ADMIN UI SOURCE R1
CURRENT_MODE                  = SOURCE / TEST / BUILD ONLY
NEXT_OWNER                    = ANTIGRAVITY FOR EXACT ACTIVE TASK
EXPECTED_NEXT                 = CHATGPT INDEPENDENT REVIEW
NEXT_AFTER_RESET_UI_CLOSURE   = HYBRID IDENTITY READ-ONLY MAPPING/DUAL-ROLE AUDIT
```
