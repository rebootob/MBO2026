# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — WP1 PRE-BUILD SOURCE GATE / DETERMINISTIC TEST CORRECTIVE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 App794 Live Rev54 remains accepted known-good. WP1 candidate `2e8b05aa989b2e0ba9406b134824db7f2b5f509c` correctly closes caller HEAD spoofing, unresolved HEAD, full-SHA and dirty-tree gaps, but remains **CORRECTIVE** because manifest sourceCommit equality is still checked only after build + Kintone GET, and the dirty-worktree regression depends on the executor's real dirty checkout state rather than a deterministic pure test. No Live deployment authorized. WP2 not started. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — resume after App794 UI corrective is stable |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Accepted Current Live / Rollback Manifest

```text
LIVE_REVISION          = 54
ROLLBACK_SOURCE_COMMIT = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_SCOPE         = ALL
ROLLBACK_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_JS_IDENTITY   = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY  = 1710d770ae87fb5f910d669dd5a88ea0950e6991
TECHNICAL_READBACK     = PASS
USER_RUNTIME_SMOKE     = PASS
CURRENT_LIVE_RUNTIME   = ACCEPTED KNOWN-GOOD
```

No Live write occurred in WP1 candidate `2e8b05aa...`; Rev54 remains unchanged.

## 3. Latest WP1 Candidate Review

Candidate:
`2e8b05aa989b2e0ba9406b134824db7f2b5f509c`

Changed files are correctly limited to:
- `scripts/kintone/deploy-custom-ui.js`
- `tests/deploy-customization-preservation.test.js`
- `project-docs/WP1_ATOMIC_DEPLOYMENT_TOOLING_EVIDENCE.md`

Executor evidence reports:
```text
FOCUSED_TEST_RESULT       = PASS 25/25
FULL_TEST_RESULT          = PASS 938/938
UI_BUILD_RESULT           = PASS
BUILD_ONLY_RESULT         = PASS
BUILD_ONLY_NETWORK_CALLS  = 0
LIVE_KINTONE_WRITE        = 0
LIVE_DEPLOY_OCCURRED      = NO
```

### Independently accepted improvements

The candidate now correctly:
- derives Live Git HEAD internally and ignores caller `currentGitHead`;
- blocks unresolved/malformed actual HEAD;
- requires exact full 40-character manifest/source SHA equality in the validator;
- checks working-tree cleanliness before Live build;
- preserves mandatory release manifest, atomic JS+CSS replacement and byte-exact hashing;
- leaves UI feature source untouched.

## 4. Remaining Blocker A — Manifest Source Binding Must Happen Before Build/Network

Current Live order is:
```text
resolve Git HEAD
check clean worktree
build candidate artifacts
GET live customization
GET preview customization
validate releaseManifest.sourceCommit == Git HEAD
```

This is not the required fail-closed source gate. A wrong/missing/malformed manifest sourceCommit can still cause a build and Kintone GETs before it is rejected.

Required Live order:
```text
authorization/target binding
resolve actual Git HEAD
check clean worktree
PRE-BUILD SOURCE MANIFEST GATE:
  releaseManifest exists
  appId = 794
  sourceCommit exact full 40-char SHA
  sourceCommit === actual Git HEAD
ONLY THEN build
ONLY THEN Kintone GET/read preflight
ONLY THEN compare built JS/CSS + scope/topology
```

No Kintone network call may occur before the pre-build source manifest gate passes.

## 5. Remaining Blocker B — Dirty-Worktree Test Is Environment-Dependent

Current regression `DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_OR_UPLOAD & CLEAN_WORKTREE_SOURCE_IDENTITY_PASS` calls the real repository `isWorktreeClean()` and expects a throw.

That can pass while Antigravity has uncommitted task changes, then fail when the same committed candidate is checked out clean. This is not deterministic evidence.

Required:
- extract/use a pure source-state validation helper accepting explicit resolved values such as `{currentGitHead, worktreeClean, manifest}`;
- Live entrypoint must still resolve HEAD/cleanliness internally and pass those values to the pure helper;
- unit tests must inject `worktreeClean=false` and `true` rather than depending on the test runner's actual checkout dirtiness;
- add a clean-checkout regression proving the focused test suite passes when repository is clean.

## 6. Accepted WP1 Behavior — Do Not Reopen

```text
ATOMIC_JS_CSS_PAIR                 = PASS
TARGET_JS_EXACTLY_ONE              = PASS
TARGET_CSS_EXACTLY_ONE             = PASS
BOTH_PREVIEW_FILEKEYS_REPLACED     = PASS
MANIFEST_REQUIRED                  = PASS
MANIFEST_APP_JS_CSS_SCOPE_TOPOLOGY = PASS
BYTE_EXACT_HASHING                 = PASS
CRLF_VS_LF_DIFFERENT               = PASS
CALLER_HEAD_OVERRIDE_BLOCKED       = PASS
UNRESOLVABLE_HEAD_BLOCKED          = PASS
EXACT_FULL_SHA_VALIDATION          = PASS
REAL_LIVE_DIRTY_CHECK_BEFORE_BUILD = PASS
BUILD_ONLY_ZERO_NETWORK            = PASS
NO_LIVE_WRITE                      = PASS
```

## 7. UI Feature Ownership — WP2 Still Blocked

```text
My MBO card/list owner        = src/ui/employee-self-index-ui.js
Back navigation current      = src/ui/employee-part-a-ui.js
Back navigation target owner = dedicated record-navigation module in WP2
Comment mirror current       = src/ui/employee-part-a-ui.js
Comment mirror target owner  = dedicated comment-mirror module in WP2
CSS current owner            = src/styles/mbo-employee.css
```

## 8. Current Gate

```text
CURRENT_GATE                  = WP1 PRE-BUILD SOURCE GATE + DETERMINISTIC TEST CORRECTIVE
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
LATEST_WP1_CANDIDATE          = 2e8b05aa989b2e0ba9406b134824db7f2b5f509c
WP1_VERDICT                   = CORRECTIVE
LIVE_APP794_CUSTOMIZATION     = REV54 ACCEPTED KNOWN-GOOD
ROLLBACK_MANIFEST             = LOCKED / ec627852 + e04aa... + 1710d...
UI FEATURE SOURCE CHANGE      = NO
DEPLOY TOOL SOURCE CHANGE     = YES / FINAL RESIDUAL ONLY
TEST CHANGE                   = YES / FINAL RESIDUAL ONLY
APP794 CUSTOMIZATION DEPLOY   = NO / NOT AUTHORIZED
APP794 RECORD WRITE           = NO
APP794 FORM/SCHEMA/LAYOUT     = NO
APP794 ACL/PROCESS            = NO
KINTONE COMMENT WRITE         = NO
APP801 / APP795 / APP796      = NO
COPY PREVIOUS MBO             = NO
D2-D7 EXECUTION               = NO
WP2                           = BLOCKED UNTIL WP1 PASS
```

Maximum executor status:
`ATOMIC_DEPLOY_PREBUILD_SOURCE_GATE_CORRECTED_PENDING_INDEPENDENT_REVIEW`.
