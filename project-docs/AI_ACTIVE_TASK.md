# AI ACTIVE TASK — APP794 CUMULATIVE CUSTOMIZATION DEPLOYMENT / ONE-SHOT AUTHORIZED

Mode: **ANTIGRAVITY LIVE EXECUTION — EXACT APP794 CUSTOMIZATION DEPLOYMENT ONLY / ONE ATTEMPT / STOP AFTER TECHNICAL READBACK**  
Branch: `ai/antigravity-wp002c`

## 1. User Authorization

User explicitly authorized on 2026-08-30:

`อนุมัติ App794 cumulative customization deployment candidate 98108e9e one-shot 1 ครั้ง`

Control Plane authorization:

```text
AUTHORIZATION_ID             = APP794-CUMULATIVE-DEPLOY-20260830-01
AUTHORIZATION_STATUS         = ACTIVE / UNCONSUMED
TARGET_APP                   = 794 ONLY
WORK_PACKAGE_ID              = MBO-P03-WP-002C
STAGE                        = STAGE_D1_APP794_CUSTOMIZATION_DEPLOY
OPERATION                    = APP794_CUSTOMIZATION_DEPLOY
MAX_ATTEMPTS                 = 1
ROLLBACK_INCLUDED            = NO
```

This authorization is exact and narrow. Do not widen it to record writes, schema/layout/ACL/process changes, App800/App801 writes, another deploy, or rollback.

## 2. Immutable Candidate — RELEASE SOURCE MUST BE EXACT

```text
APP_ID                       = 794
CANDIDATE_SOURCE_COMMIT      = 98108e9e387d01b6d3c3a35cce5baf13324be50e
CANDIDATE_CLASSIFICATION     = CUMULATIVE ACCEPTED SOURCE
CANDIDATE_INCLUDES           = D1 Password Reset Core R1 + WP2 R4 Error-State Back Navigation
CANDIDATE_JS_IDENTITY        = f097f67404fb75418cf85fee635e5d630ef5474d
CANDIDATE_CSS_IDENTITY       = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
EXPECTED_SCOPE               = ALL
EXPECTED_TOPOLOGY            = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
EXPECTED_POST_REVISION       = 58
```

Do not build/deploy from canonical docs HEAD. Create/use a temporary detached worktree pinned exactly to `98108e9e387d01b6d3c3a35cce5baf13324be50e`.

Before Live execution in that worktree:
- `git rev-parse HEAD` must equal exact candidate SHA;
- `git status --porcelain` must be empty;
- candidate Git blob identities for dist JS/CSS must equal the locked identities above.

Any mismatch => STOP before write.

## 3. Deployment-Time Preflight — MUST OCCUR BEFORE UPLOAD/PUT/POST

Perform GET-only preflight immediately before invoking the one-shot Live deploy path.

Actual current App794 state must still match exactly:

```text
LIVE_REVISION                = 57
PREVIEW_REVISION             = 57
LIVE_SCOPE                   = ALL
PREVIEW_SCOPE                = ALL
LIVE_TOPOLOGY                = 1/1/0/0
PREVIEW_TOPOLOGY             = 1/1/0/0
LIVE_JS_IDENTITY             = ac22a56cb9d78001384241fe12745f7a2da3da84
LIVE_CSS_IDENTITY            = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
```

Allowed preflight GET endpoints:
- `GET /k/v1/app/customize.json?app=794`
- `GET /k/v1/preview/app/customize.json?app=794`
- `GET /k/v1/file.json?fileKey=...` for exact current Live JS/CSS FILE entries.

Never print credentials/tokens/auth headers.

If any revision/scope/topology/identity drift is observed => STOP BEFORE WRITE. Do not consume execution by attempting a repair; do not deploy; do not rollback.

## 4. Exact Release Manifest

Pass the exact manifest to existing guarded deployment tooling:

```js
const releaseManifest = {
  appId: 794,
  sourceCommit: '98108e9e387d01b6d3c3a35cce5baf13324be50e',
  expectedJsBlobSha: 'f097f67404fb75418cf85fee635e5d630ef5474d',
  expectedCssBlobSha: '0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61',
  expectedScope: 'ALL',
  expectedTopology: {
    desktopJsCount: 1,
    desktopCssCount: 1,
    mobileJsCount: 0,
    mobileCssCount: 0
  }
};
```

JS + CSS are one atomic release pair. Both must be uploaded/replaced together through the existing deployment tool. No JS-only/CSS-only substitution.

## 5. Exact Authorization / Request Config

Use exactly:

```js
const authConfig = {
  authorizationId: 'APP794-CUMULATIVE-DEPLOY-20260830-01',
  workPackageId: 'MBO-P03-WP-002C',
  stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY',
  operation: 'APP794_CUSTOMIZATION_DEPLOY',
  appId: 794,
  activeWindow: true,
  explicitUserAuthorization: true
};

const requestConfig = {
  appId: 794,
  targetAppId: 794,
  workPackageId: 'MBO-P03-WP-002C',
  stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY',
  operation: 'APP794_CUSTOMIZATION_DEPLOY'
};
```

The existing `assertApp794CustomizationDeployAuthorization(...)` guard must pass normally. Do not bypass or modify the guard.

## 6. One Attempt Rule

After all external GET-only preflight gates pass, execute exactly one guarded Live deployment invocation using existing `executeDeployCustomUi(...)` in Live mode with:
- `appId: 794`
- exact `releaseManifest`
- exact `authConfig`
- exact `requestConfig`

The one-shot attempt is consumed when this Live deployment invocation begins.

If it fails, times out, becomes ambiguous, detects new drift, or returns an unexpected state:
- STOP;
- do not retry;
- do not run a second upload/PUT/deploy;
- do not modify source;
- do not rollback automatically.

A second forward attempt or rollback requires new Control Plane review and new explicit user authorization.

## 7. Forbidden Operations

This authorization does NOT permit:
- App794 record create/update/delete;
- App800/App801/App795/App796 record write;
- schema/layout/ACL/process management changes;
- Password Reset UI or actual App801 credential reset/write;
- D2-D7 implementation work;
- source/test/script/config modification;
- alternate candidate build;
- second deploy attempt;
- rollback/recovery.

Only App794 customization file upload + preview customization PUT + deploy POST required by the exact existing deployment path are authorized.

## 8. Locked Rollback Manifest — NOT AUTHORIZED TO EXECUTE

```text
ROLLBACK_SOURCE_COMMIT       = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
ROLLBACK_JS_IDENTITY         = ac22a56cb9d78001384241fe12745f7a2da3da84
ROLLBACK_CSS_IDENTITY        = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
ROLLBACK_SCOPE               = ALL
ROLLBACK_TOPOLOGY            = 1/1/0/0
ROLLBACK_AUTHORIZED          = NO
```

If forward deploy is not technically accepted, STOP and preserve evidence. Do not rollback without separate user authorization.

## 9. Mandatory Post-Deploy Technical Readback

After deployment reports completion, perform exact readback from actual Live App794:
- current Live customization revision;
- scope;
- desktop/mobile topology and order;
- actual downloaded Live JS bytes -> Git blob SHA;
- actual downloaded Live CSS bytes -> Git blob SHA;
- deployment status;
- preview state as useful for consistency.

Technical PASS requires exactly:

```text
POST_REVISION                = 58
POST_SCOPE                   = ALL
POST_TOPOLOGY                = 1/1/0/0
POST_JS_IDENTITY             = f097f67404fb75418cf85fee635e5d630ef5474d
POST_CSS_IDENTITY            = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
EXACT_CANDIDATE_MATCH        = YES
```

Also report:

```text
DEPLOY_ATTEMPTS              = 1
APP794_RECORD_WRITE          = 0
APP800_APP801_RECORD_WRITE   = 0
SCHEMA_LAYOUT_ACL_PROCESS_WRITE = 0
SECOND_DEPLOY                = NO
AUTO_ROLLBACK                = NO
```

If post readback differs in any required identity/topology/revision, status is not PASS. STOP.

## 10. Evidence File — ONLY REPOSITORY CHANGE ALLOWED AFTER EXECUTION

Create/update exactly one executor evidence file:

`project-docs/APP794_CUMULATIVE_DEPLOYMENT_EVIDENCE.md`

Evidence must include:
- `STATUS = PENDING_CHATGPT_REVIEW`
- authorization ID and consumed status;
- execution timestamp;
- detached candidate HEAD and clean status;
- exact preflight Live/Preview revision/scope/topology/JS/CSS identities;
- exact release manifest;
- deployment attempt count;
- upload/PUT/deploy result summaries without secrets;
- post-deploy revision/scope/topology/actual byte identities;
- exact candidate match YES/NO;
- forbidden write counts;
- no second deploy / no rollback;
- any error/ambiguity/drift truthfully.

Do not modify `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, baselines, skills, source, tests, scripts, config, or canonical dist as executor.

Commit/push only the evidence file to `ai/antigravity-wp002c`, then STOP.

## 11. Delivery Contract

Deliver:
1. one Live deployment attempt maximum;
2. technical readback;
3. one evidence commit only;
4. evidence commit SHA;
5. concise result;
6. STOP for ChatGPT Independent Review and user UAT.

Maximum executor status on exact technical success:

`APP794_CUMULATIVE_DEPLOYED_TECH_READBACK_PASS_PENDING_CHATGPT_REVIEW_AND_USER_UAT`

Do not claim final acceptance/known-good until ChatGPT review + user runtime UAT pass.
