# AI Operational Handoff Document

- **Handoff Date**: 2026-08-24T12:45:00+07:00
- **From AI**: Antigravity
- **To AI**: Incoming AI (Antigravity / Codex / Claude / Independent Reviewer)
- **Branch**: `develop`
- **Current Phase**: Phase 2: Annual Record Foundation
- **Current Work Package**: `MBO-P02-WP-003 (Annual Record Initialization & Duplicate Prevention)`
- **Current Mode**: `PLAN ONLY (PREPARED FOR INDEPENDENT REVIEW — ZERO KINTONE WRITES)`
- **WP-001 Status**: `PASSED (Implementation Gate: PASS, Review Gate: PASS)`
- **WP-002 Status**: `PASSED (Implementation Gate: PASS, Review Gate: PASS)`
- **Last Safe Commit**: `31ff6ca` (WP-002 Passed Implementation & Review Gates)
- **Review Package**: [`project-docs/AI_REVIEW_PACKAGE.md`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/project-docs/AI_REVIEW_PACKAGE.md)
- **Last Backup Reference**: Baseline discovery JSONs in `info app/`

---

# MBO-P02-WP-003 — IMPLEMENTATION PLAN FOR REVIEW
## ANNUAL RECORD INITIALIZATION & DUPLICATE PREVENTION (CANDIDATE FOR FIRST BUSINESS WRITE)

### A. Purpose
Establish the end-to-end Annual Record Initialization service for App 794 that creates a new annual draft MBO record for an employee in a designated Japanese Fiscal Year, enforcing a strict **Two-Layer Duplicate Prevention Invariant (1 Employee + 1 Fiscal Year = Exactly 1 MBO Record)** via:
1. Application-level pre-write query check (`Fiscal_Year = "FYXXXX" and Employee_Code = "XXXX"`).
2. Kintone schema unique constraint on `Record_Key` (`FYXXXX-XXXX`).

---

### B. Approved Scope
1. **Service Layer (`src/services/annual-record-service.js` or `employee-service.js`):**
   - Integration of `getJapaneseFiscalYear` (from `src/core/fiscal-year-engine.js`).
   - Integration of `EmployeeService.lookupEmployee` (from `src/services/employee-service.js`).
   - Integration of `generateRecordKey` (from `src/core/fiscal-year-engine.js`).
   - Refactor / integration of `checkDuplicateMBO` into the record creation pipeline.
   - Exact payload generation for App 794 record initialization with 10 initial fields:
     - `Fiscal_Year` (`"FY2027"`)
     - `Record_Key` (`"FY2027-0149"`)
     - `Employee_Code` (`"0149"`)
     - `Employee_Name` (`"Mr.Gritchai Somphonkrang"`)
     - `Employee_Name_TH` (`"นายกฤตชัย สมพลกรัง"`)
     - `Employee_Department` (`"Eco Energy & Textile Machinery"`)
     - `Employee_Section` (`"TME1"`)
     - `Employee_Position` (`"Marketing Chief"`)
     - `Employee_Email` (`"gritchai@ttmet.co.th"`)
     - `Employee_Start_Date` (`"2021-04-01"`)
2. **Controlled First Kintone Write Protocol (When Approved):**
   - Pre-Write Backup of App 794 records.
   - Temporary write allow-list strictly scoped to `WRITE_ALLOWED_APPS = [794]`.
   - Allowed operation: `POST /k/v1/record` for App 794 only.
   - Read-Back Verification: Immediate `GET /k/v1/record` diff checking all 10 initialized fields.
   - Unexpected Diff Detection: Fail-closed if any unmapped fields are modified.
   - Automatic Rollback: Delete test record / restore backup if verification fails.
   - Write-Window Closure: Reset `WRITE_ALLOWED_APPS = []` immediately after execution.
3. **Automated Unit & Integration Tests (`tests/annual-record-initialization.test.js`):**
   - Test suite covering `REC-001` through `REC-015`.

---

### C. Explicit Out of Scope
* **App 53 (Employee Master):** Permanent Read-Only (`WRITE_ALLOWED_APPS` never includes 53).
* **Protected Apps (283..716):** Permanent Hard Block.
* **App 795 (Routing Master):** Out of scope for WP-003 (`WRITE_ALLOWED_APPS` does not include 795).
* **Evaluation Profile Resolution & Scoring:** Out of scope (Phase 3).
* **Hoshin Strategy Injection:** Out of scope (Phase 4).
* **Workflow Approver Routing:** Out of scope (Phase 5).
* **UI Screens:** Out of scope (Phase 8).

---

### D. Duplicate Prevention Architecture (Two-Layer Invariant)
```
[User / Client Requests Record Creation]
               │
               ▼
[Layer 1: Application-Level Duplicate Query]
Query App 794: Fiscal_Year = "FY2027" and Employee_Code = "0149"
               │
       ┌───────┴───────────────────────┐
       ▼                               ▼
[Record Found > 0]             [Record Found == 0]
       │                               │
       ▼                               ▼
Throw DUPLICATE_MBO_EXISTS      [Attempt Kintone POST (App 794)]
(Fail-Closed before write)             │
                               ┌───────┴───────────────────────┐
                               ▼                               ▼
                       [POST Succeeded]        [Layer 2: Kintone Unique Conflict]
                               │               (400 / CB_VA01 on Record_Key)
                               ▼                               ▼
                       [Read-Back Verify]      Throw DUPLICATE_MBO_EXISTS (Catch & Wrap)
```

---

### E. Expected Change Manifest for WP-003
| Component | Action | Target / Scope | Expected Behavior |
| :--- | :---: | :---: | :--- |
| **`src/services/annual-record-service.js`** | `NEW` / `MODIFY` | Local Service | Coordinates lookup, FY calculation, duplicate check, and App 794 record payload |
| **`src/services/employee-service.js`** | `MODIFY` | Local Service | Integrate `checkDuplicateMBO` error handling with structured error codes |
| **`tests/annual-record-initialization.test.js`** | `NEW` | Unit / Mock Tests | 15 automated test cases (`REC-001`..`REC-015`) |
| **App 794 (Kintone Sandbox)** | `POST` | 1 Pilot Record (`0149`, `FY2027`) | Controlled sandbox test write with pre/post backup and rollback verification |
| **App 53 (Employee Master)** | `NONE` | Read-Only | 0 writes (Perm Blocked) |
| **App 795 (Routing Master)** | `NONE` | Locked | 0 writes (Perm Blocked) |

---

### F. Controlled Write Authorization & Safety Controls
1. **Pre-Write Backup:** Save snapshot of all App 794 records to `backups/app-794/{timestamp}/records.json`.
2. **Temporary Authorization:** Open write window `WRITE_ALLOWED_APPS = [794]` for `POST` only.
3. **Execution & Read-Back:**
   - Execute `POST /k/v1/record` with pilot payload (`FY2027-0149`).
   - Execute `GET /k/v1/record` for newly created record ID.
   - Assert exact equality for all 10 initialized fields.
   - Assert all remaining fields (Objectives, Scores, Routing) are unpopulated / default.
4. **Duplicate Re-Test on Live Sandbox:**
   - Attempt second `POST` with identical `Record_Key = "FY2027-0149"`.
   - Verify Layer 1 stops it locally.
   - (Optional Mock Test) Verify Layer 2 Kintone unique error is gracefully caught.
5. **Rollback / Cleanup:**
   - Delete created pilot record via `DELETE /k/v1/records` (or keep as confirmed sandbox baseline).
   - Immediately close write window: `WRITE_ALLOWED_APPS = []`.

---

### G. Test Plan (`REC-001` to `REC-015`)
* `REC-001`: Valid initialization payload contains correct `Fiscal_Year`, `Employee_Code`, `Record_Key`, and 7 snapshot fields.
* `REC-002`: `Record_Key` format strictly matches `/^FY\d{4}-[A-Za-z0-9_-]+$/`.
* `REC-003`: Layer 1 application duplicate check stops duplicate `Fiscal_Year + Employee_Code` before write.
* `REC-004`: Layer 2 Kintone unique constraint error (`Record_Key` collision) is caught and wrapped into user-safe message.
* `REC-005`: Attempt to initialize for employee with `EMPLOYEE_SOURCE_INCOMPLETE` fails closed before write.
* `REC-006`: Attempt to initialize for employee with `EMPLOYEE_NOT_FOUND` fails closed before write.
* `REC-007`: Attempt to initialize for employee with `EMPLOYEE_SOURCE_AMBIGUOUS` fails closed before write.
* `REC-008`: Attempt to initialize for employee with `EMPLOYEE_SOURCE_MISMATCH` fails closed before write.
* `REC-009`: Pre-write backup requirement is strictly enforced by safety guard.
* `REC-010`: Write attempt when `WRITE_ALLOWED_APPS` is empty is blocked locally.
* `REC-011`: Read-back verification detects unmapped field drift or data corruption.
* `REC-012`: App 53 remains strictly read-only (`POST/PUT/DELETE` blocked).
* `REC-013`: App 795 remains strictly write-blocked during WP-003.
* `REC-014`: Protected apps (283..716) remain permanently blocked.
* `REC-015`: Full regression suite passes 100%.

---

### H. Exit Criteria
* [ ] Implementation plan approved by Independent Review (`PLAN_GATE = PASS`).
* [ ] All 15 tests (`REC-001`..`REC-015`) passing.
* [ ] Full regression suite passes 100%.
* [ ] If live Kintone write executed: Pre-write backup, read-back diff, and write window closure verified.
* [ ] `AI_REVIEW_PACKAGE.md` prepared for WP-003.
