# AI ACTIVE TASK — WP1 LIVE SOURCE IDENTITY FAIL-CLOSED CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Start Point

Latest reviewed WP1 candidate:
`6e1dcce38c5e425ed5f2228ab6a49dce1a826156`

Independent verdict:
`CORRECTIVE`

Do NOT redo accepted atomic JS+CSS, mandatory manifest, or byte-exact hashing behavior. Fix only actual-source identity binding below.

## Accepted Current Live / Rollback Manifest

```text
LIVE_REVISION          = 54
ROLLBACK_SOURCE_COMMIT = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_SCOPE         = ALL
ROLLBACK_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_JS_IDENTITY   = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY  = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

No Live write is authorized.

## Accepted WP1 Behavior — Preserve Exactly

Already accepted:
- exactly one target Desktop JS `mbo-employee-app.js`;
- exactly one target Desktop CSS `mbo-employee.css`;
- both target fileKeys replaced together;
- Live `releaseManifest` required;
- manifest binds App794 + expected JS + expected CSS + scope + topology;
- byte-exact Git blob SHA over uploaded bytes;
- CRLF and LF produce different identities;
- build-only returns JS+CSS with zero network;
- unauthorized Live entrypoint blocks;
- no automatic rollback.

Do not widen this task.

## Residual Blocker A — Live Source Identity Must Be Internal, Not Caller-Supplied

Current Live entrypoint permits:
```text
options.currentGitHead || getCurrentGitHead()
```

This is forbidden because a caller can spoof the actual source identity.

Required:
- Live `executeDeployCustomUi()` MUST derive current source identity internally from the repository checkout;
- caller MUST NOT be able to override actual Git HEAD for Live execution;
- pure helper/unit tests may inject an explicit currentHead directly into helper functions, but the production Live entrypoint must never trust a caller-supplied HEAD.

Regression required:
`CALLER_GIT_HEAD_OVERRIDE_NOT_ACCEPTED_IN_LIVE_PATH`

## Residual Blocker B — Git HEAD Unresolvable Must Fail Closed

Current `getCurrentGitHead()` returns `null` on error and validation can skip source comparison.

Required:
- if Live source HEAD cannot be resolved => BLOCK before build/network/upload;
- do not silently return null and continue;
- no fallback candidate string.

Regression required:
`UNRESOLVABLE_GIT_HEAD_BLOCKED_BEFORE_LIVE_WRITE`

## Residual Blocker C — Require Exact Full Commit SHA

Current source comparison uses prefix matching.

Required Live contract:
```text
manifest.sourceCommit = exact 40-character hexadecimal Git SHA
actual repository HEAD = exact 40-character hexadecimal Git SHA
manifest.sourceCommit === actual HEAD
```

Rules:
- short SHA => BLOCK;
- malformed SHA => BLOCK;
- prefix-only match => BLOCK;
- exact full SHA => PASS.

Regressions required:
```text
SHORT_SOURCE_SHA_BLOCKED
MALFORMED_SOURCE_SHA_BLOCKED
PREFIX_SOURCE_SHA_BLOCKED
EXACT_FULL_SOURCE_SHA_PASS
```

## Residual Blocker D — Dirty Working Tree / Build Inputs Must Fail Closed

The source identity must represent the exact committed source being built.

Before Live build/network/upload:
- resolve actual Git HEAD;
- check repository cleanliness with a deterministic Git status check;
- if tracked or untracked build/source inputs are dirty => BLOCK;
- do not auto-reset, checkout, clean, stash, commit, or modify files to make the check pass.

Prefer fail-closed on any non-ignored working-tree change for Live deployment. This is safer and simpler than trying to maintain a permissive path allow-list.

Important ordering:
1. authorization/target binding may be checked first;
2. actual Git HEAD + clean working tree MUST be proven BEFORE candidate build and before any Kintone/network/upload write path;
3. then build exact candidate;
4. then compare exact JS/CSS artifact identities to manifest;
5. only a later separately authorized Live task may proceed to upload.

Regressions required:
```text
DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_OR_UPLOAD
CLEAN_WORKTREE_SOURCE_IDENTITY_PASS
```

Test helpers may inject source-state results into pure functions, but Live execution must use internally resolved repository state.

## Exact Files Allowed

Change only:
1. `scripts/kintone/deploy-custom-ui.js`
2. `tests/deploy-customization-preservation.test.js`
3. existing WP1 evidence file or one small residual evidence file

Read-only unless needed to understand build inputs:
- `scripts/kintone/build-mbo-ui.js`
- `package.json`
- exact authorization/security helper

Forbidden:
- `src/main-mbo-app.js`
- `src/ui/employee-self-index-ui.js`
- `src/ui/employee-part-a-ui.js`
- `src/styles/mbo-employee.css`
- auth/session/attachment/routing/scoring source

## Verification

Run and commit evidence for:
- `node --test tests/deploy-customization-preservation.test.js`
- relevant classic bundle/build safety test(s)
- `npm test`
- `npm run ui:build`
- module-aware build-only with 0 Kintone/network calls

Evidence must record:
```text
EXECUTION_START_HEAD
BASE_CORRECTIVE_CANDIDATE = 6e1dcce38c5e425ed5f2228ab6a49dce1a826156
SOURCE_FILES_CHANGED
TEST_FILES_CHANGED
CALLER_HEAD_OVERRIDE_BLOCK_PROOF
UNRESOLVABLE_HEAD_BLOCK_PROOF
EXACT_FULL_SHA_PROOF
DIRTY_WORKTREE_BLOCK_PROOF
CLEAN_SOURCE_IDENTITY_PROOF
ATOMIC_JS_CSS_PRESERVED
MANIFEST_BINDING_PRESERVED
BYTE_EXACT_HASH_PRESERVED
FOCUSED_TEST_RESULT
FULL_TEST_RESULT
UI_BUILD_RESULT
BUILD_ONLY_RESULT
BUILD_ONLY_NETWORK_CALLS = 0
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY = NO
FINAL_COMMIT_SHA
```

## Strictly Forbidden

- NO Live Kintone customization PUT/POST deploy
- NO upload test against Live
- NO rollback/recovery
- NO UI feature implementation/change
- NO App794 record/schema/layout/ACL/process write
- NO Kintone Comment write
- NO App801/App795/App796 write
- NO Copy Previous MBO
- NO WP2 execution
- NO D2-D7 work
- NO unrelated refactor

Commit + push source/test/evidence and STOP.

Maximum status:
`ATOMIC_DEPLOY_SOURCE_IDENTITY_CORRECTED_PENDING_INDEPENDENT_REVIEW`.
