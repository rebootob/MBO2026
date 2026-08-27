# Skill — Dedicated Kintone Group for Access ACL

## Problem
A Kintone app is used through multiple operational/shared accounts, and maintaining one ACL row per account creates ongoing admin debt and inconsistency.

## Use When
Use when several Kintone principals need the same app-level permission set and future principals may be added.

## Pattern
Create one purpose-specific Kintone group, for example:

```text
<APP_OR_DOMAIN>_ACCESS
```

Then:
- grant app permission to the group, not each user individually;
- add/remove Kintone principals through group membership;
- keep `everyone` denied when the app is restricted;
- preserve a known admin/creator recovery path;
- use least privilege for the group.

Example least-privilege app ACL for a credential/read-update supporting app:

```text
View   = YES
Edit   = YES
Add    = NO
Delete = NO
Import = NO
Export = NO
Admin  = NO
```

Exact permissions must be adapted to the app's purpose.

## Benefits
- adding a new access account usually requires group membership only;
- no source-code change;
- no repeated app ACL redesign;
- easier audit of who gets the capability.

## Failure Modes
- falling back to `everyone` because group membership setup is inconvenient;
- creating per-user ACL rows in parallel with the group;
- removing pre-existing group members without proving ownership;
- granting app admin/import/export unintentionally;
- assuming group ACL provides per-employee isolation when accounts are shared.

## Safety Gates
- verify every intended principal exists before membership write;
- backup existing group membership when the group pre-exists;
- prefer additive membership reconciliation;
- backup app ACL before change;
- immediate read-back after group/ACL write;
- rollback on mismatch.

## Verification
Prove:
- group exists and is active;
- required principals are members;
- app ACL references the group;
- permissions equal the least-privilege target;
- `everyone` remains at the intended deny state;
- no unintended record ACL was introduced.

## Reuse Notes
Group-management APIs and permissions may differ from app APIs. If membership cannot be changed with the available credential, stop and use an authorized admin path rather than broadening app ACL.
