# AI ACTIVE TASK — D1 COMBINED EMPLOYEE UI VERIFICATION EVIDENCE

Mode: **ANTIGRAVITY TEST/BUILD/EVIDENCE ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision: `51`
Deployment authorization: **NONE**
Accepted source candidate: `ea5254370360321d18bd768f379986609c241850`
Independent source verdict: **PASS**

## Preserve All Three User-Requested UI Features

The accepted candidate contains all three together:

1. Existing Detail/Edit: `← กลับหน้า My MBO / Back to My MBO`; Create hides it.
2. My MBO home: responsive card/list layout; exact Employee_Code query; Fiscal_Year desc; Open MBO for non-completed; View History for completed; unchanged record URLs; zero Delete UI.
3. Existing Detail/Edit: Native Kintone Comment read-only mirror with Refresh.

Do NOT redesign these features. Do NOT start Copy Previous MBO yet.

## Source Review Already Accepted

Comment pagination source in `ea525437...` passed independent review:
- zero comments => stop safely;
- non-empty + `newer=true` => continue even on short page;
- non-empty + `newer=false` => stop complete;
- offset advances by actual returned comment count;
- no silent 500 cap;
- regression `COMMENTS_SHORT_PAGE_NEWER_TRUE_CONTINUES` exists.

No source change is requested unless a verification failure independently proves a real defect.

## Required Work — Verification Evidence Only

Run and RECORD exact results for:
1. focused Employee-Self/navigation tests;
2. focused Native Comment mirror tests;
3. relevant EmployeePartAUI regressions;
4. full `npm test`;
5. `npm run ui:build`;
6. module-aware build-only proving zero Live Kintone network calls/writes.

Use an existing suitable evidence document if available; otherwise create ONE small evidence document only if necessary.

Evidence must include:

```text
EXECUTION_START_HEAD
ACCEPTED_SOURCE_CANDIDATE = ea5254370360321d18bd768f379986609c241850
SOURCE_CHANGED_DURING_VERIFICATION = NO
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
FOCUSED_NAVIGATION_TESTS
FOCUSED_COMMENT_TESTS
EMPLOYEE_PART_A_REGRESSION_TESTS
FULL_NPM_TEST
UI_BUILD_RESULT
BUILD_ONLY_RESULT
LIVE_KINTONE_NETWORK_CALLS = 0
LIVE_KINTONE_WRITE = 0
LIVE_COMMENT_WRITE = 0
LIVE_DEPLOY_OCCURRED = NO
FINAL_COMMIT_SHA
```

If any required test/build fails:
- STOP;
- do not widen scope;
- do not deploy;
- record the exact failure for independent review.

## Forbidden

- source/UI redesign without proven test failure;
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

Commit + push verification evidence and STOP.

Maximum executor status:
`VERIFIED_PENDING_INDEPENDENT_REVIEW`

Do not deploy.
Do not self-PASS.
