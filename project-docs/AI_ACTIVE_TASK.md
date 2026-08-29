# AI ACTIVE TASK — WP1 ATOMIC APP794 DEPLOYMENT TOOLING HARDENING

Mode: **ANTIGRAVITY SOURCE/TEST EXECUTION — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Purpose

Fix the proven App794 customization deployment tooling defect that allowed **new JS + old CSS** partial releases.

This task is tooling/tests only. Do NOT modify Employee UI feature source in WP1.

## Accepted Current Live / Rollback Manifest

App794 current accepted Live runtime:
```text
LIVE_REVISION          = 54
ROLLBACK_SOURCE_COMMIT = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_SCOPE         = ALL
ROLLBACK_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_JS_IDENTITY   = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY  = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

Do not write Live in this task.

## Proven Root Cause

Current `scripts/kintone/deploy-custom-ui.js`:
- builds JS + CSS;
- then uses only `fullJs` for deployment;
- uploads only `mbo-employee-app.js`;
- explicitly preserves existing preview CSS fileKey;
- therefore can deploy changed JS without changed CSS.

This must be eliminated.

## Exact Files Allowed

Read/change only unless a directly required test helper import proves necessary:
1. `scripts/kintone/deploy-custom-ui.js`
2. `tests/deploy-customization-preservation.test.js`
3. `scripts/kintone/build-mbo-ui.js` — READ ONLY unless absolutely necessary; prefer no change
4. `package.json` — READ ONLY
5. exact supporting security helper only if needed to understand existing authorization gate; do not change unrelated authorization rules

Forbidden UI feature source changes in WP1:
- `src/main-mbo-app.js`
- `src/ui/employee-self-index-ui.js`
- `src/ui/employee-part-a-ui.js`
- any auth/session/attachment/routing/scoring source
- `src/styles/mbo-employee.css`

## Required Implementation

### A. Atomic JS + CSS target handling
Deployment tooling must require and replace exactly:
```text
Desktop JS target  = mbo-employee-app.js
Desktop CSS target = mbo-employee.css
```

Rules:
- exactly one target JS FILE entry required;
- exactly one target CSS FILE entry required;
- missing or duplicate target JS/CSS => fail closed before upload;
- upload candidate JS and candidate CSS only after all preflight checks pass;
- build preview payload using both new fileKeys;
- preserve scope, entry order/count and all Mobile customization exactly;
- do not opportunistically alter unrelated URL/FILE entries.

### B. Atomic release manifest validation
Add a pure/testable manifest validation layer before any upload/write path.

Manifest must cover at minimum:
```text
APP_ID = 794
SOURCE_COMMIT / candidate identifier
JS_BLOB_OR_CONTENT_IDENTITY
CSS_BLOB_OR_CONTENT_IDENTITY
SCOPE
TOPOLOGY / entry counts
```

The built candidate artifact identities must be computed deterministically and compared to the expected manifest.

Required behavior:
- JS matches + CSS mismatch => BLOCK before upload;
- CSS matches + JS mismatch => BLOCK before upload;
- scope/topology mismatch => BLOCK before upload;
- App ID != 794 => BLOCK;
- missing manifest field => BLOCK;
- exact pair => PASS manifest layer.

Prefer Git-blob SHA identity if practical because project release manifests use Git blob SHA. A deterministic content checksum may also be returned as supplemental evidence, but it must not replace the expected reviewed Git/content identity contract silently.

### C. Build-only remains zero network
`executeDeployCustomUi({ isBuildOnly: true })` must:
- build JS + CSS;
- return both artifact contents/identities needed for review;
- perform zero Kintone/fetch/network writes;
- never require Live authorization merely to build/verify candidate artifacts.

### D. No automatic rollback
Do not add automatic rollback or second deploy behavior.
Any future Live failure must STOP for Control Plane review under `ROLLBACK_RECOVERY_SAFETY.md`.

## Mandatory Tests

Update/extend `tests/deploy-customization-preservation.test.js`.

At minimum prove:
1. valid preview payload replaces both target JS and CSS fileKeys;
2. old test assumption `CSS_UPLOAD_COUNT = 0` is removed/reversed — the atomic candidate requires CSS replacement when deploying candidate pair;
3. target CSS missing => BLOCK before upload;
4. target CSS ambiguous/duplicate => BLOCK before upload;
5. target JS missing/ambiguous remains blocked;
6. JS identity mismatch => BLOCK before upload;
7. CSS identity mismatch => BLOCK before upload;
8. scope mismatch => BLOCK;
9. topology mismatch => BLOCK;
10. Mobile lists remain unchanged;
11. build-only returns JS + CSS candidate artifact data and has zero network calls;
12. unauthorized Live entrypoint still blocks before network/write;
13. existing App794 target binding and revision/concurrency protection remain PASS.

Add exact regression naming where practical, including:
```text
ATOMIC_JS_CSS_PAIR_REQUIRED
CSS_CANDIDATE_REPLACED_NOT_PRESERVED
MIXED_RELEASE_BLOCKED_PRE_UPLOAD
BUILD_ONLY_ZERO_NETWORK
```

## Verification

Run:
- `node --test tests/deploy-customization-preservation.test.js`
- relevant classic bundle/build safety test(s)
- `npm test`
- `npm run ui:build`
- module-aware build-only with **0 Kintone calls/writes**

Record concise evidence including:
```text
SOURCE_FILES_CHANGED
TEST_FILES_CHANGED
FOCUSED_TEST_RESULT
FULL_TEST_RESULT
UI_BUILD_RESULT
BUILD_ONLY_RESULT
BUILD_ONLY_NETWORK_CALLS = 0
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY = NO
```

## Strictly Forbidden

- NO Live Kintone customization PUT/POST deploy
- NO App794 record write
- NO schema/layout/ACL/process write
- NO Comment write
- NO App801/App795/App796 write
- NO UI feature implementation/change in WP1
- NO Copy Previous MBO
- NO D2-D7 work
- NO automatic rollback
- NO unrelated refactor

Commit + push source/test/build evidence and STOP.

Maximum status:
`ATOMIC_DEPLOY_TOOLING_IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`
