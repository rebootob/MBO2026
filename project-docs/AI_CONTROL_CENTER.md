# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — WP1 ATOMIC DEPLOY TOOLING SOURCE-IDENTITY CORRECTIVE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 App794 Live Rev54 remains accepted known-good. Residual WP1 candidate `6e1dcce38c5e425ed5f2228ab6a49dce1a826156` correctly fixes mandatory manifest binding and byte-exact JS/CSS hashing, but is still **CORRECTIVE** because Live source identity can be caller-spoofed, unresolved Git HEAD does not fail closed, source SHA matching is prefix-based, and dirty working-tree/build inputs are not blocked. No Live deployment is authorized. WP2 has NOT started. |
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

No Live write occurred in WP1 candidate `6e1dcce...`; Rev54 is unchanged.

## 3. Residual WP1 Candidate Review

Candidate:
`6e1dcce38c5e425ed5f2228ab6a49dce1a826156`

Changed files are correctly limited to:
- `scripts/kintone/deploy-custom-ui.js`
- `tests/deploy-customization-preservation.test.js`
- `project-docs/WP1_ATOMIC_DEPLOYMENT_TOOLING_RESIDUAL_CORRECTIVE_EVIDENCE.md`

Executor evidence reports:
```text
FOCUSED_TEST_RESULT       = PASS 22/22
FULL_TEST_RESULT          = PASS 935/935
UI_BUILD_RESULT           = PASS
BUILD_ONLY_RESULT         = PASS
BUILD_ONLY_NETWORK_CALLS  = 0
LIVE_KINTONE_WRITE        = 0
LIVE_DEPLOY_OCCURRED      = NO
```

### Independently accepted improvements

The candidate now correctly:
- requires a Live `releaseManifest` object;
- binds App794, JS identity, CSS identity, scope and topology;
- rejects missing required manifest fields;
- computes Git-blob SHA over exact bytes without CRLF-to-LF normalization;
- preserves atomic JS+CSS target replacement;
- keeps build-only zero-network;
- leaves all UI feature source untouched.

### Remaining Blocker A — Live Git HEAD can be caller-spoofed

Live `executeDeployCustomUi()` currently resolves:
```text
options.currentGitHead || getCurrentGitHead()
```

Therefore a caller can supply a claimed Git HEAD rather than forcing the tooling to bind to the actual repository checkout. This violates the requirement that source identity must reflect the actual source being deployed.

Live execution must derive source identity internally. A test-only pure validator may accept injected values, but the Live entrypoint must not accept a caller override for actual source identity.

### Remaining Blocker B — unresolved Git HEAD does not fail closed

`getCurrentGitHead()` returns `null` on failure. `validateReleaseManifest()` only compares source commit when `currentGitHead` is truthy, so an unresolved Git repository can skip source binding and continue.

Live mode must BLOCK if HEAD cannot be resolved.

### Remaining Blocker C — source commit comparison is prefix-based

Current comparison accepts either string when one `startsWith()` the other. An overly short caller value can therefore satisfy source matching.

For Live release identity:
- manifest `sourceCommit` must be an exact full 40-character hexadecimal SHA;
- actual Git HEAD must be an exact full 40-character SHA;
- comparison must be exact equality.

### Remaining Blocker D — dirty working tree/build inputs are not blocked

The Active Task required fail-closed behavior if the working tree/build inputs are dirty. Current tooling checks HEAD only and does not check repository cleanliness.

Before Live build/network/upload:
- resolve actual Git HEAD;
- verify repository/build inputs are clean;
- dirty tracked/untracked source/build inputs => BLOCK;
- only then build candidate artifacts and compare their JS/CSS identities to the reviewed manifest.

Do not implement automatic cleanup, reset, checkout, stash or rollback.

## 4. Accepted WP1 Behavior — Do Not Reopen

Preserve all of the following:
```text
ATOMIC_JS_CSS_PAIR            = PASS
TARGET_JS_EXACTLY_ONE         = PASS
TARGET_CSS_EXACTLY_ONE        = PASS
BOTH_PREVIEW_FILEKEYS_REPLACED = PASS
MANIFEST_REQUIRED             = PASS
MANIFEST_APP_JS_CSS_SCOPE_TOPOLOGY = PASS
BYTE_EXACT_HASHING            = PASS
CRLF_VS_LF_DIFFERENT          = PASS
BUILD_ONLY_ZERO_NETWORK       = PASS
NO_LIVE_WRITE                 = PASS
```

## 5. UI Feature Ownership — WP2 Still Blocked

```text
My MBO card/list owner        = src/ui/employee-self-index-ui.js
Back navigation current      = src/ui/employee-part-a-ui.js
Back navigation target owner = dedicated record-navigation module in WP2
Comment mirror current       = src/ui/employee-part-a-ui.js
Comment mirror target owner  = dedicated comment-mirror module in WP2
CSS current owner            = src/styles/mbo-employee.css
```

## 6. Current Gate

```text
CURRENT_GATE                  = WP1 SOURCE IDENTITY FAIL-CLOSED CORRECTIVE
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
LATEST_WP1_CANDIDATE          = 6e1dcce38c5e425ed5f2228ab6a49dce1a826156
WP1_VERDICT                   = CORRECTIVE
LIVE_APP794_CUSTOMIZATION     = REV54 ACCEPTED KNOWN-GOOD
ROLLBACK_MANIFEST             = LOCKED / ec627852 + e04aa... + 1710d...
UI FEATURE SOURCE CHANGE      = NO
DEPLOY TOOL SOURCE CHANGE     = YES / SOURCE-IDENTITY RESIDUAL ONLY
TEST CHANGE                   = YES / SOURCE-IDENTITY RESIDUAL ONLY
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
`ATOMIC_DEPLOY_SOURCE_IDENTITY_CORRECTED_PENDING_INDEPENDENT_REVIEW`.
