# AI Handoff Document & Core Rules

## 1. Confirmed Architecture Principles
- **Single Long-Lived App Core**: App 794 handles all fiscal years. Record Key `{Cycle_Code}-{Employee_Code}`.
- **Hoshin Governance (`DEC-018`)**: HR Managed without approval workflow. Submission requires BOTH Department AND Section Hoshins `Ready_For_MBO = YES`. Ready versions are strictly immutable. Revisions require creating a new version.
- **Annual Plan Carry Forward**: Whitelist copy of planning fields only. Never clone whole record.
- **No Orphan / No Dead Artifacts**: Complete 7-step retirement lifecycle for replaced fields/scripts (`Orphan Count = 0`).

## 2. Hard Write Lock
- **STRICT READ-ONLY SAFETY**: Zero POST/PUT/DELETE calls to Kintone during Discovery Phase.
