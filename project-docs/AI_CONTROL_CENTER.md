# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-30 — HYBRID RUNTIME INVENTORY COMPLETE / EMPLOYEE-SELF ENTRY R1 OPEN / APP53 PRODUCTION READ-ONLY

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev60 accepted. Hybrid Identity + Dual-Role architecture confirmed. Natta/Vassana read-only audit completed. Hybrid Identity Core Source R1 is **PASS** at `c20e406b9b289984e57ebf2c52c9223094bc5f5a`. Runtime source inventory is complete. Current implementation gate = Hybrid Employee-Self Runtime Entry R1. My Approval Tasks/current-native-assignee integration is intentionally deferred to a later proof + source WP. Protected App53/group/ACL/deploy work remains unauthorized. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS; Reset UI source/tooling accepted; deployed App800 remains prior MVP until separately authorized deployment. |
| D5 | 🟠 Copy own previous MBO IN PROGRESS / future focused task |
| D6 | 🔴 Integrated E2E / Security / Regression pending; must include shared-login + dedicated-login + dual-role separation |
| D7 | ✅ Admin Support Center source functionality CLOSED; reopen only on proven defect. |

## 2. Accepted App794 / Hybrid Core Baselines

```text
APP794_LIVE_REVISION          = 60
APP794_PREVIEW_REVISION       = 60
APP794_ACCEPTED_SOURCE        = 1ed342ad137a4a364496a28d29bdffd24a99b511
APP794_ACCEPTED_JS            = 115a08ace32bdf850cb5eebf25b953d1803114d0
APP794_ACCEPTED_CSS           = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
REV60_USER_UAT                = PASS
HYBRID_CORE_ACCEPTED_COMMIT   = c20e406b9b289984e57ebf2c52c9223094bc5f5a
HYBRID_CORE_SOURCE            = PASS
LIVE_DEPLOY_READY             = NO
```

Accepted Hybrid core rules:
- strict dedicated mapping uses only `Number_0=1`, exact `MBO_Kintone_User[].code`, canonical `emp_text`;
- legacy `resolveEmployeeIdentity()` fallback is **not** the future dedicated runtime API;
- DEDICATED requester = exact dedicated Kintone user;
- SHARED requester behavior remains trim + case-insensitive compatibility against authoritative App795 `Requester_User`;
- own-MBO self-appraiser elision preserves approver slots, users, rules, order and topology;
- Natta own example remains `natta -> uchida / M1_G1` -> effective `uchida / M1_ONLY` with no auto-approval;
- generic 3-slot/4-slot transformations have committed regression proof.

Executor evidence for the accepted core reports 27/27 focused tests, 1015/1015 full tests, diff check PASS, App53 untouched and zero live network operations. ChatGPT acceptance was based on independent source/test/evidence inspection.

## 3. Confirmed Hybrid Identity / Dual Role

```text
HYBRID_IDENTITY = DEDICATED_KINTONE_AUTO_BIND + SHARED_ACCOUNT_MBO_LOGIN
DUAL_ROLE_EMPLOYEE_APPROVER = CONFIRMED
```

Dedicated path:
```text
native Kintone login
-> exact App53 MBO_Kintone_User mapping
-> Number_0 = 1
-> valid canonical emp_text Employee_Code
-> Employee-Self auto-bind
-> NO App801 bearer session / NO second MBO password
```

Shared path:
```text
approved shared Kintone principal
-> current App794 MBO Login
-> Employee_Code + App801 MBO password/session
```

Approved shared Kintone principals remain:
```text
t1, t2, s1, f1, f2, f3, e1, tmh, g_request
```

Dual-role separation:
```text
My MBO ownership  = bound Employee_Code
Approver identity = current dedicated Kintone User
Approval Tasks    = authoritative CURRENT native Workflow assignee == current dedicated Kintone User
```

Static App795 membership, stale route snapshots, UI visibility, or caller-supplied roles are not Approver authorization.

## 4. App53 Production Protection — MANDATORY

```text
APP53_ENVIRONMENT                 = PRODUCTION
APP53_DEFAULT_MODE                = READ_ONLY
APP53_SCHEMA_WRITE_AUTH           = NONE
APP53_RECORD_WRITE_AUTH           = NONE
APP53_BULK_WRITE_AUTH             = NONE
```

Adding `MBO_Kintone_User`, populating mapping values, and correcting Natta `emp_text` are three separate protected concerns. Each future write requires its own exact one-shot authorization, fresh pre-write evidence, reviewed backup/recovery material, exact payload, impact/rollback plan and immediate post-write readback. No source/test/deploy approval for another resource implies App53 permission.

Current audited facts:
```text
Vassana: vassana -> App53 #456 -> emp_text 0044 -> Active 1
Natta:   natta   -> App53 #578 -> emp_text BLANK -> Active 1
MBO_Kintone_User live field = NOT YET CREATED
```

Natta remains fail closed until the real canonical Employee_Code is proven/corrected under separate protected authorization. Never infer from `Number=243`, Vendor Account Number, email, name, or padding.

## 5. Runtime Integration Source Inventory R1 — COMPLETE

Inventory base: `b6ab428f2703e29cffada49ef0bfee7dbda37fd8`.

### 5.1 Current runtime is SHARED-only

`src/main-mbo-app.js` currently initializes `MboKintoneLoginGate` + `MboSessionManager` and calls `mboLoginGate.requireLogin()` for index/detail/edit/create before Employee-Self content. This forces the App801-backed shared path on every user and does not consume the accepted strict dedicated resolver.

### 5.2 Existing Employee-Self seams are reusable

- `EmployeePartAUI` already accepts a bound `authenticatedEmployeeCode`, hides free-form lookup on Create, and rejects a different Employee_Code.
- `EmployeeSelfIndexUI` already queries exactly `Employee_Code = <bound code>` newest FY first.
- detail/edit in `main-mbo-app.js` already blocks cross-employee records when fed the correct bound code.
- therefore Dedicated and Shared can converge on one common page-memory Employee-Self context without changing My MBO ownership semantics.

### 5.3 Dedicated mapping data-access seam

`MboIdentityService.resolveDedicatedKintoneUserMapping()` is accepted strict mapping logic, but no runtime caller exists yet. `EmployeeService` is the current App53 read-only data-access owner and needs one narrow targeted mapping-candidate GET method; the strict identity decision must remain in `MboIdentityService`.

### 5.4 Create / effective requester seam

Current Create lookup uses `RoutingService.validateRequesterAccess(...)` and snapshots `routing.Requester_User`; that is the existing SHARED requester path. Hybrid Create must instead:
1. resolve the pure App795 route;
2. for DEDICATED own-MBO only, apply accepted self-appraiser elision before snapshot;
3. call accepted `resolveEffectiveRequesterUser()` using authoritative identity mode/current Kintone user;
4. snapshot the resulting effective `Requester_User` and effective route;
5. preserve SHARED requester behavior unchanged.

### 5.5 Shared session modules must remain untouched

`mbo-kintone-login-gate.js`, `mbo-session-manager.js`, and `mbo-kintone-auth-adapter.js` already own the accepted shared credential/session lifecycle. Dedicated mode must bypass `requireLogin()` and must not render MBO Change Password / MBO Logout controls. A dedicated page must not fail merely because the App801 gate is unavailable.

### 5.6 Delete guard seam

`DeleteGuardPolicy` currently derives Employee-Self only from `mboLoginGate.getEmployeeCode()`. Hybrid integration must let it consume the common Employee-Self context so dedicated Employee-Self deletion remains blocked, while preserving abstain behavior when there is no Employee-Self context.

### 5.7 Build seam

`scripts/kintone/build-mbo-ui.js` uses esbuild from the single entry `src/main-mbo-app.js`; imported modules are bundled transitively. No manual dist edits are allowed. `tests/classic-bundle.test.js` is the dependency-graph/build proof seam.

### 5.8 My Approval Tasks is NOT ready to combine with Entry R1

No current canonical browser runtime module/service/UI owns `My Approval Tasks`, and source inspection found no current `$assignee`/current-native-assignee query/revalidation seam. The existing `app.record.detail.process.proceed` hook validates business/workflow rules but does not independently prove current native assignee authority.

Therefore:
```text
MY_APPROVAL_TASKS_RUNTIME_OWNER = NOT YET IMPLEMENTED
CURRENT_NATIVE_ASSIGNEE_SOURCE_CONTRACT = NOT YET PROVEN IN RUNTIME SOURCE
```

Do **not** invent a Kintone system field/API or authorize from App795 membership. After Employee-Self Entry R1 is accepted, open a separate READ-ONLY native-assignee contract proof before implementing Approval Tasks.

## 6. Current Active Task — Hybrid Employee-Self Runtime Entry R1

```text
ACTIVE_TASK = D1 HYBRID IDENTITY EMPLOYEE-SELF RUNTIME ENTRY R1
OWNER       = ANTIGRAVITY
MODE        = SOURCE / FIXTURE TEST / BUILD ONLY
APP53_MODE  = PRODUCTION READ_ONLY
LIVE_ACCESS = NO
LIVE_WRITE  = NO
DEPLOY      = NO
```

Scope:
- authoritative no-UI-toggle mode selection using the approved shared-principal set;
- SHARED continues through existing MBO Login/session unchanged;
- non-shared principal becomes DEDICATED candidate and must strict-map via App53 mapping candidates + `resolveDedicatedKintoneUserMapping()`;
- missing/ambiguous/invalid dedicated mapping fails closed and must never fall back to SHARED login;
- `admin-form` must not become Employee-Self;
- common in-page Employee-Self context feeds existing My MBO/detail/edit/create ownership;
- DEDICATED bypasses App801 login/session/password controls;
- Create uses accepted Hybrid effective-requester + own-route transformation;
- Employee-Self delete guard works for both identity modes;
- no My Approval Tasks implementation in this WP.

Exact file scope and tests are in `AI_ACTIVE_TASK.md`.

## 7. App800 Reset UI / Tooling — Accepted, Not Deployed

```text
APP800_RESET_UI_SOURCE_COMMIT            = a7a9f02aff6b497f3f8e0009dd377437a3701416
APP800_DEPLOY_TOOL_IMPLEMENTATION_COMMIT = 14b911d9cde8b59b6c15e6b05bc8fccfbb6727fd
APP800_DEPLOY_TOOL_TEST_EVIDENCE_COMMIT  = 9b0377dd56b1a7b74f60dc748babd7d00f8d5fdd
APP800_RESET_UI_SOURCE                   = PASS
APP800_DEPLOYMENT_TOOL_COMPATIBILITY_R1  = PASS
LIVE_DEPLOYED                            = NO
ACTIVE_DEPLOY_AUTH                       = NONE
```

Reset MBO Password means App801-backed MBO credential reset only, never native Kintone/cybozu password reset.

## 8. Authorization Ledger / Safety

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

## 9. Next Gate

```text
CURRENT_GATE  = D1 HYBRID IDENTITY EMPLOYEE-SELF RUNTIME ENTRY R1
CURRENT_OWNER = ANTIGRAVITY
NEXT_REVIEWER = CHATGPT
```

After source acceptance, protected Kintone configuration is **still not automatic**. Before My Approval Tasks implementation, Control Plane must separately prove the authoritative current-native-assignee runtime contract without guessing.
