# AI ACTIVE TASK — PROJECT CLOSE LOCAL FINAL CORRECTION

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `d66e58f2a2299d9f6b55e4cc1cbea0da333aad08`
> Mode: **CREDIT-SAVER / FINAL LOCAL CORRECTION / ONE ROUND ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY: **0 / 0 / 0**

## OBJECTIVE

Close the remaining local blockers found by independent ChatGPT review of Round 2-R1 so that the next round can be the single controlled Final Kintone Execution round.

Do not contact Kintone. Do not browser-smoke. Do not deploy. Do not write any Kintone app. Do not modify protected legacy apps. Do not broad-discover. Do not redesign frozen UI V2. Reuse existing source and tests wherever possible; avoid unnecessary new files.

## REVIEW BASELINE

Round 2-R1 HEAD reviewed: `d66e58f2a2299d9f6b55e4cc1cbea0da333aad08`

Already accepted / do not regress:
- Profile_Code export mapping for all 8 confirmed profiles.
- Unknown Profile_Code export fail-closed.
- 4-objective phantom-row bug removed.
- shared Kintone `{ value }` normalizer foundation.
- App797 physical status adapter: CURRENT_READY + Ready_For_MBO + Active.
- HR dashboard basic raw-Kintone-field handling.
- FY2022 fabrication removed.
- attachment false-PRESERVED claim removed.
- App801 duplicate logical password fields avoided.
- Round 1 identity/security corrections and App796 timezone guard.

Remaining blockers to close exactly in this task:
1. Copy Previous still emits a non-physical `Objectives` array and does not require all current-year dependencies / duplicate preflight.
2. Legacy migration still silently selects `groupItems[0]` for same-profile duplicate groups and row-count arithmetic is not field-aware data-loss proof.
3. Hoshin still lacks exact fail-closed semantics for effective-date and organization-code mismatches.
4. Schema manifest uses shortened app names and invented password-policy defaults.
5. Core integration test still uses a fake `Objectives` table shape and does not resolve an actual App795 routing fixture.
6. Preview -> App794 parity is still not closed.

---

# CORRECTION A — COPY PREVIOUS MUST EMIT REAL APP794 PHYSICAL SHAPE

Target: `src/services/annual-record-service.js` and existing tests.

App794 uses flattened fields. `generateCopyPreviousCandidate()` must NOT return `planningCandidate.Objectives` and must NOT emit non-existent physical fields such as `Objective_Description`, `KPI`, `Target`, `Measurement` unless a separately approved schema field exists. Current physical planning fields to copy are:

```text
Objective_Count
Objective_1 ... Objective_10
Action_Plan_1 ... Action_Plan_10
Additional_Agreement_1 ... Additional_Agreement_10
Weight_1 ... Weight_10
Difficulty_1 ... Difficulty_10
```

Use the current App794 real field names. Copy only planning semantics. Explicitly exclude:

```text
Progress_Percent_N
Periodical_Review_N
MidYear_*
Actual_Result_N
Self_*
Manager_*
GM_*
Average_Objective_Score_N
attachments
scores/comments/approvals/timestamps/history/final results
old Hoshin snapshot
```

The returned candidate must be a write-ready App794-shaped object with Kintone `{ value: ... }` field objects where appropriate.

Required current-year dependencies — ALL must be present and validated before returning READY:
- `newRoutingSnapshot`
- `newScoringConfig`
- `newHoshinSnapshot`
- `duplicatePreflightResult`

Required duplicate preflight contract:

```text
duplicatePreflightResult.checked === true
duplicatePreflightResult.exists === false
```

If missing, unchecked, malformed, or duplicate exists -> FAIL CLOSED with explicit error code. Do not perform live lookup in this task.

Hoshin fields in candidate must use the new FY snapshot, never old values. Routing/scoring snapshot fields should use existing approved physical fields if already defined; do not invent unrelated field names.

Tests required:
- real flattened prior-year App794 shape -> flattened new candidate.
- 1 objective and 10 objective cases.
- old actual/self/manager/gm/attachment values absent in new candidate.
- missing routing/scoring/Hoshin/duplicate preflight each fails closed.
- duplicate exists fails closed.
- employee A cannot copy employee B remains PASS.

Expected:

```text
COPY_PREVIOUS_REAL_APP794_SHAPE = PASS
COPY_PREVIOUS_DEPENDENCY_FAIL_CLOSED = PASS
COPY_PREVIOUS_DUPLICATE_PREFLIGHT = PASS
```

---

# CORRECTION B — LEGACY MIGRATION: NO SILENT PRIMARY RECORD SELECTION

Target: `src/services/legacy-migration-service.js` and existing tests.

Do not use `groupItems[0]` as an implicit winner when a logical group `{FiscalYear, EmployeeCode}` contains multiple source records.

For groups with >1 source row:
1. Build a deterministic normalized business projection for every source record.
2. Compare all non-empty mapped business values and preserved provenance values.
3. Exact-equivalent duplicate rows may merge; retain provenance from every source row.
4. Any conflicting value, profile conflict, objective conflict, rating/total conflict, Hoshin conflict, or attachment-list conflict -> do NOT create candidate; classify:

```text
REVIEW_REQUIRED_DUPLICATE_SOURCE
```

5. `MERGED` counts only proven equivalent merges.

Never fabricate `$id` or `$revision`. If unavailable, store `null` plus an explicit provenance status such as `SOURCE_RECORD_ID_UNAVAILABLE` / `SOURCE_REVISION_UNAVAILABLE`; do not default either to `"1"`.

## Field-aware reconciliation

Create/extend a reconciliation manifest per source record. Every non-empty source business field must end in exactly one bucket:

```text
MAPPED_TO_TARGET
PRESERVED_IN_PROVENANCE
ATTACHMENT_TRANSFER_PENDING
SKIPPED_EXPLAINED
CONFLICT_REVIEW_REQUIRED
```

`UNEXPLAINED_DATA_LOSS = 0` may be reported only if no non-empty field is outside those buckets. Do not derive this solely from source row counts.

Preserve legacy values without one-to-one App794 fields in structured provenance rather than dropping them. This includes totals, competency/rating values, difficulty/achievement/appraiser details, historical Hoshin, and other non-empty historical business fields.

Attachment classification remains `ATTACHMENT_TRANSFER_PENDING` until actual upload succeeds later.

Tests required:
- equivalent duplicate merge PASS with all provenance retained.
- same-profile but conflicting objective -> REVIEW_REQUIRED_DUPLICATE_SOURCE and no candidate.
- profile conflict -> review required.
- missing source id/revision -> null + explicit status, never `1`.
- fixture with extra non-empty business field proves it is preserved/classified.
- field-aware unexplained data loss equals 0 only when reconciliation is complete.

Expected:

```text
SILENT_PRIMARY_RECORD_SELECTION = 0
FIELD_AWARE_RECONCILIATION = PASS
FABRICATED_SOURCE_ID_REVISION = 0
LEGACY_DUPLICATE_CONFLICT_FAIL_CLOSED = PASS
```

---

# CORRECTION C — HOSHIN EXACT ORGANIZATION + EFFECTIVE DATE FAIL-CLOSED

Target: `src/services/hoshin-service.js` and existing tests.

Use real App797 physical schema only.

## Organization resolution

Runtime authoritative inputs are employee Department Code and Section Code.

Department match may use:
- `Scope_Type === DEPARTMENT`
- exact `Scope_Code === employeeDepartmentCode` OR exact `Department_Code === employeeDepartmentCode`

Section match may use:
- `Scope_Type === SECTION`
- exact `Scope_Code === employeeSectionCode` OR exact `Section_Code === employeeSectionCode`

Do NOT authorize a match solely from `Scope_Name`, `Department_Name`, or `Section_Name`. Names may be snapshot/display metadata only.

If records exist for FY/scope/status but organization code does not match authoritative employee code, throw/return explicit `ORGANIZATION_MISMATCH` rather than degrading it to a generic missing-Hoshin case where the mismatch is detectable.

## Effective dates

For canonical PUBLISHED records:
- `Effective_From`, when present, is inclusive.
- `Effective_To`, when present, is inclusive for the entire calendar date.
- Compare DATE values by calendar date, not midnight timestamp that rejects later times on the same `Effective_To` date.
- invalid effective date value -> fail closed.
- otherwise-PUBLISHED matching record outside the effective range -> `HOSHIN_OUTSIDE_EFFECTIVE_DATE`.

Still require exactly one valid Department and one valid Section PUBLISHED record.

Tests required for:
- code match succeeds.
- same name but wrong code -> ORGANIZATION_MISMATCH.
- before Effective_From -> HOSHIN_OUTSIDE_EFFECTIVE_DATE.
- during Effective_To at 23:xx local/explicit date context remains valid for that date.
- after Effective_To -> HOSHIN_OUTSIDE_EFFECTIVE_DATE.
- malformed date fails closed.
- duplicate valid published records -> MULTIPLE_ACTIVE_HOSHIN.

Expected:

```text
HOSHIN_CODE_AUTHORITY = PASS
HOSHIN_ORGANIZATION_MISMATCH = PASS
HOSHIN_EFFECTIVE_DATE_INCLUSIVE = PASS
```

---

# CORRECTION D — SCHEMA DELTA MANIFEST SAFETY

Target: `src/config/schema-delta-manifest.js`.

Use exact exported app names:

```text
App794 = MBO V2 Sandbox
App797 = MBO Hoshin Master [Sandbox]
App800 = MBO HR Control Center [Sandbox]
App801 = MBO Employee Authentication & MFA Credential Store [Sandbox]
```

Remove invented business defaults from:
- `Password_Max_Age_Days`
- `Failed_Login_Threshold`
- `Lock_Duration_Minutes`

These are configuration values to be explicitly seeded/approved later. The schema may define numeric constraints if justified, but no invented default value.

App801 delta remains ONLY the genuinely missing fields required now:
- `Kintone_User_Code`
- `Password_Expires_At`

Do not duplicate `Force_Password_Change`, `Failed_Attempts`, or other existing credential fields.

Add a small local manifest test if one does not already exist.

Expected:

```text
SCHEMA_MANIFEST_EXACT_APP_NAMES = PASS
INVENTED_PASSWORD_POLICY_DEFAULTS = 0
APP801_DUPLICATE_CREDENTIAL_FIELDS = 0
```

---

# CORRECTION E — REAL CORE INTEGRATION TEST

Target the existing `tests/core-794-795-796-integration.test.js`; do not create a misleading parallel test.

The fixture must use App794 flattened fields, NOT `Objectives: { value: [...] }`.

The integration path must exercise real local domain resolvers with deterministic fixtures:

```text
Kintone identity binding
-> App53 EmployeeService snapshot
-> App795 RoutingService route resolution using an actual App795-shaped fixture
-> App796 profile/scoring resolver
-> App797 real-schema Hoshin resolver
-> App794 flattened planning record/candidate
-> objective validation using the actual flattened contract or the real adapter used by runtime
-> Copy Previous with all current-year dependency/preflight gates
-> export projection
-> HR dashboard projection
```

Do not claim App795 integration by only calling `normalizePosition()`.

Use the confirmed App795 routing model:
- non-TMG key = Section_Code
- TMG1/TMG2 key = `Section_Code|Team`
- exact team route required for TMG; no Section-only fallback.

Do not change frozen routing rules.

Expected:

```text
CORE_REAL_RESOLVER_INTEGRATION = PASS_REAL_FIXTURES
FAKE_OBJECTIVES_TABLE_FIXTURE = 0
APP795_ROUTE_RESOLUTION_EXERCISED = YES
```

---

# CORRECTION F — PREVIEW -> APP794 PARITY CLOSURE

This is the only UI portion of this task. Do NOT redesign frozen UI V2.

Inspect the existing approved Preview implementation/source already in the repository and the current App794 customization source. Port only the missing approved behavior into the actual App794 runtime source using the existing files/functions/styles whenever possible.

Required behavior to verify/close, without visual redesign:
- five-stage MBO guided UI already frozen in baseline.
- bilingual labels/status guidance.
- route/appraiser display uses ordinal `1st/2nd/3rd/4th Appraiser` semantics, not Manager/GM business labels.
- Objective_Count and dynamic objective slots work against physical flattened App794 fields.
- Phase calendar messages can consume injected App800 config contract.
- Copy Previous control is wired to the corrected local candidate path, but MUST NOT execute Kintone writes in this task.
- Hoshin display consumes new FY snapshot fields when present.
- Export controls call/use the existing normalized export projection foundation; if exact Excel binary templates are unavailable locally, preserve `MISSING_LOCAL` state rather than creating a generic workbook.
- preserve current frozen workflow Process semantics and current visual design.

Do not add new UI files unless separation of concerns clearly requires it. Prefer editing existing `src/main-mbo-app.js`, existing `src/ui/*`, styles, and existing build entry points.

If a real runtime integration cannot be completed without Kintone contact, implement the local adapter/wiring and mark only that runtime sub-gate blocked. Do not fake runtime evidence.

Build once near completion only if source changes require it.

Expected:

```text
PREVIEW_TO_APP794_PARITY_LOCAL = PASS
FROZEN_UI_REDESIGN = 0
APP794_RUNTIME_WRITE = 0
```

---

# TEST / EXECUTION RULES

- Work only on branch `ai/antigravity-wp002c`.
- 0 Kintone calls, 0 writes, 0 deploys, 0 browser smoke.
- Do not alter protected legacy apps or data.
- Run targeted tests during development only if needed.
- Run the full `npm test` suite ONCE near completion.
- Build App794 bundle ONCE near completion if source/UI changes require it.
- Do not run repeated broad discovery.
- No new generic documents or duplicate `_v2/_final` source files.
- Update `project-docs/AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, and `HANDOFF.md` concisely with this task result and exact blockers remaining for Final Kintone Execution.
- Do not edit `CONFIRMED_BASELINE` unless implementation exposes a direct contradiction that requires STOP and Control Plane review.

## STOP CONDITIONS

STOP and report instead of guessing if:
- exact existing Preview source cannot be identified locally.
- physical field name is uncertain and cannot be derived from already-provided repository/export evidence.
- fixing a blocker would require Kintone access.
- a proposed change conflicts with frozen routing/scoring/UI baseline.
- tests reveal a pre-existing security/data-integrity defect outside this task scope that could affect Final Deploy.

## REQUIRED FINAL REPORT

Return a concise report containing exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0

COPY_PREVIOUS_REAL_APP794_SHAPE = PASS|BLOCKED
COPY_PREVIOUS_DEPENDENCY_FAIL_CLOSED = PASS|BLOCKED
LEGACY_FIELD_AWARE_RECONCILIATION = PASS|BLOCKED
LEGACY_DUPLICATE_CONFLICT_FAIL_CLOSED = PASS|BLOCKED
HOSHIN_CODE_AUTHORITY = PASS|BLOCKED
HOSHIN_EFFECTIVE_DATE = PASS|BLOCKED
SCHEMA_MANIFEST_SAFETY = PASS|BLOCKED
CORE_REAL_RESOLVER_INTEGRATION = PASS|BLOCKED
PREVIEW_TO_APP794_PARITY_LOCAL = PASS|BLOCKED
EXPORT_TEMPLATE_BINARY_ASSET = AVAILABLE|MISSING_LOCAL
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|NOT_REQUIRED|FAIL
FINAL_KINTONE_EXECUTION_READINESS = READY|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push all authorized local changes, then STOP. Do not begin Final Kintone Execution.