# AI ACTIVE TASK — D1 HYBRID IDENTITY EMPLOYEE-SELF RUNTIME ENTRY R1 CORRECTIVE R1

Mode: **ANTIGRAVITY NARROW SOURCE / FIXTURE TEST / BUILD / EVIDENCE ONLY — APP53 PRODUCTION READ-ONLY / NO LIVE KINTONE ACCESS / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 0. Starting Point / Review Result

ChatGPT independently reviewed executor candidate:
```text
CANDIDATE_COMMIT = 6eccb3987372d9d50c06cc4249e264c86f11bb3d
CANDIDATE_BASE   = 7989b950247d269440f588da580cb9b56726b406
REVIEW_RESULT    = CORRECTIVE
SOURCE_ACCEPTED  = NO
```

Control Plane review commit:
```text
ddb128231713a23744bab843f32574613587df78
```

Start from the **latest canonical branch HEAD** containing current Control Plane docs. Do not reset/rebase over Control Plane commits.

Mandatory Baselines:
- `project-docs/CONFIRMED_BASELINE/D1_HYBRID_IDENTITY_ACCESS_DESIGN.md`
- `project-docs/CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
- `project-docs/CONFIRMED_BASELINE/D1_EMPLOYEE_SELF_MY_MBO.md`
- `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
- `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`

Do not edit Control Plane docs, Baselines, Joblist or skills.

## 1. Goal

Correct only the independently proven defects in Hybrid Employee-Self Runtime Entry R1 while preserving the accepted Hybrid core and shared MBO login/session behavior.

Required final classification target:
```text
SHARED = exact approved 9 native Kintone principals only
DEDICATED failure = fail closed, never shared fallback
DEDICATED delete = blocked through actual registered runtime handler
Create requester/route = derived from the already resolved local Employee-Self context
Required runtime/build proof = explicit and complete
APP53 Production = untouched / no live GET or write
```

**Do not implement My Approval Tasks in this WP.**

## 2. Finding R1-A — Remove Unauthorized SHARED Wildcards

Current candidate `MboIdentityService.resolveKintonePrincipalMode()` contains the approved set but also returns SHARED for:
- any all-digit Kintone user code;
- `req*`;
- `test*`;
- `user*`.

This is unauthorized privilege expansion.

Required correction in `src/services/mbo-identity-service.js`:
- SHARED only when the native Kintone user code is an **exact member** of:
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
- keep exact/case-sensitive membership;
- `F1` is not `f1` and therefore becomes a DEDICATED candidate unless separately approved in the future;
- any normal non-shared principal becomes DEDICATED candidate;
- technical-admin codes remain denied Employee-Self;
- no regex/prefix/numeric heuristic;
- no inference from Employee_Code, App795, password/session, email/name or caller UI.

Mandatory tests must prove at least:
- all approved 9 -> SHARED;
- `0118`, `12345`, `req_demo`, `testuser`, `user123`, `F1` -> **not SHARED** / DEDICATED candidate;
- whitespace still rejected;
- technical admin still not Employee-Self.

## 3. Finding R1-B — DEDICATED Mapping Failure Must Never Fall Back to SHARED

Current `resolveRuntimeEmployeeSelfContext()` calls `mboLoginGate.requireLogin()` after a DEDICATED mapping failure and can return a SHARED context.

Delete that fallback completely.

Required behavior:
```text
mode DEDICATED
-> targeted App53 candidate read through injected runtime GET seam
-> strict resolveDedicatedKintoneUserMapping()
-> IDENTITY_BOUND only -> DEDICATED Employee-Self context
-> missing / ambiguous / invalid / source-access failure -> visible fail closed
-> mboLoginGate.requireLogin() call count = 0
```

Rules:
- never reinterpret a DEDICATED native principal as SHARED;
- never render shared MBO Login after dedicated mapping failure;
- a valid DEDICATED principal must work when `mboLoginGate` is null/unavailable;
- source-access failure may use a sanitized dedicated-mapping/source error, but must not silently become shared login.

Required real-runtime fixture tests:
- valid dedicated mapping with gate null -> success;
- missing mapping -> blocked, gate call count 0;
- ambiguous mapping -> blocked, gate call count 0;
- invalid canonical `emp_text` -> blocked, gate call count 0;
- injected App53 read error/invalid response -> blocked, gate call count 0.

## 4. Finding R1-C — Connect DEDICATED Delete Guard to Registered Runtime Handler

`DeleteGuardPolicy` now supports `getEmployeeSelfContext`, but the actual App794 handler still constructs it with only `mboLoginGate`.

Required correction in `src/main-mbo-app.js`:
- inject the authoritative current Employee-Self context provider into the registered delete handler;
- preserve existing shared-gate compatibility;
- do not make the guard a global Admin/HR/Approver deny engine.

Required registered-handler tests:
- valid DEDICATED context -> `app.record.detail.delete.submit` blocked;
- valid DEDICATED context -> `app.record.index.delete.submit` blocked if handler is shared/registered there;
- valid SHARED context -> blocked;
- no Employee-Self context -> guard abstains and returns event unchanged.

No REST DELETE path may be added.

## 5. Finding R1-D — Restore Out-of-Scope App800/HR Test Exactly

Candidate improperly modified:
`tests/hr-control-center-reset-ui.test.js`

Required action:
- restore this file **exactly** to pre-WP content/blob from base `7989b950247d269440f588da580cb9b56726b406`;
- expected restored blob:
```text
eb2a3cdfb6bee6a6d67f15cc3210f139a1635756
```
- specifically, do not keep the candidate removal of `src/main-mbo-app.js` from its historical forbidden-prefix list;
- do not redesign or weaken this App800 test in this Hybrid WP.

If its `git status --porcelain` assertion causes a pre-commit full-suite failure because authorized Hybrid files are uncommitted, use the clean/provisional local-commit workflow in Section 10. Do not patch the App800 test.

## 6. Finding R1-E — Complete Required Runtime / Build Proof

The initial candidate evidence overclaims proof not actually present. Complete the missing tests.

### 6.1 SHARED real-runtime regression

Using an approved native shared principal such as `f1` and a separate MBO Employee_Code such as `0118`, prove:
- existing `mboLoginGate.requireLogin()` supplies the Employee_Code;
- My MBO/detail/edit/create remain bound to `0118`;
- SHARED Create snapshots the authoritative App795 `Requester_User` payload unchanged;
- shared auth bar remains available;
- no change to MboKintoneLoginGate/MboSessionManager/MboKintoneAuthAdapter source.

### 6.2 DEDICATED real-runtime proof

Using fixture identities only (Vassana `vassana -> 0044` is allowed as already audited fixture; do not invent Natta Employee_Code), prove:
- valid dedicated index/My MBO is bound to `0044` only;
- detail/edit for `0044` succeeds;
- cross-employee detail/edit is blocked;
- create is bound to `0044` and has no employee selector behavior change;
- shared MBO Change Password / Logout bar is absent;
- Create snapshots `Requester_User=[{code:'vassana'}]` even if App795 `Requester_User` contains only shared fallback principal(s).

### 6.3 Dedicated own-route self-elision in runtime

Use a **generic fixture dedicated user with a valid fixture Employee_Code**, not Natta, where App795 route includes the same dedicated user as an appraiser plus at least one non-self approver.

Prove through real main Create orchestration:
- self appraiser removed before snapshot;
- surviving approver/rule/topology exactly match accepted RoutingService output;
- no auto-approval/history event;
- underlying route fixture remains unchanged.

Do not modify `src/services/routing-service.js`.

### 6.4 Build/dependency proof

Modify `tests/classic-bundle.test.js` narrowly to explicitly prove:
- classic IIFE parse remains valid;
- no ES import/export residue;
- browser dependency graph includes `src/services/mbo-identity-service.js`;
- shared auth/session modules remain included;
- `src/server/**` and `services/mbo-auth-bridge/**` do not enter the browser bundle.

Do not edit `scripts/kintone/build-mbo-ui.js` or generated dist manually.

## 7. Finding R1-F — Use Resolved Local Context in Create; No Silent SHARED Default

Inside `setupRecordUiWithAuth(...)`, a resolved local context already exists.

Required correction:
- Create requester/self-elision composition must use `context.mode` and `context.kintoneUserCode` from the resolved context passed into that handler;
- do not re-authorize by mutable module-global `currentEmployeeSelfContext?.mode || 'SHARED'`;
- do not silently default a missing/invalid mode to SHARED;
- if the local context is missing/malformed, fail closed;
- keep `currentEmployeeSelfContext` only as the page-memory context needed by other orchestration such as delete guard, not as a silent authorization fallback.

Do not broaden into a new architecture/refactor.

## 8. Exact File Scope

Allowed source modifications:
- `src/services/mbo-identity-service.js`
- `src/main-mbo-app.js`
- `src/security/delete-guard-policy.js` **only if a narrow correction is still needed after main wiring review**

Expected read-only source:
- `src/services/employee-service.js` (candidate targeted GET implementation appears conformant; do not change unless a new focused test proves a real defect, then STOP/report first)
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
- `dist/**` final committed output

Allowed test modifications:
- `tests/d1-hybrid-identity-core-source.test.js`
- `tests/employee-main-mbo-app-integration.test.js`
- `tests/classic-bundle.test.js`

Read-only tests unless STOP/report:
- `tests/employee-lookup-service.test.js`
- `tests/mbo-kintone-login-gate.test.js`
- `tests/mbo-session-manager.test.js`
- all unrelated tests

Special exact restoration only:
- `tests/hr-control-center-reset-ui.test.js` -> restore pre-WP blob `eb2a3cdfb6bee6a6d67f15cc3210f139a1635756`; no other edits.

Allowed evidence:
- create `project-docs/D1_HYBRID_IDENTITY_EMPLOYEE_SELF_RUNTIME_ENTRY_R1_CORRECTIVE_R1_EVIDENCE.md`

Do not edit prior evidence except to leave it as historical candidate evidence.

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

Fixtures/mocks only. **Do not open App53 for testing.** Do not create/populate `MBO_Kintone_User`. Do not correct Natta `emp_text`. Any GET exercised by tests must be injected/mock only, never live Kintone.

## 10. Verification Workflow

Run focused tests while implementing:
- `tests/d1-hybrid-identity-core-source.test.js`
- `tests/employee-lookup-service.test.js`
- `tests/employee-main-mbo-app-integration.test.js`
- `tests/classic-bundle.test.js`
- existing `tests/mbo-kintone-login-gate.test.js`
- existing `tests/mbo-session-manager.test.js`

Then verify canonical build with `npm run ui:build` or equivalent and ensure generated dist is **not** left in final committed diff.

### Full npm test without weakening historical App800 test

Because the historical App800 test inspects `git status --porcelain`, use this safe local sequence if needed:
1. finish source + tests + exact HR-test restoration;
2. run focused tests;
3. create a **local provisional commit** containing source/tests only; do not push;
4. with clean working tree, run full `npm test` and canonical build;
5. create the corrective evidence file recording the exact results;
6. amend the same local commit so final branch history contains **one corrective executor commit**;
7. re-run focused tests/build/diff-check as appropriate; source/test tree must be identical to the tree that passed full npm test except for the added evidence markdown;
8. push the one final amended corrective commit, then STOP.

If full suite fails for a real unrelated defect, STOP/report. Do not patch unrelated tests/source.

Also run:
- `git diff --check`;
- final scope diff against the starting canonical Control Plane HEAD.

## 11. Evidence Requirements

Create:
`project-docs/D1_HYBRID_IDENTITY_EMPLOYEE_SELF_RUNTIME_ENTRY_R1_CORRECTIVE_R1_EVIDENCE.md`

Must contain:
- starting canonical HEAD from this corrective cycle;
- candidate commit being corrected (`6eccb398...`);
- exact corrective changed files;
- exact focused test command/results;
- exact full npm test result;
- exact build result;
- exact `git diff --check` result;
- exact restored HR-test blob identity;
- SHARED exact-principal negative/wildcard tests;
- explicit DEDICATED valid/null-gate result;
- missing/ambiguous/invalid/source-error results with `mboLoginGate.requireLogin()` call count = 0;
- SHARED requester snapshot result;
- DEDICATED requester snapshot result;
- dedicated own-route self-elision runtime result;
- real registered delete-handler results for DEDICATED/SHARED/no-context;
- bundle dependency result;
- final scope diff;
- explicit safety table:
```text
LIVE_GET=0
LIVE_POST=0
LIVE_PUT=0
LIVE_DELETE=0
APP53_SCHEMA_WRITE=0
APP53_RECORD_WRITE=0
APP53_BULK_WRITE=0
APP794_ACL_WRITE=0
GROUP_WRITE=0
APP795_WRITE=0
APP801_LIVE_WRITE=0
PROCESS_WRITE=0
CUSTOMIZATION_UPLOAD=0
DEPLOY=0
ROLLBACK=0
APP53_PRODUCTION_TOUCHED=NO
NATTA_EMPLOYEE_CODE_GUESSED=NO
MY_APPROVAL_TASKS_IMPLEMENTED=NO
```

Evidence must clearly state **all App53/Kintone reads in tests were mock/fixture reads, not live GETs**.

Maximum executor status:
```text
D1_HYBRID_IDENTITY_EMPLOYEE_SELF_RUNTIME_ENTRY_R1_CORRECTIVE_R1_READY_PENDING_CHATGPT_REVIEW
```

## 12. STOP Conditions

STOP and report instead of expanding scope if:
- correction requires changing the approved shared 9-principal list;
- shared auth adapter/login gate/session manager source must change;
- App53 schema/config/data or any live Kintone access is required;
- routing-service accepted core appears defective;
- EmployeeSelfIndexUI/EmployeePartAUI semantic redesign is required;
- My Approval Tasks/current-native-assignee becomes necessary;
- a new source module is required;
- an unrelated test/source defect appears;
- final diff requires manual dist changes.

Commit one focused corrective commit, push, then STOP. Next owner = ChatGPT independent review.
