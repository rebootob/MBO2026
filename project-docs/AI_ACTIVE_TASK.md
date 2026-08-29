# AI ACTIVE TASK — HOLD / KINTONE-ONLY APP801 ACL RECONCILIATION

Mode: **CONTROL PLANE + USER READ-ONLY — ANTIGRAVITY HOLD**
Branch: `ai/antigravity-wp002c`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

Do not implement, deploy, host, integrate or extend `services/mbo-auth-bridge/`.

## Confirmed live evidence

- Employee `0113` App801 credential is healthy: ACTIVE / failed 0 / no lock / Force Change NO / Credential_Version 1.
- Kintone principal `s1` receives HTTP 403 / `CB_NO02` reading/opening App801.
- Current MBO Login failure is therefore caused by live App801 effective permission, not employee lock/disable.

## Approved target

`MBO_EMPLOYEE_ACCESS` App801 permissions:

```text
View records   = YES
Edit records   = YES
Add records    = NO
Delete records = NO
Import         = NO
Export         = NO
App Admin      = NO
```

`GROUP:everyone` stays denied.

## Current task — READ-ONLY ONLY

Control Plane + user verify:
1. `s1` membership in `MBO_EMPLOYEE_ACCESS`;
2. current App801 App Permissions;
3. identify exact gap: membership, app permission, or both;
4. prepare minimal correction;
5. STOP before any write.

Any App801 ACL/group-membership write requires explicit user authorization.

## Antigravity

HOLD.

Forbidden until new Active Task:
- NO source changes
- NO Auth Bridge work
- NO external service/server
- NO App801 ACL/group write
- NO App801 record write
- NO App794 deploy
- NO Deploy Guard work
- NO D2-D7 work
