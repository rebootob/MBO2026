# AI ACTIVE TASK — D1 APP794 EDIT ATTACHMENT CORRECTIVE ONE-SHOT DEPLOY

Mode: **ANTIGRAVITY ONE-SHOT APP794 CUSTOMIZATION DEPLOY — EXACT AUTHORIZATION ONLY**
Branch: `ai/antigravity-wp002c`
Reviewed source candidate: `0282a0c00d54c846353f4d830874c514c6546468`
Independent source verdict: **PASS**
Authorization ID: `APP794-D1-EDIT-ATTACHMENT-DEPLOY-20260829-01`

## Accepted State

```text
APP794_LIVE_CUSTOMIZATION_REVISION = 47
APP794_LIVE_FORM_REVISION          = 48
OBJECTIVE_ATTACHMENT_FIELDS        = FILE 10/10
MIDYEAR_ATTACHMENT_FIELDS          = FILE 10/10
FINAL_ATTACHMENT_FIELDS            = FILE 10/10
INITIAL_SAVE_ONE_FILE              = PASS
INITIAL_SAVE_MULTIPLE_FILES        = PASS
EDIT_ADD_NEW_FILE                  = LIVE FAIL ON REV47 / FIX CANDIDATE REVIEWED PASS
EDIT_MULTI_FILE_PRESERVATION       = LIVE FAIL ON REV47 / FIX CANDIDATE REVIEWED PASS
SCHEMA_AUTHORIZATION               = CONSUMED / CLOSED
DEPLOY_AUTHORIZATION               = AUTHORIZED / ONE-SHOT / UNCONSUMED AT TASK CREATION
```

## Exact User Authorization

User explicitly authorized:

`อนุมัติ App794 deploy D1 Edit Attachment Preservation corrective candidate 0282a0c`

This authorization applies only to deploying the already-reviewed candidate customization to App794. It does not authorize source fixes, schema/layout changes, business-record writes, ACL/process changes, or any other app.

## Mandatory Pre-Deploy Gate

Before any Kintone customization write:

1. Re-fetch canonical branch HEAD.
2. Read `project-docs/AI_CONTROL_CENTER.md` and this file.
3. Verify reviewed candidate is still exactly `0282a0c00d54c846353f4d830874c514c6546468`.
4. Verify production source and generated candidate bundle have not drifted after `0282a0c...`; only Control Plane docs may differ.
5. Run deterministic preflight.
6. Run focused attachment tests if required by existing deploy tooling/safety gate; do not modify tests/source to make them pass.
7. Run `npm run ui:build`.
8. Run module-aware build-only deployment check and prove 0 Kintone writes.
9. Verify the built JS/CSS correspond to the reviewed candidate; unexpected hash/content drift => STOP.
10. Read current App794 customization settings/revision and capture JS/CSS identities.
11. Capture a rollback snapshot of current App794 customization before write.

If any gate fails, STOP. Do not repair, patch, widen scope, or deploy. Record evidence only. A new authorization is required for any changed candidate/retry after corrective work.

## Authorized Deployment Scope

Only after all pre-deploy gates PASS:

```text
TARGET_APP                    = 794
WRITE_TYPE                    = KINTONE APP CUSTOMIZATION JS/CSS ONLY
REVIEWED_CANDIDATE            = 0282a0c00d54c846353f4d830874c514c6546468
SOURCE CHANGE                 = FORBIDDEN
SCHEMA/LAYOUT WRITE           = FORBIDDEN
BUSINESS RECORD WRITE         = FORBIDDEN
ACL/PROCESS WRITE             = FORBIDDEN
APP801 WRITE                  = FORBIDDEN
APP795/796 WRITE              = FORBIDDEN
ROUTING/SCORING/AUTH/RESET    = FORBIDDEN
D2-D7 EXECUTION               = FORBIDDEN
EXTERNAL SERVICE/STORAGE      = FORBIDDEN
BROAD REFACTOR                = FORBIDDEN
```

Deploy only the reviewed App794 desktop customization bundle generated from the accepted source. Do not add/remove unrelated customization entries or mobile customization.

## Post-Deploy Readback

After customization write:

1. Wait for Kintone deployment status `SUCCESS`.
2. Read back App794 customization revision/settings.
3. Read back deployed desktop JS/CSS identities.
4. Prove deployed JS/CSS match the reviewed candidate bundle exactly.
5. Verify no unexpected customization topology change.
6. Verify no business-record, schema/layout, ACL/process, App801, App795, or App796 write occurred.
7. If readback does not match candidate, execute rollback using the captured snapshot if existing deploy tooling safely supports the exact rollback; record result and STOP. Do not attempt a second forward deploy under this authorization.

## Required Evidence

Append deployment evidence to the existing D1 attachment corrective evidence document. Record at minimum:

```text
AUTHORIZATION_ID
EXECUTION_START_HEAD
REVIEWED_SOURCE_CANDIDATE_SHA
SOURCE_CHANGED_DURING_DEPLOY
PRECHECK_RESULT
FOCUSED_TEST_RESULT_IF_RUN
UI_BUILD_RESULT
BUILD_ONLY_RESULT
PRE_DEPLOY_APP794_CUSTOMIZATION_REVISION
PRE_DEPLOY_JS_IDENTITY_HASH
PRE_DEPLOY_CSS_IDENTITY_HASH
ROLLBACK_SNAPSHOT_REFERENCE
DEPLOY_RESULT
POST_DEPLOY_APP794_CUSTOMIZATION_REVISION
POST_DEPLOY_JS_IDENTITY_HASH
POST_DEPLOY_CSS_IDENTITY_HASH
CANDIDATE_READBACK_MATCH
CUSTOMIZATION_TOPOLOGY_DRIFT
ROLLBACK_OCCURRED
ROLLBACK_REASON
APP794_RECORD_WRITE = 0
APP794_SCHEMA_LAYOUT_WRITE = 0
APP794_ACL_PROCESS_WRITE = 0
APP801_WRITE = 0
APP795_796_WRITE = 0
AUTHORIZATION_CONSUMED = YES
FINAL_COMMIT_SHA
```

Commit + push deployment evidence only after execution. Do not edit production source as part of evidence recording.

## Stop Rule

After one deployment attempt, authorization is consumed whether the attempt succeeds or rolls back. STOP for independent review.

Maximum executor status:
`DEPLOYED_PENDING_INDEPENDENT_REVIEW`

Do not self-PASS the deployment. Do not perform Live functional UAT on behalf of the user.

## User UAT After Independent Deployment Review PASS

```text
1. Existing 1 file + add 1 -> both remain.
2. Existing multiple files + add 1 -> all old + new remain.
3. Existing multiple files + add multiple -> all remain.
4. Remove one saved file -> only selected file removed.
5. Remove + add -> exact desired state.
6. Change attachments on multiple objectives in one Save -> every target persists correctly.
7. No attachment change -> ordinary Edit Save unaffected.
8. Mid-Year / Final(Self) regression.
```
