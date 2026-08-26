# AI ACTIVE TASK — M10L-D-R2 LIVE PROFILE SNAPSHOT DEFECT INVESTIGATION

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Review HEAD before this task: `618bc90ddd2580d0201eb31c7bf4643b21e538b8`
> Deployed candidate code HEAD: `21f9e82ac42f279946ce87015ae714993f3478e8`
> Live App794 last verified customization revision: `29`
> Mode: READ-ONLY LIVE INVESTIGATION + REPOSITORY FIX/TESTS IF ROOT CAUSE IS SOURCE-SIDE
> Kintone write/deploy authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

Close the user-observed runtime defect where employee verification succeeds but `Profile_Code` is missing at Save.

Do not add unrelated features.

# USER-OBSERVED LIVE DEFECT — AUTHORITATIVE REVIEW INPUT

The user supplied a live App794 Create-page screenshot after M10L-D deployment showing:

- Employee Code: `0118`
- Employee Name: `Mr.Peranut Hanpratum`
- Section: `TMS1`
- Position: `Technical Service Chief`
- Department: `Technical Services`
- green status: `Employee verified`
- Save validation error count: `1`
- error: `ไม่พบข้อมูล Profile Code ของพนักงาน กรุณากดค้นหาเพื่อระบุกลุ่มประเมิน / Employee scoring profile code was not found. Please search to resolve profile.`

This is a real runtime regression/gap and overrides the prior broad `BROWSER_SMOKE = PASS` conclusion for the complete Verify Employee -> Save flow. The previous smoke only proved page/render/unverified-state health; it did not prove successful lookup persisted the resolved scoring profile into the actual live App794 event record.

# CONFIRMED BASELINE

Canonical facts remain unchanged:

- Employee `0118` historical/current evaluation evidence -> Staff & Chief.
- `PROF_STAFF_CHIEF` = Part A 70 / Part B 30.
- `Technical Service Chief` is mapped by current source resolver to `PROF_STAFF_CHIEF`.
- Missing scoring profile must fail closed.

Do NOT change the baseline to accommodate this defect.

# SOURCE REVIEW FINDING

Current source already maps:

`technical service chief -> PROF_STAFF_CHIEF`

and existing unit test confirms that resolver result.

However the existing integration/save test creates a synthetic record with:

`Profile_Code: { value: 'PROF_STAFF_CHIEF' }`

already present before runtime lookup. It therefore does NOT prove that live App794 lookup actually writes `Profile_Code` into the real Kintone record.

In `src/main-mbo-app.js`, lookup snapshot assignment currently uses the pattern:

`if (record[k]) { record[k].value = val; }`

This can silently skip `Profile_Code` when that field is absent from the event record, inaccessible by field permission, mis-coded in live schema, or otherwise unavailable. The lookup may still complete and UI may mark Employee verified, while Save later fails because ValidationEngine sees missing `Profile_Code`.

This is the leading hypothesis only. Prove root cause before modifying production source.

# REVIEW CLASSIFICATION

`M10L-D-R1 = MUST FIX`

Reason: live critical-path correctness failure after successful employee verification. Save cannot proceed for confirmed employee 0118.

This is NOT currently classified as BLOCKER because:
- runtime fails closed rather than saving incorrect data;
- no evidence of data loss/security bypass;
- no rollback is currently required merely from this fail-closed defect.

If investigation finds schema/ACL drift requiring a Kintone write, STOP and return to Control Plane for fresh explicit authorization.

# CHANGE GOVERNANCE

## What
Diagnose the exact live boundary causing resolved `Profile_Code` not to be present at Save, then fix repository source/tests only if the defect is source-side.

## Where
Inspect first:
- App794 live/preview form fields — read only
- App794 field permissions/ACL relevant to `Profile_Code` — read only
- App796 published scoring config for `PROF_STAFF_CHIEF` + FY2026 — read only
- browser live create event/form state after successful lookup — non-destructive
- `src/main-mbo-app.js`
- `src/profiles/profile-scoring-resolver.js`
- `src/ui/employee-part-a-ui.js`
- `src/validation/validation-engine.js`
- existing tests, especially `tests/objective-save-validation.test.js`
- committed `dist/mbo-employee-app.js` only after source correction is fully tested

## How
Follow the ordered investigation below. Do not guess.

## Why
The unit resolver is correct, but live lookup-to-record persistence is not proven and the user has reproduced a real failure.

## Expected Impact
Repository correction/test hardening only if source-side. No Kintone state change in this task.

## Risk
- masking a live schema/permission defect with code
- incorrectly marking lookup verified when required system snapshot fields were not persisted
- adding a fallback that bypasses App796 or confirmed profile governance
- fixing only employee 0118 instead of the generic snapshot contract

Mitigation: discover exact live state first, keep fail-closed behavior, fix the generic contract, and add an actual lookup-to-record integration regression.

# PHASE A — REPOSITORY GATE

1. Pull latest branch and confirm local HEAD equals origin.
2. Confirm this task is the only control-plane commit after `618bc90...` before execution.
3. Run `npm test` and record actual result.
4. Run `git diff --check`.
5. Confirm no unexpected production source/dist drift since deployed candidate.
6. Keep App794 live Revision 29 unchanged throughout this task.

# PHASE B — READ-ONLY LIVE APP794 FIELD CONTRACT

Use GET only.

Determine and record exactly:

1. Does live App794 form schema contain field code exactly `Profile_Code`?
2. If yes:
   - field type
   - label
   - required/unique/default if applicable
   - live revision
3. Does preview schema contain the same exact field?
4. Is there live/preview schema drift relevant to `Profile_Code`?
5. Inspect field access-control/permissions for `Profile_Code` if endpoint/evidence is available.
6. Determine whether the current/shared runtime user can see/access this field in an App794 event record.
7. Check other required snapshot fields written by the same `fieldsToSync` path (`Routing_Topology`, `Requester_User`, scoring snapshot fields) to distinguish one-field schema/permission failure from a generic sync problem.

No schema/ACL write is authorized.

If `Profile_Code` is missing from live schema or inaccessible due to live permission and fixing it requires Kintone write:
- classify exact root cause
- do NOT modify Kintone
- repository source may be hardened only to fail earlier/clearer if appropriate, but do not pretend the business path is repaired
- final status must request fresh explicit authorization for the minimum live change.

# PHASE C — READ-ONLY APP796 SCORING CHECK

Use GET only.

For `FY2026` and `PROF_STAFF_CHIEF`, prove:

- exact published record count
- `Profile_Code`
- `Fiscal_Year`
- `Config_Status`
- relevant weights/config identity

Expected: exactly one published config.

If zero/duplicate published configs exist, classify that as the root cause and STOP before source modification unless source behavior itself is incorrect.

Do not write App796.

# PHASE D — NON-DESTRUCTIVE LIVE BROWSER STATE TRACE

Reproduce employee `0118` without saving/creating a record.

After successful Search and green `Employee verified`, inspect actual live page/form state read-only and record:

- `Employee_Position`
- resolved profile code from source resolver if observable
- `kintone.app.record.get().record.Profile_Code` existence and value
- `Routing_Topology` existence/value
- `Requester_User` existence/value shape/count
- whether `Profile_Code` exists in the original Create event record object
- whether lookup callback attempted to assign it
- whether sync-to-Kintone preserved it

Do NOT Save the record in this task.

The goal is to locate the exact break:

A. resolver -> scoring query
B. scoring query -> `scoringConfig`
C. `scoringConfig` -> `fieldsToSync`
D. `fieldsToSync` -> event record
E. event record -> `kintone.app.record.set`
F. form state -> submit event

# PHASE E — SOURCE FIX ONLY IF PROVEN SOURCE-SIDE

If root cause is source-side and can be corrected without Kintone writes:

1. Fix the existing function/path. Do not create a parallel profile resolver or duplicate validator.
2. Preserve fail-closed behavior.
3. Employee verification MUST NOT become true unless all mandatory system snapshot contracts needed for Save are actually present and persisted, including at minimum:
   - `Profile_Code`
   - `Routing_Topology`
   - populated `Requester_User`
4. Do not hardcode employee `0118`.
5. Do not fallback around App796 published configuration requirements.
6. Do not weaken ValidationEngine.
7. If a required Kintone field is absent/inaccessible, return a clear configuration error and remain unverified; do not fake persistence.
8. Prefer correcting `src/main-mbo-app.js` / existing integration seam rather than adding files.

If source changes:
- update committed `dist/mbo-employee-app.js` using the existing deterministic bundle path
- require source/dist exactness PASS
- do NOT deploy in this task.

# REQUIRED REGRESSION TESTS

Add/revise tests so they reproduce the real gap rather than pre-seeding Profile_Code.

At minimum:

1. Verified 0118 / Technical Service Chief resolves `PROF_STAFF_CHIEF`.
2. Successful lookup-to-record integration begins from a Create record where `Profile_Code.value` is blank and proves it becomes `PROF_STAFF_CHIEF` when the live field contract is present.
3. A Create record where required `Profile_Code` field is absent must NOT end with `isEmployeeVerified = true`; fail closed with clear configuration error.
4. If field exists but sync/persistence cannot be verified, lookup remains unverified.
5. Routing snapshot still persists correctly.
6. App796 zero published config -> unverified/fail closed.
7. App796 duplicate published config -> unverified/fail closed.
8. Successful valid profile + routing lookup leaves record Save prerequisites populated.
9. Existing 0111 -> `PROF_ASST_MGR` regression PASS.
10. Factory Manager -> `PROF_GM` regression PASS.
11. Create code-change stale-state reset PASS.
12. Existing Save validation/duplicate guards remain PASS.
13. Classic bundle parse/no ES module residue PASS if source changed.
14. Source/dist exactness PASS if source changed.
15. Full `npm test` PASS.

Important: do not satisfy the integration test by constructing the fixture with the final `Profile_Code` already populated.

# NO-ORPHAN

Use existing files/functions first.
No `_old`, `_v1`, `_v2`, duplicate validators, duplicate profile maps, temporary committed browser scripts, or debug artifacts.

`NO_ORPHAN_ARTIFACT_GATE = PASS` required.

# HARD SAFETY

This task has NO Kintone write authorization.

Allowed Kintone operations: GET/read-only only.

Required final accounting:

`KINTONE_WRITES_THIS_TASK = 0`
`APP794_DEPLOY_THIS_TASK = 0`
`APP794_RECORD_WRITE = 0`
`APP794_SCHEMA_WRITE = 0`
`APP794_PROCESS_WRITE = 0`
`APP794_ACL_WRITE = 0`
`APP53_WRITE = 0`
`APP795_WRITE = 0`
`APP796_WRITE = 0`
`OTHER_APP_WRITE = 0`

Do not reuse M10L-D deployment authorization. It is consumed.

# ROLLBACK PLAN

No Kintone write occurs, so no live rollback applies.

Repository changes use normal forward Git history on the same branch. No force push/rebase/reset/history rewrite.

If source correction is made, the currently deployed Revision 29 remains untouched until a separate independent review passes and the user gives a NEW explicit deployment authorization.

# REQUIRED FINAL SUMMARY

Report factually:

`M10L_D_R2_PROFILE_SNAPSHOT_DEFECT = FIXED_IN_REPO / LIVE_CONFIG_WRITE_REQUIRED / PARTIAL / BLOCKED`
`USER_REPRO_0118 = CONFIRMED`
`ROOT_CAUSE = exact`
`APP794_PROFILE_CODE_FIELD_EXISTS = YES/NO`
`APP794_PROFILE_CODE_FIELD_TYPE = actual/NA`
`APP794_PROFILE_CODE_RUNTIME_ACCESSIBLE = YES/NO/UNVERIFIABLE`
`APP796_PROF_STAFF_CHIEF_FY2026_PUBLISHED_COUNT = actual`
`LIVE_TRACE_RESOLVER_PROFILE = actual`
`LIVE_TRACE_FORM_PROFILE_BEFORE_LOOKUP = actual`
`LIVE_TRACE_FORM_PROFILE_AFTER_LOOKUP = actual`
`LOOKUP_VERIFIED_ONLY_AFTER_REQUIRED_SNAPSHOT = PASS/FAIL`
`0118_PROFILE_INTEGRATION_TEST = PASS/FAIL`
`MISSING_PROFILE_FIELD_FAIL_CLOSED_TEST = PASS/FAIL`
`ROUTING_SNAPSHOT_REGRESSION = PASS/FAIL`
`SCORING_ZERO_DUPLICATE_GATES = PASS/FAIL`
`SOURCE_CHANGED = YES/NO`
`DIST_CHANGED = YES/NO`
`SOURCE_DIST_EXACTNESS = PASS/NA`
`CLASSIC_BUNDLE_PARSE = PASS/NA`
`npm test = actual / PASS|FAIL`
`GIT_DIFF_CHECK = PASS/FAIL`
`NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED`
`CONFIRMED_BASELINE_CONFLICT_COUNT = 0`
`KINTONE_WRITES_THIS_TASK = 0`
`APP794_DEPLOY_THIS_TASK = 0`
`GIT_PUSH_SYNC = PASS/FAIL`

`NEXT_ACTION = CHATGPT REVIEW; IF REPO FIX PASSES AND LIVE DEPLOY IS REQUIRED, REQUEST NEW EXPLICIT APP794 DEPLOY AUTHORIZATION`

Update factual living docs as needed, commit/push same branch, then STOP.
