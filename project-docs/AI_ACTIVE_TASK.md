# AI ACTIVE TASK — APP794 FATAL CREATE CLEAN-EXIT CORRECTIVE R1 / SOURCE ONLY

Mode: **ANTIGRAVITY SOURCE IMPLEMENTATION + TEST + LOCAL BUILD ONLY — NO KINTONE NETWORK / NO LIVE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. Proven Live Defect

Actual Live App794 Rev58 is technically deployed, but user UAT found this behavior:

1. Authenticated Create attempts a duplicate Employee_Code/Fiscal Year.
2. System correctly blocks with `Employee Profile Resolution Failed` and duplicate message.
3. Exactly one `← กลับหน้า My MBO / Back to My MBO` is visible.
4. Clicking Back triggers Kintone/browser confirmation:
   `ออกจากเว็บไซต์ไหม / changes may not be saved`.
5. Native Kintone `Save` and `Cancel` remain visible on the terminal error screen.

User requirement:

**On this terminal duplicate/fatal Create state, there must be no leave-confirm popup and no native Save/Cancel controls.**

Normal Create/Edit unsaved-change protection must remain unchanged.

## 2. Exact Target Behavior

For authenticated `app.record.create.show` duplicate/fatal recovery only:

```text
ERROR_MESSAGE                    = REMAINS VISIBLE
BACK_TO_MY_MBO_COUNT             = EXACTLY 1
BACK_TARGET                      = /k/794/
BACK_TAB                         = SAME TAB
NATIVE_SAVE                      = HIDDEN
NATIVE_CANCEL                    = HIDDEN
LEAVE_CONFIRM_ON_BACK            = MUST NOT APPEAR
RECORD_CREATE_OR_SAVE            = 0
WORKFLOW_MUTATION                = 0
AUTH_SESSION_MUTATION            = 0
```

For normal successful Create:

```text
BACK_TO_MY_MBO                   = HIDDEN
NATIVE_SAVE_CANCEL               = NORMAL KINTONE BEHAVIOR
UNSAVED_CHANGE_PROTECTION        = PRESERVED
```

For normal Detail/Edit:

```text
BACK_TO_MY_MBO                   = EXISTING BEHAVIOR PRESERVED
NATIVE_SAVE_CANCEL               = NORMAL KINTONE BEHAVIOR
UNSAVED_CHANGE_PROTECTION        = PRESERVED
```

Pre-auth/login-required Create remains separate and must not gain this fatal-state recovery behavior.

## 3. Mandatory Root-Cause Approach

Do **not** solve this by globally suppressing browser/Kintone unload protection.

First trace the exact Create path in current source and identify what dirties/mutates the native form before duplicate detection. Pay particular attention to:
- default `Fiscal_Year = FY2026` mutation;
- Employee profile lookup/autoload;
- `syncRecordToKintone(...)` / `kintone.app.record.set(...)`;
- any `onFieldChange` or snapshot/routing mutation before duplicate result is known.

Preferred safe design:

1. Derive the intended Fiscal Year for duplicate checking **without mutating the native record**.
2. Perform the duplicate/same-year preflight before any normal Create autoload/default/synchronization that would dirty the native form.
3. If duplicate/fatal terminal result is found:
   - keep native Create record clean/unmodified;
   - render the existing fail-closed error;
   - mount the canonical Back component exactly once;
   - hide native Save/Cancel only for this terminal fatal state;
   - clicking Back can leave to `/k/794/` without an unsaved-change confirmation.
4. If duplicate preflight passes:
   - continue the existing normal Create initialization/autoload behavior;
   - preserve all current business logic and validations.

If the exact source architecture requires a different narrow implementation, it must still prove the same invariants and explain why. Do not use a global unload bypass.

## 4. Forbidden Implementations

Do NOT:
- set `window.onbeforeunload = null`;
- remove/override global `beforeunload` listeners;
- monkey-patch browser/Kintone navigation globally;
- disable unsaved-change protection for normal Create/Edit;
- auto-click browser confirmation;
- auto-save/cancel the record to escape the page;
- perform any record PUT/POST/DELETE;
- perform Kintone network calls during this task;
- hide Save/Cancel through broad/global CSS affecting normal screens;
- refactor unrelated code;
- rename/move stable files;
- edit `AI_CONTROL_CENTER.md`, `AI_ACTIVE_TASK.md`, baselines or skills as executor.

## 5. Source Ownership / Allowed Files

Start from current canonical branch HEAD after pulling.

Feature contract:

```text
FEATURE                    = Fatal duplicate Create clean-exit recovery
CANONICAL_SOURCE_OWNER     = src/main-mbo-app.js
SUPPORTING_MODULES         = src/ui/employee-record-navigation.js only if truly needed
FOCUSED_TESTS              = tests/employee-main-mbo-app-integration.test.js
                             tests/employee-record-navigation.test.js
GENERATED_DIST_OUTPUT      = dist/mbo-employee-app.js via normal build only
LIVE_RESOURCE_IF_ANY       = NONE
```

Allowed repository changes are limited to:
- `src/main-mbo-app.js`;
- `src/ui/employee-record-navigation.js` only if required for the scoped navigation behavior;
- `tests/employee-main-mbo-app-integration.test.js`;
- `tests/employee-record-navigation.test.js`;
- `dist/mbo-employee-app.js` only as generated output from the normal build.

Do not change CSS unless you can prove a CSS change is strictly required. Prefer fatal-state-scoped DOM behavior over a global stylesheet rule for native Kintone controls.

No new source module/file unless the current architecture makes it genuinely necessary; if you believe a new file is needed, STOP and report before creating it.

## 6. Required Tests / Proof

Add or strengthen tests that prove at minimum:

### A. Duplicate fatal path stays clean before exit
- duplicate same-year path is detected before normal Create record synchronization;
- no `kintone.app.record.set(...)` caused by Create autoload on this terminal duplicate path;
- no record save/create API occurs;
- default Fiscal Year may be computed locally for duplicate checking but must not dirty the native form before duplicate rejection;
- record/workflow/auth/session mutation counts remain zero.

### B. Fatal UI actions
- exactly one Back control;
- target `/k/794/` same tab;
- native Save hidden only in terminal fatal state;
- native Cancel hidden only in terminal fatal state;
- no global unload/beforeunload suppression is installed.

### C. Normal Create regression
- normal successful Create still has no record-level Back;
- Fiscal Year/default/autoload behavior still works after duplicate preflight passes;
- native Save/Cancel remain normal;
- normal unsaved-change behavior is not disabled by the customization.

### D. Detail/Edit regression
- normal existing Detail/Edit still shows exactly one Back;
- existing fatal Detail/Edit recovery remains intact;
- native Edit actions are not globally hidden.

Run at least:

```text
node --test tests/employee-record-navigation.test.js tests/employee-main-mbo-app-integration.test.js
npm run ui:build
node --test tests/classic-bundle.test.js tests/css-structure.test.js
```

If existing relevant focused regression tests exist for auth/session/create path, run them too. Do not invent broad unrelated test work.

After build:
- `dist/mbo-employee-app.js` may change only as generated output;
- do not manually edit `dist`;
- report exact files changed and test counts.

## 7. Safety Boundary

```text
LIVE_APP794_REVISION         = 58
ACCEPTED_KNOWN_GOOD_REVISION = 57
ACTIVE_DEPLOY_AUTH           = NONE
ACTIVE_KINTONE_WRITE_AUTH    = NONE
ROLLBACK_AUTH                = NONE
```

This task authorizes **zero** Kintone GET/POST/PUT/DELETE calls and **zero** deployment activity.

Do not:
- upload customization;
- update Preview customization;
- deploy;
- retry Rev58;
- rollback;
- write App794/App800/App801/App795/App796 records;
- change schema/layout/ACL/process.

## 8. Delivery Contract

Deliver one narrow source implementation commit on `ai/antigravity-wp002c`.

Report concisely:
- root cause found;
- exact source files changed;
- exact behavior used to keep fatal duplicate path clean;
- how native Save/Cancel are hidden only in fatal state;
- focused test commands + PASS counts;
- build result;
- generated dist status;
- commit SHA.

Then STOP for ChatGPT independent review.

Maximum executor status:

`APP794_FATAL_CREATE_CLEAN_EXIT_R1_SOURCE_IMPLEMENTED_PENDING_CHATGPT_REVIEW`
