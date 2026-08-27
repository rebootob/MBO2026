# AI ACTIVE TASK — D1 LIVE CUTOVER — MULTI-PRINCIPAL VERIFICATION + CREDENTIAL PROVISIONING DRY-RUN

> Control Plane: ChatGPT
> Execution Plane: Antigravity
> Repository: `rebootob/MBO2026`
> Working branch: `ai/antigravity-wp002c`
> Accepted D1 source commit: `63796999a321a24e1cbd29ceaad82b43980fe8ea`
> Independently reviewed Stage A evidence commit: `2eb1e1a3eb0a1d54e048cfd935093ec284412a5d`
> User authorization: **D1 LIVE CUTOVER APPROVED**
> User-supplied ordinary/shared Kintone principals: `f1`, `f2`, `f3`, `tmh`, `e1`, `s1`, `g_request`, `t1`, `t2`
> Mode: READ-ONLY PRINCIPAL VERIFICATION + EXACT PROVISIONING DRY-RUN ONLY / NO LIVE WRITE / NO DEPLOY

## 0. CONTROL DECISION

The employee-access model is MULTI-PRINCIPAL, not a single shared Kintone USER.

User supplied the following exact candidate Kintone USER codes used for ordinary/shared employee access:

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

Do not collapse these into `GROUP:everyone`.
Do not add `admin-form` as employee authority.

These values are accepted as user-supplied facts, but must be live-verified before any ACL write.

## 1. LIVE READ-ONLY PRINCIPAL VERIFICATION

Verify all 9 exact USER codes exist and are valid active/usable Kintone principals.

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

If any code is NOT_FOUND/INACTIVE, STOP with exact blocker. Do not guess substitutes.

## 2. ACCEPTED STAGE A FACTS

```text
APP801_ACL_BACKUP_READY = YES
APP801_RECORD_ACL_CURRENT = NONE
APP801_CREDENTIAL_COUNT = 0
APP801_DUPLICATE_EMPLOYEE_CODES = 0
APP801_MALFORMED_CREDENTIAL_COUNT = 0
CREDENTIAL_0118_READY = NO
CREDENTIAL_0119_READY = NO
APP53_ACTIVE_EMPLOYEE_CANDIDATES = 281
MASS_PROVISIONING_REQUIRED = YES
APP794_ROLLBACK_READY = YES
```

No credential record currently exists in App801.

## 3. EXACT CREDENTIAL PROVISIONING DRY-RUN

Build a READ-ONLY / LOCAL dry-run candidate from App53 only.

Do NOT write App801.
Do NOT print or commit generated Password_Hash values.
Do NOT persist plaintext passwords.

For every valid active App53 employee candidate:
- `Employee_Code` = exact normalized App53 `emp_text` value;
- initial/default password concept = Employee_Code;
- target stored password = PBKDF2-SHA256 hash only, format `pbkdf2$100000$<saltHex>$<hashHex>`;
- `Password_Algorithm = PBKDF2-SHA256`;
- `Force_Password_Change = YES`;
- `Account_Status = ACTIVE`;
- `Failed_Attempts = 0`;
- `Locked_Until = null`;
- `Credential_Version` must match the current App801 field type/accepted representation; verify field schema rather than inventing `1.0` if the field is NUMBER.

Required dry-run evidence:

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

Do not generate/store all final salted hashes for Git evidence. Hash creation belongs to the authorized write execution package and must remain transient in memory.

## 4. PREPARE EXACT MULTI-PRINCIPAL APP801 ACL TARGET — NO WRITE

If all 9 principals are VERIFIED, prepare the target App801 app ACL only.

For EACH of the 9 exact USER principals:
- App administration/settings = NO
- View records = YES
- Edit records = YES
- Add records = NO
- Delete records = NO
- Import = NO
- Export = NO

Preserve CREATOR/admin recovery rights.
Keep `GROUP:everyone` denied.
Do not add record ACL rules.

Required:

```text
APP801_TARGET_USER_PRINCIPALS = f1,f2,f3,tmh,e1,s1,g_request,t1,t2
APP801_TARGET_VIEW_EDIT = YES
APP801_TARGET_ADD_DELETE_IMPORT_EXPORT = NO
APP801_TARGET_APP_ADMIN = NO
APP801_GROUP_EVERYONE_TARGET = DENIED
APP801_RECORD_ACL_TARGET_CHANGE = NONE
```

IMPORTANT architecture limitation:
All authorized shared Kintone principals granted App801 View/Edit can technically use native/direct Kintone REST outside the custom MBO UI to read credential hashes or modify credential records. Native employee-level hard isolation is NOT guaranteed under this Kintone-only shared-principal architecture. Do not claim otherwise.

## 5. NO LIVE WRITE THIS ROUND

STRICTLY FORBIDDEN:
- NO App801 credential create/update/reset
- NO App801 ACL write
- NO App794 customization upload/deploy
- NO App794 ACL change
- NO GROUP:everyone broadening
- NO App53/795/796 write
- NO migration
- NO D2-D7 work

Mandatory counters:

```text
APP801_CREDENTIAL_WRITES_EXECUTED = 0
APP801_ACL_CHANGE_EXECUTED = 0
KINTONE_WRITES_EXECUTED = 0
KINTONE_DEPLOY_EXECUTED = 0
```

## 6. DELIVERY

Commit only sanitized evidence/control documentation to `ai/antigravity-wp002c`.
Do not commit secrets, password hashes, passwords, tokens, cookies, or session material.

Final status:

```text
D1_MULTI_PRINCIPAL_VERIFICATION = PASS_PENDING_INDEPENDENT_REVIEW | BLOCKED
D1_CREDENTIAL_PROVISIONING_DRY_RUN = PASS_PENDING_INDEPENDENT_REVIEW | BLOCKED
D1_CREDENTIAL_PROVISIONING_WRITE = NOT_AUTHORIZED_YET
D1_APP801_ACL_CUTOVER = WAITING_PROVISIONING_AUTHORIZATION
D1_APP794_DEPLOY = WAITING
D1_MANUAL_UAT = WAITING
```

STOP after commit + push. ChatGPT performs independent review and then asks the user for the separate App801 credential-provisioning write authorization if the dry-run is acceptable.

---

# PROJECT CONTROL

- D1 Login + password change + employee-self MBO gate = IN_PROGRESS / SOURCE PASS / MULTI-PRINCIPAL MODEL IDENTIFIED / PROVISIONING DRY-RUN NEXT
- D2 Excel + PDF legacy-format export = IN_PROGRESS
- D3 Apps 283,310,305,643,307,640,715,716 -> App794 = IN_PROGRESS / WRITE NOT AUTHORIZED
- D4 App800 HR Control Center end-to-end lifecycle = IN_PROGRESS
- D5 copy ONLY own prior Objective / Action Plan / Additional Agreement / Weight = MUST_FIX
- D6 integrated E2E/security/regression = BLOCKED
- D7 Admin Support Center = PASS / CLOSED
