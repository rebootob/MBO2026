# AI ACTIVE TASK — APP795 ACCESS CORRECTION PASS / USER CREATE-SHOW UAT

Mode: **USER + CONTROL PLANE LIVE UAT — ANTIGRAVITY HOLD**
Branch: `ai/antigravity-wp002c`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Accepted correction state

Authorization:
`APP795-ACCESS-CORRECTION-20260829-01`

User evidence confirms the exact authorized App795 settings correction completed:

```text
APP795 ACL revision              = 8 -> 9
CREATOR                          = full rights preserved
MBO_EMPLOYEE_ACCESS              = View only
Everyone                         = all permissions NO
APP795_ACL_CORRECTION_OVERALL_PASS = true
APP795 App Group                 = Public
```

Classification:
```text
APP795_ACCESS_CORRECTION         = PASS / USER LIVE EVIDENCE
APP795_ACCESS_CORRECTION_AUTH    = CONSUMED / CLOSED
APP795 APP ACL WRITE             = NO
APP795 APP GROUP WRITE           = NO
```

No further settings write is authorized from this authorization.

## Exact next action — User Live UAT only

Under employee-facing Kintone principal `s1` and authenticated MBO Employee Code `0113`:
1. open App794 My MBO;
2. click `+ Create New MBO`;
3. verify `/k/794/edit` opens without MBO re-login;
4. verify App795 routing GET no longer returns 403;
5. verify `Employee Profile Resolution Failed` is absent;
6. verify create-show fields initialize normally;
7. open Console and capture any remaining red error if present;
8. DO NOT click Save / create a business record in this UAT.

## Forbidden

- NO App795 ACL/App Group/record/routing write
- NO App794 deploy/retry/upload/ACL/record write
- NO App801 write
- NO source change
- NO workflow/scoring change
- NO Reset Password UI implementation in this task
- NO Auth Bridge / external service
- NO D2-D7 work

## Authorization state

```text
APP795 APP ACL WRITE   = NO / CLOSED
APP795 APP GROUP WRITE = NO / CLOSED
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

After user Create-show evidence is reviewed, Control Plane will determine whether D1 Create initialization passes or identify the next narrow blocker.