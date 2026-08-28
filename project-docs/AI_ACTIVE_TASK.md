# AI ACTIVE TASK — D1 CREATE-HANDLER FORM-STATE CORRECTIVE

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.
> Execution Plane: Antigravity
> Branch: `ai/antigravity-wp002c`
> Mode: **SOURCE / BUILD / TEST ONLY — ZERO KINTONE WRITE**

## 0. Why This Task Exists

User-side App794 Live evidence proves Session Continuity List -> Create now works, but `/k/794/edit` fails with:

```text
Employee Profile Resolution Failed
You cannot call kintone.app.record.get() in handler or during processing a handler.
```

Independent source review confirms the authenticated Create autoload is awaited inside `app.record.create.show` and calls `EmployeePartAUI.executeLookup()`. During that lookup:
- `onEmployeeCodeChanged()` can call `syncRecordToKintone(record)`;
- `onLookupEmployee()` later calls `syncRecordToKintone(record, {requireVerifiedPersistence:true,...})`;
- `syncRecordToKintone()` calls `kintone.app.record.get()/set()` while the Kintone event handler is still processing.

This task fixes only that Create-handler form-state lifecycle defect.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
4. relevant `app.record.create.show` / `setupRecordUiWithAuth` / `syncRecordToKintone` sections of `src/main-mbo-app.js`
5. relevant `executeLookup()` / `isEmployeeVerified` behavior in `src/ui/employee-part-a-ui.js` — READ ONLY unless tests prove a strictly necessary change
6. existing focused tests that already exercise main/create/authenticated Employee Self flow
7. `tests/classic-bundle.test.js` only for generated bundle regression
8. `scripts/kintone/build-mbo-ui.js`

Do not scan repository/history broadly.
Do not reopen D2-D7.
Do not work on the deployment guard integration in this task.

## 2. Mandatory Architecture / Behavior

During authenticated autoload inside the active `app.record.create.show` handler:

```text
FORM_STATE_AUTHORITY = event.record
kintone.app.record.get() CALL COUNT = 0
kintone.app.record.set() CALL COUNT = 0
```

The handler may perform the required READ-ONLY Kintone REST calls to:
- App53 employee lookup;
- App795 routing lookup;
- App796 scoring lookup;
- App794 duplicate check.

Those reads remain allowed and must retain existing fail-closed behavior.

Populate the existing `event.record` object directly with the resolved employee/routing/scoring/snapshot values, then return the populated event after the awaited autoload succeeds.

After the create-show handler has completed, existing interactive UI edits may continue to use the normal live form-state sync behavior.

Do NOT globally disable `syncRecordToKintone()` for Create pages.
Do NOT remove post-handler form-state synchronization needed by later user interaction.

## 3. Narrow Implementation Boundary

Preferred correction is a small explicit lifecycle/context boundary in `src/main-mbo-app.js`, because Kintone event lifecycle orchestration belongs in the main entry module.

Acceptable pattern:
- establish an `authenticatedCreateAutoloadInHandler` / equivalent local lifecycle state only while the awaited initial `ui.executeLookup(authenticatedEmployeeCode)` is running;
- `onEmployeeCodeChanged` and `onLookupEmployee` mutate the captured `event.record` directly during that state and MUST NOT call `syncRecordToKintone()`;
- after the initial autoload settles, clear that lifecycle state in a `finally`-safe way;
- normal post-handler callbacks retain existing `syncRecordToKintone()` behavior.

Do not add unrelated business logic to `main-mbo-app.js`.
Do not create a large new abstraction for a one-flag event lifecycle fix.
A tiny helper is allowed only if it materially improves testability and remains orchestration-only.

## 4. Existing Business Behavior Must Stay Identical

Do not change:
- MBO login/session behavior;
- Employee Code binding to authenticated employee;
- App53 lookup/candidate rules;
- App795 routing/team/position behavior;
- App796 scoring/profile mapping;
- Record_Key generation;
- duplicate check;
- snapshot field set;
- Requester/Approver values;
- validation rules;
- Save gate;
- Detail/Edit cross-employee block;
- CSS/UI design;
- Admin Support Center behavior;
- module-aware esbuild architecture.

Do not change Fiscal Year semantics in this task.

## 5. Required Tests — Must Exercise Production Path

Add/extend focused tests that invoke the actual production Create-handler path or the smallest exported/testable production orchestration boundary. Do not merely duplicate the intended logic inside the test.

Required proofs:

### A. Authenticated Create Autoload — No Forbidden Form API

Simulate an authenticated `app.record.create.show` flow with fake Kintone environment where:

```text
kintone.app.record.get = throws/counter
kintone.app.record.set = throws/counter
```

During the awaited initial authenticated autoload require:

```text
CREATE_AUTOLOAD_RECORD_GET_CALLS = 0
CREATE_AUTOLOAD_RECORD_SET_CALLS = 0
CREATE_AUTOLOAD_HANDLER_RESULT   = event
```

### B. Event Record Populated

After successful autoload, prove the same `event.record` contains the expected resolved values at minimum:

```text
Employee_Code = authenticated Employee_Code
Employee_Name populated
Fiscal_Year populated/preserved
Record_Key deterministic
Requester_User populated
Routing_Topology populated
Profile_Code populated
PartA_Weight populated
PartB_Weight populated
Competency_Set_Code populated
Configuration_Hash populated when provided by App796 fixture
```

Use injected READ-ONLY fake API fixtures; do not call live Kintone.

### C. Verified Create State

After successful authenticated autoload:

```text
active UI isEmployeeVerified = true
```

and the Save gate must not fail solely because the initial authenticated profile is unverified.

### D. Failure Remains Fail-Closed

At least one lookup/routing/scoring/duplicate failure path must prove:
- no forbidden `kintone.app.record.get/set` call during handler;
- Create does not become verified;
- blocking/error path remains visible/returned safely;
- no record write occurs.

### E. Post-Handler Interactive Sync Preserved

Prove that after the initial handler lifecycle state is cleared, the normal interactive callback path can still reach existing `syncRecordToKintone()` behavior in a fake environment.

This prevents solving the defect by permanently disabling form synchronization on Create pages.

### F. Existing Regressions

Run:

```text
npm run ui:build
npm test
```

Require existing:
- Session/Auth/Login tests green;
- Employee Code `50.03`, `50.02`, `0050_2` green;
- module-aware dependency graph tests green;
- AdminDiagnostic runtime proof green;
- runtime profile resolver proof green;
- deploy-customization preservation tests green.

GitHub has no CI proof; report local execution as executor evidence only.

## 6. Dist / CSS Rules

`dist/mbo-employee-app.js` may change only as generated esbuild output caused by the accepted source correction.

```text
src/styles/mbo-employee.css = UNCHANGED
dist/mbo-employee.css       = byte-identical to source
```

Never manually edit dist business logic.

## 7. Explicitly Forbidden

- NO Kintone POST/PUT/DELETE/file upload/deploy;
- NO App794 production write;
- NO App801 write;
- NO App53/App795/App796 write;
- NO App794 record write;
- NO deployment-guard integration fix in this task;
- NO `sandbox-write-guard.js` edit;
- NO Session/Auth architecture change;
- NO bundle architecture redesign;
- NO broad refactor;
- NO `employee-part-a-ui.js` edit unless a production-path test proves it is strictly necessary and executor reports the blocker before expanding scope;
- NO CSS source change;
- NO D2-D7 work;
- NO production deploy;
- NO UAT;
- NO self-PASS.

If the fix requires changing business/routing/scoring semantics or a broad UI refactor:

```text
STOP
REPORT BLOCKER
DO NOT EXPAND SCOPE
```

## 8. Expected Changed Files

Prefer only:

```text
src/main-mbo-app.js
focused create-handler test file(s)
dist/mbo-employee-app.js   (generated)
```

No deploy-script change expected.
No package/dependency change expected.
No CSS change expected.

## 9. Delivery

Commit + push one concise corrective commit, then STOP.

Return only sanitized evidence:

```text
COMMIT_SHA
CREATE_AUTOLOAD_FORM_STATE_MODE
CREATE_AUTOLOAD_RECORD_GET_CALLS
CREATE_AUTOLOAD_RECORD_SET_CALLS
EVENT_RECORD_POPULATION_PROOF
CREATE_VERIFIED_STATE_PROOF
FAIL_CLOSED_FAILURE_PROOF
POST_HANDLER_SYNC_PRESERVED
MODULE_AWARE_BUILD_RESULT
NPM_TEST_RESULT
CSS_SOURCE_CHANGED = NO
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
APP801_WRITES_EXECUTED = 0
DEPLOY_GUARD_FIX_EXECUTED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP. ChatGPT independently reviews before any deployment-guard correction or live deploy authorization.
