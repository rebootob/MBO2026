---
name: mbo-business-rules
description: Business logic, workflow rules, approval hierarchies, and privacy models
---

# MBO Business Rules

## 1. Sequential Approval Routing Architecture
The routing engine dynamically derives the approval topology per Section from App 795 (Routing Master):
- **Requester User**: `Requester_User` (`USER_SELECT`, multi-user supported)
- **Manager Level 1**: `Manager_Level1_Approvers` (`USER_SELECT`), `Manager_Level1_Approval_Rule` (`ANY` / `ALL`)
- **Manager Level 2**: `Manager_Level2_Approvers` (`USER_SELECT`), `Manager_Level2_Approval_Rule` (`ANY` / `ALL`)
  - If blank -> Skips Manager Level 2.
  - If present -> Must pass Manager Level 2.
- **GM Level 1**: `GM_Level1_Approvers` (`USER_SELECT`), `GM_Level1_Approval_Rule` (`ANY` / `ALL`)
- **GM Level 2**: `GM_Level2_Approvers` (`USER_SELECT`), `GM_Level2_Approval_Rule` (`ANY` / `ALL`)
  - If blank -> Skips GM Level 2.
  - If present -> Must pass GM Level 2 before final approval.

### Supported Approval Topologies:
1. **Topology 1 (M1 -> G1)**: Employee -> Manager L1 -> GM L1 (e.g. Pilot `TME1`: `suthas` -> `somrudee`).
2. **Topology 2 (M1 -> M2 -> G1)**: Employee -> Manager L1 -> Manager L2 -> GM L1.
3. **Topology 3 (M1 -> G1 -> G2)**: Employee -> Manager L1 -> GM L1 -> GM L2.
4. **Topology 4 (M1 -> M2 -> G1 -> G2)**: Full 4-level sequential approval.

## 2. Universal Return Action Rules
- **Manager Return**: Returns record to `01 Draft Objective` / `06 Employee Mid-Year` / `11 Employee Self Evaluation`.
- **GM Return**: Returns record to `01 Draft Objective` / `06 Employee Mid-Year` / `11 Employee Self Evaluation`.
- Single dynamic button labels in Process Management (`Submit`, `Approve`, `Return`) ensure users cannot manually pick arbitrary bypasses.

## 3. Privacy & Security Rules
- All Manager/GM scores, ratings, and confidential evaluation fields are strictly hidden from Appraisees across all stages.
