# Field Dictionary (Key Fields in App 794)

| Field Code | Type | Purpose | Source / Role | Stage |
| :--- | :--- | :--- | :--- | :--- |
| `Record_Key` | Single-line Text | Unique record identifier (`FY2026-0149`) | System Generated | All Stages |
| `Fiscal_Year` | Single-line Text | Appraisal Fiscal Year (`FY2026`) | Employee / System | Create |
| `Employee_Code` | Single-line Text | Employee ID from App 53 | App 53 Lookup | Create |
| `Objective_Count` | Drop-down | Number of active objectives (2-10) | Employee | Objective Input |
| `Objective_1..10` | Multi-line Text | Expected result and target | Employee | Objective Input |
| `Action_Plan_1..10` | Multi-line Text | Activities to achieve objective | Employee | Objective Input |
| `Weight_1..10` | Number | Objective weight (Sum = 100%) | Employee | Objective Input |
| `Difficulty_1..10` | Number [1-4] | Difficulty level | Employee | Objective Input |
| `Progress_Percent_1..10` | Number [0-100] | Mid-year progress % | Employee | Mid-Year Input |
| `Actual_Result_1..10` | Multi-line Text | Year-end achieved results | Employee | Self Evaluation |
| `Self_Achievement_1..10` | Number [1-5] | Self evaluation rating | Employee | Self Evaluation |
| `Manager_Achievement_1..10` | Number [1-5] | 1st Appraiser Rating | Manager | Confidential |
| `GM_Achievement_1..10` | Number [1-5] | 2nd Appraiser Rating | GM | Confidential |
