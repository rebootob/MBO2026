# AI ACTIVE TASK — D7 UI TEST UNBLOCK / BROWSER-SAFE PREVIEW ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation: `fea819a9834d84f6b3c14c004bc965fac249f984`
> Mode: ONE RUNTIME BLOCKER ONLY / MINIMUM FIX
> Kintone write/deploy/schema/process/ACL authorization: NONE

## 0. REVIEW RESULT

The final App796 evidence-boundary source fix is accepted for D7.
Manual UI smoke testing is currently BLOCKED because the local browser preview crashes before render.

Observed browser error from user at `http://localhost:3000`:

```text
Access to script at 'node:crypto' ... has been blocked
Failed to load resource: net::ERR_FAILED
```

Repository evidence confirms the browser import chain reaches Node-only crypto:

```text
preview/index.html
  -> /src/ui/employee-part-a-ui.js
  -> AdminDiagnosticModel / AdminSupportCenterUI
  -> profile-scoring-resolver.js
  -> scoring-config-master.js
  -> import crypto from 'node:crypto'
```

`src/services/mbo-password-service.js` also uses `node:crypto`, but DO NOT solve D1 in this task unless it is proven to be part of this preview import chain.

Do NOT refactor unrelated code, redesign authentication, change hashing algorithms, change scoring rules, or work on D1-D6.

Target status after implementation:

`D7_UI_PREVIEW = READY_FOR_MANUAL_SMOKE_TEST`

Do not self-certify D7 final PASS.

## 1. ONLY REQUIRED FIX — REMOVE NODE-ONLY CRYPTO FROM D7 BROWSER PREVIEW DEPENDENCY CHAIN

Goal:

```text
npm run ui:preview
open http://localhost:3000
=> page renders
=> browser does NOT request/import node:crypto
=> no node:crypto CORS / ERR_FAILED
```

### Preferred minimal approach

Keep Node-only hashing where it belongs. Do NOT rewrite crypto/hash behavior just to make the browser preview load.

Instead, isolate the browser-safe profile policy needed by D7 from the Node-only scoring hash module.

Minimum acceptable implementation pattern:

1. Put/reuse only pure browser-safe profile policy data/functions in a small module, for example:
   - `PROFILE_CODES`
   - position -> profile mapping
   - `getProfileCodeFromPosition()`
2. `src/admin/admin-diagnostic-model.js` and `src/admin/admin-support-center.js` must import the pure browser-safe policy directly and must not pull `scoring-config-master.js` / `node:crypto` merely to resolve profile codes.
3. Preserve existing public exports/API where practical so existing tests/source do not break.
4. If an imported symbol such as `resolveProfileCode` is unused in D7 Admin code, remove that unused import instead of adding architecture.
5. `src/profiles/scoring-config-master.js` may remain Node-only for synchronous SHA-256 configuration hashing. Do not change its hash semantics in this task.
6. Do not modify `mbo-password-service.js` for this task unless source proves it is separately imported by the preview after the scoring-chain fix.

A new small pure-policy file is allowed ONLY if required for separation of browser-safe policy from Node-only hashing. Do not create additional files beyond that.

## 2. ACCEPTANCE CRITERIA

All must be true:

1. `npm run ui:preview` starts successfully.
2. `http://localhost:3000` renders the existing Status Preview Lab body, not only the top toolbar.
3. Browser Console has no `node:crypto` request/CORS/ERR_FAILED caused by the app.
4. Technical Admin preview can render Admin Support Center when Viewer Role = Technical Admin (`admin-form`).
5. Existing D7 App796 evidence behavior remains unchanged.
6. Existing scoring configuration hash output/semantics remain unchanged.
7. No Kintone read/write/deploy is executed.

## 3. MINIMUM TEST / VERIFICATION

Run only what is necessary:

```bash
npm test -- tests/admin-support-center.test.js
npm test
npm run ui:build
npm run ui:preview
```

For preview verification, inspect the local page/browser if your environment supports it. If not, report that limitation honestly and provide exact manual check instructions; do NOT claim browser PASS without browser evidence.

Also run:

```bash
git diff --check
git status --short
```

Do not create a new E2E framework or add Playwright/Cypress only for this fix.

## 4. DELIVERY

Commit only the minimum browser-unblock changes.

Report:
- exact commit SHA
- exact files changed
- root cause
- exact import-chain fix
- targeted test result
- full npm test result
- ui:build result
- ui:preview startup result
- whether browser render was actually verified
- `KINTONE_READS_EXECUTED = 0`
- `KINTONE_WRITES_EXECUTED = 0`
- `KINTONE_DEPLOY_EXECUTED = 0`
- `D7_UI_PREVIEW = READY_FOR_MANUAL_SMOKE_TEST` only if source/server conditions are met

Do NOT mark D7 final PASS. User/ChatGPT will perform the UI smoke test after preview loads.

---

# MANDATORY PROJECT CONTROL — DO NOT DROP

- D1 Login + password change + strict employee data isolation = BLOCKED
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 migrate ALL history from Apps 283, 310, 305, 643, 307, 640, 715, 716 into App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 HR Control Center / App800 end-to-end lifecycle = IN_PROGRESS
- D5 employee copy ONLY own previous planning fields = MUST_FIX
- D6 full E2E / security / regression closure = BLOCKED
- D7 Admin Support Center = SOURCE ACCEPTED / UI SMOKE TEST BLOCKED BY BROWSER IMPORT — THIS TASK
