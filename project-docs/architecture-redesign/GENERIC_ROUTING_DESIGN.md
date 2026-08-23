# Generic Approval Routing Architecture (App 795 Refactor)

> **Document Status:** Proposed  
> **Last Updated:** 2026-08-23  

---

## 1. Step-Based Generic Routing Model

The Generic Routing Architecture supports any approval hierarchy length (1 to 4 steps) across all corporate ranks without role hardcoding:

```
[ App 795 Generic Routing Master ]
  ├── Section_Code (e.g. TME1)
  ├── Route_Code (e.g. ROUTE_TME1_STAFF, ROUTE_TME1_MGR, ROUTE_EXEC)
  ├── Requester_User [USER_SELECT]
  │
  ├── Step_1_Role: "1st Appraiser / Manager"
  ├── Step_1_Approvers: [USER_SELECT] (Multi-user)
  ├── Step_1_Approval_Rule: "ALL" / "ANY" (Default: ALL)
  │
  ├── Step_2_Role: "2nd Appraiser / General Manager"
  ├── Step_2_Approvers: [USER_SELECT]
  ├── Step_2_Approval_Rule: "ALL" / "ANY" (Default: ALL)
  │
  ├── Step_3_Role: "3rd Appraiser / Vice President"
  ├── Step_3_Approvers: [USER_SELECT] (Optional / Can be empty)
  ├── Step_3_Approval_Rule: "ALL" / "ANY"
  │
  ├── Step_4_Role: "Executive Approver / President"
  ├── Step_4_Approvers: [USER_SELECT] (Optional / Can be empty)
  └── Step_4_Approval_Rule: "ALL" / "ANY"
```

* **Empty Step Behavior:** If `Step_i_Approvers` is empty, the workflow engine automatically skips `Step_i` without prompting user input.
