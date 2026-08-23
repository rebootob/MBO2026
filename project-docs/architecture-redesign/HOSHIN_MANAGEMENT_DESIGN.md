# Hoshin Governance, Versioning & Publication Architecture Blueprint

> **Document Status:** Active (Business Rule Confirmed by User)  
> **Core Principle:** Shared Organizational Scope + Strict Fiscal Year + Mandatory Human Confirmation  
> **Last Updated:** 2026-08-24  

---

## 1. Confirmed Scope & Architectural Model

The User has explicitly confirmed that **Hoshin is shared across employees in the same organizational unit**:
* **Confirmed Principle:** All employees belonging to the same Section / Department share the **exact same Published Hoshin** for any given Fiscal Year.
* **Prohibited:** Creating individual, employee-level Hoshins.

```mermaid
graph TD
    subgraph Master [App 799: MBO Hoshin Master]
        PUB[Published Hoshin Record: FY2027 + Section TME1 + Version 1]
    end

    subgraph App53 [App 53: Employee Master]
        EMP1[Employee 0149 -> Section TME1]
        EMP2[Employee 0113 -> Section TME1]
        EMP3[Employee 0180 -> Section TME1]
    end

    PUB -->|Dynamic Lookup by Scope Key| T1[App 794: FY2027-0149 (Same Hoshin)]
    PUB -->|Dynamic Lookup by Scope Key| T2[App 794: FY2027-0113 (Same Hoshin)]
    PUB -->|Dynamic Lookup by Scope Key| T3[App 794: FY2027-0180 (Same Hoshin)]
```

---

## 2. App 53 Field Mapping Truth

Based on rigorous read-only inspection of App 53 (Employee Master):

| Business Concept | App 53 Field Code | App 53 Field Label | Type | Example Values | Role in Hoshin Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Section Code** | `Drop_down` | `Section` | `DROP_DOWN` | `TME1`, `TMF1`, `TMF2`, `TMS1`, `TMH2`, `TMT1` | **Primary Scope Key (Section Level)** |
| **Department Name** | `Drop_down_0` | `Departmant` | `DROP_DOWN` | `Eco Energy & Textile Machinery`, `Industrial  Services`, `Corporate` | **Secondary Scope Key (Department Level)** |
| **Section Name** | `Drop_down_1` | `Section Name` | `DROP_DOWN` | `Industry`, `Sales Engineering`, `Accounting & Finance` | Display Name Reference |
| **Legacy Dept Hoshin** | `Text_area` | `Department's Hoshin` | `MULTI_LINE_TEXT` | Multi-line strategy text | Legacy Reference / Bootstrap Source Only |
| **Legacy Sect Hoshin** | `Text_area_0` | `Section's Hoshin` | `MULTI_LINE_TEXT` | Multi-line strategy text | Legacy Reference / Bootstrap Source Only |

---

## 3. Annual Hoshin Lifecycle & Publication Flow

```
[Start of New Fiscal Year (e.g. FY2027)]
                  |
                  v
[1. Bootstrap Drafts per Section/Department]
 └── Previous FY Hoshin copied ONCE per Section/Dept as Status: `DRAFT`
                  |
                  v
[2. Authorized Review & Confirmation]
 └── Section Manager / GM / HR reviews draft
 └── Can edit text or confirm reuse of existing text
                  |
                  v
[3. Publish Action]
 └── Changes Status: `DRAFT` -> `PUBLISHED` (Version 1)
 └── Captures `Published_Date` and `Published_By`
                  |
                  v
[4. MBO V2 Core Unlocked]
 └── All employees in Section `TME1` automatically receive Published Hoshin
 └── Objective submission unlocked in App 794
```

---

## 4. Versioning & Supersession Governance

If an organizational Hoshin is revised during the Fiscal Year:
* The existing published version is marked `Status = "SUPERSEDED"`.
* The new version is published as `Version 2` (`Status = "PUBLISHED"`).
* **Historical MBO Records (Approved):** Retain `Version 1` in their snapshot for immutable audit integrity.
* **Draft MBO Records (Not Submitted):** Prompt the user that Hoshin has been updated to `Version 2` prior to submission.

---

## 5. MBO Record Snapshot on Submit Objective

When an employee submits their objectives in App 794, the record permanently captures:
* `Snapshot_Hoshin_Scope_Type`: `SECTION`
* `Snapshot_Hoshin_Scope_Key`: `TME1`
* `Snapshot_Hoshin_Fiscal_Year`: `FY2027`
* `Snapshot_Hoshin_ID`: `HOSH_FY2027_TME1_v1`
* `Snapshot_Hoshin_Version`: `1`
* `Snapshot_Hoshin_Published_Date`: `2027-04-15T09:00:00Z`
* `Snapshot_Department_Hoshin_Text`: (Multi-line text snapshot)
* `Snapshot_Section_Hoshin_Text`: (Multi-line text snapshot)
