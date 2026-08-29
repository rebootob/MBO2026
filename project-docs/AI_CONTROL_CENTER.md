# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD RESIDUAL CORRECTIVE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 KINTONE-ONLY / App794 customization rev50 / attachment persistence PASS / long-filename UI PASS / **saved attachment Preview/Download candidate `ecdf64f7...` independently reviewed CORRECTIVE; no deploy authorized** / HR+admin reset UI open / remaining security UAT open |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Accepted State

```text
APP794_LIVE_CUSTOMIZATION_REVISION  = 50
APP794_LIVE_FORM_REVISION           = 48
EDIT_ATTACHMENT_SOURCE/DEPLOYMENT   = PASS / REV49
LONG_FILENAME_UI_SOURCE/DEPLOYMENT  = PASS / REV50
ALL_PRIOR_DEPLOY_AUTHS              = CONSUMED / CLOSED
ATTACHMENT_RETRIEVAL_UX_LIVE        = FAIL ON REV50
ATTACHMENT_RETRIEVAL_CANDIDATE      = ecdf64f7ee3ec40eebd97d179b7a54a702fb324e
ATTACHMENT_RETRIEVAL_SOURCE_REVIEW  = CORRECTIVE
DEPLOY_AUTHORIZATION                = NONE
```

Do not reopen Objective FILE schema, desired-state persistence, atomic Edit preflight, or long-filename containment without new evidence.

## 3. Candidate Review

Candidate `ecdf64f7ee3ec40eebd97d179b7a54a702fb324e` is the direct child of corrective task HEAD `3928f2f00e83bbd71bdd04d58f406ed2e03a106a`.

Accepted improvements:
- pre-task `_getSavedAttachmentFiles()` behavior restored;
- pre-task `_removeSavedAttachmentFile()` record mutation + desired snapshot behavior restored;
- unrelated constructor attachment-state initialization reverted;
- HTML/XHTML/SVG/XML/JavaScript/octet-stream deny rules added;
- unsupported types are checked before preview Object URL creation;
- retrieval transport remains browser Fetch GET `/k/v1/file.json` with `X-Requested-With: XMLHttpRequest`;
- no `kintone.api()` File Download transport;
- read-only Preview/Download, filename preservation, long-filename containment and event separation retained.

Executor evidence reports:

```text
FOCUSED_ATTACHMENT_TESTS = PASS 68/68
FULL_NPM_TEST            = PASS 920/920
NPM_RUN_UI_BUILD         = PASS
MODULE_AWARE_BUILD_ONLY  = PASS / 0 Kintone network calls
LIVE_KINTONE_WRITE       = 0
LIVE_DEPLOY_OCCURRED     = NO
```

GitHub exposes no CI status checks; these are executor/local results, not independent CI.

## 4. Residual Independent Blockers

### BLOCKER A — empty/unknown MIME is still extension-promoted

`isSafePreviewableMime()` currently returns true for:
- empty MIME + `.pdf`;
- empty MIME + raster-image extension.

That conflicts with the Active Task rule that unknown/empty MIME is Download-only and must not be promoted by filename extension.

Required:
- if MIME is empty/unknown, return false regardless of extension;
- safe preview requires an explicitly allowlisted response MIME;
- add exact regression for empty MIME `report.pdf` and `photo.png` => Download-only / zero preview navigation.

### BLOCKER B — second asynchronous popup attempt remains

When the synchronously opened blank window is unavailable, current code may call `window.open(objectUrl, '_blank')` after the awaited file fetch.

That conflicts with the Active Task rule: do not depend on a second async popup after await.

Required:
- exactly one popup attempt, synchronously before await;
- if it is blocked/unavailable and fetched content is previewable, safely fall back to Download or show visible error;
- do not call `window.open()` again after await;
- test exact popup-call count = 1 and fallback behavior.

## 5. Current Gate

```text
CURRENT_GATE                  = D1 APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD — RESIDUAL CORRECTIVE
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST ONLY
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
SOURCE CHANGE                 = YES — TWO RESIDUAL BLOCKERS ONLY
APP794 CUSTOMIZATION DEPLOY   = NO
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE
APP794 ACL/PROCESS            = NO
APP801 / APP795 / APP796      = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
DEPLOY_AUTHORIZATION          = NONE
```

No source candidate is deployable until a new independent PASS. No prior authorization may be reused.
