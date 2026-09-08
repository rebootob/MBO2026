# MBO2026 — Evidence: D1-UAT-DEFECT-003-R1 Test & Control Verification

- **WORK_PACKAGE**: `D1-UAT-DEFECT-003-R1`
- **TITLE**: `TEST + CONTROL-DOC Corrective`
- **OWNER_AUTHORIZATION**: `APPROVED`
- **SOURCE_HEAD**: `e5ec45f98eaf28cca0dd959ce24bfe3e4fc055c9`
- **TEST_DATE**: `2026-09-08`
- **TEST_RUNNER**: `Node.js built-in test runner (node:test)`

---

## 1. Summary of Execution Metrics

| Metric | Value |
|---|---|
| **TOTAL_TESTS_EXECUTED** | **113** |
| **TEST_PASS** | **113** |
| **TEST_FAIL** | **0** |
| **TEST_SKIP** | **0** |
| **EXIT_CODE** | **0** |
| **SOURCE_FILES_CHANGED** | **0** |
| **TEST_FILES_CHANGED** | **0** |
| **KINTONE_WRITES** | **0** |
| **DEPLOYMENT_PERFORMED** | **NO** |
| **ORIGINAL_OWNER_UAT** | **4/4 PASS** (locked truth) |
| **DEFECT003_DEPLOYMENT** | **PENDING** |
| **DEFECT003_OWNER_UAT** | **PENDING** |
| **D3_STATUS** | **HOLD** |

---

## 2. Exact Test Commands and Results

### Command 1: MBO Kintone Login Gate & Defect-003 Suite

```bash
node --test tests/mbo-kintone-login-gate.test.js
```

**Console Output Summary**:
- Suites: 5
- Tests: 28
- Pass: 28
- Fail: 0
- Cancelled: 0
- Skipped: 0
- Exit Code: 0

**Verified Behaviors**:
1. `D1 MboKintoneLoginGate — static source checks`: 4 pass (no `localStorage`, `sessionStorage`, `document.cookie`, or Node `crypto`).
2. `D1 MboKintoneLoginGate — state management`: 7 pass (initial null code, page-memory only principal, logout clearing, force change gating).
3. `D1 MboKintoneLoginGate — requireLogin with mock adapter`: 9 pass (authenticated resolution, session restoration, dedicated-account denial enforcement).
4. `D1 EmployeePartAUI — authenticated Employee_Code lock`: 1 pass (lookup rejects mismatched Employee_Code).
5. `D1-UAT-DEFECT-003 — Login Escape & Recovery UX`: 7 pass
   - Login overlay contains Back to Kintone Home action (`กลับหน้าหลัก Kintone / Back to Kintone Home`).
   - Back Home action is `type="button"` and does not submit the login form.
   - Back Home invokes only the injected navigation callback without calling `adapter.login` or creating principal.
   - Forgot Password action exists, is `type="button"`, and clicking reveals bilingual support guidance (HR/Administrator).
   - Forgot Password action does NOT call `adapter.login`, `changePassword`, `forceChangePassword`, or issue session.
   - `DEDICATED_ACCOUNT_REQUIRED` state still denies Employee 0113 and overlay contains Back Home escape action.
   - Force Password Change card also contains Back Home escape action.

---

### Command 2: D1 Regression Suite

```bash
node --test \
  tests/d1-hybrid-identity-core-source.test.js \
  tests/employee-lookup-service.test.js \
  tests/employee-main-mbo-app-integration.test.js \
  tests/employee-self-index-ui.test.js
```

**Console Output Summary**:
- Suites: 0
- Tests: 85
- Pass: 85
- Fail: 0
- Cancelled: 0
- Skipped: 0
- Exit Code: 0

**Verified Behaviors**:
- Hybrid Identity core source & fail-closed contracts (16 tests pass).
- Employee lookup service validation (pass).
- Main MBO app record show & event handler integration (pass).
- HR Admin runtime mode & fail-closed checks (pass).
- Employee-Self index UI, navigation, and delete guard (pass).
- Existing detail/edit Back to My MBO bars (pass).
- Comments thread pagination & refresh zero-write guards (pass).
- DEFECT-002 current-FY navigation logic: exactly 1 MBO -> Open Current MBO (create suppressed); 0 MBO -> Create New MBO; >1 MBO -> integrity warning (create suppressed).

---

## 3. Scope and File Changes

### Changed Files
- `project-docs/D1_UAT_DEFECT_003_R1_TEST_CONTROL_EVIDENCE.md` (NEW)
- `project-docs/AI_ACTIVE_TASK.md` (SYNC)
- `project-docs/AI_CONTROL_CENTER.md` (SYNC)
- `project-docs/CHAT_HANDOFF.md` (SYNC)
- `project-docs/control/02_ACTIVE_WORK_PACKAGE.md` (SYNC)

*(Note: DOCFIX1 corrected the Changed Files provenance list above to include `AI_CONTROL_CENTER.md`, which was part of the original 5-file commit `ff10913` but omitted in the initial evidence document).*

### Invariants Maintained
- `src/**` changes: **0**
- `tests/**` changes: **0**
- `scripts/**` changes: **0**
- `dist/**` changes: **0**
- `config/**` changes: **0**
- `services/**` changes: **0**
- `package.json` / `package-lock.json` changes: **0**
- Kintone network writes: **0**
- App 794 builds/deployments performed: **NO**

---

## 4. Locked Owner UAT Truth & Future Verification Plan

### Locked Owner Runtime UAT (4/4 PASS)
The original focused Owner Runtime UAT cases on App794 Live revision 69 remain 4/4 PASS:
1. **UAT-1**: Dedicated personal Kintone user (Ms.Papatchaya) auto-binds Employee 0113 and opens own MBO = **PASS**.
2. **UAT-2**: Shared account `tmh` + Employee 0113 denied with dedicated-account guidance = **PASS**.
3. **UAT-3**: Shared account `tmh` + shared-only employee (`MBO_Kintone_User.value = []`) allowed via App801 = **PASS**.
4. **UAT-4**: Single current-FY record shows "Open Current MBO" and suppresses "Create New MBO" = **PASS**.

These 4 tests are complete and must not be re-requested as pending.

### Future DEFECT-003 Owner UAT (Post-Deployment Only)
The following focused UAT cases apply **only** after a future separately authorized build and deployment of DEFECT-003 to App794:
1. **DEFECT003-UAT-1**: In MBO Login overlay, click "กลับหน้าหลัก Kintone / Back to Kintone Home" -> cleanly exits blocking overlay back to Kintone portal.
2. **DEFECT003-UAT-2**: In MBO Login overlay, click "ลืมรหัสผ่าน / Forgot Password" -> bilingual HR/Administrator support text appears without password reset or session change.
3. **DEFECT003-UAT-3**: Enter Employee 0113 under shared account -> `DEDICATED_ACCOUNT_REQUIRED` denial appears, and Back to Kintone Home button remains active and functional.

*Note: These tests are NOT authorized to run now because DEFECT-003 has not yet been built or deployed.*

---

## 5. Next Permitted Action

- **Next Action**: Awaiting independent Control Plane (ChatGPT) review.
- **D3 Implementation**: Strictly on **HOLD**.
- **Deployment**: Not authorized in this work package.
