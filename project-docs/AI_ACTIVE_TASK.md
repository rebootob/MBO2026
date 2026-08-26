# AI ACTIVE TASK — POST-CORE V1 UI/UX CANDIDATE SPRINT — GIT/LOCAL ONLY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Primary target: App794 `MBO V2 Sandbox`
> Mode: PROJECT CLOSE MODE / UIUX V1
> Kintone write/deploy authorization: **NONE — DO NOT WRITE OR DEPLOY KINTONE**

## Reviewed checkpoint

- `CORE_V1_FUNCTIONAL_FREEZE = FROZEN`.
- `FUNCTIONAL_WORKFLOW_UAT = PASS_WITH_DOCUMENTED_EXECUTION_EVIDENCE_EXCEPTION`.
- Frozen routing/workflow/scoring/security behavior MUST NOT change.
- Current milestone order: `Core Function ✅ -> Functional UAT ✅ -> UI/UX Polish -> Dashboard -> Final UAT -> Go-Live`.

## Control-plane source review findings

Existing App794 UI is concentrated in existing files:
- `src/ui/employee-part-a-ui.js`
- `src/styles/mbo-employee.css`
- integration in `src/main-mbo-app.js`
- generated runtime: `dist/mbo-employee-app.js`, `dist/mbo-employee.css`
- existing regression suite includes `tests/objective-save-validation.test.js`.

Findings:
1. Current status badge shows the raw Process status, but workflow guidance is weak and the stage bar derives mainly from coarse `BUSINESS_STAGES`; all Manager/GM/HR review statuses become `READ_ONLY`, so lifecycle progress/ownership is not clear enough to users.
2. There is no clear read-only `What should happen now?` guidance near the status. Do NOT create replacement workflow buttons; Kintone native Process actions remain authoritative.
3. Header title is hardcoded to `Management By Objectives for Staff & Chief` even though frozen profiles cover multiple evaluation classes.
4. Approval route context is not presented clearly. Manager/GM snapshots exist and can be shown as display-only context. `Requester_User` is a shared workflow boundary and must NOT be presented as individual employee authentication.
5. Legend + rating guidelines occupy permanent vertical space and can be compacted without removing information.
6. Existing UI already has useful field-state colors, inline validation summary, sticky table header and horizontal table layout; preserve these instead of redesigning.
7. **MUST FIX SECURITY/UI SAFETY:** multiple record-sourced values are interpolated directly into `innerHTML`/HTML template strings (employee/profile text, Hoshin, objective/result/comment content, some error text). Escape untrusted dynamic values before HTML insertion to prevent markup/HTML-injection/XSS behavior. Do not alter business values stored in Kintone.
8. Current `scripts/kintone/deploy-custom-ui.js` generates `dist/**` and then immediately uploads/deploys. A reviewed candidate must be buildable with zero Kintone calls before a later deployment authorization.

# CHANGE GOVERNANCE

## What
Create one compact UI/UX V1 candidate that improves clarity and safety while preserving frozen Core behavior.

## Where — MODIFY EXISTING FILES FIRST
Primary allowed implementation files:
- `src/ui/employee-part-a-ui.js`
- `src/styles/mbo-employee.css`
- `tests/objective-save-validation.test.js` (extend existing test file; do not create a new UI test file unless technically unavoidable and justified)
- `scripts/kintone/deploy-custom-ui.js` only for a zero-write `--build-only` path
- `package.json` only if adding a compact `ui:build` command
- generated `dist/mbo-employee-app.js`
- generated `dist/mbo-employee.css`

Do not create new UI modules/stylesheets for this sprint unless separation is genuinely required. Prefer existing functions/files.

## How — required V1 polish

### A. Status + workflow guidance — display only
In the existing App794 custom UI, add a compact top workflow card derived from exact saved `Status` plus `Routing_Topology`:
- show current stage/status clearly in Thai + English;
- show `สิ่งที่ต้องทำตอนนี้ / What happens now` as guidance only;
- say that actual Submit/Approve/Return/Start/Complete actions use the native Kintone Process buttons;
- never simulate authorization or create custom business-action buttons;
- for current `M1_G1`, First-Manager states/actions must never be presented as normal available path;
- if a First-Manager status is encountered while topology is `M1_G1`, display a clear configuration warning/contact-HR message rather than treating it as valid progress.

### B. Lifecycle navigation
Replace/adjust the current coarse 3-step display so saved statuses map visibly to the real macro lifecycle:
1. Objectives
2. Mid-Year
3. Year-End
4. Completed

Manager/GM/HR review statuses must show the correct macro phase as active/in-review rather than falling into a generic misleading READ_ONLY presentation.

This is presentation only. Do not change `STATUS_TO_STAGE_MAP`, Process transitions, validation guards, or action semantics.

### C. Header/profile clarity
- Change the hardcoded `for Staff & Chief` title to a profile-neutral MBO title suitable for all 8 frozen profile classes.
- Keep employee ID/name/section/position/department/start-date summary.
- Optionally show Part A / Part B weights as compact read-only context if values exist; do not expose configuration hash/internal identifiers.

### D. Approval route context — display only
Add a compact read-only route summary:
- Manager: display `Manager_User` user name when available, otherwise code;
- GM: display `GM_User` user name when available, otherwise code;
- First Manager: display only when topology actually includes M2 and value exists;
- HR: label as HR Final Check, without claiming production HR authorization certification;
- do not expose `Requester_User` as an employee identity.

### E. Reduce visual clutter
- Preserve the field-state legend and rating-scale information but make them compact/collapsible or otherwise less dominant.
- Preserve bilingual information.
- Keep validation summary highly visible when errors exist.
- Keep Objective/Mid-Year/Final data tables; do not convert to a new framework/card system in this sprint.

### F. Responsive/readability polish
In existing CSS only:
- improve title/status wrapping at narrower widths;
- allow lifecycle navigation to wrap/stack cleanly;
- keep tables horizontally scrollable;
- do not attempt a full mobile redesign or add mobile Kintone customization.

### G. Dynamic-value HTML safety — MUST FIX
Add a small existing-file escaping/formatting helper and apply it to all untrusted record/user/error values that enter HTML template strings or attributes, including at minimum:
- Employee_Code / Employee_Name / Section / Position / Department / Start Date;
- Department_Hoshin / Section_Hoshin;
- Objective / Action Plan / Additional Agreement;
- Mid-Year / Actual Result / Self Comment text rendered through templates;
- user names/codes shown in route context;
- validation/lookup error messages before converting trusted newlines to `<br/>`.

Do not HTML-escape values before writing them back to Kintone; escaping is render-output only.

### H. Build-only candidate path
Modify existing `scripts/kintone/deploy-custom-ui.js` minimally so:
- `node scripts/kintone/deploy-custom-ui.js --build-only` generates `dist/mbo-employee-app.js` and `dist/mbo-employee.css` and exits **before any upload/API/customization/deploy call**;
- build-only mode must require zero Kintone credentials and make zero Kintone calls;
- optional `package.json` script: `ui:build` for that exact build-only command.

Do NOT execute the normal deploy path in this task.

## Why
The Core is frozen. The remaining V1 need is usability, clarity and safe rendering, not new functionality. This sprint makes employee/manager review easier to understand while preventing UI changes from reopening routing/workflow/scoring logic.

## Expected impact
- clearer workflow/status awareness;
- easier scanning of employee and MBO sections;
- less UI clutter;
- safer rendering of record-sourced text;
- no change to saved business data or workflow behavior;
- no Kintone runtime change until a later separately authorized deploy.

## Risks
- display mapping could drift from canonical 16-status Process if implemented incorrectly;
- escaping could accidentally double-encode display text if applied to already-generated markup rather than raw dynamic values;
- CSS changes could reduce readability on wide tables;
- build tooling change must not accidentally fall through to upload/deploy.

## Test plan — ONE local regression pass after source changes
1. Extend existing tests to cover:
   - exact 16 statuses have deterministic UI lifecycle/guidance presentation;
   - M1_G1 + First-Manager status produces configuration-warning presentation;
   - M1_G1 normal statuses do not present First Manager as active route;
   - user-list display prefers name then code;
   - escaping neutralizes `<`, `>`, `&`, quotes and a representative event-handler/closing-textarea payload;
   - presentation helpers do not mutate record business values.
2. Run `npm test` once after implementation.
3. Run build-only candidate command once.
4. Verify classic bundle parse/residue gates still pass.
5. Verify `src/styles/mbo-employee.css` and `dist/mbo-employee.css` exact match after build.
6. Inspect Git diff: no workflow/routing/scoring/security-core changes.
7. No browser workflow UAT in this task; no Kintone calls.

## Rollback plan
Git-only candidate. Revert the single implementation commit if review fails. No Kintone rollback required because deployment is forbidden.

# HARD BOUNDARIES

Forbidden in this task:
- Kintone file upload/customization PUT/deploy;
- Process/schema/ACL/notification change;
- record create/edit/delete/workflow action;
- App795/App53/App796/other-app write;
- change to `STATUS_TO_STAGE_MAP`, routing service, scoring resolver, validation workflow action semantics, Record_Key logic or native authorization semantics;
- custom replacement Submit/Approve/Return/Complete buttons;
- dashboard work;
- mobile customization deployment;
- framework rewrite or unnecessary new files.

# REQUIRED EVIDENCE

```text
POST_CORE_UIUX_V1_CANDIDATE = COMPLETE / BLOCKED
STARTING_HEAD = actual
CORE_V1_FUNCTIONAL_FREEZE_PRESERVED = PASS/FAIL
MODIFIED_SOURCE_FILES = actual
NEW_FILE_COUNT = actual
STATUS_GUIDANCE_16_STATUS_COVERAGE = PASS/FAIL
M1_G1_FIRST_MANAGER_WARNING = PASS/FAIL
ROUTE_CONTEXT_DISPLAY_ONLY = PASS/FAIL
DYNAMIC_HTML_ESCAPE_GATE = PASS/FAIL
BUILD_ONLY_ZERO_KINTONE_CALL_GATE = PASS/FAIL
NPM_TEST = actual/PASS/FAIL
CLASSIC_BUNDLE_PARSE = PASS/FAIL
SRC_DIST_CSS_MATCH = PASS/FAIL
KINTONE_CALL_COUNT = 0
KINTONE_WRITE_COUNT = 0
PROCESS_CHANGE_COUNT = 0
ROUTING_LOGIC_CHANGE_COUNT = 0
SCORING_LOGIC_CHANGE_COUNT = 0
VALIDATION_WORKFLOW_SEMANTIC_CHANGE_COUNT = 0
RECORD_KEY_LOGIC_CHANGE_COUNT = 0
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW; IF PASS REQUEST FRESH APP794 UI DEPLOY AUTHORIZATION
```

# STOP CONDITION

After source/tests/build-only candidate/evidence commit and push: **STOP**. Do not deploy App794 and do not start Dashboard work.
