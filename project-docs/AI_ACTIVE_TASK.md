# AI ACTIVE TASK — WP2 R3 CSS RUNTIME FIX + TABLE UI CORRECTIVE

Mode: **ANTIGRAVITY SOURCE / TEST / DIST ONLY — NO LIVE DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. Current Live Truth

```text
LIVE_APP794_REVISION        = 56
DEPLOYED_SOURCE_COMMIT      = cab6db3c3f917138abc45c5218a3a5a0d3f7d0d3
LIVE_JS_IDENTITY            = 79787f75a1edf0721d7d6ac71216a1366599f3e0
LIVE_CSS_IDENTITY           = b6f77930256378cbe1e190932103dfecea174fbc
TECHNICAL_READBACK          = PASS
USER_RUNTIME_UAT            = FAIL
LIVE_DEPLOY_AUTH            = NONE
```

Prior deployment authorization is CONSUMED/CLOSED. Never reuse it.

## 2. Runtime Evidence — DIAGNOSTIC COMPLETE

User executed browser Console probes on Rev56.

### My MBO
```text
CARD_LIST_EXISTS     = true
CARD_EXISTS          = true
CARD_LIST_DISPLAY    = block
CARD_PADDING         = 0px
CARD_BORDER_TOP      = 0px none
```

Expected source CSS says grid / ~18px padding / blue top border.
Conclusion: DOM exists; external feature CSS is not applying.

### Detail
```text
MBO_ROOT_EXISTS      = true
BACK_EXISTS          = true
BACK_TEXT            = ← กลับหน้า My MBO / Back to My MBO
BACK_STYLE           = default/transparent instead of styled button
COMMENT_EXISTS       = true
COMMENT_PADDING      = 0px
COMMENT_BORDER       = 0px / none
```

Conclusion:
- Back JS/wiring exists and is not the current root cause.
- Comment container exists and data loading works.
- Common root cause is stylesheet parse/scope/cascade/runtime applicability for the later WP2 feature selectors.

DO NOT ask the user for another diagnostic before source correction.

## 3. Task A — Find and Fix CSS Runtime Root Cause FIRST

Canonical stylesheet:
`src/styles/mbo-employee.css`

Required investigation:
1. Identify why selectors such as these exist in source/dist but do not appear in computed style:
   - `.mbo-back-nav-bar`
   - `.mbo-btn-back-home`
   - `.mbo-record-card-list` / replacement My MBO table selectors
   - `.mbo-native-comment-mirror`
2. Inspect stylesheet structure around the first failing selector for:
   - unclosed/mismatched braces;
   - selectors accidentally trapped inside an `@media` / conditional block;
   - malformed rule that changes parser recovery for all following selectors;
   - invalid nesting/scope;
   - build concatenation/truncation/order issue;
   - later reset/cascade overriding all feature declarations.
3. Prove the actual cause in evidence as `CSS_RUNTIME_ROOT_CAUSE`.
4. Fix the actual stylesheet structure. Do not band-aid by converting all UI styles to inline styles.
5. Preserve the single stylesheet architecture.

Mandatory CSS proof:
- source CSS syntactically balanced/parseable;
- generated `dist/mbo-employee.css` contains the corrected selectors at valid top-level/runtime-applicable scope;
- add an automated regression that would fail if the three feature style sections become trapped in an unintended conditional/parser context again;
- if an existing CSS parser is already available, use it. Do not add a new dependency unless genuinely necessary and documented.

## 4. Task B — My MBO MUST BECOME A TABLE

Canonical owner:
`src/ui/employee-self-index-ui.js`

User explicitly rejected the card/loose-text presentation and requested a table.

Replace the record card list with a clear responsive table.

Required structure:
```text
| Fiscal Year | Status | Record Key | Action |
```

Requirements:
- one MBO record per row;
- Fiscal Year prominent but compact;
- Status as readable badge;
- Record Key secondary/readable;
- Action as clear button/link;
- non-completed => `เปิด MBO / Open MBO`;
- `16 Completed` / Completed => `ดูย้อนหลัง / View History`;
- exact record URL `/k/{appId}/show#record={id}`;
- Create New MBO remains top-right above table;
- responsive wrapper may horizontally scroll on narrow screens;
- exactly one auth bar;
- zero Delete UI.

DO NOT CHANGE:
- `Employee_Code = authenticatedEmployeeCode` self filter;
- `order by Fiscal_Year desc`;
- auth/security semantics;
- status semantics;
- Create URL behavior.

Remove obsolete card-only DOM/CSS only where directly replaced by the table. Do not broad-refactor unrelated UI.

## 5. Task C — Back to My MBO: PRESERVE LOGIC, FIX VISIBLE STYLE

Canonical owner:
`src/ui/employee-record-navigation.js`

Runtime evidence proves Back DOM already exists with exact text.

Therefore:
- preserve existing Detail/Edit rendering logic;
- preserve Create absence;
- preserve same-tab `/k/{currentAppId}/`;
- do not change auth/session or record behavior;
- after CSS root cause fix, make it visibly render as a prominent blue Back button/bar at the top of `.mbo-root`;
- only change JS wiring if a focused regression proves it is actually needed.

Required tests still include real `main-mbo-app.js` detail/edit/create integration.

## 6. Task D — Comment Mirror DATA PRESERVED, PRESENTATION AS TABLE

Canonical owner:
`src/ui/employee-comment-mirror.js`

DATA behavior is now accepted and MUST NOT REGRESS:
- `/k/v1/record/comments.json`;
- `limit = 10`;
- Detail/Edit only;
- Create GET = 0;
- Refresh refetch;
- truthful pagination;
- safe text rendering;
- comment writes = 0.

Redesign only presentation to match the user's supplied reference visual language.

Required table:
```text
| # | ผู้แสดงความคิดเห็น / Author | วัน-เวลา / Date & Time | ความคิดเห็น / Comment |
```

Requirements:
- compact bilingual title: `ความคิดเห็นใน Kintone / Kintone Comments (Native Mirror)`;
- clear read-only notice;
- compact `รีเฟรชความคิดเห็น / Refresh Comments` action in header;
- one comment per row;
- author, timestamp and body aligned in columns;
- preserve multiline comment body with safe text nodes/textContent;
- no dynamic HTML injection;
- no Reply / Delete / Like / POST UI;
- empty state as a single full-width table row: `ยังไม่มีความคิดเห็นสำหรับบันทึกนี้ / No comments for this record yet.`;
- visually align border/font/spacing with the existing Workflow Action Timeline table below.

## 7. Allowed Scope

- `src/styles/mbo-employee.css`
- `src/ui/employee-self-index-ui.js`
- `src/ui/employee-comment-mirror.js`
- `src/ui/employee-record-navigation.js` only if needed for presentation hook
- `src/ui/employee-part-a-ui.js` minimal delegation/wiring only if tests prove needed
- focused WP2 tests
- generated `dist/mbo-employee-app.js`
- generated `dist/mbo-employee.css`
- one concise WP2 R3 evidence file

No extra helper/module unless separation-of-concerns necessity is documented.

## 8. Mandatory Tests / Evidence

Required:
```text
CSS_RUNTIME_ROOT_CAUSE
CSS_STRUCTURE_REGRESSION_RESULT
CSS_FEATURE_SELECTORS_RUNTIME_SCOPE_PASS
MY_MBO_TABLE_STRUCTURE_PASS
MY_MBO_QUERY_SEMANTICS_UNCHANGED
MY_MBO_STATUS_SEMANTICS_UNCHANGED
MY_MBO_ZERO_DELETE_PASS
DETAIL_BACK_RUNTIME_PASS
EDIT_BACK_RUNTIME_PASS
CREATE_BACK_ABSENT_PASS
BACK_TARGET_CURRENT_APP_PASS
COMMENT_TABLE_STRUCTURE_PASS
COMMENT_DIRECT_KINTONE_API_LIMIT10_PASS
COMMENT_REFRESH_REFETCH_PASS
COMMENT_CREATE_GET_COUNT = 0
COMMENT_PAGINATION_PASS
COMMENT_SAFE_TEXT_PASS
COMMENT_WRITE_COUNT = 0
ATTACHMENT_AUTH_REGRESSION_RESULT
FULL_TEST_RESULT
UI_BUILD_RESULT
CLEAN_REBUILD_DIST_DIFF = 0
BUILD_ONLY_RESULT
BUILD_ONLY_NETWORK_CALLS = 0
CANDIDATE_SOURCE_COMMIT
CANDIDATE_JS_BLOB_SHA
CANDIDATE_CSS_BLOB_SHA
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY = NO
FINAL_COMMIT_SHA
```

Also run:
- focused My MBO tests;
- focused Back real main runtime integration tests;
- focused Comment tests;
- attachment/auth regressions;
- full `npm test`;
- `npm run ui:build`;
- hardened build-only.

Final source/tests/dist candidate must be committed and clean. Capture deterministic JS/CSS identities from the exact candidate commit.

## 9. Strictly Forbidden

- NO Live customization deploy/write.
- NO App794 record write.
- NO form/schema/layout write.
- NO ACL/process write.
- NO Kintone Comment POST/DELETE/reply.
- NO Auth/session semantic change.
- NO Attachment behavior change.
- NO Routing/Scoring change.
- NO App801/App795/App796 writes.
- NO protected legacy writes.
- NO Copy Previous MBO.
- NO D2-D7 execution.
- NO automatic rollback/recovery.
- NO unrelated refactor.

## 10. Completion

Commit + push source/tests/dist/evidence to `ai/antigravity-wp002c` and STOP.

Maximum status:
`WP2_R3_CORRECTED_CANDIDATE_PENDING_INDEPENDENT_REVIEW`