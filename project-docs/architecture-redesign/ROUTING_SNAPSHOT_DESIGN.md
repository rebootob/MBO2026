# Transaction Route Snapshot Schema in App 794

> **Document Status:** Complete (Updated with In-Flight Reassignment Fields)  
> **Target App:** App 794 Transaction Core  
> **Capacity:** 6 Generic Slots + 1 HR Slot  
> **Last Updated:** 2026-08-24  

---

## 1. App 794 Snapshot Field Definitions

| Slot | Role Field Code | Approver Field Code (`USER_SELECT`) | Rule Field Code | Active Flag | Effective Current Approver |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **Slot 1** | `Step_1_Role` | `Step_1_Approvers` | `Step_1_Rule` (`ALL`/`ANY`) | `Step_1_Active` (`YES`/`NO`) | `Step_1_Effective_Approvers` |
| **Slot 2** | `Step_2_Role` | `Step_2_Approvers` | `Step_2_Rule` (`ALL`/`ANY`) | `Step_2_Active` (`YES`/`NO`) | `Step_2_Effective_Approvers` |
| **Slot 3** | `Step_3_Role` | `Step_3_Approvers` | `Step_3_Rule` (`ALL`/`ANY`) | `Step_3_Active` (`YES`/`NO`) | `Step_3_Effective_Approvers` |
| **Slot 4** | `Step_4_Role` | `Step_4_Approvers` | `Step_4_Rule` (`ALL`/`ANY`) | `Step_4_Active` (`YES`/`NO`) | `Step_4_Effective_Approvers` |
| **Slot 5** | `Step_5_Role` | `Step_5_Approvers` | `Step_5_Rule` (`ALL`/`ANY`) | `Step_5_Active` (`YES`/`NO`) | `Step_5_Effective_Approvers` |
| **Slot 6** | `Step_6_Role` | `Step_6_Approvers` | `Step_6_Rule` (`ALL`/`ANY`) | `Step_6_Active` (`YES`/`NO`) | `Step_6_Effective_Approvers` |
| **HR** | `HR_Final_Role` | `HR_Final_Approvers` | Fixed (`ALL`) | Fixed (`YES`) | `HR_Final_Approvers` |

---

## 2. In-Flight Reassignment Audit Log Table
* Subtable / Event Log: `Routing_Reassignment_Log`
  - `Event_Type`: `APPROVER_REASSIGNED`
  - `Evaluation_Stage`: `OBJECTIVE` / `MID_YEAR` / `FINAL`
  - `Approval_Step`: `Step 1` ... `Step 6`
  - `Original_Approver`: User Code
  - `New_Approver`: User Code
  - `Reason`: Reason text
  - `Reassigned_By`: HR User Code
  - `Reassigned_At`: Timestamp
