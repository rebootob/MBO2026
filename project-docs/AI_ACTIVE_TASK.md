# AI ACTIVE TASK — APP794 EVALUATION UI V2 + STATUS PREVIEW LAB — LOCAL IMPLEMENTATION ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Mode: PROJECT CLOSE MODE / APP794 EVALUATION UX CLOSURE
> Source baseline before task manifest: `b2d58e5fc723f694d746e74f4e7902ae9d735708`
> Kintone write/deploy authorization: **NONE**

# 1. WHY THIS TASK EXISTS

App794 UI/UX V1 is healthy at live revision 39, but source review and user visual inspection confirmed that the current custom UI only has meaningful dedicated screens for Objectives, Mid-Year, and Self Evaluation. Final statuses 12–16 fall into generic READ_ONLY presentation and do not expose a proper Part A / Part B appraiser-evaluation experience.

Dashboard implementation is paused until this App794 evaluation/scoring UX is visually closed.

# 2. USER-CONFIRMED BUSINESS/UI RULES

## 2.1 Five distinct macro screens

The UI must NOT force every stage into one spreadsheet layout.

1. `Objectives`
2. `Mid-Year`
3. `Self Evaluation`
4. `Appraiser Evaluation`
5. `HR Final / Completed`

Exact current Process statuses remain unchanged at 16 states / 28 actions.

### Visual status-to-macro mapping

- 01–05 -> Objectives
- 06–10 -> Mid-Year
- 11 -> Self Evaluation
- 12–14 -> Appraiser Evaluation
- 15–16 -> HR Final / Completed

IMPORTANT: this is a PRESENTATION mapping only. Do NOT change the frozen workflow Process or silently change validation/workflow semantics merely to obtain a new screen.

## 2.2 Scoring-appraiser terminology and capacity

Canonical baseline now confirms:
- Workflow Approver != Scoring Appraiser.
- UI labels are `1st Appraiser`, `2nd Appraiser`, `3rd Appraiser`, `4th Appraiser`.
- Logical architecture supports 1–4 appraisers.
- Render only the configured/fixture-required slots.
- Do not display scoring columns as Manager/GM.
- Do not infer appraiser identity from Manager/GM workflow fields in this task.
- Existing published App796 1–2 counts are unchanged.

Current physical/source limitation:
- existing App794 fields are Manager/GM-named two-slot fields;
- current App796 validation/published configuration supports only 1–2;
- true persistent 3rd/4th appraiser storage and actor binding are NOT part of this local visual sprint.

Therefore implement a logical UI model that can render 1–4 slots without claiming slots 3–4 are production-persisted.

# 3. PHYSICAL-STORAGE STRATEGY FOR THIS SPRINT

## 3.1 Do not proliferate schema

Do NOT add Kintone fields, change form schema, change App796, or create another Kintone app in this task.

## 3.2 Compatibility abstraction

Create/keep one clear adapter/helper boundary between logical UI appraiser slots and existing record fields.

For local preview:
- synthetic fixture data may provide normalized Appraiser 1..4 identities, ratings, comments and completion states.

For existing 1–2 physical fields:
- it is acceptable for the adapter to READ existing Manager/GM-named scoring fields as legacy storage slot 1/2 when present;
- the UI must still label them Appraiser 1/2 only;
- do not use `Manager_User` / `GM_User` as authoritative scoring-appraiser identity in this sprint;
- do not implement writes for slot 3/4.

Keep this adapter small and explicit so physical persistence can be replaced later without rewriting UI components.

# 4. FIVE SCREEN REQUIREMENTS

## Stage 1 — Objectives (statuses 01–05)

Editable only where existing business rules already permit objective entry; review/approved statuses are contextual/read-only.

Show:
- employee/profile summary;
- Department Hoshin + Section Hoshin;
- Objective;
- Action Plan;
- Additional Agreement / Comment;
- Weight %;
- Difficulty;
- validation/completion guidance.

Long-text fields must be wide. Prefer card-per-objective or wide sections rather than narrow spreadsheet cells.

## Stage 2 — Mid-Year (statuses 06–10)

Show approved Objective/Weight as read-only context plus:
- Progress %;
- Periodical Review;
- Mid-Year Result / Current Result;
- Issue / Risk / Next Action;
- `MidYear_Attachment_1..10` evidence summary/control area.

Long-text inputs: approx. 4–6 visible lines minimum and resizable/auto-grow where practical.

## Stage 3 — Self Evaluation (status 11; later stages may show read-only context)

Show:
- Objective / Weight / Mid-Year context read-only;
- Actual Result & Achievement;
- Self Achievement;
- Self Comment / Reflection;
- `Final_Attachment_1..10` as Self Evaluation evidence for current physical compatibility.

Long text must be wide and easy to read/edit.

## Stage 4 — Appraiser Evaluation (statuses 12–14)

Dedicated Part A + Part B screen. Do not use generic read-only summary as the entire page.

### Part A
At minimum show:
- Objective;
- Weight;
- Difficulty;
- Actual Result;
- Self Achievement as context;
- Appraiser 1..N rating/input;
- Appraiser 1..N comment/input;
- objective scoring/result display only when completeness permits.

### Part B
At minimum show:
- competency business name;
- short explanation/criteria placeholder from fixture/model;
- Appraiser 1..N rating/input;
- Appraiser 1..N comment/input;
- competency result;
- COCE clearly marked `Evaluated / Excluded from Score`.

### Local preview editability
The Status Preview Lab may simulate which appraiser slot is actively editing. Production actor-to-slot authorization is NOT certified by this task.

## Stage 5 — HR Final / Completed (statuses 15–16)

Read-only summary screen showing:
- employee/profile/Hoshin context;
- Part A completion/result/weight;
- Part B completion/result/weight;
- appraiser completion;
- final score/grade placeholder only if logical completeness gates pass;
- Mid-Year and Self Evaluation attachment evidence summary;
- clear distinction between `15 HR Final Check` and `16 Completed`.

Do NOT present mock scoring output as authoritative Kintone production score.

# 5. PROGRESS / COMPLETION VISUALS

Every stage should have a clear top progress area.

## Overall Process Progress

Display the five phases:
`Objectives -> Mid-Year -> Self Evaluation -> Appraiser Evaluation -> HR Final / Completed`

Include a percentage/progress bar. It represents PROCESS COMPLETION only, never performance quality.

Use a deterministic presentation lookup based on status. Do not derive it from score values.

## Appraiser Completion

For fixture/configured N appraisers:
- completed slots / N;
- percentage = completed / N * 100;
- support N=1..4.

Examples:
- 1/4 = 25%
- 2/4 = 50%
- 3/4 = 75%
- 4/4 = 100%

## Data Completion

Show useful stage-level completeness, especially:
- Part A required inputs complete / total;
- Part B required inputs complete / total;
- missing-data guidance.

Fail closed visually: incomplete required appraiser data means final result is `Pending / Incomplete`, not a partial final score.

# 6. ATTACHMENT UX — IMPORTANT

The user explicitly requires attachments at both Mid-Year and Self Evaluation.

Local preview must visibly show attachment areas for each objective, including representative attached file names/counts.

However this task must NOT invent unsafe fake Kintone persistence.

Rules:
- render existing record FILE values/read-only attachment summaries when available;
- in preview, simulate upload controls visually with synthetic files;
- clearly isolate any preview-only attachment control from production persistence;
- do NOT call Kintone file upload API;
- do NOT issue REST file uploads;
- do NOT claim custom upload persistence is solved until a later Kintone/browser compatibility gate verifies the exact safe implementation;
- Appraiser and HR screens show attachments as read-only evidence context.

Record an `ATTACHMENT_RUNTIME_INTEGRATION = PENDING_PREDEPLOY_GATE` evidence line unless source already contains a proven supported native method.

# 7. SCORING RUNTIME SAFETY — DO NOT FAKE COMPLETION

Source review identified design debt that must remain visible:
- current source/schema-spec contains historical hardcoded Part A/B calculations such as 70/30 in some fields;
- App794 annual snapshot currently does not prove every configuration attribute needed for generic 1–4 scoring persistence;
- current App796 validator/source only accepts expected appraiser count 1–2.

Therefore this sprint is UI + logical preview, not scoring-engine certification.

Do NOT:
- rewrite frozen scoring formulas casually;
- mutate App796;
- change current published profile counts;
- claim 3–4 appraiser scoring persistence is production-ready;
- show a partial/mocked final score as a certified result.

Use fixture/demo calculations only in the Status Preview Lab and label them clearly when necessary.

# 8. STATUS PREVIEW LAB — REQUIRED DELIVERABLE

Create a local-only clickable preview that renders the real redesigned UI component logic with synthetic fixture data.

## Controls

Must allow user to select:
- all 16 exact statuses;
- profile/weight examples: 70/30, 60/40, 50/50;
- Appraiser count: 1, 2, 3, 4;
- completion mode: complete / incomplete where useful;
- active simulated appraiser slot 1..N for Appraiser Evaluation preview.

## Exact status list

1. 01 Draft Objective
2. 02 First Manager Objective Review
3. 03 Manager Objective Review
4. 04 GM Objective Review
5. 05 Objective Approved
6. 06 Employee Mid-Year
7. 07 First Manager Mid-Year Review
8. 08 Manager Mid-Year Review
9. 09 GM Mid-Year Review
10. 10 Mid-Year Completed
11. 11 Employee Self Evaluation
12. 12 First Manager Final Evaluation
13. 13 Manager Final Evaluation
14. 14 GM Final Evaluation
15. 15 HR Final Check
16. 16 Completed

## Preview implementation requirements

- local browser only;
- no credentials;
- no Kintone calls;
- use clearly synthetic employee/appraiser names;
- share/reuse actual UI render functions rather than creating a disconnected screenshot-only mock;
- provide one easy command such as `npm run ui:preview` and print a localhost URL;
- use a tiny built-in Node HTTP server if needed; do not add a large framework/dependency solely for preview;
- preview server is development-only and must never be bundled into Kintone production assets.

# 9. PREFERRED FILE SCOPE

Reuse existing architecture and avoid file sprawl.

Expected existing files that may change:
- `src/ui/employee-part-a-ui.js`
- `src/styles/mbo-employee.css`
- `tests/objective-save-validation.test.js` only if relevant
- `package.json`
- generated `dist/mbo-employee-app.js`
- generated `dist/mbo-employee.css`
- evidence living docs

New files are allowed ONLY when separation of concerns is clear. Preferred maximum new preview-specific files:
- one preview HTML/JS entry or small preview folder;
- one tiny local preview server script if required;
- one focused preview/UI test file if existing test files would become unreasonably large.

Do not create duplicate production UI renderers.

# 10. PRESENTATION MAPPING MUST NOT BREAK FROZEN CORE

Do not change App794 Process Management.
Do not change routing logic.
Do not change Record_Key logic.
Do not change native authorization.
Do not change notification config.
Do not change App795.
Do not change App796.
Do not change App797/798/800.
Do not perform workflow actions.
Do not create/update/delete Kintone records.

Prefer a UI-specific status-to-screen mapper rather than changing frozen validation semantics in `STATUS_TO_STAGE_MAP` if that would alter process validation behavior.

# 11. REQUIRED TESTS

Add focused tests proving at least:
- exact 16 statuses resolve to one of the five visual screens;
- status 01 vs 05 edit/read-only presentation differs correctly;
- status 06 vs 10 differs correctly;
- status 11 is Self Evaluation;
- statuses 12/13/14 use Appraiser Evaluation screen;
- statuses 15/16 use HR Final/Completed screen;
- 1/2/3/4 appraiser slot rendering;
- UI never labels scoring columns `Manager` or `GM`;
- incomplete appraiser set does not present final result complete;
- Appraiser completion percentage correct for 1..4;
- attachment fixture summary renders for Mid-Year/Self and read-only later;
- long-text fields use wide/resizable presentation classes;
- XSS escaping remains intact;
- existing topology display fail-closed tests remain intact;
- production bundle does not include preview server-only runtime.

# 12. EXECUTION / TEST BUDGET

Avoid repeated expensive runs.

Run exactly:
1. `npm test` once after implementation is complete.
2. `npm run ui:build` once after tests.
3. one local Preview Lab launch/smoke sufficient to prove the page loads and all selectors exist.

Do not run Kintone browser UAT in this task.
Do not upload/deploy.

# 13. REQUIRED EVIDENCE

Append concise evidence to `project-docs/AI_REVIEW_PACKAGE.md` and reconcile CURRENT_STATE/HANDOFF only as needed.

Required block:

```text
APP794_EVALUATION_UI_V2_LOCAL_CANDIDATE = COMPLETE / BLOCKED
SOURCE_BASELINE_BEFORE_TASK_MANIFEST = b2d58e5fc723f694d746e74f4e7902ae9d735708
EXECUTION_STARTING_HEAD = actual HEAD after pulling latest task manifest
FIVE_SCREEN_UI_GATE = PASS/FAIL
STATUS_16_PREVIEW_COVERAGE = 16/16 or actual
APPRAISER_SLOT_RENDER_CAPACITY = 1-4 / FAIL
SCORING_ROLE_NEUTRAL_LABEL_GATE = PASS/FAIL
WORKFLOW_APPROVER_SCORING_APPRAISER_SEPARATION = PASS/FAIL
PROCESS_PROGRESS_GATE = PASS/FAIL
APPRAISER_COMPLETION_GATE = PASS/FAIL
DATA_COMPLETION_GATE = PASS/FAIL
MIDYEAR_ATTACHMENT_UI_GATE = PASS/FAIL
SELF_EVAL_ATTACHMENT_UI_GATE = PASS/FAIL
ATTACHMENT_RUNTIME_INTEGRATION = PENDING_PREDEPLOY_GATE / PROVEN
WIDE_TEXT_UX_GATE = PASS/FAIL
PART_A_UI_GATE = PASS/FAIL
PART_B_UI_GATE = PASS/FAIL
COCE_EXCLUDED_DISPLAY_GATE = PASS/FAIL
INCOMPLETE_FINAL_SCORE_FAIL_CLOSED_UI = PASS/FAIL
APPRAISER_3_4_PERSISTENCE_CLAIM = NOT_IMPLEMENTED
APP796_MUTATION_COUNT = 0
APP794_KINTONE_CALL_COUNT = 0
APP794_KINTONE_WRITE_COUNT = 0
WORKFLOW_ACTION_COUNT = 0
FROZEN_PROCESS_CHANGE_COUNT = 0
ROUTING_CHANGE_COUNT = 0
RECORD_KEY_CHANGE_COUNT = 0
NPM_TEST = actual/PASS/FAIL
UI_BUILD = PASS/FAIL
CLASSIC_BUNDLE_PARSE = PASS/FAIL
PREVIEW_LAB_LOAD = PASS/FAIL
PREVIEW_KINTONE_CALL_COUNT = 0
NEW_PRODUCTION_UI_STACK_COUNT = 0
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW + USER VISUAL PREVIEW; NO DEPLOY YET
```

# 14. ROLLBACK PLAN

This is Git/local only.

If implementation fails:
- do not touch Kintone;
- revert only this candidate's Git/local changes by normal follow-up commit if required;
- preserve prior deployed App794 revision 39 unchanged.

# 15. STOP CONDITION

After source + tests + build + Preview Lab + evidence are complete:
- commit;
- push same branch;
- STOP.

Do NOT request or perform Kintone deploy.
Do NOT continue to Dashboard.
Do NOT silently solve 3rd/4th appraiser persistence in this sprint.

The next gate is ChatGPT source review followed by user visual inspection of the Status Preview Lab.