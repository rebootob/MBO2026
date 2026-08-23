---
name: mbo-business-rules
description: Comprehensive business rules, approval hierarchies, and privacy models
---

# MBO Business Rules & Approval Standards

## 1. Approval Routing Architecture: Levels vs. Approval Rules

The routing engine cleanly separates two distinct concepts:

### A. Approval Levels (Sequential Hierarchy)
- **Definition**: The linear sequence through which an MBO record progresses.
- **Hierarchy**:
  1. `Manager Level 1` (`Manager_Level1_Approvers`)
  2. `Manager Level 2` (`Manager_Level2_Approvers`)
  3. `GM Level 1` (`GM_Level1_Approvers`)
  4. `GM Level 2` (`GM_Level2_Approvers`)
- **Empty Level Rule**: If an approver level is empty (e.g. `Manager_Level2_Approvers = []`), that level is automatically bypassed.

### B. Approval Rules (Intra-Level Evaluation)
- **Definition**: The condition required to satisfy a single level when that level contains multiple approvers.
- **Default Rule**: **`ALL`** (Mandatory standard across all levels).
- **Options**:
  - **`ALL` (Default)**: Every approver assigned to this level must approve before the record can advance to the next level.
  - **`ANY`**: Any single approver within this level can approve to advance the record. Used only when an explicit business requirement allows approvers to act interchangeably.

### C. Critical Distinction: Multi-Approver vs. Sequential
- `Manager Level 1 = [User A, User B] with Rule = ALL`: Both User A and User B are peers in Level 1; both must approve, but order does not matter.
- `Manager Level 1 = [User A]` and `Manager Level 2 = [User B]`: Sequential hierarchy. User A (e.g., Trainee Manager) must approve first, followed by User B (e.g., Mentor Manager).

## 2. Supported Topologies
1. **Topology 1 (`M1_G1`)**: Employee -> Manager L1 -> GM L1 (e.g. Pilot `TME1`: `suthas` -> `somrudee`).
2. **Topology 2 (`M1_M2_G1`)**: Employee -> Manager L1 -> Manager L2 -> GM L1.
3. **Topology 3 (`M1_G1_G2`)**: Employee -> Manager L1 -> GM L1 -> GM L2.
4. **Topology 4 (`M1_M2_G1_G2`)**: Employee -> Manager L1 -> Manager L2 -> GM L1 -> GM L2.

## 3. Privacy & Security Rules
- All Manager/GM scores, ratings, and confidential evaluation fields are strictly hidden from Appraisees across all stages.
