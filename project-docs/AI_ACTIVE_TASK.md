# AI ACTIVE TASK — WP2 UI FUNCTIONAL PARTITION + RUNTIME INTEGRATION PROOF

Mode: **ANTIGRAVITY SOURCE / TEST / BUILD ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Start Point

WP1 accepted candidate:
`035b4d1fa077907f19bf8d2ef0a4177156d0319b`

WP1 verdict:
`PASS / CLOSED`

Do not reopen deployment tooling unless this WP2 work exposes a direct regression.

## Accepted Current Live / Rollback Manifest

```text
LIVE_REVISION          = 54
ROLLBACK_SOURCE_COMMIT = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_SCOPE         = ALL
ROLLBACK_TOPOLOGY      = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_JS_IDENTITY   = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY  = 1710d770ae87fb5f910d669dd5a88ea0950e6991
```

No Live customization write is authorized in WP2.

## Objective — Exactly Three UI Features

1. Existing Detail/Edit: reliable **← กลับหน้า My MBO / Back to My MBO**.
2. My MBO index: readable responsive card/list matching the accepted visual direction.
3. Existing Detail/Edit: read-only **Native Kintone Comments mirror + Refresh**.

Do NOT implement Copy Previous MBO.

## Functional Code Ownership — Mandatory

Follow `CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`.

### A. My MBO
Canonical owner remains:
`src/ui/employee-self-index-ui.js`

Do not duplicate this feature elsewhere.

Preserve exactly:
- Employee_Code self filter;
- `order by Fiscal_Year desc`;
- Create New;
- Fiscal Year prominent;
- Status prominent;
- Record Key secondary;
- non-completed `เปิด MBO / Open MBO`;
- Completed / `16 Completed` => `ดูย้อนหลัง / View History`;
- exact `/k/{appId}/show#record={id}` URLs;
- exactly one auth bar;
- zero Delete UI.

Only adjust source/CSS required to produce the accepted readable card/list design. Do not alter query/security/status semantics.

### B. Back Navigation
Create one canonical owner:
`src/ui/employee-record-navigation.js`

Move/extract the existing Back feature out of `EmployeePartAUI`.

Contract:
- existing Detail => visible;
- existing Edit => visible;
- Create => absent;
- exact bilingual label: `← กลับหน้า My MBO / Back to My MBO`;
- target `/k/{currentAppId}/`;
- same tab;
- no logout/session mutation;
- no record/workflow write.

`employee-part-a-ui.js` may delegate to this module but must not retain duplicate Back rendering logic.

### C. Native Comment Mirror
Create one canonical owner:
`src/ui/employee-comment-mirror.js`

Move/extract current comment mirror + pagination + Refresh behavior out of `EmployeePartAUI`.

Contract:
- existing Detail/Edit only;
- current App794 record only;
- Native right-side comment panel remains source of truth and write UI;
- mirror is read-only;
- GET `/k/v1/record/comments.json` using current Kintone session;
- no DOM scraping;
- no duplicate storage/fields;
- author + timestamp + body;
- safe text rendering (`textContent` or equivalent safe text node handling);
- bilingual loading/empty/failure state;
- non-blocking failure;
- truthful complete pagination;
- short page + `newer=true` must continue;
- stop only on truthful end condition;
- Refresh must perform real API re-fetch;
- Create => zero comment GET;
- zero comment POST/DELETE/reply.

`employee-part-a-ui.js` may delegate to this module but must not retain duplicate Comment mirror implementation.

## Runtime Integration Proof — Back Button Defect Must Be Closed

Previous direct renderer tests were insufficient because Live did not show Back during the failed partial deployment.

Add integration proof through the actual Kintone record UI orchestration path.

At minimum prove:
```text
DETAIL_EXISTING_RUNTIME_BACK_VISIBLE = PASS
EDIT_EXISTING_RUNTIME_BACK_VISIBLE   = PASS
CREATE_RUNTIME_BACK_ABSENT           = PASS
BACK_TARGET_CURRENT_APP              = PASS
BACK_SAME_TAB                        = PASS
AUTH_SESSION_MUTATION                = 0
RECORD_WRITE                         = 0
```

The test must exercise the real event/auth/host setup path used by `src/main-mbo-app.js`, not only instantiate the navigation module directly.

Minimal `src/main-mbo-app.js` changes are allowed only if required to wire canonical modules. Keep it orchestration-only.

## Comment Tests

Preserve and/or relocate all existing comment regression coverage.

Required proof at minimum:
```text
DETAIL_COMMENT_MIRROR_LOAD_PASS
EDIT_COMMENT_MIRROR_LOAD_PASS
CREATE_COMMENT_GET_COUNT = 0
COMMENT_REFRESH_REFETCH_PASS
COMMENT_SHORT_PAGE_NEWER_TRUE_CONTINUES
COMMENT_FINAL_NEWER_FALSE_STOPS
COMMENT_OVER_10_PASS
COMMENT_OVER_500_PASS
COMMENT_SAFE_TEXT_RENDER_PASS
COMMENT_WRITE_COUNT = 0
```

## CSS

Canonical owner remains:
`src/styles/mbo-employee.css`

For this corrective:
- keep a single stylesheet;
- clearly separate sections/comments for My MBO, Back navigation, Comment mirror;
- do not create broad CSS architecture work;
- ensure the card/list design does not fall back to the sparse/unstyled appearance seen in the failed partial deploy.

## Exact Allowed Scope

May change:
- `src/ui/employee-self-index-ui.js` — My MBO visual corrective only;
- `src/ui/employee-part-a-ui.js` — remove/delegate Back + Comment logic only;
- `src/ui/employee-record-navigation.js` — new canonical Back owner;
- `src/ui/employee-comment-mirror.js` — new canonical Comment owner;
- `src/main-mbo-app.js` — minimal wiring/orchestration only if required;
- `src/styles/mbo-employee.css` — only three active UI feature sections;
- focused tests for these exact features;
- deterministic generated `dist/mbo-employee-app.js` + `dist/mbo-employee.css`;
- one concise WP2 evidence file.

Do not create helper/modules beyond these unless there is a direct separation-of-concerns necessity documented in evidence.

## Forbidden

- NO Live Kintone customization deploy/write
- NO App794 record write
- NO form/schema/layout write
- NO ACL/process write
- NO Comment write
- NO Auth/session behavior change
- NO Attachment behavior change
- NO Routing/Scoring/Profile change
- NO App801/App795/App796 write
- NO Copy Previous MBO
- NO D2-D7 work
- NO automatic rollback/recovery
- NO unrelated refactor

## Verification

Run:
- focused My MBO tests;
- focused Back navigation tests;
- runtime Kintone Detail/Edit/Create integration test(s);
- focused Comment mirror pagination/Refresh/read-only tests;
- relevant attachment/auth regression tests because EmployeePartAUI wiring is touched;
- `npm test`;
- `npm run ui:build`;
- hardened module-aware build-only with 0 Kintone/network calls.

After source/tests are final, commit first, then perform a clean-worktree candidate build/identity capture consistent with WP1 tooling rules.

## Required WP2 Evidence

Record:
```text
EXECUTION_START_HEAD
SOURCE_FILES_CHANGED
NEW_MODULES_CREATED
FEATURE_OWNER_MAP
BACK_OLD_IMPLEMENTATION_REMOVED
COMMENT_OLD_IMPLEMENTATION_REMOVED
MAIN_MBO_ORCHESTRATION_ONLY_PROOF
MY_MBO_QUERY_SEMANTICS_UNCHANGED
DETAIL_EXISTING_RUNTIME_BACK_VISIBLE
EDIT_EXISTING_RUNTIME_BACK_VISIBLE
CREATE_RUNTIME_BACK_ABSENT
COMMENT_CREATE_GET_COUNT = 0
COMMENT_REFRESH_REFETCH_RESULT
COMMENT_PAGINATION_RESULT
COMMENT_SAFE_RENDER_RESULT
COMMENT_WRITE_COUNT = 0
FOCUSED_TEST_RESULT
RUNTIME_INTEGRATION_TEST_RESULT
ATTACHMENT_AUTH_REGRESSION_RESULT
FULL_TEST_RESULT
UI_BUILD_RESULT
BUILD_ONLY_RESULT
BUILD_ONLY_NETWORK_CALLS = 0
CANDIDATE_SOURCE_COMMIT
CANDIDATE_JS_BLOB_SHA
CANDIDATE_CSS_BLOB_SHA
CANDIDATE_SCOPE = ALL
CANDIDATE_TOPOLOGY = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_SOURCE_COMMIT = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_JS_IDENTITY = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY = 1710d770ae87fb5f910d669dd5a88ea0950e6991
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY = NO
FINAL_COMMIT_SHA
```

Commit + push source/test/dist/evidence and STOP.

Maximum status:
`WP2_UI_CANDIDATE_IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`.
