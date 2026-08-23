# Workflow States & Sequential Approval Topologies

## 1. Topologies Overview
- **Topology 1 (`M1_G1`)**: Employee -> Manager L1 -> GM L1 -> Approved
- **Topology 2 (`M1_M2_G1`)**: Employee -> Manager L1 -> Manager L2 -> GM L1 -> Approved
- **Topology 3 (`M1_G1_G2`)**: Employee -> Manager L1 -> GM L1 -> GM L2 -> Approved
- **Topology 4 (`M1_M2_G1_G2`)**: Employee -> Manager L1 -> Manager L2 -> GM L1 -> GM L2 -> Approved

## 2. Intra-Level Multi-Approver Rules
- **`ALL` (Default)**: Record remains in the current status until all assigned approvers execute the Approve action.
- **`ANY`**: Record advances immediately once any assigned approver executes the Approve action.

## 3. Return Actions
- Return actions universally return the record to the Appraisee draft stage (`01 Draft Objective` / `06 Employee Mid-Year` / `11 Employee Self Evaluation`).
