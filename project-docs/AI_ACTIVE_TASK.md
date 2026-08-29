# AI ACTIVE TASK — WP2 UI CORRECTIVE: REAL RUNTIME BACK + COMMENT SAFETY + DETERMINISTIC CANDIDATE

Mode: **ANTIGRAVITY SOURCE / TEST / BUILD ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`

## Start Point

Latest WP2 evidence commit:
`a18dd594fb9b522772b9e58427bdd4eeb4906754`

Independent verdict:
`CORRECTIVE`

Accepted current Live remains App794 Rev54 known-good. Do not write Live in this task.

## Preserve Accepted WP2 Direction

```text
My MBO owner       = src/ui/employee-self-index-ui.js
Back owner         = src/ui/employee-record-navigation.js
Comment owner      = src/ui/employee-comment-mirror.js
EmployeePartAUI    = delegates Back + Comment
main-mbo-app.js     = orchestration only
```

Do not move these features back into one large file.

## Corrective A — Back Must Survive Existing-Record Early Returns

Current `EmployeePartAUI.render()` mounts Back only after configuration/snapshot checks. Existing Detail/Edit can return before Back appears.

Required:
- for every existing Detail/Edit render, mount Back immediately after root creation and before any configuration/status/snapshot early return;
- Create must still have no Back;
- do not weaken configuration fail-closed behavior;
- label remains exact: `← กลับหน้า My MBO / Back to My MBO`;
- target remains `/k/{currentAppId}/` same tab;
- no auth/session mutation;
- no record/workflow write.

Add regressions for at least:
```text
DETAIL_VALID_RUNTIME_BACK_VISIBLE
EDIT_VALID_RUNTIME_BACK_VISIBLE
DETAIL_CONFIGURATION_ERROR_BACK_VISIBLE
DETAIL_INVALID_SNAPSHOT_BACK_VISIBLE
CREATE_RUNTIME_BACK_ABSENT
```

## Corrective B — Real main-mbo-app Runtime Integration Test

The prior tests instantiate navigation/EmployeePartAUI directly and do not satisfy runtime proof.

Add an integration test that executes the real registered Kintone record-show orchestration path from `src/main-mbo-app.js`:

```text
app.record.detail.show / app.record.edit.show / app.record.create.show
 -> getRecordUiHost
 -> login gate requireLogin
 -> setupRecordUiWithAuth
 -> EmployeePartAUI.render
```

A practical test may install a controlled fake `globalThis.kintone` before dynamic-importing `main-mbo-app.js`, capture the registered event handler, inject a mock login gate, and invoke the actual handler.

The proof must not call `_renderBackToMyMboBar()` directly as its primary assertion path.

Record:
```text
REAL_MAIN_DETAIL_BACK_VISIBLE
REAL_MAIN_EDIT_BACK_VISIBLE
REAL_MAIN_CREATE_BACK_ABSENT
REAL_MAIN_BACK_CURRENT_APP_TARGET
REAL_MAIN_AUTH_SESSION_MUTATION = 0
REAL_MAIN_RECORD_WRITE = 0
```

## Corrective C — Comment Mirror Detail/Edit Only

Current EmployeePartAUI appends Comment mirror unconditionally.

Required:
- Detail/Edit -> mirror present;
- Create -> mirror absent;
- Create comment GET = 0.

Do not replace this with a Create placeholder panel.

## Corrective D — Safe Text Only in Comment Module

Within `src/ui/employee-comment-mirror.js`:
- do not assign non-empty text to `innerHTML`;
- fixed labels, loading/empty/failure strings, author, timestamp, comment body and API error text must use `textContent` or safe text nodes only;
- clearing with `innerHTML = ''` may remain if needed, or use an equivalent safe clear operation;
- dynamic `err.message` must never enter HTML parsing.

Add malicious error regression, for example error text containing `<img onerror=...>` or `<script>` and prove it remains plain text.

Required:
```text
COMMENT_DYNAMIC_ERROR_SAFE_TEXT_PASS
COMMENT_BODY_SAFE_TEXT_PASS
COMMENT_AUTHOR_SAFE_TEXT_PASS
COMMENT_WRITE_COUNT = 0
```

## Corrective E — No Silent Pagination Ceiling

Current `for (page < 100)` silently returns partial comments if `newer=true` after page 100.

Required:
- no silent partial success due arbitrary page ceiling;
- continue to truthful end, OR if a safety guard is required, throw an explicit pagination error that the UI catches and shows as non-blocking failure;
- protect against no-progress loops;
- preserve short-page + `newer=true` continuation and `newer=false` stop.

Add a regression that crosses the current ceiling (>5,000 comments or equivalent 101+ pages) and proves either complete retrieval to `newer=false` or explicit failure — never silent truncated success.

## Corrective F — Deterministic Candidate Artifact / CSS EOL Identity

Current evidence has an identity ambiguity:
```text
Evidence CSS exact-byte identity = 2599ff745475a5f01bd4224f76e5b098fa2bbf2e
Committed dist CSS Git blob      = 2a758a0025c1ec1917b4da19ad09bd8cd2182f51
```

Do not change `gitBlobSha()` exact-byte behavior.

Create a deterministic build/release process so exact built bytes are reviewable and reproducible across the clean candidate checkout.

Required final sequence:
1. implement source/test/build-output correction;
2. generate final `dist/mbo-employee-app.js` and `dist/mbo-employee.css`;
3. commit **source + tests + final dist together** as the candidate commit;
4. checkout/use that exact candidate commit with clean worktree;
5. run `npm run ui:build` / hardened build-only again;
6. post-build tracked `dist/` diff must be zero;
7. deployment-tool exact-byte JS/CSS identities must equal the committed dist Git blob identities;
8. only then create/update evidence in a later docs-only commit.

If CSS checkout EOL is the cause, make only the narrow build-output correction needed to emit canonical deterministic CSS bytes (for example deterministic LF output in the CSS build step). Hash the exact output bytes after that normalization. Do not normalize inside `gitBlobSha()` itself.

Required proof:
```text
CANDIDATE_CLEAN_REBUILD_DIST_DIFF = 0
CANDIDATE_JS_EXACT_BYTE_IDENTITY = COMMITTED_JS_BLOB_SHA
CANDIDATE_CSS_EXACT_BYTE_IDENTITY = COMMITTED_CSS_BLOB_SHA
```

## My MBO

Do not redesign again unless a regression is found. Preserve existing accepted semantics:
- Employee_Code self filter;
- `order by Fiscal_Year desc`;
- Create New;
- FY/Status prominent;
- Record Key secondary;
- Open vs View History;
- zero Delete UI;
- exactly one auth bar.

CSS for My MBO must remain included in the deterministic atomic CSS candidate.

## Allowed Scope

May change only what is directly required:
- `src/ui/employee-part-a-ui.js`;
- `src/ui/employee-record-navigation.js` only if necessary;
- `src/ui/employee-comment-mirror.js`;
- `src/main-mbo-app.js` only for minimal testable orchestration exposure/wiring if actually needed;
- focused tests, including one real main event integration test;
- `scripts/kintone/build-mbo-ui.js` only if deterministic CSS output correction is required;
- generated `dist/mbo-employee-app.js` + `dist/mbo-employee.css`;
- WP2 evidence.

Do not change My MBO source semantics unless a direct regression is proven.

## Verification

Run:
- Back module tests;
- real main-mbo-app record-show integration tests;
- Comment mirror tests including malicious error and >100-page behavior;
- My MBO regression tests;
- relevant attachment/auth regression tests;
- `npm test`;
- `npm run ui:build`;
- hardened build-only with 0 Kintone/network calls.

Then execute the final candidate commit + clean-rebuild procedure defined above.

## Final Evidence Required

```text
EXECUTION_START_HEAD
SOURCE_FILES_CHANGED
NEW_MODULES_PRESERVED
BACK_EARLY_RETURN_FIX
REAL_MAIN_DETAIL_BACK_VISIBLE
REAL_MAIN_EDIT_BACK_VISIBLE
REAL_MAIN_CREATE_BACK_ABSENT
COMMENT_CREATE_MIRROR_ABSENT
COMMENT_CREATE_GET_COUNT = 0
COMMENT_DYNAMIC_ERROR_SAFE_TEXT_PASS
COMMENT_PAGINATION_NO_SILENT_TRUNCATION
COMMENT_REFRESH_REFETCH_RESULT
COMMENT_WRITE_COUNT = 0
MY_MBO_QUERY_SEMANTICS_UNCHANGED
ATTACHMENT_AUTH_REGRESSION_RESULT
FOCUSED_TEST_RESULT
RUNTIME_INTEGRATION_TEST_RESULT
FULL_TEST_RESULT
UI_BUILD_RESULT
BUILD_ONLY_RESULT
BUILD_ONLY_NETWORK_CALLS = 0
CANDIDATE_SOURCE_COMMIT
CANDIDATE_CLEAN_REBUILD_DIST_DIFF = 0
CANDIDATE_JS_BLOB_SHA
CANDIDATE_CSS_BLOB_SHA
COMMITTED_DIST_JS_BLOB_SHA
COMMITTED_DIST_CSS_BLOB_SHA
JS_IDENTITY_MATCH = YES
CSS_IDENTITY_MATCH = YES
CANDIDATE_SCOPE = ALL
CANDIDATE_TOPOLOGY = Desktop JS 1 / Desktop CSS 1 / Mobile JS 0 / Mobile CSS 0
ROLLBACK_SOURCE_COMMIT = ec6278524a2d5eb53050d0580c340d1b4e866b97
ROLLBACK_JS_IDENTITY = e04aa07852e8e5aa4e4234f6efce5c99f2b37ec8
ROLLBACK_CSS_IDENTITY = 1710d770ae87fb5f910d669dd5a88ea0950e6991
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY = NO
FINAL_EVIDENCE_COMMIT_SHA
```

## Strictly Forbidden

- NO Live Kintone customization deploy/write
- NO App794 record write
- NO schema/layout/ACL/process write
- NO Comment write
- NO auth/session behavior change
- NO attachment behavior change
- NO routing/scoring/profile change
- NO App801/App795/App796 write
- NO Copy Previous MBO
- NO D2-D7 work
- NO rollback/recovery
- NO unrelated refactor

Commit + push and STOP.

Maximum status:
`WP2_UI_CORRECTED_CANDIDATE_PENDING_INDEPENDENT_REVIEW`.
