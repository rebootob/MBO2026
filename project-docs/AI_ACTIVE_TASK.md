# AI ACTIVE TASK — APP794 FATAL CREATE CLEAN-EXIT TEST-PROOF MICRO-CORRECTIVE R3

Mode: **ANTIGRAVITY TEST + LOCAL BUILD ONLY — NO KINTONE NETWORK / NO LIVE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. Independent R2 Review

R2 executor source commit:

`dca394526a89db7909a4d280e1876f03d36a3d35`

ChatGPT decision:

`SOURCE LOGIC ACCEPTABLE / PACKET CORRECTIVE BECAUSE MANDATORY TEST PROOF IS INCOMPLETE`

Do not redesign the source in R3 unless a required new assertion fails and proves a real defect.

R2 corrected both proven R1 source defects:
- blank Fiscal Year is no longer mutated before duplicate preflight;
- Save/Cancel hiding is explicit fatal-state-only and the broad statusbar selector was removed.

## 2. Exact Remaining Proof Gaps

### Gap A — Normal successful Create continuation is not explicitly asserted

The R2 packet required proof that after duplicate preflight succeeds:
- blank incoming `Fiscal_Year` becomes exactly `FY2026`;
- normal profile/autoload continues;
- record-level Back remains absent;
- native Save remains visible/normal;
- native Cancel remains visible/normal.

The existing Create integration path executes, but those exact invariants are not all asserted.

### Gap B — Existing Detail/Edit blocked states do not prove native actions remain untouched

The existing Access Denied Detail/Edit checks run before the mocked native Save/Cancel controls are installed. Therefore they do not prove that the fatal-create feature does not suppress native actions on existing-record blocked states.

## 3. R3 Exact Scope

R3 is a **test-proof micro-corrective**.

Allowed repository changes:
- `tests/employee-main-mbo-app-integration.test.js` only;
- `dist/mbo-employee-app.js` only if the normal build genuinely changes it because source differs from generated output; expected result is preferably no source/dist change from R2;
- `src/main-mbo-app.js` only if one of the new mandatory assertions fails and exposes a real source defect. If source must change, keep it minimal and explain exactly which assertion exposed the defect.

Do not edit:
- `employee-record-navigation.js` unless a new test proves a real navigation defect;
- Control Center / Active Task / baselines / skills;
- CSS;
- unrelated tests/source/config/scripts.

No new files.

## 4. Mandatory Test Additions

### A. Normal successful Create after preflight PASS

Use the existing real main-app Create integration path with incoming:

```js
Fiscal_Year: { value: '' }
```

After `recordShowHandler(createEvent)` succeeds, assert at minimum:

```text
createEvent.record.Fiscal_Year.value = FY2026
Back count                         = 0
native Save display                = unchanged / not hidden
native Cancel display              = unchanged / not hidden
normal employee/profile autoload   = continued (assert at least one representative populated field such as Employee_Code = authenticated employee)
```

If native Save/Cancel mocks need to be initialized earlier in the test, do that without changing production source behavior.

### B. Existing Detail/Edit blocked state native actions

With mocked native Save/Cancel controls visible, run at least one existing-record blocked state such as Employee_Code mismatch and assert:

```text
Back count           = exactly 1
native Save display  = unchanged / not hidden
native Cancel display = unchanged / not hidden
```

Prefer covering both Detail and Edit if it is trivial within the existing integration test, but do not broaden the task unnecessarily.

### C. Preserve existing R2 proofs

Do not remove or weaken existing assertions proving:
- fatal duplicate blank Fiscal Year remains unchanged;
- fatal duplicate `kintone.app.record.set()` = 0;
- fatal duplicate native Save/Cancel hidden;
- pre-auth Create native actions not hidden;
- nonblank Fiscal Year preserved on rejection;
- no `onbeforeunload` override.

## 5. Required Commands

Run exactly the relevant verification:

```text
node --test tests/employee-record-navigation.test.js tests/employee-main-mbo-app-integration.test.js
npm run ui:build
node --test tests/classic-bundle.test.js tests/css-structure.test.js
```

Then verify generated output is consistent and report:
- exact command;
- PASS/FAIL count / exit status;
- exact changed files;
- whether `src/main-mbo-app.js` changed (expected NO unless a new assertion exposes a real defect);
- whether generated dist changed after the build.

No GitHub CI exists for this commit, so local executor command results must be reported truthfully for ChatGPT review.

## 6. Safety Boundary

```text
LIVE_APP794_REVISION          = 58
LIVE_SOURCE_COMMIT            = 98108e9e387d01b6d3c3a35cce5baf13324be50e
ACCEPTED_KNOWN_GOOD_REVISION  = 57
R2_SOURCE_COMMIT              = dca394526a89db7909a4d280e1876f03d36a3d35
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ROLLBACK_AUTH                 = NONE
```

Forbidden:
- all Kintone GET/POST/PUT/DELETE calls;
- customization upload;
- Preview update;
- deploy;
- rollback;
- schema/layout/ACL/process changes;
- App794/App800/App801/App795/App796 record writes.

## 7. Delivery Contract

Deliver one narrow commit. Prefer **tests only**.

Report concisely:
- exact changed files;
- exact new assertions;
- all required command results;
- build result;
- generated dist status;
- commit SHA.

Then STOP for ChatGPT Independent Review.

Maximum executor status:

`APP794_FATAL_CREATE_CLEAN_EXIT_R3_TEST_PROOF_CAPTURED_PENDING_CHATGPT_REVIEW`
