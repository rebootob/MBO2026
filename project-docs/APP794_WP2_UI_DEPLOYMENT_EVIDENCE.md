# APP794 WP2 UI LIVE DEPLOYMENT EVIDENCE DOCUMENT

**Date:** 2026-08-29  
**Branch:** `ai/antigravity-wp002c`  
**Authorization ID:** `APP794-D1-WP2-UI-DEPLOY-20260829-01`  
**Authorization Status:** `CONSUMED / GUARDED DEPLOY EXECUTED`  
**Candidate Source Commit:** `90ba66e33c056807dc79717c3c787f37e80bb1b6`  
**Target App:** `794 ONLY`  
**Deployment Result:** `SUCCESS`  
**Deployed Revision:** `55`  
**Current Status:** `APP794_WP2_UI_DEPLOYED_PENDING_USER_UAT`  

---

## 1. Candidate Manifest & Pre-Deploy Verification

```text
CANDIDATE_SOURCE_COMMIT  = 90ba66e33c056807dc79717c3c787f37e80bb1b6
CANDIDATE_JS_BLOB_SHA    = eec05d4bb19130f3edc431164fc073f6b697dd8a
CANDIDATE_CSS_BLOB_SHA   = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
CANDIDATE_SCOPE          = ALL
CANDIDATE_TOPOLOGY       = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0

FULL_TEST_RESULT         = PASS (953 / 953 tests passing across 8 suites)
UI_BUILD_RESULT          = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css)
BUILD_ONLY_CHECK         = PASS (executeDeployCustomUi build-only mode)
BUILD_ONLY_NETWORK_CALLS = 0
TRACKED_DIST_DIFF        = 0
```

---

## 2. Pre-Deploy Live Baseline Readback

```text
PRE_DEPLOY_LIVE_REVISION = 54
PRE_DEPLOY_LIVE_SCOPE    = ALL
PRE_DEPLOY_LIVE_TOPOLOGY = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
PRE_DEPLOY_JS_IDENTITY   = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
PRE_DEPLOY_CSS_IDENTITY  = 1710d770ae87fb5f910d669dd5a88ea0950e6991
PRE_DEPLOY_BASELINE      = REV54 KNOWN-GOOD (VERIFIED & MATCHED EXACTLY)
```

---

## 3. Guarded Execution & Post-Deploy Technical Readback

```text
AUTHORIZATION_CONSUMED   = APP794-D1-WP2-UI-DEPLOY-20260829-01
UPLOADED_JS_FILEKEY      = d94944cf-596d-4b29-9fe4-5c38335e0dea
UPLOADED_CSS_FILEKEY     = d11404c0-de72-429e-843b-dc6b02913277
PREVIEW_CUSTOMIZE_PUT    = SUCCESS
LIVE_APP_DEPLOY_STATUS   = SUCCESS

POST_DEPLOY_REVISION     = 55
POST_SCOPE               = ALL
POST_TOPOLOGY            = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
POST_JS_IDENTITY         = eec05d4bb19130f3edc431164fc073f6b697dd8a
POST_CSS_IDENTITY        = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
POST_ATOMIC_PAIR_MATCH   = YES (EXACT BYTE-LEVEL BLOB SHA MATCH)

FORBIDDEN_WRITES_AUDIT:
  APP794_RECORD_WRITE    = 0
  SCHEMA_LAYOUT_WRITE    = 0
  ACL_PROCESS_WRITE      = 0
  COMMENT_WRITE          = 0
  APP801_WRITE           = 0
  APP795_796_WRITE       = 0
```

---

## 4. Rollback Reference Manifest (For Incident Safety Only — Not Invoked)

```text
ROLLBACK_SOURCE_COMMIT   = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_REVISION        = 54
ROLLBACK_SCOPE           = ALL
ROLLBACK_TOPOLOGY        = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_JS_IDENTITY     = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY    = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

---

## 5. Technical Readback Result & Next Action

- **Technical Readback Status:** `PASS 100%`
- **Maximum Status:** `APP794_WP2_UI_DEPLOYED_PENDING_USER_UAT`
- **Next Required Step:** User runtime UAT on App 794.
