# MBO V2 Defect Register & Issue Log

> **Document Status:** Active Tracking Register  
> **Format Standard:** `MBO-P{PHASE}-DEF-{NUMBER}`  
> **Last Updated:** 2026-08-24T12:42:00+07:00  

---

## 1. Defect Classification Standard

* **Severity 1 (Critical):** Blocker preventing test gate progression, data loss, security bypass, or calculation error.
* **Severity 2 (Major):** Functional failure in workflow, missing guidance requirement, or UI display failure.
* **Severity 3 (Minor):** Layout cosmetic imperfection, minor translation typo, or non-blocking edge case.

---

## 2. Master Defect Tracking Table

| Defect ID | Phase | Severity | Summary & Symptom | Root Cause | Affected Component | Fix Description | Regression Test Evidence | Status |
| :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **MBO-P02-DEF-001** | P2 | Severity 2 | `normalizeEmployeeCode` accepted numeric input (`149`), risking destruction of canonical string code (`"0149"`). | Lack of strict string type check in normalization function. | `src/core/fiscal-year-engine.js` | Enforced strict string contract; numeric input throws Error. | `ANNUAL-003` passing | **`CLOSED`** |
| **MBO-P02-DEF-002** | P2 | Severity 2 | `getJapaneseFiscalYear` permitted invalid calendar dates (`2027-13-01`, `2027-02-31`) without failing closed. | Reliance on rollover Date parsing. | `src/core/fiscal-year-engine.js` | Implemented strict date parsing validating exact month/day limits. | `ANNUAL-010`, `ANNUAL-004` passing | **`CLOSED`** |
| **MBO-P02-DEF-003** | P2 | Severity 3 | Test description mismatch: `ANNUAL-005` claimed duplicate protection, and `ANNUAL-007` claimed independent schema equality. | Over-broad test naming in Phase 2 WP-001 test suite. | `tests/annual-record-foundation.test.js` | Re-titled `ANNUAL-005` as input validation and `ANNUAL-007` as write guard verification. | `ANNUAL-005`, `ANNUAL-007` passing | **`CLOSED`** |
| **MBO-P02-DEF-004** | P2 | Severity 3 | Handoff metadata named Next WP as Record Initialization instead of Employee Lookup. | Inaccurate sequential naming in implementation metadata. | `project-docs/HANDOFF.md`, `IMPLEMENTATION_STATUS.md` | Corrected Next WP to `MBO-P02-WP-002: EMPLOYEE LOOKUP & VERIFICATION FOUNDATION` (Read-Only). | Metadata synchronized | **`CLOSED`** |
| **MBO-P02-DEF-005** | P2 | Severity 2 | `generateRecordKey("FY2027", "01 49")` generated a key rejected by `isValidRecordKeyFormat`. | Inconsistent character contract between generator and validator. | `src/core/fiscal-year-engine.js` | Enforced canonical character set `/^[A-Za-z0-9_-]+$/` on Employee Code in `normalizeEmployeeCode` and verified output against `isValidRecordKeyFormat`. | `ANNUAL-003`, `ANNUAL-004` passing | **`CLOSED`** |
| **MBO-P02-DEF-006** | P2 | Severity 2 | Date parser did not fully validate hour/minute/second bounds on ISO timestamps (e.g. `2027-04-01T99:99:99`). | Timestamp regex parsed time components without bound checks. | `src/core/fiscal-year-engine.js` | Added strict bound checks: hour `0-23`, minute `0-59`, second `0-59`, and timezone offset `0-14`/`0-59`. | `ANNUAL-010` passing | **`CLOSED`** |
| **MBO-P02-DEF-007** | P2 | Severity 3 | `AI_REVIEW_PACKAGE.md` missing explicit Review Target Commit SHA. | Placeholder text left in review metadata. | `project-docs/AI_REVIEW_PACKAGE.md` | Document updated with separate Implementation Target Commit (`8dba33d`) and Review Head Commit (`f982bdc`). | Package metadata verified | **`CLOSED`** |
| **MBO-P02-DEF-008** | P2 | Severity 2 | Source record matched via numeric query representation could return a disparate `emp_text` (e.g. requested `"149"` matched `Number = 149`, but record stored `emp_text = "0150"`). | Lack of post-lookup identity consistency check between canonical source and input. | `src/services/employee-service.js` | Implemented identity consistency check asserting exact match or numeric equivalence for digit-only inputs; mismatches throw `EMPLOYEE_SOURCE_MISMATCH`. | `EMP-015`, `EMP-016` passing | **`FIXED_PENDING_RETEST`** |
| **MBO-P02-DEF-009** | P2 | Severity 2 | Malformed Kintone API response (e.g. `{}`, `{ records: null }`) was silently converted by `resp?.records || []` into `EMPLOYEE_NOT_FOUND`. | Missing response structure validation before records evaluation. | `src/services/employee-service.js` | Added strict validation requiring `Array.isArray(resp.records)`; invalid responses throw `SOURCE_RESPONSE_INVALID`. | `EMP-017`, `EMP-018` passing | **`FIXED_PENDING_RETEST`** |
| **MBO-P02-DEF-010** | P2 | Severity 3 | Unit test mock fixture in `tests/employee-lookup-service.test.js` contained real employee personal data (Name, Thai Name, Email). | Real discovery record values copied into test fixture. | `tests/employee-lookup-service.test.js` | Replaced personal fixture values with synthetic data (`"Test Employee"`, `"พนักงานทดสอบ"`, `"pilot0149@example.invalid"`), retaining only structural IDs (`"0149"`, `"TME1"`). | `EMP-008` passing | **`FIXED_PENDING_RETEST`** |
