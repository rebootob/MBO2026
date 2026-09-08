# MBO2026 Active Work Package Contract

Updated: 2026-09-08 ICT

## Current contract state

- **ACTIVE_WORK_PACKAGE**: `D1-UAT-DEFECT-003-SANDBOX-DEPLOY-R1`
- **TITLE**: `App794 Sandbox Deployment — DEFECT-003`
- **TYPE**: `APP794 CUSTOMIZATION DEPLOY`
- **OWNER_AUTHORIZATION**: `APPROVED`
- **AUTHORIZATION_ID**: `D1-UAT-DEFECT-003-SANDBOX-DEPLOY-20260908-01`
- **STATUS**: `EXECUTED / AWAITING CONTROL PLANE REVIEW`
- **EXECUTION_SOURCE_HEAD**: `2a02ab2583f53c3906674713c2e09e1757449ba8`
- **ORIGINAL_OWNER_UAT**: `4/4 PASS`
- **DEFECT003_STATUS**: `SOURCE REVIEW PASS / FOCUSED TEST PASS / CANDIDATE BUILD PASS / SANDBOX DEPLOYED / OWNER DEFECT-003 UAT PENDING`
- **APP794_PRE_DEPLOY_REVISION**: `69`
- **APP794_POST_DEPLOY_REVISION**: `70`
- **LIVE_JS_BLOB**: `204d34db9e2eab297409a6a3d5e7f29c649779d5`
- **LIVE_CSS_BLOB**: `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`
- **D1_FINAL_CLOSURE**: `HOLD pending DEFECT-003 Owner UAT + Control Plane review`
- **D2_ENGINEERING**: `PASS / CLOSED / DURABLE`
- **D3**: `HOLD`
- **PRODUCTION_READY**: `NO`
- **DEPLOYMENT_AUTHORIZATION**: `CONSUMED / CLOSED`
- **KINTONE_WRITES_AUTHORIZED**: `NONE AFTER EXECUTION`
- **D3_IMPLEMENTATION_AUTHORIZED**: `NO`

## Completed predecessor work packages

1. **`D1-UAT-DEFECT-001-002-SANDBOX-DEPLOY-R2`**
   - Status: `PASS / CLOSED`
   - Execution Commit: `cd74b01e6650bb04b5fbdba6c365dd9a1bf87236`
   - Evidence: `project-docs/D1_UAT_DEFECT_001_002_SANDBOX_DEPLOY_R2_EVIDENCE.md`
   - App794 Live revision advanced from 67 to 68.
   - Candidate JS (`8958634b...`) and CSS (`0532c1c3...`) verified byte-identical to committed artifacts.

2. **`D1-UAT-APP794-CSS-FILENAME-MIGRATION-R1`**
   - Status: `PASS / CLOSED`
   - Execution Commit: `38f5ba111d6ebbfaa09a3415819a92f5a48a1f4d`
   - Evidence: `project-docs/D1_UAT_APP794_CSS_FILENAME_MIGRATION_R1_EVIDENCE.md`
   - App794 Live revision advanced from 68 to 69.
   - Live CSS filename migrated from historical `"mbo-employee .css"` to canonical `"mbo-employee.css"`.
   - Exact CSS bytes preserved (blob `0532c1c3...`).
   - Normal deployment tool preflight restored to PASS (`validatePreflight: true`).

## Current App794 Live state

- **App ID**: 794
- **Live Revision**: 70
- **Preview Revision**: 70
- **Live Desktop JS**: `mbo-employee-app.js` (blob `204d34db9e2eab297409a6a3d5e7f29c649779d5`)
- **Live Desktop CSS**: `mbo-employee.css` (blob `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`)
- **Topology**: Desktop JS = 1, Desktop CSS = 1, Mobile JS = 0, Mobile CSS = 0
- **Total Record / Schema / ACL Writes**: 0

## Allowed operations

Only:
- Control plane documentation synchronization.
- Owner runtime verification in Kintone sandbox browser (DEFECT-003 focused UAT).
- Control Plane (ChatGPT) independent review.

Forbidden:
- AI code modifications to `src/`, `tests/`, `scripts/`, `dist/`.
- Additional Kintone deployments or write operations.
- Automatic starting of D3.
- Self-certifying final D1 closure or DEFECT-003 Owner UAT PASS.

## Owner Runtime UAT Status

### Original Focused UAT: 4/4 PASS (Locked Truth)
The original 4 Owner Runtime UAT cases on App794 were executed and verified by Owner:
1. **Case 1 (Dedicated Account Auto-Bind)**: Dedicated user (Ms.Papatchaya) auto-binds to `0113` and opens own MBO -> **PASS**.
2. **Case 2 (Shared Principal Deny on Dedicated Employee)**: Shared principal (`tmh`) + `0113` -> DENIED with dedicated account guidance -> **PASS**.
3. **Case 3 (Shared Principal Allow on Shared Employee)**: Shared principal (`tmh`) + employee with `MBO_Kintone_User.value = []` -> ALLOWED -> **PASS**.
4. **Case 4 (Current-FY Navigation Guard)**: Existing current-FY MBO -> "Open Current MBO" and no Create New path -> **PASS**.

These 4 tests are complete and MUST NOT be re-requested or repeated.

### Focused Owner UAT for DEFECT-003 (Ready for Owner Execution)
With App794 Live at revision 70, the following focused UAT checks are ready for Owner testing:
1. **DEFECT003-UAT-1**: In MBO Login overlay, click "กลับหน้าหลัก Kintone / Back to Kintone Home" -> cleanly exits blocking overlay back to Kintone portal.
2. **DEFECT003-UAT-2**: In MBO Login overlay, click "ลืมรหัสผ่าน / Forgot Password" -> bilingual HR/Administrator support guidance appears without password reset or session change.
3. **DEFECT003-UAT-3**: Enter Employee 0113 under shared account -> `DEDICATED_ACCOUNT_REQUIRED` denial appears, and Back to Kintone Home button remains active and functional.

## Next permitted action

- Owner executes the 3 DEFECT-003 runtime UAT checks above.
- ChatGPT Control Plane independent review of `D1-UAT-DEFECT-003-SANDBOX-DEPLOY-R1` evidence and Owner UAT results.
- D3 remains strictly on HOLD until DEFECT-003 UAT and Control Plane review are complete.

## Permanent rules

- No code change without authorized FUNCTION_ID or DEFECT_ID.
- Exactly one active work package.
- Out-of-scope findings are logged, not auto-fixed.
- Closed functions reopen only for proven regression or explicit Owner change request.
- Security/privacy/data-integrity defects are material and block closure.
- Kintone writes/deployment require explicit Owner authority and exact bounded scope.
