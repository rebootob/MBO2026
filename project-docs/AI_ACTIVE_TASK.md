# AI ACTIVE TASK — D1 APP800 PASSWORD RESET ADMIN UI SOURCE R1 CORRECTIVE

Mode: **ANTIGRAVITY SOURCE / FOCUSED TEST / LOCAL BUILD ONLY — NO LIVE WRITE / NO ACL WRITE / NO DEPLOY / NO PASSWORD RESET EXECUTION**  
Branch: `ai/antigravity-wp002c`

## 0. Review Status / Starting Point

Independent ChatGPT review of executor commit:

`541b7e5cdb58ac533baeaec20325c00a73a295dd`

Result:

```text
D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_REVIEW = CORRECTIVE
DEPLOY_READY = NO
```

Do not restart or redesign the feature. Fix only the exact findings below, run focused/full verification, commit + push, then STOP.

Hybrid Identity / Natta / Vassana work remains OUT OF SCOPE.

## 1. Finding A — Production Reset Adapter Dependency Missing (BLOCKER)

Current `src/ui/hr-control-center.js` production default handler refers to:

`MboKintoneAuthAdapter`

but does not import that module. Current dedicated build entrypoint bundles only `src/ui/hr-control-center.js`. The generated `dist/hr-control-center-bundle.js` contains the dangling reference but no `MboKintoneAuthAdapter` implementation.

Therefore a real browser Reset action without injected test dependency would throw:

`MboKintoneAuthAdapter is unavailable.`

### Required correction

Use the canonical existing reset adapter as a real module dependency.

Preferred narrow implementation:

```js
import { MboKintoneAuthAdapter } from './mbo-kintone-auth-adapter.js';
```

in `src/ui/hr-control-center.js`.

Let esbuild include the canonical adapter automatically in the App800 IIFE bundle.

Rules:
- do not copy/paste the adapter implementation;
- do not create a second reset engine;
- do not expose the adapter globally merely to satisfy the old `typeof` check;
- remove the fragile global-availability dependency;
- keep App801 ID explicit and clear; adding `credentialAppId: 801` to `DEFAULT_APP_IDS` is acceptable and preferred over an unexplained magic fallback;
- do not alter PBKDF2/session/reset semantics.

## 2. Required Production-Path Test

Existing tests inject `onResetMboPassword`, so they do not exercise the default browser path.

Add a focused test that:
- creates `createHrccRuntime()` **without** `onResetMboPassword`;
- uses a fake/mocked Kintone API only — no real network;
- supplies the minimum App801 record/API behavior required for canonical reset adapter execution;
- triggers a valid Reset action;
- proves the canonical adapter path is reachable and does not throw `MboKintoneAuthAdapter is unavailable`;
- proves exactly one App801 update request is produced by the mocked path;
- proves no App800/App794/App53/App795 write path is called.

If mocking full crypto is necessary, inject only deterministic local test dependencies through the smallest safe seam. Do not weaken production crypto.

Also strengthen bundle verification so it proves dependency completeness. A syntax-only `new Function(bundle)` PASS is not sufficient. Verify the generated App800 bundle includes the canonical adapter implementation and no unresolved global dependency is required for Reset.

## 3. Finding B — Invalid Employee_Code Must Be Blocked Before resetFn

The authorizing R1 task required invalid/malformed Employee_Code to produce visible validation failure with **zero reset-core calls**.

Canonical App801/MBO Employee_Code format is:

```text
^[A-Za-z0-9_.-]+$
```

Current R1 UI only checks:
- empty input;
- confirmation mismatch.

A matching malformed value can currently reach `resetFn`.

### Required correction

Before setting in-flight state or invoking `resetFn`:
- validate exact canonical format;
- invalid format -> bilingual visible validation message;
- resetFn call count = 0;
- preserve exact code value semantics; do not uppercase/lowercase or silently rewrite Employee_Code;
- leading/trailing whitespace remains invalid rather than silently changing identity where practical. If the UI continues trimming values, add a focused test and ensure the canonical adapter's identity contract is not weakened.

Do not change the reset adapter core merely to satisfy this UI precheck unless absolutely necessary. Prefer a small pure UI validation helper.

## 4. Finding C — Remove Untruthful READ-ONLY Wording

The candidate now contains an authorized write-capable Reset panel, so these statements are no longer truthful:
- source header wording that says the browser runtime is `GET-Only`;
- UI badge `SECURE READ-ONLY MVP`.

Replace with concise truthful language, for example:

`SECURE HR CONTROL CENTER`

or

`Monitoring + Authorized Admin Actions`

Requirements:
- monitoring/data-fetch behavior remains read-only except the explicitly authorized Reset action;
- do not imply the Reset panel resets native Kintone/cybozu password;
- do not broadly rebrand/refactor HRCC.

## 5. Preserve Accepted R1 Behavior

Keep all currently accepted candidate behavior unless required by this corrective:
- Reset section inside App800 only;
- exact Employee_Code + explicit confirmation;
- one reset per user action;
- in-flight duplicate-click prevention;
- bilingual success/failure feedback;
- explicit statement that Reset MBO Password does NOT reset native Kintone/cybozu password;
- no secret rendering/logging;
- no bulk reset;
- no credential create/delete;
- no Account_Status change;
- existing HRCC filter/dashboard/health behavior remains intact;
- generated dist remains reproducible classic browser bundle.

## 6. Exact Allowed Files

Allowed to modify:

```text
src/ui/hr-control-center.js
scripts/kintone/build-hrcc-ui.js           only if needed for dependency/bundle verification
src/styles/hr-control-center.css           only if wording correction needs no style change, preferably untouched
tests/hr-control-center-reset-ui.test.js
dist/hr-control-center-bundle.js
dist/hr-control-center.css                 only regenerated if build does so
project-docs/D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_CORRECTIVE_EVIDENCE.md
```

`src/ui/mbo-kintone-auth-adapter.js` is **READ/IMPORT ONLY** in this corrective unless a proven blocker makes modification unavoidable. If you believe it must change, STOP and report instead of widening automatically.

Forbidden source areas:
- `src/main-mbo-app.js`
- App794 Employee-Self UI/session/navigation source
- App53-related source/schema
- App795 routing source/data
- Hybrid Identity/My Approval Tasks implementation
- D2/D3/D5/D7 unrelated code
- Control Center / Active Task / Confirmed Baselines / skills

## 7. Required Focused Tests

At minimum prove:

1. Reset panel renders.
2. Empty Employee_Code -> blocked / 0 reset calls.
3. Invalid-format Employee_Code -> blocked / 0 reset calls.
4. Confirmation mismatch -> blocked / 0 reset calls.
5. Valid exact confirmation with injected reset function -> exactly 1 call.
6. In-flight repeat -> no duplicate call.
7. Default non-injected production reset path uses bundled canonical `MboKintoneAuthAdapter` with fake Kintone API and reaches exactly one mocked App801 update.
8. Success/failure copy remains safe and bilingual.
9. Native Kintone/cybozu password distinction remains explicit.
10. No password hash/salt/session/token secret rendered.
11. `GET-Only` / `SECURE READ-ONLY MVP` stale wording removed from the candidate.
12. Existing HRCC monitoring/filter/dashboard tests remain PASS.
13. App800 bundle parses as classic script and has zero runtime import/export residue.
14. Bundle dependency check proves canonical adapter implementation is included and Reset does not rely on an unresolved global adapter.
15. Full repository `npm test` PASS.
16. `git diff --check` PASS.

## 8. Safety — Zero Live Operations

```text
APP800_RECORD_WRITE_RUNTIME       = 0
APP801_REAL_RECORD_WRITE          = 0
APP794_RECORD_WRITE_RUNTIME       = 0
APP53_RECORD_WRITE                = 0
APP795_ROUTING_WRITE              = 0
PASSWORD_RESET_EXECUTION_LIVE     = 0
APP800_APP_ACL_WRITE              = 0
APP801_APP_ACL_WRITE              = 0
GROUP_MEMBERSHIP_WRITE            = 0
SCHEMA_LAYOUT_PROCESS_WRITE       = 0
CUSTOMIZATION_UPLOAD              = 0
DEPLOY                            = 0
ROLLBACK                          = 0
LIVE_POST                         = 0
LIVE_PUT                          = 0
LIVE_DELETE                       = 0
```

Mock/local test calls do not count as Live operations but must be clearly labeled as mocks.

## 9. Evidence

Create:

`project-docs/D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_CORRECTIVE_EVIDENCE.md`

Record:
- starting HEAD;
- exact files changed;
- exact correction for Findings A/B/C;
- focused test names + pass count;
- full suite pass count;
- build command/result;
- generated JS/CSS blob identities;
- proof canonical adapter is inside App800 bundle;
- proof default production path was exercised with mocks;
- `git diff --check`;
- exact Live GET/POST/PUT/DELETE/upload/deploy/reset counts = 0;
- `STATUS = PENDING_CHATGPT_REVIEW`.

Commit + push one focused corrective commit if practical, then STOP.

Maximum executor status:

`D1_APP800_PASSWORD_RESET_UI_SOURCE_R1_CORRECTIVE_READY_PENDING_CHATGPT_REVIEW`

## 10. Next Owner

After executor commit/push:

`NEXT_OWNER = CHATGPT INDEPENDENT REVIEW`

Do not proceed to deployment or Hybrid Identity audit automatically.
