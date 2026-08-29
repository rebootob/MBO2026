# AI ACTIVE TASK — D1 APP794 SAVED ATTACHMENT PREVIEW / DOWNLOAD SECURITY + SCOPE CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision: `50`
Reviewed candidate: `d32bf9b4a64de8908337ac012078f37e9b76efec`
Independent verdict: **CORRECTIVE**
Deployment authorization: **NONE**

## Keep These Candidate Improvements

Retain unless the exact blocker fix requires a tiny adjustment:
- isolated additive `downloadKintoneFileBlob(fileKey)` helper;
- File Download API via browser Fetch GET `/k/v1/file.json`;
- exact persisted fileKey in request;
- `X-Requested-With: XMLHttpRequest`;
- no `kintone.api()` call as download transport;
- clickable saved filename with valid persisted fileKey;
- separate Download control;
- read-only saved attachments Preview/Download capable;
- Preview/Download/Delete click separation;
- missing fileKey => zero network;
- retrieval failure visible and non-destructive;
- long filename containment.

## Corrective 1 — Safe Preview MIME Allowlist

Current candidate is too broad because it previews all `image/*`, all `text/*`, and extension-fallback HTML/SVG through Blob URLs.

Implement an explicit **safe allowlist**.

At minimum Preview/Open may include:

```text
application/pdf
image/png
image/jpeg
image/gif
image/webp
```

Optional explicit safe additions:

```text
image/bmp
text/plain
audio/mpeg
audio/mp4
audio/ogg
video/mp4
video/webm
video/ogg
```

Must be **Download-only / never Blob-preview-navigated**:

```text
text/html
application/xhtml+xml
image/svg+xml
application/xml
text/xml
application/octet-stream
unknown/empty MIME
any scriptable markup / XML-family active content
```

Rules:
1. Do not make denied/unknown MIME previewable merely from filename extension.
2. HTML/SVG/XML-family content must fall back to Download with original filename.
3. Decide previewability before calling `URL.createObjectURL()` so unsupported fallback does not create/leak an unused URL.
4. Add exact tests proving HTML and SVG never navigate a preview Blob URL and instead call the download fallback.
5. Keep PDF and raster image preview tests.

## Corrective 2 — Restore Existing Remove Semantics

This task is retrieval-only. Candidate must not redesign attachment desired-state/removal behavior.

Restore the pre-task parent `4e81527f2c7029f748d1342d3000cbf9ee83866e` behavior for unrelated attachment state logic:
- `_getSavedAttachmentFiles()` should use the accepted pre-task record/Final(Self) lookup behavior;
- `_removeSavedAttachmentFile()` should keep the accepted pre-task behavior, including updating the record FILE array and then `desiredSavedFiles` snapshot exactly as before;
- revert candidate-only constructor attachment-state initialization changes unless absolutely necessary for Preview/Download.

Do **not** change:
- `uploadKintoneFile()`;
- `prepareAttachmentPlan()`;
- `finalizeAttachmentPlan()`;
- `src/main-mbo-app.js` attachment orchestration;
- accepted atomic Edit preservation behavior.

Preview/Download success or failure must not mutate record FILE values, `desiredSavedFiles`, `dirtyAttachmentFields`, or `pendingAttachments`. That non-destructive rule applies to retrieval actions, not to the existing explicit Delete action.

## Corrective 3 — Popup/Object URL Safety

- Open the blank preview window synchronously on the user click as already intended.
- If that synchronous window is unavailable/blocked, after retrieval either show a visible error or safely fall back to Download. Do not depend on a second async `window.open()` after await.
- Download path must revoke its object URL after use.
- Unsupported-preview fallback must not create an extra unused object URL.
- Preview object URL may use a reasonable delayed cleanup strategy that does not break initial rendering.

## Required Tests

Retain all existing 58 focused tests and every prior attachment/timeline regression. Add at minimum:

```text
ATTACHMENT_HTML_MIME_NEVER_BLOB_PREVIEWS_AND_DOWNLOADS
ATTACHMENT_SVG_MIME_NEVER_BLOB_PREVIEWS_AND_DOWNLOADS
ATTACHMENT_OCTET_STREAM_NEVER_EXTENSION_PREVIEWS
ATTACHMENT_PDF_STILL_BLOB_PREVIEWS
ATTACHMENT_RASTER_IMAGE_STILL_BLOB_PREVIEWS
ATTACHMENT_POPUP_BLOCKED_SAFE_FALLBACK_OR_VISIBLE_ERROR
ATTACHMENT_UNSUPPORTED_FALLBACK_CREATES_NO_UNUSED_OBJECT_URL
ATTACHMENT_REMOVE_BASELINE_SEMANTICS_UNCHANGED
ATTACHMENT_RETRIEVAL_SUCCESS_DOES_NOT_MUTATE_ATTACHMENT_STATE
ATTACHMENT_RETRIEVAL_FAILURE_DOES_NOT_MUTATE_ATTACHMENT_STATE
```

Critical assertions:
- HTML/SVG/octet-stream: zero preview navigation to Blob URL;
- Download fallback keeps exact original filename;
- no extension-only promotion for unknown/denied MIME;
- retrieval GET still uses `X-Requested-With: XMLHttpRequest`;
- `kintone.api()` still not used for File Download transport;
- explicit Remove behavior matches parent baseline;
- Objective/Mid-Year/Final(Self) retrieval remains covered;
- read-only Preview/Download remains covered;
- long-filename/delete-control regressions remain passing.

## Allowed Files

- `src/ui/employee-part-a-ui.js`
- `src/services/mbo-attachment-service.js` only if tiny retrieval-helper adjustment is needed; persistence functions must remain unchanged
- `src/styles/mbo-employee.css` only if needed for existing retrieval controls
- `tests/timeline-truthfulness-and-attachment.test.js`
- generated dist JS/CSS
- existing attachment evidence doc

Forbidden:
- `src/main-mbo-app.js` change;
- schema/config change;
- Kintone record write;
- App794 customization deploy;
- ACL/process/App801/App795/App796 changes;
- routing/scoring/auth/reset;
- D2-D7 execution;
- external viewer/storage/proxy/token.

## Verification Evidence

Record:

```text
EXECUTION_START_HEAD
CHANGED_FILES
SAFE_PREVIEW_MIME_ALLOWLIST
DENIED_ACTIVE_CONTENT_TYPES
HTML_SVG_DOWNLOAD_ONLY_PROOF
NO_EXTENSION_ONLY_PREVIEW_PROMOTION
REMOVE_BASELINE_RESTORED
RETRIEVAL_NON_DESTRUCTIVE_PROOF
PERSISTENCE_FUNCTIONS_CHANGED = NO
MAIN_ATTACHMENT_ORCHESTRATION_CHANGED = NO
FOCUSED_ATTACHMENT_TESTS
FULL_NPM_TEST
NPM_RUN_UI_BUILD
MODULE_AWARE_BUILD_ONLY
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY_OCCURRED = NO
FINAL_COMMIT_SHA
```

## Stop Rule

Commit + push source/test/build evidence, then STOP for ChatGPT independent review.

Maximum executor status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do not deploy. Do not self-PASS.
