# AI ACTIVE TASK — AUTHORIZED APP794 WP2 R3 ONE-SHOT DEPLOY

Mode: **ANTIGRAVITY PRECHECK + EXACTLY ONE AUTHORIZED LIVE CUSTOMIZATION DEPLOY + READBACK — NO OTHER WRITE**  
Branch: `ai/antigravity-wp002c`

## 1. Explicit User Authorization

User explicitly authorized:

`อนุมัติ App794 deploy WP2 R3 candidate 9816cef`

Canonical one-shot authorization:

```text
AUTHORIZATION_ID       = APP794-D1-WP2-R3-DEPLOY-20260829-01
AUTHORIZATION_STATUS   = ACTIVE / UNUSED
AUTHORIZED_APP         = 794 ONLY
AUTHORIZED_OPERATION   = App794 customization deploy ONLY
AUTHORIZED_ATTEMPTS    = 1
ROLLBACK_AUTHORIZED    = NO
SECOND_DEPLOY          = NO
OTHER_KINTONE_WRITES   = NO
```

This authorization is candidate-specific and must never be reused or widened.

## 2. Exact Authorized Candidate

```text
CANDIDATE_SOURCE_COMMIT = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
CANDIDATE_JS_BLOB_SHA   = ac22a56cb9d78001384241fe12745f7a2da3da84
CANDIDATE_CSS_BLOB_SHA  = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
CANDIDATE_SCOPE         = ALL
CANDIDATE_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

Do NOT use the incorrect old evidence field `cab6db3...` as the R3 release source commit.

## 3. Required Current Live Baseline Before Authorization Is Consumed

The current Live customization MUST still read back exactly as:

```text
PRE_DEPLOY_LIVE_REVISION     = 56
PRE_DEPLOY_LIVE_JS_IDENTITY  = 79787f75a1edf0721d7d6ac71216a1366599f3e0
PRE_DEPLOY_LIVE_CSS_IDENTITY = b6f77930256378cbe1e190932103dfecea174fbc
PRE_DEPLOY_SCOPE             = ALL
PRE_DEPLOY_TOPOLOGY          = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

If revision, JS identity, CSS identity, scope, topology, or any customization state differs unexpectedly: **STOP BEFORE LIVE WRITE. DO NOT CONSUME AUTHORIZATION.**

## 4. Execution Sequence — Mandatory

### Step A — Read authorization from canonical branch FIRST
1. Fetch latest `ai/antigravity-wp002c`.
2. Read:
   - `project-docs/AI_CONTROL_CENTER.md`
   - `project-docs/AI_ACTIVE_TASK.md`
   - `project-docs/CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md`
   - `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
3. Confirm the exact authorization ID and manifest above are ACTIVE/UNUSED.
4. Preserve these exact authorization values for this execution.

### Step B — Checkout exact authorized candidate
Because hardened deployment tooling requires release `sourceCommit == current Git HEAD`, checkout the exact release commit in a clean detached worktree:

```text
9816cef195b6d3ffe039e5fb92c8dc8406c8967a
```

Do NOT deploy from the later docs-only branch HEAD.

Required:
- exact 40-character HEAD match;
- clean worktree;
- no source/test/dist edits.

### Step C — Pre-deploy validation BEFORE any Live write
Run and record:
- focused WP2 R3 tests including CSS structure, My MBO table, real Back runtime integration, Comment table/API contract;
- attachment/auth regression;
- full `npm test`;
- `npm run ui:build`;
- clean rebuild with tracked `dist/` diff = 0;
- hardened build-only = PASS;
- build-only network calls = 0.

Verify exact committed/generated identities:

```text
SOURCE_HEAD = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
JS_IDENTITY = ac22a56cb9d78001384241fe12745f7a2da3da84
CSS_IDENTITY = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
```

Then perform a **read-only Live customization preflight** and verify the exact Rev56 baseline in Section 3.

If ANY test/build/hash/worktree/preflight check fails: **STOP. NO LIVE WRITE.**

## 5. Authorized Live Operation — EXACTLY ONE Attempt

Only after every precheck passes, execute exactly one guarded App794 customization deployment using the hardened `executeDeployCustomUi()` path and a release manifest bound to:

```text
appId        = 794
sourceCommit = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
jsBlobSha    = ac22a56cb9d78001384241fe12745f7a2da3da84
cssBlobSha   = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
scope        = ALL
topology     = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
authorizationId = APP794-D1-WP2-R3-DEPLOY-20260829-01
```

The authorization becomes **CONSUMED/CLOSED** when the authorized Live customization write is initiated. It may not be used again, regardless of result.

## 6. Mandatory Post-deploy Readback

After the single deploy attempt:
1. Read current App794 customization revision/state.
2. Download/read the actual deployed Desktop JS and CSS resources.
3. Hash exact bytes and verify:

```text
POST_JS_IDENTITY  = ac22a56cb9d78001384241fe12745f7a2da3da84
POST_CSS_IDENTITY = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
POST_SCOPE         = ALL
POST_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

4. Record actual post-deploy revision.
5. Prove forbidden writes = 0.

If post-deploy readback differs in ANY way:
- STOP;
- NO second deploy;
- NO automatic rollback;
- NO recovery write;
- report mismatch for Control Plane decision.

## 7. Strictly Forbidden

- NO second App794 customization deploy.
- NO automatic rollback/recovery.
- NO App794 business-record write.
- NO form/schema/layout write.
- NO ACL/process write.
- NO Kintone Comment POST/DELETE/reply.
- NO Auth/session semantic change.
- NO Attachment behavior change.
- NO Routing/Scoring change.
- NO App801/App795/App796 writes.
- NO protected legacy writes.
- NO Copy Previous MBO.
- NO D2-D7 execution.
- NO source/test/dist modification.

## 8. Evidence and Completion

After readback, safely return to `ai/antigravity-wp002c` and commit/push **EVIDENCE ONLY**. Do not modify source/tests/dist.

Evidence must record:

```text
AUTHORIZATION_ID
AUTHORIZATION_STATUS = CONSUMED / CLOSED (only if Live write initiated)
DEPLOY_ATTEMPTS
EXECUTION_CANDIDATE_HEAD
PRE_DEPLOY_REVISION
PRE_DEPLOY_JS_IDENTITY
PRE_DEPLOY_CSS_IDENTITY
PRE_DEPLOY_SCOPE_TOPOLOGY
FOCUSED_TEST_RESULT
ATTACHMENT_AUTH_REGRESSION_RESULT
FULL_TEST_RESULT
UI_BUILD_RESULT
CLEAN_REBUILD_DIST_DIFF
BUILD_ONLY_RESULT
BUILD_ONLY_NETWORK_CALLS
POST_DEPLOY_REVISION
POST_JS_IDENTITY
POST_CSS_IDENTITY
POST_SCOPE_TOPOLOGY
TECHNICAL_READBACK_RESULT
APP794_RECORD_WRITE = 0
APP794_SCHEMA_LAYOUT_ACL_PROCESS_WRITE = 0
COMMENT_WRITE_COUNT = 0
APP801_APP795_APP796_WRITE = 0
SECOND_DEPLOY = NO
AUTO_ROLLBACK = NO
LIVE_DEPLOY_OCCURRED
FINAL_EVIDENCE_COMMIT_SHA
```

If successful, maximum executor status:

`APP794_WP2_R3_DEPLOYED_PENDING_INDEPENDENT_REVIEW_AND_USER_UAT`

Then STOP.