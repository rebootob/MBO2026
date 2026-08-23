# Routing Role Catalog & Evaluation Responsibility Matrix

> **Document Status:** Complete  
> **Source Evidence:** Cross-App Legacy Analysis  
> **Last Updated:** 2026-08-24  

---

## 1. Master Role Catalog

| Role Code | Role Display Name | Business Meaning | Used in Profiles | Workflow Approver | Part A Appraiser | Part B Appraiser | Required / Optional |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| `EMPLOYEE` | Employee / Appraisee | Self evaluation and draft submission | All Profiles | Requester | Self-Rating | Self-Rating | Required |
| `MANAGER` | Direct Manager (L1) | First-line direct supervisor | Staff, Chief, Japanese | YES | YES | YES | Required (if exists) |
| `MENTOR_MANAGER` | Mentor / 1st Manager | Section mentor / secondary manager | Special Staff (F1-F3) | YES | Optional | Optional | Optional |
| `GM` | General Manager | Department head | Staff, Mgr, Senior Mgr | YES | YES | YES | Required |
| `VP` | Vice President | Division executive | Dept Mgr, GM | YES | Optional | Optional | Optional |
| `PRESIDENT` | Company President | Chief Executive Officer | All Profiles (Final) | YES | Final Approval | Final Approval | Optional / Exec |
| `FIRST_APPRAISER` | 1st Appraiser | Primary evaluator for Japanese staff | Japanese Staff | YES | YES | YES | Required (Japan) |
| `SECOND_APPRAISER`| 2nd Appraiser | Secondary evaluator for Japanese staff| Japanese Staff | YES | YES | YES | Required (Japan) |
| `HR_ADMIN` | Human Resources | Company-wide PMS administrator | All Profiles | Final Check | Audit Only | Audit Only | Required (Final) |
