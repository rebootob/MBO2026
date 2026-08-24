# Evaluation Profile Migration & Schema Impact Analysis

> **Document Status:** Complete  
> **Target:** App 794 Field Estimate & No-Orphan Governance  
> **Last Updated:** 2026-08-24  

---

## 1. App 794 Field Count Estimate & Safety Analysis

To prevent Kintone schema bloat while supporting 10 Objectives, 3 Evaluation Stages, Stage Snapshots, and Competencies:

| Component Category | Target Field Count | Optimization / Architecture Strategy |
| :--- | :---: | :--- |
| **Header & Employee Meta** | ~18 fields | Standard identification (`Record_Key`, `Fiscal_Year`, `Employee_Code`, etc.) |
| **Objectives Grid (10 Rows)** | ~60 fields | 10 Objectives $\times$ 6 fields (`Title`, `Plan`, `Weight`, `Diff`, `Ach`, `Points`) |
| **Stage Snapshots (Obj, Mid, Fin)**| ~45 fields | 3 Stages $\times$ 6 Slots $\times$ ~2.5 fields (`Approver`, `Rule`, `Active`) |
| **Part B Competencies (Current State)**| ~24 fields | Max 8 Competency Items $\times$ (App1 Rating, App2 Rating, Comment) |
| **Scoring & Calculation Trace** | ~15 fields | Stage Scores, Weighted Scores, Final Score, Audit Log |
| **System & Reopen Meta** | ~10 fields | Revision counters, stage status flags, audit timestamps |
| **Estimated Total App 794 Fields** | **~172 fields** | **WELL WITHIN KINTONE LIMIT (500 fields max)** |

*Safety Assessment:* **LOW RISK (172 / 500 fields $\approx 34\%$ utilization)**. The Hybrid Model (Option C) for Revision Archiving prevents App 794 from accumulating redundant revision fields.
