# Evaluation Profile Master (App 796 Design)

> **Document Status:** Proposed  
> **Last Updated:** 2026-08-23  

---

## 1. Schema Specification

| Field Code | Type | Description | Example Values |
| :--- | :--- | :--- | :--- |
| `Profile_Code` | SINGLE_LINE_TEXT | Unique Profile Identifier (PK) | `PROF_STAFF`, `PROF_MGR`, `PROF_GM`, `PROF_VP`, `PROF_JAPAN` |
| `Profile_Name` | SINGLE_LINE_TEXT | Human-readable name | `Staff & Chief Evaluation Profile` |
| `Target_Positions` | MULTI_SELECT | Mapped Employee Positions from App 53 | `Staff`, `Chief`, `Officer`, `Senior Staff` |
| `Part_A_Weight_Percent` | NUMBER | Weight of Part A Objectives (%) | `70` (Staff), `50` (Manager/Exec) |
| `Part_B_Weight_Percent` | NUMBER | Weight of Part B Competencies (%) | `30` (Staff), `50` (Manager/Exec) |
| `Objective_Min_Count` | NUMBER | Minimum objectives required | `2` |
| `Objective_Max_Count` | NUMBER | Maximum objectives allowed | `10` |
| `Objective_Default_Count` | NUMBER | Default objectives rendered | `4` |
| `Competency_Set_Code` | SINGLE_LINE_TEXT | Linked Competency Set from App 797 | `COMP_SET_CORE_5`, `COMP_SET_MGMT_6` |
| `Scoring_Scheme_Code` | SINGLE_LINE_TEXT | Scoring Matrix Scheme | `MATRIX_4X5_STD`, `DIRECT_KPI_EXEC` |
| `Export_Template_Code` | SINGLE_LINE_TEXT | Template Identifier for Excel Export | `TPL_STAFF_CHIEF_V2`, `TPL_MGR_V2` |
| `Effective_FY` | SINGLE_LINE_TEXT | Fiscal Year Applicability | `FY2026` |
| `Active` | RADIO_BUTTON | Active / Inactive | `Active` |
