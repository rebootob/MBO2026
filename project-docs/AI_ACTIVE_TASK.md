# AI ACTIVE TASK — APP794 CORRECTIVE DEPLOY / AUTHORIZED ONE-SHOT ROUND 2

Mode: **LIVE APP794 CUSTOMIZATION DEPLOY — EXACT ONE-SHOT AUTHORIZATION**
Branch: `ai/antigravity-wp002c`
Max status: `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Authorization

User explicitly authorized:
`อนุมัติ App794 Corrective Deploy รอบใหม่`

Use only this new authorization:
```text
authorizationId          = APP794-CORRECTIVE-DEPLOY-20260829-02
workPackageId            = MBO-P03-WP-002C
stage                    = STAGE_D1_APP794_CUSTOMIZATION_DEPLOY
operation                = APP794_CUSTOMIZATION_DEPLOY
appId                    = 794
activeWindow             = true
explicitUserAuthorization= true
```

The prior authorization `APP794-CORRECTIVE-DEPLOY-20260829-01` is CONSUMED and MUST NOT be reused.

Exact guard payloads:

```js
authConfig = {
  authorizationId: 'APP794-CORRECTIVE-DEPLOY-20260829-02',
  workPackageId: 'MBO-P03-WP-002C',
  stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY',
  operation: 'APP794_CUSTOMIZATION_DEPLOY',
  appId: 794,
  activeWindow: true,
  explicitUserAuthorization: true
};

requestConfig = {
  workPackageId: 'MBO-P03-WP-002C',
  stage: 'STAGE_D1_APP794_CUSTOMIZATION_DEPLOY',
  operation: 'APP794_CUSTOMIZATION_DEPLOY',
  appId: 794
};
```

## Accepted preconditions

```text
APP794_DEPLOY_GUARD_INTEGRATION    = PASS
APP794_DEPLOY_PROVENANCE_RECOVERY  = PASS
APP794_DEPLOY_TOOLING_SOURCE_FIX   = PASS
APP794_DEPLOY_TOOLING_TEST_CLOSURE = PASS / ACCEPTED AT 93d12a4abd143176da082c386b49e9dfeeed7629
APP794_DEPLOY_TOOLING_CORRECTIVE   = PASS
APP794 ACL                          = PASS / revision 44
```

Current Live still has old artifact. This task is to deploy only the already accepted corrective App794 artifact.

## Exact authorized scope

Before any live write:
1. sync latest `ai/antigravity-wp002c`;
2. read `AI_DOCUMENT_INDEX.md`, `AI_CONTROL_CENTER.md`, and this file;
3. `git status` must be clean;
4. confirm `config/sandbox-apps.json.mboV2AppId` is exact integer `794`;
5. run focused/full tests required by current deploy tooling; `npm test` must pass;
6. run `node scripts/kintone/deploy-custom-ui.js --build-only`; must pass and perform zero network;
7. if any precondition fails: STOP, no upload/write.

Then execute exactly one live attempt via `executeDeployCustomUi()` using the authConfig/requestConfig above.

Authorized live sequence only:
1. GET current Live/Preview customization preflight;
2. upload replacement `mbo-employee-app.js` only;
3. PUT `/k/v1/preview/app/customize.json` for App794 only;
4. POST `/k/v1/preview/app/deploy.json` for App794 only;
5. poll exact App794 deploy status;
6. GET/read-back Live + Preview customization/revision/file identity;
7. record concise evidence;
8. STOP. Do not perform user UAT yourself.

Accepted artifact scope only:
- module-aware bundle;
- create-handler corrective;
- Employee-Self shell / visible Logout;
- My MBO history + Completed display;
- Employee-Self delete guard;
- accepted deploy-tooling corrective.

## Critical one-shot rule

Once `assertApp794CustomizationDeployAuthorization(...)` succeeds, or any upload/write begins, authorization `APP794-CORRECTIVE-DEPLOY-20260829-02` is CONSUMED for governance purposes.

If any transport/result becomes uncertain after guard entry/upload/PUT/POST:
- DO NOT RETRY;
- do not generate a new authorization yourself;
- recover evidence/read-back only where safe;
- STOP for Control Plane review.

## Forbidden

- NO App801 write
- NO App794 ACL write
- NO App794 business-record write
- NO routing/scoring/workflow change
- NO source change to Login/Auth/Create business logic
- NO Employee-Self source change
- NO Reset Password admin UI implementation
- NO CSS replacement unless already part of unchanged existing customization and merely preserved by payload
- NO Auth Bridge / external service
- NO D2-D7 work
- NO automatic retry
- NO self-PASS

## Required evidence

Return/commit concise evidence with:
```text
SOURCE_HEAD_USED = ...
AUTHORIZATION_ID = APP794-CORRECTIVE-DEPLOY-20260829-02
GIT_STATUS_PRE_DEPLOY = CLEAN / FAIL
NPM_TEST = PASS / FAIL
BUILD_ONLY = PASS / FAIL
TARGET_APP = 794
AUTH_GUARD_ENTERED = YES / NO
UPLOAD_OCCURRED = YES / NO
UPLOADED_TARGET = mbo-employee-app.js / NONE
PREVIEW_PUT_OCCURRED = YES / NO
DEPLOY_POST_OCCURRED = YES / NO
DEPLOY_FINAL_STATUS = SUCCESS / FAIL / CANCEL / TIMEOUT / UNCERTAIN / NOT_REACHED
LIVE_REVISION_BEFORE = ...
PREVIEW_REVISION_BEFORE = ...
LIVE_REVISION_AFTER = ...
PREVIEW_REVISION_AFTER = ...
LIVE_TARGET_FILEKEY_AFTER = ...
PREVIEW_TARGET_FILEKEY_AFTER = ...
LIVE_PREVIEW_TARGET_MATCH = YES / NO / UNKNOWN
APP801_WRITE = 0
APP794_ACL_WRITE = 0
APP794_RECORD_WRITE = 0
OTHER_APP_WRITE = 0
```

Commit/push evidence/status docs only if deployment was attempted. Then STOP and wait for independent ChatGPT review.

## Authorization state

```text
APP794 DEPLOY        = YES / ONE-SHOT
APP794 FILE UPLOAD   = YES / TARGET JS ONLY
APP794 PREVIEW WRITE = YES / EXACT CUSTOMIZATION PUT ONLY
APP794 DEPLOY POST   = YES / EXACT APP794 ONLY
APP794 ACL WRITE     = NO
APP794 RECORD WRITE  = NO
APP801 WRITE         = NO
SOURCE CHANGE        = NO
BUSINESS SOURCE      = NO
EXTERNAL SERVICE     = NO
D2-D7 WRITE          = NO
```
