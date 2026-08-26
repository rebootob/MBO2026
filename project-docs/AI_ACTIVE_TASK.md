# AI ACTIVE TASK — M10L-D-R8 CONTROLLED APP794 SIX-FIELD SCHEMA + CUSTOMIZATION REPAIR

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Authorization basis: exact user message `อนุมัติ controlled App794 six-field schema + customization repair`
> Authorization status: `VERIFIED_SINGLE_USE_OPEN`
> Authorization scope: App794 only; exact six-field schema addition + exact reviewed customization repair
> Reviewed runtime candidate: `19977543dd8572aa8138a79bd351ff6ccf473696`
> Reviewed documentation closure HEAD before authorization: `4087516c0bb0aecf9a0fb9d43e7fab71a8fd998a`
> Last known live App794 revision: `29`
> Mode: CONTROLLED KINTONE WRITE + DEPLOY

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

This task repairs the confirmed live App794 schema gap that blocks persistence of the reviewed scoring/profile snapshot. Do not add unrelated features, UI polish, dashboard changes, new business rules, or workflow redesign.

# AUTHORIZATION BOUNDARY

The user explicitly authorized exactly:

`อนุมัติ controlled App794 six-field schema + customization repair`

This authorization is SINGLE-USE and applies only to the controlled execution described below.

Allowed writes:
1. App794 preview form schema: add exactly the six missing snapshot fields listed in this task.
2. Upload the exact reviewed App794 JS customization candidate file required by this repair.
3. Update App794 preview customization settings only as required to point to the uploaded reviewed JS candidate while preserving unrelated JS/CSS ordering/assets and mobile customization.
4. Deploy App794 preview changes.
5. Rollback only if required by this task's rollback gates, using the fresh backup created immediately before the write.

Not authorized:
- App794 record create/update/delete.
- App794 process-management changes.
- App794 app/record/field ACL or permission API changes.
- App794 layout changes unrelated to adding the six fields.
- App53 writes.
- App795 writes.
- App796 writes.
- App797/798/800/801 or any other app writes.
- Any change to confirmed business baseline.
- Any source refactor, new feature, UI polish, dashboard work, or unrelated cleanup.

If a required action falls outside this authorization, STOP and report; do not infer or expand scope.

# CONFIRMED REVIEW STATE

R7 review gate = PASS WITH OBSERVATION / CLOSED.

Reviewed facts:
- R6 runtime candidate `19977543dd8572aa8138a79bd351ff6ccf473696` restored valid workflow `return event;` and preserved invalid -> `false`.
- R6 reported 550/550 tests PASS.
- R5 global test hook closure and API-unavailable fail-closed matrix are preserved.
- R7 changed docs only; `src/**`, `dist/**`, `tests/**`, `config/**` remained byte-identical to R6.
- App796 has exactly one PUBLISHED FY2026 `PROF_STAFF_CHIEF` configuration for the reviewed 0118 case with 70/30 evidence.
- App794 live/preview were last verified at Revision 29 and were missing exactly six scoring snapshot fields.

# EXACT SIX FIELDS TO ADD — APP794 ONLY

Add exactly these field codes with these reviewed settings:

| Field Code | Type | Label | Required | Unique | Default |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `Profile_Code` | `SINGLE_LINE_TEXT` | Profile Code | false | false | empty |
| `PartA_Weight` | `NUMBER` | Part A Weight (%) | false | false | empty |
| `PartB_Weight` | `NUMBER` | Part B Weight (%) | false | false | empty |
| `Part_A_Scoring_Mode` | `SINGLE_LINE_TEXT` | Part A Scoring Mode | false | false | empty |
| `Competency_Set_Code` | `SINGLE_LINE_TEXT` | Competency Set Code | false | false | empty |
| `Configuration_Hash` | `SINGLE_LINE_TEXT` | Configuration Hash | false | false | empty |

Rules:
- Do not add any seventh field.
- Do not rename an existing field to satisfy this task.
- Do not alter required/unique/type/label of unrelated fields.
- Do not make a permission/ACL write. Current permission evidence for nonexistent fields was `UNVERIFIABLE`; after creation verify effective usability through read-back/browser smoke. If a permission change appears necessary, STOP and request a new authorization.
- Native visibility may remain hidden through the existing customization behavior; do not perform unrelated form layout redesign.

# CHANGE GOVERNANCE

## What
Repair App794 by adding the six missing schema-backed scoring/profile snapshot fields and deploying the exact reviewed corrected App794 JavaScript customization.

## Where
- Kintone App794 preview form fields.
- Kintone App794 desktop customization JS reference.
- Repository evidence/living docs after execution only.

## How
Fresh drift gate -> fresh durable backup -> exact six-field POST -> read-back -> exact reviewed JS file upload -> customization PUT preserving unrelated assets -> deploy -> poll -> live read-back -> non-destructive browser smoke -> evidence commit.

## Why
The live App794 form cannot persist `Profile_Code` and five related scoring snapshot values because the fields do not exist. The reviewed runtime intentionally fails closed until schema-backed persistence is possible.

## Expected Impact
Employee lookup for a valid employee such as 0118 can persist the full 9-field core snapshot and satisfy Save prerequisites without synthetic fields or fail-open behavior.

## Risks
- live/preview drift since Revision 29;
- wrong field type/code;
- accidental customization asset loss/order change;
- candidate mismatch;
- permission/access mismatch after field creation;
- runtime regression after deploy;
- backup not being fully restorable.

## Test Plan
Automated source/dist/tests plus exact live schema/customization read-back and non-destructive browser smoke listed below.

## Rollback Plan
Use only the fresh pre-write backup created in this execution. Restore exact prior schema/customization state and redeploy only if the post-write gates fail and rollback is technically safe/necessary. Record exact rollback writes. Do not use historical backups as the primary rollback source.

# PHASE A — REPOSITORY / CANDIDATE LOCK

Before any Kintone write:

1. Pull latest `ai/antigravity-wp002c`.
2. Require local HEAD == origin HEAD.
3. Confirm HEAD descends from Control Plane task commit and from reviewed R6 runtime candidate `19977543dd8572aa8138a79bd351ff6ccf473696`.
4. Confirm there are no changes since R6 in:
   - `src/**`
   - `dist/**`
   - `tests/**`
   - runtime config/dependency files affecting App794 candidate.
5. Run full `npm test`; require PASS. Expected prior baseline: 550 PASS, but record actual.
6. Run `git diff --check`; require PASS.
7. Confirm worktree is clean before pre-write backup.
8. Compute and record exact candidate:
   - `dist/mbo-employee-app.js` bytes + SHA256.
   - `dist/mbo-employee.css` bytes + SHA256.
9. Prove committed source/dist deterministic exactness and classic-bundle parse PASS.
10. Confirm no `__MBO_APP__` residue.

Any candidate/runtime drift from reviewed R6 -> STOP. Do not deploy a changed bundle under this authorization.

# PHASE B — FRESH READ-ONLY LIVE/PREVIEW DRIFT GATE

Before backup/write, perform fresh GET-only checks for App794:

1. Live app/settings revision.
2. Preview app/settings revision.
3. Live form fields.
4. Preview form fields.
5. Live customization settings including exact desktop JS/CSS fileKeys/order and mobile customization.
6. Preview customization settings including exact desktop JS/CSS fileKeys/order and mobile customization.
7. Read current field-permission/ACL state only for backup/evidence; DO NOT write permissions.
8. Deploy status GET if applicable.

Expected starting condition:
- live revision = 29;
- preview revision = 29;
- all six target fields absent from both live and preview;
- current live JS/CSS represent the prior Revision 29 deployment.

If any expected state differs:
- set `PREWRITE_DRIFT_DETECTED = YES`;
- STOP with zero Kintone writes under this task;
- do not try to reconcile silently.

# PHASE C — FRESH DURABLE PRE-WRITE BACKUP

Immediately before any write, create a fresh durable backup, for example:

`backups/m10l-d-r8-app794-six-field-repair/<timestamp>/`

The backup must include enough evidence to restore/verify the exact prior App794 state:

- live app/settings JSON;
- preview app/settings JSON;
- live form fields JSON;
- preview form fields JSON;
- live customization settings JSON;
- preview customization settings JSON;
- read-only permission/ACL snapshots relevant to App794;
- exact current desktop JS file(s) downloaded as bytes;
- exact current desktop CSS file(s) downloaded as bytes;
- mobile customization state/file references and bytes if any;
- manifest containing:
  - timestamp;
  - app ID 794;
  - pre-write live revision;
  - pre-write preview revision;
  - exact JS/CSS/mobile fileKeys/order;
  - SHA256 + bytes for every downloaded customization file;
  - reviewed runtime candidate commit;
  - Control Plane authorization/task commit;
  - backup file inventory and hashes.

After writing backup:
- prove backup exists;
- prove files are readable;
- compute manifest SHA256;
- perform a restorable-content sanity check.

If backup is missing, unreadable, incomplete, or cannot support rollback -> `PREWRITE_BACKUP_GATE = FAIL`, STOP with zero Kintone writes.

# PHASE D — FINAL PRE-WRITE GATE

Immediately before the first write:

1. Reconfirm worktree clean.
2. Reconfirm candidate JS hash == Phase A candidate hash.
3. Reconfirm no source/dist drift.
4. Reconfirm live/preview state has not changed since Phase B.
5. Reconfirm six fields are still absent.
6. Reconfirm backup gate PASS.
7. Reconfirm exact user authorization string and scope.

If any gate changes -> STOP.

# PHASE E — ADD EXACT SIX FIELDS IN PREVIEW

Perform exactly ONE Add Form Fields operation for App794 using the Kintone add-fields API contract:

`POST /k/v1/preview/app/form/fields.json`

Payload must target App794 and contain exactly the six reviewed field definitions. Do not include unrelated fields.

Write accounting:
- `APP794_ADD_FIELDS_POST_COUNT = 1` expected.
- all other schema write types = 0.

Immediately after POST:
- GET preview form fields;
- verify all six fields exist exactly once with exact type/code/label/required/unique/default semantics;
- verify unrelated schema fields remain unchanged.

If preview schema read-back fails or differs -> STOP further forward writes and evaluate rollback using the fresh backup.

# PHASE F — UPLOAD EXACT REVIEWED JS CANDIDATE

Upload only the exact reviewed candidate JavaScript bytes:

`POST /k/v1/file.json`

Expected:
- one JS file upload if CSS is unchanged.
- do NOT re-upload CSS merely for convenience.
- if CSS candidate hash differs from current live CSS or a CSS write unexpectedly appears necessary, STOP and report rather than expanding scope.

Record:
- `PRIMARY_JS_FILE_UPLOAD_COUNT`;
- uploaded JS fileKey;
- uploaded file bytes/hash match reviewed candidate = PASS/FAIL.

# PHASE G — UPDATE PREVIEW CUSTOMIZATION SETTINGS

Use:

`PUT /k/v1/preview/app/customize.json`

Requirements:
- target App794 only;
- replace only the intended desktop JS candidate reference;
- preserve unrelated desktop JS assets/order exactly;
- preserve existing CSS fileKey/order exactly when CSS content is unchanged;
- preserve mobile customization exactly;
- do not change scope/device settings unless required by the reviewed current configuration and explicitly identical to prior state.

Immediately GET preview customization and compare:
- new JS fileKey appears in exact intended slot;
- unrelated JS/CSS unchanged;
- CSS preserved;
- mobile preserved.

Mismatch -> STOP and evaluate rollback.

# PHASE H — DEPLOY APP794

Deploy App794 preview changes using:

`POST /k/v1/preview/app/deploy.json`

with controlled body:

`{ "apps": [{ "app": 794 }] }`

Then poll/read deployment status until:
- SUCCESS -> continue;
- FAIL -> rollback decision;
- timeout/unknown -> STOP and investigate read-only before any further write.

Expected primary write accounting if no rollback:
- Add Fields POST = 1
- JS file upload POST = 1
- Customize PUT = 1
- Deploy POST = 1

No record/process/ACL/other-app writes.

# PHASE I — POST-DEPLOY LIVE READ-BACK

After SUCCESS:

1. GET live app/settings and record exact new revision.
2. GET live form fields and prove exact six fields exist once with exact settings.
3. GET live customization settings and record full JS/CSS/mobile references/order.
4. Download deployed live JS and compute bytes + SHA256.
5. Require live JS SHA256 == reviewed candidate SHA256.
6. Download/verify live CSS and require it matches preserved pre-write CSS unless no CSS existed.
7. Verify mobile customization unchanged.
8. Verify no unexpected schema/customization changes.
9. Verify read-only effective access is sufficient for the runtime to read/write the six fields on the form. If not, treat as defect; DO NOT perform a permission write under this authorization.

Any unexplained live drift/hash mismatch -> BLOCKED and evaluate rollback.

# PHASE J — NON-DESTRUCTIVE BROWSER SMOKE

Use authenticated browser smoke on App794. Avoid persistent junk records.

Minimum required checks:

1. App794 opens without fatal runtime error.
2. Desktop custom UI renders.
3. Create page renders; Objective grid present.
4. Employee lookup UI present and Create starts unverified.
5. Employee `0118` lookup:
   - resolves `PROF_STAFF_CHIEF`;
   - Part A = 70;
   - Part B = 30;
   - all 9 core snapshot form-state fields are present and read-back matches:
     `Profile_Code`, `PartA_Weight`, `PartB_Weight`, `Part_A_Scoring_Mode`, `Competency_Set_Code`, `Configuration_Hash`, `Routing_Topology`, `Requester_User`, `Record_Key`;
   - verification becomes true only after persistence/read-back passes.
6. Employee `0111` resolves `PROF_ASST_MGR` with expected 60/40 behavior.
7. Missing/invalid routing remains fail closed where safely testable without persistent data.
8. 0/duplicate scoring remains fail closed where safely testable without mutating App796.
9. Objective Save validation path no longer fails solely because `Profile_Code`/snapshot schema is missing.
10. Workflow handler runtime has no new fatal exception; do not create persistent junk merely to exercise full business transitions in this deployment smoke.
11. Browser console has no new fatal error caused by this repair.

If a destructive Save/Submit would create a junk record, do not perform it unless a disposable test record already exists and cleanup is within existing authorization (record writes are NOT authorized here). Prefer non-persistent validation/state checks.

# PHASE K — ROLLBACK CONDITIONS

Rollback is allowed within this single-use authorization only when needed to restore the exact pre-write App794 state because this authorized repair failed.

Rollback triggers include:
- deploy FAIL with inconsistent preview/live state;
- post-deploy live JS hash mismatch;
- schema differs from exact reviewed six-field plan;
- customization assets/order/mobile unintentionally changed;
- fatal runtime defect caused by this deployment;
- six-field runtime persistence remains unusable because of an execution defect that can be safely restored by reverting the authorized changes.

Do NOT rollback merely because a new permission change is needed; permission writes are outside scope. In that case report BLOCKED and preserve evidence; decide rollback based on actual runtime impact/safety.

Rollback must use the fresh Phase C backup only. Record exact rollback writes and final read-back/browser health.

# PHASE L — EVIDENCE / GIT CLOSURE

After execution, update existing living docs in place, especially `project-docs/AI_REVIEW_PACKAGE.md`, with one coherent R8 evidence block. Do not create duplicate reports.

Record exact values:

`M10L_D_R8_CONTROLLED_REPAIR = COMPLETE / PARTIAL / BLOCKED`
`USER_AUTHORIZATION = VERIFIED_SINGLE_USE_CONSUMED`
`AUTHORIZATION_TEXT = อนุมัติ controlled App794 six-field schema + customization repair`
`REVIEWED_RUNTIME_CANDIDATE = 19977543dd8572aa8138a79bd351ff6ccf473696`
`STARTING_HEAD = actual`
`CANDIDATE_DRIFT = 0 / actual`
`npm test = actual / PASS|FAIL`
`GIT_DIFF_CHECK = PASS/FAIL`
`WORKTREE_CLEAN_PREWRITE = YES/NO`
`SOURCE_DIST_EXACTNESS = PASS/FAIL`
`CLASSIC_BUNDLE_PARSE = PASS/FAIL`
`DIST_GLOBAL_TEST_HOOK_RESIDUE = actual`
`CANDIDATE_JS_SHA256 = actual`
`CANDIDATE_JS_BYTES = actual`
`CANDIDATE_CSS_SHA256 = actual`
`CANDIDATE_CSS_BYTES = actual`
`PREWRITE_LIVE_REVISION = actual`
`PREWRITE_PREVIEW_REVISION = actual`
`PREWRITE_DRIFT_DETECTED = YES/NO`
`PREWRITE_LIVE_JS_FILEKEYS = exact`
`PREWRITE_LIVE_CSS_FILEKEYS = exact`
`PREWRITE_MOBILE_CUSTOMIZE = exact summary`
`PREWRITE_BACKUP_PATH = actual`
`PREWRITE_BACKUP_EXISTS = YES/NO`
`PREWRITE_BACKUP_READABLE = YES/NO`
`PREWRITE_BACKUP_MANIFEST_SHA256 = actual`
`PREWRITE_BACKUP_GATE = PASS/FAIL`
`APP794_ADD_FIELDS_POST_COUNT = actual`
`PRIMARY_JS_FILE_UPLOAD_COUNT = actual`
`PRIMARY_CSS_FILE_UPLOAD_COUNT = actual`
`APP794_CUSTOMIZE_PUT_COUNT = actual`
`APP794_DEPLOY_POST_COUNT = actual`
`POST_DEPLOY_STATUS = actual`
`POST_DEPLOY_LIVE_REVISION = actual`
`POST_DEPLOY_LIVE_JS_FILEKEYS = exact`
`POST_DEPLOY_LIVE_CSS_FILEKEYS = exact`
`LIVE_JS_SHA256 = actual`
`LIVE_JS_HASH_MATCH = PASS/FAIL`
`LIVE_CSS_SHA256 = actual`
`LIVE_CSS_PRESERVATION = PASS/FAIL`
`MOBILE_CUSTOMIZE_PRESERVATION = PASS/FAIL`
`LIVE_SIX_FIELD_SCHEMA_READBACK = PASS/FAIL`
`LIVE_EFFECTIVE_FIELD_ACCESS = PASS/FAIL/UNVERIFIABLE`
`BROWSER_SMOKE_APP_OPEN = PASS/FAIL`
`BROWSER_SMOKE_UI_RENDER = PASS/FAIL`
`BROWSER_SMOKE_OBJECTIVE_GRID = PASS/FAIL`
`BROWSER_SMOKE_LOOKUP_UI = PASS/FAIL`
`BROWSER_SMOKE_CREATE_UNVERIFIED = PASS/FAIL`
`BROWSER_SMOKE_0118_PROFILE = PASS/FAIL`
`BROWSER_SMOKE_0118_9_SNAPSHOTS = PASS/FAIL`
`BROWSER_SMOKE_0111_PROFILE = PASS/FAIL`
`BROWSER_SMOKE_FAIL_CLOSED = PASS/FAIL`
`BROWSER_SMOKE_SAVE_PREREQUISITE = PASS/FAIL`
`BROWSER_SMOKE_CONSOLE_FATAL = PASS/FAIL`
`BROWSER_SMOKE = PASS/FAIL`
`ROLLBACK_EXECUTED = YES/NO`
`ROLLBACK_WRITE_COUNTS = exact`
`APP794_RECORD_WRITE = 0`
`APP794_PROCESS_WRITE = 0`
`APP794_ACL_WRITE = 0`
`APP53_WRITE = 0`
`APP795_WRITE = 0`
`APP796_WRITE = 0`
`OTHER_APP_WRITE = 0`
`NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED`
`CONFIRMED_BASELINE_CONFLICT_COUNT = 0`
`GIT_PUSH_SYNC = PASS/FAIL`

Final summary must include:

`M10L_D_R8_CONTROLLED_REPAIR = COMPLETE / PARTIAL / BLOCKED`
`USER_AUTHORIZATION = VERIFIED_SINGLE_USE_CONSUMED`
`KINTONE_WRITES_THIS_TASK = exact authorized write accounting`
`APP794_RECORD_WRITE = 0`
`NEXT_ACTION = CHATGPT REVIEW`

Commit/push same branch and STOP.

# HARD SAFETY / STOP CONDITIONS

STOP without further writes if any of these occurs before first write:
- origin/local HEAD mismatch;
- candidate source/dist/runtime drift;
- tests fail;
- `git diff --check` fails;
- live/preview drift from expected starting state;
- six fields are not all absent as expected;
- backup gate fails;
- authorization scope cannot be matched exactly.

After writes begin, STOP forward execution and evaluate controlled rollback if:
- preview schema read-back mismatch;
- customization preservation mismatch;
- deploy failure/unknown state;
- live hash mismatch;
- fatal runtime regression.

Never use force push, rebase, reset, or history rewrite.
Never reuse this authorization after R8 execution completes or is consumed by a write attempt. Any later Kintone write/deploy requires a new explicit user authorization.