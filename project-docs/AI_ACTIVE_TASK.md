# AI ACTIVE TASK — MICRO FINAL CORRECTION BEFORE FINAL KINTONE EXECUTION

> Control Plane: ChatGPT
> Execution Plane: Antigravity standalone
> Repository: `rebootob/MBO2026`
> Branch: `ai/antigravity-wp002c`
> Starting HEAD: `ec226874c5ddf0947868789f87a29581620c98ed`
> Mode: **CREDIT-SAVER / MICRO FINAL CORRECTION / ONE ROUND ONLY**
> Kintone authorization: **NONE**
> Kintone GET/WRITE/DEPLOY/BROWSER-SMOKE: **0 / 0 / 0 / 0**

## OBJECTIVE

Close ONLY the four remaining local blockers from the independent review of `ec226874...`. Do not reopen passed gates, do not redesign frozen UI V2, and do not contact Kintone. After this task, the intended next step is one controlled Final Kintone Execution round only.

## ACCEPTED — DO NOT REGRESS

- Gate 2 export Profile_Code mapping and unknown-profile fail-closed.
- shared Kintone normalizer.
- App796 timezone guard and prior identity/security fixes.
- App795 route resolution is now exercised locally.
- App797 canonical CURRENT_READY + Ready_For_MBO + Active adapter.
- HR dashboard raw Kintone field handling.
- schema manifest exact app names and removal of invented 90/5/30 defaults.
- Copy Previous flattened App794 shape and dependency/duplicate preflight gates.

---

# BLOCKER 1 — COPY PREVIOUS MUST COMPOSE CURRENT-YEAR ROUTING + SCORING INTO APP794 PHYSICAL CANDIDATE

Target: existing `src/services/annual-record-service.js` and existing tests only unless an existing mapper should be reused.

Current defect: `newRoutingSnapshot` and `newScoringConfig` are validated but mostly returned outside `planningCandidate`. The candidate must be write-ready against existing approved App794 physical fields.

Populate ONLY already-confirmed physical fields that exist in App794 and are supported by current routing/scoring contracts. At minimum, when available from the injected current-year snapshots, compose:

```text
Profile_Code
Routing_Topology
Requester_User
First_Manager_User      // only if existing routing snapshot supplies it / field exists
Manager_User
GM_User
PartA_Weight
PartB_Weight
```

If the repository/export contract confirms additional existing routing snapshot fields required by App794, reuse them; do not invent new physical field names.

Rules:
- values must come from NEW FY routing/scoring inputs, never prior-year App794 values.
- preserve Kintone `{ value: ... }` shape appropriate to each physical field.
- USER_SELECT fields must use the existing resolved user arrays/codes, not display strings.
- if a required routing/scoring value needed for a write-ready candidate is missing/malformed, FAIL CLOSED with an explicit error instead of emitting partial READY.
- do not write to Kintone.

Tests:
- candidate contains new FY Profile_Code / Routing_Topology / PartA_Weight / PartB_Weight.
- applicable requester/approver user fields come from NEW routing snapshot.
- prior-year routing/scoring values are not reused.
- malformed required routing/scoring snapshot fails closed.

Expected:

```text
COPY_PREVIOUS_WRITE_READY_INTEGRATION = PASS
```

---

# BLOCKER 2 — LEGACY MIGRATION MUST PRESERVE VALUES, NOT ONLY BUCKET LABELS

Target: existing `src/services/legacy-migration-service.js` and existing tests.

Current defect: `fieldBucketAudit` can say `PRESERVED_IN_PROVENANCE` without persisting the actual historical field value, and `totalUnexplainedFieldLoss` is initialized to zero without a real field-level proof. Duplicate equivalence also compares too few business fields.

## Required reconciliation model

For EVERY non-empty source business field, store an explicit reconciliation entry containing at least:

```text
sourceFieldCode
bucket
sourceValue (normalized serializable value; for sensitive/system-only fields use appropriate existing safe representation)
targetFieldCode OR provenancePath OR explainedReason
```

Allowed buckets remain:

```text
MAPPED_TO_TARGET
PRESERVED_IN_PROVENANCE
ATTACHMENT_TRANSFER_PENDING
SKIPPED_EXPLAINED
CONFLICT_REVIEW_REQUIRED
```

A `PRESERVED_IN_PROVENANCE` entry is valid only if its actual normalized value is included in structured provenance/history.

Attachments must preserve their manifest metadata and stay `ATTACHMENT_TRANSFER_PENDING` until later authorized upload.

## Real field-aware proof

Compute unexplained field loss from reconciliation coverage, not row arithmetic.

```text
UNEXPLAINED_FIELD_LOSS = count of non-empty source business fields with no valid reconciliation entry/value/reason
```

Do not report zero by initialization alone.

`UNEXPLAINED_DATA_LOSS=0` may be claimed only when row/group accounting AND field-level coverage are both complete.

## Duplicate equivalence

For groups `{FY, Employee_Code}` with >1 source record, deterministic equivalence must include ALL non-empty normalized business/provenance-relevant values, including as applicable:
- objectives/action plans
- weights/difficulty
- actual results
- appraiser scores/achievements/comments where present
- competency/rating/totals
- Department and Section historical Hoshin
- attachments/manifests
- any extra non-empty historical business field preserved in provenance

Do not use a hand-picked short list that can miss conflicts.

Equivalent duplicate rows may merge only when their normalized business projections are proven equivalent. Then using one deterministic representative for target projection is acceptable ONLY because equivalence has been proven, while provenance from all source rows is retained.

Any conflict -> no candidate + `REVIEW_REQUIRED_DUPLICATE_SOURCE` + reconciliation entries identify conflict fields.

Never fabricate source id/revision.

Tests required:
- extra unknown non-empty legacy business field: actual value is present in provenance and unexplained field loss remains 0.
- deliberately remove/classify no reconciliation for a non-empty field -> unexplained field loss >0.
- same-profile duplicate with conflict in Actual Result -> review required.
- conflict in Section Hoshin -> review required.
- conflict in attachment manifest -> review required.
- equivalent duplicates merge and retain provenance from every source record.

Expected:

```text
LEGACY_FIELD_VALUE_PRESERVATION = PASS
LEGACY_FIELD_AWARE_RECONCILIATION = PASS
LEGACY_DUPLICATE_FULL_PROJECTION_COMPARE = PASS
UNEXPLAINED_FIELD_LOSS_PROOF = PASS
```

---

# BLOCKER 3 — HOSHIN MALFORMED DATE MUST FAIL CLOSED + REMOVE FAKE PHYSICAL FALLBACKS

Target: existing `src/services/hoshin-service.js` and existing tests.

Keep accepted code authority and inclusive-date behavior, but fix these remaining defects.

## Strict calendar-date validation

`YYYY-MM-DD` regex alone is insufficient. Reject impossible dates such as:

```text
2026-99-99
2026-02-30
2026-13-01
```

For App797 DATE fields, validate that year/month/day form a real calendar date and round-trip exactly.

If `Effective_From` or `Effective_To` is non-empty but invalid -> fail closed with an explicit Hoshin effective-date/configuration error. Reuse an established code if appropriate; otherwise use one precise code and test it. Do not silently treat malformed dates as missing.

Keep inclusive comparison by calendar date.

## Real schema only

Remove authorization/matching fallbacks to non-existent App797 physical fields from the runtime resolver:

```text
Level
Department
Section
Title
```

Use only the confirmed real schema for matching/status. Display title may use `Hoshin_TH` then `Hoshin_EN`; do not use fake physical `Title`.

Snapshot ID may use real `Hoshin_Key` and/or real Kintone `$id` if present; do not invent alternate physical business fields.

Tests required:
- `2026-99-99` fails closed.
- `2026-02-30` fails closed.
- valid leap/date boundaries work.
- existing before/inside/end-date/after tests remain PASS.
- same name wrong code remains `ORGANIZATION_MISMATCH`.

Expected:

```text
HOSHIN_MALFORMED_DATE_FAIL_CLOSED = PASS
HOSHIN_REAL_PHYSICAL_FIELDS_ONLY = PASS
```

---

# BLOCKER 4 — CLOSE GATE 6 UI PARITY + FIX CORE TEST STAGE

## 4A. Core integration test stage defect

Target existing `tests/core-794-795-796-integration.test.js`.

Current defect: it uses `BUSINESS_STAGES.OBJECTIVES_SUBMISSION`, which does not exist. Change the test to the real stage used by the validation engine (`BUSINESS_STAGES.OBJECTIVE_INPUT` or the exact existing stage contract).

Make the flattened fixture truly satisfy objective validation:
- Employee_Code / Employee_Name / Fiscal_Year
- Profile_Code
- Routing_Topology
- Requester_User
- Objective_Count
- Objective_N
- Action_Plan_N
- Weight_N total 100
- Difficulty_N valid 1..4

Then assert `ValidationEngine.validate(...).isValid === true`.

This test must continue to exercise actual App795 route resolution, App796 scoring, App797 Hoshin, Copy Previous, export, and HR dashboard.

Expected:

```text
CORE_OBJECTIVE_VALIDATION_REAL_STAGE = PASS
CORE_REAL_RESOLVER_INTEGRATION = PASS_REAL_FIXTURES
```

## 4B. Preview -> actual App794 parity

This was not executed in the previous commit. Do it now, but do NOT redesign UI V2.

First inspect existing repository-local Preview source and current actual App794 customization source. If the exact approved Preview source cannot be identified locally, STOP and report `PREVIEW_SOURCE_NOT_FOUND`; do not guess.

Prefer editing existing App794 UI/runtime files. Do not create `_final`, `_v3`, or parallel replacement UI files.

Close only approved parity gaps already defined:
- frozen five-stage MBO guided UI.
- bilingual labels/status guidance.
- approver display uses ordinal `1st/2nd/3rd/4th Appraiser` semantics.
- Objective_Count controls flattened physical objective slots.
- Phase Calendar can consume normalized injected App800 config contract.
- Copy Previous UI control uses corrected local candidate builder/preflight flow but MUST NOT perform Kintone write in this task.
- Hoshin display reads new FY snapshot fields when available.
- Export controls use the normalized export foundation; if template binary is unavailable keep explicit `MISSING_LOCAL` state.
- preserve frozen process/status semantics and visual design.

If local source wiring is possible, update actual source and build once near completion. If some runtime action truly requires Kintone, local wiring may be PASS while that specific runtime verification remains for Final Kintone Execution; document exactly what remains.

Expected:

```text
PREVIEW_TO_APP794_PARITY_LOCAL = PASS|BLOCKED_PREVIEW_SOURCE_NOT_FOUND
FROZEN_UI_REDESIGN = 0
APP794_RUNTIME_WRITE = 0
```

---

# GOVERNANCE / TEST RULES

- Work only on `ai/antigravity-wp002c`.
- 0 Kintone calls, 0 writes, 0 deploys, 0 browser smoke.
- No protected legacy app/data modification.
- Do not broaden scope beyond the four blockers above.
- Reuse existing functions/files; avoid new files unless clearly necessary.
- Run targeted tests only as needed during implementation.
- Run full `npm test` ONCE near completion.
- If UI source changes, build App794 bundle ONCE near completion.
- Update `project-docs/AI_REVIEW_PACKAGE.md`, `CURRENT_STATE.md`, and `HANDOFF.md` with exact evidence and remaining runtime-only blockers.
- Do not edit `CONFIRMED_BASELINE`.

## STOP CONDITIONS

STOP rather than guess if:
- Preview source cannot be identified locally.
- a physical Kintone field is uncertain and not already supported by repository/export evidence.
- a fix requires Kintone access.
- any change conflicts with frozen routing/scoring/UI/process baseline.
- a new security/data-integrity P0/P1 issue is discovered outside this task.

## REQUIRED FINAL REPORT

Return exactly:

```text
IMPLEMENTATION_HEAD = <sha>
KINTONE_CALLS = 0
KINTONE_WRITES = 0
KINTONE_DEPLOYS = 0
BROWSER_SMOKE = 0

COPY_PREVIOUS_WRITE_READY_INTEGRATION = PASS|BLOCKED
LEGACY_FIELD_VALUE_PRESERVATION = PASS|BLOCKED
LEGACY_FIELD_AWARE_RECONCILIATION = PASS|BLOCKED
LEGACY_DUPLICATE_FULL_PROJECTION_COMPARE = PASS|BLOCKED
UNEXPLAINED_FIELD_LOSS_PROOF = PASS|BLOCKED
HOSHIN_MALFORMED_DATE_FAIL_CLOSED = PASS|BLOCKED
HOSHIN_REAL_PHYSICAL_FIELDS_ONLY = PASS|BLOCKED
CORE_OBJECTIVE_VALIDATION_REAL_STAGE = PASS|BLOCKED
CORE_REAL_RESOLVER_INTEGRATION = PASS|BLOCKED
PREVIEW_TO_APP794_PARITY_LOCAL = PASS|BLOCKED_PREVIEW_SOURCE_NOT_FOUND|BLOCKED
EXPORT_TEMPLATE_BINARY_ASSET = AVAILABLE|MISSING_LOCAL
FULL_NPM_TEST = PASS|FAIL
BUILD = PASS|NOT_REQUIRED|FAIL
FINAL_KINTONE_EXECUTION_READINESS = READY|BLOCKED

CHANGED_FILES = <exact list>
REMAINING_BLOCKERS = <exact list or NONE>
```

Commit and push authorized local changes, then STOP. Do not begin Final Kintone Execution.