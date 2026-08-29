# AI ACTIVE TASK — D1 CREATE-SHOW PASS / NEXT HR+ADMIN RESET UI PLANNING

Mode: **CONTROL PLANE HOLD — NO LIVE WRITE / ANTIGRAVITY HOLD**
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
TMH + Employee 0113 / TMH2          = REQUESTER AUTH PASS
APP796 RUNTIME SCORING READ          = PASS / LIVE FLOW ADVANCED
D1 CREATE-SHOW INITIALIZATION        = PASS / USER LIVE SCREENSHOT
HR + admin-form RESET UI             = STILL OPEN / MANDATORY
```

## Latest Live UAT

Under Kintone principal `tmh` and authenticated MBO Employee Code `0113`, App794 `/k/794/edit` now renders the NEW RECORD custom MBO UI successfully.

Visible evidence confirms:
- employee profile autoloaded;
- Section `TMH2`;
- Position `Section Manager`;
- evaluation/approval route rendered;
- App795 requester validation passed under the correct shared principal `tmh`;
- prior App796 `403 Forbidden` is absent;
- prior `Employee Profile Resolution Failed` is absent;
- no business record Save was needed for this UAT.

Classification:
```text
D1_CREATE_SHOW_INITIALIZATION = PASS
APP795_RUNTIME_ROUTE_READ      = PASS
APP796_RUNTIME_SCORING_READ    = PASS
```

## App796 governance note

The user changed App796 permissions/App Group directly before the proposed explicit Control Plane write authorization was issued. Do not retroactively describe that settings write as authorized.

Current accepted effective state from user screenshots + functional UAT:
```text
APP796 App Group            = Public
CREATOR                     = full rights
MBO_EMPLOYEE_ACCESS         = View records only
Everyone                    = all permissions NO
```

No further App796 write is authorized.

## Next mandatory D1 implementation item

Implement production Reset MBO Password capability for:
- HR-authorized users;
- `admin-form` technical administrator.

Employee/shared principals must NOT receive this administrative capability.

Canonical reset semantics remain those in `CONFIRMED_BASELINE/D1_AUTH_SECURITY.md`:
- exact one selected existing App801 credential row;
- temporary password = exact Employee_Code;
- PBKDF2-SHA256 / 100000;
- `Force_Password_Change = YES`;
- `Failed_Attempts = 0`;
- clear temporary `Locked_Until`;
- increment `Credential_Version` exactly once;
- clear all session fields;
- may set `Password_Changed_At` for audit;
- MUST NOT change `Account_Status`;
- fail closed on missing/duplicate/malformed identity;
- no credential create/delete.

## Current hold / planning rule

Before issuing an Antigravity implementation task, Control Plane must inspect the existing administrative UI/surfaces and choose the smallest in-Kintone location for the reset function. Prefer extending an existing admin/HR surface rather than creating unnecessary new files/apps.

Any implementation task must initially be SOURCE/TEST ONLY. No live App801 mutation or App794/App800 deploy is implicitly authorized.

## Remaining D1 UAT after reset UI implementation

- same-tab reload continuity;
- new independent tab without token -> Login;
- expired/tampered session -> deny;
- different Kintone principal -> deny;
- Logout revoke/clear/reblock;
- own password change rotates credential/session;
- disabled/locked account cannot restore;
- wrong-password 5-attempt / 15-minute lockout (requires separate explicit App801 write authorization before live mutation);
- own detail/edit continuity;
- cross-employee detail/edit block;
- no raw session token/plaintext password/Password_Hash exposure;
- final independent D1 closure review.

## Forbidden now

- NO App796 ACL/App Group/record/scoring write
- NO App795 ACL/App Group/record/routing write
- NO App794 deploy/retry/upload/ACL/record write
- NO App801 live write
- NO source change until Control Plane issues the next exact implementation task
- NO Auth Bridge / external service
- NO D2-D7 write

## Authorization state

```text
APP796 ACL/GROUP WRITE       = NO
APP796 RECORD/SCORING WRITE  = NO
APP795 ACL/GROUP/RECORD      = NO / CLOSED
APP794 DEPLOY                = NO
APP794 ACL WRITE             = NO
APP794 RECORD WRITE          = NO
APP801 WRITE                 = NO
SOURCE CHANGE                = NO / HOLD UNTIL NEXT TASK
EXTERNAL SERVICE             = NO
D2-D7 WRITE                  = NO
```

## Antigravity

HOLD. No executor task is active.

When the user says `ต่อ` / `ต่อไป`, Control Plane should inspect the existing admin/HR surface and issue the smallest source/test-only task for the mandatory HR + `admin-form` Reset MBO Password UI.