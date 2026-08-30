# AI ACTIVE TASK — D1 ASYNC PROCESS.PROCEED TEST-CONTRACT CORRECTIVE R1

Mode: **ANTIGRAVITY MINIMUM TEST-ONLY CORRECTIVE — ONE FILE / NO SOURCE CHANGE / NO BUILD / NO LIVE KINTONE**
Branch: `ai/antigravity-wp002c`
Opened after triage: `1034 PASS / 4 FAIL / 1038 total`
Updated: 2026-08-30

```text
TASK_STATE = OPEN / READY_FOR_EXECUTION
CURRENT_OWNER = ANTIGRAVITY
NEXT_OWNER_AFTER_EXECUTION = CHATGPT INDEPENDENT REVIEW
```

Fresh-fetch the branch first. If another executor commit already exists after this task was written, STOP and return control to ChatGPT.

## 0. Goal

Correct only stale synchronous test invocation assumptions after accepted Gate 3 made `app.record.detail.process.proceed` async.

Do NOT change runtime/source behavior.

Root cause is already classified by ChatGPT:

```text
EXPECTED BUSINESS RESULT = event or false
ACTUAL ASSERTION INPUT    = Promise resolving to that business result
RUNTIME REGRESSION        = NO EVIDENCE
CORRECTIVE                = TEST CONTRACT ONLY
```

## 1. Exact allowed file

MODIFY ONLY:

```text
tests/objective-save-validation.test.js
```

No other file may change.

## 2. Exact failing test blocks

Touch only Process Proceed invocation mechanics inside these four existing test blocks:

1. `M10L-D-R6: app.record.detail.process.proceed handler returns exact event on valid validation`
2. `M10L-D-R6: app.record.detail.process.proceed handler returns false on invalid validation`
3. `M10L-D-R12B: Workflow action validation enforces fail-closed topology & assignee guards`
4. `M10L-D-R12B-R1: Topology whitelist and complete Requester_User handoff fail-closed guards`

These tests are already declared `async`.

## 3. Required correction

For every direct `proceedHook(event)` invocation inside the four named test blocks, resolve the async handler before asserting its business result.

Preferred minimal pattern:

```js
assert.equal(await proceedHook(event), expected, message);
```

or equivalent when a local result variable already exists:

```js
const res = await proceedHook(event);
```

Do NOT change any expected value, fixture, action label, topology, status, requester/appraiser field, or assertion meaning.

### Async-unsafe loop

Inside `M10L-D-R12B-R1`, the G2 topology checks currently use synchronous `.forEach(...)` while calling `proceedHook(...)`.

Convert only that loop to an async-safe sequential loop, for example:

```js
for (const g2Topo of ['M1_G1_G2', 'M1_M2_G1_G2']) {
  ...
  assert.equal(await proceedHook(failG2), false, ...);
}
```

Do not otherwise refactor the test.

## 4. Explicitly forbidden

```text
MODIFY src/**                              = NO
MODIFY services/**                         = NO
MODIFY scripts/**                          = NO
MODIFY project-docs/** BY EXECUTOR         = NO
MODIFY dist/**                             = NO
MODIFY any other test file                 = NO
CHANGE ASSERTION EXPECTATIONS              = NO
CHANGE BUSINESS FIXTURES                   = NO
REVERT PROCESS.PROCEED TO SYNC             = NO
CHANGE GATE 3 AUTHORITY BEHAVIOR            = NO
npm run ui:build                           = NO
LIVE KINTONE GET/WRITE                     = NO
APP53 ACCESS/WRITE                         = NO
ACL/GROUP/DEPLOY/UAT                       = NO
```

No Live authorization exists.

## 5. Verification order

Run exactly in this order:

```text
node --test tests/objective-save-validation.test.js
npm test
git diff --check
git status --short
```

If focused test FAILS:
- STOP;
- do not fix outside the allowed invocation mechanics;
- report exact failure.

If focused test passes but full `npm test` fails:
- STOP;
- do not expand scope;
- report exact full-suite failure count and names.

Required changed-file scope:

```text
tests/objective-save-validation.test.js ONLY
```

## 6. Finish

If:
- focused file test PASS;
- full `npm test` PASS;
- `git diff --check` PASS;
- only the one allowed test file changed;

then commit + push exactly one focused test-only corrective commit and STOP.

Do NOT build after the full test passes. Build remains a separate Control Plane step after ChatGPT review.

Return only:

```text
FOCUSED_TEST = PASS/FAIL + exact count
FULL_TEST = PASS/FAIL + exact count
GIT_DIFF_CHECK = PASS/FAIL
CHANGED_FILES = exact list
CORRECTIVE_COMMIT = <sha> / NONE
SOURCE_FILES_CHANGED = 0
OTHER_TEST_FILES_CHANGED = 0
BUILD_RUN = NO
LIVE_KINTONE_OPERATIONS = 0
APP53_PRODUCTION_TOUCHED = NO
DEPLOY_RUN = NO
```

Next owner = ChatGPT independent review.
