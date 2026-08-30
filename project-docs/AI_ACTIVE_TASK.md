# AI ACTIVE TASK — D1 HYBRID IDENTITY EMPLOYEE-SELF RUNTIME ENTRY R1

Mode: **ANTIGRAVITY SOURCE / FIXTURE TEST / BUILD ONLY — APP53 PRODUCTION READ-ONLY / NO LIVE KINTONE ACCESS / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 0. Starting Point

Control Plane inventory is complete. Start from the latest canonical branch HEAD; do not reset/rebase over newer Control Plane commits.

Accepted Hybrid core commit:
```text
c20e406b9b289984e57ebf2c52c9223094bc5f5a
```

Control Plane inventory commit before this assignment:
```text
f4b9f65a931513fc1aa000c214a09425c361fa67
```

Mandatory Baselines:
- `project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`
- `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md`
- `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
- `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`

Do not edit Control Plane docs, Baselines, Joblist or skills.

## 1. FEATURE / Goal

```text
FEATURE = HYBRID EMPLOYEE-SELF RUNTIME ENTRY
```

Integrate the already accepted Hybrid identity core into the existing App794 browser runtime for **Employee-Self only**.

This WP must prove:
- approved SHARED Kintone principals continue through the existing MBO Login/App801 session path unchanged;
- a non-shared Kintone principal is treated as a DEDICATED candidate and must resolve through exact App53 `MBO_Kintone_User + Number_0=1 + emp_text` mapping;
- DEDICATED missing/ambiguous/invalid mapping fails closed and never falls back to SHARED login;
- both valid paths converge only on a common page-memory Employee-Self context `{ mode, employeeCode, kintoneUserCode }`;
- My MBO/detail/edit/create remain bound to that exact Employee_Code;
- DEDICATED never requires App801 bearer session and never sees MBO Change Password / MBO Logout controls;
- SHARED credential/session behavior remains unchanged;
- Hybrid Create snapshots the correct effective requester and effective own route;
- Employee-Self delete protection covers either mode.

**Do not implement My Approval Tasks in this WP.**

## 2. Canonical Source Owners

```text
Identity mode + strict mapping semantics = src/services/mbo-identity-service.js
App53 mapping candidate GET             = src/services/employee-service.js
Top-level event/mode orchestration      = src/main-mbo-app.js
Employee-Self delete defense-in-depth   = src/security/delete-guard-policy.js
Shared login/session internals          = EXISTING MODULES / READ-ONLY
Routing transformation/effective actor  = EXISTING ACCEPTED RoutingService / READ-ONLY
```

No new source file is expected or authorized.

## 3. Exact Allowed Source Changes

Allowed source modifications only:
- `src/services/mbo-identity-service.js`
- `src/services/employee-service.js`
- `src/main-mbo-app.js`
- `src/security/delete-guard-policy.js`

Allowed test modifications only:
- `tests/d1-hybrid-identity-core-source.test.js`
- `tests/employee-lookup-service.test.js`
- `tests/employee-main-mbo-app-integration.test.js`
- `tests/classic-bundle.test.js`

Allowed evidence creation:
- `project-docs/D1_HYBRID_IDENTITY_EMPLOYEE_SELF_RUNTIME_ENTRY_R1_EVIDENCE.md`

Everything else is read-only/forbidden unless a test proves a required source defect outside this exact seam; if so **STOP and report**, do not broaden automatically.

## 4. Required Source Behavior

### 4.1 Authoritative identity-mode selection — `mbo-identity-service.js`

Add one canonical mode-selection API owned by `MboIdentityService` (preferred name: `resolveKintonePrincipalMode`).

Approved SHARED Kintone principals are exactly:
```text
t1
t2
s1
f1
f2
f3
e1
tmh
g_request
```

Rules:
- mode is derived from native `kintone.getLoginUser().code`; there is no UI toggle/caller-selectable role;
- require an exact nonblank string and reject leading/trailing whitespace rather than silently rewriting it;
- exact approved shared-code membership -> `SHARED`;
- every other normal non-shared user -> `DEDICATED` candidate;
- `admin-form`, `Administrator`, `ADMIN` -> technical-admin Employee-Self DENIED, not SHARED and not DEDICATED;
- do not infer mode from App53 name/email, App795 route membership, password/session presence, or Employee_Code;
- keep the approved shared-principal set centralized in the identity owner, not duplicated in UI/main.

Changing the approved shared set is out of scope.

### 4.2 Targeted App53 mapping candidate read — `employee-service.js`

Add one read-only data-access API (preferred name: `lookupDedicatedIdentityMappingCandidates`).

Input: exact native Kintone User Code.

Required behavior:
- validate nonblank exact string and reject leading/trailing whitespace before the API call;
- construct a safe targeted App53 query against the future approved field:
  `MBO_Kintone_User in ("<exact safely escaped user code>") and Number_0 = 1 limit 2`;
- safely escape Kintone query string literal characters; do not lowercase or silently normalize the native user code;
- execute **GET only** through the injected `kintoneApi.getRecords(53, query)`;
- return raw candidate records to the strict identity resolver;
- no fallback to employee name, email, `Number`, Vendor Account Number, `Kintone_User_Code`, `Employee_Code`, or full-App53 scan;
- source access/invalid response must fail closed;
- never write App53.

The physical `MBO_Kintone_User` field is not live yet. This WP is source/fixture only and must not attempt to create or probe it live.

### 4.3 Common Employee-Self context — `main-mbo-app.js`

Introduce minimal top-level orchestration that resolves one page-memory context:
```text
{
  mode: 'SHARED' | 'DEDICATED',
  employeeCode: <bound canonical Employee_Code>,
  kintoneUserCode: <exact native Kintone user code>
}
```

Rules:

**SHARED**
- only after identity-mode selector returns SHARED;
- require existing `mboLoginGate`;
- use existing `mboLoginGate.requireLogin()` exactly as the shared credential/session proof;
- do not modify shared token/session/password behavior.

**DEDICATED**
- do not call `mboLoginGate.requireLogin()`;
- call targeted App53 mapping-candidate GET;
- feed those raw candidates to accepted `MboIdentityService.resolveDedicatedKintoneUserMapping()`;
- only `IDENTITY_BOUND` may create Employee-Self context;
- missing / ambiguous / invalid canonical code -> visible fail-closed block;
- **never** fall back to SHARED login on dedicated mapping failure;
- dedicated entry must not depend on App801 gate/session initialization being usable.

**TECHNICAL ADMIN**
- no Employee-Self context;
- do not solve or redesign Admin Support Center routing in this WP.

Use the common context for index/detail/edit/create orchestration. Preserve exact cross-employee ownership checks.

### 4.4 Shared-only auth controls

Do not edit `mbo-kintone-login-gate.js`.

In main orchestration:
- SHARED keeps existing `renderAuthBar()` behavior;
- DEDICATED does not render MBO Change Password / MBO Logout controls;
- when constructing `EmployeeSelfIndexUI`, pass the shared gate only for SHARED mode; pass no gate for DEDICATED so existing My MBO renderer does not render the shared auth bar.

Do not add fake Kintone password/logout controls.

### 4.5 My MBO / Detail / Edit / Create ownership

Reuse existing source behavior:
- `EmployeeSelfIndexUI` exact `Employee_Code = boundEmployeeCode` query;
- `EmployeePartAUI.authenticatedEmployeeCode` binding;
- `executeLookup()` mismatch guard;
- detail/edit cross-employee block.

Do not add employee selectors. `employee-self-index-ui.js` and `employee-part-a-ui.js` are read-only in this WP unless tests prove an unavoidable defect; if so STOP/report first.

### 4.6 Hybrid Create requester + own-route snapshot

Replace only the current Create routing composition seam in `main-mbo-app.js`.

Required sequence after verified EmployeeService profile lookup:
```text
RoutingService.resolveRoutingProfile(...)
-> IF mode == DEDICATED:
     RoutingService.applyOwnMboSelfAppraiserElision(route, exactKintoneUserCode, true)
   ELSE SHARED:
     route unchanged
-> RoutingService.resolveEffectiveRequesterUser({
     mode,
     kintoneUserCode,
     routeRequesterUsers: authoritative App795 Requester_User
   })
-> snapshot effective Requester_User + effective approver route/topology
```

Rules:
- do not call the legacy `validateRequesterAccess()` as the Hybrid Create authorization seam;
- SHARED output must remain behavior-compatible with the existing App795 Requester_User path;
- DEDICATED Requester_User becomes exact dedicated Kintone user;
- self-appraiser elision applies only to DEDICATED own-MBO Create;
- no App795 source mutation;
- no auto-approval/synthetic history;
- if self-elision leaves no approver, fail closed;
- scoring, duplicate check, verified form-state persistence, attachments and other Create behavior remain unchanged.

`src/services/routing-service.js` is accepted and READ-ONLY in this WP.

### 4.7 Hybrid Employee-Self delete guard

Update `DeleteGuardPolicy` narrowly so it can consume the common Employee-Self context (for example via injected getter/provider) while preserving existing shared-gate compatibility.

Required behavior:
- valid DEDICATED Employee-Self context -> delete submit blocked;
- valid SHARED Employee-Self context -> delete submit blocked;
- no valid Employee-Self context -> guard abstains; it must not become a global admin/HR/approver deny engine;
- no REST DELETE path added.

## 5. Explicitly Read-Only / Forbidden Source

Do not modify:
- `src/services/routing-service.js`
- `src/ui/mbo-kintone-login-gate.js`
- `src/ui/mbo-session-manager.js`
- `src/ui/mbo-kintone-auth-adapter.js`
- `src/ui/employee-self-index-ui.js`
- `src/ui/employee-part-a-ui.js`
- `src/services/mbo-employee-self-gateway.js`
- `src/server/**`
- `services/mbo-auth-bridge/**`
- `scripts/kintone/build-mbo-ui.js`
- `config/**`
- all Baselines / Control Plane / Joblist / skills
- App53/App794/App795/App801 live configuration

Do not connect the superseded server/Auth Bridge/gateway path.

## 6. My Approval Tasks — HARD SCOPE STOP

Do not implement:
- Approval Tasks list/menu;
- current-native-assignee query;
- approver action authorization;
- `$assignee` or any guessed Kintone system field/API;
- App795-membership-based approval authority.

Current source has no accepted runtime owner/contract for current native assignee. A later Control Plane READ-ONLY proof must establish that exact contract first.

## 7. Required Focused Tests

### A. Mode selection / canonical identity
In `tests/d1-hybrid-identity-core-source.test.js` prove at minimum:
- every approved shared principal resolves SHARED;
- representative non-shared principal resolves DEDICATED candidate;
- exact code behavior / whitespace rejected;
- `admin-form` / technical admin denied Employee-Self;
- no mode selection from caller UI/role value;
- accepted strict dedicated resolver tests remain PASS.

### B. App53 targeted mapping data access
In `tests/employee-lookup-service.test.js` prove:
- exact targeted query uses `MBO_Kintone_User` + `Number_0=1` + `limit 2`;
- only injected GET/read API is called;
- query literal escaping is safe;
- whitespace/malformed missing user fails before API;
- invalid/source-error response fails closed;
- no fallback/full-App53 scan.

### C. Real main runtime integration
In `tests/employee-main-mbo-app-integration.test.js` prove at minimum:

**SHARED regression**
- use an approved shared native principal (e.g. `f1`), while MBO Employee_Code may remain a separate code such as `0118`;
- existing gate/session path supplies Employee_Code;
- My MBO/detail/edit/create continue with bound Employee_Code;
- SHARED Create snapshots authoritative App795 Requester_User behavior unchanged;
- shared auth bar remains available.

**DEDICATED**
- valid dedicated fixture (e.g. `vassana -> App53 mapping -> 0044`) enters without calling `mboLoginGate.requireLogin()`;
- works even when shared gate is unavailable/null;
- My MBO/detail/edit/create use mapped `0044` only;
- dedicated auth bar does not expose MBO Change Password / Logout;
- dedicated Create snapshots `Requester_User=[{code:'vassana'}]` even when App795 Requester_User contains only shared fallback;
- dedicated own-route self-appraiser case transforms before snapshot (use a fixture with a valid canonical Employee_Code; do **not** invent Natta Employee_Code);
- missing/ambiguous/invalid dedicated mapping blocks and never invokes shared login fallback;
- cross-employee detail/edit remains blocked;
- DEDICATED delete event blocks with valid Employee-Self context;
- no Employee-Self context still lets DeleteGuardPolicy abstain.

### D. Build/dependency proof
In `tests/classic-bundle.test.js`:
- keep existing classic IIFE/no-import/no-export proof;
- prove the browser bundle graph now includes `src/services/mbo-identity-service.js` exactly through the main dependency graph;
- prove shared auth/session modules remain included;
- no server/Auth Bridge module enters the browser bundle.

### E. Regression
Run at minimum:
- focused Hybrid core test;
- employee lookup service test;
- employee main integration test;
- classic bundle test;
- existing shared login gate/session manager tests **without editing their source files**;
- full `npm test`;
- `git diff --check`.

## 8. Build / Dist Rule

Run `npm run ui:build` or equivalent canonical build verification as needed.

`dist/mbo-employee-app.js` and CSS are generated outputs only. They may be generated locally for tests, but **must not be committed/changed in the final WP diff** because this is not a deployment artifact gate.

Final committed implementation diff must contain only the allowed source/test/evidence files above.

## 9. App53 Production / Live Hard Stop

```text
APP53_ENVIRONMENT            = PRODUCTION
APP53_DEFAULT_MODE           = READ_ONLY
LIVE_GET                     = 0
LIVE_POST                    = 0
LIVE_PUT                     = 0
LIVE_DELETE                  = 0
APP53_SCHEMA_WRITE           = 0
APP53_RECORD_WRITE           = 0
APP53_IMPORT_OR_BULK_WRITE   = 0
APP794_RECORD_WRITE          = 0
APP794_ACL_WRITE             = 0
GROUP_WRITE                  = 0
APP795_WRITE                 = 0
APP801_LIVE_WRITE            = 0
PROCESS_WRITE                = 0
CUSTOMIZATION_UPLOAD         = 0
DEPLOY                       = 0
ROLLBACK                     = 0
```

Fixtures/mocks only. Do not open App53 for testing. Do not create/populate `MBO_Kintone_User`. Do not correct Natta `emp_text`.

## 10. STOP Conditions

STOP and report instead of expanding scope if:
- implementation appears to require modifying shared auth adapter/login gate/session manager;
- App53 schema/config/data must change;
- routing-service accepted core appears defective;
- EmployeeSelfIndexUI or EmployeePartAUI needs semantic redesign rather than simple orchestration reuse;
- Admin Support Center preservation requires a new technical-admin runtime routing design;
- My Approval Tasks/current native assignee is needed to make this WP work;
- a new source module is required;
- manual dist editing is required;
- any live Kintone operation is required;
- a test reveals an unrelated source defect.

Do not patch unrelated defects automatically.

## 11. Evidence / Acceptance Ceiling

Create:
`project-docs/D1_HYBRID_IDENTITY_EMPLOYEE_SELF_RUNTIME_ENTRY_R1_EVIDENCE.md`

Evidence must include:
- starting canonical HEAD;
- exact changed files;
- exact focused/full/build/diff results;
- explicit SHARED regression result;
- explicit DEDICATED auto-bind/missing/ambiguous/no-fallback results;
- exact Create requester/self-elision fixture results;
- delete-guard both-mode results;
- bundle dependency result;
- safety table showing all live operations = 0;
- `APP53_PRODUCTION_TOUCHED = NO`;
- `NATTA_EMPLOYEE_CODE_GUESSED = NO`;
- `MY_APPROVAL_TASKS_IMPLEMENTED = NO`.

Maximum executor status:
```text
D1_HYBRID_IDENTITY_EMPLOYEE_SELF_RUNTIME_ENTRY_R1_READY_PENDING_CHATGPT_REVIEW
```

Commit one focused source/test/evidence commit, push, then STOP. Next owner = ChatGPT independent review.
