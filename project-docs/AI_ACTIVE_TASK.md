# AI ACTIVE TASK — APP794 EVALUATION UI V2 R6 LIFECYCLE APPRAISER ROUTE + BILINGUAL UX — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed R5 implementation HEAD: `e1a8b49d02c2d9484a4fa97146c2faec1ca80e4e`
> Canonical clarification commit: `8f5f317205b910288857931a8d873d45541abee8`
> Kintone write/deploy authorization: **NONE**

## 1. CURRENT GATE

R5 is **NOT user-visually approved**. The user clarified that the R5 actor model still contains a wrong business assumption.

Critical path:
`Evaluation UI V2 R5 -> R6 Lifecycle Appraiser Route + Bilingual UX -> ChatGPT Review -> User Visual Preview -> Scoring/Route Persistence Closure -> Dashboard/Hoshin -> Final UAT -> Go-Live`

LOCAL ONLY. Do not deploy or mutate Kintone.

## 2. USER-CONFIRMED BUSINESS CORRECTION

### 2.1 Appraisers belong to the whole MBO journey, not only Stage 4

The configured appraiser sequence is attached to the MBO record for the entire annual lifecycle:

`Objectives -> Mid-Year -> Self Evaluation -> Appraiser Evaluation -> HR Final / Completed`

Do **not** create the impression that Appraiser 1/2/3/4 only appear at Final Evaluation.

The same sequence remains visible/contextual throughout all five stages. Their permitted action varies by stage:
- Objectives: review/approval sequence after requester submits.
- Mid-Year: review/approval sequence after requester submits.
- Self Evaluation: requester enters self result; same appraiser route remains visible as the next evaluation chain.
- Appraiser Evaluation: the same appraisers perform Part A/Part B scoring/evaluation according to configured rules.
- HR Final/Completed: same evaluation route remains visible read-only as audit/context; HR Final remains a separate HR action.

Do not invent a different appraiser set for each stage.

### 2.2 Number of appraisers is not fixed at 2

Logical capacity remains **1..4 configured appraiser slots**.

Do not assume every employee has exactly 2.
Examples the UI/architecture must be able to represent without changing slot labels:
- 1 appraiser only;
- 2 appraisers;
- 3 appraisers;
- 4 appraisers.

The organizational position of a person is NOT the appraiser slot name. A single configured evaluator could organizationally be GM, VP, President, or another approved evaluator, but the UI label is still `1st Appraiser` / `ผู้ประเมินลำดับที่ 1`.

Current live routing facts remain unchanged; this task does not claim App795 physical generic 1..4 persistence is already complete.

### 2.3 Workflow technical names are compatibility details, not user-facing role labels

Current source/physical fields/statuses include legacy names such as:
- `First_Manager_User`
- `Manager_User`
- `GM_User`
- `03 Manager Objective Review`
- `04 GM Objective Review`

Do NOT rename Kintone Process or schema in this local task.

Instead add a UI adapter that resolves the applicable sequence into generic ordinal slots.

Compatibility expectation for currently supported technical topologies:
- `M1_G1`: populated technical route sequence is rendered as `1st Appraiser`, `2nd Appraiser`.
- `M1_M2_G1`: populated technical route sequence is rendered as `1st Appraiser`, `2nd Appraiser`, `3rd Appraiser`.
- Preview must also support generic fixture sequences of 1..4 people without needing Manager/GM titles.

Do not expose the technical field name as business meaning.

## 3. APPROVAL ROUTE SUMMARY — MUST BECOME ROLE-NEUTRAL

Current `_renderRouteContext()` is wrong for user-facing business UI because it displays:
- `1st Manager`
- `Manager`
- `GM`

Replace the main heading and role labels.

Preferred title:
`🔗 เส้นทางผู้ประเมินและอนุมัติ / Evaluation & Approval Route`

Each route member must be displayed as ordinal slot only:
- `ผู้ประเมินลำดับที่ 1 / 1st Appraiser`
- `ผู้ประเมินลำดับที่ 2 / 2nd Appraiser`
- `ผู้ประเมินลำดับที่ 3 / 3rd Appraiser`
- `ผู้ประเมินลำดับที่ 4 / 4th Appraiser`

Display actual resolved person's name/account beneath the slot.

HR is separate and should display:
`ตรวจสอบขั้นสุดท้ายโดย HR / HR Final Check`

Do not display `Manager`, `GM`, `VP`, `President`, or other organizational title as the route slot heading. If organizational title is later shown as optional metadata, it must be secondary context only and never determine the route label.

## 4. SAME APPRAISER ROUTE MUST APPEAR THROUGH ALL FIVE MACRO STAGES

Add a compact persistent route/progress component usable at every stage.

Example for a 3-person route:

`Requester -> 1st Appraiser -> 2nd Appraiser -> 3rd Appraiser -> HR Final`

For each stage, visually indicate appraiser state such as:
- `Waiting / รอดำเนินการ`
- `Current / กำลังดำเนินการ`
- `Reviewed / ตรวจสอบแล้ว`
- `Scored / ให้คะแนนแล้ว`
- `Completed / เสร็จแล้ว`

Do not falsely mark scoring complete during Objectives/Mid-Year. Stage-specific action state must be truthful.

At requester-owned states, show the route but highlight Requester as current actor.
At appraiser-owned states, highlight the correct ordinal appraiser slot derived from route order, not from organizational title text.
At waiting boundaries 05/10, show the full route read-only and next HR calendar opening date.
At HR Final, route is read-only and HR is highlighted.

## 5. USER-FACING STATUS GUIDANCE MUST STOP SAYING MANAGER/GM

Current `getStatusGuidance()` contains phrases such as:
- `ส่งให้ Manager`
- `Manager review`
- `GM review`
- `First Manager`

Replace user-facing guidance with route-aware ordinal language.

Examples:
- requester submit: `ส่งให้ผู้ประเมินลำดับถัดไป / Submit to next Appraiser`
- first review step: `อยู่ระหว่างการพิจารณาโดยผู้ประเมินลำดับที่ 1 / Under review by 1st Appraiser`
- second review step: `... 2nd Appraiser`
- third review step: `... 3rd Appraiser`

The raw Kintone technical status may be shown only as small diagnostic metadata in Preview/technical mode if useful; do not make `Manager Objective Review` the main business-facing status title.

## 6. BILINGUAL THAI + ENGLISH IS MANDATORY

This system is shared by Thai and Japanese staff. User-facing UI must consistently provide **Thai + English**.

Default presentation rule:
- Thai first where practical;
- English immediately adjacent or directly below;
- do not create Thai-only navigation/actions;
- Japanese translation is not required in this task.

### Required five-stage navigation labels

1. `เป้าหมาย / Objectives`
2. `ทบทวนกลางปี / Mid-Year`
3. `ประเมินตนเอง / Self Evaluation`
4. `การประเมินโดยผู้ประเมิน / Appraiser Evaluation`
5. `HR ตรวจสอบขั้นสุดท้าย / เสร็จสิ้น / HR Final / Completed`

Also make bilingual:
- phase state badges: `กำลังเปิด / Open`, `ยังไม่เปิด / Upcoming`, `ปิดแล้ว / Closed`, `เสร็จแล้ว / Completed`;
- actor banners;
- route summary labels;
- status guidance;
- completion/result badges;
- preview selector labels where user-facing;
- important buttons/help text within the custom UI.

Technical identifiers such as `M1_G1` may remain technical English codes.

## 7. PRESERVE ACCEPTED R5 REQUIREMENTS

Do not regress:
- five macro stages separate from physical statuses;
- route-aware progress;
- M1_G1 excludes 02/07/12;
- M1_M2_G1 includes 02/07/12;
- G2/invalid fail-closed;
- status05 waiting for Mid-Year HR window;
- status10 waiting for Self Evaluation HR window;
- HR five-stage Start/End preview calendar contract;
- deterministic preview date;
- desktop horizontal row/grid layout;
- wide long-text fields;
- Mid-Year and Self attachments;
- Difficulty blank required state;
- Part A/Part B appraiser matrices;
- logical 1..4 appraiser capacity;
- incomplete final results fail-closed.

## 8. IMPORTANT ARCHITECTURE BOUNDARY

Do not conflate these layers:

1. **Business appraiser/evaluator sequence** — user-facing ordinal 1..4, lifecycle-wide.
2. **Kintone workflow authorization/process actor** — technical/native security boundary.
3. **Legacy physical field names** — compatibility storage currently named Manager/GM.

The same person may participate in more than one layer, but the UI label must not infer organizational position from technical field/status names.

Do not claim that production generic 1..4 routing/persistence is complete. That remains a later reviewed runtime/persistence gate.

## 9. PREVIEW LAB REQUIREMENTS

Keep local Preview Lab and add enough fixture control to inspect:
- route with 1 appraiser;
- route with 2 appraisers;
- route with 3 appraisers;
- route with 4 appraisers;
- same appraiser sequence visible at Objectives, Mid-Year, Self Evaluation, Appraiser Evaluation, HR Final;
- current actor advances correctly through requester/appraiser/HR examples;
- 70/30, 60/40, 50/50 still work;
- complete/incomplete still work;
- bilingual five-stage menu visible.

Preview fixture names may include examples such as a GM/VP/President, but route headings must remain Appraiser 1/2/3/4.

No Kintone calls.

## 10. FOCUSED TESTS

Add/adjust coverage proving at minimum:

1. route summary contains `1st Appraiser` / bilingual equivalent and no role heading `Manager`, `GM`, `1st Manager`;
2. M1_G1 existing physical users map to ordinal Appraiser 1/2 in user UI;
3. M1_M2_G1 maps to ordinal Appraiser 1/2/3;
4. preview generic 1-person route renders exactly one Appraiser slot;
5. preview 3-person and 4-person routes render exact slot count;
6. the same resolved appraiser sequence is visible across all five macro stages;
7. Objective/Mid-Year guidance uses `next Appraiser`, not `Manager/GM` business wording;
8. actor banner identifies the applicable ordinal appraiser rather than Manager/GM;
9. five macro-stage labels are Thai + English;
10. phase calendar state labels are Thai + English;
11. raw technical status is not the dominant business-facing status label;
12. all accepted R5 route/calendar/horizontal/Difficulty/completeness regressions pass;
13. Preview Kintone call count = 0.

Execution budget:
- `npm test` once after implementation;
- `npm run ui:build` once;
- `npm run ui:preview` once;
- local browser smoke only.

## 11. SAFETY

- Kintone calls/writes: 0
- App794 upload/deploy: 0
- Process/schema/ACL/notification changes: 0
- App795/App796/App797/App798/App800 writes: 0
- no real-user workflow/notification
- prior App794 deployment authorization remains consumed/closed

## 12. REQUIRED EVIDENCE

```text
APP794_EVALUATION_UI_V2_R6 = COMPLETE / BLOCKED
EXECUTION_STARTING_HEAD = exact parent after pulling task
LIFECYCLE_APPRAISER_SEQUENCE = PASS/FAIL
ROUTE_SUMMARY_ORDINAL_APPRAISERS = PASS/FAIL
ROUTE_SUMMARY_MANAGER_GM_HEADINGS = 0 / actual
M1_G1_APPRAISER_SLOT_MAPPING = PASS/FAIL
M1_M2_G1_APPRAISER_SLOT_MAPPING = PASS/FAIL
GENERIC_ROUTE_1_TO_4_PREVIEW = PASS/FAIL
SAME_APPRAISERS_VISIBLE_ALL_5_STAGES = PASS/FAIL
GUIDANCE_MANAGER_GM_BUSINESS_WORDING = 0 / actual
ACTOR_BANNER_ORDINAL_APPRAISER = PASS/FAIL
FIVE_STAGE_THAI_ENGLISH = PASS/FAIL
PHASE_STATE_THAI_ENGLISH = PASS/FAIL
R5_ROUTE_AWARE_REGRESSION = PASS/FAIL
R5_HORIZONTAL_LAYOUT_REGRESSION = PASS/FAIL
R4_DIFFICULTY_REGRESSION = PASS/FAIL
APPRAISER_COMPLETENESS_REGRESSION = PASS/FAIL
PRODUCTION_GENERIC_ROUTE_PERSISTENCE = PENDING_LATER_GATE
APPRAISER_3_4_PERSISTENCE_CLAIM = NOT_IMPLEMENTED
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

## 13. STOP CONDITION

Commit, push `ai/antigravity-wp002c`, keep Preview Lab available if practical, and STOP.

Do not deploy App794.
Do not modify Kintone.
Do not continue to Dashboard/Hoshin until this visual/business model passes user review.
