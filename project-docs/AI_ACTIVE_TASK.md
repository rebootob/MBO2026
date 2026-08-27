# AI ACTIVE TASK — FINAL SURGICAL LOCAL CORRECTION

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `7d482e85c54df2dfbd5c35664aec5cd5c4b8b8b7`
> Mode: **CREDIT-SAVER / SURGICAL / TWO ISSUES ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close ONLY the final two local issues from independent review of `7d482e85...`:

1. Make Legacy Migration canonical serialization and mapped-value reconciliation proof robust enough for data-integrity closure.
2. Execute Preview -> actual App794 runtime parity using the already-identified repository-local approved Preview source.

Do not reopen passed gates. Do not contact Kintone. Do not redesign frozen UI V2.

## ACCEPTED — DO NOT REGRESS

- Gate 1 Login/Data Isolation local foundation.
- Gate 2 Export local foundation.
- Gate 4 HR Dashboard local foundation.
- Gate 5 Copy Previous local foundation.
- Gate 7 Hoshin local foundation.
- Legacy migration flattened physical App794 candidate shape.
- Legacy source-to-target mapping table.
- Legacy unknown-field provenance preservation.
- Legacy independent source coverage set.
- Core real resolver integration using actual App795-shaped routing fixture and flattened App794 objective validation.
- Schema delta manifest safety.

---

# ISSUE A — LEGACY MIGRATION FINAL DATA-INTEGRITY PROOF

Target existing:
- `src/services/legacy-migration-service.js`
- `tests/legacy-migration-service.test.js`

Do NOT rewrite migration architecture.

## A1. Canonical serializer must be collision-safe

Current serializer is NOT safe enough because primitives are concatenated without JSON-safe type/escaping boundaries. Examples such as:

```text
["a,b"]
["a", "b"]
```

must never canonicalize to the same value.

Implement deterministic serialization with these properties:

- object keys recursively sorted;
- array order preserved;
- primitives encoded with explicit JSON-safe representation and type-safe boundaries;
- strings use proper escaping;
- number/boolean/null remain distinguishable from strings such as `"1"`, `"true"`, `"null"`;
- source objects are not mutated.

A simple acceptable strategy is recursively building a normalized value with sorted object keys and then `JSON.stringify()` that normalized structure.

Required tests:

```text
["a,b"] != ["a","b"]
"1" != 1
"true" != true
objects with same semantic keys but different insertion order == equivalent
nested objects with different key order == equivalent
real attachment/object content difference == conflict
```

Expected:

```text
LEGACY_CANONICAL_SERIALIZER_COLLISION_SAFE = PASS
LEGACY_DUPLICATE_FULL_PROJECTION_COMPARE = PASS
```

## A2. MAPPED_TO_TARGET proof must verify expected value, not only target presence

Current proof only checks target field exists/non-empty. Replace this with explicit expected-value verification.

For every `MAPPED_TO_TARGET` reconciliation entry, determine the expected target value using the approved mapping/normalization rule and compare it against the actual candidate value after target normalization.

At minimum verify:

```text
Drop_down_year               -> Fiscal_Year       using normalizeFiscalYear()
Fiscal_Year                  -> Fiscal_Year       using normalizeFiscalYear()/canonical FY normalization
Text_name                    -> Employee_Name     trimmed text
Employee_Name                -> Employee_Name     trimmed text
Text_area_action_plan_objN   -> Objective_N       trimmed text
weight_a_objN                -> Weight_N          normalized numeric/text representation used by candidate
Text_area_actual_result_objN -> Actual_Result_N   trimmed text
dif_level_objN               -> Difficulty_N      normalized target representation
Text_area                    -> Department_Hoshin_Title
Text_area_0                  -> Section_Hoshin_Title
```

Do NOT compare raw `FY'2021` directly to normalized target `FY2021`; compare through the documented transform.

Each mapped reconciliation entry should contain enough evidence for review, for example:

```text
sourceFieldCode
targetFieldCode
sourceValue
expectedTargetValue
actualTargetValue
mappingRule
mappingVerified = true|false
```

If a mapped field is present but the normalized target value does not match expectation:
- increment invalid reconciliation / unexplained field loss;
- do not claim field proof PASS;
- preferably fail closed for the migration candidate if safe within the current service contract.

## A3. Reconciliation proof must explicitly count missing / duplicate / invalid entries

For each source record compute independently:

```text
nonEmptySourceFieldCodes
reconciliationEntriesBySourceFieldCode
missingReconciliation
ambiguousDuplicateReconciliation
invalidReconciliation
```

Then:

```text
recordUnexplainedFieldLoss =
  missingReconciliation.length
  + ambiguousDuplicateReconciliation.length
  + invalidReconciliation.length
```

Do not rely on a loop that creates an entry and immediately marks that same field as reconciled without a separate validation pass.

`coverageProof` should expose exact counts and codes.

Required negative tests:
- test-only injected missing reconciliation -> unexplained field loss > 0 or explicit fail-closed status;
- duplicate reconciliation entries for one source field -> detected;
- mapped candidate value tampered/mismatched -> invalid reconciliation detected;
- preserved provenance value missing/tampered -> invalid reconciliation detected;
- attachment pending without retained manifest -> invalid reconciliation detected.

If production code does not naturally permit injecting a broken reconciliation state, expose/reuse a small pure validator helper rather than weakening production logic merely for testing.

Expected:

```text
LEGACY_INDEPENDENT_FIELD_COVERAGE = PASS
LEGACY_MAPPED_VALUE_PROOF = PASS
LEGACY_PROVENANCE_VALUE_PROOF = PASS
UNEXPLAINED_FIELD_LOSS_PROOF = PASS
```

---

# ISSUE B — EXECUTE PREVIEW -> ACTUAL APP794 PARITY NOW

The Control Plane has already identified the repository-local sources. Do NOT spend another round searching for them and do NOT report PREVIEW_SOURCE_NOT_FOUND.

Canonical local sources for this task:

```text
APPROVED_PREVIEW_SOURCE = preview/index.html

ACTUAL_APP794_RUNTIME_SOURCE =
- src/main-mbo-app.js
- src/ui/employee-part-a-ui.js
- existing src/styles/* used by App794 bundle

BUILD OUTPUT =
- dist/mbo-employee-app.js
- dist/mbo-employee.css
```

Repository evidence also confirms `project-docs/CONFIRMED_BASELINE/UI_UX.md` is the frozen UI/UX source of truth. Read it before editing UI.

## B1. Compare approved Preview against runtime source

Perform a focused parity diff. Do not redesign.

Create a concise internal checklist from the frozen baseline and verify each item against actual App794 runtime:

1. exactly five macro business stages;
2. Thai + English user-facing guidance;
3. lifecycle appraiser route uses ordinal labels `1st/2nd/3rd/4th Appraiser` / Thai equivalents, never Manager/GM as business slot labels;
4. `Objective_Count` drives flattened `Objective_1..10` UI visibility/data handling;
5. Difficulty blank state stays blank and does not visually default to 3;
6. optional attachment/evidence areas for Objectives, Mid-Year, Self Evaluation where approved, without creating fake persistence fields;
7. Mid-Year Progress % is employee-entered 0..100 and distinct from process progress;
8. phase-calendar/deadline UX can consume injected App800 config and shows upcoming/open/due/overdue/completed semantics;
9. waiting boundary states 05/10 guide Requester to native Kintone Start action when the window opens; no automatic date transition;
10. Copy Previous UI control is wired to the corrected local candidate/preflight path but performs ZERO Kintone writes in this round;
11. Hoshin display reads current/new FY snapshot/title fields when present;
12. Export controls use normalized export foundation and preserve explicit `MISSING_LOCAL` when exact binary templates are absent;
13. native Kintone comment thread remains available/not intentionally hidden;
14. 3–4 appraiser matrices stay contained inside App794 content width; no body/page horizontal overflow;
15. historical/read-only stages remain truthful and permission-aware.

## B2. Port only missing approved behavior

If a parity item is already implemented, leave it alone.

If missing, edit existing runtime source/functions/styles. Prefer:

```text
src/main-mbo-app.js
src/ui/employee-part-a-ui.js
existing src/styles/*
```

Do not create `_final`, `_v3`, replacement page, or parallel architecture.

Do not change frozen Process topology, routing rules, profile ratios, or UI visual direction.

## B3. Local-only wiring rules

This round must remain write-free.

- Copy Previous button may prepare/preview a candidate or invoke local pure service path only. No `kintone.api` write.
- Phase Calendar must consume normalized injected/config data locally; no App800 GET in this task.
- Hoshin display must use record/local snapshot fields; no App797 GET in this task.
- Export may use local projection foundation; if binary template is unavailable, UI must say/template-state remain `MISSING_LOCAL` and not fabricate generic output.

## B4. Build and tests

Because UI source is expected to change, run:
- targeted UI/unit tests as needed;
- full `npm test` ONCE near completion;
- `npm run ui:build` ONCE near completion.

Verify bundle outputs changed only as expected.

Expected:

```text
PREVIEW_TO_APP794_PARITY_LOCAL = PASS
FROZEN_UI_REDESIGN = 0
APP794_RUNTIME_WRITE = 0
BUILD = PASS
```

---

# GOVERNANCE / HARD BOUNDARIES

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
BROWSER_SMOKE = 0
APP53_WRITE = 0
LEGACY_APP_WRITE = 0
APP794_LIVE_WRITE = 0
APP800_LIVE_GET = 0
APP797_LIVE_GET = 0
```

- Branch `ai/antigravity-wp002c` only.
- Do not edit `CONFIRMED_BASELINE`.
- Do not broaden scope.
- Do not create new Kintone apps.
- Do not mutate protected legacy apps/data.
- Do not execute migration writes.
- Do not deploy customization.
- Update `project-docs/AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, and `HANDOFF.md` concisely after implementation with exact local evidence and remaining runtime-only blockers.

## STOP CONDITIONS

STOP rather than guess if:
- a physical App794 field required for parity is genuinely uncertain and cannot be confirmed from repo/export evidence;
- a parity behavior would require changing frozen Process/routing/scoring semantics;
- a required runtime action cannot be made local-only without a Kintone call;
- a new P0/P1 security/data-integrity issue is found.

Do NOT stop for `PREVIEW_SOURCE_NOT_FOUND`; the Control Plane has already identified `preview/index.html` as the approved repository-local Preview source for this task.

## REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

LEGACY_CANONICAL_SERIALIZER_COLLISION_SAFE = PASS|BLOCKED
LEGACY_INDEPENDENT_FIELD_COVERAGE = PASS|BLOCKED
LEGACY_MAPPED_VALUE_PROOF = PASS|BLOCKED
LEGACY_PROVENANCE_VALUE_PROOF = PASS|BLOCKED
UNEXPLAINED_FIELD_LOSS_PROOF = PASS|BLOCKED
LEGACY_DUPLICATE_FULL_PROJECTION_COMPARE = PASS|BLOCKED

APPROVED_PREVIEW_SOURCE = preview/index.html
ACTUAL_APP794_RUNTIME_SOURCE = src/main-mbo-app.js + src/ui/employee-part-a-ui.js + existing src/styles/*
PREVIEW_TO_APP794_PARITY_LOCAL = PASS|BLOCKED
FROZEN_UI_REDESIGN = 0
APP794_RUNTIME_WRITE = 0
EXPORT_TEMPLATE_BINARY_ASSET = AVAILABLE|MISSING_LOCAL
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|FAIL
FINAL_KINTONE_EXECUTION_READINESS = READY|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push authorized local changes, then STOP. Do not begin Final Kintone Execution.