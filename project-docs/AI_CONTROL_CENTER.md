# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual local/runtime execution is required
> Updated: 2026-08-30 — APP800 RESET UI R1 CORRECTIVE REVIEW = CORRECTIVE ROUND 2

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 remains accepted known-good. Hybrid Identity + Dual-Role architecture is confirmed. HR/admin native Reset MBO Password authority is READY. App800 Reset UI R1 corrective fixed the original dangling-adapter blocker, invalid-character precheck, and stale READ-ONLY label, but independent review found a new deploy-helper regression, whitespace identity mismatch, and incorrect evidence provenance. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; deployed App800 remains prior MVP. Reset UI candidate is NOT deploy-ready yet. |
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

Physical dedicated-user mapping source remains pending READ-ONLY App53 audit for Natta + Vassana. No App53 write/schema change is authorized.

## 4. Password Reset Authority — Accepted Runtime State

```text
APP800_CREATOR_CODE                   = admin-form
APP801_CREATOR_CODE                   = admin-form
ADMIN_FORM_RESET_NATIVE_AUTHORITY     = READY
HR_ADMIN_GROUP                        = MBO HR Administrators / code HR_ADMIN_GROUP
HR_RESET_NATIVE_AUTHORITY             = READY
PASSWORD_RESET_NATIVE_AUTHORITY_READY = true
```

Least privilege remains:
- App800 HR_ADMIN_GROUP: View only.
- App801 HR_ADMIN_GROUP: View + Edit; no Add/Delete/Manage/Import/Export.
- everyone denied.

Reset MBO Password means App801 MBO credential reset only, never native Kintone/cybozu password reset.

## 5. Existing Reset Core — Accepted / Reuse

Canonical owner: `src/ui/mbo-kintone-auth-adapter.js`

Canonical Employee_Code contract:
```text
^[A-Za-z0-9_.-]+$
leading/trailing whitespace = INVALID
```

`MboKintoneAuthAdapter.resetMboPassword({ employeeCode })` remains accepted and must not be duplicated or modified by the current corrective unless a separately proven core defect exists.

## 6. App800 Reset UI R1 Corrective — Independent Review Round 2

Executor corrective commit reviewed:
`4f1dfe717597b4cbd5bfb390e1461f2e83893441`

Starting Control Plane HEAD:
`c5800f1448999e422a6b843f653ddcae112b1455`

Independent classification:

```text
D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_CORRECTIVE_REVIEW = CORRECTIVE_ROUND_2
DEPLOY_READY = NO
ACTIVE_LIVE_AUTH = NONE
```

### Accepted from this corrective

The original three findings are materially improved:
- `src/ui/hr-control-center.js` now statically imports the canonical `MboKintoneAuthAdapter`.
- the canonical adapter implementation is present in `dist/hr-control-center-bundle.js`.
- invalid characters are prevalidated before resetFn.
- stale `GET-Only` / `SECURE READ-ONLY MVP` wording was removed from the candidate UI/source.

These improvements are retained; do not reimplement them.

### Finding D — Out-of-scope deploy helper modification creates a future dangling-adapter risk (BLOCKER)

The corrective commit modified:
`scripts/kintone/deploy-delivery-sprint02.js`

This file was not in the authorized corrective Allowed Files. The change strips ES-module imports from `hr-control-center.js` before wrapping the source as a classic bundle:

```js
code = code.replace(/import\s+[\s\S]*?from\s+['"].*?['"];?/g, '');
```

With the new canonical static import, stripping the import removes the adapter dependency declaration but does not include the adapter implementation. If this legacy helper is used to build/deploy the new HRCC source, it can recreate the same unresolved `MboKintoneAuthAdapter` problem the corrective was meant to remove.

Required next action:
1. restore this deploy helper to its pre-corrective state first;
2. do not silently patch deployment tooling inside the Reset UI source WP;
3. run the full suite after restoring it;
4. if a legacy deployment/bundle test now fails solely because the HRCC source is a real module with imports, STOP and report the exact compatibility failure. Control Plane will then open a separate narrow deployment-tool compatibility task instead of mixing it into Reset UI source acceptance.

No deploy execution is authorized.

### Finding E — Leading/trailing whitespace is still silently normalized (MUST FIX)

Current UI reads:

```js
const empCode = input.value.trim();
const empConfirm = confirm.value.trim();
```

Therefore values such as `" EMP001 "` become `"EMP001"` and can pass UI validation, while the canonical adapter explicitly rejects a code whose original value is not equal to `trim()`.

Required:
- preserve raw identity value for validation;
- leading/trailing whitespace must show bilingual invalid Employee_Code feedback;
- zero resetFn/reset-core calls;
- do not silently rewrite identity.

### Finding F — Corrective evidence provenance is false/stale (MUST FIX)

Corrective evidence records the generated JS blob as:
`18c7b9455b3f62c340827cfc22f259275492e4fd`

Actual Git blob at reviewed commit for `dist/hr-control-center-bundle.js` is:
`6fc4909d01df6a604626c5284aa7fe86f0248031`

The evidence also repeats the earlier generated JS size despite the bundle now containing the full auth adapter. Evidence must be regenerated from the final corrective HEAD and must state the exact current artifact identities.

Executor evidence is not accepted until provenance matches Git.

## 7. Current Active Task

```text
ACTIVE_TASK                    = D1 APP800 PASSWORD RESET ADMIN UI SOURCE R1 CORRECTIVE ROUND 2
OWNER                          = ANTIGRAVITY
MODE                           = SOURCE / FOCUSED TEST / LOCAL BUILD ONLY
STARTING_HEAD                  = 4f1dfe717597b4cbd5bfb390e1461f2e83893441
LIVE_KINTONE_WRITE             = NO
PASSWORD_RESET_EXECUTION       = NO
CUSTOMIZATION_UPLOAD           = NO
DEPLOY                         = NO
ACL_WRITE                      = NO
HYBRID_IDENTITY_IMPLEMENTATION = NO
```

## 8. Authorization Ledger / Safety

```text
LATEST_DEPLOY_AUTH        = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01 — CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH          = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH        = NONE
ACTIVE_ACL_WRITE_AUTH     = NONE
ROLLBACK_AUTH             = NONE
```

No App800/App801/App794/App53 record write, App53 schema change, App795 route write, customization upload, deploy, password reset execution, ACL write, Process update, or rollback is authorized.

## 9. Next Gate

```text
CURRENT_GATE  = APP800 RESET UI R1 CORRECTIVE ROUND 2
NEXT_OWNER    = ANTIGRAVITY FOR EXACT CORRECTIVE TASK
EXPECTED_NEXT = CHATGPT INDEPENDENT REVIEW
```

After Reset UI source acceptance, next planned Control Plane task remains:
`D1 HYBRID IDENTITY MAPPING & DUAL-ROLE READ-ONLY AUDIT R1` for Natta + Vassana.
