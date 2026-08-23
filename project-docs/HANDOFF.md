# AI Handoff Document

## 1. Sequential Approval Model
- **App 795 & App 794 Fields**:
  - `Manager_Level1_Approvers`, `Manager_Level1_Approval_Rule` (`ANY`/`ALL`)
  - `Manager_Level2_Approvers`, `Manager_Level2_Approval_Rule` (`ANY`/`ALL`)
  - `GM_Level1_Approvers`, `GM_Level1_Approval_Rule` (`ANY`/`ALL`)
  - `GM_Level2_Approvers`, `GM_Level2_Approval_Rule` (`ANY`/`ALL`)
  - `Has_Manager_Level2` (`Yes`/`No`), `Has_GM_Level2` (`Yes`/`No`), `Routing_Topology`
- **Pilot Section TME1**: `M1_G1` (`suthas` -> `somrudee`).

## 2. Key App IDs
- **App 53**: Employee Master (**READ ONLY**)
- **App 283**: Legacy PMS (**READ ONLY**)
- **App 794**: MBO V2 Sandbox (**ACTIVE DEVELOPMENT**)
- **App 795**: Routing Master Sandbox
