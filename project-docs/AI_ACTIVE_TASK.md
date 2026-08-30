# AI ACTIVE TASK — APP794 FATAL CREATE CLEAN-EXIT CORRECTIVE R2 / SOURCE ONLY

Mode: **ANTIGRAVITY SOURCE IMPLEMENTATION + TEST + LOCAL BUILD ONLY — NO KINTONE NETWORK / NO LIVE WRITE / NO DEPLOY**  
Branch: `ai/antigravity-wp002c`

## 1. R1 Independent Review Result

R1 executor source commit:

`ec79f02b3667d08e438c0b1997b0c521dfb86699`

ChatGPT independent decision:

`CORRECTIVE / NOT ACCEPTED`

Do not deploy R1.

R1 repository scope was narrow and allowed, but the implementation does not yet satisfy the required clean-exit behavior.

## 2. Exact Defects To Correct

### Defect A — Fiscal Year mutation still occurs before duplicate preflight

R1 still has this Create mutation before its new duplicate preflight:

```js
if (isCreate && record.Fiscal_Year && !record.Fiscal_Year.value) {
  record.Fiscal_Year.value = 'FY2026';
}
```

The R1 test did not catch this because its fatal Create mock omitted `Fiscal_Year` entirely.

Required correction:
- derive intended Fiscal Year locally, e.g. current nonblank value or approved default `FY2026`, without changing `event.record`;
- duplicate-check must run before any Fiscal Year default assignment, `ui.executeLookup(...)`, snapshot mutation, `syncRecordToKintone(...)`, or other Create form mutation;
- only after duplicate preflight passes may the normal Create initialization/default/autoload path mutate the form.

### Defect B — Native Save/Cancel hiding is not fatal-state scoped

R1 calls `hideNativeSaveCancelControls()` from generic `renderBlockedNotice()`.

That is too broad and violates the contract that native action suppression is specific to authenticated terminal duplicate/fatal Create.

R1 also uses broad selector:

`button.gaiav2-app-statusbar-action`

This selector is not proven to be Save/Cancel only and must not be used for the scoped fatal-state behavior.

Required correction:
- generic `renderBlockedNotice()` must not automatically hide native actions;
- expose an explicit option such as `hideNativeSaveCancel: true` only on the authenticated terminal fatal Create call site, or equivalent narrow mechanism;
- use specific selectors/elements proven to represent Save and Cancel only;
- normal Create/Edit native controls remain untouched;
- unrelated blocked notices remain untouched unless existing behavior already independently requires something else.

## 3. Exact Required Behavior

Authenticated duplicate same-year `app.record.create.show`:

```text
DUPLICATE_PREFLIGHT             = BEFORE ANY NATIVE RECORD MUTATION
FISCAL_YEAR_PRECHECK_VALUE      = DERIVED LOCALLY
INCOMING_FATAL_RECORD_STATE     = PRESERVED / UNMODIFIED
KINTONE_RECORD_SET              = 0
RECORD_CREATE_OR_SAVE           = 0
WORKFLOW_MUTATION               = 0
AUTH_SESSION_MUTATION           = 0
ERROR_MESSAGE                   = VISIBLE
BACK_TO_MY_MBO_COUNT            = EXACTLY 1
BACK_TARGET                     = /k/794/
BACK_TAB                        = SAME TAB
NATIVE_SAVE                     = HIDDEN
NATIVE_CANCEL                   = HIDDEN
LEAVE_CONFIRM_ON_BACK           = MUST NOT APPEAR
GLOBAL_UNLOAD_SUPPRESSION       = 0
```

Normal successful Create:

```text
DUPLICATE_PREFLIGHT             = PASS FIRST
FISCAL_YEAR_DEFAULT             = EXISTING NORMAL BEHAVIOR PRESERVED AFTER PREFLIGHT
AUTOLOAD/SNAPSHOT               = EXISTING NORMAL BEHAVIOR PRESERVED
BACK_TO_MY_MBO                  = HIDDEN
NATIVE_SAVE_CANCEL              = NORMAL KINTONE BEHAVIOR
UNSAVED_CHANGE_PROTECTION       = PRESERVED
```

Normal Detail/Edit and other blocked states:

```text
EXISTING BACK BEHAVIOR          = PRESERVED
NATIVE ACTION HIDING            = NOT INTRODUCED BY THIS FATAL-CREATE FEATURE
GLOBAL UNSAVED PROTECTION       = PRESERVED
```

## 4. Forbidden Implementations

Do NOT:
- set `window.onbeforeunload = null`;
- remove/override global `beforeunload` listeners;
- monkey-patch browser/Kintone navigation globally;
- disable normal Create/Edit unsaved-change protection;
- auto-save or auto-cancel the record;
- use broad status/action selectors to hide unrelated native buttons;
- call fatal-state Save/Cancel hiding from generic `renderBlockedNotice()` without an explicit fatal-only option;
- perform any Kintone GET/POST/PUT/DELETE;
- deploy/upload customization;
- edit Control Center, Active Task, baselines, or skills as executor;
- broaden/refactor unrelated source.

## 5. Allowed Files / Ownership

Feature contract:

```text
FEATURE                    = Fatal duplicate Create clean-exit recovery R2
CANONICAL_SOURCE_OWNER     = src/main-mbo-app.js
SUPPORTING_MODULES         = src/ui/employee-record-navigation.js only if truly required
FOCUSED_TESTS              = tests/employee-main-mbo-app-integration.test.js
                             tests/employee-record-navigation.test.js if navigation module changes
GENERATED_DIST_OUTPUT      = dist/mbo-employee-app.js via normal build only
LIVE_RESOURCE_IF_ANY       = NONE
```

Allowed repository changes:
- `src/main-mbo-app.js`;
- `src/ui/employee-record-navigation.js` only if strictly required;
- `tests/employee-main-mbo-app-integration.test.js`;
- `tests/employee-record-navigation.test.js` only if required;
- `dist/mbo-employee-app.js` only through normal build.

No new file/module.

## 6. Mandatory Tests / Proof

Strengthen focused tests so they actually exercise the missed path.

### A. Fatal duplicate with real Fiscal Year field

Fatal Create test input must include at minimum:

```js
Fiscal_Year: { value: '' }
```

and capture the incoming value before handler execution.

After duplicate rejection assert:
- `Fiscal_Year.value` is still exactly the incoming value (`''` in this regression case);
- Employee_Code/profile/snapshot fields are not populated;
- `kintone.app.record.set(...)` count = 0;
- record save/create API count = 0;
- workflow/auth/session mutations = 0.

Also test a nonblank incoming Fiscal Year and ensure duplicate query uses it without rewriting it before rejection.

### B. Fatal-only native controls

Prove:
- terminal authenticated duplicate/fatal Create hides the real mocked Save and Cancel controls;
- normal successful Create does not hide them;
- pre-auth Create blocked notice does not receive this fatal-state native-control hiding;
- existing Detail/Edit blocked notice does not receive this fatal-state native-control hiding;
- no broad generic statusbar selector is required to make the test pass.

### C. Normal Create continuation

When duplicate preflight passes:
- Fiscal Year default becomes `FY2026` exactly as current behavior requires when incoming value is blank;
- normal profile/autoload continues;
- no record-level Back is shown;
- native Save/Cancel remain normal.

### D. No unload bypass

Static/runtime regression must prove customization does not assign/clear global `onbeforeunload` and does not register a fatal-specific global bypass.

Run at least:

```text
node --test tests/employee-record-navigation.test.js tests/employee-main-mbo-app-integration.test.js
npm run ui:build
node --test tests/classic-bundle.test.js tests/css-structure.test.js
```

If `employee-record-navigation.js` is unchanged, its test still must pass unchanged.

Report exact command outputs/PASS counts and exact changed files.

## 7. Safety Boundary

```text
LIVE_APP794_REVISION          = 58
LIVE_SOURCE_COMMIT            = 98108e9e387d01b6d3c3a35cce5baf13324be50e
ACCEPTED_KNOWN_GOOD_REVISION  = 57
R1_SOURCE_COMMIT              = ec79f02b3667d08e438c0b1997b0c521dfb86699
R1_SOURCE_REVIEW              = CORRECTIVE / NOT ACCEPTED
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ROLLBACK_AUTH                 = NONE
```

Zero Kintone network activity and zero deploy activity are authorized.

## 8. Delivery Contract

Deliver one narrow R2 implementation commit.

Report:
- exact root cause corrected;
- exact changed files;
- how Fiscal Year is derived without mutation before duplicate preflight;
- how normal defaulting resumes only after preflight success;
- how Save/Cancel hiding is fatal-state-only;
- focused test commands + PASS counts;
- build result;
- generated dist status;
- commit SHA.

Then STOP for ChatGPT Independent Review.

Maximum executor status:

`APP794_FATAL_CREATE_CLEAN_EXIT_R2_SOURCE_IMPLEMENTED_PENDING_CHATGPT_REVIEW`
