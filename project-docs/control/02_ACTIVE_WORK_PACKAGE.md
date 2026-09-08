# MBO2026 Active Work Package Contract

Updated: 2026-09-08 ICT

## Current contract state

# MBO2026 Active Work Package Contract

Updated: 2026-09-08 ICT

## Current contract state

- **ACTIVE_WORK_PACKAGE**: `D1-UAT-OWNER-RUNTIME-UAT-READINESS`
- **OWNER_AUTHORIZATION**: `Owner Runtime UAT Readiness (Post Deploy & Migration Closure)`
- **STATUS**: `READY FOR OWNER RUNTIME UAT`
- **TARGET**: `App794 Sandbox Runtime Testing`
- **MODE**: `READ-ONLY VERIFICATION / ZERO AI WRITES`
- **ALLOWED_KINTONE_WRITES**: `NONE`
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
- Owner runtime verification in Kintone sandbox browser.
- Control plane documentation synchronization.

Forbidden:
- AI code modifications to `src/`, `tests/`, `scripts/`, `dist/`.
- Kintone network write operations (record, schema, layout, ACL, process, customization).
- Automatic starting of D3.
- Self-certifying Owner UAT PASS.

## Owner runtime UAT cases (Active Operational Milestone)

1. **Case 1 (Dedicated Account Auto-Bind)**:
   - Dedicated user (Ms.Papatchaya) logs in natively to Kintone -> navigates to App 794 -> auto-binds to `0113` -> opens own MBO.
2. **Case 2 (Shared Principal Deny on Dedicated Employee)**:
   - Shared principal (`tmh`) attempts login with `0113` + App 801 password -> DENIED with dedicated account required guidance.
3. **Case 3 (Shared Principal Allow on Shared Employee)**:
   - Shared principal (`tmh`) attempts login with an employee having valid `MBO_Kintone_User.value = []` + valid App 801 password -> ALLOWED.
4. **Case 4 (Current-FY Navigation Guard)**:
   - Employee with an existing current-FY MBO -> Employee-Self shows "Open Current MBO" and no Create New path.

## Next state

- Owner executes the 4 runtime test cases above.
- Owner / ChatGPT Control Plane independently reviews runtime results.
- D3 remains HOLD until Owner UAT is closed and Control Plane formally authorizes transition.

## Permanent rules

- No code change without authorized FUNCTION_ID or DEFECT_ID.
- Exactly one active work package.
- Out-of-scope findings are logged, not auto-fixed.
- Closed functions reopen only for proven regression or explicit Owner change request.
- Security/privacy/data-integrity defects are material and block closure.
- Kintone writes/deployment require explicit Owner authority and exact bounded scope.
