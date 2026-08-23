# AI Handoff Document & Core Rules

## 1. Confirmed Architecture Principles
- **Single Long-Lived App Core**: App 794 stores all fiscal years. Record Key is `{Cycle_Code}-{Employee_Code}`.
- **Zero Year Hardcoding**: Current cycle resolved dynamically from Evaluation Cycle Master + Current Date.
- **Configuration-Driven Profiles**:
  - Staff / Japan: 70/30
  - Asst Mgr / Sect Mgr / Senior Mgr / DGM / GM / VP: 50/50
- **COCE Treatment**: Evaluated = YES, Included_In_Score = NO.
- **Generic Sequential Routing**: Step 1 to 4 with `ALL` default rule.

## 2. Hard Write Lock
- **DO NOT WRITE TO KINTONE**: Zero POST/PUT/DELETE calls allowed during Discovery & Architecture Design Phase.
