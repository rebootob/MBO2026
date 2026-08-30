# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-30 — HYBRID CORE SOURCE R1 CORRECTIVE R1 REVIEWED / R2 OPEN / APP53 PRODUCTION READ-ONLY

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 accepted. Hybrid Identity + Dual-Role architecture confirmed. App800 Reset UI source/tooling accepted. Natta/Vassana read-only audit completed. User-approved mapping/self-approval/native-access design is confirmed. Hybrid Identity Core Source R1 Corrective R1 commit `5cc5ea6...` fixes the major strict-mapping / dedicated-mode / slot-preserving defects, but remains **CORRECTIVE R2** due one SHARED requester compatibility regression and missing mandatory generic 3/4-slot regression proof. App53 is Production and READ-ONLY by default. |
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

## 6. App53 Production Protection — CONFIRMED / MANDATORY

User reconfirmed that App53 Employee Namelist is **Production** and must be handled with special caution.

Canonical detailed rule:
`project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`

```text
APP53_ENVIRONMENT                 = PRODUCTION
APP53_DEFAULT_MODE                = READ_ONLY
APP53_SCHEMA_WRITE_AUTH           = NONE
APP53_RECORD_WRITE_AUTH           = NONE
APP53_BULK_WRITE_AUTH             = NONE
```

Any future App53 schema/record write requires a new exact one-shot authorization plus fresh pre-write evidence, reviewed recovery/backup material, exact payload, impact/rollback plan, and immediate post-write readback. Design/source/deploy approval for another resource never implies App53 write permission.

Adding `MBO_Kintone_User`, populating dedicated mappings, and correcting Natta `emp_text` are separate protected concerns; they must not be silently bundled.

## 7. User-Approved Hybrid Blocker Resolution — CONFIRMED

Canonical detailed Baseline:
`project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`

### 7.1 Physical mapping design

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
```

### 7.2 Own-MBO self-appraiser exception

```text
OWN_MBO_SELF_APPROVER_ELISION = APPROVED
```

Natta canonical example:
```text
Master TMG1|Marketing route = natta -> uchida / M1_G1
Natta own effective route   = uchida / M1_ONLY
Other TMG1/TMG2 Marketing   = natta -> uchida unchanged
```

No auto-approval, fabricated event, or App795 source rewrite is permitted.

### 7.3 Dedicated App794 native access design

Dedicated principals remain separate from shared `MBO_EMPLOYEE_ACCESS`.

Approved future group design:
```text
MBO_DEDICATED_ACCESS
```

Target native model remains status-aware App794 Record Permissions using current user fields (`Requester_User`, `First_Manager_User`, `Manager_User`, `GM_User`). Exact group/App ACL/Record ACL payload remains a later separately authorized gate.

## 8. Hybrid Identity Core Source R1 Review History

### 8.1 Initial executor commit — CORRECTIVE

Executor commit:
`20747ef3781d5085e9718f511bd76cf667879399`

Independent findings:
- canonical mapping resolver had noncanonical fallbacks/default-active behavior;
- requester mode/input was not strict enough;
- self-appraiser elision flattened users instead of preserving approval slots/rules.

Result:
```text
D1_HYBRID_IDENTITY_CORE_SOURCE_R1 = CORRECTIVE
APP53_PRODUCTION_TOUCHED           = NO
```

### 8.2 Corrective R1 executor commit — CORRECTIVE R2

Executor commit:
`5cc5ea609a4a4c5d2d218866feb0867e573973c0`

Scope from Control Plane base `63fb883...` is exactly:
- `src/services/mbo-identity-service.js`;
- `src/services/routing-service.js`;
- `tests/d1-hybrid-identity-core-source.test.js`;
- new Corrective R1 evidence.

No App53 schema/record/config, UI, build, dist, ACL/group or deployment file changed. Evidence reports focused 24/24 PASS, full suite 1012/1012 PASS, `git diff --check` PASS, Live GET/POST/PUT/DELETE = 0 and `APP53_PRODUCTION_TOUCHED = NO`.

Accepted improvements from source inspection:
- strict canonical App53 resolver now requires `Number_0=1`, exact `MBO_Kintone_User[].code`, canonical `emp_text`, and no pseudo-field fallback;
- DEDICATED requester mode is exact and rejects whitespace/unknown modes;
- Natta blank `emp_text` remains fail closed;
- self-appraiser transformation now preserves approval slots, multi-user slot membership and approval rules.

Remaining Finding D — SHARED requester regression:
- pre-corrective accepted SHARED requester comparison normalized case;
- Corrective R1 changed SHARED comparison to trim-only/case-sensitive;
- prior authorizing task required SHARED behavior to remain unchanged.

Remaining Finding E — required proof gap:
- authorizing task explicitly required generic 3-slot and 4-slot topology regression coverage;
- committed focused test suite contains no explicit generic 3/4-slot transformation tests.

Independent current result:

```text
D1_HYBRID_IDENTITY_CORE_SOURCE_R1 = CORRECTIVE R2
SOURCE_ACCEPTED                    = NO
MAJOR_FINDINGS_A_B_C               = CORRECTED
REMAINING_SOURCE_DEFECT            = SHARED_REQUESTER_COMPATIBILITY
REMAINING_TEST_GAP                 = GENERIC_3_4_SLOT_REGRESSION
LIVE_DEPLOY_READY                  = NO
APP53_PRODUCTION_TOUCHED           = NO
```

The isolated legacy `resolveEmployeeIdentity()` compatibility fallback is not accepted as the future dedicated runtime binding API. Future Hybrid integration must use the strict canonical dedicated resolver unless a separately reviewed migration removes/reconciles that legacy helper.

## 9. Current Active Task

```text
ACTIVE_TASK = D1 HYBRID IDENTITY CORE SOURCE R1 CORRECTIVE R2
OWNER       = ANTIGRAVITY
MODE        = SOURCE / FOCUSED TEST ONLY
APP53_MODE  = PRODUCTION READ_ONLY
LIVE_ACCESS = NO
DEPLOY      = NO
```

Corrective R2 scope is intentionally narrow:
- `src/services/routing-service.js` only for SHARED requester compatibility restoration;
- `tests/d1-hybrid-identity-core-source.test.js` for SHARED regression + explicit generic 3/4-slot tests;
- new Corrective R2 evidence.

`src/services/mbo-identity-service.js` is read-only in this R2.

Maximum executor status:
```text
D1_HYBRID_IDENTITY_CORE_SOURCE_R1_CORRECTIVE_R2_READY_PENDING_CHATGPT_REVIEW
```

## 10. Authorization Ledger / Safety

```text
LATEST_DEPLOY_AUTH        = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01 — CONSUMED / CLOSED / NEVER REUSE
ACTIVE_LIVE_AUTH          = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH        = NONE
ACTIVE_ACL_WRITE_AUTH     = NONE
ACTIVE_GROUP_WRITE_AUTH   = NONE
APP53_SCHEMA_WRITE_AUTH   = NONE
APP53_RECORD_WRITE_AUTH   = NONE
APP53_BULK_WRITE_AUTH     = NONE
ROLLBACK_AUTH             = NONE
```

No App800/App801/App794/App53 record write, App53 schema/bulk change, group creation/membership write, App795 route write, customization upload, deployment, password reset execution, ACL write, Process update, or rollback is authorized.

## 11. Next Gate

```text
CURRENT_GATE  = D1 HYBRID IDENTITY CORE SOURCE R1 CORRECTIVE R2
CURRENT_OWNER = ANTIGRAVITY
NEXT_REVIEWER = CHATGPT
```

Protected Kintone configuration is not the next automatic step. It remains a separate future authorization gate even after source acceptance.
