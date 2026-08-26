# AI ACTIVE TASK — APP794 EVALUATION UI V2 R6 UI CLOSURE MASTER SPRINT — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Supersedes: prior unexecuted R6 task at `0c9e92188cec23dcb257925ef8d78ab8ea4e94b2`
> Canonical UI baseline: `project-docs/CONFIRMED_BASELINE/UI_UX.md`
> Kintone write/deploy authorization: **NONE**

## 0. MANDATORY STARTUP

Pull latest `ai/antigravity-wp002c` and verify local HEAD equals origin.

Read completely, in this order:
1. `project-docs/CONFIRMED_BASELINE/README.md`
2. `project-docs/CONFIRMED_BASELINE/EVALUATION_CLASSES.md`
3. `project-docs/CONFIRMED_BASELINE/LEGACY_PMS_APPS.md`
4. `project-docs/CONFIRMED_BASELINE/ROUTING_WORKFLOW.md`
5. `project-docs/CONFIRMED_BASELINE/UI_UX.md`
6. `project-docs/AI_ACTIVE_TASK.md`
7. `project-docs/CURRENT_STATE.md`
8. `project-docs/HANDOFF.md`
9. `project-docs/AI_REVIEW_PACKAGE.md`

If source conflicts with confirmed baseline, treat baseline as canonical and fix the local candidate. Do not mutate Kintone.

## 1. CURRENT PRIORITY — UI IS THE HERO

The user explicitly confirmed that UI/UX is the current critical path and must be finished before Dashboard/Hoshin continuation, Final UAT, or App794 redeploy.

Do not optimize for closing a technical milestone while the UI is still confusing.

Current critical path:

`App794 UI/UX V2 Closure -> ChatGPT Source Review -> User Visual Preview Approval -> Scoring/Route/Calendar Persistence Closure -> Dashboard/Hoshin -> Final UAT -> Go-Live`

This sprint is **LOCAL ONLY**.

## 2. DO NOT TOUCH KINTONE

Hard boundary:
- Kintone GET/POST/PUT/DELETE = 0 unless a local static file read is involved; no live API call is needed for this task.
- App794 deploy/upload = 0.
- App794 record/workflow/process/schema/ACL/notification writes = 0.
- App795/App796/App797/App798/App800 writes = 0.
- No real-user workflow/notification test.
- Do not ask for or use a new Kintone authorization.
- Prior App794 deployment authorization is consumed and closed.

## 3. FIVE BUSINESS STAGES — EXACT USER-FACING NAVIGATION

Top navigation must be exactly five macro stages and bilingual:

1. `เป้าหมาย / Objectives`
2. `ทบทวนกลางปี / Mid-Year`
3. `ประเมินตนเอง / Self Evaluation`
4. `การประเมินโดยผู้ประเมิน / Appraiser Evaluation`
5. `HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น / HR Final / Completed`

These are business UX stages, not the 16 technical Process statuses.

Do not make raw statuses such as `03 Manager Objective Review` the dominant user-facing stage name. Raw status may appear only as small Technical Details / diagnostic metadata in Preview.

## 4. BILINGUAL THAI + ENGLISH — MANDATORY

This system is used by Thai and Japanese employees.

User-facing UI must be Thai + English consistently:
- navigation;
- field labels;
- route labels;
- current-action banner;
- phase state;
- deadline/countdown;
- validation/help text;
- completion/result badges;
- important Preview controls.

Thai first where practical, English immediately adjacent/below.
Japanese translation is not required for V1.

Technical codes may remain English only in secondary Technical Details.

## 5. APPRAISERS ARE A LIFECYCLE ROUTE, NOT ONLY FINAL SCORING

Correct the business model completely.

The same configured appraiser/evaluator sequence belongs to the MBO record for the whole annual journey:

`Objectives -> Mid-Year -> Self Evaluation -> Appraiser Evaluation -> HR Final / Completed`

The appraiser sequence must remain visible/contextual throughout all five stages.

Examples:
- Objectives: Requester enters -> Appraiser route reviews/approves.
- Mid-Year: Requester enters -> same Appraiser route reviews/approves.
- Self Evaluation: Requester enters self result -> same route remains visible as next chain.
- Appraiser Evaluation: same Appraisers perform Part A + Part B evaluation/scoring.
- HR Final/Completed: same route is shown read-only as audit/context, then HR Final.

Never invent a separate evaluator set for each phase.

## 6. USER-FACING APPRAISER LABELS ARE ORDINAL ONLY

Use:
- `ผู้ประเมินลำดับที่ 1 / 1st Appraiser`
- `ผู้ประเมินลำดับที่ 2 / 2nd Appraiser`
- `ผู้ประเมินลำดับที่ 3 / 3rd Appraiser`
- `ผู้ประเมินลำดับที่ 4 / 4th Appraiser`

Do NOT use `Manager`, `GM`, `VP`, `President`, or `1st Manager` as the route-slot heading.

A resolved evaluator may organizationally be a Manager/GM/VP/President, but position is optional secondary metadata only.

Current legacy physical fields/statuses may remain named `Manager_User`, `GM_User`, `First_Manager_User`, etc. Do not rename Kintone schema/process in this task. Use a UI adapter.

## 7. APPROVAL ROUTE SUMMARY — REDESIGN

Replace:
`เส้นทางเสนออนุมัติ / Approval Route Summary`
with:
`เส้นทางผู้ประเมินและอนุมัติ / Evaluation & Approval Route`

Example 2-person route:

`พนักงาน / Employee -> ผู้ประเมินลำดับที่ 1 / 1st Appraiser -> ผู้ประเมินลำดับที่ 2 / 2nd Appraiser -> HR Final`

Display actual person name/account under each ordinal slot.

The route component remains visible through all five stages and highlights the current actor truthfully.

Allowed visual states include bilingual:
- `รอดำเนินการ / Waiting`
- `กำลังดำเนินการ / Current`
- `ตรวจสอบแล้ว / Reviewed`
- `ให้คะแนนแล้ว / Scored`
- `เสร็จแล้ว / Completed`

Do not claim scoring is complete during Objectives or Mid-Year.

## 8. REPLACE CONFUSING `APPRAISERS (1-4)` + RAW TOPOLOGY CONTROLS

The current Preview controls are confusing because appraiser count and topology appear as independent business choices.

### 8.1 One business-facing Route Scenario selector

Replace the separate primary `APPRAISERS (1-4)` control and dominant `TOPOLOGY` control with one bilingual selector such as:

1. `เส้นทางมาตรฐานปัจจุบัน — ผู้ประเมิน 2 คน / Current Standard — 2 Appraisers`
   - technical topology: `M1_G1`
   - currently supported runtime topology

2. `เส้นทางขยาย — ผู้ประเมิน 3 คน / Extended Route — 3 Appraisers`
   - technical topology: `M1_M2_G1`
   - generic/future route support; current live App795 rows do not use it

3. `เส้นทางผู้บริหารโดยตรง — ผู้ประเมิน 1 คน / Executive Direct — 1 Appraiser`
   - evaluator fixture may be President
   - **Preview Only / Routing Pending**
   - intended future business target for DGM / GM / VP

4. `เส้นทางรองรับอนาคต — ผู้ประเมิน 4 คน / Future Capacity — 4 Appraisers`
   - **Preview Only**

### 8.2 Technical Details

Move raw technical topology choices (`M1_G1`, `M1_M2_G1`, G2, invalid) into an Advanced / Technical Details section.

Do not tell users `M1_G1 = Staff` or another position. Current routing is section/team based, so a position-specific topology label would be misleading.

Keep G2/invalid forensic testing available only under Technical Details and keep fail-closed warning behavior.

## 9. EVALUATION PROFILE — SEPARATE FROM ROUTE

Current label `PROFILE RATIO` is not clear enough and can imply it controls routing.

Rename to:
`โปรไฟล์การประเมิน / Evaluation Profile (Part A : Part B)`

Preview must expose the actual profile families distinctly, even where ratios repeat:
- Staff / Chief — 70/30
- Japanese Staff — 70/30
- Assistant Manager — 60/40
- Section Manager — 50/50
- Senior Manager — 50/50
- DGM — 50/50
- GM — 50/50
- VP — 50/50

Do not collapse all 50/50 profiles into one option if that prevents visual inspection of future routing differences.

Important:
- scoring ratio is NOT routing;
- do not derive route solely from 70/30, 60/40, or 50/50;
- production profile-route binding remains a later runtime/persistence gate.

For Preview convenience only, DGM/GM/VP may suggest the `Executive Direct — 1 Appraiser` scenario, but must display `Preview Only / Routing Pending` and must not claim runtime support.

## 10. CONFIRMED FUTURE EXECUTIVE ROUTE TARGET

User-confirmed future business target:

For **DGM / GM / VP**, intended route is direct to **President only** as one evaluator/approver route member.

User-facing slot remains:
`ผู้ประเมินลำดับที่ 1 / 1st Appraiser`

Do not display the route heading as `President Approver`.

This route is NOT implemented in App795/App794 Process today.

This sprint must only support it visually in Preview with a clear `Routing Pending` badge.
Do not change App795, App794 Process, or App796.

Later runtime closure must reconcile:
- App795 routing;
- App794 Process compatibility;
- App796 `Expected_Appraiser_Count`;
- scoring behavior/profile mapping.

## 11. ROUTE-AWARE PHYSICAL WORKFLOW

Preserve current known topology behavior:

### Current `M1_G1`
Applicable path has 13 statuses and skips 02/07/12:

`01 -> 03 -> 04 -> 05 -> 06 -> 08 -> 09 -> 10 -> 11 -> 13 -> 14 -> 15 -> 16`

### `M1_M2_G1`
Generic 3-appraiser technical path includes 02/07/12:

`01 -> 02 -> 03 -> 04 -> 05 -> 06 -> 07 -> 08 -> 09 -> 10 -> 11 -> 12 -> 13 -> 14 -> 15 -> 16`

G2 remains unsupported in current V1 and must fail closed.

Preview can inspect all 16 statuses, but if a status is not applicable to the selected route scenario, show a prominent bilingual mismatch warning and do not display normal route progress.

## 12. WHO STARTS MID-YEAR AND SELF EVALUATION

Current frozen workflow source confirms:

- `05 Objective Approved` is assigned to `Requester_User`.
- Native action `Start Mid-Year` transitions `05 -> 06 Employee Mid-Year`.
- `10 Mid-Year Completed` is assigned to `Requester_User`.
- Native action `Start Self Evaluation` transitions `10 -> 11 Employee Self Evaluation`.

Therefore current V1 UX must show:

### Status 05
Before Mid-Year Start Date:
`ยังไม่ต้องดำเนินการ / No action required yet`
`Mid-Year opens in X days`

When Mid-Year window opens:
`พร้อมเริ่มทบทวนกลางปี / Ready to start Mid-Year`
`พนักงาน / Requester` is current actor.
Guidance: use native Kintone Process action `Start Mid-Year`.

### Status 10
Before Self Evaluation Start Date:
`ยังไม่ต้องดำเนินการ / No action required yet`
`Self Evaluation opens in X days`

When Self Evaluation window opens:
`พร้อมเริ่มประเมินตนเอง / Ready to start Self Evaluation`
`พนักงาน / Requester` is current actor.
Guidance: use native Kintone Process action `Start Self Evaluation`.

Do NOT auto-transition based only on date in this sprint.
HR controls dates; Requester performs the current native Process start action.

## 13. HR PHASE CALENDAR — CONTROLLED FROM APP800 HR DASHBOARD

User-confirmed ownership:

**HR must set Start Date and End Date for each macro stage from App800 HR Control Center / Dashboard.**

Five stage schedule:
- Objectives: start/end
- Mid-Year: start/end
- Self Evaluation: start/end
- Appraiser Evaluation: start/end
- HR Final: start/end

App794 employees only read/display the effective schedule. They do not edit dates.

### This local sprint

Do not create Kintone fields or mutate App800.

In the local Preview Lab, add a compact `HR Phase Calendar Preview / ตัวอย่างการกำหนดช่วงเวลาโดย HR` control panel to simulate what App800 will eventually own:
- five rows;
- Start Date;
- End Date;
- deterministic values;
- clearly label `Preview Contract — production persistence pending App800 integration`.

Changing dates in this local panel must immediately update App794 phase cards/countdown so the user can visually validate the contract.

Do not build a duplicate calendar app.

## 14. PHASE DATE + DAYS REMAINING UX

Every stage tab/card must clearly show:
- bilingual phase status;
- Start–End range;
- simple countdown/deadline message.

Required states:

### Upcoming
`ยังไม่เปิด / Upcoming`
`เริ่มใน X วัน / Opens in X days`

### Open
`กำลังเปิด / Open`
`เหลือ X วัน / X days remaining`

### Due Today
`ครบกำหนดวันนี้ / Due today`

### Overdue / incomplete
`เกินกำหนด / Overdue`
`เกินกำหนด X วัน / X days overdue`

### Completed
`เสร็จแล้ว / Completed`
Do not show an alarming overdue countdown after the stage is complete.

Use deterministic calendar-date arithmetic, not time-of-day hours.
Recommended edge semantics:
- if `previewNow === endDate`: Due today;
- one calendar day before end: 1 day remaining;
- one calendar day after end and incomplete: 1 day overdue;
- completed state overrides overdue.

Optional UX color hierarchy:
- Completed = success/green;
- Open = blue;
- Due soon (<=7 days) = amber emphasis;
- Overdue = red;
- Upcoming = neutral/gray.

Do not confuse deadline/progress colors with performance score.

## 15. PROCESS PROGRESS + DATA COMPLETION + APPRAISER COMPLETION

Keep these concepts visually separate:

1. `ความคืบหน้ากระบวนการ / Process Progress`
2. `ความครบถ้วนของข้อมูล / Data Completion`
3. `ความครบถ้วนของผู้ประเมิน / Appraiser Completion` when applicable
4. phase deadline/countdown

Process Progress must be route-aware, not based on all 16 statuses for every employee.

Do not use process percentage as a performance score.

## 16. CURRENT ACTOR UX

Add/retain a prominent bilingual current-action card.

### Requester-owned
At least 01, 06, 11 and boundary states 05/10 when their next window is open:
- highlight Employee / Requester;
- current phase data editable only when allowed;
- appraiser/HR sections read-only/contextual.

### Appraiser-owned
At applicable review/evaluation states:
- highlight ordinal appraiser slot derived from route order;
- never say Manager/GM as the business actor label;
- distinguish review/approve action from scoring action where appropriate.

### HR
Status 15:
- `HR ตรวจสอบขั้นสุดท้าย / HR Final Check`
- scoring/context read-only.

### Completed
Status 16:
- `เสร็จสิ้น / Completed — No action required`
- fully read-only.

## 17. DESKTOP HORIZONTAL LAYOUT — USER REQUIREMENT

The user explicitly wants wide fields because employees enter substantial text.

Desktop must use horizontal row/grid layout, not vertical cards by default.

### Objectives
`# | Objective / Target | Action Plan | Additional Agreement | Weight | Difficulty`

- Objective and Action Plan wide.
- Additional Agreement medium-wide.
- Weight and Difficulty compact.
- long textareas approximately 4–6 lines minimum.

### Mid-Year
`Objective (RO) | Progress % | Periodical Review | Mid-Year Result | Issue/Risk | Next Action | Attachment`

### Self Evaluation
`Objective (RO) | Actual Result | Self Achievement | Self Comment | Attachment`

### Appraiser Part A
`Objective | Weight | Difficulty | Self | Appraiser 1..N | Result Context`

### Part B
`Competency | Appraiser 1..N | Result Context`

### HR Final
Read-only horizontal summary/matrix; do not duplicate a long vertical edit screen.

Horizontal scrolling is acceptable for wide 3/4-appraiser matrices.
Mobile stacking may be handled responsively, but desktop visual approval is priority.

## 18. ATTACHMENTS

Preserve and visibly support:
- Mid-Year attachment/evidence per Objective;
- Self Evaluation attachment/evidence per Objective;
- Appraiser Evaluation shows these as read-only context;
- HR Final shows these as read-only context.

Production path must never invent fake attachment names.
Preview fixtures must be clearly marked Preview.

## 19. DIFFICULTY EMPTY STATE — DO NOT REGRESS

Blank `Difficulty_i`:
- record stays blank;
- show `-- กรุณาเลือกระดับความยาก / Please select --`;
- Required/yellow state;
- do not display fake Level 3.

Stored values 1–4 render correctly.
Read-only blank = `ยังไม่ได้ระบุ / Not selected`.

## 20. PART A + PART B SCORING UI — DO NOT REGRESS

Preserve previous R1–R5 corrections:
- real App794 legacy score-field compatibility adapter for current physical slots;
- ordinal labels in UI;
- dynamic visual columns 1..4;
- per-objective Part A comments;
- per-competency Part B comments;
- correct Operational 6 / Management 8 competency sets;
- COCE evaluated but excluded from score;
- correct score/result context;
- incomplete appraiser inputs must keep combined result Pending/Incomplete;
- no stale final score presented as certified complete;
- profile weight config fail-closed;
- competency set fail-closed;
- slots 3/4 remain Preview/logical only until persistence closure.

## 21. PREVIEW LAB — BUSINESS-FIRST DESIGN

The Preview Lab is a visual approval tool, not a technical control dump.

Primary controls should be simple and bilingual:
1. Business Stage / Workflow Status preview
2. Evaluation Profile
3. Route Scenario
4. Current / Simulated Date
5. Completion Mode

Optional secondary/advanced controls:
- technical raw status;
- topology code;
- active editor/appraiser slot override;
- G2/invalid forensic cases.

If keeping a simulated actor selector, rename it clearly:
`จำลองผู้ใช้งานปัจจุบัน / Simulated Current Actor`
and make default actor derive from selected status/route automatically.

Do not show `Appraisers (1-4)` as if a production user chooses evaluator count manually.

## 22. HR CALENDAR PREVIEW + EMPLOYEE PREVIEW MUST WORK TOGETHER

User must be able to:
1. set/change five Preview phase date ranges in the HR Calendar Preview panel;
2. set `Simulated Date`;
3. switch employee workflow status/stage;
4. immediately see phase status, days remaining/opens/overdue, locked/open field behavior, and correct current actor change.

Example:
- Objectives Jan 1–Mar 31
- Mid-Year Jun 1–Jul 31
- Self Evaluation Oct 1–Oct 31
- Appraiser Evaluation Nov 1–Nov 30
- HR Final Dec 1–Dec 31

These are Preview fixture examples only, never hardcoded production dates.

## 23. PRODUCTION ENFORCEMENT WARNING

This sprint is UI/Preview only.

Do not falsely claim that the HR phase calendar is already a production authorization/enforcement boundary.

Before go-live, phase-window rules that must block/allow saves or workflow actions need a reviewed native/server-side/business-rule enforcement path; UI hiding/locking alone is not sufficient.

For this sprint:
- visually model the correct behavior;
- expose `PHASE_CALENDAR_PERSISTENCE = PENDING_APP800_INTEGRATION`;
- expose `PHASE_WINDOW_RUNTIME_ENFORCEMENT = PENDING_LATER_GATE`.

## 24. SOURCE / FILE SCOPE

Prefer modifying existing files only:
- `src/ui/employee-part-a-ui.js`
- `src/styles/employee-part-a.css` or existing relevant stylesheet
- `preview/index.html`
- `scripts/ui-preview-server.js` only if needed for existing local preview behavior
- existing relevant test file(s), preferably `tests/objective-save-validation.test.js` unless separation is clearly justified
- `dist/mbo-employee-app.js` / CSS only as generated output when production source changes
- living evidence docs as needed

Do not create another UI framework or duplicate renderer.
Do not add a new Kintone calendar app.
Do not modify App800 production source in this sprint unless absolutely necessary for a local Preview-only contract and clearly isolated; prefer Preview Lab contract first.

## 25. REQUIRED FOCUSED TESTS

Add/adjust tests proving at minimum:

### Route / appraiser model
1. user-facing route heading is `Evaluation & Approval Route` bilingual;
2. route slots use ordinal Appraiser labels and no Manager/GM/1st Manager headings;
3. same appraiser route is visible across all five stages;
4. M1_G1 UI resolves 2 ordinal appraisers;
5. M1_M2_G1 UI resolves 3 ordinal appraisers;
6. Executive Direct Preview renders exactly 1 ordinal appraiser and `Routing Pending`;
7. Future Capacity Preview renders exactly 4 ordinal appraisers;
8. raw topology lives in Technical Details, not dominant business selector;
9. no `Appraisers (1-4)` primary selector remains.

### Profile separation
10. evaluation profile label is bilingual and distinct from route;
11. all 8 profile options can be visually selected;
12. repeated 50/50 profiles remain distinguishable by profile identity;
13. changing ratio/profile does not silently overwrite route scenario unless it is an explicit Preview-only suggestion.

### Boundary actor
14. status05 before Mid-Year start shows waiting/locked + countdown;
15. status05 when window open shows Requester current actor + `Start Mid-Year` guidance;
16. status10 before Self start shows waiting/locked + countdown;
17. status10 when window open shows Requester current actor + `Start Self Evaluation` guidance.

### HR phase calendar + deadline
18. Preview HR calendar has 5 stage start/end ranges;
19. App794 phase tabs read those fixture values;
20. Upcoming calculates `Opens in X days` correctly;
21. Open calculates `X days remaining` correctly;
22. End date = `Due today`;
23. after end incomplete = `X days overdue`;
24. Completed overrides overdue;
25. date arithmetic uses calendar dates deterministically.

### UI / bilingual
26. five macro-stage labels are Thai + English;
27. phase state and countdown are Thai + English;
28. current actor is Thai + English;
29. desktop Objective/Mid-Year/Self layouts remain horizontal;
30. Part A/Part B dynamic columns 1..4 remain horizontal;
31. attachments remain visible in Mid-Year/Self and read-only in Appraiser/HR;
32. Difficulty blank-state regression passes;
33. incomplete appraiser result fail-closed regression passes;
34. G2/invalid topology forensic path remains fail-closed;
35. Preview has zero Kintone calls.

## 26. LOCAL VERIFICATION BUDGET

Minimize Antigravity credit usage.

Execute:
- `npm test` once after implementation;
- `npm run ui:build` once;
- `npm run ui:preview` once;
- one local browser smoke covering representative cases only.

Representative browser smoke:
- Objectives / Requester / Current Standard 2 Appraisers;
- status05 before and on Mid-Year open date;
- Mid-Year / Appraiser 1 and 2 route context;
- status10 before and on Self open date;
- Self Evaluation;
- Appraiser Evaluation 1, 2, 3, 4 route scenarios;
- HR Final;
- Completed;
- DGM/GM/VP Executive Direct Preview with Routing Pending;
- one overdue phase;
- one Due Today phase.

Do not run repetitive browser matrices when source has not changed.

## 27. REQUIRED EVIDENCE

Record exact evidence:

```text
APP794_EVALUATION_UI_V2_R6_UI_CLOSURE = COMPLETE / BLOCKED
EXECUTION_STARTING_HEAD = exact pulled parent
CANONICAL_UI_BASELINE_READ = PASS/FAIL
UI_IS_CURRENT_CRITICAL_PATH = YES
KINTONE_AUTHORIZATION = NONE

FIVE_STAGE_THAI_ENGLISH = PASS/FAIL
LIFECYCLE_APPRAISER_SEQUENCE = PASS/FAIL
ROUTE_SUMMARY_ORDINAL_APPRAISERS = PASS/FAIL
ROUTE_SUMMARY_MANAGER_GM_HEADINGS = 0 / actual
SAME_APPRAISERS_VISIBLE_ALL_5_STAGES = PASS/FAIL

PRIMARY_APPRAISERS_1_4_SELECTOR_REMOVED = PASS/FAIL
BUSINESS_ROUTE_SCENARIO_SELECTOR = PASS/FAIL
RAW_TOPOLOGY_MOVED_TO_TECHNICAL_DETAILS = PASS/FAIL
CURRENT_STANDARD_2_APPRAISERS = PASS/FAIL
EXTENDED_3_APPRAISERS = PASS/FAIL
EXECUTIVE_DIRECT_1_APPRAISER_PREVIEW = PASS/FAIL
EXECUTIVE_DIRECT_RUNTIME_CLAIM = ROUTING_PENDING
FUTURE_4_APPRAISERS_PREVIEW = PASS/FAIL

EVALUATION_PROFILE_LABEL_CLEAR = PASS/FAIL
EIGHT_PROFILE_OPTIONS_VISIBLE = PASS/FAIL
PROFILE_ROUTE_SEPARATION = PASS/FAIL

STATUS05_REQUESTER_START_MIDYEAR = PASS/FAIL
STATUS10_REQUESTER_START_SELF = PASS/FAIL
BOUNDARY_PREOPEN_LOCKED = PASS/FAIL
BOUNDARY_OPEN_READY_GUIDANCE = PASS/FAIL

HR_PHASE_CALENDAR_PREVIEW_5_STAGES = PASS/FAIL
PHASE_CALENDAR_OWNER = APP800_HR_CONTROL_CENTER
PHASE_CALENDAR_PERSISTENCE = PENDING_APP800_INTEGRATION
PHASE_WINDOW_RUNTIME_ENFORCEMENT = PENDING_LATER_GATE

COUNTDOWN_UPCOMING = PASS/FAIL
COUNTDOWN_DAYS_REMAINING = PASS/FAIL
COUNTDOWN_DUE_TODAY = PASS/FAIL
COUNTDOWN_OVERDUE = PASS/FAIL
COUNTDOWN_COMPLETED_OVERRIDE = PASS/FAIL
DETERMINISTIC_CALENDAR_DATE_ARITHMETIC = PASS/FAIL

PROCESS_PROGRESS_ROUTE_AWARE = PASS/FAIL
DATA_COMPLETION_VISIBLE = PASS/FAIL
APPRAISER_COMPLETION_VISIBLE = PASS/FAIL

OBJECTIVES_HORIZONTAL_DESKTOP = PASS/FAIL
MIDYEAR_HORIZONTAL_DESKTOP = PASS/FAIL
SELF_EVAL_HORIZONTAL_DESKTOP = PASS/FAIL
PARTA_DYNAMIC_1_TO_4_COLUMNS = PASS/FAIL
PARTB_DYNAMIC_1_TO_4_COLUMNS = PASS/FAIL
MIDYEAR_ATTACHMENT = PASS/FAIL
SELF_EVAL_ATTACHMENT = PASS/FAIL
APPRAISER_HR_EVIDENCE_CONTEXT = PASS/FAIL
R4_DIFFICULTY_REGRESSION = PASS/FAIL
APPRAISER_COMPLETENESS_REGRESSION = PASS/FAIL

APPRAISER_3_4_PERSISTENCE_CLAIM = NOT_IMPLEMENTED
PRODUCTION_GENERIC_ROUTE_PERSISTENCE = PENDING_LATER_GATE
EXECUTIVE_ROUTE_PERSISTENCE = PENDING_LATER_GATE

APP794_KINTONE_CALL_COUNT = 0
APP794_KINTONE_WRITE_COUNT = 0
APP795_WRITE_COUNT = 0
APP796_WRITE_COUNT = 0
APP800_WRITE_COUNT = 0
WORKFLOW_ACTION_COUNT = 0

NPM_TEST = actual/PASS/FAIL
UI_BUILD = PASS/FAIL
PREVIEW_MAIN_UI_RENDER = PASS/FAIL
PREVIEW_CONSOLE_FATAL_ERROR_COUNT = 0 / actual
PREVIEW_KINTONE_CALL_COUNT = 0
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW THEN USER VISUAL PREVIEW; NO DEPLOY
```

## 28. STOP CONDITIONS

STOP and report BLOCKED if:
- implementation would require Kintone write/deploy;
- baseline conflicts cannot be reconciled locally;
- production route/persistence must be invented to make Preview work;
- Preview can only work by lying about runtime support;
- frozen Core workflow/routing/scoring semantics would need modification.

Otherwise:
1. implement local candidate;
2. run focused tests/build/preview once;
3. commit and push same branch;
4. keep Preview Lab running if practical;
5. STOP.

Do not deploy App794.
Do not write App795/App796/App800.
Do not continue to Dashboard/Hoshin.

Next gate is ChatGPT source review followed by the user's visual inspection. The user, not automated tests, closes UI visual approval.
