# Generic Approval Routing Architecture Blueprint (FROZEN)

> **Architecture Status:** **`GENERIC_ROUTING_ARCHITECTURE = FROZEN`** (Approved by Solution Architect & Business Analyst)  
> **Core Architecture:** Configuration-driven Twin-Status Execution Engine (`Step N - ALL` / `Step N - ANY`) via Native Kintone `filterCond`  
> **Slot Capacity:** `GENERIC_APPROVAL_SLOT_CAPACITY = 6` + Dedicated `HR_FINAL_CHECK` (45 Total Native Statuses)  
> **Reassignment Governance:** Dual-Mode Management (Mode A: Controlled Stage Refresh, Mode B: In-Flight Reassignment)  
> **Last Updated:** 2026-08-24  

---

## 1. Frozen Core Principles

1. **Configuration-Driven Routing:** All routing logic is strictly data-driven via Routing Master (App 795). Zero hardcoding of Sections, Positions, or Approver IDs in JavaScript.
2. **Three-Dimensional Identity Separation:** Requester Authorization $\neq$ Scoring Appraiser $\neq$ Workflow Approver.
3. **Ordered Business Steps:** Routes are structured into sequential business steps ($[1..6]$) executed in strict order.
4. **Standard Slot Capacity:** Exactly **6 Generic Approval Slots + 1 Dedicated HR Final Check Stage** (Total 45 Native Statuses across Objective, Mid-Year, and Final stages).
5. **Twin-Status Execution Engine:** Due to Kintone's static status-level Assignee Type constraint, each Generic Slot $N$ has paired native statuses (`Step N - ALL` and `Step N - ANY`). Transition branching is 100% server-side enforced via native `filterCond`.
6. **Dynamic Approver Binding:** Assignees are bound per record via `FIELD_ENTITY` (`Step_N_Approvers`).
7. **Default Approval Rule:** Step rule defaults to **`ALL`** (all approvers in the slot must approve). `ANY` is used only when explicitly configured.
8. **Optional Step Bypass & Required Enforcement:** Inactive/empty optional steps are seamlessly bypassed; missing approvers in required steps trigger `ROUTING_CONFIGURATION_ERROR`.
9. **Zero User Route Selection:** Users cannot manually choose routing topologies; routes resolve deterministically from Master.
10. **Dual-Mode Approver Management:**
    - **Mode A (Controlled Stage Route Refresh):** Re-resolves Master before starting a new stage (Mid-Year / Final) on transfer or supervisor changes.
    - **Mode B (In-Flight Approver Reassignment):** HR reassigns active pending approvers during an in-progress stage for the **Current Record Only** via Native REST API (`/k/v1/record/assignees.json`).
11. **Completed Stage Immutability:** Completed evaluation stages are historical business evidence and can NEVER be rewritten.
12. **Stage-Specific Route Snapshots:** App 794 captures independent snapshots for `OBJECTIVE`, `MID_YEAR`, and `FINAL` stages.
13. **Mandatory Audit Logging:** Every reassignment records an immutable `APPROVER_REASSIGNED` event (`Record_Key`, `Stage`, `Step`, `Old_Approver`, `New_Approver`, `Reason`, `User`, `Timestamp`).
14. **No Orphan Policy Active:** App 795 legacy fields remain marked `MIGRATION_CANDIDATE` until full 7-step retirement cleanup during Implementation.
