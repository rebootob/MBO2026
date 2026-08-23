# Competency Master (App 797 Design)

> **Document Status:** Proposed  
> **Last Updated:** 2026-08-23  

---

## 1. Schema Specification

| Field Code | Type | Description |
| :--- | :--- | :--- |
| `Competency_Set_Code` | SINGLE_LINE_TEXT | Set Identifier (`COMP_SET_CORE_5`, `COMP_SET_MGMT_6`, `COMP_SET_EXEC_5`) |
| `Item_Sequence` | NUMBER | Sequence Number (1 to 10) |
| `Competency_Code` | SINGLE_LINE_TEXT | Item Code (`COMP_JOB_KNOW`, `COMP_LEADERSHIP`, `COMP_COCE`) |
| `Competency_Name_EN` | SINGLE_LINE_TEXT | English Name |
| `Competency_Name_TH` | SINGLE_LINE_TEXT | Thai Name |
| `Competency_Description` | MULTI_LINE_TEXT | Detailed behavioral description & grading rubric |
| `Rating_Scale_Max` | NUMBER | Maximum Rating (`5`) |
| `Included_In_Score` | RADIO_BUTTON | `Yes` (Included in average) / `No` (Gatekeeper / Non-averaged) |
| `Effective_FY` | SINGLE_LINE_TEXT | `FY2026` |
