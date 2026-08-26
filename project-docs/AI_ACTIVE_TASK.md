# AI ACTIVE TASK — APP794 EVALUATION UI V2 R6-R2 USER VISUAL CORRECTION CLOSURE — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Prior R6 implementation commit: `3110a334c4aace8c9ba2586ac78887eb25bb8e9b`
> Supersedes: R6-R1 task
> Canonical UI baseline: `project-docs/CONFIRMED_BASELINE/UI_UX.md`
> Kintone write/deploy authorization: **NONE**

## 0. MANDATORY STARTUP

Pull latest `ai/antigravity-wp002c` and verify local HEAD equals origin.

Read completely, in this exact order:
1. `project-docs/CONFIRMED_BASELINE/README.md`
2. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
3. `project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md`
4. `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
5. `project-docs/CONFIRMED_BASELINE/UI_UX.md`
6. `project-docs/AI_ACTIVE_TASK.md`
7. `project-docs/CURRENT_STATE.md`
8. `project-docs/HANDOFF.md`
9. `project-docs/AI_REVIEW_PACKAGE.md`

Confirmed Baseline is canonical. If R6 source conflicts with it, fix the LOCAL candidate. Do not mutate Kintone.

## 1. CURRENT GATE — UI IS THE HERO

R6 is implemented locally but is **NOT user-visually approved**.

The user is actively inspecting the UI. Finish the full App794 UI/UX V2 visual closure before Dashboard/Hoshin, persistence changes, Final UAT, or deploy.

Critical path:
`R6-R2 UI Visual Correction Closure -> ChatGPT Source Review -> User Visual Preview Approval -> Persistence/Runtime Closure -> Dashboard/Hoshin -> Final UAT -> Go-Live`

## 2. HARD SAFETY BOUNDARY

This task is LOCAL ONLY.

- Kintone GET/POST/PUT/DELETE = 0.
- App794 upload/deploy = 0.
- Record/workflow/process/schema/ACL/notification writes = 0.
- App795/App796/App797/App798/App800 writes = 0.
- No real-user workflow/notification test.
- No new Kintone authorization exists.
- Do not create new Kintone fields.
- Do not claim Preview UX equals secure production authorization.

## 3. PRESERVE ALL CANONICAL UI REQUIREMENTS

Implement all current requirements in `CONFIRMED_BASELINE/UI_UX.md`, including:
- exactly five bilingual macro stages;
- Thai + English user-facing UI;
- lifecycle-wide Appraiser route;
- ordinal `1st/2nd/3rd/4th Appraiser` labels, never Manager/GM as business headings;
- friendly Route Scenario selector with raw topology only in Technical Details;
- Evaluation Profile separate from routing;
- DGM/GM/VP Executive Direct -> President shown only as Preview Only / Routing Pending;
- route-aware Process Progress;
- Requester starts Mid-Year at 05->06 and Self Evaluation at 10->11 when HR calendar window is open;
- HR phase dates owned by App800 contract;
- horizontal high-volume entry layout;
- Difficulty blank must not fake Level 3;
- fail-closed incomplete scoring result;
- Native Kintone Comments must remain usable after future deploy.

Search normal business-facing text for legacy `Manager`, `GM`, `First Manager` guidance and replace with ordinal Appraiser wording. Technical diagnostic/status metadata may retain legacy names only where necessary.

## 4. OPTIONAL ATTACHMENTS — OBJECTIVES + MID-YEAR + SELF EVALUATION

Each Objective must show `แนบไฟล์ / Attach File (Optional)` in:
1. Objectives
2. Mid-Year
3. Self Evaluation

Rules:
- optional only; no Required styling;
- Save/Submit must not fail solely because attachment is empty;
- show existing/selected filenames and local Preview remove/replace affordance;
- Appraiser Evaluation and HR Final carry Objective/Mid-Year/Self evidence forward read-only;
- never invent fake production filenames.

Persistence boundary:
- existing Mid-Year `MidYear_Attachment_*` and Self legacy-compatible fields may use adapters;
- if Objective attachment physical storage does not exist, Preview still renders UX but marks `OBJECTIVE_ATTACHMENT_PERSISTENCE = PENDING_SCHEMA_REVIEW`;
- do not create schema in this task.

## 5. MID-YEAR OBJECTIVE PROGRESS (%)

Business meaning is employee-reported Objective progress.

Required UX:
- label `ความคืบหน้าของเป้าหมาย / Objective Progress (%)`;
- helper `พนักงานระบุความคืบหน้าปัจจุบัน 0–100% / Employee-reported current progress 0–100%`;
- clear numeric input 0..100;
- slider may remain if synchronized with numeric input;
- progress bar width exactly equals entered percentage;
- NOT derived from dates, Process Progress, rating, or score;
- status06 Requester can edit;
- Appraiser review sees read-only;
- <0 or >100 fails local validation.

Keep visually separate from Process Progress.

## 6. DEADLINE / DAYS REMAINING — HIGH VISIBILITY

For every phase:
- within active allowed period = GREEN emphasis;
- overdue/incomplete = RED emphasis;
- due today = strong AMBER/ORANGE;
- upcoming = neutral/gray/blue;
- completed = success/green without overdue alarm.

Make the numeric message materially prominent:
- `เหลือ 12 วัน / 12 DAYS REMAINING`
- `เกินกำหนด 76 วัน / 76 DAYS OVERDUE`

Do not confuse deadline urgency with performance score.

## 7. APPRAISER ACTIVE COLUMN FOLLOWS CURRENT ACTOR

All configured Appraiser columns remain visible to Appraisers, but only the current Appraiser's own column is editable.

Current `M1_G1`:
- status13 -> 1st Appraiser active/editable;
- status14 -> 2nd Appraiser active/editable.

Generic `M1_M2_G1`:
- status12 -> 1st Appraiser active;
- status13 -> 2nd Appraiser active;
- status14 -> 3rd Appraiser active.

Rules:
- inactive columns visible + read-only;
- previous Appraiser scores/comments remain visible to later Appraisers;
- no Appraiser edits another Appraiser column;
- HR Final shows all columns read-only;
- 4th Appraiser may be Preview-only active-slot simulation and must not claim live Workflow/persistence support.

Preview control label:
`ผู้ประเมินที่กำลังดำเนินการ / Current Appraiser (Preview)`

For deterministic statuses, default active slot automatically. Manual override for future 4-Appraiser simulation must show `Preview Override`.

Security note: read-only/disabled client controls are UX, not the security boundary.

## 8. 3–4 APPRAISER RESPONSIVE MATRIX — NO PAGE OVERFLOW

User visual finding: 4-Appraiser Part A/Part B currently overflows and is difficult to read.

Mandatory correction:
- **App794 page/body must not horizontally overflow because of the matrix.**
- Matrix wrapper must be contained inside available content width (`max-width:100%`, `overflow-x:auto`, correct box sizing).
- Horizontal scrolling, when unavoidable, must occur only inside the Part A/Part B matrix container.
- Prefer sticky Objective/Competency first column while scrolling.
- Result column may be compact/sticky-right where practical.
- Active Appraiser column should be visibly emphasized and may be wider.
- Inactive Appraiser columns remain visible but may use compact read-only rendering.
- Inactive feedback can wrap/compact/expand on demand; do not force full editable textarea width for every inactive column.
- Do not shrink controls/text to unusable sizes merely to fit four columns.
- When actor changes, bring/scroll active Appraiser column into view automatically where practical.
- Design must remain usable when native Kintone comment panel reduces available content width.

Target behavior:
- 1–2 Appraisers: comfortable normal matrix.
- 3 Appraisers: contained responsive matrix.
- 4 Appraisers: contained compact matrix, no whole-page overflow, all Appraiser columns still inspectable.

## 9. NATIVE KINTONE COMMENT THREAD — PRESERVE CONTRACT

Kintone record comments are used for Return/Reject discussion.

Requirements:
- custom UI must not intentionally hide/cover/disable native Comments;
- Part A/Part B evaluator feedback does not replace record comments;
- local Preview may show a non-persistent placeholder/reserved area:
  `ความคิดเห็นใน Kintone / Kintone Comments (Native Platform)`;
- do not build fake persistent comments;
- deployed runtime accessibility remains `PENDING_DEPLOYED_BROWSER_VERIFICATION`.

## 10. WORKFLOW ACTION TIMELINE — DESKTOP TABLE

Add lifecycle-wide read-only section:
`ประวัติการดำเนินการ / Workflow Action Timeline`

### Desktop layout
Use a structured TABLE as the primary presentation. Do not render one large card per event on desktop.

Recommended columns:
`# | ขั้นตอน / Stage | ผู้ดำเนินการ / Actor | ชื่อผู้ดำเนินการ / Person | การดำเนินการ / Action | วัน-เวลา / Date & Time | ผลลัพธ์ / Result | หมายเหตุ / Comments`

Example rows:
- Objectives | 1st Appraiser | Sompong (m01) | Approved | 14 Feb 2026 • 09:42 | Approved | —
- Objectives | 2nd Appraiser | Vichai (g01) | Returned | 15 Feb 2026 • 10:18 | Returned | 💬 View Comments
- Objectives | Employee | Employee 0118 | Resubmitted | 16 Feb 2026 • 08:30 | Submitted | —
- Objectives | 2nd Appraiser | Vichai (g01) | Approved | 16 Feb 2026 • 13:05 | Approved | —
- Appraiser Evaluation | 1st Appraiser | Sompong (m01) | Scoring Completed | 20 Nov 2026 • 14:22 | Completed | —

Table UX:
- chronological and easy to scan;
- clear row separators or zebra rows;
- compact bilingual Action/Result badges where useful;
- Return/Reject row visually identifiable;
- `💬 ดูความคิดเห็น / View Comments` indicator when applicable;
- latest/current relevant row may be subtly highlighted;
- whole table section may collapse to save vertical space;
- `5 Events Recorded` may remain a small count badge next to heading;
- mobile/narrow screens may transform same data into stacked cards.

Audit semantics:
- preserve ALL events; never overwrite Return -> correction -> Resubmit -> Approve history;
- show Stage, ordinal Actor, actual Person, Action, exact date/time, Result, comment indicator;
- timeline read-only;
- do not fabricate timestamps from `Updated_datetime`, current status, or nonblank score fields;
- Preview uses deterministic synthetic fixtures only.

Persistence boundary:
`WORKFLOW_ACTION_TIMELINE_PERSISTENCE = PENDING_AUDIT_DESIGN_REVIEW`

Do not create Kintone fields/history storage or call live history/revision APIs in this sprint.

## 11. PREVIEW VISUAL CHECK MATRIX

Employee entry:
- Objectives: optional Attachment visible.
- status06 Mid-Year: numeric Progress 0..100 + synced bar + optional Attachment.
- status11 Self Evaluation: optional Attachment.

Appraiser:
- M1_G1 status13 -> Appraiser1 active; Appraiser2 visible read-only.
- M1_G1 status14 -> Appraiser2 active; Appraiser1 visible read-only with prior data.
- M1_M2_G1 status12/13/14 -> active columns 1/2/3.
- 4-Appraiser Preview -> active 1/2/3/4 simulation.
- 4-Appraiser Part A + Part B -> no whole-page horizontal overflow.
- active column remains obvious and usable.
- inactive Appraiser values remain visible.

Deadline:
- on-time green;
- due today amber/orange;
- overdue red with large count;
- completed green.

Native Comments:
- reserved/native-context layout visible in Preview without fake persistence.

Workflow Action Timeline:
- desktop renders as Table;
- at least 5 events;
- normal approve sequence;
- Return -> Resubmit -> Approve all preserved;
- Appraiser scoring timestamp;
- HR Final completion timestamp;
- ordinal Appraiser labels;
- chronological order;
- mobile fallback may be cards.

## 12. FOCUSED TESTS / EXECUTION BUDGET

Add/adjust focused tests for:
1. Objective attachment optional area renders.
2. Mid-Year attachment optional area renders.
3. Self Evaluation attachment optional area renders.
4. no attachment required validation.
5. Mid-Year numeric Progress exactly drives bar width.
6. Objective Progress independent from Process Progress.
7. deadline on-time uses green semantics.
8. overdue uses red prominent callout.
9. M1_G1 status13 activates slot1 only.
10. M1_G1 status14 activates slot2 only.
11. M1_M2_G1 status12/13/14 activates slots1/2/3 exactly.
12. inactive Appraiser columns visible/read-only.
13. prior Appraiser values visible to next Appraiser.
14. HR Final Appraiser columns all read-only.
15. 4-Appraiser matrix wrapper contained to content width.
16. no page/body horizontal overflow contract from matrix styles/structure.
17. sticky/retained context column contract for wide matrix where implemented.
18. user-facing guidance does not regress to Manager/GM headings.
19. Workflow Action Timeline desktop renders `<table>` with required columns.
20. Timeline renders actor + person + action + date/time + result.
21. Return -> Resubmit -> Approve preserves all events.
22. Timeline uses ordinal Appraiser names.
23. Timeline fixture does not fabricate from Updated_datetime.
24. Preview Kintone calls = 0.

Execution budget:
- `npm test` once after implementation;
- `npm run ui:build` once;
- `npm run ui:preview` once;
- local browser smoke only.

Do not burn cycles on unrelated docs cleanup or unrelated broad tests.

## 13. REQUIRED EVIDENCE

```text
APP794_EVALUATION_UI_V2_R6_R2 = COMPLETE / BLOCKED
EXECUTION_STARTING_HEAD = exact pulled task parent
OBJECTIVE_ATTACHMENT_OPTIONAL_UI = PASS/FAIL
OBJECTIVE_ATTACHMENT_PERSISTENCE = PENDING_SCHEMA_REVIEW
MIDYEAR_ATTACHMENT_OPTIONAL_UI = PASS/FAIL
SELF_ATTACHMENT_OPTIONAL_UI = PASS/FAIL
ATTACHMENT_REQUIRED_VALIDATION_COUNT = 0 / actual
MIDYEAR_PROGRESS_EMPLOYEE_ENTERED_0_100 = PASS/FAIL
MIDYEAR_PROGRESS_BAR_EQUALS_INPUT = PASS/FAIL
PROCESS_PROGRESS_SEPARATE_FROM_OBJECTIVE_PROGRESS = PASS/FAIL
NATIVE_KINTONE_COMMENT_LAYOUT_PRESERVED_CONTRACT = PASS/FAIL
NATIVE_KINTONE_COMMENT_RUNTIME_VERIFICATION = PENDING_DEPLOYED_BROWSER_VERIFICATION
DEADLINE_ON_TIME_GREEN = PASS/FAIL
DEADLINE_OVERDUE_RED_PROMINENT = PASS/FAIL
DEADLINE_DUE_TODAY_URGENT = PASS/FAIL
M1_G1_STATUS13_ACTIVE_APPRAISER = 1 / actual
M1_G1_STATUS14_ACTIVE_APPRAISER = 2 / actual
M1_M2_G1_STATUS12_ACTIVE_APPRAISER = 1 / actual
M1_M2_G1_STATUS13_ACTIVE_APPRAISER = 2 / actual
M1_M2_G1_STATUS14_ACTIVE_APPRAISER = 3 / actual
INACTIVE_APPRAISER_COLUMNS_VISIBLE_READONLY = PASS/FAIL
PRIOR_APPRAISER_VALUES_VISIBLE_TO_NEXT = PASS/FAIL
HR_FINAL_APPRAISER_COLUMNS_READONLY = PASS/FAIL
APPRAISER4_WORKFLOW_PERSISTENCE = PREVIEW_ONLY_NOT_IMPLEMENTED
FOUR_APPRAISER_MATRIX_CONTAINED = PASS/FAIL
FOUR_APPRAISER_PAGE_BODY_OVERFLOW = 0 / actual
FOUR_APPRAISER_ACTIVE_COLUMN_USABLE = PASS/FAIL
WORKFLOW_ACTION_TIMELINE_UI = PASS/FAIL
WORKFLOW_ACTION_TIMELINE_DESKTOP_TABLE = PASS/FAIL
WORKFLOW_ACTION_TIMELINE_REQUIRED_COLUMNS = PASS/FAIL
WORKFLOW_ACTION_TIMELINE_RETURN_RESUBMIT_HISTORY = PASS/FAIL
WORKFLOW_ACTION_TIMELINE_ORDINAL_ACTORS = PASS/FAIL
WORKFLOW_ACTION_TIMELINE_PERSISTENCE = PENDING_AUDIT_DESIGN_REVIEW
WORKFLOW_ACTION_TIMELINE_KINTONE_HISTORY_SOURCE = NOT_CLAIMED_IN_UI_SPRINT
KINTONE_CALL_COUNT = 0
KINTONE_WRITE_COUNT = 0
DEPLOY_COUNT = 0
NPM_TEST = actual/PASS/FAIL
UI_BUILD = PASS/FAIL
PREVIEW_MAIN_UI_RENDER = PASS/FAIL
PREVIEW_KINTONE_CALL_COUNT = 0
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW THEN USER VISUAL PREVIEW; NO DEPLOY
```

## 14. WHAT / WHERE / HOW / WHY / IMPACT / RISK / TEST / ROLLBACK

What:
- close the current visual defects and usability gaps in App794 Evaluation UI V2 Preview.

Where:
- existing App794 UI source/styles/Preview/tests only; no new architecture unless justified by separation of concerns.

How:
- reuse current components; fix existing render/layout logic first; keep local fixtures deterministic; preserve baseline semantics.

Why:
- UI/UX is the user-confirmed critical path and must be visually approved before persistence/deploy work.

Impact:
- local candidate/Preview only; zero Kintone runtime impact.

Risk:
- accidental source regression, page overflow, fake persistence assumptions, or hidden native Kintone UI dependencies.

Test:
- focused tests + one full npm test + one build + one Preview smoke as specified above.

Rollback:
- Git revert of this local implementation commit only. No Kintone rollback is required because Kintone writes are prohibited.

## 15. STOP CONDITION

Commit and push the same `ai/antigravity-wp002c` branch.
Keep Preview Lab running if practical.
STOP.

Do not deploy App794.
Do not modify any Kintone app.
Do not continue to Dashboard/Hoshin.
