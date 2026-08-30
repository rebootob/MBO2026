# AI ACTIVE TASK — D1 PASSWORD RESET ADMIN SURFACE / APP800 AUTHORITY & CUSTOMIZATION BINDING DISCOVERY

Mode: **ANTIGRAVITY READ-ONLY DISCOVERY ONLY — GET ONLY / NO SOURCE CHANGE / NO LIVE WRITE / NO DEPLOY / NO PASSWORD RESET**  
Branch: `ai/antigravity-wp002c`

## 1. Why We Are Doing This

D1 requires HR-authorized users and `admin-form` to be able to reset one employee's MBO password safely.

The reset engine already exists in:
`src/ui/mbo-kintone-auth-adapter.js`

Current App800 UI source:
`src/ui/hr-control-center.js`

is a read-only dashboard and does not yet expose the production reset action.

Before adding a Reset Password button, prove the real App800 security/binding so we do not guess who HR is or deploy through the wrong path.

## 2. Confirmed Design Constraints

- HR Control Center native authority target = `HR_ADMIN_GROUP` according to the frozen HRCC architecture.
- `admin-form` must retain technical password-reset/recovery authority under `D1_AUTH_SECURITY.md`.
- employee/shared principals must NOT receive the administrative reset UI.
- UI hiding is not the security boundary; native Kintone App800 access/permissions must be part of the authority design.
- do not revive any external Auth Bridge/service architecture.

## 3. Exact Read-Only Discovery

Use existing local/Kintone credentials and existing safe tooling. GET/read only.

### A. App800 actual customization
Read Live and Preview App800 customization and record:
- revision;
- scope;
- Desktop JS/CSS counts, order and entry names;
- Mobile JS/CSS counts;
- file identities/hashes where existing GET-only file read tooling supports it.

Determine whether deployed App800 resources correspond to repository sources:
- `src/ui/hr-control-center.js`
- `src/styles/hr-control-center.css`

If exact source-to-deployed correspondence cannot be proven, report `UNKNOWN`.

### B. App800 authority
Read actual App800 permission/access configuration and establish, without changing anything:
- whether `HR_ADMIN_GROUP` exists;
- App800 permission row(s) for `HR_ADMIN_GROUP`;
- App800 access of `admin-form` or the native principal/group that grants it access;
- whether shared employee/access principals have App800 access;
- `GROUP:everyone` behavior where visible from current configuration.

Do not change group membership or permissions.

### C. Future App800 build/deploy binding
Inspect repository tooling only and report:
- whether an App800 build entrypoint already exists;
- whether an App800 customization deploy script/path already exists;
- if not, state the smallest missing tooling requirement.

Do NOT create the tooling in this task.

## 4. Forbidden

```text
SOURCE_TEST_DIST_CHANGE        = 0
APP800_RECORD_WRITE            = 0
APP801_RECORD_WRITE            = 0
APP794_RECORD_WRITE            = 0
SCHEMA_LAYOUT_ACL_PROCESS_WRITE = 0
CUSTOMIZATION_UPLOAD           = 0
DEPLOY                         = 0
PASSWORD_RESET                 = 0
ROLLBACK                       = 0
POST                           = 0
PUT                            = 0
DELETE                         = 0
```

Do not modify Control Center or Active Task.
Do not add source/test/script/config/package files.
Do not use or revive `services/mbo-auth-bridge/`.

## 5. Evidence File

Create only:
`project-docs/D1_APP800_PASSWORD_RESET_AUTHORITY_DISCOVERY_EVIDENCE.md`

This Git evidence file may be committed/pushed after the read-only checks. It must include:
- `STATUS = PENDING_CHATGPT_REVIEW`;
- timestamp;
- current branch HEAD observed before discovery;
- App800 Live/Preview customization state;
- authority/permission findings;
- `HR_ADMIN_GROUP` finding;
- `admin-form` access finding;
- shared-principal App800 access finding;
- existing App800 build/deploy-path finding;
- all unknowns explicitly marked UNKNOWN;
- GET count if available;
- POST/PUT/DELETE/upload/deploy/password-reset counts = 0.

Commit + push only this evidence file, then STOP.

Maximum executor status:
`D1_APP800_PASSWORD_RESET_AUTHORITY_DISCOVERY_CAPTURED_PENDING_CHATGPT_REVIEW`

## 6. Safety State

```text
APP794_ACCEPTED_LIVE_REVISION = 60
ACTIVE_DEPLOY_AUTH            = NONE
ACTIVE_KINTONE_WRITE_AUTH     = NONE
ROLLBACK_AUTH                 = NONE
NEXT_OWNER_AFTER_EXECUTION    = CHATGPT INDEPENDENT REVIEW
```
