# Annual Evaluation Cycle Architecture Blueprint

> **Document Status:** Active (Confirmed Requirement)  
> **Core Principle:** Single Long-Lived Application Across All Fiscal Years (Zero Hardcoded Year Logic)  
> **Last Updated:** 2026-08-23  

---

## 1. High-Level Concept: One Long-Lived Application

The MBO V2 system operates as **one unified, long-lived transaction application (App 794)** for all corporate fiscal years. When a new fiscal year begins (e.g. FY2027, FY2028), HR and Developers **NEVER**:
- Create a new Kintone App
- Copy apps or recreate fields
- Modify JavaScript date/year strings
- Rebuild workflows or create year-specific views
- Manually create employee records one-by-one

```mermaid
graph TD
    CYCLE[App 798: Evaluation Cycle Master] -->|Dynamic Resolution| ENGINE[Annual Cycle Engine]
    EMP[App 53: Employee Master] -->|Active Employees| ENGINE
    
    subgraph Generation [Hybrid Record Generation Strategy]
        ENGINE -->|Batch Opening| BATCH[Batch Annual Generation]
        ENGINE -->|New Hire Trigger| LAZY[Lazy / On-Demand Generation]
    end

    BATCH -->|Idempotent Insert| TRANS[App 794: Unified MBO Core]
    LAZY -->|On-Demand Insert| TRANS

    subgraph Records [Multi-Year Transactions]
        TRANS --> R1[FY2026-0149 (Historical Snapshot)]
        TRANS --> R2[FY2027-0149 (Active Evaluation)]
        TRANS --> R3[FY2028-0149 (Upcoming Cycle)]
    end
```

---

## 2. Evaluation Cycle Master (Conceptual App 798 Schema)

| Field Code | Type | Description | Example Value |
| :--- | :--- | :--- | :--- |
| `Cycle_Code` | SINGLE_LINE_TEXT | Unique Cycle Code (PK) | `CYC_FY2026`, `CYC_FY2027` |
| `Fiscal_Year` | SINGLE_LINE_TEXT | Fiscal Year Identifier | `FY2026`, `FY2027` |
| `Cycle_Name_TH` | SINGLE_LINE_TEXT | Thai Cycle Name | `รอบการประเมินผลการปฏิบัติงาน ประจำปี 2026` |
| `Cycle_Name_EN` | SINGLE_LINE_TEXT | English Cycle Name | `Annual Performance Appraisal Cycle FY2026` |
| `Start_Date` | DATE | Cycle Start Date | `2026-04-01` |
| `End_Date` | DATE | Cycle End Date | `2027-03-31` |
| `Objective_Start` | DATE | Objective Submission Open | `2026-04-01` |
| `Objective_End` | DATE | Objective Submission Deadline | `2026-05-15` |
| `MidYear_Start` | DATE | Mid-Year Review Open | `2026-09-15` |
| `MidYear_End` | DATE | Mid-Year Review Deadline | `2026-10-31` |
| `Final_Start` | DATE | Final Evaluation Open | `2027-02-15` |
| `Final_End` | DATE | Final Evaluation Deadline | `2027-03-25` |
| `HR_Close_Start` | DATE | HR Calibration Open | `2027-03-26` |
| `HR_Close_End` | DATE | HR Calibration Close | `2027-04-10` |
| `Status` | DROP_DOWN | Lifecycle Status | `UPCOMING`, `OPEN`, `CLOSED` |
| `Active` | RADIO_BUTTON | Active Flag | `Active` |

---

## 3. Dynamic Current Cycle Resolution Flow

The system resolves the active cycle dynamically without year hardcoding:

```
Current Timestamp + Active Master Records
                  |
                  v
[Evaluation Cycle Master Query]
 └── Condition: `Status in ("OPEN") and Active in ("Active")`
 └── Filters by current date range: `Start_Date <= TODAY <= End_Date`
                  |
                  v
Returns: Current Cycle (`Cycle_Code: "CYC_FY2026"`, `Fiscal_Year: "FY2026"`)
```

* **System-Controlled Field:** The Employee never selects or edits the Fiscal Year. It is displayed as `[System Data]` to eliminate accidental cross-year submission errors.

---

## 4. Hybrid Generation Strategy (Batch + Lazy Creation)

1. **Strategy A: Batch Annual Generation (When HR Opens Cycle):**
   * HR sets `Status = "OPEN"` in App 798.
   * Batch process reads all Active Employees from App 53.
   * Resolves Position -> Evaluation Profile -> Scoring Config -> Routing Master.
   * Generates MBO records in App 794 with Record Key `{Cycle_Code}-{Employee_Code}` (e.g. `FY2026-0149`).
   * **Idempotency Guard:** If `{Cycle_Code}-{Employee_Code}` already exists, the generator skips creation to prevent duplication.

2. **Strategy B: Lazy / On-Demand Generation (For Mid-Year Hires):**
   * When a new employee who joined after the cycle opening logs in or is looked up:
   * System detects that `{Current_Cycle}-{Employee_Code}` does not exist yet.
   * Automatically executes on-demand resolution and initializes the MBO record seamlessly.

---

## 5. Generic Multi-Year Views Architecture

Instead of creating year-specific views (e.g., `View FY2025`, `View FY2026`), the system provides generic, future-proof views:

| View Name | Filter Criteria | Target Audience |
| :--- | :--- | :--- |
| **My Current MBO** | `Fiscal_Year in (CURRENT_CYCLE) and Requester_User in (LOGIN_USER)` | Employee |
| **Pending My Approval** | `Assignee in (LOGIN_USER) and Status not in ("05 Objective Approved", "10 Mid-Year Completed", "16 Completed")` | Managers / GM / VP |
| **Current Cycle Section Overview** | `Fiscal_Year in (CURRENT_CYCLE) and Employee_Section in (MY_SECTIONS)` | Managers / GM |
| **HR Calibration Dashboard** | `Fiscal_Year in (CURRENT_CYCLE)` | HR Administrators |
| **My Evaluation History** | `Requester_User in (LOGIN_USER) order by Fiscal_Year desc` | Employee |
