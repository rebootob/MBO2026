# AI ACTIVE TASK — D1 KINTONE-ONLY LIVE CUTOVER — AUTHORIZED STAGED EXECUTION

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Working branch: `ai/antigravity-wp002c`
> Accepted D1 source commit: `63796999a321a24e1cbd29ceaad82b43980fe8ea`
> User authorization: **D1 LIVE CUTOVER APPROVED**
> Mode: CONTROLLED LIVE KINTONE EXECUTION / MINIMUM SCOPE ONLY

## 0. AUTHORIZATION BOUNDARY

The user explicitly authorized D1 live cutover.

Authorized in this package:
1. live READ-ONLY discovery needed to prove exact Kintone facts;
2. backup/read-back of current App801 ACL and App794 customization before change;
3. App801 app permission change ONLY for the exact proven shared employee Kintone USER principal;
4. App794 D1 customization upload/deploy using the accepted `dist/mbo-employee-app.js` artifact, after backup;
5. live read-back verification after each change;
6. preparation for manual UI UAT.

NOT authorized in this package:
- App794 ACL change;
- App53/795/796 schema/process/data modification;
- D2-D7 work;
- migration;
- external gateway/server;
- broad refactor;
- `GROUP:everyone` App801 permission broadening;
- mass credential provisioning unless separately authorized below.

## 1. STAGE A — LIVE READ-ONLY PRECHECK (MANDATORY FIRST)

Before any write, prove and record:

### A1 — Exact shared employee Kintone principal
Do NOT invent this value.
Use live Kintone evidence to identify the exact USER code used by ordinary/shared employee access.

Required output:
`SHARED_EMPLOYEE_KINTONE_USER_CODE = <exact code> | NOT_PROVEN`

If NOT_PROVEN: STOP before any ACL write or deployment and report blocker.

### A2 — App801 current permission snapshot
Read exact current App801 app ACL and record ACL.
Save rollback evidence locally/repository evidence package without secrets.

Expected prior fact:
- CREATOR has rights;
- GROUP everyone denied;
- record ACL none.

If live state differs, report exact difference before write.

### A3 — App801 credential readiness
READ-ONLY inspect:
- total credential count;
- duplicate Employee_Code count/list;
- malformed Password_Hash / Account_Status / Force_Password_Change / lockout state count;
- exact presence/readiness of test employees `0118` and `0119`;
- whether initial Employee_Code/Employee_Code hash provisioning appears already complete.

DO NOT expose Password_Hash values in reports/logs.
Only report structural validity/counts.

Required:
`CREDENTIAL_0118_READY = YES|NO`
`CREDENTIAL_0119_READY = YES|NO`
`MASS_PROVISIONING_REQUIRED = YES|NO|UNKNOWN`

If 0118 or 0119 is not ready, STOP before deploy and report an exact provisioning candidate plan. Do NOT create credentials in this package.

### A4 — App794 customization snapshot
Read exact current live App794 JS customization slots/files.
Create backup/rollback evidence before replacing anything.
Identify exactly which current file/slot will be replaced or added.

Required:
`APP794_CURRENT_CUSTOMIZATION = <exact files/slots>`
`APP794_ROLLBACK_READY = YES|NO`

If rollback cannot be proven: STOP before deploy.

## 2. STAGE B — APP801 MINIMUM ACL CUTOVER (AUTHORIZED CONDITIONALLY)

Proceed ONLY if:
- `SHARED_EMPLOYEE_KINTONE_USER_CODE` is exactly proven;
- App801 current ACL has been backed up/read back;
- no unexpected ACL conflict exists.

Change App801 permission for ONLY that exact USER principal:

- View records = YES
- Edit records = YES
- Add records = NO
- Delete records = NO
- Import = NO
- Export = NO
- App administration/settings = NO

Preserve creator/admin recovery access.
Do NOT grant `GROUP:everyone`.
Do NOT add record ACL rules in this package unless the live platform requires an exact minimal rule to preserve the above behavior; if so STOP and report before widening scope.

After write, immediately read back and prove exact resulting permissions.

Required:
`APP801_ACL_CHANGE_EXECUTED = 1`
`APP801_SHARED_USER_VIEW = YES`
`APP801_SHARED_USER_EDIT = YES`
`APP801_SHARED_USER_ADD_DELETE_IMPORT_EXPORT = NO`
`APP801_GROUP_EVERYONE_REMAINS_DENIED = YES`

If read-back differs, rollback App801 ACL to backup and STOP.

## 3. STAGE C — APP794 D1 CUSTOMIZATION DEPLOY (AUTHORIZED CONDITIONALLY)

Proceed ONLY if:
- Stage B read-back PASS;
- 0118 and 0119 credentials are structurally READY;
- App794 rollback backup is ready;
- accepted artifact corresponds to D1 source commit `63796999...` or later reviewed control-only descendants with identical D1 artifact.

Deploy ONLY the accepted D1 App794 customization artifact.
Do not replace unrelated customization files.

After deploy:
- read back customization configuration;
- confirm the expected JS artifact is active;
- no unrelated slots changed.

If deployment/read-back fails, rollback to the exact backed-up App794 customization and STOP.

Required:
`KINTONE_DEPLOY_EXECUTED = 1`
`APP794_D1_CUSTOMIZATION_ACTIVE = YES|NO`
`UNRELATED_CUSTOMIZATION_CHANGED = NO`

## 4. STAGE D — MANUAL UI UAT GATE

After successful Stage B+C, STOP automated changes and prepare the user for manual UI UAT.

Manual UAT must prove:
1. App794/list shows MBO Login on entry;
2. login 0118 with current/default credential behavior;
3. Force Password Change when applicable;
4. reload/re-entry requires Login again;
5. new password login succeeds;
6. wrong password denied; lockout path visible;
7. Change Password requires correct current password;
8. Logout causes Login requirement again;
9. 0118 My MBO list shows only 0118 ordinary UI items;
10. Create auto-loads App53 -> App795 -> App796 -> Duplicate -> Record_Key without Employee ID re-entry;
11. detail/edit 0119 while authenticated 0118 is blocked;
12. no Password_Hash/raw secret rendered in UI/DOM/storage;
13. residual Access Check: 0118 own = ALLOW; 0119 = BLOCK in custom Employee Self path.

Known accepted limitation:
`DIRECT_URL_REST_HARD_ISOLATION = NOT_GUARANTEED_UNDER_SHARED_KINTONE_ACCOUNT`

Do NOT close D1 until manual UAT evidence is reviewed by ChatGPT.

## 5. CREDENTIAL PROVISIONING — EXPLICITLY NOT INCLUDED YET

If live precheck proves credentials are missing or incomplete, produce an exact dry-run provisioning plan only:
- source employee set from App53;
- exact candidate Employee_Code list/count;
- default password = Employee_Code;
- PBKDF2 hash only, no plaintext persistence;
- Force_Password_Change = YES;
- Account_Status = ACTIVE;
- duplicate/malformed exclusions;
- rollback/reconciliation plan.

Then STOP for separate provisioning authorization.

## 6. GIT / EVIDENCE

Before live change:
- `git pull --ff-only origin ai/antigravity-wp002c`
- record `HEAD_BEFORE`
- do not modify D1 source unless needed only for evidence scripts and approved scope;
- commit only evidence/control docs if changed;
- push only `ai/antigravity-wp002c`.

Do not commit secrets, raw Password_Hash values, API tokens, cookies, passwords, or confidential Kintone credentials.

## 7. FINAL EXECUTION REPORT

Report exactly:

```text
HEAD_BEFORE =
HEAD_AFTER =

SHARED_EMPLOYEE_KINTONE_USER_CODE =
APP801_ACL_BACKUP_READY =
APP801_ACL_CHANGE_EXECUTED = 0|1
APP801_SHARED_USER_VIEW =
APP801_SHARED_USER_EDIT =
APP801_SHARED_USER_ADD_DELETE_IMPORT_EXPORT =
APP801_GROUP_EVERYONE_REMAINS_DENIED =

APP801_CREDENTIAL_COUNT =
APP801_DUPLICATE_EMPLOYEE_CODES =
APP801_MALFORMED_CREDENTIAL_COUNT =
CREDENTIAL_0118_READY =
CREDENTIAL_0119_READY =
MASS_PROVISIONING_REQUIRED =

APP794_CURRENT_CUSTOMIZATION =
APP794_ROLLBACK_READY =
KINTONE_DEPLOY_EXECUTED = 0|1
APP794_D1_CUSTOMIZATION_ACTIVE =
UNRELATED_CUSTOMIZATION_CHANGED = NO

KINTONE_READS_EXECUTED =
KINTONE_WRITES_EXECUTED =
MANUAL_UAT_STATUS = NOT_STARTED | READY_FOR_USER

D1_STATUS = LIVE_CUTOVER_PENDING_MANUAL_UAT | BLOCKED_PRECHECK
```

Stop after Stage D handoff or any fail-closed blocker.
ChatGPT independently reviews live evidence before D1 closure.

---

# PROJECT CONTROL

- D1 Login + password change + employee-self MBO gate = IN_PROGRESS / SOURCE PASS / LIVE CUTOVER AUTHORIZED
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 Apps 283,310,305,643,307,640,715,716 -> App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 App800 HR Control Center end-to-end lifecycle = IN_PROGRESS
- D5 copy ONLY own prior Objective / Action Plan / Additional Agreement / Weight = MUST_FIX
- D6 integrated E2E/security/regression = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
