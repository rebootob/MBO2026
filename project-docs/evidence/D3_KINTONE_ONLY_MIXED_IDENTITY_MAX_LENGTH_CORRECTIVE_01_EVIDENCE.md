# Evidence: D3 Mixed Identity Max Length Corrective 01

- **Project:** MBO2026
- **Repository:** `rebootob/MBO2026`
- **Canonical Branch:** `ai/antigravity-wp002c`
- **Package:** `D3-KINTONE-ONLY-MIXED-IDENTITY-MAX-LENGTH-CORRECTIVE-01`
- **Authorization ID:** `MBO2026-D3-KINTONE-ONLY-MIXED-IDENTITY-MAX-LENGTH-CORRECTIVE-01-20260918-OWNER-01`
- **Authorized Base HEAD:** `b18f9880ca07ad043a7f8f8cc8231e0c1e37668e`
- **Mode:** IMPLEMENTATION + BOUNDARY TESTS + EVIDENCE SYNC
- **Date:** 2026-09-18

---

## 1. Mandatory Preflight Verification

- **Working Directory:** `C:/Users/allda/Desktop/Dev/git/MBO2026`
- **Current HEAD:** `b18f9880ca07ad043a7f8f8cc8231e0c1e37668e`
- **Upstream Tracking:** `origin/ai/antigravity-wp002c` at `b18f9880ca07ad043a7f8f8cc8231e0c1e37668e`
- **Preflight Match:** `HEAD == origin/ai/antigravity-wp002c == b18f9880ca07ad043a7f8f8cc8231e0c1e37668e` (Exact match, NO DRIFT)
- **Live Execution Status:** `KINTONE_READS = 0`, `KINTONE_WRITES = 0`, `SCHEMA_WRITES = 0`, `DEPLOYMENT = 0`, `UAT = 0`

---

## 2. Implementation Gap Closure

The gap identified in `project-docs/evidence/D3_KINTONE_ONLY_APP798_SCHEMA_PREFLIGHT_01_R3_EVIDENCE.md` regarding missing application-level max length validation has been resolved in `src/services/revision-archive-service.js`:

### Validated Bounds:
1. `Actual_Operator_Employee_Code`:
   - Validated against normalized canonical trimmed value.
   - Boundary: length `<= 64` characters PASS.
   - Boundary: length `> 64` characters throws `RevisionArchiveError('ACTUAL_OPERATOR_EMPLOYEE_CODE_EXCEEDS_MAX_LENGTH')`.
2. `Kintone_Login_User_Code`:
   - Validated against normalized canonical trimmed value.
   - Boundary: length `<= 64` characters PASS.
   - Boundary: length `> 64` characters throws `RevisionArchiveError('KINTONE_LOGIN_USER_CODE_EXCEEDS_MAX_LENGTH')`.
3. `Action_Name`:
   - Validated against normalized canonical trimmed value.
   - Boundary: length `<= 128` characters PASS.
   - Boundary: length `> 128` characters throws `RevisionArchiveError('ACTION_NAME_EXCEEDS_MAX_LENGTH')`.
4. `To_Status`:
   - Validated against normalized canonical trimmed value.
   - Boundary: length `<= 128` characters PASS.
   - Boundary: length `> 128` characters throws `RevisionArchiveError('TO_STATUS_EXCEEDS_MAX_LENGTH')`.

### Strict Guarantees Preserved:
- **No silent truncation:** Over-length values immediately fail closed.
- **Exact case equality:** `kintoneLoginUserCode === actorUserCode` preserved.
- **Fail-Closed:** Any validation error prevents repository `addRecord` call (zero writes).

---

## 3. Targeted Test & Boundary Verification

Executed test suite:
```bash
node --test \
  tests/revision-archive-kintone-repository.test.js \
  tests/revision-archive-service.test.js \
  tests/d3-stage-archive-integration.test.js
```

### Boundary Test Cases (`tests/d3-stage-archive-integration.test.js`):
- `Test 31`: Mixed Identity Max Length: `Actual_Operator_Employee_Code` length 64 = PASS, length 65 = FAIL CLOSED (`addRecordCallCount === 0`) -> **PASS**
- `Test 32`: Mixed Identity Max Length: `Kintone_Login_User_Code` length 64 = PASS, length 65 = FAIL CLOSED (`addRecordCallCount === 0`) -> **PASS**
- `Test 33`: Mixed Identity Max Length: `Action_Name` length 128 = PASS, length 129 = FAIL CLOSED (`addRecordCallCount === 0`) -> **PASS**
- `Test 34`: Mixed Identity Max Length: `To_Status` length 128 = PASS, length 129 = FAIL CLOSED (`addRecordCallCount === 0`) -> **PASS**

### Total Targeted Run Summary:
```text
ℹ tests 119
ℹ suites 0
ℹ pass 119
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 195.4291
```

---

## 4. Strict Change Boundary & Zero-I/O Accounting

- **Files Modified:**
  - `src/services/revision-archive-service.js` (Deterministic max-length enforcement)
  - `tests/d3-stage-archive-integration.test.js` (Boundary integration tests 31-34)
  - `project-docs/evidence/D3_KINTONE_ONLY_MIXED_IDENTITY_MAX_LENGTH_CORRECTIVE_01_EVIDENCE.md` (Evidence document)
  - `project-docs/control/02_ACTIVE_WORK_PACKAGE.md` (Control document update)
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

- **PACKAGE_STATUS:** `DELIVERED / REVIEW_REQUIRED`
- **CURRENT_GATE:** `STOP_FOR_INDEPENDENT_CONTROL_PLANE_REVIEW`
- **NEXT_GATE_NOT_STARTED:** `YES`
