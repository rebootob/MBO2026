# Business Rule Truth Table (Consolidated)

> **Document Status:** Active (Discovery Phase)  
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
| **BR-006** | Assistant Manager | Part A / Part B Weight Split Conflict | `50/50 (Kintone)` vs `60/40 (Excel)` | App 310 vs PART A.xlsx | 50% | **NEEDS_USER_CONFIRMATION** |
| **BR-007** | General Manager | Part A / Part B Weight Split Conflict | `50/50 (Kintone)` vs `60/40 (Excel)` | App 640 vs Excel | 50% | **NEEDS_USER_CONFIRMATION** |
| **BR-008** | Vice President | Part A / Part B Weight Split Conflict | `50/50 (Kintone)` vs `70/30 (Excel)` | App 715 vs Excel | 50% | **NEEDS_USER_CONFIRMATION** |
| **BR-009** | All Profiles | COCE Compliance numerical score excluded from Part B divisor | `COCE is Gatekeeper / Non-Averaged` | Formula Analysis (All Apps) | 90% | **NEEDS_USER_CONFIRMATION** |
| **BR-010** | All Profiles | MBO Objectives scalability: 2 to 10 items | `Min: 2, Max: 10, Default: 4` | User Approved V2 Rule | 100% | **CONFIRMED** |
| **BR-011** | All Profiles | Total Weight must equal 100% | `Total_Weight == 100` | Universal Rule | 100% | **CONFIRMED** |
| **BR-012** | All Profiles | Default Approval Rule is ALL across all levels | `Default: ALL` | User Approved V2 Rule | 100% | **CONFIRMED** |
