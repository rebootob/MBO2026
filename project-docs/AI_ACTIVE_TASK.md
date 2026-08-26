# AI ACTIVE TASK — APP794 EVALUATION UI V2 R6-R3 DEADLINE URGENCY VISUAL CORRECTION — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Prior implementation: R6-R2 commit `b11af6d8c2df8193262ce87bfc51e15796947008`
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

Confirmed Baseline is canonical.

## 1. CURRENT GATE

R6-R2 local implementation exists and is under user visual inspection.

User finding: deadline/day-count information inside the five stage tiles is still too small and easy to miss, especially near deadline and overdue.

This R6-R3 task is a **bounded visual correction only**. Preserve all R6-R2 behavior unless directly required for the deadline urgency correction.

Critical path:
`R6-R3 Deadline Urgency Correction -> ChatGPT Review -> User Visual Preview -> continue UI closure`

## 2. HARD SAFETY BOUNDARY

LOCAL ONLY.

- Kintone GET/POST/PUT/DELETE = 0.
- App794 deploy/upload = 0.
- Record/workflow/process/schema/ACL/notification writes = 0.
- App795/App796/App797/App798/App800 writes = 0.
- No real-user workflow/notification test.
- No new Kintone fields.
- No new production notification mechanism.

## 3. REQUIRED DEADLINE UX

Implement canonical `UI_UX.md` section 21.

### 3.1 Separate urgency callout

Do not rely only on the small text inside the five stage tiles.

For the **current active phase**, render a prominent bilingual urgency callout near the top process/stage area.

The visual focus is the number:
- `เหลือ 12 วัน / 12 DAYS REMAINING`
- `เหลือ 3 วัน / 3 DAYS REMAINING`
- `ครบกำหนดวันนี้ / DUE TODAY`
- `เกินกำหนด 76 วัน / 76 DAYS OVERDUE`

Show exact due date immediately adjacent/below:
`ครบกำหนด 31 Mar 2026 / Due 31 Mar 2026`

### 3.2 Urgency tiers

Use these deterministic UI tiers:

- `> 7 days remaining` -> GREEN / on-time normal emphasis.
- `1..7 days remaining` -> AMBER/ORANGE / due-soon strong emphasis.
- `0 days / due today` -> strong ORANGE/RED urgency.
- `overdue` -> RED critical emphasis.
- `completed` -> GREEN success, no overdue alarm.
- `upcoming/not opened` -> neutral/blue/gray and no overdue popup.

Do not treat green as performance score; this is deadline status only.

### 3.3 Popup / toast behavior

When the page/Preview is opened and the current phase is:
- due-soon `1..7 days`, OR
- due today, OR
- overdue,

show one dismissible bilingual popup/toast/banner.

Example overdue:
`⚠️ เกินกำหนด 76 วัน / 76 DAYS OVERDUE — กรุณาดำเนินการโดยเร็ว / Please take action as soon as possible.`

Rules:
- popup/toast may appear once per page load/session while the condition remains true;
- dismissing it must not remove the persistent red/orange urgency callout;
- no endless/reopening modal loop in the same page session;
- do not implement browser notifications, email, Kintone notifications, or external alerts in this task.

### 3.4 Motion / accessibility

Do **not** use continuously blinking text.

If motion is used:
- use only a subtle pulse on border/icon/background for due-soon/due-today/overdue;
- avoid aggressive flashing;
- respect `prefers-reduced-motion` by disabling animation where practical.

## 4. PRESERVE R6-R2

Do not regress:
- five bilingual stages;
- route/appraiser behavior;
- optional attachments;
- Mid-Year Progress semantics;
- Native Kintone Comments coexistence;
- active Appraiser column behavior;
- responsive 4-Appraiser matrix/no page overflow;
- Workflow Action Timeline table;
- Difficulty blank state;
- current HR phase calendar model;
- 0 Kintone calls in Preview.

Do not reopen Dashboard/Hoshin/routing persistence/scoring persistence/audit persistence.

## 5. PREVIEW VISUAL MATRIX

Preview must make these cases directly selectable or reproducible:

1. 20 days remaining -> GREEN callout, no popup.
2. 7 days remaining -> AMBER/ORANGE callout + popup/toast.
3. 3 days remaining -> AMBER/ORANGE callout + popup/toast.
4. 1 day remaining -> strong AMBER/ORANGE callout + popup/toast.
5. Due today -> strong urgency + popup/toast.
6. 1 day overdue -> RED callout + popup/toast.
7. 76 days overdue -> RED prominent callout + popup/toast.
8. Completed -> GREEN success, no overdue popup.
9. Upcoming -> neutral, no urgent popup.

The selected/current phase tile may also carry a matching urgency accent, but the separate large callout remains mandatory.

## 6. FOCUSED TESTS / EXECUTION BUDGET

Add/adjust focused tests for:
1. `>7` days -> green/on-time semantics, no urgent popup.
2. `7` days -> due-soon class + popup.
3. `1` day -> due-soon class + popup.
4. due today -> urgent class + popup.
5. overdue -> red class + prominent numeric text + popup.
6. completed -> no overdue popup.
7. dismiss does not remove persistent urgency callout.
8. popup is not repeatedly recreated in same render/session without reset.
9. reduced-motion CSS exists/animation disabled where implemented.
10. Preview Kintone calls = 0.

Execution budget:
- run focused UI tests first;
- `npm test` once only if source shared with production UI changed;
- `npm run ui:build` once;
- `npm run ui:preview` once;
- local browser smoke only.

Do not rerun unrelated discovery or broad browser workflows.

## 7. REQUIRED EVIDENCE

```text
APP794_EVALUATION_UI_V2_R6_R3 = COMPLETE / BLOCKED
EXECUTION_STARTING_HEAD = exact pulled task parent
DEADLINE_SEPARATE_URGENCY_CALLOUT = PASS/FAIL
DEADLINE_GT7_GREEN = PASS/FAIL
DEADLINE_7DAY_AMBER = PASS/FAIL
DEADLINE_1DAY_AMBER = PASS/FAIL
DEADLINE_DUE_TODAY_URGENT = PASS/FAIL
DEADLINE_OVERDUE_RED = PASS/FAIL
DEADLINE_76DAY_OVERDUE_PROMINENT = PASS/FAIL
URGENT_POPUP_DUE_SOON = PASS/FAIL
URGENT_POPUP_DUE_TODAY = PASS/FAIL
URGENT_POPUP_OVERDUE = PASS/FAIL
URGENT_POPUP_DISMISS_PRESERVES_CALLOUT = PASS/FAIL
URGENT_POPUP_NO_LOOP = PASS/FAIL
CONTINUOUS_BLINKING_TEXT = 0
REDUCED_MOTION_SUPPORT = PASS/FAIL/NOT_APPLICABLE
R6_R2_REGRESSION_CHECK = PASS/FAIL
KINTONE_CALL_COUNT = 0
KINTONE_WRITE_COUNT = 0
DEPLOY_COUNT = 0
NPM_TEST = actual/PASS/NOT_RUN_WITH_REASON
UI_BUILD = PASS/FAIL
PREVIEW_MAIN_UI_RENDER = PASS/FAIL
PREVIEW_KINTONE_CALL_COUNT = 0
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW THEN USER VISUAL PREVIEW; NO DEPLOY
```

## 8. WHAT / WHERE / HOW / WHY / IMPACT / RISK / TEST / ROLLBACK

What:
- make current-phase deadline urgency impossible to miss without aggressive flashing.

Where:
- existing App794 UI deadline/progress rendering, CSS, Preview fixture/control, focused tests.

How:
- reuse existing deadline calculation; change visual hierarchy and add local dismissible urgency toast/callout behavior.

Why:
- current user visual inspection shows the date/day count is too subtle to drive employee action.

Impact:
- local Preview/candidate only; no Kintone runtime impact.

Risk:
- excessive notification noise, inaccessible flashing, duplicated popup creation, or regression of stage layout.

Test:
- focused deadline matrix + build/Preview smoke; full npm test only as specified.

Rollback:
- Git revert R6-R3 local implementation commit. No Kintone rollback because writes are prohibited.

## 9. STOP CONDITION

Commit and push same `ai/antigravity-wp002c` branch.
Keep Preview Lab running if practical.
STOP.

Do not deploy App794.
Do not modify any Kintone app.
Do not continue to Dashboard/Hoshin.
