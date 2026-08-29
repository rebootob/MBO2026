# WP1 Atomic App794 Deployment Tooling Source-Identity Residual Corrective Evidence

**Date:** 2026-08-29  
**Branch:** `ai/antigravity-wp002c`  
**Execution Start HEAD:** `0b2a96bebb5278a3c400f3b5885c0e49fea77d55`  
**Base Corrective Candidate:** `6e1dcce38c5e425ed5f2228ab6a49dce1a826156`  
**Execution Mode:** `SOURCE / TEST ONLY — NO LIVE WRITE / NO DEPLOY`  
**Accepted Live Runtime:** Revision 54 (Known-Good Rev51 Content)  

---

## Verification Evidence Matrix

```text
EXECUTION_START_HEAD            = 0b2a96bebb5278a3c400f3b5885c0e49fea77d55
BASE_CORRECTIVE_CANDIDATE       = 6e1dcce38c5e425ed5f2228ab6a49dce1a826156
SOURCE_FILES_CHANGED            = scripts/kintone/deploy-custom-ui.js
TEST_FILES_CHANGED              = tests/deploy-customization-preservation.test.js
CALLER_HEAD_OVERRIDE_BLOCK_PROOF = PASS (Live executeDeployCustomUi ignores options.currentGitHead override and derives Git HEAD internally)
UNRESOLVABLE_HEAD_BLOCK_PROOF   = PASS (Throws UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_LIVE_WRITE if HEAD cannot be resolved or is malformed)
EXACT_FULL_SHA_PROOF            = PASS (Requires exact 40-character hexadecimal match; rejects short, malformed, or prefix-only SHAs)
DIRTY_WORKTREE_BLOCK_PROOF      = PASS (isWorktreeClean checks tracked status & source/build input directories; throws DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_OR_UPLOAD)
CLEAN_SOURCE_IDENTITY_PROOF     = PASS (Valid 40-char commit SHA matching clean Git HEAD passes preflight identity gate)
ATOMIC_JS_CSS_PRESERVED         = PASS (Replaces both mbo-employee-app.js and mbo-employee.css target fileKeys)
MANIFEST_BINDING_PRESERVED      = PASS (Mandatory releaseManifest binds App794, sourceCommit, JS/CSS SHAs, scope, topology)
BYTE_EXACT_HASH_PRESERVED       = PASS (gitBlobSha hashes raw exact uploaded bytes without CRLF normalization)
UI_FEATURE_SOURCE_CHANGED       = NO (src/main-mbo-app.js, src/ui/employee-part-a-ui.js, src/ui/employee-self-index-ui.js 100% UNTOUCHED)
CSS_FEATURE_CHANGED             = NO (src/styles/mbo-employee.css 100% UNTOUCHED)
FOCUSED_TEST_RESULT             = PASS (25/25 tests passing in tests/deploy-customization-preservation.test.js)
FULL_TEST_RESULT                = PASS (938/938 unit & integration tests passing)
UI_BUILD_RESULT                 = PASS (dist/mbo-employee-app.js & dist/mbo-employee.css generated cleanly)
BUILD_ONLY_RESULT               = PASS ({ app: 794, buildOnly: true } returned cleanly)
BUILD_ONLY_NETWORK_CALLS        = 0
LIVE_KINTONE_WRITE              = 0
LIVE_DEPLOY_OCCURRED            = NO
MAXIMUM_STATUS                  = ATOMIC_DEPLOY_SOURCE_IDENTITY_CORRECTED_PENDING_INDEPENDENT_REVIEW
```

---

## Technical Correctives Implemented

1. **Internal Live Source Identity Resolution (`getCurrentGitHead`):**
   - Live `executeDeployCustomUi()` derives repository Git HEAD internally.
   - Caller cannot override actual Live Git HEAD via `options.currentGitHead` (`CALLER_GIT_HEAD_OVERRIDE_NOT_ACCEPTED_IN_LIVE_PATH`).
   - Unresolvable or malformed Git HEAD fails closed before build/network/upload (`UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_LIVE_WRITE`).

2. **Strict Full 40-Character SHA Validation:**
   - Manifest `sourceCommit` and repository `currentGitHead` must both be exact 40-character hexadecimal strings (`/^[0-9a-f]{40}$/i`).
   - Short SHA (<40 chars) fails closed (`SHORT_SOURCE_SHA_BLOCKED`).
   - Non-hex characters fail closed (`MALFORMED_SOURCE_SHA_BLOCKED`).
   - Prefix-only matching fails closed (`PREFIX_SOURCE_SHA_BLOCKED`).
   - Comparison uses exact string equality (`manifestSha === actualHeadSha`).

3. **Fail-Closed Dirty Working Tree Validation (`isWorktreeClean`):**
   - Runs `git status --porcelain` before build/network/upload in Live mode.
   - Any uncommitted modification to tracked files or any untracked file in `src/`, `scripts/`, `tests/`, `config/`, or `package.json` fails closed (`DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_OR_UPLOAD`).
   - Does NOT auto-reset, checkout, stash, clean, or alter repository state.

4. **Preserved Accepted WP1 Atomic & Manifest Behaviors:**
   - Requires exactly 1 `mbo-employee-app.js` and 1 `mbo-employee.css` target entry in preview customization.
   - Replaces **BOTH** preview fileKeys atomically.
   - Mandatory `releaseManifest` object in Live mode.
   - Byte-exact `gitBlobSha` over uploaded bytes.
   - Build-only mode returns JS + CSS candidate artifact data with **0 network calls**.
