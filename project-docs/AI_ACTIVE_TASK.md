# AI ACTIVE TASK — APP794 EVALUATION UI V2 R1 CORRECTION + STATUS PREVIEW LAB — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed candidate: `bfbbe1413ce761e689b3fa6c3f675493ab6f3399`
> Review result: **MUST_FIX_LOCAL**
> Kintone write/deploy authorization: **NONE**

# 1. REVIEW SUMMARY

The first App794 Evaluation UI V2 candidate is structurally useful and remained local-only, but it is NOT ready for user visual approval because several preview/runtime semantics can mislead the user.

Accepted from the first candidate:
- 5 visual macro screens exist;
- exact 16 status selector exists;
- local preview server exists;
- Appraiser labels are neutral (`1st`..`4th Appraiser`);
- Part A/Part B sections exist;
- COCE exclusion badge exists;
- source/dist/CSS/test changes are local only;
- 0 Kintone calls/writes/deploys reported;
- Process/routing/Record_Key/App796 were not changed.

Do NOT discard this candidate. Apply the minimum R1 corrections below in the existing architecture.

# 2. MUST FIX R1-01 — USE REAL APP794 SCORING FIELD CODES

The compatibility adapter currently reads invented/noncanonical fields such as:
- `Manager_PartA_Rating_*`
- `GM_PartA_Rating_*`
- `Manager_PartB_Score_*`
- `GM_PartB_Score_*`
- `Manager_Comment_PartA`
- `GM_Comment_PartA`

These do not match the current App794 scoring field families documented in source.

For existing physical slot 1 / slot 2 compatibility, use the existing field families:

Part A:
- Slot 1 achievement input: `Manager_Achievement_1..10`
- Slot 2 achievement input: `GM_Achievement_1..10`
- Slot 1 objective score/result when present: `Manager_Objective_Score_1..10`
- Slot 2 objective score/result when present: `GM_Objective_Score_1..10`
- Slot 1 comment: `Manager_Comment_1..10`
- Slot 2 comment: `GM_Comment_1..10`
- Combined result when present: `Average_Objective_Score_1..10`
- Weighted objective point when present: `MBO_Point_1..10`

Part B:
- Slot 1 rating: `Manager_Competency_Rating_1..N`
- Slot 2 rating: `GM_Competency_Rating_1..N`
- Slot 1 comment: `Manager_Competency_Comment_1..N`
- Slot 2 comment: `GM_Competency_Comment_1..N`
- Combined result: `Competency_Result_1..N`

Important:
- UI labels remain Appraiser 1 / Appraiser 2. Never display Manager/GM as scoring-role labels.
- Manager/GM field names are legacy physical storage only.
- Do not use `Manager_User` / `GM_User` as scoring-appraiser identity.
- Do not invent new Kintone fields.

# 3. MUST FIX R1-02 — SLOT 3/4 MUST NEVER ALIAS SLOT 2 PHYSICAL FIELDS

Current generated `data-code` logic maps every slot other than slot 1 to GM-prefixed fields. That is invalid for logical slots 3 and 4.

Required:
- Slot 1/2 may use the explicit legacy physical compatibility map above.
- Slot 3/4 are preview/logical only.
- Slot 3/4 must NOT receive any App794 physical `data-code`.
- Slot 3/4 preview controls must use preview-only state/attributes and must never be included in `syncFromDom()` Kintone-field synchronization.
- A future reviewed schema/persistence change will own real slots 3/4.

# 4. MUST FIX R1-03 — COMPLETENESS MUST BE DATA-BASED, NOT BOOLEAN/ANY-RATING BASED

Current appraiser completion can become complete when only one Part A rating exists or when a preview `slotXCompleted=true` flag is set, even if required Part B ratings are missing.

Implement deterministic completeness from actual logical inputs:

For each required appraiser slot:
- Part A complete only when every active Objective (1..Objective_Count) has its required appraiser Achievement/rating input.
- Part B complete only when every competency required by the active competency set has its appraiser rating, including COCE because COCE is evaluated even though excluded from numerical score.
- Comments remain optional unless an existing business rule says otherwise.
- Appraiser slot complete = Part A complete AND Part B complete.
- Overall final completeness = every required appraiser slot complete.
- No preview boolean may override missing required data and falsely produce COMPLETE.

Expose useful counts:
- `Part A: completed required ratings / total required ratings`
- `Part B: completed required ratings / total required ratings`
- `Appraisers: complete slots / required slots`

Incomplete data must show `Pending / Incomplete`; never show `Part A + Part B Verified Complete` when required data is missing.

# 5. MUST FIX R1-04 — COMPETENCY SET MUST MATCH VERIFIED SOURCE OF TRUTH

The candidate currently hardcodes a new 6-item list (`Achievement Orientation`, `Service Mind`, `Expertise`, `Teamwork`, `Integrity & Ethics`, COCE) that does NOT match the verified legacy/App796 competency semantics.

Use normalized verified business competency metadata:

Base items:
1. Adaptability
2. Problem Solving
3. Customer Focus
4. Additional Value Creation / Value Creation
5. Safety Awareness
6. Compliance / COCE — Evaluated, excluded from score
7. Leadership & People Management
8. Strategy & Coaching / Advising

Competency-set rendering:
- `COMP_SET_OPERATIONAL_V1` -> items 1..6; scored items 1..5; item 6 COCE evaluated but excluded.
- `COMP_SET_MANAGEMENT_V1` -> items 1..8; scored items 1..5, 7, 8; item 6 COCE evaluated but excluded.

Use `Competency_Set_Code` from the record/fixture to choose the set.
Do not import a Node-only module into browser UI merely to reuse constants if that creates bundle/runtime problems; a small browser-safe UI metadata definition is acceptable.

# 6. MUST FIX R1-05 — PROFILE RATIO SELECTOR MUST ACTUALLY WORK

The Preview Lab contains a 70/30, 60/40, 50/50 selector but currently does not use its value.

Required:
- Preview selector must set synthetic `PartA_Weight` and `PartB_Weight` values.
- 70/30 representative fixture should use operational competency set.
- 60/40 and 50/50 representative fixtures should use management competency set for preview coverage.
- HR Final screen must read `PartA_Weight` / `PartB_Weight` from the record/fixture.
- Remove hardcoded `70%` and `30%` from HR summary.
- Do not calculate/certify final production score in this R1.

# 7. MUST FIX R1-06 — ATTACHMENTS: NO FAKE FILES IN PRODUCTION PATH

Current Mid-Year/Self rows fall back to synthetic filenames when preview options are absent. This would make a real record appear to have attachments that do not exist.

Required behavior:

Production/read path:
- Read real FILE-field values from `MidYear_Attachment_1..10` and `Final_Attachment_1..10` when present.
- FILE values may be arrays of Kintone file objects; safely show actual file names/count.
- If no real files exist, show `No attachment / ไม่มีไฟล์แนบ` — never synthetic fallback filenames.

Preview path:
- Synthetic filenames are allowed ONLY when an explicit preview mode/fixture flag is active.
- Preview must include representative files so the user can see the design.
- For editable Mid-Year/Self preview, show a clearly marked preview-only attachment input/drop area or button for visual inspection.
- It must say/indicate preview-only; do not call Kintone file upload API.

Appraiser and HR screens:
- show Mid-Year and Self attachments as read-only evidence context.

Keep:
`ATTACHMENT_RUNTIME_INTEGRATION = PENDING_PREDEPLOY_GATE`

# 8. MUST FIX R1-07 — MID-YEAR NEXT ACTION FIELD IS CURRENTLY LOST

App794 has both:
- `MidYear_Issue_Risk_i`
- `MidYear_Next_Action_i`

The candidate currently renders only Issue/Risk and labels the same field as if it also represented Next Action.

Required:
- show Issue/Risk and Next Action as separate logical fields/areas;
- use the exact existing field codes;
- both should be wide long-text inputs in editable Mid-Year and read-only later.

# 9. MUST FIX R1-08 — WIDE-TEXT UX MUST MATCH USER INTENT

The candidate still places several long textareas side-by-side in spreadsheet-like tables. The user explicitly requested wide fields because users enter substantial text.

Preferred R1 presentation:
- Objectives, Mid-Year and Self Evaluation should use card-per-objective or maximum 2-column wide layout for long text.
- Objective, Action Plan, Additional Agreement, Periodical Review, Mid-Year Result, Issue/Risk, Next Action, Actual Result and Self Comment should be visually wide.
- Long textarea default min-height should be roughly 4–6 readable lines and resizable/auto-grow where practical.
- Numeric/rating fields may remain compact.
- Responsive narrow screens stack to one column.

Do this inside the existing production UI renderer; do not create a second production UI stack.

# 10. MUST FIX R1-09 — HR FINAL MUST BE READ-ONLY AND MUST NOT DUPLICATE APPRAISER SCREEN/NAV

Current `_renderScreenHrFinal()` calls `_renderScreenAppraiserEval()` directly, which duplicates navigation and can render interactive appraiser controls.

Refactor minimally:
- share a reusable appraiser/scoring content renderer if helpful;
- Appraiser Evaluation screen may be interactive ONLY in explicit Preview Lab simulation for the selected active preview slot;
- HR Final / Completed must be strictly read-only presentation;
- do not duplicate stage navigation inside HR screen;
- HR screen must include read-only attachment evidence summary.

Since production scoring actor binding/persistence is not certified yet:
- outside explicit Preview Lab mode, do not portray unverified scoring controls as safely writable;
- production-path candidate should render current scoring values read-only until the later scoring runtime integration gate authorizes actual write semantics.

# 11. MUST FIX R1-10 — ACTIVE PREVIEW APPRAISER SLOT CONTROL MUST WORK

Preview currently reads the `Active Editor Slot` selector but does not use it.

Required:
- In Appraiser Evaluation Preview, only the selected active simulated appraiser slot is editable.
- Other slots are visibly read-only/disabled.
- Selecting slot 3/4 edits preview-only state only.
- Do not claim this proves production actor authorization.

# 12. MUST FIX R1-11 — PROCESS PROGRESS MUST DIFFER WITHIN A MACRO STAGE

Current progress is identical for every status within a macro stage (e.g. 01 Draft and 05 Approved both 20%; 15 HR Final and 16 Completed both 100%). This is misleading.

Use an exact status-based deterministic lookup. Suggested simple progression:
- 01=5
- 02=10
- 03=15
- 04=20
- 05=25
- 06=30
- 07=35
- 08=40
- 09=45
- 10=50
- 11=60
- 12=70
- 13=80
- 14=90
- 15=95
- 16=100

The label must continue to state this is PROCESS PROGRESS, not performance score.
Unknown status must not silently appear as normal Objectives progress; fail closed/configuration error presentation.

# 13. MUST FIX R1-12 — PREVIEW FIXTURES MUST USE REAL FIELD SEMANTICS

Replace invented mock physical scoring fields with either:
- real App794 legacy physical field names for slots 1/2; or
- explicit preview-only normalized data for slots 3/4.

Also include:
- `PartA_Weight`
- `PartB_Weight`
- `Competency_Set_Code`
- explicit synthetic Mid-Year/Self attachment fixture arrays

Keep synthetic identities clearly synthetic.

# 14. EVIDENCE CORRECTION

The first candidate evidence recorded:
`EXECUTION_STARTING_HEAD = b5f7f3d9ed3015fbe8e45300eb230ed8b2f9f1b4`

Git history shows the actual parent/task manifest commit was:
`b5f7f3d38112a55dc0db6f2cf293c92601281b7b`

Correct this evidence in the R1 review package. Do not rewrite Git history.

The following prior PASS claims must be reclassified for the first candidate until R1 passes:
- `APPRAISER_COMPLETION_GATE`
- `DATA_COMPLETION_GATE`
- `MIDYEAR_ATTACHMENT_UI_GATE`
- `SELF_EVAL_ATTACHMENT_UI_GATE`
- `WIDE_TEXT_UX_GATE`
- `PART_A_UI_GATE`
- `PART_B_UI_GATE`
- `INCOMPLETE_FINAL_SCORE_FAIL_CLOSED_UI`

# 15. FILE / SCOPE BOUNDARIES

Prefer modifying only existing candidate files:
- `src/ui/employee-part-a-ui.js`
- `src/styles/mbo-employee.css`
- `preview/index.html`
- `tests/objective-save-validation.test.js`
- generated `dist/mbo-employee-app.js`
- generated `dist/mbo-employee.css`
- living evidence docs

Do not add another production renderer.
No App794/App795/App796/App797/App798/App800 write or deploy.
No Process/ACL/schema/notification change.
No real workflow/notification test.
No real employee data.

# 16. REQUIRED R1 TESTS

Add/adjust focused tests proving:
1. exact 16 visual status mapping preserved;
2. exact status progress values, including status15=95 and status16=100;
3. unknown visual status fails closed rather than normal Objectives presentation;
4. physical slot1/2 compatibility reads exact real field names;
5. slot3/4 have no physical Kintone data-code mapping;
6. Part A completeness requires all active objectives for every required appraiser;
7. Part B completeness requires all applicable competency ratings including COCE evaluation;
8. missing one required Part B rating keeps final incomplete;
9. operational set renders 6 items; management set renders 8 items;
10. competency names match verified normalized business names;
11. 70/30, 60/40, 50/50 weights render from record/fixture, not hardcoded;
12. production attachment path with no file shows no synthetic filename;
13. preview attachment fixture shows representative synthetic files only in preview;
14. `MidYear_Next_Action_i` renders separately;
15. HR final scoring detail is read-only and does not duplicate nav;
16. active preview slot selector behavior is functional;
17. slots 3/4 remain preview-only;
18. XSS escaping/topology fail-closed regressions remain intact;
19. production bundle excludes preview server runtime.

# 17. EXECUTION BUDGET

Run exactly after implementation is complete:
1. `npm test` once.
2. `npm run ui:build` once.
3. `npm run ui:preview` once with one local smoke sufficient to verify page/selectors/render.

No Kintone browser UAT.

# 18. REQUIRED R1 EVIDENCE

Append a concise R1 block:

```text
APP794_EVALUATION_UI_V2_R1 = COMPLETE / BLOCKED
REVIEWED_FIRST_CANDIDATE = bfbbe1413ce761e689b3fa6c3f675493ab6f3399
R1_EXECUTION_STARTING_HEAD = actual
REAL_PHYSICAL_SCORING_FIELD_ADAPTER = PASS/FAIL
SLOT3_4_NO_PHYSICAL_ALIAS = PASS/FAIL
APPRAISER_COMPLETENESS_STRICT = PASS/FAIL
PART_A_DATA_COMPLETION = PASS/FAIL
PART_B_DATA_COMPLETION = PASS/FAIL
COMPETENCY_SOURCE_ALIGNMENT = PASS/FAIL
OPERATIONAL_COMPETENCY_COUNT = 6 / actual
MANAGEMENT_COMPETENCY_COUNT = 8 / actual
COCE_EVALUATED_EXCLUDED = PASS/FAIL
PROFILE_RATIO_SELECTOR_FUNCTIONAL = PASS/FAIL
HR_WEIGHT_DISPLAY_CONFIGURATION_DRIVEN = PASS/FAIL
PRODUCTION_FAKE_ATTACHMENT_COUNT = 0 / actual
PREVIEW_ATTACHMENT_FIXTURE = PASS/FAIL
MIDYEAR_NEXT_ACTION_RENDERED = PASS/FAIL
WIDE_TEXT_CARD_UX = PASS/FAIL
HR_FINAL_READ_ONLY = PASS/FAIL
HR_FINAL_DUPLICATE_NAV_COUNT = 0 / actual
ACTIVE_PREVIEW_SLOT_FUNCTIONAL = PASS/FAIL
STATUS_PROGRESS_EXACT_16 = PASS/FAIL
STATUS15_PROGRESS = 95 / actual
STATUS16_PROGRESS = 100 / actual
UNKNOWN_VISUAL_STATUS_FAIL_CLOSED = PASS/FAIL
APPRAISER_3_4_PERSISTENCE_CLAIM = NOT_IMPLEMENTED
ATTACHMENT_RUNTIME_INTEGRATION = PENDING_PREDEPLOY_GATE
APP794_KINTONE_CALL_COUNT = 0
APP794_KINTONE_WRITE_COUNT = 0
APP796_MUTATION_COUNT = 0
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

# 19. ROLLBACK

Git/local only. If R1 fails, do not touch Kintone. Preserve deployed App794 revision 39 unchanged and correct via a normal follow-up commit only.

# 20. STOP

After R1 implementation + tests + build + preview smoke + evidence:
- commit;
- push same branch;
- STOP.

Do NOT deploy App794.
Do NOT continue Dashboard/Hoshin implementation.
The next gate remains ChatGPT review, then user clickable visual preview.