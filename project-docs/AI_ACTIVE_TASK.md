# AI ACTIVE TASK — HOLD / APP795 ACCESS CORRECTION AUTHORIZATION REQUIRED

Mode: **CONTROL PLANE + USER AUTHORIZATION — ANTIGRAVITY HOLD**
Branch: `ai/antigravity-wp002c`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Current accepted state

```text
APP794_CORRECTIVE_DEPLOY_ROUND_2 = PASS
APP794 LIVE customization revision = 45
EMPLOYEE_SELF_UI_LIVE_UAT = PASS
LOGOUT_VISIBLE_LIVE = PASS
LIST_TO_CREATE_SESSION_LIVE = PASS
OLD CREATE-HANDLER DEFECT = RESOLVED
CREATE_INITIALIZATION_E2E = BLOCKED / APP795 READ 403
APP795_APP_ACL_REVISION = 8
APP795_APP_GROUP = PRIVATE / USER SCREENSHOT CONFIRMED
APP795_ACCESS_CORRECTION = REQUIRED / NOT AUTHORIZED
```

App795 is the authoritative routing master. Runtime App794 create-show must read App795 `Routing_Key` and fail closed if it cannot.

Latest evidence establishes the cause of 403:
- stored App795 app ACL says `everyone` has View/Add/Edit/Delete;
- App795 is in the Kintone `Private` App Group;
- Kintone UI warns permission settings are not applied to apps in the Private group.

Do NOT bypass App795 in source.

## Proposed exact minimal correction — NOT YET AUTHORIZED

Target App795 only:
1. change App Group `Private -> Public`;
2. preserve App creator / Admin-Form full rights exactly;
3. add `MBO_EMPLOYEE_ACCESS` with:
   - View = YES
   - Add = NO
   - Edit = NO
   - Delete = NO
   - Manage App = NO
   - Import = NO
   - Export = NO
4. set `Everyone`: all permissions NO;
5. read back App795 permissions after change;
6. user-side `s1` read/Create-show UAT afterward.

Reason for coupled change: switching only to Public would activate the current overly broad `everyone` Add/Edit/Delete rights.

## Forbidden

- NO App795 App Group change before explicit authorization
- NO App795 ACL write before explicit authorization
- NO App795 record/routing data change
- NO App794 deploy/retry/upload/ACL/record write
- NO App801 write
- NO source change
- NO Reset Password UI implementation in this task
- NO Auth Bridge / external service
- NO D2-D7 work

## Authorization state

```text
APP795 APP GROUP WRITE = NO / AWAITING USER AUTHORIZATION
APP795 ACL WRITE       = NO / AWAITING USER AUTHORIZATION
APP795 RECORD WRITE    = NO
APP794 DEPLOY          = NO
APP794 ACL WRITE       = NO
APP794 RECORD WRITE    = NO
APP801 WRITE           = NO
SOURCE CHANGE          = NO
EXTERNAL SERVICE       = NO
D2-D7 WRITE            = NO
```

## Antigravity

HOLD. No executor task is active.

Control Plane must obtain a new explicit user authorization for the exact App795 access correction before any live settings write.