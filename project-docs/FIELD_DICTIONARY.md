# Field Dictionary

## Routing Master (App 795) & Snapshot (App 794)

| Field Code | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `Section_Code` | SINGLE_LINE_TEXT | Section identifier (e.g. `TME1`) | Required |
| `Requester_User` | USER_SELECT | Authorized creators / employees | - |
| `Manager_Level1_Approvers` | USER_SELECT | Level 1 Manager Approvers | - |
| `Manager_Level1_Approval_Rule` | DROP_DOWN | Intra-level rule (`ALL` / `ANY`) | `ALL` |
| `Manager_Level2_Approvers` | USER_SELECT | Level 2 Manager Approvers (e.g. Mentor Manager) | - |
| `Manager_Level2_Approval_Rule` | DROP_DOWN | Intra-level rule (`ALL` / `ANY`) | `ALL` |
| `GM_Level1_Approvers` | USER_SELECT | Level 1 General Manager Approvers | - |
| `GM_Level1_Approval_Rule` | DROP_DOWN | Intra-level rule (`ALL` / `ANY`) | `ALL` |
| `GM_Level2_Approvers` | USER_SELECT | Level 2 General Manager Approvers | - |
| `GM_Level2_Approval_Rule` | DROP_DOWN | Intra-level rule (`ALL` / `ANY`) | `ALL` |
| `Has_Manager_Level2` | DROP_DOWN | `Yes` / `No` indicator | `No` |
| `Has_GM_Level2` | DROP_DOWN | `Yes` / `No` indicator | `No` |
| `Routing_Topology` | SINGLE_LINE_TEXT | Topology key (`M1_G1`, `M1_M2_G1`, etc.) | `M1_G1` |
