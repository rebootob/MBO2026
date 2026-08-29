# AI ACTIVE TASK — D1 APP794 NATIVE COMMENT MIRROR PAGINATION CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision: `51`
Deployment authorization: **NONE**
Rejected candidate: `b31839f0a899d886167d661cc9e82fb870b6f495`
Independent verdict: **CORRECTIVE**

## Accepted / Preserve Exactly

The combined UI corrective still includes all three user-requested items, but items 1–2 must now be preserved without redesign:

1. Existing Detail/Edit: `← กลับหน้า My MBO / Back to My MBO`.
2. My MBO home: responsive readable record-card/list UI.
3. Existing Detail/Edit: Native Kintone Comment read-only mirror + Refresh.

Preserve the accepted direction already present in `b31839f0...`:

```text
ATTACHMENT_PERSISTENCE / RETRIEVAL      = DO NOT CHANGE
AUTH / SESSION                           = DO NOT CHANGE
ROUTING / SCORING                        = DO NOT CHANGE
BACK_TO_MY_MBO UI                        = PRESERVE
MY_MBO CARD/LIST UI                      = PRESERVE
MY_MBO QUERY                             = Employee_Code scoped / Fiscal_Year desc / UNCHANGED
MY_MBO RECORD URLs                       = UNCHANGED
MY_MBO ZERO DELETE UI                    = PRESERVE
COMMENT MIRROR                           = READ-ONLY / CURRENT RECORD ONLY
```

Do NOT start Copy Previous MBO yet.

## Independent Review Blocker 1 — Real Kintone Pagination Semantics

Current rejected source uses:

```text
order: asc
stop when resp.older === false
```

This is incorrect for the official Kintone Get Comments response semantics.

For Kintone Comments:
- `older=false` means there are no older comments / the page reaches the first comment.
- `newer=false` means there are no newer comments / the page reaches the last comment.
- `limit` maximum = 10.
- Comment `offset` has no documented maximum.

With `order: asc`, page 1 begins at the oldest comments. Therefore `older` may be false on page 1 while newer comments still exist. The current implementation can silently return only the first 10 comments.

### Required correction

Keep chronological `order: 'asc'` and implement pagination that cannot silently truncate.

Preferred implementation:
- request `{ app, record, order:'asc', limit:10, offset }`;
- append returned comments;
- if `resp.newer === false`, stop COMPLETE;
- otherwise increment offset by the number of comments returned (or by limit only if proven safe);
- zero returned comments => stop safely;
- protect against non-progress/infinite loops without claiming completeness falsely.

Alternative implementation is allowed only if it is demonstrably equivalent against official Kintone semantics.

## Independent Review Blocker 2 — Silent 500 Cutoff

Current rejected source contains:

```text
if (offset >= 500) break;
```

This silently truncates a long comment thread and violates the accepted rule:
`COMMENTS_PAGINATION_DOES_NOT_SILENTLY_TRUNCATE`.

Required:
- remove the hard silent cutoff; OR
- if a defensive ceiling is absolutely necessary, surface a truthful visible state such as `More comments exist / thread not fully loaded` with explicit load-more behavior.

For this corrective, prefer complete paging because Kintone Comment offset has no documented maximum.

## Independent Review Blocker 3 — Tests Must Model Real API + Missing Required Coverage

The current pagination test mocks `older=true` on the first `order:'asc'` page. This does not model the real boundary condition.

Add/repair tests so they prove at minimum:

```text
COMMENTS_ASC_PAGE1_OLDER_FALSE_NEWER_TRUE_CONTINUES
COMMENTS_ASC_FINAL_PAGE_NEWER_FALSE_STOPS
COMMENTS_MORE_THAN_10_ALL_RENDERED
COMMENTS_MORE_THAN_500_NOT_SILENTLY_TRUNCATED
COMMENTS_EXISTING_DETAIL_LOADS_NATIVE_THREAD
COMMENTS_EXISTING_EDIT_LOADS_NATIVE_THREAD
COMMENTS_CREATE_PERFORMS_ZERO_COMMENT_GET
COMMENTS_GET_USES_CURRENT_APP_AND_RECORD_ID
COMMENTS_RENDER_AUTHOR_BODY_TIMESTAMP
COMMENTS_TEXT_RENDERED_WITHOUT_HTML_INJECTION
COMMENTS_EMPTY_STATE_BILINGUAL
COMMENTS_REFRESH_RELOADS_THREAD
COMMENTS_REFRESH_PERFORMS_ZERO_RECORD_WRITE
COMMENTS_RETRIEVAL_FAILURE_NON_BLOCKING
COMMENTS_NO_POST_DELETE_REPLY_WRITE
COMMENTS_NO_DOM_SCRAPE
```

Refresh test must actually invoke the Refresh button and prove a second GET updates the mirrored thread. Button-presence-only is not sufficient.

Do not weaken the existing Back/My MBO tests.

## Allowed Files

Primary:
- `src/ui/employee-part-a-ui.js`
- `tests/employee-self-index-ui.test.js`
- generated `dist/mbo-employee-app.js`

Only if strictly required for test compatibility or style regression:
- `src/styles/mbo-employee.css`
- generated `dist/mbo-employee.css`
- `src/main-mbo-app.js` only if current minimal `kintoneApiWrapper` / `appId` wiring genuinely needs correction; otherwise do not touch it.
- existing evidence document, or create one small existing-pattern evidence file only if no suitable evidence file exists.

Do NOT change `src/ui/employee-self-index-ui.js` unless required to repair a regression introduced by this corrective. Items 1–2 are accepted direction and should not be redesigned.

## Forbidden

- Live deploy;
- App794 business record write;
- Comment POST/DELETE/reply;
- schema/form/layout write;
- ACL/process change;
- auth/session behavior change;
- attachment behavior change;
- routing/scoring/profile change;
- App801/App795/App796 write;
- Copy Previous MBO implementation;
- D2-D7 execution;
- external service/storage;
- DOM scraping of the native comment panel;
- broad refactor.

## Mandatory Verification + Evidence

Run and RECORD exact results:

1. focused Employee-Self/navigation tests;
2. focused Native Comment mirror tests;
3. relevant EmployeePartAUI regressions;
4. full `npm test`;
5. `npm run ui:build`;
6. module-aware build-only proving `0` Live Kintone network calls/writes.

Evidence must record:

```text
EXECUTION_START_HEAD
BASE_REJECTED_CANDIDATE = b31839f0a899d886167d661cc9e82fb870b6f495
CHANGED_FILES
BACK_TO_MY_MBO_CHANGED = NO (unless corrective necessity explained)
MY_MBO_INDEX_CHANGED = NO (unless corrective necessity explained)
INDEX_QUERY_CHANGED = NO
MAIN_ORCHESTRATION_CHANGED
MAIN_CHANGE_REASON_IF_ANY
AUTH_SESSION_CHANGED = NO
ATTACHMENT_LOGIC_CHANGED = NO
ROUTING_SCORING_CHANGED = NO
COMMENT_ORDER = asc
COMMENT_PAGINATION_TERMINATION_PROOF
COMMENT_MORE_THAN_10_PROOF
COMMENT_MORE_THAN_500_PROOF
COMMENT_REFRESH_ACTUAL_RELOAD_PROOF
COMMENT_SAFE_RENDER_PROOF
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

GitHub currently exposes no CI statuses/workflow runs for the rejected candidate, so executor/local results must be committed as reviewable evidence.

Commit + push source/test/build evidence and STOP.

Maximum executor status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do not deploy.
Do not self-PASS.
Do not start Copy Previous MBO yet.
