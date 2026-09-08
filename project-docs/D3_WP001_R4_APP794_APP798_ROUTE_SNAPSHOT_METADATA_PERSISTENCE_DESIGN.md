# D3-WP001-R4: App794 / App798 Route-Snapshot Metadata Persistence Design

**Date:** 2026-09-09 ICT  
**Work Package:** `D3-WP001-R4`  
**Title:** App794 / App798 Route-Snapshot Metadata Persistence Design  
**Type:** `DESIGN / EVIDENCE-ONLY`  
**Owner Authorization:** `APPROVED` — "อนุมัติ D3-WP001-R4 APP794 / APP798 Route-Snapshot Metadata Persistence Design แบบ DESIGN / EVIDENCE-ONLY ตามขอบเขตที่เสนอ"  
**Branch:** `ai/antigravity-wp002c`  
**Repository:** `rebootob/MBO2026`  
**Starting HEAD:** `30d2a36b8f885a82da1a170493c1540e15485ee2`  
**Predecessor:** `D3-DECISION-006-SYNC = PASS / CLOSED` by newer independent Control Plane verdict  
**Execution Boundary:** documentation/design evidence only; zero source/test/config/schema/deploy/Kintone execution

---

## 1. Purpose

Close the remaining D3 routing-architecture gate:

```text
APP794 / APP798 ROUTE-SNAPSHOT METADATA PERSISTENCE
```

The design must preserve deterministic reconstruction of the exact route and scorer context used by an MBO evaluation stage while avoiding duplicate runtime authorities.

At minimum, historical reconstruction must preserve:

- `Routing_Key`
- `Version_Key`
- effective route pattern / topology
- resolved workflow appraiser identities
- resolved scorer identities and weights
- frozen Evaluation Profile context
- frozen `K_expected`

This work package does **not** implement fields, schema migration, routing logic, archive logic, tests, deployment, or Kintone writes.

---

## 2. Accepted Upstream Authority Preserved

This design does not reopen accepted D3 architecture decisions:

```text
DECISION_D3_001 = VARIABLE_1_TO_4_SEQUENTIAL_APPRAISERS_ON_EXISTING_TOPOLOGY
DECISION_D3_002 = SELF_APPRAISER_ELISION_WITH_FAIL_CLOSED_IF_NO_APPRAISER_REMAINS
OWNER_DEC_D3_003 = HR_CONFIGURABLE_SCORING_APPRAISERS_WITHIN_WORKFLOW_ROUTE_USING_FROZEN_PROFILE_K_EXPECTED
OWNER_DEC_D3_005 = SINGLE_EXACT_USER_PER_SEQUENTIAL_SLOT_ALL_ONLY_FOR_D3_V1
OWNER_DEC_D3_006 = MODEL_A_VERSIONED_ROWS_IN_APP795
OWNER_DEC_D3_007 = DGM_K1_PRESIDENT_DIRECT_M1_ONLY
```

Critical D3-006 invariant remains unchanged:

```text
ROUTE_VERSION_HAS_NO_EFFECT_BEFORE_EFFECTIVE_FROM = YES
```

A stage that has already resolved and bound a route snapshot must not dynamically change because App795 later changes or a future version becomes effective.

---

## 3. Repository Evidence — Current Physical State

### 3.1 App794 current route snapshot fields

Canonical `config/schema-spec.js` currently defines App794 `mboFields` with a target sequential routing snapshot containing:

- `Requester_User`
- `Manager_Level1_Approvers`
- `Manager_Level1_Approval_Rule`
- `Manager_Level2_Approvers`
- `Manager_Level2_Approval_Rule`
- `GM_Level1_Approvers`
- `GM_Level1_Approval_Rule`
- `GM_Level2_Approvers`
- `GM_Level2_Approval_Rule`
- `Has_Manager_Level2`
- `Has_GM_Level2`
- `Routing_Topology`

The same schema also retains legacy/deprecated routing snapshot fields:

- `First_Manager_User`
- `Manager_User`
- `GM_User`

Current App794 schema does **not** define the three previously identified minimum provenance fields:

- `Frozen_Profile_Code`
- `K_expected_Snapshot`
- `Effective_Route_Version_Key`

It also does not currently expose a dedicated frozen scorer-plan field.

### 3.2 App798 is the Revision Archive authority

Accepted D3 corrective evidence establishes:

```text
REVISION_ARCHIVE_APP = 798
HR_CONTROL_CENTER_APP = 800
```

App798, not App800, is the immutable revision archive.

Canonical `revisionArchiveFields` in `config/schema-spec.js` contains exactly 15 business fields, including:

- `Archive_Key`
- `Source_Record_ID`
- `Source_Record_Key`
- `Fiscal_Year`
- `Employee_Code`
- `Evaluation_Stage`
- `Revision_Number`
- `Previous_Status`
- `Superseded_By_Revision`
- `Event_Type`
- `Reason`
- `Snapshot_JSON`
- `Snapshot_Hash`
- `Archived_By`
- `Archived_At`

Therefore App798 already has a canonical container for complete immutable snapshot payloads and their integrity hash. No new App798 physical field is required merely to hold route/scoring provenance.

### 3.3 Existing accepted schema-gap finding

Prior D3 design identified a minimal App794 audit gap of three native fields:

```text
Frozen_Profile_Code
K_expected_Snapshot
Effective_Route_Version_Key
```

The same prior work allowed a strict zero-App794-schema alternative by putting all metadata into App798 `Snapshot_JSON`, but left the choice unresolved.

---

## 4. Design Options Evaluated

### Option A — App798-only snapshot

Store all new route/scoring provenance only in App798 `Snapshot_JSON`; add zero App794 fields.

**Advantages**
- zero App794 schema growth;
- strongest physical separation of audit data;
- full immutable history can be preserved.

**Material disadvantages**
- active/in-flight App794 records lack a simple native pointer to the exact App795 version used;
- HR cannot directly filter current App794 records by frozen profile / K / route version without parsing or joining archive data;
- runtime code risks needing to re-read mutable App795 to recover information that should have been frozen;
- App798 is a historical archive and should not become a runtime dependency for ordinary active-stage execution.

**Verdict:** `NOT RECOMMENDED` for D3 V1.

---

### Option B — Full provenance duplicated natively on App794

Add native App794 fields for every route and scorer fact, including routing key, version, route pattern, all resolved appraisers, all resolved scorers, scorer weights, effective interval, profile, K, and other provenance.

**Advantages**
- maximum queryability from App794;
- little or no JSON parsing required for current-record reporting.

**Material disadvantages**
- duplicates data already held in App794 route slots and App798 archive;
- creates a large schema surface and synchronization burden;
- increases risk of multiple fields disagreeing about the same authority;
- unnecessary for current D3 V1 requirements.

**Verdict:** `NOT RECOMMENDED` because it violates the minimum-change objective.

---

### Option C — Hybrid minimal-native + full immutable archive

App794 stores only the minimum metadata needed for active-stage determinism and native reporting. App798 stores the complete immutable stage/revision snapshot.

**Advantages**
- active App794 record remains self-contained enough for deterministic execution;
- unique route-version provenance is queryable without re-resolving App795;
- existing App794 route slots continue to carry resolved workflow identities;
- App798 remains the full historical/audit authority;
- smallest practical schema change while avoiding App798 as a runtime master.

**Verdict:** `RECOMMENDED`.

---

## 5. Recommended App794 Native Contract

### 5.1 Reuse existing App794 fields

Do **not** duplicate data that App794 already snapshots.

Reuse:

```text
Routing_Topology
Requester_User
Manager_Level1_Approvers
Manager_Level2_Approvers
GM_Level1_Approvers
GM_Level2_Approvers
corresponding approval-rule fields
```

For D3 V1, the four business route slots remain ordinal in user-facing semantics even though current physical field names retain Manager/GM compatibility naming.

The resolved App794 route snapshot must represent the **effective post-self-elision route** bound to the current stage, preserving sequential order.

### 5.2 Add three mandatory logical provenance fields

Recommended new logical fields:

| Field | Type | Purpose |
|---|---|---|
| `Frozen_Profile_Code` | `SINGLE_LINE_TEXT` | Frozen annual Evaluation Profile used by this MBO record |
| `K_expected_Snapshot` | `NUMBER` | Frozen scorer count required by that profile (`1` or `2`) |
| `Effective_Route_Version_Key` | `SINGLE_LINE_TEXT` | Exact immutable App795 route-version identity selected for the current stage |

These fields are **logically mandatory for D3-native execution**. Physical Kintone `required=true` migration sequencing is deliberately not decided here because existing records may require controlled backfill before a hard required constraint can be enabled.

### 5.3 Add one minimal scorer-binding field

A fourth native logical field is recommended:

```text
Effective_Scorer_Slots_Snapshot
```

Recommended representation for D3 V1:

```text
SINGLE_LINE_TEXT containing a canonical comma-separated ordered list
Examples:
  "1"
  "1,2"
  "1,3"
  "2,3"
```

Semantics:

- values refer to **ordinal positions in the effective post-self-elision App794 route snapshot**;
- each referenced position resolves to exactly one user because `OWNER_DEC_D3_005` requires exactly one user per sequential slot;
- count of distinct scorer slots must equal frozen `K_expected`;
- identities are therefore deterministic without adding two more USER_SELECT fields;
- no title/rank inference is allowed;
- no implicit `[1,2]` default is allowed.

This field is preferable to persisting original App795 `Scorer_Priority_Slots` unchanged because self-elision may remove/compact configured slots. App794 must persist the **resolved effective scorer positions**, not merely the pre-elision configuration intent.

### 5.4 Why `Routing_Key` is not a required new App794 field

`Effective_Route_Version_Key` is the unique version identity required for active-stage provenance. `Routing_Key` remains fully preserved in the immutable App798 snapshot.

Adding `Effective_Routing_Key` to App794 is optional for future reporting convenience but is **not required for D3 V1 runtime correctness** and therefore is excluded from the minimal native contract.

### 5.5 Why no new native route-pattern field is required

The current App794 `Routing_Topology` field already carries the effective route pattern/topology family (`M1_ONLY`, `M1_G1`, `M1_M2_G1`, `M1_G1_G2`, `M1_M2_G1_G2`).

A duplicate `Effective_Route_Pattern` field would create unnecessary dual representation in D3 V1 and is therefore not recommended.

---

## 6. Recommended App798 `Snapshot_JSON` Contract

App798 is the complete immutable historical evidence store. Every archived stage/revision snapshot should include a versioned JSON payload with, at minimum, the following logical structure:

```json
{
  "snapshot_schema_version": "D3_ROUTE_SNAPSHOT_V1",
  "source": {
    "app_id": 794,
    "record_id": "<kintone-record-id>",
    "record_key": "<Record_Key>",
    "fiscal_year": "<Fiscal_Year>",
    "employee_code": "<Employee_Code>"
  },
  "stage": {
    "evaluation_stage": "OBJECTIVE|MIDYEAR|FINAL",
    "revision_number": 1,
    "captured_at": "<ISO-8601 timestamp>"
  },
  "profile": {
    "frozen_profile_code": "<Profile_Code>",
    "k_expected": 1
  },
  "route": {
    "routing_key": "<Routing_Key>",
    "version_key": "<Version_Key>",
    "version_number": 1,
    "effective_from": "YYYY-MM-DD",
    "effective_to": null,
    "resolved_at": "<ISO-8601 timestamp>",
    "topology": "M1_G1",
    "appraisers": [
      {
        "ordinal": 1,
        "user_code": "<exact Kintone user code>",
        "approval_rule": "ALL"
      }
    ]
  },
  "scoring": {
    "effective_scorer_slots": [1],
    "scorers": [
      {
        "layer": 1,
        "route_ordinal": 1,
        "user_code": "<exact Kintone user code>",
        "weight_percent": 100
      }
    ]
  },
  "self_elision": {
    "applied": false
  }
}
```

The shown JSON is a **logical target contract**, not an implemented payload.

### Identity rule

Exact Kintone `user_code` is the canonical identity evidence. Display names may be added as non-authoritative readability metadata but must never replace exact user codes as the identity authority.

### Required reconstruction invariant

Given only the App798 archive record, an auditor must be able to reconstruct without querying current App795:

```text
which profile was frozen
how many scorers were required
which route version was used
which effective route topology was bound
who the workflow appraisers were and in what order
who the scorers were
what scorer weights applied
whether self-elision had altered the route
```

---

## 7. Snapshot Timing & Stage Lifecycle

### 7.1 Annual profile freeze

`Frozen_Profile_Code` and `K_expected_Snapshot` are annual evaluation-profile authority.

They are populated when the MBO record receives its authoritative annual profile for the fiscal year and must not silently change on mid-year promotion or later master changes.

### 7.2 Fresh stage route resolution

For each **fresh evaluation stage start/submission**:

1. read the already frozen annual profile and `K_expected`;
2. resolve the App795 route version effective at the stage resolution timestamp;
3. build canonical business route;
4. apply self-elision;
5. validate surviving workflow route;
6. resolve the explicit HR scorer plan;
7. validate scorer count against frozen `K_expected`;
8. persist the effective route snapshot on App794;
9. persist `Effective_Route_Version_Key` and `Effective_Scorer_Slots_Snapshot`;
10. proceed only if all invariants pass.

### 7.3 In-flight immutability

After a stage is submitted and its route snapshot is bound:

```text
CURRENT_APP795_CHANGE != AUTOMATIC_APP794_ROUTE_CHANGE
```

The current stage remains bound to its App794 snapshot even if:

- another App795 version is published;
- a future version crosses its `Effective_From` date;
- the master route is edited for future work.

### 7.4 Stage completion archive

When a stage reaches its accepted completed boundary, create an App798 immutable snapshot for that stage/revision **before App794 route fields may later be reused/overwritten for the next stage**.

This ensures previous-stage route provenance is not lost when the same App794 MBO record advances through Objective -> Mid-Year -> Final.

### 7.5 Reopen / same-stage revision

Reopening a completed stage uses the same App794 record and increments revision according to existing revision governance.

Default rule:

```text
REOPEN_DOES_NOT_AUTOMATICALLY_RERESOLVE_CURRENT_APP795
```

A reopen/resubmit of the same historical stage retains its bound route unless HR performs a separately authorized route refresh/reassignment action.

Before superseding a prior stage revision, archive the prior state to App798.

### 7.6 Explicit in-flight reassignment / route refresh

Personnel-change reassignment is separate from master route publication.

If an explicit HR reassignment is authorized:

1. archive the pre-change App794 snapshot to App798;
2. require business reason and actor provenance;
3. apply only the authorized current-record route/scorer change;
4. persist the new current App794 snapshot;
5. preserve both states historically.

No master route change alone may mutate an in-flight App794 stage.

---

## 8. Runtime Authority Separation

The target authority model is:

```text
App795 = routing master / effective-date source for NEW resolution points
App794 = current MBO transactional record + currently bound active-stage snapshot
App798 = immutable historical stage/revision evidence
App800 = HR control/administrative UI only
```

Strict prohibitions:

- App798 must not become the normal runtime routing master.
- App794 must not re-resolve current App795 after a stage has been bound merely because time passed.
- App795 historical row changes must not rewrite App798 history.
- App800 must not be described or used as the Revision Archive.
- `Version_Status` / effective-date master logic and App794 bound-snapshot logic must remain separate concepts.

---

## 9. Integrity & Fail-Closed Rules

### 9.1 Snapshot completeness

D3-native stage submission must fail closed if any required snapshot fact is unavailable or ambiguous:

```text
Frozen_Profile_Code missing
K_expected_Snapshot invalid
Effective_Route_Version_Key missing
Routing_Topology invalid
route has zero surviving appraisers
any effective route slot resolves to != exactly 1 user
Effective_Scorer_Slots_Snapshot missing/malformed
scorer slot count != K_expected
scorer slot references non-surviving route position
duplicate scorer identity when K_expected = 2
self scorer remains after self-elision
```

No scorer guessing, K reduction, or weight redistribution is permitted.

### 9.2 Archive integrity

`Snapshot_JSON` and `Snapshot_Hash` must represent the same canonical snapshot payload.

Target implementation must use deterministic canonical serialization before hashing so semantically identical payloads do not hash differently merely because object-key order or formatting changed.

The exact canonicalization/hash implementation is intentionally deferred to the later implementation work package; no code is changed here.

### 9.3 Historical reconstruction must not depend on mutable masters

Historical audit/reproduction uses the App798 snapshot evidence that was captured at the event/revision boundary.

It must not reconstruct old workflow/scoring facts by querying the **current** App795 route or current profile master and pretending they were historical facts.

---

## 10. Migration / Backfill Boundary

This work package does not decide or execute a migration.

A later implementation/migration package must separately address:

- existing App794 records that predate the new native provenance fields;
- whether historical stage records have enough trustworthy evidence for deterministic backfill;
- exact physical `required` constraints during schema migration;
- App795 Model A schema/data migration;
- legacy `Active` -> `Version_Status` authority transition;
- dry-run, backup, read-back, rollback and Owner approval gates.

Missing historical provenance must never be invented.

If an old record cannot be reconstructed with sufficient evidence, it must be classified explicitly rather than guessed.

---

## 11. Recommended Owner Decision

Proposed bounded decision:

```text
OWNER_DEC_D3_008 = PENDING OWNER DECISION
PROPOSED_VALUE = HYBRID_APP794_MINIMAL_NATIVE_PLUS_APP798_FULL_IMMUTABLE_ROUTE_SNAPSHOT
```

Recommended contract:

```text
APP794_NEW_LOGICAL_FIELDS = 4
  Frozen_Profile_Code
  K_expected_Snapshot
  Effective_Route_Version_Key
  Effective_Scorer_Slots_Snapshot

APP794_REUSE_EXISTING =
  Routing_Topology
  Requester_User
  four sequential approver slots + approval rules

APP798_NEW_PHYSICAL_FIELDS = 0
APP798_FULL_PROVENANCE = Snapshot_JSON + Snapshot_Hash
APP798_RUNTIME_ROUTING_AUTHORITY = NO
APP795_NEW_RESOLUTION_AUTHORITY = YES
APP794_BOUND_STAGE_AUTHORITY_AFTER_RESOLUTION = YES
```

Reason for recommendation:

- minimum practical App794 schema addition;
- deterministic active-stage scorer binding;
- direct native reporting of frozen profile/K/version;
- no need to query App798 for ordinary active-stage routing;
- complete immutable history remains in App798;
- avoids duplicating all route/scorer details as native App794 fields.

---

## 12. Implementation Readiness After This Design

This design work package itself does **not** authorize implementation.

```text
D3_WP001_R4 = EXECUTED / AWAITING CONTROL PLANE REVIEW
OWNER_DEC_D3_008 = PENDING OWNER DECISION
D3_IMPLEMENTATION_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
KINTONE_WRITES_AUTHORIZED = NONE
PRODUCTION_READY = NO
```

If independent review accepts this design, the next bounded gate is Owner approval/rejection/modification of `OWNER_DEC_D3_008`.

Only after that decision is locked should an implementation-readiness package define exact schema migration, source/test allow-lists, dry-run and rollback evidence.

---

## 13. Exact Execution Evidence for This Work Package

```text
START_HEAD = 30d2a36b8f885a82da1a170493c1540e15485ee2
AUTHORIZED_CHANGE_TYPE = DOCUMENTATION / DESIGN EVIDENCE ONLY
NEW_DESIGN_DOCUMENT = project-docs/D3_WP001_R4_APP794_APP798_ROUTE_SNAPSHOT_METADATA_PERSISTENCE_DESIGN.md

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

No implementation or production state is changed by this design document.
