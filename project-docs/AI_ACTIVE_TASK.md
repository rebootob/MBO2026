# AI ACTIVE TASK — M10L-D-R5 FINAL REPOSITORY + EXECUTION-PLAN CLOSURE

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed R4 HEAD: `7373ee557bfff5d90af8269f7f30df83edf7cc6f`
> Live App794 customization remains Revision `29`
> Mode: REPOSITORY CORRECTION / TESTS + DOCUMENTATION EXACTNESS ONLY
> Kintone write/deploy authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

R4 closed the substantive form-state persistence gap, but final review found three repository/evidence defects that must be closed before requesting any live App794 schema/customization authorization.

Do not add unrelated features.

# INDEPENDENT REVIEW DECISION

`M10L-D-R4 = MUST FIX`

## WHAT R4 GOT RIGHT

- `syncRecordToKintone()` now fail-closes on missing Kintone record APIs/current form state/missing required destination/set failure/read-back mismatch.
- Post-set read-back verifies 9 core snapshot fields semantically.
- R3 synthetic field behavior remains removed.
- `EmployeePartAUI.lastInstance` was removed.
- Live/preview App794 inventory confirms Revision 29 and six missing scoring snapshot fields.
- App796 `PROF_STAFF_CHIEF` + FY2026 + PUBLISHED count is 1 with 70/30 evidence.
- Reported test suite = 546 PASS.
- Kintone writes = 0.

## MUST FIX 1 — NEW GLOBAL TEST HOOK IN PRODUCTION BUNDLE

R4 introduced:

```js
globalThis.__MBO_APP__ = {
  getActiveUiInstance: () => activeUiInstance,
  syncRecordToKintone: (record, options) => syncRecordToKintone(record, options)
};
```

The tests depend on this global hook. This violates the R4 instruction:

- do not add another global mutable test hook;
- prefer dependency injection or a narrowly scoped module export/pure helper;
- do not expose test-only internals in the classic production bundle.

It also unnecessarily exposes a form-state mutation helper globally in the live browser runtime.

Required correction:
- remove `globalThis.__MBO_APP__` from source and committed dist;
- ensure the production classic bundle contains zero `__MBO_APP__` residue;
- use a clean source-module test seam that is stripped by the existing classic-bundle `cleanEsModules()` path, or use dependency injection/direct construction;
- no business-record pollution and no new global mutable hook.

A named ES-module export in source is acceptable if it is genuinely narrow and the deterministic classic bundle removes the export syntax/exposure. Do not create a new permanent file solely for this.

## MUST FIX 2 — REQUIRED API-UNAVAILABLE TEST COVERAGE IS INCOMPLETE

R4 task required distinct fail-closed coverage for:
- `kintone.app.record.get` unavailable;
- `kintone.app.record.set` unavailable.

Current R4 test named "get unavailable" makes `get()` return null, which covers unavailable current form state, not the function actually being absent. There is also no direct test proving `set` function absent causes lookup/persistence to fail closed.

Required tests:
1. `kintone.app.record.get` is not a function -> fail closed.
2. `kintone.app.record.set` is not a function -> fail closed.
3. current form state null -> fail closed.
4. set throws -> fail closed.
5. set no-op/read-back mismatch -> fail closed.
6. successful set + matching read-back -> PASS.
7. all failures must keep employee verification false on the integration path.

Do not manufacture verification success manually.

## MUST FIX 3 — FUTURE KINTONE EXECUTION PLAN HAS API/METHOD ERRORS + PERMISSION EVIDENCE CONTRADICTION

R4 durable plan currently says:
- add six missing fields using `PUT /k/v1/preview/app/form/fields.json`;
- upload customization via `POST /k/v1/preview/app/customize.json`.

For the planned operation these steps are not exact:
- the six fields are NEW fields, so the future task must use the Kintone Add Form Fields operation (`POST /k/v1/preview/app/form/fields.json` with the exact add-field payload), not an update-existing-fields PUT;
- customization file bytes must first be uploaded through `POST /k/v1/file.json` to obtain fileKey(s);
- customization settings must then be updated through `PUT /k/v1/preview/app/customize.json`, preserving unrelated live JS/CSS ordering/assets/mobile customization unless explicitly reviewed;
- deploy request must use the correct controlled deploy body (`{ apps: [{ app: 794 }] }`) and then poll/read status.

Repository evidence already confirms the existing deployment helper follows file upload POST -> customization PUT -> deploy POST. Use that API contract as implementation evidence, but do NOT execute the helper directly in the future controlled repair because it does not itself provide the required fresh backup/drift gate.

Also fix evidence consistency:
- inventory table says permission/access for the six missing fields = `UNVERIFIABLE`;
- final evidence block says `APP794_REQUIRED_SNAPSHOT_PERMISSION_GAPS = NONE`.

These cannot both be true. For fields that do not exist yet, current field-permission state is not established. Record the truthful value (`UNVERIFIABLE` / planned permission requirement) and distinguish current evidence from the future intended permission configuration.

# CONFIRMED BASELINE

Do not change canonical baseline.

- 0118 -> Staff & Chief.
- `PROF_STAFF_CHIEF` -> 70/30.
- Technical Service Chief -> `PROF_STAFF_CHIEF`.
- Missing/duplicate scoring profile -> FAIL CLOSED.
- Missing/duplicate routing -> FAIL CLOSED.
- App53 and legacy PMS apps remain READ ONLY.

# CHANGE GOVERNANCE

## What
Close the three review defects above only.

## Where
Prefer existing files:
- `src/main-mbo-app.js`
- `tests/objective-save-validation.test.js`
- `dist/mbo-employee-app.js`
- `project-docs/AI_REVIEW_PACKAGE.md`
- living docs only where factual status requires update

Modify `src/ui/employee-part-a-ui.js` only if genuinely required.

## How
Repository source/tests/docs only. Zero Kintone API writes and zero deploy.

## Why
The repo candidate and future authorized execution plan must be reviewable, fail-closed, and free of test-only production exposure before any live change.

## Expected Impact
No live App794 behavior changes in this task. Revision 29 remains untouched.

## Risks
- accidentally retaining global test surface in dist;
- tests passing through a seam that does not represent runtime behavior;
- future deployment task using wrong API method and corrupting/overwriting customization settings;
- conflating current missing-field permission evidence with future planned permission.

# PHASE A — REPOSITORY GATE

1. Pull latest same branch; local HEAD == origin.
2. Confirm only this Control Plane R5 task follows R4 before execution.
3. Run full tests before changes.
4. Run `git diff --check`.
5. Confirm App794 remains Revision 29 and no Kintone write/deploy occurs.

# PHASE B — REMOVE GLOBAL PRODUCTION TEST HOOK

1. Remove `globalThis.__MBO_APP__` entirely.
2. Tests must not depend on any replacement global mutable test hook.
3. Use the smallest clean test seam in an existing file:
   - named module export(s) stripped/not exposed by classic bundle; or
   - dependency injection/direct construction.
4. If using named source exports, prove committed classic dist contains no `export`, no `__MBO_APP__`, and no unintended browser-global test API.
5. Preserve actual runtime `activeUiInstance` behavior and submit gates.

# PHASE C — COMPLETE FAIL-CLOSED TEST MATRIX

At minimum prove:
- valid 0118 lookup + all 9 core snapshot form-state fields + post-set read-back -> verified true;
- Profile_Code destination absent -> fail closed;
- Configuration_Hash destination absent -> fail closed;
- `record.get` function absent -> fail closed;
- `record.set` function absent -> fail closed;
- current form state null -> fail closed;
- set throws -> fail closed;
- set no-op/read-back mismatch -> fail closed;
- USER_SELECT semantic comparison remains correct;
- NUMBER numeric-string semantic comparison remains correct;
- 0/duplicate App796 -> fail closed;
- 0111 and Factory Manager profile regressions PASS;
- Save/duplicate guards PASS;
- zero manual forcing of verification for the tested success path.

# PHASE D — CORRECT DURABLE FUTURE LIVE CHANGE PLAN

Update the dedicated R4/R5 section in `project-docs/AI_REVIEW_PACKAGE.md` in place. Do not create a parallel plan.

The exact future sequence must distinguish:

1. **Pre-write gate**
   - fresh live + preview GET;
   - confirm expected Revision 29 only if still true at execution time; otherwise STOP;
   - fresh durable backup of live/preview schema, field permissions, customization settings, desktop/mobile JS/CSS fileKeys/order, and downloaded existing customization bytes/hashes;
   - reviewed runtime candidate hash/source-dist exactness;
   - STOP on any drift.

2. **Add six missing fields**
   - `POST /k/v1/preview/app/form/fields.json`
   - App794 only;
   - exact reviewed add-field payload for the six missing codes/types/settings.

3. **Customization file upload**
   - `POST /k/v1/file.json` for the exact reviewed JS candidate and only any CSS file that actually needs replacement;
   - do not blindly replace/re-upload CSS if its content is unchanged and preservation is safer.

4. **Customization settings update**
   - `PUT /k/v1/preview/app/customize.json`;
   - use uploaded fileKey(s);
   - preserve unrelated JS/CSS assets/order and mobile customization exactly unless the reviewed target explicitly changes them.

5. **Deploy**
   - `POST /k/v1/preview/app/deploy.json` with `{ "apps": [{ "app": 794 }] }`;
   - poll/read deployment status until SUCCESS/FAIL/timeout.

6. **Post-deploy read-back**
   - live schema exact 6-field presence/type/settings;
   - customization fileKeys/order/mobile preservation;
   - deployed JS hash equals reviewed candidate;
   - live revision recorded.

7. **Browser smoke**
   - 0118 -> `PROF_STAFF_CHIEF`, 70/30 and 9 core snapshots;
   - 0111 -> `PROF_ASST_MGR`;
   - routing/requester/Record_Key;
   - missing routing / 0 or duplicate scoring fail closed where safely testable;
   - Objective Save gates;
   - no fatal console errors;
   - avoid persistent junk records.

8. **Rollback**
   - use only the fresh backup captured for that future execution;
   - remove/revert the six newly added fields as required to restore the exact prior schema;
   - restore exact prior customization settings/file bytes/fileKeys as applicable;
   - redeploy and verify read-back/browser health.

Correct permission evidence:
- current permission/access for six nonexistent fields = `UNVERIFIABLE`;
- future planned permission = exact requirement, clearly labeled as PLAN not current fact.

# REQUIRED FINAL EVIDENCE

Update exact factual values:

`M10L_D_R5 = COMPLETE / PARTIAL / BLOCKED`
`R4_GLOBAL_TEST_HOOK_REMOVED = YES/NO`
`DIST_GLOBAL_TEST_HOOK_RESIDUE = 0 / actual`
`RECORD_GET_FUNCTION_ABSENT_FAIL_CLOSED_TEST = PASS/FAIL`
`RECORD_SET_FUNCTION_ABSENT_FAIL_CLOSED_TEST = PASS/FAIL`
`CURRENT_FORM_STATE_NULL_FAIL_CLOSED_TEST = PASS/FAIL`
`FORM_STATE_SET_THROW_FAIL_CLOSED_TEST = PASS/FAIL`
`FORM_STATE_NOOP_FAIL_CLOSED_TEST = PASS/FAIL`
`FORM_STATE_POST_SET_READBACK_TEST = PASS/FAIL`
`APP794_REQUIRED_SNAPSHOT_SCHEMA_GAPS = exact list`
`APP794_CURRENT_MISSING_FIELD_PERMISSION_EVIDENCE = UNVERIFIABLE / actual`
`FUTURE_ADD_FIELDS_HTTP_METHOD = POST`
`FUTURE_FILE_UPLOAD_HTTP_METHOD = POST /k/v1/file.json`
`FUTURE_CUSTOMIZE_HTTP_METHOD = PUT /k/v1/preview/app/customize.json`
`FUTURE_DEPLOY_HTTP_METHOD = POST /k/v1/preview/app/deploy.json`
`SOURCE_DIST_EXACTNESS = PASS/FAIL`
`CLASSIC_BUNDLE_PARSE = PASS/FAIL`
`npm test = actual / PASS|FAIL`
`GIT_DIFF_CHECK = PASS/FAIL`
`NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED`
`CONFIRMED_BASELINE_CONFLICT_COUNT = 0`
`KINTONE_WRITES_THIS_TASK = 0`
`APP794_DEPLOY_THIS_TASK = 0`
`LIVE_CONFIG_WRITE_REQUIRED = YES/NO`
`GIT_PUSH_SYNC = PASS/FAIL`

# NO-ORPHAN

No `_old`, `_v1`, `_v2`, duplicate sync helpers, debug artifacts, or global test hooks.
Do not create a new report when the existing `AI_REVIEW_PACKAGE.md` can be corrected in place.

# HARD SAFETY

KINTONE_WRITES_THIS_TASK = 0
APP794_DEPLOY_THIS_TASK = 0
APP794_RECORD_WRITE = 0
APP794_SCHEMA_WRITE = 0
APP794_PROCESS_WRITE = 0
APP794_ACL_WRITE = 0
APP53_WRITE = 0
APP795_WRITE = 0
APP796_WRITE = 0
OTHER_APP_WRITE = 0

Old authorization remains consumed. Do not reuse it.

# ROLLBACK PLAN

No live write occurs in R5. Repository changes use forward Git history only; no force push/rebase/reset/history rewrite.

# REQUIRED FINAL SUMMARY

`M10L_D_R5 = COMPLETE / PARTIAL / BLOCKED`
`KINTONE_WRITES_THIS_TASK = 0`
`LIVE_CONFIG_WRITE_REQUIRED = YES/NO`
`NEXT_ACTION = CHATGPT REVIEW; IF PASS + LIVE_CONFIG_WRITE_REQUIRED=YES, CONTROL PLANE MAY REQUEST NEW EXPLICIT USER AUTHORIZATION FOR THE EXACT APP794 SCHEMA + CUSTOMIZATION REPAIR`

Commit/push same branch and STOP.