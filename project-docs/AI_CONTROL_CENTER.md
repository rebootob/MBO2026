# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-30 — HYBRID BLOCKERS BUSINESS-DESIGN RESOLVED / CORE SOURCE R1 OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 accepted. Hybrid Identity + Dual-Role architecture confirmed. App800 Reset UI source/tooling accepted. Natta/Vassana read-only audit completed. User approved physical mapping design, own-MBO self-appraiser exception, and dedicated native-access design. Current gate = Hybrid Identity Core Source R1; protected Kintone writes remain unauthorized. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; Reset UI source/tooling accepted; deployed App800 remains prior MVP until separately authorized deployment. |
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

No current App794 deployment/write authorization exists.

## 3. Confirmed Hybrid Identity / Dual Role

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
DUAL_ROLE_EMPLOYEE_APPROVER = CONFIRMED
```

Dedicated path target:
```text
native Kintone login
-> exact App53 MBO_Kintone_User mapping
-> exactly one active row / Number_0 = 1
-> valid canonical emp_text Employee_Code
-> Employee-Self auto-bind
-> no secondary MBO Employee_Code/password login
```

Shared path remains:
```text
approved shared principal
-> App794 MBO Login
-> Employee_Code + App801 MBO password
-> App801-backed same-tab session
-> Employee-Self scope
```

Dual-role separation:
```text
My MBO ownership  = bound Employee_Code
Approver identity = current dedicated Kintone User
Approval Tasks    = authoritative current native Workflow assignee == current dedicated Kintone User
```

Static App795 membership, UI visibility, or caller-supplied role strings are not Approver authorization.

## 4. App800 Reset UI / Tooling — Accepted, Not Deployed

```text
APP800_RESET_UI_SOURCE_COMMIT            = a7a9f02aff6b497f3f8e0009dd377437a3701416
APP800_DEPLOY_TOOL_IMPLEMENTATION_COMMIT = 14b911d9cde8b59b6c15e6b05bc8fccfbb6727fd
APP800_DEPLOY_TOOL_TEST_EVIDENCE_COMMIT  = 9b0377dd56b1a7b74f60dc748babd7d00f8d5fdd
APP800_RESET_UI_SOURCE                   = PASS
APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1  = PASS
LIVE_DEPLOYED                            = NO
ACTIVE_DEPLOY_AUTH                       = NONE
```

Accepted candidate artifacts:
```text
APP800_CANDIDATE_JS_BLOB  = 9f393dfcddcf1c3ee265fdf42520d7bb5c3ae6be
APP800_CANDIDATE_CSS_BLOB = c1d32deffd9e6c164a4fd80adf20526b543ccbd7
```

Reset MBO Password means App801 MBO credential reset only, never native Kintone/cybozu password reset.

## 5. Hybrid Identity Read-Only Audit — COMPLETE

Evidence:
`project-docs/D1_HYBRID_IDENTITY_MAPPING_DUAL_ROLE_AUDIT_R1_EVIDENCE.md`

Safety:
```text
R1 GET=10 / POST=0 / PUT=0 / DELETE=0
R2 GET=8  / POST=0 / PUT=0 / DELETE=0
```

### 5.1 App53 schema facts

R2 proved:
```text
Drop_down   = Section
Drop_down_0 = Departmant
Drop_down_1 = Section Name
Drop_down_2 = Team
emp_text    = Employee ID / canonical Employee_Code
Number      = Code
Number_0    = employee Active Status
Text_2      = Position
Text_4      = Email
Text_6      = Vendor Account Number
```

At audit time App53 had no USER_SELECT field and no authoritative Kintone login mapping field.

### 5.2 Natta

```text
Kintone User Code = natta / valid
App53 Record ID   = 578
Name              = Ms.Natta Niphatthakosolsuk
Position          = Manager
Department        = Mold & Engineering
Section           = TMG1
Section Name      = Die Casting
Team              = Marketing
Number_0          = 1 / Active
emp_text           = BLANK
Number             = 243
```

App795:
```text
TMG1|Marketing -> natta -> uchida
TMG2|Marketing -> natta -> uchida
```

The real canonical Natta Employee_Code is still **NOT PROVEN**. Never substitute `Number=243`, Vendor Account Number, email, name, or guessed padding.

### 5.3 Vassana

```text
Kintone User Code = vassana / valid
App53 Record ID   = 456
Name              = Ms.Vassana Maenthong
Position          = Deputy General Manager
Department        = Industrial Services
Section           = TMF3
Section Name      = Sales Engineering
Team              = blank
Number_0          = 1 / Active
emp_text           = 0044
Number             = 44
```

Current own route uses executive Position precedence:
```text
POSITION_DGM -> tsuchihira
```

Vassana remains Manager L1 for TMF1/TMF2/TMF3 on other employees' records.

### 5.4 Current App794 native access

Current App794 App ACL remains:
```text
CREATOR             = full
MBO_EMPLOYEE_ACCESS = View/Add/Edit
Everyone            = denied
Record ACL           = empty
Field ACL            = empty
```

Current `MBO_EMPLOYEE_ACCESS` membership:
```text
t1,t2,s1,f1,f2,f3,e1,tmh,g_request
```

`natta` and `vassana` are not members; therefore current native dedicated access is not yet granted.

## 6. User-Approved Hybrid Blocker Resolution — CONFIRMED 2026-08-30

Canonical detailed Baseline:
`project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`

### 6.1 Physical mapping design

Approved future App53 field:
```text
Field Code = MBO_Kintone_User
Label      = MBO Kintone User
Type       = USER_SELECT
```

Binding requires exact current Kintone user -> exactly one active App53 mapping row -> valid canonical `emp_text`.

```text
DEDICATED_MAPPING_PHYSICAL_DESIGN = CONFIRMED
APP53_FIELD_LIVE_CREATED           = NO
APP53_SCHEMA_WRITE_AUTH            = NONE
APP53_MAPPING_DATA_WRITE_AUTH      = NONE
```

Natta remains fail-closed until a real canonical `emp_text` Employee_Code is verified and corrected under separate authorization.

### 6.2 Own-MBO self-appraiser exception

User approved:
```text
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

For own MBO only, after authoritative route resolution and before workflow snapshot:
- remove only self appraiser;
- preserve remaining appraiser order;
- shift/recalculate effective topology;
- never auto-approve;
- never fabricate event/history/timestamp/comment;
- never modify App795 subordinate route;
- no remaining non-self appraiser -> fail closed.

Natta canonical example:
```text
Master TMG1|Marketing route = natta -> uchida / M1_G1
Natta own effective route   = uchida / M1_ONLY
Other TMG1/TMG2 Marketing   = natta -> uchida unchanged
```

### 6.3 Dedicated native App794 access design

Dedicated principals stay separate from shared `MBO_EMPLOYEE_ACCESS`.

Approved dedicated group design:
```text
MBO_DEDICATED_ACCESS
```

Target App794 App ACL:
```text
View=YES / Add=YES / Edit=YES
Delete=NO / Import=NO / Export=NO / AppAdmin=NO
```

App-level grant must be constrained by status-aware native Record Permissions using existing App794 user fields where appropriate:
```text
Requester_User
First_Manager_User
Manager_User
GM_User
```

Target principle:
- own dedicated requester sees own MBO throughout lifecycle and edits only employee-controlled statuses;
- approver sees/edits only during the corresponding current review status;
- transition/reassignment removes stale approver access;
- static App795 membership is never sufficient;
- HR final remains HR-native;
- completed own MBO view-only;
- dedicated users do not receive App801 View/Edit merely for auto-bind.

Exact group/App ACL/Record ACL payload and any live write still require separate exact authorization.

## 7. Current Active Task

```text
ACTIVE_TASK = D1 HYBRID IDENTITY CORE SOURCE R1
OWNER       = ANTIGRAVITY
MODE        = SOURCE / FOCUSED TEST ONLY
LIVE_WRITE  = NO
DEPLOY      = NO
```

Task opened at Control Plane commit:
`889cdc33b23245b6aab7ea6e299e2d8f318cc247`

Primary source scope:
- `src/services/mbo-identity-service.js`
- `src/services/employee-service.js` only if canonical mapping lookup belongs there
- `src/services/routing-service.js`
- directly related focused tests; at most one new focused test file if needed
- new evidence `project-docs/D1_HYBRID_IDENTITY_CORE_SOURCE_R1_EVIDENCE.md`

Required R1 source behaviors:
1. canonical App53 `MBO_Kintone_User` + `Number_0` + `emp_text` resolver;
2. dedicated effective requester = exact dedicated Kintone User; shared requester behavior unchanged;
3. pure own-MBO self-appraiser elision/topology recalculation;
4. Natta blank `emp_text` remains fail-closed;
5. no main/UI/build/deploy/ACL/schema widening in this WP.

Maximum executor status:
```text
D1_HYBRID_IDENTITY_CORE_SOURCE_R1_READY_PENDING_CHATGPT_REVIEW
```

## 8. Authorization Ledger / Safety

```text
LATEST_DEPLOY_AUTH        = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01 — CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH          = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH        = NONE
ACTIVE_ACL_WRITE_AUTH     = NONE
ACTIVE_GROUP_WRITE_AUTH   = NONE
ROLLBACK_AUTH             = NONE
```

No App800/App801/App794/App53 record write, App53 schema change, group creation/membership write, App795 route write, customization upload, deployment, password reset execution, ACL write, Process update, or rollback is authorized.

## 9. Next Gates

```text
CURRENT_GATE  = D1 HYBRID IDENTITY CORE SOURCE R1
CURRENT_OWNER = ANTIGRAVITY
NEXT_REVIEWER = CHATGPT
```

If Core Source R1 passes independent review, protected Kintone configuration remains a **separate** future authorization gate:
- App53 `MBO_Kintone_User` schema write;
- reviewed mapping values;
- Natta real Employee_Code correction only after authoritative value is known;
- `MBO_DEDICATED_ACCESS` group/membership;
- exact App794 App/Record ACL payload;
- subsequent controlled deploy/UAT.

Do not combine those writes with Source R1.
