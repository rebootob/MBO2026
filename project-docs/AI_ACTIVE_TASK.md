# AI ACTIVE TASK — APP794 WP2 R4 ERROR-STATE BACK NAV / SOURCE-ONLY

Mode: **ANTIGRAVITY SOURCE EXECUTION ONLY — NO LIVE KINTONE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. Trigger / User Evidence

User supplied Live App794 screenshot on 2026-08-30 showing an existing record error screen with visible Logout and a fatal bilingual error state, but **without** the required navigation:

`← กลับหน้า My MBO / Back to My MBO`

Target URL remains:

`/k/794/`

This is new regression evidence for an uncovered error/fallback path. WP2 R3 accepted normal UI remains known-good; do not rewrite it broadly.

## 2. Objective

Make the canonical Back-to-My-MBO navigation remain visible on **existing App794 Detail/Edit fatal error or fail-closed screens**, including the preparation/render failure class represented by the user screenshot.

This task is SOURCE-ONLY. It does not authorize any Live deploy or Kintone write.

## 3. Read Set — NO BROAD SCAN

Read only:
1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md`
4. `project-docs/CONFIRMED_BASELINE/UI_UX.md`
5. `skills/mbo-kintone-ui-runtime-debugging/SKILL.md`
6. `src/main-mbo-app.js`
7. `src/ui/employee-part-a-ui.js`
8. `src/ui/employee-record-navigation.js`
9. `src/styles/mbo-employee.css` only if styling is directly relevant
10. `tests/employee-main-mbo-app-integration.test.js`
11. `tests/employee-record-navigation.test.js`
12. `tests/css-structure.test.js` only if CSS is changed
13. `scripts/kintone/build-mbo-ui.js` only for normal build
14. `dist/mbo-employee-app.js` generated output only; never hand-edit

You may search the exact screenshot error wording only inside the files above / generated bundle to identify the real fallback path. Do not broad-scan the repository.

## 4. Canonical Ownership

```text
FEATURE                    = Back to My MBO navigation on existing record error states
CANONICAL_NAV_OWNER        = src/ui/employee-record-navigation.js
TOP_LEVEL_ORCHESTRATION    = src/main-mbo-app.js only if fallback/error orchestration requires it
NORMAL_RECORD_RENDERER     = src/ui/employee-part-a-ui.js
FOCUSED_TESTS              = tests/employee-main-mbo-app-integration.test.js + tests/employee-record-navigation.test.js
GENERATED_DIST_OUTPUT      = dist/mbo-employee-app.js
LIVE_RESOURCE              = NONE IN THIS TASK
```

Do NOT duplicate the Back-link markup/text/href implementation in multiple feature files. Reuse `EmployeeRecordNavigation` as the canonical owner.

## 5. Required Behavior

For App794:

### Existing Detail/Edit
Every user-visible fatal/error/fail-closed state that replaces or prevents the normal MBO body after entering an existing record must still provide exactly one prominent navigation control:

`← กลับหน้า My MBO / Back to My MBO`

with same-tab target:

`/k/{currentAppId}/`

For App794 this resolves to `/k/794/`.

This includes at minimum:
- fatal preparation/render fallback represented by the user screenshot;
- renderer exception fallback if `EmployeePartAUI.render()` throws before the normal Back bar can remain usable;
- configuration/unknown-status error states;
- authenticated existing-record blocking/error states where the normal business form is intentionally fail-closed.

### Create
`app.record.create.show` must NOT show Back to My MBO.

### Normal Detail/Edit
Normal Detail/Edit must continue to show exactly one Back control — no duplicate bar/button after this corrective.

### Safety
- Keep the actual error message visible and bilingual where already applicable.
- Do NOT weaken any fail-closed validation/error condition.
- Back navigation must not save, mutate record data, alter workflow, change auth/session state, or perform Kintone writes.
- Do not change Logout / Change Password behavior.
- Do not change My MBO table, Native Comment Mirror, routing, scoring, attachments or password-reset behavior.

## 6. Implementation Guidance

First identify the actual path that produces the screenshot/error fallback.

Preferred correction pattern:
- keep `EmployeeRecordNavigation` as the sole Back-link component;
- make the relevant fatal/fallback renderer/orchestrator mount/re-mount that canonical component for existing Detail/Edit before/alongside the error notice;
- if a generic blocking helper is extended, give it an explicit option/context rather than showing Back indiscriminately on Index/Login/Create;
- do not solve this by copying raw `<a>` markup or hardcoding another independent Back implementation in `main-mbo-app.js`.

Keep the diff minimal. No unrelated refactor.

## 7. Focused Tests — REQUIRED

Add/adjust focused tests proving at minimum:
1. normal existing Detail shows exactly one canonical Back control;
2. normal existing Edit shows exactly one canonical Back control;
3. a deterministic fatal/preparation/render failure on existing Detail still shows exactly one Back control plus the error state;
4. same for existing Edit where applicable;
5. configuration/unknown-status early-return still retains Back;
6. Create shows zero Back controls;
7. Back href resolves to `/k/794/` (or current injected App794 id) and uses the exact bilingual label;
8. Back action performs navigation only and causes zero record/auth/session/workflow write side effects;
9. no duplicate Back implementation is introduced;
10. existing WP2 navigation tests continue to pass.

If CSS changes, run CSS structure/scope regression and prove the Back selectors remain valid top-level selectors.

## 8. Verification

Run focused tests first, then the minimum directly relevant regressions:

```text
node --test tests/employee-record-navigation.test.js tests/employee-main-mbo-app-integration.test.js
npm run ui:build
node --test tests/classic-bundle.test.js tests/css-structure.test.js
```

If another existing focused test is directly required by the changed path, run it and report it. Do not run unrelated broad suites unless a direct failure requires escalation.

## 9. Explicitly Forbidden

Do NOT:
- deploy to Live Kintone;
- write App794/App800/App801 records;
- change schema/layout/ACL/process;
- modify App795/App796;
- modify D1 Password Reset R1 accepted source unless a regression test proves direct dependency (otherwise STOP);
- modify D7 Admin Support Center;
- revive Auth Bridge;
- reopen or redesign My MBO table / Comment Mirror / CSS globally;
- refactor unrelated UI modules;
- edit `dist/mbo-employee-app.js` manually;
- modify `AI_CONTROL_CENTER.md` or replace/close `AI_ACTIVE_TASK.md` during execution;
- self-certify PASS.

## 10. Delivery Contract

Deliver:
1. minimal source fix;
2. focused tests;
3. normal generated dist output if build changes it;
4. concise verification result;
5. one commit pushed to `ai/antigravity-wp002c`;
6. report commit SHA + changed files + commands/results;
7. STOP for ChatGPT independent review.

Maximum executor status:
`APP794_WP2_R4_ERROR_BACK_NAV_IMPLEMENTED_PENDING_CHATGPT_REVIEW`

No Live action follows automatically.
