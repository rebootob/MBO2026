# AI ACTIVE TASK — D1 LIVE TIMELINE TRUTHFULNESS + ATTACHMENT CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE**  
Branch: `ai/antigravity-wp002c`

> New-chat rule: this file authorizes source/test execution only. It is NOT evidence that Antigravity has executed it. A new chat must re-fetch HEAD and inspect commits/diff before deciding whether this task is still pending, implemented-pending-review, or superseded.

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

Relevant durable baseline:
`project-docs/CONFIRMED_BASELINE/D1_LIVE_UI_TRUTHFULNESS_ATTACHMENTS.md`

General UI baseline:
`project-docs/CONFIRMED_BASELINE/UI_UX.md`

Source architecture baseline:
`project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`

## Accepted state that must NOT be reopened

```text
APP794 LIVE customization revision = 45
EMPLOYEE_SELF_UI / LOGOUT           = PASS
CREATE-HANDLER corrective           = PASS
APP795 route runtime read           = PASS
APP796 scoring runtime read         = PASS
D1 CREATE-SHOW INITIALIZATION       = PASS
TMH is correct shared requester boundary for Employee 0113 / TMH2
```

Do not rework App795/App796 permissions, create-handler logic, MBO login/session architecture, or routing/scoring merely because this task touches the same screen.

## Defect A — fabricated Live workflow/comment history

Current `src/ui/employee-part-a-ui.js::_renderWorkflowActionTimeline()` uses hard-coded sample events whenever `previewOptions.timelineEvents` is absent.

Those fixtures contain fictitious names/actions/times and `View Comments`, so a real Live record with no comments/history can appear to have workflow/comment activity.

User Live evidence shows the native Kintone comment panel itself says `No comments available`.

### Required source behavior

- hard-coded timeline fixtures may be used ONLY when `isPreviewMode === true` or an equally explicit test/preview-only gate;
- Live mode MUST NOT fabricate any workflow event, person, timestamp, result, returned/resubmitted state, or comment notice;
- if Live has no authoritative timeline input, render a truthful empty state or omit the custom timeline;
- `_renderNativeCommentPlaceholder()` may explain that Kintone Comments on the right is the native channel, but it must not claim comments exist;
- do not synthesize a full historical audit trail from current Status/Updated_datetime/score state.

Focused tests required:
1. Live + no timeline input => zero fixture names/actions/comment notices;
2. Preview + no timeline input => fixtures allowed if needed for preview;
3. Live + explicitly supplied authoritative timeline events => render only supplied events;
4. employee visibility filtering remains correct if authoritative events are supplied.

## Defect B — attachment custom UI incomplete / unclear

Current `_renderAttachmentControl()` can read an existing FILE field but:
- only surfaces the first file name;
- custom `.mbo-attachment-file-input` has no handler in `_bindEvents()`;
- `.mbo-attachment-remove-btn` has no handler;
- therefore select/upload/bind/remove state is not reliably reflected in the custom UI.

### Required UX

For each existing attachment field family already used by the UI (`Objective_Attachment_n`, `MidYear_Attachment_n`, `Self_Attachment_n` / approved legacy fallback):

```text
NO FILE:
  show `ไม่มีไฟล์แนบ / No attachment`

LOCAL SELECTED / PENDING:
  immediately show selected filename(s)
  show clear pending state such as `รอบันทึก / Pending save`

BOUND/SAVED:
  show ALL actual filenames from the Kintone FILE field
  not only the first

EDITABLE:
  allow remove/change using truthful UI state

READ-ONLY DETAIL:
  show all real attached filenames
  never show preview/sample file names in Live
```

### Kintone-only upload boundary

Use existing Kintone FILE fields only. No external storage.

If custom upload is required:
- use supported Kintone browser file upload: multipart `POST /k/v1/file.json` with `FormData`, Kintone request token and same-origin request headers/requirements;
- capture returned upload `fileKey`;
- bind the fileKey to the exact target FILE field through the existing create/edit lifecycle;
- do not confuse upload-time fileKey with later record-read references;
- no Live network calls in unit tests;
- fail visibly on upload/bind error; never pretend a file is saved.

Choose the smallest safe integration. If immediate selection-time upload risks orphan persistence, keep an explicit pending-file model and upload/bind at the appropriate submit boundary.

Focused tests required:
1. read-only zero files => No attachment;
2. one real file => exact filename;
3. multiple files => every filename rendered;
4. Live => no preview fixture filenames;
5. selected pending => filename + pending marker;
6. remove pending => UI/model updated without unrelated field mutation;
7. upload failure => visible not-saved state;
8. exact field binding only;
9. unrelated attachment rows unchanged;
10. Objective/Mid-Year/Self fallback regression.

## Modularity rule

Prefer modifying the existing timeline/attachment responsibility in `src/ui/employee-part-a-ui.js` first.

A new **single small module** is allowed only if it clearly separates Kintone file upload/pending-state handling and reduces the 158KB UI hotspot. Do not create multiple unnecessary files.

`src/main-mbo-app.js` remains orchestration-only.

## Mandatory checks

- focused tests PASS;
- full `npm test` PASS;
- module-aware browser build/build-only PASS;
- no external dependency/service;
- no Live App794/App801/App795/App796 write;
- no deploy/upload/customization write during this task;
- no routing/scoring/auth/reset-password logic change;
- no D2-D7 change.

## Forbidden

```text
APP794 DEPLOY                = NO
APP794 RECORD/ACL WRITE      = NO
APP801 WRITE                 = NO
APP795/796 WRITE             = NO
LIVE FILE UPLOAD DURING TASK = NO
SOURCE SCOPE                 = timeline truthfulness + attachment UI/lifecycle only
RESET PASSWORD UI            = NOT IN THIS TASK
AUTH BRIDGE                  = FORBIDDEN
D2-D7                        = NO
```

## Evidence required from Antigravity

Report:
- START_HEAD
- changed files
- exact Live-vs-Preview timeline behavior
- exact attachment state model
- how Kintone upload/binding is integrated without Live test writes
- focused test names/results
- full `npm test`
- build-only result
- confirmation `LIVE_KINTONE_WRITE = 0`
- final commit SHA

Commit + push source/tests/evidence.
STOP.
Do not Deploy.
Do not Self-PASS.

## Handoff decision rule

When user says `review` after Antigravity execution:
- re-fetch HEAD;
- compare against the START_HEAD/current task;
- inspect exact diff/tests/evidence;
- independently decide PASS / CORRECTIVE / BLOCKED;
- if PASS, update Control Center/Baseline as needed and only then ask for a new explicit App794 deploy authorization;
- do not reuse a consumed historical deploy authorization.