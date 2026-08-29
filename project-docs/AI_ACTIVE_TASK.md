# AI ACTIVE TASK — APP795 ACL READ-ONLY DISCOVERY

Mode: **USER + CONTROL PLANE READ-ONLY — ANTIGRAVITY HOLD**
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
OLD kintone.app.record.get() HANDLER ERROR = RESOLVED
OLD AdminDiagnosticModel ERROR = ABSENT IN LATEST USER CONSOLE EVIDENCE
CREATE_INITIALIZATION_E2E = BLOCKED / APP795 READ 403
```

User Live evidence shows Create reaches `/k/794/edit`, then runtime query to App795 fails:
```text
GET /k/v1/records.json?app=795&query=Routing_Key... -> 403 Forbidden
Employee Profile Resolution Failed: ไม่มีสิทธิในการดำเนินการ
```

`CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` establishes App795 as the authoritative routing master and `Routing_Key` as the runtime lookup key. `src/services/routing-service.js` performs this as read-only `getRecords` and must fail closed if routing cannot be read/resolved.

## Exact next action

Under technical administrator `admin-form`, perform READ-ONLY inspection only:
1. GET App795 App Permissions / ACL and revision;
2. report all permission rows with entity type/code and View/Add/Edit/Delete/Manage/Import/Export flags;
3. determine whether `MBO_EMPLOYEE_ACCESS` exists and has View permission;
4. determine whether `Everyone` grants or denies View;
5. inspect App795 App Group placement from Kintone UI if needed, because a Private App Group can override/ignore app-level permissions;
6. do not modify any permission or App Group setting.

## Important classification

This is not a routing-business-source defect. Do NOT modify `routing-service.js` to bypass App795 or hard-code route data.

No App795 ACL correction is authorized yet. If read-only evidence proves an ACL/App Group defect, Control Plane must define the minimum correction and obtain a new explicit user authorization before any write.

## Forbidden

- NO App794 deploy/retry/upload/Preview PUT
- NO App794 ACL or business-record write
- NO App795 ACL write
- NO App795 record write
- NO App801 write
- NO source change
- NO routing data change
- NO Reset Password UI implementation yet
- NO Auth Bridge / external service
- NO D2-D7 work

## Authorization state

```text
APP794 DEPLOY        = NO
APP794 FILE UPLOAD   = NO
APP794 PREVIEW WRITE = NO
APP794 ACL WRITE     = NO
APP795 ACL WRITE     = NO
APP794 RECORD WRITE  = NO
APP795 RECORD WRITE  = NO
APP801 WRITE         = NO
SOURCE CHANGE        = NO
EXTERNAL SERVICE     = NO
D2-D7 WRITE          = NO
```

## Antigravity

HOLD. No executor implementation or live write task is active.

After App795 permission evidence is reviewed, Control Plane will either:
- close the blocker if permissions are already correct and investigate the next read-only cause; or
- propose an exact minimal App795 read-only access correction and request explicit authorization.