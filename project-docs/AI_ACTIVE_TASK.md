# AI ACTIVE TASK — D1 LIVE TIMELINE TRUTHFULNESS + ATTACHMENT CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE**
Branch: `ai/antigravity-wp002c`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Accepted state that must NOT be reopened

```text
APP794 LIVE customization revision = 45
EMPLOYEE_SELF_UI / LOGOUT           = PASS
CREATE-HANDLER corrective           = PASS
APP795 route runtime read           = PASS
APP796 scoring runtime read         = PASS
D1 CREATE-SHOW INITIALIZATION       = PASS
```

User has now identified two separate Live UI correctness defects in an existing App794 detail record.

## Defect A — fabricated Live workflow/comment history

Current `src/ui/employee-part-a-ui.js::_renderWorkflowActionTimeline()` uses hard-coded sample events whenever `previewOptions.timelineEvents` is absent.

Those fixtures contain fictitious names/actions/times and `View Comments`, so a real Live record with no comments/history can appear to have workflow/comment activity.

Native Kintone comment panel in the user's screenshot explicitly says `No comments available`.

### Required source behavior

- hard-coded timeline fixtures may be used ONLY when `isPreviewMode === true` (or an equally explicit test/preview-only gate);
- Live mode MUST NOT fabricate any workflow event, person, timestamp, result, returned/resubmitted state, or comment notice;
- if Live has no authoritative timeline input, render a truthful empty state or omit the custom timeline;
- `_renderNativeCommentPlaceholder()` may explain that Kintone Comments on the right is the native channel, but it must not claim comments exist;
- do not attempt to synthesize a full historical audit trail from current Status alone.

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

For each existing attachment field family already used by the UI (`Objective_Attachment_n`, `MidYear_Attachment_n`, `Self_Attachment_n` / approved fallback):

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

Use the existing Kintone FILE fields only. No external storage.

If custom upload is required:
- follow the official Kintone browser file-upload pattern: multipart `POST /k/v1/file.json` with `FormData`, `kintone.getRequestToken()`, and `X-Requested-With: XMLHttpRequest`;
- capture returned upload `fileKey`;
- bind that fileKey to the appropriate Kintone FILE field through the existing record/create/edit lifecycle;
- do not confuse an upload-time `fileKey` with the file key returned by record-read APIs;
- do not perform Live network calls in unit tests;
- fail visibly on upload/bind errors; never pretend a file is saved.

Important: choose the smallest safe integration compatible with Kintone create/edit event lifecycle. If direct upload during field selection would create unsafe orphan/persistence behavior, implement an explicit pending-file model and perform the upload/binding at the appropriate submit boundary. Preserve fail-closed semantics.

Focused tests required:
1. read-only with zero files => No attachment;
2. read-only with one file => exact real filename;
3. read-only with multiple files => every filename rendered;
4. Live must not display preview fixture filenames;
5. selected pending file state renders filename + pending marker;
6. remove pending file updates UI/model without touching unrelated fields;
7. upload failure => visible error / not saved state;
8. binding target must be exact requested attachment field only;
9. unrelated attachment rows remain unchanged;
10. existing Objective/Mid-Year/Self fallback behavior remains regression-tested.

## Modularity rule

Prefer modifying the existing attachment/timeline responsibility in `src/ui/employee-part-a-ui.js` first.

A new small module is allowed only if it creates a clear separation for Kintone file-upload/state handling and reduces the current 158KB hotspot. Do not create multiple unnecessary files.

`main-mbo-app.js` must remain orchestration-only.

## Mandatory checks

- `npm test` PASS;
- module-aware browser build PASS;
- no external dependency/service;
- no App794/App801/App795/App796 Live write;
- no deploy/upload/customization write;
- no routing/scoring/auth/reset-password logic change;
- no D2-D7 change.

## Forbidden

```text
APP794 DEPLOY              = NO
APP794 RECORD/ACL WRITE    = NO
APP801 WRITE               = NO
APP795/796 WRITE           = NO
LIVE FILE UPLOAD DURING TASK = NO
SOURCE SCOPE               = timeline truthfulness + attachment UI/lifecycle only
RESET PASSWORD UI          = NOT IN THIS TASK
AUTH BRIDGE                = FORBIDDEN
D2-D7                       = NO
```

## Evidence required from Antigravity

Report:
- START_HEAD
- changed files
- exact timeline Live-vs-Preview behavior
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