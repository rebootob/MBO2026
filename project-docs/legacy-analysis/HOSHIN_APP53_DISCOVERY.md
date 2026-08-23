# App 53 (Employee Master) Hoshin Field Discovery & Data Quality Audit

> **Document Status:** Complete (Read-Only Discovery)  
> **Source App:** App 53 (Employee Namelist Master - 275 Records Audited)  
> **Audit Date:** 2026-08-23  

---

## 1. Executive Summary

A deep read-only inspection of all 275 employee records in App 53 was conducted to analyze how organizational targets (Hoshin) are currently stored. The discovery reveals **severe data fragmentation, lack of versioning, and intra-section inconsistencies**, confirming that App 53 cannot serve as the authoritative Source of Truth for MBO V2 Hoshin governance.

---

## 2. Hoshin Field Definitions in App 53

| Field Code | Field Label | Field Type | Populated Records | Empty Records | Population Rate |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `Text_area` | `Department's Hoshin` | `MULTI_LINE_TEXT` | 162 | 113 | 58.9% |
| `Text_area_0` | `Section's Hoshin` | `MULTI_LINE_TEXT` | 163 | 112 | 59.3% |

---

## 3. Data Inconsistencies & Quality Findings

### Finding 1: Massive Empty Data Across Whole Departments
* **112 to 113 records (over 40% of the company)** have completely blank Hoshin fields.
* Entire departments have zero Hoshin populated:
  - `Mold & Engineering` Department (90 employees across `TMG1` and `TMG2`): **100% Blank**.

### Finding 2: Inconsistent Hoshin Text Within the Same Section
In legacy App 53, Hoshin text was manually copy-pasted into individual employee records. As a result, employees belonging to the **exact same section** have divergent, conflicting Hoshin text:

* **Section `TMF1` (35 employees):** Contains **3 distinct non-empty Hoshin variants**:
  - Variant 1: `1. Achieve Gross profit of budget 92.49 MB...` (21 employees)
  - Variant 2: `1. Achieve Gross profit of budget 97.07 MB...` (10 employees)
  - Variant 3: `1. Achieve operating profit of budget 116.4MB...` (1 employee)
* **Section `TMF2` (27 employees):** Contains **4 distinct Hoshin variants** with conflicting profit targets (`66.60 MB` vs `54.32 MB` vs `68.3 MB` vs `21 MB`).
* **Section `TMT1` (18 employees):** Contains **4 distinct Hoshin variants** (`61.5MB` vs `65MB` vs `90.95MB` vs general text).
* **Section `TME1` (12 employees):** Contains 2 text variations due to leading whitespace differences.

### Finding 3: Inconsistent Department Hoshins
* **`Industrial Services` Department (61 employees):** 5 distinct Department Hoshin variants.
* **`Machinery` Department (48 employees):** 6 distinct Department Hoshin variants.

---

## 4. Root Causes in Legacy Architecture
1. **Denormalization Antipattern:** Storing organizational strategy at the employee row level rather than in an organizational master.
2. **Zero Temporal / Fiscal Year Identity:** Fields have no metadata indicating which fiscal year they belong to (`FY2024`, `FY2025`, or `FY2026`).
3. **Zero Lifecycle Control:** No distinction between Draft, Approved, Published, or Deprecated strategy statements.
4. **Zero Human Confirmation:** System cannot distinguish between *"Hoshin is identical because management reused last year's goal"* and *"Hoshin is identical because nobody updated the database"*.

---

## 5. Architectural Conclusion for MBO V2
* **App 53 Role:** Retained as Employee Profile Master (Read Only) and Legacy Reference.
* **MBO V2 Source of Truth:** Hoshin must be decoupled into a dedicated **MBO Hoshin Master** with strict Fiscal Year scoping, human publication workflow, and immutable transaction snapshots.

---

## 6. Authoritative App 53 Field Mapping Summary

* **Business Concept: Section Code (Primary Unit)**
  - App 53 Field Code: `Drop_down`
  - Field Label: `Section`
  - Example Values: `TME1`, `TMF1`, `TMF2`, `TMS1`, `TMH2`, `TMT1`
  - Confidence: **100% (Verified via 275 records)**

* **Business Concept: Department Name (Overarching Unit)**
  - App 53 Field Code: `Drop_down_0`
  - Field Label: `Departmant`
  - Example Values: `Eco Energy & Textile Machinery`, `Industrial  Services`, `Corporate`, `Machinery`
  - Confidence: **100% (Verified via 275 records)**
