# AI ACTIVE TASK — APP794 COMBINED EMPLOYEE UI ONE-SHOT DEPLOY

Mode: **ANTIGRAVITY ONE-SHOT APP794 CUSTOMIZATION DEPLOY — EXACT AUTHORIZATION ONLY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision before execution: expected prior known `51`, but executor MUST read actual current revision before any write.

Authorization ID:
`APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01`

Authorization state:
`AUTHORIZED / UNCONSUMED`

Reviewed release candidate:
`ea5254370360321d18bd768f379986609c241850`

Reviewed bundle identities:
```text
DIST_JS_BLOB_SHA  = a4975fc219269268bf2a0caffd084d233fa3e29a
DIST_CSS_BLOB_SHA = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
```

## Authorized User Scope — Exactly All Three UI Features

Deploy the already-reviewed App794 Desktop customization containing exactly:
1. Existing Detail/Edit: `← กลับหน้า My MBO / Back to My MBO`; Create hides it.
2. My MBO home: responsive card/list UI; exact Employee_Code scope; Fiscal_Year desc; Open MBO for non-completed; View History for completed; unchanged record URLs; zero Delete UI.
3. Existing Detail/Edit: Native Kintone Comment read-only mirror + Refresh with accepted ascending pagination semantics.

This task does NOT authorize any new feature, redesign, source correction, test correction, Copy Previous MBO, or unrelated work.

## Mandatory Pre-Deploy Gates — Complete Before First Live Write

1. Fetch latest `ai/antigravity-wp002c`.
2. Read ONLY initially:
   - `project-docs/AI_CONTROL_CENTER.md`
   - `project-docs/AI_ACTIVE_TASK.md`
3. Verify authorization ID exactly matches and is `AUTHORIZED / UNCONSUMED`.
4. Verify reviewed candidate exactly:
   `ea5254370360321d18bd768f379986609c241850`.
5. Verify no production source/test/dist drift after the reviewed candidate except control/evidence documentation.
6. Run deterministic deploy preflight.
7. Run focused tests only if required by existing deploy preflight/tooling. Do not change source/tests.
8. Run `npm run ui:build`.
9. Verify generated Desktop JS/CSS are exactly the reviewed candidate identities above. Any mismatch => STOP, NO DEPLOY.
10. Run module-aware build-only and prove `0` Live Kintone network calls/writes.
11. Read actual current App794 customization state:
    - customization revision;
    - scope/settings;
    - Desktop JS entries/topology;
    - Desktop CSS entries/topology;
    - Mobile customization entries/topology;
    - current JS/CSS identity hashes.
12. Capture an exact rollback snapshot/reference of the full pre-deploy App794 customization BEFORE the first write.

Prior known topology is Scope ALL / 1 Desktop JS / 1 Desktop CSS / 0 Mobile, but DO NOT assume it is still true. If actual topology is unexpected or unsafe, STOP before write.

## Authorized Execution

After ALL pre-deploy gates pass:
- perform exactly ONE forward deployment attempt;
- target App794 Desktop customization JS/CSS only;
- deploy only the reviewed candidate `ea5254370360321d18bd768f379986609c241850`;
- preserve customization scope/topology except replacing the authorized Desktop JS/CSS content as required;
- do not change mobile customization;
- do not add/remove/reorder unrelated customization entries;
- wait for Kintone SUCCESS or definitive failure.

**Authorization consumption rule:**
`AUTHORIZATION_CONSUMED = YES` immediately when the first forward deployment attempt is made, regardless of success, failure, or rollback. No second forward deploy attempt is allowed under this authorization.

## Strict Forbidden Actions

- NO source change;
- NO test change;
- NO unrelated generated bundle change;
- NO App794 form/schema/layout write;
- NO App794 business-record write;
- NO Kintone Comment POST/DELETE/reply;
- NO ACL/process write;
- NO Auth/Session behavior change;
- NO Attachment behavior change;
- NO Routing/Scoring/profile change;
- NO App801/App795/App796 write;
- NO Copy Previous MBO;
- NO D2-D7 execution;
- NO external service/storage;
- NO User Live UAT.

## Mandatory Post-Deploy Readback

After the deployment attempt:
1. read Kintone deployment result;
2. read post-deploy App794 customization revision;
3. read post-deploy customization scope/topology;
4. read post-deploy JS/CSS identities;
5. prove exact reviewed-candidate readback match;
6. prove mobile customization unchanged;
7. prove no unrelated customization topology drift;
8. prove zero forbidden writes.

If the forward deploy succeeds but exact candidate/topology readback fails, and the captured rollback snapshot can be restored safely and exactly, perform rollback ONLY to that pre-deploy snapshot and STOP. Do not make another forward deployment attempt.

## Required Deployment Evidence

Commit and push deployment evidence only. Record at minimum:

```text
AUTHORIZATION_ID
EXECUTION_START_HEAD
REVIEWED_SOURCE_CANDIDATE_SHA
REVIEWED_JS_BLOB_SHA
REVIEWED_CSS_BLOB_SHA
SOURCE_CHANGED_DURING_DEPLOY = NO
TEST_CHANGED_DURING_DEPLOY = NO
PRECHECK_RESULT
FOCUSED_TEST_RESULT_IF_RUN
UI_BUILD_RESULT
BUILD_ONLY_RESULT
PRE_DEPLOY_APP794_CUSTOMIZATION_REVISION
PRE_DEPLOY_CUSTOMIZATION_SCOPE
PRE_DEPLOY_CUSTOMIZATION_TOPOLOGY
PRE_DEPLOY_JS_IDENTITY_HASH
PRE_DEPLOY_CSS_IDENTITY_HASH
PRE_DEPLOY_MOBILE_CUSTOMIZATION_STATE
ROLLBACK_SNAPSHOT_REFERENCE
DEPLOY_ATTEMPT_COUNT
DEPLOY_RESULT
POST_DEPLOY_APP794_CUSTOMIZATION_REVISION
POST_DEPLOY_CUSTOMIZATION_SCOPE
POST_DEPLOY_CUSTOMIZATION_TOPOLOGY
POST_DEPLOY_JS_IDENTITY_HASH
POST_DEPLOY_CSS_IDENTITY_HASH
POST_DEPLOY_MOBILE_CUSTOMIZATION_STATE
CANDIDATE_READBACK_MATCH
CUSTOMIZATION_TOPOLOGY_DRIFT
MOBILE_CUSTOMIZATION_CHANGED
ROLLBACK_OCCURRED
ROLLBACK_REASON
APP794_RECORD_WRITE = 0
APP794_SCHEMA_LAYOUT_WRITE = 0
APP794_ACL_PROCESS_WRITE = 0
KINTONE_COMMENT_WRITE = 0
APP801_WRITE = 0
APP795_796_WRITE = 0
D2_D7_WRITE = 0
AUTHORIZATION_CONSUMED = YES if deploy attempted
FINAL_COMMIT_SHA
```

Evidence must clearly distinguish executor-local tests/builds from Live Kintone pre/post readback.

Do not modify Control Plane verdicts yourself. Do not self-PASS.

Maximum executor status:
`DEPLOYED_PENDING_INDEPENDENT_REVIEW`

Commit + push deployment evidence and STOP.