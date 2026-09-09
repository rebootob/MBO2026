# MBO2026 Active Work Package Contract

Updated: 2026-09-09 ICT

> **Role:** exact active authorization/scope authority.
> Governance: `project-docs/MBO_CONTROL_GOVERNANCE_CONSOLIDATION.md`.

## Current contract state

```text
ACTIVE_WORK_PACKAGE = NONE
ACTIVE_WORK_PACKAGE_STATUS = NONE
CANONICAL_BRANCH = ai/antigravity-wp002c

LAST_CLOSED_WORK_PACKAGE = D3-IMP-04
LAST_CLOSED_RESULT = PASS / CLOSED / INDEPENDENT CONTROL PLANE REVIEWED
LAST_REVIEWED_IMPLEMENTATION_HEAD = 077acd29534d28523b349aee7edc4d4a0148122a
LAST_REVIEWED_EVIDENCE_HEAD = d803ae60b42d97cde070d4efef41d5a2c8f836af

D3-IMP-02-R1 = PASS / SUPERSEDED BY ACCEPTED R2 CORRECTIVE
D3-IMP-02-R2 = PASS / CLOSED
D3-IMP-03 = PASS / CLOSED
D3-IMP-03-R1 = PASS / SUPERSEDED BY ACCEPTED R2 CORRECTIVE
D3-IMP-03-R2 = PASS / CLOSED
D3-IMP-04 = PASS / CLOSED
D3-IMP-04-R1 = PASS / SUPERSEDED BY ACCEPTED R2 CORRECTIVE
D3-IMP-04-R2 = PASS / CLOSED

KINTONE_READS_AUTHORIZED = 0
KINTONE_WRITES_AUTHORIZED = 0
NETWORK_CALLS_AUTHORIZED = 0
SCHEMA_LIVE_WRITES_AUTHORIZED = 0
PROCESS_WRITES_AUTHORIZED = 0
DATA_BACKFILL_AUTHORIZED = 0
DEPLOYMENTS_AUTHORIZED = 0

NEXT_RECOMMENDED_GATE = D3-IMP-05
NEXT_PERMITTED_ACTION = OWNER_SELECTION_OR_AUTHORIZATION_OF_NEXT_BOUNDED_GATE
AUTO_START_NEXT_WORK_PACKAGE = NO
LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER
```

## D3-IMP-01 closure record

```text
D3-IMP-01 = PASS / CLOSED
FINAL_REVIEW_HEAD = a2832b29bc391efc1773e0214ae072529f53ca2d
KINTONE_READS = 0
KINTONE_WRITES = 0
SCHEMA_WRITES = 0
PROCESS_WRITES = 0
DEPLOYMENTS = 0
LEGACY_TEST_HARNESS_NON_EXIT = PRE-EXISTING / OUTSIDE D3-IMP-01 DIFF / NON-BLOCKING
```

## D3-IMP-02 closure record

Owner-authorized package chain:

```text
D3-IMP-02 = Local Schema Target + Guarded Migration Tooling
D3-IMP-02-R1 = Scorer Fail-Closed + Readiness Validation + True Schema Diff Corrective
D3-IMP-02-R2 = Migration Completeness + Required-Field Readiness Hardening
```

Accepted final implementation head:

```text
46102eafd5ebaee5e65e4f6afc57dc3b6b115348
```

Accepted capability:

- App795 local target schema supports Model A versioned routing fields.
- App794 local target schema contains the five D3 provenance fields.
- App798 requires zero new physical fields for D3-008.
- scorer seed planning is explicit-HR only and fail-closed when not configured.
- readiness validation rejects missing/malformed route-version identity, status, pattern, dates and scorer plans.
- migration planning requires explicit local current-schema evidence and produces deterministic ADD/MODIFY/NO-CHANGE planning across the eight target App795 fields.
- incompatible field types fail closed.
- migration tooling remains dry-run/local only; live write execution is locked.
- rollback tooling is plan-only and cannot execute mutation.

Verification evidence accepted from execution plus independent source/diff review:

```text
R1_SCHEMA_AND_MIGRATION_TESTS = 38 / 38 PASS
R1_COMBINED_D3_TESTS = 78 / 78 PASS
R2_SCHEMA_AND_MIGRATION_TESTS = 68 / 68 PASS
R2_COMBINED_D3_TESTS = 108 / 108 PASS

KINTONE_READS = 0
KINTONE_WRITES = 0
NETWORK_CALLS = 0
SCHEMA_LIVE_WRITES = 0
PROCESS_WRITES = 0
DATA_BACKFILL = 0
DEPLOYMENTS = 0
```

Independent Control Plane verdict:

```text
D3-IMP-02-R2 = PASS / CLOSED
D3-IMP-02 = PASS / CLOSED
CODE_CORRECTIVE_REQUIRED = NO
REIMPLEMENTATION_REQUIRED = NO
SCOPE_LEAK = NONE FOUND
```

No later D3 package is authorized by this closure.

## D3-IMP-03 closure record

Owner-authorized package chain:

```text
D3-IMP-03 = Runtime App795 Resolution + App794 Bound Snapshot Integration
D3-IMP-03-R1 = Runtime Activation + Canonical K Authority + Bound Snapshot Fail-Closed Corrective
D3-IMP-03-R2 = Explicit Business-Date Source Lock + Final Test Evidence
```

Accepted final implementation head:

```text
3624d93e95f5eb9940a826a61108889d2c215a41
```

Accepted capability:

- Model A effective-dated App795 resolution is integrated into the explicit D3 runtime path.
- normal D3 runtime activation is explicit (`d3: true`) and does not silently fall back to legacy `Active` authority.
- `Frozen_Profile_Code` is resolved from the verified employee snapshot.
- `K_expected` authority comes from the exact PUBLISHED App796 scoring configuration `Expected_Appraiser_Count`; duplicate hardcoded runtime K authority was removed.
- own-MBO self-elision and explicit HR scorer-plan viability use accepted D3 pure contracts.
- App794 binds the five mandatory D3 provenance fields and reuses sequential route snapshot fields with D3 V1 ALL-only semantics.
- bound-stage reuse is tri-state and fail-closed: truly unbound may resolve fresh, valid bound snapshot remains immutable, partial/malformed D3 provenance fails with `D3_BOUND_SNAPSHOT_INVALID`.
- next-stage fresh resolution remains forbidden before verified prior-stage archive success; App798 archive implementation remains outside D3-IMP-03.
- employee identity change clears stale route/provenance/scoring snapshot state before fresh binding.
- business-date source is locked to explicit injected runtime input only; App794 record fields, current clock, timezone inference, and legacy routing cannot supply it.

Final verification evidence accepted from execution plus independent source/diff review:

```text
D3_RUNTIME_ROUTE_BINDING_TESTS = 48 / 48 PASS
ROUTING_SERVICE_REGRESSION_TESTS = 37 / 37 PASS
CORE_INTEGRATION_TESTS = 1 / 1 PASS
D3_IMP_01_TESTS = 40 / 40 PASS
D3_IMP_02_TESTS = 68 / 68 PASS
COMBINED_FOCUSED_TESTS = 86 / 86 PASS
ALL_D3_TESTS = 156 / 156 PASS

KINTONE_READS = 0
KINTONE_WRITES = 0
NETWORK_CALLS = 0
SCHEMA_LIVE_WRITES = 0
PROCESS_WRITES = 0
APP798_WRITES = 0
DATA_BACKFILL = 0
DEPLOYMENTS = 0
```

Independent Control Plane verdict:

```text
D3-IMP-03-R2 = PASS / CLOSED
D3-IMP-03-R1 = PASS / SUPERSEDED BY ACCEPTED R2 CORRECTIVE
D3-IMP-03 = PASS / CLOSED
CODE_CORRECTIVE_REQUIRED = NO
REIMPLEMENTATION_REQUIRED = NO
SCOPE_LEAK = NONE FOUND
LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER
```

No later D3 package is authorized by this closure.

## D3-IMP-04 execution record

Owner-authorized package:

```text
D3-IMP-04 = App798 Archive / Reopen / Route-Reassignment Service
SCOPE = LOCAL IMPLEMENTATION AND TESTS ONLY / ZERO KINTONE / ZERO DEPLOYMENT
OWNER_AUTHORIZATION = อนุมัติ D3-IMP-04 App798 Archive / Reopen / Route-Reassignment Service แบบ LOCAL-ONLY / ZERO KINTONE / ZERO DEPLOYMENT ตามขอบเขตที่เสนอ
STARTING_HEAD = ae35c448081967e8821862b114820f76feea4d15
STATUS = EXECUTION COMPLETE / AWAITING CONTROL PLANE REVIEW
```

Capabilities implemented:
- Deterministic archive-event construction across the 3 locked event types:
  - `STAGE_COMPLETION_SNAPSHOT`: `<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|STAGE_COMPLETION`
  - `EVALUATION_REVISION_CREATED`: `<Source_Record_Key>|<Evaluation_Stage>|R<OldRevision>|EVALUATION_REVISION_CREATED|TO_R<NewRevision>`
  - `ROUTE_REASSIGNMENT_PRECHANGE`: `<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|ROUTE_REASSIGNMENT_PRECHANGE|<Stable_Event_ID>`
- Date boundary archive events rejected; zero date-driven writes.
- Canonical D3 snapshot serializer reused; SHA-256 computed deterministically.
- Snapshot identity coherence validated before write attempt.
- App 798 physical row mapping; zero new physical fields added.
- Injected repository abstraction (`RevisionArchiveKintoneRepository`) with bounded `findByArchiveKey`, `createArchiveRecord`, and `readBackExactArchiveRecord`; zero update/delete capabilities.
- Exact idempotency & retry contract:
  - 0 existing -> create + read-back
  - 1 existing matching -> idempotent success (`idempotentReplay: true`, 0 new rows)
  - 1 existing conflicting -> fail closed (`ARCHIVE_IDEMPOTENCY_CONFLICT`)
  - >1 existing -> fail closed (`ARCHIVE_DUPLICATE_KEY_CORRUPTION`)
- Create + read-back verification:
  - Verifies `Snapshot_Hash`, `Snapshot_JSON`, `Archived_By`, `Archive_Key`, `Archived_At`.
  - Uncertain write handling: on transport error, checks if row was acknowledged before failing closed.
- Archive-Before-Change gate helpers (`assertArchiveBeforeChangeGate`).
- Exact actor user code resolution (prohibits blank, guessed, display-name-only, and "SYSTEM").
- Exact business reason validation (required for reopen and reassignment; deterministic default for stage completion).

Verification evidence:
```text
REVISION_ARCHIVE_SERVICE_TESTS = 28 / 28 PASS
REVISION_ARCHIVE_REPOSITORY_TESTS = 8 / 8 PASS
D3_ARCHIVE_IDEMPOTENCY_TESTS = 7 / 7 PASS
D3_REOPEN_ARCHIVE_INTEGRATION_TESTS = 4 / 4 PASS
COMBINED_D3_IMP_04_TESTS = 47 / 47 PASS (159ms)

D3_IMP_01_TESTS = 40 / 40 PASS (113ms)
D3_IMP_02_TESTS = 68 / 68 PASS (124ms)
D3_IMP_03_TESTS = 86 / 86 PASS (216ms)
COMBINED_ALL_TESTS = 241 / 241 PASS

KINTONE_READS = 0
KINTONE_WRITES = 0
NETWORK_CALLS = 0
APP798_LIVE_READS = 0
APP798_LIVE_WRITES = 0
APP794_WRITES = 0
SCHEMA_LIVE_WRITES = 0
PROCESS_WRITES = 0
DATA_BACKFILL = 0
DEPLOYMENTS = 0
LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER
```

## D3-IMP-04-R1 execution record

Owner-authorized package:

```text
ACTIVE_WORK_PACKAGE = D3-IMP-04-R1
TITLE = Archive Trust Boundary + Full Evidence Verification Corrective
OWNER_AUTHORIZATION = อนุมัติ D3-IMP-04-R1 Archive Trust Boundary + Full Evidence Verification Corrective แบบ LOCAL-ONLY / ZERO KINTONE / ZERO DEPLOYMENT
STARTING_HEAD = d20cf0de8c9e000e1f29369285abd524d99096a0
STATUS = EXECUTION COMPLETE / AWAITING CONTROL PLANE REVIEW
```

Capabilities implemented in R1:
- Finding 1: Target App ID hard-locked to 798 in `RevisionArchiveKintoneRepository`; caller-selectable `appId` in options strictly forbidden (`ARCHIVE_APP_ID_OVERRIDE_FORBIDDEN`), even if 798 is passed.
- Finding 2: Unforgeable service-issued evidence branding via module-private `WeakSet` (`issuedArchiveEvidence`); fake plain objects, spread clones `{ ...evidence }`, and copied objects fail `validateArchiveEvidence` and `assertArchiveBeforeChangeGate` closed.
- Finding 3: Single authoritative immutable comparator `compareArchiveRecordToExpected` across all 3 paths (`IDEMPOTENT_REPLAY`, `POST_CREATE_READBACK`, `UNCERTAIN_WRITE_RECOVERY`), comparing all immutable facts, snapshot JSON, hash, actor, reason, previous status, superseded revision, source record ID, and read-back timestamp.
- Finding 4A: Strict actor contract accepting only `{ userCode: "<exact Kintone user code>" }`; rejects plain string, `{ code }`, display-name, blank, whitespace, and generic `"SYSTEM"`.
- Finding 4B: Explicit time authority required; fallback to `new Date().toISOString()` removed. Accepts valid ISO-8601 with explicit timezone (Z or offset, canonicalized to UTC ISO) or explicitly injected service clock. Missing explicit time and clock fails closed with `ARCHIVE_TIMESTAMP_REQUIRED`.
- Snapshot core-coherence hardening: verifies `Frozen_Profile_Code`, `K_expected_Snapshot` (1 or 2), non-empty `Workflow_Appraisers` (unique non-blank codes), non-empty `Scorers` (unique non-blank codes), `Scorers.length === K_expected`, and all scorers present in `Workflow_Appraisers`.

Verification evidence:
```text
REVISION_ARCHIVE_SERVICE_TESTS = 44 / 44 PASS
REVISION_ARCHIVE_REPOSITORY_TESTS = 8 / 8 PASS
D3_ARCHIVE_IDEMPOTENCY_TESTS = 14 / 14 PASS
D3_REOPEN_ARCHIVE_INTEGRATION_TESTS = 4 / 4 PASS
COMBINED_D3_IMP_04_R1_TESTS = 70 / 70 PASS (184ms)

D3_IMP_01_TESTS = 40 / 40 PASS (100ms)
D3_IMP_02_TESTS = 68 / 68 PASS (123ms)
D3_IMP_03_TESTS = 86 / 86 PASS (182ms)
COMBINED_ALL_TESTS = 264 / 264 PASS

KINTONE_READS = 0
KINTONE_WRITES = 0
NETWORK_CALLS = 0
APP798_LIVE_READS = 0
APP798_LIVE_WRITES = 0
APP794_WRITES = 0
SCHEMA_LIVE_WRITES = 0
PROCESS_WRITES = 0
DATA_BACKFILL = 0
DEPLOYMENTS = 0
LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER
```

## D3-IMP-04-R2 execution record

```text
ACTIVE_WORK_PACKAGE = D3-IMP-04-R2
TITLE = Exact Event Evidence Binding + Source Identity Hardening
OWNER_AUTHORIZATION = อนุมัติ D3-IMP-04-R2 Exact Event Evidence Binding + Source Identity Hardening แบบ LOCAL-ONLY / ZERO KINTONE / ZERO DEPLOYMENT
STARTING_HEAD = fdd135ee9de67eb6f8ae35cbcf8432c8a486835c
STATUS = EXECUTION COMPLETE / AWAITING CONTROL PLANE REVIEW
```

Capabilities implemented in R2:
- Finding 1: Exact Event Evidence Binding in `assertArchiveBeforeChangeGate`: requires complete `expectedContext` (`sourceRecordKey`, `evaluationStage`, `revisionNumber`, `eventType`, `archiveKey`, `snapshotHash`; plus `supersededByRevision` for reopen and `stableEventId` for route reassignment). Re-derives canonical `Archive_Key` via `buildArchiveKey()` and validates exact equality against expectedContext and evidence. Broad context fails closed with `ARCHIVE_GATE_EXPECTED_CONTEXT_REQUIRED`.
- Finding 2: Source Identity Hardening: `Employee_Code` and `Fiscal_Year` must be non-empty exact strings without leading/trailing whitespace, matching snapshot exactly. `Source_Record_ID` is validated for strict positive integer (Case A: matching request and snapshot, Case B: valid snapshot ID when request omitted, Case C: both omitted permitted; rejects 0, negative, non-integer, non-numeric, never produces NaN).
- App 798 Post-Construction Hard Lock: Repository defines `appId` getter and ineffective setter; operations directly target `REVISION_ARCHIVE_APP_ID` (798) so caller assignments (e.g. `repo.appId = 799`) cannot redirect operations.
- Evidence preserves source identity: `sourceRecordId`, `employeeCode`, `fiscalYear` preserved in verified evidence and validated by mutation gate when supplied.

Verification evidence:
```text
REVISION_ARCHIVE_SERVICE_TESTS = 76 / 76 PASS
REVISION_ARCHIVE_REPOSITORY_TESTS = 9 / 9 PASS
D3_ARCHIVE_IDEMPOTENCY_TESTS = 14 / 14 PASS
D3_REOPEN_ARCHIVE_INTEGRATION_TESTS = 4 / 4 PASS
COMBINED_D3_IMP_04_R2_TESTS = 103 / 103 PASS (178ms)

D3_SNAPSHOT_SERIALIZER_TESTS = 7 / 7 PASS (94ms)
D3_IMP_01_TESTS = 40 / 40 PASS (134ms)
D3_IMP_02_TESTS = 68 / 68 PASS (140ms)
D3_IMP_03_TESTS = 86 / 86 PASS (225ms)
COMBINED_ALL_TESTS = 297 / 297 PASS

KINTONE_READS = 0
KINTONE_WRITES = 0
NETWORK_CALLS = 0
APP798_LIVE_READS = 0
APP798_LIVE_WRITES = 0
APP794_WRITES = 0
SCHEMA_LIVE_WRITES = 0
PROCESS_WRITES = 0
DATA_BACKFILL = 0
DEPLOYMENTS = 0
LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER
```

Independent Control Plane verdict:

```text
D3-IMP-04-R2 = PASS / CLOSED
D3-IMP-04-R1 = PASS / SUPERSEDED BY ACCEPTED R2 CORRECTIVE
D3-IMP-04 = PASS / CLOSED
CODE_CORRECTIVE_REQUIRED = NO
REIMPLEMENTATION_REQUIRED = NO
SCOPE_LEAK = NONE FOUND
FINAL_REVIEWED_IMPLEMENTATION_HEAD = 077acd29534d28523b349aee7edc4d4a0148122a
FINAL_REVIEWED_EVIDENCE_HEAD = d803ae60b42d97cde070d4efef41d5a2c8f836af
LIVE_BUSINESS_DATE_PROVIDER = UNRESOLVED / DEPLOYMENT BLOCKER
```

No later D3 package is authorized by this closure.
