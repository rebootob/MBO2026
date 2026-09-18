# Evidence: D3 Mixed Identity Audit Integration Regression 01

- **Project:** MBO2026
- **Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Package:** `D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01`
- **Authorization ID:** `MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-REGRESSION-01-20260918-OWNER-01`
- **Date:** 2026-09-18
- **Mode:** LOCAL REGRESSION + BASELINE ATTRIBUTION ONLY

---

## 1. Mandatory Preflight Result

- **Working Directory:** `C:/Users/allda/Desktop/Dev/git/MBO2026`
- **Working Tree State:** Clean
- **Authorized Base HEAD:** `7f929290e7215f43caa33272fa7ccaea4710b561`
- **Upstream HEAD (`origin/ai/antigravity-wp002c`):** `7f929290e7215f43caa33272fa7ccaea4710b561`
- **Preflight Verification:** `HEAD == origin/ai/antigravity-wp002c == 7f929290e7215f43caa33272fa7ccaea4710b561` (Exact match, NO DRIFT)

---

## 2. Test Phase 1 — Accepted Targeted Baseline

Command executed:
```bash
node --test \
  tests/revision-archive-kintone-repository.test.js \
  tests/revision-archive-service.test.js \
  tests/d3-stage-archive-integration.test.js
```

### Result Totals
- **tests:** 115
- **pass:** 115
- **fail:** 0
- **cancelled:** 0
- **skipped:** 0
- **todo:** 0
- **Targeted Baseline Drift:** `NO`

---

## 3. Test Phase 2 — Directly Related Regression

Command executed:
```bash
node --test \
  tests/d3-stage-logical-snapshot.test.js \
  tests/d3-snapshot-serializer.test.js \
  tests/d3-archive-idempotency.test.js \
  tests/d3-reopen-archive-integration.test.js \
  tests/d3-process-validation.test.js \
  tests/workflow-validator.test.js \
  tests/mbo-kintone-login-gate.test.js \
  tests/routing-service.test.js \
  tests/routing-service-audit-contract.test.js \
  tests/d3-app795-routing-resolver.test.js \
  tests/d3-route-viability-service.test.js
```

### Result Totals
- **tests:** 183
- **suites:** 11 (5 sub-suites in login gate)
- **pass:** 183
- **fail:** 0
- **cancelled:** 0
- **skipped:** 0
- **todo:** 0
- **Directly Related Regressions:** `0`

---

## 4. Test Phase 3 — Broader Local Regression & Attribution

Executed all 95 local test suites in `tests/`:
- **Passing Suites:** 89 suites (1,765 tests PASS, 10 tests SKIPPED in `mbo-xlsx-ooxml-feasibility.test.js`)
- **Failing Suites:** 6 suites

### Attribution Breakdown

| Test Suite | Error / Failure Reason | Classification | Proof / Reference |
|---|---|---|---|
| `tests/deploy-customization-preservation.test.js` | `ERR_MODULE_NOT_FOUND` (`scripts/kintone/deploy-custom-ui.js` missing outside repo root) | `PRE_EXISTING_BASELINE_FAILURE` | Commit `22e7c788` (2026-09-13). File path was external to repo root prior to Mixed Identity work. |
| `tests/mbo-export-service.test.js` | `AssertionError: Local Part A owner template missing at .../app info/data/PMS_Staff & Chief_PART_A.xlsx` | `PRE_EXISTING_BASELINE_FAILURE` | Commit `8600f86` shows `app info/data/` untracked binary templates not tracked in repository history. |
| `tests/mbo-xlsx-combined-composer.test.js` | Same missing binary template dependency | `PRE_EXISTING_BASELINE_FAILURE` | Untracked xlsx fixture requirement pre-dating current implementation. |
| `tests/mbo-xlsx-semantic-renderer.test.js` | Same missing binary template dependency | `PRE_EXISTING_BASELINE_FAILURE` | Untracked xlsx fixture requirement pre-dating current implementation. |
| `tests/mbo-xlsx-template-preparer-part-b.test.js` | Same missing binary template dependency | `PRE_EXISTING_BASELINE_FAILURE` | Untracked xlsx fixture requirement pre-dating current implementation. |
| `tests/mbo-xlsx-template-preparer.test.js` | Same missing binary template dependency | `PRE_EXISTING_BASELINE_FAILURE` | Untracked xlsx fixture requirement pre-dating current implementation. |

**NEW_REGRESSION COUNT:** **0**

---

## 5. Mandatory Invariants Check

- `MIXED_IDENTITY_TARGETED_TESTS` = 115/115 PASS
- `SHARED_IDENTITY` = PASS
- `DEDICATED_IDENTITY` = PASS
- `MISSING_IDENTITY_CONTEXT_FAIL_CLOSED` = PASS
- `EXACT_KINTONE_PRINCIPAL_CASE` = PRESERVED
- `ARCHIVE_KEY_BEHAVIOR` = PRESERVED (ARCHIVE_KEY_DRIFT = NO)
- `SNAPSHOT_HASH_BEHAVIOR` = PRESERVED (SNAPSHOT_HASH_DRIFT = NO)
- `IDEMPOTENCY` = PRESERVED
- `HISTORICAL_READ_COMPATIBILITY` = PRESERVED
- `DECISION_009_EXTERNAL_PATH_ACTIVE` = NO
- `NO_SECOND_LOGIN` = YES
- `NO_SECOND_PIN` = YES

---

## 6. Zero-I/O Accounting & Safety

- **KINTONE_READS:** 0
- **KINTONE_WRITES:** 0
- **SCHEMA_READS:** 0
- **SCHEMA_WRITES:** 0
- **PROCESS_WRITES:** 0
- **RECORD_WRITES:** 0
- **DEPLOYMENT:** 0
- **UAT:** 0
- **REAL_OAUTH:** 0
- **EXTERNAL_BACKEND:** 0
- **PRODUCTION_CODE_CHANGE:** `NO` (Production code untouched)
- **TEST_CODE_CHANGE:** `NO` (No test code modified)

---

## 7. Status & Next Gate

- **Package Status:** `DELIVERED / REVIEW_REQUIRED`
- **Current Gate:** `STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW`
- **Next Gate Started:** `NO`
- **Prohibited Work Acknowledged:**
  - App798 schema preflight: NOT STARTED
  - Schema deployment: NOT STARTED
  - App794 deployment: NOT STARTED
  - SHARED UAT: NOT STARTED
  - DEDICATED UAT: NOT STARTED
  - D3 closure: NOT STARTED
