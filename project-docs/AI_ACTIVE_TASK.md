# AI ACTIVE TASK — HOLD / D1 PASSWORD RESET HR NATIVE AUTHORITY NOT READY

Mode: **NO ANTIGRAVITY EXECUTION — NO SOURCE CHANGE / NO LIVE WRITE / NO ACL WRITE / NO DEPLOY / NO PASSWORD RESET**  
Branch: `ai/antigravity-wp002c`

## 1. Review Closure

App801 authority-readiness R1 corrective is independently accepted.

```text
APP801_AUTHORITY_R1_REVIEW        = PASS
APP801_RECORD_ACL                 = NONE_CONFIGURED (Live + Preview rights=[])
APP801_FIELD_ACL                  = NONE_CONFIGURED (Live + Preview rights=[])
ADMIN_FORM_RESET_NATIVE_AUTHORITY = READY
HR_RESET_NATIVE_AUTHORITY         = NOT_READY
OVERALL_PASSWORD_RESET_AUTHORITY  = NOT_READY
```

Accepted executor evidence commit:
`63c4b45cb3654c1a320dbde611a5c7e560e57055`

## 2. Why We Are Holding

D1 requires both:
- `admin-form` technical recovery;
- HR-authorized Password Reset.

`admin-form` is now proven ready across App800/App801 App ACL plus App801 Record/Field ACL.

The HR route is not ready because:
- `HR_ADMIN_GROUP` is absent from App800 App ACL;
- `HR_ADMIN_GROUP` is absent from App801 App ACL;
- tenant existence/membership of `HR_ADMIN_GROUP` remains UNKNOWN;
- no alternative actual HR native principal/group has been proven for both required apps.

Do not implement/deploy the write-capable Reset Password UI as a production-ready HR feature until the HR native authority path is resolved.

## 3. Preferred Native Permission Target

Frozen architecture target remains `HR_ADMIN_GROUP` if that group actually exists.

Minimum Password Reset authority target:

```text
App800:
  recordViewable = YES

App801:
  recordViewable = YES
  recordEditable = YES
```

Keep least privilege:
- no App800 app administration for HR merely to Reset Password;
- no App801 add/delete/import/export/app administration for HR merely to Reset Password;
- keep GROUP:everyone denied;
- do not alter `MBO_EMPLOYEE_ACCESS` as a workaround;
- do not create/change a group or membership without a separate exact plan and authorization.

## 4. Current Required Input / Decision

Before any ACL provisioning task is opened, Control Plane needs one of these:

1. confirmation that the intended native HR group is exactly `HR_ADMIN_GROUP` and that it exists in the tenant; or
2. the exact existing Kintone user/group principal that should represent HR reset authority.

If this cannot be provided directly, a future narrow read-only/manual verification task may be used. Do not guess the principal.

## 5. Forbidden

```text
SOURCE_TEST_DIST_CHANGE         = 0
NEW_SCRIPT_CONFIG_PACKAGE_FILE  = 0
APP800_RECORD_WRITE             = 0
APP801_RECORD_WRITE             = 0
APP794_RECORD_WRITE             = 0
APP800_APP_ACL_WRITE            = 0
APP801_APP_ACL_WRITE            = 0
RECORD_FIELD_ACL_WRITE          = 0
GROUP_CREATION_MEMBERSHIP_WRITE = 0
CUSTOMIZATION_UPLOAD            = 0
DEPLOY                          = 0
PASSWORD_RESET                  = 0
ROLLBACK                        = 0
POST                            = 0
PUT                             = 0
DELETE                          = 0
```

Do not reuse any consumed authorization.
Do not revive `services/mbo-auth-bridge/`.

## 6. Safety State

```text
APP794_ACCEPTED_LIVE_REVISION = 60
APP800_DISCOVERY_R1           = PASS
APP801_AUTHORITY_R1           = PASS
ACTIVE_ACL_WRITE_AUTH         = NONE
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ROLLBACK_AUTH                 = NONE
ACTIVE_TASK                   = HOLD
OWNER                         = USER / CONTROL PLANE
ANTIGRAVITY                   = DO NOTHING
```
