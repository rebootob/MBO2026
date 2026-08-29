# AI ACTIVE TASK — D1 APP794 EMPLOYEE NAVIGATION + MY MBO READABILITY + NATIVE COMMENT MIRROR

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

Current corrective must include ALL THREE user-requested items before any deploy gate is opened:
1. Existing MBO Detail/Edit: clear Back to My MBO action.
2. My MBO home: clearer responsive record-card/list layout.
3. Existing MBO Detail/Edit: actual Native Kintone Comments mirrored in the lower custom UI as read-only thread with Refresh.

Existing first-pass source candidate for items 1–2:
`75812a4a30e9ef2d8275da6b39e80ebbc7bbd453`

Preserve the narrow accepted direction from that commit while adding item 3. Do not deploy that first-pass candidate.

## Task A — Existing Record Back to My MBO

Required UX:
- Existing record Detail and Edit must show visible action:
  `← กลับหน้า My MBO / Back to My MBO`
- Do NOT show on Create.
- Place near the top of custom UI before main process/progress content.
- Same-tab navigation to `/k/{currentAppId}/` only.
- Navigation must NOT call logout, clear/rotate session, write any record, or change workflow state.
- Prefer component-owned rendering in `EmployeePartAUI`.
- If appId/navigation wiring is necessary in `src/main-mbo-app.js`, keep it minimal orchestration-only.

## Task B — My MBO Home Readability

Current renderer: `src/ui/employee-self-index-ui.js`.

Preserve exactly:
- authenticated Employee_Code scope;
- query semantics: `Employee_Code = "{code}" order by Fiscal_Year desc`;
- exactly one auth bar;
- Change Password semantics;
- Logout semantics;
- Create New MBO URL `/k/{appId}/edit`;
- existing record URL `/k/{appId}/show#record={id}`;
- zero Delete UI;
- no cross-employee records;
- no extra Live writes.

Required presentation:
- clear heading `MBO ของฉัน / My MBO`;
- keep `+ สร้าง MBO ใหม่ / Create New MBO` visible but secondary to the record list;
- responsive card/list presentation instead of sparse table;
- each record shows Fiscal Year prominently, Status badge prominently, Record Key secondary, and one clear action;
- `Completed` / normalized `16 Completed` => `ดูย้อนหลัง / View History`;
- all other statuses => `เปิด MBO / Open MBO`;
- preserve query-returned order;
- no horizontal overflow at normal desktop/tablet widths;
- bilingual empty state;
- do NOT implement Copy Previous MBO yet.

## Task C — Native Kintone Comment Mirror Below Custom UI

Current source has `_renderNativeCommentPlaceholder()` only. It currently tells the user to use the native right-side panel but does NOT retrieve actual comments.

Authoritative rule:
- Native Kintone Comments remain the single source of truth for Return/Reject conversation.
- The native right-side Comment panel remains the place to add/reply/delete comments.
- The lower custom UI is READ-ONLY MIRROR ONLY.

Required behavior:
- Existing Detail and Edit records only: load comments for the current App794 record.
- Create screen: no comment GET because no persisted record exists.
- Use Kintone Get Record Comments REST API `/k/v1/record/comments.json` with current Kintone session.
- Prefer existing Kintone browser API/orchestration patterns; no API token, external proxy, or external storage.
- Do NOT scrape the native right-side DOM.
- Do NOT copy/store comments in App794 fields, App801, or another app.
- Do NOT add a second comment data model.
- Render actual comment thread below the MBO content.
- Show at minimum creator display name, comment body, and created timestamp.
- Render comment text safely with textContent/text nodes; no untrusted HTML injection.
- Preserve truthful order and do not silently truncate older comments. Implement complete pagination or an explicit truthful load-more mechanism.
- Initial comment load occurs on existing Detail/Edit render.
- Add visible action `รีเฟรชความคิดเห็น / Refresh Comments`.
- After user posts a comment using native right-side panel, pressing Refresh must update the lower mirror without record mutation.
- Bilingual empty state when no comments exist.
- Retrieval/loading state should be visible and compact.
- Retrieval failure must show a non-blocking error in the comment section only; the MBO page must remain usable.
- Comment retrieval failure must NOT change workflow, auth/session, attachment state, record values, or redirect.
- No comment POST/DELETE/reply write is authorized in this corrective.

## Styling

Use existing `src/styles/mbo-employee.css`.
- Preserve corporate blue/neutral style.
- Keep top Back action compact.
- Keep My MBO cards compact and responsive.
- Comment thread should visually distinguish author / time / body without becoming a large chat application.
- No new stylesheet unless genuinely unavoidable.

## Allowed Source/Test Files

Primary allowed:
- `src/ui/employee-self-index-ui.js`
- `src/ui/employee-part-a-ui.js`
- `src/styles/mbo-employee.css`
- `tests/employee-self-index-ui.test.js`
- existing EmployeePartAUI UI-focused tests
- an existing suitable UI/service test for comment retrieval if present

Conditionally allowed:
- `src/main-mbo-app.js` ONLY for minimal orchestration/callback/API wiring; no business logic.
- one small dedicated read-only comment helper/service file ONLY if separation of concerns clearly requires it; do not create files unnecessarily.
- generated `dist/mbo-employee-app.js`
- generated `dist/mbo-employee.css`
- existing evidence document if used.

Forbidden:
- auth adapter/login gate/session manager behavior changes;
- attachment service or attachment persistence changes;
- routing/scoring/profile changes;
- workflow/process changes;
- schema/form/layout writes;
- Kintone record writes;
- Kintone comment POST/DELETE/reply writes;
- App801/App795/App796 writes;
- Copy Previous MBO implementation;
- D2-D7 execution;
- broad refactor;
- Live deploy.

## Required Tests

Extend existing tests where practical. Do not weaken old assertions merely to pass the new UI.

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

COMMENTS_EXISTING_DETAIL_LOADS_NATIVE_THREAD
COMMENTS_EXISTING_EDIT_LOADS_NATIVE_THREAD
COMMENTS_CREATE_PERFORMS_ZERO_COMMENT_GET
COMMENTS_GET_USES_CURRENT_APP_AND_RECORD_ID
COMMENTS_RENDER_AUTHOR_BODY_TIMESTAMP
COMMENTS_TEXT_RENDERED_WITHOUT_HTML_INJECTION
COMMENTS_EMPTY_STATE_BILINGUAL
COMMENTS_REFRESH_RELOADS_THREAD
COMMENTS_REFRESH_PERFORMS_ZERO_RECORD_WRITE
COMMENTS_PAGINATION_DOES_NOT_SILENTLY_TRUNCATE
COMMENTS_RETRIEVAL_FAILURE_NON_BLOCKING
COMMENTS_NO_POST_DELETE_REPLY_WRITE
COMMENTS_NO_DOM_SCRAPE

AUTH_SESSION_REGRESSION_UNCHANGED
ATTACHMENT_UI_REGRESSION_UNCHANGED
ROUTING_SCORING_REGRESSION_UNCHANGED
```

## Verification

Run:
1. focused Employee-Self index/navigation tests;
2. focused comment mirror tests;
3. relevant EmployeePartAUI UI regression tests;
4. full `npm test`;
5. `npm run ui:build`;
6. module-aware build-only proving 0 Kintone writes. Read-only mocked/comment GET in focused tests is acceptable; build-only must not execute Live network calls.

Record evidence:

```text
EXECUTION_START_HEAD
BASE_FIRST_PASS_UI_CANDIDATE = 75812a4a30e9ef2d8275da6b39e80ebbc7bbd453
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
COMMENT_GET_ENDPOINT_PROOF
COMMENT_CURRENT_RECORD_SCOPE_PROOF
COMMENT_SAFE_RENDER_PROOF
COMMENT_REFRESH_PROOF
COMMENT_PAGINATION_PROOF
COMMENT_WRITE_COUNT = 0
FOCUSED_TESTS
FULL_NPM_TEST
UI_BUILD_RESULT
BUILD_ONLY_RESULT
LIVE_KINTONE_WRITE = 0
LIVE_COMMENT_WRITE = 0
LIVE_DEPLOY_OCCURRED = NO
FINAL_COMMIT_SHA
```

Commit + push source/test/build evidence and STOP.

Maximum executor status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do not deploy.
Do not self-PASS.
Do not start Copy Previous MBO yet.
