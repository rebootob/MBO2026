# AI ACTIVE TASK — HOLD / APP794 ACL CORRECTION AUTHORIZATION REQUIRED

Mode: **CONTROL PLANE + USER — ANTIGRAVITY HOLD**
Branch: `ai/antigravity-wp002c`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Current accepted state

`APP794_DEPLOY_GUARD_INTEGRATION = PASS / ACCEPTED AT 8fa69bec7683bd64dbbd65fd3adf38bd1535e29b`

App794 ACL read-only evidence under Kintone login `admin-form`:
- CREATOR has full rights;
- GROUP `everyone` currently has View/Add/Edit/Delete = true;
- `MBO_EMPLOYEE_ACCESS` row is absent;
- therefore Employee-Self Kintone-level Delete permission is not safely denied.

Current gate:
`APP794_DELETE_PERMISSION_READONLY_CHECK = FAIL / ACL CORRECTION REQUIRED`

## Target correction — not yet authorized

Minimum App794 App Permission target:
- `MBO_EMPLOYEE_ACCESS`: View=YES, Add=YES, Edit=YES, Delete=NO, Manage=NO, Import=NO, Export=NO;
- `Everyone`: all permissions NO;
- App creator / `admin-form`: retain technical administration rights.

Do not modify record ACL, workflow, customization, App801, or any other app in the same operation.

## Authorization state

```text
APP794 ACL WRITE    = NO / EXPLICIT USER AUTHORIZATION REQUIRED
APP794 DEPLOY       = NO
APP794 RECORD WRITE = NO
APP801 WRITE        = NO
SOURCE CHANGE       = NO
EXTERNAL SERVICE    = NO
D2-D7 WRITE         = NO
```

## Antigravity

HOLD.
Do not start ACL changes, deploy, source changes, App801 work, Auth Bridge work, or D2-D7 work until a new Active Task is issued after explicit user authorization.
