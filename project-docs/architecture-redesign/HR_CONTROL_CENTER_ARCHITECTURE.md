# HR Control Center & Operations Architecture Blueprint (FROZEN CORE)

> **Document Status:** Complete (Required Core Subsystem)  
> **Core Objective:** Single-Pane-of-Glass Monitoring & HR Self-Service Operations (>= 95% IT Independence)  
> **Governance:** Actionable Monitoring, Guided Workflow UX, Native Security Boundaries  
> **Last Updated:** 2026-08-24  

---

## 1. Executive Summary

In legacy PMS, HR administrators had to inspect hundreds of individual Kintone records across 8 separate apps to identify approval bottlenecks, inactive approvers, unconfigured routings, or pending reopens.

The **HR Control Center (HRCC)** in MBO V2 establishes a unified, single-pane-of-glass operations console that shifts HR administration from reactive manual record inspection to **proactive, exception-driven actionable management**.

```mermaid
graph TD
    subgraph Unified_Data_Core [Unified Data Core (App 794, App 795, App 53, Hoshin App)]
        A794["App 794 (Annual Transactions)"]
        A795["App 795 (Routing Master)"]
        A53["App 53 (Employee Master)"]
        HOSH["Hoshin Master App"]
    end

    Unified_Data_Core --> ENGINE["HRCC Aggregation & Health Engine"]
    
    ENGINE --> DASH["1. Overview Dashboard <br/> (Stage Metrics & Bottlenecks)"]
    ENGINE --> GRID["2. Employee Evaluation Monitor <br/> (Search, Filter, 1-Click Detail)"]
    ENGINE --> ROUTE_HUB["3. Routing Operations Hub <br/> (Reassign, Effective Dates, Bulk Preview)"]
    ENGINE --> REOPEN_HUB["4. Reopen & Revision Center <br/> (Requests, Impact Preview, Controlled Reopen)"]
    ENGINE --> HOSH_HUB["5. Hoshin Management Hub <br/> (Dept/Sec Ready Toggles, Copy FY)"]
    ENGINE --> CYCLE_HUB["6. Annual Cycle Hub <br/> (Generation, Onboarding, Closing)"]
    ENGINE --> HEALTH_HUB["7. Health & Config Monitor <br/> (Priority Alerts: Critical -> Info)"]
```

---

## 2. Core Functional Modules of HR Control Center

### Module 1: Overview Dashboard (Stage Funnel & Pipeline Metrics)
Displays real-time transaction counts across the entire Japanese Fiscal Year (1 Apr - 31 Mar):
* **Pipeline Funnel:** `Total Employees` -> `Not Started` -> `Objective Draft` -> `Waiting Manager L1` -> `Waiting Manager L2` -> `Waiting GM/VP` -> `Objective Approved` -> `Mid-Year In Progress` -> `Final In Progress` -> `HR Final Check` -> `Completed`.
* **Bottleneck Highlights:** Overdue approvals (> 7 days pending), pending resignations, and stage blockers.

### Module 2: Employee Evaluation Monitor (Actionable Data Grid)
Provides a rich, interactive table for all employees with 1-click drill-down:
* **Columns:** `Employee Code`, `Name (TH/EN)`, `Department`, `Section`, `Evaluation Profile`, `Fiscal Year`, `Current Stage`, `Current Status (Plain Text)`, `Waiting For (Role & Name)`, `Days Pending`, `Revision Counter`, `Health Status / Alert Badge`.
* **Action:** Clicking any employee row opens the full MBO detail view in a modal/drawer without losing table state.

### Module 3: Multi-Dimensional Filter & Search Engine
* **Filters:** `Fiscal Year`, `Department`, `Section`, `Evaluation Profile`, `Stage`, `Status`, `Waiting For`, `Approver Name`, `Overdue Only`, `Has Errors Only`, `Has Reopen Request Only`.
* **Search:** Instant fuzzy search by Employee Code or Employee Name.

### Module 4: Routing Operations Hub (HR Self-Service >= 95%)
Directly accessible from the Control Center:
* **Single Record Reassignment:** Select pending record -> Choose new approver -> Execute `/k/v1/record/assignees.json` with audit log `APPROVER_REASSIGNED`.
* **Future Routing Maintenance:** Update App 795 master records with effective dates.
* **Bulk Pending Reassignment:** Impact Preview (shows count of affected records) -> Confirm -> Bulk API update with audit log `BULK_REASSIGNMENT`.

### Module 5: Reopen & Revision Center
* **Reopen Request Queue:** View and triage formal reopen requests submitted by managers or employees.
* **Impact Preview Engine:** Displays which approvals will be invalidated and reset to pending before confirming the reopen.
* **Controlled Reopen Execution:** Increments `Objective_Revision` (or stage revision), archives historical snapshot immutably, and logs `EVALUATION_REOPENED`.

### Module 6: Hoshin Management Hub
* **Dual-Level Overview:** Visual grid showing all Departments and Sections with their current FY Hoshin status.
* **Readiness Status:** Clear badge indicator: `Ready_For_MBO = YES` (Green) or `NOT READY` (Red).
* **One-Click Actions:** Publish Version, Invalidate Old Version, Copy Previous FY Content.

### Module 7: Annual Cycle Management Hub
* **Cycle Monitor:** Tracks initialization of annual records for Japanese FY (1 April - 31 March).
* **Onboarding Tool:** Detects new hires added to App 53 and creates missing annual MBO records.
* **Cycle Close:** Enforces final archiving and locks completed records.

---

## 3. Alert Priority & Health Classification Matrix

| Alert Level | Visual Style | Trigger Criteria | Actionable Shortcut |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | Red Banner / Pulse Badge | Routing Missing, Inactive Approver on Pending Record, Profile Resolution Error | **[Fix Routing]** / **[Reassign Approver]** |
| **ACTION REQUIRED**| Orange Badge | Department or Section Hoshin Not Ready for Current FY | **[Manage Hoshin]** |
| **WARNING** | Yellow Badge | Pending Approval Overdue (> 7 Days), Objective Total Weight != 100% | **[Send Reminder]** / **[View Details]** |
| **INFORMATION** | Blue / Green Badge | Stage Successfully Approved, Revision Created, Cycle Initialized | **[View Log]** |

---

## 4. Security & Audit Architecture

1. **Authorization Boundary:** Access to HR Control Center is governed by **Native Kintone Role/Group Permissions** (e.g. `HR_ADMIN_GROUP`). System Administrators without HR role assignment cannot execute business actions.
2. **Audit Logging:** Every administrative action generates an immutable audit entry in the System Audit Log:
   * `ROUTING_MASTER_CHANGED`
   * `APPROVER_REASSIGNED`
   * `BULK_REASSIGNMENT`
   * `EVALUATION_REOPENED`
   * `HOSHIN_VERSION_CHANGED`
   * `ANNUAL_CYCLE_INITIALIZED`
