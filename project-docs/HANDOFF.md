# AI Handoff Document & Core Rules

## 1. Confirmed Architecture & Governance Principles
- **No Orphan / No Dead Artifacts**: When creating new models/fields to replace old ones, you MUST complete dependency audits, data migration, and remove deprecated artifacts (`Orphan Count = 0`).
- **Single Long-Lived App Core**: App 794 handles all fiscal years. Record Key `{Cycle_Code}-{Employee_Code}`.
- **Hoshin Governance**: MBO Hoshin Master (App 799) with Fiscal Year Scoping, Versioning, and Human Publication.
- **Carry Forward**: Whitelist copy of planning fields only. Never clone whole record.
- **COCE Governance**: Evaluated = YES, Included_In_Score = NO (excluded from Part B divisor and sum).

## 2. Hard Write Lock
- **STRICT READ-ONLY SAFETY**: Zero POST/PUT/DELETE calls to Kintone during Discovery Phase.
