# Business Rule Truth Table (Consolidated)

> **Document Status:** Active (Confirmed by User)  
> **Last Updated:** 2026-08-23  

---

## 1. Comprehensive Master Truth Table

| Rule ID | Profile / Scope | Business Rule Statement | Normalized Value | Authoritative Source | Confidence | Decision Status |
| :---: | :--- | :--- | :--- | :--- | :---: | :---: |
| **BR-001** | Staff & Chief | Part A Weight is 70%, Part B Weight is 30% | `PartA: 70%, PartB: 30%` | App 283 & Excel | 100% | **CONFIRMED** |
| **BR-002** | Japanese Staff | Part A Weight is 70%, Part B Weight is 30% | `PartA: 70%, PartB: 30%` | App 716 & Excel | 100% | **CONFIRMED** |
| **BR-003** | Section Manager | Part A Weight is 50%, Part B Weight is 50% | `PartA: 50%, PartB: 50%` | App 305 & Excel | 100% | **CONFIRMED** |
| **BR-004** | Deputy GM (DGM) | Part A Weight is 50%, Part B Weight is 50% | `PartA: 50%, PartB: 50%` | App 307 & Excel | 100% | **CONFIRMED** |
| **BR-005** | Senior Manager | Part A Weight is 50%, Part B Weight is 50% | `PartA: 50%, PartB: 50%` | App 643 & Excel | 100% | **CONFIRMED** |
| **BR-006** | Assistant Manager | Part A Weight is 50%, Part B Weight is 50% | `PartA: 50%, PartB: 50%` | User Confirmation (Supersedes Legacy Excel 60/40) | 100% | **CONFIRMED** |
| **BR-007** | General Manager | Part A Weight is 50%, Part B Weight is 50% | `PartA: 50%, PartB: 50%` | User Confirmation (Supersedes Legacy Excel 60/40) | 100% | **CONFIRMED** |
| **BR-008** | Vice President | Part A Weight is 50%, Part B Weight is 50% | `PartA: 50%, PartB: 50%` | User Confirmation (Supersedes Legacy Excel 70/30) | 100% | **CONFIRMED** |
| **BR-009** | All Profiles | COCE Compliance: Evaluated = YES, Included_In_Score = NO | `Evaluated: YES, Included_In_Score: NO` | User Confirmation (Evaluation Only / Excluded from Average) | 100% | **CONFIRMED** |
| **BR-010** | All Profiles | MBO Objectives scalability: 2 to 10 items | `Min: 2, Max: 10, Default: 4` | User Approved V2 Rule | 100% | **CONFIRMED** |
| **BR-011** | All Profiles | Total Weight must equal 100% | `Total_Weight == 100` | Universal Rule | 100% | **CONFIRMED** |
| **BR-012** | All Profiles | Default Approval Rule is ALL across all levels | `Default: ALL` | User Approved V2 Rule | 100% | **CONFIRMED** |
| **BR-014** | Hoshin Governance | Hoshin is shared at Department/Section organizational level (all employees in section share same Hoshin) | `Scope: SECTION / DEPARTMENT (Shared per Org Unit)` | User Confirmation | 100% | **CONFIRMED** |
| **BR-013** | Annual Cycle | Single Long-Lived App Core with Dynamic Cycle Resolution | `Record_Key: {Cycle_Code}-{EmpCode}` | User Approved V2 Rule | 100% | **CONFIRMED** |
