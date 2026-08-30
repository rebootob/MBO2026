# AI ACTIVE TASK — APP794 FATAL CREATE CLEAN-EXIT ONE-SHOT DEPLOYMENT

Mode: **ANTIGRAVITY EXACT DEPLOYMENT EXECUTION ONLY — ONE AUTHORIZED APP794 CUSTOMIZATION ATTEMPT / NO RETRY / NO ROLLBACK**  
Branch: `ai/antigravity-wp002c`

## 1. Authorization

The user explicitly authorized:

`อนุมัติ App794 Fatal Create Clean-Exit corrective deployment candidate 4472aa2f one-shot 1 ครั้ง`

```text
AUTHORIZATION_ID            = APP794-FATAL-CREATE-CLEAN-EXIT-DEPLOY-20260830-01
AUTHORIZATION_STATUS        = ACTIVE / UNUSED
TARGET_APP                  = 794 ONLY
WORK_PACKAGE                = MBO-P03-WP-002C
STAGE                       = STAGE_D1_APP794_FATAL_CREATE_CLEAN_EXIT_DEPLOY
OPERATION                   = APP794_CUSTOMIZATION_DEPLOY
MAX_DEPLOY_ATTEMPTS         = 1
AUTO_RETRY                  = NO
SECOND_FORWARD_DEPLOY       = NO
ROLLBACK_INCLUDED           = NO
AUTO_ROLLBACK               = NO
```

This authorization is exact and may not be widened or reused.

## 2. Locked Candidate

Deploy only this immutable candidate:

```text
CANDIDATE_SOURCE_TEST_COMMIT = 4472aa2f1c63bf08788b39b4ad54b7ea55808df1
CANDIDATE_JS_GIT_BLOB        = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
CANDIDATE_CSS_GIT_BLOB       = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
CANDIDATE_SCOPE              = ALL
CANDIDATE_TOPOLOGY           = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

Do not deploy branch HEAD as source identity. Use a detached worktree pinned exactly to candidate commit.

## 3. Required Live Preflight Before Any Write

Latest accepted expected current state:

```text
APP                         = 794
LIVE_REVISION               = 58
LIVE_SCOPE                  = ALL
LIVE_TOPOLOGY               = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
LIVE_JS_IDENTITY            = f097f67404fb75418cf85fee635e5d630ef5474d
LIVE_CSS_IDENTITY           = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
PREVIEW_REVISION            = 58
PREVIEW_SCOPE               = ALL
PREVIEW_TOPOLOGY            = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

Before any POST/PUT/deploy write:
1. pull/re-fetch canonical branch;
2. read `project-docs/AI_CONTROL_CENTER.md` and this exact Active Task;
3. verify authorization still ACTIVE / UNUSED;
4. create a fresh detached worktree pinned to candidate `4472aa2f...`;
5. prove candidate worktree HEAD exact and clean;
6. verify candidate JS/CSS Git blobs exactly match locked values;
7. GET-read actual Live and Preview App794 customization;
8. download/hash current Live JS/CSS bytes;
9. require exact expected Rev58 scope/topology/identities above;
10. verify immutable Rev57 rollback manifest below.

If any mismatch/drift/ambiguity occurs before first write: STOP. Do not repair and do not deploy.

## 4. Exact Authorized Write Scope

Only the exact operations necessary to replace App794 customization with the locked candidate pair and apply/deploy it are authorized.

Allowed write target:

```text
APP794 DESKTOP JS = exact candidate dist/mbo-employee-app.js
APP794 DESKTOP CSS = exact candidate dist/mbo-employee.css
SCOPE = ALL
MOBILE JS = NONE
MOBILE CSS = NONE
```

The one attempt may include the repository's normal file upload + Preview customization update + deploy/apply operation required by Kintone for this exact pair.

Authorization is consumed when the first deployment-write step begins.

## 5. Strictly Forbidden

Do NOT:
- perform a second forward deployment;
- retry a failed attempt;
- rollback automatically;
- deploy any source other than candidate `4472aa2f...`;
- change candidate source/tests/dist;
- write App794 records;
- write App800/App801/App795/App796 records;
- execute password reset or App801 credential mutation;
- change schema/layout/ACL/process management;
- change app permissions;
- change process management;
- edit unrelated files/features;
- reuse previous consumed authorization IDs.

```text
APP794_RECORD_WRITE          = NO
APP800_RECORD_WRITE          = NO
APP801_RECORD_WRITE          = NO
APP795_APP796_RECORD_WRITE   = NO
SCHEMA_LAYOUT_ACL_PROCESS    = NO
ROLLBACK                     = NOT AUTHORIZED
```

## 6. One-Attempt Rule

Once the first authorized forward write begins:

```text
AUTHORIZATION_STATUS = CONSUMED
ATTEMPTS_USED        = 1
```

Regardless of success or failure, there is no second attempt under this authorization.

If deployment fails, status is ambiguous, Kintone reports an error, or post-deploy readback mismatches candidate:
- STOP;
- do not retry;
- do not rollback;
- capture evidence;
- return to ChatGPT for independent review and a new user decision.

## 7. Mandatory Post-Deploy Readback

After the one allowed attempt, perform GET-only verification:
- deployment status / apply result;
- actual Live revision;
- actual Preview revision;
- actual scope;
- exact desktop/mobile JS/CSS topology and ordering;
- actual entry names;
- download actual Live JS/CSS bytes;
- compute Git blob identities;
- require exact match:

```text
EXPECTED_LIVE_JS  = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
EXPECTED_LIVE_CSS = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
EXPECTED_SCOPE    = ALL
EXPECTED_TOPOLOGY = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
```

Technical success requires exact candidate pair. Do not infer User UAT PASS.

## 8. Known-Good Rollback Manifest — VERIFY ONLY, DO NOT EXECUTE

```text
ROLLBACK_REVISION          = 57
ROLLBACK_SOURCE_COMMIT     = 9816cef195b6d3ffe039e5fb92c8dc8406c8967a
ROLLBACK_JS_IDENTITY       = ac22a56cb9d78001384241fe12745f7a2da3da84
ROLLBACK_CSS_IDENTITY      = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
ROLLBACK_SCOPE             = ALL
ROLLBACK_TOPOLOGY          = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_AUTHORIZED        = NO
```

Rev57 remains the accepted known-good until corrective technical readback AND User Runtime UAT both pass.

## 9. Evidence File

The only executor-authored canonical repository change after deployment should be:

`project-docs/APP794_FATAL_CREATE_CLEAN_EXIT_DEPLOYMENT_EVIDENCE.md`

If the file does not exist, create it. Do not modify Control Center, Active Task, baselines, skills, source, tests, dist, config, or scripts.

Evidence must contain:
- `STATUS = PENDING_CHATGPT_REVIEW`;
- timestamp;
- authorization ID;
- authorization consumed/closed state;
- attempts used = 1;
- candidate source commit + JS/CSS identities;
- preflight Live/Preview state + exact actual Live JS/CSS identities;
- exact write operations/endpoints and HTTP/result summaries without credentials/secrets;
- deployment/apply status;
- post-deploy Live + Preview revision/scope/topology/entry names;
- downloaded actual Live JS/CSS identities;
- `EXACT_CANDIDATE_MATCH = YES/NO`;
- record write counts = 0 for App794/App800/App801/App795/App796;
- schema/layout/ACL/process writes = 0;
- second deploy = NO;
- retry = NO;
- auto rollback = NO;
- any warning or mismatch.

Commit + push only that evidence file, then STOP for ChatGPT Independent Review.

Maximum executor status:

`APP794_FATAL_CREATE_CLEAN_EXIT_DEPLOYMENT_COMPLETED_PENDING_CHATGPT_REVIEW`

## 10. Current Owner

```text
CURRENT_MODE   = AUTHORIZED ONE-SHOT DEPLOY EXECUTION
NEXT_OWNER     = ANTIGRAVITY
USER_UAT       = AFTER CHATGPT TECHNICAL READBACK REVIEW
```
