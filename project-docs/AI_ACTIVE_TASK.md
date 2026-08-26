# AI ACTIVE TASK — M10L-D-R11 CONTROLLED APP794 R10 HOSHIN REGRESSION DEPLOY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> User authorization text: `อนุมัติ controlled App794 R10 Hoshin regression deploy`
> Authorization status: `VERIFIED_SINGLE_USE_OPEN`
> Reviewed runtime candidate: `2a12d19226f673d1b4b2972b17a5f21d29b8635a`
> Last verified live App794 state from R8/R9: Revision `32`, six scoring snapshot fields present
> Mode: CONTROLLED APP794 CUSTOMIZATION DEPLOY ONLY

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

R10 fixes the live 0118 defect where undefined `Department_Hoshin` / `Section_Hoshin` values poisoned the Kintone form state and caused `Routing_Topology` read-back failure.

# AUTHORIZATION BOUNDARY

The user's authorization is SINGLE-USE and applies only to deploying the exact reviewed R10 App794 customization.

Allowed writes:
1. Upload exact reviewed `dist/mbo-employee-app.js` bytes.
2. If Kintone customization PUT requires fresh fileKeys (known `GAIA_BL01` behavior), upload the CURRENT LIVE CSS bytes only to preserve identical CSS content; CSS SHA256 must remain identical to pre-write live CSS.
3. PUT App794 preview customization preserving unrelated JS/CSS ordering and mobile customization.
4. Deploy App794 preview customization.
5. Rollback customization only if required by the failure gates below, using the fresh pre-write backup from this execution.

Not authorized:
- App794 form/schema writes.
- App794 record create/update/delete.
- App794 process-management writes.
- App794 ACL/permission writes.
- App53/App795/App796/other-app writes.
- source/dist/test modifications.
- UI polish, dashboard, Hoshin business-rule changes, or unrelated cleanup.

Any action outside this boundary -> STOP and report.

# CHANGE GOVERNANCE

## What
Deploy the exact reviewed R10 App794 JavaScript customization that prevents undefined Hoshin mutation.

## Where
Kintone App794 desktop customization only.

## How
Candidate lock -> fresh live/preview drift GET -> fresh durable backup -> upload exact R10 JS (and byte-identical current CSS only if required for a valid customize PUT) -> customization PUT -> deploy -> live read-back -> non-destructive browser smoke for 0118.

## Why
Live Revision 32 still runs the pre-R10 bundle and reproduces the user-observed Hoshin invalid-value / Routing_Topology persistence failure.

## Expected Impact
0118 employee lookup completes without Hoshin invalid-value banner; `Routing_Topology = M1_G1`, `Profile_Code = PROF_STAFF_CHIEF`, 70/30 snapshot persists/read-backs, employee becomes verified and Objective Grid unlocks.

## Risks
- live/preview drift since Revision 32;
- wrong JS candidate bytes;
- customization asset/order/mobile drift;
- CSS content accidentally changes while refreshing fileKey;
- runtime regression after deploy.

## Test Plan
Exact candidate/live hash read-back plus non-destructive browser smoke for employee 0118. No Save/record creation.

## Rollback Plan
Restore exact pre-write App794 customization from the fresh R11 backup and redeploy only if this R11 customization causes a deploy/hash/runtime failure. Do not change schema/records/process/ACL during rollback.

# CREDIT-SAVING EXECUTION RULE

Do NOT perform broad discovery.
Do NOT inspect unrelated project history.
Do NOT rebuild source/dist.
Do NOT rerun the 551-test suite when candidate bytes are unchanged; R10 review already accepted `551/551 PASS`, source/dist exactness and classic bundle parse.
Do NOT test other apps.
Do NOT create a test record.

Use the minimum calls necessary for this deployment.

# PHASE A — CANDIDATE LOCK

1. Pull latest branch and require local HEAD == origin HEAD.
2. Prove the only commit above reviewed R10 candidate `2a12d192...` is this Control Plane task commit. Any other source/dist/test/runtime change -> STOP.
3. Require zero diff from R10 candidate in `src/**`, `dist/**`, `tests/**`, package/build/runtime config.
4. `git diff --check` -> PASS.
5. Worktree clean.
6. Compute exact bytes + SHA256 for:
   - `dist/mbo-employee-app.js`
   - `dist/mbo-employee.css`
7. Do not rebuild. Do not rerun full npm test.

# PHASE B — FRESH READ-ONLY DRIFT GATE

GET-only App794 checks immediately before backup/write:
- live revision;
- preview revision;
- live and preview customization including desktop JS/CSS fileKeys/order and mobile customization;
- live/preview form fields only to confirm the six R8 scoring snapshot fields still exist and no schema repair is needed;
- deploy status if relevant.

Expected:
- live revision = `32`;
- preview revision = `32`;
- six snapshot fields exist in live + preview:
  `Profile_Code`, `PartA_Weight`, `PartB_Weight`, `Part_A_Scoring_Mode`, `Competency_Set_Code`, `Configuration_Hash`.

If live or preview revision differs, customization differs unexpectedly, or any of six fields is missing -> `PREWRITE_DRIFT = YES`, STOP with zero writes.

# PHASE C — FRESH PRE-WRITE BACKUP

Immediately before first write create:

`backups/m10l-d-r11-app794-r10-hoshin-deploy/<timestamp>/`

Include at minimum:
- live/preview settings/revisions;
- live/preview customization JSON;
- live/preview form-field read-back used by the drift gate;
- exact current live JS bytes + fileKey + SHA256 + bytes;
- exact current live CSS bytes + fileKey + SHA256 + bytes;
- mobile customization state/bytes if any;
- manifest with inventory/hashes, timestamp, App794, R10 candidate commit and this authorization text.

Require backup exists, readable, manifest hash recorded, and customization rollback content is sufficient.

# PHASE D — FINAL PRE-WRITE GATE

Immediately before first write reconfirm:
- worktree clean;
- candidate JS hash unchanged;
- live/preview state unchanged from Phase B;
- backup gate PASS;
- authorization exact and still open.

Any change -> STOP.

# PHASE E — UPLOAD / CUSTOMIZATION / DEPLOY

1. Upload exact reviewed R10 JS bytes via file upload.
2. For CSS:
   - Prefer preserving current CSS content.
   - Because R8 proved old deployed CSS fileKeys can cause `GAIA_BL01` in preview customization PUT, a fresh CSS file upload is explicitly allowed ONLY when using exact current live CSS bytes.
   - Require uploaded CSS SHA256 == pre-write live CSS SHA256.
3. PUT App794 preview customization:
   - replace only intended desktop JS with uploaded R10 JS fileKey;
   - preserve CSS content exactly;
   - preserve unrelated JS ordering/assets;
   - preserve mobile customization exactly.
4. GET preview customization and verify exact intended state.
5. Deploy App794 and poll until SUCCESS.

No schema/record/process/ACL/other-app writes.

# PHASE F — POST-DEPLOY READ-BACK

After SUCCESS:
- GET live revision and customization;
- download live JS and require SHA256 == R10 candidate JS SHA256;
- download live CSS and require SHA256 == pre-write live CSS SHA256;
- require unrelated JS/order/mobile unchanged;
- verify six snapshot fields still exist unchanged.

Hash/content mismatch or unexplained drift -> STOP and evaluate customization rollback.

# PHASE G — NON-DESTRUCTIVE BROWSER SMOKE (0118 ONLY)

Use App794 Create page. Do NOT Save.

For employee `0118` require:
1. App opens and custom UI renders.
2. No fatal console error before lookup.
3. Search 0118.
4. No Kintone banner:
   - `Department_Hoshin.value is invalid`
   - `Section_Hoshin.value is invalid`
5. No inline `Routing_Topology ... got undefined` error.
6. Employee verified = true.
7. `Profile_Code = PROF_STAFF_CHIEF`.
8. Part A / Part B = 70 / 30.
9. `Routing_Topology = M1_G1` read-back.
10. Required 9 snapshot fields persist/read-back.
11. Existing Hoshin/form values are not poisoned by undefined.
12. Objective Grid becomes available/unlocked according to existing valid Create-state logic.
13. No new fatal console error.

Do not Save, Submit, create or delete any record.

# PHASE H — ROLLBACK CONDITIONS

Rollback customization only if:
- deploy fails leaving inconsistent customization state;
- live JS hash != exact R10 candidate;
- CSS content hash changes unexpectedly;
- unrelated customization/mobile changes;
- R10 deployment causes fatal runtime defect.

Use only the fresh R11 backup. Do not rollback schema fields. Record exact rollback calls if any.

# REQUIRED EVIDENCE

Append one concise R11 block to `project-docs/AI_REVIEW_PACKAGE.md`; update living status docs minimally. Do not create new evidence files.

Record:
`M10L_D_R11_CONTROLLED_DEPLOY = COMPLETE / PARTIAL / BLOCKED`
`USER_AUTHORIZATION = VERIFIED_SINGLE_USE_CONSUMED`
`AUTHORIZATION_TEXT = อนุมัติ controlled App794 R10 Hoshin regression deploy`
`REVIEWED_R10_CANDIDATE = 2a12d19226f673d1b4b2972b17a5f21d29b8635a`
`CANDIDATE_DRIFT = 0 / actual`
`GIT_DIFF_CHECK = PASS/FAIL`
`WORKTREE_CLEAN_PREWRITE = YES/NO`
`CANDIDATE_JS_SHA256 = actual`
`CANDIDATE_JS_BYTES = actual`
`PREWRITE_LIVE_REVISION = actual`
`PREWRITE_PREVIEW_REVISION = actual`
`PREWRITE_DRIFT = NO/YES`
`PREWRITE_JS_FILEKEYS = actual`
`PREWRITE_CSS_FILEKEYS = actual`
`PREWRITE_CSS_SHA256 = actual`
`PREWRITE_BACKUP_PATH = actual`
`PREWRITE_BACKUP_GATE = PASS/FAIL`
`JS_FILE_UPLOAD_COUNT = actual`
`CSS_FILE_UPLOAD_COUNT = actual`
`CUSTOMIZE_PUT_COUNT = actual`
`DEPLOY_POST_COUNT = actual`
`POST_DEPLOY_STATUS = actual`
`POST_DEPLOY_LIVE_REVISION = actual`
`LIVE_JS_SHA256 = actual`
`LIVE_JS_HASH_MATCH = PASS/FAIL`
`LIVE_CSS_SHA256 = actual`
`LIVE_CSS_CONTENT_PRESERVED = PASS/FAIL`
`MOBILE_CUSTOMIZE_PRESERVED = PASS/FAIL`
`SIX_FIELD_SCHEMA_PRESERVED = PASS/FAIL`
`BROWSER_0118_NO_HOSHIN_INVALID_BANNER = PASS/FAIL`
`BROWSER_0118_ROUTING_TOPOLOGY = actual / PASS|FAIL`
`BROWSER_0118_PROFILE = actual / PASS|FAIL`
`BROWSER_0118_WEIGHTS = actual / PASS|FAIL`
`BROWSER_0118_9_SNAPSHOT_READBACK = PASS/FAIL`
`BROWSER_0118_VERIFIED = PASS/FAIL`
`BROWSER_OBJECTIVE_GRID_UNLOCKED = PASS/FAIL`
`BROWSER_CONSOLE_FATAL = PASS/FAIL`
`APP794_RECORD_WRITE = 0`
`APP794_SCHEMA_WRITE = 0`
`APP794_PROCESS_WRITE = 0`
`APP794_ACL_WRITE = 0`
`APP53_WRITE = 0`
`APP795_WRITE = 0`
`APP796_WRITE = 0`
`OTHER_APP_WRITE = 0`
`ROLLBACK_EXECUTED = YES/NO`
`NO_ORPHAN_ARTIFACT_GATE = PASS/FAIL`
`CONFIRMED_BASELINE_CONFLICT_COUNT = 0`
`GIT_PUSH_SYNC = PASS/FAIL`
`NEXT_ACTION = CHATGPT REVIEW`

Push same branch and STOP.