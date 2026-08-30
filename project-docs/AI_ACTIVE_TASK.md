# AI ACTIVE TASK — APP794 R4.1 NATIVE-CANCEL ONE-SHOT DEPLOYMENT EXECUTION

Mode: **ANTIGRAVITY EXACT AUTHORIZED APP794 CUSTOMIZATION DEPLOYMENT — ONE ATTEMPT ONLY / NO RETRY / NO ROLLBACK**  
Branch: `ai/antigravity-wp002c`

## 1. Authorization

User explicitly authorized on 2026-08-30:

`อนุมัติ App794 R4.1 Native-Cancel corrective deployment candidate 1ed342ad one-shot 1 ครั้ง`

```text
AUTHORIZATION_ID              = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01
AUTHORIZATION_STATUS          = ACTIVE / UNUSED / ONE-SHOT
TARGET_APP                    = App794 customization only
MAX_DEPLOY_ATTEMPTS           = 1
AUTO_RETRY                    = NO
SECOND_FORWARD_DEPLOY         = NO
AUTO_ROLLBACK                 = NO
ROLLBACK_INCLUDED             = NO
```

This authorization is consumed immediately when the forward customization deployment write attempt begins, whether success or failure. Never reuse it.

## 2. Locked Candidate

Deploy exactly this candidate and no other source/build:

```text
CANDIDATE_SOURCE_TEST_COMMIT = 1ed342ad137a4a364496a28d29bdffd24a99b511
CANDIDATE_JS_GIT_BLOB        = 115a08ace32bdf850cb5eebf25b953d1803114d0
CANDIDATE_CSS_GIT_BLOB       = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
SCOPE                        = ALL
TOPOLOGY                     = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

Source review = PASS. Predeploy verification = PASS.

Do not change source/tests/dist/config/scripts/package during this task.

## 3. Mandatory Pre-Write Revalidation

Immediately before the write attempt, re-fetch/re-read:
- canonical branch HEAD and this Active Task;
- actual App794 Live customization;
- App794 Preview customization.

Expected precondition:

```text
LIVE_REVISION                = 59
LIVE_SCOPE                   = ALL
LIVE_TOPOLOGY                = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS                      = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
LIVE_CSS                     = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
PREVIEW_REVISION             = 59
PREVIEW_SCOPE                = ALL
PREVIEW_TOPOLOGY             = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

Also verify candidate immutable blobs from commit `1ed342ad...` still equal the locked JS/CSS identities and verify the Rev57 rollback manifest listed below.

Any mismatch/drift before write => **STOP WITHOUT DEPLOYMENT**. Do not repair, retry, or broaden scope.

## 4. Authorized Operation — Exactly One Attempt

Authorized operation only:

1. Use the exact candidate artifacts from `1ed342ad137a4a364496a28d29bdffd24a99b511`.
2. Upload/set App794 customization as one atomic JS+CSS pair:
   - Desktop JS: `mbo-employee-app.js` exact candidate bytes;
   - Desktop CSS: `mbo-employee.css` exact candidate bytes;
   - Mobile JS/CSS: none;
   - scope: `ALL`.
3. Apply/deploy App794 customization once using existing reviewed deployment tooling.
4. No second forward deployment attempt under this authorization.

The customization upload/deploy write constitutes the single authorized deployment attempt.

## 5. Strictly Forbidden

Do NOT:
- modify any App794 record;
- write App800/App801/App795/App796 records;
- change schema/layout/ACL/process management;
- change source/tests/dist/config/scripts/package;
- deploy any candidate other than `1ed342ad...`;
- retry after failure;
- perform a second forward deploy;
- rollback automatically;
- use Rev57 rollback artifacts unless a NEW separate user rollback authorization is granted;
- alter Control Center/Active Task as executor.

```text
APP794_RECORD_WRITE                    = 0
APP800_APP801_APP795_APP796_RECORD_WRITE = 0
SCHEMA_LAYOUT_ACL_PROCESS_WRITE        = 0
AUTO_RETRY                             = 0
AUTO_ROLLBACK                          = 0
```

## 6. Mandatory Post-Deployment Technical Readback

After the single attempt, GET-read both actual Live and Preview and record:
- resulting revision(s);
- scope;
- desktop/mobile JS/CSS counts and order;
- entry names;
- download actual Live JS/CSS bytes and compute Git-compatible blob identities where tooling supports it;
- exact comparison with candidate JS/CSS blobs.

Required success condition:

```text
POST_LIVE_SCOPE               = ALL
POST_LIVE_TOPOLOGY            = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
POST_LIVE_JS                  = 115a08ace32bdf850cb5eebf25b953d1803114d0
POST_LIVE_CSS                 = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
EXACT_CANDIDATE_MATCH         = YES
```

Do not assume the resulting revision number in advance; record the actual value returned by Kintone.

If technical readback is inconsistent, STOP. No retry and no rollback under this authorization.

## 7. Rollback Manifest — Verify Only, Not Authorized

```text
ROLLBACK_KNOWN_GOOD_REVISION = 57
ROLLBACK_SOURCE_COMMIT       = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
ROLLBACK_JS_IDENTITY         = ac22a56cb9d78001384241fe12745f7a2da3da84
ROLLBACK_CSS_IDENTITY        = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
ROLLBACK_SCOPE               = ALL
ROLLBACK_TOPOLOGY            = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_AUTHORIZED          = NO
```

No rollback may be executed from this task.

## 8. Evidence File

Create or update only:

`project-docs/APP794_R4_1_NATIVE_CANCEL_DEPLOYMENT_EVIDENCE.md`

Evidence must include:
- status `PENDING_CHATGPT_REVIEW`;
- authorization ID and confirmation that it was consumed on the single attempt;
- exact pre-write Live/Preview state;
- exact candidate HEAD + JS/CSS identities;
- fresh rollback-manifest verification result;
- deployment attempt count = 1;
- retry count = 0;
- second forward deploy = 0;
- rollback = 0;
- actual post-deploy Live + Preview revision/scope/topology/entry names;
- actual downloaded Live JS/CSS identities and exact candidate match result;
- record/schema/layout/ACL/process write counts = 0;
- any warning/error.

Commit + push only this evidence file, then STOP.

## 9. Post-Deployment Gate — User UAT Required

Even if technical readback passes, do **not** claim the new revision accepted known-good.

Mandatory User Runtime UAT:
1. authenticated employee whose same-FY MBO already exists opens Create;
2. terminal duplicate/fatal error remains visible;
3. exactly one canonical `← กลับหน้า My MBO / Back to My MBO` control is visible;
4. native Save/Cancel remain hidden;
5. click Back;
6. return in same tab to `/k/794/`;
7. **NO leave-site / unsaved-change confirmation popup appears**;
8. record create/save/workflow/auth-session mutations = 0.

Only after ChatGPT technical review PASS + User UAT PASS may the new revision replace Rev57 as accepted known-good.

## 10. Safety State

```text
LIVE_BEFORE_ATTEMPT           = Rev59
REV59_USER_UAT                = FAIL
ACCEPTED_KNOWN_GOOD_REVISION  = 57
ACTIVE_DEPLOY_AUTH            = APP794-R4-1-NATIVE-CANCEL-DEPLOY-20260830-01
ACTIVE_KINTONE_WRITE_AUTH     = APP794 CUSTOMIZATION DEPLOY ONLY
ROLLBACK_AUTH                 = NONE
```

Maximum executor status:

`APP794_R4_1_NATIVE_CANCEL_ONE_SHOT_DEPLOYMENT_EXECUTED_PENDING_CHATGPT_REVIEW`
