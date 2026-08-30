# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-30 — APP794 CUMULATIVE DEPLOYMENT ONE-SHOT AUTHORIZED / PENDING EXECUTION

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** Password Reset Core R1 source accepted. App794 WP2 R4 fatal-error Back navigation source accepted. Cumulative App794 candidate source + pre-deploy verification PASS. Fresh one-shot Live customization deployment is now explicitly authorized and pending executor execution/readback; user UAT remains pending. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🟠 Copy own previous MBO READY TO RESUME only on a future explicit task |
| D6 | 🔴 Integrated E2E / Security / Regression pending |
| D7 | ✅ Admin Support Center source functionality CLOSED |

## 2. Current Accepted Live App794 Baseline — Rev57

```text
LIVE_REVISION               = 57
DEPLOYED_SOURCE_COMMIT      = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
LIVE_SCOPE                  = ALL
LIVE_TOPOLOGY               = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY            = ac22a56cb9d78001384241fe12745f7a2da3da84
LIVE_CSS_IDENTITY           = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
```

This remains the accepted known-good rollback baseline until a newer revision completes technical readback + user runtime UAT.

## 3. Locked Cumulative Release Candidate

```text
TARGET_APP                   = 794
CANDIDATE_SOURCE_COMMIT      = 98108e9e387d01b6d3c3a35cce5baf13324be50e
CLASSIFICATION               = CUMULATIVE ACCEPTED SOURCE
INCLUDES                     = D1 Password Reset Core R1 + WP2 R4 Error-State Back Navigation
SOURCE_REVIEW                = PASS
PREDEPLOY_VERIFICATION       = PASS
CANDIDATE_JS_IDENTITY        = f097f67404fb75418cf85fee635e5d630ef5474d
CANDIDATE_CSS_IDENTITY       = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
TARGET_SCOPE                 = ALL
TARGET_TOPOLOGY              = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
EXPECTED_POST_REVISION       = 58
```

Confirmed R4 behavior includes authenticated Create duplicate/fatal error -> exactly one `← กลับหน้า My MBO / Back to My MBO` targeting `/k/794/`.

## 4. Fresh One-Shot Deployment Authorization

User explicitly authorized on 2026-08-30:

`อนุมัติ App794 cumulative customization deployment candidate 98108e9e one-shot 1 ครั้ง`

Locked authorization:

```text
AUTHORIZATION_ID             = APP794-CUMULATIVE-DEPLOY-20260830-01
AUTHORIZATION_STATUS         = ACTIVE / UNCONSUMED
TARGET_APP                   = 794 ONLY
WORK_PACKAGE_ID              = MBO-P03-WP-002C
STAGE                        = STAGE_D1_APP794_CUSTOMIZATION_DEPLOY
OPERATION                    = APP794_CUSTOMIZATION_DEPLOY
EXPLICIT_USER_AUTHORIZATION  = TRUE
ACTIVE_WINDOW                = TRUE
MAX_ATTEMPTS                 = 1
ATTEMPTS_USED                = 0
CANDIDATE_SOURCE_COMMIT      = 98108e9e387d01b6d3c3a35cce5baf13324be50e
ROLLBACK_INCLUDED            = NO
APP794_RECORD_WRITE          = NOT AUTHORIZED
APP800_APP801_RECORD_WRITE   = NOT AUTHORIZED
SCHEMA_LAYOUT_ACL_PROCESS    = NOT AUTHORIZED
```

This authorization authorizes only one guarded App794 customization deployment attempt for the exact locked JS+CSS candidate. It must be marked CONSUMED/CLOSED immediately after the single attempt begins, whether that attempt succeeds, fails, times out, becomes ambiguous, or is blocked after the deployment executor invokes the one-shot Live path. No retry is permitted under the same authorization.

## 5. Mandatory Deployment-Time Preflight

Before any upload/PUT/POST, executor must independently re-read actual current App794 state and require exact match:

```text
PRE_LIVE_REVISION            = 57
PRE_PREVIEW_REVISION         = 57
PRE_SCOPE                    = ALL
PRE_TOPOLOGY                 = 1/1/0/0
PRE_LIVE_JS_IDENTITY         = ac22a56cb9d78001384241fe12745f7a2da3da84
PRE_LIVE_CSS_IDENTITY        = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
```

Any drift => STOP before Live write and report to ChatGPT. Do not repair, retry, redeploy or rollback.

Deployment execution must run from a detached worktree pinned exactly to candidate source commit `98108e9e...`; canonical docs HEAD is not the release source.

## 6. Locked Release Manifest

```text
appId                       = 794
sourceCommit                = 98108e9e387d01b6d3c3a35cce5baf13324be50e
expectedJsBlobSha           = f097f67404fb75418cf85fee635e5d630ef5474d
expectedCssBlobSha          = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
expectedScope               = ALL
expectedTopology.desktopJsCount  = 1
expectedTopology.desktopCssCount = 1
expectedTopology.mobileJsCount   = 0
expectedTopology.mobileCssCount  = 0
```

JS + CSS are one atomic release unit. No mixed-release deployment is allowed.

## 7. Locked Rollback Manifest

```text
ROLLBACK_SOURCE_COMMIT       = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
ROLLBACK_JS_PATH             = dist/mbo-employee-app.js
ROLLBACK_JS_IDENTITY         = ac22a56cb9d78001384241fe12745f7a2da3da84
ROLLBACK_CSS_PATH            = dist/mbo-employee.css
ROLLBACK_CSS_IDENTITY        = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
ROLLBACK_SCOPE               = ALL
ROLLBACK_TOPOLOGY            = 1/1/0/0
ROLLBACK_AUTHORIZED          = NO
```

Rollback remains a separate Live write and requires a separate explicit user authorization if ever needed. No automatic rollback.

## 8. Required Post-Deploy Technical Readback

After the one authorized attempt, executor must perform technical readback before STOP:

```text
POST_REVISION                = expected 58
POST_SCOPE                   = ALL
POST_TOPOLOGY                = 1/1/0/0
POST_JS_IDENTITY             = f097f67404fb75418cf85fee635e5d630ef5474d
POST_CSS_IDENTITY            = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
EXACT_CANDIDATE_MATCH        = YES required for technical PASS
```

Also record deployment status and forbidden write counts. Technical readback PASS is not user UAT PASS.

## 9. Current Gate

```text
CURRENT_GATE                  = APP794 CUMULATIVE DEPLOYMENT / ONE-SHOT AUTHORIZED / PENDING ANTIGRAVITY EXECUTION
CURRENT_MODE                  = EXACT LIVE CUSTOMIZATION DEPLOYMENT ONLY
D1_PASSWORD_RESET_CORE_R1     = SOURCE PASS / INCLUDED IN CANDIDATE
WP2_R4_R2_SOURCE              = PASS / INCLUDED IN CANDIDATE
CUMULATIVE_CANDIDATE          = 98108e9e387d01b6d3c3a35cce5baf13324be50e
PREDEPLOY_VERIFICATION        = PASS
LIVE_CURRENT_REVISION         = 57
LIVE_DEPLOY_AUTHORIZED        = YES / ONE ATTEMPT ONLY
ACTIVE_KINTONE_WRITE_AUTH     = APP794 CUSTOMIZATION ONLY
APP801_LIVE_WRITE             = NO
ROLLBACK_AUTH                 = NONE
NEXT_OWNER                    = ANTIGRAVITY FOR EXACT ACTIVE TASK THEN STOP FOR CHATGPT REVIEW
```

## 10. Authorization Ledger

```text
PRIOR_AUTHORIZATION_ID        = APP794-D1-WP2-R3-DEPLOY-20260829-01
PRIOR_AUTHORIZATION_STATUS    = CONSUMED / CLOSED / NEVER REUSE
ACTIVE_AUTHORIZATION_ID       = APP794-CUMULATIVE-DEPLOY-20260830-01
ACTIVE_AUTHORIZATION_STATUS   = ACTIVE / UNCONSUMED
ACTIVE_DEPLOY_AUTH            = APP794 EXACT CUMULATIVE CANDIDATE / ONE ATTEMPT
ROLLBACK_AUTH                 = NONE
```

After execution, ChatGPT must independently review the evidence and user runtime UAT is required before promoting the resulting revision to accepted known-good.
