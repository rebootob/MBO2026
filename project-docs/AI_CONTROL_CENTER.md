# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — WP1 ATOMIC DEPLOY TOOLING CORRECTIVE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 App794 Live Rev54 remains accepted known-good. WP1 atomic deployment tooling candidate `9c96461dcde9ef3ca626b415d35398ff5d41657f` is **CORRECTIVE**: JS+CSS replacement is implemented, but strict release-manifest enforcement is incomplete and Git-blob identity hashing is not byte-exact. No Live deployment is authorized. UI WP2 has NOT started. |
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

No Live write occurred in WP1 candidate `9c96461...`; Rev54 is unchanged.

## 3. WP1 Candidate Review

Candidate:
`9c96461dcde9ef3ca626b415d35398ff5d41657f`

Changed files are correctly limited to:
- `scripts/kintone/deploy-custom-ui.js`
- `tests/deploy-customization-preservation.test.js`
- `project-docs/WP1_ATOMIC_DEPLOYMENT_TOOLING_EVIDENCE.md`

Executor evidence reports:
```text
FOCUSED_TEST_RESULT       = PASS 20/20
FULL_TEST_RESULT          = PASS 933/933
NPM_RUN_UI_BUILD_RESULT   = PASS
BUILD_ONLY_RESULT         = PASS
BUILD_ONLY_NETWORK_CALLS  = 0
LIVE_KINTONE_WRITE        = 0
LIVE_DEPLOY_OCCURRED      = NO
```

### Accepted implementation direction

The candidate correctly:
- requires target Desktop JS `mbo-employee-app.js` and target Desktop CSS `mbo-employee.css`;
- replaces both preview target fileKeys;
- uploads both candidate JS and CSS after preflight;
- preserves scope/topology/Mobile through existing topology checks;
- returns JS+CSS artifact data in build-only mode;
- removes the previous `CSS_UPLOAD_COUNT = 0` assumption.

### Blocker A — Release manifest is optional instead of mandatory

`validateReleaseManifest()` currently returns PASS when neither expected JS nor expected CSS identity is supplied. Live `executeDeployCustomUi()` passes `options.expectedJsBlobSha` and `options.expectedCssBlobSha`, so a caller with deploy authorization can omit both and bypass candidate identity binding.

This violates the Active Task requirement:
`missing manifest field => BLOCK`.

The manifest is also incomplete versus the required contract. It must bind at minimum:
```text
APP_ID = 794
SOURCE_COMMIT / candidate identifier
JS identity
CSS identity
SCOPE
TOPOLOGY / entry counts
```

App binding and topology validation existing elsewhere are useful, but the authorized candidate release manifest itself must be complete and mandatory for Live mode.

### Blocker B — Git blob SHA must represent exact uploaded bytes

Current `gitBlobSha()` converts CRLF to LF before hashing. That can report the repository LF Git blob identity while the actual built/uploaded artifact still contains CRLF bytes on a Windows checkout.

For deployment identity, hash the exact bytes/content that will be uploaded. Do not normalize line endings before the Git-blob SHA calculation.

The same exact content used to compute the identity must be the content sent to Kintone.

## 4. UI Feature Ownership — Preserved / WP2 Not Started

```text
My MBO card/list owner        = src/ui/employee-self-index-ui.js
Back navigation current      = src/ui/employee-part-a-ui.js
Back navigation target owner = dedicated record-navigation module in WP2
Comment mirror current       = src/ui/employee-part-a-ui.js
Comment mirror target owner  = dedicated comment-mirror module in WP2
CSS current owner            = src/styles/mbo-employee.css
```

WP2 remains blocked until WP1 independent PASS.

## 5. Current Gate

```text
CURRENT_GATE                  = WP1 ATOMIC DEPLOY TOOLING RESIDUAL CORRECTIVE
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
LATEST_WP1_CANDIDATE          = 9c96461dcde9ef3ca626b415d35398ff5d41657f
WP1_VERDICT                   = CORRECTIVE
LIVE_APP794_CUSTOMIZATION     = REV54 ACCEPTED KNOWN-GOOD
ROLLBACK_MANIFEST             = LOCKED / ec627852 + e04aa... + 1710d...
UI FEATURE SOURCE CHANGE      = NO
DEPLOY TOOL SOURCE CHANGE     = YES / RESIDUAL ONLY
TEST CHANGE                   = YES / RESIDUAL ONLY
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
`ATOMIC_DEPLOY_TOOLING_CORRECTED_PENDING_INDEPENDENT_REVIEW`.
