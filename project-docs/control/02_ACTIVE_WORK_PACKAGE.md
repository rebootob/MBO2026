# MBO2026 Active Work Package Contract

Updated: 2026-09-08 ICT

## Current contract state

- **ACTIVE_WORK_PACKAGE**: `D1-UAT-DEFECT-003-BUILD-R1`
- **TITLE**: `App794 Candidate Build & Artifact Verification`
- **TYPE**: `BUILD + ARTIFACT VERIFICATION`
- **OWNER_AUTHORIZATION**: `APPROVED`
- **STATUS**: `EXECUTED / AWAITING CONTROL PLANE REVIEW`
- **SOURCE_HEAD**: `2a286acf35dfef969cfa41b0f0bfd93a8d0f66b3`
- **ORIGINAL_OWNER_UAT**: `4/4 PASS`
- **DEFECT003_STATUS**: `SOURCE REVIEW PASS / FOCUSED TEST PASS / CANDIDATE BUILT / DEPLOYMENT PENDING / OWNER DEFECT-003 UAT PENDING`
- **CANDIDATE_JS_BLOB**: `204d34db9e2eab297409a6a3d5e7f29c649779d5`
- **CANDIDATE_CSS_BLOB**: `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`
- **D1_FINAL_CLOSURE**: `HOLD pending DEFECT-003 deployment + focused Owner UAT + Control Plane review`
- **D2_ENGINEERING**: `PASS / CLOSED / DURABLE`
- **D3**: `HOLD`
- **PRODUCTION_READY**: `NO`
- **KINTONE_WRITES_AUTHORIZED**: `NONE`
- **DEPLOYMENT_AUTHORIZED**: `NO`
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
- **Live Revision**: 69
- **Preview Revision**: 69
- **Live Desktop JS**: `mbo-employee-app.js` (blob `8958634b92b35f74b58a7a0b2abd09b8b5e93758`)
- **Live Desktop CSS**: `mbo-employee.css` (blob `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`)
- **Topology**: Desktop JS = 1, Desktop CSS = 1, Mobile JS = 0, Mobile CSS = 0
- **Total Record / Schema / ACL Writes**: 0

## Allowed operations

Only:
- Independent test execution and control plane documentation synchronization.
- Control Plane (ChatGPT) independent review.

Forbidden:
- AI code modifications to `src/`, `tests/`, `scripts/`, `dist/`.
- Building `dist/` or deploying App794.
- Kintone network write operations (record, schema, layout, ACL, process, customization).
- Automatic starting of D3.
- Self-certifying final D1 closure.

## Owner Runtime UAT Status

### Original Focused UAT: 4/4 PASS (Locked Truth)
The original 4 Owner Runtime UAT cases on App794 (Live revision 69) were executed and verified by Owner:
1. **Case 1 (Dedicated Account Auto-Bind)**: Dedicated user (Ms.Papatchaya) auto-binds to `0113` and opens own MBO -> **PASS**.
2. **Case 2 (Shared Principal Deny on Dedicated Employee)**: Shared principal (`tmh`) + `0113` -> DENIED with dedicated account guidance -> **PASS**.
3. **Case 3 (Shared Principal Allow on Shared Employee)**: Shared principal (`tmh`) + employee with `MBO_Kintone_User.value = []` -> ALLOWED -> **PASS**.
4. **Case 4 (Current-FY Navigation Guard)**: Existing current-FY MBO -> "Open Current MBO" and no Create New path -> **PASS**.

These 4 tests are complete and MUST NOT be re-requested or repeated.

### Future Focused Owner UAT for DEFECT-003 (Post-Deployment Only)
The following focused UAT applies **only** after a future separately authorized build and deployment of DEFECT-003 to App794:
1. **DEFECT003-UAT-1**: In MBO Login overlay, click "กลับหน้าหลัก Kintone / Back to Kintone Home" -> cleanly exits blocking overlay back to Kintone portal.
2. **DEFECT003-UAT-2**: In MBO Login overlay, click "ลืมรหัสผ่าน / Forgot Password" -> bilingual HR/Administrator support guidance appears without password reset or session change.
3. **DEFECT003-UAT-3**: Enter Employee 0113 under shared account -> `DEDICATED_ACCOUNT_REQUIRED` denial appears, and Back to Kintone Home button remains active and functional.

*These tests are NOT authorized to run now because DEFECT-003 has not yet been built or deployed.*

## Next permitted action

- ChatGPT Control Plane independent review of `D1-UAT-DEFECT-003-BUILD-R1`.
- If Control Plane accepts candidate build, next separate step is separately authorized App794 deploy -> DEFECT-003 focused Owner UAT only.
- D3 remains strictly on HOLD until DEFECT-003 deployment, focused UAT, and Control Plane review are complete.

## Permanent rules

- No code change without authorized FUNCTION_ID or DEFECT_ID.
- Exactly one active work package.
- Out-of-scope findings are logged, not auto-fixed.
- Closed functions reopen only for proven regression or explicit Owner change request.
- Security/privacy/data-integrity defects are material and block closure.
- Kintone writes/deployment require explicit Owner authority and exact bounded scope.
