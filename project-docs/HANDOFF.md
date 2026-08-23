# AI Handoff Document & Core Rules

## 1. Confirmed Architecture Principles
- **Single Long-Lived App Core**: App 794 handles all fiscal years. Record Key `{Cycle_Code}-{Employee_Code}`.
- **Annual Plan Carry Forward**: Whitelist copy of planning fields only (`Objective`, `Action_Plan`, `Additional_Agreement`, `Weight`). Strict isolation of historical scores, appraiser ratings, comments, and workflows.
- **Fresh Configuration Supremacy**: Target FY resolves its own Profile, Weights, and Routing dynamically.
- **COCE Governance**: Evaluated = YES, Included_In_Score = NO (excluded from Part B divisor and sum).

## 2. Hard Write Lock
- **STRICT READ-ONLY SAFETY**: Zero POST/PUT/DELETE calls to Kintone. All Discovery & Architecture work is local documentation only.
