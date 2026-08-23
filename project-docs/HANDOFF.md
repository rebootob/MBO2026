# AI Handoff Document & Core Rules

## 1. Confirmed Architecture Principles
- **Single Long-Lived App Core**: App 794 handles all fiscal years. Record Key `{Cycle_Code}-{Employee_Code}`.
- **Hoshin Governance**: App 53 is Legacy Reference. MBO V2 uses MBO Hoshin Master (App 799) with Fiscal Year Scoping, Scope Keys (`SECTION`, `DEPARTMENT`), Versioning, and Publication states. Objective Submit blocked until Current FY Hoshin is `PUBLISHED`.
- **Annual Plan Carry Forward**: Whitelist copy of planning fields only. Strict isolation of historical scores and workflows.
- **COCE Governance**: Evaluated = YES, Included_In_Score = NO (excluded from Part B divisor and sum).

## 2. Hard Write Lock
- **STRICT READ-ONLY SAFETY**: Zero POST/PUT/DELETE calls to Kintone. All Discovery & Architecture work is local documentation only.
