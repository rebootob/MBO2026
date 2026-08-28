# AI ACTIVE TASK — D1 FINAL PRE-UPLOAD SAFETY CORRECTIVE

> Read `project-docs/AI_CONTROL_CENTER.md` FIRST.  
> Execution Plane: Antigravity  
> Branch: `ai/antigravity-wp002c`  
> Mode: **SOURCE / TEST ONLY — NO LIVE KINTONE WRITE**

## 0. Review State

Commit reviewed:

```text
5f08dd6a4b2f7ad1f245df0f8e1de2d4ac7297b7
```

Accepted from that commit:
- preflight is called before upload;
- Preview fileKey sourcing/preservation remains correct;
- basic URL/FILE validation exists;
- missing/ambiguous target is checked before upload;
- CSS is not uploaded;
- modular source architecture is preserved.

**Do not redo those accepted corrections.**

Only the exact fail-closed gaps below remain.

## 1. Read Only These Inputs

1. `project-docs/AI_CONTROL_CENTER.md`
2. this `project-docs/AI_ACTIVE_TASK.md`
3. `scripts/kintone/deploy-custom-ui.js`
4. `tests/deploy-customization-preservation.test.js`
5. `project-docs/CONFIRMED_BASELINE/SOURCE_CODE_ARCHITECTURE.md` only for the no-broad-refactor rule

Do not scan repository/history.
Do not reopen business/UI/auth modules.

## 2. Exact Defects to Fix

### A. Require explicit customization containers/lists

Before upload, both live and Preview state must explicitly contain:

```text
desktop = object
desktop.js = array
desktop.css = array
mobile = object
mobile.js = array
mobile.css = array
```

Do not default a missing list to `[]` during preflight/topology validation.

A missing/malformed container/list must fail closed before upload.

### B. Validate Kintone scope strictly

Accepted customization scopes are only:

```text
ALL
ADMIN
NONE
```

Require both live and Preview scope to be one of those values and equal.
Unknown/non-string/blank scope must fail before upload.

### C. Validate Preview revision as a real concurrency guard

Require Preview revision to represent a positive integer revision.

Reject:
- missing/blank;
- malformed/non-numeric;
- `-1` because Kintone uses `-1` to disable revision checking;
- zero/negative values.

Include the exact accepted Preview revision in Preview PUT.

### D. Scope the target fileKey exemption to the exact target entry

The only Preview FILE allowed to omit its OLD fileKey during preflight is:

```text
preview.desktop.js
+ type = FILE
+ file.name = mbo-employee-app.js
+ exactly one matching entry
```

Every other Preview FILE entry must have a non-empty Preview fileKey, including:
- desktop.css;
- mobile.js;
- mobile.css;
- any same-named FILE outside the exact desktop JS target location.

Do not exempt retained FILE entries merely because their filename equals the target filename.

## 3. Required Safe Order

```text
GET live customize
GET preview customize
FULL PREFLIGHT
  -> explicit containers/lists
  -> valid scope
  -> valid positive Preview revision, not -1
  -> valid entry structures/types
  -> topology alignment
  -> exactly one preview desktop JS target
  -> every retained Preview FILE key present
ONLY THEN
  -> upload exactly one replacement JS
  -> build Preview PUT payload
  -> PUT Preview with the accepted revision
```

Invalid preflight must result in zero upload/PUT/deploy calls.

## 4. Focused Tests

Update the existing focused test file only as needed.

Tests must prove at minimum:

```text
VALID_PREFLIGHT_PASS = PASS
MISSING_DESKTOP_OBJECT_BLOCKED_PRE_UPLOAD = PASS
MISSING_MOBILE_OBJECT_BLOCKED_PRE_UPLOAD = PASS
MISSING_DESKTOP_JS_ARRAY_BLOCKED_PRE_UPLOAD = PASS
MISSING_DESKTOP_CSS_ARRAY_BLOCKED_PRE_UPLOAD = PASS
MISSING_MOBILE_JS_ARRAY_BLOCKED_PRE_UPLOAD = PASS
MISSING_MOBILE_CSS_ARRAY_BLOCKED_PRE_UPLOAD = PASS
INVALID_SCOPE_BLOCKED_PRE_UPLOAD = PASS
VALID_SCOPES_ALL_ADMIN_NONE = PASS
REVISION_MINUS_ONE_BLOCKED_PRE_UPLOAD = PASS
REVISION_NON_NUMERIC_BLOCKED_PRE_UPLOAD = PASS
REVISION_ZERO_OR_NEGATIVE_BLOCKED_PRE_UPLOAD = PASS
TARGET_MISSING_BLOCKED_PRE_UPLOAD = PASS
TARGET_AMBIGUOUS_BLOCKED_PRE_UPLOAD = PASS
TARGET_OLD_FILEKEY_MAY_BE_REPLACED = PASS
SAME_FILENAME_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD = PASS
SAME_FILENAME_MOBILE_JS_MISSING_KEY_BLOCKED_PRE_UPLOAD = PASS
SAME_FILENAME_MOBILE_CSS_MISSING_KEY_BLOCKED_PRE_UPLOAD = PASS
NON_TARGET_CSS_PREVIEW_FILEKEY_PRESERVED = PASS
PREVIEW_REVISION_INCLUDED = PASS
ZERO_REMOTE_WRITES_ON_INVALID_PREFLIGHT = PASS
CSS_UPLOAD_COUNT = 0
```

Do not call real Kintone in tests.

## 5. Regression Gates

Run locally:

```text
npm run ui:build
npm test
```

Confirm no regression in accepted D1 areas:

```text
AUTH_ADAPTER_DEFINITION_COUNT = 1
LOGIN_GATE_DEFINITION_COUNT = 1
EMPLOYEE_CODE_50.03 = PASS
EMPLOYEE_CODE_50.02 = PASS
EMPLOYEE_CODE_0050_2 = PASS
DIST_CSS_UNCHANGED = YES
```

## 6. Explicitly Forbidden

- NO Kintone POST/PUT/DELETE;
- NO file upload to Kintone;
- NO App794 deploy/redeploy;
- NO rollback;
- NO App794 record write;
- NO App801 write;
- NO App53/795/796 write;
- NO group/ACL change;
- NO UAT;
- NO D2-D7 implementation;
- NO broad deploy-framework refactor;
- NO modularization of `employee-part-a-ui.js` in this task;
- NO merging modules into `main-mbo-app.js`;
- NO manual business-logic edits in generated `dist/mbo-employee-app.js`.

## 7. Delivery

Commit only necessary changes to:

```text
scripts/kintone/deploy-custom-ui.js
tests/deploy-customization-preservation.test.js
```

Generated dist may change only if `npm run ui:build` legitimately changes it; CSS must remain unchanged.

Do not modify Baseline, Control Center, Active Task, or Skills.
Do not commit secrets/live Kintone downloads.

Push one concise corrective commit and STOP.

Final report <= 15 lines:

```text
COMMIT_SHA
FILES_CHANGED
UI_BUILD_RESULT
NPM_TEST_RESULT
EXPLICIT_STRUCTURE_VALIDATION
VALID_SCOPE_GATE
VALID_REVISION_GATE
EXACT_TARGET_FILEKEY_EXEMPTION
SAME_FILENAME_NON_TARGET_BLOCKED
ZERO_REMOTE_WRITES_ON_INVALID_PREFLIGHT
DIST_CSS_UNCHANGED
KINTONE_WRITES_EXECUTED = 0
APP794_DEPLOY_EXECUTED = 0
STATUS = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

Maximum status:

```text
IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

STOP after push. ChatGPT performs the next independent review before any App794 redeploy is considered.
