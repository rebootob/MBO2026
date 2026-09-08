# D3-WP001: Variable 1–4 Appraiser Process Compatibility & HR Routing Self-Service Design

**Date:** 2026-09-08 ICT
**Work Package:** `D3-WP001`
**Title:** Variable 1–4 Appraiser Process Compatibility & HR Routing Self-Service Design
**Type:** `DESIGN / EVIDENCE-ONLY`
**Owner Authorization:** `APPROVED`
**Owner Additional Requirement:** HR Dashboard must allow authorized HR users to add, remove, change, and maintain the 1–4 sequential appraiser route without requiring source-code changes for routine routing administration (`HR_ROUTING_SELF_SERVICE_REQUIRED = YES`, `HR_ROUTINE_IT_DEPENDENCY_TARGET = NEAR_ZERO`).
**Branch:** `ai/antigravity-wp002c`
**Repository:** `rebootob/MBO2026`
**Starting HEAD:** `ca5a3b279b4986203c0b14b72761a9575eb1209e`
**Author:** Antigravity Execution Plane
**Review Target:** Human Owner & ChatGPT Control Plane

---

## 1. Executive Summary

This design document establishes the authoritative technical blueprint for:
1. **Variable 1–4 Sequential Appraiser Process Compatibility:** Supporting 1, 2, 3, or 4 business evaluators in strict sequential order across Objective, Mid-Year, and Final Evaluation stages on Kintone App 794.
2. **HR Routing Self-Service Administration:** Empowering HR administrators to maintain App 795 routing rules (add, edit, remove, reorder, change approvers, set effective dates, preview, and audit) directly through the App 800 HR Control Center with near-zero IT dependency and zero JavaScript source code changes for routine operations.
3. **Execution Reality Reconciliation:** Reconciling the live 16-state / 28-action baseline, existing App 794/795 schema, Self-Appraiser elision rules (`DECISION-D3-002`), and Appraiser Scoring completeness (`DEC-036`).

```text
WORK_PACKAGE = D3-WP001
TYPE = DESIGN / EVIDENCE-ONLY
OWNER_AUTHORIZATION = APPROVED

DECISION_D3_001 = VARIABLE_1_TO_4_SEQUENTIAL_APPRAISERS_ON_EXISTING_TOPOLOGY
MIN_APPRAISERS = 1
MAX_APPRAISERS = 4
APPRAISER_COUNT = VARIABLE_BY_ROUTE
BUSINESS_FACING_LABELS = 1st Appraiser, 2nd Appraiser, 3rd Appraiser, 4th Appraiser
INTERNAL_STORAGE_CODES = M1_ONLY, M1_G1, M1_M2_G1, M1_G1_G2, M1_M2_G1_G2
GENERIC_45_STATE_ARCHITECTURE = DEFERRED_FUTURE_ARCHITECTURE_REFERENCE
45_STATE_IMPLEMENTATION_AUTHORIZED_FOR_D3_V1 = NO

DECISION_D3_002 = SELF_APPRAISER_ELISION_WITH_FAIL_CLOSED_IF_NO_APPRAISER_REMAINS
SELF_APPRAISER_POLICY = ELIDE_SELF_AND_COMPACT_SURVIVING_ROUTE
ZERO_SURVIVING_APPRAISERS = FAIL_CLOSED / SELF_APPROVAL_ROUTE_CONFLICT
AUTO_APPROVAL = PROHIBITED

HR_ROUTING_SELF_SERVICE_REQUIRED = YES
HR_ROUTINE_IT_DEPENDENCY_TARGET = NEAR_ZERO

CURRENT_STATE_COUNT = 16
CURRENT_ACTION_COUNT = 28
PROPOSED_D3_V1_STATE_COUNT = 19
PROPOSED_D3_V1_ACTION_COUNT = 40

SCORING_ROUTING_RELATIONSHIP = OWNER_DECISION_REQUIRED
D3_IMPLEMENTATION_AUTHORIZED = NO
PRODUCTION_READY = NO
```

---

## 2. Repository Evidence & Current Execution Truth

A rigorous audit of fresh repository truth confirms the following facts:

1. **App 794 Live Baseline:**
   - App 794 runs at Live Revision 70 (`204d34db...` JS, `0532c1c3...` CSS).
   - The native Process Management configuration consists of exactly **16 states** and **28 actions** (verified from `scratch/app794-pm-prewrite-backup.json`).
   - The 16 states currently include First Manager (M2) review states (`02`, `07`, `12`), Manager (M1) review states (`03`, `08`, `13`), GM (G1) review states (`04`, `09`, `14`), HR Final Check (`15`), and terminal Completed (`16`).

2. **Active Routing Execution:**
   - Active production/sandbox routing rows in App 795 currently execute the `M1_G1` topology (Manager -> GM).
   - The `M1_G1` path is proven, durable, and closed in D1.

3. **Existing Native States for M2:**
   - The 16-state baseline already contains native states for `First_Manager_User` (M2):
     - `02 First Manager Objective Review`
     - `07 First Manager Mid-Year Review`
     - `12 First Manager Final Evaluation`
   - However, in the current 16-state actions, `01 Draft Objective` allows submitting to `02` or `03`, but `03 Manager Objective Review` hardcodes an approval action to `04 GM Objective Review`. There is no direct path from `03` to `05 Objective Approved` (blocking native `M1_ONLY`).

4. **G2 (4th Appraiser) Blocked in Source:**
   - `src/validation/validation-engine.js` (lines 288–297) intentionally contains an explicit guard:
     ```javascript
     if (topology.includes('G2')) {
       fieldErrors.push({
         field: 'Routing_Topology',
         message: `Routing topology ${topology} is not supported by current Process Management workflow.`
       });
     }
     ```
   - In App 794 Process Management, there are **zero** native states and **zero** actions for G2 (`GM_Level2_Approvers`).

5. **App 794 & App 795 Schema Evidence:**
   - App 795 (`routingFields` in `config/schema-spec.js`) defines:
     - `Manager_Level1_Approvers` / `Manager_Level1_Approval_Rule` (M1)
     - `Manager_Level2_Approvers` / `Manager_Level2_Approval_Rule` (M2)
     - `GM_Level1_Approvers` / `GM_Level1_Approval_Rule` (G1)
     - `GM_Level2_Approvers` / `GM_Level2_Approval_Rule` (G2)
     - Legacy fields: `First_Manager_User`, `Manager_User`, `GM_User`.
   - App 794 (`mboFields` in `config/schema-spec.js`) contains matching snapshot fields, plus `Routing_Topology`, `Has_Manager_Level2`, `Has_GM_Level2`.
   - However, App 794 has scoring rating fields **only** for Manager and GM (`Manager_Achievement_1..10` and `GM_Achievement_1..10`). It has **no** fields for M2 or G2 rating scores.

6. **Self-Appraiser Compaction in Source:**
   - `src/services/routing-service.js` (lines 262–405) implements `applyOwnMboSelfAppraiserElision()`.
   - When zero non-self approvers survive, it throws `NO_REMAINING_NON_SELF_APPROVER`.
   - *Control Plane Discrepancy:* The locked control authority classification is `SELF_APPROVAL_ROUTE_CONFLICT`. This represents an implementation gap to be reconciled in D3 implementation.

7. **App 800 HR Control Center Current State:**
   - App 800 (`src/ui/hr-control-center.js`) currently provides system health metrics, transactional record filtering/monitoring for App 794, and an App 801 MBO Password Reset panel.
   - It contains **zero** UI or service components for managing App 795 routing rules.

---

## 3. Locked Owner Authority

The following architectural mandates are locked by Owner decisions and must be strictly preserved:

| Authority Item | Value / Requirement | Source |
|---|---|---|
| **DECISION-D3-001** | `VARIABLE_1_TO_4_SEQUENTIAL_APPRAISERS_ON_EXISTING_TOPOLOGY` | `project-docs/D3_DECISION_SYNC_OWNER_ARCHITECTURE_ROUTING_DECISIONS.md` |
| **Capacity Bounds** | `MIN_APPRAISERS = 1`, `MAX_APPRAISERS = 4`, Variable by route | DECISION-D3-001 |
| **Business Labels** | `1st Appraiser`, `2nd Appraiser`, `3rd Appraiser`, `4th Appraiser` | DECISION-D3-001 |
| **Storage Identifiers** | `M1_ONLY`, `M1_G1`, `M1_M2_G1`, `M1_G1_G2`, `M1_M2_G1_G2` | DECISION-D3-001 |
| **45-State Twin Engine** | `DEFERRED_FUTURE_ARCHITECTURE_REFERENCE` (`45_STATE_AUTHORIZED = NO`) | DECISION-D3-001 |
| **DECISION-D3-002** | `SELF_APPRAISER_ELISION_WITH_FAIL_CLOSED_IF_NO_APPRAISER_REMAINS` | `project-docs/D3_DECISION_SYNC_OWNER_ARCHITECTURE_ROUTING_DECISIONS.md` |
| **Zero Survivors Rule** | `FAIL_CLOSED` with `SELF_APPROVAL_ROUTE_CONFLICT` | DECISION-D3-002 |
| **Auto-Approval** | `PROHIBITED` | DECISION-D3-002 |
| **HR Self-Service** | Direct routing administration in App 800 with near-zero IT dependency | Owner Requirement |

---

## 4. Business Representation vs Internal Technical Storage

To eliminate administrative confusion and decouple HR business operations from legacy technical artifacts:

1. **Business-Facing Presentation (Universal):**
   - In App 794 UI, App 800 HR Dashboard, PDF/XLSX exports, and notifications, evaluators are identified strictly by sequential order:
     - **1st Appraiser** (ผู้ประเมินลำดับที่ 1)
     - **2nd Appraiser** (ผู้ประเมินลำดับที่ 2)
     - **3rd Appraiser** (ผู้ประเมินลำดับที่ 3)
     - **4th Appraiser** (ผู้ประเมินลำดับที่ 4)
   - Job titles (e.g. "Section Manager", "Department Manager", "General Manager", "VP") reflect employment hierarchy, but the workflow engine treats them purely as sequential evaluation steps.

2. **Internal Technical Storage Details:**
   - The codes `M1_ONLY`, `M1_G1`, `M1_M2_G1`, `M1_G1_G2`, and `M1_M2_G1_G2` are retained as internal storage constants and Kintone Process Management filter discriminators to ensure 100% backward compatibility with existing records.
   - HR users do **not** select technical topology strings. The system automatically derives the technical topology from the configured sequence of business slots.

---

## 5. Topology Compatibility Matrix

The system supports five canonical sequential topologies across all three business evaluation stages.

### Stage 1: Objective Setting (การกำหนดเป้าหมาย)

| Topology | Business Slots | Step 1 (1st Appraiser) | Step 2 (2nd Appraiser) | Step 3 (3rd Appraiser) | Step 4 (4th Appraiser) | Terminal Approval State | Return Target |
|---|---|---|---|---|---|---|---|
| **`M1_ONLY`** | 1 slot | `03 Manager Objective Review` (M1) | N/A | N/A | N/A | `05 Objective Approved` | `01 Draft Objective` |
| **`M1_G1`** | 2 slots | `03 Manager Objective Review` (M1) | `04 GM Objective Review` (G1) | N/A | N/A | `05 Objective Approved` | `01 Draft Objective` |
| **`M1_M2_G1`** | 3 slots | `02 First Manager Objective Review` (M2) | `03 Manager Objective Review` (M1) | `04 GM Objective Review` (G1) | N/A | `05 Objective Approved` | `01 Draft Objective` |
| **`M1_G1_G2`** | 3 slots | `03 Manager Objective Review` (M1) | `04 GM Objective Review` (G1) | `04B GM2 Objective Review` (G2) | N/A | `05 Objective Approved` | `01 Draft Objective` |
| **`M1_M2_G1_G2`** | 4 slots | `02 First Manager Objective Review` (M2) | `03 Manager Objective Review` (M1) | `04 GM Objective Review` (G1) | `04B GM2 Objective Review` (G2) | `05 Objective Approved` | `01 Draft Objective` |

### Stage 2: Mid-Year Review (การทบทวนครึ่งปี)

| Topology | Business Slots | Step 1 (1st Appraiser) | Step 2 (2nd Appraiser) | Step 3 (3rd Appraiser) | Step 4 (4th Appraiser) | Terminal Approval State | Return Target |
|---|---|---|---|---|---|---|---|
| **`M1_ONLY`** | 1 slot | `08 Manager Mid-Year Review` (M1) | N/A | N/A | N/A | `10 Mid-Year Completed` | `06 Employee Mid-Year` |
| **`M1_G1`** | 2 slots | `08 Manager Mid-Year Review` (M1) | `09 GM Mid-Year Review` (G1) | N/A | N/A | `10 Mid-Year Completed` | `06 Employee Mid-Year` |
| **`M1_M2_G1`** | 3 slots | `07 First Manager Mid-Year Review` (M2) | `08 Manager Mid-Year Review` (M1) | `09 GM Mid-Year Review` (G1) | N/A | `10 Mid-Year Completed` | `06 Employee Mid-Year` |
| **`M1_G1_G2`** | 3 slots | `08 Manager Mid-Year Review` (M1) | `09 GM Mid-Year Review` (G1) | `09B GM2 Mid-Year Review` (G2) | N/A | `10 Mid-Year Completed` | `06 Employee Mid-Year` |
| **`M1_M2_G1_G2`** | 4 slots | `07 First Manager Mid-Year Review` (M2) | `08 Manager Mid-Year Review` (M1) | `09 GM Mid-Year Review` (G1) | `09B GM2 Mid-Year Review` (G2) | `10 Mid-Year Completed` | `06 Employee Mid-Year` |

### Stage 3: Final Evaluation (การประเมินปลายปี)

| Topology | Business Slots | Step 1 (1st Appraiser) | Step 2 (2nd Appraiser) | Step 3 (3rd Appraiser) | Step 4 (4th Appraiser) | HR Gate | Terminal State | Return Target |
|---|---|---|---|---|---|---|---|---|
| **`M1_ONLY`** | 1 slot | `13 Manager Final Evaluation` (M1) | N/A | N/A | N/A | `15 HR Final Check` | `16 Completed` | `11 Employee Self Evaluation` |
| **`M1_G1`** | 2 slots | `13 Manager Final Evaluation` (M1) | `14 GM Final Evaluation` (G1) | N/A | N/A | `15 HR Final Check` | `16 Completed` | `11 Employee Self Evaluation` |
| **`M1_M2_G1`** | 3 slots | `12 First Manager Final Evaluation` (M2) | `13 Manager Final Evaluation` (M1) | `14 GM Final Evaluation` (G1) | N/A | `15 HR Final Check` | `16 Completed` | `11 Employee Self Evaluation` |
| **`M1_G1_G2`** | 3 slots | `13 Manager Final Evaluation` (M1) | `14 GM Final Evaluation` (G1) | `14B GM2 Final Evaluation` (G2) | N/A | `15 HR Final Check` | `16 Completed` | `11 Employee Self Evaluation` |
| **`M1_M2_G1_G2`** | 4 slots | `12 First Manager Final Evaluation` (M2) | `13 Manager Final Evaluation` (M1) | `14 GM Final Evaluation` (G1) | `14B GM2 Final Evaluation` (G2) | `15 HR Final Check` | `16 Completed` | `11 Employee Self Evaluation` |

---

## 6. Native Process Management Design (Minimum Compatible Extension)

To avoid breaking live App 794 operations while enabling variable 1–4 sequential routing, the proposed D3 V1 Process Management model extends the current 16-state / 28-action baseline additively.

### 6.1 State Model: From 16 to 19 States

| Index | State Name | Assignee Entity / Field | Category | Status |
|---|---|---|---|---|
| 0 | `01 Draft Objective` | `[]` (Requester) | Baseline | UNCHANGED |
| 1 | `02 First Manager Objective Review` | `FIELD_ENTITY: First_Manager_User` | Baseline (M2) | UNCHANGED |
| 2 | `03 Manager Objective Review` | `FIELD_ENTITY: Manager_User` | Baseline (M1) | UNCHANGED |
| 3 | `04 GM Objective Review` | `FIELD_ENTITY: GM_User` | Baseline (G1) | UNCHANGED |
| **4** | **`04B GM2 Objective Review`** | **`FIELD_ENTITY: GM_Level2_Approvers`** | **NEW (G2 Stage 1)** | **NEW** |
| 5 | `05 Objective Approved` | `FIELD_ENTITY: Requester_User` | Baseline | UNCHANGED |
| 6 | `06 Employee Mid-Year` | `FIELD_ENTITY: Requester_User` | Baseline | UNCHANGED |
| 7 | `07 First Manager Mid-Year Review` | `FIELD_ENTITY: First_Manager_User` | Baseline (M2) | UNCHANGED |
| 8 | `08 Manager Mid-Year Review` | `FIELD_ENTITY: Manager_User` | Baseline (M1) | UNCHANGED |
| 9 | `09 GM Mid-Year Review` | `FIELD_ENTITY: GM_User` | Baseline (G1) | UNCHANGED |
| **10** | **`09B GM2 Mid-Year Review`** | **`FIELD_ENTITY: GM_Level2_Approvers`** | **NEW (G2 Stage 2)** | **NEW** |
| 11 | `10 Mid-Year Completed` | `FIELD_ENTITY: Requester_User` | Baseline | UNCHANGED |
| 12 | `11 Employee Self Evaluation` | `FIELD_ENTITY: Requester_User` | Baseline | UNCHANGED |
| 13 | `12 First Manager Final Evaluation` | `FIELD_ENTITY: First_Manager_User` | Baseline (M2) | UNCHANGED |
| 14 | `13 Manager Final Evaluation` | `FIELD_ENTITY: Manager_User` | Baseline (M1) | UNCHANGED |
| 15 | `14 GM Final Evaluation` | `FIELD_ENTITY: GM_User` | Baseline (G1) | UNCHANGED |
| **16** | **`14B GM2 Final Evaluation`** | **`FIELD_ENTITY: GM_Level2_Approvers`** | **NEW (G2 Stage 3)** | **NEW** |
| 17 | `15 HR Final Check` | `USER: hr` | Baseline | UNCHANGED |
| 18 | `16 Completed` | `[]` (Terminal) | Baseline | UNCHANGED |

**Summary of States:**
- `CURRENT_STATE_COUNT`: **16**
- `UNCHANGED_STATES`: **16**
- `NEW_STATES`: **3** (`04B GM2 Objective Review`, `09B GM2 Mid-Year Review`, `14B GM2 Final Evaluation`)
- `PROPOSED_D3_V1_STATE_COUNT`: **19**

### 6.2 Action Model: From 28 to 40 Actions

To govern variable routing without hardcoded branching in JavaScript, Kintone Process Management `filterCond` is utilized:

1. **Direct Bypass for `M1_ONLY` (+3 Actions):**
   - Stage 1: `03 Manager Objective Review` -> `05 Objective Approved` (Filter: `Routing_Topology in ("M1_ONLY")`)
   - Stage 2: `08 Manager Mid-Year Review` -> `10 Mid-Year Completed` (Filter: `Routing_Topology in ("M1_ONLY")`)
   - Stage 3: `13 Manager Final Evaluation` -> `15 HR Final Check` (Filter: `Routing_Topology in ("M1_ONLY")`)

2. **G2 Forward Transitions (+6 Actions):**
   - Stage 1:
     - `04 GM Objective Review` -> `04B GM2 Objective Review` (Filter: `Routing_Topology in ("M1_G1_G2", "M1_M2_G1_G2")`)
     - `04B GM2 Objective Review` -> `05 Objective Approved` (Filter: `""`)
   - Stage 2:
     - `09 GM Mid-Year Review` -> `09B GM2 Mid-Year Review` (Filter: `Routing_Topology in ("M1_G1_G2", "M1_M2_G1_G2")`)
     - `09B GM2 Mid-Year Review` -> `10 Mid-Year Completed` (Filter: `""`)
   - Stage 3:
     - `14 GM Final Evaluation` -> `14B GM2 Final Evaluation` (Filter: `Routing_Topology in ("M1_G1_G2", "M1_M2_G1_G2")`)
     - `14B GM2 Final Evaluation` -> `15 HR Final Check` (Filter: `""`)

3. **G2 Return Actions (+3 Actions):**
   - Stage 1: `04B GM2 Objective Review` -> `01 Draft Objective` ("Return Objective to Employee")
   - Stage 2: `09B GM2 Mid-Year Review` -> `06 Employee Mid-Year` ("Return Mid-Year to Employee")
   - Stage 3: `14B GM2 Final Evaluation` -> `11 Employee Self Evaluation` ("Return Final to Employee")

4. **Existing Action Filtering Optimization (Modified Actions):**
   - Existing actions from `04`, `09`, `14` that transition to `05`, `10`, `15` are updated with filter condition: `Routing_Topology not in ("M1_G1_G2", "M1_M2_G1_G2")` so they do not show when a G2 appraiser is present.
   - Existing actions from `03`, `08`, `13` that transition to `04`, `09`, `14` are updated with filter condition: `Routing_Topology not in ("M1_ONLY")`.

**Summary of Actions:**
- `CURRENT_ACTION_COUNT`: **28**
- `UNCHANGED_ACTIONS`: **22** (all Submit, First Manager, and HR check actions)
- `MODIFIED_ACTIONS`: **6** (filtering added to M1->G1 and G1->Approved actions)
- `NEW_ACTIONS`: **12** (3 M1_ONLY direct bypass + 6 G2 forward + 3 G2 return)
- `PROPOSED_D3_V1_ACTION_COUNT`: **40**

---

## 7. Ordinal Slot Mapping & Compaction Design

### 7.1 Canonical Mapping Rules

The business route consists of an ordered sequence of 1 to 4 business slots:
- Slot 1 = 1st Appraiser
- Slot 2 = 2nd Appraiser
- Slot 3 = 3rd Appraiser
- Slot 4 = 4th Appraiser

The relationship between business slot count and technical storage is canonicalized as follows:

| Slot Count | Derived Technical Topology | Slot 1 Storage | Slot 2 Storage | Slot 3 Storage | Slot 4 Storage |
|---|---|---|---|---|---|
| **1 Slot** | **`M1_ONLY`** | `Manager_Level1_Approvers` (`Manager_User`) | *Empty* | *Empty* | *Empty* |
| **2 Slots** | **`M1_G1`** | `Manager_Level1_Approvers` (`Manager_User`) | `GM_Level1_Approvers` (`GM_User`) | *Empty* | *Empty* |
| **3 Slots (Standard)** | **`M1_M2_G1`** | `Manager_Level2_Approvers` (`First_Manager_User`) | `Manager_Level1_Approvers` (`Manager_User`) | `GM_Level1_Approvers` (`GM_User`) | *Empty* |
| **3 Slots (Executive)** | **`M1_G1_G2`** | `Manager_Level1_Approvers` (`Manager_User`) | `GM_Level1_Approvers` (`GM_User`) | `GM_Level2_Approvers` | *Empty* |
| **4 Slots** | **`M1_M2_G1_G2`** | `Manager_Level2_Approvers` (`First_Manager_User`) | `Manager_Level1_Approvers` (`Manager_User`) | `GM_Level1_Approvers` (`GM_User`) | `GM_Level2_Approvers` |

> [!NOTE]
> **Why `First_Manager_User` maps to Slot 1 in `M1_M2_G1`:**
> In Kintone App 794 native Process Management, `02 First Manager Objective Review` evaluates *before* `03 Manager Objective Review`. Therefore, for a 3-appraiser route using M2, the 1st Appraiser in business sequence is stored in `Manager_Level2_Approvers` / `First_Manager_User`, and the 2nd Appraiser is stored in `Manager_Level1_Approvers` / `Manager_User`. This preserves existing Kintone process flows without reordering native states.

### 7.2 Compaction & Gap Prohibition

**Strict Invariant: No Gaps Allowed.**
An effective route must be strictly contiguous (e.g. Slot 1 -> Slot 2 -> Slot 3). A configuration where Slot 1 is populated, Slot 2 is blank, and Slot 3 is populated is **strictly rejected** during validation and cannot be saved.

When compaction occurs (e.g. during Self-Appraiser elision):
- Surviving business slots are shifted leftward to fill empty positions.
- Example compaction traces:
  - **4 -> 3:** If Slot 1 is elided: Old Slot 2 -> New Slot 1, Old Slot 3 -> New Slot 2, Old Slot 4 -> New Slot 3. Topology recalculates from `M1_M2_G1_G2` to `M1_M2_G1`.
  - **4 -> 2:** If Slots 1 and 2 are elided: Old Slot 3 -> New Slot 1, Old Slot 4 -> New Slot 2. Topology recalculates from `M1_M2_G1_G2` to `M1_G1`.
  - **4 -> 1:** If Slots 1, 2, 3 are elided: Old Slot 4 -> New Slot 1. Topology recalculates to `M1_ONLY`.
  - **3 -> 2:** If Slot 2 is elided: Old Slot 1 -> New Slot 1, Old Slot 3 -> New Slot 2. Topology recalculates from `M1_M2_G1` to `M1_G1`.
  - **3 -> 1:** If Slots 2 and 3 are elided: Old Slot 1 -> New Slot 1. Topology recalculates to `M1_ONLY`.
  - **2 -> 1:** If Slot 1 is elided: Old Slot 2 -> New Slot 1. Topology recalculates from `M1_G1` to `M1_ONLY`.

---

## 8. Self-Appraiser Compatibility Matrix (DECISION-D3-002)

Applying Owner DECISION-D3-002 to an employee's **own MBO record**:

| Self Identity Location | Surviving Business Slots | Effective Topology | Behavior / Invariant |
|---|---|---|---|
| **Slot 1 only** (Single-user slot) | Slots 2, 3, 4 survive | Compacted (3 slots) | Slot 1 removed; surviving slots shift left; effective topology recalculated. |
| **Slot 2 only** (Single-user slot) | Slots 1, 3, 4 survive | Compacted (3 slots) | Slot 2 removed; Slot 3 becomes Step 2, Slot 4 becomes Step 3. |
| **Slot 3 only** (Single-user slot) | Slots 1, 2, 4 survive | Compacted (3 slots) | Slot 3 removed; Slot 4 becomes Step 3. |
| **Slot 4 only** (Single-user slot) | Slots 1, 2, 3 survive | Compacted (3 slots) | Slot 4 removed; Slots 1, 2, 3 remain. |
| **Multiple Slots** (e.g. Slots 1 & 2) | Surviving slots shift left | Compacted (1 or 2 slots) | Both self instances removed; surviving slots compacted leftward. |
| **Multi-User Slot** (Employee + others) | Same slot survives | Topology unchanged | Only the employee's user code is removed from that slot; remaining users in that slot continue with existing `ALL`/`ANY` rule. Slot is NOT removed. |
| **All Slots** (No survivors remain) | **0 surviving appraisers** | **FAIL CLOSED** | **Throws `SELF_APPROVAL_ROUTE_CONFLICT`**. Workflow creation / submission blocked. No auto-approval. No silent HR bypass. |

### Implementation Gap in Current Source:
- In `src/services/routing-service.js` (line 343), the error thrown is `NO_REMAINING_NON_SELF_APPROVER`.
- The authoritative classification locked in `D3_DECISION_SYNC_OWNER_ARCHITECTURE_ROUTING_DECISIONS.md` is `SELF_APPROVAL_ROUTE_CONFLICT`.
- *Action Required in D3 Implementation WP:* Standardize error code to `SELF_APPROVAL_ROUTE_CONFLICT`.

---

## 9. HR Dashboard Self-Service Design (New Owner Requirement)

To achieve `HR_ROUTING_SELF_SERVICE_REQUIRED = YES` and `HR_ROUTINE_IT_DEPENDENCY_TARGET = NEAR_ZERO`, an HR Routing Management module is designed as a dedicated operational view within App 800 (HR Control Center).

```
+---------------------------------------------------------------------------------------------------+
|  MBO 2026 — HR Control Center | [Monitoring]  [Password Reset]  [Routing Management]               |
+---------------------------------------------------------------------------------------------------+
|  ROUTE SELECTION:                                                                                 |
|  Section: [ FIN - Finance Department          v]   Team: [ Accounts Payable   v]                  |
|  Position Route Override: [ None (Use Section/Team) v]                                            |
|  Current Status: ACTIVE | Current Topology: M1_G1 (2 Appraisers) | Effective: 2026-04-01          |
+---------------------------------------------------------------------------------------------------+
|  ROUTE CONFIGURATION:                                                                             |
|  Sequential Appraiser Count: ( ) 1   ( ) 2   (o) 3   ( ) 4                                        |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  | [Step 1: 1st Appraiser]                                                         [^] [v] [x] |  |
|  | Approvers: [ Somchai P. (0102) x ] [ Add User... v]   Rule: (*) ALL  ( ) ANY                |  |
|  +---------------------------------------------------------------------------------------------+  |
|  | [Step 2: 2nd Appraiser]                                                         [^] [v] [x] |  |
|  | Approvers: [ Papatchaya T. (0113) x ]                 Rule: (*) ALL  ( ) ANY                |  |
|  +---------------------------------------------------------------------------------------------+  |
|  | [Step 3: 3rd Appraiser]                                                         [^] [v] [x] |  |
|  | Approvers: [ Hiroshi T. (0005) x ]                    Rule: (*) ALL  ( ) ANY                |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  Effective Date: [ 2026-10-01 ]   Business Reason: [ Organizational restructuring Q3           ]  |
|                                                                                                   |
|  Derived Technical Topology: M1_M2_G1 (Automatic)                                                 |
+---------------------------------------------------------------------------------------------------+
|  [ PREVIEW ROUTE CHANGE ]   [ CANCEL ]                                                            |
+---------------------------------------------------------------------------------------------------+
```

### 9.1 Module Components & User Flow

1. **Route Selection:**
   - Dropdown cascading: `Section` -> `Team` (mandatory if TMG section).
   - Executive position selector for direct routes (`POSITION_DGM`, `POSITION_GM`, `POSITION_VP`).
   - Technical `Routing_Key` displayed as read-only diagnostic metadata.

2. **Appraiser Count Radio (1, 2, 3, 4):**
   - Selecting a count dynamically reveals or hides slots 1 through 4.
   - Default count reflects current active App 795 configuration.

3. **Appraiser Slot Maintenance:**
   - Each business slot card allows:
     - **Add User:** Multi-select user search from active Kintone users.
     - **Remove User:** Delete specific user chip.
     - **Approval Rule:** Toggle between `ALL` (all users in slot must approve) and `ANY` (first user to approve advances).
     - **Slot Reorder:** Up/Down arrows to swap slot positions safely.
     - **Delete Slot:** Removes slot and shifts subsequent slots left.

4. **Approver Count vs User Count Clarity:**
   - **`APPRAISER_COUNT` (1–4)** defines the number of sequential business approval **steps** (slots).
   - **Slot Member Count** defines the number of Kintone users authorized within **one slot**.
   - Having 2 users in Slot 1 with `ANY` rule is still a 1-step evaluation. `MAX_APPRAISERS = 4` bounds the sequential steps, not the sum of individual user identities.

5. **Automatic Topology Derivation:**
   - HR users do **not** select `M1_G1`, `M1_M2_G1`, etc.
   - The UI automatically derives and displays the technical topology:
     - 1 Slot -> `M1_ONLY`
     - 2 Slots -> `M1_G1`
     - 3 Slots -> `M1_M2_G1` (or `M1_G1_G2` if configured with GM2)
     - 4 Slots -> `M1_M2_G1_G2`

6. **Deterministic Effective Dating:**
   - Mandatory `Effective_From` date.
   - Changes take effect on or after this date. Historical records resolved before this date remain unaffected.

7. **Preview Before Save (Mandatory Modal):**
   - Before writing to App 795, the modal displays:
     - Current Active Route vs Proposed New Route (side-by-side diff).
     - Appraiser Count & Ordinal sequence.
     - Approval Rule per slot.
     - Derived Technical Topology.
     - Effective Date & Mandatory Business Reason.
     - Validation warnings and capability checks.
   - Confirming the modal executes an authenticated Kintone write to App 795 with audit logging.

8. **Fail-Closed Validations:**
   - 0 appraisers configured -> BLOCKED.
   - >4 business slots configured -> BLOCKED.
   - Blank or empty intermediate slot -> BLOCKED.
   - Unknown or inactive Kintone user -> BLOCKED.
   - Duplicate active `Routing_Key` -> BLOCKED.
   - Missing required Team for TMG sections -> BLOCKED.
   - Invalid or past `Effective_From` -> BLOCKED.
   - **Process Capability Guard:** Activating a route requiring G2 (`M1_G1_G2` or `M1_M2_G1_G2`) is **BLOCKED** if App 794 Process Management has not yet deployed the 19-state G2 extension.

9. **Audit Trail Logging:**
   - Every route modification logs an immutable record in an audit storage log:
     - `Changed_By`: HR Admin user code.
     - `Changed_At`: Current ISO timestamp.
     - `Business_Reason`: Non-empty mandatory rationale.
     - `Before_Snapshot`: JSON of previous App 795 record.
     - `After_Snapshot`: JSON of updated App 795 record.
     - `Routing_Key` & `Effective_From`.

---

## 10. Future vs In-Flight Change Boundary

To maintain data integrity and prevent race conditions on in-progress evaluations, three separate operational boundaries are enforced:

```
+---------------------------------------------------------------------------------------------------+
| OPERATIONAL BOUNDARIES                                                                            |
+------------------------------------+------------------------------------+-------------------------+
| 1. FUTURE ROUTING CHANGE           | 2. CURRENT RECORD REASSIGNMENT     | 3. BULK REASSIGNMENT    |
| (Routine HR Administration)        | (Exception / Leave / Resignation)  | (Major Reorganization)  |
+------------------------------------+------------------------------------+-------------------------+
| Scope: App 795 Master only         | Scope: Single App 794 record       | Scope: Filtered set     |
| Affects: New / unstarted records   | Affects: 1 in-flight record        | Affects: Active records |
| In-flight records: UNTOUCHED       | In-flight record: Updated directly | Preview: Mandatory list |
| Audit: Master Audit Log            | Audit: App 794 Revision / Event    | Audit: Bulk Manifest    |
+------------------------------------+------------------------------------+-------------------------+
```

1. **Future Routing Change (Operation 1):**
   - Updates App 795 master.
   - Applies to future MBO record creation or unstarted stages.
   - **Strict Guarantee:** Does **not** alter existing in-flight records in App 794.

2. **Current Record Reassignment (Operation 2):**
   - Targeted operation for an individual employee whose appraiser is unavailable (e.g. sick leave, resignation).
   - Explicitly updates the snapshot fields in that single App 794 record.
   - Requires an explicit reason and logs an event in the App 798 Revision Archive.

3. **Bulk Pending Reassignment (Operation 3):**
   - High-impact operational tool for department re-organizations.
   - Requires selecting the target App 795 route and reviewing a mandatory preview list of affected pending App 794 records.
   - Requires two-factor confirmation (typing confirmation phrase) before executing batch updates.

---

## 11. Stage Snapshot Behavior

App 794 enforces a **Stage Snapshot Architecture**:

1. **Active Stage Immutability:**
   - When a stage begins (e.g. `01 Draft Objective`), the resolved approvers are snapshotted into App 794 record fields (`Manager_Level1_Approvers`, `GM_Level1_Approvers`, etc.).
   - During the active stage, the route is immutable. Routine changes in App 795 do not alter the current active stage.

2. **Stage Refresh Rules:**
   - When transitioning from Stage 1 (`05 Objective Approved`) to Stage 2 (`06 Employee Mid-Year`), or from Stage 2 (`10 Mid-Year Completed`) to Stage 3 (`11 Employee Self Evaluation`), the system can optionally check App 795 for newly effective routing rules.
   - If an updated route is effective, the record snapshot refreshes for the new stage.

3. **Completed Stage History Immutability:**
   - Completed stage data, previous approver identities, timestamps, and comments are permanently immutable.
   - No retroactive route changes are ever permitted on completed stages.

---

## 12. Security & Authorization Design

Client-side UI checks do **not** constitute the security boundary. The native Kintone authorization architecture is defined as follows:

1. **Role-Based Access Control:**

| Role / Principal | View Routing (App 795) | Edit Routing (App 795) | Single Record Reassignment | Bulk Reassignment |
|---|---|---|---|---|
| **HR Administrator** (`HR_ADMIN_GROUP`) | **YES** | **YES** | **YES** | **YES** (with 2FA confirmation) |
| **Employee / Approver** | NO (View own MBO only) | NO | NO | NO |
| **Technical Admin** (`admin-form`, `Administrator`) | YES (Diagnostic read) | NO (Business route locked) | NO | NO |

2. **Isolation of Technical Admin:**
   - In accordance with established project governance, `admin-form` and `Administrator` have **zero** business HR routing authority. They cannot add, edit, or approve business routes.
   - Routine administration is strictly reserved for authenticated members of `HR_ADMIN_GROUP`.

---

## 13. Scoring vs Workflow Appraiser Count Analysis (Mandatory Item)

A critical architectural distinction exists between **Workflow Routing** and **Scoring Calculation**:

1. **Authority Audit (`DEC-036` & `BUSINESS_RULES.md`):**
   - Section 2 of `project-docs/BUSINESS_RULES.md` establishes:
     > *"Layer Separation: Appraiser Weight (Layer 1) is completely decoupled from Part A / Part B Weight (Layer 2) and workflow routing."*
   - In `DEC-036`, $K_{\text{expected}}$ is defined exclusively as:
     - $K_{\text{expected}} = 1 \implies 100\%$ (Appraiser 1)
     - $K_{\text{expected}} = 2 \implies 50\%$ / $50\%$ (Appraiser 1 & Appraiser 2)
   - The completeness gate strictly asserts: $K_{\text{valid}} == K_{\text{expected}}$.

2. **Schema Audit of App 794:**
   - App 794 possesses evaluation rating fields **only** for 2 evaluators:
     - `Manager_Achievement_1..10`, `Manager_Objective_Score_1..10`, `Manager_Comment_1..10`
     - `GM_Achievement_1..10`, `GM_Objective_Score_1..10`, `GM_Comment_1..10`
   - App 794 has **zero schema fields** for Appraiser 3 or Appraiser 4 ratings or comments.

3. **Determination:**
   - Workflow routing now allows up to 4 sequential business approvers (`DECISION-D3-001`).
   - However, repository authority does **not** define scoring formulas, weights, or schema fields for Appraisers 3 and 4.
   - Therefore, in D3 V1, Appraisers 3 and 4 function as **workflow approval/endorsement-only evaluators**, while scoring remains governed by the 1-appraiser or 2-appraiser profile under `DEC-036`.
   - Any expansion of scoring to 3 or 4 appraisers requires an explicit Owner Decision, schema expansion on App 794, and revision of `DEC-036`.

```text
SCORING_ROUTING_RELATIONSHIP = OWNER_DECISION_REQUIRED
```

---

## 14. Implementation Gap Register

| Domain | Current State | Target State | Change Required | Risk | Test Required | Decision Required |
|---|---|---|---|---|---|---|
| **Process Management** | 16 states / 28 actions; G2 missing; M1_ONLY direct bypass missing | 19 states / 40 actions; G2 states added; M1_ONLY bypass added | Add 3 states, 12 actions, update 6 filters in App 794 PM | Low (additive) | Process transition test suite (19 states) | NO (Derives from DECISION-D3-001) |
| **Validation Engine** | Blocks G2 with `G2 UNSUPPORTED CONFIGURATION ERROR` | Permits G2 when PM is updated to 19 states | Update `src/validation/validation-engine.js` G2 guard | Low | Unit tests for all 5 topologies | NO |
| **Routing Service** | Throws `NO_REMAINING_NON_SELF_APPROVER`; default topology fallback logic | Throws `SELF_APPROVAL_ROUTE_CONFLICT`; derives M1_ONLY cleanly | Reconcile error name and 1-slot resolution in `src/services/routing-service.js` | Very Low | Self-appraiser unit tests | NO |
| **App 794 Fields** | Has `GM_Level2_Approvers`, lacks legacy G2 alias | Preserves `GM_Level2_Approvers` as native G2 assignee | Map `GM_Level2_Approvers` as FIELD_ENTITY in Process Management | Low | Field assignment test | NO |
| **App 795 Master** | Current active rows are M1_G1 | Supports all 5 topologies via self-service UI | Enable HR editing of 1–4 slots in App 795 | Medium | Master CRUD & query tests | NO |
| **HR Dashboard** | No routing management UI in App 800 | Full Self-Service Routing Management Module in App 800 | Create `src/ui/hr-routing-manager.js` and integrate into App 800 | Medium | UI interaction & preview tests | NO (Owner mandated) |
| **Audit Logging** | No dedicated routing change audit log | Dedicated audit log for App 795 modifications | Log route changes with Before/After JSON snapshots | Low | Audit record verification | NO |
| **Security / Auth** | App 800 has basic view check | Server/Native Kintone ACL restricts App 795 edit to HR_ADMIN_GROUP | Configure App 795 App/Record ACLs | Low | Unauthorized write deny test | NO |
| **Scoring Governance** | DEC-036 defines K=1 and K=2 only; App 794 has 2 rating columns | Unresolved whether Appraiser 3/4 ever score | Keep Appraiser 3/4 as approval-only in D3 V1 | High (if changed) | Regression tests for DEC-036 | **YES (Owner Decision)** |

---

## 15. Migration & Rev 70 Compatibility Plan

1. **Additive Process Management Migration:**
   - The extension from 16 to 19 states is **100% additive**.
   - Existing state names (`01` through `16`) remain byte-identical.
   - Existing `M1_G1` records currently in any state (`01` to `16`) can continue to transition through existing action buttons without disruption.

2. **Zero Data Backfill Required:**
   - Existing records retain their frozen snapshots.
   - No historical records require modification or backfilling.

3. **Rollback Strategy:**
   - If an issue arises with the 19-state Process Management deployment, restoring `scratch/app794-pm-prewrite-backup.json` (16 states) returns App 794 to Revision 70 baseline immediately.

4. **Preflight Checklist for Future Deployment:**
   - [ ] Validate App 794 preview status.
   - [ ] Verify `GM_Level2_Approvers` field exists in App 794 schema.
   - [ ] Deploy 19-state Process Management to preview.
   - [ ] Run automated workflow validation (`validateWorkflowPayload`).
   - [ ] Execute smoke test on test records.
   - [ ] Publish Process Management to live environment.

---

## 16. Test Design Suite (Future Implementation Verification)

*Note: In accordance with D3-WP001 bounds, no test execution is performed in this work package.*

1. **Topology Test Matrix:**
   - Test 1: `M1_ONLY` across Objective, Mid-Year, Final (Verify 1 appraiser completes to Approved).
   - Test 2: `M1_G1` across Objective, Mid-Year, Final (Verify regression: identical to Rev 70).
   - Test 3: `M1_M2_G1` across Objective, Mid-Year, Final (Verify M2 -> M1 -> G1 sequential flow).
   - Test 4: `M1_G1_G2` across Objective, Mid-Year, Final (Verify M1 -> G1 -> G2 sequential flow).
   - Test 5: `M1_M2_G1_G2` across Objective, Mid-Year, Final (Verify all 4 steps in sequence).

2. **Self-Appraiser Elision Matrix:**
   - Test 6: Self in Slot 1 -> elides, compacts to 1..3 surviving slots.
   - Test 7: Self in Slot 2 -> elides, compacts.
   - Test 8: Self in Slot 3 -> elides, compacts.
   - Test 9: Self in Slot 4 -> elides, compacts.
   - Test 10: Self in multi-user slot -> removes user identity only, slot survives.
   - Test 11: Self in all slots (0 survivors) -> **Fails closed with `SELF_APPROVAL_ROUTE_CONFLICT`**.

3. **Negative & Guard Tests:**
   - Test 12: Unknown topology string -> fails closed.
   - Test 13: G2 topology submitted before Process Management deployment -> blocked by ValidationEngine.
   - Test 14: Gap in route configuration (Slot 1 & Slot 3 filled, Slot 2 empty) -> blocked by HR Dashboard validation.
   - Test 15: Unauthorized user attempts to edit App 795 -> denied.

4. **HR Dashboard Self-Service Tests:**
   - Test 16: Add, edit, remove, reorder approvers in UI.
   - Test 17: Topology auto-derivation matches slot count.
   - Test 18: Preview modal shows exact before/after diff.
   - Test 19: Save commits to App 795 and creates audit log.
   - Test 20: Future route change does not alter in-flight App 794 record.

---

## 17. Design Recommendations & Architecture Verdict

```text
RECOMMENDED_PROCESS_MODEL = ADDITIVE_19_STATE_EXTENSION
RECOMMENDED_STATE_COUNT = 19
RECOMMENDED_ACTION_COUNT = 40
RECOMMENDED_3_SLOT_CANONICAL_MAPPING = M1_M2_G1 (Default Standard) / M1_G1_G2 (Executive)
HR_DASHBOARD_ROUTING_MODEL = APP800_INTEGRATED_SELF_SERVICE_MODULE
SCORING_ROUTING_RELATIONSHIP = OWNER_DECISION_REQUIRED (Appraisers 3/4 Approval-Only in D3 V1)
MIGRATION_STRATEGY = ZERO_BACKFILL_ADDITIVE_DEPLOYMENT
```

### Unresolved Owner Decisions (Clear & Bounded):

1. **`OWNER-DEC-D3-003` (Scoring Role of Appraisers 3 and 4):**
   - *Option A (Recommended for D3 V1):* Appraisers 3 and 4 are **workflow approval-only** evaluators. Scoring remains strictly governed by `DEC-036` ($K=1$ or $K=2$). Zero schema changes to App 794 evaluation columns.
   - *Option B (Future Expansion):* Expand App 794 schema to add rating columns for Appraisers 3 and 4 (`First_Manager_Achievement`, `GM2_Achievement`), and revise `DEC-036` weighting layers ($K=3, 4$). Requires schema deployment and formula recalculations.

2. **`OWNER-DEC-D3-004` (Audit Trail Storage for HR Routing Changes):**
   - *Option A (Recommended):* Store routing change audit logs in an dedicated `Audit_Log` field (JSON array) or a separate lightweight Kintone Audit App.
   - *Option B:* Store audit snapshots in existing `App 798 (Revision Archive)` with a new `Event_Type = "ROUTING_MASTER_UPDATED"`.

---

## 18. Next Gate

- **Active State:** Work package `D3-WP001` design execution complete.
- **Next Permitted Action:** `CONTROL_PLANE_REVIEW_OF_D3_WP001` (Independent review by ChatGPT Control Plane).
- **Execution Invariant:** Antigravity does **not** self-certify closure. No implementation code (`src/`), Kintone writes, test runs, or deployments are authorized until explicit Owner and Control Plane approval.
