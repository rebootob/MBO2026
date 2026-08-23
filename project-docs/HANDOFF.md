# AI Handoff Document & Core Rules

## 1. Golden Rules for Next AI
- **LEVEL != Number of Approvers**: Levels represent sequential stages (L1 -> L2).
- **ALL != Sequential**: `ALL` means all approvers *within the same level* must approve.
- **ANY != Skip Level**: `ANY` means *any one approver within that level* is sufficient.
- **Empty Level = Skip Level**: Blank approver list skips that stage automatically.
- **Default Rule = ALL**: Never default to `ANY`.
- **Never Hardcode Fields**: Do not create `Manager_User_1`/`Manager_User_2` to solve multi-approvers.

## 2. Key App IDs
- **App 53**: Employee Master (**READ ONLY**)
- **App 283**: Legacy PMS (**READ ONLY**)
- **App 794**: MBO V2 Sandbox (**ACTIVE DEVELOPMENT**)
- **App 795**: Routing Master Sandbox
