# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual local/runtime execution is required
> Updated: 2026-08-30 — APP800 RESET UI R1 REVIEW = CORRECTIVE / HYBRID IDENTITY REMAINS CONFIRMED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 remains accepted known-good. Hybrid Identity + Dual-Role architecture is confirmed. HR/admin native Reset MBO Password authority is READY. App800 Reset UI source R1 implementation exists but independent review found a production-runtime blocker and requirement gaps; corrective task is active. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; current deployed UI remains prior read-only MVP. Reset UI candidate is NOT accepted for deploy yet. |
| D5 | 🟠 Copy own previous MBO IN PROGRESS / future focused task |
| D6 | 🔴 Integrated E2E / Security / Regression pending; must include shared-login + dedicated-login + dual-role separation |
| D7 | ✅ Admin Support Center source functionality CLOSED; reopen only on proven defect. |

## 2. Accepted App794 Baseline — Do Not Reopen Without Regression

```text
LIVE_REVISION                 = 60
PREVIEW_REVISION              = 60
ACCEPTED_SOURCE_COMMIT        = 1ed342ad137a4a364496a28d29bdffd24a99b511
ACCEPTED_JS_IDENTITY          = 115a08ace32bdf850cb5eebf25b953d1803114d0
ACCEPTED_CSS_IDENTITY         = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
SCOPE                         = ALL
REV60_USER_UAT                = PASS
```

Rev60 remains the accepted known-good App794 runtime. The App800 Reset UI work does not reopen App794.

## 3. Confirmed Hybrid Identity / Dual Role — Durable Architecture

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
DUAL_ROLE_EMPLOYEE_APPROVER = CONFIRMED
```

Dedicated Kintone user:
```text
native Kintone login
-> exact authoritative Kintone User Code <-> active Employee_Code mapping
-> Employee-Self auto-bind
-> no secondary MBO Employee_Code/password login
```

Shared Kintone principal:
```text
approved shared principal
-> App794 MBO Login
-> Employee_Code + App801 MBO password
-> App801-backed same-tab session
-> Employee-Self scope
```

Dual-role context:
```text
My MBO ownership        = bound Employee_Code
Approver identity       = current dedicated Kintone User
My Approval Tasks       = records whose authoritative current native Workflow assignee is that Kintone User
SELF_APPROVAL_ROUTE_CONFLICT -> FAIL CLOSED
```

Physical dedicated-user mapping source remains:
```text
DEDICATED_MAPPING_PHYSICAL_SOURCE = PENDING READ-ONLY APP53 AUDIT
TARGET EXAMPLES = Natta + Vassana
```

No App53 write/schema change is authorized.

## 4. Password Reset Authority — Accepted Runtime State

```text
APP800_CREATOR_CODE                   = admin-form
APP801_CREATOR_CODE                   = admin-form
ADMIN_FORM_RESET_NATIVE_AUTHORITY     = READY
HR_ADMIN_GROUP                        = MBO HR Administrators / code HR_ADMIN_GROUP
HR_RESET_NATIVE_AUTHORITY             = READY
PASSWORD_RESET_NATIVE_AUTHORITY_READY = true
```

Least-privilege accepted ACL:
- App800 HR_ADMIN_GROUP: View only.
- App801 HR_ADMIN_GROUP: View + Edit; no Add/Delete/Manage/Import/Export.
- everyone denied.

Reset MBO Password is an App801 MBO credential operation only. It never means native Kintone/cybozu password reset.

## 5. Existing Reset Core — Accepted / Reuse

Canonical owner:
`src/ui/mbo-kintone-auth-adapter.js`

Public method:
`MboKintoneAuthAdapter.resetMboPassword({ employeeCode })`

Accepted semantics:
- temporary MBO password = exact Employee_Code using PBKDF2-SHA256 / 100000;
- Force Password Change = YES;
- Failed_Attempts = 0;
- clear temporary Locked_Until;
- Credential_Version +1 exactly once;
- clear active session metadata;
- preserve Account_Status;
- exactly one existing App801 row; missing/duplicate/malformed fail closed;
- no credential create/delete;
- no password/hash/token/session secret returned to UI.

Canonical Employee_Code format in the adapter is:
`^[A-Za-z0-9_.-]+$`

## 6. App800 Reset UI Source R1 — Independent Review Result

Executor commit reviewed:
`541b7e5cdb58ac533baeaec20325c00a73a295dd`

Executor evidence:
`project-docs/D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_EVIDENCE.md`

Executor reported focused tests 11/11 and full suite 977/977 PASS, with zero Live Kintone mutations/deployments. Git diff confirms only App800 Reset UI/build/test/dist/evidence files changed; App794/App53/App795/Hybrid Identity implementation files were not touched.

Independent review classification:

```text
D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_REVIEW = CORRECTIVE
DEPLOY_READY = NO
LIVE_WRITE_AUTH = NONE
```

### Finding A — Production bundle cannot construct reset adapter (BLOCKER)

`src/ui/hr-control-center.js` default production path references `MboKintoneAuthAdapter`, but the module does not import it. The dedicated build script bundles only `src/ui/hr-control-center.js`; the generated bundle contains a reference to `MboKintoneAuthAdapter` but no adapter class definition. Therefore the real browser default path would throw `MboKintoneAuthAdapter is unavailable.` instead of resetting.

Why tests missed it:
- runtime tests inject `onResetMboPassword`, bypassing the production default adapter path;
- bundle test checks syntax/import-export residue only, not dependency completeness or default Reset execution path.

Required corrective:
- statically import/bundle the canonical `MboKintoneAuthAdapter` into the App800 bundle;
- add a focused test proving the default non-injected production path constructs/uses the canonical adapter with mocked Kintone API and no network;
- prove generated bundle contains the adapter implementation, not merely a dangling reference.

### Finding B — Invalid Employee_Code prevalidation requirement missing

Authorizing Active Task required malformed/invalid Employee_Code to be blocked with zero reset-core calls. Current UI checks only empty and confirmation mismatch. A malformed but matching value can reach `resetFn`.

Required corrective:
- prevalidate the canonical format `^[A-Za-z0-9_.-]+$` before invoking resetFn;
- invalid format -> visible bilingual validation error + zero resetFn calls;
- do not change/reset-core semantics.

### Finding C — Read-only labeling became untruthful

The candidate still describes itself as `GET-Only browser runtime` and renders `SECURE READ-ONLY MVP`, while the new Reset panel is intentionally write-capable when authorized.

Required corrective:
- remove/replace stale read-only wording with truthful wording such as monitoring + authorized admin action;
- do not imply the whole App800 candidate is read-only once Reset is enabled.

## 7. Current Active Task

```text
ACTIVE_TASK                   = D1 APP800 PASSWORD RESET ADMIN UI SOURCE R1 CORRECTIVE
OWNER                         = ANTIGRAVITY
MODE                          = SOURCE / FOCUSED TEST / LOCAL BUILD ONLY
STARTING_IMPLEMENTATION_HEAD  = 541b7e5cdb58ac533baeaec20325c00a73a295dd
LIVE_KINTONE_WRITE            = NO
PASSWORD_RESET_EXECUTION      = NO
CUSTOMIZATION_UPLOAD          = NO
DEPLOY                        = NO
ACL_WRITE                     = NO
HYBRID_IDENTITY_IMPLEMENTATION = NO
```

## 8. Authorization Ledger / Safety

```text
LATEST_DEPLOY_AUTH            = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01 — CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH              = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_ACL_WRITE_AUTH         = NONE
ROLLBACK_AUTH                 = NONE
```

No App800/App801/App794/App53 record write, schema change, App795 route write, customization upload, deploy, password reset execution, ACL write, Process update, or rollback is authorized.

## 9. Next Gate

```text
CURRENT_GATE = APP800 RESET UI R1 CORRECTIVE
NEXT_OWNER   = ANTIGRAVITY FOR EXACT CORRECTIVE TASK
EXPECTED_NEXT = CHATGPT INDEPENDENT REVIEW
```

After Reset UI source acceptance, the next planned Control Plane task remains:
`D1 HYBRID IDENTITY MAPPING & DUAL-ROLE READ-ONLY AUDIT R1` for Natta + Vassana.
