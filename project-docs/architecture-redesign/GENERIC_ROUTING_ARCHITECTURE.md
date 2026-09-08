# Generic Approval Routing Architecture Blueprint (DEFERRED FUTURE REFERENCE)

> **Architecture Status:** **`GENERIC_45_STATE_ARCHITECTURE = DEFERRED_FUTURE_ARCHITECTURE_REFERENCE`**
> **D3 V1 Implementation Authority:** **`D3_V1_IMPLEMENTATION_AUTHORITY = EXISTING_TOPOLOGY_VARIABLE_1_TO_4_SEQUENTIAL_APPRAISERS`** (Owner Approved 2026-09-08 via `DECISION-D3-001`)
> **D3 V1 Authorization Status:** **`45_STATE_IMPLEMENTATION_AUTHORIZED_FOR_D3_V1 = NO`**
> **Durable Revision Invariant:** **`SAME_RECORD_NEW_REVISION = FROZEN`** (Unaffected / Preserved)
> **Reference Architecture:** Configuration-driven Twin-Status Execution Engine (`Step N - ALL` / `Step N - ANY`) via Native Kintone `filterCond` (45 Total Native Statuses across 6 Generic Slots + Dedicated HR Final Check)
> **Operational Governance:** HR Self-Service (>= 95% Routine Administration), Three Change Scopes, Three-Layer History, and Same Record Reopen
> **Last Updated:** 2026-09-08 (Reconciled with Owner DECISION-D3-001)

---

## 1. Core Routing Principles (Deferred Reference Architecture & Revision Invariant)

*(Note: Per Owner Decision DECISION-D3-001, Stage D3 V1 executes on the existing topology family with 1–4 sequential appraisers. The 45-state generic twin-status architecture below is preserved as an unexecuted future reference blueprint requiring a separate Owner decision if ever revived. The revision invariant `SAME_RECORD_NEW_REVISION = FROZEN` remains active and unaffected.)*

1. **Configuration-Driven Routing:** All routing logic is strictly data-driven via Routing Master (App 795). Zero hardcoding of Sections, Positions, or Approver IDs in JavaScript.
2. **Three-Dimensional Identity Separation:** Requester Authorization $\neq$ Scoring Appraiser $\neq$ Workflow Approver.
3. **Ordered Business Steps:** Routes are structured into sequential business steps ($[1..6]$) executed in strict order.
4. **Standard Slot Capacity:** Exactly **6 Generic Approval Slots + 1 Dedicated HR Final Check Stage** (Total 45 Native Statuses across Objective, Mid-Year, and Final stages).
5. **Twin-Status Execution Engine:** Due to Kintone's static status-level Assignee Type constraint, each Generic Slot $N$ has paired native statuses (`Step N - ALL` and `Step N - ANY`). Transition branching is 100% server-side enforced via native `filterCond`.
6. **Dynamic Approver Binding:** Assignees are bound per record via `FIELD_ENTITY` (`Step_N_Approvers`).
7. **Default Approval Rule:** Step rule defaults to **`ALL`** (all approvers in the slot must approve). `ANY` is used only when explicitly configured.
8. **Optional Step Bypass & Required Enforcement:** Inactive/empty optional steps are seamlessly bypassed; missing approvers in required steps trigger `ROUTING_CONFIGURATION_ERROR`.
9. **Zero User Route Selection:** Users cannot manually choose routing topologies; routes resolve deterministically from Master.
10. **Completed Stage Immutability:** Completed evaluation stages are historical business evidence and can NEVER be rewritten.
11. **Stage-Specific Route Snapshots:** App 794 captures independent snapshots for `OBJECTIVE`, `MID_YEAR`, and `FINAL` stages.
12. **Same Record / New Revision Rule:** 1 Employee + 1 Fiscal Year = 1 MBO Record. Reopening creates a new business revision under the same `Record_Key` (`FY2027-0149`). Never duplicate records.

---

## 2. Approver Change Operational Rules During Fiscal Year

### A. Three Distinct Operational Scopes
1. **Future Routing Change (Master Change Only):** Updates App 795 with `Effective_From` date. Applies to unstarted drafts, future stages, and new annual records. Does NOT silently move in-flight records.
2. **Current Record Reassignment (In-Flight Single Record):** Reassigns active pending approver for the current transaction record only via Native Kintone REST API. Does NOT alter Routing Master.
3. **Future Routing + Bulk Pending Reassignment:** Updates App 795 AND reassigns selected pending records. **Mandatory Preview UI** displaying affected employees before confirmation.

### B. Draft vs In-Flight Behavior
* **Case 1 (Record in Draft with Requester):** If Manager changes in Master while record is in Draft, employee submission automatically resolves the newly effective Manager. In-flight reassignment is not needed.
* **Case 2 (Record Pending with Manager):** Master change alone does not move the pending record. HR explicitly triggers Reassign Approver with documented business reason.

### C. Three-Layer History Model
* **Layer 1 (Routing Master History):** Answers who was the configured approver for Section during what time range.
* **Layer 2 (Stage Route Snapshot):** Answers what route was bound to this specific MBO stage.
* **Layer 3 (Reassignment Audit Event):** Answers who was originally assigned $	o$ reassigned to $	o$ actually approved by (`APPROVER_REASSIGNED`).

---

## 3. HR Self-Service Target & IT Boundaries

* **HR Self-Service Target $\ge 95\%$:** Routine changes (Manager change, GM change, Effective dates, single/bulk reassignment, history viewing) are 100% executable by HR via Business UI without IT intervention.
* **IT Engagement Trigger (< 5%):** Schema changes, new business roles, exceeding 6 slots, workflow model redesign, or security/integration defects.
