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
