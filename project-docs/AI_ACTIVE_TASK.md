# AI ACTIVE TASK — PROJECT CLOSE ROUND 2-R1: REAL-CONTRACT CORRECTION CLOSURE

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `91c8083c00acd43de469c3afa8a582d8c8adcff2`
> Mode: **CREDIT-SAVER / PROJECT CLOSE / ONE CORRECTION ROUND**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY: **0 / 0 / 0**

## OBJECTIVE

Correct Round 2 against the REAL exported Kintone contracts already analyzed by Control Plane, close local implementation gaps, and leave only one later explicitly-authorized Kintone schema/deploy/data/read-back round.

Do not contact Kintone. Do not browser-smoke. Do not deploy. Do not modify production or legacy apps. Do not broad-discover. Do not redesign frozen UI V2.

## ROUND 2 REVIEW RESULT

```text
ROUND_2_REVIEW = MUST_FIX

PASS:
- Round 1 identity/security corrections
- technical-admin denial
- authoritative HR/Approver role context requirement
- password max-age injection
- App796 timezone guard
- copy-previous base authorization/reset semantics

BLOCK/MUST FIX:
- HOSHIN_REAL_SCHEMA_MISMATCH
- LEGACY_MIGRATION_DATA_LOSS_RISK
- PREVIEW_TO_APP794_PARITY_NOT_DONE
- EXPORT_PROFILE_FAIL_OPEN
- EXPORT_4_OBJECTIVE_BUG
- HR_DASHBOARD_KINTONE_VALUE_SHAPE_BUG
- App794/App797/App800/App801 live schema delta not prepared against actual exported schemas
```

---

# REAL EXPORTED KINTONE CONTRACTS — USE THESE, DO NOT INVENT ALTERNATE FIELD NAMES

The Control Plane inspected the user-provided full read-only exports dated 2026-08-26. Treat the following as the input contract for this correction round.

## App794 — MBO V2 Sandbox

- current exported schema: 334 fields, 0 records at export time
- objectives are **FLATTENED fields**, not an `Objectives` table/array
- objective planning/evaluation fields include:

```text
Objective_1 ... Objective_10
Weight_1 ... Weight_10
Progress_Percent_1 ... Progress_Percent_10
Actual_Result_1 ... Actual_Result_10
Self_Achievement_1 ... Self_Achievement_10
Self_Comment_1 ... Self_Comment_10
Manager_Achievement_1 ... Manager_Achievement_10
Manager_Objective_Score_1 ... Manager_Objective_Score_10
Manager_Comment_1 ... Manager_Comment_10
GM_Achievement_1 ... GM_Achievement_10
GM_Objective_Score_1 ... GM_Objective_Score_10
GM_Comment_1 ... GM_Comment_10
Average_Objective_Score_1 ... Average_Objective_Score_10
MidYear_Attachment_1 ... MidYear_Attachment_10
Final_Attachment_1 ... Final_Attachment_10
Objective_Count
```

Current App794 has:

```text
Fiscal_Year
Employee_Code
Employee_Name
Employee_Name_TH
Employee_Department
Employee_Section
Employee_Position
Profile_Code
Routing_Topology
PartA_Weight
PartB_Weight
PartA_Raw_Score
PartA_Weighted_Score
PartB_Raw_Score
PartB_Weighted_Score
Department_Hoshin
Section_Hoshin
```

Current App794 DOES NOT yet have the full required immutable Hoshin snapshot fields:

```text
Hoshin_Fiscal_Year
Department_Hoshin_ID
Department_Hoshin_Title
Department_Hoshin_Snapshot
Section_Hoshin_ID
Section_Hoshin_Title
Section_Hoshin_Snapshot
Hoshin_Snapshot_At
```

Current App794 also has no dedicated KPI / Target / Measurement / Planning_Notes fields. Do not pretend they exist. If Copy Previous / export requires them as future business semantics, prepare an explicit schema-delta manifest but do not fabricate values.

## App797 — MBO Hoshin Master [Sandbox]

Current exported schema: 27 fields, 0 records.

REAL physical business fields:

```text
Hoshin_Key
Cycle_Code
Fiscal_Year
Scope_Type                  // DEPARTMENT | SECTION
Scope_Code
Scope_Name
Department_Code
Department_Name
Section_Code
Section_Name
Hoshin_TH
Hoshin_EN
Version
Ready_For_MBO               // YES | NO
Hoshin_Status               // DRAFT | CURRENT_READY | SUPERSEDED
Active                      // Active | Inactive
Updated_By
Updated_At
Remark
```

Do NOT use non-existent physical fields such as `Level`, `Department`, `Section`, `Title`, or physical `Status=PUBLISHED`.

### Canonical/user-facing Hoshin status adapter for this round

Avoid unnecessary replacement of the current App797 status field. Normalize the existing physical fields into canonical domain state:

```text
DRAFT:
  Hoshin_Status = DRAFT

READY:
  Hoshin_Status = CURRENT_READY
  Ready_For_MBO = NO
  Active = Active

PUBLISHED:
  Hoshin_Status = CURRENT_READY
  Ready_For_MBO = YES
  Active = Active

INACTIVE:
  Active = Inactive OR Hoshin_Status = SUPERSEDED
```

This is an adapter contract, not permission for a live write.

Final Gate 7 also requires effective-date governance. App797 currently has no `Effective_From` / `Effective_To`; therefore prepare a schema-delta manifest adding these two DATE fields. Local resolver must support them and fail closed when a published record is outside the effective period. No live schema change in this round.

## App800 — MBO HR Control Center [Sandbox]

Current exported schema has only 8 Kintone/system fields and **0 business configuration fields**.

Therefore HR Dashboard/Phase Calendar cannot be claimed runtime-complete yet. Prepare an exact local schema-delta manifest for at least one FY configuration record with:

```text
Fiscal_Year
Objectives_Open
Objectives_Close
MidYear_Open
MidYear_Close
Self_Evaluation_Open
Self_Evaluation_Close
Appraiser_Evaluation_Open
Appraiser_Evaluation_Close
HR_Final_Open
HR_Final_Close
Password_Max_Age_Days
Failed_Login_Threshold
Lock_Duration_Minutes
Config_Status
```

Reuse App800; do not create another HRCC app.

## App801 — MBO Employee Authentication & MFA Credential Store [Sandbox]

Current exported schema: 22 fields, 0 records.

REAL existing fields already include:

```text
Employee_Code
Password_Hash
Password_Algorithm
Password_Changed_At
Force_Password_Change
Failed_Attempts
Locked_Until
Account_Status
Last_Login_At
Credential_Version
MFA_Enabled
MFA_Enrolled_At
TOTP_Secret_Encrypted
Recovery_Codes_Hashed
```

Do NOT create duplicate physical fields for logical names already represented.

Logical mapping:

```text
Must_Change_Password  -> Force_Password_Change
Failed_Login_Count    -> Failed_Attempts
```

Actual missing fields required by confirmed MBO login design:

```text
Kintone_User_Code
Password_Expires_At
```

Prepare only this required schema delta plus any strictly necessary constraints/defaults. No live write.

---

# CORRECTION 1 — SHARED KINTONE RECORD NORMALIZER

Round 2 mixed plain JS objects and Kintone `{ value: ... }` field objects, causing dashboard/export/copy logic to misread live records.

Create/reuse ONE shared normalization utility, not duplicate helpers in every service.

Minimum contract:

```text
unwrapField(valueOrField)
  if object has own `value` -> return `.value`
  else return input

readString(record, fieldCode)
readNumber(record, fieldCode)
readUserCodes(record, fieldCode)
readFileList(record, fieldCode)
```

Must handle plain deterministic fixtures AND raw Kintone record shapes.

Add App794 objective projection helper that converts flattened slots 1..10 into normalized objective objects. It must honor `Objective_Count` when valid and otherwise infer only from populated objective slots. Do not create phantom objective rows.

Use this normalizer in HR Dashboard, Export, Copy Previous, Hoshin adapters where applicable, and migration mapping.

---

# CORRECTION 2 — GATE 7 HOSHIN REAL CONTRACT

Replace the fake Round 2 Hoshin fixture/schema assumptions.

Implement App797 adapter using the real fields above.

Resolver requirements:

```text
Fiscal_Year exact match
Scope_Type exact DEPARTMENT / SECTION
Department: Scope_Code/Department_Code against authoritative employee department code
Section: Scope_Code/Section_Code against authoritative employee section code
canonical status must be PUBLISHED
Active must be Active
Ready_For_MBO must be YES
Effective_From <= effectiveDate <= Effective_To once schema fields exist
exactly one Department Hoshin
exactly one Section Hoshin
```

Fail closed with the established codes:

```text
NO_DEPARTMENT_HOSHIN
NO_SECTION_HOSHIN
MULTIPLE_ACTIVE_HOSHIN
HOSHIN_NOT_PUBLISHED
HOSHIN_OUTSIDE_EFFECTIVE_DATE
ORGANIZATION_MISMATCH
```

Snapshot must store immutable content using the target App794 snapshot contract. Prefer snapshotting explicit normalized business fields rather than `JSON.stringify(raw Kintone record)` including unnecessary system metadata.

Migration historical Hoshin source is NOT App797. Legacy apps contain:

```text
Text_area   = Department's Hoshin
Text_area_0 = Section's Hoshin
```

Preserve these historical strings in the migrated App794 snapshot/source fields. Never resolve current App797 backwards.

Expected local result:

```text
HOSHIN_REAL_SCHEMA_ADAPTER = PASS
HOSHIN_EFFECTIVE_DATE_SCHEMA_DELTA = READY
APP794_HOSHIN_SNAPSHOT_SCHEMA_DELTA = READY
HOSHIN_RUNTIME_DATA = BLOCKED_UNTIL_APP797_HAS_PUBLISHED_RECORDS
```

App797 currently has 0 records, so do not claim runtime coverage.

---

# CORRECTION 3 — GATE 3 LEGACY MIGRATION USING REAL LEGACY CONTRACT

Legacy apps and fixed profile mapping:

```text
283 -> PROF_STAFF_CHIEF
305 -> PROF_SECTION_MGR
307 -> PROF_DGM
310 -> PROF_ASST_MGR
640 -> PROF_GM
643 -> PROF_SENIOR_MGR
715 -> PROF_VP
716 -> PROF_JAPANESE_STAFF
```

Legacy apps do NOT provide a reliable `Employee_Code` field. Do NOT default from `emp_text` and do NOT invent one.

Identity mapping contract:

```text
legacy Text_name
 -> normalized exact name / explicitly injected alias map
 -> App53 authoritative Employee_Code
```

0 matches -> `EMPLOYEE_MAPPING_NOT_FOUND`
>1 matches -> `EMPLOYEE_MAPPING_AMBIGUOUS`
No fuzzy automatic write candidate.

Fiscal year source is the actual legacy field:

```text
Drop_down_year values such as FY'2021 ... FY'2026
```

Normalize deterministically:

```text
FY'2021 -> FY2021
```

Blank/unknown fiscal year -> `MIGRATION_FISCAL_YEAR_UNRESOLVED` and FAIL/REVIEW REQUIRED.

**DELETE the Round 2 fallback `|| 'FY2022'`. Never fabricate a fiscal year.**

Legacy objective mapping, slots 1..4:

```text
Text_area_action_plan_objN      -> Objective_N (historical planning text)
weight_a_objN                   -> Weight_N
dif_level_objN                  -> historical difficulty provenance
Text_area_actual_result_objN    -> Actual_Result_N
score_app1_objN                 -> historical Appraiser 1 score provenance
score_app2_objN                 -> historical Appraiser 2 score provenance where present
app1_achieve_objN / app2_achieve_objN -> historical achievement provenance
```

Preserve totals and competency/rating fields as provenance/history where target direct fields are not one-to-one. Do not silently drop them.

Attachment rule:
- enumerate ALL legacy FILE-type fields dynamically from injected schema metadata; examples include `Attachment`, `Attachment_0` ... `Attachment_7`;
- manifest file key/name/size/contentType when available;
- classify `ATTACHMENT_TRANSFER_PENDING` until actual target upload succeeds in the later authorized execution round;
- never label attachment `PRESERVED` merely because a source field exists.

Duplicate logical group `{FY, Employee_Code}`:
- exact duplicate records with no business-field conflicts may be merged deterministically and provenance from all sources retained;
- conflicting values or promotion/profile conflicts -> `REVIEW_REQUIRED_DUPLICATE_SOURCE`; do not pick `groupItems[0]` silently;
- `MERGED` counter means a proven merge, not number of discarded rows.

Data-loss accounting must be field-aware. `UNEXPLAINED_DATA_LOSS=0` may be PASS only when every non-empty source business field is either:
1. mapped to target candidate,
2. preserved in structured provenance/history,
3. explicitly classified skipped with a reason,
4. or attachment-transfer-pending.

Add realistic fixtures representing the real field names above.

Expected:

```text
LEGACY_MIGRATION_DRY_RUN_ENGINE = PASS_REAL_CONTRACT
FISCAL_YEAR_FABRICATION = 0
SILENT_PRIMARY_RECORD_SELECTION = 0
ATTACHMENT_FALSE_PRESERVED_CLAIM = 0
UNEXPLAINED_DATA_LOSS = 0 on fixtures
```

---

# CORRECTION 4 — GATE 2 EXPORT

Profile weighting authority is `Profile_Code`, not loose title heuristics.

Exact mapping:

```text
PROF_STAFF_CHIEF      -> 70/30
PROF_JAPANESE_STAFF   -> 70/30
PROF_ASST_MGR         -> 60/40
PROF_SECTION_MGR      -> 50/50
PROF_SENIOR_MGR       -> 50/50
PROF_DGM              -> 50/50
PROF_GM               -> 50/50
PROF_VP               -> 50/50
```

Unknown/blank profile -> FAIL CLOSED `EXPORT_PROFILE_UNRESOLVED`.

Do not default unknown titles to 50/50.

Use the shared App794 flattened-objective normalizer.

Objective count:
- 4 real objectives -> export 4, not 5
- 10 -> export 10
- never fabricate blank objective rows merely to satisfy an arbitrary minimum

Historical template contract remains unchanged:
- Part A workbook
- Part B workbook
- combined workbook
- PDF from same normalized data/scoring source
- preserve approved historical template formatting when exact binary templates are available

If exact binaries are not locally available to Antigravity:

```text
EXPORT_TEMPLATE_BINARY_ASSET = MISSING_LOCAL
```

Do not fabricate a generic workbook.

Add tests for all eight Profile_Code values, unknown profile denial, 4 objectives, 10 objectives, Kintone `{value}` record shape, Thai/English, and current/historical snapshot inputs.

---

# CORRECTION 5 — GATE 4 HR DASHBOARD + APP800

Fix all filters/counts to read raw Kintone `{value}` fields correctly via shared normalizer.

Filters:
Fiscal Year / Division / Department / Section / Team / Position / Employee / Status / Approver.

Approver extraction must support the existing route/appraiser storage architecture without assuming only 2 appraisers long-term. Reuse central route/appraiser projection if one exists.

Phase Calendar must read an injected App800 normalized configuration contract. Dates control availability/countdown only; never execute Process transitions.

Prepare App800 schema-delta spec listed above. Do not deploy.

Expected:

```text
HR_DASHBOARD_KINTONE_SHAPE = PASS
PHASE_CALENDAR_CONFIG_CONTRACT = PASS
APP800_SCHEMA_DELTA = READY
```

---

# CORRECTION 6 — GATE 5 COPY PREVIOUS INTEGRATED CANDIDATE

Keep the passed authorization behavior, but stop assuming an `Objectives` array on live App794.

Use normalized flattened slots.

Copy current physical planning fields only:

```text
Objective_N
Weight_N
```

Do not copy:

```text
Progress_Percent_N
Actual_Result_N
Self_*
Manager_*
GM_*
Average_Objective_Score_*
attachments
scores/comments/approvals/timestamps/history/final result
old Hoshin snapshot
```

Because current App794 lacks KPI/Target/Measurement/Planning_Notes, prepare schema delta for those only if the frozen UI/business design genuinely requires them; do not fabricate copied values.

Integrated candidate must require injected resolvers/results for:
- NEW FY routing snapshot
- NEW FY scoring/config snapshot
- NEW FY Department/Section Hoshin snapshot
- duplicate `{FY}-{Employee}` preflight result

Missing any required current-year dependency -> FAIL CLOSED.

Expected:

```text
COPY_PREVIOUS_REAL_APP794_SHAPE = PASS
COPY_PREVIOUS_INTEGRATED_CANDIDATE = PASS
```

---

# CORRECTION 7 — GATE 6 PREVIEW -> APP794 PARITY + REAL CORE TEST

Round 2 did not modify UI source/dist and therefore did not close parity.

This round MUST locally compare:

```text
preview/index.html
src/main-mbo-app.js
src/ui/**
src/styles/**
dist/mbo-employee-app.js
dist/mbo-employee.css
project-docs/CONFIRMED_BASELINE/UI_UX.md
```

Implement **PREVIEW_TO_APP794_PARITY_CLOSURE** as one coherent package. No visual redesign.

Preserve frozen five-stage UI and all confirmed UI rules. If Preview behavior already exists in maintainable source, prove it with tests/hash/structural assertions rather than rewriting it.

The real core integration test must not merely normalize a position and assign a constant profile. Use actual domain resolvers with injected App795/App796-style records:

```text
Employee/App53 snapshot
-> identity binding
-> real RoutingService resolution from App795-style fixture
-> profile resolution from position
-> App796 config resolution from App796-style fixture
-> Hoshin normalized App797 fixture
-> App794 candidate
-> objective validation
-> Copy Previous current-year dependencies
-> export projection
-> HR dashboard projection
```

Must include:
- M1_G1
- M1_ONLY DGM/GM/VP -> President
- TMG1/TMG2 exact Team matching
- TMT3 fail closed
- profile != routing
- Appraiser slots architecture 1–4

Rename/remove any test whose name overstates what it actually proves.

Expected:

```text
PREVIEW_TO_APP794_PARITY_LOCAL = PASS
CORE_794_795_796_INTEGRATION_LOCAL = PASS_REAL_RESOLVERS
UI_V2_VISUAL_REDESIGN = 0
```

---

# APP796

Do not change App796 data or supersession business logic. Preserve the already-passed timezone guard and prepared DGM repair workflow for the later authorized round.

---

# LOCAL SCHEMA-DELTA MANIFEST — REQUIRED OUTPUT

Prepare one deterministic local schema/deployment delta artifact in the existing schema/config architecture (reuse files; do not create unnecessary parallel systems) covering only missing physical fields required for final closure.

At minimum:

```text
App794:
  Hoshin_Fiscal_Year
  Department_Hoshin_ID
  Department_Hoshin_Title
  Department_Hoshin_Snapshot
  Section_Hoshin_ID
  Section_Hoshin_Title
  Section_Hoshin_Snapshot
  Hoshin_Snapshot_At
  plus KPI/Target/Measurement/Planning_Notes only if confirmed source/UI needs them

App797:
  Effective_From
  Effective_To

App800:
  Fiscal_Year
  five phase open/close pairs
  Password_Max_Age_Days
  Failed_Login_Threshold
  Lock_Duration_Minutes
  Config_Status

App801:
  Kintone_User_Code
  Password_Expires_At
```

Do not deploy it now.

---

# HARD BOUNDARIES

```text
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0
REAL_USER_ACTION = 0
REAL_NOTIFICATION = 0
APP53_WRITE = 0
LEGACY_APP_WRITE = 0
APP794_LIVE_WRITE = 0
APP795_LIVE_WRITE = 0
APP796_LIVE_WRITE = 0
APP797_LIVE_WRITE = 0
APP800_LIVE_WRITE = 0
APP801_LIVE_WRITE = 0
DGM_REPAIR_EXECUTION = 0
UI_V2_REDESIGN = 0
```

Do not broadly update stale CURRENT_STATE/HANDOFF/REVIEW_PACKAGE. Source/test correctness first.

---

# EXECUTION — ONE ANTIGRAVITY ROUND ONLY

1. Confirm branch `ai/antigravity-wp002c`, pull latest, verify Starting HEAD ancestry.
2. Read confirmed baseline first, then this task.
3. Inspect only files directly required by corrections above.
4. Implement the shared Kintone record normalizer first.
5. Correct Hoshin, migration, export, dashboard, copy-previous contracts against the real field names above.
6. Close Preview -> App794 parity locally without visual redesign.
7. Prepare exact schema-delta manifest; do not execute it.
8. Add focused tests.
9. Run targeted tests once near completion.
10. Run `npm test` ONCE after all source changes.
11. Build dist ONCE only if source/UI changes require it.
12. Confirm zero Kintone/browser/network execution.
13. Commit and push same branch.
14. STOP for ChatGPT review.

# REQUIRED RETURN

Return only:

```text
STATUS: READY FOR CHATGPT REVIEW
START_HEAD:
END_HEAD:
FILES_CHANGED:

SHARED_KINTONE_NORMALIZER:
HOSHIN_REAL_SCHEMA_ADAPTER:
APP794_HOSHIN_SNAPSHOT_SCHEMA_DELTA:
APP797_EFFECTIVE_DATE_SCHEMA_DELTA:
APP800_SCHEMA_DELTA:
APP801_SCHEMA_DELTA:
LEGACY_MIGRATION_REAL_CONTRACT:
UNEXPLAINED_DATA_LOSS_FIXTURE:
EXPORT_PROFILE_FAIL_CLOSED:
EXPORT_4_AND_10_OBJECTIVES:
HR_DASHBOARD_KINTONE_SHAPE:
COPY_PREVIOUS_INTEGRATED:
PREVIEW_TO_APP794_PARITY_LOCAL:
CORE_REAL_RESOLVER_INTEGRATION:

EXPORT_TEMPLATE_BINARY_ASSET: AVAILABLE | MISSING_LOCAL
MBO_SECONDARY_PASSWORD_SECURE_BACKEND: BLOCKED_NO_TRUSTED_SERVER_BOUNDARY
HOSHIN_RUNTIME_DATA: BLOCKED_NO_APP797_RECORDS

TARGETED_TESTS:
NPM_TEST:
BUILD:

KINTONE_CALLS: 0
KINTONE_WRITES: 0
KINTONE_DEPLOYS: 0
BROWSER_SMOKE: 0
BLOCKERS:
```

Then STOP.
