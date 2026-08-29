# AI ACTIVE TASK — WP2 LIVE UAT CORRECTIVE R2: KINTONE COMMENT API LIMIT

Mode: **SOURCE / TEST / DIST ONLY — NO LIVE DEPLOY**
Branch: `ai/antigravity-wp002c`

## Start Point

Latest corrective candidate:
`c2676ad20e3aca37c34b5adf9b1d82946948b2ea`

Independent verdict:
`CORRECTIVE`

Live App794 remains Revision 55. User UAT is not accepted. No second Live deploy is authorized.

## Preserve Accepted Corrective Direction

Do not redesign again unless a direct regression is found:
- Back prominent bar/button source/CSS direction is accepted for next UAT.
- My MBO stronger card/list CSS direction is accepted for next UAT.
- Employee_Code self filter, `order by Fiscal_Year desc`, Create New, Open/View History, one auth bar and zero Delete UI must remain unchanged.

## Required Fix — Comment Get API Limit

Current `src/ui/employee-comment-mirror.js` uses `limit = 50` for `/k/v1/record/comments.json`.

Kintone Get Comments API maximum `limit` is 10.

Required:
1. Change comment page limit to exactly `10`.
2. Preserve current `app` / `record` fallback handling; Integer or String is acceptable, numeric normalization may remain if tests pass.
3. Preserve truthful pagination:
   - `newer === false` => stop;
   - non-empty + `newer === true` => continue even on short page;
   - if `newer` omitted, short page => stop;
   - zero comments => stop;
   - no silent arbitrary truncation;
   - safety cap must throw explicit error, not partial success.
4. Preserve Refresh refetch.
5. Create screen = no mirror and comment GET count 0.
6. Comment writes = 0.
7. Safe text rendering remains unchanged.

## Mandatory Tests

Add/modify tests so they verify the production request contract, not only wrapper mocks:

```text
COMMENT_DIRECT_KINTONE_REQUEST_LIMIT = 10
COMMENT_DIRECT_KINTONE_REQUEST_APP = 794
COMMENT_DIRECT_KINTONE_REQUEST_RECORD = current record id
COMMENT_DIRECT_KINTONE_REQUEST_ORDER = asc
COMMENT_DIRECT_KINTONE_REQUEST_OFFSET = expected offset
COMMENT_LIMIT_OVER_10_BLOCKED_BY_TEST = PASS
COMMENT_SHORT_PAGE_NEWER_TRUE_CONTINUES = PASS
COMMENT_NEWER_FALSE_STOPS = PASS
COMMENT_OVER_100_PAGES_PASS = PASS using 10-comment pages
COMMENT_CREATE_GET_COUNT = 0
COMMENT_REFRESH_REFETCH = PASS
COMMENT_WRITE_COUNT = 0
```

The direct Kintone-path test must install a fake `globalThis.kintone.api`, force the code path where `kintoneApiWrapper.getComments` is absent (matching production), call the real comment mirror method, capture the request body, and assert `limit === 10`.

## Verification

Run:
- focused Comment mirror tests;
- Back navigation tests;
- My MBO tests;
- real main-mbo-app integration test;
- relevant attachment/auth regression;
- full `npm test`;
- `npm run ui:build`;
- hardened build-only with network/Kintone calls = 0;
- deterministic clean rebuild with zero tracked dist diff.

Then commit source + tests + final dist together as a new candidate. Record exact JS/CSS Git blob SHAs.

## Strictly Forbidden

- NO Live App794 customization deploy
- NO upload/PUT/POST deploy
- NO rollback/recovery
- NO App794 record write
- NO schema/layout/ACL/process write
- NO Kintone Comment write
- NO auth/session behavior change
- NO attachment/routing/scoring change
- NO App801/App795/App796 write
- NO Copy Previous MBO
- NO D2-D7 work
- NO unrelated refactor

Commit + push and STOP.

Maximum status:
`WP2_LIVE_UAT_CORRECTIVE_R2_PENDING_INDEPENDENT_REVIEW`