# AI ACTIVE TASK — M10L-D-R4 FORM-STATE PERSISTENCE + LIVE CHANGE EVIDENCE CLOSURE

> Control Plane: ChatGPT / Independent Reviewer
> Execution Plane: Antigravity standalone only
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Reviewed R3 HEAD: `f7eeabdc7ae3a7e1565b68ed9071a75c4c516170`
> Live App794 customization remains Revision `29`
> Mode: REPOSITORY CORRECTION / TESTS + READ-ONLY LIVE EVIDENCE ONLY
> Kintone write/deploy authorization: NONE

# NORTH STAR

Verify Employee -> Objectives -> Save -> Submit -> Workflow

Close the remaining lookup snapshot correctness gap truthfully before requesting any live App794 schema/customization repair.

Do not add unrelated features.

# INDEPENDENT REVIEW DECISION

`M10L-D-R3 = MUST FIX`

R3 correctly:
- removed the R2 synthetic Kintone-field workaround;
- removed `_uiOptions` / `_uiInstance` record pollution;
- restored fail-closed behavior when `Profile_Code` is absent;
- identified six missing live App794 scoring snapshot fields:
  `Profile_Code`, `PartA_Weight`, `PartB_Weight`, `Part_A_Scoring_Mode`, `Competency_Set_Code`, `Configuration_Hash`;
- reported 542/542 tests PASS and zero Kintone writes.

However R3 cannot close for two reasons.

## MUST FIX 1 — FORM-STATE PERSISTENCE IS NOT VERIFIED

Current `syncRecordToKintone(record)`:
- obtains `kintone.app.record.get()`;
- copies matching values;
- calls `kintone.app.record.set(currentData)`;
- catches and logs all exceptions;
- returns no success/failure result;
- performs no post-set read-back.

The lookup callback checks `record.Profile_Code`, `record.Routing_Topology`, and `record.Requester_User` BEFORE/independently of proving that the real Kintone form state accepted those values. If `record.set()` throws, APIs are unavailable, or set is a no-op, `onLookupEmployee()` can still resolve and `executeLookup()` can set `isEmployeeVerified = true`.

This violates R3 requirement: failed/unverifiable form-state persistence must remain unverified.

## MUST FIX 2 — EXACT LIVE CHANGE PLAN / EVIDENCE WAS NOT COMMITTED

R3 claimed an exact minimum App794 live change plan, but the execution commit changed `AI_REVIEW_PACKAGE.md` only by a gate-summary row. It did not commit the required per-field inventory and exact future controlled change facts:
- exact live/preview existence/type/label;
- field permission/access evidence;
- exact App796 published record evidence;
- exact field code/type/label/default/required/unique/visibility/permission plan;
- expected impact/risk;
- pre-write backup contract;
- post-change tests;
- rollback plan;
- required final R3 summary fields.

Do not request user authorization until this evidence is durable and reviewable.

# CONFIRMED BASELINE

Do not change canonical baseline.

- Employee `0118` -> Staff & Chief evidence.
- `PROF_STAFF_CHIEF` -> Part A 70 / Part B 30.
- Technical Service Chief resolves to `PROF_STAFF_CHIEF`.
- Missing/duplicate scoring profile -> FAIL CLOSED.
- Missing/duplicate routing -> FAIL CLOSED.
- App53 and legacy PMS apps remain READ ONLY.

# CHANGE GOVERNANCE

## What
1. Make Kintone form-state synchronization verifiable and fail closed.
2. Correct tests so form state is independent from the event-record object and persistence failures are real failures.
3. Remove unnecessary R3 test-only production seam if it has no production purpose.
4. Commit exact live/preview App794 inventory + App796 evidence + exact minimum future App794 schema/customization repair plan.

## Where
Prefer existing files only:
- `src/main-mbo-app.js`
- `src/ui/employee-part-a-ui.js` only if needed
- `tests/objective-save-validation.test.js`
- `dist/mbo-employee-app.js` if source changes
- `project-docs/AI_REVIEW_PACKAGE.md`
- living state docs only where factual consistency requires it

Do not create duplicate permanent reports or debug artifacts.

## How
Repository source/tests + read-only Kintone GET only.

## Why
A verified employee state is business-significant. It must mean required system snapshot values exist in schema AND are proven present in the actual Kintone form state.

## Impact
No live behavior changes in this task. Live App794 stays Revision 29 and remains fail-closed for the user-observed defect.

## Risks
- false verification after failed `record.set()`;
- scalar/USER_SELECT value comparison mistakes;
- incomplete schema repair causing another live failure;
- test-only hooks leaking into production code.

# PHASE A — REPOSITORY GATE

1. Pull latest branch; local HEAD must equal origin.
2. Confirm only this Control Plane task follows R3 before execution.
3. Run full `npm test` before changes and record result.
4. Run `git diff --check`.
5. Confirm live App794 Revision 29 is NOT changed in this task.

# PHASE B — FAIL-CLOSED FORM-STATE PERSISTENCE CONTRACT

Correct the existing synchronization path. Do not create a parallel duplicate sync system.

Required behavior:

1. A lookup snapshot may only complete successfully when required destination fields exist in the event record/schema-backed form contract.
2. `syncRecordToKintone` (or the existing equivalent path) must return success only when:
   - `kintone.app.record.get` exists;
   - `kintone.app.record.set` exists;
   - current form state exists;
   - every required snapshot destination exists in current form state;
   - set completes without exception;
   - a post-set `kintone.app.record.get()` read-back confirms the required values semantically equal the expected snapshot.
3. Missing API/current form state/missing required destination/set exception/read-back mismatch => throw a clear fail-closed configuration/persistence error.
4. Do NOT swallow persistence failure with console warning on the verification-critical path.
5. Do not create synthetic Kintone fields.
6. Do not weaken Save validation.

Core required lookup snapshot fields for this flow must include at minimum:
- `Profile_Code`
- `PartA_Weight`
- `PartB_Weight`
- `Part_A_Scoring_Mode`
- `Competency_Set_Code`
- `Configuration_Hash`
- `Routing_Topology`
- `Requester_User`
- `Record_Key`

Also preserve all existing approver snapshot fields already defined in the App794 schema. If architecture requires additional mandatory fields, document them rather than silently omitting them.

Comparison rules must respect actual Kintone field representations. Do not require JavaScript numeric type equality when a NUMBER field read-back is represented as a numeric string. USER_SELECT must remain a valid array with expected user codes.

# PHASE C — REMOVE TEST-ONLY PRODUCTION SEAMS IF UNNECESSARY

Review `EmployeePartAUI.lastInstance` introduced in R3.

If it exists only to let tests reach a runtime instance, remove it and use the smallest clean test seam:
- direct construction of `EmployeePartAUI` with dependency injection; or
- a narrowly scoped pure/exported helper in an existing module if truly necessary.

Do not add another global mutable test hook and do not mutate business records for testing.

If there is a legitimate production reason to retain it, document that reason explicitly; otherwise remove it.

# PHASE D — REQUIRED TESTS

Tests must model event record and Kintone form state as distinct contracts where relevant.

At minimum prove:

1. `0118 / Technical Service Chief -> PROF_STAFF_CHIEF`.
2. Schema-backed `Profile_Code` blank -> lookup populates expected value.
3. Missing `Profile_Code` field -> lookup rejects, field is not synthesized, UI remains unverified.
4. Successful `record.set()` + post-set read-back matching all required core snapshot fields -> lookup may become verified.
5. `kintone.app.record.get` unavailable -> lookup remains unverified.
6. `kintone.app.record.set` unavailable -> lookup remains unverified.
7. `record.set()` throws -> lookup remains unverified.
8. `record.set()` no-op / read-back retains old value -> lookup remains unverified.
9. Missing required scoring snapshot destination (for example `Configuration_Hash`) -> lookup remains unverified.
10. Routing_Topology + Requester_User form-state persistence PASS.
11. Record_Key form-state persistence PASS.
12. App796 0 published -> fail closed.
13. App796 duplicate published -> fail closed.
14. Existing 0111 -> PROF_ASST_MGR and Factory Manager -> PROF_GM regressions PASS.
15. Existing Save validation and duplicate guards PASS.
16. No test manually forces `isEmployeeVerified = true` for the success being tested.
17. No test-only properties on business record.
18. Classic bundle parse / zero ES-module residue PASS.
19. Source/dist deterministic exactness PASS.
20. Full `npm test` PASS.

# PHASE E — READ-ONLY LIVE INVENTORY / EVIDENCE

Use Kintone GET/read-only only. No PUT/POST/DELETE/deploy/file upload.

Reconfirm and commit durable evidence for App794 live AND preview for all lookup snapshot destinations, at minimum:
- `Profile_Code`
- `PartA_Weight`
- `PartB_Weight`
- `Part_A_Scoring_Mode`
- `Competency_Set_Code`
- `Configuration_Hash`
- `Routing_Topology`
- `Requester_User`
- `Record_Key`
- approver fields written by `fieldsToSync`

For each record:
- live exists YES/NO
- preview exists YES/NO
- exact field type if present
- exact label if present
- required/default/unique where applicable
- permission/access evidence: exact if obtainable; otherwise `UNVERIFIABLE` (do not guess)

Reconfirm App796 using GET only for:
`Profile_Code = PROF_STAFF_CHIEF`, `Fiscal_Year = FY2026`, `Config_Status = PUBLISHED`.

Commit:
- exact record count;
- profile/fiscal year/status;
- PartA/PartB weights;
- Part_A_Scoring_Mode;
- Competency_Set_Code;
- Configuration_Hash presence/value or safe hash identifier as appropriate.

Expected published count = exactly 1.

# PHASE F — EXACT MINIMUM FUTURE LIVE CHANGE PLAN (NO EXECUTION)

In `project-docs/AI_REVIEW_PACKAGE.md`, add a dedicated `M10L-D-R4` section containing an auditable table and future controlled change plan.

For every missing App794 field, document:
- exact field code
- exact planned Kintone field type
- exact label
- default value
- required setting
- unique setting
- visibility (native/custom UI behavior)
- permission requirement
- rationale/source for the chosen type

The currently known candidate gap list from R3 is:
- `Profile_Code`
- `PartA_Weight`
- `PartB_Weight`
- `Part_A_Scoring_Mode`
- `Competency_Set_Code`
- `Configuration_Hash`

Do not assume R3's list is complete until the fresh read-only inventory confirms it.

The future controlled repair plan must also state:

### What
Minimum App794 schema additions plus deployment of the exact independently reviewed corrected customization candidate required to make Verify Employee -> Save operational.

### Where
App794 only. No App53/App795/App796 record/schema/process/ACL writes unless separately authorized in another task.

### How
Future task only, after explicit authorization:
- fresh live/preview GET and drift gate;
- fresh durable pre-write backup including form schema, customization, JS/CSS bytes/fileKeys, revision, permissions relevant to affected fields;
- verify reviewed repo candidate hash/source-dist exactness;
- apply only exact missing App794 fields in preview;
- apply exact reviewed App794 customization candidate;
- deploy through controlled Kintone preview/deploy path;
- wait for SUCCESS;
- live read-back schema + customization hashes;
- browser smoke 0118 and at least one non-Staff profile without creating junk business data where possible.

### Impact
Restores schema-backed scoring snapshot persistence and allows valid employee lookup to satisfy Save prerequisites.

### Risks
Schema/type mismatch, customization regression, permission/access mismatch, incomplete snapshot fields.

### Test Plan
At minimum:
- 0118 -> PROF_STAFF_CHIEF + 70/30 snapshot
- 0111 -> PROF_ASST_MGR
- routing/requester retained
- Record_Key retained
- zero/duplicate App796 fail closed
- missing routing fail closed
- Save objective gates
- post-deploy read-back
- browser console no fatal error

### Rollback Plan
Use only fresh backup from that future authorized deployment. Restore exact prior App794 schema/customization state and redeploy; then read-back/browser verify. Do not reuse an older backup.

# REQUIRED FINAL EVIDENCE BLOCK

Commit exact values, not just a summary line:

`M10L_D_R4_PERSISTENCE_CONTRACT = COMPLETE / PARTIAL / BLOCKED`
`R3_FORM_STATE_PERSISTENCE_GAP_FIXED = YES/NO`
`R3_TEST_ONLY_LASTINSTANCE_REMOVED = YES/NO/RETAINED_WITH_REASON`
`APP794_LIVE_REVISION = actual`
`APP794_PREVIEW_REVISION = actual`
`APP794_REQUIRED_SNAPSHOT_SCHEMA_GAPS = exact list`
`APP794_REQUIRED_SNAPSHOT_PERMISSION_GAPS = exact list / NONE / UNVERIFIABLE`
`APP796_PROF_STAFF_CHIEF_FY2026_PUBLISHED_COUNT = actual`
`APP796_PARTA_WEIGHT = actual`
`APP796_PARTB_WEIGHT = actual`
`APP796_PART_A_SCORING_MODE = actual`
`APP796_COMPETENCY_SET_CODE = actual`
`PROFILE_FIELD_PRESENT_PERSISTENCE_TEST = PASS/FAIL`
`PROFILE_FIELD_ABSENT_FAIL_CLOSED_TEST = PASS/FAIL`
`FORM_STATE_POST_SET_READBACK_TEST = PASS/FAIL`
`FORM_STATE_SET_THROW_FAIL_CLOSED_TEST = PASS/FAIL`
`FORM_STATE_NOOP_FAIL_CLOSED_TEST = PASS/FAIL`
`REQUIRED_SCORING_SNAPSHOT_MISSING_FAIL_CLOSED_TEST = PASS/FAIL`
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
`EXACT_MINIMUM_LIVE_CHANGE = exact concise description / NONE`
`GIT_PUSH_SYNC = PASS/FAIL`

# NO-ORPHAN

- Remove superseded R3 test-only behavior if not required.
- No `_old`, `_v1`, `_v2`, duplicate sync helpers, temporary browser scripts, committed raw credentials, or debug artifacts.
- Prefer modifying existing functions/files.

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

Old deployment authorization is consumed. Do not reuse it.

If any Kintone write becomes necessary to gather evidence or fix live state, STOP and report.

# ROLLBACK PLAN

No Kintone write occurs in R4, so no live rollback applies.
Repository changes use normal forward Git history only; no force push/rebase/reset/history rewrite.

# REQUIRED FINAL SUMMARY

`M10L_D_R4 = COMPLETE / PARTIAL / BLOCKED`
`KINTONE_WRITES_THIS_TASK = 0`
`LIVE_CONFIG_WRITE_REQUIRED = YES/NO`
`NEXT_ACTION = CHATGPT REVIEW; IF PASS + LIVE_CONFIG_WRITE_REQUIRED=YES, CONTROL PLANE REQUESTS NEW EXPLICIT USER AUTHORIZATION FOR EXACT APP794 SCHEMA + CUSTOMIZATION REPAIR`

Commit/push the same branch and STOP. Do not begin another work package.