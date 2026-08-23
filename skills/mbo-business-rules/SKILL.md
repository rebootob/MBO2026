---
name: mbo-business-rules
description: Authoritative business rules, scoring logic, and evaluation profiles for TTMET MBO V2
---

# MBO V2 Business Rules & Evaluation Profiles

## 1. Confirmed Evaluation Weights
- **Staff & Chief / Japanese Staff:** Part A: 70% | Part B: 30%
- **All Management & Executive Groups (Asst Mgr, Sect Mgr, Senior Mgr, DGM, GM, VP):** Part A: 50% | Part B: 50%

## 2. COCE (Code of Conduct & Ethics) Rule
- `Evaluated = YES`, `Included_In_Score = NO`
- Ignored in Part B divisor and score sum via `Included_In_Score = false`.

## 3. Annual Cycle & Single Long-Lived Core
- App 794 stores all fiscal years.
- Record Key: `{Cycle_Code}-{Employee_Code}`.
- Cycle resolved dynamically from Evaluation Cycle Master + Current Date.
- Zero hardcoded year strings in application code.

## 4. Sequential Approval Routing Model
- Up to 4 generic steps (`Step_1` to `Step_4`) with default rule `ALL` (or `ANY` if configured).
- Empty step -> Automatically skipped.
