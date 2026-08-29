# AI ACTIVE TASK — D1 ATTACHMENT REMOVE-STATE + POST-SAVE-VISIBILITY CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Accepted implementation — DO NOT REIMPLEMENT

Independent review accepted commit:
`d1e51d25862794f6dce7ecff8809df5622011e38`

Accepted core architecture:

```text
PRE-SAVE_UPLOAD_TO_FILEKEY                  = PASS
SUBMIT_EVENT_ATTACHMENT_NON_MUTATION        = PASS
CREATE/EDIT_SUBMIT_SUCCESS_HOOKS            = PASS
POST_SAVE_UPDATE_RECORD_REST_ARCHITECTURE   = PASS
SOURCE_OWNERSHIP_MODULAR                    = PASS
```

Do not revert to direct Attachment mutation in submit events.
Do not broad-refactor the accepted lifecycle.

## Remaining blocker 1 — explicit saved-file removal is not carried into the plan

Current UI saved-file remove path changes only the UI-side record value.
Current `prepareAttachmentPlan()` builds from `pendingAttachments` and submit `event.record`; there is no explicit dirty/removed-file desired-state channel.

Required correction:
- track exact attachment fields whose saved-file desired state changed;
- prepare a plan for those dirty fields even when there is no new pending upload;
- plan must contain the exact retained saved fileKeys plus any newly uploaded fileKeys;
- remove one file must not remove another field or another retained file;
- remove + add in the same field must produce the exact final desired fileKey set;
- keep this feature logic in attachment service/UI state, not in `main-mbo-app.js`.

Do not mutate Attachment values in submit event objects.

## Remaining blocker 2 — post-save REST failure must remain visibly truthful

Current submit-success catch renders an inline validation error and returns the event. That does not prove the user sees the failure before normal post-save navigation.

Required correction:
- when post-save attachment REST binding fails, user must unmistakably see:
  `Record saved, but attachment binding failed` / equivalent Thai+English message;
- do not claim the record save rolled back;
- use supported Save Success behavior so the failure cannot silently disappear during redirect, e.g. retain the page on failure via supported redirect handling or another clearly visible notification/dialog;
- success path should retain normal behavior.

`main-mbo-app.js` may orchestrate this outcome only; persistence logic remains in attachment service/UI modules.

## Required tests

Add/adjust only focused tests needed to prove:

```text
EXISTING_SAVED_FILES_PRESERVED = PASS
EXPLICIT_REMOVE_DESIRED_STATE = PASS
REMOVE_PLUS_ADD_EXACT_DESIRED_STATE = PASS
UNRELATED_ATTACHMENT_FIELDS_UNCHANGED = PASS
EDIT_SUBMIT_PENDING_UPLOAD_PREPARES_PLAN = PASS
SUBMIT_EVENT_ATTACHMENT_OBJECT_UNCHANGED = PASS
POST_SAVE_BIND_FAILURE_VISIBLE_TRUTHFUL_ERROR = PASS
POST_SAVE_BIND_FAILURE_NO_SILENT_REDIRECT = PASS
SUCCESS_PATH_NORMAL_REDIRECT_BEHAVIOR = PASS
NO_LIVE_NETWORK_IN_TESTS = PASS
TIMELINE_ATTACHMENT_REGRESSION = PASS
```

Use realistic Kintone FILE fixtures with `type: 'FILE'` and existing fileKeys.
Tests must execute real registered submit / submit.success handlers where handler behavior is being claimed.

## Evidence required

Update the existing concise corrective evidence for the new final SHA with:
- START_HEAD = current Control Plane HEAD;
- changed files;
- exact two-blocker correction summary;
- focused test names/results;
- full `npm test` exact result;
- `npm run ui:build` result;
- module-aware `--build-only` result;
- `LIVE_KINTONE_WRITE = 0`;
- `LIVE_DEPLOY_OCCURRED = NO`;
- final commit SHA.

## Allowed source scope

Preferred only:
- `src/services/mbo-attachment-service.js`
- `src/ui/employee-part-a-ui.js`
- `src/main-mbo-app.js` orchestration only if required for visible failure/redirect handling
- `tests/timeline-truthfulness-and-attachment.test.js`
- generated `dist/mbo-employee-app.js` through normal build
- existing corrective evidence doc

Do not create a new module unless genuinely necessary for separation of concerns.

## Forbidden

```text
APP794 DEPLOY                = NO
APP794 LIVE RECORD WRITE     = NO
APP794 ACL/SCHEMA/PROCESS    = NO
APP801 WRITE                 = NO
APP795/796 WRITE             = NO
ROUTING/SCORING CHANGE       = NO
AUTH/SESSION/RESET CHANGE    = NO
D2-D7                        = NO
EXTERNAL SERVICE             = NO
BROAD REFACTOR               = NO
```

Commit + push the smallest corrective change.
STOP.
Do not Deploy.
Do not Self-PASS.
Maximum status = `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.
