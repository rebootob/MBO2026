# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD SOURCE REVIEW CORRECTIVE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / App794 customization rev50 / form schema rev48 / Timeline truthfulness PASS / Objective FILE schema PASS / attachment persistence source+deploy PASS / long-filename UI source+deploy PASS / **saved attachment Preview/Download candidate reviewed CORRECTIVE; no deploy authorized** / HR+admin reset UI open / remaining security UAT open |
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
APP794_LIVE_CUSTOMIZATION_REVISION  = 50
APP794_LIVE_FORM_REVISION           = 48
EDIT_ATTACHMENT_SOURCE_CORRECTIVE   = PASS
EDIT_ATTACHMENT_DEPLOYMENT          = PASS / REV49
LONG_FILENAME_UI_SOURCE_REVIEW      = PASS
LONG_FILENAME_UI_DEPLOYMENT         = PASS / REV50
ALL_PRIOR_DEPLOY_AUTHS              = CONSUMED / CLOSED
ATTACHMENT_RETRIEVAL_UX_LIVE        = FAIL ON REV50
ATTACHMENT_RETRIEVAL_CANDIDATE      = d32bf9b4a64de8908337ac012078f37e9b76efec
ATTACHMENT_RETRIEVAL_SOURCE_REVIEW  = CORRECTIVE
DEPLOY_AUTHORIZATION                = NONE
```

Do not reopen Objective FILE schema, attachment desired-state persistence, atomic Edit preflight, or long-filename containment without new evidence.

## 3. Candidate Reviewed

Candidate:
`d32bf9b4a64de8908337ac012078f37e9b76efec`

Parent is exactly task HEAD:
`4e81527f2c7029f748d1342d3000cbf9ee83866e`

One executor commit only. Changed files remain within the nominal retrieval task file set:
- `src/services/mbo-attachment-service.js`
- `src/ui/employee-part-a-ui.js`
- `src/styles/mbo-employee.css`
- focused attachment test
- generated dist JS/CSS
- attachment evidence

No `src/main-mbo-app.js`, schema/config, ACL/process, routing/scoring/auth/reset, or other-app change.

Executor evidence reports:

```text
FOCUSED_ATTACHMENT_TESTS = PASS 58/58
FULL_NPM_TEST            = PASS 910/910
NPM_RUN_UI_BUILD         = PASS
MODULE_AWARE_BUILD_ONLY  = PASS / 0 Kintone network calls
LIVE_KINTONE_WRITE       = 0
LIVE_DEPLOY_OCCURRED     = NO
```

GitHub exposes no CI status checks; these are executor/local evidence, not independent CI.

## 4. Accepted Parts of Candidate

Retain these unless required by the exact corrective:
- isolated additive `downloadKintoneFileBlob(fileKey)` helper;
- browser Fetch GET `/k/v1/file.json` using persisted `fileKey`;
- `X-Requested-With: XMLHttpRequest`;
- no `kintone.api()` call as File Download transport;
- clickable saved filename with valid fileKey;
- separate compact Download control;
- read-only saved attachments render Preview/Download without Delete;
- missing/empty fileKey produces zero retrieval network calls;
- retrieval failures are user-visible and do not mutate attachment data;
- Preview/Download/Delete event propagation is separated;
- long-filename containment remains present.

## 5. Independent Blockers

### BLOCKER A — unsafe active-content Blob preview policy

Candidate currently treats all of these as previewable via Blob URL:
- every `image/*`, including SVG;
- every `text/*`, including HTML;
- extension fallback including `svg` and `html`;
- other broad extension-based preview decisions even when response MIME is unknown/generic.

Blob URLs created by the application must not be used to navigate active uploaded HTML/SVG/XML-like content in the application origin context.

Required correction:
- use an explicit safe preview MIME allowlist;
- minimum allowed: `application/pdf`, safe raster images such as `image/png`, `image/jpeg`, `image/gif`, `image/webp`;
- audio/video may be allowlisted explicitly if desired;
- `text/plain` may be allowed explicitly, but **not** `text/html`;
- explicitly deny/download-only: `image/svg+xml`, `text/html`, XHTML, XML-family active content, scriptable markup, unknown MIME, and `application/octet-stream`;
- do not turn denied/unknown content into previewable content based only on filename extension;
- denied/unsupported types fall back to Download preserving original filename;
- add tests proving HTML and SVG are download-only and never navigate preview Blob URLs.

### BLOCKER B — out-of-scope Remove semantics drift

Task required Preview/Download retrieval only and explicitly required existing Save/Edit/Remove semantics to remain unchanged.

Candidate changed existing behavior in `EmployeePartAUI`:
- `_getSavedAttachmentFiles()` now prefers `desiredSavedFiles` over record FILE state;
- `_removeSavedAttachmentFile()` no longer mutates `this.record[targetCode].value` before storing the desired snapshot;
- constructor also introduced attachment-state initialization changes not required for retrieval.

This may be a reasonable future design, but it is not authorized inside this retrieval-only corrective and creates unnecessary regression risk after the attachment persistence work was already accepted.

Required correction:
- restore pre-task behavior from parent `4e81527f...` for `_getSavedAttachmentFiles()` and `_removeSavedAttachmentFile()` unless a retrieval-only adapter absolutely requires otherwise;
- restore unrelated constructor state initialization drift unless proven necessary;
- Preview/Download success/failure must remain non-destructive without altering Remove semantics;
- existing delete/remove regression tests from the accepted baseline must still pass unchanged.

## 6. Additional Quality Corrections

- Decide previewability **before** creating an object URL so unsupported download fallback does not leak an unused Blob URL.
- If the synchronously opened preview window is blocked/unavailable, fail visibly or fall back safely to Download; do not rely on a second asynchronous `window.open()` after fetch.
- Preserve original filename for every download fallback.

## 7. Exact Current Gate

```text
CURRENT_GATE                  = D1 APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD — SECURITY + SCOPE CORRECTIVE
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST ONLY
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
SOURCE CHANGE                 = YES — TWO BLOCKERS ONLY
APP794 CUSTOMIZATION DEPLOY   = NO
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE
APP794 ACL/PROCESS            = NO
APP801                        = NO
APP795/796                    = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
DEPLOY_AUTHORIZATION          = NONE
```

No source candidate is deployable until a new independent PASS. No prior deploy authorization may be reused.
