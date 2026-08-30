# AI ACTIVE TASK — D1 PASSWORD RESET ADMIN AUTHORITY READINESS / APP801 + HR NATIVE ACCESS DISCOVERY

Mode: **ANTIGRAVITY READ-ONLY DISCOVERY ONLY — GET ONLY / NO SOURCE CHANGE / NO LIVE WRITE / NO ACL WRITE / NO DEPLOY / NO PASSWORD RESET**  
Branch: `ai/antigravity-wp002c`

## 1. Why We Are Doing This

App800 authority/binding discovery R1 is independently accepted.

Confirmed:
- App800 creator is `admin-form`;
- App800 ACL gives CREATOR authority and denies GROUP:everyone;
- `HR_ADMIN_GROUP` is not currently present in App800 ACL;
- tenant existence of `HR_ADMIN_GROUP` remains UNKNOWN;
- Password Reset engine already exists and its credential semantics are separately tested.

Before adding a write-capable Reset Password UI, prove the **native App801 authority path** because reset writes exactly one existing App801 credential row.

This task is discovery only. Do not implement the button yet.

## 2. Exact Read-Only Checks

### A. App801 app identity and App ACL

GET-only read App801 metadata and App ACL.

Record:
- app revision where returned;
- `creator.code` / `creator.name`;
- all App ACL rows relevant to:
  - `CREATOR`;
  - `admin-form` if explicitly present;
  - `HR_ADMIN_GROUP` if present;
  - `MBO_EMPLOYEE_ACCESS`;
  - `GROUP:everyone`;
  - any other principal that appears to grant HR/admin credential-recovery access.

For each relevant row record at least:
- appEditable;
- recordViewable;
- recordAddable;
- recordEditable;
- recordDeletable;
- recordImportable;
- recordExportable.

Do not infer `CREATOR = admin-form` unless App801 metadata proves the exact creator code.

### B. App801 record-level ACL

GET-only inspect App801 record-permission configuration using the appropriate Kintone record ACL/settings endpoint if supported by current safe tooling.

Record:
- whether record-level ACL rules exist;
- relevant entities and permissions if present;
- whether any rule would block or narrow an otherwise app-level HR/admin edit path.

If the endpoint/tool cannot prove it, state `UNKNOWN`; do not invent.

### C. HR native authority readiness

Determine, from actual read-only evidence:

```text
ADMIN_FORM_CAN_VIEW_APP801 = YES / NO / UNKNOWN
ADMIN_FORM_CAN_EDIT_APP801 = YES / NO / UNKNOWN
HR_ADMIN_GROUP_IN_APP801_ACL = YES / NO
HR_ADMIN_GROUP_CAN_VIEW_APP801 = YES / NO / UNKNOWN
HR_ADMIN_GROUP_CAN_EDIT_APP801 = YES / NO / UNKNOWN
```

Separately preserve:

```text
HR_ADMIN_GROUP_IN_APP800_ACL = YES / NO
HR_ADMIN_GROUP_EXISTS_IN_TENANT = YES / NO / UNKNOWN
```

For tenant existence, use a safe read-only User API path only if current authenticated tooling supports it. If unsupported/403/404/unavailable, keep `UNKNOWN`.

Do not create groups or change memberships.

### D. App800 no-drift recheck

GET-only re-read App800 App ACL only enough to confirm whether the accepted R1 authority condition has drifted:
- CREATOR/admin-form route still present;
- GROUP:everyone still denied;
- `HR_ADMIN_GROUP` still absent or report if it now exists.

Do not re-run broad customization/source discovery.

## 3. Decision Data Required

The evidence must state one of:

```text
PASSWORD_RESET_NATIVE_AUTHORITY_READINESS = READY
PASSWORD_RESET_NATIVE_AUTHORITY_READINESS = NOT_READY
PASSWORD_RESET_NATIVE_AUTHORITY_READINESS = UNKNOWN
```

`READY` only if both production authority paths are supportable by actual native permissions:
- `admin-form` technical recovery path;
- HR-authorized path to App800 and App801 edit.

If HR group is absent or cannot edit App801, use `NOT_READY` and identify the smallest missing native-permission change. Do not perform that change.

## 4. Forbidden

```text
SOURCE_TEST_DIST_CHANGE         = 0
NEW_SCRIPT_CONFIG_PACKAGE_FILE  = 0
APP800_RECORD_WRITE             = 0
APP801_RECORD_WRITE             = 0
APP794_RECORD_WRITE             = 0
SCHEMA_LAYOUT_ACL_PROCESS_WRITE = 0
GROUP_MEMBERSHIP_WRITE          = 0
CUSTOMIZATION_UPLOAD            = 0
DEPLOY                          = 0
PASSWORD_RESET                  = 0
ROLLBACK                        = 0
POST                            = 0
PUT                             = 0
DELETE                          = 0
```

Do not modify Control Center, Active Task, baseline, skills, source, tests, dist, scripts, config, or package files.
Do not revive `services/mbo-auth-bridge/`.

## 5. Evidence File

Create only:
`project-docs/D1_PASSWORD_RESET_ADMIN_AUTHORITY_READINESS_EVIDENCE.md`

Required contents:
- `STATUS = PENDING_CHATGPT_REVIEW`;
- timestamp;
- exact starting branch HEAD;
- App801 metadata/creator proof;
- App801 App ACL relevant rows;
- App801 record ACL finding or UNKNOWN;
- admin-form App801 view/edit decision;
- HR_ADMIN_GROUP App800/App801 finding;
- HR_ADMIN_GROUP tenant existence finding or UNKNOWN;
- final `PASSWORD_RESET_NATIVE_AUTHORITY_READINESS` decision;
- smallest missing permission change if NOT_READY;
- GET count if available;
- POST/PUT/DELETE/ACL-write/group-write/upload/deploy/password-reset counts = 0.

Commit + push only this evidence file, then STOP.

Maximum executor status:
`D1_PASSWORD_RESET_ADMIN_AUTHORITY_READINESS_CAPTURED_PENDING_CHATGPT_REVIEW`

## 6. Safety State

```text
APP794_ACCEPTED_LIVE_REVISION = 60
APP800_ACCEPTED_DISCOVERY_R1  = PASS
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ROLLBACK_AUTH                 = NONE
NEXT_OWNER_AFTER_EXECUTION    = CHATGPT INDEPENDENT REVIEW
```
