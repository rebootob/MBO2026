# AI ACTIVE TASK — M10L-D-R10 HOSHIN UNDEFINED SNAPSHOT REGRESSION FIX

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting reviewed HEAD: `b8a4edd14f56f6dae679659ceefc191d449ad164`
> Mode: REPOSITORY FIX + TESTS ONLY
> Kintone write/deploy authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

# USER RUNTIME EVIDENCE

On live App794 create page for employee 0118 after R8/R9:
- Kintone fatal banner: `event.record['Department_Hoshin'].value is invalid.`
- Kintone fatal banner: `event.record['Section_Hoshin'].value is invalid.`
- inline fail-closed error: `Form state read-back mismatch for field Routing_Topology: expected "M1_G1", got undefined`
- employee remains unverified and Objective Grid stays locked.

Treat this screenshot as authoritative runtime evidence overriding prior broad browser-smoke PASS claims.

# PROVEN ROOT CAUSE FROM CURRENT SOURCE

`src/services/employee-service.js` intentionally returns only the verified 9 employee header snapshot fields and explicitly excludes Hoshin. Therefore `empProfile.Department_Hoshin` and `empProfile.Section_Hoshin` are `undefined`.

`src/main-mbo-app.js` currently includes both undefined values in `fieldsToSync`, then unconditionally does:

`if (record[k]) record[k].value = val;`

This poisons the Kintone event record with invalid `undefined` Hoshin values. The later verified form-state persistence/read-back then fails, surfacing Routing_Topology as undefined.

Existing tests do not model this real Kintone failure: the mock `kintone.app.record.set()` simply replaces `currentFormRecord` and does not reject invalid field values.

# CHANGE GOVERNANCE

## What
Fix only the undefined Hoshin snapshot mutation and harden snapshot assignment so absent source values cannot poison existing Kintone fields.

## Where
Prefer only:
- `src/main-mbo-app.js`
- `tests/objective-save-validation.test.js`
- deterministic `dist/mbo-employee-app.js`
- minimal living evidence docs after implementation

Do not change `EmployeeService` Hoshin ownership unless a test proves that is required. Hoshin is not part of its verified employee snapshot contract.

## How
1. Do not include `Department_Hoshin` / `Section_Hoshin` in employee lookup snapshot assignment when source value is undefined.
2. Harden the generic in-memory assignment loop so `undefined` never overwrites a Kintone field value.
3. Preserve existing valid Hoshin/form values unchanged when lookup source does not own them.
4. Preserve the 9 required core persistence fields and fail-closed read-back behavior.
5. Do not weaken Routing_Topology verification.
6. Do not add parallel sync functions or test globals.

## Why
Live Kintone rejects the poisoned Hoshin values, causing employee verification and Routing_Topology persistence to fail.

## Impact
0118 lookup should complete without invalid Hoshin errors; required snapshot fields can persist/read back; employee can become verified only after that succeeds.

## Risks
Accidentally skipping legitimate falsy values or weakening required snapshot persistence.

## Test Plan
Add focused regressions:
- employee lookup source has no Hoshin values;
- existing Department_Hoshin/Section_Hoshin values are not overwritten with undefined;
- no field in assignment receives undefined from absent optional source values;
- Routing_Topology persists and reads back as `M1_G1`;
- 0118 becomes verified only after persistence passes;
- Profile_Code remains `PROF_STAFF_CHIEF` and 70/30;
- existing missing-field / set-throw / no-op / scoring zero-duplicate / workflow tests remain green;
- classic bundle parse + source/dist exactness;
- full `npm test` PASS.

## Rollback Plan
Repository-only rollback to starting reviewed HEAD if tests fail. No Kintone rollback because this task has zero Kintone writes.

# CREDIT-SAVING RULE

Do NOT perform broad discovery.
Do NOT call Kintone.
Do NOT run browser smoke.
Do NOT inspect unrelated project history.
Read only the two source/test files named above plus existing build command as needed.
Make the minimum code change, run targeted tests first, then one full `npm test`, rebuild dist once, verify exactness, push and STOP.

# REQUIRED EVIDENCE

`M10L_D_R10 = COMPLETE / PARTIAL / BLOCKED`
`ROOT_CAUSE_HOSHIN_UNDEFINED = CONFIRMED`
`UNDEFINED_FIELD_MUTATION_GUARD = PASS/FAIL`
`HOSHIN_EXISTING_VALUE_PRESERVED = PASS/FAIL`
`ROUTING_TOPOLOGY_READBACK_TEST = PASS/FAIL`
`0118_PROFILE_REGRESSION = PASS/FAIL`
`SOURCE_CHANGED = YES/NO`
`DIST_CHANGED = YES/NO`
`SOURCE_DIST_EXACTNESS = PASS/FAIL`
`CLASSIC_BUNDLE_PARSE = PASS/FAIL`
`npm test = actual / PASS|FAIL`
`GIT_DIFF_CHECK = PASS/FAIL`
`KINTONE_CALLS_THIS_TASK = 0`
`KINTONE_WRITES_THIS_TASK = 0`
`APP794_DEPLOY_THIS_TASK = 0`
`GIT_PUSH_SYNC = PASS/FAIL`
`NEXT_ACTION = CHATGPT REVIEW`

Push same branch and STOP.