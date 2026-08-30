# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/` and reusable lessons live in `skills/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-30 — APP794 FATAL CREATE CLEAN-EXIT ONE-SHOT DEPLOY AUTHORIZED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 **OVERALL IN PROGRESS.** App794 Rev58 remains actual Live. Fatal duplicate Create clean-exit corrective candidate has source/test review PASS + full predeploy verification PASS. User has now granted one exact one-shot App794 customization deployment authorization. |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🟠 Copy own previous MBO ready only on a future explicit task |
| D6 | 🔴 Integrated E2E / Security / Regression pending |
| D7 | ✅ Admin Support Center source functionality CLOSED |

## 2. Actual Live App794 Precondition

Latest independently accepted GET-only predeploy state:

```text
LIVE_ACTUAL_REVISION          = 58
LIVE_SOURCE_COMMIT            = 98108e9e387d01b6d3c3a35cce5baf13324be50e
LIVE_SCOPE                    = ALL
LIVE_TOPOLOGY                 = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY              = f097f67404fb75418cf85fee635e5d630ef5474d
LIVE_CSS_IDENTITY             = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
PREVIEW_REVISION              = 58
PREVIEW_SCOPE                 = ALL
PREVIEW_TOPOLOGY              = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
TECHNICAL_READBACK            = PASS
USER_RUNTIME_UAT              = FAIL/PARTIAL — fatal Create Back currently triggers leave-confirm dialog
ACCEPTED_KNOWN_GOOD_REVISION  = 57
```

Before consuming the authorization, executor MUST GET-read actual Live/Preview and fail closed on any drift from this precondition.

## 3. Locked Corrective Candidate

```text
CANDIDATE_SOURCE_TEST_COMMIT  = 4472aa2f1c63bf08788b39b4ad54b7ea55808df1
CANDIDATE_JS_GIT_BLOB         = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
CANDIDATE_CSS_GIT_BLOB        = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
CANDIDATE_SCOPE               = ALL
CANDIDATE_TOPOLOGY            = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
SOURCE_TEST_REVIEW            = PASS
PREDEPLOY_VERIFICATION        = PASS
```

Accepted corrective behavior:
- duplicate preflight before Fiscal Year/native-record mutation;
- fatal duplicate keeps incoming blank Fiscal Year unchanged and `kintone.app.record.set()` = 0;
- normal Create defaults FY2026 only after preflight PASS and continues autoload;
- fatal Create hides native Save/Cancel only through explicit fatal-state behavior;
- pre-auth Create and blocked Detail/Edit do not receive fatal native-action suppression;
- broad native statusbar selector removed;
- no global `onbeforeunload` bypass;
- exactly one canonical same-tab `/k/794/` Back control remains.

## 4. Active One-Shot Authorization

User explicitly authorized on 2026-08-30:

`อนุมัติ App794 Fatal Create Clean-Exit corrective deployment candidate 4472aa2f one-shot 1 ครั้ง`

```text
AUTHORIZATION_ID              = APP794-FATAL-CREATE-CLEAN-EXIT-DEPLOY-20260830-01
AUTHORIZATION_STATUS          = ACTIVE / UNUSED
TARGET_APP                    = 794 ONLY
WORK_PACKAGE                  = MBO-P03-WP-002C
STAGE                         = STAGE_D1_APP794_FATAL_CREATE_CLEAN_EXIT_DEPLOY
OPERATION                     = APP794_CUSTOMIZATION_DEPLOY
CANDIDATE_SOURCE_COMMIT       = 4472aa2f1c63bf08788b39b4ad54b7ea55808df1
CANDIDATE_JS                  = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
CANDIDATE_CSS                 = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
SCOPE                         = ALL
TOPOLOGY                      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
MAX_DEPLOY_ATTEMPTS           = 1
AUTO_RETRY                    = NO
SECOND_FORWARD_DEPLOY         = NO
APP794_RECORD_WRITE           = NO
APP800_RECORD_WRITE           = NO
APP801_RECORD_WRITE           = NO
APP795_APP796_RECORD_WRITE    = NO
SCHEMA_LAYOUT_ACL_PROCESS     = NO
ROLLBACK_INCLUDED             = NO
AUTO_ROLLBACK                 = NO
```

The authorization is consumed when the single forward deployment attempt begins. If the attempt fails or post-deploy evidence mismatches, STOP. Do not retry. Do not rollback automatically. Any retry or rollback needs new explicit user authorization.

## 5. Deployment Safety Gates

Before the one allowed write attempt:
1. re-fetch canonical branch and read Control Center + Active Task;
2. create/use detached worktree pinned exactly to candidate `4472aa2f...`;
3. candidate worktree must be clean;
4. re-run exact Live/Preview GET-only preflight and confirm Rev58 / scope ALL / topology 1/1/0/0 / Live JS `f097f674...` / CSS `0532c1c3...`;
5. verify candidate immutable JS/CSS blobs exactly `c6bbcec7...` / `0532c1c3...`;
6. verify rollback immutable Rev57 manifest remains exact;
7. any drift, ambiguity, unexpected diff, or identity mismatch => STOP WITHOUT CONSUMING A WRITE ATTEMPT if no write has begun.

Deployment write scope is only the exact App794 desktop JS+CSS pair and apply/deploy operation required to make that pair Live.

After the single attempt:
- poll deployment status only as needed;
- GET-read actual Live + Preview customization;
- download actual Live JS/CSS bytes and compute identities;
- require exact candidate pair and topology/scope;
- no second deploy;
- no rollback;
- capture evidence and STOP for ChatGPT review.

## 6. Required Post-Deploy Evidence

Executor may add/update only the exact deployment evidence file specified in Active Task. Evidence must include:
- authorization ID + status consumed/closed;
- deploy attempts used = 1;
- preflight actual state;
- exact candidate HEAD + clean status;
- exact write operations/endpoints and responses without secrets;
- deployment status result;
- post-deploy Live + Preview revision/scope/topology/entry names;
- downloaded actual Live JS/CSS identities;
- exact candidate match YES/NO;
- App794 record writes = 0;
- App800/App801/App795/App796 record writes = 0;
- schema/layout/ACL/process writes = 0;
- second deploy = NO;
- auto rollback = NO.

Maximum executor status is PENDING_CHATGPT_REVIEW. Executor must not mark user UAT PASS.

## 7. Known-Good Rollback Baseline

```text
ROLLBACK_KNOWN_GOOD_REVISION = 57
ROLLBACK_SOURCE_COMMIT       = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
ROLLBACK_JS_IDENTITY         = ac22a56cb9d78001384241fe12745f7a2da3da84
ROLLBACK_CSS_IDENTITY        = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
ROLLBACK_SCOPE               = ALL
ROLLBACK_TOPOLOGY            = 1/1/0/0
ROLLBACK_AUTHORIZED          = NO
```

Rev57 remains accepted known-good until a corrective deployment receives independent technical readback PASS and subsequent User Runtime UAT PASS.

## 8. Authorization Ledger

```text
PRIOR_AUTHORIZATION_ID        = APP794-D1-WP2-R3-DEPLOY-20260829-01
PRIOR_AUTHORIZATION_STATUS    = CONSUMED / CLOSED / NEVER REUSE
PREVIOUS_AUTHORIZATION_ID     = APP794-CUMULATIVE-DEPLOY-20260830-01
PREVIOUS_AUTHORIZATION_STATUS = CONSUMED / CLOSED / NEVER REUSE
ACTIVE_AUTHORIZATION_ID       = APP794-FATAL-CREATE-CLEAN-EXIT-DEPLOY-20260830-01
ACTIVE_AUTHORIZATION_STATUS   = ACTIVE / UNUSED
ACTIVE_DEPLOY_AUTH            = YES / EXACT ONE-SHOT ONLY
ACTIVE_KINTONE_WRITE_AUTH     = APP794 CUSTOMIZATION WRITE ONLY
ROLLBACK_AUTH                 = NONE
```

## 9. Current Gate

```text
CURRENT_GATE                  = APP794 FATAL CREATE CLEAN-EXIT ONE-SHOT DEPLOY AUTHORIZED
CURRENT_MODE                  = ANTIGRAVITY EXACT DEPLOY EXECUTION ONLY
CORRECTIVE_SOURCE_TEST_REVIEW = PASS
PREDEPLOY_VERIFICATION        = PASS
LIVE_ACTUAL_REVISION          = 58 PRE-DEPLOY
REV58_ACCEPTED_KNOWN_GOOD     = NO
NEXT_OWNER                    = ANTIGRAVITY FOR EXACT AUTHORIZED ACTIVE TASK
```
