# D1 App794 Combined Employee UI Deployment Evidence

**Date:** 2026-08-29  
**Branch:** `ai/antigravity-wp002c`  
**Authorization ID:** `APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01`  
**Authorization Status:** `CONSUMED`  
**Reviewed Release Candidate:** `ea5254370360321d18bd768f379986609c241850`  
**Target App:** App794 (MBO Main Application)  
**Deployment Scope:** Desktop Customization JS/CSS Only  

---

## Deployment Evidence Matrix

```text
AUTHORIZATION_ID                         = APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01
EXECUTION_START_HEAD                     = 4c84a5ce3e6c51f13eb68e7a85de67cdbbba5880
REVIEWED_SOURCE_CANDIDATE_SHA            = ea5254370360321d18bd768f379986609c241850
REVIEWED_JS_BLOB_SHA                     = a4975fc219269268bf2a0caffd084d233fa3e29a
REVIEWED_CSS_BLOB_SHA                    = 1710d770ae87fb5f910d669dd5a88ea0950e6991
SOURCE_CHANGED_DURING_DEPLOY             = NO
TEST_CHANGED_DURING_DEPLOY               = NO
PRECHECK_RESULT                          = PASS
FOCUSED_TEST_RESULT_IF_RUN               = PASS (8/8 navigation/comment tests PASS; 73/73 attachment/timeline tests PASS)
UI_BUILD_RESULT                          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css generated cleanly)
BUILD_ONLY_RESULT                        = PASS (0 Live Kintone network calls/writes)
PRE_DEPLOY_APP794_CUSTOMIZATION_REVISION = 51
PRE_DEPLOY_CUSTOMIZATION_SCOPE           = ALL
PRE_DEPLOY_CUSTOMIZATION_TOPOLOGY        = Desktop JS: 1, Desktop CSS: 1, Mobile JS: 0, Mobile CSS: 0
PRE_DEPLOY_JS_IDENTITY_HASH              = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
PRE_DEPLOY_CSS_IDENTITY_HASH             = 1710d770ae87fb5f910d669dd5a88ea0950e6991
PRE_DEPLOY_MOBILE_CUSTOMIZATION_STATE    = JS: 0, CSS: 0
ROLLBACK_SNAPSHOT_REFERENCE              = scratch/app794_live_predeploy_backup_combined_ui.json & scratch/app794_preview_predeploy_backup_combined_ui.json
DEPLOY_ATTEMPT_COUNT                     = 1
DEPLOY_RESULT                            = SUCCESS
POST_DEPLOY_APP794_CUSTOMIZATION_REVISION= 52
POST_DEPLOY_CUSTOMIZATION_SCOPE          = ALL
POST_DEPLOY_CUSTOMIZATION_TOPOLOGY       = Desktop JS: 1, Desktop CSS: 1, Mobile JS: 0, Mobile CSS: 0
POST_DEPLOY_JS_IDENTITY_HASH             = a4975fc219269268bf2a0caffd084d233fa3e29a
POST_DEPLOY_CSS_IDENTITY_HASH            = 1710d770ae87fb5f910d669dd5a88ea0950e6991
POST_DEPLOY_MOBILE_CUSTOMIZATION_STATE   = JS: 0, CSS: 0
CANDIDATE_READBACK_MATCH                 = YES (Post-deploy Live JS Blob SHA a4975fc219269268bf2a0caffd084d233fa3e29a matches reviewed candidate exactly)
CUSTOMIZATION_TOPOLOGY_DRIFT             = NO
MOBILE_CUSTOMIZATION_CHANGED             = NO
ROLLBACK_OCCURRED                        = NO
ROLLBACK_REASON                          = NONE
APP794_RECORD_WRITE                      = 0
APP794_SCHEMA_LAYOUT_WRITE               = 0
APP794_ACL_PROCESS_WRITE                 = 0
KINTONE_COMMENT_WRITE                    = 0
APP801_WRITE                             = 0
APP795_796_WRITE                         = 0
D2_D7_WRITE                              = 0
AUTHORIZATION_CONSUMED                   = YES
MAXIMUM_STATUS                           = DEPLOYED_PENDING_INDEPENDENT_REVIEW
```

---

## Detailed Deployment Operations Log

### 1. Pre-Deploy Safety Gates & Hash Verification
- Pre-deploy Live App794 customization revision read: **`51`**
- Pre-deploy Live Scope: **`ALL`**
- Pre-deploy Topology: **Desktop JS: 1, Desktop CSS: 1, Mobile JS: 0, Mobile CSS: 0**
- Pre-deploy Live Desktop JS Blob SHA: `e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8`
- Pre-deploy Live Desktop CSS Blob SHA: `1710d770ae87fb5f910d669dd5a88ea0950e6991`
- Pre-deploy Rollback Snapshot saved to:
  - `scratch/app794_live_predeploy_backup_combined_ui.json`
  - `scratch/app794_preview_predeploy_backup_combined_ui.json`
- Local candidate JS Blob SHA (`dist/mbo-employee-app.js`): `a4975fc219269268bf2a0caffd084d233fa3e29a` (Matches reviewed candidate `ea5254370360321d18bd768f379986609c241850` exactly)

### 2. Forward Deployment Execution
- Uploaded candidate `mbo-employee-app.js` -> Kintone fileKey: `330e8542-c4fa-4fcf-8097-6bd869f864a1`
- PUT preview customization to App794 -> Preview Revision: **`52`**
- POST deploy request to `/k/v1/preview/app/deploy.json` for App794
- Polled deploy status: `[POLL 1/20] App 794 status: SUCCESS`

### 3. Post-Deploy Readback & Verification
- Post-deploy Live App794 customization revision: **`52`**
- Post-deploy Live Scope: **`ALL`** (Match: YES)
- Post-deploy Live Desktop JS Blob SHA: **`a4975fc219269268bf2a0caffd084d233fa3e29a`** (Candidate match: YES)
- Post-deploy Live Desktop CSS Blob SHA: **`1710d770ae87fb5f910d669dd5a88ea0950e6991`** (Match: YES)
- Mobile customization: **`0` JS / `0` CSS** (Unchanged: YES)
- Zero record/schema/layout/ACL/comment writes performed.
