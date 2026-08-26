# AI ACTIVE TASK — APP794 EVALUATION UI V2 R3 CLOSURE — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed R2 candidate: `4fafc85c2fd54ed1f392fa5f306a8935f0cfe634`
> R2 review result: **MUST_FIX_LOCAL_R3**
> Kintone write/deploy authorization: **NONE**

## 1. NORTH STAR / CURRENT GATE

Core workflow remains frozen and unchanged.

Current critical path:
`Core Function ✅ -> Functional UAT ✅ -> UI/UX V1 ✅ -> App794 Evaluation UI V2 ⏳ -> User Visual Preview -> Scoring Runtime/Persistence Closure -> Dashboard/Hoshin -> Final UAT -> Go-Live`

R2 substantially improved the visual candidate and remains local-only, but it is not yet safe for user visual approval because three source/runtime semantics can mislead the preview and one Create-flow regression would break new-record startup if deployed.

Keep all accepted R2 work. Apply only the minimum corrections below.

## 2. R3-01 — CREATE FLOW MUST REMAIN USABLE BEFORE SCORING CONFIG EXISTS

### Defect
`EmployeePartAUI.render()` currently validates `Competency_Set_Code` and `PartA_Weight` / `PartB_Weight` before rendering the Create Employee Lookup section.

On a real `app.record.create.show`, those scoring snapshot fields are blank until the user searches/verifies the employee and `onLookupEmployee()` resolves App796. Therefore the R2 candidate would render `CONFIGURATION ERROR` immediately and never expose the employee Search control.

This is a real regression if deployed.

### Required behavior
- For `isCreate === true && isEmployeeVerified === false`:
  - render the employee lookup section normally;
  - render the locked/unverified Objective area as appropriate;
  - do **not** fail on missing profile/competency/weight snapshot yet because lookup has not happened.
- After employee lookup succeeds and `isEmployeeVerified === true`:
  - enforce exact `Competency_Set_Code` fail-closed validation;
  - enforce valid `PartA_Weight + PartB_Weight = 100` fail-closed validation.
- On lookup failure:
  - keep/re-render a retryable Lookup UI with the lookup error message;
  - do not replace the whole page with a scoring configuration error merely because snapshot fields remain blank.
- Existing saved records (edit/detail) with missing/invalid scoring snapshot remain fail-closed.

Do not change `src/main-mbo-app.js` unless absolutely necessary. Prefer fixing validation placement/order inside the existing UI renderer.

## 3. R3-02 — STALE SCORE/RESULT VALUES MUST NOT LOOK VALID WHEN APPRAISAL IS INCOMPLETE

### Defect
R2 correctly shows the overall `Result Pending / Incomplete` banner, but per-objective result context still displays stored:
- `Manager_Objective_Score_i`
- `GM_Objective_Score_i`
- `Average_Objective_Score_i`
- `MBO_Point_i`

and Part B may display `Competency_Result_i`, even when required appraiser ratings are incomplete.

The R2 test only checks that a Pending banner exists somewhere; it does not prove stale calculated values are withheld/clearly marked pending.

### Required behavior
When `appraiserInfo.isFullyComplete === false`:
- Combined/certified result presentation must clearly say `Pending / Incomplete`.
- Do not portray `Average_Objective_Score_i`, `MBO_Point_i`, or `Competency_Result_i` as current final results.
- If legacy per-appraiser stored score values are shown for diagnostic/read-only context, label them explicitly as stored/non-final context; they must not be visually presented as completed result.
- COCE remains evaluated and excluded from numerical score.

When all required appraiser data is complete:
- existing stored result fields may be shown read-only;
- do not add new certified client-side production calculation in this sprint.

## 4. R3-03 — HR FINAL MUST SHOW THE SAME READ-ONLY RESULT CONTEXT

### Defect
`_renderReadOnlyAppraiserBreakdown()` currently shows ratings/comments/evidence but omits the R2-required result fields.

### Required HR Final / Completed presentation
For each Objective, read-only display when appropriate:
- `Manager_Objective_Score_i` as 1st Appraiser stored score context;
- `GM_Objective_Score_i` as 2nd Appraiser stored score context;
- `Average_Objective_Score_i` combined result only when completeness permits;
- `MBO_Point_i` only when completeness permits.

For each Competency:
- `Competency_Result_i` only when completeness permits;
- COCE badge stays `Evaluated / Excluded from Score`.

If appraisal is incomplete, HR breakdown must visibly remain Pending and must not certify stale combined result values.

HR Final remains strictly read-only.

## 5. R3-04 — PREVIEW-ONLY SLOT 3/4 EDITING MUST ACTUALLY USE PREVIEW STATE

### Defect
Slots 3/4 correctly have no physical Kintone `data-code`, but current controls use `data-preview-slot` without an event-binding path. They can look editable while changes are not committed to preview logical state and are lost on rerender.

### Required behavior
In explicit Preview Lab mode only:
- selected active slot 3/4 Rating/Comment controls update preview-only logical state;
- rerendering within the Preview Lab must preserve those simulated values for that current fixture session where practical;
- no slot3/4 physical Kintone field code;
- no `syncFromDom()` persistence into App794;
- no Kintone API call.

If implementing persistent preview editing would materially complicate the candidate, acceptable minimum is to remove misleading editability from slot3/4 and label them `Preview Logical Slot — Read-only Sample`. Do not leave controls appearing functionally editable when they are not.

## 6. R3-05 — EVIDENCE PROVENANCE CORRECTION

R2 evidence currently records:
`R2_EXECUTION_STARTING_HEAD = fc0bca16773347f3b5eb423fb886dd6e8ebaaad1`

Actual Git parent of the R2 execution commit is:
`fc0bca16d1258e974d7f7063b88a217c5a1a65cc`

Correct the living evidence without rewriting Git history.

## 7. ACCEPTED R2 FEATURES — PRESERVE

Do not regress:
- exact 16 status visual mapping;
- 5-stage Process Progress;
- Objectives / Mid-Year / Self wide-card UX;
- separate MidYear Issue/Risk and Next Action;
- real attachment names or `No attachment`; preview-only synthetic evidence only in explicit preview mode;
- Appraiser neutral ordinal labels 1st..4th;
- slot1/2 real legacy physical scoring field adapter;
- slot3/4 zero physical alias;
- strict Part A + Part B completeness including COCE evaluation;
- Operational 6 / Management 8 competency sets;
- invalid competency set fail-closed after configuration should exist;
- 70/30, 60/40, 50/50 preview ratios;
- invalid/missing weight config fail-closed after configuration should exist;
- per-objective Appraiser comments;
- per-competency Appraiser comments;
- Appraiser/HR evidence summaries;
- old 4-step Year-End secondary navigation removed;
- active preview slot constrained to 1..selected appraiser count;
- production scoring controls remain read-only until the later scoring-runtime gate;
- `PRODUCTION_APPRAISER_COUNT_BINDING = PENDING_SCORING_RUNTIME_GATE`;
- `APPRAISER_3_4_PERSISTENCE_CLAIM = NOT_IMPLEMENTED`;
- `ATTACHMENT_RUNTIME_INTEGRATION = PENDING_PREDEPLOY_GATE`.

## 8. REQUIRED R3 TESTS

Add only focused tests needed to close the findings:

1. `isCreate=true`, unverified record with blank `Competency_Set_Code`, `PartA_Weight`, `PartB_Weight` renders Employee Lookup and does not render scoring CONFIGURATION ERROR.
2. After simulated successful lookup/verified state, invalid competency set fails closed.
3. After simulated successful lookup/verified state, invalid/missing weight ratio fails closed.
4. Lookup failure with blank scoring snapshot remains retryable and retains Lookup UI.
5. Incomplete appraisal + stale `Average_Objective_Score_i` / `MBO_Point_i` does not display them as valid final result.
6. Incomplete appraisal + stale `Competency_Result_i` does not display it as valid final result.
7. Complete appraisal may display existing stored combined Part A / Part B results read-only.
8. HR Final breakdown displays Objective stored score context and complete combined result context read-only.
9. HR Final incomplete state hides/marks combined result pending.
10. slot3/4 Preview behavior is truthful: preview-only state updates OR read-only sample labeling; zero physical data-code remains.
11. R2 accepted regressions remain passing: 16 statuses/progress, wide cards, attachments, per-item comments, invalid config gates, topology/XSS, no old 4-step nav.

## 9. FILE / SCOPE BOUNDARY

Prefer modifying only:
- `src/ui/employee-part-a-ui.js`
- `preview/index.html` only if needed for truthful slot3/4 preview state
- `tests/objective-save-validation.test.js`
- generated `dist/mbo-employee-app.js`
- living evidence docs

CSS only if a small visual label/state is needed.

Do not change frozen workflow/routing/Record_Key logic.
Do not add schema fields.
Do not mutate App796.
Do not add another production renderer/framework.

## 10. SAFETY / AUTHORIZATION

- **0 Kintone calls required**.
- **0 Kintone writes**.
- No App794 upload/deploy.
- No Process/schema/ACL/notification changes.
- No App795/App796/App797/App798/App800 writes.
- No workflow actions.
- No real-user workflow/notification.
- Prior App794 deployment authorization is consumed/closed and cannot be reused.

## 11. EXECUTION BUDGET

After implementation is complete, run exactly:
1. `npm test` once.
2. `npm run ui:build` once.
3. `npm run ui:preview` once with one local smoke sufficient to verify Preview Lab loads and the Appraiser screen renders.

Do not run Kintone browser UAT.

## 12. REQUIRED R3 EVIDENCE

Append a concise block:

```text
APP794_EVALUATION_UI_V2_R3 = COMPLETE / BLOCKED
REVIEWED_R2_CANDIDATE = 4fafc85c2fd54ed1f392fa5f306a8935f0cfe634
R3_EXECUTION_STARTING_HEAD = exact parent after pulling this task
CREATE_PRELOOKUP_UI_AVAILABLE = PASS/FAIL
CREATE_PRELOOKUP_SCORING_GATE_DEFERRED = PASS/FAIL
POSTLOOKUP_INVALID_COMPETENCY_FAIL_CLOSED = PASS/FAIL
POSTLOOKUP_INVALID_WEIGHT_FAIL_CLOSED = PASS/FAIL
LOOKUP_FAILURE_RETRY_UI = PASS/FAIL
INCOMPLETE_PARTA_COMBINED_RESULT_PENDING = PASS/FAIL
INCOMPLETE_PARTB_COMBINED_RESULT_PENDING = PASS/FAIL
COMPLETE_STORED_RESULT_CONTEXT = PASS/FAIL
HR_PARTA_RESULT_CONTEXT_READ_ONLY = PASS/FAIL
HR_PARTB_RESULT_CONTEXT_READ_ONLY = PASS/FAIL
HR_INCOMPLETE_RESULT_PENDING = PASS/FAIL
SLOT3_4_PREVIEW_STATE_TRUTHFUL = PASS/FAIL
SLOT3_4_NO_PHYSICAL_ALIAS = PASS/FAIL
R2_EVIDENCE_PARENT_SHA_CORRECTED = PASS/FAIL
PRODUCTION_APPRAISER_COUNT_BINDING = PENDING_SCORING_RUNTIME_GATE
APPRAISER_3_4_PERSISTENCE_CLAIM = NOT_IMPLEMENTED
ATTACHMENT_RUNTIME_INTEGRATION = PENDING_PREDEPLOY_GATE
APP794_KINTONE_CALL_COUNT = 0
APP794_KINTONE_WRITE_COUNT = 0
WORKFLOW_ACTION_COUNT = 0
NPM_TEST = actual/PASS/FAIL
UI_BUILD = PASS/FAIL
CLASSIC_BUNDLE_PARSE = PASS/FAIL
PREVIEW_LAB_LOAD = PASS/FAIL
PREVIEW_KINTONE_CALL_COUNT = 0
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW; IF PASS USER VISUAL PREVIEW; NO DEPLOY
```

## 13. WHAT / WHERE / HOW / WHY / IMPACT / RISK / TEST / ROLLBACK

**What:** close the final pre-preview Create-flow and score-presentation defects.

**Where:** existing App794 Evaluation UI V2 renderer, local Preview Lab only if necessary, focused tests, generated bundle, living evidence.

**How:** move/configure validation so it occurs only when scoring snapshot is expected to exist; make incomplete results explicitly pending; add missing HR read-only result context; make slots3/4 preview behavior truthful.

**Why:** prevent a deployed Create-page dead end and prevent the user from visually approving stale/misleading score presentation.

**Impact:** local candidate only; no live Kintone impact.

**Risk:** UI regression in existing Objective/Mid/Self or fail-closed semantics. Mitigate with focused regression tests and one build/preview smoke.

**Test:** section 8 + one full npm test/build/preview pass.

**Rollback:** revert only the R3 implementation commit to the reviewed R2 candidate `4fafc85c2fd54ed1f392fa5f306a8935f0cfe634`; no Kintone rollback is applicable.

## 14. STOP CONDITION

Commit, push the same branch, and STOP.

Do not deploy.
Do not continue to Dashboard/Hoshin.
Next gate = ChatGPT R3 source review. Only after PASS should the user be asked to open the Status Preview Lab for visual approval.
