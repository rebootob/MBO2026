# MBO V2 Target System Architecture (FROZEN CORE ARCHITECTURES)

> **Document Status:** Complete (Core Architecture Baseline)  
> **Phase:** ARCHITECTURE DESIGN (READ-ONLY SAFETY LOCK ACTIVE)  
> **Core Subsystems:**
> 1. `HOSHIN_ARCHITECTURE = FROZEN` (`DEC-018`)
> 2. `GENERIC_ROUTING_ARCHITECTURE = FROZEN` (`DEC-019`, `DEC-020`, `DEC-021`)
> 3. `CONTROLLED_REOPEN_REVISION_MODEL = FROZEN` (`DEC-022`)
> 4. `EVALUATION_PROFILE_SCORING_ARCHITECTURE = FROZEN` (`DEC-023`, `DEC-024`)
> 5. `ANNUAL_EVALUATION_CYCLE = FROZEN` (`DEC-013`, `DEC-014`)
> 6. `ANNUAL_PLAN_CARRY_FORWARD = FROZEN` (`DEC-015`)
> 7. `PROJECT_GOVERNANCE_NO_ORPHAN = ACTIVE` (`DEC-016`)

---

## 1. Target Architecture Summary Matrix

| Subsystem Component | Target App | Frozen Architecture Model | Core Governance Directives |
| :--- | :---: | :--- | :--- |
| **Employee Master** | App 53 | Read-Only Master (`Drop_down` = Section, `Drop_down_0` = Dept) | Read Only |
| **Transaction Core** | App 794 | Single Long-Lived Unified App (`{Cycle}-{EmpCode}`), 45 Native Statuses | Frozen (`DEC-013`) |
| **Routing Master** | App 795 | Configuration-driven 6 Generic Slots + Dedicated HR Final Check, Flat Master | Frozen (`DEC-019`) |
| **Hoshin Master** | Target App | HR Managed, Dual-Level (Dept + Section), `Ready_For_MBO` Immutable Versioning | Frozen (`DEC-018`) |
| **Process Engine** | App 794 | Twin-Status Model (`Step N - ALL` / `Step N - ANY`) via native `filterCond` | Frozen (`DEC-019`) |
| **Approver Operations** | App 794 | Three Scopes (Future Master, Current Record Reassign, Bulk Preview Reassign) | Frozen (`DEC-021`) |
| **Reopen & Revision** | App 794 + Archive | Same Record / New Revision (`FY2027-0149`), Stage Revisions, Approval Invalidation | Frozen (`DEC-022`) |
| **Evaluation Profile** | App 794 | Annual Profile Freeze (Single Profile per FY), 4 Families, Standardized `WEIGHTED_PART_A_B` | Frozen (`DEC-023`, `DEC-024`) |
