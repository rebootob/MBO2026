# AI ACTIVE TASK — APP794 EVALUATION UI V2 R5 ROUTE-AWARE FIVE-STAGE UX — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Current reviewed branch HEAD before this task: `a7516bd3cc14f4aaa2b605b88e00e9597c475d6c`
> Kintone write/deploy authorization: **NONE**

## 1. USER VISUAL REVIEW FINDINGS — CONFIRMED REQUIREMENTS

The user reviewed the working local Status Preview Lab and identified six design corrections that must be incorporated before visual approval:

1. Physical Workflow status and the five business stages must not be confused.
2. `05 Objective Approved` is the completed/waiting boundary after Objective approval; `06 Employee Mid-Year` is the next requester-input state when the Mid-Year phase opens. Likewise `10 Mid-Year Completed` is the completed/waiting boundary before `11 Employee Self Evaluation` opens.
3. Desktop data-entry fields must use the intended **horizontal row layout**, not a vertically stacked card layout. Long-text fields must remain wide and comfortable.
4. Not every employee/position traverses all 16 physical statuses. UI/progress must be **Routing_Topology aware**.
5. HR must be able to define **Start / End** dates for each of the five macro stages.
6. UI must clearly distinguish when the current work is owned by the Requester/Employee versus Workflow Approver versus Scoring Appraiser versus HR versus a waiting/no-action state.

This task is LOCAL PREVIEW/CANDIDATE work only. Do not deploy or mutate Kintone.

## 2. CANONICAL WORKFLOW FACTS TO PRESERVE

Do not change the frozen App794 Process configuration in this task.

### Current M1_G1 active path

Current 17 live App795 routes are all `M1_G1`, therefore current normal path is:

`01 -> 03 -> 04 -> 05 -> 06 -> 08 -> 09 -> 10 -> 11 -> 13 -> 14 -> 15 -> 16`

The route does **not** use:
- `02 First Manager Objective Review`
- `07 First Manager Mid-Year Review`
- `12 First Manager Final Evaluation`

### Generic M1_M2_G1 path

When compatible M2 routing is active in future, the path is:

`01 -> 02 -> 03 -> 04 -> 05 -> 06 -> 07 -> 08 -> 09 -> 10 -> 11 -> 12 -> 13 -> 14 -> 15 -> 16`

### G2

`M1_G1_G2` and `M1_M2_G1_G2` remain unsupported in current V1 and must render fail-closed warning rather than a fake normal path.

## 3. FIVE MACRO STAGES — BUSINESS SEMANTICS

The five top-level tabs remain:

1. `Objectives`
2. `Mid-Year`
3. `Self Evaluation`
4. `Appraiser Evaluation`
5. `HR Final / Completed`

They are business stages, not a one-to-one representation of physical Process statuses.

### Stage 1 — Objectives
Physical statuses: `01/02/03/04/05` where route applicable.

- `01` = Requester entering Objectives.
- `02/03/04` = approval/review states as applicable to route.
- `05 Objective Approved` = Stage 1 COMPLETE and **waiting for Mid-Year phase window**.
- At status05, do not portray Mid-Year as already active merely because it is the next status.

### Stage 2 — Mid-Year
Physical statuses: `06/07/08/09/10` where route applicable.

- `06` = Requester enters Mid-Year data.
- `07/08/09` = review/approval states as applicable to route.
- `10 Mid-Year Completed` = Stage 2 COMPLETE and **waiting for Self Evaluation phase window**.

### Stage 3 — Self Evaluation
Physical status: `11`.

- Requester enters Year-End/Self Evaluation data.
- When submitted, the process proceeds into the Appraiser Evaluation stage.

### Stage 4 — Appraiser Evaluation
Physical statuses: `12/13/14` where route applicable.

- Keep **Workflow Approver** and **Scoring Appraiser** visually and conceptually separate.
- Scoring terminology remains `1st Appraiser` ... `4th Appraiser`; do not label scoring columns Manager/GM.

### Stage 5 — HR Final / Completed
Physical statuses: `15/16`.

- `15` = HR Final Check.
- `16` = Completed / final read-only.

## 4. ROUTE-AWARE PROGRESS — MUST REPLACE STATIC 16-STATUS PERCENT MODEL

Current `getProcessProgress()` uses a fixed 16-status 5%..100% map. Replace this with a route-aware helper such as:

`getApplicableWorkflowPath(topology)`

Requirements:
- `M1_G1` returns only the 13 applicable statuses.
- `M1_M2_G1` returns all applicable M2 statuses.
- G2/invalid/blank topology = no normal progress path; show fail-closed configuration warning.
- A status not applicable to the resolved route must be treated as configuration inconsistency, not silently assigned a normal percentage.
- Process percentage should be based on position within the applicable path, not the full 16-state catalog.
- The five macro-stage tabs should use `Completed / Active / Upcoming-Locked` visual state independently from physical status count.

Preview Lab may still expose all 16 statuses for forensic testing, but it must clearly mark a selected status as `NOT APPLICABLE TO SELECTED ROUTE` when appropriate.

## 5. HR PHASE CALENDAR — UX CONTRACT NOW, PERSISTENCE LATER

User-confirmed requirement: HR must be able to define Start and End for **each of the five macro stages**.

For this local sprint implement the UI contract and deterministic preview fixture only. Do **not** create Kintone fields/apps yet.

Preview model per Fiscal Year:

```js
{
  objectives: { start, end },
  midyear: { start, end },
  selfEvaluation: { start, end },
  appraiserEvaluation: { start, end },
  hrFinal: { start, end }
}
```

Required presentation:
- each macro-stage tab shows its date range in compact form;
- stage state can be `Upcoming`, `Open`, `Closed`, or `Completed`;
- status05 should show `Objective Approved — Waiting for Mid-Year window` with Mid-Year start date;
- status10 should show `Mid-Year Completed — Waiting for Self Evaluation window` with Self start date;
- before Start: requester/appraiser entry controls for that stage are visually locked;
- after End: show `Closed / Overdue` guidance, not fake active state;
- preview must use a deterministic `previewNow` control/fixture so visual tests do not depend on machine date.

Future physical storage/control should preferentially be integrated through the existing HR Control Center/App800 after a separate source/schema review. Do **not** create a new calendar app in this task.

## 6. ACTOR-AWARE PRESENTATION

Add a prominent `Current Action / ผู้รับผิดชอบขั้นตอนนี้` banner/card.

### Requester / Employee-owned states
At least `01`, `06`, `11`:
- banner: `Action Required — Employee / Requester`;
- current-stage input fields editable only when the phase window is Open;
- approval/appraiser/HR sections read-only or not actionable;
- route summary remains visible as context.

### Workflow Approver-owned states
Applicable `02/03/04`, `07/08/09`, and workflow approval portions of `12/13/14`:
- banner: `Waiting for / Action Required by Workflow Approver`;
- requester-entered data read-only;
- show approval context clearly;
- do not rename the workflow approver as a scoring appraiser.

### Scoring Appraiser
During Stage 4:
- separate `Scoring Action` block from `Workflow Approval` block;
- only the selected/configured Appraiser slot should appear editable in Preview simulation;
- other Appraiser slots read-only;
- slots 3/4 remain explicitly logical/preview-only until persistence closure.

### Waiting boundary states
`05` and `10`:
- banner: `No action required now / Waiting for next HR phase window`;
- all phase input fields read-only;
- next phase Start date visible.

### HR
`15`:
- banner: `Action Required — HR Final Check`;
- final review/read-only scoring context;
- no requester editing.

### Completed
`16`:
- banner: `Completed — No action required`;
- fully read-only.

Preview Lab should include an actor simulation selector only for visual testing if needed. Production actor binding remains a later runtime/security gate and must not be falsely claimed complete here.

## 7. DESKTOP HORIZONTAL LAYOUT — RESTORE INTENDED FORM DESIGN

The user explicitly rejected the current vertically stacked field cards.

### General desktop rule
- one Objective = one horizontal row/card;
- long-text fields remain wide with multi-line textareas;
- use CSS grid/table-like layout with sensible minimum widths;
- horizontal scrolling is acceptable when required for 3–4 Appraisers;
- do not squeeze long text into tiny cells;
- desktop must not stack Objective/Action Plan/etc. vertically by default.

### Objectives suggested row

`# | Objective / Target | Action Plan | Additional Agreement | Weight | Difficulty`

Suggested relative emphasis:
- Objective: large
- Action Plan: large
- Additional Agreement: medium
- Weight: compact
- Difficulty: compact

Textarea height: approximately 4–6 lines minimum.

### Mid-Year suggested row

`Objective (read-only) | Progress % | Periodical Review | Mid-Year Result | Issue/Risk | Next Action | Attachment`

Long text fields must be wide. Attachment remains associated with the same Objective row.

### Self Evaluation suggested row

`Objective (read-only) | Actual Result | Self Achievement | Self Comment | Attachment`

### Appraiser Part A
Use a horizontal evaluation matrix with a sticky/fixed Objective context column where practical:

`Objective | Weight | Difficulty | Self | Appraiser 1 | Appraiser 2 | Appraiser 3 | Appraiser 4 | Result Context`

Only render the number of Appraiser columns selected/configured.

### Part B

`Competency | Appraiser 1 | Appraiser 2 | Appraiser 3 | Appraiser 4 | Result Context`

Per-appraiser comment may be expandable or directly below the rating within that appraiser cell, but must remain understandable.

### HR Final
Read-only horizontal summary/matrix; do not revert to a long vertical duplicate of the appraiser screen.

Mobile responsiveness may stack later, but desktop visual approval requires horizontal layout first.

## 8. PREVIEW LAB CHANGES

Keep the working ES-module bootstrap from `a7516bd3...`.

Add/adjust preview controls to make the new design inspectable:
- Workflow Status 01..16
- Routing Topology
- Profile Ratio
- Appraiser count 1..4
- Active Appraiser slot
- Completion mode Complete/Incomplete
- Phase Calendar / deterministic `previewNow`
- optional Actor Simulation if required to inspect requester/approver/appraiser/HR appearances

Important:
- selecting M1_G1 + status02/07/12 must visibly show `Not applicable to selected route` rather than normal workflow progress;
- M1_G1 normal path must skip 02/07/12 in route display/progress;
- M1_M2_G1 may include them;
- unsupported G2 remains warning/fail-closed.

## 9. WHAT NOT TO DO

- Do not modify App794 Process Management.
- Do not alter App795 routing data.
- Do not create calendar schema/Kintone records.
- Do not deploy/upload App794.
- Do not claim production Appraiser 3/4 persistence.
- Do not conflate Workflow Approver with Scoring Appraiser.
- Do not use the 16-state catalog itself as an employee's route.
- Do not run real-user workflow/notification tests.

## 10. FILE / SCOPE BOUNDARY

Prefer existing files only:
- `src/ui/employee-part-a-ui.js`
- `src/styles/employee-part-a.css` or existing relevant stylesheet
- `preview/index.html`
- `tests/objective-save-validation.test.js` or one existing relevant UI test file
- `dist/mbo-employee-app.js` / CSS only as generated output when production source changes
- living evidence docs

Do not create another UI framework or duplicate renderer.

## 11. REQUIRED TESTS / LOCAL VERIFICATION

Add focused coverage for:

1. M1_G1 applicable path excludes 02/07/12.
2. M1_M2_G1 path includes 02/07/12.
3. M1_G1 + status02/07/12 returns route/status mismatch warning.
4. invalid/G2 topology remains fail-closed/unsupported.
5. status05 macro view = Stage1 Completed + Stage2 Upcoming/Locked/Waiting with Mid-Year Start shown.
6. status10 macro view = Stage2 Completed + Stage3 Upcoming/Locked/Waiting with Self Start shown.
7. phase date badges show correct deterministic Upcoming/Open/Closed state.
8. requester state renders requester action banner.
9. approver state renders workflow approver banner and requester input read-only.
10. appraiser stage visually separates Workflow Approval vs Scoring Action.
11. status15 HR banner; status16 Completed banner.
12. Objectives desktop renderer uses horizontal row/grid structure, not vertical stacked field sequence.
13. Mid-Year and Self desktop renderers are horizontal row/grid.
14. Part A/Part B appraiser matrices render 1..4 dynamic appraiser columns.
15. existing Difficulty blank-state fix remains passing.
16. existing Appraiser completeness/fail-closed tests remain passing.
17. preview has zero Kintone calls.

Execution budget:
- `npm test` once after implementation;
- `npm run ui:build` once;
- `npm run ui:preview` once;
- local browser smoke only, no Kintone UAT.

## 12. REQUIRED EVIDENCE

```text
APP794_EVALUATION_UI_V2_R5 = COMPLETE / BLOCKED
EXECUTION_STARTING_HEAD = exact parent after pulling task
M1_G1_ROUTE_STATUSES = 13 / actual
M1_G1_EXCLUDES_02_07_12 = PASS/FAIL
M1_M2_G1_INCLUDES_02_07_12 = PASS/FAIL
ROUTE_STATUS_MISMATCH_FAIL_CLOSED = PASS/FAIL
STATIC_16_STATUS_PERCENT_REMOVED = PASS/FAIL
STATUS05_WAITING_MIDYEAR_WINDOW = PASS/FAIL
STATUS10_WAITING_SELF_WINDOW = PASS/FAIL
FIVE_STAGE_PHASE_DATE_DISPLAY = PASS/FAIL
DETERMINISTIC_PREVIEW_NOW = PASS/FAIL
REQUESTER_ACTOR_VIEW = PASS/FAIL
APPROVER_ACTOR_VIEW = PASS/FAIL
SCORING_APPRAISER_SEPARATE_FROM_WORKFLOW_APPROVER = PASS/FAIL
HR_ACTOR_VIEW = PASS/FAIL
COMPLETED_READ_ONLY_VIEW = PASS/FAIL
OBJECTIVES_HORIZONTAL_DESKTOP = PASS/FAIL
MIDYEAR_HORIZONTAL_DESKTOP = PASS/FAIL
SELF_EVAL_HORIZONTAL_DESKTOP = PASS/FAIL
PARTA_DYNAMIC_1_TO_4_COLUMNS = PASS/FAIL
PARTB_DYNAMIC_1_TO_4_COLUMNS = PASS/FAIL
R4_DIFFICULTY_REGRESSION = PASS/FAIL
APPRAISER_COMPLETENESS_REGRESSION = PASS/FAIL
PRODUCTION_APPRAISER_COUNT_BINDING = PENDING_SCORING_RUNTIME_GATE
APPRAISER_3_4_PERSISTENCE_CLAIM = NOT_IMPLEMENTED
PHASE_CALENDAR_PERSISTENCE = NOT_IMPLEMENTED_PREVIEW_CONTRACT_ONLY
APP794_KINTONE_CALL_COUNT = 0
APP794_KINTONE_WRITE_COUNT = 0
WORKFLOW_ACTION_COUNT = 0
NPM_TEST = actual/PASS/FAIL
UI_BUILD = PASS/FAIL
PREVIEW_MAIN_UI_RENDER = PASS/FAIL
PREVIEW_KINTONE_CALL_COUNT = 0
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW THEN USER VISUAL PREVIEW; NO DEPLOY
```

## 13. SAFETY

- 0 Kintone writes.
- 0 App794 deploy/upload.
- 0 Process/schema/ACL/notification changes.
- 0 App795/App796/App797/App798/App800 writes.
- real-user workflow/notification prohibited.
- prior App794 authorization remains consumed/closed.

## 14. STOP CONDITION

Commit, push `ai/antigravity-wp002c`, keep local preview available if practical, and STOP.

Next gate = ChatGPT source review, then user visual preview again.
Do not continue to Scoring Runtime, Dashboard/Hoshin, Final UAT or Go-Live.
