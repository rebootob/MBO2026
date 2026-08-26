# AI ACTIVE TASK — APP794 EVALUATION UI V2 R6-R6 HISTORICAL STAGE REVIEW NAVIGATION — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Prior reviewed implementation: R6-R5 commit `80efb93b36b1897db945bd3721ba6c6c9d0aadaf`
> Canonical UI baseline: `project-docs/CONFIRMED_BASELINE/UI_UX.md` section 24
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

Confirmed Baseline is canonical.

## 1. CURRENT USER REQUIREMENT

The user wants the five top macro-stage tiles to support historical review, not only progress display.

When a record is already at a later phase (for example HR Final), the user must be able to click back and see what was recorded in:
- Objectives;
- Mid-Year;
- Self Evaluation;
- and, for authorized Appraiser/HR viewers, Appraiser Evaluation results.

This must be a read-only viewing function. It must never move the Kintone Workflow backward.

Classification: **MUST IMPLEMENT UI / LOCAL ONLY BEFORE USER VISUAL APPROVAL**.

## 2. HARD SAFETY BOUNDARY

LOCAL ONLY.

- Kintone GET/POST/PUT/DELETE = 0.
- App794 upload/deploy = 0.
- Record/workflow/process/schema/ACL/notification writes = 0.
- App795/App796/App797/App798/App800 writes = 0.
- No real-user workflow/notification test.
- No new Kintone fields.
- No routing/profile/calendar/audit persistence change.
- Do not continue Dashboard/Hoshin or PREVIEW_TO_APP794_PARITY_CLOSURE yet.

## 3. ARCHITECTURE RULE — CURRENT PHASE != VIEWED STAGE

Implement a separate UI-only viewing state, e.g. `selectedViewStage` / equivalent.

Mandatory behavior:
- real `record.Status` remains authoritative current Workflow state;
- `getMacroStage(record.Status)` remains the real current phase;
- clicking a previously reached macro-stage tile changes only `selectedViewStage`;
- clicking history must not mutate record values, status, assignee, route, score, or timestamps;
- future/unreached stages are disabled for normal historical navigation;
- completed record may browse all role-permitted stages;
- provide `กลับสู่ขั้นตอนปัจจุบัน / Back to Current Phase`;
- current Workflow phase remains visibly marked even while viewing another stage;
- historical selected stage gets a clear bilingual `กำลังดูข้อมูลย้อนหลัง / Viewing Historical Stage — Read Only` indicator.

Do not fake this by changing Preview `Status` when the user clicks a tile. The whole purpose is to prove browsing history while current Workflow remains unchanged.

## 4. ROLE-AWARE HISTORY VISIBILITY

Preview may add one local-only viewer-role selector/fixture for visual testing:
- Employee / Requester
- 1st Appraiser
- 2nd Appraiser
- 3rd Appraiser
- 4th Appraiser
- HR Final

This is Preview simulation only. Production users must never self-select/elevate role.

### 4.1 Employee / Requester

May browse reached stages read-only:
- Objectives
- Mid-Year
- Self Evaluation

Do **not** expose Appraiser Evaluation detailed scoring/comments merely because the user clicked history.
If the Employee selects a restricted stage in Preview, show a clear neutral restricted/permission message rather than rendering confidential Appraiser columns.

### 4.2 Appraiser 1..N

May browse reached:
- Objectives read-only
- Mid-Year read-only
- Self Evaluation read-only
- Appraiser Evaluation according to confirmed Appraiser-to-Appraiser visibility

When Appraiser Evaluation is current and the viewer is the current actor, preserve existing active-column behavior.
When Appraiser Evaluation is being viewed historically, **all Appraiser columns must become read-only**, including the viewer's own column.

### 4.3 HR Final

May browse all reached stages read-only, including:
- Objectives
- Mid-Year
- Self Evaluation
- complete Appraiser Evaluation Part A + Part B
- all configured Appraiser columns
- HR Final/Completed summary

Only separately-authorized current HR action surfaces may be editable; historical stage content is always read-only.

## 5. HISTORICAL STAGE CONTENT

Reuse the same existing business components/renderers wherever possible. Do not create a duplicate second implementation for history.

### Objectives history
Show stored/approved context:
- Objective / expected result & target
- Action Plan
- Additional Agreement / Comment
- Weight
- Difficulty
- Objective attachment/evidence

All read-only.

### Mid-Year history
Show:
- Objective baseline/read-only context
- Progress %
- Periodical Review
- Mid-Year Result
- Issue/Risk
- Next Action
- Mid-Year attachment/evidence

All read-only.

### Self Evaluation history
Show:
- Objective baseline/read-only context
- Actual Result
- Self Achievement / self rating where applicable
- Self Comment
- Self Evaluation attachment/evidence

All read-only.

### Appraiser Evaluation history
For authorized Appraiser/HR viewers show:
- Part A Objective evaluation context
- Self result/rating context
- Appraiser 1..N ratings/comments
- result/combined score context
- Objective/Mid-Year/Self evidence carried forward
- Part B Competency rows
- Appraiser 1..N Part B scores/comments
- result context

Historical mode = every Appraiser cell read-only.

### HR Final / Completed history
Show existing read-only final/closure summary and permitted final result/evidence context.

## 6. FIVE-STAGE TILE UX

Keep the five-stage navigation compact and bilingual.

Each tile may visually communicate independently:
- stage completion/progress state;
- whether the tile is clickable for historical review;
- which stage is the real CURRENT WORKFLOW PHASE;
- which stage is currently VIEWED.

Avoid using the same highlight for both `CURRENT` and `VIEWING HISTORY`.
Recommended:
- current Workflow phase: clear `Current / ขั้นตอนปัจจุบัน` badge/outline;
- selected historical stage: secondary `Viewing History / ดูย้อนหลัง` indicator;
- completed prior stages: clickable cursor and subtle hover;
- future stages: disabled/no click.

## 7. AUDIT/TIMELINE COEXISTENCE

Do not create a second audit system.
The existing Workflow Action Timeline remains the audit source presentation.

When viewing a historical stage, it is acceptable to:
- keep the full Timeline visible; or
- visually highlight/filter events for the selected stage if implementation is small and does not hide full-history access.

Do not fabricate timestamps.

## 8. SECURITY NOTE

Historical read-only UI is not a security boundary.

Production parity must later reconcile viewer visibility with native Kintone Process/App/Record/Field permissions or another approved native/server-side boundary.
Do not claim secure Employee-vs-Appraiser score isolation from Preview-only DOM hiding.

## 9. REGRESSION REQUIREMENTS

Do not regress R6-R5/R6-R2 behavior:
- five bilingual stages;
- route-aware progress;
- overdue red pill / deadline hierarchy;
- explicit dense Timeline grid;
- ordinal Appraiser route labels;
- Appraiser active-column current-actor behavior;
- 1..4 Appraiser Preview capacity;
- contained 4-Appraiser matrix/no page-body overflow;
- Objectives/Mid-Year/Self optional attachments;
- Mid-Year employee-entered Progress 0..100;
- Difficulty blank semantics;
- HR phase calendar model;
- Native Kintone Comments coexistence;
- fail-closed incomplete scoring;
- 0 Preview Kintone calls.

## 10. REQUIRED TESTS

Add focused tests proving at minimum:

1. Clicking a completed prior stage changes view state only; `record.Status` remains unchanged.
2. Historical view does not mutate Objective/Mid-Year/Self/Appraiser record fields.
3. Historical stage controls are all read-only/disabled.
4. `Back to Current Phase` restores current-stage rendering without changing status.
5. Future/unreached stage cannot be opened as history.
6. Employee can view Objectives/Mid-Year/Self history.
7. Employee cannot see detailed Appraiser Evaluation columns through history navigation.
8. Appraiser can view previous stages and Appraiser Evaluation history.
9. Historical Appraiser Evaluation makes **all** Appraiser columns read-only.
10. HR can view all reached stages including full Appraiser Evaluation Part A + Part B.
11. Current Appraiser Evaluation still preserves active-current-column editability outside history mode.
12. Completed record supports all role-permitted historical stages read-only.
13. Existing overdue/timeline/4-appraiser regression tests remain PASS.

Run:
- `npm test` once;
- `npm run ui:build` once;
- Preview local browser smoke.

## 11. PREVIEW VISUAL TARGET

Demonstrate at least one later-state scenario, preferably `15 HR Final Check` and/or `16 Completed`:

- Current stage visibly remains HR Final/Completed.
- Click Objectives -> historical Objectives content appears read-only.
- Click Mid-Year -> historical Mid-Year content appears read-only.
- Click Self Evaluation -> historical Self content appears read-only.
- As Appraiser/HR, click Appraiser Evaluation -> complete Part A/Part B results visible read-only.
- Click `Back to Current Phase` -> returns to HR Final/Completed.
- Route Progress and real current status never change during browsing.

Also demonstrate Employee viewer does not receive detailed Appraiser Evaluation scoring by merely clicking the stage.

## 12. REQUIRED EVIDENCE BLOCK

```text
APP794_EVALUATION_UI_V2_R6_R6 = COMPLETE
HISTORICAL_STAGE_NAVIGATION = PASS
CURRENT_WORKFLOW_PHASE_SEPARATE_FROM_VIEW_STAGE = PASS
HISTORY_STATUS_MUTATION_COUNT = 0
HISTORY_RECORD_MUTATION_COUNT = 0
BACK_TO_CURRENT_PHASE = PASS
FUTURE_STAGE_HISTORY_BLOCKED = PASS
EMPLOYEE_OBJECTIVES_HISTORY = PASS
EMPLOYEE_MIDYEAR_HISTORY = PASS
EMPLOYEE_SELF_HISTORY = PASS
EMPLOYEE_APPRAISER_DETAIL_EXPOSURE = 0
APPRAISER_HISTORY_ACCESS = PASS
HISTORICAL_APPRAISER_ALL_COLUMNS_READONLY = PASS
HR_FULL_HISTORY_ACCESS = PASS
CURRENT_APPRAISER_ACTIVE_COLUMN_REGRESSION = 0
R6_R5_VISUAL_REGRESSION = 0
FOUR_APPRAISER_PAGE_BODY_OVERFLOW = 0
KINTONE_CALL_COUNT = 0
KINTONE_WRITE_COUNT = 0
DEPLOY_COUNT = 0
NPM_TEST = PASS
UI_BUILD = PASS
PREVIEW_MAIN_UI_RENDER = PASS
PREVIEW_KINTONE_CALL_COUNT = 0
GIT_PUSH_SYNC = PASS
NEXT_ACTION = CHATGPT REVIEW THEN USER VISUAL PREVIEW; NO DEPLOY
```

## 13. STOP CONDITION

Commit and push the same `ai/antigravity-wp002c` branch.
Keep Preview Lab running if practical.
STOP.

Do not deploy App794.
Do not modify any Kintone app.
