# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — COMBINED EMPLOYEE UI DEPLOY CORRECTIVE / ROLLBACK REQUIRED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 KINTONE-ONLY / App794 Live rev52 currently contains a partial Combined Employee UI deployment / attachment persistence + long filename + Preview/Download remain previously accepted / **Combined Employee UI deployment CORRECTIVE: Live JS matches reviewed candidate but Live CSS does not; user also reports Back to My MBO absent and My MBO visual layout not as designed** / rollback to pre-deploy snapshot required before further corrective work / HR+admin reset UI open / remaining security UAT open |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — scheduled after current UI corrective |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Previously Accepted State

```text
APP794_LIVE_FORM_REVISION                = 48
EDIT_ATTACHMENT_SOURCE/DEPLOYMENT        = PASS / REV49
LONG_FILENAME_UI_SOURCE/DEPLOYMENT       = PASS / REV50
ATTACHMENT_RETRIEVAL_SOURCE/DEPLOYMENT   = PASS / REV51
ATTACHMENT_RETRIEVAL_USER_LIVE_UAT       = PASS
ALL_ATTACHMENT_DEPLOY_AUTHS              = CONSUMED / CLOSED
```

## 3. Combined Employee UI Reviewed Candidate

Reviewed release candidate:
`ea5254370360321d18bd768f379986609c241850`

Reviewed generated identities:
```text
DIST_JS_BLOB_SHA  = a4975fc219269268bf2a0caffd084d233fa3e29a
DIST_CSS_BLOB_SHA = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
```

Reviewed source/verification PASS covered all three requested features:
1. Detail/Edit: `← กลับหน้า My MBO / Back to My MBO`; Create hides it.
2. My MBO home: responsive card/list UI with readable FY/status/action layout.
3. Detail/Edit: Native Kintone Comment read-only mirror + Refresh with accepted pagination semantics.

Verification evidence remains accepted:
```text
FOCUSED_NAVIGATION_TESTS         = PASS 8/8
FOCUSED_COMMENT_TESTS            = PASS 8/8
EMPLOYEE_PART_A_REGRESSION       = PASS 73/73
FULL_NPM_TEST                    = PASS 931/931
UI_BUILD                         = PASS
MODULE_AWARE_BUILD_ONLY          = PASS / 0 Live Kintone network calls
```

## 4. Deployment Review — CORRECTIVE

Authorization:
`APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01`

Authorization status:
`CONSUMED / CLOSED`

Executor evidence commit:
`48239a70ac4c3910b93b610c9648f5e4ca954319`

Observed deployment:
```text
PRE_DEPLOY_REVISION              = 51
POST_DEPLOY_REVISION             = 52
DEPLOY_ATTEMPT_COUNT             = 1
DEPLOY_RESULT                    = SUCCESS
POST_DEPLOY_JS_IDENTITY          = a4975fc219269268bf2a0caffd084d233fa3e29a
POST_DEPLOY_CSS_IDENTITY         = 1710d770ae87fb5f910d669dd5a88ea0950e6991
REVIEWED_JS_IDENTITY             = a4975fc219269268bf2a0caffd084d233fa3e29a
REVIEWED_CSS_IDENTITY            = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
EXACT_CANDIDATE_READBACK_MATCH   = NO
AUTHORIZATION_CONSUMED           = YES
```

Independent finding:
- Live JS matches the reviewed candidate.
- Live CSS remains the prior CSS identity `1710d...`, not reviewed candidate CSS `2a758a...`.
- The candidate contains real CSS changes for Back navigation and My MBO cards, therefore CSS identity mismatch is material.
- Executor deployment evidence incorrectly labeled the prior CSS as reviewed CSS and incorrectly claimed candidate match based on JS only.
- User Live evidence confirms My MBO styling does not match the designed card/list presentation and the Back to My MBO button is not visible.

Verdict:
`CORRECTIVE — PARTIAL / NON-EXACT DEPLOYMENT`.

## 5. Rollback Rule

The consumed one-shot authorization cannot be reused for another forward deployment.
The original authorization explicitly allowed one safe rollback to the captured exact pre-deploy snapshot if post-deploy candidate readback did not match.

Rollback target is the captured pre-deploy App794 customization snapshot from Rev51:
```text
PRE_DEPLOY_JS_IDENTITY  = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
PRE_DEPLOY_CSS_IDENTITY = 1710d770ae87fb5f910d669dd5a88ea0950e6991
SCOPE                    = ALL
TOPOLOGY                 = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
SNAPSHOT                  = scratch/app794_live_predeploy_backup_combined_ui.json
                           scratch/app794_preview_predeploy_backup_combined_ui.json
```

No new forward candidate deployment is authorized during rollback.

## 6. Current Gate

```text
CURRENT_GATE                  = D1 COMBINED EMPLOYEE UI ROLLBACK TO PRE-DEPLOY SNAPSHOT
CURRENT_MODE                  = ANTIGRAVITY ROLLBACK-ONLY EXECUTION
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
AUTHORIZATION_ID              = APP794-D1-COMBINED-EMPLOYEE-UI-DEPLOY-20260829-01
AUTHORIZATION_STATUS          = CONSUMED / CLOSED
LIVE_APP794_CUSTOMIZATION     = REV52 PARTIAL / NON-EXACT
DEPLOYMENT_REVIEW             = CORRECTIVE
FORWARD_DEPLOY                = NO / FORBIDDEN
ROLLBACK                      = ALLOWED ONLY TO CAPTURED PRE-DEPLOY SNAPSHOT
SOURCE CHANGE                 = NO DURING ROLLBACK
APP794 RECORD WRITE           = NO
APP794 FORM/SCHEMA/LAYOUT     = NO
KINTONE COMMENT WRITE         = NO
APP801 / APP795 / APP796      = NO
COPY PREVIOUS MBO             = NOT YET
```

After rollback is independently verified, Control Plane will diagnose the missing Back button/runtime path and the CSS deployment packaging issue before preparing any new candidate. Any later forward deployment requires a NEW explicit user authorization.
