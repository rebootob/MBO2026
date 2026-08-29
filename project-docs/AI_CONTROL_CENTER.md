# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD SOURCE REVIEW PASS / DEPLOY AUTH REQUIRED

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 KINTONE-ONLY / App794 customization rev50 / attachment persistence PASS / long-filename UI PASS / **saved attachment Preview/Download source corrective independently reviewed PASS; Live deploy not authorized yet** / HR+admin reset UI open / remaining security UAT open |
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
ATTACHMENT_RETRIEVAL_CANDIDATE      = ec6278524a2d5eb53050d0580c340d1b4e866b97
ATTACHMENT_RETRIEVAL_SOURCE_REVIEW  = PASS
DEPLOY_AUTHORIZATION                = NONE
```

Do not reopen Objective FILE schema, desired-state persistence, atomic Edit preflight, long-filename containment, or restored Remove semantics without new evidence.

## 3. Independent Source Review — PASS

Reviewed candidate:
`ec6278524a2d5eb53050d0580c340d1b4e866b97`

Parent/task HEAD:
`15e4e8ad5718f2a04ea8a912adf99d1327fb2968`

Independent findings:
- exactly one executor commit from the task HEAD;
- changed only `src/ui/employee-part-a-ui.js`, `tests/timeline-truthfulness-and-attachment.test.js`, generated `dist/mbo-employee-app.js`, and the existing attachment evidence document;
- `src/services/mbo-attachment-service.js` unchanged in this residual round;
- `src/main-mbo-app.js` unchanged;
- safe preview now requires an explicit response MIME allowlist;
- empty/unknown MIME is Download-only regardless of filename extension;
- HTML/XHTML/SVG/XML/JavaScript/octet-stream and other non-allowlisted MIME remains Download-only;
- only one synchronous `window.open('about:blank', '_blank')` attempt exists before awaited retrieval;
- no second asynchronous popup attempt remains;
- blocked/unavailable popup safely falls back to Download preserving original filename;
- unsupported/denied MIME is decided before preview Object URL creation;
- accepted pre-task `_getSavedAttachmentFiles()` and `_removeSavedAttachmentFile()` semantics remain restored;
- browser Fetch GET `/k/v1/file.json` with persisted fileKey and `X-Requested-With: XMLHttpRequest` remains the retrieval transport;
- no Kintone record/schema/layout/ACL/process write and no customization deploy occurred.

Executor/local evidence:

```text
FOCUSED_ATTACHMENT_TESTS = PASS 73/73
FULL_NPM_TEST            = PASS 925/925
NPM_RUN_UI_BUILD         = PASS
MODULE_AWARE_BUILD_ONLY  = PASS / 0 Kintone network calls
LIVE_KINTONE_WRITE       = 0
LIVE_DEPLOY_OCCURRED     = NO
```

GitHub exposes no CI status checks for this candidate; the test/build results above are executor/local evidence, not independent CI.

## 4. Accepted Retrieval UX Contract

For persisted saved attachments with a valid fileKey:
- saved filename is clickable for Preview/Open;
- separate compact Download control remains available;
- read-only/historical saved attachments retain Preview/Download without Delete;
- retrieval uses current Kintone session only, no API token/secret/external viewer/storage;
- safe preview MIME allowlist includes PDF and selected raster/media/plain-text types only;
- empty, unknown, active-content, XML-family and non-allowlisted MIME downloads instead of Blob-preview navigation;
- popup attempt is user-gesture synchronous and occurs at most once;
- retrieval failure is visible and non-destructive;
- explicit Delete behavior remains the previously accepted behavior;
- long filename ellipsis and non-shrinking controls remain preserved.

## 5. Exact Current Gate

```text
CURRENT_GATE                  = D1 APP794 SAVED ATTACHMENT PREVIEW/DOWNLOAD — SOURCE PASS / WAITING DEPLOY AUTHORIZATION
CURRENT_MODE                  = CONTROL PLANE HOLD
NEXT_ACTION_OWNER             = USER / EXPLICIT DEPLOY AUTHORIZATION
REVIEWED_CANDIDATE            = ec6278524a2d5eb53050d0580c340d1b4e866b97
INDEPENDENT_VERDICT           = PASS
SOURCE CHANGE                 = NO FURTHER CHANGE
APP794 CUSTOMIZATION DEPLOY   = NO — EXPLICIT NEW ONE-SHOT AUTH REQUIRED
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE
APP794 ACL/PROCESS            = NO
APP801 / APP795 / APP796      = NO
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
DEPLOY_AUTHORIZATION          = NONE
```

No prior deployment authorization may be reused. Any future deployment must be a new one-shot authorization bound exactly to candidate `ec6278524a2d5eb53050d0580c340d1b4e866b97`, followed by independent deployment review before User Live UAT.
