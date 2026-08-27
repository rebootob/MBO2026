# AI ACTIVE TASK — FINAL 2-BLOCKER LOCAL CLOSURE

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `39d85db246376588bdf9c20671e00f7740ed702d`
> Mode: **CREDIT-SAVER / FINAL TWO BLOCKERS / ONE ROUND ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close ONLY the two blockers remaining after independent ChatGPT review of `39d85db...`:

1. Complete a real independent field-coverage proof for Legacy Migration.
2. Resolve Preview -> actual App794 parity from repository-local evidence, or STOP with `BLOCKED_PREVIEW_SOURCE_NOT_FOUND` if the approved Preview source cannot be identified.

Do not reopen passed gates. Do not contact Kintone. Do not redesign frozen UI V2.

## ACCEPTED — DO NOT REGRESS

- Legacy migration target candidate now uses real flattened App794 physical fields and no `Objectives` array.
- Legacy source-to-target mapping evidence exists for confirmed one-to-one fields.
- Historical unknown values are retained in structured provenance.
- Duplicate conflicts fail closed using broad source comparison.
- Copy Previous local integration = PASS.
- Hoshin local integration = PASS.
- Core real resolver integration = PASS_LOCAL_SOURCE_REVIEW.
- Gate 2 Export, Gate 4 HR Dashboard, Gate 5 Copy Previous, Gate 7 Hoshin local foundations remain accepted.

---

# BLOCKER 1 — LEGACY MIGRATION INDEPENDENT FIELD-COVERAGE PROOF

Target existing `src/services/legacy-migration-service.js` and existing migration tests only unless a small existing utility is clearly reusable.

## 1.1 Source coverage set

For every source record build an explicit set/list of ALL non-empty source fields after unwrapping/normalization.

System metadata may be included in the coverage set only if it receives `SKIPPED_EXPLAINED`; do not silently omit it from the proof.

For every non-empty source field require exactly one reconciliation entry identified by `sourceFieldCode`.

Compute independently:

```text
nonEmptySourceFieldCodes
reconciledSourceFieldCodes
missingReconciliation = nonEmptySourceFieldCodes - reconciledSourceFieldCodes
duplicateReconciliation = repeated sourceFieldCode entries
```

Then:

```text
UNEXPLAINED_FIELD_LOSS =
  missingReconciliation.count
  + invalidReconciliation.count
  + duplicateReconciliation.count where ambiguous
```

Do NOT derive this from an initialized counter or only by validating entries that already exist.

## 1.2 Reconciliation validity

Every reconciliation entry must satisfy exactly one allowed bucket:

```text
MAPPED_TO_TARGET
PRESERVED_IN_PROVENANCE
ATTACHMENT_TRANSFER_PENDING
SKIPPED_EXPLAINED
CONFLICT_REVIEW_REQUIRED
```

Rules:

- `MAPPED_TO_TARGET` requires `targetFieldCode` AND proof that the candidate contains that target field with the expected normalized/derived value.
- `PRESERVED_IN_PROVENANCE` requires `provenancePath` AND proof that the actual normalized source value exists at that path.
- `ATTACHMENT_TRANSFER_PENDING` requires retained attachment manifest metadata.
- `SKIPPED_EXPLAINED` requires a non-empty reason.
- `CONFLICT_REVIEW_REQUIRED` prevents target candidate creation for that logical group.

Return per-record reconciliation evidence sufficient for review, e.g. coverage totals/missing/invalid codes.

`UNEXPLAINED_DATA_LOSS=0` may be reported only when row/group accounting AND field coverage proof both equal zero unexplained loss.

## 1.3 Stable structured normalization

Current comparison uses plain `JSON.stringify()`. Replace this with a deterministic/canonical serializer for objects/arrays used in reconciliation and duplicate equivalence:

- object keys sorted recursively;
- array order preserved unless the business object is explicitly order-insensitive;
- primitive values normalized consistently;
- do not mutate source records.

This prevents semantically identical objects with different key insertion order from being falsely classified as conflicts.

## 1.4 Candidate mapping proof

Keep current flattened candidate contract. For mapped fields verify actual target representation, including at minimum:

```text
Drop_down_year               -> Fiscal_Year
Text_name                    -> Employee_Name
Text_area_action_plan_objN   -> Objective_N
weight_a_objN                -> Weight_N
Text_area_actual_result_objN -> Actual_Result_N
dif_level_objN               -> Difficulty_N
Text_area                    -> Department_Hoshin_Title
Text_area_0                  -> Section_Hoshin_Title
```

Do not mark a field `MAPPED_TO_TARGET` if the candidate does not actually contain the expected target value.

## 1.5 Required tests

Add/update tests proving:

- every non-empty field in a realistic source fixture appears exactly once in reconciliation coverage;
- a test-only/unmapped field intentionally omitted from reconciliation produces `UNEXPLAINED_FIELD_LOSS > 0` or fail-closed result;
- mapped source field whose candidate value does not match is detected as invalid reconciliation;
- preserved unknown field proves its actual value exists at provenance path;
- attachment pending entry proves manifest retained;
- objects with same semantic keys but different insertion order compare equivalent;
- truly different structured attachment/object content conflicts;
- equivalent duplicates still merge with provenance from all source rows.

Expected:

```text
LEGACY_INDEPENDENT_FIELD_COVERAGE = PASS
LEGACY_MAPPED_VALUE_PROOF = PASS
LEGACY_PROVENANCE_VALUE_PROOF = PASS
LEGACY_CANONICAL_STRUCTURED_COMPARE = PASS
UNEXPLAINED_FIELD_LOSS_PROOF = PASS
```

---

# BLOCKER 2 — PREVIEW -> ACTUAL APP794 PARITY OR EXPLICIT STOP

This is the ONLY UI/runtime investigation in this task.

## 2.1 Identify sources BEFORE editing

Search repository-local tree/history/docs for concrete evidence of BOTH:

```text
APPROVED_PREVIEW_SOURCE = <exact path(s)>
ACTUAL_APP794_RUNTIME_SOURCE = <exact path(s)>
```

Evidence must be repository-local and specific enough to show which Preview is the approved/frozen UI V2 source. Do not infer merely from filenames like `preview`, `_v2`, `sample`, `demo` without corroborating repository evidence.

If the approved Preview source cannot be identified unambiguously, STOP the UI portion and report exactly:

```text
PREVIEW_TO_APP794_PARITY_LOCAL = BLOCKED_PREVIEW_SOURCE_NOT_FOUND
APPROVED_PREVIEW_SOURCE = NOT_FOUND
ACTUAL_APP794_RUNTIME_SOURCE = <path if known, otherwise NOT_FOUND>
PREVIEW_SOURCE_SEARCH_EVIDENCE = <concise exact paths/commits/docs searched and ambiguity>
```

Do NOT recreate, approximate, or redesign the Preview.

## 2.2 If approved Preview source is identified

Compare it against actual App794 runtime source and port ONLY missing already-approved behavior using existing files/functions/styles wherever possible.

Required parity items:

- frozen five-stage guided MBO UI;
- bilingual labels/status guidance;
- ordinal `1st/2nd/3rd/4th Appraiser` semantics;
- `Objective_Count` drives flattened physical objective slots;
- Phase Calendar can consume normalized injected App800 configuration;
- Copy Previous control uses corrected candidate/preflight path but performs ZERO Kintone writes in this task;
- Hoshin display reads current/new FY snapshot/title fields;
- Export controls use normalized export foundation and preserve explicit `MISSING_LOCAL` if Excel template binaries are unavailable;
- no process/status/routing/scoring redesign.

If source changes require a build, build App794 exactly once near completion.

Expected if source exists:

```text
PREVIEW_TO_APP794_PARITY_LOCAL = PASS
FROZEN_UI_REDESIGN = 0
APP794_RUNTIME_WRITE = 0
```

---

# GOVERNANCE / EXECUTION RULES

```text
KINTONE_GET = 0
KINTONE_WRITE = 0
KINTONE_DEPLOY = 0
BROWSER_SMOKE = 0
APP53_WRITE = 0
LEGACY_APP_WRITE = 0
```

- Branch `ai/antigravity-wp002c` only.
- Do not broaden scope.
- Do not alter Confirmed Baseline.
- Reuse existing source; no `_final`, `_v3`, or parallel replacement implementation.
- Run targeted tests only as needed.
- Run full `npm test` ONCE near completion.
- Build only once if UI source actually changes.
- Update `project-docs/AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, and `HANDOFF.md` concisely with exact result/evidence.

## STOP CONDITIONS

STOP rather than guess if:

- approved Preview source cannot be identified unambiguously;
- a physical App794 field is uncertain;
- implementation would require Kintone access;
- implementation conflicts with frozen UI/routing/scoring/process baseline;
- a new P0/P1 security/data-integrity issue is found.

## REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

LEGACY_INDEPENDENT_FIELD_COVERAGE = PASS|BLOCKED
LEGACY_MAPPED_VALUE_PROOF = PASS|BLOCKED
LEGACY_PROVENANCE_VALUE_PROOF = PASS|BLOCKED
LEGACY_CANONICAL_STRUCTURED_COMPARE = PASS|BLOCKED
UNEXPLAINED_FIELD_LOSS_PROOF = PASS|BLOCKED
PREVIEW_TO_APP794_PARITY_LOCAL = PASS|BLOCKED_PREVIEW_SOURCE_NOT_FOUND|BLOCKED
APPROVED_PREVIEW_SOURCE = <exact path(s)|NOT_FOUND>
ACTUAL_APP794_RUNTIME_SOURCE = <exact path(s)|NOT_FOUND>
PREVIEW_SOURCE_SEARCH_EVIDENCE = <concise evidence>
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|NOT_REQUIRED|FAIL
FINAL_KINTONE_EXECUTION_READINESS = READY|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push authorized local changes, then STOP. Do not begin Final Kintone Execution.