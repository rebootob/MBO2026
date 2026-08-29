# AI ACTIVE TASK — WP1 PRE-BUILD SOURCE GATE + DETERMINISTIC TEST CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Start Point

Latest reviewed WP1 candidate:
`2e8b05aa989b2e0ba9406b134824db7f2b5f509c`

Independent verdict:
`CORRECTIVE`

Do NOT redo accepted atomic JS+CSS, mandatory manifest, byte-exact hashing, internal HEAD resolution or real Live dirty-tree check. Fix only the final residuals below.

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
- Live actual Git HEAD is derived internally, not caller override;
- unresolved/malformed actual HEAD blocks;
- exact full 40-char source SHA validation exists;
- real Live working-tree cleanliness check happens before build;
- build-only returns JS+CSS with zero network;
- unauthorized Live entrypoint blocks;
- no automatic rollback.

Do not widen this task.

## Final Blocker A — Source Manifest Gate Must Run Before Build and Network

Current Live flow checks actual HEAD + clean tree before build, but it does not validate `releaseManifest.sourceCommit` against actual HEAD until after candidate build and after Kintone GET live/preview.

Required Live ordering:
```text
1. authorization / App794 target binding
2. resolve actual Git HEAD internally
3. resolve real worktree cleanliness internally
4. PRE-BUILD SOURCE MANIFEST GATE:
   - releaseManifest exists
   - manifest.appId === 794
   - manifest.sourceCommit is exact 40-char hex SHA
   - manifest.sourceCommit === actual Git HEAD exactly
   - worktreeClean === true
5. ONLY AFTER gate passes: build candidate JS/CSS
6. ONLY AFTER build: Kintone GET live + preview customization
7. validate built JS/CSS identities + expected scope/topology
8. upload/write remains forbidden in this task
```

A missing/wrong/malformed source manifest MUST fail before candidate build and before any Kintone/network call.

Recommended narrow implementation:
- extract a pure helper such as `validateLiveSourceState({ manifest, currentGitHead, worktreeClean })`;
- this helper performs only pre-build source binding checks;
- Live `executeDeployCustomUi()` obtains `currentGitHead` and `worktreeClean` internally and calls the helper before `prepareDeploymentArtifacts()`;
- later `validateReleaseManifest()` may continue validating artifact JS/CSS + scope/topology, but must not be the first place sourceCommit mismatch is detected.

Required regressions:
```text
MISSING_RELEASE_MANIFEST_BLOCKED_BEFORE_BUILD_AND_NETWORK
SOURCE_COMMIT_MISMATCH_BLOCKED_BEFORE_BUILD_AND_NETWORK
SHORT_SOURCE_SHA_BLOCKED_BEFORE_BUILD_AND_NETWORK
MALFORMED_SOURCE_SHA_BLOCKED_BEFORE_BUILD_AND_NETWORK
DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK
EXACT_CLEAN_SOURCE_STATE_PASS_PREBUILD_GATE
```

## Final Blocker B — Dirty/Clean Unit Tests Must Be Deterministic

Current dirty-worktree test depends on the real Git checkout being dirty while tests run. That is forbidden because the same committed test can fail in a clean checkout.

Required:
- test the pure source-state helper with explicit `worktreeClean: false` for dirty case;
- test with explicit `worktreeClean: true` for clean case;
- do NOT make unit-test PASS/FAIL depend on `git status` of the test runner;
- keep a small separate integration/helper sanity check for `isWorktreeClean()` if useful, but it must not assert a fixed dirty result;
- focused suite must pass both before commit and after a clean checkout/commit.

Required regressions:
```text
PURE_DIRTY_STATE_FALSE_BLOCKS
PURE_CLEAN_STATE_TRUE_PASSES
FOCUSED_TESTS_CLEAN_CHECKOUT_SAFE
```

## Exact Files Allowed

Change only:
1. `scripts/kintone/deploy-custom-ui.js`
2. `tests/deploy-customization-preservation.test.js`
3. existing WP1 evidence file or one small final residual evidence file

Forbidden:
- `src/main-mbo-app.js`
- `src/ui/employee-self-index-ui.js`
- `src/ui/employee-part-a-ui.js`
- `src/styles/mbo-employee.css`
- auth/session/attachment/routing/scoring source
- any Live Kintone write

## Verification

Run and commit evidence for:
- `node --test tests/deploy-customization-preservation.test.js`
- relevant classic bundle/build safety tests
- `npm test`
- `npm run ui:build`
- module-aware build-only with 0 Kintone/network calls

After commit, re-run at least the focused deployment test from a clean committed worktree and record the result.

Evidence must record:
```text
EXECUTION_START_HEAD
BASE_CORRECTIVE_CANDIDATE = 2e8b05aa989b2e0ba9406b134824db7f2b5f509c
SOURCE_FILES_CHANGED
TEST_FILES_CHANGED
PREBUILD_SOURCE_GATE_PROOF
MISSING_MANIFEST_PREBUILD_BLOCK_PROOF
SOURCE_MISMATCH_PREBUILD_BLOCK_PROOF
DIRTY_PREBUILD_BLOCK_PROOF
PURE_DIRTY_TEST_PROOF
PURE_CLEAN_TEST_PROOF
POST_COMMIT_CLEAN_FOCUSED_TEST_RESULT
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
`ATOMIC_DEPLOY_PREBUILD_SOURCE_GATE_CORRECTED_PENDING_INDEPENDENT_REVIEW`.
