# AI ACTIVE TASK — APP794 EVALUATION UI V2 R6-R5 OVERDUE EMPHASIS + EXPLICIT TIMELINE GRID — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Prior implementation: R6-R4 commit `64ce4b3f6b18324e681ff73f2ff4db9f5e7fc341`
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

## 1. CURRENT GATE — USER VISUAL FINDING (R6-R5)

R6-R4 consolidated the top status area and added a dense table, but the user review identified two visual findings to fix immediately:

1. **Overdue objective/deadline state is still not visually prominent enough**:
   - The key text `เกินกำหนด 76 วัน / 76 DAYS OVERDUE` (or current day countdown) must be the clear visual focus.
   - Render a clearly visible red overdue badge/pill (`.mbo-urgency-badge-pill`) or strong compact highlight.
   - Exact due date (e.g. `📅 ครบกำหนด 31 Jul 2026`) must be secondary text below/beside it.
   - Keep presentation as **ONE compact persistent status strip**, avoiding giant hero panels and reducing clutter/repeated text around the current phase block.

2. **Workflow Action Timeline still does not visually read as a real table**:
   - Add clearly visible vertical AND horizontal grid lines (`border: 1px solid #475569` or `#64748b` on table, th, and td).
   - Outer table border must also be explicitly visible.
   - Keep compact desktop audit-table styling (font 11–12px, compact padding 5–7px, dense row height, restrained header background, small result badges).

Classification: **MUST FIX VISUAL / LOCAL ONLY**.

This is a bounded visual correction. Do not reopen business logic, routing, scoring, persistence, Dashboard, or Hoshin.

## 2. HARD SAFETY BOUNDARY

LOCAL ONLY.

- Kintone GET/POST/PUT/DELETE = 0.
- App794 upload/deploy = 0.
- Record/workflow/process/schema/ACL/notification writes = 0.
- App795/App796/App797/App798/App800 writes = 0.
- No real-user workflow/notification test.
- No new Kintone fields.
- No production notification mechanism.

## 3. IMPLEMENTATION TARGETS — R6-R5

### 3.1 Stronger Compact Overdue Strip
- Primary countdown text `เกินกำหนด 76 วัน / 76 DAYS OVERDUE` formatted inside a high-contrast pill/badge (`.mbo-urgency-badge-pill`).
- Background red accent (`#fef2f2` / `#dc2626` border) for overdue state.
- Exact phase due date displayed as secondary helper text.
- Clean one-line layout with phase title, actor summary, and overdue pill.

### 3.2 Explicit Audit-Table Grid Lines
- `.mbo-timeline-table`, `.mbo-timeline-table th`, `.mbo-timeline-table td` formatted with `border: 1px solid #475569;` (or `#64748b`).
- Explicit outer border on `.mbo-timeline-table`.
- Compact 11.5px font, 5px 8px cell padding.
- Retain returned row tint (`#fef2f2`) while keeping grid lines distinctly visible.

## 4. REQUIRED EVIDENCE BLOCK

```text
APP794_EVALUATION_UI_V2_R6_R5 = COMPLETE
EXECUTION_STARTING_HEAD = 64ce4b3f6b18324e681ff73f2ff4db9f5e7fc341
OVERDUE_PILL_VISUAL_FOCUS = PASS
PERSISTENT_STATUS_STRIP_COUNT = 1
STATUS_STRIP_COMPACT_HIERARCHY = PASS
STATUS_DUPLICATE_LARGE_PANEL_COUNT = 0
EXPLICIT_TIMELINE_GRID_LINES = PASS
TIMELINE_TABLE_OUTER_BORDER_VISIBLE = PASS
TIMELINE_VERTICAL_GRID_VISIBLE = PASS
TIMELINE_HORIZONTAL_GRID_VISIBLE = PASS
TIMELINE_COMPACT_TYPOGRAPHY = PASS
TIMELINE_COMPACT_PADDING = PASS
TIMELINE_COLLAPSIBLE = PASS
TIMELINE_RETURN_HISTORY_PRESERVED = PASS
R6_R4_SEMANTIC_REGRESSION = 0
FOUR_APPRAISER_PAGE_BODY_OVERFLOW = 0
KINTONE_CALL_COUNT = 0
KINTONE_WRITE_COUNT = 0
DEPLOY_COUNT = 0
NPM_TEST = PASS
UI_BUILD = PASS
PREVIEW_MAIN_UI_RENDER = PASS
PREVIEW_KINTONE_CALL_COUNT = 0
GIT_PUSH_SYNC = PASS
NEXT_ACTION = CHATGPT REVIEW THEN USER VISUAL PREVIEW; IF USER APPROVES UI, START PREVIEW_TO_APP794_PARITY_CLOSURE PLAN; NO DEPLOY
```

## 5. STOP CONDITION

Commit and push the same `ai/antigravity-wp002c` branch.
Keep Preview Lab running if practical.
STOP.

Do not deploy App794.
Do not modify any Kintone app.