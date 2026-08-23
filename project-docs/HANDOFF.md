# AI Handoff Document & Core Rules

## 1. Routing Model Standards
- **Single Source of Truth**: Generic Sequential Model (`Manager_Level1/2_Approvers`, `GM_Level1/2_Approvers`, `Manager_Level1/2_Approval_Rule`, `GM_Level1/2_Approval_Rule`).
- **Legacy Fields**: `First_Manager_User`, `Manager_User`, `GM_User` are DEPRECATED.
- **DO NOT delete legacy fields from App 794** until Process Management workflow state assignees are migrated to generic level codes.
- **Default Rule = ALL**: Never default to `ANY`.

## 2. Key App IDs
- **App 53**: Employee Master (**READ ONLY**)
- **App 283**: Legacy PMS (**READ ONLY**)
- **App 794**: MBO V2 Sandbox (**ACTIVE DEVELOPMENT**)
- **App 795**: Routing Master Sandbox
