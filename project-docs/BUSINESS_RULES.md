# MBO Business Rules & Workflow Specification

## 1. Dynamic Sequential Approval Hierarchy
- **Master Data Source**: App 795 (Routing Master Sandbox).
- **Snapshot Storage**: App 794 (MBO V2 Sandbox).
- **Routing Topologies**:
  - `M1_G1`: Manager L1 -> GM L1
  - `M1_M2_G1`: Manager L1 -> Manager L2 -> GM L1
  - `M1_G1_G2`: Manager L1 -> GM L1 -> GM L2
  - `M1_M2_G1_G2`: Manager L1 -> Manager L2 -> GM L1 -> GM L2

## 2. Pilot Section (TME1) Configuration
- `Section_Code`: `TME1`
- `Requester_User`: `e1`
- `Manager_Level1_Approvers`: `suthas` (Rule: `ANY`)
- `Manager_Level2_Approvers`: `[]` (None)
- `GM_Level1_Approvers`: `somrudee` (Rule: `ANY`)
- `GM_Level2_Approvers`: `[]` (None)
- `Topology`: `M1_G1` (Direct route: Employee 0149 -> suthas -> somrudee)
