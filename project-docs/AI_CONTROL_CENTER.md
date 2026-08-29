# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — APP794 WP2 UI ONE-SHOT LIVE DEPLOY AUTHORIZED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 App794 Live Rev54 remains accepted known-good before execution. WP1 Atomic Deployment Tooling = PASS/CLOSED. WP2 UI candidate = INDEPENDENT PASS. User explicitly authorized one one-shot App794 customization deploy for exact candidate `90ba66e33c056807dc79717c3c787f37e80bb1b6`. Runtime acceptance still requires exact technical readback plus User UAT after deployment. HR/admin reset and remaining security UAT remain open. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — resume only after WP2 Live is accepted |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. User Authorization — One Shot

User authorization text:
`อนุมัติ App794 deploy WP2 UI candidate 90ba66e`

```text
AUTHORIZATION_ID       = APP794-D1-WP2-UI-DEPLOY-20260829-01
AUTHORIZATION_STATUS   = ACTIVE / UNUSED UNTIL EXECUTOR INVOKES GUARDED LIVE PATH
TARGET_APP             = 794 ONLY
WORK_PACKAGE           = MBO-P03-WP-002C
STAGE                  = STAGE_D1_APP794_CUSTOMIZATION_DEPLOY
OPERATION              = APP794_CUSTOMIZATION_DEPLOY
AUTHORIZED_CANDIDATE   = 90ba66e33c056807dc79717c3c787f37e80bb1b6
AUTHORIZED_ATTEMPTS    = 1
ROLLBACK_AUTHORIZED    = NO
OTHER_KINTONE_WRITES   = NO
```

The authorization is consumed by the guarded Live deploy invocation. Any failure after consumption => STOP. No retry, hotfix, second deployment, or automatic rollback under this authorization.

## 3. Accepted Current Live / Mandatory Pre-Deploy Baseline

Before consuming the authorization, executor must independently re-read current App794 Live customization and verify exact current known-good state:

```text
EXPECTED_PRE_DEPLOY_REVISION      = 54
EXPECTED_PRE_DEPLOY_SCOPE         = ALL
EXPECTED_PRE_DEPLOY_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
EXPECTED_PRE_DEPLOY_JS_IDENTITY   = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
EXPECTED_PRE_DEPLOY_CSS_IDENTITY  = 1710d770ae87fb5f910d669dd5a88ea0950e6991
EXPECTED_PRE_DEPLOY_SOURCE        = ec6278524a2d5eb53050d0580c340d1b4e866b97
```

Any unexpected revision/scope/topology/JS/CSS drift => STOP BEFORE invoking the guarded Live deploy path. Do not consume authorization and do not attempt to reconcile drift.

This same state remains the immutable rollback manifest, but rollback is NOT authorized by the WP2 deploy authorization.

## 4. Exact Authorized Candidate Manifest

```text
CANDIDATE_SOURCE_COMMIT = 90ba66e33c056807dc79717c3c787f37e80bb1b6
CANDIDATE_JS_BLOB_SHA   = eec05d4bb19130f3edc431164fc073f6b697dd8a
CANDIDATE_CSS_BLOB_SHA  = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
CANDIDATE_SCOPE         = ALL
CANDIDATE_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

Only this exact atomic JS+CSS pair is authorized.

## 5. Exact Source Execution Rule

Current control branch includes docs-only commits after the implementation candidate. Hardened deployment tooling requires `releaseManifest.sourceCommit` to equal actual Git HEAD exactly.

Executor must:
1. fetch branch and read current Control Center + Active Task;
2. record the authorization ID and control HEAD;
3. ensure no local changes will be lost;
4. checkout exact immutable commit `90ba66e33c056807dc79717c3c787f37e80bb1b6` in detached HEAD for preflight/build/deploy;
5. require clean worktree;
6. manifest `sourceCommit` = exact detached HEAD `90ba66e...`;
7. never substitute branch HEAD artifacts or rebuild a later source state.

Any mismatch => STOP before upload/write.

## 6. Mandatory Pre-Deploy Verification Before Authorization Consumption

From exact clean candidate `90ba66e...`:
- focused Back / real-main integration / Comment / My MBO tests PASS;
- focused attachment/auth regression PASS;
- full regression if practical under the task requirements PASS;
- `npm run ui:build` PASS;
- hardened build-only PASS with Kintone/network calls = 0;
- clean rebuild leaves tracked `dist/` diff = 0;
- built JS exact blob = `eec05d4...`;
- built CSS exact blob = `2a758a...`;
- pre-deploy Live readback exactly matches Rev54 baseline in section 3.

If any check fails => STOP without Live write.

## 7. Authorized Live Operation — Exactly One Attempt

Guard configuration must bind exactly:

```text
AUTHORIZATION_ID = APP794-D1-WP2-UI-DEPLOY-20260829-01
APP_ID           = 794
WORK_PACKAGE     = MBO-P03-WP-002C
STAGE            = STAGE_D1_APP794_CUSTOMIZATION_DEPLOY
OPERATION        = APP794_CUSTOMIZATION_DEPLOY
ACTIVE_WINDOW    = true
EXPLICIT_USER_AUTHORIZATION = true
```

Release manifest must bind exactly:

```text
appId             = 794
sourceCommit       = 90ba66e33c056807dc79717c3c787f37e80bb1b6
expectedJsBlobSha  = eec05d4bb19130f3edc431164fc073f6b697dd8a
expectedCssBlobSha = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
expectedScope      = ALL
expectedTopology   = 1 Desktop JS / 1 Desktop CSS / 0 Mobile JS / 0 Mobile CSS
```

Use the hardened `executeDeployCustomUi()` path. Do not bypass its source/manifest/authorization/topology gates. Do not create an alternate deployment script.

## 8. Mandatory Post-Deploy Technical Readback

A Kintone deploy status of SUCCESS alone is NOT acceptance.

After deployment completes, independently re-read Live App794 customization and download/hash the configured target files. Require:

```text
POST_SCOPE            = ALL
POST_TOPOLOGY         = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
POST_JS_IDENTITY      = eec05d4bb19130f3edc431164fc073f6b697dd8a
POST_CSS_IDENTITY     = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
POST_PAIR_MATCH       = YES
FORBIDDEN_WRITES      = 0
```

Record actual post-deploy revision from Kintone; do not assume the next revision number.

If any post-deploy mismatch occurs => STOP and report incident. Do NOT rollback automatically and do NOT perform a second Live write.

## 9. Required User UAT After Technical PASS

Technical PASS leaves runtime status `DEPLOYED_PENDING_USER_UAT`.

User must smoke-test at minimum:
- My MBO card/list appearance and actions;
- Detail/Edit `← กลับหน้า My MBO / Back to My MBO`;
- Detail/Edit Comment mirror + Refresh;
- Create screen has no Back and no Comment mirror;
- login/session/custom UI still renders normally.

Only User PASS can promote the new revision to accepted current Live runtime.

## 10. Current Gate

```text
CURRENT_GATE                  = APP794 WP2 UI ONE-SHOT DEPLOY AUTHORIZED
CURRENT_MODE                  = ANTIGRAVITY PRECHECK + ONE GUARDED LIVE DEPLOY
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
AUTHORIZATION_ID              = APP794-D1-WP2-UI-DEPLOY-20260829-01
AUTHORIZATION_STATUS          = ACTIVE / ONE SHOT
WP1                           = PASS / CLOSED
WP2                           = PASS / CANDIDATE LOCKED
WP2_CANDIDATE_COMMIT          = 90ba66e33c056807dc79717c3c787f37e80bb1b6
WP2_CANDIDATE_JS              = eec05d4bb19130f3edc431164fc073f6b697dd8a
WP2_CANDIDATE_CSS             = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
PRE_DEPLOY_LIVE               = REV54 KNOWN-GOOD / MUST REVERIFY BEFORE CONSUMPTION
APP794 CUSTOMIZATION DEPLOY   = YES / EXACTLY ONE AUTHORIZED ATTEMPT
ROLLBACK                      = NO / NOT AUTHORIZED
APP794 RECORD WRITE           = NO
APP794 FORM/SCHEMA/LAYOUT     = NO
APP794 ACL/PROCESS            = NO
KINTONE COMMENT WRITE         = NO
APP801 / APP795 / APP796      = NO WRITE
COPY PREVIOUS MBO             = NO
D2-D7 EXECUTION               = NO
```

Maximum executor status after exact technical readback PASS:
`APP794_WP2_UI_DEPLOYED_PENDING_USER_UAT`.