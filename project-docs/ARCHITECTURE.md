# MBO V2 Target System Architecture (FROZEN CORE ARCHITECTURES)

> **Document Status:** Complete (Frozen Core Architecture Design)  
> **Phase:** ARCHITECTURE DESIGN (READ-ONLY SAFETY LOCK ACTIVE)  
> **Frozen Subsystems:**
> 1. `HOSHIN_ARCHITECTURE = FROZEN` (`DEC-018`)
> 2. `GENERIC_ROUTING_ARCHITECTURE = FROZEN` (`DEC-019`, `DEC-020`)
> 3. `ANNUAL_EVALUATION_CYCLE = FROZEN` (`DEC-013`, `DEC-014`)
> 4. `ANNUAL_PLAN_CARRY_FORWARD = FROZEN` (`DEC-015`)
> 5. `PROJECT_GOVERNANCE_NO_ORPHAN = ACTIVE` (`DEC-016`)

---

## 1. Target Architecture Summary

| Component | Target App | Frozen Architecture Design | Governance Model |
| :--- | :---: | :--- | :--- |
| **Employee Master** | App 53 | Read-Only Master (`Drop_down` = Section, `Drop_down_0` = Dept) | Read Only |
| **Transaction Core** | App 794 | Single Long-Lived Unified App (`{Cycle}-{EmpCode}`), Stage Route Snapshots, 45 Native Statuses | Frozen |
| **Routing Master** | App 795 | Configuration-driven 6 Generic Slots + Dedicated HR Final Check, Flat Master Model | Frozen |
| **Hoshin Master** | Target App | HR Managed, Dual-Level (Dept + Section), `Ready_For_MBO` Immutable Versioning | Frozen |
| **Process Engine** | App 794 | Twin-Status Model (`Step N - ALL` / `Step N - ANY`) with native `filterCond` branching | Frozen |
| **Approver Change** | App 794 | Dual-Mode: Mode A (Controlled Stage Refresh) & Mode B (In-Flight Current Record Reassign) | Frozen |
