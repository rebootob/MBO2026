# AI ACTIVE TASK — APP794 EVALUATION UI/SCORING UX REDESIGN + STATUS PREVIEW LAB — LOCAL ONLY

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only when local/browser/Kintone execution is genuinely required
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Mode: PROJECT CLOSE MODE / APP794 EVALUATION UX CLOSURE
> Kintone write/deploy authorization: **NONE**

## Why Dashboard is paused

The previously deployed App794 UI/UX V1 is healthy at revision 39, but source review after user visual inspection confirmed a material usability/core gap: the custom UI has dedicated editable views for Objectives, Mid-Year, and Self Evaluation, while Manager/GM/HR final statuses currently fall into a generic READ_ONLY summary and do not provide a proper scoring UI for Part A / Part B.

Therefore Dashboard work is temporarily paused. The priority is to close App794 Evaluation & Scoring Runtime UX first, then resume Dashboard/Hoshin Control Center work.

## Frozen boundaries that remain unchanged

- App794 Process Management remains 16 states / 28 actions.
- Current active routing remains M1_G1 for all 17 live App795 routes.
- Workflow Approver and Scoring Appraiser are separate concepts.
- Do not rename workflow statuses merely to fit scoring roles.
- `admin-form` remains TECHNICAL_ADMIN_ONLY with zero business workflow authority.
- App53 and all eight legacy PMS apps remain READ ONLY.
- No real-user workflow/notification testing.
- No Kintone writes/deploys until a later fresh explicit authorization.

# USER-CONFIRMED UI/SCORING DESIGN RULES

## 1. Five Macro UI Stages

App794 must present five distinct business screens. Field sets are intentionally different by stage; do not force one spreadsheet layout to serve all stages.

### Stage 1 — Objectives
Statuses 01–05.
Primary content:
- Department Hoshin / Section Hoshin display.
- Objective.
- Action Plan.
- Additional Agreement / Comment.
- Weight %.
- Difficulty.
- Objective completion/validation guidance.

### Stage 2 — Mid-Year
Statuses 06–10.
Primary content:
- Objective / Weight / approved target as read-only context.
- Progress %.
- Periodical Review.
- Mid-Year Result / Current Result.
- Issue / Risk / Next Action.
- Mid-Year Attachment / supporting evidence for each objective.
- Large text-entry areas suitable for long user input.

### Stage 3 — Self Evaluation
Status 11 as employee editable screen; later statuses may show this content read-only as context.
Primary content:
- Objective / Weight / Mid-Year context read-only.
- Actual Result & Achievement.
- Self Achievement.
- Self Comment / Reflection.
- Self Evaluation Attachment / supporting evidence for each objective (current physical field family `Final_Attachment_1..10` may be reused if semantically acceptable; do not rename physical fields without a reviewed migration need).
- Large text-entry areas suitable for long user input.

### Stage 4 — Appraiser Evaluation
Statuses 12–14.
This is a dedicated scoring screen, not a generic READ_ONLY summary.

Business terminology:
- NEVER label scoring columns as Manager / GM based only on workflow position.
- Use neutral labels `1st Appraiser`, `2nd Appraiser`, `3rd Appraiser`, `4th Appraiser`.
- Workflow Approver != Scoring Appraiser.
- Do not infer appraiser identity from `Manager_User` / `GM_User` unless a separately confirmed scoring-appraiser source explicitly maps them.

Logical capacity:
- Design UI and scoring model for 1–4 appraisers from the start.
- Render only the required appraiser slots for the resolved profile/configuration.
- Appraiser count and weights must be configuration-driven, not role-title-driven.
- Current DEC-036 / App796 implementation allows only 1–2 and therefore conflicts with this new user-confirmed future-capacity requirement. Do not silently mutate runtime or App796. Record this as a required controlled scoring-architecture extension before deployment of 3–4-appraiser functionality.

Part A screen should show, at minimum:
- Objective / Weight / Difficulty / Actual Result / Self score as context.
- Appraiser 1..N rating/input.
- Appraiser comment/input per applicable slot.
- Objective result / scoring output when completeness requirements are satisfied.

Part B screen should show, at minimum:
- Competency item name and explanation.
- Appraiser 1..N rating/input.
- Appraiser comment/input where applicable.
- Competency result.
- COCE remains evaluated but excluded from score according to existing scoring governance.

Fail-closed scoring UX:
- Final score must not be presented as complete until every required appraiser input for Part A and Part B is complete.
- No automatic reweighting when an expected appraiser is incomplete.

### Stage 5 — HR Final / Completed
Statuses 15–16.
Primary content:
- Full read-only evaluation summary.
- Part A raw/result/weighted score.
- Part B raw/result/weighted score.
- Final score / grade only when completeness gates pass.
- Appraiser completion summary.
- Hoshin/employee/profile snapshot context.
- Attachment visibility/read-only access to Mid-Year and Self Evaluation evidence.
- Audit/status guidance appropriate for HR Final Check vs Completed.

## 2. Progress / Completion Visuals

The redesigned UI must include clear progress bars, but percentage meaning must be explicit.

### Overall Process Progress
Five macro phases:
`Objectives -> Mid-Year -> Self Evaluation -> Appraiser Evaluation -> HR Final / Completed`

The bar indicates PROCESS COMPLETION only; it must never imply performance score quality.

### Appraiser Completion
For configured N appraisers:
- 0/N = 0%
- 1/N = 1/N completion
- ...
- N/N = 100%

Example for 4 appraisers: 0%, 25%, 50%, 75%, 100%.

### Data Completion
Display stage-specific completeness such as:
- Part A required inputs complete / total.
- Part B required inputs complete / total.
- Missing-data guidance.

## 3. Wide Long-Text UX

User explicitly expects substantial text entry.

Design rules:
- Objective, Action Plan, Additional Agreement, Periodical Review, Mid-Year Result, Issue/Risk/Next Action, Actual Result, Self Comment, and Appraiser Comments must use wide text areas.
- Prefer card-per-objective or wide 1–2 column layouts over narrow Excel-like cells for long text.
- Default long-text height should be useful for approximately 4–6 lines and remain user-resizable / auto-growing where practical.
- Short numeric fields such as Weight, %, Difficulty, Rating may stay compact.
- Supporting attachment control should be visually grouped with the related objective/evidence section.
- Responsive layout must stack sensibly on narrower screens.

## 4. Attachment UX

Mid-Year and Self Evaluation must visibly support attachments.

Required behavior:
- Each objective can show its supporting evidence attachment control/summary.
- Display attached file names/count where practical.
- During Appraiser Evaluation and HR Final/Completed, attachments are viewable/read-only context, not editable by those stages unless a later business rule explicitly authorizes it.
- Attachment absence is not mandatory by default unless a separate business rule is approved.
- Workflow stage changes/returns must not lose attachments.

## 5. Hoshin visibility

Keep Department Hoshin and Section Hoshin as strong context in Objective stage and as read-only reference later. Existing Hoshin governance remains separate and must still be closed before Final UAT.

# REQUIRED PRE-DEPLOY UI PREVIEW GATE

Before any App794 redesign candidate is deployed to Kintone, create a LOCAL-ONLY clickable preview/simulator called conceptually `Status Preview Lab`.

Purpose: allow the user to visually inspect every App794 workflow status before deployment.

## Preview controls

The preview must let the user click/select:
- all 16 workflow statuses individually;
- the five macro stages;
- Profile / Part A-Part B ratio representative fixtures;
- Appraiser count 1, 2, 3, or 4;
- representative complete / incomplete data states where useful.

## 16 Status coverage

Preview each exact current status:
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

The preview must render the actual redesigned UI component logic against fixture/mock record data, not merely static screenshots, where practical.

## Preview safety

- Local browser only.
- Zero Kintone REST calls.
- Zero Kintone record writes.
- Zero workflow actions.
- Zero file uploads to Kintone.
- No real employee/workflow data required; use clearly synthetic fixtures.
- Credentials must not be required.

## User visual approval gate

Do not request App794 deployment authorization until:
1. implementation candidate passes source/tests/build review;
2. Status Preview Lab is runnable;
3. user has been given a clickable way to inspect each status;
4. user has had an opportunity to request UI corrections.

Expected classification after preview:
- `UI_PREVIEW_APPROVED` -> prepare controlled App794 deploy manifest;
- `UI_PREVIEW_MUST_FIX` -> local correction only, no Kintone deploy.

# IMPLEMENTATION STRATEGY

Minimize unnecessary rewrites.

Preferred approach:
- extend/refactor existing App794 UI renderer rather than create duplicate production UI stacks;
- introduce stage-specific render functions/components inside the existing UI architecture;
- add only the minimum new helper/module needed for scoring UI separation or preview harness when separation of concerns is clear;
- reuse existing physical fields where semantically safe;
- do not perform schema proliferation before physical storage review for 1–4 appraisers;
- first implement LOGICAL 1–4 appraiser rendering and design, then separately review physical storage/schema requirements.

Important: current physical schema and code include Manager/GM-named scoring fields and current App796 restricts expected appraiser count to 1–2. These are known design-debt/compatibility constraints. Do not pretend 3–4 appraiser persistence already exists. The local UI may preview 1–4, but deployment of true 3–4 persistence requires a reviewed scoring/schema extension.

# CURRENT DELIVERABLE — DESIGN + LOCAL CANDIDATE ONLY

Antigravity should eventually receive one consolidated local implementation sprint after Control Plane finishes the physical-storage/scoring design.

Until then:
- Kintone write/deploy authorization = NONE;
- do not deploy App794;
- do not mutate App796;
- do not change Process Management;
- do not alter App795 routing;
- do not create real workflow records;
- do not run real-user notifications.

# MILESTONE ORDER

`Core Workflow ✅ -> App794 UI/Scoring UX Redesign ⏳ -> Status Preview Lab/User Visual Approval -> Controlled App794 Deploy -> Hoshin Integration Closure -> Dashboard/HR Control Center -> Final UAT -> Go-Live`

# STOP CONDITION

Do not start Dashboard implementation and do not request Kintone deployment authorization until the Evaluation/Scoring UX candidate and Status Preview Lab have been reviewed.