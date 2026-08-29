# App794 Corrective Deploy Round 2 Execution Evidence

Date: 2026-08-29
Branch: `ai/antigravity-wp002c`
HEAD: `2620ef1d229dbdef815b417b48d0a4845b4b8872`

## 1. Required Evidence Summary Ledger

```text
SOURCE_HEAD_USED             = 2620ef1d229dbdef815b417b48d0a4845b4b8872
AUTHORIZATION_ID             = APP794-CORRECTIVE-DEPLOY-20260829-02
GIT_STATUS_PRE_DEPLOY       = CLEAN
NPM_TEST                     = PASS
BUILD_ONLY                   = PASS
TARGET_APP                   = 794
AUTH_GUARD_ENTERED           = YES
UPLOAD_OCCURRED              = YES
UPLOADED_TARGET              = mbo-employee-app.js
PREVIEW_PUT_OCCURRED         = YES
DEPLOY_POST_OCCURRED         = YES
DEPLOY_FINAL_STATUS          = SUCCESS
LIVE_REVISION_BEFORE         = 44
PREVIEW_REVISION_BEFORE       = 44
LIVE_REVISION_AFTER          = 45
PREVIEW_REVISION_AFTER       = 45
LIVE_TARGET_FILEKEY_AFTER    = 20260829024429C70EEA4A081647A0841339BC4301661B298
PREVIEW_TARGET_FILEKEY_AFTER = 2026082902442760241CC8E334418485AA8660121D884A214
LIVE_PREVIEW_TARGET_MATCH    = YES
APP801_WRITE                 = 0
APP794_ACL_WRITE             = 0
APP794_RECORD_WRITE          = 0
OTHER_APP_WRITE              = 0
```

## 2. Detailed Execution Sequence & Read-Back Evidence

1. **Preflight Verification:**
   - Working Tree: Clean (0 modified tracked files).
   - Registry Target: `config/sandbox-apps.json.mboV2AppId = 794`.
   - `npm test`: PASSED 100% (852/852 tests passing).
   - Build-Only check: `node --env-file=.env.local scripts/kintone/deploy-custom-ui.js --build-only` PASSED with zero Kintone network calls.

2. **One-Shot Execution:**
   - Single-use authorization `APP794-CORRECTIVE-DEPLOY-20260829-02` entered `executeDeployCustomUi()`.
   - Target bundle built: `dist/mbo-employee-app.js` (size: 426,599 bytes).
   - Preflight validation passed.
   - Upload: Replacement JS target `mbo-employee-app.js` uploaded to `/k/v1/file.json` returning `fileKey: 9a504f91-2529-4bb1-b4c7-f2e6ec243557`.
   - Preview Customization PUT: `PUT /k/v1/preview/app/customize.json` updated cleanly via `getApp794DeployRequestOptions()`.
   - Live Deploy POST: `POST /k/v1/preview/app/deploy.json` initiated deployment for App 794.
   - Deployment Polling: Check 1 = `PROCESSING`, Check 2 = `SUCCESS`.

3. **Post-Deploy GET Read-Back Inspection:**
   - `GET /k/v1/app/customize.json?app=794`:
     - Scope: `"ALL"`
     - Revision: `"45"`
     - JS File: `mbo-employee-app.js` (`fileKey: 20260829024429C70EEA4A081647A0841339BC4301661B298`, size: `426599`)
     - CSS File: `mbo-employee.css` (`fileKey: 2026082902442910A9867B3A4243929CDEC6C8B7204FA5157`, size: `37996`)
   - `GET /k/v1/preview/app/customize.json?app=794`:
     - Scope: `"ALL"`
     - Revision: `"45"`
     - JS File: `mbo-employee-app.js` (`fileKey: 2026082902442760241CC8E334418485AA8660121D884A214`, size: `426599`)
     - CSS File: `mbo-employee.css` (`fileKey: 2028082813063760BE186443AB4144814C35B7AFAE2DCE213`, size: `37996`)
   - `GET /k/v1/preview/app/deploy.json?apps[0]=794`:
     - Deploy Status: `"SUCCESS"`

4. **Governance & Authorization Status:**
   - Authorization ID `APP794-CORRECTIVE-DEPLOY-20260829-02` is **CONSUMED**.
   - Zero App801, App794 ACL, record, or other-app writes performed.
