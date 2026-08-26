# AI ACTIVE TASK — APP794 EVALUATION UI V2 R6-R1 USER VISUAL CORRECTION CLOSURE — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Prior R6 implementation commit: `3110a334c4aace8c9ba2586ac78887eb25bb8e9b`
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

The Confirmed Baseline is canonical. If R6 source conflicts with it, fix the LOCAL candidate. Do not mutate Kintone.

## 1. CURRENT GATE

R6 is implemented locally but is **NOT user-visually approved**.

The user is actively inspecting the UI and identified the correction set below. UI/UX remains the critical path.

Critical path:
`R6-R1 UI Visual Correction Closure -> ChatGPT Source Review -> User Visual Preview Approval -> Persistence/Runtime Closure -> Dashboard/Hoshin -> Final UAT -> Go-Live`

Do not continue to Dashboard/Hoshin or deployment.

## 2. HARD SAFETY BOUNDARY

This task is LOCAL ONLY.

- Kintone GET/POST/PUT/DELETE = 0.
- App794 upload/deploy = 0.
- Record/workflow/process/schema/ACL/notification writes = 0.
- App795/App796/App797/App798/App800 writes = 0.
- No real-user workflow/notification test.
- No new Kintone authorization exists.
- Do not create new Kintone fields in this task.
- Do not claim Preview behavior equals secure production authorization.

## 3. OPTIONAL ATTACHMENTS — OBJECTIVES + MID-YEAR + SELF EVALUATION

User-confirmed requirement:

Each Objective must have an optional evidence/attachment area in these three stages:
1. `เป้าหมาย / Objectives`
2. `ทบทวนกลางปี / Mid-Year`
3. `ประเมินตนเอง / Self Evaluation`

Required UX:
- show `แนบไฟล์ / Attach File (Optional)` clearly per Objective;
- no red Required state;
- Save/Submit completeness must not fail solely because attachment is empty;
- show selected/existing file name(s) and remove/replace affordance where appropriate in Preview;
- Appraiser Evaluation and HR Final carry all evidence forward read-only by source stage: Objective / Mid-Year / Self Evaluation;
- never invent fake production filenames when no file exists.

Physical persistence rules:
- existing Mid-Year `MidYear_Attachment_*` and Self Evaluation legacy-compatible attachment fields may be represented by adapters;
- do not silently invent an App794 Objective attachment Kintone field;
- if Objective attachment physical storage does not exist, Preview must still show the intended UX and mark implementation metadata `OBJECTIVE_ATTACHMENT_PERSISTENCE = PENDING_SCHEMA_REVIEW`;
- Preview file selection must stay local/non-persistent and perform zero Kintone calls.

Add focused tests proving attachments are OPTIONAL and rendered in all three stages.

## 4. MID-YEAR `PROGRESS (%)` — MAKE MEANING OBVIOUS

The current bar is driven directly by employee-entered `Progress_Percent_i` 0..100. Preserve that business meaning.

Required UX:
- rename/clarify label to `ความคืบหน้าของเป้าหมาย / Objective Progress (%)`;
- helper: `พนักงานระบุความคืบหน้าปัจจุบัน 0–100% / Employee-reported current progress 0–100%`;
- provide a clear numeric input 0–100; slider may remain, but numeric input and slider must stay synchronized;
- progress bar width = entered percentage exactly;
- do NOT derive this value from calendar days, workflow progress, ratings, or scores;
- requester status `06 Employee Mid-Year` may edit;
- Appraiser review statuses see it read-only;
- invalid <0 or >100 fails validation locally.

Keep this visually distinct from top `ความคืบหน้ากระบวนการ / Process Progress`.

## 5. NATIVE KINTONE COMMENT THREAD — PRESERVE IT

Operational use confirmed by user:
Kintone record comments are used when an MBO is Return/Reject back to the employee for correction.

Requirements:
- custom UI must not intentionally hide/cover/disable the native Kintone comment thread;
- do not build a duplicate custom persistent comment system;
- Part A/Part B evaluator comments are NOT a replacement for record comments;
- in local Preview, add only a clearly non-persistent layout placeholder/reserved-side-area if helpful:
  `ความคิดเห็นใน Kintone / Kintone Comments (Native Platform)`;
- ensure desktop custom layout has a composition that can coexist with the native right-side Kintone comments panel without requiring microscopic fields;
- record in evidence that real native Kintone comment accessibility remains `PENDING_DEPLOYED_BROWSER_VERIFICATION` because this sprint is local-only.

## 6. DEADLINE / DAYS REMAINING — STRONGER EMPLOYEE URGENCY

The current `X days overdue` text is too subtle.

Required visual hierarchy:
- active and within allowed date window = GREEN emphasis;
- overdue/incomplete = RED emphasis;
- due today = strong AMBER/ORANGE urgency;
- upcoming = neutral/gray/blue;
- completed = success/green and no alarming overdue text.

The numeric callout must be prominent, for example:
- `เหลือ 12 วัน / 12 DAYS REMAINING`
- `เกินกำหนด 76 วัน / 76 DAYS OVERDUE`

Use a larger/bolder chip/card/callout than normal helper text. It must be readable at a glance and visually motivate action.

Do not confuse deadline urgency with performance score.

Test upcoming, open/on-time, due-today, overdue, completed.

## 7. APPRAISER EVALUATION — ACTIVE COLUMN MUST FOLLOW CURRENT APPRAISER

This is mandatory.

All configured Appraiser columns are visible to Appraisers, but only the current action owner's own column is editable.

### Current `M1_G1` mapping
- status `13 Manager Final Evaluation` -> business-facing **1st Appraiser** column ACTIVE/EDITABLE;
- status `14 GM Final Evaluation` -> business-facing **2nd Appraiser** column ACTIVE/EDITABLE.

### Generic `M1_M2_G1` mapping
- status `12 First Manager Final Evaluation` -> **1st Appraiser** active;
- status `13 Manager Final Evaluation` -> **2nd Appraiser** active;
- status `14 GM Final Evaluation` -> **3rd Appraiser** active.

### Column behavior
If 1st Appraiser is current:
- Appraiser 1 = active/editable;
- Appraiser 2..N = visible/read-only.

If 2nd Appraiser is current:
- Appraiser 2 = active/editable;
- Appraiser 1 + Appraiser 3..N = visible/read-only.

Apply same pattern for Appraiser 3/4 where configured/simulated.

Important:
- previous Appraiser ratings/comments remain visible to later Appraisers;
- Appraisers see one another's columns;
- no Appraiser can edit another Appraiser's column;
- do not hide prior Appraiser values when advancing to next evaluator;
- HR Final shows all Appraiser columns read-only;
- this confirms Appraiser-to-Appraiser visibility only; do not independently expand Requester visibility of confidential scoring.

Preview 4-Appraiser scenario may simulate active slot 1..4 but must state slot4 workflow/persistence is Preview Only.

Security note:
client disable/read-only is UX only. Do not claim secure production edit isolation until a later native Kintone authorization/permission review.

## 8. PREVIEW CONTROL FOR ACTIVE APPRAISER

The old generic `ACTIVE EDITOR SLOT` control may remain only as a Preview/Technical simulation aid, but make its business meaning clear:

`ผู้ประเมินที่กำลังดำเนินการ / Current Appraiser (Preview)`

For statuses with deterministic mapping (12/13/14), default it automatically from the selected route/status.

If the user changes the active slot manually for 4-Appraiser future simulation, clearly show `Preview Override` and do not claim this is a live Process path.

## 9. WORKFLOW ACTION TIMELINE — WHO / ACTION / DATE / TIME

Add a clear lifecycle-wide read-only frame:

`ประวัติการดำเนินการ / Workflow Action Timeline`

Purpose: users must be able to see when each Requester/Appraiser/HR actor acted during each MBO stage.

Each event row/card must show:
- Stage / ขั้นตอน;
- ordinal business actor: Employee/Requester, 1st Appraiser, 2nd Appraiser, 3rd Appraiser, 4th Appraiser, HR Final;
- actual person name/account where fixture/source exists;
- action: Submitted, Approved, Returned, Resubmitted, Started Mid-Year, Started Self Evaluation, Scoring Completed, HR Final Completed, etc.;
- exact date and time in one consistent display format, e.g. `14 Feb 2026 • 09:42`;
- outcome/status;
- optional `💬 View Comments / ดูความคิดเห็น` indicator for Return/Reject events, pointing conceptually to native Kintone comments (do not fake comment persistence).

Example preview sequence:
- Objectives | 1st Appraiser | Approved | 14 Feb 2026 • 09:42
- Objectives | 2nd Appraiser | Returned | 15 Feb 2026 • 10:18
- Objectives | Employee | Resubmitted | 16 Feb 2026 • 08:30
- Objectives | 2nd Appraiser | Approved | 16 Feb 2026 • 13:05
- Appraiser Evaluation | 1st Appraiser | Scoring Completed | 20 Nov 2026 • 14:22

History semantics:
- preserve ALL events chronologically;
- never overwrite earlier approve/return/resubmit actions;
- latest relevant event may be visually emphasized but full history remains accessible;
- timeline remains visible/collapsible across all five macro stages;
- do not derive event timestamps from generic record Updated_datetime/current status;
- do not infer scoring-complete time merely because a score field is nonblank.

This sprint is Preview/UI only:
- use deterministic synthetic fixtures only;
- `WORKFLOW_ACTION_TIMELINE_PERSISTENCE = PENDING_AUDIT_DESIGN_REVIEW`;
- do not add Kintone timestamp/history fields;
- do not call live Kintone history/revision APIs;
- later runtime closure must perform read-only inventory of Kintone Process/history/revision capabilities and App794 schema, then choose durable append-only audit storage if needed.

## 10. PRESERVE ALL PRIOR UI BASELINE REQUIREMENTS

Do not regress any confirmed behavior in `CONFIRMED_BASELINE/UI_UX.md`, including:
- five bilingual macro stages;
- lifecycle-wide appraiser route;
- ordinal Appraiser labels instead of Manager/GM headings;
- friendly Route Scenario selector and secondary technical topology details;
- evaluation profile separate from routing;
- DGM/GM/VP Executive Direct -> President as Preview Only / Routing Pending;
- route-aware Process progress;
- requester starts Mid-Year at 05->06 and Self Evaluation at 10->11 when HR window opens;
- HR phase dates owned by App800 contract;
- desktop horizontal high-volume-entry layout;
- Difficulty blank has no fake Level 3 default;
- fail-closed incomplete scoring result;
- Thai + English user-facing UI.

Also search the R6 source for remaining user-facing `Manager`, `GM`, or `First Manager` guidance left in normal business UI. Technical status/detail strings may remain only where explicitly diagnostic. Replace business guidance with ordinal `Appraiser` wording.

## 11. PREVIEW VISUAL CHECK MATRIX

Preview at minimum:

### Employee entry
- Objective: optional Attachment visible.
- Mid-Year status06: numeric Progress 0..100 + synced bar + optional Attachment.
- Self Evaluation status11: optional Attachment.

### Appraiser
- M1_G1 status13 -> Appraiser1 active; Appraiser2 visible read-only.
- M1_G1 status14 -> Appraiser2 active; Appraiser1 visible read-only with its existing data.
- M1_M2_G1 status12/13/14 -> active columns 1/2/3 respectively.
- 4-Appraiser Preview -> simulate active 1/2/3/4.

### Deadline
- on-time green;
- due today amber/orange;
- overdue red with large count;
- completed green.

### Native comment layout
- Preview indicates reserved native Kintone comment context without fake persistence.

### Workflow Action Timeline
- at least one normal approve sequence;
- at least one Return -> Resubmit -> Approve history preserving all events;
- Appraiser scoring timestamps;
- HR Final completion timestamp;
- chronological order and bilingual labels.

## 12. FOCUSED TESTS / EXECUTION BUDGET

Add tests for:
1. Objective attachment optional area renders.
2. Mid-Year attachment optional area renders.
3. Self Evaluation attachment optional area renders.
4. no attachment required validation.
5. Mid-Year progress numeric value exactly drives bar width.
6. progress is independent from Process Progress.
7. deadline open/on-time class is green semantics.
8. overdue has red prominent callout.
9. M1_G1 status13 activates slot1 only.
10. M1_G1 status14 activates slot2 only.
11. M1_M2_G1 status12/13/14 activates slots1/2/3 exactly.
12. inactive Appraiser columns remain visible/read-only.
13. prior Appraiser values remain visible to next Appraiser.
14. HR Final all Appraiser columns read-only.
15. user-facing route/guidance does not regress to Manager/GM role headings.
16. Workflow Action Timeline renders actor + action + date + time.
17. Return -> Resubmit -> Approve preserves all three events.
18. timeline uses ordinal Appraiser names, not organizational role headings.
19. timeline fixture does not fabricate from Updated_datetime.
20. Preview Kintone calls = 0.

Execution budget:
- `npm test` once after implementation;
- `npm run ui:build` once;
- `npm run ui:preview` once;
- local browser smoke only.

Do not burn cycles on unrelated docs cleanup or unrelated broad tests.

## 13. REQUIRED EVIDENCE

```text
APP794_EVALUATION_UI_V2_R6_R1 = COMPLETE / BLOCKED
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
WORKFLOW_ACTION_TIMELINE_UI = PASS/FAIL
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

## 14. STOP CONDITION

Commit and push the same `ai/antigravity-wp002c` branch.
Keep Preview Lab running if practical.
STOP.

Do not deploy App794.
Do not modify any Kintone app.
Do not continue to Dashboard/Hoshin.
