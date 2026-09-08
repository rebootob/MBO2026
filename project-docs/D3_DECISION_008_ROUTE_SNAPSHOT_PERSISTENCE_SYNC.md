# D3 Decision 008 — Route Snapshot Persistence Authority

**Date:** 2026-09-09 ICT  
**Decision:** `OWNER_DEC_D3_008`  
**Status:** `LOCKED / OWNER APPROVED`  
**Branch:** `ai/antigravity-wp002c`  
**Repository:** `rebootob/MBO2026`  
**Starting HEAD:** `58fcb4f5995ece750bbeefe9c0a466bf6c82f3c3`  
**Owner Approval:** `อนุมัติ` — approving the exact `OWNER_DEC_D3_008` contract proposed immediately after independent review of `D3-WP001-R4-R1`.

---

## 1. Locked Owner Decision

```text
OWNER_DEC_D3_008 = LOCKED / OWNER APPROVED
VALUE = HYBRID_APP794_MINIMAL_NATIVE_PLUS_APP798_EVENT_SCOPED_FULL_IMMUTABLE_ROUTE_SNAPSHOT
```

This decision locks the D3 V1 persistence authority established by `D3-WP001-R4` as corrected and independently accepted through `D3-WP001-R4-R1`.

---

## 2. App794 Bound-Stage Authority

App794 remains the current MBO transactional record and the authoritative bound snapshot for the currently active evaluation stage after route resolution.

The target D3 V1 App794 logical provenance contract is exactly five new logical fields:

```text
Frozen_Profile_Code
K_expected_Snapshot
Effective_Routing_Key
Effective_Route_Version_Key
Effective_Scorer_Slots_Snapshot
```

Locked invariants:

```text
APP794_NEW_LOGICAL_FIELDS = 5
APP794_EFFECTIVE_ROUTING_KEY_REQUIRED = YES
APP794_BOUND_STAGE_AUTHORITY_AFTER_RESOLUTION = YES
IN_FLIGHT_STAGE_DOES_NOT_SILENTLY_RERESOLVE = YES
```

Existing D3 V1 route snapshot fields are reused for resolved workflow identities/topology:

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

Under the accepted D3 V1 contract, every active sequential slot resolves to exactly one user and uses `ALL`.

---

## 3. App795 Resolution Authority

App795 remains the routing master and effective-dated source of truth for fresh route resolution points only.

```text
APP795_NEW_RESOLUTION_AUTHORITY = YES
ROUTE_VERSION_HAS_NO_EFFECT_BEFORE_EFFECTIVE_FROM = YES
DATE_BOUNDARY_KINTONE_WRITE = NO
```

A newly effective or newly published App795 version never silently mutates an already-bound App794 stage.

---

## 4. App798 Immutable Historical Authority

App798 is the immutable event-scoped historical snapshot authority.

```text
APP798_RUNTIME_ROUTING_AUTHORITY = NO
APP798_NEW_PHYSICAL_FIELDS_FOR_D3_008 = 0
APP798_EVENT_SCOPED_HISTORY = YES
APP798_FULL_PROVENANCE = Snapshot_JSON + Snapshot_Hash
```

The minimum locked D3 V1 archive event taxonomy is:

```text
STAGE_COMPLETION_SNAPSHOT
EVALUATION_REVISION_CREATED
ROUTE_REASSIGNMENT_PRECHANGE
```

Event semantics:

- `STAGE_COMPLETION_SNAPSHOT`: final accepted stage/revision evidence before App794 route/scorer snapshot fields may later be reused for a fresh next-stage resolution.
- `EVALUATION_REVISION_CREATED`: immutable pre-reopen state of the old revision when a controlled reopen creates a new revision.
- `ROUTE_REASSIGNMENT_PRECHANGE`: immutable current route/scoring state immediately before an explicitly authorized in-flight reassignment or controlled route refresh.

Locked safety invariant:

```text
APP794_ROUTE_SNAPSHOT_REUSE_BEFORE_ARCHIVE_SUCCESS = FORBIDDEN
```

---

## 5. Archive Identity / Idempotency

`Archive_Key` is the unique identity of one logical archive event.

Locked rules:

```text
ARCHIVE_KEY_IDEMPOTENT_EVENT_IDENTITY = YES
TIMESTAMP_ONLY_RETRY_KEYS = FORBIDDEN
SAME_LOGICAL_EVENT_DUPLICATE_ROW = FORBIDDEN
ARCHIVE_HASH_CONFLICT = FAIL_CLOSED
TARGET_CONFLICT_ERROR = ARCHIVE_IDEMPOTENCY_CONFLICT
```

A retry of the same logical event must reuse the same event identity. If the existing row matches the deterministic expected hash and event identity, it is an idempotent success. A conflicting payload under the same identity must fail closed.

---

## 6. Actor / Reason Provenance

App798 `Archived_By` remains exact Kintone user identity authority.

Forbidden:

```text
Archived_By = blank
Archived_By = guessed user
Archived_By = free-text SYSTEM
Archived_By = requester merely because the true actor could not be resolved
```

If the archive actor cannot be resolved exactly, later implementation must fail closed with:

```text
ARCHIVE_ACTOR_NOT_RESOLVED
```

`Reason` semantics remain event-specific: deterministic stage-completion reason is allowed for `STAGE_COMPLETION_SNAPSHOT`; controlled reopen and route reassignment must preserve the actual approved business reason.

---

## 7. Superseded D3 V1 Physical Persistence Model

The older physical persistence model in `project-docs/architecture-redesign/ROUTING_SNAPSHOT_DESIGN.md` is superseded for D3 V1 only where it conflicts with this locked decision.

Superseded for D3 V1:

```text
separate Objective six-slot native route matrix
separate Mid-Year six-slot native route matrix
separate Final six-slot native route matrix
six generic sequential slots per stage
ANY-capable per-stage rule matrix as a D3 V1 requirement
```

Retained business principles:

```text
historical stage evidence must survive stage changes
completed historical evidence must not be silently rewritten
in-flight reassignment must be explicit and auditable
current/future routing-master changes must not rewrite bound or historical evidence
```

---

## 8. Authority Separation After D3-008

```text
App795 = effective-dated routing master for NEW resolution points
App794 = current MBO transaction + currently bound active-stage route/provenance snapshot
App798 = immutable event-scoped historical snapshot ledger
App800 = HR control / administrative UI only
```

No duplicate runtime authority is created by this decision.

---

## 9. Implementation Boundary

This Owner decision locks architecture only. It does not authorize implementation.

```text
D3_IMPLEMENTATION_AUTHORIZED = NO
APP794_FIELD_CREATION_AUTHORIZED = NO
APP795_SCHEMA_MIGRATION_AUTHORIZED = NO
APP798_BEHAVIOR_IMPLEMENTATION_AUTHORIZED = NO
SOURCE_CODE_CHANGES_AUTHORIZED = NO
TEST_CHANGES_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
KINTONE_WRITES_AUTHORIZED = NONE
PRODUCTION_READY = NO
```

A separate Owner-authorized control-document sync should reconcile repository control state to this locked decision before implementation-readiness work begins.

---

## 10. Decision Provenance

```text
D3-WP001-R4 = PASS / CLOSED VIA R4-R1
D3-WP001-R4-R1 = PASS / CLOSED
OWNER_DEC_D3_008 = LOCKED / OWNER APPROVED
```

This file records the Owner decision only. It does not silently update the broader control documents and does not start the next work package.
