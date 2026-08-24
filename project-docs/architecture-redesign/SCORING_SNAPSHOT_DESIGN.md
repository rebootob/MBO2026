# Scoring & Profile Snapshot Schema in App 794

> **Document Status:** Complete  
> **Target App:** App 794 Transaction Core  
> **Last Updated:** 2026-08-24  

---

## 1. Transaction Snapshot Fields for Profile & Scoring

| Field Code | Data Type | Description |
| :--- | :--- | :--- |
| `Snapshot_Profile_Code` | SINGLE_LINE_TEXT | Resolved Profile Code |
| `Snapshot_Profile_Version` | NUMBER | Resolved Profile Version |
| `Snapshot_Part_A_Weight` | NUMBER | Locked Part A percentage (e.g. 70 or 50) |
| `Snapshot_Part_B_Weight` | NUMBER | Locked Part B percentage (e.g. 30 or 50) |
| `Snapshot_Competency_Set_Code` | SINGLE_LINE_TEXT | Locked Competency Set Code |
| `Snapshot_Appraiser_Model` | DROP_DOWN | `TWO_APPRAISERS` / `ONE_APPRAISER` |
| `Snapshot_Scoring_Scheme_Code` | SINGLE_LINE_TEXT | Locked Scheme Code |
| `Calculation_Trace_Log` | MULTI_LINE_TEXT | Human-readable mathematical audit trail |
