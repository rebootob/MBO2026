# Evidence: D3 Existing Shared Operator Credential Discovery 01

## Metadata
- **PROJECT:** MBO2026
- **REPOSITORY:** rebootob/MBO2026
- **CANONICAL_BRANCH:** `ai/antigravity-wp002c`
- **PACKAGE:** `D3-EXISTING-SHARED-OPERATOR-CREDENTIAL-DISCOVERY-01`
- **MODE:** READ-ONLY EXISTING OPERATOR CREDENTIAL DISCOVERY / DOCS-ONLY EVIDENCE DELIVERY
- **AUTHORIZATION_ID:** `MBO2026-D3-EXISTING-SHARED-OPERATOR-CREDENTIAL-DISCOVERY-01-DOCS-DELIVERY-20260920-OWNER-01`
- **AUTHORIZED_BASE_HEAD:** `1b78d5b9e2cdeaa1a3240368ca9a7f1ddbfec075`
- **D3_CLOSURE_PRIORITY:** HIGH
- **DATE:** 2026-09-20

---

## 1. APP801_CREDENTIAL_MODEL_SUMMARY

App 801 serves as the persistent credential and session store for MBO Login Lock.
A read-only inspection of App 801 schema and all 128 existing records established the following structure and operational mechanics:

1. **Schema & Fields:**
   - `Employee_Code`: String identifier matching App 53 Employee Master.
   - `Password_Hash`: PBKDF2 hash of user password.
   - `Account_Status`: `ACTIVE`, `LOCKED`, or `DISABLED`.
   - `Force_Password_Change`: `YES` or `NO`.
   - `Failed_Attempts`: Numeric counter for failed logins.
   - `Locked_Until`: Timestamp for lockout expiration.
   - `Credential_Version`: Integer tracking credential revision.
   - `Session_Token_Hash`, `Session_Issued_At`, `Session_Expires_At`, `Session_Credential_Version`, `Session_Kintone_User`: Active session metadata.

2. **Login & Session Issuance Contract (`src/ui/mbo-kintone-auth-adapter.js` & `src/ui/mbo-kintone-login-gate.js`):**
   - `adapter.login({ username, password })`:
     - Verifies password against PBKDF2 hash.
     - If `Force_Password_Change === 'YES'`, returns `{ status: 'PASSWORD_CHANGE_REQUIRED', employeeCode }`.
     - Only if `Force_Password_Change === 'NO'`, returns `{ status: 'AUTHENTICATED', employeeCode }`.
   - `gate.handleLogin({ username, password })`:
     - When receiving `AUTHENTICATED`: validates shared eligibility via `checkSharedLoginEligibility(empCode)` and issues a new session via `sessionManager.issueSession(empCode)`.
     - When receiving `PASSWORD_CHANGE_REQUIRED`: sets internal flag `_pendingForceChange = true` and **does NOT issue a session**. A session can only be issued after the employee changes password via `_handleForceChangeAction()`.
   - `adapter.storeSession()`:
     - Explicitly checks `if (cred.forceChange) throw new Error('FORCE_PASSWORD_CHANGE_REQUIRED');`. Session persistence hard-fails if `Force_Password_Change === 'YES'`.

---

## 2. CANDIDATE_CLASSIFICATION

Inspection of all 128 records in App 801 shows:
* **Total Records in App 801:** 128
* **Records with `Force_Password_Change = YES`:** 125 records (97.6%)
  - Cannot be authenticated without completing a mandatory password change flow.
  - Ineligible for direct normal session issuance without password change.
* **Records with `Force_Password_Change = NO`:** Exactly 3 records (2.34%)
  1. Record 39: `Employee_Code = "0187"`, `Account_Status = ACTIVE`, `Force_Password_Change = NO`, previous `Session_Kintone_User = tmh` (expired 2026-09-13T20:05:00Z).
  2. Record 99: `Employee_Code = "0113"`, `Account_Status = ACTIVE`, `Force_Password_Change = NO`, previous `Session_Kintone_User = tmh` (expired 2026-09-07T22:01:00Z).
  3. Record 107: `Employee_Code = "0130"`, `Account_Status = ACTIVE`, `Force_Password_Change = NO`, previous `Session_Kintone_User = tmh` (expired 2026-09-19T22:39:00Z).
* **Controlled / Synthetic Test Employees:**
  - Synthetic test employee `MBO2026_D3_FINAL_R2_1789537046967_EMP` (App 53 Record 649): **0 records in App 801** (never enrolled).

---

## 3. REAL_USERS_EXCLUDED

In accordance with strict governance candidate rules:
- Candidates requiring passwords belonging to real company employees, managers, or approvers are strictly excluded:
  `chatrawee`, `pattama`, `supparat`, `satit`, `somrudee`, `vassana`, `kito`, `prompan`, `uchida`, `amporn`, `phubodin`, `natta`, `pitchayadol`, `weerakul`, `darat`, `suthas`, `tsuchihira`, and all other production staff.
- Plaintext passwords for real employees are not legitimately owned or stored by the controlled test environment.
- Any candidate corresponding to a real human employee is disqualified from automated or agent-driven test credential use.

---

## 4. EMPLOYEE0130_READONLY_FINDING

- **CREDENTIAL_RECORD_EXISTS:** YES (App 801 Record ID: 107)
- **EMPLOYEE_CODE:** `0130`
- **CREDENTIAL_STATUS (Account_Status):** `ACTIVE`
- **FORCE_PASSWORD_CHANGE:** `NO`
- **LAST_SESSION_KINTONE_USER:** `tmh`
- **LAST_SESSION_EXPIRY:** `2026-09-19T22:39:00Z`
- **LAST_SESSION_ACTIVE_OR_EXPIRED:** `EXPIRED`
- **KNOWN_CONTROLLED_CREDENTIAL_AVAILABLE:** `NO`
- **FINDING & RECOMMENDATION:**
  While Employee 0130 possesses an active enrolled credential record without the `Force_Password_Change` block, Employee 0130 is an actual company employee who previously logged in under `tmh`. The controlled test environment does not legitimately hold the plaintext password for Employee 0130. Authenticating as Employee 0130 would require obtaining or guessing an actual employee's production password, which is strictly prohibited.
  **DO NOT RECOMMEND 0130 FOR UAT.**

---

## 5. SUBJECT_OPERATOR_IDENTITY_SEPARATION_PROOF

The MBO system architecture supports clear identity separation between subject and operator:
- **SUBJECT_EMPLOYEE:** `App794.Employee_Code` (the evaluated employee profile undergoing the MBO evaluation workflow).
- **ACTUAL_OPERATOR:** The authenticated employee identity stored in the active App 801 session (`Session_Employee_Code`), resolved via Login Lock.
- **KINTONE_LOGIN_PRINCIPAL:** The current active Kintone user account running the session (e.g. `hr`).

**Code Basis:**
1. In `src/services/employee-service.js`:
   `checkSharedLoginEligibility(empCode)` verifies if `empCode` is a shared-eligible worker (no dedicated `MBO_Kintone_User` mapped in App 53). When eligible, any valid shared Kintone account (e.g. `hr`) can host the login session.
2. In `src/main-mbo-app.js` and App 798 archive integration:
   The action execution extracts `Actual_Operator_Code` from `sessionContext.employeeCode` independently from `record.Employee_Code.value`.
3. In App 798 schema:
   `Actual_Operator_Code` tracks the logged-in operator, while `Employee_Code` tracks the subject employee, allowing mixed-identity provenance without collision.

---

## 6. SYNTHETIC_SUBJECT_WITH_DIFFERENT_VALID_ACTUAL_OPERATOR

**SYNTHETIC_SUBJECT_WITH_DIFFERENT_VALID_ACTUAL_OPERATOR = SUPPORTED**

The system fully supports evaluating a synthetic subject employee (`MBO2026_D3_FINAL_R2_1789537046967_EMP`) while the process transition action is executed by a distinct legitimate actual operator in App 801, bound to shared principal `hr`.

---

## 7. EXISTING_SHARED_OPERATOR_CANDIDATE_AVAILABLE

**EXISTING_SHARED_OPERATOR_CANDIDATE_AVAILABLE = NO**

---

## 8. EXACT_BLOCKER

1. App 801 contains no eligible existing credential that is legitimately controlled by the test environment.
2. 125 out of 128 credential records in App 801 have `Force_Password_Change = YES`, which blocks normal session issuance (returns `PASSWORD_CHANGE_REQUIRED` and refuses to issue a session token).
3. The remaining 3 records with `Force_Password_Change = NO` (Records 39, 99, 107 for Employees `0187`, `0113`, `0130`) belong to real production employees whose plaintext credentials are not legitimately owned or accessible by the test environment.
4. The controlled synthetic test employee (`MBO2026_D3_FINAL_R2_1789537046967_EMP` / App 53 Record 649) has not yet been enrolled in App 801.

---

## 9. SMALLEST_LEGITIMATE_NEXT_REQUIREMENT

**SMALLEST_LEGITIMATE_NEXT_REQUIREMENT = CONTROLLED_TEST_EMPLOYEE_NORMAL_ENROLLMENT**

**Meaning:**
Enroll a controlled test employee (such as `MBO2026_D3_FINAL_R2_1789537046967_EMP`) through the EXISTING normal Login Lock credential enrollment flow only.
- Exercise the legitimate password enrollment / creation interface used by the application.
- DO NOT direct-write, direct-patch, or fabricate records in App 801.
- Establish a known test password legitimately held by the controlled test environment.

---

## 10. MUTATION_ACCOUNTING

All read-only preflight and discovery constraints were strictly observed with ZERO mutations:

```text
APP801_READ_COUNT = 2 (1 form fields inspection, 1 records query)
APP801_WRITE_COUNT = 0

LOGIN_ATTEMPT_COUNT = 0
SESSION_CREATE_COUNT = 0

PASSWORD_RESET_COUNT = 0
PASSWORD_CHANGE_COUNT = 0

APP794_WRITE_COUNT = 0
APP794_PROCESS_TRANSITION_COUNT = 0
APP798_WRITE_COUNT = 0

NOTIFICATION_CONFIG_WRITE_COUNT = 0
NOTIFICATION_TRIGGER_COUNT = 0

APP53_WRITE_COUNT = 0
APP795_WRITE_COUNT = 0
APP796_WRITE_COUNT = 0

SOURCE_CHANGE_COUNT = 0
TEST_CHANGE_COUNT = 0
SCHEMA_WRITE_COUNT = 0
ACL_WRITE_COUNT = 0
PROCESS_CONFIG_WRITE_COUNT = 0

RECORD15_MUTATION_COUNT = 0
```

---

## 11. DISCOVERY_RESULT

**DISCOVERY_RESULT = COMPLETED (OPTION B - NO EXISTING ELIGIBLE CREDENTIAL AVAILABLE)**
**CURRENT_GATE = STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW**
