# D1 App794 Combined Employee UI Rollback Evidence

**Date:** 2026-08-29  
**Branch:** `ai/antigravity-wp002c`  
**Rollback Execution Mode:** `ROLLBACK ONLY — NO FORWARD DEPLOY`  
**Consumed Authorization:** `APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01` (CLOSED)  
**Target App:** App794 (MBO Main Application)  
**Pre-Rollback State:** Revision 52 (Partial / Non-Exact Deployment)  
**Post-Rollback State:** Revision 53 (Restored Pre-Deploy Snapshot State)  

---

## Rollback Evidence Matrix

```text
ROLLBACK_START_HEAD                    = ce2c90191db66616a69af5feee1312372271e3d9
CURRENT_PRE_ROLLBACK_REVISION          = 52
CURRENT_PRE_ROLLBACK_JS_IDENTITY       = a4975fc219269268bf2a0caffd084d233fa3e29a
CURRENT_PRE_ROLLBACK_CSS_IDENTITY      = 1710d770ae87fb5f910d669dd5a88ea0950e6991
SNAPSHOT_REFERENCE                     = scratch/app794_live_predeploy_backup_combined_ui.json
SNAPSHOT_JS_IDENTITY                   = dbd9899ade84318921e374ce687ac435da7cc40c
SNAPSHOT_CSS_IDENTITY                  = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
ROLLBACK_ATTEMPT_COUNT                 = 1
ROLLBACK_RESULT                        = SUCCESS
POST_ROLLBACK_REVISION                 = 53
POST_ROLLBACK_SCOPE                    = ALL
POST_ROLLBACK_TOPOLOGY                 = Desktop JS: 1, Desktop CSS: 1, Mobile JS: 0, Mobile CSS: 0
POST_ROLLBACK_JS_IDENTITY              = dbd9899ade84318921e374ce687ac435da7cc40c
POST_ROLLBACK_CSS_IDENTITY             = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
POST_ROLLBACK_MOBILE_STATE             = JS: 0, CSS: 0
PRE_DEPLOY_SNAPSHOT_MATCH              = YES
FORWARD_DEPLOY_ATTEMPT_DURING_ROLLBACK = 0
SOURCE_CHANGED                         = NO
TEST_CHANGED                           = NO
APP794_RECORD_WRITE                    = 0
APP794_SCHEMA_LAYOUT_WRITE             = 0
APP794_ACL_PROCESS_WRITE               = 0
KINTONE_COMMENT_WRITE                  = 0
APP801_WRITE                           = 0
APP795_796_WRITE                       = 0
D2_D7_WRITE                            = 0
MAXIMUM_STATUS                         = ROLLED_BACK_PENDING_INDEPENDENT_REVIEW
```

---

## Detailed Rollback Execution Log

### 1. Pre-Rollback State Readback
- Current Live App794 customization revision: **`52`**
- Current Live Scope: **`ALL`**
- Current Live Desktop JS Blob SHA: `a4975fc219269268bf2a0caffd084d233fa3e29a`
- Current Live Desktop CSS Blob SHA: `1710d770ae87fb5f910d669dd5a88ea0950e6991`

### 2. Rollback Execution to Pre-Deploy Snapshot State
- Snapshot Reference: `scratch/app794_live_predeploy_backup_combined_ui.json`
- Restored pre-deploy Desktop JS file (`dbd9899ade84318921e374ce687ac435da7cc40c`) -> Uploaded fileKey: `1b392a6b-cbae-4ba7-ba15-71f3dd050dc7`
- Restored pre-deploy Desktop CSS file (`2a758a0025c1ec1917b4da19ad09bd8cd2182f51`) -> Uploaded fileKey: `1bc0e2f5-1c14-4423-8fdf-e5b8150ae80e`
- Issued PUT to `/k/v1/preview/app/customize.json` -> Preview Revision: **`53`**
- Issued POST deploy request to `/k/v1/preview/app/deploy.json` for App794
- Polling status: `[POLL 2/20] App 794 rollback status: SUCCESS`

### 3. Post-Rollback Readback Verification
- Post-rollback Live Revision: **`53`**
- Post-rollback Live Scope: **`ALL`**
- Post-rollback Live Desktop JS Blob SHA: **`dbd9899ade84318921e374ce687ac435da7cc40c`** (Snapshot match: YES)
- Post-rollback Live Desktop CSS Blob SHA: **`2a758a0025c1ec1917b4da19ad09bd8cd2182f51`** (Snapshot match: YES)
- Post-rollback Mobile State: **`0` JS / `0` CSS** (Unchanged)
- Forbidden Writes: **0** business-record, schema/form/layout, ACL/process, or Kintone comment writes performed.
