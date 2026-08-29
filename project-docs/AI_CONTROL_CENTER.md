# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual execution is required
> Updated: 2026-08-29 — INDEPENDENT REVIEW OF D1 TIMELINE/ATTACHMENT CORRECTIVE

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|---|
| D1 | Login + Password Change + Employee-Self MBO Gate | 🟠 KINTONE-ONLY / APP801 ACCESS PASS / RESET+FORCE-CHANGE+MY MBO PASS / APP794 ACL+DEPLOY PASS / EMPLOYEE-SELF UI PASS / CREATE-HANDLER FIX PASS / APP795 ACCESS PASS / APP796 RUNTIME READ PASS / CREATE-SHOW INITIALIZATION PASS / TIMELINE SOURCE TRUTHFULNESS PASS / ATTACHMENT DISPLAY+PENDING UI SOURCE PASS / ATTACHMENT SUBMIT-LIFECYCLE INTEGRATION CORRECTIVE REQUIRED / HR+ADMIN RESET UI STILL OPEN / REMAINING SECURITY UAT OPEN |
| D2 | Excel + PDF legacy-format export | 🟠 IN PROGRESS |
| D3 | 8 legacy PMS apps -> App794 | 🟠 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | App800 HR Control Center end-to-end | 🟠 IN PROGRESS |
| D5 | Copy own previous MBO | 🔴 MUST FIX / NOT CLOSED |
| D6 | Integrated E2E / Security / Regression | 🔴 BLOCKED UNTIL CONSTITUENT WORK IS READY |
| D7 | Admin Support Center | ✅ SOURCE FUNCTIONALITY CLOSED / REOPEN ONLY ON NEW DEFECT |

No AI may silently drop D1–D7.

## 2. Non-Negotiable Architecture / Accepted State

```text
D1_ARCHITECTURE                         = KINTONE-ONLY
EXTERNAL_SERVER_SERVICE                 = FORBIDDEN
AUTH_BRIDGE                             = CANCELLED / DO NOT IMPLEMENT
SERVICES_MBO_AUTH_BRIDGE                = ABANDONED EXPERIMENT / NOT PRODUCTION PATH
D1_SESSION_CONTINUITY_ARCHITECTURE      = PASS
APP801_SESSION_SCHEMA_WRITE             = PASS / ACCEPTED
D1_CREATE_HANDLER_CORRECTIVE            = PASS / DEPLOYED / LIVE old handler error absent
D1_EMPLOYEE_SELF_INDEX_VISUAL           = PASS / LIVE CONFIRMED
D1_HR_ADMIN_PASSWORD_RESET_REQUIREMENT  = BASELINED / PRODUCTION ADMIN UI STILL OPEN
D1_RESET_PASSWORD_0113                  = PASS / ONE-TIME MANUAL RESET AUTH CONSUMED
D1_FORCE_PASSWORD_CHANGE_0113           = PASS
D1_LOGIN_0113_TO_MY_MBO                 = PASS
D1_LIST_TO_CREATE_SESSION_CONTINUITY    = PASS
APP794_ACL_CORRECTION                   = PASS / REVISION 43 -> 44
APP794_CORRECTIVE_DEPLOY_ROUND_2        = PASS / LIVE CUSTOMIZATION REVISION 45
APP795_ACCESS_CORRECTION                = PASS / APP GROUP PUBLIC / MBO_EMPLOYEE_ACCESS VIEW-ONLY
TMH2_REQUESTER_AUTH_UNDER_s1            = DENIED / EXPECTED BUSINESS BOUNDARY
TMH2_REQUESTER_AUTH_UNDER_tmh           = PASS
APP796_EFFECTIVE_ACCESS                 = PASS / APP GROUP PUBLIC / MBO_EMPLOYEE_ACCESS VIEW-ONLY
APP796_RUNTIME_READ_FOR_CREATE          = PASS
D1_CREATE_SHOW_INITIALIZATION           = PASS
DIRECT_URL_REST_HARD_ISOLATION          = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT
```

Do not reopen accepted App795/App796 permissions, requester routing, Create handler, Login/session architecture, or App794 deploy tooling unless new evidence directly requires it.

## 3. Independent Review — Commit 7247df4

Reviewed executor commit:
`7247df478eab2a4320019040df1740457b0bfc69`

Executor commit added only:
`project-docs/D1_LIVE_TIMELINE_ATTACHMENT_VERIFICATION.md`

The executor report claimed 864/864 full tests, 12/12 focused tests, build-only PASS and zero Live writes. Those are executor evidence, not self-PASS.

### 3.1 Timeline Truthfulness — SOURCE PASS

Actual source inspection of `src/ui/employee-part-a-ui.js` shows:
- explicit Preview gate using `isPreviewMode` / `previewOptions.isPreviewMode`;
- supplied `timelineEvents` are rendered when provided;
- hard-coded fixtures are used only under explicit Preview mode;
- Live with no authoritative events sets `rawEvents = []` and renders truthful empty state.

Therefore:

```text
D1_LIVE_TIMELINE_TRUTHFULNESS_SOURCE = PASS
```

Important provenance correction: the same source blob already existed at START_HEAD `52566ce`; therefore the prior Control Center/Active Task statement that START_HEAD still had unconditional Live fixture fallback was stale and is superseded by actual Git source evidence.

### 3.2 Attachment Display / Pending UI — SOURCE PASS

Actual `employee-part-a-ui.js` contains:
- zero-file No attachment state;
- all saved filenames rendering;
- pending filename + Pending save marker;
- file-input change handler;
- pending/saved remove button handler;
- Live preview-file suppression;
- `uploadPendingAttachments()` adapter to `mbo-attachment-service.js`.

`src/services/mbo-attachment-service.js` provides Kintone-only multipart `/k/v1/file.json` upload and exact FILE-field binding logic.

Therefore:

```text
D1_ATTACHMENT_DISPLAY_SOURCE        = PASS
D1_ATTACHMENT_PENDING_REMOVE_SOURCE = PASS
D1_ATTACHMENT_UPLOAD_SERVICE_SOURCE = PASS
```

### 3.3 Attachment Submit Lifecycle — CORRECTIVE REQUIRED

Actual `src/main-mbo-app.js` create/edit submit handler currently:
1. calls `activeUiInstance.syncFromDom()`;
2. validates employee/Record_Key/duplicates/business rules;
3. returns `event`.

It does **not** call `activeUiInstance.uploadPendingAttachments(...)` or the attachment service before returning the submit event.

The focused test `tests/timeline-truthfulness-and-attachment.test.js` tests `uploadAndBindPendingAttachments()` in isolation, but does not prove that Kintone create/edit submit invokes upload/binding. Its pending-remove test also mutates the pending array directly rather than exercising the real click handler.

Therefore:

```text
D1_ATTACHMENT_SUBMIT_INTEGRATION = FAIL / MUST FIX
INDEPENDENT_REVIEW_7247DF4        = CORRECTIVE
APP794_DEPLOY_READY               = NO
```

This is the only remaining blocker inside the current Timeline/Attachment gate. Do not reimplement Timeline or attachment display/pending UI.

## 4. Exact Current Gate

Current gate:

```text
D1 ATTACHMENT SUBMIT-LIFECYCLE INTEGRATION CORRECTIVE
MODE = SOURCE/TEST ONLY
LIVE KINTONE WRITE = NO
APP794 DEPLOY = NO
```

Required correction:
- wire pending attachment upload/binding into both `app.record.create.submit` and `app.record.edit.submit`;
- perform upload only after all local fail-closed validation/duplicate checks have passed, as late as safely possible before returning `event`;
- bind resulting fileKeys to the exact current submit `event.record` FILE fields;
- if upload/bind fails, visibly fail closed and cancel submit; never claim saved;
- preserve optional attachment semantics;
- preserve unrelated attachment fields;
- no Live calls in tests;
- add focused submit-lifecycle integration tests, not service-only tests.

## 5. D1 Priority After Current Corrective

1. independent review of attachment submit integration;
2. if PASS, obtain a NEW explicit one-shot App794 deploy authorization;
3. deploy App794 customization only after exact authorization;
4. Live UAT: no fabricated timeline/comments; zero/one/multiple attachment names; pending-before-save; persisted-after-save; remove/change; no preview leak;
5. production HR / `admin-form` Reset MBO Password UI;
6. remaining session/security UAT;
7. final D1 closure review.

## 6. Authorization State

```text
NEXT_ACTION_OWNER              = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
APP794 DEPLOY                  = NO
APP794 ACL/RECORD WRITE        = NO
APP801 WRITE                   = NO
APP795/796 WRITE               = NO
SOURCE CHANGE                  = YES / ONLY ATTACHMENT SUBMIT-LIFECYCLE CORRECTIVE
EXTERNAL SERVICE               = NO
D2-D7 WRITE                    = NO
```

All prior App794 deploy authorizations are consumed/closed. A new deployment requires new explicit user authorization after source/test independent PASS.

## 7. Handoff State

```text
CURRENT_GATE   = D1 ATTACHMENT SUBMIT-LIFECYCLE INTEGRATION CORRECTIVE
CURRENT_MODE   = SOURCE/TEST ONLY / NO LIVE WRITE
REVIEW_RESULT  = CORRECTIVE
NEXT OWNER     = ANTIGRAVITY
```
