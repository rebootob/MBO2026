# AI ACTIVE TASK — APP794 FATAL CREATE CLEAN-EXIT PREDEPLOY CLEAN-WORKTREE PROOF MICRO-CORRECTIVE R2

Mode: **ANTIGRAVITY LOCAL VERIFICATION EVIDENCE ONLY — NO SOURCE CHANGE / NO KINTONE NETWORK / NO LIVE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. Independent Review Result

Latest executor evidence commit:

`c2f66b6594bacd588b3ff51bc868fcb817df8aab`

ChatGPT decision:

`CORRECTIVE — ALL PREDEPLOY GAPS CLOSED EXCEPT FINAL CLEAN-WORKTREE PROOF`

Do not deploy. Do not change source/tests/config/scripts/package/dist.

## 2. What Is Already Accepted From Evidence

The following evidence is sufficient and does **not** need to be rerun unless the clean-worktree proof itself requires a fresh build:

```text
CANDIDATE_SOURCE_TEST_COMMIT = 4472aa2f1c63bf08788b39b4ad54b7ea55808df1
FOCUSED_TESTS                = 8/8 PASS
UI_BUILD                     = EXIT 0
CLASSIC_BUNDLE_CSS_TESTS     = 8/8 PASS
DIST_DIFF_EXIT_CODE          = 0
BUILD_ONLY_TOOLING           = PASS / ZERO NETWORK
BUILD_ONLY_JS                = c6bbcec7a36ea4500bf543c6ef92f4dc98723b8d
BUILD_ONLY_CSS               = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
LIVE_REVISION                = 58
LIVE_SCOPE                   = ALL
LIVE_TOPOLOGY                = 1/1/0/0
LIVE_JS                      = f097f67404fb75418cf85fee635e5d630ef5474d
LIVE_CSS                     = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
PREVIEW_REVISION             = 58
PREVIEW_SCOPE                = ALL
PREVIEW_TOPOLOGY             = 1/1/0/0
POST                         = 0
PUT                          = 0
DELETE                       = 0
ROLLBACK_REV57_JS            = ac22a56cb9d78001384241fe12745f7a2da3da84
ROLLBACK_REV57_CSS           = 0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61
```

## 3. Exact Remaining Defect In Evidence

The latest evidence reports:

```text
POST_BUILD_STATUS = M dist/mbo-employee-app.js
                    M dist/mbo-employee.css
```

with explanation `Line endings; 0 content diff`.

That is **not acceptable** for this fail-closed gate because the authorizing predeploy packet required:

```text
final git status --porcelain output = EMPTY
```

`git diff --exit-code = 0` does not override the separate clean-worktree requirement.

## 4. Exact R2 Task

Create a **fresh temporary detached worktree** pinned exactly to:

`4472aa2f1c63bf08788b39b4ad54b7ea55808df1`

Then execute and capture in order:

```text
git rev-parse HEAD
git status --porcelain
npm run ui:build
git diff --exit-code -- dist/mbo-employee-app.js dist/mbo-employee.css
git update-index --refresh
git rev-parse HEAD
git status --porcelain
```

Required result:
- initial HEAD exact candidate;
- initial status empty;
- build exit 0;
- dist diff exit 0 / output empty;
- `git update-index --refresh` may be used only to refresh index/stat metadata; it must not change file content;
- final HEAD exact candidate;
- **final `git status --porcelain` output empty**.

### Important anti-masking rule

Between `npm run ui:build` and the final status proof, do **NOT** use:
- `git reset`;
- `git checkout -- ...`;
- `git restore ...`;
- `git clean`;
- `git add` / index replacement;
- manual file edits;
- source/dist rewrite outside the normal build;
- any command whose purpose is to revert or hide build-produced modifications.

`git update-index --refresh` is allowed because it refreshes index metadata only. If final status is still non-empty after refresh, STOP and report the mismatch. Do not repair it inside this task.

## 5. Network / Live Boundary

No Kintone network call is required for R2.

```text
KINTONE_GET                 = 0 REQUIRED
KINTONE_POST                = 0
KINTONE_PUT                 = 0
KINTONE_DELETE              = 0
CUSTOMIZATION_UPLOAD        = 0
DEPLOY                      = 0
ROLLBACK                    = 0
```

Do not rerun Live/Preview readback unless ChatGPT later asks for it.

## 6. Repository Scope

The **only** allowed canonical repository change is:

`project-docs/APP794_FATAL_CREATE_CLEAN_EXIT_PREDEPLOY_EVIDENCE.md`

Do not edit:
- source/tests/scripts/config/package/dist;
- `AI_CONTROL_CENTER.md`;
- `AI_ACTIVE_TASK.md`;
- baselines/skills;
- any other file.

No new file.

## 7. Evidence Update Required

Update the existing evidence file with:
- exact fresh temporary worktree path;
- initial HEAD + exit status;
- initial `git status --porcelain` exact output + exit status;
- build command + exit status;
- exact `git diff --exit-code ...` output + exit status;
- `git update-index --refresh` output + exit status;
- final HEAD + exit status;
- final `git status --porcelain` exact output + exit status;
- explicit statement that no reset/checkout/restore/clean/add/manual edit was used between build and final status;
- Kintone network counts for this corrective = 0/0/0/0 if no network was used.

Keep:

`STATUS = PENDING_CHATGPT_REVIEW`

Commit + push only the evidence file, then STOP.

## 8. Safety State

```text
LIVE_APP794_REVISION         = 58
LIVE_SOURCE_COMMIT           = 98108e9e387d01b6d3c3a35cce5baf13324be50e
CANDIDATE_SOURCE_TEST_COMMIT = 4472aa2f1c63bf08788b39b4ad54b7ea55808df1
ACTIVE_LIVE_AUTH             = NONE
ACTIVE_KINTONE_WRITE_AUTH    = NONE
ACTIVE_DEPLOY_AUTH           = NONE
ROLLBACK_AUTH                = NONE
```

Maximum executor status:

`APP794_FATAL_CREATE_CLEAN_EXIT_PREDEPLOY_CLEAN_WORKTREE_PROOF_CAPTURED_PENDING_CHATGPT_REVIEW`
