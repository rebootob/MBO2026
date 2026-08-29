# AI ACTIVE TASK — D1 ATTACHMENT KINTONE-SUPPORTED PERSISTENCE CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Live defect to correct

User Live UAT on App794 revision 46 fails on native Save with:

```text
An error occurred while running the JavaScript for customization of the app.
- event.record['Objective_Attachment_1'].type is invalid.
```

Immediate source defect in `src/services/mbo-attachment-service.js`:

```js
record[targetCode] = { value: savedFiles };
```

This replaces the native Kintone FILE field object and destroys its metadata.

More importantly, Kintone does not support overwriting Attachment field values through create/edit submit Event Object Actions. Therefore **do not fix only by adding `type: 'FILE'`**.

## Mandatory supported architecture

Implement the smallest Kintone-supported lifecycle:

```text
app.record.create.submit / app.record.edit.submit
  -> existing validation first
  -> upload pending local files to Kintone Upload File API
  -> receive temporary fileKey(s)
  -> DO NOT mutate event.record Attachment fields
  -> store a prepared binding plan in attachment UI/service state
  -> return event

app.record.create.submit.success / app.record.edit.submit.success
  -> use event.appId + event.recordId
  -> finalize exact Attachment field(s) using Kintone Update Record REST API
  -> preserve retained existing files
  -> preserve unrelated attachment fields
```

Pre-save upload error may cancel submit fail-closed.
Post-save binding error must be explicit/truthful: the record has already saved, so do not claim full save rollback.

## Required source ownership

Preferred changes:
- `src/services/mbo-attachment-service.js` — attachment upload/prepared-plan/final REST binding logic;
- `src/ui/employee-part-a-ui.js` — only attachment state adapter methods if needed;
- `src/main-mbo-app.js` — orchestration only: call prepare in submit and finalize in submit.success;
- focused tests;
- generated dist only through normal build.

Do NOT make `main-mbo-app.js` the implementation home for attachment persistence logic.
Do NOT broad-refactor `employee-part-a-ui.js` during this defect correction.

## Exact behavior requirements

1. Existing custom attachment selector/pending UI remains.
2. Submit handler performs local validation before any upload.
3. Zero pending attachment => no file upload and no attachment REST update.
4. Pending file upload => fileKey is prepared without changing `event.record.Objective_Attachment_n` / MidYear / Self/Final attachment fields.
5. Submit success finalizes only fields with a prepared desired state.
6. For Edit, read/preserve currently persisted attachment fileKeys as needed before Update Record.
7. If user removed a previously saved file in custom UI, finalize the intended retained + new fileKey set for that exact field only.
8. Unrelated attachment fields must remain unchanged.
9. Existing Self -> Final field fallback semantics must remain compatible where applicable.
10. No external storage or service.

## Required tests

Handler/service-level tests must prove:

```text
CREATE_SUBMIT_ZERO_PENDING_NO_ATTACHMENT_MUTATION = PASS
EDIT_SUBMIT_ZERO_PENDING_NO_ATTACHMENT_MUTATION   = PASS
CREATE_SUBMIT_PENDING_UPLOAD_PREPARES_PLAN        = PASS
EDIT_SUBMIT_PENDING_UPLOAD_PREPARES_PLAN          = PASS
SUBMIT_EVENT_ATTACHMENT_OBJECT_UNCHANGED          = PASS
CREATE_SUBMIT_SUCCESS_REST_BIND_EXACT_FIELD       = PASS
EDIT_SUBMIT_SUCCESS_REST_BIND_EXACT_FIELD         = PASS
EXISTING_SAVED_FILES_PRESERVED                    = PASS
EXPLICIT_REMOVE_DESIRED_STATE                     = PASS
UNRELATED_ATTACHMENT_FIELDS_UNCHANGED             = PASS
UPLOAD_FAILURE_PRE_SAVE_FAILS_CLOSED              = PASS
POST_SAVE_BIND_FAILURE_VISIBLE_TRUTHFUL_ERROR      = PASS
NO_LIVE_NETWORK_IN_TESTS                          = PASS
TIMELINE_REGRESSION                               = PASS
```

Use realistic Kintone FILE field fixtures including:

```js
Objective_Attachment_1: {
  type: 'FILE',
  value: []
}
```

The previous mocks omitted FILE `type`, which failed to catch the Live defect.

## Test/build evidence required

Record in one concise evidence document:
- START_HEAD;
- changed files;
- exact corrective design summary;
- focused attachment tests + result;
- timeline/attachment regression result;
- full `npm test` exact result;
- `npm run ui:build` result;
- module-aware `--build-only` result;
- `LIVE_KINTONE_WRITE = 0`;
- `LIVE_DEPLOY_OCCURRED = NO`;
- final commit SHA.

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

Do not add a new module unless separation of concerns genuinely requires it; prefer the existing dedicated attachment service first.

Commit + push one narrow corrective commit (or the minimum small sequence if build artifact/evidence needs a second commit).
STOP.
Do not Deploy.
Do not Self-PASS.
Maximum status = `IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.
