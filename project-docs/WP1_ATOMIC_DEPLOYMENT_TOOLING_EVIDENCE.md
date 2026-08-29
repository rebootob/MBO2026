# WP1 Atomic App794 Deployment Tooling Hardening Evidence

**Date:** 2026-08-29  
**Branch:** `ai/antigravity-wp002c`  
**Start HEAD:** `fa5037382ba842681f7baaa75835b4b6bd6d6e69`  
**Execution Mode:** `SOURCE / TEST / BUILD ONLY — NO LIVE WRITE / NO DEPLOY`  
**Current Accepted Live Runtime:** Revision 54 (Known-Good Rev51 Content)  

---

## Verification Evidence Matrix

```text
SOURCE_FILES_CHANGED         = scripts/kintone/deploy-custom-ui.js
TEST_FILES_CHANGED           = tests/deploy-customization-preservation.test.js
UI_FEATURE_SOURCE_CHANGED    = NO (src/main-mbo-app.js, src/ui/employee-part-a-ui.js, src/ui/employee-self-index-ui.js 100% UNTOUCHED)
CSS_FEATURE_CHANGED          = NO (src/styles/mbo-employee.css 100% UNTOUCHED)
FOCUSED_TEST_RESULT          = PASS (20/20 tests passing in tests/deploy-customization-preservation.test.js)
FULL_TEST_RESULT             = PASS (933/933 unit & integration tests passing)
NPM_RUN_UI_BUILD_RESULT      = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css built cleanly)
BUILD_ONLY_RESULT            = PASS ({ app: 794, buildOnly: true } returned cleanly)
BUILD_ONLY_NETWORK_CALLS     = 0
LIVE_KINTONE_WRITE           = 0
LIVE_DEPLOY_OCCURRED         = NO
MAXIMUM_STATUS               = ATOMIC_DEPLOY_TOOLING_IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

---

## Key Technical Correctives Implemented

1. **Atomic Candidate Release Pair Requirement (`scripts/kintone/deploy-custom-ui.js`):**
   - Candidate Desktop JS (`mbo-employee-app.js`) and Desktop CSS (`mbo-employee.css`) are required and deployed as one atomic release pair.
   - `prepareDeploymentArtifacts()` builds both JS and CSS, computes their deterministic Git blob SHA identities, and returns `{ app: 794, fullJs, cssContent, jsBlobSha, cssBlobSha }`.

2. **Preflight Target & Release Manifest Validation:**
   - Preflight requires exactly 1 `mbo-employee-app.js` FILE entry in `desktop.js` AND exactly 1 `mbo-employee.css` FILE entry in `desktop.css`.
   - Fails closed with `TARGET_CSS_MISSING_BLOCKED_PRE_UPLOAD` or `TARGET_CSS_AMBIGUOUS_BLOCKED_PRE_UPLOAD` before any network or upload operation.
   - Validates atomic release manifest via `validateReleaseManifest()`:
     - `JS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD`
     - `CSS_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD`
     - `MIXED_RELEASE_BLOCKED_PRE_UPLOAD` (if one matches and the other mismatches).

3. **Atomic Preview Customize Payload Construction:**
   - `buildPreviewCustomizePayload()` requires `newJsFileKey` AND `newCssFileKey`.
   - Replaces **BOTH** JS and CSS target fileKeys in preview customization while preserving Scope (`ALL`), topology, entry types/order, and Mobile customization (`0` JS / `0` CSS).

4. **Zero-Network Build-Only Mode:**
   - `executeDeployCustomUi({ isBuildOnly: true })` builds JS and CSS, returns artifact contents and Git blob SHA identities, and executes **0 network calls**.

5. **Test Suite Modernization (`tests/deploy-customization-preservation.test.js`):**
   - Replaced old `CSS_UPLOAD_COUNT = 0` assumption with `CSS_CANDIDATE_REPLACED_NOT_PRESERVED` test.
   - Added tests for `ATOMIC_JS_CSS_PAIR_REQUIRED`, `TARGET_CSS_MISSING_BLOCKED_PRE_UPLOAD`, `TARGET_CSS_AMBIGUOUS_BLOCKED_PRE_UPLOAD`, `MIXED_RELEASE_BLOCKED_PRE_UPLOAD`, `MANIFEST_IDENTITY_MISMATCH_BLOCKED_PRE_UPLOAD`, and `BUILD_ONLY_ZERO_NETWORK`.
   - All 20 focused tests and 933 full suite tests pass cleanly.
