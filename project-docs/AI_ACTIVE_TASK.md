# AI ACTIVE TASK — APP794 EVALUATION UI V2 R2 CORRECTION — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed R1 candidate: `9201d5ef88b783846822d7d2469873715272e7bb`
> R1 review result: **MUST_FIX_LOCAL_R2**
> Kintone write/deploy authorization: **NONE**

## 1. REVIEW SUMMARY

R1 fixed the major first-pass defects: real slot1/2 physical field names, slots3/4 no physical alias, strict rating completeness, verified 6/8 competency sets, working ratio selector, no production fake-file fallback, separate Mid-Year Next Action, Mid/Self wide cards, HR read-only breakdown, active preview slot, exact 16-status process progress, and unknown-status fail-closed.

However R1 is NOT ready for user visual approval because several UI/data-semantic gaps remain. Keep the R1 architecture and apply the smallest local-only corrections below.

## 2. MUST FIX R2-01 — OBJECTIVES MUST ALSO USE WIDE CARD UX

The user explicitly requires wide input areas because employees enter substantial text. R1 converted Mid-Year and Self Evaluation, but Objectives still uses the old spreadsheet grid.

Required:
- Replace the Objectives production renderer with card-per-objective or max 2-column wide layout.
- `Objective_i`, `Action_Plan_i`, `Additional_Agreement_i` must be wide textareas (roughly 4–6 readable lines minimum, resizable/auto-grow where practical).
- `Weight_i`, `Difficulty_i`, Objective Count stay compact.
- Keep all existing Objective editability/validation/100%-weight behavior.
- Responsive narrow screens stack to one column.
- Do not create a duplicate production renderer.

## 3. MUST FIX R2-02 — APPRAISER COMMENTS MUST BE PER ITEM

R1 normalizes only `Manager_Comment_1` / `GM_Comment_1` as one Part A comment and can therefore repeat Objective 1 comment across every objective.

Required Part A logical model:
- `partAComments[i]` per objective.
- slot1 reads `Manager_Comment_i`.
- slot2 reads `GM_Comment_i`.
- slots3/4 use preview-only per-objective comment fixtures/state.
- render the matching comment for each objective only.

Required Part B logical model:
- `partBComments[competencyId]` per competency.
- slot1 reads `Manager_Competency_Comment_i`.
- slot2 reads `GM_Competency_Comment_i`.
- slots3/4 preview-only comments are per competency.
- Appraiser Evaluation UI must visibly render a comment/feedback input or read-only area for EACH competency.

Comments remain optional unless an existing rule says otherwise.

## 4. MUST FIX R2-03 — SHOW EXISTING SCORE / RESULT FIELDS; DO NOT FAKE CALCULATION

The Appraiser screen currently shows only Achievement/Rating inputs. The design requirement also needs score/result context.

Part A, per objective, when fields exist:
- slot1 result: `Manager_Objective_Score_i`
- slot2 result: `GM_Objective_Score_i`
- combined result: `Average_Objective_Score_i`
- weighted point: `MBO_Point_i`

Part B, per competency, when field exists:
- combined result: `Competency_Result_i`

Rules:
- display existing record values read-only;
- do NOT invent client-side certified production calculations in this sprint;
- if required appraiser data is incomplete, result area must clearly remain `Pending / Incomplete` even if stale calculated fields happen to exist;
- COCE remains evaluated and excluded from score.

HR Final read-only breakdown must show the same available result context without editable controls.

## 5. MUST FIX R2-04 — APPRAISER + HR MUST SHOW ATTACHMENT EVIDENCE CONTEXT

R1 displays attachments correctly in Mid-Year and Self screens, but Appraiser Evaluation and HR Final do not carry the evidence forward.

Required:
- Appraiser Evaluation: for each objective, show read-only Mid-Year attachment summary AND Self Evaluation attachment summary.
- HR Final / Completed: same read-only evidence summary.
- use real FILE values when present;
- preview synthetic files only when explicit preview mode is active;
- if none, show `No attachment / ไม่มีไฟล์แนบ`;
- no upload API / no Kintone file writes.

Keep `ATTACHMENT_RUNTIME_INTEGRATION = PENDING_PREDEPLOY_GATE`.

## 6. MUST FIX R2-05 — COMPETENCY SET SELECTION MUST FAIL CLOSED

Current `getApplicableCompetencies()` treats every code other than exact Management as Operational. This silently turns blank/invalid config into a normal 6-item set.

Required:
- exact `COMP_SET_OPERATIONAL_V1` -> 6 items;
- exact `COMP_SET_MANAGEMENT_V1` -> 8 items;
- blank/unknown -> configuration error / fail-closed UI; do not silently default to Operational in production.
- Preview fixtures must always set an explicit valid competency code.

## 7. MUST FIX R2-06 — WEIGHTS MUST FAIL CLOSED; NO 70/30 PRODUCTION FALLBACK

HR Final currently falls back to `70/30` if record/preview weights are missing.

Required:
- read `PartA_Weight` and `PartB_Weight` from record or explicit preview fixture only;
- if missing/invalid or sum != 100, show configuration warning / Pending and do not portray normal final configuration;
- do not hardcode 70/30 as production fallback.

## 8. MUST FIX R2-07 — REMOVE/ALIGN OLD 4-STEP YEAR-END NAV

V2 has five macro stages, but the old secondary navigation still shows four steps (`Objectives`, `Mid-Year`, `Year-End`, `Completed`). This conflicts with the new five-stage mental model.

Preferred:
- keep the top 5-phase Process Progress as the single primary stage navigator;
- remove the duplicate old 4-step stage nav from V2 screens and remove dead code/tests if no longer used.

Alternative acceptable:
- convert it to the exact same 5 stages: Objectives / Mid-Year / Self Evaluation / Appraiser Evaluation / HR Final-Completed.

Do NOT leave a visible old `Year-End` bucket that collapses Self + Appraiser + HR.

## 9. MUST FIX R2-08 — PREVIEW COMPLETE/INCOMPLETE MUST WORK FOR 1–4 APPRAISERS

Current Preview `Incomplete` mode clears slot2/3/4 data but leaves slot1 complete. Therefore `1 Appraiser + Incomplete` still appears complete.

Required:
- completion selector must produce a clearly incomplete fixture for ANY selected appraiser count 1,2,3,4;
- `Complete` must populate all required Part A + Part B data for all selected slots;
- `Incomplete` must remove at least one required rating from a required selected slot;
- active editor slot selector must clamp/filter to 1..selected appraiser count so the user never selects a non-existent active slot.

## 10. TEST COVERAGE MUST MATCH THE CLAIMS

R1 evidence says many gates PASS, but the added tests do not directly prove several of them. Add focused tests, not broad duplicate suites.

Required R2 tests:
1. Objectives screen uses wide-card layout and not the old 6-column spreadsheet grid.
2. Part A comments map per objective (`Comment_1` does not leak to objective 2).
3. Part B comments map per competency and render.
4. slot3/4 comments remain preview-only with no physical data-code.
5. Part A result fields are read and shown only as read-only context.
6. Part B `Competency_Result_i` is read and shown read-only.
7. incomplete required ratings keep result status Pending even if result fields contain stale values.
8. Appraiser screen renders Mid-Year + Self attachment evidence read-only.
9. HR screen renders Mid-Year + Self attachment evidence read-only.
10. invalid/blank competency set fails closed.
11. missing/invalid weights fail closed; 70/30 is not a production fallback.
12. old 4-step `Year-End` navigation is not visible in V2 (or exact 5-step replacement is proven).
13. Preview incomplete works at appraiser counts 1,2,3,4.
14. active preview slot is constrained to selected appraiser count.
15. exact 16 status mapping/progress, topology/XSS, slot3/4 no physical alias, and production-bundle preview isolation remain passing.

Run only after implementation is complete:
1. `npm test` once.
2. `npm run ui:build` once.
3. `npm run ui:preview` once with one smoke.

## 11. IMPORTANT PENDING ITEM — DO NOT SOLVE IN THIS R2

Production Appraiser Count binding is still not certified:
- App796 has `Expected_Appraiser_Count` (current published configs 1 or 2; GM/VP = 1).
- App794 currently does not snapshot `Expected_Appraiser_Count` in the six-profile-field snapshot.
- production UI constructor still defaults to 2 when no explicit count is supplied.

For this R2, keep Preview capable of 1–4 and record:
`PRODUCTION_APPRAISER_COUNT_BINDING = PENDING_SCORING_RUNTIME_GATE`

Do NOT add App794 schema fields, mutate App796, query-write Kintone, or hardcode Profile_Code -> appraiser count in this UI sprint. This will be closed after user visual approval under a separately reviewed scoring-runtime/persistence gate.

## 12. EVIDENCE PROVENANCE CORRECTION

R1 evidence incorrectly recorded:
`R1_EXECUTION_STARTING_HEAD = 7ff421639d67fb80a2cd60f9e160ef9170e0f8f9`

Actual Git parent of R1 execution commit is:
`7ff421657fea815f3fc807cf0f89a070ca95c4c6`

Correct the living evidence without rewriting history.

## 13. HARD BOUNDARIES

- 0 Kintone calls required for this task; local/Git only.
- No App794 upload/deploy/write.
- No App795/App796/App797/App798/App800 writes.
- No Process/schema/ACL/notification changes.
- No workflow actions.
- No real-user workflow/notification.
- No new framework.
- Keep frozen Core unchanged.

## 14. REQUIRED R2 EVIDENCE

Append concise evidence:

```text
APP794_EVALUATION_UI_V2_R2 = COMPLETE / BLOCKED
REVIEWED_R1_CANDIDATE = 9201d5ef88b783846822d7d2469873715272e7bb
R2_EXECUTION_STARTING_HEAD = actual Git parent after pulling this manifest
OBJECTIVES_WIDE_CARD_UX = PASS/FAIL
PARTA_COMMENT_PER_OBJECTIVE = PASS/FAIL
PARTB_COMMENT_PER_COMPETENCY = PASS/FAIL
PARTA_RESULT_CONTEXT = PASS/FAIL
PARTB_RESULT_CONTEXT = PASS/FAIL
STALE_RESULT_WHEN_INCOMPLETE_FAIL_CLOSED = PASS/FAIL
APPRAISER_ATTACHMENT_EVIDENCE = PASS/FAIL
HR_ATTACHMENT_EVIDENCE = PASS/FAIL
COMPETENCY_SET_INVALID_FAIL_CLOSED = PASS/FAIL
WEIGHT_CONFIG_INVALID_FAIL_CLOSED = PASS/FAIL
OLD_4_STEP_YEAR_END_NAV_VISIBLE = 0 / actual
PREVIEW_INCOMPLETE_COUNTS_1_TO_4 = PASS/FAIL
ACTIVE_SLOT_CONSTRAINED_TO_N = PASS/FAIL
PRODUCTION_APPRAISER_COUNT_BINDING = PENDING_SCORING_RUNTIME_GATE
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

## 15. STOP CONDITION

Commit, push the same branch, and STOP.

Do not deploy.
Do not continue to Dashboard.
The next gate is ChatGPT source review. Only after PASS should the user be asked to open the Status Preview Lab.