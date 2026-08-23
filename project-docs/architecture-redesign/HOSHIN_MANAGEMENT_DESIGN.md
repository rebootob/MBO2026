# Hoshin Final Governance, Immutability & Dual-Level Architecture Blueprint

> **Document Status:** Active (Final Business Rule Confirmed & Frozen)  
> **Governance Model:** HR Managed / Direct Readiness / Zero Approval Workflow  
> **Submission Requirement:** BOTH Department Hoshin AND Section Hoshin Must Be `Ready_For_MBO = YES` (AND Condition)  
> **Immutability Principle:** Published/Ready Versions Are Strictly Immutable (Revisions Require Creating a New Version)  
> **Last Updated:** 2026-08-24  

---

## 1. Core Architectural Principles

```mermaid
graph TD
    subgraph Master [App 799: MBO Hoshin Master (HR Managed, No Workflow)]
        DEPT_V1["Dept Hoshin (FY2027 + Dept + V1) <br/> Ready_For_MBO = YES (IMMUTABLE)"]
        SECT_V1["Section Hoshin (FY2027 + TME1 + V1) <br/> Ready_For_MBO = YES (IMMUTABLE)"]
    end

    subgraph MBO_Gate [App 794: Objective Submission Gate]
        DEPT_V1 -->|Condition 1| GATE{"Submission Gate: <br/> Dept Ready AND Section Ready?"}
        SECT_V1 -->|Condition 2| GATE
        GATE -->|YES + YES| UNLOCKED["Submit Objective = ENABLED <br/> (Create Immutable Transaction Snapshot)"]
        GATE -->|Any NO| BLOCKED["Submit Objective = BLOCKED <br/> (Draft & Carry Forward Allowed)"]
    end
```

---

## 2. Dual-Level Submission Gate (Strict AND Condition)

In MBO V2, both organizational levels are strictly required:
$$\text{Objective Submission Enabled} \iff (\text{Dept Hoshin.Ready\_For\_MBO} = \text{"YES"}) \land (\text{Section Hoshin.Ready\_For\_MBO} = \text{"YES"})$$

### Specific Distinct User Messages:
* **Department Hoshin Missing / Not Ready:**  
  `🔴 Department Hoshin ยังไม่พร้อม / Department Hoshin is not ready`
* **Section Hoshin Missing / Not Ready:**  
  `🔴 Section Hoshin ยังไม่พร้อม / Section Hoshin is not ready`
* **Both Missing / Not Ready:** Both error items are displayed distinctly in the validation error box.
* **Employee Capability during Block:** Employees can still open the FY record, view profile info, execute Annual Plan Carry Forward, save drafts, and edit objectives freely.

---

## 3. Immutability of Ready Versions & Revision Lifecycle

### Rule 1: Immutability of Ready Versions
Once a Hoshin record has `Ready_For_MBO = "YES"`, it is considered a **Published Business Baseline and is strictly immutable**. HR cannot directly modify the text content, scope, fiscal year, or version of an active ready record.

### Rule 2: Revision via New Version Creation
If HR must revise an active Hoshin:
1. **Create New Version:** System creates a new draft record (e.g. `FY2027 + TME1 + Version 2`) with `Ready_For_MBO = "NO"`.
2. **HR Edits Draft:** HR modifies the text or notes in `Version 2`.
3. **Publish / Set Ready:** HR toggles `Version 2` to `Ready_For_MBO = "YES"`.
4. **Automatic Supersession:** `Version 1` is automatically marked `SUPERSEDED` / `HISTORICAL` (never deleted).

### Rule 3: Single Current Ready Version Invariant
For any unique tuple `(Fiscal_Year, Scope_Type, Scope_Code)`, there can be **at most ONE record** with `Ready_For_MBO = "YES"` at any given time.

---

## 4. Conceptual MBO Hoshin Master Schema (App 799)

| Field Code | Field Label | Type | Description | Example Values |
| :--- | :--- | :--- | :--- | :--- |
| `Hoshin_Key` | Hoshin Key | SINGLE_LINE_TEXT | Unique Record Identifier (PK) | `HOSH_FY2027_SECTION_TME1_v1` |
| `Cycle_Code` | Cycle Code | SINGLE_LINE_TEXT | Linked Evaluation Cycle | `CYC_FY2027` |
| `Fiscal_Year` | Fiscal Year | SINGLE_LINE_TEXT | Japanese Fiscal Year (`1 Apr - 31 Mar`) | `FY2027` |
| `Scope_Type` | Scope Type | DROP_DOWN | Scope Level | `DEPARTMENT`, `SECTION` |
| `Scope_Code` | Scope Code | SINGLE_LINE_TEXT | Identifier Code | `TME1`, `Industrial_Services` |
| `Scope_Name` | Scope Name | SINGLE_LINE_TEXT | Display Name | `Eco Energy Section 1` |
| `Department_Code` | Department Code | SINGLE_LINE_TEXT | Department Identifier | `Industrial_Services`, `Eco_Energy` |
| `Department_Name` | Department Name | SINGLE_LINE_TEXT | Department Display Name | `Industrial Services` |
| `Section_Code` | Section Code | SINGLE_LINE_TEXT | Section Identifier | `TME1`, `TMF1`, `TMS1` |
| `Section_Name` | Section Name | SINGLE_LINE_TEXT | Section Display Name | `Industry`, `Technical Services` |
| `Hoshin_TH` | Hoshin Text (TH) | MULTI_LINE_TEXT | Strategy Statement in Thai | (Thai text) |
| `Hoshin_EN` | Hoshin Text (EN) | MULTI_LINE_TEXT | Strategy Statement in English | `1. Enhance our strength...` |
| `Version` | Version Number | NUMBER | Version integer (starts at 1 per FY) | `1`, `2`, `3` |
| `Ready_For_MBO` | พร้อมใช้งานใน MBO | RADIO_BUTTON | Readiness Flag | **`YES`**, **`NO`** |
| `Status` | Lifecycle State | DROP_DOWN | Derived Version State | `DRAFT`, `CURRENT_READY`, `SUPERSEDED` |
| `Updated_By` | Updated By | USER_SELECT | Last HR maintainer | `hr` |
| `Updated_At` | Updated At | DATETIME | Timestamp of last edit | `2027-04-05T09:00:00Z` |
| `Remark` | Change Remarks | MULTI_LINE_TEXT | Administrative notes | `Annual FY2027 baseline confirmed` |
| `Active` | Active Indicator | RADIO_BUTTON | Active state | `Active` |

---

## 5. App 794 Transaction Snapshot on Submit Objective

When an employee submits objectives in App 794, the record captures an immutable transaction snapshot:
* **Department Hoshin Snapshot:**
  - `Snapshot_Dept_Hoshin_Key`
  - `Snapshot_Dept_Hoshin_Version`
  - `Snapshot_Dept_Hoshin_Content`
  - `Snapshot_Dept_Hoshin_Ready_Date`
* **Section Hoshin Snapshot:**
  - `Snapshot_Sect_Hoshin_Key`
  - `Snapshot_Sect_Hoshin_Version`
  - `Snapshot_Sect_Hoshin_Content`
  - `Snapshot_Sect_Hoshin_Ready_Date`
* **Snapshot Metadata:**
  - `Snapshot_Hoshin_Timestamp`

*Approved / Historical MBO evaluations are strictly isolated and will never change their snapshot when Master is updated to a new version.*
