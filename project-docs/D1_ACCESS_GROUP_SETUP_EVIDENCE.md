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

## 13. App801 Session Schema Write

### Scope & Prewrite Discovery
```text
AUTHORIZATION_SCOPE                    = APP801_SESSION_SCHEMA_WRITE APPROVED 2026-08-28
APP_ID                                 = 801
LIVE_REVISION_BEFORE                   = 5
PREVIEW_REVISION_BEFORE                = 5
LIVE_FINGERPRINT_BEFORE                = efd54ee27885ae62fb61e8316cdce7aa6eba1a9d9f1984e33a5a60b59d837185
PREVIEW_FINGERPRINT_BEFORE             = efd54ee27885ae62fb61e8316cdce7aa6eba1a9d9f1984e33a5a60b59d837185
PENDING_PREVIEW_DRIFT_RESULT           = PASS (0 unrelated Preview drift)
EXISTING_TARGET_CONFLICT_RESULT        = PASS (0 target fields existed, 0 type conflicts)
BACKUP_STATUS                          = PASS (scratch/app801_schema_prewrite_backup.json saved)
```

### Schema Add & Preview Read-Back
```text
FIELDS_ADDED                           = 5 (Session_Token_Hash, Session_Issued_At, Session_Expires_At, Session_Credential_Version, Session_Kintone_User)
FIELD_TYPES_SPECIFIED                  = Session_Token_Hash: SINGLE_LINE_TEXT, Session_Issued_At: DATETIME, Session_Expires_At: DATETIME, Session_Credential_Version: NUMBER, Session_Kintone_User: SINGLE_LINE_TEXT
PREVIEW_REVISION_AFTER_ADD             = 6
PREVIEW_READBACK_RESULT                = PASS (All 5 fields verified in Preview with correct types)
```

### Deployment & Live Postdeploy Verification
```text
DEPLOYMENT_REQUEST_STATUS              = SUCCESS
DEPLOYMENT_POLLING_RESULT              = SUCCESS (Attempt 1/20)
LIVE_REVISION_AFTER_DEPLOY             = 6
LIVE_VERIFIED_FIELD_COUNT              = 5
Session_Token_Hash                     = VERIFIED LIVE (SINGLE_LINE_TEXT)
Session_Issued_At                      = VERIFIED LIVE (DATETIME)
Session_Expires_At                     = VERIFIED LIVE (DATETIME)
Session_Credential_Version             = VERIFIED LIVE (NUMBER)
Session_Kintone_User                   = VERIFIED LIVE (SINGLE_LINE_TEXT)
NON_TARGET_SCHEMA_PRESERVED            = YES
```

### Mandatory Counters
```text
APP801_SCHEMA_READS_EXECUTED           = 4 (Prewrite Live/Preview, Post-Add Preview, Post-Deploy Live)
APP801_SCHEMA_WRITES_EXECUTED          = 1 (POST /k/v1/preview/app/form/fields.json for App 801)
APP801_DEPLOY_EXECUTED                 = 1 (POST /k/v1/preview/app/deploy.json for App 801)
APP801_RECORD_WRITES_EXECUTED          = 0
APP801_CREDENTIAL_RECORDS_UPDATED      = 0
APP801_CREDENTIAL_RECORDS_CREATED      = 0
APP801_CREDENTIAL_RECORDS_DELETED      = 0
APP794_CUSTOMIZATION_WRITES_EXECUTED    = 0
APP794_DEPLOY_EXECUTED                 = 0
APP53_795_796_WRITES_EXECUTED          = 0
GROUP_ACL_WRITES_EXECUTED              = 0
PROCESS_VIEW_LAYOUT_WRITES_EXECUTED    = 0
SOURCE_FILES_CHANGED                   = 0
TEST_FILES_CHANGED                     = 0
DIST_FILES_CHANGED                     = 0
D2_D7_WRITES_EXECUTED                  = 0

SCHEMA_RESULT                          = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```

---

## 14. Independent App801 Session Schema Readback — Control Plane PASS

The user ran the ChatGPT-supplied **READ-ONLY** browser-console verifier from an authenticated Kintone session after the App801 schema deployment. The verifier used only Live/Preview schema GET APIs; no record or schema write was performed.

Observed result from the user-provided screenshot:

```text
APP_ID                               = 801
LIVE_REVISION                        = 6
PREVIEW_REVISION                     = 6
LIVE_PREVIEW_SCHEMA_EQUAL_NOW        = true
LIVE_TARGETS_PASS                    = true
PREVIEW_TARGETS_PASS                 = true
TARGET_FIELD_COUNT                   = 5
OVERALL_PASS                         = true
```

Per-field independent verification:

```text
Session_Token_Hash          = SINGLE_LINE_TEXT / required false / unique false / unsafeDefault false / PASS
Session_Issued_At           = DATETIME         / required false / unsafeDefault false / PASS
Session_Expires_At          = DATETIME         / required false / unsafeDefault false / PASS
Session_Credential_Version  = NUMBER           / required false / unsafeDefault false / PASS
Session_Kintone_User        = SINGLE_LINE_TEXT / required false / unique false / unsafeDefault false / PASS
```

Independent decision:

```text
APP801_SESSION_SCHEMA_WRITE           = PASS / ACCEPTED
LIVE_PREVIEW_POSTDEPLOY_ALIGNMENT     = PASS
TARGET_FIELD_TYPES_AND_SAFETY         = PASS
UNEXPLAINED_POSTDEPLOY_REVISION_DRIFT = NONE OBSERVED
APP801_SESSION_SCHEMA_GATE            = CLOSED
```

This acceptance does not authorize App794 Session Continuity deployment, Create-handler correction, UAT mutation, or any D2-D7 write.

## 15. App794 Session Continuity Deploy

### Scope & Pre-Deploy Discovery
```text
AUTHORIZATION_SCOPE                    = APP794_SESSION_CONTINUITY_DEPLOY APPROVED 2026-08-28
SOURCE_COMMIT                          = 7133e2934b0e8f7ea710e03d195157354e0d95b8
TEST_PROOF_COMMIT                      = 9d9db0f2456b5b3407b8dae830493c0eb9a9cc7f
LOCKED_TARGET_JS_BLOB                  = d0294229bf0f7ccdf4d161632648bc885794c347
EXPECTED_CSS_BLOB                      = 1359dfae16d1224580210a5a6cd366fb20bcf6f8
LOCAL_BUILD_RESULT                     = PASS (dist/mbo-employee-app.js rebuilt deterministically)
NPM_TEST_RESULT                        = PASS (825/825 tests passed 100%)
LOCAL_JS_BLOB_AFTER_BUILD              = d0294229bf0f7ccdf4d161632648bc885794c347 (MATCH)
LOCAL_CSS_BLOB_AFTER_BUILD             = 1359dfae16d1224580210a5a6cd366fb20bcf6f8 (MATCH)
APP801_DEPENDENCY_GATE                 = PASS (All 5 session fields verified on App801)
LIVE_REVISION_BEFORE                   = 42
PREVIEW_REVISION_BEFORE                = 42
PRE_DEPLOY_LIVE_JS_BLOB                = 2a9a3c5bfe896b51f482c016f66863bffeddb679 (MATCH)
PRE_DEPLOY_LIVE_CSS_BLOB               = 1359dfae16d1224580210a5a6cd366fb20bcf6f8 (MATCH)
STRICT_PREFLIGHT_RESULT                = PASS (validatePreflight 100%)
ROLLBACK_BACKUP_PATH                   = scratch/app794_live_redeploy_backup.json & scratch/app794_preview_redeploy_backup.json
```

### Deployment & Post-Deploy Read-Back Verification
```text
TARGET_JS_UPLOAD_COUNT                 = 1 (mbo-employee-app.js, fileKey: eaa45d91-b0f4-48e6-9b41-7ffe7ca33511)
CSS_UPLOAD_COUNT                       = 0
OTHER_FILE_UPLOAD_COUNT                = 0
PREVIEW_CUSTOMIZATION_PUT_COUNT        = 1 (revision 43)
APP794_DEPLOY_REQUEST_COUNT            = 1
DEPLOYMENT_POLLING_RESULT              = SUCCESS (Attempt 3/20)
LIVE_REVISION_AFTER                    = 43
PREVIEW_REVISION_AFTER                 = 43
DEPLOYED_TARGET_JS_BLOB                = d0294229bf0f7ccdf4d161632648bc885794c347 (MATCH)
POST_DEPLOY_CSS_BLOB                   = 1359dfae16d1224580210a5a6cd366fb20bcf6f8 (MATCH)
TARGET_CONTENT_HASH_MATCH              = YES
CSS_CONTENT_HASH_MATCH                 = YES
NON_TARGET_CUSTOMIZATION_PRESERVED     = YES
LIVE_PREVIEW_ALIGNMENT_AFTER           = PASS
```

### Mandatory Counters
```text
APP794_CUSTOMIZATION_WRITES_EXECUTED    = 2 (1 x File Upload + 1 x Preview PUT)
APP794_DEPLOY_REQUEST_COUNT            = 1
APP794_RECORD_WRITES_EXECUTED          = 0
APP801_SCHEMA_WRITES_EXECUTED          = 0
APP801_RECORD_WRITES_EXECUTED          = 0
APP53_WRITES_EXECUTED                  = 0
APP795_WRITES_EXECUTED                 = 0
APP796_WRITES_EXECUTED                 = 0
GROUP_ACL_WRITES_EXECUTED              = 0
PROCESS_VIEW_LAYOUT_WRITES_EXECUTED    = 0
CREATE_HANDLER_FIX_EXECUTED            = 0
UAT_EXECUTED                           = 0
D2_D7_WRITES_EXECUTED                  = 0
ROLLBACK_WRITES_EXECUTED               = 0
SOURCE_FILES_CHANGED                   = 0
TEST_FILES_CHANGED                     = 0
DIST_FILES_CHANGED                     = 0

DEPLOYMENT_RESULT                      = IMPLEMENTED_PENDING_INDEPENDENT_REVIEW
```
