# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual local/runtime execution is required
> Updated: 2026-08-30 — HR NATIVE AUTHORITY VERIFIED READY / APP800 RESET UI SOURCE WP OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 remains accepted known-good. Password Reset core exists. App800 authority/binding discovery R1 = PASS. App801 native authority readiness R1 = PASS. User runtime ACL readback now proves `HR_ADMIN_GROUP` exists and has the required least-privilege App800/App801 permissions, so native Password Reset authority is READY. Next D1 gap = production App800 Reset Password UI source/test/build candidate. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; current deployed UI remains the read-only MVP, but HR native authority for Password Reset is now ready. |
| D5 | 🟠 Copy own previous MBO IN PROGRESS / future focused task |
| D6 | 🔴 Integrated E2E / Security / Regression pending |
| D7 | ✅ Admin Support Center source functionality CLOSED; reopen only on a new proven defect. |

## 2. Accepted App794 Baseline — Do Not Reopen

```text
LIVE_REVISION                 = 60
PREVIEW_REVISION              = 60
ACCEPTED_SOURCE_COMMIT        = 1ed342ad137a4a364496a28d29bdffd24a99b511
ACCEPTED_JS_IDENTITY          = 115a08ace32bdf850cb5eebf25b953d1803114d0
ACCEPTED_CSS_IDENTITY         = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
SCOPE                         = ALL
TOPOLOGY                      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
REV60_USER_UAT                = PASS
```

## 3. Accepted Password Reset Authority Evidence

Accepted App800 discovery evidence commit:
`00e6afd329e0dc71bd2ca0ecb406d83791541e1a`

Accepted App801 readiness evidence commit:
`63c4b45cb3654c1a320dbde611a5c7e560e57055`

Accepted facts before user provisioning:

```text
APP800_CREATOR_CODE                = admin-form
APP801_CREATOR_CODE                = admin-form
ADMIN_FORM_RESET_NATIVE_AUTHORITY  = READY
APP801_RECORD_ACL                  = NONE_CONFIGURED (Live + Preview rights=[])
APP801_FIELD_ACL                   = NONE_CONFIGURED (Live + Preview rights=[])
GROUP_everyone_APP800              = DENIED
GROUP_everyone_APP801              = DENIED
```

## 4. User-Provisioned HR Native Authority — Runtime Readback Accepted

User created the dedicated static Kintone group:

```text
DISPLAY_NAME                   = MBO HR Administrators
GROUP_CODE                     = HR_ADMIN_GROUP
```

User then provisioned least-privilege App ACL rows and ran the supplied READ-ONLY console verifier. The runtime result shown by the user on 2026-08-30 proves:

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

Do not broaden these ACLs. Do not add HR to `MBO_EMPLOYEE_ACCESS` as a shortcut. `HR_ADMIN_GROUP` is the dedicated MBO administrative security role.

## 5. Existing Reset Core — Reuse, Do Not Duplicate

Canonical implementation already exists in:
`src/ui/mbo-kintone-auth-adapter.js`

Public method:
`MboKintoneAuthAdapter.resetMboPassword({ employeeCode })`

Accepted reset semantics remain:
- temporary password = exact Employee_Code via PBKDF2-SHA256 / 100000;
- `Force_Password_Change = YES`;
- `Failed_Attempts = 0`;
- clear `Locked_Until` temporary lock;
- increment positive `Credential_Version` exactly once;
- clear active Session fields;
- may update `Password_Changed_At`;
- preserve `Account_Status`;
- exactly one existing App801 row only; missing/duplicate/malformed fail closed;
- no credential create/delete;
- no password/hash/token/session secret returned to the UI.

## 6. Current Active Task

```text
ACTIVE_TASK                   = D1 APP800 PASSWORD RESET ADMIN UI SOURCE R1
OWNER                         = ANTIGRAVITY
MODE                          = SOURCE / FOCUSED TEST / LOCAL BUILD ONLY
LIVE_KINTONE_WRITE            = NO
ACL_WRITE                     = NO
CUSTOMIZATION_UPLOAD          = NO
DEPLOY                        = NO
PASSWORD_RESET_EXECUTION      = NO
```

Objective: add the narrow Reset MBO Password administrative surface to App800, reusing the accepted reset core, and establish a reproducible App800 browser bundle. No Live execution is authorized.

## 7. Authorization Ledger / Safety

```text
LATEST_DEPLOY_AUTH            = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01 — CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH              = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_ACL_WRITE_AUTH         = NONE
ROLLBACK_AUTH                 = NONE
```

The user's manual App800/App801 ACL provisioning is accepted as completed runtime state; it is not an active reusable authorization.

No App800/App801/App794 record write, customization upload, deploy, new ACL change, schema/layout/process update, password reset, or rollback is authorized for Antigravity.

## 8. Current Gate

```text
CURRENT_GATE                  = D1 APP800 PASSWORD RESET ADMIN UI SOURCE R1
CURRENT_MODE                  = SOURCE / TEST / BUILD ONLY
NEXT_OWNER                    = ANTIGRAVITY FOR EXACT ACTIVE TASK
EXPECTED_NEXT                 = CHATGPT INDEPENDENT REVIEW -> PREDEPLOY VERIFICATION -> USER EXACT ONE-SHOT DEPLOY AUTH IF PASS
```
