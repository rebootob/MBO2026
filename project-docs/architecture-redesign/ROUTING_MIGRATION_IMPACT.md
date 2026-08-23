# App 795 Audit & No-Orphan Migration Impact

> **Document Status:** Complete  
> **Governance:** No Orphan / No Dead Artifact Policy (`DEC-016`)  
> **Last Updated:** 2026-08-24  

---

## 1. Audit of Current App 795 Schema

| Current Field in App 795 | Field Type | Legacy Role | Migration Action | Future Status |
| :--- | :--- | :--- | :--- | :--- |
| `Section_Code` | SINGLE_LINE_TEXT | Primary Scope Key | **KEEP** | Active Core |
| `Section_Name` | SINGLE_LINE_TEXT | Display Name | **KEEP** | Active Core |
| `Requester_User` | USER_SELECT | Requester Auth | **MIGRATE** to `Authorized_Requesters` (Multi-user) | Deprecate Old Single-User |
| `First_Manager_User` | USER_SELECT | Legacy Flat Model | **DEPRECATE** -> Migrate to `Step_1` | **REMOVE AFTER MIGRATION** |
| `Manager_User` | USER_SELECT | Legacy Flat Model | **DEPRECATE** -> Migrate to `Step_2` | **REMOVE AFTER MIGRATION** |
| `GM_User` | USER_SELECT | Legacy Flat Model | **DEPRECATE** -> Migrate to `Step_3` | **REMOVE AFTER MIGRATION** |
| `Manager_Level1_Approvers` | USER_SELECT | Intermediate Model | **MIGRATE** to `Step_1_Approvers` | **REMOVE AFTER MIGRATION** |
| `Manager_Level1_Approval_Rule` | DROP_DOWN | Intermediate Model | **MIGRATE** to `Step_1_Rule` | **REMOVE AFTER MIGRATION** |
| `Manager_Level2_Approvers` | USER_SELECT | Intermediate Model | **MIGRATE** to `Step_2_Approvers` | **REMOVE AFTER MIGRATION** |
| `Manager_Level2_Approval_Rule` | DROP_DOWN | Intermediate Model | **MIGRATE** to `Step_2_Rule` | **REMOVE AFTER MIGRATION** |
| `GM_Level1_Approvers` | USER_SELECT | Intermediate Model | **MIGRATE** to `Step_3_Approvers` | **REMOVE AFTER MIGRATION** |
| `GM_Level1_Approval_Rule` | DROP_DOWN | Intermediate Model | **MIGRATE** to `Step_3_Rule` | **REMOVE AFTER MIGRATION** |
| `GM_Level2_Approvers` | USER_SELECT | Intermediate Model | **MIGRATE** to `Step_4_Approvers` | **REMOVE AFTER MIGRATION** |
| `GM_Level2_Approval_Rule` | DROP_DOWN | Intermediate Model | **MIGRATE** to `Step_4_Rule` | **REMOVE AFTER MIGRATION** |

---

## 2. 7-Step Cleanup Procedure (During Implementation Phase)
1. Backup App 795 configuration and data.
2. Deploy new Generic Slot Fields (`Step_1` through `Step_6`).
3. Migrate existing pilot data (`TME1`: `Step 1 = suthas`, `Step 2 = somrudee`).
4. Execute automated regression tests (`npm test`).
5. Confirm zero references to legacy fields in JS, API, and Views.
6. Delete deprecated fields (`Manager_User`, `GM_User`, `Manager_Level1_Approvers`, etc.).
7. Update Documentation and mark Orphan Count = 0.
