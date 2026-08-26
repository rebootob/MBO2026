# AI ACTIVE TASK — APP794 STATUS PREVIEW LAB BOOTSTRAP REPAIR — LOCAL ONLY

> Control Plane: ChatGPT / Project Lead / Reviewer
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Current HEAD before this task: `d45aade6da9bd1adde4cc49000d9749973bebaa4`
> Kintone write/deploy authorization: **NONE**

## 1. USER-OBSERVED DEFECT

User opened `http://localhost:3000` for the approved User Visual Preview gate.
Toolbar loads, but main preview area is blank.
Chrome console shows:

`Uncaught ReferenceError: EmployeePartAUI is not defined`

at `updateLab()` / `preview/index.html`.

The favicon 404 is non-blocking and is not the target defect.

## 2. CONFIRMED ROOT CAUSE

- `src/ui/employee-part-a-ui.js` exports `EmployeePartAUI` as an ES module.
- `preview/index.html` currently loads `/mbo-employee-app.js` as a classic script and later calls `new EmployeePartAUI(...)` as if the class were global.
- `dist/mbo-employee-app.js` is a production IIFE bundle. `EmployeePartAUI` remains scoped inside that IIFE and is not exposed on `window/globalThis`.
- Therefore the Preview Lab bootstrap is invalid even though the static server itself loads successfully.

Prior evidence `PREVIEW_LAB_LOAD = PASS` only established server/page load and did not prove successful renderer bootstrap. Do not repeat that claim without checking the rendered UI and console.

## 3. REQUIRED FIX — KEEP PRODUCTION BUNDLE UNCHANGED

Preferred architecture:

1. Update `scripts/ui-preview-server.js` to serve repository source modules read-only under `/src/...`.
   - Requests beginning `/src/` must resolve only inside repository `src/`.
   - Prevent path traversal outside `src/`.
   - `.js` MIME remains `text/javascript; charset=utf-8`.
2. Update `preview/index.html` to use an ES module bootstrap:
   - remove dependency on `EmployeePartAUI` being a global;
   - import `{ EmployeePartAUI }` from `/src/ui/employee-part-a-ui.js`;
   - keep existing `updateLab`, fixtures, status selectors and preview behavior.
3. Keep `/mbo-employee.css` from `dist` for production-aligned styling.
4. Do **not** add `window.EmployeePartAUI`, `globalThis.EmployeePartAUI`, or other preview-only globals to the production bundle.
5. Do **not** modify `src/ui/employee-part-a-ui.js`, scoring/runtime logic, workflow/routing, schema, or App796 for this repair unless a real import failure proves it necessary.
6. Do **not** rebuild or change `dist/mbo-employee-app.js` unless the implementation unexpectedly requires production source change. Preferred expected result: production JS blob unchanged.

## 4. REQUIRED VERIFICATION

After the fix:

- Start `npm run ui:preview` once.
- Open `http://localhost:3000` in local browser.
- Confirm main MBO UI renders below toolbar, not blank.
- Console must contain **0** `EmployeePartAUI is not defined` errors.
- Switch at minimum:
  - `01 Draft Objective`
  - `06 Employee Mid-Year`
  - `11 Employee Self Evaluation`
  - `13 Manager Final Evaluation`
  - `15 HR Final Check`
  - `16 Completed`
- Confirm each selection renders without fatal JS error.
- Switch Appraisers 1, 2, 3, 4 and confirm renderer remains functional.
- Switch ratio 70/30, 60/40, 50/50 and confirm renderer remains functional.
- No Kintone API traffic/calls are allowed.

A favicon 404 may remain and must not be reported as a functional failure.

## 5. SCOPE / FILES

Prefer modifying only:
- `preview/index.html`
- `scripts/ui-preview-server.js`
- one focused local preview test only if genuinely useful
- living evidence docs

Do not touch frozen Core files.
Do not modify Kintone deployment scripts except the local preview server listed above.
Do not add duplicate preview frameworks or orphan files.

## 6. SAFETY

- Kintone calls: 0
- Kintone writes: 0
- App794 upload/deploy: 0
- record writes: 0
- workflow actions: 0
- Process/schema/ACL/notification writes: 0
- App795/App796/App797/App798/App800 writes: 0
- real-user workflow/notification: prohibited
- previous App794 deployment authorization remains consumed/closed

## 7. EXECUTION BUDGET

This is preview infrastructure only. Do not burn a full broad regression round unless production source changes.

Expected:
1. implement the bounded fix;
2. run a syntax/import sanity check as needed;
3. run `npm run ui:preview` once;
4. perform one browser smoke covering the required selections above;
5. keep preview server running for the user;
6. commit, push same branch, STOP.

If production source or `dist/mbo-employee-app.js` changes unexpectedly, run `npm test` once and explain why production code had to change.

## 8. REQUIRED EVIDENCE

Append concise evidence:

```text
APP794_PREVIEW_BOOTSTRAP_REPAIR = COMPLETE / BLOCKED
EXECUTION_STARTING_HEAD = exact parent after pulling this task
ROOT_CAUSE = CLASSIC_IIFE_DOES_NOT_EXPORT_EMPLOYEEPARTAUI_GLOBAL
PREVIEW_USES_ES_MODULE_SOURCE_IMPORT = PASS/FAIL
PREVIEW_SERVER_SRC_ROUTE = PASS/FAIL
SRC_ROUTE_PATH_TRAVERSAL_GUARD = PASS/FAIL
PRODUCTION_DIST_JS_UNCHANGED = PASS/FAIL
PREVIEW_MAIN_UI_RENDER = PASS/FAIL
EMPLOYEEPARTAUI_REFERENCE_ERROR_COUNT = 0 / actual
STATUS_SMOKE_01_06_11_13_15_16 = PASS/FAIL
APPRAISER_1_TO_4_PREVIEW = PASS/FAIL
RATIO_70_30_60_40_50_50_PREVIEW = PASS/FAIL
PREVIEW_KINTONE_CALL_COUNT = 0
APP794_KINTONE_WRITE_COUNT = 0
WORKFLOW_ACTION_COUNT = 0
GIT_DIFF_CHECK = PASS/FAIL
GIT_PUSH_SYNC = PASS/FAIL
PREVIEW_SERVER_LEFT_RUNNING = YES/NO
NEXT_ACTION = USER VISUAL PREVIEW; NO DEPLOY
```

## 9. WHAT / WHERE / HOW / WHY / IMPACT / RISK / TEST / ROLLBACK

**What:** repair the local Status Preview Lab bootstrap so the real Evaluation UI V2 renderer appears.

**Where:** local preview HTML/server only.

**How:** serve `/src/*` safely and import the exported `EmployeePartAUI` ES module directly instead of assuming a global from the production IIFE bundle.

**Why:** the user cannot perform the visual approval gate while the renderer fails with `EmployeePartAUI is not defined`.

**Impact:** local preview tooling only; no Kintone/live impact.

**Risk:** unsafe static file routing or preview/source divergence. Mitigate with strict `/src/` path containment and use the exact production source component.

**Test:** browser smoke of six representative statuses + appraiser/ratio selectors; zero fatal renderer errors; zero Kintone calls.

**Rollback:** revert this preview-only implementation commit. No Kintone rollback applies.

## 10. STOP CONDITION

Push the same branch and STOP with the local preview server running.
Do not deploy App794.
Do not continue to Scoring Runtime, Dashboard or Hoshin.
