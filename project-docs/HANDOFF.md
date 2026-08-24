# AI Handoff Document & Core Rules

## 1. Frozen Architecture Principles
- **Generic Routing Architecture (`GENERIC_ROUTING_ARCHITECTURE = FROZEN`, `DEC-019`, `DEC-020`)**: Twin-Status Engine (`Step N - ALL` / `Step N - ANY`). 6 Generic Slots + Dedicated HR Final Check (45 Native Statuses). Supports In-Flight Approver Reassignment on current record with full audit logging and Stage-Specific Snapshots.
- **Hoshin Governance (`HOSHIN_ARCHITECTURE = FROZEN`, `DEC-018`)**: HR Managed without approval workflow. Dual-Level submission gate. Ready versions strictly immutable.
- **Single Long-Lived App Core (`DEC-013`)**: App 794 handles all fiscal years. Record Key `{Cycle_Code}-{Employee_Code}`.
- **Annual Plan Carry Forward (`DEC-015`)**: Whitelist copy of planning fields only. Never clone whole record.
- **No Orphan / No Dead Artifacts (`DEC-016`)**: Complete 7-step retirement lifecycle for replaced fields/scripts (`Orphan Count = 0`).

## 2. Hard Write Lock
- **STRICT READ-ONLY SAFETY**: Zero POST/PUT/DELETE calls to Kintone during Discovery Phase.
