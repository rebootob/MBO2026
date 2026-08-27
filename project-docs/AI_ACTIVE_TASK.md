# AI ACTIVE TASK — LAST LOCAL CLOSURE BEFORE FINAL KINTONE EXECUTION

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `f5a7dfd5829081d9b0b7deb2e22826fd1a64cdf7`
> Mode: **CREDIT-SAVER / LAST LOCAL CLOSURE / TWO BLOCKERS ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close ONLY the two blockers remaining after independent review of `f5a7dfd...`:

1. Gate 3 Legacy Migration must emit real physical App794 flattened candidates and produce a real field-aware reconciliation proof.
2. Gate 6 Preview -> App794 parity must be completed from approved repository-local source, or STOP with `PREVIEW_SOURCE_NOT_FOUND` if that source cannot be identified.

Do not reopen already-passed local gates. Do not contact Kintone. Do not redesign frozen UI V2.

## ACCEPTED — DO NOT REGRESS

- Gate 2 export local foundation.
- Gate 4 HR dashboard local foundation.
- Gate 5 Copy Previous current-year routing/scoring/Hoshin composition and duplicate preflight.
- Gate 7 Hoshin code authority, inclusive effective dates, malformed-date fail-closed, real physical matching fields.
- App795 real route resolver integration fixture.
- App796 scoring/profile foundation and timezone backup guard.
- shared Kintone normalizer.
- schema delta manifest exact app names and no invented password-policy defaults.
- identity/security corrections already accepted.

---

# BLOCKER A — LEGACY MIGRATION MUST TARGET REAL APP794 PHYSICAL SHAPE

Target: existing `src/services/legacy-migration-service.js` and existing migration tests. Reuse normalizers/mappers already present.

## A1. Candidate shape

Current defect: migration candidate still returns logical `Objectives: [...]`, which is NOT a physical App794 field.

For a migratable historical logical record, emit a target candidate using actual App794 flattened fields. At minimum:

```text
Record_Key
Fiscal_Year
Employee_Code
Employee_Name
Profile_Code
Workflow_Status
Is_Migrated_Record
Objective_Count
Objective_1 ... Objective_4
Action_Plan_1 ... Action_Plan_4      // when source semantics support it
Weight_1 ... Weight_4
Difficulty_1 ... Difficulty_4        // when source value exists and target field exists
Actual_Result_1 ... Actual_Result_4  // historical actual values when mapped by confirmed contract
Department_Hoshin_Title
Section_Hoshin_Title
Migration_Provenance
```

Use only confirmed physical App794 fields. Do NOT create `Objectives` array/table in target candidate.

Historical appraiser scores/achievements/competency/totals that do not have a safe one-to-one target field must remain in structured provenance, not be silently projected into a guessed field.

`Record_Key` must be deterministic `{FY}-{Employee_Code}` using the normalized FY and authoritative App53 employee mapping.

## A2. Explicit source -> target mapping evidence

For every source field classified `MAPPED_TO_TARGET`, `targetFieldCode` must be the ACTUAL target code, not the source code.

Examples:

```text
Drop_down_year                  -> Fiscal_Year
Text_name                       -> Employee_Name
Text_area_action_plan_obj1      -> Objective_1
weight_a_obj1                   -> Weight_1
Text_area_actual_result_obj1    -> Actual_Result_1
Text_area                       -> Department_Hoshin_Title
Text_area_0                     -> Section_Hoshin_Title
```

If source semantics are not a safe one-to-one mapping, use `PRESERVED_IN_PROVENANCE` instead of guessing.

## A3. Reconciliation proof must be computed, not initialized

Every non-empty source field must have exactly one valid reconciliation record containing:

```text
sourceFieldCode
bucket
sourceValue
targetFieldCode OR provenancePath OR explainedReason
```

Allowed buckets:

```text
MAPPED_TO_TARGET
PRESERVED_IN_PROVENANCE
ATTACHMENT_TRANSFER_PENDING
SKIPPED_EXPLAINED
CONFLICT_REVIEW_REQUIRED
```

Validation rules:

- `MAPPED_TO_TARGET` requires non-empty `targetFieldCode` and that field/value is represented in target candidate or an explicitly documented derived mapping.
- `PRESERVED_IN_PROVENANCE` requires non-empty `provenancePath` and the actual normalized value persisted there.
- `ATTACHMENT_TRANSFER_PENDING` requires attachment manifest metadata retained.
- `SKIPPED_EXPLAINED` requires explicit reason.
- conflicts must not create a migration candidate.

Compute:

```text
UNEXPLAINED_FIELD_LOSS = number of non-empty source fields without a valid reconciliation entry
```

Do not keep a variable at zero without validation. `UNEXPLAINED_DATA_LOSS=0` is PASS only if row/group accounting AND field reconciliation both pass.

## A4. Duplicate groups

The full-projection comparison from the previous round may remain, but make it deterministic for structured/array fields such as attachment lists. Do not rely on `String(array/object)` because distinct structured values can collapse to the same string representation.

Normalize values into stable serializable form before comparison.

Equivalent duplicates may use one representative only AFTER full equivalence is proven, with provenance retained from every source row.

Any differing business/provenance-relevant value -> `REVIEW_REQUIRED_DUPLICATE_SOURCE`, no target candidate.

## A5. Required tests

Add/update tests proving:

- migration candidate contains physical `Objective_1`, `Weight_1`, etc. and does NOT contain `Objectives`.
- `Text_area_action_plan_obj1` reconciliation points to `Objective_1`, not back to its own source code.
- historical Actual Result maps correctly where confirmed.
- extra unknown non-empty field value is preserved in provenance.
- a deliberately unreconciled non-empty field causes `UNEXPLAINED_FIELD_LOSS > 0` or a fail-closed result; do not fake success.
- attachment list conflict between duplicate rows -> `REVIEW_REQUIRED_DUPLICATE_SOURCE`.
- Section Hoshin / Actual Result / competency or other preserved field conflict -> review required.
- equivalent duplicate rows merge with provenance from all sources.

Expected:

```text
LEGACY_TARGET_APP794_PHYSICAL_SHAPE = PASS
LEGACY_SOURCE_TARGET_MAPPING_EVIDENCE = PASS
LEGACY_FIELD_AWARE_RECONCILIATION = PASS
UNEXPLAINED_FIELD_LOSS_PROOF = PASS
LEGACY_DUPLICATE_FULL_PROJECTION_COMPARE = PASS
```

---

# BLOCKER B — PREVIEW -> ACTUAL APP794 PARITY

This is the ONLY UI work in this task.

## B1. Identify approved local Preview source first

Before modifying UI, inspect repository-local files/history/documentation enough to identify BOTH:

```text
APPROVED_PREVIEW_SOURCE = <exact path(s)>
ACTUAL_APP794_RUNTIME_SOURCE = <exact path(s)>
```

Do not use Kintone or browser smoke to discover this.

If approved Preview source cannot be identified with repository evidence, STOP immediately and report:

```text
PREVIEW_TO_APP794_PARITY_LOCAL = BLOCKED_PREVIEW_SOURCE_NOT_FOUND
PREVIEW_SOURCE_NOT_FOUND = <what was searched / why ambiguous>
```

Do NOT guess, recreate, or redesign the UI.

## B2. If source is identifiable, close parity using existing files/functions/styles

No redesign. Preserve frozen UI V2.

Verify/port only approved behavior already defined:

- five-stage guided MBO UI.
- bilingual labels/status guidance.
- ordinal `1st/2nd/3rd/4th Appraiser` display semantics.
- `Objective_Count` controls physical flattened objective slots.
- Phase Calendar consumes normalized injected App800 config contract.
- Copy Previous control calls corrected local candidate/preflight flow, but executes ZERO Kintone writes in this round.
- Hoshin display reads new FY snapshot/title fields.
- Export controls use normalized export foundation and preserve `MISSING_LOCAL` when exact Excel template binary is absent.
- frozen process/status semantics remain unchanged.

Prefer existing runtime/UI/style files. Do not create `_final`, `_v3`, replacement app, or parallel UI architecture.

If source changes require build, build exactly once near completion.

Expected if source exists:

```text
PREVIEW_TO_APP794_PARITY_LOCAL = PASS
FROZEN_UI_REDESIGN = 0
APP794_RUNTIME_WRITE = 0
```

---

# GOVERNANCE / TEST RULES

- Branch: `ai/antigravity-wp002c` only.
- 0 Kintone GET, 0 Kintone write, 0 deploy, 0 browser smoke.
- Do not modify protected legacy apps/data.
- Do not reopen passed gates unless a direct regression is discovered.
- No broad discovery beyond repository-local evidence needed for these two blockers.
- Run targeted tests only when needed.
- Run full `npm test` ONCE near completion.
- Build App794 ONCE only if UI source changes require it.
- Update `project-docs/AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, and `HANDOFF.md` with exact result/evidence.
- Do not edit `CONFIRMED_BASELINE`.

## STOP CONDITIONS

STOP rather than guess if:
- approved Preview source cannot be identified locally;
- physical target field is uncertain and not supported by repository/export evidence;
- completion would require Kintone access;
- implementation would conflict with frozen UI/routing/scoring/process baseline;
- a new P0/P1 security/data-integrity issue is discovered.

## REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

LEGACY_TARGET_APP794_PHYSICAL_SHAPE = PASS|BLOCKED
LEGACY_SOURCE_TARGET_MAPPING_EVIDENCE = PASS|BLOCKED
LEGACY_FIELD_AWARE_RECONCILIATION = PASS|BLOCKED
UNEXPLAINED_FIELD_LOSS_PROOF = PASS|BLOCKED
LEGACY_DUPLICATE_FULL_PROJECTION_COMPARE = PASS|BLOCKED
PREVIEW_TO_APP794_PARITY_LOCAL = PASS|BLOCKED_PREVIEW_SOURCE_NOT_FOUND|BLOCKED
APPROVED_PREVIEW_SOURCE = <exact path(s)|NOT_FOUND>
ACTUAL_APP794_RUNTIME_SOURCE = <exact path(s)|NOT_FOUND>
EXPORT_TEMPLATE_BINARY_ASSET = AVAILABLE|MISSING_LOCAL
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|NOT_REQUIRED|FAIL
FINAL_KINTONE_EXECUTION_READINESS = READY|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push authorized local changes, then STOP. Do not begin Final Kintone Execution.