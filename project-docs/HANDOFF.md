# AI Handoff Document & Core Rules

## 1. Confirmed Architecture Principles
- **Single Long-Lived App Core**: App 794 handles all fiscal years. Record Key `{Cycle_Code}-{Employee_Code}`.
- **Hoshin Governance**: Shared at Section (`Drop_down`) and Department (`Drop_down_0`) level. MBO Hoshin Master (App 799) is Source of Truth (`Fiscal Year + Section Code + Version -> Published Hoshin`). Objective Submit blocked until Current FY Hoshin is `PUBLISHED`.
- **Annual Plan Carry Forward**: Whitelist copy of planning fields only. Never clone whole record.
- **No Orphan / No Dead Artifacts**: Complete 7-step retirement lifecycle for replaced fields/scripts (`Orphan Count = 0`).

## 2. Hard Write Lock
- **STRICT READ-ONLY SAFETY**: Zero POST/PUT/DELETE calls to Kintone during Discovery Phase.
