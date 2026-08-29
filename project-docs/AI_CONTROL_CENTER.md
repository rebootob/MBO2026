# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — REV54 ACCEPTED / UI OWNERSHIP MAPPED / ATOMIC DEPLOYMENT TOOLING WP1

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 App794 Live Rev54 is the accepted known-good runtime. The next UI corrective remains Back to My MBO + My MBO card/list + Native Comment mirror/Refresh. Before any new UI deployment, deployment tooling must be corrected to treat JS+CSS as one atomic release pair. WP1 is source/test/build-only; no Live deployment is authorized. HR/admin reset and remaining security UAT remain open. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — resume after current App794 UI corrective is stable |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Accepted Current Live App794 Runtime / Rollback Manifest

```text
LIVE_REVISION          = 54
LIVE_SOURCE_COMMIT     = ec6278524a2d5eb53050d0580c340d1b4e866b97
LIVE_SCOPE             = ALL
LIVE_TOPOLOGY          = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_BLOB_SHA       = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
LIVE_CSS_BLOB_SHA      = 1710d770ae87fb5f910d669dd5a88ea0950e6991
TECHNICAL_READBACK     = PASS
USER_RUNTIME_SMOKE     = PASS
CURRENT_LIVE_RUNTIME   = ACCEPTED KNOWN-GOOD
```

This exact release is the mandatory rollback source for the next App794 customization candidate until a newer release is independently accepted.

## 3. Control Plane Root-Cause Finding — Partial Deploy

`npm run ui:build` correctly creates both deployment artifacts:
- `dist/mbo-employee-app.js`
- `dist/mbo-employee.css`

But current `scripts/kintone/deploy-custom-ui.js` does this in Live mode:
- receives only `{ fullJs }` from `prepareDeploymentArtifacts()`;
- uploads only `mbo-employee-app.js`;
- explicitly comments `do NOT upload CSS`;
- builds preview payload replacing only the JS fileKey;
- preserves the prior preview CSS fileKey.

Therefore a candidate whose CSS changed can become Live as **new JS + old CSS**. This is the proven technical cause of the Rev52 partial deployment and violates `CONFIRMED_BASELINE/ROLLBACK_RECOVERY_SAFETY.md`.

This tooling must be corrected before any further App794 UI deployment.

## 4. UI Feature Ownership Map — Control Plane Accepted Plan

### A. My MBO card/list
```text
FEATURE                  = My MBO index/card list
CANONICAL_SOURCE_OWNER   = src/ui/employee-self-index-ui.js
RUNTIME_BINDING          = app.record.index.show via renderEmployeeSelfIndex() in src/main-mbo-app.js
CSS_OWNER_CURRENT        = src/styles/mbo-employee.css (My MBO card section)
FOCUSED_TEST             = tests/employee-self-index-ui.test.js
DIST_OUTPUT              = dist/mbo-employee-app.js + dist/mbo-employee.css
```

The current feature is already separated adequately. Do not duplicate it elsewhere.

### B. Back to My MBO
```text
FEATURE                  = Existing-record Back to My MBO navigation
CURRENT_IMPLEMENTATION   = EmployeePartAUI inside src/ui/employee-part-a-ui.js
CURRENT_BINDING          = setupRecordUiWithAuth() -> new EmployeePartAUI({isCreate,...}) -> ui.render()
CURRENT_UNIT_TEST        = tests/employee-self-index-ui.test.js direct EmployeePartAUI render test
TARGET_CANONICAL_OWNER   = dedicated employee record-navigation module in WP2
REQUIRED_NEW_PROOF       = integration test through real Kintone detail/edit event orchestration
```

Source and generated bundle both contain the Back button logic, but the previous Live observation did not show it. Existing test coverage proves renderer behavior directly, not the complete event/auth/host runtime path. WP2 must add integration-level proof and create one canonical navigation owner; do not keep duplicate implementations.

### C. Native Kintone Comment mirror + Refresh
```text
FEATURE                  = Read-only Native Kintone Comment mirror
CURRENT_IMPLEMENTATION   = methods inside src/ui/employee-part-a-ui.js
DATA_SOURCE              = GET /k/v1/record/comments.json only
CURRENT_TESTS            = tests/employee-self-index-ui.test.js comment pagination/refresh tests
TARGET_CANONICAL_OWNER   = dedicated employee comment-mirror module in WP2
CSS_OWNER_CURRENT        = src/styles/mbo-employee.css (comment mirror section)
DIST_OUTPUT              = dist/mbo-employee-app.js + dist/mbo-employee.css
```

WP2 may perform the small feature extraction because it directly supports the active UI corrective and the new one-feature-one-owner architecture. No unrelated decomposition is authorized.

## 5. CSS / Source-to-Dist Ownership

Current build path is deterministic:
```text
src/main-mbo-app.js
  -> esbuild bundle
  -> dist/mbo-employee-app.js

src/styles/mbo-employee.css
  -> direct fs.copyFileSync
  -> dist/mbo-employee.css
```

For the current corrective, CSS remains one canonical stylesheet with clearly separated feature sections. Do not introduce a broad CSS directory refactor while the UI corrective is active.

The candidate JS/CSS pair must be reviewed and deployed atomically.

## 6. Work Package Sequence

### WP1 — Atomic App794 Customization Deployment Tooling
Owner: Antigravity execution, then ChatGPT independent review.

Allowed source scope:
- `scripts/kintone/deploy-custom-ui.js`
- `tests/deploy-customization-preservation.test.js`
- generated build evidence only if needed

WP1 objective:
- deployment tooling must upload/replace **both** reviewed Desktop JS and Desktop CSS candidate files;
- require exactly one expected target JS and one expected target CSS FILE entry;
- candidate JS/CSS identities must be validated as an atomic release manifest before any upload/write path;
- build-only must remain zero-network;
- topology/scope/mobile preservation must remain fail-closed;
- mixed candidate identities must be rejected before any Live write;
- no actual Kintone deploy/write is authorized.

### WP2 — UI Functional Partition + Runtime Integration Proof
Starts only after WP1 independent PASS.

Planned narrow scope:
- keep `employee-self-index-ui.js` as My MBO owner;
- create one canonical Back/navigation owner and remove duplicate Back implementation from `employee-part-a-ui.js`;
- create one canonical Comment mirror owner and remove duplicate Comment implementation from `employee-part-a-ui.js`;
- add Kintone detail/edit integration tests proving Back renders through the actual event/auth/host path;
- preserve all current comment pagination/refresh/read-only tests;
- build one new candidate and establish exact atomic JS/CSS release manifest.

No Live deployment occurs in WP2.

## 7. Current Gate

```text
CURRENT_GATE                  = WP1 ATOMIC APP794 DEPLOYMENT TOOLING HARDENING
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST EXECUTION — NO LIVE WRITE
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
LIVE_APP794_CUSTOMIZATION     = REV54 ACCEPTED KNOWN-GOOD
ROLLBACK_MANIFEST             = LOCKED / ec627852 + e04aa... + 1710d...
ANTIGRAVITY EXECUTION         = YES / WP1 ONLY
UI FEATURE SOURCE CHANGE      = NO IN WP1
DEPLOY TOOL SOURCE CHANGE     = YES / EXACT SCOPE
TEST CHANGE                   = YES / EXACT SCOPE
APP794 CUSTOMIZATION DEPLOY   = NO / NOT AUTHORIZED
APP794 RECORD WRITE           = NO
APP794 FORM/SCHEMA/LAYOUT     = NO
APP794 ACL/PROCESS            = NO
KINTONE COMMENT WRITE         = NO
APP801 / APP795 / APP796      = NO
COPY PREVIOUS MBO             = NO
D2-D7 EXECUTION               = NO
```

Maximum WP1 executor status:
`ATOMIC_DEPLOY_TOOLING_IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.
