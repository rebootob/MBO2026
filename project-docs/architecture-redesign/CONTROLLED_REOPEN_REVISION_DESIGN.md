# Controlled Reopen & Business Revision Architecture (FROZEN)

> **Architecture Status:** **`SAME_RECORD_NEW_REVISION = FROZEN`**  
> **Core Principle:** 1 Employee + 1 Fiscal Year = 1 MBO Transaction Record (`FY2027-0149`)  
> **Anti-Duplication Rule:** NEVER duplicate Kintone records (No `FY2027-0149-R2`, `-COPY`, `-NEW`)  
> **Revision Mechanism:** Same Record + New Business Revision (`Objective_Revision`, `MidYear_Revision`, `Final_Revision`)  
> **Last Updated:** 2026-08-24  

---

## 1. Core Principles & Record Identity Integrity

1. **One MBO Record Per Employee Per Fiscal Year:**
   - Every employee has exactly one primary transaction record in App 794 per cycle: `Record_Key = {Fiscal_Year}-{Employee_Code}` (e.g. `FY2027-0149`).
   - The `Record_Key` is immutable and **NEVER changes** upon reopen.
2. **Same Record, New Revision:**
   - Reopening an approved evaluation stage increments the revision counter for that stage (e.g. `Objective_Revision: 1 -> 2`).
   - The primary record remains the single active entity for Kintone Process Management, UI editing, and calculations.
3. **Stage-Specific Revision Isolation:**
   - `Objective_Revision`, `MidYear_Revision`, and `Final_Revision` are tracked independently. Reopening Objective setting does not increment Mid-Year revision unless a downstream dependency cascade is explicitly required by business rules.

```mermaid
graph LR
    subgraph Master_Record [Primary Transaction Record: FY2027-0149 (Immutable Key)]
        R1["Revision 1 <br/> (Approved 2027-05-15) <br/> Status: HISTORICAL / SUPERSEDED"]
        R2["Revision 2 <br/> (Reopened 2027-06-01) <br/> Status: CURRENT / IN-PROGRESS"]
    end

    R1 -->|Reopen Event: EVALUATION_REVISION_CREATED| R2
```

---

## 2. Revision Triggers: Draft vs Return vs Reopen

| Scenario | Prior State | Action / Event | New Revision Created? | Business Impact |
| :--- | :--- | :--- | :---: | :--- |
| **Draft Edit** | `01 Draft Objective` | Employee saves changes | **NO (Same Revision)** | Normal iterative drafting before submission |
| **Return Before Approval** | In-flight Review | Approver clicks Return | **NO (Same Revision)** | In-cycle correction within active approval stage |
| **Reopen After Approval** | `Objective Approved` | HR initiates Reopen | **YES (`Rev 1 -> Rev 2`)** | Invalidate approvals, archive Rev 1, open Rev 2 for edit |

---

## 3. Preservation of Historical Evidence & Approval Invalidation

1. **Historical Immutability:** Revision 1 data (Objectives, Action Plans, Weights, Ratings, Comments, Approvers, Scores, and Timestamps) is permanently archived and cannot be rewritten.
2. **Approval Invalidation on Revision 2:**
   - When Revision 2 is opened to correct approval-relevant data, Revision 1 approvals become `HISTORICAL / SUPERSEDED`.
   - Current approval status resets to `PENDING` for required approvers on Revision 2.
   - Historical approval records remain preserved in the audit log.
3. **Score & Comment History:** Historical scores and qualitative feedback comments remain linked to their respective revision integer. Current calculations and dashboard KPIs always query the `Latest Valid Current Revision`.
4. **Hoshin & Routing Snapshots:** Each revision maintains its own snapshot references (e.g. Rev 1 used Section Hoshin V1; Rev 2 uses Section Hoshin V2).

---

## 4. HR Dashboard & Annual Cycle Metrics Guarantee

* **Single Record Counting:** The HR dashboard and organizational progress metrics evaluate exactly 1 record per employee per FY (`FY2027-0149`).
* **Zero Duplicate KPI Pollution:** Historical revisions are never counted as duplicate employee submissions.
* **Annual Plan Carry Forward:** Carry Forward into subsequent fiscal years always pulls strictly from the `Latest Valid Current Revision` of the historical year.
