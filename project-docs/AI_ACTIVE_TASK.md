# AI ACTIVE TASK — M10L-D-R3 LIVE PROFILE SCHEMA CONTRACT CORRECTION

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed R2 HEAD: `206728e4bb7003c3d9e2d0e833fc0c4534f67b63`
> Live App794 customization remains Revision `29`
> Mode: READ-ONLY LIVE INVENTORY + REPOSITORY CORRECTION / TESTS ONLY
> Kintone write/deploy authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

Correct the R2 implementation so runtime never pretends a missing Kintone field exists, then produce the exact minimum App794 live schema change plan if live schema is incomplete.

Do not add unrelated features.

# INDEPENDENT REVIEW DECISION

`M10L-D-R2 = MUST FIX`

R2 correctly identified a material fact: live App794 does not contain schema field `Profile_Code`, while employee `0118` must resolve to `PROF_STAFF_CHIEF` and Save requires `Profile_Code`.

However the R2 source correction is NOT acceptable as a live fix:

1. `src/main-mbo-app.js` now creates missing properties on the JavaScript event record:
   `record[k] = { type: ..., value: val }`.
   A synthetic JavaScript property does not create a Kintone form/schema field.
2. `syncRecordToKintone()` only copies values where `currentData.record[k]` already exists. Therefore a schema-missing `Profile_Code` cannot be persisted into Kintone form state by this path.
3. R2 asserts the synthetic local `record.Profile_Code` before calling `syncRecordToKintone()`, so the assertion can PASS even though the real Kintone form still has no field to persist.
4. R2 adds `_uiOptions` and `_uiInstance` directly onto the production Kintone record object for test access. Test seams must not pollute the business record payload.
5. The new 0118 test reuses the same JavaScript `rawRecord` object across create.show and create.submit and manually sets `isEmployeeVerified = true`; it does not prove actual Kintone event/form-state persistence.
6. The prior task explicitly required a missing required `Profile_Code` field to remain fail-closed and, if a live schema write is required, STOP and return for fresh explicit authorization. R2 instead treated the missing field as dynamically creatable.

No evidence of data loss/security bypass exists; runtime remains fail-closed, so this is MUST FIX rather than BLOCKER.

# CONFIRMED BASELINE

Do not change canonical baseline.

- `0118` -> Staff & Chief evidence.
- `PROF_STAFF_CHIEF` -> Part A 70 / Part B 30.
- `Technical Service Chief` -> `PROF_STAFF_CHIEF`.
- Missing profile/routing/scoring config -> FAIL CLOSED.

# CHANGE GOVERNANCE

## What
1. Remove the unsafe synthetic-field workaround and test-only record pollution introduced in R2.
2. Implement a truthful schema-backed snapshot contract: lookup may only mark verified when required Kintone fields actually exist and persistence into form state is verifiable.
3. Perform read-only live App794 inventory and produce the exact minimum schema change plan if fields are missing.

## Where
Prefer existing files/functions:
- `src/main-mbo-app.js`
- `tests/objective-save-validation.test.js`
- existing helper/test files only if clearly appropriate
- `dist/mbo-employee-app.js` if source changes
- existing living docs/review package

## Why
A JavaScript property cannot substitute for an absent Kintone schema field. The live defect must be solved at the correct boundary.

## Impact
Repository correctness + exact live change plan only. App794 Revision 29 remains unchanged.

## Risks
- fake in-memory PASS while submit event loses the synthetic property
- unknown properties/types leaking into Kintone event records
- requesting a schema write before all required snapshot fields are inventoried

# PHASE A — REPOSITORY / SOURCE CORRECTION

1. Pull latest same branch; local HEAD must equal origin.
2. Confirm only this task follows R2 before execution.
3. Remove generic fallback that creates missing Kintone fields on `record`.
4. Remove `_uiOptions` and `_uiInstance` from the production event record.
5. Keep normal assignment only for schema-backed fields.
6. Add/retain a fail-closed mandatory snapshot gate so employee lookup cannot become verified when required schema-backed fields are absent or persistence cannot be proven.
7. Do not weaken ValidationEngine.
8. Do not hardcode `0118`.
9. Do not bypass App796.
10. Rebuild committed dist through the existing deterministic pipeline and require exactness.

# PHASE B — READ-ONLY LIVE APP794 SCHEMA INVENTORY

Use GET/read-only only. Record live and preview schema state for ALL system snapshot fields involved in the lookup path, at minimum:

- `Profile_Code`
- `PartA_Weight`
- `PartB_Weight`
- `Part_A_Scoring_Mode`
- `Competency_Set_Code`
- `Configuration_Hash`
- `Routing_Topology`
- `Requester_User`
- `Record_Key`
- all approver USER_SELECT fields written by `fieldsToSync`

For each field record:
- exists live YES/NO
- exists preview YES/NO
- exact field type if present
- label if present
- relevant field permission/access evidence if available

Do not guess missing field types. Derive the planned type from authoritative architecture/source/Kintone conventions and document rationale.

If any mandatory field is missing/inaccessible, final state must be `LIVE_CONFIG_WRITE_REQUIRED` and no Kintone write occurs in this task.

# PHASE C — READ-ONLY APP796 CHECK

For `PROF_STAFF_CHIEF` + `FY2026`, confirm exact published count and key config values using GET only.

Expected count = exactly 1.

# PHASE D — REQUIRED TEST CORRECTIONS

Tests must model the contract truthfully.

At minimum prove:

1. `0118 / Technical Service Chief -> PROF_STAFF_CHIEF`.
2. When `Profile_Code` field EXISTS with blank value, successful lookup populates the schema-backed field.
3. When required `Profile_Code` field is ABSENT, lookup fails closed and verification must not become true.
4. Do NOT create a synthetic `Profile_Code` property to satisfy test 3.
5. Form-state persistence test must model `kintone.app.record.get()/set()` and prove value reaches an existing Kintone field.
6. A failed/missing form-state persistence check remains unverified.
7. Routing_Topology + Requester_User persistence regression PASS.
8. App796 0 published -> fail closed.
9. App796 duplicate published -> fail closed.
10. Existing 0111/Factory Manager profile regressions PASS.
11. Save validation/duplicate guards PASS.
12. No test manually forces `isEmployeeVerified = true` to manufacture the success path being tested.
13. No test helper is stored as an extra property on the business record.
14. Classic bundle parse PASS.
15. Source/dist exactness PASS.
16. Full `npm test` PASS.

Use the smallest testable seam in existing source. If exposing a test seam is necessary, prefer a narrowly scoped exported/pure helper or dependency injection over mutating Kintone record data.

# PHASE E — EXACT LIVE CHANGE PLAN (NO WRITE)

If live schema inventory confirms missing mandatory field(s), document the minimum future controlled App794 change:

- exact field code(s)
- exact field type(s)
- exact label(s)
- whether hidden from native/custom UI
- default/required/unique settings
- permission requirements
- expected impact
- risk
- pre-write backup requirements
- test plan
- rollback plan

Do NOT execute it.

# NO-ORPHAN

Remove R2-only unsafe/test artifacts from production logic. Do not create `_old`, `_v1`, `_v2`, duplicate validators/resolvers, or temporary committed debug files.

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

Old deployment authorization is consumed and must not be reused.

# ROLLBACK PLAN

No Kintone writes occur. Repository corrections use normal forward Git history only; no force push/rebase/reset/history rewrite.

Live App794 remains Revision 29 until a separate review passes and the user gives fresh explicit authorization for the exact required live change/deploy.

# REQUIRED FINAL SUMMARY

`M10L_D_R3_SCHEMA_CONTRACT = COMPLETE / PARTIAL / BLOCKED`
`R2_SYNTHETIC_FIELD_WORKAROUND_REMOVED = YES/NO`
`R2_RECORD_TEST_POLLUTION_REMOVED = YES/NO`
`APP794_PROFILE_CODE_FIELD_EXISTS = YES/NO`
`APP794_PROFILE_CODE_FIELD_TYPE = actual/NA`
`APP794_REQUIRED_SNAPSHOT_SCHEMA_GAPS = exact list`
`APP794_REQUIRED_SNAPSHOT_PERMISSION_GAPS = exact list / NONE / UNVERIFIABLE`
`APP796_PROF_STAFF_CHIEF_FY2026_PUBLISHED_COUNT = actual`
`0118_PROFILE_RESOLVER = PASS/FAIL`
`PROFILE_FIELD_PRESENT_PERSISTENCE_TEST = PASS/FAIL`
`PROFILE_FIELD_ABSENT_FAIL_CLOSED_TEST = PASS/FAIL`
`FORM_STATE_PERSISTENCE_TEST = PASS/FAIL`
`ROUTING_SNAPSHOT_REGRESSION = PASS/FAIL`
`SCORING_ZERO_DUPLICATE_GATES = PASS/FAIL`
`SOURCE_DIST_EXACTNESS = PASS/FAIL`
`CLASSIC_BUNDLE_PARSE = PASS/FAIL`
`npm test = actual / PASS|FAIL`
`GIT_DIFF_CHECK = PASS/FAIL`
`NO_ORPHAN_ARTIFACT_GATE = PASS/BLOCKED`
`CONFIRMED_BASELINE_CONFLICT_COUNT = 0`
`KINTONE_WRITES_THIS_TASK = 0`
`APP794_DEPLOY_THIS_TASK = 0`
`LIVE_CONFIG_WRITE_REQUIRED = YES/NO`
`EXACT_MINIMUM_LIVE_CHANGE = actual / NONE`
`GIT_PUSH_SYNC = PASS/FAIL`

`NEXT_ACTION = CHATGPT REVIEW; IF LIVE_CONFIG_WRITE_REQUIRED=YES AND REPO GATES PASS, CONTROL PLANE REQUESTS NEW EXPLICIT USER AUTHORIZATION FOR THE EXACT MINIMUM APP794 CHANGE`

Commit/push same branch and STOP.
