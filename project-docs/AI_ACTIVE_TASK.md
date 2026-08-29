# AI ACTIVE TASK — D1 APP794 EDIT ATTACHMENT FAIL-CLOSED CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Reviewed candidate: `5bde56db0aa741a1064817454db028184556fe1d`
Independent verdict: **CORRECTIVE**

## Accepted State

```text
APP794_LIVE_CUSTOMIZATION_REVISION = 47
APP794_LIVE_FORM_REVISION          = 48
OBJECTIVE_ATTACHMENT_FIELDS        = FILE 10/10
MIDYEAR_ATTACHMENT_FIELDS          = FILE 10/10
FINAL_ATTACHMENT_FIELDS            = FILE 10/10
INITIAL_SAVE_ONE_FILE              = PASS
INITIAL_SAVE_MULTIPLE_FILES        = PASS
EDIT_ADD_NEW_FILE                  = LIVE FAIL
EDIT_MULTI_FILE_PRESERVATION       = LIVE FAIL
SCHEMA_AUTHORIZATION               = CONSUMED / CLOSED
DEPLOY_AUTHORIZATION               = NONE
```

Do NOT reopen schema. Do NOT deploy.

## Accepted Candidate Progress

Candidate `5bde56d...` correctly:
- added authoritative GET Record support for Edit;
- passes `persistedRecord` to attachment planning;
- prefers persisted FILE values when the GET succeeds;
- added realistic tests where edit-submit Attachment value is empty;
- proves preservation of multiple existing files under successful GET.

Keep these improvements.

## Blocking Review Finding

Current source is unsafe when the persisted GET fails:

```js
try {
  persistedRecord = await kintoneApiWrapper.getRecord(appId, recordId);
} catch (fetchErr) {
  console.warn(...);
}
```

Execution then continues with `persistedRecord = null`.

The attachment service currently does:

```js
const sourceRecord = options.persistedRecord || record;
```

This falls back to `app.record.edit.submit event.record`, which is forbidden as an authoritative Attachment source.

For Edit attachment changes, inability to obtain authoritative persisted attachment state must **fail closed**, not degrade to submit-event Attachment values.

## Exact Corrective Design

For **Edit only**:

1. Detect whether any attachment field actually has pending/dirty/desired-state change.
2. If there is no attachment change:
   - do not require persisted Attachment GET;
   - preserve normal non-attachment Edit Save behavior.
3. If attachment state changed:
   - require valid App ID and Record ID;
   - require Kintone-native GET Record;
   - GET must succeed before any pending file upload starts;
   - require a persisted record object;
   - for every target attachment field whose desired plan depends on existing state, require the persisted canonical FILE field to exist with an array value.
4. If required persisted read/field validation fails:
   - show truthful attachment validation error;
   - return false / cancel submit;
   - upload count must remain zero;
   - prepared plan must remain null/empty;
   - no post-save bind can occur.
5. Never use `edit.submit event.record[Attachment].value` as retained-file fallback when persisted state is required.
6. Add-only = every persisted existing fileKey + every new upload fileKey.
7. Explicit saved-file removal snapshot remains authoritative.
8. Remove+add = exact retained saved fileKeys + all new upload fileKeys.
9. Unrelated attachment fields stay out of the PUT plan.
10. Create flow remains unchanged.

Minimal implementation preferred. `src/main-mbo-app.js` stays orchestration-only.

## Required Tests

Keep all current tests. Add exact fail-closed cases:

```text
EDIT_GET_RECORD_FAILURE_WITH_ATTACHMENT_CHANGE_FAILS_CLOSED
EDIT_GET_RECORD_NULL_WITH_ATTACHMENT_CHANGE_FAILS_CLOSED
EDIT_PERSISTED_TARGET_FILE_FIELD_MISSING_FAILS_CLOSED
EDIT_FAILURE_PATH_DOES_NOT_UPLOAD_NEW_FILE
EDIT_NO_ATTACHMENT_CHANGE_DOES_NOT_REQUIRE_PERSISTED_ATTACHMENT_GET
EDIT_NEVER_FALLS_BACK_TO_SUBMIT_ATTACHMENT_VALUE
```

Also retain/pass:

```text
EDIT_ADD_ONLY_WITH_SUBMIT_ATTACHMENT_UNAVAILABLE_PRESERVES_ALL_EXISTING
EDIT_MULTIPLE_EXISTING_FILES_DO_NOT_COLLAPSE
EDIT_ADD_MULTIPLE_NEW_FILES_PRESERVES_ALL_EXISTING
EDIT_REMOVE_PLUS_ADD_EXACT_DESIRED_STATE_WITH_SUBMIT_ATTACHMENT_UNAVAILABLE
EDIT_HANDLER_USES_AUTHORITATIVE_PERSISTED_RECORD_NOT_SUBMIT_ATTACHMENT_VALUE
EDIT_SUBMIT_EVENT_ATTACHMENT_OBJECT_UNCHANGED
UNRELATED_ATTACHMENT_FIELDS_UNCHANGED
CREATE_ONE_FILE_REGRESSION
CREATE_MULTIPLE_FILE_REGRESSION
MIDYEAR_FINAL_REGRESSION
POST_SAVE_BIND_FAILURE_VISIBLE_TRUTHFUL_ERROR
TIMELINE_REGRESSION
NO_LIVE_NETWORK_IN_TESTS
```

Critical test rule: simulate GET throw/null/missing target FILE field while `edit.submit` contains empty or misleading Attachment values. The test must prove Save is cancelled before upload and no fallback occurs.

## Allowed Files

Only as required by the narrow corrective:
- `src/main-mbo-app.js`
- `src/services/mbo-attachment-service.js`
- `src/ui/employee-part-a-ui.js` only if a small attachment-dirty-state helper is needed
- `tests/timeline-truthfulness-and-attachment.test.js`
- generated `dist/mbo-employee-app.js` / CSS only through normal build
- existing attachment corrective evidence document

No schema/config changes. No unrelated refactor.

## Verification

Run and record:

```text
START_HEAD
CHANGED_FILES
REVIEW_BLOCKER_FIXED
FOCUSED_ATTACHMENT_TESTS
FULL_NPM_TEST
NPM_RUN_UI_BUILD
MODULE_AWARE_BUILD_ONLY
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY_OCCURRED = NO
FINAL_COMMIT_SHA
```

## Strict Boundary

```text
SOURCE CHANGE                  = YES — narrow fail-closed Edit attachment corrective only
APP794 CUSTOMIZATION DEPLOY    = NO
APP794 FORM/SCHEMA/LAYOUT      = NO WRITE
APP794 RECORD WRITE            = NO LIVE WRITE
APP794 ACL/PROCESS             = NO
APP801                         = NO
APP795/796                     = NO
ROUTING/SCORING/AUTH/RESET     = NO
D2-D7 EXECUTION                = NO
EXTERNAL SERVICE/STORAGE       = NO
BROAD REFACTOR                 = NO
```

Maximum executor status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Commit + push source/test/build evidence.
STOP. Do not deploy. Do not self-PASS.
