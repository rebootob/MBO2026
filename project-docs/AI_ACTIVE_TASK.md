# AI ACTIVE TASK — APP794 ACL CORRECTION AUTHORIZED / USER EXECUTION

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

## Exact user authorization — 2026-08-29

User explicitly approved: **App794 ACL Correction**.

Authorized write scope only:
- App794 App Permission / App ACL;
- preserve current CREATOR rights exactly;
- add `MBO_EMPLOYEE_ACCESS` with View=YES, Add=YES, Edit=YES, Delete=NO, Manage=NO, Import=NO, Export=NO;
- set `Everyone` to all permissions NO;
- one correction execution plus read-back verification.

Forbidden in this authorization:
- NO record ACL change;
- NO workflow change;
- NO App794 record write;
- NO customization/source change or deploy;
- NO App801 change;
- NO other app change;
- NO Auth Bridge / external service;
- NO D2-D7 work.

## Execution / verification

Control Plane provides a fail-closed Kintone Console script for `admin-form` that:
1. GETs current App794 ACL;
2. requires exactly the expected current CREATOR + everyone state before writing;
3. preserves CREATOR rights exactly;
4. PUTs only the exact three-row target ACL for App794;
5. GETs App794 ACL again and verifies exact target state;
6. does not print business record contents.

Authorization is consumed after the one successful ACL write attempt. If preconditions differ, fail closed and do not write.

## Authorization state

```text
APP794 ACL WRITE    = YES / EXACT ONE-EXECUTION AUTHORIZATION
APP794 DEPLOY       = NO
APP794 RECORD WRITE = NO
APP801 WRITE        = NO
SOURCE CHANGE       = NO
EXTERNAL SERVICE    = NO
D2-D7 WRITE         = NO
```

## Antigravity

HOLD.
Do not start ACL changes, deploy, source changes, App801 work, Auth Bridge work, or D2-D7 work. User/Control Plane owns this exact ACL correction and read-back.
