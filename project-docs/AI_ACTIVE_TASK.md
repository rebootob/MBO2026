# AI ACTIVE TASK — D1 LIVE CUTOVER — DEDICATED MBO ACCESS GROUP SETUP

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Working branch: `ai/antigravity-wp002c`
> Accepted D1 source commit: `63796999a321a24e1cbd29ceaad82b43980fe8ea`
> Independently reviewed Stage A evidence commit: `2eb1e1a3eb0a1d54e048cfd935093ec284412a5d`
> User authorization: **D1 LIVE CUTOVER APPROVED**
> User approved permanent ACL model: **Dedicated Kintone Group**
> Target group code/name: `MBO_EMPLOYEE_ACCESS`
> User-supplied ordinary/shared Kintone principals: `f1`, `f2`, `f3`, `tmh`, `e1`, `s1`, `g_request`, `t1`, `t2`
> Mode: CONTROLLED LIVE GROUP/ACL SETUP + PROVISIONING DRY-RUN / NO CREDENTIAL WRITE / NO APP794 DEPLOY

## 0. CONTROL DECISION

Do NOT maintain App801 permissions as 9 separate USER ACL rows.

Permanent access model:

```text
Kintone access account(s)
  -> membership in MBO_EMPLOYEE_ACCESS
  -> App801 View/Edit permission through GROUP ACL

Employee MBO identity
  -> Employee_Code credential in App801
```

Future Kintone account additions must normally require only membership maintenance in `MBO_EMPLOYEE_ACCESS`, not source-code changes and not App801 ACL redesign.

`GROUP:everyone` remains denied.
`admin-form` remains Technical Admin only and is not employee business authority.

Known Kintone-only limitation remains: any Kintone principal with App801 View/Edit through this group can potentially use native/direct Kintone REST outside the custom UI to read credential hashes or modify credential records. This architecture does NOT provide native employee-level hard isolation.

## 1. PRE-WRITE VERIFICATION — MANDATORY

Before any group or ACL write, verify all 9 exact user codes exist and are active/usable Kintone principals:

```text
f1
f2
f3
tmh
e1
s1
g_request
t1
t2
```

Required report:

```text
PRINCIPAL_f1 = VERIFIED|NOT_FOUND|INACTIVE
PRINCIPAL_f2 = VERIFIED|NOT_FOUND|INACTIVE
PRINCIPAL_f3 = VERIFIED|NOT_FOUND|INACTIVE
PRINCIPAL_tmh = VERIFIED|NOT_FOUND|INACTIVE
PRINCIPAL_e1 = VERIFIED|NOT_FOUND|INACTIVE
PRINCIPAL_s1 = VERIFIED|NOT_FOUND|INACTIVE
PRINCIPAL_g_request = VERIFIED|NOT_FOUND|INACTIVE
PRINCIPAL_t1 = VERIFIED|NOT_FOUND|INACTIVE
PRINCIPAL_t2 = VERIFIED|NOT_FOUND|INACTIVE
MULTI_PRINCIPAL_COUNT_VERIFIED = <number>
```

If any is NOT_FOUND/INACTIVE: STOP before write and report exact blocker.
Do not guess substitutes.

## 2. GROUP DISCOVERY / BACKUP

READ current Kintone group state for exact code/name `MBO_EMPLOYEE_ACCESS`.

If group already exists:
- capture sanitized group metadata and current membership;
- verify it is not used for an unrelated purpose;
- prepare exact membership diff before changing anything.

If group does not exist:
- record `GROUP_EXISTED_BEFORE = NO`;
- creation is authorized after all 9 principals verify.

Do not commit passwords/tokens/session material.

Required:

```text
MBO_ACCESS_GROUP_EXISTED_BEFORE = YES|NO
MBO_ACCESS_GROUP_BACKUP_READY = YES|N/A
MBO_ACCESS_GROUP_PREVIOUS_MEMBERS = <codes only, sanitized>
```

## 3. LIVE GROUP SETUP — AUTHORIZED

Proceed ONLY when all 9 principals are VERIFIED.

Create group `MBO_EMPLOYEE_ACCESS` if it does not exist.
Then ensure these 9 exact principals are members:

```text
f1,f2,f3,tmh,e1,s1,g_request,t1,t2
```

Do not remove any pre-existing unrelated member unless the exact diff proves it was added by this D1 work or Control Plane separately authorizes removal.
Prefer additive membership reconciliation.

After write, immediately read back and verify exact group + membership state.

Required:

```text
MBO_ACCESS_GROUP_CREATE_EXECUTED = 0|1
MBO_ACCESS_GROUP_MEMBERSHIP_WRITE_EXECUTED = 0|1
MBO_ACCESS_GROUP_ACTIVE = YES|NO
MBO_ACCESS_GROUP_REQUIRED_9_MEMBERS_PRESENT = YES|NO
```

If read-back differs from expected, rollback group/membership to backup when possible and STOP.

## 4. APP801 ACL CUTOVER — GROUP MODEL AUTHORIZED

Accepted current live facts:

```text
APP801_ACL_BACKUP_READY = YES
APP801_RECORD_ACL_CURRENT = NONE
APP801_CREDENTIAL_COUNT = 0
GROUP:everyone = DENIED
CREATOR/admin recovery access = PRESENT
```

After successful group setup, change App801 APP ACL so `MBO_EMPLOYEE_ACCESS` receives ONLY:

- App administration/settings = NO
- View records = YES
- Edit records = YES
- Add records = NO
- Delete records = NO
- Import = NO
- Export = NO

Preserve CREATOR/admin recovery access.
Keep `GROUP:everyone` denied.
Do NOT add record ACL rules.
Do NOT add 9 separate USER rows unless required solely for temporary rollback recovery; if platform cannot use GROUP ACL as designed, STOP instead of silently falling back.

After write, immediately read back and prove:

```text
APP801_ACL_CHANGE_EXECUTED = 1
APP801_MBO_GROUP_VIEW = YES
APP801_MBO_GROUP_EDIT = YES
APP801_MBO_GROUP_ADD_DELETE_IMPORT_EXPORT = NO
APP801_MBO_GROUP_APP_ADMIN = NO
APP801_GROUP_EVERYONE_REMAINS_DENIED = YES
APP801_RECORD_ACL_CHANGE_EXECUTED = 0
```

If read-back differs, rollback to `scratch/app801_acl_backup.json` and STOP.

## 5. CREDENTIAL PROVISIONING DRY-RUN — NO WRITE

App801 currently has 0 credential records. Build an exact read-only/local dry-run from App53.

Current accepted fact:
`APP53_ACTIVE_EMPLOYEE_CANDIDATES = 281`

For every valid active App53 employee candidate:
- Employee_Code = normalized exact App53 `emp_text`;
- default initial password concept = Employee_Code;
- target storage = PBKDF2-SHA256 hash only `pbkdf2$100000$<saltHex>$<hashHex>`;
- `Password_Algorithm = PBKDF2-SHA256`;
- `Force_Password_Change = YES`;
- `Account_Status = ACTIVE`;
- `Failed_Attempts = 0`;
- `Locked_Until = null`;
- Credential_Version must match live App801 field type.

Do NOT create/update App801 credential records in this task.
Do NOT generate/store the 281 final salted hashes in Git evidence.
Do NOT persist plaintext passwords.

Required:

```text
APP53_ACTIVE_EMPLOYEE_CANDIDATES =
VALID_PROVISIONING_CANDIDATES =
EXCLUDED_EMPTY_EMPLOYEE_CODE =
EXCLUDED_INVALID_EMPLOYEE_CODE =
DUPLICATE_EMPLOYEE_CODES_IN_APP53 =
CANDIDATE_0118_INCLUDED = YES|NO
CANDIDATE_0119_INCLUDED = YES|NO
APP801_SCHEMA_COMPATIBLE_WITH_PROVISIONING = YES|NO
PROVISIONING_WRITE_BATCH_COUNT_ESTIMATE =
PLAINTEXT_PASSWORD_PERSISTENCE = NO
RAW_PASSWORD_HASH_IN_GIT = NO
```

## 6. STRICTLY FORBIDDEN THIS ROUND

- NO App801 credential create/update/reset
- NO App794 customization upload/deploy
- NO App794 ACL change
- NO GROUP:everyone broadening
- NO App53/795/796 data/schema/process write
- NO migration
- NO D2-D7 work
- NO external gateway/server
- NO unrelated Kintone group changes

## 7. ROLLBACK

Before write, preserve enough evidence to restore:
1. original App801 ACL;
2. pre-existing `MBO_EMPLOYEE_ACCESS` group membership if group existed;
3. if group is newly created and group/ACL cutover fails, remove only the newly created D1 group when safe and restore App801 ACL.

Do not delete a pre-existing group.

## 8. DELIVERY / FINAL STATUS

Commit only sanitized evidence/control documentation to `ai/antigravity-wp002c`.
No secrets, password hashes, passwords, API tokens, cookies, or session material.

Final report:

```text
HEAD_BEFORE =
HEAD_AFTER =

MULTI_PRINCIPAL_COUNT_VERIFIED =
MBO_ACCESS_GROUP_EXISTED_BEFORE =
MBO_ACCESS_GROUP_CREATE_EXECUTED =
MBO_ACCESS_GROUP_MEMBERSHIP_WRITE_EXECUTED =
MBO_ACCESS_GROUP_ACTIVE =
MBO_ACCESS_GROUP_REQUIRED_9_MEMBERS_PRESENT =

APP801_ACL_CHANGE_EXECUTED =
APP801_MBO_GROUP_VIEW =
APP801_MBO_GROUP_EDIT =
APP801_MBO_GROUP_ADD_DELETE_IMPORT_EXPORT =
APP801_MBO_GROUP_APP_ADMIN =
APP801_GROUP_EVERYONE_REMAINS_DENIED =
APP801_RECORD_ACL_CHANGE_EXECUTED = 0

VALID_PROVISIONING_CANDIDATES =
CANDIDATE_0118_INCLUDED =
CANDIDATE_0119_INCLUDED =
APP801_SCHEMA_COMPATIBLE_WITH_PROVISIONING =
PROVISIONING_WRITE_BATCH_COUNT_ESTIMATE =

APP801_CREDENTIAL_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0

D1_ACCESS_GROUP_SETUP = PASS_PENDING_INDEPENDENT_REVIEW | BLOCKED
D1_CREDENTIAL_PROVISIONING_DRY_RUN = PASS_PENDING_INDEPENDENT_REVIEW | BLOCKED
D1_CREDENTIAL_PROVISIONING_WRITE = NOT_AUTHORIZED_YET
D1_APP794_DEPLOY = WAITING
D1_MANUAL_UAT = WAITING
```

STOP after commit + push. Do not self-start credential provisioning or App794 deploy.
ChatGPT performs independent review next.

---

# PROJECT CONTROL

- D1 Login + password change + employee-self MBO gate = IN_PROGRESS / SOURCE PASS / DEDICATED MBO ACCESS GROUP APPROVED / GROUP+ACL SETUP NEXT
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 Apps 283,310,305,643,307,640,715,716 -> App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 App800 HR Control Center end-to-end lifecycle = IN_PROGRESS
- D5 copy ONLY own prior Objective / Action Plan / Additional Agreement / Weight = MUST_FIX
- D6 integrated E2E/security/regression = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
