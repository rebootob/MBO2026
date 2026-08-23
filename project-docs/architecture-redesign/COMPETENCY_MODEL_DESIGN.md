# Competency Master (App 797 Design)

> **Document Status:** Active (Confirmed Standard)  
> **Last Updated:** 2026-08-23  

---

## 1. Schema Specification & COCE Configuration Standard

| Field Code | Type | Description | COCE Example | Core Item Example |
| :--- | :--- | :--- | :--- | :--- |
| `Competency_Set_Code` | SINGLE_LINE_TEXT | Set Identifier | `COMP_SET_CORE_5` | `COMP_SET_CORE_5` |
| `Item_Sequence` | NUMBER | Sequence Number (1 to 10) | `6` | `1` |
| `Competency_Code` | SINGLE_LINE_TEXT | Item Code | `COMP_COCE` | `COMP_JOB_KNOW` |
| `Competency_Name_EN` | SINGLE_LINE_TEXT | English Name | `Code of Conduct & Ethics (COCE)` | `Job Knowledge & Expertise` |
| `Competency_Name_TH` | SINGLE_LINE_TEXT | Thai Name | `จรรยาบรรณและวินัยในการทำงาน` | `ความรู้ความเชี่ยวชาญในงาน` |
| `Rating_Scale_Max` | NUMBER | Maximum Rating (`5`) | `5` | `5` |
| `Included_In_Score` | RADIO_BUTTON | Score Calculation Inclusion | **`No` (Evaluation Only)** | **`Yes` (Included in Average)** |
| `Effective_FY` | SINGLE_LINE_TEXT | Effective Fiscal Year | `FY2026` | `FY2026` |
