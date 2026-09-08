# D3 Decision 006: Effective-Dated Routing Model A

Status: LOCKED / OWNER APPROVED
Date: 2026-09-09
Work Package: D3-DECISION-006-SYNC
Predecessor: D3-DECISION-005-SYNC (PASS / CLOSED)

---

## 1. Owner Decision

- **`OWNER_DEC_D3_006 = LOCKED / OWNER APPROVED`**
- **`VALUE = MODEL_A_VERSIONED_ROWS_IN_APP795`**
- **`ROUTE_VERSION_HAS_NO_EFFECT_BEFORE_EFFECTIVE_FROM = YES`**

The Owner has explicitly approved and locked **Effective-Dated Routing Model A** for Stage D3:
1. Routing records in App 795 are stored as versioned rows.
2. `Routing_Key` is non-unique (business group key).
3. `Version_Key` is strictly unique (unique version identity).
4. Runtime resolution is performed via a read-only date interval resolver.
5. **Critical Effective-Date Constraint:** A future route version MUST NOT participate in or affect routing before its specified `Effective_From` date.

---

## 2. Model A Contract

```text
ROUTING_KEY = NON_UNIQUE BUSINESS KEY
VERSION_KEY = UNIQUE VERSION IDENTITY
VERSION_NUMBER = MONOTONIC PER ROUTING KEY
EFFECTIVE_FROM = REQUIRED (YYYY-MM-DD)
EFFECTIVE_TO = OPTIONAL (YYYY-MM-DD OR BLANK)
RESOLVER = READ_ONLY DATE_INTERVAL_RESOLVER
MANUAL_ACTIVATION_AT_EFFECTIVE_DATE = NOT REQUIRED
TIME_TRIGGERED_WRITE = FORBIDDEN
HISTORICAL_VERSION_RECORDS = PRESERVED
```

Model A achieves full effective-dated routing purely through data-interval querying without requiring external scheduled jobs, webhook mutations, or manual activation actions on the day a new route becomes effective.

---

## 3. Owner Effective-Date Rule

```text
ROUTE_VERSION_HAS_NO_EFFECT_BEFORE_EFFECTIVE_FROM = YES
```

A future route version may:
- Exist as a persisted record in App 795;
- Be reviewed, edited, and approved by HR;
- Have `Version_Status = ACTIVE` (meaning published and eligible for date resolution);
- Specify a future `Effective_From` date.

**However, prior to `Effective_From`, the future version MUST NOT participate as the effective route.**

### Concrete Resolution Example:
- **Version 1 (v1):** `Effective_From = 2026-04-01`, `Effective_To = 2026-09-30`
- **Version 2 (v2):** `Effective_From = 2026-10-01`, `Effective_To = blank`

| Evaluation Date $T$ | Resolved Version | Business Context |
| :--- | :--- | :--- |
| `2026-09-29` | **v1** | v2 exists but is not yet effective |
| `2026-09-30` | **v1** | Final day of v1 interval |
| `2026-10-01` | **v2** | First day of v2 interval |
| `2026-10-02` | **v2** | v2 remains effective |

Even if v2 was created and approved in August, during August and September v2 exists solely as a scheduled future record; it has **zero runtime routing effect** until `2026-10-01`. Early activation or early effect is strictly forbidden.

---

## 4. ACTIVE vs EFFECTIVE Semantics

To eliminate operational ambiguity between publication status and temporal effectiveness:

- **`Version_Status = ACTIVE`** means:
  `PUBLISHED / ELIGIBLE FOR DATE-BASED RESOLUTION`.
  It does **NOT** mean "Effective Immediately".

- **`EFFECTIVE`** is a runtime state evaluated at a specific timestamp $T$:
  Both eligibility and date interval inclusion are required.

### Formal Resolution Predicate:
```text
IS_EFFECTIVE(version, T) =
  version.Version_Status == ACTIVE
  AND version.Effective_From <= T
  AND (
       version.Effective_To is blank
       OR version.Effective_To >= T
  )
```

Therefore:
```text
ACTIVE + Future Effective_From = SCHEDULED / NOT YET EFFECTIVE
```

---

## 5. Exact Date Resolver

At any evaluation resolution timestamp $T$, the routing engine queries App 795 with the following filter:

```text
Routing_Key = target_key
AND Version_Status = "ACTIVE"
AND Effective_From <= T
AND (Effective_To >= T OR Effective_To = "")
```

### Resolution Outcome Governance:
1. **Exactly 1 Record Matched:** **PASS** -> Selected as authoritative runtime route.
2. **0 Records Matched:** **FAIL CLOSED** -> Error: `NO_EFFECTIVE_ROUTE`.
3. **>1 Records Matched:** **FAIL CLOSED** -> Error: `AMBIGUOUS_EFFECTIVE_ROUTE`.

The resolver operates strictly in read-only mode (`GET`). It makes zero mutations to Kintone records.

---

## 6. Future Scheduled Route Behavior

### Zero Date-Boundary Mutation:
When the calendar date crosses midnight into `Effective_From`:
- **NO** Kintone records are modified.
- **NO** status flags are flipped.
- **NO** cron jobs or background schedulers execute.
- **NO** manual HR button clicks are required.

The read-only resolver query alone shifts the resolution from the prior version to the new version seamlessly based on timestamp $T$. Likewise, expiration occurs naturally when $T$ exceeds `Effective_To`. Date passage performs **zero Kintone API writes**.

---

## 7. Interval Integrity

For any given `Routing_Key`, all published/active versions must maintain mathematical interval integrity:

1. **Non-Overlap Invariant:** Active date intervals for the same `Routing_Key` must never overlap.
   - Pre-publication validation: HR UI and backend validation reject any save/publish operation where $[Effective\_From, Effective\_To]$ overlaps with another active version.
   - Runtime safety: If data corruption causes overlapping intervals, the resolver returns >1 matches and fails closed with `AMBIGUOUS_EFFECTIVE_ROUTE`.
2. **Single-Row Validity:** If `Effective_To` is populated, it must satisfy `Effective_To >= Effective_From`.
3. **Gap Handling:** If an intentional gap exists between versions and resolution occurs during that gap, the resolver fails closed with `NO_EFFECTIVE_ROUTE`. The system must never silently fall back to an expired route.

---

## 8. Version Lifecycle

The lifecycle of route versions in App 795 is defined as follows:

| Version_Status | Meaning & Resolution Eligibility |
| :--- | :--- |
| **`DRAFT`** | Work-in-progress by HR. Not eligible for runtime resolution. |
| **`ACTIVE`** | Approved and published. Eligible for date-based interval resolution. |
| **`CANCELLED`** | Abandoned before becoming effective or explicitly revoked. Ineligible. |
| **`SUPERSEDED`** | Historical version retained for audit lineage. Ineligible for runtime queries. |

### Immutability of Expired Versions:
When an active version's `Effective_To` passes, its record is **not** automatically updated to `SUPERSEDED` by a timer. Its expiration is governed purely by the `Effective_To` boundary in the resolver query. Historical version records are permanently preserved. Historical MBO reproduction must use the snapshotted `Version_Key` rather than re-resolving current master routes.

---

## 9. Routing_Key / Version_Key

In the migrated App 795 schema:

- **`Routing_Key` (Single-Line Text):**
  - Unique: **`false`**
  - Represents the business grouping key (e.g., `TMT1`, `ENG_DESIGN|TEAM_A`, `POSITION_DGM`).
  - Multiple version rows share the same `Routing_Key`.

- **`Version_Key` (Single-Line Text):**
  - Unique: **`true`**
  - Represents the immutable version identity.
  - Format: `<Routing_Key>#v<Version_Number>` (e.g., `TMT1#v1`, `TMT1#v2`, `POSITION_DGM#v1`).
  - Identity must never rely solely on date values.

After Model A migration, `Routing_Key` ceases to be the physical unique record key in App 795; `Version_Key` becomes the sole unique identifier.

---

## 10. HR Scheduling UX

The HR Control Center (App 800 / HR Dashboard) must visually categorize routes for HR administrators:

1. **Current Effective Version:** The version actively resolving for today's date.
2. **Future Scheduled Version(s):** Future versions with `Version_Status = ACTIVE` and `Effective_From > Today`.
   - Explicit Status Badge: `Scheduled / Not Yet Effective`.
   - Display: `Effective From: YYYY-MM-DD`.
   - Advisory Notice: *"Route นี้ยังไม่มีผลจนกว่าจะถึงวันที่ Effective From"*
3. **Historical Version(s):** Expired or superseded past versions retained for historical audit.

This allows HR to prepare, review, and lock annual or mid-year routing reassignments weeks in advance without disrupting current active operations.

---

## 11. Stage Snapshot Boundary

A route version becoming effective does **NOT** alter already active or completed MBO evaluation stages:

- **Stage Immutability:** Completed evaluation stages (`OBJECTIVE`, `MID_YEAR`, `FINAL`) are historical business evidence and cannot be rewritten by subsequent route changes.
- **In-Flight Stages:** An MBO record that has already resolved and bound its route snapshot at stage submission remains bound to that snapshot. It does not dynamically shift to a newer version merely because midnight passed.
- **Fresh Resolution Points:** New stage submissions or unstarted evaluations resolve the version effective at their specific submission timestamp.
- **Manual In-Flight Reassignment:** If a pending record must move to a new approver due to personnel departure, HR executes an explicit single/bulk reassignment action with audit reason, separate from master routing publication.

---

## 12. Historical Provenance

Every evaluation stage route snapshot on App 794 must record exact provenance:
- `Routing_Key`
- `Version_Key`
- Effective route pattern / topology (e.g., `M1_G1`, `M1_M2_G1`)
- Resolved appraiser identities (Slots 1..4)
- Resolved scoring appraiser identities and weights
- Frozen Evaluation Profile $K_{\text{expected}}$ context

Exact field naming and storage mechanisms on App 794 / App 798 remain subject to the upcoming snapshot metadata design choice.

---

## 13. Current Schema Gap

The current App 795 live schema does not yet support Model A:
- Current: `Routing_Key` is configured with `unique = true`.
- Current: Missing `Version_Key`, `Version_Number`, `Version_Status`, `Scorer_Priority_Slots`, and `Route_Pattern`.

Therefore:
```text
APP795_SCHEMA_MIGRATION_REQUIRED = YES
```
Target schema migration must relax `Routing_Key` uniqueness to `false`, add the required versioning and scoring fields, and establish `Version_Key` as unique. Schema files (such as `config/schema-spec.js`) are **NOT** modified in this docs-only work package.

---

## 14. Legacy Active Migration Boundary

Current App 795 contains a legacy radio field: `Active` (`Active` / `Inactive`). Model A introduces `Version_Status`.

```text
LEGACY_ACTIVE_FIELD_DUAL_AUTHORITY = NOT ALLOWED
```

Having two concurrent status fields at runtime is strictly prohibited to prevent split-brain routing logic.
**Architectural Plan:**
- `Version_Status` will serve as the sole authoritative lifecycle field.
- Legacy `Active` will be maintained solely for temporary backward compatibility during data migration and deprecated immediately upon cutover.
- No migration or schema changes are executed in this work package.

---

## 15. Migration Safety

When migrating existing 17 standard routing rows in App 795 to Model A:
- **No Hardcoded Assumed Dates:** The date `2026-04-01` used in design discussions is a candidate example only. Real migration dates must be verified against business truth and Owner authorization.
- **Migration Work Package Requirements:**
  1. Read and backup all active App 795 rows.
  2. Generate deterministic `Version_Key` (`<Routing_Key>#v1`) and seed values.
  3. Validate interval integrity (zero overlaps).
  4. Provide a dry-run preview for Owner approval prior to applying updates.

---

## 16. Owner Decision Status

All six primary routing architecture decisions are now locked:

| Decision ID | Scope | Status |
| :--- | :--- | :--- |
| **DECISION_D3_001** | Existing Topology Family (1–4 Appraisers) | **LOCKED / OWNER APPROVED** |
| **DECISION_D3_002** | Automatic Self-Appraiser Elision | **LOCKED / OWNER APPROVED** |
| **OWNER_DEC_D3_003** | HR-Configurable Scoring Appraisers via Profile $K_{\text{expected}}$ | **LOCKED / OWNER APPROVED** |
| **OWNER_DEC_D3_005** | Single Exact User Per Sequential Slot / ALL Only for D3 V1 | **LOCKED / OWNER APPROVED** |
| **OWNER_DEC_D3_006** | Effective-Dated Routing Model A (Versioned Rows in App 795) | **LOCKED / OWNER APPROVED** |
| **OWNER_DEC_D3_007** | DGM Authority ($K=1$, President Only, `M1_ONLY`, 100%) | **LOCKED / OWNER APPROVED** |

```text
ROUTING_ARCHITECTURE_MAJOR_DECISIONS_COMPLETE = YES
```

---

## 17. Remaining Metadata Gate

Although major routing architecture decisions are closed, implementation cannot commence immediately:

- **Remaining Architecture Decision:** `APP794 / APP798 ROUTE-SNAPSHOT METADATA PERSISTENCE`
  - Determining the exact minimal native audit fields required on App 794 versus immutable historical storage in App 798 (`Snapshot_JSON`).
- **Status:**
  ```text
  SNAPSHOT_METADATA_PATH_DECISION = PENDING
  READY_FOR_BOUNDED_IMPLEMENTATION = NO
  ```

---

## 18. Implementation Authorization

```text
D3_IMPLEMENTATION_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
KINTONE_WRITES_AUTHORIZED = NONE
READY_FOR_BOUNDED_IMPLEMENTATION = NO
STATUS = EXECUTED / AWAITING CONTROL PLANE REVIEW
NEXT_PERMITTED_ACTION = CONTROL_PLANE_REVIEW_OF_D3_DECISION_006_SYNC
```

This document represents an evidence-based decision lock and control synchronization only. Stage D3 implementation remains strictly on **HOLD** pending resolution of the snapshot metadata path and separate explicit Owner work package authorization.
