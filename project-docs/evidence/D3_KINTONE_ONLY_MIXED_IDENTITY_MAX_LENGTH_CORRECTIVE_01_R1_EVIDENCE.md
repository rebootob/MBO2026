# Evidence: D3 Mixed Identity Max Length Corrective 01 (R1)

- **Project:** MBO2026
- **Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Package:** `D3-KINTONE-ONLY-MIXED-IDENTITY-MAX-LENGTH-CORRECTIVE-01-R1`
- **Authorization ID:** `MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-MAX-LENGTH-CORRECTIVE-01-R1-20260918-OWNER-01`
- **Authorized Base HEAD:** `b419fae73d809967e8ce0c16ae7ce794c625d569`
- **Mode:** LOCAL REGRESSION TEST + EVIDENCE CORRECTIVE ONLY
- **Date:** 2026-09-18

---

## 1. Mandatory Preflight Verification

- **Working Directory:** `C:/Users/allda/Desktop/Dev/git/MBO2026`
- **Working Tree State:** Clean
- **Current HEAD:** `b419fae73d809967e8ce0c16ae7ce794c625d569`
- **Upstream HEAD (`origin/ai/antigravity-wp002c`):** `b419fae73d809967e8ce0c16ae7ce794c625d569`
- **Preflight Match:** `HEAD == origin/ai/antigravity-wp002c == b419fae73d809967e8ce0c16ae7ce794c625d569` (Exact match, NO DRIFT)
- **Live Execution Status:** `KINTONE_READS = 0`, `KINTONE_WRITES = 0`, `SCHEMA_WRITES = 0`, `DEPLOYMENT = 0`, `UAT = 0`

---

## 2. Preserved Accepted Targeted Results

- **Reference:** `project-docs/evidence/D3_KINTONE_ONLY_MIXED_IDENTITY_MAX_LENGTH_CORRECTIVE_01_EVIDENCE.md`
- **Accepted Prior Result:** `TARGETED_MAX_LENGTH_TESTS = 119/119 PASS`
  - `tests/revision-archive-kintone-repository.test.js`
  - `tests/revision-archive-service.test.js`
  - `tests/d3-stage-archive-integration.test.js` (including boundary tests 31, 32, 33, 34)

---

## 3. Mandatory Directly-Related Regression Execution

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
  tests/d3-route-viability-service.test.js
```

### Execution Totals:
```text
ℹ tests 183
ℹ suites 5
ℹ pass 183
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 319.0881
```

### Directly Related Regression Breakdown:
- **`tests/d3-archive-idempotency.test.js`**: 14 tests PASS
- **`tests/d3-process-validation.test.js`**: 58 tests PASS
- **`tests/d3-reopen-archive-integration.test.js`**: 4 tests PASS
- **`tests/d3-route-viability-service.test.js`**: 17 tests PASS
- **`tests/d3-snapshot-serializer.test.js`**: 7 tests PASS
- **`tests/d3-stage-logical-snapshot.test.js`**: 4 tests PASS
- **`tests/mbo-kintone-login-gate.test.js`**: 22 tests PASS (5 sub-suites)
- **`tests/routing-service.test.js`**: 52 tests PASS
- **`tests/workflow-validator.test.js`**: 5 tests PASS

- **Failing Tests:** 0
- **Directly Related Failures:** 0
- **Failure Attribution:** None (0 failures)
- **NEW_REGRESSION_FROM_CORRECTIVE:** `0`

---

## 4. Mandatory Invariants Proof

- **ARCHIVE_KEY_BEHAVIOR = PRESERVED** (Verified by `tests/d3-archive-idempotency.test.js` and `tests/revision-archive-service.test.js`)
- **SNAPSHOT_HASH_BEHAVIOR = PRESERVED** (Verified by `tests/d3-snapshot-serializer.test.js` and `tests/d3-stage-logical-snapshot.test.js`)
- **IDEMPOTENCY = PRESERVED** (Verified by `tests/d3-archive-idempotency.test.js` TC26-TC36)
- **SHARED_IDENTITY = PRESERVED** (Verified by `tests/d3-stage-archive-integration.test.js` and `tests/mbo-kintone-login-gate.test.js`)
- **DEDICATED_IDENTITY = PRESERVED** (Verified by `tests/d3-stage-archive-integration.test.js` and `tests/mbo-kintone-login-gate.test.js` DEFECT-001)
- **HISTORICAL_READ_COMPATIBILITY = PRESERVED** (Verified by `tests/revision-archive-kintone-repository.test.js`)
- **MISSING_IDENTITY_CONTEXT_FAIL_CLOSED = PRESERVED** (Verified by `tests/revision-archive-service.test.js`)
- **EXACT_KINTONE_PRINCIPAL_CASE = PRESERVED** (Verified by `tests/revision-archive-service.test.js`)
- **MAX_LENGTH_BOUNDARIES = PRESERVED** (Verified by `tests/d3-stage-archive-integration.test.js` tests 31-34)
- **DECISION_009_EXTERNAL_PATH_ACTIVE = NO** (Strictly Kintone-only runtime)
- **NO_SECOND_LOGIN = YES**
- **NO_SECOND_PIN = YES**

---

## 5. Strict Change Boundary & Zero-I/O Accounting

- **PRODUCTION_SOURCE_CHANGE:** 0 (`src/` completely unchanged)
- **TEST_CHANGE:** 0 (`tests/` completely unchanged)
- **SCRIPT_CHANGE:** 0 (`scripts/` completely unchanged)
- **DEPENDENCY_CHANGE:** 0 (`package.json`, `package-lock.json` completely unchanged)
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

## 6. Control State & Stop Gate

- **LAST_DELIVERED_PACKAGE:** `D3-KINTONE-ONLY-MIXED-IDENTITY-MAX-LENGTH-CORRECTIVE-01-R1`
- **PACKAGE_STATUS:** `DELIVERED / REVIEW_REQUIRED`
- **CURRENT_GATE:** `STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW`
- **NEXT_GATE_NOT_STARTED:** `YES`
  - App798 schema deployment: NOT STARTED
  - App794 customization deployment: NOT STARTED
  - Live readback: NOT STARTED
  - SHARED UAT: NOT STARTED
  - DEDICATED UAT: NOT STARTED
  - D3 closure: NOT STARTED
