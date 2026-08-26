# AI ACTIVE TASK — APP794 EVALUATION UI V2 R6-R4 VISUAL HIERARCHY + DENSE AUDIT TABLE — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Prior implementation: R6-R3 commit `ff4825399711fda7fbfe294117e161b06fcad546`
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

## 1. CURRENT GATE — USER VISUAL FINDING

R6-R3 technically works locally, but the user visually rejected the information hierarchy:
- the deadline/status area is too busy, repetitive and difficult to scan;
- too many large status/urgency elements compete with the actual MBO form;
- Workflow Action Timeline is secondary audit information but still looks too visually heavy;
- Timeline needs visibly stronger grid lines and smaller, denser typography.

Classification: **MUST FIX VISUAL / LOCAL ONLY**.

This is a bounded visual-hierarchy correction. Do not reopen business logic, routing, scoring, persistence, Dashboard or Hoshin.

## 2. HARD SAFETY BOUNDARY

LOCAL ONLY.

- Kintone GET/POST/PUT/DELETE = 0.
- App794 upload/deploy = 0.
- Record/workflow/process/schema/ACL/notification writes = 0.
- App795/App796/App797/App798/App800 writes = 0.
- No real-user workflow/notification test.
- No new Kintone fields.
- No production notification mechanism.

## 3. PRIMARY VISUAL RULE — ONE CLEAR STATUS AREA

Implement `CONFIRMED_BASELINE/UI_UX.md` section 22.

### 3.1 Remove duplicated visual noise

Do not show multiple large blocks that repeat the same current-phase/deadline state.

Target hierarchy:
1. five-stage navigation;
2. **one compact current-phase status/deadline strip**;
3. main MBO business content;
4. secondary information such as Timeline/Comments.

The compact strip may contain:
- current phase;
- current actor/action guidance where useful;
- status badge;
- days remaining/overdue;
- exact due date.

Do not create separate large hero panels for each of these if they can be expressed in one compact strip.

### 3.2 Urgency behavior remains, but compact

Preserve semantic tiers:
- >7 days: green/on-time;
- 1..7 days: amber/orange;
- due today: orange/red;
- overdue: red;
- completed: green;
- upcoming: neutral.

The day count remains easy to notice, but it must not dominate the form.
Target desktop typography:
- main day count around 16–18px;
- phase/status around 12–13px;
- due-date/helper around 11–12px.

Use restrained color accents (border/badge/light background). Avoid large saturated colored areas.
Use at most one meaningful icon in the persistent status strip.

### 3.3 Transient toast

For due-soon/due-today/overdue, a dismissible toast may remain, but:
- it must be visually compact;
- it must not duplicate a full paragraph already shown in the persistent strip;
- no loop/reopen in the same session;
- after dismissal, the compact persistent strip still shows the urgency state;
- no blinking text.

## 4. WORKFLOW ACTION TIMELINE — DENSE GRID TABLE

The Timeline is audit/supporting information, not main content.

Mandatory desktop correction:
- render as a real compact table;
- **clearly visible vertical AND horizontal grid lines**;
- use a stronger neutral border than the current very-light appearance;
- header/body text approximately 11–12px;
- compact cell padding about 5–7px where practical;
- compact row height; do not create tall rows;
- header background restrained light gray/blue;
- Result/Return badges small and compact;
- `Events Recorded` remains a small secondary badge;
- Return/Reject row may have a light red tint but grid lines must still remain visible;
- preserve all columns and chronological history;
- keep the whole Timeline section collapsible;
- mobile may use stacked cards only when table is genuinely unreadable.

Do not enlarge Timeline typography merely because the table is bilingual. Prefer concise paired labels/two-line headers.

## 5. PRESERVE R6-R3 / R6-R2 FUNCTIONAL UI

Do not regress:
- exactly five bilingual stages;
- route-aware progress;
- ordinal Appraiser route labels;
- Appraiser active-column logic;
- 1..4 Appraiser Preview capacity;
- contained 4-Appraiser matrix/no whole-page overflow;
- Objectives/Mid-Year/Self optional attachments;
- Mid-Year employee-entered Progress 0..100;
- Difficulty blank semantics;
- HR phase calendar model;
- Native Kintone Comments coexistence contract;
- Workflow Timeline event semantics/full history;
- fail-closed incomplete scoring;
- 0 Preview Kintone calls.

## 6. USER VISUAL CHECK TARGET

Preview must visibly demonstrate:

### Status/deadline area
- normal/on-time case is calm and compact;
- due-soon is noticeable but not a giant hero panel;
- overdue is clearly red and visible without making the page look chaotic;
- there is only one persistent status/deadline strip;
- optional transient toast can be dismissed without leaving duplicated large status panels.

### Timeline
- grid lines immediately visible at normal zoom;
- every column clearly separated;
- body text visibly smaller than primary MBO form text;
- rows compact and easy to scan;
- Return row easy to identify;
- table remains readable in Thai + English.

## 7. FOCUSED TEST / EXECUTION BUDGET

Add/adjust focused tests only for visual contracts that can be asserted structurally:
1. only one persistent deadline/status strip exists.
2. urgent toast remains optional/transient and dismissible.
3. persistent strip remains after toast dismissal.
4. no continuous blinking text.
5. Timeline uses `<table>`.
6. Timeline CSS contains visible cell/header borders.
7. Timeline compact typography contract exists.
8. Timeline remains collapsible.
9. Return history row remains present.
10. R6-R3 deadline semantics unchanged.
11. Preview Kintone calls = 0.

Execution budget:
- focused tests first;
- `npm test` once because shared production UI/CSS changes;
- `npm run ui:build` once;
- `npm run ui:preview` once;
- local browser smoke only.

Do not burn cycles on unrelated tests/docs cleanup.

## 8. REQUIRED EVIDENCE

```text
APP794_EVALUATION_UI_V2_R6_R4 = COMPLETE / BLOCKED
EXECUTION_STARTING_HEAD = exact pulled task parent
PERSISTENT_STATUS_STRIP_COUNT = 1 / actual
STATUS_STRIP_COMPACT_HIERARCHY = PASS/FAIL
STATUS_DUPLICATE_LARGE_PANEL_COUNT = 0 / actual
URGENT_TOAST_COMPACT = PASS/FAIL
URGENT_TOAST_DISMISS_PRESERVES_STATUS = PASS/FAIL
CONTINUOUS_BLINKING_TEXT = 0
TIMELINE_DESKTOP_TABLE = PASS/FAIL
TIMELINE_VERTICAL_GRID_VISIBLE = PASS/FAIL
TIMELINE_HORIZONTAL_GRID_VISIBLE = PASS/FAIL
TIMELINE_COMPACT_TYPOGRAPHY = PASS/FAIL
TIMELINE_COMPACT_PADDING = PASS/FAIL
TIMELINE_COLLAPSIBLE = PASS/FAIL
TIMELINE_RETURN_HISTORY_PRESERVED = PASS/FAIL
R6_R3_SEMANTIC_REGRESSION = 0 / actual
FOUR_APPRAISER_PAGE_BODY_OVERFLOW = 0 / actual
KINTONE_CALL_COUNT = 0
KINTONE_WRITE_COUNT = 0
DEPLOY_COUNT = 0
NPM_TEST = actual/PASS/FAIL
UI_BUILD = PASS/FAIL
PREVIEW_MAIN_UI_RENDER = PASS/FAIL
PREVIEW_KINTONE_CALL_COUNT = 0
GIT_PUSH_SYNC = PASS/FAIL
NEXT_ACTION = CHATGPT REVIEW THEN USER VISUAL PREVIEW; IF USER APPROVES UI, START PREVIEW_TO_APP794_PARITY_CLOSURE PLAN; NO DEPLOY
```

## 9. NEXT PHASE AFTER USER VISUAL APPROVAL — DO NOT EXECUTE NOW

After the user approves the local Preview UI, do **not** deploy immediately.

Next Control Plane work package is:
`PREVIEW_TO_APP794_PARITY_CLOSURE`

Follow `CONFIRMED_BASELINE/UI_UX.md` section 23:
- create one full Preview -> App794 parity manifest;
- map all fields/statuses/routes/appraisers/attachments/scoring/calendar/timeline/comments/security;
- classify every Preview feature gap;
- bundle required App794/App795/App796/App800/schema/audit changes into one reviewed integration plan;
- build one integrated candidate instead of live micro-fixes;
- request fresh explicit Kintone authorization only after the complete plan/candidate is reviewed.

Do not execute that parity work in R6-R4.

## 10. WHAT / WHERE / HOW / WHY / IMPACT / RISK / TEST / ROLLBACK

What:
- simplify visual hierarchy and make Timeline look like a compact business audit table.

Where:
- existing App794 UI status/deadline rendering, Timeline renderer, CSS, Preview and focused tests.

How:
- consolidate repeated status blocks into one compact strip; reduce visual weight; strengthen Timeline grid and density.

Why:
- user visual inspection found the current presentation cluttered, unclear and difficult to scan.

Impact:
- local candidate/Preview only; no Kintone runtime impact.

Risk:
- accidentally reducing deadline visibility too much, hiding actor guidance, or making bilingual Timeline text too cramped.

Test:
- focused structural tests + one npm test + one build + local Preview smoke.

Rollback:
- Git revert the R6-R4 local implementation commit. No Kintone rollback because writes are prohibited.

## 11. STOP CONDITION

Commit and push the same `ai/antigravity-wp002c` branch.
Keep Preview Lab running if practical.
STOP.

Do not deploy App794.
Do not modify any Kintone app.
Do not continue to Dashboard/Hoshin or parity implementation.