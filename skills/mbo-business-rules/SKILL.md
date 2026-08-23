---
name: mbo-business-rules
description: Core business rules, validation logic, and workflows for TTMET MBO / PMS V2
---

# TTMET MBO / PMS V2 Business Rules

## 1. User & Identity Model
- **Employees**: Use shared section Kintone accounts (`f1`, `t1`, `e1`, `tmh`, etc.). Individual employee identity is determined by **Employee Code** (`Employee_Code` from App 53).
- **Managers / GMs / HR**: Individual 1:1 Kintone accounts mapped via App 795 (MBO Routing Master).
- **Single MBO Rule**: 1 Employee + 1 Fiscal Year = Exactly 1 MBO Record.
- **Record Key Rule**: Deterministic string format `{Fiscal_Year}-{Employee_Code}` preserving leading zeroes (e.g. `FY2026-0149`, `FY2026-0001`).

## 2. Objectives & Scoring Structure
- **Objective Count**: Dynamic 2 to 10 Objectives (Default: 4).
- **Layout**: 1 Objective = 1 Horizontal Spreadsheet Row.
- **Weight Rule**: Sum of active `Weight_1` to `Weight_N` MUST equal 100%. Inactive slots are ignored.
- **Difficulty Level**: Integer [1, 2, 3, 4] (1=Easily achievable, 2=Achievable normal, 3=Difficult, 4=Challenging).
- **Achievement Level**: Integer [1, 2, 3, 4, 5] (1=Rarely meet, 2=Partially meet, 3=Fully meet, 4=Exceeded, 5=Remarkable).
- **Mid-Year Progress**: Integer 0% to 100%.

## 3. Business Rule Pending Status
- **Competency 6 (Compliance / COCE)**: Marked as `BUSINESS_RULE_PENDING`. Excel template and legacy App 283 collect this rating, but exclude it from the 50-point formula sum. AI must NEVER unilaterally alter this formula.
