# AI ACTIVE TASK — R2-C-R6 REVIEWED / NOT CLOSED / R2-C-R7 MINIMAL SURFACE CORRECTIVE PROPOSAL READY

Mode: **CONTROL PLANE / NO ACTIVE EXECUTOR / LOW-CREDIT / NO KINTONE / NO DEPLOY / D3 HOLD**
Branch: `ai/antigravity-wp002c`
Updated: 2026-09-04 ICT

Read `D2_REVIEW_FAST_START.md` first, then this file, then only exact R2-C renderer/test evidence required by the current gate. Do not reopen closed R2-B1/R2-B2 or accepted R5/R6 behavior without a proven regression.

## 1. Current truth

```text
D1 = PASS / CLOSED
D2 = IN PROGRESS
D2_PART_A_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_STRUCTURAL = PASS / CLOSED / FROZEN
D2_PART_B_EXPANDED_PRIVACY = PASS / CLOSED / FROZEN
D2_XLSX_TEMPLATE_PROFILE = PASS / CLOSED / FROZEN
D2_WP004_R2_A = PASS / CLOSED AFTER R1
D2_WP004_R2_B1 = PASS / CLOSED AFTER R10
D2_WP004_R2_B2 = PASS / CLOSED AFTER R4 RUNTIME PROOF

R2-C = REVIEWED / NOT CLOSED
R2_C_R5_IMPLEMENTATION = 383104b69b096ca9f8b12d5e2410feeaf8864b45
R2_C_R5_MUTATION = PASS / FROZEN
R2_C_R5_PART_B_PROOF = PASS / FROZEN
R2_C_R6_IMPLEMENTATION = c9269e3fe20ff585ca0b89e33e74a1faeb2f43af
R2_C_R6_COMPARATOR_LOGIC = PASS / SOURCE-AWARE NO-TRIM BYTE COMPARISON ACCEPTED
R2_C_R6_TEST_ORACLE = PASS / INDEPENDENT SCANNER-SPLICE + ONE-BYTE NEGATIVE CONTROL ACCEPTED
R2_C_R6_GOVERNANCE_SURFACE = NOT PASS / TEST-ONLY PUBLIC EXPORT ADDED
R2_C_R6_RUNTIME_REPOSITORY_SIGNAL = UNAVAILABLE / NO STATUS / NO WORKFLOW RUN

ACTIVE_WORK_PACKAGE = NONE
ACTIVE_D2_SOURCE_CHANGE_AUTH = NONE
ACTIVE_D2_TEST_CHANGE_AUTH = NONE
ACTIVE_D2_PROFILE_CHANGE_AUTH = NONE
ACTIVE_D2_RENDERER_CHANGE_AUTH = NONE
ACTIVE_KINTONE_WRITE_AUTH = NONE
ACTIVE_DEPLOY_AUTH = NONE

ANTIGRAVITY = STOP / WAIT OWNER
CLAUDE = STOP
R2_B1_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_PRODUCTION_SOURCE = PASS / FROZEN
R2_B2_TEST_PROOF = PASS / FROZEN
R2_B2_RUNTIME_PROOF = PASS
R2-C-R7 = MINIMAL SURFACE CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
COMBINED_EXCEL_PARITY = NOT AUTHORIZED / LATER D2 GATE
D3 = HOLD
```

## 2. R2-C-R6 independent review identity

```text
R2_C_R6_AUTHORIZATION_HEAD = e59989f5b6ce5a378b37d1c9c6c20cd3313f0e24
R2_C_R6_AUTHORIZATION_TOKEN = D2-WP004-R2-C-R6-SOURCE-TEST-CORRECTIVE-20260904-01
R2_C_R6_IMPLEMENTATION = c9269e3fe20ff585ca0b89e33e74a1faeb2f43af
AUTH_TO_IMPLEMENTATION = EXACTLY ONE COMMIT
IMPLEMENTATION_MESSAGE = fix(d2): close source-aware byte comparator (R2-C-R6)
CHANGED_FILES =
  src/services/mbo-xlsx-semantic-renderer.js
  tests/mbo-xlsx-semantic-renderer.test.js
OUT_OF_SCOPE_CHANGE = NONE
```

The R6 token is consumed. No further change is authorized by it.

## 3. Accepted R6 improvements — MUST PRESERVE / DO NOT REOPEN

Independent review accepts:
- production preservation comparator no longer uses `.trim()` / `.trimStart()` / `.trimEnd()`;
- production comparator no longer deletes `t` with trailing `\s*` and preserves bytes around exact unprefixed `t` token spans;
- source/rendered preservation targets are required exactly once and fail closed otherwise;
- source-with-`t` and source-without-`t` cases use target-local authorized masking only;
- complete `sheet1.xml` comparison remains the production preservation gate;
- independent test oracle now uses a separate character-index/scanner-splice boundary approach and no trim/canonicalizing attribute reconstruction;
- post-`t` whitespace sentinel remains;
- one-byte unauthorized whitespace negative control is present and detects mismatch;
- all accepted R5 Part A/Part B/privacy/canonical/XML/formula/package/caller-immutability proof remains retained.

These accepted items are frozen for R7 unless a proven regression is found.

## 4. Independent blocker after R6

### BLOCK A — private preservation helper was exported solely for testing

R6 changes:

```js
function normalizeTargetNodesForPreservation(...)
```

to:

```js
export function normalizeTargetNodesForPreservation(...)
```

and the test imports that production helper solely to exercise the production comparator negative-control directly.

This violates the explicit R6 contract:

`Do not add a public debug API solely for testing.`

The comparator logic itself is accepted. The blocker is only the newly exposed module surface.

The R6 contract required production-comparator negative-control only **if reachable through an existing bounded test seam without exposing new production API**. Therefore the test-only export is unnecessary and must be removed.

GitHub has no status checks or workflow runs for the R6 implementation. Static governance blocker alone prevents R2-C closure.

## 5. Exact next corrective proposal — D2-WP004-R2-C-R7

```text
PROPOSED_WORK_PACKAGE = D2-WP004-R2-C-R7
NAME = SECURED SEMANTIC RENDERER PRIVATE-COMPARATOR SURFACE CLOSURE
STATE = MINIMAL SURFACE CORRECTIVE PROPOSAL READY / NOT AUTHORIZED
MODE = SOURCE+TEST CORRECTIVE / BOUNDED / ONE-SHOT / ULTRA-LOW-CREDIT
MAX_EXECUTOR_COMMITS = 1
```

Proposed writable files ONLY:

```text
src/services/mbo-xlsx-semantic-renderer.js
tests/mbo-xlsx-semantic-renderer.test.js
```

Frozen / forbidden:

```text
src/profiles/mbo-xlsx-template-profile.js = FROZEN
src/services/mbo-xlsx-template-preparer.js = FROZEN
src/services/mbo-export-service.js = FROZEN
existing Profile/Preparer/Feasibility/export tests = FROZEN
project-docs/* = FORBIDDEN TO EXECUTOR
package.json / package-lock.json = FORBIDDEN
UI / dist / integration = FORBIDDEN
Combined Excel parity = NOT AUTHORIZED
Kintone write/deploy/Live UAT = FORBIDDEN
D3 = HOLD
```

## 6. R2-C-R7 exact corrective contract

### R7-A — restore private production surface

In `src/services/mbo-xlsx-semantic-renderer.js`:
- remove the `export` from `normalizeTargetNodesForPreservation`;
- keep the accepted R6 comparator implementation byte-for-byte otherwise unless a proven regression requires the smallest necessary correction;
- do not add any alternate debug/test-only named export, global hook, class method or public seam.

### R7-B — remove test dependency on private production helper

In `tests/mbo-xlsx-semantic-renderer.test.js`:
- remove `normalizeTargetNodesForPreservation` from the production-module import;
- remove only the direct production-helper negative-control assertion that depends on that test-only export;
- retain the independent oracle one-byte negative-control;
- retain the real renderer path, which already executes the production comparator on every successful render;
- do not weaken any accepted R5/R6 matrix, privacy, canonical, XML, preservation or fail-closed proof.

The production-comparator negative-control clause is considered satisfied to the extent reachable without introducing a new public test API; no new production seam is authorized.

### R7-C — no scope expansion

R7 is not a redesign. Do not change:
- exact `t` mutation semantics;
- R6 comparator algorithm;
- independent scanner/splice oracle algorithm except removal of the forbidden production-helper dependency;
- Part A/Part B role matrices;
- privacy/canonical/XML/package behavior.

If any broader source change appears necessary: STOP and report.

## 7. Runtime / regression gate if R7 is later authorized

Focused:

`node --test tests/mbo-xlsx-semantic-renderer.test.js`

Required:

```text
FAIL = 0
SKIP = 0
production comparator remains private = PASS
R6 source-aware no-trim comparator behavior = PASS / retained
independent no-trim oracle = PASS / retained
one-byte negative-control = PASS / retained
all R5/R6 matrices/security proof = PASS / retained
formula inventory = 0
```

Frozen regression bundle:

`node --test tests/mbo-xlsx-template-profile.test.js tests/mbo-xlsx-template-preparer.test.js tests/mbo-xlsx-template-preparer-part-b.test.js tests/mbo-export-service.test.js`

Required: `FAIL = 0`.

Also:

```text
node --check src/services/mbo-xlsx-semantic-renderer.js
git diff --check
```

Before commit, `git diff --name-only` must show ONLY the two authorized files.

## 8. Owner decision

No executor is active. R2-C remains NOT CLOSED. R7 is proposed only; it is not authorized.

Recommended approval phrase:

`อนุมัติ D2-WP004-R2-C-R7 SOURCE+TEST CORRECTIVE ตามขอบเขตที่เสนอ`

Combined Excel remains later. Kintone/deploy/Live UAT remain forbidden. `D3 = HOLD` until D2 is fully PASS/CLOSED.
