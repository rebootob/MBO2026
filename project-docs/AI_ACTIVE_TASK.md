# AI ACTIVE TASK — APP794 EVALUATION UI V2 R6-R5 USER VISUAL PREVIEW GATE — NO DEPLOY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone only if local Preview needs to be restarted
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed implementation commit: `80efb93b36b1897db945bd3721ba6c6c9d0aadaf`
> Canonical UI baseline: `project-docs/CONFIRMED_BASELINE/UI_UX.md`
> Kintone write/deploy authorization: **NONE**

## 0. REVIEW RESULT

`APP794_EVALUATION_UI_V2_R6_R5_SOURCE_REVIEW = PASS_WITH_OBSERVATION`

Verified by Control Plane:
- overdue state renders a dedicated high-contrast `.mbo-urgency-badge-pill.pill-red` inside the single compact persistent status strip;
- exact due date remains secondary text;
- Timeline CSS uses explicit visible outer/table/header/cell borders with `#475569/#64748b` and `!important`;
- Timeline typography remains compact at approximately 11.5px with dense padding;
- `src/styles/mbo-employee.css` and `dist/mbo-employee.css` are aligned for the reviewed candidate;
- source and bundled JS both contain the R6-R5 overdue-pill rendering change;
- Preview server serves `dist/mbo-employee.css` directly;
- reported regression suite = 557/557 PASS;
- reviewed execution changed local Git candidate/docs/tests only; no Kintone write/deploy is authorized or required.

Observation only:
- the automated test asserts the overdue pill and Timeline table structure but does not independently render/pixel-verify CSS visibility. The CSS rules themselves were independently reviewed in source. Do not burn another implementation round solely for this observation.

## 1. CURRENT GATE — USER VISUAL APPROVAL

Do not modify source code yet.

The user must visually inspect the local Preview after a hard refresh and decide whether the R6-R5 presentation is acceptable.

Visual acceptance targets:

1. **Overdue emphasis**
   - `เกินกำหนด X วัน / X DAYS OVERDUE` is immediately noticeable as a red pill/badge;
   - it is visually stronger than helper text but does not become a giant hero panel;
   - exact due date is clearly secondary;
   - only one persistent status/deadline strip remains.

2. **Workflow Action Timeline**
   - outer table border is clearly visible;
   - vertical grid lines are clearly visible;
   - horizontal grid lines are clearly visible;
   - text is compact and secondary to the MBO form;
   - Return/Reject row remains easy to identify;
   - Timeline remains collapsible.

3. **Regression spot-check**
   - five bilingual stages remain intact;
   - no whole-page overflow;
   - main MBO form remains visually dominant.

## 2. HOW TO PREVIEW

If the Preview server is already running, do not execute Antigravity again. In the browser use a hard refresh (`Ctrl+F5`) so the latest CSS is not masked by browser cache.

If the local Preview server is not running, Antigravity may only:

```text
Pull latest `ai/antigravity-wp002c`.
Verify local HEAD equals origin.
Do NOT modify any source, tests, docs, dist, or Kintone configuration.
Run `npm run ui:preview` only.
Keep the Preview server running and STOP.
```

## 3. HARD SAFETY BOUNDARY

- Kintone GET/POST/PUT/DELETE = 0.
- App794 upload/deploy = 0.
- Record/workflow/process/schema/ACL/notification writes = 0.
- App795/App796/App797/App798/App800 writes = 0.
- No real-user workflow/notification test.
- No Dashboard/Hoshin continuation.
- No `PREVIEW_TO_APP794_PARITY_CLOSURE` execution until the user explicitly approves the Preview UI.

## 4. NEXT GATE

If user visually approves the UI:
- Control Plane creates one integrated `PREVIEW_TO_APP794_PARITY_CLOSURE` plan according to `CONFIRMED_BASELINE/UI_UX.md`.
- Do not chase App794 live defects one-by-one.
- Build one complete field/status/route/profile/calendar/attachment/audit/security parity manifest before any deployment authorization.

If user visually rejects any item:
- capture all findings first;
- bundle them into the smallest final UI correction round;
- remain LOCAL ONLY / NO DEPLOY.
