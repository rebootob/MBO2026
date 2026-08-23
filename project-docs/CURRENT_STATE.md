# Current Project State

- **Updated At**: 2026-08-23T22:15:00+07:00
- **Current Phase**: Legacy Routing Fields Deprecated; Target Sequential Model Enforced
- **Current Branch**: `develop`
- **Protected Apps**: App 53 (READ ONLY), App 283 (READ ONLY)
- **Active Sandbox Apps**: App 794 (MBO V2 Sandbox), App 795 (Routing Master Sandbox)

## Routing Model Status
- **Source of Truth**: Generic Sequential Model (`Manager_Level1_Approvers`, `Manager_Level2_Approvers`, `GM_Level1_Approvers`, `GM_Level2_Approvers`, Rules with Default `ALL`).
- **Legacy Fields**: `First_Manager_User`, `Manager_User`, `GM_User` marked as DEPRECATED (retained temporarily in App 794 until workflow settings transition).
- **All 35 Unit Tests PASS (100%)**.
