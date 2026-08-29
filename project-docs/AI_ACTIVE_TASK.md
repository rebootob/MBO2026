# AI ACTIVE TASK — D1 COMBINED EMPLOYEE UI RESIDUAL CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision: `51`
Deployment authorization: **NONE**
Latest rejected candidate: `0937097d1bccda9a0c9d42b8aa1a9e8872525930`
Independent verdict: **CORRECTIVE**

## Preserve All Three User-Requested UI Features

The next candidate MUST still contain and prove all three together:

1. Existing Detail/Edit: `← กลับหน้า My MBO / Back to My MBO`; Create hides it.
2. My MBO home: responsive card/list layout; exact Employee_Code query; Fiscal_Year desc; Open MBO for non-completed; View History for completed; unchanged record URLs; zero Delete UI.
3. Existing Detail/Edit: Native Kintone Comment read-only mirror with Refresh.

Do NOT redesign or remove items 1–2. Do NOT start Copy Previous MBO yet.

## Residual Blocker A — Pagination Must Trust `newer`

Current rejected source still stops on:

```text
resp.newer === false || comments.length < limit
```

Correct behavior for `order:'asc'`:
- `comments.length === 0` => stop safely;
- non-empty page + `newer === true` => MUST continue, even if page length is less than 10;
- non-empty page + `newer === false` => complete / stop;
- increment offset by actual `comments.length`;
- no silent 500 cap;
- no infinite/non-progress loop.

Required source correction:
- remove `comments.length < limit` as a completion condition when `newer=true`.

Required regression:

```text
COMMENTS_SHORT_PAGE_NEWER_TRUE_CONTINUES
```

Model exactly:
- page 1 returns fewer than 10 non-empty comments, `older=false`, `newer=true`;
- next page MUST be requested using offset equal to actual first-page count;
- final page returns `newer=false`;
- all comments render in chronological order.

Preserve existing tests for:
- first asc page `older=false,newer=true` continues;
- final page `newer=false` stops;
- >10 all rendered;
- >500 not truncated;
- Detail load;
- Edit load;
- Create zero GET;
- safe textContent;
- empty/failure states;
- actual Refresh click => second GET + updated thread;
- zero record/comment writes.

## Residual Blocker B — Commit Verification Evidence

The previous candidate did not commit mandatory local verification evidence and GitHub has no CI/status/workflow run for it.

Run and RECORD exact results for:
1. focused Employee-Self/navigation tests;
2. focused Native Comment mirror tests;
3. relevant EmployeePartAUI regressions;
4. full `npm test`;
5. `npm run ui:build`;
6. module-aware build-only proving zero Live Kintone calls/writes.

Use an existing suitable evidence document if available; otherwise create ONE small evidence document only if necessary. Do not create files unnecessarily.

Evidence must include:

```text
EXECUTION_START_HEAD
BASE_REJECTED_CANDIDATE = 0937097d1bccda9a0c9d42b8aa1a9e8872525930
CHANGED_FILES
BACK_TO_MY_MBO_CHANGED = NO
MY_MBO_INDEX_CHANGED = NO
INDEX_QUERY_CHANGED = NO
MAIN_ORCHESTRATION_CHANGED = NO
AUTH_SESSION_CHANGED = NO
ATTACHMENT_LOGIC_CHANGED = NO
ROUTING_SCORING_CHANGED = NO
COMMENT_ORDER = asc
COMMENT_SHORT_PAGE_NEWER_TRUE_PROOF
COMMENT_FINAL_NEWER_FALSE_PROOF
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

## Allowed Changes

Primary:
- `src/ui/employee-part-a-ui.js`
- `tests/employee-self-index-ui.test.js`
- generated `dist/mbo-employee-app.js`
- one existing/small evidence document if required

Do NOT change unless a regression is independently proven:
- `src/ui/employee-self-index-ui.js`
- `src/styles/mbo-employee.css`
- `src/main-mbo-app.js`

## Forbidden

- Live deploy;
- App794 record write;
- Comment POST/DELETE/reply;
- schema/form/layout write;
- ACL/process change;
- auth/session change;
- attachment behavior change;
- routing/scoring/profile change;
- App801/App795/App796 write;
- Copy Previous MBO;
- D2-D7 execution;
- external service/storage;
- native comment DOM scraping;
- unrelated refactor.

Commit + push source/test/generated bundle + verification evidence and STOP.

Maximum executor status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

Do not deploy.
Do not self-PASS.
