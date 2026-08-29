# AI ACTIVE TASK — HOLD / APP796 ACCESS CORRECTION AUTHORIZATION REQUIRED

Mode: **CONTROL PLANE + USER AUTHORIZATION — ANTIGRAVITY HOLD**
Branch: `ai/antigravity-wp002c`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Accepted current state

```text
APP794 LIVE customization revision = 45
EMPLOYEE_SELF_UI / LOGOUT           = PASS
OLD CREATE-HANDLER DEFECT           = RESOLVED
APP795 ACCESS CORRECTION            = PASS / AUTH CLOSED
s1 + Employee 0113 / TMH2           = REQUESTER DENIED / EXPECTED
TMH + Employee 0113 / TMH2          = REQUESTER AUTH PASS / FLOW ADVANCED
APP796 SCORING LOOKUP                = BLOCKED / 403 FORBIDDEN
APP796_APP_ACL_REVISION              = 5
APP796_APP_GROUP                     = PRIVATE / USER SCREENSHOT CONFIRMED
APP796_ACCESS_CORRECTION             = REQUIRED / NOT AUTHORIZED
```

Read-only discovery under `admin-form` established:
- App796 CREATOR has full rights;
- `Everyone` has all permissions NO;
- no explicit `MBO_EMPLOYEE_ACCESS` row exists;
- App796 is in the `Private` App Group;
- Kintone UI warns app permission settings are not applied to apps in the Private group.

App796 is the authoritative published scoring/profile configuration source. Do NOT bypass or hard-code App796 in source.

## Proposed exact minimal correction — NOT YET AUTHORIZED

Target App796 settings only:

### Stage 1 — ACL first while App796 remains Private
Preserve CREATOR full rights exactly.

Set exact App796 App ACL to:

```text
CREATOR:
  View       YES
  Add        YES
  Edit       YES
  Delete     YES
  Manage App YES
  Import     YES
  Export     YES

GROUP MBO_EMPLOYEE_ACCESS:
  View       YES
  Add        NO
  Edit       NO
  Delete     NO
  Manage App NO
  Import     NO
  Export     NO

GROUP everyone:
  View       NO
  Add        NO
  Edit       NO
  Delete     NO
  Manage App NO
  Import     NO
  Export     NO
```

Use fresh current ACL revision and fail closed if pre-write ACL drifts from the reviewed baseline. Immediately GET/read-back and verify exact three rows.

### Stage 2 — App Group only after Stage 1 read-back PASS
- change App796 App Group `Private -> Public` only;
- make no other settings change;
- visually/read-only verify App Group = Public.

### Stage 3 — User UAT
Under Kintone principal `tmh` + authenticated MBO Employee Code `0113`:
1. retry `Create New MBO`;
2. App796 scoring GET must no longer return 403;
3. create-show should advance beyond scoring lookup;
4. DO NOT Save/create a business record unless separately authorized.

## Forbidden

- NO App796 ACL/App Group change before explicit authorization
- NO App796 record/scoring-data write
- NO App795 ACL/App Group/record/routing write
- NO App794 deploy/retry/upload/ACL/record write
- NO App801 write
- NO source change
- NO workflow/routing/scoring business-data change
- NO Reset Password UI implementation in this task
- NO Auth Bridge / external service
- NO D2-D7 work

## Authorization state

```text
APP796 ACL WRITE             = NO / AWAITING USER AUTHORIZATION
APP796 APP GROUP WRITE       = NO / AWAITING USER AUTHORIZATION
APP796 RECORD/SCORING WRITE  = NO
APP795 ACL/GROUP WRITE       = NO / CLOSED
APP795 RECORD WRITE          = NO
APP794 DEPLOY                = NO
APP794 ACL WRITE             = NO
APP794 RECORD WRITE          = NO
APP801 WRITE                 = NO
SOURCE CHANGE                = NO
EXTERNAL SERVICE             = NO
D2-D7 WRITE                  = NO
```

## Antigravity

HOLD. No executor task is active.

Control Plane must obtain a new explicit user authorization for the exact App796 access correction before any live settings write.