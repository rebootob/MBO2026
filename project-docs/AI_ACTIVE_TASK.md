# AI ACTIVE TASK — HOLD / KINTONE-ONLY APP801 APPLY + LIVE VERIFY

Mode: **CONTROL PLANE + USER LIVE VERIFICATION — ANTIGRAVITY HOLD**
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
- Kintone principal `s1` previously received HTTP 403 / `CB_NO02` reading/opening App801.
- `s1` membership in `MBO_EMPLOYEE_ACCESS` = PASS.
- App801 permission row for `MBO_EMPLOYEE_ACCESS` = View YES / Edit YES / all Add/Delete/Manage/Import/Export NO.
- `Everyone` = denied.
- Root cause confirmed: App801 was in `Private` App Group, and Kintone warned that app permission settings are not applied to apps in Private group.
- User has changed App801 App Group to `Public` while preserving the permission rows above.

## Current task — APPLY + VERIFY ONLY

1. Ensure the App801 settings change is saved/applied in Kintone.
2. Under Kintone principal `s1`, verify App801 record read no longer returns `CB_NO02`.
3. Then perform one normal MBO Login test for Employee `0113` with the correct password.
4. Capture the exact result.
5. STOP. Do not make source changes yet.

Expected security state after apply:

```text
MBO_EMPLOYEE_ACCESS  View=YES  Edit=YES  Add/Delete/Manage/Import/Export=NO
Everyone             all NO
```

## Antigravity

HOLD.

Forbidden until a new Active Task:
- NO source changes
- NO Auth Bridge work
- NO external service/server
- NO App801 ACL/group changes beyond the user-applied App Group correction
- NO App801 manual credential mutation
- NO App794 deploy
- NO Deploy Guard work
- NO D2-D7 work
