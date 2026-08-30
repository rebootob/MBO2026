# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual local/runtime execution is required
> Updated: 2026-08-30 — APP800 RESET UI SOURCE R1 PASS / DEPLOY-TOOL COMPATIBILITY GATE OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 remains accepted known-good. Hybrid Identity + Dual-Role architecture is confirmed. HR/admin native Reset MBO Password authority is READY. App800 Reset MBO Password UI **SOURCE R1 is independently accepted** at commit `a7a9f02aff6b497f3f8e0009dd377437a3701416`. Deployment tooling is not yet compatible with the module-based App800 candidate and current HR ACL, so no App800 deploy is ready. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; Reset UI source accepted, deployment compatibility still open, deployed App800 remains prior MVP. |
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

Accepted least privilege:
- App800 `HR_ADMIN_GROUP`: View only.
- App801 `HR_ADMIN_GROUP`: View + Edit; no Add/Delete/Manage/Import/Export.
- `everyone`: denied.

Reset MBO Password means App801 MBO credential reset only, never native Kintone/cybozu password reset.

## 5. Existing Reset Core — Accepted / Reuse

Canonical owner: `src/ui/mbo-kintone-auth-adapter.js`

Canonical Employee_Code contract:
```text
^[A-Za-z0-9_.-]+$
leading/trailing whitespace = INVALID
```

`MboKintoneAuthAdapter.resetMboPassword({ employeeCode })` remains accepted and is reused by App800 Reset UI.

## 6. App800 Reset MBO Password UI SOURCE R1 — PASS

Accepted executor commit:
`a7a9f02aff6b497f3f8e0009dd377437a3701416`

Accepted evidence:
`project-docs/D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_CORRECTIVE_R2_EVIDENCE.md`

Independent result:

```text
D1_APP800_PASSWORD_RESET_UI_SOURCE_R1 = PASS
SOURCE_ACCEPTED                        = YES
DEPLOY_READY                           = NO
LIVE_DEPLOYED                          = NO
```

Accepted source behavior:
- dedicated App800 Reset MBO Password panel;
- exact Employee_Code + exact confirmation required;
- empty, malformed, leading/trailing whitespace, or mismatch fails closed before reset core;
- one reset call per valid user action; in-flight duplicate clicks blocked;
- production default path uses canonical imported/bundled `MboKintoneAuthAdapter`;
- mocked production-path test reaches exactly one App801 update and no write to Apps 800/794/795/53;
- bilingual success/failure feedback;
- explicit statement that native Kintone/cybozu password is not reset;
- password/hash/salt/session/token secrets are not rendered;
- stale read-only labeling removed;
- canonical generated bundle includes adapter implementation.

Accepted final candidate artifact identities:

```text
APP800_RESET_UI_SOURCE_COMMIT = a7a9f02aff6b497f3f8e0009dd377437a3701416
APP800_CANDIDATE_JS_BLOB      = 9f393dfcddcf1c3ee265fdf42520d7bb5c3ae6be
APP800_CANDIDATE_CSS_BLOB     = c1d32deffd9e6c164a4fd80adf20526b543ccbd7
```

Round-2 focused suite reported 15/15 PASS and `git diff --check` PASS. Full repository suite reported 979/981 because exactly two legacy Sprint-02 bundle-generator tests are incompatible with the newly module-based HRCC source. This conditional failure was explicitly anticipated by the authorizing Active Task: executor restored the legacy deploy helper and stopped instead of widening scope.

## 7. Deployment Tool Compatibility — CURRENT BLOCKER

Legacy file:
`scripts/kintone/deploy-delivery-sprint02.js`

It was correctly restored to the pre-corrective blob:

```text
DEPLOY_HELPER_RESTORED_BLOB = 27aceb53b52640aebbdbeec78387c3718a05b4b3
```

However it is now obsolete for the accepted App800 candidate for two independent reasons:

### A. Raw-string bundle path cannot handle real module dependency

The helper reads raw `src/ui/hr-control-center.js` and performs string-based export removal/wrapping. The accepted source now has a real static import of `MboKintoneAuthAdapter`; the legacy helper therefore cannot produce the canonical bundle. Deployment must use the reproducible canonical App800 artifact path, not ad-hoc regex/string bundling.

### B. Legacy post-deploy ACL assertion is stale

The helper calls:
`assertCreatorOnlyAcl(...)`

That is no longer the accepted App800 security state. Current App800 intentionally contains:
- `CREATOR` technical admin authority;
- `HR_ADMIN_GROUP` View only;
- `everyone` denied.

Deployment tooling must verify this accepted least-privilege ACL **without changing it**. It must not require creator-only and must not write ACL as part of customization deployment.

No deployment is authorized while this compatibility gap remains.

## 8. Current Active Task

```text
ACTIVE_TASK                    = D1 APP800 DEPLOYMENT TOOL COMPATIBILITY R1
OWNER                          = ANTIGRAVITY
MODE                           = SOURCE / TEST / LOCAL ARTIFACT VALIDATION ONLY
STARTING_IMPLEMENTATION_HEAD   = a7a9f02aff6b497f3f8e0009dd377437a3701416
LIVE_KINTONE_WRITE             = NO
PASSWORD_RESET_EXECUTION       = NO
CUSTOMIZATION_UPLOAD           = NO
DEPLOY                         = NO
ACL_WRITE                      = NO
HYBRID_IDENTITY_IMPLEMENTATION = NO
```

## 9. Authorization Ledger / Safety

```text
LATEST_DEPLOY_AUTH        = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01 — CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH          = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH        = NONE
ACTIVE_ACL_WRITE_AUTH     = NONE
ROLLBACK_AUTH             = NONE
```

No App800/App801/App794/App53 record write, App53 schema change, App795 route write, customization upload, deployment, password reset execution, ACL write, Process update, or rollback is authorized.

## 10. Next Gates

```text
CURRENT_GATE  = APP800 DEPLOYMENT TOOL COMPATIBILITY R1
NEXT_OWNER    = ANTIGRAVITY FOR EXACT SOURCE/TEST TOOLING TASK
EXPECTED_NEXT = CHATGPT INDEPENDENT REVIEW
```

After deployment-tool compatibility passes, Control Plane may choose between:
1. a separately authorized App800 candidate deployment gate; or
2. the already planned `D1 HYBRID IDENTITY MAPPING & DUAL-ROLE READ-ONLY AUDIT R1` for Natta + Vassana.

Neither starts automatically.
