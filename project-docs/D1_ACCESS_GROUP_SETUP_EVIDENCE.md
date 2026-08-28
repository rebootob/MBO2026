# D1 Access Group Setup + App801 ACL Cutover — Evidence

**Date:** 2026-08-28  
**Repository:** `rebootob/MBO2026`  
**Branch:** `ai/antigravity-wp002c`  
**Source D1 commit:** `63796999a321a24e1cbd29ceaad82b43980fe8ea`

---

## 1. Pre-Write Verification — 9 Principals

```text
PRINCIPAL_f1       = VERIFIED
PRINCIPAL_f2       = VERIFIED
PRINCIPAL_f3       = VERIFIED
PRINCIPAL_tmh      = VERIFIED
PRINCIPAL_e1       = VERIFIED
PRINCIPAL_s1       = VERIFIED
PRINCIPAL_g_request= VERIFIED
PRINCIPAL_t1       = VERIFIED
PRINCIPAL_t2       = VERIFIED
MULTI_PRINCIPAL_COUNT_VERIFIED = 9
```

---

## 2. Dedicated Group + App801 ACL — Accepted Corrective Result

Accepted independent-review evidence commit:
`b9d4fa830c4c0e3b827362e143639f9a307adbac`

```text
MBO_ACCESS_GROUP_CODE                   = MBO_EMPLOYEE_ACCESS
MBO_ACCESS_GROUP_REQUIRED_9_MEMBERS_PRESENT = YES
GROUP_MEMBERSHIP_RESULT                 = PASS
APP801_GROUP_VIEW_EDIT                  = YES
APP801_GROUP_EXTRA_PRIVILEGES           = NO
APP801_EVERYONE_DENIED_AFTER            = YES
APP801_RECORD_ACL_CHANGE_EXECUTED        = 0
APP801_ACL_RESULT                       = PASS
```

---

## 3. Accepted Credential Candidate Gate

User-provided App53 read-only export was independently evaluated by ChatGPT, and the user confirmed App53 active-status semantics:

```text
Number_0 = 1 -> Active/current
Number_0 = 0 -> Inactive/former
Number_0 blank -> unknown / fail closed
```

Accepted current candidate result:

```text
APP53_TOTAL_ROWS                       = 281
APP53_ACTIVE_ROWS                      = 204
APP53_ACTIVE_BLANK_EMPLOYEE_CODE_ROWS = 76
APP53_DUPLICATE_ACTIVE_CODES           = NONE
APP53_ELIGIBLE_CREDENTIAL_CANDIDATES   = 128
```

Special handling:

```text
50.03  = ELIGIBLE
50.02  = ELIGIBLE
0050_2 = ELIGIBLE
0118   = ELIGIBLE
0171   = ELIGIBLE second isolation-UAT candidate
0119   = NOT_FOUND / no credential
0284   = blank Number_0 / excluded
9000   = duplicated only on inactive rows / no active conflict
```

---

## 4. App801 Credential Provisioning — Executor Evidence

Authorized target population:

```text
128 accepted active unique Employee_Code candidates
```

Executor evidence commit:
`7263013834a9f27d2486fa29767250dd90bef9ca`

Executor-reported pre-write reconciliation:

```text
APP801_EXISTING_TARGET_ROWS          = 0
APP801_EXISTING_UNIQUE_TARGET_CODES  = 0
APP801_MISSING_TARGET_CODES          = 128
APP801_DUPLICATE_TARGET_CODES        = NONE
```

Executor-reported write result:

```text
PROVISIONING_RESULT                  = SUCCESS
BATCH_COUNT                          = 2 (100 + 28)
APP801_CREDENTIAL_ROWS_CREATED       = 128
APP801_EXISTING_ROWS_UPDATED         = 0
APP53_WRITES_EXECUTED                = 0
APP794_DEPLOY_EXECUTED               = 0
APP794_WRITES_EXECUTED               = 0
GROUP_ACL_WRITES_EXECUTED            = 0
D2_D7_WRITES_EXECUTED                = 0
```

Executor evidence was not accepted as final PASS until separate live verification was performed.

---

## 5. Independent Live Verification — Control Plane PASS

The user ran the ChatGPT-supplied **READ-ONLY** App801 browser-console verifier after provisioning and returned a screenshot of the summarized results. The verifier did not perform Kintone writes and did not render plaintext passwords, raw hashes, or salts.

Observed independent result:

```text
TOTAL_RECORDS                       = 128
UNIQUE_EMPLOYEE_CODES               = 128
DUPLICATE_CODE_COUNT                = 0
HASH_FORMAT_OK                      = true
DEFAULT_PASSWORD_HASH_VERIFY_OK     = true
UNIQUE_SALTS                        = true
PASSWORD_ALGORITHM_OK               = true
FORCE_PASSWORD_CHANGE_OK            = true
ACCOUNT_STATUS_OK                   = true
FAILED_ATTEMPTS_OK                  = true
LOCKED_UNTIL_BLANK_OK               = true
CREDENTIAL_VERSION_OK               = true
CODE_0118_PRESENT                   = true
CODE_0171_PRESENT                   = true
CODE_0119_ABSENT                    = true
CODE_0284_ABSENT                    = true
OVERALL_PASS                        = true
```

Independent-review decision:

```text
APP801_CREDENTIAL_PROVISIONING = PASS / ACCEPTED
LIVE_TARGET_CREDENTIAL_COUNT   = 128
LIVE_TARGET_DUPLICATES         = NONE
PASSWORD_MODEL_VERIFIED        = PASS
SECRET_MATERIAL_EXPOSED        = NO
```

This closes the App801 credential-provisioning gate. It does **not** by itself authorize App794 deployment or close D1; App794 deployment authorization/gate and final manual UI UAT remain separate steps.

---

## 12. App794 D1 Accepted Customization Deploy

### Pre-Deploy Authorization & Artifact Identity
```text
TARGET_APP                             = 794
ACCEPTED_SOURCE_COMMIT                 = 63796999a321a24e1cbd29ceaad82b43980fe8ea
TARGET_PATH                            = dist/mbo-employee-app.js
EXPECTED_GIT_BLOB_SHA                  = 96ec6424e7b7f528e82117b566ac96accb0ffb16
LOCAL_GIT_BLOB_SHA                     = 96ec6424e7b7f528e82117b566ac96accb0ffb16
ARTIFACT_IDENTITY_STATUS               = PASS
```

### Pre-Deploy Live Customization & Backup
```text
APP794_REVISION_BEFORE                 = 40
PRE_DEPLOY_SCOPE                       = ALL
PRE_DEPLOY_DESKTOP_JS_COUNT            = 1 (mbo-employee-app.js)
PRE_DEPLOY_DESKTOP_CSS_COUNT           = 1 (mbo-employee.css)
PRE_DEPLOY_MOBILE_JS_COUNT             = 0
PRE_DEPLOY_MOBILE_CSS_COUNT            = 0
ROLLBACK_BACKUP_PATH                   = scratch/app794_predeploy_backup.json
APP794_ROLLBACK_READY                  = YES
```

### Deployment & Post-Deploy Read-Back Verification
```text
APP794_REVISION_AFTER                  = 41
DEPLOYMENT_COMPLETED                   = YES
TARGET_FILE_NAME_AFTER                 = mbo-employee-app.js
LOCAL_JS_CONTENT_SHA256                = 29d7f0280d43273cc57a65c6b9c9f2d3a53496635398c1503342d350c8411ffe
DEPLOYED_JS_CONTENT_SHA256             = 29d7f0280d43273cc57a65c6b9c9f2d3a53496635398c1503342d350c8411ffe
TARGET_CONTENT_HASH_MATCH              = YES
NON_TARGET_CUSTOMIZATION_PRESERVED    = YES
ROLLBACK_RESULT                        = NOT_NEEDED
```

### Mandatory Counters
```text
APP794_CUSTOMIZATION_WRITES_EXECUTED   = 3 (upload mbo-employee-app.js + upload mbo-employee.css + PUT preview customize)
APP794_DEPLOY_EXECUTED                 = 1 (POST preview deploy)
APP794_ROLLBACK_WRITES_EXECUTED        = 0
APP794_ROLLBACK_DEPLOY_EXECUTED        = 0
APP794_RECORD_WRITES_EXECUTED          = 0
APP801_WRITES_EXECUTED                 = 0
APP53_795_796_WRITES_EXECUTED          = 0
GROUP_ACL_WRITES_EXECUTED              = 0
D2_D7_WRITES_EXECUTED                  = 0
SOURCE_FILES_CHANGED                   = 0

APP794_DEPLOY_STATUS                   = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

---

## 11. App794 Corrective Redeploy — D1 Runtime Recovery

### Pre-Deploy Authorization & Artifact Identity
```text
TARGET_APP                             = 794
AUTHORIZED_SOURCE_COMMIT               = ed1d8e8573efeb47845cc07dcd81853842ed307e
TARGET_PATH                            = dist/mbo-employee-app.js
EXPECTED_GIT_BLOB_SHA                  = 2a9a3c5bfe896b51f482c016f66863bffeddb679
LOCAL_GIT_BLOB_SHA                     = 2a9a3c5bfe896b51f482c016f66863bffeddb679
LOCAL_BUILD_AND_TEST_GATE              = PASS (804/804 tests passed 100%)
ARTIFACT_IDENTITY_STATUS               = PASS
```

### Pre-Deploy Live Customization & Backup
```text
LIVE_REVISION_BEFORE                   = 41
PREVIEW_REVISION_BEFORE                = 41
PRE_DEPLOY_SCOPE                       = ALL
PRE_DEPLOY_DESKTOP_JS_COUNT            = 1 (mbo-employee-app.js)
PRE_DEPLOY_DESKTOP_CSS_COUNT           = 1 (mbo-employee.css)
PRE_DEPLOY_MOBILE_JS_COUNT             = 0
PRE_DEPLOY_MOBILE_CSS_COUNT            = 0
ROLLBACK_BACKUP_PATH                   = scratch/app794_live_redeploy_backup.json & scratch/app794_preview_redeploy_backup.json
STRICT_PREFLIGHT_RESULT                = PASS (validatePreflight 100%)
APP794_ROLLBACK_READY                  = YES
```

### Deployment & Post-Deploy Read-Back Verification
```text
LIVE_REVISION_AFTER                    = 42
PREVIEW_REVISION_AFTER                 = 42
DEPLOY_STATUS                          = SUCCESS
TARGET_FILE_NAME_AFTER                 = mbo-employee-app.js
EXPECTED_JS_GIT_BLOB_SHA               = 2a9a3c5bfe896b51f482c016f66863bffeddb679
DEPLOYED_JS_GIT_BLOB_SHA               = 2a9a3c5bfe896b51f482c016f66863bffeddb679
TARGET_JS_CONTENT_HASH_MATCH           = YES
PRE_DEPLOY_CSS_GIT_BLOB_SHA            = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
POST_DEPLOY_CSS_GIT_BLOB_SHA           = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
CSS_CONTENT_HASH_MATCH                 = YES
NON_TARGET_CUSTOMIZATION_PRESERVED     = YES
ROLLBACK_RESULT                        = NOT_NEEDED
```

### Mandatory Counters
```text
KINTONE_WRITES_EXECUTED                = 3 (1 x JS upload + 1 x Preview PUT + 1 x Deploy request)
TARGET_JS_UPLOAD_COUNT                 = 1 (mbo-employee-app.js)
CSS_UPLOAD_COUNT                       = 0
OTHER_FILE_UPLOAD_COUNT                = 0
PREVIEW_CUSTOMIZATION_PUT_COUNT        = 1
APP794_DEPLOY_REQUEST_COUNT            = 1
APP794_RECORD_WRITES_EXECUTED          = 0
APP801_WRITES_EXECUTED                 = 0
APP53_WRITES_EXECUTED                  = 0
APP795_WRITES_EXECUTED                 = 0
APP796_WRITES_EXECUTED                 = 0
GROUP_ACL_WRITES_EXECUTED              = 0
D2_D7_WRITES_EXECUTED                  = 0
ROLLBACK_WRITES_EXECUTED               = 0
UAT_EXECUTED                           = 0
SOURCE_FILES_MODIFIED                  = 0

APP794_REDEPLOY_STATUS                 = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

