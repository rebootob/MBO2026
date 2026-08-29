# AI ACTIVE TASK — APP794 COMBINED EMPLOYEE UI ROLLBACK ONLY

Mode: **ANTIGRAVITY ROLLBACK-ONLY — NO FORWARD DEPLOY**
Branch: `ai/antigravity-wp002c`

Consumed authorization:
`APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01`

Authorization state:
`CONSUMED / CLOSED`

## Independent Review Result

The one-shot forward deployment was attempted once and App794 moved from customization rev51 to rev52.

Reviewed candidate identities:
```text
REVIEWED_JS_BLOB_SHA  = a4975fc219269268bf2a0caffd084d233fa3e29a
REVIEWED_CSS_BLOB_SHA = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
```

Live post-deploy identities reported by executor:
```text
LIVE_REV52_JS_IDENTITY  = a4975fc219269268bf2a0caffd084d233fa3e29a
LIVE_REV52_CSS_IDENTITY = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

Therefore:
`EXACT_CANDIDATE_READBACK_MATCH = NO`.

The CSS mismatch is material because the reviewed Combined Employee UI candidate includes CSS changes for the Back navigation and My MBO card/list presentation.
User Live evidence also reports:
1. My MBO list still does not match the designed card/list presentation.
2. Back to My MBO button is not visible.

Deployment verdict:
`CORRECTIVE — PARTIAL / NON-EXACT DEPLOYMENT`.

## Authorized Action — Rollback Only

The original one-shot authorization already permitted rollback ONLY to the captured exact pre-deploy snapshot if candidate readback mismatched.

Restore exactly the captured pre-deploy App794 customization state:
```text
EXPECTED_PRE_DEPLOY_REVISION_STATE = rev51 customization content
PRE_DEPLOY_SCOPE                   = ALL
PRE_DEPLOY_TOPOLOGY                = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
PRE_DEPLOY_JS_IDENTITY             = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
PRE_DEPLOY_CSS_IDENTITY            = 1710d770ae87fb5f910d669dd5a88ea0950e6991
ROLLBACK_SNAPSHOT                  = scratch/app794_live_predeploy_backup_combined_ui.json
                                     scratch/app794_preview_predeploy_backup_combined_ui.json
```

## Mandatory Rollback Gates

1. Fetch latest canonical branch.
2. Read `project-docs/AI_CONTROL_CENTER.md` and this file.
3. Confirm authorization is CONSUMED / CLOSED.
4. Confirm current Live App794 state before rollback:
   - current customization revision;
   - Scope;
   - Desktop/Mobile topology;
   - JS/CSS identities.
5. Confirm current Live state is the reviewed partial rev52 state above. If unexpected drift exists, STOP without write and record it.
6. Confirm rollback snapshot exists and exactly represents the pre-deploy state above.
7. Do NOT rebuild source as rollback material.
8. Do NOT substitute repository candidate files for snapshot content.

## Rollback Execution

If all rollback gates pass:
- restore exactly the captured pre-deploy customization snapshot;
- this is rollback, NOT a second forward deployment;
- preserve Scope ALL and topology 1 Desktop JS / 1 Desktop CSS / 0 Mobile;
- wait for Kintone deploy result;
- no second rollback attempt if state is ambiguous; STOP for Control Plane review.

## Mandatory Post-Rollback Readback

Record:
```text
ROLLBACK_START_HEAD
CURRENT_PRE_ROLLBACK_REVISION
CURRENT_PRE_ROLLBACK_JS_IDENTITY
CURRENT_PRE_ROLLBACK_CSS_IDENTITY
SNAPSHOT_REFERENCE
SNAPSHOT_JS_IDENTITY
SNAPSHOT_CSS_IDENTITY
ROLLBACK_ATTEMPT_COUNT
ROLLBACK_RESULT
POST_ROLLBACK_REVISION
POST_ROLLBACK_SCOPE
POST_ROLLBACK_TOPOLOGY
POST_ROLLBACK_JS_IDENTITY
POST_ROLLBACK_CSS_IDENTITY
POST_ROLLBACK_MOBILE_STATE
PRE_DEPLOY_SNAPSHOT_MATCH
FORWARD_DEPLOY_ATTEMPT_DURING_ROLLBACK = 0
SOURCE_CHANGED = NO
TEST_CHANGED = NO
APP794_RECORD_WRITE = 0
APP794_SCHEMA_LAYOUT_WRITE = 0
APP794_ACL_PROCESS_WRITE = 0
KINTONE_COMMENT_WRITE = 0
APP801_WRITE = 0
APP795_796_WRITE = 0
D2_D7_WRITE = 0
```

Commit and push rollback evidence only, then STOP.

## Strictly Forbidden

- NO second forward deploy of `ea525437...` under the consumed authorization;
- NO attempt to upload only the missing CSS as a fix;
- NO source correction during rollback;
- NO UI redesign during rollback;
- NO record/schema/layout/ACL/process/comment write;
- NO App801/App795/App796 write;
- NO Copy Previous MBO;
- NO D2-D7 execution;
- NO User Live UAT during rollback.

Maximum executor status:
`ROLLED_BACK_PENDING_INDEPENDENT_REVIEW`

After rollback is independently accepted, ChatGPT Control Plane will diagnose both:
1. why the deploy tooling used the wrong CSS identity;
2. why Back to My MBO did not appear in the user-observed Detail/Edit runtime.

Any later forward deployment requires a NEW explicit user authorization.
