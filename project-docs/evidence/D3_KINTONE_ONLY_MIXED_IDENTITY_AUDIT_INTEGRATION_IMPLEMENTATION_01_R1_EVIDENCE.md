# Evidence: D3 Kintone-Only Mixed Identity Audit Integration Implementation (Revision 1)

- **Package**: `D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-IMPLEMENTATION-01-R1`
- **System Boundary**: `KINTONE_ONLY` (Decision 010 Authority)
- **Target App**: App 798 (Archive Log)
- **Execution Mode**: Local Source Implementation Corrective + Local Tests Only
- **Date**: 2026-09-18
- **Base Commit**: `8ef3b6598175724f3c2a054fe8f98c100cae7974`

---

## 1. Executive Summary

This corrective package resolves the two blockers identified in the Independent Control Plane review for package `D3-KINTONE-ONLY-MIXED-IDENTITY-AUDIT-INTEGRATION-IMPLEMENTATION-01`:

1. **Remove active Decision-009 path from production code**:
   - In `src/main-mbo-app.js`, the conditional branch checking `window.MBO_D3_PREPARE_ENDPOINT` and delegating to `handleD3BrowserTrustedTransition` has been completely eliminated from `handleProcessProceedArchive` within the production event `app.record.detail.process.proceed`.
   - All D3 target stage completion process transitions now proceed unconditionally through the canonical internal Kintone path:
     `resolveArchiveIdentityContext -> executeProcessTransitionArchive -> RevisionArchiveService -> RevisionArchiveKintoneRepository -> App 798`.

2. **Unconditionally require mixed identity for all new D3 target events**:
   - `executeProcessTransitionArchive` and `resolveArchiveIdentityContext` enforce strict, fail-closed validation for all D3 target events. Missing identity context (`MISSING_IDENTITY_CONTEXT`), invalid `identityMode`, missing `actualOperatorEmployeeCode`, missing `kintoneLoginUserCode`, or case-sensitive user code mismatches immediately fail closed and block the process transition.
   - Fallbacks to Subject Employee (`App794.Employee_Code`), `actorCode`, shared accounts, requester, or blank values are strictly forbidden and eliminated.
   - **Historical Row Policy (TC28)**: Historical App 798 rows that lack the 5 new audit fields are supported for READ operations via normalization (`null` values returned per repository convention without fabricating identity or inferring identity from `Archived_By`). Creating new archive rows without the 5 audit fields is strictly forbidden.

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
   - Missing or invalid `identityMode`, missing operator code, missing login user code, or casing mismatch immediately blocks the stage transition and throws a fail-closed error code (`MISSING_IDENTITY_CONTEXT` or identity validation errors).

4. **Zero Live Kintone I/O & Sandbox Invariance**:
   - Kintone Reads: 0
   - Kintone Writes: 0
   - Schema Reads: 0
   - Schema Writes: 0
   - Process Writes: 0
   - Record Writes: 0
   - Deployment: 0
   - UAT: 0
   - Real OAuth: 0
   - External Backend: 0

---

## 3. Test Suite Verification

### Command
```bash
node --test tests/revision-archive-kintone-repository.test.js tests/revision-archive-service.test.js tests/d3-stage-archive-integration.test.js
```

### Result
```
✔ Repository: requires injected API adapter with getRecords and addRecord (1.5715ms)
✔ Repository: sets target App ID to 798 and rejects caller-selectable appId overrides (3.0701ms)
✔ Repository: findByArchiveKey queries exact Archive_Key with escaping and normalizes fields (2.1974ms)
✔ Repository: createArchiveRecord calls addRecord with target app 798 and returns created id (0.4791ms)
✔ Repository: readBackExactArchiveRecord succeeds when exactly 1 record matches (0.4262ms)
✔ Repository: readBackExactArchiveRecord fails closed with ARCHIVE_READBACK_NOT_FOUND when 0 matches (0.3892ms)
✔ Repository: readBackExactArchiveRecord fails closed with ARCHIVE_DUPLICATE_KEY_CORRUPTION when > 1 matches (0.3291ms)
✔ Repository Immutability: exposes no update or delete operations (0.2955ms)
✔ Repository: post-construction appId reassignment cannot redirect find or create away from App 798 (0.3227ms)
...
✔ 1. exact 05/action/06 creates OBJECTIVE archive (9.6782ms)
✔ 2. exact 10/action/11 creates MIDYEAR archive (1.1137ms)
✔ 3. exact 15/action/16 creates FINAL archive (0.9221ms)
...
✔ 23. SHARED identity mode successfully creates archive record with 5 mixed-identity fields (0.5789ms)
✔ 24. DEDICATED identity mode successfully creates archive record with 5 mixed-identity fields (0.4688ms)
✔ 25. Fail-closed: invalid or missing identityMode fails closed (0.2289ms)
✔ 26. Fail-closed: missing actual operator or login user fails closed (0.1677ms)
✔ 27. Fail-closed: case-sensitive mismatch between kintoneLoginUserCode and actorCode fails closed (0.1655ms)
✔ 28. Historical row policy: historical App798 row without the 5 new fields can be normalized and read without fabricating identity (0.1796ms)
✔ 29. Idempotent replay preserves identical Archive_Key and verifies exact 5 fields (0.5379ms)

ℹ tests 114
ℹ suites 0
ℹ pass 114
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 181.3006
```

All 114 test cases in the archive integration and repository suites pass cleanly.

---

## 4. Modified Files

1. `src/main-mbo-app.js`
   - Removed active Decision-009 external prepare transition branch from `handleProcessProceedArchive`.
   - Enforced fail-closed identity context check (`MISSING_IDENTITY_CONTEXT`) in `executeProcessTransitionArchive` for all D3 target transitions.
2. `tests/d3-stage-archive-integration.test.js`
   - Updated integration test transitions to provide explicit `defaultTestIdentityContext`.
   - Refactored TC28 to verify historical row READ compatibility and empty-field normalization via `readBackExactArchiveRecord` without creating new archive rows or fabricating identity.
3. `project-docs/evidence/D3_KINTONE_ONLY_MIXED_IDENTITY_AUDIT_INTEGRATION_IMPLEMENTATION_01_R1_EVIDENCE.md`
   - Added verification evidence report for R1.
