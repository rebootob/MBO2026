# AI ACTIVE TASK — D1 APP794 SAVED ATTACHMENT PREVIEW / DOWNLOAD ONE-SHOT DEPLOY

Mode: **ANTIGRAVITY ONE-SHOT APP794 CUSTOMIZATION DEPLOY — EXACT AUTHORIZATION ONLY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision before execution: `50` (re-read actual Live state during preflight; do not assume)
Reviewed source candidate: `ec6278524a2d5eb53050d0580c340d1b4e866b97`
Independent source verdict: **PASS**
Authorization ID: `APP794-D1-ATTACHMENT-PREVIEW-DOWNLOAD-DEPLOY-20260829-01`
Authorization state at task creation: **AUTHORIZED / ONE-SHOT / UNCONSUMED**

## Exact User Authorization

User explicitly authorized:

`อนุมัติ App794 deploy Saved Attachment Preview Download corrective candidate ec627852`

This task is the only allowed use of that authorization.

## Accepted State

```text
ATTACHMENT_PERSISTENCE_SOURCE/DEPLOYMENT = PASS / REV49
LONG_FILENAME_UI_SOURCE/DEPLOYMENT       = PASS / REV50
ATTACHMENT_RETRIEVAL_SOURCE              = PASS
ATTACHMENT_RETRIEVAL_LIVE                = NOT YET DEPLOYED / REV50 STILL FAILS PREVIEW-DOWNLOAD UX
REVIEWED_CANDIDATE                       = ec6278524a2d5eb53050d0580c340d1b4e866b97
ALL_PRIOR_DEPLOY_AUTHS                    = CONSUMED / CLOSED
CURRENT_AUTH                              = APP794-D1-ATTACHMENT-PREVIEW-DOWNLOAD-DEPLOY-20260829-01
```

Accepted retrieval behavior in candidate:
- persisted saved filename clickable for Preview/Open;
- separate Download control;
- read-only saved attachments remain Preview/Download capable without Delete;
- browser Fetch GET `/k/v1/file.json` with persisted fileKey and `X-Requested-With: XMLHttpRequest`;
- no `kintone.api()` File Download transport;
- safe explicit MIME allowlist for preview;
- empty/unknown/active-content/non-allowlisted MIME => Download only;
- one synchronous popup attempt before await, never a second async popup;
- blocked popup => safe Download fallback;
- original filename preserved;
- retrieval non-destructive;
- existing Remove semantics preserved.

## Scope — Exact and Closed

```text
TARGET_APP                    = 794
WRITE_TYPE                    = KINTONE APP CUSTOMIZATION JS/CSS ONLY
REVIEWED_CANDIDATE            = ec6278524a2d5eb53050d0580c340d1b4e866b97
SOURCE CHANGE                 = FORBIDDEN
TEST CHANGE                   = FORBIDDEN
SCHEMA/LAYOUT WRITE           = FORBIDDEN
BUSINESS RECORD WRITE         = FORBIDDEN
ACL/PROCESS WRITE             = FORBIDDEN
APP801 WRITE                  = FORBIDDEN
APP795/796 WRITE              = FORBIDDEN
ROUTING/SCORING/AUTH/RESET    = FORBIDDEN
D2-D7 EXECUTION               = FORBIDDEN
EXTERNAL SERVICE/STORAGE      = FORBIDDEN
BROAD REFACTOR                = FORBIDDEN
MOBILE CUSTOMIZATION CHANGE   = FORBIDDEN
UNRELATED CUSTOMIZATION ENTRY = FORBIDDEN
```

Deploy only the accepted App794 desktop customization bundle already represented by the reviewed candidate. Do not repair, patch, refactor, or widen scope during execution.

## Mandatory Pre-Deploy Gates

Before any Live write:
1. Re-fetch latest canonical branch HEAD.
2. Read `project-docs/AI_CONTROL_CENTER.md` and this `AI_ACTIVE_TASK.md` only before execution context is established.
3. Verify authorization ID exactly matches this task and status is authorized/unconsumed.
4. Verify reviewed candidate exactly equals `ec6278524a2d5eb53050d0580c340d1b4e866b97`.
5. Verify all production source and generated App794 bundle content after the candidate has not drifted except Control Plane documentation. If unexpected source/dist drift exists: STOP, no write.
6. Run deterministic deployment preflight using existing deployment tooling. Do not modify tooling/source/tests.
7. Run focused attachment tests if required by existing deployment tooling; record exact result.
8. Run `npm run ui:build`; record exact result.
9. Run module-aware build-only; prove it makes 0 Kintone writes/calls.
10. Verify built desktop JS/CSS correspond exactly to reviewed candidate content. Unexpected build/hash/content drift => STOP, no write.
11. Read actual current App794 customization revision/settings/topology and current desktop JS/CSS identities before write.
12. Capture an exact rollback snapshot/reference of current App794 customization before the first write.

If any mandatory pre-deploy gate fails, STOP without repairing source or widening scope. Record evidence. A changed candidate/retry after corrective work requires a new explicit authorization.

## Authorized Deployment Execution

After all pre-deploy gates PASS:
1. Perform exactly one forward App794 customization deployment attempt.
2. Deploy only the reviewed App794 desktop customization JS/CSS bundle.
3. Preserve customization scope/topology; do not add/remove unrelated entries.
4. Do not change mobile customization.
5. Wait until Kintone deployment status reports SUCCESS or definitive failure.
6. Do not perform any business-record, schema/layout, ACL/process, App801/App795/App796, routing/scoring/auth/reset, or D2-D7 write.

The authorization becomes **CONSUMED** as soon as the deployment attempt occurs, whether the attempt succeeds or requires rollback.

## Mandatory Post-Deploy Readback

After the deployment attempt:
1. Read back actual App794 customization revision/settings/topology.
2. Read back actual desktop JS/CSS identities/hashes.
3. Prove the deployed Live JS/CSS match the reviewed candidate bundle exactly.
4. Prove customization topology did not drift and mobile customization was unchanged.
5. Prove no forbidden writes occurred.
6. If candidate readback/topology mismatch is detected and existing deployment tooling safely supports exact rollback, rollback only to the pre-captured snapshot, record the rollback result, and STOP. Do not make a second forward deployment under this authorization.
7. Whether success or rollback, authorization is consumed and may not be reused.

## Required Deployment Evidence

Append evidence to the existing D1 attachment evidence document at minimum:

```text
AUTHORIZATION_ID
EXECUTION_START_HEAD
REVIEWED_SOURCE_CANDIDATE_SHA
SOURCE_CHANGED_DURING_DEPLOY
TEST_CHANGED_DURING_DEPLOY
PRECHECK_RESULT
FOCUSED_TEST_RESULT_IF_RUN
UI_BUILD_RESULT
BUILD_ONLY_RESULT
PRE_DEPLOY_APP794_CUSTOMIZATION_REVISION
PRE_DEPLOY_CUSTOMIZATION_TOPOLOGY
PRE_DEPLOY_JS_IDENTITY_HASH
PRE_DEPLOY_CSS_IDENTITY_HASH
ROLLBACK_SNAPSHOT_REFERENCE
DEPLOY_ATTEMPT_COUNT
DEPLOY_RESULT
POST_DEPLOY_APP794_CUSTOMIZATION_REVISION
POST_DEPLOY_CUSTOMIZATION_TOPOLOGY
POST_DEPLOY_JS_IDENTITY_HASH
POST_DEPLOY_CSS_IDENTITY_HASH
CANDIDATE_READBACK_MATCH
CUSTOMIZATION_TOPOLOGY_DRIFT
MOBILE_CUSTOMIZATION_CHANGED
ROLLBACK_OCCURRED
ROLLBACK_REASON
APP794_RECORD_WRITE = 0
APP794_SCHEMA_LAYOUT_WRITE = 0
APP794_ACL_PROCESS_WRITE = 0
APP801_WRITE = 0
APP795_796_WRITE = 0
D2_D7_WRITE = 0
AUTHORIZATION_CONSUMED = YES
FINAL_COMMIT_SHA
```

Evidence must distinguish executor/local test/build results from Live Kintone readback.

## Finish Rule

Commit + push deployment evidence only. Do not edit production source/tests during deployment.

Maximum executor status:
`DEPLOYED_PENDING_INDEPENDENT_REVIEW`

Then STOP.

Do not self-PASS.
Do not perform User Live UAT.
Do not start HR reset, security UAT, D2-D7, or unrelated work.
