# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — EMPLOYEE UI CORRECTIVE EXTENDED WITH NATIVE COMMENT MIRROR

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 KINTONE-ONLY / App794 customization rev51 / attachment persistence PASS / long-filename UI PASS / saved attachment Preview+Download PASS incl. User Live UAT / **Employee navigation + My MBO readability + Native Comment mirror corrective open** / HR+admin reset UI open / remaining security UAT open |
| D2 | 🟠 Excel + PDF legacy-format export IN PROGRESS |
| D3 | 🟠 8 legacy PMS -> App794 IN PROGRESS / WRITE NOT AUTHORIZED |
| D4 | 🟠 App800 HR Control Center IN PROGRESS |
| D5 | 🔴 Copy own previous MBO MUST FIX — scheduled immediately after current UI corrective |
| D6 | 🔴 Integrated E2E / Security / Regression BLOCKED |
| D7 | ✅ Admin Support Center source functionality closed |

## 2. Accepted State — Do Not Reopen Without New Evidence

```text
APP794_LIVE_CUSTOMIZATION_REVISION       = 51
APP794_LIVE_FORM_REVISION                = 48
EDIT_ATTACHMENT_SOURCE/DEPLOYMENT        = PASS / REV49
LONG_FILENAME_UI_SOURCE/DEPLOYMENT       = PASS / REV50
ATTACHMENT_RETRIEVAL_SOURCE              = PASS
ATTACHMENT_RETRIEVAL_DEPLOYMENT          = PASS / REV51
ATTACHMENT_RETRIEVAL_USER_LIVE_UAT       = PASS (user reported PASS 2026-08-29)
ATTACHMENT_RETRIEVAL_DEFECT              = CLOSED
ALL_ATTACHMENT_DEPLOY_AUTHS              = CONSUMED / CLOSED
```

Protected accepted behavior includes Objective/Mid-Year/Final attachment persistence, atomic edit preflight, long filename containment, Preview/Download MIME safety, single-popup behavior, read-only retrieval, and existing Remove semantics.

## 3. Current UI Corrective

User requested from Live App794 screenshots:
1. Existing MBO Detail/Edit needs clear `Back to My MBO` navigation.
2. Employee-Self `My MBO` index needs a clearer responsive record-card layout.
3. User then tested a Native Kintone comment on the right panel and observed that it does not appear in the custom Comment area below.

Source inspection confirmed the lower Comment section is currently only `_renderNativeCommentPlaceholder()`; it does not retrieve or render actual Native Kintone comments.

Antigravity first-pass UI candidate:
`75812a4a30e9ef2d8275da6b39e80ebbc7bbd453`

This candidate is NOT deployed. Its independent review is superseded by the newly reported Comment requirement before any deployment gate is considered. Preserve its narrow navigation/index changes while adding the Comment mirror corrective.

## 4. Accepted Comment Design

Native Kintone Comments remain the single source of truth for Return/Reject conversation.

Required design:
- Existing Detail/Edit record only: render actual Native Kintone comments in the lower custom UI section.
- Create screen: no comment retrieval because no persisted record exists.
- Read comments only from current App794 record using Kintone Get Comments REST API `/k/v1/record/comments.json` with the current Kintone session.
- Do NOT scrape or copy text from the native right-side DOM.
- Do NOT store comments into App794 fields or any other app.
- Do NOT add a second comment database/model.
- Keep native right-side Kintone Comment panel as the authoritative place to add/reply/delete comments for this corrective.
- Lower custom thread is read-only mirror only.
- Render creator name, comment text, created timestamp, and stable chronological order.
- Render text using safe text nodes/textContent; no untrusted comment HTML injection.
- Initial load on Detail/Edit.
- Provide visible `รีเฟรชความคิดเห็น / Refresh Comments` action so a comment just added in the native right panel can be refreshed below without reloading the record.
- Empty state bilingual.
- Retrieval failure must be visible but must not break the MBO page, mutate workflow, or mutate record data.
- Pagination must not silently omit older comments. Kintone Get Comments returns max 10 per request; implementation must page until the complete current thread is obtained or expose an explicit truthful load-more mechanism.
- No comment POST/DELETE is authorized in this corrective.

## 5. Existing Navigation / Index Design — Preserve

### Existing Detail/Edit
- `← กลับหน้า My MBO / Back to My MBO` near top.
- Do not show on Create.
- Same-tab `/k/{appId}/`.
- Must not logout, rotate/clear session, write record, or change workflow state.

### My MBO
- exactly one auth toolbar;
- exact Employee_Code query and Fiscal_Year descending order unchanged;
- card/list layout;
- Fiscal Year + Status prominent, Record Key secondary;
- non-completed: `เปิด MBO / Open MBO`;
- completed: `ดูย้อนหลัง / View History`;
- record URLs unchanged;
- zero Delete UI;
- no Copy Previous MBO yet.

## 6. Current Gate

```text
CURRENT_GATE                  = D1 APP794 EMPLOYEE NAVIGATION + MY MBO + NATIVE COMMENT MIRROR CORRECTIVE
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST ONLY
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
SOURCE CHANGE                 = YES — UI + READ-ONLY COMMENT FETCH ONLY
APP794 CUSTOMIZATION DEPLOY   = NO
DEPLOY_AUTHORIZATION          = NONE
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE
KINTONE COMMENT WRITE         = NO
APP794 ACL/PROCESS            = NO
AUTH/SESSION SEMANTICS        = NO CHANGE
ATTACHMENT SEMANTICS          = NO CHANGE
ROUTING/SCORING               = NO CHANGE
APP801 / APP795 / APP796      = NO WRITE
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
```

Antigravity is required only for actual source/test/build execution. ChatGPT retains design, review, deployment authorization, and control-document ownership.
