# AI Handoff Document & Core Rules

## 1. Frozen Architecture Principles
- **Generic Routing Architecture (`GENERIC_ROUTING_ARCHITECTURE = FROZEN`, `DEC-019`, `DEC-020`, `DEC-021`)**: Twin-Status Engine (`Step N - ALL` / `Step N - ANY`). 6 Generic Slots + Dedicated HR Final Check (45 Native Statuses). Supports HR Self-Service Approver Changes (Three Scopes, Three-Layer History).
- **Same Record / New Revision (`SAME_RECORD_NEW_REVISION = FROZEN`, `DEC-022`)**: 1 Employee + 1 FY = 1 Record (`FY2027-0149`). Never duplicate records. Reopen increments stage revision counter. Superseded revisions archived immutably (Option C Hybrid Model).
- **Hoshin Governance (`HOSHIN_ARCHITECTURE = FROZEN`, `DEC-018`)**: HR Managed without approval workflow. Dual-Level submission gate. Ready versions strictly immutable.
- **Single Long-Lived App Core (`DEC-013`)**: App 794 handles all fiscal years. Record Key `{Cycle_Code}-{Employee_Code}`.
- **Annual Plan Carry Forward (`DEC-015`)**: Whitelist copy of planning fields only from latest valid revision.
- **No Orphan / No Dead Artifacts (`DEC-016`)**: Complete 7-step retirement lifecycle for replaced fields/scripts (`Orphan Count = 0`).

## 2. Hard Write Lock
- **STRICT READ-ONLY SAFETY**: Zero POST/PUT/DELETE calls to Kintone during Discovery Phase.
