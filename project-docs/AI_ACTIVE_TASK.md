# AI ACTIVE TASK — D1 ATTACHMENT DESIRED-STATE SNAPSHOT + REGRESSION RESTORE CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Accepted implementation — DO NOT REIMPLEMENT

Accepted core architecture from prior reviews:

```text
PRE_SAVE_UPLOAD_TO_FILEKEY                  = PASS
SUBMIT_EVENT_ATTACHMENT_NON_MUTATION        = PASS
CREATE_EDIT_SUBMIT_SUCCESS_HOOKS            = PASS
POST_SAVE_UPDATE_RECORD_REST_ARCHITECTURE   = PASS
POST_SAVE_FAILURE_VISIBLE_SOURCE            = PASS
SOURCE_OWNERSHIP_MODULAR                    = PASS
```

Do not revert to direct Attachment mutation in submit events.
Do not broad-refactor the accepted lifecycle.
Do not rewrite post-save visibility unless the new tests expose a real defect.

## Remaining blocker 1 — desired saved-file state must be independent of submit event.record

Current commit `3df7654b43925e3061c19fc81cdcddba7dc3724b` tracks only `dirtyAttachmentFields`.

The UI remove path mutates the UI-side `this.record[targetCode].value`, but the real submit handler later calls:

```text
preparePendingAttachments({ record: event.record })
```

and the service still derives retained files from that submit-event record.

Do not assume show-time UI record and later submit-event record are the same object or carry the same attachment mutation.

### Required correction

Implement the smallest explicit desired-state channel in the existing attachment UI/service modules:
- when a saved file is removed, record the canonical target attachment field and the exact desired retained saved `fileKey` set;
- keep that desired state separately from Kintone `event.record`;
- pass it into `prepareAttachmentPlan()` from `preparePendingAttachments()`;
- for a dirty/explicit desired-state field, construct the prepared REST plan from the explicit desired retained fileKeys plus any newly uploaded pending fileKeys;
- do not re-read removed files back from submit `event.record` for that dirty field;
- remove + add in one field must produce exact desired retained + new set;
- unrelated fields remain absent from the REST plan;
- preserve Self -> Final canonical target fallback semantics.

A simple map/set structure inside `EmployeePartAUI` is preferred. Do not create a new module unless genuinely necessary.

## Mandatory real-handler tests

The key removal tests MUST execute the registered `app.record.edit.submit` handler, not only call `ui.preparePendingAttachments()` directly.

At minimum prove this exact runtime shape:

```text
SHOW_RECORD:
Objective_Attachment_1 = [KEEP_KEY, REMOVE_KEY]

User removes REMOVE_KEY in custom UI.

SUBMIT_EVENT_RECORD:
separate object / clone that still contains [KEEP_KEY, REMOVE_KEY]

Run registered app.record.edit.submit handler.

Expected prepared plan:
Objective_Attachment_1 = [KEEP_KEY]
```

Also prove:

```text
REAL_HANDLER_REMOVE_DESIRED_STATE_SEPARATE_SUBMIT_RECORD = PASS
REAL_HANDLER_REMOVE_PLUS_ADD_EXACT_DESIRED_STATE         = PASS
UNRELATED_ATTACHMENT_FIELDS_UNCHANGED                     = PASS
SELF_FINAL_FALLBACK_DESIRED_STATE                         = PASS
SUBMIT_EVENT_ATTACHMENT_OBJECT_UNCHANGED                  = PASS
```

## Remaining blocker 2 — restore deleted durable regression coverage

The previous focused suite had 19 tests and full evidence reported 871 tests.
The latest corrective reduced the focused suite to 11 and full suite to 863 by removing prior tests.

This is not acceptable closure because the durable Baseline requires broader Timeline + Attachment regressions.

Restore/retain the previous regression coverage while keeping the new corrective tests. Do not make tests pass by deleting existing coverage.

Required durable coverage includes at least:

### Timeline
- Live + no authoritative events => zero fake events/names/comments;
- Preview + no authoritative events => preview fixtures allowed;
- Live + authoritative events => only authoritative events rendered.

### Attachments
- read-only zero files;
- one saved file;
- multiple saved files;
- Live no preview filename leak;
- pending file state;
- real remove-button click behavior;
- upload failure state/visibility;
- Self -> Final fallback;
- create/edit zero-pending submit behavior;
- create/edit pending upload non-mutation behavior;
- create/edit submit.success exact REST binding;
- unrelated field preservation;
- new explicit removal desired-state handler tests;
- post-save failure visibility/no-silent-redirect tests.

If an old test is genuinely obsolete because architecture changed, replace it with an equivalent-or-stronger test and explain the one-to-one replacement in evidence. Do not silently reduce test count.

## Evidence required

Update the existing corrective evidence document for the new final SHA with:
- START_HEAD = current Control Plane HEAD;
- changed files;
- explicit desired-state design summary;
- exact real-handler removal test names/results;
- restored regression test names/results;
- focused test exact total/result;
- full `npm test` exact total/result;
- explanation for any intentionally replaced test;
- `npm run ui:build` result;
- module-aware `--build-only` result;
- `LIVE_KINTONE_WRITE = 0`;
- `LIVE_DEPLOY_OCCURRED = NO`;
- final commit SHA.

## Allowed source scope

Preferred only:
- `src/services/mbo-attachment-service.js`
- `src/ui/employee-part-a-ui.js`
- `tests/timeline-truthfulness-and-attachment.test.js`
- generated `dist/mbo-employee-app.js` through normal build
- existing corrective evidence doc

`src/main-mbo-app.js` is already accepted for this gate. Change it only if a real handler test proves an orchestration defect.

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
