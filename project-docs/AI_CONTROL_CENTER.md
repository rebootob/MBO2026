# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual local/runtime execution is required
> Updated: 2026-08-30 — APP800 DEPLOYMENT TOOL COMPATIBILITY R1 REVIEW = CORRECTIVE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 remains accepted known-good. Hybrid Identity + Dual-Role architecture is confirmed. HR/admin native Reset MBO Password authority is READY. App800 Reset MBO Password UI SOURCE R1 remains accepted at `a7a9f02aff6b497f3f8e0009dd377437a3701416`. Deployment-tool compatibility candidate exists at `cf0ae9d7d812ce7f855714434a1d56ca2d3042fc`, but independent review found ACL fail-open gaps and a non-canonical compatibility fallback; corrective is active. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; Reset UI source accepted; deployment tooling not yet accepted; deployed App800 remains prior MVP. |
| D5 | 🟠 Copy own previous MBO IN PROGRESS / future focused task |
| D6 | 🔴 Integrated E2E / Security / Regression pending; must include shared-login + dedicated-login + dual-role separation |
| D7 | ✅ Admin Support Center source functionality CLOSED; reopen only on proven defect. |

## 2. Accepted App794 Baseline

```text
LIVE_REVISION                 = 60
PREVIEW_REVISION              = 60
ACCEPTED_SOURCE_COMMIT        = 1ed342ad137a4a364496a28d29bdffd24a99b511
ACCEPTED_JS_IDENTITY          = 115a08ace32bdf850cb5eebf25b953d1803114d0
ACCEPTED_CSS_IDENTITY         = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
REV60_USER_UAT                = PASS
```

## 3. Confirmed Hybrid Identity / Dual Role

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
DUAL_ROLE_EMPLOYEE_APPROVER = CONFIRMED
```

Dedicated Kintone users auto-bind to an exact authoritative Employee_Code and do not perform a secondary MBO Employee_Code/password login. Shared Kintone principals continue to use Employee_Code + App801 MBO password. My MBO ownership is by bound Employee_Code; Approver identity is current dedicated Kintone User against authoritative native Workflow assignee; self-approval fails closed.

Physical dedicated-user mapping source remains pending READ-ONLY App53 audit for Natta + Vassana. No App53 write/schema change is authorized.

## 4. Password Reset Authority / Accepted ACL

```text
APP800_CREATOR_CODE                   = admin-form
APP801_CREATOR_CODE                   = admin-form
ADMIN_FORM_RESET_NATIVE_AUTHORITY     = READY
HR_ADMIN_GROUP                        = MBO HR Administrators / code HR_ADMIN_GROUP
HR_RESET_NATIVE_AUTHORITY             = READY
PASSWORD_RESET_NATIVE_AUTHORITY_READY = true
```

Accepted App800 ACL shape is exact least privilege:
- `CREATOR`: technical admin authority preserved/full;
- `HR_ADMIN_GROUP`: View only; Add/Edit/Delete/Manage/Import/Export all NO;
- `everyone`: all rights NO;
- no unapproved extra ACL principal may silently gain access.

Reset MBO Password means App801 MBO credential reset only, never native Kintone/cybozu password reset.

## 5. App800 Reset UI SOURCE R1 — ACCEPTED

Accepted source commit:
`a7a9f02aff6b497f3f8e0009dd377437a3701416`

Accepted artifacts:
```text
APP800_CANDIDATE_JS_BLOB  = 9f393dfcddcf1c3ee265fdf42520d7bb5c3ae6be
APP800_CANDIDATE_CSS_BLOB = c1d32deffd9e6c164a4fd80adf20526b543ccbd7
```

Source acceptance remains valid. No deploy is authorized.

## 6. App800 Deployment Tool Compatibility R1 — Independent Review

Executor commit reviewed:
`cf0ae9d7d812ce7f855714434a1d56ca2d3042fc`

Evidence:
`project-docs/D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_EVIDENCE.md`

Executor reported:
- focused Sprint02/tooling suite 30/30 PASS;
- Reset UI focused suite 15/15 PASS;
- full repository suite 985/985 PASS;
- `git diff --check` PASS;
- zero Live Kintone operations.

Accepted improvements from this candidate:
- `executeDeploy()` now consumes canonical `dist/hr-control-center-bundle.js` and `dist/hr-control-center.css` rather than synthesizing a bundle from raw source;
- canonical artifact validator checks existence, non-empty JS/CSS, classic-script parse, no import/export residue, and adapter/reset implementation presence;
- stale `assertCreatorOnlyAcl(...)` is replaced in the App800 path by a dedicated least-privilege ACL validator;
- no ACL write is added.

Independent classification:

```text
D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_REVIEW = CORRECTIVE
DEPLOY_READY = NO
ACTIVE_LIVE_AUTH = NONE
```

### Finding G — CREATOR authority validation is fail-open

Current `assertApp800LeastPrivilegeAcl()` only verifies that a CREATOR/admin-form-like entry exists. A CREATOR row with missing or false technical rights would still pass, which does not prove the accepted technical recovery authority is preserved.

Required corrective:
- require the canonical CREATOR entry (`entity.type === 'CREATOR'`);
- require explicit boolean values for all relevant App ACL rights;
- require CREATOR full rights exactly: appEditable, recordViewable, recordAddable, recordEditable, recordDeletable, recordImportable, recordExportable = true;
- malformed/missing booleans fail closed.

### Finding H — `everyone` missing can pass

Current validator checks `everyone` only if the row exists. The accepted ACL requires an explicit everyone-denied row.

Required corrective:
- require an `everyone` entry by exact accepted identity/code;
- require all relevant rights explicitly `false`;
- missing/malformed/undefined rights fail closed.

### Finding I — Unexpected principals are ignored

Current validator validates CREATOR, HR_ADMIN_GROUP, and optionally everyone, but does not reject extra USER/GROUP/ORGANIZATION principals. An unexpected principal with privileges could therefore coexist and the validator would still PASS.

Required corrective:
- validate exact principal set for App800 candidate ACL: CREATOR + HR_ADMIN_GROUP + everyone only;
- any unexpected ACL principal fails closed;
- duplicate expected principals also fail closed.

### Finding J — Compatibility helper can bypass canonical artifact rule

`buildClassicHrccBundle(sourceText, ...)` is labeled deprecated but returns caller-supplied text directly when it appears already bundled. That allows a non-canonical/stale arbitrary bundle to bypass `validateHrccBundleArtifacts()`.

Required corrective:
- remove the helper if no longer needed, or make it a canonical-only compatibility loader that always delegates to `validateHrccBundleArtifacts()` and returns the canonical dist JS;
- caller-supplied source/bundle text must never become a deploy candidate;
- do not reintroduce regex/string bundling.

## 7. Current Active Task

```text
ACTIVE_TASK                    = D1 APP800 DEPLOYMENT TOOL COMPATIBILITY R1 CORRECTIVE
OWNER                          = ANTIGRAVITY
MODE                           = SOURCE / TEST / LOCAL ARTIFACT VALIDATION ONLY
STARTING_IMPLEMENTATION_HEAD   = cf0ae9d7d812ce7f855714434a1d56ca2d3042fc
LIVE_KINTONE_WRITE             = NO
CUSTOMIZATION_UPLOAD           = NO
DEPLOY                         = NO
ACL_WRITE                      = NO
PASSWORD_RESET_EXECUTION       = NO
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

No App800/App801/App794/App53 record write, App53 schema change, App795 route write, customization upload, deployment, password reset execution, ACL write, Process update, or rollback is authorized.

## 9. Next Gate

```text
CURRENT_GATE  = APP800 DEPLOYMENT TOOL COMPATIBILITY R1 CORRECTIVE
NEXT_OWNER    = ANTIGRAVITY FOR EXACT CORRECTIVE TASK
EXPECTED_NEXT = CHATGPT INDEPENDENT REVIEW
```

After tooling acceptance, Control Plane will choose the next smallest safe action; deployment still requires a separate exact user authorization, and Hybrid Identity audit does not start automatically.
