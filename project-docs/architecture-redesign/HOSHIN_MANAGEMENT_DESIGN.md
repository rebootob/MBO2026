# Hoshin Governance & Master Architecture Blueprint (HR Managed Model)

> **Document Status:** Active (Confirmed Business Rule)  
> **Governance Model:** HR Managed / Direct Maintenance (No Approval Workflow)  
> **Core Readiness Control:** `Ready_For_MBO` Flag (`YES` / `NO`)  
> **Last Updated:** 2026-08-24  

---

## 1. Executive Summary & Core Governance Model

The User has explicitly confirmed the governance model for organizational targets (**Department Hoshin** and **Section Hoshin**):
* **Sole Business Owner:** Human Resources (HR) directly manages, enters, edits, and confirms all Department and Section Hoshins for the entire company.
* **No Approval Workflow:** The Hoshin Master operates **without Kintone Process Management** (no submission/approval chain through Managers, GMs, VPs, or President).
* **Security & Readiness Boundary:** Native Kintone App & Field Permissions (HR = Create/Edit/View; Employees = View Only) combined with a simple `Ready_For_MBO` readiness toggle (`YES` / `NO`).

```mermaid
graph TD
    PREV[Previous FY Hoshin / App 53] -->|HR Bootstrap as Draft| MASTER[App 799: MBO Hoshin Master]
    
    subgraph HR_Direct_Control [HR Annual Maintenance (No Approval Workflow)]
        MASTER --> EDIT[HR Edits Department & Section Text]
        EDIT --> READY[HR Sets: Ready_For_MBO = YES]
    end

    subgraph MBO_Integration [App 794: MBO Transaction Core]
        READY --> RESOLVER[Hoshin Dynamic Resolver]
        RESOLVER --> DISPLAY[Display Dept Hoshin & Sect Hoshin on MBO Header]
        RESOLVER --> GATE[Unlock Objective Submission in App 794]
        GATE --> SNAPSHOT[Permanent Hoshin Snapshot on Submit]
    end
```

---

## 2. Conceptual MBO Hoshin Master Schema (App 799)

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
| `Updated_By` | Updated By | USER_SELECT | Last HR maintainer | `hr` |
| `Updated_At` | Updated At | DATETIME | Timestamp of last edit | `2027-04-05T09:00:00Z` |
| `Remark` | Change Remarks | MULTI_LINE_TEXT | Administrative notes | `Annual FY2027 baseline confirmed` |
| `Active` | Active Indicator | RADIO_BUTTON | Active state | `Active` |

---

## 3. Two-Level Hoshin Structure (Department + Section)

MBO V2 preserves and supports both organizational tiers:
1. **Department Hoshin:** High-level strategic directives set per Department (`Drop_down_0` in App 53).
2. **Section Hoshin:** Tactical operational goals set per Section (`Drop_down` in App 53).

Both levels are displayed side-by-side in the App 794 MBO header once `Ready_For_MBO = "YES"`.

---

## 4. Hoshin Validity & Submission Gating Rules

### Rule 1: Validity Criteria
A Hoshin is valid and ready for employee transactions **IF AND ONLY IF**:
$$\text{Current Cycle} = \text{Hoshin Cycle} \quad \text{AND} \quad \text{Scope Matches Employee Org} \quad \text{AND} \quad \text{Ready\_For\_MBO} = \text{"YES"}$$

### Rule 2: Objective Setting vs. Submission Gate
* **When `Ready_For_MBO == NO`:**
  - Employee **CAN** open the FY2027 record, view profile info, execute Annual Plan Carry Forward, and prepare objective drafts.
  - Employee **CANNOT SUBMIT** objectives for Manager Review.
  - **Banner:** *🔵 รอ HR จัดเตรียม Hoshin สำหรับ FY2027 / Waiting for FY2027 Hoshin*
* **When `Ready_For_MBO == YES`:**
  - Full Hoshin content is rendered in App 794 header.
  - Submit Objective action is unlocked.

### Rule 3: No Silent Fallback
If FY2027 Hoshin has `Ready_For_MBO = "NO"` or does not exist, the system **never falls back silently to FY2026**.

---

## 5. MBO Record Snapshot on Submit Objective

When an employee submits objectives in App 794, the record permanently captures an immutable snapshot:
* `Snapshot_Department_Code` & `Snapshot_Department_Name`
* `Snapshot_Section_Code` & `Snapshot_Section_Name`
* `Snapshot_Dept_Hoshin_Key`, `Snapshot_Dept_Hoshin_Version`, `Snapshot_Dept_Hoshin_Text`
* `Snapshot_Sect_Hoshin_Key`, `Snapshot_Sect_Hoshin_Version`, `Snapshot_Sect_Hoshin_Text`
* `Snapshot_Hoshin_Timestamp`

*Note: Subsequent HR edits in Hoshin Master will increment `Version: 2` but will NEVER alter approved MBO records.*

---

## 6. Permissions & Governance

* **HR Administrators:** Native Permission `CREATE = YES`, `EDIT = YES`, `VIEW = YES`.
* **Employees / Managers / Executives:** Native Permission `CREATE = NO`, `EDIT = NO`, `VIEW = YES (Read Only)`.
* **Superseded Artifact Notice:** All previous designs involving Hoshin Process Management or Multi-Tier Approval Workflows are formally marked `SUPERSEDED IN DESIGN` per the No Orphan Policy (`DEC-016`).
