# MBO2026 Active Work Package Contract

Updated: 2026-09-08 ICT

## Current contract state

- **ACTIVE_WORK_PACKAGE**: `D3-PRE1-R3`
- **TITLE**: `App798 Schema Statement Exactness Final Corrective`
- **TYPE**: `DOCS-ONLY / EVIDENCE PRECISION CORRECTIVE`
- **OWNER_AUTHORIZATION**: `APPROVED`
- **STATUS**: `EXECUTED / AWAITING CONTROL PLANE REVIEW`
- **PARENT_D3_PRE1_R2**: `PARTIAL PASS / R3 CORRECTIVE UNDER REVIEW`
- **PARENT_D3_PRE1_R1**: `PARTIAL PASS / PROVENANCE CORRECTIVE REQUIRED`
- **PARENT_D3_PRE1**: `PARTIAL PASS / CORRECTIVE UNDER REVIEW`
- **CORRECTIVE_DOCUMENT**: `project-docs/D3_PRE1_R3_APP798_SCHEMA_STATEMENT_EXACTNESS_FINAL_CORRECTIVE.md`
- **PREVIOUS_CORRECTIVE_DOCUMENTS**: `project-docs/D3_PRE1_R2_APP798_PROVENANCE_SCHEMA_PRECISION_CORRECTIVE.md`, `project-docs/D3_PRE1_R1_WORKFLOW_AUTHORITY_REOPEN_EVIDENCE_ACCURACY_CORRECTIVE.md`
- **REVISED_REVIEW_DOCUMENT**: `project-docs/D3_PRE1_WORKFLOW_REOPEN_SCOPE_READINESS_GAP_REVIEW.md`
- **D3_READINESS**: `OWNER_DECISION_REQUIRED`
- **LAST_COMPLETED_WORK_PACKAGE**: `D1-FINAL-CLOSURE-SYNC`
- **D1_FINAL_CLOSURE**: `PASS / CLOSED`
- **D1_BASE_ARCHITECTURE**: `PASS / CLOSED / DURABLE`
- **D1_UAT_CORRECTIVE_CHAIN**: `PASS / CLOSED`
- **DEFECT001_STATUS**: `PASS / CLOSED`
- **DEFECT002_STATUS**: `PASS / CLOSED`
- **DEFECT003_STATUS**: `PASS / CLOSED`
- **ORIGINAL_OWNER_UAT**: `4/4 PASS`
- **DEFECT003_OWNER_UAT**: `3/3 PASS`
- **APP794_LIVE_REVISION**: `70`
- **LIVE_JS_BLOB**: `204d34db9e2eab297409a6a3d5e7f29c649779d5`
- **LIVE_CSS_BLOB**: `0532c1c3ba3d72f9157c4ab0b1e6033ffae1eb61`
- **D2_ENGINEERING**: `PASS / CLOSED / DURABLE`
- **D2_OWNER_UAT**: `IN PROGRESS / PAUSED`
- **D3**: `HOLD / NOT AUTHORIZED`
- **D3_IMPLEMENTATION_AUTHORIZED**: `NO`
- **PRODUCTION_READY**: `NO`
- **DEPLOYMENT_AUTHORIZED**: `NO`
- **KINTONE_WRITES_AUTHORIZED**: `NONE`

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

3. **`D1-UAT-DEFECT-003-CLOSE-R1`**
   - Status: `PASS / CLOSED`
   - Execution Commit: `a66c351013534b739426f990bead47eec37c773e`
   - Evidence: `project-docs/D1_UAT_DEFECT_003_OWNER_UAT_CLOSE_R1_EVIDENCE.md`
   - Owner runtime UAT: 3/3 PASS (Back to Home, Forgot Password, Dedicated Deny).

4. **`D1-FINAL-CLOSURE-SYNC`**
   - Status: `PASS / CLOSED`
   - Evidence: `project-docs/D1_FINAL_CLOSURE_CONTROL_PLANE_DECISION.md`
   - Independent Control Plane (ChatGPT) verdict recorded: D1 = PASS / CLOSED.

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
- Reviewing repository documentation and evidence.

Forbidden:
- AI code modifications to `src/`, `tests/`, `scripts/`, `dist/`.
- Additional Kintone deployments or write operations.
- Starting D3 without explicit Owner authorization.
- Self-certifying independent Control Plane review.

## Owner Runtime UAT Status

### Original Focused UAT: 4/4 PASS (Locked Truth)
The original 4 Owner Runtime UAT cases on App794 were executed and verified by Owner:
1. **Case 1 (Dedicated Account Auto-Bind)**: Dedicated user (Ms.Papatchaya) auto-binds to `0113` and opens own MBO -> **PASS**.
2. **Case 2 (Shared Principal Deny on Dedicated Employee)**: Shared principal (`tmh`) + `0113` -> DENIED with dedicated account guidance -> **PASS**.
3. **Case 3 (Shared Principal Allow on Shared Employee)**: Shared principal (`tmh`) + employee with `MBO_Kintone_User.value = []` -> ALLOWED -> **PASS**.
4. **Case 4 (Current-FY Navigation Guard)**: Existing current-FY MBO -> "Open Current MBO" and no Create New path -> **PASS**.

These 4 tests are complete and MUST NOT be re-requested or repeated.

### Focused Owner UAT for DEFECT-003: 3/3 PASS (Owner Verified)
The focused Owner UAT checks on App 794 Live (Revision 70) were personally executed by Owner:
1. **DEFECT003-UAT-1 (Back to Kintone Home)**: PASS (Owner confirmed clicking Back Home cleanly exits blocking overlay to Kintone home).
2. **DEFECT003-UAT-2 (Forgot Password Guidance)**: PASS (Owner confirmed bilingual HR/Admin support guidance appears, no reset triggered).
3. **DEFECT003-UAT-3 (Dedicated Account Deny & Back Home Usable)**: PASS (Owner confirmed dedicated denial remains active and Back Home button functions cleanly).

## Next permitted action

- None currently authorized.
- Stage D1 is PASS / CLOSED / DURABLE.
- D3 remains strictly on HOLD: transition to D3 requires separate explicit Owner authorization and bounded D3 work package. D3 is NOT authorized.

## Permanent rules

- No code change without authorized FUNCTION_ID or DEFECT_ID.
- Exactly one active work package.
- Out-of-scope findings are logged, not auto-fixed.
- Closed functions reopen only for proven regression or explicit Owner change request.
- Security/privacy/data-integrity defects are material and block closure.
- Kintone writes/deployment require explicit Owner authority and exact bounded scope.
