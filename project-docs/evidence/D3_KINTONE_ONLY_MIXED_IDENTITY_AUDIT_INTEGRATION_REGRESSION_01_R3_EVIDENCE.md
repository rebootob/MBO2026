# Evidence: D3 Mixed Identity Audit Integration Regression 01 (R3)

- **Project:** MBO2026
- **Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Package:** `D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01-R3`
- **Authorization ID:** `MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01-R3-20260918-OWNER-01`
- **Authorized Base HEAD:** `bf03558cc0b695bf8f2379e0506a58f7124c0dcd`
- **Mode:** DOCS + EVIDENCE SYNC ONLY
- **Date:** 2026-09-18

---

## 1. Mandatory Preflight Verification

- **Working Directory:** `C:/Users/allda/Desktop/Dev/git/MBO2026`
- **Working Tree State:** Clean
- **Current HEAD:** `bf03558cc0b695bf8f2379e0506a58f7124c0dcd`
- **Upstream HEAD (`origin/ai/antigravity-wp002c`):** `bf03558cc0b695bf8f2379e0506a58f7124c0dcd`
- **Preflight Match:** `HEAD == origin/ai/antigravity-wp002c == bf03558cc0b695bf8f2379e0506a58f7124c0dcd` (Exact match, NO DRIFT)

---

## 2. Test Rerun Policy & Execution State

- **TEST_RERUN:** `NOT_REQUIRED`
- **REASON:** `NO_CODE_OR_TEST_DRIFT_SINCE_ACCEPTED_RESULTS`
- **Evidence Reuse:** All referenced test results are preserved verbatim from verified repository evidence.

---

## 3. Consolidated Evidence Chain

The complete regression gate verification chain is consolidated across accepted packages:

1. **Implementation R2 Verification:**
   - Reference: `project-docs/evidence/D3_KINTONE_ONLY_MIXED_IDENTITY_AUDIT_INTEGRATION_IMPLEMENTATION_01_R2_EVIDENCE.md`
   - Outcome: 115 targeted mixed-identity tests PASS (100% pass rate).

2. **Regression-01 Baseline & Related Suites:**
   - Reference: `project-docs/evidence/D3_KINTONE_ONLY_MIXED_IDENTITY_AUDIT_INTEGRATION_REGRESSION_01_EVIDENCE.md`
   - **TARGETED_BASELINE:** `115/115 PASS`
     - `tests/revision-archive-kintone-repository.test.js`
     - `tests/revision-archive-service.test.js`
     - `tests/d3-stage-archive-integration.test.js`
   - **DIRECTLY_RELATED_REGRESSION:** `183/183 PASS` (11 suites covering identity, snapshot, idempotency, routing, login gate, process validation).

3. **Regression-01-R1 Attribution Verification:**
   - Reference: `project-docs/evidence/D3_KINTONE_ONLY_MIXED_IDENTITY_AUDIT_INTEGRATION_REGRESSION_01_R1_EVIDENCE.md`
   - Baseline Commit Used: `e143259f120794e8c7201d93c727d3f47efcd6bd`
   - Attribution: All 6 failing suites proven `PRE_EXISTING_BASELINE_FAILURE` (0 git diff against pre-Mixed baseline; external/missing binary template dependencies).

4. **Regression-01-R2 Accounting & Exit Codes:**
   - Reference: `project-docs/evidence/D3_KINTONE_ONLY_MIXED_IDENTITY_AUDIT_INTEGRATION_REGRESSION_01_R2_EVIDENCE.md`
   - **SIX_SUITE_ACCOUNTING:** `VERIFIED`
   - **ALL_6_NODE_TEST_EXIT_CODES:** `1`
   - Exact Breakdown:
     - `tests/deploy-customization-preservation.test.js`: Exit Code 1 (37 pass, 14 fail, 0 cancelled/skipped/todo)
     - `tests/mbo-export-service.test.js`: Exit Code 1 (12 pass, 4 fail, 0 cancelled/skipped/todo)
     - `tests/mbo-xlsx-combined-composer.test.js`: Exit Code 1 (0 pass, 18 fail, 0 cancelled/skipped/todo)
     - `tests/mbo-xlsx-semantic-renderer.test.js`: Exit Code 1 (1 pass, 6 fail, 0 cancelled/skipped/todo)
     - `tests/mbo-xlsx-template-preparer-part-b.test.js`: Exit Code 1 (2 pass, 1 fail, 0 cancelled/skipped/todo)
     - `tests/mbo-xlsx-template-preparer.test.js`: Exit Code 1 (3 pass, 1 fail, 0 cancelled/skipped/todo)

5. **Regression Gate Invariant Outcomes:**
   - **NEW_REGRESSION_FROM_MIXED_IDENTITY:** `0`
   - **UNATTRIBUTED_COUNT:** `0`
   - **SIX_FAILURE_ATTRIBUTION:** `PRE_EXISTING_BASELINE_FAILURE`
   - **EVIDENCE_CHAIN_COMPLETE:** `YES`

---

## 4. Strict Change Boundary & Zero-I/O Accounting

- **SOURCE_CHANGE:** `0` (`src/` unchanged)
- **TEST_CHANGE:** `0` (`tests/` unchanged)
- **SCRIPT_CHANGE:** `0` (`scripts/` unchanged)
- **DEPENDENCY_CHANGE:** `0` (`package.json`, `package-lock.json` unchanged)
- **ZERO_IO_ACCOUNTING:**
  - KINTONE_READS: 0
  - KINTONE_WRITES: 0
  - SCHEMA_READS: 0
  - SCHEMA_WRITES: 0
  - PROCESS_WRITES: 0
  - RECORD_WRITES: 0
  - DEPLOYMENT: 0
  - UAT: 0
  - REAL_OAUTH: 0
  - EXTERNAL_BACKEND: 0

---

## 5. Control State & Stop Gate

- **LAST_DELIVERED_PACKAGE:** `D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01-R3`
- **PACKAGE_STATUS:** `DELIVERED / REVIEW_REQUIRED`
- **CURRENT_GATE:** `STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW`
- **NEXT_GATE_NOT_STARTED:** `YES`
  - App798 schema preflight: NOT STARTED
  - Schema deployment: NOT STARTED
  - App794 deployment: NOT STARTED
  - SHARED UAT: NOT STARTED
  - DEDICATED UAT: NOT STARTED
  - D3 closure: NOT STARTED
