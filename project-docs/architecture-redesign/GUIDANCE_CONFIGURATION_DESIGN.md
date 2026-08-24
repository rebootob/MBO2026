# Guidance Configuration Engine & Field Group Blueprint

> **Document Status:** Complete (Configuration-Driven Guidance Model)  
> **Core Objective:** Eliminate hardcoded `if/else` UI message logic  
> **Last Updated:** 2026-08-24  

---

## 1. Guidance Master Schema Concept

All UI titles, instructions, checklists, and next-step messages are resolved dynamically from configuration:

| Attribute Code | Data Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `Guidance_Code` | SINGLE_LINE_TEXT | Unique Identifier | `GUIDE_OBJ_DRAFT_EMPLOYEE` |
| `Evaluation_Stage` | DROP_DOWN | Business Stage | `OBJECTIVE_SETTING` |
| `Business_Status` | SINGLE_LINE_TEXT | Business Status Key | `DRAFT_INPUT` |
| `Target_Role` | DROP_DOWN | User Persona | `EMPLOYEE` |
| `Title_TH` | SINGLE_LINE_TEXT | Thai Header | `จัดทำและส่งเป้าหมายประจำปี` |
| `Title_EN` | SINGLE_LINE_TEXT | English Header | `Annual Objective Setting` |
| `Instruction_TH` | MULTI_LINE_TEXT | Thai Guidance Body | `กรุณากรอกเป้าหมายอย่างน้อย 2 ข้อ และกำหนดน้ำหนักรวมให้ครบ 100%` |
| `Instruction_EN` | MULTI_LINE_TEXT | English Guidance Body | `Please enter at least 2 objectives with total weight equal to 100%` |
| `Field_Group_Code` | SINGLE_LINE_TEXT | Associated Field Group | `FG_EMPLOYEE_OBJECTIVE` |
| `Primary_Action` | SINGLE_LINE_TEXT | CTA Action Identifier | `SUBMIT_OBJECTIVE` |
| `Next_Step_Message_TH`| SINGLE_LINE_TEXT | Thai Next Step Notice | `ส่งต่อให้ผู้จัดการส่วนตรวจสอบและอนุมัติ` |
| `Next_Step_Message_EN`| SINGLE_LINE_TEXT | English Next Step Notice | `Submits to Section Manager for review and approval` |

---

## 2. Standard Field Group Catalog

| Field Group Code | Target Persona | Editable Fields | Required Fields | Locked Fields |
| :--- | :--- | :--- | :--- | :--- |
| `FG_EMPLOYEE_OBJECTIVE` | Employee | Objective Titles, Plans, Weights, Difficulties | Title, Plan, Weight (Sum 100%), Diff | Employee Meta, Hoshin, Scores |
| `FG_MANAGER_OBJ_REVIEW` | Manager L1 | Manager Comments, Diff Verification | Diff Approval / Return Reason | Objective Titles, Employee Weights |
| `FG_EMPLOYEE_MIDYEAR` | Employee | Mid-Year Self Progress, Self Achievement | Self Progress Description | Objectives, Weights, Manager Scores |
| `FG_MANAGER_MIDYEAR` | Manager L1 | Mid-Year Manager Progress & Feedback | Manager Feedback | Employee Self Comments |
| `FG_EMPLOYEE_FINAL` | Employee | Final Self Achievement & Part B Self Rating | Self Ratings 1-5 | Manager Ratings, Part B Formulas |
| `FG_MANAGER_FINAL` | Manager L1 | Manager Part A Ach & Part B Ratings | Part A Ach 1-5, Part B Ratings 1-5 | Final Calculated Total |
| `FG_GM_FINAL` | GM / VP | GM Part A Ach & Part B Ratings | GM Ratings 1-5, GM Final Comments | Manager Ratings, Employee Inputs |
| `FG_HR_FINAL_CHECK` | HR Admin | HR Calibration Notes, Final Check Toggle | Final Check Confirmation | All Ratings & Evaluation Inputs |
