# TTMET MBO & Performance Management Business Rules (MBO V2)

> **Document Status:** Active (Confirmed Standards)  
> **Last Updated:** 2026-08-23  

---

## 1. Evaluation Groups & Weight Splits

| Evaluation Group / Profile | Target Positions | Part A Weight | Part B Weight | Status |
| :--- | :--- | :---: | :---: | :---: |
| **Staff & Chief** | Staff, Chief, Officer, Senior Staff | **70%** | **30%** | **CONFIRMED** |
| **Japanese Staff** | Expatriate / Japanese Staff | **70%** | **30%** | **CONFIRMED** |
| **Assistant Manager** | Assistant Manager, Specialist | **50%** | **50%** | **CONFIRMED** |
| **Section Manager** | Section Manager | **50%** | **50%** | **CONFIRMED** |
| **Senior Manager** | Senior Manager | **50%** | **50%** | **CONFIRMED** |
| **Deputy General Manager** | Deputy General Manager (DGM) | **50%** | **50%** | **CONFIRMED** |
| **General Manager** | General Manager (GM) | **50%** | **50%** | **CONFIRMED** |
| **Vice President** | Vice President (VP) | **50%** | **50%** | **CONFIRMED** |

---

## 2. COCE / Compliance Governance
* **Evaluated:** **YES** (1-5 rating collected for employee review & compliance monitoring)
* **Included in Score:** **NO** (Excluded from Part B Sum, Part B Divisor, and Final Score calculation)
* **Configuration Property:** `Included_In_Score = false`

---

## 3. Annual Evaluation Cycle & Long-Lived App Core
* **Single Core App:** App 794 handles all fiscal years.
* **1 Employee = 1 Record per Cycle:** Record Key format `{Cycle_Code}-{Employee_Code}` (e.g. `FY2026-0149`, `FY2027-0149`).
* **Dynamic Resolution:** Current Cycle resolved from Evaluation Cycle Master + Current Date; zero hardcoded years in application logic.
* **Hybrid Generation:** Batch opening for active employees + Lazy creation for mid-year hires.

---

## 4. Annual Plan Carry Forward Governance
* **Core Principle:** Never Clone Entire Record. Only copy allowed planning fields via Strict Whitelist (`Objective`, `Action_Plan`, `Additional_Agreement`, `Weight`).
* **Difficulty Default:** `Carry_Forward_Difficulty = false` (User sets difficulty in current FY).
* **Isolation Guarantee:** Zero copying of scores, appraiser ratings, internal comments, COCE ratings, workflow status, approval timestamps, old approvers, or old snapshots.
* **Configuration Supremacy:** Target FY resolves fresh Profile, Weights, and Routing. If promoted (e.g. Staff -> Asst Mgr), Target 50/50 profile applies.
* **Workflow Boundary:** Allowed ONLY in `NEW_RECORD` or `01 DRAFT OBJECTIVE`. Disabled once workflow starts.

---

## 5. Artifact Lifecycle & Cleanup Governance
* **Zero Dead Artifacts:** Any replaced field, script, or routing model must be fully migrated, tested, and removed.
* **Single Source of Truth:** No parallel competing models in active production/sandbox apps.
* **Definition of Done:** Requires complete cleanup of replaced references, 0 orphan artifacts, and synchronized documentation.

---

---

---

## 6. Hoshin Final Governance (Dual-Level & Immutability)
* **Dual-Level Mandate (AND Condition):** Objective Submission requires BOTH Department Hoshin (`Ready = YES`) AND Section Hoshin (`Ready = YES`). If either is missing, submit is blocked with a specific error message.
* **Ready Immutability:** Active ready versions cannot be edited directly; revisions require creating a new version.
* **Single Active Version:** Exactly one active ready version allowed per FY and Scope unit. Old versions transition to Superseded state.
* **No Workflow:** Direct HR management without Process Management.

---

## 7. Generic Routing Architecture (FROZEN)
* **Twin-Status Engine:** Supports both `ALL` and `ANY` rules natively via twin statuses (`Step N - ALL` / `Step N - ANY`) and native `filterCond` branching.
* **Standard Capacity:** Exactly 6 Generic Approval Slots + Dedicated HR Final Check (45 Native Statuses total).
* **Identity Separation:** Requester Authorization, Scoring Appraiser, and Workflow Approver are governed independently.
* **Controlled Route Refresh:** In-flight stages are locked. Stage refresh on transfer requires HR action and audit logging.

---

## 8. In-Flight Approver Reassignment Governance (FROZEN)
* **Dual-Mode Management:** Stage Refresh (before new stage) vs In-Flight Reassignment (during active stage).
* **Current Record Only:** Reassignment applies strictly to current record via native API without altering Master.
* **Historical Immutability:** Completed evaluation stages are permanently locked.
* **Mandatory Audit Trail:** All reassignments require business reason and audit logging.


---

## 9. Approver Change Operational Rules (FROZEN)
* **Three Scopes:** Future Routing Change, Current Record Reassignment, Future Routing + Bulk Pending Reassignment.
* **Draft Record:** Resolves current Master upon submission.
* **Pending Record:** Requires explicit HR reassignment with reason; Master change alone does not alter in-flight records.
* **HR Self-Service:** $\ge 95\%$ routine routing administration handled by HR without IT intervention.

---

## 10. One MBO Record Per FY & Same Record Revision (FROZEN)
* **Identity Rule:** 1 Employee + 1 Fiscal Year = 1 MBO Record (`FY2027-0149`).
* **No Duplicate Records:** Reopen uses same record with incremented stage revision counter (`Objective_Revision: 2`). Never duplicate records.
* **Historical Immutability:** Superseded revisions are archived immutably (Option C Hybrid Model).
* **Single Counting:** Dashboard KPIs count exactly 1 evaluation per employee per FY.


---

## 11. Evaluation Profile & Scoring Architecture (Ready for Freeze)
* **Weights:** Staff/Japan (70/30), All Management & Exec (50/50).
* **COCE Rule:** Evaluated = YES, Included_In_Score = NO.
* **Scoring Engine:** Parameterized `WEIGHTED_PART_A_B` with dynamic denominator.
* **Rounding:** Standard Half-Up to 2 decimal places (`0.01`).
* **Objective Limits:** Min 2, Max 10, Total Active Weight = 100%.


---

## 12. Annual Evaluation Profile Freeze Policy (CONFIRMED)
* **Annual Immutability:** Profile resolved at FY start is locked for the entire fiscal year.
* **Mid-Year Promotion:** Current FY retains starting profile; promoted profile applies in next FY.
* **Separation of Concerns:** Profile = Annual Snapshot (Criteria), Routing = Stage Snapshot (Approvers).


---

## 13. HR Control Center & Guided Workflow UX Architecture
* **HR Control Center:** Unified monitoring, exception management, and administrative self-service hub (>= 95% IT independence).
* **Alert Hierarchy:** Critical (Blocker), Action Required (Gate), Warning (Overdue), Information (Milestone).
* **Guided Workflow UX:** 5 Core Principles (What, Who, Why, Next, Where) with plain language status and context-aware action bars.

