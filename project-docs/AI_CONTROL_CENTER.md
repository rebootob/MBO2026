# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-28

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 GROUP+APP801 ACL PASS / CANDIDATE=128 PASS / APP801 PROVISIONING PASS / SESSION ARCHITECTURE+SOURCE+TEST PASS / APP801 SESSION SCHEMA PASS / SESSION LIST→CREATE LIVE PASS / MODULE-AWARE BUNDLE CORRECTIVE STILL OPEN / CREATE-HANDLER DEFECT OPEN |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO only | 🔴 MUST FIX |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / APP794 BUNDLE RUNTIME DEFECT BEING CORRECTED UNDER D1 |

No AI may silently drop D1–D7.

## 2. Authorization / Gate Ledger

```text
D1_SESSION_CONTINUITY_ARCHITECTURE       = APPROVED / BASELINED
D1_SESSION_SOURCE_IMPLEMENTATION         = PASS / ACCEPTED
D1_SESSION_TEST_EVIDENCE                 = PASS / ACCEPTED
APP801_SESSION_SCHEMA_WRITE              = PASS / ACCEPTED AFTER INDEPENDENT LIVE/PREVIEW READBACK
APP794_SESSION_CONTINUITY_DEPLOY         = EXECUTED / REVISION 43 / RUNTIME NOT ACCEPTED AS FULL D1
D1_SESSION_LIST_TO_CREATE_CONTINUITY     = PASS / USER-SIDE LIVE OBSERVATION
D1_BUNDLE_DEPENDENCY_CORRECTIVE          = CORRECTIVE REQUIRED AFTER REVIEW OF ef39edb59f6693b824c69b80d628f5f9e7a314cd
D1_CREATE_HANDLER_CORRECTIVE             = OPEN / SEPARATE SOURCE+TEST PACKAGE AFTER BUNDLE PASS
D1_LIVE_CUTOVER                          = IN PROGRESS / FINAL UAT BLOCKED
D2-D7 LIVE WRITES                        = NOT AUTHORIZED unless separately recorded
```

No new App794 deploy is authorized by this source corrective.

## 3. Independent Review — Module-Aware Bundle Commit

Executor commit reviewed:

```text
ef39edb59f6693b824c69b80d628f5f9e7a314cd
```

Scope compare from Control Plane task base `cdabf967...` proves exactly one executor commit.

Observed changes are limited to the intended build/runtime-profile package plus generated dist and related bundle regression test adaptation:
- `package.json`
- `package-lock.json`
- `scripts/kintone/build-mbo-ui.js`
- `scripts/kintone/deploy-custom-ui.js`
- `src/profiles/runtime-profile-resolver.js`
- one-line import wiring in `src/main-mbo-app.js`
- `tests/classic-bundle.test.js`
- narrow bundle-regression adaptation in `tests/mbo-session-manager.test.js`
- generated `dist/mbo-employee-app.js`

No `employee-part-a-ui.js` or CSS source change occurred.

## 4. Review Findings — Accepted Direction

The architectural direction is correct and consistent with `SOURCE_CODE_ARCHITECTURE.md`:

```text
MODULE_AWARE_BROWSER_BUNDLER      = PROVISIONALLY PASS
ENTRY                              = src/main-mbo-app.js
FORMAT                             = IIFE
PLATFORM                           = browser
SOURCE_MODULE_SEPARATION           = PRESERVED
MANUAL_REGEX_FLATTENING            = REMOVED FROM CANONICAL BUILD
DEDICATED_BUILD_MODULE             = PRESENT
RUNTIME_PROFILE_RESOLVER_BOUNDARY  = PRESENT / BROWSER-SAFE
EMPLOYEE_PART_A_UI_EDIT            = NO
CSS_SOURCE_CHANGED                 = NO
```

Static review of the new build/test graph shows the intended runtime modules are explicitly proved through esbuild metafile checks, including:
- employee visibility;
- appraiser normalizer;
- admin diagnostic model;
- admin support center;
- profile policy;
- runtime profile resolver;
- EmployeePartAUI;
- Auth Adapter / Session Manager / Login Gate.

The browser graph test excludes `src/profiles/scoring-config-master.js`, and the generated bundle does not contain `node:crypto`.

Current generated JS blob after the module-aware build commit:

```text
DIST_JS_GIT_BLOB = 75a0fbadad9f68bc6b55efc9295869bb7f6290c6
```

CSS source and generated CSS remain byte-identical:

```text
CSS_GIT_BLOB = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
```

## 5. Blocking Finding A — Deploy Entrypoint Scope Regression

`src` bundle architecture is not the blocker. The blocker is `scripts/kintone/deploy-custom-ui.js` after build extraction.

Current code assigns:

```text
app = sandboxRegistryModule.mboV2AppId
```

without a module-scope declaration of `app`.

Also, `fullJs` is declared with `const` inside the first `if (isExecutedAsScript) { ... }` block, while the later live deployment block uses `fullJs` outside that lexical scope.

Therefore the live deploy entrypoint is not safely executable as written and may fail with `ReferenceError` before or during the deploy path.

This violates the Active Task requirement to preserve accepted deployment semantics while changing only artifact preparation.

Verdict:

```text
DEPLOY_ENTRYPOINT_RUNTIME_SCOPE = FAIL / CORRECTIVE REQUIRED
APP794_FUTURE_DEPLOY            = BLOCKED
```

Do not test this by making a live Kintone call.

## 6. Blocking Finding B — esbuild Is Not Exact-Pinned

The Active Task required a pinned development dependency.

Current `package.json` and package-lock root declare:

```text
"esbuild": "^0.28.2"
```

The caret range is not an exact pin. Correct to exact `0.28.2` and regenerate/update the lockfile consistently.

Verdict:

```text
ESBUILD_EXACT_PIN = CORRECTIVE REQUIRED
```

## 7. Test Evidence Status

The new bundle tests are materially better than the old manual-file-list tests and correctly test the production esbuild graph.

However, the current test package does not catch the deploy-entrypoint lexical-scope regression described above. Add one narrow no-network testable boundary/proof for deployment artifact preparation/entrypoint state so this exact regression cannot recur.

GitHub currently reports no CI statuses and no workflow run for `ef39edb...`.

Therefore do not claim independent `npm test` PASS from GitHub.

## 8. Exact Next Action

```text
NEXT_ACTION_OWNER        = Antigravity
ANTIGRAVITY_REQUIRED     = YES — ONE NARROW SOURCE/BUILD/TEST CORRECTIVE
KINTONE_WRITE            = NO
APP794_DEPLOY             = NO
APP801_WRITE              = NO
CREATE_HANDLER_FIX        = NO IN THIS PACKAGE
EMPLOYEE_PART_A_UI_EDIT   = NO
BUSINESS_UI_REFACTOR      = NO
D2_D7_WRITE               = NO
MAX_EXECUTOR_STATUS       = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Required corrective only:
1. repair `deploy-custom-ui.js` variable/lifecycle scope without weakening any accepted preflight/write safety;
2. exact-pin `esbuild` to `0.28.2` and align the lockfile;
3. add a narrow no-network regression proof that deployment artifact preparation returns/retains a usable `app` + built JS artifact without relying on block-local variables;
4. preserve module-aware build graph and generated dist behavior;
5. run `npm run ui:build` and `npm test`;
6. commit + push one corrective commit and STOP.

The separate `kintone.app.record.get()` Create-handler defect remains untouched until this package passes independent review.

## 9. Baseline / Skill Maintenance

No Baseline promotion yet because the module-aware package is still under corrective review.

Reusable lesson pending acceptance:
- replacing a manual bundler must test both dependency closure **and** the executable deployment entrypoint that consumes the built artifact; green bundle tests alone do not prove deployment orchestration remains callable.
