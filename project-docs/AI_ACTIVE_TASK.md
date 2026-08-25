# AI ACTIVE TASK — M10G-R2 APP794 RUNTIME COMPATIBILITY REPAIR

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed Head: `e7b8ae74e36775c01bec9e68d99442ae41947aa7`
> Mode: REPOSITORY FIX + TESTS ONLY — NO KINTONE DEPLOY / NO RECORD WRITE

# NORTH STAR

```text
App794 UI is visible again after rollback, but runtime is still BROKEN.
User browser evidence shows:

1) Search action error:
   isValidEmployeeCode is not defined

2) Kintone event.record validation errors:
   Manager_Level1_Approvers.value is invalid
   Manager_Level2_Approvers.value is invalid
   GM_Level1_Approvers.value is invalid
   GM_Level2_Approvers.value is invalid

Current live App794 must be classified as RECOVERY_PARTIAL / NOT BUSINESS-USABLE.
```

# CONFIRMED SOURCE FINDINGS FROM CONTROL PLANE

`src/core/fiscal-year-engine.js` exports `isValidEmployeeCode()` and the fixed classic bundle must make that function available to `EmployeeService.lookupEmployee()` after ES-module stripping.

`src/main-mbo-app.js` currently clears all listed fields using:

```js
record[k].value = '';
```

but the list includes User Selection fields:

```text
Manager_Level1_Approvers
Manager_Level2_Approvers
GM_Level1_Approvers
GM_Level2_Approvers
```

Kintone User Selection values must be arrays, so clearing them with an empty string is invalid and is consistent with the browser error.

# HARD SAFETY

```text
KINTONE_WRITES_THIS_TASK = 0
APP794_CUSTOMIZATION_DEPLOY = 0
APP794_SCHEMA_WRITE = 0
APP794_PROCESS_WRITE = 0
APP794_RECORD_WRITE = 0
APP794_ACL_WRITE = 0
APP53_WRITE = 0
APP795_WRITE = 0
APP796_WRITE = 0
OTHER_APP_WRITE = 0
```

# STEP 1 — REPRODUCE BOTH DEFECTS IN REPOSITORY TESTS

Before fixing, add/extend automated tests that fail for the current behavior:

A. Classic bundle dependency test:
- build the classic bundle using the existing build pipeline
- parse as classic script
- verify `isValidEmployeeCode` exists in the resulting runtime scope before `EmployeeService.lookupEmployee` can call it
- preferably execute a minimal EmployeeService lookup validation path in a sandboxed runtime instead of grep only

B. Kintone field-type reset test:
- User Selection fields must reset to `[]`
- scalar/text/dropdown fields may reset to `''` only where field type permits
- never assign `''` to User Selection fields

# STEP 2 — FIX EMPLOYEE VALIDATION DEPENDENCY

Inspect the existing classic bundle build order and `cleanEsModules()` behavior.

Required:

```text
isValidEmployeeCode declaration included exactly once in dist bundle
EmployeeService can reference it at runtime
no import/export residue
no duplicate helper implementation
```

Prefer fixing existing build composition/order. Do not copy/paste a second `isValidEmployeeCode` implementation into EmployeeService unless unavoidable and explicitly justified.

# STEP 3 — FIX KINTONE FIELD RESET TYPES

Modify the existing record-reset logic in `src/main-mbo-app.js` so fields are cleared according to their Kintone value type.

At minimum:

```text
User Selection fields:
Requester_User
Manager_Level1_Approvers
Manager_Level2_Approvers
GM_Level1_Approvers
GM_Level2_Approvers
First_Manager_User
Manager_User
GM_User
=> []

Scalar/text/date/dropdown fields
=> appropriate empty scalar value only if field exists and Kintone type permits
```

Do not silently alter field types. If exact App794 field types are uncertain, inspect existing schema/read-only contracts and fail closed rather than guessing.

# STEP 4 — CHECK ALL ROUTING FIELD ASSIGNMENTS

Review `fieldsToSync` and `syncRecordToKintone()` for User Selection values.

Required:
- App795 user selector arrays must remain arrays of Kintone user objects, e.g. `{ code, name? }`
- no stringification
- no object-vs-array mismatch
- blank optional approver user fields = `[]`
- no mutation that changes Kintone field descriptor/type

Add tests for:

```text
Requester_User one user
Manager L1 one/multiple users
Manager L2 empty
GM L1 one user
GM L2 empty
reset after changing Employee_Code
```

# STEP 5 — BUILD / CLASSIC RUNTIME GATES

Rebuild with existing pipeline.

Required:

```text
CLASSIC_BUNDLE_PARSE = PASS
ES_MODULE_IMPORT_COUNT = 0
ES_MODULE_EXPORT_COUNT = 0
BROKEN_FROM_RESIDUE_COUNT = 0
IS_VALID_EMPLOYEE_CODE_RUNTIME = PASS
USER_SELECTION_EMPTY_VALUE_TYPE = ARRAY
```

Add a durable regression test so future deployment cannot pass solely on syntax parse while missing imported runtime dependencies.

# STEP 6 — TEST

Run:

```bash
npm test
git diff --check
git status --short
```

No Kintone deployment in this task.

# NO-ORPHAN

Modify existing functions/modules. Do not create `_old`, `_v1`, duplicate runtime services, duplicate validators, or temporary active implementations.
Remove obsolete workaround logic if replaced safely.

# REQUIRED FINAL SUMMARY

```text
M10G_R2_APP794_RUNTIME_COMPATIBILITY_REPAIR = COMPLETE / BLOCKED

LIVE_APP794_CURRENT_STATUS = RECOVERY_PARTIAL / NOT_BUSINESS_USABLE
DEFECT_1_ISVALIDEMPLOYEECODE = FIXED / BLOCKED
DEFECT_2_USER_SELECTION_INVALID_VALUE = FIXED / BLOCKED

FILES_CHANGED = exact
IS_VALID_EMPLOYEE_CODE_DECLARATION_COUNT_IN_BUNDLE = actual
IS_VALID_EMPLOYEE_CODE_RUNTIME_TEST = PASS/FAIL
USER_SELECTION_RESET_TYPE_TEST = PASS/FAIL
ROUTING_USER_ARRAY_ASSIGNMENT_TEST = PASS/FAIL
CLASSIC_BUNDLE_PARSE = PASS/FAIL
ES_MODULE_IMPORT_COUNT = actual
ES_MODULE_EXPORT_COUNT = actual

KINTONE_WRITES_THIS_TASK = 0
APP794_CUSTOMIZATION_DEPLOY = 0
npm test = actual / PASS
GIT_DIFF_CHECK = PASS/FAIL
NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED
GIT_PUSH_SYNC = PASS/FAIL

FIXED_BUNDLE_DEPLOYED = NO
NEXT_ACTION = CHATGPT REVIEW / NEW EXPLICIT APP794 DEPLOY AUTHORIZATION REQUIRED
```

Update living docs so they no longer state App794 is fully recovered/healthy while these runtime defects remain.
Commit and push same branch, then STOP.

Do NOT deploy App794 in this task.
Do NOT create/update any App794 business record.
Do NOT write to any other Kintone app.
