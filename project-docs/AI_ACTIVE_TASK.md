# AI ACTIVE TASK — M10L-D-R6 WORKFLOW HOOK REGRESSION CLOSURE

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed R5 HEAD: `1793b8a7355cab2450a2f989cea5d1c30342330e`
> Live App794 customization remains Revision `29`
> Mode: REPOSITORY CORRECTION + TESTS ONLY
> Kintone write/deploy authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

Close one unintended workflow-hook regression introduced during R5 repository refactoring. Do not add unrelated features.

# INDEPENDENT REVIEW DECISION

`M10L-D-R5 = MUST FIX`

R5 successfully closed the three R4 review findings:
- removed `globalThis.__MBO_APP__` production test hook and reported zero dist residue;
- added distinct fail-closed tests for record.get function absent, record.set function absent, null form state, set throw, and set no-op/read-back mismatch;
- corrected the future controlled App794 change plan to Add Fields POST -> file upload POST -> customization PUT -> deploy POST and corrected missing-field permission evidence to UNVERIFIABLE.

However R5 introduced an unrelated runtime regression in `src/main-mbo-app.js` while restructuring the module/test seam:

Before R5, the valid `app.record.detail.process.proceed` handler ended with:

```js
return event;
```

R5 removed that success return. Current valid path reaches the end of the handler and returns `undefined`.

This touches the North Star `Submit -> Workflow` boundary and was not part of R5 authorized scope. It must be restored and regression-tested before the repository candidate can be approved for live repair.

No live Kintone change occurred, so this is MUST FIX, not BLOCKER.

# CONFIRMED BASELINE

Do not change canonical baseline.

- Workflow path remains `SUBMITTED -> HR_REVIEW -> GM_APPROVAL -> APPROVED -> EXECUTION_PENDING -> APPLIED`.
- Missing/invalid workflow prerequisites remain fail closed.
- App53 and legacy PMS apps remain READ ONLY.
- R5 six-field App794 schema gap and App796 scoring evidence remain unchanged.

# CHANGE GOVERNANCE

## What
Restore the valid workflow process-action return contract and add direct regression coverage.

## Where
Prefer existing files only:
- `src/main-mbo-app.js`
- `tests/objective-save-validation.test.js` or the most appropriate existing runtime-hook test file
- `dist/mbo-employee-app.js`
- living docs/review package only for factual R6 closure status

## How
1. Restore `return event;` on the successful `app.record.detail.process.proceed` path.
2. Keep invalid process validation returning `false`.
3. Add direct registered-hook tests for both success and failure paths.
4. Rebuild deterministic dist and prove source/dist exactness.
5. Preserve every R5 closure: no `__MBO_APP__`, API-unavailable fail-closed matrix, corrected future execution plan.

## Why
A workflow event handler must preserve the reviewed success contract; R5 accidentally changed it while performing unrelated test-seam refactoring.

## Impact
Repository/runtime candidate correctness only. No live App794 change in R6.

## Risks
- valid workflow transition returning the wrong handler value;
- restoring success while accidentally weakening invalid fail-closed behavior;
- source/dist drift;
- regression of R5 test-hook/API-plan closures.

## Test Plan
At minimum prove:
1. Registered `app.record.detail.process.proceed` handler exists.
2. With a valid record/stage, handler returns the exact `event` object.
3. With invalid required business data, handler returns `false`.
4. Existing Create/Edit submit gates remain PASS.
5. R5 form-state persistence tests remain PASS.
6. `__MBO_APP__` residue remains zero in source/dist.
7. Classic bundle parse PASS.
8. Source/dist deterministic exactness PASS.
9. Full `npm test` PASS.
10. `git diff --check` PASS.

## Rollback Plan
No Kintone writes occur. Repository changes use normal forward Git history only; no force push/rebase/reset/history rewrite.

# NO-ORPHAN

- No new permanent helper/report unless genuinely required.
- No `_old`, `_v1`, `_v2`, duplicate workflow handlers, global test hooks, or debug artifacts.
- Fix the existing handler and existing tests.

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

Old deployment authorization remains consumed. Do not reuse it.

# REQUIRED FINAL EVIDENCE

`M10L_D_R6 = COMPLETE / PARTIAL / BLOCKED`
`WORKFLOW_SUCCESS_RETURNS_EVENT_TEST = PASS/FAIL`
`WORKFLOW_INVALID_RETURNS_FALSE_TEST = PASS/FAIL`
`R5_GLOBAL_TEST_HOOK_CLOSURE_PRESERVED = PASS/FAIL`
`R5_API_UNAVAILABLE_MATRIX_PRESERVED = PASS/FAIL`
`R5_FUTURE_EXECUTION_PLAN_PRESERVED = PASS/FAIL`
`SOURCE_DIST_EXACTNESS = PASS/FAIL`
`CLASSIC_BUNDLE_PARSE = PASS/FAIL`
`npm test = actual / PASS|FAIL`
`GIT_DIFF_CHECK = PASS/FAIL`
`NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED`
`CONFIRMED_BASELINE_CONFLICT_COUNT = 0`
`KINTONE_WRITES_THIS_TASK = 0`
`APP794_DEPLOY_THIS_TASK = 0`
`LIVE_CONFIG_WRITE_REQUIRED = YES`
`GIT_PUSH_SYNC = PASS/FAIL`

# REQUIRED FINAL SUMMARY

`M10L_D_R6 = COMPLETE / PARTIAL / BLOCKED`
`KINTONE_WRITES_THIS_TASK = 0`
`LIVE_CONFIG_WRITE_REQUIRED = YES`
`NEXT_ACTION = CHATGPT REVIEW; IF R6 PASS, CONTROL PLANE MAY REQUEST NEW EXPLICIT USER AUTHORIZATION FOR THE EXACT APP794 SIX-FIELD SCHEMA + REVIEWED CUSTOMIZATION REPAIR`

Commit/push same branch and STOP.