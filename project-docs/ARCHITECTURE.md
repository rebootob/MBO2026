# System Architecture Document

## 1. Routing Model Architecture
The routing subsystem decouples hierarchy sequence from intra-level approval conditions:

```
[App 795 Routing Master]
   ├── Section_Code (e.g. TME1)
   ├── Requester_User [USER_SELECT]
   ├── Manager_Level1_Approvers [USER_SELECT] + Manager_Level1_Approval_Rule (Default: ALL)
   ├── Manager_Level2_Approvers [USER_SELECT] + Manager_Level2_Approval_Rule (Default: ALL)
   ├── GM_Level1_Approvers [USER_SELECT] + GM_Level1_Approval_Rule (Default: ALL)
   └── GM_Level2_Approvers [USER_SELECT] + GM_Level2_Approval_Rule (Default: ALL)
             │
             ▼ (On Employee Lookup Snapshot)
[App 794 MBO V2 Record]
   ├── Immutable Historical Routing Snapshot
   └── Derived Routing_Topology (M1_G1, M1_M2_G1, M1_G1_G2, M1_M2_G1_G2)
```

## 2. Process Management Mapping
- Dynamic transition filter conditions automatically evaluate `Has_Manager_Level2` and `Has_GM_Level2` to route records without presenting multiple ambiguous action buttons to users.
