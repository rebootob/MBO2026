# Generic Approval Routing Architecture Blueprint (Native Kintone Dual-Status Engine)

> **Document Status:** Complete (Corrected for Native Kintone Process Management Constraints)  
> **Core Architecture:** Twin-Status Execution Engine (`Step N - ALL` / `Step N - ANY`) via Server-Side `filterCond`  
> **Slot Capacity:** `GENERIC_APPROVAL_SLOT_CAPACITY = 6` + Dedicated `HR_FINAL_CHECK`  
> **Last Updated:** 2026-08-24  

---

## 1. The Native Kintone Assignee Constraint & The Twin-Status Engine

### The Technical Limitation in Kintone Process Management
In Kintone's native Process Management API:
* The **Assignee Type** (`ALL` vs `ANY` vs `ONE`) is a **static property of the Process Status configuration**, not a dynamic property of individual records.
* While the assignees themselves can be dynamically assigned per record via `FIELD_ENTITY` (`Step_N_Approvers`), a single native status cannot dynamically switch between `ALL` and `ANY` on the fly.

### The Architectural Solution: Twin Execution Statuses with Native `filterCond` Branching
To achieve 100% native server-side security without relying on client-side JavaScript hiding:
1. Each Generic Slot ($N \in [1..6]$) is implemented as two paired native statuses:
   - **`Step N - ALL`:** Native Assignee Type = `ALL`, Assignee Entity = `FIELD_ENTITY (Step_N_Approvers)`.
   - **`Step N - ANY`:** Native Assignee Type = `ANY`, Assignee Entity = `FIELD_ENTITY (Step_N_Approvers)`.
2. Process Actions branching into Slot $N$ use native Kintone **`filterCond`**:
   - `Step_N_Rule = "ALL"` -> Destination: `Step N - ALL`
   - `Step_N_Rule = "ANY"` -> Destination: `Step N - ANY`
3. **Security Guarantee:** Only the applicable native action is rendered server-side by Kintone. JavaScript is strictly used for cosmetic UX labeling, never for security filtering.

```mermaid
graph TD
    DRAFT["01 Draft Objective"] -->|Action: Submit (filterCond: Step_1_Rule = 'ALL')| S1_ALL["Step 1 - ALL <br/> (Native Assignee Type: ALL)"]
    DRAFT -->|Action: Submit (filterCond: Step_1_Rule = 'ANY')| S1_ANY["Step 1 - ANY <br/> (Native Assignee Type: ANY)"]
    
    S1_ALL -->|Approve (filterCond: Step_2_Rule = 'ALL' & Step_2_Active = 'YES')| S2_ALL["Step 2 - ALL"]
    S1_ALL -->|Approve (filterCond: Step_2_Rule = 'ANY' & Step_2_Active = 'YES')| S2_ANY["Step 2 - ANY"]
    S1_ANY -->|Approve (filterCond: Step_2_Rule = 'ALL' & Step_2_Active = 'YES')| S2_ALL
    S1_ANY -->|Approve (filterCond: Step_2_Rule = 'ANY' & Step_2_Active = 'YES')| S2_ANY
```

---

## 2. Standardized Slot Capacity (6 Slots + Dedicated HR)

* **Legacy Maximum Approval Depth:** 5 Steps (Observed in App 307).
* **Final Architectural Standard:** **`GENERIC_APPROVAL_SLOT_CAPACITY = 6`**.
* **Future Reserve:** 1 Extra Generic Slot (Accommodates mentor/trainee roles without any schema changes).
* **Prohibited:** Creating Slots 7 or 8 without documented business justification.
* **HR Final Check:** Configured as a **Dedicated Stage** (`HR_FINAL_CHECK`) following the approval of all business steps in the Final Evaluation stage.

---

## 3. Total Native Process Status Capacity

| Evaluation Stage | Initial State | Twin Approval Slots (1 to 6) | Dedicated End States | Total Statuses per Stage |
| :--- | :---: | :---: | :---: | :---: |
| **Objective Setting** | 1 (`01 Draft Objective`) | 12 (6 Slots * 2 [ALL/ANY]) | 1 (`Objective Approved`) | **14** |
| **Mid-Year Review** | 1 (`Mid-Year Input`) | 12 (6 Slots * 2 [ALL/ANY]) | 1 (`Mid-Year Approved`) | **14** |
| **Final Evaluation** | 1 (`Self Evaluation Input`) | 12 (6 Slots * 2 [ALL/ANY]) | 2 (`HR Final Check`, `Completed`) | **15** |
| **System Terminal** | - | - | 2 (`Cancel`, `Resign`) | **2** |
| **Grand Total** | | | | **45 Native Statuses** |

*Analysis:* 45 clean, normalized statuses in a single unified app replaces the 384 fragmented actions of legacy App 283 and supports 100% of all company routing families.

---

## 4. Controlled Stage Route Refresh Architecture

* **In-flight Immutability:** While an evaluation stage is active/in-progress, the Route Snapshot is **strictly frozen**.
* **Controlled Refresh Before New Stage:**
  - If an employee transfers sections or gets a new supervisor mid-year:
  - HR Administrator executes a formal **"Refresh Routing Snapshot"** before Mid-Year or Final stage opens.
  - The system freshly resolves App 795, updates the transaction snapshot, and logs the change in `Routing_Revision_Log` (`Old Route`, `New Route`, `Reason`, `Timestamp`, `HR User`).
  - Historical completed stages (e.g. Objective Setting) remain permanently untouched.
