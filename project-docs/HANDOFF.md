# AI Handoff Document & Core Rules

## 1. Confirmed Architecture Principles
- **Hoshin Governance (`HOSHIN_ARCHITECTURE = FROZEN`)**: HR Managed without approval workflow. Dual-Level submission gate (BOTH Department AND Section Hoshins `Ready_For_MBO = YES`). Ready versions strictly immutable. Revisions via new version. Superseded versions retained permanently without altering content.
- **Single Long-Lived App Core**: App 794 handles all fiscal years. Record Key `{Cycle_Code}-{Employee_Code}`.
- **Annual Plan Carry Forward**: Whitelist copy of planning fields only. Never clone whole record.
- **No Orphan / No Dead Artifacts**: Complete 7-step retirement lifecycle for replaced fields/scripts (`Orphan Count = 0`).

## 2. Hard Write Lock
- **STRICT READ-ONLY SAFETY**: Zero POST/PUT/DELETE calls to Kintone during Discovery Phase.
