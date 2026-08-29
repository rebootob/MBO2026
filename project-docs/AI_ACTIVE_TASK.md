# AI ACTIVE TASK — D1 APP794 ATTACHMENT LONG-FILENAME DELETE-CONTROL UI CORRECTIVE

Mode: **ANTIGRAVITY SOURCE/TEST ONLY — NO LIVE WRITE / NO DEPLOY**
Branch: `ai/antigravity-wp002c`
Live App794 customization revision: `49`
Prior attachment persistence source/deployment verdict: **PASS**
Prior deployment authorization: `APP794-D1-EDIT-ATTACHMENT-DEPLOY-20260829-01` — **CONSUMED / CLOSED**

## Accepted State

```text
OBJECTIVE_ATTACHMENT_FIELDS       = FILE 10/10
MIDYEAR_ATTACHMENT_FIELDS         = FILE 10/10
FINAL_ATTACHMENT_FIELDS           = FILE 10/10
ATTACHMENT_PERSISTENCE_SOURCE      = PASS
ATTACHMENT_PERSISTENCE_DEPLOYMENT  = PASS / REV49
ATTACHMENT_PERSISTENCE_LIVE_REPORT = USER REPORTS WORKING
LONG_FILENAME_DELETE_VISIBILITY    = LIVE FAIL
DEPLOY_AUTHORIZATION               = NONE
```

Do not reopen schema or attachment persistence logic.

## User-Observed Defect

In the Objectives Attach File column, long saved filenames can extend beyond the narrow table cell so the trailing red `✕` delete control is not visible. Multiple files amplify the problem.

The same shared renderer is used by Objective, Mid-Year and Final(Self), so the corrective must be safe for all attachment stages.

## Confirmed Source Cause

Current renderer in `src/ui/employee-part-a-ui.js`:
- saved/pending/error badges are `inline-flex`;
- filename spans have fixed max widths around 120–140px and ellipsis;
- delete button is the final flex child;
- badge/container do not guarantee a shrinkable filename region plus non-shrinking delete control within 100% cell width.

Current `src/styles/mbo-employee.css`:
- MBO grid uses `table-layout: fixed`;
- attachment styles do not fully constrain each attachment row to the cell width or protect the delete button from shrinking/clipping.

## Exact Corrective Requirement

Fix UI layout only. Preserve all persistence behavior.

Required behavior:
1. Every saved/pending/error attachment item stays within the Attach File cell width.
2. Multiple attachments render as clean separate rows/items rather than a wide horizontal overflow chain.
3. Filename occupies the flexible region and must use:
   - `flex: 1 1 auto` or equivalent;
   - `min-width: 0`;
   - `overflow: hidden`;
   - `text-overflow: ellipsis`;
   - `white-space: nowrap`.
4. Preserve full filename in the `title` attribute for hover tooltip.
5. Delete `✕` must be a separate non-shrinking control (`flex: 0 0 auto` or equivalent), remain visible at the right edge, and keep the existing data attributes/click handler semantics.
6. File/icon may be fixed-width/non-shrinking.
7. Pending/error state text must fit or wrap/truncate without pushing the delete control offscreen.
8. Attachment container should use the full available width (`width/max-width:100%`, `min-width:0`) and stack/wrap safely.
9. Add File/Add More button remains visible and functional.
10. Read-only attachment display remains truthful and shows all attachments.
11. Objective, Mid-Year and Final(Self) use the same corrected layout.

Do not solve this by widening the entire MBO table or removing horizontal scrolling. Do not hide the delete control. Do not shorten or mutate the stored filename.

## Strict Logic Boundary

The following are **FORBIDDEN** for this task:
- changes to `src/services/mbo-attachment-service.js`;
- changes to attachment GET/upload/PUT/preflight/finalization logic;
- changes to `src/main-mbo-app.js` attachment orchestration;
- schema/config changes;
- Kintone record/schema/layout/ACL/process writes;
- Live customization deploy;
- App801/App795/App796 changes;
- routing/scoring/auth/reset changes;
- D2-D7 execution.

If a persistence/service change appears necessary, STOP and report evidence instead of changing it.

## Allowed Files

Only as required:
- `src/ui/employee-part-a-ui.js` — attachment markup/classes/structure only;
- `src/styles/mbo-employee.css` — narrow attachment overflow/layout rules;
- `tests/timeline-truthfulness-and-attachment.test.js` — narrow regression tests;
- generated `dist/mbo-employee-app.js` and `dist/mbo-employee.css` through normal build;
- existing D1 attachment evidence document for source/test evidence.

No new source file unless clearly unavoidable; prefer existing renderer/CSS.

## Required Tests

Retain every current passing attachment/timeline test. Add at minimum:

```text
ATTACHMENT_LONG_SAVED_FILENAME_TRUNCATES_WITH_FULL_TITLE
ATTACHMENT_LONG_SAVED_FILENAME_DELETE_CONTROL_REMAINS_SEPARATE
ATTACHMENT_MULTIPLE_LONG_FILENAMES_RENDER_ALL_DELETE_CONTROLS
ATTACHMENT_PENDING_LONG_FILENAME_DELETE_CONTROL_REMAINS_SEPARATE
ATTACHMENT_ERROR_LONG_FILENAME_DELETE_CONTROL_REMAINS_SEPARATE
OBJECTIVE_MIDYEAR_FINAL_ATTACHMENT_RENDER_REGRESSION
```

Tests should verify DOM/class/markup contract, including full filename `title`, unique delete control for each editable file, and no reduction of persistence regression coverage. Do not pretend Node tests prove browser pixels; document the CSS contract clearly for independent review.

## Verification

Run and record:

```text
EXECUTION_START_HEAD
CHANGED_FILES
UI_LAYOUT_DESIGN
LONG_FILENAME_TRUNCATION_CONTRACT
DELETE_CONTROL_NON_SHRINK_CONTRACT
MULTIPLE_FILE_STACK_CONTRACT
FOCUSED_ATTACHMENT_TESTS
FULL_NPM_TEST
NPM_RUN_UI_BUILD
MODULE_AWARE_BUILD_ONLY
ATTACHMENT_SERVICE_CHANGED = NO
MAIN_ATTACHMENT_ORCHESTRATION_CHANGED = NO
LIVE_KINTONE_WRITE = 0
LIVE_DEPLOY_OCCURRED = NO
FINAL_COMMIT_SHA
```

## Stop Rule

Commit + push source/test/build evidence, then STOP for ChatGPT independent review.

Maximum executor status:
`IMPLEMENTED_PENDING_INDEPENDENT_REVIEW`

No deployment authorization exists. Do not deploy or self-PASS.
