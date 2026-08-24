# AI Handoff Document & Core Rules

## 1. Phased Delivery Model Governance (`DEC-027`)
- **Strict 16-Phase Lifecycle**: Phase 0 (Blueprint) -> Phase 15 (Production Cutover).
- **Execution Rule**: Stop and report after every phase. Do NOT auto-start subsequent phases.
- **Three Modes**: Mode 1 (Implementer), Mode 2 (Verifier), Mode 3 (Tester/Auditor).
- **Zero Scope Creep**: Cross-phase items logged as `DEFERRED_OBSERVATION`. Architecture changes require formal `ARCHITECTURE_CHANGE_REQUEST` (ACR).

## 2. Complete Baseline of Frozen Architectures
- **Guided Workflow UX Governance (`GUIDED_WORKFLOW_UX_ARCHITECTURE = FROZEN`, `DEC-026`)**: 6 Core Questions, Single Business State source of truth, Double-encoded field states, Dynamic action bars.
- **HR Control Center (`HR_CONTROL_CENTER_ARCHITECTURE = FROZEN`, `DEC-025`)**: Single pane of glass for Monitor -> Diagnose -> Action, >= 95% HR self-service.
- **Controlled Reopen & Revision (`CONTROLLED_REOPEN_REVISION_MODEL = FROZEN`, `SAME_RECORD_NEW_REVISION = FROZEN`, `DEC-022`)**: 1 Employee + 1 FY = 1 Record (`FY2027-0149`). Stage revision counters, Option C Hybrid Archive, Approval invalidation.
- **Evaluation Profile & Scoring (`EVALUATION_PROFILE_SCORING_ARCHITECTURE = FROZEN`, `DEC-023`, `DEC-024`)**: Annual Profile Freeze Policy, 4 Profile Families, `WEIGHTED_PART_A_B` algorithm, COCE excluded from score.
- **Four Distinct Snapshot Concepts**: Profile (Annual Snapshot), Routing (Stage Snapshot), Hoshin (Versioned Snapshot), Revision (Same Record New Revision).
- **Generic Routing Architecture (`GENERIC_ROUTING_ARCHITECTURE = FROZEN`, `DEC-019`, `DEC-020`, `DEC-021`)**: Twin-Status Engine (`Step N - ALL` / `Step N - ANY`), 6 Generic Slots + Dedicated HR Final Check (45 Native Statuses).
- **Hoshin Governance (`HOSHIN_ARCHITECTURE = FROZEN`, `DEC-018`)**: HR Managed without approval workflow, Dual-Level submission gate, Ready versions immutable.
- **Single Long-Lived App Core (`DEC-013`)**: App 794 handles all fiscal years. Record Key `{Cycle_Code}-{Employee_Code}`.
- **Annual Plan Carry Forward (`DEC-015`)**: Whitelist copy of planning fields only from latest valid revision.
- **No Orphan / No Dead Artifacts (`DEC-016`)**: Complete 7-step retirement lifecycle (`Orphan Count = 0`).

## 3. Hard Write Lock
- **STRICT READ-ONLY SAFETY**: Zero POST/PUT/DELETE calls to Kintone during Discovery Phase.
