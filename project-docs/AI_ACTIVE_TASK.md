# AI ACTIVE TASK — D1 APP801 AUTHORITY READINESS R1 CORRECTIVE / RECORD + FIELD ACL PROOF

Mode: **ANTIGRAVITY READ-ONLY CORRECTIVE ONLY — GET ONLY / NO SOURCE CHANGE / NO LIVE WRITE / NO ACL WRITE / NO DEPLOY / NO PASSWORD RESET**  
Branch: `ai/antigravity-wp002c`

## 1. Why This Corrective Exists

The previous App801 authority-readiness evidence used incorrect record-ACL URLs:
- `/k/v1/app/record/acl.json?app=801`
- `/k/v1/preview/app/record/acl.json?app=801`

Both returned 404, so the evidence cannot conclude that App801 has no record-level ACL restrictions.

Correct Kintone settings endpoints are:
- Live record ACL: `/k/v1/record/acl.json`
- Preview record ACL: `/k/v1/preview/record/acl.json`

Because Password Reset writes App801 credential/session fields, also prove field-level permission state:
- Live field ACL: `/k/v1/field/acl.json`
- Preview field ACL: `/k/v1/preview/field/acl.json`

This task corrects evidence only. Do not change any permission or source.

## 2. Accepted Findings — Do Not Re-do Broad Discovery

Keep these unless fresh GET evidence shows drift:

```text
APP801_CREATOR_CODE                = admin-form
APP801_CREATOR_IS_ADMIN_FORM       = YES
APP801_APP_ACL_CREATOR             = App-level full rights
APP801_APP_ACL_MBO_EMPLOYEE_ACCESS = View YES / Edit YES / Add Delete Manage Import Export NO
APP801_APP_ACL_everyone            = DENIED
HR_ADMIN_GROUP_IN_APP801_ACL       = NO
HR_ADMIN_GROUP_IN_APP800_ACL       = NO
HR_ADMIN_GROUP_EXISTS_TENANT       = UNKNOWN
APP800_DISCOVERY_R1                = PASS
APP794_ACCEPTED_LIVE_REVISION      = 60
```

## 3. Exact Read-Only Corrective Checks

### A. App801 record-level permissions

GET only:
- `/k/v1/record/acl.json` with `app=801`
- `/k/v1/preview/record/acl.json` with `app=801`

Record separately:
- revision;
- number of rights/rules;
- each filter condition where present;
- relevant entities and `viewable`, `editable`, `deletable`, `includeSubs` values;
- whether Live and Preview align.

Decision must be one of:

```text
APP801_RECORD_ACL = NONE_CONFIGURED / RESTRICTIVE / NON_BLOCKING / UNKNOWN
```

Use `NONE_CONFIGURED` only if the valid canonical endpoint returns an empty rights list or equivalent explicit proof.

### B. App801 field-level permissions

GET only:
- `/k/v1/field/acl.json` with `app=801`
- `/k/v1/preview/field/acl.json` with `app=801`

Record separately:
- revision;
- all configured field ACL rules or an explicit empty state;
- whether any rule could prevent `admin-form` or an intended HR authority from viewing/editing Reset Password target fields.

Password Reset target fields include at least:
- `Password_Hash`;
- `Force_Password_Change`;
- `Failed_Attempts`;
- `Locked_Until`;
- `Credential_Version`;
- active Session fields used by D1 reset semantics;
- `Password_Changed_At` if written.

If exact field code differs in source/schema evidence, report the actual code; do not invent.

Decision must be one of:

```text
APP801_FIELD_ACL = NONE_CONFIGURED / RESTRICTIVE / NON_BLOCKING / UNKNOWN
```

### C. Final native authority readiness

Update the decision using App ACL + valid Record ACL + Field ACL evidence:

```text
ADMIN_FORM_RESET_NATIVE_AUTHORITY = READY / NOT_READY / UNKNOWN
HR_RESET_NATIVE_AUTHORITY         = READY / NOT_READY / UNKNOWN
PASSWORD_RESET_NATIVE_AUTHORITY_READINESS = READY / NOT_READY / UNKNOWN
```

Rules:
- `admin-form` READY only if App-level permission plus Record/Field ACL evidence does not block required App801 view/edit.
- HR READY only if an actual HR native principal/group has App800 access and App801 required access and is not blocked by Record/Field ACL.
- Overall READY requires both admin-form and HR paths.
- Current App800/App801 App ACL lacks `HR_ADMIN_GROUP`; unless a different actual HR native authority is proven, HR remains NOT_READY.

If NOT_READY, state the smallest missing native-permission change. Do not perform it.

## 4. Evidence Update

Update only:
`project-docs/D1_PASSWORD_RESET_ADMIN_AUTHORITY_READINESS_EVIDENCE.md`

Clearly mark the prior invalid record-ACL endpoint conclusion as superseded.

Required evidence additions:
- exact starting HEAD;
- correct Live + Preview record ACL endpoint results;
- correct Live + Preview field ACL endpoint results;
- Record ACL decision;
- Field ACL decision;
- admin-form readiness;
- HR readiness;
- overall readiness;
- smallest missing permission change if NOT_READY;
- GET count if available;
- POST/PUT/DELETE/ACL-write/group-write/upload/deploy/password-reset counts = 0.

## 5. Forbidden

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

Do not modify Control Center, Active Task, baselines, skills, source, tests, dist, scripts, config, package files.
Do not create/change groups or memberships.
Do not revive `services/mbo-auth-bridge/`.

## 6. Completion

Commit + push only the corrected evidence file, then STOP.

Maximum executor status:
`D1_APP801_AUTHORITY_READINESS_R1_CORRECTED_PENDING_CHATGPT_REVIEW`

## 7. Safety State

```text
APP794_ACCEPTED_LIVE_REVISION = 60
APP800_ACCEPTED_DISCOVERY_R1  = PASS
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ROLLBACK_AUTH                 = NONE
NEXT_OWNER_AFTER_EXECUTION    = CHATGPT INDEPENDENT REVIEW
```
