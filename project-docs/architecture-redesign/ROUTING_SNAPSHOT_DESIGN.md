# Transaction Route Snapshot Schema in App 794

> **Document Status:** Complete  
> **Target App:** App 794 Transaction Core  
> **Capacity:** 6 Generic Slots + 1 HR Slot  
> **Last Updated:** 2026-08-24  

---

## 1. App 794 Snapshot Field Definitions

| Slot | Role Field Code | Approver Field Code (`USER_SELECT`) | Rule Field Code | Active Flag |
| :---: | :--- | :--- | :--- | :--- |
| **Slot 1** | `Step_1_Role` | `Step_1_Approvers` | `Step_1_Rule` (`ALL`/`ANY`) | `Step_1_Active` (`YES`/`NO`) |
| **Slot 2** | `Step_2_Role` | `Step_2_Approvers` | `Step_2_Rule` (`ALL`/`ANY`) | `Step_2_Active` (`YES`/`NO`) |
| **Slot 3** | `Step_3_Role` | `Step_3_Approvers` | `Step_3_Rule` (`ALL`/`ANY`) | `Step_3_Active` (`YES`/`NO`) |
| **Slot 4** | `Step_4_Role` | `Step_4_Approvers` | `Step_4_Rule` (`ALL`/`ANY`) | `Step_4_Active` (`YES`/`NO`) |
| **Slot 5** | `Step_5_Role` | `Step_5_Approvers` | `Step_5_Rule` (`ALL`/`ANY`) | `Step_5_Active` (`YES`/`NO`) |
| **Slot 6** | `Step_6_Role` | `Step_6_Approvers` | `Step_6_Rule` (`ALL`/`ANY`) | `Step_6_Active` (`YES`/`NO`) |
| **HR** | `HR_Final_Role` | `HR_Final_Approvers` | Fixed (`ALL`) | Fixed (`YES`) |

---

## 2. Snapshot Metadata
* `Routing_Snapshot_Date`: Timestamp when route was bound.
* `Routing_Source_Master_ID`: Record Key of App 795 route.
* `Routing_Master_Version`: Version integer of App 795 route.
