# AI ACTIVE TASK — D1 APP794 EDIT ATTACHMENT ATOMIC PREFLIGHT CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Reviewed candidate: `a5c758564f7a6ef77f2ee0865c32d1149c308107`
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

Candidate `a5c7585...` correctly:
- requires authoritative persisted GET for Edit attachment changes;
- fails closed on GET throw/null;
- fails closed on a missing persisted target FILE field in the single-target case;
- does not require GET for zero attachment changes;
- never intentionally falls back to `edit.submit` attachment values in Edit planning;
- preserves prior successful multi-file add/remove behavior when persisted state is valid.

Keep these improvements.

## Blocking Review Finding

Current `prepareAttachmentPlan()` validates and uploads inside the same per-target loop.

That means a later invalid target can be discovered only after an earlier valid target has already uploaded a new temporary file.

Example:

```text
pending/dirty targets = Objective_Attachment_1 + Objective_Attachment_2
persisted target 1    = valid
persisted target 2    = missing

current behavior:
validate target 1 -> upload target 1 -> validate target 2 -> throw/cancel
```

This violates the fail-closed requirement that authoritative persisted-state validation errors must cancel **before any file upload starts**.

## Exact Corrective Design

For **Edit attachment changes only**:

1. GET the authoritative persisted App794 record once before uploads, as already implemented.
2. Determine the full set of attachment targets that `prepareAttachmentPlan()` will process.
3. Resolve canonical aliases before preflight, including `Self_Attachment_n -> Final_Attachment_n`.
4. Perform a first pass that does **validation only**:
   - validate persisted record object;
   - for every target whose desired state depends on persisted saved files, validate canonical persisted target field exists and `.value` is an array;
   - do not call Upload File API in this pass.
5. If any target fails validation:
   - throw;
   - submit handler returns false;
   - upload count = 0 across all targets;
   - prepared plan remains null/empty;
   - no post-save bind occurs.
6. Only after the entire target set passes preflight may the second pass upload pending files and construct exact desired plans.
7. Explicit saved-file removal snapshots remain authoritative and must not re-add removed keys.
8. Never use `app.record.edit.submit` Attachment values as retained-file fallback.
9. Unrelated attachment fields remain absent from PUT plan.
10. Create flow remains unchanged.

Minimal implementation preferred. `src/main-mbo-app.js` remains orchestration-only; preflight logic should live in attachment service unless a tiny UI state helper is genuinely required.

## Required Tests

Retain every current passing test. Add exact multi-target atomic-preflight cases:

```text
EDIT_MULTI_TARGET_SECOND_PERSISTED_FIELD_MISSING_FAILS_BEFORE_ANY_UPLOAD
EDIT_MULTI_TARGET_SECOND_PERSISTED_FIELD_INVALID_FAILS_BEFORE_ANY_UPLOAD
EDIT_MULTI_TARGET_PREFLIGHT_SUCCESS_THEN_UPLOADS_ALL_TARGETS
```

The first two tests MUST:
- change at least two attachment fields in one Edit submit;
- make the first target persisted field valid;
- make the second target missing/invalid;
- include pending local files for the first target so the test would expose premature upload;
- assert submit returns false;
- assert upload count is exactly 0;
- assert prepared plan is null/empty.

Also retain/pass:

```text
EDIT_GET_RECORD_FAILURE_WITH_ATTACHMENT_CHANGE_FAILS_CLOSED
EDIT_GET_RECORD_NULL_WITH_ATTACHMENT_CHANGE_FAILS_CLOSED
EDIT_PERSISTED_TARGET_FILE_FIELD_MISSING_FAILS_CLOSED
EDIT_FAILURE_PATH_DOES_NOT_UPLOAD_NEW_FILE
EDIT_NO_ATTACHMENT_CHANGE_DOES_NOT_REQUIRE_PERSISTED_ATTACHMENT_GET
EDIT_NEVER_FALLS_BACK_TO_SUBMIT_ATTACHMENT_VALUE
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

Do not remove or weaken tests to make the suite pass.

## Allowed Files

Only as required by the narrow corrective:
- `src/services/mbo-attachment-service.js`
- `src/main-mbo-app.js` only if minimal orchestration adjustment is required
- `src/ui/employee-part-a-ui.js` only if a tiny attachment-state adapter is required
- `tests/timeline-truthfulness-and-attachment.test.js`
- generated `dist/mbo-employee-app.js` / CSS only through normal build
- existing attachment corrective evidence document

No schema/config changes. No unrelated refactor.

## Verification

Run and record:

```text
START_HEAD
CHANGED_FILES
ATOMIC_PREFLIGHT_DESIGN
MULTI_TARGET_INVALID_SECOND_UPLOAD_COUNT = 0
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
SOURCE CHANGE                  = YES — narrow multi-target atomic preflight corrective only
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
