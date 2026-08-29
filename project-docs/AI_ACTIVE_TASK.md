# AI ACTIVE TASK — APP794 WP2 UI ONE-SHOT LIVE DEPLOY

Mode: **ANTIGRAVITY PRECHECK + EXACTLY ONE GUARDED LIVE DEPLOY**
Branch: `ai/antigravity-wp002c`

## Authorization

User explicitly authorized:
`อนุมัติ App794 deploy WP2 UI candidate 90ba66e`

```text
AUTHORIZATION_ID       = APP794-D1-WP2-UI-DEPLOY-20260829-01
TARGET_APP             = 794 ONLY
WORK_PACKAGE           = MBO-P03-WP-002C
STAGE                  = STAGE_D1_APP794_CUSTOMIZATION_DEPLOY
OPERATION              = APP794_CUSTOMIZATION_DEPLOY
AUTHORIZED_ATTEMPTS    = 1
ROLLBACK_AUTHORIZED    = NO
```

This authorization is single-use. Once the guarded deploy invocation consumes it, any failure => STOP. Do not retry or rollback under the same authorization.

## Exact Candidate

```text
CANDIDATE_SOURCE_COMMIT = 90ba66e33c056807dc79717c3c787f37e80bb1b6
CANDIDATE_JS_BLOB_SHA   = eec05d4bb19130f3edc431164fc073f6b697dd8a
CANDIDATE_CSS_BLOB_SHA  = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
CANDIDATE_SCOPE         = ALL
CANDIDATE_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

## Accepted Pre-Deploy Live / Rollback Manifest

```text
EXPECTED_LIVE_REVISION  = 54
EXPECTED_LIVE_SCOPE     = ALL
EXPECTED_LIVE_TOPOLOGY  = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
EXPECTED_LIVE_JS        = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
EXPECTED_LIVE_CSS       = 1710d770ae87fb5f910d669dd5a88ea0950e6991
ROLLBACK_SOURCE_COMMIT  = ec6278524a2d5eb53050d0580c340d1b4e866b97
```

Rollback material is recorded for safety only. Rollback is NOT authorized.

## Step 1 — Read Control State Before Checkout

From branch `ai/antigravity-wp002c`:
1. fetch latest;
2. read `project-docs/AI_CONTROL_CENTER.md`;
3. read this `project-docs/AI_ACTIVE_TASK.md`;
4. record branch/control HEAD and authorization ID;
5. do not edit source/tests/dist.

If the task no longer says authorization ACTIVE for exactly this authorization ID => STOP.

## Step 2 — Checkout Exact Candidate for Execution

Hardened tooling requires release manifest source commit to equal actual Git HEAD.

Therefore:
- ensure local work is clean/no user work will be lost;
- checkout exact immutable commit `90ba66e33c056807dc79717c3c787f37e80bb1b6` in detached HEAD;
- require `git rev-parse HEAD` exactly equals the full candidate SHA;
- require clean worktree;
- do NOT execute from later docs-only branch HEAD;
- do NOT cherry-pick/rebuild newer source.

## Step 3 — Pre-Deploy Source/Test/Build Checks — NO LIVE WRITE

Before consuming authorization, run the required candidate verification:
- focused Back navigation tests;
- `tests/employee-main-mbo-app-integration.test.js`;
- focused Comment mirror tests;
- My MBO regression tests;
- relevant attachment/auth regression tests;
- full `npm test` unless a documented environmental blocker occurs;
- `npm run ui:build`;
- hardened `executeDeployCustomUi({ isBuildOnly: true, appId: 794 })` or equivalent accepted build-only path.

Require:
```text
FOCUSED_TESTS             = PASS
ATTACHMENT_AUTH_REGRESSION= PASS
FULL_TEST                 = PASS (unless explicit environment blocker -> STOP, do not deploy)
UI_BUILD                  = PASS
BUILD_ONLY                = PASS
BUILD_ONLY_NETWORK_CALLS  = 0
WORKTREE                  = CLEAN
DIST_TRACKED_DIFF         = 0
BUILT_JS_IDENTITY         = eec05d4bb19130f3edc431164fc073f6b697dd8a
BUILT_CSS_IDENTITY        = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
```

Any failure => STOP WITHOUT LIVE WRITE.

## Step 4 — Pre-Deploy Live Readback — STILL NO AUTH CONSUMPTION

Read App794 current LIVE customization using current Kintone session/credentials.

Independently:
- read Live revision/scope/topology;
- identify the configured target Desktop JS and CSS fileKeys;
- download exact configured target JS/CSS bytes through Kintone file API;
- compute Git blob SHA from exact downloaded bytes using the same byte-exact algorithm;
- do not trust filenames alone.

Require exactly:
```text
CURRENT_LIVE_REVISION = 54
CURRENT_LIVE_SCOPE    = ALL
CURRENT_LIVE_TOPOLOGY = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
CURRENT_LIVE_JS       = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
CURRENT_LIVE_CSS      = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

Any unexpected drift => STOP BEFORE guarded deploy invocation. Do not consume authorization. Do not reconcile or restore automatically.

## Step 5 — Execute Exactly One Guarded Live Deploy

Only after Steps 1–4 PASS, invoke existing hardened `executeDeployCustomUi()` directly. Do NOT create an alternate deployment implementation.

Use exact authorization configuration:

```js
authConfig = {
  appId: 794,
  workPackageId: 'MBO-P03-WP-002C',
  stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY',
  operation: 'APP794_CUSTOMIZATION_DEPLOY',
  activeWindow: true,
  explicitUserAuthorization: true,
  authorizationId: 'APP794-D1-WP2-UI-DEPLOY-20260829-01'
}

requestConfig = {
  appId: 794,
  workPackageId: 'MBO-P03-WP-002C',
  stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY',
  operation: 'APP794_CUSTOMIZATION_DEPLOY'
}

releaseManifest = {
  appId: 794,
  sourceCommit: '90ba66e33c056807dc79717c3c787f37e80bb1b6',
  expectedJsBlobSha: 'eec05d4bb19130f3edc431164fc073f6b697dd8a',
  expectedCssBlobSha: '2a758a0025c1ec1917b4da19ad09bd8cd2182f51',
  expectedScope: 'ALL',
  expectedTopology: {
    desktopJsCount: 1,
    desktopCssCount: 1,
    mobileJsCount: 0,
    mobileCssCount: 0
  }
}
```

Use an ephemeral runtime invocation/import if needed. Do not add a new deploy source file solely to carry these values.

Expected authorized writes from this path are limited to:
- upload candidate JS file;
- upload candidate CSS file;
- PUT App794 preview customization replacing BOTH target fileKeys atomically in the payload;
- POST App794 preview deploy.

No other write is authorized.

## Step 6 — Mandatory Post-Deploy Readback

Deployment status `SUCCESS` alone is insufficient.

After deploy completes, independently re-read LIVE App794 customization and download/hash target JS/CSS exact bytes.

Require:
```text
POST_SCOPE          = ALL
POST_TOPOLOGY       = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
POST_JS_IDENTITY    = eec05d4bb19130f3edc431164fc073f6b697dd8a
POST_CSS_IDENTITY   = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
POST_PAIR_MATCH     = YES
APP794_RECORD_WRITE = 0
SCHEMA_LAYOUT_WRITE = 0
ACL_PROCESS_WRITE   = 0
COMMENT_WRITE       = 0
APP801_WRITE        = 0
APP795_796_WRITE    = 0
```

Record actual Kintone post-deploy revision; do NOT assume it is 55.

If any mismatch/failure occurs after authorization consumption => STOP and report exact evidence. NO retry and NO automatic rollback.

## Step 7 — Evidence Commit Only After Execution

After technical result is known:
- preserve the exact execution output/evidence;
- switch safely back to `ai/antigravity-wp002c` only after all Kintone execution is finished;
- do not modify source/tests/dist;
- create/update one concise App794 WP2 deployment evidence document;
- record authorization as CONSUMED if guarded deploy was invoked;
- record pre-state, candidate manifest, actual writes, deploy status, post-state identities, actual revision, forbidden-write counts;
- commit + push evidence only.

If technical readback PASS, maximum status:
`APP794_WP2_UI_DEPLOYED_PENDING_USER_UAT`

Do NOT mark the new Live revision accepted until User runtime UAT says PASS.

## Strictly Forbidden

- NO second deploy attempt
- NO automatic rollback/recovery
- NO source/test/dist change
- NO App794 record write
- NO schema/form/layout write
- NO ACL/process write
- NO Kintone Comment write
- NO App801/App795/App796 write
- NO protected legacy app write
- NO Copy Previous MBO
- NO D2-D7 execution
- NO unrelated cleanup/refactor

STOP after evidence push and report final evidence commit SHA.