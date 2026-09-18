# Evidence: D3 Kintone-Only Mixed Identity Audit Integration Implementation

- **Package**: `D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-IMPLEMENTATION-01`
- **System Boundary**: `KINTONE_ONLY` (Decision 010 Authority)
- **Target App**: App 798 (Archive Log)
- **Execution Mode**: Local Source Implementation + Local Tests Only
- **Date**: 2026-09-18

---

## 1. Executive Summary

In accordance with Decision 010 (`MBO2026_SYSTEM_BOUNDARY = KINTONE_ONLY`), this package integrates dual identity tracking (SHARED / DEDICATED) into the MBO2026 D3 stage completion process transition directly within Kintone JavaScript customization, bypassing the external Decision 009 endpoint (`/api/mbo/d3/transaction/prepare-transition`).

The 5 new fields in App 798 are:
1. `Identity_Mode`: `SHARED` | `DEDICATED`
2. `Actual_Operator_Employee_Code`: Valid authenticated employee code
3. `Kintone_Login_User_Code`: Exact case-sensitive Kintone login principal code
4. `Action_Name`: Process transition action name
5. `To_Status`: Target status name after transition

---

## 2. Invariants & Security Guarantees

1. **Dual Identity Separation**:
   - `Subject Employee` (`App794.Employee_Code`): The employee whose MBO evaluation is being processed.
   - `Actual Operator` (`Actual_Operator_Employee_Code`): The physical human operating the system (from MBO Login Lock context).
   - `Kintone Login User` (`Kintone_Login_User_Code`): The active Kintone session account (`kintone.getLoginUser().code`).
   - `SUBJECT_EMPLOYEE_IS_OPERATOR = NO`: The system strictly prohibits collapsing the Subject Employee into the Operator.

2. **Exact Match Case-Sensitive Validation**:
   - `currentEmployeeSelfContext.kintoneUserCode === kintone.getLoginUser().code` (exact casing preserved, no `.toLowerCase()`).

3. **Fail-Closed Guarantees**:
   - Any missing or invalid `identityMode`, missing operator code, missing login user code, or casing mismatch immediately blocks the stage transition and throws a fail-closed error.

4. **Zero Live Kintone I/O**:
   - Reads: 0
   - Writes: 0
   - Deployments: 0
   - All assertions validated through mock adapters and local Node test runner.

---

## 3. Test Suite Verification

### Command
```bash
node --test tests/revision-archive-service.test.js tests/revision-archive-kintone-repository.test.js tests/d3-stage-archive-integration.test.js
```

### Result
```
ℹ tests 114
ℹ suites 0
ℹ pass 114
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 194.8645
```

All 114 tests passed, including:
- TC01–TC22: Baseline D3 Stage Archive Integration
- TC23: SHARED identity mode verification
- TC24: DEDICATED identity mode verification
- TC25: Fail-closed on invalid or missing identityMode
- TC26: Fail-closed on missing actual operator or login user
- TC27: Fail-closed on case-sensitive mismatch between login user and actor
- TC28: Backward compatibility: null 5 fields on historical records do not cause failure on read-back
- TC29: Idempotent replay preserves identical Archive_Key and verifies exact 5 fields

---

## 4. Modified Files

1. `src/services/revision-archive-kintone-repository.js`
   - Added 5 mixed-identity fields to `_normalizeRecord(raw)` with null fallback.
   - Included 5 fields in `createArchiveRecord` record payload.
2. `src/services/revision-archive-service.js`
   - Added fail-closed validation in `_archiveEvent`.
   - Populated 5 fields into App 798 payload.
   - Updated read-back comparison to assert exact equality on the 5 fields.
   - Enhanced evidence return with audit metadata.
3. `src/main-mbo-app.js`
   - Added `resolveArchiveIdentityContext(options)`.
   - Wired `executeProcessTransitionArchive` into `app.record.detail.process.proceed` directly for D3 transitions, bypassing external API.
4. `tests/d3-stage-archive-integration.test.js`
   - Added integration test cases TC23–TC29 verifying all aspects of the 5-field schema and fail-closed behaviors.
