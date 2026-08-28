# AI ACTIVE TASK — D1 APP794 SESSION CONTINUITY DEPLOY

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **ONE NARROW PRODUCTION DEPLOY-ONLY CHANGE — APP794 CUSTOMIZATION ONLY**

## 0. Exact Authorization

User explicitly authorized on 2026-08-28:

```text
APP794_SESSION_CONTINUITY_DEPLOY = APPROVED
```

This authorizes only deployment of the already accepted Session Continuity JS artifact to App794.

It does **not** authorize:
- source edits/refactor;
- Create-handler corrective;
- UAT;
- App801 schema/record writes;
- App794 record writes;
- CSS replacement/re-upload;
- ACL/process/view/layout changes;
- App53/App795/App796 writes;
- D2-D7 writes.

Maximum executor status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/D1_SESSION_CONTINUITY.md`
4. `skills/kintone/safe-live-change.md`
5. `scripts/kintone/deploy-custom-ui.js`
6. `project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md` only to append deployment evidence

Do not scan repository/history broadly.
Do not read/modify `employee-part-a-ui.js`, `main-mbo-app.js`, Session source modules, or unrelated D2-D7 source except as indirectly read by the existing deterministic build process.

## 2. Locked Deployment Package

Accepted source commit:

```text
7133e2934b0e8f7ea710e03d195157354e0d95b8
```

Accepted final test proof:

```text
9d9db0f2456b5b3407b8dae830493c0eb9a9cc7f
```

Exact target artifact:

```text
TARGET_PATH                 = dist/mbo-employee-app.js
TARGET_GIT_BLOB_SHA         = d0294229bf0f7ccdf4d161632648bc885794c347
EXPECTED_CSS_GIT_BLOB_SHA   = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
```

Last accepted App794 live target before Session Continuity:

```text
LAST_ACCEPTED_LIVE_REVISION       = 42
LAST_ACCEPTED_LIVE_JS_BLOB        = 2a9a3c5bfe896b51f482c016f66863bffeddb679
LAST_ACCEPTED_LIVE_CSS_BLOB       = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
LAST_ACCEPTED_SCOPE               = ALL
LAST_ACCEPTED_DESKTOP_JS_COUNT    = 1
LAST_ACCEPTED_DESKTOP_CSS_COUNT   = 1
LAST_ACCEPTED_MOBILE_JS_COUNT     = 0
LAST_ACCEPTED_MOBILE_CSS_COUNT    = 0
```

These are drift-detection expectations only. Fresh live state must be read; do not assume revision 42 is still current.

## 3. Mandatory Local Gate — BEFORE ANY KINTONE WRITE

Start from the latest canonical branch and require a clean worktree.

Run:

```text
npm run ui:build
npm test
```

Then verify:

```text
BUILD_RESULT = PASS
NPM_TEST_RESULT = PASS
TARGET_GIT_BLOB_SHA_AFTER_BUILD = d0294229bf0f7ccdf4d161632648bc885794c347
CSS_GIT_BLOB_SHA_AFTER_BUILD    = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
```

Use a Git-compatible blob check such as `git hash-object` on the generated files.

Hard stop conditions before Kintone write:
- build fails;
- test fails;
- target JS blob differs from `d0294229...`;
- CSS blob differs from `1359dfae...`;
- build/source produces an unexpected tracked source/dist diff beyond a deterministic no-content-change rebuild;
- working tree contains unrelated changes.

Required failure result:

```text
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
STOP
```

Do not fix source in this task.

## 4. Dependency Read-Only Gate — App801

Before App794 upload, read App801 Live form/schema only.

Require all five accepted fields still exist with the canonical types:

```text
Session_Token_Hash          SINGLE_LINE_TEXT
Session_Issued_At           DATETIME
Session_Expires_At          DATETIME
Session_Credential_Version  NUMBER
Session_Kintone_User        SINGLE_LINE_TEXT
```

No App801 write is authorized.
If any field is missing/wrong type, STOP before App794 upload.

## 5. Fresh App794 Pre-Deploy Discovery + Backup — READ ONLY

Immediately before any App794 remote write:

1. GET effective/live App794 customization;
2. GET Preview/Test App794 customization;
3. capture current live and preview revisions;
4. save rollback-ready Live + Preview customization metadata locally under `scratch/` or temporary storage;
5. capture scope/order/entry type/filename/URL/fileKey metadata needed for preservation verification;
6. download/read current effective target JS and current effective CSS and compute Git-blob or equivalent exact content identity;
7. do not commit secrets, fileKeys if considered sensitive, auth headers, cookies or API tokens.

Prewrite drift expectations:
- effective target JS should still match the last accepted live JS blob `2a9a3c5b...` unless a later accepted App794 change is explicitly documented in current Control Center;
- effective CSS should match `1359dfae...`;
- Live and Preview customization must be semantically aligned in scope/topology;
- current topology must not contain unexplained extra/removed/reordered entries.

If unexpected live content/topology/revision history is found, STOP before upload. Do not overwrite unexplained production drift.

## 6. Strict Preflight — MUST FINISH BEFORE FILE UPLOAD

Use the accepted `validatePreflight()` behavior in `scripts/kintone/deploy-custom-ui.js` against fresh Live + Preview state.

Require before upload:
- explicit desktop/mobile objects;
- explicit desktop.js / desktop.css / mobile.js / mobile.css arrays;
- valid scope = `ALL | ADMIN | NONE` and Live == Preview;
- Preview revision is a positive integer and not `-1`;
- exactly one Preview desktop JS FILE named `mbo-employee-app.js`;
- every retained Preview FILE has its valid Preview fileKey;
- same-named CSS/mobile FILEs are not exempted;
- URL/FILE entries are structurally valid;
- Live/Preview topology aligns.

Any deterministic preflight failure must occur before upload:

```text
TARGET_JS_UPLOAD_COUNT = 0
PREVIEW_CUSTOMIZATION_PUT_COUNT = 0
APP794_DEPLOY_REQUEST_COUNT = 0
STOP
```

## 7. Exact Authorized Write Sequence

Only after Sections 3–6 all PASS:

1. Upload exactly one file: `mbo-employee-app.js` built from the locked package.
2. `CSS_UPLOAD_COUNT = 0`.
3. `OTHER_FILE_UPLOAD_COUNT = 0`.
4. Build Preview PUT payload from the fresh Preview state, not Live state or an old backup.
5. Replace only the exact Preview `desktop.js` target entry.
6. Preserve every non-target Preview FILE key.
7. Preserve scope, order, URL entries and all mobile entries.
8. Include the exact latest positive Preview revision; never use `-1`.
9. PUT App794 Preview customization exactly once.
10. Deploy App794 exactly once.
11. Poll deployment until Kintone reports `SUCCESS`.

Existing command may be used only after all independent pre-write gates above are complete:

```text
npm run ui:deploy
```

Do not invoke it more than once. The script performs its own fresh Live/Preview read and strict preflight again before upload.

If upload/PUT/deploy fails:

```text
STOP
NO RETRY
NO AUTOMATIC ROLLBACK
NO SOURCE FIX
```

## 8. Mandatory Post-Deploy Independent Read-Back by Executor

After deployment reports `SUCCESS`:

1. fresh GET effective/live customization;
2. fresh GET Preview customization;
3. capture Live + Preview revisions after;
4. verify Live/Preview scope/topology alignment;
5. download/read effective `mbo-employee-app.js` and prove exact target content identity = `d0294229bf0f7ccdf4d161632648bc885794c347` (or equivalent byte identity then compute Git blob);
6. download/read effective CSS and prove content identity remains `1359dfae16d1224580210a5a6cd366fb20bcf6f8`;
7. prove non-target entries/order/URLs/mobile configuration remain unchanged from prewrite backup;
8. prove local rebuilt target still has the locked blob after deploy command;
9. do not execute UI UAT in this task.

Required success indicators:

```text
DEPLOYMENT_COMPLETED = YES
TARGET_CONTENT_HASH_MATCH = YES
CSS_CONTENT_HASH_MATCH = YES
NON_TARGET_CUSTOMIZATION_PRESERVED = YES
LIVE_PREVIEW_ALIGNMENT_AFTER = PASS
```

Do not self-PASS. These remain executor evidence pending ChatGPT review.

## 9. Mandatory Counters

Report exact counts:

```text
TARGET_JS_UPLOAD_COUNT                 = 1
CSS_UPLOAD_COUNT                       = 0
OTHER_FILE_UPLOAD_COUNT                = 0
PREVIEW_CUSTOMIZATION_PUT_COUNT        = 1
APP794_DEPLOY_REQUEST_COUNT            = 1
APP794_RECORD_WRITES_EXECUTED          = 0
APP801_SCHEMA_WRITES_EXECUTED          = 0
APP801_RECORD_WRITES_EXECUTED          = 0
APP53_WRITES_EXECUTED                  = 0
APP795_WRITES_EXECUTED                 = 0
APP796_WRITES_EXECUTED                 = 0
GROUP_ACL_WRITES_EXECUTED              = 0
PROCESS_VIEW_LAYOUT_WRITES_EXECUTED    = 0
CREATE_HANDLER_FIX_EXECUTED            = 0
UAT_EXECUTED                           = 0
D2_D7_WRITES_EXECUTED                  = 0
ROLLBACK_WRITES_EXECUTED               = 0
SOURCE_FILES_CHANGED                   = 0
TEST_FILES_CHANGED                     = 0
```

`DIST_FILES_CHANGED` must be 0 as a content change; deterministic build may rewrite the file on disk but its Git blob must remain exactly locked and Git diff must remain clean for dist after build.

## 10. Evidence

Update only:

```text
project-docs/D1_ACCESS_GROUP_SETUP_EVIDENCE.md
```

Append:

```text
## 15. App794 Session Continuity Deploy
```

Include sanitized evidence:
- exact authorization;
- source commit + locked artifact blobs;
- build/test result;
- local JS/CSS blob after build;
- App801 dependency read result;
- Live/Preview revisions before;
- prewrite target JS/CSS content identities;
- preflight result;
- backup-ready status;
- upload/PUT/deploy counters;
- deployment polling result;
- Live/Preview revisions after;
- effective deployed JS/CSS identities;
- non-target preservation result;
- all mandatory zero-write counters;
- blocker details if any.

Do not commit:
- API tokens;
- cookies/auth headers;
- Kintone credentials;
- raw session tokens/token hashes;
- App801 password/hash record values;
- employee personal data;
- full production record exports.

Commit/push one concise evidence-only commit, then STOP.

## 11. Explicitly Forbidden

- NO source edit/refactor;
- NO manual dist business-logic edit;
- NO CSS upload;
- NO second deployment attempt;
- NO automatic rollback;
- NO App801 schema or record write;
- NO App794 record write;
- NO Create-handler corrective;
- NO UAT;
- NO App53/App795/App796 write;
- NO group/ACL/process/view/layout change;
- NO D2-D7 work;
- NO self-PASS;
- NO follow-on task creation.

## 12. Delivery

Return only:

```text
COMMIT_SHA
BUILD_RESULT
NPM_TEST_RESULT
TARGET_GIT_BLOB_SHA_AFTER_BUILD
CSS_GIT_BLOB_SHA_AFTER_BUILD
APP801_DEPENDENCY_GATE
LIVE_REVISION_BEFORE
PREVIEW_REVISION_BEFORE
PRE_DEPLOY_TARGET_JS_BLOB
PRE_DEPLOY_CSS_BLOB
STRICT_PREFLIGHT_RESULT
BACKUP_RESULT
TARGET_JS_UPLOAD_COUNT
CSS_UPLOAD_COUNT
PREVIEW_CUSTOMIZATION_PUT_COUNT
APP794_DEPLOY_REQUEST_COUNT
DEPLOYMENT_RESULT
LIVE_REVISION_AFTER
PREVIEW_REVISION_AFTER
DEPLOYED_TARGET_JS_BLOB
POST_DEPLOY_CSS_BLOB
TARGET_CONTENT_HASH_MATCH
CSS_CONTENT_HASH_MATCH
NON_TARGET_CUSTOMIZATION_PRESERVED
APP794_RECORD_WRITES_EXECUTED = 0
APP801_SCHEMA_WRITES_EXECUTED = 0
APP801_RECORD_WRITES_EXECUTED = 0
CREATE_HANDLER_FIX_EXECUTED = 0
UAT_EXECUTED = 0
SOURCE_FILES_CHANGED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP. ChatGPT independently reviews before any UAT or Create-handler work is authorized.
