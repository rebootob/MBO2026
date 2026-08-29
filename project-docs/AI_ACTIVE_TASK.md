# AI ACTIVE TASK — WP1 ATOMIC DEPLOYMENT TOOLING RESIDUAL CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Start Point

Latest reviewed WP1 candidate:
`9c96461dcde9ef3ca626b415d35398ff5d41657f`

Independent verdict:
`CORRECTIVE`

Do NOT redo the accepted atomic JS+CSS implementation. Fix only the residual blockers below.

## Accepted Current Live / Rollback Manifest

```text
LIVE_REVISION          = 54
ROLLBACK_SOURCE_COMMIT = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_SCOPE         = ALL
ROLLBACK_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_JS_IDENTITY   = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY  = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

No Live write is authorized.

## Residual Blocker A — Manifest Must Be Mandatory and Complete

Current `validateReleaseManifest()` can return PASS when expected identities are omitted. This is forbidden.

For **Live mode**, require an exact release manifest before any upload/write path.

Manifest must bind at minimum:
```text
APP_ID = 794
SOURCE_COMMIT / candidate identifier
EXPECTED_JS_IDENTITY
EXPECTED_CSS_IDENTITY
EXPECTED_SCOPE
EXPECTED_TOPOLOGY = Desktop JS count / Desktop CSS count / Mobile JS count / Mobile CSS count
```

Requirements:
- missing manifest object => BLOCK;
- missing/blank required field => BLOCK;
- APP_ID != 794 => BLOCK;
- missing or mismatched source commit/candidate identifier => BLOCK;
- JS mismatch => BLOCK;
- CSS mismatch => BLOCK;
- expected scope mismatch => BLOCK;
- expected topology mismatch => BLOCK;
- exact manifest + exact built pair => PASS.

The Live entrypoint must not silently fall back to optional `expectedJsBlobSha` / `expectedCssBlobSha` values.

Prefer one explicit `releaseManifest` object passed to Live execution.

### Source identity

The candidate/source identity must reflect the actual source being deployed, not merely a caller-supplied string that can claim any commit.

Use a deterministic runtime source identity check appropriate to this repository, for example current Git HEAD, and fail closed if the working tree/build inputs are dirty or cannot be tied to the expected candidate. Keep this implementation narrow; do not add unrelated Git workflow machinery.

Build-only mode may run without Live authorization and may return computed source/artifact identity information for Control Plane review.

## Residual Blocker B — Hash Exact Upload Bytes

Current `gitBlobSha()` normalizes `CRLF -> LF` before hashing. Remove that normalization.

Required contract:
- Git-blob/content identity must be computed over the exact UTF-8 bytes/content that will be uploaded;
- the same JS/CSS content used for hashing must be passed to `uploadFile()`;
- no newline normalization between hash calculation and upload;
- add a regression proving LF and CRLF content produce different identities when bytes differ.

This prevents a Windows checkout from appearing to match a reviewed repository blob while uploading different bytes.

## Accepted WP1 Behavior — Must Preserve

Do not regress these accepted points from `9c96461...`:
- exactly one target Desktop JS `mbo-employee-app.js`;
- exactly one target Desktop CSS `mbo-employee.css`;
- missing/duplicate JS or CSS blocks;
- both new JS and CSS fileKeys replace preview targets;
- scope/topology/Mobile preservation remains fail-closed;
- build-only returns JS + CSS and performs zero network;
- unauthorized Live entrypoint blocks;
- no automatic rollback;
- no UI source changes.

## Exact Files Allowed

Change only:
1. `scripts/kintone/deploy-custom-ui.js`
2. `tests/deploy-customization-preservation.test.js`
3. `project-docs/WP1_ATOMIC_DEPLOYMENT_TOOLING_EVIDENCE.md` — update evidence or add a small residual evidence file

Read-only unless absolutely necessary:
- `scripts/kintone/build-mbo-ui.js`
- `package.json`
- exact security helper needed to understand authorization

Forbidden:
- `src/main-mbo-app.js`
- `src/ui/employee-self-index-ui.js`
- `src/ui/employee-part-a-ui.js`
- `src/styles/mbo-employee.css`
- auth/session/attachment/routing/scoring source

## Mandatory Regression Tests

Add/adjust tests proving at minimum:
```text
MISSING_RELEASE_MANIFEST_BLOCKED_PRE_UPLOAD
MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD
MANIFEST_APP_ID_MISMATCH_BLOCKED_PRE_UPLOAD
MANIFEST_SOURCE_COMMIT_MISMATCH_BLOCKED_PRE_UPLOAD
MANIFEST_SCOPE_MISMATCH_BLOCKED_PRE_UPLOAD
MANIFEST_TOPOLOGY_MISMATCH_BLOCKED_PRE_UPLOAD
JS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD
CSS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD
EXACT_RELEASE_MANIFEST_PASS
GIT_BLOB_SHA_EXACT_BYTES_CRLF_DIFFERS_FROM_LF
ATOMIC_JS_CSS_PAIR_REQUIRED
CSS_CANDIDATE_REPLACED_NOT_PRESERVED
BUILD_ONLY_ZERO_NETWORK
```

Also preserve all previous target/revision/topology/authorization tests.

## Verification

Run and commit evidence for:
- `node --test tests/deploy-customization-preservation.test.js`
- relevant classic bundle/build safety tests
- `npm test`
- `npm run ui:build`
- module-aware build-only with 0 Kintone/network calls

Evidence must record:
```text
EXECUTION_START_HEAD
BASE_REJECTED_CANDIDATE = 9c96461dcde9ef3ca626b415d35398ff5d41657f
SOURCE_FILES_CHANGED
TEST_FILES_CHANGED
MANIFEST_MANDATORY_PROOF
MANIFEST_SOURCE_IDENTITY_PROOF
CRLF_VS_LF_HASH_PROOF
ATOMIC_JS_CSS_PROOF
FOCUSED_TEST_RESULT
FULL_TEST_RESULT
UI_BUILD_RESULT
BUILD_ONLY_RESULT
BUILD_ONLY_NETWORK_CALLS = 0
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY = NO
FINAL_COMMIT_SHA
```

## Strictly Forbidden

- NO Live Kintone customization PUT/POST deploy
- NO upload test against Live
- NO rollback/recovery
- NO UI feature implementation/change
- NO App794 record/schema/layout/ACL/process write
- NO Kintone Comment write
- NO App801/App795/App796 write
- NO Copy Previous MBO
- NO WP2 execution
- NO D2-D7 work
- NO unrelated refactor

Commit + push source/test/evidence and STOP.

Maximum status:
`ATOMIC_DEPLOY_TOOLING_CORRECTED_PENDING_INDEPENDENT_REVIEW`.
