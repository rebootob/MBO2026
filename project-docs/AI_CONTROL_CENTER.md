# MBO2026 — AI CONTROL CENTER

> Current operational truth only. Permanent rules live in `CONFIRMED_BASELINE/`.
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Control Plane: ChatGPT
> Execution Plane: Antigravity only when actual source/runtime execution is required
> Updated: 2026-08-29 — ATTACHMENT RETRIEVAL LIVE UAT PASS / EMPLOYEE UI CORRECTIVE OPEN

## 1. D1–D7 Scoreboard

| ID | Deliverable | Current Status |
|---|---|
| D1 | 🟠 KINTONE-ONLY / App794 customization rev51 / attachment persistence PASS / long-filename UI PASS / saved attachment Preview+Download **PASS incl. User Live UAT** / **Employee navigation + My MBO readability UI corrective open** / HR+admin reset UI open / remaining security UAT open |
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

## 3. New User-Reported UI Issues

User supplied Live App794 screenshots and requested:

1. Existing MBO detail/edit screen should have a clear **Back to My MBO / กลับหน้าหลัก** action.
2. Employee-Self **My MBO** index should be easier to read and act on than the current sparse table layout.

Current source inspection:
- My MBO renderer = `src/ui/employee-self-index-ui.js`.
- Existing record renderer = `src/ui/employee-part-a-ui.js`.
- `src/main-mbo-app.js` owns orchestration and may receive only minimal navigation callback wiring if needed.
- Existing index query is already correct and must remain exactly Employee_Code scoped and Fiscal_Year descending.
- Existing auth bar must remain exactly once and current Change Password / Logout semantics must not change.

## 4. Accepted UX Design for This Corrective

### Existing MBO Detail/Edit
- Render a visible top navigation action: `← กลับหน้า My MBO / Back to My MBO`.
- Show for existing record Detail and Edit contexts; do not show on Create.
- Navigate same-tab to the App794 employee index `/k/{appId}/`.
- Must preserve active Employee-Self session; must not call Logout, clear token, rotate session, or mutate record.
- Place before the main progress/content area so the user does not need browser Back.

### My MBO Index
- Keep one auth toolbar only.
- Keep `MBO ของฉัน / My MBO` and `+ สร้าง MBO ใหม่ / Create New MBO`.
- Replace the visually sparse table treatment with a clearer responsive record list/card treatment using the records already loaded; no extra business-data query is required.
- Each record must make Fiscal Year and Status visually prominent; Record Key is secondary.
- Non-completed record primary action: `เปิด MBO / Open MBO`.
- Completed record action: `ดูย้อนหลัง / View History`.
- Preserve exact record URL `/k/{appId}/show#record={id}`.
- Preserve order returned by the exact query.
- Keep zero Delete UI.
- Responsive layout must remain usable at narrower desktop/tablet widths and must not create horizontal overflow.
- Do NOT add Copy Previous MBO in this corrective. D5 follows after UI source/deploy/UAT closure.

## 5. Current Gate

```text
CURRENT_GATE                  = D1 APP794 EMPLOYEE NAVIGATION + MY MBO READABILITY UI CORRECTIVE
CURRENT_MODE                  = ANTIGRAVITY SOURCE/TEST ONLY
NEXT_ACTION_OWNER             = ANTIGRAVITY / EXACT ACTIVE TASK ONLY
SOURCE CHANGE                 = YES — UI ONLY
APP794 CUSTOMIZATION DEPLOY   = NO
DEPLOY_AUTHORIZATION          = NONE
APP794 FORM/SCHEMA/LAYOUT     = NO WRITE
APP794 RECORD WRITE           = NO LIVE WRITE
APP794 ACL/PROCESS            = NO
AUTH/SESSION SEMANTICS        = NO CHANGE
ATTACHMENT SEMANTICS          = NO CHANGE
ROUTING/SCORING               = NO CHANGE
APP801 / APP795 / APP796      = NO WRITE
D2-D7 EXECUTION               = NO
EXTERNAL SERVICE/STORAGE      = NO
```

Antigravity is required only for the actual source/test/build execution of this narrow corrective. ChatGPT retains design, review, deployment authorization, and control-document ownership.
