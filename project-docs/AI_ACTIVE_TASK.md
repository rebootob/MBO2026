# AI ACTIVE TASK — APP794 EVALUATION UI V2 USER VISUAL PREVIEW GATE — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone only when local execution is needed
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed candidate: `68c8d59741e2d046aa26ed2d3577379a2be3605b`
> R4 independent review: **PASS_WITH_OBSERVATION**
> Kintone write/deploy authorization: **NONE**

## 1. CURRENT GATE

App794 Evaluation UI V2 local candidate is now approved for **USER VISUAL PREVIEW** only.

Critical path:
`Core ✅ -> Functional UAT ✅ -> UI/UX V1 ✅ -> Evaluation UI V2 Local Candidate ✅ -> User Visual Preview ⏳ -> Scoring Runtime/Persistence Closure -> Dashboard/Hoshin -> Final UAT -> Go-Live`

No App794 deployment is authorized.

## 2. R4 REVIEW RESULT

Independent review confirmed:
- fake Difficulty default `3` removed;
- blank Difficulty shows explicit empty placeholder;
- blank editable Difficulty carries `data-required="true"` and existing field-state logic renders Required/Yellow;
- stored values 1..4 continue to reflect actual record value;
- blank read-only Difficulty shows `ยังไม่ได้ระบุ / Not selected`, not Level 3;
- render does not mutate blank Difficulty to 3;
- ValidationEngine still rejects blank/out-of-range Difficulty and accepts 1..4;
- source and generated `dist/mbo-employee-app.js` are aligned for the R4 change;
- R4 diff contains no workflow/routing/Record_Key/scoring-formula/schema/App796 changes;
- 0 Kintone calls/writes/deploys reported.

Observation only:
- R4 evidence records an incorrect `R4_EXECUTION_STARTING_HEAD`; actual Git parent is `81e47354ee5edc57ab79a468fe89f742e5228e09`.
- Do not consume an Antigravity round solely to repair this documentation typo. Correct opportunistically in the next substantive evidence update.

## 3. USER VISUAL PREVIEW OBJECTIVE

The business owner must be able to click through and visually review the App794 UI before any deployment.

Preview must use the existing local Status Preview Lab and the same production UI renderer/components.

User must be able to inspect all App794 Process statuses:
1. `01 Draft Objective`
2. `02 First Manager Objective Review`
3. `03 Manager Objective Review`
4. `04 GM Objective Review`
5. `05 Objective Approved`
6. `06 Employee Mid-Year`
7. `07 First Manager Mid-Year Review`
8. `08 Manager Mid-Year Review`
9. `09 GM Mid-Year Review`
10. `10 Mid-Year Completed`
11. `11 Employee Self Evaluation`
12. `12 First Manager Final Evaluation`
13. `13 Manager Final Evaluation`
14. `14 GM Final Evaluation`
15. `15 HR Final Check`
16. `16 Completed`

Also allow visual selection of:
- Appraiser count 1 / 2 / 3 / 4;
- Active Appraiser slot within selected count;
- Operational vs Management competency set where already supported by preview;
- profile ratio 70/30, 60/40, 50/50;
- Complete vs Incomplete appraisal fixtures.

## 4. VISUAL ACCEPTANCE CHECKLIST

### Objectives
- wide text areas for Objective, Action Plan, Additional Agreement;
- Objective Count usable;
- Weight compact and clear;
- blank Difficulty = `-- กรุณาเลือกระดับความยาก / Please select --` and visually Required/Yellow;
- selected Difficulty 1..4 displays actual selected value;
- Total Weight feedback understandable;
- Hoshin context readable.

### Mid-Year
- wide text/card layout;
- Progress % understandable;
- Periodical Review, Mid-Year Result, Issue/Risk, Next Action have enough writing space;
- Mid-Year attachment evidence area visible and understandable.

### Self Evaluation
- Actual Result and Self Comment wide enough;
- Self Achievement understandable;
- Self Evaluation attachment evidence area visible and understandable.

### Appraiser Evaluation
- neutral labels `1st Appraiser` ... `4th Appraiser`;
- no scoring UI role names hardcoded as Manager/GM;
- Part A and Part B clearly separated;
- per-objective and per-competency comments understandable;
- Appraiser completion/data completion/process progress understandable;
- incomplete combined results visibly Pending, not certified;
- attachment evidence from Mid-Year/Self visible as context;
- slots 3/4 clearly preview/logical and not presented as live persistence.

### HR Final / Completed
- read-only presentation;
- Part A / Part B context understandable;
- stored result context only shown as final when completeness permits;
- incomplete result visibly Pending;
- evidence attachments visible;
- final process state/progress understandable.

### Overall UX
- 5-stage model is clear:
  `Objectives -> Mid-Year -> Self Evaluation -> Appraiser Evaluation -> HR Final / Completed`;
- no old 4-stage Year-End navigation confusion;
- long-form fields are comfortably wide;
- no misleading green state for required-but-empty fields;
- no visual role confusion between Workflow Approver and Scoring Appraiser.

## 5. PREVIEW SAFETY

Preview is LOCAL ONLY:
- Kintone API calls = 0
- Kintone writes = 0
- record writes = 0
- workflow actions = 0
- deploy/upload = 0
- schema/process/ACL/notification changes = 0
- real-user workflow/notification = prohibited

Do not request any Kintone write authorization for visual preview.

## 6. IF USER FINDS A VISUAL/UX DEFECT

Capture the exact:
- status selected;
- appraiser count/slot if relevant;
- profile/ratio if relevant;
- screenshot;
- expected behavior.

Bundle related visual corrections into one bounded local-only sprint. Do not deploy between preview corrections.

## 7. IF USER APPROVES VISUAL PREVIEW

Do NOT deploy immediately.

Next Control Plane gate is **Scoring Runtime/Persistence Closure**, including at minimum:
- production `Expected_Appraiser_Count` binding from approved configuration;
- reviewed physical persistence strategy for 3rd/4th Appraisers before claiming production support;
- scoring edit authority by stage/actor;
- Part A / Part B persistence and completeness rules;
- attachment runtime integration predeploy verification;
- no certified final result before all required appraisal inputs are complete.

Only after candidate review may a fresh, explicit user authorization be requested for App794 deployment/write work.

## 8. STOP CONDITION

Current next action = **USER VISUAL PREVIEW**.

Do not continue to Dashboard/Hoshin.
Do not deploy App794.
Do not mutate Kintone.
