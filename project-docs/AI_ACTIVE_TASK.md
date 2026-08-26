# AI ACTIVE TASK — R12C CONTROLLED APP794 R12B-R1 WORKFLOW GUARD DEPLOY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed deployment candidate: `a980f064817cb3243fa57fce0c7c84619019311e`
> Target App: App794 `MBO V2 Sandbox`
> Mode: CONTROLLED CUSTOMIZATION DEPLOY ONLY
> User authorization: `อนุมัติ controlled App794 R12B-R1 workflow guard deploy`
> Authorization scope: SINGLE-USE / THIS EXACT TASK ONLY

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

R12B-R1 passed independent review. The reviewed candidate aligns runtime with the confirmed 16-state App794 Process Management, blocks invalid/blank/unsupported routing topologies, blocks First-Manager actions for current `M1_G1`, and completes required Requester/Manager/GM hand-off fail-closed checks.

This task deploys that exact reviewed JavaScript candidate to App794 only. It MUST NOT execute any workflow/process action and MUST NOT create or modify business records.

# AUTHORIZATION BOUNDARY

The user explicitly authorized exactly:

`อนุมัติ controlled App794 R12B-R1 workflow guard deploy`

This permits only the App794 customization write/deploy operations required to install the exact reviewed candidate.

Allowed writes after all pre-write gates pass:
- upload reviewed JS candidate file for App794 customization;
- upload the existing live CSS content only if technically required by Kintone to preserve the customization set, and only if its SHA-256 is unchanged from the pre-write live CSS content;
- one App794 customization PUT containing the intended preserved customization set;
- one App794 deploy POST required to publish that preview revision.

Forbidden writes:
- App794 records;
- App794 Process Management;
- App794 form/schema fields;
- App794 app/record/field ACL;
- App795 routing records/schema/customization;
- App53/App796 or any other app;
- any workflow/process transition;
- any Change Assignee action;
- any notification-generating workflow action.

Authorization expires when this task completes or stops. It MUST NOT be reused for retry, UAT, process changes, record changes, or any later task. If this task stops before deployment, fresh explicit authorization is required before another write attempt.

# CHANGE GOVERNANCE

## What
Deploy the exact reviewed R12B-R1 JavaScript candidate from commit `a980f064817cb3243fa57fce0c7c84619019311e` to App794, preserving all non-target customization content and existing schema/process/ACL state.

## Where
- Live Kintone App794 customization only.
- Candidate artifact: deterministic `dist/mbo-employee-app.js` from reviewed commit `a980f064817cb3243fa57fce0c7c84619019311e`.
- Preserve current App794 CSS and mobile customization exactly.

## How

### A. Git/candidate preflight — ZERO Kintone write
1. Pull latest branch and verify local HEAD equals `origin/ai/antigravity-wp002c`.
2. Verify reviewed candidate commit `a980f064817cb3243fa57fce0c7c84619019311e` is an ancestor of current HEAD.
3. Verify there has been NO `src/**`, `dist/**`, or `tests/**` drift after candidate commit. The only expected post-candidate change is this task document/control-plane documentation.
4. Compute SHA-256 and byte length of `dist/mbo-employee-app.js` exactly as it exists at the reviewed candidate/current no-drift tree. Record both as `CANDIDATE_JS_SHA256` and `CANDIDATE_JS_BYTES`.
5. Classic-script parse the candidate before any Kintone write. Failure -> STOP.

### B. Fresh live pre-write backup — GET only
Immediately before the first permitted write, capture a NEW durable local backup under a task-specific path such as:
`backups/m10l-d-r12c-app794-workflow-guard-deploy/<timestamp>`

Backup/read back at minimum:
- App794 live revision and preview revision;
- live desktop customization list and fileKeys;
- live mobile customization list;
- actual live JS bytes/content SHA-256;
- actual live CSS bytes/content SHA-256;
- App794 form fields sufficient to confirm the six scoring snapshot fields remain present;
- App794 Process Management read-only snapshot sufficient to confirm 16 states / 27 actions remain unchanged;
- app settings needed for exact rollback/customization restoration.

Backup must be readable before proceeding.

Expected pre-write state from last independently reviewed evidence:
- live App794 revision = `33`;
- preview App794 revision = `33`;
- live JS SHA-256 = `983528a592020cc9a12d0e20a6a08d764b29a4e99836e3da908ba5ed30b5a81c`;
- live CSS SHA-256 = `3604d2b247593def3e370fe72938a4876e6da93eb7c81f9f2e030d52c660d1d0`;
- six scoring snapshot fields still present;
- Process Management still 16 states / 27 actions;
- mobile customization preserved.

If live/preview revision or content/state differs from this expected baseline in a material way -> `PREWRITE_DRIFT = YES` -> STOP BEFORE WRITE and report. Do not normalize or repair unrelated drift.

### C. Candidate/live gate
Before first write:
1. Candidate JS SHA-256 must be different from the old live JS hash above; if unexpectedly identical, STOP and report.
2. Candidate source/dist tree must still equal reviewed candidate semantics; any code drift -> STOP.
3. CSS candidate is NOT being changed by this task. Preserve the exact pre-write CSS content hash.
4. Process Management, form fields and ACL are not deployment targets and must not be mutated.

### D. Controlled customization deploy
Only after A-C PASS:
1. Upload exact reviewed candidate JS once.
2. Attempt/update App794 customization preserving the current customization set.
3. If Kintone requires a fresh CSS fileKey to submit the preserved CSS customization, CSS re-upload is permitted ONLY when bytes SHA-256 exactly match the pre-write CSS hash. Record `CSS_REUPLOAD_TECHNICALLY_REQUIRED = YES`. Do not change CSS content.
4. Submit exactly one successful intended customization PUT. If an attempted PUT fails due a fileKey constraint before any preview state changes, record the failed attempt accurately; do not conceal it. If resolving it would require anything beyond exact JS candidate + identical CSS re-upload, STOP.
5. Deploy App794 preview to live once.
6. Wait/read deploy status until `SUCCESS` or an explicit failure/timeout. Failure -> execute rollback from fresh pre-write backup if live/preview state was changed and rollback is safe/authorized by this task; otherwise STOP and report exact state.

### E. Post-deploy verification — NO workflow action
After deploy:
- live App794 revision incremented as expected;
- live JS bytes SHA-256 exactly equal `CANDIDATE_JS_SHA256`;
- live CSS SHA-256 exactly equals pre-write CSS SHA-256;
- mobile customization unchanged;
- six scoring snapshot fields preserved;
- Process Management still exactly 16 states / 27 actions and unchanged by this task;
- no record/schema/process/ACL writes occurred;
- one shallow browser smoke of App794 confirms customization loads with no fatal console/runtime error;
- browser smoke MUST NOT click Submit/Approve/Return/Complete/Change Assignee and MUST NOT save/create/edit any record;
- no workflow notification is triggered.

Do not perform isolated Workflow UAT in this task.

## Why
The repository candidate is reviewed and fail-closed, but Workflow UAT must exercise the code actually loaded by App794. Deploying the exact candidate under controlled backup/read-back gates is required before isolated UAT design/execution.

## Expected Impact
- App794 JavaScript customization advances from the R11 runtime to the reviewed R12B-R1 workflow guard runtime.
- No business record, routing master, Process Management, schema or ACL changes.
- No workflow recipient receives a task/notification from this deployment task.

## Risks
- App794 customization fileKey behavior may require JS/CSS upload handling;
- unintended live drift since Revision 33;
- source/dist candidate mismatch;
- customization deploy failure leaving preview/live revisions divergent;
- accidental process action or business-record write during smoke testing.

All risks are controlled by STOP-on-drift, fresh backup, exact hash verification, narrow write allowlist, and no-workflow-action rule.

# TEST PLAN

Repository tests were already completed in reviewed R12B-R1 (`554/554 PASS`) and MUST NOT be rerun unless candidate drift is detected. Save Antigravity credit.

Deployment verification only:
1. Git/candidate no-drift gate PASS.
2. Candidate classic parse PASS.
3. Fresh pre-write backup/readability PASS.
4. Live Revision 33 / Preview 33 pre-write or STOP.
5. Old live JS/CSS hashes match expected baseline or STOP.
6. Exact candidate live JS hash match after deploy.
7. CSS content preservation hash match.
8. Mobile customization preservation PASS.
9. Six-field schema preservation PASS.
10. Process Management unchanged 16 states / 27 actions PASS.
11. Browser shallow-load runtime smoke PASS with zero process actions.
12. Zero App794 record/process/schema/ACL writes.
13. Zero App795/App53/App796/other-app writes.
14. Git evidence/docs push same branch and STOP.

# ROLLBACK PLAN

Use ONLY the fresh R12C pre-write backup captured immediately before first write.

If the customization/deploy produces a bad live runtime or post-deploy hash/read-back failure:
1. restore exact prior App794 desktop/mobile customization from the fresh backup, using restored files/bytes rather than stale historical fileKeys;
2. deploy rollback preview;
3. verify live JS/CSS hashes equal the fresh pre-write hashes and mobile customization is restored;
4. do not modify records, Process Management, schema or ACL as part of rollback;
5. record rollback calls/results exactly and STOP.

If backup is incomplete/unreadable or rollback cannot be proven restorable before first write -> STOP BEFORE WRITE.

# HARD SAFETY / STOP CONDITIONS

STOP before write if any of these occur:
- current code/dist differs from reviewed candidate `a980f064...`;
- branch/local/remote mismatch;
- pre-write live or preview revision is not expected `33` without an explained reviewed reason;
- pre-write live JS hash differs from `983528a5...`;
- pre-write CSS hash differs from `3604d2b2...`;
- six scoring snapshot fields are missing/drifted;
- Process Management is not the confirmed 16-state / 27-action configuration;
- backup is unreadable/incomplete;
- customization preservation cannot be proven.

STOP immediately after any forbidden write is detected. Do not attempt to compensate silently.

# CREDIT-SAVING RULE

- No broad discovery.
- No `npm test` rerun unless drift forces STOP/report.
- No source changes.
- No UI/UX work.
- No Workflow UAT.
- No repeated browser tests: one shallow runtime load only after successful deploy.
- Reuse existing controlled-deploy patterns/scripts where safe; do not create redundant tooling.

# REQUIRED EVIDENCE

Append one concise R12C block to `project-docs/AI_REVIEW_PACKAGE.md`; minimally update CURRENT_STATE/HANDOFF/IMPLEMENTATION_STATUS/CHANGELOG if normally required. Do not create a new evidence file.

```text
M10L_D_R12C_CONTROLLED_DEPLOY = COMPLETE / PARTIAL / BLOCKED
USER_AUTHORIZATION = VERIFIED_SINGLE_USE_CONSUMED / NOT_CONSUMED_NO_WRITE
AUTHORIZATION_TEXT = อนุมัติ controlled App794 R12B-R1 workflow guard deploy
REVIEWED_CANDIDATE = a980f064817cb3243fa57fce0c7c84619019311e
CANDIDATE_DRIFT = 0 / actual
GIT_DIFF_CHECK = PASS/FAIL
CANDIDATE_JS_SHA256 = actual
CANDIDATE_JS_BYTES = actual
CLASSIC_BUNDLE_PARSE = PASS/FAIL
PREWRITE_LIVE_REVISION = actual
PREWRITE_PREVIEW_REVISION = actual
PREWRITE_DRIFT = NO/YES
PREWRITE_JS_SHA256 = actual
PREWRITE_CSS_SHA256 = actual
PREWRITE_BACKUP_PATH = actual
PREWRITE_BACKUP_GATE = PASS/FAIL
PREWRITE_PROCESS_STATE_COUNT = actual
PREWRITE_PROCESS_ACTION_COUNT = actual
JS_FILE_UPLOAD_COUNT = actual
CSS_FILE_UPLOAD_COUNT = actual
CSS_REUPLOAD_TECHNICALLY_REQUIRED = YES/NO
CUSTOMIZE_PUT_ATTEMPT_COUNT = actual
CUSTOMIZE_PUT_SUCCESS_COUNT = actual
DEPLOY_POST_COUNT = actual
POST_DEPLOY_STATUS = actual
POST_DEPLOY_LIVE_REVISION = actual
LIVE_JS_SHA256 = actual
LIVE_JS_HASH_MATCH = PASS/FAIL
LIVE_CSS_SHA256 = actual
LIVE_CSS_CONTENT_PRESERVED = PASS/FAIL
MOBILE_CUSTOMIZE_PRESERVED = PASS/FAIL
SIX_FIELD_SCHEMA_PRESERVED = PASS/FAIL
PROCESS_MANAGEMENT_UNCHANGED_16_STATES_27_ACTIONS = PASS/FAIL
BROWSER_SHALLOW_RUNTIME_LOAD = PASS/FAIL
BROWSER_CONSOLE_FATAL = PASS/FAIL
WORKFLOW_ACTION_EXECUTED = 0
WORKFLOW_NOTIFICATION_TRIGGERED = 0
APP794_RECORD_WRITE = 0
APP794_PROCESS_WRITE = 0
APP794_SCHEMA_WRITE = 0
APP794_ACL_WRITE = 0
APP795_WRITE = 0
APP53_WRITE = 0
APP796_WRITE = 0
OTHER_APP_WRITE = 0
ROLLBACK_EXECUTED = YES/NO
NO_ORPHAN_ARTIFACT_GATE = PASS/FAIL
CONFIRMED_BASELINE_CONFLICT_COUNT = 0
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW BEFORE ISOLATED WORKFLOW UAT
```

Push same branch and STOP.