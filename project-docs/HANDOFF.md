# AI Operational Handoff Document

- **Handoff Date**: 2026-08-24T12:25:00+07:00
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
Establish an authoritative, secure, and fail-closed Employee Lookup & Identity Verification service that retrieves employee master data from App 53 (Read-Only) to populate the MBO Header Snapshot in MBO V2, while guaranteeing leading-zero string integrity and strictly preventing any mutation of App 53 or target apps.

---

### B. Approved Scope
1. **Pure Service Layer (`src/services/employee-service.js`):**
   - Client-side input validation rejecting non-string, spaces, slashes, or empty employee codes before API execution.
   - Dual-representation query generation for App 53 (`emp_text = "${canonicalCode}" or Number = ${numericRepresentation}`).
   - Deterministic status resolution (`EMPLOYEE_FOUND`, `EMPLOYEE_NOT_FOUND`, `EMPLOYEE_CODE_INVALID`, `EMPLOYEE_SOURCE_AMBIGUOUS`, `SOURCE_ACCESS_ERROR`).
   - Exactly-one-match enforcement (fails closed if duplicate employee records exist in App 53).
   - Sanitized Header Snapshot extraction (`Employee_Code`, `Employee_Name`, `Employee_Name_TH`, `Employee_Department`, `Employee_Section`, `Employee_Position`, `Employee_Email`).
2. **Automated Unit Tests (`tests/employee-lookup-service.test.js`):**
   - Implementation of test suite covering `EMP-001` through `EMP-013`.
3. **Kintone Read-Only Verification:**
   - Strict `WRITE_ALLOWED_APPS = []` with zero Kintone write operations.

---

### C. Explicit Out of Scope
* **Requester Authorization:** (Evaluating whether the logged-in user has permission to create/view this employee's MBO is out of scope; belongs to security layer).
* **Evaluation Profile Resolution:** (Mapping employee to Staff/Chief/Manager/GM profile is out of scope; belongs to Phase 3 `MBO-P03-WP-001`).
* **Routing Topology Resolution:** (Resolving Manager L1/L2 and GM L1/L2 approvers is out of scope; belongs to Phase 5 `MBO-P05-WP-001`).
* **Annual Record Creation & Unique Key Collision:** (Writing to App 794 is out of scope; belongs to `MBO-P02-WP-003`).
* **Hoshin Resolution:** (Extracting strategy text is out of scope; App 53 legacy Hoshin fields are deprecated; governed by Phase 4 App 795).
* **UI Screen Modifications:** (Rendering custom forms/dialogs is out of scope; belongs to Phase 8).

---

### D. Current App 53 Source Audit
Audit of App 53 (Employee Namelist Master - 275 records) confirmed:
* **Record Count:** 275 employee records.
* **Employee Code Storage:**
  - `emp_text`: `SINGLE_LINE_TEXT` containing padded/canonical strings (e.g. `"0149"`, `"0173"`).
  - `Number`: `NUMBER` containing unpadded integer values (e.g. `149`, `173`).
* **Personal Data:** `Text` (English Full Name), `Text_0` (Thai Full Name), `Text_4` (Email).
* **Organizational Data:** `Drop_down_0` (Department), `Drop_down` (Section code e.g. `"TME1"`, `"TMF2"`), `Text_2` (Position).
* **Legacy Fields:** `Text_area` (Department Hoshin - Deprecated), `Text_area_0` (Section Hoshin - Deprecated).

---

### E. Confirmed App 53 Field Mapping
| Business Concept | Target MBO Field | App 53 Source Field Code | App 53 Field Type | Example Value | Confidence |
| :--- | :--- | :--- | :---: | :--- | :---: |
| **Employee Code** | `Employee_Code` | `emp_text` (fallback `Number`) | `SINGLE_LINE_TEXT` / `NUMBER` | `"0149"` (canonical string) | **100% (High)** |
| **English Name** | `Employee_Name` | `Text` | `SINGLE_LINE_TEXT` | `"Mr.Wissarut  Khamnuan"` | **100% (High)** |
| **Thai Name** | `Employee_Name_TH` | `Text_0` | `SINGLE_LINE_TEXT` | `"นายวิศรุต  คำนวน"` | **100% (High)** |
| **Department** | `Employee_Department` | `Drop_down_0` | `DROP_DOWN` | `"Industrial Services"` | **100% (High)** |
| **Section** | `Employee_Section` | `Drop_down` | `DROP_DOWN` | `"TMF2"` | **100% (High)** |
| **Job Position** | `Employee_Position` | `Text_2` | `SINGLE_LINE_TEXT` | `"Marketing Staff"` | **100% (High)** |
| **Corporate Email**| `Employee_Email` | `Text_4` | `SINGLE_LINE_TEXT` | `"wissarut@ttmet.co.th"` | **100% (High)** |

---

### F. Canonical Employee Code Strategy
* **String Invariant:** Canonical Business Employee Code must strictly remain a String matching `/^[A-Za-z0-9_-]+$/` (e.g. `"0149"`).
* **No Speculative Padding:** The system shall **never** use `padStart(4, '0')` or make assumptions about code length.
* **Client-Side Rejection:** Numeric types (e.g. `149`), spaces (e.g. `"01 49"`), slashes, null, and empty strings are rejected with Error before any query execution.

---

### G. App 53 Query Representation Strategy
* To accommodate App 53 legacy data structures where some records may store the employee code under `Number` and others under `emp_text`:
  - Canonical String: `cleanCode = "0149"`
  - Query Representation:
    - If `cleanCode` contains purely digits: `numericRep = parseInt(cleanCode, 10)` $\implies 149$.
    - Query: `(emp_text = "${cleanCode}" or Number = ${numericRep}) limit 2`
  - **Critical Rule:** The numeric representation is used **strictly for query filtering** in App 53. The resulting MBO record snapshot will **never** adopt the unpadded numeric representation and will strictly retain `"0149"`.

---

### H. Lookup Architecture & Workflow
```
[Input Employee Code: "0149"]
               │
               ▼
[normalizeEmployeeCode("0149")] ──(Invalid)──► Return EMPLOYEE_CODE_INVALID
               │ (Valid)
               ▼
[Build App 53 Query: (emp_text = "0149" or Number = 149) limit 2]
               │
               ▼
[Execute GET /k/v1/records (App 53 - Read Only)] ──(Network/Auth Fail)──► Return SOURCE_ACCESS_ERROR
               │
       ┌───────┴───────────────────┐
       ▼                           ▼                           ▼
[Records.length == 1]       [Records.length == 0]       [Records.length > 1]
       │                           │                           │
       ▼                           ▼                           ▼
Return EMPLOYEE_FOUND       Return EMPLOYEE_NOT_FOUND   Return EMPLOYEE_SOURCE_AMBIGUOUS
(Pure Header Snapshot)      (Fail-Closed Bilingual Err) (Fail-Closed Critical Err)
```

---

### I. Result States
1. **`EMPLOYEE_FOUND`**: Exactly 1 matching record returned from App 53. Valid snapshot object returned.
2. **`EMPLOYEE_NOT_FOUND`**: 0 matching records in App 53. Throws clean bilingual error.
3. **`EMPLOYEE_CODE_INVALID`**: Code is numeric, empty, contains spaces/symbols, or violates canonical contract. Throws client-side error before query.
4. **`EMPLOYEE_SOURCE_AMBIGUOUS`**: 2 or more records matched the query in App 53. Fails closed with data corruption alert.
5. **`SOURCE_ACCESS_ERROR`**: Kintone API connectivity or permission error. Fails closed with structured system error.

---

### J. Exactly-One-Match Rule
* The lookup query strictly includes `limit 2`.
* If `records.length > 1`, the lookup service must immediately abort with `EMPLOYEE_SOURCE_AMBIGUOUS` and notify HR/Administrator. It shall never guess or pick the first record.

---

### K. Error Handling & Bilingual Messages
* **Invalid Code:** `กรุณาระบุรหัสพนักงานให้ถูกต้อง (ต้องเป็นตัวอักษรหรือตัวเลข ไม่มีช่องว่าง) / Please enter a valid Employee Code (alphanumeric, no spaces).`
* **Not Found:** `ไม่พบข้อมูลพนักงานสำหรับรหัส ${code} ในระบบ Employee Master / Employee code ${code} was not found in Employee Master (App 53).`
* **Ambiguous / Duplicate:** `พบข้อมูลรหัสพนักงาน ${code} ซ้ำซ้อนในระบบ Employee Master กรุณาติดต่อ HR / Duplicate employee code ${code} found in Master. Please contact HR.`

---

### L. Security & Data Logging
* Zero sensitive employee PII logged to console or stored in unencrypted temporary files.
* Local credentials (`.env.local`) remain Git-ignored and never committed.

---

### M. Proposed Source Files to Modify/Create
1. **`src/services/employee-service.js` (MODIFY):**
   - Refactor `EmployeeService.lookupEmployee` to adhere strictly to the Result State model and dual query representation.
   - Decouple legacy Hoshin fields (`Department_Hoshin`, `Section_Hoshin`).
2. **`tests/employee-lookup-service.test.js` (NEW):**
   - Create comprehensive unit test suite covering `EMP-001` through `EMP-013`.

---

### N. Expected Change Manifest
| Component | Action | Expected Behavior |
| :--- | :---: | :--- |
| **`src/services/employee-service.js`** | `MODIFY` | Pure read-only lookup with dual query and canonical string snapshot |
| **`tests/employee-lookup-service.test.js`** | `NEW` | 13 automated unit tests |
| **App 53 (Kintone)** | `NONE` | Read-only (0 writes, 0 schema changes) |
| **App 794 (Kintone)** | `NONE` | Unmodified (0 writes) |
| **App 795 (Kintone)** | `NONE` | Unmodified (0 writes) |

---

### O. Test Plan (`EMP-001` to `EMP-013`)
* `EMP-001`: Valid Employee Code `"0149"` returns `EMPLOYEE_FOUND` with full snapshot preserving `"0149"`.
* `EMP-002`: Query representation separation (numeric query used for App 53, canonical string preserved in output).
* `EMP-003`: Non-existent code (e.g. `"9999"`) returns `EMPLOYEE_NOT_FOUND`.
* `EMP-004`: Empty / whitespace-only code throws `EMPLOYEE_CODE_INVALID` without issuing API call.
* `EMP-005`: Numeric / invalid character code (e.g. `149`, `"01 49"`, `"01/49"`) throws `EMPLOYEE_CODE_INVALID`.
* `EMP-006`: Multiple matches in App 53 triggers `EMPLOYEE_SOURCE_AMBIGUOUS` (Fail-Closed).
* `EMP-007`: Network / API failure triggers `SOURCE_ACCESS_ERROR`.
* `EMP-008`: Correct field mapping snapshot (validates all 7 header fields).
* `EMP-009`: `EMPLOYEE_FOUND` does not imply Routing Success (Routing is decoupled).
* `EMP-010`: `EMPLOYEE_FOUND` does not imply Evaluation Profile Success (Profile is decoupled).
* `EMP-011`: App 53 remains strictly read-only (`POST/PUT/DELETE` blocked).
* `EMP-012`: App 794 remains unchanged (0 writes).
* `EMP-013`: App 795 remains unchanged (0 writes).

---

### P. Regression Plan
* Execute full test suite: Existing Baseline (32 tests) + Safety Tests (20 tests) + Annual Foundation (10 tests) + Employee Lookup (13 tests) $\implies$ **`75 / 75 Tests Passing (100%)`**.

---

### Q. Kintone Read-Only Controls
* `WRITE_ALLOWED_APPS = []` (Default Deny).
* Operations permitted: `GET` only.
* Operations blocked: `POST = DENY`, `PUT = DENY`, `DELETE = DENY`.

---

### R. Risks & Mitigations
* **Risk:** Slow API response when querying App 53.
  - *Mitigation:* Query uses indexed fields (`Number`, `emp_text`) and specifies `limit 2`.
* **Risk:** Accidental adoption of numeric `149` in snapshot.
  - *Mitigation:* Explicit test `EMP-002` asserting strict string preservation.

---

### S. Rollback Plan
* If unexpected issues arise, revert to commit `f982bdc` on branch `develop`.

---

### T. Documentation Updates
* Update `project-docs/IMPLEMENTATION_STATUS.md`, `project-docs/CURRENT_STATE.md`, `project-docs/HANDOFF.md`, `project-docs/CHANGELOG_AI.md`, and `project-docs/AI_REVIEW_PACKAGE.md`.

---

### U. Exit Criteria
* [ ] All 13 unit tests (`EMP-001`..`EMP-013`) pass.
* [ ] Full regression suite (75 tests) passes 100%.
* [ ] Kintone Write Operations = 0.
* [ ] Kintone Apps Modified = NONE.
* [ ] `AI_REVIEW_PACKAGE.md` prepared and ready for Independent Review.

---

### V. Exact Next Work Package Boundary
* **Next Work Package:** `MBO-P02-WP-003: ANNUAL RECORD INITIALIZATION & DUPLICATE PREVENTION`
* **Scope for WP-003:** App 794 record initialization pipeline, pre-write duplicate check (`Record_Key = "FYXXXX-XXXX"` collision prevention), draft initialization, and Kintone write authorization under controlled write window.
