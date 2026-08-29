# AI ACTIVE TASK — D1 APP794 EDIT ATTACHMENT PRESERVATION CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Accepted State

```text
APP794_LIVE_CUSTOMIZATION_REVISION = 47
APP794_LIVE_FORM_REVISION          = 48
OBJECTIVE_ATTACHMENT_FIELDS        = FILE 10/10
MIDYEAR_ATTACHMENT_FIELDS          = FILE 10/10
FINAL_ATTACHMENT_FIELDS            = FILE 10/10
INITIAL_SAVE_ONE_FILE              = PASS
INITIAL_SAVE_MULTIPLE_FILES        = PASS
EDIT_ADD_NEW_FILE                  = FAIL
EDIT_MULTI_FILE_PRESERVATION       = FAIL
SCHEMA_AUTHORIZATION               = CONSUMED / CLOSED
DEPLOY_AUTHORIZATION               = NONE
```

Do NOT reopen the schema-gap corrective. Objective FILE fields now exist.

## Confirmed Platform Constraint

Kintone `app.record.edit.submit` does not provide retrievable Attachment field values.

Kintone Update Record Attachment semantics require the request to contain all existing fileKeys that must remain. Existing files omitted from the Attachment value array are deleted.

Therefore **never use `event.record[AttachmentField].value` from `app.record.edit.submit` as the authoritative retained-file base**.

## Current Source Defect

Current orchestration passes:

```js
activeUiInstance.preparePendingAttachments({ record: event.record })
```

Current attachment service falls back to:

```js
record[targetCode]?.value
```

for add-only edit operations when no explicit removal snapshot exists.

That path is invalid for Edit because submit-event Attachment values are unavailable/non-authoritative.

## Exact Corrective Design

### Edit flow only

When at least one attachment field has pending/dirty state:

1. Validation must run first as today.
2. Before attachment plan construction, GET the current persisted App794 record using Kintone-native GET Record with current `event.appId` + `event.recordId`.
3. Use the persisted record's FILE arrays as the authoritative existing-file base.
4. For add-only:
   - preserve every existing saved fileKey;
   - append every newly uploaded temporary fileKey.
5. For explicit removal:
   - the UI desired-state snapshot remains authoritative for the user's removal intent;
   - do not re-add removed fileKeys from the persisted GET base.
6. For remove + add:
   - exact result = retained saved fileKeys + all new uploaded fileKeys.
7. Only exact target attachment field(s) enter the post-save PUT plan.
8. Unrelated attachment fields remain absent from the PUT payload.
9. `app.record.edit.submit` event.record Attachment objects remain untouched.
10. Create flow behavior must remain unchanged.

Preferred ownership:
- `src/services/mbo-attachment-service.js` — persisted-record read/helper and plan semantics if needed.
- `src/ui/employee-part-a-ui.js` — only attachment-state adapter if needed.
- `src/main-mbo-app.js` — orchestration only; minimal edit-submit call wiring.
- `tests/timeline-truthfulness-and-attachment.test.js` — focused regression.
- generated dist only through normal build.

Do not broad-refactor.

## Required Tests

Add/adjust tests to prove the real Kintone limitation, not an idealized fixture.

Required exact cases:

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

### Critical realistic fixture rule

For edit-submit tests, the submit-event record must intentionally NOT expose usable Attachment values, e.g.:

```js
Objective_Attachment_1: { type: 'FILE', value: [] }
```

while the mocked Kintone GET Record response contains the actual persisted files, e.g. 3 existing fileKeys.

The test must fail if the implementation reads existing saved files from the submit event instead of the GET Record response.

## Regression Expectations

Existing previously accepted attachment behavior must stay intact:
- initial one-file create/save;
- initial multiple-file create/save;
- saved-file remove;
- remove + add;
- multiple saved-file rendering;
- Objective/Mid-Year/Final exact field separation;
- Self -> Final fallback;
- zero-pending causes no attachment update;
- timeline truthfulness;
- no preview fixture leak.

Do not remove tests to make the suite pass.

## Verification

Run and record:

```text
START_HEAD
CHANGED_FILES
DESIGN_SUMMARY
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
SOURCE CHANGE                  = YES — exact Edit attachment preservation corrective only
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
