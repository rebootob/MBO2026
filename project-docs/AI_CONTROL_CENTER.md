# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual local/runtime execution is required
> Updated: 2026-08-30 — APP800 DEPLOYMENT TOOL COMPATIBILITY R1 = PASS / HYBRID IDENTITY READ-ONLY AUDIT OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 remains accepted known-good. Hybrid Identity + Dual-Role architecture is confirmed. App800 Reset MBO Password UI source and deployment-tool compatibility are independently accepted. No App800 deployment has occurred. Next gate is Hybrid Identity Mapping & Dual-Role READ-ONLY Audit R1 for Natta + Vassana. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; Reset UI source/tooling accepted, deployed App800 remains prior MVP until separately authorized deployment. |
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
My MBO ownership   = bound Employee_Code
Approver identity  = current dedicated Kintone User
Approval Tasks     = records whose authoritative current native Workflow assignee is that Kintone User
SELF_APPROVAL_ROUTE_CONFLICT -> FAIL CLOSED
```

Physical dedicated-user mapping source remains pending READ-ONLY App53 audit for Natta + Vassana. App53 is protected; no schema or record write is authorized.

## 4. Password Reset Authority / Accepted App800 ACL

```text
APP800_CREATOR_CODE                   = admin-form
APP801_CREATOR_CODE                   = admin-form
ADMIN_FORM_RESET_NATIVE_AUTHORITY     = READY
HR_ADMIN_GROUP                        = MBO HR Administrators / code HR_ADMIN_GROUP
HR_RESET_NATIVE_AUTHORITY             = READY
PASSWORD_RESET_NATIVE_AUTHORITY_READY = true
```

Accepted App800 App ACL exact shape:
- `CREATOR`: full technical admin rights;
- `HR_ADMIN_GROUP`: View only; Add/Edit/Delete/Manage/Import/Export NO;
- `everyone`: explicit denied row, all rights NO;
- no extra App ACL principal.

Reset MBO Password means App801 MBO credential reset only, never native Kintone/cybozu password reset.

## 5. App800 Reset MBO Password UI SOURCE R1 — PASS

Accepted source commit:
`a7a9f02aff6b497f3f8e0009dd377437a3701416`

Accepted artifacts:
```text
APP800_CANDIDATE_JS_BLOB  = 9f393dfcddcf1c3ee265fdf42520d7bb5c3ae6be
APP800_CANDIDATE_CSS_BLOB = c1d32deffd9e6c164a4fd80adf20526b543ccbd7
```

Accepted behavior includes exact Employee_Code + exact confirmation, fail-closed validation, canonical reset core reuse, in-flight duplicate protection, safe success/failure copy, no secret rendering, and no native Kintone password reset.

## 6. App800 Deployment Tool Compatibility R1 — PASS

Accepted implementation commit:
`14b911d9cde8b59b6c15e6b05bc8fccfbb6727fd`

Final test/evidence closure commit:
`9b0377dd56b1a7b74f60dc748babd7d00f8d5fdd`

Accepted evidence:
`project-docs/D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1_CORRECTIVE_R2_EVIDENCE.md`

Independent result:

```text
D1_APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1 = PASS
TOOLING_ACCEPTED                            = YES
DEPLOY_CANDIDATE_READY_FOR_AUTH_GATE        = YES
LIVE_DEPLOYED                               = NO
ACTIVE_DEPLOY_AUTH                          = NONE
```

Accepted tooling behavior:
- `executeDeploy()` consumes canonical `dist/hr-control-center-bundle.js` and CSS only;
- no raw-source regex/string bundle synthesis in deploy path;
- canonical artifact loader validates existence, non-empty JS/CSS, classic-script parse, no import/export residue, `MboKintoneAuthAdapter`, and `resetMboPassword`;
- compatibility helper cannot substitute arbitrary caller JS for canonical dist;
- App800 ACL post-readback validator requires exact CREATOR + HR_ADMIN_GROUP + everyone shape and explicit booleans;
- CREATOR full authority, HR View-only, everyone denied;
- missing/malformed/extra/duplicate ACL principals fail closed;
- accepted real Kintone `GROUP / code=everyone` representation is explicitly tested;
- no ACL write is performed by the validation path.

Final R2 evidence confirms:
- source changes = 0;
- explicit security Cases A/B/C/D PASS;
- Sprint02/tooling suite 33/33 PASS;
- Reset UI suite 15/15 PASS;
- full repository suite 988/988 PASS;
- `git diff --check` PASS;
- Live GET/POST/PUT/DELETE, upload, deploy, ACL write, real reset = 0.

App800 deployment remains a separate exact user-authorization gate. Do not deploy automatically.

## 7. Current Active Task

```text
ACTIVE_TASK                    = D1 HYBRID IDENTITY MAPPING & DUAL-ROLE READ-ONLY AUDIT R1
OWNER                          = CHATGPT CONTROL PLANE / USER-ASSISTED READ-ONLY KINTONE EVIDENCE
MODE                           = READ-ONLY DISCOVERY / NO SOURCE CHANGE / NO KINTONE WRITE
TARGET_EXAMPLES                = NATTA + VASSANA
APP53_WRITE                    = NO
APP53_SCHEMA_CHANGE            = NO
APP795_WRITE                   = NO
APP794_WRITE                   = NO
DEPLOY                         = NO
ACL_WRITE                      = NO
PASSWORD_RESET_EXECUTION       = NO
```

## 8. Hybrid Identity Audit Questions to Prove Before Implementation

For Natta and Vassana, prove with authoritative read-only evidence:
1. exact active App53 employee row and Employee_Code;
2. Position, Department, Section, Team, and `Number_0 = 1` active status;
3. whether App53 already has a Kintone-user/login-code/user-select field suitable for exact dedicated-user mapping;
4. exact Kintone User Code for each person from authoritative Kintone source;
5. exact one-to-one mapping or explicit missing/ambiguous result;
6. App795 routes where that Kintone user is an Approver;
7. each person's own route derived from their own App53 context, not from their approver role;
8. current App794/native Process assignment semantics required for `My Approval Tasks`;
9. current App794 App/Record/Field ACL implications for dedicated approver access;
10. whether any self-approval collision exists or can be proven fail-closed.

Do not invent a new App53 field. If no suitable mapping field exists, record that fact and stop before any schema design/write authorization.

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

## 10. Next Gate

```text
CURRENT_GATE  = D1 HYBRID IDENTITY MAPPING & DUAL-ROLE READ-ONLY AUDIT R1
NEXT_OWNER    = CHATGPT CONTROL PLANE
EXPECTED_NEXT = PREPARE/EXECUTE READ-ONLY EVIDENCE COLLECTION FOR NATTA + VASSANA
```

After audit evidence is reviewed, Control Plane may open a narrow Hybrid Identity source implementation WP. No implementation starts from assumptions.
