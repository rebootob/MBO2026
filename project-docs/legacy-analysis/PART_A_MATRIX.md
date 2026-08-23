# Part A (MBO Objectives) Cross-App Comparison Matrix

> **Document Status:** Complete (Discovery Phase)  
> **Last Updated:** 2026-08-23  

---

## 1. Part A Configuration Comparison Table

| Evaluation Profile | Legacy App | Objective Count | Weight Distribution | Difficulty Scale | Achievement Scale | Matrix Conversion Formula | Appraiser Roles | Part A Total Weight |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- | :--- | :---: |
| **Staff & Chief** | `283` | Fixed 4 | Sum = 100% | 1 - 4 (Easy to Challenging) | 1 - 5 (Rarely to Remarkable) | 4x5 lookup table -> 1-5 Score | 1st Appraiser (Mgr), 2nd Appraiser (GM) | **70%** |
| **Assistant Manager** | `310` | Fixed 4 | Sum = 100% | 1 - 4 | 1 - 5 | 4x5 lookup table -> 1-5 Score | 1st Appraiser (Mgr/GM), 2nd Appraiser (GM/VP) | **60%** (Excel says 60%, Kintone calc is 50%) |
| **Section Manager** | `305` | Fixed 4 | Sum = 100% | 1 - 4 | 1 - 5 | 4x5 lookup table -> 1-5 Score | 1st Appraiser (DGM/GM), 2nd Appraiser (VP) | **50%** |
| **Deputy GM (DGM)** | `307` | Fixed 4 | Sum = 100% | 1 - 4 | 1 - 5 | 4x5 lookup table -> 1-5 Score | 1st Appraiser (GM), 2nd Appraiser (VP) | **50%** |
| **Senior Manager** | `643` | Fixed 4 | Sum = 100% | 1 - 4 | 1 - 5 | 4x5 lookup table -> 1-5 Score | 1st Appraiser (GM), 2nd Appraiser (VP) | **50%** |
| **General Manager** | `640` | Fixed 4 | Sum = 100% | 1 - 4 | 1 - 5 | 4x5 lookup table -> 1-5 Score | 1st Appraiser (VP), 2nd Appraiser (President) | **50%** (Excel says 60%) |
| **Vice President** | `715` | Fixed 4 | Sum = 100% | 1 - 4 | 1 - 5 | Direct Strategic KPI % | President | **50%** (Excel says 70%) |
| **Japanese Staff** | `716` | Fixed 4 | Sum = 100% | 1 - 4 | 1 - 5 | 4x5 lookup table -> 1-5 Score | 1st Appraiser (Japanese Mgr), 2nd Appraiser (GM) | **70%** |

---

## 2. Difficulty x Achievement 4x5 Matrix Standard

All legacy apps evaluating Part A utilize the same mathematical 4x5 conversion matrix:

| Difficulty \ Achievement | Level 1 (Rarely: 1) | Level 2 (Partially: 2) | Level 3 (Fully: 3) | Level 4 (Exceeded: 4) | Level 5 (Remarkable: 5) |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **Difficulty 4 (Challenging)** | 2 | 3 | 4 | 4 | **5** |
| **Difficulty 3 (Difficult)** | 2 | 2 | 3 | 4 | **4** |
| **Difficulty 2 (Normal)** | 1 | 1 | 2 | 3 | **3** |
| **Difficulty 1 (Easy)** | 1 | 1 | 2 | 2 | **2** |

* **Formula in Kintone:**  
  `MBO_Point_i = (Weight_i * Converted_Score_i) / 100`
* **Raw Part A Score:**  
  `PartA_Raw = SUM(MBO_Point_1..N)` (Score scale 1.00 - 5.00)
