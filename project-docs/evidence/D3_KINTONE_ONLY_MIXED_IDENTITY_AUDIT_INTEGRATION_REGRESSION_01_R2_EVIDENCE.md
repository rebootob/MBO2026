# Evidence: D3 Mixed Identity Audit Integration Regression 01 (R2)

- **Project:** MBO2026
- **Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Package:** `D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01-R2`
- **Authorization ID:** `MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01-R2-20260918-OWNER-01`
- **Authorized Base HEAD:** `0c354fbed4194f5bd272e7a39b66dcd24c1dca9a`
- **Pre-Mixed-Identity Baseline Commit:** `e143259f120794e8c7201d93c727d3f47efcd6bd`
- **Mode:** EVIDENCE ACCOUNTING CORRECTIVE ONLY
- **Date:** 2026-09-18

---

## 1. Mandatory Preflight Verification

- **Working Directory:** `C:/Users/allda/Desktop/Dev/git/MBO2026`
- **Working Tree State:** Clean
- **Current HEAD:** `0c354fbed4194f5bd272e7a39b66dcd24c1dca9a`
- **Upstream HEAD (`origin/ai/antigravity-wp002c`):** `0c354fbed4194f5bd272e7a39b66dcd24c1dca9a`
- **Preflight Match:** `HEAD == origin/ai/antigravity-wp002c == 0c354fbed4194f5bd272e7a39b66dcd24c1dca9a` (Exact match, NO DRIFT)

---

## 2. Inconsistency Correction: `tests/mbo-export-service.test.js`

In R1, the summary reported `42 pass / 1 fail / Exit Code = 0` due to a shell log capture artifact.
Deterministic re-execution using `node --test tests/mbo-export-service.test.js` establishes the true, raw Node.js test runner values:
- **Actual Node Exit Code:** `1` (Process fails with non-zero exit code)
- **Raw Node Summary:**
  - `ℹ tests 16`
  - `ℹ suites 0`
  - `ℹ pass 12`
  - `ℹ fail 4`
  - `ℹ cancelled 0`
  - `ℹ skipped 0`
  - `ℹ todo 0`
- **First Failure:** `EXPORT_SERVICE_GENERATE_COMBINED_XLSX_EMPLOYEE_SELF: generates 2-sheet combined workbook omitting confidential ratings/comments, rendering safe values & 0 formulas` (tests/mbo-export-service.test.js:473)
- **Exact Error Class & Message:** `AssertionError [ERR_ASSERTION]: Local Part A owner template missing at C:\Users\allda\Desktop\Dev\git\MBO2026\app info\data\PMS_Staff & Chief_PART_A.xlsx`

This completely resolves the accounting discrepancy. The exit code is strictly `1`, failing tests count is `4`, passing tests count is `12`.

---

## 3. Six Suites Exact Execution Accounting Table

All six suites were individually executed using `node --test <suite>` with exact process exit code captured via shell `$?`.

| SUITE | NODE_TEST_EXIT_CODE | TESTS | SUITES | PASS | FAIL | CANCELLED | SKIPPED | TODO | FIRST_FAILURE | EXACT_ERROR | ATTRIBUTION |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `tests/deploy-customization-preservation.test.js` | 1 | 51 | 0 | 37 | 14 | 0 | 0 | 0 | `BLOCKER_B_AUTHORIZATION_CONSUMPTION: Not consumed during local validation/build/read preflight; consumed at upload boundary; replay rejected; invalid auth causes zero network` | `AssertionError [ERR_ASSERTION]: DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK` | `PRE_EXISTING_BASELINE_FAILURE` |
| `tests/mbo-export-service.test.js` | 1 | 16 | 0 | 12 | 4 | 0 | 0 | 0 | `EXPORT_SERVICE_GENERATE_COMBINED_XLSX_EMPLOYEE_SELF` | `AssertionError [ERR_ASSERTION]: Local Part A owner template missing at .../PMS_Staff & Chief_PART_A.xlsx` | `PRE_EXISTING_BASELINE_FAILURE` |
| `tests/mbo-xlsx-combined-composer.test.js` | 1 | 18 | 0 | 0 | 18 | 0 | 0 | 0 | `R2-D1: Exhaustive Deterministic Matrix (Part A 4..10 x Part B 6/7/8 = 21 combinations)` | `AssertionError [ERR_ASSERTION]: Local Part A owner template missing at .../PMS_Staff & Chief_PART_A.xlsx` | `PRE_EXISTING_BASELINE_FAILURE` |
| `tests/mbo-xlsx-semantic-renderer.test.js` | 1 | 7 | 0 | 1 | 6 | 0 | 0 | 0 | `RENDERER_TEST_B: Complete fail-closed boundary & perturbation matrix` | `AssertionError [ERR_ASSERTION]: Local Part A owner template file missing at .../PMS_Staff & Chief_PART_A.xlsx` | `PRE_EXISTING_BASELINE_FAILURE` |
| `tests/mbo-xlsx-template-preparer-part-b.test.js` | 1 | 3 | 0 | 2 | 1 | 0 | 0 | 0 | `PREPARER_PART_B_OWNER_TEMPLATE_INTEGRATION: N=6/7/8 complete proof matrix, deep row structural parity & frozen baseline matrix` | `AssertionError [ERR_ASSERTION]: Local Part B owner template file missing at .../PMS_Staff & Chief_PART_B.xlsx` | `PRE_EXISTING_BASELINE_FAILURE` |
| `tests/mbo-xlsx-template-preparer.test.js` | 1 | 4 | 0 | 3 | 1 | 0 | 0 | 0 | `PREPARER_PART_A_OWNER_TEMPLATE_INTEGRATION: N=4..10 complete proof matrix, deep row structural parity & frozen baseline matrix` | `AssertionError [ERR_ASSERTION]: Local Part A owner template file missing at .../PMS_Staff & Chief_PART_A.xlsx` | `PRE_EXISTING_BASELINE_FAILURE` |

*Note: All numeric fields are explicitly emitted by the Node.js test runner summary.*

---

## 4. Attribution & Baseline Comparison Verification

1. **Failure Signatures:**
   - The failure signatures of all six suites match R1 and baseline `e143259f120794e8c7201d93c727d3f47efcd6bd` identically:
     - `deploy-customization-preservation.test.js`: Safety abort on uncommitted `dist/` created by earlier build subtests (`DIRTY_WORKTREE_BLOCKED_BEFORE_BUILD_AND_NETWORK`).
     - Five XLSX suites: Missing local binary template files `app info/data/PMS_Staff & Chief_PART_A.xlsx` and `PMS_Staff & Chief_PART_B.xlsx` which were never tracked in git.
2. **Attribution:**
   - All 6 failing suites remain strictly categorized as `PRE_EXISTING_BASELINE_FAILURE`.
   - NEW_REGRESSION_FROM_MIXED_IDENTITY = **0**
   - UNATTRIBUTED_COUNT = **0**

---

## 5. Invariant, Scope & Zero-I/O Accounting

- **SOURCE_CHANGE:** 0 (Production files in `src/` and `scripts/` untouched)
- **TEST_CHANGE:** 0 (Test files in `tests/` untouched)
- **CLEAN_WORKING_TREE:** Maintained clean; temporary build artifacts reverted immediately.
- **ZERO_IO_ACCOUNTING:**
  - KINTONE_READS = 0
  - KINTONE_WRITES = 0
  - SCHEMA_READS = 0
  - SCHEMA_WRITES = 0
  - PROCESS_WRITES = 0
  - RECORD_WRITES = 0
  - DEPLOYMENT = 0
  - UAT = 0
  - REAL_OAUTH = 0
  - EXTERNAL_BACKEND = 0

---

## 6. Control State & Stop Gate

- **LAST_DELIVERED_PACKAGE:** `D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01-R2`
- **PACKAGE_STATUS:** `DELIVERED / REVIEW_REQUIRED`
- **CURRENT_GATE:** `STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW`
- **NEXT_GATE_NOT_STARTED:** `YES`
  - App798 schema preflight: NOT STARTED
  - Schema deployment: NOT STARTED
  - App794 deployment: NOT STARTED
  - SHARED UAT: NOT STARTED
  - DEDICATED UAT: NOT STARTED
  - D3 closure: NOT STARTED
