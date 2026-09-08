# D3-WP001-R4-R1: Route Snapshot Authority & Archive Event Model Corrective

**Date:** 2026-09-09 ICT  
**Work Package:** `D3-WP001-R4-R1`  
**Title:** Route Snapshot Authority & Archive Event Model Corrective  
**Type:** `DESIGN / EVIDENCE-ONLY`  
**Owner Authorization:** `APPROVED` — "อนุมัติ D3-WP001-R4-R1 Route Snapshot Authority & Archive Event Model Corrective แบบ DESIGN / EVIDENCE-ONLY ตามขอบเขตที่เสนอ"  
**Branch:** `ai/antigravity-wp002c`  
**Repository:** `rebootob/MBO2026`  
**Starting HEAD:** `19fd142c8d960e67940d39c88250cc8b798fbd9b`  
**Parent:** `D3-WP001-R4 = PARTIAL PASS / SNAPSHOT AUTHORITY + ARCHIVE EVENT MODEL CORRECTIVE REQUIRED`  
**Execution Boundary:** documentation/design evidence only; zero source/test/config/schema/deploy/Kintone execution

---

## 1. Purpose

Close the three material design findings raised by the independent Control Plane review of `D3-WP001-R4`:

1. App794 must preserve `Routing_Key` natively as part of the bound stage provenance required by locked D3-006.
2. App798 needs an explicit event model that distinguishes stage completion, revision creation, and authorized route-change snapshots without confusing intentional event history with accidental duplicate records.
3. The older stage-specific six-slot App794 persistence model must be reconciled with the accepted D3 V1 topology and the Hybrid App794/App798 persistence direction.

This corrective does **not** authorize implementation.

---

## 2. Accepted Authority Preserved

This corrective does not reopen the accepted D3 routing decisions:

```text
DECISION_D3_001 = VARIABLE_1_TO_4_SEQUENTIAL_APPRAISERS_ON_EXISTING_TOPOLOGY
DECISION_D3_002 = SELF_APPRAISER_ELISION_WITH_FAIL_CLOSED_IF_NO_APPRAISER_REMAINS
OWNER_DEC_D3_003 = HR_CONFIGURABLE_SCORING_APPRAISERS_WITHIN_WORKFLOW_ROUTE_USING_FROZEN_PROFILE_K_EXPECTED
OWNER_DEC_D3_005 = SINGLE_EXACT_USER_PER_SEQUENTIAL_SLOT_ALL_ONLY_FOR_D3_V1
OWNER_DEC_D3_006 = MODEL_A_VERSIONED_ROWS_IN_APP795
OWNER_DEC_D3_007 = DGM_K1_PRESIDENT_DIRECT_M1_ONLY
```

Critical invariants remain:

```text
ROUTE_VERSION_HAS_NO_EFFECT_BEFORE_EFFECTIVE_FROM = YES
IN_FLIGHT_STAGE_DOES_NOT_SILENTLY_RERESOLVE = YES
SCORER_GUESSING = FORBIDDEN
K_EXPECTED_AUTO_REDUCTION = FORBIDDEN
WEIGHT_REDISTRIBUTION = FORBIDDEN
D3_IMPLEMENTATION_AUTHORIZED = NO
```

---

## 3. Repository Evidence Reconciled

### 3.1 D3-006 provenance requirement

Locked D3-006 requires every evaluation-stage route snapshot on App794 to preserve:

- `Routing_Key`
- `Version_Key`
- effective route pattern/topology
- resolved appraiser identities
- resolved scorer identities and weights
- frozen Evaluation Profile / `K_expected` context

Therefore the parent R4 statement that `Routing_Key` could remain App798-only is too weak for the accepted App794 stage-snapshot provenance contract.

### 3.2 Current App798 schema capability

Canonical `revisionArchiveFields` already contains:

- unique required `Archive_Key`
- `Evaluation_Stage`
- required `Revision_Number`
- optional `Superseded_By_Revision`
- required `Event_Type`
- required `Reason`
- required `Snapshot_JSON`
- required `Snapshot_Hash`
- required `Archived_By`
- required `Archived_At`

`Event_Type` is a `SINGLE_LINE_TEXT`, not a fixed dropdown. Therefore D3 V1 can define additional event values without adding a new App798 physical field merely for event taxonomy.

### 3.3 Existing revision architecture

The accepted revision model preserves the current working record in App794 and serializes immutable historical revisions into the Revision Archive when HR performs a controlled reopen.

That behavior remains valid. This corrective expands the archive into an **event-scoped immutable snapshot ledger** so stage-completion route evidence can also be preserved before current App794 route fields are reused for the next stage.

### 3.4 Older route snapshot design

The 2026-08-24 `ROUTING_SNAPSHOT_DESIGN.md` describes three separate stage-native matrices with six generic slots plus HR slot per stage.

That physical model predates the later D3 decisions that lock D3 V1 to 1..4 exact sequential users, `ALL` only, and the existing compatibility topology family. Its historical business intent remains useful, but its physical six-slot-per-stage storage model conflicts with the current D3 V1 direction and is corrected in Section 9.

---

## 4. Corrected App794 Native Provenance Contract

### 4.1 Five mandatory logical provenance fields

The D3 V1 Hybrid Model requires the following five logical App794 metadata fields:

| Field | Type | Authority |
|---|---|---|
| `Frozen_Profile_Code` | `SINGLE_LINE_TEXT` | Frozen annual Evaluation Profile |
| `K_expected_Snapshot` | `NUMBER` | Frozen required scorer count (`1` or `2`) |
| `Effective_Routing_Key` | `SINGLE_LINE_TEXT` | Exact App795 business routing key selected at the stage resolution point |
| `Effective_Route_Version_Key` | `SINGLE_LINE_TEXT` | Exact immutable App795 route-version identity selected at the stage resolution point |
| `Effective_Scorer_Slots_Snapshot` | `SINGLE_LINE_TEXT` | Canonical ordered scorer positions in the effective post-self-elision route |

These are logical target fields only. No Kintone field is created by this work package.

### 4.2 `Effective_Routing_Key` is mandatory, not optional

Corrected rule:

```text
APP794_EFFECTIVE_ROUTING_KEY_REQUIRED = YES
```

`Effective_Routing_Key` must be persisted from the exact App795 row selected by the effective-date resolver. Runtime code must not rely on parsing `Version_Key` to recover the business routing key and must not re-query the current App795 master to reconstruct it later.

Required consistency invariant:

```text
App794.Effective_Routing_Key
== App798.Snapshot_JSON.route.routing_key
== Routing_Key of the App795 row selected at the original resolution point
```

The App795 master may later change; the bound App794 value does not silently change with it.

### 4.3 Reused App794 route fields

Continue to reuse the current D3 V1 route snapshot fields:

```text
Routing_Topology
Requester_User
Manager_Level1_Approvers
Manager_Level1_Approval_Rule
Manager_Level2_Approvers
Manager_Level2_Approval_Rule
GM_Level1_Approvers
GM_Level1_Approval_Rule
GM_Level2_Approvers
GM_Level2_Approval_Rule
```

Under `OWNER_DEC_D3_005`, each active sequential slot resolves to exactly one user and uses `ALL`.

The compatibility field names do not redefine business order. The effective post-self-elision route remains the ordered D3 route snapshot.

### 4.4 Corrected fail-closed completeness

A D3-native fresh stage binding is invalid if any of these facts is unavailable or ambiguous:

```text
Frozen_Profile_Code missing
K_expected_Snapshot invalid
Effective_Routing_Key missing
Effective_Route_Version_Key missing
Routing_Topology invalid
route has zero surviving appraisers
any active route slot resolves to != exactly 1 user
Effective_Scorer_Slots_Snapshot missing or malformed
scorer slot count != K_expected
scorer slot references a non-surviving route position
duplicate scorer identity when K_expected = 2
self scorer remains after self-elision
```

No fallback to current master data is permitted to repair a missing bound snapshot silently.

---

## 5. App798 Event-Scoped Immutable Snapshot Model

App798 remains the immutable historical evidence authority, but D3 V1 defines event semantics explicitly.

### 5.1 Event taxonomy

The minimum D3 V1 event types are:

| `Event_Type` | Trigger | Snapshot meaning | `Superseded_By_Revision` |
|---|---|---|---|
| `STAGE_COMPLETION_SNAPSHOT` | Accepted completion boundary of Objective / Mid-Year / Final | Final accepted state of this stage/revision before App794 route snapshot may later be reused | blank |
| `EVALUATION_REVISION_CREATED` | Controlled reopen that creates a new revision | Complete immutable pre-reopen state of the old revision | new revision number |
| `ROUTE_REASSIGNMENT_PRECHANGE` | Explicit authorized in-flight reassignment / controlled route refresh | Complete route/scoring state immediately before the authorized route change | blank |

No event is created merely because the calendar crosses an App795 `Effective_From` date.

```text
DATE_BOUNDARY_ARCHIVE_EVENT = NO
DATE_BOUNDARY_KINTONE_WRITE = NO
```

### 5.2 Stage completion snapshot

When a stage reaches its accepted completed boundary:

1. construct the complete immutable stage/revision snapshot;
2. persist an App798 row with `Event_Type = STAGE_COMPLETION_SNAPSHOT`;
3. verify the archive operation succeeded or is an exact idempotent replay;
4. only then may App794 route/scorer snapshot fields later be reused for a fresh next-stage resolution.

Safety invariant:

```text
APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS = FORBIDDEN
```

This does not require the system to duplicate the App794 business record. App794 remains one record per employee/fiscal year.

### 5.3 Controlled reopen snapshot

When HR performs a controlled reopen that increments revision:

1. preserve the old revision as a full App798 snapshot;
2. set `Event_Type = EVALUATION_REVISION_CREATED`;
3. set `Revision_Number` to the archived old revision;
4. set `Superseded_By_Revision` to the new revision number;
5. preserve the human business reason and exact executing HR identity;
6. do not silently resolve a new route merely because current App795 differs.

The original controlled-reopen architecture therefore remains valid.

### 5.4 Explicit route reassignment snapshot

Before an explicitly authorized in-flight route/scorer reassignment:

1. persist `ROUTE_REASSIGNMENT_PRECHANGE` containing the complete current pre-change route/scoring snapshot;
2. require a business reason;
3. preserve exact actor identity;
4. only after archive success may the current App794 bound route be changed;
5. the new App794 state becomes the authoritative current-stage state.

Master route publication by itself never triggers this event.

---

## 6. Archive Identity & Idempotency Contract

### 6.1 `Archive_Key` is event identity

`Archive_Key` is the unique idempotency identity of an App798 event row, not merely the identity of an MBO revision.

Canonical D3 V1 patterns:

```text
STAGE COMPLETION
<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|STAGE_COMPLETION

REVISION CREATED
<Source_Record_Key>|<Evaluation_Stage>|R<OldRevision>|EVALUATION_REVISION_CREATED|TO_R<NewRevision>

ROUTE REASSIGNMENT / REFRESH
<Source_Record_Key>|<Evaluation_Stage>|R<Revision_Number>|ROUTE_REASSIGNMENT_PRECHANGE|<Stable_Event_ID>
```

These are logical key contracts. Exact string normalization/escaping mechanics are implementation details for a later authorized package.

### 6.2 Stable event identity

For deterministic events:

- stage completion has exactly one canonical event identity per `Source_Record_Key + Stage + Revision`;
- revision creation has exactly one canonical event identity per `Source_Record_Key + Stage + OldRevision + NewRevision`.

For a route reassignment, multiple legitimate events may exist inside the same stage/revision. The authorized route-change operation therefore receives one stable opaque `Stable_Event_ID` that is generated once and reused across retries.

Timestamp-only retry keys are forbidden.

### 6.3 Retry behavior

If a write is retried using an `Archive_Key` that already exists:

1. read the existing archive row;
2. compare the existing `Snapshot_Hash` with the expected deterministic hash;
3. if hashes match and core event identity fields match, treat the operation as **IDEMPOTENT SUCCESS**;
4. if hashes or event identity facts conflict, fail closed.

Target error:

```text
ARCHIVE_IDEMPOTENCY_CONFLICT
```

Forbidden behavior:

```text
same logical event + new timestamp-derived Archive_Key
same logical event + duplicate App798 row
same Archive_Key + mismatched snapshot accepted silently
```

---

## 7. `Archived_By`, `Reason`, and Event Actor Provenance

### 7.1 Exact user identity

Current App798 `Archived_By` is a required `USER_SELECT`. Therefore archive actor provenance must be an exact Kintone user identity.

Rules:

- direct human stage completion: use the exact user who caused the accepted transition boundary;
- controlled reopen: use the exact executing HR administrator;
- service-mediated archive write: carry the exact originating action actor when the event is user-caused, or use an explicitly configured Kintone service-account user identity if the operation is truly service-owned;
- display name alone is not sufficient identity evidence.

Forbidden:

```text
Archived_By = blank
Archived_By = guessed user
Archived_By = free-text "SYSTEM"
Archived_By = requester merely because actor could not be resolved
```

If exact actor identity cannot be resolved, later implementation must fail closed with:

```text
ARCHIVE_ACTOR_NOT_RESOLVED
```

### 7.2 Required reason semantics

Because App798 `Reason` is required:

- `STAGE_COMPLETION_SNAPSHOT`: canonical system reason such as `STAGE_COMPLETION_SNAPSHOT:<STAGE>` is acceptable because the business cause is deterministic;
- `EVALUATION_REVISION_CREATED`: preserve the actual HR-approved reopen business reason; a generic placeholder is not sufficient;
- `ROUTE_REASSIGNMENT_PRECHANGE`: preserve the actual HR-approved reassignment/refresh business reason.

---

## 8. Intentional Event History vs Duplicate History

Multiple App798 rows may legitimately reference the same App794 stage/revision **only when they represent different business event identities**.

Example:

```text
Rev 1 completes Objective
-> STAGE_COMPLETION_SNAPSHOT

Later HR reopens Objective Rev 1 -> Rev 2
-> EVALUATION_REVISION_CREATED
```

These are two distinct historical facts:

- the first proves what was accepted when the stage completed;
- the second proves which immutable revision was superseded, when, why, and by whom.

They are not accidental duplicates because they have different `Event_Type`, `Archive_Key`, actor/reason/timestamp context, and business meaning.

Exact replay of the same event identity is not allowed to create another row; Section 6 idempotency rules apply.

---

## 9. Reconciliation of the Older App794 Stage-Specific Snapshot Model

### 9.1 Superseded physical model for D3 V1

For D3 V1, the following physical persistence concepts in `project-docs/architecture-redesign/ROUTING_SNAPSHOT_DESIGN.md` are superseded by R4 + this corrective:

```text
separate Objective six-slot native route matrix
separate Mid-Year six-slot native route matrix
separate Final six-slot native route matrix
six generic sequential slots per stage
ANY-capable per-stage rule matrix as a D3 V1 requirement
```

D3 V1 instead uses:

```text
1..4 exact sequential users
ALL only
existing compatibility route fields for the currently bound stage
5 native provenance metadata fields
App798 immutable event-scoped full historical snapshots
```

This prevents unnecessary App794 schema multiplication while preserving historical reconstruction.

### 9.2 Historical business intent retained

The following principles from the older design remain valid:

- route evidence must survive stage changes;
- completed historical stages must not be silently rewritten;
- in-flight reassignment must be explicit and auditable;
- current/future route master changes must not rewrite historical evidence.

The corrective supersedes the **physical persistence mechanism**, not those business principles.

### 9.3 HR final-check scope

This corrective does not reopen or redesign HR final-check workflow behavior. Any dedicated HR final-check fields or process-state decisions remain governed by their own accepted scope and are not expanded here.

---

## 10. Corrected Parent R4 Contract

The following parent R4 statements are corrected/superseded by this document:

### Parent R4 Section 5.4

Old position:

```text
Effective_Routing_Key optional on App794
```

Corrected position:

```text
Effective_Routing_Key mandatory logical App794 provenance
```

### Parent R4 recommended field count

Old:

```text
APP794_NEW_LOGICAL_FIELDS = 4
```

Corrected:

```text
APP794_NEW_LOGICAL_FIELDS = 5
  Frozen_Profile_Code
  K_expected_Snapshot
  Effective_Routing_Key
  Effective_Route_Version_Key
  Effective_Scorer_Slots_Snapshot
```

### Parent R4 archive timing

The parent requirement to archive a completed stage before route fields are reused remains accepted, now governed by the exact `STAGE_COMPLETION_SNAPSHOT` event and idempotency model in this corrective.

The parent controlled-reopen and reassignment archive requirements also remain accepted, now mapped to explicit event types.

---

## 11. Updated Proposed Owner Decision D3-008

`OWNER_DEC_D3_008` remains **PENDING OWNER DECISION**.

Updated proposed value:

```text
PROPOSED_OWNER_DEC_D3_008 =
HYBRID_APP794_MINIMAL_NATIVE_PLUS_APP798_EVENT_SCOPED_FULL_IMMUTABLE_ROUTE_SNAPSHOT
```

Exact proposed contract:

```text
APP794_NEW_LOGICAL_FIELDS = 5
APP794_EFFECTIVE_ROUTING_KEY_REQUIRED = YES
APP794_BOUND_STAGE_AUTHORITY_AFTER_RESOLUTION = YES
APP795_NEW_RESOLUTION_AUTHORITY = YES
APP798_RUNTIME_ROUTING_AUTHORITY = NO
APP798_NEW_PHYSICAL_FIELDS_FOR_R4_R1 = 0
APP798_EVENT_SCOPED_HISTORY = YES
APP798_STAGE_COMPLETION_SNAPSHOT = YES
APP798_EVALUATION_REVISION_CREATED = YES
APP798_ROUTE_REASSIGNMENT_PRECHANGE = YES
ARCHIVE_KEY_IDEMPOTENT_EVENT_IDENTITY = YES
ARCHIVE_HASH_CONFLICT = FAIL_CLOSED
OLD_STAGE_SPECIFIC_SIX_SLOT_NATIVE_MODEL_D3_V1 = SUPERSEDED
```

This decision remains unapproved until the Owner explicitly locks it after independent review.

---

## 12. Implementation Boundary

This corrective resolves design semantics only.

Not authorized here:

```text
config/schema-spec.js changes
App794 field creation
App795 Model A migration
App798 behavior implementation
source code changes
test changes
build
sandbox/live deployment
Kintone API reads/writes
process transitions
data backfill
```

A later separately authorized implementation-readiness package must define exact source/schema/test allow-lists, migration sequencing, actor resolution, canonical serialization/hash mechanics, dry-run, rollback, and read-back evidence.

---

## 13. Execution Evidence

```text
START_HEAD = 19fd142c8d960e67940d39c88250cc8b798fbd9b
AUTHORIZED_CHANGE_TYPE = DOCUMENTATION / DESIGN EVIDENCE ONLY
NEW_CORRECTIVE_DOCUMENT = project-docs/D3_WP001_R4_R1_ROUTE_SNAPSHOT_AUTHORITY_ARCHIVE_EVENT_MODEL_CORRECTIVE.md

SOURCE_FILES_CHANGED = 0
TEST_FILES_CHANGED = 0
SCRIPT_FILES_CHANGED = 0
CONFIG_FILES_CHANGED = 0
DIST_FILES_CHANGED = 0
PACKAGE_FILES_CHANGED = 0

TEST_EXECUTION_PERFORMED = NO
BUILD_PERFORMED = NO
DEPLOYMENT_PERFORMED = NO
KINTONE_READS = 0
KINTONE_WRITES = 0
PROCESS_TRANSITIONS = 0
```

Status after execution:

```text
D3_WP001_R4_R1 = EXECUTED / AWAITING CONTROL PLANE REVIEW
OWNER_DEC_D3_008 = PENDING OWNER DECISION
D3_IMPLEMENTATION_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
KINTONE_WRITES_AUTHORIZED = NONE
PRODUCTION_READY = NO
```
