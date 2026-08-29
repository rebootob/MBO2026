# AI ACTIVE TASK — HOLD / KINTONE-ONLY 0113 FORCE-CHANGE LOGIN UAT

Mode: **CONTROL PLANE + USER LIVE VERIFICATION — ANTIGRAVITY HOLD**
Branch: `ai/antigravity-wp002c`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

## Confirmed live state

- `s1` membership in `MBO_EMPLOYEE_ACCESS` = PASS.
- App801 App Group correction = applied; `s1` can open App801 and see 128 records.
- Reset Password authorization for Employee `0113` was executed and is now CONSUMED.
- Reset read-back = PASS:
  - Account_Status ACTIVE unchanged
  - Force_Password_Change YES
  - Failed_Attempts 0
  - Locked_Until blank
  - Credential_Version 2
  - all session fields cleared
  - `RESET_0113_OVERALL_PASS = true`
- Temporary password for 0113 = `0113`.
- HR + `admin-form` administrative MBO reset capability remains a confirmed D1 requirement.

## Current task — LOGIN / FORCE CHANGE VERIFY ONLY

Using Kintone principal `s1`:
1. open App794;
2. login once with Employee Code `0113`, password `0113`;
3. expected result = mandatory password-change UI;
4. Employee-Self My MBO must not open before password change completes;
5. capture exact result and STOP.

Do not intentionally test wrong password or lockout now.

## Authorization state

```text
APP801 RESET 0113 WRITE = CONSUMED / NO FURTHER WRITE
OTHER APP801 WRITES     = NO
ACL / APP GROUP CHANGE  = NO
APP794 DEPLOY           = NO
SOURCE CHANGE           = NO
```

## Antigravity

HOLD.

Forbidden until a new Active Task:
- NO source changes
- NO Auth Bridge work
- NO external service/server
- NO App801 credential writes
- NO App794 deploy
- NO Deploy Guard work
- NO D2-D7 work
