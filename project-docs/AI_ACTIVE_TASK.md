# AI ACTIVE TASK — APP794 R4.1 NATIVE-CANCEL PREDEPLOY VERIFICATION / READ-ONLY

Mode: **ANTIGRAVITY LOCAL TEST + CLEAN BUILD + GET-ONLY APP794 CUSTOMIZATION READBACK — NO SOURCE CHANGE / NO LIVE WRITE / NO DEPLOY / NO ROLLBACK**  
Branch: `ai/antigravity-wp002c`

## 1. Current Status

R4/R4.1 source review is independently accepted.

```text
CANDIDATE_SOURCE_TEST_COMMIT = 1ed342ad137a4a364496a28d29bdffd24a99b511
CANDIDATE_JS_GIT_BLOB        = 115a08ace32bdf850cb5eebf25b953d1803114d0
CANDIDATE_CSS_GIT_BLOB       = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
SOURCE_REVIEW                = PASS
PREDEPLOY_VERIFICATION       = PENDING
LIVE_APP794_REVISION         = 59
REV59_USER_UAT               = FAIL
ACCEPTED_KNOWN_GOOD_REVISION = 57
ACTIVE_DEPLOY_AUTH           = NONE
ACTIVE_KINTONE_WRITE_AUTH    = NONE
ROLLBACK_AUTH                = NONE
```

Do not change source/tests/dist manually in this task.

## 2. Candidate To Verify

Use a fresh detached worktree pinned exactly to:

`1ed342ad137a4a364496a28d29bdffd24a99b511`

Expected immutable Git blobs:

```text
JS  = 115a08ace32bdf850cb5eebf25b953d1803114d0
CSS = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
```

Expected topology:
`Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0`, scope `ALL`.

## 3. Mandatory Local Verification

In the detached candidate worktree record exact command/output/exit status for:

```text
git rev-parse HEAD
git status --porcelain
node --test tests/employee-record-navigation.test.js tests/employee-main-mbo-app-integration.test.js
npm run ui:build
node --test tests/classic-bundle.test.js tests/css-structure.test.js
git diff --check 97c094133575221e5ee2cc6005e12923ce319318..HEAD
git diff --stat 97c094133575221e5ee2cc6005e12923ce319318..HEAD -- src/main-mbo-app.js tests/employee-main-mbo-app-integration.test.js tests/employee-record-navigation.test.js dist/mbo-employee-app.js
```

Required:
- candidate HEAD exact;
- initial worktree clean;
- focused tests PASS;
- UI build PASS;
- classic bundle/CSS tests PASS;
- `git diff --check` emits no errors;
- cumulative source diff remains narrow, especially `src/main-mbo-app.js` must not return to near-whole-file churn;
- after build, generated dist must match tracked candidate exactly (`git diff --exit-code` for generated dist/source as applicable);
- final `git status --porcelain` must be empty after metadata refresh only if needed (`git update-index --refresh` is allowed; reset/restore/checkout/clean to mask build output is forbidden);
- final HEAD remains exact candidate.

## 4. Build-Only Artifact Verification

Use the repository's existing deployment/customization tooling in explicit **build-only / zero-network mode** if available, as used in previous accepted predeploy verification.

Record:
- zero Kintone network calls;
- generated candidate JS identity;
- generated candidate CSS identity;
- exact match to locked Git blobs above.

Do not upload or deploy anything.

## 5. GET-Only Live/Preview Precondition Verification

Current last accepted actual Live state is Rev59:

```text
LIVE_REVISION     = 59
LIVE_SCOPE        = ALL
LIVE_TOPOLOGY     = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS           = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
LIVE_CSS          = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
PREVIEW_REVISION  = 59
PREVIEW_SCOPE     = ALL
PREVIEW_TOPOLOGY  = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

GET-read actual App794 Live + Preview customization now and record:
- revision;
- scope;
- desktop/mobile JS/CSS counts, order and entry names;
- download/hash actual Live JS/CSS bytes if existing tooling supports it.

Any unexpected drift => STOP and report. Do not repair.

Allowed network is GET-only App794 customization/file readback needed for this verification.

## 6. Rollback Manifest Verify Only

Verify immutable known-good Rev57 Git artifacts, do not deploy them:

```text
ROLLBACK_SOURCE = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
ROLLBACK_JS     = ac22a56cb9d78001384241fe12745f7a2da3da84
ROLLBACK_CSS    = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
ROLLBACK_SCOPE  = ALL
ROLLBACK_TOPOLOGY = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

No rollback is authorized.

## 7. Strict Safety Boundaries

```text
POST             = 0
PUT              = 0
DELETE           = 0
CUSTOMIZATION_UPLOAD = 0
DEPLOY           = 0
ROLLBACK         = 0
RECORD_WRITE     = 0
SCHEMA_LAYOUT_ACL_PROCESS_WRITE = 0
```

No source/test/config/script/package edits. No Control Center/Active Task edits by executor.

## 8. Evidence File

Create or update only:

`project-docs/APP794_R4_1_NATIVE_CANCEL_PREDEPLOY_EVIDENCE.md`

Evidence must include:
- status `PENDING_CHATGPT_REVIEW`;
- timestamp;
- exact candidate HEAD + initial/final clean worktree proof;
- exact test counts + exit codes;
- build result;
- `git diff --check` result;
- narrow diff-stat result from base `97c09413...`;
- build-only/zero-network artifact identities;
- actual Live + Preview GET-only state;
- rollback immutable verification;
- method counts POST/PUT/DELETE/deploy/rollback = 0;
- any warning/mismatch.

Commit + push only this evidence file, then STOP.

Maximum executor status:

`APP794_R4_1_NATIVE_CANCEL_PREDEPLOY_VERIFIED_PENDING_CHATGPT_REVIEW`
