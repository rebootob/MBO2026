# AI ACTIVE TASK — HOLD / KINTONE-ONLY RESET 0113 + LOGIN UAT

Mode: **CONTROL PLANE + USER LIVE EXECUTION — ANTIGRAVITY HOLD**
Branch: `ai/antigravity-wp002c`

## Mandatory architecture

```text
D1 = KINTONE-ONLY
External server/service = FORBIDDEN
Auth Bridge = CANCELLED / DO NOT CONTINUE
```

Do not implement, deploy, host, integrate or extend `services/mbo-auth-bridge/`.

## Confirmed live state

- `s1` membership in `MBO_EMPLOYEE_ACCESS` = PASS.
- App801 permission row = View YES / Edit YES / Add/Delete/Manage/Import/Export NO.
- App801 App Group changed from Private to Public by user.
- `s1` can now open App801 and see 128 credential records = PASS.
- Employee `0113` was ACTIVE / Credential_Version 1 before reset.
- User forgot 0113 password and explicitly authorized **Reset Password 0113**.
- HR + `admin-form` administrative MBO password-reset capability is now a confirmed D1 requirement.

## Current authorized action — EXACTLY ONE EMPLOYEE

Target: `Employee_Code = 0113` only.

Reset semantics:
- temporary password = `0113`, stored as canonical PBKDF2-SHA256 / 100000 hash;
- `Force_Password_Change = YES`;
- `Failed_Attempts = 0`;
- clear temporary `Locked_Until`;
- increment valid positive `Credential_Version` by exactly 1;
- clear `Session_Token_Hash`, `Session_Issued_At`, `Session_Expires_At`, `Session_Credential_Version`, `Session_Kintone_User`;
- do NOT change `Account_Status`;
- fail closed unless exactly one existing App801 row for 0113 is found and required security metadata is valid;
- read back after write without printing Password_Hash.

Authorization scope:

```text
APP801 RECORD WRITE 0113 = YES / ONE RESET
OTHER APP801 RECORDS      = NO
ACL / APP GROUP CHANGE    = NO
APP794 DEPLOY             = NO
SOURCE CHANGE             = NO
```

After successful reset:
1. switch/use Kintone principal `s1`;
2. App794 login with Employee Code `0113`, temporary password `0113`;
3. expected result = mandatory password-change UI;
4. capture result and STOP.

Do not test repeated wrong passwords yet.

## Antigravity

HOLD.

Forbidden until a new Active Task:
- NO source changes
- NO Auth Bridge work
- NO external service/server
- NO App801 writes beyond exact authorized 0113 reset
- NO App794 deploy
- NO Deploy Guard work
- NO D2-D7 work
