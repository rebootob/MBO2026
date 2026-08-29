# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — APP794 REV50 ATTACHMENT RETRIEVAL UX DEFECT / PREVIEW-DOWNLOAD CORRECTIVE OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / App794 customization rev50 / form schema rev48 / Timeline truthfulness PASS / Objective FILE schema corrective PASS / attachment persistence corrective source+deploy PASS / user reports attachment save/edit working / long-filename containment source+deploy PASS pending final UAT closure / **new Live defect: saved attachment filename cannot be opened/previewed or downloaded from custom UI — narrow retrieval UX corrective open** / HR+admin reset UI open / remaining security UAT open |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO | 🔴 MUST FIX / NOT CLOSED |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED UNTIL CONSTITUENT WORK IS READY |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT |

No AI may silently drop D1–D7.

## 2. Accepted State

```text
D1_ARCHITECTURE                     = KINTONE-ONLY
EXTERNAL_SERVER_SERVICE             = FORBIDDEN
AUTH_BRIDGE                         = CANCELLED / DO NOT IMPLEMENT
APP794_LIVE_CUSTOMIZATION_REVISION  = 50
APP794_LIVE_FORM_REVISION           = 48
OBJECTIVE_ATTACHMENT_FIELDS         = FILE 10/10 — PASS
MIDYEAR_ATTACHMENT_FIELDS           = FILE 10/10 — PASS
FINAL_ATTACHMENT_FIELDS             = FILE 10/10 — PASS
EDIT_ATTACHMENT_SOURCE_CORRECTIVE   = PASS
EDIT_ATTACHMENT_DEPLOYMENT          = PASS / REV49
LONG_FILENAME_UI_SOURCE_REVIEW      = PASS
LONG_FILENAME_UI_DEPLOYMENT         = PASS / REV50
LONG_FILENAME_UI_DEPLOY_AUTH        = CONSUMED / CLOSED
ATTACHMENT_RETRIEVAL_UX             = LIVE FAIL — NO PREVIEW/DOWNLOAD ACTION
SOURCE_MODULARITY_POLICY            = MANDATORY
```

Do not reopen Objective FILE schema, attachment desired-state persistence, fail-closed Edit preservation, or long-filename containment without new evidence.

## 3. New User-Observed Defect

On App794 Live rev50, saved attachments are visible and have their persisted `fileKey`, but the custom attachment row cannot open/preview the file and provides no download action.

Confirmed source cause in `src/ui/employee-part-a-ui.js`:
- `_getSavedAttachmentFiles()` returns `name`, `fileKey`, `contentType`, and `size` for saved FILE values;
- `_renderAttachmentControl()` renders saved filename as a plain `<span class="mbo-attachment-filename">`;
- the only saved-file action rendered is the editable delete `✕` button;
- `_bindEvents()` handles file-input change and remove clicks, but has no saved-file open/preview/download handler.

This is a retrieval/presentation gap. There is no evidence that upload/bind/removal persistence logic needs modification.

## 4. Confirmed Kintone Download Contract

Use Kintone-only session authentication.

For a persisted attachment `fileKey` obtained from a record FILE field:
- download endpoint is `GET /k/v1/file.json?fileKey=...` (or `kintone.api.urlForGet('/k/v1/file.json', { fileKey }, true)` to build the URL);
- browser Fetch API or XMLHttpRequest must be used with `X-Requested-With: XMLHttpRequest`;
- do **not** use `kintone.api()` for File Download API;
- response body is the file Blob and response Content-Type is the file MIME type;
- access remains governed by the current Kintone session and record/field view permissions;
- no API token, privileged secret, external proxy, or external storage is permitted.

## 5. Required Retrieval UX

For every **saved persisted attachment with a valid fileKey**:
1. filename is an accessible clickable control/link;
2. clicking filename opens a preview in a new browser tab/window for browser-previewable content (at minimum PDF and common image types; browser-supported text/audio/video may also work);
3. a separate compact Download control downloads the exact file using its original filename;
4. unsupported/non-previewable types must still be downloadable; preview action may fall back to download rather than using any external viewer;
5. read-only/historical attachment rows must remain preview/download capable because retrieval is not an edit privilege;
6. editable rows retain the separate non-shrinking delete `✕` control;
7. filename remains ellipsized and cell-contained; adding Preview/Download must not reintroduce overflow;
8. Objective, Mid-Year, and Final(Self) use the shared behavior;
9. preview mock entries with no real persisted fileKey must never call Kintone File Download API;
10. missing/invalid fileKey fails safely and visibly without record mutation;
11. fetch/download failure shows a user-visible non-destructive error and must never delete/replace/change attachment desired state;
12. pending unsaved local files need not use Kintone Download API; do not pretend temporary upload keys are persisted download keys.

Preferred UX inside narrow cell:

```text
📎 very_long_filename...      ⬇  ✕
   ^ filename click = Preview
   ⬇ = Download
   ✕ = Remove (editable only)
```

## 6. Strict Logic Boundary

The persistence functions already accepted must remain semantically unchanged:
- `uploadKintoneFile()` existing behavior;
- `prepareAttachmentPlan()` existing desired-state/fail-closed/atomic-preflight behavior;
- `finalizeAttachmentPlan()` existing exact binding behavior;
- `src/main-mbo-app.js` attachment orchestration.

An additive Kintone file-download helper in the existing attachment service is allowed if it is isolated from upload/prepare/finalize logic. Do not refactor persistence code as part of this task.

## 7. Exact Current Gate

```text
CURRENT_GATE                  = D1 APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD CORRECTIVE
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST ONLY
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
SOURCE CHANGE                 = YES — NARROW RETRIEVAL UX ONLY
APP794 CUSTOMIZATION DEPLOY   = NO — NEW AUTHORIZATION REQUIRED AFTER SOURCE REVIEW
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE
APP794 ACL/PROCESS            = NO
APP801                        = NO
APP795/796                    = NO
ROUTING/SCORING/AUTH/RESET    = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
```

All prior deploy authorizations are consumed/closed and cannot authorize this corrective.

## 8. Required Proof Before Deploy Can Be Considered

At minimum retain all existing attachment/timeline regression coverage and add proof for:

```text
SAVED_ATTACHMENT_FILENAME_IS_CLICKABLE_WITH_PERSISTED_FILEKEY
READONLY_SAVED_ATTACHMENT_REMAINS_PREVIEW_DOWNLOAD_CAPABLE
ATTACHMENT_DOWNLOAD_USES_BROWSER_FETCH_X_REQUESTED_WITH
ATTACHMENT_DOWNLOAD_DOES_NOT_USE_KINTONE_API
ATTACHMENT_DOWNLOAD_PRESERVES_ORIGINAL_FILENAME
ATTACHMENT_PREVIEW_USES_BLOB_URL_FOR_BROWSER_PREVIEWABLE_TYPE
ATTACHMENT_UNSUPPORTED_PREVIEW_HAS_SAFE_DOWNLOAD_FALLBACK
ATTACHMENT_PREVIEW_MOCK_WITHOUT_FILEKEY_DOES_NOT_NETWORK
ATTACHMENT_DOWNLOAD_ERROR_VISIBLE_AND_NON_DESTRUCTIVE
ATTACHMENT_DELETE_CONTROL_REMAINS_SEPARATE_AND_FUNCTIONAL
OBJECTIVE_MIDYEAR_FINAL_RETRIEVAL_REGRESSION
ATTACHMENT_PERSISTENCE_REGRESSION_UNCHANGED
FULL_NPM_TEST_PASS
UI_BUILD_PASS
BUILD_ONLY_PASS
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY_OCCURRED = NO
```

Node tests do not prove browser popup/MIME rendering pixels. Source contract plus mocked fetch/blob/window behavior must be independently reviewed before any deployment.
