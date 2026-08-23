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

---

## 4. Annual Plan Carry Forward Governance
* **Core Principle:** Never Clone Entire Record. Only copy allowed planning fields via Strict Whitelist (`Objective`, `Action_Plan`, `Additional_Agreement`, `Weight`).
* **Difficulty Default:** `Carry_Forward_Difficulty = false` (User sets difficulty in current FY).
* **Isolation Guarantee:** Zero copying of scores, appraiser ratings, internal comments, COCE ratings, workflow status, approval timestamps, old approvers, or old snapshots.
* **Configuration Supremacy:** Target FY resolves fresh Profile, Weights, and Routing. If promoted (e.g. Staff -> Asst Mgr), Target 50/50 profile applies.
* **Workflow Boundary:** Allowed ONLY in `NEW_RECORD` or `01 DRAFT OBJECTIVE`. Disabled once workflow starts.

---

## 5. Artifact Lifecycle & Cleanup Governance
* **Zero Dead Artifacts:** Any replaced field, script, or routing model must be fully migrated, tested, and removed.
* **Single Source of Truth:** No parallel competing models in active production/sandbox apps.
* **Definition of Done:** Requires complete cleanup of replaced references, 0 orphan artifacts, and synchronized documentation.

---

## 6. Hoshin Governance & Organizational Scope
* **Shared Organizational Scope:** Hoshin is defined and published per Section (`Drop_down`) and Department (`Drop_down_0`). All employees in the same unit share the identical Published Hoshin.
* **Annual Human Confirmation:** Copied once per section as Draft; must be explicitly confirmed/published by authorized users for each Fiscal Year.
* **Submission Gate:** Objective submission in App 794 is locked until Current FY Hoshin is `PUBLISHED`.
