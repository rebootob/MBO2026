# Scoring & Profile Snapshot Schema in App 794 (Annual Snapshot)

> **Document Status:** Complete  
> **Target App:** App 794 Transaction Core  
> **Model:** Annual Immutable Profile Snapshot  
> **Last Updated:** 2026-08-24  

---

## 1. Annual Profile Snapshot Fields in App 794

| Field Code | Data Type | Scope | Description |
| :--- | :--- | :--- | :--- |
| `Snapshot_Profile_Code` | SINGLE_LINE_TEXT | Annual (Entire FY) | Locked Profile Code (e.g. `PROFILE_STAFF_CHIEF`) |
| `Snapshot_Profile_Version` | NUMBER | Annual (Entire FY) | Locked Profile Version integer |
| `Snapshot_Part_A_Weight` | NUMBER | Annual (Entire FY) | Locked Part A weight (e.g. `70` or `50`) |
| `Snapshot_Part_B_Weight` | NUMBER | Annual (Entire FY) | Locked Part B weight (e.g. `30` or `50`) |
| `Snapshot_Competency_Set_Code` | SINGLE_LINE_TEXT | Annual (Entire FY) | Locked Competency Set Code |
| `Snapshot_Appraiser_Model` | DROP_DOWN | Annual (Entire FY) | `TWO_APPRAISERS` / `ONE_APPRAISER` |
| `Snapshot_Scoring_Scheme_Code` | SINGLE_LINE_TEXT | Annual (Entire FY) | Locked Scheme Code |
