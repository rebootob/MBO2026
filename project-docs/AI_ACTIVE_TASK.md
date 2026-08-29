# AI ACTIVE TASK — APP794 WP2 R4 ERROR-STATE BACK NAV / CORRECTIVE R2 SOURCE-ONLY

Mode: **ANTIGRAVITY SOURCE EXECUTION ONLY — NO LIVE KINTONE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. Review Result / Why R2 Exists

ChatGPT independent review of commit `4852915c13c4edf58306b1f751c99d25c0c88e69` = **CORRECTIVE**.

The commit correctly added canonical Back navigation to several existing Detail/Edit blocking states, but it did **not** satisfy the exact user screenshot/request.

The screenshot is the App794 **Create flow** (`/k/794/edit`) after authenticated Employee-Self autoload fails because the employee already has an MBO for FY2026. The resulting `Employee Profile Resolution Failed` fatal screen has no usable business continuation and the user explicitly requires:

`← กลับหน้า My MBO / Back to My MBO`

The prior R4 task incorrectly generalized `Create = 0 Back controls`. That Control Plane interpretation is superseded by this R2 packet.

## 2. Exact User-Facing Rule

For App794:

```text
Normal successful Create screen                       = 0 Back controls
Create Login/Auth-required state before authentication = 0 Back controls
Authenticated Create fatal/autoload/duplicate error    = exactly 1 Back control
Existing Detail/Edit normal state                      = exactly 1 Back control
Existing Detail/Edit fatal/blocking state               = exactly 1 Back control
```

Back label:

`← กลับหน้า My MBO / Back to My MBO`

Same-tab target:

`/k/{currentAppId}/`

For App794: `/k/794/`.

The exact screenshot class that MUST be covered is:
- authenticated `app.record.create.show`;
- automatic Employee profile/autoload path runs;
- duplicate MBO check or equivalent profile-resolution prerequisite fails;
- `Employee Profile Resolution Failed` blocking screen is rendered;
- the screen MUST retain/show exactly one Back to My MBO control.

## 3. Review of R1 Commit — Retain What Is Correct

Commit `4852915c13c4edf58306b1f751c99d25c0c88e69` may be used as the corrective base.

Retain its correct behavior unless a focused test proves otherwise:
- canonical `EmployeeRecordNavigation` reuse;
- existing Detail/Edit mismatch/blocking state Back navigation;
- render-exception recovery on existing Detail/Edit;
- no raw duplicated `<a>` implementation;
- no CSS change;
- no Password Reset change;
- no Control docs changed by Antigravity.

Do NOT revert working Detail/Edit R4 changes merely to fix Create fatal recovery.

## 4. Read Set — NO BROAD SCAN

Read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/UI_UX.md`
4. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
5. `skills/mbo-kintone-ui-runtime-debugging/SKILL.md`
6. `src/main-mbo-app.js`
7. `src/ui/employee-record-navigation.js`
8. `tests/employee-main-mbo-app-integration.test.js`
9. `tests/employee-record-navigation.test.js`
10. `scripts/kintone/build-mbo-ui.js` only for normal build
11. `dist/mbo-employee-app.js` generated output only; never hand-edit

Do not broad-scan the repository.

## 5. Canonical Ownership / Preferred Correction

```text
CANONICAL_NAV_OWNER     = src/ui/employee-record-navigation.js
ERROR_ORCHESTRATION     = src/main-mbo-app.js
FOCUSED_TESTS           = tests/employee-main-mbo-app-integration.test.js
GENERATED_DIST          = dist/mbo-employee-app.js
LIVE_RESOURCE           = NONE
```

The current helper couples Back visibility to `isCreate`. That coupling caused the requirement miss.

Preferred minimal design:
- give `renderBlockedNotice(...)` an explicit recovery-navigation option such as `showBackToMyMbo: true|false` (name may vary clearly);
- do **not** infer Back visibility solely from `isCreate`;
- existing Detail/Edit fatal/blocking callers set recovery Back = true;
- authenticated Create autoload/profile-resolution fatal catch sets recovery Back = true;
- Create Login/Auth-required states keep recovery Back = false;
- successful normal Create continues to use the normal renderer and shows zero Back controls.

Reuse `EmployeeRecordNavigation`. Do not copy link markup/text/href into `main-mbo-app.js`.

## 6. Required Focused Tests

At minimum prove:
1. normal successful Create = zero `[data-mbo-back-nav-bar]`;
2. deterministic authenticated Create duplicate/profile-resolution fatal error = exactly one Back bar;
3. that Create fatal Back href = `/k/794/` and exact bilingual label;
4. Create authentication-required/login error before authenticated autoload = zero Back bars;
5. existing Detail blocking state = exactly one Back bar;
6. existing Edit blocking state = exactly one Back bar;
7. no normal Detail/Edit duplicate Back bar;
8. Back navigation causes zero record/auth/session/workflow writes;
9. existing navigation tests continue to pass;
10. the previous R1 test assertion that **all Create error states must have zero Back** must be removed/replaced because it contradicts the user-confirmed fatal Create recovery requirement.

The deterministic Create fatal test should exercise the real `main-mbo-app.js` registered event path far enough to prove the screenshot class, not merely test `EmployeeRecordNavigation` in isolation.

## 7. Verification

Run:

```text
node --test tests/employee-record-navigation.test.js tests/employee-main-mbo-app-integration.test.js
npm run ui:build
node --test tests/classic-bundle.test.js tests/css-structure.test.js
```

If another directly affected focused test is required, run it and report it. Do not broaden into unrelated suites without cause.

## 8. Explicitly Forbidden

Do NOT:
- deploy to Live Kintone;
- write App794/App800/App801 records;
- change schema/layout/ACL/process;
- change App795/App796;
- change D1 Password Reset Core R1;
- change My MBO table or Comment Mirror;
- change CSS unless a proven direct need appears (STOP first if so);
- duplicate Back markup/component;
- revive Auth Bridge;
- modify `AI_CONTROL_CENTER.md` or replace/close `AI_ACTIVE_TASK.md` during execution;
- self-certify PASS.

## 9. Delivery Contract

Deliver one narrow corrective commit:
- minimal `src/main-mbo-app.js` correction;
- focused integration test correction/addition;
- generated `dist/mbo-employee-app.js` from normal build;
- commit + push to `ai/antigravity-wp002c`;
- report SHA, changed files, test/build results;
- STOP for ChatGPT independent review.

Maximum executor status:

`APP794_WP2_R4_R2_FATAL_CREATE_BACK_IMPLEMENTED_PENDING_CHATGPT_REVIEW`

No Live action follows automatically.