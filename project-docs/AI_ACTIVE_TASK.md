# AI ACTIVE TASK — APP794 UI/UX V1 CONTROLLED DEPLOY — AUTHORIZED SINGLE-USE

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Target: App794 `MBO V2 Sandbox`
> Mode: PROJECT CLOSE MODE / UIUX V1 DEPLOY
> Kintone write/deploy authorization: **AUTHORIZED — SINGLE USE / APP794 DESKTOP CUSTOMIZATION ONLY**

## Authorization record

User authorization received exactly:
`อนุมัติ controlled App794 UI/UX V1 deploy`

Authorization classification:
- `AUTHORIZATION_STATUS = ACTIVE_FOR_ONE_EXECUTION_ONLY`
- `AUTHORIZED_APP = 794`
- `AUTHORIZED_CHANGE = EXACT_REVIEWED_DESKTOP_JS_CSS_CUSTOMIZATION_DEPLOY_ONLY`
- `AUTHORIZED_FILE_UPLOAD_MAX = 2` (1 reviewed JS + 1 reviewed CSS)
- `AUTHORIZED_CUSTOMIZATION_PUT_MAX = 1`
- `AUTHORIZED_DEPLOY_POST_MAX = 1`
- `AUTHORIZED_RECORD_WRITE_COUNT = 0`
- `AUTHORIZED_WORKFLOW_ACTION_COUNT = 0`
- `AUTHORIZED_PROCESS_CHANGE_COUNT = 0`
- `AUTHORIZED_SCHEMA_ACL_NOTIFICATION_CHANGE_COUNT = 0`
- `AUTHORIZED_OTHER_APP_WRITE_COUNT = 0`
- `AUTHORIZATION_REUSE = FORBIDDEN`

This authorization is consumed by the next Antigravity execution attempt whether that attempt completes or STOPs after a safety gate. A rerun after STOP requires fresh explicit user authorization.

## Independent review result

`POST_CORE_UIUX_V1_CANDIDATE_R2 = PASS`

Reviewed candidate commit:
`eca0de0b6ef9169ef10b7750dc6f29e03c458a09`

Locked candidate artifacts at that commit:
- `dist/mbo-employee-app.js` Git blob: `f3b19a3565159fb2414dfd546a12741642b4b810`
- `dist/mbo-employee.css` Git blob: `cac608dbc7494b65ab364055e687d6c50c2648b2`
- deploy script `scripts/kintone/deploy-custom-ui.js` Git blob: `fbac06156833f76ad73bb24a050f56a1298daee4`

Accepted candidate gates:
- Core V1 frozen behavior preserved.
- Exact UI topology classifier recognizes only `M1_G1`, `M1_M2_G1`, `M1_G1_G2`, `M1_M2_G1_G2`.
- non-empty invalid/blank topology display fails closed with warning.
- G2 variants are display-only unsupported-current-V1 warnings.
- invalid `M2` cannot expose First Manager route.
- M1_G1/M1_M2_G1 presentation rules PASS.
- status05/status10 lifecycle presentation PASS.
- HTML escaping/non-mutation PASS.
- build-only path exits before Kintone client/API/upload/deploy.
- reported test suite: `555 total PASS` / R2 explicit UI file `96 PASS`.
- R2 Kintone calls/writes/deploys = 0.

Observation accepted, not a deploy blocker: R2 retained representative review-phase assertions (03/08/13) rather than all R1 detailed assertions; R2 did not modify the already-reviewed stage-nav behavior for 04/09/14/15.

# AUTHORIZED DEPLOYMENT MANIFEST — EXECUTE EXACTLY ONCE

## What
Deploy the exact reviewed UI/UX V1 R2 candidate to App794 desktop customization only, then perform post-deploy readback and read-only browser smoke.

## Where
- App794 only.
- Desktop JS/CSS customization only.
- No mobile customization change.
- No record/process/schema/ACL/notification/routing/scoring changes.

## Pre-write safety gate — mandatory, immediately before first write

1. Pull and verify branch HEAD equals this authorized task commit and candidate source/artifacts have not drifted.
2. Verify candidate Git blobs still exactly:
   - JS `f3b19a3565159fb2414dfd546a12741642b4b810`
   - CSS `cac608dbc7494b65ab364055e687d6c50c2648b2`
   - deploy script `fbac06156833f76ad73bb24a050f56a1298daee4`
   If any differ: STOP before Kintone write.
3. Calculate and record SHA-256 of exact candidate JS/CSS before upload.
4. Fresh GET/readback App794 live + preview:
   - revision;
   - current desktop JS/CSS customization fileKeys/config;
   - mobile customization config;
   - Process state/action count;
   - status15 assignee;
   - six profile snapshot fields used by frozen Core.
5. Create a **fresh immediately-pre-write App794 customization backup** containing enough information/assets/fileKeys to restore the current customization. Verify backup readability before write.
6. Confirm Process remains exactly 16 states / 28 actions and status15 remains the current Sandbox boundary `ONE + USER: hr`.
7. Confirm no unexpected live/preview/customization drift from the last reviewed App794 state. If unknown/material drift exists: STOP and preserve evidence.
8. Mobile customization must be preserved exactly. If live mobile customization is non-empty or differs from the deployment script's empty mobile payload, do not overwrite it; STOP and report rather than silently clearing mobile assets.

## Authorized writes — exact maximum

After all pre-write gates PASS:
- upload exact reviewed JS file: 1 file upload;
- upload exact reviewed CSS file: 1 file upload;
- App794 preview customization PUT: exactly 1;
- App794 deploy POST: exactly 1.

The customization payload must change only App794 desktop JS/CSS to the exact candidate files and preserve the reviewed mobile state.

No source modification/rebuild is authorized during deployment. If rebuild is required or artifact hash differs: STOP.

## Post-deploy verification

1. Poll deploy to SUCCESS.
2. GET/readback live + preview App794 customization and revision.
3. Download/read back deployed JS/CSS when possible and verify SHA-256 exactly equals the locked pre-upload candidate hashes.
4. Verify Process still 16/28 and status15 still `ONE + USER: hr`.
5. Verify six frozen profile snapshot fields remain unchanged/present.
6. Verify mobile customization unchanged.
7. Read-only browser smoke on real App794 page:
   - no record create/edit/delete;
   - no workflow action;
   - confirm custom UI loads;
   - no fatal MBO JavaScript errors;
   - status guidance/header/route summary/lifecycle render visibly on an accessible existing record if one exists; if no safe existing record exists, use create-show only if it causes zero record write, otherwise smoke the app shell without creating data;
   - do not use real-user workflow/notification testing.
8. Record rollback readiness using the fresh pre-write backup. Roll back only if deployment/runtime is broken and rollback is within the authorized customization-only scope; otherwise STOP and request review.

## Hard boundaries

Forbidden:
- Process PUT or workflow remap;
- schema/ACL/notification changes;
- App794 record create/edit/delete/workflow action;
- App795/App53/App796/other-app writes;
- source/test/dist edits or rebuild after authorization;
- mobile customization clearing/change;
- admin-form business workflow actions;
- real-user workflow/notification tests;
- Dashboard work.

## Required evidence

```text
APP794_UIUX_V1_DEPLOY = COMPLETE / BLOCKED
AUTHORIZATION_CONSUMED = YES
AUTHORIZED_CANDIDATE_COMMIT = eca0de0b6ef9169ef10b7750dc6f29e03c458a09
CANDIDATE_JS_GIT_BLOB = f3b19a3565159fb2414dfd546a12741642b4b810
CANDIDATE_CSS_GIT_BLOB = cac608dbc7494b65ab364055e687d6c50c2648b2
CANDIDATE_JS_SHA256 = actual
CANDIDATE_CSS_SHA256 = actual
PREWRITE_LIVE_REVISION = actual
PREWRITE_PREVIEW_REVISION = actual
PREWRITE_PROCESS_STATE_COUNT = 16
PREWRITE_PROCESS_ACTION_COUNT = 28
PREWRITE_STATUS15_ASSIGNEE = USER:hr / exact actual
PREWRITE_BACKUP_PATH = actual
PREWRITE_BACKUP_READABLE = PASS/FAIL
PREWRITE_MOBILE_CUSTOMIZATION_PRESERVED_GATE = PASS/FAIL
FILE_UPLOAD_COUNT = actual
CUSTOMIZATION_PUT_COUNT = actual
DEPLOY_POST_COUNT = actual
POSTDEPLOY_LIVE_REVISION = actual
POSTDEPLOY_PREVIEW_REVISION = actual
POSTDEPLOY_JS_SHA256_MATCH = PASS/FAIL
POSTDEPLOY_CSS_SHA256_MATCH = PASS/FAIL
POSTDEPLOY_PROCESS_16_28 = PASS/FAIL
POSTDEPLOY_STATUS15_UNCHANGED = PASS/FAIL
POSTDEPLOY_SIX_PROFILE_FIELDS_UNCHANGED = PASS/FAIL
POSTDEPLOY_MOBILE_CUSTOMIZATION_UNCHANGED = PASS/FAIL
BROWSER_UI_LOAD = PASS/FAIL
BROWSER_FATAL_MBO_ERROR_COUNT = actual
APP794_RECORD_WRITE_COUNT = 0
WORKFLOW_ACTION_COUNT = 0
PROCESS_CHANGE_COUNT = 0
SCHEMA_CHANGE_COUNT = 0
ACL_CHANGE_COUNT = 0
NOTIFICATION_CHANGE_COUNT = 0
APP795_WRITE = 0
APP53_WRITE = 0
APP796_WRITE = 0
OTHER_APP_WRITE = 0
ROLLBACK_EXECUTED = YES/NO
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW; IF PASS MOVE TO DASHBOARD SPRINT
```

# STOP CONDITION

This authorization is single-use. If any pre-write safety gate fails, STOP with zero Kintone writes and mark authorization consumed; do not retry automatically.
After the authorized deploy + verification evidence is committed and pushed: STOP for ChatGPT review. Do not start Dashboard work automatically.
