# AI ACTIVE TASK — D1 APP794 EMPLOYEE NAVIGATION + MY MBO READABILITY UI CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision: `51`
Deployment authorization: **NONE**

## Accepted State — Do Not Reopen

```text
ATTACHMENT_PERSISTENCE_SOURCE/DEPLOYMENT = PASS / REV49
LONG_FILENAME_UI_SOURCE/DEPLOYMENT       = PASS / REV50
ATTACHMENT_RETRIEVAL_SOURCE/DEPLOYMENT   = PASS / REV51
ATTACHMENT_RETRIEVAL_USER_LIVE_UAT       = PASS
AUTH / SESSION                            = ACCEPTED BASELINE — NO CHANGE
ROUTING / SCORING                        = ACCEPTED BASELINE — NO CHANGE
```

User requested UI-only improvements from current Live screenshots:
1. Existing MBO record needs a clear back-to-home action.
2. My MBO index needs a clearer, easier-to-read layout.

## Task A — Existing Record Back to My MBO

Required UX:
- Existing record Detail and Edit must show a visible action exactly or equivalently labeled:
  `← กลับหน้า My MBO / Back to My MBO`
- Do NOT show this action on Create.
- Place near the top of the custom UI, before the main process/progress content.
- Same-tab navigation only to `/k/{currentAppId}/`.
- Navigation must NOT call logout, clear/rotate session, write any record, or change workflow state.
- Prefer component-owned rendering in `EmployeePartAUI`; if appId/navigation must be supplied, make only minimal orchestration callback wiring in `src/main-mbo-app.js`.
- Keep `src/main-mbo-app.js` orchestration-only; no new business logic there.

## Task B — My MBO Home Readability

Current renderer: `src/ui/employee-self-index-ui.js`.

Preserve exactly:
- current authenticated Employee_Code scope;
- query semantics: `Employee_Code = "{code}" order by Fiscal_Year desc`;
- exactly one auth bar;
- Change Password semantics;
- Logout semantics;
- Create New MBO URL `/k/{appId}/edit`;
- each existing record URL `/k/{appId}/show#record={id}`;
- zero Delete UI;
- no cross-employee records;
- no extra Live writes.

Required presentation:
- Make `MBO ของฉัน / My MBO` the clear page heading.
- Keep `+ สร้าง MBO ใหม่ / Create New MBO` clearly visible but not visually overpowering the record list.
- Replace the sparse table presentation with a responsive record list/card presentation or an equivalently clearer layout.
- Each record item must show:
  - Fiscal Year prominently;
  - Status prominently as a badge;
  - Record Key as secondary metadata;
  - one clear primary action.
- Action label rule:
  - status `Completed` / normalized `16 Completed` => `ดูย้อนหลัง / View History`;
  - all other statuses => `เปิด MBO / Open MBO`.
- Preserve record order from the query.
- No horizontal overflow at normal desktop/tablet widths.
- Empty state remains bilingual and clear.
- Do not add Copy Previous MBO yet.

## Styling

Prefer existing files and class-based styling over large new inline-style blocks.
Allowed style file:
- `src/styles/mbo-employee.css`

Do not create a new stylesheet unless absolutely necessary.
Preserve the existing corporate blue/neutral visual language and keep the page compact.

## Allowed Source/Test Files

Primary allowed:
- `src/ui/employee-self-index-ui.js`
- `src/ui/employee-part-a-ui.js`
- `src/styles/mbo-employee.css`
- `tests/employee-self-index-ui.test.js`
- existing UI-focused test file(s) for EmployeePartAUI navigation

Conditionally allowed:
- `src/main-mbo-app.js` ONLY for minimal callback/appId navigation wiring; no business logic or unrelated edits.
- generated `dist/mbo-employee-app.js`
- generated `dist/mbo-employee.css`
- existing evidence document if used.

Forbidden:
- auth adapter/login gate/session manager behavior changes;
- attachment service or attachment persistence changes;
- routing/scoring/profile logic changes;
- workflow/process changes;
- schema/form/layout writes;
- Kintone record writes;
- App801/App795/App796 writes;
- Copy Previous MBO implementation;
- D2-D7 execution;
- broad refactor;
- Live deploy.

## Required Tests

Extend existing tests; avoid creating a new test file unless existing files genuinely cannot cover the behavior.

At minimum prove:

```text
DETAIL_EXISTING_RECORD_BACK_TO_MY_MBO_VISIBLE
EDIT_EXISTING_RECORD_BACK_TO_MY_MBO_VISIBLE
CREATE_RECORD_BACK_TO_MY_MBO_HIDDEN
BACK_TO_MY_MBO_TARGETS_CURRENT_APP_INDEX
BACK_TO_MY_MBO_DOES_NOT_LOGOUT_OR_MUTATE
MY_MBO_QUERY_SCOPE_AND_ORDER_UNCHANGED
MY_MBO_EXACTLY_ONE_AUTH_BAR
MY_MBO_CREATE_URL_UNCHANGED
MY_MBO_NON_COMPLETED_ACTION_OPEN_MBO
MY_MBO_COMPLETED_ACTION_VIEW_HISTORY
MY_MBO_RECORD_URL_UNCHANGED
MY_MBO_ZERO_DELETE_UI
MY_MBO_EMPTY_STATE_REGRESSION
MY_MBO_MULTI_YEAR_ORDER_REGRESSION
ATTACHMENT_UI_REGRESSION_UNCHANGED
```

Do not weaken existing assertions just to make the new UI pass. Update assertions only where the intended visible label/layout has explicitly changed under this task.

## Verification

Run:
1. focused Employee-Self index/navigation tests;
2. relevant EmployeePartAUI UI regression tests;
3. full `npm test`;
4. `npm run ui:build`;
5. module-aware build-only proving 0 Kintone network calls/writes.

Record:

```text
EXECUTION_START_HEAD
CHANGED_FILES
MAIN_ORCHESTRATION_CHANGED
MAIN_CHANGE_REASON_IF_ANY
INDEX_QUERY_CHANGED = NO
AUTH_SESSION_CHANGED = NO
ATTACHMENT_LOGIC_CHANGED = NO
ROUTING_SCORING_CHANGED = NO
DETAIL_BACK_BUTTON_PROOF
CREATE_NO_BACK_BUTTON_PROOF
INDEX_LAYOUT_PROOF
ACTION_LABEL_RULE_PROOF
ZERO_DELETE_UI_PROOF
FOCUSED_TESTS
FULL_NPM_TEST
UI_BUILD_RESULT
BUILD_ONLY_RESULT
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY_OCCURRED = NO
FINAL_COMMIT_SHA
```

Commit + push source/test/build evidence and STOP.

Maximum executor status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do not deploy.
Do not self-PASS.
Do not start Copy Previous MBO yet.
