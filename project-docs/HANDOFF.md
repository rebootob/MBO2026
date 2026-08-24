# AI Handoff Document & Core Rules

## 1. Complete Baseline of Frozen Architectures
- **HR Control Center & Guided Workflow UX (`DEC-025`, `DEC-026`)**: Unified operations dashboard, employee monitor, multi-filter, self-service hubs (>= 95% IT independence), actionable alerts, and 5 Guided UX principles (What, Who, Why, Next, Where).
- **Controlled Reopen & Revision (`CONTROLLED_REOPEN_REVISION_MODEL = FROZEN`, `SAME_RECORD_NEW_REVISION = FROZEN`, `DEC-022`)**: 1 Employee + 1 FY = 1 Record (`FY2027-0149`). Reopen increments stage revision counter. Superseded revisions archived immutably (Option C Hybrid Model). Full authority matrix.
- **Evaluation Profile & Scoring (`EVALUATION_PROFILE_SCORING_ARCHITECTURE = FROZEN`, `DEC-023`, `DEC-024`)**: Annual Profile Freeze Policy (Single profile per FY). Mid-year promotion applies next FY. 4 Profile Families, `WEIGHTED_PART_A_B` algorithm, COCE excluded from score.
- **Four Distinct Snapshot Concepts**: Profile (Annual Snapshot), Routing (Stage Snapshot), Hoshin (Versioned Snapshot), Revision (Same Record New Revision).
- **Generic Routing Architecture (`GENERIC_ROUTING_ARCHITECTURE = FROZEN`, `DEC-019`, `DEC-020`, `DEC-021`)**: Twin-Status Engine (`Step N - ALL` / `Step N - ANY`). 6 Generic Slots + Dedicated HR Final Check (45 Native Statuses). Supports HR Self-Service Approver Changes.
- **Hoshin Governance (`HOSHIN_ARCHITECTURE = FROZEN`, `DEC-018`)**: HR Managed without approval workflow. Dual-Level submission gate. Ready versions strictly immutable.
- **Single Long-Lived App Core (`DEC-013`)**: App 794 handles all fiscal years. Record Key `{Cycle_Code}-{Employee_Code}`.
- **Annual Plan Carry Forward (`DEC-015`)**: Whitelist copy of planning fields only from latest valid revision.
- **No Orphan / No Dead Artifacts (`DEC-016`)**: Complete 7-step retirement lifecycle for replaced fields/scripts (`Orphan Count = 0`).

## 2. Hard Write Lock
- **STRICT READ-ONLY SAFETY**: Zero POST/PUT/DELETE calls to Kintone during Discovery Phase.
