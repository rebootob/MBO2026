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
