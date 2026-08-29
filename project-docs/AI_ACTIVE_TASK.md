# AI ACTIVE TASK — APP796 PERMISSION READ-ONLY DISCOVERY

Mode: **USER + CONTROL PLANE READ-ONLY — ANTIGRAVITY HOLD**
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
s1 + Employee 0113 / TMH2           = REQUESTER DENIED
TMH + Employee 0113 / TMH2          = REQUESTER AUTH PASS / FLOW ADVANCED
APP796 SCORING LOOKUP                = BLOCKED / 403 FORBIDDEN
```

Latest Live UAT under Kintone principal `tmh` and authenticated MBO Employee Code `0113` shows App795 routing/requester validation succeeds and create initialization advances to the App796 scoring lookup. Console then reports:

```text
GET /k/v1/records.json?app=796&query=Profile_Code... -> 403 Forbidden
[MBO V2] Scoring resolution info: No privilege to proceed.
Employee Profile Resolution Failed
```

This is not a reason to bypass routing or scoring source logic.

`CONFIRMED_BASELINE/ROUTING_WORKFLOW.md` defines `Requester_User` as the authoritative shared Kintone workflow/requester boundary.
`CONFIRMED_BASELINE/EVALUATION_CLASSES.md` defines the approved scoring profile families and requires reviewed/published scoring configuration.
`src/main-mbo-app.js` performs App796 as a read-only lookup for exactly one PUBLISHED Profile_Code + Fiscal Year record and fails closed on missing/duplicate/error.

## Exact next action — READ-ONLY ONLY

Under technical administrator Kintone account `admin-form`:
1. GET App796 App Permissions / ACL and revision;
2. report all permission rows with entity type/code and View/Add/Edit/Delete/Manage/Import/Export;
3. inspect App796 App Group from the Kintone Permissions-for-app UI (Private/Public);
4. do not change permissions or App Group yet;
5. do not write App796 scoring/profile records.

Need to determine whether App796 has the same Private-group / missing employee read-access condition previously observed on App795.

## Forbidden

- NO App796 ACL write
- NO App796 App Group write
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
APP796 ACL WRITE             = NO
APP796 APP GROUP WRITE       = NO
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

After App796 read-only permission evidence is reviewed, Control Plane will either close the blocker if access is already correct or propose an exact minimal View-only access correction and request new explicit authorization before any write.