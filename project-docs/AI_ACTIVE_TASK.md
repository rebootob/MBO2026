# AI ACTIVE TASK — D1 APP794 SAVED ATTACHMENT PREVIEW / DOWNLOAD RESIDUAL CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision: `50`
Reviewed candidate: `ecdf64f7ee3ec40eebd97d179b7a54a702fb324e`
Independent verdict: **CORRECTIVE**
Deployment authorization: **NONE**

## Accepted Parts — Do Not Reopen

Keep:
- browser Fetch GET `/k/v1/file.json` using persisted fileKey;
- `X-Requested-With: XMLHttpRequest`;
- no `kintone.api()` File Download transport;
- clickable saved filename + separate Download button;
- read-only Preview/Download;
- HTML/XHTML/SVG/XML/JavaScript/octet-stream deny rules;
- unsupported fallback decided before Object URL creation;
- original filename preservation;
- retrieval error non-destructive behavior;
- pre-task `_getSavedAttachmentFiles()` and `_removeSavedAttachmentFile()` semantics now restored;
- long filename containment;
- upload/prepare/finalize and `src/main-mbo-app.js` unchanged.

## Residual Corrective 1 — Empty/Unknown MIME Must Download Only

Current `isSafePreviewableMime()` still promotes empty MIME from `.pdf` or raster-image filename extension.

Required exact behavior:

```text
MIME application/pdf + any filename       => Preview allowed
MIME image/png/jpeg/gif/webp/bmp          => Preview allowed
MIME text/plain / explicitly allowlisted media => Preview allowed if retained
MIME empty                                 => Download only
MIME unknown                               => Download only
MIME application/octet-stream             => Download only
MIME text/html / XHTML / SVG / XML         => Download only
```

Rules:
1. Safe preview requires explicit allowlisted response MIME.
2. Never promote empty/unknown/denied MIME from filename extension.
3. `report.pdf` with empty MIME => Download only.
4. `photo.png` with empty MIME => Download only.
5. Preserve original filename in fallback.

## Residual Corrective 2 — Exactly One Synchronous Popup Attempt

Current preview path may attempt `window.open(objectUrl, '_blank')` after awaited retrieval if the first blank popup was blocked.

Required:
1. call `window.open('about:blank', '_blank')` at most once, synchronously before await;
2. never call `window.open()` again after await;
3. if the initial popup is unavailable/blocked and content is otherwise previewable, safely fall back to Download or show visible error;
4. fallback must preserve original filename;
5. no leaked unused Object URL.

## Required Tests

Retain all current 68 focused tests and prior regressions. Add/fix at minimum:

```text
ATTACHMENT_EMPTY_MIME_PDF_DOWNLOAD_ONLY
ATTACHMENT_EMPTY_MIME_IMAGE_DOWNLOAD_ONLY
ATTACHMENT_UNKNOWN_MIME_NEVER_EXTENSION_PREVIEWS
ATTACHMENT_PDF_ALLOWLIST_STILL_PREVIEWS
ATTACHMENT_RASTER_ALLOWLIST_STILL_PREVIEWS
ATTACHMENT_POPUP_ATTEMPT_COUNT_EXACTLY_ONE
ATTACHMENT_POPUP_BLOCKED_PREVIEWABLE_FALLS_BACK_SAFELY
ATTACHMENT_POPUP_BLOCKED_DOES_NOT_ASYNC_REOPEN
```

Critical assertions:
- empty MIME + `.pdf`/`.png`: zero preview Blob navigation;
- popup-blocked case: `window.open` call count exactly 1;
- no post-await second popup;
- download fallback keeps exact filename;
- GET transport/header unchanged;
- HTML/SVG/octet-stream security regressions remain passing;
- remove baseline semantics remain passing;
- retrieval success/failure remain non-destructive;
- Objective/Mid-Year/Final(Self), read-only and long-filename regressions remain passing.

## Allowed Files

- `src/ui/employee-part-a-ui.js`
- `tests/timeline-truthfulness-and-attachment.test.js`
- generated `dist/mbo-employee-app.js`
- existing attachment evidence doc

`src/services/mbo-attachment-service.js` should not need change. If changed, retrieval helper only; persistence functions remain untouched.

Forbidden:
- `src/main-mbo-app.js` change;
- schema/config change;
- Kintone record write;
- App794 customization deploy;
- ACL/process/App801/App795/App796 change;
- D2-D7 execution;
- external viewer/storage/proxy/token.

## Verification Evidence

Record:

```text
EXECUTION_START_HEAD
CHANGED_FILES
EMPTY_MIME_DOWNLOAD_ONLY_PROOF
NO_EXTENSION_ONLY_PREVIEW_PROMOTION
POPUP_ATTEMPT_COUNT
NO_ASYNC_SECOND_POPUP_PROOF
SAFE_FALLBACK_FILENAME_PROOF
REMOVE_BASELINE_UNCHANGED
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

Commit + push evidence and STOP for ChatGPT review.

Maximum executor status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do not deploy. Do not self-PASS.
