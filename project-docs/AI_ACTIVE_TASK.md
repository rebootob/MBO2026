# AI ACTIVE TASK — APP794 FATAL CREATE CLEAN-EXIT PREDEPLOY VERIFICATION / READ-ONLY

Mode: **ANTIGRAVITY VERIFICATION EXECUTION ONLY — TEST + LOCAL BUILD + GET-ONLY LIVE READBACK / NO LIVE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. Purpose

The Fatal Create Clean-Exit corrective source/test design has passed ChatGPT independent review.

Immutable release-source candidate to verify:

```text
CANDIDATE_SOURCE_TEST_COMMIT = 4472aa2f1c63bf08788b39b4ad54b7ea55808df1
CANDIDATE_JS_GIT_BLOB        = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
CANDIDATE_CSS_GIT_BLOB       = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
EXPECTED_SCOPE               = ALL
EXPECTED_TOPOLOGY            = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

R3 itself is test-only. The runtime corrective source is contained in the candidate history, principally R1+R2.

This task exists to independently execute the exact focused tests/build, prove immutable candidate artifacts, verify the actual current Live Rev58 precondition through GET-only readback, and capture an auditable evidence file before any future deployment authorization request.

## 2. Absolute Safety Boundary

Forbidden:
- Kintone POST / PUT / DELETE;
- customization upload;
- Preview customization update;
- deploy POST;
- App794/App800/App801/App795/App796 record write;
- schema/layout/ACL/process change;
- rollback;
- source/test/config/script/package edits;
- hand-editing `dist`;
- reusing any consumed authorization.

Allowed Kintone network activity is **GET only** for exact App794 customization readback.

If any drift, ambiguity, failed test/build, unexpected generated diff, or artifact mismatch is found: STOP. Do not repair or deploy.

## 3. Candidate Worktree

Do not reset/rewrite the canonical branch.

Create a temporary detached worktree pinned exactly to:

```text
4472aa2f1c63bf08788b39b4ad54b7ea55808df1
```

Example:

```text
git worktree add --detach <temporary-path> 4472aa2f1c63bf08788b39b4ad54b7ea55808df1
```

Before execution capture:

```text
git rev-parse HEAD
git status --porcelain
```

Required:
- HEAD exact candidate;
- tracked worktree clean before verification.

## 4. Mandatory Focused Test + Build Execution

Run exactly:

```text
node --test tests/employee-record-navigation.test.js tests/employee-main-mbo-app-integration.test.js
npm run ui:build
node --test tests/classic-bundle.test.js tests/css-structure.test.js
```

Capture exact command, output summary, PASS/FAIL count, and exit status for every command.

The first test command must include and pass the R2/R3 invariants:
- duplicate rejection occurs before Fiscal Year/native record mutation;
- blank fatal duplicate Fiscal Year remains blank;
- `kintone.app.record.set()` = 0 on fatal duplicate rejection;
- fatal Create hides native Save/Cancel;
- pre-auth Create does not hide them;
- normal successful Create defaults FY2026 after preflight PASS, continues autoload, Back=0, native Save/Cancel normal;
- existing blocked Detail/Edit retain native actions and exactly one Back;
- nonblank Fiscal Year is preserved on rejection;
- no `onbeforeunload` bypass.

## 5. Clean Reproduction / Generated Dist Proof

After build run exact:

```text
git diff --exit-code -- dist/mbo-employee-app.js dist/mbo-employee.css
git status --porcelain
```

Required:
- `git diff --exit-code ...` exit status = 0;
- output empty;
- worktree clean after build;
- no manual dist edit.

Then independently obtain immutable Git blob identities for candidate:

```text
git rev-parse 4472aa2f1c63bf08788b39b4ad54b7ea55808df1:dist/mbo-employee-app.js
git rev-parse 4472aa2f1c63bf08788b39b4ad54b7ea55808df1:dist/mbo-employee.css
```

Must equal:

```text
JS  = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
CSS = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
```

If existing deploy tooling supports zero-network build-only mode, run it only in build-only mode to compute the artifact identities and prove they equal the immutable Git blobs. **Do not run live mode.**

## 6. Live App794 GET-Only Preflight

Expected actual Live state:

```text
APP                 = 794
LIVE_REVISION       = 58
LIVE_SCOPE          = ALL
LIVE_TOPOLOGY       = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY    = f097f67404fb75418cf85fee635e5d630ef5474d
LIVE_CSS_IDENTITY   = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
LIVE_SOURCE_COMMIT  = 98108e9e387d01b6d3c3a35cce5baf13324be50e
```

Allowed endpoints only as needed:
- `GET /k/v1/app/customize.json?app=794`
- `GET /k/v1/preview/app/customize.json?app=794`
- `GET /k/v1/file.json?fileKey=...` for exact current customization FILE entries needed to hash bytes.

Capture:
- actual Live revision;
- scope;
- desktop/mobile JS/CSS topology and ordering;
- exact current Live JS/CSS identities from downloaded bytes;
- Preview revision/scope/topology/entry names where available;
- exact GET endpoints used;
- network method counts: `POST=0`, `PUT=0`, `DELETE=0`.

Never print credentials, passwords, API tokens, auth headers, session tokens, or secrets.

Any mismatch from expected Rev58 baseline => STOP. No repair/deploy.

## 7. Known-Good Rollback Manifest Proof

Known-good rollback baseline remains Rev57:

```text
ROLLBACK_REVISION        = 57
ROLLBACK_SOURCE_COMMIT   = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
ROLLBACK_JS_IDENTITY     = ac22a56cb9d78001384241fe12745f7a2da3da84
ROLLBACK_CSS_IDENTITY    = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
ROLLBACK_SCOPE           = ALL
ROLLBACK_TOPOLOGY        = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_AUTHORIZED      = NO
```

Do **not** rebuild historical Rev57 as a rollback target. Prove immutable Git object identities only:

```text
git rev-parse 9816cef195b6d3ffe039e5fb92c8dc8406c8967a:dist/mbo-employee-app.js
git rev-parse 9816cef195b6d3ffe039e5fb92c8dc8406c8967a:dist/mbo-employee.css
```

They must equal the known-good identities above.

Rollback remains a separate future authorization and must never execute automatically.

## 8. Evidence File / Repository Scope

The only allowed repository change by Antigravity for this task is:

`project-docs/APP794_FATAL_CREATE_CLEAN_EXIT_PREDEPLOY_EVIDENCE.md`

Evidence file must contain:
- `STATUS = PENDING_CHATGPT_REVIEW`;
- timestamp;
- exact candidate commit;
- exact runtime corrective scope summary;
- every command executed + exact exit status;
- focused test PASS/FAIL counts;
- build result;
- exact `git diff --exit-code` proof;
- candidate built/immutable Git JS/CSS identities;
- initial/final worktree HEAD and clean status;
- Live GET-only revision/scope/topology/actual JS+CSS identities;
- Preview GET-only state if read;
- exact GET endpoints;
- POST/PUT/DELETE counts = 0;
- known-good Rev57 rollback manifest + immutable identities;
- any warning/gap.

No secrets.

Commit + push only this evidence file on the canonical branch, then STOP for ChatGPT review.

Do not edit:
- `AI_CONTROL_CENTER.md`;
- `AI_ACTIVE_TASK.md`;
- baselines/skills;
- source/tests/scripts/config/package/dist.

## 9. Current Authorization State

```text
ACTIVE_LIVE_AUTH           = NONE
ACTIVE_KINTONE_WRITE_AUTH  = NONE
ACTIVE_DEPLOY_AUTH         = NONE
ROLLBACK_AUTH              = NONE
```

No deploy authorization exists.

Maximum executor status:

`APP794_FATAL_CREATE_CLEAN_EXIT_PREDEPLOY_EVIDENCE_CAPTURED_PENDING_CHATGPT_REVIEW`
