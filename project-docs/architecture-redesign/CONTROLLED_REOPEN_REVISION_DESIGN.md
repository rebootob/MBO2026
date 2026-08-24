# Controlled Reopen & Business Revision Core Architecture (FROZEN)

> **Architecture Status:** **`CONTROLLED_REOPEN_REVISION_MODEL = FROZEN`** & **`SAME_RECORD_NEW_REVISION = FROZEN`**  
> **Core Principle:** 1 Employee + 1 Fiscal Year = 1 MBO Transaction Record (`FY2027-0149`)  
> **Anti-Duplication Rule:** NEVER duplicate Kintone records (Strictly NO `FY2027-0149-R2`, `-COPY`, `-NEW`)  
> **Governance:** First-Class Core System Subsystem (Integrated with Annual Profile Freeze, Generic Routing, and Hoshin Snapshots)  
> **Last Updated:** 2026-08-24  

---

## 1. Reopen Authority & Action Governance Matrix

| Persona | Return for Correction (In-Flight) | Request Reopen (Post-Approval) | Execute Controlled Reopen | Exceptional Reopen (Closed Record) |
| :--- | :---: | :---: | :---: | :---: |
| **Employee / Requester** | N/A (Receives return) | YES (Requests via HR) | NO | NO |
| **Current Approver (Pending)** | **YES (Same Revision)** | N/A | NO | NO |
| **Previous Approver (Already Approved)**| NO | **YES (Requests via HR)** | NO | NO |
| **HR Administrator** | YES | YES | **YES (Increments Revision)**| **YES (Logged Exceptional)** |
| **IT / System Administrator** | NO | NO | NO (Tech Admin Only) | NO (Audit Only) |

---

## 2. Revision Creation Trigger & Lifetime Rules

1. **Draft Editing:** Saving changes in `01 Draft Objective` -> **Same Revision (`Rev 1`)**.
2. **Return Before Approval:** Current approver returns draft for in-cycle correction -> **Same Revision (`Rev 1`)**.
3. **Reopen After Approval:** HR reopens approved business data for correction -> **NEW REVISION (`Rev 1 -> Rev 2`)**.
4. **Record Key Immutability:** Primary Kintone `Record_Key` remains strictly `FY2027-0149` across all revisions.

---

## 3. Subsystem Interactions During Reopen

### A. Evaluation Profile Behavior During Reopen (Annual Profile Freeze)
* **Rule:** Reopening an evaluation stage **NEVER changes the Evaluation Profile**.
* **Example:** `FY2027-0149` starts under `STAFF_CHIEF_V1` (70/30). Reopening Objective Setting in June creates Revision 2. **Revision 2 strictly continues using `STAFF_CHIEF_V1` (70/30)**. Mid-year promotions take effect in the subsequent Fiscal Year (`FY2028`), not upon reopen.

### B. Routing Behavior During Reopen
* **Rule:** If the original approver is still active and valid, the existing stage route applies. If the approver has resigned or transferred, HR applies **Controlled Route Refresh** or **In-Flight Reassignment**. Reopening never causes silent approver changes.

### C. Hoshin Snapshot Behavior During Reopen
* **Historical Revision 1:** Permanently preserves its original Hoshin reference (e.g. Section Hoshin V1).
* **Current Revision 2:** Resolves the currently published Ready Hoshin version applicable at the moment Revision 2 is submitted. Historical snapshots are never overwritten.

---

## 4. Approval Invalidation & Historical Preservation

```mermaid
graph TD
    subgraph Historical_Archive [Revision 1 (Immutable Historical Archive)]
        A1["Manager A: APPROVED (2027-05-10)"]
        G1["GM X: APPROVED (2027-05-15)"]
        S1["Part A Score: 42.50 / Comments Preserved"]
        STATUS1["Status: HISTORICAL / SUPERSEDED"]
    end

    subgraph Current_Working_State [Revision 2 (Current Working Transaction)]
        A2["Manager A (or B if transferred): PENDING"]
        G2["GM X: PENDING"]
        S2["Part A Score: Recalculated from Rev 2 Inputs"]
        STATUS2["Status: CURRENT / IN-PROGRESS"]
    end

    A1 -.->|Invalidated for Rev 2| A2
    G1 -.->|Invalidated for Rev 2| G2
```

1. **Historical Evidence Preservation:** Revision 1 data (Objectives, weights, difficulties, ratings, comments, scores, approvers, timestamps) is permanently preserved in the Archive App.
2. **Approval Invalidation:** When Revision 2 modifies approval-relevant data, Revision 1 approvals become `SUPERSEDED_BY_REVISION_2` and are **`INVALID FOR CURRENT REVISION`**. All affected approvers must formally re-evaluate and approve Revision 2.
3. **Score Calculation & Dashboard Integrity:** Current calculations, reports, and HR Dashboard metrics evaluate strictly the **Latest Valid Current Revision**. Historical revisions are never counted as duplicate records.
4. **Annual Plan Carry Forward:** Carry Forward into subsequent years pulls planning data strictly from the **Latest Valid Revision** of the historical year.

---

## 5. Reopen Audit Event Schema (`EVALUATION_REVISION_CREATED`)
Every reopen operation permanently logs:
* `Record_Key`, `Fiscal_Year`, `Employee_Code`, `Evaluation_Stage`
* `Old_Revision`, `New_Revision`
* `Old_Status`, `New_Status`
* `Reopen_Target` (e.g. `OBJECTIVE_WEIGHT_CORRECTION`)
* `Reason` (Documented business rationale)
* `Requested_By` (Approver / Employee / HR)
* `Executed_By` (HR Administrator User Code)
* `Reopened_At` (Timestamp)
