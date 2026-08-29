# AI ACTIVE TASK — D1 APP794 SAVED ATTACHMENT PREVIEW / DOWNLOAD CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision: `50`
Attachment persistence source/deployment: **PASS**
Long-filename UI source/deployment: **PASS / REV50**
All prior deploy authorizations: **CONSUMED / CLOSED**

## User-Observed Defect

Saved files render successfully in the custom Attach File cell, but the user cannot click the filename to preview/open the file and there is no download action.

## Confirmed Source Cause

`src/ui/employee-part-a-ui.js` currently:
- retrieves saved attachment `{ name, fileKey, contentType, size }`;
- renders saved filename as a plain non-clickable `<span class="mbo-attachment-filename">`;
- renders only the editable remove `✕` action;
- `_bindEvents()` has handlers for file selection and remove only;
- there is no saved-file preview/download handler.

Do not reopen attachment persistence architecture.

## Kintone Retrieval Contract

For **persisted record attachment fileKeys only**:
- construct Download File API URL with `kintone.api.urlForGet('/k/v1/file.json', { fileKey }, true)` when available, or safe same-origin equivalent;
- use browser `fetch()` / XHR, HTTP GET;
- include `X-Requested-With: XMLHttpRequest`;
- consume response as Blob;
- **do not call `kintone.api()` for File Download API**;
- no API token/secret/external proxy/external storage.

Upload temporary keys must not be treated as persisted download keys.

## Exact Required UX

Implement saved-file retrieval without changing save/edit/remove semantics.

1. Saved persisted filename with valid `fileKey` is clickable and visually identifiable as clickable.
2. Filename click = Preview/Open:
   - open a user-initiated blank tab/window synchronously before awaiting network when necessary to avoid popup blocking;
   - fetch the saved file Blob through Kintone File Download API;
   - for common browser-previewable MIME types at minimum `application/pdf` and `image/*`, navigate the opened tab to an object URL;
   - browser-supported `text/*`, `audio/*`, `video/*` may also preview;
   - unsupported types safely fall back to download using the original filename; do not use external online viewers.
3. Add a separate compact Download button/control (`⬇` or equivalent):
   - fetch exact saved file by persisted fileKey;
   - create Blob object URL;
   - create/click an anchor with `download = original filename`;
   - clean up object URL safely.
4. Read-only/historical saved attachment rows must also support Preview/Download.
5. Editable row keeps separate `✕` remove button with existing dataset/click semantics.
6. Preview/Download controls must be non-shrinking and must not reintroduce filename overflow.
7. Filename remains ellipsized with full name in `title`.
8. Objective / Mid-Year / Final(Self) use the same shared renderer behavior.
9. Preview mock file with no persisted fileKey:
   - must not call Kintone download endpoint;
   - render non-clickable or clearly disabled retrieval actions.
10. Missing/empty persisted fileKey fails safely; no network request with an empty key.
11. Any GET/Blob/preview/download error:
   - show user-visible non-destructive error near the attachment control or existing error mechanism;
   - do not mutate record FILE values;
   - do not mutate `desiredSavedFiles`, `dirtyAttachmentFields`, or `pendingAttachments` merely because retrieval failed.
12. Preview and Download click must not trigger Remove; Remove must not trigger Preview/Download.

## Implementation Boundary

Allowed narrowly:
- `src/ui/employee-part-a-ui.js` — saved attachment markup, preview/download event binding, error display only;
- `src/services/mbo-attachment-service.js` — **additive isolated file-download helper only** if needed; existing upload/prepare/finalize code must remain semantically and textually unchanged except unavoidable import/export adjacency;
- `src/styles/mbo-employee.css` — preview/download clickable/control styling and containment only;
- `tests/timeline-truthfulness-and-attachment.test.js` — retrieval UX regression tests;
- generated `dist/mbo-employee-app.js` and `dist/mbo-employee.css` through normal build;
- existing D1 attachment evidence document for source/test evidence.

Forbidden:
- persistence refactor;
- changes to `src/main-mbo-app.js` attachment orchestration;
- schema/config changes;
- Kintone record writes;
- customization deploy;
- ACL/process writes;
- App801/App795/App796 changes;
- routing/scoring/auth/reset changes;
- D2-D7 execution;
- external preview/storage service.

If the only way proposed requires external document viewer or privileged token, STOP and report instead.

## Required Tests

Retain every current attachment/timeline regression. Add at minimum:

```text
SAVED_ATTACHMENT_FILENAME_IS_CLICKABLE_WITH_PERSISTED_FILEKEY
READONLY_SAVED_ATTACHMENT_REMAINS_PREVIEW_DOWNLOAD_CAPABLE
ATTACHMENT_DOWNLOAD_USES_BROWSER_FETCH_X_REQUESTED_WITH
ATTACHMENT_DOWNLOAD_DOES_NOT_USE_KINTONE_API
ATTACHMENT_DOWNLOAD_PRESERVES_ORIGINAL_FILENAME
ATTACHMENT_PREVIEW_USES_BLOB_URL_FOR_PDF_OR_IMAGE
ATTACHMENT_UNSUPPORTED_PREVIEW_FALLS_BACK_TO_DOWNLOAD
ATTACHMENT_PREVIEW_MOCK_WITHOUT_FILEKEY_DOES_NOT_NETWORK
ATTACHMENT_MISSING_FILEKEY_DOES_NOT_NETWORK
ATTACHMENT_DOWNLOAD_ERROR_VISIBLE_AND_NON_DESTRUCTIVE
ATTACHMENT_PREVIEW_ERROR_VISIBLE_AND_NON_DESTRUCTIVE
ATTACHMENT_DELETE_CONTROL_REMAINS_SEPARATE_AND_FUNCTIONAL
OBJECTIVE_MIDYEAR_FINAL_RETRIEVAL_REGRESSION
```

Critical test rules:
- assert request method GET;
- assert URL contains exact encoded persisted fileKey;
- assert `X-Requested-With: XMLHttpRequest`;
- prove `kintone.api()` was not used for file download;
- assert no change to saved attachment arrays / desired-state maps on retrieval success or failure;
- verify read-only row still has preview/download controls but no delete control;
- verify preview mock/missing fileKey makes zero network calls;
- keep long-filename ellipsis + non-shrinking delete regression passing.

## Verification Evidence

Record at minimum:

```text
EXECUTION_START_HEAD
CHANGED_FILES
RETRIEVAL_DESIGN
KINTONE_DOWNLOAD_TRANSPORT
PREVIEW_MIME_POLICY
DOWNLOAD_FILENAME_POLICY
ERROR_NON_DESTRUCTIVE_PROOF
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

No deployment authorization exists. Do not deploy or self-PASS.
