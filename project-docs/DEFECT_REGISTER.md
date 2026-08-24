# MBO V2 Defect Register & Issue Log

> **Document Status:** Active Tracking Register  
> **Format Standard:** `MBO-P{PHASE}-DEF-{NUMBER}`  
> **Last Updated:** 2026-08-24T12:12:00+07:00  

---

## 1. Defect Classification Standard

* **Severity 1 (Critical):** Blocker preventing test gate progression, data loss, security bypass, or calculation error.
* **Severity 2 (Major):** Functional failure in workflow, missing guidance requirement, or UI display failure.
* **Severity 3 (Minor):** Layout cosmetic imperfection, minor translation typo, or non-blocking edge case.

---

## 2. Master Defect Tracking Table

| Defect ID | Phase | Severity | Summary & Symptom | Root Cause | Affected Component | Fix Description | Regression Test Evidence | Status |
| :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: |
| **MBO-P02-DEF-001** | P2 | Severity 2 | `normalizeEmployeeCode` accepted numeric input (`149`), risking destruction of canonical string code (`"0149"`). | Lack of strict `typeof code === 'string'` type check in normalization function. | `src/core/fiscal-year-engine.js` | Enforced strict string contract; numeric input now throws Error. | `ANNUAL-003` passing | **`FIXED_PENDING_RETEST`** |
| **MBO-P02-DEF-002** | P2 | Severity 2 | `getJapaneseFiscalYear` permitted invalid calendar dates (`2027-13-01`, `2027-02-31`, `2027-04-01abc`) without failing closed. | Reliance on standard `Date` parsing which silently rolled over invalid dates. | `src/core/fiscal-year-engine.js` | Implemented strict date validation parsing exact day/month/leap-year limits and regex format. | `ANNUAL-010`, `ANNUAL-004` passing | **`FIXED_PENDING_RETEST`** |
| **MBO-P02-DEF-003** | P2 | Severity 3 | Test description mismatch: `ANNUAL-005` claimed duplicate protection (which belongs to record creation), and `ANNUAL-007` claimed independent schema equality. | Over-broad test naming in Phase 2 WP-001 test suite. | `tests/annual-record-foundation.test.js` | Re-titled `ANNUAL-005` as input validation test and `ANNUAL-007` as write guard verification. | `ANNUAL-005`, `ANNUAL-007` passing | **`FIXED_PENDING_RETEST`** |
| **MBO-P02-DEF-004** | P2 | Severity 3 | Handoff metadata named Next WP as Record Initialization instead of Employee Lookup. | Inaccurate sequential naming in implementation metadata. | `project-docs/HANDOFF.md`, `IMPLEMENTATION_STATUS.md` | Corrected Next WP to `MBO-P02-WP-002: EMPLOYEE LOOKUP & VERIFICATION FOUNDATION` (Read-Only). | Metadata synchronized | **`FIXED_PENDING_RETEST`** |
