# Role-Filtered Multi-Profile Excel Export Architecture

> **Document Status:** Proposed  
> **Last Updated:** 2026-08-23  

---

## 1. Template Resolution & Privacy Filtering

```
App 794 Record Data
       |
       v
[Evaluation Profile Export Mapper]
 ├── Matches: Snapshot_Evaluation_Profile_Code -> Target Template (e.g. Staff, Mgr, GM, VP)
       |
       v
[Security & Privacy Role Filter]
 ├── If Current User is Employee:
 │    ├── Strip Part B Competency Scores
 │    ├── Strip Manager / GM / VP Achievement Ratings
 │    └── Strip Confidential Internal Comments
 └── If Current User is HR / GM / President:
      └── Populate Full Comprehensive Evaluation Workbook
       |
       v
[Generated .xlsx Download]
```
