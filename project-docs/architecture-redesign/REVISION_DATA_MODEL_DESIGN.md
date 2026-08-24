# Revision Data Model & Storage Architecture Evaluation

> **Architecture Status:** Complete  
> **Target:** Structured Archiving of Historical Revisions without Schema Pollution  
> **Last Updated:** 2026-08-24  

---

## 1. Evaluation of Revision History Storage Options

| Evaluation Dimension | Option A: In-Record Subtable (App 794 Subtable) | Option B: Dedicated Child App (Revision Archive App) | Option C (Recommended): Hybrid Model (App 794 Current + Archive App) |
| :--- | :---: | :---: | :---: |
| **Kintone Field Limit Safety** | POOR (Table row limit / JSON payload size risks) | EXCELLENT (Independent records) | **EXCELLENT (Zero schema bloat in Core)** |
| **App 794 Performance** | Slows record load if multiple revisions exist | Fast (App 794 only holds current working state) | **OPTIMAL (App 794 lightweight, Archive queried on demand)** |
| **Audit Immutability** | User with edit access could mutate subtable rows | Restricted permissions on Archive App | **MAXIMUM (Archive App is strictly READ-ONLY to users)** |
| **Historical Comparison UX** | Hard to display full Part A/B comparison in subtable | Easy side-by-side view | **EXCELLENT (Modal loads snapshot from Archive App)** |
| **Implementation Simplicity** | Medium | Medium | **CLEAN & MAINTAINABLE** |

---

## 2. Architectural Recommendation: Option C (Hybrid Model)

### Core Schema Division:
1. **App 794 (Transaction Core):**
   - Holds the **Current Active Revision** (`Objective_Revision: 2`).
   - All standard fields (`Objective_1_Title` .. `Objective_10_Weight`, `Manager_Score`, etc.) represent the current working state.
   - Contains revision summary fields: `Objective_Revision_Count`, `MidYear_Revision_Count`, `Final_Revision_Count`.
2. **Dedicated Revision Archive App:**
   - When HR triggers a Reopen, the system serializes the complete snapshot of the approved revision (Data, Scores, Comments, Route Snapshot, Hoshin Reference) and writes 1 record to the Archive App.
   - Permissions on Archive App: `READ-ONLY` for Employee/Manager, `WRITE` restricted to Automated Reopen Service / HR Admin.
   - `Record_Key` in Archive App: `{Fiscal_Year}-{Employee_Code}-R{Revision_Number}-{Stage}`.

### Strict Prohibition:
* **DO NOT duplicate fields** in App 794 like `Objective_Rev1_...`, `Objective_Rev2_...`, `Objective_Rev3_...`.
