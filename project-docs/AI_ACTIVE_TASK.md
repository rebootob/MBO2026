# AI ACTIVE TASK — APP795 ACCESS CORRECTION / AUTHORIZED ONE-SHOT

Mode: **USER + CONTROL PLANE LIVE SETTINGS CORRECTION — EXACT ONE-SHOT**
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
OLD CREATE-HANDLER DEFECT = RESOLVED
CREATE_INITIALIZATION_E2E = BLOCKED / APP795 READ 403
APP795_APP_ACL_REVISION = 8
APP795_APP_GROUP = PRIVATE / USER SCREENSHOT CONFIRMED
```

App795 is the authoritative routing master. App794 Create must read App795 and fail closed if routing cannot be read.

## Authorization

User explicitly authorized:
`อนุมัติ App795 Access Correction`

Authorization ID:
`APP795-ACCESS-CORRECTION-20260829-01`

Exact target: App795 settings only.

## Exact correction

### Stage 1 — ACL first while App795 remains Private

Preserve current CREATOR rights exactly.

Set exact App795 App ACL to:

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

Use the fresh current ACL revision when performing the write. Fail closed if the pre-write ACL no longer matches the reviewed baseline or revision is not the expected fresh value.

Immediately GET/read-back ACL and verify the exact three rows above.

### Stage 2 — App Group only after ACL read-back PASS

Only after Stage 1 read-back passes:
- change App795 App Group `Private -> Public`;
- make no other App Group change;
- visually/read-only verify App795 now shows `Public`.

Reason for order: the current stored `everyone` ACL is broad. Switching to Public before tightening ACL could temporarily expose Add/Edit/Delete.

### Stage 3 — user UAT

Under employee-facing Kintone principal `s1` with MBO Employee Code `0113`:
1. App795 read used by Create must no longer return 403;
2. `0113 -> Create New MBO` should complete create-show initialization;
3. do not save/create a business record merely for this check unless separately authorized.

## Critical one-shot rule

Authorization is considered consumed once the first App795 ACL write is attempted successfully at the transport/API layer.

If ACL write/read-back or App Group result is uncertain:
- STOP;
- no automatic retry;
- do not widen permissions;
- recover read-only evidence and return to Control Plane.

## Forbidden

- NO App795 record/routing-data write
- NO App794 deploy/retry/upload/ACL/record write
- NO App801 write
- NO source change
- NO routing data change
- NO workflow/scoring change
- NO Reset Password UI implementation in this task
- NO Auth Bridge / external service
- NO D2-D7 work

## Authorization state

```text
APP795 APP ACL WRITE     = YES / EXACT ONE-SHOT
APP795 APP GROUP WRITE   = YES / PRIVATE -> PUBLIC ONLY AFTER ACL READ-BACK PASS
APP795 RECORD WRITE      = NO
APP794 DEPLOY            = NO
APP794 ACL WRITE         = NO
APP794 RECORD WRITE      = NO
APP801 WRITE             = NO
SOURCE CHANGE            = NO
EXTERNAL SERVICE         = NO
D2-D7 WRITE              = NO
```

## Executor

Prefer user/Control Plane controlled settings execution for this narrow correction. Antigravity remains HOLD unless Control Plane explicitly delegates execution.

After correction and UAT evidence, STOP for independent review.