# Evidence: D3 Kintone-Only App 798 Runtime ACL Preflight

> **Package ID:** `D3-KINTONE-ONLY-APP798-RUNTIME-ACL-PREFLIGHT-01`  
> **Authorization ID:** `MBO2026-D3-KINTONE-ONLY-APP798-RUNTIME-ACL-PREFLIGHT-01-20260919-OWNER-01`  
> **Authorized Base HEAD:** `283c67099e74306782ca0d930b5bb9eae4c2bfc9`  
> **Repository:** `rebootob/MBO2026`  
> **Branch:** `ai/antigravity-wp002c`  
> **Execution Mode:** `READ-ONLY ACL / PERMISSION PREFLIGHT`  

---

## 1. Incident Truth & Background
During live SHARED UAT execution by shared Kintone user `tmh` attempting the **Start Mid-Year** action on **App 794 Record 19** (Pre-action Status: `05 Objective Approved`, Provenance Fixture: `PASS`), the operation failed closed with:
* **HTTP Status:** `403 Forbidden`
* **Kintone Error Code:** `CB_NO02`
* **Message:** `No privilege to proceed.`
* **Triggering Request:** `GET /k/v1/records.json?app=798&query=Archive_Key...`
* **Outcome:** Start Mid-Year process transition was blocked; no status change occurred on App 794; no record was created in App 798.

This package performs a read-only investigation to determine the exact ACL layer causing the 403 error.

---

## 2. Runtime App 798 Access Requirements (Source Code Analysis)

From analysis of `RevisionArchiveKintoneRepository` (`src/services/revision-archive-kintone-repository.js`) and `RevisionArchiveService` (`src/services/revision-archive-service.js`):

### 2.1 Operations Required
1. **Pre-write Deduplication / Existence Check:**
   * Method: `findByArchiveKey(archiveKey)`
   * API: `GET /k/v1/records.json?app=798&query=Archive_Key = "..." limit 5`
   * Requirement: **View Records** (`recordViewable`) on App 798.
2. **Audit / Evidence Ledger Creation:**
   * Method: `createArchiveRecord(recordPayload)`
   * API: `POST /k/v1/record.json` (`app: 798`, `record: { ... }`)
   * Requirement: **Add Records** (`recordAddable`) on App 798.
3. **Post-write Exact Readback:**
   * Method: `readBackExactArchiveRecord(archiveKey)`
   * API: Calls `findByArchiveKey(archiveKey)`
   * Requirement: **View Records** (`recordViewable`) on App 798.
4. **Mutations of Existing Records:**
   * Methods: None. Code explicitly enforces:
     `Mutation of existing rows is STRICTLY FORBIDDEN: NO updateArchiveRecord, NO deleteArchiveRecord`.
   * Requirement: **Edit Records = NOT REQUIRED**, **Delete Records = NOT REQUIRED**.
5. **App Management / Schema:**
   * Requirement: **App Editable / Manage = NOT REQUIRED**.

### 2.2 Fields Involved
* **Read Fields:** `Archive_Key`, `Source_Record_ID`, `Source_Record_Key`, `Fiscal_Year`, `Employee_Code`, `Evaluation_Stage`, `Revision_Number`, `Previous_Status`, `Superseded_By_Revision`, `Event_Type`, `Reason`, `Snapshot_JSON`, `Snapshot_Hash`, `Archived_By`, `Archived_At`, `Identity_Mode`, `Actual_Operator_Employee_Code`, `Kintone_Login_User_Code`, `Action_Name`, `To_Status`.
* **Write Fields:** Identical to read fields.

---

## 3. App 798 ACL Layer Findings

Read-only inspection of Kintone App 798 ACL endpoints returned:

### 3.1 App-Level ACL (`GET /k/v1/app/acl.json?app=798`)
* Revision: `7`
* Configured Rights:
  1. `CREATOR`: All rights `true`.
  2. `USER: hr`: `recordViewable: true`, `recordAddable: true`, all other permissions `false`.
  3. `GROUP: everyone`: `recordViewable: false`, `recordAddable: false`, `recordEditable: false`, `recordDeletable: false`, `appEditable: false`.
* Finding: **Neither principal `tmh` nor any shared/employee group is listed in App 798 App ACL.** Any user other than `hr` or `CREATOR` inherits the default `everyone` rule, which denies both View and Add.

### 3.2 Record-Level ACL (`GET /k/v1/record/acl.json?app=798`)
* Revision: `7`
* Configured Rights: `[]` (Empty)
* Finding: No record-level restrictions exist. Record ACL is not the blocker.

### 3.3 Field-Level ACL (`GET /k/v1/field/acl.json?app=798`)
* Revision: `7`
* Configured Rights: `[]` (Empty)
* Finding: No field-level restrictions exist. Field ACL is not the blocker.

---

## 4. Principal `tmh` & Group Membership Analysis

Inspection of Cybozu User and Group APIs for `tmh`:
* **User ID:** `46`
* **User Code:** `tmh`
* **Name:** `TMH`
* **Primary Organization:** `13` (`TMH_jx7iyl`)
* **Group Memberships:**
  1. `MBO_EMPLOYEE_ACCESS` (ID: `86`) — Description: `"D1 MBO Login Gate: App801 View+Edit access for employee accounts. Members: f1,f2,f3,tmh,e1,s1,g_request,t1,t2"`
  2. `TTMET_INTERNAL_v7hmZr` (ID: `42`)
  3. `USER_GROUP_gJsM48` (ID: `49`)
  4. `TTMET_INTERNAL_NEW_T7KM6p` (ID: `51`)
  5. `everyone` (ID: `7532782697181632513`)

### Comparison with App 794 & App 801 Security Architecture
* **App 794 (Main MBO App):**
  * `MBO_DEDICATED_ACCESS`: View = YES, Add = YES, Edit = YES
  * `MBO_EMPLOYEE_ACCESS`: View = YES, Add = YES, Edit = YES
  * `HR_ADMIN_GROUP`: View = YES, Edit = YES
  * `everyone`: Denied
* **App 801 (Session / Gate App):**
  * `MBO_EMPLOYEE_ACCESS`: View = YES, Edit = YES
  * `HR_ADMIN_GROUP`: View = YES, Edit = YES
  * `everyone`: Denied
* **App 798 (Revision Archive):**
  * Currently only grants `hr` and `CREATOR`.
  * Group `MBO_EMPLOYEE_ACCESS` was never added to App 798.
  * Therefore, `tmh` inherits `everyone` (denied).

---

## 5. ACL Layer Classification & Exact Cause

* `APP798_APP_LEVEL_VIEW = DENIED` (for `tmh`)
* `APP798_APP_LEVEL_ADD = DENIED` (for `tmh`)
* `APP798_RECORD_LEVEL_VIEW = NOT_APPLICABLE` (no record ACL rules)
* `APP798_RECORD_LEVEL_ADD = NOT_APPLICABLE` (no record ACL rules)
* `APP798_FIELD_LEVEL_REQUIRED_FIELDS = ALLOWED` (no field ACL rules)

### Exact 403 Blocker
**`EXACT_403_CAUSE = APP_LEVEL_VIEW_DENIED`**
The failing request observed in live SHARED UAT was:
`GET /k/v1/records.json?app=798&query=Archive_Key...`
Because `recordViewable: false` in the App-level ACL for `everyone`, Kintone immediately rejected the pre-write deduplication read with HTTP 403 `CB_NO02`. Furthermore, even if read passed, the subsequent `POST /k/v1/record.json` would be blocked by `recordAddable: false` at the App-level ACL.

---

## 6. Minimum Required ACL Change

To allow the native Kintone-Only D3 audit archive path to function without weakening the principle of least privilege:
* **Target App:** App 798 (Revision Archive)
* **Target Group:** `MBO_EMPLOYEE_ACCESS` (Existing group code: `MBO_EMPLOYEE_ACCESS`)
  *(Note: For dedicated UAT, existing group `MBO_DEDICATED_ACCESS` will similarly require the same permissions).*
* **Permissions to Grant:**
  * **View Records:** `YES` (`recordViewable: true`)
  * **Add Records:** `YES` (`recordAddable: true`)
* **Permissions to Deny / Keep False:**
  * **Edit Records:** `NO` (`recordEditable: false`)
  * **Delete Records:** `NO` (`recordDeletable: false`)
  * **App Management / Editable:** `NO` (`appEditable: false`)
  * **Import / Export Records:** `NO` (`recordImportable: false`, `recordExportable: false`)

---

## 7. Everyone Broad Access Safety Check
* **`EVERYONE_BROAD_ACCESS_REQUIRED = NO`**
* Justification: Existing bounded groups `MBO_EMPLOYEE_ACCESS` (for shared terminal accounts) and `MBO_DEDICATED_ACCESS` (for dedicated user accounts) cover all valid operators of MBO2026. Granting access to `everyone` is strictly unnecessary and violates least privilege.

---

## 8. Verification & Scope Accounting

| Counter / Item | Value |
| :--- | :--- |
| `KINTONE_READ_COUNT` | 12 |
| `KINTONE_WRITE_COUNT` | 0 |
| `APP794_RECORD_WRITE_COUNT` | 0 |
| `APP798_WRITE_COUNT` | 0 |
| `ACL_WRITE_COUNT` | 0 |
| `SCHEMA_WRITE_COUNT` | 0 |
| `PROCESS_TRANSITION_COUNT` | 0 |
| `START_MID_YEAR_RETRY_COUNT` | 0 |
| `SOURCE_CHANGE_COUNT` | 0 |
| `TEST_CHANGE_COUNT` | 0 |
| `BUILD_COUNT` | 0 |
| `DEPLOYMENT_COUNT` | 0 |

---

## 9. Mandatory Decision Block

```text
APP798_READ_PERMISSION_FOR_TMH = DENIED
APP798_ADD_PERMISSION_FOR_TMH = DENIED
APP_LEVEL_ACL_BLOCKER = YES
RECORD_ACL_BLOCKER = NO
FIELD_ACL_BLOCKER = NO
EXACT_403_CAUSE = APP_LEVEL_VIEW_DENIED
MINIMUM_REQUIRED_PERMISSION_CHANGE = Add existing group MBO_EMPLOYEE_ACCESS to App 798 App ACL with View Records = YES, Add Records = YES (and optionally MBO_DEDICATED_ACCESS with View Records = YES, Add Records = YES for dedicated UAT). All other permissions remain denied.
EVERYONE_BROAD_ACCESS_REQUIRED = NO
ACL_CHANGE_EXECUTED = NO
START_MID_YEAR_RETRY_COUNT = 0
```
