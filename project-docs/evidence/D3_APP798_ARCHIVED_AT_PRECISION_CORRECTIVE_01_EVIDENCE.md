# Evidence: D3-APP798-ARCHIVED-AT-PRECISION-CORRECTIVE-01

- **Package ID:** `D3-APP798-ARCHIVED-AT-PRECISION-CORRECTIVE-01`
- **Authorized Base HEAD:** `068ed8d8a0b498ba6c14c3e58c33565f6cff43a5`
- **Date:** 2026-09-19
- **Governance:** Strict Orbis Governance / Zero-I/O Verification

---

## 1. Problem Statement & Proven Cause
During post-create readback on App 798 archive records, a precision mismatch was observed between:
* **Persisted (Kintone DATETIME):** `2026-09-19T14:24:00Z` (minute precision; seconds and milliseconds are truncated by Kintone)
* **Expected (Runtime Clock):** `2026-09-19T14:24:39.281Z` (millisecond precision)

The raw string inequality (`persisted.archivedAt !== expected.archivedAt`) in `compareArchiveRecordToExpected` failed closed with `ARCHIVE_READBACK_VERIFICATION_FAILED` even though the record had been created successfully and all other archive fields matched exactly.

---

## 2. Minimal Deterministic Normalization Rule
In `src/services/revision-archive-service.js` under `compareArchiveRecordToExpected(..., mode)` when `isReadback` is true:
```javascript
const toMinutePrecision = (iso) => {
  if (!iso || typeof iso !== 'string') return iso;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  d.setUTCSeconds(0, 0);
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
};
const persistedMinute = toMinutePrecision(persisted.archivedAt);
const expectedMinute = toMinutePrecision(expected.archivedAt);
if (persistedMinute !== expectedMinute) {
  fail('Archived_At', persisted.archivedAt, expected.archivedAt);
}
```

* Both sides are normalized to minute precision (seconds and milliseconds zeroed out) before comparison.
* Any mismatch outside the permitted minute precision still fails closed with `ARCHIVE_READBACK_VERIFICATION_FAILED`.
* Comparison for all other archive fields (`Source_Record_Key`, `Fiscal_Year`, `Employee_Code`, `Event_Type`, `Reason`, `Previous_Status`, `Superseded_By_Revision`, `Source_Record_ID`, `Snapshot_Hash`, `Snapshot_JSON`, `Actor`) remains strictly exact and unmodified.

---

## 3. Targeted Test Results
Test suites executed:
* `tests/revision-archive-service.test.js` (80 tests)
* `tests/d3-archive-idempotency.test.js` (14 tests)
* `tests/revision-archive-kintone-repository.test.js` (9 tests)

**Total:** 103 tests passed, 0 failed.

New tests added in `tests/revision-archive-service.test.js`:
* `TC_READBACK_PREC_01`: Kintone minute-precision Archived_At passes when same minute (PASS)
* `TC_READBACK_PREC_02`: Expected timestamp with seconds/milliseconds normalizes correctly (PASS)
* `TC_READBACK_PREC_03`: Archived_At mismatch at minute level still fails closed (PASS)
* `TC_READBACK_PREC_04`: Idempotent replay: existing archive row is returned without creating duplicate (PASS)

---

## 4. Invariant Verification
* `KINTONE_WRITE_COUNT = 0` (Zero live Kintone API calls)
* `START_MID_YEAR_COUNT = 0` (No transition retried)
* `APP798_RECORD_WRITE_COUNT = 0`
* `APP798_SCHEMA_WRITE_COUNT = 0`
* `RECORD_ACL_WRITE_COUNT = 0`
* `FIELD_ACL_WRITE_COUNT = 0`
* `SOURCE_CHANGE_COUNT = 1` (`src/services/revision-archive-service.js`)
* `TEST_CHANGE_COUNT = 1` (`tests/revision-archive-service.test.js`)
* `NEXT_GATE_NOT_STARTED = YES`
