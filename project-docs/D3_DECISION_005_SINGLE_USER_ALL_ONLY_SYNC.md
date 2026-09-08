# D3 Decision 005: Single Exact User Per Sequential Slot & ALL Only for D3 V1

Status: LOCKED / OWNER APPROVED
Date: 2026-09-09
Work Package: D3-DECISION-005-SYNC
Predecessor: D3-WP001-R3-R1 (PASS / CLOSED)

---

## 1. Owner Decision

- **`OWNER_DEC_D3_005 = LOCKED / OWNER APPROVED`**
- **`VALUE = SINGLE_EXACT_USER_PER_SEQUENTIAL_SLOT_ALL_ONLY_FOR_D3_V1`**

The Owner has explicitly decided and locked that Stage D3 V1 uses **exactly one Kintone user** per sequential appraiser slot, and standardizes on **`ALL`** as the native Process assignee completion rule. Any `ANY` assignee semantics and multi-user-per-slot configurations are formally deferred from D3 V1.

---

## 2. Scope

- **Stage:** MBO2026 Stage D3 V1 (Variable 1–4 Sequential Appraiser Process Compatibility & HR Routing Self-Service).
- **Type:** DECISION-SYNC / DOCS-ONLY.
- **Affected Subsystems:** App 795 (Routing Master) sequential slot definitions, Native Kintone Process Management status assignee configuration, Scorer candidate binding, and Self-elision runtime evaluation.
- **Operational Boundary:** Constrains D3 V1 runtime and configuration scope. Does not delete underlying generic data structure capabilities for future phases.

---

## 3. Single Exact User Per Slot Contract

```text
APPRAISERS_PER_ROUTE = 1..4
USERS_PER_SEQUENTIAL_SLOT = EXACTLY 1
NATIVE_ASSIGNEE_RULE = ALL
```

In D3 V1, every sequential approval slot in an active workflow route must resolve to exactly one concrete Kintone user.

### Standard Route Example:
```text
Employee
  -> 1st Appraiser (Slot 1) = User A (Exact Kintone User)
  -> 2nd Appraiser (Slot 2) = User B (Exact Kintone User)
  -> 3rd Appraiser (Slot 3) = User C (Exact Kintone User)
  -> 4th Appraiser (Slot 4) = User D (Exact Kintone User)
  -> HR Final Check (Dedicated Stage)
```

### Prohibited in D3 V1:
```text
1st Appraiser = [User A, User B, User C]
```
Configuring multiple users inside a single sequential slot is **strictly prohibited in D3 V1**, regardless of whether `ALL` (committee) or `ANY` (first-to-approve pool) behavior is desired.

---

## 4. ALL Semantics

`NATIVE_ASSIGNEE_RULE = ALL` is the standardized assignee rule for all sequential appraiser states in D3 V1.

### Technical Equivalence with Single User:
When a native Process state contains **exactly one user**:
- `ALL` with 1 user requires that 1 user to approve.
- `ANY` with 1 user requires that 1 user to approve.

Under a single-user slot constraint, `ALL` and `ANY` yield identical runtime approval completion behavior.
*(Important: This equivalence holds strictly when the slot contains exactly one user; they are not generally equivalent in multi-user settings.)*

### Reasons for Standardizing on ALL:
1. **Existing Baseline Consistency:** The confirmed production routing baseline (`ROUTING_WORKFLOW.md`) already operates using `ALL`.
2. **Audit Rigor:** Strict `ALL` semantics provide unambiguous compliance and audit evidence.
3. **Avoids Dynamic Branching:** Eliminates the need for dynamic server-side routing transitions based on assignee type (`filterCond` branching).
4. **Avoids Twin-State Explosion:** Prevents doubling the number of native workflow states into paired `ALL` and `ANY` states.
5. **Deterministic Scorer Identity:** Guarantees 1:1 binding between the workflow actor and the scoring appraiser candidate.
6. **Minimized UAT & Test Surface:** Drastically reduces edge-case permutation testing for stage release.

---

## 5. ANY / Multi-User Deferred Boundary

```text
MULTI_USER_SAME_SLOT_SUPPORT = NOT IN D3 V1
ANY_APPROVAL_SUPPORT = NOT IN D3 V1
```

The following patterns are deferred to future stages and are **NOT** supported in D3 V1:
- **Committee Approvals:** Multiple users assigned to the same slot where all must sign off (e.g., Slot 1 = User A + User B + User C, all required).
- **Shared Pool Approvals:** Multiple users assigned to the same slot where any single user may sign off (e.g., Slot 1 = User A or User B or User C, first actor completes).

These multi-user patterns introduce non-deterministic scorer assignment and complex state tracking that require dedicated future design, schema evolution, and explicit Owner authorization. Existing generic schema capability or helper utilities that support multi-user arrays need not be deleted, but D3 V1 runtime validation will enforce `USERS_PER_SEQUENTIAL_SLOT == 1`.

---

## 6. Scoring Consequences

Because each sequential slot contains exactly one user:
- Scorer candidate binding is 100% deterministic and unambiguous.
- Scoring identity is directly tied to the slot’s single configured user.
- **HR Control Maintained (`OWNER_DEC_D3_003`):** Being an appraiser in the route does not automatically make that user a scorer. HR configures scorer priority/eligibility via `Scorer_Priority_Slots`.

### Example:
```text
Route Configuration:
  Slot 1 = User A
  Slot 2 = User B
  Slot 3 = User C
Profile K_expected = 2
HR Scorer Priority Slots = [1, 3]

Active Scoring Appraisers:
  Layer 1 Scorer = User A (Slot 1, 50% weight)
  Layer 2 Scorer = User C (Slot 3, 50% weight)
  Non-Scoring Workflow Approver = User B (Slot 2, 0% weight)
```

No scorer is inferred by implicit default, and `OWNER_DEC_D3_003` remains locked and fully preserved.

---

## 7. Self-Elision Consequences

Self-elision (`DECISION_D3_002`) operates predictably with single-user slots:

### Example:
```text
Configured Route:
  Slot 1 = User A
  Slot 2 = User B
  Slot 3 = User C
Record Owner (Employee) = User A

Step 1: Self-Elision Simulation
  User A is elided from the approver chain.
  Surviving Approver Route: Slot 2 (User B) -> Slot 3 (User C).

Step 2: Scorer Plan Resolution
  Profile K_expected = 2.
  HR Scorer Priority Slots = [1, 2].
  Candidate Slot 1 (User A) is elided.
  Remaining candidate: Slot 2 (User B) -> Count = 1.
  Since surviving scorers (1) < K_expected (2):
  -> Result: FAIL CLOSED (INSUFFICIENT_SCORERS_AFTER_ELISION).
```

If alternative priority slots had been configured (e.g., `[2, 3]`), both User B and User C would survive, satisfying $K_{\text{expected}} = 2$ and resulting in **PASS**. `DECISION_D3_002` rules remain fully intact.

---

## 8. Native Process Consequences

Because D3 V1 does not require dynamic `ALL` vs `ANY` per slot:
- The **Twin-Status Execution Engine** (`Step N - ALL` / `Step N - ANY`) is **NOT** required and will **NOT** be implemented in D3 V1.
- The 45-state generic state engine remains an unexecuted future reference architecture.
- D3 V1 native workflow states and transitions will be built strictly on the existing topology family (1–4 sequential appraisers) using standard native states.
- Exact state and action counts will be formalized in the implementation work package; no claim of exact counts is made in this decision synchronization.

---

## 9. Current Live vs D3 Target

| Aspect | Current Live Standard Route | D3 Target Capability (D3 V1) |
| :--- | :--- | :--- |
| **Routing Topology** | Strict 2-Appraiser (`M1_G1`) | Variable 1–4 Sequential Appraisers |
| **Supported Topologies** | `M1_G1` only (17 active rows) | `M1_ONLY`, `M1_G1`, `M1_M2_G1`, `M1_G1_G2`, `M1_M2_G1_G2` |
| **Users Per Slot** | Exactly 1 user | Exactly 1 user |
| **Native Assignee Rule**| `ALL` | `ALL` |
| **Scoring Count** | Fixed by Profile ($K=1$ or $K=2$) | Fixed by Profile ($K=1$ or $K=2$) |
| **Scorer Selection** | Implicit fixed slots | HR-Configured via `Scorer_Priority_Slots` |
| **Persistence Model** | Live mutable row | Effective-dated versioned rows (pending D3-006) |

---

## 10. Deferred Architecture Boundary

```text
TWIN_ALL_ANY_STATE_ENGINE = NOT AUTHORIZED FOR D3 V1
45_STATE_GENERIC_ARCHITECTURE = DEFERRED FUTURE REFERENCE
```

The 45-state architecture (`GENERIC_ROUTING_ARCHITECTURE.md`) remains archived as a deferred future reference blueprint. D3 V1 is bounded to the existing-topology 1..4 sequential model.

---

## 11. Owner Decision Status

| Decision ID | Subject | Status |
| :--- | :--- | :--- |
| **DECISION_D3_001** | Existing Topology Family (1–4 Appraisers) | **LOCKED / OWNER APPROVED** |
| **DECISION_D3_002** | Automatic Self-Appraiser Elision | **LOCKED / OWNER APPROVED** |
| **OWNER_DEC_D3_003** | HR-Configurable Scoring Appraisers via Profile $K_{\text{expected}}$ | **LOCKED / OWNER APPROVED** |
| **OWNER_DEC_D3_005** | Single Exact User Per Sequential Slot / ALL Only for D3 V1 | **LOCKED / OWNER APPROVED** |
| **OWNER_DEC_D3_006** | Effective-Dated Routing Persistence (Model A) | **PENDING OWNER DECISION** |
| **OWNER_DEC_D3_007** | DGM Authority ($K=1$, President Only, `M1_ONLY`, 100%) | **LOCKED / OWNER APPROVED** |

---

## 12. Remaining Gate

The final major architectural decisions required prior to implementation authorization:
1. **`OWNER_DEC_D3_006`:** Approval of Effective-Dated Routing Model A (versioned rows in App 795 with composite Version Key).
2. **App 794 Audit Snapshot Schema Strategy:** Formalizing minimal snapshot audit fields on App 794 vs App 798 archive.

---

## 13. Implementation Authorization

```text
D3_IMPLEMENTATION_AUTHORIZED = NO
DEPLOYMENT_AUTHORIZED = NO
KINTONE_WRITES_AUTHORIZED = NONE
READY_FOR_BOUNDED_IMPLEMENTATION = NO
STATUS = EXECUTED / AWAITING CONTROL PLANE REVIEW
NEXT_PERMITTED_ACTION = CONTROL_PLANE_REVIEW_OF_D3_DECISION_005_SYNC
```

This document represents an evidence-based decision lock and control synchronization only. Stage D3 implementation remains on **HOLD** pending separate explicit Owner work package authorization.
