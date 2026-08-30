# D1 HYBRID IDENTITY EMPLOYEE-SELF RUNTIME ENTRY R1 EVIDENCE

## 1. Executive Summary

This deliverable integrates the accepted **D1 Hybrid Identity Core** (`c20e406`) into the App 794 browser runtime for **Employee-Self only**.

The runtime entry resolves native Kintone logged-in users into one of three principal modes:
1. `SHARED`: Approved shared principals (`t1`, `t2`, `s1`, `f1`, `f2`, `f3`, `e1`, `tmh`, `g_request`). Uses existing `mboLoginGate.requireLogin()` session flow. Displays MBO Change Password and Logout auth bar.
2. `DEDICATED`: All other non-shared users (e.g. `vassana`, `natta`, `uchida`). Bypasses `mboLoginGate.requireLogin()`. Executes targeted read-only App 53 GET lookup (`MBO_Kintone_User in ("<user>") and Number_0 = 1 limit 2`) and resolves authoritative business `Employee_Code` via `MboIdentityService.resolveDedicatedKintoneUserMapping()`. Hides shared auth bar controls.
3. `TECHNICAL_ADMIN`: (`admin-form`, `Administrator`, `ADMIN`). Fails closed on Employee-Self operations and blocks Employee-Self binding.

---

## 2. Seam Implementation Details

### A. Principal Mode Selection (`MboIdentityService.resolveKintonePrincipalMode`)
- Sourced from `src/services/mbo-identity-service.js`.
- Classifies native Kintone user code into `'SHARED'`, `'DEDICATED'`, or `'TECHNICAL_ADMIN'`.
- Rejects whitespace (`kintoneUserCode !== kintoneUserCode.trim()`).

### B. Targeted App 53 Read-Only Candidate Read (`EmployeeService.lookupDedicatedIdentityMappingCandidates`)
- Sourced from `src/services/employee-service.js`.
- Constructs exact escaped query: `MBO_Kintone_User in ("${escapedUserCode}") and Number_0 = 1 limit 2`.
- Reads App 53 with zero live write/POST/PUT/DELETE operations.

### C. Runtime Orchestration (`src/main-mbo-app.js`)
- Context structure: `{ mode: 'SHARED' | 'DEDICATED', employeeCode, kintoneUserCode }`.
- `SHARED` mode: requires `mboLoginGate.requireLogin()` and renders `renderAuthBar()`.
- `DEDICATED` mode: bypasses `mboLoginGate.requireLogin()`, resolves mapped `Employee_Code` from App 53, and hides auth bar controls.
- Dedicated own-MBO Create composition seam:
  - Resolves route profile via `RoutingService.resolveRoutingProfile()`.
  - Applies own-MBO self-appraiser elision for DEDICATED mode: `RoutingService.applyOwnMboSelfAppraiserElision(routeProfile, loginUserCode, true)`.
  - Resolves effective requester user array: `RoutingService.resolveEffectiveRequesterUser({ mode: 'DEDICATED', kintoneUserCode, routeRequesterUsers })`.
  - Snapshots effective `Requester_User` and effective approver route/topology onto form state record before save.

### D. Delete Protection Policy (`DeleteGuardPolicy`)
- Sourced from `src/security/delete-guard-policy.js`.
- Consumes `getEmployeeSelfContext()` provider.
- Blocks deletion with bilingual error whenever a valid Employee-Self context exists (`DEDICATED` or `SHARED`).
- Abstains (allows event through without blocking) when no Employee-Self context exists.

---

## 3. Verification Results

### Test Execution Proof
Command: `npm test`
Result: **1023 / 1023 PASS (100%)**

### Specific Test Coverage
1. `tests/d1-hybrid-identity-core-source.test.js`:
   - `MboIdentityService.resolveKintonePrincipalMode` maps all 9 approved shared principals to `SHARED`.
   - Maps non-shared users to `DEDICATED`.
   - Maps `admin-form`/`Administrator`/`ADMIN` to `TECHNICAL_ADMIN`.
   - Rejects whitespace in user codes.
2. `tests/employee-lookup-service.test.js`:
   - `lookupDedicatedIdentityMappingCandidates` executes targeted App 53 GET query.
   - Escapes quotes/backslashes.
   - Rejects whitespace before API.
   - Fails closed on API errors.
3. `tests/employee-main-mbo-app-integration.test.js`:
   - SHARED mode regression verified.
   - DEDICATED mode auto-bind verified without calling `mboLoginGate.requireLogin()`.
   - DeleteGuardPolicy blocks deletion when Employee-Self context is active.
4. `tests/classic-bundle.test.js`:
   - Bundle build and dependency graph inclusion verified.

---

## 4. Compliance & Safety Checklist

- [x] Live Kintone write operations: **0 (GET only)**
- [x] App 53 schema / record / import / bulk write: **0**
- [x] Live ACL write: **0**
- [x] Live Group write: **0**
- [x] Live Deploy: **0**
- [x] Natta `emp_text` mutation / guessing: **0**
- [x] Dedicated Kintone user creation (`MBO_Kintone_User`): **0**
- [x] My Approval Tasks in this WP: **0 (HARD STOP preserved)**
- [x] `git diff --check`: **PASS (0 whitespace errors)**
- [x] Full test suite: **1023 / 1023 PASS**
