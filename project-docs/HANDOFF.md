# AI Operational Handoff Document

- **Handoff Date**: 2026-08-24T12:30:00+07:00
- **From AI**: Antigravity
- **To AI**: Incoming AI (Antigravity / Codex / Claude / Independent Reviewer)
- **Branch**: `develop`
- **Current Phase**: Phase 2: Annual Record Foundation
- **Current Work Package**: `MBO-P02-WP-002 (Employee Lookup & Verification Foundation)`
- **Current Mode**: `PLAN ONLY (DOCUMENTATION PREPARED FOR INDEPENDENT REVIEW)`
- **WP-001 Status**: `PASSED (Implementation Gate: PASS, Review Gate: PASS)`
- **Last Safe Commit**: `f982bdc` (WP-001 Passed Implementation & Review Gates)
- **Review Package**: [`project-docs/AI_REVIEW_PACKAGE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/AI_REVIEW_PACKAGE.md)
- **Last Backup Reference**: Baseline discovery JSONs in `info app/`

---

# MBO-P02-WP-002 — IMPLEMENTATION PLAN FOR REVIEW
## EMPLOYEE LOOKUP & VERIFICATION FOUNDATION (READ-ONLY)

### A. Purpose
Establish an authoritative, robust, and fail-closed Employee Lookup & Identity Verification service (`src/services/employee-service.js`) that queries App 53 (Read-Only) to populate the MBO Header Snapshot for MBO V2, while strictly ensuring:
1. Canonical Business Employee Code is sourced directly from `App53.emp_text` (preserving leading zeros, e.g. `"0149"`).
2. Input queries are decoupled from canonical storage (unpadded input like `"149"` may query `Number = 149`, but the returned snapshot strictly uses `App53.emp_text = "0149"`).
3. Fail-Closed behavior for missing/invalid `emp_text` (`EMPLOYEE_SOURCE_INCOMPLETE`), duplicate records (`EMPLOYEE_SOURCE_AMBIGUOUS`), missing records (`EMPLOYEE_NOT_FOUND`), invalid inputs (`EMPLOYEE_CODE_INVALID`), and connectivity errors (`SOURCE_ACCESS_ERROR`).
4. Strict Read-Only protection for App 53 and all Kintone apps (`WRITE_ALLOWED_APPS = []`).

---

### B. Approved Scope
1. **Refactor `EmployeeService.lookupEmployee` (`src/services/employee-service.js`):**
   - Implement dual-query capability for App 53 (`emp_text = "${cleanCode}" or Number = ${numericRep}`).
   - Extract canonical `Employee_Code` strictly from `App53.emp_text` (never from `Number` or input string).
   - Return structured result contract with 8 sanitized Header Snapshot fields:
     - `Employee_Code` (`App53.emp_text`)
     - `Employee_Name` (`App53.Text`)
     - `Employee_Name_TH` (`App53.Text_0`)
     - `Employee_Department` (`App53.Drop_down_0`)
     - `Employee_Section` (`App53.Drop_down`)
     - `Employee_Position` (`App53.Text_2`)
     - `Employee_Email` (`App53.Text_4`)
     - `Employee_Start_Date` (`App53.Date`)
   - Implement structured machine-readable result states and user-safe bilingual error objects.
2. **Automated Unit Tests (`tests/employee-lookup-service.test.js`):**
   - Implement `EMP-001` through `EMP-014` (including `EMPLOYEE_SOURCE_INCOMPLETE` validation).

---

### C. Explicit Out of Scope
* **`checkDuplicateMBO` Function:** Left untouched in `src/services/employee-service.js` (deferred to `MBO-P02-WP-003`).
* **Requester Authorization:** Out of scope (security access control is handled separately).
* **Evaluation Profile Resolution:** Out of scope (belongs to Phase 3 `MBO-P03-WP-001`).
* **Generic Routing Resolution:** Out of scope (belongs to Phase 5 `MBO-P05-WP-001`).
* **Hoshin Resolution:** Out of scope (legacy App 53 `Text_area`/`Text_area_0` are deprecated and excluded; MBO V2 Hoshin belongs to Phase 4).
* **Annual Record Creation:** Out of scope (writing records to App 794 belongs to `MBO-P02-WP-003`).
* **UI Screen Modifications:** Out of scope.

---

### D. App 53 Source Data Quality Audit & Evidence
Discovery audit of App 53 (Employee Namelist Master - 275 records, timestamp `2026-08-23T08:53:01.729Z`) demonstrates:
* **Total Master Records:** 275 records.
* **Canonical `emp_text` (`SINGLE_LINE_TEXT`):** Populated in 196 records, **Missing/Empty in 79 records**.
* **`Number` (`NUMBER`):** Populated in 275 records (0 missing, includes 3 decimal legacy records e.g. `'135.02'`).
* **Duplicate Detection (Fail-Closed Evidence):**
  - Duplicate `emp_text = "9000"`: 2 records.
  - Duplicate `Number = 9000`: 2 records.
  - *Behavioral Verification:* When queried with `limit 2`, `records.length > 1` triggers **`EMPLOYEE_SOURCE_AMBIGUOUS`** and halts execution safely.

#### Classification of 79 Records with Missing `emp_text`:
* **Eligibility Status Indicator:** App 53 contains an optional `Expiry_Date` field (populated in only 81 of 275 records) and lacks an explicit resignation/active status boolean.
* **Audit Breakdown of 79 Records:**
  - **A. Current / Active / MBO-Eligible:** `0` (Cannot be confirmed by explicit status field)
  - **B. Expired / Historical / Inactive:** `0` (No `Expiry_Date` populated in these 79 records)
  - **C. Cannot Determine:** **`79 records`** (**`ELIGIBILITY_CANNOT_BE_DETERMINED`**)
* **Section Distribution of 79 Records:**
  - Section `TMG1` (Mold): 53 records
  - Section `TMG2` (Engineering): 23 records
  - Section `TMF1` (Machinery): 2 records
  - Section `TMF2` (Industrial): 1 record
  - **Pilot Section `TME1`:** **`0 records missing`** (100% of TME1 employees possess canonical `emp_text`).
* **Pilot Employee `0149` (Record ID 386) Verification:**
  - `emp_text`: `'0149'` (Canonical String preserved)
  - `Number`: `'149'` (Query representation only)
  - `Section`: `'TME1'`
  - `Employee_Start_Date`: `'2021-04-01'` (Confirmed present)
* **Critical Architectural Rule:** Because 79 records lack canonical `emp_text`, any attempt to look up an employee whose App 53 record has missing `emp_text` will **FAIL CLOSED** with status **`EMPLOYEE_SOURCE_INCOMPLETE`**, completely preventing speculative padding (`padStart`) or numeric unpadded code leakage into MBO V2.

### E. Confirmed App 53 Field Mapping (8 Header Fields)
| Business Concept | Target MBO Field | App 53 Source Code | App 53 Field Type | Source Evidence Pointer / Example | Confidence |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **Employee Code** | `Employee_Code` | `emp_text` | `SINGLE_LINE_TEXT` | `info app/...json` Rec 386: `"0149"` | **100% (High)** |
| **English Name** | `Employee_Name` | `Text` | `SINGLE_LINE_TEXT` | `info app/...json` Rec 386: `"Mr.Gritchai  Somphonkrang"` | **100% (High)** |
| **Thai Name** | `Employee_Name_TH` | `Text_0` | `SINGLE_LINE_TEXT` | `info app/...json` Rec 386: Thai string | **100% (High)** |
| **Department** | `Employee_Department` | `Drop_down_0` | `DROP_DOWN` | `info app/...json` Rec 386: `"Eco Energy & Textile Machinery"` | **100% (High)** |
| **Section** | `Employee_Section` | `Drop_down` | `DROP_DOWN` | `info app/...json` Rec 386: `"TME1"` | **100% (High)** |
| **Job Position** | `Employee_Position` | `Text_2` | `SINGLE_LINE_TEXT` | `info app/...json` Rec 386: `"Marketing Chief"` | **100% (High)** |
| **Corporate Email**| `Employee_Email` | `Text_4` | `SINGLE_LINE_TEXT` | `info app/...json` Rec 386: `"gritchai@ttmet.co.th"` | **100% (High)** |
| **Start Date** | `Employee_Start_Date`| `Date` | `DATE` | `info app/...json` Rec 386: `"2021-04-01"` | **100% (High)** |

---

### F. Canonical Employee Code Strategy
* **Source of Truth:** Canonical Business Employee Code **must come directly from `App53.emp_text`**.
* **Leading-Zero Guarantee:** If user searches for `"149"` and App 53 matches via `Number = 149`, the returned snapshot `Employee_Code` will be `"0149"` (from `App53.emp_text`).
* **Zero Speculative Padding:** No `padStart()` or length assumptions.
* **Fail-Closed on Incomplete Data:** If a record is matched in App 53 but its `emp_text` field is empty, null, or invalid `/^[A-Za-z0-9_-]+$/`, the lookup service must abort immediately with state `EMPLOYEE_SOURCE_INCOMPLETE`.

---

### G. App 53 Query Representation Strategy
* **Digit-only input (e.g. `"0149"` or `"149"`):**
  - Canonical input string: `"0149"`
  - Numeric query representation: `parseInt(input, 10)` $\implies 149$
  - Query: `(emp_text = "${cleanCode}" or Number = ${numericRep}) limit 2`
* **Non-digit input (e.g. `"EMP_01"`):**
  - Query: `emp_text = "${cleanCode}" limit 2` (no `parseInt`)
* **Injection Safety:** All parameters sanitized to alphanumeric/hyphen/underscore before string interpolation.

---

### H. Structured Service Contract & Result States

#### 1. Success Return Contract
```javascript
{
  status: "EMPLOYEE_FOUND",
  employee: {
    Employee_Code: "0149",              // Sourced strictly from App53.emp_text
    Employee_Name: "Mr.Gritchai  Somphonkrang",
    Employee_Name_TH: "...",
    Employee_Department: "Eco Energy & Textile Machinery",
    Employee_Section: "TME1",
    Employee_Position: "Marketing Chief",
    Employee_Email: "gritchai@ttmet.co.th",
    Employee_Start_Date: "2021-04-01"
  }
}
```

#### 2. Structured Failure Result States & Bilingual Messages
```javascript
class EmployeeLookupError extends Error {
  constructor(code, userMessageTH, userMessageEN, cause = null) {
    super(userMessageTH);
    this.code = code;
    this.userMessageTH = userMessageTH;
    this.userMessageEN = userMessageEN;
    this.cause = cause;
  }
}
```

| State Code | Trigger Condition | User Message (TH / EN) |
| :--- | :--- | :--- |
| **`EMPLOYEE_CODE_INVALID`** | Input is null, non-string, empty, spaces, or illegal symbols | `กรุณาระบุรหัสพนักงานให้ถูกต้อง / Please enter a valid Employee Code.` |
| **`EMPLOYEE_NOT_FOUND`** | 0 records matched in App 53 | `ไม่พบข้อมูลพนักงานสำหรับรหัส ${code} ในระบบ Employee Master / Employee code ${code} was not found in Employee Master.` |
| **`EMPLOYEE_SOURCE_AMBIGUOUS`**| >1 records matched in App 53 | `พบรหัสพนักงาน ${code} ซ้ำซ้อนในระบบ Employee Master กรุณาติดต่อ HR / Duplicate employee records found in Master. Please contact HR.` |
| **`EMPLOYEE_SOURCE_INCOMPLETE`**| Record found but `emp_text` is empty/invalid | `ข้อมูลพนักงานในระบบ Employee Master ไม่สมบูรณ์ (ขาดรหัสพนักงาน Canonical) กรุณาติดต่อ HR / Employee Master data incomplete. Please contact HR.` |
| **`SOURCE_ACCESS_ERROR`** | Kintone API connectivity/network/permission failure | `ไม่สามารถตรวจสอบข้อมูลพนักงานได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง หรือติดต่อ HR / Unable to verify employee information at this time. Please try again or contact HR.` |

---

### I. Proposed Changes & Change Manifest

#### 1. Local Code
* **`src/services/employee-service.js` (MODIFY):** Refactor `lookupEmployee` to adhere to the 5-state contract, query strategy, and 8-field snapshot. Keep `checkDuplicateMBO` unmodified.
* **`tests/employee-lookup-service.test.js` (NEW):** 14 automated unit tests.

#### 2. Kintone Changes
* **Target Apps Modified:** `NONE (0)`
* **Kintone Write Operations:** `0 (Zero Writes)`
* **`WRITE_ALLOWED_APPS`:** `[]` (Default Deny)

---

### J. Test Plan (`EMP-001` to `EMP-014`)
* `EMP-001`: Valid `"0149"` $	o$ `EMPLOYEE_FOUND`, `Employee_Code === "0149"`.
* `EMP-002`: Input `"149"` queries `Number = 149`, but returned `Employee_Code === "0149"` (sourced from `emp_text`).
* `EMP-003`: Non-existent code $	o$ throws `EMPLOYEE_NOT_FOUND`.
* `EMP-004`: Empty / whitespace code $	o$ throws `EMPLOYEE_CODE_INVALID`.
* `EMP-005`: Invalid type / characters (numeric, spaces, slashes) $	o$ throws `EMPLOYEE_CODE_INVALID`.
* `EMP-006`: Multiple matches in App 53 $	o$ throws `EMPLOYEE_SOURCE_AMBIGUOUS`.
* `EMP-007`: Network / API failure $	o$ throws `SOURCE_ACCESS_ERROR` with user-safe message (no credentials leaked).
* `EMP-008`: Validates all 8 header fields including `Employee_Start_Date`.
* `EMP-009`: `EMPLOYEE_FOUND` does not imply Routing Success (Routing is decoupled).
* `EMP-010`: `EMPLOYEE_FOUND` does not imply Profile Success (Profile is decoupled).
* `EMP-011`: App 53 record found with missing/empty `emp_text` $	o$ throws `EMPLOYEE_SOURCE_INCOMPLETE`.
* `EMP-012`: App 53 remains strictly read-only (`POST/PUT/DELETE` blocked).
* `EMP-013`: App 794 remains unchanged (0 writes).
* `EMP-014`: App 795 remains unchanged (0 writes).

---

### K. Regression & Safety Plan
* Full test suite execution: 32 Baseline + 20 Safety + 10 Annual Foundation + 14 Employee Lookup $\implies$ **`76 / 76 Tests Passing (100%)`**.
* `WRITE_ALLOWED_APPS = []` throughout execution.
