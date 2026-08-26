# AI ACTIVE TASK — M10L-D CONTROLLED APP794 CUSTOMIZATION DEPLOY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed deployment candidate code HEAD: `21f9e82ac42f279946ce87015ae714993f3478e8`
> Target: Kintone App `794` desktop customization only
> Mode: ONE-TIME CONTROLLED DEPLOYMENT

# NORTH STAR

Deploy the independently reviewed Set-up Objectives Save/Submit corrections to App794 safely, with fresh drift detection, durable pre-write backup, exact candidate lock, readback, and rollback capability.

Critical path:
Verify Employee -> Objectives -> Save -> Submit -> Workflow

Do not add unrelated features.

# USER AUTHORIZATION — EXPLICIT / SINGLE USE

The user explicitly authorized this deployment in the current Control Plane conversation with the exact instruction:

`อนุมัติ M10L deploy App794 customization`

This authorization is valid ONLY for the reviewed App794 desktop JS/CSS customization candidate represented by code HEAD:

`21f9e82ac42f279946ce87015ae714993f3478e8`

Authorization scope:
- App794 customization file uploads required for this candidate
- App794 preview customization PUT
- App794 deploy POST
- read-only GET/readback/polling required to verify deployment
- conditional rollback of App794 customization to the fresh pre-write state if deployment/smoke fails

Authorization does NOT include:
- App794 record create/update/delete
- App794 schema/form/layout changes
- App794 process management changes
- App794 ACL changes
- App53 writes
- App795 writes
- App796 writes
- any other Kintone app write

Authorization expires after this controlled deployment attempt is completed or aborted. It must NOT be reused for another deployment or a changed candidate.

# REVIEW GATE STATUS

M10L-R3 independent review = PASS.

Confirmed review gates:
- strict `Requester_User` USER_SELECT populated-array validation = PASS
- missing/malformed Requester_User fail-closed = PASS
- Create starts unverified until successful lookup = PASS
- missing `activeUiInstance` blocks submit = PASS
- valid Edit submit regression = PASS
- duplicate found/read-error/malformed-response fail-closed = PASS
- source/dist Save-gate exactness = PASS
- classic bundle parse/no ES-module residue = PASS
- full suite evidence = 538 tests PASS
- Confirmed Baseline conflict = 0

# LAST KNOWN LIVE APP794 CUSTOMIZATION BASELINE

Last independently documented successful App794 customization deployment state:
- live customization revision: `27`
- desktop JS fileKey: `202608252318191D2A7F44D5034603A603E16BCF21C70F065`
- desktop CSS fileKey: `20260825231820F2E1F79641344B0DA6D72EF9B77C4F36106`
- mobile JS/CSS: empty

This is only a drift reference. FRESH live GET is mandatory before any write.

If current live customization differs from this last-known baseline, STOP before write and report `LIVE_DRIFT_DETECTED`. Do not silently accept a newer/different state.

# IMPORTANT EXECUTOR SAFETY

`scripts/kintone/deploy-custom-ui.js` MUST NOT be executed directly for this task.

Reason: the existing script builds, uploads files, PUTs preview customization, and deploys immediately; it does not itself enforce the fresh durable pre-write backup + live/preview drift gate required by this controlled deployment.

You may reuse its existing bundle composition logic and Kintone client functions inside a guarded one-time execution flow. Prefer ephemeral/non-committed execution code if a wrapper is needed. Do not create a permanent duplicate deploy implementation unless absolutely necessary.

# CHANGE GOVERNANCE

## What
Deploy the current reviewed `dist/mbo-employee-app.js` and `dist/mbo-employee.css` to App794 desktop customization only.

## Where
Kintone App794 only:
- file upload API for candidate JS/CSS
- preview app customization endpoint
- preview deploy endpoint

## Why
M10L Save/Submit corrections passed independent source/test review and now need to become active in the App794 sandbox customization.

## Expected Impact
App794 desktop runtime receives the reviewed Save-gate behavior. No record, schema, workflow, ACL, routing-master, scoring-master, or Employee Master data changes.

# PHASE A — REPOSITORY / CANDIDATE LOCK (NO KINTONE WRITE)

Before touching Kintone:

1. Pull latest `ai/antigravity-wp002c`.
2. Confirm current HEAD includes this authorization task and descends from reviewed candidate `21f9e82...`.
3. Prove NO production candidate drift after `21f9e82...`:
   - no changes after that commit to `src/**`, `dist/**`, `config/sandbox-apps.json`, or deploy/runtime dependencies used by App794 candidate, except this task/living-doc evidence updates
   - if candidate/runtime file drift exists -> STOP `CANDIDATE_DRIFT_DETECTED`
4. Confirm `config/sandbox-apps.json.mboV2AppId === 794`.
5. Run:
   - `npm test`
   - `git diff --check`
   - `git status --short`
6. Require all tests PASS and worktree clean before write.
7. Confirm committed source/dist exactness test PASS.
8. Parse candidate classic JS and verify:
   - `CLASSIC_BUNDLE_PARSE = PASS`
   - `ES_MODULE_IMPORT_COUNT = 0`
   - `ES_MODULE_EXPORT_COUNT = 0`
   - `BROKEN_FROM_RESIDUE_COUNT = 0`
9. Compute and record SHA-256 + byte size for:
   - `dist/mbo-employee-app.js`
   - `dist/mbo-employee.css`

Do not regenerate or modify reviewed source/dist unless deterministic build verification proves byte-for-byte equality with the committed candidate. Any resulting byte drift -> STOP and require new review.

# PHASE B — FRESH LIVE/PREVIEW READ-ONLY PREFLIGHT

Before first write, perform fresh GETs for App794 customization.

Required:
1. GET live customization state for App794.
2. GET preview customization state for App794.
3. Capture revision, scope, desktop JS/CSS refs, mobile JS/CSS refs.
4. Require current live state matches the last-known Revision 27/fileKey baseline above.
5. Require no unexpected pending preview customization drift. Preview must represent the same effective customization as live before this deployment; if there is an unrelated pending preview change -> STOP.
6. Confirm target remains App794 only.

If any live or preview drift is found, STOP before write and report exact differences.

# PHASE C — DURABLE FRESH PRE-WRITE BACKUP

This MUST complete before the first Kintone write.

Create a fresh durable directory such as:

`backups/m10l-d-app794-controlled-deploy/<timestamp>/`

Retain it through independent post-deployment review. Do not delete it during cleanup.

Backup must contain at minimum:
- live customization GET response JSON
- preview customization GET response JSON
- exact current desktop JS bytes downloaded from the live referenced fileKey
- exact current desktop CSS bytes downloaded from the live referenced fileKey
- current mobile customization evidence (expected empty)
- manifest containing App ID, revision, fileKeys, filenames, byte sizes, SHA-256 hashes, timestamp, reviewed candidate commit, authorization text/reference

Verify backup bytes/hashes are readable before first write.

Required gate:
`PREWRITE_BACKUP_GATE = PASS`

If backup cannot be captured or verified -> STOP, WRITE COUNT = 0.

# PHASE D — FINAL PRE-WRITE GATES

Immediately before first upload, re-check:
- repository candidate hashes still equal Phase A hashes
- live/preview state has not changed since Phase B
- backup gate still PASS
- target app = 794
- authorization scope still exact

If any changed -> STOP before write.

# PHASE E — CONTROLLED WRITE / DEPLOY

Only after A-D PASS:

Allowed primary write sequence:
1. Upload reviewed candidate JS file -> capture new JS fileKey.
2. Upload reviewed candidate CSS file -> capture new CSS fileKey.
3. PUT App794 preview customization with EXACT desired state:
   - scope remains expected value
   - desktop JS = exactly the new reviewed JS file
   - desktop CSS = exactly the new reviewed CSS file
   - mobile JS = []
   - mobile CSS = []
   - no unrelated customization entries
4. GET preview customization readback and verify exact new fileKeys/state before deploy.
5. POST deploy for App794 only.
6. Poll deploy status to `SUCCESS`.

Do not retry a failed write/deploy blindly. If an operation fails after first write, preserve exact evidence and follow rollback rules below.

# PHASE F — POST-DEPLOY READBACK

After deployment status SUCCESS:

1. GET live customization again.
2. Verify live revision advanced from the pre-write revision.
3. Verify live desktop JS/CSS fileKeys are exactly the new candidate fileKeys.
4. Verify mobile remains empty.
5. Download the newly deployed live JS/CSS bytes by their live fileKeys.
6. SHA-256 the downloaded live bytes.
7. Require downloaded live JS hash == reviewed candidate JS hash.
8. Require downloaded live CSS hash == reviewed candidate CSS hash.

Required:
- `LIVE_JS_HASH_MATCH = PASS`
- `LIVE_CSS_HASH_MATCH = PASS`
- `POST_DEPLOY_READBACK = PASS`

# PHASE G — NON-DESTRUCTIVE BROWSER SMOKE

Perform authenticated browser smoke on App794 without creating/updating records.

At minimum verify:
- App794 opens successfully
- desktop custom UI renders
- Create page renders without fatal JS error
- Set-up Objectives grid renders
- Employee lookup UI is present
- Create starts visually/unambiguously unverified until lookup
- browser console has no new fatal runtime exception from the deployed bundle

Optional read-only lookup may be used if safe, but DO NOT Save a valid record and DO NOT perform App794 record writes.

This authorization is customization deployment only. A true end-to-end valid Save that creates/updates an App794 record requires separate explicit record-write authorization.

# ROLLBACK AUTHORIZATION — CONDITIONAL / APP794 CUSTOMIZATION ONLY

Rollback is pre-authorized ONLY if this deployment causes failure, readback mismatch, or destructive runtime defect.

Rollback target = exact fresh pre-write customization state captured in Phase C.

Preferred rollback:
1. restore preview customization using the original pre-write JS/CSS fileKeys if still valid
2. deploy App794
3. poll SUCCESS
4. GET live readback
5. verify restored live downloaded bytes match pre-write backup SHA-256

If original fileKeys cannot be reused, re-upload the exact backup JS/CSS bytes and restore from those exact hashes.

Rollback must not change schema, records, process, ACL, or another app.

After rollback, STOP and report `DEPLOYMENT_ROLLED_BACK`.

# HARD SAFETY / WRITE ACCOUNTING

Primary authorized Kintone writes:
- candidate file uploads: up to 2
- App794 customization preview PUT: 1
- App794 deploy POST: 1

Conditional rollback writes are authorized only to restore the exact pre-write App794 customization state.

Forbidden:
- `APP794_RECORD_WRITE = 0`
- `APP794_SCHEMA_WRITE = 0`
- `APP794_PROCESS_WRITE = 0`
- `APP794_ACL_WRITE = 0`
- `APP53_WRITE = 0`
- `APP795_WRITE = 0`
- `APP796_WRITE = 0`
- `OTHER_APP_WRITE = 0`

Never reuse this authorization for a second candidate/deployment.

# NO-ORPHAN / EVIDENCE RULE

- Do not commit scratch/temporary executor files.
- Remove temporary local executor/debug files after evidence is preserved.
- Preserve fresh pre-write backup.
- Update existing living docs only; do not create duplicate `_old/_v2` docs.
- Commit factual deployment evidence and push same branch.
- No production source changes are expected in this deployment task.

# REQUIRED FINAL SUMMARY

Report exactly and factually:

`M10L_D_APP794_CONTROLLED_DEPLOY = COMPLETE / PARTIAL / BLOCKED / ROLLED_BACK`

`USER_AUTHORIZATION = VERIFIED_SINGLE_USE`
`REVIEWED_CANDIDATE_CODE_HEAD = 21f9e82ac42f279946ce87015ae714993f3478e8`
`CANDIDATE_DRIFT = 0 / DETECTED`
`npm test = actual / PASS|FAIL`
`GIT_DIFF_CHECK = PASS/FAIL`
`WORKTREE_CLEAN_PREWRITE = YES/NO`
`CANDIDATE_JS_SHA256 = actual`
`CANDIDATE_CSS_SHA256 = actual`
`PREWRITE_LIVE_REVISION = actual`
`PREWRITE_LIVE_JS_FILEKEY = actual`
`PREWRITE_LIVE_CSS_FILEKEY = actual`
`PREVIEW_DRIFT = 0 / DETECTED`
`PREWRITE_BACKUP_PATH = actual`
`PREWRITE_BACKUP_MANIFEST_SHA256 = actual`
`PREWRITE_BACKUP_GATE = PASS/FAIL`
`PRIMARY_FILE_UPLOAD_COUNT = actual`
`APP794_CUSTOMIZE_PUT_COUNT = actual`
`APP794_DEPLOY_POST_COUNT = actual`
`POST_DEPLOY_STATUS = actual`
`POST_DEPLOY_LIVE_REVISION = actual`
`POST_DEPLOY_LIVE_JS_FILEKEY = actual`
`POST_DEPLOY_LIVE_CSS_FILEKEY = actual`
`LIVE_JS_HASH_MATCH = PASS/FAIL`
`LIVE_CSS_HASH_MATCH = PASS/FAIL`
`POST_DEPLOY_READBACK = PASS/FAIL`
`BROWSER_SMOKE = PASS/PARTIAL/FAIL`
`ROLLBACK_EXECUTED = YES/NO`
`APP794_RECORD_WRITE = 0`
`APP794_SCHEMA_WRITE = 0`
`APP794_PROCESS_WRITE = 0`
`APP794_ACL_WRITE = 0`
`APP53_WRITE = 0`
`APP795_WRITE = 0`
`APP796_WRITE = 0`
`OTHER_APP_WRITE = 0`
`NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED`
`GIT_PUSH_SYNC = PASS/FAIL`

`NEXT_ACTION = CHATGPT POST-DEPLOY REVIEW`

After committing/pushing evidence, STOP.
Do not start another work package.
Do not perform App794 record writes.