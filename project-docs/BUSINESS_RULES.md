# MBO Business Rules & Workflow Specification

## 1. Approval Hierarchy: Levels vs. Approval Rules

### A. Approval Levels (Sequential)
- `Manager Level 1` -> `Manager Level 2` -> `GM Level 1` -> `GM Level 2`
- Empty Level = Bypassed automatically.

### B. Approval Rules (Intra-Level)
- **Standard Default**: **`ALL`**
- `ALL`: Every user in the level must approve.
- `ANY`: Any single user in the level can approve.

### C. Trainee Manager Pattern
- Manager Level 1 = Trainee Manager (`Manager_Level1_Approvers`)
- Manager Level 2 = Mentor Manager (`Manager_Level2_Approvers`)
- GM Level 1 = General Manager (`GM_Level1_Approvers`)
- This is a 3-level sequential flow (`M1 -> M2 -> G1`), NOT a multi-approver rule.

## 2. Master Data & Snapshot Model
- **App 795 (Routing Master)**: Master source per Section.
- **App 794 (MBO V2 Sandbox)**: Snapshot target per record.
- **Pilot Section (TME1)**:
  - Employee: `0149` (Mr.Gritchai Somphonkrang)
  - Manager L1: `suthas` (Rule: `ALL`)
  - Manager L2: `[]` (empty)
  - GM L1: `somrudee` (Rule: `ALL`)
  - GM L2: `[]` (empty)
  - Topology: `M1_G1` (Employee -> suthas -> somrudee -> Approved)
