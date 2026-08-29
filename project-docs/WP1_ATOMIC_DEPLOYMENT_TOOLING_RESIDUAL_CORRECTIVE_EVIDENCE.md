# WP1 Atomic App794 Deployment Tooling Residual Corrective Evidence

**Date:** 2026-08-29  
**Branch:** `ai/antigravity-wp002c`  
**Execution Start HEAD:** `f0e29b45e1de02b059814fac8e319ee8f513c0f0`  
**Base Rejected Candidate:** `9c96461dcde9ef3ca626b415d35398ff5d41657f`  
**Execution Mode:** `SOURCE / TEST ONLY — NO LIVE WRITE / NO DEPLOY`  
**Accepted Live Runtime:** Revision 54 (Known-Good Rev51 Content)  

---

## Verification Evidence Matrix

```text
EXECUTION_START_HEAD            = f0e29b45e1de02b059814fac8e319ee8f513c0f0
BASE_REJECTED_CANDIDATE         = 9c96461dcde9ef3ca626b415d35398ff5d41657f
SOURCE_FILES_CHANGED            = scripts/kintone/deploy-custom-ui.js
TEST_FILES_CHANGED              = tests/deploy-customization-preservation.test.js
MANIFEST_MANDATORY_PROOF        = PASS (Live validateReleaseManifest rejects missing/incomplete releaseManifest before upload)
MANIFEST_SOURCE_IDENTITY_PROOF  = PASS (Binds APP_ID=794, sourceCommit matching Git HEAD, JS/CSS blob SHAs, expectedScope, expectedTopology)
CRLF_VS_LF_HASH_PROOF           = PASS (gitBlobSha hashes raw exact bytes; CRLF vs LF produce different identities)
ATOMIC_JS_CSS_PROOF             = PASS (Requires and replaces both mbo-employee-app.js and mbo-employee.css target fileKeys)
UI_FEATURE_SOURCE_CHANGED       = NO (src/main-mbo-app.js, src/ui/employee-part-a-ui.js, src/ui/employee-self-index-ui.js 100% UNTOUCHED)
CSS_FEATURE_CHANGED             = NO (src/styles/mbo-employee.css 100% UNTOUCHED)
FOCUSED_TEST_RESULT             = PASS (22/22 tests passing in tests/deploy-customization-preservation.test.js)
FULL_TEST_RESULT                = PASS (935/935 unit & integration tests passing)
UI_BUILD_RESULT                 = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css generated cleanly)
BUILD_ONLY_RESULT               = PASS ({ app: 794, buildOnly: true } returned cleanly)
BUILD_ONLY_NETWORK_CALLS        = 0
LIVE_KINTONE_WRITE              = 0
LIVE_DEPLOY_OCCURRED            = NO
MAXIMUM_STATUS                  = ATOMIC_DEPLOY_TOOLING_CORRECTED_PENDING_INDEPENDENT_REVIEW
```

---

## Technical Correctives Implemented

1. **Mandatory Release Manifest Validation in Live Mode (`scripts/kintone/deploy-custom-ui.js`):**
   - `validateReleaseManifest()` rejects execution in Live mode if `releaseManifest` is omitted (`MISSING_RELEASE_MANIFEST_BLOCKED_PRE_UPLOAD`).
   - Validates that `manifest.appId === 794` (`MANIFEST_APP_ID_MISMATCH_BLOCKED_PRE_UPLOAD`).
   - Requires non-empty `sourceCommit`, `expectedJsBlobSha`, `expectedCssBlobSha`, `expectedScope`, and `expectedTopology` counts (`MISSING_MANIFEST_FIELD_BLOCKED_PRE_UPLOAD`).
   - Validates that `manifest.sourceCommit` matches repository HEAD (`MANIFEST_SOURCE_COMMIT_MISMATCH_BLOCKED_PRE_UPLOAD`).
   - Validates that candidate JS and CSS blob SHAs match expected manifest identities (`JS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD` / `CSS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD`).
   - Validates that live and preview scope match `expectedScope` (`MANIFEST_SCOPE_MISMATCH_BLOCKED_PRE_UPLOAD`).
   - Validates that preview customization entry counts match `expectedTopology` counts (`MANIFEST_TOPOLOGY_MISMATCH_BLOCKED_PRE_UPLOAD`).

2. **Byte-Exact Git Blob SHA Hashing (`gitBlobSha`):**
   - Removed `CRLF -> LF` string normalization from `gitBlobSha()`.
   - Hashes exact raw UTF-8 / binary bytes sent to Kintone.
   - Added regression test `GIT_BLOB_SHA_EXACT_BYTES_CRLF_DIFFERS_FROM_LF` proving different line endings produce different Git blob SHAs.

3. **Preserved Accepted WP1 Atomic Behaviors:**
   - Requires exactly 1 `mbo-employee-app.js` and 1 `mbo-employee.css` target entry in preview customization.
   - Replaces **BOTH** preview fileKeys atomically.
   - Build-only mode returns JS + CSS candidate artifact data with **0 network calls**.
   - Zero Live writes or Kintone API calls executed.
