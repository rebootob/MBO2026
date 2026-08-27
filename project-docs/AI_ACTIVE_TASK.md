# AI ACTIVE TASK — D1 LIVE CUTOVER — STAGE A COMPLETION ONLY

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Working branch: `ai/antigravity-wp002c`
> Accepted D1 source commit: `63796999a321a24e1cbd29ceaad82b43980fe8ea`
> User authorization: **D1 LIVE CUTOVER APPROVED**
> Independently reviewed Stage A partial-evidence commit: `740767082c876a275ac7a709b15763e971b5e926`
> Mode: READ-ONLY LIVE PRECHECK COMPLETION ONLY / NO ACL WRITE / NO DEPLOY

## 0. REVIEW RESULT

Accepted evidence already captured:
- App801 ACL backup exists and shows CREATOR recovery rights plus GROUP:everyone denied;
- App794 customization backup exists and shows desktop JS `mbo-employee-app.js`, desktop CSS `mbo-employee.css`, revision 40;
- no App801 ACL write or App794 deploy evidence exists in Git after authorization.

Stage A is INCOMPLETE because the repository does not yet contain proof of:
1. exact ordinary/shared employee Kintone USER code;
2. App801 credential readiness/counts, especially 0118 and 0119;
3. mass-provisioning requirement classification;
4. explicit App794 rollback-ready conclusion.

Therefore Stage B/C MUST NOT execute yet.

## 1. EXECUTE ONLY STAGE A COMPLETION

Perform READ-ONLY Kintone discovery only.

### A1 — Prove exact shared employee Kintone principal
Use live Kintone/account evidence to identify the exact Kintone USER code used by the ordinary/shared employee account.

Do NOT infer it from employee codes, names, screenshots, old docs, or admin account identity.

Required output:
`SHARED_EMPLOYEE_KINTONE_USER_CODE = <exact code> | NOT_PROVEN`

If NOT_PROVEN, stop with `D1_STATUS = BLOCKED_PRECHECK`.

### A2 — App801 ACL read-back
Re-read current App801 app ACL + record ACL and compare with the existing backup.

Required:
- CREATOR recovery rights preserved;
- GROUP:everyone remains denied;
- record ACL state explicitly stated.

NO WRITE.

### A3 — App801 credential readiness
READ ONLY. Report structural information only; never reveal Password_Hash values.

Required:
- `APP801_CREDENTIAL_COUNT = <number>`
- `APP801_DUPLICATE_EMPLOYEE_CODES = <count + codes if any>`
- `APP801_MALFORMED_CREDENTIAL_COUNT = <number>`
- `CREDENTIAL_0118_READY = YES|NO`
- `CREDENTIAL_0119_READY = YES|NO`
- `MASS_PROVISIONING_REQUIRED = YES|NO|UNKNOWN`

A credential is structurally ready only if the expected Employee_Code exists exactly once and required auth state is valid enough for D1 browser login. Do not print the hash itself.

If 0118 or 0119 is not ready, prepare an exact provisioning DRY-RUN plan only and stop. Do not create/update credentials.

### A4 — App794 customization rollback readiness
Re-read current customization and compare with `scratch/app794_customize_backup.json`.

Required:
`APP794_CURRENT_CUSTOMIZATION = <exact slots/files>`
`APP794_ROLLBACK_READY = YES|NO`

Do not upload/deploy anything.

## 2. STRICTLY FORBIDDEN THIS ROUND

- NO App801 ACL write
- NO record permission write
- NO credential create/update/reset
- NO App794 customization upload/deploy
- NO App794 ACL change
- NO App53/795/796 write
- NO migration
- NO D2-D7 work
- NO external gateway/server
- NO GROUP:everyone broadening

Mandatory counters:

```text
APP801_ACL_CHANGE_EXECUTED = 0
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
```

## 3. GIT / EVIDENCE RULE

Do not commit secrets, passwords, raw Password_Hash values, API tokens, cookies, session material, or confidential credentials.

Prefer one sanitized evidence file under `project-docs/` rather than more raw scratch dumps.

Commit + push only to `ai/antigravity-wp002c`.

## 4. FINAL REPORT

```text
HEAD_BEFORE =
HEAD_AFTER =

SHARED_EMPLOYEE_KINTONE_USER_CODE =
APP801_ACL_BACKUP_READY = YES
APP801_RECORD_ACL_CURRENT =
APP801_ACL_CHANGE_EXECUTED = 0

APP801_CREDENTIAL_COUNT =
APP801_DUPLICATE_EMPLOYEE_CODES =
APP801_MALFORMED_CREDENTIAL_COUNT =
CREDENTIAL_0118_READY =
CREDENTIAL_0119_READY =
MASS_PROVISIONING_REQUIRED =

APP794_CURRENT_CUSTOMIZATION =
APP794_ROLLBACK_READY =

KINTONE_READS_EXECUTED =
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0

NEXT_STAGE_ELIGIBLE = YES|NO
D1_STATUS = STAGE_A_PASS_PENDING_INDEPENDENT_REVIEW | BLOCKED_PRECHECK
```

STOP after commit + push. Do not self-start Stage B even if `NEXT_STAGE_ELIGIBLE = YES`. ChatGPT performs independent review first.

---

# PROJECT CONTROL

- D1 Login + password change + employee-self MBO gate = IN_PROGRESS / SOURCE PASS / LIVE CUTOVER AUTHORIZED / STAGE A COMPLETION
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 Apps 283,310,305,643,307,640,715,716 -> App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 App800 HR Control Center end-to-end lifecycle = IN_PROGRESS
- D5 copy ONLY own prior Objective / Action Plan / Additional Agreement / Weight = MUST_FIX
- D6 integrated E2E/security/regression = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
