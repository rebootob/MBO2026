# AI ACTIVE TASK — D1 MODULE-AWARE BUNDLE FINAL CORRECTIVE

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.
> Execution Plane: Antigravity
> Branch: `ai/antigravity-wp002c`
> Mode: **SOURCE / BUILD / TEST ONLY — ZERO KINTONE WRITE**

## 0. Why This Task Exists

Independent review of executor commit:

```text
ef39edb59f6693b824c69b80d628f5f9e7a314cd
```

accepted the module-aware esbuild architecture direction, runtime dependency closure approach, browser-safe runtime profile resolver, and unchanged CSS.

But two narrow blockers remain:

```text
A. scripts/kintone/deploy-custom-ui.js has broken variable/lifecycle scope after build extraction
B. esbuild is declared as ^0.28.2 instead of exact-pinned 0.28.2
```

This task fixes only those blockers plus a focused no-network regression test.

Do NOT fix the separate Create-handler `kintone.app.record.get()` defect in this task.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
4. `scripts/kintone/build-mbo-ui.js`
5. `scripts/kintone/deploy-custom-ui.js`
6. `tests/classic-bundle.test.js`
7. `tests/deploy-customization-preservation.test.js` only if useful for the focused no-network proof
8. `package.json`
9. `package-lock.json`

Do not scan repository/history broadly.
Do not reopen D2-D7.
Do not read/modify `employee-part-a-ui.js` or business UI source.

## 2. Corrective A — Repair Deploy Entrypoint Scope

Current defect:
- `app` is assigned in the direct-execution block without a declaration;
- `fullJs` is declared block-local and later used by the live deployment block outside its lexical scope.

Repair this without changing accepted Kintone safety semantics.

Preferred shape:
- keep build logic in `build-mbo-ui.js`;
- give deployment execution one clear lifecycle where `app` and built JS artifact remain in valid scope through preflight/upload/PUT/deploy;
- importing `deploy-custom-ui.js` for unit tests must cause zero Kintone network/write side effects;
- direct build-only behavior, if retained, must still perform zero Kintone writes;
- direct deploy execution must still call `assertSandboxWriteTarget(app)` before any Kintone write.

Do not redesign accepted preflight/topology/revision/fileKey logic.
Do not weaken CSS-upload prohibition.

Required preserved behavior:

```text
FULL_DETERMINISTIC_PREFLIGHT_BEFORE_UPLOAD = YES
TARGET_JS_UPLOAD_ONLY                       = YES
CSS_UPLOAD_COUNT                            = 0
PREVIEW_PAYLOAD_FROM_PREVIEW_STATE          = YES
LATEST_POSITIVE_REVISION_INCLUDED           = YES
NON_TARGET_PREVIEW_FILEKEYS_PRESERVED       = YES
DEPLOY_APP794_ONLY                          = YES
```

## 3. Corrective B — Exact-Pin esbuild

Change dependency declaration to exactly:

```json
"esbuild": "0.28.2"
```

Update/regenerate `package-lock.json` so the root package dependency is also exact `0.28.2` and lockfile remains internally consistent.

Do not change esbuild version to another version.

## 4. Focused No-Network Regression Proof

Add a narrow testable boundary/proof that catches the exact deploy-entrypoint scope regression without calling Kintone.

The test must prove at minimum:
- production artifact preparation can obtain the built `dist/mbo-employee-app.js` content in a scope usable by deployment orchestration;
- App794 id resolution/default or injected test value is held in valid declared scope;
- importing the deploy module itself executes zero remote network/write calls;
- build/preparation path does not depend on undeclared globals;
- existing `validatePreflight()` / `buildPreviewCustomizePayload()` exports remain callable in tests.

Preferred implementation: extract/retain a small pure/local preparation helper rather than static string matching.

Do NOT run the real deploy command as a test.
Do NOT call Kintone.

## 5. Preserve Accepted Module-Aware Bundle

Do not undo the accepted direction from `ef39edb...`.

Required:

```text
ENTRY      = src/main-mbo-app.js
BUNDLE     = true
FORMAT     = iife
PLATFORM   = browser
MINIFY     = false
SOURCEMAP  = false
```

Keep:
- `scripts/kintone/build-mbo-ui.js` as dedicated build module;
- `src/profiles/runtime-profile-resolver.js` as browser-safe resolver;
- source modules separate;
- admin/visibility/appraiser/profile/auth/session/login modules in browser graph;
- `src/profiles/scoring-config-master.js` absent from browser graph;
- `node:crypto` absent from browser graph.

No business/source refactor.

## 6. Required Tests

Run:

```text
npm run ui:build
npm test
```

Required proofs:

```text
MODULE_AWARE_BUILD_SUCCEEDS             = PASS
DIST_CLASSIC_IIFE_PARSE                 = PASS
DEPENDENCY_GRAPH_CLOSURE                = PASS
ADMIN_DIAGNOSTIC_RUNTIME_PROOF          = PASS
RUNTIME_PROFILE_RESOLVER_PROOF          = PASS
SCORING_CONFIG_MASTER_BROWSER_GRAPH     = ABSENT
NODE_CRYPTO_BROWSER_GRAPH               = ABSENT
DEPLOY_ENTRYPOINT_SCOPE_REGRESSION      = PASS
DEPLOY_IMPORT_NETWORK_CALL_COUNT        = 0
ESBUILD_EXACT_PIN                       = 0.28.2
```

All existing D1 Auth/Session/Login/employee-code tests must remain green.

GitHub has no CI proof; report local execution as executor evidence only.

## 7. CSS / Dist Rules

```text
src/styles/mbo-employee.css = UNCHANGED
dist/mbo-employee.css       = byte-identical to source
```

`dist/mbo-employee-app.js` may change only as generated output caused by legitimate source/build corrections.

Never manually edit dist business logic.

## 8. Explicitly Forbidden

- NO Kintone POST/PUT/DELETE/file upload/deploy;
- NO App794 production write;
- NO App801 write;
- NO App53/App795/App796 write;
- NO Create-handler corrective;
- NO change to `syncRecordToKintone()` behavior;
- NO `employee-part-a-ui.js` edit;
- NO Session/Auth architecture change;
- NO CSS source change;
- NO D2-D7 work;
- NO broad refactor;
- NO production deploy;
- NO self-PASS.

If the corrective requires touching business/UI logic or changing accepted Kintone safety behavior:

```text
STOP
REPORT BLOCKER
DO NOT EXPAND SCOPE
```

## 9. Expected Changed Files

Prefer only:

```text
package.json
package-lock.json
scripts/kintone/deploy-custom-ui.js
focused deploy/build test file(s)
dist/mbo-employee-app.js only if deterministic build legitimately changes it
```

`build-mbo-ui.js` should change only if strictly necessary for a clean testable local preparation boundary.

No `main-mbo-app.js` change expected.
No `runtime-profile-resolver.js` change expected.
No `employee-part-a-ui.js` change allowed.

## 10. Delivery

Commit + push one concise corrective commit, then STOP.

Return only sanitized evidence:

```text
COMMIT_SHA
MODULE_AWARE_BUILD_RESULT
NPM_TEST_RESULT
ESBUILD_DECLARATION
DEPLOY_ENTRYPOINT_SCOPE_REGRESSION
DEPLOY_IMPORT_NETWORK_CALL_COUNT
EXPECTED_RUNTIME_MODULES_INCLUDED
NODE_CRYPTO_BROWSER_GRAPH
SCORING_CONFIG_MASTER_BROWSER_GRAPH
CSS_SOURCE_CHANGED = NO
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
CREATE_HANDLER_FIX_EXECUTED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP. ChatGPT independently reviews before the separate Create-handler corrective begins.
