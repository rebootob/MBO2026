# D1 HYBRID IDENTITY EMPLOYEE-SELF RUNTIME ENTRY R1 CORRECTIVE R1 EVIDENCE

## Execution Summary

- **Task:** `D1 HYBRID IDENTITY EMPLOYEE-SELF RUNTIME ENTRY R1 CORRECTIVE R1`
- **Branch:** `ai/antigravity-wp002c`
- **Scope:** Corrective R1 addressing Findings R1-A to R1-F strictly without touching shared auth source, out-of-scope files, ACL/Group APIs, or App 53 production live endpoints.

---

## Technical Audit & Verification Findings (R1-A to R1-F)

### 1. Finding R1-A — Unauthorized SHARED Expansion Eliminated
- **Source File:** [`src/services/mbo-identity-service.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/services/mbo-identity-service.js#L54-L78)
- **Fix:** Removed all regex, prefix, and numeric heuristics (`/^\d+$/`, `req*`, `test*`, `user*`).
- **Rule:** `resolveKintonePrincipalMode` returns `'SHARED'` **ONLY** for exact membership in `APPROVED_SHARED_PRINCIPALS` (`t1, t2, s1, f1, f2, f3, e1, tmh, g_request`). Case-sensitive exact match (`F1` is not `f1` and resolves to `DEDICATED`).
- **Verification:** Unit tests in [`tests/d1-hybrid-identity-core-source.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/d1-hybrid-identity-core-source.test.js) pass 32/32.

### 2. Finding R1-B — DEDICATED Mapping Failure Fail-Closed (0 Login Gate Calls)
- **Source File:** [`src/main-mbo-app.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/main-mbo-app.js#L119-L147)
- **Fix:** Completely removed the fallback call to `mboLoginGate.requireLogin` under `DEDICATED` mode in `resolveRuntimeEmployeeSelfContext`.
- **Rule:** Missing, ambiguous, or invalid dedicated mapping immediately returns `{ status: 'DEDICATED_MAPPING_FAILED', reason: ... }`. Call count to `mboLoginGate.requireLogin` under `DEDICATED` mode is strictly **0**.
- **Verification:** Integration test 4g-1 in [`tests/employee-main-mbo-app-integration.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/employee-main-mbo-app-integration.test.js) verifies 0 `requireLogin` calls and null context.

### 3. Finding R1-C — Registered Delete Guard Wired to Runtime Self Context
- **Source File:** [`src/main-mbo-app.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/main-mbo-app.js#L780-L792)
- **Fix:** Updated the registered deletion event listener (`app.record.detail.delete.submit`, `app.record.index.delete.submit`) to instantiate `new DeleteGuardPolicy({ mboLoginGate, getEmployeeSelfContext: () => currentEmployeeSelfContext })`.
- **Rule:** Blocks deletion attempts when `currentEmployeeSelfContext` is present (returns `false`), and abstains (returns `undefined`) when context is `null`.
- **Verification:** Integration test 4g-2 in [`tests/employee-main-mbo-app-integration.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/employee-main-mbo-app-integration.test.js) verifies block for `DEDICATED` & `SHARED` context and abstain for `null`.

### 4. Finding R1-D — Exact Pre-WP Restoration of HR Reset UI Test
- **Target File:** [`tests/hr-control-center-reset-ui.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/hr-control-center-reset-ui.test.js)
- **Fix:** Restored file using git object `eb2a3cdfb6bee6a6d67f15cc3210f139a1635756`.
- **Verification:** `git hash-object tests/hr-control-center-reset-ui.test.js` returns `eb2a3cdfb6bee6a6d67f15cc3210f139a1635756` (100% exact pre-WP identity).

### 5. Finding R1-E — Automated Integration Proofs & Classic Bundle Leak Guard
- **Source Files:** [`tests/employee-main-mbo-app-integration.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/employee-main-mbo-app-integration.test.js), [`tests/classic-bundle.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/classic-bundle.test.js)
- **Fix:** Added comprehensive end-to-end integration tests proving DEDICATED missing mapping fail-closed, delete guard policy integration, and bundling verification.
- **Rule:** `classic-bundle.test.js` explicitly verifies `src/services/mbo-identity-service.js` is bundled without ES module syntax (`import`/`export`) or leaks from `src/server/**` or `services/mbo-auth-bridge/**`.

### 6. Finding R1-F — Create Seam Local Context Resolution (No Silent SHARED Default)
- **Source File:** [`src/main-mbo-app.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/main-mbo-app.js#L490-L505,L675-L690)
- **Fix:** Added strict context validation to `setupRecordUiWithAuth` (throws `INVALID_EMPLOYEE_SELF_CONTEXT` if missing or invalid). Updated `onLookupEmployee` inside `setupRecordUiWithAuth` to use resolved local `context.mode` and `context.kintoneUserCode` directly for route resolution, self-elision, and requester snapshotting.

---

## File Modification Inventory

1. [`src/services/mbo-identity-service.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/services/mbo-identity-service.js) — Finding R1-A exact principal classification without heuristics.
2. [`src/main-mbo-app.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/src/main-mbo-app.js) — Finding R1-B DEDICATED missing mapping fail-closed; Finding R1-C DeleteGuardPolicy wiring; Finding R1-F resolved local context propagation.
3. [`dist/mbo-employee-app.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/dist/mbo-employee-app.js) & [`dist/mbo-employee.css`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/dist/mbo-employee.css) — Generated browser bundle via `npm run ui:build`.
4. [`tests/d1-hybrid-identity-core-source.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/d1-hybrid-identity-core-source.test.js) — Finding R1-A 9-code SHARED set and DEDICATED unit tests (32/32 PASS).
5. [`tests/classic-bundle.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/classic-bundle.test.js) — Finding R1-E classic bundle module inclusions & server leak checks (7/7 PASS).
6. [`tests/employee-main-mbo-app-integration.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/employee-main-mbo-app-integration.test.js) — Findings R1-B, R1-C, R1-E, R1-F integration tests (PASS).
7. [`tests/objective-save-validation.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/objective-save-validation.test.js), [`tests/timeline-truthfulness-and-attachment.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/timeline-truthfulness-and-attachment.test.js), [`tests/create-handler-form-state.test.js`](file:///c:/Users/allda/Desktop/Dev/git/MBO2026/tests/create-handler-form-state.test.js) — Aligned mock logged-in Kintone user to approved shared principal `s1`/`f1`.

---

## Verification Commands & Output

- `node --test tests/d1-hybrid-identity-core-source.test.js`: **PASS (32/32)**
- `node --test tests/employee-lookup-service.test.js`: **PASS (22/22)**
- `node --test tests/employee-main-mbo-app-integration.test.js`: **PASS (1/1)**
- `node --test tests/classic-bundle.test.js`: **PASS (7/7)**
- `node --test tests/mbo-kintone-login-gate.test.js`: **PASS (18/18)**
- `npm run ui:build`: **PASS** (Generated `dist/mbo-employee-app.js` & `dist/mbo-employee.css`)
- `git hash-object tests/hr-control-center-reset-ui.test.js`: `eb2a3cdfb6bee6a6d67f15cc3210f139a1635756` (100% pre-WP exact match)
