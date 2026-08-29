# AI ACTIVE TASK — AUTHORIZED APP794 WP2 CORRECTIVE R2 ONE-SHOT LIVE DEPLOY

Mode: **ANTIGRAVITY GUARDED LIVE DEPLOY — EXACTLY ONE ATTEMPT**  
Branch: `ai/antigravity-wp002c`

## 1. Authorization

User authorization text:
`อนุมัติ App794 deploy WP2 corrective R2 candidate cab6db3`

```text
AUTHORIZATION_ID       = APP794-D1-WP2-CORRECTIVE-R2-DEPLOY-20260829-01
AUTHORIZATION_STATUS   = ACTIVE / UNCONSUMED
TARGET_APP             = 794 ONLY
WORK_PACKAGE           = MBO-P03-WP-002C
STAGE                  = STAGE_D1_APP794_CUSTOMIZATION_DEPLOY
OPERATION              = APP794_CUSTOMIZATION_DEPLOY
AUTHORIZED_ATTEMPTS    = 1
ROLLBACK_AUTHORIZED    = NO
OTHER_KINTONE_WRITES   = NO
```

Use exactly this authorization config when the deploy function is invoked:

```js
const authConfig = {
  authorizationId: 'APP794-D1-WP2-CORRECTIVE-R2-DEPLOY-20260829-01',
  appId: 794,
  workPackageId: 'MBO-P03-WP-002C',
  stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY',
  operation: 'APP794_CUSTOMIZATION_DEPLOY',
  activeWindow: true,
  explicitUserAuthorization: true
};

const requestConfig = {
  appId: 794,
  workPackageId: 'MBO-P03-WP-002C',
  stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY',
  operation: 'APP794_CUSTOMIZATION_DEPLOY'
};
```

The old authorization `APP794-D1-WP2-UI-DEPLOY-20260829-01` is CONSUMED/CLOSED forever. Never reuse it.

## 2. Exact Candidate Manifest

```text
CANDIDATE_SOURCE_COMMIT = cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3
CANDIDATE_JS_BLOB_SHA   = 79787f75a1edf0721d7d6ac71216a1366599f3e0
CANDIDATE_CSS_BLOB_SHA  = b6f77930256378cbe1e190932103dfecea174fbc
CANDIDATE_SCOPE         = ALL
CANDIDATE_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

Use this exact release manifest:

```js
const releaseManifest = {
  appId: 794,
  sourceCommit: 'cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3',
  expectedJsBlobSha: '79787f75a1edf0721d7d6ac71216a1366599f3e0',
  expectedCssBlobSha: 'b6f77930256378cbe1e190932103dfecea174fbc',
  expectedScope: 'ALL',
  expectedTopology: {
    desktopJsCount: 1,
    desktopCssCount: 1,
    mobileJsCount: 0,
    mobileCssCount: 0
  }
};
```

## 3. Current Live Baseline — Must Match Before Authorization Consumption

Expected actual Live immediately before this deploy:

```text
PRE_DEPLOY_REVISION = 55
PRE_DEPLOY_SCOPE    = ALL
PRE_DEPLOY_TOPOLOGY = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
PRE_DEPLOY_JS       = eec05d4bb19130f3edc431164fc073f6b697dd8a
PRE_DEPLOY_CSS      = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
PRE_DEPLOY_USER_UAT = FAIL
```

Rollback reference only — NOT authorized:

```text
ROLLBACK_SOURCE_COMMIT = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_REVISION      = 54
ROLLBACK_JS            = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS           = 1710d770ae87fb5f910d669dd5a88ea0950e6991
ROLLBACK_SCOPE         = ALL
ROLLBACK_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

## 4. Execution Procedure — Exact Order

1. Fetch latest `ai/antigravity-wp002c`.
2. Read this file, `AI_CONTROL_CENTER.md`, `CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md`, and `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` BEFORE checkout.
3. Record the control-doc branch HEAD used to read this authorization.
4. Checkout exact candidate commit `cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3` in detached HEAD.
5. Require clean worktree.
6. Run focused WP2 Back/My MBO/Comment tests, attachment/auth regression, and full `npm test`. Any failure => STOP.
7. Run `npm run ui:build`; require zero tracked dist diff.
8. Run hardened `executeDeployCustomUi({ appId:794, isBuildOnly:true })`; prove network/Kintone calls = 0.
9. Verify exact built Git-blob identities: JS `79787f75a1edf0721d7d6ac71216a1366599f3e0`, CSS `b6f77930256378cbe1e190932103dfecea174fbc`. Any mismatch => STOP.
10. BEFORE invoking Live `executeDeployCustomUi`, perform independent READ-ONLY Kintone readback of current Live App794 customization and actual file bytes. Require exact Revision 55, Scope ALL, topology 1/1/0/0, JS `eec05d...`, CSS `2a758a...`. Any drift => STOP. Do not consume authorization.
11. Only after every gate above passes, invoke `executeDeployCustomUi()` exactly ONCE with `appId:794`, the exact `authConfig`, `requestConfig`, and `releaseManifest` above.
12. Do not invoke the deploy function a second time for any reason under this authorization.
13. Poll deployment status to terminal result.
14. After SUCCESS, READ Live customization again, download deployed JS/CSS bytes, compute Git blob SHA, and verify exact atomic candidate pair + scope/topology.
15. Verify forbidden writes remain zero.
16. Return to branch `ai/antigravity-wp002c`; create/push EVIDENCE ONLY. Do not modify source/tests/dist after deployment.
17. STOP and await independent review + user UAT.

## 5. Mandatory Post-Deploy Evidence

```text
EXECUTION_CONTROL_HEAD
AUTHORIZATION_ID
AUTHORIZATION_CONSUMED
PRE_DEPLOY_REVISION
PRE_DEPLOY_SCOPE
PRE_DEPLOY_TOPOLOGY
PRE_DEPLOY_JS_IDENTITY
PRE_DEPLOY_CSS_IDENTITY
FOCUSED_TEST_RESULT
ATTACHMENT_AUTH_REGRESSION_RESULT
FULL_TEST_RESULT
UI_BUILD_RESULT
BUILD_ONLY_RESULT
BUILD_ONLY_NETWORK_CALLS = 0
CANDIDATE_SOURCE_COMMIT
CANDIDATE_JS_BLOB_SHA
CANDIDATE_CSS_BLOB_SHA
DEPLOY_ATTEMPT_COUNT = 1
DEPLOY_STATUS
POST_DEPLOY_REVISION
POST_SCOPE
POST_TOPOLOGY
POST_JS_IDENTITY
POST_CSS_IDENTITY
POST_ATOMIC_PAIR_MATCH
APP794_RECORD_WRITE = 0
APP794_SCHEMA_LAYOUT_WRITE = 0
APP794_ACL_PROCESS_WRITE = 0
KINTONE_COMMENT_WRITE = 0
APP801_WRITE = 0
APP795_796_WRITE = 0
ROLLBACK_OCCURRED = NO
SECOND_DEPLOY_OCCURRED = NO
FINAL_EVIDENCE_COMMIT_SHA
```

## 6. Fail-Closed Rules

If any pre-deploy test, build, identity, clean-worktree, Live revision/scope/topology/hash check fails or is ambiguous: **STOP BEFORE LIVE WRITE**.

If the single deploy attempt fails, times out ambiguously, or post-deploy readback differs from the exact candidate: **STOP**. No second deploy, no CSS-only/JS-only hotfix, and no automatic rollback/recovery. Rollback requires separate explicit user authorization.

Strictly forbidden under this authorization:
- App794 business-record writes;
- form/schema/layout changes;
- ACL/process changes;
- Kintone Comment POST/DELETE/reply;
- App801/App795/App796 writes;
- protected legacy app writes;
- Copy Previous MBO;
- D2-D7 work;
- unrelated source/test/dist changes.

Maximum status after a technically successful deployment:
`APP794_WP2_CORRECTIVE_R2_DEPLOYED_PENDING_INDEPENDENT_REVIEW_AND_USER_UAT`
