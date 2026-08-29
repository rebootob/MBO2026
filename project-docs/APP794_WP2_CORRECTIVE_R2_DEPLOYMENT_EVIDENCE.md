# APP794 WP2 CORRECTIVE R2 LIVE DEPLOYMENT EVIDENCE DOCUMENT

**Date:** 2026-08-29  
**Branch:** `ai/antigravity-wp002c`  
**Authorization ID:** `APP794-D1-WP2-CORRECTIVE-R2-DEPLOY-20260829-01`  
**Authorization Status:** `CONSUMED / GUARDED DEPLOY EXECUTED`  
**Candidate Source Commit:** `cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3`  
**Target App:** `794 ONLY`  
**Deployment Result:** `SUCCESS`  
**Deployed Revision:** `56`  
**Current Status:** `APP794_WP2_CORRECTIVE_R2_DEPLOYED_PENDING_INDEPENDENT_REVIEW_AND_USER_UAT`  

---

## 1. Execution Evidence Summary

```text
EXECUTION_CONTROL_HEAD             = 983b023f4e362ad423d8c5f1f5035a0638e3e3ae
AUTHORIZATION_ID                   = APP794-D1-WP2-CORRECTIVE-R2-DEPLOY-20260829-01
AUTHORIZATION_CONSUMED             = YES (AFTER 100% PRECHECK PASS)
PRE_DEPLOY_REVISION                = 55
PRE_DEPLOY_SCOPE                   = ALL
PRE_DEPLOY_TOPOLOGY                = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
PRE_DEPLOY_JS_IDENTITY             = eec05d4bb19130f3edc431164fc073f6b697dd8a
PRE_DEPLOY_CSS_IDENTITY            = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51

FOCUSED_TEST_RESULT                = PASS
ATTACHMENT_AUTH_REGRESSION_RESULT  = PASS
FULL_TEST_RESULT                   = PASS (957 / 957 PASS)
UI_BUILD_RESULT                    = PASS
BUILD_ONLY_RESULT                  = PASS
BUILD_ONLY_NETWORK_CALLS           = 0

CANDIDATE_SOURCE_COMMIT            = cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3
CANDIDATE_JS_BLOB_SHA              = 79787f75a1edf0721d7d6ac71216a1366599f3e0
CANDIDATE_CSS_BLOB_SHA             = b6f77930256378cbe1e190932103dfecea174fbc

DEPLOY_ATTEMPT_COUNT               = 1
UPLOADED_JS_FILEKEY                = 78e0de97-4cbf-45af-99d8-b7d3d1c80752
UPLOADED_CSS_FILEKEY               = cefe845d-50bd-48f1-bb08-49a9fe5dbed5
DEPLOY_STATUS                      = SUCCESS

POST_DEPLOY_REVISION               = 56
POST_SCOPE                         = ALL
POST_TOPOLOGY                      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
POST_JS_IDENTITY                   = 79787f75a1edf0721d7d6ac71216a1366599f3e0
POST_CSS_IDENTITY                  = b6f77930256378cbe1e190932103dfecea174fbc
POST_ATOMIC_PAIR_MATCH             = YES (EXACT BYTE-LEVEL BLOB SHA MATCH)

APP794_RECORD_WRITE                = 0
APP794_SCHEMA_LAYOUT_WRITE         = 0
APP794_ACL_PROCESS_WRITE           = 0
KINTONE_COMMENT_WRITE              = 0
APP801_WRITE                       = 0
APP795_796_WRITE                   = 0
ROLLBACK_OCCURRED                  = NO
SECOND_DEPLOY_OCCURRED             = NO
```

---

## 2. Technical Readback Result & Current Gate

- **Technical Readback Status:** `PASS 100%`
- **Maximum Status:** `APP794_WP2_CORRECTIVE_R2_DEPLOYED_PENDING_INDEPENDENT_REVIEW_AND_USER_UAT`
- **Next Required Step:** Independent Review & User Runtime UAT on App 794.
