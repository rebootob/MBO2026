# AI ACTIVE TASK — D1 APP794 MODULE-AWARE BUNDLE CORRECTIVE

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **SOURCE / BUILD / TEST ONLY — ZERO KINTONE WRITE**

## 0. Why This Task Exists

User-side App794 Live evidence after Session Continuity deployment proves:

```text
List -> Create no longer returns to MBO Login = PASS
```

But Create runtime console shows:

```text
ReferenceError: AdminDiagnosticModel is not defined
```

Control Plane root cause:
- current production build strips ES imports/exports with regex;
- current build manually concatenates an incomplete hard-coded list;
- tests duplicate the same incomplete list;
- transitive dependencies and import aliases are therefore not reliably preserved.

This task fixes **bundle integrity only**.

Do NOT fix the separate Create-handler `kintone.app.record.get()` defect in this task.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Read Only These Inputs

Read only what is required:

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
4. `scripts/kintone/deploy-custom-ui.js`
5. `tests/classic-bundle.test.js`
6. `package.json`
7. import sections / required runtime functions from:
   - `src/main-mbo-app.js`
   - `src/ui/employee-part-a-ui.js`
   - `src/ui/employee-visibility.js`
   - `src/evaluation/appraiser-normalizer.js`
   - `src/admin/admin-diagnostic-model.js`
   - `src/admin/admin-support-center.js`
   - `src/profiles/profile-codes-policy.js`
   - `src/profiles/profile-scoring-resolver.js`
   - `src/profiles/scoring-config-master.js`
   - `src/services/employee-service.js`

Do not scan repository/history broadly.
Do not reopen D2-D7.

## 2. Architecture Decision — Mandatory

Replace the current regex/manual-concatenation production build with a **module-aware browser bundler**.

Use `esbuild` as a pinned development dependency and commit the lockfile produced by npm.

Canonical browser bundle behavior:

```text
ENTRY      = src/main-mbo-app.js
BUNDLE     = true
FORMAT     = iife
PLATFORM   = browser
MINIFY     = false
SOURCEMAP  = false unless already required elsewhere
OUTPUT     = dist/mbo-employee-app.js
```

The generated `dist/mbo-employee-app.js` remains a single classic/IIFE deployment artifact for Kintone.
Source modules remain separate and canonical.

Do NOT copy business/UI/Auth code into `main-mbo-app.js`.
Do NOT manually paste imported module implementations into another source file.

## 3. Browser Dependency Boundary — Node-only Scoring Module

Current `src/main-mbo-app.js` imports `resolveProfileCode` from `src/profiles/profile-scoring-resolver.js`.
That resolver imports `scoring-config-master.js`, which imports `node:crypto` and is not an acceptable browser dependency path.

Create one small browser-safe module:

```text
src/profiles/runtime-profile-resolver.js
```

Responsibility only:
- accept an EmployeeService verified employee snapshot;
- fail closed when `isVerifiedEmployeeSnapshot(snapshot) !== true`;
- resolve profile code using the existing `profile-codes-policy.js` policy;
- preserve meaningful policy error codes in a small runtime resolver error type;
- no Kintone calls;
- no Node imports;
- no scoring-master/hash logic.

Then change only the necessary import/call wiring in `src/main-mbo-app.js` to use this browser-safe runtime resolver.

Do NOT modify the business behavior of:
- Employee lookup;
- profile title mapping;
- routing;
- scoring App796 lookup;
- snapshot fields;
- session/auth logic.

Do NOT modify `profile-scoring-resolver.js` or `scoring-config-master.js` unless tests prove a strictly necessary non-browser/source compatibility issue. Preferred result: they remain unchanged and are simply absent from the browser bundle graph.

## 4. Build Script Separation

Create one dedicated build module, preferably:

```text
scripts/kintone/build-mbo-ui.js
```

It must:
- use esbuild programmatically;
- build `src/main-mbo-app.js` -> `dist/mbo-employee-app.js`;
- return/capture esbuild metafile information for tests or expose a testable build function;
- copy `src/styles/mbo-employee.css` -> `dist/mbo-employee.css` byte-for-byte;
- have no Kintone network/write side effects;
- when executed directly, perform build only.

Update `package.json`:

```text
ui:build -> dedicated build script
```

Update `scripts/kintone/deploy-custom-ui.js` only in the **local build/artifact preparation section** so `ui:deploy` uses the same module-aware build path / generated artifact.

Critical:
- preserve all existing strict preflight, topology, revision, Preview fileKey, JS-only upload, Preview PUT, deploy and polling semantics unchanged;
- do not weaken or rewrite the accepted Kintone safety logic;
- CSS upload must remain zero in deployment behavior.

## 5. Bundle Graph Requirements

The browser bundle graph must include the runtime dependencies actually imported by the App794 entry, including at minimum where reachable:

```text
src/ui/employee-visibility.js
src/evaluation/appraiser-normalizer.js
src/admin/admin-diagnostic-model.js
src/admin/admin-support-center.js
src/profiles/profile-codes-policy.js
src/profiles/runtime-profile-resolver.js
src/ui/employee-part-a-ui.js
src/ui/mbo-kintone-auth-adapter.js
src/ui/mbo-session-manager.js
src/ui/mbo-kintone-login-gate.js
```

The browser bundle graph must NOT include:

```text
node:crypto
src/profiles/scoring-config-master.js
```

unless Control Plane later explicitly changes this browser architecture.

## 6. Required Tests

Update `tests/classic-bundle.test.js` so it no longer reconstructs production by maintaining an independent manual file list.

Required proofs:

### A. Real Production Build

```text
MODULE_AWARE_BUILD_SUCCEEDS = PASS
DIST_CLASSIC_IIFE_PARSE = PASS
ES_MODULE_IMPORT_RESIDUE = 0
ES_MODULE_EXPORT_RESIDUE = 0
```

### B. Dependency Graph Closure

Using esbuild metafile or equivalent production-build evidence, prove expected runtime modules are included:

```text
EMPLOYEE_VISIBILITY_INCLUDED = PASS
APPRAISER_NORMALIZER_INCLUDED = PASS
ADMIN_DIAGNOSTIC_MODEL_INCLUDED = PASS
ADMIN_SUPPORT_CENTER_INCLUDED = PASS
PROFILE_CODES_POLICY_INCLUDED = PASS
RUNTIME_PROFILE_RESOLVER_INCLUDED = PASS
```

And prove:

```text
SCORING_CONFIG_MASTER_BROWSER_GRAPH = ABSENT
NODE_CRYPTO_BROWSER_GRAPH = ABSENT
```

### C. Exact Regression for User-observed Runtime Error

Add a focused runtime/source-module test that exercises the actual `EmployeePartAUI._renderSupportCenterIfAdmin` path sufficiently to prove `AdminDiagnosticModel` resolves and a non-admin path returns without ReferenceError.

Also prove:

```text
typeof AdminDiagnosticModel === function/class
AdminDiagnosticModel.isTechnicalAdmin('admin-form') === true
AdminDiagnosticModel.isTechnicalAdmin(non-admin) === false
typeof AdminSupportCenterUI === function/class
```

### D. Runtime Profile Resolver

Use an EmployeeService-created verified snapshot with injected read-only fake API and prove the runtime resolver:
- resolves the expected canonical profile for a known valid position;
- blocks an unverified/fabricated snapshot;
- preserves fail-closed policy errors for unsupported/invalid position data.

### E. Existing D1 Regressions

All existing Auth/Session/Login and employee-code tests must remain green.

Run:

```text
npm run ui:build
npm test
```

## 7. CSS / Dist Requirements

CSS source must not be edited.

Required:

```text
src/styles/mbo-employee.css = UNCHANGED
dist/mbo-employee.css content = byte-identical to source CSS
```

`dist/mbo-employee-app.js` is expected to change because the production bundling implementation changes and missing dependencies become correctly bundled.

Do not manually edit `dist` business logic.
Generated dist only.

## 8. Explicitly Forbidden

- NO Kintone POST/PUT/DELETE/file upload/deploy;
- NO App794 production write;
- NO App801 write;
- NO App53/App795/App796 write;
- NO Create-handler corrective in this task;
- NO change to `syncRecordToKintone()` behavior;
- NO `employee-part-a-ui.js` business/UI refactor;
- NO Session/Auth architecture change;
- NO CSS source change;
- NO D2-D7 work;
- NO broad source refactor;
- NO self-PASS;
- NO follow-on production deploy.

If implementing the module-aware bundle exposes a new browser dependency requiring business/source redesign beyond the narrow runtime-profile boundary above:

```text
STOP
REPORT BLOCKER
DO NOT EXPAND SCOPE
```

## 9. Expected Changed Files

Prefer only:

```text
package.json
package-lock.json                     (if generated by npm dependency install)
scripts/kintone/build-mbo-ui.js      (new)
scripts/kintone/deploy-custom-ui.js  (build integration only)
src/profiles/runtime-profile-resolver.js (new)
src/main-mbo-app.js                  (minimum import/call wiring only)
tests/classic-bundle.test.js
focused runtime-profile test if clearly separated
dist/mbo-employee-app.js             (generated)
```

No `employee-part-a-ui.js` change expected.

## 10. Delivery

Commit + push one concise corrective commit, then STOP.

Return only sanitized evidence:

```text
COMMIT_SHA
MODULE_AWARE_BUILD_RESULT
NPM_TEST_RESULT
EXPECTED_RUNTIME_MODULES_INCLUDED
NODE_CRYPTO_BROWSER_GRAPH
SCORING_CONFIG_MASTER_BROWSER_GRAPH
ADMIN_DIAGNOSTIC_RUNTIME_PROOF
RUNTIME_PROFILE_RESOLVER_PROOF
CSS_SOURCE_CHANGED = NO
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
CREATE_HANDLER_FIX_EXECUTED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP. ChatGPT performs independent review before the separate Create-handler corrective begins.
